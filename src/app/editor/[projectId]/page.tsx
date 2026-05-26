"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEditorStore } from "@/stores/editor";
import type { ProjectVersion } from "@/types";
import { exportPptx } from "@/lib/export-pptx";
import { countSlides } from "@/lib/storage";
import {
  dbCreateProject,
  dbGetProject,
  dbUpdateProject,
  dbSaveAfterGeneration,
  dbConsumeCredits,
} from "@/lib/db";
import { UserCenter } from "@/components/user-center";

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

// Module-level: tracks project IDs just created via ensureProject().
// Survives component remounts (unlike useRef) but clears on page refresh.
// Fixes race: router.replace remounts component → loading effect fires →
// DB has empty currentHtml (saveVersion not done yet) → showSourceInput flips to true.
const _justCreatedIds = new Set<string>();

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
    setMessages,
    appendMessage,
    updateLastAssistantMessage,
    setGenerating,
    setSourceText,
    setProjectTitle,
    reset,
  } = useEditorStore();

  const [input, setInput] = useState("");
  // Default to NOT showing source input — only show when we confirm there's nothing
  // to generate. This avoids a flash of the source-input view during dashboard→editor
  // navigation race conditions.
  const [showSourceInput, setShowSourceInput] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(isNew ? null : paramId);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const justCreatedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // For isNew, decide whether to show source input AFTER a brief grace period
  // to let zustand store sync from dashboard navigation. Avoids race where
  // sourceText is read as empty before dashboard's setSourceText() propagates.
  useEffect(() => {
    if (!isNew) return;
    const timer = setTimeout(() => {
      const s = useEditorStore.getState();
      // Only show source input if truly nothing is queued up
      if (!s.sourceText && !s.currentHtml && !s.isGenerating) {
        setShowSourceInput(true);
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [isNew]);

  // Load existing project from Supabase
  useEffect(() => {
    if (isNew) {
      // Don't reset — dashboard already manages state. Calling reset() here
      // would clobber the sourceText that dashboard just set.
      return;
    }
    // Skip loading if we just created this project via ensureProject() —
    // local state is already correct, and loading now would race with saveVersion().
    // Check both: ref (survives re-renders) and module-level set (survives remounts).
    if (justCreatedRef.current || _justCreatedIds.has(paramId)) {
      justCreatedRef.current = false;
      _justCreatedIds.delete(paramId);
      setShowSourceInput(false);
      return;
    }
    setGenerating(false); // reset stale generating state from previous visit
    let cancelled = false;
    dbGetProject(paramId).then((project) => {
      if (cancelled) return;
      setHtml(project.currentHtml);
      setTheme(project.theme);
      setSourceText(project.sourceText);
      setProjectTitle(project.title);
      setVersions(project.versions);
      if (project.messages && project.messages.length > 0) {
        setMessages(project.messages);
      }
      if (project.versions.length > 0) {
        setCurrentVersionId(project.versions[project.versions.length - 1].id);
      }
      setShowSourceInput(!project.currentHtml);
    }).catch(() => {
      // Fallback: project not found in Supabase
      setShowSourceInput(true);
    });
    return () => { cancelled = true; };
  }, [paramId, isNew, reset, setHtml, setTheme, setSourceText, setProjectTitle, setMessages]);

  const autoGenRef = useRef(false);
  useEffect(() => {
    if (isNew && sourceText && !currentHtml && !isGenerating && !autoGenRef.current) {
      autoGenRef.current = true;
      setShowSourceInput(false);
      // All messages go through the unified Agent endpoint
      // The Agent will decide whether to generate PPT or chat
      handleSendMessage(sourceText);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Messages are now saved to Supabase via dbSaveAfterGeneration in saveVersion()

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

  const ensureProject = useCallback(async (): Promise<string> => {
    if (projectId) return projectId;
    // Read latest sourceText from store (not from stale closure)
    const latestSourceText = useEditorStore.getState().sourceText || sourceText;
    const title = latestSourceText.slice(0, 20).replace(/\n/g, " ") || "未命名演示";
    const project = await dbCreateProject({ title, theme, sourceText: latestSourceText });
    setProjectId(project.id);
    setProjectTitle(title);
    // NOTE: do NOT router.replace here — caller must await saveVersion() first,
    // then call navigateToProject() to prevent the loading effect from seeing empty HTML.
    return project.id;
  }, [projectId, sourceText, theme, setProjectTitle]);

  const navigateToProject = useCallback((pid: string) => {
    justCreatedRef.current = true;
    _justCreatedIds.add(pid);
    router.replace(`/editor/${pid}`, { scroll: false });
  }, [router]);

  const saveVersion = useCallback(
    async (pid: string, html: string, label: string) => {
      const storeMessages = useEditorStore.getState().messages;
      const sc = countSlides(html);
      try {
        const result = await dbSaveAfterGeneration(pid, {
          html,
          label,
          messages: storeMessages.map((m) => ({ role: m.role, content: m.content })),
          slideCount: sc,
        });
        setVersions((prev) => [...prev, result.version]);
        setCurrentVersionId(result.version.id);
      } catch (e) {
        console.error("保存版本失败:", e);
      }
    },
    []
  );

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    updateLastAssistantMessage("已停止生成");
    setGenerating(false);
  };

  const handleSendMessage = async (directMsg?: string) => {
    const userMsg = directMsg || input.trim();
    if (!userMsg || isGenerating) return;
    if (!directMsg) setInput("");

    appendMessage(createMessage("user", userMsg));
    setGenerating(true);

    const ac = new AbortController();
    abortRef.current = ac;

    const chatHistory = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/projects/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          currentHtml,
          chatHistory,
          theme,
          sourceText,
        }),
        signal: ac.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "处理失败");
      }

      // Consume unified Agent SSE stream
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = "";
      let mode: "edit" | "generate" | "chat" | null = null;
      let fullHtml = "";
      let pendingAssistantMsg = false;

      while (true) {
        if (ac.signal.aborted) { reader.cancel(); return; }
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split("\n");
        sseBuffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(trimmed.slice(6));

            if (data.type === "mode") {
              mode = data.mode;
              if (mode === "chat") {
                // Chat mode — we'll get the full reply in "done" event
              } else if (mode === "generate") {
                appendMessage(createMessage("assistant", "正在分析内容并生成演示文稿..."));
                pendingAssistantMsg = true;
                if (!sourceText) setSourceText(userMsg);
              } else if (mode === "edit") {
                appendMessage(createMessage("assistant", "正在修改..."));
                pendingAssistantMsg = true;
              }
            } else if (data.type === "delta") {
              if (mode === "generate" || mode === "edit") {
                if (pendingAssistantMsg) {
                  updateLastAssistantMessage(mode === "generate" ? "正在生成中..." : "正在修改中...");
                }
              }
            } else if (data.type === "complete" && data.html) {
              // HTML generation/edit complete
              fullHtml = data.html;
              setHtml(fullHtml);

              if (mode === "generate") {
                // Update message BEFORE saveVersion — saveVersion reads messages from store
                updateLastAssistantMessage(
                  "演示文稿已生成，你可以在右侧预览。试试输入修改指令，如「换成蓝色主题」「加一页关于团队的」。"
                );
                const pid = await ensureProject();
                // Await saveVersion so DB has the HTML BEFORE we navigate.
                // This prevents the loading effect from fetching empty currentHtml.
                await saveVersion(pid, fullHtml, "初次生成");
                navigateToProject(pid);
                dbConsumeCredits({
                  amount: 10,
                  description: "生成演示文稿",
                  projectTitle: projectTitle || "未命名演示",
                  type: "generate",
                }).catch(() => {});
              } else if (mode === "edit") {
                // Update message BEFORE saveVersion
                updateLastAssistantMessage(`已完成修改：${userMsg}`);
                if (projectId) {
                  await saveVersion(projectId, fullHtml, `修改：${userMsg.slice(0, 30)}`);
                  dbConsumeCredits({
                    amount: 5,
                    description: `编辑：${userMsg.slice(0, 20)}`,
                    projectTitle: projectTitle || "未命名演示",
                    type: "edit",
                  }).catch(() => {});
                }
              }
              setGenerating(false);
              abortRef.current = null;
            } else if (data.type === "done") {
              // Chat response complete
              if (mode === "chat" && data.message) {
                appendMessage(createMessage("assistant", data.message));
                // Persist chat messages
                if (projectId) {
                  const allMsgs = useEditorStore.getState().messages;
                  const sc = currentHtml ? countSlides(currentHtml) : 0;
                  dbSaveAfterGeneration(projectId, {
                    html: currentHtml || "",
                    label: `对话：${userMsg.slice(0, 20)}`,
                    messages: allMsgs.map((m) => ({ role: m.role, content: m.content })),
                    slideCount: sc,
                  }).then((result) => {
                    setVersions((prev) => [...prev, result.version]);
                    setCurrentVersionId(result.version.id);
                  }).catch(() => {});
                }
              }
              setGenerating(false);
              abortRef.current = null;
            } else if (data.type === "error") {
              updateLastAssistantMessage(`失败：${data.message || "未知错误"}`);
              setGenerating(false);
              abortRef.current = null;
            }
          } catch { /* skip malformed */ }
        }
      }

      // Ensure generating state is cleared
      if (useEditorStore.getState().isGenerating) {
        setGenerating(false);
        abortRef.current = null;
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      const errorMsg = e instanceof Error ? e.message : "未知错误";
      appendMessage(createMessage("assistant", `处理失败：${errorMsg}`));
      setGenerating(false);
      abortRef.current = null;
    }
  };

  const handleGenerate = async () => {
    if (!sourceText.trim()) return;
    setShowSourceInput(false);
    // Delegate to handleSendMessage — Agent will route to generate_ppt
    const briefMsg =
      sourceText.length > 100
        ? sourceText.slice(0, 100) + "..."
        : sourceText;
    handleSendMessage(briefMsg);
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
          {editingTitle ? (
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => {
                const newTitle = titleDraft.trim() || projectTitle;
                setProjectTitle(newTitle);
                setEditingTitle(false);
                if (projectId && newTitle !== projectTitle) {
                  dbUpdateProject(projectId, { title: newTitle }).catch(() => {});
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") { setEditingTitle(false); }
              }}
              className="text-sm font-medium px-1.5 py-0.5 border border-accent rounded focus:outline-none focus:ring-1 focus:ring-accent w-48"
              autoFocus
            />
          ) : (
            <span
              className="text-sm font-medium cursor-pointer hover:text-accent transition-colors"
              onClick={() => { setTitleDraft(projectTitle); setEditingTitle(true); }}
              title="点击重命名"
            >
              {projectTitle}
            </span>
          )}
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
                    className="shrink-0 w-9 h-9 flex items-center justify-center bg-foreground/60 text-background rounded-lg hover:bg-foreground/80 transition-colors"
                    title="停止生成"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendMessage()}
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
