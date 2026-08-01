// CRITIC INTERACTION PROBE — pin range, reveal-at-rest, clock ticking,
// stamp press, motion toggle, nav + back/forward, tap targets, no-JS.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "docs/design-lab/shots-critic";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:4321";
const settle = (p, ms) => p.waitForTimeout(ms);
const R = {};
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await settle(page, 1600);

/* ── A. ScrollTrigger inventory (pin ranges, scrub, durations) ─────── */
R.scrollTriggers = await page.evaluate(() => {
  const ST = window.ScrollTrigger || window.gsap?.core?.globals?.().ScrollTrigger;
  if (!ST || !ST.getAll) return "ScrollTrigger not on window";
  return ST.getAll().map((t) => ({
    trigger: t.trigger?.tagName + (t.trigger?.id ? "#" + t.trigger.id : "") +
      (t.trigger?.dataset ? " " + Object.keys(t.trigger.dataset).slice(0,3).join(",") : ""),
    start: Math.round(t.start),
    end: Math.round(t.end),
    range: Math.round(t.end - t.start),
    pin: !!t.pin,
    scrub: t.scrub ?? false,
  }));
});

/* ── B. What is still invisible when the reader is LOOKING at it ──── */
async function restVisibility(anchor) {
  await page.evaluate((a) => {
    document.getElementById(a)?.scrollIntoView({ behavior: "instant", block: "start" });
  }, anchor);
  await settle(page, 2600); // generous: let every reveal finish
  return page.evaluate(() => {
    const hidden = [];
    document.querySelectorAll("body *").forEach((el) => {
      const has = Array.from(el.childNodes).some(
        (n) => n.nodeType === 3 && n.textContent.trim()
      );
      if (!has) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      let op = 1, n = el;
      while (n && n !== document.documentElement) {
        op *= parseFloat(getComputedStyle(n).opacity);
        n = n.parentElement;
      }
      if (op < 0.45)
        hidden.push({
          op: +op.toFixed(2),
          y: Math.round(r.top),
          text: el.textContent.trim().slice(0, 70),
        });
    });
    return hidden;
  });
}
R.restInvisible = {};
for (const a of ["arrival", "who", "path", "automl", "work", "values", "gate"]) {
  R.restInvisible[a] = await restVisibility(a);
}

/* ── C. Clock: does it tick? (fake timers, fast-forward 5 min) ─────── */
{
  const c2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c2.newPage();
  await p.clock.install();
  await p.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await settle(p, 1500);
  const read = () =>
    p.evaluate(() => {
      const el = Array.from(document.querySelectorAll("p")).find((x) =>
        /cincinnati, ohio —/.test(x.textContent)
      );
      return el ? el.textContent.trim() : "not found";
    });
  const t0 = await read();
  await p.clock.fastForward("05:00");
  await settle(p, 400);
  const t1 = await read();
  await p.clock.fastForward("40:00");
  await settle(p, 400);
  const t2 = await read();
  R.clockTick = { t0, afterFake5min: t1, afterFake45min: t2, ticks: t0 !== t1 };
  await c2.close();
}

/* ── D. Prerendered HTML: what a no-JS / crawler view contains ─────── */
{
  const html = await (await fetch(`${BASE}/`)).text();
  R.prerender = {
    hasEmDashClock: html.includes("—:—"),
    nameOccurrences: (html.match(/Ayush Yadav/g) || []).length,
    h1: (html.match(/<h1[^>]*>[\s\S]{0,300}?<\/h1>/) || [""])[0]
      .replace(/<[^>]+>/g, "")
      .slice(0, 160),
    title: (html.match(/<title>(.*?)<\/title>/) || [])[1],
    metaDesc: (html.match(/name="description" content="(.*?)"/) || [])[1],
    ogImage: (html.match(/property="og:image" content="(.*?)"/) || [])[1],
    jsonLd: (html.match(/application\/ld\+json/g) || []).length,
    bytes: html.length,
  };
}

/* ── E. Stamp press + registry press: does anything persist / change ─ */
await page.evaluate(() => document.getElementById("gate")?.scrollIntoView());
await settle(page, 2200);
R.stamp = {};
const stamp = page.locator("[data-stamp]:visible").first();
R.stamp.exists = (await stamp.count()) > 0;
if (R.stamp.exists) {
  const b = await stamp.boundingBox();
  R.stamp.box = b && { w: Math.round(b.width), h: Math.round(b.height) };
  await page.screenshot({
    path: `${OUT}/stamp-before.png`,
    clip: { x: b.x - 60, y: b.y - 60, width: b.width + 120, height: b.height + 140 },
  });
  await stamp.click();
  await settle(page, 2400);
  await page.screenshot({
    path: `${OUT}/stamp-after.png`,
    clip: { x: b.x - 60, y: b.y - 60, width: b.width + 120, height: b.height + 140 },
  });
  R.stamp.afterText = await page
    .locator("[data-stamp]:visible")
    .first()
    .innerText()
    .catch(() => "n/a");
  R.stamp.approvedHello = await page
    .evaluate(() => document.body.innerText.match(/.{0,90}approv.{0,90}/gi)?.slice(0, 6));
}
await page.screenshot({ path: `${OUT}/gate-after-stamp.png` });

/* Does the approval survive a reload? (paper memory) */
await page.reload({ waitUntil: "networkidle" });
await settle(page, 1600);
await page.evaluate(() => document.getElementById("gate")?.scrollIntoView());
await settle(page, 2400);
await page.screenshot({ path: `${OUT}/gate-after-reload.png` });
R.stamp.persisted = await page
  .locator("[data-stamp]:visible")
  .first()
  .innerText()
  .catch(() => "n/a");

/* ── F. Motion toggle ─────────────────────────────────────────────── */
{
  const toggle = page.locator('button:has-text("motion:")').first();
  R.motionToggle = { found: (await toggle.count()) > 0 };
  if (R.motionToggle.found) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await settle(page, 700);
    await toggle.click();
    await settle(page, 1400);
    R.motionToggle.htmlAttrs = await page.evaluate(() =>
      Array.from(document.documentElement.attributes).map((a) => `${a.name}=${a.value}`)
    );
    R.motionToggle.heightAfter = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    await page.evaluate(() => document.getElementById("automl")?.scrollIntoView());
    await settle(page, 1400);
    await page.screenshot({ path: `${OUT}/motionoff-automl.png` });
    await page.evaluate(() => document.getElementById("gate")?.scrollIntoView());
    await settle(page, 1400);
    await page.screenshot({ path: `${OUT}/motionoff-gate.png` });
    R.motionToggle.persistsReload = await (async () => {
      await page.reload({ waitUntil: "networkidle" });
      await settle(page, 1200);
      return page.evaluate(
        () => document.documentElement.getAttribute("data-motion-off")
      );
    })();
    // restore
    const t2 = page.locator('button:has-text("motion:")').first();
    if (await t2.count()) await t2.click();
    await settle(page, 800);
  }
}

/* ── G. Nav clicks + browser back/forward + URL hygiene ───────────── */
{
  const p = await ctx.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(p, 1500);
  const trail = [];
  for (const label of ["the work", "experience", "contact"]) {
    await p.locator(`header a:has-text("${label}")`).first().click();
    await settle(p, 2200);
    trail.push({
      clicked: label,
      url: p.url(),
      scrollY: Math.round(await p.evaluate(() => window.scrollY)),
      topSectionInView: await p.evaluate(() => {
        const secs = Array.from(document.querySelectorAll("section[data-chapter]"));
        const hit = secs.find((s) => {
          const r = s.getBoundingClientRect();
          return r.top <= 140 && r.bottom > 140;
        });
        return hit?.id;
      }),
      headerOverlap: await p.evaluate(() => {
        const secs = Array.from(document.querySelectorAll("section[data-chapter]"));
        const h = document.querySelector("header").getBoundingClientRect().height;
        const near = secs
          .map((s) => ({ id: s.id, top: s.getBoundingClientRect().top }))
          .filter((s) => Math.abs(s.top) < 300);
        return { headerH: Math.round(h), near: near.map((n) => `${n.id}@${Math.round(n.top)}`) };
      }),
    });
  }
  await p.goBack();
  await settle(p, 2000);
  trail.push({ clicked: "BACK", url: p.url(), scrollY: Math.round(await p.evaluate(() => window.scrollY)) });
  await p.goBack();
  await settle(p, 2000);
  trail.push({ clicked: "BACK2", url: p.url(), scrollY: Math.round(await p.evaluate(() => window.scrollY)) });
  await p.goForward();
  await settle(p, 2000);
  trail.push({ clicked: "FWD", url: p.url(), scrollY: Math.round(await p.evaluate(() => window.scrollY)) });
  R.navTrail = trail;
  await p.close();
}

/* ── H. Tap targets on mobile ─────────────────────────────────────── */
{
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await m.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(p, 1600);
  // walk the page so every reveal fires
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 700) {
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await p.waitForTimeout(220);
  }
  await p.evaluate(() => window.scrollTo(0, 0));
  await settle(p, 900);
  R.tapTargets = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll("a[href], button").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      if (r.height < 30 || r.width < 24)
        out.push({
          w: Math.round(r.width),
          h: Math.round(r.height),
          text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 42),
        });
    });
    return out;
  });
  R.mobileHeroBlock = await p.evaluate(() => {
    const links = Array.from(document.querySelectorAll("section#arrival a"));
    return links.map((a) => {
      const r = a.getBoundingClientRect();
      return { text: a.textContent.trim().slice(0, 34), y: Math.round(r.top), h: Math.round(r.height) };
    });
  });
  await p.evaluate(() => document.getElementById("gate")?.scrollIntoView());
  await settle(p, 2400);
  await p.screenshot({ path: `${OUT}/mob-gate.png` });
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await settle(p, 1500);
  await p.screenshot({ path: `${OUT}/mob-bottom.png` });
  await m.close();
}

/* ── I. Horizontal overflow at hostile widths ─────────────────────── */
R.overflow = [];
for (const w of [320, 360, 390, 414, 768, 1024, 1280, 1440, 1920, 2560]) {
  const c = await browser.newContext({ viewport: { width: w, height: 800 } });
  const p = await c.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(p, 1200);
  const o = await p.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const bad = [];
    document.querySelectorAll("body *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > docW + 1 || r.left < -1))
        bad.push({
          tag: el.tagName + (el.className?.toString?.().slice(0, 30) || ""),
          right: Math.round(r.right),
          left: Math.round(r.left),
          text: (el.textContent || "").trim().slice(0, 30),
        });
    });
    return {
      docW,
      scrollW: document.documentElement.scrollWidth,
      overflowing: bad.slice(0, 6),
    };
  });
  R.overflow.push({ w, ...o });
  if (w === 320 || w === 2560) await p.screenshot({ path: `${OUT}/width-${w}.png`, fullPage: false });
  await c.close();
}

await browser.close();
writeFileSync(`${OUT}/interact.json`, JSON.stringify(R, null, 2));
console.log("interact written");
