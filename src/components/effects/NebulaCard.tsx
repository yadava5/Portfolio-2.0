"use client";

import { ReactNode, useRef } from "react";
import gsap from "gsap";

interface NebulaCardProps {
  children: ReactNode;
  className?: string;
}

export function NebulaCard({ children, className = "" }: NebulaCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width - 0.5) * 2;
    const yPercent = (y / rect.height - 0.5) * 2;

    gsap.to(card, {
      duration: 0.5,
      rotateX: -yPercent * 5,
      rotateY: xPercent * 5,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
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
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-xl border border-indigo-500/20 bg-black/40 p-6 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-indigo-400/50 hover:bg-black/60 ${className}`}
      style={{
        boxShadow: "inset 0 0 30px rgba(100, 0, 255, 0.1), 0 10px 40px rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-teal-500/20 mix-blend-screen" />
      {children}
    </div>
  );
}
