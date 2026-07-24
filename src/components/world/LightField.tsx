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
 * `data-light-field` is DayArc's write target (PERF-AUDIT fix 2): the
 * scrubbed `--arc-l/c/h` channels are set on THIS container, so each
 * per-frame write invalidates computed style for these four layers
 * only — a root-level write invalidated the whole document tree every
 * frame (measured: 86% of all scroll-time main-thread cost). Both
 * consumers — the base's oklch() composition and the rake's opacity
 * calc — live inside this subtree and inherit the vars.
 *
 * @returns The four-layer light field
 */
export function LightField() {
  return (
    <div
      aria-hidden="true"
      data-testid="light-field"
      data-light-field
      className="pointer-events-none fixed inset-0 z-0"
    >
      {/* The base carries BOTH the day-arc colour AND the raking light, the
          latter folded in via `background-blend-mode: soft-light`
          (globals.css .light-field-base). PERF (runtime scroll): the rake
          used to be a separate `mix-blend-mode: soft-light` layer, which
          forced the compositor to re-blend the whole viewport every time the
          colour beneath it changed — the dominant scroll-jank cost on a real
          GPU. As one element's background it is a single contained paint, no
          compositor re-blend, identical look. */}
      <div
        data-testid="light-field-base"
        className="light-field-base absolute inset-0"
      />
      <div className="light-field-contour absolute inset-0" />
      <div className="light-field-grain absolute inset-0" />
    </div>
  );
}
