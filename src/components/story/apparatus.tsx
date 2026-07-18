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

/** Total folio count, rendered as `NN / 07` */
const FOLIO_TOTAL = "07";

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
}

/**
 * Mono paragraph kicker: `¶ 02 / 07 · who`, with an optional dateline.
 */
export function ChapterKicker({
  id,
  label,
  dateline,
  dusk = false,
}: ChapterKickerProps) {
  return (
    <div
      className={cn(
        "label-mono flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1",
        mutedClass(dusk)
      )}
    >
      {/* data-thread-kicker: measurement anchor for the Red Thread's
          underline flourish (ThreadSegment.tsx) — geometry only */}
      <p data-thread-kicker>
        ¶ {id} / {FOLIO_TOTAL} · {label}
      </p>
      {dateline ? <p className="hidden sm:block">{dateline}</p> : null}
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
 * moving day-arc background. Hairlines run at 70% ink so the rule holds
 * ~3:1 decorative contrast on every waypoint (the 25% original vanished
 * on golden hour). Folio 05 is the day's TERMINATOR: a slightly heavier
 * line — in the static worlds the background (and the thread's ink)
 * change to nightfall exactly at this rule.
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
  className,
}: PairHeadlineProps) {
  return (
    <div className={className}>
      <Bright className="font-display text-chapter fraunces-display max-w-[22ch]">
        {bright}
      </Bright>
      <p
        className={`mt-[0.35em] max-w-[26ch] font-serif text-[length:var(--text-chapter)] leading-[1.2] tracking-[-0.015em] italic ${mutedClass(dusk)}`}
      >
        {muted}
      </p>
    </div>
  );
}
