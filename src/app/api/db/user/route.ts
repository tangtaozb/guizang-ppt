import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";
import { CREDITS_BY_PLAN } from "@/lib/creem";

// Free users have no monthly reset — they get welcome credits and that's it.
// We still need a divisor for the usage progress bar; use the welcome grant.
const FREE_WELCOME_CREDITS = 30;

function getMonthlyQuota(plan: string): number {
  if (plan === "starter" || plan === "pro" || plan === "ultra") {
    return CREDITS_BY_PLAN[plan];
  }
  return FREE_WELCOME_CREDITS;
}

function startOfMonthISO(): string {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function getUsedThisMonth(userId: string): Promise<number> {
  const { data } = await supabase
    .from("credit_records")
    .select("amount")
    .eq("user_id", userId)
    .lt("amount", 0)
    .gte("created_at", startOfMonthISO());
  return (data || []).reduce(
    (s: number, r: { amount: number }) => s + Math.abs(r.amount),
    0,
  );
}

// GET /api/db/user — current profile + this-month usage for the header dropdown
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const [profileRes, usedThisMonth] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    getUsedThisMonth(user.id),
  ]);

  if (profileRes.error || !profileRes.data) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const data = profileRes.data;

  return NextResponse.json({
    id: data.id,
    email: user.email || "",
    phone: data.phone,
    nickname: data.nickname,
    plan: data.plan,
    credits: data.credits,
    createdAt: data.created_at,
    usedThisMonth,
    monthlyQuota: getMonthlyQuota(data.plan),
  });
}

// PATCH /api/db/user — update nickname
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { nickname } = (await req.json()) as { nickname: string };

  const { data, error } = await supabase
    .from("profiles")
    .update({ nickname })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const usedThisMonth = await getUsedThisMonth(user.id);

  return NextResponse.json({
    id: data.id,
    email: user.email || "",
    phone: data.phone,
    nickname: data.nickname,
    plan: data.plan,
    credits: data.credits,
    createdAt: data.created_at,
    usedThisMonth,
    monthlyQuota: getMonthlyQuota(data.plan),
  });
}
