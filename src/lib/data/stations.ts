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
  /**
   * The waybill that ARRIVES at this stop, on the corridor that reaches it;
   * null where nothing arrives.
   *
   * It used to read "the waybill this stop sends down its corridor", and the
   * inversion is the whole of §6.1. Freight was staged by where it departed,
   * so the waybill painted on a corridor was always the PREVIOUS station's —
   * and a reader has only the heading in front of them, never the one that
   * scrolled away. Measured 2026-08-07: for eleven of twelve waybills the only
   * `¶` kicker on screen while it painted was the station the cargo was not
   * from. Applied's sorted mail was read at ¶05 Cadence.
   *
   * So a station now declares what lands at it, corridor `beat - 1` carries
   * it, and `check-cargo-fixture`'s arrival binding holds the render to this
   * field. Exactly one string per station: `check-stations` parses this file
   * as text and its pattern admits `null` or one quoted string, so a corridor
   * carrying two DECLARED waybills is not expressible without changing that
   * parser. Unlabelled freight may ride with it freely — that is drawing, not
   * declaration.
   */
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
    /* Nothing ARRIVES at the first station — the run begins here, and there is
       no corridor reaching it to carry anything in. The dispatch slip still
       rides the first corridor and still draws; it simply carries no waybill,
       because a waybill names what is being delivered and the slip is the run's
       own paper. `check-cargo-fixture` asserts this null directly: a
       consignment declared on beat 0 is a claim no corridor could satisfy, and
       the corridor-indexed half of that gate would never have looked at it. */
    consignment: null,
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
    /* Re-declared 2026-08-07. This field carried "run 042, reviewed → the
       references" — written in the departure tense, and the one place the
       uniform re-stage could not simply be ported: a post-review artifact
       cannot ARRIVE at the review, because the review has not happened yet.
       What lands here is the day's report, which the run has always carried on
       this corridor and no station ever declared. Declaring it closes that. */
    consignment: "run 042’s report → the review",
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
    consignment: "run 042, reviewed → the references",
    dossier: null,
  },
  {
    beat: 11,
    id: "gate",
    name: "the gate — held",
    kicker: "¶ 12 · the approval gate",
    clock: "22:41",
    /* The line terminates here, and under arrival semantics that note inverts:
       nothing DEPARTS a stop the reader has to sign for — but everything the
       day made arrives at it. What carries in is the recommendations, whose
       address has always named this station: "→ the human gate" is the reader,
       and they are the last words the run hands over before it asks for a
       signature. The unsigned manifest rides in behind them, unnamed, because
       the gate card beside it already says "run 042 — the manifest, complete."
       and a waybill repeating its own destination's title is ceremony. */
    consignment: "two recommendations, carried as written → the human gate",
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

/* No lookup helpers here yet, deliberately. A `STATION_BY_ID` map and a
   `STATIONS_WITH_DOSSIERS` filter were written and taken back out before this
   file was committed: nothing consumed either one, and this file's own 404
   argues that an inert helper is ceremony rather than a fix. Phase 3 builds the
   case files' `⟵ rejoin the line at ¶ NN` and will want the second of those —
   it can add it then, shaped by a caller that exists. */
