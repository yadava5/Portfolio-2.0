import { test, expect, Locator, Page } from "@playwright/test";
import {
  ATLAS_ALLOWED_METRICS,
  CASE_STUDY_LOCAL_ARTIFACTS,
  CASE_STUDY_IDS,
  EXPECTED_CONTENT,
  EXPECTED_GRADUATE_IDENTITY,
  EXPECTED_LINKS,
  EXPECTED_PROOF_ARTIFACTS,
  EXPECTED_SELECTED_WORK_PROOF_LABELS,
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
  "Current role",
  "Current work",
  "I work as an ITSM Data Integration Student Associate",
  "Jun 2025 - Present",
  "2025-06 - Present",
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

  test("public surface exposes Atlas only", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });

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
    await expect(page.locator("#hero")).toContainText(
      EXPECTED_GRADUATE_IDENTITY.recentRoleLabel
    );
    await expect(page.locator("#experience")).toContainText(
      EXPECTED_GRADUATE_IDENTITY.recentExperienceRange
    );
    await expect(page.locator("#contact")).toContainText(
      EXPECTED_GRADUATE_IDENTITY.recentRoleLabel
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

  test("selected work cards expose recruiter-visible proof paths", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#projects").scrollIntoViewIfNeeded();

    for (const proofPath of EXPECTED_SELECTED_WORK_PROOF_LABELS) {
      const card = page.locator("#projects article").filter({
        has: page.getByRole("heading", { name: proofPath.title }),
      });

      await expect(card).toHaveCount(1);
      await expect(card.getByText("Proof path")).toBeVisible();
      for (const label of proofPath.labels) {
        await expect(card.getByText(label)).toBeVisible();
      }
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
      page.getByText(EXPECTED_PROOF_ARTIFACTS.automlPresenterProof)
    ).toBeVisible();
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.automlPresenterEvidence)
    ).toBeVisible();
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.automlContribution)
    ).toBeVisible();

    await page.goto("/projects/automl/#artifacts");
    await expect(page.locator("section#artifacts")).toBeInViewport();
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.automlPresenterProof)
    ).toBeVisible();

    await page.goto("/projects/fast-mnist-nn/");
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.fastMnistRelease)
    ).toBeVisible();
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.fastMnistBenchmark)
    ).toBeVisible();
  });

  test("Fast MNIST proof stays tied to real demo and benchmark evidence", async ({
    page,
  }) => {
    await page.goto("/projects/fast-mnist-nn/");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.fastMnistScreenshot)
    ).toBeVisible();
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.fastMnistSpeedup)
    ).toBeVisible();
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.fastMnistDisclosure)
    ).toBeVisible();

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("5x faster inference");
    expect(bodyText).not.toContain("5x with AVX-512 SIMD");
  });

  test("Visual Assist proof stays source-backed and simulator-safe", async ({
    page,
  }) => {
    await page.goto("/projects/visual-assist/");
    await page.waitForLoadState("domcontentloaded");

    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.visualAssistArchitecture)
    ).toBeVisible();
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.visualAssistReadme)
    ).toBeVisible();
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.visualAssistTests)
    ).toBeVisible();
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.visualAssistCoverage)
    ).toBeVisible();
    await expect(
      page.getByText(EXPECTED_PROOF_ARTIFACTS.visualAssistCoreMlBoundary)
    ).toBeVisible();

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("68 unit tests");
    expect(bodyText).not.toContain("Core ML object detection");
  });

  test("JobTracker proof stays source-backed and privacy-safe", async ({
    page,
  }) => {
    await page.goto("/projects/jobtracker/");
    await page.waitForLoadState("domcontentloaded");

    const validation = page.locator("#validation");
    const artifacts = page.locator("#artifacts");

    await expect(
      page.getByRole("img", {
        name: "JobTracker local email classification architecture diagram",
      })
    ).toBeVisible();
    await expect(
      artifacts.getByText(EXPECTED_PROOF_ARTIFACTS.jobtrackerArchitecture)
    ).toBeVisible();
    await expect(
      artifacts.getByText(EXPECTED_PROOF_ARTIFACTS.jobtrackerReadme)
    ).toBeVisible();
    await expect(
      artifacts.getByText(EXPECTED_PROOF_ARTIFACTS.jobtrackerArchitectureDocs)
    ).toBeVisible();
    await expect(
      artifacts.getByText(EXPECTED_PROOF_ARTIFACTS.jobtrackerBackendTests)
    ).toBeVisible();
    await expect(
      artifacts.getByText(EXPECTED_PROOF_ARTIFACTS.jobtrackerBenchmark)
    ).toBeVisible();
    await expect(
      artifacts.getByText(EXPECTED_PROOF_ARTIFACTS.jobtrackerWebBeta)
    ).toBeVisible();
    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.jobtrackerBackendCoverage)
    ).toBeVisible();
    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.jobtrackerClassifierGate)
    ).toBeVisible();
    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.jobtrackerNativeBuild)
    ).toBeVisible();
    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.jobtrackerPrivacyBoundary)
    ).toBeVisible();

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("500+ emails/month");
    expect(bodyText).not.toContain("macOS 15+ Liquid Glass UI");
    expect(bodyText).not.toContain("beautiful Liquid Glass dashboard");
    expect(bodyText).not.toContain("production-ready SaaS");
    expect(bodyText).not.toContain("fully wired dashboard");
    expect(bodyText).not.toContain("SetFit is always active");
  });

  test("Master Inventory proof uses current local source counts", async ({
    page,
  }) => {
    await page.goto("/projects/master-inventory/");
    await page.waitForLoadState("domcontentloaded");

    const validation = page.locator("#validation");
    const artifacts = page.locator("#artifacts");

    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.masterInventoryRows)
    ).toBeVisible();
    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.masterInventorySchema)
    ).toBeVisible();
    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.masterInventoryTests)
    ).toBeVisible();
    await expect(
      validation.getByText(
        EXPECTED_PROOF_ARTIFACTS.masterInventoryPrivateBoundary
      )
    ).toBeVisible();
    await expect(
      artifacts.getByText(EXPECTED_PROOF_ARTIFACTS.masterInventoryProofLedger)
    ).toBeVisible();
    await expect(
      artifacts.getByRole("button", {
        name: new RegExp(
          EXPECTED_PROOF_ARTIFACTS.masterInventoryProofLedger,
          "i"
        ),
      })
    ).toHaveCount(1);

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("16,685");
    expect(bodyText).not.toContain("16.7k");
    expect(bodyText).not.toContain("OAS metadata");
    expect(bodyText).not.toContain("Google Cloud");
    expect(bodyText).not.toContain("GraphQL metadata extraction");
    expect(bodyText).not.toContain("production dashboard");
  });

  test("PolicyBot proof stays transcript-backed and deployment-safe", async ({
    page,
  }) => {
    await page.goto("/projects/policybot/");
    await page.waitForLoadState("domcontentloaded");

    const validation = page.locator("#validation");
    const artifacts = page.locator("#artifacts");

    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.policybotValidation)
    ).toBeVisible();
    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.policybotFileSearch)
    ).toBeVisible();
    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.policybotLocalTests)
    ).toBeVisible();
    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.policybotDeploymentBoundary)
    ).toBeVisible();
    await expect(
      artifacts.getByText(EXPECTED_PROOF_ARTIFACTS.policybotValidationLedger)
    ).toBeVisible();
    await expect(
      artifacts.getByRole("button", {
        name: new RegExp(
          EXPECTED_PROOF_ARTIFACTS.policybotValidationLedger,
          "i"
        ),
      })
    ).toHaveCount(1);

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("50+ institutional documents");
    expect(bodyText).not.toContain("hallucination-free");
    expect(bodyText).not.toContain("production deployment");
    expect(bodyText).not.toContain("active Slack workspace usage");
    expect(bodyText).not.toContain("runs 24/7");
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

  for (const id of CASE_STUDY_IDS) {
    test(`case study route ${id} keeps project visual contained`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/projects/${id}/`);
      await page.waitForLoadState("domcontentloaded");

      const visualFrame = page.locator(
        "#project-visual [data-project-visual-frame]"
      );
      const image = visualFrame.locator("img");

      await expect(visualFrame).toBeVisible();
      await expect(image).toBeVisible();

      const fit = await visualFrame.evaluate((frame) => {
        const image = frame.querySelector("img");
        const frameRect = frame.getBoundingClientRect();
        const imageRect = image?.getBoundingClientRect();

        return {
          hasImage: Boolean(image),
          imageObjectFit: image ? window.getComputedStyle(image).objectFit : "",
          pageOverflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
          frameHeight: Math.round(frameRect.height),
          imageHeight: imageRect ? Math.round(imageRect.height) : 0,
          imageTop: imageRect ? Math.round(imageRect.top - frameRect.top) : 0,
          imageBottom: imageRect
            ? Math.round(frameRect.bottom - imageRect.bottom)
            : 0,
          imageEscapes:
            imageRect == null ||
            imageRect.left < frameRect.left - 1 ||
            imageRect.right > frameRect.right + 1 ||
            imageRect.top < frameRect.top - 1 ||
            imageRect.bottom > frameRect.bottom + 1,
        };
      });

      expect(fit.hasImage).toBe(true);
      expect(fit.imageObjectFit).toBe("contain");
      expect(fit.pageOverflow).toBe(false);
      expect(fit.imageEscapes).toBe(false);
      expect(fit.frameHeight).toBeGreaterThanOrEqual(260);
      expect(fit.imageHeight).toBe(fit.frameHeight);
      expect(fit.imageTop).toBe(0);
      expect(fit.imageBottom).toBe(0);
    });
  }

  for (const artifact of CASE_STUDY_LOCAL_ARTIFACTS) {
    test(`case study local artifact ${artifact.projectId} / ${artifact.label} opens in dismissible viewer`, async ({
      page,
    }) => {
      await page.goto(`/projects/${artifact.projectId}/#artifacts`);
      await page.waitForLoadState("domcontentloaded");

      const startingUrl = page.url();
      const artifactControl = page
        .locator("#artifacts")
        .getByRole("button", { name: new RegExp(artifact.label, "i") });

      await expect(artifactControl).toBeVisible();
      await artifactControl.click();

      const viewer = page.getByRole("dialog", {
        name: new RegExp(artifact.label, "i"),
      });
      await expect(viewer).toBeVisible();
      await expect(
        viewer.getByRole("button", { name: /close/i })
      ).toBeVisible();
      await expect(
        viewer.getByRole("link", { name: /open original/i })
      ).toHaveAttribute("href", artifact.href);
      expect(page.url()).toBe(startingUrl);

      await viewer.getByRole("button", { name: /close/i }).click();
      await expect(viewer).toBeHidden();
      expect(page.url()).toBe(startingUrl);

      await artifactControl.click();
      await expect(viewer).toBeVisible();
      await page.getByTestId("artifact-viewer-backdrop").click({
        position: { x: 8, y: 8 },
      });
      await expect(viewer).toBeHidden();
      expect(page.url()).toBe(startingUrl);

      await artifactControl.click();
      await expect(viewer).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(viewer).toBeHidden();
      expect(page.url()).toBe(startingUrl);
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
