"use client";

/**
 * @fileoverview DossierThread — the case file's already-inked thread.
 *
 * DOSSIER-SPEC pt 2: the thread enters the top edge, underlines the
 * title, and runs the left margin down to the folio footer, exiting
 * toward the next document. A dossier is a finished document with fixed
 * daylight, so unlike the homepage's scrubbed segments this line is
 * STATIC — fully drawn on arrival, no ScrollTriggers, no entrance
 * performance (research warning 4: the mark is simply there).
 *
 * Geometry reuses the Red Thread's own hand (mulberry32 wobble +
 * Catmull-Rom pen from thread/geometry.ts) and its ink classes from
 * globals.css, so the home thread and the case-file thread are visibly
 * the same line. Measured against [data-thread-title] and the article
 * box; ResizeObserver + fonts.ready keep it honest.
 */

import { useEffect, useRef, useState } from "react";
import {
  catmullRomPath,
  inkPool,
  mulberry32,
} from "@/components/thread/geometry";

/** Mirrors the dossier wrap: max-w-[1240px] + xl:pl-36 binding margin. */
const WRAP_MAX_WIDTH = 1240;
const XL_BINDING_PAD = 144;
const BINDING_INSET = 56;
const BINDING_MIN_X = 136;

/** Spine x for the dossier: binding margin at xl, left gutter below.
 *  Exported for CitationInk — the citation strokes ride the same
 *  margin lane as this thread, a hand-width to its right. */
export function dossierSpineX(vw: number): number {
  if (vw < 1280) return 20;
  const wrapLeft = Math.max(0, (vw - WRAP_MAX_WIDTH) / 2);
  return Math.max(BINDING_MIN_X, wrapLeft + XL_BINDING_PAD - BINDING_INSET);
}

export function DossierThread() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [state, setState] = useState<{ d: string; compact: boolean } | null>(
    null
  );

  useEffect(() => {
    const svg = svgRef.current;
    const host = svg?.closest<HTMLElement>("[data-dossier]");
    if (!svg || !host) return;
    let disposed = false;

    const apply = () => {
      if (disposed) return;
      const rect = host.getBoundingClientRect();
      if (rect.width < 60 || rect.height < 400) return;
      const vw = document.documentElement.clientWidth;
      const spine = dossierSpineX(vw);
      const amp = vw < 1280 ? 3 : 7;
      const rand = mulberry32(1861);

      const pts: { x: number; y: number }[] = [{ x: spine, y: -6 }];

      /* Underline the title — the file's one content gesture */
      const titleEl = host.querySelector("[data-thread-title]");
      let y = 64;
      if (titleEl && vw >= 1280) {
        const t = titleEl.getBoundingClientRect();
        const box = {
          left: t.left - rect.left,
          top: t.top - rect.top,
          width: t.width,
          height: t.height,
        };
        const uy = box.top + box.height + 8;
        const len = Math.min(box.width * 0.62, 360);
        pts.push({ x: spine, y: uy - 72 });
        pts.push({ x: spine + 14, y: uy - 20 });
        pts.push({ x: box.left - 10, y: uy + 1 });
        pts.push({ x: box.left + len * 0.5, y: uy - 1 + rand() * 2.5 });
        pts.push({ x: box.left + len, y: uy + 2 });
        pts.push({ x: box.left + len * 0.55, y: uy + 17 });
        pts.push({ x: box.left - 28, y: uy + 24 });
        pts.push({ x: spine + 6, y: uy + 44 });
        y = uy + 84;
        pts.push({ x: spine, y });
      }

      /* The descent — a wobbled left-margin run to the folio footer */
      const endY = rect.height - 96;
      const span = endY - y;
      if (span > 120) {
        const steps = Math.min(18, Math.max(3, Math.round(span / 340)));
        const phase = rand() * Math.PI * 2;
        const waves = 0.9 + rand() * 1.3;
        for (let i = 1; i < steps; i++) {
          const t = i / steps;
          pts.push({
            x:
              spine +
              Math.sin(phase + t * Math.PI * waves) * amp +
              (rand() - 0.5) * amp * 0.5,
            y: y + span * t + (rand() - 0.5) * Math.min(24, span * 0.05),
          });
        }
      }
      /* Exit toward the next document: a small outbound flick + rest pool */
      pts.push({ x: spine, y: endY });
      pts.push({ x: spine + 3, y: endY + 26 });
      pts.push({ x: spine + 16, y: endY + 44 });

      const tip = pts[pts.length - 1];
      const d =
        catmullRomPath(pts) + inkPool(tip.x + 1.5, tip.y + 1, 2.1, rand);

      setState((prev) =>
        prev && prev.d === d ? prev : { d, compact: vw < 1280 }
      );
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(host);
    document.fonts?.ready.then(apply);

    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      data-dossier-thread
      data-thread-compact={state?.compact ? "" : undefined}
      className="thread-segment pointer-events-none absolute inset-0 overflow-visible"
    >
      {state ? <path className="thread-past thread-inked" d={state.d} /> : null}
    </svg>
  );
}
