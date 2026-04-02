import { test, expect } from "@playwright/test";
import fs from "fs/promises";
import path from "path";

const THEMES = [
  "dark-luxe",
  "paper-ink",
  "editorial",
  "noir-cinema",
  "neon-cyber",
];

const VIEWPORT_SIZES = [
  { name: "mobile", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 720 },
];

/**
 * Visual regression test suite for portfolio themes at multiple viewport sizes.
 * Takes baseline screenshots for each theme + viewport combination.
 */
test.describe("Visual Regression: Theme Screenshots", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(120000);

  test.beforeAll(async () => {
    // Ensure screenshots directory exists
    const screenshotDir = path.join(
      __dirname,
      "screenshots",
      "visual-regression"
    );
    try {
      await fs.mkdir(screenshotDir, { recursive: true });
    } catch (err) {
      // Directory may already exist
    }
  });

  for (const theme of THEMES) {
    for (const viewport of VIEWPORT_SIZES) {
      test(`${theme} - ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
        page,
      }) => {
        // Set viewport size before navigation
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        // Navigate to the portfolio
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // Set theme via data-theme attribute
        await page.evaluate((themeName) => {
          document.documentElement.setAttribute("data-theme", themeName);
        }, theme);

        // Wait for fonts and animations to settle
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(500);

        // Ensure main content is visible
        const mainElement = page.locator("main");
        await expect(mainElement).toBeVisible({ timeout: 5000 });

        // Scroll to top to ensure consistent baseline
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        await page.waitForTimeout(300);

        // Take full-page screenshot and save to baseline directory
        const screenshotPath = path.join(
          __dirname,
          "screenshots",
          "visual-regression",
          `${theme}-${viewport.name}.png`
        );

        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });

        // Verify screenshot was created and has content
        const fileStats = await fs.stat(screenshotPath);
        expect(fileStats.size).toBeGreaterThan(1000);
      });
    }
  }

  test("verify all baseline screenshots exist", async () => {
    const screenshotDir = path.join(
      __dirname,
      "screenshots",
      "visual-regression"
    );

    for (const theme of THEMES) {
      for (const viewport of VIEWPORT_SIZES) {
        const filePath = path.join(
          screenshotDir,
          `${theme}-${viewport.name}.png`
        );
        const stats = await fs.stat(filePath);
        expect(stats.isFile()).toBe(true);
        expect(stats.size).toBeGreaterThan(0);
      }
    }
  });
});
