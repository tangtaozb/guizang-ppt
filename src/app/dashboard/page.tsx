"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/stores/editor";
import { UserCenter } from "@/components/user-center";
import { LanguageSwitcher } from "@/components/language-switcher";
import { FileUploadButton } from "@/components/file-upload-button";
import { useTranslation } from "@/i18n";
import { THEMES, THEMES_A, THEMES_B } from "@/types";
import type { ThemeId, Theme } from "@/types";
import { dbGetProjects, dbDeleteProject } from "@/lib/db";
import type { DbProjectListItem } from "@/lib/db";

// Map theme id → i18n key for name + description
function themeI18nKey(id: ThemeId): { name: string; desc: string } {
  const map: Record<ThemeId, { name: string; desc: string }> = {
    "ink-classic": { name: "themes.inkClassic", desc: "themes.inkClassicDesc" },
    indigo: { name: "themes.indigo", desc: "themes.indigoDesc" },
    forest: { name: "themes.forest", desc: "themes.forestDesc" },
    kraft: { name: "themes.kraft", desc: "themes.kraftDesc" },
    dune: { name: "themes.dune", desc: "themes.duneDesc" },
    ikb: { name: "themes.ikb", desc: "themes.ikbDesc" },
    lemon: { name: "themes.lemon", desc: "themes.lemonDesc" },
    "lemon-green": { name: "themes.lemonGreen", desc: "themes.lemonGreenDesc" },
    "safety-orange": { name: "themes.safetyOrange", desc: "themes.safetyOrangeDesc" },
  };
  return map[id];
}

function getCardColors(themeId: string): { bg: string; text: string } {
  const t = THEMES.find((th) => th.id === themeId);
  if (!t) return { bg: "#0a0a0b", text: "#f1efea" };
  if (t.style === "b" && t.accent) {
    return { bg: t.accent, text: t.accentOn || "#ffffff" };
  }
  return { bg: t.ink, text: t.paper };
}

function getThemeDot(t: Theme): string {
  if (t.style === "b" && t.accent) return t.accent;
  return t.ink;
}

// Six scenario cards for the empty state — gives first-time users a one-click start.
const EXAMPLE_PROMPTS = [
  {
    id: "product",
    labelKey: "dashboard.exampleProductLabel",
    descKey: "dashboard.exampleProductDesc",
    promptKey: "dashboard.exampleProductPrompt",
    iconPath:
      "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  },
  {
    id: "analysis",
    labelKey: "dashboard.exampleAnalysisLabel",
    descKey: "dashboard.exampleAnalysisDesc",
    promptKey: "dashboard.exampleAnalysisPrompt",
    iconPath:
      "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
  {
    id: "report",
    labelKey: "dashboard.exampleReportLabel",
    descKey: "dashboard.exampleReportDesc",
    promptKey: "dashboard.exampleReportPrompt",
    iconPath:
      "M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 3h16.5M12 16.5v3.75m-3.75 0h7.5M8.25 12l2.25-2.25 1.5 1.5 3.75-3.75",
  },
  {
    id: "reading",
    labelKey: "dashboard.exampleReadingLabel",
    descKey: "dashboard.exampleReadingDesc",
    promptKey: "dashboard.exampleReadingPrompt",
    iconPath:
      "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
  },
  {
    id: "course",
    labelKey: "dashboard.exampleCourseLabel",
    descKey: "dashboard.exampleCourseDesc",
    promptKey: "dashboard.exampleCoursePrompt",
    iconPath:
      "M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
  },
  {
    id: "review",
    labelKey: "dashboard.exampleReviewLabel",
    descKey: "dashboard.exampleReviewDesc",
    promptKey: "dashboard.exampleReviewPrompt",
    iconPath:
      "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z",
  },
] as const;

function ScenarioGrid({ onUsePrompt }: { onUsePrompt: (text: string) => void }) {
  const { t } = useTranslation();
  return (
    <section className="w-full max-w-3xl mt-12 mb-28">
      <p className="text-center text-[12.5px] text-[#736b5e]/90 mb-6">
        {t("dashboard.emptyTryThese")}
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {EXAMPLE_PROMPTS.map((ex) => (
          <button
            key={ex.id}
            onClick={() => onUsePrompt(t(ex.promptKey))}
            className="ui-lift group text-left rounded-2xl border border-[#e7e3da] bg-white p-5 hover:border-accent/45 hover:shadow-[0_12px_32px_-14px_rgba(20,15,8,0.18)]"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="w-10 h-10 rounded-xl bg-accent/[0.08] text-accent flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={ex.iconPath} />
                </svg>
              </span>
              <svg
                className="w-4 h-4 text-transparent group-hover:text-accent group-hover:translate-x-0.5 transition-all"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <div className="text-[14.5px] font-semibold">{t(ex.labelKey)}</div>
            <div className="text-[12px] text-[#736b5e] mt-1 leading-relaxed">{t(ex.descKey)}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
        <h3 className="font-semibold text-base mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

function AllProjectsModal({
  projects,
  onSelect,
  onDelete,
  onClose,
}: {
  projects: DbProjectListItem[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const { t, locale } = useTranslation();
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[75vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-base">{t("dashboard.allProjectsTitle")}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {projects.map((p) => {
              const tc = getCardColors(p.theme);
              return (
                <div
                  key={p.id}
                  className="group rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow relative cursor-pointer"
                  onClick={() => { onSelect(p.id); onClose(); }}
                >
                  <div
                    className="h-28 flex items-center justify-center relative"
                    style={{ backgroundColor: tc.bg }}
                  >
                    <span
                      className="text-sm font-serif font-bold px-4 text-center leading-snug"
                      style={{ color: tc.text }}
                    >
                      {p.title}
                    </span>
                    {p.slideCount > 0 && (
                      <span
                        className="absolute bottom-2 right-3 text-[10px] font-mono opacity-50"
                        style={{ color: tc.text }}
                      >
                        {p.slideCount} {t("dashboard.pageCount")}
                      </span>
                    )}
                  </div>
                  <div className="p-3 bg-white">
                    <h3 className="font-medium text-xs truncate">{p.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(p.updatedAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/30 text-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 hover:text-white"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [projects, setProjects] = useState<DbProjectListItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [inputText, setInputText] = useState("");
  const [filesText, setFilesText] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<ThemeId | "auto">("auto");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setSourceText, setTheme, reset } = useEditorStore();

  useEffect(() => {
    dbGetProjects()
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setLoaded(true));
  }, []);

  const handleUsePrompt = (text: string) => {
    setInputText(text);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleSubmit = () => {
    const combined = [inputText.trim(), filesText.trim()].filter(Boolean).join("\n\n");
    if (!combined) return;
    reset();
    setSourceText(combined);
    if (selectedTheme === "auto") {
      const allIds = THEMES.map((t) => t.id);
      const picked = allIds[Math.floor(Math.random() * allIds.length)];
      setTheme(picked);
    } else {
      setTheme(selectedTheme);
    }
    router.push("/editor/new");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleDelete = async (id: string) => {
    await dbDeleteProject(id);
    const updated = await dbGetProjects();
    setProjects(updated);
    setDeleteTarget(null);
  };

  const handleSelect = (id: string) => {
    router.push(`/editor/${id}`);
  };

  const displayProjects = projects.slice(0, 5);
  const hasMore = projects.length > 5;
  const canSubmit = inputText.trim().length > 0 || filesText.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f3ee]">
      {/* Nav — sticky, paper-tone */}
      <nav className="sticky top-0 z-40 border-b border-[#e7e3da] bg-[#f5f3ee]/85 backdrop-blur-md">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 sm:px-8 h-16">
          <div className="flex items-center gap-3">
            <span className="text-[19px] font-semibold tracking-tight">
              Artify<span className="text-accent">Slide</span>
            </span>
            <span className="hidden sm:inline font-mono text-[10px] tracking-[0.18em] uppercase text-[#736b5e]/70 pl-3 ml-1 border-l border-[#e7e3da]">
              {t("dashboard.workspaceLabel")}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <LanguageSwitcher compact />
            <UserCenter />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-6">
        {/* Hero */}
        <section className="w-full max-w-2xl pt-20 sm:pt-24 pb-4">
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-[#736b5e]">
              {t("dashboard.heroKicker")}
            </span>
          </div>
          <h1
            className="text-center font-semibold tracking-tight"
            style={{
              fontFamily: '"Noto Serif SC", "Instrument Serif", serif',
              fontSize: "clamp(34px, 5.4vw, 52px)",
              lineHeight: 1.05,
            }}
          >
            {t("dashboard.heroTitle")}
          </h1>
          <p className="text-center text-[#736b5e] text-[15px] mt-4 mb-9">
            {t("dashboard.heroSubtitle")}
          </p>

          {/* Composer */}
          <div className="bg-white rounded-2xl border border-[#e7e3da] shadow-[0_2px_16px_-6px_rgba(20,15,8,0.12)] focus-within:border-accent/40 focus-within:shadow-[0_6px_26px_-8px_rgba(167,47,36,0.22)] transition-all">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("dashboard.inputPlaceholder")}
              rows={3}
              className="w-full px-5 pt-4 pb-2 bg-transparent border-none text-[15px] leading-relaxed resize-none focus:outline-none placeholder:text-[#a39a8b]"
            />
            <div className="flex items-center justify-between px-3.5 pb-3.5 pt-1">
              {/* Style selector — pops UPWARD to avoid covering the scenario cards below */}
              <div className="relative">
                <button
                  onClick={() => setShowThemePicker(!showThemePicker)}
                  className="flex items-center gap-2 h-9 pl-2 pr-2.5 rounded-lg border border-[#e7e3da] text-xs text-[#736b5e] hover:bg-[#efece4] transition-colors"
                >
                  {selectedTheme === "auto" ? (
                    <span
                      className="w-4 h-4 rounded-md ring-1 ring-black/5"
                      style={{ background: "linear-gradient(135deg,#0a0a0b,#0a1f3d,#2a1e13)" }}
                    />
                  ) : (
                    <span
                      className="w-4 h-4 rounded-md ring-1 ring-black/5"
                      style={{ backgroundColor: getThemeDot(THEMES.find((th) => th.id === selectedTheme)!) }}
                    />
                  )}
                  <span className="font-medium text-foreground">
                    {selectedTheme === "auto"
                      ? t("dashboard.autoStyle")
                      : t(themeI18nKey(selectedTheme as ThemeId).name)}
                  </span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showThemePicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowThemePicker(false)} />
                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-white rounded-xl border border-[#e7e3da] shadow-[0_18px_50px_-12px_rgba(20,15,8,0.28)] z-50 p-1.5 max-h-[420px] overflow-y-auto">
                      <button
                        onClick={() => { setSelectedTheme("auto"); setShowThemePicker(false); }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                          selectedTheme === "auto" ? "bg-accent/10 text-accent font-medium" : "hover:bg-[#efece4]"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-md ring-1 ring-black/5 shrink-0"
                          style={{ background: "linear-gradient(135deg,#0a0a0b,#0a1f3d,#2a1e13)" }}
                        />
                        <span className="font-medium">{t("dashboard.autoStyleFull")}</span>
                        <span className="ml-auto font-mono text-[9px] tracking-[0.18em] uppercase text-accent">
                          {t("dashboard.autoStylePillRecommend")}
                        </span>
                      </button>
                      <div className="my-1 h-px bg-[#e7e3da]" />
                      <div className="px-2.5 pt-1.5 pb-1">
                        <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-muted-foreground/70">
                          {t("dashboard.styleASection")}
                        </span>
                      </div>
                      {THEMES_A.map((th) => (
                        <button
                          key={th.id}
                          onClick={() => { setSelectedTheme(th.id); setShowThemePicker(false); }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                            selectedTheme === th.id ? "bg-accent/10 text-accent font-medium" : "hover:bg-[#efece4]"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-md ring-1 ring-black/5 shrink-0" style={{ backgroundColor: th.ink }} />
                          <span className="font-medium">{t(themeI18nKey(th.id).name)}</span>
                          <span className="ml-auto font-mono text-[9px] text-muted-foreground/70">{th.nameEn}</span>
                        </button>
                      ))}
                      <div className="px-2.5 pt-2 pb-1 border-t border-[#e7e3da] mt-1">
                        <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-muted-foreground/70">
                          {t("dashboard.styleBSection")}
                        </span>
                      </div>
                      {THEMES_B.map((th) => (
                        <button
                          key={th.id}
                          onClick={() => { setSelectedTheme(th.id); setShowThemePicker(false); }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                            selectedTheme === th.id ? "bg-accent/10 text-accent font-medium" : "hover:bg-[#efece4]"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-md ring-1 ring-black/5 shrink-0" style={{ backgroundColor: th.accent }} />
                          <span className="font-medium">{t(themeI18nKey(th.id).name)}</span>
                          <span className="ml-auto font-mono text-[9px] text-muted-foreground/70">{th.nameEn}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <FileUploadButton
                  variant="compact"
                  onFilesChange={setFilesText}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`flex items-center gap-1.5 h-9 px-4 bg-accent text-accent-foreground rounded-lg text-sm font-medium transition-opacity ${
                    canSubmit ? "hover:opacity-90" : "opacity-35 pointer-events-none"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t("dashboard.generate")}
                </button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-[#736b5e]/70">
            {t("dashboard.uploadHintShort")}
          </p>
        </section>

        {/* Empty state — scenario cards only when the user has no projects yet */}
        {loaded && projects.length === 0 && (
          <ScenarioGrid onUsePrompt={handleUsePrompt} />
        )}

        {/* User's PPTs row */}
        {loaded && projects.length > 0 && (
          <div className="w-full max-w-5xl mt-12 mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">{t("dashboard.myProjects")}</h2>
              {hasMore && (
                <button
                  onClick={() => setShowAll(true)}
                  className="text-xs text-accent hover:underline font-medium"
                >
                  {t("dashboard.seeAll")} ({projects.length})
                </button>
              )}
            </div>
            <div className="grid grid-cols-5 gap-3">
              {displayProjects.map((p) => {
                const tc = getCardColors(p.theme);
                return (
                  <div
                    key={p.id}
                    className="group rounded-xl border border-[#e7e3da] overflow-hidden hover:shadow-md transition-shadow relative cursor-pointer bg-white"
                    onClick={() => handleSelect(p.id)}
                  >
                    <div
                      className="aspect-[16/10] flex items-center justify-center relative"
                      style={{ backgroundColor: tc.bg }}
                    >
                      <span
                        className="text-xs font-serif font-bold px-3 text-center leading-snug line-clamp-2"
                        style={{ color: tc.text }}
                      >
                        {p.title}
                      </span>
                      {p.slideCount > 0 && (
                        <span
                          className="absolute bottom-1.5 right-2 text-[10px] font-mono opacity-50"
                          style={{ color: tc.text }}
                        >
                          {p.slideCount} {t("dashboard.pageCount")}
                        </span>
                      )}
                    </div>
                    <div className="px-3 py-2.5">
                      <h3 className="font-medium text-xs truncate group-hover:text-accent transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(p.updatedAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(p.id); }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-black/30 text-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50 hover:text-white"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmModal
          title={t("dashboard.deleteTitle")}
          message={t("dashboard.deleteMessage")}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* All projects modal */}
      {showAll && (
        <AllProjectsModal
          projects={projects}
          onSelect={handleSelect}
          onDelete={(id) => { setDeleteTarget(id); setShowAll(false); }}
          onClose={() => setShowAll(false)}
        />
      )}
    </div>
  );
}
