import { expect, test } from "@playwright/test";

test.describe("reduced motion and keyboard access", () => {
  test("page remains usable with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });
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
    await page.goto("/#projects");
    await expect(page.locator("#projects")).toBeInViewport();
  });
});
