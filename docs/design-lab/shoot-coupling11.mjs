/* shoot-coupling11.mjs — mid-entrance frames of the scrubbed world.
 *
 * The coupling is felt, but a parked mid-entrance frame is also SEEN:
 * these are the stills a reader who stops mid-scroll actually lives
 * with. Frames: ch03 mid-cascade, ch03 settled, a ch05 row figure
 * mid-assembly, the litany mid-cascade, the finale mid-rise, and the
 * finale at the very foot of the paper (the clamp check).
 *
 * Usage:  node tests/playwright/static-server.mjs &
 *         node docs/design-lab/shoot-coupling11.mjs
 * Output: docs/design-lab/shots-coupling11/
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const url = process.argv[2] ?? "http://127.0.0.1:3000/";
const dir = new URL("./shots-coupling11/", import.meta.url).pathname;
mkdirSync(dir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(5200);

async function shootAt(name, sel, viewportFrac) {
  await page.evaluate(
    ({ selector, frac }) => {
      const el = document.querySelector(selector);
      window.scrollTo(
        0,
        scrollY + el.getBoundingClientRect().top - innerHeight * frac
      );
    },
    { selector: sel, frac: viewportFrac }
  );
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${dir}${name}.png` });
  console.log(name);
}

/* ch03: the headline pair's scene sits under the kicker — park it
   mid-window (top at ~72% ≈ halfway through the 82→56 window), then
   settled (top at ~40%). */
await shootAt("ch03-mid-entrance", "#path [data-tm-scene]", 0.72);
await shootAt("ch03-settled", "#path [data-tm-scene]", 0.4);

/* a ch05 row: the figure mid-assembly (row scene at ~70%), settled */
await shootAt("ch05-row-mid", "#work [data-thread-row]", 0.7);
await shootAt("ch05-row-settled", "#work [data-thread-row]", 0.3);

/* the scene figure itself mid-window (its own 85→35 window) */
await shootAt("ch05-fig-mid", "#work [data-scene]", 0.6);
await shootAt("ch05-fig-settled", "#work [data-scene]", 0.25);

/* the litany mid-cascade and settled */
await shootAt("litany-mid", "[data-tm-mantra]", 0.65);
await shootAt("litany-settled", "[data-tm-mantra]", 0.35);

/* the finale mid-rise, then the absolute foot of the paper */
await shootAt("finale-mid", "#gate [data-tm-scene]", 0.7);
await page.evaluate(() =>
  window.scrollTo(0, document.documentElement.scrollHeight)
);
await page.waitForTimeout(1800);
await page.screenshot({ path: `${dir}finale-foot.png` });
console.log("finale-foot");

await browser.close();
