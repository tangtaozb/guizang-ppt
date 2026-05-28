// Creem.io 服务端封装：Checkout 创建 + Webhook 签名验证 + 套餐映射
import crypto from "crypto";

const CREEM_API_URL = process.env.CREEM_API_URL || "https://test-api.creem.io/v1";
const CREEM_API_KEY = process.env.CREEM_API_KEY || "";
const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET || "";

export type PlanId = "starter" | "pro" | "ultra";

export const PLAN_BY_PRODUCT_ID: Record<string, PlanId> = {
  [process.env.CREEM_PRODUCT_STARTER || ""]: "starter",
  [process.env.CREEM_PRODUCT_PRO || ""]: "pro",
  [process.env.CREEM_PRODUCT_ULTRA || ""]: "ultra",
};

export const PRODUCT_ID_BY_PLAN: Record<PlanId, string> = {
  starter: process.env.CREEM_PRODUCT_STARTER || "",
  pro: process.env.CREEM_PRODUCT_PRO || "",
  ultra: process.env.CREEM_PRODUCT_ULTRA || "",
};

// 每月积分配额，跟 i18n 里的 *Feature1 文案保持一致
// worst-case 40% 利润率反推（详见商业化方案核算）：
// - 1 积分 ≈ $0.001 成本预算
// - 生成 PPT 扣 25 积分（含 $0.010 图片成本）
// - 编辑扣 18 积分
export const CREDITS_BY_PLAN: Record<PlanId, number> = {
  starter: 4500,
  pro: 10000,
  ultra: 25000,
};

// ── Checkout ─────────────────────────────────────────────

export interface CreateCheckoutParams {
  productId: string;
  userId: string;
  customerEmail?: string;
  successUrl?: string;
}

export interface CreemCheckoutResponse {
  id: string;
  checkout_url: string;
  status: string;
}

export async function createCheckout(params: CreateCheckoutParams): Promise<CreemCheckoutResponse> {
  if (!CREEM_API_KEY) throw new Error("CREEM_API_KEY is not configured");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://artifyslide.com";
  const successUrl = params.successUrl || `${siteUrl}/dashboard?checkout=success`;

  const body: Record<string, unknown> = {
    product_id: params.productId,
    success_url: successUrl,
    metadata: {
      user_id: params.userId, // 关键：webhook 会回传这个用来找到用户
    },
  };
  if (params.customerEmail) {
    body.customer = { email: params.customerEmail };
  }

  const res = await fetch(`${CREEM_API_URL}/checkouts`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": CREEM_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Creem create checkout failed: ${res.status} ${errText}`);
  }

  return res.json();
}

// ── Subscription upgrade（按比例抵扣）────────────────────

export interface UpgradeSubscriptionParams {
  subscriptionId: string;
  newProductId: string;
}

export async function upgradeSubscription(params: UpgradeSubscriptionParams) {
  if (!CREEM_API_KEY) throw new Error("CREEM_API_KEY is not configured");

  const res = await fetch(`${CREEM_API_URL}/subscriptions/${params.subscriptionId}/upgrade`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": CREEM_API_KEY,
    },
    body: JSON.stringify({
      product_id: params.newProductId,
      update_behavior: "proration-charge-immediately",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Creem upgrade failed: ${res.status} ${errText}`);
  }
  return res.json();
}

// ── Webhook signature verification ──────────────────────

export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!CREEM_WEBHOOK_SECRET) {
    console.error("CREEM_WEBHOOK_SECRET is not configured");
    return false;
  }
  if (!signatureHeader) return false;

  const expected = crypto
    .createHmac("sha256", CREEM_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signatureHeader, "hex"));
  } catch {
    return false;
  }
}
