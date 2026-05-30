"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { dbGetUser, dbUpdateNickname, dbGetCredits } from "@/lib/db";
import type { DbUserProfile } from "@/lib/db";
import type { CreditRecord } from "@/types";
import { createClient } from "@/lib/supabase-browser";
import { useTranslation } from "@/i18n";

function planLabelKey(plan: string): string {
  const map: Record<string, string> = {
    free: "userCenter.freePlan",
    per_use: "userCenter.starterPlan",
    starter: "userCenter.starterPlan",
    monthly: "userCenter.proPlan",
    pro: "userCenter.proPlan",
    ultra: "userCenter.ultraPlan",
  };
  return map[plan] || "userCenter.freePlan";
}

const PAGE_SIZE = 8;

function CreditHistoryModal({ onClose }: { onClose: () => void }) {
  const { t, locale } = useTranslation();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [records, setRecords] = useState<CreditRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    setLoading(true);
    dbGetCredits(page, PAGE_SIZE)
      .then((data) => {
        setRecords(data.records);
        setTotalPages(data.totalPages);
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [page]);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-base">{t("userCenter.history")}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t("common.loading")}</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t("userCenter.noHistory")}</p>
          ) : (
            <div className="space-y-0.5">
              {records.map((r) => (
                <div key={r.id} className="flex items-start justify-between py-2.5 border-b border-border/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.description}</p>
                    {r.projectTitle && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{r.projectTitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.createdAt)}</p>
                  </div>
                  <span
                    className={`text-sm font-mono font-medium shrink-0 ml-3 ${
                      r.amount > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {r.amount > 0 ? "+" : ""}{r.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t("common.back")}
            </button>
            <span className="text-xs text-muted-foreground">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t("common.next")}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// `compact` (editor nav) renders the avatar only — keeps editor layout untouched.
// Default (dashboard) renders the full right cluster: credits pill + upgrade CTA + avatar.
export function UserCenter({ compact = false }: { compact?: boolean } = {}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [profile, setProfile] = useState<DbUserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  useEffect(() => {
    dbGetUser().then(setProfile).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    dbGetUser().then(setProfile).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 10,
      right: window.innerWidth - rect.right,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSaveNickname = async () => {
    if (nickname.trim()) {
      const updated = await dbUpdateNickname(nickname.trim());
      setProfile(updated);
    }
    setEditing(false);
  };

  if (!profile) return null;

  const initial = profile.nickname.charAt(0).toUpperCase();
  const isFree = profile.plan === "free";
  const used = Math.max(0, profile.usedThisMonth || 0);
  const quota = Math.max(1, profile.monthlyQuota || 30);
  const usagePct = Math.min(100, Math.round((used / quota) * 100));

  return (
    <>
      {/* Credits pill — full right cluster only */}
      {!compact && (
        <div className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-full border border-[#e7e3da] bg-white text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span className="font-mono font-medium">{profile.credits}</span>
          <span className="text-[#736b5e]">{t("userCenter.creditsUnit") || "积分"}</span>
        </div>
      )}

      {/* Upgrade CTA — non-members only, with soft shine animation */}
      {!compact && isFree && (
        <button
          onClick={() => router.push("/pricing")}
          className="ui-shine flex items-center gap-1.5 h-9 pl-3 pr-3.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold ring-1 ring-accent/30 shadow-[0_2px_12px_-2px_rgba(167,47,36,0.55)] hover:shadow-[0_4px_18px_-2px_rgba(167,47,36,0.7)] transition-shadow"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          {t("userCenter.upgradeCta")}
        </button>
      )}

      {/* Avatar */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className={`w-9 h-9 rounded-full bg-accent/10 ring-1 ring-accent/15 flex items-center justify-center text-xs font-semibold text-accent hover:bg-accent/15 transition-colors ${compact ? "w-8 h-8" : ""}`}
      >
        {initial}
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-72 bg-white rounded-2xl border border-[#e7e3da] shadow-[0_18px_50px_-12px_rgba(20,15,8,0.28)] z-[9999] overflow-hidden"
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
        >
          {/* Profile header */}
          <div className="px-4 py-4 border-b border-[#e7e3da]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-sm font-semibold text-accent">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                {editing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveNickname()}
                      className="flex-1 px-2 py-0.5 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent"
                      autoFocus
                    />
                    <button onClick={handleSaveNickname} className="text-xs text-accent hover:underline">
                      {t("common.save")}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold truncate">{profile.nickname}</span>
                    <button
                      onClick={() => { setEditing(true); setNickname(profile.nickname); }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{profile.email || profile.phone}</p>
              </div>
              <span className="text-[9px] font-mono tracking-[0.18em] uppercase text-muted-foreground px-2 py-0.5 rounded-full bg-[#efece4] whitespace-nowrap">
                {t(planLabelKey(profile.plan))}
              </span>
            </div>

            {/* Credits & monthly usage */}
            <div className="mt-3.5 flex items-end justify-between">
              <div>
                <div className="text-[9px] font-mono tracking-[0.18em] uppercase text-muted-foreground/80">
                  {t("userCenter.creditsRemainingLabel")}
                </div>
                <div className="font-mono text-2xl font-semibold leading-none mt-1">{profile.credits}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-mono tracking-[0.18em] uppercase text-muted-foreground/80">
                  {t("userCenter.creditsUsedThisMonthLabel")}
                </div>
                <div className="font-mono text-sm text-muted-foreground leading-none mt-1.5">{used}</div>
              </div>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-[#efece4] overflow-hidden">
              <div
                className="h-full bg-accent/70 rounded-full transition-[width] duration-300"
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>

          {/* Upgrade banner — strong purchase nudge for free users */}
          {isFree && (
            <button
              onClick={() => { router.push("/pricing"); setOpen(false); }}
              className="group w-full text-left px-4 py-3.5 bg-gradient-to-br from-accent to-[#86241b] text-accent-foreground hover:from-[#b8362a] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="ui-pulse-dot inline-block w-2 h-2 rounded-full bg-white" />
                  <span className="text-[13px] font-semibold">{t("userCenter.upgradeBannerTitle")}</span>
                </div>
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
              <p className="text-[11px] text-white/75 mt-1">{t("userCenter.upgradeBannerDesc")}</p>
            </button>
          )}

          {/* Actions */}
          <div className="py-1.5">
            <button
              onClick={() => { setShowHistory(true); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-[#efece4] transition-colors"
            >
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t("userCenter.history")}
            </button>
            {!isFree && (
              <button
                onClick={() => router.push("/pricing")}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-[#efece4] transition-colors"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
                {t("userCenter.upgrade")}
              </button>
            )}
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/login");
                router.refresh();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left text-accent hover:bg-accent/[0.06] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              {t("common.logout")}
            </button>
          </div>
        </div>,
        document.body
      )}

      {showHistory && (
        <CreditHistoryModal
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}
