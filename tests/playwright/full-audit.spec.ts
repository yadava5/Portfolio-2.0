import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const THEMES: { name: string; label: string }[] = [
  { name: "paper-ink", label: "Paper & Ink" },
  { name: "gallery", label: "Gallery" },
  { name: "dark-luxe", label: "Dark Luxe" },
  { name: "editorial", label: "Editorial" },
  { name: "noir-cinema", label: "Noir Cinema" },
  { name: "neon-cyber", label: "Neon Cyber" },
];

interface Issue {
  severity: "high" | "medium" | "low";
  section: string;
  description: string;
}

interface ThemeAudit {
  sections_visible: string[];
  sections_missing: string[];
  nav_links_work: boolean;
  cta_buttons_work: boolean;
  console_errors: string[];
  broken_images: string[];
  overflow_issues: string[];
  issues: Issue[];
}

interface AuditResult {
  timestamp: string;
  themes: Record<string, ThemeAudit>;
  crossTheme: {
    switcher_works: boolean;
    persistence_works: boolean;
    issues: Issue[];
  };
}

async function switchTheme(page: Page, theme: { name: string; label: string }) {
  // Click the theme button
  const themeButton = page
    .locator("button")
    .filter({ hasText: "Theme" })
    .first();
  if (await themeButton.isVisible()) {
    await themeButton.click();
    await page.waitForTimeout(400);
  }

  // Click the theme option - search for button containing the full theme label
  const themeOption = page
    .locator("button")
    .filter({ hasText: new RegExp(theme.label, "i") });
  if (await themeOption.first().isVisible()) {
    await themeOption.first().click();
    await page.waitForTimeout(800);
  }
}

async function scrollThroughPage(page: Page) {
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

async function checkBrokenImages(page: Page): Promise<string[]> {
  const broken = await page.evaluate(() => {
    const images: string[] = [];
    document.querySelectorAll("img").forEach((img: HTMLImageElement) => {
      if (img.offsetHeight > 0 && img.naturalWidth === 0) {
        images.push(`${img.alt || "unnamed"}`);
      }
    });
    return images.slice(0, 5);
  });
  return broken;
}

async function checkOverflow(page: Page): Promise<string[]> {
  const overflows = await page.evaluate(() => {
    const result: string[] = [];
    if (
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
    ) {
      result.push("Horizontal scroll");
    }
    return result;
  });
  return overflows;
}

async function checkVisibleSections(
  page: Page
): Promise<{ visible: string[]; missing: string[] }> {
  const result = await page.evaluate(() => {
    const visible: string[] = [];

    // Check for key sections by id
    if (
      document.getElementById("about") ||
      Array.from(document.querySelectorAll("h2")).some((h) =>
        h.textContent?.includes("About")
      )
    ) {
      visible.push("about");
    }
    if (
      document.getElementById("experience") ||
      Array.from(document.querySelectorAll("h2")).some((h) =>
        h.textContent?.includes("Experience")
      )
    ) {
      visible.push("experience");
    }
    if (
      document.getElementById("projects") ||
      Array.from(document.querySelectorAll("h2")).some((h) =>
        h.textContent?.includes("Project")
      )
    ) {
      visible.push("projects");
    }
    if (
      document.getElementById("skills") ||
      Array.from(document.querySelectorAll("h2")).some((h) =>
        h.textContent?.includes("Skill")
      )
    ) {
      visible.push("skills");
    }
    if (
      document.getElementById("contact") ||
      Array.from(document.querySelectorAll("h2")).some((h) =>
        h.textContent?.includes("Contact")
      )
    ) {
      visible.push("contact");
    }
    if (document.querySelector("h1")) {
      visible.push("hero");
    }

    const expected = [
      "hero",
      "about",
      "experience",
      "projects",
      "skills",
      "contact",
    ];
    const missing = expected.filter((s) => !visible.includes(s));

    return { visible, missing };
  });

  return result;
}

async function testNavLinks(
  page: Page
): Promise<{ works: boolean; issues: string[] }> {
  const issues: string[] = [];
  const navTexts = ["About", "Experience", "Projects", "Skills"];

  for (const text of navTexts) {
    try {
      const link = page
        .locator("a")
        .filter({ hasText: new RegExp(text, "i") })
        .first();
      if (await link.isVisible()) {
        const scrollBefore = await page.evaluate(() => window.scrollY);
        await link.click({ timeout: 5000 });
        await page.waitForTimeout(300);
        const scrollAfter = await page.evaluate(() => window.scrollY);

        if (Math.abs(scrollAfter - scrollBefore) < 50) {
          issues.push(`${text} nav link failed`);
        }
      }
    } catch (e) {
      console.log(`Error with ${text} nav`);
    }
  }

  return { works: issues.length === 0, issues };
}

async function testCtaButtons(
  page: Page
): Promise<{ works: boolean; issues: string[] }> {
  const issues: string[] = [];
  const ctas = await page
    .locator("button, a")
    .filter({ hasText: /View|Explore|Check Out|Get In Touch/ });
  const count = await ctas.count();

  for (let i = 0; i < Math.min(count, 2); i++) {
    try {
      const btn = ctas.nth(i);
      if (await btn.isVisible()) {
        const href = await btn.getAttribute("href");
        const scrollBefore = await page.evaluate(() => window.scrollY);
        await btn.click({ timeout: 5000 });
        await page.waitForTimeout(300);
        const scrollAfter = await page.evaluate(() => window.scrollY);

        if (
          scrollBefore === scrollAfter &&
          !href?.includes("http") &&
          !href?.includes("mailto")
        ) {
          issues.push("CTA button failed");
        }
      }
    } catch (e) {
      console.log(`CTA button test error`);
    }
  }

  return { works: issues.length === 0, issues };
}

test.describe("Full QA Audit", () => {
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
  });

  const auditResult: AuditResult = {
    timestamp: new Date().toISOString(),
    themes: {},
    crossTheme: {
      switcher_works: false,
      persistence_works: false,
      issues: [],
    },
  };

  for (const theme of THEMES) {
    test(`${theme.name} - Audit`, async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          const text = msg.text();
          if (
            !text.includes("Hydration") &&
            !text.includes("404") &&
            !text.includes("Failed") &&
            !text.includes("favicon") &&
            !text.includes("font")
          ) {
            consoleErrors.push(text);
          }
        }
      });

      await switchTheme(page, theme);
      await page.waitForTimeout(400);

      const dataTheme = await page.locator("html").getAttribute("data-theme");
      if (dataTheme !== theme.name) {
        console.log(
          `Warning: Theme not switched to ${theme.name}, got ${dataTheme}`
        );
      }

      const sections = await checkVisibleSections(page);
      const navTest = await testNavLinks(page);
      await scrollThroughPage(page);
      const ctaTest = await testCtaButtons(page);
      const brokenImages = await checkBrokenImages(page);
      const overflowIssues = await checkOverflow(page);

      await page.screenshot({
        path: `tests/playwright/screenshots/audit/${theme.name}-full.png`,
      });

      const issues: Issue[] = [];

      if (sections.missing.length > 0) {
        issues.push({
          severity: "high",
          section: "general",
          description: `Missing: ${sections.missing.join(", ")}`,
        });
      }

      if (!navTest.works && navTest.issues.length > 0) {
        issues.push({
          severity: "high",
          section: "nav",
          description: navTest.issues.join("; "),
        });
      }

      if (!ctaTest.works && ctaTest.issues.length > 0) {
        issues.push({
          severity: "medium",
          section: "cta",
          description: ctaTest.issues.join("; "),
        });
      }

      if (brokenImages.length > 0) {
        issues.push({
          severity: "medium",
          section: "images",
          description: `Broken: ${brokenImages.join(", ")}`,
        });
      }

      if (overflowIssues.length > 0) {
        issues.push({
          severity: "medium",
          section: "layout",
          description: overflowIssues.join("; "),
        });
      }

      auditResult.themes[theme.name] = {
        sections_visible: sections.visible,
        sections_missing: sections.missing,
        nav_links_work: navTest.works,
        cta_buttons_work: ctaTest.works,
        console_errors: consoleErrors,
        broken_images: brokenImages,
        overflow_issues: overflowIssues,
        issues,
      };

      console.log(`${theme.name}: ${issues.length} issues found`);
    });
  }

  test("Switcher Test", async ({ page }) => {
    const issues: Issue[] = [];
    let allWork = true;

    for (const theme of THEMES) {
      try {
        await switchTheme(page, theme);
        const dataTheme = await page.locator("html").getAttribute("data-theme");

        if (dataTheme !== theme.name) {
          allWork = false;
          issues.push({
            severity: "high",
            section: "switcher",
            description: `Failed: ${theme.name}`,
          });
        }
      } catch (e) {
        allWork = false;
        issues.push({
          severity: "high",
          section: "switcher",
          description: `Error: ${theme.name}`,
        });
      }
    }

    auditResult.crossTheme.switcher_works = allWork;
    auditResult.crossTheme.issues = issues;

    expect(allWork).toBe(true);
  });

  test.afterAll(async () => {
    const reportPath = "tests/playwright/audit-report.json";
    fs.writeFileSync(reportPath, JSON.stringify(auditResult, null, 2), "utf-8");
    console.log(`Report saved: ${reportPath}`);
  });
});
