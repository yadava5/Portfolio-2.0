/**
 * @fileoverview Agentic AutoML — the card-level echo of the flagship
 * (FABLE-VISUAL-BRIEF B6, A1).
 *
 * A quiet, miniature rhyme with the home pinned scene (PipelineRun):
 * the ink run token crosses a horizontal excerpt of the platform's real
 * 7-phase lifecycle — the same decimal ladder fig 4.0 draws — and HALTS
 * at the clay human gate between 6.0 evaluate and 7.0 deploy. The card
 * whispers the thesis the flagship performs; it never competes with the
 * pin (one-shot scroll-in, no scrub, no pin — amendment A8).
 *
 * TWO AUTHORED EDITIONS (CRITIC-LEDGER F66, phone half): the wide
 * 512-unit plate (unchanged) and a narrow 280-unit edition for columns
 * under 380px, where the wide rail's 13px voice would render ~7px. The
 * narrow edition STANDS THE LADDER UP — the run rail falls vertically,
 * the six phase labels seat beside their stations at the full 13px
 * voice, and the token halts at the gate above a quiet rail that still
 * leads to an unresolved 7.0 deploy. The lifecycle citation and the
 * approval-edge annotation keep every word, re-broken across lines for
 * the narrow measure. Same phases, same halt, same honesty.
 *
 * HONESTY CONTRACT (load-bearing, the flagship's own): the scene ENDS
 * ON THE HALT. It never resolves 7.0 deploy (deploying is what a person
 * authorises after the gate) and it never touches run 041's approval —
 * approving stays the visitor's own press act (the case file's fig. 3
 * registry + the ch07 stamp). Deploy's station stays an open circle on
 * a quiet untraveled rail; its label stays in the quiet voice.
 *
 * The bead is body ink while it runs and clay only AT the gate (the
 * halt is the clay moment) — swapped by opacity crossfade of two
 * stacked beads, because fill is not an animatable property here (D3).
 *
 * Server markup is the settled frame: rails drawn, six phases full ink,
 * the token resting clay at the gate, deploy quiet. Every string traces
 * to settled data — see manifest.ts provenance notes.
 */

"use client";

import { useSceneRun } from "@/components/scenes/useSceneRun";
import { PROJECT_SCENE_MANIFEST } from "@/components/scenes/manifest";
import gsap from "gsap";

/** The rail + station geometry (SVG user units) — wide plate. */
const RAIL_Y = 118;
const RAIL_X0 = 20;
/** Where the resting token sits — just short of the gate. */
const TOKEN_X = 364;
/** The clay gate square center. */
const GATE_X = 380;
/** Deploy's station — past the gate, on the quiet untraveled rail. */
const DEPLOY_X = 452;

/** The six run phases (fig 4.0's decimal ladder, before the gate),
 *  alternating label seats so nothing collides at card scale. */
const PHASES = [
  { label: "1.0 ingest", x: 44, above: true },
  { label: "2.0 explore", x: 100, above: false },
  { label: "3.0 preprocess", x: 156, above: true },
  { label: "4.0 engineer", x: 212, above: false },
  { label: "5.0 train", x: 268, above: true },
  { label: "6.0 evaluate", x: 324, above: false },
];

/* ── Narrow edition geometry: the ladder stood upright ─────────────── */
const RAIL_X_M = 40;
/** The vertical run rail's head. */
const RAIL_HEAD_Y_M = 72;
/** Station y-centers, one per phase, top → bottom. */
const PHASE_Y_M = [88, 126, 164, 202, 240, 278];
/** The clay gate square center + the resting token, just above it. */
const GATE_Y_M = 320;
const TOKEN_Y_M = 306;
/** Deploy's station, below the gate on the quiet rail. */
const DEPLOY_Y_M = 368;

/** Token travel: from the rail head to the halt, constant speed (the
 *  flagship's scrub has no easing either — a run, not a flourish). */
const RIDE_START = 0.5;
const RIDE_DURATION = 1.1;
const HALT = RIDE_START + RIDE_DURATION;

export function AutomlEchoScene() {
  const rootRef = useSceneRun<HTMLDivElement>((tl, root) => {
    /* Choreograph the edition the container query shows. */
    const plates = Array.from(
      root.querySelectorAll<SVGSVGElement>("[data-sc-plate]")
    );
    const plate =
      plates.find((p) => p.getBoundingClientRect().width > 0) ?? plates[0];
    const narrow = plate.dataset.scPlate === "narrow";
    const q = gsap.utils.selector(plate);
    const rails = q<SVGPathElement>("[data-sc-rail-run], [data-sc-rail-quiet]");
    const beads = q<SVGCircleElement>("[data-sc-station]");
    const deployStation = q<SVGCircleElement>("[data-sc-station-deploy]");
    const gate = q<SVGGElement>("[data-sc-gate]");
    const deploy = q<SVGGElement>("[data-sc-deploy]");
    const labels = q<SVGTextElement>("[data-sc-phase]");
    const token = q<SVGGElement>("[data-sc-token]");
    const beadInk = q<SVGCircleElement>("[data-sc-bead-ink]");
    const beadClay = q<SVGCircleElement>("[data-sc-bead-clay]");
    const pulse = q<SVGCircleElement>("[data-sc-pulse]");
    const note = q<SVGGElement>("[data-sc-note]");

    /* The ride's axis: x along the wide rail, y down the narrow one. */
    const railHead = narrow ? RAIL_HEAD_Y_M : RAIL_X0;
    const tokenRest = narrow ? TOKEN_Y_M : TOKEN_X;
    const rideDelta = tokenRest - railHead;
    /** When the token's constant-speed ride passes a station. */
    const passesAt = (c: number) =>
      RIDE_START + ((c - railHead) / rideDelta) * RIDE_DURATION;

    /* ── Start frame: apparatus undrawn, run not yet begun ─────────── */
    gsap.set(rails, { strokeDashoffset: 1.5 });
    gsap.set([...beads, ...deployStation, ...gate, ...deploy, ...note], {
      opacity: 0,
    });
    gsap.set(labels, { opacity: 0.45 });
    gsap.set(token, narrow ? { y: -rideDelta } : { x: -rideDelta });
    gsap.set(beadInk, { opacity: 1 });
    gsap.set(beadClay, { opacity: 0 });

    /* ── The run: the apparatus inks, the token rides, the gate holds ── */
    tl.to(rails, {
      strokeDashoffset: 0,
      duration: 0.5,
      ease: "power1.inOut",
    })
      .to(beads, { opacity: 1, duration: 0.25, stagger: 0.07 }, 0.15)
      .to(gate, { opacity: 1, duration: 0.35 }, 0.3)
      .to(deployStation, { opacity: 1, duration: 0.3 }, 0.4)
      .to(deploy, { opacity: 1, duration: 0.3 }, 0.4)
      .to(
        token,
        narrow
          ? { y: 0, duration: RIDE_DURATION, ease: "none" }
          : { x: 0, duration: RIDE_DURATION, ease: "none" },
        RIDE_START
      );

    /* each phase ink-settles the instant the token passes it */
    labels.forEach((labelEl, i) => {
      const at = passesAt(narrow ? PHASE_Y_M[i] : PHASES[i].x);
      tl.to(labelEl, { opacity: 1, duration: 0.3 }, at);
    });

    /* the halt: the bead turns clay, the gate pulses ONCE, and the
       figure rests — deploy never lights, run 041 stays a person's call */
    tl.to(beadInk, { opacity: 0, duration: 0.2 }, HALT)
      .to(beadClay, { opacity: 1, duration: 0.2 }, HALT)
      .fromTo(
        pulse,
        {
          opacity: 0.55,
          scale: 0.5,
          svgOrigin: narrow ? `${RAIL_X_M} ${GATE_Y_M}` : `${GATE_X} ${RAIL_Y}`,
        },
        {
          opacity: 0,
          scale: 1.9,
          duration: 0.55,
          ease: "power2.out",
          immediateRender: false,
        },
        HALT + 0.05
      )
      .to(note, { opacity: 1, duration: 0.4 }, HALT + 0.3);
  });

  return (
    <div ref={rootRef} className="scene-fig" data-scene-automl-echo>
      <svg
        role="img"
        aria-label={PROJECT_SCENE_MANIFEST.automl.alt}
        viewBox="0 0 512 206"
        data-sc-plate="wide"
        className="scene-plate-wide block h-auto w-full max-w-[512px]"
      >
        {/* the settled orchestration facts, quietly cited */}
        <text x="12" y="20" className="sc-quiet sc-small">
          7-phase lifecycle · langgraph + mcp · default model gpt-5.4
        </text>

        {/* the traveled rail — head to the gate */}
        <path
          data-sc-rail-run
          className="scene-edge"
          d={`M ${RAIL_X0} ${RAIL_Y} H ${GATE_X - 8}`}
          pathLength={1}
        />
        {/* the untraveled rail — the gate to deploy, quiet on purpose */}
        <path
          data-sc-rail-quiet
          className="scene-rail"
          d={`M ${GATE_X + 8} ${RAIL_Y} H 480`}
          pathLength={1}
        />

        {/* six run stations + their decimal labels */}
        {PHASES.map((phase) => (
          <circle
            key={phase.label}
            data-sc-station
            className="scene-bead"
            cx={phase.x}
            cy={RAIL_Y}
            r="2.6"
          />
        ))}
        {PHASES.map((phase) => (
          <text
            key={phase.label}
            data-sc-phase
            x={phase.x}
            y={phase.above ? 98 : 142}
            textAnchor="middle"
          >
            {phase.label}
          </text>
        ))}

        {/* the human gate — the flagship's own words and clay square */}
        <g data-sc-gate>
          <text x={GATE_X} y="70" textAnchor="middle" className="sc-clay">
            the human gate — go / no-go
          </text>
          <path className="scene-post" d={`M ${GATE_X} 78 V 106`} />
          <rect
            className="scene-gate"
            x={GATE_X - 4}
            y={RAIL_Y - 4}
            width="8"
            height="8"
          />
        </g>
        <circle
          data-sc-pulse
          className="scene-pulse"
          cx={GATE_X}
          cy={RAIL_Y}
          r="7"
        />

        {/* deploy: an open station on the quiet rail, label in the quiet
            voice — never lit, never resolved (the honesty contract) */}
        <circle
          data-sc-station-deploy
          className="scene-slot"
          cx={DEPLOY_X}
          cy={RAIL_Y}
          r="3.2"
        />
        <g data-sc-deploy>
          <text x={DEPLOY_X} y="142" textAnchor="middle" className="sc-quiet">
            7.0 deploy
          </text>
        </g>

        {/* the run token, resting at the gate: ink bead hidden, clay
            bead standing — the markup IS the halt */}
        <g data-sc-token>
          <circle
            cx={TOKEN_X}
            cy={RAIL_Y}
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <circle
            data-sc-bead-ink
            className="scene-bead"
            opacity="0"
            cx={TOKEN_X}
            cy={RAIL_Y}
            r="3.4"
          />
          <circle
            data-sc-bead-clay
            className="scene-gate"
            cx={TOKEN_X}
            cy={RAIL_Y}
            r="3.4"
          />
        </g>

        {/* the settled architecture annotation, verbatim (two lines so
            the full clause stays inside the plate — contain: paint) */}
        <g data-sc-note>
          <text x="12" y="178" className="sc-quiet">
            generated actions hold at the approval edge
          </text>
          <text x="12" y="196" className="sc-quiet">
            until a human says go
          </text>
        </g>
      </svg>

      {/* ── the narrow edition: the ladder stood upright ──
          The same six phases fall a vertical rail (labels beside their
          stations, full 13px), the token rests clay at the gate, and
          the quiet rail still leads to an unresolved 7.0 deploy. The
          citation and the annotation keep every word, re-broken for
          the 280-unit measure. */}
      <svg
        role="img"
        aria-label={PROJECT_SCENE_MANIFEST.automl.alt}
        viewBox="0 0 280 440"
        data-sc-plate="narrow"
        className="scene-plate-narrow h-auto w-full max-w-[280px]"
      >
        {/* the settled orchestration facts, quietly cited */}
        <text x="10" y="18" className="sc-quiet">
          7-phase lifecycle ·
        </text>
        <text x="10" y="36" className="sc-quiet">
          langgraph + mcp ·
        </text>
        <text x="10" y="54" className="sc-quiet">
          default model gpt-5.4
        </text>

        {/* the traveled rail — head to the gate */}
        <path
          data-sc-rail-run
          className="scene-edge"
          d={`M ${RAIL_X_M} ${RAIL_HEAD_Y_M} V ${GATE_Y_M - 8}`}
          pathLength={1}
        />
        {/* the untraveled rail — the gate to deploy, quiet on purpose */}
        <path
          data-sc-rail-quiet
          className="scene-rail"
          d={`M ${RAIL_X_M} ${GATE_Y_M + 8} V ${DEPLOY_Y_M}`}
          pathLength={1}
        />

        {/* six run stations + their decimal labels, seated beside */}
        {PHASES.map((phase, i) => (
          <circle
            key={phase.label}
            data-sc-station
            className="scene-bead"
            cx={RAIL_X_M}
            cy={PHASE_Y_M[i]}
            r="2.6"
          />
        ))}
        {PHASES.map((phase, i) => (
          <text key={phase.label} data-sc-phase x="56" y={PHASE_Y_M[i] + 4}>
            {phase.label}
          </text>
        ))}

        {/* the human gate — the flagship's own words and clay square */}
        <g data-sc-gate>
          <text x="56" y={GATE_Y_M - 4} className="sc-clay">
            the human gate
          </text>
          <text x="56" y={GATE_Y_M + 12} className="sc-clay">
            go / no-go
          </text>
          <rect
            className="scene-gate"
            x={RAIL_X_M - 4}
            y={GATE_Y_M - 4}
            width="8"
            height="8"
          />
        </g>
        <circle
          data-sc-pulse
          className="scene-pulse"
          cx={RAIL_X_M}
          cy={GATE_Y_M}
          r="7"
        />

        {/* deploy: an open station on the quiet rail, never resolved */}
        <circle
          data-sc-station-deploy
          className="scene-slot"
          cx={RAIL_X_M}
          cy={DEPLOY_Y_M}
          r="3.2"
        />
        <g data-sc-deploy>
          <text x="56" y={DEPLOY_Y_M + 4} className="sc-quiet">
            7.0 deploy
          </text>
        </g>

        {/* the run token, resting at the gate — the markup IS the halt */}
        <g data-sc-token>
          <circle
            cx={RAIL_X_M}
            cy={TOKEN_Y_M}
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <circle
            data-sc-bead-ink
            className="scene-bead"
            opacity="0"
            cx={RAIL_X_M}
            cy={TOKEN_Y_M}
            r="3.4"
          />
          <circle
            data-sc-bead-clay
            className="scene-gate"
            cx={RAIL_X_M}
            cy={TOKEN_Y_M}
            r="3.4"
          />
        </g>

        {/* the settled architecture annotation, verbatim across three
            lines — the narrow measure's honest break */}
        <g data-sc-note>
          <text x="10" y="398" className="sc-quiet">
            generated actions hold
          </text>
          <text x="10" y="416" className="sc-quiet">
            at the approval edge
          </text>
          <text x="10" y="434" className="sc-quiet">
            until a human says go
          </text>
        </g>
      </svg>
    </div>
  );
}
