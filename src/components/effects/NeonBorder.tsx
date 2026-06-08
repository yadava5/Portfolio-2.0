"use client";

import { ReactNode } from "react";

interface NeonBorderProps {
  children: ReactNode;
  className?: string;
  color?: "cyan" | "magenta" | "sky";
}

export function NeonBorder({
  children,
  className = "",
  color = "cyan",
}: NeonBorderProps) {
  const colorMap = {
    cyan: "border-[#00ffff] shadow-[0_0_15px_#00ffff,inset_0_0_15px_#00ffff]",
    magenta:
      "border-[#ff00ff] shadow-[0_0_15px_#ff00ff,inset_0_0_15px_#ff00ff]",
    sky: "border-[#38bdf8] shadow-[0_0_15px_#38bdf8,inset_0_0_15px_#38bdf8]",
  };

  const hoverColorMap = {
    cyan: "hover:shadow-[0_0_30px_#00ffff,inset_0_0_30px_#00ffff]",
    magenta: "hover:shadow-[0_0_30px_#ff00ff,inset_0_0_30px_#ff00ff]",
    sky: "hover:shadow-[0_0_30px_#38bdf8,inset_0_0_30px_#38bdf8]",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-lg border-2 bg-black/50 backdrop-blur-sm transition-all duration-300 ${colorMap[color]} ${hoverColorMap[color]} ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100" />
      {children}
    </div>
  );
}
