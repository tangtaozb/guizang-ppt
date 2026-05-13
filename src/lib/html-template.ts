import { TEMPLATE_CSS } from "./template-css";
import { TEMPLATE_CSS_SWISS } from "./template-css-swiss";

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

function detectSwissStyle(html: string): boolean {
  return html.includes("--accent:") && html.includes("--grey-1:");
}

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

  const isSwiss = detectSwissStyle(processed);

  // Replace Google Fonts with China-accessible mirror
  processed = processed.replace(
    /https:\/\/fonts\.googleapis\.com\/css2\?[^"']*/g,
    FONT_URL
  );
  processed = processed.replace(
    /https:\/\/fonts\.gstatic\.com/g,
    "https://gstatic.loli.net"
  );

  // Inject template CSS based on detected style
  const css = isSwiss ? TEMPLATE_CSS_SWISS : TEMPLATE_CSS;
  const templateStyle = `<style id="guizang-base">${css}</style>`;

  if (processed.includes("</style>")) {
    const firstStyleEnd = processed.indexOf("</style>");
    const firstStyleStart = processed.lastIndexOf("<style", firstStyleEnd);
    if (firstStyleStart !== -1) {
      const aiStyleContent = processed.substring(firstStyleStart, firstStyleEnd + 8);
      const rootMatch = aiStyleContent.match(/:root\s*\{[^}]+\}/);
      const themeOverride = rootMatch ? `<style id="guizang-theme">${rootMatch[0]}</style>` : "";
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

  // Inject navigation script — Swiss uses #deck transform, e-ink uses scroll snap
  const navScript = isSwiss
    ? `<script>
(function(){
  var deck=document.getElementById('deck'),slides=document.querySelectorAll('.slide'),idx=0,busy=false,total=slides.length;
  function go(i){if(busy||i<0||i>=total)return;busy=true;idx=i;deck.style.transform='translateX(-'+idx*100+'vw)';setTimeout(function(){busy=false},700);
    var dots=document.querySelectorAll('#nav .dot');dots.forEach(function(d,j){d.classList.toggle('active',j===idx)});
  }
  document.addEventListener('wheel',function(e){e.preventDefault();go(idx+(e.deltaY>0?1:-1))},{passive:false});
  document.addEventListener('keydown',function(e){if(e.key==='ArrowRight')go(idx+1);else if(e.key==='ArrowLeft')go(idx-1)});
  var nav=document.getElementById('nav');if(!nav){nav=document.createElement('div');nav.id='nav';document.body.appendChild(nav)}
  nav.innerHTML='';for(var i=0;i<total;i++){var d=document.createElement('button');d.className='dot'+(i===0?' active':'');d.dataset.i=i;d.onclick=function(){go(+this.dataset.i)};nav.appendChild(d)}
})();
</script>`
    : `<script>
(function(){
  var slides=document.querySelectorAll('.slide'),idx=0,busy=false;
  function go(i){if(busy||i<0||i>=slides.length)return;busy=true;idx=i;slides[i].scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'});setTimeout(function(){busy=false},600)}
  document.addEventListener('wheel',function(e){e.preventDefault();go(idx+(e.deltaY>0?1:-1))},{passive:false});
  document.addEventListener('keydown',function(e){if(e.key==='ArrowRight')go(idx+1);else if(e.key==='ArrowLeft')go(idx-1)});
})();
</script>`;

  if (processed.includes("</body>")) {
    processed = processed.replace("</body>", navScript + "</body>");
  }

  return processed;
}
