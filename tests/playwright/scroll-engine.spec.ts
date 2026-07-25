import { test, expect, type Page } from "@playwright/test";

/**
 * Scroll-engine contract (rubric amendment A1/A7).
 *
 * The site uses NATIVE scroll (no Lenis) with GSAP ScrollTrigger driving the
 * scrubbed animations off the browser's own scroll. Scroll-driven motion
 * cannot be verified in rAF-throttled embedded browsers, so this spec is the
 * authoritative check that:
 *  - the motion controller mounts and drives header anchor scrolling
 *    (the header stamps `data-lenis-connected="true"` when it's live),
 *  - no top progress bar is rendered (NO-LIST §C),
 *  - reduced motion / the quiet toggle never mount the controller yet keep
 *    anchor navigation functional.
 *
 * The header nav only exists at lg+ viewports; nav-click tests are
 * desktop-only by design.
 */

function isDesktop(page: Page) {
  return (page.viewportSize()?.width ?? 0) >= 1024;
}

/**
 * Wait until scrolling fully stops: one in-page interval (no cross-poll
 * races). Resolves once movement has been observed and scrollY then holds
 * still for 500ms — or, if no movement was ever seen (instant jumps that
 * completed before we attached), after 1500ms of stillness.
 */
async function waitForScrollSettle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = window.scrollY;
        let moved = false;
        let stableMs = 0;
        let elapsedMs = 0;
        const iv = setInterval(() => {
          elapsedMs += 100;
          const now = window.scrollY;
          if (now !== last) {
            moved = true;
            stableMs = 0;
            last = now;
            return;
          }
          stableMs += 100;
          if ((moved && stableMs >= 500) || (!moved && elapsedMs >= 1500)) {
            clearInterval(iv);
            resolve();
          }
        }, 100);
      })
  );
}

/** The motion controller is live once the header reports it connected. */
function connectedHeader(page: Page) {
  return page.locator("header[data-lenis-connected='true']");
}

test.describe("scroll engine", () => {
  test("controller mounts, no progress bar, page scrolls", async ({ page }) => {
    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });

    /* Motion controller is live (native scroll + ScrollTrigger) */
    await connectedHeader(page).waitFor({ state: "attached", timeout: 5_000 });

    /* NO-LIST §C: the top progress bar is gone */
    await expect(page.getByTestId("scroll-progress")).toHaveCount(0);

    /* Native programmatic scroll works */
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(400);

    /* No horizontal overflow */
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth
      )
    ).toBe(true);
  });

  test("header anchors land at the 6rem offset", async ({ page }) => {
    test.skip(!isDesktop(page), "header nav links are lg+ only");

    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });
    /* Header must actually be driving scroll before we click */
    await connectedHeader(page).waitFor({ state: "attached", timeout: 5_000 });
    await page.evaluate(() => document.fonts.ready);

    const experienceLink = page
      .locator("header")
      .getByRole("link", { name: "experience" });

    /* First navigation: absorbs any late layout shift from font swap */
    await experienceLink.click();
    await expect(page.locator("#path")).toBeInViewport({
      timeout: 5_000,
    });
    await waitForScrollSettle(page);

    /* Second navigation from a fully-settled page is measurement-grade:
       hop away, then return. */
    await page
      .locator("header")
      .getByRole("link", { name: "the work" })
      .click();
    await waitForScrollSettle(page);
    await experienceLink.click();
    await waitForScrollSettle(page);

    await expect(page.locator("#path")).toBeInViewport();
    const top = await page
      .locator("#path")
      .evaluate((el) => Math.round(el.getBoundingClientRect().top));

    /* scroll-padding-top: 6rem lands the section top at ~96px */
    expect(top).toBeGreaterThan(40);
    expect(top).toBeLessThan(160);

    /* The nav WRITES the section into the URL (CRITIC-LEDGER F05). This
       assertion used to demand an empty hash — "handled scroll, not
       native hash navigation" — which is exactly the fault: with no
       hash, no section of the paper was linkable and Back left the
       site. The scroll is still handled (the landing offset above
       proves it: a native hash jump would land at ~192px). */
    expect(new URL(page.url()).hash).toBe("#path");
  });

  test("the nav writes history: sections are linkable, Back stays in", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "header nav links are lg+ only");

    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });
    await connectedHeader(page).waitFor({ state: "attached", timeout: 5_000 });
    await page.evaluate(() => document.fonts.ready);

    const nav = (name: string) =>
      page.locator("header").getByRole("link", { name }).click();

    /* One history entry per section asked for */
    await nav("the work");
    await waitForScrollSettle(page);
    expect(new URL(page.url()).hash).toBe("#work");

    await nav("contact");
    await waitForScrollSettle(page);
    expect(new URL(page.url()).hash).toBe("#gate");
    const gateY = await page.evaluate(() => Math.round(window.scrollY));

    /* Back walks the paper backwards — it never ejects the reader */
    await page.goBack();
    await waitForScrollSettle(page);
    expect(new URL(page.url()).hash).toBe("#work");
    await expect(page.locator("#work")).toBeInViewport();

    await page.goBack();
    await waitForScrollSettle(page);
    expect(new URL(page.url()).hash).toBe("");
    expect(page.url()).toContain("/");
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBeLessThan(
      200
    );

    /* Forward returns to the landing it left, not a stale offset */
    await page.goForward();
    await page.goForward();
    await waitForScrollSettle(page);
    expect(new URL(page.url()).hash).toBe("#gate");
    expect(
      Math.abs((await page.evaluate(() => Math.round(window.scrollY))) - gateY)
    ).toBeLessThan(120);
  });

  test("reduced motion never mounts the controller; anchors still land", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "header nav links are lg+ only");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });

    /* A7: gate at entry — the controller never connects under reduced motion */
    await expect(page.locator("header")).toHaveAttribute(
      "data-lenis-connected",
      "false"
    );

    await page
      .locator("header")
      .getByRole("link", { name: "experience" })
      .click();

    await expect(page.locator("#path")).toBeInViewport();
  });

  test("quiet motion toggle tears down the controller and persists", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });
    await connectedHeader(page).waitFor({ state: "attached", timeout: 5_000 });

    const toggle = page
      .locator("header")
      .getByRole("button", { name: /motion/ });
    test.skip(!(await toggle.isVisible()), "toggle is sm+ only");

    /* A7: the in-page toggle unmounts the controller like reduced motion */
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-motion-off", "");
    await expect(page.locator("header")).toHaveAttribute(
      "data-lenis-connected",
      "false"
    );

    /* The preference persists across a reload (localStorage) */
    await page.reload();
    await page.locator("#arrival").waitFor({ state: "attached" });
    await expect(page.locator("html")).toHaveAttribute("data-motion-off", "");
    await expect(page.locator("header")).toHaveAttribute(
      "data-lenis-connected",
      "false"
    );

    /* And it comes back on */
    await page
      .locator("header")
      .getByRole("button", { name: /motion/ })
      .click();
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-off");
    await connectedHeader(page).waitFor({ state: "attached", timeout: 5_000 });
  });
});
