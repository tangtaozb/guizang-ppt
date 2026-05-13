import { TEMPLATE_CSS } from "./template-css";

export function getTemplateShell(themeCSS: string): { head: string; tail: string } {
  const head = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">`;

  const tail = `
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"><\/script>
<script>lucide.createIcons();<\/script>
</body>
</html>`;

  return { head, tail };
}

const FONT_URL = "https://fonts.loli.net/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&family=IBM+Plex+Mono:wght@300;400;500;600&family=Noto+Serif+SC:wght@300;400;500;600;700;900&family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap";

export function postProcessHtml(html: string): string {
  let processed = html;

  // Extract only the HTML content — strip explanatory text and markdown code fences
  const doctypeIdx = processed.indexOf("<!DOCTYPE html>");
  if (doctypeIdx === -1) {
    const htmlIdx = processed.indexOf("<html");
    if (htmlIdx > 0) processed = processed.substring(htmlIdx);
  } else if (doctypeIdx > 0) {
    processed = processed.substring(doctypeIdx);
  }
  const htmlEndIdx = processed.lastIndexOf("</html>");
  if (htmlEndIdx !== -1) {
    processed = processed.substring(0, htmlEndIdx + 7);
  }

  // Replace Google Fonts with China-accessible mirror
  processed = processed.replace(
    /https:\/\/fonts\.googleapis\.com\/css2\?[^"']*/g,
    FONT_URL
  );
  processed = processed.replace(
    /https:\/\/fonts\.gstatic\.com/g,
    "https://gstatic.loli.net"
  );

  // Inject template CSS: find the first </style> or </head> and prepend our CSS
  // This ensures the template CSS is always present with correct scroll/layout behavior
  const templateStyle = `<style id="guizang-base">${TEMPLATE_CSS}</style>`;

  if (processed.includes("</style>")) {
    // Insert template CSS before the first AI-generated </style> so template comes first
    // and AI's theme variables (:root overrides) come after
    const firstStyleEnd = processed.indexOf("</style>");
    const firstStyleStart = processed.lastIndexOf("<style", firstStyleEnd);
    if (firstStyleStart !== -1) {
      // Extract the AI's style block content to check for :root theme variables
      const aiStyleContent = processed.substring(firstStyleStart, firstStyleEnd + 8);
      // Extract only :root block from AI's styles (theme variables)
      const rootMatch = aiStyleContent.match(/:root\s*\{[^}]+\}/);
      const themeOverride = rootMatch ? `<style id="guizang-theme">${rootMatch[0]}</style>` : "";
      // Replace the entire AI style block with template CSS + theme overrides only
      processed = processed.substring(0, firstStyleStart) + templateStyle + themeOverride + processed.substring(firstStyleEnd + 8);
    }
  } else if (processed.includes("</head>")) {
    processed = processed.replace("</head>", templateStyle + "</head>");
  }

  // Ensure font link is present
  if (!processed.includes("fonts.loli.net") && !processed.includes("fonts.googleapis.com")) {
    const fontLink = `<link rel="stylesheet" href="${FONT_URL}">`;
    if (processed.includes("</head>")) {
      processed = processed.replace("</head>", fontLink + "</head>");
    }
  }

  // Inject scroll navigation script (converts vertical scroll + arrow keys to horizontal page navigation)
  const navScript = `<script>
(function(){
  var slides=document.querySelectorAll('.slide'),idx=0,busy=false;
  function go(i){if(busy||i<0||i>=slides.length)return;busy=true;idx=i;slides[i].scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'});setTimeout(function(){busy=false},600)}
  document.addEventListener('wheel',function(e){e.preventDefault();go(idx+(e.deltaY>0?1:-1))},{passive:false});
  document.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key===' ')go(idx+1);else if(e.key==='ArrowLeft')go(idx-1)});
})();
</script>`;
  if (processed.includes("</body>")) {
    processed = processed.replace("</body>", navScript + "</body>");
  }

  return processed;
}
