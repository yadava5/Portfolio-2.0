"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface FluidDistortionWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function FluidDistortionWrapper({ children, className = "" }: FluidDistortionWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePosition] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Smooth out the scroll progress for a fluid, underwater feel
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 15,
    mass: 0.27,
    stiffness: 55
  });

  const yOffset = useTransform(smoothProgress, [0, 1], [50, -50]);
  const skewY = useTransform(smoothProgress, [0, 0.5, 1], [-1, 0, 1]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      style={{ 
        y: yOffset,
        skewY,
        x: mousePos.x * 20,
      }}
      transition={{ type: "spring", stiffness: 50, damping: 20 }}
      className={`relative ${className}`}
    >
      {/* Subtle underwater distortion SVG filter could go here, for now we use framer motion skew/translate */}
      {children}
    </motion.div>
  );
}
