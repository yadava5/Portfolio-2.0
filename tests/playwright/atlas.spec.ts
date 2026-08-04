import { test, expect, Locator, Page } from "@playwright/test";
import { CHAPTERS } from "../../src/components/story/chapters";
import { PROJECT_SCENE_MANIFEST } from "../../src/components/scenes/manifest";
import {
  ATLAS_ALLOWED_METRICS,
  CASE_STUDY_LOCAL_ARTIFACTS,
  CASE_STUDY_IDS,
  EXPECTED_CONTENT,
  EXPECTED_GRADUATE_IDENTITY,
  EXPECTED_LINKS,
  EXPECTED_MASTHEAD,
  EXPECTED_PROOF_ARTIFACTS,
  EXPECTED_WORK_ROWS,
  METRIC_HOME_CHAPTER,
  NAV_SECTIONS,
  PROHIBITED_GENERATED_CONTENT,
  RECRUITER_HERO_LINKS,
  RECRUITER_HERO_LINKS_MOBILE,
  RECRUITER_HERO_METRICS,
  REQUIRED_PRIVATE_CASE_STUDIES,
} from "./portfolio-fixtures";

/**
 * Assert no fabricated claim survives on a rendered page.
 *
 * ONE implementation, because there were two and only one got fixed.
 * The 2026-08-02 provenance audit corrected Cadence's suite count to its
 * measured **1,168 tests** — and the blocklist forbids the fabricated
 * `"68 tests"`, which `1,168 tests` contains. Checked with `.toContain()`,
 * telling the truth failed the hallucination guard. Patching the copy in
 * the home test left the copy in the case-study loop red on five
 * browsers, which is the argument for a helper rather than a loop written
 * twice.
 *
 * Entries that START WITH A DIGIT are matched with a `(?<![\d,])` guard,
 * so a digit or a thousands comma in front means it is a different
 * number. Entries that begin with a letter keep the plain substring test:
 * they are phrases, and a phrase inside a longer phrase is still there.
 */
function expectNoHallucinations(bodyText: string) {
  for (const forbidden of PROHIBITED_GENERATED_CONTENT) {
    if (/^\d/.test(forbidden)) {
      const escaped = forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(bodyText).not.toMatch(new RegExp(`(?<![\\d,])${escaped}`));
    } else {
      expect(bodyText).not.toContain(forbidden);
    }
  }
}

/** The seven working-paper chapters (stable anchors, storyboard order) */
const REQUIRED_SECTIONS = NAV_SECTIONS;

const STALE_IDENTITY_COPY = [
  "Senior CS student",
  "Senior Computer Science student",
  "Expected May 2026",
  "Open to internships",
  "Current role",
  "Current work",
  "I work as an ITSM Data Integration Student Associate",
  /* Fix round 3, S13: date ranges now set with an en dash, so the guard
     names BOTH spellings of the stale range. Dropping the hyphen forms
     would have quietly retired a guard rather than kept it — a stale
     phrase pasted back in the old grammar must still fail. */
  "Jun 2025 - Present",
  "Jun 2025 – Present",
  "2025-06 - Present",
  "2025-06 – Present",
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

/** Recruiter CTA in the fixed header (compact icon links carry aria-labels) */
/** Literal text as an exact-match regex — labels carry parentheses
 *  ("Resume (opens in a new tab)"), which are regex GROUPS unescaped. */
function exactly(label: string): RegExp {
  return new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
}

function headerLink(page: Page, label: string) {
  return page
    .locator("header")
    .getByRole("link", { name: exactly(label) })
    .first();
}

/** A proof metric inside the chapter where its story now lives */
function chapterMetric(page: Page, metric: string) {
  const chapter = METRIC_HOME_CHAPTER[metric];
  return page.locator(chapter).getByText(metric).first();
}

test.describe("Daylight Study — working paper", () => {
  /* jetpack-compress has no case route yet — its row's links go to the
     live engine (external), asserted via the same fixture href. */

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
    /* Scoped to the LINK, not to free text. These two assertions mean
       "the artifact is exposed and openable", and a bare getByText for
       "v1.0.0 release" started matching the corrections register too
       once it gained a note naming that tag (the repo rename entry) —
       a strict-mode violation on prose, not a missing artifact. The
       register is allowed to discuss the artifacts; the test should
       still be asking about the links. */
    await expect(
      page.getByRole("link", {
        name: EXPECTED_PROOF_ARTIFACTS.fastMnistRelease,
      })
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: EXPECTED_PROOF_ARTIFACTS.fastMnistBenchmark,
      })
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
    /* Scoped to #validation: the corrections register intentionally
       repeats the number when it names what the erratum resolves to. */
    await expect(
      page
        .locator("#validation")
        .getByText(EXPECTED_PROOF_ARTIFACTS.fastMnistSpeedup)
    ).toBeVisible();
    /* Living scene (2026-07-24): fig. 1 is now the drawn race/forward-
       pass figure — its honest manifest disclosure replaces the old
       image disclosure; the real workbench screenshot still ships in
       #artifacts (asserted above). */
    await expect(
      page.getByText(PROJECT_SCENE_MANIFEST["fast-mnist-nn"].disclosure)
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

    /* Scoped to #artifacts: fig. 1's caption (the image alt, lowercased)
       legitimately contains the same words as the plate label. */
    await expect(
      page
        .locator("#artifacts")
        .getByText(EXPECTED_PROOF_ARTIFACTS.visualAssistArchitecture)
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

    /* Living scene (2026-07-24): fig. 1 is now the sorting-line figure
       (role="img" with its honest manifest name); the architecture
       diagram itself still ships as the #artifacts plate asserted just
       below. */
    await expect(
      page.getByRole("img", {
        name: PROJECT_SCENE_MANIFEST.jobtracker.alt,
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
    /* Re-pin round (2026-07-26). The file now claims a shipped web app,
       so the two limits that keep that claim honest are asserted, not
       merely written: the hosted classifier is rules-only, and the
       repo's own README/WEB_ARCHITECTURE are stale and NOT cited as
       evidence. Deleting either boundary row now fails the suite. */
    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.jobtrackerRulesOnlyBoundary)
    ).toBeVisible();
    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.jobtrackerStaleDocsBoundary)
    ).toBeVisible();

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("500+ emails/month");
    expect(bodyText).not.toContain("macOS 15+ Liquid Glass UI");
    expect(bodyText).not.toContain("beautiful Liquid Glass dashboard");
    expect(bodyText).not.toContain("production-ready SaaS");
    expect(bodyText).not.toContain("fully wired dashboard");
    expect(bodyText).not.toContain("SetFit is always active");
  });

  /* Cadence's isolation section (2026-07-26), in the same grammar as
     the four per-project proof tests above: the evidence is on the page
     AND the limits that keep it honest are on the page.

     Why atlas and not only dossier: dossier owns the wording of the
     inert standing (it asserts the caveat sits in both seats and that
     no phrasing promotes it). Atlas owns the recruiter-facing question
     — is the claim source-backed? So this test asserts the two headline
     security claims are visible and terminate in a PINNED artifact
     label (`@ 54c79e0`), which is the thing a reader checks. Neither
     test would catch what the other catches. */
  test("Cadence proof is pinned, and its limits ship with its numbers", async ({
    page,
  }) => {
    await page.goto("/projects/taskflow-calendar/");
    await page.waitForLoadState("domcontentloaded");

    const validation = page.locator("#validation");

    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.cadenceIdorReceipt)
    ).toBeVisible();
    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.cadenceIsolationTests)
    ).toBeVisible();
    /* Both terminate off-page at the public head where that work lives —
       a security claim with no pin is a security claim with no receipt. */
    await expect(
      validation.locator("a[href*='github.com/yadava5/cadence/blob/54c79e0']")
    ).not.toHaveCount(0);

    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.cadenceEnforcedBoundary)
    ).toBeVisible();
    await expect(
      validation.getByText(EXPECTED_PROOF_ARTIFACTS.cadenceRoleBoundary)
    ).toBeVisible();

    /* The overclaims a summariser reaches for. The middle two matter
       most: this file may never imply the database is doing the work,
       and it may never round "I ran them by hand" up to a CI badge. */
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("RLS in production");
    expect(bodyText).not.toContain("enforced at the database in production");
    expect(bodyText).not.toContain("11/11 in CI");
    expect(bodyText).not.toContain("zero known vulnerabilities");
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

  for (const id of CASE_STUDY_IDS) {
    test(`case study route ${id} includes required evidence sections`, async ({
      page,
    }) => {
      await page.goto(`/projects/${id}/`);
      await page.waitForLoadState("domcontentloaded");

      for (const section of CASE_STUDY_SECTIONS) {
        /* filter({ visible: true }): the W5a audit control renders its
           settled ledger face ("… terminate in pinned artifacts …") as
           a hidden sizing ghost BEFORE the walk, and that hidden node
           precedes the appendix in DOM order — a bare .first() resolves
           to it and can never be visible. The assertion's intent is
           unchanged: a VISIBLE occurrence of each section word must
           exist on the route. */
        await expect(
          page.getByText(section).filter({ visible: true }).first()
        ).toBeVisible();
      }

      expectNoHallucinations(await page.locator("body").innerText());
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
      await expect(visualFrame).toBeVisible();

      /* Living scenes (src/components/scenes): routes with a registered
         scene replace the static fig. 1 image with an inked SVG figure —
         assert the scene's containment instead of the image's. */
      if (PROJECT_SCENE_MANIFEST[id]) {
        const sceneSvg = visualFrame.locator("svg[role='img']").first();
        await expect(visualFrame).toHaveAttribute("data-scene", "");
        await expect(sceneSvg).toBeVisible();

        const sceneFit = await visualFrame.evaluate((frame) => {
          const svg = frame.querySelector("svg");
          const frameRect = frame.getBoundingClientRect();
          const svgRect = svg?.getBoundingClientRect();
          return {
            hasSvg: Boolean(svg),
            pageOverflow:
              document.documentElement.scrollWidth >
              document.documentElement.clientWidth,
            frameHeight: Math.round(frameRect.height),
            svgEscapes:
              svgRect == null ||
              svgRect.left < frameRect.left - 1 ||
              svgRect.right > frameRect.right + 1 ||
              svgRect.top < frameRect.top - 1 ||
              svgRect.bottom > frameRect.bottom + 1,
          };
        });
        expect(sceneFit.hasSvg).toBe(true);
        expect(sceneFit.pageOverflow).toBe(false);
        expect(sceneFit.svgEscapes).toBe(false);
        expect(sceneFit.frameHeight).toBeGreaterThanOrEqual(260);
        return;
      }

      const image = visualFrame.locator("img");
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
