/**
 * Image search via Unsplash API.
 * - Free tier: 50 requests/hour, no credit card required
 * - Register at https://unsplash.com/developers to get UNSPLASH_ACCESS_KEY
 * - Falls back gracefully when API key missing or search fails
 */

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY || "";
const UNSPLASH_URL = "https://api.unsplash.com/search/photos";

interface UnsplashPhoto {
  urls: { regular: string; small: string };
  alt_description?: string;
}

interface UnsplashResponse {
  results: UnsplashPhoto[];
}

// In-memory cache to avoid duplicate API calls within a single generation
const cache = new Map<string, string>();

/**
 * Search a single image by keyword. Returns image URL or null on failure.
 */
export async function searchImage(query: string): Promise<string | null> {
  if (!UNSPLASH_KEY) return null;
  const trimmed = query.trim();
  if (!trimmed) return null;

  // Cache hit
  if (cache.has(trimmed)) return cache.get(trimmed) || null;

  try {
    const url = `${UNSPLASH_URL}?query=${encodeURIComponent(trimmed)}&per_page=1&orientation=landscape`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
      // Short timeout — don't let image search block PPT generation
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn(`[image-search] Unsplash ${res.status}: ${trimmed}`);
      return null;
    }

    const data: UnsplashResponse = await res.json();
    const url1 = data.results?.[0]?.urls?.regular;
    if (url1) {
      cache.set(trimmed, url1);
      return url1;
    }
    return null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[image-search] failed for "${trimmed}": ${msg}`);
    return null;
  }
}

/**
 * Batch search multiple queries in parallel. Returns map of query -> url|null.
 */
export async function searchImages(
  queries: string[]
): Promise<Map<string, string | null>> {
  const unique = Array.from(new Set(queries.map((q) => q.trim()).filter(Boolean)));
  const results = await Promise.all(unique.map((q) => searchImage(q)));
  const map = new Map<string, string | null>();
  unique.forEach((q, i) => map.set(q, results[i]));
  return map;
}

/**
 * Scan HTML for img-slot/frame-img elements with data-search attribute,
 * fetch images in parallel, and replace placeholders with real <img> tags.
 * Falls back to original placeholder on failure.
 */
export async function injectSearchedImages(html: string): Promise<string> {
  if (!UNSPLASH_KEY) return html;

  // Match: <div class="img-slot ..." data-search="..."> ... </div>
  // Or: <div class="frame-img ..." data-search="..."> ... </div>
  // We capture: full match, class attribute, search keyword
  const regex =
    /<div\s+class="([^"]*(?:img-slot|frame-img)[^"]*)"\s+data-search="([^"]+)"[^>]*>[\s\S]*?<\/div>/g;

  const matches = Array.from(html.matchAll(regex));
  if (matches.length === 0) return html;

  // Collect unique queries
  const queries = matches.map((m) => m[2]);
  const imageMap = await searchImages(queries);

  // Replace each placeholder with an <img> tag (or keep original if no result)
  let result = html;
  for (const match of matches) {
    const fullMatch = match[0];
    const classAttr = match[1];
    const query = match[2];
    const imgUrl = imageMap.get(query.trim());

    if (imgUrl) {
      // Build replacement: keep class, drop data-search, inject img
      const replacement = `<div class="${classAttr}" data-img-src="${imgUrl}"><img src="${imgUrl}" alt="${escapeAttr(query)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:center;display:block" /></div>`;
      result = result.replace(fullMatch, replacement);
    }
    // else: keep original placeholder
  }

  return result;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
