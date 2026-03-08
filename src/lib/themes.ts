/**
 * @fileoverview Shared theme definitions for the multi-theme portfolio.
 */

export type ThemeName =
  | "nebula"
  | "space"
  | "lunar"
  | "cyberpunk"
  | "ocean"
  | "retrowave";

export interface ThemeOption {
  name: ThemeName;
  label: string;
  colors: [string, string, string];
}

export const DEFAULT_THEME: ThemeName = "nebula";

export const THEME_OPTIONS: ThemeOption[] = [
  {
    name: "nebula",
    label: "Nebula",
    colors: ["#8b5cf6", "#06b6d4", "#f472b6"],
  },
  {
    name: "space",
    label: "Space",
    colors: ["#a8c8ff", "#c0c0d0", "#4fc3f7"],
  },
  {
    name: "lunar",
    label: "Lunar",
    colors: ["#ff9800", "#fff3e0", "#ffc107"],
  },
  {
    name: "cyberpunk",
    label: "Cyberpunk",
    colors: ["#00ff41", "#ff006e", "#00d4ff"],
  },
  {
    name: "ocean",
    label: "Ocean",
    colors: ["#00bcd4", "#7affcb", "#ff6b6b"],
  },
  {
    name: "retrowave",
    label: "Retrowave",
    colors: ["#ff2d95", "#b026ff", "#ffe14d"],
  },
];

export const THEME_NAMES = THEME_OPTIONS.map((theme) => theme.name);
