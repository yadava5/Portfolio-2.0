/* probe-idle-raf11.mjs — idle rAF with the page still (round 11 gate).
 *
 * NO-LIST §F3, as corrected 2026-07-30: the page does NOT sit at zero
 * rAF when idle — GSAP's core ticker and ScrollTrigger's internal loop
 * keep ~732 callbacks / 3s alive at 120Hz regardless of app code. The
 * property actually protected is: the idle callback COUNT must not
 * rise, and no APP work may execute on an idle frame. This probe reads
 * both: the rAF count over 3s of stillness, and the number of style
 * writes GSAP performs in that window (inline style mutations observed
 * on the whole tree — a scrubbed trigger that is truly dormant writes
 * nothing while the page is still).
 *
 * Sequence: load → let the entrance performance finish → scroll to
 * mid-page (waking every scrubbed trigger) → stop → wait out the
 * scrub lag → count 3s of stillness.
 *
 * Usage:  node tests/playwright/static-server.mjs &
 *         node docs/design-lab/probe-idle-raf11.mjs [url]
 */
import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://127.0.0.1:3000/";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  window.__raf = { count: 0, styleWrites: 0, counting: false };
  const orig = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) =>
    orig((t) => {
      if (window.__raf.counting) window.__raf.count++;
      cb(t);
    });
  addEventListener("DOMContentLoaded", () => {
    new MutationObserver((muts) => {
      if (window.__raf.counting) window.__raf.styleWrites += muts.length;
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
      subtree: true,
    });
  });
});
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(5200); /* the load performance settles */

/* Wake every scrubbed trigger, then go still. */
await page.evaluate(() => window.scrollTo(0, 4000));
await page.waitForTimeout(400);
await page.evaluate(() => window.scrollTo(0, 4600));
await page.waitForTimeout(2500); /* scrub lag (0.7) fully lands */

await page.evaluate(() => {
  window.__raf.count = 0;
  window.__raf.styleWrites = 0;
  window.__raf.counting = true;
});
await page.waitForTimeout(3000);
const out = await page.evaluate(() => {
  window.__raf.counting = false;
  return { rafPer3s: window.__raf.count, styleWritesPer3s: window.__raf.styleWrites };
});
console.log(JSON.stringify(out));
await browser.close();
