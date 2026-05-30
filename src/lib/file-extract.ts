// Server-side document parsing for user-uploaded source material.
// officeparser v5 handles docx + pptx + pdf via parseOfficeAsync().
//
// Node runtime only — depends on Node Buffer / zlib.

import { parseOfficeAsync } from "officeparser";
import { tmpdir } from "os";

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
 * Parse a buffered document into plain text. Throws on parse errors so the
 * caller can surface a friendly message.
 *
 * officeparser v5's published TS types omit `tempFilesLocation`, but the
 * runtime still honors it. We pass it through a loosely-typed config so that —
 * if this build writes temp files during unzip — they land in /tmp (Vercel's
 * only writable dir) rather than the read-only serverless cwd. If v5 uses
 * in-memory unzip, the option is simply ignored.
 */
export async function extractText(
  buffer: Buffer,
  _kind: FileKind
): Promise<{ text: string; charCount: number }> {
  const cfg = { tempFilesLocation: tmpdir() } as unknown as Parameters<
    typeof parseOfficeAsync
  >[1];
  const raw = await parseOfficeAsync(buffer, cfg);
  const text = (raw || "").trim();
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
