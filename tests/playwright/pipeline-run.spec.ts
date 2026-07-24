import { test, expect, type Page } from "@playwright/test";

/**
 * The pinned pipeline run (PREMIUM-FLOW ⭐#2) on the homepage — chapter 04's
 * thesis made literal: an ink run-token travels the 7-phase ladder as the
 * figure is pinned, each phase ink-settles as it passes, and at THE HUMAN
 * GATE the token HALTS + pulses clay and HOLDS.
 *
 * The load-bearing HONESTY contract (this is why the scene exists):
 *  - the token halts at the gate; `7.0 deploy` NEVER lights on scroll
 *    (deploy is what a human authorises after the gate);
 *  - run 041 is NEVER approved by scrolling — the registry row stays
 *    "awaiting approval" and its press-to-sign button stays unpressed;
 *  - the static (reduced-motion / quiet-toggle) world renders the honest
 *    resting FRAME: edge drawn to the gate, phases 1–6 lit, deploy still
 *    secondary, the token resting clay at the gate, 041 still awaiting.
 */

/** kiln clay-graphic (#c4532e) and the two inks, as computed rgb. */
const CLAY = "rgb(196, 83, 46)";
const INK = "rgb(38, 35, 28)";
const INK_SECONDARY = "rgb(92, 86, 74)";

interface RunState {
  scrub: boolean;
  halted: boolean;
  litCount: number;
  deployLit: number;
  edgeOffset: number;
  beadFill: string;
  awaiting: boolean;
  pressed: string | null;
}

/** Read the whole scene's state in one round-trip. */
function runState(page: Page): Promise<RunState> {
  return page.evaluate(() => {
    const token = document.querySelector(".pipeline-token");
    const edge = document.querySelector<SVGPathElement>(".pipeline-edge");
    const bead = document.querySelector(".pipeline-token-bead");
    const approve = document.querySelector("[data-registry-approve]");
    const registryRow = document.querySelector(
      "#automl li:has([data-registry-approve])"
    );
    return {
      scrub: !!document.querySelector("[data-pipeline-scrub]"),
      halted: token?.classList.contains("is-halted") ?? false,
      litCount: document.querySelectorAll(
        "[data-pipeline-phase][data-pipeline-lit]"
      ).length,
      deployLit: document.querySelectorAll(
        "[data-pipeline-gated][data-pipeline-lit]"
      ).length,
      edgeOffset: edge
        ? parseFloat(getComputedStyle(edge).strokeDashoffset)
        : Number.NaN,
      beadFill: bead ? getComputedStyle(bead).fill : "?",
      awaiting: (registryRow?.textContent ?? "").includes("awaiting"),
      pressed: approve?.getAttribute("aria-pressed") ?? null,
    };
  });
}

/** Pin start (≈ wrapper top at 22% of the viewport) + pinned distance. */
function pinRange(page: Page) {
  return page.evaluate(() => {
    const wrap = document.querySelector("[data-pipeline-pin]");
    if (!wrap) return null;
    const rect = wrap.getBoundingClientRect();
    const docTop = rect.top + window.scrollY;
    return {
      start: Math.round(docTop - 0.22 * window.innerHeight),
      dist: Math.round(window.innerHeight * 1.05),
    };
  });
}

async function waitForOverlay(page: Page) {
  await page.locator("[data-chapter='04']").waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
  await page
    .locator("svg[data-pipeline-overlay] path.pipeline-edge")
    .waitFor({ state: "attached", timeout: 10_000 });
}

test.describe("pipeline run — motion world", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page
      .locator("header[data-lenis-connected='true']")
      .waitFor({ state: "attached", timeout: 6_000 });
    await waitForOverlay(page);
  });

  test("the token travels and HALTS at the human gate; deploy never resolves; 041 never approves", async ({
    page,
  }) => {
    /* The pin is live (exactly one — A8's single sanctioned pin) */
    await expect(page.locator("[data-pipeline-scrub]")).toHaveCount(1);

    const range = await pinRange(page);
    expect(range).not.toBeNull();
    const { start, dist } = range!;

    /* Early in the run: the token has not reached the gate, the edge is
       still drawing, and 041 is untouched. */
    await page.evaluate((y) => window.scrollTo(0, y), start + 20);
    await expect.poll(async () => (await runState(page)).halted).toBe(false);
    const early = await runState(page);
    expect(early.edgeOffset, "edge still drawing").toBeGreaterThan(0.15);
    expect(early.deployLit, "deploy never lights").toBe(0);
    expect(early.awaiting, "041 awaiting").toBe(true);

    /* Deep in the pinned range: the token has HALTED at the gate — all six
       ungated phases lit, the edge fully drawn, the bead clay. */
    await page.evaluate(
      (y) => window.scrollTo(0, y),
      start + Math.round(dist * 0.98)
    );
    await expect
      .poll(async () => (await runState(page)).halted, {
        timeout: 6_000,
      })
      .toBe(true);
    /* The bead tints clay over a 300ms fill transition — poll for it */
    await expect
      .poll(async () => (await runState(page)).beadFill, {
        timeout: 3_000,
      })
      .toBe(CLAY);

    const held = await runState(page);
    expect(held.litCount, "phases 1–6 all lit").toBe(6);
    expect(held.deployLit, "7.0 deploy NEVER lights — the gated phase").toBe(0);
    expect(held.edgeOffset, "edge drawn to the gate").toBeLessThan(0.05);
    expect(held.beadFill, "token rests clay at the gate").toBe(CLAY);

    /* The honesty invariant, at the very moment of the halt: the scroll
       did NOT approve run 041. */
    expect(held.awaiting, "registry row still awaiting").toBe(true);
    expect(held.pressed, "press-to-sign button unpressed").toBe("false");
    await expect(
      page.locator("#automl li").filter({ hasText: "041" }).first()
    ).toContainText("awaiting approval");

    /* The scrub reverses: back at the top the run retreats and un-halts. */
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect
      .poll(async () => (await runState(page)).halted, {
        timeout: 6_000,
      })
      .toBe(false);
    expect((await runState(page)).litCount, "phases retreat").toBeLessThan(6);
  });
});

test.describe("pipeline run — static fallback (reduced motion)", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await waitForOverlay(page);
  });

  test("the honest resting frame: drawn to the gate, deploy pending, 041 awaiting, no scrub", async ({
    page,
  }) => {
    /* A7: the engine never mounts and the pin never exists */
    await expect(page.locator("header")).toHaveAttribute(
      "data-lenis-connected",
      "false"
    );
    await expect(page.locator("[data-pipeline-scrub]")).toHaveCount(0);

    await page.evaluate(() =>
      document
        .querySelector("[data-pipeline-scope]")
        ?.scrollIntoView({ block: "center" })
    );

    const st = await runState(page);
    expect(st.scrub).toBe(false);
    expect(st.edgeOffset, "edge drawn to the gate").toBeLessThan(0.05);
    expect(st.beadFill, "token rests clay at the gate").toBe(CLAY);
    expect(st.halted, "token holds at the gate").toBe(true);

    /* Phases 1–6 lit (full ink); 7.0 deploy stays secondary — it is
       gated, and static must not imply it ran. */
    const phaseColors = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-pipeline-phase]:not([data-pipeline-gated])"
        )
      ).map((el) => getComputedStyle(el).color)
    );
    expect(phaseColors).toHaveLength(6);
    for (const color of phaseColors) expect(color).toBe(INK);
    const deployColor = await page
      .locator("[data-pipeline-gated]")
      .evaluate((el) => getComputedStyle(el).color);
    expect(deployColor, "deploy stays secondary").toBe(INK_SECONDARY);

    /* Run 041 is still the visitor's to sign */
    expect(st.awaiting).toBe(true);
    expect(st.pressed).toBe("false");
  });
});
