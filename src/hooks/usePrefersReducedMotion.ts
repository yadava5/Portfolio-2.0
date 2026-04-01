"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if user prefers reduced motion
 *
 * Reads the `prefers-reduced-motion: reduce` media query and returns a boolean.
 * Listens for changes to the media query so animations can be disabled dynamically
 * if the user toggles the setting in their OS preferences.
 *
 * SSR-safe: Returns false on the server to avoid hydration mismatches,
 * then updates to the correct value on the client.
 *
 * @returns boolean - true if user prefers reduced motion, false otherwise
 *
 * @example
 * ```tsx
 * export function AnimatedComponent() {
 *   const prefersReducedMotion = usePrefersReducedMotion();
 *
 *   return (
 *     <motion.div
 *       animate={{ opacity: 1 }}
 *       transition={{
 *         duration: prefersReducedMotion ? 0 : 0.5,
 *       }}
 *     >
 *       Content
 *     </motion.div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * export function SmoothScroll() {
 *   const prefersReducedMotion = usePrefersReducedMotion();
 *
 *   useEffect(() => {
 *     if (prefersReducedMotion) {
 *       // Disable smooth scroll
 *       return;
 *     }
 *     // Initialize smooth scroll
 *   }, [prefersReducedMotion]);
 * }
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if the media query is supported
    if (!window.matchMedia) {
      return;
    }

    // Create the media query list
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefersReducedMotion(mediaQuery.matches);

    /**
     * Handle changes to the media query
     * @param e - MediaQueryListEvent or change event
     */
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Modern browsers: use addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    } else {
      // Legacy browsers: use addListener (deprecated but needed for older browsers)
      const legacyHandler = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      (
        mediaQuery as MediaQueryList & {
          addListener: (listener: (e: MediaQueryListEvent) => void) => void;
        }
      ).addListener(legacyHandler);

      return () => {
        (
          mediaQuery as MediaQueryList & {
            removeListener: (
              listener: (e: MediaQueryListEvent) => void
            ) => void;
          }
        ).removeListener(legacyHandler);
      };
    }
  }, []);

  return prefersReducedMotion;
}
