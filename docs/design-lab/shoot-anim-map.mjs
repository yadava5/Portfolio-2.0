// Animation-map reconnaissance shoot.
// Captures real motion-settled surfaces for the ANIMATION-MAP audit:
//   - home / : each of the 7 chapters, desktop 1440 + mobile 390
//   - case files: jobtracker, automl, fast-mnist-nn, visual-assist (full-page)
//   - /evidence/ : desktop + mobile (full-page)
// Serves the prebuilt out/ on :3000 (static-server.mjs) first.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "docs/design-lab/shots-anim-map";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";
const log = (m) => console.log(m);
const settle = (page, ms) => page.waitForTimeout(ms);

const CHAPTERS = [
  ["arrival", "01"],
  ["who", "02"],
  ["path", "03"],
  ["automl", "04"],
  ["work", "05"],
  ["values", "06"],
  ["gate", "07"],
];

const CASE_FILES = ["jobtracker", "automl", "fast-mnist-nn", "visual-assist"];

const browser = await chromium.launch();

/** Scroll a chapter's top to just under the fixed masthead and settle. */
async function toChapterTop(page, anchor) {
  await page.evaluate((id) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 8;
      window.scrollTo({ top: y, behavior: "instant" });
    }
  }, anchor);
  await settle(page, 900); // let day-arc scrub + text motion settle
}

try {
  // ── HOME, desktop 1440 ────────────────────────────────────────────────
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await settle(page, 1600); // hero entrance fully lands
    await page.screenshot({ path: `${OUT}/home-1440-00-hero-load.png` });

    for (const [anchor, id] of CHAPTERS) {
      await toChapterTop(page, anchor);
      await page.screenshot({ path: `${OUT}/home-1440-ch${id}-${anchor}.png` });
      // Report the visible dead space: distance from last content to fold.
      const metrics = await page.evaluate((cid) => {
        const sec = document.querySelector(`[data-chapter="${cid}"]`);
        if (!sec) return null;
        const r = sec.getBoundingClientRect();
        return {
          top: Math.round(r.top),
          height: Math.round(r.height),
          vh: window.innerHeight,
        };
      }, id);
      log(`home 1440 ch${id} ${anchor}: ${JSON.stringify(metrics)}`);
    }
    await ctx.close();
  }

  // ── HOME, mobile 390 ──────────────────────────────────────────────────
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await settle(page, 1600);
    await page.screenshot({ path: `${OUT}/home-390-00-hero-load.png` });
    for (const [anchor, id] of CHAPTERS) {
      await toChapterTop(page, anchor);
      await page.screenshot({ path: `${OUT}/home-390-ch${id}-${anchor}.png` });
    }
    await ctx.close();
  }

  // ── CASE FILES, desktop 1440 full-page (reveals mid-band dead zones) ──
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    for (const id of CASE_FILES) {
      await page.goto(`${BASE}/projects/${id}/`, { waitUntil: "networkidle" });
      await settle(page, 1200);
      // Full page to see every band top-to-bottom.
      await page.screenshot({
        path: `${OUT}/case-1440-${id}-full.png`,
        fullPage: true,
      });
      // Also frame the architecture figure (fig 2) at viewport scale.
      const arch = await page.$("#architecture");
      if (arch) {
        await arch.scrollIntoViewIfNeeded();
        await settle(page, 400);
        await page.screenshot({
          path: `${OUT}/case-1440-${id}-architecture.png`,
        });
      }
      const pageH = await page.evaluate(
        () => document.documentElement.scrollHeight
      );
      log(`case 1440 ${id}: scrollHeight=${pageH}`);
    }
    await ctx.close();
  }

  // ── CASE FILES, mobile 390 (jobtracker + fast-mnist as representatives) ─
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    for (const id of ["jobtracker", "fast-mnist-nn", "automl"]) {
      await page.goto(`${BASE}/projects/${id}/`, { waitUntil: "networkidle" });
      await settle(page, 1000);
      await page.screenshot({
        path: `${OUT}/case-390-${id}-full.png`,
        fullPage: true,
      });
    }
    await ctx.close();
  }

  // ── /evidence/, desktop 1440 + mobile 390 ─────────────────────────────
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/evidence/`, { waitUntil: "networkidle" });
    await settle(page, 1000);
    await page.screenshot({
      path: `${OUT}/evidence-1440-full.png`,
      fullPage: true,
    });
    await page.screenshot({ path: `${OUT}/evidence-1440-top.png` });
    const eH = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    log(`evidence 1440: scrollHeight=${eH}`);
    await ctx.close();

    const ctx2 = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page2 = await ctx2.newPage();
    await page2.goto(`${BASE}/evidence/`, { waitUntil: "networkidle" });
    await settle(page2, 1000);
    await page2.screenshot({
      path: `${OUT}/evidence-390-full.png`,
      fullPage: true,
    });
    await ctx2.close();
  }

  log("anim-map shoot ✓ done");
} catch (e) {
  log("anim-map shoot ✗ FAILED: " + e.message);
  log(e.stack);
} finally {
  await browser.close();
}
