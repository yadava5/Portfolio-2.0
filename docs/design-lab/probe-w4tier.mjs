/**
 * F80 probe — is the print edition's one flourish actually visible?
 *
 * `html[data-tier="print"] [data-chapter] figure:has(> figcaption)` draws
 * a `color-mix(currentColor N%, transparent)` outline, and that is the
 * ENTIRE difference between the print edition and the static world it
 * sits on. The ledger measured it at 1.87:1 in chapters 06/07 — below
 * the 3:1 WCAG non-text bar, i.e. an authored edition nobody can see.
 *
 * This composites the outline over the paper each figure actually sits
 * on (day canvas for 01–05, the nightfall ground for 06/07) and reports
 * the contrast ratio per chapter, plus a census of garnish consumers.
 *
 * Usage: PORT=3200 node docs/design-lab/probe-w4tier.mjs [tag]
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const TAG = process.argv[2] ?? "after";
const PORT = process.env.PORT ?? "3200";
const BASE = `http://127.0.0.1:${PORT}`;
const OUT = path.join(process.cwd(), "docs/design-lab/shots-w4eng");
fs.mkdirSync(OUT, { recursive: true });

const server = spawn(process.execPath, ["tests/playwright/static-server.mjs"], {
  env: { ...process.env, PORT },
  stdio: "ignore",
});
await new Promise((r) => setTimeout(r, 2000));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
/* The print tier, seeded the way a session ceiling seeds it. */
await page.addInitScript(() => {
  window.sessionStorage.setItem("study-tier-cap", "print");
});
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const report = await page.evaluate(() => {
  /* `color-mix()` resolves to `color(srgb r g b / a)` with FRACTIONAL
     components, while plain colours come back as `rgb(r g b)` in 0–255.
     Reading both with one number-scrape silently divides the mixed
     stroke by 255 (measured: it turned a cream outline into near-black
     and reported 1.46:1 where the honest number is 3.81:1). */
  const parse = (s) => {
    const n = (s.match(/[\d.]+/g) ?? []).map(Number);
    if (!s.startsWith("color(")) return n;
    return [n[0] * 255, n[1] * 255, n[2] * 255, ...n.slice(3)];
  };
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const lum = ([r, g, b]) =>
    0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ratio = (a, b) => {
    const [hi, lo] = lum(a) >= lum(b) ? [lum(a), lum(b)] : [lum(b), lum(a)];
    return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
  };
  /* Walk up for the first non-transparent background — the paper the
     outline is actually drawn on. */
  const paperUnder = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const bg = parse(getComputedStyle(node).backgroundColor);
      if (bg.length >= 3 && (bg[3] === undefined || bg[3] > 0.9)) {
        return bg.slice(0, 3);
      }
      node = node.parentElement;
    }
    return parse(getComputedStyle(document.body).backgroundColor).slice(0, 3);
  };

  const rows = [];
  for (const fig of document.querySelectorAll("[data-chapter] figure")) {
    const style = getComputedStyle(fig);
    if (style.outlineStyle === "none") continue;
    const stroke = parse(style.outlineColor);
    if (stroke.length < 3) continue;
    const alpha = stroke[3] ?? 1;
    const paper = paperUnder(fig);
    /* The outline is a translucent stroke over the paper. */
    const composite = [0, 1, 2].map((i) =>
      Math.round(stroke[i] * alpha + paper[i] * (1 - alpha))
    );
    rows.push({
      chapter: fig.closest("[data-chapter]")?.dataset.chapter,
      outlineColor: style.outlineColor,
      paper: `rgb(${paper.join(", ")})`,
      composite: `rgb(${composite.join(", ")})`,
      ratio: ratio(composite, paper),
    });
  }
  return {
    tier: document.documentElement.dataset.tier,
    garnishConsumers: document.querySelectorAll("[data-tier-garnish]").length,
    outlinedFigures: rows.length,
    worst: rows.length ? Math.min(...rows.map((r) => r.ratio)) : null,
    rows,
  };
});

await page.evaluate(() => window.scrollTo(0, 8000));
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(OUT, `${TAG}-tier-print-dusk.png`) });
await page.evaluate(() => window.scrollTo(0, 3200));
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(OUT, `${TAG}-tier-print-day.png`) });

await browser.close();
server.kill();
fs.writeFileSync(
  path.join(OUT, `probe-tier-${TAG}.json`),
  JSON.stringify(report, null, 2)
);
console.log(JSON.stringify(report, null, 2));
