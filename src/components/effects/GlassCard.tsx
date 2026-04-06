"use client";

import { ReactNode, useRef, useState } from "react";
import gsap from "gsap";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });

    const xPercent = (x / rect.width - 0.5) * 2;
    const yPercent = (y / rect.height - 0.5) * 2;

    gsap.to(card, {
      duration: 0.5,
      rotateX: -yPercent * 10,
      rotateY: xPercent * 10,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    const card = cardRef.current;
    if (!card) return;

    gsap.to(card, {
      duration: 0.5,
      rotateX: 0,
      rotateY: 0,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-white/40 hover:bg-white/10 ${className}`}
      style={{
        boxShadow: "inset 0 0 20px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1), transparent 40%)`,
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 mix-blend-overlay" />
      {children}
    </div>
  );
}
