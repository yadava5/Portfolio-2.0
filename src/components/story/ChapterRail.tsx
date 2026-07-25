/**
 * @fileoverview ChapterRail — left-edge wayfinding, `01…07` (plan 3.6).
 *
 * Mono lowercase folio numbers at the left edge, xl+ only. The active
 * chapter keeps its name inked; every other chapter reveals its name on
 * hover AND keyboard focus (W5, recruiter: "the rail is bare numbers").
 * Labels are PLAIN mono text seated absolutely in the binding margin —
 * no box, no track, no capsule, no glow (NO-LIST §C bans hover label
 * BOXES; unboxed apparatus text is the rail's own voice) — and take no
 * layout, so the folio column and its audit-trail marks never move.
 * Every anchor carries an explicit "chapter NN — name" aria-label.
 * Clicks route through the shared Lenis loop.
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
import { useVisitedFiles } from "@/lib/paperMemory";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** The thread's end boundary (thread/constants THREAD_TRIGGER_END):
 *  a chapter counts as reviewed once its bottom passes 60% viewport —
 *  the moment its thread segment finishes drawing. */
const REVIEW_BOUNDARY = "clamp(bottom 60%)";

/** The paper remembers (W1): chapters that ARE a case file keep their
 *  mark once that file has been opened — the reader's journey joins
 *  the audit trail, persisted across sessions ([data-visited]). Only
 *  the flagship chapter maps 1:1 onto a dossier. */
const CHAPTER_CASE_FILES: Record<string, string> = { "04": "automl" };

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
  const visitedFiles = useVisitedFiles();

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

  /* THE STATIC WORLD'S OWN AUDIT TRAIL (CRITIC-LEDGER F14).
     The marks used to be forced visible by CSS wherever the engine was
     absent, so a reduced-motion or motion-off reader sitting in chapter
     04 saw `01✓ 02✓ 03✓ 04✓ 05✓ 06✓ 07✓` — the rail told them they had
     read the whole paper, including three chapters below the fold. A
     "visited" mark that is always true is not a mark.
     This observer earns them instead, on the SAME boundary the engine
     uses (a chapter's bottom passing 60% of the viewport) expressed as
     a rootMargin, and it is MONOTONE — it only ever adds. That is the
     honest static-world reading: the engine world can retreat its marks
     because it scrubs a timeline, but a static reader who has passed a
     chapter has passed it. No scroll listener, no rAF: one
     IntersectionObserver, the same primitive the active-chapter state
     already uses (PERF-AUDIT — nothing new on the scroll path).
     It runs ONLY when there is no engine, so the two systems can never
     both drive the set. */
  useEffect(() => {
    if (lenis) return; /* the engine world owns the marks below */
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-chapter]")
    );
    if (sections.length === 0) return;

    /* The observer is the CUE, not the measurement. An entry's
       boundingClientRect is a snapshot from the moment the change was
       recorded, and a long jump (a hash landing, a scrollbar drag,
       end-key) coalesces intermediate states — probed, that left
       chapters 02 and 05 unmarked after a jump to the foot of the page.
       So each callback re-reads the live geometry of all seven
       sections: seven getBoundingClientRect calls on an already-
       throttled callback, and it can never miss a chapter. */
    const sweep = () => {
      const boundary = window.innerHeight * 0.6;
      /* Mirrors the engine boundary's `clamp(...)`: the last chapter's
         bottom can never reach 60% of the viewport because the document
         stops there, so a reader at the foot of the page has finished it
         by definition. Without this the static rail stalled one mark
         short of the engine rail at the same scroll position. */
      const atEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;
      const passed = sections
        .filter(
          (section) =>
            atEnd || section.getBoundingClientRect().bottom <= boundary
        )
        .map((section) => section.dataset.chapter)
        .filter((id): id is string => Boolean(id));
      if (passed.length === 0) return;
      setReviewed((prev) => {
        if (passed.every((id) => prev.has(id))) return prev;
        const next = new Set(prev);
        for (const id of passed) next.add(id);
        return next;
      });
    };

    const observer = new IntersectionObserver(sweep, {
      rootMargin: "0px 0px -60% 0px",
    });
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [lenis]);

  /* Audit-trail triggers — engine world only (A7): the callbacks ride
     the ONE existing loop — no new scroll listeners. */
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
          const caseFile = CHAPTER_CASE_FILES[chapter.id];
          const visited = caseFile ? visitedFiles.has(caseFile) : false;
          return (
            <li key={chapter.id}>
              <LenisAnchor
                href={`#${chapter.anchor}`}
                aria-current={isActive ? "true" : undefined}
                aria-label={`chapter ${chapter.id} — ${chapter.name}`}
                className={cn(
                  "label-mono rail-link relative flex items-baseline gap-1.5 transition-opacity duration-300",
                  isActive ? "" : "opacity-70 hover:opacity-100"
                )}
              >
                <span>{chapter.id}</span>
                <span
                  aria-hidden="true"
                  data-visited={visited ? "" : undefined}
                  className={cn(
                    "rail-mark self-center",
                    reviewed.has(chapter.id) && "is-checked"
                  )}
                >
                  <RailCheck />
                </span>
                {/* The name, revealed on hover/focus (active stays inked).
                    Absolutely seated so numbers and marks never move;
                    aria-hidden — the anchor's aria-label already speaks
                    the full "chapter NN — name". */}
                <span aria-hidden="true" className="rail-label">
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
