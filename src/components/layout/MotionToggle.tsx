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

  if (prefersReducedMotion) {
    return (
      <span
        className={`label-mono ${className}`}
        title="Motion is disabled by your system preference"
      >
        motion: off — system
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleMotion}
      aria-pressed={motionOff}
      className={`label-mono ${className}`}
    >
      motion: {motionOff ? "off" : "on"}
    </button>
  );
}
