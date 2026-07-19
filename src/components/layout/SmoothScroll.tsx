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

/**
 * Read the persisted quiet-toggle preference synchronously (amendment
 * A7). Static-world consumers (the Red Thread) need this BEFORE the
 * provider's restore effect runs — child effects fire first, so the
 * context alone cannot answer "is the engine coming?" on first paint.
 *
 * @returns True when the visitor has switched motion off
 */
export function readStoredMotionOff(): boolean {
  try {
    return window.localStorage.getItem(MOTION_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

/* The app used to hold a Lenis instance here. It now uses NATIVE scroll (no
   scroll-jacking, no sub-pixel shimmer, no momentum "slide" — the browser's
   own buttery scroll), and this thin controller exposes only the surface the
   app calls: anchor navigation + a scroll-event bridge + the modal lock.
   Non-null == the motion world is live (children wire their ScrollTriggers). */
export interface ScrollController {
  scrollTo: (
    target: string | HTMLElement,
    opts?: {
      offset?: number;
      duration?: number;
      easing?: (t: number) => number;
    }
  ) => void;
  on: (event: "scroll", cb: () => void) => void;
  off: (event: "scroll", cb: () => void) => void;
  stop: () => void;
  start: () => void;
}

const LenisContext = createContext<ScrollController | null>(null);

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
export function useLenis(): ScrollController | null {
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
  const [lenis, setLenis] = useState<ScrollController | null>(null);

  /* Restore the persisted toggle once on the client (SSR-safe default: on) */
  useEffect(() => {
    if (readStoredMotionOff()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMotionOff(true);
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

    /* NATIVE SCROLL (no Lenis). ScrollTrigger listens to the window's own
       scroll, so every scrubbed animation follows the browser's buttery,
       sub-pixel-clean scroll — no momentum "slide", no shimmer, no
       scroll-jacking (the "slidey/vibrating/not-smooth" the user hit across
       four Lenis-tuning passes). The controller is a thin shim over native
       APIs so the consumers that wire ScrollTriggers (truthy == motion on)
       and do anchor navigation keep working unchanged. */
    const scrollListeners = new Map<() => void, EventListener>();
    const controller: ScrollController = {
      scrollTo: (target) => {
        const el =
          typeof target === "string"
            ? document.querySelector<HTMLElement>(target)
            : target;
        if (!el) return;
        /* Manual smooth scroll landing the target SCROLL_OFFSET (=6rem
           header) below the top. NOT scrollIntoView — that applies BOTH
           scroll-padding-top AND the element's scroll-margin-top, landing
           at ~12rem (192px). This applies exactly one header offset. */
        const y =
          window.scrollY + el.getBoundingClientRect().top + SCROLL_OFFSET;
        window.scrollTo({ top: y, behavior: "smooth" });
      },
      on: (_event, cb) => {
        const listener: EventListener = () => cb();
        scrollListeners.set(cb, listener);
        window.addEventListener("scroll", listener, { passive: true });
      },
      off: (_event, cb) => {
        const listener = scrollListeners.get(cb);
        if (listener) {
          window.removeEventListener("scroll", listener);
          scrollListeners.delete(cb);
        }
      },
      /* The portrait modal locks the page via body overflow itself, so these
         stay no-ops — callers don't need to change. */
      stop: () => {},
      start: () => {},
    };

    /* Scrub start/end positions are measured at init; the web-font swap
       reflows the page — re-measure once fonts are ready. */
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handleResize);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(controller);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
      for (const listener of scrollListeners.values()) {
        window.removeEventListener("scroll", listener);
      }
      scrollListeners.clear();
      setLenis(null);
    };
  }, [prefersReducedMotion, motionOff]);

  return (
    <MotionPreferenceContext.Provider value={motionPreference}>
      <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
    </MotionPreferenceContext.Provider>
  );
}
