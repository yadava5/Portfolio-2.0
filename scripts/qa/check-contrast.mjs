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
 * position. A continuous 05→06 scrub remains mathematically impossible at
 * AA (see STEP_BOUNDARY below); the choreographed multi-stop transition
 * that replaced the single step (brief B9) is asserted stop-by-stop —
 * including its Full-tier fine-scrub interpolations and its gloaming
 * voice states — by `sampleDuskChoreo()`.
 */

import { interpolate, formatHex, rgb } from "culori";
import {
  buildDuskStops,
  CHROME_POS,
  FLIP_POS,
  GLOAMING_CLAY,
} from "../design/dusk-choreo.mjs";

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
  clayEmber: "#f57a3e",
  clayInvite: "#ec814d",
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

/**
 * Composite an sRGB colour over an opaque backdrop at a given alpha.
 *
 * The CSS the site ships paints a solid `--color-canvas` pseudo-element
 * at `opacity: <alpha>` over the surface beneath it, which is exactly
 * source-over in sRGB — so the gate can assert the colour a reader's eye
 * actually receives rather than the token that was authored.
 *
 * @param {string} top - Hex of the overlay colour
 * @param {string} bottom - Hex of the opaque backdrop
 * @param {number} alpha - Overlay opacity, 0–1
 * @returns {string} Hex of the composited colour
 */
function blend(top, bottom, alpha) {
  const parse = (hex) => {
    const n = hex.replace("#", "");
    return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  };
  const [t, b] = [parse(top), parse(bottom)];
  return `#${t
    .map((channel, i) =>
      Math.round(channel * alpha + b[i] * (1 - alpha))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
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
  // The APPROVED stamp's reserved ember (globals.css --color-clay-ember):
  // the site's loudest chroma, and it must hold AA as TEXT on the
  // nightfall ground it inks — the crescendo has to stay legible, not
  // just loud. (The plate paints it at 0.92 opacity; the dried composite
  // over w07 measures ~4.87:1 — also AA — but the token itself is the
  // honest gate here.)
  ["clay-ember (approved stamp ink) on waypoint-07", C.clayEmber, C.w07, 4.5],
  // The awaiting "press here to sign" line (globals.css --color-clay-invite):
  // warmed a step from clay-night toward the reserved ember so the
  // invitation leads the eye without stealing the crescendo's peak. It is
  // TEXT, so it holds AA on the nightfall ground. (The awaiting group
  // paints it at 0.9 opacity; the resting composite over w07 measures
  // ~4.76:1 — also AA — but the solid token is the honest gate here.)
  [
    "clay-invite (awaiting sign label) on waypoint-07",
    C.clayInvite,
    C.w07,
    4.5,
  ],
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
  // ── The asked-for row (fix round 3, S4) ────────────────────────────
  // A deep-linked receipt lifts its paper toward `--color-canvas`: peak
  // opacity 1 during the 2s settle, resting residue 0.45, both composited
  // over the dossier's archive stock. Every ink a receipt row can print
  // is asserted on BOTH composites, because the first instinct — a clay
  // wash — was measured and rejected: a 4% clay tint drops clay TEXT (the
  // HELD stamp inside such a row) from 4.67:1 to 4.46:1, i.e. sub-AA. The
  // lifted wash moves every ink the other way, and this gate is what says
  // so out loud rather than in a comment.
  ...[
    ["settle peak", 1],
    ["resting residue", 0.45],
  ].flatMap(([phase, alpha]) => {
    const bg = blend(C.canvas, C.surface1, alpha);
    return [
      [`ink on target row (${phase})`, C.ink, bg, 4.5],
      [`secondary ink on target row (${phase})`, C.inkSecondary, bg, 4.5],
      [`clay (text) on target row (${phase})`, C.clay, bg, 4.5],
      [
        `clay-graphic margin rule on target row (${phase}, graphic ≥3:1)`,
        C.clayGraphic,
        bg,
        3.0,
      ],
    ];
  }),
  // W1 stampable registry row: the approved mark's clay gate-square must
  // hold graphic contrast across chapter 04's whole scrub range (w04→w05
  // interpolates monotonically in luminance, so endpoints bound it).
  // NOTE: clay TEXT fails 4.5:1 on golden hour (≈4.3) — that is WHY the
  // mark's word is body ink and only the square is clay.
  ["clay-graphic on afternoon (04, graphic ≥3:1)", C.clayGraphic, C.w04, 3.0],
  ["clay-graphic on golden hour (05, graphic ≥3:1)", C.clayGraphic, C.w05, 3.0],
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

// ── Dusk choreography sampler (brief B9) ───────────────────────────────
//
// The 05→06 boundary is no longer ONE step: DayArc renders the committed
// DUSK_CHOREO stop schedule (derived by scripts/design/dusk-choreo.mjs —
// imported here, so the site and its proof share one source). Contract
// asserted at build time, per stop:
//   - DAY-side stops render under the GLOAMING (globals.css
//     [data-arc-gloaming]): every muted voice is already FULL ink and
//     clay marks are the deepened umber — so the live voices are body
//     ink (4.5:1) and gloaming clay (graphic, 3:1).
//   - NIGHT-side stops render dusk ink (4.5:1) and clay-night (3:1) —
//     the scenes' night step lands WITH the flip.
//   - The flip pair (day floor → night entry) is a step; nothing between
//     them is ever rendered (the forbidden band).
//   - Full tier fine-scrubs BETWEEN same-side stops: interior
//     interpolation samples are asserted for each adjacent pair.
//   - The range edges are the un-gloamed resting states: stop 0 must
//     hold the normal day voices on w05 (secondary ink + the ink@0.70
//     mutes), the final stop the normal dusk mutes on w06 — those are
//     the exact frames where DayArc steps the gloaming on/off.
//   - Core-reduced band (§F1b): 8–12 rendered stops.
//
// Retune claims (the shots-dusk2 slow-scroll study — the before video
// measured a ΔL 0.235 one-frame flip with every surface in sync):
//   - THE FLIP PAIR IS NARROW: ΔL ≤ 0.215 and ΔY ≤ 0.185 — the deepest
//     day floor and lightest night entry the ink floors allow.
//   - EVERY Core step is small: same-side stop-to-stop ΔL ≤ 0.055
//     (uniform-rate schedule — no eased mid-descent lurch).
//   - THE CHROME STAGGER is safe: between FLIP_POS and CHROME_POS the
//     header still wears its day voice on its own canvas paper while
//     the field is already night — both header voices are asserted on
//     their own papers, so the stagger holds AA in both directions.

/** Gamma-space alpha composite — how the browser paints opacity mutes. */
function compositeHex(fgHex, alpha, bgHex) {
  const f = rgb(fgHex);
  const b = rgb(bgHex);
  return formatHex({
    mode: "rgb",
    r: f.r * alpha + b.r * (1 - alpha),
    g: f.g * alpha + b.g * (1 - alpha),
    b: f.b * alpha + b.b * (1 - alpha),
  });
}

/**
 * Assert the whole dusk choreography. Logs one line per check.
 *
 * @param {number} pairSamples - interior samples per fine-scrub pair
 * @returns {boolean} true when every rendered state holds its floor
 */
export function sampleDuskChoreo(pairSamples = 8) {
  let ok = true;
  const check = (label, ratio, min) => {
    const pass = ratio >= min;
    if (!pass) ok = false;
    console.log(
      `${pass ? "PASS" : "FAIL"}  ${ratio.toFixed(2)}:1 (min ${min}:1)  ${label}`
    );
  };

  const stops = buildDuskStops(C.w05, C.w06);

  if (stops.length < 8 || stops.length > 12) {
    ok = false;
    console.log(
      `FAIL  dusk choreography renders ${stops.length} stops — the Core-reduced band is 8–12 (§F1b)`
    );
  } else {
    console.log(
      `PASS  dusk choreography renders ${stops.length} stops (Core-reduced band 8–12)`
    );
  }

  stops.forEach((stop, i) => {
    const tag = `dusk stop ${i}/${stops.length - 1} (${stop.side}, ${stop.hex})`;
    if (stop.side === "day") {
      check(`${tag} — body ink`, contrast(C.ink, stop.hex), 4.5);
      check(
        `${tag} — gloaming clay (graphic ≥3:1)`,
        contrast(GLOAMING_CLAY, stop.hex),
        3.0
      );
    } else {
      check(`${tag} — dusk ink`, contrast(C.inkDusk, stop.hex), 4.5);
      check(
        `${tag} — clay-night (graphic ≥3:1)`,
        contrast(C.clayNight, stop.hex),
        3.0
      );
    }
  });

  /* Full-tier fine scrub: every interpolated frame between same-side
     stops is really rendered — sample the interiors. */
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (a.side !== b.side) {
      console.log(
        `PASS  —          dusk pair ${i}→${i + 1} is THE FLIP (never interpolated; ` +
          `ink flips with the background)`
      );
      continue;
    }
    const mix = interpolate([a.hex, b.hex], "oklch");
    const inkHex = a.side === "day" ? C.ink : C.inkDusk;
    let worst = Infinity;
    let worstHex = a.hex;
    for (let k = 1; k <= pairSamples; k++) {
      const bg = formatHex(mix(k / (pairSamples + 1)));
      const ratio = contrast(inkHex, bg);
      if (ratio < worst) {
        worst = ratio;
        worstHex = bg;
      }
    }
    check(
      `dusk fine-scrub pair ${i}→${i + 1} (${a.side}) — worst of ${pairSamples} samples (${worstHex})`,
      worst,
      4.5
    );
  }

  /* Retune guards (shots-dusk2): the one unavoidable step stays narrow,
     every rendered step stays small, and the staggered chrome window is
     AA on both of its papers. */
  const flipIdx = stops.findIndex((s) => s.side === "night");
  const floor = stops[flipIdx - 1];
  const entry = stops[flipIdx];
  const flipDL = floor.l - entry.l;
  const flipDY = luminance(floor.hex) - luminance(entry.hex);
  const guard = (label, value, max) => {
    const pass = value <= max;
    if (!pass) ok = false;
    console.log(
      `${pass ? "PASS" : "FAIL"}  ${value.toFixed(3)} (max ${max})  ${label}`
    );
  };
  guard("flip pair ΔL (oklch) — the one rendered jump", flipDL, 0.215);
  guard("flip pair ΔY (WCAG luminance)", flipDY, 0.185);
  let worstStep = 0;
  for (let i = 1; i < stops.length; i++) {
    if (stops[i].side !== stops[i - 1].side) continue;
    worstStep = Math.max(worstStep, Math.abs(stops[i - 1].l - stops[i].l));
  }
  guard("largest same-side Core step ΔL (uniform rate)", worstStep, 0.055);
  if (!(CHROME_POS > FLIP_POS && CHROME_POS < 1)) {
    ok = false;
    console.log(
      `FAIL  chrome stagger CHROME_POS ${CHROME_POS} must sit inside (FLIP_POS, 1)`
    );
  } else {
    console.log(
      `PASS  chrome stagger window (${FLIP_POS} → ${CHROME_POS.toFixed(4)})`
    );
  }
  check(
    "chrome stagger window — header day voice on its canvas paper",
    contrast(C.ink, C.canvas),
    4.5
  );
  check(
    "chrome stagger landed — header dusk voice on waypoint-06 paper",
    contrast(C.inkDusk, C.w06),
    4.5
  );

  /* Range edges: the exact frames where the gloaming steps on/off. */
  check(
    "gloaming entry frame — secondary ink on w05 (stop 0)",
    contrast(C.inkSecondary, C.w05),
    4.5
  );
  check(
    "gloaming entry frame — ink@0.70 mute composite on w05 (stop 0)",
    contrast(compositeHex(C.ink, 0.7, C.w05), C.w05),
    4.5
  );
  check(
    "gloaming exit frame — dusk ink@0.70 mute composite on w06",
    contrast(compositeHex(C.inkDusk, 0.7, C.w06), C.w06),
    4.5
  );
  check(
    "gloaming exit frame — dusk ink@0.60 mute composite on w06",
    contrast(compositeHex(C.inkDusk, 0.6, C.w06), C.w06),
    4.5
  );

  /* Scene-figure quiet SVG text (.sc-quiet, opacity 0.72 — its OWN mute,
     not the utility classes): the gloaming presses it to full ink inside
     the range (globals.css — at the day floor its composite reads ~2.9:1,
     found by the shots-dusk2 small-font audit), so the RANGE states are
     covered by the per-stop full-ink checks above. The rest frames are
     where it still renders muted — assert both. */
  check(
    "scene quiet text rest frame — ink@0.72 composite on w05",
    contrast(compositeHex(C.ink, 0.72, C.w05), C.w05),
    4.5
  );
  check(
    "scene quiet text rest frame — dusk ink@0.72 composite on w06",
    contrast(compositeHex(C.inkDusk, 0.72, C.w06), C.w06),
    4.5
  );

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

console.log("");
if (!sampleDuskChoreo()) failed = true;

if (failed) {
  console.error("\nContrast gate FAILED.");
  process.exit(1);
}
console.log("\nContrast gate passed.");
