import { test } from "@playwright/test";
import {
  artifactPath,
  THEMES,
  switchThemeAndWait,
} from "./portfolio-fixtures";

// Enable video recording
test.use({
  video: "on",
});

test.describe("Theme Walkthroughs", () => {
  test.setTimeout(120000);

  for (const theme of THEMES) {
    test(`walkthrough-${theme.name}`, async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);

      await switchThemeAndWait(page, theme);
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
        await page.mouse.wheel(0, vh * 0.7);
        await page.waitForTimeout(350);
      }

      await page.waitForTimeout(500);
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" })
      );
      await page.waitForTimeout(500);

      // Full-page screenshot
      await page.screenshot({
        path: await artifactPath(
          "walkthroughs",
          "screenshots",
          `walkthrough-${theme.name}.png`
        ),
        fullPage: true,
      });
    });
  }
});
