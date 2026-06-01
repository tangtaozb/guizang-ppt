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
  const titleSize =
    t.variant === "huge" ? px(36) :
    t.variant === "block" ? px(30) :
    t.variant === "lab" ? px(28) : px(26);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width, height,
        background: t.paper, color: t.fg, fontFamily: t.sans,
        boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 24px 48px -32px rgba(20,20,20,0.18)",
        borderRadius: 2,
      }}
    >
      <div
        className="pointer-events-none absolute"
        style={{ inset: px(10), border: `1px solid ${hexA(t.fg, 0.12)}` }}
      />

      <div
        className="absolute flex justify-between"
        style={{
          top: px(18), left: px(20), right: px(20),
          fontFamily: FONT_MONO, fontSize: px(9), letterSpacing: "0.14em",
          textTransform: "uppercase", color: hexA(t.fg, 0.72),
        }}
      >
        <span>{s.kicker}</span>
        <span style={{ color: t.accent }}>●</span>
      </div>

      <div
        className="absolute"
        style={{
          left: t.variant === "block" ? px(28) : px(20),
          right: px(20),
          top: px(54),
          fontFamily: t.serif,
          fontSize: titleSize,
          lineHeight: 1.0,
          fontWeight: 500,
          letterSpacing: "-0.01em",
        }}
      >
        {s.title}
      </div>

      <div
        className="absolute"
        style={{
          left: t.variant === "block" ? px(28) : px(20),
          right: px(20),
          bottom: px(40),
          fontSize: px(11),
          color: hexA(t.fg, 0.66),
          lineHeight: 1.4,
        }}
      >
        {s.sub}
      </div>

      <div
        className="absolute flex justify-between"
        style={{
          left: px(20), right: px(20), bottom: px(18),
          fontFamily: FONT_MONO, fontSize: px(8.5),
          letterSpacing: "0.16em", color: hexA(t.fg, 0.55), textTransform: "uppercase",
        }}
      >
        <span>{s.meta}</span>
        <span>—— 0{THEMES.findIndex((x) => x.id === t.id) + 1}</span>
      </div>
    </div>
  );
}
