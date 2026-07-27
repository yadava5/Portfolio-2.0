/**
 * FIX ROUND 7 · N22 — the print folio orphans.
 *
 * The nitpicker read printed page 2 of the home paper as opening with
 * `02 / 07` alone above blank stock, then `¶ 03 / 07` on page 3. A folio
 * rule CLOSES its chapter; pushed to the head of the next sheet it
 * reads as a heading for a page that has nothing on it.
 *
 * The rig renders the PDFs (`printBackground: false` — the Cmd+P
 * default, the condition F04 was measured under) AND, because a PDF is
 * only a picture of the failure, measures the paging in the DOM under
 * `emulateMedia({media:"print"})`: for every folio rule and every ¶
 * kicker, the sheet it lands on and its distance from that sheet's top
 * edge. A folio within one line-height of a page top with no content
 * above it on that sheet is the orphan.
 *
 * Usage: PORT=3700 node docs/design-lab/probe-fix7-print.mjs [before|after]
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const TAG = process.argv[2] ?? "before";
const PORT = process.env.PORT ?? "3700";
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(process.cwd(), "docs/design-lab/shots-fix7");
fs.mkdirSync(OUT, { recursive: true });

/* Letter at 96dpi minus the @page margins (18mm block / 16mm inline). */
const MM = 96 / 25.4;
const SHEET_H = Math.round(11 * 96 - 2 * 18 * MM);

const ROUTES = [
  ["home", "/?motion=off"],
  ["evidence", "/evidence/"],
  ["case-automl", "/projects/automl/"],
];

const browser = await chromium.launch();
const report = [];

for (const [name, route] of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(400);

  const marks = await page.evaluate((sheetH) => {
    const out = [];
    const push = (kind, el, text) => {
      const b = el.getBoundingClientRect();
      const top = Math.round(b.top + window.scrollY);
      out.push({
        kind,
        text: (text ?? el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 34),
        top,
        sheet: Math.floor(top / sheetH) + 1,
        fromSheetTop: Math.round(top % sheetH),
        breakBefore: getComputedStyle(el).breakBefore,
      });
    };
    for (const el of document.querySelectorAll("[data-thread-folio]"))
      push("folio", el);
    for (const el of document.querySelectorAll("[data-thread-kicker]"))
      push("kicker", el);
    return out.sort((a, b) => a.top - b.top);
  }, SHEET_H);

  /* An orphan: a folio sitting in the top line-band of a sheet with no
     mark of its own chapter above it on that same sheet. */
  const orphans = marks.filter(
    (m) => m.kind === "folio" && m.fromSheetTop < 40
  );
  report.push({ route: name, sheetH: SHEET_H, orphans, marks });
  console.log(`\n[${name}] orphans=${orphans.length}`);
  console.log(JSON.stringify(marks.filter((m) => m.fromSheetTop < 80), null, 1));

  await page.pdf({
    path: `${OUT}/fix7-print-${name}-${TAG}.pdf`,
    format: "Letter",
    printBackground: false,
  });
  await page.close();
}

fs.writeFileSync(
  `${OUT}/fix7-print-${TAG}.json`,
  JSON.stringify(report, null, 1)
);
await browser.close();
console.log("\n--- done ---");
