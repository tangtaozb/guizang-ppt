// POST /api/webhooks/creem — 接收 Creem webhook 事件
// Events: checkout.completed / subscription.active|paid|canceled|past_due|expired / refund.created
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  verifyWebhookSignature,
  PLAN_BY_PRODUCT_ID,
  CREDITS_BY_PLAN,
  type PlanId,
} from "@/lib/creem";

interface CreemEvent {
  id?: string;
  event_id?: string;
  type?: string;
  event_type?: string;
  data?: CreemEventData;
  object?: CreemEventData;
}

interface CreemEventData {
  id?: string;
  customer?: { id?: string; email?: string };
  product?: { id?: string };
  subscription?: { id?: string; status?: string; current_period_end?: string | number };
  metadata?: { user_id?: string; userId?: string };
  current_period_end?: string | number;
  status?: string;
}

export async function POST(req: NextRequest) {
  // 必须用 raw text 做签名验证（json() 会改变字节序）
  const rawBody = await req.text();
  const sig = req.headers.get("creem-signature");

  if (!verifyWebhookSignature(rawBody, sig)) {
    console.error("[creem webhook] signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: CreemEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventId = event.id || event.event_id || `${Date.now()}-${Math.random()}`;
  const eventType = event.type || event.event_type || "unknown";
  const data = event.data || event.object || {};

  // 幂等去重 —— Creem 失败会重试 4 次，避免积分重复发放
  const { data: existing } = await supabase
    .from("creem_webhook_events")
    .select("event_id")
    .eq("event_id", eventId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  try {
    await handleEvent(eventType, data);
    await supabase.from("creem_webhook_events").insert({
      event_id: eventId,
      event_type: eventType,
      payload: event as unknown as Record<string, unknown>,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[creem webhook] handler failed for ${eventType}:`, msg);
    // 返回 500 让 Creem 重试
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ───────────────────────────────────────────

async function handleEvent(eventType: string, data: CreemEventData) {
  const userId = data.metadata?.user_id || data.metadata?.userId;
  if (!userId) {
    console.warn(`[creem webhook] no user_id in metadata for ${eventType}`);
    return;
  }

  switch (eventType) {
    case "checkout.completed":
    case "subscription.active":
    case "subscription.paid": {
      // 1) 拿到产品 → 套餐
      const productId = data.product?.id;
      const plan = productId ? PLAN_BY_PRODUCT_ID[productId] : undefined;
      if (!plan) {
        console.warn(`[creem webhook] unknown product_id ${productId} for ${eventType}`);
        return;
      }

      const subId = data.subscription?.id || data.id;
      const customerId = data.customer?.id;
      const periodEnd =
        data.subscription?.current_period_end || data.current_period_end || null;

      // 2) 升级套餐 + 重置当月积分（覆盖式：每月重新发，未用完作废）
      await upgradePlan(userId, plan, {
        subscriptionId: subId,
        customerId,
        periodEnd: periodEnd ? new Date(periodEnd).toISOString() : null,
      });
      return;
    }

    case "subscription.canceled":
    case "subscription.expired":
    case "subscription.past_due": {
      // 订阅结束/失效 → 退回 free 套餐（保留剩余积分到周期末，已通过 current_period_end 标记）
      await downgradeToFree(userId, data.subscription?.id);
      return;
    }

    case "refund.created": {
      // 退款 → 重置 free + 清零积分 + 记录
      const subId = data.subscription?.id;
      await refundReset(userId, subId);
      return;
    }

    default:
      console.log(`[creem webhook] unhandled event type: ${eventType}`);
  }
}

// ── Helpers ─────────────────────────────────────────

async function upgradePlan(
  userId: string,
  plan: PlanId,
  meta: { subscriptionId?: string; customerId?: string; periodEnd?: string | null }
) {
  const credits = CREDITS_BY_PLAN[plan];

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, plan")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) {
    console.warn(`[creem webhook] profile not found for user_id ${userId}`);
    return;
  }

  await supabase
    .from("profiles")
    .update({
      plan,
      credits, // 覆盖式刷新本周期积分
      creem_subscription_id: meta.subscriptionId,
      creem_customer_id: meta.customerId,
      subscription_status: "active",
      current_period_end: meta.periodEnd,
    })
    .eq("id", userId);

  await supabase.from("credit_records").insert({
    user_id: userId,
    type: profile.plan === plan ? "renew" : "purchase",
    amount: credits,
    description:
      profile.plan === plan
        ? `${plan.toUpperCase()} 月度续费，积分已重置`
        : `订阅 ${plan.toUpperCase()} 成功，获得 ${credits} 积分`,
    project_title: "",
  });
}

async function downgradeToFree(userId: string, subscriptionId?: string) {
  // 取消后保留当前积分，等下一个 cycle 自然过期
  await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
      creem_subscription_id: subscriptionId || null,
    })
    .eq("id", userId);

  // 真正切回 free + 清零积分要等到 current_period_end 之后
  // 这里只更新状态，前端根据 current_period_end 判断是否仍能用
}

async function refundReset(userId: string, subscriptionId?: string) {
  await supabase
    .from("profiles")
    .update({
      plan: "free",
      credits: 0,
      subscription_status: "refunded",
      creem_subscription_id: subscriptionId || null,
      current_period_end: null,
    })
    .eq("id", userId);

  await supabase.from("credit_records").insert({
    user_id: userId,
    type: "refund",
    amount: 0,
    description: "订单已退款，订阅终止",
    project_title: "",
  });
}
