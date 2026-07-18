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
const JOBTRACKER_SHA = "3225eb4";
const VISUAL_ASSIST_SHA = "22ebdaa";
const TASKFLOW_SHA = "69a59e7";
const FAST_MNIST_SHA = "c6e5c0b";
const PAID_INTERNSHIPS_SHA = "77a865d";

export const proofManifest: ProofManifestEntry[] = [
  {
    id: "jobtracker-local-classifier",
    label: "3-layer local classifier",
    claim:
      "JobTracker uses a 3-layer rules, embeddings, and SetFit classifier path for local job-search email classification.",
    source:
      "https://github.com/yadava5/jobtracker/blob/3225eb4/docs/ML_STRATEGY.md",
    sourceLabel: `docs/ML_STRATEGY.md @ ${JOBTRACKER_SHA}`,
    verification:
      "ML strategy doc read against the backend source at the pinned commit.",
    visibility: "public",
    privacyBoundary: "No private email content is shown.",
    date: "2026-06",
    receipt: {
      label: "jobtracker case file · receipt 02",
      href: "/projects/jobtracker/#v-jobtracker-2",
    },
  },
  {
    id: "jobtracker-macro-f1",
    label: "macro-F1 0.9791",
    claim:
      "JobTracker's rules and deterministic hybrid v3 gates both passed on the 96-sample eval set with macro-F1 0.9791.",
    source:
      "https://github.com/yadava5/jobtracker/blob/3225eb4/backend/data/evaluation/baseline_hybrid_v3.json",
    sourceLabel: `baseline_hybrid_v3.json @ ${JOBTRACKER_SHA}`,
    verification:
      "Committed 2026-03-03 baseline (deterministic profile) plus the public backend-ci gate run.",
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
    label: "182 backend tests",
    claim:
      "The JobTracker backend suite passed 182 tests locally under the test/null-keyring environment.",
    source: "https://github.com/yadava5/jobtracker/tree/3225eb4/backend/tests",
    sourceLabel: `backend/tests @ ${JOBTRACKER_SHA}`,
    verification: "Local run against the pinned public test tree.",
    visibility: "public",
    privacyBoundary:
      "The suite runs with a null keyring; no private email or account data is involved.",
    date: "2026-06",
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
      "Taskflow suite measured 2026-07: 634 frontend + 511 backend = 1,145 passing (vitest).",
    source: "https://github.com/yadava5/taskflow-calendar/tree/69a59e7",
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
    label: "3.5x openmp+simd dot kernel",
    claim:
      "The openmp+simd dot kernel runs 3.5x faster than the -O3 baseline (dot 256) in committed benchmarks.",
    source:
      "https://github.com/yadava5/fast-mnist-nn/blob/c6e5c0b/BENCHMARKS.md",
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
    id: "fast-mnist-accuracy",
    label: "~97% test accuracy",
    claim:
      "Fast MNIST reaches ~97% test accuracy on MNIST after ~30 epochs — documented in the repo's README training notes; no committed eval artifact reproduces it yet.",
    source: "https://github.com/yadava5/fast-mnist-nn/blob/c6e5c0b/README.md",
    sourceLabel: `README.md @ ${FAST_MNIST_SHA}`,
    verification:
      "README training notes checked against the source at the pinned commit. The number is documentation, not a committed eval run — it stays held until one is checked in.",
    visibility: "public",
    privacyBoundary: "No private data.",
    date: "2026-07",
    receipt: {
      label: "fast-mnist case file · receipt 01 (held)",
      href: "/projects/fast-mnist-nn/#v-fast-mnist-nn-1",
    },
    held: { note: "held until a committed eval run earns it" },
  },
  {
    id: "master-inventory-ledger",
    label: "10,453 deduped rows",
    claim:
      "Master Inventory private-safe proof records the deduped inventory row count and schema boundary.",
    source: "public/proof/master-inventory-ledger.json",
    sourceLabel: "master-inventory-ledger.json — checked in 2026-06",
    verification:
      "Sanitized processed-output ledger, checked into this site's public repository.",
    visibility: "private-safe",
    privacyBoundary:
      "Raw institutional exports, report names, owner names, and rows are excluded.",
    date: "2026-06",
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
      "Sanitized validation ledger, checked into this site's public repository.",
    visibility: "private-safe",
    privacyBoundary: "Raw policy text and Slack messages are excluded.",
    date: "2026-06",
    receipt: {
      label: "policybot case file · receipt 01",
      href: "/projects/policybot/#v-policybot-1",
    },
  },
  {
    id: "paid-internships-sources",
    label: "6 academic sources",
    claim:
      "Paid Internships Advocacy cites six academic or institutional sources.",
    source: "https://github.com/yadava5/paid-internships-advocacy/tree/77a865d",
    sourceLabel: `paid-internships-advocacy @ ${PAID_INTERNSHIPS_SHA}`,
    verification: "Public repository/source-page audit.",
    visibility: "public",
    privacyBoundary: "No private data.",
    date: null,
  },
];
