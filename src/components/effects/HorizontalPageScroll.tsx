/**
 * @fileoverview Full-page horizontal scroll wrapper
 *
 * Makes the entire page scroll horizontally instead of vertically.
 * Each section becomes a full-width panel. Includes a progress indicator.
 * Used for Neon Cyber theme.
 */

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState, type ReactNode } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HorizontalPageScrollProps {
  children: ReactNode;
  className?: string;
  /** Number of panels/sections for progress calculation */
  panelCount?: number;
}

/**
 * Wraps entire page content for horizontal scroll behavior
 *
 * Converts vertical scrolling to horizontal panning across full-width panels.
 * Includes a progress indicator showing current panel position.
 *
 * @param props - Component props
 * @returns Wrapped page content with horizontal scroll and progress indicator
 */
export function HorizontalPageScroll({
  children,
  className = "",
  panelCount = 7,
}: HorizontalPageScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPanel, setCurrentPanel] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Disable on mobile (width < 768px)
    if (window.innerWidth < 768) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const container = containerRef.current;

    // Calculate total horizontal scroll distance
    const totalWidth = container.scrollWidth;
    const scrollDistance = totalWidth - window.innerWidth;

    if (scrollDistance > 0) {
      gsap.to(container, {
        x: -scrollDistance,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: () => `+=${scrollDistance}`,
          scrub: 0.6,
          pin: true,
          markers: false,
          onUpdate: (self: ScrollTrigger) => {
            const progress = self.progress;
            const panel = Math.round(progress * (panelCount - 1));
            setCurrentPanel(Math.min(panel, panelCount - 1));
          },
        },
      });

    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        trigger.kill();
      });
    };
  }, [panelCount]);

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          willChange: "transform",
        }}
      >
        {children}
      </div>

      {/* Progress indicator */}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 50,
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        {Array.from({ length: panelCount }).map((_, index) => (
          <div
            key={index}
            style={{
              width: "0.5rem",
              height: "0.5rem",
              borderRadius: "50%",
              backgroundColor:
                index === currentPanel
                  ? "var(--accent-primary, #00ff00)"
                  : "var(--accent-primary, #00ff00)",
              opacity: index === currentPanel ? 1 : 0.3,
              transition: "opacity 0.3s ease-out",
              boxShadow:
                index === currentPanel
                  ? `0 0 10px var(--accent-primary, #00ff00)`
                  : "none",
            }}
          />
        ))}
      </div>
    </>
  );
}
