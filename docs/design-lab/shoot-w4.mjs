/**
 * W4 full-journey audit shoot — desktop 1440×900 + mobile 390×844.
 * Saves to docs/design-lab/shots-w4/v-*.png
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "docs/design-lab/shots-w4";
mkdirSync(OUT, { recursive: true });

const shot = (page, name) =>
  page.screenshot({ path: `${OUT}/${name}.png`, animations: "allow" });

async function settleScroll(page, y, wait = 1600) {
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
  await page.waitForTimeout(wait);
}

async function journey(browser, viewport, tag) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  // ---- HOME: load sequence (hero byline entrance) ----
  await page.goto(`${BASE}/`, { waitUntil: "commit" });
  await page.waitForTimeout(300);
  await shot(page, `v-${tag}-home-load-03`);
  await page.waitForTimeout(300);
  await shot(page, `v-${tag}-home-load-06`);
  await page.waitForTimeout(600);
  await shot(page, `v-${tag}-home-load-12`);
  await page.waitForTimeout(2200);
  await shot(page, `v-${tag}-home-top`);

  // ---- HOME: 4 scroll depths ----
  const H = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight
  );
  const depths = [0.22, 0.45, 0.68, 0.9];
  for (let i = 0; i < depths.length; i++) {
    await settleScroll(page, Math.round(H * depths[i]), 2000);
    await shot(page, `v-${tag}-home-scroll-${i + 1}`);
  }

  // ---- CASE FILES ----
  for (const slug of ["automl", "jobtracker"]) {
    await page.goto(`${BASE}/projects/${slug}/`, { waitUntil: "load" });
    await page.waitForTimeout(2200);
    await shot(page, `v-${tag}-${slug}-opening`);
    // validation: scroll the audit-run control into view
    const audit = page.locator("[data-audit-run]").first();
    if (await audit.count()) {
      await audit.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1800);
    } else {
      await settleScroll(page, Math.round((await page.evaluate(() => document.documentElement.scrollHeight)) * 0.55), 1800);
    }
    await shot(page, `v-${tag}-${slug}-validation`);
    await settleScroll(page, await page.evaluate(() => document.documentElement.scrollHeight), 2000);
    await shot(page, `v-${tag}-${slug}-footer`);
  }

  // ---- EVIDENCE ----
  await page.goto(`${BASE}/evidence/`, { waitUntil: "load" });
  await page.waitForTimeout(2200);
  await shot(page, `v-${tag}-evidence-top`);
  await settleScroll(page, 900, 1500);
  await shot(page, `v-${tag}-evidence-mid`);

  await ctx.close();
}

async function interactions(browser) {
  // Fresh context = clean paper-memory (fresh walk, unpressed gate).
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  // ---- AUDIT WALK on jobtracker ----
  await page.goto(`${BASE}/projects/jobtracker/`, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const run = page.locator("[data-audit-run]").first();
  await run.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await shot(page, "v-i-audit-before");
  await run.click();
  await page.waitForTimeout(1100); // ~3 ticks at 350ms
  await shot(page, "v-i-audit-midwalk");
  await page
    .waitForSelector("[data-audit-settled]", { timeout: 15000 })
    .catch(() => {});
  await page.waitForTimeout(900);
  await shot(page, "v-i-audit-walked");

  // ---- CITATION STROKE: hover a receipts row with data-cites ----
  const citing = page.locator("[data-receipt-row][data-cites]").first();
  if (await citing.count()) {
    await citing.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await citing.hover();
    await page.waitForTimeout(400);
    await shot(page, "v-i-citation-hover-04");
    await page.waitForTimeout(700);
    await shot(page, "v-i-citation-hover-11");
  } else {
    console.log("no citing row on jobtracker; trying automl");
    await page.goto(`${BASE}/projects/automl/`, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const c2 = page.locator("[data-receipt-row][data-cites]").first();
    await c2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await c2.hover();
    await page.waitForTimeout(400);
    await shot(page, "v-i-citation-hover-04");
    await page.waitForTimeout(700);
    await shot(page, "v-i-citation-hover-11");
  }

  // ---- GATE STAMP on home ----
  await page.goto(`${BASE}/#gate`, { waitUntil: "load" });
  await page.waitForTimeout(1000);
  const stamp = page.locator("button[data-thread-stamp]").first();
  await stamp.scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  await shot(page, "v-i-gate-awaiting");
  await stamp.click();
  await page.waitForTimeout(500);
  await shot(page, "v-i-gate-press-05");
  await page.waitForTimeout(1600);
  await shot(page, "v-i-gate-approved");

  await ctx.close();
}

const browser = await chromium.launch();
try {
  await journey(browser, { width: 1440, height: 900 }, "d");
  await journey(browser, { width: 390, height: 844 }, "m");
  await interactions(browser);
} finally {
  await browser.close();
}
console.log("done");
