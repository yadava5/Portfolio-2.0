import { test, expect, type Page } from "@playwright/test";

/**
 * Red Thread contract (rubric amendment A3) on the homepage.
 *
 *  1. Seven per-chapter segments render (data-thread-segment="01"–"07")
 *     with seam endpoints aligned on the shared spine x, each carrying
 *     the pressure layer (path.thread-swell) that scrubs with the main
 *     stroke — the ink-physicality craft round.
 *  2. Motion: the solid "past" path draws by scroll-scrub — mid-page,
 *     earlier segments are fully drawn (dashoffset ≈ 0), later segments
 *     near-undrawn; the current chapter's node is filled (04's node is
 *     the clay gate-square; the rest are hand-drawn rings). The static
 *     nightfall dip stays hidden under motion.
 *  3. Reduced motion (A7): no thread ScrollTriggers exist
 *     (data-thread-scrub absent), every solid path renders fully drawn,
 *     every node filled — the static world shows a finished run, and
 *     segment 05's tail below the 05|06 folio terminator is re-inked in
 *     dusk cream (path.thread-dip) — the pen dips through nightfall at
 *     the page's one authored seam.
 *  4. No horizontal overflow at any project viewport, and the thread
 *     never crosses a text box (sampled path points vs known text
 *     element rects). The chapter-03 word underline is the sanctioned
 *     exception: inside the deck paragraph's box it must stay BELOW the
 *     measured word span (an authored underline, not a strike-through).
 *  5. The finale: the gate segment ends ON the awaiting stamp — the
 *     run's heavier ink blot sits on the stamp boundary — and the stamp
 *     names run no. 041, the SAME run fig 4.1's registry shows awaiting
 *     approval.
 *
 * The solid path uses pathLength=1, so drawn ⇔ computed
 * stroke-dashoffset ≈ 0 and undrawn ⇔ ≈ 1.5 (the authored rest value).
 */

const SEGMENT_IDS = ["01", "02", "03", "04", "05", "06", "07"];

/** Wait until every segment has generated real path geometry. */
async function waitForThread(page: Page) {
  await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            Array.from(
              document.querySelectorAll<SVGPathElement>(
                "svg[data-thread-segment] path.thread-past"
              )
            ).filter((path) => (path.getAttribute("d") ?? "").length > 20)
              .length
        ),
      { timeout: 10_000 }
    )
    .toBe(7);
}

/** Computed stroke-dashoffset (pathLength-normalized) per segment. */
function dashoffsets(
  page: Page,
  selector = "path.thread-past"
): Promise<Record<string, number>> {
  return page.evaluate((pathSelector) => {
    const out: Record<string, number> = {};
    for (const svg of document.querySelectorAll("svg[data-thread-segment]")) {
      const past = svg.querySelector(pathSelector);
      if (!past) continue;
      const raw = getComputedStyle(past).getPropertyValue("stroke-dashoffset");
      out[svg.getAttribute("data-thread-segment") ?? "?"] = parseFloat(raw);
    }
    return out;
  }, selector);
}

/** Whether a segment's node is filled (class-driven or static CSS). */
function nodeFill(page: Page, id: string): Promise<string> {
  return page.evaluate((segmentId) => {
    const node = document.querySelector(
      `svg[data-thread-segment='${segmentId}'] [data-thread-node]`
    );
    if (!node) return "missing";
    return getComputedStyle(node).getPropertyValue("fill");
  }, id);
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

async function scrollToId(page: Page, id: string) {
  await page.evaluate((sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView();
  }, id);
}

test.describe("red thread — structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForThread(page);
  });

  test("seven segments render, one per chapter, seams aligned", async ({
    page,
  }) => {
    for (const id of SEGMENT_IDS) {
      await expect(
        page.locator(`svg[data-thread-segment='${id}']`)
      ).toHaveCount(1);
    }

    /* Ink physicality: every segment layers the pressure stroke */
    await expect(
      page.locator("svg[data-thread-segment] path.thread-swell")
    ).toHaveCount(7);

    /* Seam contract: segment N's path ends where segment N+1's begins —
       same spine x, adjacent y (segments overshoot ±6px past the seam). */
    const seams = await page.evaluate(() => {
      const pagePoint = (svg: Element, path: SVGPathElement, at: number) => {
        const box = svg.getBoundingClientRect();
        const pt = path.getPointAtLength(at);
        return {
          x: box.left + window.scrollX + pt.x,
          y: box.top + window.scrollY + pt.y,
        };
      };
      const results: { seam: string; dx: number; dy: number }[] = [];
      for (let i = 1; i <= 6; i++) {
        const a = document.querySelector(
          `svg[data-thread-segment='0${i}']`
        ) as SVGSVGElement | null;
        const b = document.querySelector(
          `svg[data-thread-segment='0${i + 1}']`
        ) as SVGSVGElement | null;
        const pathA = a?.querySelector<SVGPathElement>("path.thread-past");
        const pathB = b?.querySelector<SVGPathElement>("path.thread-past");
        if (!a || !b || !pathA || !pathB) continue;
        const end = pagePoint(a, pathA, pathA.getTotalLength());
        const start = pagePoint(b, pathB, 0);
        results.push({
          seam: `0${i}→0${i + 1}`,
          dx: Math.abs(end.x - start.x),
          dy: Math.abs(end.y - start.y),
        });
      }
      return results;
    });
    expect(seams).toHaveLength(6);
    for (const seam of seams) {
      expect(seam.dx, `${seam.seam} x drift`).toBeLessThanOrEqual(2);
      expect(seam.dy, `${seam.seam} y gap`).toBeLessThanOrEqual(14);
    }

    /* The gate glyph: chapter 04's node is the clay square, not a dot */
    await expect(
      page.locator("svg[data-thread-segment='04'] rect.thread-node-gate")
    ).toHaveCount(1);
  });

  test("no horizontal overflow; the thread never crosses text", async ({
    page,
  }) => {
    await noHorizontalOverflow(page);

    const probe = await page.evaluate(() => {
      const TEXT_SELECTORS = [
        "[data-thread-kicker]",
        "[data-thread-name]",
        "#who p",
        "#path h3",
        "#path p",
        "#automl p",
        "#automl li",
        "#work h3",
        "#work p",
        "#values p",
        "#gate p",
        "#gate li",
        "#gate h2",
      ];
      const boxes: {
        sel: string;
        l: number;
        r: number;
        t: number;
        b: number;
        /* Authored-underline allowance: points BELOW this y are the
           chapter-03 word underline, sanctioned inside this box */
        allowBelow: number;
      }[] = [];
      const sx = window.scrollX;
      const sy = window.scrollY;
      for (const sel of TEXT_SELECTORS) {
        for (const el of document.querySelectorAll(sel)) {
          const rect = el.getBoundingClientRect();
          if (rect.width < 2 || rect.height < 2) continue;
          /* The deck paragraph that carries [data-thread-word] is the
             underline's home: the line may pass beneath the word span's
             glyph box (never above/through it). */
          const word = el.querySelector("[data-thread-word]");
          const allowBelow = word
            ? word.getBoundingClientRect().bottom + sy + 1
            : Number.POSITIVE_INFINITY;
          /* Shrink 2px: a hairline kiss at a box edge is not an overlap */
          boxes.push({
            sel,
            l: rect.left + sx + 2,
            r: rect.right + sx - 2,
            t: rect.top + sy + 2,
            b: rect.bottom + sy - 2,
            allowBelow,
          });
        }
      }
      const violations: string[] = [];
      for (const svg of document.querySelectorAll("svg[data-thread-segment]")) {
        const past = svg.querySelector<SVGPathElement>("path.thread-past");
        if (!past) continue;
        const box = svg.getBoundingClientRect();
        const ox = box.left + sx;
        const oy = box.top + sy;
        const total = past.getTotalLength();
        const samples = 110;
        for (let i = 0; i <= samples; i++) {
          const pt = past.getPointAtLength((total * i) / samples);
          const x = ox + pt.x;
          const y = oy + pt.y;
          for (const b of boxes) {
            if (x > b.l && x < b.r && y > b.t && y < b.b) {
              if (y > b.allowBelow) continue;
              violations.push(
                `seg ${svg.getAttribute(
                  "data-thread-segment"
                )} @ (${Math.round(x)}, ${Math.round(y)}) inside ${b.sel}`
              );
            }
          }
        }
      }
      return {
        textBoxes: boxes.length,
        violations: Array.from(new Set(violations)).slice(0, 8),
      };
    });

    /* Guard against selector rot: the probe must actually see the page */
    expect(probe.textBoxes).toBeGreaterThan(20);
    expect(probe.violations).toEqual([]);
  });

  test("the finale blots ON the stamp; stamp and registry share run 041", async ({
    page,
  }) => {
    const terminus = await page.evaluate(() => {
      const svg = document.querySelector("svg[data-thread-segment='07']");
      const past = svg?.querySelector<SVGPathElement>("path.thread-past");
      const gate = document.getElementById("gate");
      if (!svg || !past || !gate) return null;
      const sx = window.scrollX;
      const sy = window.scrollY;
      const box = svg.getBoundingClientRect();
      const end = past.getPointAtLength(past.getTotalLength());
      const x = box.left + sx + end.x;
      const y = box.top + sy + end.y;
      const gateRect = gate.getBoundingClientRect();
      const inGate =
        x >= gateRect.left + sx &&
        x <= gateRect.right + sx &&
        y >= gateRect.top + sy &&
        y <= gateRect.bottom + sy;
      const stamp = Array.from(
        document.querySelectorAll("[data-thread-stamp]")
      ).find((el) => el.getBoundingClientRect().width > 0);
      if (!stamp) return { inGate, distance: Number.POSITIVE_INFINITY };
      const s = stamp.getBoundingClientRect();
      const dx = Math.max(s.left + sx - x, 0, x - (s.right + sx));
      const dy = Math.max(s.top + sy - y, 0, y - (s.bottom + sy));
      return { inGate, distance: Math.hypot(dx, dy) };
    });

    expect(terminus).not.toBeNull();
    expect(terminus?.inGate).toBe(true);
    /* The run's heavier ink blot sits ON the stamp boundary — no
       orphaned terminal pointing at nothing (distance 0 inside the
       rotated frame's AABB; a small tolerance covers the blot radius) */
    expect(terminus?.distance).toBeLessThanOrEqual(8);

    /* Run-number discipline: the stamp is the SAME run the fig-4.1
       registry shows awaiting its human (exactly one stamp is laid out
       per viewport — desktop or compact seat). Since W1 the stamp is a
       real press-to-sign button; unpressed, it still names run 041. */
    await expect(
      page.getByRole("button", {
        name: /approve run no\. 041 — press to sign/i,
      })
    ).toHaveCount(1);
    const registryRow = page
      .locator("#automl li")
      .filter({ hasText: "041" })
      .first();
    await expect(registryRow).toContainText("awaiting approval");
  });
});

test.describe("red thread — motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("html.lenis").waitFor({ state: "attached" });
    await waitForThread(page);
  });

  test("solid paths draw with scroll; nodes fill as the line passes", async ({
    page,
  }) => {
    /* Every segment scrubs through its own ScrollTrigger */
    await expect(page.locator("svg[data-thread-scrub]")).toHaveCount(7);

    /* At the very top nothing has been inked yet: the origin node is
       still open (the head hasn't passed it) and the run ahead is
       dashed future — deep segments rest undrawn */
    expect(await nodeFill(page, "01")).toMatch(/^(none|rgba\(0, 0, 0, 0\))$/);
    const atTop = await dashoffsets(page);
    expect(atTop["07"]).toBeGreaterThan(1.3);

    /* Mid-page (the flagship): earlier segments fully drawn, passed
       nodes inked, the current chapter's node filled, later segments
       still future */
    await scrollToId(page, "automl");
    await expect
      .poll(async () => (await dashoffsets(page))["01"], { timeout: 8_000 })
      .toBeLessThan(0.05);
    await expect
      .poll(() => nodeFill(page, "01"), { timeout: 5_000 })
      .toBe("rgb(38, 35, 28)");
    await expect
      .poll(async () => (await dashoffsets(page))["02"], { timeout: 8_000 })
      .toBeLessThan(0.05);

    const mid = await dashoffsets(page);
    expect(mid["06"]).toBeGreaterThan(1.3);
    expect(mid["07"]).toBeGreaterThan(1.3);

    /* The gate-square fills with clay as the line reaches the flagship */
    await expect
      .poll(() => nodeFill(page, "04"), { timeout: 5_000 })
      .toBe("rgb(196, 83, 46)");
    expect(await nodeFill(page, "06")).toMatch(/^(none|rgba\(0, 0, 0, 0\))$/);
    expect(await nodeFill(page, "07")).toMatch(/^(none|rgba\(0, 0, 0, 0\))$/);

    /* Scrub reverses: back at the top the drawn past retreats and the
       flagship node reopens */
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect
      .poll(async () => (await dashoffsets(page))["02"], { timeout: 8_000 })
      .toBeGreaterThan(1);
    await expect
      .poll(() => nodeFill(page, "04"), { timeout: 5_000 })
      .toMatch(/^(none|rgba\(0, 0, 0, 0\))$/);
  });

  test("the drawing completes at the end of the page", async ({ page }) => {
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight)
    );
    /* clamp(bottom 60%) keeps the gate segment's range reachable — the
       run must be fully inked at the stamp */
    await expect
      .poll(async () => (await dashoffsets(page))["07"], { timeout: 8_000 })
      .toBeLessThan(0.05);
    /* The pressure layer rides the same tween: one head, two strokes */
    await expect
      .poll(async () => (await dashoffsets(page, "path.thread-swell"))["07"], {
        timeout: 8_000,
      })
      .toBeLessThan(0.05);
    await expect
      .poll(() => nodeFill(page, "07"), { timeout: 5_000 })
      .toBe("rgb(246, 239, 226)");
  });

  test("the nightfall dip is a static-world stroke — hidden under motion", async ({
    page,
  }) => {
    /* Segment 05 generates its dip whenever the folio rule measures,
       but the motion world flips ink page-wide at the 05→06 step
       instead — the cream tail must never double-print while the arc
       is live. */
    await expect(
      page.locator("svg[data-thread-segment='05'] path.thread-dip")
    ).toBeHidden();
  });

  test("quiet motion toggle completes the thread without the engine", async ({
    page,
  }) => {
    const toggle = page
      .locator("header")
      .getByRole("button", { name: /motion/ });
    test.skip(!(await toggle.isVisible()), "toggle is sm+ only");

    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-motion-off", "");

    /* A7: triggers retire; the static world is the finished run */
    await expect(page.locator("svg[data-thread-scrub]")).toHaveCount(0);
    await expect
      .poll(async () => {
        const offsets = await dashoffsets(page);
        return Object.values(offsets).every((value) => value <= 0.01);
      })
      .toBe(true);
    expect(await nodeFill(page, "04")).toBe("rgb(196, 83, 46)");
    expect(await nodeFill(page, "07")).toBe("rgb(246, 239, 226)");
  });
});

test.describe("red thread — reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await waitForThread(page);
  });

  test("the static world shows a finished run — zero thread scrubs", async ({
    page,
  }) => {
    /* A7: the engine never mounts and no thread trigger ever exists */
    await expect(page.locator("html")).not.toHaveClass(/\blenis\b/);
    await expect(page.locator("svg[data-thread-scrub]")).toHaveCount(0);

    const offsets = await dashoffsets(page);
    expect(Object.keys(offsets)).toHaveLength(7);
    for (const [id, value] of Object.entries(offsets)) {
      expect(value, `segment ${id} drawn`).toBeLessThanOrEqual(0.01);
    }
    const swellOffsets = await dashoffsets(page, "path.thread-swell");
    expect(Object.keys(swellOffsets)).toHaveLength(7);
    for (const [id, value] of Object.entries(swellOffsets)) {
      expect(value, `segment ${id} swell drawn`).toBeLessThanOrEqual(0.01);
    }

    /* Every node filled, in its own ink: day ink, clay gate, dusk ink */
    const NODE_FILLS: Record<string, string> = {
      "01": "rgb(38, 35, 28)",
      "02": "rgb(38, 35, 28)",
      "03": "rgb(38, 35, 28)",
      "04": "rgb(196, 83, 46)",
      "05": "rgb(38, 35, 28)",
      "06": "rgb(246, 239, 226)",
      "07": "rgb(246, 239, 226)",
    };
    for (const [id, expected] of Object.entries(NODE_FILLS)) {
      expect(await nodeFill(page, id), `node ${id}`).toBe(expected);
    }

    /* Deep scroll changes nothing — there is nothing listening */
    await scrollToId(page, "gate");
    await page.waitForTimeout(500);
    const after = await dashoffsets(page);
    for (const value of Object.values(after)) {
      expect(value).toBeLessThanOrEqual(0.01);
    }
    await expect(page.locator("svg[data-thread-scrub]")).toHaveCount(0);

    await noHorizontalOverflow(page);
  });

  test("the pen dips through nightfall exactly at the 05|06 terminator", async ({
    page,
  }) => {
    /* The one authored seam: segment 05's tail below its folio rule is
       re-inked in dusk cream, visible only in the static worlds */
    const dip = page.locator("svg[data-thread-segment='05'] path.thread-dip");
    await expect(dip).toBeVisible();
    await expect(dip).toHaveCSS("stroke", "rgb(246, 239, 226)");

    /* The dip begins AT the terminator rule (the folio-05 divider),
       within the seam's own hairline tolerance */
    const alignment = await page.evaluate(() => {
      const svg = document.querySelector("svg[data-thread-segment='05']");
      const dipPath = svg?.querySelector<SVGPathElement>("path.thread-dip");
      const folio = document
        .querySelector("[data-chapter='05']")
        ?.querySelector("[data-folio-terminator]");
      if (!svg || !dipPath || !folio) return null;
      const svgBox = svg.getBoundingClientRect();
      const start = dipPath.getPointAtLength(0);
      const startY = svgBox.top + window.scrollY + start.y;
      const folioBox = folio.getBoundingClientRect();
      const seamY = folioBox.bottom + window.scrollY;
      return { drift: Math.abs(startY - seamY) };
    });
    expect(alignment).not.toBeNull();
    expect(alignment!.drift).toBeLessThanOrEqual(3);
  });
});
