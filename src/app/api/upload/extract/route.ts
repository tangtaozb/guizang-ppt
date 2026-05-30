// POST /api/upload/extract — parse a user-uploaded docx/pptx/pdf into source text.
//
// multipart/form-data { file: Blob }
// Response: { text, meta: { fileName, kind, charCount, truncated } }
//
// Does NOT consume credits — parsing is cheap and we want users to be able to
// preview/edit the extracted text before committing to a (paid) generation.

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import {
  extractText,
  inferKind,
  truncateForLLM,
  looksLikeEmptyOrScanned,
  ACCEPTED_EXTS,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/file-extract";

export const runtime = "nodejs"; // officeparser needs Node Buffer/zlib
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "请求格式错误，必须为 multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "未提供文件" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      {
        error: "文件过大（最大 4MB）",
        code: "FILE_TOO_LARGE",
        maxBytes: MAX_FILE_SIZE_BYTES,
      },
      { status: 413 }
    );
  }

  const kind = inferKind(file.name, file.type);
  if (!kind) {
    return NextResponse.json(
      {
        error: `不支持的文件格式（仅支持 ${ACCEPTED_EXTS.map((k) => `.${k}`).join(" / ")}）`,
        code: "UNSUPPORTED_FORMAT",
      },
      { status: 415 }
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { text, charCount } = await extractText(buffer, kind);

    if (looksLikeEmptyOrScanned(text)) {
      return NextResponse.json(
        {
          error:
            "未能从该文件中提取出文本。如果是扫描版 PDF 或纯图片内容，请先用 OCR 转换为可选文本。",
          code: "NO_TEXT_FOUND",
        },
        { status: 422 }
      );
    }

    const truncated = truncateForLLM(text);

    return NextResponse.json({
      text: truncated.text,
      meta: {
        fileName: file.name,
        kind,
        charCount,
        truncated: truncated.truncated,
        originalCharCount: truncated.originalCharCount,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    // Full stack to the runtime log so we can diagnose env-specific failures
    // (e.g. pdfjs on the wrong Node version, or a missing serverless chunk).
    console.error(`[upload/extract] parse error (kind=${kind}, name=${file.name}):`, stack || msg);
    return NextResponse.json(
      {
        error: "文件解析失败，可能是受密码保护或文件损坏。",
        code: "PARSE_FAILED",
        kind,
        details: msg.slice(0, 300),
      },
      { status: 500 }
    );
  }
}
