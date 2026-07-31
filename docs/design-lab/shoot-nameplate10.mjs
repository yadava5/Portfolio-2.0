/* shoot-nameplate10.mjs — the round-10 concurrency frames.
 *
 * Captures the nameplate through its performance so the claim "all
 * five machines visibly working at once, landing together" terminates
 * in openable files rather than an assertion. Also asserts the machine
 * census at the shop-floor moment (~2.0s): all five machine letters
 * still held (opacity 0 = machine on stage) and the overlay present.
 *
 * Usage: node docs/design-lab/shoot-nameplate10.mjs
 * Out:   output/design-lab/nameplate10/t*.png + one JSON line
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] ?? "http://127.0.0.1:3000/";
const dir = "output/design-lab/nameplate10";
await mkdir(dir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

/* navigation commit → t0; frames are wall-clock offsets from it */
await page.goto(url, { waitUntil: "commit" });
const t0 = Date.now();
const frames = [800, 1400, 2000, 2400, 2800, 3100, 3400, 3800, 4400, 5200];
const censusAt = 2000;
let census = null;

for (const t of frames) {
  const wait = t0 + t - Date.now();
  if (wait > 0) await page.waitForTimeout(wait);
  if (t === censusAt) {
    census = await page.evaluate(() => {
      const held = [...document.querySelectorAll(".np-ch.np-m")].map(
        (s) => s.style.opacity === "0"
      );
      return {
        machineLettersHeld: held.filter(Boolean).length,
        overlayMounted: !!document.querySelector(".np-mech"),
      };
    });
  }
  const plate = page.locator("[data-nameplate]");
  await plate.screenshot({ path: `${dir}/t${String(t).padStart(4, "0")}.png` });
}

const settled = await page.evaluate(
  () => !!document.querySelector(".nameplate[data-np-settled]")
);
/* poll the settle so the total length is measured, not asserted */
let settleAt = null;
if (!settled) {
  settleAt = await page
    .waitForSelector(".nameplate[data-np-settled]", { timeout: 10000 })
    .then(() => Date.now() - t0)
    .catch(() => "never");
} else {
  settleAt = `<= ${Date.now() - t0}`;
}
console.log(JSON.stringify({ census, settleAt }));
await browser.close();
