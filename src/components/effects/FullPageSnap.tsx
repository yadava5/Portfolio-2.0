/**
 * @fileoverview Full-page snap scroll wrapper
 *
 * Implements snap-to-section scrolling where each section takes the full viewport height
 * and snaps into place with a fast, satisfying animation. Used for Editorial theme.
 */

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface FullPageSnapProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a section to enable full-page snap scrolling
 *
 * Each section snaps to fill the full viewport (100vh) with sharp,
 * editorial-style transitions. Creates a paginated scrolling experience.
 *
 * @param props - Component props
 * @returns Wrapped section with snap behavior
 */
export function FullPageSnap({
  children,
  className = "",
}: FullPageSnapProps) {
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

    // Set up snap trigger for this section
    ScrollTrigger.create({
      trigger: section,
      start: "top center",
      end: "top center",
      snap: {
        snapTo: 1,
        duration: 0.4,
        delay: 0.1,
        ease: "power3.inOut",
      },
      once: false,
      onSnapComplete: () => {
        // Add subtle scale bounce when snapping completes
        gsap.fromTo(
          section,
          { scale: 0.98 },
          {
            scale: 1,
            duration: 0.3,
            ease: "back.out",
          }
        );
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === section) {
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
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        willChange: "scroll-position",
      }}
    >
      {children}
    </div>
  );
}
