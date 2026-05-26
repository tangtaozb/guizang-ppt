"use client";

import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/i18n";

const demos = [
  { themeKey: "themes.inkClassic", color: "#0a0a0b", bg: "#f1efea" },
  { themeKey: "themes.indigo", color: "#0a1f3d", bg: "#f1f3f5" },
  { themeKey: "themes.forest", color: "#1a2e1f", bg: "#f5f1e8" },
  { themeKey: "themes.kraft", color: "#2a1e13", bg: "#eedfc7" },
  { themeKey: "themes.dune", color: "#1f1a14", bg: "#f0e6d2" },
];

export default function LandingPage() {
  const { t } = useTranslation();
  const features = [
    { icon: "✦", title: t("landing.feature1Title"), desc: t("landing.feature1Desc") },
    { icon: "⚡", title: t("landing.feature2Title"), desc: t("landing.feature2Desc") },
    { icon: "🎨", title: t("landing.feature3Title"), desc: t("landing.feature3Desc") },
    { icon: "💬", title: t("landing.feature4Title"), desc: t("landing.feature4Desc") },
    { icon: "↔", title: t("landing.feature5Title"), desc: t("landing.feature5Desc") },
    { icon: "📦", title: t("landing.feature6Title"), desc: t("landing.feature6Desc") },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link href="/" className="text-lg font-bold tracking-tight">
            One<span className="text-accent">PPT</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("common.pricing")}
            </Link>
            <LanguageSwitcher />
            <Link
              href="/login"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              {t("common.getStarted")}
            </Link>
          </div>
        </div>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 bg-gradient-to-b from-white to-muted">
        <div className="max-w-3xl text-center">
          <div className="inline-block mb-6 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">
            AI × Magazine × Presentation
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
            {t("landing.heroTitle")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            {t("landing.heroSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:opacity-90 transition-opacity"
            >
              {t("landing.ctaPrimary")}
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-8 py-3 border border-border rounded-lg text-base font-medium hover:bg-muted transition-colors"
            >
              {t("landing.ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{t("landing.sectionStylesTitle")}</h2>
          <p className="text-muted-foreground text-center mb-12">
            {t("landing.sectionStylesDesc")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {demos.map((d) => (
              <div
                key={d.themeKey}
                className="rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-32 flex items-end p-4"
                  style={{ backgroundColor: d.bg }}
                >
                  <span
                    className="text-2xl font-serif font-bold"
                    style={{ color: d.color }}
                  >
                    Aa
                  </span>
                </div>
                <div className="px-4 py-3 bg-white">
                  <p className="text-sm font-medium">{t(d.themeKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t("common.features")}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-6 border border-border hover:shadow-md transition-shadow"
              >
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t("landing.finalCtaTitle")}</h2>
          <p className="text-primary-foreground/70 mb-8">
            {t("landing.finalCtaDesc")}
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-white text-primary rounded-lg text-base font-medium hover:bg-white/90 transition-colors"
          >
            {t("landing.finalCtaButton")}
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
