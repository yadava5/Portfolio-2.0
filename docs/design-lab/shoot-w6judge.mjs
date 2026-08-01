// W6 COLD JUDGE harness — fresh-visitor critique, centered on the ENDING.
// Expects the static server on :3000 over a FRESH out/ (commit e2edb9f).
// Sections independent (try/catch). Focus: the stamp PRESS as crescendo,
// discoverability of press + audit walk, and the one-moment ending.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "docs/design-lab/shots-w6judge";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";
const RECORD = { iso: "2026-07-18", label: "jul 18, 2026" };

const browser = await chromium.launch();
const log = (m) => console.log(m);
const settle = (page, ms = 1000) => page.waitForTimeout(ms);
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
  await settle(page, 900);
}
// Pause every running animation and seek to t ms (hold frames deterministically)
async function seekAll(page, t) {
  return page.evaluate((time) => {
    const names = [];
    for (const a of document.getAnimations()) {
      try {
        a.pause();
        a.currentTime = time;
        names.push(a.animationName || "(css)");
      } catch {}
    }
    return names;
  }, t);
}

/* ══════ A. FULL HOME JOURNEY — 7 chapters @1440 ═══════════════════ */
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 2600); /* hero entrance + day-arc warm */
  await page.screenshot({ path: `${OUT}/A-ch01-arrival.png` });
  const chapters = [
    ["who", "A-ch02-who"],
    ["path", "A-ch03-path"],
    ["automl", "A-ch04-automl"],
    ["work", "A-ch05-work"],
    ["values", "A-ch06-values"],
    ["gate", "A-ch07-gate"],
  ];
  for (const [anchor, name] of chapters) {
    await scrollToId(page, anchor, 60);
    await settle(page, 800);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    log(`A ✓ ${name}`);
  }
  await ctx.close();
  log("A ✓ home journey");
} catch (e) {
  log("A ✗ home journey FAILED: " + e.message);
}

/* ══════ B. THE STAMP PRESS — scrubbed impact sequence @1440 ═══════
   Fresh localStorage. Click once, pause instantly, seek across the
   750ms press: rest → wind-up(120) → THUNK(315) → WET(340) → held(430)
   → rebound(550) → settle(750). Tight crop on the stamp + a full ¶07
   frame at the wet peak. Also read computed ink color to confirm ember. */
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 1600);
  await scrollToId(page, "gate", 50);
  await settle(page, 700);

  const stamp = page.locator("[data-stamp]:visible").first();
  const box0 = await stamp.boundingBox();
  const clip = box0 && {
    x: Math.max(0, box0.x - 60),
    y: Math.max(0, box0.y - 70),
    width: 400,
    height: 360,
  };
  // resting awaiting frame (label should read "press here to sign")
  if (clip) await page.screenshot({ path: `${OUT}/B-press-t0000-await.png`, clip });

  // read the awaiting label + resting ink color
  const awaitInfo = await page.evaluate(() => {
    const b = document.querySelector("[data-stamp]");
    const await_ = b?.querySelector(".stamp-awaiting");
    const sig = b?.querySelector("[data-thread-sig]");
    return {
      sigText: sig?.textContent?.trim(),
      awaitColor: await_ ? getComputedStyle(await_).color : null,
    };
  });
  log(`B awaiting label="${awaitInfo.sigText}" awaitColor=${awaitInfo.awaitColor}`);

  // start the press via a real DOM click, then pause+scrub
  await page.evaluate(() =>
    document.querySelector("[data-stamp]:not([data-inked])")?.click()
  );
  await settle(page, 30);
  const frames = [
    [120, "t0120-windup"],
    [315, "t0315-thunk"],
    [340, "t0340-wet"],
    [430, "t0430-held"],
    [550, "t0550-rebound"],
    [750, "t0750-settle"],
  ];
  for (const [t, name] of frames) {
    const names = await seekAll(page, t);
    if (clip) await page.screenshot({ path: `${OUT}/B-press-${name}.png`, clip });
    if (t === 340) {
      // full ¶07 frame at the wet peak — ember in context vs whole gate
      await page.screenshot({ path: `${OUT}/B-press-wet-fullgate.png` });
      // sample computed ink colors + saturation across ¶07 for loudness check
      const chroma = await page.evaluate(() => {
        const toHsl = (rgb) => {
          const m = rgb.match(/\d+(\.\d+)?/g);
          if (!m) return null;
          const [r, g, b] = m.map(Number).map((v) => v / 255);
          const mx = Math.max(r, g, b),
            mn = Math.min(r, g, b),
            d = mx - mn,
            l = (mx + mn) / 2;
          const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
          return {
            rgb,
            chroma: +d.toFixed(3),
            sat: +s.toFixed(3),
            light: +l.toFixed(3),
          };
        };
        const inked = document.querySelector("[data-stamp] .stamp-inked");
        const pick = (sel) => {
          const el = document.querySelector(sel);
          return el ? getComputedStyle(el).color : null;
        };
        return {
          emberInk: toHsl(inked ? getComputedStyle(inked).color : ""),
          giantName: toHsl(pick("#gate h2, [id='gate'] h2") || ""),
        };
      });
      log(`B ember=${JSON.stringify(chroma.emberInk)}`);
      log(`B giantName=${JSON.stringify(chroma.giantName)}`);
    }
    log(`B ✓ press ${name} anims=[${names.join(",")}]`);
  }
  // let it dry fully (resume + settle) and shoot the dried inked plate
  await page.evaluate(() => {
    for (const a of document.getAnimations()) {
      try {
        a.play();
        a.finish();
      } catch {}
    }
  });
  await settle(page, 900);
  if (clip) await page.screenshot({ path: `${OUT}/B-press-dried.png`, clip });
  await page.screenshot({ path: `${OUT}/B-press-dried-fullgate.png` });
  await ctx.close();
  log("B ✓ stamp press");
} catch (e) {
  log("B ✗ stamp press FAILED: " + e.message);
}

/* ══════ C. DISCOVERABILITY — the notice beat + hover affordances ══ */
// C1: fresh ¶07 — the awaiting stamp's one-time notice beat (scrub peak)
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 1400);
  // approach the gate so the IntersectionObserver (threshold .6) fires
  await scrollToId(page, "values", 40);
  await settle(page, 500);
  await page.evaluate(() => {
    const el = document.getElementById("gate");
    if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await settle(page, 120); /* beat is arming; catch it mid-flight */
  const stamp = page.locator("[data-stamp]:visible").first();
  const box = await stamp.boundingBox();
  const clip = box && {
    x: Math.max(0, box.x - 60),
    y: Math.max(0, box.y - 70),
    width: 400,
    height: 360,
  };
  // scrub the notice animation to its 45% peak (1150ms * .45 ≈ 520ms)
  const names = await seekAll(page, 520);
  if (clip) await page.screenshot({ path: `${OUT}/C1-notice-peak.png`, clip });
  log(`C1 ✓ notice beat anims=[${names.join(",")}]`);
  await ctx.close();
} catch (e) {
  log("C1 ✗ FAILED: " + e.message);
}

// C2: hover affordance — awaiting outline firms under the hand
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 1400);
  await scrollToId(page, "gate", 50);
  await settle(page, 1400); /* let any notice beat finish */
  const stamp = page.locator("[data-stamp]:visible").first();
  const box = await stamp.boundingBox();
  const clip = box && {
    x: Math.max(0, box.x - 60),
    y: Math.max(0, box.y - 70),
    width: 400,
    height: 360,
  };
  await stamp.hover();
  await settle(page, 500);
  if (clip) await page.screenshot({ path: `${OUT}/C2-stamp-hover.png`, clip });
  log("C2 ✓ stamp hover");
  await ctx.close();
} catch (e) {
  log("C2 ✗ FAILED: " + e.message);
}

// C3: case-file audit control — resting "walk the N claims" + hover pen-nib
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/projects/automl/`, { waitUntil: "networkidle" });
  await settle(page, 1200);
  const run = page.locator("[data-audit-run]").first();
  await run.scrollIntoViewIfNeeded();
  await settle(page, 700);
  const box = await run.boundingBox();
  const clip = box && {
    x: Math.max(0, box.x - 30),
    y: Math.max(0, box.y - 40),
    width: Math.min(1440, (box.width || 300) + 120),
    height: 150,
  };
  if (clip) await page.screenshot({ path: `${OUT}/C3-audit-resting.png`, clip });
  const label = await run.textContent();
  await run.hover();
  await settle(page, 500);
  if (clip) await page.screenshot({ path: `${OUT}/C3-audit-hover.png`, clip });
  log(`C3 ✓ audit control resting label=${JSON.stringify(label?.trim())}`);
  await ctx.close();
} catch (e) {
  log("C3 ✗ FAILED: " + e.message);
}

/* ══════ D. THE ONE-MOMENT ENDING — real trail written back ════════
   Open 2 case files, walk automl's audit, return home, press the stamp.
   The manifest must write the visitor's OWN trail under the dried ember. */
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/projects/jobtracker/`, { waitUntil: "networkidle" });
  await settle(page, 1100);
  await page.goto(`${BASE}/projects/automl/`, { waitUntil: "networkidle" });
  await settle(page, 1100);
  await page.locator("[data-audit-run]").first().click();
  await page
    .locator("[data-audit-settled]")
    .first()
    .waitFor({ state: "visible", timeout: 15000 });
  await settle(page, 900);
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 1500);
  await scrollToId(page, "gate", 40);
  await page.evaluate(() =>
    document.querySelector("[data-stamp]:not([data-inked])")?.click()
  );
  await settle(page, 1600); /* full press + dry */
  const manifestText = await page
    .locator(".on-file-manifest")
    .first()
    .textContent()
    .catch(() => "(none)");
  await page.screenshot({ path: `${OUT}/D-ending-full.png` });
  const stamp = page.locator("[data-stamp]:visible").first();
  const box = await stamp.boundingBox();
  if (box) {
    await page.screenshot({
      path: `${OUT}/D-ending-crop.png`,
      clip: {
        x: Math.max(0, box.x - 70),
        y: Math.max(0, box.y - 80),
        width: Math.min(1440 - Math.max(0, box.x - 70), 560),
        height: 480,
      },
    });
  }
  log(`D ✓ one-moment ending manifest=${JSON.stringify(manifestText?.trim())}`);
  await ctx.close();
} catch (e) {
  log("D ✗ FAILED: " + e.message);
}

/* ══════ E. CASE FILES — audit walk payoff + citation hover ═══════ */
for (const slug of ["automl", "jobtracker"]) {
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/projects/${slug}/`, { waitUntil: "networkidle" });
    await settle(page, 1200);
    await scrollToId(page, "validation", 90);
    await page.screenshot({ path: `${OUT}/E-${slug}-prewalk.png` });
    await page.locator("[data-audit-run]").first().click();
    await page
      .locator("[data-audit-settled]")
      .first()
      .waitFor({ state: "visible", timeout: 15000 });
    await settle(page, 1200);
    await scrollToId(page, "validation", 90);
    await page.screenshot({ path: `${OUT}/E-${slug}-postwalk.png` });
    // citation hover on a fresh load
    await page.evaluate(() => window.localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });
    await settle(page, 1500);
    const row = page.locator("[data-receipt-row][data-cites]").first();
    await row.scrollIntoViewIfNeeded();
    await settle(page, 800);
    await row.hover();
    await settle(page, 900);
    const box = await row.boundingBox();
    await page.screenshot({
      path: `${OUT}/E-${slug}-citation-hover.png`,
      clip: { x: 0, y: Math.max(0, (box?.y ?? 200) - 240), width: 1440, height: 580 },
    });
    log(`E ✓ ${slug}`);
    await ctx.close();
  } catch (e) {
    log(`E ✗ ${slug} FAILED: ` + e.message);
  }
}

/* ══════ F. MOBILE 390 — hero, gate/compact stamp seat, case file ═ */
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
  await page.screenshot({ path: `${OUT}/F-mob-hero.png` });
  await scrollToId(page, "gate", 30);
  await settle(page, 900);
  await page.screenshot({ path: `${OUT}/F-mob-gate.png` });
  // press the compact stamp and dry it
  await page.evaluate(() =>
    document.querySelector("[data-stamp]:not([data-inked])")?.click()
  );
  await settle(page, 1500);
  await page.screenshot({ path: `${OUT}/F-mob-gate-inked.png` });
  await page.goto(`${BASE}/projects/automl/`, { waitUntil: "networkidle" });
  await settle(page, 1200);
  await scrollToId(page, "validation", 40);
  await page.screenshot({ path: `${OUT}/F-mob-automl-validation.png` });
  await ctx.close();
  log("F ✓ mobile");
} catch (e) {
  log("F ✗ mobile FAILED: " + e.message);
}

/* ══════ G. REDUCED MOTION — the ending as a designed static object ═
   The ember APPROVED must still be present (colour isn't motion). We
   seed the approved state so the dried plate is what a returning
   reduced-motion visitor sees; and a fresh reduced-motion gate too. */
try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await settle(page, 1200);
  await scrollToId(page, "gate", 50);
  await page.screenshot({ path: `${OUT}/G-reduced-gate-fresh.png` });
  // click (static swap, no thunk) → ember must still appear
  await page.evaluate(() =>
    document.querySelector("[data-stamp]:not([data-inked])")?.click()
  );
  await settle(page, 600);
  const stamp = page.locator("[data-stamp]:visible").first();
  const box = await stamp.boundingBox();
  const clip = box && {
    x: Math.max(0, box.x - 60),
    y: Math.max(0, box.y - 70),
    width: 400,
    height: 360,
  };
  if (clip) await page.screenshot({ path: `${OUT}/G-reduced-inked-crop.png`, clip });
  await page.screenshot({ path: `${OUT}/G-reduced-gate-inked.png` });
  const inkedColor = await page.evaluate(() => {
    const el = document.querySelector("[data-stamp] .stamp-inked");
    const b = document.querySelector("[data-stamp]");
    return {
      color: el ? getComputedStyle(el).color : null,
      inked: b?.hasAttribute("data-inked"),
      inkedOpacity: el ? getComputedStyle(el).opacity : null,
    };
  });
  log(`G reduced inked=${JSON.stringify(inkedColor)}`);
  await ctx.close();
  log("G ✓ reduced motion");
} catch (e) {
  log("G ✗ reduced motion FAILED: " + e.message);
}

await browser.close();
log("=== W6 JUDGE HARNESS DONE ===");
