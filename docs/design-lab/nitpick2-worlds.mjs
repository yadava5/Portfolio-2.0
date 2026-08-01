// NITPICK ROUND 2 — the worlds a reader can arrive in: keyboard-only,
// motion-off, prefers-reduced-motion, forced dark, print, JS-dead, 404.
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

// ---------- 1. keyboard-only walk of home ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const stops = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(90);
    const s = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return { tag: "BODY" };
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const inView = b.top >= -1 && b.bottom <= window.innerHeight + 1;
      return {
        tag: el.tagName,
        text: (el.innerText ?? el.textContent ?? "").trim().slice(0, 44),
        href: el.getAttribute("href"),
        outline: cs.outlineStyle === "none" ? null : `${cs.outlineWidth} ${cs.outlineColor}`,
        outlineOffset: cs.outlineOffset,
        boxShadow: cs.boxShadow === "none" ? null : cs.boxShadow.slice(0, 60),
        box: [Math.round(b.width), Math.round(b.height)],
        top: Math.round(b.top),
        inView,
        scrollY: Math.round(window.scrollY),
      };
    });
    stops.push(s);
    if (i < 6) await page.screenshot({ path: `${OUT}/kbd-home-${String(i).padStart(2, "0")}.png` });
    if (s.tag === "BODY" && i > 3) break;
  }
  note("keyboard.home", stops);

  // is there a skip link, and does the FIRST tab reveal it?
  const skip = await page.evaluate(() => {
    const a = document.querySelector('a[href^="#"]');
    return a ? { text: a.textContent.trim(), href: a.getAttribute("href") } : null;
  });
  note("keyboard.firstAnchor", skip);
  await ctx.close();
}

// ---------- 2. keyboard walk of a case file (does the rail trap?) ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/projects/jobtracker/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const stops = [];
  for (let i = 0; i < 45; i++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(70);
    const s = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return { tag: "BODY" };
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName,
        text: (el.innerText ?? "").trim().slice(0, 40),
        outline: cs.outlineStyle === "none" ? null : cs.outlineWidth,
        inView: b.top >= -1 && b.bottom <= window.innerHeight + 1,
        top: Math.round(b.top),
        w: Math.round(b.width),
        h: Math.round(b.height),
      };
    });
    stops.push(s);
    if (s.tag === "BODY" && i > 3) break;
  }
  note("keyboard.casefile", stops);
  await ctx.close();
}

// ---------- 3. the portrait / dialog: keyboard open + Escape ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const trig = await page
    .locator('button[aria-haspopup="dialog"], [role="button"][aria-haspopup]')
    .first();
  const has = (await trig.count()) > 0;
  note("dialog.triggerExists", has);
  if (has) {
    await trig.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(800);
    const open = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      if (!d) return null;
      const focus = document.activeElement;
      return {
        dialogPresent: true,
        focusInside: d.contains(focus),
        focusTag: focus?.tagName,
        labelled: d.getAttribute("aria-label") ?? d.getAttribute("aria-labelledby"),
        bodyOverflow: getComputedStyle(document.body).overflow,
      };
    });
    note("dialog.opened", open);
    await page.screenshot({ path: `${OUT}/dialog-open.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    const closed = await page.evaluate(() => ({
      dialogPresent: !!document.querySelector('[role="dialog"]'),
      focusTag: document.activeElement?.tagName,
      focusText: (document.activeElement?.innerText ?? "").trim().slice(0, 40),
      returnedToTrigger: document.activeElement?.getAttribute("aria-haspopup") === "dialog",
    }));
    note("dialog.closed", closed);
  }
  await ctx.close();
}

// ---------- 4. prefers-reduced-motion world ----------
{
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/rm-home-top.png` });
  const r = await page.evaluate(() => {
    // Any element left invisible with no way to reveal it?
    const hidden = [];
    for (const el of document.querySelectorAll("main *")) {
      const cs = getComputedStyle(el);
      if (Number(cs.opacity) < 0.08 && el.textContent.trim().length > 20) {
        const b = el.getBoundingClientRect();
        hidden.push({
          tag: el.tagName,
          cls: String(el.className ?? "").slice(0, 40),
          op: cs.opacity,
          text: el.textContent.trim().slice(0, 60),
          top: Math.round(b.top + window.scrollY),
        });
      }
    }
    return { tier: document.documentElement.dataset.tier, hiddenCount: hidden.length, hidden: hidden.slice(0, 12) };
  });
  note("reducedMotion.initial", r);
  // scroll the whole document and re-check
  await page.evaluate(async () => {
    const H = document.body.scrollHeight;
    for (let y = 0; y < H; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
  });
  await page.waitForTimeout(1200);
  const after = await page.evaluate(() => {
    const hidden = [];
    for (const el of document.querySelectorAll("main *")) {
      const cs = getComputedStyle(el);
      if (Number(cs.opacity) < 0.08 && el.textContent.trim().length > 20) {
        hidden.push({
          tag: el.tagName,
          cls: String(el.className ?? "").slice(0, 40),
          op: cs.opacity,
          text: el.textContent.trim().slice(0, 70),
          top: Math.round(el.getBoundingClientRect().top + window.scrollY),
        });
      }
    }
    return { hiddenCount: hidden.length, hidden: hidden.slice(0, 14) };
  });
  note("reducedMotion.afterScroll", after);
  await page.screenshot({ path: `${OUT}/rm-home-bottom.png` });
  await ctx.close();
}

// ---------- 5. motion-off (the site's own toggle) ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  const btn = page.locator("button", { hasText: /motion:/ }).first();
  const before = await btn.innerText().catch(() => null);
  await btn.click();
  await page.waitForTimeout(900);
  const after = await btn.innerText().catch(() => null);
  note("motionToggle", { before, after });
  await page.screenshot({ path: `${OUT}/motionoff-home.png` });
  // reload — does it persist, and is the first paint already settled?
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const early = await page.evaluate(() => {
    const hidden = [];
    for (const el of document.querySelectorAll("main *")) {
      const cs = getComputedStyle(el);
      if (Number(cs.opacity) < 0.08 && el.textContent.trim().length > 20)
        hidden.push(el.textContent.trim().slice(0, 50));
    }
    return {
      tier: document.documentElement.dataset.tier,
      motionOff: document.documentElement.dataset.motion ?? document.body.dataset.motion ?? null,
      hidden: hidden.length,
    };
  });
  note("motionOff.reload@400ms", early);
  await page.screenshot({ path: `${OUT}/motionoff-reload.png` });
  await ctx.close();
}

// ---------- 6. JS dead ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/nojs-home.png`, fullPage: false });
  const r = await page.evaluate(() => {
    const hidden = [];
    for (const el of document.querySelectorAll("main *")) {
      const cs = getComputedStyle(el);
      if (Number(cs.opacity) < 0.08 && el.textContent.trim().length > 20)
        hidden.push(el.textContent.trim().slice(0, 60));
    }
    return { hidden: hidden.length, sample: hidden.slice(0, 8), bodyH: document.body.scrollHeight };
  });
  note("nojs.home", r);
  await ctx.close();
}

// ---------- 7. forced dark ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/dark-home.png` });
  const r = await page.evaluate(() => ({
    bodyBg: getComputedStyle(document.body).backgroundColor,
    color: getComputedStyle(document.body).color,
    scheme: getComputedStyle(document.documentElement).colorScheme,
  }));
  note("forcedDark", r);
  await ctx.close();
}

// ---------- 8. the 404, deeply ----------
{
  for (const width of [390, 768, 1440]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + "/no-such-page/", { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${OUT}/404-${width}.png`, fullPage: true });
    const r = await page.evaluate(() => {
      const links = [...document.querySelectorAll("a[href]")]
        .filter((a) => a.getBoundingClientRect().width)
        .map((a) => ({ t: a.textContent.trim().slice(0, 46), h: a.getAttribute("href") }));
      const hs = [...document.querySelectorAll("h1,h2,h3")].map((h) => ({
        lvl: h.tagName,
        t: h.textContent.trim().slice(0, 60),
        size: getComputedStyle(h).fontSize,
        fam: getComputedStyle(h).fontFamily.split(",")[0],
      }));
      return {
        title: document.title,
        heads: hs,
        links,
        homeLinks: links.filter((l) => l.h === "/" || l.h === "./" || /^\/?$/.test(l.h ?? "")).length,
        bodyBg: getComputedStyle(document.body).backgroundColor,
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        h: document.body.scrollHeight,
        hasFooter: !!document.querySelector("footer"),
        hasHeader: !!document.querySelector("header"),
        robots: document.querySelector('meta[name="robots"]')?.content ?? null,
      };
    });
    note(`404@${width}`, r);
    await ctx.close();
  }
}

writeFileSync(`${OUT}/worlds-notes.json`, JSON.stringify(notes, null, 2));
await browser.close();
console.log("done");
