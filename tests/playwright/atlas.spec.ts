import { test, expect, Locator, Page } from "@playwright/test";
import {
  ATLAS_ALLOWED_METRICS,
  CASE_STUDY_IDS,
  DEFAULT_THEME,
  EXPECTED_CONTENT,
  EXPECTED_GRADUATE_IDENTITY,
  EXPECTED_LINKS,
  EXPECTED_PROOF_ARTIFACTS,
  EXPECTED_SELECTED_WORK_ORDER,
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

const STALE_IDENTITY_COPY = [
  "Senior CS student",
  "Senior Computer Science student",
  "Expected May 2026",
  "Open to internships",
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

  test("public surface exposes Atlas only", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });

    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      DEFAULT_THEME
    );
    await expect(
      page.getByRole("button", { name: /select theme/i })
    ).toHaveCount(0);
  });

  test("shows graduate identity and professional portrait", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });

    await expect(page.locator("#hero")).toContainText(
      EXPECTED_GRADUATE_IDENTITY.role
    );
    await expect(page.locator("#about")).toContainText(
      EXPECTED_GRADUATE_IDENTITY.education
    );
    await expect(page.locator("body")).toContainText(
      EXPECTED_GRADUATE_IDENTITY.availability
    );
    await expect(
      page.getByRole("img", {
        name: EXPECTED_GRADUATE_IDENTITY.portraitAlt,
      })
    ).toBeVisible();

    const bodyText = await page.locator("body").innerText();
    for (const stale of STALE_IDENTITY_COPY) {
      expect(bodyText).not.toContain(stale);
    }
  });

  test("selected work starts with the strongest proof path", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#projects").scrollIntoViewIfNeeded();

    const cards = page.locator("#projects article");
    for (const [index, title] of EXPECTED_SELECTED_WORK_ORDER.entries()) {
      await expect(cards.nth(index)).toContainText(title);
    }
  });

  test("AutoML and Fast MNIST case studies expose artifact-backed proof", async ({
    page,
  }) => {
    await page.goto("/projects/automl/");
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.automlPoster)
    ).toBeVisible();
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.automlContribution)
    ).toBeVisible();

    await page.goto("/projects/fast-mnist-nn/");
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.fastMnistRelease)
    ).toBeVisible();
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.fastMnistBenchmark)
    ).toBeVisible();
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
      page.locator("#hero").getByText(EXPECTED_GRADUATE_IDENTITY.role)
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

  test("mobile hero keeps CTAs visible without horizontal overflow", async ({
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

    const scrollCheck = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > window.innerWidth,
      heroHeight: document.querySelector("#hero")?.getBoundingClientRect()
        .height,
      viewportHeight: window.innerHeight,
    }));

    expect(scrollCheck.overflow).toBe(false);
    expect(scrollCheck.heroHeight ?? 0).toBeLessThanOrEqual(
      scrollCheck.viewportHeight * 1.35
    );
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
