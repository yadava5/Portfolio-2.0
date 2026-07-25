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
  useRef,
  useState,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  anchorLanding,
  announceArrival,
  landingTop,
} from "@/components/story/arrival";
import {
  applyGate,
  getTier,
  startWatching,
  stopWatching,
  subscribeTier,
  suppressSampling,
} from "@/components/world/governor";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * How long the frame governor ignores its own samples after a
 * programmatic flight starts (§F2: it measures the VISITOR's scroll,
 * and a smooth `window.scrollTo` is machine scrolling — Firefox paces
 * one at a cadence that reads as sustained jank and false-downshifted
 * the engine mid-flight).
 *
 * An UPPER BOUND on a browser-chosen duration, not a duration we set:
 * `behavior: "smooth"` is the user agent's animation and no web API
 * reports or controls its length. Overshooting only means the governor
 * idles a beat longer than it had to.
 *
 * CRITIC-LEDGER F68: this used to read `SCROLL_DURATION * 1000 + 600`,
 * where `SCROLL_DURATION = 1.2` was the Lenis-era "1.2s expo-out" — a
 * setting no code had applied since the engine moved to native scroll.
 * The number survives (1800ms is the window that was verified); the
 * claim that we choose it does not.
 */
const FLIGHT_SUPPRESS_MS = 1800;

/** localStorage key for the quiet in-page motion toggle (amendment A7) */
const MOTION_STORAGE_KEY = "motion-off";

/**
 * Read "is the static world in force?" synchronously (amendment A7 +
 * governor §F2). Static-world consumers (the Red Thread, the pipeline)
 * need this BEFORE the provider's restore effect runs — child effects
 * fire first, so the context alone cannot answer "is the engine coming?"
 * on first paint. True under EITHER standing print-floor signal:
 *   - the visitor's persisted quiet toggle (localStorage), or
 *   - `data-tier="print"` — the frame governor's floor, stamped
 *     pre-paint by the layout.tsx head script (sessionStorage ceiling)
 *     or mid-session by a governor downshift.
 * (The OS reduced-motion media query is the callers' own third check.)
 *
 * @returns True when the static world is in force
 */
export function readStoredMotionOff(): boolean {
  try {
    return (
      window.localStorage.getItem(MOTION_STORAGE_KEY) === "1" ||
      document.documentElement.dataset.tier === "print"
    );
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
  /* One argument, because there is one landing (F68). The signature
     used to advertise `{offset, duration, easing}`; the body never
     destructured `opts` and both call sites passed all three, so a
     reader of the type learned three things the engine does not do.
     The offset is the shared landing contract (arrival.ts) and the
     flight is the browser's own smooth scroll. */
  scrollTo: (target: string | HTMLElement) => void;
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
  /* Page visibility joins the motion gate (the blank-plate fix). A hidden
     document freezes rAF, so a mounted engine could hide content behind
     reveals that can never play — yet hidden pages ARE consumed: embedded
     preview panes, link unfurlers, and background-tab loads all render or
     screenshot the page while `document.hidden` is true. The engine
     therefore mounts only once the document has actually been seen; until
     then the gate reports closed and the complete static world (server
     markup + print CSS) stands. A later visible→hidden flip does NOT
     unmount (a cmd-tab away must resume seamlessly); the governor handles
     the one dangerous case — scrolling while hidden — by forcing the
     print floor (see markScrolled). */
  const [pageEverVisible, setPageEverVisible] = useState(
    () =>
      typeof document === "undefined" || document.visibilityState !== "hidden"
  );
  useEffect(() => {
    if (pageEverVisible) return;
    const onVisibilityChange = () => {
      if (document.visibilityState !== "hidden") {
        setPageEverVisible(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pageEverVisible]);
  /* The frame governor's print floor (§F2). Seeded from the head
     script's pre-paint `data-tier` stamp so a sessionStorage-capped
     load never mounts the engine at all. */
  const [tierPrint, setTierPrint] = useState(
    () => typeof window !== "undefined" && getTier() === "print"
  );
  /* Downshift scroll anchor: the section under the viewport top when the
     governor drops to print — restored after the pin-spacer unwinds so
     the reader's line doesn't jump (§F2: zero layout surprise). */
  const downshiftAnchor = useRef<{ el: Element; top: number } | null>(null);

  /* Restore the persisted toggle once on the client (SSR-safe default:
     on). Raw localStorage read on purpose: readStoredMotionOff() now also
     reports the governor's print floor, which is NOT the user's toggle —
     the header control must reflect only the visitor's own choice. */
  useEffect(() => {
    try {
      if (window.localStorage.getItem(MOTION_STORAGE_KEY) === "1") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMotionOff(true);
      }
    } catch {
      /* storage unavailable — default stays on */
    }
  }, []);

  /* Report the motion gate to the governor (§F2 precedence: the gate
     always wins — reduced motion / the quiet toggle force print and
     disable measurement; an open gate restores the session ceiling).
     Declared BEFORE the tier subscription and engine effects so a gate
     change resolves the tier first. */
  useEffect(() => {
    applyGate(
      prefersReducedMotion ||
        motionOff ||
        !pageEverVisible ||
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
    );
  }, [prefersReducedMotion, motionOff, pageEverVisible]);

  /* Follow governor downshifts. On core→print, remember which section
     sits under the viewport top: unmounting the engine unwinds the ch04
     pin-spacer (~1 viewport of scroll distance) and would otherwise
     yank the page up mid-read. */
  useEffect(
    () =>
      subscribeTier((tier) => {
        const print = tier === "print";
        if (print && !downshiftAnchor.current) {
          /* Anchor the section under the READING line — the masthead
             band every landing clears, plus a line of breath (F69: this
             was a fifth hand-written 120) — not merely the first one
             still on screen: a section whose tail barely clips the
             viewport top can itself reflow between the motion and
             static worlds (SplitText un-splitting), which would leak
             that delta into everything below it. */
          const readingLine = anchorLanding() + 24;
          const section = Array.from(
            document.querySelectorAll<HTMLElement>("[data-chapter]")
          ).find((el) => el.getBoundingClientRect().bottom > readingLine);
          if (section) {
            downshiftAnchor.current = {
              el: section,
              top: section.getBoundingClientRect().top,
            };
          }
        }
        setTierPrint(print);
      }),
    []
  );

  /* The static world's CSS reads this attribute (globals.css). It is
     stamped for the visitor's quiet toggle AND for the governor's print
     floor — both mean "the static world is in force". */
  useEffect(() => {
    const root = document.documentElement;
    if (motionOff || tierPrint) {
      root.setAttribute("data-motion-off", "");
    } else {
      root.removeAttribute("data-motion-off");
    }
    return () => {
      root.removeAttribute("data-motion-off");
    };
  }, [motionOff, tierPrint]);

  /* After a governor downshift unmounts the engine (lenis → null) and
     the children have reverted their pins, re-align the reader's line.
     Double rAF: the pin-spacer removal must have laid out first. */
  useEffect(() => {
    if (lenis !== null || !tierPrint) return;
    const anchor = downshiftAnchor.current;
    if (!anchor) return;
    downshiftAnchor.current = null;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const drift = anchor.el.getBoundingClientRect().top - anchor.top;
        if (Math.abs(drift) > 1) {
          window.scrollBy({ top: drift, behavior: "instant" });
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [lenis, tierPrint]);

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
    /* A7 + §F2: never mount the engine under reduced motion, the quiet
       toggle, or the governor's print floor (no init-then-disable). The
       synchronous media-query read closes the first-commit race: this
       effect otherwise runs once with the hook's SSR-safe `false` before
       its change subscription delivers `true`, transiently mounting the
       engine under reduced motion. */
    if (prefersReducedMotion || motionOff || tierPrint || !pageEverVisible) {
      return;
    }
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
        /* The shared anchor landing contract: the target lands one 6rem
           masthead below the top (arrival.ts). NOT scrollIntoView —
           that applies BOTH scroll-padding-top AND the element's
           scroll-margin-top, landing at ~12rem (192px). */
        const y = landingTop(el);
        /* §F2: a smooth flight is machine scrolling — the governor must
           not score its frame cadence as the visitor's jank (firefox
           false-downshifted mid-flight). */
        suppressSampling(FLIGHT_SUPPRESS_MS);
        window.scrollTo({ top: y, behavior: "smooth" });
        /* A flight crosses no trigger lines on the way in: tell the
           reveal engine where the reader landed (CRITIC-LEDGER F01). */
        announceArrival();
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

    /* The frame governor watches exactly while the engine lives (§F2):
       longtask observer + scroll-gated sampling on THE one rAF loop. */
    startWatching();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(controller);

    return () => {
      cancelled = true;
      stopWatching();
      window.removeEventListener("resize", handleResize);
      for (const listener of scrollListeners.values()) {
        window.removeEventListener("scroll", listener);
      }
      scrollListeners.clear();
      setLenis(null);
    };
  }, [prefersReducedMotion, motionOff, tierPrint, pageEverVisible]);

  return (
    <MotionPreferenceContext.Provider value={motionPreference}>
      <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
    </MotionPreferenceContext.Provider>
  );
}
