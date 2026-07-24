/**
 * @fileoverview DayMark — the running head's day glyph + dateline (brief B8).
 *
 * The masthead's answer to "where am I in the workday?": a small circle
 * of the day that FILLS WITH INK as the reader spends it — ○ at dawn,
 * half-inked by the warm afternoon, ● at nightfall (the brief's
 * ○ → ◐ → ● phase indicator, drawn in the site's own vessel-of-ink
 * vocabulary rather than a moon emoji). Beside it, the working paper's
 * fixed dateline: the active chapter's clock (06:12 … 22:41, the same
 * record the ¶ kickers carry) and, at lg+, the chapter's name — a
 * monograph running head, not a widget.
 *
 * Mechanics (hard contracts):
 *   - Pure presentation: the active chapter arrives as a prop (Header
 *     owns the one IntersectionObserver via useActiveChapter). State
 *     changes only at chapter crossings — zero scroll-time work.
 *   - The ink disc moves by TRANSFORM only (7 discrete translateY steps
 *     in globals.css, `.daymark[data-phase]`), inside a static clipPath,
 *     `contain: paint` on the wrapper. The 600ms glide between steps is
 *     a CSS transition gated by reduced-motion + the quiet toggle; the
 *     static worlds step instantly — the mark itself is truthful STATE
 *     at any scroll position, motion or none (equity requirement).
 *   - `currentColor` everywhere, composed from --header-ink, so the
 *     dusk flip (html[data-arc-phase]) re-inks the glyph for free at
 *     pre-verified AA contrast.
 *   - The visible cluster is aria-hidden; a single sr-only sentence
 *     ("now reading — …") speaks the whole state. No live region: the
 *     mark must never chatter at a screen reader on every crossing.
 */

import type { ChapterMeta } from "@/components/story/chapters";

/** Props for the DayMark running head */
interface DayMarkProps {
  /** The chapter under the reader's eye (from useActiveChapter) */
  chapter: ChapterMeta;
}

/**
 * The day glyph + dateline cluster for the site header.
 *
 * @param props - Component props
 * @returns The running-head cluster (glyph, clock, chapter name)
 */
export function DayMark({ chapter }: DayMarkProps) {
  /* Responsive budget (measured at the static export, not guessed):
     the 320–479px header is already fully spent (avatar + wordmark +
     "the work" + mail + resume leave ~24px at 393, the glyph costs
     ~38), and the md tablet band held only ~20px before this cluster
     existed. So the running head ENTERS at 480px (glyph only) and the
     full dateline (clock · name) joins at lg, where the row can carry
     it; below 480 the ¶ kickers in the page carry the same record. */
  return (
    <span className="hidden items-center gap-2 border-l border-(--header-ink-border) pl-2.5 min-[480px]:flex lg:gap-2.5 lg:pl-3.5">
      <span className="sr-only">
        {`now reading — chapter ${chapter.id}, ${chapter.name}, ${chapter.clock}`}
      </span>
      <span aria-hidden="true" className="flex items-center gap-2 lg:gap-2.5">
        <span
          className="daymark inline-flex text-(--header-ink)"
          data-phase={chapter.id}
        >
          {/* The vessel: a drawn circle (the day) and an ink disc rising
              behind a static clipPath — stroke + fill are currentColor,
              so day ink, dusk cream, and forced-colors all come free. */}
          <svg
            viewBox="0 0 18 18"
            width="15"
            height="15"
            focusable="false"
            aria-hidden="true"
          >
            <defs>
              <clipPath id="daymark-disc">
                <circle cx="9" cy="9" r="6.1" />
              </clipPath>
            </defs>
            <circle
              cx="9"
              cy="9"
              r="6.1"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <g clipPath="url(#daymark-disc)">
              <circle
                className="daymark-fill"
                cx="9"
                cy="9"
                r="6.2"
                fill="currentColor"
              />
            </g>
          </svg>
        </span>
        {/* Keyed by chapter: the dateline re-sets itself like a running
            head on a fresh leaf (340ms rise, motion worlds only). The
            name column reserves the longest chapter name so the nav
            never shifts when the text changes (CLS 0 discipline). */}
        {/* display:none below lg (not width-0): an empty flex item would
            still spend its column gap in the 480–1023px band. */}
        <span
          key={chapter.id}
          className="dateline-swap label-mono hidden items-center gap-2 whitespace-nowrap text-(--header-ink-muted) lg:flex lg:gap-2.5"
        >
          <span>{chapter.clock}</span>
          <span className="inline-block min-w-[12ch] text-(--header-ink)">
            <span className="text-(--header-ink-muted)">·&nbsp;</span>
            {chapter.name}
          </span>
        </span>
      </span>
    </span>
  );
}
