"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { MagneticButton } from "@/components/effects/MagneticButton";

const NAV_ITEMS = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-black/20 backdrop-blur-md border-b border-white/10 py-4" : "bg-transparent py-6"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <MagneticButton
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="text-2xl font-bold tracking-tighter text-white"
        >
          AY
        </MagneticButton>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <MagneticButton
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                {item.label}
              </MagneticButton>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
