// NITPICK 3 — the focus-ink census, per element, per ground. FIX6 says
// "three inks for one role on one ground — now one". The tab walk found
// five distinct outline colours on `/`. Which elements, and on what
// ground?
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-nitpick3";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3601";
const notes = [];
const note = (k, v) => { notes.push({ k, v }); console.log(`\n[${k}]\n${typeof v === "string" ? v : JSON.stringify(v, null, 1)}`); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

for (const route of ["/", "/evidence/", "/projects/automl/", "/no-such-page/"]) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  const v = await page.evaluate(() => {
    const rows = [];
    for (const el of document.querySelectorAll("a[href],button,[tabindex]:not([tabindex='-1'])")) {
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) continue;
      el.focus();
      const cs = getComputedStyle(el);
      let ground = "transparent", n = el;
      while (n && ground === "transparent") {
        const c = getComputedStyle(n).backgroundColor;
        if (c && c !== "rgba(0, 0, 0, 0)") ground = c;
        n = n.parentElement;
      }
      const chapter = el.closest("[data-chapter]")?.getAttribute("data-chapter") ?? null;
      rows.push({
        t: (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().replace(/\s+/g, " ").slice(0, 42),
        ring: `${cs.outlineWidth} ${cs.outlineStyle} ${cs.outlineColor}`,
        ground,
        chapter,
        inHeader: !!el.closest("header,.site-header"),
        inFooter: !!el.closest("footer"),
      });
    }
    const by = {};
    for (const r of rows) (by[r.ring] ??= []).push(r);
    return Object.fromEntries(
      Object.entries(by).map(([k, v]) => [k, { n: v.length, sample: v.slice(0, 12).map((x) => `${x.t} | ch${x.chapter} | hdr:${x.inHeader} | ftr:${x.inFooter} | bg ${x.ground}`) }])
    );
  });
  note(`inks ${route}`, v);
}

writeFileSync(`${OUT}/inks-notes.json`, JSON.stringify(notes, null, 1));
await browser.close();
