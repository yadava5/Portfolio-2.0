/**
 * @fileoverview The proof manifest — the data behind /evidence.
 *
 * Every entry follows the strongest-external-artifact rule: `source` is
 * the best artifact that exists OUTSIDE this site's rendering (a repo
 * file pinned to a commit, or a checked-in downloadable ledger) — never
 * the site's own illustration of the claim. `receipt` is the crosswalk:
 * the case-file receipt row (`#v-<projectId>-<n>`) where the same claim
 * is argued in full. Dates are real and recorded (committed-artifact
 * dates come from the artifacts themselves); where none was recorded,
 * the entry says so instead of inventing one.
 */

export type ProofVisibility = "public" | "private-safe" | "local-only";

export interface ProofManifestEntry {
  id: string;
  label: string;
  claim: string;
  /** URL or checked-in public asset path — the artifact itself */
  source: string;
  /** Short display name for the source link (the URL never renders as text) */
  sourceLabel: string;
  verification: string;
  visibility: ProofVisibility;
  privacyBoundary: string;
  /** When the evidence was recorded (YYYY-MM or YYYY-MM-DD); null = not recorded */
  date: string | null;
  /**
   * How far the source stands from the author's own hand
   * (CRITIC-LEDGER F55). Omitted = the strongest case: a third-party-
   * hostable artifact — committed code, a test tree, a CI run — that
   * someone else could recompute the claim from.
   *
   *   `self-hosted`   — the artifact is real and checked in, but it is
   *                     checked into THIS repository and served from
   *                     this origin. `sourceLink()` rewrites `public/`
   *                     to a same-origin URL, so the ↗ glyph the page
   *                     prints ("leaves the site") resolved straight
   *                     back into the portfolio. The reader is owed
   *                     that fact, not a glyph that hides it.
   *   `self-authored` — the source is the author's own prose (a README
   *                     status line) rather than a run, a test, or a
   *                     data file. It is documentation of a result, not
   *                     the result.
   *
   * /evidence prints the qualifier verbatim. Nothing about the claim
   * changes; what changes is that the reader can see how far it stands
   * from an independent artifact before deciding what it is worth.
   */
  sourceKind?: "self-hosted" | "self-authored";
  /** Case-file receipt-row crosswalk; omitted only when no case file exists */
  receipt?: { label: string; href: string };
  /**
   * W5: the claim is on file but NOT yet earned — no committed artifact
   * reproduces the number. The index renders the same HELD treatment as
   * the case-file stamp (dashed clay, never a tick) plus this note
   * naming what lifts it. Mirrors CaseReceipt.held.
   */
  held?: { note: string };
}

/* Repo pins mirror src/lib/data/projectCaseStudies.ts — HEAD shas
   verified via `gh api` on 2026-07-18. `source` values stay plain
   string literals so scripts/qa/check-proof-manifest.mjs can parse
   them; the consts below feed the display labels only. */
/* Applied re-pinned 3225eb4 → 36a2f54 on 2026-07-26 (repo also renamed
   yadava5/jobtracker → yadava5/applied). See the re-pin note in
   projectCaseStudies.ts; the case file's corrections register carries the
   erratum. Every `source` below was fetched at this sha and returned 200. */
const APPLIED_SHA = "36a2f54";
/* The backend suite count is pinned to the commit it was MEASURED at.
   Re-run 2026-08-02: 271 became 278, skips unchanged at 10. */
const APPLIED_SUITE_SHA = "03fc5c4";
const VISUAL_ASSIST_SHA = "22ebdaa";
/* AutoML pin — mirrors projectCaseStudies.ts AUTOML_SHA. */
const AUTOML_SHA = "e506c91";
/* Cadence's suite count is pinned to the commit it was MEASURED at, which
   is the current public head rather than the old `69a59e7`. Re-run on the
   2026-08-02 provenance audit: 1,145 became 1,159. The number and the sha
   move together, because a count without the commit it was taken at is a
   guess with a decimal point.

   AND THE COMMIT HAS TO EXIST. This pin was briefly `932625e`, which is an
   UNPUSHED local commit — so the source URL 404'd and the number could not
   be reproduced by anyone. Re-measured at the public head instead: 1,159.
   The nine-test difference is `932625e` itself, the fix for nine dead
   endpoints, which lands here the moment it is pushed. */
const CADENCE_SUITE_SHA = "8eee84e";
const FAST_MNIST_SHA = "c6e5c0b";
/* The MNIST eval landed after that pin — its own commit, verified 200. */
const GLYPH_EVAL_SHA = "97de736";
/* jetpack-compress HEAD verified public via `gh api` on 2026-07-24. */
const JETPACK_SHA = "2caacd0";

export const proofManifest: ProofManifestEntry[] = [
  {
    id: "jobtracker-local-classifier",
    label: "3-layer local classifier",
    claim:
      "Applied’s classifier is a 3-layer rules, embeddings, and SetFit path — all three run on the desktop app and in the browser Space; the hosted web app runs the rules layer alone.",
    source:
      "https://github.com/yadava5/applied/blob/36a2f54/docs/ML_STRATEGY.md",
    sourceLabel: `docs/ML_STRATEGY.md @ ${APPLIED_SHA}`,
    verification:
      "ML strategy doc read against the backend source at the pinned commit; the hosted limit is the cloud short-circuit in classifier/hybrid.py, argued at case-file receipt 09.",
    visibility: "public",
    privacyBoundary: "No private email content is shown.",
    date: "2026-07-26",
    receipt: {
      label: "applied case file · receipt 02",
      href: "/projects/jobtracker/#v-jobtracker-2",
    },
  },
  {
    id: "jobtracker-macro-f1",
    label: "macro-F1 0.9791",
    claim:
      "Applied’s rules and deterministic hybrid v3 gates both passed on the 96-sample eval set with macro-F1 0.9791.",
    source:
      "https://github.com/yadava5/applied/blob/36a2f54/backend/data/evaluation/baseline_hybrid_v3.json",
    sourceLabel: `baseline_hybrid_v3.json @ ${APPLIED_SHA}`,
    verification:
      "Committed 2026-03-03 baseline (deterministic profile) plus the public backend-ci gate run of 2026-04-20. The artifact is byte-identical at the new pin — re-read 2026-07-26, same 96 samples, same 0.9791.",
    visibility: "public",
    privacyBoundary:
      "The committed baseline JSON records metrics and label counts, not message content.",
    date: "2026-03-03",
    receipt: {
      label: "applied case file · receipt 05",
      href: "/projects/jobtracker/#v-jobtracker-5",
    },
  },
  {
    id: "jobtracker-backend-tests",
    label: "278 backend tests",
    claim:
      "The Applied backend suite passed 278 tests locally, with 10 skipped, under the test/null-keyring environment.",
    source: "https://github.com/yadava5/applied/tree/03fc5c4/backend/tests",
    sourceLabel: `backend/tests @ ${APPLIED_SUITE_SHA}`,
    verification:
      "`pytest tests -q` run against this head on 2026-08-02 in the project’s own Python 3.11 venv: 278 passed, 10 skipped in 39.90s. The 10 skips are the Postgres RLS module, which needs a live database URL and gets one from no workflow. The previous entry read 271 at 36a2f54 — true when taken; the tree has grown seven tests since.",
    visibility: "public",
    privacyBoundary:
      "The suite runs with a null keyring; no private email or account data is involved.",
    date: "2026-08-02",
    receipt: {
      label: "applied case file · receipt 04",
      href: "/projects/jobtracker/#v-jobtracker-4",
    },
  },
  {
    id: "automl-workflow-proof",
    label: "7-phase AutoML lifecycle",
    claim:
      "Agentic AutoML presents a 7-phase ML workflow with LangGraph and MCP orchestration.",
    source: "public/images/projects/agentic-automl-poster-proof.webp",
    sourceLabel: "expo poster capture — private-safe",
    verification:
      "Private-safe senior design poster and local AutoML repository audit.",
    visibility: "private-safe",
    privacyBoundary:
      "Uses demo/source-truth data and excludes private repository source.",
    date: "2026-05",
    sourceKind: "self-hosted",
    receipt: {
      label: "automl case file · receipt 02",
      href: "/projects/automl/#v-automl-2",
    },
  },
  {
    /* Added 2026-08-02. "12 mcp tools" is stated four times on the home
       page — the ¶09 prose, its aria-label, and twice inside the figure's
       own SVG text — and had no evidence row anywhere, which is exactly
       the thing /evidence prints a rule against. It is also trivially
       checkable, which made the omission worse rather than better. */
    id: "automl-mcp-tools",
    label: "12 MCP tools",
    claim:
      "The Agentic AutoML backend registers exactly 12 MCP tools, in one server — the notebook surface the orchestrator drives.",
    source:
      "https://github.com/yadava5/ai-augmented-auto-ml-toolchain/blob/e506c91/backend/src/services/mcp/mcpServer.ts",
    sourceLabel: `mcpServer.ts @ ${AUTOML_SHA}`,
    verification:
      "Counted in the source on 2026-08-02: 12 `server.registerTool(` call sites at the pinned commit, and 12 at the current head — the count has not moved. There is no second MCP server; a search for `registerTool` across backend/src and frontend/src returns nothing outside this file, so the number is the whole registry rather than one file's share of it.",
    visibility: "public",
    privacyBoundary: "No private data — the tool registry is public source.",
    date: "2026-08-02",
    receipt: {
      label: "automl case file · receipt 02",
      href: "/projects/automl/#v-automl-2",
    },
  },
  {
    id: "visual-assist-tests",
    label: "71 iOS tests, all passing",
    claim:
      "The public VisualAssistTests suite executes 71 tests; all 71 pass, none are skipped.",
    source:
      "https://github.com/yadava5/VisualAssist/tree/22ebdaa/VisualAssistTests",
    sourceLabel: `VisualAssistTests @ ${VISUAL_ASSIST_SHA}`,
    verification:
      "Executed, having previously only been counted. This entry read “71 test functions” rather than “71 passing” because the suite could not be run: xcodebuild resolved a destination needing an iOS runtime this machine lacked, and CI had no `xcodebuild test` step either, so 71 tests had never executed anywhere. The runtime was installed on 2026-08-03 and `xcodebuild test` was run twice — iPhone 17 Pro on iOS 26.5, then on iOS 26.2 when the simulator resolver picked a different device — giving 71 passed, 0 failed, 0 skipped both times, read from the .xcresult bundle via xcresulttool rather than from console text. Two runtimes rather than one because the second run was accidental, and it is worth more than the first. The static count is unchanged and still corroborates: 8 XCTestCase subclasses, 71 no-argument instance methods named test…, per file 13 · 11 · 10 · 9 · 9 · 8 · 6 · 5, with zero argument-taking, private, or static variants — the cases XCTest would skip — so the collected count could not have differed. The pin still holds: VisualAssistTests/ and VisualAssist/ are byte-identical between this commit and the tree that was executed, which changed only CI, scripts and docs. CI now runs the suite and asserts it ran, since a green xcodebuild proves nothing on its own. The commit that introduced the suite says “68 tests”; that is the stale document, not this number.",
    visibility: "public",
    privacyBoundary: "No live camera, location, or user sensor data is shown.",
    date: "2026-08-03",
    receipt: {
      label: "visual assist case file · receipt 01",
      href: "/projects/visual-assist/#v-visual-assist-1",
    },
  },
  {
    id: "taskflow-tests",
    label: "1,159 automated tests",
    claim:
      "Cadence suite measured 2026-08-02: 635 frontend + 524 backend = 1,159 passing (vitest), with 11 skipped.",
    source: "https://github.com/yadava5/cadence/tree/8eee84e",
    sourceLabel: `cadence @ ${CADENCE_SUITE_SHA}`,
    verification:
      "Both vitest configs run locally against this head on 2026-08-02: `vitest run --config vitest.config.ts` gives 635 passing across 58 files, `--config vitest.backend.config.ts` gives 533 passing and 11 skipped across 24. The 11 skips are the Postgres row-level-security suite, which stays skipped without RLS_TEST_PG_ADMIN_URL. The number and its commit moved together — the previous entry read 1,145 at 69a59e7, which was true when it was taken.",
    visibility: "public",
    privacyBoundary: "No private data.",
    date: "2026-08-02",
    receipt: {
      /* The product is Cadence. `taskflow-calendar` is the ROUTE SLUG and
         stays — it is a pinned identifier and every receipt anchor is
         built from it — but it was leaking into the link's rendered TEXT
         on /evidence, where a reader sees a name the site retired. */
      label: "cadence case file · receipt 01",
      href: "/projects/taskflow-calendar/#v-taskflow-calendar-1",
    },
  },
  /* W5 split (era-w4 finding 1, P0): the old single entry bundled the
     ~97% accuracy with the 3.5x kernel under one BENCHMARKS.md source —
     but BENCHMARKS.md contains no accuracy figure and the case file
     stamps the ~97% HELD. One earned claim, one held claim, each with
     its truthful source and its own receipt row. */
  {
    id: "fast-mnist-benchmark",
    label: "3.5× parallel dot kernel",
    claim:
      "The parallel dot kernel runs 3.5× faster than the single-threaded -O3 baseline at dot 256 — the speed-up is OpenMP’s, not SIMD’s.",
    source: "https://github.com/yadava5/glyph/blob/c6e5c0b/BENCHMARKS.md",
    sourceLabel: `BENCHMARKS.md @ ${FAST_MNIST_SHA}`,
    verification:
      "Rebuilt and re-measured on 2026-08-02: all three of the repository’s configurations (baseline, native, openmp+native) were compiled from source and run under Google Benchmark. dot 256 went 4,858,722ns → 1,380,288ns = 3.520×, against the committed 3.504×. The attribution matters and was checked rather than assumed: on this arm64 machine the `baseline` and `native` binaries are byte-identical — same md5 — because -march=native is an x86 flag clang does not act on here, so the hand-written NEON path is compiled into both and the entire gain is parallelism. That is also why the “SIMD alone” figure sits at ~1.0 (1.016× committed, 0.993× re-measured): it compares a binary with itself.",
    visibility: "public",
    privacyBoundary: "No private data.",
    date: "2026-08-02",
    receipt: {
      /* Same slug-into-display-text leak, and this one was provably an
         oversight rather than a decision: the entry 27 lines below already
         renders "glyph case file · receipt 01" against the same route. One
         file was calling the same product two names. */
      label: "glyph case file · receipt 02",
      href: "/projects/fast-mnist-nn/#v-fast-mnist-nn-2",
    },
  },
  {
    /* EARNED 2026-07-27 — this entry was HELD from W2 until the eval run
       it named was committed. `held` is removed because its stated
       condition ("held until a committed eval run earns it") was met by
       glyph@97de736, which commits benchmarks/mnist_eval.txt, its
       generator apps/eval_model.cpp, and mnist_misclassified.csv.
       The label moves from the rounded "~97%" to the measured 97.01%:
       once a number has an artifact, stating it approximately is a
       second, smaller inaccuracy. */
    id: "fast-mnist-accuracy",
    label: "97.01% MNIST test accuracy",
    claim:
      "Glyph scores 97.01% on the 10,000-image MNIST test set — 9,701 correct, 299 wrong, macro-F1 0.9698 — in a committed eval run whose report names its generator and pins the scored model by sha256.",
    source:
      "https://github.com/yadava5/glyph/blob/97de736/benchmarks/mnist_eval.txt",
    sourceLabel: `mnist_eval.txt @ ${GLYPH_EVAL_SHA}`,
    verification:
      "Re-run from source on 2026-08-02, not merely read: the generator was compiled and executed against the standard 10,000-image test set, and the regenerated mnist_eval.json and mnist_misclassified.csv are byte-identical to the committed artifacts — 9,701 correct, 299 wrong, macro P/R/F1 0.970056/0.969845/0.969822, the same model.weights sha256, 784→100→10 sigmoid MLP. Two honest caveats stay: the public MNIST test set is not vendored, so reproduction needs the standard dataset; and apps/eval_model.cpp has no add_executable in CMakeLists.txt, so a third party has to compile the generator by hand rather than through the project’s own build.",
    visibility: "public",
    privacyBoundary: "No private data.",
    date: "2026-08-02",
    receipt: {
      label: "glyph case file · receipt 01",
      href: "/projects/fast-mnist-nn/#v-fast-mnist-nn-1",
    },
  },
  {
    id: "master-inventory-ledger",
    label: "10,453 deduped rows",
    claim:
      "The checked-in ledger records 3,731 Tableau and 6,743 Workday rows deduped to 10,453 master rows across a 35-field schema.",
    source: "public/proof/master-inventory-ledger.json",
    sourceLabel: "master-inventory-ledger.json — checked in 2026-06",
    verification:
      "Sanitized processed-output ledger, checked into this site’s public repository.",
    visibility: "private-safe",
    privacyBoundary:
      "Raw institutional exports, report names, owner names, and rows are excluded.",
    date: "2026-06",
    sourceKind: "self-hosted",
    receipt: {
      label: "master inventory case file · receipt 01",
      href: "/projects/master-inventory/#v-master-inventory-1",
    },
  },
  {
    id: "policybot-validation",
    label: "19/20 structured sweep",
    claim:
      "The checked-in ledger records a 19/20 structured sweep and a 17/25 keyword sweep, both self-graded, with 4 unsupported topics declined rather than answered.",
    source: "public/proof/policybot-validation-ledger.json",
    sourceLabel: "policybot-validation-ledger.json — checked in 2026-06",
    verification:
      "Sanitized validation ledger, checked into this site’s public repository.",
    visibility: "private-safe",
    privacyBoundary: "Raw policy text and Slack messages are excluded.",
    date: "2026-06",
    sourceKind: "self-hosted",
    receipt: {
      label: "policybot case file · receipt 01",
      href: "/projects/policybot/#v-policybot-1",
    },
  },
  /* CRITIC-LEDGER F54 — the blank row is gone.
     e-11 was `paid-internships-sources`: a BIBLIOGRAPHY COUNT from a
     freshman writing course, for a project projects.ts deliberately
     hides from recruiters (`portfolioVisible: false`). It rendered
     `date: not recorded` and `no case file — the repository is the
     record`, so on a 12-row ledger it was one of two rows with no date
     AND one of two with no receipt — the two weakest cells on the page,
     in the same row, arguing the least. A padded ledger is worse than a
     short one: every row a reader discounts costs the eleven around it.
     The project itself is untouched in projects.ts; what came off is
     the claim that it is evidence. */
  {
    id: "jetpack-tests",
    label: "72 tests pass",
    claim:
      "jetpack-compress compiles clean on JDK 25 and its full suite passes — 72 tests, 0 failures, 0 errors, 0 skipped.",
    source:
      "https://github.com/yadava5/jetpack-compress/tree/2caacd0/src/test/java",
    sourceLabel: `src/test/java @ ${JETPACK_SHA}`,
    verification:
      "Run, not read: `mvn -DskipTests=false test` on JDK 25.0.3 against this commit on 2026-08-02, and the surefire XML summed across all five test classes gives tests=72 errors=0 skipped=0 failures=0. The repository has no CI, so this local run is the only execution record that exists — which is why the entry names the test tree rather than the README status line it used to cite.",
    visibility: "public",
    privacyBoundary: "No private data.",
    date: "2026-08-02",
  },
];
