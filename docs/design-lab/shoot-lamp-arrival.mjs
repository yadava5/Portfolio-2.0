/**
 * The arrival, frame by frame — the one part of the ending I had built but
 * never watched. Screenshots are slow enough that naive `waitForTimeout(step)`
 * loops drift badly, so each frame is taken at an ABSOLUTE offset from the
 * click, measured against a clock the page itself reports. A frame labelled
 * 400ms is a frame at 400ms.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:8140/";
const OUT = "output/lamp-arrival";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(1000);
const docH = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y <= docH; y += 420) { await page.mouse.wheel(0, 420); await page.waitForTimeout(35); }
await page.waitForTimeout(700);

/* the region the lamp descends into, measured while it is still collapsed */
const clip = await page.evaluate(() => {
  const r = document.querySelector(".gatecard").getBoundingClientRect();
  return { x: r.x, y: r.y + r.height - 60, width: r.width, height: Math.min(330, innerHeight - (r.y + r.height - 60)) };
});

await page.evaluate(() => { window.__t0 = performance.now(); document.getElementById("approve").click(); });

const frames = [140, 300, 420, 540, 660, 820, 1000, 1250, 1500, 1750, 2050, 2300, 2600, 3000, 3600];
for (const t of frames) {
  await page.evaluate((target) => new Promise((res) => {
    const tick = () => (performance.now() - window.__t0 >= target ? res() : requestAnimationFrame(tick));
    tick();
  }), t);
  const state = await page.evaluate(() => {
    const el = document.getElementById("endlight");
    const body = document.querySelector(".l-body");
    const flex = document.querySelector(".l-flexg");
    return {
      arriving: el.classList.contains("arriving"),
      lamp: el.dataset.lamp,
      lit: getComputedStyle(document.getElementById("endquote")).getPropertyValue("--lit").trim(),
      bodyT: getComputedStyle(body).transform,
      flexT: getComputedStyle(flex).transform,
    };
  });
  await page.screenshot({ path: `${OUT}/t${String(t).padStart(4, "0")}.png`, clip });
  const m = state.bodyT.match(/matrix\(([^)]+)\)/);
  const dy = m ? (+m[1].split(",")[5]).toFixed(1) : "—";
  const f = state.flexT.match(/matrix\(([^)]+)\)/);
  const sy = f ? (+f[1].split(",")[3]).toFixed(2) : "—";
  console.log(`  t=${String(t).padStart(4)}ms  arriving=${state.arriving ? "Y" : "n"}  lamp=${state.lamp}  --lit=${state.lit.padEnd(8)} bodyY=${String(dy).padStart(6)}  flexScaleY=${sy}`);
}
await browser.close();
