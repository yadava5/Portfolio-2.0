/**
 * What the case-file suite asserts, and where it comes from.
 *
 * THIS REPLACES `portfolio-fixtures.ts`, which was 531 lines and which
 * `atlas.spec.ts` was the only surviving reader of. Measured before the cut:
 * atlas imported sixteen names from it and USED five. The other eleven — the
 * masthead, the recruiter CTA row, the chapter metrics, the theme helpers, the
 * seven-chapter nav list — belonged to the React home page, and so did three
 * local helpers in atlas itself that nothing called. All of it described a
 * page that Phase 4 deletes, and the file also imported `experience.ts` and
 * `src/components/scenes/manifest`, which go with it.
 *
 * Kept deliberately narrow: everything here is derived from
 * `src/lib/data/projectCaseStudies.ts`, which is the archive generator's own
 * source, or is a hand-written list whose whole value is that it does NOT
 * agree with the data by construction.
 */
import {
  caseStudyIds,
  projectCaseStudies,
} from "../../src/lib/data/projectCaseStudies";
import { getProjectById, projects } from "../../src/lib/data/projects";

export const CASE_STUDY_IDS = caseStudyIds;

export { getProjectById, projects };

/**
 * The six live apps that serve a system card at `<liveUrl>/system-card`.
 *
 * CARRIED OUT OF `nav-and-images.spec.ts`, which Phase 4 deletes. Its other
 * assertions were about the React home page's nav and chapter rows; this one
 * is about the data every case file's meta ledger renders a row from, so it
 * belongs with the case-file suite rather than dying with the page that used
 * to test it.
 *
 * The id list is written out rather than derived from the data it checks: a
 * fixture computed from `projects.systemCardUrl` would agree with the data by
 * construction and could never catch a project losing its card. This one fails
 * if any of the six goes quiet.
 */
export const EXPECTED_SYSTEM_CARD_IDS = [
  "jobtracker",
  "automl",
  "taskflow-calendar",
  "fast-mnist-nn",
  "lifequest",
  "jetpack-compress",
];
export const SYSTEM_CARD_PROJECTS = projects.filter(
  (project) => project.systemCardUrl
);

/**
 * The artifacts that ship as PLATES — a figure the reader can enlarge in the
 * appendix, rather than a row in the outbound index.
 *
 * The filter is the generator's, restated: `scripts/archive/render-case-file.mjs`
 * splits `study.artifacts` on exactly this condition, so a mismatch here would
 * make the suite look for a plate the page never draws. `mailto:` is excluded
 * for the same reason it is there — an artifact you request by email is an
 * index row, not something to open in a dialog.
 */
export const CASE_STUDY_LOCAL_ARTIFACTS = projectCaseStudies.flatMap((study) =>
  study.artifacts
    .filter(
      (artifact) =>
        !artifact.href.startsWith("http") &&
        !artifact.href.startsWith("mailto:")
    )
    .map((artifact) => ({
      projectId: study.projectId,
      label: artifact.label,
      href: artifact.href,
      type: artifact.type,
    }))
);

/**
 * The case files whose repository is private — `repoPin === null`, which is the
 * exact condition the generator uses to draw the PRIVATE REPOSITORY stamp.
 *
 * `automl` was on this list and had been wrong since 2026-07-30, when the
 * repository went public: `repoPin` was set, the stamp stopped rendering, and
 * the file stopped being a private one. Measured in the shipped export on
 * 2026-08-06 — `automl` carries ZERO stamps, the two below carry one each.
 *
 * It survived because the test matched the LABEL TEXT "Private proof", and
 * `automl`'s `evidenceDisclosure` still carried its sentence from the private
 * era. Two stale things propping each other up: the prose kept the test green
 * and the test kept the prose unexamined. Both are corrected now, and the
 * assertion moved onto the stamp itself so a rewording cannot hide a wrong
 * list again.
 */
export const REQUIRED_PRIVATE_CASE_STUDIES = ["master-inventory", "policybot"];

/**
 * Load-bearing strings that must be ON the case files.
 *
 * WRITTEN OUT RATHER THAN DERIVED, and that is the point of the file. A
 * fixture computed from `projectCaseStudies.ts` would agree with it by
 * construction and could never catch a claim quietly losing the limit that
 * keeps it honest. Every entry below is a claim, a number, or the boundary
 * without which the number reads as more than it is — and several of them are
 * here because an earlier edit did exactly that.
 */
export const EXPECTED_PROOF_ARTIFACTS = {
  automlPoster: "Expo poster proof",
  automlPresenterProof: "Presenter stack proof",
  automlPresenterEvidence:
    "Presenter slide 8 records the stack and validation posture",
  automlContribution: "Monaco/Jupyter runtime",
  /* `jobtrackerArchitecture: "Local classification architecture"` retired
     2026-08-07 with its plate — its `<title>` named the retired brand and a
     superseded desktop architecture, and fig. 2 draws the current one.
     `atlas.spec.ts` now asserts zero plates plus a live index here. */
  // Re-pin round (2026-07-26). Two artifact labels changed because the
  // old ones asserted something false:
  //   · "Source-truth README" — the README still calls apps/web an
  //     unwired scaffold. It is a real file at the pin and stays linked,
  //     but the page may not call a stale doc source-truth.
  //   · "Web beta scaffold" — apps/web IS the shipped product now.
  // Both keys still assert a visible artifact label; neither assertion
  // was dropped.
  jobtrackerReadme: "README — the desktop-era record",
  jobtrackerArchitectureDocs: "Architecture docs",
  jobtrackerBackendTests: "Backend test suite",
  jobtrackerBenchmark: "ML strategy and evaluation gates",
  jobtrackerWebBeta: "Web app source",
  // Dossier voice rewrite (2026-07-18): first person, same fact/number.
  // 2026-07-26: 182 → 271 (suite re-run at the new pin 36a2f54; the 10
  // skips are named in the row, so the assertion carries them too).
  // 2026-08-02: 271 → 278, re-run at the public head 03fc5c4 on the audit.
  // The skips did not move — same Postgres RLS module, same missing URL.
  jobtrackerBackendCoverage:
    "305 tests passed, 0 skipped, under the test/null-keyring environment",
  jobtrackerClassifierGate:
    "Rules and deterministic hybrid v3 gates both passed on 96 samples with macro-F1 0.9791.",
  jobtrackerNativeBuild: "The macOS Debug target built locally with xcodebuild",
  // 2026-07-26: the boundary row was rewritten when the receipts moved
  // from docs to source. Same promise, named against what is now linked.
  jobtrackerPrivacyBoundary:
    "Source, migrations, and test runs are shown publicly; private email and application records are not shown.",
  // 2026-07-26: the two boundary rows that carry the re-pin's whole
  // point. If either disappears the page is overclaiming again.
  jobtrackerRulesOnlyBoundary:
    "On Vercel it runs the rules layer only — deliberately, because the model stack does not fit the function slot.",
  // 2026-08-15: RE-RECORDED, not relaxed. The boundary row is still there
  // and still says the same thing about the same two documents; what moved
  // is its TENSE. "Both still describe …" asserted something about the
  // repository today, and the README was rewritten as the product's own
  // record — so the row was corrected to speak for the commit these
  // receipts pin, which is all it was ever entitled to claim. The fixture
  // keeps the whole distinguishing clause (scaffold + placeholder
  // dashboard); shortening it to "apps/web" would have made this
  // assertion pass on a row that no longer names the limit.
  jobtrackerStaleDocsBoundary:
    "both described apps/web as an unwired scaffold with a placeholder dashboard",
  /* `visualAssistArchitecture` retired 2026-08-07, same reason. */
  visualAssistReadme: "README beta and LiDAR requirements",
  visualAssistTests: "XCTest source evidence",
  // Dossier voice rewrite (2026-07-18): first person, same fact/number.
  // 2026-08-03: "71 test functions" became "71 tests … and all 71 pass". The
  // suite was executed for the first time — it had never run in CI or locally —
  // so the receipt stopped being a count of what the tree declares and became a
  // result. This fixture is matched on the stable head of that sentence rather
  // than the whole of it, so the runtimes can be re-stated without breaking a
  // test that is really asserting "the coverage receipt is on the page".
  visualAssistCoverage: "71 tests cover models and utilities",
  visualAssistCoreMlBoundary: "no custom Core ML model file was present",
  fastMnistScreenshot: "Deployed landing screenshot",
  fastMnistRelease: "v1.0.0 release",
  fastMnistBenchmark: "Benchmark evidence",
  // SIMD-attribution reword (2026-07-18): honest form per BENCHMARKS.md.
  // 2026-08-06: BENCHMARKS.md was the wrong authority and this string was the
  // reason nobody noticed. The run and the proof manifest had said since
  // 2026-08-03 that the 3.5× is OpenMP's — measured by building all three
  // configurations and finding the arm64 `baseline` and `native` binaries
  // byte-identical — while the case file still credited an "openmp+simd"
  // kernel, and this fixture asserted the case file's wording, so the suite
  // certified the contradiction. It went red the moment the prose was fixed,
  // which is C36 for the second time: the wrong prose kept the wrong test
  // passing and the passing test kept the prose unexamined. Paired below with
  // a NEGATIVE assertion on the retired wording, which a reword cannot defeat.
  fastMnistSpeedup:
    "The dot-256 kernel runs 3.5× faster under OpenMP than the -O3 baseline",
  fastMnistRetiredAttribution: "openmp+simd",
  masterInventoryRows:
    "3,731 Tableau rows and 6,743 Workday rows consolidated into a 10,453-row deduplicated master_inventory.csv.",
  masterInventorySchema: "35-field unified schema",
  masterInventoryTests:
    "passed 3 extractor tests and critical ruff syntax/import checks",
  masterInventoryPrivateBoundary:
    "raw CSV rows, owners, report names, PAT values, and institutional exports stay private.",
  /* `masterInventoryProofLedger: "Processed output proof ledger"` stood here
     and was retired 2026-08-07 with the plate it named. The appendix plate
     was a thumbnail of the ledger table two sections above it, drawn in a
     face this site does not load; `atlas.spec.ts` now asserts the empty
     state instead, so the guard moved rather than went away. */
  policybotValidation:
    "19/20 latest structured sweep, a 17/25 keyword sweep, 4 honest fallbacks",
  policybotFileSearch:
    "OpenAI Responses API with File Search, cited filenames, and local quote verification",
  policybotLocalTests: "passes 24 tests in its own .venv-ci on Python 3.12.11",
  policybotDeploymentBoundary:
    "no production usage, workspace adoption, or always-on service claim is made here.",
  /* `policybotValidationLedger` retired 2026-08-07, same reason. */
  // Cadence's isolation section (2026-07-26). The file went from three
  // receipts to ten, and the seven new ones argue the portfolio's
  // strongest systems claim — which makes them the ones most worth
  // asserting, because an overstated security claim is the most
  // expensive kind to be wrong about.
  //
  // Four strings, chosen as the load-bearing ones: the bug, the number,
  // and the two limits without which the number reads as more than it
  // is. `cadenceEnforcedBoundary` and `cadenceRoleBoundary` follow exactly
  // the jobtracker* boundary keys added in the re-pin round — a claim
  // and the limits that keep it honest are asserted together, so a
  // future edit cannot keep the claim and drop the limit.
  // e51395b (2026-07-30): the count was stale at seven — the page now
  // says eight across nine endpoints (the erratum carries the story).
  // This fixture was pinning the RETRACTED number in place: the exact
  // failure mode the correction's own prose warns about.
  cadenceIdorReceipt:
    "I found and fixed 8 IDOR vulnerabilities across 9 endpoints",
  cadenceIsolationTests:
    "11 of 11 isolation tests pass against a real Postgres",
  /* Renamed from cadenceInertBoundary on 2026-08-03: the boundary stopped
     being inert when the cutover ran, and a fixture named for the old state
     would have kept asserting it. */
  cadenceEnforcedBoundary: "The DB-enforced RLS is now turned on in production",
  cadenceRoleBoundary: "which role the production DATABASE_URL actually uses",
};

/**
 * Claims that were generated rather than measured, and must never reappear.
 *
 * Every one of these shipped on this site at some point. The list is the
 * residue of the provenance audits, and it is checked against the rendered
 * body text of each case file rather than against the source, because the
 * failure it guards is a sentence a reader sees.
 */
export const PROHIBITED_GENERATED_CONTENT = [
  "CUNY Brooklyn",
  "Offer Success Rate",
  "technical-operations-atlas/jobtracker",
  "hello@ayushyadav.dev",
  "Kafka",
  "ClickHouse",
  "1200+ installs",
  "10x faster",
  "50+ jobs/day",
  "500+ views in launch month",
  "Production full-stack calendar",
  "production ML pipelines",
  "5x faster inference",
  "5x with AVX-512 SIMD",
  "68 unit tests",
  "68 tests",
  "50+ institutional documents",
  "50+ docs",
  "processing 500+ emails/month",
  "500+ emails/month",
  "macOS 15+ Liquid Glass UI",
  "beautiful Liquid Glass dashboard",
  "Python/SQL pipeline processing 1M+",
  "Processes 1M+ rows of operational data",
  "16,685",
  "16.7k consolidated records",
  "Google Cloud",
  "OAS metadata",
  "GraphQL metadata extraction",
  "production dashboard",
  "production deployment",
  "active Slack workspace usage",
  "runs 24/7",
];
