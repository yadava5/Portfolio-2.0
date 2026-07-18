import { test, expect, type Page } from "@playwright/test";

/**
 * Scroll-engine contract (rubric amendment A1/A7).
 *
 * The Lenis + GSAP single-rAF engine cannot be verified in rAF-throttled
 * embedded browsers, so this spec is the authoritative check that:
 *  - the engine mounts and drives header anchor scrolling,
 *  - no top progress bar is rendered (NO-LIST §C),
 *  - reduced motion never mounts the engine yet keeps anchors functional.
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

test.describe("scroll engine", () => {
  test("engine mounts, no progress bar, page scrolls", async ({ page }) => {
    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });

    /* Engine mounted: Lenis stamps its class on <html> */
    await expect(page.locator("html")).toHaveClass(/\blenis\b/);
    await expect(page.locator("html")).not.toHaveClass(/lenis-stopped/);

    /* NO-LIST §C: the top progress bar is gone */
    await expect(page.getByTestId("scroll-progress")).toHaveCount(0);

    /* Native programmatic scroll still works (Lenis syncs, doesn't hijack) */
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

  test("header anchors scroll through Lenis with the 6rem offset", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "header nav links are lg+ only");

    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });
    await page.locator("html.lenis").waitFor({ state: "attached" });
    /* Header must actually be consuming the engine before we click */
    await page
      .locator("header[data-lenis-connected='true']")
      .waitFor({ state: "attached", timeout: 5_000 });
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

    /* lenis.scrollTo offset lands the section top at ~96px */
    expect(top).toBeGreaterThan(40);
    expect(top).toBeLessThan(160);

    /* URL hash untouched (handled scroll, not native navigation) */
    expect(new URL(page.url()).hash).toBe("");
  });

  test("reduced motion never mounts the engine; anchors still land", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "header nav links are lg+ only");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });

    /* A7: gate at entry — no Lenis under reduced motion */
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);

    await page
      .locator("header")
      .getByRole("link", { name: "experience" })
      .click();

    await expect(page.locator("#path")).toBeInViewport();
  });

  test("quiet motion toggle tears down the engine and persists", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });
    await page.locator("html.lenis").waitFor({ state: "attached" });

    const toggle = page
      .locator("header")
      .getByRole("button", { name: /motion/ });
    test.skip(!(await toggle.isVisible()), "toggle is sm+ only");

    /* A7: the in-page toggle unmounts the engine like reduced motion */
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-motion-off", "");
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);

    /* The preference persists across a reload (localStorage) */
    await page.reload();
    await page.locator("#arrival").waitFor({ state: "attached" });
    await expect(page.locator("html")).toHaveAttribute("data-motion-off", "");
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);

    /* And it comes back on */
    await page
      .locator("header")
      .getByRole("button", { name: /motion/ })
      .click();
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-off");
    await expect(page.locator("html")).toHaveClass(/\blenis\b/);
  });
});
