"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/i18n";

// 首屏 hero 的「杂志风格 PPT」样张 —— 可点击 → 打开真实可翻页 deck。
// 双语(随站点语言切换)、点击感强(角标 + 悬停遮罩 + 下方按钮)、比例放大。

const SERIF = `var(--font-instrument-serif), "Noto Serif SC", "Songti SC", "STSong", serif`;
const MONO = `var(--font-geist-mono), "Geist Mono", ui-monospace, monospace`;
const SANS = `var(--font-geist-sans), "Geist", system-ui, sans-serif`;

const PAPER = "#f6f1e6";
const INK = "#191512";
const ACCENT = "#a72f24";

const ink = (a: number) => `rgba(25,21,18,${a})`;

// 设计基准宽度 520(版式坐标系);实际渲染上限 MAX_W=600 → 整体约 1.15× 放大。
const BASE_W = 520;
const MAX_W = 600;

// 点击打开的真实示例 deck(单 HTML 文件,新标签页)。
const DECK_HREF = "/examples/meridian-coffee.html";

export function HeroSpecimen() {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(MAX_W);

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

  const px = (n: number) => `${(n * w) / BASE_W}px`;
  const seal = t("heroSpec.seal");

  return (
    <a
      href={DECK_HREF}
      target="_blank"
      rel="noopener noreferrer"
      className="group block cursor-pointer as-rise"
      style={{ animationDelay: "220ms" }}
      aria-label={t("heroSpec.cta")}
    >
      <div className="as-float">
        <div className="relative mx-auto w-full" style={{ maxWidth: MAX_W }}>
          {/* 角标:明确「可点击的真实示例」 */}
          <div
            className="absolute -top-3 -right-2 z-20 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white shadow-md transition-transform duration-300 group-hover:-translate-y-0.5"
            style={{ background: ACCENT, fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em" }}
          >
            <span
              aria-hidden
              className="inline-block h-0 w-0"
              style={{
                borderTop: "4px solid transparent",
                borderBottom: "4px solid transparent",
                borderLeft: "6px solid #fff",
              }}
            />
            {t("heroSpec.badge")}
          </div>

          {/* 后方叠层:暗示成册纵深 */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              transform: "translate(15px, 17px) rotate(2.6deg)",
              background: "#ece2cf",
              borderRadius: 3,
              boxShadow: "0 30px 60px -42px rgba(20,20,20,0.3)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              transform: "translate(7px, 8px) rotate(1.1deg)",
              background: "#f1e9d8",
              borderRadius: 3,
            }}
          />

          {/* 主幻灯片 16:9 */}
          <div
            ref={ref}
            className="relative overflow-hidden transition-shadow duration-300"
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              background: PAPER,
              color: INK,
              fontFamily: SANS,
              borderRadius: 3,
              boxShadow:
                "0 2px 0 rgba(0,0,0,0.03), 0 60px 100px -50px rgba(20,20,20,0.45)",
            }}
          >
            {/* 巨型水印 */}
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                right: px(-18),
                bottom: px(-56),
                fontFamily: SERIF,
                fontSize: px(230),
                lineHeight: 1,
                color: ink(0.05),
                fontWeight: 500,
              }}
            >
              {t("heroSpec.watermark")}
            </div>

            {/* 内框细线 */}
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{ inset: px(14), border: `1px solid ${ink(0.13)}` }}
            />

            {/* 报头 */}
            <div
              className="absolute flex items-center justify-between"
              style={{
                top: px(24),
                left: px(30),
                right: px(30),
                fontFamily: MONO,
                fontSize: px(10.5),
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: ink(0.7),
              }}
            >
              <span>ArtifySlide</span>
              <span>Vol. 01</span>
            </div>

            {/* 强调短杠 */}
            <div
              className="absolute"
              style={{ top: px(50), left: px(30), width: px(42), height: px(3), background: ACCENT }}
            />

            {/* kicker */}
            <div
              className="absolute"
              style={{
                top: px(70),
                left: px(30),
                fontFamily: MONO,
                fontSize: px(10),
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: ACCENT,
              }}
            >
              {t("heroSpec.kicker")}
            </div>

            {/* 主标题 */}
            <div
              className="absolute"
              style={{
                top: px(92),
                left: px(30),
                right: px(150),
                fontFamily: SERIF,
                fontSize: px(64),
                lineHeight: 1.0,
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              {t("heroSpec.title")}
            </div>

            {/* 副题 / 定位 */}
            <div
              className="absolute"
              style={{
                left: px(30),
                right: px(150),
                bottom: px(56),
                fontFamily: SERIF,
                fontSize: px(20),
                lineHeight: 1.35,
                color: ink(0.68),
              }}
            >
              {t("heroSpec.subtitle")}
            </div>

            {/* 朱砂印章 */}
            <div
              className="absolute grid place-items-center"
              style={{
                right: px(32),
                bottom: px(52),
                width: px(50),
                height: px(50),
                background: ACCENT,
                borderRadius: px(3),
                transform: "rotate(-4deg)",
                boxShadow: "0 6px 16px -8px rgba(167,47,36,0.6)",
              }}
            >
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: px(seal.length > 1 ? 18 : 26),
                  color: PAPER,
                  fontWeight: 500,
                  letterSpacing: seal.length > 1 ? "0.02em" : "0",
                }}
              >
                {seal}
              </span>
            </div>

            {/* 页脚 meta */}
            <div
              className="absolute flex items-center justify-between"
              style={{
                left: px(30),
                right: px(30),
                bottom: px(22),
                fontFamily: MONO,
                fontSize: px(9),
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: ink(0.55),
              }}
            >
              <span>ArtifySlide · {t("heroSpec.themeName")}</span>
              <span>№ 01 / 2026</span>
            </div>

            {/* 悬停遮罩:强化「可点击」 */}
            <div
              className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: ink(0.4) }}
            >
              <span
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-5 shadow-lg"
                style={{ height: px(44), fontFamily: SANS, fontSize: px(15), fontWeight: 600, color: INK }}
              >
                <span
                  aria-hidden
                  className="inline-block h-0 w-0"
                  style={{
                    borderTop: "6px solid transparent",
                    borderBottom: "6px solid transparent",
                    borderLeft: `9px solid ${ACCENT}`,
                  }}
                />
                {t("heroSpec.cta")} →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 下方常驻按钮:不悬停也知道可点 */}
      <div className="mt-6 flex justify-center">
        <span className="inline-flex h-10 items-center gap-2 rounded-full border border-accent px-5 text-[13.5px] font-medium text-accent transition-colors group-hover:bg-accent group-hover:text-white">
          <span
            aria-hidden
            className="inline-block h-0 w-0"
            style={{
              borderTop: "4px solid transparent",
              borderBottom: "4px solid transparent",
              borderLeft: "6px solid currentColor",
            }}
          />
          {t("heroSpec.cta")}
          <span aria-hidden>→</span>
        </span>
      </div>
    </a>
  );
}
