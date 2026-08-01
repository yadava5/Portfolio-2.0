/**
 * The lamp, close enough to judge. The wide shots clip from a rect measured
 * before the aftergate expands, so the object itself never fills the frame.
 * This crops to the lit region at 3× and steps through the light coming on.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:8140/";
const OUT = "output/lamp-close";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 3 });
await page.goto(BASE, { waitUntil: "load" });
await page.waitForTimeout(1000);
const docH = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y <= docH; y += 420) { await page.mouse.wheel(0, 420); await page.waitForTimeout(40); }
await page.waitForTimeout(800);
await page.click("#approve");
await page.waitForTimeout(4200);

const box = async () => page.evaluate(() => {
  const r = document.getElementById("endlight").getBoundingClientRect();
  const pad = 26;
  return { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad),
           width: Math.min(r.width + pad * 2, innerWidth - Math.max(0, r.x - pad)),
           height: Math.min(r.height + pad * 2, innerHeight - Math.max(0, r.y - pad)) };
});

await page.screenshot({ path: `${OUT}/lit.png`, clip: await box() });
console.log("  · lit");

/* put it out, then walk the relight frame by frame */
await page.click("#lampbtn");
await page.waitForTimeout(1600);
await page.screenshot({ path: `${OUT}/dark.png`, clip: await box() });
console.log("  · dark");

await page.click("#lampbtn");
let elapsed = 0;
for (const t of [90, 180, 300, 460, 640, 900, 1250, 1700]) {
  await page.waitForTimeout(t - elapsed);
  elapsed = t;
  await page.screenshot({ path: `${OUT}/relight-${String(t).padStart(4, "0")}ms.png`, clip: await box() });
  console.log(`  · relight ${t}ms`);
}
await page.waitForTimeout(1400);
await page.screenshot({ path: `${OUT}/relit-settled.png`, clip: await box() });
console.log("  · relit-settled");
await browser.close();
