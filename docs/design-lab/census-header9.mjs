// HEADER ROUND 9 — the animation census for candidate D's refinement.
//
// The brief's two timing findings (five moves ≤200ms; peak nine concurrent
// moving parts) must terminate in a re-runnable command. This is it. It
// samples document.getAnimations({subtree:true}) every 40ms through the
// whole performance and reports:
//   1. the timeline    — every animation's start/end/duration, tagged with
//                        the machine it belongs to (data-census on the
//                        overlay groups; CSS animations report their name)
//   2. the concurrency — count of simultaneously-running animations,
//                        sampled every 100ms of document time
//   3. the short list  — every meaningful move under the 350ms floor
//                        (opacity-only appear/retire fades are listed but
//                        marked; the floor is for moves that carry meaning)
//
// Run:  node docs/design-lab/census-header9.mjs
//       node docs/design-lab/census-header9.mjs --file=header-d-ensemble

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";

const fileArg = process.argv.find((a) => a.startsWith("--file="));
const FILE = fileArg ? fileArg.split("=")[1] : "header-d-ensemble";
const ROOT = new URL("..", import.meta.url).pathname; // docs/
const PORT = 4431;
const server = spawn("npx", ["serve", ROOT + "design-lab/candidates", "-l", String(PORT)], {
  stdio: "ignore",
});
await new Promise((r) => setTimeout(r, 2500));

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.addInitScript(() => {
  window.__census = new Map();
  const describe = (anim) => {
    try {
      const t = anim.effect?.target;
      if (!t) return anim.animationName || "detached";
      const tag =
        t.closest?.("[data-census]")?.getAttribute("data-census") ||
        (t.classList?.contains("ch") ? "letter:" + (t.textContent || "?") : null) ||
        t.className?.baseVal ||
        t.className ||
        t.tagName;
      const name = anim.animationName ? `css:${anim.animationName}` : "waapi";
      const kf = anim.effect.getKeyframes?.() || [];
      const props = [...new Set(kf.flatMap((k) => Object.keys(k)))].filter(
        (p) => !["offset", "computedOffset", "easing", "composite"].includes(p)
      );
      return `${tag} · ${name} · ${props.join("+")}`;
    } catch {
      return "?";
    }
  };
  const t0 = performance.now();
  const poll = () => {
    const now = performance.now() - t0;
    for (const a of document.getAnimations({ subtree: true })) {
      if (a.playState !== "running" && a.playState !== "finished") continue;
      let rec = window.__census.get(a);
      if (!rec) {
        const timing = a.effect.getComputedTiming();
        rec = {
          what: describe(a),
          firstSeen: Math.round(now),
          delay: Math.round(timing.delay || 0),
          dur: Math.round(timing.duration || 0),
          start: null,
        };
        window.__census.set(a, rec);
      }
      // Pin start ONCE, at first sight of a live clock. Deriving it on
      // every poll is the bug this probe shipped with on its first run:
      // a finished animation's currentTime freezes at its end, so
      // `now − currentTime` GROWS each tick and every completed row's
      // start drifted to (removal-tick − duration). One whole census
      // was read before the artifact was caught.
      if (rec.start === null && a.currentTime !== null) {
        const timing = a.effect.getComputedTiming();
        rec.start = Math.round(now - a.currentTime + (timing.delay || 0));
        rec.dur = Math.round(timing.duration || 0);
      }
    }
    if (now < 10500) setTimeout(poll, 40);
    else window.__censusDone = true;
  };
  poll();
});

await page.goto(`http://localhost:${PORT}/${FILE}`, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__censusDone, null, { timeout: 15000 });

const rows = await page.evaluate(() =>
  [...window.__census.values()]
    .map((r) => ({ ...r, start: r.start ?? r.firstSeen, end: (r.start ?? r.firstSeen) + r.dur }))
    .sort((a, b) => a.start - b.start)
);
await browser.close();
server.kill();

// —— the timeline ————————————————————————————————————————————
console.log("start   end    dur    what");
for (const r of rows)
  console.log(
    String(r.start).padStart(5) +
      String(r.end).padStart(7) +
      String(r.dur).padStart(7) +
      "   " +
      r.what
  );

// —— the short list (<350ms) ——————————————————————————————————
const FLOOR = 350;
const short = rows.filter((r) => r.dur > 0 && r.dur < FLOOR);
console.log(`\nmoves under ${FLOOR}ms: ${short.length}`);
for (const r of short) {
  const fadeOnly = /· (waapi|css:\w+) · opacity$/.test(r.what);
  console.log(
    `  ${String(r.dur).padStart(4)}ms  ${r.what}${fadeOnly ? "   (opacity-only fade)" : "  ← MEANINGFUL"}`
  );
}

// —— concurrency, sampled every 100ms ————————————————————————
// Two readings: raw animation objects (how round 8 hit 26), and the
// metric that matches the eye — how many MACHINES are moving at once
// (distinct data-census tags; the transition layer counts as one).
const tMax = Math.max(...rows.map((r) => r.end));
const machineOf = (w) =>
  /^(dividers|road|dial|runner|bird)/.exec(w)?.[1] ??
  (/letter:|css:settype|css:rise|css:ruledraw|nameplate/.test(w) ? "transition" : "other");
console.log("\nconcurrency (objects | machines, per 100ms):");
let peak = 0, peakT = 0, peakM = 0, peakMT = 0;
for (let t = 0; t <= tMax; t += 100) {
  const live = rows.filter((r) => r.start <= t && r.end > t);
  const n = live.length;
  const machines = [...new Set(live.map((r) => machineOf(r.what)))]
    .filter((m) => m !== "transition" && m !== "other");
  if (n > peak) { peak = n; peakT = t; }
  if (machines.length > peakM) { peakM = machines.length; peakMT = t; }
  if (n > 0)
    console.log(
      String(t).padStart(5) + "ms  " + "#".repeat(n).padEnd(16) + String(n).padStart(3) +
      "   │ " + (machines.join(" ") || "·")
    );
}
console.log(`\npeak ${peak} objects @ ${peakT}ms · peak ${peakM} machines @ ${peakMT}ms` +
  ` · performance spans ${rows[0]?.start}–${tMax}ms`);
