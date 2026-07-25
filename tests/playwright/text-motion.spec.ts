import { test, expect, type Page } from "@playwright/test";

/**
 * Text-motion contract (plan 3.8) on the homepage.
 *
 *  1. HERO ENTRANCE: the four `.hero-enter` elements (two headline
 *     lines, the standfirst that names the author — CRITIC-LEDGER F02
 *     — and the directives) reach their final state after load —
 *     opacity 1, no transform, no blur residue — and the
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
 *  7. MASTHEAD THREAD ANCHOR: the H1's closing line ("It's all
 *     real.¹") is the Red Thread's measured origin box
 *     ([data-thread-name]) — the measured span itself never
 *     transforms (the entrance rides its inner wrapper), and in every
 *     world the line reads as one intact string, claim + receipt.
 */

const HERO_COUNT = 4;

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

/** The masthead's closing line — the Red Thread's measured origin.
 *  Holder = the never-transformed [data-thread-name] span; the
 *  entrance animates its inner `.hero-enter` wrapper only. */
function threadAnchorState(page: Page) {
  return page.evaluate(() => {
    const holder = document.querySelector<HTMLElement>("[data-thread-name]");
    const inner = holder?.firstElementChild as HTMLElement | null;
    if (!holder || !inner) return null;
    const holderStyle = getComputedStyle(holder);
    const innerStyle = getComputedStyle(inner);
    return {
      holderTransform: holderStyle.transform,
      innerIsEntrance: inner.classList.contains("hero-enter"),
      text: holder.textContent?.trim() ?? "",
      innerOpacity: innerStyle.opacity,
      innerTransform: innerStyle.transform,
      innerFilter: innerStyle.filter,
    };
  });
}

/** The closing line's one intact string: the claim plus its receipt ¹. */
const THREAD_ANCHOR_TEXT = "It's all real.1";

test.describe("text motion — engine world", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page
      .locator("header[data-lenis-connected='true']")
      .waitFor({ state: "attached", timeout: 5000 });
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

    /* At rest above the range every word idles at MANIFESTO_REST.
       This assertion used to demand 0.2–0.3 — i.e. it pinned the
       CRITIC-LEDGER F06 fault in place: ink at 0.25 composites to
       1.66:1 on dawn paper, so the chapter's thesis sentence rendered
       half-redacted for anyone who stopped on it. The rest is now AA
       for the manifesto's 64px setting (0.60 → 4.12:1); what the test
       actually guards — that the words REST muted and travel to full
       ink with scroll — is unchanged and asserted below. */
    const resting = await manifestoOpacities(page);
    for (const opacity of resting) {
      expect(opacity).toBeGreaterThan(0.55);
      expect(opacity).toBeLessThan(0.65);
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

    /* CRITIC-LEDGER F14 — the retired assertion here demanded that
       every rail mark be lit the instant motion was switched off. The
       reader is at the TOP of the page: they have reviewed nothing, and
       a checklist that ticks itself is not a checklist. The honest
       reading is an empty rail, with the marks still EARNABLE — the
       engine hands the audit trail to a static observer as it retires
       (probed: toggling drops data-lenis-connected to false, and
       scrolling to the foot of the page then lights all seven). */
    if (isDesktop(page)) {
      for (const opacity of await railMarkOpacities(page)) {
        expect(opacity).toBe("0");
      }

      await page.evaluate(() =>
        window.scrollTo(0, document.documentElement.scrollHeight)
      );
      await page.waitForTimeout(800);
      for (const opacity of await railMarkOpacities(page)) {
        expect(opacity).toBe("1");
      }
    }
  });
});

test.describe("masthead thread anchor — load window", () => {
  test("the closing line's measured span never transforms — the entrance rides its inner wrapper", async ({
    page,
  }) => {
    /* Navigate on `commit` so the probe attaches during the load
       window (the layout inline script stamps data-motion-ready
       pre-hero-parse; TextMotion drops it at ~1.1s). The Red Thread
       measures the [data-thread-name] box, so the discipline under
       test is: even MID-ENTRANCE the holder itself is transform-free —
       a re-measure landing during the rise still finds the true box —
       while the rise/ink-settle ride the inner `.hero-enter` wrapper. */
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForFunction(
      () => document.documentElement.hasAttribute("data-motion-ready"),
      { timeout: 10_000 }
    );

    const during = await threadAnchorState(page);
    expect(during).not.toBeNull();
    expect(during!.holderTransform).toBe("none");
    expect(during!.innerIsEntrance).toBe(true);

    /* Load-only, once: the gate drops, the inner wrapper rests clean
       (opacity 1, no transform, no blur residue), and the line reads
       as ONE intact string — the claim glued to its receipt ¹, exactly
       what the h1 aria-label swears to in one honest sentence. */
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-motion-ready",
      { timeout: 15_000 }
    );
    const settled = await threadAnchorState(page);
    expect(settled).not.toBeNull();
    expect(settled!.holderTransform).toBe("none");
    expect(settled!.text).toBe(THREAD_ANCHOR_TEXT);
    expect(settled!.innerOpacity).toBe("1");
    expect(settled!.innerFilter).toBe("none");
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(
      settled!.innerTransform
    );
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
      "This is a record of what I’ve built."
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

  /* CRITIC-LEDGER F14 — this test used to assert that every mark was
     lit the moment a static world loaded, which is what the CSS forced.
     That was the fault, not the contract: a reduced-motion reader
     sitting at the top of the page was told they had reviewed all seven
     chapters. The rail now EARNS its marks in every world, off a
     monotone IntersectionObserver, so the static rail must read the
     same as the engine rail at the same scroll position. */
  test("static world earns its rail marks — none at the top", async ({
    page,
  }) => {
    await expect(page.locator(".rail-mark")).toHaveCount(7);
    for (const opacity of await railMarkOpacities(page)) {
      expect(opacity).toBe("0");
    }
  });

  test("static world banks the marks it passes, and never retreats", async ({
    page,
  }) => {
    await scrollToId(page, "automl");
    await page.waitForTimeout(600);
    const atFlagship = await railMarkOpacities(page);
    /* Chapters 01–03 are behind the reader; 04 is under them */
    expect(atFlagship.slice(0, 3)).toEqual(["1", "1", "1"]);
    expect(atFlagship.slice(4)).toEqual(["0", "0", "0"]);

    /* Monotone: the static world has no timeline to scrub, so a chapter
       once passed stays passed even on the way back up. */
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    expect((await railMarkOpacities(page)).slice(0, 3)).toEqual([
      "1",
      "1",
      "1",
    ]);

    /* At the foot of the paper the checklist is complete — the same
       reading the engine world gives (the boundary's clamp). */
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight)
    );
    await page.waitForTimeout(800);
    for (const opacity of await railMarkOpacities(page)) {
      expect(opacity).toBe("1");
    }
  });

  test("static world prints the closing line finished — claim and receipt intact", async ({
    page,
  }) => {
    /* The readiness gate is never stamped under reduced motion, so the
       thread's origin line paints as plain, settled text from the very
       first frame — the static world IS the final frame (A7), and the
       ¹ receipt is right there in it. */
    const style = await threadAnchorState(page);
    expect(style).not.toBeNull();
    expect(style!.text).toBe(THREAD_ANCHOR_TEXT);
    expect(style!.holderTransform).toBe("none");
    expect(style!.innerOpacity).toBe("1");
    expect(style!.innerTransform).toBe("none");
  });
});
