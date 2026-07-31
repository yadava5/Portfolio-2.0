/**
 * @fileoverview ThreadSegment — the STATIC worlds' finished Red Thread.
 *
 * ROUND 12 (the rail rebuild): this component no longer animates.
 * The motion world's thread is ThreadRail — one fixed full-viewport
 * canvas redrawn against scroll, the prototype's architecture — and in
 * that world this component renders NOTHING (null): no SVG, no
 * geometry build, no ScrollTriggers. What round 12 deleted from here:
 * the seven per-chapter scrubbed `stroke-dashoffset` tweens, the
 * undrawn first paint, and the seam-weld contract those two implied
 * (red-thread.spec.ts asserts the new rail contract instead — one
 * continuous line has no seams to weld).
 *
 * What this component still is: amendment A7's settled page. In the
 * static worlds — `prefers-reduced-motion`, the quiet toggle
 * (`data-motion-off`), the governor's print floor — each chapter
 * section mounts its segment and renders the FINISHED run: solid path
 * fully drawn (dashoffset 0), pressure layer down, node filled,
 * segment 05's nightfall dip re-inked in dusk cream below the 05|06
 * folio terminator. Geometry is measured from the same boxes the rail
 * measures (thread/measure.ts — one ruler for both worlds) and
 * generated in pixel space (geometry.ts); a ResizeObserver plus a
 * fonts-ready re-measure keep it honest. globals.css repeats the
 * finished state with `!important` under `prefers-reduced-motion` and
 * `[data-motion-off]`, so the settled page holds even mid-teardown
 * when a world flips during a session.
 *
 * WHAT IT IS NOT is zero-JS (CRITIC-LEDGER F71/F82, corrected — this
 * header used to claim exactly that). Every path here is GENERATED
 * from measured boxes, so the server has nothing to render: `state`
 * starts null and the SVG comes back empty. A scripting-disabled
 * reader gets no thread at all. That is survivable — the segment is
 * `aria-hidden` and carries no content — but the static-world CSS this
 * file points at is live only once the measurement pass has run.
 *
 * Chapters 06/07 are fixed to dusk territory and carry the dusk ink
 * directly (`data-thread-dusk`).
 */

"use client";

import { useEffect, useRef, useState } from "react";
import {
  readStoredMotionOff,
  useLenis,
} from "@/components/layout/SmoothScroll";
import { isDuskChapter } from "@/components/story/chapters";
import { measureSegmentEnv } from "./measure";
import { buildSegment } from "./geometry";
import type { SegmentGeometry } from "./geometry";

/** Props for one thread segment */
interface ThreadSegmentProps {
  /** Two-digit chapter id ("01"–"07") — the section's data-chapter */
  id: string;
}

/**
 * Whether the motion world is planned for this session — the same gates
 * SmoothScroll checks before mounting the engine (amendment A7). Read
 * synchronously so the first paint is correct in BOTH worlds (children's
 * effects run before SmoothScroll's, so the context alone cannot tell a
 * pending engine from a permanently-static world). When this is true
 * the segment renders nothing at all: the rail is coming.
 *
 * @returns True when the scroll engine is expected to mount
 */
function motionWorldPlanned(): boolean {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !readStoredMotionOff()
  );
}

/**
 * One per-chapter Red Thread segment — the static worlds' settled line.
 * Mount as a direct child of the chapter `<section data-chapter=…>`
 * (which must be `relative`).
 *
 * @param props - The chapter id
 * @returns The finished segment SVG, or null in the motion world
 */
export function ThreadSegment({ id }: ThreadSegmentProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lenis = useLenis();
  const [state, setState] = useState<SegmentGeometry | null>(null);

  /* ── Measure + (re)generate geometry — static worlds only ──────── */
  useEffect(() => {
    /* The motion world is the rail's (live engine, or one still
       mounting) — nothing to measure. This effect re-runs the moment
       the world flips (`lenis` is a dependency), so a quiet-toggle
       press or a governor downshift measures and paints the settled
       line right here. Stale geometry from an earlier static spell is
       left in state; the render gate below never paints it while the
       engine lives. */
    if (lenis || motionWorldPlanned()) return;
    const svg = svgRef.current;
    const section = svg?.closest<HTMLElement>("[data-chapter]");
    if (!svg || !section) return;
    let disposed = false;
    let queued = 0;

    const apply = () => {
      if (disposed) return;
      /* The nightfall dip is a static-world stroke, and this effect
         only runs in the static worlds — the dip is always wanted
         here (CRITIC-LEDGER F79's gate is now the world gate above). */
      const geometry = buildSegment(measureSegmentEnv(section, id, true));
      if (!geometry) return;
      setState((prev) =>
        prev && prev.d === geometry.d && prev.dDip === geometry.dDip
          ? prev
          : geometry
      );
    };

    /* ONE rebuild per frame, whatever the observer says (F63): a window
       drag fires ResizeObserver per frame, and the full generator —
       spine, wobble, two catmull-rom passes, swell — must not run
       synchronously inside every notification. */
    const schedule = () => {
      if (disposed || queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        apply();
      });
    };

    apply();
    const observer = new ResizeObserver(schedule);
    observer.observe(section);
    /* The mono/serif swap can change the kicker's width without changing
       the section's size — re-measure once fonts settle. */
    document.fonts?.ready.then(schedule);

    return () => {
      disposed = true;
      if (queued) cancelAnimationFrame(queued);
      observer.disconnect();
    };
  }, [id, lenis]);

  const gateSize = state?.compact ? 7 : 9;

  /* The motion world carries ZERO thread SVG — the rail is the thread
     there (one canvas, page.tsx). The shell mounts again the moment
     the engine retires and the effect above re-measures. */
  if (lenis) return null;

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      data-thread-segment={id}
      data-thread-dusk={isDuskChapter(id) ? "" : undefined}
      data-thread-compact={state?.compact ? "" : undefined}
      className="thread-segment pointer-events-none absolute inset-0 overflow-visible"
    >
      {state ? (
        <>
          <path className="thread-future" d={state.d} />
          {/* The finished run: dashoffset 0 from first paint — the
              static world never shows an undrawn line (A7). */}
          <path
            className="thread-swell"
            d={state.dSwell}
            pathLength={1}
            style={{ strokeDasharray: "1 2", strokeDashoffset: 0 }}
          />
          <path
            className="thread-past"
            d={state.d}
            pathLength={1}
            style={{ strokeDasharray: "1 2", strokeDashoffset: 0 }}
          />
          {/* Painted last: the static worlds' cream re-inking of the
              tail must sit OVER the day-ink run it replaces */}
          {state.dDip ? <path className="thread-dip" d={state.dDip} /> : null}
          {state.node.kind === "gate" ? (
            <rect
              className="thread-node thread-node-gate is-filled"
              data-thread-node={id}
              x={state.node.x - gateSize / 2}
              y={state.node.y - gateSize / 2}
              width={gateSize}
              height={gateSize}
            />
          ) : (
            <path
              className="thread-node is-filled"
              data-thread-node={id}
              d={state.node.ringD}
            />
          )}
        </>
      ) : null}
    </svg>
  );
}
