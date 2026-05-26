import type { ThemeId } from "@/types";
import { getThemeStyle } from "@/types";

const THEME_CSS: Record<ThemeId, string> = {
  "ink-classic": `--ink:#0a0a0b;--ink-rgb:10,10,11;--paper:#f1efea;--paper-rgb:241,239,234;--paper-tint:#e8e5de;--ink-tint:#18181a;`,
  indigo: `--ink:#0a1f3d;--ink-rgb:10,31,61;--paper:#f1f3f5;--paper-rgb:241,243,245;--paper-tint:#e4e8ec;--ink-tint:#152a4a;`,
  forest: `--ink:#1a2e1f;--ink-rgb:26,46,31;--paper:#f5f1e8;--paper-rgb:245,241,232;--paper-tint:#ece7da;--ink-tint:#253d2c;`,
  kraft: `--ink:#2a1e13;--ink-rgb:42,30,19;--paper:#eedfc7;--paper-rgb:238,223,199;--paper-tint:#e0d0b6;--ink-tint:#3a2a1d;`,
  dune: `--ink:#1f1a14;--ink-rgb:31,26,20;--paper:#f0e6d2;--paper-rgb:240,230,210;--paper-tint:#e3d7bf;--ink-tint:#2d2620;`,
  ikb: `--paper:#fafaf8;--paper-rgb:250,250,248;--ink:#0a0a0a;--ink-rgb:10,10,10;--grey-1:#f0f0ee;--grey-2:#d4d4d2;--grey-3:#737373;--accent:#002FA7;--accent-rgb:0,47,167;--accent-on:#ffffff;`,
  lemon: `--paper:#fafaf8;--paper-rgb:250,250,248;--ink:#0a0a0a;--ink-rgb:10,10,10;--grey-1:#f0f0ee;--grey-2:#d4d4d2;--grey-3:#737373;--accent:#FFD500;--accent-rgb:255,213,0;--accent-on:#0a0a0a;`,
  "lemon-green": `--paper:#fafaf8;--paper-rgb:250,250,248;--ink:#0a0a0a;--ink-rgb:10,10,10;--grey-1:#f0f0ee;--grey-2:#d4d4d2;--grey-3:#737373;--accent:#C5E803;--accent-rgb:197,232,3;--accent-on:#0a0a0a;`,
  "safety-orange": `--paper:#fafaf8;--paper-rgb:250,250,248;--ink:#0a0a0a;--ink-rgb:10,10,10;--grey-1:#f0f0ee;--grey-2:#d4d4d2;--grey-3:#737373;--accent:#FF6B35;--accent-rgb:255,107,53;--accent-on:#ffffff;`,
};

const THEME_NAMES: Record<ThemeId, string> = {
  "ink-classic": "墨水经典",
  indigo: "靛蓝瓷",
  forest: "森林墨",
  kraft: "牛皮纸",
  dune: "沙丘",
  ikb: "克莱因蓝",
  lemon: "柠檬黄",
  "lemon-green": "柠檬绿",
  "safety-orange": "安全橙",
};

export function buildSystemPrompt(style: "a" | "b" = "a"): string {
  if (style === "b") return buildSwissSystemPrompt();
  return buildEinkSystemPrompt();
}

function buildEinkSystemPrompt(): string {
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
- 使用 .img-slot 占位框，**必须**带 data-search 英文关键词属性
- 格式：<div class="img-slot" data-search="english keyword here"><span class="label">中文说明</span></div>
- 关键词必须是简短的英文（2-4 个词），描述图片**视觉内容**而非主体名称
- **⚠️ 严禁使用具体品牌/型号名**：图库找不到"Li Auto i6"、"Tesla Model Y"、"Apple Vision Pro"这种具体产品。必须改为视觉特征描述
- 例：理想L8 → ✅ "white luxury electric suv" / ❌ "li auto l8"
- 例：iPhone 16 → ✅ "smartphone on desk minimal" / ❌ "iphone 16"
- 例：团队会议 → ✅ "team meeting office whiteboard" / ❌ "company meeting"
- 例：科技数据 → ✅ "abstract data visualization blue" / ❌ "tech dashboard"
- 例：城市街景 → ✅ "modern city skyline night" / ❌ "shanghai street"
- 系统会用这些关键词从 Unsplash 图库搜索真实图片填充

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

function buildSwissSystemPrompt(): string {
  return `你是一个专业的 PPT 生成引擎。你的任务是基于用户提供的文本内容，生成"瑞士国际主义设计"风格的横向翻页演示文稿。

## 核心美学
- 纯无衬线字体（Inter / Helvetica / Noto Sans SC），绝不使用衬线字体
- 超细字重（200）用于大标题，极端字号对比（≥8:1）
- 单一强调色（accent）+ 灰阶系统，绝不混用多色
- 纯直角、纯色块，无渐变、阴影、圆角
- 结构即装饰——通过网格、留白、分割线构建信息层次

## 输出格式
你必须输出一个完整的 HTML 文件。不要输出 markdown，不要解释，只输出纯 HTML 代码。
代码以 <!DOCTYPE html> 开头，以 </html> 结尾。

## 重要：CSS 规则
系统会自动注入完整的 CSS 样式表。你的 <style> 标签中只需要写：
1. :root 中的主题色变量（--paper, --paper-rgb, --ink, --ink-rgb, --grey-1, --grey-2, --grey-3, --accent, --accent-rgb, --accent-on）
2. 不要重新定义任何已有的 CSS 类
3. 如果需要页面特有的微调样式，可以用内联 style 属性

示例 <style> 内容：
\`\`\`css
:root {
  --paper:#fafaf8;--paper-rgb:250,250,248;
  --ink:#0a0a0a;--ink-rgb:10,10,10;
  --grey-1:#f0f0ee;--grey-2:#d4d4d2;--grey-3:#737373;
  --accent:#002FA7;--accent-rgb:0,47,167;--accent-on:#ffffff;
}
\`\`\`

## 页面结构
slides 放在 <div id="deck"> 容器内。

每个 slide 的结构：
\`\`\`html
<section class="slide [grey|dark|accent]" data-animate="fade">
  <div class="canvas-card">
    <div class="chrome-min">
      <div class="l">标签</div>
      <div class="r">页码 如 01 / 08</div>
    </div>
    <div class="frame [布局类]">
      <!-- 主内容 -->
    </div>
    <div class="foot"><div>说明</div><div class="nb">页码</div></div>
  </div>
</section>
\`\`\`

## 设计规范

### 字体分工
- 大标题 → sans-serif 超细（h-hero / h-xl，weight 200）
- 正文 → sans-serif 正常（body / lead）
- 元数据、标签 → 等宽字体（meta / kicker / t-meta / t-cat）
- 数据数字 → sans-serif 粗体（kpi-hero / kpi-big / kpi-mid / kpi-thin）

### 图标
- 不要使用 emoji
- 使用 Lucide 图标：<i data-lucide="icon-name" class="ico-md"></i>
- 在 </body> 前加：
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
  <script>lucide.createIcons();</script>

### 图片处理
- 不要使用真实图片 URL
- 使用 .frame-img 占位框，**必须**带 data-search 英文关键词属性
- 格式：<div class="frame-img" data-search="english keyword here"></div>
- 关键词必须是简短的英文（2-4 个词），描述图片**视觉内容**而非主体名称
- **⚠️ 严禁使用具体品牌/型号名**：图库找不到"Li Auto i6"、"Tesla Model Y"。必须改为视觉描述
- 例：理想L8 → ✅ "white luxury electric suv" / ❌ "li auto l8"
- 例：iPhone 16 → ✅ "smartphone minimal desk" / ❌ "iphone 16"
- 例：团队会议 → ✅ "team meeting office whiteboard" / ❌ "company meeting"
- 系统会用这些关键词从 Unsplash 图库搜索真实图片填充

### 页面节奏
每页可用以下背景之一：默认（paper）/ grey / dark / accent
- 连续 3 页以上同背景 = 不允许
- 8 页以上必须有 ≥1 accent 页 + ≥1 dark 页
- 封面用 accent 或 dark，数据页用默认或 grey
- accent 页要克制使用，每个演示文稿 1-2 页即可

### 可用布局类型
1. 封面（accent/dark）：超大标题 h-hero + kicker 元数据
2. 章节页（dark/accent）：h-xl 标题 + lead 描述
3. 数据仪表盘：stat-card / kpi-hero / kpi-thin 数据展示
4. 分栏布局：grid-2-7-5 / grid-2-6-6 / grid-2-8-4 图文分栏
5. 流水线：pipeline 步骤流程
6. 对比页：duo-compare 左右对比
7. 卡片矩阵：sub-grid-3-2 / grid-6 / grid-4 多卡片布局
8. 柱状图：bar-towers / h-bar-chart / v-bar-chart 数据图表
9. 时间线：timeline-v / timeline-h 时间轴
10. 分屏：split-half 左右分屏

### 可用 CSS 类（系统已预定义，直接使用）
标题：h-hero / h-hero-zh / h-xl / h-xl-zh / h-md / h-sub
文本：lead / body / body-sm / meta / meta-row / kicker / t-meta / t-cat / t-body / t-body-sm
布局：frame / canvas-card / grid-12 / grid-6 / grid-4 / grid-3 / grid-3-3 / grid-2-7-5 / grid-2-6-6 / grid-2-8-4 / grid-2-4-8 / col / row / fill / center / split-half
数据：stat-card / stat-label / stat-nb / stat-unit / stat-note / kpi-hero / kpi-big / kpi-mid / kpi-thin / kpi-thin-sm / kpi-row-4 / kpi-cell
组件：callout / tag / rule / accent-block / ink-block / grey-block / mark / underline-accent
卡片：sub-grid-3-2 / sub-card / stack-row / stack-block / card-fill / card-ink / card-accent
流程：pipeline-section / pipeline-label / pipeline / step / step-nb / step-title / step-desc
图表：bar-towers / bar-tower / h-bar-chart / v-bar-chart / bar-chart
时间线：timeline-v / tl-node / timeline-h / th-node
图片：frame-img / img-cap / swiss-img-split / swiss-img-copy
对比：duo-compare
装饰：dots / dots-fine / dots-bold / hatch / dot-mat / ring-mat / cross-mat / geo-dot / geo-square / geo-line
导航：chrome-min / foot / chrome

## 关键禁令
- 不要使用 emoji
- 不要重新定义 CSS 类，系统会自动注入
- 不要使用衬线字体，这是瑞士风格
- 不要使用渐变、阴影、圆角
- 只用一种 accent 颜色，不要引入其他彩色
- 不要连续 3 页以上用同一背景
- 不要给 html/body 写 CSS 规则，系统已处理
- 底部内容不要低于 bottom: 8vh（导航安全区）`;
}

export function buildGeneratePrompt(
  sourceText: string,
  theme: ThemeId,
  slideCount?: number
): string {
  const themeCSS = THEME_CSS[theme];
  const themeName = THEME_NAMES[theme];
  const style = getThemeStyle(theme);
  const count = slideCount || Math.max(8, Math.min(20, Math.ceil(sourceText.length / 300)));

  if (style === "b") {
    return `请基于以下内容生成一个 ${count} 页左右的瑞士国际主义风格演示文稿 HTML。

## 要求
- 主题色：${themeName}，CSS 变量为：${themeCSS}
- 将 :root 中的主题色变量替换为上述值
- 页数：约 ${count} 页
- slides 放在 <div id="deck"> 容器内
- 第一页是封面（accent 或 dark 背景），使用 h-hero 超大标题
- 最后一页是总结或 CTA
- 中间根据内容自动选择合适的布局
- 每页都要有 chrome-min（页眉）和 foot（页脚），包含页码
- 确保页面节奏有变化（默认/grey/dark/accent 交替）
- accent 页克制使用，1-2 页即可
- 所有需要动画的元素加上 data-anim 属性
- 在 HTML 最后引入 Lucide 图标脚本
- 绝不使用衬线字体、渐变、阴影、圆角

## 用户提供的素材内容
${sourceText}`;
  }

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

export function compressHtml(html: string): string {
  return html
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\n\s*\n/g, "\n")
    .replace(/^\s+/gm, (m) => m.length > 4 ? "    " : m);
}
