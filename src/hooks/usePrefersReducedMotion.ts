"use client";

import { useSyncExternalStore } from "react";

/**
 * The `prefers-reduced-motion: reduce` media query, as an external store.
 *
 * CRITIC-LEDGER F81 counted five suppressions of
 * `react-hooks/set-state-in-effect` across the motion plumbing and read
 * them as one architecture fighting the framework. Two of the five were
 * genuinely that — a preference living outside React, mirrored into
 * state by an effect. This is one of them, and `useSyncExternalStore`
 * is the API React ships for exactly this shape: subscribe to the
 * source, read it on demand, never copy it.
 *
 * The read is also one render EARLIER than the effect could manage.
 * With the old mirror, the first client render always reported "motion
 * on" and a reduced-motion reader's correction arrived after commit;
 * now the very first client render reports the truth, and React
 * reconciles the server's `false` itself.
 *
 * The legacy `addListener` fallback is gone with it: `addEventListener`
 * on `MediaQueryList` is supported by every browser in this project's
 * browserslist (Chrome/Edge 128, Firefox 128, Safari 17.4) by many
 * years, and the fallback was ~20 lines of casts for none of them.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Subscribe to OS-level changes of the preference.
 *
 * @param onChange - React's re-read callback
 * @returns The unsubscribe
 */
function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

/**
 * Read the preference now.
 *
 * @returns True when the reader has asked their OS for reduced motion
 */
function getSnapshot(): boolean {
  return window.matchMedia?.(QUERY).matches === true;
}

/**
 * The server has no reader and no media queries. Reporting "motion on"
 * keeps the prerendered HTML identical for everyone; the client's first
 * render corrects it before any engine mounts (SmoothScroll re-checks
 * `matchMedia` synchronously at its own gate for the same reason).
 *
 * @returns False, always
 */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Whether the reader has asked their OS for reduced motion.
 *
 * Live: an OS toggle mid-session re-renders every consumer, which is
 * how amendment A7's "never init-then-disable" gate tears the engine
 * down and brings it back without a reload.
 *
 * @returns True if the user prefers reduced motion
 *
 * @example
 * ```tsx
 * export function AnimatedComponent() {
 *   const prefersReducedMotion = usePrefersReducedMotion();
 *   return <div data-still={prefersReducedMotion ? "" : undefined} />;
 * }
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
