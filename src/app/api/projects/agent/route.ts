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
import {
  CREDIT_COST,
  chargeCredits,
  getCreditBalance,
  refundCredits,
} from "@/lib/credits";

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

    // ── Credit pre-check: block 0-credit users at the gate ──
    // The cheapest non-chat action is edit (18 credits). If user can't even
    // afford an edit, reject before spending any OpenAI tokens on routing.
    const balance = await getCreditBalance(user.id);
    const minCostToProceed = Math.min(CREDIT_COST.edit, CREDIT_COST.generate);
    if (balance < minCostToProceed) {
      return creditExhaustedResponse(balance);
    }

    // ── Fast path: sourceText + no HTML → generate (unless clearly chat) ──
    if (sourceText?.trim() && !hasHtml && quickClassify(sourceText.trim()) !== "chat") {
      if (balance < CREDIT_COST.generate) return creditExhaustedResponse(balance);
      const charge = await chargeCredits({
        userId: user.id,
        amount: CREDIT_COST.generate,
        type: "generate",
        description: "生成演示文稿",
        projectTitle: "",
      });
      if (!charge.ok) return creditExhaustedResponse(charge.remaining);

      const genSourceText = sourceText.trim();
      const style = getThemeStyle(activeTheme);
      const systemPrompt = buildSystemPrompt(style);
      const userPrompt = buildGeneratePrompt(genSourceText, activeTheme);
      return streamHtmlResponse("generate", systemPrompt, userPrompt, [], {
        userId: user.id,
        amount: CREDIT_COST.generate,
        refundReason: "PPT 生成失败，已退还积分",
      });
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
      // Chat — no charge (cost absorbed into routing overhead)
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
      if (balance < CREDIT_COST.generate) return creditExhaustedResponse(balance);
      const charge = await chargeCredits({
        userId: user.id,
        amount: CREDIT_COST.generate,
        type: "generate",
        description: "生成演示文稿",
        projectTitle: "",
      });
      if (!charge.ok) return creditExhaustedResponse(charge.remaining);

      const genSourceText = route.content;
      const style = getThemeStyle(activeTheme);
      const systemPrompt = buildSystemPrompt(style);
      const userPrompt = buildGeneratePrompt(genSourceText, activeTheme);

      return streamHtmlResponse("generate", systemPrompt, userPrompt, [], {
        userId: user.id,
        amount: CREDIT_COST.generate,
        refundReason: "PPT 生成失败，已退还积分",
      });
    }

    if (route.tool === "modify_ppt") {
      if (balance < CREDIT_COST.edit) return creditExhaustedResponse(balance);
      const charge = await chargeCredits({
        userId: user.id,
        amount: CREDIT_COST.edit,
        type: "edit",
        description: `编辑：${(route.content || "").slice(0, 20)}`,
        projectTitle: "",
      });
      if (!charge.ok) return creditExhaustedResponse(charge.remaining);

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

      return streamHtmlResponse("edit", systemPrompt, userPrompt, history, {
        userId: user.id,
        amount: CREDIT_COST.edit,
        refundReason: "PPT 编辑失败，已退还积分",
      });
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

/** 402 response shape — frontend reads `credits` to show the right CTA. */
function creditExhaustedResponse(remaining: number): Response {
  return new Response(
    JSON.stringify({
      error: "积分不足，请前往定价页升级套餐",
      code: "INSUFFICIENT_CREDITS",
      credits: remaining,
    }),
    {
      status: 402,
      headers: { "Content-Type": "application/json" },
    }
  );
}

interface ChargeContext {
  userId: string;
  amount: number;
  refundReason: string;
}

/**
 * Build and return a streaming HTML response (for generate or edit).
 *
 * Caller must have already charged credits before calling this. If the
 * LLM stream errors out, this auto-refunds via `chargeCtx`.
 */
async function streamHtmlResponse(
  mode: "generate" | "edit",
  systemPrompt: string,
  userPrompt: string,
  history: { role: "user" | "assistant"; content: string }[],
  chargeCtx?: ChargeContext
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
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Validate output is non-empty before treating as success
            const trimmed = fullContent.trim();
            const hasDoctype = trimmed.includes("<!DOCTYPE") || trimmed.includes("<html");
            if (!trimmed || !hasDoctype) {
              if (chargeCtx) {
                await refundCredits({
                  userId: chargeCtx.userId,
                  amount: chargeCtx.amount,
                  reason: chargeCtx.refundReason,
                });
              }
              controller.enqueue(
                encoder.encode(
                  sseEvent({ type: "error", message: "LLM 输出为空或格式错误，已退还积分" })
                )
              );
              controller.close();
              return;
            }
            const processed = await postProcessHtml(fullContent);
            controller.enqueue(
              encoder.encode(sseEvent({ type: "complete", html: processed }))
            );
            controller.close();
            return;
          }
          fullContent += value;
          controller.enqueue(
            encoder.encode(sseEvent({ type: "delta", content: value }))
          );
        }
      } catch (e) {
        // LLM error — auto-refund
        if (chargeCtx) {
          await refundCredits({
            userId: chargeCtx.userId,
            amount: chargeCtx.amount,
            reason: chargeCtx.refundReason,
          });
        }
        const msg = e instanceof Error ? e.message : String(e);
        controller.enqueue(
          encoder.encode(sseEvent({ type: "error", message: `${msg}（已退还积分）` }))
        );
        controller.close();
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
