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

// POST /api/db/credits — consume credits
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

  // Get current credits
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const newCredits = Math.max(0, profile.credits - amount);

  // Update credits + insert record
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
