"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { zh, type Dict } from "./zh";
import { en } from "./en";

export type Locale = "zh" | "en";

const DICTS: Record<Locale, Dict> = { zh, en };
const STORAGE_KEY = "oneppt_locale";

interface LocaleStore {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored === "zh" || stored === "en") return stored;
  const lang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || "";
  return lang.toLowerCase().startsWith("zh") ? "zh" : "en";
}

// SSR-safe default. The provider sets the real value on mount.
export const useLocaleStore = create<LocaleStore>((set) => ({
  locale: "zh",
  setLocale: (l) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l === "zh" ? "zh-CN" : "en";
    }
    set({ locale: l });
  },
}));

/** Initialize locale from storage/browser on first client render. Mount once in layout. */
export function useLocaleInit() {
  const setLocale = useLocaleStore((s) => s.setLocale);
  useEffect(() => {
    const initial = detectInitialLocale();
    setLocale(initial);
  }, [setLocale]);
}

/**
 * Translation hook. Returns t(key, vars?) where key is dot-path like "dashboard.heroTitle".
 * Vars are interpolated as {name} placeholders.
 */
export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const dict = DICTS[locale];

  function t(key: string, vars?: Record<string, string | number>): string {
    const parts = key.split(".");
    let cur: unknown = dict;
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[p];
      } else {
        return key; // missing key — return path for visibility
      }
    }
    if (typeof cur !== "string") return key;
    if (!vars) return cur;
    return cur.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
  }

  return { t, locale, setLocale: useLocaleStore.getState().setLocale };
}
