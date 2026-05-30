// Server-side document parsing for user-uploaded source material.
//
// - docx / pptx → officeparser (yauzl + xmldom, works fine on serverless)
// - pdf         → pdfjs-dist directly, with the worker pinned to the bundled
//                 file and run on the main thread.
//
// Why PDF is special: officeparser delegates PDFs to pdfjs but never sets
// GlobalWorkerOptions.workerSrc. On Vercel's serverless runtime pdfjs then tries
// to spin up a real worker, which never initializes → getDocument() hangs →
// FUNCTION_INVOCATION_TIMEOUT (504). We bypass that by loading pdfjs ourselves
// and pointing workerSrc at the real pdf.worker.mjs (bundled via
// outputFileTracingIncludes in next.config.ts), so pdfjs runs as a "fake worker"
// on the main thread — no thread spawn, serverless-safe.
//
// Node runtime only — depends on Node Buffer / zlib.

import { parseOfficeAsync } from "officeparser";
import { createRequire } from "module";
import { tmpdir } from "os";

const require = createRequire(import.meta.url);

export type FileKind = "docx" | "pptx" | "pdf";
export const ACCEPTED_EXTS: FileKind[] = ["docx", "pptx", "pdf"];
export const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB — matches Vercel route handler default body limit

// LLM context-window protection. DeepSeek supports 128K tokens; we cap source
// text well under that to leave room for the system prompt + theme CSS.
const MAX_TOKENS_APPROX = 120_000;
const TOKEN_BYTES_PER = 3; // rough heuristic: UTF-8 chars / 3 ≈ tokens
const TRUNCATE_HEAD_CHARS = 50_000 * TOKEN_BYTES_PER; // ~150KB of text
const TRUNCATE_TAIL_CHARS = 30_000 * TOKEN_BYTES_PER; // ~90KB of text

const MIME_TO_KIND: Record<string, FileKind> = {
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/pdf": "pdf",
};

/**
 * Detect file type from name + mime. Returns null if unsupported.
 */
export function inferKind(fileName: string, mime: string | undefined): FileKind | null {
  if (mime && MIME_TO_KIND[mime]) return MIME_TO_KIND[mime];
  const ext = fileName.split(".").pop()?.toLowerCase() as FileKind | undefined;
  if (ext && (ACCEPTED_EXTS as string[]).includes(ext)) return ext as FileKind;
  return null;
}

/**
 * Extract plain text from a PDF using pdfjs-dist directly, with the worker
 * disabled (run on the main thread). This is the serverless-safe path —
 * see the file header for why officeparser's built-in PDF handling hangs.
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // Pin workerSrc to the real worker file so pdfjs loads it as a fake worker on
  // the main thread instead of spawning a real one (which hangs on serverless).
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = require.resolve(
      "pdfjs-dist/legacy/build/pdf.worker.mjs"
    );
  }

  const doc = await pdfjs.getDocument({
    data: new Uint8Array(buffer),
    isEvalSupported: false,
    useSystemFonts: true,
    // Don't fetch external standard-font data over the network in serverless.
    disableFontFace: true,
  }).promise;

  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let lastY: number | undefined;
    let line = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const y = item.transform[5];
      if (lastY !== undefined && y !== lastY) {
        parts.push(line);
        line = "";
      }
      line += item.str;
      lastY = y;
    }
    if (line) parts.push(line);
    parts.push(""); // page break
  }
  await doc.cleanup().catch(() => {});
  return parts.join("\n");
}

/**
 * Parse a buffered document into plain text. Throws on parse errors so the
 * caller can surface a friendly message.
 *
 * PDFs go through pdfjs directly (worker-pinned, main-thread). docx/pptx go
 * through officeparser. officeparser v5's published TS types omit
 * `tempFilesLocation`, but the runtime still honors it — we pass it through a
 * loosely-typed config so any temp files land in /tmp (Vercel's only writable
 * dir) rather than the read-only serverless cwd.
 */
export async function extractText(
  buffer: Buffer,
  kind: FileKind
): Promise<{ text: string; charCount: number }> {
  let text: string;
  if (kind === "pdf") {
    text = (await extractPdfText(buffer)).trim();
  } else {
    const cfg = { tempFilesLocation: tmpdir() } as unknown as Parameters<
      typeof parseOfficeAsync
    >[1];
    const raw = await parseOfficeAsync(buffer, cfg);
    text = (raw || "").trim();
  }
  return { text, charCount: text.length };
}

export interface TruncateResult {
  text: string;
  truncated: boolean;
  originalCharCount: number;
}

/**
 * If text is too long for LLM context, keep head + tail and insert an
 * `[已省略中间 N 字]` placeholder. Otherwise return as-is.
 */
export function truncateForLLM(text: string): TruncateResult {
  const originalCharCount = text.length;
  const estimatedTokens = Math.ceil(originalCharCount / TOKEN_BYTES_PER);
  if (estimatedTokens <= MAX_TOKENS_APPROX) {
    return { text, truncated: false, originalCharCount };
  }

  const head = text.slice(0, TRUNCATE_HEAD_CHARS);
  const tail = text.slice(-TRUNCATE_TAIL_CHARS);
  const omittedChars = originalCharCount - head.length - tail.length;
  const omitNotice = `\n\n[已省略中间约 ${omittedChars.toLocaleString()} 字以适配模型上下文窗口]\n\n`;

  return {
    text: head + omitNotice + tail,
    truncated: true,
    originalCharCount,
  };
}

/**
 * Heuristic check: scanned PDFs (or empty/image-only docs) parse to essentially
 * no text. Tell the caller so they can show a clearer error.
 */
export function looksLikeEmptyOrScanned(text: string): boolean {
  return text.trim().length < 20;
}
