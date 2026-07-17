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
