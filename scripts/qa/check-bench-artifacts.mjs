/**
 * The bench numbers, derived from the machine output they came from.
 *
 * WHY THIS EXISTS. Until 2026-08-06 every benchmark figure on this site
 * terminated in a PROVENANCE STRING. `check-figures.mjs` bound the run's prose
 * to the data layer's prose and named the artifact in a `source:` field —
 * "benchmarks/jmh-results-rigorous.json — 422.0 / 66.2 = 6.378" — and that
 * file was in another repository. Two surfaces agreeing about a number is not
 * evidence the number is right; it is evidence they were typed by the same
 * hand. A number drawn from a file nobody can open is testimony, not a record.
 *
 * So the artifacts are vendored into `public/proof/` at the shas the site
 * pins, and every figure is RECOMPUTED from their own fields here. Nothing in
 * this file compares one sentence to another: it divides two scores and
 * checks what the page says the quotient is.
 *
 * WHAT IS VENDORED, AND WHAT IS NOT. §5.1 said "exactly the two the bars draw
 * from. Not five." Four files, two records, plus one deviation stated rather
 * than smuggled:
 *
 *   · `jetpack-jmh-rigorous-2caacd0.json`  — the 3-fork run every jetpack
 *     figure on the site comes from.
 *   · `jetpack-jmh-quick-2caacd0.json`     — THE DEVIATION. The `.bfoot` under
 *     fig. 07's bars claims "across both committed runs the ratio spans
 *     6.38–6.89×", and 6.89 is only in the quick 1-fork file. It is also where
 *     the 455 mb/s the bars used to read came from, which is the defect
 *     check-figures records at its fig. 07 entry. 9 KB to make a shipped
 *     range claim checkable and to keep a retired figure retired.
 *   · `glyph-dot256-{baseline,openmp-native}-001e9b4.json` — Glyph's
 *     dot-kernel record is TWO files, because a ratio needs both sides.
 *
 * NOT vendored, each for the reason §5.1 gives: VisualAssist's `.xcresult` is
 * a bundle directory that runs to tens of megabytes and stays on the
 * sanitized-ledger precedent `public/proof/` already establishes; the surefire
 * XML and `mnist_eval.json` are bound by `check-figures.mjs` and have no bar
 * to guard.
 *
 * The files are BYTE-IDENTICAL to the remote blobs — `git hash-object` on each
 * reproduces GitHub's own blob sha — so they are the record, not a
 * transcription of it. That includes one artefact of how the Glyph run was
 * taken: its `context.executable` is an absolute path from the machine that
 * ran it. It is left in, because it is already public in `yadava5/glyph` and
 * because editing a machine's output to look tidier is the exact move this
 * gate exists to make unnecessary.
 *
 * UNTIL 2026-08-07 THAT PARAGRAPH WAS PROSE AND NOTHING ELSE. No code computed
 * a blob sha; the only assertion below was that the filename's 7-char sha
 * appears somewhere in the data layer — that the record is PINNED, which is a
 * much weaker claim than that it is UNEDITED. A comment claiming an assertion
 * the file does not make is the exact sin this whole gate exists to prevent,
 * so it is now made real rather than softened: BLOB_SHA below pins what
 * `git hash-object` must produce for each vendored record, and the four public
 * ones were confirmed against their remote trees on the day.
 *
 * Offline on purpose. Fetching GitHub to compare would put a third-party host
 * in the deploy path, which is precisely why check-live-surfaces refuses to run
 * inside verify:portfolio. A blob sha is content-addressed: pinning the value
 * and recomputing it locally proves the bytes have not moved without needing
 * the network to say so.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const root = process.cwd();
const read = (p) => readFileSync(resolve(root, p), "utf8");

/* Git's blob sha for each vendored record: sha1("blob <len>\0" + bytes).
   Computed here rather than shelled out to `git hash-object` so the gate holds
   in a tree with no git available, and so it cannot be fooled by a .gitattributes
   filter rewriting the content on the way past. */
const gitBlobSha = (abs) => {
  const buf = readFileSync(abs);
  return createHash("sha1")
    .update(Buffer.concat([Buffer.from(`blob ${buf.length}\0`), buf]))
    .digest("hex");
};

/* The blob sha each vendored record must reproduce. The four public ones were
   confirmed against their source repositories' own trees on 2026-08-07 — the
   sha on the left IS the object id git stores in the source repo, at:

     glyph @ 001e9b4  docs/benchmarks/runs/bench-20260802-dot20x-baseline.json
     glyph @ 001e9b4  docs/benchmarks/runs/bench-20260802-dot20x-openmp-native.json
     jetpack @ 2caacd0  benchmarks/jmh-results.json
     jetpack @ 2caacd0  benchmarks/jmh-results-rigorous.json

   It covers the four records in RECORDS below and nothing else. The two
   sanitized ledgers in public/proof/ are NOT vendored machine output from
   another repo — no bar is recomputed from them here — so pinning them in this
   table would have been dead config: the loop never visits them, and a pin
   nothing checks is the same overclaim in a new place. The key set is asserted
   against RECORDS immediately below so that stays true. */
const BLOB_SHA = {
  "public/proof/glyph-dot256-baseline-001e9b4.json":
    "2132bfdfa819ed0b28d6b073ee59b322ae61b4df",
  "public/proof/glyph-dot256-openmp-native-001e9b4.json":
    "72b6b0e87b9051bd9d6dbc3aed13c70ab504ef58",
  "public/proof/jetpack-jmh-quick-2caacd0.json":
    "e56abd97d1b5948b6a6c1408b30bde84d617143c",
  "public/proof/jetpack-jmh-rigorous-2caacd0.json":
    "4fe143cdfb03b7f641081412db260b45604d2a30",
};

const fails = [];
const notes = [];
const fail = (m) => fails.push(`  ✗ ${m}`);
const note = (m) => notes.push(`  · ${m}`);

/* The markup, for the bars — they are attributes, not prose — and the prose,
   read exactly as check-figures reads it. */
const runHtml = read("src/run/index.html");
const runProse = read("src/run/index.html")
  .replace(/<script[\s\S]*?<\/script>/g, "")
  .replace(/<style[\s\S]*?<\/style>/g, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<[^>]*>/g, " ")
  .replace(/&#8202;|&nbsp;/g, " ")
  .replace(/\s+/g, " ");
const dataLayer =
  read("src/lib/data/projects.ts") +
  read("src/lib/data/projectCaseStudies.ts") +
  read("src/lib/data/proofManifest.ts");

/* ── The vendored records, and the pins their names carry ─────────────
   The sha in the filename is not decoration. §5.1: the slip and the
   vendored filename must pin the same sha. This is the half that can be
   asserted from source — every vendored file's sha must be a pin the data
   layer actually states, so a file cannot be vendored at one commit while
   the page cites another. */
const RECORDS = [
  ["jetpackRigorous", "public/proof/jetpack-jmh-rigorous-2caacd0.json", 11_000],
  ["jetpackQuick", "public/proof/jetpack-jmh-quick-2caacd0.json", 8_000],
  ["glyphBaseline", "public/proof/glyph-dot256-baseline-001e9b4.json", 40_000],
  [
    "glyphOpenmp",
    "public/proof/glyph-dot256-openmp-native-001e9b4.json",
    40_000,
  ],
];
/* BLOB_SHA and RECORDS must name the same files. A pin for a path the loop
   never visits asserts nothing while reading like coverage; a record with no
   pin is unguarded while the header says otherwise. Both are the failure this
   whole change exists to remove, so neither is allowed to appear quietly. */
{
  const pinned = Object.keys(BLOB_SHA).sort();
  const guarded = RECORDS.map(([, p]) => p).sort();
  const missing = guarded.filter((p) => !pinned.includes(p));
  const dead = pinned.filter((p) => !guarded.includes(p));
  if (missing.length || dead.length)
    fail(
      `BLOB_SHA and RECORDS disagree.\n` +
        (missing.length ? `      vendored but unpinned: ${missing.join(", ")}\n` : "") +
        (dead.length ? `      pinned but never checked: ${dead.join(", ")}\n` : "") +
        `      A pin nothing reads is not a guard.`
    );
}

const A = {};
for (const [key, path, floorBytes] of RECORDS) {
  if (!existsSync(resolve(root, path))) {
    fail(
      `${path} is not vendored — the figures below have no record to come from`
    );
    continue;
  }
  const size = statSync(resolve(root, path)).size;
  if (size < floorBytes)
    fail(
      `${path} is ${size} B, under its ${floorBytes} B floor — a truncated record`
    );
  try {
    A[key] = JSON.parse(read(path));
  } catch (e) {
    fail(`${path} is not readable JSON: ${e.message}`);
  }
  const sha = path.match(/-([0-9a-f]{7})\.json$/)?.[1];
  if (!sha) fail(`${path} carries no sha in its filename`);
  else if (!dataLayer.includes(`"${sha}"`))
    fail(
      `${path} is vendored at ${sha}, which the data layer does not pin anywhere.\n` +
        `      A record filed under a commit the page never cites is a file, not a receipt.`
    );

  /* The byte-identity claim, asserted rather than described. */
  const expected = BLOB_SHA[path];
  if (!expected) {
    fail(
      `${path} has no pinned blob sha in BLOB_SHA.\n` +
        `      Every vendored record must pin one — an unpinned file is an unguarded file,\n` +
        `      and the header comment claims all of them are unedited.`
    );
  } else {
    const actual = gitBlobSha(resolve(root, path));
    if (actual !== expected)
      fail(
        `${path} is not the record any more.\n` +
          `      git hash-object: ${actual}\n` +
          `      pinned:          ${expected}\n` +
          `      The vendored file has been edited. Re-vendor it from the source repo\n` +
          `      rather than re-pinning: the point of the pin is that the bytes are theirs.`
      );
  }
}
if (fails.length) {
  console.error("check-bench-artifacts FAILED before measuring anything:");
  for (const f of fails) console.error(f);
  process.exit(1);
}
note(`${RECORDS.length} records vendored, each at a sha the data layer pins`);

/* ══════════════════════════════════════════════════════════════════
   jetpack — JMH, throughput mode, ops/s where one op is one byte.
   ══════════════════════════════════════════════════════════════════ */
const jmh = (run, needle) => {
  const b = run.find((x) => x.benchmark.endsWith("." + needle));
  if (!b) fail(`the JMH record has no ${needle} benchmark`);
  return b;
};
const R = {
  par: jmh(A.jetpackRigorous, "parallelVirtualThreads"),
  one: jmh(A.jetpackRigorous, "singleThreadedJdk"),
  vec: jmh(A.jetpackRigorous, "vector"),
  sca: jmh(A.jetpackRigorous, "scalar"),
  jdk: jmh(A.jetpackRigorous, "jdkIntrinsic"),
};
const score = (b) => b.primaryMetric.score;
const MB = (b) => Math.round(score(b) / 1e6);
const GB = (b) => (score(b) / 1e9).toFixed(2);

/* Each row: what the artifact says, and where the site must say it. */
const DERIVED = [
  {
    what: "jetpack parallel throughput",
    value: String(MB(R.par)),
    expect: "422",
    run: /422 vs 66 mb\/s/i,
    data: /422 vs 66 MB\/s/,
    how: "parallelVirtualThreads.primaryMetric.score ÷ 1e6, rounded",
  },
  {
    what: "jetpack single-threaded throughput",
    value: String(MB(R.one)),
    expect: "66",
    run: /422 vs 66 mb\/s/i,
    data: /422 vs 66 MB\/s/,
    how: "singleThreadedJdk.primaryMetric.score ÷ 1e6, rounded",
  },
  {
    what: "jetpack parallel speed-up",
    value: (score(R.par) / score(R.one)).toFixed(1),
    expect: "6.4",
    run: /6\.4× single-threaded java\.util\.zip/,
    data: /6\.4× vs single-threaded java\.util\.zip/,
    how: "parallelVirtualThreads ÷ singleThreadedJdk, 1 dp",
  },
  {
    what: "jetpack Adler-32 absolute",
    value: GB(R.vec),
    expect: "4.26",
    run: /4\.26 gb\/s/i,
    data: /4\.26 GB\/s/,
    how: "vector.primaryMetric.score ÷ 1e9, 2 dp",
  },
  {
    what: "jetpack Adler-32 vs scalar",
    value: (score(R.vec) / score(R.sca)).toFixed(1),
    expect: "2.8",
    run: /adler-32 vectorised 2\.8× scalar/i,
    data: /2\.8× vs scalar/,
    how: "vector ÷ scalar, 1 dp",
  },
  {
    what: "the JDK intrinsic the site declines to beat",
    value: GB(R.jdk),
    expect: "14.06",
    run: /14\.06 gb\/s/i,
    data: null,
    how: "jdkIntrinsic.primaryMetric.score ÷ 1e9, 2 dp",
  },
  {
    what: "Glyph dot-256 kernel speed-up, as the page rounds it",
    value: null, // filled below
    expect: "3.5",
    run: /parallel dot-256 kernel 3\.5× vs -O3/,
    data: /3\.5× parallel dot kernel/,
    how: "benchDot/256_median baseline ÷ openmp-native, 1 dp",
  },
  {
    what: "Glyph dot-256 kernel speed-up, as the register states it",
    value: null, // filled below
    expect: "3.536",
    run: null,
    data: /re-measured at 3\.536×/,
    how: "benchDot/256_median baseline ÷ openmp-native, 3 dp",
  },
];

/* ══════════════════════════════════════════════════════════════════
   Glyph — Google Benchmark, 20 repetitions, medians.
   ══════════════════════════════════════════════════════════════════ */
const median = (run, name) => {
  const r = run.benchmarks?.find((b) => b.name === `${name}_median`);
  if (!r) fail(`the Glyph record has no ${name}_median row`);
  return r?.real_time;
};
const dotBase = median(A.glyphBaseline, "benchDot/256");
const dotOmp = median(A.glyphOpenmp, "benchDot/256");
if (dotBase && dotOmp) {
  DERIVED[6].value = (dotBase / dotOmp).toFixed(1);
  DERIVED[7].value = (dotBase / dotOmp).toFixed(3);
}

for (const d of DERIVED) {
  if (d.value === null) continue;
  if (d.value !== d.expect) {
    fail(
      `${d.what}: the record computes ${d.value}, this gate expects ${d.expect}\n` +
        `      (${d.how}). Either the artifact was re-vendored or the expectation is wrong —\n` +
        `      do not adjust the expectation to match a file that changed underneath it.`
    );
    continue;
  }
  const missing = [];
  if (d.run && !d.run.test(runProse)) missing.push("the run does not state it");
  if (d.data && !d.data.test(dataLayer))
    missing.push("the data layer does not state it");
  if (missing.length)
    fail(`${d.what} = ${d.value} (${d.how}) — ${missing.join("; ")}`);
}
note(
  `${DERIVED.filter((d) => d.value !== null).length} figures recomputed from the records and found on the page`
);

/* ── The method claims, which are figures too ─────────────────────────
   "3-fork jmh · 99.9% ci", "jdk 25", "median of 20 repetitions" are all
   assertions about how a number was taken, and a wrong one is a wrong
   number wearing a method. */
const forks = Object.values(R).map((b) => b.forks);
if (!forks.every((f) => f === 3))
  fail(
    `the run says "3-fork jmh" and the record reports forks ${forks.join(", ")}`
  );
else if (!/3-fork jmh/.test(runProse))
  fail(`the record is 3 forks and the run no longer says so`);
else
  note(
    `3 forks, on all ${forks.length} rigorous benchmarks, and the run says so`
  );

/* JMH does not write its confidence LEVEL into the JSON, so this asserts what
   the file can support: a two-sided interval that actually brackets the score.
   The 99.9% in the run's prose is JMH's default and is not claimed to be read
   from here — saying which half is checked is the point. */
const ciOk = Object.values(R).every(
  (b) =>
    Array.isArray(b.primaryMetric.scoreConfidence) &&
    b.primaryMetric.scoreConfidence[0] < score(b) &&
    b.primaryMetric.scoreConfidence[1] > score(b)
);
if (!ciOk)
  fail(`a rigorous benchmark reports no interval bracketing its own score`);
else if (!/99\.9% ci/.test(runProse))
  fail(
    `the record carries confidence intervals and the run no longer cites them`
  );
else
  note(
    `every rigorous score is bracketed by its own interval (JMH's default 99.9%)`
  );

const vm = R.par.vmVersion ?? "";
if (!vm.startsWith("25."))
  fail(
    `the run says "jdk 25" and the record ran on ${vm || "an unrecorded VM"}`
  );
else if (!/jdk 25/i.test(runProse))
  fail(`the record is JDK ${vm} and the run no longer says so`);
else note(`JDK ${vm}, and the run says 25`);

const reps = A.glyphBaseline.benchmarks?.find(
  (b) => b.name === "benchDot/256_median"
)?.repetitions;
if (reps !== 20)
  fail(
    `the corrections register says "the median of 20 repetitions" and the record reports ${reps}`
  );
else if (!/median of 20 repetitions/.test(dataLayer))
  fail(`the record is 20 repetitions and the register no longer says so`);
else note(`20 repetitions behind the Glyph median, and the register says so`);

const ctx = A.glyphBaseline.context ?? {};
if (ctx.num_cpus !== 10)
  fail(
    `the register calls the reference machine an M1 Pro (10 cores) and the record ran on ${ctx.num_cpus}`
  );
else if (ctx.cpu_scaling_enabled !== false)
  fail(
    `the Glyph record was taken with CPU scaling enabled — the medians are not comparable`
  );
else
  note(
    `Glyph's record: 10 cores, scaling off, load_avg ${ctx.load_avg?.[0]?.toFixed(2)}`
  );

/* ══════════════════════════════════════════════════════════════════
   THE BARS. C28 proved these were invisible to every gate on this site.

   The four ratios were hard-coded literals inside a module script —
   `(t * (1 / 3.5))` and `(t * (66 / 422))` — and `check-figures.mjs:28`
   strips <script> before matching, so they were unreachable by construction.
   Injecting 1 / 1.8 and 66 / 900 in a temp copy inflated the two claims by
   ~1.9× and ~2.1×, and check-figures exited 0 and check-beat-tables exited 0.
   The most persuasive object on two stations, guarded by nothing.

   §5.5 settled them and moved the ratio into the markup as a FRACTION, which
   is what makes this gate almost free: the numerator and the denominator are
   matched against the records' own derived values as strings, with no float
   tolerance and no script parsing at all. If they had been settled as
   computed percentages this would have to compare floats, which is a worse
   gate for no gain.

   What this CANNOT see is a fraction that is well-formed and invalid —
   `scaleX(calc(1 / 3.5px))` parses here and is dropped by the browser. That
   is measured in a real engine by run-home.spec.ts, which reads the rendered
   fill/track ratio off getBoundingClientRect. The two halves are deliberate:
   this one holds the claim, that one holds the drawing.
   ══════════════════════════════════════════════════════════════════ */
const benchOrder = [...runHtml.matchAll(/<div class="bench( jet)?"/g)].map(
  (m) => (m[1] ? "jetpack" : "glyph")
);
const fills = [
  ...runHtml.matchAll(/<span class="bfill" style="([^"]*)">/g),
].map((m) => m[1]);
const vals = [...runHtml.matchAll(/<span class="bval">([^<]*)<\/span>/g)].map(
  (m) => m[1].replace(/&#8202;/g, " ").trim()
);
if (
  benchOrder.length !== 2 ||
  benchOrder[0] !== "glyph" ||
  benchOrder[1] !== "jetpack" ||
  fills.length !== 4 ||
  vals.length !== 4
) {
  /* A floor, and it is the one that matters most here: a regex that stops
     matching reports a clean run over an empty set, and every assertion below
     would pass vacuously. Measured 2026-08-06: two benches in document order
     (¶06 Glyph, ¶07 jetpack), four bars, four values. */
  fail(
    `read ${benchOrder.length} benches (${benchOrder.join(", ") || "none"}), ${fills.length} bars and ` +
      `${vals.length} values out of the run — expected glyph then jetpack, 4 and 4.\n` +
      `      That is a broken parse, and every bar assertion below would pass on it.`
  );
} else {
  const glyphX = (dotBase / dotOmp).toFixed(1);
  /* [bar style, expected, what it is] in document order. The parallel lane of
     each pair is the full track by definition — it IS the denominator — so it
     is asserted literally rather than as a fraction. */
  const BARS = [
    [
      fills[0],
      `transform:scaleX(calc(1 / ${glyphX}))`,
      "Glyph, one thread at -O3",
    ],
    [fills[1], `transform:scaleX(1)`, "Glyph, openmp on all cores"],
    [
      fills[2],
      `transform:scaleX(calc(${MB(R.one)} / ${MB(R.par)}))`,
      "jetpack, java.util.zip on one thread",
    ],
    [fills[3], `transform:scaleX(1)`, "jetpack, virtual threads"],
  ];
  for (const [got, want, what] of BARS)
    if (got !== want)
      fail(
        `the bar for ${what} is drawn at "${got}"\n` +
          `      and the records make it "${want}". The bars are the most persuasive\n` +
          `      object on these two stations; until 2026-08-06 nothing read them at all.`
      );
  /* The values beside them, from the same records. */
  const VALS = [
    [vals[0], "1×", "Glyph baseline"],
    [vals[1], `${glyphX}×`, "Glyph parallel"],
    [vals[2], `${MB(R.one)} mb/s`, "jetpack single-threaded"],
    [vals[3], `${MB(R.par)} mb/s`, "jetpack parallel"],
  ];
  for (const [got, want, what] of VALS)
    if (got !== want)
      fail(
        `the ${what} bar is labelled "${got}" and the record says "${want}"`
      );
  if (!fails.length)
    note(
      `4 bars bound to their records as fractions — 1/${glyphX} and ${MB(R.one)}/${MB(R.par)}, numerator and denominator`
    );

  /* ── The 3.5× the old gate could not see ─────────────────────────────
     check-figures binds exactly one of the run's three statements of this
     number: the ¶06 provenance line. The fig. 06 bar label and ¶10's litany
     receipt were both unbound, which is how a figure comes to be stated three
     times and checked once. All three are held to the record here. */
  const glyphSites = [
    [
      new RegExp(`parallel dot-256 kernel ${glyphX}× vs -O3`),
      "¶06's provenance line",
    ],
    [
      new RegExp(`parallel dot kernel — ${glyphX}× over -O3`),
      "¶10's litany receipt",
    ],
  ];
  for (const [re, where] of glyphSites)
    if (!re.test(runProse))
      fail(`${where} does not state the record's ${glyphX}× — ${re}`);
  if (vals[1] !== `${glyphX}×`)
    fail(`fig. 06's bar label does not state the record's ${glyphX}×`);
  note(
    `all three of the run's statements of ${glyphX}× are bound — provenance, bar label, ¶10 receipt (one was, before)`
  );

  /* ── The slip's sha, paired with the file it cites ────────────────────
     §5.1 asks for this and could not have it until §5.5 wrote the slip: the
     bench shead prints "@ <sha>" and the block offers a vendored record
     whose FILENAME carries a sha. If those two ever disagree the page cites
     one commit and serves another, and both halves look right on their own.

     The two used to be ONE anchor, and this gate matched it as one. They
     were split on 2026-08-08: a shead that linked the raw .json landed the
     reader on the browser's JSON viewer — proof, but not a page — so the
     shead now points at the argument (/evidence for ¶06, the benchmarks
     README for ¶07) and the raw record is offered from the .bfoot as an
     explicit download. The PAIRING is the invariant, not the markup that
     carried it, so it is re-bound here per BLOCK rather than per anchor:
     each .bench must print a sha and offer the record vendored under it.
     Splitting them is exactly the move that could have let the two drift
     apart unnoticed, which is why the check follows them across. */
  const blocks = runHtml
    .split(/<div class="bench\b/)
    .slice(1)
    .map((b) => b.slice(0, b.indexOf("</figcaption>")));
  if (blocks.length !== 2)
    fail(
      `read ${blocks.length} bench blocks in the run, expected 2 — ¶06 and ¶07`
    );
  else {
    for (const [i, block] of blocks.entries()) {
      const where = `the ${i === 0 ? "¶06" : "¶07"} bench block`;
      /* either arrow: ⟶ stays on the site (¶06 → /evidence), ↗ leaves it
         (¶07 → the benchmarks README, there being no ledger row for the
         gzip throughput). The sha is what this is reading; the glyph only
         says where the argument lives. */
      const cited = block.match(/@ ([0-9a-f]{7}) [⟶↗]<\/a>/);
      const record = block.match(
        /href="(?:[^"]*\/)?proof\/([a-z0-9-]+-([0-9a-f]{7})\.json)"[^>]*\bdownload\b/
      );
      if (!cited) {
        fail(`${where} prints no "@ <sha>" slip`);
        continue;
      }
      if (!record) {
        fail(
          `${where} offers no vendored record as a download.\n` +
            `      The raw run record must stay reachable from the block that quotes it —\n` +
            `      repointing the shead at an argument does not excuse orphaning the proof.`
        );
        continue;
      }
      const [, file, fileSha] = record;
      if (fileSha !== cited[1])
        fail(
          `${where} prints "@ ${cited[1]}" and offers ${file}, which is vendored at ${fileSha}.\n` +
            `      The page would cite one commit and serve another, and each half reads correctly alone.`
        );
      if (!existsSync(resolve(root, `public/proof/${file}`)))
        fail(`${where} offers public/proof/${file}, which is not vendored`);
    }
    if (!fails.length)
      note(
        `2 bench blocks print a sha and offer the record vendored under it, download not landing`
      );
  }
}

/* ── The retired figure, asserted absent ──────────────────────────────
   The quick 1-fork run is where 455 mb/s and 6.89× come from. The bars read
   455 while the prose two kilobytes above them read 422, and check-figures
   exited 0 the whole time. It is vendored so the .bfoot's range is checkable
   AND so the number the site deliberately does not use has somewhere to live
   other than a comment. */
const Q = {
  par: jmh(A.jetpackQuick, "parallelVirtualThreads"),
  one: jmh(A.jetpackQuick, "singleThreadedJdk"),
};
const quickRatio = (score(Q.par) / score(Q.one)).toFixed(2);
const rigorousRatio = (score(R.par) / score(R.one)).toFixed(2);
const span = `${rigorousRatio}–${quickRatio}×`;
if (!runProse.includes(span))
  fail(
    `the two committed runs span ${span} and fig. 07's .bfoot does not say so.\n` +
      `      That line is the only place the site admits the spread; if it moves, it moves here.`
  );
else note(`fig. 07's spread note states ${span}, both ends recomputed`);

const quickMB = MB(Q.par);
if (new RegExp(`${quickMB} mb/s`, "i").test(runProse))
  fail(
    `the run states ${quickMB} mb/s — that is the QUICK 1-fork figure, and the bars read it\n` +
      `      until 2026-08-03 while the prose above them read ${MB(R.par)} from the rigorous run.\n` +
      `      Both numbers are real; only one is the one this site cites.`
  );
else
  note(
    `the quick run's ${quickMB} mb/s stays off the page — ${MB(R.par)} is the cited figure`
  );

for (const n of notes) console.log(n);
if (fails.length) {
  console.error(
    `\ncheck-bench-artifacts FAILED — the page and its records disagree:`
  );
  for (const f of fails) console.error(f);
  process.exit(1);
}
console.log(
  `\ncheck-bench-artifacts: every bench figure is derived from a file a reader can open`
);
