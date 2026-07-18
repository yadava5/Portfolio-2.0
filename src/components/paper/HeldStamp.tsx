/**
 * @fileoverview The HELD stamp — reserved clay for a claim not yet earned.
 *
 * W2 (Refinement Era), transposed from the friend-portfolio tour's
 * "unearned number" apparatus (FRIEND-PORTFOLIO-TRANSPOSITIONS #1): his
 * retraction is a section; ours is a stamp. Clay is reserved for
 * decisions and gates (DECISION.md §2) — and an honestly-withheld claim
 * IS a gate: the page stops the number at the door until a committed
 * artifact earns it. Dashed frame in the gate/private stamps' wobbled
 * hand, Fragment Mono lettering, `text-clay` ink (the 5.1:1 text token
 * the dossier stock already carries).
 *
 * Applied once for now — the fast-mnist ~97% accuracy receipt, whose
 * own claim says "documented in the repo, not measured on this page" —
 * with a Newsreader footnote naming when the stamp lifts. Phase 3
 * applies the same mark to the flagship's withheld numbers. The ≤2
 * stamps/page skeuomorph budget (DOSSIER-RESEARCH warning 1) holds:
 * fast-mnist carries no other stamp.
 *
 * Static SVG, server-rendered, no motion in any world.
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
