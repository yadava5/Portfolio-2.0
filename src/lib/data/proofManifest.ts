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
   271 at 36a2f54 → 278 at 03fc5c4 → 305 here, each true when taken.

   2026-08-03: the skips went to ZERO, which matters more than the count. The
   10 that skipped were the Postgres RLS module, and the note here used to
   record them as "unchanged at 10" — a stable number that was really a
   stable absence, since those tests had never executed anywhere. They now
   provision their own postgres:16. The integration branch carrying all of
   this merged to main, so the pin moves to a public main commit rather than
   a feature branch; verified 200 before this line was written.

   2026-08-07: this file said 305 @ `a0d77a1` while projectCaseStudies.ts
   said 305 @ `03fc5c4` — and `03fc5c4` is, by its own comment there, the
   278 tree with ten skips. One number, three commits, no gate reading
   both files. Re-measured off CI instead of a venv and both pins moved
   here together: backend-ci run 31152038153, `305 passed`, `0 skipped`.
   `71b74f8` resolves publicly and main is 4 ahead of it, 0 behind. */
const APPLIED_SUITE_SHA = "71b74f8";
const VISUAL_ASSIST_SHA = "22ebdaa";
/* AutoML pin. This file used to hold `AUTOML_SHA = "e506c91"` mirroring
   projectCaseStudies.ts; it is gone because nothing here interpolates it any
   more, and a pin no row stands on is decoration that later reads as evidence.
   e506c91 still appears — in the verification prose below, as the commit the
   TWELVE were counted at — which is the honest place for it: it vouches for a
   count this row no longer leads with. The case file keeps its own copy.

   The 44-tool SURFACE needs its own pin, because e506c91 vouches for the
   MCP subset only: it is where the 12 `registerTool(` sites were counted,
   and a sha is a promise about one file. `5c5b762` is main's public head
   (2026-08-03), and the 44 was counted AT it: preprocessing 14, cell 8,
   feature 6, training 6, data 4, package 3, UI 3 — zero name collisions.

   AN EARLIER DRAFT PINNED `5f8b7da`, AND IT RESOLVED. It still does: the
   commit exists, the seven tool-group files are present at it, and every
   count reproduces there — `tools/index.ts` is the same blob at both refs,
   83f05ee. It is also the head of `gitlab/main-history`, a 2026-04-23 merge
   in the imported GitLab tree, and `compare/main...5f8b7da` returns 404 for
   NO COMMON ANCESTOR. So the pin named a commit that is not on this
   project's history at all, and nothing about fetching it could have said
   so — the blob being identical is exactly what made it convincing.
   Resolving is not the same fact as being main's head. The branch was
   checked this time, not just the blob.

   AND THE BRANCH MOVED ANYWAY (2026-08-14). Everything above was true on
   2026-08-08 and most of it is false now, without a character of it being
   edited. On 12 August the repository consolidated: `main` was replaced by
   the 2,186-commit GitLab lineage, and the GitHub main these pins were read
   on was parked as `archive/github-main`. Asked today:

     compare/main...5c5b762  -> 404  No common ancestor  (= archive head)
     compare/main...e506c91  -> 404  No common ancestor
     compare/main...5f8b7da  -> behind by 61            (= ON main)

   So both pins this file adopted are off main, and the one it rejected for
   being off main is on it. The paragraph above is kept rather than fixed,
   because it was a correct reading of a repository that then changed shape,
   and because the shape of the mistake is the point: the check it invented
   ("is it main's head") is a snapshot, and a snapshot of a branch pointer is
   not a durable fact about a commit.

   `5e42233` — "ci: core lint/test/build validation on main", 2026-08-12 —
   is ON main, and that is deliberately the claim rather than "is main's
   head". A head is a branch pointer, and the whole failure above is what
   happens when a snapshot of a branch pointer is written down as a property
   of a commit; `5e42233` stopped being the head within hours of being
   pinned here and lost nothing by it. BOTH counts were re-taken there rather
   than carried: twelve `server.registerTool(` sites in mcpServer.ts, 44 tool
   definitions across the seven files (preprocessing 14, cell 8, feature 6,
   training 6, data 4, package 3, UI 3), zero name collisions. One commit
   vouches for both nouns now, so the split pin below collapses into
   AUTOML_SHA's.

   AND IT IS NO LONGER CHECKED BY HAND. check-links.mjs now asks
   `compare/{default_branch}...{sha}` for every pinned commit on this site
   and fails unless the answer is `identical` or `behind`; the mutation that
   proves it works is this very sha's predecessor, e506c91, which resolves
   and answers "no common ancestor". */
const AUTOML_TOOLS_SHA = "5e42233";
/* Cadence's suite count is pinned to the commit it was MEASURED at, which
   is the current public head rather than the old `69a59e7`. Re-run on the
   2026-08-02 provenance audit: 1,145 became 1,159. The number and the sha
   move together, because a count without the commit it was taken at is a
   guess with a decimal point.

   AND THE COMMIT HAS TO EXIST. This pin was briefly `932625e`, which is an
   UNPUSHED local commit — so the source URL 404'd and the number could not
   be reproduced by anyone. Re-measured at the public head instead: 1,159.
   The nine-test difference is `932625e` itself, the fix for nine dead
   endpoints, which lands here the moment it is pushed.

   2026-08-03: it was pushed, along with the row-level-security work, so the
   pin moves forward to `2295044` on `fix/method-handler-auth` — verified
   present on the remote before this line was written, not after. 1,159
   becomes 1,179 with **zero** skips, which is the more interesting half: the
   11 that used to skip were the only tests that could demonstrate the
   isolation Cadence claims, and they had never executed anywhere.

   2026-08-07: this pin held 1,179 @ `2295044` while the case file's receipt
   read 1,185 and the case file's own architecture figure read 1,159 — one
   number, three values, every gate green, because `check-figures.mjs`'s
   `Cadence · suite` entry had no `manifest:` key and could not see this
   file. That hole is now closed the same way Applied's was. Re-measured and
   re-pinned at `dbabc74` — cadence main, CI run 31222343049: 635 frontend
   across 58 files + 550 backend across 25, 0 skipped. The six-test
   difference from 544 is the backend work that landed since `2295044`.

   2026-08-08: 1,185 became 1,186 the same day, and the extra test is the
   point. Exercising the live app found GET /api/tags returning 500 for every
   user — TagService selected two columns `tags` has never had — so the fix
   ships with a regression test that runs the service against the REAL schema
   in a real Postgres. The count moves because the suite genuinely grew, and
   the pin moves with it to `abaaea8`. */
const CADENCE_SUITE_SHA = "abaaea8";
/* Moved off c6e5c0b on 2026-08-03. Not because the old pin was wrong — 3.5×
   holds at both — but because that commit predates the correction BENCHMARKS.md
   now carries: the "sub-percent variance" line was never measured, the harness
   the docs told you to run recorded no repetitions at all, and the reference
   machine changed from a fanless MacBook Air to the M1 Pro. Pinning to the
   commit that ADMITS all that is stronger than pinning to one that does not. */
const FAST_MNIST_SHA = "001e9b4";
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
    label: "305 backend tests, 0 skipped",
    claim:
      "The Applied backend suite passes 305 tests with nothing skipped, including the Postgres row-level-security module that used to skip and had never executed anywhere.",
    /* Spelled out rather than interpolated from APPLIED_SUITE_SHA on purpose:
       check-proof-manifest.mjs reads `source` as a plain literal (:44) so it
       can compare the sha in the URL against the sha in `sourceLabel`, which
       IS a template. Interpolating both would make the two agree by
       construction and retire the check. */
    source: "https://github.com/yadava5/applied/tree/71b74f8/backend/tests",
    sourceLabel: `backend/tests @ ${APPLIED_SUITE_SHA}`,
    verification:
      "`pytest tests -q` against this head on 2026-08-07, read off backend-ci run 31152038153 rather than a local venv: 305 passed, 0 skipped. The zero is the part worth reading. This entry previously said “278 passed, 10 skipped”, and named the skips as the Postgres RLS module, which “needs a live database URL and gets one from no workflow” — an accurate description of tests that had therefore never run: not in CI, not locally, not once. They were the only tests capable of demonstrating the isolation this project claims. They now start their own postgres:16 through testcontainers when JOBTRACKER_TEST_PG_ADMIN_URL is absent, creating a non-superuser app role, which is the part that makes RLS mean anything since policies do nothing against a superuser. The remaining 17 of the 27-test increase are the CORS origin-policy suite (10) and the classifier-benchmark layer guard (7). Counts move with their commit: 271 at 36a2f54, 278 at 03fc5c4, 305 at a0d77a1 and 305 still here — each true when taken, and each taken at a commit a reader can open. The pin moved to 71b74f8 on 2026-08-07 without the count moving, because the case file was pinning the same 305 to 03fc5c4 — the 278 tree — and one number standing on three commits is the drift this project keeps re-learning.",
    visibility: "public",
    privacyBoundary:
      "The suite runs with a null keyring; no private email or account data is involved.",
    date: "2026-08-07",
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
       checkable, which made the omission worse rather than better.

       2026-08-08: the label stops reading "12 MCP tools" flat. The 12
       was a right count of the wrong noun — the MCP-registered subset,
       presented as the platform's whole tool surface, which is 44.

       2026-08-14: one pin, not two, and it is on main this time. The
       branch consolidation of 12 August took both of the old pins off
       main's history without touching either commit; see the comment on
       AUTOML_TOOLS_SHA above for what GitHub answers today. Both counts
       were re-taken at main's head and neither moved. */
    id: "automl-mcp-tools",
    label: "44 agent tools — 12 over MCP",
    claim:
      "The Agentic AutoML backend defines 44 LLM tools across seven groups — preprocessing (14), cell (8), feature (6), training (6), data (4), package (3), UI (3). Twelve of them — the data and cell groups — are registered over MCP in one server: the notebook surface the orchestrator drives. The other 32 are function-calling definitions the LangGraph phases consume directly.",
    /* Plain literal, not interpolated — check-proof-manifest.mjs compares the
       sha in this URL against the one in `sourceLabel`, which IS a template;
       interpolating both would make them agree by construction. */
    source:
      "https://github.com/yadava5/ai-augmented-auto-ml-toolchain/blob/5e42233/backend/src/services/llm/tools/index.ts",
    sourceLabel: `tools/index.ts @ ${AUTOML_TOOLS_SHA}`,
    verification:
      "Both counts taken in source at `5e42233` — “ci: core lint/test/build validation on main”, 2026-08-12 — which is ON main rather than merely resolving: `compare/main...5e42233` answers `behind`, and this site's link gate now asserts exactly that for every pinned commit it carries, on every run. The MCP subset: 12 `server.registerTool(` call sites in backend/src/services/mcp/mcpServer.ts, in source order list_project_files, get_dataset_profile, get_dataset_sample, search_documents, list_cells, read_cell, write_cell, edit_cell, run_cell, delete_cell, reorder_cells, insert_cell; there is no second MCP server — `registerTool` appears nowhere else in backend/src or frontend/src — so 12 is the whole MCP registry. The tool surface: backend/src/services/llm/tools/ defines 44 tools across seven files — preprocessingTools 14, cellTools 8, featureTools 6, trainingTools 6, dataTools 4, packageTools 3, uiTools 3 — listed by name and de-duplicated globally with zero collisions. The plumbing explains both numbers: tools/index.ts assembles only DATA + CELL + PACKAGE into LLM_TOOL_DEFINITIONS, mcpServer.ts registers DATA (4) + CELL (8) = 12 of those, and the remaining 32 are passed as toolDefinitions by the LangGraph phases themselves — backend/src/services/workflows/phases/training.ts:148 and phases/featureEngineering.ts:208 return the lifecycle sets, and phaseRequestBuilder.ts:1095 passes LLM_TRAINING_LIFECYCLE_TOOLS. Two prior errors are recorded rather than quietly repaired. From 2026-08-02 to 2026-08-08 this entry presented the subset as the total: a reproducible count, reproduced at six refs, of the wrong noun. And from 2026-08-08 to today it pinned `5c5b762` and `e506c91`, both of which the 12 August branch consolidation left off main — GitHub now answers `compare/main...` for each with 404, “No common ancestor” — while every link went on resolving. No count changed at any point: tools/index.ts is blob 83f05ee at all three refs.",
    visibility: "public",
    privacyBoundary: "No private data — the tool registry is public source.",
    date: "2026-08-14",
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
    label: "1,186 tests, 0 skipped",
    claim:
      "Cadence runs 1,186 tests — 635 frontend + 551 backend — with nothing skipped, including the row-level-security suite that had never executed anywhere.",
    /* Plain literal, not interpolated — see the note on jobtracker-backend-tests
       above: the gate cross-checks this URL's sha against sourceLabel's. */
    source: "https://github.com/yadava5/cadence/tree/abaaea8",
    sourceLabel: `cadence @ ${CADENCE_SUITE_SHA}`,
    verification:
      "Read off CI at this head on 2026-08-08 — GitHub Actions run 31233308044 on `main`, all five jobs green: the Frontend Tests job reports 635 passing across 58 files, the Backend Tests job 551 across 25, and the skip count is zero. The change worth reading is that zero. The 11 skips this entry previously reported were the Postgres row-level-security module — the only tests capable of demonstrating the isolation Cadence claims — and they had never run: not in CI, not locally, not once, because they wait on an RLS_TEST_PG_ADMIN_URL that no workflow set. They now start their own postgres:16 through testcontainers when the variable is absent, creating a non-superuser app role, which is the part that makes RLS mean anything since policies do nothing against a superuser. CI additionally fails if the suite reports any skip, because a skipped security test and a passing one render as the same green tick. Both the count and the commit moved together, and the commit was confirmed present on the remote before this pin was written: 1,145 at 69a59e7, then 1,159 at 8eee84e, then 1,179 at 2295044, then 1,185 at dbabc74, now 1,186 here. CI is deliberately the instrument rather than a local run: it is the only place the zero is *proved* rather than asserted, because the workflow fails on any skip, and each of the two earlier drifts of this number began with a local backend run that skipped and still went green.",
    visibility: "public",
    privacyBoundary: "No private data.",
    date: "2026-08-07",
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
    source: "https://github.com/yadava5/glyph/blob/001e9b4/BENCHMARKS.md",
    sourceLabel: `BENCHMARKS.md @ ${FAST_MNIST_SHA}`,
    verification:
      "Three independent measurements now stand behind the 3.5×, taken on different machines with different repetition counts: 3.504× (Dec 2025, 1 repetition), 3.570× (2026-08-02, 10 repetitions) and 3.536× (20 repetitions). The pin moves off c6e5c0b for a reason — that commit predates a correction the document now carries. BENCHMARKS.md used to claim variance was “small enough (sub-percent on a quiet machine) that we don’t publish confidence intervals”, and nothing supported it: the harness the docs told you to run passed no --benchmark_repetitions, so every committed record said `repetitions: 1` with no aggregates and there was no stddev anywhere to check against. Measured, the claim is right about the kernels it matters for and wrong as a blanket statement — the dot family is 0.1–0.4% even at load_avg 4.70, while benchAxpy/256 reaches 4.3%. The reference machine also changed: the December runs carry `Shrees-MacBook.local` and were taken on a fanless MacBook Air with roughly half the performance cores, which for an OpenMP SCALING number measures a different machine's ceiling rather than a noisier version of the same one. The attribution was checked rather than assumed: on arm64 the `baseline` and `native` binaries are byte-identical — same md5 — because -march=native is an x86 flag clang does not act on here, so the NEON path is in both and the entire gain is parallelism. That is why the “SIMD alone” figure sits at ~1.0: it compares a binary with itself.",
    visibility: "public",
    privacyBoundary: "No private data.",
    date: "2026-08-03",
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
      "Run, not read: `mvn -DskipTests=false test` on JDK 25.0.3 against this commit on 2026-08-02, and the surefire XML summed across all five test classes gives tests=72 errors=0 skipped=0 failures=0. This entry names the test tree rather than the README status line it used to cite, because a status line is prose about a run and the tree is the run's subject. Re-verified 2026-08-03 under `mvn verify`, which now also emits a JaCoCo report: still 72/0/0/0. That sentence used to end “the repository has no CI, so this local run is the only execution record that exists” — no longer true, and the correction is the interesting part: CI runs the suite on every push and sums the same surefire XML, so the count is now reproducible by anyone from a run record rather than from this paragraph.",
    visibility: "public",
    privacyBoundary: "No private data.",
    date: "2026-08-03",
  },
  {
    id: "coverage-measured",
    label: "coverage measured, five repos",
    claim:
      "Line coverage is measured, not asserted, across five repositories: Glyph 88.9%, jetpack 68.1%, Cadence backend 67.1%, AutoML 67.4%, Applied 53%.",
    source:
      "https://github.com/yadava5/applied/blob/37dd805/.github/workflows/backend-ci.yml",
    sourceLabel: "applied .github/workflows/backend-ci.yml @ 37dd805",
    verification:
      "Every figure produced by running the suite, each with its command recorded beside it: Glyph `tools/coverage.sh` (clang source-based instrumentation + llvm-cov), jetpack `mvn verify` (JaCoCo 0.8.13), Cadence `vitest --coverage` (v8), Applied `pytest --cov`. AutoML's 67.4% was measured during the provenance audit against a documented claim of 97% — that gap is why this row exists at all. The blended totals are the least informative way to read them and are broken out per package for exactly that reason: jetpack's SIMD `vector` package, which is the reason that project exists, is at 98.9% while an untested CLI argument parser drags the average to 68.1%; Applied's deployed `cloud` layer is at 82.2%, `auth` 80.5%, `database` 76.6%, while `jobtracker/scripts` is 2,240 statements at 33.7%. Applied's figure is read from its own CI, which runs `pytest tests -q --cov=jobtracker` on every push: 8,210 statements, 3,865 missed, 53%, from 305 tests with 0 skipped including all ten database-level RLS tests against a real postgres:16. The same command in the project's Python 3.11.14 venv on this machine gives 3,844 missed — 21 lines, 0.26pp — and the difference is the platform, not the test selection, since CI's run collects the identical 305. The CI number is the one quoted here because it is the one a reader can open. Three earlier readings disagreed (52.6%, 53.2%, 55.1%) and only one was right: the spread is the Python version, not the tests. Under PEP 649, 3.14 stops emitting line events for annotation-only class attributes, so the same tree measures 8,018 statements there against 8,210 on 3.11 — a 192-statement gap across 13 Pydantic models. This row previously said 54% and cited a README, which its own rule forbids, and its source field pointed at Glyph's coverage.sh — a different repository. An earlier claim of 61% excluding one-off scripts is dropped rather than restated: the loose exclusion reaches 60.50% only by removing 1,234 statements of code that CI invokes directly as gates, which is not a one-off script by any reading. Cadence's frontend reads 18.0% lines against 67.1% branches — the signature of logic that is unit-tested thoroughly with the components around it covered by Playwright, which a v8 pass over a Vitest run cannot observe; no line-coverage gate is set there, because such a gate pushes work toward shallow component tests that raise the number and find nothing. jetpack gates at 55% in CI, deliberately BELOW its measured 68.1%: a floor pinned at the current value turns every honest refactor red, and what it guards is a collapse — the coverage agent silently detaching and reporting near zero — not a two-point drift. Negative-tested by raising that floor to 95%: fails, exit 1.",
    visibility: "public",
    privacyBoundary:
      "No private data — coverage is computed from the projects' own test suites.",
    date: "2026-08-03",
  },
  {
    id: "openssf-scorecard",
    label: "Scorecard, scored by the OpenSSF",
    claim:
      "Seven repositories are analysed weekly by OpenSSF Scorecard against 18 supply-chain checks, with results published by the OpenSSF at scorecard.dev. Read 2026-08-10: Glyph 6.6, Cadence 5.5, Applied 5.4, LifeQuest 4.9, VisualAssist 4.6, jetpack-compress 4.3, AutoML 3.5.",
    source: "https://scorecard.dev/viewer/?uri=github.com/yadava5/glyph",
    sourceLabel: "scorecard.dev · yadava5/glyph",
    verification:
      "Read from api.securityscorecards.dev on 2026-08-10, not from a badge image, all seven in one pass: Glyph 6.6, Cadence 5.5, Applied 5.4, LifeQuest 4.9, VisualAssist 4.6, jetpack-compress 4.3, AutoML 3.5. THE PREVIOUS READING WAS 2026-08-03 AND SIX OF THE SEVEN HAVE SINCE MOVED — Glyph 7.0→6.6, Cadence 4.5→5.5, Applied 4.5→5.4, LifeQuest 3.9→4.9, jetpack-compress 3.8→4.3, AutoML 3.6→3.5, with only VisualAssist unchanged at 4.6. Five of those six moved UP, so the stale row was under-claiming five repositories and over-claiming one; a figure going stale in the flattering direction is the one people notice, and it is not the common case. The movement is recorded rather than overwritten because the row below promises exactly that: the direction over time is the thing worth reading, and a number silently replaced by a newer number cannot show a direction. Two caveats on comparing the pairs. The API also reports the Scorecard version that produced each score, and it is not uniform across the estate — Cadence, Applied, LifeQuest and jetpack-compress were scored by v5.5.0 while Glyph, VisualAssist and AutoML were still on v5.3.0 — so part of a week-to-week delta can be the instrument rather than the repository, and none of these deltas should be read as an effect of a specific commit. And the seven-day gap is shorter than the weekly analysis cycle for some repos, so a pair can be identical simply because it was not re-scored. An earlier revision of this row said Glyph 6.4 and linked ?uri=github.com/yadava5/fast-mnist-nn. Both were wrong in the same way: fast-mnist-nn is the repository's RETIRED name, and Scorecard keeps a separate record under it, frozen at 2026-07-20 — so the link resolved 200, served a real score, and the score was a month-old reading of a repo that had since been renamed and improved. A receipt that returns 200 is not thereby a correct receipt, and this one survived review precisely because it did. This is the only row in this ledger whose number the author does not compute. Scorecard is run by the OpenSSF against a public repository and published at a public URL, so anyone can re-read it and, unlike every other entry here, disagree with it using the same instrument. That is also why it carries no `sourceKind` qualifier: those mark evidence that sits closer to the author, and this sits further away than anything else on the page. The scores are modest and are meant to be read that way. Several of the 18 checks grade repository SETTINGS — branch protection, signed releases, required review — that no committed file can switch on, so a correctly configured repo still opens in the 3–5 band. The figure to watch is the direction over time, not the first reading; it is recorded here precisely so that later movement is checkable against a stated starting point.",
    visibility: "public",
    privacyBoundary:
      "No private data — Scorecard reads public repository metadata only.",
    date: "2026-08-03",
  },
];
