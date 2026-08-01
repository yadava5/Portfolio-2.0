// Premium-flow critique shoot.
// Captures the CURRENT motion-settled surfaces + a scroll filmstrip + an
// empirical "does content animate on enter?" probe, for PREMIUM-FLOW-PLAN.md.
// Serve out/ first:  PORT=4178 node tests/playwright/static-server.mjs
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "docs/design-lab/shots-premium";
mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE ?? "http://localhost:4178";
const log = (m) => console.log(m);
const settle = (page, ms) => page.waitForTimeout(ms);

const CHAPTERS = [
  ["arrival", "01"],
  ["who", "02"],
  ["path", "03"],
  ["automl", "04"],
  ["work", "05"],
  ["values", "06"],
  ["gate", "07"],
];

const browser = await chromium.launch();

try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 1800); // hero entrance fully lands
  await page.screenshot({ path: `${OUT}/home-1440-00-hero-load.png` });

  // ── Reveal probe: does chapter content animate on scroll-in? ──────────
  // Reload fresh, then for each chapter: scroll it into view and sample the
  // primary content's opacity + transform IMMEDIATELY, then again after a
  // settle. If identical, there is no scroll-enter choreography.
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 1200);
  const probe = [];
  for (const [anchor, id] of CHAPTERS) {
    // Park two viewports above the chapter so it is off-screen, settle,
    // then jump it to top and sample within one frame.
    await page.evaluate((a) => {
      const el = document.getElementById(a);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, y - window.innerHeight * 1.4), behavior: "instant" });
    }, anchor);
    await settle(page, 500);
    const sample = await page.evaluate((a) => {
      const el = document.getElementById(a);
      if (!el) return null;
      const y = el.getBoundingClientRect().top + window.scrollY - 8;
      window.scrollTo({ top: y, behavior: "instant" });
      // Sample the chapter's own opacity/transform + its first heading/para.
      const pick = (node) => {
        if (!node) return null;
        const s = getComputedStyle(node);
        return { opacity: s.opacity, transform: s.transform, filter: s.filter, clip: s.clipPath };
      };
      const sec = document.querySelector(`[data-chapter="${a === "arrival" ? "01" : a}"]`) || el;
      const heading = el.querySelector("h1,h2,h3");
      const para = el.querySelector("p,li");
      return { sec: pick(sec), heading: pick(heading), para: pick(para) };
    }, anchor);
    // Immediate second sample (~1 frame later) then settled sample.
    await settle(page, 60);
    const t0 = await page.evaluate((a) => {
      const el = document.getElementById(a);
      const heading = el?.querySelector("h1,h2,h3");
      const s = heading ? getComputedStyle(heading) : null;
      return s ? { opacity: s.opacity, transform: s.transform, filter: s.filter } : null;
    }, anchor);
    await settle(page, 1000);
    const t1 = await page.evaluate((a) => {
      const el = document.getElementById(a);
      const heading = el?.querySelector("h1,h2,h3");
      const s = heading ? getComputedStyle(heading) : null;
      return s ? { opacity: s.opacity, transform: s.transform, filter: s.filter } : null;
    }, anchor);
    const changed =
      JSON.stringify(t0) !== JSON.stringify(t1) ? "ANIMATED-ON-ENTER" : "no-enter-change";
    probe.push({ chapter: `${id} ${anchor}`, changed, t0, t1, initial: sample });
    log(`PROBE ch${id} ${anchor}: ${changed}  t0=${JSON.stringify(t0)} t1=${JSON.stringify(t1)}`);
  }

  // ── Settled composition of each chapter (top-aligned under masthead) ──
  for (const [anchor, id] of CHAPTERS) {
    await page.evaluate((a) => {
      const el = document.getElementById(a);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 8;
        window.scrollTo({ top: y, behavior: "instant" });
      }
    }, anchor);
    await settle(page, 900);
    await page.screenshot({ path: `${OUT}/home-1440-ch${id}-${anchor}.png` });
  }

  // ── Filmstrip: absolute scroll positions to judge section-to-section flow.
  const totalH = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = 900;
  const frames = 14;
  const step = Math.max(vh * 0.85, (totalH - vh) / frames);
  for (let i = 0; i <= frames; i++) {
    const y = Math.min(i * step, totalH - vh);
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await settle(page, 550);
    await page.screenshot({ path: `${OUT}/film-${String(i).padStart(2, "0")}-y${Math.round(y)}.png` });
  }
  log(`filmstrip: totalH=${totalH} step=${Math.round(step)}`);
  await ctx.close();

  // ── A case file (automl) — full page + architecture figure ────────────
  {
    const ctx2 = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page2 = await ctx2.newPage();
    await page2.goto(`${BASE}/projects/automl/`, { waitUntil: "networkidle" });
    await settle(page2, 1400);
    await page2.screenshot({ path: `${OUT}/case-1440-automl-top.png` });
    await page2.screenshot({ path: `${OUT}/case-1440-automl-full.png`, fullPage: true });
    const arch = await page2.$("#architecture");
    if (arch) {
      await arch.scrollIntoViewIfNeeded();
      await settle(page2, 500);
      await page2.screenshot({ path: `${OUT}/case-1440-automl-architecture.png` });
    }
    await ctx2.close();
  }

  // ── /evidence/ top ────────────────────────────────────────────────────
  {
    const ctx3 = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page3 = await ctx3.newPage();
    await page3.goto(`${BASE}/evidence/`, { waitUntil: "networkidle" });
    await settle(page3, 1000);
    await page3.screenshot({ path: `${OUT}/evidence-1440-top.png` });
    await ctx3.close();
  }

  log("PROBE SUMMARY:");
  for (const p of probe) log(`  ch${p.chapter}: ${p.changed}`);
  log("premium shoot ✓ done");
} catch (e) {
  log("premium shoot ✗ FAILED: " + e.message);
  log(e.stack);
} finally {
  await browser.close();
}
