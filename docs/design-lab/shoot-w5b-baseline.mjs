// W5 round-B baseline: the SETTLED hero, pre-change build.
// The settle-diff bar (stipple-masthead precedent): after the entrance
// finishes, the new build's hero must be pixel-identical (0.0000%).
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "docs/design-lab/shots-w5";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";
const NAME = process.argv[2] ?? "b-hero-settled-baseline";

const browser = await chromium.launch();
for (const [tag, viewport] of [
  ["1440", { width: 1440, height: 900 }],
  ["390", { width: 390, height: 844 }],
]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  /* Entrance budget is ≤1.2s (TextMotion drops data-motion-ready at
     1200ms); 3s is settled with margin. */
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/${NAME}-${tag}.png` });
  console.log(`  ✓ ${NAME}-${tag}`);
  await ctx.close();
}
await browser.close();
