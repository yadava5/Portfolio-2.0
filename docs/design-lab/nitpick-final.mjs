// NITPICK — final sweep: reduced-motion content loss, the real motion toggle, print chrome.
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

// ---- A. REDUCED MOTION CONTENT LOSS: side-by-side of the same paragraph ----
for (const reduced of [false, true]) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // find "Make pipeline decisions auditable instead of opaque."
  const loc = await page.evaluate(() => {
    const p = [...document.querySelectorAll("p")].find((e) => e.innerText.includes("auditable instead of opaque"));
    if (!p) return null;
    return { top: Math.round(p.getBoundingClientRect().top + window.scrollY) };
  });
  if (!loc) {
    note(`rm.${reduced}.notFound`, true);
    await ctx.close();
    continue;
  }
  await page.evaluate((y) => window.scrollTo({ top: y - 450, behavior: "instant" }), loc.top);
  await page.waitForTimeout(2500);
  // scroll past and back, to give any scroll-triggered reveal every chance
  await page.evaluate((y) => window.scrollTo({ top: y + 600, behavior: "instant" }), loc.top);
  await page.waitForTimeout(1500);
  await page.evaluate((y) => window.scrollTo({ top: y - 450, behavior: "instant" }), loc.top);
  await page.waitForTimeout(2500);

  const state = await page.evaluate(() => {
    const targets = [
      "auditable instead of opaque",
      "retrieval and MCP",
      "containerized execution",
      "browser-level check",
      "alter workflow state",
    ];
    return targets.map((t) => {
      const p = [...document.querySelectorAll("p")].find((e) => e.innerText.includes(t));
      if (!p) return { t, missing: true };
      const cs = getComputedStyle(p);
      const r = p.getBoundingClientRect();
      // also check children (the animated span)
      const kid = p.querySelector('span[aria-hidden="true"]') ?? p.firstElementChild;
      return {
        t,
        opacity: cs.opacity,
        visibility: cs.visibility,
        transform: cs.transform,
        kidOpacity: kid ? getComputedStyle(kid).opacity : null,
        inViewport: r.top > -100 && r.top < 1000,
        top: Math.round(r.top),
      };
    });
  });
  note(`reducedMotion=${reduced}.paragraphs`, state);
  await page.screenshot({ path: `${OUT}/rm-${reduced ? "reduce" : "motion"}-automl.png` });
  await ctx.close();
}

// ---- B. THE REAL MOTION TOGGLE ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  const btn = page.locator("header button", { hasText: "motion" }).first();
  const before = await page.evaluate(() => {
    const b = [...document.querySelectorAll("header button")].find((e) => /motion/.test(e.innerText));
    return {
      label: b?.innerText.replace(/\s+/g, " ").trim(),
      aria: b?.getAttribute("aria-pressed") ?? b?.getAttribute("aria-label"),
      html: document.documentElement.dataset.motion ?? null,
      cls: document.documentElement.className.slice(0, 60),
    };
  });
  await btn.click({ force: true }).catch((e) => note("motionClick.err", String(e).slice(0, 80)));
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => {
    const b = [...document.querySelectorAll("header button")].find((e) => /motion/.test(e.innerText));
    return {
      label: b?.innerText.replace(/\s+/g, " ").trim(),
      aria: b?.getAttribute("aria-pressed") ?? b?.getAttribute("aria-label"),
      html: document.documentElement.dataset.motion ?? null,
      bodyData: JSON.stringify(document.body.dataset),
      ls: (() => { try { return JSON.stringify(Object.entries(localStorage)); } catch { return "n/a"; } })(),
    };
  });
  note("motionToggle.real", { before, after });
  await page.screenshot({ path: `${OUT}/motion-toggle-after.png`, clip: { x: 980, y: 0, width: 460, height: 76 } });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const persisted = await page.evaluate(() => {
    const b = [...document.querySelectorAll("header button")].find((e) => /motion/.test(e.innerText));
    return { label: b?.innerText.replace(/\s+/g, " ").trim(), html: document.documentElement.dataset.motion ?? null };
  });
  note("motionToggle.persisted", persisted);
  await ctx.close();
}

// ---- C. PRINT: what actually lands on the paper ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE + "/projects/jobtracker/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(900);
  const printState = await page.evaluate(() => {
    const q = (s) => {
      const e = document.querySelector(s);
      if (!e) return null;
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return { display: cs.display, position: cs.position, h: Math.round(r.height), visible: r.height > 0 };
    };
    return {
      header: q("header"),
      footer: q("footer"),
      railNav: q('nav[aria-label], aside nav'),
      bodyBg: getComputedStyle(document.body).backgroundColor,
      htmlBg: getComputedStyle(document.documentElement).backgroundColor,
      // any print-specific rules present at all?
      printRules: (() => {
        let n = 0;
        for (const ss of document.styleSheets) {
          try {
            for (const r of ss.cssRules) if (r.type === 4 && /print/.test(r.conditionText ?? r.media?.mediaText ?? "")) n++;
          } catch {}
        }
        return n;
      })(),
    };
  });
  note("print.jobtracker.detail", printState);
  await page.screenshot({ path: `${OUT}/print-emulated-top.png`, clip: { x: 0, y: 0, width: 1440, height: 500 } });
  await ctx.close();
}

// ---- D. THE AUTOML REDACTION: what does a stranger see? ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  const box = await page.evaluate(() => {
    const el = [...document.querySelectorAll("*")].find((e) => /run\s*·\s*model/i.test(e.innerText ?? "") && e.innerText.length < 400);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), h: Math.round(r.height), left: Math.round(r.left), w: Math.round(r.width) };
  });
  if (box) {
    await page.evaluate((y) => window.scrollTo({ top: y - 200, behavior: "instant" }), box.top);
    await page.waitForTimeout(1800);
    await page.screenshot({
      path: `${OUT}/zoom-automl-redaction.png`,
      clip: { x: Math.max(0, box.left - 20), y: 180, width: Math.min(700, box.w + 40), height: Math.min(420, box.h + 220) },
    });
    note("redactionBox", box);
  }
  await ctx.close();
}

writeFileSync(`${OUT}/final-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
