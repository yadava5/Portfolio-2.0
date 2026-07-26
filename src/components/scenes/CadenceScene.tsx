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
 * TWO AUTHORED EDITIONS (CRITIC-LEDGER F66, phone half): the wide
 * 512-unit plate (sentence on one line, chips left / grid right) and a
 * narrow 280-unit edition for columns under 380px. Wave 2 measured the
 * mechanical alternative dead — enlarging this plate's authored sizes
 * collides in 13 places — so the narrow edition is a REDRAW: the same
 * sentence wraps to three lines on its natural phrase seams, and the
 * page reads downward — sentence → chips → week grid — the way a phone
 * column actually flows. Every span, chip, grid mark and label
 * survives at the full 13px voice; the honesty label stays the first
 * line of the plate. Same words, same parse, same clay finale.
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
/** Sentence origin + underline baseline — wide plate. */
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

/** Chip stack (left column) — rest geometry.
 *
 *  N13 (fix round 3): 176 was still not wide enough, and the shipped
 *  frame proved it — "invite — sam · priya" set from x=22 and ENDED at
 *  x≈188, which is exactly where the chip's right border is drawn, so
 *  the rule ran down through the final `a` of the invitee's name. The
 *  estimate in the old note was the error: chip labels are not
 *  `textLength`-pinned like the sentence, so they set at the font's own
 *  ~8.3 units/char, not the 7.5 the sentence is typeset on. Measured
 *  against the render rather than re-estimated: 20 chars ≈ 166 units,
 *  and the box now carries the same 10 units of padding on the right
 *  that it always had on the left (22 + 166 + 10 = 198 ≤ 208).
 *  Geometry only — same words, same chips, same choreography. */
const CHIP_X = 12;
const CHIP_W = 196;
const CHIP_H = 22;
const CHIP_Y = { when: 108, who: 140, meet: 172 };

/** Week grid (right column): 7 day columns × 3 row bands. */
const GRID_X = 280;
const COL_W = 30;
const GRID_Y = 104;
const ROW_H = 30;
/** N16 (fix round 3): the week header read `m t w t f s s` — two `t`s
 *  and two `s`s, so the column the parsed event lands in (tuesday) was
 *  indistinguishable from thursday at a glance, in a figure whose entire
 *  claim is "the sentence resolved to THIS day". Two-letter forms for
 *  the four ambiguous days; the 30-unit columns carry them centred with
 *  room to spare, and no other geometry moves. */
const DAYS = ["m", "t", "w", "th", "f", "sa", "su"];

/** The parsed event: tuesday × the noon row. */
const BLOCK = { x: 312, y: 138, w: 26, h: 22 };

/* ── Narrow edition geometry (280-unit canvas, top-to-bottom flow) ─── */
/** Sentence origin + the three line baselines (natural phrase seams). */
const SX_M = 10;
const LINE_Y_M = [44, 66, 88];
/** The SAME sentence, re-set on three lines: (line, col) per segment.
 *  The wide plate's bare connective spaces become the line breaks. */
const SEGMENTS_M: { text: string; line: number; col: number; span?: string }[] =
  [
    { text: "“", line: 0, col: 0 },
    { text: "lunch", line: 0, col: 1, span: "title" },
    { text: " with ", line: 0, col: 6 },
    { text: "sam", line: 0, col: 12, span: "who" },
    { text: " and ", line: 0, col: 15 },
    { text: "priya", line: 0, col: 20, span: "who2" },
    { text: "next tuesday at noon", line: 1, col: 0, span: "when" },
    { text: "— ", line: 2, col: 0 },
    { text: "add a meet", line: 2, col: 2, span: "meet" },
    { text: "”", line: 2, col: 12 },
  ];
const spanXM = (col: number) => SX_M + col * CW;

/** Chip stack — narrow edition (4 wider units so the 13px voice keeps
 *  its breathing room inside the box). */
const CHIP_X_M = 10;
const CHIP_W_M = 184;
const CHIP_Y_M = { when: 152, who: 184, meet: 216 };

/** Week grid — narrow edition, BELOW the chips. */
const GRID_X_M = 58;
const GRID_Y_M = 268;

/** The parsed event + its clay Meet badge — narrow edition. */
const BLOCK_M = { x: 90, y: 301, w: 26, h: 22 };
const BADGE_M = { x: 111, y: 296 };

export function CadenceScene() {
  const rootRef = useSceneRun<HTMLDivElement>((tl, root) => {
    /* Choreograph the edition the container query shows. */
    const plates = Array.from(
      root.querySelectorAll<SVGSVGElement>("[data-sc-plate]")
    );
    const plate =
      plates.find((p) => p.getBoundingClientRect().width > 0) ?? plates[0];
    const narrow = plate.dataset.scPlate === "narrow";
    const q = gsap.utils.selector(plate);
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
    /* Each chip starts AT its sentence span (the lift-out), invisible.
       The narrow offsets aim at the same spans on their wrapped lines. */
    if (narrow) {
      gsap.set(chipWhen, { x: 0, y: -101, opacity: 0 });
      gsap.set(chipWho, { x: 90, y: -155, opacity: 0 });
      gsap.set(chipMeet, { x: 15, y: -143, opacity: 0 });
    } else {
      gsap.set(chipWhen, { x: 195, y: -78, opacity: 0 });
      gsap.set(chipWho, { x: 90, y: -110, opacity: 0 });
      gsap.set(chipMeet, { x: 368, y: -142, opacity: 0 });
    }
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
      .to(chipMeet, { x: 0, y: 0, duration: 0.55, ease: "back.out(1.15)" }, 1.6)
      .to(chipMeet, { opacity: 1, duration: 0.3 }, 1.6)
      /* … and its badge lands on the event with the one clay pulse */
      .to(badge, { opacity: 1, duration: 0.2 }, 2.2)
      .fromTo(
        pulse,
        {
          opacity: 0.55,
          scale: 0.5,
          svgOrigin: narrow ? "114 299" : "336 136",
        },
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
        data-sc-plate="wide"
        className="scene-plate-wide block h-auto w-full max-w-[512px]"
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
            (the label seats under the thread's end, as the chips' header).
            The tail stops at y 82 — ~9px of air above the label's cap
            height (91.5) so the ink never grazes the text at any scale. */}
        <path
          data-sc-thread
          className="scene-edge"
          d="M 90 50 C 90 64, 44 66, 21 82"
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

        {/* chips → grid: the event snapping into place. Terminates at the
            EDGES with air on both ends: departs 8px right of the when-
            chip's border (208 → 216 since N13 widened the chips) at its
            vertical center, arcs clear above the "12:00" hour label
            (top ≈ 144), and lands 7px short of the event block's left
            edge (312) at block center — the connector points between the
            boxes, never through them. */}
        <path
          data-sc-snap
          className="scene-edge"
          d="M 216 119 C 250 119, 272 129, 305 147"
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

      {/* ── the narrow edition: the same parse, reading downward ──
          The sentence wraps on its phrase seams (three lines), the
          chips rest beneath it, and the week grid takes the foot of
          the plate — sentence → chips → schedule, the phone column's
          own reading order. Same spans, same chips, same clay Meet
          finale; the only voice is the 13px label token. */}
      <svg
        role="img"
        aria-label={PROJECT_SCENE_MANIFEST["taskflow-calendar"].alt}
        viewBox="0 0 280 372"
        data-sc-plate="narrow"
        className="scene-plate-narrow h-auto w-full max-w-[280px]"
      >
        {/* the honesty label — pinned so the full clause holds the
            280-unit measure (273.5 natural → 264, a 3% squeeze) */}
        <text
          x="8"
          y="16"
          textLength="264"
          lengthAdjust="spacingAndGlyphs"
          className="sc-quiet"
        >
          typed — an illustrative sentence
        </text>

        {/* the sentence, wrapped on its natural phrase seams */}
        {SEGMENTS_M.map((seg) => (
          <text
            key={`${seg.line}-${seg.col}`}
            x={spanXM(seg.col)}
            y={LINE_Y_M[seg.line]}
            textLength={spanW(seg.text.length)}
            lengthAdjust="spacingAndGlyphs"
            xmlSpace="preserve"
            className={seg.span ? undefined : "sc-quiet"}
          >
            {seg.text}
          </text>
        ))}
        {SEGMENTS_M.filter((seg) => seg.span).map((seg) => (
          <path
            key={seg.span}
            data-sc-underline
            className={seg.span === "meet" ? "scene-claytick" : "scene-edge"}
            d={`M ${spanXM(seg.col)} ${LINE_Y_M[seg.line] + 7} h ${spanW(
              seg.text.length
            )}`}
            pathLength={1}
          />
        ))}

        {/* sentence → chips: the parse thread + the parsers' names */}
        <path
          data-sc-thread
          className="scene-edge"
          d="M 40 100 C 34 110, 22 114, 14 124"
          pathLength={1}
        />
        <text x={SX_M} y="138" className="sc-quiet">
          chrono-node + compromise
        </text>

        {/* the resolved chips (when · invitees · the clay meet link) */}
        <g data-sc-chip="when">
          <rect
            className="scene-slot"
            x={CHIP_X_M}
            y={CHIP_Y_M.when}
            width={CHIP_W_M}
            height={CHIP_H}
            rx="3"
          />
          <text x={CHIP_X_M + 10} y={CHIP_Y_M.when + 15}>
            tue · 12:00 — lunch
          </text>
        </g>
        <g data-sc-chip="who">
          <rect
            className="scene-slot"
            x={CHIP_X_M}
            y={CHIP_Y_M.who}
            width={CHIP_W_M}
            height={CHIP_H}
            rx="3"
          />
          <text x={CHIP_X_M + 10} y={CHIP_Y_M.who + 15}>
            invite — sam · priya
          </text>
        </g>
        <g data-sc-chip="meet">
          <rect
            className="scene-slot"
            x={CHIP_X_M}
            y={CHIP_Y_M.meet}
            width={CHIP_W_M}
            height={CHIP_H}
            rx="3"
          />
          <rect
            className="scene-gate"
            x={CHIP_X_M + 10}
            y={CHIP_Y_M.meet + 7}
            width="8"
            height="8"
          />
          <text x={CHIP_X_M + 24} y={CHIP_Y_M.meet + 15}>
            google meet
          </text>
        </g>

        {/* chips → grid: departs the when-chip's right border with air
            (194 → 198), arcs through the open right column, and lands
            just clear of the event block's top-right corner — between
            the boxes, never through them. */}
        <path
          data-sc-snap
          className="scene-edge"
          d="M 198 163 C 246 178, 246 260, 122 297"
          pathLength={1}
        />

        {/* the week grid, at the foot of the plate */}
        <g data-sc-grid-labels>
          {DAYS.map((day, i) => (
            <text
              key={i}
              x={GRID_X_M + COL_W * i + COL_W / 2}
              y="261"
              textAnchor="middle"
              className="sc-quiet"
            >
              {day}
            </text>
          ))}
          <text x="52" y="317" textAnchor="end" className="sc-quiet">
            12:00
          </text>
        </g>
        {Array.from({ length: 8 }, (_, i) => (
          <path
            key={`v${i}`}
            data-sc-gridline
            className="scene-guide"
            d={`M ${GRID_X_M + COL_W * i} ${GRID_Y_M} V ${GRID_Y_M + ROW_H * 3}`}
            pathLength={1}
          />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <path
            key={`h${i}`}
            data-sc-gridline
            className="scene-guide"
            d={`M ${GRID_X_M} ${GRID_Y_M + ROW_H * i} H ${
              GRID_X_M + COL_W * 7
            }`}
            pathLength={1}
          />
        ))}

        {/* the filed event — tuesday, noon — with its clay Meet badge */}
        <rect
          data-sc-block
          className="scene-block"
          x={BLOCK_M.x}
          y={BLOCK_M.y}
          width={BLOCK_M.w}
          height={BLOCK_M.h}
        />
        <rect
          data-sc-badge
          className="scene-gate"
          x={BADGE_M.x}
          y={BADGE_M.y}
          width="6"
          height="6"
        />
        <circle data-sc-pulse className="scene-pulse" cx="114" cy="299" r="7" />
      </svg>
    </div>
  );
}
