/* shoot-relief10.mjs — the round-10 relief port, seen mid-flight.
 *
 * Three moments per capture point: just-before (the trigger line not
 * yet crossed), mid-entrance (~250ms after crossing), and settled — so
 * the wings/press/rise gestures and the chapter departures are visible
 * in openable files. Also dumps the inline transforms of a few marked
 * elements at the mid frame, so direction is measured, not eyeballed.
 *
 * Usage: node docs/design-lab/shoot-relief10.mjs
 * Out:   output/design-lab/relief10/*.png + JSON lines
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://127.0.0.1:3000/";
const dir = "output/design-lab/relief10";
await mkdir(dir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(5200); /* the nameplate show is load-only */

/* mid-entrance of ¶03's headline pair (right-wing chapter) */
const path03 = await page.evaluate(() => {
  const el = document.querySelector("#path");
  return el.getBoundingClientRect().top + window.scrollY;
});
await page.evaluate((y) => window.scrollTo(0, y - 900 * 0.75), path03);
await page.waitForTimeout(240);
await page.screenshot({ path: `${dir}/ch03-mid-entrance.png` });
const probe03 = await page.evaluate(() => {
  const muted = document.querySelector("#path [data-tm='muted-fade']");
  const line = document.querySelector("#path [data-tm-bright] div");
  return {
    brightLine: line ? getComputedStyle(line).transform : null,
    mutedFade: muted ? muted.style.transform || "(none)" : null,
  };
});
console.log(JSON.stringify({ probe03 }));
await page.waitForTimeout(1400);
await page.screenshot({ path: `${dir}/ch03-settled.png` });

/* mid-entrance of a ¶05 work row (right wing + press rail + rise) */
const row = await page.evaluate(() => {
  const el = document.querySelectorAll("#work [data-thread-row]")[1];
  return el.getBoundingClientRect().top + window.scrollY;
});
await page.evaluate((y) => window.scrollTo(0, y - 900 * 0.8), row);
await page.waitForTimeout(300);
await page.screenshot({ path: `${dir}/ch05-row-mid.png` });
const probe05 = await page.evaluate(() => {
  const rows = document.querySelectorAll("#work [data-thread-row]");
  const r = rows[1];
  const press = r.querySelector("[data-tm='press']");
  const rise = r.querySelector("[data-tm='rise']");
  const muted = r.querySelector("[data-tm='muted']");
  const t = (el) => (el ? el.style.transform || "(none)" : null);
  return {
    pressRail: t(press),
    riseFigure: t(rise),
    mutedLine: t(muted),
    rowItself: t(r) /* MUST stay untransformed — thread-measured */,
  };
});
console.log(JSON.stringify({ probe05 }));
await page.waitForTimeout(1600);
await page.screenshot({ path: `${dir}/ch05-row-settled.png` });

/* ¶02 mid-departure: section bottom crossing the upper third */
const dep = await page.evaluate(() => {
  const el = document.querySelector("#who");
  const r = el.getBoundingClientRect();
  return r.bottom + window.scrollY;
});
await page.evaluate((b) => window.scrollTo(0, b - 900 * 0.25), dep);
await page.waitForTimeout(900); /* scrub 0.7 needs a beat to catch up */
await page.screenshot({ path: `${dir}/ch02-mid-departure.png` });
const probeDep = await page.evaluate(() => {
  const wrap = document.querySelector("#who [data-tm-depart]");
  const svg = document.querySelector("svg[data-thread-segment='02']");
  return {
    wrapTransform: wrap ? wrap.style.transform || "(none)" : null,
    threadSvgTransform: svg ? getComputedStyle(svg).transform : null,
  };
});
console.log(JSON.stringify({ probeDep }));

await browser.close();
