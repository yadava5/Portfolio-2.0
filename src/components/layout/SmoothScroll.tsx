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
 * The quiet in-page motion toggle (also A7) is the same gate by hand: it
 * persists to localStorage, stamps `data-motion-off` on <html> (the static
 * world's CSS hook), and unmounts/remounts the engine identically.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

/** localStorage key for the quiet in-page motion toggle (amendment A7) */
const MOTION_STORAGE_KEY = "motion-off";

const LenisContext = createContext<Lenis | null>(null);

/** Shape of the in-page motion preference (amendment A7) */
interface MotionPreference {
  /** true when the visitor has switched the quiet toggle to "motion: off" */
  motionOff: boolean;
  /** Flip the toggle (persists to localStorage) */
  toggleMotion: () => void;
}

const MotionPreferenceContext = createContext<MotionPreference>({
  motionOff: false,
  toggleMotion: () => {},
});

/**
 * Access the live Lenis instance.
 * Returns null under reduced motion, under the in-page motion toggle, or
 * before the engine mounts — callers must fall back to instant behavior.
 */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

/**
 * Access the quiet in-page motion toggle state (amendment A7).
 */
export function useMotionPreference(): MotionPreference {
  return useContext(MotionPreferenceContext);
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
  const [motionOff, setMotionOff] = useState(false);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  /* Restore the persisted toggle once on the client (SSR-safe default: on) */
  useEffect(() => {
    try {
      if (window.localStorage.getItem(MOTION_STORAGE_KEY) === "1") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMotionOff(true);
      }
    } catch {
      /* storage unavailable — leave motion on */
    }
  }, []);

  /* The static world's CSS reads this attribute (globals.css) */
  useEffect(() => {
    const root = document.documentElement;
    if (motionOff) {
      root.setAttribute("data-motion-off", "");
    } else {
      root.removeAttribute("data-motion-off");
    }
    return () => {
      root.removeAttribute("data-motion-off");
    };
  }, [motionOff]);

  const toggleMotion = useCallback(() => {
    setMotionOff((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(MOTION_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* storage unavailable — session-only toggle */
      }
      return next;
    });
  }, []);

  const motionPreference = useMemo(
    () => ({ motionOff, toggleMotion }),
    [motionOff, toggleMotion]
  );

  useEffect(() => {
    /* A7: never mount the engine under reduced motion or the quiet toggle
       (no init-then-disable). The synchronous media-query read closes the
       first-commit race: this effect otherwise runs once with the hook's
       SSR-safe `false` before its change subscription delivers `true`,
       transiently mounting the engine under reduced motion. */
    if (prefersReducedMotion || motionOff) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

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
  }, [prefersReducedMotion, motionOff]);

  return (
    <MotionPreferenceContext.Provider value={motionPreference}>
      <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
    </MotionPreferenceContext.Provider>
  );
}
