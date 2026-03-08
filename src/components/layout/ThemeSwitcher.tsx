/**
 * @fileoverview Floating theme switcher for the six portfolio themes.
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { DEFAULT_THEME, THEME_OPTIONS, type ThemeName } from "@/lib/themes";

/**
 * Floating theme picker that persists the selected palette in localStorage.
 *
 * @returns Theme switcher button and dropdown
 */
export default function ThemeSwitcher() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (
        containerRef.current &&
        target instanceof Node &&
        !containerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const activeTheme = useMemo<ThemeName>(() => {
    if (!mounted) return DEFAULT_THEME;
    return (theme as ThemeName) ?? DEFAULT_THEME;
  }, [mounted, theme]);

  const activeOption =
    THEME_OPTIONS.find((option) => option.name === activeTheme) ??
    THEME_OPTIONS[0];

  return (
    <div
      ref={containerRef}
      className="fixed right-4 bottom-4 z-[60] md:right-6 md:bottom-6"
    >
      <div
        className={cn(
          "pointer-events-none absolute right-0 bottom-16 w-72 origin-bottom-right transition-all duration-(--transition-base) ease-(--easing-smooth)",
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-95 opacity-0"
        )}
      >
        <div className="rounded-3xl border border-(--glass-border) bg-(--glass-background) p-3 shadow-2xl shadow-black/45 backdrop-blur-2xl">
          <div className="mb-3 px-2">
            <p className="text-foreground text-sm font-semibold">Theme</p>
            <p className="text-foreground-muted text-xs">
              Dark palettes only. Nebula matches the current default.
            </p>
          </div>

          <div className="grid gap-1">
            {THEME_OPTIONS.map((option) => {
              const selected = option.name === activeTheme;

              return (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => {
                    setTheme(option.name);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition-all duration-(--transition-fast)",
                    selected
                      ? "border-accent-primary bg-(--surface-3)"
                      : "border-transparent bg-transparent hover:border-(--glass-border) hover:bg-(--surface-2)"
                  )}
                  aria-pressed={selected}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5" aria-hidden="true">
                      {option.colors.map((color) => (
                        <span
                          key={color}
                          className="h-3 w-3 rounded-full border border-white/15"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      {option.label}
                    </span>
                  </span>

                  <Check
                    className={cn(
                      "h-4 w-4 transition-opacity",
                      selected ? "text-accent-primary opacity-100" : "opacity-0"
                    )}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "group flex items-center gap-3 rounded-full border border-(--glass-border) bg-(--glass-background) px-4 py-3 shadow-xl shadow-black/35 backdrop-blur-xl transition-all duration-(--transition-base) ease-(--easing-smooth)",
          "hover:-translate-y-0.5 hover:border-accent-primary/40 hover:shadow-(--glow-color)",
          open && "border-accent-primary/40 shadow-(--glow-color)"
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Select theme. Current theme: ${activeOption.label}`}
      >
        <span
          className="rounded-full p-2"
          style={{ background: "var(--accent-gradient)" }}
          aria-hidden="true"
        >
          <Palette className="h-4 w-4 text-black/80" />
        </span>
        <span className="hidden text-left sm:block">
          <span className="text-foreground-muted block text-[10px] font-semibold tracking-[0.2em] uppercase">
            Theme
          </span>
          <span className="text-foreground block text-sm font-semibold">
            {activeOption.label}
          </span>
        </span>
      </button>
    </div>
  );
}
