"use client";

import { useTheme } from "next-themes";
import { defaultThemeId, getThemeConfig, type ThemeConfig } from "@/config/themes";
export type { ThemeConfig } from "@/config/themes";

/**
 * Hook to read and track the current theme configuration
 *
 * Reads the current theme from the next-themes ThemeProvider context and returns
 * the full theme configuration object. Updates automatically when the theme changes.
 * Works with the existing theme system that stores theme in the `data-theme` attribute.
 *
 * SSR-safe: Returns the default theme on server, then updates to actual theme on client.
 *
 * @returns The current theme configuration object
 *
 * @example
 * ```tsx
 * export function StyledComponent() {
 *   const themeConfig = useThemeConfig();
 *
 *   return (
 *     <div
 *       style={{
 *         color: themeConfig.colors[0],
 *         fontFamily: themeConfig.fontBody,
 *       }}
 *     >
 *       Using {themeConfig.label} theme
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * export function AnimationController() {
 *   const themeConfig = useThemeConfig();
 *
 *   useEffect(() => {
 *     if (themeConfig.name === "neon-cyber") {
 *       // Use more aggressive animations for cyber theme
 *       gsap.to(".element", {
 *         duration: 0.3,
 *         ease: "power2.out",
 *       });
 *     }
 *   }, [themeConfig.name]);
 * }
 * ```
 */
export function useThemeConfig(): ThemeConfig {
  const { theme } = useTheme();
  return getThemeConfig(theme ?? defaultThemeId);
}
