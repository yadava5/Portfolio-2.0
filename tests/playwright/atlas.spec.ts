import { test, expect } from "@playwright/test";
import {
  ATLAS_ALLOWED_METRICS,
  CASE_STUDY_IDS,
  DEFAULT_THEME,
  EXPECTED_CONTENT,
  EXPECTED_LINKS,
  PROHIBITED_GENERATED_CONTENT,
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
    await expect(page.locator(`a[href="${EXPECTED_LINKS.resume}"]`).first()).toBeAttached();
    await expect(page.locator(`a[href="${EXPECTED_LINKS.github}"]`).first()).toBeAttached();
    await expect(page.locator(`a[href="${EXPECTED_LINKS.linkedin}"]`).first()).toBeAttached();

    for (const metric of ATLAS_ALLOWED_METRICS) {
      await expect(page.getByText(metric).first()).toBeVisible();
    }
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
});
