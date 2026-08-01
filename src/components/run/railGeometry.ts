/**
 * @fileoverview The rail's path — ported from the prototype's buildThread.
 *
 * THE ONE THING PRODUCTION'S RAIL GOT WRONG, and it is visible from
 * across a room: the prototype's line CROSSES THE PAGE. Its anchors
 * alternate side to side — 30 / 70 / 31 / 69 / 33 / 67 percent of the
 * viewport width — so the line sweeps between the prose margin and the
 * figure column at every station, and a reader watching it sees a route
 * being travelled. Production drew the same continuity, the same
 * scroll-coupling and the same token at ONE fixed x in the left gutter,
 * which is a margin rule, not a route. Four rounds of measurement said
 * "continuous, reversible, tracks scroll" and all of it was true.
 *
 * Everything here is DOCUMENT space. The canvas is viewport-sized and
 * fixed; the painter subtracts scroll. That split is what lets one line
 * span a 14,000px document without seams — the failure mode of the seven
 * welded per-section SVG segments it replaces, which could not flow
 * because each was drawn in its own section's coordinates.
 */

import { lerp } from "./fxEngine";

export interface RailSample {
  x: number;
  y: number;
  /** Arc length from the start — the token's coordinate system. */
  L: number;
}

export interface RailBeat {
  top: number;
  h: number;
}

/**
 * Where the line sits at each station, as a percentage of viewport width.
 *
 * Eleven stops: arrival, who, the yard, applied, cadence, glyph, jetpack,
 * lifequest, automl, the review, the gate. Normal stations keep the line
 * by the prose margin; the alternation is the crossing. The last value
 * hugs the ladder column so the line arrives at the gate along the margin
 * instead of slashing across the ledger card.
 */
export const RAIL_X_WIDE = [50, 30, 70, 31, 69, 33, 67, 33, 67, 30, 24];
export const RAIL_X_STACKED = [50, 26, 74, 26, 74, 26, 74, 26, 74, 26, 20];

/**
 * Build the rail's sampled path through the beats.
 *
 * @param beats - Document-space top/height per beat, in order
 * @param vw - Viewport width
 * @param stacked - Narrow layout (the crossing widens, the wobble halves)
 * @param gateAnchor - Document-space point the line must terminate on
 * @returns Samples with cumulative arc length, and the total length
 */
export function buildRail(
  beats: RailBeat[],
  vw: number,
  stacked: boolean,
  gateAnchor?: { x: number; y: number }
): { samples: RailSample[]; length: number } {
  if (!beats.length) return { samples: [], length: 0 };
  const stx = stacked ? RAIL_X_STACKED : RAIL_X_WIDE;
  const xAt = (i: number) =>
    ((stx[Math.min(i, stx.length - 1)] ?? 50) / 100) * vw;

  const anchors: [number, number][] = [];
  /* Under the name — the line starts inside beat 0, not above it. */
  anchors.push([xAt(0), beats[0].top + beats[0].h * 0.42]);
  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    const x = xAt(i);
    if (i > 0) anchors.push([x, b.top + b.h * 0.18]);
    anchors.push([x, b.top + b.h * 0.52]);
    /* The mid-point between two stations, low in the outgoing beat: this
       is the anchor that makes the crossing a sweep rather than a jog. */
    if (i < beats.length - 1) {
      anchors.push([lerp(x, xAt(i + 1), 0.5), b.top + b.h * 0.95]);
    }
  }
  if (gateAnchor) {
    anchors[anchors.length - 1] = [gateAnchor.x, gateAnchor.y];
  }
  anchors.sort((a, b) => a[1] - b[1]);

  /* Densify with cosine easing between anchors, plus two sine terms as a
     hand wobble. X only — y stays monotonic, which is what lets the
     painter binary-search the visible run by scroll position. */
  const amp = stacked ? 8 : 16;
  const samples: RailSample[] = [];
  let L = 0;
  let px = 0;
  let py = 0;
  const put = (x: number, y: number) => {
    if (samples.length) L += Math.hypot(x - px, y - py);
    samples.push({ x, y, L });
    px = x;
    py = y;
  };

  for (let k = 0; k < anchors.length - 1; k++) {
    const [x0, y0] = anchors[k];
    const [x1, y1] = anchors[k + 1];
    const steps = Math.max(2, Math.round((y1 - y0) / 22));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const y = lerp(y0, y1, t);
      put(
        lerp(x0, x1, 0.5 - 0.5 * Math.cos(Math.PI * t)) +
          Math.sin(y * 0.011 + 2.1) * amp * 0.5 +
          Math.sin(y * 0.0037 + 0.7) * amp,
        y
      );
    }
  }
  const last = anchors[anchors.length - 1];
  put(last[0], last[1]);

  return { samples, length: L };
}

/** First sample at or past a document-space y (y is monotonic). */
export function idxAtY(samples: RailSample[], y: number): number {
  let lo = 0;
  let hi = samples.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].y < y) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Arc length at a document-space y — the token's position from scroll. */
export function lenAtY(samples: RailSample[], y: number): number {
  if (!samples.length) return 0;
  const i = idxAtY(samples, y);
  if (i <= 0) return samples[0].L;
  const a = samples[i - 1];
  const b = samples[i];
  const span = b.y - a.y;
  const t = span > 0 ? (y - a.y) / span : 0;
  return lerp(a.L, b.L, t);
}

/** The point at an arc length — where the token actually sits. */
export function pointAtLen(
  samples: RailSample[],
  L: number
): { x: number; y: number } {
  if (!samples.length) return { x: 0, y: 0 };
  let lo = 0;
  let hi = samples.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].L < L) lo = mid + 1;
    else hi = mid;
  }
  if (lo <= 0) return { x: samples[0].x, y: samples[0].y };
  const a = samples[lo - 1];
  const b = samples[lo];
  const span = b.L - a.L;
  const t = span > 0 ? (L - a.L) / span : 0;
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}
