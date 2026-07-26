/**
 * @fileoverview The quiet motion toggle — one control, two seats.
 *
 * Amendment A7 gives the reader a way to still the paper without
 * changing an OS setting. The control lived inline in Header.tsx behind
 * `hidden sm:inline-flex`, which meant it measured 0×0 on every phone:
 * the readers most likely to want motion off were the ones who could
 * not reach it (certification round, N4).
 *
 * The masthead cannot carry it below `sm`. Measured on the static
 * export: the 320–414 row leaves 27–33px of slack between its clusters
 * (390: wordmark ends 156, nav 169–238, the mail/resume cluster
 * 252–366), and a 44px target plus its gap needs 52. That is the same
 * budget DayMark.tsx already recorded when it declined to enter below
 * 480. So the phone seat goes where a printed document states how the
 * edition is set — the COLOPHON — and the masthead keeps the `sm`+ seat
 * it always had. The two are exactly complementary (`hidden sm:*` /
 * `sm:hidden`): one control is visible at every width, never two.
 *
 * When the OS itself forces reduced motion the control reports the
 * effective state as system-owned rather than pretending motion is on —
 * it is a report, not a lie about a switch that would do nothing.
 */

"use client";

import { useMotionPreference } from "@/components/layout/SmoothScroll";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/** Props for the motion toggle */
interface MotionToggleProps {
  /** Seat-specific layout + ink (the masthead and the colophon differ) */
  className?: string;
}

/**
 * The reader's motion switch, or an honest report that the OS owns it.
 *
 * @param props - Seat-specific classes
 * @returns The toggle button, or the system-owned state note
 */
export function MotionToggle({ className = "" }: MotionToggleProps) {
  const { motionOff, toggleMotion } = useMotionPreference();
  const prefersReducedMotion = usePrefersReducedMotion();

  /* data-motion-toggle (fix round 3, S5): the one hook the paper edition
     needs. A control that changes how the SCREEN behaves has nothing to
     say on paper, and it printed in both seats — masthead and colophon. */
  if (prefersReducedMotion) {
    return (
      <span
        data-motion-toggle
        className={`label-mono ${className}`}
        title="Motion is disabled by your system preference"
      >
        motion: off — system
      </span>
    );
  }

  /* N7 (fix round 3): "motion: on" states the CURRENT state and never
     said what pressing it does — the mirror of the system note above,
     which has carried its explanation since it was written. A `title` is
     the free half of the fix (hover for a pointer, nothing for anyone
     else); `aria-pressed` already carries the toggle semantics for
     assistive tech, and the label is the accessible name, so nothing
     here changes what a screen reader hears. */
  return (
    <button
      type="button"
      onClick={toggleMotion}
      aria-pressed={motionOff}
      data-motion-toggle
      title={
        motionOff
          ? /* `’`, not `'` (fix round 4): the motion-OFF branch is the
               one a straight apostrophe survived in, because the sweep
               that caught the rest read the page in its default state,
               where this string is not the one rendered. */
            "Motion is off for this browser — press to turn the page’s animation back on"
          : "Motion is on — press to read this page as a still document"
      }
      className={`label-mono ${className}`}
    >
      motion: {motionOff ? "off" : "on"}
    </button>
  );
}
