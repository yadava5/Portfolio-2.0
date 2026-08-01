// NITPICK 3 — the stamp's focus state, read as a reader reads it.
// Does the FOCUSED plate differ from the RESTING plate unmistakably at a
// glance? Measured three ways: the computed style, a pixel diff of the
// two frames, and the frames themselves for the eye.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-nitpick3";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3601";
const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`\n[${k}] ${typeof v === "string" ? v : JSON.stringify(v, null, 1)}`);
};

const browser = await chromium.launch();

for (const [vw, vh] of [
  [1440, 900],
  [390, 844],
]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2500);
  // bring it into view without hovering it
  await page.evaluate(() => {
    [...document.querySelectorAll("[data-stamp]")].find((e) => e.getBoundingClientRect().width > 0)?.scrollIntoView({ block: "center" });
  });
  await page.waitForTimeout(1400);
  const geo = await page.evaluate(() => {
    const el = [...document.querySelectorAll("[data-stamp]")].find((e) => e.getBoundingClientRect().width > 0);
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const reg = el.querySelector(".stamp-register");
    return {
      box: { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) },
      rotate: cs.rotate,
      color: cs.color,
      registerOpacityResting: reg ? getComputedStyle(reg).opacity : null,
      outlineResting: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`,
      ariaLabel: el.getAttribute("aria-label"),
    };
  });
  note(`stamp.geo@${vw}`, geo);
  if (!geo) { await ctx.close(); continue; }
  const PAD = 26;
  const clip = {
    x: Math.max(0, geo.box.x - PAD),
    y: Math.max(0, geo.box.y - PAD),
    width: Math.min(vw - Math.max(0, geo.box.x - PAD), geo.box.w + PAD * 2),
    height: Math.min(vh - Math.max(0, geo.box.y - PAD), geo.box.h + PAD * 2),
  };
  await page.screenshot({ path: `${OUT}/n3-stamp-${vw}-rest.png`, clip });

  // Tab to it for real — a keyboard reader's route
  const reached = await page.evaluate(() => {
    const el = [...document.querySelectorAll("[data-stamp]")].find((e) => e.getBoundingClientRect().width > 0);
    el.focus();
    return { active: document.activeElement === el, fv: el.matches(":focus-visible") };
  });
  await page.waitForTimeout(500);
  const focused = await page.evaluate(() => {
    const el = [...document.querySelectorAll("[data-stamp]")].find((e) => e.getBoundingClientRect().width > 0);
    const cs = getComputedStyle(el);
    const reg = el.querySelector(".stamp-register");
    const rs = reg ? getComputedStyle(reg) : null;
    return {
      outline: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`,
      registerOpacity: rs?.opacity,
      registerStroke: rs?.stroke,
      registerStrokeWidth: rs?.strokeWidth,
      registerBox: reg ? (() => { const b = reg.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height) }; })() : null,
    };
  });
  note(`stamp.focus@${vw}`, { reached, ...focused });
  await page.screenshot({ path: `${OUT}/n3-stamp-${vw}-focus.png`, clip });

  // pixel diff
  const A = await sharp(`${OUT}/n3-stamp-${vw}-rest.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const B = await sharp(`${OUT}/n3-stamp-${vw}-focus.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = A.info;
  const total = W * H;
  let changed = 0, maxD = 0;
  const out = Buffer.alloc(total * 3);
  for (let i = 0; i < total; i++) {
    const o = i * 4;
    const d =
      Math.abs(A.data[o] - B.data[o]) +
      Math.abs(A.data[o + 1] - B.data[o + 1]) +
      Math.abs(A.data[o + 2] - B.data[o + 2]);
    if (d > 12) changed++;
    if (d > maxD) maxD = d;
    const p = i * 3;
    out[p] = d > 12 ? 255 : 250;
    out[p + 1] = d > 12 ? 0 : 246;
    out[p + 2] = d > 12 ? 0 : 239;
  }
  await sharp(out, { raw: { width: W, height: H, channels: 3 } }).png().toFile(`${OUT}/n3-stamp-${vw}-diff.png`);
  note(`stamp.pixelDiff@${vw}`, {
    frame: `${W}x${H}`,
    changedPx: changed,
    pctOfFrame: +((changed / total) * 100).toFixed(2),
    maxChannelDelta: maxD,
  });

  // and the neighbouring controls, for comparison — what a normal focus
  // ring costs in changed pixels on this same page
  await ctx.close();
}

writeFileSync(`${OUT}/stamp-notes.json`, JSON.stringify(notes, null, 1));
await browser.close();
console.log("\n--- done ---");
