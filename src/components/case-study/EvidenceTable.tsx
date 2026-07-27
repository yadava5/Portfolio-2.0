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
import { AuditGlyph, VisibilityGlyph } from "@/components/paper/proofGlyphs";
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

/**
 * The leaving mark (N20, fix round 7) — the site's `↗`, glued to the
 * label it follows by U+00A0. The no-break space is not decoration: the
 * artifact cell runs `overflow-wrap: anywhere` (see the long note at
 * the cell), and a normal space in front of a one-glyph run is an
 * invitation to print the arrow alone on the next line.
 *
 * It is a constant so the glyph appears in this file exactly once, and
 * so it is never typed into `projectCaseStudies.ts` again — five
 * artifact labels used to carry it as DATA, which is how one column
 * ended up with two grammars.
 */
const LEAVES_SITE = "\u00A0\u2197";

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
 * The drawn paths themselves live in proofGlyphs (evviz round): the
 * walk's gutter, the validation glance strip, and the /evidence ledger
 * glance share one hand, so the marks can never drift apart.
 *
 * @param props - The row's audit state
 * @returns The (aria-hidden) mark slot
 */
function AuditMark({ state }: { state: ReceiptAuditState }) {
  const glyph =
    state === "artifact" ? "tick" : state === "capture" ? "ring" : "dash";
  return (
    <span aria-hidden="true" className={`audit-mark audit-mark-${glyph}`}>
      <AuditGlyph state={state} className="h-[9px] w-[11px]" />
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
      {/* N19 sweep (fix round 7) — THE ORPHANED FOLIO, caught here by
          the repo-wide pass rather than by a reader. `run the audit ⟶`
          is this table's folio: it sits opposite the table's name, and
          the row is `flex-wrap` + `justify-between`, so at every width
          where the control could not share a line with the title it
          wrapped to its own line at flex-START. Measured on
          /projects/automl/ at 1024, 1280, 1440 and 1920 — every desktop
          width — and on /projects/jobtracker/ at 768. `folio-seat`
          (globals.css) seats it right on its own line and resolves to
          the identical position wherever the two already shared one.
          The seat rides the container as a last-child variant, not a
          wrapper element: `headSlot` is a component with its own
          `max-w-full` plumbing (AuditRun's inline-flex root), and
          interposing a box between it and the flex line would change
          what that max-width resolves against. This way the DOM is
          byte-for-byte what it was and exactly one property moves. */}
      {headSlot ? (
        <div className="[&>:last-child]:folio-seat flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
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
              {/* wrap-anywhere, not break-words — fix round 5's
                  narrow-width repair, and one word is the whole of it.
                  `overflow-wrap: break-word` lets a long run BREAK, but
                  it does not reduce that run's min-content width, and a
                  grid item's automatic minimum size IS its min-content
                  width. So this cell's minimum stayed at the full
                  356px of
                  `huggingface.co/spaces/yadava5/jobtracker-classifier`,
                  the row's single narrow track was sized to it, and the
                  jobtracker case file shoved the document 72px past a
                  320px viewport (52 at 340, 32 at 360, 2 at 390).
                  `anywhere` is the one value that reduces the
                  contribution too, so the track can be the 260px it has.
                  overflow-wrap inherits, which is why one declaration on
                  the cell covers the links, the plain-text labels and
                  the visibility line.

                  Deliberately NOT breakable() here, though that helper
                  exists and the meta ledger uses it. Seeding <wbr> at
                  the separators moves DESKTOP breaks: the desktop cell
                  holds 35 characters at the label's 8.68px advance, and
                  greedy line-breaking would then fill line 1 to
                  `applied @ 36a2f54 · cloud/gmail_` and orphan
                  `oauth.py` — a break inside a filename where the row
                  currently breaks cleanly at the ` · `. Measured: with
                  the hints the desktop receipts table moved 3,346
                  pixels; without them it moves zero. The narrow cost is
                  bounded and known — only a token longer than the 29
                  characters a 260px cell holds is cut mid-path (3 of
                  jobtracker's 18 artifact labels), and a pinned sha is a
                  standalone 7-character word, so `anywhere` can never
                  split one. */}
              <div className="label-mono wrap-anywhere">
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
                        {/* N20 (fix round 7) — the `↗` grammar, applied
                            to the last column that broke it.

                            StoryShell's F41 note defines the glyph:
                            `↗` leaves the site, `⟶` goes deeper into
                            this argument. This cell printed its
                            artifact labels bare, so the SAME artifact
                            wore the mark on /evidence/ and lost it on
                            its own case file. Fix round 4 declined to
                            hang the marks and called it density; that
                            decline is reversed here, on a measurement
                            rather than on taste.

                            WHY THE ABSENCE COULD NOT SIMPLY BE
                            AUTHORED. The other cure — say the rule in
                            the column head, so a reader infers "every
                            link in this column is off-site" — cannot
                            be stated truthfully, because the column is
                            not uniform. Across the seven files it
                            carries 59 external artifacts AND 13
                            on-page fig citations, and 13 of the 59
                            already wore the glyph because five labels
                            in projectCaseStudies.ts had it typed into
                            the DATA. One column, two kinds of link,
                            and the same kind marked 13 times and bare
                            46. There is no sentence a column head
                            could carry that makes that a rule.

                            WHAT IT COSTS, measured on the four dense
                            files at 320 / 390 / 1440
                            (probe-fix7-arrow.mjs): overflow stays 0 at
                            every width — including 320, the width fix
                            round 5 fought to fit. Worst case is
                            taskflow at 390, +94px of cell on a
                            13,042px document (+0.7%); jobtracker gains
                            one line at 320 and nothing at 390 or 1440;
                            the other measured cells gain lines inside
                            a grid row whose height another column
                            already sets, so they cost zero.

                            The glyph is rendered HERE and never stored
                            in the data: a mark is furniture, and the
                            five hand-typed ones are exactly how a
                            column ends up with two grammars. The space
                            is NO-BREAK — this cell runs
                            `overflow-wrap: anywhere` (see the note
                            above), which would otherwise be free to
                            drop a lone arrow onto its own line. */}
                        {isExternalHref(artifact.href) ? (
                          <a
                            href={artifact.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-draw"
                          >
                            {artifact.label}
                            {LEAVES_SITE}
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
                {/* evviz: the visibility grade drawn beside its label —
                    the ink scale (solid / half / open+dash), aria-hidden;
                    the bracketed mono text stays the semantic carrier. */}
                <p className="text-ink-secondary mt-1">
                  <span className="mr-1.5 inline-flex align-baseline">
                    <VisibilityGlyph visibility={row.visibility} />
                  </span>
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
