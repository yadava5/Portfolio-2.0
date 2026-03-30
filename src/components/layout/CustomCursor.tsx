/**
 * @fileoverview Custom cursor with holographic glow trail
 *
 * Renders two cursor elements:
 *   1. A small dot that tracks the mouse position exactly
 *   2. A larger glow ring that follows with GSAP-smoothed easing
 *
 * Features:
 * - GSAP `quickTo` for butter-smooth 60fps following
 * - Magnetic pull effect when hovering interactive elements
 * - Scale-up on clickable elements (links, buttons)
 * - Hidden on touch devices and when prefers-reduced-motion is set
 * - Blend-mode difference for visibility on any background
 */

"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/** Elements that trigger the "clickable" cursor expansion */
const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, [data-cursor='pointer']";

/** Elements that trigger the magnetic pull effect */
const MAGNETIC_SELECTOR = "[data-cursor='magnetic']";

/* ──────────────────────────────────────────────
   Touch device detection
   ────────────────────────────────────────────── */

/**
 * Checks if the device supports fine pointer (mouse)
 *
 * @returns `true` when a mouse is available
 */
function hasFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

/**
 * Checks if the user prefers reduced motion
 *
 * @returns `true` when reduced motion is preferred
 */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ──────────────────────────────────────────────
   CustomCursor component
   ────────────────────────────────────────────── */

/**
 * Holographic custom cursor overlay
 *
 * Mounts two absolutely-positioned divs that follow the mouse pointer.
 * Uses GSAP `quickTo` for GPU-accelerated, jank-free animation.
 * Automatically hidden on touch devices and when reduced motion is set.
 *
 * @returns Cursor elements or null on touch/reduced-motion devices
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const initialized = useRef(false);

  /* Only enable on devices with a fine pointer and no reduced-motion preference */
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    /* Schedule state update to avoid synchronous cascading */
    requestAnimationFrame(() => {
      setEnabled(hasFinePointer() && !prefersReducedMotion());
    });
  }, []);

  /* GSAP cursor tracking */
  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const glow = glowRef.current;
    if (!dot || !glow) return;

    /* quickTo creates a reusable tween for a single property — ideal for mousemove */
    const xDot = gsap.quickTo(dot, "x", { duration: 0.05, ease: "none" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.05, ease: "none" });
    const xGlow = gsap.quickTo(glow, "x", {
      duration: 0.2,
      ease: "power3.out",
    });
    const yGlow = gsap.quickTo(glow, "y", {
      duration: 0.2,
      ease: "power3.out",
    });
    const glowColor = gsap.quickTo(glow, "--cursor-color-hue", { duration: 0.3, ease: "power2.out" });

    /** Move both cursors toward the pointer position */
    function onPointerMove(e: PointerEvent) {
      xDot(e.clientX);
      yDot(e.clientY);
      xGlow(e.clientX);
      yGlow(e.clientY);
    }

    /** Scale up when hovering interactive elements */
    function onMouseOver(e: MouseEvent) {
      const target = e.target as HTMLElement;

      if (target.closest(INTERACTIVE_SELECTOR)) {
        gsap.to(dot, { scale: 0.5, duration: 0.3, ease: "back.out(1.2)" });
        gsap.to(glow, {
          scale: 2.8,
          opacity: 0.85,
          duration: 0.4,
          ease: "back.out(1.2)",
        });

        /* Add rotation for buttons specifically - PRIORITY 6 */
        if (target.closest("button, a[href], [role='button']")) {
          gsap.to(glow, {
            rotation: 45,
            duration: 0.4,
            ease: "back.out(1.2)",
          });
        }
      }

      /* Magnetic pull: shift glow toward center of the magnetic element */
      const magnetic = target.closest(MAGNETIC_SELECTOR) as HTMLElement | null;
      if (magnetic) {
        const rect = magnetic.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        gsap.to(glow, { x: cx, y: cy, duration: 0.4, ease: "power3.out" });
      }
    }

    /** Reset cursor scale on mouse out */
    function onMouseOut(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest(INTERACTIVE_SELECTOR)) {
        gsap.to(dot, { scale: 1, duration: 0.2, ease: "power2.out" });
        gsap.to(glow, {
          scale: 1,
          opacity: 0.4,
          rotation: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    }

    /** Pulse on click */
    function onMouseDown() {
      gsap.to(glow, { scale: 0.8, duration: 0.1, ease: "power2.in" });
    }

    /** Release pulse */
    function onMouseUp() {
      gsap.to(glow, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.4)" });
    }

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-9999"
    >
      {/* Dot — small, precise */}
      <div
        ref={dotRef}
        className="bg-foreground absolute top-0 left-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-difference"
      />

      {/* Glow ring — larger, trails behind */}
      <div
        ref={glowRef}
        className="absolute top-0 left-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 mix-blend-color-dodge pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--accent-primary) 0%, var(--accent-secondary) 100%)",
          filter: "blur(6px)",
          boxShadow: "0 0 20px var(--accent-primary)",
        }}
      />
    </div>
  );
}
