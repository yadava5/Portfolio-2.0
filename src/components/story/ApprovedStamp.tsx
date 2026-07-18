/**
 * @fileoverview The gate's stamp — awaiting and pressed states.
 *
 * Adapted from design-lab candidate C: hand-wobbled double frame +
 * Fragment Mono lettering, roughened with feTurbulence + feDisplacementMap
 * (edge distress — not blur, not glow; NO-LIST-audited in the candidate).
 * Ink is `currentColor`; the gate chapter sets it to the pre-verified
 * nightfall clay (`--color-clay-night`, 6.4:1 on waypoint-07) — clay is
 * reserved for decisions, and this is the page's decision (DECISION.md §2).
 *
 * The page ships UNSTAMPED: `AwaitingStamp` renders a dashed empty outline
 * — the run is not approved until the recruiter is. `ApprovedStamp` is the
 * pressed state, kept for Phase 3's press-to-approve gate interaction.
 */

interface AwaitingStampProps {
  /**
   * Compact seat for the mobile gate: smaller plate, gentler ~-4° tilt,
   * sized to sit between the giant name and the email CTA (fix round 3).
   */
  compact?: boolean;
}

/**
 * The empty stamp outline: run no. 007, awaiting the visitor's signature.
 *
 * @param props - `compact` renders the smaller mobile-gate seat
 * @returns A labeled awaiting-stamp graphic
 */
export function AwaitingStamp({ compact = false }: AwaitingStampProps) {
  return (
    <div
      role="img"
      aria-label="Empty stamp outline — run no. 007, awaiting your signature"
      className={
        compact ? "text-clay-night -rotate-[4deg]" : "text-clay-night -rotate-6"
      }
    >
      <svg
        viewBox="0 0 300 190"
        className={
          compact
            ? "block h-auto w-[min(190px,52vw)]"
            : "block h-auto w-[min(280px,72vw)]"
        }
        aria-hidden="true"
      >
        <g fill="none" stroke="currentColor" opacity="0.9">
          <path
            strokeWidth="2.5"
            strokeDasharray="7 7"
            strokeLinecap="round"
            d="M12 14 C 90 9, 210 12, 288 11 C 291 68, 289 126, 288 178 C 205 181, 95 179, 12 179 C 9 122, 11 66, 12 14 Z"
          />
          <text
            x="150"
            y="88"
            textAnchor="middle"
            fontSize="13"
            letterSpacing="2"
            fill="currentColor"
            stroke="none"
            fontFamily="var(--font-mono)"
          >
            run no. 007
          </text>
          <path strokeWidth="1" d="M96 106 C 132 103, 176 105, 204 104" />
          <text
            x="150"
            y="130"
            textAnchor="middle"
            fontSize="11"
            letterSpacing="1.5"
            fill="currentColor"
            stroke="none"
            fontFamily="var(--font-mono)"
          >
            awaiting your signature
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * The distressed APPROVED stamp, rotated slightly off-square.
 *
 * @returns A labeled stamp graphic
 */
export function ApprovedStamp() {
  return (
    <div
      role="img"
      aria-label="Rubber stamp reading approved — human in the loop"
      className="text-clay-night -rotate-6"
    >
      <svg
        viewBox="0 0 300 190"
        className="block h-auto w-[min(280px,72vw)]"
        aria-hidden="true"
      >
        <defs>
          <filter id="stamp-rough" x="-4%" y="-4%" width="108%" height="108%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              seed="7"
              result="n"
            />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.1" />
          </filter>
        </defs>
        <g
          filter="url(#stamp-rough)"
          opacity="0.92"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeWidth="3.5"
            d="M12 14 C 90 9, 210 12, 288 11 C 291 68, 289 126, 288 178 C 205 181, 95 179, 12 179 C 9 122, 11 66, 12 14 Z"
          />
          <path
            strokeWidth="1.4"
            d="M26 27 C 95 24, 205 26, 274 25 C 276 72, 275 122, 274 165 C 200 167, 98 166, 26 166 C 24 120, 25 73, 26 27 Z"
          />
          <text
            x="150"
            y="59"
            textAnchor="middle"
            fontSize="10"
            letterSpacing="3"
            fill="currentColor"
            stroke="none"
            fontFamily="var(--font-mono)"
          >
            run no. 007 · summer 2026
          </text>
          <text
            x="150"
            y="112"
            textAnchor="middle"
            fontSize="40"
            letterSpacing="8"
            fill="currentColor"
            stroke="none"
            fontFamily="var(--font-mono)"
          >
            APPROVED
          </text>
          <text
            x="150"
            y="146"
            textAnchor="middle"
            fontSize="11"
            letterSpacing="3"
            fill="currentColor"
            stroke="none"
            fontFamily="var(--font-mono)"
          >
            · human in the loop ·
          </text>
        </g>
      </svg>
    </div>
  );
}
