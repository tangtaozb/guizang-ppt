import Link from "next/link";
import type { PlanInfo } from "@/types";

const plans: PlanInfo[] = [
  {
    id: "per_use",
    name: "按次付费",
    price: "¥9.9",
    period: "/ 次",
    features: [
      "单次 PPT 生成",
      "含 20 次对话编辑",
      "5 套主题可选",
      "下载独立 HTML 文件",
      "无有效期限制",
    ],
  },
  {
    id: "monthly",
    name: "月度会员",
    price: "¥49",
    period: "/ 月",
    popular: true,
    features: [
      "无限 PPT 生成",
      "无限对话编辑",
      "5 套主题可选",
      "下载独立 HTML 文件",
      "优先生成队列",
      "历史项目管理",
    ],
  },
  {
    id: "yearly",
    name: "年度会员",
    price: "¥399",
    period: "/ 年",
    features: [
      "月度会员全部权益",
      "相当于 ¥33/月",
      "年省 ¥189",
      "优先体验新功能",
      "专属客服支持",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link href="/" className="text-lg font-bold tracking-tight">
            One<span className="text-accent">PPT</span>
          </Link>
          <Link
            href="/login"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            开始使用
          </Link>
        </div>
      </nav>

      <main className="flex-1 py-20 px-6 bg-muted">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">简单透明的定价</h1>
            <p className="text-muted-foreground text-lg">
              按需使用，或订阅解锁无限创作
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl border p-8 flex flex-col ${
                  plan.popular
                    ? "border-accent shadow-lg shadow-accent/10 scale-[1.02]"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                    最受欢迎
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <svg className="w-4 h-4 mt-0.5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`w-full py-2.5 rounded-lg text-sm font-medium text-center transition-all ${
                    plan.popular
                      ? "bg-accent text-accent-foreground hover:opacity-90"
                      : "border border-border hover:bg-muted"
                  }`}
                >
                  立即购买
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-lg font-semibold mb-4">常见问题</h3>
            <div className="max-w-2xl mx-auto space-y-6 text-left">
              {[
                { q: "生成的 PPT 是什么格式？", a: "独立的 HTML 文件，用浏览器直接打开即可演示，无需安装 PowerPoint 或其他软件。" },
                { q: "按次付费的编辑次数用完怎么办？", a: "可以额外购买编辑次数，或升级到月度/年度会员享受无限编辑。" },
                { q: "支持哪些支付方式？", a: "支持微信支付、支付宝、信用卡和 PayPal。" },
              ].map((faq) => (
                <div key={faq.q} className="bg-white rounded-lg border border-border p-5">
                  <h4 className="font-medium mb-2">{faq.q}</h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
