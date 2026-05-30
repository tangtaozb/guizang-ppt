"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n";
import { formatBlogDate, type Lang } from "@/lib/blog-format";

// 文章页 chrome（客户端）：面包屑、日期/阅读时长、译文互链、文末 CTA —— 随站点语言切换。

export function BlogBackLink() {
  const { t } = useTranslation();
  return (
    <Link href="/blog" className="hover:text-accent transition-colors">
      {t("blog.backToList")}
    </Link>
  );
}

export function BlogDateline({
  date,
  minutes,
}: {
  date: string;
  minutes: number;
}) {
  const { t, locale } = useTranslation();
  return (
    <>
      {formatBlogDate(date, locale)} · {t("blog.readingTime", { min: minutes })}
    </>
  );
}

/** 译文互链：targetLang 是另一语言版本的语言。 */
export function BlogAltLink({
  altSlug,
  targetLang,
}: {
  altSlug: string;
  targetLang: Lang;
}) {
  const { t } = useTranslation();
  return (
    <Link
      href={`/blog/${altSlug}`}
      className="font-mono text-[11.5px] tracking-[0.04em] text-accent hover:opacity-70 transition-opacity"
    >
      {targetLang === "zh" ? t("blog.altToZh") : t("blog.altToEn")}
    </Link>
  );
}

export function BlogEndCTA() {
  const { t } = useTranslation();
  return (
    <div className="mt-20 border-t border-border pt-10">
      <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {t("blog.endKicker")}
      </div>
      <div className="mt-4 text-[22px] sm:text-[26px] font-medium leading-[1.3] tracking-[-0.01em] max-w-[560px]">
        {t("blog.endTitle")}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-md bg-foreground px-5 text-[14.5px] font-medium text-white hover:opacity-90 transition-opacity"
        >
          {t("blog.ctaOpen")}
        </Link>
        <Link
          href="/pricing"
          className="inline-flex h-11 items-center rounded-md border border-border px-4.5 text-[14.5px] font-medium hover:bg-muted transition-colors"
        >
          {t("blog.ctaPricing")}
        </Link>
        <Link
          href="/blog"
          className="inline-flex h-11 items-center rounded-md border border-border px-4.5 text-[14.5px] font-medium hover:bg-muted transition-colors"
        >
          {t("blog.ctaMore")}
        </Link>
      </div>
    </div>
  );
}
