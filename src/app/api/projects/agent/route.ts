import { NextRequest, NextResponse } from "next/server";
import { streamChat, parseSSEStream } from "@/lib/deepseek";
import {
  buildSystemPrompt,
  buildGeneratePrompt,
  buildEditPrompt,
} from "@/lib/prompt";
import { postProcessHtml } from "@/lib/html-template";
import type { ThemeId } from "@/types";
import { getThemeStyle } from "@/types";
import { getAuthUser } from "@/lib/auth";
import { routeMessage, quickClassify } from "@/lib/agent";

export const runtime = "nodejs";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
};

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// POST /api/projects/agent — Unified agent endpoint
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  try {
    const {
      message,
      currentHtml,
      chatHistory,
      theme,
      sourceText,
    } = (await req.json()) as {
      message: string;
      currentHtml?: string;
      chatHistory?: { role: string; content: string }[];
      theme?: ThemeId;
      sourceText?: string;
    };

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "缺少消息内容" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hasHtml = !!currentHtml?.trim();
    const slideCount = hasHtml
      ? (currentHtml!.match(/class="slide"/g) || []).length
      : 0;
    const activeTheme: ThemeId = theme || "ink-classic";
    const themeName = getThemeName(activeTheme);

    // ── Fast path: sourceText + no HTML → generate (unless clearly chat) ──
    // When user provides sourceText from dashboard, skip Agent routing —
    // but only if the text looks like a topic, not a greeting/question.
    if (sourceText?.trim() && !hasHtml && quickClassify(sourceText.trim()) !== "chat") {
      const genSourceText = sourceText.trim();
      const style = getThemeStyle(activeTheme);
      const systemPrompt = buildSystemPrompt(style);
      const userPrompt = buildGeneratePrompt(genSourceText, activeTheme);
      return streamHtmlResponse("generate", systemPrompt, userPrompt, []);
    }

    // ── Agent routing: decide what to do ──
    const route = await routeMessage(
      message,
      chatHistory || [],
      hasHtml,
      slideCount,
      themeName
    );

    // ── Execute the chosen action ──

    if (route.tool === "chat_response") {
      // Chat — no second LLM call needed, reply is already in route.content
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(sseEvent({ type: "mode", mode: "chat" }))
          );
          controller.enqueue(
            encoder.encode(
              sseEvent({ type: "done", message: route.content })
            )
          );
          controller.close();
        },
      });
      return new Response(stream, { headers: SSE_HEADERS });
    }

    if (route.tool === "generate_ppt") {
      // Generate — always use agent's topic (route.content), NOT sourceText.
      // sourceText from Zustand may be stale (e.g. a previous chat message).
      // The sourceText fast path (lines 60-69) already handles dashboard→generate.
      const genSourceText = route.content;
      const style = getThemeStyle(activeTheme);
      const systemPrompt = buildSystemPrompt(style);
      const userPrompt = buildGeneratePrompt(genSourceText, activeTheme);

      return streamHtmlResponse("generate", systemPrompt, userPrompt, []);
    }

    if (route.tool === "modify_ppt") {
      // Edit — use the refined instruction from agent
      const isSwiss =
        currentHtml!.includes("--accent:") &&
        currentHtml!.includes("--grey-1:");
      const systemPrompt = buildSystemPrompt(isSwiss ? "b" : "a");
      const userPrompt = buildEditPrompt(currentHtml!, route.content);

      // Build message history for edit context
      const history: { role: "user" | "assistant"; content: string }[] = [];
      if (chatHistory?.length) {
        const recent = chatHistory.slice(-6);
        for (const msg of recent) {
          history.push({
            role: msg.role as "user" | "assistant",
            content:
              msg.role === "assistant"
                ? "[已根据指令修改 PPT]"
                : msg.content,
          });
        }
      }

      return streamHtmlResponse("edit", systemPrompt, userPrompt, history);
    }

    // Fallback: shouldn't reach here
    return new Response(
      JSON.stringify({ error: "未知的操作类型" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "处理失败";
    console.error("[agent] error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Build and return a streaming HTML response (for generate or edit).
 */
async function streamHtmlResponse(
  mode: "generate" | "edit",
  systemPrompt: string,
  userPrompt: string,
  history: { role: "user" | "assistant"; content: string }[]
): Promise<Response> {
  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [{ role: "system", content: systemPrompt }];

  for (const msg of history) {
    messages.push(msg);
  }
  messages.push({ role: "user", content: userPrompt });

  const apiStream = await streamChat(messages);
  const contentStream = parseSSEStream(apiStream);
  const reader = contentStream.getReader();
  let fullContent = "";

  const encoder = new TextEncoder();
  const outputStream = new ReadableStream({
    start(controller) {
      // First event: tell frontend which mode
      controller.enqueue(encoder.encode(sseEvent({ type: "mode", mode })));
    },
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          const processed = postProcessHtml(fullContent);
          controller.enqueue(
            encoder.encode(
              sseEvent({ type: "complete", html: processed })
            )
          );
          controller.close();
          return;
        }
        fullContent += value;
        controller.enqueue(
          encoder.encode(sseEvent({ type: "delta", content: value }))
        );
      }
    },
  });

  return new Response(outputStream, { headers: SSE_HEADERS });
}

function getThemeName(theme: ThemeId): string {
  const names: Record<string, string> = {
    "ink-classic": "墨水经典",
    indigo: "靛蓝瓷",
    forest: "森林墨",
    kraft: "牛皮纸",
    dune: "沙丘",
    ikb: "克莱因蓝",
    lemon: "柠檬黄",
    "lemon-green": "柠檬绿",
    "safety-orange": "安全橙",
  };
  return names[theme] || theme;
}
