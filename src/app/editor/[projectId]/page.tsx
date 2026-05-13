"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEditorStore } from "@/stores/editor";
import type { ProjectVersion } from "@/types";
import { exportPptx } from "@/lib/export-pptx";
import {
  getProject,
  createProject,
  updateProject,
  addVersion,
  countSlides,
  consumeCredits,
} from "@/lib/storage";
import { UserCenter } from "@/components/user-center";

async function consumeSSE(
  response: Response,
  onDelta: (content: string) => void,
  onComplete: (html: string) => void,
  onError: (error: string) => void,
  signal?: AbortSignal
) {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      if (signal?.aborted) {
        reader.cancel();
        return;
      }
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(trimmed.slice(6));
          if (data.type === "delta") {
            onDelta(data.content);
          } else if (data.type === "complete") {
            onComplete(data.html);
          } else if (data.type === "error") {
            onError(data.message);
          }
        } catch {
          // skip malformed
        }
      }
    }
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") return;
    throw e;
  }
}

function VersionPanel({
  versions,
  currentVersionId,
  onSelect,
  onClose,
}: {
  versions: ProjectVersion[];
  currentVersionId: string | null;
  onSelect: (v: ProjectVersion) => void;
  onClose: () => void;
}) {
  return (
    <>
    <div className="absolute inset-0 z-20" onClick={onClose} />
    <div className="absolute left-0 top-0 bottom-0 w-72 bg-white border-r border-border z-30 flex flex-col shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold">版本历史</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">暂无版本记录</p>
        ) : (
          <div className="py-1">
            {[...versions].reverse().map((v, idx) => {
              const isCurrent = currentVersionId === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onSelect(v)}
                  className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors ${
                    isCurrent
                      ? "bg-accent/10 border-l-[3px] border-l-accent"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-accent">
                        v{versions.length - idx}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent text-white leading-none">
                          预览中
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(v.createdAt).toLocaleString("zh-CN", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className={`text-sm mt-1.5 truncate font-medium ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                    {v.label}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const paramId = params.projectId as string;
  const isNew = paramId === "new";

  const {
    currentHtml,
    messages,
    isGenerating,
    theme,
    sourceText,
    projectTitle,
    setHtml,
    setTheme,
    appendMessage,
    updateLastAssistantMessage,
    setGenerating,
    setSourceText,
    setProjectTitle,
    reset,
  } = useEditorStore();

  const [input, setInput] = useState("");
  const [showSourceInput, setShowSourceInput] = useState(isNew && !currentHtml);
  const [isComposing, setIsComposing] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(isNew ? null : paramId);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load existing project
  useEffect(() => {
    if (isNew) {
      if (!sourceText) reset();
      return;
    }
    const project = getProject(paramId);
    if (project) {
      setHtml(project.currentHtml);
      setTheme(project.theme);
      setSourceText(project.sourceText);
      setProjectTitle(project.title);
      setVersions(project.versions);
      if (project.versions.length > 0) {
        setCurrentVersionId(project.versions[project.versions.length - 1].id);
      }
      setShowSourceInput(!project.currentHtml);
    }
  }, [paramId, isNew, reset, setHtml, setTheme, setSourceText, setProjectTitle]);

  const autoGenRef = useRef(false);
  useEffect(() => {
    if (isNew && sourceText && !currentHtml && !isGenerating && !autoGenRef.current) {
      autoGenRef.current = true;
      setShowSourceInput(false);
      handleGenerate();
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createMessage = useCallback(
    (role: "user" | "assistant", content: string) => ({
      id: crypto.randomUUID(),
      projectId: projectId || "new",
      role,
      content,
      tokensUsed: 0,
      createdAt: new Date().toISOString(),
    }),
    [projectId]
  );

  const ensureProject = useCallback((): string => {
    if (projectId) return projectId;
    const title = sourceText.slice(0, 20).replace(/\n/g, " ") || "未命名演示";
    const project = createProject({ title, theme, sourceText });
    setProjectId(project.id);
    setProjectTitle(title);
    router.replace(`/editor/${project.id}`, { scroll: false });
    return project.id;
  }, [projectId, sourceText, theme, router, setProjectTitle]);

  const saveVersion = useCallback(
    (pid: string, html: string, label: string) => {
      const v = addVersion(pid, html, label);
      const sc = countSlides(html);
      updateProject(pid, { slideCount: sc });
      setVersions((prev) => [...prev, v]);
      setCurrentVersionId(v.id);
    },
    []
  );

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    updateLastAssistantMessage("已停止生成");
    setGenerating(false);
  };

  const handleGenerate = async () => {
    if (!sourceText.trim()) return;
    setShowSourceInput(false);
    setGenerating(true);

    const ac = new AbortController();
    abortRef.current = ac;

    appendMessage(
      createMessage(
        "user",
        `基于以下内容生成 PPT：\n${sourceText.slice(0, 200)}${sourceText.length > 200 ? "..." : ""}`
      )
    );
    appendMessage(createMessage("assistant", "正在分析内容并生成演示文稿..."));

    try {
      const res = await fetch("/api/projects/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceText, theme }),
        signal: ac.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "生成失败");
      }

      await consumeSSE(
        res,
        () => {
          updateLastAssistantMessage("正在生成中...");
        },
        (html) => {
          setHtml(html);
          const pid = ensureProject();
          saveVersion(pid, html, "初次生成");
          consumeCredits(10, "生成演示文稿", projectTitle || "未命名演示", "generate");
          updateLastAssistantMessage(
            "演示文稿已生成，你可以在右侧预览。试试输入修改指令，如「换成蓝色主题」「加一页关于团队的」。"
          );
          setGenerating(false);
          abortRef.current = null;
        },
        (error) => {
          updateLastAssistantMessage(`生成失败：${error}`);
          setGenerating(false);
          abortRef.current = null;
        },
        ac.signal
      );
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      updateLastAssistantMessage(`生成失败：${e instanceof Error ? e.message : "未知错误"}`);
      setGenerating(false);
      abortRef.current = null;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return;
    const userMsg = input.trim();
    setInput("");

    appendMessage(createMessage("user", userMsg));
    appendMessage(createMessage("assistant", "正在修改..."));
    setGenerating(true);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const chatHistory = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/projects/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentHtml,
          instruction: userMsg,
          chatHistory,
        }),
        signal: ac.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "修改失败");
      }

      await consumeSSE(
        res,
        () => {
          updateLastAssistantMessage("正在修改中...");
        },
        (html) => {
          setHtml(html);
          if (projectId) {
            saveVersion(projectId, html, `修改：${userMsg.slice(0, 30)}`);
            consumeCredits(5, `编辑：${userMsg.slice(0, 20)}`, projectTitle || "未命名演示", "edit");
          }
          updateLastAssistantMessage(`已完成修改：${userMsg}`);
          setGenerating(false);
          abortRef.current = null;
        },
        (error) => {
          updateLastAssistantMessage(`修改失败：${error}`);
          setGenerating(false);
          abortRef.current = null;
        },
        ac.signal
      );
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      updateLastAssistantMessage(`修改失败：${e instanceof Error ? e.message : "未知错误"}`);
      setGenerating(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDownload = async () => {
    if (!currentHtml) return;
    await exportPptx(currentHtml);
  };

  const handleVersionSelect = (v: ProjectVersion) => {
    setHtml(v.html);
    setCurrentVersionId(v.id);
    appendMessage(
      createMessage("assistant", `已切换到版本：${v.label}。你可以基于此版本继续编辑。`)
    );
  };

  const previewHtml = currentHtml;

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-medium">{projectTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Version history button */}
          {versions.length > 0 && (
            <button
              onClick={() => setShowVersions(!showVersions)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 border rounded-lg transition-colors ${
                showVersions
                  ? "border-accent bg-accent/5 text-accent"
                  : "border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {versions.length} 个版本
            </button>
          )}

          <button
            onClick={() => {
              if (!currentHtml) return;
              const w = window.open("", "_blank");
              if (w) {
                w.document.open();
                w.document.write(currentHtml);
                w.document.close();
              }
            }}
            disabled={!currentHtml}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
            title="全屏预览"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
            全屏预览
          </button>

          <button
            onClick={handleDownload}
            disabled={!currentHtml}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载 PPT
          </button>

          <UserCenter />
        </div>
      </header>

      {/* Main split pane */}
      <div className="split-pane flex-1 relative">
        {/* Version history panel */}
        {showVersions && (
          <VersionPanel
            versions={versions}
            currentVersionId={currentVersionId}
            onSelect={handleVersionSelect}
            onClose={() => setShowVersions(false)}
          />
        )}

        {/* Chat Panel */}
        <div className="chat-panel">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {showSourceInput ? (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-1">粘贴你的内容</h3>
                  <p className="text-xs text-muted-foreground">
                    将文本素材粘贴到下方，AI 会自动分析并生成演示文稿
                  </p>
                </div>
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="在这里粘贴你的文本内容..."
                  className="w-full h-48 px-3 py-2.5 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  autoFocus
                />
                <button
                  onClick={handleGenerate}
                  disabled={!sourceText.trim() || isGenerating}
                  className="w-full py-2.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isGenerating ? "生成中..." : "开始生成"}
                </button>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl rounded-bl-sm px-3.5 py-2.5">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {!showSourceInput && (
            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  placeholder="输入修改指令，如：换成蓝色主题..."
                  rows={1}
                  className="flex-1 px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent max-h-32"
                  style={{ minHeight: "40px" }}
                />
                {isGenerating ? (
                  <button
                    onClick={handleStop}
                    className="shrink-0 w-9 h-9 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="停止生成"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                    className="shrink-0 w-9 h-9 flex items-center justify-center bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        <div className="preview-panel bg-muted relative">
          {previewHtml ? (
            <>
              <iframe
                ref={iframeRef}
                key={previewHtml.length}
                srcDoc={previewHtml}
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-full border-none"
                title="PPT Preview"
              />
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-20 hover:opacity-80 transition-opacity duration-300">
                <button
                  onClick={() => {
                    const doc = iframeRef.current?.contentWindow?.document;
                    const spread = doc?.querySelector('.magazine-spread') || doc?.documentElement;
                    spread?.scrollBy({ left: -(spread.clientWidth || 800), behavior: 'smooth' });
                  }}
                  className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const doc = iframeRef.current?.contentWindow?.document;
                    const spread = doc?.querySelector('.magazine-spread') || doc?.documentElement;
                    spread?.scrollBy({ left: spread.clientWidth || 800, behavior: 'smooth' });
                  }}
                  className="w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm hover:bg-black/80 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-border/50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  在左侧粘贴内容后，预览将在此显示
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
