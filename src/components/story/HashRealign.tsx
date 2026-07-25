/**
 * @fileoverview HashRealign — the URL's side of the landing contract.
 *
 * Three duties, all of them "the reader asked for a section by its URL":
 *
 *  1. DEEP LINK. The browser performs its native `#anchor` jump against
 *     the fallback-font layout; when Fraunces/Newsreader swap in, chapter
 *     heights change and the anchored chapter drifts out of the viewport.
 *     This re-runs the jump once the fonts are ready — an instant
 *     position correction (never an animation), so it behaves identically
 *     in every motion mode (A7) — through the SAME landing contract the
 *     nav click uses (arrival.ts `landingTop`), so a shared link and a
 *     click land on the same pixel instead of 96px apart.
 *
 *  2. TRAVERSAL. Back/Forward across the section entries the nav pushes
 *     (CRITIC-LEDGER F05) re-land on the anchor their URL names. Entries
 *     WITHOUT a hash — a reload, and the entry the reader was on before
 *     they first clicked nav — are left to the browser's own pixel-exact
 *     restoration; `history.scrollRestoration` is never touched.
 *
 *  3. ANNOUNCEMENT. Every one of those is a LANDING, not a scroll: it
 *     crosses no trigger lines, so it announces itself and the reveal
 *     engine settles the destination (CRITIC-LEDGER F01).
 */

"use client";

import { useEffect } from "react";
import {
  anchorFor,
  announceArrival,
  landingTop,
  LAYOUT_SETTLED_EVENT,
  restoreLanding,
} from "@/components/story/arrival";

/**
 * How long after mount a re-measure may still re-assert the landing.
 * Past this the reader owns the scroll position, whatever moved it.
 */
const LANDING_GRACE_MS = 4000;

/**
 * Re-anchors hash landings — on load, and on every history traversal.
 *
 * @returns null — side-effect only
 */
export function HashRealign() {
  useEffect(() => {
    let cancelled = false;

    /* A traversal restores position before popstate fires; re-landing
       here overrides it for the section entries the nav created, so
       Back/Forward reproduce the click that made them. A pasted
       `/#values` or a native in-page anchor arrives on hashchange, at
       the browser's own ~12rem offset — realign that to the one
       contract. Both then announce (F01). */
    const onLanding = () => {
      restoreLanding();
      announceArrival();
    };
    window.addEventListener("popstate", onLanding);
    window.addEventListener("hashchange", onLanding);

    const target = anchorFor(window.location.hash);
    const deadline = performance.now() + LANDING_GRACE_MS;
    /* The engine re-measures after the fonts settle and moves the page
       by the ch04 pin distance; re-assert the landing when it says it
       has finished, so a shared link never sits a screen short (F09). */
    const onLayoutSettled = () => {
      if (cancelled || !target || performance.now() > deadline) return;
      window.scrollTo({ top: landingTop(target), behavior: "auto" });
    };
    window.addEventListener(LAYOUT_SETTLED_EVENT, onLayoutSettled);

    if (target) {
      document.fonts?.ready.then(() => {
        if (cancelled) return;
        window.scrollTo({ top: landingTop(target), behavior: "auto" });
        announceArrival();
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener(LAYOUT_SETTLED_EVENT, onLayoutSettled);
      window.removeEventListener("popstate", onLanding);
      window.removeEventListener("hashchange", onLanding);
    };
  }, []);

  return null;
}
