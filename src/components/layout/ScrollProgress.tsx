"use client";

import { useEffect, useState } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const totalHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          const scrollPosition = window.scrollY;
          setProgress(totalHeight > 0 ? scrollPosition / totalHeight : 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-[100] h-[3px]"
      style={{
        width: `${progress * 100}%`,
        background:
          "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary, var(--accent-primary)))",
        boxShadow: "0 0 10px var(--glow-color, var(--accent-primary))",
        transition: "width 0.1s ease-out",
      }}
    />
  );
}
