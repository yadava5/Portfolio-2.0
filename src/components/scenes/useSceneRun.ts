/**
 * @fileoverview useSceneRun — the living scenes' scroll-coupled run engine.
 *
 * The world model is TextMotion's, not PipelineRun's: the SERVER MARKUP
 * IS THE SETTLED FRAME (the "print edition" — an honest, finished
 * editorial figure), and motion exists only in the engine world. In the
 * engine world the hook builds a GSAP timeline wired to ONE SCRUBBED
 * ScrollTrigger on the scene root (A1 vocabulary, NO pin — amendment
 * A8 keeps the only pin on PipelineRun): the build callback first
 * gsap.set()s the figure back to its start frame, then tweens it
 * forward to the settled values the markup already holds.
 *
 * ROUND 11 — one-shot → scrubbed. `once: true` used to play the run a
 * single time and freeze it; the owner's verdict ("moving with the
 * viewer and flowing back as well if we go back … the diagram
 * animations are just running once") is the round-6 prototype's model,
 * where a station's state is a pure function of scroll. The run now
 * scrubs across a bounded window in the viewport's lower half — the
 * figure assembles as the reader carries it up the page, is COMPLETE
 * before it crosses the reading line (SCENE_END — the round-5
 * contract: stations assemble and HOLD, the settled middle stays
 * settled), and runs exactly backwards on the way down. Every
 * registered scene reverses on purpose: all five NARRATE mechanisms
 * (sorting, racing, splitting, parsing, running-to-the-gate), and
 * rewinding a mechanism is just the mechanism read backwards — none of
 * them "concludes" anything a rewind would falsify. The one figure
 * whose end state is a CLAIM (the AutoML halt at the human gate)
 * rewinds honestly too: un-running a run is not deploying it.
 *
 * The idle contract survives the conversion (NO-LIST §F3 as
 * corrected): a scrubbed trigger computes on scroll and is dormant
 * while the page is still — measured 0 idle style writes and an
 * unchanged ~734 rAF/3s keep-alive floor before and after
 * (docs/design-lab/probe-idle-raf11.mjs).
 *
 * Triple gate (amendment A7/D5), inherited rather than re-implemented:
 * `useLenis()` is null under prefers-reduced-motion AND the quiet
 * data-motion-off toggle AND before the engine mounts — so in every
 * static world the effect never runs, no start frame is ever applied,
 * and the settled markup simply stands. Flipping the toggle mid-session
 * reverts the context (ctx.revert() restores the settled inline state)
 * — the static world is always the finished figure, never a frozen lie.
 *
 * THREE WORLDS THE WINDOW TREATS SPECIALLY (all A7-derived, all
 * measured in earlier rounds):
 *   - IN VIEW AT BUILD (a case-file hero, a deep-scroll reload, a
 *     mid-page remount): the reader has ARRIVED at this figure — there
 *     may be no scroll coming, and a scrub window keyed below their
 *     position could hold a start frame forever (the F01 stranding,
 *     measured: the glyph plate at 2px visible on a 1200px `/#work`
 *     landing). An arrived-at scene plays the authored run ONCE,
 *     directly, with no trigger — the case-file hero is a performance
 *     for a reader who came to see exactly this, and it then holds
 *     (the one deliberate one-shot left in the scene engine).
 *   - A LANDING (ARRIVAL_EVENT — nav, `/#hash`, Back/Forward): the
 *     same grant mid-session. A scrubbed figure can no longer strand
 *     (position computes a correct frame), but a landing can park one
 *     mid-viewport at partial ink with no scroll owed; a figure the
 *     reader asked to be at completes its run and holds, trading that
 *     one window's reversibility for a finished plate — TextMotion's
 *     landing rule, applied to figures.
 *   - THE PAPER EDITION (@media print): printed straight from the
 *     motion world's inline styles, and paper has no scroll coming, so
 *     on `beforeprint` — which headless Chromium's printToPDF path
 *     fires synchronously BEFORE the print snapshot — and on the
 *     `matchMedia("print")` flip that covers emulated print media, the
 *     run COMPLETES: progress(1) renders the timeline's own end state,
 *     which is the settled markup by construction, and the trigger
 *     dies with it. The settle is permanent — after the paper edition
 *     has shown the finished figure, rewinding it on screen would be
 *     the visible → hidden → re-entering flash F76 bans.
 *
 * Property discipline (D3): build callbacks may animate transform /
 * opacity / clip-path and the sanctioned stroke-dashoffset ONLY.
 */

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/components/layout/SmoothScroll";
import { ARRIVAL_EVENT } from "@/components/story/arrival";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Scene window start — a hair before the reading eye arrives (the
 *  composed-scene convention, clamped inside the reachable span). */
const SCENE_START = "clamp(top 85%)";

/** Scene window end — the figures carry a longer narrative than a text
 *  entrance (a sorting line, a race), so their window runs deeper than
 *  TextMotion's SCRUB_SPAN: assembly spans the viewport's lower half
 *  and is done before the figure's top crosses the 35% line, above
 *  which the settled plate simply holds (round 5). */
const SCENE_END = "clamp(top 35%)";

/** Scrub smoothing — TM_SCRUB/THREAD_SCRUB's own 0.7, so every
 *  scrubbed surface on the paper shares one lag. */
const SCENE_SCRUB = 0.7;

/**
 * Wire a scene's scroll-coupled run to its root element.
 *
 * @param build - Receives the timeline (wired to its scrubbed window)
 *   and the scene root. Must (1) gsap.set() start states, then (2) add
 *   the forward tweens whose end values equal the markup's natural
 *   state.
 * @returns Ref to attach to the scene's root element
 */
export function useSceneRun<T extends HTMLElement>(
  build: (tl: gsap.core.Timeline, root: T) => void
) {
  const rootRef = useRef<T>(null);
  const buildRef = useRef(build);
  const lenis = useLenis();

  /* Latest-callback pattern: keep the ref fresh without re-wiring the
     trigger (the run effect depends on the engine only). */
  useEffect(() => {
    buildRef.current = build;
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !lenis) return;

    /* In view at build → the arrived-at performance (see the header):
       play the authored run once, no trigger, and hold. */
    const immediate =
      root.getBoundingClientRect().top <= window.innerHeight * 0.85;
    let tl: gsap.core.Timeline | null = null;
    const ctx = gsap.context(() => {
      tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        ...(immediate
          ? {}
          : {
              scrollTrigger: {
                trigger: root,
                start: SCENE_START,
                end: SCENE_END,
                scrub: SCENE_SCRUB,
              },
            }),
      });
      buildRef.current(tl, root);
    }, root);

    /* Landing settle (see the header): a figure the landing parked
       above the fold completes its authored run and holds. Figures
       still below the fold keep their window, both directions. */
    const onArrival = () => {
      if (!tl?.scrollTrigger || tl.progress() === 1) return;
      if (root.getBoundingClientRect().top >= window.innerHeight) return;
      tl.scrollTrigger.kill(false, true);
      tl.play();
    };
    window.addEventListener(ARRIVAL_EVENT, onArrival);

    /* Paper-edition settle (see the header): the print worlds fire one
       of these two cues, and the run completes SYNCHRONOUSLY — the
       snapshot is taken in the same task, so a tweened play would print
       its first frame. progress(1) is the animation's own end state,
       i.e. each element's authored settled value (scene-pulse rests at
       its authored 0, never a forced 1). */
    const onPrint = () => {
      if (!tl || tl.progress() === 1) return;
      tl.scrollTrigger?.kill(false, true);
      tl.progress(1);
    };
    const printMedia = window.matchMedia("print");
    const onPrintMedia = (event: MediaQueryListEvent) => {
      if (event.matches) onPrint();
    };
    window.addEventListener("beforeprint", onPrint);
    printMedia.addEventListener("change", onPrintMedia);

    /* Marks "the engine drives this figure" for specs/screenshot runs
       (the pipeline's data-pipeline-scrub convention). */
    root.setAttribute("data-scene-run", "");

    return () => {
      window.removeEventListener(ARRIVAL_EVENT, onArrival);
      window.removeEventListener("beforeprint", onPrint);
      printMedia.removeEventListener("change", onPrintMedia);
      root.removeAttribute("data-scene-run");
      ctx.revert();
    };
  }, [lenis]);

  return rootRef;
}
