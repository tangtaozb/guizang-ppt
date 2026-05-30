"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n";
import { formatBlogDate, type BlogPostMeta } from "@/lib/blog-format";

// 列表页正文（客户端）：随站点语言切换 chrome；按当前语言筛选文章，
// 当前语言没有文章时回退显示全部，并给非当前语言的文章打语言标签。

export function BlogIndexClient({ posts }: { posts: BlogPostMeta[] }) {
  const { t, locale } = useTranslation();

  const inLocale = posts.filter((p) => p.lang === locale);
  const display = inLocale.length > 0 ? inLocale : posts;

  return (
    <>
      <header className="mx-auto max-w-[1100px] px-6 sm:px-14 pt-16 sm:pt-24 pb-10">
        <div className="flex items-center gap-2.5 font-mono text-[11.5px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {t("blog.kicker")}
        </div>
        <h1 className="mt-6 text-[48px] sm:text-[72px] font-medium leading-[0.96] tracking-[-0.045em]">
          {t("blog.titleA")}{" "}
          <span className="font-serif text-muted-foreground">{t("blog.titleB")}</span>
        </h1>
        <p className="mt-6 max-w-[640px] text-[17px] leading-[1.6] text-neutral-700">
          {t("blog.lede")}
        </p>
      </header>

      <section className="mx-auto max-w-[1100px] px-6 sm:px-14 pb-24">
        {display.length === 0 ? (
          <div className="border-t border-border pt-10 text-neutral-500">
            {t("blog.empty")}
          </div>
        ) : (
          <ul className="divide-y divide-border border-t border-border">
            {display.map((p, i) => (
              <li key={p.slug} className="py-8 sm:py-10">
                <Link
                  href={`/blog/${p.slug}`}
                  className="group grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4 sm:gap-10 items-baseline"
                >
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground pt-2">
                    <div>
                      {String(i + 1).padStart(2, "0")} / {formatBlogDate(p.date, locale)}
                    </div>
                    <div className="mt-1 normal-case tracking-normal opacity-70">
                      {t("blog.readingTime", { min: p.readingMinutes })}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-[26px] sm:text-[34px] font-medium leading-[1.1] tracking-[-0.02em] group-hover:text-accent transition-colors">
                      {p.lang !== locale && (
                        <span className="mr-2 align-middle inline-block rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                          {p.lang === "zh" ? t("blog.badgeZh") : t("blog.badgeEn")}
                        </span>
                      )}
                      {p.title}
                    </h2>
                    <p className="mt-3 max-w-[720px] text-[16px] leading-[1.6] text-neutral-700">
                      {p.dek ?? p.description}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
