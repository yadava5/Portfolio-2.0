// NITPICK 3 — the rest of FIX6's ledger, re-read: the glance caption,
// the two ¶07 clocks, the fig ids and whether `see fig. N` reaches them,
// the wordmark hover, and the delight list.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-nitpick3";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3601";
const notes = [];
const note = (k, v) => { notes.push({ k, v }); console.log(`\n[${k}]\n${typeof v === "string" ? v : JSON.stringify(v, null, 1)}`); };

const browser = await chromium.launch();

// ---- 1. the glance caption, 1440 and the widths under it
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const out = [];
  for (const w of [390, 768, 900, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto(BASE + "/evidence/", { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    const v = await page.evaluate(() => {
      const el = [...document.querySelectorAll("*")].find(
        (e) => e.children.length === 0 && /at a glance|entries/.test(e.textContent ?? "") && (e.textContent ?? "").length < 260
      );
      if (!el) return null;
      const b = el.getBoundingClientRect();
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 18;
      const strip = el.closest("section,div,figure");
      return {
        text: (el.textContent ?? "").trim().replace(/\s+/g, " "),
        w: Math.round(b.width), h: Math.round(b.height), lines: Math.round(b.height / lh),
        maxW: getComputedStyle(el).maxWidth,
        stripW: strip ? Math.round(strip.getBoundingClientRect().width) : null,
      };
    });
    out.push({ w, ...v });
  }
  note("glanceCaption", out);
  await ctx.close();
}

// ---- 2. the two ¶07 clocks
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2400);
  const v = await page.evaluate(() => {
    const t = document.body.innerText;
    const clocks = [...t.matchAll(/(\d{1,2}:\d{2}(\s*[ap]m)?)/gi)].map((m) => m[0]);
    const gateLine = (t.match(/[^\n]*right now[^\n]*/i) ?? [])[0] ?? null;
    const kicker = document.querySelector("[data-thread-kicker]")?.textContent?.trim() ?? null;
    // y positions
    const ys = [];
    for (const el of document.querySelectorAll("*")) {
      if (el.children.length) continue;
      const txt = (el.textContent ?? "").trim();
      if (/\d{1,2}:\d{2}/.test(txt) && txt.length < 120) {
        const b = el.getBoundingClientRect();
        ys.push({ t: txt.slice(0, 90), y: Math.round(b.top + window.scrollY) });
      }
    }
    return { clocks: clocks.slice(0, 8), gateLine, kicker, ys };
  });
  note("clocks", v);
  await ctx.close();
}

// ---- 3. fig ids + do the `see fig. N` links resolve
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const out = [];
  for (const id of ["automl", "fast-mnist-nn", "jobtracker", "master-inventory", "policybot", "taskflow-calendar", "visual-assist"]) {
    await page.goto(`${BASE}/projects/${id}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1800);
    const v = await page.evaluate(() => {
      const figIds = [...document.querySelectorAll("[id^=fig-]")].map((e) => e.id);
      const refs = [...document.querySelectorAll('a[href^="#fig-"]')].map((a) => a.getAttribute("href"));
      const dead = refs.filter((h) => !document.querySelector(h.replace("#", "#")));
      // plain-text "fig. N" mentions that are NOT links
      const bodyText = document.body.innerText;
      const mentions = [...new Set([...bodyText.matchAll(/fig\.\s*(\d+)(\.\d+)?/gi)].map((m) => m[0].toLowerCase()))];
      return { figIds, refs: [...new Set(refs)], dead: [...new Set(dead)], mentions };
    });
    out.push({ id, ...v });
  }
  note("figIds", out);
  await ctx.close();
}

// ---- 4. the wordmark hover, read at background-size AND at pixels
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const targets = [
    ['header a[href="/"]', "wordmark"],
    ['header a[href="/#work"]', "theWork"],
  ];
  const out = [];
  for (const [sel, name] of targets) {
    const before = await page.evaluate((s) => {
      const el = document.querySelector(s); if (!el) return null;
      const cs = getComputedStyle(el);
      return { bgSize: cs.backgroundSize, bgImage: cs.backgroundImage.slice(0, 70), color: cs.color, td: cs.textDecorationLine };
    }, sel);
    if (!before) { out.push({ name, err: "not found" }); continue; }
    const box = await page.locator(sel).boundingBox();
    await page.screenshot({ path: `${OUT}/n3-hover-${name}-off.png`, clip: { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 } });
    await page.hover(sel);
    await page.waitForTimeout(700);
    const after = await page.evaluate((s) => {
      const cs = getComputedStyle(document.querySelector(s));
      return { bgSize: cs.backgroundSize, color: cs.color, td: cs.textDecorationLine };
    }, sel);
    await page.screenshot({ path: `${OUT}/n3-hover-${name}-on.png`, clip: { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 } });
    await page.mouse.move(0, 600);
    await page.waitForTimeout(500);
    out.push({ name, before, after, changed: JSON.stringify(before.bgSize) !== JSON.stringify(after.bgSize) });
  }
  note("hover", out);
  await ctx.close();
}

// ---- 5. delight list survivors
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const v = await page.evaluate(() => ({
    redThread: document.querySelectorAll("[data-thread-kicker],[data-thread-name],[data-thread-stamp],[data-thread-sig]").length,
    threadSvg: document.querySelectorAll("svg[class*=thread],[data-thread-line],[data-red-thread]").length,
    railMarks: document.querySelectorAll("[data-rail],[data-chapter-rail] li, nav[aria-label*=chapter] li").length,
    lightField: !!document.querySelector("[data-light-field]"),
    arcPhaseAttr: document.documentElement.getAttribute("data-arc-phase"),
    stamps: document.querySelectorAll("[data-stamp]").length,
    colophon: /set in frauces|frauces|newsreader|fragment mono/i.test(document.body.innerText),
    leaders: document.querySelectorAll("[class*=leader]").length,
  }));
  note("delight.home", v);
  await page.goto(BASE + "/no-such-page/", { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const v2 = await page.evaluate(() => {
    const dotted = [...document.querySelectorAll("*")].filter((e) => {
      const cs = getComputedStyle(e);
      return /dotted/.test(cs.borderBottomStyle) || /repeating|radial/.test(cs.backgroundImage);
    }).length;
    return { dottedLeaders: dotted };
  });
  note("delight.404", v2);
  await ctx.close();
}

writeFileSync(`${OUT}/regress-notes.json`, JSON.stringify(notes, null, 1));
await browser.close();
console.log("\n--- done ---");
