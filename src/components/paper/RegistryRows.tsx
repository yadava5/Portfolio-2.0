/**
 * @fileoverview The stampable registry rows — run 041, approvable inline.
 *
 * W1 (Refinement Era): the "041 · xgboost — awaiting approval" row in
 * the experiment-registry figures (home fig 4.1 + the automl case-file
 * fig 3) is the SAME run the gate stamp awaits, so it is approvable in
 * place: one press strikes "awaiting approval" through and inks a small
 * approved mark under the line — a margin note, not a firework. The act
 * is one-time and persisted (paperMemory); approving EITHER surface
 * approves the run everywhere.
 *
 * The status stays a real `<button>` in both states (a control that
 * unmounted mid-press would drop keyboard focus on the floor):
 * `aria-pressed` carries the state, Enter/Space activate natively, and
 * the pressed button simply no-ops. The mark itself is decorative
 * (aria-hidden) — the button's pressed state is the accessible truth.
 *
 * Color discipline (amendment A4): the mark's word is body ink; the
 * clay is the little gate-square — the site's one recurring glyph —
 * because clay-graphic holds ≥3:1 on every surface this figure sits on
 * (check-contrast.mjs pairs), while clay TEXT cannot hold 4.5:1 on
 * golden hour mid-scrub. Already-approved rows render exactly as the
 * original static figure did.
 */

"use client";

import { useRunApproval } from "@/lib/paperMemory";

/** One transcription row of the experiment registry */
export interface RegistryRow {
  run: string;
  model: string;
  status: string;
}

interface RegistryRowsProps {
  rows: RegistryRow[];
}

/**
 * The registry figure's rows (header row + transcription), with the
 * awaiting run rendered as the press-to-approve control.
 *
 * @param props - The transcription rows
 * @returns The `<li>` run — mount inside the figure's `<ul>`
 */
export function RegistryRows({ rows }: RegistryRowsProps) {
  const { approval, approve } = useRunApproval();
  const approved = approval !== null;

  return (
    <>
      {/* THE METRIC COLUMN (CRITIC-LEDGER F21/F56).
          The figure used to be two cells — `run · model` and `status` —
          so the visitor was invited to exercise the site's whole thesis,
          the human go/no-go, on a row with NO data column at all. The
          caption said metrics were withheld; the table showed no place
          they could have gone, so a reader could not see WHAT was being
          withheld, only that something was.
          The column is now drawn, labelled, and redacted. The mark is
          deliberately NOT the ledger's suggested `f1 ▓▓▓▓`: the automl
          case file states that "a demo-data run ledger with a complete
          metric trail has not shipped yet", so naming an f1 per run
          would invent a value that may not exist. `▓▓` says only what
          is true — there is a metric column, and its contents are not
          published — and the figcaption carries the case file's own two
          reasons. Redaction, not a number. */}
      <li className="text-ink-secondary flex justify-between gap-x-2 opacity-80">
        <span className="min-w-0 flex-1">run · model</span>
        <span className="hidden w-[2.2em] shrink-0 text-right sm:inline">
          metrics
        </span>
        <span className="text-right whitespace-nowrap sm:w-[11.4em] sm:shrink-0">
          status
        </span>
      </li>
      {/* Fix round 3, S12 — the redaction keeps its block, and gains its
          reason one line earlier.

          `▓▓` under a column headed `metrics` is, to a skimmer, four
          runs with no numbers: it reads BROKEN before it reads
          PRINCIPLED, and the sentence that turns it around ("private
          repository; the demo-data run ledger has not shipped") lived in
          the figcaption, below every row. The block itself is not the
          problem — it is the honesty, and it stays exactly as it was
          (`▓▓`, aria-hidden, sr-only twin, no invented f1). What moves
          is WHEN the reader learns what it means: a dim note directly
          under the column head, so "withheld" arrives before the first
          redacted cell rather than after the last one.

          `sm:block` mirrors the metric column's own gate — below sm
          there is no metric column to caption (the measured 36px does
          not exist there), and the figcaption carries the whole
          statement in words in every world and at every width. */}
      <li className="text-ink-secondary hidden text-right opacity-70 sm:block">
        metrics withheld — the caption says why
      </li>
      {rows.map((row, index) => {
        const awaiting = row.status === "awaiting approval";
        return (
          <li
            key={row.run}
            /* The write order (CRITIC-LEDGER F03): under the ch04 pin the
               registry DEVELOPS — each row inks in as the run-token
               passes down the ladder, so the ledger the visitor is asked
               to approve is built in front of them instead of sitting
               finished before the run starts. PipelineRun stamps
               data-registry-written per row; every world without the pin
               (static, reduced motion, the case-file figure) never sees
               the hiding rule at all and prints the complete register. */
            data-registry-row={index}
            className={`flex justify-between gap-x-2 ${
              awaiting ? "text-ink" : "text-ink-secondary"
            }`}
          >
            <span className="min-w-0 flex-1">
              {row.run} · {row.model}
            </span>
            {/* The redacted metric cell. aria-hidden + an sr-only twin:
                a screen reader must hear "metrics not published", never
                a run of block glyphs.
                `hidden sm:inline` is a measured concession, not a
                preference: below sm the figure sets in the story column,
                where run 041's row already spends 273px of a 289px
                measure. A third column costs ~36px and there is not
                36px. Phone readers are not left guessing — the
                figcaption states the redaction in words in every world,
                and the sr-only twin keeps it in the accessibility tree
                at every width. */}
            <span className="text-ink-secondary hidden w-[2.2em] shrink-0 text-right opacity-70 sm:inline">
              <span aria-hidden="true">▓▓</span>
            </span>
            <span className="sr-only">metrics not published</span>
            {awaiting ? (
              <button
                type="button"
                data-registry-approve
                data-approved={approved ? "" : undefined}
                aria-pressed={approved}
                aria-label={`Approve run no. ${row.run}`}
                onClick={approved ? undefined : approve}
                /* w-[11.4em] shrink-0 whitespace-nowrap — the same cell
                   the header declares, so the three columns rule up on
                   every row. 11.4em is measured: "awaiting approval" is
                   the widest string this column ever carries and sets to
                   ~148px at the 13px label token. Natural widths were
                   tried first and rejected — with the status cell free
                   to shrink to "approved" (69px), the redaction mark
                   landed 79px further left on run 041 than on the other
                   three, which is a ragged column, not a ledger. */
                className={`registry-approve relative appearance-none border-0 bg-transparent p-0 text-right whitespace-nowrap lowercase sm:w-[11.4em] sm:shrink-0 ${
                  approved ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <span className="registry-strike">{row.status}</span>
                <span aria-hidden="true" className="registry-mark">
                  <span className="registry-mark-gate" />
                  approved
                </span>
              </button>
            ) : (
              <span className="text-right whitespace-nowrap sm:w-[11.4em] sm:shrink-0">
                {row.status}
              </span>
            )}
          </li>
        );
      })}
    </>
  );
}
