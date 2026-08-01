/**
 * Independent verification of Layer 1 — I do not take the builder's
 * numbers on trust. Run against the built `out/` on PORT.
 *
 *  1. Horizontal overflow at 8 widths x 3 routes (scrollWidth vs clientWidth)
 *  2. A7: the reduced-motion resting frame vs the motion settled frame
 *  3. The ArtifactGallery crop-plate concern: does the 2px depth drift
 *     escape its overflow-hidden window, or move the plate's layout box?
 *  4. Screenshots I can actually look at.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const PORT = process.env.PORT || "4310";
const BASE = `http://127.0.0.1:${PORT}`;
const SHOTS = new URL("./shots-verify/", import.meta.url).pathname;
mkdirSync(SHOTS, { recursive: true });

const WIDTHS = [320, 375, 414, 768, 1024, 1280, 1440, 2560];
const ROUTES = ["/", "/evidence/", "/projects/jobtracker/"];

const browser = await chromium.launch();
let fail = 0;

/* ── 1. overflow ─────────────────────────────────────────────────── */
console.log("\n== 1. horizontal overflow (scrollWidth must equal clientWidth) ==");
for (const route of ROUTES) {
  const row = [];
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    // scroll the whole page so every view-timeline animation has run
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 12));
      }
      window.scrollTo(0, 0);
    });
    const r = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    const ok = r.sw === r.cw;
    if (!ok) fail++;
    row.push(`${w}:${ok ? "ok" : `OVER +${r.sw - r.cw}`}`);
    await ctx.close();
  }
  console.log(`  ${route.padEnd(24)} ${row.join("  ")}`);
}

/* ── 2. A7 — resting frame identity ──────────────────────────────── */
console.log("\n== 2. A7: reduced-motion resting == motion settled ==");
async function captionState(reduced) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/projects/jobtracker/", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 10));
    }
  });
  await page.waitForTimeout(900);
  const s = await page.evaluate(() => {
    const els = [...document.querySelectorAll("figcaption")].slice(0, 6);
    return els.map((el) => {
      const c = getComputedStyle(el);
      return { op: c.opacity, tf: c.transform };
    });
  });
  await ctx.close();
  return s;
}
const motion = await captionState(false);
const reduced = await captionState(true);
motion.forEach((m, i) => {
  const r = reduced[i];
  const same = m.op === r.op && m.tf === r.tf;
  if (!same) fail++;
  console.log(
    `  figcaption[${i}] motion(op=${m.op} tf=${m.tf})  reduced(op=${r.op} tf=${r.tf})  ${same ? "IDENTICAL" : "*** DIFFERS ***"}`,
  );
});

/* ── 3. the ArtifactGallery crop-plate concern ───────────────────── */
console.log("\n== 3. plate depth: does the drift move layout or escape the crop? ==");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/projects/jobtracker/", { waitUntil: "networkidle" });
  const probe = await page.evaluate(async () => {
    const plate = document.querySelector(".plate-paper:not(.portrait-riser)");
    if (!plate) return { note: "no plate found" };
    const img = plate.querySelector("img");
    const readings = [];
    for (const y of [0, 600, 1200, 1800]) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
      const pb = plate.getBoundingClientRect();
      const ib = img ? img.getBoundingClientRect() : null;
      readings.push({
        y,
        plateH: +pb.height.toFixed(2),
        plateW: +pb.width.toFixed(2),
        imgTf: img ? getComputedStyle(img).transform : null,
        // is any part of the img painted outside the plate's padding box?
        escapesTop: ib ? +(pb.top - ib.top).toFixed(2) : null,
        contain: getComputedStyle(plate).contain,
      });
    }
    return { readings };
  });
  console.log(JSON.stringify(probe, null, 2));
  // the plate's own box must never change size as the print drifts
  if (probe.readings) {
    const hs = new Set(probe.readings.map((r) => r.plateH));
    const ws = new Set(probe.readings.map((r) => r.plateW));
    const stable = hs.size === 1 && ws.size === 1;
    if (!stable) fail++;
    console.log(`  plate layout box stable across scroll: ${stable ? "YES" : "*** NO — layout moves ***"}`);
  }
  await ctx.close();
}

/* ── 4. shots ────────────────────────────────────────────────────── */
console.log("\n== 4. screenshots ==");
for (const [name, route, y] of [
  ["home-top", "/", 0],
  ["home-work", "/", 6000],
  ["case-hero", "/projects/jobtracker/", 300],
  ["case-artifacts", "/projects/jobtracker/", 4200],
]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${SHOTS}${name}.png` });
  console.log(`  ${SHOTS}${name}.png`);
  await ctx.close();
}

await browser.close();
console.log(fail === 0 ? "\nALL CHECKS PASSED" : `\n*** ${fail} CHECK(S) FAILED ***`);
process.exit(fail === 0 ? 0 : 1);
