"use client";

import { useTheme } from "@/hooks/useTheme";
import { themeConfigs, themeIds, ThemeId } from "@/config/themes";
import { Palette, X } from "lucide-react";
import { useState, useEffect } from "react";
import gsap from "gsap";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuId = "theme-switcher-menu";

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(
        ".theme-menu-item",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [isOpen]);

  const handleThemeChange = (id: ThemeId) => {
    if (id === theme) {
      setIsOpen(false);
      return;
    }

    // Cross-theme transition animation
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-[99999] bg-black pointer-events-none";
    overlay.dataset.themeTransition = "true";
    overlay.style.opacity = "0";
    document.body.appendChild(overlay);

    gsap.to(overlay, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete: () => {
        setTheme(id);
        setIsOpen(false);

        // Scroll to top on theme change for full effect
        window.scrollTo(0, 0);

        gsap.to(overlay, {
          opacity: 0,
          duration: 0.6,
          delay: 0.2,
          ease: "power2.inOut",
          onComplete: () => overlay.remove(),
        });
      },
    });
  };

  return (
    <div className="fixed right-6 bottom-6 z-[100]">
      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label="Theme options"
          className="animate-in fade-in zoom-in absolute right-0 bottom-16 mb-2 flex w-64 origin-bottom-right flex-col gap-2 rounded-2xl border border-white/10 bg-black/80 p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl duration-200"
        >
          <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-semibold tracking-widest text-white/70 uppercase">
              Visual Modes
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/50 transition-colors hover:text-white"
              aria-label="Close theme menu"
            >
              <X size={16} />
            </button>
          </div>
          {themeIds.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={theme === id}
              aria-label={`Use ${themeConfigs[id].label} theme`}
              onClick={() => handleThemeChange(id)}
              className={`theme-menu-item flex flex-col items-start rounded-xl px-4 py-3 text-sm transition-all duration-300 ${
                theme === id
                  ? "border border-white/20 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  : "border border-transparent hover:border-white/10 hover:bg-white/5"
              }`}
            >
              <span
                className={`mb-1 font-semibold ${theme === id ? "text-white" : "text-white/80"}`}
              >
                {themeConfigs[id].label}
              </span>
              <span className="line-clamp-1 text-left text-xs text-white/40">
                {themeConfigs[id].description}
              </span>
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          isOpen
            ? "scale-90 border-white bg-white text-black"
            : "border-white/20 bg-black/80 text-white hover:scale-110 hover:border-white/50 hover:bg-black"
        }`}
        aria-label="Select theme"
        aria-expanded={isOpen}
        aria-controls={menuId}
      >
        <Palette size={24} />
      </button>
    </div>
  );
}
