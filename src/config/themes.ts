export type ThemeId =
  | "technical-operations-atlas"
  | "liquid-glass"
  | "cosmic-voyage"
  | "retro-terminal"
  | "synthwave-sunset"
  | "bioluminescent-deep";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  label: string;
  description: string;
}

const liquidGlass: ThemeConfig = {
  id: "liquid-glass",
  name: "liquid-glass",
  label: "Liquid Glass",
  description: "Aurora mesh gradient and modern glassmorphism",
};

const technicalOperationsAtlas: ThemeConfig = {
  id: "technical-operations-atlas",
  name: "technical-operations-atlas",
  label: "Technical Operations Atlas",
  description: "Evidence-first CS portfolio with recruiter-ready proof",
};

const cosmicVoyage: ThemeConfig = {
  id: "cosmic-voyage",
  name: "cosmic-voyage",
  label: "Cosmic Voyage",
  description: "Planetariums, aurora borealis, star maps",
};

const retroTerminal: ThemeConfig = {
  id: "retro-terminal",
  name: "retro-terminal",
  label: "Retro Terminal",
  description: "CRT monitors, hacker culture, the Matrix",
};

const synthwaveSunset: ThemeConfig = {
  id: "synthwave-sunset",
  name: "synthwave-sunset",
  label: "Synthwave Sunset",
  description: "Outrun, Tron, 80s retro-futurism, vaporwave",
};

const bioluminescentDeep: ThemeConfig = {
  id: "bioluminescent-deep",
  name: "bioluminescent-deep",
  label: "Bioluminescent Deep",
  description: "Deep ocean footage, Avatar bioluminescence",
};

export const themeConfigs: Record<ThemeId, ThemeConfig> = {
  "technical-operations-atlas": technicalOperationsAtlas,
  "liquid-glass": liquidGlass,
  "cosmic-voyage": cosmicVoyage,
  "retro-terminal": retroTerminal,
  "synthwave-sunset": synthwaveSunset,
  "bioluminescent-deep": bioluminescentDeep,
};

export const themeIds: ThemeId[] = ["technical-operations-atlas"];

export const defaultThemeId: ThemeId = "technical-operations-atlas";

export function getThemeConfig(themeId: string): ThemeConfig {
  return themeConfigs[themeId as ThemeId] ?? themeConfigs[defaultThemeId];
}
