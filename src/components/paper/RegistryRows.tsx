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
      <li className="text-ink-secondary flex justify-between gap-x-3 opacity-80">
        <span>run · model</span>
        <span className="text-right">status</span>
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
            className={`flex justify-between gap-x-3 ${
              awaiting ? "text-ink" : "text-ink-secondary"
            }`}
          >
            <span>
              {row.run} · {row.model}
            </span>
            {awaiting ? (
              <button
                type="button"
                data-registry-approve
                data-approved={approved ? "" : undefined}
                aria-pressed={approved}
                aria-label={`Approve run no. ${row.run}`}
                onClick={approved ? undefined : approve}
                className={`registry-approve relative appearance-none border-0 bg-transparent p-0 text-right lowercase ${
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
              <span className="text-right">{row.status}</span>
            )}
          </li>
        );
      })}
    </>
  );
}
