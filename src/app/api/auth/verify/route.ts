import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code || code.length !== 6) {
      return NextResponse.json({ error: "参数无效" }, { status: 400 });
    }

    // TODO: verify code from D1 verification_codes table
    // TODO: create or find user in D1 users table
    // TODO: generate JWT and set httpOnly cookie
    // For now, accept any 6-digit code in development
    console.log(`[DEV] Verifying code ${code} for ${email}`);

    const response = NextResponse.json({
      success: true,
      user: { id: "dev-user", email, nickname: "" },
    });

    // TODO: set proper JWT cookie
    response.cookies.set("token", "dev-token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "验证失败，请重试" }, { status: 500 });
  }
}
