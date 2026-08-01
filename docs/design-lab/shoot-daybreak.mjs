/**
 * The morning coming back, frame by frame.
 *
 * Frames are taken at ABSOLUTE offsets measured against a clock inside the
 * page, because screenshots cost enough that a waitForTimeout loop drifts by
 * hundreds of milliseconds — which is how an earlier pass concluded a reveal
 * had "already finished" before it had started.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:8140/";
const OUT = "output/daybreak";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 });
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(1000);
/* stop at the GATE, not the document's end — the point is to approve from
   there and be carried into the morning. */
const gateTop = await page.evaluate(() => document.getElementById("gate").offsetTop);
for (let y = 0; y <= gateTop; y += 420) { await page.mouse.wheel(0, 420); await page.waitForTimeout(30); }
await page.evaluate((t) => window.scrollTo(0, t), gateTop);
await page.mouse.wheel(0, 2); await page.waitForTimeout(800);

await page.screenshot({ path: `${OUT}/00-night.png` });
console.log("  00-night");

await page.evaluate(() => { window.__t0 = performance.now(); document.getElementById("approve").click(); });

for (const t of [600, 1600, 2400, 3200, 4000, 4800, 5600, 6400, 7000, 7800]) {
  await page.evaluate((target) => new Promise((res) => {
    const tick = () => (performance.now() - window.__t0 >= target ? res() : requestAnimationFrame(tick));
    tick();
  }), t);
  const st = await page.evaluate(() => ({
    night: document.documentElement.hasAttribute("data-night"),
    field: getComputedStyle(document.getElementById("field")).backgroundColor,
    ink: getComputedStyle(document.documentElement).getPropertyValue("--ink").trim(),
    clock: document.getElementById("mclock").textContent,
    phase: document.getElementById("mphase").textContent,
    y: Math.round(scrollY), beat: window.__world.beat,
  }));
  await page.screenshot({ path: `${OUT}/t${String(t).padStart(4, "0")}.png` });
  console.log(`  t=${String(t).padStart(4)}ms  night=${st.night ? "Y" : "n"}  ${st.field.padEnd(20)} ink=${st.ink.padEnd(8)} ${st.clock}  y=${String(st.y).padStart(6)} beat=${st.beat}  ${st.phase}`);
}

/* and it must survive a scroll back up and down again */
await page.mouse.wheel(0, -1400); await page.waitForTimeout(500);
await page.mouse.wheel(0, 2200); await page.waitForTimeout(900);
const after = await page.evaluate(() => ({
  night: document.documentElement.hasAttribute("data-night"),
  clock: document.getElementById("mclock").textContent,
  y: Math.round(scrollY), beat: window.__world.beat,
}));
await page.screenshot({ path: `${OUT}/99-after-scrub.png` });
console.log(`\n  after scrolling away and back: night=${after.night ? "Y" : "n"} clock=${after.clock} beat=${after.beat}`);
await browser.close();
