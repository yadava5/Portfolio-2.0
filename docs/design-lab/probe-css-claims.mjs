import { chromium } from "@playwright/test";
const BASE="http://localhost:4321", OUT="docs/design-lab/shots-critic";
const s=(p,m)=>p.waitForTimeout(m); const R={};
const b=await chromium.launch();

// 1. Thread side-flip at the 1280 boundary
R.threadFlip=[];
for (const w of [1279,1280]) {
  const c=await b.newContext({viewport:{width:w,height:900},deviceScaleFactor:2});
  const p=await c.newPage();
  await p.goto(`${BASE}/`,{waitUntil:"networkidle"}); await s(p,2200);
  await p.evaluate(()=>document.getElementById("path")?.scrollIntoView({block:"start"})); await s(p,1600);
  R.threadFlip.push(await p.evaluate((w)=>{
    const svgs=Array.from(document.querySelectorAll("svg.thread-segment"));
    const boxes=svgs.map(sv=>{const r=sv.getBoundingClientRect();return {x:Math.round(r.x),w:Math.round(r.width)};});
    const paths=Array.from(document.querySelectorAll("svg.thread-segment path")).slice(0,3)
      .map(pa=>(pa.getAttribute("d")||"").slice(0,40));
    return {vw:w, svgCount:svgs.length, boxes:boxes.slice(0,3), paths};
  },w));
  await p.screenshot({path:`${OUT}/thread-${w}.png`});
  await c.close();
}

// 2. Chapter-rail contrast across the dusk boundary + header seam
{
  const c=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
  const p=await c.newPage();
  await p.goto(`${BASE}/`,{waitUntil:"networkidle"}); await s(p,2000);
  const H=await p.evaluate(()=>document.documentElement.scrollHeight);
  const values=await p.evaluate(()=>{const e=document.getElementById("values");return Math.round(e.getBoundingClientRect().top+window.scrollY);});
  R.dusk=[];
  for (const frac of [0.10,0.25,0.40,0.50,0.65,0.80]) {
    const y=Math.round(values-900*(1-frac)); // values top at `frac` of viewport
    await p.evaluate(yy=>window.scrollTo({top:yy,behavior:"instant"}),y);
    await s(p,900);
    const m=await p.evaluate(()=>{
      const lum=([r,g,bb])=>{const f=c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(bb)};
      const parse=s=>{const m=s.match(/[\d.]+/g);return m?[+m[0],+m[1],+m[2],m[3]!==undefined?+m[3]:1]:null};
      const ratio=(a,bb)=>{const l1=lum(a),l2=lum(bb);return +(((Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)).toFixed(2))};
      const railActive=Array.from(document.querySelectorAll("nav a, aside a")).find(a=>/^0\d/.test(a.textContent.trim()) && getComputedStyle(a).opacity==="1");
      const rail=document.querySelector('[class*="rail"] a') || railActive;
      const field=parse(getComputedStyle(document.body).backgroundColor) || [250,246,239];
      const hdr=document.querySelector("header");
      const hdrBg=parse(getComputedStyle(hdr).backgroundColor);
      // sample the light-field's painted colour under the header vs 300px lower
      const probe=(x,y)=>{const el=document.elementFromPoint(x,y);let n=el,c2=null;
        while(n&&n!==document.documentElement){const bg=parse(getComputedStyle(n).backgroundColor);if(bg&&bg[3]>0.5){c2=bg;break}n=n.parentElement}
        return c2;};
      return {
        railColor: rail?getComputedStyle(rail).color:null,
        railOpacity: rail?getComputedStyle(rail).opacity:null,
        railText: rail?rail.textContent.trim().slice(0,14):null,
        headerBg: getComputedStyle(hdr).backgroundColor,
        arcChrome: document.documentElement.getAttribute("data-arc-chrome"),
        arcL: getComputedStyle(document.documentElement).getPropertyValue("--arc-l").trim(),
        bodyBg: getComputedStyle(document.body).backgroundColor,
        underHeader: probe(720, 30), belowHeader: probe(720, 400),
      };
    });
    R.dusk.push({frac, y, ...m});
    await p.screenshot({path:`${OUT}/dusk-${String(Math.round(frac*100)).padStart(2,"0")}.png`});
  }
  await c.close();
}
await b.close();
console.log(JSON.stringify(R,null,1));
