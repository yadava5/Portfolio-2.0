/**
 * @fileoverview useActiveChapter — which chapter is under the reader's eye.
 *
 * The same wayfinding contract ChapterRail uses: an IntersectionObserver
 * whose root margin collapses the viewport to its horizontal center line,
 * so the `[data-chapter]` section under the middle of the screen is the
 * active one. This is STATE, not motion — the observer runs in every
 * world (motion, reduced-motion, quiet-toggle off), exactly like the
 * rail's active folio, so a static-world reader's chrome still tells the
 * truth at any scroll position (equity requirement). It fires only at
 * section crossings: no scroll listeners, no per-frame work, nothing on
 * the one scroll loop (amendment A1).
 *
 * Consumers: Header (the running-head day mark + the section-aware nav
 * underline). Returns null when the surface has no chapters (case files,
 * /evidence, 404) so the chrome can hide the day mark honestly instead
 * of asserting "dawn" on a page where no day passes.
 */

"use client";

import { useEffect, useState } from "react";
import { CHAPTERS } from "@/components/story/chapters";
import type { ChapterMeta } from "@/components/story/chapters";

/**
 * Track the chapter currently under the viewport's center line.
 *
 * @param enabled - Whether this surface carries the day arc at all
 *   (`false` renders the hook inert and returns null — archive routes).
 * @returns The active chapter's metadata, or null when disabled or when
 *   the page has no `[data-chapter]` sections.
 */
export function useActiveChapter(enabled: boolean): ChapterMeta | null {
  /* SSR default: the first chapter (dawn). The home page prerenders the
     running head in its truthful top-of-page state; the observer corrects
     it immediately for deep links once it attaches. */
  const [activeId, setActiveId] = useState<string>(CHAPTERS[0].id);
  const [chapterless, setChapterless] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter]")
    );
    if (sections.length === 0) {
      /* No day passes here — hide the mark rather than freeze a lie.
         (Defensive: `enabled` is only true on the story surface, which
         always carries chapters.) */
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChapterless(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.chapter;
          if (id) setActiveId(id);
        }
      },
      /* Collapse the root to the viewport's horizontal center line */
      { rootMargin: "-50% 0px -50% 0px" }
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled || chapterless) return null;
  return CHAPTERS.find((chapter) => chapter.id === activeId) ?? null;
}
