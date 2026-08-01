import { Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { personalInfo, socialLinks } from "../../src/lib/data/personal";
import { experiences } from "../../src/lib/data/experience";
import {
  getFeaturedProjects,
  getProjectsByCategory,
  getPublicProjects,
  projects,
} from "../../src/lib/data/projects";
import {
  caseStudyIds,
  projectCaseStudies,
} from "../../src/lib/data/projectCaseStudies";
import { PROJECT_SCENE_MANIFEST } from "../../src/components/scenes/manifest";

// The multi-theme system was removed (a single identity ships). These
// remain as static fixtures so the suite compiles; there is no theme switcher.
export const DEFAULT_THEME = "daylight-study";
export const THEME_IDS = [DEFAULT_THEME];
export const THEMES = [{ name: DEFAULT_THEME, label: "Daylight Study" }];
export const CASE_STUDY_IDS = caseStudyIds;

// The seven working-paper chapters (data-chapter 01–07), in storyboard order.
export const NAV_SECTIONS = [
  "arrival",
  "who",
  "path",
  "automl",
  "work",
  "values",
  "gate",
];

export const PUBLIC_PROJECTS = getPublicProjects();
export const FEATURED_PROJECTS = getFeaturedProjects();
export const PROJECT_CATEGORIES = Array.from(
  new Set(projects.map((project) => project.category))
);
export const CATEGORY_PROJECTS = PROJECT_CATEGORIES.flatMap((category) =>
  getProjectsByCategory(category)
);
export const PUBLIC_PROJECT_TITLES = PUBLIC_PROJECTS.map(
  (project) => project.title
);
export const PUBLIC_PROJECT_IMAGES = PUBLIC_PROJECTS.map(
  (project) => project.image
);

function visualDisclosureLabel(imageKind: string) {
  if (imageKind === "real-screenshot") return "Project visual:";
  if (imageKind === "diagram") return "Architecture diagram:";
  return "Representative visual:";
}

// Living scenes (src/components/scenes): a registered scene replaces the
// static fig. 1 image on that project's case file, and its HONEST
// disclosure comes from the scene manifest instead of the image data.
function projectVisual(project: (typeof PUBLIC_PROJECTS)[number]) {
  const scene = PROJECT_SCENE_MANIFEST[project.id];
  return {
    id: project.id,
    title: project.title,
    image: project.image,
    imageKind: project.imageKind,
    disclosureLabel: visualDisclosureLabel(project.imageKind),
    disclosure: scene ? scene.disclosure : project.imageDisclosure,
    hasScene: Boolean(scene),
  };
}

export const PUBLIC_PROJECT_VISUALS = PUBLIC_PROJECTS.map(projectVisual);

export const FEATURED_PROJECT_VISUALS = FEATURED_PROJECTS.map(projectVisual);

export const CASE_STUDY_PROJECT_TITLES = projectCaseStudies
  .map((study) => {
    return projects.find((project) => project.id === study.projectId)?.title;
  })
  .filter((title): title is string => Boolean(title));

// The project records the HOME paper actually surfaces (ch04 flagship +
// the four ch05 rows + the "cited above, argued in full" index — headed
// "also on file" until the certification round's D6). Visual Assist was
// retired from home 2026-07-24 (portfolioVisible: false — its case file
// stays reachable from /evidence); jetpack-compress holds a row but has
// no case route yet. Cadence moved index → prime row and automl left
// the index (it IS the flagship) in the same-day dedupe ruling, so the
// surfaced set is unchanged.
// 2026-07-26: LifeQuest joins. It is `featured: true` and live, and it
// had no surface on the home paper at all — the set this list asserts
// was silently short one live project. It now holds ¶05's second index
// line ("also live, without a case file —"), external-linked because it
// has no case route. Adding it here is what makes the omission
// impossible to reintroduce quietly.
export const EXPECTED_HOME_PROJECT_TITLES = [
  "Agentic AutoML Platform",
  "Applied",
  "Glyph",
  "jetpack-compress",
  "Cadence",
  "Master Inventory Pipeline",
  "PolicyBot",
  "LifeQuest",
];

// System Cards (2026-07-26). Every live app serves an interactive
// architecture-and-evidence card at `<liveUrl>/system-card`; the
// portfolio is the hub that links landing · live app · that card, and
// the third of the three had no link anywhere on this site.
//
// The id list is written out rather than derived from the data it
// checks: a fixture computed from `projects.systemCardUrl` would agree
// with the data by construction and could never catch a project losing
// its card. This one fails if any of the six goes quiet.
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
// The two that carry the link on the HOME paper. The other four fold it
// into their case file's meta ledger, which is the same discipline F40
// applied to `source` and `demo ↗`: a row with a case file does not
// repeat that file's terminals in ¶05's rail.
export const SYSTEM_CARD_HOME_IDS = ["jetpack-compress", "lifequest"];

export const CASE_STUDY_LOCAL_ARTIFACTS = projectCaseStudies.flatMap((study) =>
  study.artifacts
    .filter((artifact) => !artifact.href.startsWith("http"))
    .map((artifact) => ({
      projectId: study.projectId,
      label: artifact.label,
      href: artifact.href,
      type: artifact.type,
    }))
);

export const CURRENT_EXPERIENCE = experiences[0];

export const COMPANY_LOGOS = experiences.map((experience) => experience.logo);

export const EXPECTED_CONTENT = {
  name: personalInfo.name,
  email: personalInfo.email,
  location: personalInfo.location,
  graduation: "May 2026",
};

// The masthead (header round 9, owner-approved candidate D): the h1
// mantle passed from the dare to the AUTHOR — the nameplate
// "Ayush Yadav", ten per-character spans (five of them machines), the
// aria-label carrying the one honest name. The claim keeps its words
// ("Scroll. It’s all real.¹", U+2019, fix round 3 S1) in a deck-scale
// paragraph beneath the place-line, and the standfirst's name moved
// INTO the h1 — the place-line keeps discipline · city (F02's
// first-frame identity now leads the page at nameplate scale).
//
// The fixture moved because the PAGE moved — this is the deliberate
// spec update the round-9 brief requires recorded, not a drift.
export const EXPECTED_MASTHEAD = {
  ariaLabel: "Ayush Yadav",
  claimLines: ["Scroll.", "It’s all real."],
  standfirst: "software engineer · Cincinnati, Ohio",
};

export const EXPECTED_GRADUATE_IDENTITY = {
  // The hero byline retired with the masthead rewrite (owner ruling,
  // 2026-07-24) and returned as the STANDFIRST (F02, 2026-07-25): the
  // first frame states who this is and what he does. Identity is now
  // the standfirst + the header running head + the #path records below.
  // N5 (certification round): this was ONE string, and the page printed
  // it twice on the same row — as the h3, and again as the run-in to
  // the prose 20px under it. The prose dropped the echo, so the record
  // now reads in two registers: the heading names the degree, the line
  // under it dates it and states what followed. Both are asserted, so
  // neither half can quietly go missing.
  education: "B.S. Computer Science",
  educationRecord: "May 2026 — dean’s list, fall 2023 & spring/fall 2025",
  availability: "Open to new-grad software, data, and ML engineering roles",
  portraitAlt: "Ayush Yadav professional portrait",
  experienceTitle: experiences[0].title,
  // Fix round 3, S13: date ranges set with an EN DASH sitewide
  // (experience.formatDateRange) — the site already used one in the
  // case files for this same role, and the hyphen was the odd grammar.
  recentExperienceRange: "Jun 2025 – May 2026",
};

// Storyboard order: the flagship chapter (04) leads, then the Ch-05 rows.
// Third slot swapped Visual Assist → jetpack-compress (2026-07-24): the
// six live showcase projects hold the prime rows; visual-assist is
// retired (portfolioVisible: false) and keeps its case-file route.
// Fourth row added (dedupe ruling, 2026-07-24): Cadence promotes from
// the demoted index to a prime row — its scene was already registered, and
// a project appears ONCE on the home paper (automl left the index too:
// it IS the ch04 flagship).
export const EXPECTED_SELECTED_WORK_ORDER = [
  "Agentic AutoML Platform",
  "Applied",
  "Glyph",
  "jetpack-compress",
  "Cadence",
];

// Ch-05 editorial rows: each row links to its case file — or, for
// jetpack-compress (no case file yet), to the live engine — and carries
// its real proof-backed metric line (no vague capability copy).
export const EXPECTED_WORK_ROWS = [
  {
    title: "Applied",
    href: "/projects/jobtracker/",
    metric: "macro-f1 0.98 — 96-sample gate",
  },
  {
    // SIMD-attribution reword (2026-07-18): the 3.5x is the openmp+simd
    // parallel configuration vs the -O3 baseline, per BENCHMARKS.md.
    title: "Glyph",
    href: "/projects/fast-mnist-nn/",
    metric:
      "openmp+simd dot kernel — 3.5× vs -O3 baseline, committed benchmarks",
  },
  {
    // jetpack-tests manifest entry: 72 tests / 0 failures on JDK 25 at
    // the pinned public commit. External href — no case route exists.
    title: "jetpack-compress",
    href: "https://jetpack-compress.vercel.app",
    metric: "72 tests, 0 failures — jdk 25 @ af2c4b1",
  },
  {
    // taskflow-tests manifest entry: 634 frontend + 511 backend = 1,145
    // passing (vitest); the chip cites the case file's receipt 01.
    title: "Cadence",
    href: "/projects/taskflow-calendar/",
    metric: "1,145 automated tests — 634 frontend + 511 backend, vitest",
  },
];

export const EXPECTED_PROOF_ARTIFACTS = {
  automlPoster: "Expo poster proof",
  automlPresenterProof: "Presenter stack proof",
  automlPresenterEvidence:
    "Presenter slide 8 records the stack and validation posture",
  automlContribution: "Monaco/Jupyter runtime",
  jobtrackerArchitecture: "Local classification architecture",
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
  jobtrackerBackendCoverage:
    "271 tests passed, 10 skipped, under the test/null-keyring environment",
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
  jobtrackerStaleDocsBoundary:
    "Both still describe apps/web as an unwired scaffold with a placeholder dashboard",
  visualAssistArchitecture: "On-device accessibility architecture",
  visualAssistReadme: "README beta and LiDAR requirements",
  visualAssistTests: "XCTest source evidence",
  // Dossier voice rewrite (2026-07-18): first person, same fact/number.
  visualAssistCoverage: "71 test functions cover models and utilities",
  visualAssistCoreMlBoundary: "no custom Core ML model file was present",
  fastMnistScreenshot: "Local React workbench screenshot",
  fastMnistRelease: "v1.0.0 release",
  fastMnistBenchmark: "Benchmark evidence",
  // SIMD-attribution reword (2026-07-18): honest form per BENCHMARKS.md.
  fastMnistSpeedup:
    "openmp+simd dot kernel is 3.5× faster than the -O3 baseline",
  fastMnistDisclosure:
    "Real local web workbench screenshot; native inference server was offline during capture, so benchmark claims are sourced from committed benchmark data.",
  masterInventoryRows:
    "3,731 Tableau rows and 6,743 Workday rows consolidated into a 10,453-row deduplicated master_inventory.csv.",
  masterInventorySchema: "35-field unified schema",
  masterInventoryTests:
    "passed 3 extractor tests and critical ruff syntax/import checks",
  masterInventoryPrivateBoundary:
    "raw CSV rows, owners, report names, PAT values, and institutional exports stay private.",
  masterInventoryProofLedger: "Processed output proof ledger",
  policybotValidation:
    "19/20 latest structured sweep, a 17/25 keyword sweep, 4 honest fallbacks",
  policybotFileSearch:
    "OpenAI Responses API with File Search, cited filenames, and local quote verification",
  policybotLocalTests:
    "passed 3 Slack adapter/formatting tests in a temporary audit virtualenv",
  policybotDeploymentBoundary:
    "no production usage, workspace adoption, or always-on service claim is made here.",
  policybotValidationLedger: "Validation ledger proof",
  // Cadence's isolation section (2026-07-26). The file went from three
  // receipts to ten, and the seven new ones argue the portfolio's
  // strongest systems claim — which makes them the ones most worth
  // asserting, because an overstated security claim is the most
  // expensive kind to be wrong about.
  //
  // Four strings, chosen as the load-bearing ones: the bug, the number,
  // and the two limits without which the number reads as more than it
  // is. `cadenceInertBoundary` and `cadenceRoleBoundary` follow exactly
  // the jobtracker* boundary keys added in the re-pin round — a claim
  // and the limits that keep it honest are asserted together, so a
  // future edit cannot keep the claim and drop the limit.
  // e51395b (2026-07-30): the count was stale at seven — the page now
  // says eight across nine endpoints (the erratum carries the story).
  // This fixture was pinning the RETRACTED number in place: the exact
  // failure mode the correction's own prose warns about.
  cadenceIdorReceipt: "I found and fixed 8 IDOR vulnerabilities across 9 endpoints",
  cadenceIsolationTests:
    "11 of 11 isolation tests pass against a real Postgres",
  cadenceInertBoundary: "The DB-enforced RLS is not turned on in production",
  cadenceRoleBoundary: "which role the production DATABASE_URL actually uses",
};

export const EXPECTED_LINKS = {
  github: socialLinks.find((link) => link.name === "GitHub")?.url,
  linkedin: socialLinks.find((link) => link.name === "LinkedIn")?.url,
  resume: personalInfo.resumeUrl,
};

export const ATLAS_ALLOWED_METRICS = [
  "1M+",
  "3.5×",
  "19/20",
  "7-phase",
  "0.9791",
];

// Header CTAs: text nav + github (surfaced early for screeners) + the
// single filled resume chip. LinkedIn stays at the gate and footer. On
// phones the "contact" text item collapses to the mail icon (aria-label
// "Contact") so a screener always has a contact affordance in reach.
// Below ~420px the header rebalances (avatar shrinks then drops, resume
// slims) so the "ayush yadav" wordmark never ellipsizes at 320–420px.
// Fix round 3, S7: the masthead's `github` is the one item in this row
// that leaves the site, and it now carries the house leaving glyph `↗`
// inside its text — so it is inside the accessible name this fixture
// asserts. The spec moved because the site's glyph contract (F41) was
// finally applied to every external link instead of most of them.
export const RECRUITER_HERO_LINKS = [
  "the work",
  "experience",
  "contact",
  "github ↗",
  "Resume (opens in a new tab)",
];
export const RECRUITER_HERO_LINKS_MOBILE = [
  "the work",
  "Contact",
  "Resume (opens in a new tab)",
];

// The proof metrics must EXIST on the homepage; they live in the chapters
// where their stories are told (03 the path, 04 automl, 05 work). The
// #values litany cites DIFFERENT real receipts (182 backend tests) so no
// number reads twice verbatim — 0.9791's home is the #work row.
export const RECRUITER_HERO_METRICS = [
  "1M+",
  "3.5×",
  "19/20",
  "7-phase",
  "0.9791",
];
export const METRIC_HOME_CHAPTER: Record<string, string> = {
  "1M+": "#path",
  "19/20": "#path",
  "7-phase": "#automl",
  "3.5×": "#work",
  "0.9791": "#work",
};

export const REQUIRED_PRIVATE_CASE_STUDIES = [
  "automl",
  "master-inventory",
  "policybot",
];

export const PLAYWRIGHT_ARTIFACT_ROOT = path.join("output", "playwright");

export async function artifactPath(...segments: string[]) {
  const targetPath = path.join(PLAYWRIGHT_ARTIFACT_ROOT, ...segments);
  await mkdir(path.dirname(targetPath), { recursive: true });
  return targetPath;
}

export function absoluteUrl(page: Page, assetPath: string) {
  return new URL(assetPath, page.url()).toString();
}

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

export async function isMobileViewport(page: Page) {
  const viewport = page.viewportSize();
  return viewport ? viewport.width < 768 : false;
}

// Theme switching no longer exists (a single Atlas identity ships). These
// helpers now just wait for the page to become interactive. `theme` is accepted
// for call-site compatibility and applied as an inert data attribute.
export async function applyThemeState(
  page: Page,
  theme: { name: string; label: string }
) {
  await page.waitForLoadState("domcontentloaded");
  await page.locator("main").waitFor({ state: "attached", timeout: 10000 });
  await page.evaluate((themeName) => {
    document.documentElement.setAttribute("data-theme", themeName);
  }, theme.name);
  await page
    .locator('#who, [data-beat="1"]')
    .first()
    .waitFor({ state: "attached", timeout: 20000 });
  await page.waitForTimeout(200);
}

export async function switchThemeViaUiAndWait(
  page: Page,
  theme: { name: string; label: string }
) {
  await applyThemeState(page, theme);
}

export async function switchThemeAndWait(
  page: Page,
  theme: { name: string; label: string }
) {
  await applyThemeState(page, theme);
}

export async function scrollThroughPage(page: Page) {
  const totalHeight = await page.evaluate(
    () => document.documentElement.scrollHeight
  );
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const steps = Math.ceil(totalHeight / (viewportHeight * 0.6));

  for (let i = 0; i <= steps; i++) {
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      i * viewportHeight * 0.6
    );
    await page.waitForTimeout(150);
  }

  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(300);
}
