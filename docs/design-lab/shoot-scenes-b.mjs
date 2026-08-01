// Living scenes wave B — visual evidence for the two new case-plate
// figures (Cadence "the parse" · Agentic AutoML "the halt, echoed").
// Both scenes surface ONLY on their case-file plates (#project-visual
// fig. 1) — neither project holds a ch05 work row — so every pass
// shoots the case routes. Captures ENTRANCE (just triggered), MID
// (running), SETTLED, the REDUCED-MOTION static frame (the print
// edition), and a 390px mobile pass per scene.
//
// Usage: NEXT_PUBLIC_BASE_PATH= npm run build, then
//   PORT=3200 node tests/playwright/static-server.mjs &
//   BASE=http://localhost:3200 node docs/design-lab/shoot-scenes-b.mjs
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "docs/design-lab/shots-scenes-b";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3200";
const log = (m) => console.log(m);

const browser = await chromium.launch();

const SCENES = [
  { id: "cadence", route: "taskflow-calendar", selector: "[data-scene-cadence]" },
  { id: "automl-echo", route: "automl", selector: "[data-scene-automl-echo]" },
];

/** Instant-scroll the plate to ~70% viewport so its trigger fires. */
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

try {
  /* ── Pass 1: motion world — entrance / mid / settled per scene ── */
  for (const scene of SCENES) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/projects/${scene.route}/`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(1200);

    await armScene(page, scene.selector);
    // entrance: the run has just begun
    await page.waitForTimeout(220);
    await page.screenshot({
      path: `${OUT}/${scene.id}-1-entrance.png`,
      clip: await clipOf(page, scene.selector),
    });
    // mid-run
    await page.waitForTimeout(900);
    await page.screenshot({
      path: `${OUT}/${scene.id}-2-mid.png`,
      clip: await clipOf(page, scene.selector),
    });
    // settled (both runs are < 3s)
    await page.waitForTimeout(2400);
    await page.screenshot({
      path: `${OUT}/${scene.id}-3-settled.png`,
      clip: await clipOf(page, scene.selector),
    });
    // the whole plate (frame + fig. 1 caption + disclosure)
    await page.screenshot({
      path: `${OUT}/${scene.id}-4-plate.png`,
      clip: await clipOf(page, "#project-visual figure", 16),
    });
    log(`shot ${scene.id} entrance/mid/settled/plate`);
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
    for (const scene of SCENES) {
      await page.goto(`${BASE}/projects/${scene.route}/`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(700);
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

  /* ── Pass 3: mobile width — legibility of the settled figures ── */
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      reducedMotion: "reduce", // settled frames, no timing races
    });
    const page = await ctx.newPage();
    for (const scene of SCENES) {
      await page.goto(`${BASE}/projects/${scene.route}/`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(700);
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
