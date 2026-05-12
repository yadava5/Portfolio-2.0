import { test, expect } from "@playwright/test";
import {
  absoluteUrl,
  CASE_STUDY_PROJECT_TITLES,
  COMPANY_LOGOS,
  DEFAULT_THEME,
  NAV_SECTIONS,
  PUBLIC_PROJECT_IMAGES,
  PUBLIC_PROJECT_TITLES,
  THEMES,
  scrollThroughPage,
  switchThemeAndWait,
} from "./portfolio-fixtures";

test.describe("Navigation Links", () => {
  test.setTimeout(120000);

  for (const theme of THEMES) {
    test(`${theme.name}: all nav sections have IDs`, async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);

      await switchThemeAndWait(page, theme);

      // Verify each section ID exists in the DOM
      for (const section of NAV_SECTIONS) {
        const el = page.locator(`#${section}`);
        await expect(el).toBeAttached({ timeout: 10000 });
      }
    });
  }
});

test.describe("Project Images", () => {
  test.setTimeout(60000);

  test("public project image files exist", async ({ page }) => {
    await page.goto("/");
    for (const img of PUBLIC_PROJECT_IMAGES) {
      const response = await page.request.get(absoluteUrl(page, img));
      expect(response.status(), `Image ${img} should return 200`).toBe(200);
    }
  });

  test("company logo files exist", async ({ page }) => {
    await page.goto("/");
    for (const logo of COMPANY_LOGOS) {
      const response = await page.request.get(absoluteUrl(page, logo));
      expect(response.status(), `Logo ${logo} should return 200`).toBe(200);
    }
  });
});

test.describe("Project Display Count", () => {
  test.setTimeout(120000);

  for (const theme of THEMES) {
    test(`${theme.name}: displays expected project records`, async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);

      await switchThemeAndWait(page, theme);
      await scrollThroughPage(page);

      const expectedTitles =
        theme.name === DEFAULT_THEME
          ? CASE_STUDY_PROJECT_TITLES
          : PUBLIC_PROJECT_TITLES;
      let displayedCount = 0;
      for (const title of expectedTitles) {
        const found = await page.locator(`text=${title}`).count();
        if (found > 0) displayedCount++;
      }

      expect(
        displayedCount,
        `Should display expected project records in ${theme.name}`
      ).toBe(expectedTitles.length);
    });
  }
});
