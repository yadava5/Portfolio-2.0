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
];

/** geometry is a claim about the design, not about an engine */
const geometryOnly = (testInfo: TestInfo): void => {
  testInfo.skip(
    testInfo.project.name !== "chromium-desktop",
    "the ending's geometry is measured, not engine-dependent — chromium-desktop only"
  );
};

/** to the gate, with every builder run on the way down, and never a resize */
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
       the socket used to be. A 37px block prepended to ¶02 is the same event
       with a number this test owns, and it is NOT a resize, because a resize
       rebuilds the geometry and would hide exactly what is being measured. */
    const grown = await page.evaluate(() => {
      const before = document.documentElement.scrollHeight;
      const pad = document.createElement("div");
      pad.style.height = "37px";
      document.getElementById("who")!.prepend(pad);
      return document.documentElement.scrollHeight - before;
    });
    expect(grown, "the document actually grew").toBeGreaterThanOrEqual(30);
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
    expect(
      Math.abs(after.ringY! - after.sqMid),
      "the ring followed the socket"
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(after.ringY! - after.btnMid),
      "the ring followed the button"
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
      mail: (() => {
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
      })(),
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
    expect(end.mail, "and its address is readable").toBeGreaterThan(0.9);
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
  test("every path is inside the frame, climbing east, inside the pitch cap", async ({
    page,
  }, testInfo) => {
    testInfo.skip(
      !/^(chromium-desktop|chromium-mobile)$/.test(testInfo.project.name),
      "one desktop seat and one phone seat is the whole claim"
    );
    testInfo.setTimeout(150_000);
    await toTheGate(page);
    await page.locator("#approve").click();
    await page.waitForTimeout(900);

    /* the paths themselves, sampled off the real SVGPathElement rather than
       re-derived from the numbers that built them */
    const paths = await page.evaluate(() => {
      const out: {
        pitch: number;
        minDx: number;
        outside: number;
      }[] = [];
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

    expect(paths.length, "the flock left").toBeGreaterThanOrEqual(6);
    for (const [i, q] of paths.entries()) {
      expect(q.outside, `bird ${i} never leaves the frame`).toBe(0);
      /* a leftward leg under offset-rotate:auto flies the bird upside down */
      expect(q.minDx, `bird ${i} always goes east`).toBeGreaterThan(0);
      /* measured: 38.1° at 1456×949 and 46.7° at 390×844, the phone being
         steeper because a narrow sky gives a climb far less room to lean in.
         50 is the ceiling; past it the silhouette reads as a blade. */
      expect(q.pitch, `bird ${i} is never stood on end`).toBeLessThanOrEqual(
        50
      );
    }
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
      .poll(() => page.evaluate(() => window.__world.flockFrom !== null), {
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
