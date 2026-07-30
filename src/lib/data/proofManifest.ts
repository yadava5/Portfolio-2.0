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
const VISUAL_ASSIST_SHA = "22ebdaa";
const TASKFLOW_SHA = "69a59e7";
const FAST_MNIST_SHA = "c6e5c0b";
/* The MNIST eval landed after that pin — its own commit, verified 200. */
const GLYPH_EVAL_SHA = "97de736";
/* jetpack-compress HEAD verified public via `gh api` on 2026-07-24. */
const JETPACK_SHA = "af2c4b1";

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
      label: "jobtracker case file · receipt 02",
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
      label: "jobtracker case file · receipt 05",
      href: "/projects/jobtracker/#v-jobtracker-5",
    },
  },
  {
    id: "jobtracker-backend-tests",
    label: "271 backend tests",
    claim:
      "The Applied backend suite passed 271 tests locally, with 10 skipped, under the test/null-keyring environment.",
    source: "https://github.com/yadava5/applied/tree/36a2f54/backend/tests",
    sourceLabel: `backend/tests @ ${APPLIED_SHA}`,
    verification:
      "Local run against the pinned public test tree, 2026-07-26. The 10 skips are the Postgres RLS module, which needs a live database URL and gets one from no workflow.",
    visibility: "public",
    privacyBoundary:
      "The suite runs with a null keyring; no private email or account data is involved.",
    date: "2026-07-26",
    receipt: {
      label: "jobtracker case file · receipt 04",
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
    id: "visual-assist-tests",
    label: "71 iOS tests",
    claim: "Visual Assist has audited XCTest model and utility coverage.",
    source:
      "https://github.com/yadava5/VisualAssist/tree/22ebdaa/VisualAssistTests",
    sourceLabel: `VisualAssistTests @ ${VISUAL_ASSIST_SHA}`,
    verification:
      "Function count audited in the public test tree at the pinned commit.",
    visibility: "public",
    privacyBoundary: "No live camera, location, or user sensor data is shown.",
    date: "2026-05",
    receipt: {
      label: "visual assist case file · receipt 01",
      href: "/projects/visual-assist/#v-visual-assist-1",
    },
  },
  {
    id: "taskflow-tests",
    label: "1,145 automated tests",
    claim:
      "Cadence suite measured 2026-07: 634 frontend + 511 backend = 1,145 passing (vitest).",
    source: "https://github.com/yadava5/cadence/tree/69a59e7",
    sourceLabel: `taskflow-calendar @ ${TASKFLOW_SHA}`,
    verification: "Local vitest run against the pinned public source.",
    visibility: "public",
    privacyBoundary: "No private data.",
    date: "2026-07",
    receipt: {
      label: "taskflow case file · receipt 01",
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
    label: "3.5× openmp+simd dot kernel",
    claim:
      "The openmp+simd dot kernel runs 3.5× faster than the -O3 baseline (dot 256) in committed benchmarks.",
    source: "https://github.com/yadava5/glyph/blob/c6e5c0b/BENCHMARKS.md",
    sourceLabel: `BENCHMARKS.md @ ${FAST_MNIST_SHA}`,
    verification:
      "Committed 2025-12-26 benchmark run data in the public fast-mnist-nn repository.",
    visibility: "public",
    privacyBoundary: "No private data.",
    date: "2025-12-26",
    receipt: {
      label: "fast-mnist case file · receipt 02",
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
      "Committed eval report read at the pinned commit: 9701/10000 = 97.0100%, macro P/R/F1 0.9701/0.9698/0.9698, model.weights pinned by sha256, 784→100→10 sigmoid MLP. The generator (apps/eval_model.cpp) and the 299-row miss list are committed beside it. The public MNIST test set is not vendored in the repo, so the run is reproducible with the standard dataset rather than self-contained.",
    visibility: "public",
    privacyBoundary: "No private data.",
    date: "2026-07-27",
    sourceKind: "self-authored",
    receipt: {
      label: "glyph case file · receipt 01",
      href: "/projects/fast-mnist-nn/#v-fast-mnist-nn-1",
    },
  },
  {
    id: "master-inventory-ledger",
    label: "10,453 deduped rows",
    claim:
      "Master Inventory private-safe proof records the deduped inventory row count and schema boundary.",
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
      "PolicyBot private-safe proof records a structured validation sweep.",
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
      "jetpack-compress compiles clean on JDK 25 and its full suite passes — 72 tests (Tests run: 72, Failures: 0).",
    source:
      "https://github.com/yadava5/jetpack-compress/blob/af2c4b1/README.md",
    sourceLabel: `README.md @ ${JETPACK_SHA}`,
    verification:
      "README status line read against the public repo at the pinned commit; `mvn test` runs the 72-test JUnit 5 suite.",
    visibility: "public",
    privacyBoundary: "No private data.",
    date: "2026-07",
    sourceKind: "self-authored",
  },
];
