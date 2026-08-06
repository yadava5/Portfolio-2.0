/**
 * @fileoverview The thirteen stations of run 042 — the shipped page's own truth.
 *
 * WHY THIS FILE EXISTS. `src/run/index.html` is hand-authored HTML and it is
 * what a visitor gets: `npm run build` copies it over `out/index.html`
 * (scripts/run/build-home.mjs). Everything else that names a station has, until
 * now, named it from `src/components/story/chapters.ts` — a SEVEN-chapter
 * contract belonging to StoryShell, the React home page nobody is served. The
 * 404's wayfinding index bridged the two with a rename map, and on 2026-08-02
 * every link in that index was dead: the run had none of `who`, `path`,
 * `automl`, `work` or `values`, and a hash that matches nothing scrolls to the
 * top of the document without raising anything.
 *
 * Two files claiming to describe the same page, with a translation table
 * between them, is the shape that produced that. This is the one the run
 * agrees with, and `scripts/qa/check-stations.mjs` asserts every string below
 * appears VERBATIM in the run — so drift fails a gate instead of shipping.
 *
 * `chapters.ts` is not deleted: it has fourteen importers, twelve of which are
 * React components this migration deletes wholesale in Phase 4. Rewiring a
 * doomed tree risks moving a shipped page for no reader benefit. It now
 * carries a header saying it is React-only and that this file is the run's
 * truth.
 *
 * WHAT IS DELIBERATELY NOT ONE-TO-ONE, because the seam has to skip these on
 * purpose rather than by accident:
 *
 *   · Two case files have NO station — `policybot` and `visual-assist`. Both
 *     are reached from ¶10's receipts, which is where a claim without a stop
 *     on the line belongs.
 *   · Two stations have NO case file, for different reasons. `jetpack-compress`
 *     has no dossier in the archive at all, so the run hands its member to the
 *     committed benchmark ledger instead. LifeQuest has a dossier's worth of
 *     nothing — the run says so out loud: "no case file — a prototype has
 *     nothing to argue yet."
 *   · Six stops are not projects (the start, who, the yard's school record
 *     aside, the review, the references, the gate, the next morning), and the
 *     yard is a job rather than a project but does file one artifact.
 *
 * The archive's ids are NOT the run's ids, and that is settled: the case files
 * are keyed `jobtracker` / `taskflow-calendar` / `fast-mnist-nn` for stations
 * this page heads "Applied", "Cadence", "Glyph". Borrowing them for fragments
 * would put `#fast-mnist-nn` on a station called Glyph and would still not
 * remove the crosswalk, because beat 03 has shipped `#work` for `jobtracker`
 * since round 1. So the crosswalk lives here, in the data, as a field.
 */

export type Station = {
  /** the `data-beat` index — dense 0..12, and the key every engine table uses */
  readonly beat: number;
  /** the fragment a link uses: `/#<id>`. Verbatim as `id="…"` in the run. */
  readonly id: string;
  /**
   * The run's own name for this stop — `PHASE_NAMES[beat]`, which is what the
   * masthead prints as you pass it. Not the id and not the heading: the id is
   * a URL and the heading is typography, and this is the word the page uses
   * when it has to refer to the stop in a list.
   */
  readonly name: string;
  /** the ¶ line as the station prints it, minus the clock it ends with */
  readonly kicker: string;
  /** hh:mm, as the kicker prints it and as `CLOCKS` derives it */
  readonly clock: string;
  /** the waybill this stop sends down its corridor; null where nothing departs */
  readonly consignment: string | null;
  /** the case file this stop files with — a `caseStudyIds` member, or null */
  readonly dossier: string | null;
};

export const STATIONS: readonly Station[] = [
  {
    beat: 0,
    id: "start",
    name: "the start",
    kicker: "¶ 01 · the start",
    clock: "06:12",
    /* nothing has been produced yet; what travels is the dispatch itself */
    consignment: "run 042 dispatched — operator aboard",
    dossier: null,
  },
  {
    beat: 1,
    id: "who",
    name: "who",
    kicker: "¶ 02 · who",
    clock: "06:58",
    consignment: "the engineer’s credentials → manifest",
    dossier: null,
  },
  {
    beat: 2,
    id: "path",
    name: "the yard",
    kicker: "¶ 03 · the yard",
    clock: "07:52",
    consignment: "five years of logs, given shape → the line",
    /* a job, not a project — but one artifact of it is checked in */
    dossier: "master-inventory",
  },
  {
    beat: 3,
    id: "work",
    name: "applied",
    kicker: "¶ 04 · first station",
    clock: "08:47",
    consignment: "sorted mail → manifest",
    /* `work`, not `jobtracker`: the fragment has shipped since round 1 and a
       live URL is not renamed to tidy a table. This is the crosswalk. */
    dossier: "jobtracker",
  },
  {
    beat: 4,
    id: "cadence",
    name: "cadence",
    kicker: "¶ 05 · second station",
    clock: "12:06",
    consignment: "the committed plan → manifest",
    dossier: "taskflow-calendar",
  },
  {
    beat: 5,
    id: "glyph",
    name: "glyph",
    kicker: "¶ 06 · third station",
    clock: "15:23",
    /* the run's only consignment that is a function of state: it reads
       `your "<digit>", read locally → manifest` once the classifier has
       returned one. This is the branch a page with no sample prints, which
       is the one a still, a fixture and an arrival slip can all rely on. */
    consignment: "a blank 28×28 — the run wants your hand",
    dossier: "fast-mnist-nn",
  },
  {
    beat: 6,
    id: "jetpack-compress",
    name: "jetpack-compress",
    kicker: "¶ 07 · fourth station",
    clock: "19:36",
    consignment: "one valid gzip member → manifest",
    /* no dossier in the archive at all — the station hands its member to the
       committed benchmark ledger instead. Not the same as LifeQuest below. */
    dossier: null,
  },
  {
    beat: 7,
    id: "lifequest",
    name: "lifequest — dusk",
    kicker: "¶ 08 · fifth station · the honest hour",
    clock: "21:07",
    consignment: "lifequest’s unfinished rows, carried unchanged",
    /* "no case file — a prototype has nothing to argue yet", in the run's own
       words. The absence is the argument; do not fill it in. */
    dossier: null,
  },
  {
    beat: 8,
    id: "automl",
    name: "agentic automl",
    kicker: "¶ 09 · sixth station · the last",
    clock: "22:05",
    consignment: "automl’s halted run → manifest",
    dossier: "automl",
  },
  {
    beat: 9,
    id: "review",
    name: "the review",
    kicker: "¶ 10 · the review",
    clock: "22:23",
    consignment: "run 042, reviewed → the references",
    /* four case files are linked FROM this stop, as ¶10's receipts. None of
       them is this stop's own, which is why this is null and not a list. */
    dossier: null,
  },
  {
    beat: 10,
    id: "cosigners",
    name: "the references",
    kicker: "¶ 11 · the references",
    clock: "22:32",
    consignment: "two recommendations, carried as written → the human gate",
    dossier: null,
  },
  {
    beat: 11,
    id: "gate",
    name: "the gate — held",
    kicker: "¶ 12 · the approval gate",
    clock: "22:41",
    /* the line terminates here. Nothing departs a stop the reader has to
       sign for, which is the whole argument of the page. */
    consignment: null,
    dossier: null,
  },
  {
    beat: 12,
    id: "nextmorning",
    name: "the next morning",
    kicker: "¶ 13 · the next morning",
    /* the same clock as ¶01 and deliberately so — this is the morning after
       run 042, not a thirteenth hour of it. `CLOCKS` carries 1812 minutes
       (30:12) so the arc keeps climbing; the page prints 06:12. */
    clock: "06:12",
    consignment: null,
    dossier: null,
  },
];

/** The run's stops, by fragment. */
export const STATION_BY_ID = new Map(STATIONS.map((s) => [s.id, s]));

/** The stops a case file can send a reader back to, in run order. */
export const STATIONS_WITH_DOSSIERS = STATIONS.filter(
  (s) => s.dossier !== null
);
