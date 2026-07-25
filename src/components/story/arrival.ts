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
 *   - WHERE it lands. `anchorLanding()`/`landingTop()` are the one
 *     anchor landing contract — the target's top, one masthead band
 *     below the viewport top — and that band has exactly ONE owner:
 *     `scroll-padding-top` on `html` (globals.css). `scrollIntoView`
 *     is never used here because it would ADD the element's own
 *     `scroll-margin-top` on top of that band (CRITIC-LEDGER F69).
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
 * Last-resort masthead band, in px, for the one environment that cannot
 * report the real one (SSR, or a stylesheet that has not parsed yet).
 * Kept equal to globals.css's authored `scroll-padding-top: 6rem`.
 */
const ANCHOR_LANDING_FALLBACK = 96;

/**
 * The masthead band every landing clears — THE number, read from the
 * one place that declares it.
 *
 * CRITIC-LEDGER F69 counted four constants claiming to be this height
 * and measured three different landings for one 68px masthead: the
 * browser's own fragment jump jumped 192px (`scroll-padding-top: 6rem`
 * on the container PLUS `scroll-margin-top: 6rem` on the section — a
 * scroll-into-view operation adds them), a cited figure 208px (its
 * `scroll-margin-top` was 7rem), and this contract 96px. The
 * `scroll-margin-top` rules are gone; `scroll-padding-top` is the sole
 * declaration, so the browser's landing and this one are the same
 * number by construction and cannot drift apart in a later edit.
 *
 * A computed-style read costs one layout query per LANDING — landings
 * are rare (a click, a hash, a traversal), never per frame.
 *
 * @returns The masthead band in px
 */
export function anchorLanding(): number {
  if (typeof window === "undefined") return ANCHOR_LANDING_FALLBACK;
  const declared = getComputedStyle(document.documentElement).scrollPaddingTop;
  const px = Number.parseFloat(declared);
  return Number.isFinite(px) && px > 0 ? px : ANCHOR_LANDING_FALLBACK;
}

/**
 * Document scroll position that lands `el` under the fixed masthead.
 *
 * @param el - The anchor target
 * @returns The scrollY the landing should end at
 */
export function landingTop(el: HTMLElement): number {
  return window.scrollY + el.getBoundingClientRect().top - anchorLanding();
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
