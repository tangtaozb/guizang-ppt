"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { getUserProfile, updateUserNickname } from "@/lib/storage";
import type { UserProfile, CreditRecord } from "@/types";

const PLAN_LABELS: Record<string, string> = {
  free: "免费版",
  per_use: "按次付费",
  monthly: "月卡会员",
  yearly: "年卡会员",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PAGE_SIZE = 8;

function CreditHistoryModal({
  records,
  onClose,
}: {
  records: CreditRecord[];
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const paged = records.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return createPortal(
    <div
      className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-base">积分消耗记录</h3>
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
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">暂无记录</p>
          ) : (
            <div className="space-y-0.5">
              {paged.map((r) => (
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
              上一页
            </button>
            <span className="text-xs text-muted-foreground">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function UserCenter() {
  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfile(getUserProfile());
  }, []);

  useEffect(() => {
    if (!open) return;
    setProfile(getUserProfile());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSaveNickname = () => {
    if (nickname.trim()) {
      const updated = updateUserNickname(nickname.trim());
      setProfile(updated);
    }
    setEditing(false);
  };

  if (!profile) return null;

  const initial = profile.nickname.charAt(0).toUpperCase();

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
        >
          {initial}
        </button>

        {open && (
          <div className="absolute right-0 top-10 w-72 bg-white rounded-xl border border-border shadow-lg z-[60] overflow-hidden">
            {/* Profile header */}
            <div className="px-4 py-4 bg-gradient-to-br from-accent/5 to-accent/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-semibold text-accent">
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
                        保存
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
                  <p className="text-xs text-muted-foreground mt-0.5">{profile.phone}</p>
                </div>
              </div>
            </div>

            {/* Plan & Credits */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">当前套餐</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                  {PLAN_LABELS[profile.plan] || profile.plan}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">剩余积分</span>
                <span className="text-sm font-bold text-foreground">{profile.credits}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="py-1">
              <button
                onClick={() => { setShowHistory(true); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors"
              >
                <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                积分消耗记录
              </button>
            </div>
          </div>
        )}
      </div>

      {showHistory && (
        <CreditHistoryModal
          records={profile.creditHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}
