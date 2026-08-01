/**
 * Where the rail actually ends, against where the dock actually is.
 *
 * Three readings, because "the end of the rail is not consistent with the
 * location" can mean three different faults and they need separating:
 *
 *   AT REST         the lowest painted pixel in the dock's column against the
 *                   square's centre. The rail is expected to run to the middle
 *                   of the mark, so a few px past it is right and a gap is not.
 *   MID-RESIZE      the same, 90ms into a window change — which is all a
 *                   reader dragging an edge ever sees. This is where it used to
 *                   fail: the geometry was debounced by 160ms, so the line was
 *                   drawn from a layout that had already gone.
 *   AFTER A RESIZE  the same again, settled, re-pinned to the bottom.
 *
 * The canvas is read back with getImageData, so this measures the pixels on
 * screen rather than the numbers the module believes.
 */
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? "http://localhost:8140/";
const browser = await chromium.launch();

const READ = `(function(){
  const cv = document.getElementById("thread");
  const dk = document.getElementById("gateDock");
  const d = (dk.querySelector("i") || dk).getBoundingClientRect();
  const dockCx = d.left + d.width / 2, dockCy = d.top + d.height / 2;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  /* a 60px-wide column centred on the dock, from well above it to well below */
  const x0 = Math.max(0, Math.round((dockCx - 30) * dpr));
  const w  = Math.round(60 * dpr);
  const y0 = Math.max(0, Math.round((dockCy - 420) * dpr));
  const h  = Math.min(cv.height - y0, Math.round(560 * dpr));
  let lowest = null, lowestSolid = null;
  if (w > 0 && h > 0) {
    const im = ctx.getImageData(x0, y0, w, h).data;
    for (let row = h - 1; row >= 0 && lowest === null; row--) {
      for (let col = 0; col < w; col++) {
        const a = im[(row * w + col) * 4 + 3];
        if (a > 24) { lowest = y0 / dpr + row / dpr; break; }
      }
    }
    for (let row = h - 1; row >= 0 && lowestSolid === null; row--) {
      for (let col = 0; col < w; col++) {
        const a = im[(row * w + col) * 4 + 3];
        if (a > 150) { lowestSolid = y0 / dpr + row / dpr; break; }
      }
    }
  }
  return {
    dockCy: Math.round(dockCy), dockCx: Math.round(dockCx),
    lowestInk: lowest === null ? null : Math.round(lowest),
    lowestSolid: lowestSolid === null ? null : Math.round(lowestSolid),
    onScreen: d.top < innerHeight && d.bottom > 0,
    scrollY: Math.round(scrollY), vh: innerHeight,
    docH: Math.round(document.documentElement.scrollHeight),
  };
})()`;

const rows = [];
for (const [w, h] of [[1440, 900], [1512, 900], [1600, 1000], [1920, 1080], [1280, 800]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(500);

  const docH = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= docH; y += 460) { await page.mouse.wheel(0, 460); await page.waitForTimeout(18); }
  await page.waitForTimeout(700);

  const rest = await page.evaluate(READ);

  /* now the thing the reader does: change the window size */
  await page.setViewportSize({ width: w - 180, height: h - 90 });
  await page.waitForTimeout(90);                 /* inside the 160ms debounce */
  const during = await page.evaluate(READ);
  await page.waitForTimeout(700);                /* after it */
  /* a smaller window can leave the reader above the gate entirely; put them
     back at the bottom, which is where the terminus is a question at all */
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(400);
  const after = await page.evaluate(READ);

  /* a smaller window can put the gate off screen before the re-pin, and "no
     ink in a column that is not on screen" is not a finding about the rail */
  const gap = (r) => (!r.onScreen ? "dock off screen" : r.lowestInk === null ? "NO INK" : r.dockCy - r.lowestInk);
  rows.push({
    viewport: `${w}x${h}`,
    "gap at rest": gap(rest),
    "gap mid-resize": gap(during),
    "gap after resize": gap(after),
    "solid ends short by": rest.lowestSolid === null ? "NO INK" : rest.dockCy - rest.lowestSolid,
    errs: errs.length,
  });
  await page.close();
}
console.table(rows);
console.log("\ngap = dock centre − lowest painted pixel, in CSS px. 0 means the rail lands on the dock.");
await browser.close();
