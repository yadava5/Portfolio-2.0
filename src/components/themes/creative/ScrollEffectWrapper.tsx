/**
 * @fileoverview Applies theme-specific scroll effects to sections
 *
 * This component wraps theme sections with the appropriate scroll behavior
 * based on the active theme. Each theme has unique scroll characteristics.
 */

"use client";

import { ZoomTransitionWrapper } from "@/components/effects/ZoomTransitionWrapper";
import { HorizontalScrollSection } from "@/components/effects/HorizontalScrollSection";
import { FullPageSnap } from "@/components/effects/FullPageSnap";
import { ZoomInDolly } from "@/components/effects/ZoomInDolly";
import type { ThemeName } from "@/lib/themes";
import type { ReactNode } from "react";

interface ScrollEffectWrapperProps {
  /** Theme name */
  theme: ThemeName;
  /** Section name (Hero, About, Projects, etc.) */
  section: string;
  /** Content to wrap */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Applies theme-specific scroll effects to sections
 *
 * Different themes have different scroll behaviors:
 * - Dark Luxe: Zoom transitions between sections
 * - Paper-Ink: Horizontal scroll for Projects
 * - Editorial: Full-page snap scrolling
 * - Noir Cinema: Zoom-in dolly effect with parallax
 * - Neon Cyber: Horizontal page scroll (applied globally)
 *
 * @param props - Component props
 * @returns Wrapped section with theme-appropriate scroll behavior
 */
export function ScrollEffectWrapper({
  theme,
  section,
  children,
  className = "",
}: ScrollEffectWrapperProps) {
  // Dark Luxe: All sections have zoom transition
  if (theme === "dark-luxe") {
    return (
      <ZoomTransitionWrapper className={className}>
        {children}
      </ZoomTransitionWrapper>
    );
  }

  // Paper-Ink: Projects section scrolls horizontally
  if (theme === "paper-ink") {
    if (section === "Projects") {
      return (
        <HorizontalScrollSection className={className}>
          {children}
        </HorizontalScrollSection>
      );
    }
    // Other sections scroll normally
    return <div className={className}>{children}</div>;
  }

  // Editorial: All sections snap to full-page
  if (theme === "editorial") {
    return (
      <FullPageSnap className={className}>
        {children}
      </FullPageSnap>
    );
  }

  // Noir Cinema: All sections zoom-in with parallax
  if (theme === "noir-cinema") {
    return (
      <ZoomInDolly className={className} parallaxIntensity={0.3}>
        {children}
      </ZoomInDolly>
    );
  }

  // Neon Cyber: Entire page is horizontal (handled by page wrapper)
  // Regular sections here, horizontal scroll applied globally
  if (theme === "neon-cyber") {
    return <div className={className}>{children}</div>;
  }

  // Default: no scroll effects
  return <div className={className}>{children}</div>;
}
