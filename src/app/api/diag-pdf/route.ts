// TEMPORARY diagnostic endpoint — NO AUTH. Parses a tiny bundled PDF on the
// server to surface the REAL pdfjs/officeparser error in Vercel's serverless
// environment. Delete after diagnosis.

import { NextResponse } from "next/server";
import { extractText } from "@/lib/file-extract";
import { existsSync, readdirSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const maxDuration = 60;

// Minimal valid PDF with the text "Hello PDF diag", base64-encoded.
const TINY_PDF_B64 =
  "JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNjEyIDc5Ml0vQ29udGVudHMgNCAwIFIvUmVzb3VyY2VzPDwvRm9udDw8L0YxIDUgMCBSPj4+Pj4+ZW5kb2JqCjQgMCBvYmo8PC9MZW5ndGggNDQ+PnN0cmVhbQpCVCAvRjEgMjQgVGYgNzIgNzAwIFRkIChIZWxsbyBQREYgZGlhZykgVGogRVQKZW5kc3RyZWFtIGVuZG9iago1IDAgb2JqPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj5lbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTIgMDAwMDAgbiAKMDAwMDAwMDEwMSAwMDAwMCBuIAowMDAwMDAwMjA5IDAwMDAwIG4gCjAwMDAwMDAzMjAgMDAwMDAgbiAKdHJhaWxlcjw8L1NpemUgNi9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjM4OQolJUVPRg==";

export async function GET() {
  const diag: Record<string, unknown> = {};

  // 1. Is pdf.worker.mjs actually present in the deployed function?
  try {
    const buildDir = join(process.cwd(), "node_modules/pdfjs-dist/legacy/build");
    diag.buildDirExists = existsSync(buildDir);
    diag.buildDirFiles = diag.buildDirExists ? readdirSync(buildDir) : null;
    diag.workerPresent = existsSync(join(buildDir, "pdf.worker.mjs"));
  } catch (e) {
    diag.fsCheckError = e instanceof Error ? e.message : String(e);
  }

  // 2. Actually try to parse a PDF via the REAL extractText path.
  try {
    const buf = Buffer.from(TINY_PDF_B64, "base64");
    const t0 = Date.now();
    const { text, charCount } = await extractText(buf, "pdf");
    diag.parseOk = true;
    diag.parseMs = Date.now() - t0;
    diag.textLen = charCount;
    diag.textPreview = text.slice(0, 80);
  } catch (e) {
    diag.parseOk = false;
    diag.errorMessage = e instanceof Error ? e.message : String(e);
    diag.errorStack = e instanceof Error ? e.stack?.split("\n").slice(0, 8).join("\n") : undefined;
  }

  diag.cwd = process.cwd();
  diag.nodeVersion = process.version;

  return NextResponse.json(diag, { status: 200 });
}
