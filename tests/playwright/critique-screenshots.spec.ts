import { test, Page } from "@playwright/test";
import { artifactPath, THEMES, switchThemeAndWait } from "./portfolio-fixtures";

const SECTION_NAMES = [
  { selector: "#hero", name: "hero" },
  { selector: "#about", name: "about" },
  { selector: "#experience", name: "experience" },
  { selector: "#projects", name: "projects" },
  { selector: "#skills", name: "skills" },
  { selector: "#testimonials", name: "testimonials" },
  { selector: "#contact", name: "contact" },
];

async function scrollToElement(page: Page, selector: string) {
  const element = page.locator(selector);
  if (await element.isVisible()) {
    await element.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
  }
}

for (const theme of THEMES) {
  test(`critique ${theme.name} - desktop`, async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-desktop",
      "Desktop screenshots are captured by the desktop Playwright project."
    );
    test.setTimeout(120000);

    // Load page
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Switch theme
    await switchThemeAndWait(page, theme);
    await page.waitForTimeout(800);

    // Screenshot each major section
    for (const section of SECTION_NAMES) {
      try {
        const element = page.locator(section.selector);
        if ((await element.count()) > 0) {
          await scrollToElement(page, section.selector);
          const screenshotPath = await artifactPath(
            "critique-screenshots",
            `${theme.name}-${section.name}-desktop.png`
          );
          await element.screenshot({ path: screenshotPath });
          console.log(`Captured: ${screenshotPath}`);
        }
      } catch {
        console.log(`Could not capture ${theme.name}-${section.name}`);
      }
    }

    // Full page screenshot
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await switchThemeAndWait(page, theme);
    await page.waitForTimeout(800);
    const fullPath = await artifactPath(
      "critique-screenshots",
      `${theme.name}-full-desktop.png`
    );
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`Captured: ${fullPath}`);
  });

  test(`critique ${theme.name} - mobile`, async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-mobile",
      "Mobile screenshots are captured by the mobile Playwright project."
    );
    test.setTimeout(120000);

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Load page
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Switch theme
    await switchThemeAndWait(page, theme);
    await page.waitForTimeout(800);

    // Screenshot hero and projects sections
    const mobileScreenSections = ["hero", "projects"];
    for (const sectionName of mobileScreenSections) {
      const section = SECTION_NAMES.find((s) => s.name === sectionName);
      if (section) {
        try {
          const element = page.locator(section.selector);
          if ((await element.count()) > 0) {
            await scrollToElement(page, section.selector);
            const screenshotPath = await artifactPath(
              "critique-screenshots",
              `${theme.name}-${sectionName}-mobile.png`
            );
            await element.screenshot({ path: screenshotPath });
            console.log(`Captured mobile: ${screenshotPath}`);
          }
        } catch {
          console.log(`Could not capture mobile ${theme.name}-${sectionName}`);
        }
      }
    }
  });
}
