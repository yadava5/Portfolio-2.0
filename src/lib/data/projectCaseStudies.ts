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
 *     2026-03-03; bench-20260802-dot20x run files); audit dates come from
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
import { withBasePath } from "@/lib/basePath";

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
  /**
   * A named collaborator on a team project.
   *
   * Added 2026-07-30. Two of these seven files describe two-person
   * projects, and until now neither named the second person — automl
   * said "my slice below" and glyph said nothing at all, so both read
   * as sole authorship. Scoping the role disclosed that a team existed;
   * it did not credit anyone.
   *
   * It is a field rather than more prose in `role` because the meta
   * ledger lowercases that value twice over (`.label-mono` sets
   * `text-transform: lowercase`, and the row calls `.toLowerCase()`),
   * which would have printed a person's name in lowercase. The renderer
   * gives this row the same `normal-case` treatment the repo pin gets,
   * for the same reason: some strings are data, not typography.
   *
   * `scope` says what they worked on, so the credit is specific rather
   * than decorative.
   */
  collaborator?: {
    name: string;
    /** Somewhere the reader can confirm the person is real */
    href?: string;
    scope: string;
  };
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
/* APPLIED_SUITE — where the backend test count was MEASURED, 2026-08-07.
   Same rule as CADENCE_SUITE below: a count and the commit it was taken
   at are one fact and move together. 271 at 36a2f54 became 278 at 03fc5c4;
   the ten skips did not move. Every other Applied receipt keeps 36a2f54,
   which is still where those source audits were done.

   2026-08-07: the pin sat at `03fc5c4` — which this comment itself called
   the 278 tree, with ten skips — under a receipt claiming 305 and 0
   skipped, while proofManifest.ts pinned the same 305 to a THIRD sha,
   `a0d77a1`. One number, three commits. Re-measured and re-pinned at
   `71b74f8`, and both files now name it: backend-ci run 31152038153,
   `305 passed`, `0 skipped`. CI rather than a local venv for the reason
   Cadence's twin gives — the workflow is where the zero is proved instead
   of asserted. Confirmed on the remote before this line was written:
   71b74f8 resolves, and main is 4 ahead of it, 0 behind. */
const APPLIED_SUITE_SHA = "71b74f8";
const APPLIED_SUITE_TREE = `https://github.com/yadava5/applied/tree/${APPLIED_SUITE_SHA}`;
const VISUAL_ASSIST_SHA = "22ebdaa";
const VISUAL_ASSIST_BLOB = `https://github.com/yadava5/VisualAssist/blob/${VISUAL_ASSIST_SHA}`;
const VISUAL_ASSIST_TREE = `https://github.com/yadava5/VisualAssist/tree/${VISUAL_ASSIST_SHA}`;
const TASKFLOW_SHA = "69a59e7";
/* `yadava5/cadence`, not `yadava5/taskflow-calendar`. The repo was
   renamed with the product, and GitHub keeps the old path working by
   redirect — but a redirect is not a permalink: it dies the moment any
   repo named `taskflow-calendar` exists under this account again. A
   receipt on a site whose thesis is "every claim terminates at an
   artifact you can open" cannot rest on that. Verified 200 at the
   canonical name before this was written. */
const TASKFLOW_TREE = `https://github.com/yadava5/cadence/tree/${TASKFLOW_SHA}`;
/* CADENCE_SUITE — where the test count was MEASURED, 2026-08-07.

   The suite receipt used to say 1,145 at `69a59e7`. That was true when it
   was taken and is no longer the number: re-run on the provenance audit,
   the tree gives 635 frontend + 524 backend = 1,159 passing, 11 skipped.

   It gets its own pin rather than reusing TASKFLOW_SHA because the rule
   this file already states elsewhere cuts both ways — "re-pinning a
   number to a commit nobody re-ran it at turns a measurement into a
   guess", and so does leaving a re-run number on the old commit. The
   number and the sha it was measured at are one fact and they move
   together. The other receipts keep `69a59e7`, which is still where
   those source audits were done.

   2026-08-07: the pin was `8eee84e` while the receipt beside it read
   1,185 — and this very comment said `8eee84e` measured 1,159 with 11
   skipped. The number was right and the sha under it was not, which is
   the failure this block was written to prevent, committed in the block
   itself. Re-measured and re-pinned together at `dbabc74`, which is
   `yadava5/cadence` main and the local HEAD: CI run 31222343049,
   Backend Tests 550 passed across 25 files, Frontend Tests 635 passed
   across 58, all five jobs green, 0 skipped. CI is the instrument
   because it fails on any skip, so a green run is itself the proof of
   the zero — a locally skipped-but-green backend run is exactly how
   this number drifted the first two times.

   2026-08-08: re-pinned again to `abaaea8`, 1,185 -> 1,186. Not drift — the
   suite grew by exactly one test, and that test is the one that would have
   caught GET /api/tags returning 500 in production for every user since the
   service was written. Number and sha moved together, as always. */
const CADENCE_SUITE_SHA = "abaaea8";
const CADENCE_SUITE_TREE = `https://github.com/yadava5/cadence/tree/${CADENCE_SUITE_SHA}`;
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
/* Agentic AutoML went PUBLIC on 2026-07-30. Until then this file's
   strongest claims terminated at page captures and a metadata check no
   reader could repeat — its own ledger line was the blunt "0 of 8
   terminate in pinned artifacts". Public means the architecture claims
   can finally cite the code.
   Pinned to the default branch head, "ci: increase build heap for
   GitHub Actions" (2026-05-08). Both paths below were fetched
   ANONYMOUSLY — no token, the way a reader arrives — and returned 200
   before anything here was written.
   What did NOT change: this project still claims no accuracy or
   performance number, because no eval artifact exists to earn one. The
   work is the architecture and the gates. */
const AUTOML_SHA = "e506c91";
const AUTOML_BLOB = `https://github.com/yadava5/ai-augmented-auto-ml-toolchain/blob/${AUTOML_SHA}`;
const CADENCE_SHA = "54c79e0";
const CADENCE_BLOB = `https://github.com/yadava5/cadence/blob/${CADENCE_SHA}`;
/**
 * The eighth IDOR, found after CADENCE_SHA was pinned.
 *
 * A third pin on this file, and deliberately so — the same reasoning the
 * 2026-07-26 note gives for keeping receipts 01–03 at 69a59e7. A receipt
 * names the commit its finding was made at; moving CADENCE_SHA forward
 * to swallow this one would silently restate seven older findings as
 * though they had been re-verified at a commit nobody re-read them at.
 */
const CADENCE_IDOR8_SHA = "75180a3";
const CADENCE_IDOR8_BLOB = `https://github.com/yadava5/cadence/blob/${CADENCE_IDOR8_SHA}`;
/* Moved off `c6e5c0b` on 2026-08-07, four days after proofManifest.ts made
   the same move and for the same stated reason. Not because the old pin was
   wrong — 3.5× holds at both — but because `001e9b4` is the commit whose
   BENCHMARKS.md ADMITS what the December one did not: the "sub-percent
   variance" line was never measured, the harness the docs told you to run
   recorded no repetitions at all, and the reference machine changed from a
   fanless MacBook Air to the M1 Pro. Pinning to the commit that owns the
   correction is stronger than pinning to one that does not.

   Every use of this pin in this file is benchmark provenance — BENCHMARKS.md,
   bench_summary.csv, bench_matrix.cpp, the run JSON and the repo row — so
   unlike CADENCE_SUITE_SHA or GLYPH_EVAL_SHA it needs no second pin beside it:
   moving it swallows no other finding. That was checked by enumerating all
   fifteen uses before the move, because this file's own rule is that a receipt
   names the commit its finding was made at.

   This file was the last surface still citing the December run: the vendored
   records, proofManifest.ts and src/run/index.html had all moved to
   2026-08-02, and this file's OWN corrections register already called the
   December run "history rather than the reference" while the receipts above it
   went on citing it. All four paths re-fetched at the new pin before this line
   was written — BENCHMARKS.md, bench_summary.csv, bench_matrix.cpp and
   bench-20260802-dot20x-openmp-native.json, each 200. */
const FAST_MNIST_SHA = "001e9b4";
/* `yadava5/glyph` for the same reason as Cadence above — the rename is
   real, the old path is only a redirect. Verified 200 at the canonical
   name for both pins used here. */
const FAST_MNIST_BLOB = `https://github.com/yadava5/glyph/blob/${FAST_MNIST_SHA}`;
/* The MNIST evaluation needs its own pin: commit 97de736,
   "docs(backend): commit the measured MNIST evaluation (#137)", 2026-07-27,
   on origin/main. This is the artifact that earns a claim the site had been
   holding since W2.

   This comment used to say the eval "landed AFTER the c6e5c0b pin", which
   was its whole justification and stopped being true on 2026-08-07 when the
   benchmark pin moved forward to 001e9b4 (2026-08-03). The eval now predates
   the benchmark pin rather than following it, and the pin is still separate
   for the reason that outlives the ordering: an eval and a benchmark are two
   measurements, and one pin covering both would restate whichever did not
   move as though it had been re-taken. */
const GLYPH_EVAL_SHA = "97de736";
const GLYPH_EVAL_BLOB = `https://github.com/yadava5/glyph/blob/${GLYPH_EVAL_SHA}`;

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
    verified: "2026-08",
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
      flow: [["gmail"], ["fetch"], ["classifier"], ["store"], ["api"], ["ui"]],
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
        /* The FastAPI layer was missing from this topology until the
           2026-08-02 provenance audit, and its absence made the next
           edge false: the diagram drew Postgres straight into Next.js,
           but the web app never opens a database connection. Every read
           goes through `apps/web/lib/applications/server.ts` and the
           route handlers under `apps/web/app/api/`, which call
           `${BACKEND_API_URL}` holding the caller's Supabase JWT
           server-side. The same package is what the macOS client talks
           to at 127.0.0.1:8000, and what deploys as a Vercel Python
           function via `api/index.py`. It is also where the JWT is
           verified before the database gate can mean anything — so
           leaving it out understated the design, not just the diagram. */
        {
          id: "api",
          label: "FastAPI",
          detail: "One package serves the web app and the desktop one",
          kind: "api",
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
        { from: "store", to: "api", label: "rows the role may see" },
        {
          from: "api",
          to: "ui",
          label: "pipeline state, over the caller’s jwt",
        },
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
            "predicted vs expected label ⟶ macro-F1; CI blocks the build below 0.95",
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
          "The backend suite runs at the pinned commit: 305 tests passed, 0 skipped, under the test/null-keyring environment. It read 278 passed and 10 skipped until 2026-08-03. The +27 is 10 CORS origin-policy tests, 7 benchmark-guard tests, and the 10 Postgres RLS tests that used to be the skips — those now provision their own postgres:16 rather than waiting on a database URL nobody supplied.",
        method:
          "`pytest tests -q` in backend-ci run 31152038153 at the pinned head. The Postgres RLS module is included in that count and no longer skips: it starts its own postgres:16 through testcontainers instead of waiting on a database URL nobody supplied.",
        artifacts: [
          {
            label: `applied @ ${APPLIED_SUITE_SHA} · backend/tests`,
            href: `${APPLIED_SUITE_TREE}/backend/tests`,
          },
        ],
        /* Was "2026-08-02" — one day BEFORE the 2026-08-03 measurement the
           claim above describes, so the receipt dated itself earlier than
           the thing it reports. Now the date of the run it actually cites. */
        date: "2026-08-07",
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
      "This bullet used to say CI could not prove the RLS policies enforce, because the Postgres suite skipped unless a live database URL was supplied and no workflow supplied one. That stopped being true on 2026-07-31 and the disclaimer outlived it. backend-ci.yml now runs an rls-postgres job against a postgres:16 service, sets JOBTRACKER_TEST_PG_ADMIN_URL, and fails if that URL is missing rather than letting the module skip quietly — so all ten tests execute on every push. A stale disclaimer is the same broken receipt as a stale boast, and the harder one to catch, because nobody audits a claim that costs its author something.",
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
      {
        date: "2026-08-02",
        kind: "erratum",
        text: "The backend-suite row read 271 passed and 10 skipped. Re-run on the provenance audit at the current head 0f2b63f: 278 passed, 10 skipped. Same movement as the 182 ⟶ 271 correction above and for the same reason — the tree grew seven tests, nothing was retracted, and the skips did not move. The row is re-pinned to the commit the new count was taken at; every other Applied receipt keeps 36a2f54, which is still where those source audits were done.",
      },
      {
        date: "2026-08-02",
        kind: "note",
        text: "Provenance audit: the classifier claims were re-derived by running the code rather than reading about it. The rules gate passed live at 96 samples, macro-F1 0.9791, 2 misclassified — and the deterministic hybrid gate returned the identical numbers, which is the direct evidence for the attribution correction recorded earlier: the file named “hybrid” measures the regexes alone. The 201-rule figure was recomputed by importing jobtracker.classifier.rules and summing the pattern lists across all seven categories — 106 strong, 26 weak, 69 negative, plus 14 ATS domains. The eval set was counted from its own JSONL: 96 samples, 8 classes, 12 each. Every one of those figures matched what this file already said.",
      },
    ],
    /* Provenance strips carry the whole correction here. These rows are
       DESKTOP-era records that are still real files at the new pin — the
       honest edit was to say which era each one speaks for, not to unlink
       them. The README in particular is no longer offered as
       "source-truth": it still calls apps/web a scaffold.

       THE DRAWN PLATE THAT STOOD FIRST IS GONE, 2026-08-07. It was
       `jobtracker-architecture.svg`, and it failed on both axes at once.
       Off-brand: `font-family="Inter"` — a face this site never loads, so
       it fell back to Arial — over Tailwind slate on a near-black ground,
       printed as a dark rectangle on cream paper. And redundant: it said
       what `fig. 2` says natively from `architecture` below, one section
       up the page. Its own `<title>`, which is the accessible name, read
       "JobTracker — the desktop path (2026-02 era)" — the retired brand in
       the one string only a screen-reader user hears, which
       `projects.ts:309-316` calls a wrong label rather than history. That
       contest is moot now the file is gone. What remains here is what a
       reader opens BECAUSE the page cannot draw it. */
    artifacts: [
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
    /* The same collaborator as glyph. This file has disclosed a team
       since it was written ("my slice below") but never named him, which
       is a thinner kind of credit than it looks — a reader learns there
       was someone else and cannot learn who. He is already in this
       repo's own data as a testimonial (testimonials.ts:93, deliberately
       unsurfaced for a documented reason), and the two of them are named
       together on the platform's public landing page. */
    collaborator: {
      name: "Shree Chaturvedi",
      href: "https://www.linkedin.com/in/chaturs/",
      scope: "capstone teammate",
    },
    timeframe: "2025-09 to Present",
    filed: "2025-09",
    verified: "2026-08",
    status: "in progress",
    /* Traces to the corrections note + boundary row: the platform core
       is built; the demo-data run ledger has not shipped yet. */
    statusDetail: "core shipped, run ledger pending",
    /* `repoPin: null` was what drove the PRIVATE REPOSITORY stamp —
       CaseStudyPage computes `isPrivate = study.repoPin === null`, so
       the moment the owner made the repo public on 2026-07-30 this page
       was printing a large dashed stamp asserting the opposite, in
       clay, with an aria-label to match. Pinning the repo removes the
       stamp by telling the truth rather than by hiding a component.
       Tree URL fetched anonymously, 200, before it was written here. */
    repoPin: {
      repo: "yadava5/ai-augmented-auto-ml-toolchain",
      sha: AUTOML_SHA,
      href: `https://github.com/yadava5/ai-augmented-auto-ml-toolchain/tree/${AUTOML_SHA}`,
    },
    summary:
      "A public agentic AutoML platform. Datasets and domain documents become auditable pipeline decisions — and a human approval gate holds every generated action before it alters the workflow.",
    /* This aside was the last sentence of the private era, and it outlived
       it by a week. The repo went public on 2026-07-30: `repoPin` was set
       (which is what removed the PRIVATE REPOSITORY stamp), receipt 01 was
       rewritten, and the corrections register below says so in as many
       words — while this paragraph, three sections up the same page, went on
       asserting the opposite. A disclosure that describes a posture the file
       no longer holds is worse than no disclosure: it is the one paragraph a
       reader trusts to tell them what they are NOT being shown.

       It now names what is actually withheld. The sha stays in the ledger
       above rather than being repeated here — AUTOML_SHA moves, and prose
       carrying a copy of a constant is how the two come to disagree. */
    evidenceDisclosure: {
      label: "Public source, results not claimed",
      detail:
        "The repository is yadava5/ai-augmented-auto-ml-toolchain — public, and pinned to a commit in the ledger above — so every architectural claim on this file terminates in source a reader can open. What is not here is performance: no accuracy, latency or throughput figure appears anywhere below, because no committed eval artifact earns one. Going public made the architecture inspectable, not the results.",
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
        /* THE REPO WENT PUBLIC ON 2026-07-30 and this row said the
           opposite, which made it the one false sentence on the file.
           It read "lives in the private repo …" with `artifacts: []`
           and `visibility: private-safe` — accurate when written, and
           untrue the moment the owner flipped it.
           Verified before rewriting, anonymously (no token, the way a
           reader arrives): the repo returns 200 and the API reports
           `private: false`. The README at the pinned sha states the
           seven phases, the LangGraph + MCP core and the human gate in
           its own words, so the claim now terminates at that file
           rather than at a metadata check nobody else can run. */
        claim:
          "The platform is the public repo yadava5/ai-augmented-auto-ml-toolchain; its README titles it Agentic AutoML Platform and states the seven-phase lifecycle, the LangGraph and MCP core, and a human approval gate at every step.",
        method: "read at the pinned commit on the public repo",
        artifacts: [
          {
            label: `ai-augmented-auto-ml-toolchain @ ${AUTOML_SHA} · README.md`,
            href: `${AUTOML_BLOB}/README.md`,
          },
        ],
        date: "2026-07-30",
        visibility: "public",
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
        /* This claim used to rest on a photograph of a poster panel.
           With the repo public it rests on the registry itself: the MCP
           server file, read at the pinned sha, registers exactly twelve
           tools. Naming them is deliberate — this project's booklets
           once shipped FABRICATED tool names and a correctness audit
           had to replace them with the real twelve, so the count and
           the names now point at the file that decides them.
           They are also a better story than a count: the agent is not
           holding twelve abstract "tools", it is operating a notebook
           the way a person would — read a cell, write a cell, run it,
           reorder them, profile a dataset, search the docs. */
        claim:
          "Pipeline decisions run through LangGraph and MCP tool calls rather than free-form output: the server registers exactly twelve tools, and they are notebook and dataset operations — list_project_files, get_dataset_profile, get_dataset_sample, search_documents, list_cells, read_cell, write_cell, edit_cell, run_cell, delete_cell, reorder_cells, insert_cell.",
        method:
          "counted and read in the MCP server source at the pinned public commit",
        artifacts: [
          {
            label: `ai-augmented-auto-ml-toolchain @ ${AUTOML_SHA} · backend/src/services/mcp/mcpServer.ts`,
            href: `${AUTOML_BLOB}/backend/src/services/mcp/mcpServer.ts`,
          },
          {
            label: "see fig. 4 — the expo poster",
            href: "#artifacts",
            capture: true,
          },
        ],
        date: "2026-07-30",
        visibility: "public",
      },
    ],
    notClaiming: [
      "No per-run metrics are published here. The registry excerpt shows run, model, and status only — a demo-data run ledger with a complete metric trail has not shipped yet.",
      "The source is now public and pinned above, so the architecture claims are inspectable. What is still NOT claimed is a result: no accuracy, throughput, or benchmark figure appears on this file, because no committed eval artifact earns one. The work this file argues is the architecture and the human gate.",
    ],
    corrections: [
      {
        date: "2026-07",
        kind: "note",
        text: "Per-run metrics remain withheld because no committed eval artifact earns one; the eval protocol for the platform’s own model runs is not yet publicly documented. Nothing here has been retracted — this register is waiting on a demo-data run ledger.",
      },
      {
        date: "2026-07-30",
        kind: "erratum",
        text: "The repository is no longer private, and until today this file said it was. Receipt 01 read “The platform lives in the private repo …” and carried no artifact at all — true when written, false the moment the visibility changed, and it was the one incorrect sentence on the page. yadava5/ai-augmented-auto-ml-toolchain now answers anonymously; both paths cited here were fetched without a token and returned 200 before the rows were rewritten. Two claims moved from a photograph of a poster to the source that decides them: the seven-phase lifecycle and the human gate now cite the README at e506c91, and the MCP claim cites the server file, which registers exactly twelve tools — named here in source order because this project’s booklets once shipped fabricated tool names and an audit had to replace them. The note above stands with its reason corrected: going public makes the ARCHITECTURE inspectable, not the results. No accuracy or throughput figure appears on this file, because no committed eval artifact earns one.",
      },
      {
        date: "2026-08-06",
        kind: "erratum",
        text: "The evidence aside above still said the repository was private, and it had said so for a week after it stopped being true. The 2026-07-30 round pinned the repo, removed the private stamp and rewrote receipt 01, but missed the one paragraph whose entire job is to tell a reader what they are not being shown \u2014 so the file contradicted itself three sections apart, and the erratum directly below it. Rewritten to name what is actually withheld: the source is public and pinned, and no accuracy, latency or throughput figure appears anywhere on this file because no committed eval artifact earns one. Found while rebuilding the archive as static HTML, by reading the generated page rather than the component that used to render it.",
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
        /* The REASON changed, not the withholding. This read "metrics
           withheld — private repository", which was the true reason
           until 2026-07-30 and is now the wrong one: the source is
           public and pinned in the meta ledger above. The metrics are
           still withheld because no committed eval artifact exists to
           earn them — which is a stronger, more honest sentence than
           the old one, since it no longer lets a reader assume the
           numbers are sitting behind a lock. */
        "metrics withheld — no committed eval run earns them yet; the source itself is public, pinned above.",
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
      /* THE PRODUCT SCREENSHOT IS GONE, AND THE LIVE SITE IS WHY — ruled
         2026-08-07. `automl.webp` was a 2026-06 local capture of the
         experiment registry reading "First Test Pr…" over seeded demo
         metrics. Two replacements were considered and both are worse than
         nothing.

         A shot of the live landing page: the deployed surface at
         agentic-automl-platform.vercel.app states, in its own nav, "Coming
         soon". A marketing page carrying a not-yet-shipped flag, entered
         into a shelf that argues completed and gated work, is rhetoric
         filed as evidence. The case file already links the live surface;
         a still of a page one click away is a low-fidelity mirror of a
         living record that goes stale on the next redeploy — the same
         error the seven appendix plates died for.

         A fresh staged interior: the numbers on it would be seeded demo
         metrics no committed artifact owns, which FIGURES.md rule 6
         forbids. That is the old plate's weakness re-shot at higher
         resolution, not a fix.

         What argues for this project is unaffected and is all still here:
         the public repository, the seven gated phases, fig. 09, and the
         presenter-deck plate directly above. The shelf does not go empty,
         so this file keeps its `§ plates & artifacts` heading. */
    ],
  },
  {
    projectId: "visual-assist",
    treatment: "field-systems",
    fileNo: 3,
    role: "iOS accessibility engineer",
    timeframe: "2025-03 to Present",
    filed: "2025-03",
    verified: "2026-08",
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
        /* "and commands" came off on 2026-08-02. VoiceCommandService.swift
           is a real 240-line SFSpeechRecognizer service compiled into the
           target — and it has zero consumers: no view and no AppState
           instantiates it. A capability that is in the binary but wired to
           nothing is not a capability the case file may claim. */
        "ARKit and Vision process device context locally, then SwiftUI and VoiceOver expose guidance through speech and haptics.",
      nodes: [
        {
          id: "sensor",
          label: "LiDAR",
          detail: "Depth and obstacle signals",
          kind: "system",
        },
        {
          id: "camera",
          label: "Camera",
          detail: "RGB frames — the input both vision modes read",
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
        /* This edge used to read `sensor ⟶ localvision`, and that data
           path does not exist. LiDARService is instantiated in exactly one
           place (NavigationModeView) and its distances drive that view's
           indicators and accessibility labels; ObjectDetectionService is
           instantiated in ObjectAwarenessModeView and is fed RGB frames by
           CameraService, never by LiDAR. They are two independent modes.
           The camera node below is what makes the correction constructive
           rather than merely a deletion. */
        {
          from: "sensor",
          to: "feedback",
          label: "distance, on the navigation mode",
        },
        { from: "camera", to: "vision", label: "frames" },
        { from: "camera", to: "localvision", label: "frames" },
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
          "71 tests cover models and utilities, and all 71 pass — executed on iOS 26.5 and again on 26.2, 0 failed, 0 skipped.",
        method: "xcodebuild test, .xcresult parsed with xcresulttool",
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
        text: "An earlier draft took its count from the repo’s CI run title rather than from the test tree; that draft is not in this repository’s history, so the figure it printed cannot be quoted back here. The audited count in the current tree is 71 test functions, and the receipt above links the tree so the number can be checked.",
      },
      {
        date: "2026-08",
        kind: "note",
        text: "Until now this file said “71 test functions”, deliberately — a count of what the tree declared, because the suite had never been run. Not in CI, which had no `xcodebuild test` step, and not locally, because xcodebuild wanted an iOS runtime the machine did not have. A count is a weaker claim than a result and it was worded to admit that. The runtime was installed on 2026-08-03 and the suite ran: 71 passed, 0 failed, 0 skipped, on iPhone 17 Pro under iOS 26.5, and again under 26.2 when the simulator resolver happened to pick a different device. The claim above is now a result. The static count did not move, which is the outcome that should be least surprising and was still worth checking.",
      },
    ],
    /* The drawn plate retired 2026-08-07 with its six siblings: it restated
       `fig. 2` in Inter over Tailwind slate, and `fig. 2` draws the same
       flow natively from `architecture`. See the note on Applied's
       artifacts for the full reasoning. */
    artifacts: [
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
    verified: "2026-08",
    status: "shipped",
    /* Traces to the boundary row: a demo deployment with mock login. */
    statusDetail: "demo deployment, mock login",
    /* The headline pin names the CURRENT repository at its current
       public head — the Applied re-pin round's ruling, applied here: a
       ledger row that answers "where does this code live" may not name
       a redirect. Receipts 01–03 keep the PIN `69a59e7`, which answers a
       different question — where a number was taken — while naming the
       repository `cadence`, because a label is the repo's name and a sha
       is the measurement's address; those are two facts, not one. The
       corrections register explains the split rather than leaving a
       reader to guess which pin is stale.

       2026-08-02 (provenance audit): the labels said `taskflow-calendar`
       until today even though the 2026-07-30 correction below already
       told the reader they had been changed. They had not. That is the
       defect this comment now exists to prevent — a register entry
       describing a repair that never shipped. */
    repoPin: {
      repo: "yadava5/cadence",
      sha: CADENCE_SHA,
      href: `https://github.com/yadava5/cadence/tree/${CADENCE_SHA}`,
    },
    summary:
      "A calendar and task manager that takes its scheduling in plain English — parsed into structured intent, checked for conflicts, stored in PostgreSQL, covered by a broad automated suite. It is also the file where I found eight of my own IDOR bugs, fixed them, and then wrote the database-level isolation that would make them structurally impossible — and left that half deliberately switched off until a staged cutover. Receipt 05 is where that standing is written down.",
    problem:
      "Planning splinters across tools — notes here, reminders there, scheduling language nowhere — and nobody notices two meetings colliding until they collide.",
    constraints: [
      "Support natural language input for scheduling.",
      "Keep full-stack behavior tested across frontend, backend, and integration layers.",
      "Use PostgreSQL and indexed queries for calendar data.",
      "Keep the workspace usable across multiple planning views.",
    ],
    architecture: {
      /* No test count in this sentence, deliberately. It used to end
         "…tested across 1,145 automated checks", which put a headline
         number inside a STRUCTURAL description — the one place no gate
         looks and no reader thinks to re-check. It went stale there for
         two days after the receipt beside it had been corrected. The
         count lives at the receipt, which carries the commit it was
         measured at; the architecture says what the system IS. */
      summary:
        "A React and TypeScript interface sends scheduling workflows through a full-stack app backed by PostgreSQL, with the suite covering frontend, backend and integration paths.",
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
        /* The isolation layer, drawn at last. THREE of this file's five
           decisions are about JWT identity, the transaction-local
           `app.user_id` GUC and row-level security — and the diagram had
           no element for any of it, so the picture showed a calendar app
           where the argument is a tenancy boundary. Added 2026-08-02.

           It is deliberately NOT marked `gate: true`, unlike Applied's
           Postgres node. RLS here is written for seven tables and staged
           OFF; what actually enforces isolation today is the owner-scoped
           check on six services. Drawing a gate would promise the
           database is refusing, and it is not — the handlers are. That
           distinction is the whole content of receipts 04–10 and it
           would be a shame to lose it to a nicer-looking diagram.

           2026-08-03: still staged OFF, and the sentence above still
           holds — but the REASON it is staged has changed, so the reason
           is worth recording. The risk was never that the policies were
           wrong; rls.postgres.test.ts had already proved those against a
           real Postgres. The risk was that enabling them might break the
           product, because nothing exercised the SERVICE layer under
           enforced RLS: the handler integration suites mock the services,
           and the service tests never see a policy.

           rls.cutover-rehearsal.test.ts closes that. It drives the real
           CalendarService / TaskListService / TaskService against a
           database with the real migration applied, as a NOSUPERUSER
           NOBYPASSRLS role, and they work — CRUD succeeds, cross-tenant
           reads return nothing, a cross-tenant UPDATE changes nothing.

           It also found why nobody had tried: two columns the app writes
           on ordinary paths (tasks.status, attachments.thumbnailUrl)
           exist in no schema source in that repository, so a database
           built from its own definitions cannot run it. That is fixed in
           the fixture and is the honest answer to "why was this deferred".

           2026-08-03, later the same day: the cutover happened. The
           migration is applied to the live Supabase database, the app
           connects as `cadence_app` — NOSUPERUSER NOBYPASSRLS — and the
           database is now what refuses. Seven tables ENABLE + FORCE, 22
           policies. Verified through the production pooler rather than
           against the migration file: a read scoped to the busiest tenant
           returns exactly its 5 tasks / 2 calendars / 7 tags, an unbound
           read returns 0 rows, and a cross-tenant INSERT is refused.

           So this node IS a gate now, and the paragraph above is kept
           rather than rewritten because the sequence is the point — the
           rehearsal is what made the cutover safe to attempt.

           The cutover also broke production for about an hour, which
           belongs here more than the success does. Moving tag uniqueness
           from a global unique-on-name to ("userId", name) stranded an
           inline `ON CONFLICT (name)` inside TaskService — a private copy
           of an upsert TagService already did correctly. Every tagged task
           creation failed while 550 backend tests stayed green, because
           nothing exercised that copy against a real schema. */
        {
          id: "auth",
          label: "Owner-scoped checks",
          detail: "JWT identity; rls enforced on 7 tables, FORCE, 22 policies",
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
          /* Bound by check-figures.mjs `Cadence · suite` since 2026-08-07.
             It was unbound until then, which is how this node spent four
             days rendering 1,159 — twice — on a page whose own receipt
             said 1,185 and whose /evidence entry said 1,179. Now 1,186: the tags
             fix added the regression test that would have caught it. */
          label: "1,186 tests",
          detail: "Frontend, backend, integration",
          kind: "validation",
        },
      ],
      edges: [
        { from: "ui", to: "nlp", label: "natural language" },
        { from: "nlp", to: "api", label: "parsed intent" },
        { from: "api", to: "auth", label: "every read, scoped to its owner" },
        { from: "auth", to: "db", label: "calendar records" },
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
          "For eleven days the database enforced nothing: shipping the migration inert meant the isolation was the application’s discipline and not Postgres’s, and the boundary rows said so out loud. That window closed on 2026-08-03, when 0002 was run against production by hand — the cutover this decision deliberately deferred. The cost that remains is the one the choice actually bought: there is a hand step between “written” and “enforcing”, it is invisible to CI, and nothing but this file records that it was taken.",
        status: "accepted",
      },
    ],
    receipts: [
      {
        claim:
          "I measured the suite on 2026-08-08: 635 frontend + 551 backend = 1,186 tests passing under vitest, with 0 skipped. On 2026-08-02 it read 635 + 524 = 1,159 with 11 skipped; the 11 were the Postgres row-level-security module, which waited on a database URL no workflow supplied. They now provision their own postgres:16 and run, and the cutover rehearsal added six more.",
        method:
          "CI at the pinned head, not a local run — GitHub Actions run 31233308044 on `main`, whose Backend Tests job reports 551 passed across 25 files and Frontend Tests 635 across 58. CI is the instrument on purpose: it fails the build on any skip, so a green run proves the 0 skipped rather than asserting it, and a locally skipped-but-green backend run is how this number drifted twice before.",
        artifacts: [
          {
            label: `cadence @ ${CADENCE_SUITE_SHA}`,
            href: CADENCE_SUITE_TREE,
          },
        ],
        date: "2026-08-02",
        visibility: "public",
      },
      {
        claim:
          "Scheduling accepts natural language — chrono-node and compromise parse it into structured intent.",
        method: "source audit of the NLP input path",
        artifacts: [
          {
            label: `cadence @ ${TASKFLOW_SHA}`,
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
            label: `cadence @ ${TASKFLOW_SHA}`,
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
          "I found and fixed 8 IDOR vulnerabilities across 9 endpoints. GET and DELETE on tasks, events and tags, and GET on calendars, task-lists and attachments, all looked a record up by id alone — so any signed-in user could read or delete another user’s records by guessing one. Every lookup is now scoped to the caller and a miss returns 404, not 403: an id that is not yours should not be confirmed to exist. The eighth was found three days after the other seven were filed, on tags, and it carried the sharpest finding of the set — the regression test that was supposed to cover it asserted `WHERE id = $1` with the id as its only parameter. It was pinning the vulnerable query in place and reporting green.",
        method:
          "read the six fix(security) commits and the service methods at their pins; 7 of the 9 routes carry a named cross-tenant regression test, and the eighth finding also corrected the test that had been certifying the bug",
        artifacts: [
          {
            label: `lib/services/TaskService.ts @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/lib/services/TaskService.ts`,
          },
          {
            label: `lib/services/__tests__ @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/lib/services/__tests__/TaskService.test.ts`,
          },
          /* The eighth finding lands at its OWN commit, three days after
             the pin the other seven were read at, because that is where
             it exists. Both files are cited: the fix, and the test that
             had been asserting the vulnerable query. */
          {
            label: `lib/services/TagService.ts @ ${CADENCE_IDOR8_SHA}`,
            href: `${CADENCE_IDOR8_BLOB}/lib/services/TagService.ts`,
          },
          {
            label: `TagService.test.ts @ ${CADENCE_IDOR8_SHA}`,
            href: `${CADENCE_IDOR8_BLOB}/lib/services/__tests__/TagService.test.ts`,
          },
        ],
        date: "2026-07-27",
        visibility: "public",
      },
      {
        claim:
          "The database-level answer to that bug is written, tested, and — since 2026-08-03 — LIVE. 0002_enable_rls.sql puts 22 policies and FORCE ROW LEVEL SECURITY on 7 tenant tables. It sat deployed inert for eight days, because nothing in the app auto-applies it and the cutover was a hand-run step nobody had taken. It has now been run. The app connects as cadence_app — NOSUPERUSER NOBYPASSRLS — so Postgres refuses a cross-user read rather than the handlers refusing it. Verified through the production pooler rather than by reading the migration: a read scoped to the busiest tenant returns exactly its 5 tasks / 2 calendars / 7 tags, an unbound read returns 0 rows, and a cross-tenant INSERT is rejected. The application-level scoping in receipt 04 is still there — it is the second line now, not the only one.",
        method:
          "applied the migration to the live database, then verified through the production connection as the non-bypassing app role: role attributes from pg_roles, table and policy state from pg_class and pg_policy, and scoped versus unbound row counts compared against ground truth",
        artifacts: [
          {
            label: `0002_enable_rls.sql @ ${CADENCE_SHA}`,
            href: `${CADENCE_BLOB}/lib/config/migrations/0002_enable_rls.sql`,
          },
        ],
        date: "2026-08-03",
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
          "11 of 11 isolation tests pass against a real Postgres: a raw unfiltered SELECT as user B returns only B’s rows, an INSERT for someone else fails the WITH CHECK, attachments and task_tags scope through their owning task, and one test exists solely to prove the GUC does not leak across users on a reused pool. They run in CI: the workflow provisions a postgres:16 service and hands the suite RLS_TEST_PG_ADMIN_URL, so the skip guard never fires there — 11 of 11 executed at this pin on 2026-07-24.",
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
            label: `cadence @ ${TASKFLOW_SHA}`,
            href: TASKFLOW_TREE,
          },
        ],
        date: "2026-07",
        visibility: "public",
      },
    ],
    notClaiming: [
      "Re-run 2026-07-31 against HEAD 932625e it is 1,168 passed and 11 skipped (635 frontend + 533 backend) — the tree grew from 87 to 105 test files over 249 commits, and nothing was retracted. 1,145 is my local vitest count from 2026-07 against the pinned commit — not a CI badge, and that commit’s own CI run failed. Main has been green since 2026-07-23, so the caveat is that this number predates the green rather than that the repo is broken.",
      "No production users or uptime are claimed; the deployment is a demo with a mock-login flow.",
      "The DB-enforced RLS is now turned on in production, as of 2026-08-03. The app connects as cadence_app — NOSUPERUSER NOBYPASSRLS — and seven tenant tables carry ENABLE + FORCE with 22 policies. FORCE matters: without it, policies do not apply to the table owner, and the owner is what an application usually connects as. Verified through the production pooler rather than by reading the migration — a read scoped to the busiest tenant returns exactly its 5 tasks / 2 calendars / 7 tags, an unbound read returns 0 rows, and a cross-tenant INSERT is refused. What used to be the application's discipline is now the database's refusal. The cutover cost an hour of broken production and that belongs in the record: moving tag uniqueness to (\"userId\", name) stranded an inline ON CONFLICT (name) in TaskService — a private copy of an upsert TagService already handled correctly — so every tagged task creation failed while 550 backend tests stayed green, because nothing exercised that copy against a real schema.",
      "The repo ships the SQL that creates a NOSUPERUSER NOBYPASSRLS role for the app to connect as. It cannot show you which role the production DATABASE_URL actually uses — that is database state, not repository state, and no file here can settle it.",
      "The hang in receipt 09 was timed once, by hand, against the deployed app, and that number lives in the fix commit’s message and nowhere else — no log, no test, and no timeout setting reproduces it. So this file describes the failure and not its seconds.",
    ],
    corrections: [
      {
        date: "2026-07-30",
        kind: "erratum",
        text: "The IDOR count was stale at seven. An eighth of exactly the same class — TagService reading and deleting by id alone — was found and fixed on 2026-07-27 at cadence @ 75180a3, three days after the other seven were filed, and this file went on saying seven. It now says eight across nine endpoints, and the eighth carries its own pin rather than moving the pin the first seven were read at: a receipt names the commit its finding was made at, and re-pointing CADENCE_SHA forward would silently restate seven older findings as if they had been re-verified somewhere nobody re-read them. The eighth also brought the sharpest finding in the set, and it is the reason this correction is worth more than the number: the regression test that was supposed to cover that route asserted WHERE id = $1 with the id as its only parameter. It was pinning the vulnerable query in place and reporting green. A test can certify a bug. This very page learned the same lesson from the other end on the same day — a Playwright spec here was requiring the page to repeat a false sentence about CI, and retracting the sentence broke the spec that was defending it.",
      },
      {
        date: "2026-07-30",
        kind: "erratum",
        text: "Three statements on this page were false, and every one of them was an UNDER-claim — this file was disowning work it had actually done. It said the 11 isolation tests “do not run in ordinary CI”, that they “are not in CI”, and that “the repo’s own CI is red on main right now”. Checked against the run logs rather than against memory: the workflow at cadence @ 54c79e0 provisions a postgres:16 service and sets RLS_TEST_PG_ADMIN_URL, so the skip guard never fires there, and run 30133037462 records ✓ lib/__tests__/rls.postgres.test.ts (11 tests) 232ms on 2026-07-24. Main has been green since 2026-07-23. The likely origin is a copy: the identical caveat is TRUE of Applied, whose backend workflow really does provision no database, and it appears to have been carried across to a repo whose CI had since gained one. A false disclaimer is the same broken receipt as a false boast, and arguably the worse one, because a reader has no reason to doubt a claim that costs its author something. What has NOT changed is the standing that matters: the migration is still hand-run, still not applied in production, and receipt 05 still says so.",
      },
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
      {
        date: "2026-07-30",
        kind: "note",
        text: "Receipts 01–03 now read cadence @ 69a59e7 rather than taskflow-calendar @ 69a59e7. The pin is unchanged and that is the whole point of the 2026-07-26 note above: 69a59e7 is still the commit the 1,145-test count was measured at, and nothing has been re-pinned. What changed is only the repository’s name in the label, because the old name now survives on a GitHub redirect and a redirect is not a permalink — it stops resolving the moment any repo called taskflow-calendar exists under this account again. A receipt on a page arguing that every claim terminates at an artifact you can open should not depend on that. The canonical path was fetched and returned 200 before the label was changed.",
      },
      {
        date: "2026-08-02",
        kind: "erratum",
        text: "The note above was not true when it was written. Receipts 01–03, and receipts 11 and 12 with them, went on reading “taskflow-calendar @ 69a59e7” for three more days — the built page rendered the retired name eighteen times — while the register told the reader the labels had already been changed. They read cadence now. This is recorded as an erratum rather than repaired quietly because the error was not a stale name: it was this register claiming a repair it had not made, which is the one failure that costs a corrections register the thing it exists for.",
      },
      {
        date: "2026-08-02",
        kind: "erratum",
        text: "The receipt itself now reads 1,159 — see the erratum below, which corrects this entry's own number. The 2026-07-31 note above already reported that re-run — 635 frontend + 533 backend at 932625e — but only the note was written: the receipt, the architecture summary, the diagram’s own node label and the /evidence index all went on saying 1,145 for another two days, so the page argued with itself and the reader had to find the erratum to learn which number was current. Re-measured independently on 2026-08-02 and confirmed identical: 1,168 passing, 11 skipped. The number and its commit move together, so the row is re-pinned to 932625e; receipts 02 and 03 keep 69a59e7, which is still where those source audits were done. This is the second erratum in this register about a correction that was recorded without being applied, and the pair is why the audit now ends by widening the drift gate instead of only fixing the values.",
      },
      {
        date: "2026-08-02",
        kind: "erratum",
        text: "1,168 became 1,159, and the reason is a mistake in the correction above rather than in the code. That entry re-pinned the count to 932625e — which is an UNPUSHED local commit. The source URL 404’d, and the number, though correctly measured, could not be reproduced by anyone: the tree it was taken at does not exist publicly. Re-measured at the public head 8eee84e instead — 635 frontend + 524 backend = 1,159 passing, 11 skipped. The nine-test difference IS 932625e, the fix for nine endpoints that never authenticated; those tests land here the moment that commit is pushed, and the number goes back up on its own. Recorded rather than quietly repaired because the rule this file states — a count and its commit are one fact — has a second half it did not say out loud: the commit has to be one a reader can open.",
      },
      {
        date: "2026-08-07",
        kind: "erratum",
        text: "This is the third drift of the same number, and this time it shipped as three different values at once. The architecture figure’s node label read 1,159 — twice on the built page — the receipt beside it read 1,185, and the /evidence index read 1,179. Every gate was green, and the erratum above was itself stale: it says “the receipt itself now reads 1,159” while the receipt had moved to 1,185 and left the figure behind. Re-measured at cadence main dbabc74, CI run 31222343049, all five jobs green: 635 frontend across 58 files + 550 backend across 25 = 1,185 passing, 0 skipped. All three surfaces now read that, and the two pins — this file’s CADENCE_SUITE_SHA and proofManifest’s — moved to dbabc74 with it. The register predicted this: the 2026-08-02 pair ends by saying the audit “widens the drift gate instead of only fixing the values”, and the widening was only half done. check-figures.mjs’s Cadence · suite entry had no manifest: key, so it could not see /evidence at all, and it never bound the node label — the same two holes that entry’s Applied twin had already documented and closed for itself. Both are closed for Cadence now, so the next drift is a red gate rather than a reader’s discovery.",
      },
      {
        date: "2026-08-08",
        kind: "erratum",
        text: "1,185 became 1,186 within a day of the entry above, and the one extra test is worth more than the four surfaces it moved. Exercising the deployed app — signed in as the demo account, against the real API — found GET /api/tags answering 500 for every user: TagService selected t.\u0022createdAt\u0022 and t.\u0022updatedAt\u0022 from a table that has five columns and never had those two. git log dates the over-select to the commit that added the service, so tags have been unreachable through the API for the life of the feature. Its 28 unit tests passed throughout, and still pass with the bug deliberately reinstated, because their fixtures are hand-written objects that never reach Postgres — the same shape as the tagged-task failure this register already carries. The fix ships with a regression test that calls the service against the real schema in a real Postgres, which is the +1. Recorded here rather than folded into the entry above because the number the page published yesterday is not the number it publishes today, and a register that quietly restates itself is the failure it exists to prevent.",
      },
    ],
    artifacts: [
      {
        type: "real-screenshot",
        label: "Production calendar, demo account session",
        href: withBasePath("/images/projects/taskflow.png"),
        source:
          "production interior — usecadenceapp.vercel.app, demo account · 2026-08",
        boundary: "demo account state — no real user data",
        date: "2026-08",
      },
      {
        type: "repo",
        label: "Source code",
        href: TASKFLOW_TREE,
        source: `yadava5/cadence @ ${TASKFLOW_SHA}`,
        boundary: "public repository",
        date: "2026-07",
      },
      {
        type: "repo",
        label: "Row-level security migration",
        href: `${CADENCE_BLOB}/lib/config/migrations/0002_enable_rls.sql`,
        source: `yadava5/cadence @ ${CADENCE_SHA}`,
        /* The provenance strip is where a plate states what it is NOT.
           It said "not applied in production" until 2026-08-07, four days
           after the cutover made that false. It does not RENDER — external
           artifacts take the outbound-index path (render-case-file.mjs:352)
           — which is exactly why it went stale: a string no page draws is a
           string no reader corrects. Fixed anyway; a boundary is a claim
           about a real system whether or not anyone is currently reading it. */
        boundary:
          "public repository — hand-run, and applied in production 2026-08-03",
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
    verified: "2026-08",
    status: "concluded",
    statusDetail: "role ended 2026-05",
    repoPin: null,
    privateRepoName: "institutional — Miami University IT",
    summary:
      "Private proof from institutional ITSM data work: a Python and SQL pipeline that takes Workday exports and Tableau metadata — systems that disagree — and files them into one 35-field master inventory keyed by a deterministic id.",
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
        "Workday exports and Tableau metadata feed Python and SQL transforms, deterministic IDs, timestamped run artifacts, and dashboard-ready outputs.",
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
          detail: "Report and asset metadata",
          kind: "api",
        },
        {
          id: "python",
          label: "Python/SQL",
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
          "No one outside the institution can inspect the source data, so this file names the systems, constraints, and validation shape instead.",
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
        /* #v-master-inventory-5 IS DELIBERATELY UNREACHED, and this is where
           that ruling lives because this is the row it is about.

           Until Phase 4 it had exactly one way in: `StoryShell.tsx`, the React
           home page, which linked it as the "1M+" metric. Measured as a set
           difference at the Phase 2 checkpoint, it was the ONLY one of the
           archive's 53 receipt anchors whose sole inbound link died with that
           page — the run links four and /evidence links ten, and between them
           they cover every other anchor StoryShell reached.

           It is not restored, for the reason the row itself states: `artifacts`
           is empty, `date` is null and `visibility` is local-only. It is the
           one receipt on this site that terminates in nothing a reader can
           open. A deep link into it would promise a receipt and deliver a
           description — the exact move the honesty engine exists to prevent.
           The run instead links the case FILE from ¶03, in the same sentence
           that says out loud "only the inventory is checked in — the rest are
           read off miami's own systems and cannot be published". That sentence
           is the honest way in, and it is already there.

           If this row ever gains a publishable artifact, it gains a way in too.
           Until then the absence is the argument. */
        claim:
          "More than one million operational records ran through the Python/SQL transforms behind OAS and Tableau reporting in this same role.",
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
    /* NOTHING HANGS IN THIS APPENDIX, AND THAT IS THE RULING — 2026-08-07.
       Two plates stood here and both were the page saying itself twice in a
       borrowed hand. `pipeline-architecture.svg` restated `fig. 2`;
       `master-inventory-proof.svg` restated the ledger table two sections
       up — and restated it with LESS, having no notes column and no JSON to
       download. Both drew in `font-family="Inter"`, which this site never
       loads, over Tailwind slate on near-black, on a cream page.
       Redrawing them natively was considered and rejected: it would have
       rebuilt the duplication in the house's own inks, and for the ledger it
       would have created exactly the "second, unpinned copy" of a record
       that `atlas.spec.ts` was written to forbid. A case file argues in its
       own hand and attaches only what it cannot draw. This one can draw all
       of it. */
    artifacts: [],
  },
  {
    projectId: "policybot",
    treatment: "evidence-ledger",
    fileNo: 7,
    role: "RAG systems engineer",
    timeframe: "2025-06 to 2026-05",
    filed: "2025-06",
    verified: "2026-08",
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
      "Answer in Slack, where the questions already get asked.",
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
          "Slack integration adds event handling to maintain, and puts the answer in the thread where the question was asked.",
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
          "The source repo passes 24 tests in its own .venv-ci on Python 3.12.11, without calling OpenAI or Slack: Slack adapter, Slack formatting, and retrieval helpers. This entry read 3 until 2026-08-03, which was true of a temporary audit virtualenv that could only reach the formatting file. The suite had grown; the claim had not.",
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
          "Answers come back in Slack with the source cited, and topics the sources do not cover are declined rather than answered — 4 such fallbacks in the recorded sweep.",
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
          note: "Slack adapter, formatting and retrieval helpers, network-free",
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
    /* Empty for the same reason master-inventory's is — see the note there.
       `policybot-architecture.svg` restated `fig. 2`;
       `policybot-validation-proof.svg` restated the validation ledger with
       its notes column removed. Both in Inter over Tailwind slate. The
       ledger above is the record; a thumbnail of it is not a second
       source. */
    artifacts: [],
  },
  {
    projectId: "fast-mnist-nn",
    treatment: "evidence-ledger",
    fileNo: 2,
    /* Two people built this, and until 2026-07-30 the file said so
       nowhere — it read as sole authorship on every surface. The
       résumé has always been the accurate document here ("2-person
       team"; the kernels written "with a teammate"), so the omission
       was the site's.
       Scoped with the same device this repo already uses for the other
       team project: automl's role is "Capstone engineer — my slice
       below", which discloses the team and delimits the claim in the
       meta ledger a reader hits before any receipt. Same shape here.
       The teammate is deliberately NOT named: the résumé does not name
       them either, and guessing a real person's name onto a public page
       would be a worse error than the one being fixed. Naming them is a
       one-line change the owner can make. */
    role: "C++ performance engineer — two-person project, my slice below",
    collaborator: {
      name: "Shree Chaturvedi",
      href: "https://www.linkedin.com/in/chaturs/",
      scope: "the SIMD kernels, written together",
    },
    timeframe: "2025-10 to 2026-01",
    filed: "2025-10",
    verified: "2026-08",
    status: "shipped",
    /* Both clauses are artifacts on this page: the tagged release and
       the committed benchmark run. */
    statusDetail: "v1.0.0 tagged, benchmarks committed",
    repoPin: {
      repo: "yadava5/glyph",
      sha: FAST_MNIST_SHA,
      href: `https://github.com/yadava5/glyph/tree/${FAST_MNIST_SHA}`,
    },
    /* The old first sentence — "A neural network for MNIST with nothing
       under it but C++" — claimed the network. The network was a course
       MLP that already existed; the work here is what was done TO it.
       projects.ts:352 already said "a course C++ MLP", so the site was
       telling two stories about the same artifact and this file was
       telling the flattering one. Optimizing someone else's network
       across three instruction sets is a harder and more specific thing
       than writing another MNIST MLP, so the accurate sentence is also
       the stronger one.

       THREE, not four (2026-08-02 provenance audit). This sentence said
       "Four instruction sets" and it is the highest-reach string on the
       route: `seo.ts` feeds it to the meta description, og:description,
       twitter:description, the TechArticle JSON-LD node, the
       SoftwareSourceCode node, and the visible page deck — six copies of
       one wrong number, against a run that says three. The source settles
       it: `src/Matrix.cpp` and `src/NeuralNet.cpp` guard exactly
       `__AVX512F__`, `__AVX2__` and `__ARM_NEON`, with a scalar fallback.
       There is no `__wasm_simd128__` branch anywhere; the wasm target
       passes `-msimd128` and lets Emscripten auto-vectorise the scalar
       path, which is a compiler flag, not a hand-written kernel. */
    summary:
      "A course C++ MLP for MNIST, hand-optimized until there was nothing under it but SIMD. Three hand-written instruction sets over a scalar fallback, OpenMP parallelism, a committed benchmark suite, and a React workbench where you draw a digit and watch the network read it.",
    problem:
      "MNIST is small enough to hold in your head. That’s the point — at this size, low-level matrix optimization and benchmark discipline have nowhere to hide.",
    constraints: [
      "Keep the implementation in C++ with explicit SIMD and OpenMP paths.",
      "Quote no speedup that a committed benchmark run does not produce.",
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
        /* "prediction output" hid three delivery paths, and which one
           answers is the interesting part of this project. The web app
           declares them itself — `web/src/api/predict.ts` types
           `PredictionSource = 'server' | 'browser-wasm' | 'browser-js'`:
           the httplib server at :8080 is preferred, the Emscripten build
           is the offline fallback, and a plain-JS classifier is the last
           resort. The portfolio's own ¶06 station runs the middle one —
           the 45.9 KB wasm it ships is this same model. (2026-08-02.) */
        {
          from: "model",
          to: "demo",
          label: "prediction — server, wasm, or js fallback",
        },
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
        reason: "A reader can watch the network work without reading C++.",
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
            "openmp+native dot kernel vs the -O3 baseline ⟶ 3.5× at dot 256",
        },
        {
          label: "run",
          value:
            "2026-08-02 — committed as bench-20260802-dot20x-{baseline,openmp-native}.json (20 reps) + bench_summary.csv; the 2025-12-26 run files are still in the repo as history",
        },
        {
          label: "repro",
          value: "python3 tools/run_benchmarks.py --openmp --native",
        },
      ],
    },
    receipts: [
      {
        /* THE HELD STAMP COMES OFF — the condition it named was met.
           From W2 until 2026-07-27 this row read "~97% … documented in
           the repo, not measured on this page" and carried
           `held: { note: "held until a committed eval run earns it" }`,
           because the number terminated in README prose.

           That eval run is now checked in. Commit 97de736 ("docs(backend):
           commit the measured MNIST evaluation (#137)", 2026-07-27, on
           origin/main) adds `benchmarks/mnist_eval.txt` — a generated
           report naming its generator (`apps/eval_model.cpp`), the model
           it scored, that model's sha256, and the per-class table — plus
           `mnist_misclassified.csv` listing all 299 errors.

           So the claim is stated at the measured value, not the rounded
           one: 9,701 of 10,000, which is 97.01%, and the macro-F1 the
           same run reports. Holding an earned claim is its own dishonesty
           — it under-claims verified work — and the stamp exists to mark
           what is NOT yet earned, so leaving it here would make the mark
           mean nothing. Both pins verified 200 before this was written.

           Honest boundary, kept: the 10,000-image test set itself is not
           vendored in the repo (it is the standard public MNIST set), so
           what is committed is the generator, the model, and the output —
           reproducible by anyone who fetches MNIST, not a self-contained
           replay. The method line says exactly that. */
        claim:
          "The network scores 97.01% on the 10,000-image MNIST test set — 9,701 correct, 299 wrong, macro-F1 0.9698 — measured by a committed eval run, not README prose.",
        method:
          "committed eval report: generator apps/eval_model.cpp, model.weights pinned by sha256, 784→100→10 sigmoid MLP; the public MNIST test set is not vendored in the repo",
        artifacts: [
          {
            label: `glyph @ ${GLYPH_EVAL_SHA} · benchmarks/mnist_eval.txt`,
            href: `${GLYPH_EVAL_BLOB}/benchmarks/mnist_eval.txt`,
          },
          {
            label: `glyph @ ${GLYPH_EVAL_SHA} · apps/eval_model.cpp`,
            href: `${GLYPH_EVAL_BLOB}/apps/eval_model.cpp`,
          },
        ],
        date: "2026-07-27",
        visibility: "public",
      },
      {
        /* Attribution checked by BUILDING all three configurations rather
           than by reading BENCHMARKS.md, which is what this row used to
           cite. On arm64 the `baseline` and `native` binaries come out
           byte-identical — -march=native is an x86 flag clang does not act
           on here — so the hand-written NEON path is compiled into both
           sides of the comparison and none of the 3.5× is SIMD's. Until
           2026-08-06 this row credited an "openmp+simd" kernel, which reads
           as though the vectorisation earns part of the number. */
        claim:
          "The dot-256 kernel runs 3.5× faster under OpenMP than the -O3 baseline — and the parallelism carries all of it: all three configurations were built, and on arm64 the baseline and native binaries are byte-identical, so the hand-written NEON path sits in both sides of the comparison. Committed benchmark data, not a live run.",
        method:
          "committed 2026-08-02 benchmark run, 20 repetitions — protocol in the method slip",
        artifacts: [
          {
            label: `glyph @ ${FAST_MNIST_SHA} · BENCHMARKS.md`,
            href: `${FAST_MNIST_BLOB}/BENCHMARKS.md`,
          },
          {
            label: "bench_summary.csv",
            href: `${FAST_MNIST_BLOB}/docs/benchmarks/bench_summary.csv`,
          },
        ],
        date: "2026-08-02",
        visibility: "public",
      },
      {
        claim:
          "A benchmark suite is committed — matrix kernels measured across the repo’s three configurations (baseline, native, openmp+native), with dated run files in the repo.",
        method: "benchmark source + committed run JSON",
        artifacts: [
          {
            label: `glyph @ ${FAST_MNIST_SHA} · benchmarks/bench_matrix.cpp`,
            href: `${FAST_MNIST_BLOB}/benchmarks/bench_matrix.cpp`,
          },
          {
            label: "bench-20260802-dot20x-openmp-native.json",
            href: `${FAST_MNIST_BLOB}/docs/benchmarks/runs/bench-20260802-dot20x-openmp-native.json`,
          },
        ],
        date: "2026-08-02",
        visibility: "public",
      },
    ],
    outcomes: [
      {
        claim:
          "SIMD acceleration is implemented across AVX2, AVX-512, and NEON paths; the verified 3.5× belongs to OpenMP parallelism, not to SIMD — the vectorised path is compiled into both sides of that comparison, so it earns none of the number.",
        method: "source paths + the committed benchmark rows",
        artifacts: [
          {
            label: `glyph @ ${FAST_MNIST_SHA} · BENCHMARKS.md`,
            href: `${FAST_MNIST_BLOB}/BENCHMARKS.md`,
          },
        ],
        date: "2026-08-02",
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
      "No AVX-512 inference-speedup claim survives here — see the corrections register below. The verified number is OpenMP’s 3.5× over the -O3 baseline at dot 256; the SIMD is in both builds and earns none of it.",
      "The workbench screenshot was captured with the native inference server offline, so benchmark claims come from committed benchmark data, not the live page.",
      "The two-layer MLP itself is not claimed here — it is a course network that already existed, and this file is about what was done to it. The SIMD kernels were written with Shree Chaturvedi on a two-person project; the product, the landing page and the benchmark discipline are mine.",
    ],
    corrections: [
      {
        date: "2026-07-30",
        kind: "erratum",
        text: "Credited the collaborator and stopped claiming the network. This file described a two-person project as though one person had built it, and its summary opened by claiming a neural network that already existed — a course MLP this work optimized rather than authored. Both were omissions on the site’s side: the résumé has consistently said 2-person team and named the kernels as written with a teammate. The meta ledger now scopes the role the way the capstone’s already does, and the not-claiming list states what is not mine. Under-crediting a collaborator is the one error on this site that costs more than a wrong number, because a number can be re-measured and a person cannot be un-omitted. The collaborator is Shree Chaturvedi, named here and in the meta ledger above, and he is the same teammate as on the capstone.",
      },
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
        text: "Attribution tightened, number unchanged: the committed 3.5× (dot 256) is the openmp+native configuration measured against the -O3 baseline, and the earlier site copy that credited the speedup to SIMD alone is retired. BENCHMARKS.md’s own analysis records that -march=native alone barely moves the needle. This note then named the winning side “openmp+simd”, which reads as though the vectorisation earns part of the number — a second wrong attribution, corrected by the 2026-08-06 erratum at the end of this register.",
      },
      {
        date: "2026-07-30",
        kind: "note",
        text: "The accuracy claim is no longer held. From the first filing this file stamped ~97% HELD, because the number lived in README prose and no committed run reproduced it — the stamp named its own release condition: held until a committed eval run earns it. That run was committed on 2026-07-27 (glyph @ 97de736), and it brings its own generator, apps/eval_model.cpp, the model it scored pinned by sha256, and a 299-row list of every image it got wrong. So the stamp comes off and the number is stated as measured rather than rounded: 9,701 of 10,000, 97.01%, macro-F1 0.9698. Holding a claim that has been earned is not caution, it is under-claiming, and it would empty the stamp of meaning for the claims that are still genuinely unearned. Honest boundary kept: the 10,000-image MNIST test set is not vendored in the repository, so the run reproduces with the standard public dataset rather than from the repo alone.",
      },
      {
        date: "2026-07-30",
        kind: "note",
        text: "Receipts and the repo pin now read yadava5/glyph rather than yadava5/fast-mnist-nn. No commit or number moved — c6e5c0b is the same benchmark commit it always was, and the v1.0.0 release is the same tag. The repository was renamed with the product, and the old paths now answer only through a GitHub redirect, which stops resolving if any repo named fast-mnist-nn appears under this account again. Every canonical path in this file was fetched and returned 200 before the labels were changed.",
      },
      {
        date: "2026-07",
        kind: "note",
        text: "The ~97% accuracy receipt now carries the HELD stamp: the number is documented in the repo’s README training notes, but no committed eval artifact reproduces it yet. The claim is unchanged and stays on file; the stamp lifts when an eval run is checked in.",
      },
      {
        date: "2026-07-27",
        kind: "note",
        text: "The HELD stamp described in the note above is lifted. glyph@97de736 commits benchmarks/mnist_eval.json, its generator apps/eval_model.cpp, and the 299-row miss list, which is the condition that note set. The rounded “~97%” is retired with it: once a number has an artifact, stating it approximately is a second, smaller inaccuracy. The receipt reads 97.01% — 9,701 of 10,000, macro-F1 0.9698.",
      },
      {
        date: "2026-08-02",
        kind: "erratum",
        text: "Three receipt labels still read “fast-mnist-nn @ c6e5c0b” even though the 2026-07-30 note above told the reader every label had been changed to glyph. The hrefs had been converted; the visible text had not, so the label and the link it sat on named different repositories. The labels now read glyph. Recorded as an erratum rather than a silent fix because the defect was not the stale name — it was a register entry describing a repair that never shipped, on a page whose argument is that this register can be trusted.",
      },
      {
        date: "2026-08-02",
        kind: "note",
        text: "Provenance audit: the MNIST evaluation was re-run from source on an Apple M1 Pro against the standard 10,000-image test set. The regenerated mnist_eval.json and mnist_misclassified.csv are byte-identical to the committed artifacts — 9,701 correct, 299 wrong, macro-F1 0.969822, the same model sha256. The dot-256 kernel benchmark was rebuilt and re-measured at 3.536× — the median of 20 repetitions, committed as docs/benchmarks/runs/bench-20260802-dot20x-{baseline,openmp-native}.json — against the 3.504× December record, which was taken on a different machine (a 4-performance-core M2 Air) and is history rather than the reference. The 3.520× this line used to cite had no committed JSON, and Glyph's own two records disagreed about how it was taken: ENVIRONMENT.md called it a single-repetition re-run, the audit log called it three repetitions. One caveat surfaced and is recorded at the receipt: apps/eval_model.cpp has no add_executable in CMakeLists.txt, so the generator has to be compiled by hand rather than through the project’s own build.",
      },
      {
        date: "2026-08-06",
        kind: "erratum",
        text: "This file credited the 3.5× to an “openmp+simd” kernel in five places — the method slip, the benchmark receipt, the SIMD outcome row, the not-claiming list, and the 2026-07 note above that was itself the correction. The fig. 1 plate said it too, in its drawn label and in the sentence a screen reader is given. The number never moved; the attribution did, and it was wrong: the speed-up is OpenMP’s alone. Settled by building rather than by reading BENCHMARKS.md — all three configurations were compiled, and on arm64 the baseline and native binaries come out byte-identical, because -march=native is an x86 flag clang does not act on here. So the hand-written NEON path is in both sides of the comparison and earns none of the ratio; it is also why a SIMD-alone measurement sits at about 1.0, comparing a binary with itself. The run’s ¶ 06 and the proof manifest have carried this attribution since 2026-08-03 while this file carried the other one, on the same site, about the same measurement. Recorded as an erratum rather than a silent edit because a corrections register that carries a stale correction is worse than one that carries none: it is this page’s own promise that somebody checked.",
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
      /* "Vector project asset" stood here and was the clearest case of the
         lot — 2.5 KB of stock social-card template, one corner-to-corner
         gradient with an emoji and three pill badges, drawing nothing that
         is true of anything. Its own boundary field said so:
         "illustration — carries no claims". A page whose thesis is that
         every figure earns its number was numbering a drawing of nothing as
         fig. 4. It also carried no `<title>` and no `<desc>`, alone among
         the seven, so its whole accessible name was the renderer's
         "Vector project asset plate". Deleted 2026-08-07. */
      {
        type: "repo",
        label: "Source code",
        href: `https://github.com/yadava5/glyph/tree/${FAST_MNIST_SHA}`,
        source: `yadava5/glyph @ ${FAST_MNIST_SHA}`,
        boundary: "public repository",
        date: "2026-07",
      },
      {
        type: "repo",
        label: "v1.0.0 release",
        href: "https://github.com/yadava5/glyph/releases/tag/v1.0.0",
        source: "yadava5/glyph releases",
        boundary: "public release",
        date: "2026-07",
      },
      {
        type: "benchmark",
        label: "Benchmark evidence",
        href: `${FAST_MNIST_BLOB}/BENCHMARKS.md`,
        source: `yadava5/glyph @ ${FAST_MNIST_SHA}`,
        boundary: "committed 2026-08-02 run data, 20 repetitions",
        date: "2026-08-02",
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
