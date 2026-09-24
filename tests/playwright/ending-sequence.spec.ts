import { expect, test, type Page } from "@playwright/test";

/**
 * ¶12's ending, measured in a browser: the composition, the press, and the
 * journey the press starts.
 *
 * WHY A FILE OF ITS OWN. Everything here is about ONE station and about a
 * sequence that only exists after a click, which is a different kind of
 * assertion from reading-gates.spec.ts (geometry of the page as served) and
 * from run-home.spec.ts (the document's structure). It also has to click the
 * button, and a spec that approves the run cannot share a page with one that
 * measures the unapproved page.
 *
 * WHAT IT IS ACCOUNTABLE TO. The owner rejected round 4's first ending on
 * four counts, and each is an assertion below:
 *   · "check the alignment" — the socket, the ring, the button and the card's
 *     note are one line. `alignment` measures the four baselines.
 *   · "the straight rail looks weird" — the way on is a drawn curve, not a
 *     bar. `the way on is a curve` measures its own sagitta against the
 *     straight line between its ends.
 *   · the journey must be visible before the press, and unexplained.
 *   · the fit: ¶12 at max scroll, with the kicker on screen and 96px or less
 *     of empty paper under the last ink, at every desktop size that ships.
 *
 * RUNS ON ONE PROJECT, for the same reason reading-gates does: these are
 * geometric claims about the design, not about engine differences.
 */

declare global {
  interface Window {
    __world: {
      approved: boolean;
      flockFrom: { fx: number; fy: number } | null;
      departure: { t0: number; tHead: number; tTail: number; done: boolean };
    };
    __onwardPath?: () => { x: number; y: number; L: number }[];
  }
}

const DESKTOP: [number, number][] = [
  [1512, 982],
  [1440, 900],
  [1375, 800],
  [1280, 800],
];

/** to the gate, with every builder run on the way down */
async function toTheGate(page: Page): Promise<void> {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
  const doc = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < doc; y += 500) {
    await page.evaluate(
      (yy) => window.scrollTo({ top: yy, behavior: "instant" }),
      y
    );
    await page.waitForTimeout(40);
  }
  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })
  );
  await page.waitForTimeout(600);
}

/** the bottom edge of an element's LAST line box, which is its baseline */
async function baselines(page: Page) {
  return page.evaluate(() => {
    const base = (sel: string): number => {
      const el = document.querySelector(sel);
      if (!el) return NaN;
      const probe = document.createElement("span");
      probe.style.cssText =
        "display:inline-block;width:0;height:0;overflow:hidden";
      el.appendChild(probe);
      const y = probe.getBoundingClientRect().bottom;
      probe.remove();
      return y;
    };
    const box = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
    const btn = box("#approve");
    const sq = box("#gateDock i");
    return {
      btnBase: base("#approve"),
      noteBase: base("#gateNote"),
      timeBase: base(".approvebar .lt"),
      btnMid: btn.top + btn.height / 2,
      sqMid: sq.top + sq.height / 2,
      sqLeft: sq.left,
      btnRight: btn.right,
      btnW: btn.width,
      btnH: btn.height,
    };
  });
}

test.describe("¶12 · the last stop is one aligned object", () => {
  for (const [w, h] of DESKTOP) {
    test(`alignment at ${w}`, async ({ page }, testInfo) => {
      testInfo.setTimeout(120_000);
      await page.setViewportSize({ width: w, height: h });
      await toTheGate(page);
      const b = await baselines(page);

      /* THE SOCKET IS ON THE BUTTON'S CENTRE LINE. It is positioned against
         the button's own box, so this cannot drift with a font fallback —
         and it is positioned WITHOUT a transform, because buildThread
         measures the square with absTop, which walks offsetTop and cannot
         see one. A translateY(-50%) here put the square 4px below the ring
         the canvas drew, which is what the owner saw first. */
      expect(Math.abs(b.sqMid - b.btnMid), `socket on the button's centre at ${w}`)
        .toBeLessThanOrEqual(1);
      /* and 8px clear of the button, with 11px of ring inside that */
      expect(b.sqLeft - b.btnRight, `socket clear of the button at ${w}`)
        .toBeGreaterThanOrEqual(18);
      expect(b.btnW, `the button is 150 wide at ${w}`).toBeCloseTo(150, 0);
      expect(b.btnH, `the button is 44 tall at ${w}`).toBeCloseTo(44, 0);

      /* ONE BASELINE ACROSS THE PAGE. The button's label, the hour beside it
         and the card's note opposite it sit on one line — the alignment the
         whole composition is built around, and the one a reader's eye
         actually checks. The hour is nudged by a measured em because a flex
         control's baseline is synthesised and align-items:baseline does not
         reach it. */
      expect(Math.abs(b.noteBase - b.btnBase), `note on the button's line at ${w}`)
        .toBeLessThanOrEqual(1.5);
      expect(Math.abs(b.timeBase - b.btnBase), `22:41 on the button's line at ${w}`)
        .toBeLessThanOrEqual(1.5);
    });

    test(`fits 100vh at ${w}`, async ({ page }, testInfo) => {
      testInfo.setTimeout(120_000);
      await page.setViewportSize({ width: w, height: h });
      await toTheGate(page);
      const fit = await page.evaluate(() => {
        const sec = document.querySelector("#gate")!.getBoundingClientRect();
        const kicker = document.querySelector("#gate .kicker")!.getBoundingClientRect();
        /* the last ink in the station, whatever it happens to be */
        let last = -Infinity;
        for (const el of document.querySelectorAll("#gate *")) {
          if (!el.children.length && (el.textContent || "").trim()) {
            const r = el.getBoundingClientRect();
            if (r.width) last = Math.max(last, r.bottom);
          }
        }
        const door = document.querySelector("#gateDoor")!.getBoundingClientRect();
        last = Math.max(last, door.bottom);
        return {
          kickerTop: kicker.top,
          kickerBottom: kicker.bottom,
          band: sec.bottom - last,
          overflow:
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        };
      });
      expect(fit.kickerTop, `the kicker is on screen at ${w}`).toBeGreaterThan(0);
      expect(fit.kickerBottom, `the kicker is on screen at ${w}`).toBeLessThan(h);
      expect(fit.band, `empty paper under the last ink at ${w}`).toBeLessThanOrEqual(96);
      expect(fit.overflow, `no horizontal overflow at ${w}`).toBe(0);
    });
  }

  /* THE WAY ON IS A CURVE, AND IT HAS NO CORNER IN IT. The owner's words:
     "the straight rail looks weird … it should follow a flowing path … not a
     straight bar going from end to end", and then, of the first curve, that
     it had a visible corner 12px under the socket.
     A bar and a sweep are not distinguishable by "is there a line", so two
     numbers are measured instead:
       · the SAGITTA — how far the path departs from the straight line
         between its own two ends, as a fraction of that line. A bar is 0.
       · KINK2 — the greatest heading change across a 2px chord, resampled by
         arc length. It is G10's own corner metric, pointed at this path, and
         it is the number that caught the elbow: the hand-placed anchors it
         replaced measured 9° to 14° and read as a bend on the page. */
  const ONWARD_KINK = 16;
  for (const [w, h] of [[1512, 982], [390, 844]] as [number, number][]) {
    test(`the way on is a drawn curve, not a bar, at ${w}`, async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(120_000);
      await page.setViewportSize({ width: w, height: h });
      await toTheGate(page);
      const curve = await page.evaluate(() => {
        const pts = window.__onwardPath!();
        const a = pts[0], b = pts[pts.length - 1];
        const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
        let sag = 0;
        for (const p of pts)
          sag = Math.max(sag, Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / len);
        /* resampled every 2px of arc, exactly as railShape does */
        const re: [number, number][] = [];
        let j = 0;
        for (let L = 0; L <= pts[pts.length - 1].L; L += 2) {
          while (j < pts.length - 2 && pts[j + 1].L < L) j++;
          const p = pts[j], q = pts[j + 1];
          const t = q.L > p.L ? (L - p.L) / (q.L - p.L) : 0;
          re.push([p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t]);
        }
        const hd = (i: number) =>
          Math.atan2(re[i + 1][1] - re[i][1], re[i + 1][0] - re[i][0]);
        let kink2 = 0;
        for (let i = 0; i + 2 < re.length; i++) {
          let d = (Math.abs(hd(i + 1) - hd(i)) * 180) / Math.PI;
          if (d > 180) d = 360 - d;
          kink2 = Math.max(kink2, d);
        }
        /* and it leaves the socket going down, on the day rail's own tangent,
           so there is no corner where one line becomes the other */
        const leaveDeg =
          (Math.atan2(re[1][1] - re[0][1], Math.abs(re[1][0] - re[0][0])) * 180) /
          Math.PI;
        return { n: pts.length, ratio: sag / len, kink2, leaveDeg };
      });
      expect(curve.n, `the way on was built at ${w}`).toBeGreaterThan(40);
      expect(curve.ratio, `it bows away from its own chord at ${w}`).toBeGreaterThan(0.08);
      expect(curve.kink2, `sharpest corner on the way on at ${w}`).toBeLessThanOrEqual(
        ONWARD_KINK
      );
      expect(curve.leaveDeg, `it leaves the socket going down at ${w}`).toBeGreaterThan(50);
    });
  }

  /* and it is on the page BEFORE anything is pressed: the hook is that a
     reader can see the run has somewhere else to go. */
  test("the way on is drawn before the press, and the day's rail is not", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await page.setViewportSize({ width: 1512, height: 982 });
    await toTheGate(page);
    const state = await page.evaluate(() => ({
      approved: window.__world.approved,
      onward: window.__onwardPath!().length,
      /* the day's rail is untouched by it: __rail() still ends at the socket */
      railEndsAtSocket: (() => {
        const s = (window as unknown as { __rail: () => { x: number; y: number }[] }).__rail();
        const sq = document.querySelector("#gateDock i")!.getBoundingClientRect();
        const last = s[s.length - 1];
        return (
          Math.abs(last.x - (sq.left + sq.width / 2)) < 1 &&
          Math.abs(last.y - (sq.top + window.scrollY + sq.height / 2)) < 2
        );
      })(),
      doorClosed: !document.getElementById("gateDoor")!.classList.contains("open"),
    }));
    expect(state.approved).toBe(false);
    expect(state.onward, "the way on is drawn before the press").toBeGreaterThan(40);
    expect(state.railEndsAtSocket, "the day's rail still ends at the socket").toBe(true);
    expect(state.doorClosed, "the door is shut before the press").toBe(true);
  });
});

test.describe("¶12 · the press starts the journey", () => {
  for (const [w, h] of [[1512, 982], [390, 844]] as [number, number][]) {
    test(`the sequence at ${w}`, async ({ page }, testInfo) => {
      testInfo.setTimeout(180_000);
      await page.setViewportSize({ width: w, height: h });
      await toTheGate(page);

      const before = await page.evaluate(() => window.scrollY);
      await page.click("#approve");
      const dep = await page.evaluate(() => ({ ...window.__world.departure }));
      expect(dep.tHead, `the run takes a moment to get there at ${w}`).toBeGreaterThan(400);
      expect(dep.tHead, `and not longer than a beat at ${w}`).toBeLessThan(2200);

      /* THE PAGE DOES NOT MOVE UNDER THE READER while the run is travelling.
         The carry is the reward for the press and it starts at t_head + 1360;
         a scroll before that means the two are racing. Sampled every frame
         rather than at the end, because the carry's own easing would hide a
         jump at the start. */
      const held = await page.evaluate(async (tHead: number) => {
        const y0 = window.scrollY;
        const t0 = performance.now();
        let moved: [number, number] | null = null;
        await new Promise<void>((done) => {
          const tick = () => {
            const t = performance.now() - t0;
            if (window.scrollY !== y0 && !moved) moved = [Math.round(t), window.scrollY];
            if (t < tHead + 1000) requestAnimationFrame(tick);
            else done();
          };
          tick();
        });
        return { y0, moved };
      }, dep.tHead);
      expect(held.moved, `nothing scrolled before t_head + 1000 at ${w}`).toBeNull();
      expect(held.y0).toBe(before);

      /* the door is opened by the run arriving, and the birds leave AFTER it
         is open — a flock coming out of a shut door is the defect this
         ordering exists to prevent */
      const doorFirst = await page.evaluate(
        () =>
          document.getElementById("gateDoor")!.classList.contains("open") &&
          document.body.classList.contains("flying")
      );
      expect(doorFirst, `the door is open and the flock is away at ${w}`).toBe(true);

      /* and they leave FROM the doorway, not from the dock a screen away */
      const from = await page.evaluate(() => {
        const d = document.getElementById("gateDoor")!.getBoundingClientRect();
        const f = window.__world.flockFrom!;
        return {
          dx: Math.abs(f.fx * window.innerWidth - (d.left + d.width / 2)),
          dy: Math.abs(f.fy * window.innerHeight - (d.top + d.height / 2)),
          fx: f.fx,
          west: document.getElementById("flock")!.classList.contains("west"),
        };
      });
      expect(from.dx, `the flock leaves the doorway at ${w}`).toBeLessThanOrEqual(4);
      /* fy is clamped into the band the sky has room in, so it is allowed to
         differ; fx is not, and it is what decides the direction */
      expect(from.fx, `the door sits west-bound at ${w}`).toBeGreaterThan(0.5);
      expect(from.west, `the flock flies west at ${w}`).toBe(true);
    });
  }

  test.describe("reduced motion", () => {
    test("the door is open at once and no bird is ever built", async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(120_000);
      await page.setViewportSize({ width: 1512, height: 982 });
      /* emulateMedia rather than test.use: the project fixtures this file
         runs under are typed without a reducedMotion option, and the media
         emulation is what the page actually reads. */
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      await page.locator("#approve").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.click("#approve");
      await page.waitForTimeout(400);
      const rm = await page.evaluate(() => ({
        birds: document.querySelectorAll(".bird").length,
        open: document.getElementById("gateDoor")!.classList.contains("open"),
        done: window.__world.departure.done,
        morningReachable: !document
          .getElementById("nextmorning")!
          .hasAttribute("inert"),
        note: document.getElementById("gateNote")!.textContent || "",
        role: document.getElementById("gateNote")!.getAttribute("role"),
      }));
      expect(rm.birds, "no flock under reduced motion").toBe(0);
      expect(rm.open, "the door is open at once").toBe(true);
      expect(rm.done, "the way on is drawn at its finished frame").toBe(true);
      expect(rm.morningReachable, "¶13 is reachable").toBe(true);
      expect(rm.note).toMatch(/approved by hand at \d\d:\d\d/);
      expect(rm.role, "the press is announced, not only seen").toBe("status");
    });
  });
});

/* ══════════════════════════════════════════════════════════════════════
   fig. 10 · three presses on one level

   The owner rejected the round-3 drawing because the passed slip DROPPED out
   of its press: a fall is the shape of a failure and it was drawn on the one
   gate that succeeded. The claim this file makes is the correction itself —
   at the settled frame nothing has moved downward, and the one slip that
   travels travels sideways.
   ══════════════════════════════════════════════════════════════════════ */
test.describe("fig. 10 · nothing falls", () => {
  test("the passed slip travels sideways, and the plate is level", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await page.setViewportSize({ width: 1512, height: 982 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    /* settle the plate: the scrub reads the plate's own position, so put it
       where a reader who has stopped on it would have it */
    const top = await page.evaluate(() => {
      const el = document.querySelector("#gatesFig")!;
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY + r.height / 2;
    });
    for (let y = Math.max(0, top - 2600); y < top; y += 400) {
      await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
      await page.waitForTimeout(40);
    }
    await page.evaluate(
      (yy) => window.scrollTo({ top: yy, behavior: "instant" }),
      top - 982 * 0.46
    );
    await page.waitForTimeout(500);

    const rows = await page.evaluate(() => {
      return [...document.querySelectorAll("#gatesFig .grow.gbench")].map((row) => {
        const slip = row.querySelector(".gslip") as HTMLElement;
        const word = row.querySelector(".gword") as HTMLElement;
        const bed = row.querySelector(".gbed")!.getBoundingClientRect();
        const m = new DOMMatrixReadOnly(getComputedStyle(slip).transform);
        return {
          g: row.getAttribute("data-g"),
          passed: row.classList.contains("passed"),
          dx: m.e,
          dy: m.f,
          wordOpacity: +getComputedStyle(word).opacity,
          slipBottom: slip.getBoundingClientRect().bottom,
          bedTop: bed.top,
        };
      });
    });
    expect(rows.length).toBe(3);
    for (const r of rows) {
      /* THE CORRECTION, ASSERTED: no slip ever moves down. */
      expect(r.dy, `row ${r.g} has no vertical travel`).toBe(0);
      /* every verdict is stamped at the settled frame, and it is 0 or 1 */
      expect(r.wordOpacity, `row ${r.g} is stamped`).toBe(1);
      /* and every slip still stands on its own bed */
      expect(Math.abs(r.slipBottom - r.bedTop), `row ${r.g} stands on its bed`)
        .toBeLessThanOrEqual(1.5);
      if (r.passed) expect(r.dx, "the passed slip is out of its press").toBeGreaterThan(60);
      else expect(r.dx, `row ${r.g} stayed in its press`).toBe(0);
    }
    /* and the plate does not outgrow the prose beside it */
    const heights = await page.evaluate(() => {
      const plate = document.querySelector("#gatesFig")!.getBoundingClientRect();
      const prose = document.querySelector(".bhow .prose")!.getBoundingClientRect();
      return { plate: plate.height, prose: prose.height };
    });
    expect(heights.plate, "fig. 10 is shorter than the prose column").toBeLessThan(
      heights.prose
    );
  });
});
