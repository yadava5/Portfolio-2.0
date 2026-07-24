/**
 * @fileoverview The visited ✓ — the paper remembers which files you read.
 *
 * W1 (Refinement Era, "the paper remembers"): a small ink check in the
 * rail-check hand (ChapterRail's RailCheck, tally scale) that appears —
 * `[data-visited]`, ≤300ms opacity, instant in static worlds — beside
 * any reference to a case file the visitor has opened: home #work rows,
 * the "also on file" index, and the /evidence receipt crosswalk.
 *
 * The span is ALWAYS in the layout (fixed inline width) so the mark's
 * arrival never shifts a letterform; it is decorative (aria-hidden) —
 * first-person reading history, never navigation state. Neutral on the
 * server and at hydration; storage applies in an effect (paperMemory).
 */

"use client";

import { useVisitedFiles } from "@/lib/paperMemory";

interface VisitedMarkProps {
  /** Case-file project id this mark remembers ("automl", "jobtracker" …) */
  fileId: string;
  /**
   * Optional native tooltip, applied only once the mark is inked. Used on
   * /evidence to disambiguate this reading-history ✓ from a verification
   * tick where the two sit close — a purely perceptual clarification that
   * changes no count and no claim (item 5). Omitted elsewhere.
   */
  title?: string;
}

/**
 * A reserved-width inline slot that inks a small ✓ once its case file
 * has been opened.
 *
 * @param props - The case-file id and an optional visited-only tooltip
 * @returns The (aria-hidden) mark slot
 */
export function VisitedMark({ fileId, title }: VisitedMarkProps) {
  const visited = useVisitedFiles();
  const isVisited = visited.has(fileId);
  return (
    <span
      aria-hidden="true"
      className="visited-mark"
      data-visited={isVisited ? "" : undefined}
      title={isVisited ? title : undefined}
    >
      <svg viewBox="0 0 12 9" className="h-[8px] w-[10px]">
        <path
          d="M1.3 4.9 C2.8 6.4 3.6 7.1 4.3 6.9 C5.7 5 8.1 2.3 10.8 1.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
