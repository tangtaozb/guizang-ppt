"use client";

// 9 套主题缩略图（Landing 用）— ID 与项目 src/types 中的 ThemeId 严格对齐
// Tailwind v4 + 内联样式：缩略图颜色由 theme 数据驱动
// 封面样张文字（sample）按站点语言切换：中文主题的英文样张保留其美学气质，反之亦然。

import { useTranslation } from "@/i18n";

export type LandingThemeId =
  | "ink-classic" | "indigo" | "forest" | "kraft"
  | "dune" | "ikb" | "lemon" | "lemon-green" | "safety-orange";

type SampleText = { kicker: string; title: string; sub: string; meta: string };

export type LandingTheme = {
  id: LandingThemeId;
  zh: string;
  en: string;
  paper: string;
  fg: string;
  accent: string;
  serif: string;
  sans: string;
  variant: "stamp" | "rule" | "rule-dark" | "tag" | "horizon" | "huge" | "grid" | "lab" | "block";
  sample: { zh: SampleText; en: SampleText };
};

const FONT_SERIF_CN = `var(--font-instrument-serif), "Noto Serif SC", "Songti SC", "STSong", serif`;
const FONT_SERIF_LATIN = `var(--font-instrument-serif), "Instrument Serif", "Noto Serif SC", serif`;
const FONT_SANS = `var(--font-geist-sans), "Geist", system-ui, sans-serif`;
const FONT_MONO = `var(--font-geist-mono), "Geist Mono", ui-monospace, monospace`;

export const THEMES: LandingTheme[] = [
  {
    id: "ink-classic", zh: "墨韵经典", en: "Ink Classic",
    paper: "#f6f1e6", fg: "#191512", accent: "#a72f24", serif: FONT_SERIF_CN, sans: FONT_SANS, variant: "stamp",
    sample: {
      zh: { kicker: "VOL. 01 — 章一", title: "山川 如 故", sub: "天地不仁，以万物为刍狗", meta: "ARTIFYSLIDE · 墨韵" },
      en: { kicker: "VOL. 01 — CH. I", title: "As the Mountains Were", sub: "Heaven and earth are impartial.", meta: "ARTIFYSLIDE · INK" },
    },
  },
  {
    id: "indigo", zh: "靛蓝瓷", en: "Indigo Porcelain",
    paper: "#faf8f1", fg: "#1a2b59", accent: "#1e3a8a", serif: FONT_SERIF_CN, sans: FONT_SANS, variant: "rule",
    sample: {
      zh: { kicker: "青花 · No.02", title: "瓷器 里 的 蓝", sub: "釉色之下，一抹钴蓝", meta: "ARTIFYSLIDE · 靛蓝瓷" },
      en: { kicker: "BLUE & WHITE · No.02", title: "The Blue in Porcelain", sub: "A study of cobalt under glaze", meta: "ARTIFYSLIDE · INDIGO" },
    },
  },
  {
    id: "forest", zh: "森林墨", en: "Forest Ink",
    paper: "#101e1a", fg: "#e8e3d4", accent: "#9fcf7a", serif: FONT_SERIF_LATIN, sans: FONT_SANS, variant: "rule-dark",
    sample: {
      zh: { kicker: "第 03 章 / 林", title: "静 · 深 · 绿", sub: "林冠之下的笔记", meta: "ARTIFYSLIDE · 森林墨" },
      en: { kicker: "Chapter / 林", title: "Quiet, deep, green.", sub: "Notes from the canopy", meta: "ARTIFYSLIDE · FOREST" },
    },
  },
  {
    id: "kraft", zh: "牛皮纸", en: "Kraft Paper",
    paper: "#d4b787", fg: "#2a2218", accent: "#a53e2c", serif: FONT_SERIF_LATIN, sans: FONT_MONO, variant: "tag",
    sample: {
      zh: { kicker: "手记 · 03", title: "盖章 · 折叠", sub: "手作，遇见算法", meta: "ARTIFYSLIDE · 牛皮纸" },
      en: { kicker: "FIELD NOTES · 03", title: "Stamped & Folded", sub: "Handmade meets the algorithm", meta: "ARTIFYSLIDE · KRAFT" },
    },
  },
  {
    id: "dune", zh: "沙丘", en: "Dune",
    paper: "#e6cba8", fg: "#3d2c1d", accent: "#c8693a", serif: FONT_SERIF_LATIN, sans: FONT_SANS, variant: "horizon",
    sample: {
      zh: { kicker: "第 IV 幕", title: "风 过 沙 丘", sub: "沙漠留下的纹路", meta: "ARTIFYSLIDE · 沙丘" },
      en: { kicker: "EPISODE · IV", title: "Wind Across Sand", sub: "Patterns the desert leaves behind", meta: "ARTIFYSLIDE · DUNE" },
    },
  },
  {
    id: "ikb", zh: "蓝调宣言", en: "IKB Manifesto",
    paper: "#0d418f", fg: "#f6f4ed", accent: "#ffd23f", serif: FONT_SERIF_LATIN, sans: FONT_SANS, variant: "huge",
    sample: {
      zh: { kicker: "宣言 / 05", title: "大 声 一 点", sub: "你若轻声，无人赴约。", meta: "ARTIFYSLIDE · 蓝调宣言" },
      en: { kicker: "MANIFESTO / 05", title: "Make It Loud.", sub: "If you whisper, no one shows up.", meta: "ARTIFYSLIDE · IKB" },
    },
  },
  {
    id: "lemon", zh: "日光信号", en: "Lemon Signal",
    paper: "#f8de44", fg: "#141414", accent: "#c0392b", serif: FONT_SERIF_LATIN, sans: FONT_SANS, variant: "grid",
    sample: {
      zh: { kicker: "信号 · 06", title: "正 午 简 报", sub: "投进收件箱的一束信号弹", meta: "ARTIFYSLIDE · 日光信号" },
      en: { kicker: "TRANSMISSION · 06", title: "High Noon Brief.", sub: "A signal flare in your inbox", meta: "ARTIFYSLIDE · LEMON" },
    },
  },
  {
    id: "lemon-green", zh: "酸柠实验", en: "Lemon Green Lab",
    paper: "#dcf25a", fg: "#0d0d0d", accent: "#d62a82", serif: FONT_SANS, sans: FONT_MONO, variant: "lab",
    sample: {
      zh: { kicker: "实验 ⌁ 07 / 第 14 次", title: "酸 而 真", sub: "酸涩的点子，柠檬般清醒", meta: "ARTIFYSLIDE · 酸柠实验" },
      en: { kicker: "LAB ⌁ 07 / TRIAL 14", title: "tart & true", sub: "Sour ideas, citric clarity", meta: "ARTIFYSLIDE · LEMON LAB" },
    },
  },
  {
    id: "safety-orange", zh: "暖阳行动", en: "Safety Orange Action",
    paper: "#ee7547", fg: "#fef4e8", accent: "#2a1b13", serif: FONT_SERIF_LATIN, sans: FONT_SANS, variant: "block",
    sample: {
      zh: { kicker: "行动 / 09", title: "更 暖 地 出 发", sub: "12 页讲清你的市场策略", meta: "ARTIFYSLIDE · 暖阳行动" },
      en: { kicker: "CAMPAIGN / 09", title: "Ship Warmer.", sub: "A go-to-market in 12 slides", meta: "ARTIFYSLIDE · ORANGE" },
    },
  },
];

function hexA(hex: string, a: number) {
  const v = hex.replace("#", "");
  const h = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function ThemeThumb({ theme, width = 320 }: { theme: LandingTheme; width?: number }) {
  const t = theme;
  const { locale } = useTranslation();
  const s = t.sample[locale] ?? t.sample.en; // 按站点语言取样张文字，缺省回退英文
  const height = Math.round((width * 9) / 16);
  const px = (n: number) => `${(n * width) / 320}px`;
  const idx = THEMES.findIndex((x) => x.id === t.id) + 1;
  const no = `0${idx}`.slice(-2);
  const mono = {
    fontFamily: FONT_MONO,
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width,
        height,
        background: t.paper,
        color: t.fg,
        fontFamily: t.sans,
        boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 24px 48px -32px rgba(20,20,20,0.18)",
        borderRadius: 2,
      }}
    >
      <ThumbLayout t={t} s={s} px={px} no={no} mono={mono} locale={locale} />
    </div>
  );
}

// 每张卡 = 一种真实「内页版面类型」（数据大字报 / 目录页 / 封面 / 引言 / 时间线 …），
// 配各主题的配色与字体。内容字段双语，与主题语义贴合。
type Field = { zh: [string, string, string]; en: [string, string, string] }; // [标签, 大数, 注脚]
const METRICS: Partial<Record<LandingThemeId, Field[]>> = {
  lemon: [
    { zh: ["海拔", "1,750ᵐ", "樱桃缓慢成熟之地"], en: ["ALTITUDE", "1,750ᵐ", "Where cherries ripen slowly"] },
    { zh: ["发酵", "72ʰ", "密封罐 · 厌氧"], en: ["FERMENTATION", "72ʰ", "Anaerobic, sealed tanks"] },
    { zh: ["杯测", "88.5", "SCA 独立评分"], en: ["CUPPING", "88.5", "SCA, independently graded"] },
    { zh: ["养豆", "14ᵈ", "出货前静置"], en: ["REST", "14ᵈ", "Resting before we ship"] },
    { zh: ["庄园", "11", "具名产区，非匿名批次"], en: ["FARMS", "11", "Named growers"] },
    { zh: ["烘焙", "12ᵏᵍ", "每次一种曲线"], en: ["BATCH", "12ᵏᵍ", "One profile at a time"] },
  ],
};
const TOC: Partial<Record<LandingThemeId, Field[]>> = {
  "ink-classic": [
    { zh: ["壹", "山 川", "01"], en: ["I", "Mountains", "01"] },
    { zh: ["贰", "草 木", "07"], en: ["II", "Flora", "07"] },
    { zh: ["叁", "人 间", "13"], en: ["III", "The World", "13"] },
    { zh: ["肆", "归 处", "21"], en: ["IV", "Returning", "21"] },
  ],
};
const STEPS: Partial<Record<LandingThemeId, Field[]>> = {
  "safety-orange": [
    { zh: ["01", "定位人群", "Who"], en: ["01", "Pick the niche", "Who"] },
    { zh: ["02", "讲清主张", "Why"], en: ["02", "Sharpen the claim", "Why"] },
    { zh: ["03", "12 页上线", "Ship"], en: ["03", "Ship in 12 slides", "Ship"] },
  ],
};

function ThumbLayout({
  t,
  s,
  px,
  no,
  mono,
  locale,
}: {
  t: LandingTheme;
  s: SampleText;
  px: (n: number) => string;
  no: string;
  mono: { fontFamily: string; letterSpacing: string; textTransform: "uppercase" };
  locale: "zh" | "en";
}) {
  const serif = { fontFamily: t.serif, fontWeight: 500, letterSpacing: "-0.01em" };
  const v = t.variant;
  const dim = (a: number) => hexA(t.fg, a);
  // 普通渲染函数（非组件）—— 避免「render 中创建组件」反模式
  const head = (right?: string) => (
    <div className="flex items-baseline justify-between" style={{ ...mono, fontSize: px(8), color: dim(0.6) }}>
      <span>{s.kicker}</span>
      <span style={{ color: right === "accent" ? t.accent : dim(0.5) }}>{s.meta} · {no}</span>
    </div>
  );

  // —— grid（日光信号）：数据大字报 —— 2×3 指标网格（就是「by the numbers」那种内页）
  if (v === "grid") {
    const cells = METRICS.lemon!;
    return (
      <div className="absolute inset-0 flex flex-col" style={{ padding: px(18) }}>
        {head("accent")}
        <div style={{ ...serif, fontSize: px(26), lineHeight: 1.0, margin: `${px(10)} 0 ${px(12)}` }}>{s.title}</div>
        <div className="grid flex-1" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: `${px(10)} ${px(12)}` }}>
          {cells.map((c, i) => {
            const f = c[locale];
            return (
              <div key={i} style={{ borderTop: `${px(1)} solid ${dim(0.22)}`, paddingTop: px(5) }}>
                <div style={{ ...mono, fontSize: px(6.5), color: dim(0.55) }}>{f[0]}</div>
                <div style={{ fontFamily: t.serif, fontWeight: 600, fontSize: px(20), lineHeight: 1, marginTop: px(3) }}>{f[1]}</div>
                <div style={{ fontSize: px(6.5), color: dim(0.55), marginTop: px(3), lineHeight: 1.25 }}>{f[2]}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // —— stamp（墨韵经典）：古籍目录页 —— 章节列表 + 页码
  if (v === "stamp") {
    const rows = TOC["ink-classic"]!;
    return (
      <div className="absolute inset-0 flex flex-col" style={{ padding: px(20) }}>
        {head()}
        <div style={{ ...serif, fontSize: px(28), lineHeight: 1.0, margin: `${px(10)} 0 ${px(12)}` }}>{s.title}</div>
        <div className="flex-1 flex flex-col" style={{ gap: px(7) }}>
          {rows.map((r, i) => {
            const f = r[locale];
            return (
              <div key={i} className="flex items-baseline" style={{ gap: px(8) }}>
                <span style={{ fontFamily: t.serif, color: t.accent, fontSize: px(11), width: px(16) }}>{f[0]}</span>
                <span style={{ fontFamily: t.serif, fontSize: px(13) }}>{f[1]}</span>
                <span style={{ flex: 1, borderBottom: `${px(1)} dotted ${dim(0.3)}`, margin: `0 ${px(4)}`, transform: `translateY(-${px(2)})` }} />
                <span style={{ ...mono, fontSize: px(8), color: dim(0.5) }}>{f[2]}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // —— block（暖阳行动）：行动步骤清单 —— 编号 + 步骤
  if (v === "block") {
    const steps = STEPS["safety-orange"]!;
    return (
      <div className="absolute inset-0 flex flex-col" style={{ padding: px(18) }}>
        <div className="flex items-baseline justify-between" style={{ ...mono, fontSize: px(8), color: dim(0.7) }}>
          <span>{s.kicker}</span><span>{no}</span>
        </div>
        <div style={{ ...serif, fontSize: px(26), lineHeight: 1.0, margin: `${px(8)} 0 ${px(12)}` }}>{s.title}</div>
        <div className="flex-1 flex flex-col justify-center" style={{ gap: px(8) }}>
          {steps.map((st, i) => {
            const f = st[locale];
            return (
              <div key={i} className="flex items-center" style={{ gap: px(10) }}>
                <span className="flex items-center justify-center shrink-0" style={{ width: px(22), height: px(22), background: t.accent, color: t.paper, fontFamily: FONT_MONO, fontSize: px(9) }}>{f[0]}</span>
                <span style={{ fontFamily: t.serif, fontSize: px(16) }}>{f[1]}</span>
                <span style={{ ...mono, fontSize: px(7), color: dim(0.5), marginLeft: "auto" }}>{f[2]}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // —— lab（酸柠实验）：实验数据表 —— 字段行 + 大字结论
  if (v === "lab") {
    const fields = locale === "zh"
      ? [["pH", "3.2"], ["酸度", "高"], ["澄清", "✓"], ["批次", `#${no}`]]
      : [["pH", "3.2"], ["ACIDITY", "HIGH"], ["CLARITY", "✓"], ["TRIAL", `#${no}`]];
    return (
      <div className="absolute inset-0 flex flex-col" style={{ padding: px(16) }}>
        <div className="flex items-center justify-between" style={{ fontFamily: FONT_MONO, fontSize: px(8.5), letterSpacing: "0.08em", color: dim(0.85) }}>
          <span>{s.kicker}</span><span style={{ color: t.accent }}>● REC {no}</span>
        </div>
        <div style={{ fontFamily: t.sans, fontWeight: 800, fontSize: px(28), lineHeight: 0.98, letterSpacing: "-0.03em", margin: `${px(12)} 0` }}>{s.title}</div>
        <div className="flex-1 flex flex-col justify-end" style={{ gap: px(5) }}>
          {fields.map((f, i) => (
            <div key={i} className="flex items-baseline justify-between" style={{ fontFamily: FONT_MONO, fontSize: px(9), color: dim(0.75), borderTop: `${px(1)} solid ${dim(0.2)}`, paddingTop: px(4) }}>
              <span style={{ letterSpacing: "0.08em" }}>{f[0]}</span>
              <span style={{ fontWeight: 700, color: t.fg }}>{f[1]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // —— rule / rule-dark（靛蓝瓷 / 森林墨）：大引言 / 金句页
  if (v === "rule" || v === "rule-dark") {
    return (
      <div className="absolute inset-0 flex flex-col" style={{ padding: px(20) }}>
        <div style={{ height: px(3), width: px(46), background: t.accent }} />
        <div style={{ marginTop: px(11) }}>{head()}</div>
        <div className="flex-1 flex items-center">
          <div>
            <span style={{ fontFamily: t.serif, fontSize: px(34), color: t.accent, lineHeight: 0.6, display: "block" }}>&ldquo;</span>
            <div style={{ ...serif, fontSize: px(24), lineHeight: 1.12, marginTop: px(2) }}>{s.title}</div>
          </div>
        </div>
        <div className="flex items-end justify-between" style={{ borderTop: `${px(1)} solid ${dim(0.18)}`, paddingTop: px(9) }}>
          <span style={{ fontSize: px(10), color: dim(0.62), lineHeight: 1.3, maxWidth: "72%" }}>— {s.sub}</span>
          <span style={{ ...mono, fontSize: px(8), color: dim(0.5) }}>{no}</span>
        </div>
      </div>
    );
  }

  // —— horizon（沙丘）：时间线 / 历程页 —— 横轴节点
  if (v === "horizon") {
    const nodes = locale === "zh" ? ["播种", "生长", "风蚀", "成形"] : ["Seed", "Grow", "Erode", "Form"];
    return (
      <div className="absolute inset-0 flex flex-col" style={{ padding: px(20) }}>
        {head()}
        <div className="flex-1 flex items-end" style={{ paddingBottom: px(12) }}>
          <div style={{ ...serif, fontSize: px(26), lineHeight: 1.04 }}>{s.title}</div>
        </div>
        <div style={{ position: "relative", height: px(1), background: dim(0.35) }}>
          {nodes.map((_, i) => (
            <span key={i} style={{ position: "absolute", left: `${(i / (nodes.length - 1)) * 100}%`, top: px(-2.5), width: px(5), height: px(5), borderRadius: "50%", background: t.accent, transform: "translateX(-50%)" }} />
          ))}
        </div>
        <div className="flex justify-between" style={{ paddingTop: px(7), ...mono, fontSize: px(7), color: dim(0.6) }}>
          {nodes.map((n, i) => <span key={i}>{n}</span>)}
        </div>
      </div>
    );
  }

  // —— tag（牛皮纸）：索引 / 标签墙 —— 多个标签贴
  if (v === "tag") {
    const tags = locale === "zh"
      ? ["手作", "折叠", "盖章", "归档", "纸纹", "限量"]
      : ["Handmade", "Folded", "Stamped", "Filed", "Texture", "Limited"];
    return (
      <div className="absolute inset-0 flex">
        <div className="flex items-center justify-center" style={{ width: px(24), background: t.accent }}>
          <span style={{ writingMode: "vertical-rl", color: t.paper, fontFamily: FONT_MONO, fontSize: px(7.5), letterSpacing: "0.22em", textTransform: "uppercase" }}>{t.en}</span>
        </div>
        <div className="flex-1 flex flex-col" style={{ padding: px(16) }}>
          {head()}
          <div style={{ ...serif, fontSize: px(24), lineHeight: 1.02, margin: `${px(8)} 0 ${px(10)}` }}>{s.title}</div>
          <div className="flex flex-wrap" style={{ gap: px(6) }}>
            {tags.map((tg, i) => (
              <span key={i} style={{ fontFamily: FONT_MONO, fontSize: px(8), color: dim(0.7), border: `${px(1)} solid ${dim(0.3)}`, padding: `${px(2)} ${px(6)}`, borderRadius: px(2) }}>{tg}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // —— huge（蓝调宣言 IKB）：巨型标语封面
  return (
    <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: px(18) }}>
      <div className="flex items-baseline justify-between" style={{ ...mono, fontSize: px(8), color: dim(0.7) }}>
        <span>{s.kicker}</span><span style={{ color: t.accent }}>No.{no}</span>
      </div>
      <div style={{ ...serif, fontSize: px(46), lineHeight: 0.92 }}>{s.title}</div>
      <div className="flex items-center" style={{ gap: px(8) }}>
        <div style={{ width: px(18), height: px(3), background: t.accent }} />
        <span style={{ fontSize: px(10.5), color: dim(0.78), lineHeight: 1.3 }}>{s.sub}</span>
      </div>
    </div>
  );
}
