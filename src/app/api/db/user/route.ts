import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";

// GET /api/db/user — get current user profile
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  return NextResponse.json({
    id: data.id,
    email: user.email || "",
    phone: data.phone,
    nickname: data.nickname,
    plan: data.plan,
    credits: data.credits,
    createdAt: data.created_at,
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

  return NextResponse.json({
    id: data.id,
    email: user.email || "",
    phone: data.phone,
    nickname: data.nickname,
    plan: data.plan,
    credits: data.credits,
    createdAt: data.created_at,
  });
}
