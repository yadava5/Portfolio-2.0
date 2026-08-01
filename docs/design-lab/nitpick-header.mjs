// NITPICK — is the sticky header transparent on case files? Does content smear through it?
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

async function headerState(label, url, scrollY) {
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  if (scrollY) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scrollY);
    await page.waitForTimeout(1200);
  }
  const st = await page.evaluate(() => {
    const h = document.querySelector("header");
    if (!h) return { error: "no header" };
    const cs = getComputedStyle(h);
    const r = h.getBoundingClientRect();
    // what's directly behind the header at a few x positions?
    const behind = [];
    for (const x of [500, 700, 1000, 1200]) {
      const stack = document.elementsFromPoint(x, 30);
      behind.push({
        x,
        stack: stack.slice(0, 5).map((e) => `${e.tagName}.${(e.className.baseVal ?? e.className ?? "").toString().split(" ")[0].slice(0, 24)}`),
      });
    }
    // the inner bar element that may carry the fill
    const kids = [...h.children].map((c) => {
      const ks = getComputedStyle(c);
      return {
        tag: c.tagName,
        cls: (c.className.baseVal ?? c.className ?? "").toString().slice(0, 80),
        bg: ks.backgroundColor,
        backdrop: ks.backdropFilter,
        h: Math.round(c.getBoundingClientRect().height),
      };
    });
    return {
      position: cs.position,
      zIndex: cs.zIndex,
      backgroundColor: cs.backgroundColor,
      backdropFilter: cs.backdropFilter,
      height: Math.round(r.height),
      opacity: cs.opacity,
      children: kids,
      behind,
    };
  });
  note(`header.${label}`, st);
  await page.screenshot({ path: `${OUT}/header-${label}.png`, clip: { x: 0, y: 0, width: 1440, height: 130 } });
  return st;
}

await headerState("home-top", "/", 0);
await headerState("home-scrolled", "/", 3000);
await headerState("case-top", "/projects/jobtracker/", 0);
await headerState("case-scrolled", "/projects/jobtracker/", 3000);
await headerState("case-deeplink", "/projects/jobtracker/#v-jobtracker-5", 0);
await headerState("evidence-scrolled", "/evidence/", 2000);
await headerState("automl-scrolled", "/projects/automl/", 3000);

// Does the deep-linked receipt get ANY visual highlight, and does it fade?
await page.goto(BASE + "/projects/jobtracker/#v-jobtracker-5", { waitUntil: "networkidle" });
for (const t of [300, 1200, 3000]) {
  await page.waitForTimeout(t === 300 ? 300 : t === 1200 ? 900 : 1800);
  const hl = await page.evaluate(() => {
    const el = document.querySelector("#v-jobtracker-5");
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      bg: cs.backgroundColor,
      outline: cs.outline,
      boxShadow: cs.boxShadow.slice(0, 60),
      borderLeft: cs.borderLeftWidth + " " + cs.borderLeftColor,
      target: el.matches(":target"),
      top: Math.round(el.getBoundingClientRect().top),
    };
  });
  note(`receiptHighlight.t${t}`, hl);
}
await page.screenshot({ path: `${OUT}/receipt-landing-settled.png` });

writeFileSync(`${OUT}/header-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
