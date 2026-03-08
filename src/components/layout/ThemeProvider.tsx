/**
 * @fileoverview Theme provider backed by next-themes.
 */

"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { DEFAULT_THEME, THEME_NAMES } from "@/lib/themes";

/** Props for the ThemeProvider component */
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Wraps the app in the multi-theme provider.
 *
 * @param props - Component props
 * @returns The provider-wrapped subtree
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme={DEFAULT_THEME}
      enableSystem={false}
      enableColorScheme={false}
      storageKey="portfolio-theme"
      themes={THEME_NAMES}
    >
      {children}
    </NextThemesProvider>
  );
}
