// W5 round-A verification shoot — the eight changed states.
// Serves nothing itself: expects the static server on :3000 over a FRESH out/.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "docs/design-lab/shots-w5";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const browser = await chromium.launch();

async function settle(page, ms = 1200) {
  await page.waitForTimeout(ms);
}

async function scrollToId(page, id, offset = 40) {
  await page.evaluate(
    ([sel, off]) => {
      const el = document.getElementById(sel);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - off;
      window.scrollTo({ top: y, behavior: "instant" });
    },
    [id, offset]
  );
  await settle(page, 900);
}

async function shoot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(`  ✓ ${name}`);
}

// ---------- DESKTOP 1440 ----------
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  // 1) evidence index — the held entry (e-08)
  await page.goto(`${BASE}/evidence/`, { waitUntil: "networkidle" });
  await settle(page);
  await scrollToId(page, "fast-mnist-accuracy", 180);
  await shoot(page, "a-evidence-held-entry");

  // 2) automl receipts — pre-walk head
  await page.goto(`${BASE}/projects/automl/`, { waitUntil: "networkidle" });
  await settle(page);
  await scrollToId(page, "validation", 120);
  await shoot(page, "a-automl-receipts-prewalk");

  // 3) run the walk, wait for settle, shoot marks + transformed head
  await page.locator("[data-audit-run]").click();
  await page
    .locator("[data-audit-settled]")
    .waitFor({ state: "visible", timeout: 15000 });
  await settle(page, 800);
  await scrollToId(page, "validation", 120);
  await shoot(page, "a-automl-receipts-postwalk");

  // 4) dried revisit (reload) — the control IS the settled line
  await page.reload({ waitUntil: "networkidle" });
  await settle(page);
  await scrollToId(page, "validation", 120);
  await shoot(page, "a-automl-receipts-dried");

  // 5) citation hover — stroke originates at the fig-link
  await page.evaluate(() => window.localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await settle(page, 1600);
  await scrollToId(page, "v-automl-2", 260);
  const row = page.locator("[data-cites='6']").first();
  await row.hover();
  await settle(page, 700);
  await shoot(page, "a-automl-citation-hover");

  // 6) fast-mnist post-walk (tick + held dash arithmetic: 4 of 5 · 1 held)
  await page.goto(`${BASE}/projects/fast-mnist-nn/`, {
    waitUntil: "networkidle",
  });
  await settle(page);
  await page.locator("[data-audit-run]").click();
  await page
    .locator("[data-audit-settled]")
    .waitFor({ state: "visible", timeout: 15000 });
  await settle(page, 800);
  await scrollToId(page, "validation", 120);
  await shoot(page, "a-fastmnist-receipts-postwalk");

  // 7) work rows desktop (hierarchy) + 90-second path + hero directives
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 2200);
  await shoot(page, "a-home-hero-90s-path");
  await scrollToId(page, "work", 60);
  await settle(page, 900);
  await shoot(page, "a-home-work-rows-desktop");

  // 8) fig 6.1 legend (refused)
  await scrollToId(page, "values", 60);
  await settle(page, 900);
  await shoot(page, "a-home-fig61-refused");

  // 9) rail hover label (hover chapter 03's folio number)
  await scrollToId(page, "who", 60);
  await settle(page, 600);
  const railLink = page.locator("nav[aria-label='Chapters'] a").nth(2);
  await railLink.hover();
  await settle(page, 500);
  await shoot(page, "a-home-rail-hover");

  await ctx.close();
}

// ---------- MOBILE 390 ----------
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 2000);
  await shoot(page, "a-home-hero-mobile");
  await scrollToId(page, "work", 40);
  await settle(page, 900);
  await shoot(page, "a-home-work-rows-mobile");

  // evidence held entry, mobile
  await page.goto(`${BASE}/evidence/`, { waitUntil: "networkidle" });
  await settle(page);
  await scrollToId(page, "fast-mnist-accuracy", 140);
  await shoot(page, "a-evidence-held-mobile");

  // automl walk on mobile — settled head line wraps inside its reserve
  await page.goto(`${BASE}/projects/automl/`, { waitUntil: "networkidle" });
  await settle(page);
  await page.locator("[data-audit-run]").click();
  await page
    .locator("[data-audit-settled]")
    .waitFor({ state: "visible", timeout: 15000 });
  await settle(page, 800);
  await scrollToId(page, "validation", 90);
  await shoot(page, "a-automl-receipts-mobile-postwalk");

  await ctx.close();
}

await browser.close();
console.log("done");
