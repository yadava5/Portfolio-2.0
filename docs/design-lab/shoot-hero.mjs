/**
 * shoot-hero.mjs — the masthead, three moments, two frames.
 *
 * Captures the ch-01 hero at desktop (1440×900) and mobile (390×844):
 *   1. entrance mid-beat  (~220ms after the motion-ready stamp — the
 *      headline lines are mid-rise, the ink still drying)
 *   2. settled            (the gate attribute dropped; static == final)
 *   3. reduced-motion     (A7 world: the finished page from first paint)
 *
 * Usage:  node tests/playwright/static-server.mjs &   (PORT=3411)
 *         node docs/design-lab/shoot-hero.mjs <label>
 * Shots land in docs/design-lab/shots-hero/<label>-*.png.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const label = process.argv[2] ?? "shot";
const port = process.env.PORT ?? "3411";
const base = `http://127.0.0.1:${port}`;
const outDir = join(dirname(fileURLToPath(import.meta.url)), "shots-hero");
mkdirSync(outDir, { recursive: true });

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  /* ── engine world: mid-beat + settled ─────────────────────────── */
  {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "commit" });
    await page.waitForFunction(
      () => document.documentElement.hasAttribute("data-motion-ready"),
      { timeout: 10_000 }
    );
    await page.waitForTimeout(220);
    await page.screenshot({
      path: join(outDir, `${label}-${vp.name}-midbeat.png`),
    });
    await page.waitForFunction(
      () => !document.documentElement.hasAttribute("data-motion-ready"),
      { timeout: 15_000 }
    );
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    await page.screenshot({
      path: join(outDir, `${label}-${vp.name}-settled.png`),
    });
    await context.close();
  }

  /* ── static world: reduced motion ─────────────────────────────── */
  {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: join(outDir, `${label}-${vp.name}-reduced-motion.png`),
    });
    await context.close();
  }
}

await browser.close();
console.log(`shots-hero: ${label} captured for ${VIEWPORTS.length} viewports`);
