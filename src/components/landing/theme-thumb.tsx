"use client";

// 9 套主题缩略图（Landing 用）— ID 与项目 src/types 中的 ThemeId 严格对齐
// Tailwind v4 + 内联样式：缩略图颜色由 theme 数据驱动

export type LandingThemeId =
  | "ink-classic" | "indigo" | "forest" | "kraft"
  | "dune" | "ikb" | "lemon" | "lemon-green" | "safety-orange";

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
  sample: { kicker: string; title: string; sub: string; meta: string };
};

const FONT_SERIF_CN = `var(--font-instrument-serif), "Noto Serif SC", "Songti SC", "STSong", serif`;
const FONT_SERIF_LATIN = `var(--font-instrument-serif), "Instrument Serif", "Noto Serif SC", serif`;
const FONT_SANS = `var(--font-geist-sans), "Geist", system-ui, sans-serif`;
const FONT_MONO = `var(--font-geist-mono), "Geist Mono", ui-monospace, monospace`;

export const THEMES: LandingTheme[] = [
  { id: "ink-classic",   zh: "墨韵经典", en: "Ink Classic",       paper: "#f6f1e6", fg: "#191512", accent: "#a72f24", serif: FONT_SERIF_CN,    sans: FONT_SANS, variant: "stamp",     sample: { kicker: "VOL. 01 — 章一",       title: "山川 如 故",        sub: "天地不仁，以万物为刍狗",                    meta: "ARTIFYSLIDE · 墨韵" } },
  { id: "indigo",        zh: "靛蓝瓷",   en: "Indigo Porcelain",  paper: "#faf8f1", fg: "#1a2b59", accent: "#1e3a8a", serif: FONT_SERIF_CN,    sans: FONT_SANS, variant: "rule",      sample: { kicker: "青花 · No.02",         title: "瓷器 里 的 蓝", sub: "A study of cobalt under glaze",             meta: "ARTIFYSLIDE · 靛蓝瓷" } },
  { id: "forest",        zh: "森林墨",   en: "Forest Ink",        paper: "#101e1a", fg: "#e8e3d4", accent: "#9fcf7a", serif: FONT_SERIF_LATIN, sans: FONT_SANS, variant: "rule-dark", sample: { kicker: "Chapter / 林",         title: "Quiet, deep, green.", sub: "Notes from the canopy",                    meta: "ARTIFYSLIDE · 森林墨" } },
  { id: "kraft",         zh: "牛皮纸",   en: "Kraft Paper",       paper: "#d4b787", fg: "#2a2218", accent: "#a53e2c", serif: FONT_SERIF_LATIN, sans: FONT_MONO, variant: "tag",       sample: { kicker: "FIELD NOTES · 03", title: "Stamped & Folded",   sub: "Handmade meets the algorithm",             meta: "ARTIFYSLIDE · 牛皮纸" } },
  { id: "dune",          zh: "沙丘",     en: "Dune",              paper: "#e6cba8", fg: "#3d2c1d", accent: "#c8693a", serif: FONT_SERIF_LATIN, sans: FONT_SANS, variant: "horizon",   sample: { kicker: "EPISODE · IV",         title: "Wind Across Sand",   sub: "Patterns the desert leaves behind",        meta: "ARTIFYSLIDE · 沙丘" } },
  { id: "ikb",           zh: "蓝调宣言", en: "IKB Manifesto",     paper: "#0d418f", fg: "#f6f4ed", accent: "#ffd23f", serif: FONT_SERIF_LATIN, sans: FONT_SANS, variant: "huge",      sample: { kicker: "MANIFESTO / 05",       title: "Make It Loud.",       sub: "If you whisper, no one shows up.",         meta: "ARTIFYSLIDE · 蓝调宣言" } },
  { id: "lemon",         zh: "日光信号", en: "Lemon Signal",      paper: "#f8de44", fg: "#141414", accent: "#c0392b", serif: FONT_SERIF_LATIN, sans: FONT_SANS, variant: "grid",      sample: { kicker: "TRANSMISSION ·06",      title: "High Noon Brief.",   sub: "A signal flare in your inbox",             meta: "ARTIFYSLIDE · 日光信号" } },
  { id: "lemon-green",   zh: "酸柠实验", en: "Lemon Green Lab",   paper: "#dcf25a", fg: "#0d0d0d", accent: "#d62a82", serif: FONT_SANS,        sans: FONT_MONO, variant: "lab",       sample: { kicker: "LAB ⌁ 07 / TRIAL 14",   title: "tart & true",         sub: "Sour ideas, citric clarity",               meta: "ARTIFYSLIDE · 酸柠实验" } },
  { id: "safety-orange", zh: "暖阳行动", en: "Safety Orange Action", paper: "#ee7547", fg: "#fef4e8", accent: "#2a1b13", serif: FONT_SERIF_LATIN, sans: FONT_SANS, variant: "block",  sample: { kicker: "CAMPAIGN / 09",         title: "Ship Warmer.",             sub: "A go-to-market in 12 slides",              meta: "ARTIFYSLIDE · 暖阳行动" } },
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
        <span>{t.sample.kicker}</span>
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
        {t.sample.title}
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
        {t.sample.sub}
      </div>

      <div
        className="absolute flex justify-between"
        style={{
          left: px(20), right: px(20), bottom: px(18),
          fontFamily: FONT_MONO, fontSize: px(8.5),
          letterSpacing: "0.16em", color: hexA(t.fg, 0.55), textTransform: "uppercase",
        }}
      >
        <span>{t.sample.meta}</span>
        <span>—— 0{THEMES.findIndex((x) => x.id === t.id) + 1}</span>
      </div>
    </div>
  );
}
