/**
 * @fileoverview The receipts table — VALIDATION as an appendix ledger.
 *
 * DOSSIER-SPEC pt 5 + EVIDENCE-MODEL: every row is
 * claim | method · date | artifact · visibility, over hairline rules,
 * with a per-row permalink anchor (`#v-<projectId>-<n>`) so the
 * homepage footnote registry can terminate at a specific receipt.
 * Hierarchy fixes from the rejudge round: real column heads aligned to
 * the row grid (desktop), the claim set in serif so rows anchor the
 * eye, and mobile stacks carrying the /evidence key-label grammar
 * (claim:/method:/date:/artifact:). No pills, no badges — visibility is
 * bracketed mono text. Rows with no external artifact say so instead of
 * linking the portfolio to itself.
 *
 * W1 thread-as-citation: rows whose artifact cites an on-page figure
 * ("see fig. N …" with a hash href) carry `data-cites="N"`, and the
 * citation link is sharpened from the appendix section to the plate
 * itself (`#fig-N`, ids set by ArtifactGallery). The mono link is the
 * always-present affordance; CitationInk draws the margin pen-stroke
 * on hover/focus in the desktop engine world only.
 *
 * Run-the-audit (friend transposition #3): every row carries
 * `data-audit` (artifact | capture | described | held, from
 * receiptAuditState) plus an always-mounted, aria-hidden mark at the
 * number's shoulder — the stamp-rust tick for rows terminating in
 * pinned/checked-in artifacts, a hollow ring for on-page poster/deck
 * captures (W5: a photo of evidence never ticks like a repo-pinned
 * JSON), an ink dash for described-only and HELD rows. Marks rest at
 * opacity 0 and appear when the walk (AuditRun) sets
 * `data-audit-ticked` on the row: absolutely positioned in the
 * row-number gutter, zero layout shift. The left shoulder belongs to
 * these walk marks ALONE — the citation stroke originates at the
 * fig-link (W5), so the two ink acts never share a glyph. `headSlot`
 * seats the one "run the audit ⟶" control beside the validation
 * table's title.
 */

import { HeldStamp } from "@/components/paper/HeldStamp";
import {
  CaseReceipt,
  ReceiptArtifactLink,
  ReceiptAuditState,
  ReceiptVisibility,
  receiptAnchor,
  receiptAuditState,
} from "@/lib/data/projectCaseStudies";

interface EvidenceTableProps {
  projectId: string;
  /** Lowercase group label ("validation" / "outcomes") */
  title: string;
  rows: CaseReceipt[];
  /** 1-based anchor number of the first row in this group */
  startIndex: number;
  /** Optional control seated at the table's head, beside the title */
  headSlot?: React.ReactNode;
}

const VISIBILITY_LABEL: Record<ReceiptVisibility, string> = {
  public: "[public]",
  "private-safe": "[private-safe]",
  "local-only": "[local — verified on request]",
};

/** The shared row template — heads and cells align on the same tracks */
const ROW_GRID =
  "md:grid-cols-[minmax(0,2.1fr)_minmax(0,1.3fr)_minmax(0,1.6fr)]";

function isExternalHref(href: string): boolean {
  return href.startsWith("http");
}

/**
 * The figure number a row cites on-page, if any: an artifact whose
 * label reads "see fig. N …" and whose href stays on this page.
 *
 * @param row - The receipt row
 * @returns The cited figure number, or null
 */
function citedFig(row: CaseReceipt): number | null {
  for (const artifact of row.artifacts) {
    if (!artifact.href.startsWith("#")) continue;
    const match = artifact.label.match(/\bfig\.\s*(\d+)/);
    if (match) return Number(match[1]);
  }
  return null;
}

/**
 * Sharpen an on-page citation to the plate it names: `#artifacts`
 * (the section) becomes `#fig-N` (the figure) when the label carries
 * a figure number. Off-page hrefs pass through untouched.
 *
 * @param artifact - The artifact link
 * @returns The href to render
 */
function citationHref(artifact: ReceiptArtifactLink): string {
  if (!artifact.href.startsWith("#")) return artifact.href;
  const match = artifact.label.match(/\bfig\.\s*(\d+)/);
  return match ? `#fig-${match[1]}` : artifact.href;
}

/** Mobile-only key label (the /evidence dt grammar) */
function KeyLabel({ children }: { children: string }) {
  return <span className="text-ink-secondary md:hidden">{children}: </span>;
}

/**
 * The walk's gutter mark, seated at the row number's shoulder, in the
 * auditor's own stamp-rust ink (W5 — one pen, three verdicts): a solid
 * tick where a pinned/checked-in artifact resolves, a hollow ring
 * where the trail ends in an on-page poster/deck capture, a short dash
 * for described-only and HELD rows. Always mounted, aria-hidden,
 * opacity-0 until the row is ticked — absolutely positioned
 * (audit-mark), so its arrival never moves a letterform. Anchored to
 * the number itself (not the page margin), so it stays clear of the
 * dossier thread's lane at every viewport.
 *
 * @param props - The row's audit state
 * @returns The (aria-hidden) mark slot
 */
function AuditMark({ state }: { state: ReceiptAuditState }) {
  const glyph =
    state === "artifact" ? "tick" : state === "capture" ? "ring" : "dash";
  return (
    <span aria-hidden="true" className={`audit-mark audit-mark-${glyph}`}>
      {state === "artifact" ? (
        <svg viewBox="0 0 12 9" className="h-[9px] w-[11px]">
          <path
            d="M1.3 4.9 C2.8 6.4 3.6 7.1 4.3 6.9 C5.7 5 8.1 2.3 10.8 1.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      ) : state === "capture" ? (
        /* The hollow ring: the hand's small circle — evidence seen on
           this page, not pinned outside it. Wobbled like every glyph. */
        <svg viewBox="0 0 12 9" className="h-[9px] w-[11px]">
          <path
            d="M6.2 1.4 C8.4 1.2 9.9 2.4 9.8 4.4 C9.7 6.5 8 7.8 5.9 7.6 C3.9 7.4 2.3 6.2 2.4 4.3 C2.5 2.5 4.1 1.5 6.2 1.4 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 12 9" className="h-[9px] w-[11px]">
          <path
            d="M1.6 5.4 C4.3 4.6 7.9 4.6 10.4 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}

export function EvidenceTable({
  projectId,
  title,
  rows,
  startIndex,
  headSlot,
}: EvidenceTableProps) {
  return (
    <div>
      {headSlot ? (
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h3 className="label-mono text-ink">{title}</h3>
          {headSlot}
        </div>
      ) : (
        <h3 className="label-mono text-ink">{title}</h3>
      )}

      {/* Real column heads, desktop only — aligned to the row grid.
          On phones each cell carries its own key label instead. */}
      <div
        aria-hidden="true"
        className={`label-mono text-ink-secondary mt-4 hidden gap-x-8 pb-2 md:grid ${ROW_GRID}`}
      >
        <span>claim</span>
        <span>method · date</span>
        <span>artifact · visibility</span>
      </div>

      <ol className="mt-3 md:mt-0">
        {rows.map((row, index) => {
          const n = startIndex + index;
          const padded = String(n).padStart(2, "0");
          const anchor = receiptAnchor(projectId, n);
          const cites = citedFig(row);
          const audit = receiptAuditState(row);
          return (
            <li
              key={anchor}
              id={anchor}
              data-receipt-row
              data-cites={cites ?? undefined}
              data-audit={audit}
              className={`border-ink/15 grid gap-x-8 gap-y-2 border-t py-4 ${ROW_GRID}`}
            >
              {/* The claim anchors the eye: serif at body size, its
                  permalink number in the mono hand beside it. The
                  accessible name leads with the visible digits (audit
                  §1.3 label-content-name-mismatch: voice-control users
                  say "click 01") and the tap-target pad lifts the
                  17×15 glyph to a 37×45 hit area — real padding since
                  the certification round, so the box a census reads is
                  the box a finger lands on. `--tap-gap-end` carries the
                  8px that used to be `mr-2`; see .tap-target. */}
              <p className="text-ink">
                <a
                  href={`#${anchor}`}
                  aria-label={`${padded} — permalink to receipt ${n}`}
                  className="label-mono tap-target text-ink-secondary hover:text-ink underline-offset-4 [--tap-gap-end:0.5rem] hover:underline"
                >
                  {padded}
                  <AuditMark state={audit} />
                </a>
                <span className="label-mono">
                  <KeyLabel>claim</KeyLabel>
                </span>
                <span className="font-serif text-[1.0625rem] leading-6">
                  {row.claim}
                </span>
                {/* W2: the HELD apparatus — the reserved dashed-clay
                    stamp for a number awaiting its committed artifact,
                    plus the Newsreader footnote naming when it lifts.
                    The corrections register carries the matching entry
                    (the footnote's pointer must always resolve). */}
                {row.held ? (
                  <span className="mt-3 block">
                    <HeldStamp />
                    <span className="text-ink-secondary mt-2 block max-w-[44ch] font-serif text-[0.9375rem] leading-6 italic">
                      {row.held.note} —{" "}
                      <a href="#corrections" className="link-draw">
                        see corrections
                      </a>
                      .
                    </span>
                  </span>
                ) : null}
              </p>
              <p className="label-mono text-ink-secondary">
                <KeyLabel>method</KeyLabel>
                {row.method}
                <span className="mt-1 block">
                  <KeyLabel>date</KeyLabel>
                  {row.date ? row.date : "date not recorded"}
                </span>
              </p>
              <div className="label-mono">
                {row.artifacts.length > 0 ? (
                  /* normal-case: artifact labels carry case-sensitive
                     paths (ARCHITECTURE.md) — data, not voice */
                  <ul className="space-y-1 normal-case">
                    {row.artifacts.map((artifact, artifactIndex) => (
                      <li key={artifact.href + artifact.label}>
                        {artifactIndex === 0 ? (
                          <span className="lowercase">
                            <KeyLabel>artifact</KeyLabel>
                          </span>
                        ) : null}
                        {isExternalHref(artifact.href) ? (
                          <a
                            href={artifact.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-draw break-words"
                          >
                            {artifact.label}
                          </a>
                        ) : (
                          /* cite-link: on-page fig citation — the row's
                             hover/focus draws its underline (globals),
                             so CitationInk's pen visibly morphs out of
                             it in the engine world (W5 re-origin). */
                          <a
                            href={citationHref(artifact)}
                            className="link-draw cite-link"
                          >
                            {artifact.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ink-secondary">
                    <KeyLabel>artifact</KeyLabel>
                    no linkable artifact — described only
                  </p>
                )}
                <p className="text-ink-secondary mt-1">
                  {VISIBILITY_LABEL[row.visibility]}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
