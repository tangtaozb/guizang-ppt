"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation, type Locale } from "@/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const choose = (l: Locale) => {
    setLocale(l);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg border border-border hover:bg-muted transition-colors ${
          compact ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-xs"
        }`}
        title={t("language.switchTo")}
      >
        <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a14.5 14.5 0 010 18M12 3a14.5 14.5 0 000 18" />
        </svg>
        <span className="text-muted-foreground">
          {locale === "zh" ? t("language.zh") : t("language.en")}
        </span>
        <svg className="w-3 h-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-32 bg-white rounded-lg border border-border shadow-lg z-50 py-1">
          {(["zh", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => choose(l)}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                locale === l ? "bg-accent/10 text-accent font-medium" : "hover:bg-muted"
              }`}
            >
              {l === "zh" ? t("language.zh") : t("language.en")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
