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

/** The rail + station geometry (SVG user units). */
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

/** Token travel: from the rail head to the halt, constant speed (the
 *  flagship's scrub has no easing either — a run, not a flourish). */
const RIDE_START = 0.5;
const RIDE_DURATION = 1.1;
const rideDelta = TOKEN_X - RAIL_X0;
/** When the token's constant-speed ride passes a station. */
const passesAt = (x: number) =>
  RIDE_START + ((x - RAIL_X0) / rideDelta) * RIDE_DURATION;
const HALT = RIDE_START + RIDE_DURATION;

export function AutomlEchoScene() {
  const rootRef = useSceneRun<HTMLDivElement>((tl, root) => {
    const q = gsap.utils.selector(root);
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

    /* ── Start frame: apparatus undrawn, run not yet begun ─────────── */
    gsap.set(rails, { strokeDashoffset: 1.5 });
    gsap.set([...beads, ...deployStation, ...gate, ...deploy, ...note], {
      opacity: 0,
    });
    gsap.set(labels, { opacity: 0.45 });
    gsap.set(token, { x: -rideDelta });
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
      .to(token, { x: 0, duration: RIDE_DURATION, ease: "none" }, RIDE_START);

    /* each phase ink-settles the instant the token passes it */
    PHASES.forEach((phase, i) => {
      tl.to(labels[i], { opacity: 1, duration: 0.3 }, passesAt(phase.x));
    });

    /* the halt: the bead turns clay, the gate pulses ONCE, and the
       figure rests — deploy never lights, run 041 stays a person's call */
    tl.to(beadInk, { opacity: 0, duration: 0.2 }, HALT)
      .to(beadClay, { opacity: 1, duration: 0.2 }, HALT)
      .fromTo(
        pulse,
        { opacity: 0.55, scale: 0.5, svgOrigin: `${GATE_X} ${RAIL_Y}` },
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
        className="block h-auto w-full max-w-[512px]"
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
    </div>
  );
}
