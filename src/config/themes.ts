/**
 * @fileoverview Centralized theme configuration system
 *
 * Single source of truth for all theme-specific values: colors, fonts,
 * animation settings, and layout modes. Values are extracted from the
 * existing CSS custom properties in globals.css and theme definitions
 * in lib/themes.ts.
 *
 * Usage:
 * ```ts
 * import { getThemeConfig, themeIds } from "@/config/themes";
 * const config = getThemeConfig("dark-luxe");
 * ```
 */

/* ──────────────────────────────────────────────
   Type definitions
   ────────────────────────────────────────────── */

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  foreground: string;
  foregroundMuted: string;
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  cardBg: string;
  cardBgSolid: string;
  glowColor: string;
  glowStrong: string;
  glassBackground: string;
  glassBorder: string;
  glassShadow: string;
}

export interface ThemeFonts {
  display: string;
  body: string;
  mono: string;
}

export interface ThemeAnimation {
  springConfig: { tension: number; friction: number };
  scrollTrigger: {
    start: string;
    end: string;
    scrub: boolean | number;
  };
  hoverScale: number;
  transitionDuration: number;
  reducedMotionFallback: boolean;
}

export type HeroAlignment = "center" | "left" | "right";
export type ProjectsGrid =
  | "asymmetric"
  | "horizontal"
  | "grid-3"
  | "centered"
  | "terminal";
export type CardStyle =
  | "bordered"
  | "elevated"
  | "flat"
  | "outlined"
  | "terminal";
export type LayoutMode =
  | "luxe"
  | "newspaper"
  | "editorial"
  | "cinema"
  | "cyber";

export interface ThemeLayout {
  mode: LayoutMode;
  heroAlignment: HeroAlignment;
  projectsGrid: ProjectsGrid;
  cardStyle: CardStyle;
  borderRadius: string;
  sectionPadding: string;
  containerMax: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  label: string;
  description: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  animation: ThemeAnimation;
  layout: ThemeLayout;
}

/* ──────────────────────────────────────────────
   Theme definitions (values extracted from globals.css)
   ────────────────────────────────────────────── */

const darkLuxe: ThemeConfig = {
  id: "dark-luxe",
  name: "dark-luxe",
  label: "Dark Luxe",
  description: "Black & gold premium brand",
  colors: {
    background: "#0a0a0a",
    backgroundSecondary: "#141414",
    foreground: "#f5f0e8",
    foregroundMuted: "#b8a896",
    accentPrimary: "#e8c547",
    accentSecondary: "#d4a745",
    accentTertiary: "#f5e6c8",
    cardBg: "#1a1a1a",
    cardBgSolid: "#111111",
    glowColor: "rgba(232, 197, 71, 0.2)",
    glowStrong: "rgba(232, 197, 71, 0.35)",
    glassBackground: "rgba(255, 255, 255, 0.03)",
    glassBorder: "rgba(232, 197, 71, 0.12)",
    glassShadow: "rgba(0, 0, 0, 0.5)",
  },
  fonts: {
    display: "'Playfair Display', serif",
    body: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Courier New', monospace",
  },
  animation: {
    springConfig: { tension: 180, friction: 26 },
    scrollTrigger: { start: "top 85%", end: "top 20%", scrub: false },
    hoverScale: 1.03,
    transitionDuration: 300,
    reducedMotionFallback: true,
  },
  layout: {
    mode: "luxe",
    heroAlignment: "center",
    projectsGrid: "asymmetric",
    cardStyle: "elevated",
    borderRadius: "2px",
    sectionPadding: "6rem",
    containerMax: "1200px",
  },
};

const paperInk: ThemeConfig = {
  id: "paper-ink",
  name: "paper-ink",
  label: "Paper & Ink",
  description: "Newspaper broadsheet layout",
  colors: {
    background: "#f5f1de",
    backgroundSecondary: "#ebe7d4",
    foreground: "#1a1a1a",
    foregroundMuted: "#4a4a4a",
    accentPrimary: "#c00000",
    accentSecondary: "#1a1a1a",
    accentTertiary: "#8b0000",
    cardBg: "#faf8ef",
    cardBgSolid: "#f0edd9",
    glowColor: "rgba(192, 0, 0, 0.15)",
    glowStrong: "rgba(192, 0, 0, 0.25)",
    glassBackground: "rgba(250, 248, 239, 0.85)",
    glassBorder: "rgba(26, 26, 26, 0.15)",
    glassShadow: "rgba(0, 0, 0, 0.1)",
  },
  fonts: {
    display: "'Playfair Display', serif",
    body: "'Source Serif 4', serif",
    mono: "'JetBrains Mono', 'Courier New', monospace",
  },
  animation: {
    springConfig: { tension: 140, friction: 22 },
    scrollTrigger: { start: "top 80%", end: "top 25%", scrub: false },
    hoverScale: 1.02,
    transitionDuration: 350,
    reducedMotionFallback: true,
  },
  layout: {
    mode: "newspaper",
    heroAlignment: "left",
    projectsGrid: "horizontal",
    cardStyle: "bordered",
    borderRadius: "0px",
    sectionPadding: "5rem",
    containerMax: "1100px",
  },
};

const editorial: ThemeConfig = {
  id: "editorial",
  name: "editorial",
  label: "Editorial",
  description: "High-fashion magazine layout",
  colors: {
    background: "#fefefe",
    backgroundSecondary: "#f4f4f4",
    foreground: "#111111",
    foregroundMuted: "#555555",
    accentPrimary: "#d95555",
    accentSecondary: "#111111",
    accentTertiary: "#ff6b6b",
    cardBg: "#ffffff",
    cardBgSolid: "#fafafa",
    glowColor: "rgba(217, 85, 85, 0.1)",
    glowStrong: "rgba(217, 85, 85, 0.2)",
    glassBackground: "rgba(255, 255, 255, 0.92)",
    glassBorder: "rgba(0, 0, 0, 0.06)",
    glassShadow: "rgba(0, 0, 0, 0.04)",
  },
  fonts: {
    display: "'Instrument Serif', serif",
    body: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Courier New', monospace",
  },
  animation: {
    springConfig: { tension: 200, friction: 28 },
    scrollTrigger: { start: "top 80%", end: "top 15%", scrub: 0.5 },
    hoverScale: 1.01,
    transitionDuration: 250,
    reducedMotionFallback: true,
  },
  layout: {
    mode: "editorial",
    heroAlignment: "left",
    projectsGrid: "grid-3",
    cardStyle: "flat",
    borderRadius: "0px",
    sectionPadding: "5rem",
    containerMax: "1280px",
  },
};

const noirCinema: ThemeConfig = {
  id: "noir-cinema",
  name: "noir-cinema",
  label: "Noir Cinema",
  description: "Cinematic film noir experience",
  colors: {
    background: "#0a0a0a",
    backgroundSecondary: "#121212",
    foreground: "#e8d5b7",
    foregroundMuted: "#a8956e",
    accentPrimary: "#c0a060",
    accentSecondary: "#e8d5b7",
    accentTertiary: "#8a7040",
    cardBg: "#161616",
    cardBgSolid: "#0f0f0f",
    glowColor: "rgba(192, 160, 96, 0.15)",
    glowStrong: "rgba(192, 160, 96, 0.28)",
    glassBackground: "rgba(255, 255, 255, 0.02)",
    glassBorder: "rgba(192, 160, 96, 0.1)",
    glassShadow: "rgba(0, 0, 0, 0.6)",
  },
  fonts: {
    display: "'Bebas Neue', sans-serif",
    body: "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Courier New', monospace",
  },
  animation: {
    springConfig: { tension: 120, friction: 20 },
    scrollTrigger: { start: "top 90%", end: "top 20%", scrub: 1 },
    hoverScale: 1.02,
    transitionDuration: 500,
    reducedMotionFallback: true,
  },
  layout: {
    mode: "cinema",
    heroAlignment: "center",
    projectsGrid: "centered",
    cardStyle: "outlined",
    borderRadius: "0px",
    sectionPadding: "6rem",
    containerMax: "1100px",
  },
};

const neonCyber: ThemeConfig = {
  id: "neon-cyber",
  name: "neon-cyber",
  label: "Neon Cyber",
  description: "Cyberpunk neon HUD interface",
  colors: {
    background: "#050510",
    backgroundSecondary: "#0a0a20",
    foreground: "#e0ffe0",
    foregroundMuted: "#60a080",
    accentPrimary: "#00ff88",
    accentSecondary: "#ff006e",
    accentTertiary: "#00d4ff",
    cardBg: "#0a0a1f",
    cardBgSolid: "#070714",
    glowColor: "rgba(0, 255, 136, 0.15)",
    glowStrong: "rgba(0, 255, 136, 0.3)",
    glassBackground: "rgba(0, 255, 136, 0.03)",
    glassBorder: "rgba(0, 255, 136, 0.15)",
    glassShadow: "rgba(0, 0, 0, 0.7)",
  },
  fonts: {
    display: "'Orbitron', sans-serif",
    body: "'JetBrains Mono', monospace",
    mono: "'JetBrains Mono', monospace",
  },
  animation: {
    springConfig: { tension: 220, friction: 30 },
    scrollTrigger: { start: "top 85%", end: "top 15%", scrub: false },
    hoverScale: 1.04,
    transitionDuration: 200,
    reducedMotionFallback: true,
  },
  layout: {
    mode: "cyber",
    heroAlignment: "left",
    projectsGrid: "terminal",
    cardStyle: "terminal",
    borderRadius: "0px",
    sectionPadding: "4rem",
    containerMax: "1200px",
  },
};

/* ──────────────────────────────────────────────
   Theme registry
   ────────────────────────────────────────────── */

/** Map of all theme configs keyed by theme ID */
export const themeConfigs: Record<string, ThemeConfig> = {
  "dark-luxe": darkLuxe,
  "paper-ink": paperInk,
  editorial: editorial,
  "noir-cinema": noirCinema,
  "neon-cyber": neonCyber,
};

/** Array of all theme IDs */
export const themeIds = Object.keys(themeConfigs);

/** Default theme ID used when no theme is selected */
export const defaultThemeId = "dark-luxe";

/**
 * Get the full configuration for a theme by its ID.
 *
 * @param themeId - The theme identifier (e.g. "dark-luxe")
 * @returns The complete theme config, or the default theme if not found
 *
 * @example
 * ```ts
 * const config = getThemeConfig("paper-ink");
 * console.log(config.colors.accentPrimary); // "#c00000"
 * ```
 */
export function getThemeConfig(themeId: string): ThemeConfig {
  return themeConfigs[themeId] ?? themeConfigs[defaultThemeId];
}
