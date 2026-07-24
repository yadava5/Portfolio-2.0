/**
 * Day-arc waypoint generator (rubric amendment A4).
 *
 * Reads the seven `--waypoint-NN` hex tokens out of src/app/globals.css
 * (single source of truth — never hand-guess channel values), converts them
 * to oklch via culori, and writes the committed TypeScript constant file
 * consumed by the scroll engine:
 *
 *   src/components/world/waypoints.generated.ts
 *
 * Run after any waypoint hex change:
 *   node scripts/design/waypoints-oklch.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { oklch } from "culori";
import { buildDuskStops, FLIP_POS, CHROME_POS } from "./dusk-choreo.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const cssPath = resolve(repoRoot, "src/app/globals.css");
const outPath = resolve(
  repoRoot,
  "src/components/world/waypoints.generated.ts"
);

const WAYPOINT_NAMES = {
  "01": "dawn",
  "02": "morning",
  "03": "noon",
  "04": "warm afternoon",
  "05": "golden hour",
  "06": "dusk",
  "07": "nightfall",
};

const css = readFileSync(cssPath, "utf8");
const waypoints = [];
for (const match of css.matchAll(/--waypoint-(\d{2}):\s*(#[0-9a-fA-F]{6})/g)) {
  const [, id, hex] = match;
  waypoints.push({ id, hex: hex.toLowerCase() });
}

if (waypoints.length !== 7) {
  console.error(
    `Expected 7 --waypoint-NN tokens in globals.css, found ${waypoints.length}.`
  );
  process.exit(1);
}

waypoints.sort((a, b) => a.id.localeCompare(b.id));

const round = (value, places = 4) =>
  Math.round(value * 10 ** places) / 10 ** places;

const rows = waypoints.map(({ id, hex }) => {
  const { l, c, h } = oklch(hex);
  if (l === undefined || c === undefined || h === undefined) {
    console.error(`Could not convert ${hex} (waypoint ${id}) to oklch.`);
    process.exit(1);
  }
  return {
    id,
    name: WAYPOINT_NAMES[id],
    hex,
    l: round(l),
    c: round(c),
    h: round(h, 2),
  };
});

/* Hue continuity guard: adjacent scrubbed segments interpolate `h` linearly,
   which is only correct while every adjacent delta stays far from the 360°
   seam. The palette lives in a warm ≤60° corridor (NO-LIST §A), so any large
   delta means a token regression — fail loudly. */
for (let i = 1; i < rows.length; i++) {
  const delta = Math.abs(rows[i].h - rows[i - 1].h);
  if (delta > 60) {
    console.error(
      `Hue delta ${delta.toFixed(2)}° between waypoint ${rows[i - 1].id} and ${
        rows[i].id
      } exceeds the 60° corridor — linear h interpolation is unsafe.`
    );
    process.exit(1);
  }
}

const body = rows
  .map(
    (r) =>
      `  { id: "${r.id}", name: "${r.name}", hex: "${r.hex}", l: ${r.l}, c: ${r.c}, h: ${r.h} },`
  )
  .join("\n");

/* The dusk choreography (brief B9): multi-stop 05→06 schedule, derived
   from the same waypoint tokens by scripts/design/dusk-choreo.mjs — the
   module check-contrast.mjs asserts. */
const w05row = rows.find((r) => r.id === "05");
const w06row = rows.find((r) => r.id === "06");
const duskStops = buildDuskStops(w05row.hex, w06row.hex);
const duskBody = duskStops
  .map(
    (s) =>
      `  { side: "${s.side}", hex: "${s.hex}", l: ${s.l}, c: ${s.c}, h: ${s.h}, pos: ${s.pos} },`
  )
  .join("\n");

const output = `/**
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
${body}
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
 * study): the 05→06 boundary rendered as ${duskStops.length} discrete stops over a
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
${duskBody}
];

/** Range fraction at which the day→night flip lands (both directions). */
export const DUSK_FLIP_POS = ${FLIP_POS};

/**
 * Range fraction at which the chrome (header, contour texture) follows
 * the field into dusk — one night stop after the flip, both directions.
 */
export const DUSK_CHROME_POS = ${round(CHROME_POS, 4)};
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, output);
console.log(`Wrote ${outPath}`);
for (const r of rows) {
  console.log(
    `  ${r.id} ${r.name.padEnd(15)} ${r.hex}  l=${r.l} c=${r.c} h=${r.h}`
  );
}
