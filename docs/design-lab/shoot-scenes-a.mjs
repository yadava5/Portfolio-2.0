// Living scenes wave A — visual evidence for the three new figures
// (Applied sorting line · Glyph race + forward pass · jetpack split→stitch).
// Captures each scene at ENTRANCE (just triggered), MID (running), and
// SETTLED, plus its REDUCED-MOTION static frame (the print edition), on
// desktop and a mobile-width pass, plus the two case-file plates and the
// jetpack live-gzip press result.
//
// Usage: NEXT_PUBLIC_BASE_PATH= npm run build, then
//   PORT=3010 node tests/playwright/static-server.mjs &
//   BASE=http://localhost:3010 node docs/design-lab/shoot-scenes-a.mjs
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "docs/design-lab/shots-scenes-a";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3010";
const log = (m) => console.log(m);

const browser = await chromium.launch();

/** Instant-scroll the element to ~70% viewport so its trigger fires. */
async function armScene(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`missing ${sel}`);
    const y =
      window.scrollY + el.getBoundingClientRect().top - window.innerHeight * 0.6;
    window.scrollTo({ top: y, behavior: "instant" });
  }, selector);
}

/** Clip a padded box around the scene's figure. */
async function clipOf(page, selector, pad = 24) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`no box for ${selector}`);
  return {
    x: Math.max(0, box.x - pad),
    y: Math.max(0, box.y - pad),
    width: box.width + pad * 2,
    height: box.height + pad * 2,
  };
}

const SCENES = [
  { id: "applied", selector: "figure[data-scene]:has([data-scene-applied])" },
  { id: "glyph", selector: "figure[data-scene]:has([data-scene-glyph])" },
  { id: "jetpack", selector: "figure[data-scene]:has([data-scene-jetpack])" },
];

try {
  /* ── Pass 1: motion world — entrance / mid / settled per scene ── */
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1400);

    for (const scene of SCENES) {
      await armScene(page, scene.selector);
      // entrance: the run has just begun
      await page.waitForTimeout(220);
      await page.screenshot({
        path: `${OUT}/${scene.id}-1-entrance.png`,
        clip: await clipOf(page, scene.selector),
      });
      // mid-run
      await page.waitForTimeout(800);
      await page.screenshot({
        path: `${OUT}/${scene.id}-2-mid.png`,
        clip: await clipOf(page, scene.selector),
      });
      // settled (all runs are < 3.2s)
      await page.waitForTimeout(2600);
      await page.screenshot({
        path: `${OUT}/${scene.id}-3-settled.png`,
        clip: await clipOf(page, scene.selector),
      });
      log(`shot ${scene.id} entrance/mid/settled`);
    }

    // jetpack A11 press: the live browser-gzip line
    await armScene(page, "[data-scene-jetpack]");
    await page
      .getByRole("button", { name: /gzip this figure in your browser/i })
      .click();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: `${OUT}/jetpack-4-live-gzip.png`,
      clip: await clipOf(page, "[data-scene-jetpack]"),
    });
    log("shot jetpack live-gzip press");
    await ctx.close();
  }

  /* ── Pass 2: reduced motion — the print edition per scene ─────── */
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    for (const scene of SCENES) {
      await armScene(page, scene.selector);
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `${OUT}/${scene.id}-5-reduced-motion.png`,
        clip: await clipOf(page, scene.selector),
      });
      log(`shot ${scene.id} reduced-motion print edition`);
    }
    await ctx.close();
  }

  /* ── Pass 3: the two case-file plates (scene replaces fig. 1) ── */
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    for (const route of ["jobtracker", "fast-mnist-nn"]) {
      await page.goto(`${BASE}/projects/${route}/`, {
        waitUntil: "networkidle",
      });
      // The plate sits below the 80% trigger line at load — scroll it in
      // (as a reading visitor does), then let the one-shot run settle.
      await armScene(page, "#project-visual");
      await page.waitForTimeout(3600);
      await page.screenshot({
        path: `${OUT}/plate-${route}.png`,
        clip: await clipOf(page, "#project-visual", 16),
      });
      log(`shot ${route} case-file plate`);
    }
    await ctx.close();
  }

  /* ── Pass 4: mobile width — legibility of the settled figures ── */
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      reducedMotion: "reduce", // settled frames, no timing races
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    for (const scene of SCENES) {
      await armScene(page, scene.selector);
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `${OUT}/${scene.id}-6-mobile.png`,
        clip: await clipOf(page, scene.selector, 10),
      });
      log(`shot ${scene.id} mobile settled`);
    }
    await ctx.close();
  }

  log(`done → ${OUT}`);
} finally {
  await browser.close();
}
