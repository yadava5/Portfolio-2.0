"use client";

import { ReactNode } from "react";

interface NeonBorderProps {
  children: ReactNode;
  className?: string;
  color?: "cyan" | "magenta" | "yellow";
}

export function NeonBorder({ children, className = "", color = "cyan" }: NeonBorderProps) {
  const colorMap = {
    cyan: "border-[#00ffff] shadow-[0_0_15px_#00ffff,inset_0_0_15px_#00ffff]",
    magenta: "border-[#ff00ff] shadow-[0_0_15px_#ff00ff,inset_0_0_15px_#ff00ff]",
    yellow: "border-[#ffff00] shadow-[0_0_15px_#ffff00,inset_0_0_15px_#ffff00]",
  };

  const hoverColorMap = {
    cyan: "hover:shadow-[0_0_30px_#00ffff,inset_0_0_30px_#00ffff]",
    magenta: "hover:shadow-[0_0_30px_#ff00ff,inset_0_0_30px_#ff00ff]",
    yellow: "hover:shadow-[0_0_30px_#ffff00,inset_0_0_30px_#ffff00]",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg border-2 bg-black/50 backdrop-blur-sm transition-all duration-300 group ${colorMap[color]} ${hoverColorMap[color]} ${className}`}
    >
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/10 to-transparent mix-blend-overlay" />
      {children}
    </div>
  );
}
