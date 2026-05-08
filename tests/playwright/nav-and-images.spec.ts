import { test, expect } from "@playwright/test";
import {
  COMPANY_LOGOS,
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
    for (const img of PUBLIC_PROJECT_IMAGES) {
      const response = await page.request.get(`http://127.0.0.1:3000${img}`);
      expect(response.status(), `Image ${img} should return 200`).toBe(200);
    }
  });

  test("company logo files exist", async ({ page }) => {
    for (const logo of COMPANY_LOGOS) {
      const response = await page.request.get(`http://127.0.0.1:3000${logo}`);
      expect(response.status(), `Logo ${logo} should return 200`).toBe(200);
    }
  });
});

test.describe("Project Display Count", () => {
  test.setTimeout(120000);

  for (const theme of THEMES) {
    test(`${theme.name}: displays exactly 8 public projects`, async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);

      await switchThemeAndWait(page, theme);
      await scrollThroughPage(page);

      let displayedCount = 0;
      for (const title of PUBLIC_PROJECT_TITLES) {
        const found = await page.locator(`text=${title}`).count();
        if (found > 0) displayedCount++;
      }

      expect(
        displayedCount,
        `Should display exactly 8 public projects in ${theme.name}`
      ).toBe(PUBLIC_PROJECT_TITLES.length);
    });
  }
});
