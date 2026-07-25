/**
 * @fileoverview HashRealign — keeps deep links honest after the font swap.
 *
 * The browser performs its native `#anchor` jump against the fallback-font
 * layout; when Fraunces/Newsreader swap in, chapter heights change and the
 * anchored chapter drifts out of the viewport. This re-runs the jump once
 * the fonts are ready — an instant position correction (never an
 * animation), so it behaves identically in every motion mode (A7).
 */

"use client";

import { useEffect } from "react";
import { announceArrival } from "@/components/story/arrival";

/**
 * Re-anchors the initial location hash after web fonts finish loading.
 *
 * @returns null — side-effect only
 */
export function HashRealign() {
  useEffect(() => {
    let cancelled = false;

    /* Every later hash landing is a landing too — a pasted `/#values`, a
       Back that returns to a section, an in-page anchor the browser
       handles natively. None of them crosses a trigger line, so each one
       announces itself (CRITIC-LEDGER F01). */
    const onLanding = () => announceArrival();
    window.addEventListener("hashchange", onLanding);
    window.addEventListener("popstate", onLanding);

    const { hash } = window.location;
    let target: HTMLElement | null = null;
    try {
      target = hash ? document.querySelector<HTMLElement>(hash) : null;
    } catch {
      /* malformed hash — nothing to realign */
    }

    if (target) {
      const anchor = target;
      document.fonts?.ready.then(() => {
        if (cancelled) return;
        anchor.scrollIntoView({ behavior: "auto" });
        /* A shared link is a landing, not a scroll. */
        announceArrival();
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", onLanding);
      window.removeEventListener("popstate", onLanding);
    };
  }, []);

  return null;
}
