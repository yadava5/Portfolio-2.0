import { test, expect, Page } from "@playwright/test";

const THEMES: { name: string; label: string }[] = [
  { name: "paper-ink", label: "Paper & Ink" },
  { name: "gallery", label: "Gallery" },
  { name: "dark-luxe", label: "Dark Luxe" },
  { name: "editorial", label: "Editorial" },
  { name: "noir-cinema", label: "Noir Cinema" },
  { name: "neon-cyber", label: "Neon Cyber" },
];

async function switchTheme(page: Page, theme: { name: string; label: string }) {
  // Scroll down slightly to prevent hero elements from overlapping the fixed theme switcher on mobile
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
  await page.waitForTimeout(200);

  const switcher = page.locator("button[aria-label*='Select theme']");
  await switcher.click({ force: true });
  await page.waitForTimeout(400);

  const themeButton = page.locator("button[aria-pressed]").filter({ hasText: theme.label });
  await themeButton.first().click();
  await page.waitForTimeout(800);

  await expect(page.locator("html")).toHaveAttribute("data-theme", theme.name);
}

/**
 * Scroll through the entire page to trigger all whileInView / ScrollTrigger
 * animations, then scroll back to the top.
 */
async function scrollThroughPage(page: Page) {
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const steps = Math.ceil(totalHeight / (viewportHeight * 0.6));

  for (let i = 0; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), i * viewportHeight * 0.6);
    await page.waitForTimeout(300);
  }

  // Wait for all animations to settle
  await page.waitForTimeout(1000);

  // Scroll back to top for full-page screenshot
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(500);
}

test.describe("Theme Visual Tests", () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  });

  for (const theme of THEMES) {
    test(`${theme.name} theme renders with visible content`, async ({ page }) => {
      await switchTheme(page, theme);

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

    test(`${theme.name} theme has no critical console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await switchTheme(page, theme);
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
      await switchTheme(page, theme);
      await expect(page.locator("main")).toBeVisible();
    }
  });
});
