import { test, expect, type Page } from "@playwright/test";

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
 */

/** Storage keys (mirrors src/lib/paperMemory.ts) */
const APPROVAL_KEY = "paper-memory:v1:approved";

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
    /* Leave every kind of ink first */
    await page.goto("/projects/automl/");
    await expect(page.locator("[data-file-memory]")).toBeVisible();
    await registryButton(page).click();
    await expect(registryButton(page)).toHaveAttribute("data-approved", "");

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
  });
});
