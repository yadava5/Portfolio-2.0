/**
 * @fileoverview Lenis + GSAP ScrollTrigger scroll engine — the ONE rAF loop
 *
 * Architecture (plan 3.9 + rubric amendment A1):
 *   - Lenis runs with `autoRaf: false`; GSAP's ticker is the single rAF loop
 *     and drives `lenis.raf(time * 1000)`.
 *   - `lagSmoothing(0)` keeps scrub positions honest after main-thread stalls.
 *   - ScrollTrigger start/end positions are re-measured after web fonts load.
 *   - The live Lenis instance is exposed via context (`useLenis`) so nav
 *     anchors, the chapter rail, and the day-arc engine all read from this
 *     single loop — no parallel scroll listeners.
 *
 * Reduced motion (amendment A7): gated at entry — the engine is NEVER
 * mounted under `prefers-reduced-motion: reduce`, and a mid-session OS
 * toggle tears it down/brings it up via the hook's change subscription.
 */

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Programmatic scroll settings (plan 3.9): duration 1.2s, expo-out */
export const SCROLL_DURATION = 1.2;
export const scrollEasing = (t: number) =>
  Math.min(1, 1.001 - Math.pow(2, -10 * t));

/** Matches `scroll-padding-top: 6rem` in globals.css */
export const SCROLL_OFFSET = -96;

const LenisContext = createContext<Lenis | null>(null);

/**
 * Access the live Lenis instance.
 * Returns null under reduced motion or before the engine mounts —
 * callers must fall back to instant, non-animated behavior.
 */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

/** Props for the SmoothScroll provider */
interface SmoothScrollProps {
  children: ReactNode;
}

/**
 * Provides the scroll engine to the entire application.
 *
 * @param props - Component props
 * @returns Context provider wrapping children
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    /* A7: never mount the engine under reduced motion (no init-then-disable) */
    if (prefersReducedMotion) return;

    const instance = new Lenis({
      lerp: 0.08 /* plan 3.9 */,
      smoothWheel: true,
      wheelMultiplier: 1,
      syncTouch: false /* touch smoothing OFF */,
      autoRaf: false /* GSAP's ticker is THE loop (A1) */,
    });

    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000); /* s → ms */
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    /* Scrub start/end positions are measured at init; the web-font swap
       reflows the page — re-measure once fonts are ready. */
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handleResize);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); /* restore GSAP default */
      instance.destroy();
      setLenis(null);
    };
  }, [prefersReducedMotion]);

  return (
    <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
  );
}
