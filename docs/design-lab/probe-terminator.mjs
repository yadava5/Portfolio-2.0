/**
 * The two terminators, sampled as pixels.
 *
 * Day→night at ¶08 and night→day at ¶13 both used to force t = 0 across the
 * side boundary, so the field SNAPPED between L 0.43 and L 0.64 in a single
 * frame. This walks the scroll through each crossing and reports the field's
 * relative luminance step by step: a smooth arc has no single large jump in it.
 */
import { chromium } from "@playwright/test";
const BASE = process.argv[2] ?? "http://localhost:8143/";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(BASE, { waitUntil: "load" });
await p.waitForTimeout(700);

const lum = (c) => {
  const [r, g, bl] = c.match(/\d+/g).map(Number).map((v) => v / 255);
  const f = (x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl);
};
const read = () => p.evaluate(() => getComputedStyle(document.getElementById("field")).backgroundColor);

async function walk(from, to, steps, label) {
  const out = [];
  for (let i = 0; i <= steps; i++) {
    const y = Math.round(from + ((to - from) * i) / steps);
    await p.evaluate((v) => window.scrollTo(0, v), y);
    await p.waitForTimeout(60);
    out.push({ y, L: +lum(await read()).toFixed(4) });
  }
  let biggest = 0, at = 0;
  for (let i = 1; i < out.length; i++) {
    const d = Math.abs(out[i].L - out[i - 1].L);
    if (d > biggest) { biggest = d; at = out[i].y; }
  }
  const span = Math.abs(out[out.length - 1].L - out[0].L);
  console.log(`${label}: L ${out[0].L} → ${out[out.length - 1].L} over ${to - from}px`);
  console.log(`  biggest single step: ${biggest.toFixed(4)} at y=${at}  (${((biggest / span) * 100).toFixed(0)}% of the whole change in one step)`);
  return { biggest, span };
}

const geo = await p.evaluate(() => {
  const b7 = document.querySelector('[data-beat="7"]').getBoundingClientRect();
  return { top: Math.round(b7.top + scrollY), h: Math.round(b7.height) };
});
const d = await walk(geo.top + Math.round(geo.h * 0.45), geo.top + geo.h, 40, "day → night (¶08)");

await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await p.waitForTimeout(400);
await p.click("#approve");
await p.waitForTimeout(11000);
const dawn = await p.evaluate(() => {
  const n = document.getElementById("nextmorning").getBoundingClientRect();
  return { top: Math.round(n.top + scrollY), h: Math.round(n.height) };
});
const n = await walk(dawn.top, dawn.top + Math.round(dawn.h * 0.7), 40, "night → day (¶13)");

const ok = d.biggest / d.span < 0.34 && n.biggest / n.span < 0.34;
console.log(ok ? "\n✓ neither terminator lands more than a third of its change in one step"
               : "\n✗ a terminator still jumps");
await b.close();
process.exit(ok ? 0 : 1);
