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

/**
 * Re-anchors the initial location hash after web fonts finish loading.
 *
 * @returns null — side-effect only
 */
export function HashRealign() {
  useEffect(() => {
    const { hash } = window.location;
    if (!hash) return;

    let target: HTMLElement | null = null;
    try {
      target = document.querySelector<HTMLElement>(hash);
    } catch {
      /* malformed hash — nothing to realign */
    }
    if (!target) return;

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) target.scrollIntoView({ behavior: "auto" });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
