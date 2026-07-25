/**
 * @fileoverview The HELD stamp — reserved clay for a claim not yet earned.
 *
 * Rendered beside any number the site states but cannot yet reproduce
 * from a committed artifact; the caller supplies the footnote naming
 * what lifts it. Static SVG, server-rendered, no motion in any world.
 *
 * Design rationale (clay is reserved for decisions and gates; a
 * withheld claim is a gate) lives in DECISION.md §2 and W2 of
 * FRIEND-PORTFOLIO-TRANSPOSITIONS — CRITIC-LEDGER F60: it used to live
 * here, as a 27-line essay heading a 47-line component, and it went
 * stale in the usual way. It promised that "Phase 3 applies the same
 * mark to the flagship's withheld numbers" — a phase that never
 * shipped, still being promised by a file nobody re-reads — and it
 * pinned the ≤2-stamps-per-page budget to one specific case file while
 * three surfaces now call this component.
 */

/**
 * The reserved-clay HELD mark for a claim awaiting its evidence.
 *
 * @returns A small dashed stamp reading "HELD — not yet earned"
 */
export function HeldStamp() {
  return (
    <span
      role="img"
      aria-label="Stamp: held — not yet earned"
      className="text-clay inline-block -rotate-2"
    >
      <svg
        viewBox="0 0 156 58"
        className="block h-auto w-[132px]"
        aria-hidden="true"
      >
        <g fill="none" stroke="currentColor" opacity="0.9">
          <path
            strokeWidth="2"
            strokeDasharray="5 5"
            strokeLinecap="round"
            d="M7 8 C 48 5, 110 7, 149 6 C 151 24, 150 41, 149 51 C 106 53, 50 52, 7 52 C 5 37, 6 22, 7 8 Z"
          />
          <text
            x="78"
            y="27"
            textAnchor="middle"
            fontSize="15"
            letterSpacing="4"
            fill="currentColor"
            stroke="none"
            fontFamily="var(--font-mono)"
          >
            HELD
          </text>
          <text
            x="78"
            y="44"
            textAnchor="middle"
            fontSize="9"
            letterSpacing="1.2"
            fill="currentColor"
            stroke="none"
            fontFamily="var(--font-mono)"
          >
            not yet earned
          </text>
        </g>
      </svg>
    </span>
  );
}
