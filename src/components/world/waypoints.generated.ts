/**
 * GENERATED FILE — do not edit by hand.
 *
 * Source: the --waypoint-NN hex tokens in src/app/globals.css, converted to
 * oklch by scripts/design/waypoints-oklch.mjs (culori). Regenerate with:
 *
 *   node scripts/design/waypoints-oklch.mjs
 *
 * The day-arc engine (src/components/world/DayArc.tsx) scrubs the numeric
 * l/c/h channels between adjacent waypoints (amendment A4) — never tween
 * color strings.
 */

/** One day-arc waypoint: source hex plus its oklch channels. */
export interface ArcWaypoint {
  /** Two-digit chapter id ("01"–"07") */
  readonly id: string;
  /** Human waypoint name (dawn … nightfall) */
  readonly name: string;
  /** Source hex from globals.css */
  readonly hex: string;
  /** oklch lightness (0–1) */
  readonly l: number;
  /** oklch chroma */
  readonly c: number;
  /** oklch hue (degrees) */
  readonly h: number;
}

/** The seven day-arc waypoints, dawn → nightfall, in chapter order. */
export const ARC_WAYPOINTS: readonly ArcWaypoint[] = [
  { id: "01", name: "dawn", hex: "#fbf3e7", l: 0.9671, c: 0.0181, h: 78.24 },
  { id: "02", name: "morning", hex: "#faf6ef", l: 0.9743, c: 0.0102, h: 81.8 },
  { id: "03", name: "noon", hex: "#f6f3ea", l: 0.964, c: 0.0123, h: 91.52 },
  { id: "04", name: "warm afternoon", hex: "#f5eddc", l: 0.9478, c: 0.0241, h: 85.79 },
  { id: "05", name: "golden hour", hex: "#f2e4c9", l: 0.923, c: 0.0388, h: 83.83 },
  { id: "06", name: "dusk", hex: "#43372f", l: 0.3471, c: 0.0218, h: 55.56 },
  { id: "07", name: "nightfall", hex: "#2c2622", l: 0.2739, c: 0.0116, h: 55.85 },
];

/**
 * The dusk flip happens at the boundary INTO this chapter (05→06): the
 * background and ink both step (never scrub) — see amendment A4 and
 * scripts/qa/check-contrast.mjs sampleArc() for the proof this is required.
 */
export const DUSK_FLIP_CHAPTER = "06";

/** One rendered stop of the dusk choreography (brief B9). */
export interface DuskStop {
  /** Which ink is live at this stop ("day" = --color-ink, "night" = --color-ink-dusk) */
  readonly side: "day" | "night";
  /** Composed hex (for tests/screenshots; the engine writes channels) */
  readonly hex: string;
  /** oklch lightness (0–1) */
  readonly l: number;
  /** oklch chroma */
  readonly c: number;
  /** oklch hue (degrees) */
  readonly h: number;
  /** Range fraction at which this stop becomes current */
  readonly pos: number;
}

/**
 * The dusk choreography (brief B9, retuned per the shots-dusk2 slow-scroll
 * study): the 05→06 boundary rendered as 12 discrete stops over a
 * bounded scroll range, L linear in progress on each side (uniform ΔL per
 * step). The ink flips WITH the background at DUSK_FLIP_POS — the
 * mid-luminance band where neither ink holds AA is never rendered (the
 * flip is the one intentional jump, narrowed to ΔL 0.21 and kept lonely:
 * the rake has already faded out, and the chrome follows at
 * DUSK_CHROME_POS). Core tier steps stop-to-stop; Full tier fine-scrubs
 * between same-side stops. check-contrast.mjs asserts AA at every stop
 * AND every sampled fine-scrub interpolation.
 */
export const DUSK_CHOREO: readonly DuskStop[] = [
  { side: "day", hex: "#f2e4c9", l: 0.923, c: 0.0388, h: 83.83, pos: 0 },
  { side: "day", hex: "#e6d3b4", l: 0.8759, c: 0.0463, h: 80.19, pos: 0.11 },
  { side: "day", hex: "#dac3a2", l: 0.8287, c: 0.0511, h: 76.55, pos: 0.22 },
  { side: "day", hex: "#cdb394", l: 0.7815, c: 0.0516, h: 72.91, pos: 0.33 },
  { side: "day", hex: "#bda489", l: 0.7343, c: 0.0476, h: 69.28, pos: 0.44 },
  { side: "day", hex: "#ac9681", l: 0.6872, c: 0.0405, h: 65.64, pos: 0.55 },
  { side: "day", hex: "#9e8774", l: 0.64, c: 0.0388, h: 62, pos: 0.66 },
  { side: "night", hex: "#5d4c3e", l: 0.43, c: 0.032, h: 60, pos: 0.72 },
  { side: "night", hex: "#57473a", l: 0.4093, c: 0.0295, h: 58.89, pos: 0.7775 },
  { side: "night", hex: "#504137", l: 0.3886, c: 0.0269, h: 57.78, pos: 0.835 },
  { side: "night", hex: "#493c33", l: 0.3679, c: 0.0244, h: 56.67, pos: 0.8925 },
  { side: "night", hex: "#43372f", l: 0.3471, c: 0.0218, h: 55.56, pos: 0.95 },
];

/** Range fraction at which the day→night flip lands (both directions). */
export const DUSK_FLIP_POS = 0.72;

/**
 * Range fraction at which the paper TEXTURE (the contour plate) follows
 * the field into dusk — one night stop after the flip, both directions.
 * The masthead no longer waits for it: it composes the field's own
 * channels and flips with data-arc-phase (CRITIC-LEDGER F61 — a chrome
 * that lags a scrubbing field reads as an unstyled bar, not a beat).
 */
export const DUSK_CHROME_POS = 0.7775;
