import { expect, test } from "@playwright/test";

/**
 * The home page, as it actually ships.
 *
 * `npm run build` is `next build && node scripts/run/build-home.mjs`, and that
 * second step overwrites out/index.html with src/run/index.html. So the home a
 * visitor gets is the run — thirteen stations on one hand-authored page — and
 * not anything src/app/page.tsx renders.
 *
 * Until now the e2e scripts ran `next build` WITHOUT build-home.mjs, so
 * Playwright was served the old React home while users got the run. That is why
 * thirteen assertions in atlas.spec.ts, four in reduced-motion.spec.ts and one
 * in performance-budget.spec.ts passed for months while addressing markers
 * — [data-chapter], [data-thread], [data-hero-standfirst], #arrival — that
 * appear ZERO times in the deployed page. Those thirteen are removed from atlas
 * (its remaining coverage is the case-study routes, which are real Next routes
 * and still pass); this file is their replacement, written against the run's
 * own information architecture.
 *
 * The run's IA, for anyone re-pointing another spec:
 *
 *   station      section.beat[data-beat="0".."12"]   (was [data-chapter])
 *   its dateline .kicker, "¶ 01 · the start — 06:12"
 *   deep links   #review #cosigners #gate #nextmorning
 *   the line     canvas#thread                        (was [data-thread])
 */

const HOME_WIDTHS = [390, 768, 1440] as const;

/** "¶ 08 · fifth station · the honest hour — 21:07" → 21 * 60 + 7 */
function minutesOf(kicker: string): number | null {
  const m = kicker.match(/(\d{2}):(\d{2})\s*$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

test.describe("the home page is the run", () => {
  test("carries the identity, and one of it", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-beat="0"]').waitFor({ state: "attached" });

    await expect(page.locator("h1")).toHaveText(/Ayush\s*·?\s*Yadav/);
    await expect(page).toHaveTitle(/Ayush Yadav/);

    /* A single public identity: no theme switcher, no light/dark control.
       The day arc IS the theme and it belongs to the scroll, not to a button. */
    const controls = await page
      .getByRole("button")
      .evaluateAll((els) =>
        els
          .map(
            (e) =>
              (e.textContent ?? "") + " " + (e.getAttribute("aria-label") ?? "")
          )
          .filter((t) => /theme|dark mode|light mode|appearance/i.test(t))
      );
    expect(controls).toEqual([]);
  });

  test("is thirteen stations, and the day runs dawn to nightfall in order", async ({
    page,
  }) => {
    await page.goto("/");
    const kickers = await page
      .locator("[data-beat] .kicker")
      .evaluateAll((els) =>
        els.map((e) => (e.textContent ?? "").replace(/\s+/g, " ").trim())
      );

    expect(kickers).toHaveLength(13);
    expect(kickers[0]).toMatch(/^¶ 01 · the start — 06:12$/);
    expect(kickers[11]).toMatch(/^¶ 12 · the approval gate — 22:41$/);

    /* run 042 is ONE day: every dateline is later than the one before it, from
       first light to the gate. ¶13 is the next morning and deliberately wraps —
       it belongs to run 043, which is why the thread stops at ¶12. */
    const day = kickers.slice(0, 12).map(minutesOf);
    expect(day).not.toContain(null);
    for (let i = 1; i < day.length; i++) {
      expect(day[i]!, `¶${i + 1} must be later than ¶${i}`).toBeGreaterThan(
        day[i - 1]!
      );
    }
    expect(minutesOf(kickers[12]!)).toBe(6 * 60 + 12);
  });

  test("the work rows reach their case files", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page
      .locator('a[href*="/projects/"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));

    expect(hrefs.length).toBeGreaterThanOrEqual(6);
    for (const h of hrefs)
      expect(h).toMatch(/\/projects\/[a-z0-9-]+\/?(#.*)?$/);
  });

  test("the gate carries the address and LinkedIn", async ({ page }) => {
    await page.goto("/");
    /* the reader who has read to the end must be able to answer */
    await expect(page.locator('a[href^="mailto:"]').first()).toHaveAttribute(
      "href",
      /mailto:.+@.+\..+/
    );
    expect(
      await page.locator('a[href*="linkedin.com"]').count()
    ).toBeGreaterThan(0);
    await expect(page.locator("#gate")).toHaveCount(1);
  });

  test("the thread is drawn, and it belongs to run 042", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("canvas#thread")).toHaveCount(1);
    /* the dock the line terminates on — probe-terminus measures where the ink
       actually lands; this only asserts the terminus exists to land on */
    await expect(page.locator("#gateDock")).toHaveCount(1);
  });

  for (const w of HOME_WIDTHS) {
    test(`no horizontal overflow at ${w}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/");
      await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
      await page.waitForTimeout(300);
      const over = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth
      );
      expect(
        over,
        `${w}px viewport must not scroll sideways`
      ).toBeLessThanOrEqual(0);
    });
  }

  test("the gate is the last screen until it is approved", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
    await page.waitForTimeout(400);

    /* ¶13 does not exist until the run is approved — it collapses to zero
       height so the document ends at the gate and the gate is the last screen */
    const h = await page
      .locator("#nextmorning")
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBe(0);
  });
});
