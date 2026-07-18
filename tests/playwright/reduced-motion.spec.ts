import { expect, test } from "@playwright/test";

test.describe("reduced motion and keyboard access", () => {
  test("page remains usable with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });
    await expect(page.locator("main")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /resume/i }).first()
    ).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
  });

  test("anchor navigation does not depend on scroll animation", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#work");
    await expect(page.locator("#work")).toBeInViewport();
  });

  test("chapters paint static waypoint colors without the engine", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });

    /* A7: the engine never mounts */
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);

    /* Chapters carry their own FLAT waypoint backgrounds (globals.css,
       static final form — one color per chapter, no band steps) */
    const bg = (id: string) =>
      page
        .locator(`[data-chapter='${id}']`)
        .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(await bg("01")).toBe("rgb(251, 243, 231)"); /* dawn */
    expect(await bg("04")).toBe("rgb(245, 237, 220)"); /* warm afternoon */
    expect(await bg("06")).toBe("rgb(67, 55, 47)"); /* dusk */
    expect(await bg("07")).toBe("rgb(44, 38, 34)"); /* nightfall */

    /* Chapters past the dusk flip carry dusk ink, statically */
    const ink = (id: string) =>
      page
        .locator(`[data-chapter='${id}']`)
        .evaluate((el) => getComputedStyle(el).color);
    expect(await ink("01")).toBe("rgb(38, 35, 28)");
    expect(await ink("07")).toBe("rgb(246, 239, 226)");
  });

  test("color changes land at the folio dividers — no dusk bands", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("[data-chapter='07']").waitFor({ state: "attached" });

    /* The round-3 stepped duotone band overlay is gone for good */
    const bandOverlay = await page
      .locator("[data-chapter='06']")
      .evaluate((el) => getComputedStyle(el, "::before").content);
    expect(bandOverlay).toBe("none");

    /* Each chapter's tail (below its folio rule) already wears the NEXT
       chapter's field via a two-stop hard gradient: chapter 05's
       background-image carries the dusk waypoint, so the golden→dusk
       change lands exactly at the 05|06 terminator */
    const goldenImage = await page
      .locator("[data-chapter='05']")
      .evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(goldenImage).toContain("rgb(67, 55, 47)");

    /* The terminator itself: folio 05 renders the heavier authored rule */
    await expect(
      page.locator("[data-chapter='05'] [data-folio-terminator]")
    ).toHaveCount(1);

    /* And the seam sits AT the divider: the hard stop's distance from
       the chapter top equals the folio rule's bottom edge (±3px) */
    const seam = await page.evaluate(() => {
      const section = document.querySelector("[data-chapter='05']");
      const folio = section?.querySelector("[data-folio-terminator]");
      if (!section || !folio) return null;
      const sectionBox = section.getBoundingClientRect();
      const folioBox = folio.getBoundingClientRect();
      const tail = getComputedStyle(section).getPropertyValue("--wp-tail");
      const probe = document.createElement("div");
      probe.style.height = tail;
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      section.appendChild(probe);
      const tailPx = probe.getBoundingClientRect().height;
      probe.remove();
      return {
        drift: Math.abs(
          sectionBox.height - tailPx - (folioBox.bottom - sectionBox.top)
        ),
      };
    });
    expect(seam).not.toBeNull();
    expect(seam!.drift).toBeLessThanOrEqual(3);
  });
});
