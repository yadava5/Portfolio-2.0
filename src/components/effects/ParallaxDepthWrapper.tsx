"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxDepthWrapperProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
}

export function ParallaxDepthWrapper({ children, className = "", depth = 1 }: ParallaxDepthWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Calculate parallax based on depth
  const y = useTransform(scrollYProgress, [0, 1], [100 * depth, -100 * depth]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8 + (depth * 0.1), 1, 0.8 + (depth * 0.1)]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, scale }}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  );
}
