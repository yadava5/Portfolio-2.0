/**
 * WCAG contrast gate for the Daylight Study palette.
 *
 * Verifies every contrast claim in docs/NEW-PORTFOLIO-MASTER-PLAN.md Part 3.4
 * plus the semantic-alias pairings introduced in globals.css. Fails the build
 * if any pair drops below its required ratio.
 *
 * The day-arc mid-interpolation sampler (rubric amendment A4) lives here as
 * `sampleArc()`: ≥10 oklch-interpolated samples per scrubbed waypoint
 * segment, each asserted ≥4.5:1 against the ink that is live at that scroll
 * position. The 05→06 dusk boundary is a STEP (see below), so only its two
 * endpoint states are rendered — and asserted.
 */

import { interpolate, formatHex } from "culori";

// ── Palette (must mirror src/app/globals.css) ──────────────────────────
const C = {
  canvas: "#faf6ef",
  surface1: "#f3ede1",
  surface2: "#eae2d2",
  ink: "#26231c",
  inkSecondary: "#5c564a",
  clay: "#b04a28",
  clayGraphic: "#c4532e",
  pine: "#2f5d50",
  pass: "#2e6b4f",
  fail: "#a03b23",
  inkDusk: "#f6efe2",
  clayNight: "#e08a5f",
  w01: "#fbf3e7",
  w02: "#faf6ef",
  w03: "#f6f3ea",
  w04: "#f5eddc",
  w05: "#f2e4c9",
  w06: "#43372f",
  w07: "#2c2622",
};

function srgbToLin(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}

export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// ── Required pairs: [label, fg, bg, minimum ratio] ─────────────────────
const PAIRS = [
  // Plan Part 3.4 claims
  ["ink on canvas", C.ink, C.canvas, 4.5],
  ["secondary ink on canvas", C.inkSecondary, C.canvas, 4.5],
  ["clay (text) on canvas", C.clay, C.canvas, 4.5],
  ["pine on canvas", C.pine, C.canvas, 4.5],
  ["pass on canvas", C.pass, C.canvas, 4.5],
  ["fail on canvas", C.fail, C.canvas, 4.5],
  ["clay-graphic on canvas (graphic ≥3:1)", C.clayGraphic, C.canvas, 3.0],
  ["dusk ink on waypoint-06", C.inkDusk, C.w06, 4.5],
  ["night clay on waypoint-07", C.clayNight, C.w07, 4.5],
  // Ink must hold AA on every day waypoint (01–05)
  ["ink on dawn (01)", C.ink, C.w01, 4.5],
  ["secondary ink on dawn (01)", C.inkSecondary, C.w01, 4.5],
  ["ink on noon (03)", C.ink, C.w03, 4.5],
  ["secondary ink on noon (03)", C.inkSecondary, C.w03, 4.5],
  ["ink on afternoon (04)", C.ink, C.w04, 4.5],
  ["secondary ink on afternoon (04)", C.inkSecondary, C.w04, 4.5],
  ["ink on golden hour (05)", C.ink, C.w05, 4.5],
  ["secondary ink on golden hour (05)", C.inkSecondary, C.w05, 4.5],
  ["dusk ink on nightfall (07)", C.inkDusk, C.w07, 4.5],
  // Ink + accents on raised surfaces
  ["ink on surface-1", C.ink, C.surface1, 4.5],
  ["ink on surface-2", C.ink, C.surface2, 4.5],
  ["secondary ink on surface-1", C.inkSecondary, C.surface1, 4.5],
  ["pine on surface-1", C.pine, C.surface1, 4.5],
  // Dossier archive stock (= surface-1): ink + clay only accents
  ["clay (text) on archive stock", C.clay, C.surface1, 4.5],
  [
    "clay-graphic on archive stock (graphic ≥3:1)",
    C.clayGraphic,
    C.surface1,
    3.0,
  ],
  // Semantic-alias button pairings (error/404/skip-link)
  ["canvas text on clay button", C.canvas, C.clay, 4.5],
  ["canvas text on pine button", C.canvas, C.pine, 4.5],
];

// ── Day-arc sampler (amendment A4) ─────────────────────────────────────
//
// The engine (src/components/world/DayArc.tsx) scrubs oklch channels
// between adjacent waypoints, so mid-interpolation colors are really
// rendered — every one must hold AA against the ink that is live there.
//
// The 05→06 boundary is a STEP by mathematical necessity: any continuous
// path from #f2e4c9 (Y≈0.78) to #43372f (Y≈0.04) passes through the
// luminance crossover where the best achievable ratio for EITHER ink is
// ≈4.1:1 < 4.5:1. So background and ink flip together at the boundary and
// no interpolated frame exists; sampleArc asserts its endpoints only.
const SCRUBBED_SEGMENTS = [
  ["01→02 (dawn→morning)", C.w01, C.w02, C.ink, "ink"],
  ["02→03 (morning→noon)", C.w02, C.w03, C.ink, "ink"],
  ["03→04 (noon→afternoon)", C.w03, C.w04, C.ink, "ink"],
  ["04→05 (afternoon→golden hour)", C.w04, C.w05, C.ink, "ink"],
  ["06→07 (dusk→nightfall)", C.w06, C.w07, C.inkDusk, "dusk ink"],
];

const STEP_BOUNDARY = [
  ["05→06 step, day side", C.ink, C.w05, "ink"],
  ["05→06 step, dusk side", C.inkDusk, C.w06, "dusk ink"],
];

/**
 * Sample every scrubbed day-arc segment in oklch and assert AA at each
 * rendered interpolation point, plus both endpoint states of the dusk step.
 *
 * @param {number} samples - Samples per segment, endpoints included
 *   (12 ⇒ 10 strictly-interior mid-interpolation points, ≥10 per A4).
 * @returns {boolean} true when every sample holds ≥4.5:1
 */
export function sampleArc(samples = 12) {
  let ok = true;

  for (const [label, fromHex, toHex, inkHex, inkName] of SCRUBBED_SEGMENTS) {
    const mix = interpolate([fromHex, toHex], "oklch");
    let worst = Infinity;
    let worstHex = fromHex;
    for (let i = 0; i < samples; i++) {
      const bg = formatHex(mix(i / (samples - 1)));
      const ratio = contrast(inkHex, bg);
      if (ratio < worst) {
        worst = ratio;
        worstHex = bg;
      }
    }
    const pass = worst >= 4.5;
    if (!pass) ok = false;
    console.log(
      `${pass ? "PASS" : "FAIL"}  ${worst.toFixed(2)}:1 (min 4.5:1)  ` +
        `arc ${label} — ${inkName}, worst of ${samples} oklch samples (${worstHex})`
    );
  }

  for (const [label, fg, bg, inkName] of STEP_BOUNDARY) {
    const ratio = contrast(fg, bg);
    const pass = ratio >= 4.5;
    if (!pass) ok = false;
    console.log(
      `${pass ? "PASS" : "FAIL"}  ${ratio.toFixed(2)}:1 (min 4.5:1)  ` +
        `arc ${label} — ${inkName} (no interpolation rendered at the step)`
    );
  }

  return ok;
}

let failed = false;
for (const [label, fg, bg, min] of PAIRS) {
  const ratio = contrast(fg, bg);
  const ok = ratio >= min;
  if (!ok) failed = true;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${ratio.toFixed(2)}:1 (min ${min}:1)  ${label}`
  );
}

console.log("");
if (!sampleArc()) failed = true;

if (failed) {
  console.error("\nContrast gate FAILED.");
  process.exit(1);
}
console.log("\nContrast gate passed.");
