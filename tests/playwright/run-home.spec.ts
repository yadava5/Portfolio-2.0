import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

/**
 * The home page, as it actually ships.
 *
 * `npm run build` is `node scripts/archive/build-archive.mjs`, whose last step
 * is build-home.mjs writing src/run/index.html over the output root's
 * index.html. So the home a visitor gets is the run — thirteen stations on one
 * hand-authored page. Until Phase 4 there was a second home page, rendered by
 * src/app/page.tsx, and this header used to have to say which one shipped.
 *
 * THIS FILE EXISTS BECAUSE THE SUITE ONCE TESTED THE OTHER ONE. Thirteen
 * assertions in atlas.spec.ts, four in reduced-motion.spec.ts and one in
 * performance-budget.spec.ts passed for months while addressing markers —
 * [data-chapter], [data-thread], [data-hero-standfirst], #arrival — that
 * appeared ZERO times in the deployed page. (The reason was misdiagnosed for a
 * while as "the e2e scripts skip build-home.mjs", and that was already false
 * when it was written; what actually differed was the basePath. Both stopped
 * mattering when the second home page was deleted.) Those thirteen came out of
 * atlas, and this file is their replacement, written against the run's own
 * information architecture.
 *
 * The run's IA, for anyone re-pointing another spec:
 *
 *   station      section.beat[data-beat="0".."12"]   (was [data-chapter])
 *   its dateline .kicker, "¶ 01 · the start · 06:12"
 *   deep links   #review #cosigners #gate #nextmorning
 *   the line     canvas#thread                        (was [data-thread])
 */

/**
 * G7 · 320, 1280 and 1512 joined the list on 2026-09-23.
 *
 * 320 is the narrowest width the run claims to support and was never checked
 * here; 1280 and 1512 are the two desktop seats the clarity harness measures
 * at, and a gate that watches 1440 alone cannot see a rule that breaks either
 * side of it. See also `measure-above-the-breakpoint`: a media query only ever
 * proves the width it moved away from.
 */
const HOME_WIDTHS = [320, 390, 768, 1280, 1440, 1512] as const;

/**
 * G7's probe, run in the page: every visible box whose right edge is past the
 * viewport's. Shared by the six width tests and their injection control, so
 * the control cannot pass against a different implementation than the gate.
 */
const RIGHT_EDGE_PROBE = () => {
  const effOpacity = (el: Element): number => {
    let o = 1;
    let n: Element | null = el;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if (cs.display === "none" || cs.visibility === "hidden") return 0;
      const v = parseFloat(cs.opacity);
      if (!Number.isNaN(v)) o *= v;
      n = n.parentElement;
    }
    return o;
  };
  const sel = (el: Element): string => {
    const parts: string[] = [];
    let n: Element | null = el;
    while (n && n.nodeType === 1 && parts.length < 4) {
      let p = n.tagName.toLowerCase();
      if (n.id) {
        parts.unshift("#" + n.id);
        break;
      }
      if (n.classList.length) p += "." + [...n.classList].join(".");
      parts.unshift(p);
      n = n.parentElement;
    }
    return parts.join(">");
  };
  const vw = document.documentElement.clientWidth;
  const out: string[] = [];
  let seen = 0;
  for (const el of document.querySelectorAll("body *")) {
    const tag = el.tagName.toLowerCase();
    if (tag === "script" || tag === "style" || tag === "template") continue;
    /* the page's own declaration that a box is scenery: inside aria-hidden,
       carrying no text, and not something a reader can operate */
    if (
      el.closest('[aria-hidden="true"]') &&
      !(el.textContent ?? "").trim() &&
      !el.matches("a,button,input,select,textarea,[role=button],[tabindex]")
    )
      continue;
    if (effOpacity(el) <= 0.05) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    seen++;
    /* 0.5px: sub-pixel layout rounds, and half a pixel is not a clipped
       control. */
    if (r.right <= vw + 0.5) continue;
    out.push(
      `${sel(el)} — right edge ${Math.round(r.right)} of ${vw} (+${Math.round(r.right - vw)})`
    );
  }
  return { over: [...new Set(out)], seen };
};

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
    expect(kickers[0]).toMatch(/^¶ 01 · the start · 06:12$/);
    expect(kickers[11]).toMatch(/^¶ 12 · the approval gate · 22:41$/);

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

    /**
     * G7 · and nothing may run off the right edge, scrollbar or no scrollbar.
     *
     * `scrollWidth - clientWidth` is a document-level question with a blind
     * spot the size of the defect it is meant to catch: a box that overhangs
     * the viewport INSIDE an `overflow:hidden` ancestor adds nothing to
     * scrollWidth, because the ancestor clips it. The document measures clean
     * and the reader loses the right-hand part of a control. So this asks the
     * reader's question instead — is any visible box's right edge past the
     * viewport's? — and clipped counts.
     *
     * REDUCED MOTION, and that is what makes one pass enough. The run fades
     * and drifts each station in on scroll, so at any given scroll stop only
     * ~90 of its ~1,030 boxes are lit, and the ones mid-transition carry a
     * horizontal drift that is not their settled geometry: measured at 1280,
     * nine boxes sat past the right edge at effective opacity 0.00–0.04, all
     * of them simply part-way through their entrance. `settleAll()` puts the
     * scrub at p = 1 without scrolling, which lights ~899 boxes at the
     * geometry they actually come to rest at. `body.settled` is asserted so
     * the test cannot pass by measuring a frame the page never settled into.
     *
     * The `#field` decorations are out of scope BY THE PAGE'S OWN
     * DECLARATION, not by name: `#sun` crosses the sky and leaves the frame
     * by 150–220px at phone widths, on purpose. The rule that excludes it is
     * "inside aria-hidden, carrying no text, and not interactive" — so a
     * clipped LABEL inside an aria-hidden figure, or a clipped BUTTON
     * anywhere, is still caught.
     *
     * NOTE ON PROVENANCE. This was written to catch `#clear` at 320, which
     * the phase inventory records as clipped. It does not reproduce: on the
     * pre-redesign build (out-original-index.html, b6ea15df) `#clear` sits at
     * 274..312 in a 320 viewport at both settled and scrolled, and nothing on
     * that page except `#sun` crosses the right edge at any of these six
     * widths. So this check is proven by the injection below rather than by
     * the old build, and `#clear`'s real defect at 320 is its 38×18 hit box,
     * which is G9's.
     */
    test(`no element runs past the right edge at ${w}`, async ({ page }) => {
      /* before the navigation: the context-level option does not reach the
         page here — see the fig. 05 note below, same reason. */
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/");
      await expect(page.locator("body")).toHaveClass(/\bsettled\b/);
      /* past the nameplate's performance: it is the one thing on the page
         whose width is measured and re-drawn after load */
      await page.waitForTimeout(4200);

      const { over, seen } = await page.evaluate(RIGHT_EDGE_PROBE);

      /* A sweep that saw nothing prints the same green as a clean page. */
      expect(seen, `boxes were measured at ${w}`).toBeGreaterThan(400);
      expect(
        over,
        `${w}px: these boxes extend past the right edge. An ancestor with ` +
          `overflow:hidden makes this invisible to the scrollWidth check above, ` +
          `and the reader still loses the right-hand part of the control.`
      ).toEqual([]);
    });
  }

  /**
   * THE CONTROL for the check above. Empty is the right answer at all six
   * widths on this build and on the pre-redesign one, which means "clean" and
   * "the probe read nothing" print the same green. Widening one real control
   * past the frame is the only thing that tells them apart.
   */
  test("positive control: a control pushed past the right edge is caught", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/");
    await expect(page.locator("body")).toHaveClass(/\bsettled\b/);
    await page.waitForTimeout(1200);
    await page.addStyleTag({
      content:
        "#mast{position:relative !important; left:0 !important; width:600px !important; max-width:none !important}",
    });
    await page.waitForTimeout(300);
    const { over } = await page.evaluate(RIGHT_EDGE_PROBE);
    expect(
      over.join(" | "),
      "a 600px masthead in a 320px viewport was not seen — the probe is broken, not the page"
    ).toContain("#mast");
  });

  /**
   * fig 06's classifier is REAL — and nothing checked that it arrives.
   *
   * The Glyph station imports ./wasm/fast_mnist.js, instantiates it, and
   * fetches wasm/model.weights.bin (src/run/index.html:3555-3557). None of
   * those three files is named in any way the golden hash of out/index.html
   * can see, because the run fetches them at runtime by relative path. So
   * deleting src/run/wasm/ used to reproduce the hash byte-for-byte, pass
   * every gate green, and 404 the classifier in production — and `grep -rl
   * wasm tests/` returned nothing, so no browser check would have caught it
   * either. build-home.mjs now fails when the sources are missing and
   * verify:portfolio asserts they landed in out/; this is the third leg, and
   * the only one that proves the bytes actually INSTANTIATE rather than
   * merely being present at the right size.
   *
   * The status line is the run's own report, not a probe added for the test:
   * "awake · local" on success, "serve over http to run" when the module or
   * the weights fail to load (:3565-3568). Asserting the failure string is
   * absent as well as the success string present is deliberate — a stuck
   * "waking…" and a loud failure are different defects.
   */
  test("the Glyph station's classifier instantiates from its own wasm", async ({
    page,
  }) => {
    const failed: string[] = [];
    page.on("requestfailed", (r) => {
      if (/wasm/.test(r.url())) failed.push(r.url());
    });
    page.on("response", (r) => {
      if (/wasm/.test(r.url()) && !r.ok())
        failed.push(`${r.status()} ${r.url()}`);
    });

    await page.goto("/");
    await expect(page.locator("#glyphStatus")).toHaveText("awake · local", {
      timeout: 15_000,
    });
    expect(failed, "no wasm asset may 404 or fail to load").toEqual([]);
  });

  /**
   * The four bench bars, MEASURED — the one assertion in this phase that no
   * source-level gate can make.
   *
   * Phase 5 settled the bars and put their ratios in the markup as fractions:
   * `transform:scaleX(calc(1 / 3.5))` and `calc(66 / 422)`, so the browser
   * does the division and `check-bench-artifacts.mjs` can match numerator
   * against denominator against the vendored records with no float parsing.
   * The failure mode that buys is exactly why this test exists: AN INVALID
   * TRANSFORM IS DROPPED AND THE ELEMENT RENDERS AT scaleX(1). A 1× lane
   * drawn at the full width of a 3.5× one is the overclaim this whole phase
   * is about, and every string-matching gate in the repository would call it
   * correct. So the ratio is read off `getBoundingClientRect`, in a real
   * engine, across all five browser projects.
   *
   * It also pins the settling: C28's injection inflated these ratios by ~1.9×
   * and ~2.1× with two gates green. The bars used to be filled by a scroll
   * scrub, so a measurement like this would have been reading whatever frame
   * the scrub happened to be on.
   */
  test("the bench bars are drawn at the ratio their records report", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
    await page.waitForTimeout(600);

    const bars = await page.$$eval(".bench .btrack", (tracks) =>
      tracks.map((t) => {
        const fill = t.querySelector(".bfill") as HTMLElement;
        const row = t.closest(".brow") as HTMLElement;
        return {
          lane: (row.firstElementChild as HTMLElement).textContent!.trim(),
          track: t.getBoundingClientRect().width,
          fill: fill.getBoundingClientRect().width,
        };
      })
    );
    expect(bars, "four bars: two benches, two lanes each").toHaveLength(4);
    for (const b of bars)
      expect(
        b.track,
        `${b.lane}: the track has no width to measure`
      ).toBeGreaterThan(20);

    /* Order is DOM order: Glyph's 1× then 3.5×, jetpack's 66 then 422. The
       expected values are the fractions the markup states, which
       check-bench-artifacts holds to the vendored JMH and Google Benchmark
       records — so this test measures the drawing and that one measures the
       claim. */
    const expected = [1 / 3.5, 1, 66 / 422, 1];
    const labels = [
      "Glyph one thread, -O3",
      "Glyph openmp, all cores",
      "jetpack java.util.zip, 1 thread",
      "jetpack virtual threads",
    ];
    bars.forEach((b, i) => {
      expect(
        b.fill / b.track,
        `${labels[i]} is drawn at the wrong fraction of its track`
      ).toBeCloseTo(expected[i], 3);
    });
  });

  /**
   * fig. 05's chip stops covering wednesday, and the check is geometric.
   *
   * Until 2026-08-06 the three chips flew to `rel(slotWhen) ± {-26, +4, +32}`
   * — measured pixel offsets over the week grid — and a chip is wider than a
   * 1/7 column at every width this page ships at. So the settled stack
   * printed across wednesday and thursday, which FIGURES.md diagnoses as the
   * archetype of its rule 4: anchor annotations to cells, not coordinates.
   *
   * The tuesday cell now IS the event and lights in place, and the chips are
   * filed into a dock below the grid — a box the layout owns. This asserts
   * the property rather than the mechanism: NO SETTLED CHIP MAY OVERLAP ANY
   * DAY COLUMN. A chip in FLIGHT crosses the grid on its way down and that is
   * the figure's argument, not a defect; what was wrong was where it landed.
   *
   * Reduced motion because settleAll() puts the scrub at p = 1 without
   * scrolling, so this measures the final geometry at every width instead of
   * whatever frame a scroll happened to stop on.
   */
  test.describe("fig. 05 settled", () => {
    for (const w of [320, 390, 768, 1440]) {
      test(`the parse files beside the week, not over it, at ${w}`, async ({
        page,
      }) => {
        /* `page.emulateMedia` before the navigation, not `test.use`: the
           context-level option did not reach the page here and `body` arrived
           carrying only `no-gl`, so the settled class never appeared and this
           test failed on its own harness rather than on the figure.
           reduced-motion.spec.ts does it this way for the same reason. */
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.setViewportSize({ width: w, height: 900 });
        await page.goto("/");
        await expect(page.locator("body")).toHaveClass(/\bsettled\b/);
        await page.waitForTimeout(300);

        const r = await page.evaluate(() => {
          const cols = [...document.querySelectorAll("#cadWeek .hd span")].map(
            (e) => ({
              day: (e.textContent ?? "").trim(),
              box: e.getBoundingClientRect(),
            })
          );
          const grid = document
            .querySelector("#cadWeek .grid")!
            .getBoundingClientRect();
          const covered: string[] = [];
          let visible = 0;
          for (const id of ["chWho", "chWhen", "chMeet"]) {
            const el = document.getElementById(id)!;
            const b = el.getBoundingClientRect();
            if (Number(getComputedStyle(el).opacity) < 0.05) continue;
            visible++;
            if (b.top > grid.bottom - 1 || b.bottom < grid.top + 1) continue;
            for (const c of cols)
              if (b.left < c.box.right - 1 && b.right > c.box.left + 1)
                covered.push(c.day);
          }
          const slot = document.getElementById("slotWhen")!;
          return {
            covered: [...new Set(covered)],
            visible,
            days: cols.length,
            slotLit: slot.classList.contains("on"),
            slotText: (slot.textContent ?? "").trim(),
          };
        });

        expect(r.days, "the week grid still has seven day columns").toBe(7);
        expect(r.visible, "all three chips are settled and visible").toBe(3);
        expect(
          r.covered,
          `settled chips overlap ${r.covered.join(", ")} — a chip is wider than a 1/7 column, ` +
            `so anything anchored to a coordinate over this grid covers a neighbour`
        ).toEqual([]);
        /* The event is IN tuesday, which is the half a coordinate could never
           give: the cell cannot leave its own column. */
        expect(r.slotLit, "the tuesday cell is lit").toBe(true);
        expect(r.slotText).toBe("12:00");
      });
    }
  });

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

/**
 * The tab mark: the page in a 16px window, sewn on its own clock.
 *
 * public/favicon.svg is not authored. It is `markSvg({...arcColor(0, 0),
 * phase: 0})`, the page's own drawing at dawn with the thread at rest,
 * written out by render-favicons.mjs; and that file's 48 px ICO sibling is
 * what Google shows beside the owner's name, so the still IS the brand.
 * The live layer swaps the icon's href to the same function's output: the
 * seam is pulled one step every half second on the wall clock, and the
 * field follows the reader. Four things can rot quietly and are pinned
 * here: the still can drift from the function (a bookmark showing
 * yesterday's mark while the tab shows today's, and the first swap after
 * load visibly jumping); the ticker can stop (the owner's ruling is that
 * the icon is alive on its own, not only on scroll); the live layer can
 * stop following the page into the night; and under reduced motion the
 * icon's one promise is to stand still.
 *
 * WebKit is skipped for the live cases by design, not by accident: Safari
 * takes no SVG icon and is reported to ignore href swaps, so the page does
 * not attempt them there and keeps the ICO.
 */
test.describe("the tab mark is the page in a 16px window", () => {
  const drawingOf = (file: string) =>
    file
      .replace(/^\s*<\?xml[^>]*>\s*/, "")
      .replace(/^\s*<!--[\s\S]*?-->\s*/, "")
      .trim();
  type Mark = {
    live: boolean;
    swaps: number;
    key: string;
    svg: string;
    phase: number;
    rate: number;
  };
  const readMark = (page: import("@playwright/test").Page) =>
    page.evaluate(() => {
      const w = window as unknown as {
        __world: { beat: number; night: boolean; mark: Mark };
      };
      return {
        href: document
          .querySelector('link[rel="icon"][type="image/svg+xml"]')!
          .getAttribute("href"),
        beat: w.__world.beat,
        night: w.__world.night,
        ...w.__world.mark,
      };
    });
  const dataUri = (svg: string) =>
    "data:image/svg+xml," + encodeURIComponent(svg);

  test("the still is the page's own drawing at dawn, thread at rest", async ({
    page,
  }) => {
    await page.goto("/");
    const still: string = await page.evaluate(() =>
      (window as unknown as { __mark: { still: () => string } }).__mark.still()
    );
    expect(still.startsWith("<svg")).toBe(true);
    expect(still).toContain("stroke-dashoffset");
    expect(drawingOf(readFileSync("public/favicon.svg", "utf8"))).toBe(
      still.trim()
    );
  });

  test("it sews on its own, two steps a second, and the tab carries exactly the engine's frame", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "Safari takes no SVG icon; the live layer is off there by design"
    );
    await page.goto("/");
    await page.waitForTimeout(1300);
    const a = await readMark(page);
    expect(a.live).toBe(true);
    expect(a.beat).toBe(0);
    expect(a.rate).toBe(500);
    /* nothing scrolled, and the seam still moved: at least two swaps in
       the first 1.3 s, each carrying the engine's own last drawing */
    expect(a.swaps).toBeGreaterThanOrEqual(2);
    expect(a.href).toBe(dataUri(a.svg));
    await page.waitForTimeout(1100);
    const b = await readMark(page);
    expect(b.swaps).toBeGreaterThan(a.swaps);
    expect(b.phase).not.toBe(a.phase);
    expect(b.href).toBe(dataUri(b.svg));
    expect(b.svg).toContain("stroke-dashoffset");
  });

  test("it follows the reader into the night", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "no live layer in WebKit");
    await page.goto("/");
    await page.waitForTimeout(600);
    const top = await readMark(page);
    expect(top.beat).toBe(0);
    expect(top.night).toBe(false);
    await page.evaluate(() =>
      document.getElementById("automl")!.scrollIntoView()
    );
    await expect.poll(async () => (await readMark(page)).night).toBe(true);
    await page.waitForTimeout(600);
    const night = await readMark(page);
    expect(night.swaps).toBeGreaterThan(top.swaps);
    expect(night.key.startsWith("n")).toBe(true);
    expect(night.href).toBe(dataUri(night.svg));
  });

  test("under reduced motion the icon stands still", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "no live layer in WebKit");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() =>
      document.getElementById("automl")!.scrollIntoView()
    );
    await page.waitForTimeout(1500);
    const m = await readMark(page);
    expect(m.live).toBe(false);
    expect(m.swaps).toBe(0);
    expect(m.href).toMatch(/\/favicon\.svg$/);
  });
});

/* THE TYPE ANSWERS THE HAND (v4, 2026-10-08). The owner asked for type that
   answers the pointer ("not just get bold ... swish ... motion ... blurry ...
   bubbly"), his name above all, once its opening performance has settled.
   What can go wrong is not taste, it is the four ways a hover effect rots a
   page like this one, and each test is one of them: it moves nothing (dead
   code: the hover answers that shipped before this were exactly that), it
   never comes back exactly to rest (an idle page that keeps painting, or a
   name left a pixel off its machines), it answers a cursor that is not
   moving (a page scrolled under a parked pointer), or it leaves copies of the
   text behind (find-in-page and the accessibility tree see the word twice). */
test.describe("the type answers the hand, and comes back to rest", () => {
  type Name = {
    live: boolean;
    driven: number;
    presses: number;
    peak: number;
    rest: boolean;
    fired: Record<string, number>;
    answering: number;
  };
  type W = {
    __world: {
      name?: () => Name | null;
      hand: () => number;
      inkLive: () => number;
      rollLive: () => number;
    };
    __rafN: number;
  };
  const name = (page: import("@playwright/test").Page) =>
    page.evaluate(() => (window as unknown as W).__world.name?.() ?? null);
  const counting = async (page: import("@playwright/test").Page) => {
    await page.addInitScript(() => {
      const raf = window.requestAnimationFrame.bind(window);
      (window as unknown as W).__rafN = 0;
      window.requestAnimationFrame = (cb) => {
        (window as unknown as W).__rafN++;
        return raf(cb);
      };
    });
  };
  const box = (page: import("@playwright/test").Page, sel: string) =>
    page.evaluate((s) => {
      const r = document.querySelector(s)!.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    }, sel);
  /* a real hand: many small moves, fast, through the x-height band, placed
     by the CLOCK and not by a count. A machine answers only a crest moving
     faster than 7.69 em/s, and 40 moves with no delay is a step count whose
     speed is whatever the engine spends per move: measured, Playwright's
     WebKit takes ~16.6 ms a move to Chromium's 8.3, so the same sweep ran at
     8.46 em/s there and 17 in Chromium, about a millisecond a move from
     failing. Placed by elapsed time, every engine sweeps at one speed. */
  const sweep = async (
    page: import("@playwright/test").Page,
    b: { x: number; y: number; w: number; h: number },
    ms = 450
  ) => {
    const y = b.y + b.h * 0.55;
    await page.mouse.move(b.x - 60, y);
    const t0 = Date.now();
    for (let u = 0; u < 1; ) {
      u = Math.min(1, (Date.now() - t0) / ms);
      await page.mouse.move(b.x - 60 + (b.w + 120) * u, y);
    }
  };

  test("a swoosh across the name moves it and wakes its machines, then nothing is left", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "a phone has no hover; the press is tested below");
    await counting(page);
    await page.goto("/");
    await page.waitForSelector("html[data-np-ready]", { timeout: 45000 });
    await page.waitForTimeout(500);
    const before = await box(page, "h1.nameplate");
    const styles = await page.evaluate(() =>
      [...document.querySelectorAll("h1.nameplate .np-ch")].map(
        (l) =>
          getComputedStyle(l).fontVariationSettings +
          "|" +
          getComputedStyle(l).translate +
          "|" +
          getComputedStyle(l).rotate
      )
    );
    await sweep(page, before);
    const mid = await name(page);
    expect(mid?.live).toBe(true);
    /* it moved: the bead chain lifted by a visible fraction of an em */
    expect(mid!.peak).toBeGreaterThan(0.02);
    /* and the machines that built the letters answered the crest */
    expect(
      Object.values(mid!.fired).reduce((a, b) => a + b, 0)
    ).toBeGreaterThan(0);
    await page.mouse.move(before.x + before.w + 300, before.y + 400);
    await expect
      .poll(
        () => page.evaluate(() => (window as unknown as W).__world.hand()),
        {
          timeout: 5000,
        }
      )
      .toBe(0);
    const after = await name(page);
    expect(after!.rest).toBe(true);
    expect(after!.answering).toBe(0);
    await expect(page.locator(".np-plate .np-ans")).toHaveCount(0);
    /* every letter is exactly where and what it was, and the box never moved */
    expect(
      await page.evaluate(() =>
        [...document.querySelectorAll("h1.nameplate .np-ch")].map(
          (l) =>
            getComputedStyle(l).fontVariationSettings +
            "|" +
            getComputedStyle(l).translate +
            "|" +
            getComputedStyle(l).rotate
        )
      )
    ).toEqual(styles);
    const end = await box(page, "h1.nameplate");
    expect(Math.abs(end.x - before.x)).toBeLessThan(0.1);
    expect(Math.abs(end.w - before.w)).toBeLessThan(0.1);
    /* and an idle page schedules nothing: the engine runs its twelve still
       frames after the last stepper goes (by design, measured: twelve calls,
       all from frame()), then stops, and nothing is scheduled after that */
    const rafN = () => page.evaluate(() => (window as unknown as W).__rafN);
    await expect
      .poll(
        async () => {
          const a = await rafN();
          await page.waitForTimeout(350);
          return (await rafN()) - a;
        },
        { timeout: 5000 }
      )
      .toBe(0);
    const r0 = await rafN();
    await page.waitForTimeout(1000);
    expect(await rafN()).toBe(r0);
  });

  test("a pointer parked on the name, and the page scrolled under it, move nothing", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "no pointer to park on a phone");
    await page.goto("/");
    await page.waitForSelector("html[data-np-ready]", { timeout: 45000 });
    await page.waitForTimeout(500);
    const b = await box(page, "h1.nameplate");
    await page.mouse.move(b.x + b.w * 0.4, b.y + b.h * 0.55);
    await expect
      .poll(
        () => page.evaluate(() => (window as unknown as W).__world.hand()),
        {
          timeout: 5000,
        }
      )
      .toBe(0);
    const parked = await name(page);
    /* a scroll under the parked pointer, and the zero-movement moves a
       browser sends while it does (WebKit sends them for real; headless
       engines send none on their own, so they are replayed here, during the
       scroll and after it, at the same point) */
    const px = b.x + b.w * 0.4,
      py = b.y + b.h * 0.55;
    await page.mouse.wheel(0, 360);
    await page.mouse.move(px, py);
    await page.waitForTimeout(400);
    await page.mouse.move(px, py);
    await page.mouse.wheel(0, -360);
    await page.mouse.move(px, py);
    await page.waitForTimeout(900);
    await page.mouse.move(px, py);
    await page.waitForTimeout(300);
    const scrolled = await name(page);
    expect(scrolled!.driven).toBe(parked!.driven);
    expect(scrolled!.peak).toBe(parked!.peak);
    expect(scrolled!.rest).toBe(true);
  });

  test("a tap on a phone presses the name, and it comes back to rest", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "the desktop's hand is tested above");
    await page.goto("/");
    await page.waitForSelector("html[data-np-ready]", { timeout: 45000 });
    await page.waitForTimeout(500);
    await page.locator("h1.nameplate .np-ch").nth(3).tap();
    await expect
      .poll(async () => (await name(page))?.presses ?? 0)
      .toBeGreaterThan(0);
    await expect
      .poll(
        () => page.evaluate(() => (window as unknown as W).__world.hand()),
        {
          timeout: 5000,
        }
      )
      .toBe(0);
    expect((await name(page))!.rest).toBe(true);
  });

  test("a heading soaks under the hand and is only its own text again after", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "headings answer a hover, and a phone has none");
    await page.goto("/");
    await page.waitForSelector("html[data-np-ready]", { timeout: 45000 });
    await page.evaluate(() =>
      document.querySelector("#glyph h2")!.scrollIntoView({ block: "center" })
    );
    await page.waitForTimeout(1200);
    const html0 = await page.locator("#glyph h2").innerHTML();
    const b = await box(page, "#glyph h2");
    await page.mouse.move(b.x - 40, b.y + b.h / 2);
    await page.mouse.move(b.x + 10, b.y + b.h / 2, { steps: 4 });
    await expect
      .poll(() =>
        page.evaluate(() => (window as unknown as W).__world.inkLive())
      )
      .toBeGreaterThan(0);
    await page.mouse.move(b.x + b.w + 200, b.y + 300, { steps: 4 });
    await expect
      .poll(
        () => page.evaluate(() => (window as unknown as W).__world.inkLive()),
        {
          timeout: 4000,
        }
      )
      .toBe(0);
    expect(await page.locator("#glyph h2").innerHTML()).toBe(html0);
    await expect(page.locator(".ink-l")).toHaveCount(0);
    const e = await box(page, "#glyph h2");
    expect(Math.abs(e.x - b.x) + Math.abs(e.w - b.w)).toBeLessThan(0.5);
  });

  test("a link rolls, keeps its name while it does, and is its own markup after", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "links roll on a hover, and a phone has none");
    await page.goto("/");
    await page.waitForSelector("html[data-np-ready]", { timeout: 45000 });
    const link = page.locator("#glyph .handoff a").first();
    await link.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    const html0 = await link.evaluate((a) => a.outerHTML);
    const label = (await link.textContent())!.trim();
    const b = await link.boundingBox();
    await page.mouse.move(b!.x - 30, b!.y + b!.height / 2);
    await page.mouse.move(b!.x + 8, b!.y + b!.height / 2, { steps: 4 });
    await expect
      .poll(() =>
        page.evaluate(() => (window as unknown as W).__world.rollLive())
      )
      .toBeGreaterThan(0);
    /* mid-roll the link is still one link with its own name */
    await expect(
      page.getByRole("link", { name: label, exact: true }).first()
    ).toBeVisible();
    await page.mouse.move(b!.x + 400, b!.y + 300, { steps: 4 });
    await expect
      .poll(
        () => page.evaluate(() => (window as unknown as W).__world.rollLive()),
        {
          timeout: 4000,
        }
      )
      .toBe(0);
    expect(await link.evaluate((a) => a.outerHTML)).toBe(html0);
  });
});

/* THE FIGURES ASSEMBLE WITH THE SCROLL (v6, 2026-10-09). The owner: "make
   sure to make them work with scrolling, not like single play, they should
   assemble with rail scroll!" — and of the scroll-pure round before it, "if
   someone scrolls fast, they'll miss it". So each assembled figure is held
   to both: its drawing at rest is a function of the scroll alone (the same y
   gives the same drawing, coming down and going back up), a centred park is
   the finished drawing, a flick that stops at the figure still shows it
   assembling, a slow scroll drives it both ways, and once it lands nothing
   runs. The driver's probes are __world.asm[key] = { t, s, v, yA, yB, g } and
   __world.asmRest().
   v7 (2026-10-14), the owner again: "by the time we get and can see the fig,
   it is already done with half the animation ... doesn't miss more than
   20-30%". The window now opens at 80% of the drawing on screen and closes at
   its centre on 0.45 of the screen, and a reader who pauses with a figure in
   view below that line is shown the rest by the same hand (the grace), after
   which the figure's window is closed where they paused (g): scrolling on
   holds it, scrolling back takes it apart over the shortened window. The
   scroll alone does at least 0.4 of the work at a centred park, a stop at
   the fold is not a park, and nothing graces while the reader scrolls. */
test.describe("the figures assemble with the scroll", () => {
  const FIGS = [
    ["fig04", "appliedFig"],
    ["fig06", "net"],
    ["fig07", "jetFig"],
    ["fig08", "questFig"],
    ["fig09", "amlFig"],
    ["fig10", "gatesFig"],
    ["fig11", "signsFig"],
  ] as const;
  /* TWO CLOCKS. fig. 10's verdicts and fig. 11's blade ride the rail's bead
     (a pure function of scroll the driver does not own), so at a later y the
     plate is a different picture by design; what the later-scroll equality
     guards for the driver is only that the assembly stays finished. */
  const BEAD = new Set<string>(["fig10", "fig11"]);
  /* THE FLOOR IS THE ENVELOPE, NOT SLACK. A centred park (the drawing's
     middle at 0.5 vh) sits 0.05 vh short of the end line at ASM_END 0.45,
     so its pure p is 1 - 0.05 vh / window. Measured on this build at the
     five project seats (1440x900 on three engines, Pixel 5, iPhone 14):
     .816 (fig10, iPhone 14) to .886, fig08 1 (its window ends earlier). With
     the end line moved to 0.20 vh the same parks read .53 to .56, which a
     floor of 0.4 let through (labrat, v7). 0.7 refuses that move by .14
     and keeps .11 under the shortest real park. */
  const PARK_FLOOR = 0.7;
  type A = {
    t: number;
    s: number;
    v: number;
    yA: number;
    yB: number;
    g: number | null;
  };
  type W = { __world: { asm: Record<string, A>; asmRest: () => boolean } };
  const frames = (page: import("@playwright/test").Page, n = 2) =>
    page.evaluate(
      (k) =>
        new Promise<void>((done) => {
          const step = (i: number) =>
            i ? requestAnimationFrame(() => step(i - 1)) : done();
          step(k);
        }),
      n
    );
  const rest = (page: import("@playwright/test").Page) =>
    page.waitForFunction(
      () => (window as unknown as W).__world.asmRest(),
      null,
      {
        timeout: 5000,
      }
    );
  const asmOf = (page: import("@playwright/test").Page, key: string) =>
    page.evaluate((k) => (window as unknown as W).__world.asm[k], key);
  /* a jump of more than the driver's snap distance, so the figure lands at
     rest in the frame it arrives */
  const jump = async (page: import("@playwright/test").Page, y: number) => {
    await page.evaluate(
      (yy) => window.scrollTo({ top: yy, behavior: "instant" }),
      y
    );
    await frames(page);
    await rest(page);
  };
  const canon = (page: import("@playwright/test").Page, id: string) =>
    page.evaluate(
      (i) =>
        [...document.getElementById(i)!.querySelectorAll("*")]
          .map(
            (e) =>
              e.tagName +
              "|" +
              [...e.attributes]
                .map((a) => a.name + "=" + a.value)
                .sort()
                .join(",") +
              "|" +
              (e.children.length ? "" : e.textContent)
          )
          .join("\n"),
      id
    );
  const open = async (page: import("@playwright/test").Page) => {
    await page.goto("/");
    await page.waitForSelector("html[data-np-ready]", { timeout: 45000 });
    await expect
      .poll(
        () =>
          page.evaluate(() =>
            Object.keys((window as unknown as W).__world.asm ?? {})
              .sort()
              .join(",")
          ),
        { timeout: 15000 }
      )
      .toBe(FIGS.map(([k]) => k).join(","));
  };

  for (const [key, id] of FIGS) {
    test(`${key}: the same y gives the same drawing both ways, and a centred park is finished`, async ({
      page,
      isMobile,
    }) => {
      await open(page);
      const w = await asmOf(page, key);
      /* fig. 08's window is its plate's dusk entrance: 89 to 211 px */
      expect(w.yB - w.yA).toBeGreaterThan(80);
      const ys = [0.2, 0.5, 0.8].map((f) =>
        Math.round(w.yA + f * (w.yB - w.yA))
      );
      /* THE PURE LAW IS SAMPLED, NOT HOPED FOR. A sample is a jump in from
         off the screen (no window closed) and a read; if the read ran long
         enough for the grace to fire (600 ms still, under a 5-project smoke
         it can), the sample is void and is taken again — the premise "no
         pause" is the test's to keep, not the page's to survive */
      const sample = async (y: number) => {
        for (let k = 0; k < 4; k++) {
          await jump(page, y - 2000 < 0 ? y + 2000 : y - 2000);
          await jump(page, y);
          const a = await asmOf(page, key);
          const c = await canon(page, id);
          const after = await asmOf(page, key);
          if (after.g === null) return { a, c };
        }
        throw new Error(`reads too slow to sample the pure law at ${y}`);
      };
      const down: string[] = [];
      for (const y of ys) {
        const { a, c } = await sample(y);
        expect(a.s, `mid-assembly at ${y}`).toBeGreaterThan(0);
        expect(a.s).toBeLessThan(1);
        expect(a.s).toBe(a.t);
        expect(a.g, "no grace while the reader scrolls").toBeNull();
        down.push(c);
      }
      /* the assembly changes the drawing: 0.2 and 0.8 are not one picture */
      expect(down[0]).not.toBe(down[2]);
      await jump(page, Math.round(w.yB + 1200));
      for (let i = ys.length - 1; i >= 0; i--) {
        expect(
          (await sample(ys[i])).c,
          `the same drawing at ${ys[i]} both ways`
        ).toBe(down[i]);
      }
      /* CENTRED is computed, not asked of scrollIntoView: WebKit's own call
         lands a phone figure's centre anywhere from 0.55 to 0.66 of the
         screen depending on the scroll that came before it (measured, v6),
         which on a figure 70% of the screen tall is a park with its bottom
         off the screen. On a desktop seat both are checked. */
      const centre = await page.evaluate((i) => {
        const r = document.getElementById(i)!.getBoundingClientRect();
        return Math.round(scrollY + r.top + r.height / 2 - innerHeight / 2);
      }, id);
      /* a park is ARRIVED at: from off the screen, where no window is closed
         (a slow read above could have paused long enough for a grace) */
      await jump(page, Math.round(w.yA - 1500));
      await jump(page, centre);
      /* the scroll alone must do most of it — the grace is a completion,
         never the play the owner rejected: pure p at a centred park is at
         least 0.4 (measured .49-.9 across seats) */
      const parked = await asmOf(page, key);
      expect(
        parked.t,
        "a centred park is mostly assembled by the scroll alone"
      ).toBeGreaterThanOrEqual(PARK_FLOOR);
      /* ... and after the grace's stillness the hand finishes it, and the
         window is closed where the reader paused */
      await expect
        .poll(async () => (await asmOf(page, key)).s, { timeout: 4000 })
        .toBe(1);
      const graced = await asmOf(page, key);
      /* a park the scroll alone finished (fig. 08's dusk window ends at the
         reading line, above a centred park) needs no grace and gets none */
      if (parked.t < 1)
        expect(
          graced.g,
          "the window closed where the reader paused"
        ).not.toBeNull();
      else expect(graced.g, "nothing to grace: no closed window").toBeNull();
      const finished = await canon(page, id);
      /* scrolling on from the pause holds it finished: between the closed
         window's end and the open one's, p is 1 (a plain finish would read
         the open window here and take it apart on the way DOWN) */
      if (graced.g !== null && graced.g < w.yB - 4) {
        await jump(page, Math.round((graced.g + w.yB) / 2));
        expect(
          (await asmOf(page, key)).s,
          "scrolling on from the pause holds the figure finished"
        ).toBe(1);
      }
      await jump(page, Math.round(w.yB + 0.4 * (w.yB - w.yA)));
      if (BEAD.has(key))
        expect(
          (await asmOf(page, key)).s,
          "and it stays finished at any later scroll"
        ).toBe(1);
      else
        expect(
          await canon(page, id),
          "and it is the same drawing as any later scroll"
        ).toBe(finished);
      /* back up from the park it comes apart again, continuously, over the
         closed window: p falls with y, never jumps, never sticks */
      const yG = graced.g ?? w.yB;
      const ups: number[] = [];
      for (const f of [0.8, 0.5, 0.2]) {
        await jump(page, Math.round(w.yA + f * (yG - w.yA)));
        ups.push((await asmOf(page, key)).s);
      }
      expect(ups[0], "up from the park: coming apart").toBeLessThan(1);
      expect(ups[1]).toBeLessThan(ups[0]);
      expect(ups[2]).toBeLessThan(ups[1]);
      expect(ups[2]).toBeGreaterThan(0);
      /* and off the screen the window is whole again */
      await jump(page, Math.round(w.yA - 1500));
      expect(
        (await asmOf(page, key)).g,
        "off screen: no closed window"
      ).toBeNull();
      if (!isMobile) {
        await jump(page, Math.round(w.yA - 1500));
        await page.evaluate(
          (i) =>
            document
              .getElementById(i)!
              .scrollIntoView({ block: "center", behavior: "instant" }),
          id
        );
        await frames(page);
        await rest(page);
        expect(
          (await asmOf(page, key)).t,
          "scrollIntoView centre, desktop: mostly by the scroll"
        ).toBeGreaterThanOrEqual(PARK_FLOOR);
        await expect
          .poll(async () => (await asmOf(page, key)).s, { timeout: 4000 })
          .toBe(1);
      }
    });

    test(`${key}: a stop at the fold is not a park, and nothing plays itself there`, async ({
      page,
    }) => {
      await open(page);
      /* THE PARK MUST BE INELIGIBLE BY THE EYE LINE ALONE. A first version
         parked the centre at 0.85 of the screen, where a 0.46 vh drawing is
         only 83% visible: the visibility rule refused the grace and a copy
         with no eye line at all passed this test. So: the centre just below
         the eye line (0.72) with the drawing at least 90% in view, wherever
         the drawing is short enough for that to exist; a drawing too tall
         for it parks just under 90% visible instead (both rules refuse) */
      const low = await page.evaluate((i) => {
        const r = document.getElementById(i)!.getBoundingClientRect();
        const h = r.height / innerHeight;
        const cMax = 1 + 0.1 * h - h / 2; /* the lowest centre at 90% visible */
        const c = cMax >= 0.72 ? 0.72 : cMax + 0.02;
        return Math.round(scrollY + r.top + r.height / 2 - innerHeight * c);
      }, id);
      await jump(page, low);
      const a0 = await asmOf(page, key);
      expect(a0.s, "not finished at the fold").toBeLessThan(1);
      await page.waitForTimeout(1800);
      const a1 = await asmOf(page, key);
      expect(a1.g, "no grace with the centre below the eye line").toBeNull();
      expect(a1.s, "and the drawing did not move on its own").toBe(a0.s);
    });

    test(`${key}: a flick that stops at the figure still shows it assembling`, async ({
      page,
      isMobile,
    }) => {
      test.skip(isMobile, "wheel input; the touch flick is the same driver");
      await open(page);
      const w = await asmOf(page, key);
      await jump(page, Math.round(w.yA - 0.3 * (w.yB - w.yA)));
      const box = await page.evaluate(() => [innerWidth / 2, innerHeight / 2]);
      await page.mouse.move(box[0], box[1]);
      /* the figure is named IN the call that starts the tracker: set in a
         later evaluate, the tracker's first tick could win the race, read
         asm[undefined], throw and never reschedule (labrat, v6: 8 of 8 red
         on chromium-desktop with the page itself fine) */
      await page.evaluate((k) => {
        const W2 = window as unknown as W & {
          __trk: [number, number, number][];
        };
        W2.__trk = [];
        const f = () => {
          const a = W2.__world.asm[k];
          W2.__trk.push([performance.now(), a.s, scrollY]);
          if (W2.__trk.length < 240) requestAnimationFrame(f);
        };
        requestAnimationFrame(f);
      }, key);
      const span = w.yB - w.yA;
      for (let k = 0; k < 5; k++)
        await page.mouse.wheel(0, Math.round((span * 1.5) / 5));
      await rest(page);
      const r = await page.evaluate(() => {
        const T = (window as unknown as { __trk: [number, number, number][] })
          .__trk;
        const yEnd = T[T.length - 1][2];
        const stop = T.findIndex((q) => q[2] === yEnd);
        const after = T.slice(stop).filter((q) => q[1] > 0 && q[1] < 1);
        let mono = true;
        for (let i = 1; i < T.length; i++)
          if (T[i][1] < T[i - 1][1] - 1e-6) mono = false;
        return {
          msAfterStop: after.length
            ? after[after.length - 1][0] - T[stop][0]
            : 0,
          mono,
        };
      });
      expect(r.mono, "it only ever moves forward on a forward flick").toBe(
        true
      );
      expect(
        r.msAfterStop,
        "the assembly is still visibly running after the scroll has stopped"
      ).toBeGreaterThan(120);
      expect((await asmOf(page, key)).s).toBe(1);
    });
  }

  test("once every figure has landed, nothing runs", async ({ page }) => {
    await page.addInitScript(() => {
      const raf = window.requestAnimationFrame.bind(window);
      (window as unknown as { __rafN: number }).__rafN = 0;
      window.requestAnimationFrame = (cb) => {
        (window as unknown as { __rafN: number }).__rafN++;
        return raf(cb);
      };
    });
    await open(page);
    const w = await asmOf(page, "fig07");
    await jump(page, Math.round(w.yA - 100));
    /* small steps a frame apart, so the hand runs (a jump would snap) */
    for (let k = 1; k <= 8; k++) {
      await page.evaluate(
        (y) => window.scrollTo(0, y),
        Math.round(w.yA - 100 + k * 70)
      );
      await frames(page, 1);
    }
    await rest(page);
    /* past the grace (600 ms of stillness) and the hand it may move (≤ 0.8 s):
       what this counts is the page at rest, after everything it may do */
    await page.waitForTimeout(1900);
    const n0 = await page.evaluate(
      () => (window as unknown as { __rafN: number }).__rafN
    );
    await page.waitForTimeout(1000);
    const n1 = await page.evaluate(
      () => (window as unknown as { __rafN: number }).__rafN
    );
    expect(n1 - n0).toBe(0);
  });
});
