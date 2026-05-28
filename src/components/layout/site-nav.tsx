"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { dbGetUser, type DbUserProfile } from "@/lib/db";

interface SiteNavProps {
  /** 高亮当前页对应的 nav 项 */
  active?: "themes" | "pricing";
}

/**
 * 顶部 nav — Landing / Pricing 共用。
 * 根据登录态显示不同的 CTA：
 * - 未登录：登录链接 + 「开始创作 →」跳 /login
 * - 已登录：隐藏登录链接 + 「开始创作 →」跳 /dashboard
 */
export function SiteNav({ active }: SiteNavProps) {
  const { t } = useTranslation();
  const [user, setUser] = useState<DbUserProfile | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    dbGetUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setChecked(true));
  }, []);

  const startHref = user ? "/dashboard" : "/login";

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 sm:px-14">
        <div className="flex items-center gap-6 sm:gap-12">
          <Link href="/" className="text-[18px] font-semibold tracking-[-0.02em]">
            Artify<span className="text-accent">Slide</span>
          </Link>
          <nav className="hidden sm:flex gap-7 text-[13.5px] text-muted-foreground">
            <Link
              href="/#themes"
              className={
                active === "themes"
                  ? "text-foreground"
                  : "hover:text-foreground transition-colors"
              }
            >
              {t("nav.themes")}
            </Link>
            <Link
              href="/pricing"
              className={
                active === "pricing"
                  ? "text-foreground"
                  : "hover:text-foreground transition-colors"
              }
            >
              {t("common.pricing")}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-[13.5px]">
          <LanguageSwitcher />
          {/* 已检测完成且未登录 → 显示登录链接；已登录 → 隐藏 */}
          {checked && !user && (
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("common.login")}
            </Link>
          )}
          <Link
            href={startHref}
            className="inline-flex h-8 items-center rounded-md bg-foreground px-3.5 text-[13px] font-medium text-white hover:opacity-90 transition-opacity"
          >
            {t("nav.startArrow")}
          </Link>
        </div>
      </div>
    </header>
  );
}
