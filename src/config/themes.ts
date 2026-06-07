export type ThemeId = "technical-operations-atlas";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  label: string;
  description: string;
}

export const defaultThemeId: ThemeId = "technical-operations-atlas";

export const themeConfigs: Record<ThemeId, ThemeConfig> = {
  "technical-operations-atlas": {
    id: "technical-operations-atlas",
    name: "technical-operations-atlas",
    label: "Technical Operations Atlas",
    description: "Evidence-first CS portfolio with recruiter-ready proof",
  },
};

export const themeIds: ThemeId[] = [defaultThemeId];

export function getThemeConfig(themeId: string): ThemeConfig {
  return themeConfigs[themeId as ThemeId] ?? themeConfigs[defaultThemeId];
}
