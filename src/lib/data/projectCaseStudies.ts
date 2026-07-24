/**
 * @fileoverview Case-file (dossier) data — the written half of the site.
 *
 * Each entry is one working-paper dossier per docs/design-lab/DOSSIER-SPEC.md
 * and docs/design-lab/EVIDENCE-MODEL.md: a kicker with two dates and a status
 * word, a meta ledger, the problem/constraints/architecture/decisions spine,
 * an eval-protocol slip where a real protocol exists, VALIDATION as a
 * receipts table (claim | method | artifact | date | visibility) with
 * per-row anchors `#v-<projectId>-<n>`, boundary rows ("what I'm NOT
 * claiming"), and a permanent corrections register.
 *
 * Evidence rules (EVIDENCE-MODEL.md):
 *   - No receipt cites the portfolio itself. Every number terminates
 *     off-page (repo file @ commit, CI run, dated checked-in ledger) or the
 *     row carries no artifact link and is honest about why.
 *   - Repo pins are the repos' HEAD commits as verified via `gh` on
 *     2026-07-18 (the kicker's "last verified" date). Private repos carry
 *     no sha and no link — only their verified name.
 *   - Dates are real and recorded: committed-artifact dates come from the
 *     artifacts themselves (e.g. baseline_hybrid_v3.json `generated_at`
 *     2026-03-03; bench-20251226-154121 run files); audit dates come from
 *     this repo's own public history (proof ledgers checked in 2026-06-05,
 *     jobtracker suite audit 2026-06, VisualAssist test-count audit
 *     2026-05, AVX-512 retraction 2026-05-28). Where no date was recorded,
 *     the row says so instead of inventing one.
 */

import { Project, projects } from "@/lib/data/projects";
import { withBasePath } from "@/lib/utils";

export type CaseStudyNodeKind =
  | "client"
  | "api"
  | "data"
  | "ml"
  | "system"
  | "validation";

export interface CaseStudyNode {
  id: string;
  label: string;
  detail: string;
  kind: CaseStudyNodeKind;
  /**
   * True when this node is a gate a run must pass regardless of its
   * `kind` (e.g. jobtracker's classifier: SetFit stays off until its
   * training gates are met). Clay marks it in fig. 2.
   */
  gate?: boolean;
}

export interface CaseStudyEdge {
  from: string;
  to: string;
  label: string;
  /** True when the edge itself is the checkpoint (e.g. "approved actions") */
  gate?: boolean;
}

export interface CaseStudyDecision {
  decision: string;
  reason: string;
  tradeoff: string;
  /** ADR status word from a closed set ("accepted" — no revisits on file) */
  status: "accepted";
}

export type CaseStudyArtifactType =
  | "real-screenshot"
  | "representative-visual"
  | "diagram"
  | "benchmark"
  | "repo"
  | "demo"
  | "poster"
  | "presentation";

/**
 * A readable crop of a large plate (poster panels): the rect is in
 * source pixels of the artifact image — the page crops in CSS, so no
 * derivative asset is ever generated.
 */
export interface CaseStudyArtifactPanel {
  /** The panel's own printed title, quoted from the artifact */
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CaseStudyArtifact {
  type: CaseStudyArtifactType;
  label: string;
  href: string;
  /** Provenance strip for the artifact viewer: where it came from */
  source: string;
  /** Provenance strip: what it deliberately does not show */
  boundary: string;
  /** Provenance strip: when it was captured/checked in (YYYY-MM), if recorded */
  date: string | null;
  /** Intrinsic pixel size of the image — required when `panels` is set */
  sourceSize?: { width: number; height: number };
  /** Column-width readable crops rendered in place of the full thumbnail */
  panels?: CaseStudyArtifactPanel[];
}

export interface CaseStudyEvidenceDisclosure {
  label: string;
  detail: string;
}

export type ReceiptVisibility = "public" | "private-safe" | "local-only";

export interface ReceiptArtifactLink {
  label: string;
  href: string;
  /**
   * W5 (era-w4 finding 2): the terminal is an on-page CAPTURE of a
   * poster/deck — a photograph of evidence, not a repo-pinned or
   * checked-in artifact. The audit walk marks these with the hollow
   * ring, never the tick, and counts them separately in the settled
   * line. Explicit data-level flag on purpose: href shape must never
   * decide honesty (`#ledger` rows terminate in a checked-in JSON and
   * stay full artifacts).
   */
  capture?: boolean;
}

/** One row of the receipts table (the validation centerpiece) */
export interface CaseReceipt {
  /** The claim, first person, concrete */
  claim: string;
  /** How it was checked — one line */
  method: string;
  /** Off-page terminals; empty = no external artifact exists (say so) */
  artifacts: ReceiptArtifactLink[];
  /** When the evidence was recorded (YYYY-MM or YYYY-MM-DD); null = not recorded */
  date: string | null;
  visibility: ReceiptVisibility;
  /**
   * W2: the row's number is withheld from full standing until a
   * committed artifact earns it — EvidenceTable renders the reserved
   * dashed-clay HELD stamp plus a Newsreader footnote ("{note} — see
   * corrections."), and the corrections register must carry the
   * matching entry. Counts against the ≤2 stamps/page budget.
   */
  held?: { note: string };
}

/** Corrections register entry — errata are permanent, never deleted */
export interface CaseCorrection {
  date: string;
  kind: "erratum" | "note";
  text: string;
}

/** The 5-line mono method slip beside a headline number */
export interface CaseProtocol {
  /** False renders the honest "not yet documented" slip */
  documented: boolean;
  lines: { label: string; value: string }[];
}

/** A dated, checked-in ledger rendered as an HTML table (SVG demoted) */
export interface CaseLedger {
  title: string;
  /** Raw checked-in JSON, offered for download */
  jsonPath: string;
  /** When the ledger was checked into this repo (public history) */
  checkedIn: string;
  rows: { label: string; value: string; note: string }[];
  boundary: string;
}

/** AutoML registry excerpt (the same transcription the home fig 4.1 shows) */
export interface RegistryFigRow {
  run: string;
  model: string;
  status: string;
}

export interface ProjectCaseStudy {
  projectId: string;
  treatment: "evidence-ledger" | "native-intelligence" | "field-systems";
  /** Dossier position, 1-based ("case file NN / 07") */
  fileNo: number;
  role: string;
  timeframe: string;
  /** Kicker dates: filed = project start; verified = last evidence check */
  filed: string;
  verified: string;
  /** Status word from a closed set */
  status: "in progress" | "shipped" | "concluded";
  /**
   * Honest qualifier after the status word ("core shipped, run ledger
   * pending") — every clause must trace to a receipt or boundary row.
   */
  statusDetail?: string;
  /** Public repo pinned to the HEAD sha verified on the `verified` date */
  repoPin: { repo: string; sha: string; branch?: string; href: string } | null;
  /** Private repo name (verified via GitHub metadata; no link on purpose) */
  privateRepoName?: string;
  summary: string;
  evidenceDisclosure?: CaseStudyEvidenceDisclosure;
  problem: string;
  constraints: string[];
  architecture: {
    summary: string;
    nodes: CaseStudyNode[];
    edges: CaseStudyEdge[];
    /**
     * Topology-driven fig. 2 layout: "linear" draws the pipeline rail
     * (requires `flow`), "loop" leans into the gated circuit; omitted =
     * the default card grid.
     */
    variant?: "linear" | "loop";
    /** Linear only: node-id stages in true pipeline order */
    flow?: string[][];
    /** One bespoke inked margin note; the text must trace to a receipt */
    annotation?: string;
  };
  decisions: CaseStudyDecision[];
  protocol?: CaseProtocol;
  /** Receipts — validation group (anchors #v-<id>-1 … n) */
  receipts: CaseReceipt[];
  /** Receipts — outcomes group (anchors continue after receipts) */
  outcomes: CaseReceipt[];
  /** Boundary rows — what this file is NOT claiming */
  notClaiming: string[];
  corrections: CaseCorrection[];
  ledger?: CaseLedger;
  registryFig?: { rows: RegistryFigRow[]; caption: string[] };
  artifacts: CaseStudyArtifact[];
}

/* Repo pins — HEAD shas verified via `gh api` on 2026-07-18. */
const JOBTRACKER_SHA = "3225eb4";
const JOBTRACKER_BLOB = `https://github.com/yadava5/jobtracker/blob/${JOBTRACKER_SHA}`;
const JOBTRACKER_TREE = `https://github.com/yadava5/jobtracker/tree/${JOBTRACKER_SHA}`;
const VISUAL_ASSIST_SHA = "22ebdaa";
const VISUAL_ASSIST_BLOB = `https://github.com/yadava5/VisualAssist/blob/${VISUAL_ASSIST_SHA}`;
const VISUAL_ASSIST_TREE = `https://github.com/yadava5/VisualAssist/tree/${VISUAL_ASSIST_SHA}`;
const TASKFLOW_SHA = "69a59e7";
const TASKFLOW_TREE = `https://github.com/yadava5/taskflow-calendar/tree/${TASKFLOW_SHA}`;
const FAST_MNIST_SHA = "c6e5c0b";
const FAST_MNIST_BLOB = `https://github.com/yadava5/fast-mnist-nn/blob/${FAST_MNIST_SHA}`;

/** Backend CI run that executes the blocking v3 classifier gates (public) */
const JOBTRACKER_CI_RUN =
  "https://github.com/yadava5/jobtracker/actions/runs/24665061332";

export const projectCaseStudies: ProjectCaseStudy[] = [
  {
    projectId: "jobtracker",
    treatment: "native-intelligence",
    fileNo: 4,
    role: "Designer and sole engineer",
    timeframe: "2026-02 to Present",
    filed: "2026-02",
    verified: "2026-07",
    status: "in progress",
    /* Both clauses trace to receipts: 06 (macOS build) + 07/boundary
       (web beta passes gates but remains a scaffold). */
    statusDetail: "native core working, web beta a scaffold",
    repoPin: {
      repo: "yadava5/jobtracker",
      sha: JOBTRACKER_SHA,
      branch: "integration/web-migration",
      href: JOBTRACKER_TREE,
    },
    summary:
      "A native macOS tracker that reads the job search out of the inbox. Email syncs in, a local classifier names each message, and the noise becomes an application pipeline you can act on.",
    evidenceDisclosure: {
      label: "Private-safe proof: no email content",
      detail:
        "The source repository documents that old screenshots were removed as outdated. This case file uses architecture, source, build, test, and benchmark evidence instead of inbox screenshots or private application data.",
    },
    problem:
      "The status of a job search scatters across Gmail, iCloud Mail, employer systems, and one-off messages. A spreadsheet can't keep up: updates get missed, rows get retyped, and the record drifts from the truth.",
    constraints: [
      "Keep job-search email classification local and privacy-first.",
      "Support both Gmail OAuth2 and iCloud IMAP sources.",
      "Classify noisy inbox messages into useful application states.",
      "Fit the workflow into a native macOS dashboard instead of another web tab.",
    ],
    architecture: {
      summary:
        "Email sources feed an async sync layer, then a three-layer classifier, then local SQLite storage and a SwiftUI dashboard.",
      /* The true topology is a straight pipeline, so fig. 2 draws one:
         sources ⟶ classifier ⟶ store ⟶ dashboard, with background sync
         as the single off-spine branch. */
      variant: "linear",
      flow: [["gmail", "icloud"], ["classifier"], ["store"], ["ui"]],
      /* Quoted from receipt 02 (docs/ML_STRATEGY.md) — the classifier IS
         the pipeline's gate. */
      annotation:
        "the gate is real: setfit stays off until its training gates are met",
      nodes: [
        { id: "gmail", label: "Gmail", detail: "OAuth2 sync", kind: "api" },
        {
          id: "icloud",
          label: "iCloud Mail",
          detail: "IMAP sync",
          kind: "api",
        },
        {
          id: "classifier",
          label: "Classifier",
          detail: "Rules, embeddings, gated SetFit",
          kind: "ml",
          /* Receipt 02: SetFit is enabled only after its training gates
             pass — this node genuinely stops the run (fig. 2's clay). */
          gate: true,
        },
        {
          id: "store",
          label: "SQLite",
          detail: "Local application state",
          kind: "data",
        },
        {
          id: "ui",
          label: "SwiftUI",
          detail: "Native macOS dashboard",
          kind: "client",
        },
        {
          id: "sync",
          label: "SMAppService",
          detail: "Background sync",
          kind: "system",
        },
      ],
      edges: [
        { from: "gmail", to: "classifier", label: "messages" },
        { from: "icloud", to: "classifier", label: "messages" },
        { from: "classifier", to: "store", label: "classified events" },
        { from: "store", to: "ui", label: "pipeline state" },
        { from: "sync", to: "store", label: "background updates" },
      ],
    },
    decisions: [
      {
        decision: "Use on-device classification",
        reason: "The project handles personal job-search email.",
        tradeoff:
          "Local ML reduces hosted-service convenience but keeps sensitive messages private.",
        status: "accepted",
      },
      {
        decision: "Use a three-layer classifier",
        reason:
          "Rules, embeddings, and SetFit cover different levels of signal quality.",
        tradeoff:
          "More moving parts than a single model, but easier to debug and tune.",
        status: "accepted",
      },
      {
        decision: "Use SQLite for local state",
        reason: "The product is a native personal workflow tool.",
        tradeoff:
          "Local persistence is simpler than multi-user cloud sync, but intentionally device-scoped.",
        status: "accepted",
      },
    ],
    protocol: {
      documented: true,
      lines: [
        {
          label: "sample",
          value:
            "96 messages — classifier_eval_v3.jsonl, 12 per label × 8 labels, balanced by design",
        },
        {
          label: "mix",
          value:
            "65 core-positive · 17 edge-noise · 8 historical-miss · 6 core-negative scenarios",
        },
        {
          label: "judge",
          value:
            "predicted vs expected label → macro-F1; the ci gate fails below the configured floor",
        },
        {
          label: "run",
          value:
            "2026-03-03 — deterministic hybrid profile, committed as baseline_hybrid_v3.json",
        },
        {
          label: "repro",
          value:
            "python -m jobtracker.scripts.evaluate_classifier --mode hybrid --dataset data/evaluation/classifier_eval_v3.jsonl --hybrid-profile deterministic",
        },
      ],
    },
    receipts: [
      {
        claim:
          "Gmail OAuth2 and iCloud IMAP both feed the pipeline as first-class sources.",
        method: "traced the provider routers and sync docs in the public repo",
        artifacts: [
          {
            label: `jobtracker @ ${JOBTRACKER_SHA} · docs/ARCHITECTURE.md`,
            href: `${JOBTRACKER_BLOB}/docs/ARCHITECTURE.md`,
          },
        ],
        date: "2026-06",
        visibility: "public",
      },
      {
        claim:
          "The classifier is three layers — rules, e5 embeddings, SetFit — and SetFit stays off until its training gates are met.",
        method: "ML strategy doc, read against the backend source",
        artifacts: [
          {
            label: `jobtracker @ ${JOBTRACKER_SHA} · docs/ML_STRATEGY.md`,
            href: `${JOBTRACKER_BLOB}/docs/ML_STRATEGY.md`,
          },
        ],
        date: "2026-06",
        visibility: "public",
      },
      {
        claim:
          "Classification runs on-device; message content is not sent to hosted inference.",
        method: "architecture audit of the classify path",
        artifacts: [
          {
            label: `jobtracker @ ${JOBTRACKER_SHA} · README.md`,
            href: `${JOBTRACKER_BLOB}/README.md`,
          },
        ],
        date: "2026-06",
        visibility: "public",
      },
      {
        claim:
          "I ran the backend suite locally: 182 tests passed under the test/null-keyring environment.",
        method: "local run against the public test tree",
        artifacts: [
          {
            label: `jobtracker @ ${JOBTRACKER_SHA} · backend/tests`,
            href: `${JOBTRACKER_TREE}/backend/tests`,
          },
        ],
        date: "2026-06",
        visibility: "public",
      },
      {
        claim:
          "Rules and deterministic hybrid v3 gates both passed on 96 samples with macro-F1 0.9791.",
        method:
          "committed baseline, deterministic profile — protocol in the method slip",
        artifacts: [
          {
            label: `jobtracker @ ${JOBTRACKER_SHA} · baseline_hybrid_v3.json`,
            href: `${JOBTRACKER_BLOB}/backend/data/evaluation/baseline_hybrid_v3.json`,
          },
          {
            label: "backend-ci run ↗",
            href: JOBTRACKER_CI_RUN,
          },
        ],
        date: "2026-03-03",
        visibility: "public",
      },
      {
        claim:
          "The macOS Debug target built locally with xcodebuild against the JobTracker scheme.",
        method: "local build; no build artifact is published",
        artifacts: [],
        date: null,
        visibility: "local-only",
      },
      {
        claim:
          "The web beta passes typecheck, lint, build, and a Playwright login smoke — but the dashboard remains a scaffold, not a finished product.",
        method: "local gate run over the public web workspace",
        artifacts: [
          {
            label: `jobtracker @ ${JOBTRACKER_SHA} · apps/web`,
            href: `${JOBTRACKER_TREE}/apps/web`,
          },
        ],
        date: "2026-06",
        visibility: "public",
      },
    ],
    outcomes: [
      {
        claim:
          "Job updates land in a trackable pipeline instead of a spreadsheet.",
        method: "the product's own workflow, described — not a usage metric",
        artifacts: [],
        date: null,
        visibility: "public",
      },
      {
        claim:
          "The classifier also runs fully in-browser via quantized ONNX — a public demo space.",
        method: "ported the local classifier; the space is inspectable",
        artifacts: [
          {
            label: "huggingface.co/spaces/yadava5/jobtracker-classifier ↗",
            href: "https://huggingface.co/spaces/yadava5/jobtracker-classifier",
          },
        ],
        date: "2026-07",
        visibility: "public",
      },
    ],
    notClaiming: [
      "I'm not claiming the web dashboard is finished — it builds and passes its smoke test, but it remains a scaffold and is not shown as a product screenshot.",
      "No production email-volume numbers are claimed. Architecture and source links are shown publicly; private email and application records are not shown.",
    ],
    corrections: [],
    artifacts: [
      {
        type: "diagram",
        label: "Local classification architecture",
        href: withBasePath("/images/projects/jobtracker-architecture.svg"),
        source: "rendered from the public repository structure",
        boundary: "no private email content is shown",
        date: "2026-06",
      },
      {
        type: "repo",
        label: "Source-truth README",
        href: `${JOBTRACKER_BLOB}/README.md`,
        source: `yadava5/jobtracker @ ${JOBTRACKER_SHA}`,
        boundary: "public repository file",
        date: "2026-07",
      },
      {
        type: "repo",
        label: "Architecture docs",
        href: `${JOBTRACKER_BLOB}/docs/ARCHITECTURE.md`,
        source: `yadava5/jobtracker @ ${JOBTRACKER_SHA}`,
        boundary: "public repository file",
        date: "2026-07",
      },
      {
        type: "benchmark",
        label: "ML strategy and evaluation gates",
        href: `${JOBTRACKER_BLOB}/docs/ML_STRATEGY.md`,
        source: `yadava5/jobtracker @ ${JOBTRACKER_SHA}`,
        boundary: "public repository file",
        date: "2026-07",
      },
      {
        type: "repo",
        label: "Backend test suite",
        href: `${JOBTRACKER_TREE}/backend/tests`,
        source: `yadava5/jobtracker @ ${JOBTRACKER_SHA}`,
        boundary: "public repository tree",
        date: "2026-07",
      },
      {
        type: "repo",
        label: "Web beta scaffold",
        href: `${JOBTRACKER_TREE}/apps/web`,
        source: `yadava5/jobtracker @ ${JOBTRACKER_SHA}`,
        boundary: "scaffold — not a finished product",
        date: "2026-07",
      },
    ],
  },
  {
    projectId: "automl",
    treatment: "evidence-ledger",
    fileNo: 1,
    role: "Capstone engineer — my slice below",
    timeframe: "2025-09 to Present",
    filed: "2025-09",
    verified: "2026-07",
    status: "in progress",
    /* Traces to the corrections note + boundary row: the platform core
       is built; the demo-data run ledger has not shipped yet. */
    statusDetail: "core shipped, run ledger pending",
    repoPin: null,
    privateRepoName: "yadava5/ai-augmented-auto-ml-toolchain",
    summary:
      "A private, GitHub-backed agentic AutoML platform. Datasets and domain documents become auditable pipeline decisions — and a human approval gate holds every generated action before it alters the workflow.",
    evidenceDisclosure: {
      label: "Private proof: GitHub evidence",
      detail:
        "The current GitHub repository is yadava5/ai-augmented-auto-ml-toolchain and its README identifies the product as Agentic AutoML Platform. The repository is private, so this case file shows private-safe evidence instead of a public source link.",
    },
    problem:
      "Between a raw dataset and a useful model sits a chain of repetitive judgment: ingestion, feature decisions, training, evaluation, deployment packaging. Automate the chain carelessly and the judgment disappears with the labor.",
    constraints: [
      "Make pipeline decisions auditable instead of opaque.",
      "Support domain documents through retrieval and MCP-based orchestration.",
      "Require human approval before generated actions alter workflow state.",
      "Keep training workflows reproducible with containerized execution.",
      "Validate the product flow with browser-level checks.",
    ],
    architecture: {
      summary:
        "A React and TypeScript interface coordinates Express/PostgreSQL services, LangGraph + MCP orchestration, notebook-based training workflows, Docker execution, and Playwright evaluation.",
      /* The true topology is a gated circuit: requests go down through
         the approval edge, browser proof comes back to the ui. */
      variant: "loop",
      /* Traces to decision d2 + the approval-gate constraint. */
      annotation:
        "generated actions hold at the approval edge until a human says go",
      nodes: [
        {
          id: "ui",
          label: "React 19 UI",
          detail: "Dataset and workflow surface",
          kind: "client",
        },
        {
          id: "api",
          label: "Express 5 API",
          detail: "Pipeline orchestration",
          kind: "api",
        },
        {
          id: "orchestrator",
          label: "LangGraph + MCP",
          detail: "Agentic workflow routing",
          kind: "ml",
        },
        {
          id: "runtime",
          label: "Docker runtime",
          detail: "Reproducible runs",
          kind: "system",
        },
        {
          id: "store",
          label: "PostgreSQL 16",
          detail: "Run metadata",
          kind: "data",
        },
        {
          id: "evals",
          label: "Playwright evals",
          detail: "Workflow validation",
          kind: "validation",
        },
      ],
      edges: [
        { from: "ui", to: "api", label: "workflow requests" },
        /* The human gate lives on this edge: only approved actions pass */
        {
          from: "api",
          to: "orchestrator",
          label: "approved actions",
          gate: true,
        },
        { from: "api", to: "runtime", label: "training jobs" },
        { from: "runtime", to: "store", label: "run records" },
        { from: "evals", to: "ui", label: "browser proof" },
      ],
    },
    decisions: [
      {
        decision: "Use LangGraph + MCP for orchestration",
        reason:
          "The platform needs phase-aware routing, tool calls, and auditable decisions tied to domain context.",
        tradeoff:
          "More infrastructure than a simple model runner, but better for traceable workflows.",
        status: "accepted",
      },
      {
        decision: "Keep human approval gates",
        reason:
          "Generated preprocessing, training, and deployment actions should be reviewed before they alter the workflow.",
        tradeoff:
          "Approval gates slow down full automation, but they make the system safer and easier to debug.",
        status: "accepted",
      },
      {
        decision: "Containerize execution",
        reason: "Training runs need reproducible environments.",
        tradeoff: "Docker adds setup cost but reduces machine-specific drift.",
        status: "accepted",
      },
    ],
    protocol: {
      documented: false,
      lines: [],
    },
    receipts: [
      {
        claim:
          "The platform lives in the private repo yadava5/ai-augmented-auto-ml-toolchain; its README titles it Agentic AutoML Platform.",
        method: "live GitHub metadata check",
        artifacts: [],
        date: "2026-07",
        visibility: "private-safe",
      },
      {
        claim:
          "Upload, EDA, NL-to-SQL, preprocessing, training, experiments, and deployment are the seven lifecycle phases.",
        method: "read from the senior design poster and the local repo",
        artifacts: [
          {
            label: "see fig. 6 — the expo poster",
            href: "#artifacts",
            capture: true,
          },
        ],
        date: "2026-05",
        visibility: "private-safe",
      },
      {
        claim:
          "HPO, multi-model search, notebook training, and automated workflow evaluation are built into the platform.",
        method: "poster + presenter deck, checked against the local repo",
        artifacts: [
          {
            label: "see fig. 5 — the presenter deck",
            href: "#artifacts",
            capture: true,
          },
        ],
        date: "2026-05",
        visibility: "private-safe",
      },
      {
        claim:
          "Presenter slide 8 records the stack and validation posture: all-green tests, coverage, logs, packages, and migrations.",
        method: "transcribed from the presenter artifact",
        artifacts: [
          {
            label: "see fig. 5 — the presenter deck",
            href: "#artifacts",
            capture: true,
          },
        ],
        date: "2026-05",
        visibility: "private-safe",
      },
      {
        claim:
          "My slice of the build: the Monaco/Jupyter runtime with live WebSocket sync, Docker sandbox constraints, the eval runner, and the Optuna study streaming UI.",
        method: "as presented — the presenter artifact names this work",
        artifacts: [
          {
            label: "see fig. 5 — the presenter deck",
            href: "#artifacts",
            capture: true,
          },
        ],
        date: "2026-05",
        visibility: "private-safe",
      },
      {
        claim:
          "Training runs execute in a Dockerized runtime for reproducibility.",
        method: "poster architecture panel + local repo audit",
        artifacts: [
          {
            label: "see fig. 6 — the expo poster",
            href: "#artifacts",
            capture: true,
          },
        ],
        date: "2026-05",
        visibility: "private-safe",
      },
    ],
    outcomes: [
      {
        claim:
          "A dataset and a goal become a structured, auditable workflow — planned and argued for by agents that still cannot press go.",
        method: "the product's design, described — not an outcome metric",
        artifacts: [],
        date: null,
        visibility: "private-safe",
      },
      {
        claim:
          "Pipeline decisions run through LangGraph and MCP tool calls rather than free-form output.",
        method: "poster workflow-state panel",
        artifacts: [
          {
            label: "see fig. 6 — the expo poster",
            href: "#artifacts",
            capture: true,
          },
        ],
        date: "2026-05",
        visibility: "private-safe",
      },
    ],
    notClaiming: [
      "No per-run metrics are published here. The registry excerpt shows run, model, and status only — a demo-data run ledger with a complete metric trail has not shipped yet.",
      "The repository is private, so source is not inspectable from this page. The evidence is the expo poster, the presenter deck, and the private-safe registry capture — verifiable in interview.",
    ],
    corrections: [
      {
        date: "2026-07",
        kind: "note",
        text: "Per-run metrics remain withheld while the repository is private; the eval protocol for the platform's own model runs is not yet publicly documented. Nothing here has been retracted — this register is waiting on a demo-data run ledger.",
      },
    ],
    registryFig: {
      rows: [
        { run: "038", model: "log-reg", status: "approved" },
        { run: "039", model: "random forest", status: "approved" },
        { run: "040", model: "gbm", status: "approved" },
        { run: "041", model: "xgboost", status: "awaiting approval" },
      ],
      caption: [
        "fig. 3 — experiment registry, transcribed private-safe excerpt.",
        "metrics withheld — private repository; see the boundary rows below.",
      ],
    },
    artifacts: [
      {
        type: "real-screenshot",
        label: "Private-safe experiment registry screenshot",
        href: withBasePath("/images/projects/automl.webp"),
        source: "local AutoML repository, demo data",
        boundary: "demo dataset — no client or institutional data",
        date: "2026-06",
      },
      {
        type: "presentation",
        label: "Presenter stack proof",
        href: withBasePath("/images/projects/agentic-automl-stack-proof.png"),
        source: "senior design presenter deck, slide 8",
        boundary: "private-safe capture — source repo not shown",
        date: "2026-05",
      },
      {
        type: "poster",
        label: "Expo poster proof",
        href: withBasePath("/images/projects/agentic-automl-poster-proof.webp"),
        source: "senior design expo poster, spring 2026",
        boundary: "private-safe capture — demo data only",
        date: "2026-05",
        /* Column-width CSS crops of the checked-in capture (no derivative
           assets); panel titles are quoted from the poster itself. */
        sourceSize: { width: 1600, height: 1200 },
        panels: [
          {
            label: "§2 — an agent you can approve",
            x: 536,
            y: 102,
            width: 528,
            height: 498,
          },
          {
            label: "§3 — one langgraph, every step auditable",
            x: 1069,
            y: 102,
            width: 523,
            height: 498,
          },
          {
            label: "§4 — measured on the public leaderboard",
            x: 8,
            y: 606,
            width: 520,
            height: 510,
          },
        ],
      },
    ],
  },
  {
    projectId: "visual-assist",
    treatment: "field-systems",
    fileNo: 3,
    role: "iOS accessibility engineer",
    timeframe: "2025-03 to Present",
    filed: "2025-03",
    verified: "2026-07",
    status: "in progress",
    /* The repo's own README labels the build a beta. */
    statusDetail: "beta, per the readme",
    repoPin: {
      repo: "yadava5/VisualAssist",
      sha: VISUAL_ASSIST_SHA,
      href: VISUAL_ASSIST_TREE,
    },
    summary:
      "An iOS accessibility app that meets the room before its user does. LiDAR finds the obstacles, Vision reads the text, haptics and speech carry the answer — and the processing stays on the device.",
    problem:
      "A visually impaired user needs the room described now, not after a round trip — and never at the price of shipping camera or location context to somebody else's server.",
    constraints: [
      "Prioritize on-device processing for privacy.",
      "Support LiDAR obstacle detection and haptic feedback.",
      "Respect VoiceOver-first interaction patterns.",
      "Use native iOS frameworks for performance and accessibility.",
    ],
    architecture: {
      summary:
        "ARKit and Vision process device context locally, then SwiftUI and VoiceOver expose guidance through speech, haptics, and commands.",
      nodes: [
        {
          id: "sensor",
          label: "LiDAR",
          detail: "Depth and obstacle signals",
          kind: "system",
        },
        {
          id: "vision",
          label: "Vision OCR",
          detail: "Text reading",
          kind: "ml",
        },
        {
          id: "localvision",
          label: "Local Vision",
          detail: "On-device recognition",
          kind: "ml",
        },
        {
          id: "feedback",
          label: "Haptics + speech",
          detail: "Guided feedback",
          kind: "client",
        },
        {
          id: "voiceover",
          label: "VoiceOver",
          detail: "Accessible controls",
          kind: "client",
        },
      ],
      edges: [
        { from: "sensor", to: "localvision", label: "environment signal" },
        { from: "vision", to: "feedback", label: "text context" },
        { from: "localvision", to: "feedback", label: "local recognition" },
        { from: "voiceover", to: "feedback", label: "interaction layer" },
      ],
    },
    decisions: [
      {
        decision: "Use native iOS frameworks",
        reason:
          "LiDAR, Vision, haptics, and VoiceOver are first-class platform capabilities.",
        tradeoff:
          "The app targets capable iOS devices rather than every phone.",
        status: "accepted",
      },
      {
        decision: "Keep processing on-device",
        reason: "Camera and navigation context is sensitive.",
        tradeoff: "Local inference constrains model and compute choices.",
        status: "accepted",
      },
    ],
    receipts: [
      {
        claim:
          "71 test functions cover models and utilities — counted in the public VisualAssistTests tree.",
        method: "local repository audit, function count",
        artifacts: [
          {
            label: `VisualAssist @ ${VISUAL_ASSIST_SHA} · VisualAssistTests`,
            href: `${VISUAL_ASSIST_TREE}/VisualAssistTests`,
          },
        ],
        date: "2026-05",
        visibility: "public",
      },
      {
        claim:
          "VoiceOver-first flows and voice commands are the interaction model, documented in the public README.",
        method: "README feature table, checked against the source",
        artifacts: [
          {
            label: `VisualAssist @ ${VISUAL_ASSIST_SHA} · README.md`,
            href: `${VISUAL_ASSIST_BLOB}/README.md`,
          },
        ],
        date: "2026-05",
        visibility: "public",
      },
      {
        claim:
          "ARKit, Vision OCR, human rectangles, and animal recognition are the vision paths; no custom Core ML model file was present in the audited repo.",
        method: "source audit of the vision code paths",
        artifacts: [
          {
            label: `VisualAssist @ ${VISUAL_ASSIST_SHA} · source`,
            href: VISUAL_ASSIST_TREE,
          },
        ],
        date: "2026-05",
        visibility: "public",
      },
    ],
    outcomes: [
      {
        claim:
          "LiDAR obstacle detection with haptic feedback is the core guidance loop.",
        method: "README + source; no field-usage metric is claimed",
        artifacts: [
          {
            label: `VisualAssist @ ${VISUAL_ASSIST_SHA} · README.md`,
            href: `${VISUAL_ASSIST_BLOB}/README.md`,
          },
        ],
        date: "2026-05",
        visibility: "public",
      },
      {
        claim:
          "Vision OCR reads environmental text aloud via speech synthesis.",
        method: "README feature table + source paths",
        artifacts: [
          {
            label: `VisualAssist @ ${VISUAL_ASSIST_SHA} · README.md`,
            href: `${VISUAL_ASSIST_BLOB}/README.md`,
          },
        ],
        date: "2026-05",
        visibility: "public",
      },
    ],
    notClaiming: [
      "No custom-trained Core ML model is claimed — the vision paths use Apple's frameworks, and no model file was present in the audited repo.",
      "No live camera, location, or user sensor data is shown anywhere in this file.",
    ],
    corrections: [
      {
        date: "2026-05",
        kind: "erratum",
        text: "An earlier draft carried the smaller count from the repo's CI run title. The audited count in the current tree is 71 test functions; the receipt above links the tree so the number can be checked.",
      },
    ],
    artifacts: [
      {
        type: "diagram",
        label: "On-device accessibility architecture",
        href: withBasePath("/images/projects/visual-assist-architecture.svg"),
        source: "rendered from the public repository structure",
        boundary: "no live camera or location context is shown",
        date: "2026-06",
      },
      {
        type: "repo",
        label: "Source code",
        href: VISUAL_ASSIST_TREE,
        source: `yadava5/VisualAssist @ ${VISUAL_ASSIST_SHA}`,
        boundary: "public repository",
        date: "2026-07",
      },
      {
        type: "repo",
        label: "README beta and LiDAR requirements",
        href: `${VISUAL_ASSIST_BLOB}/README.md#-requirements`,
        source: `yadava5/VisualAssist @ ${VISUAL_ASSIST_SHA}`,
        boundary: "public repository file",
        date: "2026-07",
      },
      {
        type: "repo",
        label: "XCTest source evidence",
        href: `${VISUAL_ASSIST_TREE}/VisualAssistTests`,
        source: `yadava5/VisualAssist @ ${VISUAL_ASSIST_SHA}`,
        boundary: "public repository tree",
        date: "2026-07",
      },
    ],
  },
  {
    projectId: "taskflow-calendar",
    treatment: "evidence-ledger",
    fileNo: 5,
    role: "Full-stack engineer",
    timeframe: "2023-09 to 2025-05",
    filed: "2023-09",
    verified: "2026-07",
    status: "shipped",
    /* Traces to the boundary row: a demo deployment with mock login. */
    statusDetail: "demo deployment, mock login",
    repoPin: {
      repo: "yadava5/taskflow-calendar",
      sha: TASKFLOW_SHA,
      href: TASKFLOW_TREE,
    },
    summary:
      "A production-style calendar and task manager that takes its scheduling in plain English — parsed into structured intent, checked for conflicts, stored in PostgreSQL, covered by a broad automated suite.",
    problem:
      "Planning splinters across tools — notes here, reminders there, scheduling language nowhere — and nobody notices two meetings colliding until they collide.",
    constraints: [
      "Support natural language input for scheduling.",
      "Keep full-stack behavior tested across frontend, backend, and integration layers.",
      "Use PostgreSQL and indexed queries for calendar data.",
      "Keep the workspace usable across multiple planning views.",
    ],
    architecture: {
      summary:
        "A React and TypeScript interface sends scheduling workflows through a full-stack app backed by PostgreSQL and tested across 1,145 automated checks.",
      nodes: [
        {
          id: "ui",
          label: "React 19",
          detail: "Task and calendar workspace",
          kind: "client",
        },
        {
          id: "nlp",
          label: "NLP input",
          detail: "chrono-node and compromise",
          kind: "ml",
        },
        {
          id: "api",
          label: "App services",
          detail: "Scheduling and conflict logic",
          kind: "api",
        },
        {
          id: "db",
          label: "PostgreSQL",
          detail: "Indexed calendar data",
          kind: "data",
        },
        {
          id: "tests",
          label: "1,145 tests",
          detail: "Frontend, backend, integration",
          kind: "validation",
        },
      ],
      edges: [
        { from: "ui", to: "nlp", label: "natural language" },
        { from: "nlp", to: "api", label: "parsed intent" },
        { from: "api", to: "db", label: "calendar records" },
        { from: "tests", to: "api", label: "regression coverage" },
      ],
    },
    decisions: [
      {
        decision: "Use NLP for smart input",
        reason:
          "Scheduling should accept natural language instead of only rigid forms.",
        tradeoff: "Parsing ambiguity requires validation and clear fallbacks.",
        status: "accepted",
      },
      {
        decision: "Build broad automated tests",
        reason:
          "Calendar behavior has many edge cases and regressions are expensive.",
        tradeoff:
          "More test maintenance, but higher confidence in app behavior.",
        status: "accepted",
      },
    ],
    receipts: [
      {
        claim:
          "I measured the suite in 2026-07: 634 frontend + 511 backend = 1,145 tests passing under vitest.",
        method: "local run against the pinned public source",
        artifacts: [
          {
            label: `taskflow-calendar @ ${TASKFLOW_SHA}`,
            href: TASKFLOW_TREE,
          },
        ],
        date: "2026-07",
        visibility: "public",
      },
      {
        claim:
          "Scheduling accepts natural language — chrono-node and compromise parse it into structured intent.",
        method: "source audit of the NLP input path",
        artifacts: [
          {
            label: `taskflow-calendar @ ${TASKFLOW_SHA}`,
            href: TASKFLOW_TREE,
          },
        ],
        date: "2026-07",
        visibility: "public",
      },
      {
        claim: "Calendar data sits in PostgreSQL behind indexed queries.",
        method: "schema and query audit in the public source",
        artifacts: [
          {
            label: `taskflow-calendar @ ${TASKFLOW_SHA}`,
            href: TASKFLOW_TREE,
          },
        ],
        date: "2026-07",
        visibility: "public",
      },
    ],
    outcomes: [
      {
        claim:
          "The workspace runs multi-pane planning with a Kanban board and multi-calendar views — inspectable in the live demo.",
        method: "the deployed demo, mock-login flow",
        artifacts: [
          {
            label: "taskflow-calendar-ashy.vercel.app ↗",
            href: "https://taskflow-calendar-ashy.vercel.app",
          },
        ],
        date: "2026-07",
        visibility: "public",
      },
      {
        claim:
          "Conflict detection flags overlapping scheduling before it lands.",
        method: "feature audit in source and demo",
        artifacts: [
          {
            label: `taskflow-calendar @ ${TASKFLOW_SHA}`,
            href: TASKFLOW_TREE,
          },
        ],
        date: "2026-07",
        visibility: "public",
      },
    ],
    notClaiming: [
      "1,145 is my local vitest count from 2026-07 against the pinned commit — not a CI badge. The repo's own CI is red on main right now, and I'd rather tell you that than hide it.",
      "No production users or uptime are claimed; the deployment is a demo with a mock-login flow.",
    ],
    corrections: [],
    artifacts: [
      {
        type: "real-screenshot",
        label: "Local mock-login calendar screenshot",
        href: withBasePath("/images/projects/taskflow.png"),
        source: "local frontend, repository mock-login flow",
        boundary: "demo user state — no real user data",
        date: "2026-06",
      },
      {
        type: "repo",
        label: "Source code",
        href: TASKFLOW_TREE,
        source: `yadava5/taskflow-calendar @ ${TASKFLOW_SHA}`,
        boundary: "public repository",
        date: "2026-07",
      },
    ],
  },
  {
    projectId: "master-inventory",
    treatment: "field-systems",
    fileNo: 6,
    role: "Data integration engineer",
    timeframe: "2025-06 to 2026-05",
    filed: "2025-06",
    verified: "2026-07",
    status: "concluded",
    statusDetail: "role ended 2026-05",
    repoPin: null,
    privateRepoName: "institutional — Miami University IT",
    summary:
      "Private proof from institutional ITSM data work: a Python/pandas pipeline that takes Workday exports and Tableau metadata — systems that disagree — and files them into one 35-field master inventory the dashboards can trust.",
    evidenceDisclosure: {
      label: "Private-safe evidence",
      detail:
        "This case file describes the engineering shape, systems, and validation model without exposing institutional records, internal UI, or raw data.",
    },
    problem:
      "Asset identifiers, ownership fields, Tableau metadata, Workday exports — each system keeps its own version of the truth. Reporting built on records that disagree inherits the disagreement.",
    constraints: [
      "Keep institutional details private while explaining the engineering shape.",
      "Normalize large operational datasets without losing auditability.",
      "Create deterministic inventory identifiers across heterogeneous sources.",
      "Produce outputs that downstream Tableau Prep flows and dashboards can trust.",
    ],
    architecture: {
      summary:
        "Workday exports and Tableau metadata feed Python/pandas transforms, deterministic IDs, timestamped run artifacts, and dashboard-ready outputs.",
      nodes: [
        {
          id: "workday",
          label: "Workday exports",
          detail: "Operational report inputs",
          kind: "data",
        },
        {
          id: "tableau",
          label: "Tableau metadata",
          detail: "Cloud REST metadata",
          kind: "api",
        },
        {
          id: "python",
          label: "Python/pandas",
          detail: "Cleaning and transforms",
          kind: "system",
        },
        {
          id: "records",
          label: "Unified records",
          detail: "Unified schema and IDs",
          kind: "data",
        },
        {
          id: "audit",
          label: "Run artifacts",
          detail: "Timestamped validation outputs",
          kind: "validation",
        },
        {
          id: "dashboard",
          label: "Tableau Prep",
          detail: "Dashboard-ready inventory",
          kind: "client",
        },
      ],
      edges: [
        { from: "workday", to: "python", label: "report rows" },
        { from: "tableau", to: "python", label: "metadata" },
        { from: "python", to: "records", label: "normalized records" },
        { from: "records", to: "audit", label: "validation exports" },
        { from: "records", to: "dashboard", label: "trusted dataset" },
      ],
    },
    decisions: [
      {
        decision: "Use deterministic inventory IDs",
        reason:
          "Cross-system reconciliation needed stable keys instead of display names or inconsistent source IDs.",
        tradeoff:
          "ID logic adds up-front modeling work but makes downstream joins and audits more reliable.",
        status: "accepted",
      },
      {
        decision: "Preserve timestamped run artifacts",
        reason:
          "Operational data changes over time and stakeholders need to inspect what a run produced.",
        tradeoff:
          "Artifact storage adds cleanup overhead but improves debugging and trust.",
        status: "accepted",
      },
      {
        decision: "Keep the proof private but specific",
        reason:
          "The work is organizational and cannot expose raw institutional records.",
        tradeoff:
          "Recruiters cannot inspect source data, so this file names the systems, constraints, and validation shape instead.",
        status: "accepted",
      },
    ],
    receipts: [
      {
        claim:
          "3,731 Tableau rows and 6,743 Workday rows consolidated into a 10,453-row deduplicated master_inventory.csv.",
        method: "local processed-output audit, counts only",
        artifacts: [
          {
            label: "checked-in proof ledger — below",
            href: "#ledger",
          },
        ],
        date: "2026-06",
        visibility: "private-safe",
      },
      {
        claim:
          "The 35-field unified schema generates deterministic inventory_id values from row fields.",
        method: "source docs and configs, read in the private repo",
        artifacts: [
          {
            label: "checked-in proof ledger — below",
            href: "#ledger",
          },
        ],
        date: "2026-06",
        visibility: "private-safe",
      },
      {
        claim:
          "Runs write timestamped folders plus cumulative processed outputs, while raw institutional exports stay out of version control.",
        method: "repo layout audit — audited by count only",
        artifacts: [],
        date: "2026-06",
        visibility: "private-safe",
      },
      {
        claim:
          "The source repo passed 3 extractor tests and critical ruff syntax/import checks in its local virtualenv during this audit.",
        method: "local pytest + ruff run",
        artifacts: [
          {
            label: "checked-in proof ledger — below",
            href: "#ledger",
          },
        ],
        date: "2026-06",
        visibility: "private-safe",
      },
      {
        claim:
          "1M+ operational records ran through the Python/SQL transforms behind OAS and Tableau reporting in this same role.",
        method:
          "role scope, jun 2025 – may 2026 — institutional ITSM data integration",
        artifacts: [],
        date: null,
        visibility: "local-only",
      },
    ],
    outcomes: [
      {
        claim:
          "The unified schema feeds Tableau Prep and dashboard workflows without exposing institutional records.",
        method: "the pipeline's published boundary, described",
        artifacts: [],
        date: null,
        visibility: "private-safe",
      },
    ],
    notClaiming: [
      "This file shows counts, schema shape, and architecture only; raw CSV rows, owners, report names, PAT values, and institutional exports stay private.",
      "The 1M+ record transforms are role-scope work with no public artifact — verifiable in interview, not on this page.",
    ],
    corrections: [],
    ledger: {
      title: "master inventory — processed-output ledger",
      jsonPath: "/proof/master-inventory-ledger.json",
      checkedIn: "2026-06",
      rows: [
        {
          label: "tableau output",
          value: "3,731",
          note: "processed metadata rows",
        },
        {
          label: "workday output",
          value: "6,743",
          note: "processed custom-report rows",
        },
        {
          label: "master csv",
          value: "10,453",
          note: "deduped master rows",
        },
        { label: "schema", value: "35", note: "source fields defined" },
        { label: "local tests", value: "3 passed", note: "pytest, extractors" },
        {
          label: "ruff check",
          value: "passed",
          note: "E9, F63, F7, F82 critical rules",
        },
      ],
      boundary:
        "sanitized local audit summary — no raw institutional rows, owners, report names, or PAT values",
    },
    artifacts: [
      {
        type: "diagram",
        label: "Private-safe pipeline architecture",
        href: withBasePath("/images/projects/pipeline-architecture.svg"),
        source: "drawn from the pipeline's real structure",
        boundary: "no institutional records or internal UI",
        date: "2026-06",
      },
      {
        type: "benchmark",
        label: "Processed output proof ledger",
        href: withBasePath("/images/projects/master-inventory-proof.svg"),
        source: "sanitized local audit, checked in 2026-06",
        boundary: "counts and schema only",
        date: "2026-06",
      },
    ],
  },
  {
    projectId: "policybot",
    treatment: "evidence-ledger",
    fileNo: 7,
    role: "RAG systems engineer",
    timeframe: "2025-06 to 2026-05",
    filed: "2025-06",
    verified: "2026-07",
    status: "concluded",
    statusDetail: "role ended 2026-05",
    repoPin: null,
    privateRepoName: "institutional — Miami University IT",
    summary:
      "Private proof from institutional policy-support work: a Python RAG assistant that takes questions from the CLI and Slack, routes them through OpenAI File Search, and validates quoted passages before an answer ships.",
    evidenceDisclosure: {
      label: "Private-safe evidence",
      detail:
        "This case file uses a private-safe architecture diagram plus sanitized source-truth summaries. Real institutional policy content, raw validation transcripts, Slack messages, and private records are not shown.",
    },
    problem:
      "Policy lived in three places — documents, pages, and people's heads. An answer meant knowing which of the three to ask, and the answers didn't always agree.",
    constraints: [
      "Keep institutional policy content governed and source-cited.",
      "Support DOCX, PDF, and Markdown policy sources.",
      "Validate quoted passages before presenting answers.",
      "Meet users where they already work: Slack.",
    ],
    architecture: {
      summary:
        "Policy documents are indexed for retrieval, validated locally for quote grounding, and delivered through Slack Socket Mode with cited responses.",
      nodes: [
        {
          id: "docs",
          label: "Policy docs",
          detail: "DOCX, PDF, Markdown",
          kind: "data",
        },
        {
          id: "filesearch",
          label: "File Search",
          detail: "OpenAI retrieval",
          kind: "ml",
        },
        {
          id: "validator",
          label: "Quote validation",
          detail: "Local citation checks",
          kind: "validation",
        },
        {
          id: "slack",
          label: "Slack Socket Mode",
          detail: "Team workflow surface",
          kind: "client",
        },
        {
          id: "response",
          label: "Cited answer",
          detail: "Grounded policy guidance",
          kind: "api",
        },
      ],
      edges: [
        { from: "docs", to: "filesearch", label: "indexed sources" },
        { from: "filesearch", to: "validator", label: "candidate quotes" },
        { from: "validator", to: "response", label: "grounded evidence" },
        { from: "slack", to: "response", label: "user question" },
        { from: "response", to: "slack", label: "cited reply" },
      ],
    },
    decisions: [
      {
        decision: "Use retrieval with explicit citations",
        reason:
          "Policy support is only useful when users can see where guidance came from.",
        tradeoff:
          "Citations make answers more trustworthy but require stricter source handling.",
        status: "accepted",
      },
      {
        decision: "Add local quote validation",
        reason: "Generated text should not invent or misquote policy language.",
        tradeoff:
          "Validation adds latency and implementation work, but reduces hallucination risk.",
        status: "accepted",
      },
      {
        decision: "Use Slack as the delivery layer",
        reason:
          "The target workflow already happens in team communication channels.",
        tradeoff:
          "Slack integration adds event handling complexity but lowers adoption friction.",
        status: "accepted",
      },
    ],
    protocol: {
      documented: false,
      lines: [],
    },
    receipts: [
      {
        claim:
          "My committed validation summary reports a 19/20 latest structured sweep, a 17/25 keyword sweep, 4 honest fallbacks, and locally rejected answers when quotes could not be verified.",
        method: "committed sweep summary — grading protocol not yet documented",
        artifacts: [
          {
            label: "checked-in validation ledger — below",
            href: "#ledger",
          },
        ],
        date: "2026-06",
        visibility: "private-safe",
      },
      {
        claim:
          "Answers run through the OpenAI Responses API with File Search, cited filenames, and local quote verification against policy files when available.",
        method: "source and docs audit of the guardrail path",
        artifacts: [
          {
            label: "checked-in validation ledger — below",
            href: "#ledger",
          },
        ],
        date: "2026-06",
        visibility: "private-safe",
      },
      {
        claim:
          "The repo ships CLI entry points and a Slack Socket Mode bridge; no production usage, workspace adoption, or always-on service claim is made here.",
        method: "source audit — the boundary is part of the claim",
        artifacts: [],
        date: "2026-06",
        visibility: "private-safe",
      },
      {
        claim:
          "The source repo passed 3 Slack adapter/formatting tests in a temporary audit virtualenv without calling OpenAI or Slack.",
        method: "local pytest run, network-free",
        artifacts: [
          {
            label: "checked-in validation ledger — below",
            href: "#ledger",
          },
        ],
        date: "2026-06",
        visibility: "private-safe",
      },
    ],
    outcomes: [
      {
        claim:
          "The assistant is designed to cut policy lookup friction while preserving citations and fallback behavior.",
        method: "design intent, described — no usage metric is claimed",
        artifacts: [],
        date: null,
        visibility: "private-safe",
      },
      {
        claim:
          "Responses are framed around cited sources instead of uncited generated advice.",
        method: "guardrail path audit",
        artifacts: [
          {
            label: "checked-in validation ledger — below",
            href: "#ledger",
          },
        ],
        date: "2026-06",
        visibility: "private-safe",
      },
    ],
    notClaiming: [
      "The sweeps are self-graded counts from my committed validation summary; the grader and per-case pass criteria are not yet documented publicly, so treat 19/20 and 17/25 as disclosed self-reports.",
      "This file claims design and validation shape only — never adoption or uptime. Raw policy text and Slack messages are excluded everywhere.",
    ],
    corrections: [
      {
        date: "2026-07",
        kind: "note",
        text: "The 19/20 structured and 17/25 keyword sweeps are recorded in a committed validation summary, but who graded each case and the exact pass criteria are not yet publicly documented. Until they are, this file labels both numbers as self-reported.",
      },
    ],
    ledger: {
      title: "policybot — validation ledger",
      jsonPath: "/proof/policybot-validation-ledger.json",
      checkedIn: "2026-06",
      rows: [
        {
          label: "structured sweep",
          value: "19/20",
          note: "latest quoted-answer pass",
        },
        {
          label: "keyword sweep",
          value: "17/25",
          note: "validated loose prompts",
        },
        {
          label: "safe fallbacks",
          value: "4",
          note: "unsupported topics declined",
        },
        {
          label: "local tests",
          value: "3 passed",
          note: "Slack adapter/formatting, network-free",
        },
        {
          label: "guardrail path",
          value: "File Search → citation extraction → local quote verifier",
          note: "unverified answers fall back",
        },
      ],
      boundary:
        "sanitized RAG validation summary — no policy text, Slack messages, or raw validation transcripts",
    },
    artifacts: [
      {
        type: "diagram",
        label: "Retrieval and validation architecture",
        href: withBasePath("/images/projects/policybot-architecture.svg"),
        source: "drawn from the assistant's real structure",
        boundary: "no institutional policy text or Slack messages",
        date: "2026-06",
      },
      {
        type: "benchmark",
        label: "Validation ledger proof",
        href: withBasePath("/images/projects/policybot-validation-proof.svg"),
        source: "sanitized validation summary, checked in 2026-06",
        boundary: "counts, tests, and guardrails only",
        date: "2026-06",
      },
    ],
  },
  {
    projectId: "fast-mnist-nn",
    treatment: "evidence-ledger",
    fileNo: 2,
    role: "C++ performance engineer",
    timeframe: "2025-10 to 2026-01",
    filed: "2025-10",
    verified: "2026-07",
    status: "shipped",
    /* Both clauses are artifacts on this page: the tagged release and
       the committed benchmark run. */
    statusDetail: "v1.0.0 tagged, benchmarks committed",
    repoPin: {
      repo: "yadava5/fast-mnist-nn",
      sha: FAST_MNIST_SHA,
      href: `https://github.com/yadava5/fast-mnist-nn/tree/${FAST_MNIST_SHA}`,
    },
    summary:
      "A neural network for MNIST with nothing under it but C++. SIMD matrix kernels, OpenMP parallelism, a committed benchmark suite, and a React workbench where you draw a digit and watch the network read it.",
    problem:
      "MNIST is small enough to hold in your head. That's the point — at this size, low-level matrix optimization and benchmark discipline have nowhere to hide.",
    constraints: [
      "Keep the implementation in C++ with explicit SIMD and OpenMP paths.",
      "Measure speedup without overstating unverified exact benchmark details.",
      "Expose the model through an interactive React and TypeScript frontend.",
      "Keep benchmark and accuracy claims traceable to source data.",
    ],
    architecture: {
      summary:
        "Input preprocessing feeds C++ matrix kernels and OpenMP parallel paths, then the React demo displays inference behavior and benchmark proof.",
      nodes: [
        {
          id: "input",
          label: "MNIST input",
          detail: "Digit preprocessing",
          kind: "data",
        },
        {
          id: "kernels",
          label: "SIMD kernels",
          detail: "AVX2, AVX-512, NEON",
          kind: "system",
        },
        {
          id: "parallel",
          label: "OpenMP",
          detail: "Parallel hot paths",
          kind: "system",
        },
        {
          id: "model",
          label: "Neural network",
          detail: "C++ inference",
          kind: "ml",
        },
        {
          id: "demo",
          label: "React demo",
          detail: "Interactive visualization",
          kind: "client",
        },
        {
          id: "bench",
          label: "Benchmarks",
          detail: "Performance suite",
          kind: "validation",
        },
      ],
      edges: [
        { from: "input", to: "model", label: "normalized digits" },
        { from: "kernels", to: "model", label: "matrix ops" },
        { from: "parallel", to: "model", label: "threaded paths" },
        { from: "model", to: "demo", label: "prediction output" },
        { from: "bench", to: "model", label: "performance proof" },
      ],
    },
    decisions: [
      {
        decision: "Use hand-tuned SIMD paths",
        reason:
          "The point is performance engineering you can read — kernels on the page, not framework calls.",
        tradeoff:
          "Hardware-specific paths need careful fallbacks and benchmarking.",
        status: "accepted",
      },
      {
        decision: "Expose a React demo",
        reason:
          "Recruiters can inspect the behavior without reading only C++ code.",
        tradeoff: "The frontend is secondary to the C++ benchmark proof.",
        status: "accepted",
      },
    ],
    protocol: {
      documented: true,
      lines: [
        {
          label: "bench",
          value:
            "benchmarks/bench_matrix.cpp, orchestrated by tools/run_benchmarks.py",
        },
        {
          label: "env",
          value: "Apple clang 17.0.0 — recorded in BENCHMARKS.md",
        },
        {
          label: "metric",
          value:
            "openmp+simd dot kernel vs the -O3 baseline → 3.50x at dot 256",
        },
        {
          label: "run",
          value:
            "2025-12-26 — committed as bench-20251226-154121-native.json + bench_summary.csv",
        },
        {
          label: "repro",
          value: "python3 tools/run_benchmarks.py --openmp --native",
        },
      ],
    },
    receipts: [
      {
        claim:
          "The network reaches ~97% test accuracy on MNIST after ~30 epochs — documented in the repo, not measured on this page.",
        method: "README training notes, checked against the source",
        artifacts: [
          {
            label: `fast-mnist-nn @ ${FAST_MNIST_SHA} · README.md`,
            href: `${FAST_MNIST_BLOB}/README.md`,
          },
        ],
        date: "2026-07",
        visibility: "public",
        /* W2 HELD stamp (friend transposition #1): the ~97% terminates
           in README prose, not a committed eval artifact (EVIDENCE-MODEL
           content-debt). The number stays on file, stamped, until an
           eval run is checked in — the corrections note below is the
           register entry the footnote points to. */
        held: { note: "held until a committed eval run earns it" },
      },
      {
        /* Attribution per BENCHMARKS.md itself: the 3.5x (dot 256) is the
           openmp+native parallel configuration, not SIMD alone. */
        claim:
          "The openmp+simd dot kernel is 3.50x faster than the -O3 baseline (dot 256) — committed benchmark data, not a live run; the repo's own analysis notes -march=native alone barely moves the needle.",
        method:
          "committed 2025-12-26 benchmark run — protocol in the method slip",
        artifacts: [
          {
            label: `fast-mnist-nn @ ${FAST_MNIST_SHA} · BENCHMARKS.md`,
            href: `${FAST_MNIST_BLOB}/BENCHMARKS.md`,
          },
          {
            label: "bench_summary.csv",
            href: `${FAST_MNIST_BLOB}/docs/benchmarks/bench_summary.csv`,
          },
        ],
        date: "2025-12-26",
        visibility: "public",
      },
      {
        claim:
          "A benchmark suite is committed — matrix kernels measured across the repo's three configurations (baseline, native, openmp+native), with dated run files in the repo.",
        method: "benchmark source + committed run JSON",
        artifacts: [
          {
            label: `fast-mnist-nn @ ${FAST_MNIST_SHA} · benchmarks/bench_matrix.cpp`,
            href: `${FAST_MNIST_BLOB}/benchmarks/bench_matrix.cpp`,
          },
          {
            label: "bench-20251226-154121-native.json",
            href: `${FAST_MNIST_BLOB}/docs/benchmarks/runs/bench-20251226-154121-native.json`,
          },
        ],
        date: "2025-12-26",
        visibility: "public",
      },
    ],
    outcomes: [
      {
        claim:
          "SIMD acceleration is implemented across AVX2, AVX-512, and NEON paths; the verified 3.5x belongs to the openmp+simd dot kernel vs the -O3 baseline, not to SIMD alone.",
        method: "source paths + the committed benchmark rows",
        artifacts: [
          {
            label: `fast-mnist-nn @ ${FAST_MNIST_SHA} · BENCHMARKS.md`,
            href: `${FAST_MNIST_BLOB}/BENCHMARKS.md`,
          },
        ],
        date: "2025-12-26",
        visibility: "public",
      },
      {
        claim:
          "The interactive React workbench is deployed — draw a digit and watch the network read it.",
        method: "the live demo itself",
        artifacts: [
          {
            label: "fast-mnist.vercel.app ↗",
            href: "https://fast-mnist.vercel.app",
          },
        ],
        date: "2026-07",
        visibility: "public",
      },
    ],
    notClaiming: [
      "No AVX-512 inference-speedup claim survives here — see the corrections register below. The verified number is the openmp+simd dot kernel's 3.50x over the baseline build, and parallelism carries it.",
      "The workbench screenshot was captured with the native inference server offline, so benchmark claims come from committed benchmark data, not the live page.",
    ],
    corrections: [
      {
        date: "2026-05-28",
        kind: "erratum",
        text: "Retracted the earlier AVX-512 inference-speedup claim: the committed classify-throughput rows do not support it. The number this file stands behind is the 3.50x dot-kernel speedup, and the receipt above links the committed data.",
      },
      {
        date: "2026-07",
        kind: "note",
        text: "Attribution tightened, number unchanged: the committed 3.50x (dot 256) belongs to the openmp+simd configuration measured against the -O3 baseline. BENCHMARKS.md's own analysis records that -march=native alone barely moves the needle; earlier site copy credited the speedup to SIMD alone.",
      },
      {
        date: "2026-07",
        kind: "note",
        text: "The ~97% accuracy receipt now carries the HELD stamp: the number is documented in the repo's README training notes, but no committed eval artifact reproduces it yet. The claim is unchanged and stays on file; the stamp lifts when an eval run is checked in.",
      },
    ],
    artifacts: [
      {
        type: "real-screenshot",
        label: "Local React workbench screenshot",
        href: withBasePath("/images/projects/mnist.webp"),
        source: "local web workbench capture",
        boundary: "native inference server offline during capture",
        date: "2026-06",
      },
      {
        type: "diagram",
        label: "Vector project asset",
        href: withBasePath("/images/projects/fast-mnist-nn.svg"),
        source: "portfolio vector asset",
        boundary: "illustration — carries no claims",
        date: "2026-06",
      },
      {
        type: "repo",
        label: "Source code",
        href: `https://github.com/yadava5/fast-mnist-nn/tree/${FAST_MNIST_SHA}`,
        source: `yadava5/fast-mnist-nn @ ${FAST_MNIST_SHA}`,
        boundary: "public repository",
        date: "2026-07",
      },
      {
        type: "repo",
        label: "v1.0.0 release",
        href: "https://github.com/yadava5/fast-mnist-nn/releases/tag/v1.0.0",
        source: "yadava5/fast-mnist-nn releases",
        boundary: "public release",
        date: "2026-07",
      },
      {
        type: "benchmark",
        label: "Benchmark evidence",
        href: `${FAST_MNIST_BLOB}/BENCHMARKS.md`,
        source: `yadava5/fast-mnist-nn @ ${FAST_MNIST_SHA}`,
        boundary: "committed 2025-12-26 run data",
        date: "2025-12-26",
      },
    ],
  },
];

export const caseStudyIds = projectCaseStudies.map((study) => study.projectId);

/** Dossier order — "case file NN / 07" and next-file continuity */
const dossierOrder = [...projectCaseStudies].sort(
  (a, b) => a.fileNo - b.fileNo
);

export const DOSSIER_TOTAL = dossierOrder.length;

export function getCaseStudyById(id: string): ProjectCaseStudy | undefined {
  return projectCaseStudies.find((study) => study.projectId === id);
}

export function getCaseStudyProject(
  study: ProjectCaseStudy
): Project | undefined {
  return projects.find((project) => project.id === study.projectId);
}

/** The next case file in dossier order (wraps at the end) */
export function getNextCaseStudy(study: ProjectCaseStudy): ProjectCaseStudy {
  const index = dossierOrder.findIndex(
    (candidate) => candidate.projectId === study.projectId
  );
  return dossierOrder[(index + 1) % dossierOrder.length];
}

/** The four honest dispositions a walked row can have */
export type ReceiptAuditState = "artifact" | "capture" | "described" | "held";

/**
 * What "run the audit" can honestly do with a row (friend transposition
 * #3, capture split W5): "artifact" — the row terminates in a pinned or
 * checked-in artifact (repo blob @ sha, committed JSON, CI run) and
 * earns the tick; "capture" — every terminal is an on-page poster/deck
 * capture (`capture: true` on the link), marked with the hollow ring —
 * a photo of evidence is not a pinned artifact; "held" — the row is
 * stamped HELD, so the audit withholds the tick even where links exist
 * (the number itself is not yet earned); "described" — no linkable
 * artifact at all. Held and described rows get the honest ink dash.
 *
 * @param row - The receipt row
 * @returns The audit state driving the row's walk mark
 */
export function receiptAuditState(row: CaseReceipt): ReceiptAuditState {
  if (row.held) return "held";
  if (row.artifacts.length === 0) return "described";
  return row.artifacts.some((artifact) => !artifact.capture)
    ? "artifact"
    : "capture";
}

/** Per-state row tally for one case file's walk — the settled line's
 *  arithmetic, derived from the REAL rows so the counts can never drift
 *  from the DOM marks (the evidence judge recounts both). */
export interface ReceiptAuditCounts {
  total: number;
  artifact: number;
  capture: number;
  described: number;
  held: number;
}

/**
 * Tally every walked row of a case file by its audit state.
 *
 * @param study - The case file
 * @returns Counts over receipts + outcomes (the walk's full coverage)
 */
export function receiptAuditCounts(
  study: ProjectCaseStudy
): ReceiptAuditCounts {
  const counts: ReceiptAuditCounts = {
    total: 0,
    artifact: 0,
    capture: 0,
    described: 0,
    held: 0,
  };
  for (const row of [...study.receipts, ...study.outcomes]) {
    counts.total += 1;
    counts[receiptAuditState(row)] += 1;
  }
  return counts;
}

/**
 * The settled ledger line's sentence, minus the date — one composer so
 * the control, the live announcement, and the tests can never disagree.
 * Zero-count segments are omitted; the leading pinned-artifact clause
 * always renders (an honest "0 of 8" is the point on capture-only
 * files).
 *
 * @param counts - Per-state tallies from receiptAuditCounts
 * @returns e.g. "audit walked · 4 of 8 terminate in pinned artifacts ·
 *   2 in page captures · 2 described only"
 */
export function auditSettledSentence(counts: ReceiptAuditCounts): string {
  const parts = [
    "audit walked",
    `${counts.artifact} of ${counts.total} terminate in pinned artifacts`,
  ];
  if (counts.capture > 0) parts.push(`${counts.capture} in page captures`);
  if (counts.described > 0) parts.push(`${counts.described} described only`);
  if (counts.held > 0) parts.push(`${counts.held} held`);
  return parts.join(" · ");
}

/** Anchor id for receipt row `n` (1-based across receipts then outcomes) */
export function receiptAnchor(projectId: string, n: number): string {
  return `v-${projectId}-${n}`;
}
