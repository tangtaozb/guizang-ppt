"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/i18n";
import { THEMES, type LandingThemeId } from "./theme-thumb";

// 首屏 hero 样张 —— 在「有真实 deck」的主题间每 4s 自动轮播，
// 颜色 / 文字 / 印章 / 跳转链接全部随当前主题切换。点击 → 打开对应真实可翻页 deck。

const MONO = `var(--font-geist-mono), "Geist Mono", ui-monospace, monospace`;
const SANS = `var(--font-geist-sans), "Geist", system-ui, sans-serif`;

const BASE_W = 520;
const MAX_W = 600;

// 只在「有真实示例 deck」的主题间轮播，保证点击永远落到真实页面。
const ROTATION: { id: LandingThemeId; href: string; seal: string }[] = [
  { id: "ink-classic", href: "/examples/meridian-coffee.html", seal: "辑" },
  { id: "indigo", href: "/examples/atlas-tech.html", seal: "瓷" },
  { id: "dune", href: "/examples/studio-design.html", seal: "沙" },
];

const ink = (hex: string, a: number) => {
  const v = hex.replace("#", "");
  const h = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
};

export function HeroSpecimen() {
  const { t, locale } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(MAX_W);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const x = entries[0]?.contentRect.width;
      if (x && x > 0) setW(x);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setI((p) => (p + 1) % ROTATION.length), 4000);
    return () => window.clearInterval(id);
  }, [paused]);

  const px = (n: number) => `${(n * w) / BASE_W}px`;

  const slot = ROTATION[i];
  const theme = THEMES.find((x) => x.id === slot.id)!;
  const s = theme.sample[locale] ?? theme.sample.en;
  const PAPER = theme.paper;
  const INK = theme.fg;
  const ACCENT = theme.accent;
  const SERIF = theme.serif;
  const dim = (a: number) => ink(INK, a);
  const num = `0${THEMES.findIndex((x) => x.id === slot.id) + 1}`.slice(-2);

  return (
    <a
      href={slot.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block cursor-pointer as-rise"
      style={{ animationDelay: "220ms" }}
      aria-label={t("heroSpec.cta")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="as-float">
        <div className="relative mx-auto w-full" style={{ maxWidth: MAX_W }}>
          {/* 角标 */}
          <div
            className="absolute -top-3 -right-2 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white shadow-md transition-transform duration-300 group-hover:-translate-y-0.5"
            style={{ background: ACCENT, fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em" }}
          >
            <span
              aria-hidden
              className="inline-block h-0 w-0"
              style={{ borderTop: "4px solid transparent", borderBottom: "4px solid transparent", borderLeft: "6px solid #fff" }}
            />
            {t("heroSpec.badge")}
          </div>

          {/* 后方叠层 */}
          <div aria-hidden className="absolute inset-0" style={{ transform: "translate(15px, 17px) rotate(2.6deg)", background: ink(INK, 0.1), borderRadius: 3, boxShadow: "0 30px 60px -42px rgba(20,20,20,0.3)" }} />
          <div aria-hidden className="absolute inset-0" style={{ transform: "translate(7px, 8px) rotate(1.1deg)", background: ink(INK, 0.05), borderRadius: 3 }} />

          {/* 主幻灯片 16:9 —— 内容随主题轮播，淡入过渡 */}
          <div
            ref={ref}
            key={slot.id}
            className="relative overflow-hidden transition-shadow duration-300 as-fade"
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              background: PAPER,
              color: INK,
              fontFamily: SANS,
              borderRadius: 3,
              boxShadow: "0 2px 0 rgba(0,0,0,0.03), 0 60px 100px -50px rgba(20,20,20,0.45)",
            }}
          >
            {/* 巨型水印 */}
            <div aria-hidden className="pointer-events-none absolute" style={{ right: px(-18), bottom: px(-56), fontFamily: SERIF, fontSize: px(230), lineHeight: 1, color: dim(0.05), fontWeight: 500 }}>
              {slot.seal}
            </div>

            {/* 内框细线 */}
            <div aria-hidden className="pointer-events-none absolute" style={{ inset: px(14), border: `1px solid ${dim(0.13)}` }} />

            {/* 报头 */}
            <div className="absolute flex items-center justify-between" style={{ top: px(24), left: px(30), right: px(30), fontFamily: MONO, fontSize: px(10.5), letterSpacing: "0.22em", textTransform: "uppercase", color: dim(0.7) }}>
              <span>ArtifySlide</span>
              <span>Vol. {num}</span>
            </div>

            {/* 强调短杠 */}
            <div className="absolute" style={{ top: px(50), left: px(30), width: px(42), height: px(3), background: ACCENT }} />

            {/* kicker */}
            <div className="absolute" style={{ top: px(70), left: px(30), fontFamily: MONO, fontSize: px(10), letterSpacing: "0.2em", textTransform: "uppercase", color: ACCENT }}>
              {s.kicker}
            </div>

            {/* 主标题 */}
            <div className="absolute" style={{ top: px(92), left: px(30), right: px(150), fontFamily: SERIF, fontSize: px(60), lineHeight: 1.0, fontWeight: 500, letterSpacing: "0.01em" }}>
              {s.title}
            </div>

            {/* 副题 */}
            <div className="absolute" style={{ left: px(30), right: px(150), bottom: px(56), fontFamily: SERIF, fontSize: px(20), lineHeight: 1.35, color: dim(0.68) }}>
              {s.sub}
            </div>

            {/* 朱砂印章 */}
            <div className="absolute grid place-items-center" style={{ right: px(32), bottom: px(52), width: px(50), height: px(50), background: ACCENT, borderRadius: px(3), transform: "rotate(-4deg)", boxShadow: `0 6px 16px -8px ${ink(ACCENT, 0.6)}` }}>
              <span style={{ fontFamily: SERIF, fontSize: px(26), color: PAPER, fontWeight: 500 }}>{slot.seal}</span>
            </div>

            {/* 页脚 meta */}
            <div className="absolute flex items-center justify-between" style={{ left: px(30), right: px(30), bottom: px(22), fontFamily: MONO, fontSize: px(9), letterSpacing: "0.16em", textTransform: "uppercase", color: dim(0.55) }}>
              <span>ArtifySlide · {locale === "en" ? theme.en : theme.zh}</span>
              <span>№ {num} / 2026</span>
            </div>

            {/* 悬停遮罩 */}
            <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: dim(0.4) }}>
              <span className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 shadow-lg" style={{ height: px(44), fontFamily: SANS, fontSize: px(15), fontWeight: 600, color: "#191512" }}>
                <span aria-hidden className="inline-block h-0 w-0" style={{ borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: `9px solid ${ACCENT}` }} />
                {t("heroSpec.cta")} →
              </span>
            </div>
          </div>

          {/* 轮播指示点 */}
          <div className="absolute left-1/2 z-20 flex -translate-x-1/2 gap-1.5" style={{ bottom: px(-26) }}>
            {ROTATION.map((r, k) => (
              <button
                key={r.id}
                type="button"
                aria-label={`Show ${r.id}`}
                onClick={(e) => { e.preventDefault(); setI(k); }}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: k === i ? 16 : 6, background: k === i ? ACCENT : "rgba(20,20,20,0.18)" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 下方常驻按钮 */}
      <div className="mt-10 flex justify-center">
        <span className="inline-flex h-10 items-center gap-2 rounded-full border border-accent px-5 text-[13.5px] font-medium text-accent transition-colors group-hover:bg-accent group-hover:text-white">
          <span aria-hidden className="inline-block h-0 w-0" style={{ borderTop: "4px solid transparent", borderBottom: "4px solid transparent", borderLeft: "6px solid currentColor" }} />
          {t("heroSpec.cta")}
          <span aria-hidden>→</span>
        </span>
      </div>
    </a>
  );
}
