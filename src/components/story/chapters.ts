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
  /**
   * The dateline clock (W2): the paper's FIXED record of one workday,
   * dawn to nightfall, matched to each chapter's day-arc waypoint light
   * (dawn 06:12 → morning → noon → warm afternoon → golden hour → dusk
   * → nightfall 22:41). Rendered mono in the ¶ kicker. These are the
   * record, not the reader's time — the gate's LocalTime stays live.
   */
  clock: string;
}

/** The seven chapters, in storyboard order (plan 3.6) */
export const CHAPTERS: readonly ChapterMeta[] = [
  { id: "01", anchor: "arrival", name: "arrival", clock: "06:12" },
  { id: "02", anchor: "who", name: "who", clock: "08:47" },
  { id: "03", anchor: "path", name: "the path", clock: "12:06" },
  { id: "04", anchor: "automl", name: "automl", clock: "15:23" },
  { id: "05", anchor: "work", name: "the work", clock: "19:36" },
  { id: "06", anchor: "values", name: "how i work", clock: "21:07" },
  { id: "07", anchor: "gate", name: "the gate", clock: "22:41" },
];

/** Chapters at or past the dusk flip carry dusk ink (plan 3.4) */
export function isDuskChapter(id: string): boolean {
  return id >= "06";
}
