/**
 * @fileoverview PipelineRun — the AutoML pipeline as a pinned scroll scene.
 *
 * The flagship "moment" (PREMIUM-FLOW ⭐#2): chapter 04's thesis —
 * "the agent drafts the whole pipeline; nothing runs until a human says
 * go" — made LITERAL. As the visitor scrolls through a bounded, PINNED
 * range, an ink RUN TOKEN (a bead — the same ink as the Red Thread)
 * travels DOWN fig 4.0's seven-phase ladder, scrubbed by scroll:
 *   - a thin ink EDGE draws ahead of the token along the ladder's rail
 *     (stroke-dashoffset — the one sanctioned non-transform move, the
 *     Red Thread's own `pathLength=1` / dasharray `1 2` convention);
 *   - each phase label INK-SETTLES secondary → full as the token passes
 *     it (the hero's ink-settle vocabulary, reversible on scroll-back);
 *   - at THE HUMAN GATE (the clay square between evaluate and deploy) the
 *     token HALTS, pulses ONCE in clay (--color-clay-graphic), and HOLDS.
 *
 * HONESTY CONTRACT (load-bearing — do not "fix"): the scene ENDS ON THE
 * HALT. It never resolves `7.0 deploy` (deploy is what happens AFTER a
 * human says go — the scroll is not that decision) and it NEVER touches
 * run 041's approval. Approving stays the visitor's own press act
 * (RegistryRows here + the ch07 gate stamp). The pipeline does everything
 * it can and then WAITS for a person — the halt IS the payoff.
 *
 * Worlds (amendment A7): the pin/scrub lives ONLY in the engine world
 * (`useLenis()` non-null AND no reduced-motion / quiet-toggle). Static
 * worlds render the finished FRAME the animation rests on — the edge
 * drawn to the gate, the token resting (clay) at the gate, phases 1–6
 * lit, `7.0 deploy` still secondary, run 041 still awaiting. No pin, no
 * scrub, no rAF. globals.css repeats the lit/drawn state with `!important`
 * under `prefers-reduced-motion` and `[data-motion-off]`, so the honest
 * resting figure holds with zero engine dependence.
 *
 * The Red Thread rule of the house holds here too: the pin wraps a
 * SEPARATE wrapper from the figure the composed-scene reveal transforms
 * ([data-tm='block']), and the pin-spacer grows chapter 04 INSIDE the
 * region ThreadSegment measures — so the thread re-welds its 04|05 seam
 * on the section ResizeObserver and its spec stays green (the pin adds
 * scroll distance, never a moved landmark).
 *
 * THE DENSE HELD PLATE (blank-paper fix, round 3). Pinning the ladder
 * alone stretched the ch04 grid row by the pin distance: the prose
 * column scrolled away mid-hold and the visitor stared at ~1 viewport
 * of empty paper beside a lone rail. The pin target is now chosen per
 * layout — on two-column (lg) layouts it is the WHOLE flagship grid
 * ([data-pipeline-pin-wide]: thesis copy + fig 4.0 + fig 4.1 held
 * together); on stacked layouts it is the full figure column
 * ([data-pipeline-pin]: ladder + registry). Both fit the viewport at
 * the pinned offset, so the held beat is always a full plate. The
 * chosen element is stamped [data-pipeline-pinned] for the spec. Still
 * exactly ONE pin (A8) — only its wrapper grew.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  readStoredMotionOff,
  useLenis,
} from "@/components/layout/SmoothScroll";
import { announceLayoutSettled } from "@/components/story/arrival";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Progress (0–1) at which the token reaches the gate and HALTS; the
 *  remainder of the pinned range is the HOLD — the pipeline waiting.
 *  Raised 0.82 → 0.88 with PIN_VH cut to 0.95 (CRITIC-LEDGER F77): the
 *  old tail was 18% of 1.05vh ≈ 170px of scroll in which NOTHING moved,
 *  which on a trackpad reads as a hang. What is left is ~100px, and it
 *  is no longer empty — the halt brings its own note up with it. */
const TRAVEL_END = 0.88;

/** The edge draws a hair AHEAD of the token (the ink runs on ahead of
 *  the nib). >1 leads; the drawn fraction is clamped to 1. */
const EDGE_LEAD = 1.06;

/** Rest value of the undrawn edge (the Red Thread's own dashoffset). */
const EDGE_UNDRAWN = 1.5;

/** Pinned scroll distance as a fraction of the viewport (A8: one beat at
 *  ~80–100vh + a short hold). The token travels over TRAVEL_END of it. */
const PIN_VH = 0.95;

/**
 * Travel fractions at which each registry row inks itself in (F03).
 * Row 0 is on the page from the first frame — a register that starts
 * empty reads as broken, not as developing — and the last row (041, the
 * one awaiting its human) lands just before the halt, so the ledger is
 * complete exactly when the token stops and asks for a signature.
 */
const REGISTRY_WRITE_AT = [0, 0.28, 0.52, 0.76];

/** The two-column (lg) layout — Tailwind's lg breakpoint, where the ch04
 *  grid seats the thesis beside the rail and the WIDE pin target holds
 *  the whole plate. Below it the figure column pins instead. */
const WIDE_QUERY = "(min-width: 1024px)";

/** Held-plate seating: the pin parks the plate's top at 22% of the
 *  viewport (the original seat) unless the plate is too tall to fit —
 *  then it slides up as far as the fixed header allows so the plate's
 *  foot stays on screen through the hold. */
const PIN_TOP_FRACTION = 0.22;
const PIN_TOP_MIN = 72; /* fixed header (~56px) + breath */
const PIN_BOTTOM_GAP = 24;

/**
 * Whether the motion world is planned this session — the same synchronous
 * gates SmoothScroll checks before mounting the engine (A7). Read up front
 * so the very first client paint is correct in both worlds.
 *
 * @returns True when the engine is expected to mount
 */
function motionWorldPlanned(): boolean {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !readStoredMotionOff()
  );
}

/** Measured ladder geometry, all in figure-local px. */
interface RunGeometry {
  /** Overlay size (the figure's border box) */
  width: number;
  height: number;
  /** The rail x — the ladder's left border, where the token rides */
  railX: number;
  /** Vertical center of phase 1 (`1.0 ingest`) — the token's home */
  phase0Y: number;
  /** Vertical center of the human gate marker — where the token halts */
  gateY: number;
  /** Each ungated phase span + the travel fraction at which it lights */
  phases: { el: HTMLElement; threshold: number }[];
}

/**
 * Measure the ladder: the rail x, phase-1 center, gate center, and each
 * ungated phase's light threshold — all relative to the figure so the
 * absolutely-positioned overlay shares one coordinate space.
 *
 * @param scope - The figure ([data-pipeline-scope])
 * @returns Geometry, or null when the ladder is not laid out yet
 */
function measure(scope: HTMLElement): RunGeometry | null {
  const ul = scope.querySelector<HTMLElement>("[data-pipeline-track]");
  const gate = scope.querySelector<HTMLElement>("[data-pipeline-gate]");
  const phaseEls = Array.from(
    scope.querySelectorAll<HTMLElement>(
      "[data-pipeline-phase]:not([data-pipeline-gated])"
    )
  );
  if (!ul || !gate || phaseEls.length < 2) return null;

  const fig = scope.getBoundingClientRect();
  if (fig.width < 40 || fig.height < 40) return null;
  const ulBox = ul.getBoundingClientRect();
  /* The rail is the ul's left border (~1px): ride its center */
  const borderLeft =
    parseFloat(getComputedStyle(ul).borderLeftWidth || "1") || 1;
  const railX = ulBox.left - fig.left + borderLeft / 2;

  const centerY = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.top - fig.top + r.height / 2;
  };
  const phase0Y = centerY(phaseEls[0]);
  const gateY = centerY(gate);
  const span = gateY - phase0Y;
  if (span <= 0) return null;

  const phases = phaseEls.map((el) => ({
    el,
    /* Light the phase the instant the token's y passes its center */
    threshold: Math.min(1, Math.max(0, (centerY(el) - phase0Y) / span)),
  }));

  return {
    width: fig.width,
    height: fig.height,
    railX,
    phase0Y,
    gateY,
    phases,
  };
}

/**
 * The pinned pipeline-run overlay. Mount as the last child of the fig 4.0
 * figure ([data-pipeline-scope]); it renders the edge + token SVG and,
 * in the engine world, pins its wrapper ([data-pipeline-pin]) and scrubs
 * the run. Decorative (aria-hidden) — the `<li>` labels carry the meaning.
 *
 * @returns The overlay SVG (absolute, over the ladder)
 */
export function PipelineRun() {
  const svgRef = useRef<SVGSVGElement>(null);
  const edgeRef = useRef<SVGPathElement>(null);
  const tokenRef = useRef<SVGGElement>(null);
  const lenis = useLenis();
  const [geom, setGeom] = useState<RunGeometry | null>(null);
  /* Which pin target the layout calls for (lazy init: the state never
     renders, so reading matchMedia here cannot mismatch hydration). */
  const [wide, setWide] = useState(
    () =>
      typeof window !== "undefined" && window.matchMedia(WIDE_QUERY).matches
  );
  /* Fire the clay pulse exactly once per gate arrival (re-armable) */
  const haltedRef = useRef(false);

  /* ── Track the layout breakpoint (re-targets the pin on a flip) ──── */
  useEffect(() => {
    const query = window.matchMedia(WIDE_QUERY);
    const apply = () => setWide(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  /* ── Measure + re-measure (mount · resize · fonts) ─────────────── */
  useEffect(() => {
    const svg = svgRef.current;
    const scope = svg?.closest<HTMLElement>("[data-pipeline-scope]");
    if (!svg || !scope) return;
    let disposed = false;

    const apply = () => {
      if (disposed) return;
      const next = measure(scope);
      if (!next) return;
      setGeom((prev) =>
        prev &&
        prev.railX === next.railX &&
        prev.phase0Y === next.phase0Y &&
        prev.gateY === next.gateY &&
        prev.height === next.height
          ? prev
          : next
      );
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(scope);
    document.fonts?.ready.then(apply);
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, []);

  /* ── Drive the run (engine) or rest on the finished frame (static) ─ */
  useEffect(() => {
    const svg = svgRef.current;
    const edge = edgeRef.current;
    const token = tokenRef.current;
    if (!svg || !edge || !token || !geom) return;
    const scope = svg.closest<HTMLElement>("[data-pipeline-scope]");
    /* The dense-plate pin target (see the header comment): the whole
       grid on two-column layouts, the figure column when stacked. */
    const pin =
      (wide ? svg.closest<HTMLElement>("[data-pipeline-pin-wide]") : null) ??
      svg.closest<HTMLElement>("[data-pipeline-pin]");
    if (!scope) return;

    /* THE PLATE'S OTHER TWO DEVELOPING PARTS (CRITIC-LEDGER F03). Both
       live outside the ladder figure — the running note in the thesis
       column, the register beside it — so they are found from the
       chapter, and both are optional: a page without them scrubs
       exactly as before. */
    const chapter = scope.closest<HTMLElement>("[data-chapter]") ?? document;
    const notes = Array.from(
      chapter.querySelectorAll<HTMLElement>("[data-pipeline-note]")
    ).map((el) => ({
      el,
      phase: Number(el.getAttribute("data-pipeline-note")),
    }));
    const registryRows = Array.from(
      chapter.querySelectorAll<HTMLElement>("[data-registry-row]")
    );

    const litPhases = (fraction: number) => {
      /* Toggle only on a real change — no redundant per-frame attribute
         writes to dirty style while scrubbing. */
      for (const { el, threshold } of geom.phases) {
        const lit = fraction >= threshold;
        const has = el.hasAttribute("data-pipeline-lit");
        if (lit && !has) el.setAttribute("data-pipeline-lit", "");
        else if (!lit && has) el.removeAttribute("data-pipeline-lit");
      }
    };

    /**
     * The current note: the LAST one whose phase the token has reached.
     * A phase with no note of its own simply holds the previous one —
     * the figure never invents a line to fill a slot (D6). The gated
     * phase's note (phase index === the ladder length) belongs to the
     * halt, which is the only thing that phase ever resolves to.
     */
    const currentNote = (fraction: number, halted: boolean) => {
      let current: HTMLElement | null = null;
      for (const note of notes) {
        const gated = note.phase >= geom.phases.length;
        const reached = gated
          ? halted
          : fraction >= (geom.phases[note.phase]?.threshold ?? 1);
        if (reached) current = note.el;
      }
      for (const note of notes) {
        const isCurrent = note.el === current;
        const has = note.el.hasAttribute("data-current");
        if (isCurrent && !has) note.el.setAttribute("data-current", "");
        else if (!isCurrent && has) note.el.removeAttribute("data-current");
      }
    };

    /** The register writes itself in as the run passes down the ladder. */
    const writeRegistry = (fraction: number) => {
      registryRows.forEach((row, index) => {
        const written = fraction >= (REGISTRY_WRITE_AT[index] ?? 1);
        const has = row.hasAttribute("data-registry-written");
        if (written && !has) row.setAttribute("data-registry-written", "");
        else if (!written && has) row.removeAttribute("data-registry-written");
      });
    };
    const setHalted = (halted: boolean) => {
      if (halted === haltedRef.current) return;
      haltedRef.current = halted;
      token.classList.toggle("is-halted", halted);
    };

    /** Paint the run at scroll fraction p (0–1 over the pinned range). */
    const render = (p: number) => {
      const t = Math.min(1, p / TRAVEL_END); /* travel fraction */
      const y = geom.phase0Y + (geom.gateY - geom.phase0Y) * t;
      gsap.set(token, { y: y - geom.phase0Y });
      const drawn = Math.min(1, t * EDGE_LEAD);
      edge.style.strokeDashoffset = String(EDGE_UNDRAWN * (1 - drawn));
      litPhases(t);
      const halted = p >= TRAVEL_END;
      setHalted(halted);
      /* The hold's payoff (F03): the register builds and the note turns
         as the run descends — opacity only, both reversible on
         scroll-back exactly like the phase lights. */
      writeRegistry(t);
      currentNote(t, halted);
    };

    /* Static worlds (A7): render the resting FINAL frame — the run
       reached the gate and waits. No pin, no ScrollTrigger, no rAF. */
    if (!lenis) {
      if (!motionWorldPlanned()) render(1);
      return; /* engine still mounting → this effect re-runs with lenis */
    }

    const pinEl = pin ?? scope;
    const ctx = gsap.context(() => {
      render(0);
      ScrollTrigger.create({
        trigger: pinEl,
        /* Seat the plate at 22% — or as high as the header allows when
           the plate would not otherwise fit above the fold (function
           start: re-measured on every refresh, pins reverted). */
        start: () => {
          const vh = window.innerHeight;
          const top = Math.min(
            Math.round(vh * PIN_TOP_FRACTION),
            Math.max(PIN_TOP_MIN, vh - pinEl.offsetHeight - PIN_BOTTOM_GAP)
          );
          return `top ${top}px`;
        },
        end: () => `+=${Math.round(window.innerHeight * PIN_VH)}`,
        pin: pinEl,
        pinType: "fixed",
        pinSpacing: true,
        anticipatePin: 1,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress),
        onRefreshInit: () => render(0),
      });
    }, svg);
    svg.setAttribute("data-pipeline-scrub", "");
    /* Which element the pin actually holds — the spec's measuring hook */
    pinEl.setAttribute("data-pipeline-pinned", "");

    /* THE PIN-SPACER RE-MEASURE (day-arc early-flip fix). This pin is
       created LAST — after the geometry state round-trip — so every
       trigger created at engine-mount (DayArc's segments and its dusk
       choreography on #values, ThreadSegment scrubs …) measured its
       start/end on the layout WITHOUT the ~1-viewport pin-spacer this
       create() just inserted above them. Left stale, #values sat a full
       spacer below its recorded trigger and `data-arc-phase="dusk"`
       fired one chapter early. sort() puts the refresh order back in
       document order (this trigger was created out of order), and
       refresh() re-measures everything with pins accounted for. One
       synchronous re-measure at hydration — never during scroll. */
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    /* That re-measure moves the page under any hash landing by the
       spacer distance — let the landing contract re-assert itself
       (CRITIC-LEDGER F09's mechanism; see story/arrival.ts). */
    announceLayoutSettled();

    return () => {
      svg.removeAttribute("data-pipeline-scrub");
      pinEl.removeAttribute("data-pipeline-pinned");
      haltedRef.current = false;
      /* Hand the plate back untouched: the quiet toggle must restore the
         complete register and the resting note, not a half-written one. */
      for (const row of registryRows) {
        row.removeAttribute("data-registry-written");
      }
      for (const note of notes) note.el.removeAttribute("data-current");
      ctx.revert();
    };
  }, [lenis, geom, wide]);

  const railX = geom?.railX ?? 0;
  const phase0Y = geom?.phase0Y ?? 0;
  const gateY = geom?.gateY ?? 0;
  /* First paint: draw the resting frame in the static world, undrawn in
     the motion world (the scrub takes it from there — no flash). */
  const staticRest = typeof window !== "undefined" && !motionWorldPlanned();

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      data-pipeline-overlay
      className="pipeline-overlay pointer-events-none absolute inset-0 overflow-visible"
      width={geom?.width ?? 0}
      height={geom?.height ?? 0}
      viewBox={geom ? `0 0 ${geom.width} ${geom.height}` : undefined}
      fill="none"
    >
      {geom ? (
        <>
          <path
            ref={edgeRef}
            className="pipeline-edge"
            d={`M ${railX} ${phase0Y} L ${railX} ${gateY}`}
            pathLength={1}
            style={{ strokeDashoffset: staticRest ? 0 : EDGE_UNDRAWN }}
          />
          <g
            ref={tokenRef}
            className={`pipeline-token ${staticRest ? "is-halted" : ""}`}
            style={{
              transform: staticRest
                ? `translateY(${gateY - phase0Y}px)`
                : undefined,
            }}
          >
            <circle
              className="pipeline-token-ring"
              cx={railX}
              cy={phase0Y}
              r={6}
            />
            <circle
              className="pipeline-token-bead"
              cx={railX}
              cy={phase0Y}
              r={3.4}
            />
          </g>
        </>
      ) : null}
    </svg>
  );
}
