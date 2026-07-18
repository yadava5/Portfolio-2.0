import { test, expect, type Page } from "@playwright/test";

/**
 * Text-motion contract (plan 3.8) on the homepage.
 *
 *  1. HERO ENTRANCE: the five `.hero-enter` elements (three headline
 *     lines + mono sub + directives) reach their final state after
 *     load — opacity 1, no transform, no blur residue — and the
 *     `data-motion-ready` gate attribute is removed (load-only, once).
 *  2. CHAPTER HEADLINES: bright lines are SplitText line-masked —
 *     hidden (translated inside overflow-clip wrappers) until their
 *     chapter scrolls to 75% viewport, then revealed once; the
 *     accessible name stays one intact string (aria-label).
 *  3. THE MANIFESTO (ch 02): the page's ONE scrubbed text — word
 *     opacity rests at 0.25, scrubs with scroll position (leading
 *     words brighter mid-scrub), and completes to 1 past the range.
 *  4. REDUCED MOTION (A7): none of it exists — no readiness attribute,
 *     no split fragments, no inline motion styles, text plain and
 *     visible immediately, rail marks all present.
 *  5. MOBILE (<768px): no blur filter anywhere, ever — the hero rises
 *     and fades only.
 *  6. RAIL AUDIT TRAIL: ink checks accumulate beside the folio numbers
 *     as the thread finishes each chapter (and retreat on scroll-back);
 *     static worlds show the completed checklist.
 */

const HERO_COUNT = 5;

function isDesktop(page: Page) {
  return (page.viewportSize()?.width ?? 0) >= 1280;
}

function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 0) < 768;
}

/** Wait until SplitText has produced masked line fragments. */
async function waitForSplit(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await expect
    .poll(() => page.locator("#path [data-tm-bright] div").count(), {
      timeout: 15_000,
    })
    .toBeGreaterThan(0);
}

/** Computed styles of every `.hero-enter` element. */
function heroStyles(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>(".hero-enter")).map(
      (el) => {
        const cs = getComputedStyle(el);
        return {
          opacity: cs.opacity,
          transform: cs.transform,
          filter: cs.filter,
        };
      }
    )
  );
}

/** Max |translateY| across the split line fragments of a container. */
function maxLineShift(page: Page, selector: string) {
  return page.evaluate((sel) => {
    let max = 0;
    for (const div of document.querySelectorAll<HTMLElement>(`${sel} div`)) {
      const t = getComputedStyle(div).transform;
      if (t === "none") continue;
      const match = t.match(/matrix\(([^)]+)\)/);
      if (!match) continue;
      const parts = match[1].split(",").map((value) => parseFloat(value));
      max = Math.max(max, Math.abs(parts[5] ?? 0));
    }
    return max;
  }, selector);
}

/** Word-fragment opacities for the manifesto deck pair. */
function manifestoOpacities(page: Page) {
  return page.evaluate(() =>
    Array.from(
      document.querySelectorAll<HTMLElement>("#who [data-tm-words] div")
    ).map((el) => parseFloat(getComputedStyle(el).opacity))
  );
}

/** Rail-mark computed opacities, in chapter order 01..07. */
function railMarkOpacities(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>(".rail-mark")).map(
      (el) => getComputedStyle(el).opacity
    )
  );
}

async function scrollToId(page: Page, id: string) {
  await page.evaluate((sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView();
  }, id);
}

test.describe("text motion — engine world", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("html.lenis").waitFor({ state: "attached" });
  });

  test("hero lines reach their final state — no blur residue", async ({
    page,
  }) => {
    await expect(page.locator(".hero-enter")).toHaveCount(HERO_COUNT);

    /* The entrance is load-only: once it settles, TextMotion drops the
       readiness attribute so it can never replay. */
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-motion-ready",
      { timeout: 10_000 }
    );

    const styles = await heroStyles(page);
    expect(styles).toHaveLength(HERO_COUNT);
    for (const style of styles) {
      expect(style.opacity).toBe("1");
      expect(style.filter).toBe("none");
      expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(style.transform);
    }
  });

  test("chapter headline is masked, then revealed on scroll — name intact", async ({
    page,
  }) => {
    await waitForSplit(page);

    const bright = page.locator("#path [data-tm-bright]");
    /* Accessible name survives the split as ONE intact string */
    await expect(bright).toHaveAttribute(
      "aria-label",
      "Thousands of service tickets. Zero structure."
    );
    expect(
      await bright.locator("[aria-hidden='true']").count()
    ).toBeGreaterThan(0);

    /* Hidden state at the top of the page: line fragments rest a full
       line-height down inside their overflow-clip masks */
    expect(await maxLineShift(page, "#path [data-tm-bright]")).toBeGreaterThan(
      10
    );

    /* Scrolled to the chapter: the mask rise completes (once) */
    await scrollToId(page, "path");
    await expect
      .poll(() => maxLineShift(page, "#path [data-tm-bright]"), {
        timeout: 10_000,
      })
      .toBeLessThan(0.5);
  });

  test("manifesto words scrub opacity with scroll position", async ({
    page,
  }) => {
    await waitForSplit(page);
    await expect
      .poll(() => page.locator("#who [data-tm-words] div").count(), {
        timeout: 10_000,
      })
      .toBeGreaterThan(5);

    /* At rest above the range every word idles at 0.25 */
    const resting = await manifestoOpacities(page);
    for (const opacity of resting) {
      expect(opacity).toBeGreaterThan(0.2);
      expect(opacity).toBeLessThan(0.3);
    }

    /* Deep past chapter 02 the scrub has completed: every word full ink */
    await scrollToId(page, "automl");
    await expect
      .poll(async () => Math.min(...(await manifestoOpacities(page))), {
        timeout: 10_000,
      })
      .toBeGreaterThan(0.95);

    /* Mid-range the ramp is visible: leading words brighter than the
       tail (scrub position ≈ halfway through the ~60vh span) */
    await page.evaluate(() => {
      const deck = document.querySelector("#who [data-tm-words]");
      if (!deck) return;
      const rect = deck.getBoundingClientRect();
      const target = window.scrollY + rect.top - window.innerHeight * 0.45;
      window.scrollTo(0, target);
    });
    await expect
      .poll(
        async () => {
          const opacities = await manifestoOpacities(page);
          const first = opacities[0] ?? 0;
          const last = opacities[opacities.length - 1] ?? 1;
          return first - last;
        },
        { timeout: 10_000 }
      )
      .toBeGreaterThan(0.15);
  });

  test("mobile carries no blur filter at any point of the entrance", async ({
    page,
  }) => {
    test.skip(!isMobile(page), "blur exclusion zone is <768px");

    /* Sample through the entrance window: the de-blur keyframes must
       never reach a phone — rise/fade only. */
    for (let sample = 0; sample < 8; sample++) {
      const styles = await heroStyles(page);
      for (const style of styles) {
        expect(style.filter).not.toContain("blur");
      }
      await page.waitForTimeout(150);
    }
  });

  test("rail marks accumulate as the thread passes, and retreat", async ({
    page,
  }) => {
    test.skip(!isDesktop(page), "the chapter rail is xl+ only");
    await expect(page.locator(".rail-mark")).toHaveCount(7);

    /* Top of page: nothing reviewed yet */
    for (const opacity of await railMarkOpacities(page)) {
      expect(opacity).toBe("0");
    }

    /* At the flagship, chapters 01–03 are behind the thread */
    await scrollToId(page, "automl");
    await expect
      .poll(async () => (await railMarkOpacities(page)).slice(0, 3), {
        timeout: 10_000,
      })
      .toEqual(["1", "1", "1"]);
    expect((await railMarkOpacities(page))[6]).toBe("0");

    /* At the end of the scroll the checklist is complete */
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight)
    );
    await expect
      .poll(async () => await railMarkOpacities(page), { timeout: 10_000 })
      .toEqual(["1", "1", "1", "1", "1", "1", "1"]);

    /* Scroll-back reverses the audit trail (trigger onLeaveBack) */
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect
      .poll(async () => (await railMarkOpacities(page))[6], {
        timeout: 10_000,
      })
      .toBe("0");
  });

  test("quiet motion toggle reverts every split and shows the finished page", async ({
    page,
  }) => {
    const toggle = page
      .locator("header")
      .getByRole("button", { name: /motion/ });
    test.skip(!(await toggle.isVisible()), "toggle is sm+ only");

    await waitForSplit(page);
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-motion-off", "");

    /* Splits revert to plain server markup — no fragments, no aria
       overrides, no inline motion styles left behind */
    await expect
      .poll(() => page.locator("#path [data-tm-bright] div").count(), {
        timeout: 10_000,
      })
      .toBe(0);
    await expect(page.locator("#path [data-tm-bright]")).not.toHaveAttribute(
      "aria-label",
      /.+/
    );
    const residue = await page.evaluate(
      () =>
        Array.from(
          document.querySelectorAll<HTMLElement>(
            "[data-tm], [data-tm-bright], [data-tm-words], [data-tm-mantra], [data-tm-receipt]"
          )
        ).filter((el) => el.style.opacity !== "" || el.style.transform !== "")
          .length
    );
    expect(residue).toBe(0);

    /* The static world reads as a completed review */
    if (isDesktop(page)) {
      for (const opacity of await railMarkOpacities(page)) {
        expect(opacity).toBe("1");
      }
    }
  });
});

test.describe("text motion — reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
  });

  test("zero animations: everything visible immediately, text intact", async ({
    page,
  }) => {
    /* The readiness gate is never stamped, so the hero's hidden
       entrance state never exists (FOUC discipline, A7) */
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-ready");

    const styles = await heroStyles(page);
    expect(styles).toHaveLength(HERO_COUNT);
    for (const style of styles) {
      expect(style.opacity).toBe("1");
      expect(style.transform).toBe("none");
      expect(style.filter).toBe("none");
    }

    /* No splits: headlines and the manifesto are plain intact strings */
    expect(await page.locator("[data-tm-bright] div").count()).toBe(0);
    expect(await page.locator("[data-tm-words] div").count()).toBe(0);
    await expect(page.locator("#path [data-tm-bright]")).not.toHaveAttribute(
      "aria-label",
      /.+/
    );
    await expect(page.locator("#path [data-tm-bright]")).toHaveText(
      "Thousands of service tickets. Zero structure."
    );
    await expect(page.locator("#who [data-tm-words]").first()).toHaveText(
      "This is a story about learning machines."
    );

    /* No inline motion styles anywhere in the choreography vocabulary,
       and no weight-breathing vars written */
    const residue = await page.evaluate(
      () =>
        Array.from(
          document.querySelectorAll<HTMLElement>(
            "[data-tm], [data-tm-bright], [data-tm-words], [data-tm-mantra], [data-tm-receipt], [data-breathe]"
          )
        ).filter(
          (el) =>
            el.style.opacity !== "" ||
            el.style.transform !== "" ||
            el.style.getPropertyValue("--tm-wght") !== ""
        ).length
    );
    expect(residue).toBe(0);

    /* The litany's WONK=1 is typography, not motion: it must hold in
       every world, and it is the page's ONLY wonk */
    await expect(page.locator(".fraunces-wonk [data-tm-mantra]")).toHaveText(
      "Make it honest."
    );
    expect(await page.locator(".fraunces-wonk").count()).toBe(1);
  });

  test("static world shows the completed rail checklist", async ({ page }) => {
    await expect(page.locator(".rail-mark")).toHaveCount(7);
    for (const opacity of await railMarkOpacities(page)) {
      expect(opacity).toBe("1");
    }
  });
});
