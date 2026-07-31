/**
 * @fileoverview ThreadRail — the rail: ONE fixed full-viewport canvas
 * drawing the Red Thread continuously against scroll (round 12).
 *
 * This is the prototype's architecture (story-the-long-run.html,
 * `canvas.thread`: position fixed, full viewport, z-index under the
 * text) rebuilt for production: the seven welded per-chapter SVG
 * segments could never FLOW — each stopped at its section boundary and
 * re-started in the next one's local coordinates. The rail replaces
 * them in the motion world with one page-long line, sampled once from
 * the same geometry (thread/geometry.ts runs, thread/measure.ts boxes)
 * and redrawn from a single surface as the reader moves, so the ink
 * runs unbroken from the nameplate's trailing flick to the blot on the
 * approval stamp.
 *
 * THE TOKEN (Stage B): an ink bead rides the line at the reading line
 * (RAIL_HEAD_VH). The drawn ink ends AT the bead — the nib is the
 * traveller — with the dashed future ahead of it, and both are a pure
 * function of scroll: scrolling up retracts the ink and carries the
 * bead backwards along the same curve (the owner's reversibility, the
 * visible kind). At the gate the bead halts on the stamp's boundary
 * inside a clay ring — pine once the visitor has signed
 * (`[data-stamp][data-inked]`).
 *
 * Engine discipline (NO-LIST §F3, PERF-AUDIT):
 *   - Rides `gsap.ticker` — never a second rAF loop. A passive scroll
 *     listener sets a dirty flag; the ticker callback returns
 *     immediately while the flag is clean, so an idle page costs the
 *     flag check and nothing else: no reads, no draws, no style
 *     writes. (The idle floor — ~732 callbacks / 3s from GSAP's own
 *     keep-alives — must not rise; verified with
 *     docs/design-lab/probe-idle-raf12.mjs.)
 *   - Canvas draws are not style writes; the rail writes NO styles and
 *     NO attributes per frame.
 *   - DPR capped at 1.5 (brief §F discipline), rebuilds coalesced to
 *     one rAF (the F63 lesson), geometry re-measured on section
 *     resize (the ch04 pin-spacer lands as a resize), fonts-ready and
 *     `paper:layout-settled`.
 *
 * Worlds (A7): motion world only. `useLenis()` null — reduced motion,
 * the quiet toggle, the governor's print floor, or the engine simply
 * not yet mounted — renders nothing; the static ThreadSegments paint
 * the settled line instead. `@media print` hides the canvas outright
 * (globals.css) for a mid-session ⌘P from the motion world.
 *
 * Probe: the canvas element carries a read-only `__rail` property
 * (geometry snapshot + head accessor) for the Playwright contract in
 * red-thread.spec.ts — data out, never control in (the F74 line).
 */

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLenis } from "@/components/layout/SmoothScroll";
import { LAYOUT_SETTLED_EVENT } from "@/components/story/arrival";
import { CHAPTERS } from "@/components/story/chapters";
import { measureSegmentEnv } from "./measure";
import {
  buildSegment,
  sampleCatmullRom,
  swellRun,
  type ThreadNodeSpec,
  type ThreadPoint,
} from "./geometry";
import { RAIL_HEAD_VH } from "./constants";

/** One sample on the rail: page-space point + arc length from origin. */
interface RailSample {
  x: number;
  y: number;
  /** Cumulative arc length, px */
  L: number;
  /** Monotonic envelope: max page-y reached by samples[0..i] — the
   *  nib finishes a gesture (its rising half included) before the
   *  reading line moves below it. */
  yMax: number;
}

/** A page-space polyline with its length parameterization. */
interface RailLine {
  samples: RailSample[];
  len: number;
}

/** One chapter's node on the rail, page-space. */
interface RailNode {
  id: string;
  kind: ThreadNodeSpec["kind"];
  x: number;
  y: number;
  /** Ring path (kind "ring"), section-local — drawn via translate */
  ringD?: string;
  /** Section-local → page translation for the ring path */
  dx: number;
  dy: number;
  /** Dusk chapters ink cream */
  dusk: boolean;
  /** Fill when the drawn length reaches this */
  L: number;
}

/** A terminal ink pool (ch01 landing, ch07 blot), page-translated. */
interface RailPool {
  path: Path2D;
  dx: number;
  dy: number;
  dusk: boolean;
  /** Draw once the head has reached this length */
  L: number;
}

/** Everything one rebuild produces. */
interface RailGeometry {
  main: RailLine;
  swell: RailLine;
  nodes: RailNode[];
  pools: RailPool[];
  /** Length at which the ink flips day → dusk (the 05|06 terminator) */
  duskL: number;
  duskSwellL: number;
  /** Page y of that flip, for the token's own ink */
  duskY: number;
  /** Reduced-prominence stroke widths below 1024 */
  compact: boolean;
  /** Scrollable end (documentElement.scrollHeight − viewport) */
  maxScroll: number;
}

/** The read-only test probe published on the canvas element. */
interface RailProbe {
  built: number;
  pathLen: number;
  sampleCount: number;
  start: ThreadPoint;
  end: ThreadPoint;
  duskL: number;
  headL: () => number;
  samples: () => { x: number; y: number; L: number }[];
}

/** Canvas element + the probe property the spec reads. */
type RailCanvas = HTMLCanvasElement & { __rail?: RailProbe };

/** Densification step along the curve, px (the prototype draws at ~22;
 *  14 keeps the wobble crisp at the swell's tighter bends). */
const SAMPLE_STEP = 14;

/** Ink beyond the viewport edges still drawn, px — round caps and the
 *  token's halt ring must never pop at the fold. */
const DRAW_MARGIN = 80;

/** The token bead's radius (the prototype's 4.5). */
const TOKEN_R = 4.5;

/** The halt ring around the bead at the gate (the prototype's 9/2). */
const HALT_RING_R = 9;

/** smoothstep — the endgame glide's ease (prototype `smooth`). */
function smooth(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t * t * (3 - 2 * t);
}

/**
 * Parameterize a dense polyline: cumulative lengths + the monotonic
 * y envelope.
 *
 * @param pts - Dense page-space points
 * @returns The rail line
 */
function parameterize(pts: ThreadPoint[]): RailLine {
  const samples: RailSample[] = [];
  let L = 0;
  let yMax = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    if (i > 0) {
      L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    }
    yMax = Math.max(yMax, pts[i].y);
    samples.push({ x: pts[i].x, y: pts[i].y, L, yMax });
  }
  return { samples, len: L };
}

/**
 * Arc length at which the line has fully passed a page y — binary
 * search over the monotonic yMax envelope.
 *
 * @param line - The rail line
 * @param y - Page y
 * @returns Length along the line
 */
function lenAtY(line: RailLine, y: number): number {
  const s = line.samples;
  if (!s.length || y <= s[0].yMax) return 0;
  if (y >= s[s.length - 1].yMax) return line.len;
  let lo = 0;
  let hi = s.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (s[m].yMax < y) lo = m;
    else hi = m;
  }
  const a = s[lo];
  const b = s[hi];
  const t = b.yMax > a.yMax ? (y - a.yMax) / (b.yMax - a.yMax) : 1;
  return a.L + (b.L - a.L) * t;
}

/**
 * Point at an arc length — binary search over L (strictly ascending).
 *
 * @param line - The rail line
 * @param L - Arc length, clamped to the line
 * @returns Page-space point
 */
function pointAtLen(line: RailLine, L: number): ThreadPoint {
  const s = line.samples;
  if (!s.length) return { x: 0, y: 0 };
  const cl = Math.min(Math.max(L, 0), line.len);
  let lo = 0;
  let hi = s.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (s[m].L <= cl) lo = m;
    else hi = m;
  }
  const a = s[lo];
  const b = s[hi];
  const t = b.L > a.L ? (cl - a.L) / (b.L - a.L) : 0;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** The palette the rail strokes with, read from the design tokens. */
interface RailInks {
  ink: string;
  inkSecondary: string;
  inkDusk: string;
  clay: string;
  pine: string;
}

/**
 * Read the stroke palette from the token custom properties — cited,
 * never hex-typed here (FABLE brief: builders cite variables).
 *
 * @returns The five inks the rail uses
 */
function readInks(): RailInks {
  const cs = getComputedStyle(document.documentElement);
  const read = (name: string) => cs.getPropertyValue(name).trim();
  return {
    ink: read("--color-ink"),
    inkSecondary: read("--color-ink-secondary"),
    inkDusk: read("--color-ink-dusk"),
    clay: read("--color-clay-graphic"),
    pine: read("--color-pine"),
  };
}

/**
 * Stroke the sub-run of a line between two arc lengths, clipped to the
 * viewport band, with exact endpoints interpolated at both cuts (the
 * ink ends AT the nib, not at the nearest sample).
 *
 * @param ctx - Canvas context (already styled)
 * @param line - The rail line
 * @param L0 - Start length
 * @param L1 - End length
 * @param scroll - Current scrollY (page → viewport translation)
 * @param yMin - Top of the draw band, page y
 * @param yMax - Bottom of the draw band, page y
 */
function strokeRun(
  ctx: CanvasRenderingContext2D,
  line: RailLine,
  L0: number,
  L1: number,
  scroll: number,
  yMin: number,
  yMax: number
): void {
  if (L1 - L0 < 0.5) return;
  const s = line.samples;
  ctx.beginPath();
  let open = false;
  const startPt = pointAtLen(line, L0);
  const endPt = pointAtLen(line, L1);
  for (let i = 0; i < s.length; i++) {
    const p = s[i];
    if (p.L <= L0 || p.L >= L1) continue;
    const inBand = p.y >= yMin && p.y <= yMax;
    const prev = i > 0 ? s[i - 1] : p;
    const next = i < s.length - 1 ? s[i + 1] : p;
    /* Keep a point if it or a neighbour is in the band — gaps restart
       the subpath so off-screen stretches cost nothing. */
    if (
      !inBand &&
      !(prev.y >= yMin && prev.y <= yMax) &&
      !(next.y >= yMin && next.y <= yMax)
    ) {
      if (open) {
        ctx.stroke();
        ctx.beginPath();
        open = false;
      }
      continue;
    }
    if (!open) {
      /* Open at the exact cut when this is the run's first stretch */
      const from = prev.L <= L0 ? startPt : prev;
      ctx.moveTo(from.x, from.y - scroll);
      open = true;
    }
    ctx.lineTo(p.x, p.y - scroll);
  }
  if (open) {
    if (endPt.y >= yMin - DRAW_MARGIN && endPt.y <= yMax + DRAW_MARGIN) {
      ctx.lineTo(endPt.x, endPt.y - scroll);
    }
    ctx.stroke();
  } else if (
    endPt.y >= yMin &&
    endPt.y <= yMax &&
    startPt.y >= yMin &&
    startPt.y <= yMax
  ) {
    /* Sub-sample run entirely between two samples */
    ctx.moveTo(startPt.x, startPt.y - scroll);
    ctx.lineTo(endPt.x, endPt.y - scroll);
    ctx.stroke();
  }
}

/**
 * The rail: mounts the fixed canvas in the motion world and hands the
 * whole drawing to one scroll-dirty ticker rider.
 *
 * @returns The canvas (aria-hidden, pointer-events: none), or null in
 *   the static worlds
 */
export function ThreadRail() {
  const lenis = useLenis();
  const canvasRef = useRef<RailCanvas>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!lenis || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let disposed = false;
    let queuedBuild = 0;
    let dirty = false;
    let geometry: RailGeometry | null = null;
    let inks = readInks();
    let built = 0;
    let headL = 0;
    let signed = false;
    let vw = 0;
    let vh = 0;

    /* ── Size the fixed surface (DPR ≤ 1.5, brief §F) ────────────── */
    const size = () => {
      vw = document.documentElement.clientWidth;
      vh = document.documentElement.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* ── Measure + concatenate the seven runs into one line ──────── */
    const build = () => {
      if (disposed) return;
      const scroll = window.scrollY;
      const runs: ThreadPoint[][] = [];
      const nodes: RailNode[] = [];
      const pools: RailPool[] = [];
      let compact = false;
      let duskY = Infinity;
      for (const chapter of CHAPTERS) {
        const section = document.querySelector<HTMLElement>(
          `section[data-chapter="${chapter.id}"]`
        );
        if (!section) return; /* not the home paper — leave unbuilt */
        /* wantsDip false: the rail changes ink itself, exactly at the
           05|06 terminator crossing (the dip is the static worlds'). */
        const env = measureSegmentEnv(section, chapter.id, false);
        const segment = buildSegment(env);
        if (!segment) return;
        const rect = section.getBoundingClientRect();
        const dx = rect.left + window.scrollX;
        const dy = rect.top + scroll;
        compact = segment.compact;
        runs.push(segment.run.map((p) => ({ x: p.x + dx, y: p.y + dy })));
        const dusk = chapter.id >= "06";
        nodes.push({
          id: chapter.id,
          kind: segment.node.kind,
          x: segment.node.x + dx,
          y: segment.node.y + dy,
          ringD: segment.node.ringD,
          dx,
          dy,
          dusk,
          L: 0 /* seated after parameterization */,
        });
        if (segment.pools) {
          pools.push({
            path: new Path2D(segment.pools),
            dx,
            dy,
            dusk,
            L: 0 /* seated after parameterization */,
          });
        }
        /* The ink flip: the 05|06 folio terminator's bottom edge */
        if (chapter.id === "05" && env.folio) {
          duskY = dy + env.folio.top + env.folio.height;
        }
        if (chapter.id === "06" && duskY === Infinity) {
          duskY = dy; /* fallback: the section seam */
        }
      }

      /* Weld-free concatenation. At each interior boundary the two
         adjacent runs carry a ±6px overshoot pair on the shared spine
         — segment N ends at (spine, bottom+6), N+1 begins at
         (spine, top−6), and the sections abut, so the pair brackets
         the same boundary from both sides. Merge each pair into its
         midpoint: ONE anchor carries the boundary and the line has no
         seam at all. Every real anchor survives. */
      const pts: ThreadPoint[] = [];
      for (let i = 0; i < runs.length; i++) {
        const run = runs[i].slice();
        if (i > 0 && pts.length && run.length) {
          const entry = run.shift()!;
          const exit = pts[pts.length - 1];
          pts[pts.length - 1] = {
            x: (exit.x + entry.x) / 2,
            y: (exit.y + entry.y) / 2,
          };
        }
        pts.push(...run);
      }
      if (pts.length < 8) return;

      const main = parameterize(sampleCatmullRom(pts, SAMPLE_STEP));
      const swell = parameterize(sampleCatmullRom(swellRun(pts), SAMPLE_STEP));
      for (const node of nodes) {
        node.L = lenAtY(main, node.y);
      }
      /* ch01's pool sits at the origin (drawn with the first ink); the
         gate blot waits for the head to REST on the stamp. */
      for (const pool of pools) {
        pool.L = pool.dusk ? main.len - 1 : 4;
      }
      geometry = {
        main,
        swell,
        nodes,
        pools,
        duskL: lenAtY(main, duskY),
        duskSwellL: lenAtY(swell, duskY),
        duskY,
        compact,
        maxScroll: Math.max(
          1,
          document.documentElement.scrollHeight -
            document.documentElement.clientHeight
        ),
      };
      inks = readInks();
      size();
      built += 1;
      publishProbe();
      dirty = true;
    };

    const scheduleBuild = () => {
      if (disposed || queuedBuild) return;
      queuedBuild = requestAnimationFrame(() => {
        queuedBuild = 0;
        build();
      });
    };

    /* ── The probe (read-only; red-thread.spec.ts) ───────────────── */
    const publishProbe = () => {
      if (!geometry) return;
      const { main, duskL } = geometry;
      canvas.__rail = {
        built,
        pathLen: main.len,
        sampleCount: main.samples.length,
        start: { x: main.samples[0].x, y: main.samples[0].y },
        end: {
          x: main.samples[main.samples.length - 1].x,
          y: main.samples[main.samples.length - 1].y,
        },
        duskL,
        headL: () => headL,
        samples: () => main.samples.map((s) => ({ x: s.x, y: s.y, L: s.L })),
      };
    };

    /* ── The drawing — one dirty frame at a time ─────────────────── */
    const draw = () => {
      if (!geometry) return;
      const g = geometry;
      const scroll = window.scrollY;
      ctx.clearRect(0, 0, vw, vh);

      /* The reading line, with the endgame glide: on viewports where
         the blot sits below the line's deepest reach, the head glides
         the shortfall across the final half-viewport of scroll — still
         a pure function of y, so any jump (and any retreat) lands
         right (the prototype's own fix). */
      let headY = scroll + vh * RAIL_HEAD_VH;
      const blotY = g.main.samples[g.main.samples.length - 1].y;
      const short = blotY - (g.maxScroll + vh * RAIL_HEAD_VH);
      if (short > 0) {
        headY +=
          short * smooth((scroll - (g.maxScroll - vh * 0.5)) / (vh * 0.5));
      }
      headL = lenAtY(g.main, headY);
      const swellHeadL = lenAtY(g.swell, headY);
      const halted = headL >= g.main.len - 2;

      const yMin = scroll - DRAW_MARGIN;
      const yMax = scroll + vh + DRAW_MARGIN;
      const wPast = g.compact ? 1.1 : 1.3;
      const wSwell = g.compact ? 0.9 : 1.2;
      const wFuture = g.compact ? 0.75 : 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      /* The future: dashed, faint, pattern anchored in path space */
      ctx.lineWidth = wFuture;
      ctx.setLineDash([2, 6]);
      if (headL < g.duskL) {
        ctx.strokeStyle = inks.inkSecondary;
        ctx.globalAlpha = 0.8;
        ctx.lineDashOffset = -headL % 8;
        strokeRun(ctx, g.main, headL, g.duskL, scroll, yMin, yMax);
      }
      ctx.strokeStyle = inks.inkDusk;
      ctx.globalAlpha = 0.45;
      const duskFrom = Math.max(headL, g.duskL);
      ctx.lineDashOffset = -duskFrom % 8;
      strokeRun(ctx, g.main, duskFrom, g.main.len, scroll, yMin, yMax);
      ctx.setLineDash([]);

      /* The pressure layer under the drawn ink (one nib, two strokes) */
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = wSwell;
      ctx.strokeStyle = inks.ink;
      strokeRun(
        ctx,
        g.swell,
        0,
        Math.min(swellHeadL, g.duskSwellL),
        scroll,
        yMin,
        yMax
      );
      if (swellHeadL > g.duskSwellL) {
        ctx.strokeStyle = inks.inkDusk;
        strokeRun(ctx, g.swell, g.duskSwellL, swellHeadL, scroll, yMin, yMax);
      }

      /* The drawn past: solid ink up to the nib */
      ctx.globalAlpha = 1;
      ctx.lineWidth = wPast;
      ctx.strokeStyle = inks.ink;
      strokeRun(ctx, g.main, 0, Math.min(headL, g.duskL), scroll, yMin, yMax);
      if (headL > g.duskL) {
        ctx.strokeStyle = inks.inkDusk;
        strokeRun(ctx, g.main, g.duskL, headL, scroll, yMin, yMax);
      }

      /* Terminal pools — stroked subpaths, exactly as the SVG strokes
         them (two tiny paths; the canvas clips them when off-screen) */
      for (const pool of g.pools) {
        if (headL < pool.L) continue;
        ctx.save();
        ctx.translate(pool.dx, pool.dy - scroll);
        ctx.lineWidth = wPast;
        ctx.strokeStyle = pool.dusk ? inks.inkDusk : inks.ink;
        ctx.stroke(pool.path);
        ctx.restore();
      }

      /* Chapter nodes: rings fill as the nib passes; 04 is the clay
         gate-square (the one recurring glyph). */
      for (const node of g.nodes) {
        const ny = node.y - scroll;
        if (ny < -DRAW_MARGIN || ny > vh + DRAW_MARGIN) continue;
        const passed = headL >= node.L;
        if (node.kind === "gate") {
          const gate = g.compact ? 7 : 9;
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = inks.clay;
          if (passed) {
            ctx.fillStyle = inks.clay;
            ctx.fillRect(node.x - gate / 2, ny - gate / 2, gate, gate);
          }
          ctx.strokeRect(node.x - gate / 2, ny - gate / 2, gate, gate);
        } else if (node.ringD) {
          const inkC = node.dusk ? inks.inkDusk : inks.ink;
          ctx.save();
          ctx.translate(node.dx, node.dy - scroll);
          const ring = new Path2D(node.ringD);
          ctx.lineWidth = g.compact ? 1.25 : 1.5;
          ctx.strokeStyle = inkC;
          if (passed) {
            ctx.fillStyle = inkC;
            ctx.fill(ring);
          }
          ctx.stroke(ring);
          ctx.restore();
        }
      }

      /* THE TOKEN: the bead at the nib. Rides backward when the reader
         does — position is pointAtLen(headL), nothing else. */
      const tp = pointAtLen(g.main, headL);
      const ty = tp.y - scroll;
      if (ty > -DRAW_MARGIN && ty < vh + DRAW_MARGIN) {
        ctx.fillStyle = tp.y >= g.duskY ? inks.inkDusk : inks.ink;
        ctx.beginPath();
        ctx.arc(tp.x, ty, TOKEN_R, 0, Math.PI * 2);
        ctx.fill();
        if (halted) {
          /* Clay while the run awaits its human; pine once signed */
          ctx.strokeStyle = signed ? inks.pine : inks.clay;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(tp.x, ty, HALT_RING_R, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    };

    /* ── One loop, dirty-gated (NO-LIST §F3) ─────────────────────── */
    const onTick = () => {
      if (!dirty || disposed) return;
      dirty = false;
      draw();
    };
    const markDirty = () => {
      dirty = true;
    };

    build();
    gsap.ticker.add(onTick);
    window.addEventListener("scroll", markDirty, { passive: true });
    /* A viewport-height-only change (mobile URL bar) can dodge the
       section observer — re-size and re-measure on window resize too
       (coalesced with everything else into the one rAF). */
    window.addEventListener("resize", scheduleBuild);
    /* Section resizes (the ch04 pin-spacer, image loads, viewport
       changes) re-measure; body catches doc-height-only changes. */
    const observer = new ResizeObserver(scheduleBuild);
    for (const chapter of CHAPTERS) {
      const section = document.querySelector(
        `section[data-chapter="${chapter.id}"]`
      );
      if (section) observer.observe(section);
    }
    observer.observe(document.body);
    document.fonts?.ready.then(scheduleBuild);
    /* The pin announces its spacer after ScrollTrigger.refresh */
    window.addEventListener(LAYOUT_SETTLED_EVENT, scheduleBuild);

    /* The gate signing recolors the halt ring (clay → pine) without a
       scroll — watch the stamp's data-inked, mark dirty, draw once. */
    const stampObserver = new MutationObserver(() => {
      signed = document.querySelector("[data-stamp][data-inked]") !== null;
      dirty = true;
    });
    for (const stamp of document.querySelectorAll("[data-stamp]")) {
      stampObserver.observe(stamp, {
        attributes: true,
        attributeFilter: ["data-inked"],
      });
    }
    signed = document.querySelector("[data-stamp][data-inked]") !== null;

    return () => {
      disposed = true;
      if (queuedBuild) cancelAnimationFrame(queuedBuild);
      gsap.ticker.remove(onTick);
      window.removeEventListener("scroll", markDirty);
      window.removeEventListener("resize", scheduleBuild);
      window.removeEventListener(LAYOUT_SETTLED_EVENT, scheduleBuild);
      observer.disconnect();
      stampObserver.disconnect();
      delete canvas.__rail;
    };
  }, [lenis]);

  if (!lenis) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-thread-rail=""
      className="thread-rail"
    />
  );
}
