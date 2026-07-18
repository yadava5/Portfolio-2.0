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
 *   - The 05→06 dusk boundary is a pre-verified STEP change: background
 *     channels AND ink flip together via non-scrubbed ScrollTrigger
 *     callbacks (`data-arc-phase="dusk"` stays on <html> — a step, not
 *     a per-frame write; ink colors come from
 *     `--color-ink` / `--color-ink-dusk` in globals.css). A scrubbed
 *     05→06 segment is provably impossible at WCAG AA — see
 *     `sampleArc()` in scripts/qa/check-contrast.mjs.
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
import { ARC_WAYPOINTS, DUSK_FLIP_CHAPTER } from "./waypoints.generated";
import type { ArcWaypoint } from "./waypoints.generated";

/** The three scrubbed channel custom properties, written on the
 *  LightField container (PERF-AUDIT fix 2 — never on <html>). */
const CHANNEL_VARS = ["--arc-l", "--arc-c", "--arc-h"] as const;

/**
 * Write the arc's oklch channels onto the light-field container.
 *
 * @param field - The `[data-light-field]` element (the only subtree
 *   that reads the vars — scoping the write keeps per-frame style
 *   invalidation to its four layers)
 * @param l - oklch lightness (0–1)
 * @param c - oklch chroma
 * @param h - oklch hue in degrees
 */
function applyChannels(field: HTMLElement, l: number, c: number, h: number) {
  field.style.setProperty("--arc-l", l.toFixed(4));
  field.style.setProperty("--arc-c", c.toFixed(4));
  field.style.setProperty("--arc-h", h.toFixed(2));
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

    /* Start the day where the first chapter starts. */
    const first = waypointOf(sections[0]);
    applyChannels(field, first.l, first.c, first.h);

    const ctx = gsap.context(() => {
      for (let i = 0; i < sections.length - 1; i++) {
        const from = waypointOf(sections[i]);
        const to = waypointOf(sections[i + 1]);

        if (to.id === DUSK_FLIP_CHAPTER) {
          /* A4: the dusk boundary is a STEP — background channels and ink
             flip together, instantly, at a pre-verified point. Scrubbing
             this segment cannot hold AA (check-contrast.mjs proves it). */
          ScrollTrigger.create({
            trigger: sections[i + 1],
            start: "top 50%",
            onEnter: () => {
              applyChannels(field, to.l, to.c, to.h);
              root.setAttribute("data-arc-phase", "dusk");
            },
            onLeaveBack: () => {
              applyChannels(field, from.l, from.c, from.h);
              root.removeAttribute("data-arc-phase");
            },
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
              applyChannels(field, proxy.l, proxy.c, proxy.h);
            },
          }
        );
      }
    });

    return () => {
      ctx.revert();
      root.removeAttribute("data-arc-phase");
      for (const name of CHANNEL_VARS) field.style.removeProperty(name);
    };
  }, [lenis]);

  return null;
}
