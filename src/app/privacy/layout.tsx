import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策",
  description:
    "ArtifySlide 的隐私政策。我们如何收集、使用、存储、共享和保护你的信息。支付由 Creem.io 处理，我们不存储任何支付卡数据。",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
