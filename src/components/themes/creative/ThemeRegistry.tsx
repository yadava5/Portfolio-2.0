"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import type { ThemeName } from "@/lib/themes";
import { ScrollEffectWrapper } from "./ScrollEffectWrapper";
import { HorizontalPageScroll } from "@/components/effects/HorizontalPageScroll";
import {
  Hero,
  About,
  Experience,
  Projects,
  Skills,
  Testimonials,
  Contact,
} from "@/components/shared";

// Section definitions - all using shared components
const sections = {
  Hero,
  About,
  Experience,
  Projects,
  Skills,
  Testimonials,
  Contact,
} as const;

// Section names used across all themes
const SECTION_NAMES = Object.keys(sections) as Array<keyof typeof sections>;

export default function ThemedSections() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const activeTheme = (mounted ? theme : "dark-luxe") as ThemeName;

  // For Neon Cyber, wrap entire content in horizontal scroll
  if (activeTheme === "neon-cyber") {
    return (
      <HorizontalPageScroll panelCount={SECTION_NAMES.length}>
        {SECTION_NAMES.map((name, index) => {
          const Component = sections[name];
          return (
            <div
              key={`${activeTheme}-${name}`}
              style={{
                minWidth: "100vw",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <ScrollEffectWrapper
                theme={activeTheme}
                section={name}
                className="w-full"
              >
                <Component themeId={activeTheme} />
              </ScrollEffectWrapper>
              {index < SECTION_NAMES.length - 1 && (
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-20" />
              )}
            </div>
          );
        })}
      </HorizontalPageScroll>
    );
  }

  // For all other themes, use standard vertical scroll with theme-specific effects
  return (
    <>
      {SECTION_NAMES.map((name, index) => {
        const Component = sections[name];
        return (
          <div key={`${activeTheme}-${name}`}>
            <ScrollEffectWrapper theme={activeTheme} section={name}>
              <Component themeId={activeTheme} />
            </ScrollEffectWrapper>
            {index < SECTION_NAMES.length - 1 && (
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-20" />
            )}
          </div>
        );
      })}
    </>
  );
}
