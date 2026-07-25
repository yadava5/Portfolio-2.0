/**
 * @fileoverview LenisAnchor — in-page anchor routed through the ONE loop.
 *
 * A plain `<a href="#…">` whose click is handed to the shared scroll
 * controller: the browser's own smooth flight to the shared landing
 * contract (arrival.ts). When the engine is absent (reduced motion or
 * the quiet motion toggle), it falls back to an instant jump to the
 * SAME position — never init-then-disable (A7).
 */

"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useLenis } from "@/components/layout/SmoothScroll";
import {
  announceArrival,
  landingTop,
  pushLanding,
} from "@/components/story/arrival";

interface LenisAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** In-page target, e.g. "#automl" */
  href: string;
  children: ReactNode;
}

/**
 * Anchor link that scrolls through the shared Lenis engine.
 *
 * @param props - Standard anchor props; `href` must be an in-page hash
 * @returns The anchor element
 */
export function LenisAnchor({ href, children, ...rest }: LenisAnchorProps) {
  const lenis = useLenis();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    event.preventDefault();
    /* The section becomes a URL the reader can copy, and a stop Back can
       return to (CRITIC-LEDGER F05). Pushed BEFORE the flight so the
       address bar changes with the click, not a second later. */
    pushLanding(href);
    if (lenis) {
      lenis.scrollTo(target);
    } else {
      /* Static world: instant jump, no animation, SAME landing contract
         as the controller (arrival.ts), so every world lands
         identically. Not scrollIntoView: it would add the target's own
         `scroll-margin-top` to the masthead band (F69). */
      window.scrollTo({ top: landingTop(target), behavior: "auto" });
      announceArrival();
    }
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
