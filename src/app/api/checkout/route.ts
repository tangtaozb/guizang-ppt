// POST /api/checkout — 创建 Creem Checkout session
// 用户在 /pricing 点击订阅按钮，前端 POST { plan } 到这里，拿到 checkout_url 后跳转
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createCheckout, PRODUCT_ID_BY_PLAN, type PlanId } from "@/lib/creem";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = (await req.json()) as { plan?: string };
  const plan = body.plan as PlanId | undefined;

  if (!plan || !["starter", "pro", "ultra"].includes(plan)) {
    return NextResponse.json({ error: "无效的套餐" }, { status: 400 });
  }

  const productId = PRODUCT_ID_BY_PLAN[plan];
  if (!productId) {
    return NextResponse.json({ error: `套餐 ${plan} 未配置 product_id` }, { status: 500 });
  }

  try {
    const session = await createCheckout({
      productId,
      userId: user.id,
      customerEmail: user.email,
    });
    return NextResponse.json({ url: session.checkout_url, id: session.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "创建 Checkout 失败";
    console.error("[creem checkout]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
