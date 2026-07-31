/* shoot-rail12.mjs — look at the rail (round 12). Frames down the run
 * and back up at the same stops, plus compact/lg seats. The upward
 * frames are the owner's reversibility check: the rail must visibly
 * retract, the token riding back along it.
 *
 * Usage: node tests/playwright/static-server.mjs &
 *        node docs/design-lab/shoot-rail12.mjs [outDir]
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const out = process.argv[2] ?? "output/rail12";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();

async function run(name, viewport) {
  const page = await browser.newPage({ viewport });
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(3200);
  const docH = await page.evaluate(
    () => document.documentElement.scrollHeight
  );
  const stops = [0, 0.14, 0.3, 0.45, 0.62, 0.78, 0.9, 1].map((f) =>
    Math.round(f * (docH - viewport.height))
  );
  for (const [i, y] of stops.entries()) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(420);
    await page.screenshot({
      path: `${out}/${name}-down-${String(i).padStart(2, "0")}-y${y}.png`,
    });
  }
  for (const [i, y] of [...stops].reverse().entries()) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(420);
    await page.screenshot({
      path: `${out}/${name}-up-${String(i).padStart(2, "0")}-y${y}.png`,
    });
  }
  await page.close();
}

await run("xl", { width: 1440, height: 900 });
await run("lg", { width: 1100, height: 800 });
await run("sm", { width: 390, height: 844 });
await browser.close();
console.log("done →", out);
