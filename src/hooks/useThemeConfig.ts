"use client";

import { useTheme } from "next-themes";
import { THEME_OPTIONS, type ThemeName } from "@/lib/themes";

/**
 * Theme configuration object containing colors, fonts, and animation settings
 */
export interface ThemeConfig {
  /** Theme name identifier */
  name: ThemeName;
  /** Display label for the theme */
  label: string;
  /** RGB color tuple: [primary, secondary, tertiary] */
  colors: [string, string, string];
  /** Description of the theme */
  description: string;
  /** Font family for display/headings */
  fontDisplay: string;
  /** Font family for body text */
  fontBody: string;
}

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

  // Compute theme config directly without useState
  const themeConfig = !theme
    ? THEME_OPTIONS[0]
    : THEME_OPTIONS.find((t) => t.name === theme) || THEME_OPTIONS[0];

  return themeConfig;
}
