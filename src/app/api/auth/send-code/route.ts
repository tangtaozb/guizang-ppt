import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));

    // TODO: store code in D1 verification_codes table
    // TODO: send email via Resend API
    // For now, log the code for development
    console.log(`[DEV] Verification code for ${email}: ${code}`);

    return NextResponse.json({ success: true, message: "验证码已发送" });
  } catch {
    return NextResponse.json({ error: "发送失败，请重试" }, { status: 500 });
  }
}
