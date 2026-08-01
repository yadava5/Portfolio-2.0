// W5 round-B entrance sequencing probe: deterministic frames of the
// first 1.5s at 0.15s intervals. CSS animations are paused and SOUGHT
// (document.getAnimations currentTime), so each frame is the exact
// t-millisecond state — no screenshot-latency skew. The probe also
// logs the numeric truth per frame: headline ink color, headline
// opacity, byline mask presence/stipple radius.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const OUT = "docs/design-lab/shots-w5";
mkdirSync(OUT, { recursive: true });
const BASE = "http://localhost:3000";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();

/* Probe-only: keep the entrance world alive so seeking works at
   leisure (TextMotion normally drops data-motion-ready at 1.2s). */
await page.addInitScript(() => {
  const orig = Element.prototype.removeAttribute;
  Element.prototype.removeAttribute = function (name) {
    if (name === "data-motion-ready") return;
    return orig.call(this, name);
  };
});

await page.goto(`${BASE}/`, { waitUntil: "load" });
await page.waitForTimeout(300); /* fonts/hydration beat */

for (let t = 0; t <= 1500; t += 150) {
  const probe = await page.evaluate((time) => {
    for (const a of document.getAnimations()) {
      /* Scroll-driven (progress-based) animations cannot take absolute
         times — the load entrance is document-timeline only. */
      try {
        a.pause();
        a.currentTime = time;
      } catch {
        a.play();
      }
    }
    const line3 = document.querySelector("h1 .hero-enter-headline:last-child");
    const byline = document.querySelector(".hero-enter-stipple");
    const s3 = line3 ? getComputedStyle(line3) : null;
    const sb = byline ? getComputedStyle(byline) : null;
    return {
      headlineColor: s3?.color,
      headlineOpacity: s3?.opacity,
      headlineShadow: s3?.textShadow,
      bylineOpacity: sb?.opacity,
      stippleR: sb?.getPropertyValue("--stipple-r").trim(),
      masked: sb ? sb.webkitMaskImage !== "none" || sb.maskImage !== "none" : null,
    };
  }, t);
  await page.screenshot({
    path: `${OUT}/b-entrance-t${String(t).padStart(4, "0")}.png`,
    clip: { x: 0, y: 90, width: 1440, height: 640 },
  });
  console.log(
    `t=${String(t).padStart(4, " ")}ms  h1-line3 color=${probe.headlineColor} op=${probe.headlineOpacity} shadow=${probe.headlineShadow}  byline op=${probe.bylineOpacity} stipple-r=${probe.stippleR || "(settled)"} masked=${probe.masked}`
  );
}

await browser.close();
