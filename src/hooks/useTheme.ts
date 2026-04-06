"use client";

import { useTheme as useNextTheme } from "next-themes";
import { ThemeId, defaultThemeId } from "@/config/themes";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  return {
    theme: (theme as ThemeId) || defaultThemeId,
    setTheme: (id: ThemeId) => setTheme(id),
    resolvedTheme: (resolvedTheme as ThemeId) || defaultThemeId,
  };
}
