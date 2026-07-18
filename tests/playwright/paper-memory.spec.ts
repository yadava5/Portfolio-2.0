import { test, expect, type Page } from "@playwright/test";
import {
  projectCaseStudies,
  receiptAnchor,
  type CaseReceipt,
  type ProjectCaseStudy,
} from "../../src/lib/data/projectCaseStudies";

/**
 * W1 — the wondrous four (Refinement Era): press-to-sign gate,
 * stampable registry row, and the paper remembers. Contracts:
 *
 *  1. PRESS-TO-SIGN: the gate stamp is a real button. One press inks
 *     it — aria-pressed, the APPROVED plate with the visitor's local
 *     date — and persists (localStorage "paper-memory:v1:approved").
 *     On reload the stamp is ALREADY inked, dried, and never
 *     re-performs. The mailto CTA is reachable in every state.
 *  2. ONE RUN, EVERY SURFACE: approving the fig-4.1 registry row, the
 *     gate stamp, or the automl case-file registry echo approves run
 *     041 everywhere — they are the same run.
 *  3. KEYBOARD: the stamp and the registry row activate with
 *     Enter/Space on focus (real buttons, no pointer required).
 *  4. REDUCED MOTION (A7): the act still WORKS — instant state swap,
 *     zero animation.
 *  5. THE PAPER REMEMBERS: opening a case file records it once; home
 *     work rows (and the xl rail's flagship entry) ink a ✓
 *     ([data-visited]), the dossier carries its one-time "you opened
 *     this file · date" note (dried on revisit), and /evidence marks
 *     visited crosswalk links.
 *  6. RESET: clearing localStorage restores the untouched paper.
 *  7. RUN THE AUDIT (friend transposition #3): one control per case
 *     file walks the [ validation ] rows at a 350ms cadence — a pine
 *     tick only where the artifact resolves, an honest ink dash on
 *     described-only and HELD rows — and settles on "audit walked ·
 *     N of M receipts terminate in artifacts · date" (N/M from the
 *     REAL rows). Persisted per file ("paper-memory:v1:audits"):
 *     revisits are dried with the ORIGINAL date, no re-walk. Static
 *     worlds apply instantly. The walk never auto-approves run 041.
 */

/** Storage keys (mirrors src/lib/paperMemory.ts) */
const APPROVAL_KEY = "paper-memory:v1:approved";
const AUDITS_KEY = "paper-memory:v1:audits";

/** The mono voice's date for today — same format the page writes */
function todayLabel(): string {
  return new Date()
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toLowerCase();
}

function isDesktopXl(page: Page) {
  return (page.viewportSize()?.width ?? 0) >= 1280;
}

/** The one laid-out gate stamp (desktop or compact seat) */
function stamp(page: Page) {
  return page.locator("[data-stamp]:visible");
}

/** The 041 registry-row approve control on the current page */
function registryButton(page: Page) {
  return page.locator("[data-registry-approve]");
}

/** A case study by id (the data IS the spec for N/M) */
function studyOf(projectId: string): ProjectCaseStudy {
  const study = projectCaseStudies.find(
    (candidate) => candidate.projectId === projectId
  );
  if (!study) throw new Error(`no case study: ${projectId}`);
  return study;
}

/**
 * The audit's honesty rule, restated independently of the impl: a row
 * earns the pine tick only when it terminates in an artifact AND is
 * not stamped HELD; described-only and HELD rows get the ink dash.
 */
function rowTicks(row: CaseReceipt): boolean {
  return !row.held && row.artifacts.length > 0;
}

/** Real-row expectations for one case file's walk */
function auditExpectations(study: ProjectCaseStudy): {
  rows: CaseReceipt[];
  total: number;
  verified: number;
} {
  const rows = [...study.receipts, ...study.outcomes];
  return {
    rows,
    total: rows.length,
    verified: rows.filter(rowTicks).length,
  };
}

/** The settled line's exact text for a file, from the REAL rows */
function settledText(study: ProjectCaseStudy, label = todayLabel()): string {
  const { total, verified } = auditExpectations(study);
  return `audit walked · ${verified} of ${total} receipts terminate in artifacts · ${label}`;
}

/** Snapshot every receipt row's audit mark state in one pass */
async function markSnapshot(page: Page): Promise<
  {
    audit: string | null;
    tick: boolean;
    dash: boolean;
    opacity: string;
    hidden: string | null;
  }[]
> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-receipt-row]")).map((row) => {
      const mark = row.querySelector(".audit-mark");
      return {
        audit: row.getAttribute("data-audit"),
        tick: Boolean(row.querySelector(".audit-mark-tick")),
        dash: Boolean(row.querySelector(".audit-mark-dash")),
        opacity: mark ? getComputedStyle(mark).opacity : "missing",
        hidden: mark ? mark.getAttribute("aria-hidden") : null,
      };
    })
  );
}

test.describe("paper memory — press-to-sign", () => {
  test("pressing the stamp inks it, echoes on every surface, persists", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });

    /* The mailto is reachable BEFORE any approval — the act gates
       nothing (and the quiet echo line is not yet visible) */
    await expect(
      page.locator('#gate a[href^="mailto:"]').first()
    ).toBeVisible();
    await expect(page.locator("[data-approved-hello]")).toHaveCount(0);

    const gateStamp = stamp(page);
    await expect(gateStamp).toHaveAttribute("aria-pressed", "false");
    await expect(gateStamp).toHaveAccessibleName(
      /approve run no\. 041 — press to sign/i
    );

    await gateStamp.click();

    /* Inked: state, accessible name with the visitor's own date, and
       the APPROVED plate lettering */
    const label = todayLabel();
    await expect(gateStamp).toHaveAttribute("aria-pressed", "true");
    await expect(gateStamp).toHaveAttribute("data-inked", "");
    await expect(gateStamp).toHaveAccessibleName(
      new RegExp(`approved — run no\\. 041 · ${label}`, "i")
    );
    await expect(gateStamp.locator(".stamp-inked")).toContainText("APPROVED");
    await expect(gateStamp.locator(".stamp-inked")).toContainText(
      `run no. 041 · ${label}`
    );

    /* The same run everywhere: fig 4.1's row strikes + marks approved,
       and the CTA gains its quiet echo (mailto still reachable) */
    await expect(registryButton(page)).toHaveAttribute("aria-pressed", "true");
    await expect(registryButton(page)).toHaveAttribute("data-approved", "");
    await expect(page.locator("[data-approved-hello]")).toHaveText(
      "run approved — say hello"
    );
    await expect(
      page.locator('#gate a[href^="mailto:"]').first()
    ).toBeVisible();

    /* Persisted with the date of the act */
    const stored = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      APPROVAL_KEY
    );
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).label).toBe(label);

    /* Reload: already inked — dried, dated, never re-performed */
    await page.reload();
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    const restored = stamp(page);
    await expect(restored).toHaveAttribute("aria-pressed", "true");
    await expect(restored).toHaveAttribute("data-inked", "");
    await expect(restored.locator(".stamp-inked")).toContainText(
      `run no. 041 · ${label}`
    );
    await expect(restored).not.toHaveClass(/is-inking/);
    await expect(registryButton(page)).toHaveAttribute("aria-pressed", "true");

    /* Pressing dried ink is a no-op */
    await restored.click();
    await expect(restored).toHaveAttribute("aria-pressed", "true");
    expect(
      await page.evaluate(
        (key) => window.localStorage.getItem(key),
        APPROVAL_KEY
      )
    ).toBe(stored);
  });

  test("the registry row approves the same run — both directions", async ({
    page,
  }) => {
    /* Home fig 4.1 → the gate stamp */
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    const row = registryButton(page);
    await expect(row).toHaveAttribute("aria-pressed", "false");
    await row.click();
    await expect(row).toHaveAttribute("data-approved", "");
    await expect(stamp(page)).toHaveAttribute("aria-pressed", "true");
    await expect(stamp(page)).toHaveAttribute("data-inked", "");

    /* The automl case-file registry echo shows the same approval */
    await page.goto("/projects/automl/");
    await expect(registryButton(page)).toHaveAttribute("aria-pressed", "true");
    await expect(registryButton(page)).toHaveAttribute("data-approved", "");

    /* Reverse: a fresh visitor approving ON the case file signs the
       homepage stamp too */
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    const echo = registryButton(page);
    await expect(echo).toHaveAttribute("aria-pressed", "false");
    await echo.click();
    await expect(echo).toHaveAttribute("data-approved", "");
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    await expect(stamp(page)).toHaveAttribute("aria-pressed", "true");
    await expect(stamp(page)).toHaveAttribute("data-inked", "");
  });

  test("keyboard approval: the stamp is a real button — Enter signs", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });

    const gateStamp = stamp(page);
    await gateStamp.focus();
    await expect(gateStamp).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(gateStamp).toHaveAttribute("aria-pressed", "true");
    await expect(gateStamp).toHaveAttribute("data-inked", "");
  });
});

test.describe("paper memory — reduced motion (A7)", () => {
  test("the act still works: instant swap, zero animation", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });

    /* Space activates too (a real button under the keyboard) */
    const gateStamp = stamp(page);
    await gateStamp.focus();
    await page.keyboard.press("Space");

    await expect(gateStamp).toHaveAttribute("aria-pressed", "true");
    const state = await page.evaluate(() => {
      const host = Array.from(
        document.querySelectorAll<HTMLElement>("[data-stamp]")
      ).find((el) => el.offsetWidth > 0);
      if (!host) return null;
      const plate = host.querySelector(".stamp-plate");
      const inked = host.querySelector(".stamp-inked");
      const awaiting = host.querySelector(".stamp-awaiting");
      if (!plate || !inked || !awaiting) return null;
      return {
        plateAnimation: getComputedStyle(plate).animationName,
        inkedAnimation: getComputedStyle(inked).animationName,
        inkedOpacity: getComputedStyle(inked).opacity,
        awaitingOpacity: getComputedStyle(awaiting).opacity,
      };
    });
    expect(state).not.toBeNull();
    /* No animation exists in this world — the swap IS the interaction */
    expect(state!.plateAnimation).toBe("none");
    expect(state!.inkedAnimation).toBe("none");
    expect(state!.inkedOpacity).toBe("0.92");
    expect(state!.awaitingOpacity).toBe("0");
  });
});

test.describe("paper memory — thread-as-citation", () => {
  test("hovering a citing receipt row draws the stroke to its plate", async ({
    page,
  }) => {
    test.skip(
      (page.viewportSize()?.width ?? 0) < 1024,
      "the citation stroke is desktop-only (≥1024, hover)"
    );
    await page.goto("/projects/automl/");
    await page.locator("html.lenis").waitFor({ state: "attached" });

    /* The always-present mono affordance: the citation link is
       sharpened to the plate anchor, and the plate exists */
    const row = page.locator("[data-cites='6']").first();
    await expect(row.locator('a[href="#fig-6"]').first()).toBeVisible();
    await expect(page.locator("#fig-6")).toBeAttached();

    /* Hover: the pen stroke draws (~400ms) to fully inked */
    await row.hover();
    const stroke = page.locator("[data-citation-ink] path.citation-stroke");
    await expect(stroke).toHaveClass(/is-drawn/);
    await expect
      .poll(
        () =>
          stroke.evaluate((el) =>
            parseFloat(getComputedStyle(el).strokeDashoffset)
          ),
        { timeout: 5_000 }
      )
      .toBeLessThan(0.05);

    /* Blur: the stroke retracts */
    await page.mouse.move(4, 4);
    await expect(stroke).not.toHaveClass(/is-drawn/);
    await expect
      .poll(
        () =>
          stroke.evaluate((el) =>
            parseFloat(getComputedStyle(el).strokeDashoffset)
          ),
        { timeout: 5_000 }
      )
      .toBeGreaterThan(1.3);
  });

  test("static worlds carry the text citation only — no stroke machinery", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/projects/automl/");
    await page.locator("[data-receipt-row]").first().waitFor();

    /* A7: the overlay never mounts without the engine */
    await expect(page.locator("[data-citation-ink]")).toHaveCount(0);
    /* The mono link stands alone, still precise */
    await expect(
      page.locator("[data-cites] a[href^='#fig-']").first()
    ).toBeVisible();
  });
});

test.describe("paper memory — run the audit", () => {
  test("the walk ticks only artifact-backed rows and settles the honest count", async ({
    page,
  }) => {
    const automl = studyOf("automl");
    const { rows, total, verified } = auditExpectations(automl);
    /* The data must really carry described-only rows, or the dash
       assertion below would be vacuous */
    expect(rows.some((row) => !row.held && row.artifacts.length === 0)).toBe(
      true
    );
    expect(verified).toBeLessThan(total);

    await page.goto("/projects/automl/");
    await page.locator("[data-receipt-row]").first().waitFor();

    /* The control: one per file, apparatus voice, described for SR */
    const control = page.locator("[data-audit-run]");
    await expect(control).toHaveCount(1);
    await expect(control).toContainText("run the audit");
    const descId = await control.getAttribute("aria-describedby");
    expect(descId).toBeTruthy();
    await expect(page.locator(`#${descId}`)).toContainText(
      "walks the receipts"
    );

    /* Untouched paper: no ticks, no settled line, 041 still awaiting */
    await expect(page.locator("[data-audit-ticked]")).toHaveCount(0);
    await expect(page.locator("[data-audit-settled]")).toHaveCount(0);
    await expect(registryButton(page)).toHaveAttribute("aria-pressed", "false");

    const before = Date.now();
    await control.click();

    /* Every row gains its mark; the settled line carries N/M computed
       from the REAL rows plus the visitor's own date */
    await expect(page.locator("[data-audit-ticked]")).toHaveCount(total, {
      timeout: 15_000,
    });
    await expect(page.locator("[data-audit-settled]")).toHaveText(
      settledText(automl),
      { timeout: 5_000 }
    );

    /* A deliberate cadence, not a blink: the timers alone guarantee
       the walk takes at least (rows − 1) × 350ms */
    expect(Date.now() - before).toBeGreaterThanOrEqual((total - 1) * 350);

    /* The audit is honest: pine tick ONLY where the artifact resolves;
       described-only rows (automl rows exist by the guard above) carry
       the ink dash — and every mark is aria-hidden decoration */
    const marks = await markSnapshot(page);
    expect(marks).toHaveLength(total);
    rows.forEach((row, index) => {
      const expected = row.held
        ? "held"
        : row.artifacts.length > 0
          ? "artifact"
          : "described";
      expect(marks[index].audit, `row ${index + 1} audit state`).toBe(expected);
      expect(marks[index].tick, `row ${index + 1} tick`).toBe(rowTicks(row));
      expect(marks[index].dash, `row ${index + 1} dash`).toBe(!rowTicks(row));
      expect(marks[index].opacity, `row ${index + 1} mark opacity`).toBe("1");
      expect(marks[index].hidden, `row ${index + 1} aria-hidden`).toBe("true");
    });

    /* NEVER auto-approve: run 041 remains the reader's own act */
    await expect(registryButton(page)).toHaveAttribute("aria-pressed", "false");
    expect(
      await page.evaluate(
        (key) => window.localStorage.getItem(key),
        APPROVAL_KEY
      )
    ).toBeNull();

    /* Persisted per file with the walk date */
    const stored = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      AUDITS_KEY
    );
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).automl.label).toBe(todayLabel());
  });

  test("revisits show dried ticks and keep the original walk date", async ({
    page,
  }) => {
    const automl = studyOf("automl");
    const { total } = auditExpectations(automl);

    await page.goto("/projects/automl/");
    await page.locator("[data-audit-run]").click();
    await expect(page.locator("[data-audit-settled]")).toBeVisible({
      timeout: 15_000,
    });
    const stored = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      AUDITS_KEY
    );

    /* Reload: walked is walked — ticks applied dried (no re-walk
       animation), the settled line already there with the SAME date */
    await page.reload();
    await expect(page.locator("#validation[data-audit-dried]")).toBeAttached();
    await expect(page.locator("[data-audit-ticked]")).toHaveCount(total);
    await expect(page.locator(".audit-settled")).toHaveClass(/is-dried/);
    await expect(page.locator("[data-audit-settled]")).toHaveText(
      settledText(automl)
    );

    /* The control dries with it: no re-run affordance — aria-disabled
       (which Playwright itself refuses to click), and even a forced
       press changes nothing */
    const control = page.locator("[data-audit-run]");
    await expect(control).toHaveAttribute("data-walked", "");
    await expect(control).toHaveAttribute("aria-disabled", "true");
    await control.click({ force: true });
    await page.waitForTimeout(400);
    expect(
      await page.evaluate((key) => window.localStorage.getItem(key), AUDITS_KEY)
    ).toBe(stored);
  });

  test("static worlds: instant application, same settled line — every file", async ({
    page,
  }) => {
    /* The corpus must carry at least one HELD row somewhere, so the
       held-dash rule is really exercised by this loop */
    expect(
      projectCaseStudies.some((study) =>
        [...study.receipts, ...study.outcomes].some((row) => row.held)
      )
    ).toBe(true);

    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const study of projectCaseStudies) {
      const { rows, total } = auditExpectations(study);
      await page.goto(`/projects/${study.projectId}/`);
      await page.locator("[data-receipt-row]").first().waitFor();

      const before = Date.now();
      await page.locator("[data-audit-run]").click();
      await expect(page.locator("[data-audit-ticked]")).toHaveCount(total, {
        timeout: 2_000,
      });
      /* Instant, not walked: strictly faster than the cadence floor */
      expect(Date.now() - before).toBeLessThan((total - 1) * 350);
      await expect(page.locator("[data-audit-settled]")).toHaveText(
        settledText(study)
      );

      const marks = await markSnapshot(page);
      rows.forEach((row, index) => {
        expect(
          marks[index].tick,
          `${study.projectId} row ${index + 1} tick`
        ).toBe(rowTicks(row));
        expect(
          marks[index].dash,
          `${study.projectId} row ${index + 1} dash`
        ).toBe(!rowTicks(row));
        expect(
          marks[index].opacity,
          `${study.projectId} row ${index + 1} opacity`
        ).toBe("1");
      });

      await expect(page.locator("[data-audit-run]")).toHaveAttribute(
        "aria-disabled",
        "true"
      );
    }
  });

  test("keyboard: Enter runs the audit from the control", async ({ page }) => {
    const study = studyOf("fast-mnist-nn");
    const { total } = auditExpectations(study);

    await page.goto("/projects/fast-mnist-nn/");
    const control = page.locator("[data-audit-run]");
    await control.focus();
    await expect(control).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page.locator("[data-audit-ticked]")).toHaveCount(total, {
      timeout: 15_000,
    });
    await expect(page.locator("[data-audit-settled]")).toHaveText(
      settledText(study),
      { timeout: 5_000 }
    );
    /* The HELD row's number is dashed, never ticked — held means held */
    const heldRow = page.locator(`#${receiptAnchor("fast-mnist-nn", 1)}`);
    await expect(heldRow).toHaveAttribute("data-audit", "held");
    await expect(heldRow.locator(".audit-mark-dash")).toHaveCount(1);
    await expect(heldRow.locator(".audit-mark-tick")).toHaveCount(0);
  });
});

test.describe("paper memory — the paper remembers", () => {
  test("opening a case file inks the ✓s and the one-time note", async ({
    page,
  }) => {
    /* First opening: the note appears settled, dated today */
    await page.goto("/projects/jobtracker/");
    const note = page.locator("[data-file-memory]");
    await expect(note).toHaveText(`you opened this file · ${todayLabel()}`);
    await expect(note).not.toHaveClass(/is-dried/);

    /* Revisit: dried ink — same date, no performance */
    await page.reload();
    await expect(page.locator("[data-file-memory]")).toHaveText(
      `you opened this file · ${todayLabel()}`
    );
    await expect(page.locator("[data-file-memory]")).toHaveClass(/is-dried/);

    /* Home: the jobtracker work row carries the ✓; unvisited rows don't */
    await page.goto("/");
    await page.locator("#work").waitFor({ state: "attached" });
    const jobtrackerRow = page
      .locator("#work article")
      .filter({ hasText: /jobtracker/i });
    await expect(
      jobtrackerRow.locator(".visited-mark[data-visited]")
    ).toBeAttached();
    const mnistRow = page
      .locator("#work article")
      .filter({ hasText: /fast-mnist/i });
    await expect(mnistRow.locator(".visited-mark[data-visited]")).toHaveCount(
      0
    );

    /* /evidence: crosswalk links into the visited file are marked */
    await page.goto("/evidence/");
    await expect(
      page
        .locator('li:has(a[href*="/projects/jobtracker/"])')
        .locator(".visited-mark[data-visited]")
        .first()
    ).toBeAttached();
    await expect(
      page
        .locator('li:has(a[href*="/projects/policybot/"])')
        .locator(".visited-mark[data-visited]")
    ).toHaveCount(0);
  });

  test("the xl rail remembers the flagship file across sessions", async ({
    page,
  }) => {
    test.skip(!isDesktopXl(page), "the chapter rail is xl+ only");

    await page.goto("/");
    await page.locator("#work").waitFor({ state: "attached" });
    await expect(page.locator(".rail-mark[data-visited]")).toHaveCount(0);

    await page.goto("/projects/automl/");
    await expect(page.locator("[data-file-memory]")).toBeVisible();

    await page.goto("/");
    await page.locator("#work").waitFor({ state: "attached" });
    /* Chapter 04 IS the automl file — its mark is now persistent */
    await expect(page.locator(".rail-mark[data-visited]")).toHaveCount(1);
  });

  test("clearing localStorage resets the whole paper", async ({ page }) => {
    /* Leave every kind of ink first — including a walked audit */
    await page.goto("/projects/automl/");
    await expect(page.locator("[data-file-memory]")).toBeVisible();
    await registryButton(page).click();
    await expect(registryButton(page)).toHaveAttribute("data-approved", "");
    await page.locator("[data-audit-run]").click();
    await expect(page.locator("[data-audit-settled]")).toBeVisible({
      timeout: 15_000,
    });

    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    await expect(stamp(page)).toHaveAttribute("aria-pressed", "true");

    /* The reset: a visitor's right to a clean sheet */
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });

    await expect(stamp(page)).toHaveAttribute("aria-pressed", "false");
    await expect(stamp(page)).not.toHaveAttribute("data-inked", "");
    await expect(stamp(page).locator(".stamp-awaiting")).toContainText(
      "awaiting your signature"
    );
    await expect(registryButton(page)).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-visited]")).toHaveCount(0);
    await expect(page.locator("[data-approved-hello]")).toHaveCount(0);

    await page.goto("/projects/automl/");
    const note = page.locator("[data-file-memory]");
    /* The file forgets too — and remembers freshly (a new first visit) */
    await expect(note).not.toHaveClass(/is-dried/);
    await expect(note).toHaveText(`you opened this file · ${todayLabel()}`);
    /* The audit resets with it: clean rows, live control, no settled line */
    await expect(page.locator("[data-audit-ticked]")).toHaveCount(0);
    await expect(page.locator("[data-audit-settled]")).toHaveCount(0);
    await expect(page.locator("[data-audit-run]")).not.toHaveAttribute(
      "data-walked",
      ""
    );
  });
});
