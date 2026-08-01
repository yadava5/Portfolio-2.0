// NITPICK ROUND 2 — the 404, which fix round 3 rebuilt and fix round 5's
// "every route" overflow sweep never contained. Sweep it like a route.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "docs/design-lab/shots-nitpick2";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3600";
const notes = [];
const note = (k, v) => {
  notes.push({ k, v });
  console.log(`[${k}] ${typeof v === "string" ? v : JSON.stringify(v)}`);
};

const browser = await chromium.launch();
const WIDTHS = [320, 340, 360, 375, 390, 414, 430, 480, 540, 640, 768, 834, 1024, 1280, 1440, 2560];
const table = {};

for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/no-such-page/", { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(900);
  const r = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const over = document.documentElement.scrollWidth - vw;
    const offenders = [];
    if (over > 0) {
      for (const el of document.querySelectorAll("*")) {
        const b = el.getBoundingClientRect();
        if (b.width && b.right > vw + 0.5) {
          const cs = getComputedStyle(el);
          offenders.push({
            tag: el.tagName,
            cls: String(el.className?.baseVal ?? el.className ?? "").slice(0, 70),
            left: Math.round(b.left),
            right: Math.round(b.right),
            w: Math.round(b.width),
            scrollW: el.scrollWidth,
            clientW: el.clientWidth,
            wrap: cs.overflowWrap,
            wb: cs.wordBreak,
            minW: cs.minWidth,
            ws: cs.whiteSpace,
            text: (el.textContent ?? "").trim().slice(0, 60),
          });
        }
      }
    }
    // the dot-leader index: does any row wrap or clip?
    const idx = [...document.querySelectorAll("li")].map((li) => {
      const b = li.getBoundingClientRect();
      return {
        t: li.textContent.trim().slice(0, 40),
        h: Math.round(b.height),
        w: Math.round(b.width),
        right: Math.round(b.right),
      };
    });
    return { over, offenders: offenders.slice(0, 8), idxRows: idx.length, idx: idx.slice(0, 12) };
  });
  table[width] = r.over;
  note(`404@${width}`, { over: r.over, offenders: r.offenders, idxSample: r.idx.slice(0, 3) });
  if (r.over > 0 || [320, 390, 768].includes(width)) {
    await page.screenshot({ path: `${OUT}/404-over-${width}.png`, fullPage: true });
  }
  await ctx.close();
}
note("404.overflow.table", table);

// the mail chip on the 404 / masthead — does it have an accessible name?
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const r = await page.evaluate(() => {
    const out = [];
    for (const a of document.querySelectorAll("a[href],button")) {
      const b = a.getBoundingClientRect();
      if (!b.width) continue;
      const name =
        a.getAttribute("aria-label") ??
        a.getAttribute("title") ??
        (a.textContent ?? "").trim() ??
        "";
      if (!name.trim()) {
        out.push({
          tag: a.tagName,
          href: a.getAttribute("href"),
          html: a.innerHTML.slice(0, 140),
          box: [Math.round(b.width), Math.round(b.height)],
        });
      }
    }
    return out;
  });
  note("unnamedControls@390.home", r);
  await ctx.close();
}
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/no-such-page/", { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(900);
  const r = await page.evaluate(() => {
    const out = [];
    for (const a of document.querySelectorAll("a[href],button")) {
      const b = a.getBoundingClientRect();
      if (!b.width) continue;
      const name =
        a.getAttribute("aria-label") ?? a.getAttribute("title") ?? (a.textContent ?? "").trim();
      if (!String(name).trim())
        out.push({ tag: a.tagName, href: a.getAttribute("href"), html: a.innerHTML.slice(0, 160) });
    }
    return out;
  });
  note("unnamedControls@390.404", r);
  await ctx.close();
}

writeFileSync(`${OUT}/notfound-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
console.log("done");
