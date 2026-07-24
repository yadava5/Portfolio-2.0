/**
 * Shoot the world layer (Group β): the choreographed dusk (brief B9) at
 * every rendered stop, plus the phase-flip boundary — desktop 1440×900
 * and mobile 390×844 — into docs/design-lab/shots-world/.
 *
 * Serves the committed static export (build first):
 *   NEXT_PUBLIC_BASE_PATH= npx next build --webpack
 *   node docs/design-lab/shoot-world.mjs
 */

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const outDir = resolve(repo, "docs/design-lab/shots-world");
mkdirSync(outDir, { recursive: true });

const PORT = 3302;
const server = spawn(
  process.execPath,
  ["tests/playwright/static-server.mjs"],
  { cwd: repo, env: { ...process.env, PORT: String(PORT) }, stdio: "ignore" }
);
await new Promise((r) => setTimeout(r, 1500));

/* The choreography range (DayArc.tsx): section 06, top 92% → top top. */
const RANGE_START = 0.92;
const topFractionAt = (p) => RANGE_START * (1 - p);

/* Stop positions from waypoints.generated.ts DUSK_CHOREO (+ half a step
   so each shot lands INSIDE its stop's span, not on its boundary —
   shots-dusk2 retune: 12 stops, flip 0.72, chrome stagger 0.7775). */
const STOPS = [
  { name: "stop-00-w05-golden", p: 0.05 },
  { name: "stop-01", p: 0.11 + 0.055 },
  { name: "stop-02", p: 0.22 + 0.055 },
  { name: "stop-03", p: 0.33 + 0.055 },
  { name: "stop-04", p: 0.44 + 0.055 },
  { name: "stop-05", p: 0.55 + 0.055 },
  { name: "stop-06-day-floor", p: 0.66 + 0.03 },
  { name: "stop-07-night-entry", p: 0.72 + 0.028 },
  { name: "stop-08-chrome-dusk", p: 0.7775 + 0.028 },
  { name: "stop-09", p: 0.835 + 0.028 },
  { name: "stop-10", p: 0.8925 + 0.028 },
  { name: "stop-11-w06-dusk", p: 0.97 },
];

const BOUNDARY = [
  { name: "boundary-late-ch05-no-dusk", fraction: 1.2 },
  { name: "boundary-pre-flip-day", fraction: topFractionAt(0.69) },
  { name: "boundary-post-flip-dusk", fraction: topFractionAt(0.75) },
];

const browser = await chromium.launch();

for (const [device, viewport] of [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
]) {
  const page = await browser.newPage({ viewport });
  await page.goto(`http://127.0.0.1:${PORT}/`);
  await page
    .locator("header[data-lenis-connected='true']")
    .waitFor({ timeout: 8000 });
  await page.locator(".pin-spacer").first().waitFor({ timeout: 8000 });
  await page.waitForTimeout(400);

  const scrollTo = (fraction) =>
    page.evaluate((f) => {
      const section = document.querySelector("[data-chapter='06']");
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.round(top - window.innerHeight * f),
        behavior: "instant",
      });
    }, fraction);

  for (const stop of STOPS) {
    await scrollTo(topFractionAt(stop.p));
    await page.waitForTimeout(250);
    await page.screenshot({
      path: `${outDir}/dusk-${stop.name}-${device}.png`,
    });
  }
  for (const shot of BOUNDARY) {
    await scrollTo(shot.fraction);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${outDir}/${shot.name}-${device}.png` });
  }
  await page.close();
}

await browser.close();
server.kill();
console.log(`Wrote shots to ${outDir}`);
