/**
 * @fileoverview DayArc — the scroll-driven dawn→dusk color engine.
 *
 * Implements rubric amendment A4 exactly:
 *   - Scans `[data-chapter]` sections and, per adjacent segment, runs a
 *     scrubbed ScrollTrigger tween over NUMERIC oklch channel proxies,
 *     writing `--arc-l/--arc-c/--arc-h` on the LightField container
 *     (`[data-light-field]`) — NOT on <html>: unregistered custom
 *     properties inherit, so a root write invalidated computed style
 *     for the whole document tree every scrubbed frame (PERF-AUDIT
 *     fix 2 — 86% of home scroll cost). Every consumer of the vars
 *     lives inside that container. The background itself composes
 *     `oklch(...)` (LightField) — color strings are never tweened, so
 *     midpoints never collapse through muddy sRGB.
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
 *     derived from `--arc-l` in globals.css) and the chrome — header
 *     paper/ink, contour texture — follows one stop later via
 *     `data-arc-chrome="dusk"` (also a step). During the range,
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
 *  LightField container (PERF-AUDIT fix 2 — never on <html>). */
const CHANNEL_VARS = ["--arc-l", "--arc-c", "--arc-h"] as const;

/* Quantization steps (PERF: runtime scroll). Each per-frame channel write
 * invalidates the light-field's paint AND forces the soft-light rake to
 * re-blend the full viewport — a GPU cost that scales with write FREQUENCY,
 * not size. These steps sit well below the just-noticeable difference for a
 * full-viewport wash (L 0.4%, C 0.4%, H 0.4°), so skipping sub-step frames
 * is visually lossless while cutting most repaints during a slow scrub. */
const Q_L = 0.004;
const Q_C = 0.004;
const Q_H = 0.4;

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
function makeChannelWriter(field: HTMLElement) {
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
    field.style.setProperty("--arc-l", l.toFixed(3));
    field.style.setProperty("--arc-c", c.toFixed(3));
    field.style.setProperty("--arc-h", h.toFixed(1));
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
    /* The channel-write target: the LightField container. Falling back
       to <html> keeps the arc alive if the field is ever absent, but
       on every real page (home, world-preview) the container exists. */
    const field =
      document.querySelector<HTMLElement>("[data-light-field]") ?? root;
    const write = makeChannelWriter(field);

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
             DUSK_FLIP_POS, the chrome — header + contour — one stop
             later at DUSK_CHROME_POS so the masthead dims a beat after
             the world); only the LightField channels move per frame,
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
            start: "top 92%",
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

           Deferred handle read: when the page loads already scrolled (a
           #chapter deep link), GSAP fires onUpdate synchronously INSIDE
           gsap.fromTo() — a direct `const tween` closure read here would
           hit the TDZ (ReferenceError, observed on Firefox). */
        const proxy = { l: from.l, c: from.c, h: from.h };
        const handle: { tween?: gsap.core.Tween } = {};
        handle.tween = gsap.fromTo(
          proxy,
          { l: from.l, c: from.c, h: from.h },
          {
            l: to.l,
            c: to.c,
            h: to.h,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: sections[i],
              start: "top top",
              end: "bottom top",
              scrub: true,
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
      for (const name of CHANNEL_VARS) field.style.removeProperty(name);
    };
  }, [lenis]);

  return null;
}
