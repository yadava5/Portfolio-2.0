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
 * performs the site's thesis. One press (the plate takes 750ms and the
 * ink 720ms in the motion world — read off `stamp-press` and
 * `stamp-ink-in` in globals.css, where the numbers live; this header
 * said "~600ms" and was wrong by a quarter, CRITIC-LEDGER F82. Instant
 * swap in static worlds) dries the hairline unsigned plate into the
 * solid APPROVED stamp carrying the visitor's own local date,
 * persisted via paperMemory. (This header said "the dashed outline"
 * until the certification round: F20 replaced that dashed rectangle
 * with the paper's own double rule two waves earlier, and the sentence
 * describing the site's signature act went on naming a mark that is no
 * longer on the page — the same F82 class of fault.) On revisit the
 * stamp is ALREADY inked —
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
  const fineFilterId = `stamp-fine-${compact ? "c" : "d"}`;

  /* Pull the hand in (item 3a): one attention beat the first time the
     awaiting stamp scrolls into view — the unsigned plate's rule firms
     once (F20's double rule, not the dashed frame this comment used to
     name) and the plate breathes. A7: armed only in the motion world
     (the CSS beat
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
      {/* CRITIC-LEDGER F67 — the site's signature act rendered at ~6.3px
          on a phone. SVG text is authored in USER units, so the plate's
          width ÷ 300 IS the type's scale factor: the compact seat's
          `min(190px,52vw)` put it at 0.66 (measured at 390), turning the
          11-unit invitation into 7.26px and the visitor's own approval
          date into 6.6px — then pushed both through a 1.3-unit
          displacement filter. Both seats now render the plate at its
          authored 300 units wherever there is room, so the viewBox scale
          is 1:1 and an authored unit IS a pixel. 88vw on the compact
          seat keeps a margin at 320 (the narrowest supported width,
          where the plate lands at 0.94 and the smallest line reads
          ~11.3px). The mobile seat can afford the size now because it
          moved BELOW the contact cluster — see the gate's F08 note. */}
      <svg
        viewBox="0 0 300 190"
        className={`stamp-plate ${
          compact
            ? "block h-auto w-[min(300px,88vw)]"
            : "block h-auto w-[min(300px,72vw)]"
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
          {/* Item 3 — a LIGHTER distress for the sub-12px run/date line.
              The full scale-2.1 displacement smeared "2026" toward "2025";
              a real stamp's small print is the first thing to blur, but the
              date has to stay readable. Same noise field (seed 7) so the
              texture is of a piece with the frame — only the displacement
              scale drops, keeping a hint of ink without eating the digits. */}
          <filter id={fineFilterId} x="-4%" y="-4%" width="108%" height="108%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              seed="7"
              result="n"
            />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.3" />
          </filter>
        </defs>

        {/* ── The awaiting layer: an unsigned plate, not a dropzone ───
            Fades to 0 when inked but STAYS rendered — [data-thread-sig]
            keeps its getBBox, so the thread finale never re-aims.

            CRITIC-LEDGER F20: this frame was a ~297×206 DASHED rectangle,
            ~90% empty — the universal signifier of "drop a file here /
            content missing", which is what a reader saw at the moment the
            page asks for its one decision. It is now the paper's own
            double rule: the same wobbled outer frame drawn SOLID, with
            the inked layer's existing inner ring at a hairline weight.
            Nothing invented — INNER_FRAME_D is the path the pressed stamp
            already draws, so the awaiting and inked states are now the
            same drawing at two ink weights, which is what an unsigned
            form actually looks like.
            FRAME_D itself is byte-for-byte untouched: the Red Thread maps
            its entry and blot coordinates from these exact points. */}
        <g
          className="stamp-awaiting"
          fill="none"
          stroke="currentColor"
          opacity="0.9"
        >
          <path strokeWidth="2.2" strokeLinecap="round" d={FRAME_D} />
          <path strokeWidth="0.8" strokeLinecap="round" d={INNER_FRAME_D} />
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
            className="stamp-sign"
            x="150"
            y="130"
            textAnchor="middle"
            /* 11 → 12 (F67): the smallest authored line on the stamp, and
               the one the whole argument's thread arrives to underline.
               Measured inside the 12→288 frame at 12 units. */
            fontSize="12"
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
            underline underlines it. Colour (ember), opacity, and the
            wet→dry ink animation ride THIS group; the distress FILTERS
            now live on the two inner groups so the sub-12px date can wear
            a lighter displacement (item 3) while the frame + APPROVED
            keep candidate C's full distress. */}
        <g className="stamp-inked" fill="none" stroke="currentColor">
          {/* Full distress (scale 2.1) — the frame + wordmark: that texture
              is the stamp's character. FRAME_D is byte-for-byte unchanged,
              so every entry/blot coordinate the Red Thread maps from the
              viewBox stays exact. */}
          <g filter={`url(#${filterId})`}>
            <path strokeWidth="3.5" d={FRAME_D} />
            <path strokeWidth="1.4" d={INNER_FRAME_D} />
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
              /* 11 → 12 (F67): shares the awaiting signature's baseline,
                 so it takes the same step — the thread's underline
                 underlines both states at the same measure. */
              fontSize="12"
              letterSpacing="1.5"
              fill="currentColor"
              stroke="none"
              fontFamily="var(--font-mono)"
            >
              · human in the loop ·
            </text>
          </g>
          {/* Item 3 — the run/date line: its own lighter distress so the
              digits (the visitor's own approval date) read cleanly. Not a
              coordinate the thread measures.
              10 → 11 (F67): this was the smallest thing on the stamp and
              it carries the visitor's OWN date — the one line that must
              never be decorative. It stops at 11 rather than 12 because
              its +3 letter-spacing over ~25 characters is what fills the
              frame's width; 12 would run it into the wobbled edge. */}
          <g filter={`url(#${fineFilterId})`}>
            <text
              x="150"
              y="56"
              textAnchor="middle"
              fontSize="11"
              letterSpacing="3"
              fill="currentColor"
              stroke="none"
              fontFamily="var(--font-mono)"
            >
              run no. 041 · {approval ? approval.label : ""}
            </text>
          </g>
        </g>
      </svg>
    </button>
  );
}
