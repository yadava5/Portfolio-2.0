// HEADER ROUND 9 — the bird at 3×, through its whole flight.
//
// Round 8's bird was captured at 3× and found to be "two straight tapered
// bars with a dot between them". This is the same scrutiny applied to the
// round-9 redraw: freeze the flight (pause every animation at creation,
// swallow the choreography's timers), scrub to fixed fractions, and shoot
// a 3× window tracking the bird. Then release time and burst-shoot the
// flare → cut → fold → dry in real time, because the cut is the one moment
// scrubbing cannot reach (the fold's animations are created after it).
//
// Run:  node docs/design-lab/shoot-bird9.mjs
// Writes shots-header9/bird-t*.png (scrubbed) and bird-land-*.png (burst).

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";

const CAND = new URL("candidates", import.meta.url).pathname;
const OUT = new URL("shots-header9", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const PORT = 4437;
const server = spawn("npx", ["serve", CAND, "-l", String(PORT)], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3,
});
await page.goto(`http://localhost:${PORT}/header-d-ensemble`, { waitUntil: "networkidle" });
await page.waitForFunction(() =>
  document.getElementById("plate").classList.contains("settled"), null, { timeout: 15000 });

/* —— scrubbed flight frames —— */
await page.evaluate(() => {
  window.__frozen = true;
  const anim = Element.prototype.animate;
  Element.prototype.animate = function (...a) {
    const inst = anim.apply(this, a);
    if (window.__frozen) inst.pause();
    return inst;
  };
  const st = window.setTimeout;
  window.setTimeout = (fn, ms) => (window.__frozen ? 0 : st(fn, ms));
});
await page.evaluate(() => document.querySelector('button[data-replay="bird"]').click());
await page.waitForTimeout(300);
for (const t of [0.06, 0.14, 0.23, 0.33, 0.44, 0.55, 0.68, 0.80, 0.88, 0.93, 0.97, 1.0]) {
  const pos = await page.evaluate((tt) => {
    document.getAnimations().forEach((a) => {
      const d = a.effect.getComputedTiming().duration;
      a.currentTime = Math.min(tt * 2000, d);
    });
    const gB = document.querySelector('.mech [data-census="bird"] + [data-census="bird"]') ||
      document.querySelectorAll('.mech [data-census="bird"]')[1];
    const r = gB.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, t);
  const cx = Math.max(0, Math.min(1440 - 220, pos.x - 110));
  const cy = Math.max(0, Math.min(900 - 150, pos.y - 75));
  await page.screenshot({
    path: `${OUT}/bird-t${String(Math.round(t * 100)).padStart(3, "0")}.png`,
    clip: { x: cx, y: cy, width: 220, height: 150 },
  });
}
/* clean up the frozen replay */
await page.evaluate(() => {
  window.__frozen = false;
  document.getAnimations().forEach((a) => a.cancel());
  document.querySelectorAll(".mech").forEach((n) => n.remove());
  document.querySelectorAll("#nameplate .ch").forEach((s) => (s.style.opacity = ""));
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForFunction(() =>
  document.getElementById("plate").classList.contains("settled"), null, { timeout: 15000 });

/* —— the landing, real time: flare → cut → fold → dry —— */
await page.evaluate(() => window.scrollTo(0, 0));
const vbox2 = await page.evaluate(() => {
  const r = document.querySelectorAll("#nameplate .ch")[10].getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});
const clip = { x: vbox2.x - 60, y: vbox2.y - 90, width: vbox2.w + 120, height: vbox2.h + 110 };
/* dispatch in-page: page.click would scroll the replay row into view
   and drag the nameplate out of the clip */
await page.evaluate(() => document.querySelector('button[data-replay="bird"]').click());
const t0 = Date.now();
let shot = 0;
for (const at of [1500, 1750, 1900, 2000, 2080, 2160, 2260, 2380, 2500, 2650, 2900, 3150, 3400]) {
  const wait = at - (Date.now() - t0);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  await page.screenshot({
    path: `${OUT}/bird-land-${String(++shot).padStart(2, "0")}-${at}.png`, clip,
  });
}
await browser.close();
server.kill();
console.log("bird shots →", OUT);
