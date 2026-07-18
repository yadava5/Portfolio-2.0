import { test, expect, type Page } from "@playwright/test";

/**
 * Day-arc engine contract (rubric amendment A4/A7) on /world-preview/.
 *
 *  - The LightField base color is driven by scrubbed oklch channel vars:
 *    it must CHANGE between the top of the page and a deep scroll.
 *  - Ink flips as a STEP at the 05→06 boundary (`data-arc-phase="dusk"`
 *    on <html>), and flips back when scrolling above the boundary.
 *  - Reduced motion: the engine never mounts — chapters paint their own
 *    static waypoint backgrounds via CSS, no channel vars are ever
 *    written, and no dusk attribute appears (no scrubbing of any kind).
 *  - No horizontal overflow in either mode.
 */

const PREVIEW = "/world-preview/";

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
    await page.locator("html.lenis").waitFor({ state: "attached" });
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
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);

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
      }));

    const before = await arcState();
    expect(before.l).toBe("");
    expect(before.fieldL).toBe("");
    expect(before.phase).toBeNull();

    await scrollToChapter(page, "07");
    await page.waitForTimeout(600);

    const after = await arcState();
    expect(after.l).toBe("");
    expect(after.fieldL).toBe("");
    expect(after.phase).toBeNull();
  });
});
