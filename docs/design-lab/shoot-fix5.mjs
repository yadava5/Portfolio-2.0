// Fix round 5 — the case file's evidence apparatus, shot where it breaks
// and where it must not change.
//
// 320 is where the receipts table, the hero plate and the meta ledger all
// pushed the document past the viewport (72px on jobtracker, 198 on the
// three case files whose fig. 1 is a raster plate). 1440 is the frame the
// fix is not allowed to touch: the dotted leaders, the pinned-sha labels
// and the three-track receipt grid are this site's most-loved furniture,
// and a narrow-width repair that quietly re-wraps a desktop artifact
// label would be a worse bug than the one it closes.
//
// Alongside the pictures it records the numbers that decide the verdict —
// the document overflow, the receipt grid's track geometry, the ledger
// row's flex geometry and the hero plate's frame box — so a before/after
// pair can be judged as measurements, not vibes.
//
// Usage:
//   TAG=before BASE=http://localhost:3000 node docs/design-lab/shoot-fix5.mjs
//   TAG=after  BASE=http://localhost:3000 node docs/design-lab/shoot-fix5.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3000";
const TAG = process.env.TAG ?? "after";
const OUT = process.env.OUT ?? "docs/design-lab/shots-fix5";
/* jobtracker carries the densest receipts table (the huggingface URL and
   the pinned-sha paths); master-inventory is the worst plate case (a
   raster fig. 1 in an aspect-video frame with a 260px floor). */
const ROUTES = (
  process.env.ROUTES ?? "/projects/jobtracker/,/projects/master-inventory/"
).split(",");
mkdirSync(OUT, { recursive: true });

const WIDTHS = [
  { w: 320, h: 900, label: "320" },
  { w: 1440, h: 1000, label: "1440" },
];

const browser = await chromium.launch();
const notes = [];

for (const route of ROUTES) {
  const slug = route.replace(/\/projects\/|\//g, "") || "home";
  for (const { w, h, label } of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1400);

    const measured = await page.evaluate(() => {
      const round = (n) => Math.round(n * 100) / 100;
      const box = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          width: round(r.width),
          height: round(r.height),
          left: round(r.left),
          right: round(r.right),
          clientWidth: el.clientWidth,
          scrollWidth: el.scrollWidth,
        };
      };
      const row = document.querySelector("[data-receipt-row]");
      const ledgerRow = document.querySelector("dl .dot-leader")?.parentElement;
      const frame = document.querySelector("[data-project-visual-frame]");
      return {
        viewport: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        /* the receipts grid: track geometry decides whether a pinned-sha
           label wraps or shoves the page sideways */
        receiptRow: box(row),
        receiptGridColumns: row
          ? getComputedStyle(row).gridTemplateColumns
          : null,
        receiptArtifactCell: box(row?.querySelector("div.label-mono")),
        receiptArtifactText:
          row
            ?.querySelector("div.label-mono")
            ?.textContent?.trim()
            .replace(/\s+/g, " ")
            .slice(0, 80) ?? null,
        /* the meta ledger: dt · dotted leader · dd, the row that must
           keep its leader and its right-aligned value */
        ledgerRow: box(ledgerRow),
        ledgerLeader: box(ledgerRow?.querySelector(".dot-leader")),
        ledgerValue: box(ledgerRow?.querySelector("dd")),
        /* the hero plate: the aspect-video frame with the 260px floor */
        plateFrame: box(frame),
        plateAspect: frame ? getComputedStyle(frame).aspectRatio : null,
        plateMinHeight: frame ? getComputedStyle(frame).minHeight : null,
      };
    });
    notes.push({ route, width: w, ...measured });

    /* The apparatus in close-up: the first receipts row (the artifact
       cell is the whole argument) and the meta ledger's leader rows. */
    const receipt = page.locator("[data-receipt-row]").first();
    if (await receipt.count()) {
      await receipt.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await receipt.screenshot({
        path: `${OUT}/receipt-${slug}-${label}-${TAG}.png`,
      });
    }
    const validation = page.locator("#validation");
    if (await validation.count()) {
      await validation.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await validation.screenshot({
        path: `${OUT}/validation-${slug}-${label}-${TAG}.png`,
      });
    }
    const plate = page.locator("#project-visual");
    if (await plate.count()) {
      await plate.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await plate.screenshot({
        path: `${OUT}/plate-${slug}-${label}-${TAG}.png`,
      });
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/head-${slug}-${label}-${TAG}.png` });
    await ctx.close();
  }
}

await browser.close();
writeFileSync(
  `${OUT}/fix5-apparatus-${TAG}.json`,
  JSON.stringify(notes, null, 2)
);
console.log(JSON.stringify(notes, null, 2));
console.log(`\nwrote ${OUT}/*-${TAG}.png`);
