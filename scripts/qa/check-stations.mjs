/**
 * `src/lib/data/stations.ts` must agree with the page it claims to describe.
 *
 * WHY THIS EXISTS. A data file that restates strings from a hand-authored HTML
 * page is a second head unless something binds them, and this repo has already
 * paid for the unbound version twice: `chapters.ts` described a seven-chapter
 * React page nobody is served, the 404 bridged it to the run with a rename map,
 * and on 2026-08-02 every link in that index was dead — because a fragment that
 * matches nothing scrolls to the top of the document and raises NOTHING. No
 * console warning, no 404, no failed request. The only instrument that finds it
 * is one that reads both files and compares.
 *
 * So this is check-figures for the run's own structure: every string in
 * `stations.ts` must appear VERBATIM in `src/run/index.html`, every id must be
 * on the section carrying that beat, and every dossier must be a case file the
 * archive actually builds AND one the station actually links.
 *
 * Reads the SOURCE, not `out/`. It has to run in the CI job that does not
 * build, and the run is copied to `out/index.html` byte for byte anyway.
 *
 * IT FAILS LOUDLY WHEN IT PARSES NOTHING. The gate this was written against —
 * `check-anchors.mjs`, deleted in Phase 4 with the React files it read —
 * resolved `chapters.ts` the same way and fell back to `?? {}` and `?? null` at
 * three points, so a rename there could silently narrow it to nothing while it
 * still printed green. That is the failure this file refuses to inherit: the
 * field regex below is strict about order, and a parse yielding anything other
 * than the run's own beat count is treated as a broken gate, not a clean page.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (p) => readFileSync(resolve(root, p), "utf8");

const run = read("src/run/index.html");
const stationsSrc = read("src/lib/data/stations.ts");
const caseStudies = read("src/lib/data/projectCaseStudies.ts");

const fail = [];
const pass = [];

/* The run's own count is the single source of truth for how many stops there
   are — the same rule check-beat-tables uses for its engine tables. */
const sections = [
  ...run.matchAll(/<section([^>]*)data-beat="(\d+)"([^>]*)>/g),
].map((m, i, all) => ({
  beat: Number(m[2]),
  id: (`${m[1]}${m[3]}`.match(/id="([^"]+)"/) ?? [])[1] ?? null,
  from: m.index,
  to: i + 1 < all.length ? all[i + 1].index : run.length,
}));
const byBeat = new Map(sections.map((s) => [s.beat, s]));

/* Entities, decoded — a reader sees "·", not "&middot;", and ¶13's kicker is
   the one that spells it as the entity. Comparing raw bytes would make the
   data file carry the run's markup, which is the wrong thing to keep in sync. */
const runText = run
  .replace(/&middot;/g, "·")
  .replace(/&mdash;/g, "—")
  .replace(/&ndash;/g, "–")
  .replace(/&rsquo;/g, "’")
  .replace(/&lsquo;/g, "‘")
  .replace(/&ldquo;/g, "“")
  .replace(/&rdquo;/g, "”")
  .replace(/&hellip;/g, "…")
  .replace(/&nbsp;|&#8202;/g, " ")
  .replace(/&amp;/g, "&");

/* Parsed as text rather than imported: this gate runs in the job that has no
   build step, and `stations.ts` is TypeScript. Field order is part of the
   pattern on purpose — a reordered or missing field drops the entry, the count
   check below fires, and the gate reports a broken parse instead of passing on
   a subset it silently stopped seeing.

   `consignment` admits three shapes since 2026-08-08: `null`, one quoted
   string, or an ARRAY of them — a corridor may declare two artifacts. The
   array branch is deliberately narrow: `\[[^\]]*\]` cannot span a nested
   bracket, so anything cleverer than a flat list of literals fails the parse
   and trips the count check rather than being half-read. Do NOT loosen this
   into a fallback; a gate that quietly checks a subset is worse than no gate,
   and that warning is older than the array. */
const parsed = [
  ...stationsSrc
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .matchAll(
      /beat:\s*(\d+),\s*id:\s*"([^"]*)",\s*name:\s*"([^"]*)",\s*kicker:\s*"([^"]*)",\s*clock:\s*"([^"]*)",\s*consignment:\s*(null|"[^"]*"|\[[^\]]*\]),\s*dossier:\s*(null|"[^"]*"),/g
    ),
].map((m) => {
  const raw = m[6];
  let consignment;
  if (raw === "null") consignment = null;
  else if (raw.startsWith("[")) {
    consignment = [...raw.matchAll(/"([^"]*)"/g)].map((q) => q[1]);
    /* an array that parsed to nothing is a broken entry, not an empty
       declaration — say so here rather than reporting "no waybill" later */
    if (!consignment.length) consignment = ["<unparsed array>"];
  } else consignment = raw.slice(1, -1);
  return {
    beat: Number(m[1]),
    id: m[2],
    name: m[3],
    kicker: m[4],
    clock: m[5],
    consignment,
    dossier: m[7] === "null" ? null : m[7].slice(1, -1),
  };
});

if (parsed.length !== sections.length) {
  console.error(
    `check-stations FAILED — parsed ${parsed.length} stations from src/lib/data/stations.ts,\n` +
      `  but the run ships ${sections.length} sections carrying data-beat.\n\n` +
      "  If a stop was added or removed, add or remove it here too. If not, the\n" +
      "  PARSE broke — the field pattern in this file is order-sensitive on purpose,\n" +
      "  so a renamed or reordered field drops an entry silently. Do not weaken it\n" +
      "  into a fallback: a gate that quietly checks a subset is worse than no gate."
  );
  process.exit(1);
}
pass.push(`${parsed.length} stations parsed, one per data-beat section`);

const beats = parsed.map((s) => s.beat);
const dense = [...Array(parsed.length).keys()];
if (String(beats) !== String(dense)) {
  fail.push(`beat indices are ${beats.join(",")}, not a dense 0..${parsed.length - 1} in run order`);
} else {
  pass.push(`beats run 0..${parsed.length - 1} in document order`);
}

/* CLOCKS is what the arc and the masthead are actually driven by; the kicker
   is what the reader is told. They have disagreed before. */
const clocks = (run.match(/const CLOCKS = \[([\d,\s]+)\]/) ?? [])[1]
  ?.split(",")
  .map((n) => Number(n.trim()));
if (!clocks) fail.push("CLOCKS not found in the run — did it get renamed?");

/* `name` is bound to its exact slot rather than to "appears somewhere": these
   are the masthead's own words, they are read by beat index, and two of them
   ("who", "glyph") are common enough elsewhere in the file that a substring
   match would pass on a name that had moved to the wrong stop. */
const phaseNames = (() => {
  const raw = run.match(/const PHASE_NAMES = \[([^\]]+)\]/)?.[1];
  if (!raw) {
    fail.push("PHASE_NAMES not found in the run — did it get renamed?");
    return null;
  }
  try {
    return JSON.parse(`[${raw}]`);
  } catch {
    fail.push("PHASE_NAMES did not parse as a list of strings");
    return null;
  }
})();

for (const s of parsed) {
  const where = `beat ${String(s.beat).padStart(2)} (#${s.id})`;
  const section = byBeat.get(s.beat);

  if (!section) {
    fail.push(`${where}: no <section data-beat="${s.beat}"> in the run`);
    continue;
  }
  if (section.id !== s.id) {
    fail.push(
      `${where}: the run's section carries id="${section.id ?? "(none)"}" — a link to /#${s.id} would scroll to the top and say nothing`
    );
  }

  /* `consignment` may be an array, so every entry is checked individually.
     Flattening it into one string would let `runText.includes("a,b")` fail for
     a reason that has nothing to do with either waybill, and — worse — a single
     `.includes` on a joined string can PASS on a substring that no declaration
     matches. One assertion per declared string, named by its index. */
  const consignments = Array.isArray(s.consignment)
    ? s.consignment
    : s.consignment === null
      ? []
      : [s.consignment];
  for (const [field, value] of [
    ["kicker", s.kicker],
    ["clock", s.clock],
    ...consignments.map((c, i) => [
      consignments.length > 1 ? `consignment[${i}]` : "consignment",
      c,
    ]),
  ]) {
    if (value === null) continue;
    if (!runText.includes(value)) {
      fail.push(`${where}: ${field} ${JSON.stringify(value)} appears nowhere in the run`);
    }
  }

  if (phaseNames && phaseNames[s.beat] !== s.name) {
    fail.push(
      `${where}: name ${JSON.stringify(s.name)}, but PHASE_NAMES[${s.beat}] is ${JSON.stringify(phaseNames[s.beat] ?? null)} — the masthead would print one word and this file hand another`
    );
  }

  /* the clock the reader is told must be the clock the arc is driven by */
  if (clocks) {
    const mins = clocks[s.beat] % (24 * 60);
    const printed = `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    if (printed !== s.clock) {
      fail.push(`${where}: kicker says ${s.clock}, CLOCKS[${s.beat}]=${clocks[s.beat]} says ${printed}`);
    }
  }

  if (s.dossier !== null) {
    if (!caseStudies.includes(`projectId: "${s.dossier}"`)) {
      fail.push(`${where}: dossier "${s.dossier}" is not a case file the archive builds`);
    }
    const body = run.slice(section.from, section.to);
    if (!body.includes(`/projects/${s.dossier}/`)) {
      fail.push(
        `${where}: claims dossier "${s.dossier}", but the station links no such case file — the crosswalk would send a reader somewhere the page never offers`
      );
    }
  }
}

/* The other direction: a case file that no station files with is fine and
   deliberate (policybot and visual-assist are reached from ¶10's receipts),
   but it should be VISIBLE rather than discovered later. */
const filed = new Set(parsed.map((s) => s.dossier).filter(Boolean));
const built = [...caseStudies.matchAll(/projectId: "([a-z-]+)"/g)].map((m) => m[1]);
const unstationed = built.filter((id) => !filed.has(id));
pass.push(
  `${filed.size} of ${built.length} case files are filed from a station` +
    (unstationed.length ? ` — ${unstationed.join(", ")} are reached from ¶10's receipts instead` : "")
);

for (const p of pass) console.log(`  · ${p}`);
if (fail.length) {
  console.error("\ncheck-stations: FAILED");
  for (const f of fail) console.error(`  ✗ ${f}`);
  console.error(
    "\n  stations.ts restates what the run prints. When they disagree the RUN is\n" +
      "  right — it is the artifact a reader is served. Fix the data file."
  );
  process.exit(1);
}
console.log(
  `\ncheck-stations: ${parsed.length} stations, every string verbatim in the run`
);
