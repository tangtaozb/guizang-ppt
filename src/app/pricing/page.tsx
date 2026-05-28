"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/i18n";
import { dbGetUser, type DbUserProfile } from "@/lib/db";

type PlanId = "starter" | "pro" | "ultra";

interface PlanDef {
  id: PlanId;
  nameKey: string;
  priceUSD: number;        // 数字版用于计算抵扣
  monthlyCredits: number;  // 月度积分配额（用于估算剩余比例）
  popular?: boolean;
  featureKeys: string[];
}

const PLAN_ORDER: Record<string, number> = { free: 0, starter: 1, pro: 2, ultra: 3 };

const plans: PlanDef[] = [
  {
    id: "starter",
    nameKey: "pricing.starter",
    priceUSD: 9.9,
    monthlyCredits: 4500,
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
    priceUSD: 19.9,
    monthlyCredits: 10000,
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
    priceUSD: 49.9,
    monthlyCredits: 25000,
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

// 按当前 plan 剩余积分比例估算可抵扣金额
function estimateDiscount(user: DbUserProfile | null): number {
  if (!user || user.plan === "free") return 0;
  const currentPlan = plans.find((p) => p.id === user.plan);
  if (!currentPlan) return 0;
  const ratio = Math.min(1, Math.max(0, user.credits / currentPlan.monthlyCredits));
  return currentPlan.priceUSD * ratio;
}

type CardAction = "subscribe" | "current" | "upgrade" | "downgrade";

function cardActionFor(planId: PlanId, userPlan: string): CardAction {
  if (!userPlan || userPlan === "free") return "subscribe";
  if (userPlan === planId) return "current";
  return PLAN_ORDER[planId] > PLAN_ORDER[userPlan] ? "upgrade" : "downgrade";
}

export default function PricingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<DbUserProfile | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    dbGetUser()
      .then(setUser)
      .catch(() => setUser(null)); // 未登录 fallback 为 free
  }, []);

  const discount = estimateDiscount(user);

  async function handleSubscribe(planId: PlanId) {
    setErrMsg(null);
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      if (res.status === 401) {
        router.push(`/login?next=/pricing`);
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "创建 Checkout 失败");
      window.location.href = json.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrMsg(msg);
      setLoadingPlan(null);
    }
  }

  async function handleUpgrade(planId: PlanId) {
    setErrMsg(null);
    setSuccessMsg(null);
    setLoadingPlan(planId);
    const planName = t(plans.find((p) => p.id === planId)?.nameKey || "");
    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "升级失败");

      // Creem 用已绑定卡按剩余天数自动扣差额，无需重新输卡
      // 等 webhook 写库（一般 1-3 秒）后再刷新用户数据
      await new Promise((r) => setTimeout(r, 2500));
      const updated = await dbGetUser();
      setUser(updated);
      setSuccessMsg(
        t("pricing.upgradeSuccess").replace("{plan}", planName)
      );
      setLoadingPlan(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrMsg(msg);
      setLoadingPlan(null);
    }
  }

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
            {plans.map((plan) => {
              const action = cardActionFor(plan.id, user?.plan || "free");
              const isUpgrade = action === "upgrade";
              const effectivePrice = isUpgrade ? Math.max(0, plan.priceUSD - discount) : plan.priceUSD;
              const showDiscount = isUpgrade && discount > 0.01;

              return (
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
                      <span className="text-4xl font-bold">
                        ${effectivePrice.toFixed(effectivePrice % 1 === 0 ? 0 : 2)}
                      </span>
                      <span className="text-sm text-muted-foreground">{t("pricing.perMonth")}</span>
                    </div>
                    {showDiscount && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        <span className="line-through">${plan.priceUSD}</span>
                        <span className="text-accent ml-2">
                          {t("pricing.discountOff")} ${discount.toFixed(2)}
                        </span>
                      </p>
                    )}
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
                  <PlanButton
                    action={action}
                    isPopular={!!plan.popular}
                    label={
                      loadingPlan === plan.id
                        ? t("pricing.upgrading")
                        : action === "current"
                        ? t("pricing.subscribed")
                        : action === "upgrade"
                        ? t("pricing.upgrade")
                        : action === "downgrade"
                        ? t("pricing.downgrade")
                        : t("pricing.subscribe")
                    }
                    disabled={loadingPlan !== null || action === "current" || action === "downgrade"}
                    onClick={() => {
                      if (action === "upgrade") handleUpgrade(plan.id);
                      else if (action === "subscribe") handleSubscribe(plan.id);
                    }}
                  />
                </div>
              );
            })}
          </div>

          {errMsg && (
            <p className="mt-6 text-center text-sm text-red-500">{errMsg}</p>
          )}
          {successMsg && (
            <p className="mt-6 text-center text-sm text-green-600">{successMsg}</p>
          )}

          {discount > 0.01 && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              {t("pricing.discountNote")}
            </p>
          )}

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

function PlanButton({
  action,
  isPopular,
  label,
  disabled,
  onClick,
}: {
  action: CardAction;
  isPopular: boolean;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const base = "w-full py-2.5 rounded-lg text-sm font-medium text-center transition-all disabled:cursor-not-allowed";
  let style: string;
  if (action === "current") {
    style = "border border-accent text-accent bg-accent/5 disabled:opacity-100";
  } else if (action === "downgrade") {
    style = "border border-border text-muted-foreground disabled:opacity-60";
  } else if (isPopular) {
    style = "bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50";
  } else {
    style = "border border-border hover:bg-muted disabled:opacity-50";
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${style}`}>
      {label}
    </button>
  );
}
