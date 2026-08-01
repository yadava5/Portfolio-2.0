// CRITIC SHOOT — a full top-to-bottom walk of the static export, hunting faults.
// Serves docs at http://localhost:4321 (npx serve out -l 4321).
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "docs/design-lab/shots-critic";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:4321";
const settle = (p, ms) => p.waitForTimeout(ms);
const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`[${k}] ${typeof v === "string" ? v : JSON.stringify(v)}`);
};

const browser = await chromium.launch();

async function walk(label, viewport, reducedMotion, frames) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2,
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push("PAGEERROR " + e.message));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 1800);

  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  note(`${label}.scrollHeight`, `${h}px = ${(h / window_h(viewport)).toFixed(1)} viewports`);

  for (let i = 0; i < frames; i++) {
    const y = Math.round(((h - viewport.height) * i) / (frames - 1));
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await settle(page, 900);
    await page.screenshot({
      path: `${OUT}/${label}-${String(i).padStart(2, "0")}-y${y}.png`,
    });
  }
  if (consoleErrors.length) note(`${label}.consoleErrors`, consoleErrors.slice(0, 12));
  await ctx.close();
}
function window_h(v) {
  return v.height;
}

try {
  await walk("desk-motion", { width: 1440, height: 900 }, false, 26);
  await walk("mob-motion", { width: 390, height: 844 }, false, 26);
  await walk("desk-reduced", { width: 1440, height: 900 }, true, 14);
  await walk("mob-reduced", { width: 390, height: 844 }, true, 14);
} finally {
  await browser.close();
  writeFileSync(`${OUT}/walk-notes.json`, JSON.stringify(notes, null, 2));
}
