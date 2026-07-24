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
 *  7. RUN THE AUDIT (friend transposition #3, W5 capture split + payoff
 *     transform): one control per case file walks the [ validation ]
 *     rows at a 350ms cadence — a stamp-rust tick only where a
 *     pinned/checked-in artifact resolves, a hollow ring where every
 *     terminal is an on-page poster/deck capture, an honest ink dash on
 *     described-only and HELD rows — and the control ITSELF settles
 *     into the ledger line at the table head: "audit walked · A of T
 *     terminate in pinned artifacts [· C in page captures] [· D
 *     described only] [· H held] · date", every count derived from the
 *     REAL rows and matching the DOM marks exactly. Persisted per file
 *     ("paper-memory:v1:audits"): revisits are dried with the ORIGINAL
 *     date, no re-walk. Static worlds apply instantly. The walk never
 *     auto-approves run 041.
 */

/** Storage keys (mirrors src/lib/paperMemory.ts) */
const APPROVAL_KEY = "paper-memory:v1:approved";
const VISITED_KEY = "paper-memory:v1:visited";
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
 * The audit's honesty rule, restated independently of the impl (W5
 * capture split): HELD rows never tick, whatever links they carry; a
 * row with no artifacts is described-only (dash); a row whose EVERY
 * terminal is an on-page poster/deck capture (`capture: true`) earns
 * only the hollow ring; only a row with at least one pinned/checked-in
 * terminal earns the tick.
 */
function rowState(
  row: CaseReceipt
): "artifact" | "capture" | "described" | "held" {
  if (row.held) return "held";
  if (row.artifacts.length === 0) return "described";
  return row.artifacts.some((artifact) => !artifact.capture)
    ? "artifact"
    : "capture";
}

/** Real-row expectations for one case file's walk */
function auditExpectations(study: ProjectCaseStudy): {
  rows: CaseReceipt[];
  total: number;
  artifact: number;
  capture: number;
  described: number;
  held: number;
} {
  const rows = [...study.receipts, ...study.outcomes];
  const tally = { artifact: 0, capture: 0, described: 0, held: 0 };
  for (const row of rows) tally[rowState(row)] += 1;
  return { rows, total: rows.length, ...tally };
}

/** The settled ledger line's exact text for a file, from the REAL rows —
 *  composed here independently so the page's arithmetic AND wording are
 *  cross-checked, never copied. Zero segments are omitted; the leading
 *  pinned-artifact clause always prints (an honest "0 of 8"). */
function settledText(study: ProjectCaseStudy, label = todayLabel()): string {
  const { total, artifact, capture, described, held } =
    auditExpectations(study);
  const parts = [
    "audit walked",
    `${artifact} of ${total} terminate in pinned artifacts`,
  ];
  if (capture > 0) parts.push(`${capture} in page captures`);
  if (described > 0) parts.push(`${described} described only`);
  if (held > 0) parts.push(`${held} held`);
  parts.push(label);
  return parts.join(" · ");
}

/** The glyph a state must render (tick / ring / dash — one per row) */
function glyphOf(state: ReturnType<typeof rowState>): {
  tick: boolean;
  ring: boolean;
  dash: boolean;
} {
  return {
    tick: state === "artifact",
    ring: state === "capture",
    dash: state === "described" || state === "held",
  };
}

/** Snapshot every receipt row's audit mark state in one pass */
async function markSnapshot(page: Page): Promise<
  {
    audit: string | null;
    tick: boolean;
    ring: boolean;
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
        ring: Boolean(row.querySelector(".audit-mark-ring")),
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
    await page.locator("header[data-lenis-connected='true']").waitFor({ state: "attached", timeout: 5000 });

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
  test("the walk marks each row honestly and settles the exact count", async ({
    page,
  }) => {
    const automl = studyOf("automl");
    const { rows, total, capture, described } = auditExpectations(automl);
    /* The data must really carry described-only AND capture-only rows,
       or the dash/ring assertions below would be vacuous. The automl
       file is the capture split's whole point: poster/deck citations
       must never tick like repo-pinned artifacts. */
    expect(described).toBeGreaterThan(0);
    expect(capture).toBeGreaterThan(0);
    expect(rows.length).toBe(total);

    await page.goto("/projects/automl/");
    await page.locator("[data-receipt-row]").first().waitFor();

    /* The control: one per file, apparatus voice, described for SR */
    const control = page.locator("[data-audit-run]");
    await expect(control).toHaveCount(1);
    /* Item 3b — the resting hint names the real stake (derived count,
       never hardcoded): the T claims the settled line will resolve. */
    await expect(control).toContainText(`walk the ${total} claims`);
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

    /* The audit is honest: tick ONLY where a pinned artifact resolves,
       ring ONLY on capture-terminated rows, dash on described/HELD —
       and every mark is aria-hidden decoration. These per-row glyphs
       are what the settled line's counts must reconcile against. */
    const marks = await markSnapshot(page);
    expect(marks).toHaveLength(total);
    rows.forEach((row, index) => {
      const state = rowState(row);
      const glyph = glyphOf(state);
      expect(marks[index].audit, `row ${index + 1} audit state`).toBe(state);
      expect(marks[index].tick, `row ${index + 1} tick`).toBe(glyph.tick);
      expect(marks[index].ring, `row ${index + 1} ring`).toBe(glyph.ring);
      expect(marks[index].dash, `row ${index + 1} dash`).toBe(glyph.dash);
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
        const glyph = glyphOf(rowState(row));
        expect(
          marks[index].tick,
          `${study.projectId} row ${index + 1} tick`
        ).toBe(glyph.tick);
        expect(
          marks[index].ring,
          `${study.projectId} row ${index + 1} ring`
        ).toBe(glyph.ring);
        expect(
          marks[index].dash,
          `${study.projectId} row ${index + 1} dash`
        ).toBe(glyph.dash);
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

    /* Home: the jobtracker (Applied) work row carries the ✓; unvisited
       rows don't. Rows render the product title, so filter on the
       rendered name — Applied for the opened jobtracker file, Glyph for
       the unvisited fast-mnist file. */
    await page.goto("/");
    await page.locator("#work").waitFor({ state: "attached" });
    const jobtrackerRow = page
      .locator("#work article")
      .filter({ hasText: /applied/i });
    await expect(
      jobtrackerRow.locator(".visited-mark[data-visited]")
    ).toBeAttached();
    const mnistRow = page
      .locator("#work article")
      .filter({ hasText: /glyph/i });
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
    /* Item 3a — the awaiting micro-label is the imperative invitation */
    await expect(stamp(page).locator(".stamp-awaiting")).toContainText(
      "press here to sign"
    );
    await expect(registryButton(page)).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-visited]")).toHaveCount(0);
    await expect(page.locator("[data-approved-hello]")).toHaveCount(0);
    /* W5: the closing manifest forgets with the rest of the paper */
    await expect(page.locator("[data-on-file]")).toHaveCount(0);

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

/**
 * W6 — the crescendo. The ending has to LAND: the APPROVED plate is the
 * single most-saturated note on the site (a reserved ember, clay-night
 * everywhere it isn't inked), the press reads as a physical strike (the
 * stamp-press thunk on the plate, nothing reflowing), and the awaiting
 * stamp pulls the hand in with a one-time on-enter beat — gated so a
 * static world gets the resting stamp, no motion at all (A7).
 */
test.describe("W6 — the crescendo lands", () => {
  /** #f57a3e clay-ember and #e08a5f clay-night, as computed rgb() */
  const EMBER_RGB = "rgb(245, 122, 62)";
  const CLAY_NIGHT_RGB = "rgb(224, 138, 95)";

  test("the APPROVED plate inks the reserved ember; the awaiting layer stays clay-night", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    const gate = stamp(page);
    /* The inked layer carries the loudest chroma on the site... */
    await expect(gate.locator(".stamp-inked")).toHaveCSS("color", EMBER_RGB);
    /* ...and the awaiting layer keeps the calmer clay-night: the ember is
       reserved, the crescendo is a real chromatic peak, not the norm. */
    await expect(gate.locator(".stamp-awaiting")).toHaveCSS(
      "color",
      CLAY_NIGHT_RGB
    );
  });

  test("pressing performs the letterpress thunk on the plate, then dries and persists", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    const gate = stamp(page);
    await gate.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await gate.click();
    /* The press is live: is-inking rides the ~750ms strike, and the
       transform lives on the plate (nothing in layout moves — the Red
       Thread measures the untransformed wrapper). */
    await expect(gate).toHaveClass(/is-inking/, { timeout: 4000 });
    await expect(gate.locator(".stamp-plate")).toHaveCSS(
      "animation-name",
      "stamp-press"
    );
    /* It dries to the persisted state: the class clears, the plate rests,
       APPROVED stays inked. */
    await expect(gate).not.toHaveClass(/is-inking/, { timeout: 4000 });
    await expect(gate.locator(".stamp-plate")).toHaveCSS(
      "animation-name",
      "none"
    );
    await expect(gate).toHaveAttribute("data-inked", "");
  });

  test("the awaiting stamp beats once as it scrolls into view (motion world)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    const gate = stamp(page);
    /* Off-screen at load: the beat is armed, not yet fired. */
    await expect(gate).not.toHaveClass(/is-noticing/);
    await gate.evaluate((el) => el.scrollIntoView({ block: "center" }));
    /* Entering the viewport arms the single attention beat (item 3a). */
    await expect(gate).toHaveClass(/is-noticing/, { timeout: 4000 });
  });

  test("A7 — the on-enter beat never arms under reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    const gate = stamp(page);
    await gate.evaluate((el) => el.scrollIntoView({ block: "center" }));
    /* Give any observer its chance — a static world must stay static. */
    await page.waitForTimeout(700);
    await expect(gate).not.toHaveClass(/is-noticing/);
  });
});

/* ── W5 round B: the closing "on file:" manifest ──────────────────────
   The gate chapter's margin manifest renders the visitor's OWN audit
   trail — and only that. Contracts:
     - empty store → nothing renders (no head, no ceremony);
     - every segment derives from a real store entry: visited count,
       walked audits by name (1: "{id} audit walked" · 2: "{a} + {b}
       audits walked" · 3+: "N audits walked", store order), and the
       approval WITH its stored date label;
     - unrecorded items never render — segments without entries are
       absent, ids outside the real case-file set are filtered;
     - a stored trail restores DRIED (static); a live act (signing while
       on the page) inks the line through the subscribe channel. */
test.describe("paper memory — the on-file manifest", () => {
  /** A fixed on-record date: assertions never depend on the run date */
  const RECORD = { iso: "2026-07-18", label: "jul 18, 2026" };

  /** Seed the store before any page script runs (the dried-restore
   *  path). Init scripts replay on EVERY navigation, so each key seeds
   *  only when absent — an in-test rewrite survives a reload. */
  async function seedStore(
    page: Page,
    seed: {
      visited?: Record<string, typeof RECORD>;
      audits?: Record<string, typeof RECORD>;
      approval?: typeof RECORD;
    }
  ) {
    await page.addInitScript(
      ([keys, data]) => {
        const seedOnce = (key: string, value: unknown) => {
          if (value && window.localStorage.getItem(key) === null) {
            window.localStorage.setItem(key, JSON.stringify(value));
          }
        };
        seedOnce(keys.visited, data.visited);
        seedOnce(keys.audits, data.audits);
        seedOnce(keys.approval, data.approval);
      },
      [
        { visited: VISITED_KEY, audits: AUDITS_KEY, approval: APPROVAL_KEY },
        seed,
      ] as const
    );
  }

  /** The one laid-out manifest seat (desktop column or the mobile seat) */
  function manifest(page: Page) {
    return page.locator("[data-on-file]:visible");
  }

  test("an empty store renders nothing — no invented ceremony", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    /* Post-hydration beat: the stamp's own storage effect has run once
       its aria state is provable, so the manifest's has too */
    await expect(stamp(page)).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-on-file]")).toHaveCount(0);
    await expect(page.locator(".on-file-manifest").first()).toHaveText("");
  });

  test("a seeded trail composes the exact line — every count from the store", async ({
    page,
  }) => {
    await seedStore(page, {
      visited: { jobtracker: RECORD, automl: RECORD },
      audits: { jobtracker: RECORD },
      approval: RECORD,
    });
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });

    await expect(manifest(page)).toHaveText(
      "on file: 2 case files opened · jobtracker audit walked · " +
        "run 041 approved, jul 18, 2026"
    );
    /* Restored ink is dried — static on revisit, no settle performance */
    await expect(manifest(page)).toHaveClass(/is-dried/);
  });

  test("unrecorded items never render — approval alone, garbage filtered", async ({
    page,
  }) => {
    await seedStore(page, {
      approval: RECORD,
      /* A planted id that is not a case file must never be dressed up */
      audits: { "not-a-case-file": RECORD },
    });
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });

    /* Exact text: no opened segment, no walked segment, no garbage id */
    await expect(manifest(page)).toHaveText(
      "on file: run 041 approved, jul 18, 2026"
    );
  });

  test("audit naming: one by name, two by name, three by count", async ({
    page,
  }) => {
    await seedStore(page, {
      audits: { jobtracker: RECORD, "fast-mnist-nn": RECORD },
    });
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    await expect(manifest(page)).toHaveText(
      "on file: jobtracker + fast-mnist-nn audits walked"
    );

    /* Three or more walks fold to the honest count */
    await page.evaluate(
      ([key, record]) => {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            jobtracker: record,
            "fast-mnist-nn": record,
            automl: record,
          })
        );
      },
      [AUDITS_KEY, RECORD] as const
    );
    await page.reload();
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    await expect(manifest(page)).toHaveText("on file: 3 audits walked");
  });

  test("signing while on the page inks the manifest live", async ({ page }) => {
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    await expect(stamp(page)).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-on-file]")).toHaveCount(0);

    await stamp(page).click();
    /* The subscribe channel carries the act into the manifest, with the
       visitor's own date — no reload, no other recorded segments */
    await expect(manifest(page)).toHaveText(
      `on file: run 041 approved, ${todayLabel()}`
    );
  });
});

/**
 * W7 — the last inch. Two of the banked visitor elevations: the awaiting
 * invitation warms toward the ember it unlocks (item 2a — leads the eye
 * to the act without stealing the reserved crescendo peak), and the first
 * live signature makes the page register the blow (item 1b — a 1px
 * transform settle on the on-file manifest, gated so static worlds simply
 * see the line appear). The deepened strike (item 1a) and the legible
 * stamp date (item 3) are covered by the W6 strike test + the manifest
 * date assertions above; both keep the same DOM contracts.
 */
test.describe("W7 — the last inch", () => {
  /** #ec814d clay-invite · #f57a3e ember · #e08a5f clay-night, as rgb() */
  const INVITE_RGB = "rgb(236, 129, 77)";
  const EMBER_RGB = "rgb(245, 122, 62)";
  const CLAY_NIGHT_RGB = "rgb(224, 138, 95)";

  test("item 2a — the awaiting invitation warms toward ember; the peak stays reserved", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    const gate = stamp(page);
    /* The 'press here to sign' line carries a hint of the payoff it
       unlocks: clay-invite, a step from clay-night toward the ember. */
    await expect(gate.locator(".stamp-sign")).toHaveCSS("fill", INVITE_RGB);
    /* ...but the reserved ember never leaks onto the invitation (a step
       SHORT of the peak, so approving still pops), and the rest of the
       awaiting group keeps the calmer clay-night. */
    await expect(gate.locator(".stamp-sign")).not.toHaveCSS("fill", EMBER_RGB);
    await expect(gate.locator(".stamp-awaiting")).toHaveCSS(
      "color",
      CLAY_NIGHT_RGB
    );
  });

  test("item 1b — signing live settles the manifest (the page registers the blow)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    await expect(stamp(page)).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-on-file]")).toHaveCount(0);

    await stamp(page).click();
    const m = page.locator("[data-on-file]:visible");
    /* The subscribe channel carries the act into the line, dated today */
    await expect(m).toHaveText(`on file: run 041 approved, ${todayLabel()}`);
    /* The live signature arms the one-shot 1px settle — a real transform
       animation on the line (transform only; the min-h reserve holds, so
       CLS stays 0.00). */
    await expect(m).toHaveAttribute("data-settle", "");
    await expect(m).toHaveCSS("animation-name", "manifest-settle");
    /* The jolt is delayed to land WITH the stamp's impact frame (42% of
       the 750ms press ≈ 315ms), not on the click — so the page registers
       the blow as it lands (W7 spot-check). */
    await expect(m).toHaveCSS("animation-delay", "0.315s");
  });

  test("A7 — the manifest never settles under reduced motion (it simply appears)", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });

    await stamp(page).click();
    const m = page.locator("[data-on-file]:visible");
    /* The act still works — the line appears with the visitor's date... */
    await expect(m).toHaveText(`on file: run 041 approved, ${todayLabel()}`);
    /* ...but the settle never arms, and no animation ever runs. */
    await expect(m).not.toHaveAttribute("data-settle", "");
    await expect(m).toHaveCSS("animation-name", "none");
  });
});
