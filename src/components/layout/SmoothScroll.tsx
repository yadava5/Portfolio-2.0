/**
 * @fileoverview Lenis smooth scroll provider
 *
 * Integrates the Lenis smooth scroll library into the React component tree.
 * Lenis provides butter-smooth scrolling (used on the GTA VI website)
 * and syncs with GSAP for scroll-triggered animations.
 *
 * Respects prefers-reduced-motion by disabling smooth scroll.
 */

"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Props for the SmoothScroll provider */
interface SmoothScrollProps {
  children: ReactNode;
}

/**
 * Provides smooth scrolling behavior to the entire application
 *
 * Initializes Lenis on mount and tears it down on unmount.
 * Uses requestAnimationFrame for 60fps scroll performance.
 * Disabled automatically when user prefers reduced motion.
 *
 * @param props - Component props
 * @returns Provider wrapping children with smooth scroll behavior
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <SmoothScroll>
 *   <main>{children}</main>
 * </SmoothScroll>
 * ```
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    /* Skip smooth scroll if user prefers reduced motion */
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    lenisRef.current = lenis;

    /**
     * Animation frame loop for Lenis scroll updates
     * Syncs Lenis with GSAP ScrollTrigger
     *
     * @param time - requestAnimationFrame timestamp
     */
    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    /**
     * Sync Lenis scroll events with ScrollTrigger
     */
    lenis.on("scroll", ScrollTrigger.update);

    /**
     * Handle window resize to refresh scroll triggers
     */
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
