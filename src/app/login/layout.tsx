import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "登录",
  description: "用邮箱接收验证码登录 ArtifySlide。",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
