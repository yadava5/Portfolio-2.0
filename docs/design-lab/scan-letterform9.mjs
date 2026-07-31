// HEADER ROUND 9 — letterform pixel scans for the machine redraws.
//
// The round-8 machines drew approximations ("anchors fit from pixel scans")
// and the owner's verdict named the cost: the bird's landed pose had round
// terminals and an open vertex where Fraunces closes it sharp. Round 9
// rebuilds every machine out of clipped copies of the REAL letterform
// (SVG <text>, proven raster-identical to the span in svgtext-align — 0px
// on chromium), so the geometry below is measured off the actual render,
// not asserted.
//
// For each machine letter this scans the settled static render at 3× and
// reports, as fractions of the letter's border box, the ink runs on a
// grid of scanlines — enough to place clip boundaries, hinge points, mask
// skeletons and stroke weights exactly.
//
// Run:  node docs/design-lab/scan-letterform9.mjs
// (prints the tables; writes raw JSON next to the shots)

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";

const CAND = new URL("candidates", import.meta.url).pathname;
const OUT = new URL("shots-header9", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const PORT = 4433;
const server = spawn("npx", ["serve", CAND, "-l", String(PORT)], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));

const DSF = 3;
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: DSF,
});
await page.goto(`http://localhost:${PORT}/header-d-ensemble?static=1`, {
  waitUntil: "networkidle",
});
await page.waitForTimeout(1500);

const geo = await page.evaluate(() => {
  const h1 = document.getElementById("nameplate");
  const letters = [...h1.querySelectorAll(".ch")];
  const seat = document.createElement("span");
  seat.style.cssText = "display:inline-block;width:0;height:0;visibility:hidden";
  h1.appendChild(seat);
  const baseY = seat.getBoundingClientRect().bottom;
  seat.remove();
  const probe = document.createElement("span");
  probe.style.cssText = "position:absolute;visibility:hidden;font:inherit";
  probe.innerHTML =
    '<span data-m="ex" style="display:inline-block;width:0;height:1ex"></span>' +
    '<span data-m="cap" style="display:inline-block;width:0;height:1cap"></span>';
  h1.appendChild(probe);
  const exH = probe.querySelector('[data-m="ex"]').getBoundingClientRect().height;
  const capH = probe.querySelector('[data-m="cap"]').getBoundingClientRect().height;
  probe.remove();
  const pick = (i) => {
    const r = letters[i].getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, ch: letters[i].textContent };
  };
  return {
    base: baseY,
    exH,
    capH,
    fs: parseFloat(getComputedStyle(h1).fontSize),
    letters: { A: pick(0), s: pick(3), a7: pick(7), a9: pick(9), v: pick(10) },
  };
});
console.log("fs", geo.fs, "· exH", geo.exH.toFixed(1), "· capH", geo.capH.toFixed(1), "· baseline y", geo.base.toFixed(1));

const shot = `${OUT}/scan-page.png`;
await page.screenshot({ path: shot });
await browser.close();
server.kill();

const img = await sharp(shot).raw().toBuffer({ resolveWithObject: true });
const { width: W, channels: C } = img.info;
const ink = (x, y) => {
  const i = (Math.round(y) * W + Math.round(x)) * C;
  // paper is ~#FBF3E7 (r 251); ink ~#26231C (r 38). Midpoint threshold.
  return img.data[i] < 145;
};

const out = { meta: { fs: geo.fs, exH: geo.exH, capH: geo.capH } };
for (const [name, L] of Object.entries(geo.letters)) {
  // scan band: from a hair above the letter box to a hair below baseline
  const isCap = name === "A";
  const topRef = isCap ? geo.base - geo.capH : geo.base - geo.exH; // cap/x line
  const px = { x: L.x * DSF, w: L.w * DSF, top: topRef * DSF, base: geo.base * DSF };
  const rows = [];
  const N = 40;
  for (let k = -2; k <= N + 2; k++) {
    const fy = k / N;
    const y = px.top + fy * (px.base - px.top);
    const runs = [];
    let inRun = false, x0 = 0;
    for (let x = px.x - 8 * DSF; x <= px.x + px.w + 8 * DSF; x++) {
      const on = ink(x, y);
      if (on && !inRun) { inRun = true; x0 = x; }
      if (!on && inRun) { inRun = false; runs.push([x0, x - 1]); }
    }
    if (inRun) runs.push([x0, px.x + px.w + 8 * DSF]);
    rows.push({
      fy: +fy.toFixed(3),
      runs: runs.map(([a, b]) => [
        +(((a - px.x) / px.w)).toFixed(4),
        +(((b - px.x) / px.w)).toFixed(4),
      ]),
    });
  }
  out[name] = { box: L, rows };
  console.log(`\n—— ${name} ('${L.ch}') box ${L.w.toFixed(1)}×${L.h.toFixed(1)} @ ${L.x.toFixed(1)} · fy 0 = ${isCap ? "cap" : "x"}-height line, 1 = baseline ——`);
  for (const r of rows) {
    const desc = r.runs
      .map(([a, b]) => `${a.toFixed(3)}–${b.toFixed(3)} (w ${(b - a).toFixed(3)})`)
      .join("  ");
    console.log(`  fy ${String(r.fy).padEnd(6)} ${desc || "·"}`);
  }
}
writeFileSync(`${OUT}/letterform-scan.json`, JSON.stringify(out, null, 1));
console.log(`\nraw → ${OUT}/letterform-scan.json`);
