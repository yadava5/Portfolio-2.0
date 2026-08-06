/**
 * The cargo, recorded as BEHAVIOUR rather than as source.
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT check-beat-tables. That gate reads the
 * TRAV literal in src/run/index.html and asserts the table is well-formed —
 * every corridor except the last carries something. It is a source check, and
 * it cannot see the thing that actually broke on the other home page: a cargo
 * table that was perfectly well-formed and indexed against the wrong stations,
 * so Applied's sorted mail departed the AutoML chapter. Nothing went NaN.
 * Nothing failed. The freight just left from the wrong place.
 *
 * So this one never reads the table. It hooks `fillText` on the run's own
 * canvas, scrolls the built page in steps, and records which waybill was
 * painted where — then attributes each one to a corridor by comparing the
 * scroll position it was painted at against the stations' own offsets. If a
 * consignment changes station, this notices; the source gate cannot.
 *
 * TWO CONSTRAINTS, both measured in the run's painter (:2587):
 *
 *   if (!stacked && t.j === 0 && t.label && prog > 0.1 && prog < 0.7)
 *
 *   · `!stacked` — the waybill is DESKTOP ONLY. On a stacked layout the run
 *     deliberately paints no canvas text at all, because it would print
 *     through the DOM prose. Recording at 390px would record an empty page
 *     and call it a regression. The viewport here is 1440.
 *   · `t.j === 0` — only the LEAD item of an `n: N` entry carries a label, so
 *     twelve TRAV entries produce eighteen travellers but at most twelve
 *     waybills. The fixture counts waybills, not travellers.
 *
 * Beat 5's label is a function of `glyphDigit` and reads "a blank 28×28 — the
 * run wants your hand" until the classifier returns a digit. This never draws
 * one, so that string is the deterministic one. If a future change makes the
 * digit arrive on its own, this fixture is where it will surface.
 *
 *   node scripts/qa/check-cargo-fixture.mjs            check against the fixture
 *   node scripts/qa/check-cargo-fixture.mjs --record   rewrite it, deliberately
 *   node scripts/qa/check-cargo-fixture.mjs --root DIR verify a throwaway copy
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { readFileSync, writeFileSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { chromium } from "@playwright/test";

const argv = process.argv.slice(2);
const RECORD = argv.includes("--record");
const rootArg = argv.indexOf("--root");
const OUT = resolve(process.cwd(), rootArg > -1 ? argv[rootArg + 1] : "out");
const FIXTURE = resolve(process.cwd(), "tests/fixtures/cargo-corridors.json");

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

const { server, port } = await serve();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

/* Installed BEFORE any of the run's script executes, so the wrap is in place
   by the time the first frame paints. Wrapping the prototype rather than one
   context catches the thread canvas without needing to name it. */
await page.addInitScript(() => {
  window.__cargo = [];
  const real = CanvasRenderingContext2D.prototype.fillText;
  /* `...rest` rather than naming x and y: they are recorded from the scroll
     position, not from the canvas coordinates, so naming them only to ignore
     them is two unused bindings the linter is right to flag. */
  CanvasRenderingContext2D.prototype.fillText = function (text, ...rest) {
    window.__cargo.push({ text: String(text), y: window.scrollY });
    return real.call(this, text, ...rest);
  };
});

await page.goto(`http://127.0.0.1:${port}/`);
await page.locator('[data-beat="0"]').waitFor({ state: "attached" });

/* Read the stations FIRST, and sample each corridor at fractions OF ITSELF.

   An absolute pixel step is the fragile way to do this and it would have been a
   CI flake rather than a local one: document height depends on text layout, and
   headless Chromium on ubuntu will not lay out identically to macOS even with
   the four faces self-hosted. Where a corridor came out shorter there, a fixed
   step could straddle the 0.1 < prog < 0.7 paint window completely and report
   "corridor N no longer carries X" — a false red on a gate whose entire value is
   that it gets believed. Fractions of each corridor's own span are invariant to
   all of that, and they do not require knowing how the run maps scroll to prog:
   any monotonic mapping is covered by sampling across the span. */
const beats = await page.evaluate(() =>
  [...document.querySelectorAll("[data-beat]")]
    .map((el) => ({
      beat: Number(el.getAttribute("data-beat")),
      top: el.getBoundingClientRect().top + window.scrollY,
    }))
    .sort((a, b) => a.top - b.top)
);

const FRACTIONS = [0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68];
const stops = [];
for (let i = 0; i < beats.length - 1; i++) {
  const span = beats[i + 1].top - beats[i].top;
  for (const f of FRACTIONS) stops.push(beats[i].top + span * f);
}

for (const y of stops) {
  await page.evaluate((to) => window.scrollTo(0, to), Math.round(y));
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => r()))
  );
}

const painted = await page.evaluate(() => window.__cargo);

await browser.close();
server.close();

/* Attribute each waybill to the corridor it was painted in, from the scroll
   position rather than from the table. A label's paint window spans the middle
   of one corridor, so the midpoint of its first and last sighting lands inside
   the departure station's span. */
const byLabel = new Map();
for (const { text, y } of painted) {
  const seen = byLabel.get(text) ?? { min: y, max: y, n: 0 };
  seen.min = Math.min(seen.min, y);
  seen.max = Math.max(seen.max, y);
  seen.n += 1;
  byLabel.set(text, seen);
}

/* `beats` is already sorted by document position — see the query above. */
function corridorAt(y) {
  let which = null;
  for (const b of beats) if (b.top <= y) which = b.beat;
  return which;
}

const observed = [...byLabel.entries()]
  .map(([label, s]) => ({ label, corridor: corridorAt((s.min + s.max) / 2) }))
  .sort((a, b) => a.corridor - b.corridor || a.label.localeCompare(b.label));

if (RECORD) {
  writeFileSync(
    FIXTURE,
    JSON.stringify(
      {
        _why: [
          "Recorded behaviour, not source. See scripts/qa/check-cargo-fixture.mjs.",
          "Desktop only (1440px): the run paints no canvas text on a stacked layout.",
          "Re-record ONLY when the cargo was changed deliberately, and read the diff.",
        ],
        recordedAt: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
        viewport: { width: 1440, height: 900 },
        waybills: observed,
      },
      null,
      2
    ) + "\n"
  );
  console.log(`check-cargo-fixture: recorded ${observed.length} waybills`);
  for (const w of observed)
    console.log(`  · corridor ${w.corridor} → "${w.label}"`);
  process.exit(0);
}

const expected = JSON.parse(readFileSync(FIXTURE, "utf8")).waybills;
/* JSON rather than a delimiter: a corridor number and a free-text label
   cannot be joined by any separator a label is guaranteed not to contain. */
const key = (w) => JSON.stringify([w.corridor, w.label]);
const want = new Set(expected.map(key));
const got = new Set(observed.map(key));

const missing = expected.filter((w) => !got.has(key(w)));
const extra = observed.filter((w) => !want.has(key(w)));

for (const w of missing)
  console.error(`  ✗ corridor ${w.corridor} no longer carries "${w.label}"`);
for (const w of extra)
  console.error(
    `  ✗ corridor ${w.corridor} now carries "${w.label}", which is not in the fixture`
  );

if (missing.length || extra.length) {
  console.error(
    `\ncheck-cargo-fixture FAILED: ${missing.length} missing, ${extra.length} unexpected.` +
      `\nIf the cargo was changed deliberately, read the diff and re-record with --record.`
  );
  process.exit(1);
}

console.log(
  `check-cargo-fixture: ${observed.length} waybills, each on the corridor it was recorded on`
);
for (const w of observed)
  console.log(`  · corridor ${w.corridor} → "${w.label}"`);
