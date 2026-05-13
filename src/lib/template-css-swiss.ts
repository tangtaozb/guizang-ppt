export const TEMPLATE_CSS_SWISS = `
:root{
  --sans:"Inter","Helvetica Neue","Helvetica","Arial","Segoe UI Variable","Segoe UI",system-ui,-apple-system,sans-serif;
  --sans-zh:"PingFang SC","Hiragino Sans GB","Source Han Sans SC","Noto Sans SC","Microsoft YaHei UI","Microsoft YaHei",sans-serif;
  --mono:"JetBrains Mono","IBM Plex Mono","SF Mono","Cascadia Code","Consolas","Courier New",ui-monospace,monospace;
  --text-primary:#0a0a0a;--text-secondary:#525252;--text-helper:#737373;--text-placeholder:#a3a3a3;--text-on-color:#ffffff;
  --border-subtle:#e0e0e0;--border-strong:#a3a3a3;
  --sp-3:8px;--sp-4:12px;--sp-5:16px;--sp-6:24px;--sp-7:32px;--sp-8:40px;--sp-9:48px;--sp-10:64px;--sp-11:80px;--sp-12:96px;--sp-13:160px;
  --nav-safe-bottom:8vh;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:var(--paper);color:var(--ink);font-family:var(--sans),var(--sans-zh);font-feature-settings:"ss01","cv11";-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
#deck{position:fixed;inset:0;width:10000vw;height:100vh;display:flex;flex-wrap:nowrap;transition:transform .9s cubic-bezier(.77,0,.175,1);z-index:10;will-change:transform}
.slide{width:100vw;height:100vh;flex:0 0 100vw;position:relative;padding:5.5vh 5vw 7vh 5vw;display:flex;flex-direction:column;overflow:hidden;background:var(--paper);color:var(--ink)}
.slide.grey{background:var(--grey-1)}
.slide.dark{background:var(--ink);color:var(--paper)}
.slide.accent{background:var(--accent);color:var(--accent-on)}
.slide.accent .accent-block{background:var(--accent-on);color:var(--accent)}
.rule{width:100%;height:1px;background:currentColor;opacity:.18;margin:0}
.rule.thick{height:2px;opacity:.85}
.rule.accent{background:var(--accent);opacity:1;height:2px}
.rule.v{width:1px;height:100%;margin:0}
.chrome{display:flex;justify-content:space-between;align-items:flex-start;font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;opacity:.7;margin-bottom:auto}
.chrome .l,.chrome .r{display:flex;gap:1.6em;align-items:center}
.chrome .sep{width:24px;height:1px;background:currentColor;opacity:.5}
.foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.55;padding-top:2vh;border-top:1px solid currentColor;border-color:rgba(127,127,127,.25)}
.foot .nb{font-family:var(--sans);font-weight:600;letter-spacing:.04em}
.kicker{font-family:var(--mono);font-size:11px;letter-spacing:.28em;text-transform:uppercase;opacity:.65;margin-bottom:2.4vh;display:inline-flex;align-items:center;gap:.8em}
.kicker::before{content:"";width:24px;height:1px;background:currentColor;opacity:.6}
.kicker.no-line::before{display:none}
.kicker.accent{color:var(--accent);opacity:1;font-weight:600}
.tag{display:inline-block;font-family:var(--mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;padding:5px 10px;border:1px solid currentColor;opacity:.85}
.tag.solid{background:currentColor;color:var(--paper);border-color:transparent}
.tag.accent{background:var(--accent);color:var(--accent-on);border-color:transparent;opacity:1}
.h-hero{font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:11vw;line-height:.92;letter-spacing:-.04em}
.h-hero-zh{font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:8.4vw;line-height:.96;letter-spacing:-.025em}
.h-xl{font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:6vw;line-height:1;letter-spacing:-.03em}
.h-xl-zh{font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:5vw;line-height:1.05;letter-spacing:-.025em}
.h-md{font-family:var(--sans),var(--sans-zh);font-weight:300;font-size:2.6vw;line-height:1.18;letter-spacing:-.015em}
.h-sub{font-family:var(--sans),var(--sans-zh);font-weight:400;font-size:2.2vw;line-height:1.3;letter-spacing:-.01em;opacity:.7}
.lead{font-family:var(--sans),var(--sans-zh);font-weight:400;font-size:1.55vw;line-height:1.4;letter-spacing:-.005em;opacity:.86}
.body{font-family:var(--sans),var(--sans-zh);font-weight:400;font-size:max(13px,1.05vw);line-height:1.6;letter-spacing:0;opacity:.78}
.body-sm{font-family:var(--sans),var(--sans-zh);font-weight:400;font-size:max(11px,.84vw);line-height:1.55;opacity:.7}
.meta{font-family:var(--mono);font-size:max(10px,.78vw);letter-spacing:.18em;text-transform:uppercase;opacity:.6}
.meta-row{display:flex;gap:1.4em;align-items:baseline;flex-wrap:wrap;font-family:var(--mono);font-size:max(11px,.85vw);letter-spacing:.18em;text-transform:uppercase;opacity:.65}
.meta-row .dot{display:inline-block;width:4px;height:4px;border-radius:50%;background:currentColor;opacity:.5;vertical-align:middle}
.kpi-hero{font-family:var(--sans);font-weight:800;font-size:22vw;line-height:.82;letter-spacing:-.05em;font-feature-settings:"tnum","ss01"}
.kpi-hero .unit{font-family:var(--sans),var(--sans-zh);font-weight:500;font-size:.18em;letter-spacing:0;opacity:.5;margin-left:.12em;vertical-align:.5em}
.kpi-hero.accent{color:var(--accent)}
.kpi-big{font-family:var(--sans);font-weight:800;font-size:11vw;line-height:.85;letter-spacing:-.04em;font-feature-settings:"tnum"}
.kpi-mid{font-family:var(--sans);font-weight:700;font-size:6vw;line-height:.88;letter-spacing:-.03em;font-feature-settings:"tnum"}
.stat-card{display:flex;flex-direction:column;gap:.6vh;align-items:flex-start;padding-top:1.6vh;border-top:2px solid currentColor}
.stat-card.thin{border-top-width:1px;border-color:rgba(127,127,127,.4)}
.stat-card.accent-top{border-top-color:var(--accent);border-top-width:3px}
.stat-card .stat-label{font-family:var(--mono);font-size:max(10px,.78vw);letter-spacing:.24em;text-transform:uppercase;opacity:.6}
.stat-card .stat-nb{font-family:var(--sans);font-weight:800;font-size:5.6vw;line-height:.88;letter-spacing:-.035em;font-feature-settings:"tnum";margin-top:.4vh}
.stat-card .stat-nb .stat-unit{font-family:var(--sans),var(--sans-zh);font-weight:500;font-size:.32em;letter-spacing:0;opacity:.6;margin-left:.14em;vertical-align:.4em}
.stat-card .stat-note{font-family:var(--sans),var(--sans-zh);font-weight:400;font-size:max(12px,.95vw);line-height:1.5;opacity:.7;margin-top:.6vh}
.grid-4 .stat-card .stat-nb{font-size:4.6vw}
.grid-3 .stat-card .stat-nb{font-size:6.4vw}
.grid-6 .stat-card .stat-nb{font-size:4vw}
.accent-block{background:var(--accent);color:var(--accent-on);padding:2.4vh 2vw}
.accent-block.tight{padding:1.4vh 1.4vw}
.ink-block{background:var(--ink);color:var(--paper);padding:2.4vh 2vw}
.grey-block{background:var(--grey-1);padding:2.4vh 2vw}
.mark{background:var(--accent);color:var(--accent-on);padding:0 .2em;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.mark.ink{background:var(--ink);color:var(--paper)}
.underline-accent{background-image:linear-gradient(to bottom,transparent 70%,var(--accent) 70%,var(--accent) 96%,transparent 96%);padding:0 .05em}
.pipeline-section{margin-top:3.2vh;padding-top:2.2vh;border-top:1px solid rgba(127,127,127,.3)}
.pipeline-section:first-of-type{border-top:0;padding-top:0;margin-top:2.4vh}
.pipeline-label{font-family:var(--mono);font-size:max(10px,.82vw);letter-spacing:.24em;text-transform:uppercase;opacity:.6;margin-bottom:1.8vh}
.pipeline{display:grid;grid-template-columns:repeat(5,1fr);gap:1vw}
.pipeline[data-cols="3"]{grid-template-columns:repeat(3,1fr)}
.pipeline[data-cols="4"]{grid-template-columns:repeat(4,1fr)}
.pipeline[data-cols="6"]{grid-template-columns:repeat(6,1fr)}
.step{display:flex;flex-direction:column;gap:.6vh;padding-top:1.2vh;border-top:2px solid currentColor}
.step.accent-top{border-top-color:var(--accent);border-top-width:3px}
.step-nb{font-family:var(--mono);font-weight:500;font-size:1vw;opacity:.5;letter-spacing:.04em}
.step-title{font-family:var(--sans),var(--sans-zh);font-weight:700;font-size:1.4vw;letter-spacing:-.01em;line-height:1.2}
.step-desc{font-family:var(--sans),var(--sans-zh);font-weight:400;font-size:max(11px,.88vw);line-height:1.45;opacity:.7}
.frame{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden}
.frame.grid-2-7-5,.frame.grid-2-6-6,.frame.grid-2-8-4,.frame.grid-2-4-8,.frame.grid-3-3,.frame.grid-12,.frame.grid-6,.frame.grid-4,.frame.grid-3{display:grid}
.grid-12{display:grid;grid-template-columns:repeat(12,1fr);gap:2vh 1.2vw;align-items:start}
.span-2{grid-column:span 2}.span-3{grid-column:span 3}.span-4{grid-column:span 4}.span-5{grid-column:span 5}.span-6{grid-column:span 6}.span-7{grid-column:span 7}.span-8{grid-column:span 8}.span-9{grid-column:span 9}.span-12{grid-column:span 12}
.grid-2-7-5{display:grid;grid-template-columns:7fr 5fr;gap:3vw 4vh;align-items:start}
.grid-2-6-6{display:grid;grid-template-columns:1fr 1fr;gap:3vw 4vh;align-items:start}
.grid-2-8-4{display:grid;grid-template-columns:8fr 4fr;gap:3vw 4vh;align-items:start}
.grid-2-4-8{display:grid;grid-template-columns:4fr 8fr;gap:3vw 4vh;align-items:start}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:3vw 4vh;align-items:start}
.grid-3-3{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:minmax(0,1fr);gap:2.4vh 2vw}
.grid-4{display:grid;grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(2,1fr);gap:3vh 3vw;flex:1;align-content:center}
.grid-6{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:3vh 2.4vw;flex:1;align-content:center}
.col{display:flex;flex-direction:column;gap:2vh}
.row{display:flex;align-items:center;gap:2vw}
.fill{flex:1}
.center{align-items:center;justify-content:center;text-align:center}
.right{text-align:right;justify-self:end}
.top{align-self:start}.bottom{align-self:end}.va-center{align-self:center}
.pos-absolute{position:absolute}
.bottom-left{position:absolute;left:5vw;bottom:8vh;max-width:50vw}
.bottom-right{position:absolute;right:5vw;bottom:8vh;max-width:50vw;text-align:right}
.top-right{position:absolute;right:5vw;top:5.5vh;text-align:right}
.top-left{position:absolute;left:5vw;top:5.5vh}
.callout{padding:2vh 2vw;border-left:3px solid var(--accent);font-family:var(--sans),var(--sans-zh);font-size:max(13px,1vw);line-height:1.55;opacity:.9}
.callout.ink{border-left-color:currentColor}
.callout .cite,.callout .callout-src{display:block;margin-top:1.2vh;font-family:var(--mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;opacity:.6}
.ico{width:1em;height:1em;display:inline-block;vertical-align:-.12em;stroke:currentColor;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.ico-lg,.ico-md,.ico-sm{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round}
.ico-lg{width:2.4vw;height:2.4vw;stroke-width:1.4;display:inline-block}
.ico-md{width:1.6vw;height:1.6vw;stroke-width:1.6;display:inline-block;vertical-align:-.4em}
.ico-sm{width:1vw;height:1vw;stroke-width:1.8;display:inline-block;vertical-align:-.15em;opacity:.7}
.frame-img{overflow:hidden;position:relative;background:var(--paper);box-sizing:border-box;width:100%}
.slide.dark .frame-img{background:rgba(255,255,255,.06)}
.frame-img > img{width:100%;height:100%;object-fit:cover;object-position:center center;display:block}
.frame-img.fit-contain > img{object-fit:contain;object-position:center center}
.frame-img.r-16x9{aspect-ratio:16/9;max-height:64vh}
.frame-img.r-4x3{aspect-ratio:4/3;max-height:56vh}
.frame-img.r-1x1{aspect-ratio:1/1;max-height:50vh}
.img-cap{display:block;margin-top:.8vh;font-family:var(--mono);font-size:max(10px,.78vw);letter-spacing:.2em;text-transform:uppercase;opacity:.6}
figure.frame-img,figure.tile{margin:0;display:flex;flex-direction:column;min-width:0}
.swiss-img-split{display:grid;grid-template-columns:5fr 7fr;gap:3vw;align-items:start;flex:1;min-height:0}
.swiss-img-split.reverse{grid-template-columns:7fr 5fr}
.swiss-img-copy{display:flex;flex-direction:column;gap:var(--sp-6);min-width:0}
.nav-safe-bottom{padding-bottom:var(--nav-safe-bottom)}
.sub-grid-3-2{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:1.4vh 1.4vw;flex:1;align-content:stretch;margin-top:3vh}
.sub-card{background:var(--grey-1);padding:2.4vh 1.6vw 2vh;display:flex;flex-direction:column;position:relative;min-height:0}
.slide.dark .sub-card{background:rgba(255,255,255,.06)}
.sub-card.accent{background:var(--accent);color:var(--accent-on)}
.sub-card.ink{background:var(--ink);color:var(--paper)}
.sub-card .nb-corner{position:absolute;top:1.6vh;right:1.4vw;font-family:var(--mono);font-size:max(10px,.78vw);letter-spacing:.18em;opacity:.55}
.sub-card .ttl{font-family:var(--sans),var(--sans-zh);font-weight:500;font-size:max(15px,1.5vw);line-height:1.2;letter-spacing:-.015em;margin-bottom:1vh}
.sub-card .desc{font-family:var(--sans),var(--sans-zh);font-size:max(11px,.86vw);line-height:1.55;opacity:.78;margin-top:auto}
.stack-row{display:grid;grid-template-columns:repeat(3,1fr);gap:1.6vw;flex:1;margin-top:6vh;align-items:stretch}
.stack-block{display:flex;flex-direction:column;padding:3.2vh 1.8vw 2.4vh;position:relative;min-height:0}
.stack-block.b-accent{background:var(--accent);color:var(--accent-on)}
.stack-block.b-grey{background:var(--grey-1);color:var(--ink)}
.stack-block.b-ink{background:var(--ink);color:var(--paper)}
.stack-block .layer-nb{font-family:var(--mono);font-size:max(11px,.82vw);letter-spacing:.22em;opacity:.65;margin-bottom:auto}
.stack-block .layer-ttl{font-family:var(--sans),var(--sans-zh);font-weight:400;font-size:max(17px,2vw);line-height:1.1;margin-top:1vh;letter-spacing:-.02em}
.stack-block .layer-desc{font-family:var(--sans),var(--sans-zh);font-weight:400;font-size:max(11px,.88vw);line-height:1.55;opacity:.88;margin-top:1.4vh}
.card-fill{background:#f5f5f4;border:0;color:var(--text-primary)}
.card-ink{background:var(--ink);border:0;color:var(--paper)}
.card-accent{background:var(--accent);border:0;color:var(--accent-on)}
.num-mega{font-family:var(--sans);font-weight:200;font-size:9vw;line-height:1;letter-spacing:-.04em;font-feature-settings:"tnum"}
.name-mega{font-family:var(--sans);font-weight:200;font-size:9vw;line-height:1;letter-spacing:-.035em}
.kpi-thin{font-family:var(--sans);font-weight:200;font-size:14vw;line-height:.92;letter-spacing:-.045em;font-feature-settings:"tnum"}
.kpi-thin .unit{font-size:.3em;font-weight:300;opacity:.55;margin-left:.15em;vertical-align:.6em}
.kpi-thin.accent{color:var(--accent)}
.kpi-thin-sm{font-family:var(--sans);font-weight:250;font-size:5.6vw;line-height:1.04;letter-spacing:-.03em;font-feature-settings:"tnum"}
.kpi-row-4{display:grid;grid-template-columns:repeat(4,1fr);gap:0;padding-top:2.4vh;border-top:1px solid var(--grey-2)}
.kpi-row-4 > .kpi-cell{padding:1.6vh 1.6vw 0;border-left:1px solid var(--grey-2)}
.kpi-row-4 > .kpi-cell:first-child{padding-left:0;border-left:none}
.kpi-cell .lbl{font-family:var(--mono);font-size:max(10px,.74vw);letter-spacing:.22em;text-transform:uppercase;opacity:.55;margin-bottom:1.2vh}
.kpi-cell .nb{font-family:var(--sans);font-weight:250;font-size:3.2vw;line-height:1;letter-spacing:-.025em;font-feature-settings:"tnum"}
.kpi-cell .nb .unit{font-size:.32em;font-weight:300;opacity:.6;margin-left:.1em;vertical-align:.4em}
.kpi-cell .note{font-family:var(--sans),var(--sans-zh);font-size:max(11px,.82vw);line-height:1.5;opacity:.7;margin-top:1.2vh}
.h-bar-chart{display:grid;grid-template-columns:11em minmax(0,1fr) 8em;gap:1.6vh 1.6vw;align-items:center;margin-top:2.4vh;font-feature-settings:"tnum"}
.h-bar-chart .row-lbl{font-family:var(--sans),var(--sans-zh);font-weight:500;font-size:max(13px,1vw);letter-spacing:-.005em;text-align:left}
.h-bar-chart .row-track{height:3.2vh;background:var(--grey-1);position:relative;overflow:hidden}
.h-bar-chart .row-fill{height:100%;background:var(--ink);transition:width 1s cubic-bezier(.5,0,.2,1)}
.h-bar-chart .row-fill.accent{background:var(--accent)}
.h-bar-chart .row-fill.grey{background:var(--grey-3)}
.h-bar-chart .row-val{font-family:var(--sans);font-weight:250;font-size:max(16px,1.5vw);letter-spacing:-.02em;line-height:1}
.bar-towers{display:grid;grid-template-columns:repeat(4,1fr);gap:1.2vw;flex:1;align-items:end;margin-top:auto}
.bar-tower{display:flex;flex-direction:column;justify-content:flex-end;min-height:0;height:100%}
.bar-tower .body-block{flex:0 1 auto;padding:2vh 1.2vw 2vh;display:flex;flex-direction:column;justify-content:flex-end;min-height:18vh;background:var(--paper);color:var(--ink);border:1px solid var(--grey-2)}
.bar-tower .body-block.b-accent{background:var(--accent);color:var(--accent-on);border-color:var(--accent)}
.bar-tower .lbl{font-family:var(--mono);font-size:max(10px,.78vw);letter-spacing:.2em;text-transform:uppercase;opacity:.65;margin-bottom:1vh}
.bar-tower .nb{font-family:var(--sans);font-weight:250;font-size:max(20px,2.8vw);line-height:1;letter-spacing:-.03em;font-feature-settings:"tnum"}
.bar-tower .nb .unit{font-size:.36em;font-weight:300;opacity:.7;margin-left:.08em;vertical-align:.4em}
.bar-tower .sub{font-family:var(--sans),var(--sans-zh);font-size:max(11px,.84vw);opacity:.75;margin-top:1.2vh;line-height:1.5}
.duo-compare{display:grid;grid-template-columns:1fr 1px 1fr;gap:0 3.4vw;flex:1;align-items:stretch;margin-top:8vh}
.duo-compare .vrule{background:var(--grey-2);width:1px;align-self:stretch}
.duo-compare .col{display:flex;flex-direction:column;gap:1.6vh;padding:0 .4vw}
.duo-compare .col-tag{font-family:var(--mono);font-size:max(10px,.74vw);letter-spacing:.22em;text-transform:uppercase;color:var(--grey-3);display:flex;align-items:center;gap:.6vw}
.duo-compare .col-ttl{font-family:var(--sans),var(--sans-zh);font-weight:200;font-size:3.6vw;line-height:1;letter-spacing:-.03em}
.duo-compare .col.accent .col-ttl{color:var(--accent)}
.duo-compare .col-desc{font-family:var(--sans),var(--sans-zh);font-size:max(13px,1.04vw);line-height:1.55;opacity:.78;max-width:30vw}
.split-half{display:grid;grid-template-columns:1fr 1fr;gap:0;flex:1;align-items:stretch}
.split-half > .half{padding:5vh 3.4vw;display:flex;flex-direction:column;min-width:0}
.split-half > .half.r-border{border-left:1px solid rgba(127,127,127,.22)}
.split-half > .half.b-grey{background:var(--grey-1)}
.split-half > .half.b-accent{background:var(--accent);color:var(--accent-on)}
.split-half > .half.b-ink{background:var(--ink);color:var(--paper)}
.canvas-card{width:100vw;height:100vh;background:var(--paper);color:var(--ink);padding:5.6vh 5vw 4.4vh;display:flex;flex-direction:column;position:relative;overflow:hidden}
.slide.dark .canvas-card{background:var(--ink);color:var(--paper)}
.slide.accent .canvas-card{background:var(--accent);color:var(--accent-on)}
.slide.grey .canvas-card{background:var(--grey-1);color:var(--ink)}
.slide.split .canvas-card{padding:0;flex-direction:row}
.canvas-card .chrome-min{display:flex;justify-content:space-between;align-items:flex-start;font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:var(--text-helper);flex:0 0 auto;margin-bottom:var(--sp-9)}
.canvas-card .chrome-min.tight{margin-bottom:var(--sp-7)}
.slide.dark .canvas-card .chrome-min{color:rgba(255,255,255,.62)}
.slide.accent .canvas-card .chrome-min{color:rgba(255,255,255,.62)}
.t-cat{font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--text-helper);line-height:1.3}
.t-cat.accent{color:var(--accent)}
.t-meta{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.16em;text-transform:uppercase;color:var(--text-helper);line-height:1.45}
.t-body{font-family:var(--sans),var(--sans-zh);font-size:16px;font-weight:400;color:var(--text-primary);line-height:1.5;letter-spacing:-.005em}
.t-body-sm{font-family:var(--sans),var(--sans-zh);font-size:14px;font-weight:400;color:var(--text-secondary);line-height:1.55}
.t-body-emp{font-family:var(--sans),var(--sans-zh);font-size:16px;font-weight:600;color:var(--text-primary);line-height:1.5}
.t-h-prod{font-family:var(--sans),var(--sans-zh);font-size:20px;font-weight:600;color:var(--text-primary);line-height:1.4;letter-spacing:-.01em}
.t-helper{font-family:var(--sans),var(--sans-zh);font-size:12px;font-weight:400;color:var(--text-helper);line-height:1.5}
.slide.dark .t-cat,.slide.dark .t-meta,.slide.dark .t-helper{color:rgba(255,255,255,.62)}
.slide.dark .t-body-sm{color:rgba(255,255,255,.78)}
.slide.dark .t-body,.slide.dark .t-body-emp,.slide.dark .t-h-prod{color:var(--paper)}
.dots{background-image:radial-gradient(currentColor 1px,transparent 1px);background-size:12px 12px;opacity:.18}
.dots-fine{background-image:radial-gradient(currentColor .8px,transparent .8px);background-size:8px 8px;opacity:.14}
.geo-dot{width:.7vw;height:.7vw;border-radius:50%;background:var(--accent);display:inline-block;vertical-align:middle}
.geo-square{width:.7vw;height:.7vw;background:var(--accent);display:inline-block;vertical-align:middle}
.geo-line{width:2vw;height:2px;background:var(--accent);display:inline-block;vertical-align:middle}
#nav{position:fixed;left:50%;bottom:2vh;transform:translateX(-50%);z-index:30;display:flex;gap:10px;padding:0;background:transparent;border:0}
#nav .dot{width:6px;height:6px;background:rgba(0,0,0,.28);cursor:pointer;transition:all .25s ease;border:0;padding:0;border-radius:0}
#nav .dot:hover{background:rgba(0,0,0,.55)}
#nav .dot.active{background:var(--accent);width:18px}
[data-anim]{opacity:1}
@media(max-width:900px){
  .h-hero{font-size:16vw}.h-hero-zh{font-size:13vw}.h-xl{font-size:9vw}.h-xl-zh{font-size:8vw}
  .kpi-hero{font-size:32vw}.kpi-big{font-size:16vw}
  .pipeline{grid-template-columns:repeat(2,1fr)}
  .grid-2-7-5,.grid-2-6-6,.grid-2-8-4,.grid-2-4-8{grid-template-columns:1fr}
  .grid-12{grid-template-columns:repeat(6,1fr)}
}
`;
