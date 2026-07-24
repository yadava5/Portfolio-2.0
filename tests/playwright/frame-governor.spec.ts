import { test, expect, type Page } from "@playwright/test";

/**
 * Frame-governor contract (FABLE-VISUAL-BRIEF §F2/§F5).
 *
 *  - Everyone's first paint is Core (`data-tier="core"` stamped by the
 *    layout head script, synchronously, pre-paint) — never a Full flash.
 *  - Reduced motion / the quiet toggle force the print floor and disable
 *    the governor: the gate always wins.
 *  - A sessionStorage "study-tier-cap" of print is a next-load CEILING:
 *    the page boots straight into the print edition, engine never mounts.
 *  - Scoring (unit-style, via the __frameGovernor probe, which drives the
 *    REAL scorer): isolated blips decay away; sustained jank crosses the
 *    ≥8 line and downshifts one-way — core → print unmounts the engine,
 *    stamps data-motion-off, and persists the cap.
 *  - Forced-jank integration (chromium only): CDP CPU throttle + a
 *    genuinely blocked main thread during real scrolling downshifts the
 *    tier without any probe injection.
 */

function tier(page: Page) {
  return page.evaluate(() =>
    document.documentElement.getAttribute("data-tier")
  );
}

/* window.__frameGovernor is declared globally by
   src/components/world/governor.ts — the probe drives the real scorer. */
function governorState(page: Page) {
  return page.evaluate(() => window.__frameGovernor?.state() ?? null);
}

test.describe("frame governor — first-paint tier", () => {
  test("the motion world boots at Core with the governor watching", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });
    expect(await tier(page)).toBe("core");
    await expect(page.locator("html")).toHaveAttribute("data-tier", "core");
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-off");

    await page
      .locator("header[data-lenis-connected='true']")
      .waitFor({ state: "attached", timeout: 5_000 });
    await expect
      .poll(async () => (await governorState(page))?.watching)
      .toBe(true);
  });

  test("reduced motion forces the print floor and disables the governor", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });

    await expect(page.locator("html")).toHaveAttribute("data-tier", "print");
    await expect(page.locator("header")).toHaveAttribute(
      "data-lenis-connected",
      "false"
    );
    /* The print floor IS the static world: SmoothScroll stamps the
       static-world attribute for it */
    await expect(page.locator("html")).toHaveAttribute("data-motion-off", "");
    expect((await governorState(page))?.watching).toBe(false);
    /* The hero must paint finished — no entrance gate under print */
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-ready");
  });

  test("a sessionStorage print cap is the next load's ceiling — no richer flash", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.sessionStorage.setItem("study-tier-cap", "print");
    });
    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });

    await expect(page.locator("html")).toHaveAttribute("data-tier", "print");
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-ready");
    await expect(page.locator("header")).toHaveAttribute(
      "data-lenis-connected",
      "false"
    );
    await expect(page.locator("html")).toHaveAttribute("data-motion-off", "");

    /* The static world paints (chapter 07 carries its nightfall) */
    await expect
      .poll(() =>
        page
          .locator("[data-chapter='07']")
          .evaluate((el) => getComputedStyle(el).backgroundColor)
      )
      .toBe("rgb(44, 38, 34)");
  });
});

test.describe("frame governor — scoring (probe drives the real scorer)", () => {
  test.beforeEach(async ({ page }) => {
    /* Pin the session ceiling to Core BEFORE load. These tests assert
       the Core→Print scoring path; on a loaded CI machine the governor
       can promote Core→Full between the setup scroll and the injected
       frames (stable-scroll time accumulates while waits stretch), so
       the same +8 landed Full→Core and the assertions flaked — verified
       flaky at the pre-retune base too. A stamped "core" cap disables
       promotion (readCap() gates promotionAllowed) without touching the
       downshift path under test. The CDP forced-jank describe below
       stays unpinned — it exercises the real promotion machinery.
       Init scripts re-run on EVERY load, so only stamp when absent —
       the "ceiling holds across a reload" assertion depends on the
       persisted print cap surviving the reload. */
    await page.addInitScript(() => {
      if (!window.sessionStorage.getItem("study-tier-cap")) {
        window.sessionStorage.setItem("study-tier-cap", "core");
      }
    });
    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });
    await page
      .locator("header[data-lenis-connected='true']")
      .waitFor({ state: "attached", timeout: 5_000 });
  });

  test("isolated blips decay away — no downshift", async ({ page }) => {
    /* One severe frame (+4) and a slow one (+1): score 5 < 8 */
    await page.evaluate(() => {
      window.__frameGovernor?.injectFrame(120);
      window.__frameGovernor?.injectFrame(40);
    });
    const scored = await governorState(page);
    expect(scored?.score).toBeGreaterThan(4);
    expect(scored?.tier).toBe("core");

    /* Decay ~1/sec: after >2s the score has melted, still core */
    await page.waitForTimeout(2_400);
    const decayed = await governorState(page);
    expect(decayed?.score).toBeLessThan(3.2);
    expect(decayed?.tier).toBe("core");
    await expect(page.locator("html")).toHaveAttribute("data-tier", "core");
  });

  test("sustained jank crosses 8 and downshifts core → print, one-way", async ({
    page,
  }) => {
    /* Anchor probe: the downshift unwinds the ch04 pin-spacer; the
       governor must re-align the reader's line (zero surprise). */
    await page
      .locator(".pin-spacer")
      .first()
      .waitFor({ state: "attached", timeout: 8_000 });
    await page.evaluate(() => {
      document.getElementById("who")?.scrollIntoView();
    });

    await page.evaluate(() => {
      /* Sustained: two catastrophic frames back-to-back (+4 each) */
      window.__frameGovernor?.injectFrame(120);
      window.__frameGovernor?.injectFrame(120);
    });

    /* The floor: tier print, engine gone, static world stamped */
    await expect(page.locator("html")).toHaveAttribute("data-tier", "print");
    await expect(page.locator("header")).toHaveAttribute(
      "data-lenis-connected",
      "false"
    );
    await expect(page.locator("html")).toHaveAttribute("data-motion-off", "");

    /* The lowest tier persists as the session ceiling */
    expect(
      await page.evaluate(() => window.sessionStorage.getItem("study-tier-cap"))
    ).toBe("print");

    /* One-way: the governor never upshifts mid-read */
    await page.waitForTimeout(600);
    await expect(page.locator("html")).toHaveAttribute("data-tier", "print");

    /* And the ceiling holds across a reload of the same session */
    await page.reload();
    await page.locator("#arrival").waitFor({ state: "attached" });
    await expect(page.locator("html")).toHaveAttribute("data-tier", "print");
    await expect(page.locator("header")).toHaveAttribute(
      "data-lenis-connected",
      "false"
    );
  });

  test("downshift keeps the reader's line — the pin-spacer unwind is compensated", async ({
    page,
  }) => {
    await page
      .locator(".pin-spacer")
      .first()
      .waitFor({ state: "attached", timeout: 8_000 });

    /* Read below the pin (chapter 06) so the spacer unwind matters */
    await page.evaluate(() => {
      const el = document.getElementById("values");
      if (el) {
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 100,
          behavior: "instant",
        });
      }
    });
    await page.waitForTimeout(200);
    const before = await page.evaluate(() => {
      const el = document.getElementById("values");
      return el ? el.getBoundingClientRect().top : null;
    });

    await page.evaluate(() => {
      window.__frameGovernor?.injectFrame(120);
      window.__frameGovernor?.injectFrame(120);
    });
    await expect(page.locator("html")).toHaveAttribute("data-tier", "print");

    /* After the engine unmounts and the spacer unwinds, the chapter the
       visitor was reading sits where it sat (±16px of settling). */
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const el = document.getElementById("values");
            return el ? Math.round(el.getBoundingClientRect().top) : null;
          }),
        { timeout: 5_000 }
      )
      .toBeLessThan((before ?? 0) + 16);
    const after = await page.evaluate(() => {
      const el = document.getElementById("values");
      return el ? el.getBoundingClientRect().top : null;
    });
    expect(Math.abs((after ?? 0) - (before ?? 0))).toBeLessThanOrEqual(16);
  });
});

test.describe("frame governor — forced-jank integration (CDP)", () => {
  test("a genuinely struggling main thread downshifts the tier during real scrolling", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "CDP throttling is chromium-only");

    await page.goto("/");
    await page.locator("#arrival").waitFor({ state: "attached" });
    await page
      .locator("header[data-lenis-connected='true']")
      .waitFor({ state: "attached", timeout: 5_000 });
    expect(await tier(page)).toBe("core");

    /* Force jank the honest way: throttle the CPU AND give the main
       thread real work on every scroll event — the governor must catch
       it from timing alone (no probe injection here). */
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
    await page.evaluate(() => {
      window.addEventListener(
        "scroll",
        () => {
          const start = performance.now();
          while (performance.now() - start < 45) {
            /* burn — a deliberately heavy scroll handler */
          }
        },
        { passive: true }
      );
    });

    /* Real wheel scrolling through the page */
    for (let i = 0; i < 40; i++) {
      await page.mouse.wheel(0, 360);
      await page.waitForTimeout(40);
      const current = await tier(page);
      if (current === "print") break;
    }

    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    await expect(page.locator("html")).toHaveAttribute("data-tier", "print");
    await expect(page.locator("header")).toHaveAttribute(
      "data-lenis-connected",
      "false"
    );
    expect(
      await page.evaluate(() => window.sessionStorage.getItem("study-tier-cap"))
    ).toBe("print");
  });
});
