"use client";

import { useEffect, useRef, useState } from "react";
import { THEMES, ThemeThumb } from "@/components/landing/theme-thumb";

const INTERVAL_MS = 3500;

/**
 * Hero 右侧风格展示器：
 * - 堆叠 9 套主题缩略图，crossfade 切换
 * - 自动每 3.5s 轮播下一套
 * - 鼠标悬停暂停
 * - 下方圆点可手动点击切换
 * - ResizeObserver 让 ThemeThumb 自适应容器宽度
 */
export function HeroShowcase() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(520);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // 测量舞台宽度，驱动 ThemeThumb 等比渲染
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 自动轮播
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % THEMES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused]);

  const current = THEMES[active];

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 舞台 — 堆叠 crossfade */}
      <div
        ref={stageRef}
        className="relative w-full overflow-hidden rounded-md"
        style={{
          aspectRatio: "16 / 9",
          boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 40px 80px -40px rgba(20,20,20,0.28)",
        }}
      >
        {THEMES.map((th, i) => (
          <div
            key={th.id}
            className="absolute inset-0 transition-opacity duration-700 ease-out"
            style={{
              opacity: i === active ? 1 : 0,
              pointerEvents: i === active ? "auto" : "none",
            }}
            aria-hidden={i !== active}
          >
            <ThemeThumb theme={th} width={width} />
          </div>
        ))}
      </div>

      {/* 控制条 — 圆点指示器 + 当前主题名 */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          {THEMES.map((th, i) => (
            <button
              key={th.id}
              type="button"
              aria-label={`切换到 ${th.zh} / ${th.en}`}
              onClick={() => setActive(i)}
              className="h-1.5 rounded-full transition-all duration-300 hover:opacity-70"
              style={{
                width: i === active ? 22 : 6,
                background: i === active ? "var(--color-accent)" : "var(--color-border)",
              }}
            />
          ))}
        </div>
        <div className="font-mono text-[12px] tracking-[0.04em] text-muted-foreground whitespace-nowrap">
          {current.zh}
          <span className="opacity-50"> · {current.en}</span>
        </div>
      </div>
    </div>
  );
}
