import { test, expect, type Page } from "@playwright/test";

/**
 * Day-arc engine contract (rubric amendment A4/A7 + brief B9) on
 * /world-preview/ and the home page.
 *
 *  - The LightField base color is driven by scrubbed oklch channel vars:
 *    it must CHANGE between the top of the page and a deep scroll.
 *  - The 05→06 boundary is the CHOREOGRAPHED dusk (B9): eleven verified
 *    stops over a bounded range while chapter 06 rises to the viewport
 *    top; `data-arc-gloaming` deepens the muted voices inside the range;
 *    ink still flips as a STEP (`data-arc-phase="dusk"`) WITH the
 *    background at the flip fraction — and back, symmetrically.
 *  - HOME (the pinned page): the flip must land exactly at its chapter
 *    in BOTH directions — the ch04 pin-spacer regression (stale trigger
 *    starts measured before the spacer inflated the page) fired it one
 *    chapter early.
 *  - Reduced motion: the engine never mounts — chapters paint their own
 *    static waypoint backgrounds via CSS, no channel vars are ever
 *    written, and no dusk/gloaming attribute appears.
 *  - No horizontal overflow in either mode.
 */

const PREVIEW = "/world-preview/";

/* The choreography's scroll range (DayArc.tsx): trigger [data-chapter=06],
   start "top 92%", end "top top"; the flip lands at range fraction 0.55
   (waypoints.generated DUSK_FLIP_POS). */
const RANGE_START = 0.92;

/** Viewport fraction of section-06's top at a given range progress. */
function topFractionAt(progress: number): number {
  return RANGE_START * (1 - progress);
}

/** Scroll so section [data-chapter='06']'s top sits at `fraction` of the
 *  viewport height (0 = viewport top). Instant, then settled. */
async function scrollDuskTo(page: Page, fraction: number) {
  await page.evaluate((f) => {
    const section = document.querySelector<HTMLElement>("[data-chapter='06']");
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: Math.round(top - window.innerHeight * f),
      behavior: "instant",
    });
  }, fraction);
}

function arcPhase(page: Page) {
  return page.evaluate(() =>
    document.documentElement.getAttribute("data-arc-phase")
  );
}

function gloaming(page: Page) {
  return page.evaluate(() =>
    document.documentElement.hasAttribute("data-arc-gloaming")
  );
}

/* Waypoint hexes from globals.css, as computed-style rgb strings */
const RGB = {
  w01: "rgb(251, 243, 231)",
  w04: "rgb(245, 237, 220)",
  w06: "rgb(67, 55, 47)",
  w07: "rgb(44, 38, 34)",
  ink: "rgb(38, 35, 28)",
  inkDusk: "rgb(246, 239, 226)",
};

function baseColor(page: Page) {
  return page
    .getByTestId("light-field-base")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
}

async function scrollToChapter(page: Page, id: string) {
  await page.evaluate((chapterId) => {
    document.getElementById(chapterId)?.scrollIntoView();
  }, `chapter-${id}`);
}

async function noHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth
    )
  ).toBe(true);
}

test.describe("day arc — motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PREVIEW);
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
    await page
      .locator("header[data-lenis-connected='true']")
      .waitFor({ state: "attached", timeout: 5000 });
  });

  test("background scrubs between top and deep scroll", async ({ page }) => {
    /* At the top the arc sits on waypoint-01 (dawn) and it is daytime */
    await expect(page.locator("html")).not.toHaveAttribute("data-arc-phase");
    const topColor = await baseColor(page);

    /* Deep in the day (chapter 04) the composed oklch color has moved */
    await scrollToChapter(page, "04");
    await expect
      .poll(async () => baseColor(page), { timeout: 5_000 })
      .not.toBe(topColor);

    /* Still daytime: no dusk step this side of the 05→06 boundary */
    await expect(page.locator("html")).not.toHaveAttribute("data-arc-phase");

    /* Write-target contract (PERF-AUDIT fix 2): the scrubbed channel
       vars land on the LightField container, NEVER on <html> — a root
       write invalidates the whole tree's computed style every frame. */
    const writeTargets = await page.evaluate(() => ({
      html: document.documentElement.style.getPropertyValue("--arc-l"),
      field:
        document
          .querySelector<HTMLElement>("[data-light-field]")
          ?.style.getPropertyValue("--arc-l") ?? "",
    }));
    expect(writeTargets.html).toBe("");
    expect(writeTargets.field).not.toBe("");

    await noHorizontalOverflow(page);
  });

  test("ink flips as a step after the 05→06 boundary, and back", async ({
    page,
  }) => {
    const body = page.locator("body");
    await expect(body).toHaveCSS("color", RGB.ink);

    /* Past the boundary: dusk attribute set, ink stepped to dusk ink */
    await scrollToChapter(page, "07");
    await expect(page.locator("html[data-arc-phase='dusk']")).toBeAttached({
      timeout: 5_000,
    });
    await expect(body).toHaveCSS("color", RGB.inkDusk);

    /* Back above the boundary: the step reverses cleanly */
    await scrollToChapter(page, "02");
    await expect(page.locator("html[data-arc-phase='dusk']")).not.toBeAttached({
      timeout: 5_000,
    });
    await expect(body).toHaveCSS("color", RGB.ink);
  });

  test("the dusk is choreographed: stops render between golden hour and dusk, gloaming spans the range", async ({
    page,
  }) => {
    /* Committed stop channels (waypoints.generated.ts DUSK_CHOREO —
       derived and contrast-asserted by scripts/design/dusk-choreo.mjs).
       Core tier (the universal default) renders these EXACT stops; the
       assertion reads the engine's own channel writes on the LightField
       (browser color serialization of oklch() varies by engine). */
    const arcL = () =>
      page.evaluate(() => {
        const field =
          document.querySelector<HTMLElement>("[data-light-field]");
        return field
          ? parseFloat(field.style.getPropertyValue("--arc-l"))
          : Number.NaN;
      });
    const DAY_MID_L = 0.8304; /* stop 2  #dbc4a3 */
    const DAY_FLOOR_L = 0.655; /* stop 5  #a38c79 */
    const NIGHT_ENTRY_L = 0.42; /* stop 6  #5a493c */
    const W06_L = 0.3471;
    const close = (a: number, b: number) => Math.abs(a - b) < 0.002;

    /* Mid day-side descent: a rendered stop that is neither waypoint —
       the old single step never painted anything between them. */
    await scrollDuskTo(page, topFractionAt(0.25));
    await expect
      .poll(async () => close(await arcL(), DAY_MID_L), { timeout: 5_000 })
      .toBe(true);
    expect(await arcPhase(page)).toBeNull();
    expect(await gloaming(page)).toBe(true);

    /* The day floor: as deep as full ink can stand — still day ink */
    await scrollDuskTo(page, topFractionAt(0.5));
    await expect
      .poll(async () => close(await arcL(), DAY_FLOOR_L), { timeout: 5_000 })
      .toBe(true);
    expect(await arcPhase(page)).toBeNull();

    /* Past the flip: night entry + the ink step, together */
    await scrollDuskTo(page, topFractionAt(0.6));
    await expect
      .poll(async () => close(await arcL(), NIGHT_ENTRY_L), { timeout: 5_000 })
      .toBe(true);
    expect(await arcPhase(page)).toBe("dusk");
    expect(await gloaming(page)).toBe(true);

    /* Range end: settled on waypoint-06, the gloaming released */
    await scrollDuskTo(page, 0);
    await expect
      .poll(async () => close(await arcL(), W06_L), { timeout: 5_000 })
      .toBe(true);
    await expect.poll(() => gloaming(page), { timeout: 5_000 }).toBe(false);
    expect(await arcPhase(page)).toBe("dusk");

    /* Reverse through the flip: day floor returns, dusk releases */
    await scrollDuskTo(page, topFractionAt(0.5));
    await expect
      .poll(async () => close(await arcL(), DAY_FLOOR_L), { timeout: 5_000 })
      .toBe(true);
    await expect.poll(() => arcPhase(page), { timeout: 5_000 }).toBeNull();
  });

  test("gloaming deepens the muted voices only inside the range", async ({
    page,
  }) => {
    /* Inside the range, pre-flip: secondary ink maps to full ink */
    const secondaryEqualsInk = () =>
      page.evaluate(() => {
        const styles = getComputedStyle(document.documentElement);
        return (
          styles.getPropertyValue("--color-ink-secondary").trim() ===
          styles.getPropertyValue("--color-ink").trim()
        );
      });

    await scrollDuskTo(page, topFractionAt(0.3));
    await expect.poll(() => gloaming(page), { timeout: 5_000 }).toBe(true);
    expect(await secondaryEqualsInk()).toBe(true);

    /* Above the range: the normal muted voice returns */
    await scrollToChapter(page, "02");
    await expect.poll(() => gloaming(page), { timeout: 5_000 }).toBe(false);
    expect(await secondaryEqualsInk()).toBe(false);
  });
});

test.describe("day arc — home boundary (pin-spacer regression)", () => {
  test("the dusk flip lands exactly at its chapter in both directions", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#values").waitFor({ state: "attached" });
    await page
      .locator("header[data-lenis-connected='true']")
      .waitFor({ state: "attached", timeout: 5_000 });
    /* The ONE pin (ch04) inserts ~1 viewport of spacer above #values
       AFTER the day-arc triggers measure. PipelineRun now sort()s and
       refresh()es on pin creation; wait for the settled layout the way
       a visitor's scroll does (the atlas gate probe's pattern). */
    await page
      .locator(".pin-spacer")
      .first()
      .waitFor({ state: "attached", timeout: 8_000 });

    /* Late chapter 05 — section 06 still a full viewport below. With
       stale trigger starts (the pre-fix bug) the choreography believed
       itself already in range HERE and dusked one chapter early. */
    await scrollDuskTo(page, 1.2);
    await expect.poll(() => arcPhase(page), { timeout: 5_000 }).toBeNull();
    expect(await gloaming(page)).toBe(false);

    /* Inside the range, above the flip fraction: gloaming, still day */
    await scrollDuskTo(page, topFractionAt(0.45));
    await expect.poll(() => gloaming(page), { timeout: 5_000 }).toBe(true);
    expect(await arcPhase(page)).toBeNull();

    /* Past the flip fraction: dusk lands, exactly at its chapter */
    await scrollDuskTo(page, topFractionAt(0.7));
    await expect.poll(() => arcPhase(page), { timeout: 5_000 }).toBe("dusk");

    /* And back out — the boundary reverses at the same fraction */
    await scrollDuskTo(page, topFractionAt(0.45));
    await expect.poll(() => arcPhase(page), { timeout: 5_000 }).toBeNull();
    await scrollDuskTo(page, 1.2);
    await expect.poll(() => gloaming(page), { timeout: 5_000 }).toBe(false);
  });
});

test.describe("day arc — reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(PREVIEW);
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
  });

  test("static per-chapter waypoint backgrounds, dusk ink past the flip", async ({
    page,
  }) => {
    /* A7: the engine never mounts */
    await expect(page.locator("header")).toHaveAttribute(
      "data-lenis-connected",
      "false"
    );

    /* Each chapter paints its own FLAT waypoint statically (final form:
       one color per chapter; the stepped dusk-band overlay is gone) */
    const bg = (id: string) =>
      page
        .locator(`[data-chapter='${id}']`)
        .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(await bg("01")).toBe(RGB.w01);
    expect(await bg("04")).toBe(RGB.w04);
    expect(await bg("06")).toBe(RGB.w06);
    expect(await bg("07")).toBe(RGB.w07);

    const bandOverlay = await page
      .locator("[data-chapter='06']")
      .evaluate((el) => getComputedStyle(el, "::before").content);
    expect(bandOverlay).toBe("none");

    /* Chapters past the dusk flip carry dusk ink, statically */
    const inkOf = (id: string) =>
      page
        .locator(`[data-chapter='${id}']`)
        .evaluate((el) => getComputedStyle(el).color);
    expect(await inkOf("01")).toBe(RGB.ink);
    expect(await inkOf("06")).toBe(RGB.inkDusk);
    expect(await inkOf("07")).toBe(RGB.inkDusk);

    await noHorizontalOverflow(page);
  });

  test("no scrubbing: deep scroll writes no channel vars, no dusk step", async ({
    page,
  }) => {
    /* The engine's write target is the LightField container (PERF-AUDIT
       fix 2); <html> is probed too so a root-write regression is caught. */
    const arcState = () =>
      page.evaluate(() => ({
        l: document.documentElement.style.getPropertyValue("--arc-l"),
        fieldL:
          document
            .querySelector<HTMLElement>("[data-light-field]")
            ?.style.getPropertyValue("--arc-l") ?? "",
        phase: document.documentElement.getAttribute("data-arc-phase"),
        gloaming: document.documentElement.hasAttribute("data-arc-gloaming"),
        tier: document.documentElement.getAttribute("data-tier"),
      }));

    const before = await arcState();
    expect(before.l).toBe("");
    expect(before.fieldL).toBe("");
    expect(before.phase).toBeNull();
    expect(before.gloaming).toBe(false);
    /* Reduced motion forces the print edition (§F2 — the gate wins) */
    expect(before.tier).toBe("print");

    await scrollToChapter(page, "07");
    await page.waitForTimeout(600);

    const after = await arcState();
    expect(after.l).toBe("");
    expect(after.fieldL).toBe("");
    expect(after.phase).toBeNull();
    expect(after.gloaming).toBe(false);
    expect(after.tier).toBe("print");
  });
});
