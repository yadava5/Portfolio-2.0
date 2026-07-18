/**
 * @fileoverview ChapterRail — left-edge wayfinding, `01…07` (plan 3.6).
 *
 * Mono lowercase folio numbers at the left edge, xl+ only. Only the
 * active chapter shows its name (NO-LIST §C: no track, no capsule, no
 * glow, no labels-on-hover). Clicks route through the shared Lenis loop.
 *
 * Active state comes from an IntersectionObserver whose root margin
 * collapses the viewport to its center line — the chapter under the
 * middle of the screen (where the rail itself sits) is active. That
 * makes the rail's dusk-ink switch track the day-arc's 05→06 step
 * (which fires at the same top-50% boundary) in motion mode, and track
 * the statically-painted chapter behind it in the reduced-motion and
 * motion-off worlds, where no ScrollTrigger ever exists (A7).
 */

"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CHAPTERS, isDuskChapter } from "@/components/story/chapters";
import { LenisAnchor } from "@/components/story/LenisAnchor";

/**
 * Fixed left-edge chapter rail (xl+ viewports).
 *
 * @returns The rail nav, or nothing below xl (CSS-hidden)
 */
export function ChapterRail() {
  const [active, setActive] = useState(CHAPTERS[0].id);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter]")
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.chapter;
          if (id) setActive(id);
        }
      },
      /* Collapse the root to the viewport's horizontal center line */
      { rootMargin: "-50% 0px -50% 0px" }
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Chapters"
      className={cn(
        "fixed top-1/2 left-4 z-30 hidden -translate-y-1/2 xl:block",
        isDuskChapter(active) ? "text-ink-dusk" : "text-ink"
      )}
    >
      <ul className="flex flex-col gap-2.5">
        {CHAPTERS.map((chapter) => {
          const isActive = chapter.id === active;
          return (
            <li key={chapter.id}>
              <LenisAnchor
                href={`#${chapter.anchor}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "label-mono flex items-baseline gap-1.5 transition-opacity duration-300",
                  isActive ? "" : "opacity-70 hover:opacity-100"
                )}
              >
                <span>{chapter.id}</span>
                <span className={isActive ? "" : "sr-only"}>
                  {chapter.name}
                </span>
              </LenisAnchor>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
