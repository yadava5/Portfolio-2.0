/**
 * @fileoverview LenisAnchor — in-page anchor routed through the ONE loop.
 *
 * A plain `<a href="#…">` whose click is handed to the shared Lenis
 * instance (1.2s expo-out, 6rem offset — plan 3.9 / amendment A1). When
 * the engine is absent (reduced motion or the quiet motion toggle), it
 * falls back to an instant native jump — never init-then-disable (A7).
 */

"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import {
  useLenis,
  SCROLL_DURATION,
  SCROLL_OFFSET,
  scrollEasing,
} from "@/components/layout/SmoothScroll";

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
    if (lenis) {
      lenis.scrollTo(target, {
        duration: SCROLL_DURATION,
        easing: scrollEasing,
        offset: SCROLL_OFFSET,
      });
    } else {
      /* Static world: instant jump, no animation. Manual offset math —
         the SAME landing contract as the controller. scrollIntoView
         would apply BOTH scroll-padding-top AND scroll-margin-top
         (~12rem = 192px, the double-count); this applies exactly one
         6rem header offset, so every world lands identically. */
      const y =
        window.scrollY + target.getBoundingClientRect().top + SCROLL_OFFSET;
      window.scrollTo({ top: y, behavior: "auto" });
    }
  };

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
