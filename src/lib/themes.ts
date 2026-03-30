/**
 * @fileoverview Shared theme definitions for the multi-theme portfolio.
 */

export type ThemeName =
  | "paper-ink"
  | "dark-luxe"
  | "editorial"
  | "noir-cinema"
  | "neon-cyber";

export interface ThemeOption {
  name: ThemeName;
  label: string;
  colors: [string, string, string];
  description: string;
  fontDisplay: string;
  fontBody: string;
}

export const DEFAULT_THEME: ThemeName = "dark-luxe";

export const THEME_OPTIONS: ThemeOption[] = [
  {
    name: "paper-ink",
    label: "Paper & Ink",
    colors: ["#1a1a1a", "#c00000", "#f5f1de"],
    description: "Newspaper broadsheet layout",
    fontDisplay: "'Playfair Display', serif",
    fontBody: "'Source Serif 4', serif",
  },
  {
    name: "dark-luxe",
    label: "Dark Luxe",
    colors: ["#d4af37", "#1a1a1a", "#b8860b"],
    description: "Black & gold premium brand",
    fontDisplay: "'Playfair Display', serif",
    fontBody: "'Inter', sans-serif",
  },
  {
    name: "editorial",
    label: "Editorial",
    colors: ["#ff4444", "#1a1a1a", "#ffffff"],
    description: "High-fashion magazine layout",
    fontDisplay: "'Instrument Serif', serif",
    fontBody: "'Inter', sans-serif",
  },
  {
    name: "noir-cinema",
    label: "Noir Cinema",
    colors: ["#e8d5b7", "#0a0a0a", "#c0a060"],
    description: "Cinematic film noir experience",
    fontDisplay: "'Bebas Neue', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
  {
    name: "neon-cyber",
    label: "Neon Cyber",
    colors: ["#00ff88", "#ff006e", "#00d4ff"],
    description: "Cyberpunk neon HUD interface",
    fontDisplay: "'Orbitron', sans-serif",
    fontBody: "'JetBrains Mono', monospace",
  },
];

export const THEME_NAMES = THEME_OPTIONS.map((theme) => theme.name);
