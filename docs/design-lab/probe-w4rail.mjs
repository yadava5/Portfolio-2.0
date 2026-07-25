/**
 * F63/F82 rail probe — how far right the fixed chapter rail actually
 * reaches, against `RAIL_CLEARANCE = 136 /* rail ends by ~113px *\/`.
 *
 * Measures the widest rail row (number + name, both now resting visible
 * after Wave 2's F13 fix) at every xl width where the spine is clamped
 * to the clearance, and reports the folio hairline's composed ink.
 *
 * Usage: PORT=3200 node docs/design-lab/probe-w4rail.mjs
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

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
const report = {};

for (const width of [1280, 1300, 1340, 1360, 1440, 1600]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.addInitScript(() => localStorage.setItem("motion-off", "1"));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  report[width] = await page.evaluate(() => {
    const rail = document.querySelector("nav[aria-label*='hapter']") ??
      document.querySelector(".rail-label")?.closest("nav");
    const rows = [...document.querySelectorAll(".rail-label")];
    const right = Math.max(
      ...rows.map((r) => Math.round(r.getBoundingClientRect().right))
    );
    const hair = document.querySelector(".folio-rule span");
    const hairStyle = hair ? getComputedStyle(hair) : null;
    const parent = hair?.parentElement;
    return {
      railRight: rail ? Math.round(rail.getBoundingClientRect().right) : null,
      widestLabelRight: rows.length ? right : null,
      labels: rows.length,
      hairOpacity: hairStyle?.opacity ?? null,
      folioOpacity: parent ? getComputedStyle(parent).opacity : null,
      folioColor: parent ? getComputedStyle(parent).color : null,
    };
  });
  await page.close();
}

await browser.close();
server.kill();
fs.writeFileSync(
  path.join(OUT, "probe-rail.json"),
  JSON.stringify(report, null, 2)
);
console.log(JSON.stringify(report, null, 2));
