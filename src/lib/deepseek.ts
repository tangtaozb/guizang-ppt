const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function streamChat(messages: ChatMessage[]): Promise<ReadableStream> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000);

  try {
    const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 16384,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`AI 模型返回错误 ${res.status}: ${err.slice(0, 200)}`);
    }

    return res.body!;
  } catch (e: unknown) {
    clearTimeout(timeout);
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error("AI 模型请求超时，请稍后重试");
    }
    if (e instanceof TypeError && (e as Error).message === "fetch failed") {
      throw new Error("无法连接 AI 模型服务，请检查网络后重试");
    }
    throw e;
  }
}

/**
 * Non-streaming chat completion for quick tasks like intent classification.
 * Low temperature, small max_tokens for fast response.
 */
export async function quickChat(messages: ChatMessage[], maxTokens = 10): Promise<string> {
  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      stream: false,
      temperature: 0,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI 请求失败 ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content || "").trim();
}

// ── Tool definitions for Agent routing ──

export interface ToolDef {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface AgentResult {
  toolName: string;
  args: Record<string, string>;
}

/**
 * Non-streaming chat with Function Calling (tools).
 * Used by the Agent to decide which action to take.
 */
export async function agentChat(
  messages: ChatMessage[],
  tools: ToolDef[],
  maxTokens = 500
): Promise<AgentResult> {
  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      tools,
      tool_choice: "required",
      stream: false,
      temperature: 0,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Agent 路由失败 ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const message = data.choices?.[0]?.message;

  // Parse tool_calls from response
  if (message?.tool_calls?.length > 0) {
    const tc = message.tool_calls[0];
    const args = JSON.parse(tc.function.arguments);
    return { toolName: tc.function.name, args };
  }

  // Fallback: parse inline tool call from content (some models output XML-like format)
  const content = (message?.content || "").trim();
  if (content.includes("<function=")) {
    const nameMatch = content.match(/<function=(\w+)>/);
    const paramMatch = content.match(/<parameter=(\w+)>([\s\S]*?)(?:<\/|$)/);
    if (nameMatch) {
      const args: Record<string, string> = {};
      if (paramMatch) args[paramMatch[1]] = paramMatch[2].trim();
      return { toolName: nameMatch[1], args };
    }
  }

  // Last resort: try to infer intent from original user message
  // This handles cases where MIMO doesn't return proper tool_calls
  const lastUserMsg = messages.filter(m => m.role === "user").pop()?.content || "";
  const hasPptKeyword = /(?:PPT|ppt|演示文稿|幻灯片)/.test(lastUserMsg);
  const hasGenerateVerb = /(?:做|制作|生成|创建|写|来|整|弄|搞|帮我|给我)/.test(lastUserMsg);

  if (hasPptKeyword && hasGenerateVerb) {
    return { toolName: "generate_ppt", args: { topic: lastUserMsg } };
  }

  return { toolName: "chat_response", args: { message: content || "抱歉，我没有理解你的意思，请再说一次。" } };
}

export function parseSSEStream(body: ReadableStream): ReadableStream<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream<string>({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(content);
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    },
  });
}
