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
 * TWO AUTHORED RACE PANELS (CRITIC-LEDGER F66, phone half): the wide
 * 400-unit panel and a narrow 280-unit edition for columns under
 * 380px. The race is a RATIO figure — 0 → 1x → 3.5x on one axis — so
 * the narrow edition re-derives the same geometry on a shorter axis
 * (both lanes scale together; the measured 3.5:1 relation is exact in
 * both editions) and wraps the axis caption to two lines. Every mark,
 * unit and word survives. The forward-pass panel is 210 units and
 * already rides ≥1:1 in every seat, so it is shared, not re-authored.
 *
 * Panel two, the forward pass: a stippled digit seven feeds the MLP's
 * mechanism — hidden cells waving lit left→right — into a ten-slot
 * readout where slot seven ink-fills and takes the pulse. Mechanism
 * only: the panel claims no accuracy number (the ~97% is HELD in the
 * proof manifest until a committed eval run earns it).
 *
 * THE PANEL NAMES ITS OWN STAGES (CRITIC-LEDGER F37): a cold reader saw
 * "a dot-matrix 7, a partial second glyph, and an unlabelled 0–9
 * checkbox column". Three quiet 13px labels now head the columns —
 * input · hidden · readout — and a clay `answer · 7` line closes the
 * readout, so the two-second read is "the network reads a drawn 7 and
 * answers 7" (the case study's own words: "you draw a digit and watch
 * the network read it"). The 7 is the drawn digit, not a data claim; no
 * number joins the figure. The readout pitch steps 12.2 → 13.5 so the
 * 11px digits' 13-unit em boxes clear each other — the small redraw
 * WAVE2-STATUS's F66/F32 ESCALATE note said this column needed (nine
 * adjacent-pair em-box collisions in the F37 census before, zero
 * after). The wide race plate's viewBox gains 2 units of depth for the
 * same census reason: the axis caption's em-box descent (baseline 188,
 * descent 3) crossed y=190; no ink moves.
 *
 * One-shot scroll-in run; the server markup is the settled frame (both
 * lanes at their measured lengths, the digit read) for every static
 * world.
 */

"use client";

import { useSceneRun } from "@/components/scenes/useSceneRun";
import { PROJECT_SCENE_MANIFEST } from "@/components/scenes/manifest";
import gsap from "gsap";

/* ── Race geometry: axis x0 → x1 spans 0 → 3.5x, per edition ───────── */
const RACE_GEOM = {
  wide: { x0: 16, x1: 384 },
  narrow: { x0: 12, x1: 268 },
} as const;
/** x of a multiplier on the axis. */
const mx = (g: { x0: number; x1: number }, m: number) =>
  g.x0 + ((g.x1 - g.x0) * m) / 3.5;

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
/* 12.2 → 13.5 (F37): the 11px slot digits' em boxes measure 13 units
   tall, so the old pitch overlapped every adjacent pair by 0.8 in the
   census. 13.5 clears them with margin and the column (ends y 157.5)
   still leaves the answer line its floor. */
const SLOT_PITCH = 13.5;
const WIN = 7; /* the slot the drawn seven lands in */

/* Stage-label centers (F37), measured against the drawn columns:
   glyph x 14–54.2 → 34; hidden cells x 84–112 (center 98, seated at 94
   so the three inter-label gaps run ~12/13, not 20/7 — a 7-unit gap
   reads as the phrase "hidden readout"); slots + digits x 150–171
   (center 160.6, seated at 162 for the same rhythm). Labels are 13px
   (8.56 units/char), so the widest, `readout`, spans 132.7–192.6
   inside the 210 canvas. */
const LABEL_Y = 14;
const LABEL_X = { input: 34, hidden: 94, readout: 162 } as const;

/** One race panel — both editions draw from the same derivation. */
function RacePanel({ edition }: { edition: "wide" | "narrow" }) {
  const g = RACE_GEOM[edition];
  const x1x = mx(g, 1);
  const x35 = g.x1;
  const narrow = edition === "narrow";
  return (
    <svg
      role="img"
      aria-label={PROJECT_SCENE_MANIFEST["fast-mnist-nn"].alt}
      viewBox={narrow ? "0 0 280 216" : "0 0 400 192"}
      data-sc-plate={edition}
      className={
        narrow
          ? "scene-plate-narrow h-auto w-full max-w-[280px]"
          : "scene-plate-wide block h-auto w-full max-w-[400px]"
      }
    >
      {/* quiet guides at the measured marks */}
      <path className="scene-guide" d={`M ${x1x} 54 V 152`} />
      <path className="scene-guide" d={`M ${x35} 96 V 152`} />

      {/* lane 1 — the -O3 scalar baseline (the axis carries its 1x) */}
      <text x={g.x0} y="50" className="sc-quiet">
        -O3 scalar
      </text>
      <path
        data-sc-lane-scalar
        className="scene-edge"
        d={`M ${g.x0} 62 H ${x1x}`}
        pathLength={1}
      />
      <circle
        data-sc-bead-scalar
        className="scene-bead"
        cx={x1x}
        cy="62"
        r="3.2"
      />

      {/* lane 2 — openmp+simd, same time, 3.5x the distance (the axis
          carries the clay 3.5x, once) */}
      <text x={g.x0} y="104" className="sc-quiet">
        openmp + simd
      </text>
      <path
        data-sc-lane-simd
        className="scene-edge"
        d={`M ${g.x0} 116 H ${x35}`}
        pathLength={1}
      />
      <circle
        data-sc-bead-simd
        className="scene-bead"
        cx={x35}
        cy="116"
        r="3.2"
      />
      {/* the clay tick on the measured landing */}
      <path
        data-sc-claytick
        className="scene-claytick"
        d={`M ${x35 - 18} 146 c 2.2 2.4 3.5 3.4 4.6 3.1 c 2 -2.8 5.5 -6.4 9.8 -8.2`}
        pathLength={1}
      />

      {/* the axis — real units */}
      <path
        className="scene-rail"
        d={`M ${g.x0} 152 H ${g.x1}`}
        pathLength={1}
      />
      {(
        [
          { x: g.x0, label: "0", anchor: "middle", clay: false },
          { x: x1x, label: "1×", anchor: "middle", clay: false },
          { x: x35, label: "3.5×", anchor: "end", clay: true },
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
      {/* the provenance caption: one line on the wide axis, wrapped to
          two on the narrow one — same words, same order */}
      {narrow ? (
        <>
          <text x={g.x0} y="192" className="sc-quiet">
            dot 256 kernel —
          </text>
          <text x={g.x0} y="210" className="sc-quiet">
            committed benchmarks
          </text>
        </>
      ) : (
        <text x={g.x0} y="188" className="sc-quiet">
          dot 256 kernel — committed benchmarks
        </text>
      )}
    </svg>
  );
}

export function GlyphScene() {
  const rootRef = useSceneRun<HTMLDivElement>((tl, root) => {
    /* The race runs on whichever panel the container query shows; the
       forward pass is a single shared panel. */
    const plates = Array.from(
      root.querySelectorAll<SVGSVGElement>("[data-sc-plate]")
    );
    const race =
      plates.find((p) => p.getBoundingClientRect().width > 0) ?? plates[0];
    const g = RACE_GEOM[race.dataset.scPlate === "narrow" ? "narrow" : "wide"];
    const x1x = mx(g, 1);
    const qr = gsap.utils.selector(race);
    const q = gsap.utils.selector(root);
    const laneA = qr<SVGPathElement>("[data-sc-lane-scalar]");
    const laneB = qr<SVGPathElement>("[data-sc-lane-simd]");
    const beadA = qr<SVGCircleElement>("[data-sc-bead-scalar]");
    const beadB = qr<SVGCircleElement>("[data-sc-bead-simd]");
    const tick = qr<SVGPathElement>("[data-sc-claytick]");
    const cells = q<SVGRectElement>("[data-sc-cell]");
    const hidden = q<SVGRectElement>("[data-sc-hidden]");
    const nedges = q<SVGPathElement>("[data-sc-nedge]");
    const winSlot = q<SVGRectElement>("[data-sc-win]");
    const pulse = q<SVGCircleElement>("[data-sc-pulse]");

    /* ── Start frame ─────────────────────────────────────────────── */
    gsap.set([...laneA, ...laneB, ...tick, ...nedges], {
      strokeDashoffset: 1.5,
    });
    gsap.set(beadA, { x: -(x1x - g.x0) });
    gsap.set(beadB, { x: -(g.x1 - g.x0) });
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
      {/* ── the race, in both editions (CSS shows one) ── */}
      <RacePanel edition="wide" />
      <RacePanel edition="narrow" />

      {/* ── the forward pass ── */}
      <svg
        aria-hidden="true"
        viewBox="0 0 210 190"
        className="block h-auto w-full max-w-[210px]"
      >
        {/* the stages, named (F37) — static in every world, so the
            settled/print frames carry the same reading */}
        {(["input", "hidden", "readout"] as const).map((stage) => (
          <text
            key={stage}
            x={LABEL_X[stage]}
            y={LABEL_Y}
            textAnchor="middle"
            className="sc-quiet"
          >
            {stage}
          </text>
        ))}

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
              {/* the predicted slot's digit answers in clay (F37) */}
              <text
                x={SLOT_X + 14}
                y={y + 8}
                className={win ? "sc-clay sc-small" : "sc-quiet sc-small"}
              >
                {i}
              </text>
            </g>
          );
        })}
        {/* the readout's conclusion, in clay — the drawn digit read
            back out. Mechanism, not a metric: 7 is the glyph above. */}
        <text
          x={LABEL_X.readout}
          y="184"
          textAnchor="middle"
          className="sc-clay"
        >
          answer · {WIN}
        </text>
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
