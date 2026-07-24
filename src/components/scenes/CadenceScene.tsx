/**
 * @fileoverview Cadence — "the parse" (FABLE-VISUAL-BRIEF B2, A1+A2).
 *
 * The project's idea, drawn running: a typed plain-English sentence has
 * its meaningful spans underlined (the parser reading), then the spans
 * LIFT OUT of the sentence and fly to rest as structured chips — when,
 * invitees, and last the clay Google Meet chip (the brief's prescribed
 * finale) — while the event snaps onto a drawn week grid and takes a
 * small clay Meet badge. The sentence literally becomes the schedule.
 *
 * HONESTY (D6): the sentence is an ILLUSTRATIVE example, labeled so in
 * the figure and the manifest disclosure — never real user data. No
 * parser runs in this card (brief B2: no live LLM/NLP from a static
 * export); the choreography is scripted, and the caption says so. Every
 * named capability is settled data: chrono-node + compromise parse
 * plain English into events and tasks (projects.ts, case architecture),
 * and Google Meet scheduling with multi-attendee invites ships in the
 * real app (projects.ts highlights/metrics) — hence the two invitees.
 *
 * One-shot scroll-in run (useSceneRun — no pin); the server markup is
 * the settled frame (spans underlined, chips at rest, event + clay Meet
 * badge on the grid) in every static world. Monospace char math: every
 * sentence segment is its own <text> pinned with textLength, so the
 * underlines and chip flight paths align by construction.
 */

"use client";

import { useSceneRun } from "@/components/scenes/useSceneRun";
import { PROJECT_SCENE_MANIFEST } from "@/components/scenes/manifest";
import gsap from "gsap";

/** Monospace advance (SVG user units) the sentence is typeset on. */
const CW = 7.5;
/** Sentence origin + underline baseline. */
const SX = 12;
const SY = 34;
const UY = 41;

/** The illustrative sentence, segmented: quiet connective tissue vs the
 *  spans the parser lifts (span ids feed the underlines + chip flights). */
const SEGMENTS: { text: string; at: number; span?: string }[] = [
  { text: "“", at: 0 },
  { text: "lunch", at: 1, span: "title" },
  { text: " with ", at: 6 },
  { text: "sam", at: 12, span: "who" },
  { text: " and ", at: 15 },
  { text: "priya", at: 20, span: "who2" },
  { text: " ", at: 25 },
  { text: "next tuesday at noon", at: 26, span: "when" },
  { text: " — ", at: 46 },
  { text: "add a meet", at: 49, span: "meet" },
  { text: "”", at: 59 },
];

const spanX = (at: number) => SX + at * CW;
const spanW = (len: number) => len * CW;

/** Chip stack (left column) — rest geometry. */
const CHIP_X = 12;
const CHIP_W = 160;
const CHIP_H = 22;
const CHIP_Y = { when: 108, who: 140, meet: 172 };

/** Week grid (right column): 7 day columns × 3 row bands. */
const GRID_X = 280;
const COL_W = 30;
const GRID_Y = 104;
const ROW_H = 30;
const DAYS = ["m", "t", "w", "t", "f", "s", "s"];

/** The parsed event: tuesday × the noon row. */
const BLOCK = { x: 312, y: 138, w: 26, h: 22 };

export function CadenceScene() {
  const rootRef = useSceneRun<HTMLDivElement>((tl, root) => {
    const q = gsap.utils.selector(root);
    const underlines = q<SVGPathElement>("[data-sc-underline]");
    const thread = q<SVGPathElement>("[data-sc-thread]");
    const guides = q<SVGPathElement>("[data-sc-gridline]");
    const gridLabels = q<SVGGElement>("[data-sc-grid-labels]");
    const snap = q<SVGPathElement>("[data-sc-snap]");
    const block = q<SVGRectElement>("[data-sc-block]");
    const badge = q<SVGRectElement>("[data-sc-badge]");
    const pulse = q<SVGCircleElement>("[data-sc-pulse]");
    const chipWhen = q<SVGGElement>("[data-sc-chip='when']");
    const chipWho = q<SVGGElement>("[data-sc-chip='who']");
    const chipMeet = q<SVGGElement>("[data-sc-chip='meet']");

    /* ── Start frame: sentence alone — nothing parsed yet ─────────── */
    gsap.set([...underlines, ...thread, ...guides, ...snap], {
      strokeDashoffset: 1.5,
    });
    gsap.set(gridLabels, { opacity: 0 });
    /* Each chip starts AT its sentence span (the lift-out), invisible */
    gsap.set(chipWhen, { x: 195, y: -78, opacity: 0 });
    gsap.set(chipWho, { x: 90, y: -110, opacity: 0 });
    gsap.set(chipMeet, { x: 368, y: -142, opacity: 0 });
    gsap.set(block, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });
    gsap.set(badge, { opacity: 0 });

    /* ── The run: read → parse → schedule ─────────────────────────── */
    tl.to(underlines, {
      strokeDashoffset: 0,
      duration: 0.35,
      stagger: 0.09,
      ease: "power1.inOut",
    })
      .to(thread, { strokeDashoffset: 0, duration: 0.35 }, 0.45)
      .to(gridLabels, { opacity: 1, duration: 0.3 }, 0.6)
      .to(guides, { strokeDashoffset: 0, duration: 0.25, stagger: 0.02 }, 0.6)
      /* the spans lift out of the sentence and land as chips */
      .to(
        chipWhen,
        { x: 0, y: 0, duration: 0.55, ease: "back.out(1.15)" },
        0.95
      )
      .to(chipWhen, { opacity: 1, duration: 0.3 }, 0.95)
      .to(chipWho, { x: 0, y: 0, duration: 0.55, ease: "back.out(1.15)" }, 1.25)
      .to(chipWho, { opacity: 1, duration: 0.3 }, 1.25)
      /* the parsed event snaps onto tuesday noon */
      .to(snap, { strokeDashoffset: 0, duration: 0.3 }, 1.5)
      .to(block, { opacity: 0.55, duration: 0.25 }, 1.75)
      .to(block, { scale: 1, duration: 0.35, ease: "back.out(1.4)" }, 1.75)
      /* the clay Google Meet chip snaps in last (brief B2) … */
      .to(
        chipMeet,
        { x: 0, y: 0, duration: 0.55, ease: "back.out(1.15)" },
        1.6
      )
      .to(chipMeet, { opacity: 1, duration: 0.3 }, 1.6)
      /* … and its badge lands on the event with the one clay pulse */
      .to(badge, { opacity: 1, duration: 0.2 }, 2.2)
      .fromTo(
        pulse,
        { opacity: 0.55, scale: 0.5, svgOrigin: "336 136" },
        {
          opacity: 0,
          scale: 1.9,
          duration: 0.55,
          ease: "power2.out",
          immediateRender: false,
        },
        2.25
      );
  });

  return (
    <div ref={rootRef} className="scene-fig" data-scene-cadence>
      <svg
        role="img"
        aria-label={PROJECT_SCENE_MANIFEST["taskflow-calendar"].alt}
        viewBox="0 0 512 216"
        className="block h-auto w-full max-w-[512px]"
      >
        {/* the honesty label: this sentence is an example, not user data */}
        <text x={SX} y="16" className="sc-quiet sc-small">
          typed — an illustrative sentence
        </text>

        {/* the sentence, one pinned monospace segment per span —
            xmlSpace preserves the connective spaces (SVG collapses
            leading/trailing whitespace otherwise, and the words fuse) */}
        {SEGMENTS.map((seg) => (
          <text
            key={seg.at}
            x={spanX(seg.at)}
            y={SY}
            textLength={spanW(seg.text.length)}
            lengthAdjust="spacingAndGlyphs"
            xmlSpace="preserve"
            className={seg.span ? undefined : "sc-quiet"}
          >
            {seg.text}
          </text>
        ))}

        {/* the parser's reading — one underline per lifted span; the
            meet span takes the figure's clay voice (its chip is clay) */}
        {SEGMENTS.filter((seg) => seg.span).map((seg) => (
          <path
            key={seg.span}
            data-sc-underline
            className={seg.span === "meet" ? "scene-claytick" : "scene-edge"}
            d={`M ${spanX(seg.at)} ${UY} h ${spanW(seg.text.length)}`}
            pathLength={1}
          />
        ))}

        {/* sentence → chips: the parse thread, named for the real parsers
            (the label seats under the thread's end, as the chips' header) */}
        <path
          data-sc-thread
          className="scene-edge"
          d="M 90 50 C 90 66, 42 70, 22 86"
          pathLength={1}
        />
        <text x={SX} y="99" className="sc-quiet sc-small">
          chrono-node + compromise
        </text>

        {/* the resolved chips (when · invitees · the clay meet link) */}
        <g data-sc-chip="when">
          <rect
            className="scene-slot"
            x={CHIP_X}
            y={CHIP_Y.when}
            width={CHIP_W}
            height={CHIP_H}
            rx="3"
          />
          <text x={CHIP_X + 10} y={CHIP_Y.when + 15}>
            tue · 12:00 — lunch
          </text>
        </g>
        <g data-sc-chip="who">
          <rect
            className="scene-slot"
            x={CHIP_X}
            y={CHIP_Y.who}
            width={CHIP_W}
            height={CHIP_H}
            rx="3"
          />
          <text x={CHIP_X + 10} y={CHIP_Y.who + 15}>
            invite — sam · priya
          </text>
        </g>
        {/* the Meet chip wears the house's approved-mark grammar: the
            small clay gate square + the word in body ink */}
        <g data-sc-chip="meet">
          <rect
            className="scene-slot"
            x={CHIP_X}
            y={CHIP_Y.meet}
            width={CHIP_W}
            height={CHIP_H}
            rx="3"
          />
          <rect
            className="scene-gate"
            x={CHIP_X + 10}
            y={CHIP_Y.meet + 7}
            width="8"
            height="8"
          />
          <text x={CHIP_X + 24} y={CHIP_Y.meet + 15}>
            google meet
          </text>
        </g>

        {/* chips → grid: the event snapping into place */}
        <path
          data-sc-snap
          className="scene-edge"
          d="M 176 119 C 224 119, 252 132, 308 147"
          pathLength={1}
        />

        {/* the week grid (labels wrapped so class opacity survives the
            engine's own opacity tween — the wave-A nesting pattern) */}
        <g data-sc-grid-labels>
          {DAYS.map((day, i) => (
            <text
              key={i}
              x={GRID_X + COL_W * i + COL_W / 2}
              y="97"
              textAnchor="middle"
              className="sc-quiet sc-small"
            >
              {day}
            </text>
          ))}
          <text
            x={GRID_X - 6}
            y="152"
            textAnchor="end"
            className="sc-quiet sc-small"
          >
            12:00
          </text>
        </g>
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={`v${i}`}
            data-sc-gridline
            className="scene-guide"
            d={`M ${GRID_X + COL_W * i} ${GRID_Y} V ${GRID_Y + ROW_H * 3}`}
            pathLength={1}
          />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <path
            key={`h${i}`}
            data-sc-gridline
            className="scene-guide"
            d={`M ${GRID_X} ${GRID_Y + ROW_H * i} H ${GRID_X + COL_W * 7}`}
            pathLength={1}
          />
        ))}

        {/* the filed event — tuesday, noon — with its clay Meet badge */}
        <rect
          data-sc-block
          className="scene-block"
          x={BLOCK.x}
          y={BLOCK.y}
          width={BLOCK.w}
          height={BLOCK.h}
        />
        <rect
          data-sc-badge
          className="scene-gate"
          x="333"
          y="133"
          width="6"
          height="6"
        />
        <circle data-sc-pulse className="scene-pulse" cx="336" cy="136" r="7" />
      </svg>
    </div>
  );
}
