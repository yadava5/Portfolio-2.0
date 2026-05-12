import { test, expect, Locator, Page } from "@playwright/test";
import {
  ATLAS_ALLOWED_METRICS,
  CASE_STUDY_IDS,
  DEFAULT_THEME,
  EXPECTED_CONTENT,
  EXPECTED_LINKS,
  PROHIBITED_GENERATED_CONTENT,
  RECRUITER_HERO_LINKS,
  RECRUITER_HERO_METRICS,
  REQUIRED_PRIVATE_CASE_STUDIES,
} from "./portfolio-fixtures";

const REQUIRED_SECTIONS = [
  "hero",
  "about",
  "experience",
  "projects",
  "skills",
  "testimonials",
  "contact",
];

const CASE_STUDY_SECTIONS = [
  "Problem",
  "Role",
  "Architecture",
  "Decisions",
  "Validation",
  "Outcomes",
  "Artifacts",
];

async function expectInFirstViewport(page: Page, locator: Locator) {
  await expect(locator).toBeVisible();

  const box = await locator.boundingBox();
  expect(box).not.toBeNull();

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
}

function heroMetricValue(page: Page, metric: string) {
  return page
    .locator("#hero span.font-mono")
    .filter({ hasText: metric })
    .first();
}

test.describe("Technical Operations Atlas", () => {
  test("is the default source-truth portfolio identity", async ({ page }) => {
    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });

    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      DEFAULT_THEME
    );

    for (const section of REQUIRED_SECTIONS) {
      await expect(page.locator(`#${section}`)).toBeAttached();
    }

    await expect(page.locator("body")).toContainText(EXPECTED_CONTENT.name);
    await expect(page.locator("body")).toContainText(EXPECTED_CONTENT.email);
    await expect(
      page.locator(`a[href="${EXPECTED_LINKS.resume}"]`).first()
    ).toBeAttached();
    await expect(
      page.locator(`a[href="${EXPECTED_LINKS.github}"]`).first()
    ).toBeAttached();
    await expect(
      page.locator(`a[href="${EXPECTED_LINKS.linkedin}"]`).first()
    ).toBeAttached();

    const renderedSourceText = await page.locator("body").evaluate((body) => {
      return body.textContent ?? "";
    });

    for (const metric of ATLAS_ALLOWED_METRICS) {
      expect(renderedSourceText).toContain(metric);
    }
  });

  test("desktop first viewport exposes recruiter identity, links, and proof", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });

    await expectInFirstViewport(
      page,
      page.locator("#hero").getByText(EXPECTED_CONTENT.name)
    );
    await expectInFirstViewport(
      page,
      page.locator("#hero").getByText("Software / Data / ML Engineering")
    );

    for (const label of RECRUITER_HERO_LINKS) {
      await expectInFirstViewport(
        page,
        page.locator("#hero").getByRole("link", { name: new RegExp(label) })
      );
    }

    for (const metric of RECRUITER_HERO_METRICS) {
      await expectInFirstViewport(page, heroMetricValue(page, metric));
    }
  });

  test("mobile first viewport keeps recruiter CTAs visible and theme controls out of the way", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });

    for (const label of RECRUITER_HERO_LINKS) {
      await expectInFirstViewport(
        page,
        page.locator("#hero").getByRole("link", { name: new RegExp(label) })
      );
    }

    const mobileHeader = page.locator("header");
    for (const label of RECRUITER_HERO_LINKS) {
      await expectInFirstViewport(
        page,
        mobileHeader.getByRole("link", { name: label })
      );
    }

    await expect(
      page.getByRole("button", { name: "Select theme" })
    ).toBeHidden();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  });

  test("does not expose generated concept hallucinations", async ({ page }) => {
    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });

    const bodyText = await page.locator("body").innerText();
    for (const forbidden of PROHIBITED_GENERATED_CONTENT) {
      expect(bodyText).not.toContain(forbidden);
    }
  });

  for (const id of CASE_STUDY_IDS) {
    test(`case study route ${id} includes required evidence sections`, async ({
      page,
    }) => {
      await page.goto(`/projects/${id}/`);
      await page.waitForLoadState("domcontentloaded");

      for (const section of CASE_STUDY_SECTIONS) {
        await expect(page.getByText(section).first()).toBeVisible();
      }

      const bodyText = await page.locator("body").innerText();
      for (const forbidden of PROHIBITED_GENERATED_CONTENT) {
        expect(bodyText).not.toContain(forbidden);
      }
    });
  }

  for (const id of REQUIRED_PRIVATE_CASE_STUDIES) {
    test(`private proof case study ${id} is available`, async ({ page }) => {
      await page.goto(`/projects/${id}/`);
      await page.waitForLoadState("domcontentloaded");

      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        page
          .getByText("Private proof")
          .or(page.getByText("work-related"))
          .first()
      ).toBeVisible();
    });
  }
});
