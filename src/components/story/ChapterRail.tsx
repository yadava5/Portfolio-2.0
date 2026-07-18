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
 *
 * AUDIT TRAIL (Phase 2 · Step 2, banked elevation): as the Red Thread
 * finishes drawing a chapter, a small ink check appears beside that
 * folio number — by 07 the rail reads as a completed review checklist.
 * The marks ride ScrollTrigger callbacks at the thread's own end
 * boundary (THREAD_TRIGGER_END: the chapter bottom passing 60%
 * viewport), created only in the engine world (A7) and toggled through
 * React state with a 0.3s opacity fade (globals.css `.rail-mark`).
 * Static worlds show the finished run: every mark present, pure CSS.
 */

"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { CHAPTERS, isDuskChapter } from "@/components/story/chapters";
import { LenisAnchor } from "@/components/story/LenisAnchor";
import { useLenis } from "@/components/layout/SmoothScroll";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** The thread's end boundary (thread/constants THREAD_TRIGGER_END):
 *  a chapter counts as reviewed once its bottom passes 60% viewport —
 *  the moment its thread segment finishes drawing. */
const REVIEW_BOUNDARY = "clamp(bottom 60%)";

/**
 * The reviewer's check — the same hand as fig 6.1's GateMark, shrunk
 * to tally scale. Decorative (the folio number carries the meaning).
 *
 * @returns A tiny aria-hidden ink stroke
 */
function RailCheck() {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 9" className="h-[8px] w-[10px]">
      <path
        d="M1.3 4.9 C2.8 6.4 3.6 7.1 4.3 6.9 C5.7 5 8.1 2.3 10.8 1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Fixed left-edge chapter rail (xl+ viewports).
 *
 * @returns The rail nav, or nothing below xl (CSS-hidden)
 */
export function ChapterRail() {
  const [active, setActive] = useState(CHAPTERS[0].id);
  const [reviewed, setReviewed] = useState<ReadonlySet<string>>(new Set());
  const lenis = useLenis();

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

  /* Audit-trail triggers — engine world only (A7): the static worlds
     never reach this (their marks are forced visible in CSS), and the
     callbacks ride the ONE existing loop — no new scroll listeners. */
  useEffect(() => {
    if (!lenis) return;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter]")
    );
    if (sections.length === 0) return;

    const ctx = gsap.context(() => {
      for (const section of sections) {
        const id = section.dataset.chapter;
        if (!id) continue;
        ScrollTrigger.create({
          trigger: section,
          start: REVIEW_BOUNDARY,
          onEnter: () =>
            setReviewed((prev) =>
              prev.has(id) ? prev : new Set(prev).add(id)
            ),
          onLeaveBack: () =>
            setReviewed((prev) => {
              if (!prev.has(id)) return prev;
              const next = new Set(prev);
              next.delete(id);
              return next;
            }),
        });
      }
    });

    return () => {
      ctx.revert();
      /* Engine retiring (A7 toggle/teardown): drop the class state — the
         static worlds force every mark visible in CSS, and a remounting
         engine re-fires onEnter for already-passed chapters on refresh. */
      setReviewed(new Set());
    };
  }, [lenis]);

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
                <span
                  aria-hidden="true"
                  className={cn(
                    "rail-mark self-center",
                    reviewed.has(chapter.id) && "is-checked"
                  )}
                >
                  <RailCheck />
                </span>
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
