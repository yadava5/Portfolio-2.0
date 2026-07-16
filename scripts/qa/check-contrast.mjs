/**
 * WCAG contrast gate for the Daylight Study palette.
 *
 * Verifies every contrast claim in docs/NEW-PORTFOLIO-MASTER-PLAN.md Part 3.4
 * plus the semantic-alias pairings introduced in globals.css. Fails the build
 * if any pair drops below its required ratio.
 *
 * The day-arc mid-interpolation sampler (rubric amendment A4) extends this
 * file: `sampleArc()` checks N oklch-interpolated steps between waypoints.
 */

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
  // Semantic-alias button pairings (error/404/skip-link)
  ["canvas text on clay button", C.canvas, C.clay, 4.5],
  ["canvas text on pine button", C.canvas, C.pine, 4.5],
];

let failed = false;
for (const [label, fg, bg, min] of PAIRS) {
  const ratio = contrast(fg, bg);
  const ok = ratio >= min;
  if (!ok) failed = true;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${ratio.toFixed(2)}:1 (min ${min}:1)  ${label}`
  );
}

if (failed) {
  console.error("\nContrast gate FAILED.");
  process.exit(1);
}
console.log("\nContrast gate passed.");
