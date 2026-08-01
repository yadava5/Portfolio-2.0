import { chromium } from "playwright";
const BASE = "http://localhost:3000";
const OUT = "docs/design-lab/shots-w4";
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto(`${BASE}/`, { waitUntil: "load" });
await page.waitForTimeout(1200);
// scroll near the bottom where the gate lives, let the engine settle
const H = await page.evaluate(
  () => document.documentElement.scrollHeight - window.innerHeight
);
await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(H * 0.97));
await page.waitForTimeout(2500);
const stamp = page.locator("button[data-thread-stamp]:visible").first();
await stamp.scrollIntoViewIfNeeded().catch(() => {});
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/v-i-gate-awaiting.png` });
await stamp.click({ force: true });
await page.waitForTimeout(450);
await page.screenshot({ path: `${OUT}/v-i-gate-press-05.png` });
await page.waitForTimeout(1700);
await page.screenshot({ path: `${OUT}/v-i-gate-approved.png` });
await browser.close();
console.log("gate done");
