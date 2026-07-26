import { test, expect, type Locator } from "@playwright/test";
import {
  absoluteUrl,
  CASE_STUDY_IDS,
  CATEGORY_PROJECTS,
  COMPANY_LOGOS,
  DEFAULT_THEME,
  EXPECTED_HOME_PROJECT_TITLES,
  EXPECTED_SYSTEM_CARD_IDS,
  EXPECTED_WORK_ROWS,
  FEATURED_PROJECT_VISUALS,
  FEATURED_PROJECTS,
  NAV_SECTIONS,
  PUBLIC_PROJECT_IMAGES,
  PUBLIC_PROJECT_TITLES,
  SYSTEM_CARD_HOME_IDS,
  SYSTEM_CARD_PROJECTS,
  THEMES,
  scrollThroughPage,
  switchThemeAndWait,
} from "./portfolio-fixtures";
import { getProjectById, projects } from "../../src/lib/data/projects";
import { caseStudyIds } from "../../src/lib/data/projectCaseStudies";

// Featured projects whose visuals + honesty disclosures live on a
// case-study route. Some featured projects (e.g. LifeQuest,
// jetpack-compress) link straight to the live app and have no case
// file, so they carry no disclosure route to assert.
const FEATURED_CASE_STUDY_VISUALS = FEATURED_PROJECT_VISUALS.filter((project) =>
  CASE_STUDY_IDS.includes(project.id)
);

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
  for (const project of FEATURED_CASE_STUDY_VISUALS) {
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
    // Target the last row actually rendered in the work chapter (an
    // #work h3), not merely the last featured project — some featured
    // projects link to the live app and have no work-chapter row.
    const finalWorkRow = EXPECTED_WORK_ROWS.at(-1);

    if (!finalWorkRow) {
      test.skip(
        true,
        "No work-chapter row is available for the project visibility check"
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
    }, finalWorkRow.title);
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
    }, finalWorkRow.title);

    expect(headingState).not.toBeNull();
    expect(headingState?.left).toBeGreaterThanOrEqual(0);
    expect(headingState?.right).toBeLessThanOrEqual(
      headingState?.viewportWidth ?? 0
    );
  });
});

/* System Cards (2026-07-26) — the placement model's missing terminal.
   Each live app serves an interactive card at `<liveUrl>/system-card`
   and the portfolio links landing · live app · that card. Two contracts
   here, and neither is a restatement of the data:

   1. The URL is DERIVED, not typed. `systemCardUrl` is a literal string
      in projects.ts (a claim that a document exists at an address, which
      this site does not compose at render time) — so the invariant that
      it names the same host the live-demo row prints has to be checked
      somewhere, or a typo ships a link to a stranger's domain.
   2. The link REACHES the two projects with no case file. The other
      four fold it into their case-file rail; jetpack-compress and
      LifeQuest have no rail, so ¶05 is the only surface either card can
      be reached from, and a silent regression there is invisible. */
test.describe("System Cards", () => {
  test("every system-card URL derives from its project's live URL", () => {
    for (const project of SYSTEM_CARD_PROJECTS) {
      expect(
        project.liveUrl,
        `${project.title} has a system card but no live URL to derive it from`
      ).toBeTruthy();
      expect(
        project.systemCardUrl,
        `${project.title}: system card must be <liveUrl>/system-card`
      ).toBe(`${project.liveUrl}/system-card`);
    }
  });

  test("the six live apps each carry a system card, and nothing else does", () => {
    for (const id of EXPECTED_SYSTEM_CARD_IDS) {
      expect(
        getProjectById(id)?.systemCardUrl,
        `${id} should carry a system card`
      ).toBeTruthy();
    }
    expect(SYSTEM_CARD_PROJECTS.map((project) => project.id).sort()).toEqual(
      [...EXPECTED_SYSTEM_CARD_IDS].sort()
    );
    /* The seventh project with a liveUrl serves no card — the field is
       what keeps the site from linking a 404 into existence. */
    const liveWithoutCard = projects.filter(
      (project) => project.liveUrl && !project.systemCardUrl
    );
    expect(liveWithoutCard.map((project) => project.id)).toEqual([
      "paid-internships",
    ]);
  });

  test("¶05 links the card for the two projects with no case file", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator("#work").waitFor({ state: "attached" });
    await scrollThroughPage(page);

    for (const id of SYSTEM_CARD_HOME_IDS) {
      const project = getProjectById(id)!;
      /* These two have no case route, which is exactly why the home
         paper has to carry the link — assert that premise too, so this
         test explains itself if one of them later earns a case file. */
      expect(caseStudyIds, `${id} still has no case file`).not.toContain(id);
      await expect(
        page.locator(`#work a[href="${project.systemCardUrl}"]`),
        `¶05 should link ${project.title}'s system card`
      ).toHaveCount(1);
      await expect(
        page.locator(`#work a[href="${project.systemCardUrl}"]`)
      ).toHaveAttribute("target", "_blank");
    }

    /* And it did NOT sprout on the rows that have a case file to fold
       it into (F40's rule: one primary act per row, secondaries live on
       the file). Four cards, four case files, zero extra clusters. */
    const homeCardLinks = await page
      .locator("#work a[href*='/system-card']")
      .count();
    expect(homeCardLinks).toBe(SYSTEM_CARD_HOME_IDS.length);
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

      /* Living-scenes row swap (2026-07-24): the home paper surfaces the
         showcase set (EXPECTED_HOME_PROJECT_TITLES), not every case-study
         title — Visual Assist is retired from home but keeps its route. */
      const expectedTitles =
        theme.name === DEFAULT_THEME
          ? EXPECTED_HOME_PROJECT_TITLES
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
