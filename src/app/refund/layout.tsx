import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "退款政策",
  description:
    "ArtifySlide 退款政策。14 天满意保证，未消耗积分可全额退款。退款流程、不予退款情形、时长说明。",
  alternates: { canonical: "/refund" },
};

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
