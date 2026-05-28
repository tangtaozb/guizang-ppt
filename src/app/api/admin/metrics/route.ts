// GET /api/admin/metrics — admin-only business metrics aggregation
// Returns user / revenue / project / credit stats + 30-day trend.
// Guarded by ADMIN_EMAILS allowlist.

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLAN_PRICE_USD: Record<string, number> = {
  starter: 9.9,
  pro: 19.9,
  ultra: 49.9,
};

// 1 credit ≈ $0.001 API cost (per pricing model)
const COST_PER_CREDIT_USD = 0.001;

// Day key in UTC (YYYY-MM-DD)
function utcDayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function startOfTodayUTC(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const todayStart = startOfTodayUTC();
    const last7 = isoDaysAgo(7);
    const last30 = isoDaysAgo(30);

    // ── Users
    const [
      { count: totalUsers },
      { count: todayUsers },
      { count: last7Users },
      { data: planRows },
      profilesForTrend,
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", last7),
      supabase.from("profiles").select("plan, credits"),
      supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", last30),
    ]);

    // Plan distribution
    const planDistribution: Record<string, number> = { free: 0, starter: 0, pro: 0, ultra: 0 };
    let totalCreditsHeld = 0;
    for (const row of planRows || []) {
      const p = (row.plan as string) || "free";
      planDistribution[p] = (planDistribution[p] || 0) + 1;
      totalCreditsHeld += (row.credits as number) || 0;
    }

    // MRR estimate
    let mrrUSD = 0;
    const revenueByPlan: Record<string, { count: number; mrrUSD: number }> = {};
    for (const [plan, count] of Object.entries(planDistribution)) {
      const price = PLAN_PRICE_USD[plan] || 0;
      const planMrr = price * count;
      mrrUSD += planMrr;
      if (price > 0) revenueByPlan[plan] = { count, mrrUSD: Number(planMrr.toFixed(2)) };
    }
    const paidUsers = (planDistribution.starter || 0) + (planDistribution.pro || 0) + (planDistribution.ultra || 0);

    // ── Projects
    const [
      { count: totalProjects },
      { count: todayProjects },
      { count: last7Projects },
      projectsForTrend,
    ] = await Promise.all([
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart),
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .gte("created_at", last7),
      supabase
        .from("projects")
        .select("created_at")
        .gte("created_at", last30),
    ]);

    // ── Credit usage (amount is negative for consumption)
    const [
      { data: allCredits },
      { data: todayCredits },
    ] = await Promise.all([
      supabase.from("credit_records").select("amount, type"),
      supabase
        .from("credit_records")
        .select("amount, type")
        .gte("created_at", todayStart),
    ]);

    const sumConsumed = (rows: { amount: number; type: string }[] | null) =>
      (rows || [])
        .filter((r) => r.type === "generate" || r.type === "edit")
        .reduce((acc, r) => acc + Math.abs(r.amount || 0), 0);

    const totalCreditsConsumed = sumConsumed(allCredits as { amount: number; type: string }[] | null);
    const todayCreditsConsumed = sumConsumed(todayCredits as { amount: number; type: string }[] | null);
    const estimatedAPICostUSD = Number((totalCreditsConsumed * COST_PER_CREDIT_USD).toFixed(2));

    // ── 30-day trend (group by UTC day)
    const dailyMap: Record<string, { newUsers: number; newProjects: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const key = utcDayKey(isoDaysAgo(i));
      dailyMap[key] = { newUsers: 0, newProjects: 0 };
    }
    for (const r of (profilesForTrend.data || []) as { created_at: string }[]) {
      const k = utcDayKey(r.created_at);
      if (dailyMap[k]) dailyMap[k].newUsers++;
    }
    for (const r of (projectsForTrend.data || []) as { created_at: string }[]) {
      const k = utcDayKey(r.created_at);
      if (dailyMap[k]) dailyMap[k].newProjects++;
    }
    const trend = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }));

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      users: {
        total: totalUsers ?? 0,
        today: todayUsers ?? 0,
        last7days: last7Users ?? 0,
        paid: paidUsers,
        conversionRate: totalUsers ? Number(((paidUsers / totalUsers) * 100).toFixed(2)) : 0,
        planDistribution,
        totalCreditsHeld,
      },
      revenue: {
        mrrUSD: Number(mrrUSD.toFixed(2)),
        byPlan: revenueByPlan,
      },
      projects: {
        total: totalProjects ?? 0,
        today: todayProjects ?? 0,
        last7days: last7Projects ?? 0,
      },
      credits: {
        totalConsumed: totalCreditsConsumed,
        todayConsumed: todayCreditsConsumed,
        estimatedAPICostUSD,
      },
      trend,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[admin/metrics] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
