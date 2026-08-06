import { test, expect, Page } from "@playwright/test";
import {
  CASE_STUDY_LOCAL_ARTIFACTS,
  CASE_STUDY_IDS,
  EXPECTED_PROOF_ARTIFACTS,
  PROHIBITED_GENERATED_CONTENT,
  REQUIRED_PRIVATE_CASE_STUDIES,
} from "./case-file-fixtures";

/**
 * THIS SUITE READS THE GENERATED ARCHIVE, 2026-08-06.
 *
 * Until Phase 4 these seven routes were rendered by `CaseStudyPage.tsx` and
 * twelve React components; they are now emitted by `scripts/archive/`, from
 * the same data layer, as static HTML. Twenty-five of these assertions went
 * red at the flip and every one of them was the test describing a mechanism
 * rather than the fact underneath it. What changed, and what each rewrite
 * asserts instead:
 *
 *   · THE ARTIFACT PLATE IS A LINK, NOT A BUTTON. The old plate was a
 *     `<button>` that opened a Radix dialog and did nothing at all without
 *     JavaScript. The new one is an `<a href>` to the artifact with a native
 *     `<dialog>` layered over it, so the click still opens the original when
 *     the script never arrives — an improvement the suite now asserts on
 *     purpose, in its own test, instead of going red about a role.
 *   · EVERY LOCAL ARTIFACT IS NAMED TWICE, by design: once in the plate's
 *     caption, once as the heading of the dialog that enlarges it. A bare
 *     `getByText(label)` therefore resolves to two elements and fails strict
 *     mode on a page that is correct. Asking for the plate asks the question
 *     the assertion always meant.
 *   · FIG. 1 IS A SETTLED PLATE ON ALL SEVEN FILES. It used to be a living
 *     React scene on four and a screenshot on three, and the tests named the
 *     scene manifest's own alt text. There is no manifest now, and no scene:
 *     a record does not move. So the assertion became a RULE that holds for
 *     every file — a drawn `svg[role="img"]` with a real accessible name, and
 *     a note that says it is not a screenshot — which is stronger than the
 *     per-file string it replaces and cannot go stale one file at a time.
 */

/** The plate in the appendix that carries this artifact — never free text. */
function artifactPlate(page: Page, label: string) {
  return page
    .locator("#artifacts a[data-viewer]")
    .filter({ hasText: label })
    .first();
}

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

const CASE_STUDY_SECTIONS = [
  "Problem",
  "Role",
  "Architecture",
  "Decisions",
  "Validation",
  "Outcomes",
  "Artifacts",
];

test.describe("Daylight Study — working paper", () => {
  /* jetpack-compress has no case route yet — its row's links go to the
     live engine (external), asserted via the same fixture href. */

  test("AutoML and Fast MNIST case studies expose artifact-backed proof", async ({
    page,
  }) => {
    await page.goto("/projects/automl/");
    await expect(
      artifactPlate(page, EXPECTED_PROOF_ARTIFACTS.automlPoster)
    ).toBeVisible();
    await expect(
      artifactPlate(page, EXPECTED_PROOF_ARTIFACTS.automlPresenterProof)
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
      artifactPlate(page, EXPECTED_PROOF_ARTIFACTS.automlPresenterProof)
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
      artifactPlate(page, EXPECTED_PROOF_ARTIFACTS.fastMnistScreenshot)
    ).toBeVisible();
    /* Scoped to #validation: the corrections register intentionally
       repeats the number when it names what the erratum resolves to. */
    await expect(
      page
        .locator("#validation")
        .getByText(EXPECTED_PROOF_ARTIFACTS.fastMnistSpeedup)
    ).toBeVisible();
    /* The plate's own disclosure. This named the scene manifest's
       `disclosure` field while fig. 1 was a running React figure; the
       manifest is deleted and the figure is settled, so the note is drawn
       from the file's own data and asserted as a rule below, per route. The
       real workbench screenshot still ships in #artifacts (asserted above),
       which is what this pair of assertions was always about: the drawing is
       labelled a drawing, and the photograph is still there. */
    await expect(page.locator("#project-visual .fc-note")).toContainText(
      "not a screenshot"
    );

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
      artifactPlate(page, EXPECTED_PROOF_ARTIFACTS.visualAssistArchitecture)
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
      artifactPlate(page, EXPECTED_PROOF_ARTIFACTS.jobtrackerArchitecture)
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
      artifactPlate(page, EXPECTED_PROOF_ARTIFACTS.masterInventoryProofLedger)
    ).toBeVisible();
    /* ONE plate, not two. The count is the assertion: this ledger is the
       file's private-safe terminal, and a duplicated plate would mean the
       appendix had grown a second, unpinned copy of it. */
    await expect(
      artifacts.locator("a[data-viewer]").filter({
        hasText: EXPECTED_PROOF_ARTIFACTS.masterInventoryProofLedger,
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
      artifactPlate(page, EXPECTED_PROOF_ARTIFACTS.policybotValidationLedger)
    ).toBeVisible();
    await expect(
      artifacts
        .locator("a[data-viewer]")
        .filter({ hasText: EXPECTED_PROOF_ARTIFACTS.policybotValidationLedger })
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
    test(`case study route ${id} draws fig. 1 as a contained, labelled plate`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/projects/${id}/`);
      await page.waitForLoadState("domcontentloaded");

      /* `.plate-inner` is the drawn plate's own rule, not a hook added for
         this test. Every behaviour hook on these pages is a data-attribute
         because something reads it at runtime; nothing reads a frame, so
         inventing `data-project-visual-frame` would be markup that exists
         only to be selected. */
      const plate = page.locator("#project-visual .plate-inner");
      await expect(plate).toBeVisible();

      /* ONE RULE FOR ALL SEVEN, which is the point. fig. 1 used to be a
         running React scene on four routes and a screenshot on three, and
         this loop branched on a manifest to say so. It is now a settled
         figure everywhere — a record does not move — so the assertion is the
         property every plate must have rather than a per-file string that can
         go stale one file at a time.

         `[role="img"]`, NOT `svg[role="img"]`. The first cut of this rule
         named the element and went red on Cadence, whose plate is a week grid
         set in HTML and type rather than drawn in SVG — which is the correct
         medium for it, and exactly the mechanism-instead-of-fact mistake the
         rest of this rewrite is undoing. What every plate owes a reader is a
         labelled figure, not a particular tag. */
      const figure = plate.locator("[role='img']").first();
      await expect(figure).toBeVisible();
      /* The narrative aria-label is a contract: it is what a screen reader
         gets INSTEAD of the figure, so a redraw that reduces it to a title is
         a regression no pixel comparison sees. The floor is 60; the shortest
         one shipping is jobtracker's at 264. */
      const label = await figure.getAttribute("aria-label");
      expect((label ?? "").length).toBeGreaterThan(60);

      /* The plate is a drawing and says so. Seven files, one sentence. */
      await expect(page.locator("#project-visual .fc-note")).toContainText(
        "not a screenshot"
      );

      const fit = await plate.evaluate((frame) => {
        const drawing = frame.querySelector("[role='img']");
        const frameRect = frame.getBoundingClientRect();
        const rect = drawing?.getBoundingClientRect();
        return {
          pageOverflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
          frameHeight: Math.round(frameRect.height),
          escapes:
            rect == null ||
            rect.left < frameRect.left - 1 ||
            rect.right > frameRect.right + 1 ||
            rect.top < frameRect.top - 1 ||
            rect.bottom > frameRect.bottom + 1,
        };
      });
      expect(fit.pageOverflow).toBe(false);
      expect(fit.escapes).toBe(false);
      expect(fit.frameHeight).toBeGreaterThanOrEqual(260);
    });
  }

  for (const artifact of CASE_STUDY_LOCAL_ARTIFACTS) {
    test(`case study local artifact ${artifact.projectId} / ${artifact.label} opens in dismissible viewer`, async ({
      page,
    }) => {
      await page.goto(`/projects/${artifact.projectId}/#artifacts`);
      await page.waitForLoadState("domcontentloaded");

      const startingUrl = page.url();
      const plate = artifactPlate(page, artifact.label);
      await expect(plate).toBeVisible();

      /* The plate is a real link to the artifact and the viewer is layered
         over it, so the href is asserted BEFORE the click: it is what a
         reader gets when the script never arrives. Resolved rather than
         compared literally — the page cites the artifact by relative path
         (`../../images/…`) because every archive page does, and the data
         layer holds the site-absolute form. */
      const expectedHref = new URL(artifact.href, startingUrl).toString();
      await expect(plate).toHaveJSProperty("href", expectedHref);

      await plate.click();

      const viewer = page.getByRole("dialog", {
        name: new RegExp(artifact.label, "i"),
      });
      await expect(viewer).toBeVisible();
      await expect(
        viewer.getByRole("button", { name: /close/i })
      ).toBeVisible();
      await expect(
        viewer.getByRole("link", { name: /open original/i })
      ).toHaveJSProperty("href", expectedHref);
      /* The plate's own navigation is prevented while the viewer is up —
         opening a figure must not cost the reader their place in the file. */
      expect(page.url()).toBe(startingUrl);

      await viewer.getByRole("button", { name: /close/i }).click();
      await expect(viewer).toBeHidden();
      expect(page.url()).toBe(startingUrl);

      /* Backdrop. A native <dialog>'s ::backdrop reports the DIALOG as the
         click target, which is what archive.js keys the dismissal off — so
         the click has to land OUTSIDE the dialog's own box, not inside it.
         `.viewer` sets padding:0, so every pixel of the element itself
         belongs to a child; clicking at its corner hits the header and
         dismisses nothing. Measured and aimed above the box instead. No test
         id, unlike the React viewer: there is no separate backdrop element to
         give one to. */
      await plate.click();
      await expect(viewer).toBeVisible();
      const box = await viewer.boundingBox();
      expect(box).not.toBeNull();
      await page.mouse.click(
        Math.max(2, Math.round(box!.x / 2)),
        Math.max(2, Math.round(box!.y / 2))
      );
      await expect(viewer).toBeHidden();
      expect(page.url()).toBe(startingUrl);

      await plate.click();
      await expect(viewer).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(viewer).toBeHidden();
      expect(page.url()).toBe(startingUrl);
    });
  }

  /* THE APPENDIX WORKS WITHOUT JAVASCRIPT, and it did not before.
     The React plate was a <button> that opened a Radix dialog: with the
     script blocked it was an inert control, and the artifact behind it had no
     way in at all. The rebuilt plate is an <a href> to the file with the
     viewer layered on top, so the enlargement is an enhancement over a
     working link rather than a replacement for one. Asserted once, on the
     file with the most plates, because it is a property of the generator. */
  test("artifact plates open the original with scripting disabled", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/projects/automl/#artifacts");

    const plates = page.locator("#artifacts a[data-viewer]");
    await expect(plates).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      const href = await plates.nth(i).getAttribute("href");
      expect(href ?? "").toMatch(/^\.\.\/\.\.\/images\/projects\/.+/);
    }
    await context.close();
  });

  for (const id of REQUIRED_PRIVATE_CASE_STUDIES) {
    test(`private proof case study ${id} is available`, async ({ page }) => {
      await page.goto(`/projects/${id}/`);
      await page.waitForLoadState("domcontentloaded");

      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      /* THE STAMP, NOT THE PROSE. This matched the strings "Private proof" or
         "work-related" anywhere on the page, which is a test of wording rather
         than of state — and it is how `automl` stayed on this list for a week
         after its repository went public, its `repoPin` was set and its stamp
         stopped rendering. The stamp is drawn from `repoPin === null`, the same
         condition that decides whether the file IS private, so asserting it
         means the list and the data cannot drift apart again in silence. */
      await expect(
        page.getByRole("img", { name: /private repository/i })
      ).toBeVisible();
    });
  }
});
