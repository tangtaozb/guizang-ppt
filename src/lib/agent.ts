/**
 * Agent routing module — classifies user intent and refines instructions.
 *
 * Uses a two-tier approach:
 * 1. Regex fast path: high-confidence edit/chat signals → zero LLM overhead
 * 2. LLM Agent routing: ambiguous messages → Function Calling with tool definitions
 */

import { agentChat, type ToolDef, type AgentResult } from "./deepseek";

// ── Regex fast path ──

// Strong edit: action verbs or design terms at start of message
const EDIT_START =
  /^(换成|改为|改成|加上|添加|删除|删掉|去掉|移除|修改|增加|减少|调整|替换|更换|缩小|放大|加粗|加一|减一|移到|挪到|设为|设置|改一|改下|弄成|做成|变成|换一|换个|加个|来个|重做|重新|把.{1,10}(改|换|变|调|设|删|加|去|移)|用.{0,4}(替换|替代|代替)|每.{0,4}(页|张|slide)|字体|颜色|背景|标题|正文|页眉|页脚|间距|边距|对齐|居中|靠左|靠右|主题|风格|布局|排版|动画)/;

// Strong generate: phrases requesting PPT/演示文稿 creation
const GENERATE_SIGNAL =
  /(?:做|制作|生成|创建|写|来|整|弄|出|搞).{0,6}(?:PPT|ppt|演示文稿|幻灯片|slide)/i;

// Strong chat: question endings
const QUESTION_ENDING =
  /(?:怎么样|如何|是什么|什么意思|吗|呢|嘛|啥|没有|不是|行不行|好不好|对不对|可不可以|好吗|对吗|行吗)$/;

// Safe chat: greetings, acknowledgments, question words
const SAFE_CHAT =
  /^(请问|为什么|怎么回事|是否|有没有|是不是|能不能|可以吗|你好|谢谢|好的|嗯|哦|知道了?|明白|告诉我|想问|想知道|今天)/;

export type QuickIntent = "edit" | "generate" | "chat" | "ambiguous";

export function quickClassify(message: string): QuickIntent {
  const trimmed = message.trim();
  if (EDIT_START.test(trimmed)) return "edit";
  if (GENERATE_SIGNAL.test(trimmed)) return "generate";
  if (trimmed.endsWith("？") || trimmed.endsWith("?")) return "chat";
  if (QUESTION_ENDING.test(trimmed)) return "chat";
  if (SAFE_CHAT.test(trimmed)) return "chat";
  return "ambiguous";
}

// ── Tool definitions ──

const AGENT_TOOLS: ToolDef[] = [
  {
    type: "function",
    function: {
      name: "modify_ppt",
      description:
        "修改当前PPT的内容、样式、布局、图片等。当用户想让PPT发生任何变化时调用（即使表达间接如'突出点''好看些''太挤了'）。将模糊表述转化为具体修改指令。",
      parameters: {
        type: "object",
        properties: {
          instruction: {
            type: "string",
            description:
              "具体的修改指令。将用户的模糊表述转化为明确的操作描述。例如：'年份突出点' → '将年份数字放大字号并改用醒目的橙色'",
          },
        },
        required: ["instruction"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_ppt",
      description:
        "从零生成一份新的PPT。当用户提供了主题或内容要求生成PPT，且当前没有PPT时调用。",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "PPT的主题或内容要求",
          },
        },
        required: ["topic"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "chat_response",
      description:
        "回答用户的问题或参与闲聊讨论。当用户在提问、讨论、询问意见、表达感受时调用。",
      parameters: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "回复内容，简洁友好，200字以内",
          },
        },
        required: ["message"],
      },
    },
  },
];

// ── Agent routing ──

export interface RouteResult {
  tool: "modify_ppt" | "generate_ppt" | "chat_response";
  /** For modify_ppt: refined instruction. For generate_ppt: topic. For chat_response: reply message. */
  content: string;
}

/**
 * Route a user message to the appropriate action.
 * Regex fast path handles ~40-50% of messages with zero LLM cost.
 * Ambiguous messages go through LLM Agent with Function Calling.
 */
export async function routeMessage(
  message: string,
  chatHistory: { role: string; content: string }[],
  hasHtml: boolean,
  slideCount: number,
  themeName: string
): Promise<RouteResult> {
  const quick = quickClassify(message);

  // ── Regex fast path ──
  if (quick === "edit") {
    if (!hasHtml) {
      return { tool: "generate_ppt", content: message };
    }
    return { tool: "modify_ppt", content: message };
  }
  if (quick === "generate") {
    // Explicit PPT generation request (e.g. "给我做一个介绍马斯克的PPT")
    return { tool: "generate_ppt", content: message };
  }
  if (quick === "chat") {
    // Chat messages go through LLM to get a proper reply via tool_call
  }

  // ── LLM Agent routing ──
  const systemPrompt = `你是 Artify Slide 的智能助手。用户正在编辑一份演示文稿。
根据用户消息和对话历史，选择合适的工具执行操作。

决策规则：
1. 用户想让PPT发生任何变化 → modify_ppt（即使表达间接，如"突出点""好看些""太挤了"）
2. 上一条AI消息给出了建议或选项，用户表示同意或选择其一 → modify_ppt
3. 用户要求从零生成PPT，且当前没有PPT → generate_ppt
4. 用户在提问、讨论、闲聊、表达感受 → chat_response

当使用 modify_ppt 时，将用户的模糊表述转化为具体的修改指令。
当使用 chat_response 时，直接在 message 中给出简洁友好的回复（200字以内）。

当前PPT状态：${hasHtml ? `${slideCount} 页` : "尚未生成"} | 主题：${themeName}`;

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
  ];

  // Add recent chat history for context (last 4 messages)
  const recent = chatHistory.slice(-4);
  for (const msg of recent) {
    messages.push({
      role: msg.role as "user" | "assistant",
      content:
        msg.role === "assistant" && msg.content.length > 200
          ? msg.content.slice(0, 200) + "..."
          : msg.content,
    });
  }

  messages.push({ role: "user", content: message });

  try {
    const result: AgentResult = await agentChat(messages, AGENT_TOOLS, 500);

    switch (result.toolName) {
      case "modify_ppt":
        if (!hasHtml) {
          // No HTML yet — treat as generate request
          return {
            tool: "generate_ppt",
            content: result.args.instruction || message,
          };
        }
        return {
          tool: "modify_ppt",
          content: result.args.instruction || message,
        };

      case "generate_ppt":
        return {
          tool: "generate_ppt",
          content: result.args.topic || message,
        };

      case "chat_response":
        return {
          tool: "chat_response",
          content: result.args.message || "抱歉，我没有理解你的意思。",
        };

      default:
        // Unknown tool — default to chat
        return {
          tool: "chat_response",
          content: result.args.message || "抱歉，我没有理解你的意思。",
        };
    }
  } catch (e) {
    console.error("[agent] routing failed:", e);
    // On failure, default to chat (safe — avoids accidental edits)
    return {
      tool: "chat_response",
      content: "抱歉，处理消息时出现了问题，请重试。",
    };
  }
}
