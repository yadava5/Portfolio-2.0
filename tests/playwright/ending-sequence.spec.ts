import { expect, test, type Page, type TestInfo } from "@playwright/test";

/**
 * ¶12's ending, measured in a browser: the wall the run stops at, the boom
 * across the doorway in it, and the chain a hand starts by lifting that boom.
 *
 * WHY A FILE OF ITS OWN. Everything here is about ONE station and about a
 * sequence that only exists after a click, which is a different kind of
 * assertion from reading-gates.spec.ts (geometry of the page as served) and
 * from run-home.spec.ts (the document's structure). It also has to click the
 * button, and a spec that approves the run cannot share a page with one that
 * measures the unapproved page.
 *
 * WHAT IT IS ACCOUNTABLE TO. The owner has rejected this ending four times,
 * and each rejection is an assertion below:
 *   · "the straight rail looks weird … should follow a flowing path" — the
 *     way on is a drawn curve inside the rail's own corner ceilings, and it
 *     keeps 16px off every letter on the screen.
 *   · "why are we ending on an empty space? it should be there to connect it
 *     to that place that can be a gate to something! that is being blocked" —
 *     the line ends against a boom, the boom is shut, and ¶13 has no height
 *     and cannot be reached until a press lifts it.
 *   · "too fast" — the timetable is measured, not asserted from the
 *     setTimeouts that scheduled it.
 *   · "check the alignment" — the socket, the ring, the button and the note
 *     are one line.
 *
 * WHICH PROJECTS. The geometry is a claim about the design and runs on
 * chromium-desktop, for the same reason reading-gates does. The ORDER of the
 * chain, the arming and the guard are claims about behaviour and run on every
 * engine — and scroll positions are compared with a tolerance there, because
 * WebKit and Firefox report a fractional maximum scroll on this document
 * (measured: 14961 against a computed 14954.5).
 */

declare global {
  interface Window {
    __world: {
      approved: boolean;
      armed: boolean;
      halted: boolean;
      boom: number;
      released?: boolean;
      marks: Record<string, number>;
      flockFrom: { fx: number; fy: number } | null;
      departure: {
        t0: number;
        pace: number;
        tHead: number;
        tTail: number;
        len: number;
        ready: boolean;
      };
    };
    __onwardPath?: () => { x: number; y: number; L: number }[];
    __rail?: () => { x: number; y: number }[];
  }
}

const DESKTOP: [number, number][] = [
  [1512, 982],
  [1440, 900],
  [1375, 800],
  [1280, 800],
];

/** geometry is a claim about the design, not about an engine */
const geometryOnly = (testInfo: TestInfo): void => {
  testInfo.skip(
    testInfo.project.name !== "chromium-desktop",
    "the ending's geometry is measured, not engine-dependent — chromium-desktop only"
  );
};

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
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    })
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
    const box = (sel: string) =>
      document.querySelector(sel)!.getBoundingClientRect();
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

/* ══════════════════════════════════════════════════════════════════════
   the still · what a reader meets before anything is pressed
   ══════════════════════════════════════════════════════════════════════ */
test.describe("¶12 · the last stop is one aligned object", () => {
  // eslint-disable-next-line no-empty-pattern
  test.beforeEach(({}, testInfo) => geometryOnly(testInfo));

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
      expect(
        Math.abs(b.sqMid - b.btnMid),
        `socket on the button's centre at ${w}`
      ).toBeLessThanOrEqual(1);
      /* and 8px clear of the button, with 11px of ring inside that */
      expect(
        b.sqLeft - b.btnRight,
        `socket clear of the button at ${w}`
      ).toBeGreaterThanOrEqual(18);
      expect(b.btnW, `the button is 150 wide at ${w}`).toBeCloseTo(150, 0);
      expect(b.btnH, `the button is 44 tall at ${w}`).toBeCloseTo(44, 0);

      /* ONE BASELINE ACROSS THE PAGE. The button's label, the hour beside it
         and the card's note opposite it sit on one line — the alignment the
         whole composition is built around, and the one a reader's eye
         actually checks. */
      expect(
        Math.abs(b.noteBase - b.btnBase),
        `note on the button's line at ${w}`
      ).toBeLessThanOrEqual(1.5);
      expect(
        Math.abs(b.timeBase - b.btnBase),
        `22:41 on the button's line at ${w}`
      ).toBeLessThanOrEqual(1.5);
    });

    test(`fits 100vh at ${w}`, async ({ page }, testInfo) => {
      testInfo.setTimeout(120_000);
      await page.setViewportSize({ width: w, height: h });
      await toTheGate(page);
      const fit = await page.evaluate(() => {
        const sec = document.querySelector("#gate")!.getBoundingClientRect();
        const kicker = document
          .querySelector("#gate .kicker")!
          .getBoundingClientRect();
        /* the last ink in the station, whatever it happens to be */
        let last = -Infinity;
        for (const el of document.querySelectorAll("#gate *")) {
          if (!el.children.length && (el.textContent || "").trim()) {
            const r = el.getBoundingClientRect();
            if (r.width) last = Math.max(last, r.bottom);
          }
        }
        return {
          kickerTop: kicker.top,
          kickerBottom: kicker.bottom,
          band: sec.bottom - last,
          overflow:
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        };
      });
      expect(fit.kickerTop, `the kicker is on screen at ${w}`).toBeGreaterThan(
        0
      );
      expect(fit.kickerBottom, `the kicker is on screen at ${w}`).toBeLessThan(
        h
      );
      expect(
        fit.band,
        `empty paper under the last ink at ${w}`
      ).toBeLessThanOrEqual(96);
      expect(fit.overflow, `no horizontal overflow at ${w}`).toBe(0);
    });

    /* THE WALL IS WHERE THE DOCUMENT ENDS, AND THE DOORWAY IS ON THE PAGE'S
       CENTRE LINE — which is the column ¶13 is set in, so the opening the
       boom holds shut is literally the way into the next morning. None of
       this is declared in the drawing: #gateWall is laid out and the canvas
       reads its box, which is why 1024 and 1280 need no case of their own.
       The bug this catches is a real one: `align-self:end` is the cross axis
       in the stacked flex column, and it collapsed the gateway's box against
       the right-hand edge — the doorway landed 460px off centre at 1024. */
    test(`the wall and its doorway at ${w}`, async ({ page }, testInfo) => {
      testInfo.setTimeout(120_000);
      await page.setViewportSize({ width: w, height: h });
      await toTheGate(page);
      const m = await page.evaluate(() => {
        const g = document.getElementById("gateWall")!.getBoundingClientRect();
        const lab = document
          .querySelector(".gateway .ladder.dep")!
          .getBoundingClientRect();
        const foot = document
          .querySelector("#gate footer")!
          .getBoundingClientRect();
        const wallY = g.top + g.height / 2;
        return {
          doorMid: g.left + g.width / 2,
          doorW: g.width,
          wallY,
          strip: document.body.scrollHeight - (window.scrollY + wallY),
          labGap: lab.left - g.right,
          labBottom: lab.bottom,
          labTop: lab.top,
          footGap: wallY - foot.bottom,
          vh: window.innerHeight,
          vw: window.innerWidth,
        };
      });
      expect(
        Math.abs(m.doorMid - m.vw / 2),
        `the doorway is on the viewport's centre line at ${w}`
      ).toBeLessThanOrEqual(1);
      expect(m.doorW, `the doorway is 128px wide at ${w}`).toBeCloseTo(128, 0);
      /* the far side is a strip, not a screen: the wall IS the ending */
      expect(
        m.strip,
        `the wall sits near the document's end at ${w}`
      ).toBeGreaterThan(40);
      expect(m.strip, `and the far side is a strip at ${w}`).toBeLessThan(140);
      /* nothing collides: the label clears the far jamb and the wall's own
         7px of section, and the colophon clears the wall */
      expect(m.labGap, `the label clears the far jamb at ${w}`).toBeGreaterThan(
        12
      );
      expect(
        m.labTop,
        `the label clears the wall's section at ${w}`
      ).toBeGreaterThan(m.wallY + 7);
      expect(m.labBottom, `the label is on screen at ${w}`).toBeLessThan(m.vh);
      expect(
        m.footGap,
        `the colophon clears the wall at ${w}`
      ).toBeGreaterThanOrEqual(16);
    });
  }

  /* ════════════════════════════════════════════════════════════════════
     THE WAY ON IS A CURVE, IT TOUCHES NO LETTER, AND IT ARRIVES FROM ABOVE.
     The owner's words: "the straight rail looks weird … it should follow a
     flowing path … not a straight bar going from end to end", and then, of
     the first curve, that it had a visible corner 12px under the socket.

     The round-4 sagitta test is retired here. A sagitta only says the line
     is not a bar, and the line has not been a bar for two rounds; what it
     never said is whether the curve is SMOOTH and whether it runs into
     anything. Three numbers say that instead, and two of them are the
     ceilings the day's own rail is held to, pointed at this path:
       · CLEARANCE — 16px from every text box on this screen, the same floor
         G10b holds the rail to inside the timetable.
       · KINK2 and BEND24 — the greatest heading change across a 2px chord
         and across a 24px window, resampled by arc length. kink2 is the
         number that caught the elbow: the hand-placed anchors it replaced
         measured 9° to 14° and read as a bend on the page.
       · THE ARRIVAL — the last 24px are vertical. The line comes down
         through the doorway the way everything else on this page has
         arrived at everything, from above, and a line that arrives level is
         a pipe.
     ════════════════════════════════════════════════════════════════════ */
  /* Set from the measurement, not from the rail's ceilings: this path is
     deterministic — one ellipse and one sine wobble, no random hand — so a
     gate at the rail's 16.2 and 24.1 would have 8x and 2x of headroom and
     could not fire on anything short of a redesign. Measured worst across
     the five seats: kink2 3.03 and bend24 16.7, both at 1375 — which is
     smoother than the day's own rail at the same seat, 1.9 and 19.6. */
  const KINK2 = 6;
  const BEND24 = 21;
  const CLEAR = 16;
  for (const [w, h] of [
    [1512, 982],
    [1440, 900],
    [1375, 800],
    [1280, 800],
    [390, 844],
  ] as [number, number][]) {
    test(`the way on is a smooth curve that touches nothing at ${w}`, async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(120_000);
      await page.setViewportSize({ width: w, height: h });
      await toTheGate(page);
      const curve = await page.evaluate(() => {
        const pts = window.__onwardPath!();
        const end = pts[pts.length - 1];

        /* resampled every 2px of arc, exactly as railShape does */
        const re: [number, number][] = [];
        let j = 0;
        for (let L = 0; L <= end.L; L += 2) {
          while (j < pts.length - 2 && pts[j + 1].L < L) j++;
          const p = pts[j],
            q = pts[j + 1];
          const t = q.L > p.L ? (L - p.L) / (q.L - p.L) : 0;
          re.push([p.x + (q.x - p.x) * t, p.y + (q.y - p.y) * t]);
        }
        const hd = (i: number) =>
          Math.atan2(re[i + 1][1] - re[i][1], re[i + 1][0] - re[i][0]);
        const turn = (a: number, b: number) => {
          let d = (Math.abs(hd(b) - hd(a)) * 180) / Math.PI;
          if (d > 180) d = 360 - d;
          return d;
        };
        let kink2 = 0;
        for (let i = 0; i + 2 < re.length; i++)
          kink2 = Math.max(kink2, turn(i, i + 1));
        let bend24 = 0;
        for (let i = 0; i + 13 < re.length; i += 2)
          bend24 = Math.max(bend24, turn(i, i + 12));

        /* the arrival: the heading of the last 24px against straight down */
        const tail = re[re.length - 1],
          back = re[Math.max(0, re.length - 13)];
        const arriveDeg =
          (Math.abs(Math.atan2(tail[0] - back[0], tail[1] - back[1])) * 180) /
          Math.PI;

        /* and it touches no letter. Text boxes in page coordinates, against
           the path in page coordinates. */
        let clear = Infinity;
        let worst = "";
        for (const el of document.querySelectorAll("#gate *")) {
          if (el.children.length || !(el.textContent || "").trim()) continue;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) continue;
          const x0 = r.left,
            x1 = r.right;
          const y0 = r.top + window.scrollY,
            y1 = r.bottom + window.scrollY;
          for (const p of pts) {
            const dx = Math.max(x0 - p.x, 0, p.x - x1);
            const dy = Math.max(y0 - p.y, 0, p.y - y1);
            const d = Math.hypot(dx, dy);
            if (d < clear) {
              clear = d;
              worst = (el.textContent || "").trim().slice(0, 28);
            }
          }
        }
        return {
          n: pts.length,
          kink2,
          bend24,
          arriveDeg,
          clear,
          worst,
        };
      });
      expect(curve.n, `the way on was built at ${w}`).toBeGreaterThan(40);
      expect(
        curve.kink2,
        `sharpest corner on the way on at ${w}`
      ).toBeLessThanOrEqual(KINK2);
      expect(
        curve.bend24,
        `sharpest 24px bend on the way on at ${w}`
      ).toBeLessThanOrEqual(BEND24);
      /* 10°, and it is a measurement rather than a choice. A quarter ellipse
         is vertical only in the limit, and over the last 24px of arc its own
         dx/dy goes as run/drop**2: 2.9° at 1512, where the drop is long, and
         7.7° at 1375, where it is not. 7.7° is 3.2px of drift across those
         24px, which is under the hand's own wobble amplitude of 10 on the
         same line — so the ceiling is set where "vertical" stops being a
         fair description of what is drawn, not where the maths is exact. */
      expect(
        curve.arriveDeg,
        `it arrives going straight down at ${w}`
      ).toBeLessThanOrEqual(10);
      expect(
        curve.clear,
        `clearance from "${curve.worst}" at ${w}`
      ).toBeGreaterThanOrEqual(CLEAR);
    });
  }

  /* and the ending is on the page BEFORE anything is pressed, and it is
     SHUT: the hook is that a reader can see the run has somewhere else to
     go and something in the way of it. */
  test("before the press the boom is down and ¶13 does not exist", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await page.setViewportSize({ width: 1512, height: 982 });
    await toTheGate(page);
    const state = await page.evaluate(() => {
      const wall = document.getElementById("gateWall")!.getBoundingClientRect();
      const pts = window.__onwardPath!();
      const end = pts[pts.length - 1];
      const morning = document.getElementById("nextmorning")!;
      return {
        approved: window.__world.approved,
        onward: pts.length,
        boom: window.__world.boom,
        /* the line stops SHORT of the wall, against the boom */
        endAboveWall: wall.top + wall.height / 2 + window.scrollY - end.y,
        endOnCentre: Math.abs(end.x - (wall.left + wall.width / 2)),
        /* the day's rail is untouched by it: __rail() still ends at the socket */
        railEndsAtSocket: (() => {
          const s = window.__rail!();
          const sq = document
            .querySelector("#gateDock i")!
            .getBoundingClientRect();
          const last = s[s.length - 1];
          return (
            Math.abs(last.x - (sq.left + sq.width / 2)) < 1 &&
            Math.abs(last.y - (sq.top + window.scrollY + sq.height / 2)) < 2
          );
        })(),
        dawnHeight: morning.getBoundingClientRect().height,
        inert: morning.hasAttribute("inert"),
        ariaHidden: morning.getAttribute("aria-hidden"),
        gateopen: document.body.classList.contains("gateopen"),
        label: (
          document.querySelector(".gateway .ladder.dep .st")!.textContent || ""
        ).trim(),
      };
    });
    expect(state.approved).toBe(false);
    expect(
      state.onward,
      "the way on is drawn before the press"
    ).toBeGreaterThan(40);
    expect(state.boom, "the boom is down before the press").toBe(0);
    expect(
      state.endAboveWall,
      "the line stops against the boom, not at the wall"
    ).toBeGreaterThan(4);
    expect(state.endAboveWall, "and it stops within a bead of it").toBeLessThan(
      24
    );
    expect(
      state.endOnCentre,
      "the line arrives in the middle of the doorway"
    ).toBeLessThanOrEqual(2);
    expect(
      state.railEndsAtSocket,
      "the day's rail still ends at the socket"
    ).toBe(true);
    /* ¶13 IS NOT THERE. Zero height, out of the focus order and out of the
       accessibility tree: the page genuinely stops at the wall. */
    expect(state.dawnHeight, "¶13 has no height before the press").toBe(0);
    expect(state.inert, "¶13 is out of the focus order").toBe(true);
    expect(state.ariaHidden, "¶13 is out of the accessibility tree").toBe(
      "true"
    );
    expect(state.gateopen).toBe(false);
    expect(state.label).toBe("run 043 · held for a person");
  });
});

/* ══════════════════════════════════════════════════════════════════════
   the press · the chain, and what it is allowed to do
   ══════════════════════════════════════════════════════════════════════ */
test.describe("¶12 · a hand lifts the boom", () => {
  /* THE STAMPS ARE WRITTEN BY THE DRAWING, NOT BY THE SCHEDULE. __world.marks
     is set from the code that draws each beat — the frame the head reaches
     rest, the frame the boom's angle first leaves zero, the moment a bird
     element is inserted — so this test cannot pass by reading back the
     setTimeouts that scheduled it. The 50ms between contact and the lift is
     what makes the arrival visibly CAUSE the lift; frames quantise it, so
     the window is a frame either side. */
  test("the order of events", async ({ page }, testInfo) => {
    testInfo.setTimeout(180_000);
    await toTheGate(page);
    /* ¶13 SAMPLED AT THE MOMENT OF CONTACT, not only before the press. The
       claim is that the page genuinely stops at the wall for the whole of
       the run's journey to it, and "it was inert before I clicked" does not
       say that. */
    const atContact = page.evaluate(
      () =>
        new Promise<{ height: number; inert: boolean; gateopen: boolean }>(
          (done) => {
            const tick = () => {
              if (window.__world.marks.contact === undefined)
                return requestAnimationFrame(tick);
              const m = document.getElementById("nextmorning")!;
              done({
                height: m.getBoundingClientRect().height,
                inert: m.hasAttribute("inert"),
                gateopen: document.body.classList.contains("gateopen"),
              });
            };
            tick();
          }
        )
    );
    await page.click("#approve");
    const held = await atContact;
    expect(held.height, "¶13 has no height when the run reaches the boom").toBe(
      0
    );
    expect(held.inert, "and it is still out of the focus order").toBe(true);
    expect(held.gateopen).toBe(false);

    await page.waitForTimeout(3400);
    const m = await page.evaluate(() => window.__world.marks);

    for (const k of [
      "contact",
      "boom",
      "bird",
      "through",
      "label",
      "open",
      "carry",
    ])
      expect(m[k], `${k} happened`).toBeGreaterThan(0);
    expect(m.boom, "the boom lifts after the run touches it").toBeGreaterThan(
      m.contact
    );
    expect(
      m.boom - m.contact,
      "and it lifts because of it, within a beat"
    ).toBeLessThanOrEqual(120);
    expect(
      m.bird,
      "the first bird comes up after the boom has started to lift"
    ).toBeGreaterThan(m.boom);
    expect(m.through, "the line goes through after the birds").toBeGreaterThan(
      m.bird
    );
    expect(
      m.label,
      "the label changes after the line is through"
    ).toBeGreaterThan(m.through);
    expect(m.open, "¶13 comes into existence after the label").toBeGreaterThan(
      m.label
    );
    expect(
      m.carry,
      "and the page only moves the reader once there is somewhere to go"
    ).toBeGreaterThan(m.open);
  });

  /* THE PAGE DOES NOT MOVE UNDER THE READER while the boom is still down.
     There is nothing below the wall to scroll to until ¶13 exists, and it
     does not exist until 2450. Sampled every frame rather than at the end,
     because the carry's own easing would hide a jump at the start.
     The scroll comparison is a tolerance: WebKit and Firefox report a
     fractional maximum scroll on this document. */
  test("nothing scrolls before the gate opens", async ({ page }, testInfo) => {
    testInfo.setTimeout(180_000);
    await toTheGate(page);
    const before = await page.evaluate(() => window.scrollY);
    await page.click("#approve");
    const held = await page.evaluate(async () => {
      const y0 = window.scrollY;
      const t0 = performance.now();
      let moved: [number, number] | null = null;
      await new Promise<void>((done) => {
        const tick = () => {
          const t = performance.now() - t0;
          if (Math.abs(window.scrollY - y0) > 1 && !moved)
            moved = [Math.round(t), window.scrollY];
          if (t < 2400) requestAnimationFrame(tick);
          else done();
        };
        tick();
      });
      return { y0, moved };
    });
    expect(held.moved, "nothing scrolled before the gate opened").toBeNull();
    expect(held.y0).toBeCloseTo(before, 0);
  });

  /* THE BIRDS COME UP THROUGH THE DOORWAY AND GO EAST, and no bird is ever
     seen end on. An 88x34 silhouette at 60° of pitch is a slash, and three
     of them read as letters — the "vertical blades" defect. The caps are
     enforced in the geometry rather than tuned, so this is the gate on the
     enforcement. */
  test("the flock leaves through the doorway", async ({ page }, testInfo) => {
    testInfo.setTimeout(180_000);
    await toTheGate(page);
    await page.click("#approve");
    await page.waitForTimeout(2200);
    const flock = await page.evaluate(() => {
      const g = document.getElementById("gateWall")!.getBoundingClientRect();
      const f = window.__world.flockFrom!;
      const chords: number[][] = [];
      document.querySelectorAll(".bird").forEach((el) => {
        const d = (el as HTMLElement).style.offsetPath || "";
        const nums = d.match(/-?\d+(?:\.\d+)?/g);
        if (!nums || nums.length < 14) return;
        const p: [number, number][] = [];
        for (let i = 0; i < 14; i += 2) p.push([+nums[i], +nums[i + 1]]);
        const a: number[] = [];
        for (let k = 1; k < p.length; k++)
          a.push(
            (Math.abs(
              Math.atan2(p[k][1] - p[k - 1][1], p[k][0] - p[k - 1][0])
            ) *
              180) /
              Math.PI
          );
        chords.push(a);
      });
      return {
        n: document.querySelectorAll(".bird").length,
        dx: Math.abs(f.fx * window.innerWidth - (g.left + g.width / 2)),
        /* they launch BELOW the wall, on the far side, and come up through */
        belowWall: f.fy * window.innerHeight - (g.top + g.height / 2) > 12,
        west: document.getElementById("flock")!.classList.contains("west"),
        eastward: chords.length
          ? Math.min(
              ...[...document.querySelectorAll(".bird")].map((el) => {
                const nums = ((el as HTMLElement).style.offsetPath || "").match(
                  /-?\d+(?:\.\d+)?/g
                );
                return nums ? +nums[12] - +nums[0] : 0;
              })
            )
          : 0,
        firstMax: Math.max(...chords.map((a) => a[0])),
        /* the first chord IS the first tangent and has its own, looser cap:
           a bird does pitch up leaving the ground */
        restMax: Math.max(...chords.map((a) => a.slice(1)).flat()),
      };
    });
    expect(flock.n, "nine on a desktop, six on a phone").toBeGreaterThanOrEqual(
      6
    );
    expect(flock.n, "and never a cloud of them").toBeLessThanOrEqual(9);
    expect(flock.dx, "they leave from the doorway").toBeLessThanOrEqual(4);
    expect(flock.belowWall, "from the far side of the wall").toBe(true);
    expect(flock.west, "the west mirror is retired with the corner door").toBe(
      false
    );
    expect(
      flock.eastward,
      "every bird ends east of where it started"
    ).toBeGreaterThan(0);
    expect(
      flock.firstMax,
      "no bird's first tangent is over 50°"
    ).toBeLessThanOrEqual(50);
    expect(
      flock.restMax,
      "no chord after the first is over 40°"
    ).toBeLessThanOrEqual(40);
  });

  /* AN UNARMED PRESS NEVER APPROVES. The control keeps its seat in the focus
     order while the run is still arriving, so the press has to reach the
     handler to be answered — and answering is all it may do. */
  test("an unarmed press only updates the note", async ({ page }, testInfo) => {
    testInfo.setTimeout(120_000);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
    /* THE BUTTON HAS TO BE IN VIEW AND THE RUN HAS TO BE STILL ARRIVING, and
       a fixed offset gives neither reliably. At 1440 the button is off the
       bottom 400px above the end, so the click scrolls it into view first —
       measured on webkit-desktop, it scrolls the whole 400, arms the ratchet
       on the way and then approves the run, which is the page behaving
       correctly and the test asserting nothing. The seat is computed from the
       button's own layout box instead: its bottom 24px above the fold, and
       never inside the arming window. */
    const seat = await page.evaluate(() => {
      const absTop = (el: HTMLElement | null): number => {
        let y = 0;
        while (el) {
          y += el.offsetTop;
          el = el.offsetParent as HTMLElement | null;
        }
        return y;
      };
      const btn = document.getElementById("approve")!;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const wanted = absTop(btn) + btn.offsetHeight + 24 - window.innerHeight;
      const top = Math.min(max - 30, Math.max(0, wanted));
      window.scrollTo({ top, behavior: "instant" });
      return { gap: max - top };
    });
    await page.waitForTimeout(500);
    const before = await page.evaluate(() => ({
      armed: window.__world.armed,
      aria: document.getElementById("approve")!.getAttribute("aria-disabled"),
      inView: (() => {
        const r = document.getElementById("approve")!.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= window.innerHeight;
      })(),
    }));
    expect(seat.gap, "the seat is clear of the arming window").toBeGreaterThan(
      24
    );
    expect(before.inView, "and the button is in view at it").toBe(true);
    expect(before.armed, "the run has not docked").toBe(false);
    expect(before.aria, "and the button says so").toBe("true");

    /* FORCE, and it is not a shortcut. The runner reads aria-disabled as "not
       enabled" and will never dispatch: measured, an unforced click here waits
       out its full 30s timeout on every project. A real pointer has no such
       policy — the control is not `disabled`, so a real press reaches the
       handler, which is the whole reason it is aria-disabled and not disabled.
       `force` dispatches the real input events at the real position; it skips
       the actionability poll, not the click. */
    await page.click("#approve", { force: true });
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => ({
      approved: window.__world.approved,
      disabled: (document.getElementById("approve") as HTMLButtonElement)
        .disabled,
      birds: document.querySelectorAll(".bird").length,
      dawn: document.getElementById("nextmorning")!.getBoundingClientRect()
        .height,
      note: (document.getElementById("gateNote")!.textContent || "").trim(),
      gateopen: document.body.classList.contains("gateopen"),
    }));
    expect(after.approved, "an unarmed press never approves").toBe(false);
    expect(after.gateopen).toBe(false);
    expect(after.birds, "and starts nothing").toBe(0);
    expect(after.dawn, "and ¶13 still does not exist").toBe(0);
    expect(after.disabled, "and the control is still usable").toBe(false);
    expect(after.note).toBe(
      "the run is still arriving. this button arms when it gets here."
    );
  });

  /* THE RATCHET, AND WHAT IT IS FOR. Stepped from 700px above the end to the
     end in 10px steps: whenever the button is armed, the ring, the button,
     the boom and the label must all be fully in view — an early press would
     otherwise play 2.4 seconds of a wall the reader cannot see. */
  test.describe("arming", () => {
    // eslint-disable-next-line no-empty-pattern
    test.beforeEach(({}, testInfo) => geometryOnly(testInfo));
    for (const [w, h] of [...DESKTOP, [390, 844] as [number, number]]) {
      test(`the run arms the button in view at ${w}`, async ({
        page,
      }, testInfo) => {
        testInfo.setTimeout(180_000);
        await page.setViewportSize({ width: w, height: h });
        await page.goto("/");
        await page.evaluate(() => document.fonts.ready);
        await page.locator('[data-beat="0"]').waitFor({ state: "attached" });
        const walk = await page.evaluate(async () => {
          const max =
            document.documentElement.scrollHeight - window.innerHeight;
          let firstArmed: number | null = null;
          let worst = Infinity;
          for (let d = 700; d >= 0; d -= 10) {
            window.scrollTo({ top: max - d, behavior: "instant" });
            await new Promise((r) =>
              requestAnimationFrame(() => requestAnimationFrame(r))
            );
            if (!window.__world.armed) continue;
            if (firstArmed === null) firstArmed = d;
            const g = document
              .getElementById("gateWall")!
              .getBoundingClientRect();
            const btn = document
              .getElementById("approve")!
              .getBoundingClientRect();
            const sq = document
              .getElementById("gateDock")!
              .getBoundingClientRect();
            const lab = document
              .querySelector(".gateway .ladder.dep")!
              .getBoundingClientRect();
            const ringTop = sq.top + sq.height / 2 - 16;
            const ringBot = sq.top + sq.height / 2 + 16;
            worst = Math.min(
              worst,
              ringTop,
              btn.top,
              g.top - 14 /* the boom stands 5px proud, on 14px of post */,
              lab.top,
              window.innerHeight - ringBot,
              window.innerHeight - btn.bottom,
              window.innerHeight - (g.bottom + 8),
              window.innerHeight - lab.bottom
            );
          }
          return { firstArmed, worst };
        });
        expect(
          walk.firstArmed,
          `the button arms at all at ${w}`
        ).not.toBeNull();
        expect(
          walk.firstArmed,
          `and only at the end of the run at ${w}`
        ).toBeLessThanOrEqual(30);
        expect(
          walk.worst,
          `ring, button, boom and label all in view whenever armed at ${w}`
        ).toBeGreaterThan(0);
      });
    }
  });

  /* THE OTHER HALF OF THE GUARD, and the half nobody would find by reading.
     Reduced motion is one way in; the other is a gateway that never laid out,
     which is what a display:none, a failed font or a zero-width column would
     produce. buildOnward returns with onward.ready false, and the reader must
     still be given the morning at once with nothing left half drawn. */
  test("with no path to run, the press still opens the gate", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await toTheGate(page);
    await page.evaluate(() => {
      document.getElementById("gateWall")!.style.display = "none";
    });
    /* a resize is what rebuilds the thread, and it is synchronous */
    const vp = page.viewportSize()!;
    await page.setViewportSize({ width: vp.width - 1, height: vp.height });
    await page.waitForTimeout(400);
    await page.evaluate(() =>
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      })
    );
    await page.waitForTimeout(400);
    await page.click("#approve", { force: true });
    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              document.getElementById("nextmorning")!.getBoundingClientRect()
                .height
          ),
        { message: "¶13 grows within 1s with no path to run", timeout: 1000 }
      )
      .toBeGreaterThan(0);
    const g = await page.evaluate(() => ({
      ready: window.__world.departure.ready,
      birds: document.querySelectorAll(".bird").length,
      gateopen: document.body.classList.contains("gateopen"),
      released: window.__world.released,
      label: (
        document.querySelector(".gateway .ladder.dep .st")!.textContent || ""
      ).trim(),
    }));
    expect(g.ready, "the path could not be built").toBe(false);
    expect(g.gateopen, "and the gate opened anyway").toBe(true);
    expect(g.released, "drawn at its finished frame").toBe(true);
    expect(g.birds, "no half flight out of a doorway that was not built").toBe(
      0
    );
    expect(g.label).toBe("run 043 · open");
  });

  /* THE GUARD. Reduced motion has nothing to watch, so it is given
     everything at once — and it must be given the morning, not left to find
     it: wake() returns immediately under RM, so frame(), the only writer of
     body.atmorning, never runs. */
  test.describe("reduced motion", () => {
    test("everything at once, and never a bird", async ({ page }, testInfo) => {
      testInfo.setTimeout(120_000);
      /* emulateMedia rather than test.use: the project fixtures this file
         runs under are typed without a reducedMotion option, and the media
         emulation is what the page actually reads. */
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      await page.locator("#approve").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      /* armed at boot: the settled world has no travelling token to dock,
         and a reader who asked for less motion must not get less page */
      expect(await page.evaluate(() => window.__world.armed)).toBe(true);
      const t0 = Date.now();
      await page.click("#approve");
      await expect
        .poll(
          () =>
            page.evaluate(
              () =>
                document.getElementById("nextmorning")!.getBoundingClientRect()
                  .height
            ),
          { message: "¶13 grows within 1s under the guard", timeout: 1000 }
        )
        .toBeGreaterThan(0);
      expect(Date.now() - t0, "and it is not a slow path").toBeLessThan(1500);
      const rm = await page.evaluate(() => ({
        birds: document.querySelectorAll(".bird").length,
        released: window.__world.released,
        gateopen: document.body.classList.contains("gateopen"),
        morningReachable: !document
          .getElementById("nextmorning")!
          .hasAttribute("inert"),
        ariaHidden: document
          .getElementById("nextmorning")!
          .getAttribute("aria-hidden"),
        filed: document.getElementById("manifest")!.classList.contains("filed"),
        label: (
          document.querySelector(".gateway .ladder.dep .st")!.textContent || ""
        ).trim(),
        note: document.getElementById("gateNote")!.textContent || "",
        role: document.getElementById("gateNote")!.getAttribute("role"),
      }));
      expect(rm.birds, "no flock under reduced motion").toBe(0);
      expect(rm.released, "the gate is drawn at its finished frame").toBe(true);
      expect(rm.gateopen, "the gate is open at once").toBe(true);
      expect(rm.morningReachable, "¶13 is reachable").toBe(true);
      expect(rm.ariaHidden, "¶13 is in the accessibility tree").toBeNull();
      expect(rm.filed, "the manifest is filed").toBe(true);
      expect(rm.label).toBe("run 043 · open");
      expect(rm.note).toMatch(/approved by hand at \d\d:\d\d/);
      expect(rm.role, "the press is announced, not only seen").toBe("status");
    });
  });

  /* THE CLOSING LINE OF THE PAPER was set uppercase, tracked out and held at
     opacity .55 over --ink-2 — a partial opacity no contrast gate can see,
     on the last sentence a reader meets. */
  test("¶13's closing line is readable", async ({ page }, testInfo) => {
    testInfo.setTimeout(120_000);
    geometryOnly(testInfo);
    await page.setViewportSize({ width: 1512, height: 982 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.locator("#approve").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.click("#approve");
    await page.waitForTimeout(600);
    const t = await page.evaluate(() => {
      const el = document.querySelector(".dawnrun")!;
      const cs = getComputedStyle(el);
      const mv = el.querySelector(".mv")!;
      return {
        px: parseFloat(cs.fontSize),
        opacity: +cs.opacity,
        transform: cs.textTransform,
        family: cs.fontFamily.toLowerCase(),
        mvFamily: getComputedStyle(mv).fontFamily.toLowerCase(),
        text: (el.textContent || "").trim(),
      };
    });
    expect(t.px, "at least 12px").toBeGreaterThanOrEqual(12);
    expect(t.opacity, "no partial opacity on type").toBe(1);
    expect(t.transform, "sentence case, not shouted").toBe("none");
    expect(t.family, "a sentence is set in the text face").toContain(
      "newsreader"
    );
    expect(t.mvFamily, "and the serial is a machine value").toContain(
      "fragment mono"
    );
    expect(t.text).toBe("run 043 · not yet begun");
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
  // eslint-disable-next-line no-empty-pattern
  test.beforeEach(({}, testInfo) => geometryOnly(testInfo));

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
      await page.evaluate(
        (yy) => window.scrollTo({ top: yy, behavior: "instant" }),
        y
      );
      await page.waitForTimeout(40);
    }
    await page.evaluate(
      (yy) => window.scrollTo({ top: yy, behavior: "instant" }),
      top - 982 * 0.46
    );
    await page.waitForTimeout(500);

    const rows = await page.evaluate(() => {
      return [...document.querySelectorAll("#gatesFig .grow.gbench")].map(
        (row) => {
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
        }
      );
    });
    expect(rows.length).toBe(3);
    for (const r of rows) {
      /* THE CORRECTION, ASSERTED: no slip ever moves down. */
      expect(r.dy, `row ${r.g} has no vertical travel`).toBe(0);
      /* every verdict is stamped at the settled frame, and it is 0 or 1 */
      expect(r.wordOpacity, `row ${r.g} is stamped`).toBe(1);
      /* and every slip still stands on its own bed */
      expect(
        Math.abs(r.slipBottom - r.bedTop),
        `row ${r.g} stands on its bed`
      ).toBeLessThanOrEqual(1.5);
      if (r.passed)
        expect(r.dx, "the passed slip is out of its press").toBeGreaterThan(60);
      else expect(r.dx, `row ${r.g} stayed in its press`).toBe(0);
    }
    /* and the plate does not outgrow the prose beside it */
    const heights = await page.evaluate(() => {
      const plate = document
        .querySelector("#gatesFig")!
        .getBoundingClientRect();
      const prose = document
        .querySelector(".bhow .prose")!
        .getBoundingClientRect();
      return { plate: plate.height, prose: prose.height };
    });
    expect(
      heights.plate,
      "fig. 10 is shorter than the prose column"
    ).toBeLessThan(heights.prose);
  });
});
