/**
 * @fileoverview Working-paper apparatus — kickers, folio rules, pair lines.
 *
 * The print furniture every chapter shares (DECISION.md §1: ¶ kickers,
 * folios NN/07, datelines, bright/muted headline pairs). Server components,
 * static paint only.
 *
 * Color discipline: day chapters use the verified secondary-ink token;
 * chapters that sit past the dusk flip (06/07) inherit the body ink —
 * which DayArc steps at the boundary — and mute via opacity ≥70% so the
 * apparatus holds AA against both the day and dusk waypoints (A4).
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CHAPTERS } from "@/components/story/chapters";

/** Total folio count, rendered as `NN / 07` */
const FOLIO_TOTAL = "07";

/** The chapter's fixed dateline clock (W2) — the paper's workday record */
function chapterClock(id: string): string | undefined {
  return CHAPTERS.find((chapter) => chapter.id === id)?.clock;
}

/** Muted-text class for a chapter: token ink by day, opacity past dusk */
export function mutedClass(dusk: boolean): string {
  return dusk ? "opacity-70" : "text-ink-secondary";
}

interface ChapterKickerProps {
  /** Two-digit chapter id ("01"–"07") */
  id: string;
  /** Kicker label, lowercase ("who", "the flagship — reviewed spring 2026") */
  label: string;
  /** Optional right-aligned dateline (hidden on small screens) */
  dateline?: string;
  /** Dusk ink handling for chapters past the flip */
  dusk?: boolean;
  /**
   * Entrance grammar (the Seam, stage 1): how the running head ARRIVES.
   *   - "lead"    — joins the chapter's FIRST composed scene as slot 0
   *     (`data-tm-lead`): the head prints, then the scene cascades
   *     behind it off the same trigger — one authored entrance, never
   *     two pops (PREMIUM-FLOW #1 extended to the whole chapter head).
   *   - "solo"    — its own once-trigger (`data-tm` only). For chapters
   *     whose first scene sits too far below the head to share a cue:
   *     ch02 (the scrubbed manifesto intervenes) and ch06 (deliberately
   *     unwrapped — the litany's coordinated timing is scar tissue).
   *   - "printed" — no entrance hook at all. The masthead's running
   *     head (ch01) is already on the page when it opens; the hero's
   *     CSS entrance is the arrival choreography there. The DEFAULT,
   *     because it is the component's own pre-stage behavior: a caller
   *     that says nothing gets the static running head it always had.
   * Every mode is OPACITY-ONLY by vocabulary (`data-tm="kicker"`):
   * [data-thread-kicker]'s box is the Red Thread's flourish anchor and
   * must never transform, mid-entrance included.
   */
  arrive?: "lead" | "solo" | "printed";
}

/**
 * Mono paragraph kicker: `¶ 02 / 07 · who`, with an optional dateline.
 *
 * W2 dateline clocks: every home kicker closes on the chapter's fixed
 * clock from the CHAPTERS contract (`· 08:47`) — seven times of one
 * workday, dawn 06:12 to nightfall 22:41, matched to the waypoint
 * light. The scroll reads as a single day's record; only the gate's
 * LocalTime is the reader's now.
 *
 * FOLIO SEAT (fix round 6). The dateline is a FOLIO: it is a folio
 * because of where it sits, and where it sits is flush right. The row is
 * `flex-wrap` + `justify-between`, and `justify-between` places a single
 * item on a line at flex-START — so at every width where both halves did
 * not fit on one line, the folio wrapped onto its own line and printed
 * flush LEFT. Swept 320 → 900 in 20px steps: hidden below 640 (it is a
 * `sm` element), flush left 640 → 760, flush right only from 780 up.
 * `folio-seat` is the whole fix: an auto inline-start margin eats the
 * free space on the folio's own line, so a wrapped folio is
 * right-aligned; where both halves share a line the auto margin and
 * `justify-between` resolve to the same seat, so nothing at 780+ moves
 * by a pixel. Fix round 7 gave that margin a NAME and one explanation
 * (globals.css → THE ORPHANED FOLIO) after the same construct produced
 * a third fault in a third file, and swept the repo for the rest; this
 * call site reads `folio-seat` so a grep finds every one of them.
 *
 * The kicker's own box is UNTOUCHED — no `w-full`, no grid. The Red
 * Thread reads `[data-thread-kicker]`'s box to place its underline
 * flourish (ThreadSegment.tsx → geometry.ts), so widening that box to
 * the column would move the flourish on every chapter. The auto margin
 * is paint-neutral for the kicker: it changes only the folio's own
 * line.
 *
 * ONE band still sets the ch01 kicker on two lines and is left alone,
 * measured: at 640 exactly, `sm:px-12` doubles WRAP's gutter and the
 * content box DROPS from 580 to 544 while that kicker needs ~556 — the
 * paper gets narrower as the screen gets wider. It is 12px, it belongs
 * to WRAP rather than to the kicker, and `.label-mono` already carries
 * `text-wrap: pretty` (globals.css), which is the house's rule for
 * exactly this and is why the two lines do not end in an orphan. Adding
 * `text-balance` here was tried and reverted: it changed no measured
 * line count at any of the 30 swept widths, and it would have overridden
 * the mono voice's own wrap policy on one element for nothing.
 */
export function ChapterKicker({
  id,
  label,
  dateline,
  dusk = false,
  arrive = "printed",
}: ChapterKickerProps) {
  const clock = chapterClock(id);
  return (
    <div
      data-tm={arrive === "printed" ? undefined : "kicker"}
      data-tm-lead={arrive === "lead" ? "" : undefined}
      className={cn(
        "label-mono flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1",
        mutedClass(dusk)
      )}
    >
      {/* data-thread-kicker: measurement anchor for the Red Thread's
          underline flourish (ThreadSegment.tsx) — geometry only */}
      <p data-thread-kicker>
        ¶ {id} / {FOLIO_TOTAL} · {label}
        {/* The clock never leaves the line its chapter name ends on
            (fix round 6). Shot at 640, the ch01 running head set
            `…on what i’ve built` / `· 06:12` — the dateline clock alone
            on a line, which reads as a stray rather than as the end of
            the kicker. Both spaces around the separator are NO-BREAK, so
            `built · 06:12` is one run and the wrap lands a word earlier.
            13 characters, so it fits the 260px content box at 320 with
            room; `.label-mono`'s `text-wrap: pretty` handles the rest. */}
        {clock ? ` · ${clock}` : ""}
      </p>
      {dateline ? (
        <p data-kicker-folio className="folio-seat hidden sm:block">
          {dateline}
        </p>
      ) : null}
    </div>
  );
}

interface FolioRuleProps {
  /** Two-digit chapter id ("01"–"07") */
  id: string;
  /** Dusk ink handling for chapters past the flip */
  dusk?: boolean;
}

/**
 * Folio rule closing a chapter: hairline — `NN / 07` — hairline.
 * Built from flex hairlines (not a masked span) so it sits cleanly on the
 * moving day-arc background. The rule holds ~3:1 decorative contrast on
 * every waypoint (the 25% original vanished on golden hour) — MEASURED
 * across all seven folios: 3.32 / 3.36 / 3.31 / 3.23 / 3.79 / 3.72 /
 * 4.26, worst case 3.23:1 at folio 04.
 *
 * The ink alpha that produces it is NOT a single 70% (CRITIC-LEDGER
 * F82, which read the header as claiming so). The hairline's own
 * `opacity-70` composes with whatever the enclosing `mutedClass` sets:
 * in the day register that is a COLOUR (`text-ink-secondary`, no
 * opacity) so the composed alpha is 0.70, while past the dusk flip it
 * is `opacity-70`, so the two multiply to 0.49. Both land above 3:1
 * because the dusk ink is a cream on a dark ground and buys back what
 * the second multiply costs. Re-measure with
 * docs/design-lab/probe-w4claims.mjs before changing either opacity.
 *
 * Folio 05 is the day's TERMINATOR: a slightly heavier line at 0.80 —
 * in the static worlds the background (and the thread's ink) change to
 * nightfall exactly at this rule.
 *
 * `data-thread-folio` is the Red Thread's measurement anchor for that
 * seam (ThreadSegment 05 splits its nightfall dip here) — geometry only.
 */
export function FolioRule({ id, dusk = false }: FolioRuleProps) {
  const terminator = id === "05";
  return (
    <div
      aria-hidden="true"
      data-thread-folio
      data-folio-terminator={terminator ? "" : undefined}
      className={cn("folio-rule flex items-center gap-4", mutedClass(dusk))}
    >
      <span
        className={cn(
          "flex-1 bg-current",
          terminator ? "h-0.5 opacity-80" : "h-px opacity-70"
        )}
      />
      <span className="label-mono tracking-[0.22em]">
        {id} / {FOLIO_TOTAL}
      </span>
      <span
        className={cn(
          "flex-1 bg-current",
          terminator ? "h-0.5 opacity-80" : "h-px opacity-70"
        )}
      />
    </div>
  );
}

interface PairHeadlineProps {
  /** Bright action line (Fraunces) */
  bright: ReactNode;
  /** Muted consequence line (Newsreader italic, same size — plan 3.5) */
  muted: ReactNode;
  /** Render the bright line as this heading level (default h2) */
  as?: "h2" | "p";
  /** Dusk ink handling for chapters past the flip */
  dusk?: boolean;
  /**
   * Text-motion grammar (plan 3.8, wired by TextMotion.tsx):
   *   - "headline" (default) — bright takes the line-mask rise (+ the
   *     Fraunces weight breathing), muted the 200ms-later fade-rise.
   *   - "manifesto" — the ch-02 deck pair: both lines split to words for
   *     the page's ONE scrubbed text (opacity 0.25→1).
   * All attributes are inert data hooks: static worlds render untouched.
   */
  motion?: "headline" | "manifesto";
  /**
   * Constrain the muted line's entrance to opacity only (no 10px rise).
   * Required when the muted line carries a Red Thread geometry anchor
   * ([data-thread-word] in ch 03): the thread measures that box, and a
   * transformed ancestor would corrupt any re-measure mid-entrance.
   */
  mutedFadeOnly?: boolean;
  /**
   * Mark this pair as its own composed scene (PREMIUM-FLOW #1): stamps
   * `data-tm-scene` on the root so TextMotion reveals the bright + muted
   * lines off ONE shared trigger, staggered, instead of two independent
   * pops. Used where the headline pair is a standalone chapter header
   * (ch 03); chapters whose pair sits inside a larger scene wrapper (ch
   * 04) leave this off so the wrapper owns the whole beat.
   */
  scene?: boolean;
  className?: string;
}

/**
 * Chapter headline pair: bright Fraunces line + muted Newsreader-italic
 * line at the same size (plan 3.10 copy deck, AUTOML-TRANSPOSITIONS #2).
 *
 * Measures are set per line (ch of the line's own size), and the muted
 * line's size is composed from the raw `--text-chapter` token rather than
 * the `text-chapter` utility: tailwind-merge would treat `text-chapter` +
 * `text-ink-secondary` as one conflicting `text-*` group and drop the
 * size. The token keeps Newsreader at its loaded 400 weight.
 */
export function PairHeadline({
  bright,
  muted,
  as: Bright = "h2",
  dusk = false,
  motion = "headline",
  mutedFadeOnly = false,
  scene = false,
  className,
}: PairHeadlineProps) {
  const manifesto = motion === "manifesto";
  return (
    <div className={className} data-tm-scene={scene ? "" : undefined}>
      {/* data-tier-garnish (FABLE brief §F1a): the chapter bright takes
          the full-tier letterpress press — a 1px settle + same-color ink
          bleed under the cursor. Pure garnish on a rail that styles
          nothing outside html[data-tier="full"], so every other tier
          renders this attribute inert. The manifesto is excluded: its
          words are the page's one scrubbed text and already answer the
          reader's hand through scroll. The hover target is the heading
          ROOT — TextMotion tweens the SplitText lines inside it, never
          the root, so no inline transform ever fights the press. */}
      <Bright
        className="font-display text-chapter fraunces-display max-w-[22ch]"
        data-tm-bright={manifesto ? undefined : "lines"}
        data-tm-words={manifesto ? "" : undefined}
        data-breathe={manifesto ? undefined : ""}
        data-tier-garnish={manifesto ? undefined : "press"}
      >
        {bright}
      </Bright>
      {/* Split targets must never be <p> elements directly: SplitText's
          aria-label is prohibited on paragraph roles (axe
          aria-prohibited-attr). The manifesto muted line therefore
          splits an aria-hidden inner span with an sr-only twin — the
          screen-reader string stays single and intact in every world. */}
      {/* CRITIC-LEDGER F35 — hierarchy inversion in every bright/muted
          pair. Both lines set at --text-chapter, but the muted line runs
          longer (26ch vs 22ch), sets in Newsreader ITALIC with swashes,
          and takes two or three lines where the bright takes one. So the
          subordinate line was physically larger, longer and more
          decorated than the line it is subordinate to: at ¶02 the bright
          was one 64px Fraunces line against two 64px italic ones; at ¶04
          it was two against three.
          0.82 is the ledger's own ≈0.8× step, applied to the token
          rather than to a hand-rolled size, so the pair keeps ONE source
          of truth and the muted line reads as the echo it is. */}
      <p
        className={`mt-[0.35em] max-w-[26ch] font-serif text-[length:calc(var(--text-chapter)*0.82)] leading-[1.2] tracking-[-0.015em] italic ${mutedClass(dusk)}`}
        data-tm={manifesto ? undefined : mutedFadeOnly ? "muted-fade" : "muted"}
      >
        {manifesto ? (
          <>
            <span className="sr-only">{muted}</span>
            <span aria-hidden="true" className="block" data-tm-words="">
              {muted}
            </span>
          </>
        ) : (
          muted
        )}
      </p>
    </div>
  );
}
