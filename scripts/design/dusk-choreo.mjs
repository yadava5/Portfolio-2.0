/**
 * The dusk choreography (brief B9, retuned after the slow-scroll video
 * study docs/design-lab/shots-dusk2/) — shared stop math.
 *
 * SINGLE SOURCE OF TRUTH for the multi-stop 05→06 transition. Consumed by
 * BOTH scripts/design/waypoints-oklch.mjs (which emits the committed
 * TypeScript constants the engine reads) and scripts/qa/check-contrast.mjs
 * (which asserts WCAG AA at every rendered stop at build time). Changing a
 * curve constant here changes the site AND its proof together.
 *
 * Design (amendment A4, third pass): the before.webm study showed the
 * previous 11-stop schedule still read as a heavy switch on a real slow
 * scroll — telemetry put a ΔL 0.235 jump in ONE frame at p=0.55, with the
 * ink, header, contour texture and raking light all flipping in that same
 * frame, followed by a nearly flat night side (ΔL 0.073 over 45% of the
 * range). A continuous scrub through the whole span is still
 * mathematically impossible at AA (the luminance crossover where neither
 * ink clears 4.5:1 — see check-contrast.mjs), so this pass makes the one
 * unavoidable step SMALL and LONELY instead:
 *
 *   - UNIFORM RATE (equal ΔL per progress, not eased): each side descends
 *     linearly in oklch L, so the Full tier darkens at one steady speed
 *     and every Core step is the same small size (≤0.048 day, ≤0.021
 *     night) — no fast mid-descent lurch.
 *   - NARROWED FLIP PAIR: the day floor deepens to L 0.640 (body ink
 *     4.61:1 — margin shaved, still AA) and the night entry lifts to
 *     L 0.430 (clay-night 3.10:1, the binding graphic floor). The flip
 *     ΔL drops 0.235 → 0.210, ΔY 0.206 → 0.178.
 *   - LATER FLIP + DWELL: the day side now spends 0.66 of the range
 *     descending, rests on the floor through [0.66, 0.72), and flips at
 *     0.72 — the eye adapts to the deep paper before the jump, and the
 *     short night side settles right after instead of idling.
 *   - LONELY FLIP: only the field, the page ink and the scene marks flip
 *     at FLIP_POS. The raking light has ALREADY faded to nothing during
 *     the descent (globals.css derives its alpha from --arc-l), and the
 *     header + contour texture follow one stop later at CHROME_POS — a
 *     staggered dusk reads gradual where a synchronized one slams.
 *
 * Every rendered stop, and every fine-scrub interpolation between
 * same-side stops, holds AA for the ink that is live there.
 */

import { oklch, formatHex } from "culori";

/** Rendered day-side stops (index 0 = waypoint-05 itself). */
export const DAY_STOPS = 7;
/** Rendered night-side stops (last index = waypoint-06 itself). */
export const NIGHT_STOPS = 5;

/**
 * Day-side floor lightness (oklch L). Y ≈ 0.257 → body ink 4.61:1 and
 * gloaming clay 3.47:1 — the deepest paper full ink can stand on (AA
 * dies at L ≈ 0.633). The gloaming has already collapsed secondary
 * ink / opacity mutes to full ink by here.
 */
export const DAY_FLOOR_L = 0.64;

/**
 * Night-side entry lightness (oklch L). Y ≈ 0.079 → dusk ink 7.15:1 and
 * clay-night 3.10:1 (the graphic floor is the binding constraint — the
 * scenes' clay marks step to clay-night with the flip; it dies at
 * L ≈ 0.437).
 */
export const NIGHT_ENTRY_L = 0.43;

/**
 * Range fraction at which the day side finishes its descent and rests on
 * the floor — the dwell [DAY_FLOOR_POS, FLIP_POS) lets the eye adapt to
 * the deep paper before the one unavoidable step.
 */
export const DAY_FLOOR_POS = 0.66;

/**
 * Scroll fraction of the choreography range at which the flip lands
 * (background jumps day-floor → night-entry AND ink flips, together —
 * the forbidden mid-luminance band is never rendered).
 */
export const FLIP_POS = 0.72;

/** Range fraction at which the last night stop (waypoint-06) lands. */
export const NIGHT_LAST_POS = 0.95;

/**
 * Range fraction at which the CHROME follows the field into dusk (header
 * paper/ink, contour texture): one night stop after the flip, so the
 * masthead dims a beat after the world instead of slamming with it.
 * Both header voices are independently AA (ink on canvas / dusk ink on
 * waypoint-06), so the stagger is frame-safe in both directions.
 */
export const CHROME_POS =
  FLIP_POS + (NIGHT_LAST_POS - FLIP_POS) / (NIGHT_STOPS - 1);

/**
 * The gloaming's deepened clay (kiln clay cooled to umber): replaces
 * clay-graphic for marks while the day side darkens — ≥3:1 on every
 * day-side stop (3.47:1 at the floor) where clay-graphic itself dies
 * below Y 0.64. Mirrored in globals.css (html[data-arc-gloaming]).
 */
export const GLOAMING_CLAY = "#61250f";

/**
 * Build the full stop schedule from the two waypoint hexes.
 *
 * L is LINEAR in stop index AND in pos on each side (uniform ΔL per
 * step for Core, uniform darkening rate for the Full fine-scrub). The
 * amber swell keeps its sine shape: chroma rises toward the ember
 * mid-descent, hue drifts from golden into the dusk corridor.
 *
 * @param {string} w05hex - golden hour (--waypoint-05)
 * @param {string} w06hex - dusk (--waypoint-06)
 * @returns {{side: "day"|"night", hex: string, l: number, c: number,
 *   h: number, pos: number}[]} stops in scroll order; `pos` is the range
 *   fraction at which the stop becomes current (stop i is rendered for
 *   progress in [pos_i, pos_{i+1}))
 */
export function buildDuskStops(w05hex, w06hex) {
  const w05 = oklch(w05hex);
  const w06 = oklch(w06hex);
  const stops = [];

  for (let i = 0; i < DAY_STOPS; i++) {
    const t = i / (DAY_STOPS - 1);
    stops.push({
      side: "day",
      l: w05.l + (DAY_FLOOR_L - w05.l) * t,
      /* amber swell: chroma rises toward the ember mid-descent, hue
         drifts from golden toward the dusk corridor */
      c: w05.c + (0.052 - w05.c) * Math.sin(Math.PI * Math.min(1, t * 1.15)),
      h: w05.h + (62 - w05.h) * t,
      pos: (DAY_FLOOR_POS * i) / (DAY_STOPS - 1),
    });
  }
  for (let i = 0; i < NIGHT_STOPS; i++) {
    const t = i / (NIGHT_STOPS - 1);
    stops.push({
      side: "night",
      l: NIGHT_ENTRY_L + (w06.l - NIGHT_ENTRY_L) * t,
      c: 0.032 + (w06.c - 0.032) * t,
      h: 60 + (w06.h - 60) * t,
      pos: FLIP_POS + (NIGHT_LAST_POS - FLIP_POS) * t,
    });
  }

  /* Exact endpoints: the resting frames ARE the waypoints. */
  stops[0] = { ...stops[0], l: w05.l, c: w05.c, h: w05.h };
  const last = stops.length - 1;
  stops[last] = { ...stops[last], l: w06.l, c: w06.c, h: w06.h };

  return stops.map((s) => ({
    ...s,
    l: round(s.l, 4),
    c: round(s.c, 4),
    h: round(s.h, 2),
    pos: round(s.pos, 4),
    hex: formatHex({ mode: "oklch", l: s.l, c: s.c, h: s.h }),
  }));
}

const round = (value, places) =>
  Math.round(value * 10 ** places) / 10 ** places;
