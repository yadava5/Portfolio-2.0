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

  /* v4 (2026-10-08): the type that answers the hand and the figures that
     assemble in depth are motion, so a reader who asked for stillness gets
     neither: the name, the headings and the links do not answer a hover,
     and both figures are their authored drawings at every scroll. */
  test("the type does not answer the hand, and no figure is drawn in depth", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
    await page.waitForTimeout(800);
    type W = {
      __world: {
        name?: () => { live: boolean } | null;
        inkLive?: () => number;
        rollLive?: () => number;
        hand?: () => number;
        net3?: { on: boolean };
        jet3?: { on: boolean };
      };
    };
    if (!isMobile) {
      const b = await page
        .locator("h1.nameplate")
        .evaluate((h) => h.getBoundingClientRect().toJSON());
      await page.mouse.move(b.x - 40, b.y + b.height / 2);
      for (let i = 0; i <= 30; i++)
        await page.mouse.move(
          b.x - 40 + ((b.width + 80) * i) / 30,
          b.y + b.height / 2
        );
      const t = await page.evaluate(() => {
        const w = (window as unknown as W).__world;
        return {
          name: w.name?.()?.live ?? false,
          hand: w.hand?.() ?? 0,
        };
      });
      expect(t.name).toBe(false);
      expect(t.hand).toBe(0);
      /* a heading and a link under a moving hand: no swell, no roll */
      for (const sel of ["#glyph h2", "#glyph .handoff a"]) {
        await page.evaluate(
          (s) =>
            document
              .querySelector(s)!
              .scrollIntoView({ block: "center", behavior: "instant" }),
          sel
        );
        await page.waitForTimeout(300);
        const r = await page
          .locator(sel)
          .first()
          .evaluate((e) => e.getBoundingClientRect().toJSON());
        await page.mouse.move(r.x - 40, r.y + r.height / 2);
        for (let i = 0; i <= 12; i++)
          await page.mouse.move(
            r.x - 40 + ((r.width + 80) * i) / 12,
            r.y + r.height / 2
          );
        const live = await page.evaluate(() => {
          const w = (window as unknown as W).__world;
          return (w.inkLive?.() ?? 0) + (w.rollLive?.() ?? 0);
        });
        expect(live, sel).toBe(0);
      }
    }
    for (const id of ["net", "jetFig"]) {
      await page.evaluate(
        (i) =>
          document
            .getElementById(i)!
            .scrollIntoView({ block: "end", behavior: "instant" }),
        id
      );
      await page.waitForTimeout(300);
      const d = await page.evaluate(() => {
        const w = (window as unknown as W).__world;
        return {
          net: w.net3?.on ?? false,
          jet: w.jet3?.on ?? false,
          deep: document.querySelectorAll(".indepth").length,
        };
      });
      expect(d).toEqual({ net: false, jet: false, deep: 0 });
    }
  });
});
