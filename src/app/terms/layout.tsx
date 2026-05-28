import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服务条款",
  description:
    "ArtifySlide 的服务条款。订阅、积分、付款、退款、知识产权等使用规则。支付由 Creem.io 作为 Merchant of Record 处理。",
  alternates: { canonical: "/terms" },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
