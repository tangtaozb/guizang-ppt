import Link from "next/link";

const features = [
  {
    icon: "✦",
    title: "杂志级设计",
    desc: "5 套精选配色主题，10 种专业布局模板，WebGL 流体背景动效",
  },
  {
    icon: "⚡",
    title: "AI 智能生成",
    desc: "粘贴文本素材，AI 自动分析内容结构，一键生成完整演示文稿",
  },
  {
    icon: "💬",
    title: "对话式编辑",
    desc: "用自然语言调整 PPT，换主题、加页面、改内容，所见即所得",
  },
  {
    icon: "📦",
    title: "单文件交付",
    desc: "生成独立 HTML 文件，浏览器直接打开，无需安装任何软件",
  },
];

const demos = [
  { theme: "墨韵经典", color: "#0a0a0b", bg: "#f1efea" },
  { theme: "靛青瓷", color: "#0a1f3d", bg: "#f1f3f5" },
  { theme: "森林墨", color: "#1a2e1f", bg: "#f5f1e8" },
  { theme: "牛皮纸", color: "#2a1e13", bg: "#eedfc7" },
  { theme: "沙丘", color: "#1f1a14", bg: "#f0e6d2" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link href="/" className="text-lg font-bold tracking-tight">
            GuiZang<span className="text-accent">PPT</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              定价
            </Link>
            <Link
              href="/login"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              开始使用
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 bg-gradient-to-b from-white to-muted">
        <div className="max-w-3xl text-center">
          <div className="inline-block mb-6 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">
            AI × 电子杂志 × 演示文稿
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight mb-6">
            用 AI 生成
            <br />
            <span className="text-accent">杂志级</span>演示文稿
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            粘贴你的文本内容，AI 自动生成精美的横向翻页 PPT。
            支持对话式编辑，实时预览，一键下载独立 HTML 文件。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:opacity-90 transition-opacity"
            >
              免费体验
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-8 py-3 border border-border rounded-lg text-base font-medium hover:bg-muted transition-colors"
            >
              查看定价
            </Link>
          </div>
        </div>
      </section>

      {/* Theme Preview */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">5 套精选配色主题</h2>
          <p className="text-muted-foreground text-center mb-12">
            每套主题都经过精心调校，确保专业感与可读性
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {demos.map((d) => (
              <div
                key={d.theme}
                className="rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-32 flex items-end p-4"
                  style={{ backgroundColor: d.bg }}
                >
                  <span
                    className="text-2xl font-serif font-bold"
                    style={{ color: d.color }}
                  >
                    Aa
                  </span>
                </div>
                <div className="px-4 py-3 bg-white">
                  <p className="text-sm font-medium">{d.theme}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">核心能力</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-6 border border-border hover:shadow-md transition-shadow"
              >
                <div className="text-2xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">三步完成</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "粘贴内容", desc: "将你的文本素材粘贴到输入框" },
              { step: "02", title: "AI 生成", desc: "AI 分析内容，自动生成杂志风 PPT" },
              { step: "03", title: "编辑下载", desc: "对话式微调，满意后一键下载 HTML" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground font-mono text-sm font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">准备好了吗？</h2>
          <p className="text-primary-foreground/70 mb-8">
            告别平庸的 PPT，让每一页都值得驻足
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-white text-primary rounded-lg text-base font-medium hover:bg-white/90 transition-colors"
          >
            立即开始
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <span>© 2026 GuiZang PPT</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-foreground transition-colors">定价</Link>
            <a href="mailto:support@guizangppt.com" className="hover:text-foreground transition-colors">联系我们</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
