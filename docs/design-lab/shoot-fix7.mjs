/**
 * FIX ROUND 7 shot rig — the same frames before and after.
 *
 * N19  the ¶07 reference list at 768 / 1160 / 1440 / 1920 (the widths
 *      the seating sweep found MIXED, including the reference desktop)
 * N20  a case file's receipts table at 390 and 1440 — the density the
 *      ruling is about, and the meta ledger's three terminals
 * N21  the home work rail at 390 — the link labels, in the row
 * N22  the print folio seam (see probe-fix7-print.mjs for the PDFs)
 *
 * Usage: PORT=3700 node docs/design-lab/shoot-fix7.mjs [before|after]
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const TAG = process.argv[2] ?? "after";
const PORT = process.env.PORT ?? "3700";
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(process.cwd(), "docs/design-lab/shots-fix7");
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

/** Screenshot an element's neighbourhood, with a little air around it. */
async function shootEl(page, selector, file, pad = 16) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) {
    console.log(`  !! ${selector} not found for ${file}`);
    return;
  }
  await page.screenshot({
    path: `${OUT}/${file}`,
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: Math.min(box.width + pad * 2, page.viewportSize().width - Math.max(0, box.x - pad)),
      height: box.height + pad * 2,
    },
  });
  console.log(`  ${file}  ${Math.round(box.width)}×${Math.round(box.height)}`);
}

/* ── N19 · ¶07's reference list ───────────────────────────────── */
for (const w of [768, 1160, 1440, 1920]) {
  const page = await browser.newPage({ viewport: { width: w, height: 1000 } });
  await page.goto(BASE + "/?motion=off", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1400);
  await page.evaluate(() => {
    const h = [...document.querySelectorAll("h2")].find((e) =>
      /references — footnote 1/i.test(e.textContent ?? "")
    );
    h?.scrollIntoView({ block: "start" });
    window.scrollBy(0, -60);
  });
  await page.waitForTimeout(700);
  await shootEl(page, "ol.label-mono", `fix7-n19-refs-${w}-${TAG}.png`, 22);
  await page.close();
}

/* ── N20 · the receipts table + the meta ledger ───────────────── */
for (const w of [390, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 1200 } });
  await page.goto(BASE + "/projects/jobtracker/", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await shootEl(page, "dl", `fix7-n20-ledger-${w}-${TAG}.png`, 18);
  await page.evaluate(() => {
    document.querySelector("[data-receipt-row]")?.scrollIntoView({ block: "start" });
    window.scrollBy(0, -70);
  });
  await page.waitForTimeout(700);
  await page.screenshot({
    path: `${OUT}/fix7-n20-receipts-${w}-${TAG}.png`,
    clip: { x: 0, y: 0, width: w, height: Math.min(1200, 1200) },
  });
  console.log(`  fix7-n20-receipts-${w}-${TAG}.png`);
  await page.close();
}

/* ── N21 · the home work rail's link labels ───────────────────── */
for (const w of [390, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: 1100 } });
  await page.goto(BASE + "/?motion=off", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    document.querySelector("[data-thread-row]")?.scrollIntoView({ block: "start" });
    window.scrollBy(0, -70);
  });
  await page.waitForTimeout(900);
  await page.screenshot({
    path: `${OUT}/fix7-n21-worklinks-${w}-${TAG}.png`,
    clip: { x: 0, y: 0, width: w, height: 1100 },
  });
  console.log(`  fix7-n21-worklinks-${w}-${TAG}.png`);
  /* the "also live" index line, where the second `system card` sits */
  await page.evaluate(() => {
    const p = [...document.querySelectorAll("p")].find((e) =>
      /also live, without a case file/i.test(e.textContent ?? "")
    );
    p?.scrollIntoView({ block: "start" });
    window.scrollBy(0, -50);
  });
  await page.waitForTimeout(700);
  await page.screenshot({
    path: `${OUT}/fix7-n21-alsolive-${w}-${TAG}.png`,
    clip: { x: 0, y: 0, width: w, height: 340 },
  });
  console.log(`  fix7-n21-alsolive-${w}-${TAG}.png`);
  await page.close();
}

await browser.close();
console.log("\n--- done ---");
