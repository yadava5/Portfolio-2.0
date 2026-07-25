// TEXT-MICRO shoot — before/after/hover evidence for the garnish rail.
//
// Captures, into docs/design-lab/shots-textmicro/:
//   masthead   core-rest → full-rest (must be identical) → full hover of
//              "Scroll." (axis press) → full hover of the claim (wet
//              cascade, early + settled)
//   row title  full rest → hover (press)
//   ch03 pair  full rest → hover (headline press)
//   gate name  full rest → tilt NE → tilt SW → released
//   print      hero + gate (the floor renders the same text, unstyled)
//
// Needs the probes build served at :3300 (see probe-textmicro.mjs).
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3300";
const OUT = "docs/design-lab/shots-textmicro";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const shoot = async (page, name, clip) => {
  await page.screenshot({ path: `${OUT}/${name}.png`, clip });
  console.log(`  ▸ ${name}`);
};
const clipAround = async (page, sel, pad = 40) => {
  const box = await page.locator(sel).first().boundingBox();
  return {
    x: Math.max(0, box.x - pad),
    y: Math.max(0, box.y - pad),
    width: Math.min(1440, box.width + pad * 2),
    height: box.height + pad * 2,
  };
};
const center = (page, sel) =>
  page.evaluate(
    (s) =>
      document
        .querySelector(s)
        .scrollIntoView({ behavior: "instant", block: "center" }),
    sel
  );

try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1700); /* entrance retires */

  const hero = "#arrival h1";
  const pressAxis = "#arrival [data-tier-garnish='press-axis']";
  const wetLine = "#arrival [data-tier-garnish='wet-line']";
  const rowTitle = "#work a[data-tier-garnish='press']";
  const ch03 = "#path [data-tier-garnish='press']";
  const plate = "#gate [data-garnish-plate]";

  /* ── core rest (the universal first paint) ── */
  const heroClip = await clipAround(page, hero, 60);
  await shoot(page, "01-masthead-core-rest", heroClip);

  /* ── promote to full; rest must be pixel-identical ── */
  await page.evaluate(() => window.__frameGovernor?.promote());
  await page.waitForFunction(
    () => document.documentElement.dataset.tier === "full"
  );
  await page.waitForTimeout(200);
  await shoot(page, "02-masthead-full-rest", heroClip);

  /* ── the axis press on "Scroll." ── */
  await page.locator(pressAxis).hover();
  await page.waitForTimeout(600);
  await shoot(page, "03-masthead-full-hover-scroll-pressed", heroClip);
  await page.mouse.move(10, 500);
  await page.waitForTimeout(700);
  await shoot(page, "04-masthead-full-released", heroClip);

  /* ── the wet cascade on the claim ── */
  await page.locator(wetLine).hover();
  await page.waitForTimeout(70); /* mid-cascade: seats 0–1 wet, real. dry */
  await shoot(page, "05-claim-wet-cascade-early", heroClip);
  await page.waitForTimeout(500);
  await shoot(page, "06-claim-wet-settled", heroClip);
  await page.mouse.move(10, 500);

  /* ── row title press ── */
  await center(page, rowTitle);
  await page.waitForTimeout(700);
  const rowClip = await clipAround(page, rowTitle, 48);
  await shoot(page, "07-rowtitle-full-rest", rowClip);
  await page.locator(rowTitle).first().hover();
  await page.waitForTimeout(450);
  await shoot(page, "08-rowtitle-full-hover-pressed", rowClip);
  await page.mouse.move(10, 10);

  /* ── chapter bright press (ch03) ── */
  await center(page, ch03);
  await page.waitForTimeout(700);
  const ch03Clip = await clipAround(page, ch03, 48);
  await shoot(page, "09-chapter-bright-full-rest", ch03Clip);
  await page.locator(ch03).hover();
  await page.waitForTimeout(450);
  await shoot(page, "10-chapter-bright-full-hover-pressed", ch03Clip);
  await page.mouse.move(10, 10);

  /* ── the plate tilt ── */
  await center(page, plate);
  await page.waitForTimeout(900);
  const plateClip = await clipAround(page, plate, 56);
  await shoot(page, "11-gate-name-full-rest", plateClip);
  const box = await page.locator(plate).boundingBox();
  await page.mouse.move(
    box.x + box.width * 0.82,
    box.y + box.height * 0.22,
    { steps: 8 }
  );
  await page.waitForTimeout(500);
  await shoot(page, "12-gate-name-tilt-ne", plateClip);
  await page.mouse.move(
    box.x + box.width * 0.15,
    box.y + box.height * 0.85,
    { steps: 8 }
  );
  await page.waitForTimeout(500);
  await shoot(page, "13-gate-name-tilt-sw", plateClip);
  await page.mouse.move(box.x - 80, box.y - 80, { steps: 6 });
  await page.waitForTimeout(700);
  await shoot(page, "14-gate-name-released", plateClip);
  await ctx.close();

  /* ── the print floor: same text, rail dark ── */
  const pctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const ppage = await pctx.newPage();
  await ppage.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await ppage.waitForTimeout(900);
  await shoot(ppage, "15-print-hero", await clipAround(ppage, hero, 60));
  await ppage.evaluate(() =>
    document
      .querySelector("#gate [data-garnish-plate]")
      .scrollIntoView({ behavior: "instant", block: "center" })
  );
  await ppage.waitForTimeout(600);
  await shoot(
    ppage,
    "16-print-gate-name",
    await clipAround(ppage, "#gate [data-garnish-plate]", 56)
  );
  await pctx.close();
} finally {
  await browser.close();
}
console.log("shots → " + OUT);
