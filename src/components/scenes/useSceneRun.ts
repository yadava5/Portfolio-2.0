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
 * Property discipline (D3): build callbacks may animate transform /
 * opacity / clip-path and the sanctioned stroke-dashoffset ONLY.
 */

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "@/components/layout/SmoothScroll";

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
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
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

    /* Marks "the engine drives this figure" for specs/screenshot runs
       (the pipeline's data-pipeline-scrub convention). */
    root.setAttribute("data-scene-run", "");

    return () => {
      root.removeAttribute("data-scene-run");
      ctx.revert();
    };
  }, [lenis]);

  return rootRef;
}
