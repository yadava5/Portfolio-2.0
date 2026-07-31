import { test, expect, type Page } from "@playwright/test";

/**
 * Garnish-rail contract (FABLE-VISUAL-BRIEF §F1a/§F3 — the cursor-feel
 * text layer, the full tier's first real consumer suite).
 *
 *  - EQUITY: outside `html[data-tier="full"]` the rail styles NOTHING.
 *    Core, print and reduced-motion render byte-identical text — hover
 *    changes no computed style, the plate never transforms, the press
 *    never presses. Touch is excluded structurally (hover/pointer media
 *    gate), so this suite runs on hovering desktops only.
 *  - PROMOTION arms it: the probe's deterministic §F3 promotion (the
 *    REAL promotionAllowed path) flips core → full, and the press /
 *    wet / tilt then answer the cursor — with zero layout shift at the
 *    moment of arming (the rail is paint + transform, plus one bounded
 *    axis press whose reflow is its own block line).
 *  - DOWNSHIFT disarms it: sustained jank drops full → core, the plate
 *    clears its transform, and hover goes inert again — no CLS.
 *
 * Runs under the probes build only (window.__frameGovernor drives
 * promotion); playwright.config.ts enforces the flag.
 */

test.skip(
  ({ isMobile }) => !!isMobile,
  "hover garnish is desktop-first — touch never arms the rail"
);

/* Round 9: the site's one variable-axis hover moved from the claim's
   "Scroll." to the NAMEPLATE (the letterform surface owns the answer —
   A9, one kinetic axis per chapter). The press target is a letter of
   the name; its base fvs carries the authored axes ("wght" 600) at
   every tier, and only Full adds the .np-hot press (wght 628). */
const PRESS_AXIS = "#arrival .nameplate .np-ch:first-child";
const WET_LINE = "#arrival [data-tier-garnish='wet-line']";
const ROW_PRESS = "#work a[data-tier-garnish='press']";
const PLATE = "#gate [data-garnish-plate]";

function tier(page: Page) {
  return page.evaluate(() =>
    document.documentElement.getAttribute("data-tier")
  );
}

/** Computed hover-relevant style of one element. */
function hoverStyle(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const style = getComputedStyle(el);
    return {
      fontVariationSettings: style.fontVariationSettings,
      transform: style.transform,
      textShadow: style.textShadow,
      display: style.display,
    };
  }, selector);
}

/** LAYOUT box of one element (offset geometry — deliberately blind to
 *  transforms, which is the point: the garnish may paint in transform
 *  space, but the layout box must never move). */
function rectOf(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector<HTMLElement>(sel);
    if (!el) return null;
    return {
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
    };
  }, selector);
}

/** Boot the motion world and wait until the governor is watching. */
async function bootMotion(page: Page) {
  await page.goto("/");
  await page.locator("#arrival").waitFor({ state: "attached" });
  await page
    .locator("header[data-lenis-connected='true']")
    .waitFor({ state: "attached", timeout: 5_000 });
  await expect
    .poll(() => page.evaluate(() => window.__frameGovernor?.state().watching))
    .toBe(true);
  /* The hero entrance owns transform/text-shadow on the masthead lines
     while it plays; hover assertions must start after TextMotion retires
     it (~1.1s) or an animation would mask the transition under test. */
  await page
    .locator("html[data-motion-ready]")
    .waitFor({ state: "detached", timeout: 5_000 });
}

/** The probe's deterministic §F3 promotion (real gates still apply). */
async function promoteToFull(page: Page) {
  await page.evaluate(() => window.__frameGovernor?.promote());
  await expect(page.locator("html")).toHaveAttribute("data-tier", "full");
}

test.describe("garnish rail — dark outside the full tier", () => {
  test("core: hover changes nothing — the text is byte-identical", async ({
    page,
  }) => {
    await bootMotion(page);
    expect(await tier(page)).toBe("core");

    /* the nameplate settles fast at core-with-motion only after its
       ~7.8s performance; the press answer is settled-plate-only, so
       the hover below must not race the machines. */
    await page
      .locator(".nameplate[data-np-settled]")
      .waitFor({ timeout: 12000 });
    const before = await hoverStyle(page, PRESS_AXIS);
    expect(before).not.toBeNull();
    /* The rail is dark at core: the letter rests at its authored axes
       (wght 600) and the press weight never appears. */
    expect(before?.fontVariationSettings).toContain('"wght" 600');
    expect(before?.transform).toBe("none");
    expect(before?.textShadow).toBe("none");

    await page.locator(PRESS_AXIS).hover();
    await page.waitForTimeout(400); /* any transition would have started */
    expect(await hoverStyle(page, PRESS_AXIS)).toEqual(before);

    /* Row titles keep their natural inline display at core. */
    expect((await hoverStyle(page, ROW_PRESS))?.display).toBe("inline");
    /* The plate never transforms at core. */
    expect((await hoverStyle(page, PLATE))?.transform).toBe("none");
  });

  test("print (reduced motion): the rail stays dark on the floor", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });
    await expect(page.locator("html")).toHaveAttribute("data-tier", "print");

    const before = await hoverStyle(page, PRESS_AXIS);
    await page.locator(PRESS_AXIS).hover();
    await page.waitForTimeout(400);
    expect(await hoverStyle(page, PRESS_AXIS)).toEqual(before);
    expect((await hoverStyle(page, PLATE))?.transform).toBe("none");
  });
});

test.describe("garnish rail — armed at full", () => {
  test("promotion arms the rail with zero layout shift, and the press answers", async ({
    page,
  }) => {
    await bootMotion(page);

    /* Layout identity across the arming moment. The CLS guard rides
       the row's BLOCK CONTAINER: the anchor's own offset readout is a
       line-box artifact on macOS WebKit — measured (round 9): the same
       anchor reads {top:-1,h:48,w:129} inline and {top:0,h:47,w:128}
       inline-block with NO other change on the page, so asserting the
       two display modes byte-equal pinned a webkit line-metric, not a
       layout shift. The container never moves; the anchor stays ±1px. */
    const threadLineBefore = await rectOf(page, "[data-thread-name]");
    const rowBlockBefore = await rectOf(page, `${ROW_PRESS.split(" a[")[0]}`);
    const rowAnchorBefore = await rectOf(page, ROW_PRESS);

    await promoteToFull(page);
    expect(await rectOf(page, "[data-thread-name]")).toEqual(threadLineBefore);
    expect(await rectOf(page, "#work")).toEqual(rowBlockBefore);
    expect((await hoverStyle(page, ROW_PRESS))?.display).toBe("inline-block");
    const rowAnchorAfter = await rectOf(page, ROW_PRESS);
    for (const k of ["left", "top", "width", "height"] as const) {
      expect(
        Math.abs((rowAnchorAfter?.[k] ?? 0) - (rowAnchorBefore?.[k] ?? 0))
      ).toBeLessThanOrEqual(1);
    }

    /* The one variable-axis hover: a nameplate letter presses into
       the paper — by ink weight alone (no transform: pressed type
       prints heavier, it does not slide). Settled-plate-only, so wait
       out the machines before asking. */
    await page
      .locator(".nameplate[data-np-settled]")
      .waitFor({ timeout: 12000 });
    await page.locator(PRESS_AXIS).hover();
    await expect
      .poll(
        async () => (await hoverStyle(page, PRESS_AXIS))?.fontVariationSettings
      )
      .toContain("628"); /* wght settled at the pressed weight */
    expect((await hoverStyle(page, PRESS_AXIS))?.transform).toBe("none");
    /* The axis reflow is contained: the thread's measured line (in
       the claim below the plate) has not moved a pixel. */
    expect(await rectOf(page, "[data-thread-name]")).toEqual(threadLineBefore);

    /* Release: the ink dries back to the exact resting state. */
    await page.mouse.move(10, 10);
    await expect
      .poll(
        async () => (await hoverStyle(page, PRESS_AXIS))?.fontVariationSettings
      )
      .toContain('"wght" 600'); /* the letter's authored resting weight */
  });

  test("the wet cascade seats the masthead words toward 'real.'", async ({
    page,
  }) => {
    await bootMotion(page);
    await promoteToFull(page);

    const seats = await page.evaluate((sel) => {
      const line = document.querySelector(sel);
      return Array.from(line?.querySelectorAll(".garnish-word") ?? []).map(
        (word) => ({
          text: word.textContent,
          seat: (word as HTMLElement).style.getPropertyValue("--garnish-i"),
        })
      );
    }, WET_LINE);
    /* Fix round 3, S1: the apostrophe is U+2019. Round 9: "Scroll."
       holds seat 0 in its own span outside the wet line, so the
       cascade still lands ON "real." at the far end. */
    expect(seats).toEqual([
      { text: "It’s", seat: "1" },
      { text: "all", seat: "2" },
      { text: "real.", seat: "3" },
    ]);

    await page.locator(WET_LINE).hover();
    /* Every word wets — same-color bleed, never a color change. */
    await expect
      .poll(() =>
        page.evaluate((sel) => {
          const words = document.querySelectorAll(`${sel} .garnish-word`);
          return Array.from(words).every(
            (word) => getComputedStyle(word).textShadow !== "none"
          );
        }, WET_LINE)
      )
      .toBe(true);
    const inkDuringHover = await page.evaluate(
      (sel) =>
        getComputedStyle(document.querySelector(`${sel} .garnish-word`)!).color,
      WET_LINE
    );
    expect(inkDuringHover).toBe("rgb(38, 35, 28)"); /* --color-ink, AA held */
  });

  test("the plate tilts under the pointer — transform only, layout never moves", async ({
    page,
  }) => {
    await bootMotion(page);
    await promoteToFull(page);

    const plate = page.locator(PLATE);
    await plate.scrollIntoViewIfNeeded();
    const nameRectBefore = await rectOf(page, PLATE);

    /* Ride the pointer to the plate's north-east quarter. */
    const box = await plate.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(
      box!.x + box!.width * 0.8,
      box!.y + box!.height * 0.25,
      { steps: 6 }
    );
    await expect
      .poll(async () => (await hoverStyle(page, PLATE))?.transform)
      .toContain("matrix3d"); /* rotateX/rotateY live — 3D, not layout */
    /* The plate's border box is untouched: the tilt is paint-space. */
    expect(await rectOf(page, PLATE)).toEqual(nameRectBefore);

    /* Leave: the plate settles flat again. */
    await page.mouse.move(10, 10);
    await expect
      .poll(async () => (await hoverStyle(page, PLATE))?.transform, {
        timeout: 3_000,
      })
      .toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  });

  test("a downshift disarms the garnish — no CLS, hover goes inert", async ({
    page,
  }) => {
    await bootMotion(page);
    await promoteToFull(page);

    /* Wake the tilt so there is something to clear. */
    const plate = page.locator(PLATE);
    await plate.scrollIntoViewIfNeeded();
    await plate.hover();
    const nameRect = await rectOf(page, PLATE);

    /* Sustained jank: full → core (one rung, §F2 one-way). */
    await page.evaluate(() => {
      window.__frameGovernor?.injectFrame(120);
      window.__frameGovernor?.injectFrame(120);
      window.__frameGovernor?.injectFrame(120);
    });
    await expect(page.locator("html")).toHaveAttribute("data-tier", "core");

    /* TextGarnish unmounted: the plate's transform is cleared with no
       layout shift, and the press no longer answers. */
    await expect
      .poll(async () => (await hoverStyle(page, PLATE))?.transform)
      .toBe("none");
    expect(await rectOf(page, PLATE)).toEqual(nameRect);

    await page.locator(PRESS_AXIS).hover();
    await page.waitForTimeout(400);
    const style = await hoverStyle(page, PRESS_AXIS);
    expect(style?.transform).toBe("none");
    /* demoted: the letter rests at its authored weight — never the
       press weight */
    expect(style?.fontVariationSettings).not.toContain("628");
  });
});
