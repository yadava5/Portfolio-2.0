// NITPICK — reduced motion, print preview, 2560 wide, forced dark, motion toggle.
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

// ---- 1. 2560 ULTRA-WIDE ----
{
  const ctx = await browser.newContext({ viewport: { width: 2560, height: 1440 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const m = await page.evaluate(() => {
    const main = document.querySelector("main");
    const h1 = document.querySelector("h1");
    const body = [...document.querySelectorAll("p")].find((p) => p.innerText.length > 120);
    const cs = body ? getComputedStyle(body) : null;
    const rail = document.querySelector('a[href="#arrival"]')?.closest("nav,ul,div");
    return {
      viewport: window.innerWidth,
      mainWidth: Math.round(main?.getBoundingClientRect().width ?? 0),
      contentLeft: Math.round(document.querySelector("h1")?.getBoundingClientRect().left ?? 0),
      contentRight: Math.round(document.querySelector("h1")?.getBoundingClientRect().right ?? 0),
      h1FontSize: h1 ? getComputedStyle(h1).fontSize : null,
      bodyWidthPx: body ? Math.round(body.getBoundingClientRect().width) : null,
      bodyFontSize: cs?.fontSize,
      bodyCharsPerLine: body && cs ? Math.round(body.getBoundingClientRect().width / (parseFloat(cs.fontSize) * 0.5)) : null,
      railLeft: rail ? Math.round(rail.getBoundingClientRect().left) : null,
      headerNavRight: Math.round(document.querySelector("header nav")?.getBoundingClientRect().right ?? 0),
      scrollHeight: document.documentElement.scrollHeight,
      viewports: +(document.documentElement.scrollHeight / window.innerHeight).toFixed(2),
    };
  });
  note("w2560.metrics", m);
  await page.screenshot({ path: `${OUT}/w2560-00-hero.png` });
  for (const y of [3200, 5600, 9000]) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await page.waitForTimeout(1100);
    await page.screenshot({ path: `${OUT}/w2560-y${y}.png` });
  }
  await ctx.close();
}

// ---- 2. REDUCED MOTION ----
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const rm = await page.evaluate(() => {
    const hidden = [];
    for (const el of document.querySelectorAll("main *")) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width > 40 && r.height > 10 && (parseFloat(cs.opacity) < 0.15 || cs.visibility === "hidden")) {
        const txt = (el.innerText ?? "").trim().slice(0, 50);
        if (txt) hidden.push({ tag: el.tagName, opacity: cs.opacity, vis: cs.visibility, text: txt });
      }
    }
    return {
      motionPref: matchMedia("(prefers-reduced-motion: reduce)").matches,
      scrollHeight: document.documentElement.scrollHeight,
      invisibleWithText: hidden.slice(0, 12),
      invisibleCount: hidden.length,
    };
  });
  note("reducedMotion.home", rm);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let i = 0; i < 8; i++) {
    const y = Math.round(((h - 900) * i) / 7);
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/reduced-${String(i).padStart(2, "0")}-y${y}.png` });
  }
  // is any content permanently invisible without motion?
  const stillHidden = await page.evaluate(() => {
    let n = 0;
    for (const el of document.querySelectorAll("main *")) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      if (r.width > 40 && parseFloat(cs.opacity) < 0.15 && (el.innerText ?? "").trim()) n++;
    }
    return n;
  });
  note("reducedMotion.stillHiddenAfterFullScroll", stillHidden);
  await ctx.close();
}

// ---- 3. MOTION TOGGLE (the header button) ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  const before = await page.evaluate(() => document.querySelector("header button")?.innerText.trim());
  await page.click("header button").catch(() => {});
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => ({
    label: document.querySelector("header button")?.innerText.trim(),
    root: document.documentElement.className,
    dataMotion: document.documentElement.dataset.motion ?? null,
  }));
  note("motionToggle", { before, after });
  await page.screenshot({ path: `${OUT}/motion-toggled-off.png`, clip: { x: 900, y: 0, width: 540, height: 80 } });
  // does the preference survive a reload?
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const persisted = await page.evaluate(() => ({
    label: document.querySelector("header button")?.innerText.trim(),
    dataMotion: document.documentElement.dataset.motion ?? null,
  }));
  note("motionToggle.persistedAfterReload", persisted);
  await ctx.close();
}

// ---- 4. PRINT PREVIEW ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const [name, path] of [["home", "/"], ["case", "/projects/jobtracker/"], ["evidence", "/evidence/"]]) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(2200);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    await page.emulateMedia({ media: "print" });
    await page.waitForTimeout(800);
    const p = await page.evaluate(() => {
      const gone = [];
      for (const sel of ["header", "footer", "nav"]) {
        const el = document.querySelector(sel);
        if (el) gone.push({ sel, display: getComputedStyle(el).display, visible: el.getBoundingClientRect().height > 0 });
      }
      const bg = getComputedStyle(document.body).backgroundColor;
      // do link URLs get printed?
      const a = document.querySelector("main a[href]");
      const after = a ? getComputedStyle(a, "::after").content : null;
      return { chrome: gone, bodyBg: bg, linkAfterContent: after, scrollHeight: document.documentElement.scrollHeight };
    });
    note(`print.${name}`, p);
    await page.pdf({ path: `${OUT}/print-${name}.pdf`, format: "Letter", printBackground: true }).catch((e) => note(`print.${name}.err`, String(e).slice(0, 80)));
    await page.screenshot({ path: `${OUT}/print-${name}-screen.png` });
    await page.emulateMedia({ media: "screen" });
  }
  await ctx.close();
}

// ---- 5. FORCED DARK COLOR SCHEME ----
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const d = await page.evaluate(() => ({
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyColor: getComputedStyle(document.body).color,
    prefersDark: matchMedia("(prefers-color-scheme: dark)").matches,
    colorScheme: getComputedStyle(document.documentElement).colorScheme,
  }));
  note("forcedDark.home", d);
  await page.screenshot({ path: `${OUT}/forced-dark-hero.png` });
  await ctx.close();
}

writeFileSync(`${OUT}/modes-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
