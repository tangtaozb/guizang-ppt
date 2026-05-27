"use client";

import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/i18n";

interface PlanDef {
  id: "starter" | "pro" | "ultra";
  nameKey: string;
  price: string;
  popular?: boolean;
  featureKeys: string[];
}

const plans: PlanDef[] = [
  {
    id: "starter",
    nameKey: "pricing.starter",
    price: "$9.9",
    featureKeys: [
      "pricing.starterFeature1",
      "pricing.starterFeature2",
      "pricing.starterFeature3",
      "pricing.starterFeature4",
      "pricing.starterFeature5",
    ],
  },
  {
    id: "pro",
    nameKey: "pricing.pro",
    price: "$19.9",
    popular: true,
    featureKeys: [
      "pricing.proFeature1",
      "pricing.proFeature2",
      "pricing.proFeature3",
      "pricing.proFeature4",
      "pricing.proFeature5",
      "pricing.proFeature6",
    ],
  },
  {
    id: "ultra",
    nameKey: "pricing.ultra",
    price: "$49.9",
    featureKeys: [
      "pricing.ultraFeature1",
      "pricing.ultraFeature2",
      "pricing.ultraFeature3",
      "pricing.ultraFeature4",
      "pricing.ultraFeature5",
      "pricing.ultraFeature6",
      "pricing.ultraFeature7",
    ],
  },
];

export default function PricingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Artify<span className="text-accent">Slide</span>
          </Link>
          <div className="flex items-center gap-3">
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

      <main className="flex-1 py-20 px-6 bg-muted">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">{t("pricing.pageTitle")}</h1>
            <p className="text-muted-foreground text-lg">{t("pricing.pageSubtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl border p-8 flex flex-col ${
                  plan.popular
                    ? "border-accent shadow-lg shadow-accent/10 scale-[1.02]"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                    {t("pricing.popular")}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{t(plan.nameKey)}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{t("pricing.perMonth")}</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-3 mb-8">
                  {plan.featureKeys.map((fk) => (
                    <li key={fk} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 mt-0.5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {t(fk)}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`w-full py-2.5 rounded-lg text-sm font-medium text-center transition-all ${
                    plan.popular
                      ? "bg-accent text-accent-foreground hover:opacity-90"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  {t("pricing.subscribe")}
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-10 text-center text-xs text-muted-foreground max-w-2xl mx-auto">
            {t("pricing.creditExplain")}
          </p>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link href="/terms" className="underline hover:text-foreground mx-1">{t("pricing.termsLink")}</Link>
            ·
            <Link href="/privacy" className="underline hover:text-foreground mx-1">{t("pricing.privacyLink")}</Link>
            ·
            <Link href="/refund" className="underline hover:text-foreground mx-1">{t("pricing.refundLink")}</Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
