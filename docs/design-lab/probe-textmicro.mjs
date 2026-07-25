// TEXT-MICRO probe — the garnish rail's two contracts, measured.
//
//  1. FRAME COST under 4× CPU throttle (the PERF-AUDIT bar): the three
//     heaviest cursor effects — the "Scroll." variable-axis press (the
//     one sanctioned axis reflow), the wet-line cascade, and the plate
//     tilt ride — each sampled with an in-page rAF meter while a real
//     pointer drives them. VERDICT: no frame past 32ms.
//  2. NO GARNISH LEAK: at Core and at Print (reduced motion) a hover
//     changes NOTHING — asserted twice, as computed style equality and
//     as byte-identical screenshot clips before/during hover.
//
// Needs the probes build (NEXT_PUBLIC_TEST_PROBES=1) served at :3300:
//   NEXT_PUBLIC_TEST_PROBES=1 NEXT_PUBLIC_BASE_PATH= npx next build --webpack
//   PORT=3300 node tests/playwright/static-server.mjs &
//   node docs/design-lab/probe-textmicro.mjs
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3300";
const OUT = "docs/design-lab/shots-textmicro";
mkdirSync(OUT, { recursive: true });

const SEL = {
  pressAxis: "#arrival [data-tier-garnish='press-axis']",
  wetLine: "#arrival [data-tier-garnish='wet-line']",
  rowPress: "#work a[data-tier-garnish='press']",
  tilt: "#gate [data-tier-garnish='tilt']",
  plate: "#gate [data-garnish-plate]",
};

const verdicts = [];
const fail = (m) => {
  verdicts.push({ ok: false, m });
  console.log(`  ✗ ${m}`);
};
const pass = (m) => {
  verdicts.push({ ok: true, m });
  console.log(`  ✓ ${m}`);
};

const browser = await chromium.launch();

/** Computed hover-relevant style of one element. */
const styleOf = (page, sel) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const c = getComputedStyle(el);
    return {
      fvs: c.fontVariationSettings,
      transform: c.transform,
      textShadow: c.textShadow,
      color: c.color,
    };
  }, sel);

/** Start / stop an in-page rAF delta meter (measurement page only). */
const meterStart = (page) =>
  page.evaluate(() => {
    window.__tmFrames = [];
    let last = performance.now();
    const loop = (t) => {
      window.__tmFrames.push(t - last);
      last = t;
      window.__tmRaf = requestAnimationFrame(loop);
    };
    window.__tmRaf = requestAnimationFrame(loop);
  });
const meterStop = (page) =>
  page.evaluate(() => {
    cancelAnimationFrame(window.__tmRaf);
    return window.__tmFrames.slice(3); /* drop warm-up frames */
  });

const stats = (frames) => {
  const sorted = [...frames].sort((a, b) => a - b);
  return {
    n: frames.length,
    max: Math.max(...frames),
    p95: sorted[Math.floor(sorted.length * 0.95)],
    over32: frames.filter((f) => f > 32).length,
  };
};

try {
  /* ── FULL TIER, 4× CPU: frame cost of the three heaviest effects ── */
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1600); /* hero entrance retires (~1.1s) */
  await page.evaluate(() => window.__frameGovernor?.promote());
  await page.waitForFunction(
    () => document.documentElement.dataset.tier === "full"
  );
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  const results = {};

  /* Input is CDP-only inside a metered window (page.mouse) — a
     locator.hover() would run Playwright's injected utility script on
     the page's own main thread and bill the harness to the effect. */

  /* (a) the variable-axis press — hover in, hold, release */
  {
    const box = await page.locator(SEL.pressAxis).boundingBox();
    await meterStart(page);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 4,
    });
    await page.waitForTimeout(700); /* axis in (320ms) + settle */
    await page.mouse.move(10, 500, { steps: 4 });
    await page.waitForTimeout(700); /* axis out (520ms) + settle */
    results.pressAxis = stats(await meterStop(page));
  }

  /* (b) the wet-line cascade — in and out */
  {
    const box = await page.locator(SEL.wetLine).boundingBox();
    await meterStart(page);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 4,
    });
    await page.waitForTimeout(600);
    await page.mouse.move(10, 500, { steps: 4 });
    await page.waitForTimeout(700);
    results.wetLine = stats(await meterStop(page));
  }

  /* (c) the plate tilt — a full pointer ride across the name */
  {
    await page.evaluate(() =>
      document
        .querySelector("#gate")
        .scrollIntoView({ behavior: "instant", block: "center" })
    );
    await page.waitForTimeout(900);
    const box = await page.locator(SEL.plate).boundingBox();
    await meterStart(page);
    await page.mouse.move(box.x + 10, box.y + 10);
    await page.mouse.move(box.x + box.width - 10, box.y + 10, { steps: 25 });
    await page.mouse.move(
      box.x + box.width / 2,
      box.y + box.height - 8,
      { steps: 25 }
    );
    await page.mouse.move(box.x - 60, box.y - 60, { steps: 10 });
    await page.waitForTimeout(600); /* settle flat */
    results.tilt = stats(await meterStop(page));
  }

  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });

  for (const [name, s] of Object.entries(results)) {
    const line = `${name}: n=${s.n} max=${s.max.toFixed(1)}ms p95=${s.p95.toFixed(1)}ms >32ms=${s.over32}`;
    if (s.max <= 32) pass(`4×-throttle ${line}`);
    else fail(`4×-throttle frame budget blown — ${line}`);
  }

  /* Full-tier honesty: the press really is armed (guards the leak test
     below against a silently dead rail proving a vacuous truth). */
  {
    await page.locator(SEL.pressAxis).scrollIntoViewIfNeeded();
    await page.locator(SEL.pressAxis).hover();
    await page.waitForTimeout(500);
    const s = await styleOf(page, SEL.pressAxis);
    if (s.fvs.includes("432") && s.transform === "none")
      pass("full: the axis press answers the cursor (wght 432, no layer)");
    else fail(`full: press did not arm — ${JSON.stringify(s)}`);
    if (s.color === "rgb(38, 35, 28)")
      pass("full: hover ink is still --color-ink — AA arithmetic unchanged");
    else fail(`full: hover changed the ink color — ${s.color}`);
  }
  await ctx.close();

  /* ── CORE and PRINT: hover must change nothing, twice over ── */
  for (const world of ["core", "print"]) {
    const wctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: world === "print" ? "reduce" : "no-preference",
    });
    const wpage = await wctx.newPage();
    await wpage.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await wpage.waitForTimeout(1600);
    const stamped = await wpage.evaluate(
      () => document.documentElement.dataset.tier
    );
    if (stamped !== world) fail(`${world}: tier stamped ${stamped}`);

    for (const [name, sel] of Object.entries(SEL)) {
      if (name === "plate") continue; /* covered via tilt's region */
      await wpage
        .locator(sel)
        .first()
        .evaluate((el) =>
          el.scrollIntoView({ behavior: "instant", block: "center" })
        );
      /* Let the world SETTLE before the before-shot: the core world's
         entrance tweens (~1s) and the day-arc's scrub lag both keep
         easing after an instant jump, and either would forge a pixel
         "leak" that is really the resting page still arriving. */
      await wpage.waitForTimeout(1600);
      const before = await styleOf(wpage, sel);
      const clip = await wpage.locator(sel).first().boundingBox();
      const pad = 24;
      const shotBox = {
        x: Math.max(0, clip.x - pad),
        y: Math.max(0, clip.y - pad),
        width: clip.width + pad * 2,
        height: clip.height + pad * 2,
      };
      const shotBefore = await wpage.screenshot({ clip: shotBox });
      await wpage.locator(sel).first().hover();
      await wpage.waitForTimeout(450);
      const during = await styleOf(wpage, sel);
      const shotDuring = await wpage.screenshot({ clip: shotBox });
      const styleSame = JSON.stringify(before) === JSON.stringify(during);
      const pixelSame = shotBefore.equals(shotDuring);
      if (styleSame && pixelSame)
        pass(`${world}: ${name} hover-inert (styles + pixels identical)`);
      else
        fail(
          `${world}: ${name} LEAKED — styleSame=${styleSame} pixelSame=${pixelSame} ` +
            JSON.stringify({ before, during })
        );
      await wpage.mouse.move(5, 5);
    }
    await wctx.close();
  }
} finally {
  await browser.close();
}

writeFileSync(
  `${OUT}/probe-textmicro.json`,
  JSON.stringify(verdicts, null, 2)
);
const failed = verdicts.filter((v) => !v.ok).length;
console.log(
  failed === 0
    ? `\nALL ${verdicts.length} VERDICTS PASS`
    : `\n${failed}/${verdicts.length} VERDICTS FAILED`
);
process.exit(failed === 0 ? 0 : 1);
