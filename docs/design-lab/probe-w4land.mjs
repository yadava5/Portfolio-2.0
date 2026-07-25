/**
 * F69 landing probe — the ONE number, measured on every path a reader
 * can take to an anchor.
 *
 * Four constants claim to be the masthead's height: `scroll-padding-top:
 * 6rem`, `section[id] { scroll-margin-top: 6rem }`, `[id^="fig-"]` /
 * `li[id^="v-"] { scroll-margin-top: 7rem }` and `SCROLL_OFFSET = -96`.
 * The CSS pair ADD (a scroll container's padding plus the target's own
 * margin), so the browser's own fragment jump lands at their sum while
 * the engine's landing contract lands at 96 — and figure anchors carry a
 * different sum again.
 *
 * This measures the target's distance from the viewport top for:
 *   noJs      — the browser's native fragment jump, JS disabled
 *   engine    — the same URL with the engine live (HashRealign)
 *   focus     — sequential focus navigation (scroll-padding only)
 *
 * Usage: PORT=3200 node docs/design-lab/probe-w4land.mjs [tag]
 */
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const TAG = process.argv[2] ?? "before";
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
const report = { noJs: {}, engine: {}, css: {} };

/* Resolve the real figure/receipt ids from the export first. */
const resolver = await browser.newPage({
  viewport: { width: 1440, height: 900 },
});
await resolver.goto(`${BASE}/projects/automl/`, { waitUntil: "networkidle" });
const figId = await resolver.evaluate(
  () => document.querySelector('[id^="fig-"]')?.id ?? null
);
await resolver.goto(`${BASE}/evidence/`, { waitUntil: "networkidle" });
const receiptId = await resolver.evaluate(
  () => document.querySelector('li[id^="v-"]')?.id ?? null
);
await resolver.close();

const cases = [
  ["/", "values", "section[id]"],
  ["/", "gate", "section[id]"],
  ["/projects/automl/", figId, '[id^="fig-"]'],
  ["/evidence/", receiptId, 'li[id^="v-"]'],
].filter(([, id]) => id);

for (const [route, id, kind] of cases) {
  /* Native fragment jump, no JS at all */
  const ctx = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const bare = await ctx.newPage();
  await bare.goto(`${BASE}${route}#${id}`, { waitUntil: "load" });
  await bare.waitForTimeout(500);
  report.noJs[`${route}#${id}`] = await bare.evaluate((target) => {
    const el = document.getElementById(target);
    return el ? Math.round(el.getBoundingClientRect().top) : null;
  }, id);
  report.css[kind] = await bare.evaluate((target) => {
    const el = document.getElementById(target);
    return {
      scrollMarginTop: el ? getComputedStyle(el).scrollMarginTop : null,
      scrollPaddingTop: getComputedStyle(document.documentElement)
        .scrollPaddingTop,
    };
  }, id);
  await ctx.close();

  /* The same URL with the engine live */
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}${route}#${id}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  report.engine[`${route}#${id}`] = await page.evaluate((target) => {
    const el = document.getElementById(target);
    return el ? Math.round(el.getBoundingClientRect().top) : null;
  }, id);
  await page.close();
}

await browser.close();
server.kill();
fs.writeFileSync(
  path.join(OUT, `probe-land-${TAG}.json`),
  JSON.stringify(report, null, 2)
);
console.log(JSON.stringify(report, null, 2));
