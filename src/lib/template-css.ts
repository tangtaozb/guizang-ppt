export const TEMPLATE_CSS = `
:root{
  --mono:"IBM Plex Mono",ui-monospace,monospace;
  --serif-en:"Playfair Display","Source Serif 4",Georgia,serif;
  --serif-body-en:"Source Serif 4",Georgia,serif;
  --serif-zh:"Noto Serif SC",source-han-serif-sc,serif;
  --sans-zh:"Noto Sans SC",source-han-sans-sc,sans-serif;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-snap-type:x mandatory;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;height:100vh}
html::-webkit-scrollbar{display:none}
body{display:flex;min-width:100vw;height:100vh;font-family:var(--sans-zh);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}

.slide{scroll-snap-align:start;flex:0 0 100vw;width:100vw;height:100vh;position:relative;padding:6vh 6vw 10vh 6vw;display:flex;flex-direction:column;overflow:hidden}
.slide.light{color:var(--ink);background:var(--paper)}
.slide.dark{color:var(--paper);background:var(--ink)}
.slide.hero.light{color:var(--ink);background:var(--paper)}
.slide.hero.dark{color:var(--paper);background:var(--ink)}

.chrome{display:flex;justify-content:space-between;align-items:flex-start;font-family:var(--mono);font-size:max(11px,.78vw);letter-spacing:.2em;text-transform:uppercase;opacity:.62}
.chrome .left,.chrome .right{display:flex;gap:2.4em;align-items:center}
.chrome .sep{width:40px;height:1px;background:currentColor;opacity:.4}
.foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;font-family:var(--mono);font-size:max(11px,.78vw);letter-spacing:.18em;text-transform:uppercase;opacity:.5}
.foot .title{font-family:var(--serif-zh);font-weight:400;letter-spacing:.05em;text-transform:none;opacity:.75;font-size:13px}

.tag{display:inline-block;font-family:var(--mono);font-size:11px;letter-spacing:.24em;text-transform:uppercase;padding:6px 14px;border:1px solid currentColor;opacity:.85}
.rule{width:100%;height:1px;background:currentColor;opacity:.25;margin:3vh 0}
.rule.v{width:1px;height:100%;margin:0}

.kicker{font-family:var(--mono);font-size:12px;letter-spacing:.3em;text-transform:uppercase;opacity:.6;margin-bottom:2.6vh}
.display{font-family:var(--serif-en);font-weight:700;font-size:11vw;line-height:1;letter-spacing:-.025em;padding-top:.06em}
.display-zh{font-family:var(--serif-zh);font-weight:700;font-size:7.8vw;line-height:1.04;letter-spacing:-.005em;padding-top:.05em}
.h1-zh{font-family:var(--serif-zh);font-weight:700;font-size:4.6vw;line-height:1.12;letter-spacing:-.005em}
.h2-zh{font-family:var(--serif-zh);font-weight:600;font-size:3.2vw;line-height:1.2;letter-spacing:0}
.h3-zh{font-family:var(--serif-zh);font-weight:500;font-size:1.9vw;line-height:1.35}
.body-zh{font-family:var(--sans-zh);font-weight:400;font-size:max(15px,1.22vw);line-height:1.75;opacity:.82;letter-spacing:.01em}
.body-serif{font-family:var(--serif-zh);font-weight:400;font-size:max(15px,1.3vw);line-height:1.65;opacity:.88}
.lead{font-family:var(--serif-zh);font-weight:400;font-size:1.75vw;line-height:1.5;opacity:.86}
.meta{font-family:var(--mono);font-size:max(11px,.88vw);letter-spacing:.16em;text-transform:uppercase;opacity:.6}
.big-num{font-family:var(--serif-en);font-weight:800;font-size:10vw;line-height:1;letter-spacing:-.03em;font-feature-settings:"tnum";padding-top:.08em}
.mid-num{font-family:var(--serif-en);font-weight:700;font-size:5.5vw;line-height:1;letter-spacing:-.02em;font-feature-settings:"tnum";padding-top:.06em}
.ghost{font-family:var(--serif-en);font-weight:900;font-size:34vw;line-height:.8;opacity:.06;letter-spacing:-.04em;position:absolute;font-feature-settings:"tnum"}
em{font-style:italic;font-family:var(--serif-en)}
.en{font-family:var(--serif-en);font-style:italic;font-weight:500}

.h-hero{font-family:var(--serif-zh);font-weight:900;font-size:10vw;line-height:1;letter-spacing:-.02em;padding-top:.06em}
.h-xl{font-family:var(--serif-zh);font-weight:700;font-size:6.2vw;line-height:1.08;letter-spacing:-.01em}
.h-sub{font-family:var(--serif-zh);font-weight:500;font-size:3.1vw;line-height:1.25;letter-spacing:0;opacity:.7}
.h-md{font-family:var(--serif-zh);font-weight:600;font-size:2.3vw;line-height:1.3}
.h-hero-en,.h-xl-en{font-family:var(--serif-en);letter-spacing:-.025em}

.meta-row{display:flex;gap:1.2em;align-items:baseline;flex-wrap:wrap;font-family:var(--mono);font-size:max(12px,.92vw);letter-spacing:.16em;text-transform:uppercase;opacity:.6}

.col{display:flex;flex-direction:column;gap:2.4vh}
.row{display:flex;align-items:center;gap:3vw}
.frame{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden}
.frame.grid-2-7-5,.frame.grid-2-6-6,.frame.grid-2-8-4,.frame.grid-3-3,.frame.grid-6{display:grid}
.grid-6{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:4vw 6vw;flex:1;align-content:center;padding:2vh 0}
.grid-9{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:3vh 4vw;flex:1;align-content:center}
.grid-4{display:grid;grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(2,1fr);gap:4vh 6vw;flex:1;align-content:center}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:4vw;flex:1;align-content:center}
.split{display:grid;grid-template-columns:1fr 1fr;gap:4vw;flex:1;align-items:center}
.split-55{display:grid;grid-template-columns:55fr 45fr;gap:5vw;flex:1;align-items:stretch}
.fill{flex:1}
.center{align-items:center;justify-content:center;text-align:center}
.bottom-left{position:absolute;left:6vw;bottom:9vh;max-width:50vw}
.bottom-right{position:absolute;right:6vw;bottom:9vh;max-width:50vw;text-align:right}
.top-right{position:absolute;right:6vw;top:6vh;text-align:right}

.grid-2-7-5{display:grid;grid-template-columns:7fr 5fr;gap:3vw 4vh;align-items:start}
.grid-2-6-6{display:grid;grid-template-columns:1fr 1fr;gap:3vw 4vh;align-items:start}
.grid-2-8-4{display:grid;grid-template-columns:8fr 4fr;gap:3vw 4vh;align-items:start}
.grid-3-3{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:minmax(0,1fr);gap:2.4vh 2vw}

.stat{display:flex;flex-direction:column;gap:1vh;align-items:flex-start}
.stat .n{font-family:var(--serif-en);font-weight:800;font-size:8vw;line-height:.88;letter-spacing:-.03em;font-feature-settings:"tnum"}
.stat .l{font-family:var(--sans-zh);font-size:max(13px,1.05vw);opacity:.7;margin-top:1vh;font-weight:400;line-height:1.5}
.stat .m{font-family:var(--mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;opacity:.5;margin-bottom:.2vh}

.stat-card{display:flex;flex-direction:column;gap:.8vh;align-items:flex-start;padding-top:1.6vh;border-top:1px solid currentColor;border-color:rgba(127,127,127,.3)}
.stat-card .stat-label{font-family:var(--mono);font-size:max(10px,.78vw);letter-spacing:.24em;text-transform:uppercase;opacity:.55}
.stat-card .stat-nb{font-family:var(--serif-en);font-weight:800;font-size:5.8vw;line-height:.9;letter-spacing:-.03em;font-feature-settings:"tnum";margin-top:.4vh}
.stat-card .stat-nb .stat-unit{font-family:var(--serif-zh);font-weight:500;font-size:.38em;letter-spacing:0;opacity:.72;margin-left:.14em}
.stat-card .stat-note{font-family:var(--sans-zh);font-weight:400;font-size:max(13px,1.05vw);line-height:1.5;opacity:.72;margin-top:.6vh}
.grid-4 .stat-card .stat-nb{font-size:5vw}
.grid-3 .stat-card .stat-nb{font-size:6.8vw}

.callout{padding:3vh 2.4vw;border-left:3px solid currentColor;position:relative;font-family:var(--serif-zh);font-size:max(15px,1.2vw);line-height:1.55;opacity:.92}
.slide.light .callout{background:rgba(var(--ink-rgb),.05)}
.slide.dark .callout{background:rgba(var(--paper-rgb),.06)}
.callout .cite,.callout-src{display:block;margin-top:1.6vh;font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;opacity:.6}
.callout .q-big{font-family:var(--serif-zh);font-weight:600;font-size:max(17px,1.6vw);line-height:1.42}

.plat{display:flex;flex-direction:column;justify-content:flex-end;padding:2vh 0;border-top:1px solid currentColor;border-color:rgba(127,127,127,.35)}
.plat .name{font-family:var(--serif-zh);font-weight:700;font-size:1.8vw;margin-bottom:.6vh}
.plat .nb{font-family:var(--serif-en);font-weight:700;font-size:3.2vw;letter-spacing:-.02em;line-height:1;font-feature-settings:"tnum"}
.plat .sub{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;opacity:.55;margin-top:.6vh}

.rowline{display:grid;grid-template-columns:1fr 2fr 1fr;gap:2vw;padding:2.2vh 0;border-top:1px solid currentColor;align-items:center;border-color:rgba(127,127,127,.25)}
.rowline:last-child{border-bottom:1px solid currentColor;border-color:rgba(127,127,127,.25)}
.rowline .k{font-family:var(--serif-zh);font-weight:700;font-size:1.7vw}
.rowline .v{font-family:var(--sans-zh);font-weight:400;font-size:max(14px,1.2vw);opacity:.85;line-height:1.55}
.rowline .m{font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;opacity:.6;justify-self:end}

.pillar{display:flex;flex-direction:column;gap:1.8vh}
.pillar .ic{font-family:var(--serif-en);font-style:italic;font-size:2.6vw;opacity:.45;font-weight:400}
.pillar .ic svg{width:2.8vw;height:2.8vw;stroke-width:1.2;opacity:.7}
.pillar .t{font-family:var(--serif-zh);font-weight:700;font-size:2.4vw;line-height:1.1}
.pillar .d{font-family:var(--sans-zh);font-weight:400;font-size:max(14px,1.1vw);opacity:.76;line-height:1.6}

.sign{font-family:var(--serif-en);font-style:italic;font-weight:500;font-size:2vw;opacity:.7}
.hi{position:relative;display:inline}
.slide.dark .hi::after{content:"";position:absolute;left:-.1em;right:-.1em;bottom:-.05em;height:.28em;background:rgba(var(--paper-rgb),.15);z-index:-1}
.slide.light .hi::after{content:"";position:absolute;left:-.1em;right:-.1em;bottom:-.05em;height:.28em;background:rgba(var(--ink-rgb),.08);z-index:-1}

.ico{width:1em;height:1em;display:inline-block;vertical-align:-.12em;stroke:currentColor;fill:none;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.ico-lg,.ico-md,.ico-sm{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}
.ico-lg{width:2.6vw;height:2.6vw;stroke-width:1.2;display:inline-block}
.ico-md{width:1.8vw;height:1.8vw;stroke-width:1.3;display:inline-block;vertical-align:-.4em}
.ico-sm{width:1.1vw;height:1.1vw;stroke-width:1.4;display:inline-block;vertical-align:-.15em;opacity:.7}

.img-slot{border:1.5px dashed rgba(127,127,127,.4);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1vh;padding:2vh 2vw;font-family:var(--mono);font-size:10px;letter-spacing:.28em;text-transform:uppercase;opacity:.55;position:relative;aspect-ratio:16/9;width:100%;max-height:56vh;margin-inline:auto}
.img-slot::before{content:"";position:absolute;inset:8px;border:1px solid currentColor;opacity:.2}
.img-slot .plus{font-size:2vw;font-weight:300;opacity:.5;letter-spacing:0}
.img-slot .label{position:relative;z-index:2;text-align:center}

.frame-img{overflow:hidden;position:relative;background:rgba(0,0,0,.04);width:100%;border-radius:4px}
.slide.dark .frame-img{background:rgba(255,255,255,.04)}
.frame-img > img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
.frame-img.fit-contain > img{object-fit:contain;object-position:center center}
figure.frame-img{margin:0;display:flex;flex-direction:column;min-width:0}
.img-cap,.frame-cap{display:block;margin-top:.8vh;font-family:var(--mono);font-size:max(10px,.8vw);letter-spacing:.22em;text-transform:uppercase;opacity:.6}

.pipeline-section{margin-top:4.4vh;padding-top:2.8vh;border-top:1px dashed rgba(127,127,127,.32)}
.pipeline-section:first-of-type{border-top:0;padding-top:0;margin-top:3vh}
.pipeline-label{font-family:var(--mono);font-size:max(11px,.85vw);letter-spacing:.24em;text-transform:uppercase;opacity:.62;margin-bottom:2.2vh}
.pipeline{display:grid;grid-template-columns:repeat(5,1fr);gap:1.2vw}
.pipeline[data-cols="3"]{grid-template-columns:repeat(3,1fr)}
.pipeline[data-cols="4"]{grid-template-columns:repeat(4,1fr)}
.pipeline[data-cols="6"]{grid-template-columns:repeat(6,1fr)}
.step{display:flex;flex-direction:column;gap:.8vh;padding-top:1.4vh;border-top:1px solid currentColor;border-color:rgba(127,127,127,.35)}
.step-nb{font-family:var(--serif-en);font-style:italic;font-weight:500;font-size:1.15vw;opacity:.45}
.step-title{font-family:var(--sans-zh);font-weight:700;font-size:1.55vw;letter-spacing:.01em;line-height:1.2}
.step-desc{font-family:var(--sans-zh);font-weight:400;font-size:max(12px,.95vw);line-height:1.45;opacity:.72}

[data-anim]{opacity:1}

@media(max-width:900px){
  .display{font-size:16vw}.display-zh{font-size:12vw}.h1-zh{font-size:7vw}
  .h-hero{font-size:14vw}.h-xl{font-size:9vw}
  .pipeline{grid-template-columns:repeat(2,1fr)}
  .grid-2-7-5,.grid-2-6-6,.grid-2-8-4{grid-template-columns:1fr}
  .grid-6{grid-template-columns:repeat(2,1fr)}
}
`;
