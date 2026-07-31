/**
 * @fileoverview The run engine — ported from the prototype, not re-derived.
 *
 * WHY THIS EXISTS, AND WHY IT IS A PORT RATHER THAN AN IMPLEMENTATION.
 *
 * `docs/design-lab/candidates/story-the-long-run.html` is the design the
 * owner approved. Four rounds tried to reproduce its behaviour in
 * GSAP/ScrollTrigger by measuring *properties* off it — continuity,
 * reversibility, transform-channel counts — and hitting those numbers.
 * Every round measured green and every round looked like the old site,
 * because the properties were never the thing. The engine was.
 *
 * So this file is a faithful port of that engine's scheduler. The one
 * idea it carries, and the reason the prototype does for free what four
 * GSAP rounds could not:
 *
 *     an element's state is a PURE FUNCTION of scroll position.
 *
 * There is no timeline, no playhead, no `once`, no direction flag and no
 * reverse path. `p` derives from scrollY and the element's own box; the
 * transform and opacity derive from `p`. Scroll up and the same arithmetic
 * runs with a smaller `p`, so the world runs backwards exactly — not as a
 * feature that was added, but because there is no state that could fail to
 * rewind. The same holds for every per-beat figure scrub: they take beat
 * progress, so the diagrams reverse for the same reason and by the same
 * mechanism.
 *
 * COST. `frame()` halts itself after 12 still frames and only restarts on
 * scroll, so a parked page runs no rAF at all — the property NO-LIST §F3
 * protects. Writes are quantized (0.5px / 0.1deg / 0.005 scale / 0.02
 * opacity) and skipped when unchanged, so a settled element drifting
 * ~0.2px per frame produces mostly no writes.
 *
 * The prototype's numbers, kept because they are tuned, not arbitrary:
 * the reading line sits at 0.62·vh; `p` spans `(scrollY + vh − top) /
 * (vh + height)`, so an element's window covers its whole transit of the
 * viewport; `in`/`out` default to [.06,.32] and [.76,.98]; drift is raw px
 * while x/y are PERCENTAGES OF VIEWPORT (a `x -9` is −9vw, not −9px — the
 * unit that misled an earlier audit of mine).
 */

/** Reading line — where the page considers the reader to be looking. */
export const READING_LINE = 0.62;

/** `in` / `out` are [start, end, x%, y%, rotate°, scale] */
export type FxWindow = [number, number, number, number, number, number];

export interface FxSpec {
  in: FxWindow;
  out: FxWindow;
  /** Raw px of parallax across the element's whole transit. */
  drift: number;
}

export interface FxEntry {
  el: HTMLElement;
  spec: FxSpec;
  /** Document-space top and height, cached — never read per frame. */
  top: number;
  h: number;
  /** Near-view gate, refreshed by a cheap census rather than rect reads. */
  near: boolean;
  lastTf: string;
  lastOp: string;
}

export interface Beat {
  el: HTMLElement;
  top: number;
  h: number;
}

const DEFAULT_SPEC: FxSpec = {
  in: [0.06, 0.32, 0, 5, 0, 1],
  out: [0.76, 0.98, 0, -4, 0, 1],
  drift: 10,
};

export const clamp = (v: number, a: number, b: number) =>
  v < a ? a : v > b ? b : v;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The prototype's easing: smoothstep on a clamped 0..1. */
export const smooth = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

/**
 * Parse the prototype's `data-fx` grammar.
 *
 * `in .06 .32 -9 4 | out .8 1 0 -6 | drift 14`
 *
 * Clauses are optional and independent; anything omitted takes the
 * default above. Kept as a string grammar rather than props because the
 * beats author it inline, exactly as the prototype does — the values are
 * design decisions and they belong next to the markup they shape.
 */
export function parseFx(decl: string | null | undefined): FxSpec {
  const spec: FxSpec = {
    in: [...DEFAULT_SPEC.in] as FxWindow,
    out: [...DEFAULT_SPEC.out] as FxWindow,
    drift: DEFAULT_SPEC.drift,
  };
  if (!decl) return spec;
  for (const clause of decl.split("|")) {
    const t = clause.trim().split(/\s+/).filter(Boolean);
    if (!t.length) continue;
    if (t[0] === "drift") {
      spec.drift = parseFloat(t[1]);
      continue;
    }
    if (t[0] !== "in" && t[0] !== "out") continue;
    const w = spec[t[0]];
    for (let i = 1; i < t.length && i <= 6; i++) {
      const v = parseFloat(t[i]);
      if (!Number.isNaN(v)) w[i - 1] = v;
    }
  }
  return spec;
}

/** Document-space top, without a layout-thrashing getBoundingClientRect. */
export function absTop(el: HTMLElement): number {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

export interface RunWorld {
  /** 0-based beat the reading line is inside. */
  beat: number;
  /** 0..1 progress of the reading line through that beat. */
  bp: number;
}

/**
 * One scroll-driven pass. Everything it writes is a function of `y`.
 *
 * `onBeat` receives the beat index and its progress so per-figure scrubs
 * can be driven from the same clock — which is what makes the diagrams
 * reverse without any reverse code of their own.
 */
export function applyFx(
  y: number,
  vw: number,
  vh: number,
  fx: FxEntry[],
  beats: Beat[],
  onBeat?: (world: RunWorld) => void
): RunWorld {
  let beat = 0;
  let bp = 0;
  for (let i = 0; i < beats.length; i++) {
    const b = beats[i];
    const p = (y + vh * READING_LINE - b.top) / b.h;
    if (p >= 0) {
      beat = i;
      bp = clamp(p, 0, 1);
    }
  }
  const world: RunWorld = { beat, bp };
  onBeat?.(world);

  for (const f of fx) {
    if (!f.near) continue;
    const p = (y + vh - f.top) / (vh + f.h);
    if (p < -0.1 || p > 1.1) continue;

    const [ia, ib, ix, iy, ir, is] = f.spec.in;
    const [oa, ob, ox, oy, or_, os] = f.spec.out;
    const ein = smooth((p - ia) / (ib - ia));
    const eout = smooth((p - oa) / (ob - oa));

    /* x and y are PERCENTAGES OF VIEWPORT; drift alone is raw px. */
    const tx = (lerp(ix, 0, ein) * vw) / 100 + (lerp(0, ox, eout) * vw) / 100;
    const ty =
      (lerp(iy, 0, ein) * vh) / 100 +
      (lerp(0, oy, eout) * vh) / 100 +
      (0.5 - p) * f.spec.drift;
    const r = lerp(ir, 0, ein) + lerp(0, or_, eout);
    const s = lerp(is, 1, ein) * lerp(1, os, eout);

    /* Quantized, then skipped when unchanged — a settled element drifts
       ~0.2px/frame, so most frames become no write at all. */
    const op = (Math.round(ein * (1 - eout) * 50) / 50).toFixed(2);
    const qx = Math.round(tx * 2) / 2;
    const qy = Math.round(ty * 2) / 2;
    const qr = Math.round(r * 10) / 10;
    const qs = Math.round(s * 200) / 200;
    const tf =
      `translate3d(${qx}px, ${qy}px, 0)` +
      (qr ? ` rotate(${qr}deg)` : "") +
      (qs !== 1 ? ` scale(${qs})` : "");

    if (tf !== f.lastTf) {
      f.lastTf = tf;
      f.el.style.transform = tf;
    }
    if (op !== f.lastOp) {
      f.lastOp = op;
      f.el.style.opacity = op;
    }
  }
  return world;
}

/**
 * The self-halting loop.
 *
 * Runs only while the scroll position is changing, stops after 12 still
 * frames, and restarts on scroll. A parked page costs nothing, which is
 * the property §F3 exists to protect — and the reason a scroll-coupled
 * world does not violate it.
 *
 * `wake(true)` forces a recompute even when `y` is unchanged: after an
 * instant jump (a hash landing, a Back/Forward restore) the position can
 * be identical while every cached box is stale.
 */
export function createRunLoop(step: (y: number) => void) {
  let running = false;
  let lastY = -1;
  let still = 0;

  const frame = () => {
    const y = window.scrollY;
    const changed = y !== lastY;
    if (changed) {
      lastY = y;
      still = 0;
    } else {
      still++;
    }
    if (still > 12) {
      running = false;
      return;
    }
    requestAnimationFrame(frame);
    if (changed) step(y);
  };

  const wake = (force?: boolean) => {
    if (force) {
      lastY = -1;
      still = 0;
    }
    if (running) return;
    running = true;
    still = 0;
    lastY = -1;
    requestAnimationFrame(frame);
  };

  return {
    wake,
    stop: () => {
      running = false;
    },
    get running() {
      return running;
    },
  };
}
