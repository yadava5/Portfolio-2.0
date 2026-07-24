/**
 * The dusk choreography (brief B9) — shared stop math.
 *
 * SINGLE SOURCE OF TRUTH for the multi-stop 05→06 transition. Consumed by
 * BOTH scripts/design/waypoints-oklch.mjs (which emits the committed
 * TypeScript constants the engine reads) and scripts/qa/check-contrast.mjs
 * (which asserts WCAG AA at every rendered stop at build time). Changing a
 * curve constant here changes the site AND its proof together.
 *
 * Design (amendment A4, evolved): the old single STEP at the 05→06
 * boundary (ΔY 0.745 — "very sudden") becomes ELEVEN rendered stops over a
 * bounded scroll range. A continuous scrub through the whole span is still
 * mathematically impossible at AA (the luminance crossover where neither
 * ink clears 4.5:1 — see check-contrast.mjs), so the choreography descends
 * the DAY side as far as full ink allows (the gloaming state deepens every
 * muted voice to full ink first — that is what buys the depth), flips ink
 * and background TOGETHER across the forbidden band in one small step
 * (ΔY ≈ 0.21, 3.6× gentler than before), then settles the NIGHT side onto
 * waypoint-06. Every rendered stop, and every fine-scrub interpolation
 * between same-side stops, holds AA for the ink that is live there.
 */

import { oklch, formatHex } from "culori";

/** Rendered day-side stops (index 0 = waypoint-05 itself). */
export const DAY_STOPS = 6;
/** Rendered night-side stops (last index = waypoint-06 itself). */
export const NIGHT_STOPS = 5;

/**
 * Day-side floor lightness (oklch L). Y ≈ 0.279 → body ink 4.92:1 — the
 * deepest paper full ink can stand on with margin. The gloaming has
 * already collapsed secondary ink / opacity mutes to full ink by here.
 */
export const DAY_FLOOR_L = 0.655;

/**
 * Night-side entry lightness (oklch L). Y ≈ 0.073 → dusk ink 7.5:1 and
 * clay-night ≥3.25:1 (the graphic floor is the binding constraint — the
 * scenes' clay marks step to clay-night with the flip).
 */
export const NIGHT_ENTRY_L = 0.42;

/**
 * Scroll fraction of the choreography range at which the flip lands
 * (background jumps day-floor → night-entry AND ink flips, together —
 * the forbidden mid-luminance band is never rendered).
 */
export const FLIP_POS = 0.55;

/**
 * The gloaming's deepened clay (kiln clay cooled to umber): replaces
 * clay-graphic for marks while the day side darkens — ≥3:1 on every
 * day-side stop (3.70:1 at the floor) where clay-graphic itself dies
 * below Y 0.64. Mirrored in globals.css (html[data-arc-gloaming]).
 */
export const GLOAMING_CLAY = "#61250f";

const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

/**
 * Build the full stop schedule from the two waypoint hexes.
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
    const t = easeInOutSine(i / (DAY_STOPS - 1));
    stops.push({
      side: "day",
      l: w05.l + (DAY_FLOOR_L - w05.l) * t,
      /* amber swell: chroma rises toward the ember mid-descent, hue
         drifts from golden toward the dusk corridor */
      c: w05.c + (0.052 - w05.c) * Math.sin(Math.PI * Math.min(1, t * 1.15)),
      h: w05.h + (62 - w05.h) * t,
      pos: (FLIP_POS * i) / DAY_STOPS,
    });
  }
  for (let i = 0; i < NIGHT_STOPS; i++) {
    const t = easeInOutSine(i / (NIGHT_STOPS - 1));
    stops.push({
      side: "night",
      l: NIGHT_ENTRY_L + (w06.l - NIGHT_ENTRY_L) * t,
      c: 0.032 + (w06.c - 0.032) * t,
      h: 60 + (w06.h - 60) * t,
      pos: FLIP_POS + ((1 - FLIP_POS) * i) / NIGHT_STOPS,
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
