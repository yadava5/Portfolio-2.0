/**
 * Cross-check the run's headline figures against the production data layer.
 *
 * The run is hand-authored HTML and the data layer is TypeScript, so every
 * number the site states lives in TWO places with nothing binding them. That
 * is not hypothetical drift: on 2026-07-31 a single audit found the two
 * disagreeing on jetpack's throughput (6.5x vs 6.4x), its Adler-32 multiplier
 * (2.8x vs 2.9x in the résumé), Applied's CI floor (named vs deliberately
 * vague), and AutoML's team size — and every correction had to be applied
 * twice by hand.
 *
 * This asserts the pairs that matter still agree. It is deliberately a small
 * allow-list of headline figures rather than a general extractor: a general
 * one would either miss the interesting cases or drown in false positives,
 * and a guard nobody trusts gets deleted.
 *
 * Each entry names WHERE the truth came from, because the lesson of that
 * audit was that prose about evidence goes stale while the evidence does not.
 *
 * Round 13 added clause 2b, WHAT A FIGURE MAY NO LONGER SAY. A ruling that
 * takes a claim OUT of a drawing is the kind that comes back, because the
 * words stay true elsewhere in the run and nothing reads as a lie when a
 * later redraw restores them. It is checked against the label and against
 * the builder's own drawing code, since fig. 03's meter lived in the
 * drawing rather than in the alt text.
 * Dry-run against HEAD while writing it: silent on the shipped figure, and
 * shown able to fail on a body with `"compliance across 61 projects"` put
 * back and a label carrying "97 percent" — 3 hits.
 * TODO(labrat): run check-figures on a temp copy with that string restored
 * and record the measured line here; I author the checks and cannot run
 * them.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (p) => readFileSync(resolve(root, p), "utf8");

/* The run, twice: the markup for anything that is an attribute (figure
   roles, aria-labels, plate structure) and the prose for anything a reader
   reads. */
const runHtml = read("src/run/index.html");
/* Declared here rather than beside the loop that fills them: the figure
   gate below runs before it and pushes into both. */
const fails = [];
const notes = [];
/* The run's prose only — scripts and styles carry unrelated numbers. */
const runProse = read("src/run/index.html")
  .replace(/<script[\s\S]*?<\/script>/g, "")
  .replace(/<style[\s\S]*?<\/style>/g, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<[^>]*>/g, " ")
  .replace(/&#8202;|&nbsp;/g, " ")
  .replace(/\s+/g, " ");

/* ── THE SURFACES, NAMED ───────────────────────────────────────────────
   This used to be `const dataLayer = projects + cases` — one concatenated
   haystack — and that is how a contradiction certified itself as consistent
   for four days. The "Glyph · kernel speed-up" pair was satisfied by
   projects.ts and projectCaseStudies.ts was therefore never asked, so the
   site shipped "parallelism carries all of it" on / and "the openmp+simd dot
   kernel is 3.5× faster" on /projects/fast-mnist-nn/ at the same time, about
   the same measurement, with this gate printing "agrees".

   It is the same hole recorded below for the Applied suite count and fixed
   there for one figure only: A CONSISTENCY CHECK THAT CANNOT SEE ONE OF THE
   SURFACES IT IS MEANT TO RECONCILE WILL CERTIFY A CONTRADICTION AS
   CONSISTENT. Fixed as a rule here — every entry NAMES the file(s) it
   expects its figure in, and a figure claimed on two files is asserted on
   both.

   Four surfaces, because four files state numbers a reader sees: the two
   data-layer files, the proof manifest (which /evidence/ renders — the
   third surface the Applied note names), and the archive's fig. 1 plates,
   whose drawn labels and aria-labels are prose no other gate reads. */
const SURFACES = {
  projects: "src/lib/data/projects.ts",
  cases: "src/lib/data/projectCaseStudies.ts",
  manifest: "src/lib/data/proofManifest.ts",
  plates: "scripts/archive/case-figures.mjs",
};
const surfaceText = Object.fromEntries(
  Object.entries(SURFACES).map(([name, path]) => [name, read(path)])
);

/**
 * `data` is a map from surface name to the pattern that surface must carry.
 * Naming a surface is an assertion; omitting one is a declaration that the
 * figure is not claimed there. An unknown key is a hard failure rather than
 * a silent no-op — a typo'd surface name would otherwise disable an
 * assertion while the line still reads like one.
 *
 * @type {{figure: string, run: RegExp, data: Record<string, RegExp>, source: string}[]}
 */
const FIGURES = [
  {
    figure: "jetpack · parallel speed-up",
    /* r13: the run no longer says "single-threaded" (no new hyphens), so
       the baseline is bound in the words it now uses. Same truth: 6.4× over
       java.util.zip on ONE thread. projects.ts keeps its own phrasing. */
    run: /6\.4× faster than java\.util\.zip on one thread/,
    data: { projects: /6\.4× vs single-threaded java\.util\.zip/ },
    source: "benchmarks/jmh-results-rigorous.json — 422.0 / 66.2 = 6.378",
  },
  {
    figure: "jetpack · parallel throughput",
    run: /422 vs 66 mb\/s/i,
    data: { projects: /422 vs 66 MB\/s/ },
    source: "benchmarks/jmh-results-rigorous.json, 3 forks",
  },
  {
    figure: "jetpack · Adler-32 vs scalar",
    /* American spelling since r13: vectorized */
    run: /adler-32 vectorized 2\.8× scalar/i,
    data: { projects: /2\.8× vs scalar/ },
    source: "benchmarks/jmh-results-rigorous.json — 4256.6 / 1518.2 = 2.804",
  },
  {
    figure: "jetpack · Adler-32 absolute",
    run: /4\.26 gb\/s/i,
    data: { projects: /4\.26 GB\/s/ },
    source: "benchmarks/jmh-results-rigorous.json — 4256.6 MB/s",
  },
  {
    figure: "Applied · CI macro-F1 floor",
    run: /below 0\.95 macro-f1/i,
    data: { cases: /0\.95/ },
    source: "jobtracker .github/workflows/backend-ci.yml — --min-macro-f1 0.95",
  },
  {
    figure: "Applied · backend suite",
    run: /3,747 passed · 0 skipped · 13 expected failures/,
    // This entry read 278 · 10 while proofManifest.ts already said 305 · 0, and
    // the gate still exited 0 -- because it only compares run/index.html against
    // projectCaseStudies.ts and never reads the manifest at all. Both stale
    // surfaces agreed with each other, so "agrees" was printed and the site
    // shipped 305 on /evidence/ and 278 on / at the same time. A consistency
    // check that cannot see one of the three surfaces it is meant to reconcile
    // will certify a contradiction as consistent.
    //
    // The manifest is now DECLARED here rather than described in a comment, so
    // the third surface this note names is read on every run. It phrases the
    // count its own way, which is exactly why one regex over one concatenated
    // haystack could never have covered both.
    data: {
      cases: /3,747 tests passed, 0 skipped/,
      manifest: /3,747 passed and 0 skipped/,
    },
    source:
      "`pytest tests -q` at head a0d77a1, 2026-08-03 — 305 passed, 0 skipped (+27 on 03fc5c4: 10 CORS, 7 benchmark guard, 10 RLS that no longer skip)",
  },
  {
    figure: "Glyph · MNIST accuracy",
    run: /97\.01%/,
    data: {
      projects: /97\.01/,
      cases: /97\.01/,
      manifest: /97\.01/,
      plates: /97\.01/,
    },
    source:
      "committed eval at GLYPH_EVAL_SHA; regenerated byte-identical 2026-08-02",
  },
  /* ── added by the 2026-08-02 provenance audit ──────────────────────
     Each of these was measured by running the project, and each was
     found disagreeing across surfaces or unguarded. The Applied and
     Cadence suite counts are the two that had actually drifted; the
     rest are pinned here so the next drift is a red gate rather than a
     reader's discovery. */
  {
    figure: "Cadence · suite",
    run: /1,430 passed · 0 skipped/,
    // THIS ENTRY IS THE ONE THE APPLIED TWIN ABOVE WARNED ABOUT, and it went on
    // to fail in exactly the way that comment describes -- one number shipping
    // as THREE values with the gate green:
    //
    //   architecture node label  1,159   (x2 on the built case file)
    //   receipt 01               1,185
    //   /evidence index          1,179
    //
    // Two holes, both of them the Applied entry's own documented holes:
    //
    //   1. No `manifest:` key, so proofManifest.ts -- the third surface -- was
    //      never read. It phrased the count its own way ("1,179 tests, 0
    //      skipped") and disagreed with both others in silence.
    //   2. No binding for the architecture node label. `cases` matched the
    //      receipt's sentence, the node label is a different string in the same
    //      file, and a regex that finds one says nothing about the other. That
    //      is why the node could sit two revisions behind the receipt beside it.
    //
    // Both are closed here. The node label is bound as its own figure below
    // rather than folded in, because a single regex satisfied by the receipt
    // would certify the label unread -- which is the whole defect.
    // A THIRD HOLE, found 2026-08-08 by grepping the SHIPPED out/ for the old
    // number rather than by re-reading the source. The /evidence entry states
    // the count twice: once as its headline, and once at the end of a
    // provenance chain naming every value this number has had --
    // "1,145 at 69a59e7, then 1,159 at 8eee84e, …, now N here". Only the
    // headline was bound, so the entry shipped saying 1,186 three times and
    // then "now 1,185 here" in its own closing sentence. Both phrasings are
    // bound now, via an array (see the loop below): a surface that states a
    // figure twice is two claims.
    // A FOURTH HOLE, and the same one a fourth time: `projects` was never
    // declared here, so projects.ts's own highlight -- the string the case
    // cards and the atlas read -- was never asked. Added 2026-09-28 with the
    // split inside the same regex, because on that surface the count and its
    // two parts are one sentence and binding half of it is what this entry's
    // own history is a list of.
    data: {
      projects: /1,430 passed and 0 skipped \(772 frontend \+ 658 backend\)/,
      cases: /1,430 tests passing under vitest, with 0 skipped/,
      manifest: [
        /1,430 tests, 0 skipped/,
        /then 1,186 at abaaea8, now 1,430 here/,
      ],
    },
    source:
      "CI run 31464527681 at head 6d09ee4, 2026-08-11 — 772 frontend + 658 backend, 0 skipped",
  },
  {
    /* The architecture figure's own node label, which is a separate string in
       projectCaseStudies.ts from the receipt sentence above and drifted 26 days
       behind it. It carries no "tests passing"/"skipped" prose, so it needs its
       own binding -- see the comment on `Cadence · suite`. There is no `run:`
       key because the run does not draw this figure; the entry exists to hold
       the case file's diagram to the same number as the case file's receipt. */
    figure: "Cadence · architecture node label",
    run: null,
    data: { cases: /label: "1,430 tests"/ },
    source: "same CI run; the diagram must agree with the receipt beside it",
  },
  {
    figure: "Cadence · suite split",
    /* THE RUN STATES THIS SPLIT TWICE, IN TWO PHRASINGS, and until 2026-08-08
       only one of them was bound:

         ¶03 prov strip  "635 frontend + 551 backend"   (long form)
         the ¶03 index   "635 fe + 551 be"              (short form)

       When the count moved 1,185 -> 1,186 the short form was updated and the
       long form was not, so the run shipped "1,186 passed" beside
       "635 frontend + 550 backend" — a total that does not equal its own
       parts — and THIS GATE PASSED, because its one `run` regex matched the
       short form and never looked at the other. Caught by hand-reading the
       out/index.html diff before re-baselining the golden hash, which is the
       only reason the rule exists.

       Both phrasings were asserted from then until 2026-09-23, when the
       clarity pass cut the gate card's per-station rows and took the short
       form off the page with them. ONE phrasing now, so one binding — and
       the rule the two-form era taught is kept as a rule rather than as a
       dead regex: if the split is ever stated twice again, both get bound,
       because a regex that finds one says nothing about the other. */
    /* r13: the run's split is now parenthesised, "(635 frontend, 551
       backend)"; same two parts, same total. The case file keeps its "+". */
    run: /\(772 frontend, 658 backend\)/,
    data: { cases: /772 frontend \+ 658 backend/ },
    source: "same run; the split must agree with the total it sums to",
  },
  /* ── THE RUN STATES THIS COUNT THREE TIMES, AND UNTIL 2026-09-28 ONE OF
     THEM WAS BOUND. ¶05's provenance line is the entry above. The other two
     are ladders — the stops menu at the top of the page and ¶12's timetable
     at the bottom — and they say the figure in the same four words, so
     reverting either to 1,186 left every gate in the tree green and shipped a
     stale number to a reader-visible surface. That is labrat's measurement
     rather than an inference and rather than mine — its round-15 integration
     report §9.1 put `1,186` back on each ladder in turn, BUILT the tree, and
     recorded check-figures, check-stations, check-beat-tables and
     check-crosswalk over the built out/ all at exit 0 with `1,186` present in
     the shipped html. What is measured here is the other half: that each
     binding below goes red on that same revert, one entry per ladder.

     TWO ENTRIES AND NOT ONE `run` REGEX, for the reason this file keeps
     relearning: the two strings are IDENTICAL once the tags are stripped, so
     a single regex is satisfied by whichever comes first and certifies the
     other unread — the precise defect the `manifest` array above exists for,
     and the precise defect that let the architecture node label sit two
     revisions behind the receipt beside it. Each is anchored on the words to
     its left, which is the only thing that tells them apart in prose, and each
     is its own entry so a failure NAMES which ladder went stale rather than
     saying "run: MISSING" about one of two. */
  {
    figure: "Cadence · suite, the stops menu",
    run: /calendar in plain English 1,430 tests pass/,
    data: { projects: /1,430 passed and 0 skipped/ },
    source:
      "same CI run 31464527681; the stops menu must agree with projects.ts's highlight",
  },
  {
    figure: "Cadence · suite, the ¶12 timetable",
    /* "cadence 1,430" adjacent is what the stops menu does NOT say — it puts
       the noun ("calendar in plain English") between them — so this regex
       cannot be satisfied by the menu above. */
    run: /12:06 cadence 1,430 tests pass/,
    data: { projects: /1,430 passed and 0 skipped/ },
    source:
      "same CI run 31464527681; the timetable must agree with projects.ts's highlight",
  },
  {
    figure: "Glyph · MNIST correct count",
    run: /9,701 of 10,000/,
    data: {
      projects: /9,701 correct/,
      cases: /9,701 correct/,
      manifest: /9,701 correct/,
      /* The plate has a 232-unit line to spend, so it draws the fraction. */
      plates: /9,701\/10,000/,
    },
    source: "regenerated mnist_eval.json, byte-identical to the committed one",
  },
  {
    figure: "Glyph · macro-F1",
    run: /macro-f1 0\.9698/i,
    data: {
      projects: /macro-F1 0\.9698/,
      cases: /macro-F1 0\.9698/,
      manifest: /macro-F1 0\.9698/,
      /* The plate is in the lowercase mono apparatus voice, not prose. */
      plates: /macro-f1 0\.9698/,
    },
    source: "regenerated mnist_eval.json — 0.969822",
  },
  {
    figure: "Glyph · kernel speed-up",
    /* Tags are stripped before matching, so the <b> around 3.5× is gone
       by the time this runs — match the prose, not the markup. */
    /* r13: "dot-256" was the benchmark's name, not a reader's word. It is
       benchDot/256, a 256×256 matrix product (glyph bench_matrix.cpp:36-46),
       and the run now says so; the ratio, the core count and the -O3
       baseline are all still bound. */
    run: /256×256 matrix product: 3\.5× faster on 10 cores than one core at -O3/,
    /* FOUR SURFACES, because the number is stated on four. Until 2026-08-06
       this entry named one regex, projects.ts satisfied it, and the case
       file and its plate were never asked — which is how they went four days
       crediting a different cause for the same measurement. */
    data: {
      /* r15: the reader-facing name follows the run everywhere now, so the
         data layer states the subject once and states it the same way. */
      projects: /3\.5× on the 256×256 matrix product/,
      cases: /3\.5× faster under OpenMP than the -O3 baseline/,
      manifest: /3\.5× on the 256×256 matrix product/,
      plates: /3\.5 times the single-thread -O3 baseline/,
    },
    source:
      "docs/benchmarks/runs/bench-20260802-dot20x-* (20 reps) — median real_time 4,818,901ns → 1,362,717ns = 3.536×; the 3.520× this line used to cite had no committed JSON",
  },
  {
    /* THE ATTRIBUTION, WHICH IS THE THING THE DATA DECIDES. The entry above
       binds the number; this one binds what earns it, because the number was
       never in dispute and the attribution was — the run said "parallelism
       carries all of it" while the case file said "openmp+simd", on the same
       site, about the same measurement, with every gate green.

       Bound on all five surfaces a reader can reach it from. The negative
       half is below, in FORBIDDEN: this pair proves the right sentence is
       present, and that one proves the retired one is gone, which is the
       assertion a reword cannot walk around. */
    figure: "Glyph · what earns the 3.5×",
    /* r13: the run's attribution is now its muted line, which names OpenMP
       as what earned the 3.5× on the one matrix product. The SIMD aside is
       gone from home; the case file still carries it and is still bound. */
    run: /across 10 cores with OpenMP, and one 256×256 matrix product got 3\.5× faster/,
    data: {
      projects:
        /the 3\.5× is openmp against the -O3 baseline; the SIMD is compiled into both/,
      cases: /the parallelism carries all of it/,
      manifest: /the speed-up is OpenMP’s, not SIMD’s/,
      plates: /the hand-written vector path being compiled into both/,
    },
    source:
      "all three configurations BUILT rather than read out of BENCHMARKS.md: on arm64 the `baseline` and `native` binaries are byte-identical (-march=native is an x86 flag clang does not act on here), so the NEON path is in both sides of the comparison and the whole ratio is OpenMP's — which is also why a SIMD-alone measurement sits at ~1.0, comparing a binary with itself",
  },
  {
    /* THE NAME OF THE THING MEASURED, bound on its own because round 15
       renamed it and the rename reached three surfaces no gate could see.
       "dot-256" was the benchmark's function name, not a reader's word; the
       run, the case file and the plates all say "256×256 matrix product"
       now. The two entries above bind the RATIO and what EARNS it, and both
       are satisfied by sentences that never repeat the subject — so with the
       subject reverted on all three of these surfaces at once, every gate in
       the tree stayed green and the page shipped two names for one benchmark.
       That is the same shape as the Cadence ladders: agreement between the
       surfaces a gate happens to read is not coverage of the surfaces a
       reader reaches.

       Three surfaces, one figure. The run's bench block heading is the
       visible one on home; the plate carries it twice, once in the alt text
       a screen reader gets for fig. 1 and once as lettering inside the
       drawing, which no other gate reads at all — the same place fig. 03's
       compliance meter hid from clause 2b. The drawn label's DATE is left
       loose on purpose: it is the commit the bench was filed at, a different
       fact with a different source, and pinning it here would make a legitimate
       re-file read as a rename. */
    figure: "Glyph · the 256×256 subject name",
    run: /the committed bench · 256×256 matrix product/,
    data: {
      plates: [
        /the 256×256 matrix product measured under OpenMP/,
        /"256×256 · committed \d{4}-\d{2}-\d{2}"/,
      ],
    },
    source:
      "glyph bench_matrix.cpp:36-46 — benchDot/256 is a 256×256 matrix product; the reader-facing name follows the run on every surface since r15",
  },
  {
    figure: "Applied · eval set",
    /* r13: American spelling, cased unit, and the stage qualifier moves
       into the binding: "the rules stage, not the cascade" became "rules
       alone", and a 0.990 without it credits the cascade with the rules'
       score. */
    run: /1 wrong out of 96 labeled emails \(0\.990 macro-F1\), rules alone/,
    /* Was a bare /96/ over the concatenation, which matched `#2496ed` in
       projects.ts's tech-stack colours. Scoping it to the file that states
       the claim is the reform; naming the noun is what makes the scoping
       worth anything. Both forms are in the file, at the eval-set row and
       the provenance note. */
    data: { cases: /96 (messages|samples)/ },
    source:
      "classifier_eval_v3.jsonl counted 2026-08-02 — 96 samples, 8 classes, 12 each; baseline_rules_v3.json (applied@bf1b1d03, 2026-09-07) reports 1 misclassified, macro-F1 0.9896. It read 2 misclassified on 2026-08-02, before the rules moved.",
  },
  {
    figure: "Applied · rule count",
    /* r13: the count now lives in the muted line, "220 rules I wrote" */
    run: /220 rules I wrote/,
    /* Same defect, worse: a bare /201/ matched `U+201C/201D` in this file's
       own typographic-law header, so the entry would have stayed green with
       the rule count deleted. Bound to the phrase the file actually uses.

       201 ⟶ 220 ON 2026-09-23, and the `cases` regex moves with it for a
       reason worth stating. It read /201-rule/, which matched the case
       file's 2026-08-02 CORRECTIONS NOTE — a history entry, not a live
       claim. So the entry would have gone on printing "cases: states it"
       with the case file's live text saying anything at all, because a
       corrections register never stops containing the number it corrected.
       A gate must bind what the page ASSERTS, not what it remembers. This
       is now bound to the live phrasing, and it goes red until the case
       file's own text moves to 220 — which is the true state of the site
       today and exactly what a reader would find. */
    /* Bound to receipt 05's own sentence, which no corrections entry uses,
       so the register can never satisfy it. */
    data: { cases: /the stage of 220 rules at this pin/ },
    source:
      "backend/jobtracker/classifier/rules.py PATTERNS, AST-counted at 0285675c (rules.py last touched 2690de02, 2026-09-09) — 129 strong + 31 weak + 60 negative = 220, the 48 vetoes excluded; the demo space and both rules.json copies count 220 too. Was 106 + 26 + 69 = 201, true at 36a2f54",
  },
  {
    /* The pair is a MEASUREMENT THAT CAN NEVER BE RE-TAKEN, which is the
       only reason it is bound here rather than left as prose. The weights
       were withdrawn on 2026-08-15 (1efb0b38) because they were fitted
       partly on a real mailbox, so nobody can reproduce the export — and
       Applied's own README:460-465 says the figure "is now an attested
       number rather than a reproducible one, and it should be described
       that way wherever it is cited". An attested number with no way back
       to its source is precisely the kind that drifts unnoticed, so all
       three surfaces are pinned to the byte literals instead. */
    figure: "Applied · int8 ONNX export size",
    /* r13: ⟶ is kept for links to this site; the size change is words now */
    run: /90 MB to 23 MB/,
    data: {
      projects: /int8 ONNX export, 90 to 23 MB/,
      cases: /int8 ONNX export of the same model, 90 to 23 MB/,
    },
    source:
      "scripts/readme_facts.py:2481-2507 pins 90,362,391 B fp32 and 22,843,695 B int8, measured 2026-08-03 and marked withdrawn; 90,362,391 / 1e6 = 90.4 and 22,843,695 / 1e6 = 22.8",
  },
  {
    /* Bound on 2026-08-14, the day the number stopped being unverifiable.
       The station-fact audit restored "2,173 commits" with an explicit
       caveat that it rested on the owner's knowledge — the GitHub repo was
       a four-to-nine-commit squashed snapshot and the real history sat
       behind Miami's GitLab auth, so no reader could check it and no gate
       could either. The 12 August consolidation put the whole lineage on
       a public `main`, which is what makes this bindable at all.

       PINNED, not floating. `main`'s head is 2,187 as this is written and
       will keep moving; 2,186 is the count reachable from 5e42233, the
       commit this site already pins for the tool counts. A figure that
       tracks a branch tip is a figure that goes red on someone else's
       push. */
    /* AutoML's first measured number, and deliberately not a result — no
       committed eval artifact earns an accuracy figure here and none is
       quoted. Bound the day the total became true: the landing suite had
       never executed on any CI run in that repository (it was in the
       workflow's cache paths and nowhere else), so any earlier total would
       have included 93 tests nothing had run. 31778517442 was the first run
       where all three suites actually executed.

       CITE THE COMMIT, NOT "MAIN HEAD". This source line said "at main head
       44fbe4f9" and was false within hours -- five more merges landed the
       same day and a head is a pointer that moves under you. A commit sha is
       permanent and still checkable, so the citation names the sha and
       records where the figure was re-verified. Same trap as the pins in
       check-links: a sha that is ON the branch is durable, a sha that IS the
       branch tip is a claim with an expiry date.

       RE-TAKEN at 44fbe4f9. The security PR that quotes SQL identifiers,
       bounds the tuning timeout and de-fangs the markup regexes added 33
       backend tests, so the figure this file bound hours earlier (2,490 at
       14cbf5f) described a superseded head the moment that merged. Frontend
       and landing are untouched; the whole delta is backend, 1,412 -> 1,445
       and 127 -> 130 files. Note what did NOT catch this: `run` and `cases`
       agreed with each other perfectly while both were stale, because this
       check compares the page to the case file, not either to CI. When you
       merge into a repo this page quotes, re-read the number from the run. */
    figure: "AutoML · suite",
    run: /2,523 automated tests, all passing: 1,445 backend · 985 frontend · 93 landing/,
    data: {
      cases:
        /2,523 tests green on CI, 1,445 backend \+ 985 frontend \+ 93 landing/,
    },
    source:
      "CI run 31804338459 on commit 44fbe4f9, 2026-08-14 — backend 130 files/1,445 tests, frontend 122/985, landing 16/93 with 2 skipped, 0 failures. Re-verified unchanged at 09b144f9 (run 31821550028) after five further merges: the licence/booklet fix, two dependency bumps, the audit-fix sweep and the README gate.",
  },
  {
    figure: "AutoML · commit count",
    /* OFF HOME 2026-09-23, still bound on the case file. The clarity pass
       capped ¶09 at two provenance rows and a commit count is not one of
       the two things a reader needs from that station. `run: null` is a
       declaration that the run does not claim it — not a retirement: the
       number is still asserted where it is still stated. */
    run: null,
    data: { cases: /2,186 commits reachable from the pinned commit 5e42233/ },
    source:
      'git rev-list --count 5e42233 = 2,186 in a clone of yadava5/ai-augmented-auto-ml-toolchain, and GitHub\'s own paginator agrees for main at per_page=1 (rel="last" page 2,187 after one further commit); contributors ShreeChaturvedi 1,237 + yadava5 937 + 8 + 1',
  },
  {
    /* The largest blast radius of anything the audit corrected: this
       string reaches the meta description, og:description,
       twitter:description, the TechArticle JSON-LD node, the
       SoftwareSourceCode node and the visible deck — and it said FOUR
       until 2026-08-02. Bound here because nothing else could see it.

       AND IT IS FOUR AGAIN (2026-08-08). Not a reversal of the audit —
       the audit was right when it ran, and this entry is the proof it
       was: it pinned the claim to a source reading, so when the source
       changed the gate went red instead of the page going quietly
       stale. glyph@68f1362 (2026-08-06) added `dot_wasm128_rowvec` to
       src/NeuralNet.cpp — real wasm_f64x2_* intrinsics with two
       accumulators, whose own comment says the shape is "exactly what
       LLVM's autovectorizer declines to do for this loop", so it is a
       hand-written kernel and not the compiler flag the old reading
       described. The qualifier is load-bearing and travels with the
       number: FOUR is true of the NeuralNet dot kernels, THREE is
       still true of src/Matrix.cpp, which grew no wasm branch. A bare
       "four" here would trade one stale number for one imprecise one. */
    figure: "Glyph · hand-written instruction sets",
    /* OFF HOME 2026-09-23, same cap, same reason — and note what this entry
       has now done twice: it caught the number going stale in 2026-08, and
       it is the reason the qualifier above survives the line leaving the
       page. The case file still states it and is still bound. */
    run: null,
    data: { cases: /Four hand-written instruction sets in the dot kernels/ },
    source:
      "glyph@68f1362 src/NeuralNet.cpp guards __AVX512F__, __AVX2__, __ARM_NEON and __wasm_simd128__ over a scalar fallback — four hand-written dot kernels, the wasm one being dot_wasm128_rowvec; src/Matrix.cpp still guards only the first three",
  },
  {
    /* The bar LABEL had no pair here, which is why it drifted unnoticed:
       the bars rendered 455 mb/s from the quick 1-fork run while the prose
       two kilobytes above them read 422 from the rigorous 3-fork one, and
       this gate exited 0 the whole time. A figure the run states and the
       data layer states is exactly what this file exists to bind. */
    figure: "jetpack · fig. 07 bar label",
    run: /virtual threads 422 mb\/s/i,
    data: { projects: /422 vs 66 MB\/s/ },
    source:
      "benchmarks/jmh-results-rigorous.json — 422.0 MB/s, 3 forks; the bars read the quick 1-fork 455 until 2026-08-03",
  },
  {
    figure: "jetpack · suite",
    run: /72 tests, 0 failures/,
    data: { projects: /72 tests/, manifest: /72 tests, 0 failures/ },
    source:
      "`mvn test` on JDK 25.0.3, 2026-08-02 — surefire XML sums to tests=72 errors=0 skipped=0 failures=0",
  },
  {
    /* This pair was declined until 2026-08-05, and the reason was written
       down here rather than left implicit: "VisualAssist is not one of the
       run's stations", so its run side could never match and the gate would
       have failed forever. That reason has now expired — ¶10's fourth
       receipt states the figure — and a documented gap that can be closed
       and is not becomes a standing excuse. It is closed with the same
       commit that made it closable.

       Still not a station, and deliberately so: the argument for a 14th
       stop was that a project with a receipt deserves one, and the answer
       was that ¶10 is where receipts live. The figure is on the page; the
       day is still twelve stops long. */
    figure: "VisualAssist · iOS suite",
    run: /71 passed · 0 skipped/,
    data: { projects: /71 unit tests for models and utilities/ },
    source:
      "xcodebuild test at VisualAssistTests @ 22ebdaa, run twice — iOS 26.5 and 26.2 — 71 passed, 0 failed, 0 skipped, read from the .xcresult via xcresulttool rather than console text",
  },
];

/* ══════════════════════════════════════════════════════════════════
   THE FIGURES, AS FIGURES — and the first draft of this rule would have
   shipped an accessibility regression.

   That draft said "ten figures, ten narrative labels, a floor on each",
   reasoning from the archive's rule that every case-file plate carries a
   `[role="img"]` with a name over 60 characters. MEASURED, ONLY SIX OF THE
   TEN RUN FIGURES ARE DRAWINGS:

     drawings, narrative label               03 04 06 07 08 09
       of those, role="img" (still)          03    06    08 09
       of those, role="group" (2026-09-23)      04    07
     HTML text plates, no role               02 05 10 11

   The four text plates' accessible experience IS their text. `role="img"`
   makes descendants presentational — and fig. 02 contains TWO REAL LINKS
   (github, linkedin). Applying the rule uniformly would have removed two
   working links from assistive technology in the name of accessibility. The
   archive's Cadence plate took `role="img"` because it is a settled still, an
   image made of HTML; the run's fig. 05 is interactive and 02/10/11 are
   dockets whose text is the content.

   AND A LENGTH FLOOR MEASURES THAT A LABEL EXISTS, NOT THAT IT NARRATES.
   FIGURES.md rule 7: the label states what is drawn AND what is deliberately
   not — fig. 09's deploy "which never lights", fig. 08's "a deliberate hold,
   not a fall". No character count can see either clause vanish, so each
   drawing declares the tokens its label must keep.

   Source-level, so it runs under --no-e2e and in the gates job. The one thing
   it cannot see is whether a drawing RENDERS; atlas covers that for the
   archive's plates and run-home measures the bench bars.
   ══════════════════════════════════════════════════════════════════ */
{
  /* Every figure's own markup, opening tag through </figure>. The caption is
     INSIDE the slice on purpose — fig. 05's "hover a chip to see its words"
     and fig. 10's "a refused gate is the system working" are claims that live
     there, and a slice that stopped at the figcaption reported both as
     missing on the first run of this gate. */
  const figureBlock = (n) => {
    const cap = runHtml.indexOf(`<figcaption>fig. ${n}`);
    if (cap < 0) return null;
    const open = runHtml.lastIndexOf("<figure", cap);
    const close = runHtml.indexOf("</figure>", cap);
    return open < 0 || close < 0 ? null : runHtml.slice(open, close);
  };
  const NUMBERS = ["02", "03", "04", "05", "06", "07", "08", "09", "10", "11"];
  const missing = NUMBERS.filter((n) => figureBlock(n) === null);
  if (missing.length)
    fails.push(`  ✗ the run is missing fig. ${missing.join(", fig. ")}`);
  /* C30: there is no fig. 01 and that is structural, not lost — beat 0 holds
     the nameplate and the Machado epigraph, neither a <figure>. Asserted so a
     later renumbering has to argue with something. */
  if (runHtml.includes("<figcaption>fig. 01"))
    fails.push(
      `  ✗ the run has grown a fig. 01. The rule is fig. NN = data-beat + 1 and beat 0\n` +
        `      holds the nameplate and the epigraph, neither of which is a figure. If that\n` +
        `      changed, it changed deliberately and this line is where it is argued.`
    );

  /* ── 1 · STRUCTURAL. Catches a NEW drawing added unlabelled, which an
     enumerated list cannot. `#net` is included by id because it is a drawing
     that does not wear the figsvg class. */
  const drawings = [
    ...runHtml.matchAll(
      /<svg\b([^>]*\bclass="figsvg"[^>]*|[^>]*\bid="net"[^>]*)>/g
    ),
  ].map((m) => m[0]);
  if (drawings.length !== 6)
    fails.push(
      `  ✗ found ${drawings.length} drawings (svg.figsvg plus #net), expected 6.\n` +
        `      Measured 2026-08-06: pathFig, appliedFig, net, jetFig, questFig, amlFig.`
    );
  /* ── 1a · THE ROLE, AND WHY IT IS NOT ONE ROLE.
     This said `role="img"` for all six until 2026-09-23, and that rule shipped
     an accessibility defect of its own. A labelled image's descendants are
     PRESENTATIONAL — that is the whole point of the role, and §3 below leans
     on it — but figs. 04 and 07 inject focusable `g[role="button"]` marks, so
     their controls sat inside an element that says "I have no children". axe
     calls that `nested-interactive`, impact serious, and it went unseen for
     as long as it did because the a11y spec's tag filter had no Level A in
     it. `group` is the role for a labelled drawing WITH interactive parts:
     the narrative label still names the plate, and the marks inside it exist.

     WHICH FIGURES THOSE ARE IS DERIVED, NOT LISTED. A hand-written pair here
     would let a THIRD figure grow a trace and keep `role="img"`, which is the
     defect arriving again with this gate green over it. The run wires every
     interactive plate through one function, `traceOn(svg, labels, marks, …)`,
     whose third argument names the figure's own state object — and that
     object declares the svg id it drives. So the set is read off the call
     sites. If that derivation ever breaks it empties, and an empty set
     demands `role="img"` from figures that carry `group`: it fails toward
     red, which is the right way round. */
  const traced = [
    ...runHtml.matchAll(/traceOn\(\s*\w+\s*,\s*\w+\s*,\s*(\w+)\./g),
  ].map((m) => m[1]);
  const INTERACTIVE = new Set(
    traced
      .map(
        (name) =>
          runHtml.match(
            new RegExp(`const ${name} = \\{[^}]*svg: \\$\\("([^"]+)"\\)`)
          )?.[1]
      )
      .filter(Boolean)
  );
  if (INTERACTIVE.size !== 2)
    fails.push(
      `  ✗ read ${INTERACTIVE.size} interactive drawings off the traceOn() call sites, expected 2.\n` +
        `      Measured 2026-09-23: appliedFig (fig. 04) and jetFig (fig. 07). Either a plate\n` +
        `      gained or lost its trace — in which case its role moves with it — or the\n` +
        `      derivation above stopped reading the run, which is the same fix either way.`
    );
  for (const tag of drawings) {
    const id = tag.match(/id="([^"]+)"/)?.[1] ?? "(unnamed)";
    const label = tag.match(/aria-label="([^"]*)"/)?.[1] ?? "";
    const want = INTERACTIVE.has(id) ? "group" : "img";
    if (!new RegExp(`role="${want}"`).test(tag))
      fails.push(
        `  ✗ the ${id} drawing must carry role="${want}"\n` +
          (want === "group"
            ? `      It has focusable marks inside it, and role="img" makes them presentational —\n` +
              `      axe's nested-interactive, serious. role="group" keeps the label and the marks.`
            : `      It is a still drawing. role="img" is what makes its label stand in for the\n` +
              `      picture; anything looser exposes strokes and glyphs with no reading order.`)
      );
    if (label.length < 60)
      fails.push(
        `  ✗ the ${id} drawing's aria-label is ${label.length} characters, floor 60.\n` +
          `      It is what a screen reader gets for the drawing. Shortest shipping is 116.`
      );
  }

  /* ── 1b · THE GRAMMAR, AS ARITHMETIC. FIGURES.md rule 2: the seat chooses
     the edition, and the floor is arithmetic rather than taste —
     rendered px = authored px × seat ÷ viewBox width, floor ~10–11.

     The run already owns the mechanism: `chooseEditions()` declares a minimum
     seat per figure and rebuilds on the tight 240-unit plate below it. So the
     wide editions are checkable from three declared numbers, and the check is
     what makes a redraw safe: widen a viewBox without raising the seat
     minimum and the labels cross the floor at the narrowest width that still
     gets the wide plate — which is exactly the congestion FIGURES.md
     diagnoses in figs. 03 and 04, arriving silently.

     The TIGHT editions are built in JavaScript and their viewBox is written
     at run time, so they are not readable here; the archive's own note
     records the measured band (11.4px at a 248px seat, 15.1px at the 330px
     cap) and §5.4's redraw is what has to hold it. Saying which half is
     covered beats implying both are. */
  const FLOOR_PX = 10;
  const fontOf = (sel) =>
    Number(
      runHtml.match(new RegExp(`${sel}\\{[^}]*font-size:([\\d.]+)px`))?.[1] ?? 0
    );
  const wideFont = fontOf("\\.figsvg text");
  const netFont = fontOf("#net text");
  /* ` {2}` rather than two literal spaces: ESLint's no-regex-spaces is right
     that they are hard to count, and this one closes on the run's own
     two-space indentation. */
  const seatsBlock =
    runHtml.match(/const seats = \{([\s\S]*?)\n {2}\};/)?.[1] ?? "";
  const seats = Object.fromEntries(
    [...seatsBlock.matchAll(/(\w+): \[[^,]+, (\d+),/g)].map((m) => [
      m[1],
      Number(m[2]),
    ])
  );
  const EDITIONS = [
    ["path", "pathFig", "fig. 03"],
    ["applied", "appliedFig", "fig. 04"],
    ["net", "net", "fig. 06"],
    ["jet", "jetFig", "fig. 07"],
    ["quest", "questFig", "fig. 08"],
    ["aml", "amlFig", "fig. 09"],
  ];
  if (!wideFont || !netFont || Object.keys(seats).length !== 6) {
    fails.push(
      `  ✗ could not read the edition arithmetic — figsvg font ${wideFont || "?"}px, ` +
        `#net font ${netFont || "?"}px, ${Object.keys(seats).length} seats (expected 6).\n` +
        `      A broken parse here would pass every figure silently.`
    );
  } else {
    const band = [];
    for (const [seatKey, id, fig] of EDITIONS) {
      const tag = drawings.find((t) => t.includes(`id="${id}"`));
      const vb = Number(tag?.match(/viewBox="0 0 (\d+)/)?.[1] ?? 0);
      const font = id === "net" ? netFont : wideFont;
      const seat = seats[seatKey];
      if (!vb || !seat) {
        fails.push(
          `  ✗ ${fig} (${id}): no viewBox or no declared minimum seat`
        );
        continue;
      }
      const rendered = (font * seat) / vb;
      band.push(rendered);
      if (rendered < FLOOR_PX)
        fails.push(
          `  ✗ ${fig} (${id}) renders its labels at ${rendered.toFixed(1)}px at its own minimum\n` +
            `      seat — ${font}px authored × ${seat}px seat ÷ ${vb} viewBox units, floor ${FLOOR_PX}.\n` +
            `      Anything below the floor moves to the figcaption or a numbered key. It is never shrunk.`
        );
    }
    if (band.length === 6)
      notes.push(
        `  · the wide editions label at ${Math.min(...band).toFixed(1)}–${Math.max(...band).toFixed(1)}px ` +
          `at their own minimum seats (floor ${FLOOR_PX}px, by arithmetic)`
      );
  }

  /* ── 2 · DECLARED TOKENS. The clause a redraw would quietly drop. */
  const DRAWING_TOKENS = [
    [
      "pathFig",
      "fig. 03",
      [
        /* THE DISPOSITIONS, which are what this plate is for. ¶03's own
           handoff line says "only the master inventory is published; the rest
           stays on miami's own systems", and the drawing says the same thing
           in the reviewer's two marks: a check on the solid box, a strike on
           the dashed one. A redraw that keeps both boxes and loses this turns
           two products into two equals.
           The wording is the PRODUCT'S, not a negation of the other's: the
           pair used to read "checked in" / "not checked in", which made the
           withheld one sound like a failure to file rather than a thing that
           belongs to somebody else. */
        "checked in",
        "stays with IT Services",
        /* the two sources, so a redraw cannot quietly drop one of them the
           way round 13 dropped the third */
        "Two feeder roads",
      ],
      "the two sources, and the dispositions the run states in prose",
    ],
    [
      "appliedFig",
      "fig. 04",
      [
        /* `defers at the clay gate` STOOD HERE and is deliberately retired.
           It described a fourth bucket the machine does not have: measured at
           the pinned sha, `needs_review` is a bool on a ClassificationResult
           that STILL CARRIES ITS CATEGORY (hybrid.py:115, `CONFIDENCE_AUTO =
           0.85`), so filing it as a destination drew a flag as a place. The
           clay moment did not go away — it moved to the hold, below. */
        "leaves at the first desk that clears it",
        /* The architecture the old plate stated backwards. hybrid.py:248
           returns the moment the rules layer is at 0.90 or better;
           embeddings and SetFit are never imported. Marching every mark
           through all three columns in series says the opposite of the
           station's whole argument. */
        "which desk takes which verdict is drawn, not measured",
        /* THE DISCLOSURE, and the most important string in this list. The
           plate assigns a verdict to a desk — offer to the regexes,
           pending_application to SetFit — and NOTHING owns that mapping: the
           one committed evaluation runs `hybrid_profile: deterministic`,
           which disables SetFit, so in the only record that exists the third
           desk settled nothing at all. A redraw that keeps the routing and
           drops this sentence turns a drawing into a measurement.

           "for a person to settle" STOOD HERE until 2026-09-23 and is
           replaced rather than retired: the clarity pass rewrote the label
           to state the THRESHOLD the old phrase only gestured at, and the
           new sentence is the stronger binding of the same fact. The hold
           is a person's, and now the label says when it reaches one. */
        "held below in a clay ring",
        "A person reviews it if its confidence is 0.70 or more",
        "still filed under its category and only flagged",
        /* Receipt 09's fact: on the serverless path it returns after layer 1
           even when the rules were unsure. */
        "only the rules desk runs",
      ],
      "the cascade, the hold that is not a bucket, and the routing the plate says out loud it did not measure",
    ],
    ["net", "fig. 06", ["784-100-10"], "the structure the drawing is of"],
    [
      "jetFig",
      "fig. 07",
      [
        "one gzip member",
        /* The reassembly, which is the trick. Blocks return to stream
           position i whatever lane wrote them, and the lane→slot deltas run
           both directions so it reads as reassembly rather than drift. At the
           settled frame all eight blocks are identical pine and lane identity
           is recoverable only by hover — which is display:none on touch — so
           this clause and the plate's own footer are what carry it for
           everyone else. */
        "in stream order and not in lane order",
        /* THE DISCLOSURE. The lane assignment and the eight block widths are
           hand-authored constants (JET_OUT_WIDE / JET_OUT_TIGHT), and §4b
           names the trap for this figure by name: narrowing the blocks TO
           jetpack's measured compression ratio would animate a committed
           number under the reader's scroll and would arrive looking like
           precision. The widths deliberately vary per block so no single
           ratio can be read out of them. */
        "are drawn and not measured",
        /* `1f 8b 08` and `crc32 · isize` are RFC 1952's own field names, not
           measurements — rule 6's `1f 8b` exception, and the label has to keep
           saying so or the lettering becomes a claim about this build. */
        "come from the gzip format itself",
      ],
      "the reassembly, the widths that are drawn rather than measured, and the format's own notation",
    ],
    [
      "questFig",
      "fig. 08",
      [
        "a deliberate hold, not a fall",
        /* The redraw's central fact, and the one a later hand undoes without
           noticing: the built work has a BODY and the unbuilt work is a void,
           and a redraw that keeps five profiles and loses that distinction is
           back to five bare lines with the plate no longer saying what
           "built" means.
           The WORDING moved once, with the drawing, and only the wording. The
           stair in section said the void was "beneath the two unbuilt steps",
           because its unbuilt treads had nothing under them. The elevation
           that replaced it says the void is INSIDE the two unbuilt floors,
           which is the same fact about the same two things — what was not
           built is drawn as absence, at the largest scale on the plate. */
        "nothing is drawn inside the two unbuilt floors",
        /* Two holds, and they are NOT the same hold: scale is blocked from
           outside, and a finished product is simply not claimed — which is why
           its tread is the one line on the plate that stops in mid-air rather
           than ending at anything. Flattening them back into one "held" is the
           easy edit, from either side, so both are declared. */
        "held for a partner or funder",
        "held because it is not claimed",
        /* THE VERB, and it is the honesty clause. ¶08's own prose says the
           project was BORN at Social Innovation Weekend, March 2025 — "a
           7-person team, one weekend". Turning "born at" into "built in" would
           claim three shipped features were finished inside 48 hours, which
           nothing owns. This locks the honest word. */
        "born at Social Innovation Weekend",
      ],
      "what is deliberately NOT drawn (rule 7), the two holds that are not one hold, and the verb the station actually uses",
    ],
    [
      "amlFig",
      "fig. 09",
      [
        "their timing staged for the drawing",
        "which never lights",
        /* Added with §4b's redraw. The plate now DRAWS the sandbox the
           station's prose has always claimed (":1816 — the llm's python runs
           in a locked-down docker sandbox — non-root · read-only fs") as a
           frame the tools' stem is the only thing to cross. It is the one new
           fact in the drawing and therefore the one a later edit drops
           silently: a redraw that keeps the paths and loses the containment
           says the model reaches into the runtime. */
        /* cased since r13: Docker is a proper noun */
        "inside a Docker sandbox",
      ],
      "the staging disclosure, the gate that never opens, and the containment the run claims in prose",
    ],
  ];
  /* ── 2b · WHAT A FIGURE MAY NO LONGER SAY. A ruling that removes a claim
     from a drawing is the kind that comes back: the words are still true
     somewhere else in the run, so nothing reads as a lie when a later redraw
     restores them. Round 13: the owner ruled the compliance story out of
     fig. 03 — the legacy Laravel reporter, the ETL feed, the 37-month
     dashboard and the 97% meter — and the figure now carries two feeders and
     two products. These strings are checked against the label AND against
     the builder's own source, because the meter lived in the drawing rather
     than in the alt text. */
  const RETIRED = [
    [
      "pathFig",
      "fig. 03",
      [
        "97 percent",
        "97%",
        "compliance",
        "61 projects",
        "legacy laravel",
        "etl feed",
        "37 month",
        "teamdynamix",
      ],
      "the compliance story the owner ruled out of this plate in round 13",
    ],
  ];
  for (const [id, fig, words, why] of RETIRED) {
    const tag = runHtml.match(new RegExp(`<svg id="${id}"[^>]*>`))?.[0] ?? "";
    const label = tag.match(/aria-label="([^"]*)"/)?.[1] ?? "";
    /* the builder's own body for this plate: from its function to the next
       top-level closing brace */
    const body =
      runHtml.match(/function buildPath\(tight\)[\s\S]*?\n}\n/)?.[0] ?? "";
    if (!tag || !body)
      fails.push(
        `  ✗ ${fig}: the retired-words check found no ${tag ? "buildPath body" : `<svg id="${id}">`} to read`
      );
    for (const w of words) {
      const esc = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const where = label.toLowerCase().includes(w.toLowerCase())
        ? "its label"
        : new RegExp(`["'\`][^"'\`]*${esc}`, "i").test(body)
          ? "its drawing"
          : null;
      if (where)
        fails.push(`  ✗ ${fig} says "${w}" again, in ${where}\n      ${why}`);
    }
  }

  for (const [id, fig, tokens, why] of DRAWING_TOKENS) {
    const tag = drawings.find((t) => t.includes(`id="${id}"`));
    if (!tag) {
      fails.push(`  ✗ ${fig}'s ${id} is not among the run's drawings`);
      continue;
    }
    const label = tag.match(/aria-label="([^"]*)"/)?.[1] ?? "";
    for (const t of tokens)
      if (!label.includes(t))
        fails.push(`  ✗ ${fig}'s label no longer says "${t}"\n      ${why}`);
  }

  /* ── 3 · THE TEXT PLATES, ASSERTED AS TEXT. Their claims verbatim, and a
     NEGATIVE assertion that nobody "fixes" them into images later. */
  /* fig. 11's stops, read out of the data layer. THE FLOOR IS EXACTLY THREE
     and it is not a round number: Randall's branch starts at one stop and
     Shree's at two, so a parse that finds fewer has silently stopped binding
     one of them, and a parse that finds more is matching something that is
     not a station record. Either way every regex built below would be built
     from the wrong thing. */
  const reEsc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const stationsSrc = read("src/lib/data/stations.ts");
  const FIG11_STOPS = ["path", "glyph", "automl"]
    .map((id) => {
      const from = stationsSrc.indexOf(`id: "${id}"`);
      if (from < 0) return null;
      const block = stationsSrc.slice(from, from + 900);
      const name = block.match(/name:\s*"([^"]+)"/)?.[1];
      const clock = block.match(/clock:\s*"([^"]+)"/)?.[1];
      return name && clock ? { id, name, clock } : null;
    })
    .filter(Boolean);
  if (FIG11_STOPS.length !== 3)
    fails.push(
      `  ✗ fig. 11's stops could not be derived from stations.ts — found ` +
        `${FIG11_STOPS.length} of 3 (path, glyph, automl).\n` +
        `      Every name and clock the figure is checked against is built from these, so a\n` +
        `      short read here checks nothing and prints the same green line as a clean file.`
    );

  const TEXT_PLATES = [
    {
      fig: "02",
      what: "the record card",
      claims: [
        "answers for every claim on this page",
        /* the em dash became a middle dot in the 2026-09-23 dash sweep; the
           claim is the degree, the school and the date, not the punctuation
           between them */
        /* r13: cased, and the date sits in a no-wrap span, so claims are
           matched with tags stripped (see the loop below) */
        "B.S. Computer Science · Miami University, May 2026",
      ],
      /* THE REASON THE NEGATIVE EXISTS. role="img" makes descendants
         presentational, and these two links work. */
      exposed: [/>github ↗<\/a>/, /linkedin ↗<\/a>/],
    },
    {
      fig: "05",
      what: "the parse",
      claims: ["hover a chip to see its words", "next Tuesday at noon"],
      /* The week grid IS legitimately aria-hidden — it is an empty grid and
         the chips carry the reading. The chips are not, and must not become
         so; that is the difference between decoration and content. */
      exposed: [/<span class="chip" id="chWho"[^>]*>sam<\/span>/],
      hiddenOk: ["cadWeek"],
    },
    {
      fig: "10",
      what: "the reviewer's marks",
      claims: [
        /* "a refused gate…" until 2026-09-23. The three stamps below it now
           read passed / declined / caught, and "refused" was the word a
           skimmer read as failure — which inverted the whole claim of the
           plate. The sentence keeps its job and loses the word that was
           fighting it. */
        /* r13 (owner's copy ruling): the ghead slogan, the legend and the
           "unsigned" tail are cut. What they protected was that two of the
           three checks did NOT pass and that the line goes on to a person.
           The first is now the caption's own count, the second the close. */
        "three checks on my own work: one passed, two said no.",
        "the next stop is a person.",
        /* §4b's commission, made checkable. The marks used to float beside
           the gate names; they are now inked INSIDE a frame standing on a
           line that runs down the register, and below the third gate that
           line runs on dashed with nothing signing it. The tail is the
           plate's new claim and it is the one a later edit drops while the
           rows still look right — at which point the drawing goes back to
           three glyphs with no subject, which is what FIGURES.md called
           unresolved in the first place. Kept in the LEG rather than only in
           the figcaption because the leg is inside the plate. */
      ],
      /* one stamp per disposition, and all three are asserted: two rows
         saying the same word is the state this plate had before, when both
         non-passing gates read "refused" and the difference between a gate
         that declined and a check that caught something was lost. */
      /* r13: PolicyBot's quote check "caught", Glyph's claim "retracted" */
      exposed: [/>passed<\/span>/, />caught<\/span>/, />retracted<\/span>/],
    },
    {
      fig: "11",
      what: "the references",
      /* r14: the plate stopped describing who these people are and started
         saying WHERE they saw the work. Each branch begins at the stops that
         person was at, and those stops' names and clocks are `stations.ts`'s
         own, DERIVED here rather than typed — rename a station or move its
         clock and the figure comes with it or this goes red.
         Bound as `exposed` rather than as claims, and that is the difference
         between a gate and a decoration: claims are matched against the
         block with its tags stripped, so "the yard" still passes when the
         plate says "the yards". A tag-delimited match cannot. */
      claims: [
        "each reference joins the line from the stops where its writer saw me work.",
      ],
      exposed: [
        />Randall Vollen</,
        />Shree Chaturvedi</,
        ...FIG11_STOPS.flatMap((st) => [
          new RegExp(`>${reEsc(st.name)}<`),
          new RegExp(`>${reEsc(st.clock)}<`),
        ]),
      ],
    },
  ];
  for (const p of TEXT_PLATES) {
    const block = figureBlock(p.fig);
    if (block === null) continue;
    if (/role="img"/.test(block))
      fails.push(
        `  ✗ fig. ${p.fig} (${p.what}) has been given role="img".\n` +
          `      That makes every descendant presentational. This plate's accessible\n` +
          `      experience IS its text, and fig. 02's two links would stop existing.`
      );
    const blockText = block.replace(/<[^>]*>/g, "");
    for (const c of p.claims)
      if (!blockText.includes(c))
        fails.push(`  ✗ fig. ${p.fig} (${p.what}) no longer states "${c}"`);
    for (const re of p.exposed) {
      const m = block.match(re);
      if (!m) {
        fails.push(`  ✗ fig. ${p.fig} (${p.what}) no longer carries ${re}`);
        continue;
      }
      /* The row itself must not be hidden. Walk out to the enclosing element
         and check the tag it sits in, rather than trusting the plate as a
         whole — fig. 05 legitimately hides its week grid. */
      const before = block.slice(0, m.index);
      const openTag = before.lastIndexOf("<");
      if (
        /aria-hidden="true"/.test(block.slice(openTag, m.index + m[0].length))
      )
        fails.push(
          `  ✗ fig. ${p.fig} (${p.what}) has hidden a row that carries its content`
        );
    }
  }
  if (!fails.length)
    notes.push(
      `  · 10 figures: 6 drawings labelled and holding their declared clauses, ` +
        `4 text plates still text (and fig. 02's two links still reachable)`
    );
}

/* Claims the run must NOT make bare, because their source qualifies them. */
const QUALIFIED = [
  {
    /* r13: the row is now "19/20 answers passed my quote check, unaudited".
       Same rule in the new words: a 19/20 not followed by that qualifier is
       bare. */
    figure: "policybot quote check",
    bare: /19\/20(?! answers passed my quote check, unaudited)/,
    why: "the case file calls 19/20 and 17/25 disclosed self-reports — the grader and per-case pass criteria are not published",
  },
];

for (const f of FIGURES) {
  const declared = Object.keys(f.data);
  const unknown = declared.filter((s) => !(s in surfaceText));
  if (unknown.length || !declared.length) {
    /* Not a drift report — a broken entry. An unknown surface name asserts
       nothing while reading like an assertion, which is the failure mode the
       whole reform is about, one level up. */
    fails.push(
      `  ✗ ${f.figure} declares ${declared.length ? `unknown surface(s): ${unknown.join(", ")}` : "no surface at all"}\n` +
        `      known surfaces: ${Object.keys(surfaceText).join(", ")}`
    );
    continue;
  }
  /* `run` is REQUIRED as a key and may be null, which is not the same as
     absent. Some figures are stated only in the data layer -- the Cadence
     architecture node label is drawn on the case file and nowhere on the run
     -- and forcing those to name a run regex would mean pointing at some
     neighbouring sentence, so the entry would go green on a string it is not
     about. But a MISSING key must stay a hard failure: `f.run` undefined would
     otherwise throw, or, if the throw were softened, a deleted binding would
     read as "not claimed on the run" and disable the assertion silently. That
     is the exact failure mode this file exists to prevent, so the declaration
     is explicit and its absence is broken-entry, not a no-op. */
  if (!("run" in f)) {
    fails.push(
      `  ✗ ${f.figure} declares no \`run\` key\n` +
        `      use \`run: /…/\` if the run states this figure, or \`run: null\`` +
        ` if it does not. Omitting the key is not a declaration.`
    );
    continue;
  }
  const onRun = f.run !== null;
  /* `runLong` is an OPTIONAL second phrasing of the same figure on the run.
     A figure the run states twice is two claims; binding one and calling the
     entry done is how "1,186 passed" shipped beside "635 frontend + 550
     backend" with this gate green. */
  const inRun = onRun
    ? f.run.test(runProse) && (!f.runLong || f.runLong.test(runProse))
    : null;
  /* A surface may declare an ARRAY of regexes, and then every one of them must
     match — the `runLong` idea generalised to the data-layer surfaces, for the
     same reason. A figure a surface states twice is two claims, and the second
     one is where this file keeps getting caught: `manifest` bound
     "1,186 tests, 0 skipped" while the same /evidence entry ended
     "…then 1,179 at 2295044, now 1,185 here", so the page published 1,186
     three times and 1,185 once, in one paragraph, with this gate green. One
     regex per surface certifies the rest of the surface unread. */
  const missing = declared.filter((s) =>
    [f.data[s]].flat().some((re) => !re.test(surfaceText[s]))
  );
  if (inRun !== false && !missing.length) {
    notes.push(
      `  · ${f.figure} — agrees on ${declared.join(" + ")}${onRun ? "" : " (data layer only — not stated on the run)"}  (${f.source})`
    );
  } else {
    fails.push(
      `  ✗ ${f.figure}\n      run: ${onRun ? (inRun ? "states it" : "MISSING") : "not claimed"}` +
        `   ${declared
          .map((s) => `${s}: ${missing.includes(s) ? "MISSING" : "states it"}`)
          .join("   ")}\n      truth: ${f.source}`
    );
  }
}

/* A floor under the declaration itself, NAMED and counted. The reform is
   only worth anything while more than one surface is being read; an edit
   that quietly collapsed every entry back to a single file would restore the
   exact hole this replaced and would print the same green lines doing it.

   The count alone is not enough — C33: counting is not checking. So the two
   entries the reform exists for are named, and each must still be declared
   on all four surfaces. A figure stated in four places and cross-checked in
   one is the defect, and it does not announce itself in a total. */
const multiSurface = FIGURES.filter((f) => Object.keys(f.data).length > 1);
const ALL_FOUR = ["Glyph · kernel speed-up", "Glyph · what earns the 3.5×"];
const undercovered = ALL_FOUR.map((name) => {
  const f = FIGURES.find((x) => x.figure === name);
  const on = f ? Object.keys(f.data) : [];
  return { name, on, ok: on.length === Object.keys(surfaceText).length };
}).filter((x) => !x.ok);
if (FIGURES.length < 19 || multiSurface.length < 7 || undercovered.length) {
  fails.push(
    `  ✗ read ${FIGURES.length} figures, ${multiSurface.length} of them declared on more than one ` +
      `surface — expected at least 19 and 7, measured 2026-08-06.` +
      undercovered
        .map(
          (u) =>
            `\n      "${u.name}" is declared on ${u.on.length ? u.on.join(" + ") : "nothing"}; ` +
            `it is stated on all ${Object.keys(surfaceText).length} and must be checked on all ${Object.keys(surfaceText).length}.`
        )
        .join("")
  );
} else {
  notes.push(
    `  · ${FIGURES.length} figures declared across ${Object.keys(surfaceText).length} named surfaces, ` +
      `${multiSurface.length} of them cross-checked on two or more, and the 3.5× pair on all four`
  );
}

/* ── THE NEGATIVE HALF ─────────────────────────────────────────────────
   A retired wording, asserted absent everywhere a claim is made. The
   positive pairs above prove the right sentence is present; only this
   proves the wrong one is gone, and only this survives a reword — which is
   the lesson C36 taught twice: assert the thing the data decides, not the
   sentence it produced.

   `openmp+simd` is not a configuration Glyph has. Its build names are
   `baseline`, `native` and `openmp+native`; the site invented the third
   name and then reasoned from it. */
/* TWO DECLARED EXEMPTIONS, not two skips — the C35 distinction. A skip is
   silent and permanent; a declared scope says what it does not cover, is
   checked in full inside what it does, and carries a floor so a broken parse
   cannot masquerade as a clean file.

   1. SOURCE COMMENTS. This scan is about what a reader is told, and these
      files document their own history in comments that quote the wordings
      they retired — including, three sections up, the one being retired
      here. Only block comments and whole-line `//` are stripped: a naive
      `//` sweep eats everything after `https://` in an artifact href, which
      would make the scan quietly MORE permissive, and a negative assertion
      that has been made permissive is a negative assertion that has stopped
      existing.
   2. THE CORRECTIONS REGISTERS. An erratum has to be able to name what it
      corrected — a register that cannot quote the wording it retired is not
      a register. This is the source-level twin of atlas's scoping of the
      same assertion to #validation, so the two gates agree about where the
      exemption is. */
const REGISTER = /^ {4}corrections: \[[\s\S]*?^ {4}\],$/gm;
const uncommented = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^[ \t]*\/\/.*$/gm, " ");
const registers = surfaceText.cases.match(REGISTER) ?? [];
if (registers.length !== 7) {
  fails.push(
    `  ✗ read ${registers.length} corrections registers out of projectCaseStudies.ts — expected 7,\n` +
      `      one per case file. That is a broken parse, and it would exempt the wrong text.`
  );
}
const CLAIM_TEXT = {
  "src/run/index.html": runProse,
  ...Object.fromEntries(
    Object.entries(SURFACES).map(([name, path]) => [
      path,
      uncommented(
        name === "cases"
          ? surfaceText[name].replace(REGISTER, " ")
          : surfaceText[name]
      ),
    ])
  ),
};

const RETIRED = [
  {
    what: "openmp+simd (and openmp-plus-simd) as the owner of Glyph's 3.5×",
    pattern: /openmp[+-]?(plus-)?simd/i,
    why: "the 3.5× is OpenMP's alone — the arm64 `baseline` and `native` binaries build byte-identical, so the NEON path is in both sides of the comparison. Glyph's own configuration is named openmp+native; openmp+simd was the site's coinage, and it credited the vectorisation with a share of a number it does not earn",
    /* The erratum that retired it has to stay quotable, or the register
       stops being the record it claims to be. */
    keptInRegister: true,
  },
];
for (const r of RETIRED) {
  const seen = Object.entries(CLAIM_TEXT)
    .filter(([, text]) => r.pattern.test(text))
    .map(([path]) => path);
  if (seen.length) {
    fails.push(
      `  ✗ retired wording is back — ${r.what}\n      found in: ${seen.join(", ")}\n      ${r.why}`
    );
  } else if (r.keptInRegister && !r.pattern.test(registers.join(""))) {
    fails.push(
      `  ✗ retired wording is gone from the corrections registers too — ${r.what}\n` +
        `      The claim surfaces are clean, which is right, but nothing on the site now\n` +
        `      records that the wording was ever there. A correction deleted is not a\n` +
        `      correction; this register's whole argument is that it is never deleted.`
    );
  } else {
    notes.push(
      `  · retired wording stays retired, and its erratum stays on file — ${r.what}`
    );
  }
}

/* Windowed check: an attribution may precede or follow its figure. */
for (const { figure, needle, within, why } of [
  {
    figure: "Applied macro-F1 0.9791",
    needle: "0.9791",
    within: /rules/i,
    why: "0.9791 is the RULES stage — Applied's hybrid_profile 'deterministic' disables SetFit and the full cascade scores 0.958, so a bare figure credits the ML stack with the regex layer's score",
  },
]) {
  let i = -1;
  let bare = 0;
  while ((i = runProse.indexOf(needle, i + 1)) > -1) {
    if (!within.test(runProse.slice(Math.max(0, i - 150), i + 160))) bare++;
  }
  if (bare) fails.push(`  ✗ ${figure} stated bare ${bare}×\n      ${why}`);
  else notes.push(`  · ${figure} — attributed everywhere it appears`);
}

for (const q of QUALIFIED) {
  if (q.bare.test(runProse)) {
    fails.push(`  ✗ ${q.figure} stated without its qualifier\n      ${q.why}`);
  } else {
    notes.push(`  · ${q.figure} — carries its qualifier`);
  }
}

/* ── QUOTED PEOPLE ────────────────────────────────────────────────────
   A named person's words must appear on the page exactly as they wrote
   them. The station says the testimonials are "unedited except where an
   ellipsis marks a cut", and I shipped a version that had quietly
   anglicised Randall Vollen's "analyze" and "prioritization" — the page
   claiming unedited while being edited. Nothing else on this site can be
   wrong in a way that matters more: a number can be re-measured, a
   misquotation of a real person cannot be undone.

   Checked as fragments rather than whole quotes because the station
   legitimately elides with an ellipsis; every run of >=6 words the page
   presents inside quotation marks must occur verbatim in the source. */
const testimonials = read("src/lib/data/testimonials.ts");
/* Scope to the co-signers' blockquotes rather than "any quoted run of
   text". A greedy quote regex over the whole page ran from the epigraph's
   closing quote to the next one and swallowed unrelated copy — precision
   here comes from knowing WHERE testimony lives, not from a cleverer regex. */
const testimony = [
  ...runHtml.matchAll(
    /<figure class="cosign"[^>]*>\s*<blockquote>([\s\S]*?)<\/blockquote>/g
  ),
].map((m) =>
  m[1]
    .replace(/&ldquo;|&rdquo;/g, "")
    .replace(/&rsquo;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;|&#8202;/g, " ")
    .replace(/<[^>]*>/g, "")
);
const norm = (x) =>
  x
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
const hay = norm(read("src/lib/data/testimonials.ts"));
let drifted = 0;
for (const q of testimony) {
  for (const frag of q.split(/\s*…\s*/)) {
    const n = norm(frag);
    if (n.split(" ").length < 6) continue;
    if (!hay.includes(n)) {
      fails.push(
        `  ✗ testimony not verbatim in testimonials.ts\n      "${frag.trim().slice(0, 80)}…"`
      );
      drifted++;
    }
  }
}
if (!testimony.length) fails.push("  ✗ no co-signer testimony found to verify");
else if (!drifted)
  notes.push(
    `  · ${testimony.length} co-signer quotes match testimonials.ts word for word`
  );

/* ── F58 RULE 1, RE-HOMED ─────────────────────────────────────────────
   `testimonials.ts` carries a module-scope `assertVerbatimExcerpts()`: an
   excerpt that is not a contiguous verbatim substring of its quote is a
   paraphrase wearing quotation marks, a third party made to say something
   they did not write. Its own comment said "module scope, so it runs during
   `next build`: the export fails rather than publishing it".

   THAT STOPPED BEING TRUE IN PHASE 4 AND NOTHING SAID SO. Module-scope code
   runs when the module is IMPORTED, and the file that imported it was deleted
   with the React tree — `testimonials.ts` is now read only as text, by this
   gate. So the strongest honesty rule on the site quietly stopped executing.
   Found while pruning, by reading a comment that named a build step which no
   longer exists.

   Re-implemented here rather than left to an import nobody would add, and
   over the SOURCE, because that is what this gate already holds the run to.
   Quotes and excerpts are read as literals; a template or a computed string
   would be a different kind of file and this would fail loudly rather than
   skip it. */
const entryBlocks = testimonials.match(/\n {2}\{[\s\S]*?\n {2}\},/g) ?? [];
const field = (block, name) => {
  const m = block.match(
    new RegExp(`\\n\\s*${name}:\\s*\\n?\\s*("(?:[^"\\\\]|\\\\.)*")`)
  );
  return m ? JSON.parse(m[1]) : null;
};
let excerpts = 0;
for (const block of entryBlocks) {
  const quote = field(block, "quote");
  const excerpt = field(block, "excerpt");
  if (!quote) {
    fails.push("  ✗ a testimonial block carries no readable quote literal");
    continue;
  }
  if (!excerpt) continue;
  excerpts++;
  if (!quote.includes(excerpt)) {
    fails.push(
      `  ✗ an excerpt is not a verbatim substring of its quote — a paraphrase in quotation marks\n` +
        `      excerpt: "${excerpt.slice(0, 70)}…"`
    );
  }
}
/* Floors, because a broken parse over an empty set prints the same green line
   as a clean file. Measured 2026-08-06: two testimonials, one excerpt. (The
   file's third `quote:` is the interface's field declaration, not an entry —
   which is why the floor is measured off the parse rather than off a grep.) */
if (entryBlocks.length < 2 || excerpts < 1) {
  fails.push(
    `  ✗ read ${entryBlocks.length} testimonials and ${excerpts} excerpts out of testimonials.ts — ` +
      `expected at least 2 and 1. That is a broken parse, not a clean file.`
  );
} else {
  notes.push(
    `  · ${entryBlocks.length} testimonials read, ${excerpts} excerpt${excerpts === 1 ? "" : "s"} verbatim inside ${excerpts === 1 ? "its quote" : "their quotes"}`
  );
}

for (const n of notes) console.log(n);
if (fails.length) {
  console.error(
    `\ncheck-figures FAILED — the run and the data layer disagree:`
  );
  for (const f of fails) console.error(f);
  process.exit(1);
}
console.log(`\ncheck-figures: ${notes.length} figures bound to the data layer`);
