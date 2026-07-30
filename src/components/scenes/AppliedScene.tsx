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
 * THREE AUTHORED EDITIONS (CRITIC-LEDGER F66, phone half + the 11px
 * floor round): the wide plate (512 units, the original), a narrow
 * edition (280 units) for columns under 434px — where the wide
 * plate's scale would push its 13px voice below the site's 11px
 * floor (13 × 434/512 = 11.02px is the wide canvas's own floor
 * seat) — and a tight edition (240 units) for columns under 256px,
 * because the case plate hands this figure 211.8px at a 320 viewport
 * and the narrow canvas drops under the floor below a 236.9px seat.
 * The narrow edition is a REDRAW, not a shrink: the classifier lane
 * runs VERTICALLY (mail falls through the gates), then fans into the
 * same four counted lanes stacked full-width — every gate, label and
 * count survives, so the caption's claims hold in every edition. The
 * tight edition is the same upright drawing with the lane rails
 * pulled in (48 → 232 of 240; the longest label ink,
 * `historical-miss 8`, ends at 184.3) and the resting mail at
 * x 206 — the same 10-unit air short of the rail's end the narrow
 * edition keeps (244 + 16 vs 270). Every vertical pitch is the
 * shipped narrow edition's own, so the F37 census carries over:
 * measured ink boxes (13px = 8.551 units/char, ascent 12.86, descent
 * 3.86), gate labels 27.28 apart, count rows 13.28 apart, each label
 * 3.14 under its rail, resting mail ~ its count label disjoint in x
 * (206 vs ink ending 184.3). Zero collisions. 240 units hold the
 * 13px voice ≥ 11px down to a 203.1px seat — 8px under the narrowest
 * measured seat. CSS (globals.css, the scene-plate container query)
 * picks the edition per seat; the run choreographs whichever plate
 * is actually visible.
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

/** Bucket rail y-centers (SVG user units), top → bottom — wide plate. */
const RAIL_Y = [44, 100, 156, 212];

/** The eval set's real scenario mix (projectCaseStudies protocol). */
const LANES = [
  { name: "core-positive", count: "65" },
  { name: "edge-noise", count: "17" },
  { name: "historical-miss", count: "8" },
  { name: "core-negative", count: "6" },
];

/** Settled mail-glyph position for lane i — wide plate. */
const restX = 462;
const restY = (i: number) => RAIL_Y[i] - 12;

/* ── Upright edition geometry (narrow 280 / tight 240, vertical
   intake). One set of coordinates serves both canvases; only the
   frame, the rail ends and the mail rest differ (UPRIGHT_FRAME). ── */
/** Bucket rail y-centers, upright editions. */
const RAIL_Y_M = [216, 246, 276, 306];
/** The vertical classifier lane's x + the gates' y-centers. */
const LANE_X_M = 24;
const GATE_Y_M = { rules: 78, e5: 122, setfit: 166 };
/** Settled mail-glyph y for lane i, upright editions. */
const restYM = (i: number) => RAIL_Y_M[i] - 12;

/** The upright frames: viewBox + seat classes + the two x values that
 *  scale with the canvas — the lane rails' end and the resting mail
 *  (both keep the narrow edition's proportions: rail 10 units short of
 *  the right margin, mail 10 units of air short of the rail's end). */
const UPRIGHT_FRAME = {
  narrow: {
    viewBox: "0 0 280 336",
    className: "scene-plate-narrow h-auto w-full max-w-[280px]",
    railEnd: 270,
    restX: 244,
  },
  tight: {
    viewBox: "0 0 240 336",
    className: "scene-plate-tight h-auto w-full max-w-[240px]",
    railEnd: 232,
    restX: 206,
  },
} as const;
type UprightEdition = keyof typeof UPRIGHT_FRAME;

/** One mail glyph — three short message lines (the inbox's handwriting). */
function MailGlyph({ x, y }: { x: number; y: number }) {
  return (
    <g data-sc-mail className="scene-mail" transform={`translate(${x}, ${y})`}>
      <path d="M0 0 h16" />
      <path d="M0 5 h16" />
      <path d="M0 10 h10" />
    </g>
  );
}

export function AppliedScene() {
  const rootRef = useSceneRun<HTMLDivElement>((tl, root) => {
    /* Choreograph the plate the CSS container query actually shows —
       the hidden edition keeps standing as its own settled frame. */
    const plates = Array.from(
      root.querySelectorAll<SVGSVGElement>("[data-sc-plate]")
    );
    const plate =
      plates.find((p) => p.getBoundingClientRect().width > 0) ?? plates[0];
    /* Both upright editions run the same vertical score; the one value
       that scales with the canvas is the mail's resting x. */
    const scPlate = plate.dataset.scPlate;
    const narrow = scPlate !== "wide";
    const restXM =
      UPRIGHT_FRAME[scPlate === "tight" ? "tight" : "narrow"].restX;
    const q = gsap.utils.selector(plate);
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
      /* Wide: queued down the inbox column. Narrow: queued across the
         top, under the inbox head — the lane is vertical there. */
      if (narrow) gsap.set(mail, { x: 40 + i * 26, y: 26 });
      else gsap.set(mail, { x: 26, y: 56 + i * 34 });
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
       glyph rides the fan into its lane as a CURVE — the two travel
       axes tween as overlapping tweens with different eases, so the
       path bows like the drawn bezier instead of cutting a hard
       diagonal across it. The narrow edition runs the same score with
       the axes swapped: mail FALLS the vertical lane, then rides its
       rail out to rest. */
    const SNAP = { snap: { x: 1, y: 1 } } as const;
    if (narrow) {
      const fanInto = (mail: SVGGElement, lane: number, at: number) => {
        tl.to(
          mail,
          { y: restYM(lane), duration: 0.3, ease: "power1.inOut", ...SNAP },
          at
        ).to(mail, { x: 48, duration: 0.3, ease: "power1.out", ...SNAP }, at);
      };
      mails.forEach((mail, i) => {
        const last = i === mails.length - 1;
        const at = 0.95 + i * 0.4;
        const ride = { x: LANE_X_M - 8, ease: "power1.inOut", ...SNAP };
        if (last) {
          tl.to(mail, { y: 44, ...ride, duration: 0.25 }, at)
            .to(
              mail,
              { y: 146, duration: 0.4, ease: "power1.inOut", ...SNAP },
              at + 0.25
            )
            /* the gate's single clay pulse, while the mail waits */
            .fromTo(
              pulse,
              {
                opacity: 0.55,
                scale: 0.5,
                svgOrigin: `${LANE_X_M} ${GATE_Y_M.setfit}`,
              },
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
              { y: 178, duration: 0.18, ease: "power1.in", ...SNAP },
              at + 0.95
            );
          fanInto(mail, i, at + 1.13);
          tl.to(
            mail,
            { x: restXM, duration: 0.3, ease: "power1.out", ...SNAP },
            at + 1.43
          );
        } else {
          tl.to(mail, { y: 44, ...ride, duration: 0.25 }, at).to(
            mail,
            { y: 182, duration: 0.5, ease: "power1.inOut", ...SNAP },
            at + 0.25
          );
          fanInto(mail, i, at + 0.75);
          tl.to(
            mail,
            { x: restXM, duration: 0.3, ease: "power1.out", ...SNAP },
            at + 1.05
          );
        }
      });
      return;
    }
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
        data-sc-plate="wide"
        className="scene-plate-wide block h-auto w-full max-w-[512px]"
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
          <MailGlyph key={i} x={restX} y={restY(i)} />
        ))}
      </svg>

      {/* ── the upright editions: the same sorting line, recomposed ──
          The intake lane drops VERTICALLY through the three gates
          (labels seated to the right at full 13px), then fans into
          the four counted lanes stacked full-width. Same gates, same
          counts, same clay — authored small plates, not shrinks. */}
      <UprightPlate edition="narrow" />
      <UprightPlate edition="tight" />
    </div>
  );
}

/** One upright plate — the narrow and tight editions draw the same
 *  vertical sorting line; only the canvas, the rail ends and the mail
 *  rest differ (UPRIGHT_FRAME). The markup IS the settled frame in
 *  both (inbox empty, mail sorted into its counted lanes). */
function UprightPlate({ edition }: { edition: UprightEdition }) {
  const frame = UPRIGHT_FRAME[edition];
  return (
    <svg
      role="img"
      aria-label={PROJECT_SCENE_MANIFEST.jobtracker.alt}
      viewBox={frame.viewBox}
      data-sc-plate={edition}
      className={frame.className}
    >
      <text x="10" y="18" className="sc-quiet">
        inbox
      </text>

      {/* the classifier lane, falling */}
      <path
        data-sc-lane
        className="scene-edge"
        d={`M ${LANE_X_M} 38 V 190`}
        pathLength={1}
      />

      {/* gate 1 — rules */}
      <g data-sc-gate>
        <path className="scene-post" d={`M 10 ${GATE_Y_M.rules} H 38`} />
        <text x="48" y={GATE_Y_M.rules + 4} className="sc-quiet">
          rules
        </text>
      </g>
      {/* gate 2 — e5 similarity */}
      <g data-sc-gate>
        <path className="scene-post" d={`M 10 ${GATE_Y_M.e5} H 38`} />
        <text x="48" y={GATE_Y_M.e5 + 4} className="sc-quiet">
          e5 similarity
        </text>
      </g>
      {/* gate 3 — the gated SetFit square */}
      <g data-sc-gate>
        <text x="48" y={GATE_Y_M.setfit + 4} className="sc-clay">
          setfit — gated
        </text>
        <rect
          className="scene-gate"
          x={LANE_X_M - 4}
          y={GATE_Y_M.setfit - 4}
          width="8"
          height="8"
        />
      </g>
      <circle
        data-sc-pulse
        className="scene-pulse"
        cx={LANE_X_M}
        cy={GATE_Y_M.setfit}
        r="7"
      />

      {/* the fan into the four scenario lanes */}
      {RAIL_Y_M.map((y) => (
        <path
          key={y}
          data-sc-fan
          className="scene-edge"
          d={`M ${LANE_X_M} 190 C ${LANE_X_M} ${Math.round(
            190 + (y - 190) * 0.45
          )}, 30 ${y}, 48 ${y}`}
          pathLength={1}
        />
      ))}
      {RAIL_Y_M.map((y) => (
        <path
          key={y}
          data-sc-rail
          className="scene-rail"
          d={`M 48 ${y} H ${frame.railEnd}`}
          pathLength={1}
        />
      ))}

      {/* lane labels under their rails — name quiet, REAL count ink */}
      {LANES.map((lane, i) => (
        <text key={lane.name} data-sc-bucket x="48" y={RAIL_Y_M[i] + 16}>
          <tspan className="sc-quiet">{lane.name} </tspan>
          <tspan>{lane.count}</tspan>
        </text>
      ))}

      {/* the sorted mail, resting in its lanes */}
      {RAIL_Y_M.map((_, i) => (
        <MailGlyph key={i} x={frame.restX} y={restYM(i)} />
      ))}
    </svg>
  );
}
