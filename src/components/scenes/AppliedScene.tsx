/**
 * @fileoverview Applied — "the sorting line" (FABLE-VISUAL-BRIEF B1, A1).
 *
 * The project's idea, drawn running: mail lines leave the inbox queue,
 * ride one lane through the classifier's three real gates — rules →
 * e5 similarity → gated SetFit (the clay square: the gate is real,
 * SetFit stays off until its training gates are met) — and sort into
 * the four scenario lanes of the committed 96-message eval set, each
 * lane carrying its REAL count (65 · 17 · 8 · 6, the case file's own
 * protocol mix). No invented numbers anywhere: the lanes are the eval
 * set's published composition, and macro-F1 0.9791 rides the caption.
 *
 * Motion is a one-shot scroll-in run (useSceneRun — no pin): the lane
 * inks, the gates settle, the fan draws, then four mail glyphs stream
 * the line; the LAST one pauses at the SetFit square while the clay
 * ring pulses once — the gate checking — then lands. The server markup
 * is the settled frame (inbox empty, mail sorted into its lanes), so
 * every static world shows the finished, truthful figure.
 */

"use client";

import { useSceneRun } from "@/components/scenes/useSceneRun";
import { PROJECT_SCENE_MANIFEST } from "@/components/scenes/manifest";
import gsap from "gsap";

/** Bucket rail y-centers (SVG user units), top → bottom. */
const RAIL_Y = [44, 100, 156, 212];

/** The eval set's real scenario mix (projectCaseStudies protocol). */
const LANES = [
  { name: "core-positive", count: "65" },
  { name: "edge-noise", count: "17" },
  { name: "historical-miss", count: "8" },
  { name: "core-negative", count: "6" },
];

/** Settled mail-glyph position for lane i. */
const restX = 462;
const restY = (i: number) => RAIL_Y[i] - 12;

/** One mail glyph — three short message lines (the inbox's handwriting). */
function MailGlyph({ lane }: { lane: number }) {
  return (
    <g
      data-sc-mail
      className="scene-mail"
      transform={`translate(${restX}, ${restY(lane)})`}
    >
      <path d="M0 0 h16" />
      <path d="M0 5 h16" />
      <path d="M0 10 h10" />
    </g>
  );
}

export function AppliedScene() {
  const rootRef = useSceneRun<HTMLDivElement>((tl, root) => {
    const q = gsap.utils.selector(root);
    const edges = q<SVGPathElement>("[data-sc-lane], [data-sc-fan]");
    const rails = q<SVGPathElement>("[data-sc-rail]");
    const gates = q<SVGGElement>("[data-sc-gate]");
    const labels = q<SVGTextElement>("[data-sc-bucket]");
    const mails = q<SVGGElement>("[data-sc-mail]");
    const pulse = q<SVGCircleElement>("[data-sc-pulse]");

    /* ── Start frame: undrawn line, unlit gates, mail queued at intake ──
       Glyph rest coordinates are whole SVG units and every glyph tween
       below snaps x/y to whole units: the figure renders 1 unit = 1 CSS
       px at its max width, so strokes land on the pixel grid instead of
       shimmering across it (the "glittery" sub-pixel crawl). Gate labels
       ink-settle by OPACITY ONLY — translating 12px mono text through
       sub-pixel positions re-rasterizes it every frame and reads as
       flicker, and ink-settle is the house fade anyway. */
    gsap.set([...edges, ...rails], { strokeDashoffset: 1.5 });
    gsap.set(gates, { opacity: 0 });
    gsap.set(labels, { opacity: 0 });
    mails.forEach((mail, i) => {
      gsap.set(mail, { x: 26, y: 56 + i * 34 });
    });

    /* ── The run ─────────────────────────────────────────────────── */
    tl.to(q("[data-sc-lane]"), {
      strokeDashoffset: 0,
      duration: 0.5,
      ease: "power1.inOut",
    })
      .to(gates, { opacity: 1, duration: 0.4, stagger: 0.12 }, 0.15)
      .to(
        q("[data-sc-fan]"),
        { strokeDashoffset: 0, duration: 0.35, stagger: 0.07 },
        0.55
      )
      .to(rails, { strokeDashoffset: 0, duration: 0.35, stagger: 0.07 }, 0.7)
      .to(labels, { opacity: 1, duration: 0.4, stagger: 0.07 }, 0.8);

    /* Mail streams the line ONE AT A TIME (0.4s apart — the previous
       0.18s stagger put three glyphs on the lane at once, colliding
       through each other and the gate posts: the "glitchy" read). Each
       glyph rides the fan into its lane as a CURVE — x and y tween as
       two overlapping tweens with different eases, so the path bows like
       the drawn bezier instead of cutting a hard diagonal across it. */
    const SNAP = { snap: { x: 1, y: 1 } } as const;
    const fanInto = (mail: SVGGElement, lane: number, at: number) => {
      tl.to(
        mail,
        { x: 362, duration: 0.3, ease: "power1.out", ...SNAP },
        at
      ).to(
        mail,
        { y: restY(lane), duration: 0.3, ease: "power1.inOut", ...SNAP },
        at
      );
    };
    mails.forEach((mail, i) => {
      const last = i === mails.length - 1;
      const at = 0.95 + i * 0.4;
      const ride = { y: 116, ease: "power1.inOut", ...SNAP };
      if (last) {
        tl.to(mail, { x: 56, ...ride, duration: 0.25 }, at)
          .to(
            mail,
            { x: 254, duration: 0.4, ease: "power1.inOut", ...SNAP },
            at + 0.25
          )
          /* the gate's single clay pulse, while the mail waits */
          .fromTo(
            pulse,
            { opacity: 0.55, scale: 0.5, svgOrigin: "274 128" },
            {
              opacity: 0,
              scale: 1.9,
              duration: 0.55,
              ease: "power2.out",
              immediateRender: false,
            },
            at + 0.62
          )
          .to(
            mail,
            { x: 282, duration: 0.18, ease: "power1.in", ...SNAP },
            at + 0.95
          );
        fanInto(mail, i, at + 1.13);
        tl.to(
          mail,
          { x: restX, duration: 0.3, ease: "power1.out", ...SNAP },
          at + 1.43
        );
      } else {
        tl.to(mail, { x: 56, ...ride, duration: 0.25 }, at).to(
          mail,
          { x: 308, duration: 0.5, ease: "power1.inOut", ...SNAP },
          at + 0.25
        );
        fanInto(mail, i, at + 0.75);
        tl.to(
          mail,
          { x: restX, duration: 0.3, ease: "power1.out", ...SNAP },
          at + 1.05
        );
      }
    });
  });

  return (
    <div ref={rootRef} className="scene-fig" data-scene-applied>
      <svg
        role="img"
        aria-label={PROJECT_SCENE_MANIFEST.jobtracker.alt}
        viewBox="0 0 512 250"
        className="block h-auto w-full max-w-[512px]"
      >
        {/* intake — the inbox column (empty at rest: the mail is sorted) */}
        <text x="12" y="38" className="sc-quiet">
          inbox
        </text>

        {/* the classifier lane */}
        <path
          data-sc-lane
          className="scene-edge"
          d="M 56 128 H 300"
          pathLength={1}
        />

        {/* gate 1 — rules */}
        <g data-sc-gate>
          <path className="scene-post" d="M 118 114 V 142" />
          <text x="118" y="100" textAnchor="middle" className="sc-quiet">
            rules
          </text>
        </g>
        {/* gate 2 — e5 similarity */}
        <g data-sc-gate>
          <path className="scene-post" d="M 196 114 V 142" />
          <text x="196" y="164" textAnchor="middle" className="sc-quiet">
            e5 similarity
          </text>
        </g>
        {/* gate 3 — the gated SetFit square (clay: the human-set gate);
            label anchored a touch left so the top fan clears its tail */}
        <g data-sc-gate>
          <text x="262" y="100" textAnchor="middle" className="sc-clay">
            setfit — gated
          </text>
          <rect className="scene-gate" x="270" y="124" width="8" height="8" />
        </g>
        <circle data-sc-pulse className="scene-pulse" cx="274" cy="128" r="7" />

        {/* the fan into the eval set's four scenario lanes */}
        {RAIL_Y.map((y) => (
          <path
            key={y}
            data-sc-fan
            className="scene-edge"
            d={`M 300 128 C 330 128, 336 ${y}, 362 ${y}`}
            pathLength={1}
          />
        ))}
        {RAIL_Y.map((y) => (
          <path
            key={y}
            data-sc-rail
            className="scene-rail"
            d={`M 362 ${y} H 490`}
            pathLength={1}
          />
        ))}

        {/* lane labels under their rails (the resting mail sits above):
            name quiet, REAL count in full ink */}
        {LANES.map((lane, i) => (
          <text key={lane.name} data-sc-bucket x="362" y={RAIL_Y[i] + 16}>
            <tspan className="sc-quiet">{lane.name} </tspan>
            <tspan>{lane.count}</tspan>
          </text>
        ))}

        {/* the sorted mail, resting in its lanes */}
        {RAIL_Y.map((_, i) => (
          <MailGlyph key={i} lane={i} />
        ))}
      </svg>
    </div>
  );
}
