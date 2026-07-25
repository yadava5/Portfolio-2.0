/**
 * Wave 4 (engine) shots — the surfaces this wave can move, on screen.
 *
 * The engine pass is mostly invisible by design: a landing offset, a
 * governor verdict's shelf life, a dead options bag. Three things DO
 * paint, and these are they.
 *
 *   spine-*   — the Red Thread's binding seat either side of the xl
 *               boundary (F63: the clamp used to run the spine through
 *               the chapter rail's labels between 1280 and ~1344)
 *   land-*    — a shared `/#gate` and `/#fig-4`, where a reader lands
 *               (F69: 192px and 208px against the engine's 96px)
 *   static-*  — the two static worlds, so the F70 gate inversion and
 *               the F79 dip gate can be compared frame for frame
 *
 * Usage: PORT=3200 node docs/design-lab/shoot-w4eng.mjs [tag]
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

/* ── The spine either side of xl, static world so it is fully drawn ── */
for (const width of [1279, 1280, 1300, 1360, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.addInitScript(() => localStorage.setItem("motion-off", "1"));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 1700));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, `${TAG}-spine-${width}.png`) });
  await page.close();
}

/* ── Where a shared link lands ───────────────────────────────────── */
for (const [label, url] of [
  ["gate", "/#gate"],
  ["values", "/#values"],
  ["fig", "/projects/automl/#fig-4"],
]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUT, `${TAG}-land-${label}.png`) });
  await page.close();
}

/* ── The two static worlds, at the chapter the dip lives in ──────── */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => localStorage.setItem("motion-off", "1"));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 7500));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, `${TAG}-static-quiet.png`) });
  await page.close();

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const p2 = await ctx.newPage();
  await p2.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await p2.waitForTimeout(900);
  await p2.evaluate(() => window.scrollTo(0, 7500));
  await p2.waitForTimeout(600);
  await p2.screenshot({ path: path.join(OUT, `${TAG}-static-reduced.png`) });
  await ctx.close();
}

/* ── The masthead, the daymark and the footer in both worlds (F70) ── */
for (const [label, opts] of [
  ["motion", {}],
  ["reduced", { reducedMotion: "reduce" }],
]) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ...opts,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, `${TAG}-chrome-${label}.png`) });
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight)
  );
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, `${TAG}-footer-${label}.png`) });
  await ctx.close();
}

await browser.close();
server.kill();
console.log(`shots written to ${OUT} (${TAG})`);
