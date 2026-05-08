"use client";

import { useEffect, useState } from "react";
import { useTheme as useNextTheme } from "next-themes";
import { ThemeId, defaultThemeId } from "@/config/themes";

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const activeTheme = mounted ? theme : defaultThemeId;
  const activeResolvedTheme = mounted ? resolvedTheme : defaultThemeId;

  return {
    theme: (activeTheme as ThemeId) || defaultThemeId,
    setTheme: (id: ThemeId) => setTheme(id),
    resolvedTheme: (activeResolvedTheme as ThemeId) || defaultThemeId,
    mounted,
  };
}
