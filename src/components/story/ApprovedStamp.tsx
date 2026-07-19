/**
 * @fileoverview The gate's stamp — press-to-sign (the site's signature act).
 *
 * Adapted from design-lab candidate C: hand-wobbled double frame +
 * Fragment Mono lettering, roughened with feTurbulence + feDisplacementMap
 * (edge distress — not blur, not glow; NO-LIST-audited in the candidate).
 * Ink is `currentColor`; the gate chapter sets it to the pre-verified
 * nightfall clay (`--color-clay-night`, 6.4:1 on waypoint-07) — clay is
 * reserved for decisions, and this is the page's decision (DECISION.md §2).
 *
 * W1 (Refinement Era): the stamp is now a real `<button>` — the visitor
 * performs the site's thesis. One press (~600ms inking animation in the
 * motion world; instant swap in static worlds) dries the dashed outline
 * into the solid APPROVED stamp carrying the visitor's own local date,
 * persisted via paperMemory. On revisit the stamp is ALREADY inked —
 * static, dried, never re-performed (gwern subtraction). Approving here
 * approves run 041 everywhere (fig 4.1's registry row is the SAME run).
 * The act gates nothing: the mailto stays reachable without approving.
 *
 * Red Thread contracts (ThreadSegment.tsx) — unchanged and load-bearing:
 *   - `[data-thread-stamp]` sits on the rotated wrapper (the button);
 *     offsetWidth + the computed transform matrix map viewBox → page.
 *   - `[data-thread-sig]` stays rendered in EVERY state (the awaiting
 *     layer fades to opacity 0, never display:none) so getBBox keeps
 *     answering and the finale's underline + blot stay true. The inked
 *     layer seats its own bottom line on the SAME baseline (y=130), so
 *     the drawn underline underlines it exactly.
 *   - The frame path is identical in both layers — the blot coordinates
 *     (measureStampMarks' viewBox constants) hold for both states.
 */

"use client";

import { useEffect, useRef, useState, type AnimationEvent } from "react";
import { useRunApproval } from "@/lib/paperMemory";

interface AwaitingStampProps {
  /**
   * Compact seat for the mobile gate: smaller plate, gentler ~-4° tilt,
   * sized to sit between the giant name and the email CTA (fix round 3).
   */
  compact?: boolean;
}

/** The wobbled outer frame — shared by both layers (blot contract) */
const FRAME_D =
  "M12 14 C 90 9, 210 12, 288 11 C 291 68, 289 126, 288 178 C 205 181, 95 179, 12 179 C 9 122, 11 66, 12 14 Z";

/** The inked layer's inner frame (the pressed stamp's double ring) */
const INNER_FRAME_D =
  "M26 27 C 95 24, 205 26, 274 25 C 276 72, 275 122, 274 165 C 200 167, 98 166, 26 166 C 24 120, 25 73, 26 27 Z";

/**
 * The gate stamp: run no. 041 — the SAME run fig 4.1's registry shows
 * awaiting approval — awaiting the visitor's press. A real button:
 * Enter/Space activate, `aria-pressed` carries the state, and the
 * focus ring rides the global `:focus-visible` outline.
 *
 * @param props - `compact` renders the smaller mobile-gate seat
 * @returns The press-to-sign stamp
 */
export function AwaitingStamp({ compact = false }: AwaitingStampProps) {
  const { approval, approve } = useRunApproval();
  const [inking, setInking] = useState(false);
  const [noticing, setNoticing] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const approved = approval !== null;
  const filterId = `stamp-rough-${compact ? "c" : "d"}`;

  /* Pull the hand in (item 3a): one attention beat the first time the
     awaiting stamp scrolls into view — the dashed outline firms once and
     the plate breathes. A7: armed only in the motion world (the CSS beat
     is gated the same way the inking is), never on the dried stamp, and
     disconnected after the single fire. The transform rides .stamp-plate,
     which the Red Thread never measures, so geometry stays true. */
  useEffect(() => {
    if (approved) return; /* dried ink is settled — it never beats */
    const el = buttonRef.current;
    if (!el) return;
    const motion =
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !document.documentElement.hasAttribute("data-motion-off");
    if (!motion) return; /* static worlds get the resting stamp, no beat */

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          setNoticing(true);
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [approved]);

  const handlePress = () => {
    if (approved) return; /* dried ink never re-performs */
    setNoticing(false); /* the press supersedes any lingering beat */
    setInking(true); /* the ~750ms inking — motion world only (CSS) */
    approve();
  };

  const handleAnimationEnd = (event: AnimationEvent<HTMLButtonElement>) => {
    if (event.animationName === "stamp-press") setInking(false);
    if (event.animationName === "stamp-notice-breathe") setNoticing(false);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      data-thread-stamp
      data-stamp
      data-inked={approved ? "" : undefined}
      aria-pressed={approved}
      aria-label={
        approved
          ? `Approved — run no. 041 · ${approval.label}`
          : "Approve run no. 041 — press to sign this page"
      }
      onClick={handlePress}
      onAnimationEnd={handleAnimationEnd}
      /* w-fit: the wrapper must hug the svg — the Red Thread derives its
         stamp-landmark scale from offsetWidth (a full-width wrapper sent
         the finale's blot drifting off the frame on phones). The button
         reset keeps the wrapper geometry identical to the old div. */
      className={`block w-fit appearance-none border-0 bg-transparent p-0 ${
        approved ? "cursor-default" : "cursor-pointer"
      } ${compact ? "text-clay-night -rotate-[4deg]" : "text-clay-night -rotate-6"} ${
        inking ? "is-inking" : ""
      } ${noticing ? "is-noticing" : ""}`}
    >
      <svg
        viewBox="0 0 300 190"
        className={`stamp-plate ${
          compact
            ? "block h-auto w-[min(190px,52vw)]"
            : "block h-auto w-[min(280px,72vw)]"
        }`}
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} x="-4%" y="-4%" width="108%" height="108%">
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

        {/* ── The awaiting layer: dashed outline, empty middle ────────
            Fades to 0 when inked but STAYS rendered — [data-thread-sig]
            keeps its getBBox, so the thread finale never re-aims. */}
        <g
          className="stamp-awaiting"
          fill="none"
          stroke="currentColor"
          opacity="0.9"
        >
          <path
            strokeWidth="2.5"
            strokeDasharray="7 7"
            strokeLinecap="round"
            d={FRAME_D}
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
            run no. 041
          </text>
          <path strokeWidth="1" d="M96 106 C 132 103, 176 105, 204 104" />
          {/* data-thread-sig: the Red Thread's finale underlines this
              line before blotting on the frame (measured via getBBox).
              Item 3a — the micro-label is now an imperative invitation
              ("press to sign" register): the whole argument's thread
              arrives and underlines the very act it asks for. Narrower
              than the old passive line, so the drawn underline never
              overruns the frame. */}
          <text
            data-thread-sig
            x="150"
            y="130"
            textAnchor="middle"
            fontSize="11"
            letterSpacing="1.5"
            fill="currentColor"
            stroke="none"
            fontFamily="var(--font-mono)"
          >
            press here to sign
          </text>
        </g>

        {/* ── The inked layer: the pressed APPROVED stamp ─────────────
            Same frame path (the blot lands identically); the bottom line
            shares the awaiting signature's baseline, so the thread's
            underline underlines it. Distress filter per candidate C. */}
        <g
          className="stamp-inked"
          filter={`url(#${filterId})`}
          fill="none"
          stroke="currentColor"
        >
          <path strokeWidth="3.5" d={FRAME_D} />
          <path strokeWidth="1.4" d={INNER_FRAME_D} />
          <text
            x="150"
            y="56"
            textAnchor="middle"
            fontSize="10"
            letterSpacing="3"
            fill="currentColor"
            stroke="none"
            fontFamily="var(--font-mono)"
          >
            run no. 041 · {approval ? approval.label : ""}
          </text>
          <text
            x="150"
            y="104"
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
            y="130"
            textAnchor="middle"
            fontSize="11"
            letterSpacing="1.5"
            fill="currentColor"
            stroke="none"
            fontFamily="var(--font-mono)"
          >
            · human in the loop ·
          </text>
        </g>
      </svg>
    </button>
  );
}
