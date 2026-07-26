/**
 * @fileoverview The proof glyphs — one drawn hand for every verdict mark.
 *
 * The evidence surfaces state dispositions as DRAWN marks, never as
 * decorative text: the auditor's three verdicts (solid tick = a
 * pinned/checked-in artifact resolves, hollow ring = the trail ends in
 * an on-page poster/deck capture, short dash = described-only or HELD)
 * and the registry's three visibility grades (solid dot = [public],
 * half-inked disc = [private-safe], open circle with an inner dash =
 * [local — verified on request]).
 *
 * Extracted from EvidenceTable's AuditMark (evviz round) so the walk's
 * gutter marks, the validation glance strip, and the /evidence ledger
 * glance all draw from the same wobbled-hand paths — one pen, several
 * seats, zero drift. Every glyph is aria-hidden decoration: the
 * adjacent text ([public], the tally sentence, the settled line) is
 * always the semantic carrier. Static SVG, server-rendered, no motion
 * in any world.
 */

import type { ReceiptAuditState } from "@/lib/data/projectCaseStudies";

/** Visibility grades shared by proofManifest and the case receipts */
export type ProofGlyphVisibility = "public" | "private-safe" | "local-only";

/** Size classes come per seat; data-* attributes ride through to the
 *  svg so the glance strips stay recountable by the specs. */
type GlyphProps = React.SVGProps<SVGSVGElement>;

/**
 * The auditor's verdict mark in the wobbled hand (W5 — one pen, three
 * verdicts). Color comes from the seat via currentColor: the walk
 * gutter and the glance strips both ink it stamp-rust.
 *
 * @param state - The row's audit disposition
 * @param className - Size classes for the svg box
 * @returns The bare aria-hidden svg (the seat provides the wrapper)
 */
export function AuditGlyph({
  state,
  className = "h-[9px] w-[11px]",
  ...rest
}: GlyphProps & { state: ReceiptAuditState }) {
  if (state === "artifact") {
    return (
      <svg
        viewBox="0 0 12 9"
        className={className}
        aria-hidden="true"
        {...rest}
      >
        <path
          d="M1.3 4.9 C2.8 6.4 3.6 7.1 4.3 6.9 C5.7 5 8.1 2.3 10.8 1.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (state === "capture") {
    /* The hollow ring: the hand's small circle — evidence seen on
       this page, not pinned outside it. Wobbled like every glyph. */
    return (
      <svg
        viewBox="0 0 12 9"
        className={className}
        aria-hidden="true"
        {...rest}
      >
        <path
          d="M6.2 1.4 C8.4 1.2 9.9 2.4 9.8 4.4 C9.7 6.5 8 7.8 5.9 7.6 C3.9 7.4 2.3 6.2 2.4 4.3 C2.5 2.5 4.1 1.5 6.2 1.4 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  /* described + held share the honest ink dash (the walk's grammar) */
  return (
    <svg viewBox="0 0 12 9" className={className} aria-hidden="true" {...rest}>
      <path
        d="M1.6 5.4 C4.3 4.6 7.9 4.6 10.4 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * The visibility grade drawn as an ink scale — how much of the artifact
 * the reader can reach: fully inked (public), half inked
 * (private-safe), outline with the "on request" dash held inside
 * (local-only). Distinct from the audit ring on purpose: visibility is
 * registry information in the page's own ink, never a verdict.
 *
 * @param visibility - The entry/row visibility grade
 * @param className - Size classes for the svg box
 * @returns The bare aria-hidden svg (the seat provides the wrapper)
 */
export function VisibilityGlyph({
  visibility,
  className = "h-[10px] w-[10px]",
  ...rest
}: GlyphProps & { visibility: ProofGlyphVisibility }) {
  if (visibility === "public") {
    return (
      <svg
        viewBox="0 0 12 12"
        className={className}
        aria-hidden="true"
        {...rest}
      >
        <path
          d="M6.1 1.6 C8.5 1.4 10.3 3.1 10.2 5.9 C10.1 8.6 8.2 10.4 5.9 10.3 C3.5 10.2 1.8 8.4 1.9 5.8 C2 3.2 3.8 1.8 6.1 1.6 Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (visibility === "private-safe") {
    return (
      <svg
        viewBox="0 0 12 12"
        className={className}
        aria-hidden="true"
        {...rest}
      >
        <path
          d="M6.1 1.6 C8.5 1.4 10.3 3.1 10.2 5.9 C10.1 8.6 8.2 10.4 5.9 10.3 C3.5 10.2 1.8 8.4 1.9 5.8 C2 3.2 3.8 1.8 6.1 1.6 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M6 1.7 C3.8 1.9 2.1 3.3 2 5.9 C1.9 8.3 3.7 10.1 6 10.2 Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden="true" {...rest}>
      <path
        d="M6.1 1.6 C8.5 1.4 10.3 3.1 10.2 5.9 C10.1 8.6 8.2 10.4 5.9 10.3 C3.5 10.2 1.8 8.4 1.9 5.8 C2 3.2 3.8 1.8 6.1 1.6 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M4 6.2 C4.8 5.9 7.2 5.9 8.1 6.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
