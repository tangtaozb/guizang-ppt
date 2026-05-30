"use client";

import { useEffect, useRef, useState } from "react";

// 首屏 hero 的「杂志风格 PPT」样张 —— 单一精制实物，区别于下方 9 宫格缩略图。
// 墨韵经典 / 朱砂 palette，16:9 横向幻灯片，后方叠层制造成册纵深，淡入上浮 + 永续轻漂浮。

const SERIF = `var(--font-instrument-serif), "Noto Serif SC", "Songti SC", "STSong", serif`;
const MONO = `var(--font-geist-mono), "Geist Mono", ui-monospace, monospace`;
const SANS = `var(--font-geist-sans), "Geist", system-ui, sans-serif`;

const PAPER = "#f6f1e6";
const INK = "#191512";
const ACCENT = "#a72f24";

const ink = (a: number) => `rgba(25,21,18,${a})`;

// 设计基准宽度 520px；其余尺寸按实测宽度等比缩放，保证任意尺寸下版式不变。
const BASE_W = 520;

export function HeroSpecimen() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(BASE_W);

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

  return (
    <div
      className="as-rise"
      style={{ animationDelay: "220ms" }}
      aria-label="ArtifySlide 杂志风格 PPT 样张 · 墨韵经典"
    >
      <div className="as-float">
        <div className="relative mx-auto w-full" style={{ maxWidth: BASE_W }}>
          {/* 后方叠层：暗示「成辑成册」的纵深 */}
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
            className="relative overflow-hidden"
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
            {/* 巨型水印「墨」 */}
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
              墨
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
              style={{
                top: px(50),
                left: px(30),
                width: px(42),
                height: px(3),
                background: ACCENT,
              }}
            />

            {/* 英文 kicker */}
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
              封面特辑 · Cover Story
            </div>

            {/* 主标题（单行大字） */}
            <div
              className="absolute"
              style={{
                top: px(92),
                left: px(30),
                fontFamily: SERIF,
                fontSize: px(64),
                lineHeight: 1.0,
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              纸上烟霞
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
              高级杂志风格 PPT，AI Agent
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
                  fontSize: px(26),
                  color: PAPER,
                  fontWeight: 500,
                }}
              >
                辑
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
              <span>ArtifySlide · 墨韵经典</span>
              <span>№ 01 / 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
