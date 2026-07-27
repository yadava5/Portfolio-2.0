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
 *     2026-07-18 (the kicker's "last verified" date) — except Applied,
 *     re-pinned 3225eb4 → 36a2f54 on 2026-07-26 when it shipped as a web
 *     app and the old pin froze the file in the desktop era. Private
 *     repos carry no sha and no link — only their verified name.
 *   - Dates are real and recorded: committed-artifact dates come from the
 *     artifacts themselves (e.g. baseline_hybrid_v3.json `generated_at`
 *     2026-03-03; bench-20251226-154121 run files); audit dates come from
 *     this repo's own public history (proof ledgers checked in 2026-06-05,
 *     jobtracker suite audit 2026-06 then re-run 2026-07-26 at the new
 *     pin, VisualAssist test-count audit 2026-05, AVX-512 retraction
 *     2026-05-28). Where no date was recorded, the row says so instead of
 *     inventing one.
 *
 * Typographic law (fix round 3, S2) — this file is PROSE, and it is set,
 * not typed:
 *   - Apostrophes are `’` (U+2019), never the ASCII tick. Straight marks
 *     were swept out by docs/design-lab/curl-quotes.mjs, which walks
 *     string literals only and never touches comments.
 *   - Quoted phrases take `“ ”` (U+201C/201D).
 *   - The exceptions are CODE, and they are exceptions on purpose: the
 *     Postgres call quoted verbatim in a Cadence receipt keeps its syntax
 *     apostrophes (`set_config('app.user_id', $1, true)`), and the Gmail
 *     client line keeps its argument straight (`format="metadata"`). A
 *     curly quote inside a literal a reader might paste is a bug, not a
 *     refinement — the sweep script protects both by exact substring.
 *   - Product names take their brand casing in prose (Applied, Cadence,
 *     Glyph, jobtracker — see `projects.ts` for the register). The
 *     lowercase mono APPARATUS voice (kickers, ledger terms, chips) is a
 *     separate register and stays lowercase; that is the label voice, not
 *     a spelling of the name.
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
  /**
   * What the artifact is called — a filename, a pinned path, a host.
   * NO GLYPH (N20, fix round 7). `↗` is the site's mark for "this
   * leaves the site" and EvidenceTable renders it for every artifact
   * whose href is external, so a label that carries one prints it
   * twice — and a label that omits one used to print none at all.
   * Five labels in this file did carry it by hand, which is precisely
   * how the receipts column ended up marking 13 of its 59 external
   * links and leaving 46 bare. A mark is furniture; furniture belongs
   * to the component, and this file holds facts.
   */
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

/* Repo pins — HEAD shas verified via `gh api` on 2026-07-18.

   APPLIED (re-pin, 2026-07-26). The old pin `3225eb4` froze this file in
   the era when the native macOS app was the product and `apps/web` was a
   login shell. It is not that any more: Applied ships as a hosted Next.js
   app at getapplied.vercel.app. Every receipt below is re-pinned to
   `36a2f54`, the PUBLIC head of `integration/web-migration` — the branch
   that carries the web app — read back with `gh api` on 2026-07-26; each
   linked path was fetched at that sha and returned 200.

   The repository was also renamed `yadava5/jobtracker` → `yadava5/applied`
   (GitHub still redirects the old paths; these pins name the current one).
   The case file's own id stays `jobtracker` because the route
   /projects/jobtracker/ is public and links to it are already in the
   world — renaming the id would break them to no one's benefit. */
const APPLIED_SHA = "36a2f54";
const APPLIED_BLOB = `https://github.com/yadava5/applied/blob/${APPLIED_SHA}`;
const APPLIED_TREE = `https://github.com/yadava5/applied/tree/${APPLIED_SHA}`;
const VISUAL_ASSIST_SHA = "22ebdaa";
const VISUAL_ASSIST_BLOB = `https://github.com/yadava5/VisualAssist/blob/${VISUAL_ASSIST_SHA}`;
const VISUAL_ASSIST_TREE = `https://github.com/yadava5/VisualAssist/tree/${VISUAL_ASSIST_SHA}`;
const TASKFLOW_SHA = "69a59e7";
const TASKFLOW_TREE = `https://github.com/yadava5/taskflow-calendar/tree/${TASKFLOW_SHA}`;
/* CADENCE — the second pin on the same file, and the reason for it.

   The repository was renamed `yadava5/taskflow-calendar` → `yadava5/cadence`
   (GitHub redirects the old paths; both resolve). The security work — the
   IDOR fixes, the RLS migrations, the isolation suite, the middleware fix —
   landed AFTER `69a59e7`, so it is not at that commit and cannot be pinned
   there. `54c79e0` is the repo's PUBLIC head, read back with
   `gh api repos/yadava5/cadence/commits/HEAD` on 2026-07-26 (committed
   2026-07-24); local, `origin/main`, and the public head all agree. Every
   path linked below was fetched at this sha and returned 200.

   The suite receipts (01–03) deliberately STAY at `69a59e7`: 1,145 is the
   count measured at that commit, and re-pinning it to a commit nobody
   re-ran it at would turn a measurement into a guess. Two pins, each
   naming the commit its own number was taken from. The corrections
   register carries the note. */
const CADENCE_SHA = "54c79e0";
const CADENCE_BLOB = `https://github.com/yadava5/cadence/blob/${CADENCE_SHA}`;
const FAST_MNIST_SHA = "c6e5c0b";
const FAST_MNIST_BLOB = `https://github.com/yadava5/fast-mnist-nn/blob/${FAST_MNIST_SHA}`;

/** Backend CI run that executes the blocking v3 classifier gates (public).
 *  Re-read 2026-07-26 via `gh api .../actions/runs/24665061332/jobs`: the
 *  run is Backend CI on 6a7c230 (2026-04-20) and its step list carries
 *  BOTH gates — "Run classifier non-regression gate (rules v3)" and
 *  "Run hybrid benchmark gate (v3 deterministic)" — each `success`. It is
 *  an older commit than the pin above, so the row's label says its date
 *  out loud rather than letting the link imply it ran at `36a2f54`. */
const APPLIED_CI_RUN =
  "https://github.com/yadava5/applied/actions/runs/24665061332";

export const projectCaseStudies: ProjectCaseStudy[] = [
  {
    projectId: "jobtracker",
    treatment: "native-intelligence",
    fileNo: 4,
    role: "Designer and sole engineer — desktop app, web app, and classifier",
    timeframe: "2026-02 to Present",
    filed: "2026-02",
    verified: "2026-07",
    status: "shipped",
    /* Both clauses trace to receipts: 07 (the dashboard renders real
       applications from the API) + 09 (the hosted slot runs layer 1
       only, by design, and the boundary rows say so). */
    statusDetail: "web app live; the hosted classifier runs layer 1 only",
    repoPin: {
      repo: "yadava5/applied",
      sha: APPLIED_SHA,
      branch: "integration/web-migration",
      href: APPLIED_TREE,
    },
    summary:
      "A job tracker that reads the search out of the inbox. Connect Gmail and Applied fetches your mail, names each message, and turns the noise into a pipeline of real applications you can act on. It shipped twice: first as a native macOS app, now as a hosted web app — and the two share one backend package.",
    evidenceDisclosure: {
      label: "Private-safe proof: no email content",
      detail:
        "Applied reads a real inbox, so this case file shows none of it. Every receipt below terminates in source, a migration, a committed eval artifact, or a test run — never in a screenshot of mail. The repository’s own README and docs/WEB_ARCHITECTURE.md still describe apps/web as an unwired scaffold and are deliberately NOT cited here: they are behind the code, and a stale doc is not evidence.",
    },
    problem:
      "The status of a job search scatters across Gmail, employer systems, and one-off messages. A spreadsheet can’t keep up: updates get missed, rows get retyped, and the record drifts from the truth. The first answer was a desktop app, which meant the record only existed on one machine.",
    constraints: [
      "Ask for the least Gmail access that can work — read-only, and metadata rather than message bodies.",
      "Classify noisy inbox messages into useful application states.",
      "Make row isolation the database’s job, not the query writer’s.",
      "Fit the whole classifier into a serverless slot, or be honest about which layers didn’t fit.",
      "Never let a routine sync delete an application the current scan happened to miss.",
    ],
    architecture: {
      summary:
        "Gmail hands over metadata, the classifier names it, Postgres files it under an identity the database itself checks, and a Next.js dashboard reads it back. One backend package serves this and the desktop app; the desktop branch is where the two heavier classifier layers still live.",
      /* The true topology is a straight pipeline, so fig. 2 draws one:
         inbox ⟶ fetch ⟶ classify ⟶ store ⟶ dashboard, with the desktop
         app as the single off-spine branch. */
      variant: "linear",
      flow: [["gmail"], ["fetch"], ["classifier"], ["store"], ["ui"]],
      /* Traces to receipt 08: the GUC is left unset when no identity is
         bound, so auth.uid() is NULL and the policies deny. */
      annotation:
        "no identity bound, no rows — the guc is unset and rls denies",
      nodes: [
        {
          id: "gmail",
          label: "Gmail",
          detail: "gmail.readonly — nothing wider",
          kind: "api",
        },
        {
          id: "fetch",
          label: "Metadata fetch",
          detail: "Subject, From, Date, snippet — no bodies",
          kind: "system",
        },
        {
          id: "classifier",
          label: "Classifier",
          detail: "Rules on the hosted path; e5 + SetFit on the desktop one",
          kind: "ml",
        },
        {
          id: "store",
          label: "Postgres",
          detail: "RLS on, FORCE’d, per-transaction JWT claims",
          kind: "data",
          /* Receipt 08: a query with no bound identity reads nothing —
             this node genuinely stops the run (fig. 2's clay). */
          gate: true,
        },
        {
          id: "ui",
          label: "Next.js",
          detail: "Pipeline board, review queue, stat tiles",
          kind: "client",
        },
        {
          id: "macos",
          label: "SwiftUI",
          detail: "The desktop app, still in the repo",
          kind: "system",
        },
      ],
      edges: [
        { from: "gmail", to: "fetch", label: "read-only" },
        { from: "fetch", to: "classifier", label: "subject + snippet" },
        { from: "classifier", to: "store", label: "verdicts, scoped by user" },
        { from: "store", to: "ui", label: "pipeline state" },
        { from: "classifier", to: "macos", label: "layers 2–3 — desktop only" },
      ],
    },
    decisions: [
      {
        decision: "Fetch Gmail metadata, never message bodies",
        reason:
          "The subject line, the sender, and Gmail’s own snippet are enough to name an application email.",
        tradeoff:
          "A body-blind classifier gives up signal on ambiguous mail, and buys a privacy boundary that holds without being trusted.",
        status: "accepted",
      },
      {
        decision: "Run the hosted classifier on the rules layer alone",
        reason:
          "torch, sentence-transformers, and SetFit do not fit a serverless function slot — not the size limit, and not the cold start.",
        tradeoff:
          "The hosted verdict is weaker than the desktop one. The alternative was pretending otherwise, so the limit is written into the code, the tests, and the boundary rows below.",
        status: "accepted",
      },
      {
        decision: "Enforce row isolation in Postgres, not in the handlers",
        reason:
          "Application-level `WHERE user_id = …` is one forgotten clause away from a leak.",
        tradeoff:
          "Every transaction pays a `set_config` round trip, and the app must run as a role that cannot bypass its own policies.",
        status: "accepted",
      },
      {
        decision:
          "Make routine sync additive; keep destruction behind a button",
        reason:
          "A bounded scan of a large inbox will miss applications it already found, and re-syncing wiped them.",
        tradeoff:
          "Stale rows survive until an explicit rebuild, which is the cheaper failure.",
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
            "predicted vs expected label ⟶ macro-F1; the ci gate fails below the configured floor",
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
    /* Receipt ORDER is load-bearing (WAVE3 §crosswalk): rows 04 and 05
       keep the anchors #v-jobtracker-4 (backend suite) and
       #v-jobtracker-5 (macro-F1) that the home paper's ¶05 metric chip,
       the ¶06 litany, proofManifest, and dossier.spec all point at. New
       rows were appended, never inserted above them. */
    receipts: [
      {
        claim:
          "Connecting Gmail asks for gmail.readonly and nothing wider — and the consent step deliberately does not merge previously granted scopes.",
        method:
          "read the OAuth router and the settings field it draws its scope list from, at the pinned commit",
        artifacts: [
          {
            label: `applied @ ${APPLIED_SHA} · cloud/gmail_oauth.py`,
            href: `${APPLIED_BLOB}/backend/jobtracker/cloud/gmail_oauth.py`,
          },
          {
            label: `applied @ ${APPLIED_SHA} · tests/test_gmail_oauth_cloud.py`,
            href: `${APPLIED_BLOB}/backend/tests/test_gmail_oauth_cloud.py`,
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
      {
        claim:
          "The classifier is three layers — rules, e5 embeddings, SetFit — and SetFit stays off until its training gates are met.",
        method: "ML strategy doc, read against the backend source",
        artifacts: [
          {
            label: `applied @ ${APPLIED_SHA} · docs/ML_STRATEGY.md`,
            href: `${APPLIED_BLOB}/docs/ML_STRATEGY.md`,
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
      {
        claim:
          "The hosted fetch reads metadata only — Subject, From, Date, and Gmail’s own snippet. Full message bodies are never downloaded on the web path.",
        method:
          'read the cloud Gmail client: messages.list plus batched messages.get(format="metadata"), read-only, no mutation',
        artifacts: [
          {
            label: `applied @ ${APPLIED_SHA} · cloud/gmail_client.py`,
            href: `${APPLIED_BLOB}/backend/jobtracker/cloud/gmail_client.py`,
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
      {
        claim:
          "I ran the backend suite locally at the pinned commit: 271 tests passed, 10 skipped, under the test/null-keyring environment.",
        method:
          "local run against the public test tree; the 10 skips are the Postgres RLS module, which needs a live database",
        artifacts: [
          {
            label: `applied @ ${APPLIED_SHA} · backend/tests`,
            href: `${APPLIED_TREE}/backend/tests`,
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
      {
        claim:
          "Rules and deterministic hybrid v3 gates both passed on 96 samples with macro-F1 0.9791.",
        method:
          "committed baseline, deterministic profile — protocol in the method slip",
        artifacts: [
          {
            label: `applied @ ${APPLIED_SHA} · baseline_hybrid_v3.json`,
            href: `${APPLIED_BLOB}/backend/data/evaluation/baseline_hybrid_v3.json`,
          },
          {
            label: "backend-ci run, 2026-04-20",
            href: APPLIED_CI_RUN,
          },
        ],
        date: "2026-03-03",
        visibility: "public",
      },
      {
        claim:
          "The macOS Debug target built locally with xcodebuild against the JobTracker scheme, and the desktop app is still in the repository.",
        method:
          "local build — no build artifact is published; the source tree is public and linked",
        artifacts: [
          {
            label: `applied @ ${APPLIED_SHA} · apps/macos`,
            href: `${APPLIED_TREE}/apps/macos`,
          },
        ],
        date: null,
        visibility: "local-only",
      },
      {
        claim:
          "The dashboard renders real applications: it reads the summary and application endpoints server-side and draws a pipeline board, a stage funnel, and a review queue from what comes back.",
        method:
          "read the page component and the router it calls, at the pinned commit",
        artifacts: [
          {
            label: `applied @ ${APPLIED_SHA} · apps/web/app/(app)/dashboard`,
            href: `${APPLIED_TREE}/apps/web/app/%28app%29/dashboard`,
          },
          {
            label: `applied @ ${APPLIED_SHA} · cloud/applications.py`,
            href: `${APPLIED_BLOB}/backend/jobtracker/cloud/applications.py`,
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
      {
        claim:
          "Row isolation is enforced by Postgres, not by the handlers: the app runs as a role that cannot bypass RLS, every transaction sets request.jwt.claims locally, and user_credentials is FORCE’d so even the table owner is held to the policies.",
        method:
          "read the engine’s begin-listener and the three RLS migrations at the pinned commit",
        artifacts: [
          {
            label: `applied @ ${APPLIED_SHA} · database/connection.py`,
            href: `${APPLIED_BLOB}/backend/jobtracker/database/connection.py`,
          },
          {
            label: `applied @ ${APPLIED_SHA} · c5_force_user_credentials_rls.py`,
            href: `${APPLIED_BLOB}/backend/alembic/versions/c5_force_user_credentials_rls.py`,
          },
          {
            label: `applied @ ${APPLIED_SHA} · tests/test_rls_postgres.py`,
            href: `${APPLIED_BLOB}/backend/tests/test_rls_postgres.py`,
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
      {
        claim:
          "The hosted classifier runs the rules layer alone. On the serverless path it returns after layer 1 even when the rules were unsure — embeddings and SetFit are never imported there.",
        method:
          "read the cloud short-circuit in the hybrid classifier and the import-hygiene test that holds it",
        artifacts: [
          {
            label: `applied @ ${APPLIED_SHA} · classifier/hybrid.py`,
            href: `${APPLIED_BLOB}/backend/jobtracker/classifier/hybrid.py`,
          },
          {
            label: `applied @ ${APPLIED_SHA} · tests/test_main_cloud.py`,
            href: `${APPLIED_BLOB}/backend/tests/test_main_cloud.py`,
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
    ],
    outcomes: [
      {
        claim:
          "Job updates land in a trackable pipeline instead of a spreadsheet — and now in a browser instead of on one Mac.",
        method: "the product’s own workflow, described — not a usage metric",
        artifacts: [
          {
            label: "getapplied.vercel.app",
            href: "https://getapplied.vercel.app",
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
      {
        claim:
          "All three classifier layers do run in a browser — as a public Hugging Face Space, on an int8 ONNX export of the same model. That is a separate deployment from the web app, not the verdict getapplied.vercel.app returns.",
        method:
          "ported the local classifier and exported it quantized; both the space and the export script are inspectable",
        artifacts: [
          {
            label: "huggingface.co/spaces/yadava5/jobtracker-classifier",
            href: "https://huggingface.co/spaces/yadava5/jobtracker-classifier",
          },
          {
            label: `applied @ ${APPLIED_SHA} · ml/browser/export_onnx.py`,
            href: `${APPLIED_BLOB}/ml/browser/export_onnx.py`,
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
    ],
    notClaiming: [
      "I’m not claiming the hosted app runs the full three-layer classifier. On Vercel it runs the rules layer only — deliberately, because the model stack does not fit the function slot. Embeddings and SetFit stay on the desktop path and in the Hugging Face Space.",
      "I’m not claiming CI proves the RLS policies enforce. The Postgres RLS suite skips unless a live database URL is supplied, and no workflow supplies one; what is linked is the migrations, the per-transaction identity wiring, and the tests themselves.",
      "I’m not citing the repository’s README or docs/WEB_ARCHITECTURE.md as evidence for the web app. Both still describe apps/web as an unwired scaffold with a placeholder dashboard — they are behind the code, and this file cites the code.",
      "No production email-volume or user numbers are claimed. Source, migrations, and test runs are shown publicly; private email and application records are not shown.",
    ],
    corrections: [
      {
        date: "2026-07-26",
        kind: "erratum",
        text: "Until today this file described a native macOS app whose “web beta is a scaffold”, and pinned every receipt at 3225eb4. That stopped being true: Applied ships as a hosted web app at getapplied.vercel.app. The caveat is retired because it is false now, not because it was wrong then — and the receipts are re-pinned to 36a2f54, the public head of the branch that carries the web app. The scaffold claim’s own successor is receipt 07.",
      },
      {
        date: "2026-07-26",
        kind: "erratum",
        text: "The backend-suite row read 182 tests, audited at the old pin. Re-run at 36a2f54 on 2026-07-26 it is 271 passed and 10 skipped. Nothing was retracted — the tree grew, and the number moved with it. The 10 skips are named in the row rather than folded into the total.",
      },
      {
        date: "2026-07-26",
        kind: "note",
        text: "The repository was renamed yadava5/jobtracker ⟶ yadava5/applied. GitHub still redirects the old links, so nothing this file ever published is broken; the pins name the current repository instead of relying on a redirect. The case-file route stays /projects/jobtracker/ for the same reason.",
      },
    ],
    /* Provenance strips carry the whole correction here. Three of these
       plates are DESKTOP-era records that are still real files at the new
       pin — the honest edit was to say which era each one speaks for, not
       to unlink them. The README in particular is no longer offered as
       "source-truth": it still calls apps/web a scaffold. */
    artifacts: [
      {
        type: "diagram",
        label: "Local classification architecture",
        href: withBasePath("/images/projects/jobtracker-architecture.svg"),
        source: "rendered from the public repository structure",
        boundary:
          "draws the desktop path — the hosted app is rules-only; no private email content is shown",
        date: "2026-06",
      },
      {
        type: "repo",
        label: "README — the desktop-era record",
        href: `${APPLIED_BLOB}/README.md`,
        source: `yadava5/applied @ ${APPLIED_SHA}`,
        boundary:
          "lags the shipped web app — still calls apps/web a scaffold; linked as a record, not as evidence",
        date: "2026-07",
      },
      {
        type: "repo",
        label: "Architecture docs",
        href: `${APPLIED_BLOB}/docs/ARCHITECTURE.md`,
        source: `yadava5/applied @ ${APPLIED_SHA}`,
        boundary: "the desktop path — written before the web app",
        date: "2026-07",
      },
      {
        type: "benchmark",
        label: "ML strategy and evaluation gates",
        href: `${APPLIED_BLOB}/docs/ML_STRATEGY.md`,
        source: `yadava5/applied @ ${APPLIED_SHA}`,
        boundary: "public repository file",
        date: "2026-07",
      },
      {
        type: "repo",
        label: "Backend test suite",
        href: `${APPLIED_TREE}/backend/tests`,
        source: `yadava5/applied @ ${APPLIED_SHA}`,
        boundary: "public repository tree",
        date: "2026-07",
      },
      {
        type: "repo",
        label: "Web app source",
        href: `${APPLIED_TREE}/apps/web`,
        source: `yadava5/applied @ ${APPLIED_SHA}`,
        boundary:
          "public repository tree — the shipped app, live at getapplied",
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
            label: "see fig. 4 — the expo poster",
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
            label: "see fig. 4 — the expo poster",
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
        method: "the product’s design, described — not an outcome metric",
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
            label: "see fig. 4 — the expo poster",
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
        text: "Per-run metrics remain withheld while the repository is private; the eval protocol for the platform’s own model runs is not yet publicly documented. Nothing here has been retracted — this register is waiting on a demo-data run ledger.",
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
    /* PLATE ORDER IS CITATION ORDER (fix round 3, N1).
       `ArtifactGallery` numbers plates by this array's order (fig 4, 5,
       6 here, since the registry excerpt above already spent fig 3), and
       the array used to run screenshot → deck → poster. The RECEIPTS
       cite the poster first: a reader working down the validation table
       met "see fig. 6", then "see fig. 5" three times, then fig 6 again
       — a monograph numbering its plates backwards against its own
       argument. Figures are numbered in order of first reference, so the
       poster leads (fig 4), the deck follows (fig 5), and the registry
       screenshot — which no receipt cites — closes (fig 6). The six
       citation labels moved with it, and the grid is if anything better
       for it: the poster is the one `md:col-span-2` plate, so it now
       rules the full width at the top with the two half-width plates
       squared up beneath instead of a full-width band under a ragged
       pair. */
    artifacts: [
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
      {
        type: "presentation",
        label: "Presenter stack proof",
        href: withBasePath("/images/projects/agentic-automl-stack-proof.png"),
        source: "senior design presenter deck, slide 8",
        boundary: "private-safe capture — source repo not shown",
        date: "2026-05",
      },
      {
        type: "real-screenshot",
        label: "Private-safe experiment registry screenshot",
        href: withBasePath("/images/projects/automl.webp"),
        source: "local AutoML repository, demo data",
        boundary: "demo dataset — no client or institutional data",
        date: "2026-06",
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
      "A visually impaired user needs the room described now, not after a round trip — and never at the price of shipping camera or location context to somebody else’s server.",
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
      "No custom-trained Core ML model is claimed — the vision paths use Apple’s frameworks, and no model file was present in the audited repo.",
      "No live camera, location, or user sensor data is shown anywhere in this file.",
    ],
    corrections: [
      {
        date: "2026-05",
        kind: "erratum",
        text: "An earlier draft carried the smaller count from the repo’s CI run title. The audited count in the current tree is 71 test functions; the receipt above links the tree so the number can be checked.",
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
    /* The headline pin names the CURRENT repository at its current
       public head — the Applied re-pin round's ruling, applied here: a
       ledger row that answers "where does this code live" may not name
       a redirect. Receipts 01–03 keep `taskflow-calendar @ 69a59e7`,
       which answers a different question — where a number was taken —
       and the corrections register explains the split rather than
       leaving a reader to guess which pin is stale. */
    repoPin: {
      repo: "yadava5/cadence",
      sha: CADENCE_SHA,
      href: `https://github.com/yadava5/cadence/tree/${CADENCE_SHA}`,
    },
    summary:
      "A production-style calendar and task manager that takes its scheduling in plain English — parsed into structured intent, checked for conflicts, stored in PostgreSQL, covered by a broad automated suite. It is also the file where I found seven of my own IDOR bugs, fixed them, and then wrote the database-level isolation that would make them structurally impossible — and left that half deliberately switched off until a staged cutover. Receipt 05 is where that standing is written down.",
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
      {
        decision:
          "Carry the user id to Postgres in a transaction-local GUC, not a per-user connection",
        reason:
          "Cadence shares a Supabase pooler, so a session-level SET can be handed to whichever tenant borrows that connection next. An AsyncLocalStorage store carries the id the auth middleware already verified, and every statement runs inside a transaction that first sets app.user_id with set_config(..., true) — the third argument is what makes the setting die with the transaction.",
        tradeoff:
          "Every read costs a transaction, and any query path that goes around the wrapper silently loses its scope — which is why the isolation suite drives the real query() and withTransaction() instead of raw SQL, and why one of its tests exists only to prove the GUC does not survive on a reused pool.",
        status: "accepted",
      },
      {
        decision: "Ship the RLS migration inert and cut over by hand",
        reason:
          "Turning FORCE ROW LEVEL SECURITY on before every request reliably sets the GUC locks the app out of its own data. The migration states the order in its own header — the GUC wiring deploys first, the policies are applied after — and nothing in the app auto-applies the file.",
        tradeoff:
          "The database is enforcing nothing yet. Until someone runs 0002 against production, the isolation is the application’s discipline and not Postgres’s, which is what the boundary rows say out loud.",
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
      /* ── the isolation work (receipts 04–10) ─────────────────────
         Rows 04 onward are the per-user isolation story, pinned to
         `cadence @ 54c79e0` — the public head, where this work lives.
         Read them in order: 04 is the bug, 05–07 are the database
         answer and its exact standing, 08–10 are the rest of what the
         same pass closed.

         Row 05 is the one that must not be skimmed. The DB-level RLS
         is NOT enforcing anything in production, and every row that
         touches it says so in its own words rather than relying on 05
         to carry the caveat for the group. */
      {
        claim:
          "I found and fixed 7 IDOR-vulnerable endpoints. GET and DELETE on tasks and events, and GET on calendars, task-lists, and attachments, all looked a record up by id alone — so any signed-in user could read or delete another user’s records by guessing one. Every lookup is now scoped to the caller and a miss returns 404, not 403: an id that is not yours should not be confirmed to exist.",
        method:
          "read the five fix(security) commits and the service methods at the pin; 6 of the 7 routes carry a named cross-tenant regression test",
        artifacts: [
          {
            label: `lib/services/TaskService.ts @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/lib/services/TaskService.ts`,
          },
          {
            label: `lib/services/__tests__ @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/lib/services/__tests__/TaskService.test.ts`,
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
      {
        claim:
          "The database-level answer to that bug is written, tested, and NOT live. 0002_enable_rls.sql puts 22 policies and FORCE ROW LEVEL SECURITY on 7 tenant tables, and its own header says: “Nothing in the app auto-applies this file.” It is deployed inert — production cutover is a final staged step that has not been taken. What prevents a cross-user read today is the application-level scoping in receipt 04, not Postgres.",
        method:
          "read the migration and every path that could apply it at the pin — the only code in the repo that reads lib/config/migrations/ is the test file",
        artifacts: [
          {
            label: `0002_enable_rls.sql @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/lib/config/migrations/0002_enable_rls.sql`,
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
      {
        claim:
          "The per-request identity reaches Postgres without a connection per user: authenticateJWT enters an AsyncLocalStorage store with the id it just verified, and every query runs in a transaction that first executes SELECT set_config('app.user_id', $1, true). The third argument is the whole point — it makes the setting transaction-local, so it cannot ride a pooled connection to the next tenant.",
        method:
          "source audit of rlsContext.ts, database.ts, and middleware/auth.ts at the pin",
        artifacts: [
          {
            label: `lib/config/rlsContext.ts @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/lib/config/rlsContext.ts`,
          },
          {
            label: `lib/config/database.ts @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/lib/config/database.ts`,
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
      {
        claim:
          "11 of 11 isolation tests pass against a real Postgres: a raw unfiltered SELECT as user B returns only B’s rows, an INSERT for someone else fails the WITH CHECK, attachments and task_tags scope through their owning task, and one test exists solely to prove the GUC does not leak across users on a reused pool. They do not run in ordinary CI — the suite skips itself unless RLS_TEST_PG_ADMIN_URL names a database.",
        method:
          "re-run 2026-07-26 against a throwaway postgres:16 container, applying the real 0002 migration and a NOSUPERUSER NOBYPASSRLS role, driving the production query() and withTransaction()",
        artifacts: [
          {
            label: `lib/__tests__/rls.postgres.test.ts @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/lib/__tests__/rls.postgres.test.ts`,
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
      {
        claim:
          "A globally-unique tags table became per-user. name was unique across the whole application, so two people could not both keep an “urgent” tag. The migration backfills each tag’s owner from the tasks it is attached to, clones any tag two users shared so each keeps a private copy, drops the orphans, and swaps the global unique index for (userId, name) with a cascading foreign key.",
        method: "read the data migration and the Prisma schema at the pin",
        artifacts: [
          {
            label: `0001_tags_add_userid.sql @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/lib/config/migrations/0001_tags_add_userid.sql`,
          },
          {
            label: `prisma/schema.prisma @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/packages/backend/prisma/schema.prisma`,
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
      {
        claim:
          "A thrown auth error was orphaned in the middleware pipeline. composeMiddleware awaited only each middleware’s own return value, so when a middleware called next() without awaiting it and the downstream authenticateJWT rejected, nothing caught the rejection and no response was ever sent — a request with an expired token hung until the platform timed it out instead of getting its 401. The composer now holds the promise next() starts and awaits it.",
        method:
          "read the fix and its named regression test at the pin — “propagates a downstream throw even when an upstream middleware calls next() without awaiting it”",
        artifacts: [
          {
            label: `lib/middleware/index.ts @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/lib/middleware/index.ts`,
          },
          {
            label: `middleware/__tests__/index.test.ts @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/lib/middleware/__tests__/index.test.ts`,
          },
        ],
        date: "2026-07-26",
        visibility: "public",
      },
      {
        claim:
          "Two more holes closed in the same pass: POST and PUT /api/upload accepted uploads with no authentication at all and wrote public-read blobs, and now sit behind the auth middleware chain; and DELETE /api/account cascades one user’s own rows through a single transaction — task tags, attachments, tasks, events, task lists, calendars, profile, then the user.",
        method:
          "source audit of both handlers at the pin; the deletion flow also carries an end-to-end spec",
        artifacts: [
          {
            label: `server-handlers/upload/index.ts @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/server-handlers/upload/index.ts`,
          },
          {
            label: `server-handlers/account/index.ts @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/server-handlers/account/index.ts`,
          },
        ],
        date: "2026-07-26",
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
            /* 2026-07-26: was `taskflow-calendar-ashy.vercel.app`, the
               pre-rename deploy. It still answers, which is worse than a
               404 — the file printed one host in its meta ledger and a
               different one here for the same app. Erratum on file. */
            label: "usecadenceapp.vercel.app",
            href: "https://usecadenceapp.vercel.app",
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
      "1,145 is my local vitest count from 2026-07 against the pinned commit — not a CI badge. The repo’s own CI is red on main right now, and I’d rather tell you that than hide it.",
      "No production users or uptime are claimed; the deployment is a demo with a mock-login flow.",
      "The DB-enforced RLS is not turned on in production. Receipt 05 is the standing: the policies are written, the app sets the GUC on every query, and 11 tests prove the pair binds against a real Postgres — but 0002 is hand-run, and the cutover is a final staged step nobody has taken. Isolation is the application’s discipline today.",
      "The repo ships the SQL that creates a NOSUPERUSER NOBYPASSRLS role for the app to connect as. It cannot show you which role the production DATABASE_URL actually uses — that is database state, not repository state, and no file here can settle it.",
      "The 11 isolation tests are not in CI. The suite skips unless an admin Postgres URL is handed to it, so an ordinary CI run reports zero of them — I ran them by hand on the date in the row.",
      "The hang in receipt 09 was timed once, by hand, against the deployed app, and that number lives in the fix commit’s message and nowhere else — no log, no test, and no timeout setting reproduces it. So this file describes the failure and not its seconds.",
    ],
    corrections: [
      {
        date: "2026-07-26",
        kind: "note",
        text: "The repository was renamed yadava5/taskflow-calendar ⟶ yadava5/cadence, and this file now carries two pins on purpose. The ledger above and receipts 04–10 name cadence @ 54c79e0, the current public head — where the code lives and where the isolation work landed. Receipts 01–03 stay at taskflow-calendar @ 69a59e7, because that is the commit the 1,145-test count was measured at, and re-pinning a number to a commit nobody re-ran it at turns a measurement into a guess. GitHub redirects the old paths; both resolve.",
      },
      {
        date: "2026-07-26",
        kind: "erratum",
        text: "The workspace outcome row linked taskflow-calendar-ashy.vercel.app. That deploy still answers, so nothing 404’d — but it is not the app any more, and the file was printing one host in its meta ledger and another one two sections down. The row now links usecadenceapp.vercel.app, the same host as the rest of the file.",
      },
    ],
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
      {
        type: "repo",
        label: "Row-level security migration",
        href: `${CADENCE_BLOB}/lib/config/migrations/0002_enable_rls.sql`,
        source: `yadava5/cadence @ ${CADENCE_SHA}`,
        /* The provenance strip is where a plate states what it is NOT.
           This one is a migration that has never been applied to the
           production database, and the strip says so wherever the
           artifact is opened — including from the viewer dialog, where
           receipt 05's wording is not on screen. */
        boundary: "public repository — hand-run, and not applied in production",
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
        method: "the pipeline’s published boundary, described",
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
        source: "drawn from the pipeline’s real structure",
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
      "Policy lived in three places — documents, pages, and people’s heads. An answer meant knowing which of the three to ask, and the answers didn’t always agree.",
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
          value: "File Search ⟶ citation extraction ⟶ local quote verifier",
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
        source: "drawn from the assistant’s real structure",
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
      "MNIST is small enough to hold in your head. That’s the point — at this size, low-level matrix optimization and benchmark discipline have nowhere to hide.",
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
          value: "openmp+simd dot kernel vs the -O3 baseline ⟶ 3.5× at dot 256",
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
          "The openmp+simd dot kernel is 3.5× faster than the -O3 baseline (dot 256) — committed benchmark data, not a live run; the repo’s own analysis notes -march=native alone barely moves the needle.",
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
          "A benchmark suite is committed — matrix kernels measured across the repo’s three configurations (baseline, native, openmp+native), with dated run files in the repo.",
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
          "SIMD acceleration is implemented across AVX2, AVX-512, and NEON paths; the verified 3.5× belongs to the openmp+simd dot kernel vs the -O3 baseline, not to SIMD alone.",
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
            /* 2026-07-26: was `fast-mnist.vercel.app`, the pre-rename
               alias. It still answers, which is worse than a 404 — the
               file printed one host in its meta ledger and a different
               one here for the same app. Erratum on file (the same
               two-host defect corrected on Cadence the same day). */
            label: "getglyph.vercel.app",
            href: "https://getglyph.vercel.app",
          },
        ],
        date: "2026-07",
        visibility: "public",
      },
    ],
    notClaiming: [
      "No AVX-512 inference-speedup claim survives here — see the corrections register below. The verified number is the openmp+simd dot kernel’s 3.5× over the baseline build, and parallelism carries it.",
      "The workbench screenshot was captured with the native inference server offline, so benchmark claims come from committed benchmark data, not the live page.",
    ],
    corrections: [
      {
        date: "2026-05-28",
        kind: "erratum",
        text: "Retracted the earlier AVX-512 inference-speedup claim: the committed classify-throughput rows do not support it. The number this file stands behind is the 3.5× dot-kernel speedup, and the receipt above links the committed data.",
      },
      {
        date: "2026-07-26",
        kind: "erratum",
        text: "The live-demo outcome row linked fast-mnist.vercel.app. That alias still answers, so nothing 404’d — but it is not the brand URL, and the file was printing one host in its meta ledger and another in the row. The row now links getglyph.vercel.app, the same host as the rest of the file.",
      },
      {
        date: "2026-07",
        kind: "note",
        text: "Attribution tightened, number unchanged: the committed 3.5× (dot 256) belongs to the openmp+simd configuration measured against the -O3 baseline. BENCHMARKS.md’s own analysis records that -march=native alone barely moves the needle; earlier site copy credited the speedup to SIMD alone.",
      },
      {
        date: "2026-07",
        kind: "note",
        text: "The ~97% accuracy receipt now carries the HELD stamp: the number is documented in the repo’s README training notes, but no committed eval artifact reproduces it yet. The claim is unchanged and stays on file; the stamp lifts when an eval run is checked in.",
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
 * The tally clauses shared by the audit's settled line and the
 * validation glance strip (evviz round) — ONE composer for the
 * arithmetic, so the scan-first strip, the walked control, and the
 * tests can never disagree on a count. Zero-count segments are
 * omitted; the leading pinned-artifact clause always renders (an
 * honest "0 of 8" is the point on capture-only files).
 *
 * @param counts - Per-state tallies from receiptAuditCounts
 * @returns e.g. ["4 of 8 terminate in pinned artifacts",
 *   "2 in page captures", "2 described only"]
 */
export function auditTallyClauses(counts: ReceiptAuditCounts): string[] {
  const parts = [
    `${counts.artifact} of ${counts.total} terminate in pinned artifacts`,
  ];
  if (counts.capture > 0) parts.push(`${counts.capture} in page captures`);
  if (counts.described > 0) parts.push(`${counts.described} described only`);
  if (counts.held > 0) parts.push(`${counts.held} held`);
  return parts;
}

/**
 * The settled ledger line's sentence, minus the date — the walk's own
 * voice over the shared tally clauses.
 *
 * @param counts - Per-state tallies from receiptAuditCounts
 * @returns e.g. "audit walked · 4 of 8 terminate in pinned artifacts ·
 *   2 in page captures · 2 described only"
 */
export function auditSettledSentence(counts: ReceiptAuditCounts): string {
  return ["audit walked", ...auditTallyClauses(counts)].join(" · ");
}

/** Anchor id for receipt row `n` (1-based across receipts then outcomes) */
export function receiptAnchor(projectId: string, n: number): string {
  return `v-${projectId}-${n}`;
}
