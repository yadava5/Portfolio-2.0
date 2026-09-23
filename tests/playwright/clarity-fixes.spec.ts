import { expect, test, type Page } from "@playwright/test";

/**
 * The clarity phase's interaction and accessibility fixes, measured.
 *
 * Served the same way run-home.spec.ts is: `npm run build` writes
 * src/run/index.html over out/index.html, and tests/playwright/static-server.mjs
 * serves out/ at the config's baseURL. Nothing here reaches into src/.
 *
 * Every assertion below was RED on the build at cb0a2a9 and is green after.
 * They are written against the defect as it was measured, not against the fix:
 *
 *   (a) 7.1 — the Glyph pad fed the network raw pad coordinates, so the same
 *       72-unit stroke read "1" in the middle of the pad and "7" at 99.8%
 *       near the corner. The two controls are the point of the test: an
 *       "always answer 1" regression would pass the headline assertion alone.
 *   (b) 2.6 — ¶13 collapses to zero height before approval, which hides it
 *       from the eye and from nothing else. A Tab walk fell off the end of
 *       the page onto five links at effective opacity 0, 584px below the
 *       document's end, where the browser cannot scroll them into view.
 *   (c) 2.7 — wake() returns immediately under reduced motion, so frame() —
 *       the only writer of body.atmorning — never ran, and the contact row
 *       could not be reached at all after approving.
 *   (d) 7.4 — the replay control shipped `hidden` and nothing removed it. It
 *       was visible only because a display rule out-specifies the UA sheet.
 */

/** The run's own probe: src/run/index.html sets it on every classification. */
declare global {
  interface Window {
    __demo: {
      last: { prediction: number; confidence: number; ms: number } | null;
      ready: unknown;
    };
  }
}

const PAD = 280; /* the pad's own coordinate space, src/run/index.html */

/** Map a pad coordinate to a viewport point, through the pad's real box. */
async function padPoint(page: Page, x: number, y: number) {
  return page.evaluate(
    ([px, py, span]) => {
      const r = document.getElementById("pad")!.getBoundingClientRect();
      return {
        x: r.left + (px / span) * r.width,
        y: r.top + (py / span) * r.height,
      };
    },
    [x, y, PAD] as const
  );
}

/** Draw one stroke in pad coordinates and wait for the read to land. */
async function stroke(page: Page, pts: [number, number][]) {
  await page.evaluate(() => {
    window.__demo.last = null;
  });
  const first = await padPoint(page, pts[0][0], pts[0][1]);
  await page.mouse.move(first.x, first.y);
  await page.mouse.down();
  for (const [px, py] of pts.slice(1)) {
    const p = await padPoint(page, px, py);
    /* stepped, so the page sees pointermove the way a hand produces it */
    await page.mouse.move(p.x, p.y, { steps: 12 });
  }
  await page.mouse.up();
  await page.waitForFunction(() => window.__demo.last !== null, null, {
    timeout: 10_000,
  });
  return page.evaluate(() => window.__demo.last!);
}

async function padReady(page: Page) {
  /* reduced motion so the pad's box is settled rather than mid-fx: the pad
     coordinates below are only meaningful against a box that has stopped
     moving. It does not touch the classifier, which is a wasm module and a
     weights fetch either way. */
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#glyphStatus")).toHaveText("awake · local", {
    timeout: 20_000,
  });
  await page.locator("#pad").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
}

test.describe("7.1 · the Glyph pad normalises the way MNIST does", () => {
  test("an off-centre small stroke reads 1, and so does the same stroke centred", async ({
    page,
  }) => {
    await padReady(page);

    /* THE DEFECT, exactly as inventory §10 recorded it: a small "1" drawn
       near the top-left corner. Measured on cb0a2a9 this read 7 at 99.8%. */
    const offCentre = await stroke(page, [
      [62, 38],
      [62, 110],
    ]);
    expect(
      offCentre.prediction,
      `an off-centre "1" read ${offCentre.prediction} at ${(offCentre.confidence * 100).toFixed(1)}%`
    ).toBe(1);

    await page.click("#clear");
    await page.waitForTimeout(150);

    /* CONTROL 1 — the same 72-unit stroke in the middle of the pad. This
       passed before the fix too; it fails only if normalising broke the
       ordinary case. */
    const centred = await stroke(page, [
      [140, 105],
      [140, 177],
    ]);
    expect(centred.prediction, "the centred control must still read 1").toBe(1);

    await page.click("#clear");
    await page.waitForTimeout(150);

    /* CONTROL 2 — a loop, which is not a 1 under any preprocessing. Without
       it, a change that answered 1 for everything would pass this file. */
    const loop = await stroke(page, [
      [140, 60],
      [185, 90],
      [195, 140],
      [185, 190],
      [140, 220],
      [95, 190],
      [85, 140],
      [95, 90],
      [140, 60],
    ]);
    expect(
      loop.prediction,
      `a closed loop must not read 1 (read ${loop.prediction})`
    ).not.toBe(1);
  });
});

test.describe("2.6 · nothing invisible is in the focus order before approval", () => {
  test("a Tab walk finds no stop at opacity 0 or inside a zero-height ancestor", async ({
    page,
    browserName,
  }) => {
    /* WebKit on macOS tabs between FORM CONTROLS ONLY unless the reader has
       turned on "Press Tab to highlight each item on a webpage", and
       Playwright's WebKit inherits that default. Measured here: the walk
       reaches 8 stops on both WebKit projects — the page's buttons — and
       never lands on a link at all, so the assertion would be vacuously
       green on the engine where it can prove the least. Skipped rather than
       loosened: a walk that cannot reach ¶13's links cannot testify about
       them either way. Chromium and Firefox both walk the full 53. */
    test.skip(
      browserName === "webkit",
      "macOS WebKit does not put links in the sequential focus order by default"
    );
    /* The walk is ~53 stops at 260ms of settle each; Firefox needs more than
       the 30s default to finish one. */
    test.setTimeout(120_000);
    await page.goto("/");
    await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
    await page.waitForTimeout(600);

    type Stop = {
      sig: string;
      label: string;
      opacity: number;
      clipped: boolean;
    };
    const read = () =>
      page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body || el === document.documentElement)
          return null;
        let o = 1;
        for (let n: HTMLElement | null = el; n; n = n.parentElement) {
          o *= Number(getComputedStyle(n).opacity);
          if (n === document.documentElement) break;
        }
        /* clipped: an ancestor with no height that hides its overflow. ¶13
           is exactly this — height:0 with overflow:hidden — and it is why
           these stops rendered nothing at all. */
        let clipped = false;
        for (
          let n: HTMLElement | null = el.parentElement;
          n && n !== document.documentElement;
          n = n.parentElement
        ) {
          const cs = getComputedStyle(n);
          if (
            n.getBoundingClientRect().height < 0.5 &&
            cs.overflow !== "visible"
          ) {
            clipped = true;
            break;
          }
        }
        return {
          sig:
            el.tagName +
            "|" +
            (el.getAttribute("href") ?? el.id ?? "") +
            "|" +
            (el.textContent ?? "").trim().slice(0, 40),
          label: (el.textContent ?? "").trim().slice(0, 40) || el.tagName,
          opacity: o,
          clipped,
        } as Stop;
      });

    const stops: Stop[] = [];
    for (let i = 0; i < 150; i++) {
      await page.keyboard.press("Tab");
      /* BRING THE STOP INTO VIEW BEFORE READING IT, and this is the whole
         difference between the defect and the page working as designed.
         Every prose block on this page rides the data-fx engine, which
         fades a block out as it leaves the top of the screen — so a link the
         focus ring has just scrolled flush to the top genuinely reads
         opacity 0 at that instant, and sampling there reports a defect on a
         link that is perfectly reachable. The question worth asking is not
         "is it lit right now" but "can the reader get to it": centre it,
         let the engine draw a frame, then read. ¶13's links fail that test
         because they sit 584px BELOW the document's end, where no scroll
         can put them. */
      await page.evaluate(() =>
        (document.activeElement as HTMLElement | null)?.scrollIntoView?.({
          block: "center",
        })
      );
      await page.waitForTimeout(260);
      const s = await read();
      if (!s) continue;
      if (stops.length > 3 && s.sig === stops[0].sig) break; /* cycled */
      stops.push(s);
    }

    expect(
      stops.length,
      "the Tab walk must reach the page at all"
    ).toBeGreaterThan(10);
    const dead = stops.filter((s) => s.opacity < 0.05 || s.clipped);
    expect(
      dead.map(
        (s) => `${s.label} (opacity ${s.opacity}, clipped ${s.clipped})`
      ),
      "a focus stop that renders nothing is a stop the reader cannot use"
    ).toEqual([]);

    /* and the contact the gate no longer hides is genuinely reachable */
    expect(
      stops.some((s) => /mailto:/.test(s.sig)),
      "the colophon's mailto is a real focus stop before approval"
    ).toBe(true);
  });
});

test.describe("2.7 · reduced motion is given the morning", () => {
  test("approving reveals ¶13 and its address at once", async ({ page }) => {
    /* emulateMedia before the navigation, not test.use — run-home.spec.ts
       records that the context-level option did not reach the page. */
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("body")).toHaveClass(/\bsettled\b/);

    await page.locator("#approve").scrollIntoViewIfNeeded();
    await page.click("#approve");

    await expect(page.locator("body")).toHaveClass(/\batmorning\b/, {
      timeout: 4000,
    });

    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const el = document.getElementById("mail")!;
            let o = 1;
            for (
              let n: HTMLElement | null = el;
              n && n !== document.documentElement;
              n = n.parentElement
            )
              o *= Number(getComputedStyle(n).opacity);
            return o;
          }),
        {
          message: "#mail must reach effective opacity 1 under reduced motion",
          timeout: 4000,
        }
      )
      .toBe(1);

    /* and ¶13 rejoins the page it was inert inside */
    await expect(page.locator("#nextmorning")).not.toHaveAttribute(
      "inert",
      /.*/
    );
    await expect(page.locator("#nextmorning")).not.toHaveAttribute(
      "aria-hidden",
      /.*/
    );
  });
});

test.describe("7.4 · the replay control stops lying about being hidden", () => {
  test("its hidden attribute is gone once the nameplate is ready", async ({
    page,
  }) => {
    await page.goto("/");
    const replay = page.locator("[data-np-replay]");
    await expect(replay).toHaveCount(1);
    /* EXECUTED, not reasoned: there is nothing to replay until the run has
       performed, and removing the attribute must not be what reveals the
       control. data-np-ready lands at ~4.7s cold, so this reads the page
       well before it. */
    await expect(replay).toBeHidden();
    expect(
      await page.locator("html").getAttribute("data-np-ready"),
      "data-np-ready must not be set this early, or the check above is vacuous"
    ).toBeNull();

    await page.waitForSelector("html[data-np-ready]", { timeout: 20_000 });
    expect(
      await replay.evaluate((el: HTMLElement) => el.hidden),
      "the control a reader can see and click must not be marked hidden"
    ).toBe(false);
    await expect(replay).toBeVisible();
  });
});
