/**
 * @fileoverview The glance strip — a proof surface's two-second read.
 *
 * The owner's standing complaint on the evidence surfaces: "so much
 * data and too much text — people just wanna know what's going on."
 * This figure is the answer at the head of each proof surface: one
 * drawn mark per record, in reading order, plus a tally caption whose
 * every count is COMPUTED from the same rows the marks are drawn from
 * (never typed — the honesty bar D6, same contract as the audit's
 * settled line). The detail below loses nothing; the strip only says
 * up front what a full read would conclude.
 *
 * Two seats, one grammar:
 *   ValidationGlance — case-file [ validation ]: the auditor's
 *     tick/ring/dash verdicts in the stamp-rust pen, one per receipt
 *     row (receipts then outcomes, walk order), captioned with the
 *     exact tally clauses the settled line uses (auditTallyClauses —
 *     one composer, so strip, walk, and tests can never disagree).
 *   LedgerGlance — /evidence: one visibility mark per manifest entry
 *     in ledger order (the ink scale: solid = public, half = private-
 *     safe, open+dash = local-only); a HELD entry's mark is followed by
 *     the clay dash — the same "never ticks" grammar as its stamp.
 *
 * Marks are aria-hidden decoration; the caption text is the semantic
 * carrier. Static server-rendered SVG — no motion, no client JS, so
 * every world and tier (incl. print) gets the identical honest still.
 */

import {
  AuditGlyph,
  ProofGlyphVisibility,
  VisibilityGlyph,
} from "@/components/paper/proofGlyphs";
import type { ReceiptAuditState } from "@/lib/data/projectCaseStudies";

/** The glance mark drawn per audit state (tick / ring / dash) */
function glyphKind(state: ReceiptAuditState): "tick" | "ring" | "dash" {
  if (state === "artifact") return "tick";
  if (state === "capture") return "ring";
  return "dash";
}

/**
 * The case-file validation strip: the receipts' dispositions at a
 * glance, in the walk's own order and pen.
 *
 * @param states - receiptAuditState per row, receipts then outcomes
 * @param clauses - auditTallyClauses(receiptAuditCounts(study))
 * @returns The glance figure
 */
export function ValidationGlance({
  states,
  clauses,
}: {
  states: ReceiptAuditState[];
  clauses: string[];
}) {
  return (
    <figure
      data-proof-glance
      className="border-ink/15 mt-6 max-w-[44rem] border-t pt-4"
    >
      <div
        aria-hidden="true"
        className="text-clay-graphic flex flex-wrap items-center gap-x-2 gap-y-2.5"
      >
        {states.map((state, index) => (
          <span
            key={`${index}-${state}`}
            data-glance-state={state}
            data-glance-mark={glyphKind(state)}
            className="inline-flex"
          >
            <AuditGlyph state={state} className="h-[11px] w-[14px]" />
          </span>
        ))}
      </div>
      <figcaption className="label-mono text-ink-secondary mt-2.5 max-w-[68ch]">
        at a glance — {clauses.join(" · ")}
      </figcaption>
    </figure>
  );
}

/** One /evidence entry as the glance sees it */
export interface LedgerGlanceEntry {
  visibility: ProofGlyphVisibility;
  held: boolean;
}

/** Zero-count clauses are omitted, mirroring auditSettledSentence */
function ledgerClauses(entries: LedgerGlanceEntry[]): string[] {
  const count = (visibility: ProofGlyphVisibility) =>
    entries.filter((entry) => entry.visibility === visibility).length;
  const held = entries.filter((entry) => entry.held).length;
  const parts = [`${entries.length} entries`];
  if (count("public") > 0) parts.push(`${count("public")} public`);
  if (count("private-safe") > 0)
    parts.push(`${count("private-safe")} private-safe`);
  if (count("local-only") > 0)
    parts.push(`${count("local-only")} local — verified on request`);
  if (held > 0) parts.push(`${held} held — not yet earned`);
  return parts;
}

/**
 * The /evidence ledger strip: one visibility mark per entry, ledger
 * order; a held entry's mark carries the clay dash at its shoulder.
 *
 * @param entries - visibility + held per manifest entry, in order
 * @returns The glance figure
 */
export function LedgerGlance({ entries }: { entries: LedgerGlanceEntry[] }) {
  return (
    <figure data-proof-glance className="mt-8">
      <div
        aria-hidden="true"
        className="text-ink flex flex-wrap items-center gap-x-2 gap-y-2.5"
      >
        {entries.map((entry, index) => (
          <span
            key={`${index}-${entry.visibility}`}
            className="inline-flex items-center gap-[3px]"
          >
            <span data-glance-vis={entry.visibility} className="inline-flex">
              <VisibilityGlyph
                visibility={entry.visibility}
                className="h-[10px] w-[10px]"
              />
            </span>
            {entry.held ? (
              <span
                data-glance-held=""
                className="text-clay-graphic inline-flex"
              >
                <AuditGlyph state="held" className="h-[9px] w-[11px]" />
              </span>
            ) : null}
          </span>
        ))}
      </div>
      <figcaption className="label-mono text-ink-secondary mt-2.5 max-w-[68ch]">
        at a glance — {ledgerClauses(entries).join(" · ")}
      </figcaption>
    </figure>
  );
}
