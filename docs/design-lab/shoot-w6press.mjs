// W6 PRESS re-shoot v2 — debug-instrumented scrub of the stamp impact.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "docs/design-lab/shots-w6judge";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";
const browser = await chromium.launch();
const log = (m) => console.log(m);
const settle = (page, ms) => page.waitForTimeout(ms);

try {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  // Swallow animationend inside the stamp at capture phase so React never
  // removes is-inking mid-scrub. (Verified below that click still fires.)
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
  await settle(page, 1600);
  await page.evaluate(() => {
    const el = document.getElementById("gate");
    if (el) el.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await settle(page, 1300);

  const stamp = page.locator("[data-stamp]:visible").first();
  const box = await stamp.boundingBox();
  const clip = {
    x: Math.max(0, box.x - 60),
    y: Math.max(0, box.y - 70),
    width: 400,
    height: 360,
  };
  log(`stamp box=${JSON.stringify(box)}`);

  // Click the REAL visible button (auto-waits actionability).
  await stamp.click();
  await settle(page, 45);

  const probe = (t) =>
    page.evaluate((time) => {
      const wanted = new Set(["stamp-press", "stamp-ink-in", "stamp-await-out"]);
      const found = [];
      for (const a of document.getAnimations()) {
        const n = a.animationName;
        if (!wanted.has(n)) continue;
        try {
          a.pause();
          a.currentTime = time;
          found.push(`${n}@${Math.round(a.currentTime)}`);
        } catch {}
      }
      const btn = document.querySelector("[data-stamp]:not([display='none'])") ||
        document.querySelector("[data-stamp]");
      const vis = [...document.querySelectorAll("[data-stamp]")].find(
        (b) => b.offsetParent !== null
      );
      const inked = vis?.querySelector(".stamp-inked");
      const plate = vis?.querySelector(".stamp-plate");
      return {
        found,
        cls: vis?.className?.replace(/\s+/g, " ").slice(0, 90),
        dataInked: vis?.hasAttribute("data-inked"),
        inkOpacity: inked ? getComputedStyle(inked).opacity : null,
        tf: plate ? getComputedStyle(plate).transform : null,
      };
    }, t);

  const frames = [
    [40, "t0040-descend"],
    [120, "t0120-windup"],
    [315, "t0315-thunk"],
    [345, "t0345-wet"],
    [430, "t0430-heldwet"],
    [560, "t0560-rebound"],
    [745, "t0745-settle"],
  ];
  for (const [t, name] of frames) {
    const info = await probe(t);
    await page.screenshot({ path: `${OUT}/BP-${name}.png`, clip });
    log(
      `BP ${name}: found=[${info.found.join(",")}] cls="${info.cls}" inked=${info.dataInked} inkOp=${info.inkOpacity} tf=${info.tf?.slice(0, 34)}`
    );
  }
  await ctx.close();
  log("BP ✓ done");
} catch (e) {
  log("BP ✗ FAILED: " + e.message);
}
await browser.close();
