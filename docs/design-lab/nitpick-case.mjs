// NITPICK — open a case file top to bottom. Verify the "t1" markers and duplicated decks.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "docs/design-lab/shots-nitpick";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.NITPICK_BASE ?? "https://yadava5.github.io/Portfolio-2.0";
const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`[${k}] ${typeof v === "string" ? v : JSON.stringify(v)}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

// ---- verify the t1/t2 markers ----
await page.goto(BASE + "/projects/taskflow-calendar/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

const markers = await page.evaluate(() => {
  const out = [];
  // find any element whose own text matches ^t\d+$
  for (const el of document.querySelectorAll("*")) {
    const own = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join("")
      .trim();
    if (/^t\d+$/.test(own)) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      out.push({
        text: own,
        tag: el.tagName,
        cls: (el.className.baseVal ?? el.className ?? "").toString().slice(0, 60),
        fontSize: cs.fontSize,
        verticalAlign: cs.verticalAlign,
        position: cs.position,
        top: Math.round(r.top + window.scrollY),
        left: Math.round(r.left),
        w: Math.round(r.width),
        parentTail: el.parentElement?.innerText.replace(/\s+/g, " ").slice(-70) ?? null,
        isLink: el.closest("a") ? el.closest("a").getAttribute("href") : null,
      });
    }
  }
  return out;
});
note("tMarkers.cadence", markers);

if (markers.length) {
  const m = markers[0];
  await page.evaluate((y) => window.scrollTo(0, y - 300), m.top);
  await page.waitForTimeout(1200);
  const box = await page.evaluate((t) => {
    const el = [...document.querySelectorAll("*")].find((e) => {
      const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
      return own === t;
    });
    if (!el) return null;
    const p = el.closest("p") ?? el.parentElement;
    const r = p.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  }, m.text);
  if (box && box.y >= 0)
    await page.screenshot({
      path: `${OUT}/zoom-tmarker-cadence.png`,
      clip: { x: Math.max(0, box.x - 10), y: Math.max(0, box.y - 10), width: Math.min(1000, box.w + 20), height: Math.min(240, box.h + 20) },
    });
}

// ---- verify duplicated deck text ----
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const dupes = await page.evaluate(() => {
  const out = [];
  for (const p of document.querySelectorAll("p,h1,h2,h3")) {
    const t = p.innerText.replace(/\s+/g, " ").trim();
    if (t.length < 20) continue;
    const half = t.slice(0, Math.floor(t.length / 2)).trim();
    if (half.length > 12 && t.startsWith(half) && t.slice(half.length).trim() === half) {
      const cs = getComputedStyle(p);
      out.push({
        tag: p.tagName,
        cls: (p.className || "").toString().slice(0, 70),
        text: t.slice(0, 120),
        childCount: p.children.length,
        childHTML: [...p.children].map((c) => ({
          tag: c.tagName,
          cls: (c.className.baseVal ?? c.className ?? "").toString().slice(0, 50),
          ariaHidden: c.getAttribute("aria-hidden"),
          clip: getComputedStyle(c).clipPath,
          pos: getComputedStyle(c).position,
          opacity: getComputedStyle(c).opacity,
          visibility: getComputedStyle(c).visibility,
          w: Math.round(c.getBoundingClientRect().width),
          h: Math.round(c.getBoundingClientRect().height),
        })),
      });
    }
  }
  return out;
});
note("duplicatedDecks", dupes);

// what does a user actually COPY?
const copied = await page.evaluate(() => {
  const p = [...document.querySelectorAll("p")].find((e) => e.innerText.includes("No frameworks"));
  if (!p) return null;
  const sel = window.getSelection();
  const r = document.createRange();
  r.selectNodeContents(p);
  sel.removeAllRanges();
  sel.addRange(r);
  const s = sel.toString().replace(/\s+/g, " ").trim();
  sel.removeAllRanges();
  return { selectionText: s, innerText: p.innerText.replace(/\s+/g, " ").trim(), textContent: p.textContent.replace(/\s+/g, " ").trim() };
});
note("copyPaste.glyphDeck", copied);

// ---- full case-file walk, jobtracker ----
for (const [name, path] of [
  ["jobtracker", "/projects/jobtracker/"],
  ["automl", "/projects/automl/"],
]) {
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  note(`case.${name}.height`, `${h}px = ${(h / 900).toFixed(2)} viewports`);
  const frames = 14;
  for (let i = 0; i < frames; i++) {
    const y = Math.round(((h - 900) * i) / (frames - 1));
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/case-${name}-${String(i).padStart(2, "0")}-y${y}.png` });
  }
}

// ---- evidence page ----
await page.goto(BASE + "/evidence/", { waitUntil: "networkidle" });
await page.waitForTimeout(2200);
const eh = await page.evaluate(() => document.documentElement.scrollHeight);
note("evidence.height", `${eh}px = ${(eh / 900).toFixed(2)} viewports`);
for (let i = 0; i < 10; i++) {
  const y = Math.round(((eh - 900) * i) / 9);
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
  await page.waitForTimeout(750);
  await page.screenshot({ path: `${OUT}/evidence-${String(i).padStart(2, "0")}-y${y}.png` });
}

writeFileSync(`${OUT}/case-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
