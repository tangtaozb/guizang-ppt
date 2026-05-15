"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email.trim() || !email.includes("@")) {
      setError("请输入有效的邮箱地址");
      return;
    }
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "发送失败");
        setLoading(false);
        return;
      }

      // Dev mode: API returns OTP directly when no email service configured
      if (data.otp) {
        setCode(data.otp);
      }

      setStep("code");
      setCountdown(60);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length < 6 || loading) return;
    setLoading(true);
    setError("");

    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });

    if (err) {
      setError(
        err.message.includes("expired") || err.message.includes("invalid")
          ? "验证码错误或已过期，请重新发送"
          : `验证失败：${err.message}`
      );
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#fafafa]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            One<span className="text-accent">PPT</span>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            AI 杂志风演示文稿生成器
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <h2 className="text-base font-semibold mb-5">邮箱登录</h2>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 text-red-600 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                邮箱地址
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && step === "email" && handleSendCode()
                }
                placeholder="your@email.com"
                disabled={step === "code"}
                className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent disabled:bg-muted/50 disabled:text-muted-foreground"
                autoFocus
              />
            </div>

            {step === "email" ? (
              <button
                onClick={handleSendCode}
                disabled={!email.trim() || loading}
                className="w-full py-2.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "发送中..." : "发送验证码"}
              </button>
            ) : (
              <>
                {/* Code */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    验证码
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 8))
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                    placeholder="输入验证码"
                    maxLength={8}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    autoFocus
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    验证码已发送至 {email}
                  </p>
                </div>

                <button
                  onClick={handleVerify}
                  disabled={code.length < 6 || loading}
                  className="w-full py-2.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "验证中..." : "登录"}
                </button>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setStep("email");
                      setCode("");
                      setError("");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← 修改邮箱
                  </button>
                  <button
                    onClick={handleSendCode}
                    disabled={countdown > 0 || loading}
                    className="text-xs text-accent hover:underline disabled:text-muted-foreground disabled:no-underline"
                  >
                    {countdown > 0 ? `${countdown}s 后重发` : "重新发送"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
          首次登录将自动注册并赠送 100 积分
        </p>
      </div>
    </div>
  );
}
