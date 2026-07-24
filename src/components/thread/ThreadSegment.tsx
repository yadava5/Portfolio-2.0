/**
 * @fileoverview ThreadSegment — one chapter's stretch of the Red Thread.
 *
 * Amendment A3 exactly: NOT one page-spanning SVG — each chapter section
 * mounts its own absolutely-positioned segment whose endpoints align on
 * the shared spine (constants.ts), so `stroke-dashoffset` repaints stay
 * contained per chapter. Each segment renders:
 *
 *   - a dashed "future" path (always fully visible, secondary ink),
 *   - a solid "past" path (same geometry) revealed by ONE scrubbed
 *     ScrollTrigger via `pathLength=1` + stroke-dashoffset (the
 *     NO-LIST's single sanctioned non-transform animation),
 *   - a "swell" pressure layer (geometry.ts) — the same run offset by
 *     curvature so the ink swells where a nib would press; it scrubs
 *     in the SAME tween as the past path, one head, no filters,
 *   - segment 05 only: a hidden "dip" path (the tail below the 05|06
 *     folio terminator) that the static worlds re-ink in dusk cream,
 *   - a chapter node on the entry seam that FILLS as the drawing head
 *     passes — a class toggle in trigger callbacks, no per-frame JS.
 *     Nodes are hand-drawn irregular rings; chapter 04's is the clay
 *     gate-square, the site's one recurring glyph.
 *
 * Geometry is measured (section, kicker, hero name, the deck word,
 * work rows, folio rule, gate stamp incl. its rotation via the computed
 * transform matrix) and generated in pixel space (geometry.ts); a
 * ResizeObserver plus a fonts-ready re-measure keep it honest.
 *
 * Reduced motion + the quiet toggle (A7): `useLenis()` is null, no
 * ScrollTrigger is ever created, and the segment renders the finished
 * run — solid path fully drawn, node filled. globals.css repeats that
 * state with `!important` under `prefers-reduced-motion` and
 * `[data-motion-off]`, so the static world holds with zero engine (and
 * zero JS-timing) dependence. Chapters 06/07 are fixed to dusk
 * territory and carry the dusk ink directly (`data-thread-dusk`).
 */

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  readStoredMotionOff,
  useLenis,
} from "@/components/layout/SmoothScroll";
import { isDuskChapter } from "@/components/story/chapters";
import {
  THREAD_SCRUB,
  THREAD_TRIGGER_END,
  THREAD_TRIGGER_START,
} from "./constants";
import { buildSegment } from "./geometry";
import type {
  SegmentGeometry,
  StampMarks,
  ThreadBox,
  ThreadPoint,
} from "./geometry";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** The awaiting stamp's SVG viewBox (ApprovedStamp.tsx) */
const STAMP_VIEWBOX = { width: 300, height: 190 };

/** Props for one thread segment */
interface ThreadSegmentProps {
  /** Two-digit chapter id ("01"–"07") — the section's data-chapter */
  id: string;
}

/** Rendered thread state: geometry + which world it first painted for */
interface ThreadState {
  geometry: SegmentGeometry;
  /** True when the motion world is expected — render the path undrawn */
  undrawn: boolean;
}

/**
 * Whether the motion world is planned for this session — the same gates
 * SmoothScroll checks before mounting the engine (amendment A7). Read
 * synchronously so the first paint is correct in BOTH worlds (children's
 * effects run before SmoothScroll's, so the context alone cannot tell a
 * pending engine from a permanently-static world).
 *
 * @returns True when Lenis is expected to mount
 */
function motionWorldPlanned(): boolean {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !readStoredMotionOff()
  );
}

/**
 * A child box in section-local coordinates.
 *
 * @param el - Element to measure
 * @param section - The section's bounding rect
 * @returns Box relative to the section's border box
 */
function localBox(el: Element, section: DOMRect): ThreadBox {
  const r = el.getBoundingClientRect();
  return {
    left: r.left - section.left,
    top: r.top - section.top,
    width: r.width,
    height: r.height,
  };
}

/**
 * The gate chapter renders two stamps (compact + desktop); pick the one
 * that is actually laid out.
 *
 * @param section - The gate section
 * @returns The visible stamp element, or null
 */
function visibleStamp(section: HTMLElement): HTMLElement | null {
  for (const el of section.querySelectorAll<HTMLElement>(
    "[data-thread-stamp]"
  )) {
    if (el.getBoundingClientRect().width > 0) return el;
  }
  return null;
}

/**
 * Measure the stamp's landmarks THROUGH its CSS rotation: viewBox
 * coordinates map to the page via the wrapper's untransformed layout
 * size (offsetWidth/Height), its AABB center (rotation-invariant), and
 * its computed transform matrix. The signature line itself is measured
 * with getBBox (local units), so the underline hugs the real glyph run.
 *
 * @param stampEl - The visible [data-thread-stamp] wrapper
 * @param section - The section's bounding rect
 * @returns Landmarks in section-local px, or null when unmeasurable
 */
function measureStampMarks(
  stampEl: HTMLElement,
  section: DOMRect
): StampMarks | null {
  const sig = stampEl.querySelector<SVGTextElement>("[data-thread-sig]");
  if (!sig || typeof sig.getBBox !== "function") return null;

  const rect = stampEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2 - section.left;
  const cy = rect.top + rect.height / 2 - section.top;
  const scale = stampEl.offsetWidth / STAMP_VIEWBOX.width;
  if (!scale) return null;

  let matrix = { a: 1, b: 0, c: 0, d: 1 };
  const transform = getComputedStyle(stampEl).transform;
  if (transform && transform !== "none") {
    try {
      const m = new DOMMatrixReadOnly(transform);
      matrix = { a: m.a, b: m.b, c: m.c, d: m.d };
    } catch {
      /* keep identity */
    }
  }

  const map = (vx: number, vy: number): ThreadPoint => {
    const lx = (vx - STAMP_VIEWBOX.width / 2) * scale;
    const ly = (vy - STAMP_VIEWBOX.height / 2) * scale;
    return {
      x: cx + matrix.a * lx + matrix.c * ly,
      y: cy + matrix.b * lx + matrix.d * ly,
    };
  };

  let box: { x: number; y: number; width: number; height: number };
  try {
    box = sig.getBBox();
  } catch {
    return null;
  }
  if (!box.width) return null;

  const uy = box.y + box.height + 2.5;
  return {
    under: [
      map(box.x - 5, uy),
      map(box.x + box.width / 2, uy + 1.4),
      map(box.x + box.width + 4, uy - 0.4),
    ],
    entryLeft: map(10.5, 122),
    entryRight: map(289.5, 118),
    blotRight: map(288.5, 154),
    blotLeft: map(11, 152),
  };
}

/**
 * One per-chapter Red Thread segment. Mount as a direct child of the
 * chapter `<section data-chapter=…>` (which must be `relative`).
 *
 * @param props - The chapter id
 * @returns The segment SVG (aria-hidden; pointer-events: none)
 */
export function ThreadSegment({ id }: ThreadSegmentProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lenis = useLenis();
  const [state, setState] = useState<ThreadState | null>(null);

  /* ── Measure + (re)generate geometry ─────────────────────────── */
  useEffect(() => {
    const svg = svgRef.current;
    const section = svg?.closest<HTMLElement>("[data-chapter]");
    if (!svg || !section) return;
    let disposed = false;

    const apply = () => {
      if (disposed) return;
      const rect = section.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      const kickerEl = section.querySelector("[data-thread-kicker]");
      const nameEl =
        id === "01" ? section.querySelector("[data-thread-name]") : null;
      const wordEl =
        id === "03" ? section.querySelector("[data-thread-word]") : null;
      const rowEls =
        id === "05"
          ? Array.from(section.querySelectorAll("[data-thread-row]"))
          : [];
      const folioEl =
        id === "05" ? section.querySelector("[data-thread-folio]") : null;
      const stampEl = id === "07" ? visibleStamp(section) : null;
      const geometry = buildSegment({
        id,
        width: rect.width,
        height: rect.height,
        vw,
        kicker: kickerEl ? localBox(kickerEl, rect) : null,
        name: nameEl ? localBox(nameEl, rect) : null,
        word: wordEl ? localBox(wordEl, rect) : null,
        rows: rowEls.map((el) => localBox(el, rect)),
        folio: folioEl ? localBox(folioEl, rect) : null,
        stamp: stampEl ? localBox(stampEl, rect) : null,
        marks: stampEl ? measureStampMarks(stampEl, rect) : null,
      });
      if (!geometry) return;
      setState((prev) =>
        prev && prev.geometry.d === geometry.d
          ? prev
          : { geometry, undrawn: motionWorldPlanned() }
      );
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(section);
    /* The mono/serif swap can change the kicker's width without changing
       the section's size — re-measure once fonts settle. */
    document.fonts?.ready.then(apply);

    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [id]);

  /* ── Wire (or retire) the scrubbed drawing ───────────────────── */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !state) return;
    const section = svg.closest<HTMLElement>("[data-chapter]");
    const past = svg.querySelector<SVGPathElement>("path.thread-past");
    const swell = svg.querySelector<SVGPathElement>("path.thread-swell");
    const node = svg.querySelector<SVGGraphicsElement>("[data-thread-node]");
    if (!section || !past || !swell || !node) return;
    const inks = [past, swell];

    if (!lenis) {
      /* Static worlds (A7): the finished run. When the engine is merely
         still mounting, leave the undrawn render alone — this effect
         re-runs the moment the context delivers Lenis. */
      if (!motionWorldPlanned()) {
        for (const ink of inks) {
          ink.style.setProperty("stroke-dashoffset", "0");
        }
        node.classList.add("is-filled");
      }
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(inks, { strokeDashoffset: 1.5 });
      node.classList.remove("is-filled");
      gsap.to(inks, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: THREAD_TRIGGER_START,
          end: THREAD_TRIGGER_END,
          scrub: THREAD_SCRUB,
          onEnter: () => node.classList.add("is-filled"),
          onLeaveBack: () => node.classList.remove("is-filled"),
        },
      });
    });
    svg.setAttribute("data-thread-scrub", "");

    return () => {
      svg.removeAttribute("data-thread-scrub");
      ctx.revert();
    };
  }, [lenis, state]);

  const geometry = state?.geometry ?? null;
  const gateSize = geometry?.compact ? 7 : 9;
  const inkStyle = {
    strokeDasharray: "1 2",
    strokeDashoffset: state?.undrawn ? 1.5 : 0,
  } as const;

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      data-thread-segment={id}
      data-thread-dusk={isDuskChapter(id) ? "" : undefined}
      data-thread-compact={geometry?.compact ? "" : undefined}
      className="thread-segment pointer-events-none absolute inset-0 overflow-visible"
    >
      {geometry ? (
        <>
          <path className="thread-future" d={geometry.d} />
          <path
            className="thread-swell"
            d={geometry.dSwell}
            pathLength={1}
            style={inkStyle}
          />
          <path
            className="thread-past"
            d={geometry.d}
            pathLength={1}
            style={inkStyle}
          />
          {/* Painted last: the static worlds' cream re-inking of the
              tail must sit OVER the day-ink run it replaces */}
          {geometry.dDip ? (
            <path className="thread-dip" d={geometry.dDip} />
          ) : null}
          {geometry.node.kind === "gate" ? (
            <rect
              className="thread-node thread-node-gate"
              data-thread-node={id}
              x={geometry.node.x - gateSize / 2}
              y={geometry.node.y - gateSize / 2}
              width={gateSize}
              height={gateSize}
            />
          ) : (
            <path
              className="thread-node"
              data-thread-node={id}
              d={geometry.node.ringD}
            />
          )}
        </>
      ) : null}
    </svg>
  );
}
