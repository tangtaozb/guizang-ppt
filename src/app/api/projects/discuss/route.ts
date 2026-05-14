import { NextRequest, NextResponse } from "next/server";
import { streamChat, parseSSEStream } from "@/lib/deepseek";
import { getAuthUser } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/projects/discuss — AI responds to questions/discussion (no HTML generation)
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  try {
    const { question, currentHtml, chatHistory } = (await req.json()) as {
      question: string;
      currentHtml?: string;
      chatHistory?: { role: "user" | "assistant"; content: string }[];
    };

    if (!question?.trim()) {
      return new Response(JSON.stringify({ error: "缺少问题内容" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const slideCount = currentHtml
      ? (currentHtml.match(/class="slide"/g) || []).length
      : 0;

    const systemPrompt = `你是 GuiZang PPT 的智能助手。用户正在编辑一份演示文稿（当前 ${slideCount} 页）。
请以简洁友好的方式回答用户的问题或参与讨论。
注意：
- 不要生成或输出任何 HTML 代码
- 回答控制在 200 字以内
- 如果用户的问题涉及到需要修改 PPT 的操作，提示用户直接发送修改指令即可`;

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];

    if (chatHistory?.length) {
      const recent = chatHistory.slice(-4);
      for (const msg of recent) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: "user", content: question });

    const apiStream = await streamChat(messages);
    const contentStream = parseSSEStream(apiStream);
    const reader = contentStream.getReader();

    const encoder = new TextEncoder();
    const outputStream = new ReadableStream({
      async pull(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
            );
            controller.close();
            return;
          }
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
    const msg = e instanceof Error ? e.message : "对话失败";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
