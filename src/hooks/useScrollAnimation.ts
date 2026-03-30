"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Configuration for scroll animations
 */
export interface ScrollAnimationConfig {
  /** Selector or element to trigger the animation */
  trigger: string | Element;
  /** When the animation should start (e.g., "top center", "top 80%") */
  start?: string;
  /** When the animation should end (e.g., "center center") */
  end?: string;
  /** Scrub value - true for smooth scrub, number for scrub duration */
  scrub?: boolean | number;
  /** GSAP animation function (gsap.to, gsap.from, etc.) */
  animation: (target: Element) => void;
  /** Whether to use markers for debugging (only in dev) */
  markers?: boolean;
}

/**
 * Hook for GSAP ScrollTrigger scroll animations
 *
 * Handles component-level scroll animations with proper cleanup of ScrollTrigger instances.
 * Automatically refreshes ScrollTrigger on window resize.
 * Prevents memory leaks from abandoned tweens.
 *
 * @param config - ScrollAnimation configuration
 * @returns Ref to attach to the animated element
 *
 * @example
 * ```tsx
 * const ref = useScrollAnimation({
 *   trigger: containerRef,
 *   start: "top center",
 *   end: "bottom center",
 *   scrub: 0.5,
 *   animation: (target) => {
 *     gsap.to(target, { opacity: 1, duration: 1 });
 *   },
 * });
 *
 * return <div ref={ref}>{children}</div>;
 * ```
 */
export function useScrollAnimation(config: ScrollAnimationConfig) {
  const elementRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    try {
      // Create the animation
      config.animation(el);

      // Create the ScrollTrigger
      triggerRef.current = ScrollTrigger.create({
        trigger: config.trigger,
        start: config.start || "top center",
        end: config.end || "center center",
        scrub: config.scrub ?? false,
        markers: config.markers && process.env.NODE_ENV === "development",
        onRefresh: () => {
          // Refresh is handled automatically, but we can add custom logic here if needed
        },
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[useScrollAnimation] Error creating animation:", error);
      }
    }

    // Refresh ScrollTrigger when window resizes
    const handleResize = () => {
      if (triggerRef.current) {
        ScrollTrigger.getAll().forEach((trigger) => {
          trigger.refresh();
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);

      // Kill the ScrollTrigger to prevent memory leaks
      if (triggerRef.current) {
        triggerRef.current.kill();
        triggerRef.current = null;
      }

      // Kill all tweens attached to the element
      gsap.killTweensOf(el);
    };
  }, [config]);

  return elementRef as RefObject<HTMLDivElement>;
}
