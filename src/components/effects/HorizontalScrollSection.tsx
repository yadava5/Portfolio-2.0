/**
 * @fileoverview Horizontal scroll section wrapper
 *
 * Pins a section and makes it scroll horizontally while the rest of the page
 * scrolls vertically. Used for Paper-Ink theme's Projects section.
 */

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface HorizontalScrollSectionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps content to scroll horizontally when this section enters viewport
 *
 * The section becomes pinned and scrolls horizontally as the user scrolls down.
 * Useful for project galleries or timeline-style content.
 *
 * @param props - Component props
 * @returns Wrapped section with horizontal scroll behavior
 */
export function HorizontalScrollSection({
  children,
  className = "",
}: HorizontalScrollSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    // Disable on mobile (width < 768px)
    if (window.innerWidth < 768) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const content = contentRef.current;

    // Calculate horizontal scroll distance
    const scrollWidth = content.scrollWidth - window.innerWidth;

    if (scrollWidth > 0) {
      /* timeline ref kept by ScrollTrigger internally */
      gsap.to(content, {
        x: -scrollWidth,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: container,
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          start: "top top",
          end: () => `+=${scrollWidth}`,
          markers: false,
        },
      });

      // Add subtle scale animation to content items as they enter viewport
      const items = content.querySelectorAll(
        "[role='article'], [role='button'], li, .project-card"
      );
      items.forEach((item, index) => {
        gsap.fromTo(
          item,
          { scale: 0.95, opacity: 0.8 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: "back.out",
            delay: index * 0.05,
            scrollTrigger: {
              trigger: item,
              start: "left 80%",
              end: "left 50%",
              scrub: 0.3,
              markers: false,
            },
          }
        );
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        overflow: "hidden",
      }}
    >
      <div
        ref={contentRef}
        style={{
          display: "flex",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}
