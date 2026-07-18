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

    /* Chapters carry their own waypoint backgrounds (globals.css) */
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
});
