// W7 visual verification — deeper strike, warmed invite label, legible date,
// manifest settle, and the (unchanged) thread finale into the stamp.
// Serves the prebuilt out/ via the repo's static server on :3000 first.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "docs/design-lab/shots-w7";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";
const log = (m) => console.log(m);
const settle = (page, ms) => page.waitForTimeout(ms);

const browser = await chromium.launch();

/** Scroll the gate chapter to center and let layout settle. */
async function toGate(page) {
  await page.evaluate(() => {
    const el = document.getElementById("gate");
    if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await settle(page, 1200);
}

try {
  // ── Pass 1: rest, warmed label, press → dried date zoom, manifest ──────
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 3, // crisp small text for the date-legibility read
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await settle(page, 1400);
    await toGate(page);

    const stamp = page.locator("[data-stamp]:visible").first();
    const box = await stamp.boundingBox();
    const clip = {
      x: Math.max(0, box.x - 70),
      y: Math.max(0, box.y - 80),
      width: 420,
      height: 380,
    };

    // A — the awaiting stamp at rest (warmed "press here to sign" label)
    await page.screenshot({ path: `${OUT}/A1-awaiting-rest.png`, clip });
    // A zoom on just the label band (y=130 in a 300x190 viewBox)
    const signBox = await stamp.locator(".stamp-sign").boundingBox();
    if (signBox) {
      await page.screenshot({
        path: `${OUT}/A2-invite-label-zoom.png`,
        clip: {
          x: Math.max(0, signBox.x - 24),
          y: Math.max(0, signBox.y - 16),
          width: Math.min(300, signBox.width + 48),
          height: signBox.height + 32,
        },
      });
    }
    const inviteFill = await stamp
      .locator(".stamp-sign")
      .evaluate((el) => getComputedStyle(el).fill);
    const groupColor = await stamp
      .locator(".stamp-awaiting")
      .evaluate((el) => getComputedStyle(el).color);
    log(`invite label fill=${inviteFill}  awaiting group color=${groupColor}`);

    // B — press for real, let it fully dry, zoom the top run/date line
    await stamp.click();
    await settle(page, 1200); // > 750ms strike: React clears is-inking, dried
    await page.screenshot({ path: `${OUT}/C1-inked-dried.png`, clip });

    const runLine = stamp.locator(".stamp-inked g:last-child text");
    const runBox = await runLine.boundingBox();
    if (runBox) {
      await page.screenshot({
        path: `${OUT}/C2-date-zoom.png`,
        clip: {
          x: Math.max(0, runBox.x - 30),
          y: Math.max(0, runBox.y - 18),
          width: Math.min(360, runBox.width + 60),
          height: runBox.height + 34,
        },
      });
    }
    const runText = await runLine.evaluate((el) => el.textContent);
    log(`dried run/date line reads: "${runText}"`);

    // D — the on-file manifest line, now signed (settle rides its arrival)
    const man = page.locator("[data-on-file]:visible").first();
    const manInfo = await man.evaluate((el) => ({
      text: el.textContent,
      settle: el.getAttribute("data-settle"),
      anim: getComputedStyle(el).animationName,
    }));
    const manBox = await man.boundingBox();
    if (manBox) {
      await page.screenshot({
        path: `${OUT}/D1-manifest-signed.png`,
        clip: {
          x: Math.max(0, manBox.x - 20),
          y: Math.max(0, manBox.y - 16),
          width: Math.min(420, manBox.width + 40),
          height: manBox.height + 32,
        },
      });
    }
    log(
      `manifest: settle=${manInfo.settle} anim=${manInfo.anim} text="${manInfo.text}"`
    );
    await ctx.close();
  }

  // ── Pass 2: the deepened strike, scrubbed frame-by-frame ───────────────
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    // Keep is-inking through the scrub: swallow the stamp's animationend so
    // React does not tear the animation down while we step currentTime.
    await page.addInitScript(() => {
      document.addEventListener(
        "animationend",
        (e) => {
          const t = e.target;
          if (t && t.closest && t.closest("[data-stamp]"))
            e.stopImmediatePropagation();
        },
        true
      );
    });
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await settle(page, 1400);
    await toGate(page);

    const stamp = page.locator("[data-stamp]:visible").first();
    const box = await stamp.boundingBox();
    const clip = {
      x: Math.max(0, box.x - 70),
      y: Math.max(0, box.y - 80),
      width: 420,
      height: 380,
    };
    await stamp.click();
    await settle(page, 45);

    const probe = (t) =>
      page.evaluate((time) => {
        const wanted = new Set(["stamp-press", "stamp-ink-in"]);
        for (const a of document.getAnimations()) {
          if (!wanted.has(a.animationName)) continue;
          try {
            a.pause();
            a.currentTime = time;
          } catch {}
        }
        const vis = [...document.querySelectorAll("[data-stamp]")].find(
          (b) => b.offsetParent !== null
        );
        const plate = vis?.querySelector(".stamp-plate");
        return plate ? getComputedStyle(plate).transform : null;
      }, t);

    const frames = [
      [0, "B0-rest"],
      [120, "B1-windup"],
      [315, "B2-thunk"],
      [415, "B3-held"],
      [560, "B4-rebound"],
      [745, "B5-settle"],
    ];
    for (const [t, name] of frames) {
      const tf = await probe(t);
      await page.screenshot({ path: `${OUT}/${name}.png`, clip });
      log(`strike ${name} @${t}ms  plate transform=${tf}`);
    }
    await ctx.close();
  }

  // ── Pass 3: the thread finale into the stamp (2b skipped — unchanged) ──
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await settle(page, 1200);
    // Scroll to the very bottom so segment 07 fully draws to the stamp.
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight)
    );
    await settle(page, 1400);
    const stamp = page.locator("[data-stamp]:visible").first();
    const box = await stamp.boundingBox();
    if (box) {
      await page.screenshot({
        path: `${OUT}/E1-thread-finale.png`,
        clip: {
          x: Math.max(0, box.x - 220),
          y: Math.max(0, box.y - 120),
          width: 620,
          height: 460,
        },
      });
    }
    const off = await page.evaluate(() => {
      const p = document.querySelector(
        "svg[data-thread-segment='07'] path.thread-past"
      );
      return p ? Number(getComputedStyle(p).strokeDashoffset) : null;
    });
    log(`finale: segment-07 past dashoffset=${off} (≈0 = drawn to the stamp)`);
    await ctx.close();
  }

  log("W7 shoot ✓ done");
} catch (e) {
  log("W7 shoot ✗ FAILED: " + e.message);
} finally {
  await browser.close();
}
