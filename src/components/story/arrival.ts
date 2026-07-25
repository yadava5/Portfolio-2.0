/**
 * @fileoverview Arrival — the settled-landing announcement.
 *
 * A reader can reach a chapter three ways: by scrolling to it, by asking
 * for it (header nav, an in-page anchor, a shared `/#hash`), or by
 * stepping back to it with the browser's own Back/Forward. Only the
 * first is a SCROLL — the other two are LANDINGS, and a landing crosses
 * no trigger lines on its way. Entrance reveals keyed to "this element
 * has reached 75% of the viewport" therefore never fire for the content
 * that lands BELOW that line, and the destination paints as blank paper
 * (CRITIC-LEDGER F01: `contact` landed on a gate whose mailto, resume,
 * github, linkedin and CTA were all still at opacity 0).
 *
 * This module is the one signal every landing raises: `announceArrival()`
 * waits for the flight to stop moving and then dispatches
 * `ARRIVAL_EVENT` on `window`. TextMotion listens and settles every
 * reveal the reader has already arrived at (never the ones still below
 * the fold — the choreography downward is untouched).
 *
 * It is a plain window event on purpose: the announcers (the scroll
 * controller, the hash realigner, the history bridge) and the listener
 * (the reveal engine) stay decoupled, and a page without the reveal
 * engine — every static world — simply has no listener.
 */

/** The window event a settled programmatic landing dispatches. */
export const ARRIVAL_EVENT = "paper:arrival";

/**
 * Longest we wait before calling a landing settled. `scrollend` normally
 * beats this comfortably; the ceiling covers the browsers that do not
 * fire it and the landings that move the page by zero pixels (asking for
 * the chapter you are already on fires no scroll at all).
 */
const SETTLE_CEILING_MS = 1600;

/**
 * Announce a programmatic landing once the page has stopped moving.
 *
 * Safe to call more than once and from any world — reconciliation is
 * idempotent, and with no listener attached this costs one event.
 */
export function announceArrival(): void {
  if (typeof window === "undefined") return;

  let fired = false;
  const fire = () => {
    if (fired) return;
    fired = true;
    window.clearTimeout(timer);
    window.removeEventListener("scrollend", fire);
    window.dispatchEvent(new Event(ARRIVAL_EVENT));
  };

  const timer = window.setTimeout(fire, SETTLE_CEILING_MS);
  window.addEventListener("scrollend", fire, { once: true });
}
