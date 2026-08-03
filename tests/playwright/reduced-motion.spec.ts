import { expect, test } from "@playwright/test";

/**
 * Reduced motion, against the page that actually ships.
 *
 * These assertions used to describe the old React home — [data-chapter]
 * sections, per-chapter waypoint backgrounds, a folio terminator and a Lenis
 * flag on the header — and they passed only because the e2e scripts built
 * WITHOUT scripts/run/build-home.mjs, so Playwright was served a page no
 * visitor has ever seen. With the test build fixed, all four failed at once.
 *
 * The run's reduced-motion contract is a different and simpler thing: there is
 * no engine to disable, because everything is a pure function of scroll. What
 * it owes a reader who asks for stillness is that the whole authored world is
 * present and settled on arrival, and that nothing is left animating.
 */
test.describe("reduced motion and keyboard access", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("the page arrives complete and usable", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
    await expect(page.locator("main")).toBeVisible();

    /* every station is present, not merely the ones scrolled past */
    await expect(page.locator("[data-beat]")).toHaveCount(13);

    /* Keyboard reachability, stated so WebKit can answer it honestly.
       This was `keyboard.press("Tab")` then `expect(:focus).toBeVisible()`,
       which fails in both Safari seats because WebKit's default keyboard
       model does not move focus to links at all. That is a browser
       preference the page cannot influence, so the old assertion was
       testing Safari, not the site. What the page owes a keyboard reader is
       that focus LANDS somewhere visible when it is moved. */
    const focusLanded = await page.evaluate(() => {
      const first = document.querySelector<HTMLElement>(
        "a[href], button:not([disabled])"
      );
      first?.focus();
      const a = document.activeElement as HTMLElement | null;
      return !!a && a !== document.body && a.tagName !== "HTML";
    });
    expect(focusLanded).toBe(true);
    await expect(page.locator(":focus")).toBeVisible();
  });

  test("the world settles on arrival — nothing waits to be scrolled into", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
    await page.waitForTimeout(600);

    /* settleAll() runs under RM: the stations do not hold their entrance
       state waiting for a scroll that a still reader will not perform */
    await expect(page.locator("body")).toHaveClass(/\bsettled\b/);

    /* and the thread is still drawn — it is the spine of the argument, not
       an animation, so stillness must not cost the reader the line */
    await expect(page.locator("canvas#thread")).toHaveCount(1);
  });

  test("nothing is left animating", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(600);

    /* the morning flock is never released under reduced motion — the layer
       exists but is never populated, so there is no animation to hide */
    await expect(page.locator(".bird")).toHaveCount(0);

    const running = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.playState === "running")
        .map((a) => (a as CSSAnimation).animationName ?? "unnamed")
    );
    expect(running).toEqual([]);
  });

  test("anchor navigation does not depend on scroll animation", async ({
    page,
  }) => {
    /* the run's own deep links; `#work` was the old home's chapter id */
    await page.goto("/#gate");
    await expect(page.locator("#gate")).toBeInViewport();
  });
});
