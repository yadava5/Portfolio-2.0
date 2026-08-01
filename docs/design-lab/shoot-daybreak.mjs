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
const docH = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y <= docH; y += 420) { await page.mouse.wheel(0, 420); await page.waitForTimeout(30); }
await page.waitForTimeout(800);

await page.screenshot({ path: `${OUT}/00-night.png` });
console.log("  00-night");

await page.evaluate(() => { window.__t0 = performance.now(); document.getElementById("approve").click(); });

for (const t of [400, 1200, 1800, 2400, 3000, 3600, 4200, 5000, 5800, 6600, 7600]) {
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
    lit: getComputedStyle(document.getElementById("endquote")).getPropertyValue("--lit").trim(),
  }));
  await page.screenshot({ path: `${OUT}/t${String(t).padStart(4, "0")}.png` });
  console.log(`  t=${String(t).padStart(4)}ms  night=${st.night ? "Y" : "n"}  ${st.field.padEnd(20)} ink=${st.ink.padEnd(8)} ${st.clock}  --lit=${st.lit.padEnd(8)} ${st.phase}`);
}

/* and it must survive a scroll back up and down again */
await page.mouse.wheel(0, -1400); await page.waitForTimeout(500);
await page.mouse.wheel(0, 2200); await page.waitForTimeout(900);
const after = await page.evaluate(() => ({
  night: document.documentElement.hasAttribute("data-night"),
  clock: document.getElementById("mclock").textContent,
  lit: getComputedStyle(document.getElementById("endquote")).getPropertyValue("--lit").trim(),
}));
await page.screenshot({ path: `${OUT}/99-after-scrub.png` });
console.log(`\n  after scrolling away and back: night=${after.night ? "Y" : "n"} clock=${after.clock} --lit=${after.lit}`);
await browser.close();
