import { expect, test } from "@playwright/test";

/**
 * Reduced motion, against the page that actually ships.
 *
 * These assertions used to describe the old React home — [data-chapter]
 * sections, per-chapter waypoint backgrounds, a folio terminator and a Lenis
 * flag on the header — and they passed only because the e2e scripts built
 * WITHOUT scripts/run/build-home.mjs, so Playwright was served a page no
 * visitor has ever seen. With the test build fixed, all four failed at once.
 *
 * The run's reduced-motion contract is a different and simpler thing: there is
 * no engine to disable, because everything is a pure function of scroll. What
 * it owes a reader who asks for stillness is that the whole authored world is
 * present and settled on arrival, and that nothing is left animating.
 */
test.describe("reduced motion and keyboard access", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("the page arrives complete and usable", async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
    await expect(page.locator("main")).toBeVisible();

    /* every station is present, not merely the ones scrolled past */
    await expect(page.locator("[data-beat]")).toHaveCount(13);

    /* Keyboard reachability, stated so WebKit can answer it honestly.
       This was `keyboard.press("Tab")` then `expect(:focus).toBeVisible()`,
       which fails in both Safari seats because WebKit's default keyboard
       model does not move focus to links at all. That is a browser
       preference the page cannot influence, so the old assertion was
       testing Safari, not the site. What the page owes a keyboard reader is
       that focus LANDS somewhere visible when it is moved. */
    const focusLanded = await page.evaluate(() => {
      const first = document.querySelector<HTMLElement>(
        "a[href], button:not([disabled])"
      );
      first?.focus();
      const a = document.activeElement as HTMLElement | null;
      return !!a && a !== document.body && a.tagName !== "HTML";
    });
    expect(focusLanded).toBe(true);
    await expect(page.locator(":focus")).toBeVisible();
  });

  test("the world settles on arrival — nothing waits to be scrolled into", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
    await page.waitForTimeout(600);

    /* settleAll() runs under RM: the stations do not hold their entrance
       state waiting for a scroll that a still reader will not perform */
    await expect(page.locator("body")).toHaveClass(/\bsettled\b/);

    /* and the thread is still drawn — it is the spine of the argument, not
       an animation, so stillness must not cost the reader the line */
    await expect(page.locator("canvas#thread")).toHaveCount(1);
  });

  test("nothing is left animating", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(600);

    /* the morning flock is never released under reduced motion — the layer
       exists but is never populated, so there is no animation to hide */
    await expect(page.locator(".bird")).toHaveCount(0);

    const running = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.playState === "running")
        .map((a) => (a as CSSAnimation).animationName ?? "unnamed")
    );
    expect(running).toEqual([]);
  });

  test("anchor navigation does not depend on scroll animation", async ({
    page,
  }) => {
    /* the run's own deep links; `#work` was the old home's chapter id */
    await page.goto("/#gate");
    await expect(page.locator("#gate")).toBeInViewport();
  });

  /* v4 (2026-10-08): the type that answers the hand is motion, so a reader
     who asked for stillness does not get it: the name, the headings and the
     links do not answer a hover. (v6 retired the v4.2 depth layers; what a
     still reader is shown of the assembled figures is checked with them.) */
  test("the type does not answer the hand", async ({ page, isMobile }) => {
    await page.goto("/");
    await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
    await page.waitForTimeout(800);
    type W = {
      __world: {
        name?: () => { live: boolean } | null;
        inkLive?: () => number;
        rollLive?: () => number;
        hand?: () => number;
      };
    };
    if (!isMobile) {
      const b = await page
        .locator("h1.nameplate")
        .evaluate((h) => h.getBoundingClientRect().toJSON());
      await page.mouse.move(b.x - 40, b.y + b.height / 2);
      for (let i = 0; i <= 30; i++)
        await page.mouse.move(
          b.x - 40 + ((b.width + 80) * i) / 30,
          b.y + b.height / 2
        );
      const t = await page.evaluate(() => {
        const w = (window as unknown as W).__world;
        return {
          name: w.name?.()?.live ?? false,
          hand: w.hand?.() ?? 0,
        };
      });
      expect(t.name).toBe(false);
      expect(t.hand).toBe(0);
      /* a heading and a link under a moving hand: no swell, no roll */
      for (const sel of ["#glyph h2", "#glyph .handoff a"]) {
        await page.evaluate(
          (s) =>
            document
              .querySelector(s)!
              .scrollIntoView({ block: "center", behavior: "instant" }),
          sel
        );
        await page.waitForTimeout(300);
        const r = await page
          .locator(sel)
          .first()
          .evaluate((e) => e.getBoundingClientRect().toJSON());
        await page.mouse.move(r.x - 40, r.y + r.height / 2);
        for (let i = 0; i <= 12; i++)
          await page.mouse.move(
            r.x - 40 + ((r.width + 80) * i) / 12,
            r.y + r.height / 2
          );
        const live = await page.evaluate(() => {
          const w = (window as unknown as W).__world;
          return (w.inkLive?.() ?? 0) + (w.rollLive?.() ?? 0);
        });
        expect(live, sel).toBe(0);
      }
    }
  });

  /* v6 (2026-10-09): the figures assemble with the scroll, and that is
     motion, so a still reader is shown every one of them finished wherever
     they stand, and the same finished drawing a moving reader parks on. */
  test("every assembled figure is finished, at any scroll", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
    await page.waitForTimeout(800);
    type A = {
      t: number;
      s: number;
      d: number;
      yA: number;
      yB: number;
      g: number | null;
    };
    const asm = () =>
      page.evaluate(
        () =>
          (window as unknown as { __world: { asm: Record<string, A> } }).__world
            .asm
      );
    const a0 = await asm();
    expect(Object.keys(a0).sort()).toEqual([
      "fig02",
      "fig03",
      "fig04",
      "fig05",
      "fig06",
      "fig07",
      "fig08",
      "fig09",
      "fig10",
      "fig11",
    ]);
    /* THE INK, NOT THE BOOKKEEPING. labrat's negative proof (v6) drew every
       figure at p 0 under reduced motion while the driver still said s = 1,
       and an assertion on s passed it. So the drawn p is read too, and the
       drawing itself must be one picture wherever the still reader stands. */
    const ids: Record<string, string> = {
      fig02: "fig02",
      fig03: "pathFig",
      fig04: "appliedFig",
      fig05: "cadFig",
      fig06: "net",
      fig07: "jetFig",
      fig08: "questFig",
      fig09: "amlFig",
      fig10: "gatesFig",
      fig11: "signsFig",
    };
    const canon = (id: string) =>
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
                  .join(",")
            )
            .join("\n"),
        id
      );
    const finished: Record<string, string> = {};
    for (const [key, w] of Object.entries(a0)) {
      const seen: string[] = [];
      for (const f of [0, 0.3, 0.7]) {
        await page.evaluate(
          (y) => window.scrollTo({ top: y, behavior: "instant" }),
          Math.round(w.yA + f * (w.yB - w.yA))
        );
        await page.waitForTimeout(120);
        const a = (await asm())[key];
        expect(a.s, `${key} at ${f} of its window`).toBe(1);
        expect(a.d, `${key} is drawn finished at ${f} of its window`).toBe(1);
        /* a build without the probe (v6) reads undefined: no closed window either way */
        expect(a.g ?? null, `${key}: no grace under reduced motion`).toBeNull();
        seen.push(await canon(ids[key]));
      }
      expect(
        seen[1],
        `${key}: one drawing wherever a still reader stands`
      ).toBe(seen[0]);
      expect(
        seen[2],
        `${key}: one drawing wherever a still reader stands`
      ).toBe(seen[0]);
      finished[key] = seen[0];
    }
    /* ONE DRAWING IS NOT ENOUGH: IT MUST BE THE FINISHED ONE. fig. 08's still
       was consistent at every scroll and drawn at q = 0 on a 1440 seat (its
       reduced-motion redraw ran before its window was measured; v7), with d
       reading 1 — the probe cannot see "called with 1, drew the start". The
       reference is the page pinned at p = 1 (?asm=1), which draws every
       figure finished by construction: the still must equal it, figure by
       figure. */
    await page.goto("/?asm=1");
    await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
    await page.waitForTimeout(800);
    /* TWO CLOCKS, ONE STILL. fig. 11's points close on the rail's bead, not
       on p, so a ?asm=1 load with motion would draw its assembly finished
       and its points open. Under reduced motion there is no bead: work(y)
       returns before the token is placed (__world.token stays undefined)
       and scrubSigns(Infinity, true) closes every point once at load on
       both loads, so the reference at the top IS the still. Measured on
       this build, chromium 1440x900 and webkit 390x844: 0 differing lines
       at the top and at the bead's "arrived" y alike. */
    for (const key of Object.keys(ids)) {
      expect(
        finished[key],
        `${key}: the still reader's drawing is the finished one`
      ).toBe(await canon(ids[key]));
    }
  });
});
