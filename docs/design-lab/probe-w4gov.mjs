/**
 * F72 + F73 probe — the governor downshift, driven for real.
 *
 * Needs a probes build: `NEXT_PUBLIC_TEST_PROBES=1 next build`, which is
 * the only build that installs `window.__frameGovernor` (F74).
 *
 * F72 — the ledger's scenario, exactly: scroll past the human gate, then
 * force core→print with four catastrophic frames. The engine unmounts,
 * the static rules draw `.pipeline-edge` to the gate and paint the bead
 * clay unconditionally; the question is where the TOKEN ends up. A bead
 * parked at `1.0 ingest` under a fully-drawn rail is the fault.
 *
 * F73 — a single burst must not brand the tab. After the downshift,
 * reload and report the tier the next page starts at, then report
 * whether any amount of smooth scrolling can get back.
 *
 * Usage: PORT=3200 node docs/design-lab/probe-w4gov.mjs [tag]
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
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();
const report = {};

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const readToken = () =>
  page.evaluate(() => {
    const token = document.querySelector(".pipeline-token");
    const bead = document.querySelector(".pipeline-token-bead");
    const edge = document.querySelector(".pipeline-edge");
    if (!token || !bead) return { error: "no token" };
    const t = getComputedStyle(token).transform;
    return {
      ty: t && t !== "none" ? Math.round(parseFloat(t.split(",")[5])) : 0,
      halted: token.classList.contains("is-halted"),
      beadFill: getComputedStyle(bead).fill,
      edgeDashoffset: edge ? getComputedStyle(edge).strokeDashoffset : null,
      tier: document.documentElement.dataset.tier,
      motionOff: document.documentElement.hasAttribute("data-motion-off"),
    };
  });

/* Walk to just past the human gate. */
await page.evaluate(() => {
  document.documentElement.style.scrollBehavior = "auto";
});
for (const y of [2600, 3000, 3400, 3800, 4050]) {
  await page.evaluate((to) => window.scrollTo(0, to), y);
  await page.waitForTimeout(200);
}
report.atGate = await readToken();
await page.screenshot({ path: path.join(OUT, `${TAG}-gov-01-at-gate.png`) });

/* Four catastrophic frames inside an active scroll window: the ≥8 line. */
report.beforeInject = await page.evaluate(
  () => window.__frameGovernor?.state() ?? { missing: true }
);
await page.evaluate(() => {
  window.dispatchEvent(new Event("scroll"));
  for (let i = 0; i < 4; i += 1) window.__frameGovernor.injectFrame(200);
});
await page.waitForTimeout(1200);
report.afterInject = await page.evaluate(() =>
  window.__frameGovernor.state()
);
report.afterDownshift = await readToken();
await page.screenshot({ path: path.join(OUT, `${TAG}-gov-02-downshift.png`) });

/* F73: what does the NEXT load in this tab start at, and can it recover? */
await page.goto(`${BASE}/evidence/`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
report.nextPageTier = await page.evaluate(() => ({
  tier: document.documentElement.dataset.tier,
  cap: sessionStorage.getItem("study-tier-cap"),
}));

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
/* Scroll smoothly for a good while — under the shipped rule this can
   never restore anything, because the cap is a permanent floor. */
await page.evaluate(async () => {
  document.documentElement.style.scrollBehavior = "auto";
  for (let i = 0; i < 120; i += 1) {
    window.scrollTo(0, 200 + i * 12);
    await new Promise((r) => requestAnimationFrame(() => r()));
  }
});
await page.waitForTimeout(1500);
report.afterSmoothScrolling = await page.evaluate(() => ({
  tier: document.documentElement.dataset.tier,
  cap: sessionStorage.getItem("study-tier-cap"),
  state: window.__frameGovernor?.state() ?? null,
}));

await context.close();
await browser.close();
server.kill();
fs.writeFileSync(
  path.join(OUT, `probe-gov-${TAG}.json`),
  JSON.stringify(report, null, 2)
);
console.log(JSON.stringify(report, null, 2));
