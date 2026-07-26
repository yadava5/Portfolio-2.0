// Fix round 4 — the narrow-width overflow probe.
//
// Fix round 3 measured the home page 3px wider than a 320px viewport (1px
// at 340) and recorded the cause without fixing it: the gate stamp's
// rotated bounding box. `probe-320-overflow.mjs` answers "what overflows"
// at one width; this one sweeps the four narrow stops the round targets
// and reports the number that has to be zero — scrollWidth − innerWidth —
// plus the offending element chains and, for the stamp specifically, its
// layout box vs its rotated bounding box, which is the whole fault.
//
// Usage: BASE=http://localhost:3400 node docs/design-lab/probe-fix4-overflow.mjs
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3400";
const WIDTHS = (process.env.WIDTHS ?? "320,340,360,390")
  .split(",")
  .map((w) => Number(w.trim()));
const PATHS = (process.env.PATHS ?? "/").split(",");

const browser = await chromium.launch();
const results = [];

for (const path of PATHS) {
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 844 } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1600);

    const measured = await page.evaluate(() => {
      const offenders = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > window.innerWidth + 0.5) {
          const chain = [];
          let node = el;
          while (node && node !== document.body && chain.length < 5) {
            const cls = String(
              node.className?.baseVal ?? node.className ?? ""
            ).split(" ")[0];
            chain.push(`${node.tagName}${cls ? "." + cls.slice(0, 20) : ""}`);
            node = node.parentElement;
          }
          offenders.push({
            chain: chain.join(" < "),
            right: Math.round(r.right),
            over: Math.round((r.right - window.innerWidth) * 10) / 10,
          });
        }
      }

      /* The stamp, measured both ways: offsetWidth is the LAYOUT box
         (what the column reserves), getBoundingClientRect().width is the
         ROTATED box (what the reader actually sees painted). The gap
         between them is the overflow budget the tilt spends. */
      const stampBoxes = [...document.querySelectorAll("[data-stamp]")]
        .filter((el) => el.offsetParent !== null)
        .map((el) => {
          const r = el.getBoundingClientRect();
          const plate = el.querySelector(".stamp-plate");
          return {
            layout: Math.round(el.offsetWidth * 10) / 10,
            rotated: Math.round(r.width * 10) / 10,
            plate: plate
              ? Math.round(plate.getBoundingClientRect().width * 10) / 10
              : null,
            right: Math.round(r.right * 10) / 10,
            transform: getComputedStyle(el).transform,
          };
        });

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        innerWidth: window.innerWidth,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        offenders: offenders.slice(0, 8),
        stampBoxes,
      };
    });

    results.push({ path, width, ...measured });
    await ctx.close();
  }
}

await browser.close();

console.log(JSON.stringify(results, null, 2));
console.log("\n--- overflow (scrollWidth − innerWidth) ---");
for (const r of results) {
  console.log(
    `${r.path} @ ${r.width}: ${r.overflow}px` +
      (r.offenders.length ? `  (${r.offenders.length} offender(s))` : "")
  );
}
const bad = results.filter((r) => r.overflow > 0);
console.log(
  bad.length === 0 ? "\nPASS — 0 overflow" : `\nFAIL — ${bad.length}`
);
process.exit(bad.length === 0 ? 0 : 1);
