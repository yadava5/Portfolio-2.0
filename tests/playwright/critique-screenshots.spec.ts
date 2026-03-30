import { test, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const THEMES = [
  { name: "paper-ink", label: "Paper & Ink" },
  { name: "gallery", label: "Gallery" },
  { name: "dark-luxe", label: "Dark Luxe" },
  { name: "editorial", label: "Editorial" },
  { name: "noir-cinema", label: "Noir Cinema" },
  { name: "neon-cyber", label: "Neon Cyber" },
];

const SECTION_NAMES = [
  { selector: "[data-section='hero']", name: "hero" },
  { selector: "[data-section='about']", name: "about" },
  { selector: "[data-section='experience']", name: "experience" },
  { selector: "[data-section='projects']", name: "projects" },
  { selector: "[data-section='skills']", name: "skills" },
  { selector: "[data-section='testimonials']", name: "testimonials" },
  { selector: "[data-section='contact']", name: "contact" },
];

async function switchTheme(page: Page, theme: { name: string; label: string }) {
  // Click theme switcher
  const themeButtons = await page.locator("button").filter({ hasText: /Paper|Gallery|Dark|Editorial|Noir|Neon/i }).all();

  if (themeButtons.length === 0) {
    console.log("Theme buttons not found, looking for theme switcher...");
    const switcher = await page.locator("button[aria-label*='theme'], button[aria-label*='Theme']").first();
    if (await switcher.isVisible()) {
      await switcher.click();
      await page.waitForTimeout(400);
    }
  }

  // Find and click the specific theme button
  const themeButton = page.locator("button").filter({ hasText: theme.label }).first();
  await themeButton.click();
  await page.waitForTimeout(1200);
}

async function getViewportHeight(page: Page): Promise<number> {
  return await page.evaluate(() => window.innerHeight);
}

async function scrollToElement(page: Page, selector: string) {
  const element = page.locator(selector);
  if (await element.isVisible()) {
    await element.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }
}

// Create screenshots directory
const screenshotsDir = "tests/playwright/critique-screenshots";
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

for (const theme of THEMES) {
  test(`critique ${theme.name} - desktop`, async ({ page }) => {
    test.setTimeout(120000);

    // Load page
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Switch theme
    await switchTheme(page, theme);
    await page.waitForTimeout(800);

    // Screenshot each major section
    for (const section of SECTION_NAMES) {
      try {
        const element = page.locator(section.selector);
        if (await element.count() > 0) {
          await scrollToElement(page, section.selector);
          const screenshotPath = path.join(
            screenshotsDir,
            `${theme.name}-${section.name}-desktop.png`
          );
          await element.screenshot({ path: screenshotPath });
          console.log(`Captured: ${screenshotPath}`);
        }
      } catch (e) {
        console.log(`Could not capture ${theme.name}-${section.name}`);
      }
    }

    // Full page screenshot
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await switchTheme(page, theme);
    await page.waitForTimeout(800);
    const fullPath = path.join(screenshotsDir, `${theme.name}-full-desktop.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`Captured: ${fullPath}`);
  });

  test(`critique ${theme.name} - mobile`, async ({ page }) => {
    test.setTimeout(120000);

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Load page
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Switch theme
    await switchTheme(page, theme);
    await page.waitForTimeout(800);

    // Screenshot hero and projects sections
    const mobileScreenSections = ["hero", "projects"];
    for (const sectionName of mobileScreenSections) {
      const section = SECTION_NAMES.find(s => s.name === sectionName);
      if (section) {
        try {
          const element = page.locator(section.selector);
          if (await element.count() > 0) {
            await scrollToElement(page, section.selector);
            const screenshotPath = path.join(
              screenshotsDir,
              `${theme.name}-${sectionName}-mobile.png`
            );
            await element.screenshot({ path: screenshotPath });
            console.log(`Captured mobile: ${screenshotPath}`);
          }
        } catch (e) {
          console.log(`Could not capture mobile ${theme.name}-${sectionName}`);
        }
      }
    }
  });
}
