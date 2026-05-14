import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";

// GET /api/db/projects — list all projects for current user
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { data, error } = await supabase
    .from("projects")
    .select("id, title, theme, slide_count, created_at, updated_at, current_html")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const projects = (data || []).map((p) => ({
    id: p.id,
    title: p.title,
    theme: p.theme,
    slideCount: p.slide_count,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    hasHtml: !!p.current_html,
  }));

  return NextResponse.json(projects);
}

// POST /api/db/projects — create a new project
export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = await req.json();
  const { title, theme, sourceText } = body as {
    title: string;
    theme: string;
    sourceText: string;
  };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: title || "未命名演示",
      theme: theme || "ink-classic",
      source_text: sourceText || "",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    title: data.title,
    theme: data.theme,
    sourceText: data.source_text,
    currentHtml: data.current_html || "",
    slideCount: data.slide_count,
    versions: [],
    messages: [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });
}
