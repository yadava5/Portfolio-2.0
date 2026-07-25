/**
 * @fileoverview Red Thread constants — seam coordinates + scrub contract.
 *
 * Amendment A3's shared constants module: every per-chapter segment reads
 * the SAME `spineX(viewportWidth)` so endpoints align exactly across
 * chapter seams (same x where segment N exits and segment N+1 enters).
 *
 * Spine placement (documented decision):
 *   - ≥1280 (xl): the BINDING margin — the gutter StoryShell's WRAP
 *     reserves at `xl:pl-36` for the fixed chapter rail. The spine sits
 *     between the rail's active-name column and the text edge, like the
 *     sewn thread in a bound working paper.
 *   - 1024–1279 (lg, no rail): the right `sm:px-12` gutter — content
 *     fills the wrap at these widths and the only guaranteed text-free
 *     vertical lane is the outer right margin.
 *   - <1024: the left `px-6`/`sm:px-12` gutter at reduced prominence
 *     (thinner strokes — see globals.css `[data-thread-compact]`). Text
 *     never starts before 24px, the spine never wanders past ~23px, so
 *     the thread survives 390px without hiding — and no longer hugs the
 *     screen edge (the 12px inset read as clipped at r2 review).
 *
 * THE 1280 SWITCH IS AUTHORED, AND IT IS NOT SMALL (CRITIC-LEDGER F63,
 * corrected). The ledger reports "a 96.8px lateral snap on one pixel of
 * window width", measured on chapter 03's path start. Re-measured
 * across the boundary, chapter 03's SPINE goes from x = 1253 at
 * vw = 1279 to x = 152 at vw = 1280 — the thread changes SIDES, a
 * ~1,100px move. (534.0 → 630.8, the ledger's figures, are chapter 01's
 * gesture start, which is not the spine. The original report the ledger
 * dismissed — "teleports across the screen" — was the accurate one.)
 *
 * The switch is deliberate and stays: 1280 is Tailwind's `xl`, exactly
 * where the fixed chapter rail appears and the wrap gains its `xl:pl-36`
 * binding margin. Below it there is no rail and no binding margin, and
 * the only text-free vertical lane is the right gutter. The ledger's fix
 * line — "interpolate `spineX` across a 1200–1360 band" — cannot be
 * taken: interpolating between the right gutter and the left binding
 * margin runs the thread straight through the body column for the whole
 * band. What WAS wrong, and is fixed, is the rail clearance the binding
 * seat clamps to (see `RAIL_EDGE`) and the rebuild cost of a resize drag
 * (ThreadSegment now coalesces its ResizeObserver to one rAF).
 */

/** Below/at this viewport width the thread is compact (left gutter). */
export const THREAD_COMPACT_MAX = 1023;

/** At/above this width (xl) the spine moves to the binding margin. */
export const THREAD_BINDING_MIN = 1280;

/** How far segment paths overshoot their section box at each seam (px).
 *  Both neighbors overshoot, so the weld under `overflow-visible` is
 *  seamless even while round linecaps render. */
export const SEAM_OVERSHOOT = 6;

/** ScrollTrigger contract (A3): the drawing head roughly tracks the
 *  reading position. `clamp()` keeps the first and last segments'
 *  ranges inside the reachable scroll span so they fully draw. */
export const THREAD_TRIGGER_START = "clamp(top 80%)";
export const THREAD_TRIGGER_END = "clamp(bottom 60%)";
export const THREAD_SCRUB = 0.7;

/** Mirrors StoryShell's WRAP: `max-w-[1240px] … xl:pl-36`. */
const WRAP_MAX_WIDTH = 1240;
const XL_BINDING_PAD = 144;

/**
 * The fixed chapter rail's real right edge.
 *
 * MEASURED, not estimated (CRITIC-LEDGER F82): the widest `.rail-label`
 * ends at **x = 142** at every xl width — the rail is `fixed left-4`, so
 * it does not move with the viewport. The constant this replaces was
 * 136, carrying the comment "the rail ends by ~113px", and it was
 * already stale before Wave 2's F13 fix made all seven chapter NAMES
 * rest visible instead of only the active one.
 *
 * Re-measure with `docs/design-lab/probe-w4rail.mjs` if the rail's type
 * or its `left-4` seat ever changes.
 */
const RAIL_EDGE = 142;

/** Spine centre floor: clear of the rail by a comfortable hairline. */
const RAIL_CLEARANCE = RAIL_EDGE + 10;

/** Preferred spine inset left of the text edge inside the binding margin. */
const BINDING_INSET = 56;

/** Breath the spine keeps off the text edge when the margin is tight. */
const TEXT_EDGE_GAP = 6;

/** Wobble floors/ceilings — the hand wanders as much as the lane allows. */
const WOBBLE_MAX = 8;
const WOBBLE_MIN = 2;

/**
 * The binding margin's usable lane at a given xl width: where the spine
 * sits, and how far the hand may wander either side of it without
 * touching the rail on the left or the text on the right.
 *
 * Between 1280 and ~1364 the margin is genuinely narrow — the rail is
 * fixed at the viewport's left edge while the wrap is still nearly
 * centred — so the seat is pinned to the clearance and the wobble
 * shrinks to fit. Past that the preferred inset takes over and the hand
 * gets its full 8px.
 *
 * @param vw - Viewport width in px
 * @returns Spine x and the wobble amplitude that fits beside it
 */
function bindingLane(vw: number): { x: number; amp: number } {
  const wrapLeft = Math.max(0, (vw - WRAP_MAX_WIDTH) / 2);
  const textEdge = wrapLeft + XL_BINDING_PAD;
  const ceiling = Math.max(RAIL_CLEARANCE, textEdge - TEXT_EDGE_GAP);
  const x = Math.min(
    Math.max(textEdge - BINDING_INSET, RAIL_CLEARANCE),
    ceiling
  );
  const room = Math.min(x - RAIL_EDGE - 4, ceiling - x);
  return {
    x,
    amp: Math.max(WOBBLE_MIN, Math.min(WOBBLE_MAX, Math.floor(room))),
  };
}

/** Compact (<1024) spine x — inside the 24px `px-6` gutter. */
const COMPACT_SPINE_X = 20;

/** lg (1024–1279) spine inset from the right viewport edge. */
const LG_GUTTER_INSET = 26;

/**
 * Wobble amplitude for the spine descent at a given viewport width.
 *
 * @param vw - Viewport width in px
 * @returns Max sideways wander of the hand-drawn line, in px
 */
export function wobbleAmp(vw: number): number {
  if (vw <= THREAD_COMPACT_MAX) return 3;
  if (vw < THREAD_BINDING_MIN) return 6;
  return bindingLane(vw).amp;
}

/**
 * The seam x — the ONE x-coordinate every segment shares at chapter
 * boundaries. All segments must enter and exit on this spine.
 *
 * @param vw - Viewport width in px (documentElement.clientWidth)
 * @returns Spine x in page/section coordinates
 */
export function spineX(vw: number): number {
  if (vw <= THREAD_COMPACT_MAX) return COMPACT_SPINE_X;
  if (vw < THREAD_BINDING_MIN) return vw - LG_GUTTER_INSET;
  return bindingLane(vw).x;
}
