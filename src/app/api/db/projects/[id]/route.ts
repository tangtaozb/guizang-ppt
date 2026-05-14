import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";

// GET /api/db/projects/[id] — get full project with versions + messages
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { id } = await params;

  const [projectRes, versionsRes, messagesRes] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase
      .from("project_versions")
      .select("id, html, label, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("messages")
      .select("id, role, content, tokens_used, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (projectRes.error) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  const p = projectRes.data;
  return NextResponse.json({
    id: p.id,
    title: p.title,
    theme: p.theme,
    sourceText: p.source_text || "",
    currentHtml: p.current_html || "",
    slideCount: p.slide_count,
    versions: (versionsRes.data || []).map((v) => ({
      id: v.id,
      html: v.html,
      label: v.label,
      createdAt: v.created_at,
    })),
    messages: (messagesRes.data || []).map((m) => ({
      id: m.id,
      projectId: id,
      role: m.role,
      content: m.content,
      tokensUsed: m.tokens_used,
      createdAt: m.created_at,
    })),
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  });
}

// PATCH /api/db/projects/[id] — update project fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updateFields: Record<string, unknown> = {};
  if (body.title !== undefined) updateFields.title = body.title;
  if (body.theme !== undefined) updateFields.theme = body.theme;
  if (body.currentHtml !== undefined) updateFields.current_html = body.currentHtml;
  if (body.sourceText !== undefined) updateFields.source_text = body.sourceText;
  if (body.slideCount !== undefined) updateFields.slide_count = body.slideCount;

  const { error } = await supabase
    .from("projects")
    .update(updateFields)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/db/projects/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { id } = await params;

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
