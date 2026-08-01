// NITPICK — hover everything. Is the feedback visible? Is it fast? Measure the delta.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const OUT = "docs/design-lab/shots-nitpick";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.NITPICK_BASE ?? "https://yadava5.github.io/Portfolio-2.0";
const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`[${k}] ${typeof v === "string" ? v : JSON.stringify(v)}`);
};

async function raw(buf) {
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  return { data, info };
}
async function diff(aBuf, bBuf) {
  const a = await raw(aBuf),
    b = await raw(bBuf);
  if (a.data.length !== b.data.length) return { changedPct: -1, maxDelta: -1 };
  const ch = a.info.channels;
  let changed = 0,
    max = 0,
    px = 0;
  for (let i = 0; i < a.data.length; i += ch) {
    const d =
      Math.abs(a.data[i] - b.data[i]) +
      Math.abs(a.data[i + 1] - b.data[i + 1]) +
      Math.abs(a.data[i + 2] - b.data[i + 2]);
    if (d > 8) changed++;
    if (d > max) max = d;
    px++;
  }
  return { changedPct: +((changed / px) * 100).toFixed(2), maxDelta: max };
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

// Which targets to hover: header nav, rail, hero links, case-file cards, evidence links
const targets = await page.evaluate(() => {
  const pick = [];
  const add = (sel, name, idx = 0) => {
    const els = [...document.querySelectorAll(sel)];
    const el = els[idx];
    if (!el) return;
    const r = el.getBoundingClientRect();
    pick.push({ name, x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + window.scrollY) });
  };
  add('header a[href*="#work"]', "header-nav-the-work");
  add('header a[href*="resume"]', "header-resume-button");
  add('a[href="#automl"]', "rail-04-automl", 0);
  add('a[href="#footnote-1"]', "hero-footnote-marker");
  return pick;
});
note("hoverTargets.header", targets);

async function hoverProbe(name, x, y, clip) {
  await page.mouse.move(5, 400);
  await page.waitForTimeout(400);
  const before = await page.screenshot({ clip });
  await page.mouse.move(x, y);
  const t0 = Date.now();
  await page.waitForTimeout(60);
  const at60 = await page.screenshot({ clip });
  await page.waitForTimeout(500);
  const settled = await page.screenshot({ clip });
  const d60 = await diff(before, at60);
  const dSettled = await diff(before, settled);
  note(`hover.${name}`, { at60ms: d60, settled: dSettled });
  await page.screenshot({ path: `${OUT}/hover-${name}-off.png`, clip });
  await page.mouse.move(x, y);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/hover-${name}-on.png`, clip });
  return dSettled;
}

for (const t of targets) {
  const clip = {
    x: Math.max(0, t.x - t.w / 2 - 14),
    y: Math.max(0, t.y - t.h / 2 - 14),
    width: Math.min(1440, t.w + 28),
    height: Math.min(900, t.h + 28),
  };
  await hoverProbe(t.name, t.x, t.y, clip);
}

// hover the case-file cards down the page
const cards = await page.evaluate(() => {
  const out = [];
  for (const a of document.querySelectorAll('a[href*="/projects/"]')) {
    const r = a.getBoundingClientRect();
    const top = Math.round(r.top + window.scrollY);
    out.push({ text: a.innerText.trim().replace(/\s+/g, " ").slice(0, 40), top, h: Math.round(r.height), w: Math.round(r.width) });
  }
  return out;
});
note("projectLinks", cards);

// scroll to the work section, hover a card headline
for (const [i, c] of cards.filter((c) => c.h > 20 && c.top > 4000).slice(0, 4).entries()) {
  const y = Math.max(0, c.top - 300);
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
  await page.waitForTimeout(1200);
  const box = await page.evaluate((top) => {
    const a = [...document.querySelectorAll('a[href*="/projects/"]')].find(
      (e) => Math.abs(e.getBoundingClientRect().top + window.scrollY - top) < 2
    );
    if (!a) return null;
    const r = a.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), w: Math.round(r.width), h: Math.round(r.height) };
  }, c.top);
  if (!box || box.y < 0 || box.y > 900) continue;
  const clip = {
    x: Math.max(0, box.x - box.w / 2 - 20),
    y: Math.max(0, box.y - box.h / 2 - 20),
    width: Math.min(1440 - Math.max(0, box.x - box.w / 2 - 20), box.w + 40),
    height: Math.min(900 - Math.max(0, box.y - box.h / 2 - 20), box.h + 40),
  };
  await hoverProbe(`card-${i}-${c.text.replace(/[^a-z0-9]+/gi, "-").slice(0, 24)}`, box.x, box.y, clip);
}

// CSS transition durations actually declared on interactive things
const durations = await page.evaluate(() => {
  const m = new Map();
  for (const el of document.querySelectorAll("a,button")) {
    const cs = getComputedStyle(el);
    const key = `${cs.transitionProperty} | ${cs.transitionDuration} | ${cs.transitionTimingFunction}`;
    m.set(key, (m.get(key) ?? 0) + 1);
  }
  return [...m.entries()].map(([k, v]) => ({ spec: k.slice(0, 150), count: v })).sort((a, b) => b.count - a.count);
});
note("transitionSpecs", durations);

writeFileSync(`${OUT}/hover-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
