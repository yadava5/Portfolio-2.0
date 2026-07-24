// Fix-3 diagnosis/verification shoot — ch04 pinned beat → ch05 hand-off
// (blank-paper report) + the Cadence plate connector geometry.
// Serve out/ first:  PORT=3200 node tests/playwright/static-server.mjs
// Usage:  node docs/design-lab/shoot-fix3.mjs [before|after]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const TAG = process.argv[2] ?? "before";
const OUT = "docs/design-lab/shots-fix3";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3200";
const log = (m) => console.log(m);

const browser = await chromium.launch();

/** Scroll-through of ch04 → ch05 at fine steps, motion on. */
async function ch04ScrollThrough(width, height, label) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);

  // Geometry ledger: where everything sits (document coords).
  const geo = await page.evaluate(() => {
    const doc = (el) =>
      el
        ? {
            top: Math.round(el.getBoundingClientRect().top + window.scrollY),
            bottom: Math.round(
              el.getBoundingClientRect().bottom + window.scrollY
            ),
            height: Math.round(el.getBoundingClientRect().height),
          }
        : null;
    const ch04 = document.querySelector('[data-chapter="04"]');
    const ch05 = document.querySelector('[data-chapter="05"]');
    return {
      scrollHeight: document.documentElement.scrollHeight,
      ch04: doc(ch04),
      ch05: doc(ch05),
      thesis: doc(ch04?.querySelector("[data-tm-scene]")),
      pin: doc(document.querySelector("[data-pipeline-pin]")),
      spacer: doc(document.querySelector(".pin-spacer")),
      registry: doc(ch04?.querySelector("figure.mt-10, figure[class*='mt-10']")),
      ch05Kicker: doc(ch05?.querySelector("p, [data-tm-scene]")),
    };
  });
  log(`GEO ${label}: ${JSON.stringify(geo)}`);

  const from = Math.max(0, (geo.ch04?.top ?? 0) - Math.round(height * 0.7));
  const to = (geo.ch05?.top ?? geo.scrollHeight) + Math.round(height * 0.6);
  const step = Math.round(height * 0.38);
  let i = 0;
  for (let y = from; y <= to; y += step) {
    await page.evaluate(
      (yy) => window.scrollTo({ top: yy, behavior: "instant" }),
      y
    );
    await page.waitForTimeout(450);
    await page.screenshot({
      path: `${OUT}/${TAG}-${label}-ch04-${String(i).padStart(2, "0")}-y${y}.png`,
    });
    i++;
  }
  await ctx.close();
}

/** The Cadence plate (case file fig. 1) + home fig 5.3 — settled frames. */
async function cadencePlates(width, height, label, reduced) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  const mode = reduced ? "print" : "motion";

  // Scroll the plate root to ~55% viewport so the one-shot trigger
  // (top 80%) is genuinely crossed, then let the run settle.
  const seat = () =>
    page.evaluate(() => {
      const root = document.querySelector("[data-scene-cadence]");
      if (!root) return false;
      const y =
        root.getBoundingClientRect().top +
        window.scrollY -
        window.innerHeight * 0.55;
      window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
      return true;
    });

  // Case-file plate (fig. 1).
  await page.goto(`${BASE}/projects/taskflow-calendar/`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(600);
  const plate = page.locator("[data-scene-cadence]").first();
  await seat();
  await page.waitForTimeout(reduced ? 600 : 3400); // one-shot run settles
  await plate.screenshot({
    path: `${OUT}/${TAG}-cadence-case-${label}-${mode}.png`,
  });

  // Home fig 5.3 (work-row echo).
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const row = page.locator("[data-scene-cadence]").first();
  if ((await row.count()) > 0) {
    await seat();
    await page.waitForTimeout(reduced ? 600 : 3400);
    await row.screenshot({
      path: `${OUT}/${TAG}-cadence-home-${label}-${mode}.png`,
    });
  }
  await ctx.close();
}

/** Reduced-motion ch04 resting frames (A7 static world). */
async function ch04Static(width, height, label) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const tops = await page.evaluate(() => {
    const el = (s) => document.querySelector(s);
    const top = (n) =>
      n ? Math.round(n.getBoundingClientRect().top + window.scrollY) : 0;
    return {
      ch04: top(el('[data-chapter="04"]')),
      ch05: top(el('[data-chapter="05"]')),
    };
  });
  for (const [name, y] of [
    ["ch04", tops.ch04 - 40],
    ["seam", tops.ch05 - Math.round(height * 0.8)],
    ["ch05", tops.ch05 - 40],
  ]) {
    await page.evaluate(
      (yy) => window.scrollTo({ top: Math.max(0, yy), behavior: "instant" }),
      y
    );
    await page.waitForTimeout(350);
    await page.screenshot({
      path: `${OUT}/${TAG}-${label}-static-${name}.png`,
    });
  }
  await ctx.close();
}

try {
  await ch04ScrollThrough(1440, 900, "1440");
  await ch04ScrollThrough(390, 844, "390");
  await ch04Static(1440, 900, "1440");
  await ch04Static(390, 844, "390");
  await cadencePlates(1440, 900, "1440", false);
  await cadencePlates(1440, 900, "1440", true);
  await cadencePlates(390, 844, "390", false);
  await cadencePlates(390, 844, "390", true);
  log(`fix3 shoot (${TAG}) ✓ done`);
} catch (e) {
  log(`fix3 shoot ✗ FAILED: ${e.message}`);
  log(e.stack);
} finally {
  await browser.close();
}
