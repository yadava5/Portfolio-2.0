/**
 * @fileoverview Thread-as-citation — the ink line becomes the apparatus.
 *
 * W1 (Refinement Era): on a case file, hovering or focusing a receipts
 * row that cites an on-page figure ("see fig. N …", `[data-cites]` set
 * by EvidenceTable) draws a hand-wobbled pen stroke from the row's
 * margin, down the same margin lane the dossier thread rides, into the
 * cited plate's frame — where it rests in a small pool. The stroke
 * draws in ~400ms and retracts on blur (~300ms). The mono "see fig. N"
 * text link is ALWAYS present in the row; this stroke is enhancement.
 *
 * Worlds (amendment A7): the machinery exists ONLY in the engine world
 * (`useLenis() !== null`) on hover-capable desktop pointers ≥1024px —
 * static, reduced-motion, and touch worlds get the text link alone.
 * The path reuses the Red Thread's own hand (mulberry32 wobble +
 * Catmull-Rom pen + terminal ink pool from thread/geometry.ts) and its
 * drawing convention (pathLength=1, dasharray "1 2", dashoffset
 * 1.5 → 0 — the NO-LIST's one sanctioned non-transform animation).
 * No filters, no gradients; geometry is measured at hover time against
 * the overlay's own box, so scrolling never skews an active stroke.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useLenis } from "@/components/layout/SmoothScroll";
import { dossierSpineX } from "@/components/case-study/DossierThread";
import {
  catmullRomPath,
  inkPool,
  mulberry32,
} from "@/components/thread/geometry";

/** The worlds that earn the stroke: desktop widths, real hover */
const STROKE_MEDIA = "(min-width: 1024px) and (hover: hover)";

/**
 * Same-document signal from the audit walk (AuditRun): as each citing
 * row ticks, the walk asks this machinery — reused, never duplicated —
 * to draw its stroke to the cited plate. detail.rowId names the row;
 * null retracts. Ignored entirely outside the engine world (this
 * component mounts nothing there).
 */
export const AUDIT_CITE_EVENT = "paper:audit-cite";

/** One active citation stroke */
interface CitationStroke {
  d: string;
  /** Remount key: every new row restarts the draw from undrawn */
  key: number;
  /** False renders undrawn (offset 1.5); true draws (offset 0) */
  drawn: boolean;
}

/**
 * Cheap stable hash of a row's identity → wobble seed (the same row
 * always draws the same hand).
 *
 * @param value - Row id/anchor string
 * @returns Integer seed
 */
function seedOf(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Build the citation stroke: row margin → lane descent → plate frame.
 *
 * @param row - The hovered receipts row
 * @param plate - The cited figure element
 * @param overlay - The overlay svg's own bounding box (coordinate origin)
 * @returns Path data, or null when the geometry cannot be drawn
 */
function buildStroke(
  row: HTMLElement,
  plate: HTMLElement,
  overlay: DOMRect
): string | null {
  const rowBox = row.getBoundingClientRect();
  const plateBox = plate.getBoundingClientRect();
  if (rowBox.width < 40 || plateBox.width < 40) return null;

  const vw = document.documentElement.clientWidth;
  const spine = dossierSpineX(vw);
  const compact = vw < 1280;
  const laneX = spine + (compact ? 8 : 14);
  const amp = compact ? 2 : 4;

  /* Localize against the overlay box — immune to containing-block quirks */
  const rx = rowBox.left - overlay.left;
  const ry = rowBox.top - overlay.top + Math.min(18, rowBox.height / 2);
  const px = plateBox.left - overlay.left;
  const py = plateBox.top - overlay.top;
  if (laneX >= rx - 10) return null; /* no margin lane to ride */

  const rand = mulberry32(seedOf(row.id || row.dataset.cites || "cite"));
  const pts: { x: number; y: number }[] = [];

  /* Leave the row at its margin edge, bow into the lane */
  pts.push({ x: rx - 6, y: ry });
  pts.push({ x: (laneX + rx) / 2, y: ry + 10 });
  pts.push({ x: laneX + 2, y: ry + 44 });

  /* The lane descent — the dossier thread's own wander, one hand over */
  const laneEndY = py - 32;
  const span = laneEndY - (ry + 44);
  if (span > 140) {
    const steps = Math.min(12, Math.max(2, Math.round(span / 320)));
    const phase = rand() * Math.PI * 2;
    const waves = 0.8 + rand() * 1.2;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      pts.push({
        x:
          laneX +
          Math.sin(phase + t * Math.PI * waves) * amp +
          (rand() - 0.5) * amp * 0.5,
        y: ry + 44 + span * t + (rand() - 0.5) * Math.min(20, span * 0.05),
      });
    }
  }
  if (laneEndY > ry + 44) pts.push({ x: laneX, y: laneEndY });

  /* Curve into the plate: kiss the frame's top-left, rest just inside */
  pts.push({ x: (laneX + px) / 2, y: py - 10 + rand() * 4 });
  pts.push({ x: px - 8, y: py - 4 });
  const tip = { x: px + 3, y: py + 12 };
  pts.push(tip);

  const core = catmullRomPath(pts);
  if (!core) return null;
  return core + inkPool(tip.x + 0.5, tip.y + 1, 2, rand);
}

/**
 * The citation-stroke overlay. Mount once per dossier article, after
 * DossierThread. Renders nothing outside the engine world.
 *
 * @returns The overlay svg (aria-hidden, pointer-events: none)
 */
export function CitationInk() {
  const lenis = useLenis();
  const svgRef = useRef<SVGSVGElement>(null);
  const [stroke, setStroke] = useState<CitationStroke | null>(null);

  useEffect(() => {
    if (!lenis) return;
    const svg = svgRef.current;
    const host = svg?.closest<HTMLElement>("[data-dossier]");
    if (!svg || !host) return;

    let activeRow: HTMLElement | null = null;
    let keySeq = 0;
    let raf = 0;

    const activate = (row: HTMLElement) => {
      if (row === activeRow) return;
      if (!window.matchMedia(STROKE_MEDIA).matches) return;
      const cites = row.dataset.cites;
      const plate = cites ? document.getElementById(`fig-${cites}`) : null;
      if (!plate || !svg) return;
      const d = buildStroke(row, plate, svg.getBoundingClientRect());
      if (!d) return;
      activeRow = row;
      keySeq += 1;
      const key = keySeq;
      /* Two frames: mount undrawn, then draw — the transition needs a
         painted starting offset to animate from. */
      setStroke({ d, key, drawn: false });
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => {
          setStroke((prev) =>
            prev && prev.key === key ? { ...prev, drawn: true } : prev
          );
        });
      });
    };

    const deactivate = (row: HTMLElement) => {
      if (row !== activeRow) return;
      activeRow = null;
      setStroke((prev) => (prev ? { ...prev, drawn: false } : prev));
    };

    const rowOf = (target: EventTarget | null): HTMLElement | null =>
      target instanceof Element
        ? target.closest<HTMLElement>("[data-cites]")
        : null;

    const onPointerOver = (event: PointerEvent) => {
      const row = rowOf(event.target);
      if (row) activate(row);
      else if (activeRow) deactivate(activeRow);
    };
    const onPointerOut = (event: PointerEvent) => {
      const row = rowOf(event.target);
      if (!row || rowOf(event.relatedTarget) === row) return;
      deactivate(row);
    };
    const onFocusIn = (event: FocusEvent) => {
      const row = rowOf(event.target);
      if (row) activate(row);
    };
    const onFocusOut = (event: FocusEvent) => {
      const row = rowOf(event.target);
      if (!row || rowOf(event.relatedTarget) === row) return;
      deactivate(row);
    };

    /* The audit walk borrows the same pen: draw to each citing row's
       plate as it ticks; a non-citing row (or null) retracts. */
    const onAuditCite = (event: Event) => {
      const rowId = (event as CustomEvent<{ rowId: string | null }>).detail
        ?.rowId;
      const row = rowId ? document.getElementById(rowId) : null;
      if (row?.dataset.cites) activate(row);
      else if (activeRow) deactivate(activeRow);
    };

    host.addEventListener("pointerover", onPointerOver);
    host.addEventListener("pointerout", onPointerOut);
    host.addEventListener("focusin", onFocusIn);
    host.addEventListener("focusout", onFocusOut);
    window.addEventListener(AUDIT_CITE_EVENT, onAuditCite);

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointerover", onPointerOver);
      host.removeEventListener("pointerout", onPointerOut);
      host.removeEventListener("focusin", onFocusIn);
      host.removeEventListener("focusout", onFocusOut);
      window.removeEventListener(AUDIT_CITE_EVENT, onAuditCite);
      setStroke(null);
    };
  }, [lenis]);

  if (!lenis) return null;

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      data-citation-ink
      className="pointer-events-none absolute inset-0 overflow-visible"
    >
      {/* Dash geometry + offsets live in CSS (.citation-stroke): an
          inline stroke-dashoffset would outrank the .is-drawn class */}
      {stroke ? (
        <path
          key={stroke.key}
          className={`citation-stroke ${stroke.drawn ? "is-drawn" : ""}`}
          d={stroke.d}
          pathLength={1}
        />
      ) : null}
    </svg>
  );
}
