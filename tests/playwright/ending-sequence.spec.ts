import { expect, test, type Page, type TestInfo } from "@playwright/test";

/**
 * ¶12's ending, measured in a browser: one aligned object, one filled
 * control, and what a hand starts by pressing it.
 *
 * WHY A FILE OF ITS OWN. Everything here is about ONE station and about a
 * sequence that only exists after a click, which is a different kind of
 * assertion from reading-gates.spec.ts (geometry of the page as served) and
 * from run-home.spec.ts (the document's structure). It also has to click the
 * button, and a spec that approves the run cannot share a page with one that
 * measures the unapproved page.
 *
 * WHAT IT IS ACCOUNTABLE TO. The owner has rejected this ending five times,
 * and each rejection is an assertion below:
 *   · "drop the entire concept of extra rail as it not coming good" — the way
 *     on, the wall, the boom, the doorway, the far side's label and the whole
 *     travel sequence are gone, and this file proves they cannot come back by
 *     accident: no element, no probe hook, no world field.
 *   · "just organize the page good" — one grid, nothing floating, no band of
 *     empty paper under the last ink, and the station fits its viewport at
 *     every seat down to 1375×800.
 *   · "the approve run to be click bait" — one filled control, 150×60 at
 *     every width, never hollow and never disabled before it is spent.
 *   · "align the birds well, as what we have currently the birds are flying
 *     out the page" — every bird's own path is sampled analytically AND its
 *     rendered box is read every 300ms of the flight; both stay inside the
 *     frame, nose east, and inside the pitch cap.
 *   · "check the alignment" — the ring the canvas draws, the socket the rail
 *     docks in and the button's centre are ONE line, and they stay one line
 *     after a late layout change, which is the defect round 6 shipped.
 *
 * WHICH PROJECTS. The geometry is a claim about the design and runs on
 * chromium-desktop, for the same reason reading-gates does. The ORDER of the
 * chain, the removals and the guard are claims about behaviour and run on
 * every engine — and scroll positions are compared with a tolerance there,
 * because WebKit and Firefox report a fractional maximum scroll on this
 * document.
 *
 * WHY NO setViewportSize IN THE GEOMETRY BLOCKS. A resize rebuilds the rail's
 * geometry, and rebuilding it is exactly what the round-6 defect was missing:
 * measurements taken after a setViewportSize could not see a stale terminus
 * and reported the ending aligned at four widths while a real browser showed
 * the ring 33px above the button. Every seat below is a `test.use` viewport,
 * set before the page is ever loaded.
 */

declare global {
  interface Window {
    __world: {
      approved: boolean;
      halted: boolean;
      ring: { x: number; y: number } | null;
      released?: boolean;
      marks: Record<string, number>;
      flockFrom: { fx: number; fy: number } | null;
      departure: { t0: number; pace: number; tTail: number };
      /* the round-6 fields, declared so their ABSENCE can be asserted */
      boom?: number;
      armed?: boolean;
      /* round 8: the morning's ground and sky, published by the code that
         draws them */
      scape?: {
        W: number;
        H: number;
        hz: number;
        free: number;
        room: number;
        groups: number;
      };
      sky?: {
        spawned: number;
        live: number;
        entries: { entry: string; n: number; t: number }[];
      };
      ground?: { id: string; dx: number; x_off: number }[];
      /* round 14: every time the morning answered the reader */
      notice?: { who: string; what: string; t: number }[];
      /* when a swivel actually started, as opposed to when it was logged */
      swivelAt?: number;
    };
    __onwardPath?: () => { x: number; y: number; L: number }[];
    __rail?: () => { x: number; y: number }[];
  }
}

/** every seat the owner reads this page at, his own 1456×949 included */
const SEATS: [number, number][] = [
  [1512, 982],
  [1456, 949],
  [1440, 900],
  [1375, 800],
  [1280, 800],
  /* the MacBook seats in fullscreen, where round 10 was measured */
  [1728, 1117],
  [1800, 1169],
  [1920, 1080],
];

/** the short desktop sheets ¶13 must hold up at: the owner's own window at
    125% zoom (~1165×759), the 1366×768 and 1536×864 laptops recruiters use,
    and two lower still; check-dawnscape holds the same five */
const SHORT: [number, number][] = [
  [1165, 759],
  [1366, 768],
  [1536, 864],
  [1280, 720],
  [1024, 768],
];

/** the two seats a phone reader actually has, plus the Pixel 5 the
    chromium-mobile project emulates — 393×851, which is neither of them */
const PHONES: [number, number][] = [
  [390, 844],
  [393, 851],
  [320, 720],
];

/** geometry is a claim about the design, not about an engine */
const geometryOnly = (testInfo: TestInfo): void => {
  testInfo.skip(
    testInfo.project.name !== "chromium-desktop",
    "the ending's geometry is measured, not engine-dependent — chromium-desktop only"
  );
};

/** to the gate, with every builder run on the way down, and never a resize.
    `path` carries the run's own perf-lab flags, `?pace=0.25` for a sit. */
async function toTheGate(page: Page, path = "/"): Promise<void> {
  await page.goto(path);
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
  /* THE NAMEPLATE'S OWN PERFORMANCE IS PART OF THE LOAD. It ends by revealing
     its replay control, which adds ~33px to ¶01 about 4.1s in and moves every
     later station down with it. Waiting for data-np-ready is waiting for the
     page to have finished changing height, which is the state a reader is
     actually looking at when they reach the gate. */
  await page
    .waitForSelector("html[data-np-ready]", { timeout: 20_000 })
    .catch(() => {});
  await page.evaluate(() =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "instant",
    })
  );
  await page.waitForTimeout(600);
}

/** the ring the canvas DREW, the socket, and the button, in one read */
async function alignment(page: Page) {
  return page.evaluate(() => {
    const box = (sel: string) =>
      document.querySelector(sel)!.getBoundingClientRect();
    const btn = box("#approve");
    const sq = box("#gateDock i");
    const ring = window.__world.ring;
    return {
      /* the ring is published in PAGE space by the code that strokes it, so
         this is the ink and not the number the ink was meant to come from */
      ringX: ring ? ring.x : null,
      ringY: ring ? ring.y - window.scrollY : null,
      sqMid: sq.top + sq.height / 2,
      sqX: sq.left + sq.width / 2,
      sqLeft: sq.left,
      btnMid: btn.top + btn.height / 2,
      btnRight: btn.right,
      btnW: btn.width,
      btnH: btn.height,
    };
  });
}

/* ══════════════════════════════════════════════════════════════════════
   the still · what a reader meets before anything is pressed
   ══════════════════════════════════════════════════════════════════════ */
for (const [w, h] of SEATS) {
  test.describe(`¶12 · the last stop is one aligned object · ${w}×${h}`, () => {
    test.use({ viewport: { width: w, height: h } });
    // eslint-disable-next-line no-empty-pattern
    test.beforeEach(({}, testInfo) => geometryOnly(testInfo));

    test(`ring, socket and button are one line at ${w}×${h}`, async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(120_000);
      await toTheGate(page);
      const a = await alignment(page);

      expect(a.ringY, `the halt ring is drawn at ${w}`).not.toBeNull();
      /* offsetTop is an integer and a client rect is not, so the rail and the
         socket can sit half a pixel apart in honest agreement. 1px is the
         smallest tolerance that is not chasing that rounding. */
      expect(
        Math.abs(a.ringY! - a.sqMid),
        `ring on the socket at ${w}`
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(a.ringY! - a.btnMid),
        `ring on the button's centre at ${w}`
      ).toBeLessThanOrEqual(1);
      expect(
        Math.abs(a.ringX! - a.sqX),
        `ring on the socket's own x at ${w}`
      ).toBeLessThanOrEqual(1);
      /* 20px of clear paper, with 16px of outer ring inside it */
      expect(
        a.sqLeft - a.btnRight,
        `socket clear of the button at ${w}`
      ).toBeGreaterThanOrEqual(18);
      expect(a.btnW, `the button is 150 wide at ${w}`).toBeCloseTo(150, 0);
      expect(a.btnH, `the button is 60 tall at ${w}`).toBeCloseTo(60, 0);

      /* 22:41 SITS ON THE BUTTON'S OWN LINE, and the nudge that puts it
         there — .27em, on the hour rather than on the row — was tuned for a
         44px button with a .78rem label. The button is 60px with .84rem
         now, so this is re-measured rather than inherited: 1.0px at every
         desktop seat and −0.5px on the phone. The owner reads a sagging
         hour as the row coming apart, which is why it has its own claim. */
      const lines = await page.evaluate(() => {
        const base = (sel: string): number => {
          const el = document.querySelector(sel)!;
          const probe = document.createElement("span");
          probe.style.cssText =
            "display:inline-block;width:0;height:0;overflow:hidden";
          el.appendChild(probe);
          const y = probe.getBoundingClientRect().bottom;
          probe.remove();
          return y;
        };
        return {
          btn: base("#approve"),
          time: base(".approvebar .lt"),
          btnBottom: document.querySelector("#approve")!.getBoundingClientRect()
            .bottom,
          footBottom: document
            .querySelector(".b8 footer")!
            .getBoundingClientRect().bottom,
        };
      });
      expect(
        Math.abs(lines.time - lines.btn),
        `22:41 on the button's line at ${w}`
      ).toBeLessThanOrEqual(1.5);
      /* AND THE TWO COLUMNS CLOSE ON ONE PIXEL. The grid pulls the approve
         bar to the foot of the timetable and the colophon to the foot of the
         right column, so the screen ends on a single horizontal across its
         whole width. Measured identical to the tenth of a pixel at all five
         desktop seats — it is the composition's own claim, not a tolerance. */
      expect(
        Math.abs(lines.btnBottom - lines.footBottom),
        `both columns close on one line at ${w}`
      ).toBeLessThanOrEqual(1);
    });

    test(`the station is organised and fits at ${w}×${h}`, async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(120_000);
      await toTheGate(page);
      const fit = await page.evaluate(() => {
        const sec = document.querySelector("#gate")!.getBoundingClientRect();
        const kicker = document
          .querySelector("#gate .kicker")!
          .getBoundingClientRect();
        /* the last ink in the station, whatever it happens to be */
        let last = -Infinity;
        let below = 0;
        for (const el of document.querySelectorAll("#gate *")) {
          if (!el.children.length && (el.textContent || "").trim()) {
            const r = el.getBoundingClientRect();
            if (!r.width) continue;
            last = Math.max(last, r.bottom);
            if (r.bottom > window.innerHeight + 1 || r.top < -1) below++;
          }
        }
        return {
          kickerTop: kicker.top,
          kickerBottom: kicker.bottom,
          band: sec.bottom - last,
          below,
          overflow:
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
          morning: document
            .querySelector("#nextmorning")!
            .getBoundingClientRect().height,
        };
      });
      expect(fit.kickerTop, `the kicker is on screen at ${w}`).toBeGreaterThan(
        0
      );
      expect(fit.kickerBottom, `the kicker is on screen at ${w}`).toBeLessThan(
        h
      );
      /* no dead band under the composition — measured 60–73px across these
         five seats, against a ceiling that was set when the station still
         had a wall hanging off the bottom of it */
      expect(
        fit.band,
        `empty paper under the last ink at ${w}`
      ).toBeLessThanOrEqual(96);
      expect(
        fit.below,
        `every line of the station is inside the viewport at ${w}`
      ).toBe(0);
      expect(fit.overflow, `no horizontal overflow at ${w}`).toBe(0);
      expect(
        fit.morning,
        `¶13 has no height until the run is approved, at ${w}`
      ).toBe(0);
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════
   the same object on a phone, where the socket changes sides
   ══════════════════════════════════════════════════════════════════════ */
for (const [w, h] of PHONES) {
  test.describe(`¶12 · one aligned object on a phone · ${w}×${h}`, () => {
    test.use({ viewport: { width: w, height: h } });
    // eslint-disable-next-line no-empty-pattern
    test.beforeEach(({}, testInfo) => geometryOnly(testInfo));

    test(`ring, socket and button are one line at ${w}×${h}`, async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(120_000);
      await toTheGate(page);
      const a = await alignment(page);
      const extra = await page.evaluate(() => {
        const base = (sel: string): number => {
          const el = document.querySelector(sel)!;
          const probe = document.createElement("span");
          probe.style.cssText =
            "display:inline-block;width:0;height:0;overflow:hidden";
          el.appendChild(probe);
          const y = probe.getBoundingClientRect().bottom;
          probe.remove();
          return y;
        };
        const sq = document
          .querySelector("#gateDock i")!
          .getBoundingClientRect();
        const btn = document.querySelector("#approve")!.getBoundingClientRect();
        return {
          gutter: btn.left - sq.right,
          time: base(".approvebar .lt"),
          btn: base("#approve"),
          overflow:
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        };
      });

      expect(a.ringY, `the halt ring is drawn at ${w}`).not.toBeNull();
      /* 1.5, not 1: the ring is drawn at the socket's LAYOUT position (absTop
         sums integer offsetTops, by design, so an entrance transform mid-flight
         cannot bake into the rail), and at 320 the socket's client rect sits
         1.1px below that sum across its ancestors' subpixel tops. Measured
         identical on three commits. */
      expect(
        Math.abs(a.ringY! - a.sqMid),
        `ring on the socket at ${w}`
      ).toBeLessThanOrEqual(1.5);
      expect(
        Math.abs(a.ringY! - a.btnMid),
        `ring on the button's centre at ${w}`
      ).toBeLessThanOrEqual(
        1.5
      ); /* the same 1.1px at 320, the same reason as the socket above */
      expect(
        Math.abs(a.ringX! - a.sqX),
        `ring on the socket's own x at ${w}`
      ).toBeLessThanOrEqual(1);
      /* THE SOCKET CHANGES SIDES HERE. On a desktop it hangs 20px off the
         button's right edge; on a phone it steps back into the rail's own
         26px gutter, left of the whole content column, so the line arrives
         straight instead of swinging across to meet it. The desktop's
         `sqLeft - btnRight` is negative here by construction, and the claim
         that means anything is the clearance on the other side: measured
         82px at 390, 393 and 320 alike. */
      expect(
        extra.gutter,
        `the socket is clear of the button, in the gutter, at ${w}`
      ).toBeGreaterThanOrEqual(18);
      expect(a.btnW, `the button is 150 wide at ${w}`).toBeCloseTo(150, 0);
      expect(a.btnH, `the button is 60 tall at ${w}`).toBeCloseTo(60, 0);
      /* the hour's nudge is in em, so it holds where the faces scale
         together: measured −0.5px at 390 and −0.4px at 393 and 320 */
      expect(
        Math.abs(extra.time - extra.btn),
        `22:41 on the button's line at ${w}`
      ).toBeLessThanOrEqual(1.5);
      expect(extra.overflow, `no horizontal overflow at ${w}`).toBe(0);
    });
  });
}

/* ══════════════════════════════════════════════════════════════════════
   the alignment is DERIVED · the defect round 6 shipped
   ══════════════════════════════════════════════════════════════════════ */
test.describe("¶12 · the terminus follows the socket", () => {
  test.use({ viewport: { width: 1456, height: 949 } });
  // eslint-disable-next-line no-empty-pattern
  test.beforeEach(({}, testInfo) => geometryOnly(testInfo));

  test("a late layout change does not separate the ring from the button", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await toTheGate(page);
    const before = await alignment(page);
    expect(
      Math.abs(before.ringY! - before.btnMid),
      "aligned before anything moves"
    ).toBeLessThanOrEqual(1);

    /* THE REAL DEFECT, REPRODUCED DELIBERATELY. The page goes on growing
       after the rail is built — the nameplate's replay control alone adds
       ~33px to ¶01 about 4.1s in — and a terminus cached at boot stays where
       the socket used to be. A 37px block prepended to ¶01's own inner box
       is the same event with a number this test owns.

       IT HAS TO GO IN ¶01, and the first draft of this test put it in ¶02,
       where it proved nothing: `.bwho` is `min-height:118vh` and ¶02's
       content is 793px of a 1120px box, so the block was absorbed and
       NOTHING below it moved — a gate that passed on a page that had not
       changed. ¶01 is content-sized on every desktop seat, which is why the
       replay control moves the document from there in the first place.
       And it is NOT a resize: a resize rebuilds the geometry and would hide
       exactly what is being measured. */
    const grown = await page.evaluate(() => {
      const sock = () => {
        const r = document
          .querySelector("#gateDock i")!
          .getBoundingClientRect();
        return r.top + window.scrollY + r.height / 2;
      };
      const was = sock();
      const pad = document.createElement("div");
      pad.style.height = "37px";
      document.querySelector(".b1 .beat-inner")!.prepend(pad);
      return { moved: sock() - was };
    });
    /* the injection is only a reproduction if it actually moved the socket */
    expect(
      grown.moved,
      "the socket moved down the page"
    ).toBeGreaterThanOrEqual(30);
    await page.evaluate(
      () =>
        new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r()))
        )
    );
    await page.evaluate(() =>
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "instant",
      })
    );
    await page.waitForTimeout(400);

    const after = await alignment(page);
    /* in PAGE space, because the terminus is a page coordinate and the
       viewport-space comparison at max scroll reads the same number whether
       the page moved or not */
    const pageSpace = await page.evaluate(() => {
      const r = document.querySelector("#gateDock i")!.getBoundingClientRect();
      return {
        sock: r.top + window.scrollY + r.height / 2,
        ring: window.__world.ring ? window.__world.ring.y : null,
      };
    });
    expect(pageSpace.ring, "the ring is still drawn").not.toBeNull();
    expect(
      Math.abs(pageSpace.ring! - pageSpace.sock),
      "the terminus followed the socket down the page"
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(after.ringY! - after.btnMid),
      "and the ring is still on the button's centre"
    ).toBeLessThanOrEqual(1);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   the removals · every engine, because markup is not a matter of taste
   ══════════════════════════════════════════════════════════════════════ */
test.describe("¶12 · the extra rail is gone", () => {
  test("no wall, no boom, no doorway, no second path", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await toTheGate(page);
    const state = await page.evaluate(() => ({
      wall: document.querySelectorAll("#gateWall").length,
      gateway: document.querySelectorAll(".gateway").length,
      trip: document.querySelectorAll(".trip").length,
      dep: document.querySelectorAll(".ladder.dep").length,
      onward: typeof window.__onwardPath,
      boom: window.__world.boom,
      armed: window.__world.armed,
      text: document.getElementById("gate")!.innerText,
      dock: document.querySelectorAll("#gateDock").length,
      aria: document.getElementById("approve")!.getAttribute("aria-disabled"),
    }));
    expect(state.wall, "the wall's opening is gone").toBe(0);
    expect(state.gateway, "the gateway is gone").toBe(0);
    expect(state.trip, "the band the way on crossed is gone").toBe(0);
    expect(state.dep, "the far side's own ladder is gone").toBe(0);
    expect(state.onward, "the way on's probe hook is gone").toBe("undefined");
    expect(state.boom, "the boom is not a thing the world knows about").toBe(
      undefined
    );
    /* the arming went with the departure it was protecting: a hollow button
       is the opposite of what this control is for */
    expect(state.armed, "there is no arming left to be in").toBe(undefined);
    expect(state.aria, "the control is never aria-disabled").toBeNull();
    expect(state.text, "the far side is not named at the gate").not.toContain(
      "run 043"
    );
    expect(state.dock, "there is exactly one socket").toBe(1);
  });

  test("the ladder's last rung is 22:41, and a scroll never lights it", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await toTheGate(page);
    const l = await page.evaluate(() => {
      const rungs = [...document.querySelectorAll(".ladder li[data-ph]")];
      return {
        ph: rungs.map((li) => +(li as HTMLElement).dataset.ph!),
        lastIsBar: rungs[rungs.length - 1].classList.contains("approvebar"),
        lastHasButton: !!rungs[rungs.length - 1].querySelector("#approve"),
        lit: rungs
          .filter((li) => li.classList.contains("lit"))
          .map((li) => +(li as HTMLElement).dataset.ph!),
      };
    });
    /* check-beat-tables asserts this against the DOM at build time; this is
       the same claim in a browser, where DEPLOY_PH is actually derived */
    expect(l.ph, "one rung per stop of the run, in order").toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
    expect(l.lastIsBar, "and the last one is the approve bar").toBe(true);
    expect(l.lastHasButton, "which is the row the button is in").toBe(true);
    expect(
      l.lit,
      "22:41 is the one rung a scroll can never light"
    ).not.toContain(11);
  });

  test("contact is reachable without approving anything", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    await toTheGate(page);
    const reach = await page.evaluate(() => {
      const a = document.querySelector<HTMLAnchorElement>(
        "#gate footer a[href^='mailto:']"
      );
      if (!a) return null;
      const r = a.getBoundingClientRect();
      return {
        href: a.href,
        inView: r.width > 0 && r.top >= 0 && r.bottom <= window.innerHeight,
      };
    });
    expect(reach, "the colophon carries an address").not.toBeNull();
    expect(reach!.href).toContain("mailto:");
    expect(
      reach!.inView,
      "and it is on the screen the reader is already looking at"
    ).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   the press · the only path into the morning
   ══════════════════════════════════════════════════════════════════════ */
test.describe("¶12 · a hand ends the run", () => {
  test("the press stamps, lights the day and opens the morning, in that order", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(150_000);
    await toTheGate(page);
    const before = await page.evaluate(() => ({
      morning: document.getElementById("nextmorning")!.getBoundingClientRect()
        .height,
      inert: document.getElementById("nextmorning")!.hasAttribute("inert"),
      atgate: document.body.classList.contains("atgate"),
    }));
    expect(before.morning, "¶13 has no height before the press").toBe(0);
    expect(before.inert, "and is out of the focus order").toBe(true);
    /* the waiting mark on the button runs only while the gate is on screen */
    expect(before.atgate, "the button is waiting").toBe(true);

    await page.locator("#approve").click();
    await page.waitForTimeout(400);
    const mid = await page.evaluate(() => ({
      approved: window.__world.approved,
      stamped: document.getElementById("stamp")!.classList.contains("inked"),
      note: document.getElementById("gateNote")!.textContent ?? "",
      lit: [...document.querySelectorAll(".ladder li[data-ph].lit")].map(
        (li) => +(li as HTMLElement).dataset.ph!
      ),
      atgate: document.body.classList.contains("atgate"),
      spent: (document.getElementById("approve") as HTMLButtonElement).disabled,
    }));
    expect(mid.approved, "the world knows").toBe(true);
    expect(mid.stamped, "the ink lands").toBe(true);
    expect(mid.note, "and the note becomes the record of the press").toMatch(
      /^approved by hand at \d\d:\d\d, your local time\.$/
    );
    expect(mid.lit, "the day reads itself back, all of it but 22:41").toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(mid.atgate, "the waiting mark stops the moment it is answered").toBe(
      false
    );
    expect(mid.spent, "and the control is spent").toBe(true);

    await expect
      .poll(
        () =>
          page.evaluate(() => document.body.classList.contains("atmorning")),
        { timeout: 20_000, message: "the page lands on the morning" }
      )
      .toBe(true);

    const end = await page.evaluate(() => ({
      marks: window.__world.marks,
      morning: document.getElementById("nextmorning")!.getBoundingClientRect()
        .height,
      inert: document.getElementById("nextmorning")!.hasAttribute("inert"),
      hidden: document
        .getElementById("nextmorning")!
        .hasAttribute("aria-hidden"),
    }));
    /* the run's own stamps, written by the code that DRAWS each beat rather
       than by the timers that scheduled it — a test that reads the schedule
       back passes by construction and proves nothing about what happened */
    expect(end.marks.bird, "the birds leave first").toBeLessThan(
      end.marks.open
    );
    expect(
      end.marks.open,
      "then the morning comes into existence"
    ).toBeLessThanOrEqual(end.marks.carry);
    expect(end.morning, "¶13 has height now").toBeGreaterThan(0);
    expect(end.inert, "and is in the focus order").toBe(false);
    expect(end.hidden, "and in the accessibility tree").toBe(false);
    /* measured: body.atmorning lands and .dawnrow is at opacity 0 until
       1s later, 1 by 1.9s (the arrival stagger's own delay and fade), so a
       sample at 0ms reads 0 while nobody is ever left without the address */
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const el = document.getElementById("mail");
            if (!el) return 0;
            let o = 1;
            let n: HTMLElement | null = el;
            while (n && n.nodeType === 1) {
              const v = parseFloat(getComputedStyle(n).opacity);
              if (!Number.isNaN(v)) o *= v;
              n = n.parentElement;
            }
            return o;
          }),
        { timeout: 6_000, message: "and its address is readable" }
      )
      .toBeGreaterThan(0.9);
  });

  test("a second press changes nothing", async ({ page }, testInfo) => {
    testInfo.setTimeout(150_000);
    await toTheGate(page);
    await page.locator("#approve").click();
    await page.waitForTimeout(600);
    const once = await page.evaluate(() => ({
      t0: window.__world.departure.t0,
      note: document.getElementById("gateNote")!.textContent,
    }));
    /* the control is disabled by the first press, so this reaches the
       handler only if something has gone wrong — which is the point */
    await page.evaluate(() => document.getElementById("approve")!.click());
    await page.waitForTimeout(300);
    const twice = await page.evaluate(() => ({
      t0: window.__world.departure.t0,
      note: document.getElementById("gateNote")!.textContent,
    }));
    expect(twice.t0, "the clock did not restart").toBe(once.t0);
    expect(twice.note, "and the record was not rewritten").toBe(once.note);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   the flock · in frame, nose east, never a blade
   ══════════════════════════════════════════════════════════════════════ */
test.describe("¶12 · the birds stay in the sky the reader can see", () => {
  /* the paths themselves, sampled off each bird's real SVGPathElement rather
     than re-derived from the numbers that built them */
  const measurePaths = (page: Page) =>
    page.evaluate(() => {
      const out: { pitch: number; minDx: number; outside: number }[] = [];
      for (const el of document.querySelectorAll<HTMLElement>(".bird")) {
        const d = (el.style.offsetPath || "").replace(/^path\("|"\)$/g, "");
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        const pe = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        pe.setAttribute("d", d);
        svg.appendChild(pe);
        document.body.appendChild(svg);
        const len = pe.getTotalLength();
        const s = parseFloat(el.style.getPropertyValue("--s"));
        /* the silhouette is 88×34 about an anchor 30/17 into it: 46 to the
           right of the anchor, 20 above it. A centre inside the frame with a
           wing outside it is still a bird flying off the page. */
        const padX = 46 * s;
        const padY = 20 * s;
        let pitch = 0;
        let minDx = Infinity;
        let outside = 0;
        let prev = pe.getPointAtLength(0);
        for (let i = 1; i <= 120; i++) {
          const q = pe.getPointAtLength((len * i) / 120);
          const dx = q.x - prev.x;
          const dy = q.y - prev.y;
          minDx = Math.min(minDx, dx);
          pitch = Math.max(
            pitch,
            Math.abs((Math.atan2(-dy, Math.abs(dx)) * 180) / Math.PI)
          );
          if (
            q.x - padX < 0 ||
            q.x + padX > window.innerWidth ||
            q.y - padY < 0 ||
            q.y + padY > window.innerHeight
          )
            outside++;
          prev = q;
        }
        svg.remove();
        out.push({ pitch, minDx, outside });
      }
      return out;
    });

  const checkPaths = (
    paths: { pitch: number; minDx: number; outside: number }[],
    where: string
  ): void => {
    expect(paths.length, `the flock left at ${where}`).toBeGreaterThanOrEqual(
      6
    );
    for (const [i, q] of paths.entries()) {
      expect(q.outside, `bird ${i} never leaves the frame at ${where}`).toBe(0);
      /* a leftward leg under offset-rotate:auto flies the bird upside down */
      expect(q.minDx, `bird ${i} always goes east at ${where}`).toBeGreaterThan(
        0
      );
      /* measured across every seat: 38.1–38.4° from 1280×800 to 1512×982,
         46.7° at 390×844 and 47.2° at 320×720. The phone is steeper because
         a narrow sky gives a climb far less room to lean out in, and the bow
         is scaled back to pay for it. 50 is the ceiling; past it an 88×34
         silhouette reads as a blade. */
      expect(
        q.pitch,
        `bird ${i} is never stood on end at ${where}`
      ).toBeLessThanOrEqual(50);
    }
  };

  for (const [w, h] of [...SEATS, ...PHONES]) {
    test.describe(`at ${w}×${h}`, () => {
      test.use({ viewport: { width: w, height: h } });
      // eslint-disable-next-line no-empty-pattern
      test.beforeEach(({}, testInfo) => geometryOnly(testInfo));

      test(`every path stays in the frame at ${w}×${h}`, async ({
        page,
      }, testInfo) => {
        testInfo.setTimeout(150_000);
        await toTheGate(page);
        await page.locator("#approve").click();
        await page.waitForTimeout(900);
        checkPaths(await measurePaths(page), `${w}×${h}`);
      });
    });
  }

  test("every path stays in the frame on the phone", async ({
    page,
  }, testInfo) => {
    testInfo.skip(
      testInfo.project.name !== "chromium-mobile",
      "the phone's own sky, at the project's own device"
    );
    testInfo.setTimeout(150_000);
    await toTheGate(page);
    await page.locator("#approve").click();
    await page.waitForTimeout(900);
    const vp = page.viewportSize()!;
    checkPaths(await measurePaths(page), `${vp.width}×${vp.height}`);
  });

  test("every bird is in frame at every 300ms of the flight", async ({
    page,
  }, testInfo) => {
    testInfo.skip(
      !/^(chromium-desktop|chromium-mobile)$/.test(testInfo.project.name),
      "one desktop seat and one phone seat is the whole claim"
    );
    testInfo.setTimeout(180_000);
    await toTheGate(page);
    await page.locator("#approve").click();

    const READ = () => {
      const out: number[][] = [];
      for (const el of document.querySelectorAll(".bird")) {
        const svg = el.querySelector("svg");
        if (!svg) continue;
        const r = svg.getBoundingClientRect();
        let o = 1;
        let n: HTMLElement | null = el as HTMLElement;
        while (n && n.nodeType === 1) {
          const v = parseFloat(getComputedStyle(n).opacity);
          if (!Number.isNaN(v)) o *= v;
          n = n.parentElement;
        }
        /* a bird at no ink is not on the screen and is not measured */
        if (o < 0.02 || r.width < 1) continue;
        out.push([r.left, r.top, r.right, r.bottom]);
      }
      return out;
    };

    let seen = 0;
    const escapes: string[] = [];
    for (let i = 0; i < 32; i++) {
      const rects = await page.evaluate(READ);
      seen = Math.max(seen, rects.length);
      const vp = page.viewportSize()!;
      for (const [l, t, r, b] of rects) {
        /* 2px of slack for subpixel layout and the engine's own rounding */
        if (l < -2 || t < -2 || r > vp.width + 2 || b > vp.height + 2)
          escapes.push(
            `frame ${i}: [${Math.round(l)},${Math.round(t)},${Math.round(
              r
            )},${Math.round(b)}] outside ${vp.width}×${vp.height}`
          );
      }
      await page.waitForTimeout(300);
    }
    expect(seen, "there were birds to measure").toBeGreaterThanOrEqual(6);
    expect(escapes, "no bird leaves the viewport").toEqual([]);
  });

  test("they leave from the ring", async ({ page }, testInfo) => {
    testInfo.setTimeout(150_000);
    await toTheGate(page);
    const ring = await page.evaluate(() => {
      const r = document.querySelector("#gateDock i")!.getBoundingClientRect();
      return {
        fx: (r.left + r.width / 2) / window.innerWidth,
        fy: (r.top + r.height / 2) / window.innerHeight,
      };
    });
    await page.locator("#approve").click();
    await expect
      .poll(() => page.evaluate(() => window.__world.flockFrom != null), {
        timeout: 15_000,
        message: "the flock was released",
      })
      .toBe(true);
    const from = (await page.evaluate(() => window.__world.flockFrom))!;
    /* the launch point is the socket's own box, clamped only by the sky's
       edges — so on every seat it should BE the socket */
    expect(
      Math.abs(from.fx - ring.fx),
      "they leave at the ring's x"
    ).toBeLessThan(0.02);
    expect(Math.abs(from.fy - ring.fy), "and at the ring's y").toBeLessThan(
      0.02
    );
  });
});

/* ══════════════════════════════════════════════════════════════════════
   the guard · a reader who asked for less motion is not given less page
   ══════════════════════════════════════════════════════════════════════ */
test.describe("¶12 · reduced motion goes straight to the morning", () => {
  test("the press resolves everything at once, with nothing left moving", async ({
    page,
  }, testInfo) => {
    testInfo.setTimeout(120_000);
    /* emulateMedia before the navigation, not test.use — run-home.spec.ts
       records that the context-level option did not reach the page. */
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("body")).toHaveClass(/\bsettled\b/);
    await page.locator("#approve").scrollIntoViewIfNeeded();
    await page.locator("#approve").click();
    await page.waitForTimeout(500);

    const rm = await page.evaluate(() => ({
      atmorning: document.body.classList.contains("atmorning"),
      gateopen: document.body.classList.contains("gateopen"),
      released: window.__world.released,
      birds: document.querySelectorAll(".bird").length,
      running: document.getAnimations().filter((a) => a.playState === "running")
        .length,
      inert: document.getElementById("nextmorning")!.hasAttribute("inert"),
      mail: !!document.getElementById("mail"),
    }));
    expect(rm.gateopen, "the morning exists").toBe(true);
    expect(rm.atmorning, "and the page is at it").toBe(true);
    expect(rm.released, "the run was released, without a journey").toBe(true);
    expect(rm.inert, "¶13 is in the focus order").toBe(false);
    expect(rm.mail, "and the address is in the document").toBe(true);
    /* the flock layer exists and is never populated under reduced motion,
       and the waiting mark on the button is behind a no-preference query */
    expect(rm.birds, "no birds are ever built").toBe(0);
    expect(rm.running, "nothing is left animating").toBe(0);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   ¶13 · the morning has a ground and a sky (round 8)
   The owner asked for a sketch landscape under the last page's words and for
   the birds to fly again once the morning lands. What that may not do is
   also an assertion: the words keep their air from the drawing, nothing
   under reduced motion moves, every bird stays inside the frame the reader
   can see, and every roamer stays within a hand's width of where it was
   drawn. check-dawnscape holds the same claims at sixteen seats in
   verify:portfolio; these are the long sit and the per-seat air, on the
   engine the geometry is measured on.
   ══════════════════════════════════════════════════════════════════════ */
test.describe("¶13 · the morning has a ground and a sky", () => {
  const CLEAR_PX = 24;
  const RANGE_PX = 30;

  const GRASS_CAP = 10;
  /* the floor the phone's lowest rung draws above; check-dawnscape holds the
     same number, so the two never disagree by one */
  const PATHS_FLOOR = 6;

  /** the words' own ink, the quote with a 64px halo and the rest with 24,
      against every point of every path the drawing makes, sampled along its
      length through its screen matrix, plus what could move the point: a
      roamer's home range, a swaying group's amplitude at that radius. Round
      9 drew the whole page, and a subject's bounding box stopped meaning
      anything (the tree's box wraps a corner and contains the quote). Also
      the tallest grass under the signature's own line. */
  const clearance = (page: Page) =>
    page.evaluate(
      ({ RANGE, CLEAR, CAP }) => {
        const svg = document.querySelector(".dawnscape") as SVGSVGElement;
        const walker = document.createTreeWalker(
          document.querySelector(".dawnwrap")!,
          NodeFilter.SHOW_TEXT
        );
        const texts: [
          number,
          number,
          number,
          number,
          number,
          string,
          string,
        ][] = [];
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          if (!n.textContent!.trim()) continue;
          const rg = document.createRange();
          rg.selectNodeContents(n);
          const quote = !!n.parentElement!.closest(".endquote");
          const kind = quote
            ? "quote"
            : n.parentElement!.closest(".kicker")
              ? "kicker"
              : "word";
          const halo = quote ? 64 : CLEAR;
          for (const r of rg.getClientRects())
            if (r.width && r.height)
              texts.push([
                r.left,
                r.top,
                r.right,
                r.bottom,
                halo,
                n.textContent!.trim().slice(0, 20),
                kind,
              ]);
        }
        for (const sel of ["#mast a", "#mast .state", "#mtoggle"]) {
          const el = document.querySelector(sel);
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (
            r.width &&
            r.height &&
            getComputedStyle(el).visibility !== "hidden"
          )
            texts.push([
              r.left,
              r.top,
              r.right,
              r.bottom,
              CLEAR,
              sel,
              "chrome",
            ]);
        }
        const pt = svg.createSVGPoint();
        let worst = { margin: Infinity, gap: 0, need: 0, at: "", sub: "" };
        for (const p of svg.querySelectorAll("path")) {
          /* a mask's or a pattern's path is a hole or a tile, not a mark;
             a tone field's outline is not a mark either */
          if (p.closest("defs") || p.classList.contains("ds-tone")) continue;
          const L = p.getTotalLength();
          if (!L) continue;
          const m = p.getScreenCTM()!;
          const roamer = p.closest("[data-range]") as SVGGElement | null;
          const range = roamer ? +roamer.dataset.range! : 0;
          const axisY = !!roamer && roamer.dataset.axis === "y";
          const sw = p.closest("[class*=sway-]") as SVGGElement | null;
          let ox = 0,
            oy = 0,
            tanA = 0;
          if (sw) {
            const o = (sw.style.transformOrigin || "0px 0px")
              .split(" ")
              .map(parseFloat);
            ox = o[0];
            oy = o[1];
            const amp =
              parseFloat(getComputedStyle(sw).getPropertyValue("--amp")) || 0;
            tanA = Math.tan((amp * Math.PI) / 180);
          }
          const g = p.parentElement as SVGElement | null;
          const sub = (
            (g && g !== svg && g.className.baseVal) ||
            p.className.baseVal ||
            "path"
          ).trim();
          const isHatch = p.classList.contains("ds-hatch");
          const isRidge = p.classList.contains("ds-ridge");
          const step = L > 3000 ? 10 : 6;
          for (let s = 0; s <= L; s += step) {
            const q = p.getPointAtLength(s);
            pt.x = q.x;
            pt.y = q.y;
            const v = pt.matrixTransform(m);
            const sway = tanA ? Math.hypot(q.x - ox, q.y - oy) * tanA : 0;
            for (const t of texts) {
              /* the range is a roam, and a roam is along x only */
              const dx =
                Math.max(t[0] - v.x, v.x - t[2], 0) - (axisY ? 0 : range);
              const dy =
                Math.max(t[1] - v.y, v.y - t[3], 0) - (axisY ? range : 0);
              const gap = Math.max(dx, dy, 0);
              /* hatch keeps the quote's own 64px from every word and 48
                 from the chrome; a ridgeline 64 from the quote and the
                 kicker (round 12: the range stands above the words now,
                 across its valley floor, and check-dawnscape holds the
                 same numbers) */
              const need = isHatch
                ? t[6] === "chrome"
                  ? 48
                  : 64
                : isRidge && (t[6] === "quote" || t[6] === "kicker")
                  ? 64 + sway
                  : t[4] + sway;
              if (gap - need < worst.margin)
                worst = {
                  margin: +(gap - need).toFixed(1),
                  gap: +gap.toFixed(1),
                  need: +need.toFixed(1),
                  at: t[5],
                  sub,
                };
            }
          }
        }
        const runRects: DOMRect[] = [];
        const rw = document.createTreeWalker(
          document.querySelector(".dawnrun")!,
          NodeFilter.SHOW_TEXT
        );
        for (let n = rw.nextNode(); n; n = rw.nextNode()) {
          const rg = document.createRange();
          rg.selectNodeContents(n);
          for (const r of rg.getClientRects()) if (r.width) runRects.push(r);
        }
        const colL = Math.min(...runRects.map((r) => r.left)) - CLEAR,
          colR = Math.max(...runRects.map((r) => r.right)) + CLEAR,
          colB = Math.max(...runRects.map((r) => r.bottom));
        /* a tuft standing wholly below the signature is not under it */
        const tallUnder = [...svg.querySelectorAll(".ds-tuft")]
          .map((el) => {
            const b = el.getBoundingClientRect();
            return {
              x: +(el as SVGGElement).dataset.x!,
              h: b.height,
              top: b.top,
            };
          })
          .filter(
            (t) => t.x >= colL && t.x <= colR && t.top < colB && t.h > CAP + 1.5
          );
        return {
          ...worst,
          tallUnder,
          paths: svg.querySelectorAll("path").length,
          scape: window.__world.scape,
        };
      },
      { RANGE: RANGE_PX, CLEAR: CLEAR_PX, CAP: GRASS_CAP }
    );

  for (const [w, h] of [...SEATS, ...SHORT, ...PHONES]) {
    test.describe(`the words keep their air at ${w}×${h}`, () => {
      test.use({ viewport: { width: w, height: h } });
      // eslint-disable-next-line no-empty-pattern
      test.beforeEach(({}, testInfo) => geometryOnly(testInfo));

      test(`no drawn subject comes within ${CLEAR_PX}px of the words`, async ({
        page,
      }, testInfo) => {
        testInfo.setTimeout(150_000);
        await toTheGate(page, "/?pace=0.25");
        await page.locator("#approve").click();
        await page.waitForFunction(
          () =>
            document.body.classList.contains("atmorning") &&
            !document.body.classList.contains("carrying"),
          null,
          { timeout: 30_000 }
        );
        await page.waitForTimeout(300);
        const c = await clearance(page);
        expect(c.scape, "the ground was built").toBeTruthy();
        if (c.scape!.room < 0) {
          /* no room under the column at this seat: nothing may be drawn */
          expect(c.paths, "nothing drawn where there is no ground").toBe(0);
          return;
        }
        expect(c.paths, "the ground is drawn").toBeGreaterThanOrEqual(
          PATHS_FLOOR
        );
        expect(
          c.margin,
          `"${c.at}" is ${c.gap}px from ${c.sub} and needs ${c.need}px at ${w}×${h}`
        ).toBeGreaterThanOrEqual(0);
        expect(
          c.tallUnder,
          `grass under the signature is capped at ${GRASS_CAP}px at ${w}×${h}`
        ).toEqual([]);
      });
    });
  }

  test.describe("at his seat", () => {
    test.use({ viewport: { width: 1456, height: 949 } });
    // eslint-disable-next-line no-empty-pattern
    test.beforeEach(({}, testInfo) => geometryOnly(testInfo));

    test("the sky stays alive and in frame through a sit, and the ground keeps its range", async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(240_000);
      const PACE = 0.25;
      await toTheGate(page, `/?pace=${PACE}`);
      await page.locator("#approve").click();
      await page.waitForFunction(
        () => document.body.classList.contains("morninglive"),
        null,
        { timeout: 30_000 }
      );
      const W = 1456;
      const H = 949;
      const READ = () => {
        const out: [number, number, number, number, number][] = [];
        for (const el of document.querySelectorAll<HTMLElement>(".bird")) {
          const svg = el.querySelector("svg");
          if (!svg) continue;
          const r = svg.getBoundingClientRect();
          let o = 1;
          let n: HTMLElement | null = el;
          while (n && n.nodeType === 1) {
            const v = parseFloat(getComputedStyle(n).opacity);
            if (!Number.isNaN(v)) o *= v;
            n = n.parentElement;
          }
          if (
            o < 0.05 ||
            r.width < 1 ||
            getComputedStyle(el).visibility === "hidden"
          )
            continue;
          out.push([
            /* the speck flock is one far thing beyond the three, as the
               product and check-dawnscape both count it */
            el.classList.contains("far") && !el.classList.contains("speck")
              ? 1
              : 0,
            r.left,
            r.top,
            r.right,
            r.bottom,
          ]);
        }
        return {
          birds: out,
          t: performance.now() - window.__world.departure.t0,
        };
      };
      /* 90s of wall clock is six minutes of the page's own morning */
      const tLand = await page.evaluate(
        () => performance.now() - window.__world.departure.t0
      );
      let first: number | null = null;
      let gapFrom: number | null = null;
      let worstGap = 0;
      const escapes: string[] = [];
      let maxFar = 0;
      for (let t = 0; t < 90_000; t += 2000) {
        const { birds, t: now } = await page.evaluate(READ);
        if (birds.length && first === null) first = now - tLand;
        maxFar = Math.max(maxFar, birds.filter((b) => b[0]).length);
        for (const [, l, tp, r, b] of birds)
          if (l < 8 || tp < 8 || r > W - 8 || b > H - 8)
            escapes.push(
              `t=${Math.round(now)}: [${Math.round(l)},${Math.round(tp)},${Math.round(r)},${Math.round(b)}]`
            );
        if (!birds.length) {
          if (gapFrom === null) gapFrom = now;
          worstGap = Math.max(worstGap, now - gapFrom + 2000);
        } else gapFrom = null;
        await page.waitForTimeout(2000);
      }
      const fin = await page.evaluate(() => ({
        sky: window.__world.sky,
        ground: window.__world.ground || [],
        tf: [
          ...document.querySelectorAll<SVGGElement>(
            ".dawnscape .ds-gull, .dawnscape .ds-deer"
          ),
        ].map((el) => [el.dataset.id || "deer", el.style.transform] as const),
      }));
      /* the morning lands with birds in it: 2s of the page's clock */
      expect(first, "a bird was visible during the sit").not.toBeNull();
      expect(first!, "a bird within 2s of landing").toBeLessThanOrEqual(
        2000 * PACE + 500
      );
      expect(
        worstGap / PACE,
        "no empty-sky gap over 40s of the page's clock"
      ).toBeLessThanOrEqual(40_000);
      expect(escapes, "no visible bird within 8px of an edge").toEqual([]);
      expect(maxFar, "never more than three far birds").toBeLessThanOrEqual(3);
      expect(fin.sky!.spawned, "the sky kept spawning").toBeGreaterThanOrEqual(
        4
      );
      /* the home range, in the author's frame: the log's worst offset, and
         one roamer's drawn transform against what the log says of it */
      const maxOff: Record<string, number> = {};
      for (const g of fin.ground)
        maxOff[g.id] = Math.max(maxOff[g.id] || 0, Math.abs(g.x_off));
      for (const [id, off] of Object.entries(maxOff))
        expect(off, `${id} stays within ±${RANGE_PX}px`).toBeLessThanOrEqual(
          RANGE_PX
        );
      expect(fin.ground.length, "the ground had events").toBeGreaterThan(0);
      for (const [id, tf] of fin.tf) {
        const last = [...fin.ground].reverse().find((g) => g.id === id);
        if (!last) continue;
        const shown = parseFloat(tf.replace(/^translate\(/, "")) || 0;
        expect(
          Math.abs(shown - last.x_off),
          `${id} is drawn where the log says (${shown} vs ${last.x_off})`
        ).toBeLessThanOrEqual(0.6);
      }
    });

    test("reduced motion: the ground is there, and still", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await expect(page.locator("body")).toHaveClass(/\bsettled\b/);
      await page.locator("#approve").scrollIntoViewIfNeeded();
      await page.locator("#approve").click();
      await page.waitForTimeout(600);
      const rm = await page.evaluate(() => {
        const svg = document.querySelector(".dawnscape")!;
        return {
          paths: svg.querySelectorAll("path").length,
          op: getComputedStyle(svg).opacity,
          anims: document
            .getAnimations()
            .filter((a) => svg.contains((a.effect as KeyframeEffect).target!))
            .length,
          live: document.body.classList.contains("morninglive"),
          scape: window.__world.marks.scape,
          flock: getComputedStyle(document.getElementById("flock")!).display,
        };
      });
      expect(rm.paths, "the ground is drawn").toBeGreaterThanOrEqual(
        PATHS_FLOOR
      );
      expect(rm.op, "and simply there").toBe("1");
      expect(rm.anims, "nothing inside it animates").toBe(0);
      expect(rm.live, "the wind is never switched on").toBe(false);
      expect(rm.scape, "the ground still reports settled").toBeDefined();
      expect(rm.flock, "the flock layer is hidden").toBe("none");
    });
  });
});

/* ══════════════════════════════════════════════════════════════════════
   ¶13 · the daisies open over the first minute, and a rebuild keeps them
   The one thing on this sheet that changes for a reader who stays. Each
   daisy carries the moment it is due, in page ms of the morning's own
   clock, so the builder can render whatever is already out as already out:
   a resize replaces the whole drawing, and without that the meadow would
   shut every time the window moved.
   ══════════════════════════════════════════════════════════════════════ */
test.describe("¶13 · the daisies keep their morning", () => {
  test("a rebuild does not shut them", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "one engine");
    test.slow();
    await page.setViewportSize({ width: 1456, height: 949 });
    await toTheGate(page);
    await page.locator("#approve").click();
    await page.waitForFunction(
      () => document.body.classList.contains("morninglive"),
      null,
      { timeout: 30_000 }
    );
    const read = () =>
      page.evaluate(() => ({
        all: document.querySelectorAll(".dawnscape .ds-daisy").length,
        open: document.querySelectorAll(".dawnscape .ds-daisy.open").length,
      }));
    /* a minute of the morning's own clock, at pace 1 */
    await page.waitForTimeout(60_000);
    const before = await read();
    expect(before.all, "there are daisies").toBeGreaterThan(0);
    expect(before.open, "and most of them are out by a minute").toBeGreaterThan(
      before.all / 2
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1500);
    const mid = await read();
    await page.setViewportSize({ width: 1456, height: 949 });
    await page.waitForTimeout(1500);
    const after = await read();
    /* the counts can only RISE: the clock keeps running through both
       rebuilds, and a seat change can draw a different number of flowers */
    expect(
      mid.open / Math.max(1, mid.all),
      "the share that is out survives the resize"
    ).toBeGreaterThanOrEqual(before.open / before.all - 0.01);
    expect(
      after.open,
      "and coming back does not shut them either"
    ).toBeGreaterThanOrEqual(before.open);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   ¶13 · the morning notices you (round 14, item 6)
   Everything else on this sheet cycles. This is the only thing that answers
   the person reading, so what it may NOT do matters as much as what it
   does: not from a keyboard, not during the carry, not under reduced
   motion, and never because a pointer is on its way to a link. At 1024×768
   the email link sits 30px from the doe and at 1280×720 the résumé link
   sits 41px from a gull, measured, so the keep guard is load-bearing at the
   seats a recruiter reads at.

   Every window in the controller is WALL time, not the page's paced clock:
   a reader's hand does not speed up with the pace flag. That is why these
   drive a real pointer and wait in real milliseconds.
   ══════════════════════════════════════════════════════════════════════ */
test.describe("¶13 · the morning notices you", () => {
  /** land the morning with the mouse, the way a reader does */
  async function landByHand(page: Page) {
    await toTheGate(page);
    const b = await page.evaluate(() => {
      const r = document.getElementById("approve")!.getBoundingClientRect();
      return { x: (r.left + r.right) / 2, y: (r.top + r.bottom) / 2 };
    });
    await page.mouse.move(b.x, b.y);
    await page.mouse.click(b.x, b.y);
    await page.waitForFunction(
      () => document.body.classList.contains("morninglive"),
      null,
      { timeout: 30_000 }
    );
    return b;
  }
  const notices = (page: Page) =>
    page.evaluate(() => window.__world.notice ?? []);
  const centre = (page: Page, sel: string) =>
    page.evaluate((s) => {
      const e = document.querySelector(s);
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return {
        x: (r.left + r.right) / 2,
        y: (r.top + r.bottom) / 2,
        top: r.top,
        left: r.left,
      };
    }, sel);

  test("a · the hand that pressed is still there, and she looks up", async ({
    page,
  }, testInfo: TestInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "one engine");
    await page.setViewportSize({ width: 1456, height: 949 });
    await landByHand(page);
    /* she waits for her own graze to lift her head, so this is not an
       instant: the look is scheduled at at(2500) and then joins the next
       up window of a 9.7s cycle */
    await page.waitForFunction(
      () => (window.__world.notice ?? []).some((n) => n.who === "deer"),
      null,
      { timeout: 20_000 }
    );
    const n = await notices(page);
    expect(
      n.some(
        (q) => q.who === "deer" && (q.what === "look" || q.what === "tail")
      ),
      "the doe noticed the hand that pressed"
    ).toBe(true);
  });

  test("a2 · a keyboard press is not a hand", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "one engine");
    await page.setViewportSize({ width: 1456, height: 949 });
    await toTheGate(page);
    /* .click() from script carries detail 0, which is what a keyboard
       activation reports, and there is no pointer to notice */
    await page.evaluate(() =>
      (document.getElementById("approve") as HTMLButtonElement).click()
    );
    await page.waitForFunction(
      () => document.body.classList.contains("morninglive"),
      null,
      { timeout: 30_000 }
    );
    await page.waitForTimeout(4000);
    expect(await notices(page), "nothing looked at a keyboard").toEqual([]);
  });

  test("b · a pointer at a ground bird, and the same bird twice", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "one engine");
    await page.setViewportSize({ width: 1456, height: 949 });
    await landByHand(page);
    /* past the landing look and past the 1.2s the busy lock keeps between
       any two reactions at all */
    await page.waitForTimeout(3000);
    const g = await centre(page, '.dawnscape .ds-gull[data-id="a"]');
    expect(g, "a gull to walk up to").not.toBeNull();
    await page.mouse.move(g!.x, g!.top - 14);
    await page.waitForTimeout(1200);
    const first = await notices(page);
    expect(
      first.some((q) => q.who === "gull-a"),
      "it put its head up"
    ).toBe(true);
    /* away, out of every creature's reach, and back. The return has to land
       inside a window with two edges: after the 1.2s gap the head it just
       gave holds against every other reaction, and inside the four seconds
       that make this a SECOND approach rather than another first one. The
       head lands around 3.7s (the pointer arrives inside the landing look's
       own lock, and the retry answers it when that lifts), so the window is
       roughly 4.9s to 7.0s and this returns near 5.8s. It used to wait
       400ms and arrive within 60ms of the lock — and nobody could see that,
       because the assertion below read the WHOLE log and was already
       satisfied by the first approach's own entry. */
    await page.waitForTimeout(1200);
    await page.mouse.move(g!.x, g!.top - 400);
    await page.waitForTimeout(300);
    /* everything logged from here on is the second approach's answer */
    const mark = (await notices(page)).length;
    await page.mouse.move(g!.x, g!.top - 14);
    await page.waitForTimeout(1600);
    const again = (await notices(page)).slice(mark);
    expect(
      again.some((q) => q.what === "takeoff" || q.what === "hops"),
      "coming back at it moved it"
    ).toBe(true);
  });

  /* b2 · THE LINGER, AND THE GROUND LOG IT IS DRAWN BY. A hand that arrives
     and then rests is the reading the linger exists for, and the order is
     the whole of it: the bird puts its head up first, and only then hops
     away. It is also the one reaction that MOVES a creature, so it is where
     the roam contract is owed a test — every hop is logged to
     __world.ground, the bird has to be DRAWN where the log says, and the
     walk has to stay inside the range its own group declares (data-range,
     30 at a desktop seat). A test that read the log alone would pass on a
     bird drawn anywhere at all. */
  test("b2 · a hand that stays makes it hop, drawn where the log says", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "one engine");
    await page.setViewportSize({ width: 1456, height: 949 });
    await landByHand(page);
    await page.waitForTimeout(3000);
    const g = await centre(page, '.dawnscape .ds-gull[data-id="a"]');
    expect(g, "a gull to walk up to").not.toBeNull();
    /* A HAND AT REST STILL MOVES. Reactions are evaluated from pointermove,
       so a pointer parked on one coordinate is evaluated once and never
       again; this is a hand resting on the bird with its own tremor, half a
       pixel at a time, and it stops the moment the bird goes. */
    for (let i = 0; i < 30; i++) {
      await page.mouse.move(g!.x + (i % 2 ? 0.5 : -0.5), g!.top - 14);
      await page.waitForTimeout(150);
      const soFar = await notices(page);
      if (soFar.some((q) => q.who === "gull-a-hop")) break;
    }
    const log = await notices(page);
    const looked = log.findIndex((q) => q.who === "gull-a");
    const hopped = log.findIndex(
      (q) => q.who === "gull-a-hop" && q.what === "hops"
    );
    expect(looked, "it put its head up").toBeGreaterThan(-1);
    expect(hopped, "and a hand that stayed made it hop").toBeGreaterThan(-1);
    expect(looked, "the head came first: it looks before it hops").toBeLessThan(
      hopped
    );
    /* out of reach, so nothing new starts, and long enough for the last
       hop's own transition to land: the drawn position is read from the
       computed transform, which is where the bird actually is */
    await page.mouse.move(g!.x, g!.top - 400);
    await page.waitForTimeout(1400);
    const out = await page.evaluate(() => {
      const el = document.querySelector(
        '.dawnscape .ds-gull[data-id="a"]'
      ) as SVGGElement;
      const t = getComputedStyle(el).transform;
      const m = new DOMMatrixReadOnly(t === "none" ? undefined : t);
      const mine = (window.__world.ground ?? []).filter((q) => q.id === "a");
      return {
        drawn: +m.e.toFixed(1),
        lift: +m.f.toFixed(1),
        log: mine.length ? mine[mine.length - 1].x_off : null,
        peak: mine.reduce((p, q) => Math.max(p, Math.abs(q.x_off)), 0),
        range: +el.dataset.range!,
        hops: mine.length,
      };
    });
    expect(out.hops, "the hops are in the ground log").toBeGreaterThan(0);
    expect(out.range, "the bird declares its home range").toBe(30);
    expect(out.lift, "and it is back down on the ground").toBe(0);
    expect(
      Math.abs(out.drawn - (out.log ?? NaN)),
      `drawn at ${out.drawn}px, logged at ${out.log}px`
    ).toBeLessThanOrEqual(0.6);
    /* the PEAK of the walk, not where it happened to stop: two hops of the
       same size in opposite directions net to nothing */
    expect(
      out.peak,
      `the walk keeps the range it declares (peak ${out.peak}px of ${out.range}px)`
    ).toBeLessThanOrEqual(out.range);
  });

  test("c · the swivel's peak keeps the words' air", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "one engine");
    /* 1165×759 is the seat where her tail measures 2.1px from the email
       line at rest, which is the tightest air any of this has */
    await page.setViewportSize({ width: 1165, height: 759 });
    await landByHand(page);
    await page.waitForTimeout(1500);
    const d = await centre(page, ".dawnscape .ds-deer");
    await page.mouse.move(d!.x, d!.top - 18);
    /* WAIT FOR THE SWIVEL, NOT FOR THE LOG. The log line is written when
       the reaction is scheduled and she can be Most of a 9.7s graze away
       from having her head up; __world.swivelAt is stamped when the
       animation actually starts. 480ms in is inside its hold. */
    await page
      .waitForFunction(() => window.__world.swivelAt !== undefined, null, {
        timeout: 25_000,
      })
      .catch(() => {});
    await page.waitForTimeout(480);
    const worst = await page.evaluate(() => {
      const svg = document.querySelector(".dawnscape")!;
      const wrap = document.querySelector(".dawnwrap")!;
      const texts: number[][] = [];
      const w = document.createTreeWalker(wrap, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        if (!n.textContent!.trim()) continue;
        const rg = document.createRange();
        rg.selectNodeContents(n);
        const quote = !!(n.parentElement as Element).closest(".endquote");
        for (const r of rg.getClientRects())
          if (r.width && r.height)
            texts.push([r.left, r.top, r.right, r.bottom, quote ? 64 : 24]);
      }
      /* the INK, sampled through its own screen matrix, not the group's
         box: a box round a rotated ear is bigger than the ear */
      let m = Infinity;
      const pt = (svg as SVGSVGElement).createSVGPoint();
      for (const g of svg.querySelectorAll(
        ".ds-deer .ds-ear, .ds-deer .ds-tail, .ds-deer .ds-head, .ds-fawn .ds-ear, .ds-fawn .ds-tail"
      ))
        for (const p of g.querySelectorAll("path")) {
          const L = (p as SVGPathElement).getTotalLength();
          const mx = (p as SVGPathElement).getScreenCTM()!;
          for (let sI = 0; sI <= L; sI += 4) {
            const q = (p as SVGPathElement).getPointAtLength(sI);
            pt.x = q.x;
            pt.y = q.y;
            const v = pt.matrixTransform(mx);
            for (const t of texts) {
              const dx = Math.max(t[0] - v.x, v.x - t[2], 0);
              const dy = Math.max(t[1] - v.y, v.y - t[3], 0);
              m = Math.min(m, Math.max(dx, dy, 0) - t[4]);
            }
          }
        }
      return m;
    });
    /* the reaction is additive on joints the gust already moves by the same
       amount every 7.3s, so this is the drawing's own reach, measured at
       the peak of the swivel rather than at rest */
    expect(worst, "her air at the peak of the look").toBeGreaterThan(0);
  });

  test("d · a link within reach of a creature wakes nothing", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "one engine");
    /* 1024×768 is the seat where the email link measures 30px from the doe */
    await page.setViewportSize({ width: 1024, height: 768 });
    await landByHand(page);
    /* past the landing look AND past the doe's own six second cooldown, or
       this passes because she is resting rather than because the guard
       held: with the keep guard removed and this wait at three seconds, the
       probe could not make it fail */
    await page.waitForTimeout(8000);
    const before = (await notices(page)).length;
    const l = await page.evaluate(() => {
      const e = document.querySelector('.dawnwrap a[href^="mailto"]');
      if (!e) return null;
      const r = e.getBoundingClientRect();
      /* THE CORNER OF THE LINK NEAREST HER, inside its own rect. The link
         is 197px wide, and its CENTRE measures 116.3px from the doe against
         a 75.1px reach: a pointer there wakes nothing whatever the guard
         does, which is why this test passed on a build with the guard
         removed. labrat measured this corner at 30.2px, inside the reach,
         and red on the notice-keep probe. */
      return { x: r.left + 1, y: r.bottom - 1 };
    });
    expect(l, "the email link is on the page").not.toBeNull();
    /* and DWELL there, the way a hand on its way to a link does */
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(l!.x + (i % 2 ? 0.5 : -0.5), l!.y);
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(1500);
    expect(
      (await notices(page)).length,
      "a pointer on its way to a link is not a visitor"
    ).toBe(before);
  });

  test("e · reduced motion is never noticed", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "one engine");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1456, height: 949 });
    await toTheGate(page);
    await page.locator("#approve").click();
    await page.waitForTimeout(800);
    const d = await centre(page, ".dawnscape .ds-deer");
    if (d) {
      await page.mouse.move(d.x, d.y);
      await page.waitForTimeout(1500);
    }
    const out = await page.evaluate(() => {
      const svg = document.querySelector(".dawnscape")!;
      return {
        n: (window.__world.notice ?? []).length,
        anims: document
          .getAnimations()
          .filter((a) => svg.contains((a.effect as KeyframeEffect).target!))
          .length,
      };
    });
    expect(out.n, "nothing noticed").toBe(0);
    expect(out.anims, "and nothing moved").toBe(0);
  });

  /* HELD BY CONSTRUCTION, four times over, and that is worth writing down:
     during the carry there is no listener (releaseScroll wires it), no
     body.morninglive, scrollHeld is set, and no scape has published yet. A
     probe that removed two of the four still could not make this fail. It
     stays as the regression guard for the change that wires the controller
     earlier, which is the only way it could ever go red. */
  test("f · nothing is noticed during the carry", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "one engine");
    await page.setViewportSize({ width: 1456, height: 949 });
    await toTheGate(page);
    await page.locator("#approve").click();
    await page
      .waitForFunction(
        () => document.body.classList.contains("carrying"),
        null,
        {
          timeout: 10_000,
        }
      )
      .catch(() => {});
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(200 + i * 8, 700 + i * 4);
      await page.waitForTimeout(120);
    }
    const during = await page.evaluate(() => ({
      carrying: document.body.classList.contains("carrying"),
      n: (window.__world.notice ?? []).length,
    }));
    expect(during.carrying, "still carrying the reader").toBe(true);
    expect(during.n, "the page is doing the moving, not the reader").toBe(0);
  });
});
