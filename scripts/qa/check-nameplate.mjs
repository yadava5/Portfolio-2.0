/**
 * The nameplate's four load-bearing invariants, asserted against the built
 * page rather than the source.
 *
 * Every one of these was a shipped defect on 2026-07-31, and every one was
 * invisible to the checks in place at the time. The reason is worth stating,
 * because it is the whole design of this file: the obvious check — "is the
 * overlay the same width as the type?" — passes for ALL of them. It passes on
 * a page that performs the name on an infinite loop, because each repeat
 * re-measures correctly. It passes at the one instant you sample, while the
 * type is sliding underneath. So each assertion here is written against the
 * thing that actually broke, sampled where it broke:
 *
 *   1 · ONE performance.        A resize the run itself caused was queued as
 *                               a rebuild, which resized the plate again:
 *                               five performances in 22s, forever.
 *   2 · The overlay is not      .np-plate is the machines' coordinate space.
 *       scaled.                 The replay button lived inside it and appeared
 *                               only after the first run, making the plate
 *                               35.3px taller; the viewBox then no longer
 *                               matched its element and preserveAspectRatio
 *                               scaled everything 0.833 and shifted it 70px.
 *                               Only a REPLAY shows this, never a first run.
 *   3 · The overlay tracks      The scroll-fx rode the h1 while the overlay
 *       the type.               sat on the plate, so the engine translated the
 *                               type 162.6px out from under its own machines.
 *   4 · The type does not       np-settype animated Fraunces' opsz and wght,
 *       change width.           which resize glyphs: 78.3px of drift with the
 *                               machines drawn at the settled positions.
 *   5 · The hand scatters,      From 2026-10-09 a swoosh's crest and a press
 *       re-prints exactly,      re-ran a machine letter as an overlay riding
 *       and replays nothing.    the wave; the owner ruled them out on
 *                               2026-10-16 ("not smooth ... run weirdly").
 *                               The assembly runs once, and again only from
 *                               "watch it again". The hand now scatters the
 *                               name into its print screen; the lab found
 *                               its holes (tmp/v13/lab/NAME NOTE.md), and
 *                               the four checks here are the ones a page
 *                               could ship broken without anyone seeing.
 *
 * Run against `out/`, which is what actually ships.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve } from "node:path";

/* `--root <dir>` so the negative tests — which must deliberately BREAK the
   page to prove this file can see a break — run against a throwaway copy.
   Mutating out/ directly once served the owner a deliberately broken page
   mid-session; the artifact being verified must never be the artifact
   somebody is looking at. */
const rootArg = process.argv.indexOf("--root");
const OUT = resolve(
  process.cwd(),
  rootArg > -1 ? process.argv[rootArg + 1] : "out"
);
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

async function serve() {
  const server = createServer(async (req, res) => {
    try {
      let p = join(OUT, decodeURIComponent(req.url.split("?")[0]));
      const s = await stat(p).catch(() => null);
      if (s?.isDirectory()) p = join(p, "index.html");
      const body = await readFile(p);
      res.writeHead(200, {
        "Content-Type": TYPES[extname(p)] ?? "application/octet-stream",
      });
      res.end(body);
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  await new Promise((r) => server.listen(0, r));
  return { server, port: server.address().port };
}

const fails = [];
const notes = [];
const check = (ok, label, detail) => {
  (ok ? notes : fails).push(`${ok ? "  ·" : "  ✗"} ${label} — ${detail}`);
};

const { server, port } = await serve();
let browser;
try {
  const { chromium } = await import("@playwright/test");
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  /* Count performances by watching the overlay appear, not by trusting a
     flag the page could set wrongly. */
  await page.addInitScript(() => {
    window.__npRuns = 0;
    /* and every SVG of ANY class: the hand's replays were np-ans, which
       the performance count above deliberately never saw */
    window.__npSvgs = 0;
    addEventListener("DOMContentLoaded", () => {
      const plate = document.querySelector("[data-nameplate]");
      if (!plate) return;
      new MutationObserver((ms) => {
        for (const m of ms)
          for (const n of m.addedNodes) {
            if (n.nodeType !== 1) continue;
            if (n.matches?.("svg.np-mech")) window.__npRuns++;
            if (n.matches?.("svg") || n.querySelector?.("svg"))
              window.__npSvgs++;
          }
      }).observe(plate, { childList: true, subtree: true });
    });
  });

  await page.goto(`http://127.0.0.1:${port}/`, {
    waitUntil: "domcontentloaded",
  });

  /* ── Geometry, sampled THROUGH the run ─────────────────────────────── */
  const sample = () =>
    page.evaluate(() => {
      const plate = document.querySelector("[data-nameplate]");
      const h1 = plate?.querySelector("h1");
      if (!h1) return null;
      const svg = document.querySelector("svg.np-mech");
      const hb = h1.getBoundingClientRect();
      const out = { typeW: +hb.width.toFixed(1) };
      if (svg) {
        const sb = svg.getBoundingClientRect();
        const vb = svg.getAttribute("viewBox").split(" ").map(Number);
        out.scale = +Math.min(sb.width / vb[2], sb.height / vb[3]).toFixed(4);
        out.dTop = +(sb.top - hb.top).toFixed(1);
      }
      return out;
    });

  const firstRun = [];
  for (const t of [700, 1400, 2100, 2900]) {
    await page.waitForTimeout(t - (firstRun.at(-1)?.t ?? 0));
    const s = await sample();
    if (s) firstRun.push({ ...s, t });
  }

  const widths = firstRun.map((s) => s.typeW);
  const travel = Math.max(...widths) - Math.min(...widths);
  check(
    travel < 2,
    "the type holds its width through the run",
    `${travel.toFixed(1)}px of travel across ${widths.length} samples (${widths.join(", ")})`
  );

  const drawn = firstRun.filter((s) => s.scale !== undefined);
  check(
    drawn.length > 0,
    "the machines are drawn at all",
    `overlay present in ${drawn.length}/${firstRun.length} first-run samples`
  );
  for (const s of drawn) {
    check(
      Math.abs(s.scale - 1) < 0.002,
      `the overlay is unscaled at ${s.t}ms`,
      `viewBox/element scale ${s.scale}`
    );
    check(
      Math.abs(s.dTop) < 1.5,
      `the overlay sits on the type at ${s.t}ms`,
      `${s.dTop}px vertical offset`
    );
  }

  /* ── The loop. Only a long idle shows it. ──────────────────────────── */
  await page.waitForTimeout(21000);
  const runs = await page.evaluate(() => window.__npRuns);
  check(
    runs === 1,
    "the name performs exactly once",
    `${runs} performance${runs === 1 ? "" : "s"} in 24s of sitting still`
  );

  /* ── The hand (5): it scatters the set name and re-prints it, and it
     replays no machine. Three fast swooshes placed by the clock, so every
     engine sweeps at one speed, a pointer that jumps off the name, and a
     press on each of the five machine letters. Sampled by the page's own
     frames, every frame:
       a · no SVG of any class joins the plate, and the name still
           performed exactly once (the replays, ruled out 2026-10-16);
       b · the swoosh actually scatters the name (a hover that is dead code
           would pass every other line here);
       c · no letter is ever veiled while the dot canvas is hidden (the swap
           is a crumble: a hidden letter with no canvas over it is a hole);
       d · it comes back exactly, and soon: within 3s of the hand leaving,
           every span's style is its own, every letter is opaque, the canvas
           is hidden and the engine has stopped. ── */
  await page
    .waitForFunction(() => window.__world?.name?.()?.ready === true, null, {
      timeout: 8000,
    })
    .catch(() => {});
  const hb = await page.evaluate(() => {
    const r = document
      .querySelector("[data-nameplate] h1")
      .getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  });
  const svgs0 = await page.evaluate(() => {
    const w = window;
    const plate = document.querySelector("[data-nameplate]");
    const L = [...plate.querySelectorAll(".np-ch")];
    w.__npSnap = L.map((l) => l.style.cssText).join("|");
    w.__npGap = 0;
    w.__npWatch = true;
    const tick = () => {
      const cv = plate.querySelector("canvas");
      const shown = cv && getComputedStyle(cv).visibility === "visible";
      if (!shown && L.some((l) => +getComputedStyle(l).opacity < 0.999))
        w.__npGap++;
      if (w.__npWatch) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return w.__npSvgs;
  });
  const hy = hb.y + hb.h * 0.55;
  let broken = 0;
  for (const dir of [1, -1, 1]) {
    const x0 = dir > 0 ? hb.x - 60 : hb.x + hb.w + 60;
    const x1 = dir > 0 ? hb.x + hb.w + 60 : hb.x - 60;
    await page.mouse.move(x0, hy);
    const t0 = Date.now();
    for (let u = 0; u < 1; ) {
      u = Math.min(1, (Date.now() - t0) / 350);
      await page.mouse.move(x0 + (x1 - x0) * u, hy);
    }
    broken = Math.max(
      broken,
      await page.evaluate(
        () => window.__world.name()?.episode.broken.length ?? 0
      )
    );
    await page.waitForTimeout(500);
  }
  /* the pointer jumps off the name in one event: not a hand */
  await page.mouse.move(hb.x + hb.w * 0.5, hy);
  await page.mouse.move(hb.x + hb.w + 600, hb.y + 600);
  for (const i of [0, 3, 7, 9, 10]) {
    await page.locator("[data-nameplate] .np-ch").nth(i).click();
    await page.waitForTimeout(250);
  }
  await page.mouse.move(hb.x + hb.w + 300, hb.y + 500);
  const settled = await page.evaluate(async () => {
    const t0 = performance.now();
    while (
      performance.now() - t0 < 3000 &&
      (window.__world.name()?.live || window.__world.hand() > 0)
    )
      await new Promise((r) => requestAnimationFrame(r));
    return Math.round(performance.now() - t0);
  });
  await page.waitForTimeout(200);
  const handed = await page.evaluate(() => {
    window.__npWatch = false;
    const plate = document.querySelector("[data-nameplate]");
    const L = [...plate.querySelectorAll(".np-ch")];
    const cv = plate.querySelector("canvas");
    return {
      svgs: window.__npSvgs,
      runs: window.__npRuns,
      gap: window.__npGap,
      styles: L.map((l) => l.style.cssText).join("|") === window.__npSnap,
      opaque: L.every((l) => getComputedStyle(l).opacity === "1"),
      canvasHidden: !cv || getComputedStyle(cv).visibility === "hidden",
      idle: window.__world.hand() === 0,
      probe: window.__world.name(),
    };
  });
  check(
    handed.svgs === svgs0 && handed.runs === 1,
    "the hand replays no machine",
    `${handed.svgs - svgs0} overlay(s) and ${handed.runs - 1} performance(s) from 3 swooshes and 5 presses`
  );
  check(
    broken >= 8,
    "a swoosh scatters the name",
    `${broken} of 10 letters broken by one 350ms swoosh`
  );
  check(
    handed.gap === 0,
    "no letter is hidden without its dots",
    `${handed.gap} frame(s) with a veiled letter and no canvas`
  );
  check(
    settled < 3000 &&
      handed.styles &&
      handed.opaque &&
      handed.canvasHidden &&
      handed.idle &&
      handed.probe?.rest === true,
    "the name re-prints exactly, within 3s",
    `${settled}ms to rest; styles ${handed.styles}, opaque ${handed.opaque}, canvas hidden ${handed.canvasHidden}, engine idle ${handed.idle}, probe rest ${handed.probe?.rest}`
  );

  /* ── The replay, which is the only place defect 2 is visible. ───────── */
  const hasReplay = await page.locator("[data-np-replay]").count();
  if (hasReplay) {
    await page.click("[data-np-replay]");
    const replay = [];
    for (const t of [700, 1500, 2300]) {
      await page.waitForTimeout(t - (replay.at(-1)?.t ?? 0));
      const s = await sample();
      if (s?.scale !== undefined) replay.push({ ...s, t });
    }
    check(
      replay.length > 0,
      "the replay actually performs",
      `overlay seen in ${replay.length}/3 samples after the click`
    );
    for (const s of replay) {
      check(
        Math.abs(s.scale - 1) < 0.002,
        `the replayed overlay is unscaled at +${s.t}ms`,
        `viewBox/element scale ${s.scale}`
      );
      check(
        Math.abs(s.dTop) < 1.5,
        `the replayed overlay sits on the type at +${s.t}ms`,
        `${s.dTop}px vertical offset`
      );
    }
    const after = await page.evaluate(() => window.__npRuns);
    check(
      after === 2,
      "one click yields one replay",
      `${after - 1} performance${after - 1 === 1 ? "" : "s"} after the click`
    );
    const live = await page.locator("svg.np-mech").count();
    check(live <= 1, "overlays do not stack", `${live} overlay(s) in the DOM`);
  } else {
    notes.push("  · no replay control on the page — replay checks skipped");
  }
  /* ── Narrow widths. Every geometry defect so far was found at 1440 and
     the machines are sized from a measured box, so a width that changes
     the type's wrap or scale is where a box mismatch would resurface. ── */
  for (const w of [320, 768]) {
    const np = await browser.newPage({ viewport: { width: w, height: 900 } });
    await np.goto(`http://127.0.0.1:${port}/`, {
      waitUntil: "domcontentloaded",
    });
    await np.waitForTimeout(1600);
    const g = await np.evaluate(() => {
      const svg = document.querySelector("svg.np-mech");
      const h1 = document.querySelector("[data-nameplate] h1");
      if (!svg || !h1) return null;
      const sb = svg.getBoundingClientRect();
      const hb = h1.getBoundingClientRect();
      const vb = svg.getAttribute("viewBox").split(" ").map(Number);
      return {
        scale: +Math.min(sb.width / vb[2], sb.height / vb[3]).toFixed(4),
        dTop: +(sb.top - hb.top).toFixed(1),
        overflow:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      };
    });
    if (!g) {
      notes.push(
        `  · ${w}px — no overlay at this width, geometry checks skipped`
      );
    } else {
      check(
        Math.abs(g.scale - 1) < 0.002,
        `the overlay is unscaled at ${w}px`,
        `scale ${g.scale}`
      );
      check(
        Math.abs(g.dTop) < 1.5,
        `the overlay sits on the type at ${w}px`,
        `${g.dTop}px offset`
      );
      check(
        g.overflow <= 0,
        `the page does not scroll sideways at ${w}px`,
        `${g.overflow}px of overflow`
      );
    }
    await np.close();
  }

  /* ── A7: reduced motion must render a COMPLETE authored name. The
     letters carrying machines are held at opacity 0 until their machine
     lands, so a reduced-motion path that skips the performance without
     also releasing the withholding leaves the name permanently missing
     five of its eleven characters. ── */
  const rm = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await rm.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
  await rm.waitForTimeout(2500);
  const still = await rm.evaluate(() => {
    const h1 = document.querySelector("[data-nameplate] h1");
    const L = [...h1.querySelectorAll(".np-ch")];
    const shown = L.filter((l) => +getComputedStyle(l).opacity > 0.5);
    return {
      shown: shown.length,
      all: L.length,
      text: shown.map((l) => l.textContent.trim() || "_").join(""),
      overlays: document.querySelectorAll("svg.np-mech").length,
    };
  });
  check(
    still.shown === still.all,
    "reduced motion renders the whole name",
    `${still.shown}/${still.all} letters — "${still.text}"`
  );
  check(
    still.overlays === 0,
    "reduced motion draws no apparatus",
    `${still.overlays} overlay(s)`
  );
  await rm.close();
} finally {
  await browser?.close();
  server.close();
}

for (const n of notes) console.log(n);
if (fails.length) {
  console.error(
    `\ncheck-nameplate FAILED — ${fails.length} broken invariant(s):`
  );
  for (const f of fails) console.error(f);
  process.exit(1);
}
console.log(`\ncheck-nameplate: ${notes.length} invariants hold`);
