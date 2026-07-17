/** Shoot /world-preview across the day arc. Requires the static server on :3000. */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

await mkdir("docs/design-lab/shots-arc", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3000/world-preview/");
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);

/* chapter stubs are 100vh each; land mid-chapter */
const stops = [
  ["01-dawn", 0],
  ["03-noon", 2 * 900 + 450],
  ["05-golden", 4 * 900 + 450],
  ["06-dusk", 5 * 900 + 450],
  ["07-night", 6 * 900 + 450],
];
for (const [name, y] of stops) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(1000); /* let the scrub settle */
  await page.screenshot({ path: `docs/design-lab/shots-arc/${name}.png` });
  console.log("shot", name);
}
await browser.close();
console.log("done");
