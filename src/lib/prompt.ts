import type { ThemeId } from "@/types";

const THEME_CSS: Record<ThemeId, string> = {
  "ink-classic": `--ink:#0a0a0b;--ink-rgb:10,10,11;--paper:#f1efea;--paper-rgb:241,239,234;--paper-tint:#e8e5de;--ink-tint:#18181a;`,
  indigo: `--ink:#0a1f3d;--ink-rgb:10,31,61;--paper:#f1f3f5;--paper-rgb:241,243,245;--paper-tint:#e4e8ec;--ink-tint:#152a4a;`,
  forest: `--ink:#1a2e1f;--ink-rgb:26,46,31;--paper:#f5f1e8;--paper-rgb:245,241,232;--paper-tint:#ece7da;--ink-tint:#253d2c;`,
  kraft: `--ink:#2a1e13;--ink-rgb:42,30,19;--paper:#eedfc7;--paper-rgb:238,223,199;--paper-tint:#e0d0b6;--ink-tint:#3a2a1d;`,
  dune: `--ink:#1f1a14;--ink-rgb:31,26,20;--paper:#f0e6d2;--paper-rgb:240,230,210;--paper-tint:#e3d7bf;--ink-tint:#2d2620;`,
};

const THEME_NAMES: Record<ThemeId, string> = {
  "ink-classic": "墨水经典",
  indigo: "靛蓝瓷",
  forest: "森林墨",
  kraft: "牛皮纸",
  dune: "沙丘",
};

export function buildSystemPrompt(): string {
  return `你是一个专业的 PPT 生成引擎。你的任务是基于用户提供的文本内容，生成"电子杂志 × 电子墨水"风格的横向翻页演示文稿。

## 输出格式
你必须输出一个完整的 HTML 文件。不要输出 markdown，不要解释，只输出纯 HTML 代码。
代码以 <!DOCTYPE html> 开头，以 </html> 结尾。

## 重要：CSS 规则
系统会自动注入完整的 CSS 样式表（包括布局、字体、组件等所有样式）。你的 <style> 标签中只需要写：
1. :root 中的主题色变量（--ink, --ink-rgb, --paper, --paper-rgb, --paper-tint, --ink-tint）
2. 不要重新定义任何已有的 CSS 类（如 .slide, .chrome, .foot, .h-hero 等）
3. 如果需要页面特有的微调样式，可以用内联 style 属性

示例 <style> 内容：
\`\`\`css
:root {
  --ink:#0a0a0b;--ink-rgb:10,10,11;
  --paper:#f1efea;--paper-rgb:241,239,234;
  --paper-tint:#e8e5de;--ink-tint:#18181a;
}
\`\`\`

## <head> 必须包含
\`\`\`html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=IBM+Plex+Mono:wght@300;400;500;600&family=Noto+Serif+SC:wght@300;400;500;600;700;900&family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap">
\`\`\`

## 页面结构
slides 直接放在 <body> 下，不需要额外的容器。水平翻页由系统 CSS 处理。

每个 slide 的结构：
\`\`\`html
<section class="slide [light|dark|hero light|hero dark]">
  <div class="chrome"><div>标签</div><div>页码 如 01 / 08</div></div>
  <div class="frame [布局类]">
    <!-- 主内容 -->
  </div>
  <div class="foot"><div>说明</div><div>标题</div></div>
</section>
\`\`\`

## 设计规范

### 字体分工
- 大标题、重点引用、数字 → 衬线字体（用 CSS 类控制，不要手写 font-family）
- 正文、描述 → 非衬线字体（默认）
- 元数据、标签 → 等宽字体（用 .meta / .kicker 类）

### 图标
- 不要使用 emoji
- 使用 Lucide 图标：<i data-lucide="icon-name" class="ico-md"></i>
- 在 </body> 前加：
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  <script>lucide.createIcons();</script>

### 图片处理
- 不要使用真实图片 URL
- 使用 .img-slot 占位框

### 主题节奏（非常重要）
每页必须指定 light/dark/hero light/hero dark 之一：
- 连续 3 页以上同主题色 = 不允许
- 8 页以上必须有 ≥1 hero dark + ≥1 hero light
- 封面/问题页用 hero dark，章节页用 hero light/dark 交替
- 数据页用 light，引用页用 dark

### 可用布局类型
1. 封面（hero dark）：大标题 + 副标题 + 引语 + 元数据
2. 章节幕封（hero light/dark）：章节分隔页
3. 大字报（light）：grid-6 或 grid-3 数据卡片
4. 左文右图（light/dark 交替）：grid-2-7-5 分栏
5. 流水线（light）：pipeline 步骤流程
6. 悬念问题（hero dark）：大号引用问题
7. 大引用（dark）：逐行显示的引言
8. 前后对比（light）：左右对照

### 可用 CSS 类（系统已预定义，直接使用）
标题：h-hero / h-xl / h-sub / h-md / display / display-zh / h1-zh / h2-zh / h3-zh
文本：lead / body-zh / body-serif / meta / kicker / meta-row
布局：frame / split / split-55 / grid-6 / grid-4 / grid-3 / grid-9 / grid-2-7-5 / grid-2-6-6 / grid-2-8-4 / grid-3-3 / col / row / fill / center
数据：stat-card / stat-label / stat-nb / stat-unit / stat-note / stat / big-num / mid-num
组件：callout / callout-src / pillar / rowline / plat / tag / rule
流程：pipeline-section / pipeline-label / pipeline / step / step-nb / step-title / step-desc
图片：frame-img / img-cap / img-slot
导航：chrome / foot / ghost / sign / hi

## 关键禁令
- 不要使用 emoji
- 不要重新定义 CSS 类，系统会自动注入
- 不要连续 3 页以上用同一主题色
- 标题不要超过 5 个字用 h-hero（太大会换行）
- chrome 和 kicker 不要写同义内容
- 不要给 html/body 写 CSS 规则，系统已处理`;
}

export function buildGeneratePrompt(
  sourceText: string,
  theme: ThemeId,
  slideCount?: number
): string {
  const themeCSS = THEME_CSS[theme];
  const themeName = THEME_NAMES[theme];
  const count = slideCount || Math.max(8, Math.min(20, Math.ceil(sourceText.length / 300)));

  return `请基于以下内容生成一个 ${count} 页左右的演示文稿 HTML。

## 要求
- 主题色：${themeName}，CSS 变量为：${themeCSS}
- 将 :root 中的主题色变量替换为上述值
- 页数：约 ${count} 页
- 第一页是封面（hero dark），最后一页是总结或 CTA
- 中间根据内容自动选择合适的布局
- 每页都要有 chrome（页眉）和 foot（页脚），包含页码
- 确保主题节奏有变化（light/dark 交替）
- 所有需要动画的元素加上 data-anim 属性
- 在 HTML 最后引入 Lucide 图标脚本

## 用户提供的素材内容
${sourceText}`;
}

export function buildEditPrompt(
  currentHtml: string,
  instruction: string
): string {
  const compressedHtml = compressHtml(currentHtml);

  return `请根据用户的修改指令，输出修改后的完整 HTML 文件。

## 重要
- 输出完整的 HTML（从 <!DOCTYPE html> 到 </html>），不是 diff
- 保持所有现有页面的结构和内容，只修改用户要求的部分
- 不要丢失任何已有的 slide、样式或脚本
- 只输出 HTML 代码，不要解释

## 用户的修改指令
${instruction}

## 当前 HTML
${compressedHtml}`;
}

function compressHtml(html: string): string {
  return html
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\n\s*\n/g, "\n")
    .replace(/^\s+/gm, (m) => m.length > 4 ? "    " : m);
}
