import { test, expect, type Page } from "@playwright/test";

/**
 * The run chrome (round 12, Stage C): the running head and the corner
 * manifest — the prototype's persistent instruments on production's
 * chapters and production's words.
 *
 *  1. The running head (DayMark, xl+): `run 041 · <clock> · <station>`.
 *     The clock is the paper's OWN record (the kicker datelines,
 *     06:12 → 22:41) interpolated against the reading line — it
 *     advances with scroll and retreats with it, and reads the SAME
 *     value at the same scroll from either direction (the crossing
 *     race was measured and fixed; this spec pins it).
 *  2. The corner manifest (RunManifest, xl+): `run 041 — manifest
 *     N / 6`, one cargo line per chapter — every line a string the
 *     page already prints (D6: mirror, never invent). It counts up
 *     going down and BACK DOWN going up in the motion world; expands
 *     for the stamping beat and folds to the pill so the corner never
 *     occludes fig 4.1 or the gate stamp.
 *  3. Static worlds (A7): the clock is the active chapter's own
 *     dateline (stepped state, no machinery); the manifest holds the
 *     folded pill and its count BANKS — never retreats — matching the
 *     ChapterRail's static contract.
 *  4. The run number is one number: the head, the manifest, the gate
 *     stamp and fig 4.1's registry all say 041.
 */

declare global {
  interface Window {
    __runChromeProbe?: never;
  }
}

/** The running head's full text, or null off-surface / below xl. */
function runState(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const el = document.querySelector("[data-day-mark] .label-mono");
    if (!el) return null;
    return getComputedStyle(el).display === "none"
      ? null
      : (el.textContent?.replace(/\s+/g, " ").trim() ?? null);
  });
}

/** The interpolated clock text. */
function clockText(page: Page): Promise<string | null> {
  return page.evaluate(
    () => document.querySelector("[data-run-clock]")?.textContent ?? null
  );
}

/** The manifest count text ("N / 6"), or null. */
function manifestCount(page: Page): Promise<string | null> {
  return page.evaluate(
    () =>
      document
        .querySelector("[data-manifest-count]")
        ?.textContent?.replace(/\s+/g, " ")
        .trim() ?? null
  );
}

async function settleScroll(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(450);
}

test.describe("run chrome — motion world", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page
      .locator("header[data-lenis-connected='true']")
      .waitFor({ state: "attached", timeout: 5000 });
    await page.evaluate(() => document.fonts.ready);
  });

  test("the running head carries run 041, an advancing clock, the station", async ({
    page,
  }) => {
    const xl = await page.evaluate(
      () => document.documentElement.clientWidth >= 1280
    );
    test.skip(!xl, "the running head's dateline is xl+ only");

    const atTop = await runState(page);
    expect(atTop).toMatch(/^run 041 · \d\d:\d\d · arrival$/);

    /* Deep in the paper: the clock has advanced, the station changed */
    const docH = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    await settleScroll(page, Math.round(docH * 0.45));
    const mid = await runState(page);
    expect(mid).toMatch(/^run 041 · \d\d:\d\d · /);
    expect(mid).not.toBe(atTop);

    /* The nightfall end: the record closes on the gate's own dateline */
    await settleScroll(page, docH);
    await expect.poll(() => runState(page)).toBe("run 041 · 22:41 · the gate");

    /* And the record REVERSES: back at the top, the same opening state
       (the same-scroll parity both directions is the crossing-race
       regression pin). */
    await settleScroll(page, Math.round(docH * 0.45));
    const midAgain = await runState(page);
    expect(midAgain).toBe(mid);
    await settleScroll(page, 0);
    await expect.poll(() => runState(page)).toBe(atTop);
  });

  test("the manifest stamps down, lifts back up, and folds to the pill", async ({
    page,
  }) => {
    const xl = await page.evaluate(
      () => document.documentElement.clientWidth >= 1280
    );
    test.skip(!xl, "the corner manifest is xl+ only");

    await expect.poll(() => manifestCount(page)).toBe("0 / 6");
    /* Folded at rest — the corner belongs to the work */
    await expect(page.locator(".run-manifest-lines")).toBeHidden();

    const docH = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    await settleScroll(page, Math.round(docH * 0.45));
    const midCount = await manifestCount(page);
    expect(midCount).toMatch(/^[2-5] \/ 6$/);
    /* The stamping beat opened the ledger; it folds again after */
    await expect(page.locator(".run-manifest[data-open]")).toHaveCount(1);
    await expect(page.locator(".run-manifest[data-open]")).toHaveCount(0, {
      timeout: 5000,
    });

    await settleScroll(page, docH);
    await expect.poll(() => manifestCount(page)).toBe("6 / 6");

    /* Reversible: the count retreats on the way back (the owner's
       reversibility applies to the record too) */
    await settleScroll(page, 0);
    await expect.poll(() => manifestCount(page)).toBe("0 / 6");

    /* Every cargo line is a string the page already prints — spot the
       two metric-bearing ones against their on-page sources (D6). */
    const lines = await page.evaluate(() =>
      Array.from(document.querySelectorAll(".run-manifest-line")).map(
        (li) => li.textContent?.replace(/\s+/g, " ").trim() ?? ""
      )
    );
    expect(lines).toHaveLength(6);
    expect(lines[4]).toContain("macro-f1 0.98 — 96-sample gate");
    expect(lines[5]).toContain("19/20 cited-source sweep");
    await expect(
      page.locator("#work", { hasText: "macro-f1 0.98 — 96-sample gate" })
    ).toHaveCount(1);

    /* One run number everywhere: head, manifest, stamp, registry */
    expect(await runState(page)).toContain("run 041");
    await expect(
      page.locator(".run-manifest-head", { hasText: "run 041" })
    ).toHaveCount(1);
    await expect(
      page.getByRole("button", {
        name: /approve run no\. 041 — press to sign/i,
      })
    ).toHaveCount(1);
  });
});

test.describe("run chrome — static world (reduced motion)", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
  });

  test("stepped clock, banked manifest, pill held (A7: state, not motion)", async ({
    page,
  }) => {
    const xl = await page.evaluate(
      () => document.documentElement.clientWidth >= 1280
    );
    test.skip(!xl, "the run chrome's dateline surfaces are xl+ only");

    /* The clock is the chapter's own dateline — no tween machinery */
    expect(await clockText(page)).toBe("06:12");

    const docH = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    await settleScroll(page, docH);
    await expect.poll(() => clockText(page)).toBe("22:41");
    await expect.poll(() => manifestCount(page)).toBe("6 / 6");
    /* The pill never opens in a static world */
    await expect(page.locator(".run-manifest[data-open]")).toHaveCount(0);
    await expect(page.locator(".run-manifest-lines")).toBeHidden();

    /* Banked: scrolling back does NOT retreat the static record —
       the ChapterRail's own static contract, applied to the ledger */
    await settleScroll(page, 0);
    await expect.poll(() => clockText(page)).toBe("06:12");
    expect(await manifestCount(page)).toBe("6 / 6");
  });
});
