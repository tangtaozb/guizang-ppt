// POST /api/subscription/upgrade — 升级（或降级）已有订阅
// Creem 会按订阅剩余天数自动抵扣，立即扣差额
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";
import { upgradeSubscription, PRODUCT_ID_BY_PLAN, type PlanId } from "@/lib/creem";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = (await req.json()) as { plan?: string };
  const plan = body.plan as PlanId | undefined;

  if (!plan || !["starter", "pro", "ultra"].includes(plan)) {
    return NextResponse.json({ error: "无效的套餐" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("creem_subscription_id, plan, subscription_status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.creem_subscription_id) {
    return NextResponse.json({ error: "你还没有进行中的订阅，请用「立即订阅」" }, { status: 400 });
  }

  if (profile.plan === plan) {
    return NextResponse.json({ error: "已经是该套餐" }, { status: 400 });
  }

  if (profile.subscription_status && profile.subscription_status !== "active") {
    return NextResponse.json(
      { error: `当前订阅状态为 ${profile.subscription_status}，无法升级` },
      { status: 400 }
    );
  }

  const newProductId = PRODUCT_ID_BY_PLAN[plan];
  if (!newProductId) {
    return NextResponse.json({ error: `套餐 ${plan} 未配置 product_id` }, { status: 500 });
  }

  try {
    const result = await upgradeSubscription({
      subscriptionId: profile.creem_subscription_id,
      newProductId,
    });
    // 实际的 plan + credits 更新由 Creem 发回的 subscription.update / subscription.paid webhook 完成
    return NextResponse.json({ ok: true, subscription: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "升级失败";
    console.error("[creem upgrade]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
