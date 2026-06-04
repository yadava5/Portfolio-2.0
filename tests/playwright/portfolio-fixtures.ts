import { expect, Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { themeConfigs, themeIds } from "../../src/config/themes";
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

export const THEMES = themeIds.map((id) => ({
  name: id,
  label: themeConfigs[id].label,
}));

export const THEME_IDS = themeIds;
export const DEFAULT_THEME = "technical-operations-atlas";
export const CASE_STUDY_IDS = caseStudyIds;

export const NAV_SECTIONS = [
  "about",
  "experience",
  "projects",
  "skills",
  "testimonials",
  "contact",
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
  title: project.title,
  image: project.image,
  imageKind: project.imageKind,
  disclosureLabel: visualDisclosureLabel(project.imageKind),
  disclosure: project.imageDisclosure,
}));

export const FEATURED_PROJECT_VISUALS = FEATURED_PROJECTS.map((project) => ({
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

export const CURRENT_EXPERIENCE = experiences[0];

export const COMPANY_LOGOS = experiences.map((experience) => experience.logo);

export const EXPECTED_CONTENT = {
  name: personalInfo.name,
  email: personalInfo.email,
  location: personalInfo.location,
  graduation: "May 2026",
};

export const EXPECTED_GRADUATE_IDENTITY = {
  role: "New-grad software engineer",
  education: "B.S. Computer Science, Miami University, May 2026",
  availability: "Open to new-grad software, data, and ML engineering roles",
  portraitAlt: "Ayush Yadav professional portrait",
};

export const EXPECTED_SELECTED_WORK_ORDER = [
  "Agentic AutoML Platform",
  "Fast MNIST Neural Network",
  "Visual Assist",
  "JobTracker",
];

export const EXPECTED_PROOF_ARTIFACTS = {
  automlPoster: "Expo poster proof",
  automlContribution: "Monaco/Jupyter runtime",
  fastMnistRelease: "v1.0.0 release",
  fastMnistBenchmark: "Benchmark evidence",
};

export const EXPECTED_LINKS = {
  github: socialLinks.find((link) => link.name === "GitHub")?.url,
  linkedin: socialLinks.find((link) => link.name === "LinkedIn")?.url,
  resume: personalInfo.resumeUrl,
};

export const ATLAS_ALLOWED_METRICS = [
  "1.9M+",
  "738",
  "97%+",
  "3.5x",
  "71 tests",
  "19/20",
];

export const RECRUITER_HERO_LINKS = ["Resume", "GitHub", "LinkedIn", "Contact"];

export const RECRUITER_HERO_METRICS = ["1.9M+", "738", "71", "19/20"];

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
  "Python/SQL pipeline processing 1M+",
  "Processes 1M+ rows of operational data",
];

export async function isMobileViewport(page: Page) {
  const viewport = page.viewportSize();
  return viewport ? viewport.width < 768 : false;
}

export async function applyThemeState(
  page: Page,
  theme: { name: string; label: string }
) {
  await page.waitForLoadState("domcontentloaded");
  await page.locator("main").waitFor({ state: "attached", timeout: 10000 });
  await page.waitForTimeout(200);

  const currentTheme = await page.locator("html").getAttribute("data-theme");
  if (currentTheme === theme.name) {
    await page.locator("#about").waitFor({ state: "attached", timeout: 20000 });
    return;
  }

  await page.evaluate((themeName) => {
    window.localStorage.setItem("portfolio-theme", themeName);
    document.documentElement.setAttribute("data-theme", themeName);
  }, theme.name);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("main").waitFor({ state: "attached", timeout: 10000 });
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme.name, {
    timeout: 10000,
  });
  await page.locator("#about").waitFor({ state: "attached", timeout: 20000 });
  await page.waitForTimeout(300);
}

export async function switchThemeViaUiAndWait(
  page: Page,
  theme: { name: string; label: string }
) {
  await page.waitForLoadState("domcontentloaded");
  await page.locator("main").waitFor({ state: "attached", timeout: 10000 });
  await page.waitForTimeout(200);

  const currentTheme = await page.locator("html").getAttribute("data-theme");
  if (currentTheme === theme.name) {
    await page.locator("#about").waitFor({ state: "attached", timeout: 20000 });
    return;
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));

  const switcher = page.locator("button[aria-label='Select theme']");
  await expect(switcher).toBeVisible({ timeout: 10000 });
  await switcher.click({ force: true });

  const menu = page.locator("#theme-switcher-menu");
  await expect(menu).toBeVisible({ timeout: 5000 });

  const themeButton = menu
    .locator("button[aria-pressed]")
    .filter({ hasText: theme.label });
  await expect(themeButton).toHaveCount(1);
  await themeButton.click({ force: true });

  await expect(page.locator("html")).toHaveAttribute("data-theme", theme.name, {
    timeout: 10000,
  });

  await page.locator("#about").waitFor({ state: "attached", timeout: 20000 });
  await expect(page.locator("[data-theme-transition='true']")).toHaveCount(0, {
    timeout: 5000,
  });
  await page.waitForTimeout(1300);
}

export async function switchThemeAndWait(
  page: Page,
  theme: { name: string; label: string }
) {
  if (await isMobileViewport(page)) {
    await applyThemeState(page, theme);
    return;
  }

  await switchThemeViaUiAndWait(page, theme);
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
