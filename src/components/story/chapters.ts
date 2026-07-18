/**
 * @fileoverview Chapter metadata — the seven-chapter contract.
 *
 * Single source of truth for chapter ids, anchors, and rail names, shared
 * by StoryShell (sections), ChapterRail (wayfinding), and the folio
 * apparatus. The two-digit `id` is the DayArc waypoint contract
 * (`data-chapter="01"`–`"07"`); `anchor` is the stable in-page id used by
 * the header nav, the rail, and deep links.
 */

/** One chapter of the working paper */
export interface ChapterMeta {
  /** Two-digit day-arc id ("01"–"07") — the DayArc/waypoint contract */
  id: string;
  /** Stable section id for anchors (#arrival … #gate) */
  anchor: string;
  /** Lowercase rail/kicker name */
  name: string;
}

/** The seven chapters, in storyboard order (plan 3.6) */
export const CHAPTERS: readonly ChapterMeta[] = [
  { id: "01", anchor: "arrival", name: "arrival" },
  { id: "02", anchor: "who", name: "who" },
  { id: "03", anchor: "path", name: "the path" },
  { id: "04", anchor: "automl", name: "automl" },
  { id: "05", anchor: "work", name: "the work" },
  { id: "06", anchor: "values", name: "how i work" },
  { id: "07", anchor: "gate", name: "the gate" },
];

/** Chapters at or past the dusk flip carry dusk ink (plan 3.4) */
export function isDuskChapter(id: string): boolean {
  return id >= "06";
}
