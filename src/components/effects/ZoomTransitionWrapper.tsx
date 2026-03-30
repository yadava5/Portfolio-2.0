/**
 * @fileoverview Zoom transition wrapper for section transitions
 *
 * Creates a zoom in/out effect between sections as the user scrolls.
 * The current section zooms OUT while the next section zooms IN.
 * Used for Dark Luxe theme.
 */

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ZoomTransitionWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a section with zoom transition effects on scroll
 *
 * As you scroll, the section zooms out while entering the viewport,
 * creating a cinematic transition effect.
 *
 * @param props - Component props
 * @returns Wrapped section with zoom transition
 */
export function ZoomTransitionWrapper({
  children,
  className = "",
}: ZoomTransitionWrapperProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;

    // Disable on mobile (width < 768px)
    if (window.innerWidth < 768) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    // Animate section zoom in on scroll with smooth easing and staggered entry
    gsap.fromTo(
      section,
      { scale: 1.1, opacity: 0, y: 20 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "top center",
          scrub: 0.5,
          markers: false,
        },
      }
    );

    // Cleanup previous section zoom out with easing and staggered exit
    const prevSection = section.previousElementSibling;
    if (prevSection) {
      gsap.to(prevSection, {
        scale: 0.9,
        opacity: 0,
        y: -20,
        ease: "power2.in",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "top center",
          scrub: 0.5,
          markers: false,
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === section || trigger.vars.trigger === prevSection) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className={className}
      style={{
        willChange: "transform, opacity",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}
