import { test, expect, type Page } from "@playwright/test";

/**
 * Red Thread contract on the homepage — ROUND 12 REWRITE (the rail).
 *
 * WHY THIS SPEC CHANGED, ON THE RECORD: through round 11 the motion
 * world's thread was seven per-chapter SVG segments welded at their
 * seams, and this spec's centrepiece asserted the weld (dx ≤ 2,
 * dy ≤ 14 at six seams) plus seven per-segment scrub triggers. Round
 * 12 rebuilt the thread as the prototype's architecture — ONE fixed
 * full-viewport canvas (ThreadRail) drawing one continuous line from
 * the nameplate's trailing flick to the blot on the approval stamp. A
 * continuous rail HAS no seams, so the weld assertion no longer
 * describes the site and holds nothing up. The new motion-world
 * contract it replaces the weld with:
 *
 *  1. Architecture — exactly one canvas: fixed, full-viewport,
 *     pointer-transparent, stacked under the text; ZERO thread SVG in
 *     the DOM (the segments retire to the static worlds).
 *  2. Continuity + reach — one unbroken sample run (max inter-sample
 *     gap bounded), starting at the hero name's flick and ending
 *     inside the gate stamp's boundary. No seams exist to weld.
 *  3. Scroll coupling, BOTH directions — the drawn length (the head,
 *     with the token riding it) advances with scroll and RETREATS on
 *     the way back to the same values: the owner's reversibility is
 *     the rail visibly retracting, and the head being a pure function
 *     of scroll is what guarantees it.
 *  4. The line never crosses text (same probe as before, now sampled
 *     from the rail's own geometry; the chapter-03 word underline
 *     stays the one sanctioned exception).
 *  5. The token halts at the gate: at full depth the head reaches the
 *     line's end on the stamp, ringed in clay (the awaiting mark).
 *  6. The stamp still names run no. 041 — the same run fig 4.1's
 *     registry shows awaiting approval.
 *
 * The rail publishes a read-only probe (`canvas.__rail`: sample run,
 * lengths, head accessor) exactly as the prototype published
 * `window.__world` — data out, never control in (the F74 line).
 *
 * The static worlds (reduced motion, quiet toggle) keep their OLD
 * contract untouched: seven finished SVG segments, every node filled,
 * the nightfall dip — amendment A7's settled page. Those describes
 * survive below with only additions (canvas absent).
 */

interface RailProbeSnapshot {
  built: number;
  pathLen: number;
  sampleCount: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  duskL: number;
  headL: number;
  samples: { x: number; y: number; L: number }[];
}

declare global {
  interface HTMLCanvasElement {
    __rail?: {
      built: number;
      pathLen: number;
      sampleCount: number;
      start: { x: number; y: number };
      end: { x: number; y: number };
      duskL: number;
      headL: () => number;
      samples: () => { x: number; y: number; L: number }[];
    };
  }
}

const SEGMENT_IDS = ["01", "02", "03", "04", "05", "06", "07"];

/** Wait for the rail canvas to exist and have built its geometry. */
async function waitForRail(page: Page) {
  await page.locator("[data-chapter='07']").waitFor({ state: "attached" });
  await page.evaluate(() => document.fonts.ready);
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const canvas = document.querySelector<HTMLCanvasElement>(
            "canvas[data-thread-rail]"
          );
          return canvas?.__rail?.sampleCount ?? 0;
        }),
      { timeout: 10_000 }
    )
    .toBeGreaterThan(200);
}

/** Read the rail probe (snapshot form — functions resolved). */
function railProbe(page: Page): Promise<RailProbeSnapshot | null> {
  return page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      "canvas[data-thread-rail]"
    );
    const rail = canvas?.__rail;
    if (!rail) return null;
    return {
      built: rail.built,
      pathLen: rail.pathLen,
      sampleCount: rail.sampleCount,
      start: rail.start,
      end: rail.end,
      duskL: rail.duskL,
      headL: rail.headL(),
      samples: rail.samples(),
    };
  });
}

/** The head length alone — cheap poll target. */
function railHead(page: Page): Promise<number> {
  return page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      "canvas[data-thread-rail]"
    );
    return canvas?.__rail?.headL() ?? -1;
  });
}

/** Static worlds: computed stroke-dashoffset per segment. */
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

/** Whether a segment's node is filled (static worlds). */
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

test.describe("red thread — the rail (motion world)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page
      .locator("header[data-lenis-connected='true']")
      .waitFor({ state: "attached", timeout: 5000 });
    await waitForRail(page);
  });

  test("one fixed full-viewport canvas replaces the seven welded segments", async ({
    page,
  }) => {
    /* Exactly one rail; the SVG world is retired here, not hidden */
    await expect(page.locator("canvas[data-thread-rail]")).toHaveCount(1);
    await expect(page.locator("svg[data-thread-segment]")).toHaveCount(0);
    await expect(page.locator("svg[data-thread-scrub]")).toHaveCount(0);

    const chrome = await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>(
        "canvas[data-thread-rail]"
      )!;
      const cs = getComputedStyle(canvas);
      return {
        position: cs.position,
        pointerEvents: cs.pointerEvents,
        zIndex: cs.zIndex,
        w: canvas.clientWidth,
        h: canvas.clientHeight,
        vw: document.documentElement.clientWidth,
        vh: document.documentElement.clientHeight,
        hidden: canvas.getAttribute("aria-hidden"),
      };
    });
    expect(chrome.position).toBe("fixed");
    expect(chrome.pointerEvents).toBe("none");
    /* Behind the text: same stacking level as the light field (0),
       ahead of it and behind every section purely by tree order */
    expect(chrome.zIndex).toBe("0");
    expect(chrome.hidden).toBe("true");
    expect(Math.abs(chrome.w - chrome.vw)).toBeLessThanOrEqual(1);
    expect(Math.abs(chrome.h - chrome.vh)).toBeLessThanOrEqual(1);

    /* …and it is absent from the paper edition (a ⌘P from the motion
       world must not stamp a live canvas over every printed page) */
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("canvas[data-thread-rail]")).toBeHidden();
    await page.emulateMedia({ media: "screen" });
  });

  test("the line is continuous from the nameplate to the gate — no seams", async ({
    page,
  }) => {
    const probe = (await railProbe(page))!;
    expect(probe).not.toBeNull();

    /* One unbroken run: consecutive samples never gap (the old spec
       welded six seams within ±2px; a single line has nothing to weld,
       so the assertion strengthens from "aligned" to "unbroken") */
    expect(probe.sampleCount).toBeGreaterThan(400);
    let maxGap = 0;
    for (let i = 1; i < probe.samples.length; i++) {
      const a = probe.samples[i - 1];
      const b = probe.samples[i];
      maxGap = Math.max(maxGap, Math.hypot(b.x - a.x, b.y - a.y));
    }
    expect(maxGap).toBeLessThanOrEqual(24);

    /* It starts as the hero name's trailing flick… */
    const name = await page.evaluate(() => {
      const el = document.querySelector("[data-thread-name]");
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        right: r.right + window.scrollX,
        bottom: r.bottom + window.scrollY,
      };
    });
    expect(name).not.toBeNull();
    expect(Math.abs(probe.start.x - (name!.right + 14))).toBeLessThanOrEqual(
      24
    );
    expect(probe.start.y).toBeGreaterThan(name!.bottom);
    expect(probe.start.y - name!.bottom).toBeLessThanOrEqual(40);

    /* …and ends ON the gate stamp (the blot on its boundary) */
    const stamp = await page.evaluate(() => {
      const el = Array.from(
        document.querySelectorAll("[data-thread-stamp]")
      ).find((s) => s.getBoundingClientRect().width > 0);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        l: r.left + window.scrollX,
        r: r.right + window.scrollX,
        t: r.top + window.scrollY,
        b: r.bottom + window.scrollY,
      };
    });
    expect(stamp).not.toBeNull();
    expect(probe.end.x).toBeGreaterThanOrEqual(stamp!.l - 8);
    expect(probe.end.x).toBeLessThanOrEqual(stamp!.r + 8);
    expect(probe.end.y).toBeGreaterThanOrEqual(stamp!.t - 8);
    expect(probe.end.y).toBeLessThanOrEqual(stamp!.b + 8);

    /* The line spans the whole run — longer than the document is tall,
       because the hand wanders */
    const docH = await page.evaluate(
      () => document.documentElement.scrollHeight
    );
    expect(probe.pathLen).toBeGreaterThan(docH * 0.8);
    /* The dusk flip exists and sits in the run's last third */
    expect(probe.duskL).toBeGreaterThan(probe.pathLen * 0.5);
    expect(probe.duskL).toBeLessThan(probe.pathLen);
  });

  test("the head tracks scroll — and RETREATS on the way back up", async ({
    page,
  }) => {
    /* The owner's reversibility: the rail retracting is the visible
       thing; head-as-pure-function-of-scroll is what guarantees the
       same frame at the same scroll from either direction. */
    const atTop = await railHead(page);

    await scrollToId(page, "automl");
    await expect
      .poll(() => railHead(page), { timeout: 8_000 })
      .toBeGreaterThan(atTop + 1000);
    const midDown = await railHead(page);

    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight)
    );
    await expect
      .poll(() => railHead(page), { timeout: 8_000 })
      .toBeGreaterThan(midDown + 1000);

    /* Back up: same stations, same head values — the ink un-draws */
    await scrollToId(page, "automl");
    await expect
      .poll(async () => Math.abs((await railHead(page)) - midDown), {
        timeout: 8_000,
      })
      .toBeLessThanOrEqual(2);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect
      .poll(async () => Math.abs((await railHead(page)) - atTop), {
        timeout: 8_000,
      })
      .toBeLessThanOrEqual(2);

    /* And the canvas genuinely paints: ink pixels exist on screen */
    const inked = await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>(
        "canvas[data-thread-rail]"
      )!;
      const ctx = canvas.getContext("2d")!;
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let count = 0;
      for (let i = 3; i < img.length; i += 4) if (img[i] > 30) count++;
      return count;
    });
    expect(inked).toBeGreaterThan(200);
  });

  test("the token halts at the gate in clay; stamp and registry share run 041", async ({
    page,
  }) => {
    /* Ride to the stamp: the head must reach the line's end (the
       endgame glide guarantees it before max scroll) */
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight)
    );
    const probe = await expect
      .poll(
        async () => {
          const p = await railProbe(page);
          return p ? p.pathLen - p.headL : Infinity;
        },
        { timeout: 8_000 }
      )
      .toBeLessThanOrEqual(2)
      .then(() => railProbe(page));
    const settled = (await probe)!;

    /* The halt ring: clay pixels around the token's resting point.
       Scroll so the blot is on screen while the head STAYS at the
       line's end — the head is a pure function of scroll, so the
       target must keep the reading line (0.62·vh, the real vh) at or
       past the blot: 40px past it, clamped to max scroll (where the
       endgame glide holds the halt anyway). */
    await page.evaluate((endY) => {
      const vh = document.documentElement.clientHeight;
      const maxScroll =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      window.scrollTo(
        0,
        Math.min(endY - Math.round(0.62 * vh) + 40, maxScroll)
      );
    }, settled.end.y);
    await page.waitForTimeout(300);
    const clay = await page.evaluate((end) => {
      const canvas = document.querySelector<HTMLCanvasElement>(
        "canvas[data-thread-rail]"
      )!;
      const ctx = canvas.getContext("2d")!;
      const dpr = canvas.width / canvas.clientWidth;
      const cx = Math.round(end.x * dpr);
      const cy = Math.round((end.y - window.scrollY) * dpr);
      const r = Math.round(16 * dpr);
      const img = ctx.getImageData(
        Math.max(0, cx - r),
        Math.max(0, cy - r),
        r * 2,
        r * 2
      ).data;
      let clayish = 0;
      for (let i = 0; i < img.length; i += 4) {
        if (img[i + 3] < 100) continue;
        const [R, G, B] = [img[i], img[i + 1], img[i + 2]];
        /* --color-clay-graphic #c4532e */
        if (Math.abs(R - 196) < 60 && Math.abs(G - 83) < 60 && R > G && G > B)
          clayish++;
      }
      return clayish;
    }, settled.end);
    expect(clay).toBeGreaterThan(8);

    /* Run-number discipline survives the rebuild: the stamp is the
       SAME run fig 4.1's registry shows awaiting its human. */
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

  test("no horizontal overflow; the rail never crosses text", async ({
    page,
  }) => {
    await noHorizontalOverflow(page);

    const probe = (await railProbe(page))!;
    const check = await page.evaluate((samples) => {
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
      const sx = window.scrollX;
      const sy = window.scrollY;
      const boxes: {
        sel: string;
        l: number;
        r: number;
        t: number;
        b: number;
        allowBelow: number;
      }[] = [];
      for (const sel of TEXT_SELECTORS) {
        for (const el of document.querySelectorAll(sel)) {
          const rect = el.getBoundingClientRect();
          if (rect.width < 2 || rect.height < 2) continue;
          /* The deck paragraph carrying [data-thread-word] is the
             underline's home: the line may pass BENEATH the word span
             (never above/through it) — the sanctioned exception. */
          const word = el.querySelector("[data-thread-word]");
          const allowBelow = word
            ? word.getBoundingClientRect().bottom + sy + 1
            : Number.POSITIVE_INFINITY;
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
      for (const p of samples) {
        for (const b of boxes) {
          if (p.x > b.l && p.x < b.r && p.y > b.t && p.y < b.b) {
            if (p.y > b.allowBelow) continue;
            violations.push(
              `rail @ (${Math.round(p.x)}, ${Math.round(p.y)}) inside ${b.sel}`
            );
          }
        }
      }
      return {
        textBoxes: boxes.length,
        violations: Array.from(new Set(violations)).slice(0, 8),
      };
    }, probe.samples);

    /* Guard against selector rot: the probe must actually see the page */
    expect(check.textBoxes).toBeGreaterThan(20);
    expect(check.violations).toEqual([]);
  });

  test("quiet motion toggle retires the rail; the settled SVG takes over", async ({
    page,
  }) => {
    const toggle = page
      .locator("header")
      .getByRole("button", { name: /motion/ });
    test.skip(!(await toggle.isVisible()), "toggle is sm+ only");

    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-motion-off", "");

    /* A7: the rail unmounts; the static world is the finished run */
    await expect(page.locator("canvas[data-thread-rail]")).toHaveCount(0);
    await expect(page.locator("svg[data-thread-segment]")).toHaveCount(7);
    await expect(page.locator("svg[data-thread-scrub]")).toHaveCount(0);
    await expect
      .poll(async () => {
        const offsets = await dashoffsets(page);
        return (
          Object.keys(offsets).length === 7 &&
          Object.values(offsets).every((value) => value <= 0.01)
        );
      })
      .toBe(true);
    expect(await nodeFill(page, "04")).toBe("rgb(196, 83, 46)");
    expect(await nodeFill(page, "07")).toBe("rgb(246, 239, 226)");

    /* …and toggling back re-mounts the rail (the worlds reverse too) */
    await toggle.click();
    await waitForRail(page);
    await expect(page.locator("svg[data-thread-segment]")).toHaveCount(0);
  });
});

test.describe("red thread — reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    /* The static world builds its segments; wait for real geometry */
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
  });

  test("the static world shows a finished run — no rail, no scrubs", async ({
    page,
  }) => {
    /* A7: the engine never mounts; the rail never exists */
    await expect(page.locator("header")).toHaveAttribute(
      "data-lenis-connected",
      "false"
    );
    await expect(page.locator("canvas[data-thread-rail]")).toHaveCount(0);
    await expect(page.locator("svg[data-thread-scrub]")).toHaveCount(0);

    for (const id of SEGMENT_IDS) {
      await expect(
        page.locator(`svg[data-thread-segment='${id}']`)
      ).toHaveCount(1);
    }
    /* The gate glyph: chapter 04's node is the clay square, not a dot */
    await expect(
      page.locator("svg[data-thread-segment='04'] rect.thread-node-gate")
    ).toHaveCount(1);

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

    /* The finale still blots ON the stamp in this world too — the
       settled line ends where the rail's does (one ruler, A7). */
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
      const stamp = Array.from(
        document.querySelectorAll("[data-thread-stamp]")
      ).find((el) => el.getBoundingClientRect().width > 0);
      if (!stamp) return { distance: Number.POSITIVE_INFINITY };
      const s = stamp.getBoundingClientRect();
      const dx = Math.max(s.left + sx - x, 0, x - (s.right + sx));
      const dy = Math.max(s.top + sy - y, 0, y - (s.bottom + sy));
      return { distance: Math.hypot(dx, dy) };
    });
    expect(terminus).not.toBeNull();
    expect(terminus?.distance).toBeLessThanOrEqual(8);

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
