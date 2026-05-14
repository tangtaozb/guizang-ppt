import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthUser } from "@/lib/auth";

// POST /api/db/projects/[id]/save — save version + messages after generation/edit
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { html, label, messages, slideCount } = body as {
    html: string;
    label: string;
    messages: { role: string; content: string }[];
    slideCount: number;
  };

  // Verify project belongs to user
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  // Run all saves in parallel
  const [versionRes] = await Promise.all([
    // 1. Insert version
    supabase
      .from("project_versions")
      .insert({ project_id: id, html, label })
      .select("id, created_at")
      .single(),

    // 2. Update project html + slide count
    supabase
      .from("projects")
      .update({ current_html: html, slide_count: slideCount })
      .eq("id", id),

    // 3. Upsert messages: delete old + insert new
    (async () => {
      await supabase.from("messages").delete().eq("project_id", id);
      if (messages.length > 0) {
        return supabase.from("messages").insert(
          messages.map((m) => ({
            project_id: id,
            role: m.role,
            content: m.content,
          }))
        );
      }
    })(),
  ]);

  if (versionRes.error) {
    return NextResponse.json({ error: versionRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    version: {
      id: versionRes.data.id,
      html,
      label,
      createdAt: versionRes.data.created_at,
    },
  });
}
