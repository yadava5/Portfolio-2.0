/**
 * @fileoverview Scroll-triggered reveal animation wrapper
 *
 * Wraps content and animates it into view when scrolled into viewport.
 * Uses GSAP ScrollTrigger for reliable, performant detection.
 *
 * Features:
 * - Multiple animation presets (fade, slide, scale, etc.)
 * - Configurable delay for staggered reveals
 * - Threshold control for trigger point
 * - Once-only or repeat animations
 * - Respects prefers-reduced-motion
 */

"use client";

import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";

/* Register GSAP plugin */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

/** Available animation variants */
type RevealVariant =
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale"
  | "blur";

/** Props for the ScrollReveal component */
interface ScrollRevealProps {
  /** Content to reveal */
  children: ReactNode;
  /** Animation variant */
  variant?: RevealVariant;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Animation duration (seconds) */
  duration?: number;
  /** Viewport threshold to trigger (0-1) */
  threshold?: number;
  /** Whether to animate only once or repeat */
  once?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/* ──────────────────────────────────────────────
   Animation configurations
   ────────────────────────────────────────────── */

/** Initial (hidden) states for each variant */
const fromStates: Record<RevealVariant, gsap.TweenVars> = {
  fade: { opacity: 0 },
  "slide-up": {
    opacity: 0,
    y: 50,
    scale: 0.95,
    filter: "blur(16px)",
    rotation: -2,
  },
  "slide-down": {
    opacity: 0,
    y: -50,
    scale: 0.95,
    filter: "blur(16px)",
    rotation: -2,
  },
  "slide-left": {
    opacity: 0,
    x: 50,
    scale: 0.95,
    filter: "blur(16px)",
    rotation: -2,
  },
  "slide-right": {
    opacity: 0,
    x: -50,
    scale: 0.95,
    filter: "blur(16px)",
    rotation: -2,
  },
  scale: { opacity: 0, scale: 0.85, filter: "blur(16px)", rotation: -2 },
  blur: { opacity: 0, filter: "blur(16px)", rotation: -2 },
};

/** Final (visible) states for each variant */
const toStates: Record<RevealVariant, gsap.TweenVars> = {
  fade: { opacity: 1 },
  "slide-up": { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", rotation: 0 },
  "slide-down": {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    rotation: 0,
  },
  "slide-left": {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    rotation: 0,
  },
  "slide-right": {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    rotation: 0,
  },
  scale: { opacity: 1, scale: 1, filter: "blur(0px)", rotation: 0 },
  blur: { opacity: 1, filter: "blur(0px)", rotation: 0 },
};

/* ──────────────────────────────────────────────
   Utility
   ────────────────────────────────────────────── */

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

/**
 * Scroll-triggered reveal animation wrapper
 *
 * Wraps any content and animates it into view when the user
 * scrolls it into the viewport. Uses GSAP ScrollTrigger.
 *
 * @param props - Component props
 * @returns A div wrapper that reveals its children on scroll
 *
 * @example
 * ```tsx
 * // Basic fade
 * <ScrollReveal>
 *   <p>This fades in on scroll</p>
 * </ScrollReveal>
 *
 * // Slide up with delay (for stagger effect)
 * <ScrollReveal variant="slide-up" delay={0.2}>
 *   <Card />
 * </ScrollReveal>
 * ```
 */
export function ScrollReveal({
  children,
  variant = "fade",
  delay = 0,
  duration = 0.8,
  threshold = 0.2,
  once = true,
  className,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = prefersReducedMotion();

    if (reduced.current || !elementRef.current) return;

    const element = elementRef.current;

    /* Set initial hidden state */
    gsap.set(element, fromStates[variant]);

    /* Create scroll trigger animation */
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: `top ${100 - threshold * 100}%`,
      onEnter: () => {
        gsap.to(element, {
          ...toStates[variant],
          duration,
          delay,
          ease: "back.out(1.7)",
        });
      },
      onLeaveBack: once
        ? undefined
        : () => {
            gsap.to(element, {
              ...fromStates[variant],
              duration: duration * 0.5,
              ease: "power2.in",
            });
          },
      once,
    });

    return () => {
      trigger.kill();
    };
  }, [variant, delay, duration, threshold, once]);

  return (
    <div
      ref={elementRef}
      className={cn("will-change-transform", className)}
      style={{
        contain: "layout style paint",
      }}
    >
      {children}
    </div>
  );
}
