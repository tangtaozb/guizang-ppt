import PptxGenJS from "pptxgenjs";

interface SlideData {
  isDark: boolean;
  isHero: boolean;
  chrome: { left: string; right: string };
  foot: { left: string; right: string };
  texts: { text: string; className: string }[];
}

function cssVarToHex(html: string, varName: string, fallback: string): string {
  const re = new RegExp(`${varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:\\s*([^;]+)`);
  const m = html.match(re);
  if (!m) return fallback;
  const val = m[1].trim();
  if (val.startsWith("#")) return val.replace("#", "");
  return fallback;
}

function parseSlides(html: string): { slides: SlideData[]; ink: string; paper: string } {
  const ink = cssVarToHex(html, "--ink", "0a0a0b");
  const paper = cssVarToHex(html, "--paper", "f1efea");

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const sections = doc.querySelectorAll(".slide");

  const slides: SlideData[] = [];

  sections.forEach((section) => {
    const classList = Array.from(section.classList);
    const isDark = classList.includes("dark");
    const isHero = classList.includes("hero");

    const chromeEl = section.querySelector(".chrome");
    const footEl = section.querySelector(".foot");
    const chrome = { left: "", right: "" };
    const foot = { left: "", right: "" };

    if (chromeEl) {
      const kids = chromeEl.children;
      chrome.left = kids[0]?.textContent?.trim() || "";
      chrome.right = kids[1]?.textContent?.trim() || "";
    }
    if (footEl) {
      const kids = footEl.children;
      foot.left = kids[0]?.textContent?.trim() || "";
      foot.right = kids[1]?.textContent?.trim() || "";
    }

    const texts: { text: string; className: string }[] = [];
    const frame = section.querySelector(".frame") || section;

    const walk = (el: Element) => {
      if (["SCRIPT", "STYLE"].includes(el.tagName)) return;
      if (el.classList.contains("chrome") || el.classList.contains("foot")) return;

      const cls = el.className || "";
      const txt = el.textContent?.trim() || "";

      const isLeaf =
        el.children.length === 0 ||
        el.classList.contains("h-hero") ||
        el.classList.contains("h-xl") ||
        el.classList.contains("h-sub") ||
        el.classList.contains("h-md") ||
        el.classList.contains("display-zh") ||
        el.classList.contains("h1-zh") ||
        el.classList.contains("h2-zh") ||
        el.classList.contains("h3-zh") ||
        el.classList.contains("lead") ||
        el.classList.contains("body-zh") ||
        el.classList.contains("body-serif") ||
        el.classList.contains("kicker") ||
        el.classList.contains("meta") ||
        el.classList.contains("meta-row") ||
        el.classList.contains("stat-card") ||
        el.classList.contains("step") ||
        el.classList.contains("callout") ||
        el.classList.contains("pillar") ||
        el.classList.contains("big-num") ||
        el.classList.contains("mid-num") ||
        el.classList.contains("stat-nb") ||
        el.classList.contains("tag");

      if (isLeaf && txt) {
        texts.push({ text: txt, className: typeof cls === "string" ? cls : "" });
      } else {
        Array.from(el.children).forEach(walk);
      }
    };

    walk(frame);
    slides.push({ isDark, isHero, chrome, foot, texts });
  });

  return { slides, ink, paper };
}

function classToFontSize(cls: string): number {
  if (cls.includes("h-hero") || cls.includes("display")) return 48;
  if (cls.includes("h-xl")) return 40;
  if (cls.includes("h1-zh")) return 36;
  if (cls.includes("h2-zh") || cls.includes("h-md")) return 28;
  if (cls.includes("h3-zh") || cls.includes("h-sub")) return 22;
  if (cls.includes("big-num")) return 60;
  if (cls.includes("mid-num")) return 36;
  if (cls.includes("stat-nb")) return 32;
  if (cls.includes("lead")) return 18;
  if (cls.includes("body-zh") || cls.includes("body-serif")) return 14;
  if (cls.includes("kicker") || cls.includes("meta") || cls.includes("tag")) return 10;
  if (cls.includes("stat-label") || cls.includes("stat-note") || cls.includes("stat-unit")) return 10;
  if (cls.includes("step-title")) return 16;
  if (cls.includes("step-desc") || cls.includes("step-nb")) return 11;
  return 14;
}

function classToFontFace(cls: string): string {
  if (
    cls.includes("h-hero") ||
    cls.includes("h-xl") ||
    cls.includes("h1-zh") ||
    cls.includes("h2-zh") ||
    cls.includes("h3-zh") ||
    cls.includes("h-sub") ||
    cls.includes("h-md") ||
    cls.includes("display-zh") ||
    cls.includes("lead") ||
    cls.includes("body-serif")
  ) {
    return "Noto Serif SC";
  }
  if (
    cls.includes("big-num") ||
    cls.includes("mid-num") ||
    cls.includes("stat-nb") ||
    cls.includes("display") && !cls.includes("zh")
  ) {
    return "Playfair Display";
  }
  if (cls.includes("kicker") || cls.includes("meta") || cls.includes("mono") || cls.includes("tag")) {
    return "IBM Plex Mono";
  }
  return "Noto Sans SC";
}

function isBold(cls: string): boolean {
  return (
    cls.includes("h-hero") ||
    cls.includes("h-xl") ||
    cls.includes("h1-zh") ||
    cls.includes("h2-zh") ||
    cls.includes("display") ||
    cls.includes("big-num") ||
    cls.includes("mid-num") ||
    cls.includes("stat-nb")
  );
}

export async function exportPptx(html: string) {
  const { slides, ink, paper } = parseSlides(html);
  if (slides.length === 0) return;

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE", width: 13.33, height: 7.5 });
  pptx.layout = "WIDE";

  for (const slideData of slides) {
    const bg = slideData.isDark ? ink : paper;
    const fg = slideData.isDark ? paper : ink;
    const fgMuted = slideData.isDark ? paper : ink;

    const slide = pptx.addSlide();
    slide.background = { color: bg };

    // Chrome (header)
    if (slideData.chrome.left) {
      slide.addText(slideData.chrome.left.toUpperCase(), {
        x: 0.6, y: 0.4, w: 5, h: 0.3,
        fontSize: 8, fontFace: "IBM Plex Mono",
        color: fgMuted, transparency: 40,
        charSpacing: 3,
      });
    }
    if (slideData.chrome.right) {
      slide.addText(slideData.chrome.right, {
        x: 7.5, y: 0.4, w: 5.2, h: 0.3,
        fontSize: 8, fontFace: "IBM Plex Mono",
        color: fgMuted, transparency: 40,
        align: "right", charSpacing: 3,
      });
    }

    // Footer
    if (slideData.foot.left) {
      slide.addText(slideData.foot.left.toUpperCase(), {
        x: 0.6, y: 6.9, w: 5, h: 0.3,
        fontSize: 8, fontFace: "IBM Plex Mono",
        color: fgMuted, transparency: 50,
        charSpacing: 2,
      });
    }
    if (slideData.foot.right) {
      slide.addText(slideData.foot.right, {
        x: 7.5, y: 6.9, w: 5.2, h: 0.3,
        fontSize: 9, fontFace: "Noto Serif SC",
        color: fgMuted, transparency: 50,
        align: "right",
      });
    }

    // Main content
    let yPos = 1.2;
    const xMargin = 0.8;
    const maxW = 11.7;

    for (const item of slideData.texts) {
      const fontSize = classToFontSize(item.className);
      const fontFace = classToFontFace(item.className);
      const bold = isBold(item.className);
      const isTitle = fontSize >= 28;
      const isSmall = fontSize <= 11;

      const lineH = isTitle ? fontSize * 1.1 / 72 : fontSize * 1.6 / 72;
      const estimatedLines = Math.ceil(item.text.length / (isTitle ? 20 : 50));
      const blockH = Math.max(lineH * estimatedLines + 0.1, 0.4);

      if (yPos + blockH > 6.6) break;

      const align = (slideData.isHero && isTitle) ? "center" as const : "left" as const;
      const x = (slideData.isHero && isTitle) ? 1.0 : xMargin;
      const w = (slideData.isHero && isTitle) ? 11.3 : maxW;

      slide.addText(item.text, {
        x, y: yPos, w, h: blockH,
        fontSize, fontFace, bold,
        color: fg,
        transparency: isSmall ? 40 : 0,
        align,
        lineSpacingMultiple: isTitle ? 1.0 : 1.5,
        valign: "top",
      });

      yPos += blockH + (isTitle ? 0.15 : 0.08);
    }
  }

  await pptx.writeFile({ fileName: "presentation.pptx" });
}
