"use client";

import { useTheme } from "@/hooks/useTheme";
import { themeConfigs, themeIds, ThemeId } from "@/config/themes";
import { Palette, X } from "lucide-react";
import { useState, useEffect } from "react";
import gsap from "gsap";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="fixed bottom-6 right-6 z-[100]">
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 flex flex-col gap-2 rounded-2xl bg-black/80 p-4 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] w-64 origin-bottom-right animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
            <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">Select Theme</span>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          {themeIds.map((id) => (
            <button
              key={id}
              onClick={() => handleThemeChange(id)}
              className={`theme-menu-item flex flex-col items-start rounded-xl px-4 py-3 text-sm transition-all duration-300 ${
                theme === id
                  ? "bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  : "border border-transparent hover:bg-white/5 hover:border-white/10"
              }`}
            >
              <span className={`font-semibold mb-1 ${theme === id ? "text-white" : "text-white/80"}`}>
                {themeConfigs[id].label}
              </span>
              <span className="text-xs text-white/40 text-left line-clamp-1">
                {themeConfigs[id].description}
              </span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-xl border transition-all duration-300 shadow-2xl ${
          isOpen 
            ? "bg-white text-black border-white scale-90" 
            : "bg-black/80 text-white border-white/20 hover:border-white/50 hover:bg-black hover:scale-110"
        }`}
        aria-label="Toggle theme menu"
      >
        <Palette size={24} />
      </button>
    </div>
  );
}
