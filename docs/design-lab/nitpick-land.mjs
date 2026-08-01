// NITPICK — land cold on the live site. First screen, first impression, first 10s.
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
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
const errs = [];
page.on("console", (m) => {
  if (m.type() === "error") errs.push(m.text());
});
page.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));
const failed = [];
page.on("requestfailed", (r) => failed.push(`${r.failure()?.errorText} ${r.url()}`));
const resp = [];
page.on("response", (r) => {
  if (r.status() >= 400) resp.push(`${r.status()} ${r.url()}`);
});

const t0 = Date.now();
await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
note("domcontentloaded.ms", Date.now() - t0);

// screenshot at intervals to capture the entrance choreography
for (const ms of [0, 250, 500, 1000, 2000, 3500]) {
  const wait = ms === 0 ? 0 : 250;
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${OUT}/land-1440-t${String(ms).padStart(4, "0")}.png` });
  if (ms === 0) await page.waitForTimeout(250);
  else if (ms < 3500) await page.waitForTimeout(ms === 250 ? 250 : ms === 500 ? 500 : ms === 1000 ? 1000 : 1500);
}

await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/land-1440-settled.png` });

note("title", await page.title());
note("url", page.url());

const meta = await page.evaluate(() => {
  const g = (s) => document.querySelector(s)?.getAttribute("content") ?? null;
  return {
    description: g('meta[name="description"]'),
    ogTitle: g('meta[property="og:title"]'),
    ogDesc: g('meta[property="og:description"]'),
    ogImage: g('meta[property="og:image"]'),
    twitterCard: g('meta[name="twitter:card"]'),
    lang: document.documentElement.lang,
    themeColor: g('meta[name="theme-color"]'),
  };
});
note("meta", meta);

const firstScreen = await page.evaluate(() => {
  const out = [];
  const walk = (el) => {
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const r = n.parentElement.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0 && r.width > 0) {
          const cs = getComputedStyle(n.parentElement);
          out.push({
            text: n.textContent.trim().slice(0, 120),
            tag: n.parentElement.tagName,
            cls: (n.parentElement.className || "").toString().slice(0, 60),
            fontSize: cs.fontSize,
            fontFamily: cs.fontFamily.split(",")[0],
            weight: cs.fontWeight,
            ls: cs.letterSpacing,
            lh: cs.lineHeight,
            color: cs.color,
            opacity: cs.opacity,
            top: Math.round(r.top),
            left: Math.round(r.left),
            w: Math.round(r.width),
          });
        }
      } else if (n.nodeType === 1) walk(n);
    }
  };
  walk(document.body);
  return out.sort((a, b) => a.top - b.top);
});
note("firstScreen.textNodes", firstScreen);

const doc = await page.evaluate(() => ({
  scrollHeight: document.documentElement.scrollHeight,
  viewports: +(document.documentElement.scrollHeight / window.innerHeight).toFixed(2),
  sections: [...document.querySelectorAll("section,[data-section],[id]")].slice(0, 60).map((s) => ({
    tag: s.tagName,
    id: s.id || null,
    ds: s.dataset.section ?? null,
    top: Math.round(s.getBoundingClientRect().top + window.scrollY),
    h: Math.round(s.getBoundingClientRect().height),
  })),
}));
note("doc", doc);

const links = await page.evaluate(() =>
  [...document.querySelectorAll("a[href]")].map((a) => ({
    text: (a.innerText || a.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 70),
    href: a.getAttribute("href"),
    target: a.getAttribute("target"),
    rel: a.getAttribute("rel"),
    top: Math.round(a.getBoundingClientRect().top + window.scrollY),
  }))
);
note("links.count", links.length);
note("links", links);

note("consoleErrors", errs);
note("requestFailed", failed);
note("http4xx5xx", resp);

writeFileSync(`${OUT}/land-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
