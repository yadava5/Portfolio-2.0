/**
 * Record the owner's exact complaint-repro: a SLOW human wheel scroll from
 * mid-chapter-05 through the 05→06 dusk choreography to the chapter-06
 * settle, as VIDEO (chromium 1440×900, motion on), plus a telemetry JSON
 * (scrollY, --arc-l/c/h, resolved base background, root phase attrs,
 * sampled every ~200ms) so each visible jump can be tied to the exact
 * stop/flip that caused it.
 *
 * Serves the committed static export (build first):
 *   NEXT_PUBLIC_BASE_PATH= npm run build
 *   node docs/design-lab/shoot-dusk2.mjs before   # or: after
 *
 * Writes docs/design-lab/shots-dusk2/<name>.webm, <name>-telemetry.json,
 * and 12 evenly-spaced <name>-frame-NN.png stills (ffmpeg).
 */

import { chromium } from "@playwright/test";
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, copyFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const name = process.argv[2] ?? "before";
const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const outDir = resolve(repo, "docs/design-lab/shots-dusk2");
mkdirSync(outDir, { recursive: true });

const PORT = 3311;
const server = spawn(process.execPath, ["tests/playwright/static-server.mjs"], {
  cwd: repo,
  env: { ...process.env, PORT: String(PORT) },
  stdio: "ignore",
});
await new Promise((r) => setTimeout(r, 1500));

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: outDir, size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
const videoEpoch = Date.now(); // video t=0 ≈ page creation

await page.goto(`http://127.0.0.1:${PORT}/`);
await page
  .locator("header[data-lenis-connected='true']")
  .waitFor({ timeout: 8000 });
await page.locator(".pin-spacer").first().waitFor({ timeout: 8000 });
await page.waitForTimeout(600);

/* Geometry: start with chapter 05's midpoint centered, end settled a
   touch past the choreography's end (chapter 06 top at viewport top). */
const geom = await page.evaluate(() => {
  const s05 = document
    .querySelector("[data-chapter='05']")
    .getBoundingClientRect();
  const s06 = document
    .querySelector("[data-chapter='06']")
    .getBoundingClientRect();
  const vh = window.innerHeight;
  const top05 = s05.top + window.scrollY;
  const top06 = s06.top + window.scrollY;
  return {
    startY: Math.round(top05 + s05.height / 2 - vh / 2),
    rangeStartY: Math.round(top06 - vh * 0.92),
    endY: Math.round(top06 + 150),
    vh,
  };
});

await page.evaluate(
  (y) => window.scrollTo({ top: y, behavior: "instant" }),
  geom.startY
);
await page.waitForTimeout(1200);

/* Telemetry sampler — runs concurrently with the wheel loop. */
const samples = [];
let sampling = true;
const sampler = (async () => {
  while (sampling) {
    const s = await page.evaluate(() => {
      const field = document.querySelector("[data-light-field]");
      const base = document.querySelector(
        "[data-testid='light-field-base']"
      );
      const cs = field ? getComputedStyle(field) : null;
      return {
        scrollY: Math.round(window.scrollY),
        arcL: cs?.getPropertyValue("--arc-l").trim() ?? "",
        arcC: cs?.getPropertyValue("--arc-c").trim() ?? "",
        arcH: cs?.getPropertyValue("--arc-h").trim() ?? "",
        baseBg: base ? getComputedStyle(base).backgroundColor : "",
        phase: document.documentElement.getAttribute("data-arc-phase") ?? "",
        chrome: document.documentElement.getAttribute("data-arc-chrome") ?? "",
        gloaming: document.documentElement.hasAttribute("data-arc-gloaming"),
      };
    });
    samples.push({ t: (Date.now() - videoEpoch) / 1000, ...s });
    await new Promise((r) => setTimeout(r, 160));
  }
})();

/* The slow human scroll: small wheel ticks, ~52s over the whole span. */
const distance = geom.endY - geom.startY;
const TICK_MS = 40;
const DURATION_MS = 52000;
const ticks = Math.round(DURATION_MS / TICK_MS);
const perTick = distance / ticks;

const wheelStart = (Date.now() - videoEpoch) / 1000;
let carried = 0;
for (let i = 0; i < ticks; i++) {
  carried += perTick;
  const delta = Math.floor(carried);
  if (delta >= 1) {
    carried -= delta;
    await page.mouse.wheel(0, delta);
  }
  await page.waitForTimeout(TICK_MS - 2);
}
const wheelEnd = (Date.now() - videoEpoch) / 1000;
await page.waitForTimeout(1800);

sampling = false;
await sampler;

const video = page.video();
await context.close();
const rawPath = await video.path();
await browser.close();
server.kill();

const videoPath = `${outDir}/${name}.webm`;
copyFileSync(rawPath, videoPath);
writeFileSync(
  `${outDir}/${name}-telemetry.json`,
  JSON.stringify({ geom, wheelStart, wheelEnd, samples }, null, 1)
);

/* 12 evenly-spaced stills across the wheel window. */
for (let i = 0; i < 12; i++) {
  const t = wheelStart + ((wheelEnd - wheelStart) * (i + 0.5)) / 12;
  execFileSync("ffmpeg", [
    "-y",
    "-ss",
    t.toFixed(2),
    "-i",
    videoPath,
    "-frames:v",
    "1",
    `${outDir}/${name}-frame-${String(i).padStart(2, "0")}.png`,
  ]);
}
console.log(
  `Wrote ${videoPath} (${(wheelEnd - wheelStart).toFixed(1)}s scroll), ` +
    `telemetry + 12 frames`
);
