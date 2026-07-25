/**
 * @fileoverview Red Thread geometry — hand-wobbled ink paths, pure math.
 *
 * Builds each chapter segment's path in PIXEL space from measured layout
 * boxes (section, kicker, hero name, deck word, work rows, folio rule,
 * gate stamp). No viewBox stretching: authoring in px keeps the
 * candidate-C wobble undistorted at every viewport, keeps the dashed
 * "future" pattern (2 6) honest, and makes `pathLength=1` +
 * stroke-dashoffset drawing reliable cross-browser.
 *
 * Wobble is seeded per chapter (mulberry32), so a segment's hand shake
 * is stable across re-measures — resizing scales the journey, it never
 * re-rolls it.
 *
 * INK PHYSICALITY (craft round, 2026-07-18):
 *   - Every segment also yields `dSwell`: the same anchor run offset
 *     perpendicular by a curvature-driven distance (0 on straights,
 *     ~1px in bends, pooled at terminals). Layered under the main
 *     stroke it swells the union ~1.3→2.2px where a nib would press —
 *     no filters, no gradients (amendment A3).
 *   - The line begins in a small irregular ink pool (chapter 01) and
 *     ends in a heavier blot ON the gate stamp's boundary (chapter 07).
 *     Both are tiny closed subpaths of the SAME path, so they draw
 *     exactly when the head reaches them.
 *   - Chapter nodes are hand-drawn irregular rings (closed wobbled
 *     loops), except chapter 04's gate-square — the one intentional
 *     glyph stays geometric.
 *
 * PER-CHAPTER GESTURES (rail grammar constant, content-touch varies):
 *   01 origin flick under the hero name · 02 kicker underline (its
 *   original home — one continuous loop, same-tangent junctions) ·
 *   03 underlines the word "mess" in the deck · 04 nothing but the
 *   gate-square · 05 a small tick beside each work row as the line
 *   passes · 06 nothing (fig 6.1 carries printed check-strokes) ·
 *   07 the finale: the run curves INTO the stamp's edge, underlines
 *   "awaiting your signature", and blots on the boundary.
 *
 * Seam contract (amendment A3): segments 02–07 START at exactly
 * `(spine, -SEAM_OVERSHOOT)`; segments 01–06 END at exactly
 * `(spine, height + SEAM_OVERSHOOT)`. Segment 05 additionally yields
 * `dDip` — its tail below the measured 05|06 folio terminator — which
 * the static worlds re-ink in dusk cream (the pen dips through
 * nightfall exactly at the authored seam).
 */

import {
  SEAM_OVERSHOOT,
  THREAD_BINDING_MIN,
  THREAD_COMPACT_MAX,
  spineX,
  wobbleAmp,
} from "./constants";

/** A measured layout box in section-local px. */
export interface ThreadBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** A point in section-local px. */
export interface ThreadPoint {
  x: number;
  y: number;
}

/** Gate-stamp landmarks in section-local px (measured through the
 *  stamp's CSS rotation by ThreadSegment). */
export interface StampMarks {
  /** Beneath "awaiting your signature", left → mid → right */
  under: [ThreadPoint, ThreadPoint, ThreadPoint];
  /** On the frame's left edge, at entry height */
  entryLeft: ThreadPoint;
  /** On the frame's right edge, at entry height */
  entryRight: ThreadPoint;
  /** On the frame's right edge, below the signature line */
  blotRight: ThreadPoint;
  /** On the frame's left edge, below the signature line */
  blotLeft: ThreadPoint;
}

/** Everything a segment build needs, all in section-local px. */
export interface SegmentEnv {
  /** Two-digit chapter id ("01"–"07") */
  id: string;
  /** Section box width (== page width for full-bleed chapters) */
  width: number;
  /** Section box height */
  height: number;
  /** Viewport width (documentElement.clientWidth) for breakpoints */
  vw: number;
  /** Kicker `<p>` box ([data-thread-kicker]) or null */
  kicker: ThreadBox | null;
  /** Hero name sub-line box ([data-thread-name], chapter 01) or null */
  name: ThreadBox | null;
  /** Deck word box ([data-thread-word], chapter 03) or null */
  word: ThreadBox | null;
  /** Work-row article boxes ([data-thread-row], chapter 05) */
  rows: ThreadBox[];
  /** Folio-rule box ([data-thread-folio], chapter 05) or null */
  folio: ThreadBox | null;
  /** Visible gate stamp box ([data-thread-stamp], chapter 07) or null */
  stamp: ThreadBox | null;
  /** Stamp landmarks measured through its rotation (chapter 07) */
  marks: StampMarks | null;
  /**
   * Whether the nightfall dip is wanted — i.e. whether this reader is
   * in a world that PAINTS it (CRITIC-LEDGER F79).
   *
   * `.thread-dip` is `display: none` by default and `inline` only in
   * the static worlds, yet `dipRun()` + a second `catmullRomPath()` ran
   * on every chapter-05 re-measure and the path shipped in the DOM
   * regardless. Probed in the motion world: 1 dip node present, 0
   * painted. The flag puts the computation behind the same gate as the
   * paint, so the majority world pays for neither.
   */
  wantsDip: boolean;
}

/** The chapter node seated on the segment's first point. */
export interface ThreadNodeSpec {
  /** "gate" renders the clay gate-square (chapter 04); "ring" a
   *  hand-drawn irregular ring */
  kind: "ring" | "gate";
  x: number;
  y: number;
  /** Ring path data (kind "ring" only) */
  ringD?: string;
}

/** One segment's generated geometry. */
export interface SegmentGeometry {
  /** Path data for the dashed future + scrubbed solid past */
  d: string;
  /** Pressure layer: the offset swell run (no terminal subpaths) */
  dSwell: string;
  /** Static-world nightfall dip (segment 05 below its folio) or null */
  dDip: string | null;
  /** The chapter node at the segment's entry (or origin, for 01) */
  node: ThreadNodeSpec;
  /** True below 1024px — reduced-prominence styling hook */
  compact: boolean;
}

interface Pt {
  x: number;
  y: number;
}

/**
 * Deterministic PRNG (mulberry32) so wobble is stable per chapter.
 * Exported for the dossier pages' static thread (DossierThread.tsx).
 *
 * @param seed - Any integer seed
 * @returns A function yielding floats in [0, 1)
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Format a coordinate at 0.1px precision. */
function f(n: number): string {
  return String(Math.round(n * 10) / 10);
}

/**
 * Smooth a point run into cubic beziers (Catmull-Rom conversion) — the
 * hand-drawn look: the pen passes through every anchor, gently.
 * Exported for the dossier pages' static thread (DossierThread.tsx).
 *
 * @param pts - Ordered anchor points
 * @returns SVG path data
 */
export function catmullRomPath(pts: Pt[]): string {
  if (pts.length < 2) return "";
  let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return d;
}

/**
 * A small closed irregular loop — an ink pool, not a geometric circle.
 * Emitted as a standalone subpath so it draws when the head arrives.
 * Exported for the dossier pages' static thread (DossierThread.tsx).
 *
 * @param cx - Center x
 * @param cy - Center y
 * @param r - Nominal radius
 * @param rand - Seeded RNG
 * @returns Closed-subpath data
 */
export function inkPool(
  cx: number,
  cy: number,
  r: number,
  rand: () => number
): string {
  const n = 6;
  const pts: Pt[] = [];
  const phase = rand() * Math.PI * 2;
  for (let i = 0; i < n; i++) {
    const a = phase + (i / n) * Math.PI * 2;
    const rr = r * (0.72 + rand() * 0.5);
    pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr });
  }
  let d = ` M${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p0 = pts[(i - 1 + n) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return `${d} Z`;
}

/**
 * The hand-drawn irregular node ring: a closed wobbled loop that still
 * fills cleanly when the drawing head passes (class toggle).
 *
 * @param cx - Center x
 * @param cy - Center y
 * @param r - Nominal radius
 * @param rand - Seeded RNG
 * @returns Closed ring path data
 */
function irregularRing(
  cx: number,
  cy: number,
  r: number,
  rand: () => number
): string {
  return inkPool(cx, cy, r * 1.18, rand);
}

/**
 * The pressure layer: offset every anchor along its normal by a
 * curvature-driven distance (a nib presses through bends) plus a small
 * pool near the run's terminals. Straights collapse onto the main
 * stroke; the union swells only where the hand slows.
 *
 * @param pts - The main anchor run
 * @returns Offset anchor run for the swell path
 */
function swellRun(pts: Pt[]): Pt[] {
  if (pts.length < 3) return pts.slice();
  /* Cumulative arc distances for terminal pooling */
  const dist: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    dist.push(
      dist[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
    );
  }
  const total = dist[dist.length - 1] || 1;
  const out: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(pts.length - 1, i + 1)];
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const tl = Math.hypot(tx, ty) || 1;
    /* Turn angle at this anchor → pressure */
    const v1x = pts[i].x - prev.x;
    const v1y = pts[i].y - prev.y;
    const v2x = next.x - pts[i].x;
    const v2y = next.y - pts[i].y;
    const l1 = Math.hypot(v1x, v1y) || 1;
    const l2 = Math.hypot(v2x, v2y) || 1;
    const cos = Math.min(1, Math.max(-1, (v1x * v2x + v1y * v2y) / (l1 * l2)));
    const turn = Math.acos(cos);
    const press = Math.min(1, turn / 0.55);
    /* Ink pools where the pen lands and lifts */
    const edge = Math.min(dist[i], total - dist[i]);
    const pool = Math.max(0, 1 - edge / 30) * 0.45;
    const delta = Math.min(1.05, press * 0.95 + pool);
    out.push({
      x: pts[i].x + (-ty / tl) * delta,
      y: pts[i].y + (tx / tl) * delta,
    });
  }
  return out;
}

/**
 * Append the wobbling spine descent between two heights (exclusive of
 * both endpoints — callers push exact seam points themselves).
 *
 * @param pts - Point list to extend
 * @param rand - Seeded RNG
 * @param spine - Spine x
 * @param fromY - Descent start y
 * @param toY - Descent end y
 * @param amp - Sideways wobble amplitude
 */
function appendDescent(
  pts: Pt[],
  rand: () => number,
  spine: number,
  fromY: number,
  toY: number,
  amp: number
): void {
  const span = toY - fromY;
  if (span <= 60) return;
  const steps = Math.min(16, Math.max(2, Math.round(span / 170)));
  const phase = rand() * Math.PI * 2;
  const waves = 0.8 + rand() * 1.4;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    pts.push({
      x:
        spine +
        Math.sin(phase + t * Math.PI * waves) * amp +
        (rand() - 0.5) * amp * 0.5,
      y: fromY + span * t + (rand() - 0.5) * Math.min(24, span * 0.06),
    });
  }
}

/** Whether this environment renders content gestures (binding spine). */
function gesturesFit(env: SegmentEnv): boolean {
  return env.vw >= THREAD_BINDING_MIN;
}

/**
 * Whether this environment earns the chapter-02 kicker underline:
 * binding spine, a measured kicker, and lateral room to swing in.
 *
 * @param env - Segment environment
 * @param spine - Spine x
 * @returns True when the flourish fits
 */
function flourishFits(env: SegmentEnv, spine: number): boolean {
  return (
    gesturesFit(env) &&
    env.kicker !== null &&
    env.kicker.width >= 120 &&
    env.kicker.left - spine >= 48
  );
}

/**
 * Chapter 02's kicker underline — the flick's original home, redrawn as
 * ONE continuous cursive loop: leave the spine heading down, sweep out,
 * underline the kicker's opening run, then arc back beneath it in a
 * single widening curve that rejoins the spine still heading down
 * (same-tangent junctions — no hairpin retrace).
 *
 * @param pts - Point list to extend
 * @param rand - Seeded RNG
 * @param spine - Spine x
 * @param k - Kicker box
 * @returns The y at which the path rejoins the spine
 */
function appendKickerFlourish(
  pts: Pt[],
  rand: () => number,
  spine: number,
  k: ThreadBox
): number {
  const uy = k.top + k.height + 6;
  const len = Math.min(k.width * 0.7, 300);
  pts.push({ x: spine, y: uy - 66 });
  pts.push({ x: spine + 12, y: uy - 22 });
  pts.push({ x: k.left - 8, y: uy + 1 });
  pts.push({ x: k.left + len * 0.45, y: uy - 1 + rand() * 2 });
  pts.push({ x: k.left + len, y: uy + 1.5 });
  pts.push({ x: k.left + len * 0.55, y: uy + 16 });
  pts.push({ x: k.left - 26, y: uy + 22 });
  pts.push({ x: spine + 8, y: uy + 40 });
  const rejoinY = uy + 78;
  pts.push({ x: spine, y: rejoinY });
  return rejoinY;
}

/**
 * Chapter 01 — the origin. The line starts life as an ink pool and the
 * name's trailing flick: it leaves the hero sub-line's end, sweeps
 * beneath the name, finds the spine, and descends to the first seam.
 */
function buildArrival(
  env: SegmentEnv,
  rand: () => number,
  spine: number,
  amp: number
): { pts: Pt[]; node: ThreadNodeSpec; prefix: string } {
  const pts: Pt[] = [];
  const { name, height } = env;
  let start: Pt;
  if (name) {
    const y0 = name.top + name.height + 9;
    start = { x: name.left + name.width + 14, y: y0 };
    pts.push(start);
    pts.push({ x: name.left + name.width * 0.42, y: y0 + 7 });
    pts.push({ x: Math.max(spine + 4, name.left - 26), y: y0 + 17 });
    const rejoinY = y0 + 96;
    pts.push({ x: spine, y: rejoinY });
    appendDescent(pts, rand, spine, rejoinY, height - 60, amp);
  } else {
    /* Fallback: originate mid-section on the spine */
    start = { x: spine, y: height * 0.5 };
    pts.push(start);
    appendDescent(pts, rand, spine, height * 0.5, height - 60, amp);
  }
  pts.push({ x: spine, y: height + SEAM_OVERSHOOT });
  /* The pen lands: a small pool right where the line begins */
  const prefix = inkPool(start.x + 1, start.y + 0.5, 1.7, rand);
  return {
    pts,
    node: { kind: "ring", x: start.x, y: start.y },
    prefix,
  };
}

/**
 * Chapter 02 — seam to seam with the kicker underline (its original
 * home). Chapters 04 and 06 pass through here too, gestureless: enter
 * on the spine, wobble down, exit on the spine.
 */
function buildStandard(
  env: SegmentEnv,
  rand: () => number,
  spine: number,
  amp: number
): { pts: Pt[]; node: ThreadNodeSpec } {
  const pts: Pt[] = [{ x: spine, y: -SEAM_OVERSHOOT }];
  let y = 48;
  if (env.id === "02" && flourishFits(env, spine) && env.kicker) {
    y = appendKickerFlourish(pts, rand, spine, env.kicker);
  }
  appendDescent(pts, rand, spine, y, env.height - 60, amp);
  pts.push({ x: spine, y: env.height + SEAM_OVERSHOOT });
  return {
    pts,
    node: { kind: env.id === "04" ? "gate" : "ring", x: spine, y: 0 },
  };
}

/**
 * Chapter 03 — the line underlines the word "mess" in the deck as ONE
 * rising loop whose APEX is the underline: the descent passes the deck,
 * swings out low in the whitespace beneath it, rises to kiss directly
 * under the word, falls away past its right edge, and sweeps back to
 * the spine strictly BELOW its outbound leg — no retrace, no crossing,
 * same-tangent junctions. Every point inside the text column stays
 * below the word's glyph box (the underline, never a strike-through).
 */
function buildPath03(
  env: SegmentEnv,
  rand: () => number,
  spine: number,
  amp: number
): { pts: Pt[]; node: ThreadNodeSpec } {
  const pts: Pt[] = [{ x: spine, y: -SEAM_OVERSHOOT }];
  let y = 48;
  const w = env.word;
  if (gesturesFit(env) && w && w.left - spine >= 96) {
    const uy = w.top + w.height + 4;
    const colX = spine + (w.left - spine) * 0.34;
    appendDescent(pts, rand, spine, y, uy - 20, amp);
    pts.push({ x: spine, y: uy + 12 });
    pts.push({ x: spine + 24, y: uy + 38 });
    pts.push({ x: colX, y: uy + 30 });
    pts.push({ x: w.left - 36, y: uy + 20 });
    pts.push({ x: w.left - 2, y: uy + 4 });
    pts.push({ x: w.left + w.width * 0.55, y: uy + 3 + rand() * 1.5 });
    pts.push({ x: w.left + w.width + 8, y: uy + 6 });
    pts.push({ x: w.left + w.width + 20, y: uy + 24 });
    pts.push({ x: w.left + w.width * 0.5, y: uy + 46 });
    pts.push({ x: colX - 16, y: uy + 54 });
    pts.push({ x: spine + 5, y: uy + 66 });
    y = uy + 98;
    pts.push({ x: spine, y });
  }
  appendDescent(pts, rand, spine, y, env.height - 60, amp);
  pts.push({ x: spine, y: env.height + SEAM_OVERSHOOT });
  return { pts, node: { kind: "ring", x: spine, y: 0 } };
}

/**
 * Chapter 05 — a small tick beside each work row as the line passes:
 * the descent deflects into the margin lane, checks the row (valley →
 * flick → follow-through), and rejoins the spine without crossing its
 * own stroke.
 */
function buildWork(
  env: SegmentEnv,
  rand: () => number,
  spine: number,
  amp: number
): { pts: Pt[]; node: ThreadNodeSpec } {
  const pts: Pt[] = [{ x: spine, y: -SEAM_OVERSHOOT }];
  let y = 48;
  const rows = gesturesFit(env)
    ? env.rows.filter((row) => row.left - spine >= 44 && row.height > 80)
    : [];
  for (const row of rows) {
    const ty = row.top + Math.min(72, row.height * 0.3);
    if (ty - y < 80) continue;
    const reach = Math.min(spine + 34, row.left - 12);
    appendDescent(pts, rand, spine, y, ty - 44, amp);
    pts.push({ x: spine, y: ty - 34 });
    pts.push({ x: spine + 3, y: ty - 14 });
    /* valley → flick tip: the check */
    pts.push({ x: reach - 17, y: ty + 5 });
    pts.push({ x: reach, y: ty - 12 + rand() * 3 });
    /* follow-through: bow back under the valley, rejoin heading down */
    pts.push({ x: reach - 15, y: ty + 16 });
    pts.push({ x: spine + 2, y: ty + 32 });
    y = ty + 54;
    pts.push({ x: spine, y });
  }
  appendDescent(pts, rand, spine, y, env.height - 60, amp);
  pts.push({ x: spine, y: env.height + SEAM_OVERSHOOT });
  return { pts, node: { kind: "ring", x: spine, y: 0 } };
}

/**
 * Chapter 07 — the finale. The run rides the text-free strip beneath
 * the kicker, drops down the empty lane beside the stamp, curves INTO
 * the stamp's edge, underlines "awaiting your signature", and
 * terminates in a heavier ink blot ON the stamp boundary. The compact
 * and right-spine worlds route to the same landmarks from their own
 * sides — no orphaned terminals anywhere.
 */
function buildGate(
  env: SegmentEnv,
  rand: () => number,
  spine: number,
  amp: number
): { pts: Pt[]; node: ThreadNodeSpec; suffix: string } {
  const pts: Pt[] = [{ x: spine, y: -SEAM_OVERSHOOT }];
  const node: ThreadNodeSpec = { kind: "ring", x: spine, y: 0 };
  const s = env.stamp;
  const m = env.marks;

  if (!s || !m) {
    /* Fallback: end mid-section in a resting pool on the spine */
    appendDescent(pts, rand, spine, 48, env.height * 0.78, amp);
    pts.push({ x: spine, y: env.height * 0.78 });
    pts.push({ x: spine + 4, y: env.height * 0.8 });
    const tip = pts[pts.length - 1];
    return { pts, node, suffix: inkPool(tip.x, tip.y, 2.2, rand) };
  }

  const compact = env.vw <= THREAD_COMPACT_MAX;
  const rightSpine = !compact && env.vw < THREAD_BINDING_MIN;
  let blot: Pt;

  if (compact) {
    /* Down the gutter, then into the stamp's left edge */
    appendDescent(pts, rand, spine, 48, m.entryLeft.y - 84, amp);
    pts.push({ x: spine, y: m.entryLeft.y - 64 });
    pts.push({ x: spine + 1, y: m.entryLeft.y - 26 });
    pts.push(m.entryLeft);
    pts.push(m.under[0]);
    pts.push(m.under[1]);
    pts.push(m.under[2]);
    pts.push(m.blotRight);
    blot = m.blotRight;
  } else if (rightSpine) {
    /* Down the right margin, over the top-right corner, in through the
       right edge, underline right-to-left, blot on the left edge */
    appendDescent(pts, rand, spine, 48, s.top - 120, amp);
    pts.push({ x: spine - 4, y: s.top - 88 });
    pts.push({ x: m.entryRight.x + 26, y: m.entryRight.y - 48 });
    pts.push(m.entryRight);
    pts.push(m.under[2]);
    pts.push(m.under[1]);
    pts.push(m.under[0]);
    pts.push(m.blotLeft);
    blot = m.blotLeft;
  } else {
    /* Binding spine: ride the strip beneath the kicker across the page,
       drop the empty lane left of the stamp, enter the left edge */
    const laneX = s.left - 26;
    let corridorY = 96;
    if (env.kicker && flourishFits(env, spine)) {
      const k = env.kicker;
      corridorY = k.top + k.height + 22;
      pts.push({ x: spine, y: corridorY - 58 });
      pts.push({ x: spine + 16, y: corridorY - 12 });
      pts.push({ x: (spine + laneX) * 0.42, y: corridorY + rand() * 4 });
      pts.push({ x: (spine + laneX) * 0.72, y: corridorY - 2 + rand() * 4 });
      pts.push({ x: laneX - 30, y: corridorY + 6 });
    } else {
      appendDescent(pts, rand, spine, 48, 96, amp);
      pts.push({ x: spine + 8, y: 108 });
      pts.push({ x: (spine + laneX) / 2, y: 128 });
      pts.push({ x: laneX - 30, y: 120 });
      corridorY = 120;
    }
    /* The lane: empty column-gap air above-left of the stamp */
    const laneEnd = m.entryLeft.y - 42;
    pts.push({ x: laneX - 6, y: corridorY + 54 });
    if (laneEnd - (corridorY + 54) > 320) {
      pts.push({
        x: laneX + (rand() - 0.5) * 14,
        y: (corridorY + 54 + laneEnd) / 2,
      });
    }
    pts.push({ x: laneX + 2, y: laneEnd });
    pts.push(m.entryLeft);
    pts.push(m.under[0]);
    pts.push(m.under[1]);
    pts.push(m.under[2]);
    pts.push(m.blotRight);
    blot = m.blotRight;
  }

  /* The heavier blot: two nested pools ON the boundary — the pen rests */
  const suffix =
    inkPool(blot.x, blot.y, 3.1, rand) + inkPool(blot.x, blot.y, 1.6, rand);
  return { pts, node, suffix };
}

/**
 * Slice the run below the 05|06 folio terminator for the static-world
 * nightfall dip: from the exact rule crossing to the seam.
 *
 * @param pts - Segment 05's full anchor run
 * @param folio - The measured folio-rule box
 * @returns Dip anchor run, or null when the rule is not crossed
 */
function dipRun(pts: Pt[], folio: ThreadBox): Pt[] | null {
  const seamY = folio.top + folio.height;
  let i = 0;
  while (i < pts.length && pts[i].y < seamY) i++;
  if (i === 0 || i >= pts.length) return null;
  const a = pts[i - 1];
  const b = pts[i];
  const t = (seamY - a.y) / (b.y - a.y || 1);
  const crossing = { x: a.x + (b.x - a.x) * t, y: seamY };
  return [crossing, ...pts.slice(i)];
}

/**
 * Build one chapter's segment geometry.
 *
 * @param env - Measured environment for the chapter
 * @returns Geometry, or null when the section is too small to draw
 */
export function buildSegment(env: SegmentEnv): SegmentGeometry | null {
  if (env.width < 60 || env.height < 160) return null;
  const spine = spineX(env.vw);
  const amp = wobbleAmp(env.vw);
  const rand = mulberry32(Number(env.id) * 7919 + 17);

  let built: {
    pts: Pt[];
    node: ThreadNodeSpec;
    prefix?: string;
    suffix?: string;
  };
  if (env.id === "01") {
    built = buildArrival(env, rand, spine, amp);
  } else if (env.id === "03") {
    built = buildPath03(env, rand, spine, amp);
  } else if (env.id === "05") {
    built = buildWork(env, rand, spine, amp);
  } else if (env.id === "07") {
    built = buildGate(env, rand, spine, amp);
  } else {
    built = buildStandard(env, rand, spine, amp);
  }

  const core = catmullRomPath(built.pts);
  if (!core) return null;
  const d = `${built.prefix ?? ""} ${core}${built.suffix ?? ""}`.trim();
  const dSwell = catmullRomPath(swellRun(built.pts));

  const compact = env.vw <= THREAD_COMPACT_MAX;
  const node = built.node;
  if (node.kind === "ring") {
    node.ringD = irregularRing(node.x, node.y, compact ? 3 : 4, rand);
  }

  let dDip: string | null = null;
  if (env.wantsDip && env.id === "05" && env.folio) {
    const run = dipRun(built.pts, env.folio);
    if (run && run.length >= 2) dDip = catmullRomPath(run);
  }

  return { d, dSwell, dDip, node, compact };
}
