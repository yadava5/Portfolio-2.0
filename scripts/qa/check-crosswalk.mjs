/**
 * @fileoverview The seam between the run and the record room, checked in both
 * directions.
 *
 * WHY THIS EXISTS. Measured on 2026-08-06: `grep -rl '#v-' scripts/qa/`
 * returned NOTHING. Fifty-three receipt anchors, four of them cited from the
 * shipped home page and eleven more from the evidence index, and not one gate
 * asserted a single one of them. `check-links.mjs` matches only pinned
 * github.com tree, blob and commit URLs and skips every same-origin link by
 * construction; `check-anchors.mjs` resolves the run's own fragments but never
 * leaves the page. So the one class of link this portfolio's entire argument
 * rests on — the claim reaching its receipt — was the only class nothing read.
 *
 * A fragment that matches nothing does not error. It scrolls to the top of the
 * document and looks like a page that simply opened. That is exactly how the
 * 404's wayfinding index came to hold five dead links at once.
 *
 * FOUR DIRECTIONS, NOT ONE:
 *
 *   1. the run → the archive          — every internal href lands on a file
 *   2. the run → a receipt            — every #fragment exists as an id there
 *   3. the ledger → a receipt         — proofManifest's hrefs, the same way
 *   4. the archive → the run          — the rejoin link lands on a real
 *                                       station, and the arrival slip quotes
 *                                       that station's consignment verbatim
 *
 * Direction 4 is the one `check-stations.mjs` cannot cover: it asserts every
 * string in `stations.ts` appears in the run, which is the run's side of the
 * seam. Nothing asserted the case file's side.
 *
 * TAKES THE ARCHIVE ROOT AS AN ARGUMENT, and that is not a convenience. In
 * Phase 3 the generator writes to staging while `out/` still holds the
 * Next-rendered case files, whose footers say `back to the work ⟵` → `/#work`
 * and carry no rejoin link at all. Pointed at `out/` today, directions 3 and 4
 * would be red until a later phase — and a validator that cannot go green
 * until later is the one thing the execution protocol forbids.
 *
 *   node scripts/qa/check-crosswalk.mjs                      staging
 *   node scripts/qa/check-crosswalk.mjs out                  after the cutover
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { compileAndRelink } from "../run/compile-ts-graph.mjs";

const root = process.cwd();
const ARCHIVE = resolve(root, process.argv[2] ?? ".build/archive-staging");
const RUN_SRC = resolve(root, "src/run/index.html");
const SITE = "https://yadava5.github.io/Portfolio-2.0";

const failures = [];
const fail = (msg) => failures.push(msg);

/* ── The data layer, for the ledger's hrefs and the station table ────── */
compileAndRelink({ root, project: "tsconfig.archive.json", outDir: ".build/archive" });
const load = (rel) =>
  import(pathToFileURL(join(resolve(root, ".build/archive"), rel)).href);
const { proofManifest } = await load("lib/data/proofManifest.js");
const { STATIONS } = await load("lib/data/stations.js");
const { projectCaseStudies } = await load("lib/data/projectCaseStudies.js");

if (!existsSync(ARCHIVE) || !statSync(ARCHIVE).isDirectory()) {
  console.error(`check-crosswalk FAILED — no archive at ${ARCHIVE}`);
  console.error("  build it first: node scripts/archive/build-archive.mjs");
  process.exit(1);
}

/* ── Reading HTML without a parser, deliberately ──────────────────────
   The pages are generated from one template each, so their id attributes are
   uniform and a regex reads them exactly. A parser would be a dependency this
   repository does not otherwise carry, on a page whose whole argument is that
   it carries none. */
const idsIn = (html) =>
  new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

const hrefsIn = (html) => {
  /* Blank scripts and comments rather than dropping them, so a reported line
     number still counts from the true byte offset. This file's own prose about
     hrefs would otherwise be read as hrefs. */
  const src = html.replace(/<script[\s\S]*?<\/script>|<!--[\s\S]*?-->/g, (m) =>
    m.replace(/[^\n]/g, " ")
  );
  return [...src.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1]);
};

const cache = new Map();
function page(path) {
  if (!cache.has(path)) {
    cache.set(path, existsSync(path) ? readFileSync(path, "utf8") : null);
  }
  return cache.get(path);
}

/**
 * Resolve one site-absolute URL to the file that answers it.
 *
 * The site root IS the run, and it is resolved against `src/run/index.html`
 * rather than against the archive root on purpose: that is true in both
 * phases. In Phase 3 the generator does not write index.html at all (the Next
 * build still owns it), and after the cutover out/index.html is a byte copy of
 * this source. Pointing at the source makes the check phase-independent and
 * puts it on the file a human edits.
 */
function resolveTarget(url) {
  const rest = url.slice(SITE.length).replace(/^\//, "");
  const [pathPart, fragment] = rest.split("#");
  if (pathPart === "") return { file: RUN_SRC, fragment, label: "the run" };
  const file = pathPart.endsWith("/")
    ? join(ARCHIVE, pathPart, "index.html")
    : join(ARCHIVE, pathPart);
  return { file, fragment, label: pathPart };
}

/** Assert one site-absolute link lands on a file, and on an id if it names one. */
function assertLink(url, where) {
  const { file, fragment, label } = resolveTarget(url);
  const html = page(file);
  if (html === null) {
    fail(`${where}: ${url} → no file at ${label}`);
    return { fileOk: false, fragmentChecked: false };
  }
  if (!fragment) return { fileOk: true, fragmentChecked: false };
  if (!idsIn(html).has(fragment)) {
    fail(`${where}: ${url} → ${label} carries no id="${fragment}"`);
    return { fileOk: true, fragmentChecked: true };
  }
  return { fileOk: true, fragmentChecked: true };
}

/* ══ 1 + 2 · the run → the archive, and → the receipt ═══════════════════ */
const runHtml = readFileSync(RUN_SRC, "utf8");
const runInternal = hrefsIn(runHtml).filter(
  (h) => h === SITE || h.startsWith(`${SITE}/`)
);
let runFragments = 0;
for (const url of runInternal) {
  if (assertLink(url, "src/run/index.html").fragmentChecked) runFragments++;
}

/* ══ 3 · the ledger → the receipt ══════════════════════════════════════ */
const ledgerHrefs = proofManifest
  .filter((entry) => entry.receipt)
  .map((entry) => entry.receipt.href);
for (const href of ledgerHrefs) {
  /* proofManifest stores them site-relative ("/projects/x/#v-x-1"). */
  assertLink(`${SITE}${href}`, "proofManifest.ts");
}

/* ══ 4 · the archive → the run ═════════════════════════════════════════
   The direction check-stations.mjs cannot reach. Today `back to the work ⟵`
   sends EVERY case file to /#work — ¶04, 08:47 — so a reader leaving Glyph at
   15:23 is returned to the wrong hour, and a reader leaving the review is
   returned to a station they never visited. */
const runIds = idsIn(runHtml);
const byDossier = new Map(
  STATIONS.filter((s) => s.dossier).map((s) => [s.dossier, s])
);
const REVIEW = STATIONS.find((s) => s.id === "review");
let rejoins = 0;
let receiptIds = 0;
let slips = 0;

for (const study of projectCaseStudies) {
  const file = join(ARCHIVE, "projects", study.projectId, "index.html");
  const html = page(file);
  if (html === null) {
    fail(`no case file generated for ${study.projectId}`);
    continue;
  }

  /* ── the 53, as a SET rather than a tally ──────────────────────────
     A count cannot see the defect that matters here. Restart `outcomes` at 1
     instead of at receipts.length + 1 and jobtracker emits v-jobtracker-1…9
     and then 1 and 2 AGAIN: eleven ids, nine distinct, two duplicated in one
     document — and a total of 53 across the archive, and every link the run
     and the ledger cite still resolving, because `#v-jobtracker-4` finds the
     first of a duplicate pair. Every check in this file would have stayed
     green. So the expected ids are computed from the data and compared as a
     set, which also catches a gap, a stray, and a padded id (`v-x-04`). */
  const expected = new Set(
    Array.from(
      { length: study.receipts.length + study.outcomes.length },
      (_, i) => `v-${study.projectId}-${i + 1}`
    )
  );
  const emitted = [...html.matchAll(/\sid="(v-[^"]+)"/g)].map((m) => m[1]);
  const emittedSet = new Set(emitted);
  if (emitted.length !== emittedSet.size) {
    const seen = new Set();
    const dupes = emitted.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    fail(`${study.projectId}: duplicate receipt ids in one document — ${[...new Set(dupes)].join(", ")}`);
  }
  for (const want of expected) {
    if (!emittedSet.has(want)) fail(`${study.projectId}: missing receipt anchor #${want}`);
  }
  for (const got of emittedSet) {
    if (!expected.has(got)) fail(`${study.projectId}: unexpected receipt anchor #${got}`);
  }
  receiptIds += expected.size;

  /* Every station-shaped link out of this file must name a real stop. */
  const stationLinks = hrefsIn(html).filter((h) => /^https?:/.test(h) && h.includes("/#"));
  const targets = new Set();
  for (const href of stationLinks) {
    if (!href.startsWith(`${SITE}/#`)) continue;
    const id = href.slice(`${SITE}/#`.length);
    targets.add(id);
    if (!runIds.has(id)) {
      fail(`${study.projectId}: rejoins at /#${id}, which is not an id in the run`);
    }
    if (!STATIONS.some((s) => s.id === id)) {
      fail(`${study.projectId}: rejoins at /#${id}, which is not a station in stations.ts`);
    }
  }

  /* The station that consigned this file — or the review, for the two that
     no station sends. `policybot` and `visual-assist` have no stop on the
     line; ¶10's receipts are their waybill. */
  const station = byDossier.get(study.projectId) ?? REVIEW;
  if (!targets.has(station.id)) {
    fail(
      `${study.projectId}: no rejoin link to /#${station.id} — ` +
        `${byDossier.has(study.projectId) ? "the station that consigned it" : "the review, which files it"}`
    );
  } else {
    rejoins++;
  }

  /* THE SLIP QUOTES THE DATA, NOT A PARAPHRASE. `consignment` is the only
     candidate already guarded verbatim against the run — the run's own handoff
     prose ("↳ the sorted mail lands in") and the plan's sample slip
     ("consignment: the sorted mail") are two further wordings of the same
     thing, and a seam string with no drift guard is precisely what the
     stations.ts exercise was built to remove.

     EVERY file names its stop and its hour, because that is what the rejoin
     link promises: today `back to the work ⟵` returns every reader to ¶04 at
     08:47, so someone leaving Glyph at 15:23 lands at the wrong hour of the
     day. `name` and `clock` are both already guarded verbatim against the run.

     THE TWO REVIEW-FILED FILES GET THE NAME AND CLOCK BUT NOT THE
     CONSIGNMENT, and the reason is in the data: the review consigns
     "run 042, reviewed → the references", which carries a RUN NUMBER. The
     record room quotes the route, not one day's serial — a case file stamped
     with run 042 would be wrong for every later run. `policybot` and
     `visual-assist` have no station at all; ¶10's receipts are their waybill,
     and their slip says so in the review's own words instead. */
  for (const [what, wanted] of [
    ["name", station.name],
    ["clock", station.clock],
  ]) {
    if (!html.includes(wanted)) {
      fail(
        `${study.projectId}: does not print ${station.id}'s ${what} verbatim — wanted: ${wanted}`
      );
    }
  }

  if (byDossier.has(study.projectId) && station.consignment) {
    if (html.includes(station.consignment)) slips++;
    else
      fail(
        `${study.projectId}: arrival slip does not quote ${station.id}'s consignment verbatim\n` +
          `      wanted: ${station.consignment}`
      );
  }
}

/* ══ 5 · floors, so a broken parse fails loudly ════════════════════════
   check-links learned this the expensive way: a matcher that silently stops
   matching reports a clean run over an empty set. Every count below is a
   measured floor, not a guess. */
const floors = [
  ["internal links in the run", runInternal.length, 11],
  ["receipt fragments checked from the run", runFragments, 4],
  ["ledger receipt links", ledgerHrefs.length, 11],
  ["receipt anchors emitted, id by id", receiptIds, 53],
  ["case files rejoining the line", rejoins, 7],
  /* Five, not seven: `policybot` and `visual-assist` have no station to
     consign them. That asymmetry is the archive's, not a shortfall — see the
     comment above the check. */
  ["case files quoting their consignment", slips, 5],
];
for (const [what, got, floor] of floors) {
  if (got < floor) fail(`only ${got} ${what}, expected at least ${floor}`);
}

/* ══ report ════════════════════════════════════════════════════════════ */
if (failures.length) {
  console.error(
    `check-crosswalk FAILED — ${failures.length} break${failures.length === 1 ? "" : "s"} in the seam:\n`
  );
  for (const f of failures) console.error(`  ✗ ${f}`);
  console.error(
    "\n  A fragment that matches nothing does not error. It scrolls to the top\n" +
      "  of the document and looks like a page that simply opened.\n"
  );
  process.exit(1);
}

for (const [what, got, floor] of floors) {
  console.log(`  · ${got} ${what} (floor ${floor})`);
}
console.log(
  `check-crosswalk: the seam holds in both directions, against ${process.argv[2] ?? ".build/archive-staging"}/`
);
