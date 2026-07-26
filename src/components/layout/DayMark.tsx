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
 *     chrome's dusk step (html[data-arc-chrome]) re-inks the glyph for
 *     free at pre-verified AA contrast.
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
    <span
      data-day-mark
      className="hidden items-center gap-2 border-l border-(--header-ink-border) pl-2.5 min-[480px]:flex lg:gap-2.5 lg:pl-3.5"
    >
      <span className="sr-only">
        {`now reading — chapter ${chapter.id}, ${chapter.name}, ${chapter.clock}`}
      </span>
      {/* N6 (fix round 3): below `lg` the cluster is a filling circle and
          nothing else, and a sighted pointer reader had no way to learn
          what it counts — the sentence that explains it was sr-only. The
          `title` hands the same sentence to a hover. It sits on the
          aria-hidden half deliberately: assistive tech skips this subtree
          entirely and keeps hearing the sr-only line above, so the
          accessible name is untouched and nothing is announced twice. */}
      <span
        aria-hidden="true"
        title={`now reading — chapter ${chapter.id}, ${chapter.name}, ${chapter.clock}`}
        className="flex items-center gap-2 lg:gap-2.5"
      >
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
        {/* THE DATELINE IS GONE (CRITIC-LEDGER F30 + F28).
            It used to print the active chapter's clock and name here, at
            lg+. Measured in the top 170px of the first frame, that made
            "arrival" appear THREE times — running head, ¶ kicker, and
            the chapter rail — and "06:12" twice, running head and
            kicker, saying the same sentence within a hand's width of
            each other.
            Worse (F28): the header clock is the paper's FICTIONAL
            workday record, and three lines below it in ¶07 the gate
            prints the reader's REAL local time. A reader had no way to
            tell which of the two clocks was the fiction. The ledger's
            own remedy is to "drop it from the header and leave it to the
            ¶ kickers", which is what this does — the kickers carry the
            record, in the page, where the dateline grammar explains it.
            What stays is the part that was never a duplicate: the ink
            disc, the one surface that answers "where am I in the
            workday" while the kickers are scrolled away. The sr-only
            sentence above still speaks chapter, name and clock in full,
            so nothing is lost from the accessibility tree. */}
      </span>
    </span>
  );
}
