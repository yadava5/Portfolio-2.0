// CRITIC VERIFY — the accusations that need hard proof before they go in the ledger.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const OUT = "docs/design-lab/shots-critic";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:4321";
const settle = (p, ms) => p.waitForTimeout(ms);
const R = {};
const browser = await chromium.launch();

/* ── 1. Nav "contact" → is the email address actually visible? ─────── */
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(p, 1800);
  await p.locator('header a:has-text("contact")').first().click();
  await settle(p, 3000);
  await p.screenshot({ path: `${OUT}/verify-nav-contact.png` });
  R.navContact = await p.evaluate(() => {
    const pick = (re) =>
      Array.from(document.querySelectorAll("a,p")).find((x) => re.test(x.textContent));
    const opOf = (el) => {
      let op = 1, n = el;
      while (n && n !== document.documentElement) { op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
      return +op.toFixed(2);
    };
    const email = pick(/@icloud|@gmail|mailto/);
    const emailA = document.querySelector('a[href^="mailto:"]');
    const avail = pick(/availability —/);
    const cta = Array.from(document.querySelectorAll("a")).find((x) => /Email me/.test(x.textContent));
    return {
      scrollY: Math.round(window.scrollY),
      email: emailA && { op: opOf(emailA), y: Math.round(emailA.getBoundingClientRect().top), text: emailA.textContent.trim() },
      availability: avail && { op: opOf(avail), y: Math.round(avail.getBoundingClientRect().top) },
      cta: cta && { op: opOf(cta), y: Math.round(cta.getBoundingClientRect().top) },
    };
  });
  // now nudge the wheel a single notch and re-measure
  await p.mouse.wheel(0, 120);
  await settle(p, 2200);
  R.navContactAfterNudge = await p.evaluate(() => {
    const a = document.querySelector('a[href^="mailto:"]');
    let op = 1, n = a;
    while (n && n !== document.documentElement) { op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
    return { op: +op.toFixed(2), scrollY: Math.round(window.scrollY) };
  });
  await p.screenshot({ path: `${OUT}/verify-nav-contact-after-nudge.png` });
  await c.close();
}

/* ── 2. Deep link /#values ─────────────────────────────────────────── */
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  await p.goto(`${BASE}/#values`, { waitUntil: "networkidle" });
  await settle(p, 3500);
  R.deepValues = await p.evaluate(() => {
    const v = document.getElementById("values");
    return {
      scrollY: Math.round(window.scrollY),
      valuesTop: Math.round(v.getBoundingClientRect().top),
      whatIsAtTop: Array.from(document.querySelectorAll("section[data-chapter]"))
        .map((s) => ({ id: s.id, top: Math.round(s.getBoundingClientRect().top) }))
        .filter((s) => s.top < 200 && s.top > -3200),
    };
  });
  await p.screenshot({ path: `${OUT}/verify-deeplink-values.png` });
  await c.close();
}

/* ── 3. Focus ring visibility in the DAY world (top of page) ──────── */
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const p = await c.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(p, 1800);
  const trail = [];
  for (let i = 0; i < 14; i++) {
    await p.keyboard.press("Tab");
    const info = await p.evaluate(() => {
      const el = document.activeElement;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      // page bg behind it
      let bg = "n/a", n = el;
      while (n && n !== document.documentElement) {
        const c2 = getComputedStyle(n).backgroundColor;
        if (c2 && !/rgba\(0, 0, 0, 0\)/.test(c2)) { bg = c2; break; }
        n = n.parentElement;
      }
      return {
        tag: el.tagName,
        text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40),
        outlineColor: cs.outlineColor,
        outlineW: cs.outlineWidth,
        outlineOffset: cs.outlineOffset,
        bgBehind: bg,
        y: Math.round(r.top),
        h: Math.round(r.height),
      };
    });
    trail.push(info);
  }
  R.focusDay = trail;
  await p.keyboard.press("Shift+Tab");
  await p.screenshot({ path: `${OUT}/verify-focus-day.png` });
  // Screenshot the first focused element up close
  await p.evaluate(() => window.scrollTo(0, 0));
  for (let i = 0; i < 3; i++) await p.keyboard.press("Tab");
  await settle(p, 400);
  await p.screenshot({ path: `${OUT}/verify-focus-header.png`, clip: { x: 0, y: 0, width: 1440, height: 120 } });
  await c.close();
}

/* ── 4. Clock: correct selector + fake timers ─────────────────────── */
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.clock.install({ time: new Date("2026-07-24T13:20:00Z") });
  await p.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await settle(p, 1500);
  const read = () =>
    p.evaluate(() => {
      const el = Array.from(document.querySelectorAll("p")).find((x) =>
        /local\s*$/.test(x.textContent.trim())
      );
      return el ? el.textContent.trim() : "NOT FOUND";
    });
  const t0 = await read();
  await p.clock.fastForward("02:00");
  const t1 = await read();
  await p.clock.fastForward("10:00");
  const t2 = await read();
  await p.clock.fastForward("01:00:00");
  const t3 = await read();
  R.clock = { t0, plus2min: t1, plus12min: t2, plus72min: t3, ticks: t0 !== t3 };
  await c.close();
}

/* ── 5. Case-study images after a full scroll (real 404s only) ────── */
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  const failed = [];
  p.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  R.caseStudyImages = {};
  for (const route of ["/projects/jobtracker/", "/projects/automl/", "/projects/fast-mnist-nn/", "/evidence/"]) {
    await p.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 600) { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(200); }
    await settle(p, 1800);
    R.caseStudyImages[route] = await p.evaluate(() =>
      Array.from(document.images)
        .filter((i) => !i.complete || i.naturalWidth === 0)
        .map((i) => i.currentSrc || i.src)
    );
    await p.screenshot({ path: `${OUT}/case${route.replace(/\//g, "_")}full.png`, fullPage: true });
  }
  R.http4xx = failed;
  await c.close();
}

/* ── 6. Motion OFF equity: does ch04 show a finished or dead state? ─ */
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
  const p = await c.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(p, 1600);
  await p.evaluate(() => document.getElementById("automl")?.scrollIntoView({ block: "start" }));
  await settle(p, 1600);
  await p.screenshot({ path: `${OUT}/verify-reduced-automl.png` });
  R.reducedAutoml = await p.evaluate(() => {
    const items = Array.from(document.querySelectorAll("[data-pipeline-phase]"));
    return items.map((el) => ({
      text: el.textContent.trim(),
      color: getComputedStyle(el).color,
      lit: el.hasAttribute("data-pipeline-lit"),
    }));
  });
  await p.evaluate(() => document.getElementById("gate")?.scrollIntoView({ block: "start" }));
  await settle(p, 1600);
  await p.screenshot({ path: `${OUT}/verify-reduced-gate.png` });
  R.reducedTier = await p.evaluate(() => document.documentElement.getAttribute("data-tier"));
  await c.close();
}

/* ── 7. Governor tier under normal (non-reduced) conditions ───────── */
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(p, 2500);
  R.tierDefault = await p.evaluate(() => ({
    tier: document.documentElement.getAttribute("data-tier"),
    motionOff: document.documentElement.getAttribute("data-motion-off"),
    arcChrome: document.documentElement.getAttribute("data-arc-chrome"),
    dm: navigator.deviceMemory, hc: navigator.hardwareConcurrency,
  }));
  await c.close();
}

/* ── 8. Text selection / print sanity ─────────────────────────────── */
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(p, 1500);
  await p.emulateMedia({ media: "print" });
  await settle(p, 900);
  await p.screenshot({ path: `${OUT}/verify-print.png`, fullPage: false });
  R.printOpacity = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll("section#work h3, section#gate h2, section#who p").forEach((el) => {
      let op = 1, n = el;
      while (n && n !== document.documentElement) { op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
      out.push({ text: el.textContent.trim().slice(0, 40), op: +op.toFixed(2) });
    });
    return out;
  });
  await c.close();
}

await browser.close();
writeFileSync(`${OUT}/verify.json`, JSON.stringify(R, null, 2));
console.log(JSON.stringify(R, null, 2).slice(0, 6000));
