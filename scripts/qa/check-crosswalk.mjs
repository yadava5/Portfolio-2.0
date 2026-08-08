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
 * FIVE DIRECTIONS, NOT ONE:
 *
 *   1. the run → the archive          — every internal href lands on a file
 *   2. the run → a receipt            — every #fragment exists as an id there
 *   3. the ledger → a receipt         — proofManifest's hrefs, the same way
 *   4. the archive → the run          — the rejoin link lands on a real
 *                                       station, and the arrival slip quotes
 *                                       that station's consignment verbatim
 *   5. EVERY archive page → the run   — every /#… link on every generated
 *                                       page, the 404's index included
 *
 * Direction 4 is the one `check-stations.mjs` cannot cover: it asserts every
 * string in `stations.ts` appears in the run, which is the run's side of the
 * seam. Nothing asserted the case file's side.
 *
 * Direction 5 arrived in Phase 4 and `check-anchors.mjs` was deleted for it —
 * the reasoning is at the check itself. In short: that gate read the five
 * React files that wrote links into the run, and Phase 4 deletes all five.
 *
 * TAKES THE ARCHIVE ROOT AS AN ARGUMENT, and that is not a convenience — it
 * is how a negative test is run against a doctored copy of the site instead of
 * against the directory being served. It was also what let this gate go green
 * during Phase 3, when the generator wrote to a staging directory and `out/`
 * still held the Next-rendered case files, whose footers said
 * `back to the work ⟵` → `/#work` and carried no rejoin link at all.
 *
 *   node scripts/qa/check-crosswalk.mjs out                  what ships
 *   node scripts/qa/check-crosswalk.mjs .build/gate-probe    a doctored copy
 */
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { resolve, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { compileAndRelink } from "../run/compile-ts-graph.mjs";

const root = process.cwd();
const ARCHIVE = resolve(root, process.argv[2] ?? "out");
const RUN_SRC = resolve(root, "src/run/index.html");
const SITE = "https://ayush-yadav.com";

const failures = [];
const fail = (msg) => failures.push(msg);

/* ── The data layer, for the ledger's hrefs and the station table ────── */
compileAndRelink({
  root,
  project: "tsconfig.archive.json",
  outDir: ".build/archive",
});
const load = (rel) =>
  import(pathToFileURL(join(resolve(root, ".build/archive"), rel)).href);
const { proofManifest } = await load("lib/data/proofManifest.js");
const { STATIONS } = await load("lib/data/stations.js");
const { projectCaseStudies } = await load("lib/data/projectCaseStudies.js");
const { projects } = await load("lib/data/projects.js");

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
    const dupes = emitted.filter((id) =>
      seen.has(id) ? true : (seen.add(id), false)
    );
    fail(
      `${study.projectId}: duplicate receipt ids in one document — ${[...new Set(dupes)].join(", ")}`
    );
  }
  for (const want of expected) {
    if (!emittedSet.has(want))
      fail(`${study.projectId}: missing receipt anchor #${want}`);
  }
  for (const got of emittedSet) {
    if (!expected.has(got))
      fail(`${study.projectId}: unexpected receipt anchor #${got}`);
  }
  receiptIds += expected.size;

  /* Every station-shaped link out of this file must name a real stop. */
  const stationLinks = hrefsIn(html).filter(
    (h) => /^https?:/.test(h) && h.includes("/#")
  );
  const targets = new Set();
  for (const href of stationLinks) {
    if (!href.startsWith(`${SITE}/#`)) continue;
    const id = href.slice(`${SITE}/#`.length);
    targets.add(id);
    if (!runIds.has(id)) {
      fail(
        `${study.projectId}: rejoins at /#${id}, which is not an id in the run`
      );
    }
    if (!STATIONS.some((s) => s.id === id)) {
      fail(
        `${study.projectId}: rejoins at /#${id}, which is not a station in stations.ts`
      );
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

  /* THE SLIP QUOTES THE WAYBILL ADDRESSED TO THIS FILE — one element, not the
     station's whole declaration.

     This read `html.includes(station.consignment)` against a field that became
     an array on 2026-08-08, so BOTH sides coerced it to "A,B": the renderer
     printed a bare-comma join and the gate looked for a bare-comma join and
     found one. Two instruments agreeing with each other and disagreeing with
     the reader — the failure shape this file's own header is about. It passed.

     Three assertions now, none of them on a joined string, and the third is a
     tripwire rather than a check: it exists so that particular agreement cannot
     be reconstructed silently by anyone who reaches for `${...}` on this field
     again. */
  if (byDossier.has(study.projectId) && station.consignment) {
    const declared = Array.isArray(station.consignment)
      ? station.consignment
      : [station.consignment];
    const addressed = declared.filter((w) => w.endsWith("→ the case file"));
    /* which one the slip is owed: the addressed one when the station declares
       several, the only one when it declares one */
    const owed = declared.length === 1 ? declared[0] : addressed[0];

    if (declared.length > 1 && addressed.length !== 1) {
      fail(
        `${station.id} declares ${declared.length} waybills but ${addressed.length} end "→ the case file" — the slip cannot know which one it is owed`
      );
    } else if (!html.includes(owed)) {
      fail(
        `${study.projectId}: arrival slip does not quote ${station.id}'s waybill verbatim\n` +
          `      wanted: ${owed}`
      );
    } else {
      slips++;
      for (const other of declared.filter((w) => w !== owed)) {
        if (html.includes(other))
          fail(
            `${study.projectId}: arrival slip also quotes "${other}", which is addressed elsewhere — the yard's own handoff says only the inventory is checked in, so a slip listing the rest is a receipt for freight this file does not hold`
          );
      }
    }
  }
}

/* ══ 5 · EVERY page of the archive → the run, by fragment ══════════════
   THIS IS check-anchors.mjs's SUBJECT, MOVED HERE AND MADE STRONGER, and the
   gate it replaces is deleted in the same change.

   That gate answered "does every /#… link into the home page land on
   something", and it answered it by reading the five REACT FILES that wrote
   such links, plus `not-found.tsx`'s `STATIONS.slice(a, b)`. Phase 4 deletes
   all six. Every remaining writer of a fragment into the run — the 404's
   wayfinding index, each case file's arrival slip and rejoin link, the
   evidence index's return — derives its id from `stations.ts`, and
   `check-stations.mjs:143` already asserts each of those ids is a real `id=`
   on the run's own section. So the old gate's question was answered
   transitively and its `hard()` path had become unreachable, which for a file
   whose entire design argument is "nothing here falls back" is worse than
   deleting it.

   Reading the BUILT PAGES closes the one hole that reasoning leaves: a
   hand-written fragment in a generator would be derived from nothing, so no
   amount of binding stations.ts to the run would catch it. There are none
   today. This is what makes that permanent.

   The 404 is the reason this matters at all — it is the page GitHub Pages
   serves for every unmatched path on the site, its index is the only
   wayfinding a lost reader gets, and it once held FIVE dead links at once. */
const pagesUnder = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...pagesUnder(p));
    else if (entry.name.endsWith(".html")) out.push(p);
  }
  return out;
};
let archiveFragments = 0;
const fragmentTargets = new Set();
for (const file of pagesUnder(ARCHIVE)) {
  /* The root index.html IS the run — it links its own fragments, and
     directions 1 and 2 already read them from the source a human edits. */
  if (file === join(ARCHIVE, "index.html")) continue;
  const html = page(file);
  for (const href of hrefsIn(html)) {
    if (!href.startsWith(`${SITE}/#`)) continue;
    const id = href.slice(`${SITE}/#`.length);
    archiveFragments++;
    fragmentTargets.add(id);
    if (!runIds.has(id)) {
      fail(
        `${relative(ARCHIVE, file)}: links /#${id}, which is not an id in the run`
      );
    }
  }
}

/* ══ no array reaches a page as its own coerced join ════════════════════
   DERIVED FROM stations.ts, so a station that gains an array tomorrow is
   covered without anyone remembering to add it here.

   This started life as one tripwire on the arrival slip, where the coercion
   was found. That was the instance; this is the class. The defect shape --
   an instrument validated against another instrument instead of against the
   reader -- has now happened three times in this repo: a cargo fixture
   recorded from the rail it was checking, one regex per surface in
   check-figures, and a renderer and its gate coercing an array the same way
   and agreeing on the result. A syntactic lint over template literals would
   fire on dozens of safe interpolations and teach people to edit the gate,
   which this repo has already learned the hard way. So the guard is in the
   READER'S FRAME instead: sweep the built artifact for the one string that
   only the coercion can produce.

   `["a","b"].join(",")` is meaningless English -- a comma with no space,
   between two waybills that each end in an address. Nothing legitimate emits
   it, so this has no false positives and needs no allow-list. */
let joinSwept = 0;
for (const station of STATIONS) {
  if (!Array.isArray(station.consignment) || station.consignment.length < 2)
    continue;
  const joined = station.consignment.join(",");
  joinSwept++;
  for (const file of pagesUnder(ARCHIVE)) {
    const html = page(file);
    if (html && html.includes(joined))
      fail(
        `${relative(ARCHIVE, file)} contains the COERCED join of ${station.id}'s consignment:\n` +
          `      "${joined.slice(0, 72)}…"\n` +
          `      An array reached a template as \${...}. Select the element you mean — never join, never [0].`
      );
  }
}

/* ══ the rail cites what the live build serves ═════════════════════════
   Added 2026-08-08, after the owner went looking for the System Card links on
   the run home and could not find them: five of the six products serve one and
   only two stations cited it. The comment that produced that asymmetry argued
   "one document of record per station" and is overturned in the same change —
   the rail's family is what the PROJECT serves, and `source ↗` and
   `live build ↗` already appear there whether or not the archive holds a
   dossier.

   The station→project map is spelled out rather than derived from an id match,
   because the run's ids and the archive's ids are deliberately NOT one-to-one
   (`#work` is Applied's station; `stations.ts` calls that out as the
   crosswalk). Deriving it would either silently skip a station or need the
   same table written as a rename map somewhere less visible.

   THE EXEMPTION IS STRICT IN BOTH DIRECTIONS, which is the whole point. A
   station on the list must NOT carry the anchor: automl's card is the frozen
   "Agentic AutoML — Expo Booklet · Miami CSE 449" and the run does not cite an
   edition it cannot pin — but the day that card is refreshed and the sixth rail
   is added, a permissive exemption would sit there as a false claim forever.
   Strict, it fails and asks to be removed. */
const RAIL_CITES = [
  ["work", "jobtracker"],
  ["cadence", "taskflow-calendar"],
  ["glyph", "fast-mnist-nn"],
  ["jetpack-compress", "jetpack-compress"],
  ["lifequest", "lifequest"],
];
/* station id → why the run declines to cite its card. Adding an entry here is
   a claim that has to stay true; the strict check below is what keeps it so. */
const RAIL_EXEMPT = new Map([
  [
    "automl",
    'its card still serves the frozen expo edition ("Agentic AutoML — Expo Booklet · Miami CSE 449"), and the run does not cite an edition it cannot pin',
  ],
]);

const sectionOf = (id) => {
  const m = runHtml.match(
    new RegExp(`<section id="${id}"[\\s\\S]*?(?=\\n  <section |\\n  </main>)`)
  );
  return m ? m[0] : null;
};
let railCitations = 0;
for (const [stationId, projectId] of RAIL_CITES) {
  const project = projects.find((p) => p.id === projectId);
  const html = sectionOf(stationId);
  if (!project) {
    fail(`no project "${projectId}" in the data layer — the rail map is stale`);
    continue;
  }
  if (!html) {
    fail(`no <section id="${stationId}"> in the run — the rail map is stale`);
    continue;
  }
  if (!project.systemCardUrl) {
    fail(
      `${projectId} has no systemCardUrl, so ¶${stationId} cannot cite one — either the field was dropped or this station belongs on the exempt list with a reason`
    );
    continue;
  }
  if (!html.includes(project.liveUrl)) {
    fail(`the ¶${stationId} station does not cite ${projectId}'s liveUrl`);
  }
  if (html.includes(project.systemCardUrl)) railCitations++;
  else
    fail(
      `the ¶${stationId} station cites ${projectId}'s live build but not its system card (${project.systemCardUrl}) — the rail cites what the live build serves`
    );
}
for (const [stationId, why] of RAIL_EXEMPT) {
  const html = sectionOf(stationId);
  if (!html) {
    fail(`no <section id="${stationId}"> in the run — the exempt list is stale`);
    continue;
  }
  const project = projects.find(
    (p) => p.systemCardUrl && html.includes(p.systemCardUrl)
  );
  if (project) {
    fail(
      `¶${stationId} is on the system-card exempt list — "${why}" — but the run cites ${project.systemCardUrl} there anyway. EXEMPTION IS STALE: remove it from RAIL_EXEMPT and add the station to RAIL_CITES.`
    );
  }
}

/* ══ 6 · floors, so a broken parse fails loudly ════════════════════════
   check-links learned this the expensive way: a matcher that silently stops
   matching reports a clean run over an empty set. Every count below is a
   measured floor, not a guess. */
const floors = [
  /* 12 since 2026-08-08, and the composition matters more than the number.
     It was 13: eleven plus BOTH bench sheads, which linked the vendored
     records. Those two anchors stopped landing readers on a raw-JSON dump —
     ¶06's now cites /evidence#fast-mnist-benchmark, which argues its 3.5×
     and is still internal; ¶07's had nowhere internal to go, because no
     ledger row argues the gzip throughput, so it cites the benchmarks
     README at the pinned sha and leaves the site. That is one internal link
     genuinely gone, not a matcher that quietly stopped matching.

     This floor is deliberately NOT the thing protecting the records: the
     raw files are still offered from each .bfoot as relative downloads,
     which this filter does not count, and check-bench-artifacts binds the
     sha to the file per bench block. Lowering a floor is only honest when
     something else still holds what it was holding.

     It goes back to 13 the day the gzip throughput gets a ledger row —
     the follow-up named in that ruling — and this comment is how the next
     reader knows 12 was a decision rather than a decay. */
  ["internal links in the run", runInternal.length, 12],
  ["receipt fragments checked from the run", runFragments, 4],
  ["ledger receipt links", ledgerHrefs.length, 11],
  ["receipt anchors emitted, id by id", receiptIds, 53],
  ["case files rejoining the line", rejoins, 7],
  /* Five, not seven: `policybot` and `visual-assist` have no station to
     consign them. That asymmetry is the archive's, not a shortfall — see the
     comment above the check. */
  ["case files quoting their consignment", slips, 5],
  /* 26 links across 11 distinct stops: the 404's eleven index rows, the
     evidence index's return, and both the slip link and the rejoin link on
     each of the seven case files. */
  ["archive links into the run", archiveFragments, 26],
  ["distinct stops the archive links to", fragmentTargets.size, 11],
  /* Derived by counting citations actually found, with a floor — the rule the
     retirement incident produced. A hard-coded 5 would pass on an empty sweep
     if the section matcher ever stopped matching; a bare derived count would
     report "0 of 0, all good". Five is every project station except the one
     exempt, and the number only moves when automl's card is refreshed. */
  ["station rails citing their system card", railCitations, 5],
  /* Two arrays declared today (¶03 the yard, ¶07 jetpack). Floored so the
     sweep cannot report a clean run over an empty set — if `consignment`
     ever stops being an array everywhere, this says so out loud rather than
     printing "0 of 0, all good", which is how a guard retires itself. */
  ["array consignments swept for a coerced join", joinSwept, 2],
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
  `check-crosswalk: the seam holds in both directions, against ${process.argv[2] ?? "out"}/`
);
