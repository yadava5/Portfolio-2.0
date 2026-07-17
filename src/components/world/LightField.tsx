/**
 * @fileoverview LightField — the world's fixed background stack.
 *
 * Four static-paint layers (DECISION.md §3, "the world from A/plan"),
 * bottom to top:
 *   1. base    — day-arc color composed from the numeric oklch channel
 *                vars (`--arc-l/c/h`) that DayArc scrubs (amendment A4)
 *   2. contour — faint ink contour texture, 5% (ink-on-paper apparatus)
 *   3. grain   — fine feTurbulence paper grain, ≤5% (NO-LIST §D cap)
 *   4. rake    — perceptible diagonal raking light under soft-light;
 *                its opacity is derived from `--arc-l`, so it fades out
 *                when the dusk step drops the arc's lightness
 *
 * Everything is CSS-only (globals.css: .light-field-*): no JS animation,
 * no blur filters, no orbs, no radial spotlight. The stack is fixed,
 * pointer-events-none, z-0 — page content must sit in a positioned
 * (e.g. `relative`) container to paint above it.
 */

"use client";

/**
 * Fixed, non-interactive background stack for the Daylight Study world.
 *
 * @returns The four-layer light field
 */
export function LightField() {
  return (
    <div
      aria-hidden="true"
      data-testid="light-field"
      className="pointer-events-none fixed inset-0 z-0"
    >
      <div
        data-testid="light-field-base"
        className="absolute inset-0"
        style={{
          backgroundColor: "oklch(var(--arc-l) var(--arc-c) var(--arc-h))",
        }}
      />
      <div className="light-field-contour absolute inset-0" />
      <div className="light-field-grain absolute inset-0" />
      <div className="light-field-rake absolute inset-0" />
    </div>
  );
}
