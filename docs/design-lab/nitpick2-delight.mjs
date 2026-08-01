// NITPICK ROUND 2 — the two delight items my first pass measured badly:
// the day-arc light (is the GROUND actually moving?) and back-restore
// (click a link the reader can already see, so nothing auto-scrolls).
// Plus the poster that renders three times, and the stamp's focus ring.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const OUT = "docs/design-lab/shots-nitpick2";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3600";
const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`[${k}] ${typeof v === "string" ? v : JSON.stringify(v)}`);
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 12);

const browser = await chromium.launch();

// ---------- 1. the day-arc: sample the PAINTED ground, not a variable ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const samples = [];
  for (const y of [0, 1400, 2800, 4200, 5600, 7000, 8400, 9600]) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(1300);
    // sample a 6x6 patch of blank paper in the top-right, away from ink
    const px = await page.screenshot({ clip: { x: 1340, y: 700, width: 40, height: 40 } });
    const { createCanvas, loadImage } = { createCanvas: null, loadImage: null };
    // read average colour via the page itself
    const avg = await page.evaluate(async (buf) => {
      return null;
    }, null);
    const vars = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      const varsOut = {};
      for (const n of [
        "--color-canvas",
        "--day-t",
        "--day-warmth",
        "--paper",
        "--header-paper",
        "--color-paper",
        "--ground",
      ]) {
        const v = cs.getPropertyValue(n).trim();
        if (v) varsOut[n] = v;
      }
      // and every element painting a full-viewport ground
      const grounds = [];
      for (const el of document.querySelectorAll("body > *, main > *, [data-day], [class*='day']")) {
        const b = el.getBoundingClientRect();
        const c = getComputedStyle(el);
        if (b.width > 1200 && c.backgroundColor !== "rgba(0, 0, 0, 0)")
          grounds.push({
            tag: el.tagName,
            cls: String(el.className ?? "").slice(0, 44),
            bg: c.backgroundColor,
            op: c.opacity,
          });
        if (b.width > 1200 && c.backgroundImage !== "none")
          grounds.push({
            tag: el.tagName,
            cls: String(el.className ?? "").slice(0, 44),
            bgImg: c.backgroundImage.slice(0, 70),
            op: c.opacity,
          });
      }
      return {
        vars: varsOut,
        grounds: grounds.slice(0, 6),
        chapter: document.body.dataset.chapter ?? null,
      };
    });
    const p = `${OUT}/arc-y${String(y).padStart(5, "0")}.png`;
    await page.screenshot({ path: p, clip: { x: 1300, y: 620, width: 120, height: 120 } });
    samples.push({ y, sha: sha(p), ...vars });
  }
  note("dayArc.samples", samples);
  note("dayArc.distinctGrounds", [...new Set(samples.map((s) => s.sha))].length);
  await ctx.close();
}

// ---------- 2. back-restore, done honestly ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  // scroll deep, then click a link that is ALREADY on screen
  await page.evaluate(() => window.scrollTo(0, 5200));
  await page.waitForTimeout(1400);
  const target = await page.evaluate(() => {
    const a = [...document.querySelectorAll("a[href*='/projects/']")].find((x) => {
      const b = x.getBoundingClientRect();
      return b.top > 60 && b.bottom < window.innerHeight - 20 && b.width > 20;
    });
    return a ? { text: a.innerText.trim().slice(0, 40), href: a.getAttribute("href") } : null;
  });
  const before = await page.evaluate(() => Math.round(window.scrollY));
  note("back.target", { target, before });
  if (target) {
    await page.evaluate(() => {
      const a = [...document.querySelectorAll("a[href*='/projects/']")].find((x) => {
        const b = x.getBoundingClientRect();
        return b.top > 60 && b.bottom < window.innerHeight - 20 && b.width > 20;
      });
      a.click();
    });
    await page.waitForTimeout(2200);
    const url = page.url();
    const midScroll = await page.evaluate(() => Math.round(window.scrollY));
    await page.goBack({ waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    const after = await page.evaluate(() => Math.round(window.scrollY));
    note("back.restore", { before, url, midScroll, after, delta: after - before });
    await page.screenshot({ path: `${OUT}/back-restored.png` });
  }
  await ctx.close();
}

// ---------- 3. the poster that renders three times ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/projects/automl/", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
  });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const posters = [...document.querySelectorAll("img")].filter((i) =>
      /poster-proof/.test(i.currentSrc || i.src),
    );
    return posters.map((i) => {
      const b = i.getBoundingClientRect();
      const chain = [];
      let n = i.parentElement;
      for (let k = 0; k < 6 && n; k++) {
        const c = getComputedStyle(n);
        chain.push(
          `${n.tagName}.${String(n.className ?? "").split(" ").slice(0, 2).join(".")}[${c.display}/${c.position}/op:${c.opacity}/clip:${c.overflow}]`,
        );
        n = n.parentElement;
      }
      return {
        docTop: Math.round(b.top + window.scrollY),
        w: Math.round(b.width),
        h: Math.round(b.height),
        opacity: getComputedStyle(i).opacity,
        chain,
      };
    });
  });
  note("automl.posterCopies", r);
  await page.evaluate(() => {
    const i = [...document.querySelectorAll("img")].find((x) => /poster-proof/.test(x.currentSrc || x.src));
    i?.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/automl-poster-region.png`, fullPage: false });
  await ctx.close();
}

// ---------- 4. the stamp's focus ring, shot ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1600);
  const box = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      /press here to sign|awaiting/i.test(x.innerText ?? ""),
    );
    if (!b) return null;
    b.scrollIntoView({ block: "center" });
    return true;
  });
  await page.waitForTimeout(1300);
  const clip = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      /press here to sign|awaiting/i.test(x.innerText ?? ""),
    );
    b.focus();
    const r = b.getBoundingClientRect();
    const cs = getComputedStyle(b);
    return {
      clip: {
        x: Math.max(0, Math.round(r.left) - 24),
        y: Math.max(0, Math.round(r.top) - 24),
        width: Math.min(1440, Math.round(r.width) + 48),
        height: Math.min(900, Math.round(r.height) + 48),
      },
      ring: cs.outlineColor,
      w: cs.outlineWidth,
      off: cs.outlineOffset,
    };
  });
  note("stamp.focusRing", { ring: clip.ring, w: clip.w, off: clip.off });
  await page.screenshot({ path: `${OUT}/stamp-focus.png`, clip: clip.clip });
  await ctx.close();
}

// ---------- 5. the rail's check-marks, shot at three depths ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  const railText = [];
  for (const y of [0, 3000, 6000, 9400]) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(1400);
    const t = await page.evaluate(() => {
      const rail = [...document.querySelectorAll("nav,aside")].find(
        (n) => getComputedStyle(n).position === "fixed" && /arrival/.test(n.textContent ?? ""),
      );
      if (!rail) return null;
      const b = rail.getBoundingClientRect();
      return {
        text: rail.innerText.replace(/\n+/g, " "),
        marks: (rail.textContent.match(/[✓✔·•∙◦]/g) ?? []).length,
        box: [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)],
        current: rail.querySelector("[aria-current]")?.textContent.replace(/\n/g, " ") ?? null,
      };
    });
    railText.push({ y, ...t });
    const p = `${OUT}/rail-y${y}.png`;
    if (t)
      await page.screenshot({
        path: p,
        clip: { x: t.box[0] - 4, y: Math.max(0, t.box[1] - 8), width: t.box[2] + 40, height: t.box[3] + 16 },
      });
  }
  note("delight.railDepths", railText);
  await ctx.close();
}

writeFileSync(`${OUT}/delight-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
console.log("done");
