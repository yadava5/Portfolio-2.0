// Fix round 4 — the gate stamp, shot at the two widths that decide it.
//
// 320 is where the rotated plate pushed the document 3px past the
// viewport; 1440 is where the stamp must be visibly UNDIMINISHED (it is
// the delight list's approval crescendo, and a narrow-width fix that
// quietly shrinks the desktop seal would be a worse bug than the one it
// closes). Each width gets the seal in close-up plus the whole gate, so
// the before/after pair can be judged as a composition, not a crop.
//
// Usage:
//   TAG=before BASE=http://localhost:3400 node docs/design-lab/shoot-fix4.mjs
//   TAG=after  BASE=http://localhost:3400 node docs/design-lab/shoot-fix4.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3400";
const TAG = process.env.TAG ?? "after";
const OUT = process.env.OUT ?? "docs/design-lab/shots-fix4";
mkdirSync(OUT, { recursive: true });

const WIDTHS = [
  { w: 320, h: 844, label: "320" },
  { w: 1440, h: 900, label: "1440" },
];

const browser = await chromium.launch();
const notes = [];

for (const { w, h, label } of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/#gate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);

  const stamp = page.locator("[data-stamp]:visible").first();
  await stamp.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);

  /* The numbers that decide the verdict, taken from the same frame as
     the picture: the plate's authored viewBox is 300 units wide, so
     plateWidth ÷ 300 IS the type's scale factor (the F67 argument), and
     12 units is the smallest authored line on the stamp. */
  const measured = await page.evaluate(() => {
    const el = [...document.querySelectorAll("[data-stamp]")].find(
      (n) => n.offsetParent !== null
    );
    if (!el) return null;
    const plate = el.querySelector(".stamp-plate");
    const r = el.getBoundingClientRect();
    const round = (n) => Math.round(n * 100) / 100;
    return {
      seat: el.className.includes("rotate-[4deg]") ? "compact" : "desktop",
      layoutWidth: round(el.offsetWidth),
      plateWidth: plate ? round(plate.getBoundingClientRect().width) : null,
      paintedWidth: round(r.width),
      paintedRight: round(r.right),
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      plateScale: round(el.offsetWidth / 300),
      smallestLinePx: round((el.offsetWidth / 300) * 12),
      rotate: getComputedStyle(el).rotate,
    };
  });
  notes.push({ width: w, ...measured });

  await stamp.screenshot({ path: `${OUT}/stamp-${label}-${TAG}.png` });
  await page.screenshot({ path: `${OUT}/gate-${label}-${TAG}.png` });
  await ctx.close();
}

await browser.close();
writeFileSync(`${OUT}/fix4-stamp-${TAG}.json`, JSON.stringify(notes, null, 2));
console.log(JSON.stringify(notes, null, 2));
console.log(`\nwrote ${OUT}/*-${TAG}.png`);
