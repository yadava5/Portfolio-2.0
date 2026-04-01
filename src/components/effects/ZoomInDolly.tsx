/**
 * @fileoverview Zoom-in dolly effect wrapper
 *
 * Creates a cinematic zoom-in effect where the user feels like they're moving
 * closer to the content. Each section starts at scale 0.85 and zooms to 1.0
 * as it enters the viewport. Used for Noir Cinema theme.
 */

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ZoomInDollyProps {
  children: ReactNode;
  className?: string;
  /** Parallax intensity for background elements (0-1, default 0.3) */
  parallaxIntensity?: number;
}

/**
 * Wraps a section with cinematic zoom-in (dolly) effect
 *
 * Creates depth perception as content zooms in while scrolling.
 * Background parallax creates additional cinematic depth.
 *
 * @param props - Component props
 * @returns Wrapped section with dolly zoom effect
 */
export function ZoomInDolly({
  children,
  className = "",
  parallaxIntensity = 0.3,
}: ZoomInDollyProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    // Disable on mobile (width < 768px)
    if (window.innerWidth < 768) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const section = sectionRef.current;

    // Main section zoom-in from 0.85 to 1.0 with smooth easing
    gsap.fromTo(
      section,
      { scale: 0.85, opacity: 0.7 },
      {
        scale: 1,
        opacity: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "top 30%",
          scrub: 0.6,
          markers: false,
        },
      }
    );

    // Apply parallax to nested background elements
    const bgElements = section.querySelectorAll("[data-parallax]");
    bgElements.forEach((element) => {
      const element_ = element as HTMLElement;
      const speed = parseFloat(
        element_.dataset.parallax || String(parallaxIntensity)
      );

      gsap.to(element_, {
        y: (index: number) => index * speed * 50,
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
          markers: false,
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (
          trigger.vars.trigger === section ||
          (trigger.vars.trigger &&
            typeof trigger.vars.trigger === "object" &&
            "closest" in trigger.vars.trigger &&
            bgElements.length > 0)
        ) {
          trigger.kill();
        }
      });
    };
  }, [parallaxIntensity]);

  return (
    <div
      ref={sectionRef}
      className={className}
      style={{
        willChange: "transform, opacity",
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
}
