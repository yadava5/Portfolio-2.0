// NITPICK 3 — the last sweep: 320 end to end, the finale on a phone,
// layout shift, console noise, the back-restore delight, and the OG head.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-nitpick3";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:3601";
const notes = [];
const note = (k, v) => { notes.push({ k, v }); console.log(`\n[${k}]\n${typeof v === "string" ? v : JSON.stringify(v, null, 1)}`); };

const browser = await chromium.launch();

// ---- console + CLS + long tasks on every route
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const rep = [];
  for (const r of ["/", "/evidence/", "/projects/automl/", "/no-such-page/"]) {
    const msgs = [];
    const onMsg = (m) => { if (["error", "warning"].includes(m.type())) msgs.push(`${m.type()}: ${m.text().slice(0, 120)}`); };
    const onErr = (e) => msgs.push(`pageerror: ${String(e).slice(0, 120)}`);
    page.on("console", onMsg); page.on("pageerror", onErr);
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      window.__cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    });
    await page.waitForTimeout(1200);
    // scroll the whole page, then measure
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    });
    await page.waitForTimeout(1500);
    const m = await page.evaluate(() => ({
      cls: +(window.__cls ?? 0).toFixed(4),
      lcp: (performance.getEntriesByType("largest-contentful-paint").at(-1)?.startTime ?? null),
      dcl: Math.round(performance.getEntriesByType("navigation")[0]?.domContentLoadedEventEnd ?? 0),
      nodes: document.querySelectorAll("*").length,
    }));
    rep.push({ route: r, ...m, console: msgs.slice(0, 6), nMsgs: msgs.length });
    page.off("console", onMsg); page.off("pageerror", onErr);
  }
  note("runtime@390", rep);
  await ctx.close();
}

// ---- 320 end to end, every route, plus the finale frame
{
  const ctx = await browser.newContext({ viewport: { width: 320, height: 800 } });
  const page = await ctx.newPage();
  const rep = [];
  for (const r of ["/", "/evidence/", "/projects/automl/", "/projects/taskflow-calendar/", "/no-such-page/"]) {
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    const v = await page.evaluate(() => {
      const bleed = [];
      for (const el of document.querySelectorAll("*")) {
        const b = el.getBoundingClientRect();
        if (b.width && b.right > innerWidth + 0.5) bleed.push((el.textContent ?? "").trim().slice(0, 34));
      }
      return { over: document.documentElement.scrollWidth - innerWidth, bleed: bleed.slice(0, 4) };
    });
    rep.push({ route: r, ...v });
  }
  note("overflow@320", rep);
  // the finale on the smallest phone
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${OUT}/n3-gate-320.png` });
  await ctx.close();
}

// ---- the finale on a normal phone, pressed
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${OUT}/n3-gate-390-before.png` });
  await page.evaluate(() => [...document.querySelectorAll("[data-stamp]")].find((e) => e.getBoundingClientRect().width)?.click());
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${OUT}/n3-gate-390-after.png` });
  const after = await page.evaluate(() => {
    const el = [...document.querySelectorAll("[data-stamp]")].find((e) => e.getBoundingClientRect().width);
    el.focus();
    const reg = el.querySelector(".stamp-register");
    return {
      inked: el.hasAttribute("data-inked"),
      pressed: el.getAttribute("aria-pressed"),
      label: el.getAttribute("aria-label"),
      registerOpacityWhenInkedAndFocused: reg ? getComputedStyle(reg).opacity : null,
    };
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/n3-gate-390-inked-focus.png` });
  note("gate.pressed", after);
  await ctx.close();
}

// ---- back-restore (delight 8)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 6000));
  await page.waitForTimeout(900);
  const y0 = await page.evaluate(() => Math.round(window.scrollY));
  await page.evaluate(() => {
    const a = [...document.querySelectorAll('a[href*="/projects/"]')].find((x) => x.getBoundingClientRect().width);
    a.click();
  });
  await page.waitForTimeout(2000);
  const at = page.url();
  await page.goBack();
  await page.waitForTimeout(2200);
  const y1 = await page.evaluate(() => Math.round(window.scrollY));
  note("backRestore", { leftAt: y0, wentTo: at.replace(BASE, ""), returnedTo: y1, delta: Math.abs(y1 - y0) });
  await ctx.close();
}

writeFileSync(`${OUT}/last-notes.json`, JSON.stringify(notes, null, 1));
await browser.close();
console.log("\n--- done ---");
