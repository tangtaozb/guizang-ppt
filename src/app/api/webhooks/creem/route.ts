// POST /api/webhooks/creem — 接收 Creem webhook 事件
// 事件类型：subscription.{active,paid,canceled,past_due,expired,update,trialing,paused}
//          checkout.completed / refund.created / dispute.created
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
  eventType?: string;       // camelCase（Creem 实际用的）
  event_type?: string;      // snake_case fallback
  type?: string;            // 通用 fallback
  object?: CreemObject;     // 业务对象（subscription / checkout / refund）
  data?: CreemObject;       // fallback
  created_at?: number | string;
}

interface CreemObject {
  id?: string;
  object?: string;                    // 类型标识："subscription" / "checkout" / "refund"
  status?: string;
  product?: { id?: string };
  customer?: {
    id?: string;
    email?: string;
    metadata?: Record<string, string>;
  };
  metadata?: Record<string, string>;
  // 订阅周期（Creem 用 _date 后缀）
  current_period_start_date?: string;
  current_period_end_date?: string;
  current_period_end?: string | number;  // fallback
  // checkout 里可能嵌套
  subscription?: { id?: string };
}

export async function POST(req: NextRequest) {
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

  const eventId = event.id || `${Date.now()}-${Math.random()}`;
  const eventType = event.eventType || event.event_type || event.type || "unknown";
  const obj = event.object || event.data || {};

  console.log(`[creem webhook] received ${eventType} (event_id=${eventId})`);

  // 幂等去重
  const { data: existing } = await supabase
    .from("creem_webhook_events")
    .select("event_id")
    .eq("event_id", eventId)
    .maybeSingle();
  if (existing) {
    console.log(`[creem webhook] deduped ${eventId}`);
    return NextResponse.json({ ok: true, deduped: true });
  }

  try {
    const handled = await handleEvent(eventType, obj);
    await supabase.from("creem_webhook_events").insert({
      event_id: eventId,
      event_type: eventType,
      payload: event as unknown as Record<string, unknown>,
    });
    return NextResponse.json({ ok: true, handled });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[creem webhook] handler failed for ${eventType}:`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ───────────────────────────────────────────

async function handleEvent(eventType: string, obj: CreemObject): Promise<string> {
  // 找 user_id：先看 subscription.metadata，再看 customer.metadata
  const userId =
    obj.metadata?.user_id ||
    obj.metadata?.userId ||
    obj.customer?.metadata?.user_id ||
    obj.customer?.metadata?.userId;

  if (!userId) {
    console.warn(`[creem webhook] no user_id for ${eventType}`, {
      objectId: obj.id,
      objectType: obj.object,
      hasMetadata: !!obj.metadata,
      hasCustomerMetadata: !!obj.customer?.metadata,
    });
    return "skipped: no user_id";
  }

  switch (eventType) {
    case "checkout.completed":
    case "subscription.active":
    case "subscription.paid":
    case "subscription.update":
    case "subscription.trialing": {
      const productId = obj.product?.id;
      const plan = productId ? PLAN_BY_PRODUCT_ID[productId] : undefined;
      if (!plan) {
        console.warn(`[creem webhook] unknown product_id ${productId} for ${eventType}`);
        return `skipped: unknown product ${productId}`;
      }

      const subId = obj.id || obj.subscription?.id;
      const customerId = obj.customer?.id;
      const periodEnd =
        obj.current_period_end_date ||
        (typeof obj.current_period_end === "number"
          ? new Date(obj.current_period_end).toISOString()
          : obj.current_period_end) ||
        null;

      await upgradePlan(userId, plan, {
        subscriptionId: subId,
        customerId,
        periodEnd: periodEnd ? new Date(periodEnd).toISOString() : null,
      });
      console.log(`[creem webhook] ${eventType}: user=${userId} upgraded to ${plan}`);
      return `upgraded ${userId} to ${plan}`;
    }

    case "subscription.canceled":
    case "subscription.scheduled_cancel":
    case "subscription.expired":
    case "subscription.past_due":
    case "subscription.paused": {
      await downgradeToFree(userId, obj.id);
      console.log(`[creem webhook] ${eventType}: user=${userId} marked ${eventType}`);
      return `${eventType} ${userId}`;
    }

    case "refund.created": {
      await refundReset(userId, obj.id || obj.subscription?.id);
      console.log(`[creem webhook] refund: user=${userId}`);
      return `refunded ${userId}`;
    }

    default:
      console.log(`[creem webhook] unhandled event type: ${eventType}`);
      return `unhandled ${eventType}`;
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
      credits,
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
        ? `${plan.toUpperCase()} 月度续费，积分已重置为 ${credits}`
        : `订阅 ${plan.toUpperCase()} 成功，获得 ${credits} 积分`,
    project_title: "",
  });
}

async function downgradeToFree(userId: string, subscriptionId?: string) {
  await supabase
    .from("profiles")
    .update({
      subscription_status: "canceled",
      creem_subscription_id: subscriptionId || null,
    })
    .eq("id", userId);
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
