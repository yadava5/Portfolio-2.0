// NITPICK — click everything. Where does it land? Does Back behave? Do anchors clear the header?
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

// ---- 1. ANCHOR LANDINGS: does the target headline clear the sticky header? ----
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(2200);

const headerH = await page.evaluate(() => {
  const h = document.querySelector("header");
  return h ? Math.round(h.getBoundingClientRect().height) : 0;
});
note("headerHeight", headerH);

for (const hash of ["#who", "#path", "#automl", "#work", "#values", "#gate"]) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.click(`a[href="${hash}"]`, { force: true }).catch(() => {});
  await page.waitForTimeout(1600);
  const land = await page.evaluate(
    ({ hash, headerH }) => {
      const sec = document.querySelector(hash);
      if (!sec) return { error: "no section" };
      const r = sec.getBoundingClientRect();
      // find the first heading inside
      const head = sec.querySelector("h1,h2,h3");
      const hr = head?.getBoundingClientRect();
      return {
        sectionTop: Math.round(r.top),
        headingTop: hr ? Math.round(hr.top) : null,
        headingText: head?.innerText.replace(/\s+/g, " ").slice(0, 50) ?? null,
        clearsHeader: hr ? hr.top >= headerH : null,
        clippedBy: hr ? Math.round(headerH - hr.top) : null,
        scrollY: Math.round(window.scrollY),
        urlHash: location.hash,
      };
    },
    { hash, headerH }
  );
  note(`anchor.${hash}`, land);
  await page.screenshot({ path: `${OUT}/anchor-${hash.slice(1)}.png` });
}

// ---- 2. CASE-FILE ROUND TRIP: click card -> land -> Back -> where am I? ----
async function roundTrip(label, clickSel) {
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  // scroll the target into view first (like a human)
  const el = page.locator(clickSel).first();
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(900);
  const beforeY = await page.evaluate(() => Math.round(window.scrollY));
  const t0 = Date.now();
  await Promise.all([page.waitForLoadState("networkidle"), el.click({ force: true })]).catch(() => {});
  await page.waitForTimeout(1800);
  const arrived = {
    ms: Date.now() - t0,
    url: page.url(),
    scrollY: await page.evaluate(() => Math.round(window.scrollY)),
    title: await page.title(),
    h1: await page.evaluate(() => document.querySelector("h1")?.innerText.replace(/\s+/g, " ").slice(0, 60) ?? null),
  };
  await page.screenshot({ path: `${OUT}/nav-${label}-arrived.png` });
  await page.goBack({ waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(2000);
  const back = {
    url: page.url(),
    scrollY: await page.evaluate(() => Math.round(window.scrollY)),
    expectedY: beforeY,
    restoredWithin: Math.abs((await page.evaluate(() => Math.round(window.scrollY))) - beforeY),
  };
  await page.screenshot({ path: `${OUT}/nav-${label}-back.png` });
  note(`roundTrip.${label}`, { beforeY, arrived, back });
}

await roundTrip("card-applied", 'a[href*="/projects/jobtracker/"]:not([href*="#"])');
await roundTrip("card-glyph", 'a[href*="/projects/fast-mnist-nn/"]:not([href*="#"])');
await roundTrip("evidence", 'a[href*="/evidence/"]');

// ---- 3. DEEP-LINK RECEIPT: does a #v- anchor land on the right row, highlighted? ----
await page.goto(BASE + "/projects/jobtracker/#v-jobtracker-5", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const receipt = await page.evaluate(() => {
  const t = document.querySelector("#v-jobtracker-5");
  if (!t) return { error: "target missing" };
  const r = t.getBoundingClientRect();
  const cs = getComputedStyle(t);
  return {
    top: Math.round(r.top),
    inViewport: r.top >= 0 && r.top < window.innerHeight,
    clearsHeader: r.top >= (document.querySelector("header")?.getBoundingClientRect().height ?? 0),
    text: t.innerText.replace(/\s+/g, " ").slice(0, 90),
    outline: cs.outlineWidth + " " + cs.outlineColor,
    bg: cs.backgroundColor,
    scrollMarginTop: cs.scrollMarginTop,
  };
});
note("deepLink.receipt", receipt);
await page.screenshot({ path: `${OUT}/deeplink-receipt.png` });

// ---- 4. EXTERNAL LINK AUDIT: do all _blank have rel, and do they resolve? ----
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const ext = await page.evaluate(() =>
  [...document.querySelectorAll('a[href^="http"]')]
    .filter((a) => !a.href.includes("yadava5.github.io"))
    .map((a) => ({
      text: a.innerText.trim().replace(/\s+/g, " ").slice(0, 50),
      href: a.href,
      target: a.getAttribute("target"),
      rel: a.getAttribute("rel"),
      marked: /↗/.test(a.innerText),
    }))
);
note("externalLinks", ext);

// live-check each external URL
const seen = new Set();
for (const e of ext) {
  if (seen.has(e.href)) continue;
  seen.add(e.href);
  try {
    const r = await page.request.get(e.href, { timeout: 20000, maxRedirects: 5 });
    note(`extStatus`, `${r.status()} ${e.href}`);
  } catch (err) {
    note(`extStatus`, `ERR ${String(err).slice(0, 70)} ${e.href}`);
  }
}

// ---- 5. 404 page ----
await page.goto(BASE + "/does-not-exist-nitpick/", { waitUntil: "domcontentloaded" }).catch(() => {});
await page.waitForTimeout(1500);
note("404", {
  url: page.url(),
  title: await page.title(),
  bodyStart: (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ").slice(0, 220),
});
await page.screenshot({ path: `${OUT}/page-404.png`, fullPage: false });

writeFileSync(`${OUT}/nav-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
