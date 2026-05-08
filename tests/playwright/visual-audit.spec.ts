import { test } from "@playwright/test";
import { THEMES, scrollThroughPage, switchThemeAndWait } from "./portfolio-fixtures";

const SCROLL_POSITIONS = [0, 900, 1800, 3200, 5000, 7000, 9000];

for (const theme of THEMES) {
  test(`audit ${theme.name}`, async ({ page }) => {
    test.setTimeout(60000);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await switchThemeAndWait(page, theme);
    await scrollThroughPage(page);

    for (let i = 0; i < SCROLL_POSITIONS.length; i++) {
      await page.evaluate(
        (y) => window.scrollTo({ top: y, behavior: "instant" }),
        SCROLL_POSITIONS[i]
      );
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `tests/playwright/screenshots/${theme.name}-section-${i}.png`,
      });
    }
  });
}
