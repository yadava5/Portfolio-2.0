/**
 * F70 probe — the static-world gates, checked in every world.
 *
 * ~14 gates in globals.css were written twice, verbatim: once under
 * `@media (prefers-reduced-motion: reduce)` and once under
 * `html[data-motion-off]`. Where motion is something the engine world
 * ADDS (a transition), both copies collapse into ONE rule under
 * `@media (prefers-reduced-motion: no-preference) {
 * html:not([data-motion-off]) … }`.
 *
 * That refactor is only correct if the computed value is unchanged in
 * all four worlds, so this reports the gated property for each of them:
 *
 *   motion          — no preference, no toggle
 *   quiet-toggle    — no preference, `data-motion-off` set
 *   reduced         — OS reduced motion (which also sets the toggle
 *                     attribute once SmoothScroll has hydrated)
 *   reduced+toggle  — both
 *
 * Expected after the inversion, exactly as before it: a real duration
 * in `motion`, and `0s` (or `none`) in the other three.
 *
 * Usage: PORT=3200 node docs/design-lab/probe-w4gates.mjs [tag]
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

/* selector → the property the gate governs */
const GATES = [
  [".daymark-fill", "transitionDuration"],
  [".link-draw", "transitionDuration"],
  [".link-draw-quiet", "transitionDuration"],
  [".rail-mark", "transitionDuration"],
  [".rail-label", "transitionDuration"],
  ["[data-pipeline-note]", "transitionDuration"],
  ["[data-registry-row]", "transitionDuration"],
  /* untouched pairs, as controls */
  [".site-footer", "backgroundColor"],
  ["[data-chapter='03']", "backgroundColor"],
  [".thread-segment .thread-past", "strokeWidth"],
];

const worlds = [
  ["motion", { reducedMotion: "no-preference" }, null],
  [
    "quiet-toggle",
    { reducedMotion: "no-preference" },
    () => localStorage.setItem("motion-off", "1"),
  ],
  ["reduced", { reducedMotion: "reduce" }, null],
  [
    "reduced+toggle",
    { reducedMotion: "reduce" },
    () => localStorage.setItem("motion-off", "1"),
  ],
];

const report = {};
for (const [label, opts, init] of worlds) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...opts,
  });
  const page = await ctx.newPage();
  if (init) await page.addInitScript(init);
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  report[label] = await page.evaluate((gates) => {
    const out = {};
    for (const [selector, prop] of gates) {
      const el = document.querySelector(selector);
      out[`${selector} · ${prop}`] = el
        ? getComputedStyle(el)[prop]
        : "(absent)";
    }
    out["html[data-motion-off]"] =
      document.documentElement.hasAttribute("data-motion-off");
    return out;
  }, GATES);
  await ctx.close();
}

await browser.close();
server.kill();
fs.writeFileSync(
  path.join(OUT, `probe-gates-${TAG}.json`),
  JSON.stringify(report, null, 2)
);
console.log(JSON.stringify(report, null, 2));
