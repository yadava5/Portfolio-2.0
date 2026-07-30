/**
 * @fileoverview DayArc — the scroll-driven dawn→dusk color engine.
 *
 * Implements rubric amendment A4 exactly:
 *   - Scans `[data-chapter]` sections and, per adjacent segment, runs a
 *     scrubbed ScrollTrigger tween over NUMERIC oklch channel proxies
 *     (each segment spans its own chapter's scroll-out, EXCEPT the last
 *     day segment, which runs on to the dusk range's own opening pixel —
 *     see "THE LONG APPROACH" below; the reader's longest chapter used
 *     to be lit by one unchanging colour for ~2,900px),
 *     writing `--arc-l/--arc-c/--arc-h` on the LightField container
 *     (`[data-light-field]`) — NOT on <html>: unregistered custom
 *     properties inherit, so a root write invalidated computed style
 *     for the whole document tree every scrubbed frame (PERF-AUDIT
 *     fix 2 — 86% of home scroll cost). Every consumer of the vars
 *     lives inside that container. The background itself composes
 *     `oklch(...)` (LightField) — color strings are never tweened, so
 *     midpoints never collapse through muddy sRGB. Each day segment is
 *     re-timed by THE SEAM SETTLE (stage 1): a per-segment ease that
 *     concentrates the turn in a band anchored to the seam, so a
 *     chapter's light arrives as a beat rather than a smear — same
 *     tween, same writer, same channel line (see the SETTLE block).
 *   - The 05→06 dusk boundary is the CHOREOGRAPHED multi-stop transition
 *     (brief B9, retuned per the shots-dusk2 slow-scroll study): twelve
 *     pre-verified stops over a bounded range as chapter 06 rises
 *     through the viewport, L linear in progress per side so the
 *     darkening rate is steady. A continuous scrub across the whole
 *     span is still provably impossible at WCAG AA (see `sampleArc()`
 *     in scripts/qa/check-contrast.mjs), so the day side descends only
 *     as far as full ink can stand, dwells there, and the ink and
 *     background flip TOGETHER across the forbidden band in one small
 *     step (`data-arc-phase="dusk"` on <html> — a step, not a per-frame
 *     write), and the night side settles onto waypoint-06. The flip is
 *     kept LONELY: the raking light has already faded out (its alpha is
 *     derived from `--arc-l` in globals.css) and only the paper TEXTURE
 *     (the contour plate) follows one stop later via
 *     `data-arc-chrome="dusk"` (also a step). The MASTHEAD flips with
 *     the field, not after it — it composes the same channels, so its
 *     paper and the page's paper are one surface (F61). During the range,
 *     `data-arc-gloaming` on <html> (also stepped, only at the
 *     range edges where both voice states are verified) deepens every
 *     muted voice to full ink so EVERY rendered stop holds AA.
 *     Tiering (§F2): Core steps stop-to-stop (~12 forced writes per
 *     pass); Full fine-scrubs between same-side stops per frame. The
 *     governor coarsens Full→Core automatically on downshift — the tier
 *     is read per frame from the governor's module state (no DOM read).
 *   - Rides the ONE existing scroll loop (amendment A1): `useLenis()`
 *     supplies the engine; ScrollTrigger is already registered by
 *     SmoothScroll. No extra rAF, no scroll listeners here.
 *   - Reduced motion (amendment A7): `useLenis()` returns null, no
 *     ScrollTriggers are ever created, and each chapter paints its own
 *     waypoint statically via the `[data-chapter]` CSS in globals.css.
 *
 * Renders nothing.
 */

"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/components/layout/SmoothScroll";
import { getTier } from "@/components/world/governor";
import {
  ARC_WAYPOINTS,
  DUSK_CHOREO,
  DUSK_CHROME_POS,
  DUSK_FLIP_CHAPTER,
  DUSK_FLIP_POS,
} from "./waypoints.generated";
import type { ArcWaypoint } from "./waypoints.generated";

/** The three scrubbed channel custom properties, written on the
 *  LightField container and the masthead (PERF-AUDIT fix 2 — never
 *  on <html>; F61 — the header's paper IS the field's paper). */
const CHANNEL_VARS = ["--arc-l", "--arc-c", "--arc-h"] as const;

/**
 * Where the dusk choreography's scroll range OPENS — the dusk-flip
 * chapter's top at 92% of the viewport.
 *
 * It is a constant rather than two string literals (fix round 6) because
 * two ranges now depend on it: the choreography starts here, and the
 * last day segment ENDS here, so the day's arrival at golden hour and
 * the dusk's departure from it are the same pixel by construction. Two
 * hand-typed "top 92%" would have been a gap or an overlap waiting for
 * someone to change one of them.
 */
const DUSK_RANGE_START = "top 92%";

/* Quantization steps (PERF: runtime scroll). Each per-frame channel write
 * invalidates the light-field's paint AND forces the soft-light rake to
 * re-blend the full viewport — a GPU cost that scales with write FREQUENCY,
 * not size. These steps sit well below the just-noticeable difference for a
 * full-viewport wash (L 0.4%, C 0.4%, H 0.4°), so skipping sub-step frames
 * is visually lossless while cutting most repaints during a slow scrub. */
const Q_L = 0.004;
const Q_C = 0.004;
const Q_H = 0.4;

/* ── THE SEAM SETTLE (the Seam, stage 1) ─────────────────────────────
 * The day used to turn at a constant rate across a whole chapter's
 * scroll-out — a smear so gradual it was ambient, never an event. The
 * owner's ask is that a chapter's ARRIVAL read as a discrete beat, so
 * each day segment now spends most of its colour distance inside a
 * SETTLE BAND anchored to the seam itself: a slow linear drift while
 * the chapter body is read, then the remaining travel eased across the
 * band as the seam (folio rule → incoming kicker) crosses the viewport,
 * landing on the next waypoint as the new chapter's head reaches the
 * reading line. NOT a new animation: the same one scrubbed tween per
 * segment, re-timed by a per-segment ease — both directions and
 * deep-linked refreshes derive from the one progress value exactly as
 * before, and every rendered colour is still a point on the SAME
 * from→to channel line check-contrast samples at ≥10 places (all three
 * channels share one ease, so the interpolation path is unchanged —
 * only WHERE along the scroll each point renders moves).
 *
 * The band is fixed in VIEWPORT terms, not progress terms, so every
 * seam turns over at the same read speed regardless of chapter height:
 * it opens as the seam rises past SETTLE_ENTER_VH of the viewport and
 * closes at SETTLE_EXIT_VH — computed per segment from the trigger's
 * own refreshed pixels (onRefresh), so resizes and the ch04 pin-spacer
 * keep it honest. SETTLE_DRIFT keeps the canvas ALIVE between seams
 * (NO-LIST §D: "the canvas never sits still on one hex") — the drift
 * share still crosses the H quantum several times per chapter.
 *
 * The 04→05 long-approach segment (fix round 6) is the one authored
 * exception: its trigger runs past its own seam to the dusk range's
 * opening pixel, so its band anchors on the REAL ¶04|05 seam and the
 * remaining APPROACH_TAIL share drifts linearly down ¶05's body — the
 * afternoon still deepens the whole way to the dusk choreography
 * (tail ΔL ≈ 0.015, a quantized turn every ~650px — the pre-change
 * linear cadence, so fix 6's "never flat down ¶05" finding is kept),
 * and the two ranges still abut on the same pixel. The approach's
 * smaller drift share leaves its pre-seam stretch — which is mostly
 * the ch04 pin hold — near-still: the world holds its breath while
 * the run is held, then golden hour arrives AT ¶05's door. */
const SETTLE_ENTER_VH = 0.85;
const SETTLE_EXIT_VH = 0.3;
const SETTLE_DRIFT = 0.35;
const APPROACH_DRIFT = 0.12;
const APPROACH_TAIL = 0.6;

/** One segment's settle-band shape, in trigger-progress space. Mutable:
 *  onRefresh rewrites it from the trigger's settled pixel positions. */
interface SeamShape {
  /** Progress where the band opens (drift below, settle above) */
  a: number;
  /** Progress where the band closes (hold or tail-drift above) */
  b: number;
  /** EFFECTIVE colour share crossed by the pre-band drift. Derived by
   *  refreshSeamShape from the authored share: when a short chapter
   *  leaves less room than the ideal band wants (its ideal `a` clamps
   *  toward 0), the share scales down with the surviving width so the
   *  drift keeps its SLOPE — a fixed share over a vanishing width would
   *  render as a colour cliff on the first scrolled frame (measured on
   *  the 85svh ch06: L stepped 0.347→0.320 in one frame before this). */
  drift: number;
  /** Colour share reserved for the post-band drift (long approach) */
  tail: number;
}

/**
 * Build the seam-settle ease for one segment. Piecewise over trigger
 * progress p: linear drift 0→drift on [0,a]; smoothstep drift→(1−tail)
 * across the band [a,b] — the beat, easing out so it LANDS on the
 * waypoint rather than slamming; linear (1−tail)→1 on [b,1] (the long
 * approach's living tail; tail = 0 collapses this to a hold at 1).
 *
 * @param shape - The segment's mutable band parameters
 * @returns A gsap ease function reading the live shape
 */
function seamEase(shape: SeamShape): gsap.EaseFunction {
  return (p: number): number => {
    const rest = 1 - shape.tail;
    if (p <= shape.a) return shape.a > 0 ? (shape.drift * p) / shape.a : 0;
    if (p >= shape.b) {
      return shape.b < 1
        ? rest + shape.tail * ((p - shape.b) / (1 - shape.b))
        : rest;
    }
    const u = (p - shape.a) / (shape.b - shape.a);
    return shape.drift + (rest - shape.drift) * u * u * (3 - 2 * u);
  };
}

/**
 * Recompute a segment's band from its trigger's settled pixels: the
 * band opens/closes as the SEAM (the next chapter's top) crosses the
 * viewport-height anchors. Clamped so degenerate spans (short chapters,
 * tiny viewports) collapse gracefully toward "the whole segment is the
 * settle" rather than inverting — and the drift SHARE scales with the
 * width that survives clamping, so its slope holds and the ease stays
 * continuous (see SeamShape.drift).
 *
 * @param shape - The mutable shape to rewrite
 * @param driftShare - The authored drift share for this segment
 * @param start - Trigger start (px scroll)
 * @param end - Trigger end (px scroll)
 * @param seam - Scroll position at which the seam reaches the viewport
 *   top (= `end` for normal segments; the ¶04|05 seam for the approach)
 */
function refreshSeamShape(
  shape: SeamShape,
  driftShare: number,
  start: number,
  end: number,
  seam: number
): void {
  const span = end - start;
  if (span <= 0) return;
  const vh = window.innerHeight;
  const hi = shape.tail > 0 ? 0.98 : 1;
  const a = (seam - SETTLE_ENTER_VH * vh - start) / span;
  const b = (seam - SETTLE_EXIT_VH * vh - start) / span;
  shape.a = Math.min(Math.max(a, 0), hi - 0.04);
  shape.b = Math.min(Math.max(b, shape.a + 0.02), hi);
  shape.drift = a > 0 ? driftShare * Math.min(1, shape.a / a) : 0;
}

/**
 * Build a quantized channel writer bound to one field element.
 *
 * Returns a `write(l, c, h, force?)` that skips a write when every channel
 * moved less than its quantization step since the last committed write —
 * the repaint (and the rake's full-viewport soft-light re-blend it would
 * trigger) is elided. `force` always writes: used for the initial paint and
 * the dusk STEP, which must land exactly on their waypoint.
 *
 * @param field - The `[data-light-field]` element (the vars' only subtree)
 * @returns A quantized setter for `--arc-l/c/h`
 */
function makeChannelWriter(targets: HTMLElement[]) {
  let lastL = Number.NaN;
  let lastC = Number.NaN;
  let lastH = Number.NaN;
  return function write(l: number, c: number, h: number, force = false) {
    if (
      !force &&
      Math.abs(l - lastL) < Q_L &&
      Math.abs(c - lastC) < Q_C &&
      Math.abs(h - lastH) < Q_H
    ) {
      return;
    }
    lastL = l;
    lastC = c;
    lastH = h;
    const lText = l.toFixed(3);
    const cText = c.toFixed(3);
    const hText = h.toFixed(1);
    for (const target of targets) {
      target.style.setProperty("--arc-l", lText);
      target.style.setProperty("--arc-c", cText);
      target.style.setProperty("--arc-h", hText);
    }
  };
}

/**
 * Null-rendering scroll engine for the day arc.
 *
 * Mount once alongside LightField on pages whose sections carry
 * `data-chapter="01"`–`"07"` attributes.
 *
 * @returns null — this component only drives CSS custom properties
 */
export function DayArc() {
  const lenis = useLenis();

  useEffect(() => {
    /* A7: no engine → no ScrollTriggers. The static per-chapter waypoint
       backgrounds are pure CSS (globals.css, prefers-reduced-motion). */
    if (!lenis) return;

    const root = document.documentElement;
    /* The channel-write targets: the LightField container, and the
       MASTHEAD. Falling back to <html> keeps the arc alive if the field
       is ever absent, but on every real page (home, world-preview) the
       container exists.

       Why the header is a second target (CRITIC-LEDGER F61, P1 "looks
       broken"): its scrolled paper was the fixed cream token while the
       field scrubbed away underneath it, so at scrollY 7728 the page was
       tan (#cdb394, L 0.78) with a #FAF6EF masthead and a hard
       horizontal edge at y=78. The stagger was authored as a beat; at
       1440x900 it reads as an unstyled bar. Writing the SAME channels
       onto the header makes its paper the field's paper at every stop,
       in both scroll directions — and makes the masthead's ink contrast
       exactly the body's, which check-contrast already proves at every
       rendered stop. Two small subtrees, not <html>: the per-frame
       invalidation stays scoped (PERF-AUDIT fix 2 / brief D4). */
    const field =
      document.querySelector<HTMLElement>("[data-light-field]") ?? root;
    const masthead = document.querySelector<HTMLElement>(".site-header");
    const targets = masthead ? [field, masthead] : [field];
    const write = makeChannelWriter(targets);
    /* The masthead composes the arc colour only while the arc is live —
       archive routes and every static world keep the paper token. */
    masthead?.setAttribute("data-arc-paper", "");

    const byId = new Map<string, ArcWaypoint>(
      ARC_WAYPOINTS.map((w) => [w.id, w])
    );
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter]")
    )
      .filter((el) => byId.has(el.dataset.chapter ?? ""))
      .sort((a, b) =>
        (a.dataset.chapter ?? "").localeCompare(b.dataset.chapter ?? "")
      );

    if (sections.length < 2) return;

    const waypointOf = (el: HTMLElement): ArcWaypoint =>
      byId.get(el.dataset.chapter ?? "") as ArcWaypoint;

    /* Start the day where the first chapter starts (force: initial paint). */
    const first = waypointOf(sections[0]);
    write(first.l, first.c, first.h, true);

    const ctx = gsap.context(() => {
      for (let i = 0; i < sections.length - 1; i++) {
        const from = waypointOf(sections[i]);
        const to = waypointOf(sections[i + 1]);

        if (to.id === DUSK_FLIP_CHAPTER) {
          /* B9 (retuned per the shots-dusk2 slow-scroll study): the
             choreographed dusk — twelve verified stops while chapter 06
             rises from 92% of the viewport to its top. Root attributes
             are STEPS (gloaming at the range edges, the ink flip at
             DUSK_FLIP_POS — the masthead's ink flips WITH it, F61 — and
             the contour plate one stop later at DUSK_CHROME_POS); only
             the scrubbed channels move per frame,
             and only on the Full tier — Core renders the discrete stops
             (~12 forced writes per pass). All state is derived from one
             progress value so both directions and deep-linked refreshes
             land exactly. */
          let stopIndex = -1;
          let gloamingOn = false;
          let duskOn = false;
          let chromeOn = false;

          const applyDusk = (p: number) => {
            /* Root steps first, same frame as the channel write. */
            const dusk = p >= DUSK_FLIP_POS;
            if (dusk !== duskOn) {
              duskOn = dusk;
              if (dusk) root.setAttribute("data-arc-phase", "dusk");
              else root.removeAttribute("data-arc-phase");
            }
            const chrome = p >= DUSK_CHROME_POS;
            if (chrome !== chromeOn) {
              chromeOn = chrome;
              if (chrome) root.setAttribute("data-arc-chrome", "dusk");
              else root.removeAttribute("data-arc-chrome");
            }
            const gloaming = p > 0 && p < 1;
            if (gloaming !== gloamingOn) {
              gloamingOn = gloaming;
              if (gloaming) root.setAttribute("data-arc-gloaming", "");
              else root.removeAttribute("data-arc-gloaming");
            }

            /* Virgin creation-refresh at p=0 (page loaded above the
               range): the resting day belongs to the day segments —
               writing w05 here would repaint dawn as golden hour. Real
               scroll-outs (stopIndex ≥ 0) DO write, restoring w05. */
            if (p === 0 && stopIndex === -1) return;

            /* Current stop: the last stop whose pos ≤ p. */
            let index = DUSK_CHOREO.length - 1;
            while (index > 0 && DUSK_CHOREO[index].pos > p) index--;
            const stop = DUSK_CHOREO[index];

            if (getTier() === "full") {
              /* Fine scrub (Full): interpolate toward the next stop of
                 the SAME side; hold across the flip pair — the forbidden
                 band is never rendered. Quantized writes elide sub-JND
                 frames exactly like the day segments. */
              const next = DUSK_CHOREO[index + 1];
              if (next && next.side === stop.side) {
                const u = (p - stop.pos) / (next.pos - stop.pos);
                write(
                  stop.l + (next.l - stop.l) * u,
                  stop.c + (next.c - stop.c) * u,
                  stop.h + (next.h - stop.h) * u
                );
              } else {
                write(stop.l, stop.c, stop.h, index !== stopIndex);
              }
              stopIndex = index;
              return;
            }

            /* Stepped scrub (Core): write only when the stop changes. */
            if (index !== stopIndex) {
              stopIndex = index;
              write(stop.l, stop.c, stop.h, true);
            }
          };

          ScrollTrigger.create({
            trigger: sections[i + 1],
            start: DUSK_RANGE_START,
            end: "top top",
            scrub: true,
            onUpdate: (self) => applyDusk(self.progress),
            onRefresh: (self) => applyDusk(self.progress),
          });
          continue;
        }

        /* Scrubbed segment: tween a numeric proxy while section i scrolls
           out of the viewport, so the color lands on `to` exactly as
           section i+1's top reaches the viewport top.

           THE LONG APPROACH (fix round 6). One segment does not end
           there, and it is the one the reader spends longest inside.
           Every day segment used to finish as the NEXT chapter's top
           reached the viewport top, which is right for six of them and
           wrong for the last: chapter 05 is 3,129px tall — 29% of the
           whole page, the four work rows, the longest continuous read on
           the site — and the dusk range does not open until 828px before
           chapter 06. So golden hour arrived at ¶05's first line and
           then held, PIXEL-IDENTICAL, for ~2,900px. Sampled at 1440
           (`docs/design-lab/probe-fix6.mjs --arc`), the composed canvas
           at y=4200, 4550, 4900 … 7000 was the same three channels eight
           samples running: L 0.923 / C 0.039 / H 83.8. The light payoff
           of a day-arc site was entirely back-loaded to nightfall.

           The fix moves no colour and adds no waypoint: the 04→05 tween
           simply keeps running until the dusk choreography takes over,
           so the arc ARRIVES at golden hour exactly where the day starts
           to die instead of two thousand pixels early. `endTrigger` is
           the dusk-flip chapter and `end` is DUSK_RANGE_START — the same
           string the choreography's own trigger opens on — so the two
           ranges abut on the same pixel in both directions and neither
           can render a value the other has not agreed to. The afternoon
           now deepens the whole way down ¶05 (measured ΔL 0.017 across
           the stretch that was flat), and every value it renders is a
           point on the SAME 04→05 interpolation check-contrast has
           always sampled at ≥10 places — no new colour enters the site,
           no new stop is scheduled, DUSK_CHOREO is untouched at 12, and
           the per-frame cost is identical: one tween, one range, the
           same quantized writes to the same two subtrees.

           Deferred handle read: when the page loads already scrolled (a
           #chapter deep link), GSAP fires onUpdate synchronously INSIDE
           gsap.fromTo() — a direct `const tween` closure read here would
           hit the TDZ (ReferenceError, observed on Firefox). */
        const duskChapter = sections[i + 2];
        const runsIntoDusk =
          duskChapter?.dataset.chapter === DUSK_FLIP_CHAPTER &&
          sections[i + 1]?.dataset.chapter !== DUSK_FLIP_CHAPTER;
        /* THE SEAM SETTLE (see the block above Q_L): the segment's one
           scrubbed tween, re-timed so the turn lands AT the seam. The
           shape starts as a placeholder and is rewritten from real
           pixels the moment the trigger first refreshes — a deep-linked
           creation-refresh may render one frame off the placeholder,
           which is still a point on the same channel line. */
        const driftShare = runsIntoDusk ? APPROACH_DRIFT : SETTLE_DRIFT;
        const shape: SeamShape = {
          a: 0.5,
          b: 0.85,
          drift: driftShare,
          tail: runsIntoDusk ? APPROACH_TAIL : 0,
        };
        const seamSection = sections[i + 1];
        const proxy = { l: from.l, c: from.c, h: from.h };
        const handle: { tween?: gsap.core.Tween } = {};
        handle.tween = gsap.fromTo(
          proxy,
          { l: from.l, c: from.c, h: from.h },
          {
            l: to.l,
            c: to.c,
            h: to.h,
            ease: seamEase(shape),
            immediateRender: false,
            scrollTrigger: {
              trigger: sections[i],
              start: "top top",
              ...(runsIntoDusk
                ? { endTrigger: duskChapter, end: DUSK_RANGE_START }
                : { end: "bottom top" }),
              scrub: true,
              onRefresh: (self) => {
                /* Normal segments end AT their seam ("bottom top" —
                   sections abut); the long approach's end is the dusk
                   opening, so its seam is measured off the section. */
                const seam = runsIntoDusk
                  ? window.scrollY + seamSection.getBoundingClientRect().top
                  : self.end;
                refreshSeamShape(shape, driftShare, self.start, self.end, seam);
              },
            },
            onUpdate: () => {
              /* Guard: when a segment clamps back to 0 while the previous
                 segment is active, skip its stale endpoint write. */
              const st = handle.tween?.scrollTrigger;
              if (st && !st.isActive && st.progress === 0) return;
              write(proxy.l, proxy.c, proxy.h);
            },
          }
        );
      }
    });

    return () => {
      ctx.revert();
      root.removeAttribute("data-arc-phase");
      root.removeAttribute("data-arc-chrome");
      root.removeAttribute("data-arc-gloaming");
      masthead?.removeAttribute("data-arc-paper");
      for (const target of targets) {
        for (const name of CHANNEL_VARS) target.style.removeProperty(name);
      }
    };
  }, [lenis]);

  return null;
}
