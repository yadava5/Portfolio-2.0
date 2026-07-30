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
 * unit and word survives. The forward-pass panel stays a single shared
 * edition: it is 210 units wide and rides >=1:1 in every seat — the
 * axonometric round below spent its new room on panel HEIGHT
 * (190 -> 233 units), never width, precisely so that guarantee holds.
 *
 * Panel two, the forward pass — THE DRAWN-DEPTH ROUND: rebuilt from a
 * flat left-to-right diagram into an axonometric figure. The stippled
 * seven rides a near input plane (a 28x28-style field with edge
 * ruling), the MLP's two hidden layers stand as cell-gridded planes
 * receding along one consistent depth axis, and the ten-slot readout
 * rides the far plane; the activation wave travels INTO the depth as
 * the scene runs. Depth is carried by drawn geometry only — mirrored
 * 2:1 axes (plane-width u down-right at (0.894, 0.447), depth d
 * up-right at (0.894, -0.447)), foreshortened cell parallelograms,
 * near strokes marginally heavier than far (1.5 -> 1.2 -> 1.0 via the
 * scene-plane-* classes), far->near paint order — never a CSS 3D
 * transform (a tilting plate is the banned HoloCard direction; drawn
 * axonometry renders identically at every tier and needs no fallback
 * chain). Mechanism only: the panel claims no accuracy number (the
 * ~97% is HELD in the proof manifest until a committed eval earns it).
 *
 * THE PANEL NAMES ITS OWN STAGES (CRITIC-LEDGER F37, re-seated for the
 * axonometric geometry): a cold reader once saw "a dot-matrix 7, a
 * partial second glyph, and an unlabelled 0-9 checkbox column", so the
 * three 13px labels — input · hidden · readout — and the closing clay
 * `answer · 7` line are load-bearing and survive the redraw. Each
 * label now seats against its own plane: `input` under the near
 * plane's lowest corner, `hidden` centered under the receding pair,
 * `readout` above the far plane's top edge, the answer line
 * right-anchored under the readout ribbon. The F37 em-box census was
 * re-run on the new geometry (13px mono = 8.56 units/char, ascent
 * 0.95em / descent 0.23em — the same measured metrics as the original
 * census): 14 text elements, 0 collisions. The tight pairs, measured:
 * hidden~answer clears by 3.86 vertically on a 6.35 horizontal
 * overlap; readout~digit-0 clears by 7.85; every adjacent digit pair
 * clears by 0.52 — the 12.2 -> 13.5 readout pitch that fixed the nine
 * F37 collisions is kept verbatim (11px digits' em boxes measure 13
 * units; 13.5 is the floor that clears them). The 7 is the drawn
 * digit, not a data claim; no number joins the figure.
 *
 * One-shot scroll-in run; the server markup is the settled frame (both
 * lanes at their measured lengths, every plane fully inked, the digit
 * read) for every static world.
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

/* ── Forward-pass geometry — the axonometric projection ────────────── */
/** Mirrored 2:1 axonometric axes: plane-width u runs down-right, the
 *  depth axis d runs up-right — one consistent drawn projection, the
 *  technical-illustration dialect, no CSS 3D anywhere. Plane height v
 *  stays screen-vertical. */
const AU = { x: 0.894, y: 0.447 };
const AD = { x: 0.894, y: -0.447 };

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
const GLYPH_PAD = 6;

/** A layer plane: depth along the axis + face size (w across, h up). */
interface Plane {
  d: number;
  w: number;
  h: number;
}

/* Face sizes are honest to the drawing, not to layer widths (the data
   claims no hidden sizes): the input field wraps the 7×9 stipple at
   pitch 6 with a 6-unit pad; the hidden planes carry 3×4 cell grids at
   pitch 8; the readout ribbon carries the ten 8-unit slots at the F37
   pitch of 13.5 with 5-unit pads. Depths 0/56/100/142 give the plane
   silhouettes 14/14/18-unit air gaps — no accidental overlap, so the
   far→near paint order is correct by construction. */
const P_INPUT: Plane = { d: 0, w: 52.2, h: 64.2 };
const P_H1: Plane = { d: 56, w: 27.2, h: 35.2 };
const P_H2: Plane = { d: 100, w: 27.2, h: 35.2 };
const P_OUT: Plane = { d: 142, w: 16, h: 139.5 };

const HID_PITCH = 8;
const HID_CELL = 5.2;
const HID_PAD = 3;

const SLOT = 8;
const SLOT_U = 4;
/* 12.2 → 13.5 (F37): the 11px slot digits' em boxes measure 13 units
   tall, so the old pitch overlapped every adjacent pair by 0.8 in the
   census. 13.5 clears them (by 0.52/pair, re-measured on the
   axonometric seats). */
const SLOT_PITCH = 13.5;
const SLOT_PAD = 5;
const WIN = 7; /* the slot the drawn seven lands in */

/** The depth line runs through the face centers; C0 is the input face
 *  center — x seats the near plane's left edge at 6, y is solved so
 *  the topmost em box (`readout`) rests at y=6 in the 210×233 canvas. */
const C0 = { x: 6 + (P_INPUT.w / 2) * AU.x, y: 163.15 };

const axCenter = (p: Plane) => ({
  x: C0.x + p.d * AD.x,
  y: C0.y + p.d * AD.y,
});
/** A face point: u from the left edge, v up from the bottom edge. */
const axPt = (p: Plane, u: number, v: number) => {
  const c = axCenter(p);
  return {
    x: c.x + (u - p.w / 2) * AU.x,
    y: c.y + (u - p.w / 2) * AU.y - (v - p.h / 2),
  };
};
const r2 = (n: number) => Math.round(n * 100) / 100;
const fmt = (q: { x: number; y: number }) => `${r2(q.x)} ${r2(q.y)}`;
/** A plane's outline parallelogram. */
const axPoly = (p: Plane) =>
  `M ${fmt(axPt(p, 0, 0))} L ${fmt(axPt(p, p.w, 0))} L ${fmt(
    axPt(p, p.w, p.h)
  )} L ${fmt(axPt(p, 0, p.h))} Z`;
/** A foreshortened s×s face cell at (u, v) from its bottom-left. */
const axCell = (p: Plane, u: number, v: number, s: number) =>
  `M ${fmt(axPt(p, u, v))} L ${fmt(axPt(p, u + s, v))} L ${fmt(
    axPt(p, u + s, v + s)
  )} L ${fmt(axPt(p, u, v + s))} Z`;

/** v of slot i's bottom edge (i=0 rides the ribbon top). */
const slotV = (i: number) => P_OUT.h - SLOT_PAD - SLOT - i * SLOT_PITCH;
/** The winning slot's face center — the pulse origin + edge landing. */
const WIN_C = axPt(P_OUT, SLOT_U + SLOT / 2, slotV(WIN) + SLOT / 2);
/** The ribbon's right silhouette edge — the digit column seats +6. */
const OUT_RIGHT = axPt(P_OUT, P_OUT.w, 0).x;

/* Stage-label seats (F37, re-measured for the axonometric geometry —
   census in the header): `input` centered under the near plane,
   `hidden` centered under the receding pair, `readout` above the far
   plane's top edge, the clay answer right-anchored under the ribbon. */
const LBL = {
  input: { x: C0.x, y: 223.3 },
  hidden: {
    x: (axPt(P_H1, 0, 0).x + axPt(P_H2, P_H2.w, 0).x) / 2,
    y: 178.2,
  },
  readout: { x: axCenter(P_OUT).x, y: 18.4 },
  answer: { x: 204, y: 197.4 },
} as const;

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
    const cells = q<SVGPathElement>("[data-sc-cell]");
    const planeIn = q<SVGPathElement>('[data-sc-plane="input"]');
    const planeH1 = q<SVGPathElement>('[data-sc-plane="h1"]');
    const planeH2 = q<SVGPathElement>('[data-sc-plane="h2"]');
    const planeOut = q<SVGPathElement>('[data-sc-plane="out"]');
    const hid1 = q<SVGPathElement>('[data-sc-hidden="1"]');
    const hid2 = q<SVGPathElement>('[data-sc-hidden="2"]');
    const edge1 = q<SVGPathElement>('[data-sc-nedge="1"]');
    const edge2 = q<SVGPathElement>('[data-sc-nedge="2"]');
    const edge3 = q<SVGPathElement>('[data-sc-nedge="3"]');
    const winSlot = q<SVGPathElement>("[data-sc-win]");
    const pulse = q<SVGCircleElement>("[data-sc-pulse]");

    /* ── Start frame ─────────────────────────────────────────────── */
    gsap.set(
      [
        ...laneA,
        ...laneB,
        ...tick,
        ...edge1,
        ...edge2,
        ...edge3,
        ...planeIn,
        ...planeH1,
        ...planeH2,
        ...planeOut,
      ],
      { strokeDashoffset: 1.5 }
    );
    gsap.set(beadA, { x: -(x1x - g.x0) });
    gsap.set(beadB, { x: -(g.x1 - g.x0) });
    gsap.set(cells, { opacity: 0 });
    gsap.set([...hid1, ...hid2], { opacity: 0.15 });
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

    /* ── The forward pass: the wave travels into the drawn depth ──
       Plane by plane along the axis — the near plane inks and stipples
       first, each edge carries the activation up the depth line, each
       plane outlines as the wave arrives, and the far ribbon settles
       last on the winning slot (in step with the race's landing). */
    tl.to(planeIn, { strokeDashoffset: 0, duration: 0.35 }, 0.05)
      .to(
        cells,
        {
          opacity: 0.85,
          duration: 0.25,
          stagger: { each: 0.008, from: "random" },
        },
        0.2
      )
      .to(edge1, { strokeDashoffset: 0, duration: 0.25 }, 0.5)
      .to(planeH1, { strokeDashoffset: 0, duration: 0.3 }, 0.55)
      .to(hid1, { opacity: 0.75, duration: 0.25, stagger: 0.02 }, 0.6)
      .to(edge2, { strokeDashoffset: 0, duration: 0.25 }, 0.75)
      .to(planeH2, { strokeDashoffset: 0, duration: 0.3 }, 0.8)
      .to(hid2, { opacity: 0.75, duration: 0.25, stagger: 0.02 }, 0.85)
      .to(planeOut, { strokeDashoffset: 0, duration: 0.35 }, 0.95)
      .to(edge3, { strokeDashoffset: 0, duration: 0.3 }, 1.0)
      .to(winSlot, { opacity: 1, duration: 0.35 }, RACE + 0.1)
      .fromTo(
        pulse,
        {
          opacity: 0.55,
          scale: 0.5,
          svgOrigin: `${r2(WIN_C.x)} ${r2(WIN_C.y)}`,
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

      {/* ── the forward pass, drawn into depth ── */}
      <svg
        aria-hidden="true"
        viewBox="0 0 210 233"
        className="block h-auto w-full max-w-[210px]"
      >
        {/* the depth axis, made visible — a quiet guide through the
            four face centers (static apparatus, like the race guides) */}
        <path
          className="scene-guide"
          d={`M ${fmt(axPt(P_INPUT, P_INPUT.w / 2, P_INPUT.h / 2))} L ${fmt(
            axPt(P_OUT, P_OUT.w / 2, P_OUT.h / 2)
          )}`}
        />

        {/* the planes, painted far → near (correct occlusion order);
            near strokes ride heavier than far (scene-plane-*) */}
        <path
          data-sc-plane="out"
          className="scene-plane-far"
          d={axPoly(P_OUT)}
          pathLength={1}
        />
        <path
          data-sc-plane="h2"
          className="scene-plane-mid"
          d={axPoly(P_H2)}
          pathLength={1}
        />
        <path
          data-sc-plane="h1"
          className="scene-plane-mid"
          d={axPoly(P_H1)}
          pathLength={1}
        />
        <path
          data-sc-plane="input"
          className="scene-plane-near"
          d={axPoly(P_INPUT)}
          pathLength={1}
        />

        {/* the near plane's 28×28-style edge ruling (static) */}
        {Array.from({ length: 8 }, (_, k) => {
          const a = axPt(P_INPUT, (k + 1) * PITCH, 0);
          return (
            <path
              key={`rb-${k}`}
              className="scene-plane-rule"
              d={`M ${fmt(a)} l 0 -2.5`}
            />
          );
        })}
        {Array.from({ length: 10 }, (_, k) => {
          const a = axPt(P_INPUT, 0, (k + 1) * PITCH);
          return (
            <path
              key={`rl-${k}`}
              className="scene-plane-rule"
              d={`M ${fmt(a)} l ${r2(2.5 * AU.x)} ${r2(2.5 * AU.y)}`}
            />
          );
        })}

        {/* the stippled seven, foreshortened on the near plane
            (bitmap row r counts from the top; face v from the bottom) */}
        {SEVEN.flatMap((row, r) =>
          row
            .split("")
            .map((bit, c) =>
              bit === "1" ? (
                <path
                  key={`${r}-${c}`}
                  data-sc-cell
                  className="scene-cell"
                  d={axCell(
                    P_INPUT,
                    GLYPH_PAD + c * PITCH,
                    P_INPUT.h - GLYPH_PAD - r * PITCH - CELL,
                    CELL
                  )}
                />
              ) : null
            )
        )}

        {/* the hidden layers' cell grids, column-major so the lit wave
            sweeps each face toward the depth */}
        {([P_H1, P_H2] as const).map((plane, n) =>
          Array.from({ length: 3 }, (_, c) =>
            Array.from({ length: 4 }, (_, r) => (
              <path
                key={`h${n}-${c}-${r}`}
                data-sc-hidden={n + 1}
                className="scene-hidden"
                d={axCell(
                  plane,
                  HID_PAD + c * HID_PITCH,
                  HID_PAD + r * HID_PITCH,
                  HID_CELL
                )}
              />
            ))
          )
        )}

        {/* the ten-slot readout on the far ribbon; slot seven filled */}
        {Array.from({ length: 10 }, (_, i) => {
          const win = i === WIN;
          const d = axCell(P_OUT, SLOT_U, slotV(i), SLOT);
          const digit = axPt(P_OUT, SLOT_U, slotV(i));
          return (
            <g key={i}>
              {win ? (
                <path data-sc-win className="scene-slot-win" d={d} />
              ) : (
                <path className="scene-slot" d={d} />
              )}
              {/* the predicted slot's digit answers in clay (F37) */}
              <text
                x={r2(OUT_RIGHT + 6)}
                y={r2(digit.y - 1.5)}
                className={win ? "sc-clay sc-small" : "sc-quiet sc-small"}
              >
                {i}
              </text>
            </g>
          );
        })}

        {/* sparse connectors — the activation's path up the depth line:
            near face → hidden faces → the winning slot */}
        <path
          data-sc-nedge="1"
          className="scene-edge"
          d={`M ${fmt(axPt(P_INPUT, P_INPUT.w - 6, P_INPUT.h / 2))} L ${fmt(
            axPt(P_H1, 2, P_H1.h / 2 - 2)
          )}`}
          pathLength={1}
        />
        <path
          data-sc-nedge="2"
          className="scene-edge"
          d={`M ${fmt(axPt(P_H1, P_H1.w - 2, P_H1.h / 2 - 2))} L ${fmt(
            axPt(P_H2, 2, P_H2.h / 2 - 2)
          )}`}
          pathLength={1}
        />
        <path
          data-sc-nedge="3"
          className="scene-edge"
          d={`M ${fmt(axPt(P_H2, P_H2.w - 2, P_H2.h / 2 - 2))} C ${r2(
            axPt(P_H2, P_H2.w - 2, P_H2.h / 2 - 2).x + 14
          )} ${r2(axPt(P_H2, P_H2.w - 2, P_H2.h / 2 - 2).y - 7)}, ${r2(
            WIN_C.x - 16
          )} ${r2(WIN_C.y)}, ${r2(WIN_C.x - 5)} ${r2(WIN_C.y)}`}
          pathLength={1}
        />

        {/* the stages, named (F37) — static in every world, so the
            settled/print frames carry the same reading */}
        {(["input", "hidden", "readout"] as const).map((stage) => (
          <text
            key={stage}
            x={r2(LBL[stage].x)}
            y={LBL[stage].y}
            textAnchor="middle"
            className="sc-quiet"
          >
            {stage}
          </text>
        ))}
        {/* the readout's conclusion, in clay — the drawn digit read
            back out. Mechanism, not a metric: 7 is the glyph above. */}
        <text
          x={LBL.answer.x}
          y={LBL.answer.y}
          textAnchor="end"
          className="sc-clay"
        >
          answer · {WIN}
        </text>
        <circle
          data-sc-pulse
          className="scene-pulse"
          cx={r2(WIN_C.x)}
          cy={r2(WIN_C.y)}
          r="8"
        />
      </svg>
    </div>
  );
}
