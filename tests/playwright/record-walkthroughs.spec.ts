import { test, Page } from "@playwright/test";

const THEMES = [
  { name: "paper-ink", label: "Paper & Ink" },
  { name: "gallery", label: "Gallery" },
  { name: "dark-luxe", label: "Dark Luxe" },
  { name: "editorial", label: "Editorial" },
  { name: "noir-cinema", label: "Noir Cinema" },
  { name: "neon-cyber", label: "Neon Cyber" },
];

// Enable video recording
test.use({
  video: { mode: "on", size: { width: 1440, height: 900 } },
  viewport: { width: 1440, height: 900 },
});

async function switchTheme(page: Page, theme: { name: string; label: string }) {
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
  await page.waitForTimeout(200);
  await page
    .locator("button[aria-label*='Select theme']")
    .click({ force: true });
  await page.waitForTimeout(300);
  await page
    .locator("button[aria-pressed]")
    .filter({ hasText: theme.label })
    .first()
    .click();
  await page.waitForTimeout(800);
}

test.describe("Theme Walkthroughs", () => {
  test.setTimeout(120000);

  for (const theme of THEMES) {
    test(`walkthrough-${theme.name}`, async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);

      await switchTheme(page, theme);
      await page
        .locator("#about")
        .waitFor({ state: "attached", timeout: 10000 });

      // Scroll to top
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" })
      );
      await page.waitForTimeout(500);

      // Quick scroll through the page
      const totalHeight = await page.evaluate(
        () => document.documentElement.scrollHeight
      );
      const vh = await page.evaluate(() => window.innerHeight);
      const steps = Math.ceil(totalHeight / (vh * 0.7));

      for (let i = 0; i <= steps; i++) {
        await page.evaluate(
          (y) => window.scrollTo({ top: y, behavior: "instant" }),
          i * vh * 0.7
        );
        await page.waitForTimeout(400);
      }

      await page.waitForTimeout(500);
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" })
      );
      await page.waitForTimeout(500);

      // Full-page screenshot
      await page.screenshot({
        path: `tests/playwright/screenshots/walkthrough-${theme.name}.png`,
        fullPage: true,
      });
    });
  }
});
