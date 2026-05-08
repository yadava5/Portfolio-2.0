import { test, expect } from "@playwright/test";
import {
  THEMES,
  scrollThroughPage,
  switchThemeAndWait,
} from "./portfolio-fixtures";

/**
 * Scroll through the entire page to trigger all whileInView / ScrollTrigger
 * animations, then scroll back to the top.
 */
test.describe("Theme Visual Tests", () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  });

  for (const theme of THEMES) {
    test(`${theme.name} theme renders with visible content`, async ({
      page,
    }) => {
      await switchThemeAndWait(page, theme);

      // Scroll through the page to trigger all viewport-based animations
      await scrollThroughPage(page);

      // Verify main is visible
      await expect(page.locator("main")).toBeVisible();

      // Take full-page screenshot after animations triggered
      await page.screenshot({
        path: `tests/playwright/screenshots/${theme.name}-full.png`,
        fullPage: true,
      });
    });

    test(`${theme.name} theme has no critical console errors`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await switchThemeAndWait(page, theme);
      await scrollThroughPage(page);

      const realErrors = errors.filter(
        (e) =>
          !e.includes("Hydration") &&
          !e.includes("Warning:") &&
          !e.includes("404") &&
          !e.includes("Failed to load resource") &&
          !e.includes("favicon") &&
          !e.includes("font")
      );
      expect(realErrors).toHaveLength(0);
    });
  }
});

test.describe("Theme Switching", () => {
  test.setTimeout(120000);

  test("can switch between all themes without errors", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    for (const theme of THEMES) {
      await switchThemeAndWait(page, theme);
      await expect(page.locator("main")).toBeVisible();
    }
  });
});
