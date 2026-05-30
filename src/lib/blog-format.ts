// Client-safe blog types + formatters (NO node/fs imports).
// Both the server loader (blog.ts) and client components import from here,
// so client components never accidentally pull in fs.

export type Lang = "en" | "zh";

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO 8601
  author: string;
  keywords: string[];
  ogImage?: string;
  dek?: string;
  lang: Lang;
  altSlug?: string; // slug of the same article in the other language
  readingMinutes: number;
  wordCount: number;
};

/** Locale-aware date: en → "May 30, 2026" · zh → "2026年5月30日" */
export function formatBlogDate(iso: string, locale: Lang): string {
  return new Date(iso).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: locale === "zh" ? "long" : "short",
    day: "numeric",
  });
}
