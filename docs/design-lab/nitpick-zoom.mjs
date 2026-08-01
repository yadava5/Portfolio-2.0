// NITPICK — zoom into the hero apostrophe and header glyphs.
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
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
const page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

// the hero apostrophe, big
await page.screenshot({ path: `${OUT}/zoom-hero-apostrophe.png`, clip: { x: 240, y: 300, width: 560, height: 220 } });
// the strapline curly apostrophe for comparison
await page.screenshot({ path: `${OUT}/zoom-strapline-apostrophe.png`, clip: { x: 240, y: 100, width: 620, height: 40 } });
// header left cluster: avatar, name, pipe, mystery circle
await page.screenshot({ path: `${OUT}/zoom-header-left.png`, clip: { x: 230, y: 0, width: 420, height: 70 } });
// header right cluster
await page.screenshot({ path: `${OUT}/zoom-header-right.png`, clip: { x: 1020, y: 0, width: 420, height: 70 } });

// exact codepoints of hero + strapline
const cp = await page.evaluate(() => {
  const dump = (s) => [...s].map((c) => ({ c, u: "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0") }));
  const heroEl = document.querySelector('[aria-label*="all real"]') ?? document.querySelector("h1");
  const hero = heroEl ? heroEl.innerText.replace(/\s+/g, " ").trim() : null;
  const strap = [...document.querySelectorAll("p")].map((p) => p.innerText).find((t) => t && t.includes("working paper"));
  return {
    heroText: hero,
    heroCodepoints: hero ? dump(hero).filter((x) => /['’‘`´]/.test(x.c)) : null,
    heroAria: heroEl?.getAttribute("aria-label") ?? null,
    heroTag: heroEl?.tagName,
    strapText: strap ?? null,
    strapCodepoints: strap ? dump(strap).filter((x) => /['’‘`´]/.test(x.c)) : null,
  };
});
note("codepoints", cp);

// full-document apostrophe census
const census = await page.evaluate(() => {
  const t = document.body.innerText;
  const straight = t.match(/\S*'\S*/g) ?? [];
  const curly = t.match(/\S*’\S*/g) ?? [];
  return { straightCount: straight.length, straight: [...new Set(straight)].slice(0, 40), curlyCount: curly.length, curly: [...new Set(curly)].slice(0, 40) };
});
note("apostropheCensus.home", census);

// quote census too
const quotes = await page.evaluate(() => {
  const t = document.body.innerText;
  return { straightDouble: (t.match(/"/g) ?? []).length, curlyOpen: (t.match(/“/g) ?? []).length, curlyClose: (t.match(/”/g) ?? []).length };
});
note("quoteCensus.home", quotes);

// what IS that circle next to the name?
const circ = await page.evaluate(() => {
  const header = document.querySelector("header");
  if (!header) return null;
  return [...header.querySelectorAll("svg,span,div")]
    .filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.width < 40 && r.height < 40 && r.left > 330 && r.left < 420;
    })
    .map((e) => ({
      tag: e.tagName,
      cls: (e.className.baseVal ?? e.className ?? "").toString().slice(0, 90),
      aria: e.getAttribute("aria-label"),
      title: e.querySelector("title")?.textContent ?? null,
      role: e.getAttribute("role"),
      hidden: e.getAttribute("aria-hidden"),
      text: (e.innerText ?? "").trim().slice(0, 40),
      rect: (({ x, y, width, height }) => ({ x: Math.round(x), y: Math.round(y), w: Math.round(width), h: Math.round(height) }))(e.getBoundingClientRect()),
    }));
});
note("headerCircleCandidates", circ);

writeFileSync(`${OUT}/zoom-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
