/* probe-lcp10.mjs — LCP + CLS on the real page, 1× and 4× CPU.
 *
 * The round-10 gate: the brief's baseline is 84ms at 1× / 216ms at 4×,
 * CLS 0.00001 — re-measured here after the relief port + nameplate
 * concurrency so the numbers are the same instrument before and after.
 * Five runs per throttle, median reported (single runs swing with
 * process scheduling).
 *
 * Usage: node docs/design-lab/probe-lcp10.mjs
 */
import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://127.0.0.1:3000/";
const RUNS = 5;

async function measure(rate) {
  const results = [];
  for (let i = 0; i < RUNS; i++) {
    const browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    /* LCP/CLS are observer-only surfaces: getEntriesByType() returns []
       for largest-contentful-paint (measured — the first cut of this
       probe read 0 everywhere), so the observers are installed before
       any document script runs, buffered. */
    await page.addInitScript(() => {
      window.__vitals = { lcp: 0, cls: 0 };
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) window.__vitals.lcp = e.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (!e.hadRecentInput) window.__vitals.cls += e.value ?? 0;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate });
    await page.goto(url, { waitUntil: "networkidle" });
    /* settle: the nameplate show is ~4.5s; CLS must include it */
    await page.waitForTimeout(5500);
    const vitals = await page.evaluate(() => window.__vitals);
    results.push(vitals);
    await browser.close();
  }
  results.sort((a, b) => a.lcp - b.lcp);
  const med = results[Math.floor(RUNS / 2)];
  const worstCls = Math.max(...results.map((r) => r.cls));
  return {
    rate: `${rate}x`,
    lcpMedianMs: Math.round(med.lcp * 10) / 10,
    clsWorst: Number(worstCls.toFixed(5)),
  };
}

for (const rate of [1, 4]) {
  console.log(JSON.stringify(await measure(rate)));
}
