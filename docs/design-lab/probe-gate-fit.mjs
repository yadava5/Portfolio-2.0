/**
 * What the gate measures before and after approval.
 *
 * Approving expands the aftergate, which grows the RIGHT column. `.b8` centres
 * its grid, so the whole composition re-seats — and the thread canvas, built
 * once against the old geometry, is left pointing at where the dock USED to
 * be. Both effects are invisible without running the click in a real browser.
 */
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://localhost:8140/";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(1000);

const docH = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y <= docH; y += 420) { await page.mouse.wheel(0, 420); await page.waitForTimeout(40); }
await page.waitForTimeout(800);

const snap = () => page.evaluate(() => {
  const R = (s) => { const e = document.querySelector(s); if (!e) return null;
    const r = e.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) }; };
  const dock = document.getElementById("gateDock").getBoundingClientRect();
  return {
    scrollY: Math.round(scrollY), maxScroll: document.body.scrollHeight - innerHeight,
    viewport: innerHeight, docH: document.body.scrollHeight,
    gate: R("#gate"), leftCol: R(".b8 .beat-inner > div:first-child"),
    rightCol: R(".b8 .beat-inner > div:nth-child(2)"),
    card: R(".gatecard"), colophon: R(".b8 footer"), ladder: R(".ladder"),
    dockCentreInView: Math.round(dock.top + dock.height / 2),
    dockPageY: Math.round(dock.top + scrollY + dock.height / 2),
    colophonFullyVisible: (() => { const f = document.querySelector(".b8 footer").getBoundingClientRect();
      return f.bottom <= innerHeight && f.top >= 0; })(),
    kickerVisible: (() => { const k = document.querySelector("#gate .kicker").getBoundingClientRect();
      return k.top >= 0 && k.bottom <= innerHeight; })(),
    markerLine: (() => { const p = [...document.querySelectorAll("#gate .mono")].find((e) => /marker you have been following/.test(e.textContent));
      if (!p) return "NOT FOUND"; const r = p.getBoundingClientRect();
      return { opacity: +getComputedStyle(p).opacity, top: Math.round(r.top), inView: r.top < innerHeight && r.bottom > 0 }; })(),
  };
});

const before = await snap();
await page.click("#approve");
await page.waitForTimeout(2600);
const after = await snap();

console.log("── BEFORE approve ──");
console.log(JSON.stringify(before, null, 2));
console.log("\n── AFTER approve ──");
console.log(JSON.stringify(after, null, 2));
console.log("\n── the shift ──");
console.log(JSON.stringify({
  ladderMovedBy: after.ladder.top - before.ladder.top,
  dockMovedBy: after.dockPageY - before.dockPageY,
  rightColGrewBy: after.rightCol.h - before.rightCol.h,
  gateGrewBy: after.gate.h - before.gate.h,
  colophonCutBy: Math.max(0, after.colophon.bottom - after.viewport),
  stillFitsOneScreen: after.gate.h <= after.viewport,
}, null, 2));
await browser.close();
