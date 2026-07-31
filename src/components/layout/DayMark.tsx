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

import { RUN_NO } from "@/components/story/chapters";
import type { ChapterMeta } from "@/components/story/chapters";
import { RunClock } from "@/components/layout/RunClock";

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
        {`run ${RUN_NO} — now reading chapter ${chapter.id}, ${chapter.name}, ${chapter.clock}`}
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
        {/* THE RUN STATE (round 12, Stage C) — and an override of
            CRITIC-LEDGER F30/F28, on the record. F30 removed the lg+
            dateline here as a triplicate of the ¶ kicker and the rail;
            F28 objected that the fictional workday clock sat unlabelled
            beside the gate's REAL local time. The owner then asked,
            four times, for the prototype's running head — run id ·
            advancing clock · current station — so the dateline returns
            in the prototype's own form, which also answers F28: the
            `run 041 ·` prefix names the record as the RUN's, not the
            reader's (the ¶07 gate line even says so: "the ¶ clocks are
            the day this paper records"). The clock now ADVANCES with
            scroll (RunClock — minute-by-minute between kicker
            datelines, the reading line's own position), so it is no
            longer the kicker's duplicate: the kicker says when a
            chapter IS, this says where in the day the reader STANDS.
            At xl+ where the row has the width — measured, not guessed:
            the cluster sets at 217px and the 1024 row holds 148px of
            slack (content 928, children 756 + gaps), so at lg it
            wraps; at 1280 the row carries it on one 24px line. */}
        <span className="label-mono hidden whitespace-nowrap text-(--header-ink-muted) xl:inline">
          run {RUN_NO} · <RunClock chapter={chapter} /> · {chapter.name}
        </span>
      </span>
    </span>
  );
}
