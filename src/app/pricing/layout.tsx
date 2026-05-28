import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "定价 — ArtifySlide AI PPT 生成器",
  description:
    "三档月度订阅：Starter $9.9（4,500 积分）/ Pro $19.9（10,000 积分）/ Ultra $49.9（25,000 积分）。25 积分生成一份 PPT，按月发放，用完即止。Creem 安全收银。",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "定价 — ArtifySlide AI PPT 生成器",
    description:
      "Starter $9.9 · Pro $19.9 · Ultra $49.9。按月订阅，按积分使用。Creem 安全收银，可随时取消。",
    url: "/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
