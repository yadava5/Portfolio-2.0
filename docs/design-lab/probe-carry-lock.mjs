/**
 * The carry must not be interruptible, and must always let go.
 *
 * The old behaviour abandoned the auto-scroll on the first wheel/touch/key.
 * One stray notch stranded the reader between ¶12 and ¶13 — the gate gone,
 * the morning not yet arrived — which reads as the page being stuck.
 */
import { chromium } from "@playwright/test";
const BASE = process.argv[2] ?? "http://localhost:8142/";
const b = await chromium.launch(); const rows=[];
for (const [w,h] of [[1440,900],[1600,1000],[390,844]]) {
  const p = await b.newPage({viewport:{width:w,height:h}});
  const errs=[]; p.on("pageerror",e=>errs.push(String(e)));
  await p.goto(BASE,{waitUntil:"load"}); await p.waitForTimeout(600);
  const H=await p.evaluate(()=>document.body.scrollHeight);
  for(let y=0;y<=H;y+=460){ await p.mouse.wheel(0,460); await p.waitForTimeout(16); }
  await p.waitForTimeout(600);
  const before=await p.evaluate(()=>Math.round(scrollY));
  await p.click("#approve");
  /* fight it, the way a reader's trackpad does */
  await p.waitForTimeout(500);
  for (let i=0;i<12;i++){ await p.mouse.wheel(0,-600); await p.waitForTimeout(90); }
  await p.keyboard.press("PageUp"); await p.keyboard.press("Home");
  const mid=await p.evaluate(()=>({y:Math.round(scrollY),held:document.body.classList.contains("carrying")}));
  await p.waitForTimeout(11000);
  const after=await p.evaluate(()=>({y:Math.round(scrollY),max:Math.round(document.body.scrollHeight-innerHeight),
    held:document.body.classList.contains("carrying"),
    morning:document.getElementById("nextmorning").getBoundingClientRect().height>0,
    clock:document.getElementById("mclock").textContent}));
  /* and the reader gets the page back */
  await p.mouse.wheel(0,-900); await p.waitForTimeout(350);
  const freed=await p.evaluate(()=>Math.round(scrollY));
  rows.push({viewport:`${w}x${h}`, "held during":mid.held?"✓":"✗",
    "landed at bottom":after.y>=after.max-4?"✓":`✗ ${after.y}/${after.max}`,
    "released after":!after.held?"✓":"✗ STILL HELD",
    "scroll works again":freed<after.y-100?"✓":`✗ ${freed}`,
    clock:after.clock, morning:after.morning?"✓":"✗", errs:errs.length});
  void before; await p.close();
}
console.table(rows);
const bad=rows.filter(r=>Object.values(r).some(v=>typeof v==="string"&&v.startsWith("✗"))||r.errs);
console.log(bad.length?`\n✗ ${bad.length} viewport(s) failed`:"\n✓ the carry cannot be interrupted, always lands, and always lets go");
await b.close(); process.exit(bad.length?1:0);
