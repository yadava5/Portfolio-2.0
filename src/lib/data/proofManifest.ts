export type ProofVisibility = "public" | "private-safe" | "local-only";

export interface ProofManifestEntry {
  id: string;
  label: string;
  claim: string;
  source: string;
  verification: string;
  visibility: ProofVisibility;
  privacyBoundary: string;
}

export const proofManifest: ProofManifestEntry[] = [
  {
    id: "jobtracker-local-classifier",
    label: "3-layer local classifier",
    claim:
      "JobTracker uses a 3-layer rules, embeddings, and SetFit classifier path for local job-search email classification.",
    source: "https://github.com/yadava5/jobtracker",
    verification:
      "Public repository architecture and portfolio architecture diagram.",
    visibility: "public",
    privacyBoundary: "No private email content is shown.",
  },
  {
    id: "automl-workflow-proof",
    label: "7-phase AutoML lifecycle",
    claim:
      "Agentic AutoML presents a 7-phase ML workflow with LangGraph and MCP orchestration.",
    source: "public/images/projects/agentic-automl-poster-proof.webp",
    verification:
      "Private-safe senior design poster and local AutoML repository audit.",
    visibility: "private-safe",
    privacyBoundary:
      "Uses demo/source-truth data and excludes private repository source.",
  },
  {
    id: "visual-assist-tests",
    label: "71 iOS tests",
    claim: "Visual Assist has audited XCTest model and utility coverage.",
    source:
      "https://github.com/yadava5/VisualAssist/tree/main/VisualAssistTests",
    verification: "Public test tree and architecture evidence audit.",
    visibility: "public",
    privacyBoundary: "No live camera, location, or user sensor data is shown.",
  },
  {
    id: "taskflow-tests",
    label: "1,145 automated tests",
    claim:
      "Taskflow suite measured 2026-07: 634 frontend + 511 backend = 1,145 passing (vitest).",
    source: "https://github.com/yadava5/taskflow-calendar",
    verification: "Public repository and local screenshot audit.",
    visibility: "public",
    privacyBoundary: "No private data.",
  },
  {
    id: "fast-mnist-benchmark",
    label: "97%+ accuracy and 3.5x dot-kernel speedup",
    claim:
      "Fast MNIST benchmark proof supports the listed accuracy and kernel-speedup claims.",
    source: "public/images/projects/fast-mnist-nn.svg",
    verification:
      "Committed benchmark evidence in the public fast-mnist-nn repository.",
    visibility: "public",
    privacyBoundary: "No private data.",
  },
  {
    id: "master-inventory-ledger",
    label: "10,453 deduped rows",
    claim:
      "Master Inventory private-safe proof records the deduped inventory row count and schema boundary.",
    source: "public/images/projects/master-inventory-proof.svg",
    verification: "Private-safe local row-count ledger.",
    visibility: "private-safe",
    privacyBoundary:
      "Raw institutional exports, report names, owner names, and rows are excluded.",
  },
  {
    id: "policybot-validation",
    label: "19/20 structured sweep",
    claim:
      "PolicyBot private-safe proof records a structured validation sweep.",
    source: "public/images/projects/policybot-validation-proof.svg",
    verification: "Private-safe validation ledger.",
    visibility: "private-safe",
    privacyBoundary: "Raw policy text and Slack messages are excluded.",
  },
  {
    id: "paid-internships-sources",
    label: "6 academic sources",
    claim:
      "Paid Internships Advocacy cites six academic or institutional sources.",
    source: "https://github.com/yadava5/paid-internships-advocacy",
    verification: "Public repository/source-page audit.",
    visibility: "public",
    privacyBoundary: "No private data.",
  },
];
