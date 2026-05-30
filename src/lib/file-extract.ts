// Server-side document parsing for user-uploaded source material.
//
// - docx / pptx → officeparser (yauzl + xmldom, works fine on serverless)
// - pdf         → pdfjs-dist directly, with the worker pinned to the bundled
//                 file and run on the main thread.
//
// Why PDF is special — two serverless gotchas, both handled here:
//  1. officeparser delegates PDFs to pdfjs but never sets
//     GlobalWorkerOptions.workerSrc, so pdfjs tries to spawn a real worker that
//     never initializes → getDocument() hangs → 504. We load pdfjs ourselves and
//     pin workerSrc to the bundled pdf.worker.mjs (fake worker, main thread).
//  2. pdfjs's pdf.mjs references browser globals (DOMMatrix, Path2D, ImageData,
//     …) at MODULE-EVAL time. Vercel's Node runtime doesn't define them →
//     "ReferenceError: DOMMatrix is not defined" the instant pdfjs is imported.
//     We install minimal stubs BEFORE importing pdfjs. Text extraction never
//     calls their methods, so no-op stubs suffice (verified on real PDFs).
//
// Node runtime only — depends on Node Buffer / zlib.

import { parseOfficeAsync } from "officeparser";
import { tmpdir } from "os";

/**
 * Install no-op stubs for the browser globals pdfjs references at module-eval
 * time. Idempotent; only fills globals that are missing. Must run BEFORE the
 * dynamic import of pdfjs. Text extraction doesn't invoke their methods.
 */
function ensurePdfGlobals(): void {
  const g = globalThis as Record<string, unknown>;
  if (typeof g.DOMMatrix === "undefined") {
    g.DOMMatrix = class DOMMatrix {
      a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      constructor(init?: number[] | string) {
        if (Array.isArray(init) && init.length >= 6) {
          [this.a, this.b, this.c, this.d, this.e, this.f] = init;
        }
      }
      multiply() { return this; }
      translate() { return this; }
      scale() { return this; }
      inverse() { return this; }
      transformPoint(p: unknown) { return p; }
    };
  }
  if (typeof g.Path2D === "undefined") {
    g.Path2D = class Path2D {
      addPath() {} moveTo() {} lineTo() {} bezierCurveTo() {}
      quadraticCurveTo() {} arc() {} closePath() {} rect() {}
    };
  }
  if (typeof g.ImageData === "undefined") {
    g.ImageData = class ImageData {
      width: number; height: number; data: Uint8ClampedArray;
      constructor(w: number, h: number) {
        this.width = w; this.height = h;
        this.data = new Uint8ClampedArray((w * h || 0) * 4);
      }
    };
  }
  if (typeof g.DOMRect === "undefined") {
    g.DOMRect = class DOMRect {
      x: number; y: number; width: number; height: number;
      constructor(x = 0, y = 0, w = 0, h = 0) {
        this.x = x; this.y = y; this.width = w; this.height = h;
      }
    };
  }
  if (typeof g.DOMPoint === "undefined") {
    g.DOMPoint = class DOMPoint {
      x: number; y: number;
      constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    };
  }
}

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
  ensurePdfGlobals(); // MUST run before importing pdfjs (module-eval needs them)
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // Import the worker MODULE (not a file path) so the bundler resolves it as a
  // dependency and ships it. require.resolve()'d physical paths break once Next
  // relocates code into .next/chunks; importing the module sidesteps that.
  await import("pdfjs-dist/legacy/build/pdf.worker.mjs");

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
