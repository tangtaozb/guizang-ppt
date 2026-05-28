"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/i18n";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { THEMES, ThemeThumb } from "@/components/landing/theme-thumb";
import { dbGetUser, type DbUserProfile } from "@/lib/db";

export default function LandingPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<DbUserProfile | null>(null);

  useEffect(() => {
    dbGetUser()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const startHref = user ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen bg-white text-foreground font-sans">
      <SiteNav active="themes" />

      {/* ====== Hero ====== */}
      <section className="mx-auto max-w-[1440px] px-6 sm:px-14 pt-20 sm:pt-30 pb-20 sm:pb-24">
        <div className="flex items-center gap-2.5 font-mono text-[11.5px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {t("landingX.heroKicker")}
        </div>

        <h1 className="mt-6 max-w-[1180px] text-[48px] sm:text-[72px] lg:text-[104px] font-medium leading-[0.94] tracking-[-0.045em]">
          {t("landingX.heroTitle1")}
          <br />
          <span className="text-muted-foreground font-serif">{t("landingX.heroTitle2")}</span>
        </h1>

        <p className="mt-8 max-w-[620px] text-[17px] sm:text-[19px] leading-[1.55] text-neutral-700">
          {t("landingX.heroLede")}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href={startHref}
            className="inline-flex h-11 items-center rounded-lg bg-foreground px-5 sm:px-6 text-[15px] font-medium text-white hover:opacity-90 transition-opacity"
          >
            {t("landingX.ctaPrimary")}
          </Link>
          <a
            href="#themes"
            className="inline-flex h-11 items-center rounded-lg border border-border bg-white px-4.5 text-[15px] font-medium hover:bg-muted transition-colors"
          >
            {t("landingX.ctaSecondary")}
          </a>
        </div>
      </section>

      {/* ====== Theme grid ====== */}
      <section id="themes" className="mx-auto max-w-[1440px] px-6 sm:px-14 pb-24 pt-6">
        <div className="mb-6 flex items-baseline justify-between border-t border-border pt-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {t("landingX.themesKicker")}
            </div>
            <div className="mt-1.5 text-[22px] sm:text-[26px] font-medium tracking-[-0.02em]">
              {t("landingX.themesTitle")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEMES.map((th) => (
            <div key={th.id} className="flex flex-col gap-2.5">
              <div className="w-full">
                <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
                  <div className="absolute inset-0">
                    <ThemeThumb theme={th} width={428} />
                  </div>
                </div>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-[14px]">{th.zh}</span>
                <span className="font-mono text-[12.5px] uppercase tracking-[0.06em] text-muted-foreground">
                  {th.en}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====== 3 reasons ====== */}
      <section className="border-t border-border bg-muted py-18">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[240px_1fr] gap-10 lg:gap-14 px-6 sm:px-14">
          <div className="pt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {t("landingX.whyKicker")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-9">
            <FeatureCard
              n="01"
              title={t("landingX.why1Title")}
              body={t("landingX.why1Body")}
            />
            <FeatureCard
              n="02"
              title={t("landingX.why2Title")}
              body={t("landingX.why2Body")}
            />
            <FeatureCard
              n="03"
              title={t("landingX.why3Title")}
              body={t("landingX.why3Body")}
            />
          </div>
        </div>
      </section>

      {/* ====== Final CTA ====== */}
      <section className="border-t border-border py-24 sm:py-28 text-center px-6">
        <div className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-muted-foreground">
          {t("landingX.finalKicker")}
        </div>
        <h2 className="mt-6 text-[48px] sm:text-[60px] lg:text-[76px] font-medium leading-none tracking-[-0.04em]">
          {t("landingX.finalTitle1")}
          <br />
          <span className="font-serif text-muted-foreground">{t("landingX.finalTitle2")}</span>
        </h2>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href={startHref}
            className="inline-flex h-12 items-center rounded-lg bg-foreground px-6 sm:px-7 text-[15.5px] font-medium text-white hover:opacity-90 transition-opacity"
          >
            {t("nav.startArrow")}
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-12 items-center rounded-lg border border-border bg-white px-5 sm:px-6 text-[15.5px] font-medium hover:bg-muted transition-colors"
          >
            {t("common.pricing")}
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function FeatureCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-lg border border-border bg-white">
        <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground">/{n}</span>
      </div>
      <div className="mb-2.5 text-[19px] font-medium tracking-[-0.01em]">{title}</div>
      <div className="text-[14px] leading-[1.6] text-neutral-600">{body}</div>
    </div>
  );
}
