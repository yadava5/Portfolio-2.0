"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { defaultThemeId, themeIds } from "@/config/themes";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={defaultThemeId}
      enableSystem={false}
      enableColorScheme={false}
      storageKey="portfolio-theme"
      themes={themeIds}
    >
      {children}
    </NextThemesProvider>
  );
}
