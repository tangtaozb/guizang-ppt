import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";

// GET /api/db/credits?page=0&pageSize=8 — paginated credit history
export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "0", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "8", 10);

  const [countRes, dataRes, profileRes] = await Promise.all([
    supabase
      .from("credit_records")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("credit_records")
      .select("id, type, amount, description, project_title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1),
    supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single(),
  ]);

  const total = countRes.count || 0;
  const records = (dataRes.data || []).map((r) => ({
    id: r.id,
    type: r.type,
    amount: r.amount,
    description: r.description,
    projectTitle: r.project_title,
    createdAt: r.created_at,
  }));

  return NextResponse.json({
    records,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    credits: profileRes.data?.credits ?? 0,
  });
}

// POST /api/db/credits — consume credits (atomic)
//
// NOTE: this endpoint is kept only for client-initiated bookkeeping calls
// (e.g. external purchases). For LLM-driven generate/edit actions, the
// /api/projects/agent endpoint now charges credits server-side via the
// chargeCredits() helper, so the frontend should NOT call this for those flows.
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = await req.json();
  const { amount, description, projectTitle, type } = body as {
    amount: number;
    description: string;
    projectTitle: string;
    type: "generate" | "edit" | "purchase";
  };

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  // Hard reject if balance < amount — no more silent clamping.
  if (profile.credits < amount) {
    return NextResponse.json(
      {
        error: "积分不足，请前往定价页升级套餐",
        code: "INSUFFICIENT_CREDITS",
        credits: profile.credits,
        needed: amount,
      },
      { status: 402 }
    );
  }

  const newCredits = profile.credits - amount;

  await Promise.all([
    supabase
      .from("profiles")
      .update({ credits: newCredits })
      .eq("id", user.id),
    supabase.from("credit_records").insert({
      user_id: user.id,
      type,
      amount: -amount,
      description,
      project_title: projectTitle,
    }),
  ]);

  return NextResponse.json({ credits: newCredits });
}
