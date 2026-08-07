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
 * IT NOW DOES TWO THINGS, AND THE SECOND ONE IS WHY THE FIRST WAS NOT ENOUGH.
 * A recording agrees with whatever was rendered on the day it was taken, so a
 * rail that had ALWAYS carried the wrong freight recorded as green and stayed
 * green for five phases while the owner reported it wrong. The second half —
 * see THE ARRIVAL BINDING below — checks the render against
 * `stations.ts` rather than against a recording, and it is the half that can
 * fail on day one. Read that block before changing either.
 *
 * TWO CONSTRAINTS, both in the run's painter — search `the waybill: the lead
 * item says what is in transit`, because a line number here rots silently:
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
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { compileAndRelink } from "../run/compile-ts-graph.mjs";

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

/* ————— THE ARRIVAL BINDING: the render against the DECLARATION —————
 *
 * IT RUNS BEFORE `--record`, AND THAT ORDER IS THE POINT. Written after the
 * record branch it was decorative: `--record` writes the fixture and exits, so
 * re-recording a wrong rail would have rewritten the baseline and never once
 * consulted the declaration — the exact move this repo has a standing rule
 * against, automated. Here, a re-record of freight that disagrees with
 * `stations.ts` fails instead of being blessed. Keep it above.
 *
 * Everything above compares the render to a RECORDING. That is worth having
 * and it is not enough: a recording agrees with whatever was rendered on the
 * day it was taken, so a rail that has always been wrong records as green and
 * stays green. It did. Measured 2026-08-07 by hooking `fillText` and asking
 * which `¶` kicker was inside the 900px viewport while each waybill painted:
 * for ELEVEN of twelve, the only station heading on screen was the one the
 * cargo was NOT from. `sorted mail` — Applied's — was read at ¶05 Cadence;
 * Glyph's blank 28×28 was read at ¶07 jetpack-compress. The owner reported
 * the rail carrying the wrong cargo while this gate was green, and both were
 * true: it attributed a waybill to a corridor by SCROLL OFFSET, which is the
 * author's frame, and a reader has only the heading in front of them.
 *
 * So the rule the run now builds to, and the one asserted here: FREIGHT
 * ARRIVES AT THE STATION IT IS ABOUT. Corridor `c` runs from station `c` to
 * station `c + 1` and is read at `c + 1`, therefore corridor `c` carries
 * `STATIONS[c + 1].consignment` — not `STATIONS[c]`'s. Re-index the run back
 * to departure semantics and this goes red on every corridor at once.
 *
 * `consignment` is normalised to a list so that a corridor carrying two
 * declared waybills is expressible. It is NOT a licence to paint an
 * undeclared one: a label with no station behind it fails here, which is what
 * makes the run's twelfth waybill a decision somebody has to take rather than
 * a thing that quietly ships.
 */
compileAndRelink({
  root: process.cwd(),
  project: "tsconfig.archive.json",
  outDir: ".build/archive",
});
const { STATIONS } = await import(
  pathToFileURL(
    join(resolve(process.cwd(), ".build/archive"), "lib/data/stations.js")
  ).href
);

const declaredAt = (corridor) => {
  const station = STATIONS.find((s) => s.beat === corridor + 1);
  if (!station || station.consignment == null) return [];
  return Array.isArray(station.consignment)
    ? [...station.consignment]
    : [station.consignment];
};
const nameAt = (corridor) =>
  STATIONS.find((s) => s.beat === corridor + 1)?.kicker ??
  `beat ${corridor + 1}`;

const arrivalFails = [];

/* EVERY corridor, not just the ones something was seen on. Iterating the
   observed set would mean a corridor that paints NOTHING is never compared to
   what its arriving station declares — a consignment carried by no freight at
   all would pass in silence, which is the one failure this binding exists to
   make loud. `beats` is the run's own sections; corridor c runs from beat c to
   beat c + 1, so the last corridor is beats.length - 2. */
const corridors = [...Array(Math.max(0, beats.length - 1)).keys()];
for (const c of corridors) {
  const painted = observed.filter((w) => w.corridor === c).map((w) => w.label);
  const declared = declaredAt(c);
  for (const label of painted) {
    if (!declared.includes(label)) {
      arrivalFails.push(
        `corridor ${c} carries "${label}", which ${nameAt(c)} — the station it ` +
          `arrives at — does not declare` +
          (declared.length
            ? `\n      ${nameAt(c)} declares: ${declared.map((d) => `"${d}"`).join(", ")}`
            : `\n      ${nameAt(c)} declares no consignment at all`)
      );
    }
  }
  for (const label of declared) {
    if (!painted.includes(label)) {
      arrivalFails.push(
        `${nameAt(c)} declares "${label}" but nothing carries it into the station ` +
          `— corridor ${c} is the one that arrives there`
      );
    }
  }
}

/* The first station is the one place arrival semantics has nothing to say: the
   run BEGINS at ¶01, so no corridor arrives there and no freight can be carried
   in. A consignment declared on beat 0 is therefore a claim no corridor can
   ever satisfy — invisible to the loop above, because that loop is indexed by
   corridor and beat 0 is not the far end of one. Assert it directly or it
   becomes the next thing that is quietly true of nothing. */
const first = STATIONS.find((s) => s.beat === 0);
if (first && first.consignment != null) {
  arrivalFails.push(
    `${first.kicker} declares "${first.consignment}", but nothing arrives at the ` +
      `first station — the run starts there. Under arrival semantics beat 0's ` +
      `consignment can only be null; freight that departs ¶01 belongs to whichever ` +
      `station it is ABOUT.`
  );
}

if (arrivalFails.length) {
  console.error("");
  for (const f of arrivalFails) console.error(`  ✗ ${f}`);
  console.error(
    `\ncheck-cargo-fixture FAILED the arrival binding: ${arrivalFails.length} ` +
      `disagreement(s) between what the rail carries and what stations.ts declares.` +
      `\nA re-recorded fixture does not fix this — the fixture is the render, and ` +
      `the render is what is being doubted.`
  );
  process.exit(1);
}

console.log(
  `check-cargo-fixture: and each one is the consignment of the station it arrives at`
);

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
