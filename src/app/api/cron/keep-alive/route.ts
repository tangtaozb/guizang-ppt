import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

// GET /api/cron/keep-alive
// Triggered daily by Vercel Cron to keep Supabase free-tier project active
// (Supabase auto-pauses free projects after 7 days of inactivity)
export async function GET(request: Request) {
  // Verify request is from Vercel Cron (or local dev)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Simple count query — enough activity to reset Supabase's 7-day idle timer
    const { count, error } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("[keep-alive] Supabase query failed:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    const timestamp = new Date().toISOString();
    console.log(`[keep-alive] ping ok — projects=${count} at ${timestamp}`);

    return NextResponse.json({
      ok: true,
      projectCount: count,
      timestamp,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[keep-alive] error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
