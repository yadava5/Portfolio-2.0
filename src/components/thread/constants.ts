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

/** The fixed rail (left-4 + "NN name") ends by ~113px; stay right of it. */
const RAIL_CLEARANCE = 136;

/** Preferred spine inset left of the text edge inside the binding margin. */
const BINDING_INSET = 56;

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
  return 8;
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
  const wrapLeft = Math.max(0, (vw - WRAP_MAX_WIDTH) / 2);
  return Math.max(RAIL_CLEARANCE, wrapLeft + XL_BINDING_PAD - BINDING_INSET);
}
