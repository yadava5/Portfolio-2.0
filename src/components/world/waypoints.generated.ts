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
  {
    id: "04",
    name: "warm afternoon",
    hex: "#f5eddc",
    l: 0.9478,
    c: 0.0241,
    h: 85.79,
  },
  {
    id: "05",
    name: "golden hour",
    hex: "#f2e4c9",
    l: 0.923,
    c: 0.0388,
    h: 83.83,
  },
  { id: "06", name: "dusk", hex: "#43372f", l: 0.3471, c: 0.0218, h: 55.56 },
  {
    id: "07",
    name: "nightfall",
    hex: "#2c2622",
    l: 0.2739,
    c: 0.0116,
    h: 55.85,
  },
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
 * The dusk choreography (brief B9): the 05→06 boundary rendered as
 * 11 discrete stops over a bounded scroll range. The ink flips WITH the
 * background at DUSK_FLIP_POS — the mid-luminance band where neither ink
 * holds AA is never rendered (the flip is the one intentional jump).
 * Core tier steps stop-to-stop; Full tier fine-scrubs between same-side
 * stops. check-contrast.mjs asserts AA at every stop AND every sampled
 * fine-scrub interpolation.
 */
export const DUSK_CHOREO: readonly DuskStop[] = [
  { side: "day", hex: "#f2e4c9", l: 0.923, c: 0.0388, h: 83.83, pos: 0 },
  { side: "day", hex: "#ecdbbe", l: 0.8974, c: 0.0433, h: 81.74, pos: 0.0917 },
  { side: "day", hex: "#dbc4a3", l: 0.8304, c: 0.0513, h: 76.29, pos: 0.1833 },
  { side: "day", hex: "#c2a88d", l: 0.7476, c: 0.0481, h: 69.54, pos: 0.275 },
  { side: "day", hex: "#aa9480", l: 0.6806, c: 0.0388, h: 64.08, pos: 0.3667 },
  { side: "day", hex: "#a38c79", l: 0.655, c: 0.0388, h: 62, pos: 0.4583 },
  { side: "night", hex: "#5a493c", l: 0.42, c: 0.032, h: 60, pos: 0.55 },
  { side: "night", hex: "#57463a", l: 0.4093, c: 0.0305, h: 59.35, pos: 0.64 },
  { side: "night", hex: "#4f4035", l: 0.3836, c: 0.0269, h: 57.78, pos: 0.73 },
  { side: "night", hex: "#463a31", l: 0.3578, c: 0.0233, h: 56.21, pos: 0.82 },
  { side: "night", hex: "#43372f", l: 0.3471, c: 0.0218, h: 55.56, pos: 0.91 },
];

/** Range fraction at which the day→night flip lands (both directions). */
export const DUSK_FLIP_POS = 0.55;
