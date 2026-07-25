/**
 * @fileoverview Glyph — "the race" + "the forward pass" (BRIEF B3, A1/A2).
 *
 * Panel one, the race: two ink lanes drawn for the SAME duration, so
 * distance IS measured speed — the -O3 scalar lane reaches 1x while the
 * openmp+simd lane reaches 3.5x on the dot-256 axis (the committed
 * BENCHMARKS.md number, the site's proof-cited 3.5x). This is a
 * benchmark figure with units and provenance, not a skill bar: lanes on
 * an axis, in ink, a single clay tick where the measured result lands.
 * No per-instruction-set multipliers are drawn because none are in the
 * settled data — the four ISAs ride the caption as names only.
 *
 * Panel two, the forward pass: a stippled digit seven feeds the MLP's
 * mechanism — hidden cells waving lit left→right — into a ten-slot
 * readout where slot seven ink-fills and takes the clay tick. Mechanism
 * only: the panel claims no accuracy number (the ~97% is HELD in the
 * proof manifest until a committed eval run earns it).
 *
 * One-shot scroll-in run; the server markup is the settled frame (both
 * lanes at their measured lengths, the digit read) for every static
 * world.
 */

"use client";

import { useSceneRun } from "@/components/scenes/useSceneRun";
import { PROJECT_SCENE_MANIFEST } from "@/components/scenes/manifest";
import gsap from "gsap";

/* ── Race geometry: axis x0 → x1 spans 0 → 3.5x ────────────────────── */
const AXIS_X0 = 16;
const AXIS_X1 = 384;
/** x of a multiplier on the axis */
const mx = (m: number) => AXIS_X0 + ((AXIS_X1 - AXIS_X0) * m) / 3.5;
const X_1 = mx(1); /* ≈ 121.1 */
const X_35 = AXIS_X1;

/* ── Forward-pass geometry ─────────────────────────────────────────── */
/** The stippled seven: 7×9 cell bitmap (mechanism illustration). */
const SEVEN = [
  "1111111",
  "0000011",
  "0000110",
  "0001100",
  "0011000",
  "0011000",
  "0110000",
  "0110000",
  "0110000",
];
const CELL = 4.2;
const PITCH = 6;
const GLYPH_X = 14;
const GLYPH_Y = 48;

const SLOT_X = 150;
const SLOT_Y0 = 28;
const SLOT_PITCH = 12.2;
const WIN = 7; /* the slot the drawn seven lands in */

export function GlyphScene() {
  const rootRef = useSceneRun<HTMLDivElement>((tl, root) => {
    const q = gsap.utils.selector(root);
    const laneA = q<SVGPathElement>("[data-sc-lane-scalar]");
    const laneB = q<SVGPathElement>("[data-sc-lane-simd]");
    const beadA = q<SVGCircleElement>("[data-sc-bead-scalar]");
    const beadB = q<SVGCircleElement>("[data-sc-bead-simd]");
    const tick = q<SVGPathElement>("[data-sc-claytick]");
    const cells = q<SVGRectElement>("[data-sc-cell]");
    const hidden = q<SVGRectElement>("[data-sc-hidden]");
    const nedges = q<SVGPathElement>("[data-sc-nedge]");
    const winSlot = q<SVGRectElement>("[data-sc-win]");
    const pulse = q<SVGCircleElement>("[data-sc-pulse]");

    /* ── Start frame ─────────────────────────────────────────────── */
    gsap.set([...laneA, ...laneB, ...tick, ...nedges], {
      strokeDashoffset: 1.5,
    });
    gsap.set(beadA, { x: -(X_1 - AXIS_X0) });
    gsap.set(beadB, { x: -(X_35 - AXIS_X0) });
    gsap.set(cells, { opacity: 0 });
    gsap.set(hidden, { opacity: 0.15 });
    gsap.set(winSlot, { opacity: 0.15 });

    /* ── The race: one duration, two measured distances ──────────── */
    const RACE = 1.1;
    tl.to([...laneA, ...laneB], {
      strokeDashoffset: 0,
      duration: RACE,
      ease: "none",
    })
      .to(beadA, { x: 0, duration: RACE, ease: "none" }, 0)
      .to(beadB, { x: 0, duration: RACE, ease: "none" }, 0)
      /* the measured landing takes its clay tick */
      .to(tick, { strokeDashoffset: 0, duration: 0.3 }, RACE);

    /* ── The forward pass, reading alongside ─────────────────────── */
    tl.to(
      cells,
      {
        opacity: 0.85,
        duration: 0.25,
        stagger: { each: 0.008, from: "random" },
      },
      0.2
    )
      .to(hidden, { opacity: 0.75, duration: 0.3, stagger: 0.05 }, 0.7)
      .to(nedges, { strokeDashoffset: 0, duration: 0.3, stagger: 0.1 }, 0.9)
      .to(winSlot, { opacity: 1, duration: 0.35 }, RACE + 0.1)
      .fromTo(
        pulse,
        {
          opacity: 0.55,
          scale: 0.5,
          svgOrigin: `${SLOT_X + 4} ${SLOT_Y0 + WIN * SLOT_PITCH + 4}`,
        },
        {
          opacity: 0,
          scale: 1.9,
          duration: 0.55,
          ease: "power2.out",
          immediateRender: false,
        },
        RACE + 0.1
      );
  });

  return (
    <div
      ref={rootRef}
      className="scene-fig flex flex-wrap items-start gap-x-10 gap-y-6"
      data-scene-glyph
    >
      {/* ── the race ── */}
      <svg
        role="img"
        aria-label={PROJECT_SCENE_MANIFEST["fast-mnist-nn"].alt}
        viewBox="0 0 400 190"
        className="block h-auto w-full max-w-[400px]"
      >
        {/* quiet guides at the measured marks */}
        <path className="scene-guide" d={`M ${X_1} 54 V 152`} />
        <path className="scene-guide" d={`M ${X_35} 96 V 152`} />

        {/* lane 1 — the -O3 scalar baseline (the axis carries its 1x) */}
        <text x={AXIS_X0} y="50" className="sc-quiet">
          -O3 scalar
        </text>
        <path
          data-sc-lane-scalar
          className="scene-edge"
          d={`M ${AXIS_X0} 62 H ${X_1}`}
          pathLength={1}
        />
        <circle
          data-sc-bead-scalar
          className="scene-bead"
          cx={X_1}
          cy="62"
          r="3.2"
        />

        {/* lane 2 — openmp+simd, same time, 3.5x the distance (the axis
            carries the clay 3.5x, once) */}
        <text x={AXIS_X0} y="104" className="sc-quiet">
          openmp + simd
        </text>
        <path
          data-sc-lane-simd
          className="scene-edge"
          d={`M ${AXIS_X0} 116 H ${X_35}`}
          pathLength={1}
        />
        <circle
          data-sc-bead-simd
          className="scene-bead"
          cx={X_35}
          cy="116"
          r="3.2"
        />
        {/* the clay tick on the measured landing */}
        <path
          data-sc-claytick
          className="scene-claytick"
          d="M 366 146 c 2.2 2.4 3.5 3.4 4.6 3.1 c 2 -2.8 5.5 -6.4 9.8 -8.2"
          pathLength={1}
        />

        {/* the axis — real units */}
        <path
          className="scene-rail"
          d={`M ${AXIS_X0} 152 H ${AXIS_X1}`}
          pathLength={1}
        />
        {(
          [
            { x: AXIS_X0, label: "0", anchor: "middle", clay: false },
            { x: X_1, label: "1x", anchor: "middle", clay: false },
            { x: X_35, label: "3.5x", anchor: "end", clay: true },
          ] as const
        ).map((tickDef) => (
          <g key={tickDef.label}>
            <path className="scene-post" d={`M ${tickDef.x} 152 V 158`} />
            <text
              x={tickDef.x}
              y="172"
              textAnchor={tickDef.anchor}
              className={tickDef.clay ? "sc-clay" : "sc-quiet"}
            >
              {tickDef.label}
            </text>
          </g>
        ))}
        <text x={AXIS_X0} y="188" className="sc-quiet">
          dot 256 kernel — committed benchmarks
        </text>
      </svg>

      {/* ── the forward pass ── */}
      <svg
        aria-hidden="true"
        viewBox="0 0 210 190"
        className="block h-auto w-full max-w-[210px]"
      >
        {/* the stippled seven */}
        {SEVEN.flatMap((row, r) =>
          row
            .split("")
            .map((bit, c) =>
              bit === "1" ? (
                <rect
                  key={`${r}-${c}`}
                  data-sc-cell
                  className="scene-cell"
                  x={GLYPH_X + c * PITCH}
                  y={GLYPH_Y + r * PITCH}
                  width={CELL}
                  height={CELL}
                />
              ) : null
            )
        )}

        {/* the MLP's hidden cells, waving lit left → right */}
        {[84, 106].map((x) =>
          Array.from({ length: 6 }, (_, i) => (
            <rect
              key={`${x}-${i}`}
              data-sc-hidden
              className="scene-hidden"
              x={x}
              y={52 + i * 11}
              width="6"
              height="6"
            />
          ))
        )}

        {/* sparse connectors: in → hidden → the winning slot */}
        <path
          data-sc-nedge
          className="scene-edge"
          d="M 62 75 H 82"
          pathLength={1}
        />
        <path
          data-sc-nedge
          className="scene-edge"
          d="M 92 75 H 104"
          pathLength={1}
        />
        <path
          data-sc-nedge
          className="scene-edge"
          d={`M 114 78 C 130 80, 132 ${SLOT_Y0 + WIN * SLOT_PITCH + 4}, 146 ${
            SLOT_Y0 + WIN * SLOT_PITCH + 4
          }`}
          pathLength={1}
        />

        {/* the ten-slot readout; slot seven filled, clay-ticked */}
        {Array.from({ length: 10 }, (_, i) => {
          const y = SLOT_Y0 + i * SLOT_PITCH;
          const win = i === WIN;
          return (
            <g key={i}>
              {win ? (
                <rect
                  data-sc-win
                  className="scene-slot-win"
                  x={SLOT_X}
                  y={y}
                  width="8"
                  height="8"
                />
              ) : (
                <rect
                  className="scene-slot"
                  x={SLOT_X}
                  y={y}
                  width="8"
                  height="8"
                />
              )}
              <text x={SLOT_X + 14} y={y + 8} className="sc-quiet sc-small">
                {i}
              </text>
            </g>
          );
        })}
        <circle
          data-sc-pulse
          className="scene-pulse"
          cx={SLOT_X + 4}
          cy={SLOT_Y0 + WIN * SLOT_PITCH + 4}
          r="8"
        />
      </svg>
    </div>
  );
}
