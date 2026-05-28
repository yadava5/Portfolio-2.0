import { test, expect } from "@playwright/test";
import {
  absoluteUrl,
  CATEGORY_PROJECTS,
  CASE_STUDY_PROJECT_TITLES,
  COMPANY_LOGOS,
  DEFAULT_THEME,
  FEATURED_PROJECT_VISUALS,
  FEATURED_PROJECTS,
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

test.describe("Project Visual Disclosures", () => {
  test.setTimeout(120000);

  for (const theme of THEMES.filter((theme) => theme.name !== DEFAULT_THEME)) {
    test(`${theme.name}: representative project visuals are disclosed`, async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);

      await switchThemeAndWait(page, theme);
      await scrollThroughPage(page);

      for (const project of FEATURED_PROJECT_VISUALS) {
        const disclosure = page
          .locator("p")
          .filter({ hasText: project.disclosureLabel })
          .filter({ hasText: project.disclosure })
          .first();

        await expect(
          disclosure,
          `${project.title} should disclose ${project.imageKind}`
        ).toBeVisible();
      }
    });
  }
});

test.describe("Horizontal Project Rail", () => {
  test.setTimeout(120000);

  test("liquid-glass: final featured project remains visible at the end of the rail", async ({
    page,
  }) => {
    const liquidGlassTheme = THEMES.find(
      (theme) => theme.name === "liquid-glass"
    );
    const finalFeaturedProject = FEATURED_PROJECTS.at(-1);

    if (!liquidGlassTheme || !finalFeaturedProject) {
      throw new Error("Missing liquid-glass theme or featured project fixture");
    }

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await switchThemeAndWait(page, liquidGlassTheme);
    await page.locator("#projects").waitFor({ state: "attached" });

    await page.evaluate(() => {
      const section = document.querySelector("#projects") as HTMLElement | null;

      if (!section) {
        throw new Error("Projects section was not found");
      }

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const railEnd = sectionTop + section.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: Math.max(sectionTop, railEnd - 2),
        behavior: "instant",
      });
    });
    await page.waitForTimeout(800);

    const headingState = await page.evaluate((title) => {
      const heading = Array.from(
        document.querySelectorAll<HTMLHeadingElement>("#projects h3")
      ).find((candidate) => candidate.textContent?.trim() === title);

      if (!heading) return null;

      const rect = heading.getBoundingClientRect();

      return {
        left: rect.left,
        right: rect.right,
        viewportWidth: window.innerWidth,
      };
    }, finalFeaturedProject.title);

    expect(headingState).not.toBeNull();
    expect(headingState?.left).toBeGreaterThanOrEqual(0);
    expect(headingState?.right).toBeLessThanOrEqual(
      headingState?.viewportWidth ?? 0
    );
  });
});

test.describe("Project Display Count", () => {
  test.setTimeout(120000);

  test("project helper collections expose only public portfolio-visible projects", () => {
    const helperProjects = [...FEATURED_PROJECTS, ...CATEGORY_PROJECTS];

    for (const project of helperProjects) {
      expect(
        project.isPrivate,
        `${project.title} should not appear in public project helper collections`
      ).toBe(false);
      expect(
        project.portfolioVisible,
        `${project.title} should be portfolio-visible if returned by a public helper`
      ).not.toBe(false);
    }

    expect(FEATURED_PROJECTS.map((project) => project.id)).not.toContain(
      "automl"
    );
  });

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
