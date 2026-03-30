import { test, Page } from "@playwright/test";

const THEMES = [
  { name: "paper-ink", label: "Paper & Ink" },
  { name: "gallery", label: "Gallery" },
  { name: "dark-luxe", label: "Dark Luxe" },
  { name: "editorial", label: "Editorial" },
  { name: "noir-cinema", label: "Noir Cinema" },
  { name: "neon-cyber", label: "Neon Cyber" },
];

const SCROLL_POSITIONS = [0, 900, 1800, 3200, 5000, 7000, 9000];

async function switchTheme(page: Page, theme: { name: string; label: string }) {
  await page.locator("button[aria-label*='Select theme']").click();
  await page.waitForTimeout(400);
  await page.locator("button[aria-pressed]").filter({ hasText: theme.label }).first().click();
  await page.waitForTimeout(800);
}

async function scrollThroughPage(page: Page) {
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const steps = Math.ceil(totalHeight / 400);
  for (let i = 0; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), i * 400);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(800);
}

for (const theme of THEMES) {
  test(`audit ${theme.name}`, async ({ page }) => {
    test.setTimeout(60000);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    
    await switchTheme(page, theme);
    await scrollThroughPage(page);

    for (let i = 0; i < SCROLL_POSITIONS.length; i++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), SCROLL_POSITIONS[i]);
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `tests/playwright/screenshots/${theme.name}-section-${i}.png`,
      });
    }
  });
}
