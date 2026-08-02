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
  /* `values` stays. It is this array's contract with StoryShell, which
     renders `id={VALUES.anchor}` — and the browser smoke builds StoryShell
     (`next build` alone, without build-home.mjs) and asserts `#values` is
     attached. Renaming it here to match the run broke that, which is how
     the 2026-08-02 audit learned the two home pages disagree on anchor
     vocabulary rather than merely on content.

     The 404 links against the SHIPPED page, which is the run, so it maps
     this one name across in `not-found.tsx` instead. Four of its five
     siblings needed no map: the run now carries `who`, `path`, `work` and
     `automl` as real section ids. */
  { id: "06", anchor: "values", name: "how i work", clock: "21:07" },
  { id: "07", anchor: "gate", name: "the gate", clock: "22:41" },
];

/** Chapters at or past the dusk flip carry dusk ink (plan 3.4) */
export function isDuskChapter(id: string): boolean {
  return id >= "06";
}

/**
 * The run this paper IS (round 12, Stage C — the running head and the
 * corner manifest name it). One number, one source: fig 4.1's registry
 * shows run 041 awaiting approval and the gate stamp signs the same
 * run — red-thread.spec.ts asserts the stamp⇄registry agreement, and
 * this constant is how the chrome joins it without a third hand-typed
 * copy (the F69 lesson).
 */
export const RUN_NO = "041";

/**
 * A chapter dateline as minutes since midnight — the interpolation
 * space for the running head's clock (the prototype's own trick: tween
 * minutes between station stops, render on minute change only).
 *
 * @param clock - A CHAPTERS dateline ("06:12" … "22:41")
 * @returns Minutes since midnight
 */
export function clockMinutes(clock: string): number {
  const [h, m] = clock.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Minutes back to the dateline form the kickers use.
 *
 * @param minutes - Minutes since midnight
 * @returns "HH:MM"
 */
export function minutesClock(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
