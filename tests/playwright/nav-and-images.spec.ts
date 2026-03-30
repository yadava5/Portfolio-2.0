import { test, expect, Page } from "@playwright/test";

const THEMES = [
  { name: "paper-ink", label: "Paper & Ink" },
  { name: "gallery", label: "Gallery" },
  { name: "dark-luxe", label: "Dark Luxe" },
  { name: "editorial", label: "Editorial" },
  { name: "noir-cinema", label: "Noir Cinema" },
  { name: "neon-cyber", label: "Neon Cyber" },
];

const NAV_SECTIONS = ["about", "experience", "projects", "skills", "testimonials", "contact"];

async function switchThemeAndWait(page: Page, theme: { name: string; label: string }) {
  // Scroll down to prevent hero elements overlapping the theme switcher on mobile
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
  await page.waitForTimeout(300);

  // Open theme switcher
  const switcher = page.locator("button[aria-label*='Select theme']");
  await switcher.click({ force: true });
  await page.waitForTimeout(500);

  // Click the target theme
  const themeButton = page.locator("button[aria-pressed]").filter({ hasText: theme.label });
  await themeButton.first().click();
  await page.waitForTimeout(1000);

  // Verify the theme attribute was set
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme.name, { timeout: 10000 });

  // Wait for lazy-loaded components to mount — #about is the first section after Hero
  await page.locator("#about").waitFor({ state: "attached", timeout: 20000 });

  // Scroll through the full page to ensure all sections are loaded
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const steps = Math.ceil(totalHeight / (viewportHeight * 0.6));
  for (let i = 0; i <= steps; i++) {
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      i * viewportHeight * 0.6
    );
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(1000);
}

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
    // Only public projects (8 total: 4 featured + 4 non-featured)
    const images = [
      "/images/projects/jobtracker.png",
      "/images/projects/automl.png",
      "/images/projects/visual-assist.png",
      "/images/projects/taskflow.png",
      "/images/projects/mnist.png",
      "/images/projects/lifequest.png",
      "/images/projects/advocacy.png",
      "/images/projects/job-automator.png",
    ];

    for (const img of images) {
      const response = await page.request.get(`http://localhost:3000${img}`);
      expect(response.status(), `Image ${img} should return 200`).toBe(200);
    }
  });

  test("company logo files exist", async ({ page }) => {
    const logos = [
      "/images/companies/miami.png",
      "/images/companies/aramark.png",
    ];

    for (const logo of logos) {
      const response = await page.request.get(`http://localhost:3000${logo}`);
      expect(response.status(), `Logo ${logo} should return 200`).toBe(200);
    }
  });
});

test.describe("Project Display Count", () => {
  test.setTimeout(120000);

  for (const theme of THEMES) {
    test(`${theme.name}: displays exactly 8 public projects`, async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);

      await switchThemeAndWait(page, theme);

      // Look for project cards/links by finding image or title elements
      // Count unique projects displayed on the page
      const projectElements = await page.locator('img[alt], h3, h4').filter({
        has: page.locator('text=/JobTracker|AutoML|Visual Assist|Taskflow|MNIST|LifeQuest|Paid Internships|Job Automator/')
      }).count();

      // Alternatively, count sections with project titles
      const projectTitles = [
        'JobTracker',
        'AutoML Platform',
        'Visual Assist',
        'Taskflow Calendar',
        'Fast MNIST Neural Network',
        'LifeQuest',
        'Paid Internships Advocacy',
        'Job Automator'
      ];

      let displayedCount = 0;
      for (const title of projectTitles) {
        const found = await page.locator(`text=${title}`).count();
        if (found > 0) displayedCount++;
      }

      expect(displayedCount, `Should display exactly 8 public projects in ${theme.name}`).toBe(8);
    });
  }
});
