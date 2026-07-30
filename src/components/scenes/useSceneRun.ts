/**
 * @fileoverview useSceneRun — the living scenes' one-shot run engine.
 *
 * The world model is TextMotion's, not PipelineRun's: the SERVER MARKUP
 * IS THE SETTLED FRAME (the "print edition" — an honest, finished
 * editorial figure), and motion exists only in the engine world. In the
 * engine world the hook builds a paused GSAP timeline wired to ONE
 * once-only ScrollTrigger on the scene root (A1 vocabulary, NO pin —
 * amendment A8 keeps the only pin on PipelineRun): the build callback
 * first gsap.set()s the figure back to its start frame, then tweens it
 * forward to the settled values the markup already holds. `once: true`
 * means the timeline plays a single time and dies — ZERO rAF work after
 * the scene settles.
 *
 * Triple gate (amendment A7/D5), inherited rather than re-implemented:
 * `useLenis()` is null under prefers-reduced-motion AND the quiet
 * data-motion-off toggle AND before the engine mounts — so in every
 * static world the effect never runs, no start frame is ever applied,
 * and the settled markup simply stands. Flipping the toggle mid-session
 * reverts the context (ctx.revert() restores the settled inline state)
 * — the static world is always the finished figure, never a frozen lie.
 *
 * TWO WORLDS THE TRIGGER CANNOT SEE (both A7 faults, both measured):
 *   - A LANDING (CRITIC-LEDGER F01, the scenes' turn): header nav, a
 *     shared `/#hash`, Back/Forward — a landing crosses no trigger
 *     lines, so a scene that lands inside the viewport but above no
 *     start line holds its undrawn start frame forever (measured: the
 *     glyph plate stranded at 2px visible on a 1200px `/#work`
 *     landing). The engine already owns the cue for this —
 *     `ARRIVAL_EVENT` — so an arrived-at scene plays its run DIRECTLY,
 *     the same beat TextMotion's roster grants its reveals.
 *   - THE PAPER EDITION (@media print): a third world that neither
 *     reduced-motion nor the quiet toggle stamps, printed straight
 *     from the motion world's inline styles (measured fresh-load: 96
 *     of 254 scene elements undrawn — fig 5.3 a blank gap). Paper has
 *     no scroll coming, so on `beforeprint` — which headless
 *     Chromium's printToPDF path fires synchronously BEFORE the print
 *     snapshot (probed: a handler's DOM edit landed in the PDF) — and
 *     on the `matchMedia("print")` flip that covers emulated print
 *     media, the run COMPLETES: progress(1) renders the timeline's own
 *     end state, which is the settled markup by construction. The
 *     settle is permanent — after the paper edition has shown the
 *     finished figure, rewinding it on screen would be the
 *     visible → hidden → re-entering flash F76 bans.
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

/** Scene trigger position — a hair before the reading eye arrives (the
 *  composed-scene convention, clamped inside the reachable scroll span). */
const SCENE_START = "clamp(top 80%)";

/**
 * Wire a scene's one-shot run to its root element.
 *
 * @param build - Receives the timeline (paused behind its trigger) and
 *   the scene root. Must (1) gsap.set() start states, then (2) add the
 *   forward tweens whose end values equal the markup's natural state.
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

    /* Past-start at build (deep-scroll reload / mid-page remount): run
       the one-shot DIRECTLY with no trigger. A once:true trigger created
       past its start fires and self-kills inside the first refresh loop
       that touches it, mutating GSAP's trigger list mid-iteration — the
       hydration crash TextMotion's pastStart() documents. The timeline
       without a trigger simply plays (same beat the trigger would have
       fired at creation), and dies on completion — still zero rAF after
       settle. */
    const immediate =
      root.getBoundingClientRect().top <= window.innerHeight * 0.8;
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
                once: true,
              },
            }),
      });
      buildRef.current(tl, root);
    }, root);

    /* Arrived-at settle (F01 — see the header): a landing that leaves
       this scene inside the viewport has crossed no trigger line, so
       the arrival is the cue. Same reconciliation rule as TextMotion's
       roster — anything whose top is above the fold has been arrived
       at — and the same gesture: the trigger dies, the authored run
       plays from the top. Scenes still below the fold keep their
       trigger and their choreography untouched. */
    const onArrival = () => {
      if (!tl || tl.progress() > 0 || tl.isActive()) return;
      if (root.getBoundingClientRect().top >= window.innerHeight) return;
      tl.scrollTrigger?.kill(false, true);
      tl.play(0);
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
