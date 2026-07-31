// HEADER ROUNDS 7/8 — the measurement probe for the nameplate candidates.
//
// Serves docs/design-lab/candidates over http (the wasm needs it), then for
// each candidate × browser × viewport measures the four claims the brief
// requires to terminate in a number:
//   1. LCP           — buffered largest-contentful-paint entries (element + ms)
//   2. rAF census    — requestAnimationFrame calls in a 3 s window AFTER the
//                      performance settles (the §F3 contract: no idle app work)
//   3. A7 diff       — screenshot of the settled motion world vs the ?static=1
//                      world, pixel-diffed with sharp; the static form must BE
//                      the final frame
//   4. errors        — console errors / page errors, which must be zero
//
// Run:  node docs/design-lab/probe-header7.mjs      (round 7 — a/b/c, as ever)
//       node docs/design-lab/probe-header7.mjs 8    (round 8 — d/e, same rig)
// (kills its own server; writes shots to docs/design-lab/shots-header<N>/)

import { chromium, webkit } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import sharp from "sharp";

const ROUND = process.argv[2] === "8" ? 8 : 7;
const ROOT = new URL("..", import.meta.url).pathname; // docs/
const CAND = ROOT + "design-lab/candidates";
const OUT = ROOT + `design-lab/shots-header${ROUND}`;
mkdirSync(OUT, { recursive: true });

const PORT = 4417;
const server = spawn("npx", ["serve", CAND, "-l", String(PORT)], {
  stdio: "ignore",
  detached: false,
});
await new Promise((r) => setTimeout(r, 2500));

const PAGES = ROUND === 8
  ? [
      ["d", "header-d-ensemble"],
      ["e", "header-e-pour"],
    ]
  : [
      ["a", "header-a-hand"],
      ["b", "header-b-compositor"],
      ["c", "header-c-reader"],
    ];
const SEATS = [
  ["chromium-desk", chromium, { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }],
  ["webkit-desk", webkit, { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 }],
  [
    "webkit-mobile",
    webkit,
    {
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    },
  ],
];

const report = [];
const log = (o) => {
  report.push(o);
  console.log(JSON.stringify(o));
};

async function measure(name, browserType, ctxOpts, tag, file) {
  const browser = await browserType.launch();
  const url = `http://localhost:${PORT}/${file}`;

  /* —— motion world: LCP + errors + rAF census + settled shot —— */
  let ctx = await browser.newContext(ctxOpts);
  let page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message));
  await page.addInitScript(() => {
    window.__lcp = [];
    new PerformanceObserver((l) =>
      l.getEntries().forEach((e) =>
        window.__lcp.push({
          t: Math.round(e.startTime),
          size: e.size,
          el:
            (e.element &&
              (e.element.id ||
                e.element.className.toString().slice(0, 40) ||
                e.element.tagName)) ||
            e.url ||
            "?",
        })
      )
    ).observe({ type: "largest-contentful-paint", buffered: true });
    window.__rafCount = 0;
    window.__rafCounting = false;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => {
      if (window.__rafCounting) window.__rafCount++;
      return raf(cb);
    };
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(5200); // every choreography settles well within this
  const lcp = await page.evaluate(() => window.__lcp.at(-1) || null);
  await page.evaluate(() => {
    window.__rafCount = 0;
    window.__rafCounting = true;
  });
  await page.waitForTimeout(3000);
  const raf3s = await page.evaluate(() => {
    window.__rafCounting = false;
    return window.__rafCount;
  });
  const settledShot = `${OUT}/${tag}-${name}-settled.png`;
  await page.screenshot({ path: settledShot });
  await ctx.close();

  /* —— static world (?static=1): the A7 frame —— */
  ctx = await browser.newContext(ctxOpts);
  page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push("static: " + m.text()));
  page.on("pageerror", (e) => errors.push("static PAGEERROR " + e.message));
  await page.goto(url + "?static=1", { waitUntil: "networkidle" });
  await page.waitForTimeout(2600); // fonts + (candidate C) the wasm read
  const staticShot = `${OUT}/${tag}-${name}-static.png`;
  await page.screenshot({ path: staticShot });
  await ctx.close();
  await browser.close();

  /* —— pixel diff: static must equal the settled final frame —— */
  const a = await sharp(settledShot).raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(staticShot).raw().toBuffer({ resolveWithObject: true });
  let diffPx = -1,
    pct = -1;
  if (a.info.width === b.info.width && a.info.height === b.info.height) {
    diffPx = 0;
    const A = a.data,
      B = b.data,
      n = A.length;
    for (let i = 0; i < n; i += a.info.channels) {
      if (
        Math.abs(A[i] - B[i]) > 8 ||
        Math.abs(A[i + 1] - B[i + 1]) > 8 ||
        Math.abs(A[i + 2] - B[i + 2]) > 8
      )
        diffPx++;
    }
    pct = +((diffPx / (a.info.width * a.info.height)) * 100).toFixed(3);
  }
  log({ candidate: tag, seat: name, lcp, raf3s, diffPx, diffPct: pct, errors });
}

try {
  for (const [tag, file] of PAGES)
    for (const [name, bt, opts] of SEATS) await measure(name, bt, opts, tag, file);
} finally {
  server.kill();
  writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
  console.log("report → " + OUT + "/report.json");
}
