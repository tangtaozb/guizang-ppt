"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/stores/editor";
import { UserCenter } from "@/components/user-center";
import { LanguageSwitcher } from "@/components/language-switcher";
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

const EXAMPLE_TEMPLATES: { id: string; titleZh: string; titleEn: string; tagZh: string; tagEn: string; color: string }[] = [
  { id: "ex1", titleZh: "年度商业计划书", titleEn: "Annual business plan", tagZh: "商业", tagEn: "Business", color: "#0a1f3d" },
  { id: "ex2", titleZh: "产品发布会演示", titleEn: "Product launch deck", tagZh: "产品", tagEn: "Product", color: "#1a2e1f" },
  { id: "ex3", titleZh: "团队季度复盘", titleEn: "Quarterly team review", tagZh: "管理", tagEn: "Mgmt", color: "#2a1e13" },
  { id: "ex4", titleZh: "技术架构分享", titleEn: "Tech architecture talk", tagZh: "技术", tagEn: "Tech", color: "#0a0a0b" },
  { id: "ex5", titleZh: "品牌故事叙述", titleEn: "Brand storytelling", tagZh: "品牌", tagEn: "Brand", color: "#1f1a14" },
];

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
  // Lock body scroll while modal is open
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
  const [selectedTheme, setSelectedTheme] = useState<ThemeId | "auto">("auto");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const { setSourceText, setTheme, reset } = useEditorStore();

  useEffect(() => {
    dbGetProjects()
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  const handleSubmit = () => {
    if (!inputText.trim()) return;
    reset();
    setSourceText(inputText.trim());
    if (selectedTheme === "auto") {
      // Randomly pick a theme for variety (instead of always ink-classic)
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

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      {/* Nav */}
      <nav className="border-b border-border/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 h-14">
          <span className="text-lg font-bold tracking-tight">
            One<span className="text-accent">PPT</span>
          </span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <UserCenter />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-6">
        {/* Hero input area */}
        <div className="w-full max-w-2xl pt-16 pb-10">
          <h1 className="text-2xl font-bold text-center mb-8">
            {t("dashboard.heroTitle")}
          </h1>
          <div className="bg-white rounded-2xl border border-border shadow-sm focus-within:ring-2 focus-within:ring-accent/20 focus-within:border-accent">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("dashboard.inputPlaceholder")}
              rows={3}
              className="w-full px-4 py-3.5 border-none rounded-t-2xl text-sm resize-none focus:outline-none bg-transparent placeholder:text-muted-foreground/60"
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="relative">
                <button
                  onClick={() => setShowThemePicker(!showThemePicker)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-xs"
                >
                  {selectedTheme === "auto" ? (
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-800 via-blue-900 to-amber-900 border border-border/50" />
                  ) : (
                    <span
                      className="w-4 h-4 rounded-full border border-border/50"
                      style={{ backgroundColor: getThemeDot(THEMES.find((th) => th.id === selectedTheme)!) }}
                    />
                  )}
                  <span className="text-muted-foreground">
                    {selectedTheme === "auto"
                      ? t("dashboard.autoStyle")
                      : t(themeI18nKey(selectedTheme as ThemeId).name)}
                  </span>
                  <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showThemePicker && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowThemePicker(false)} />
                    <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl border border-border shadow-lg z-20 py-1 max-h-[420px] overflow-y-auto">
                      <button
                        onClick={() => { setSelectedTheme("auto"); setShowThemePicker(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                          selectedTheme === "auto" ? "bg-accent/10 text-accent font-medium" : "hover:bg-muted"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-800 via-blue-900 to-amber-900 shrink-0" />
                        <div>
                          <div className="text-xs">{t("dashboard.autoStyleFull")}</div>
                          <div className="text-[10px] text-muted-foreground/60 mt-0.5">{t("dashboard.autoStyleDesc")}</div>
                        </div>
                      </button>
                      <div className="px-3 pt-2.5 pb-1">
                        <span className="text-[10px] font-medium text-muted-foreground/70 tracking-wider uppercase">{t("dashboard.styleASection")}</span>
                      </div>
                      {THEMES_A.map((th) => (
                        <button
                          key={th.id}
                          onClick={() => { setSelectedTheme(th.id); setShowThemePicker(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                            selectedTheme === th.id ? "bg-accent/10 text-accent font-medium" : "hover:bg-muted"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full shrink-0 border border-border/30" style={{ backgroundColor: th.ink }} />
                          <div>
                            <div className="text-xs">{t(themeI18nKey(th.id).name)}</div>
                            <div className="text-[10px] text-muted-foreground/60 mt-0.5">{t(themeI18nKey(th.id).desc)}</div>
                          </div>
                        </button>
                      ))}
                      <div className="px-3 pt-2.5 pb-1 border-t border-border/40 mt-1">
                        <span className="text-[10px] font-medium text-muted-foreground/70 tracking-wider uppercase">{t("dashboard.styleBSection")}</span>
                      </div>
                      {THEMES_B.map((th) => (
                        <button
                          key={th.id}
                          onClick={() => { setSelectedTheme(th.id); setShowThemePicker(false); }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                            selectedTheme === th.id ? "bg-accent/10 text-accent font-medium" : "hover:bg-muted"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full shrink-0 border border-border/30" style={{ backgroundColor: th.accent }} />
                          <div>
                            <div className="text-xs">{t(themeI18nKey(th.id).name)}</div>
                            <div className="text-[10px] text-muted-foreground/60 mt-0.5">{t(themeI18nKey(th.id).desc)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!inputText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-30"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t("dashboard.generate")}
              </button>
            </div>
          </div>
        </div>

        {/* User's PPTs row */}
        {projects.length > 0 && (
          <div className="w-full max-w-5xl mb-10">
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
                    className="group rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow relative cursor-pointer"
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
                    <div className="px-3 py-2.5 bg-white">
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

        {/* Example templates */}
        <div className="w-full max-w-5xl pb-16">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {projects.length > 0 ? t("dashboard.exampleTemplates") : t("dashboard.exampleTemplatesClick")}
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {EXAMPLE_TEMPLATES.map((ex) => {
              const title = locale === "zh" ? ex.titleZh : ex.titleEn;
              const tag = locale === "zh" ? ex.tagZh : ex.tagEn;
              return (
                <div
                  key={ex.id}
                  className="group rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div
                    className="aspect-[16/10] flex items-center justify-center relative"
                    style={{ backgroundColor: ex.color }}
                  >
                    <span className="text-xs font-serif font-bold px-3 text-center leading-snug text-white/90">
                      {title}
                    </span>
                    <span className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded bg-white/20 text-white/70 backdrop-blur-sm">
                      {tag}
                    </span>
                  </div>
                  <div className="px-3 py-2.5 bg-white">
                    <h3 className="font-medium text-xs truncate group-hover:text-accent transition-colors">
                      {title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-1">{t("dashboard.caseTemplate")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
