"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface HorizontalScrollWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalScrollWrapper({
  children,
  className = "",
}: HorizontalScrollWrapperProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [maxTranslate, setMaxTranslate] = useState(0);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, maxTranslate]);

  useEffect(() => {
    const updateMeasurements = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;

      if (!viewport || !track) return;

      const overflow = track.scrollWidth - viewport.clientWidth;
      setMaxTranslate(overflow > 0 ? -overflow : 0);
    };

    updateMeasurements();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateMeasurements)
        : null;

    if (observer) {
      if (viewportRef.current) observer.observe(viewportRef.current);
      if (trackRef.current) observer.observe(trackRef.current);
    }

    window.addEventListener("resize", updateMeasurements);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateMeasurements);
    };
  }, []);

  const scrollHeight =
    maxTranslate < 0
      ? `calc(100vh + ${Math.min(Math.abs(maxTranslate), 650)}px)`
      : "100vh";

  return (
    <section
      ref={targetRef}
      data-horizontal-scroll-wrapper="true"
      className={`relative ${className}`}
      style={{ height: scrollHeight }}
    >
      <div
        ref={viewportRef}
        className="sticky top-0 flex h-screen items-center overflow-hidden"
      >
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex gap-8 px-4 will-change-transform md:px-8"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
