"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!email || !email.includes("@")) {
      setError("请输入有效的邮箱地址");
      return;
    }
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "发送失败");
      setStep("code");
      startCountdown();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "发送验证码失败，请重试");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("请输入 6 位验证码");
      return;
    }
    setError("");
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "验证失败");
      router.push("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "验证码错误，请重试");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-muted">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            GuiZang<span className="text-accent">PPT</span>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            {step === "email" ? "输入邮箱开始使用" : `验证码已发送至 ${email}`}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
          {step === "email" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">邮箱地址</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                onClick={handleSendCode}
                disabled={sending}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {sending ? "发送中..." : "获取验证码"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">验证码</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  placeholder="输入 6 位验证码"
                  className="w-full px-3 py-2.5 border border-border rounded-lg text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {verifying ? "验证中..." : "登录"}
              </button>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <button
                  onClick={() => { setStep("email"); setCode(""); setError(""); }}
                  className="hover:text-foreground transition-colors"
                >
                  更换邮箱
                </button>
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0 || sending}
                  className="hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {countdown > 0 ? `${countdown}s 后重发` : "重新发送"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          登录即表示同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
