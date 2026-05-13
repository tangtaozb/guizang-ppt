import { NextRequest } from "next/server";
import { streamChat, parseSSEStream } from "@/lib/deepseek";
import { buildSystemPrompt, buildEditPrompt } from "@/lib/prompt";
import { postProcessHtml } from "@/lib/html-template";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { currentHtml, instruction, chatHistory } = (await req.json()) as {
      currentHtml: string;
      instruction: string;
      chatHistory?: { role: "user" | "assistant"; content: string }[];
    };

    if (!currentHtml?.trim() || !instruction?.trim()) {
      return new Response(JSON.stringify({ error: "缺少参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildEditPrompt(currentHtml, instruction);

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    if (chatHistory?.length) {
      const recent = chatHistory.slice(-6);
      for (const msg of recent) {
        messages.push({
          role: msg.role,
          content: msg.role === "assistant" ? "[已根据指令修改 PPT]" : msg.content,
        });
      }
    }

    messages.push({ role: "user", content: userPrompt });

    const apiStream = await streamChat(messages);
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
    const msg = e instanceof Error ? e.message : "编辑失败";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
