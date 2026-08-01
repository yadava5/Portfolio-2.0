// W5 COLD JUDGE harness — fresh-visitor critique capture.
// Expects the static server on :3000 over a FRESH out/.
// Sections are independent (try/catch) so one failure never kills the rest.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "docs/design-lab/shots-w5judge";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const RECORD = { iso: "2026-07-18", label: "jul 18, 2026" };

const browser = await chromium.launch();
const log = (m) => console.log(m);

async function settle(page, ms = 1200) {
  await page.waitForTimeout(ms);
}
async function scrollToId(page, id, offset = 60) {
  await page.evaluate(
    ([sel, off]) => {
      const el = document.getElementById(sel);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - off;
      window.scrollTo({ top: y, behavior: "instant" });
    },
    [id, offset]
  );
  await settle(page, 950);
}

/* ══════ A. HERO ENTRANCE — deterministic seek frames @1440 ══════════ */
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  /* keep the entrance world alive so seeking works past 1.2s */
  await page.addInitScript(() => {
    const orig = Element.prototype.removeAttribute;
    Element.prototype.removeAttribute = function (name) {
      if (name === "data-motion-ready") return;
      return orig.call(this, name);
    };
  });
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  await settle(page, 350); /* font/hydration beat */
  for (const t of [0, 150, 300, 450, 600, 900, 1200, 1500]) {
    const probe = await page.evaluate((time) => {
      for (const a of document.getAnimations()) {
        try {
          a.pause();
          a.currentTime = time;
        } catch {
          a.play();
        }
      }
      const q = (s) => document.querySelector(s);
      const heads = [...document.querySelectorAll("h1 .hero-enter-headline")];
      const byline = q(".hero-enter-stipple");
      const cs = (el) => (el ? getComputedStyle(el) : null);
      const hs = heads.map((h) => {
        const s = cs(h);
        return { op: s?.opacity, color: s?.color };
      });
      const sb = cs(byline);
      return {
        headOps: hs.map((h) => h.op),
        headColors: hs.map((h) => h.color),
        bylineOp: sb?.opacity,
        stippleR: sb?.getPropertyValue("--stipple-r").trim(),
      };
    }, t);
    await page.screenshot({
      path: `${OUT}/A-hero-t${String(t).padStart(4, "0")}.png`,
      clip: { x: 0, y: 0, width: 1440, height: 860 },
    });
    log(
      `A entrance t=${String(t).padStart(4)}ms  head-op=[${probe.headOps.join(",")}] byline-op=${probe.bylineOp} stipple-r=${probe.stippleR || "(settled)"}`
    );
  }
  await ctx.close();
  log("A ✓ hero entrance");
} catch (e) {
  log("A ✗ hero entrance FAILED: " + e.message);
}

/* ══════ B. FULL HOME JOURNEY — 7 chapters @1440 ═════════════════════ */
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 2400); /* hero entrance completes, day-arc warms */
  await page.screenshot({ path: `${OUT}/B-ch01-arrival.png` });
  const chapters = [
    ["who", "B-ch02-who"],
    ["path", "B-ch03-path"],
    ["automl", "B-ch04-automl"],
    ["work", "B-ch05-work"],
    ["values", "B-ch06-values"],
    ["gate", "B-ch07-gate"],
  ];
  for (const [anchor, name] of chapters) {
    await scrollToId(page, anchor, 60);
    await settle(page, 700);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    log(`B ✓ ${name}`);
  }
  /* full-page tall strip for the day-arc warmth gradient + red thread */
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await settle(page, 600);
  await page.screenshot({ path: `${OUT}/B-work-rows-detail.png`, fullPage: false });
  await scrollToId(page, "work", 40);
  await settle(page, 800);
  await page.screenshot({ path: `${OUT}/B-ch05-work-rows.png` });
  await ctx.close();
  log("B ✓ home journey");
} catch (e) {
  log("B ✗ home journey FAILED: " + e.message);
}

/* ══════ C. CLOSING MANIFEST — clean vs REAL-DRIVEN vs seeded ════════ */
// C1: clean first visit — manifest must render NOTHING
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 1600);
  await scrollToId(page, "gate", 60);
  const cleanText = await page
    .locator(".on-file-manifest")
    .first()
    .textContent();
  await page.screenshot({ path: `${OUT}/C1-manifest-clean.png` });
  log(`C1 ✓ clean manifest textContent=${JSON.stringify(cleanText)}`);
  await ctx.close();
} catch (e) {
  log("C1 ✗ FAILED: " + e.message);
}

// C2: REAL flow — open jobtracker, open+audit automl, home, press stamp
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  // open jobtracker (records visited)
  await page.goto(`${BASE}/projects/jobtracker/`, { waitUntil: "networkidle" });
  await settle(page, 1200);
  // open automl (records visited) + walk its audit (records audit)
  await page.goto(`${BASE}/projects/automl/`, { waitUntil: "networkidle" });
  await settle(page, 1200);
  await page.locator("[data-audit-run]").click();
  await page
    .locator("[data-audit-settled]")
    .waitFor({ state: "visible", timeout: 15000 });
  await settle(page, 900);
  // home → gate → press the awaiting stamp
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 1600);
  await scrollToId(page, "gate", 40);
  await page.locator("[data-stamp]:visible").first().click();
  await settle(page, 1400);
  const drivenText = await page
    .locator(".on-file-manifest[data-on-file]")
    .first()
    .textContent()
    .catch(() => "(none)");
  await page.screenshot({ path: `${OUT}/C2-manifest-realdriven.png` });
  // tight crop on the right column (stamp + manifest)
  const stamp = page.locator("[data-stamp]:visible").first();
  const box = await stamp.boundingBox();
  if (box) {
    await page.screenshot({
      path: `${OUT}/C2-manifest-crop.png`,
      clip: {
        x: Math.max(0, box.x - 40),
        y: Math.max(0, box.y - 40),
        width: Math.min(1440 - Math.max(0, box.x - 40), 640),
        height: 420,
      },
    });
  }
  log(`C2 ✓ REAL-driven manifest textContent=${JSON.stringify(drivenText)}`);
  await ctx.close();
} catch (e) {
  log("C2 ✗ FAILED: " + e.message);
}

// C3: fully-seeded richest state (2 files + 2 audits + approval)
try {
  const SEED = {
    "paper-memory:v1:visited": { jobtracker: RECORD, automl: RECORD },
    "paper-memory:v1:audits": { automl: RECORD, jobtracker: RECORD },
    "paper-memory:v1:approved": RECORD,
  };
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.addInitScript((seed) => {
    for (const [k, v] of Object.entries(seed))
      window.localStorage.setItem(k, JSON.stringify(v));
  }, SEED);
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 1600);
  await scrollToId(page, "gate", 40);
  const seededText = await page
    .locator(".on-file-manifest[data-on-file]")
    .first()
    .textContent()
    .catch(() => "(none)");
  await page.screenshot({ path: `${OUT}/C3-manifest-seeded.png` });
  log(`C3 ✓ seeded manifest textContent=${JSON.stringify(seededText)}`);
  await ctx.close();
} catch (e) {
  log("C3 ✗ FAILED: " + e.message);
}

/* ══════ D. CASE FILES — decisions margin + audit payoff + citation ══ */
for (const slug of ["automl", "jobtracker"]) {
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/projects/${slug}/`, { waitUntil: "networkidle" });
    await settle(page, 1200);
    // decisions: t-slips as right-margin sidenotes
    await scrollToId(page, "decisions", 90);
    await page.screenshot({ path: `${OUT}/D-${slug}-decisions.png` });
    // validation pre-walk
    await scrollToId(page, "validation", 90);
    await page.screenshot({ path: `${OUT}/D-${slug}-validation-prewalk.png` });
    // run the audit walk
    await page.locator("[data-audit-run]").click();
    await page
      .locator("[data-audit-settled]")
      .waitFor({ state: "visible", timeout: 15000 });
    await settle(page, 1000);
    await scrollToId(page, "validation", 90);
    await page.screenshot({ path: `${OUT}/D-${slug}-validation-postwalk.png` });
    // dried revisit (reload) — control IS the settled ledger line
    await page.reload({ waitUntil: "networkidle" });
    await settle(page, 1200);
    await scrollToId(page, "validation", 90);
    await page.screenshot({ path: `${OUT}/D-${slug}-validation-dried.png` });
    // citation hover — where does the stroke originate?
    await page.evaluate(() => window.localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await settle(page, 1600);
    const row = page.locator("[data-receipt-row][data-cites]").first();
    await row.scrollIntoViewIfNeeded();
    await settle(page, 900);
    const cites = await row.getAttribute("data-cites");
    await row.hover();
    await settle(page, 1000);
    const box = await row.boundingBox();
    await page.screenshot({
      path: `${OUT}/D-${slug}-citation-hover.png`,
      clip: {
        x: 0,
        y: Math.max(0, (box?.y ?? 200) - 220),
        width: 1440,
        height: 560,
      },
    });
    log(`D ✓ ${slug} (citation row cites fig.${cites})`);
    await ctx.close();
  } catch (e) {
    log(`D ✗ ${slug} FAILED: ` + e.message);
  }
}

/* ══════ E. MOBILE 390 ══════════════════════════════════════════════ */
try {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 2400);
  await page.screenshot({ path: `${OUT}/E-mob-hero.png` });
  await scrollToId(page, "work", 40);
  await settle(page, 800);
  await page.screenshot({ path: `${OUT}/E-mob-work.png` });
  await scrollToId(page, "gate", 40);
  await settle(page, 800);
  await page.screenshot({ path: `${OUT}/E-mob-gate.png` });
  // case file: t-slips must stack, not break
  await page.goto(`${BASE}/projects/automl/`, { waitUntil: "networkidle" });
  await settle(page, 1200);
  await scrollToId(page, "decisions", 60);
  await page.screenshot({ path: `${OUT}/E-mob-decisions.png` });
  await ctx.close();
  log("E ✓ mobile");
} catch (e) {
  log("E ✗ mobile FAILED: " + e.message);
}

/* ══════ F. EVIDENCE LEDGER — fast-mnist HELD entry ═════════════════ */
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/evidence/`, { waitUntil: "networkidle" });
  await settle(page, 1400);
  await page.screenshot({ path: `${OUT}/F-evidence-top.png` });
  await scrollToId(page, "fast-mnist-accuracy", 200);
  await page.screenshot({ path: `${OUT}/F-evidence-held.png` });
  // capture the whole ledger mid too
  await page.evaluate(() =>
    window.scrollTo({ top: document.body.scrollHeight * 0.5, behavior: "instant" })
  );
  await settle(page, 800);
  await page.screenshot({ path: `${OUT}/F-evidence-mid.png` });
  await ctx.close();
  log("F ✓ evidence");
} catch (e) {
  log("F ✗ evidence FAILED: " + e.message);
}

/* ══════ G. REDUCED MOTION — designed static object ═════════════════ */
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 1400);
  await page.screenshot({ path: `${OUT}/G-reduced-hero.png` });
  await scrollToId(page, "work", 40);
  await settle(page, 700);
  await page.screenshot({ path: `${OUT}/G-reduced-work.png` });
  await scrollToId(page, "gate", 40);
  await settle(page, 700);
  await page.screenshot({ path: `${OUT}/G-reduced-gate.png` });
  await page.goto(`${BASE}/projects/automl/`, { waitUntil: "networkidle" });
  await settle(page, 1200);
  await scrollToId(page, "validation", 90);
  await page.screenshot({ path: `${OUT}/G-reduced-automl-validation.png` });
  await ctx.close();
  log("G ✓ reduced motion");
} catch (e) {
  log("G ✗ reduced motion FAILED: " + e.message);
}

await browser.close();
log("=== JUDGE HARNESS DONE ===");
