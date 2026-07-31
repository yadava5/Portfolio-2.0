/* probe-print11.mjs — the paper edition under the scrubbed world (A7).
 *
 * A scrubbed world has no final frame until you scroll, so print is the
 * round's highest-risk surface: a Cmd+P taken on a fresh load must
 * still paint every reveal target settled. This probe emulates print
 * media on a FRESH, unscrolled motion-world load and reads, for every
 * choreography target (including the SplitText line fragments INSIDE
 * the masked headlines, which the element-level print rules cannot
 * reach), whether anything is still hidden or displaced.
 *
 * It also snapshots a real printToPDF so the beforeprint path (scenes'
 * progress(1) settle) is exercised the way headless Chromium fires it.
 *
 * Usage:  node tests/playwright/static-server.mjs &
 *         node docs/design-lab/probe-print11.mjs [url]
 */
import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://127.0.0.1:3000/";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(5200); /* load performance settles; no scroll */

await page.emulateMedia({ media: "print" });
await page.waitForTimeout(300);

const report = await page.evaluate(() => {
  const bad = [];
  const check = (el, what) => {
    const cs = getComputedStyle(el);
    const op = parseFloat(cs.opacity);
    const t = cs.transform;
    const m =
      t && t !== "none" ? new DOMMatrixReadOnly(t) : new DOMMatrixReadOnly();
    const displaced =
      Math.abs(m.m41) > 1 ||
      Math.abs(m.m42) > 1 ||
      Math.abs(Math.hypot(m.a, m.b) - 1) > 0.01;
    if (op < 0.99 || displaced) {
      bad.push({
        what,
        text: (el.textContent ?? "").trim().slice(0, 40),
        opacity: op,
        transform: t,
      });
    }
  };
  for (const el of document.querySelectorAll(
    "[data-tm], [data-tm-bright], [data-tm-mantra], [data-tm-receipt]"
  )) {
    check(el, "target");
    /* the split fragments inside masked headlines */
    for (const frag of el.querySelectorAll("div")) check(frag, "fragment");
  }
  /* the manifesto's word fragments rest muted mid-scrub */
  for (const el of document.querySelectorAll("[data-tm-words] div")) {
    check(el, "manifesto-word");
  }
  /* scene ink: dash-drawn edges still holding their undrawn offset */
  let undrawn = 0;
  for (const el of document.querySelectorAll(
    "[data-scene] path[pathLength]"
  )) {
    const v = getComputedStyle(el).strokeDashoffset;
    if (Math.abs(parseFloat(v)) > 0.01) undrawn++;
  }
  return { hidden: bad.length, undrawnEdges: undrawn, sample: bad.slice(0, 12) };
});
console.log(JSON.stringify(report, null, 2));

/* The real print path: beforeprint fires synchronously in printToPDF. */
await page.emulateMedia({ media: "screen" });
await page.pdf({ path: "/tmp/print11-fresh.pdf", printBackground: false });
console.log("pdf written: /tmp/print11-fresh.pdf");
await browser.close();
