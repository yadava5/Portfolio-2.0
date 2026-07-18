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

export const PUBLIC_PROJECT_VISUALS = PUBLIC_PROJECTS.map((project) => ({
  id: project.id,
  title: project.title,
  image: project.image,
  imageKind: project.imageKind,
  disclosureLabel: visualDisclosureLabel(project.imageKind),
  disclosure: project.imageDisclosure,
}));

export const FEATURED_PROJECT_VISUALS = FEATURED_PROJECTS.map((project) => ({
  id: project.id,
  title: project.title,
  image: project.image,
  imageKind: project.imageKind,
  disclosureLabel: visualDisclosureLabel(project.imageKind),
  disclosure: project.imageDisclosure,
}));

export const CASE_STUDY_PROJECT_TITLES = projectCaseStudies
  .map((study) => {
    return projects.find((project) => project.id === study.projectId)?.title;
  })
  .filter((title): title is string => Boolean(title));

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

export const EXPECTED_GRADUATE_IDENTITY = {
  // Hero mono sub-line (rendered lowercase; textContent keeps source case)
  role: "ml engineer, class of 2026",
  education: "B.S. Computer Science, Miami University, May 2026",
  availability: "Open to new-grad software, data, and ML engineering roles",
  portraitAlt: "Ayush Yadav professional portrait",
  experienceTitle: experiences[0].title,
  recentExperienceRange: "Jun 2025 - May 2026",
};

// Storyboard order: the flagship chapter (04) leads, then the Ch-05 rows.
export const EXPECTED_SELECTED_WORK_ORDER = [
  "Agentic AutoML Platform",
  "JobTracker",
  "Fast MNIST Neural Network",
  "Visual Assist",
];

// Ch-05 editorial rows: each row links to its case file and carries its
// real proof-backed metric line (fix round 4 — no vague capability copy).
export const EXPECTED_WORK_ROWS = [
  {
    title: "JobTracker",
    href: "/projects/jobtracker/",
    metric: "macro-f1 0.9791 — 96-sample gate",
  },
  {
    title: "Fast MNIST Neural Network",
    href: "/projects/fast-mnist-nn/",
    metric: "3.5x dot-kernel speedup — committed benchmarks",
  },
  {
    title: "Visual Assist",
    href: "/projects/visual-assist/",
    metric: "71 xctest functions — on-device, voiceover-first",
  },
];

export const EXPECTED_PROOF_ARTIFACTS = {
  automlPoster: "Expo poster proof",
  automlPresenterProof: "Presenter stack proof",
  automlPresenterEvidence:
    "Presenter slide 8 records the stack and validation posture",
  automlContribution: "Monaco/Jupyter runtime",
  jobtrackerArchitecture: "Local classification architecture",
  jobtrackerReadme: "Source-truth README",
  jobtrackerArchitectureDocs: "Architecture docs",
  jobtrackerBackendTests: "Backend test suite",
  jobtrackerBenchmark: "ML strategy and evaluation gates",
  jobtrackerWebBeta: "Web beta scaffold",
  jobtrackerBackendCoverage: "Local source validation passed 182 backend tests",
  jobtrackerClassifierGate:
    "Rules and deterministic hybrid v3 gates both passed on 96 samples with macro-F1 0.9791.",
  jobtrackerNativeBuild: "The macOS Debug target built locally with xcodebuild",
  jobtrackerPrivacyBoundary:
    "Architecture and source links are shown publicly; private email and application records are not shown.",
  visualAssistArchitecture: "On-device accessibility architecture",
  visualAssistReadme: "README beta and LiDAR requirements",
  visualAssistTests: "XCTest source evidence",
  visualAssistCoverage:
    "Local repository audit found 71 VisualAssistTests test functions.",
  visualAssistCoreMlBoundary: "no custom Core ML model file was present",
  fastMnistScreenshot: "Local React workbench screenshot",
  fastMnistRelease: "v1.0.0 release",
  fastMnistBenchmark: "Benchmark evidence",
  fastMnistSpeedup: "3.50x dot-kernel speedup",
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
};

export const EXPECTED_LINKS = {
  github: socialLinks.find((link) => link.name === "GitHub")?.url,
  linkedin: socialLinks.find((link) => link.name === "LinkedIn")?.url,
  resume: personalInfo.resumeUrl,
};

export const ATLAS_ALLOWED_METRICS = [
  "1M+",
  "3.5x",
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
export const RECRUITER_HERO_LINKS = [
  "the work",
  "experience",
  "contact",
  "github",
  "Resume",
];
export const RECRUITER_HERO_LINKS_MOBILE = ["the work", "Contact", "Resume"];

// The proof metrics must EXIST on the homepage; they live in the chapters
// where their stories are told (03 the path, 04 automl, 05 work). The
// #values litany cites DIFFERENT real receipts (182 backend tests) so no
// number reads twice verbatim — 0.9791's home is the #work row.
export const RECRUITER_HERO_METRICS = [
  "1M+",
  "3.5x",
  "19/20",
  "7-phase",
  "0.9791",
];
export const METRIC_HOME_CHAPTER: Record<string, string> = {
  "1M+": "#path",
  "19/20": "#path",
  "7-phase": "#automl",
  "3.5x": "#work",
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
  await page.locator("#who").waitFor({ state: "attached", timeout: 20000 });
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
