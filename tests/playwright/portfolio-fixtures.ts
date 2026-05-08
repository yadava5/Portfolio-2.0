import { expect, Page } from "@playwright/test";
import { themeConfigs, themeIds } from "../../src/config/themes";
import { personalInfo, socialLinks } from "../../src/lib/data/personal";
import { projects } from "../../src/lib/data/projects";
import { caseStudyIds } from "../../src/lib/data/projectCaseStudies";

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

export const PUBLIC_PROJECTS = projects.filter((project) => !project.isPrivate);
export const PUBLIC_PROJECT_TITLES = PUBLIC_PROJECTS.map(
  (project) => project.title
);
export const PUBLIC_PROJECT_IMAGES = PUBLIC_PROJECTS.map(
  (project) => project.image
);

export const COMPANY_LOGOS = [
  "/images/companies/miami.png",
  "/images/companies/aramark.png",
];

export const EXPECTED_CONTENT = {
  name: personalInfo.name,
  email: personalInfo.email,
  location: personalInfo.location,
  graduation: "May 2026",
};

export const EXPECTED_LINKS = {
  github: socialLinks.find((link) => link.name === "GitHub")?.url,
  linkedin: socialLinks.find((link) => link.name === "LinkedIn")?.url,
  resume: personalInfo.resumeUrl,
};

export const ATLAS_ALLOWED_METRICS = [
  "1M+",
  "738",
  "97%+",
  "5x",
  "500+ emails/month",
  "68 tests",
  "50+ docs",
];

export const PROHIBITED_GENERATED_CONTENT = [
  "CUNY Brooklyn",
  "Offer Success Rate",
  "technical-operations-atlas/jobtracker",
  "hello@ayushyadav.dev",
  "Kafka",
  "ClickHouse",
  "1200+ installs",
];

export async function switchThemeAndWait(
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
