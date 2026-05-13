import { NextRequest } from "next/server";
import { streamChat, parseSSEStream } from "@/lib/deepseek";
import { buildSystemPrompt, buildGeneratePrompt } from "@/lib/prompt";
import { postProcessHtml } from "@/lib/html-template";
import type { ThemeId } from "@/types";
import { getThemeStyle } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { sourceText, theme, slideCount } = (await req.json()) as {
      sourceText: string;
      theme: ThemeId;
      slideCount?: number;
    };

    if (!sourceText?.trim()) {
      return new Response(JSON.stringify({ error: "请提供文本内容" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const style = getThemeStyle(theme);
    const systemPrompt = buildSystemPrompt(style);
    const userPrompt = buildGeneratePrompt(sourceText, theme, slideCount);

    const apiStream = await streamChat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const contentStream = parseSSEStream(apiStream);
    const reader = contentStream.getReader();
    let fullContent = "";

    const encoder = new TextEncoder();
    const outputStream = new ReadableStream({
      async pull(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            const processed = postProcessHtml(fullContent);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "complete", html: processed })}\n\n`)
            );
            controller.close();
            return;
          }
          fullContent += value;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "delta", content: value })}\n\n`)
          );
        }
      },
    });

    return new Response(outputStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "生成失败";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
