import { expect, test } from "@playwright/test";

const siteUrl = "https://ayush-yadav.com";
const routes = [
  "/",
  "/projects/automl/",
  "/projects/fast-mnist-nn/",
  "/projects/jobtracker/",
  "/projects/master-inventory/",
  "/projects/policybot/",
  "/projects/taskflow-calendar/",
  "/projects/visual-assist/",
];

test.describe("static metadata", () => {
  for (const route of routes) {
    test(`${route} has production canonical and social image metadata`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();

      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(canonical).toBe(`${siteUrl}${route}`);

      for (const selector of [
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
      ]) {
        const content = await page.locator(selector).getAttribute("content");
        expect(content).toContain(`${siteUrl}/`);
      }
    });
  }
});
