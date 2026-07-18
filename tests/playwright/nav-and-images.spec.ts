import { test, expect, type Locator } from "@playwright/test";
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

async function expectAnyVisible(locator: Locator, message: string) {
  const count = await locator.count();

  for (let index = 0; index < count; index += 1) {
    const candidate = locator.nth(index);

    await candidate
      .scrollIntoViewIfNeeded({ timeout: 2000 })
      .catch(() => undefined);

    if (await candidate.isVisible()) {
      return;
    }
  }

  await expect(locator.first(), message).toBeVisible();
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

  // The homepage chapters are editorial rows without project imagery; the
  // visuals (and their honesty disclosures) live on the case-study routes.
  for (const project of FEATURED_PROJECT_VISUALS) {
    test(`${project.id}: case study discloses its ${project.imageKind}`, async ({
      page,
    }) => {
      await page.goto(`/projects/${project.id}/`);
      await page.waitForLoadState("domcontentloaded");

      const disclosure = page
        .locator("#project-visual p")
        .filter({ hasText: project.disclosure })
        .first();

      await expectAnyVisible(
        disclosure,
        `${project.title} should disclose ${project.imageKind}`
      );
    });
  }
});

test.describe("Work Chapter Rows", () => {
  test.setTimeout(120000);

  test("daylight-study: work rows remain reachable after scrolling the chapter", async ({
    page,
  }) => {
    const finalFeaturedProject = FEATURED_PROJECTS.at(-1);

    if (!finalFeaturedProject) {
      test.skip(
        true,
        "No featured project is available for the project visibility check"
      );
      return;
    }

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await switchThemeAndWait(page, { name: DEFAULT_THEME, label: "" });
    await page.locator("#work").waitFor({ state: "attached" });

    await page.evaluate((title) => {
      const section = document.querySelector("#work") as HTMLElement | null;

      if (!section) {
        throw new Error("Work chapter was not found");
      }

      const heading = Array.from(
        section.querySelectorAll<HTMLHeadingElement>("h3")
      ).find((candidate) => candidate.textContent?.trim() === title);

      heading?.scrollIntoView({ block: "center", behavior: "instant" });
    }, finalFeaturedProject.title);
    await page.waitForTimeout(300);

    const headingState = await page.evaluate((title) => {
      const heading = Array.from(
        document.querySelectorAll<HTMLHeadingElement>("#work h3")
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
