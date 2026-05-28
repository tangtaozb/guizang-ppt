"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/i18n";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { dbGetUser, type DbUserProfile } from "@/lib/db";

type PlanId = "starter" | "pro" | "ultra";
type CardAction = "subscribe" | "current" | "upgrade" | "downgrade";

interface PlanDef {
  id: PlanId;
  nameKey: string;
  taglineKey: string;
  badgeKey?: string;
  featured?: boolean;
  priceUSD: number;
  monthlyCredits: number;
  monthlyDecks: number;
  bulletKeys: string[];
}

const PLAN_ORDER: Record<string, number> = { free: 0, starter: 1, pro: 2, ultra: 3 };

const plans: PlanDef[] = [
  {
    id: "starter",
    nameKey: "pricing.starter",
    taglineKey: "pricingX.starterTagline",
    priceUSD: 9.9,
    monthlyCredits: 4500,
    monthlyDecks: 180,
    bulletKeys: [
      "pricingX.starterBullet1",
      "pricingX.starterBullet2",
      "pricingX.starterBullet3",
      "pricingX.starterBullet4",
      "pricingX.starterBullet5",
    ],
  },
  {
    id: "pro",
    nameKey: "pricing.pro",
    taglineKey: "pricingX.proTagline",
    badgeKey: "pricingX.proBadge",
    featured: true,
    priceUSD: 19.9,
    monthlyCredits: 10000,
    monthlyDecks: 400,
    bulletKeys: [
      "pricingX.proBullet1",
      "pricingX.proBullet2",
      "pricingX.proBullet3",
      "pricingX.proBullet4",
      "pricingX.proBullet5",
      "pricingX.proBullet6",
    ],
  },
  {
    id: "ultra",
    nameKey: "pricing.ultra",
    taglineKey: "pricingX.ultraTagline",
    priceUSD: 49.9,
    monthlyCredits: 25000,
    monthlyDecks: 1000,
    bulletKeys: [
      "pricingX.ultraBullet1",
      "pricingX.ultraBullet2",
      "pricingX.ultraBullet3",
      "pricingX.ultraBullet4",
      "pricingX.ultraBullet5",
    ],
  },
];

// 按剩余积分比例估算可抵扣金额
function estimateDiscount(user: DbUserProfile | null): number {
  if (!user || user.plan === "free") return 0;
  const cur = plans.find((p) => p.id === user.plan);
  if (!cur) return 0;
  const ratio = Math.min(1, Math.max(0, user.credits / cur.monthlyCredits));
  return cur.priceUSD * ratio;
}

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
      .catch(() => setUser(null));
  }, []);

  const discount = estimateDiscount(user);

  async function handleSubscribe(planId: PlanId) {
    setErrMsg(null);
    setSuccessMsg(null);
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
      // 等 webhook 写库
      await new Promise((r) => setTimeout(r, 2500));
      const updated = await dbGetUser();
      setUser(updated);
      setSuccessMsg(t("pricing.upgradeSuccess").replace("{plan}", planName));
      setLoadingPlan(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrMsg(msg);
      setLoadingPlan(null);
    }
  }

  return (
    <div className="min-h-screen bg-white text-foreground font-sans">
      <SiteNav active="pricing" />

      {/* ====== Hero ====== */}
      <section className="mx-auto max-w-[1440px] px-6 sm:px-14 pb-6 pt-20 sm:pt-24 text-center">
        <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {t("pricingX.kicker")}
        </div>
        <h1 className="text-[48px] sm:text-[64px] lg:text-[84px] font-medium leading-[0.95] tracking-[-0.04em]">
          {t("pricingX.title1")}
          <span className="font-serif text-muted-foreground">{t("pricingX.title2")}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[540px] text-[16px] sm:text-[18px] leading-[1.55] text-neutral-700">
          {t("pricingX.lede")}
        </p>
      </section>

      {/* ====== Plans ====== */}
      <section className="mx-auto max-w-[1440px] px-6 sm:px-14 pb-6 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-4">
          {plans.map((plan) => {
            const action = cardActionFor(plan.id, user?.plan || "free");
            const isUpgrade = action === "upgrade";
            const effectivePrice = isUpgrade
              ? Math.max(0, plan.priceUSD - discount)
              : plan.priceUSD;
            const showDiscount = isUpgrade && discount > 0.01;
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                action={action}
                effectivePrice={effectivePrice}
                showDiscount={showDiscount}
                discount={discount}
                t={t}
                loadingPlan={loadingPlan}
                onSubscribe={() => handleSubscribe(plan.id)}
                onUpgrade={() => handleUpgrade(plan.id)}
              />
            );
          })}
        </div>

        <div className="mt-5 text-center font-mono text-[11.5px] tracking-[0.06em] text-muted-foreground">
          {t("pricingX.cardsFootnote")}
        </div>

        {errMsg && <p className="mt-6 text-center text-sm text-red-500">{errMsg}</p>}
        {successMsg && <p className="mt-6 text-center text-sm text-green-600">{successMsg}</p>}
        {discount > 0.01 && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t("pricing.discountNote")}
          </p>
        )}
      </section>

      {/* ====== Credit calculator ====== */}
      <section className="mx-auto max-w-[1440px] px-6 sm:px-14 pb-6 pt-20">
        <div className="grid items-center gap-8 lg:gap-12 rounded-xl border border-border bg-muted p-8 lg:p-10 grid-cols-1 lg:grid-cols-[280px_1fr]">
          <div>
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {t("pricingX.calcKicker")}
            </div>
            <div className="text-[24px] sm:text-[28px] font-medium leading-[1.1] tracking-[-0.02em]">
              {t("pricingX.calcTitle1")}
              <br />
              <span className="font-serif text-muted-foreground">{t("pricingX.calcTitle2")}</span>
            </div>
            <div className="mt-3.5 text-[13.5px] leading-[1.55] text-muted-foreground">
              {t("pricingX.calcLede")}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plans.map((p) => (
              <CalcCard key={p.id} plan={p} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section className="mx-auto max-w-[1440px] px-6 sm:px-14 pb-24 pt-20">
        <div className="grid items-start gap-10 lg:gap-12 grid-cols-1 lg:grid-cols-[300px_1fr]">
          <div>
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {t("pricingX.faqKicker")}
            </div>
            <div className="text-[24px] sm:text-[28px] font-medium leading-[1.1] tracking-[-0.02em]">
              {t("pricingX.faqTitle1")}
              <br />
              <span className="font-serif text-muted-foreground">{t("pricingX.faqTitle2")}</span>
            </div>
          </div>
          <div className="flex flex-col border-t border-border">
            {(["expiry", "cancel", "reedit", "topup", "payment"] as const).map((k, i, arr) => (
              <FaqRow
                key={k}
                q={t(`pricingX.faq${k.charAt(0).toUpperCase()}${k.slice(1)}Q`)}
                a={t(`pricingX.faq${k.charAt(0).toUpperCase()}${k.slice(1)}A`)}
                last={i === arr.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/* ====== Subcomponents ====== */

function PlanCard({
  plan, action, effectivePrice, showDiscount, discount, t, loadingPlan, onSubscribe, onUpgrade,
}: {
  plan: PlanDef;
  action: CardAction;
  effectivePrice: number;
  showDiscount: boolean;
  discount: number;
  t: (k: string, vars?: Record<string, string | number>) => string;
  loadingPlan: string | null;
  onSubscribe: () => void;
  onUpgrade: () => void;
}) {
  const featured = !!plan.featured;
  const isLoading = loadingPlan === plan.id;
  const disabled = loadingPlan !== null || action === "current" || action === "downgrade";

  const ctaLabel = isLoading
    ? t("pricing.upgrading")
    : action === "current"
    ? t("pricing.subscribed")
    : action === "upgrade"
    ? `${t("pricing.upgrade")} →`
    : action === "downgrade"
    ? t("pricing.downgrade")
    : `${t("pricing.subscribe")} ${t(plan.nameKey)} →`;

  const onClick = () => {
    if (action === "upgrade") onUpgrade();
    else if (action === "subscribe") onSubscribe();
  };

  return (
    <div
      className={[
        "relative flex flex-col gap-5 rounded-xl p-7",
        featured
          ? "bg-foreground text-white shadow-[0_24px_56px_-28px_rgba(10,10,11,0.35)]"
          : "bg-white",
      ].join(" ")}
      style={{
        border: featured ? `1.5px solid var(--color-foreground)` : `1px solid var(--color-border)`,
      }}
    >
      {plan.badgeKey && featured && (
        <div className="absolute -top-3 left-7 rounded bg-accent px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-white">
          {t(plan.badgeKey)}
        </div>
      )}

      <div>
        <div className="flex items-baseline justify-between">
          <div className="text-[18px] font-semibold tracking-[-0.01em]">{t(plan.nameKey)}</div>
          <div
            className={
              "font-mono text-[11px] uppercase tracking-[0.12em] " +
              (featured ? "opacity-60" : "text-muted-foreground")
            }
          >
            {plan.id}
          </div>
        </div>
        <div
          className={
            "mt-1.5 text-[13px] leading-[1.4] " +
            (featured ? "opacity-75" : "text-muted-foreground")
          }
        >
          {t(plan.taglineKey)}
        </div>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[48px] font-medium leading-none tracking-[-0.04em]">
            ${effectivePrice.toFixed(effectivePrice % 1 === 0 ? 0 : 2)}
          </span>
          <span className={"text-[14px] " + (featured ? "opacity-75" : "text-muted-foreground")}>
            {t("pricing.perMonth")}
          </span>
        </div>
        {showDiscount && (
          <div
            className={
              "mt-1.5 font-mono text-[11px] tracking-[0.06em] " +
              (featured ? "opacity-60" : "text-muted-foreground")
            }
          >
            <span className="line-through">${plan.priceUSD}</span>
            <span className="ml-2 text-accent">
              {t("pricing.discountOff")} ${discount.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={[
          "h-11 rounded-lg text-[14px] font-medium transition-opacity disabled:cursor-not-allowed",
          action === "current"
            ? featured
              ? "bg-white/15 text-white"
              : "border border-accent text-accent bg-accent/5"
            : action === "downgrade"
            ? featured
              ? "bg-white/10 text-white/60"
              : "border border-border text-muted-foreground"
            : featured
            ? "bg-white text-foreground hover:opacity-90 disabled:opacity-60"
            : "bg-foreground text-white hover:opacity-90 disabled:opacity-60",
        ].join(" ")}
      >
        {ctaLabel}
      </button>

      <div
        className="flex flex-col gap-2.5 pt-4.5"
        style={{
          borderTop: featured
            ? "1px solid rgba(255,255,255,0.18)"
            : "1px solid var(--color-border)",
        }}
      >
        {plan.bulletKeys.map((k) => (
          <div
            key={k}
            className="flex items-start gap-2.5 text-[13.5px] leading-[1.45]"
          >
            <span
              className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full"
              style={{ background: featured ? "var(--color-accent)" : "var(--color-foreground)" }}
            />
            <span>{t(k)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalcCard({
  plan,
  t,
}: {
  plan: PlanDef;
  t: (k: string) => string;
}) {
  const featured = !!plan.featured;
  // 单 deck 价 = 月价 / (积分配额 / 25 积分一份)
  const each = (plan.priceUSD / (plan.monthlyCredits / 25)).toFixed(3);
  return (
    <div
      className="rounded-[10px] bg-white p-4.5"
      style={{
        border: featured
          ? `1.5px solid var(--color-foreground)`
          : `1px solid var(--color-border)`,
      }}
    >
      <div className="mb-2.5 flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        <span className="text-foreground">{t(plan.nameKey)}</span>
        {featured && <span className="text-accent">★</span>}
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-[32px] font-medium tracking-[-0.02em]">{plan.monthlyDecks}</span>
        <span className="text-[12.5px] text-muted-foreground">{t("pricingX.calcDeckPerMonth")}</span>
      </div>
      <div className="mt-2 text-[12.5px] leading-[1.5] text-muted-foreground">
        {plan.monthlyCredits.toLocaleString()} credits ·{" "}
        <span className="font-mono text-foreground">${each}</span>
        {t("pricingX.calcPerDeck")}
      </div>
    </div>
  );
}

function FaqRow({ q, a, last }: { q: string; a: string; last?: boolean }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 py-5"
      style={{ borderBottom: last ? "none" : "1px solid var(--color-border)" }}
    >
      <div className="text-[16px] font-medium tracking-[-0.005em]">{q}</div>
      <div className="text-[14px] leading-[1.6] text-neutral-600">{a}</div>
    </div>
  );
}
