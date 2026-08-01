// NITPICK 3 — the affordance stacks, hit-tested rather than argued.
// FIX6 grew six pairs on `/` into a 15px overlap and reasoned that the
// band belongs to the LOWER link and the upper link's glyphs are safe.
// A reader does not read the reasoning; a reader taps. So: for every
// affordance under 24px of visible line, sample elementFromPoint across
// its OWN glyph run and report which anchor the browser hands the tap to.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-nitpick3";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3601";
const notes = [];
const note = (k, v) => { notes.push({ k, v }); console.log(`\n[${k}]\n${typeof v === "string" ? v : JSON.stringify(v, null, 1)}`); };

const ROUTES = ["/", "/evidence/", "/projects/fast-mnist-nn/", "/projects/taskflow-calendar/", "/no-such-page/"];
const browser = await chromium.launch();

for (const vw of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: 844 } });
  const page = await ctx.newPage();
  const rep = [];
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    const r = await page.evaluate(() => {
      const anchors = [...document.querySelectorAll("a[href],button")].filter(
        (e) => e.getBoundingClientRect().width
      );
      const wrong = [];
      const checked = [];
      for (const a of anchors) {
        // scroll it into the middle so elementFromPoint is meaningful
        a.scrollIntoView({ block: "center" });
        const rects = [...a.getClientRects()];
        if (!rects.length) continue;
        // sample the GLYPH run: use Range over the text, which excludes padding
        const range = document.createRange();
        range.selectNodeContents(a);
        const glyphRects = [...range.getClientRects()].filter((r) => r.width > 2 && r.height > 2);
        if (!glyphRects.length) continue;
        let bad = 0, n = 0;
        for (const g of glyphRects) {
          for (const fx of [0.15, 0.5, 0.85]) {
            for (const fy of [0.25, 0.5, 0.75]) {
              const x = g.left + g.width * fx;
              const y = g.top + g.height * fy;
              if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
              n++;
              const hit = document.elementFromPoint(x, y);
              const owner = hit?.closest("a[href],button");
              if (owner && owner !== a) {
                bad++;
                wrong.push({
                  wanted: (a.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40),
                  got: (owner.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40),
                  at: [Math.round(x), Math.round(y)],
                });
              }
            }
          }
        }
        checked.push({ t: (a.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 34), n, bad });
      }
      return { nAnchors: anchors.length, nChecked: checked.length, wrong, nWrong: wrong.length };
    });
    rep.push({ route, nAnchors: r.nAnchors, nChecked: r.nChecked, nWrong: r.nWrong, wrong: r.wrong.slice(0, 10) });
  }
  note(`hitTest@${vw}`, rep);
  await ctx.close();
}

writeFileSync(`${OUT}/hit-notes.json`, JSON.stringify(notes, null, 1));
await browser.close();
