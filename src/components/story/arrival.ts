/**
 * @fileoverview Arrival — the landing contract: where a jump lands, what
 * it tells the reveal engine, and what it leaves in the browser history.
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
 *
 * The module also owns the two other halves of a landing:
 *   - WHERE it lands. `SCROLL_OFFSET`/`landingTop()` are the one anchor
 *     landing contract — the target's top, one fixed-masthead height
 *     below the viewport top. `scrollIntoView` would apply BOTH
 *     `scroll-padding-top` and the element's `scroll-margin-top` (~12rem)
 *     and land somewhere else, so nothing here uses it.
 *   - WHAT IT LEAVES BEHIND. `pushLanding()` writes the section into the
 *     history stack (CRITIC-LEDGER F05: nav clicks wrote nothing, so no
 *     section was linkable and Back left the site), and
 *     `restoreLanding()` re-lands a traversal on the anchor its URL
 *     names, at exactly the same offset the click used.
 *
 * `history.scrollRestoration` is deliberately left at "auto". Entries
 * WITHOUT a hash — a plain reload, and the entry the reader was on when
 * they first clicked nav — are restored by the browser to the exact
 * pixel, which is both correct and free; switching to "manual" would
 * throw that away and put every reload back at the top of the paper
 * (TextMotion's past-start crash guard exists precisely because deep
 * restoration is real). The entries this module CREATES are section
 * landings, so those it lands itself, deterministically.
 */

/** The window event a settled programmatic landing dispatches. */
export const ARRIVAL_EVENT = "paper:arrival";

/**
 * The anchor landing offset: matches `scroll-padding-top: 6rem` in
 * globals.css, i.e. one fixed masthead. Negative because it is added to
 * the target's document top.
 */
export const SCROLL_OFFSET = -96;

/**
 * Document scroll position that lands `el` under the fixed masthead.
 *
 * @param el - The anchor target
 * @returns The scrollY the landing should end at
 */
export function landingTop(el: HTMLElement): number {
  return window.scrollY + el.getBoundingClientRect().top + SCROLL_OFFSET;
}

/**
 * Resolve an in-page hash to its element, tolerating a malformed one.
 *
 * @param hash - A location hash, e.g. "#gate"
 * @returns The target element, or null
 */
export function anchorFor(hash: string): HTMLElement | null {
  if (!hash || hash === "#") return null;
  try {
    return document.querySelector<HTMLElement>(hash);
  } catch {
    return null;
  }
}

/**
 * Record a section landing in the browser's history.
 *
 * One entry per section asked for: Back walks the reader back through
 * the sections they visited and finally to the page they came from —
 * it never ejects them from the site — and every section the reader
 * reaches is a URL they can copy (CRITIC-LEDGER F05).
 *
 * Asking twice for the section you are already on adds nothing, so Back
 * never has to be pressed twice for one move.
 *
 * @param hash - The in-page target, e.g. "#gate"
 */
export function pushLanding(hash: string): void {
  if (typeof window === "undefined") return;
  if (window.location.hash === hash) return;
  try {
    window.history.pushState(null, "", hash);
  } catch {
    /* history unavailable (sandboxed frame) — the scroll still happens */
  }
}

/**
 * The window event a completed `ScrollTrigger.refresh()` dispatches.
 *
 * A landing made on the fonts-ready layout is NOT final: the ch04 pin
 * builds its spacer afterwards, and re-measuring every trigger moves the
 * scroll position by the pin distance (measured: a `/#work` landing sat
 * correctly at scrollY 5123 for ~150ms, then the refresh put it at 4178
 * — a whole viewport short, with the document height unchanged the whole
 * time). This is the CRITIC-LEDGER F09 mechanism, and it is not
 * observable from the outside: no height changes, and a refresh's scroll
 * jolt is indistinguishable from a reader's. So the engine says when it
 * has finished measuring, and the landing re-asserts itself once.
 */
export const LAYOUT_SETTLED_EVENT = "paper:layout-settled";

/**
 * Announce that trigger geometry has been re-measured. Call after every
 * `ScrollTrigger.refresh()` that can move the page under a landing.
 */
export function announceLayoutSettled(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LAYOUT_SETTLED_EVENT));
}

/**
 * Re-land a history traversal on the anchor its URL names.
 *
 * Back/Forward across section entries must reproduce the click that
 * created them, at the same offset; a hash-less entry is left to the
 * browser's own (pixel-exact) restoration.
 *
 * @returns True when this module moved the page
 */
export function restoreLanding(): boolean {
  const target = anchorFor(window.location.hash);
  if (!target) return false;
  window.scrollTo({ top: landingTop(target), behavior: "auto" });
  return true;
}

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
