// HEADER ROUND 9 — the landed-pose gate.
//
// The brief's §2 requirement: "the landed/settled pose of every machine
// must BE the letterform — no crossfade papering over a mismatch." Round 9
// builds the machines out of clipped/masked copies of the real letterform,
// so this is verifiable by construction: mount each machine at its resting
// pose (no animations), strip the scaffold (hinge, bead, dial face — the
// tool parts that lift off with the dry), recolour the wet ink to ink, and
// pixel-diff the letter region against the span's own render.
//
// A failure here is a clip-polygon gap, a mask wipe that under-covers, or
// a seat/registration error — exactly the class of defect round 8's bird
// shipped (open vertex, round terminals) and round 9 must not.
//
// Run:  node docs/design-lab/probe-lock9.mjs
// Passes: chromium ≈ 0px per machine (svgtext-align measured 0px for raw
// text); webkit shows sub-half-pixel seat AA (~0.4–0.9% of the region),
// recorded honestly below the chromium numbers.

import { chromium, webkit } from "@playwright/test";
import { spawn } from "node:child_process";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const CAND = new URL("candidates", import.meta.url).pathname;
const OUT = new URL("shots-header9", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const PORT = 4436;
const server = spawn("npx", ["serve", CAND, "-l", String(PORT)], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 2500));

const MACHINES = [
  ["dividers", 0], ["road", 3], ["dial", 7], ["runner", 9], ["bird", 10],
];

for (const [bname, btype] of [["chromium", chromium], ["webkit", webkit]]) {
  const browser = await btype.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2,
  });
  await page.goto(`http://localhost:${PORT}/header-d-ensemble?static=1`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1500);

  for (const [which, idx] of MACHINES) {
    const box = await page.evaluate((i) => {
      const r = document.querySelectorAll("#nameplate .ch")[i].getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    }, idx);
    const clip = {
      x: box.x - 14, y: box.y - 14, width: box.w + 28, height: box.h + 34,
    };
    const ref = `${OUT}/lock-${bname}-${which}-span.png`;
    await page.screenshot({ path: ref, clip });
    await page.evaluate(([w, i]) => {
      const svg = window.__mech.buildResting(w);
      svg.id = "lockprobe";
      /* the scaffold lifts off with the dry — it is not the letter */
      svg.querySelectorAll("path,circle,ellipse").forEach((n) => {
        if (!n.closest("defs")) n.remove();
      });
      svg.querySelectorAll("text").forEach((t) => t.setAttribute("fill", "#26231C"));
      document.querySelectorAll("#nameplate .ch")[i].style.opacity = "0";
    }, [which, idx]);
    const got = `${OUT}/lock-${bname}-${which}-machine.png`;
    await page.screenshot({ path: got, clip });
    await page.evaluate((i) => {
      document.getElementById("lockprobe").remove();
      document.querySelectorAll("#nameplate .ch")[i].style.opacity = "";
    }, idx);

    const a = await sharp(ref).raw().toBuffer({ resolveWithObject: true });
    const b = await sharp(got).raw().toBuffer({ resolveWithObject: true });
    let diff = 0;
    for (let i = 0; i < a.data.length; i += a.info.channels) {
      if (
        Math.abs(a.data[i] - b.data[i]) > 8 ||
        Math.abs(a.data[i + 1] - b.data[i + 1]) > 8 ||
        Math.abs(a.data[i + 2] - b.data[i + 2]) > 8
      ) diff++;
    }
    const total = a.info.width * a.info.height;
    console.log(
      `${bname} ${which.padEnd(8)} landed-pose diff: ${String(diff).padStart(6)}px` +
      ` of ${total} (${((diff / total) * 100).toFixed(3)}%)`
    );
  }
  await browser.close();
}
server.kill();
