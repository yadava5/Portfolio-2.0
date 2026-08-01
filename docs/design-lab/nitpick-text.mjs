// NITPICK — typography forensics: widows, orphans, glyph inconsistency, size census.
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

const PAGES = [
  ["home", "/"],
  ["evidence", "/evidence/"],
  ["automl", "/projects/automl/"],
  ["jobtracker", "/projects/jobtracker/"],
  ["glyph", "/projects/fast-mnist-nn/"],
  ["cadence", "/projects/taskflow-calendar/"],
  ["policybot", "/projects/policybot/"],
  ["master-inventory", "/projects/master-inventory/"],
  ["visual-assist", "/projects/visual-assist/"],
];

const browser = await chromium.launch();

for (const width of [1440, 390]) {
  const ctx = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  for (const [name, path] of PAGES) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1600);
    // force everything visible (entrance animations can hide text)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);

    // WIDOW HUNT: for each block of text >= 18px, measure last-line word count/width
    const widows = await page.evaluate(() => {
      const out = [];
      const blocks = document.querySelectorAll("h1,h2,h3,h4,p,li,blockquote,figcaption");
      for (const el of blocks) {
        const cs = getComputedStyle(el);
        const fs = parseFloat(cs.fontSize);
        const text = el.innerText.trim();
        if (!text || text.length < 12) continue;
        if (el.querySelector("h1,h2,h3,h4,p,li")) continue; // leaf blocks only
        // measure line boxes via Range over each text node
        const r = document.createRange();
        r.selectNodeContents(el);
        const rects = [...r.getClientRects()].filter((x) => x.width > 1 && x.height > 1);
        if (rects.length < 2) continue;
        // group rects into lines by top
        const lines = [];
        for (const rc of rects) {
          const l = lines.find((L) => Math.abs(L.top - rc.top) < Math.max(4, fs * 0.35));
          if (l) {
            l.left = Math.min(l.left, rc.left);
            l.right = Math.max(l.right, rc.right);
          } else lines.push({ top: rc.top, left: rc.left, right: rc.right });
        }
        if (lines.length < 2) continue;
        const widest = Math.max(...lines.map((L) => L.right - L.left));
        const last = lines[lines.length - 1];
        const lastW = last.right - last.left;
        const ratio = lastW / widest;
        const words = text.split(/\s+/);
        // approximate last-line word count by proportion
        if (ratio < 0.3 && fs >= 17) {
          out.push({
            tag: el.tagName,
            fontSize: cs.fontSize,
            lines: lines.length,
            lastLinePct: +(ratio * 100).toFixed(1),
            lastWord: words[words.length - 1],
            text: text.replace(/\s+/g, " ").slice(0, 110),
          });
        }
      }
      return out;
    });
    if (widows.length) note(`${width}.${name}.widows`, widows);

    // GLYPH CONSISTENCY census
    const glyphs = await page.evaluate(() => {
      const t = document.body.innerText;
      const uniq = (re) => [...new Set(t.match(re) ?? [])];
      return {
        straightApos: uniq(/\S*'\S*/g),
        curlyAposCount: (t.match(/’/g) ?? []).length,
        straightQuote: uniq(/"[^"]{0,40}"/g),
        multiplyX_letter: uniq(/\b\d[\d.]*x\b/g),
        multiplyX_sign: uniq(/\b\d[\d.]*×/g),
        arrowsRight: uniq(/[→⟶➝➞]/g),
        arrowsNE: uniq(/[↗↖⟋]/g),
        ellipsisChar: (t.match(/…/g) ?? []).length,
        ellipsisDots: (t.match(/\.\.\./g) ?? []).length,
        emDash: (t.match(/—/g) ?? []).length,
        enDash: (t.match(/–/g) ?? []).length,
        hyphenBetweenSpaces: (t.match(/ - /g) ?? []).length,
      };
    });
    note(`${width}.${name}.glyphs`, glyphs);

    if (width === 1440) {
      // FONT SIZE CENSUS — how many distinct sizes are in play?
      const sizes = await page.evaluate(() => {
        const m = new Map();
        for (const el of document.querySelectorAll("body *")) {
          if (!el.innerText || !el.innerText.trim()) continue;
          const hasOwnText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
          if (!hasOwnText) continue;
          const cs = getComputedStyle(el);
          const key = `${cs.fontSize}|${cs.fontFamily.split(",")[0].replace(/"/g, "")}|${cs.fontWeight}`;
          m.set(key, (m.get(key) ?? 0) + 1);
        }
        return [...m.entries()]
          .map(([k, v]) => {
            const [size, fam, w] = k.split("|");
            return { size, fam, w, count: v };
          })
          .sort((a, b) => parseFloat(b.size) - parseFloat(a.size));
      });
      note(`${name}.fontCensus`, sizes);
    }
  }
  await ctx.close();
}

writeFileSync(`${OUT}/text-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
