/**
 * @fileoverview Red Thread measurement — one ruler for both worlds.
 *
 * The thread renders twice, never at once: the motion world's fixed
 * canvas rail (ThreadRail) and the static worlds' per-chapter SVG
 * segments (ThreadSegment). Both build their geometry from the SAME
 * measured boxes via `measureSegmentEnv`, so the rail's line and the
 * settled line are one line — amendment A7's "the static end-state
 * equals the animation's final frame" holds by construction, not by
 * duplicate rulers agreeing.
 *
 * Extracted verbatim from ThreadSegment (round 12): `localBox`,
 * `visibleStamp` and `measureStampMarks` moved here unchanged so the
 * rail could share them without importing a React component's file.
 */

import type {
  SegmentEnv,
  StampMarks,
  ThreadBox,
  ThreadPoint,
} from "./geometry";

/** The awaiting stamp's SVG viewBox (ApprovedStamp.tsx) */
const STAMP_VIEWBOX = { width: 300, height: 190 };

/**
 * A child box in section-local coordinates.
 *
 * @param el - Element to measure
 * @param section - The section's bounding rect
 * @returns Box relative to the section's border box
 */
export function localBox(el: Element, section: DOMRect): ThreadBox {
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
export function visibleStamp(section: HTMLElement): HTMLElement | null {
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
export function measureStampMarks(
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
 * Measure one chapter section into the geometry builder's environment —
 * the anchors ThreadSegment always gathered (kicker, hero name, deck
 * word, work rows, folio rule, gate stamp), section-local, per chapter.
 *
 * @param section - The chapter `<section data-chapter>` element
 * @param id - Two-digit chapter id ("01"–"07")
 * @param wantsDip - Whether the nightfall dip should be built (static
 *   worlds only — CRITIC-LEDGER F79)
 * @returns The builder environment
 */
export function measureSegmentEnv(
  section: HTMLElement,
  id: string,
  wantsDip: boolean
): SegmentEnv {
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
  return {
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
    wantsDip,
  };
}
