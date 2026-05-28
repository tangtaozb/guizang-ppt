import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

// POST /api/auth/send-code — generate OTP via Admin API (bypasses Supabase rate limits)
// then send email via Resend, or return OTP in dev mode
export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email: string };

    if (!email?.trim() || !email.includes("@")) {
      return NextResponse.json({ error: "请输入有效的邮箱" }, { status: 400 });
    }

    const trimmedEmail = email.trim();

    // 1. Try generateLink for existing users
    let result = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: trimmedEmail,
    });

    // 2. If user doesn't exist, create them first, then retry
    if (result.error) {
      const { error: createError } = await supabase.auth.admin.createUser({
        email: trimmedEmail,
        email_confirm: true,
      });

      // Ignore "already exists" error
      if (createError && !createError.message.includes("already")) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      result = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: trimmedEmail,
      });
    }

    if (result.error || !result.data?.properties?.email_otp) {
      return NextResponse.json(
        { error: result.error?.message || "生成验证码失败" },
        { status: 500 }
      );
    }

    const otp = result.data.properties.email_otp;

    // 3. Send email via Resend if configured
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Artify Slide <onboarding@resend.dev>",
          to: trimmedEmail,
          subject: "您的登录验证码",
          html: `
            <div style="font-family: -apple-system, sans-serif; max-width: 400px; margin: 0 auto; padding: 32px 24px;">
              <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 8px;">Artify Slide</h2>
              <p style="color: #666; font-size: 14px; margin: 0 0 24px;">您正在登录，请使用以下验证码：</p>
              <div style="font-size: 36px; font-weight: 700; letter-spacing: 6px; padding: 20px; background: #f5f5f5; border-radius: 12px; text-align: center; margin: 0 0 24px; font-family: monospace;">
                ${otp}
              </div>
              <p style="color: #999; font-size: 12px; margin: 0;">验证码 10 分钟内有效，请勿泄露给他人。</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("[Resend] send failed:", errText);
        // Fallback for admin emails when Resend is misconfigured —
        // allows the operator to keep using the product while domain verification
        // is in progress. Strictly limited to OPERATOR_FALLBACK_EMAILS allowlist.
        const fallbackList = (process.env.OPERATOR_FALLBACK_EMAILS || "")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        if (fallbackList.includes(trimmedEmail.toLowerCase())) {
          console.warn(`[send-code] Resend failed, returning OTP inline for operator ${trimmedEmail}`);
          return NextResponse.json({ success: true, otp });
        }
        return NextResponse.json({ error: "发送邮件失败，请重试" }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    // No email service configured — return OTP directly so login can complete.
    // Acceptable for early-access / closed beta, not for public launch.
    console.log(`[DEV] OTP for ${trimmedEmail}: ${otp}`);
    return NextResponse.json({ success: true, otp });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "发送验证码失败";
    console.error("[send-code] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
