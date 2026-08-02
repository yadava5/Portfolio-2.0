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
  /* The home is src/run/index.html, whose first station is [data-beat="0"].
     `#arrival` was the old React home's hero and appears nowhere in the
     deployed page — the wait simply timed out once the test build started
     producing the artifact users actually get. */
  await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
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
