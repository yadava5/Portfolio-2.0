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
 */

import {
  CaseReceipt,
  ReceiptArtifactLink,
  ReceiptVisibility,
  receiptAnchor,
} from "@/lib/data/projectCaseStudies";

interface EvidenceTableProps {
  projectId: string;
  /** Lowercase group label ("validation" / "outcomes") */
  title: string;
  rows: CaseReceipt[];
  /** 1-based anchor number of the first row in this group */
  startIndex: number;
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

export function EvidenceTable({
  projectId,
  title,
  rows,
  startIndex,
}: EvidenceTableProps) {
  return (
    <div>
      <h3 className="label-mono text-ink">{title}</h3>

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
          return (
            <li
              key={anchor}
              id={anchor}
              data-receipt-row
              data-cites={cites ?? undefined}
              className={`border-ink/15 grid gap-x-8 gap-y-2 border-t py-4 ${ROW_GRID}`}
            >
              {/* The claim anchors the eye: serif at body size, its
                  permalink number in the mono hand beside it. The
                  accessible name leads with the visible digits (audit
                  §1.3 label-content-name-mismatch: voice-control users
                  say "click 01") and the tap-target pad lifts the
                  17×15 glyph to a ≥24px hit area (WCAG 2.5.8). */}
              <p className="text-ink">
                <a
                  href={`#${anchor}`}
                  aria-label={`${padded} — permalink to receipt ${n}`}
                  className="label-mono tap-target text-ink-secondary hover:text-ink mr-2 underline-offset-4 hover:underline"
                >
                  {padded}
                </a>
                <span className="label-mono">
                  <KeyLabel>claim</KeyLabel>
                </span>
                <span className="font-serif text-[1.0625rem] leading-6">
                  {row.claim}
                </span>
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
                          <a
                            href={citationHref(artifact)}
                            className="link-draw"
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
