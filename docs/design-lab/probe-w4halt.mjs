/**
 * F72 repro — does the halt marker survive a re-measure honestly?
 *
 * The run token's `is-halted` class is the ONLY thing that distinguishes
 * "the pipeline reached the human gate and is waiting" from "the
 * pipeline is still running": globals.css paints
 * `.pipeline-token.is-halted .pipeline-token-bead` clay, and the static
 * rules draw `.pipeline-edge` to the gate regardless. A stale mark
 * therefore renders a fully-drawn pipeline halted at `1.0 ingest`.
 *
 * The repro is a re-measure that lands the run BELOW the halt while the
 * mark is already lit: scroll past the gate at a short viewport, then
 * resize in BOTH axes. Height alone is not enough — the ladder's
 * measured geometry is unchanged, so `setGeom` returns the previous
 * object, the scrub effect never re-runs, and nothing can desync. The
 * width change is what forces the re-measure (a new `railX`/`width`),
 * and the height change is what drops the progress back below
 * `TRAVEL_END`: `PIN_VH` is a fraction of the viewport, so a taller
 * window stretches the pinned range and the same scrollY becomes an
 * earlier progress. The token must walk back down the ladder and the
 * mark must go out with it.
 *
 * Reports, at each step: the token's translateY, whether `is-halted` is
 * set, and the bead's computed fill. `halted` and a mid-ladder `ty` in
 * the same row is the fault.
 *
 * Usage: PORT=3200 node docs/design-lab/probe-w4halt.mjs [tag]
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const TAG = process.argv[2] ?? "after";
const PORT = process.env.PORT ?? "3200";
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(process.cwd(), "docs/design-lab/shots-w4eng");
fs.mkdirSync(OUT, { recursive: true });

const server = spawn(process.execPath, ["tests/playwright/static-server.mjs"], {
  env: { ...process.env, PORT },
  stdio: "ignore",
});
await new Promise((r) => setTimeout(r, 2000));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 700 } });
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const read = () =>
  page.evaluate(() => {
    const token = document.querySelector(".pipeline-token");
    const bead = document.querySelector(".pipeline-token-bead");
    if (!token || !bead) return { error: "no token" };
    const t = getComputedStyle(token).transform;
    return {
      ty: t && t !== "none" ? Math.round(parseFloat(t.split(",")[5])) : 0,
      halted: token.classList.contains("is-halted"),
      beadFill: getComputedStyle(bead).fill,
      scrollY: Math.round(window.scrollY),
    };
  });

/* Walk into the pin and past the gate at the short viewport. */
const steps = [];
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
});
for (const y of [2400, 2800, 3200, 3600, 4000]) {
  await page.evaluate((to) => window.scrollTo(0, to), y);
  await page.waitForTimeout(220);
  steps.push({ step: `scroll ${y} @700`, ...(await read()) });
}
const pastGate = steps.at(-1);

/* Resize across the `WIDE_QUERY` breakpoint AND taller. Crossing 1024
   flips the `wide` state, which is the one dependency guaranteed to
   re-run the scrub effect (a same-column width change often leaves
   railX/phase0Y/gateY/height identical, `setGeom` returns the previous
   object and React bails out of the render entirely). The taller
   viewport stretches the pinned range so the same scrollY falls back
   below the halt. */
await page.setViewportSize({ width: 900, height: 1100 });
await page.waitForTimeout(900);
steps.push({ step: "after resize 1440x700→900x1100", ...(await read()) });
await page.evaluate(() => window.scrollTo(0, window.scrollY - 2));
await page.waitForTimeout(400);
steps.push({ step: "nudge after resize", ...(await read()) });
await page.screenshot({ path: path.join(OUT, `${TAG}-halt-resize.png`) });

const final = steps.at(-1);
const report = {
  steps,
  pastGate,
  final,
  /* The fault: the mark lit while the token sits short of the gate. */
  staleHaltMark: final.halted === true && final.ty < pastGate.ty - 4,
};

await browser.close();
server.kill();
fs.writeFileSync(
  path.join(OUT, `probe-halt-${TAG}.json`),
  JSON.stringify(report, null, 2)
);
console.log(JSON.stringify(report, null, 2));
