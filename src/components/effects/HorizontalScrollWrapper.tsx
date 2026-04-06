"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface HorizontalScrollWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalScrollWrapper({ children, className = "" }: HorizontalScrollWrapperProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-95%"]);

  return (
    <section ref={targetRef} className={`relative h-[300vh] ${className}`}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex gap-8 px-4 md:px-8">
          {children}
        </motion.div>
      </div>
    </section>
  );
}
