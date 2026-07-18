import { expect, test } from "@playwright/test";

test("homepage stays within launch performance budgets", async ({ page }) => {
  const responses: { url: string; encodedBodySize: number }[] = [];

  page.on("response", async (response) => {
    const sizes = await response
      .request()
      .sizes()
      .catch(() => null);
    if (sizes) {
      responses.push({
        url: response.url(),
        encodedBodySize: sizes.responseBodySize,
      });
    }
  });

  await page.goto("/");
  await page.locator("#arrival").waitFor({ state: "attached" });
  await page.waitForLoadState("networkidle");

  const totalBytes = responses.reduce(
    (sum, item) => sum + item.encodedBodySize,
    0
  );
  expect(totalBytes).toBeLessThan(4_000_000);

  const oversizedImages = responses.filter(
    (item) =>
      /\.(png|jpe?g|webp|svg)(\?|$)/.test(item.url) &&
      item.encodedBodySize > 2_000_000
  );
  expect(oversizedImages).toEqual([]);

  const vitals = await page.evaluate(() => {
    const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
    const layoutShiftEntries = performance.getEntriesByType("layout-shift");
    const cls = layoutShiftEntries.reduce((sum, entry) => {
      const candidate = entry as PerformanceEntry & {
        value?: number;
        hadRecentInput?: boolean;
      };
      return candidate.hadRecentInput ? sum : sum + (candidate.value ?? 0);
    }, 0);

    return {
      lcp: lcpEntries.at(-1)?.startTime ?? 0,
      cls,
    };
  });

  expect(vitals.lcp).toBeLessThan(3_000);
  expect(vitals.cls).toBeLessThan(0.1);
});
