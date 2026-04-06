"use client";

import { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface GlitchBurstProps {
  children: ReactNode;
  className?: string;
}

export function GlitchBurst({ children, className = "" }: GlitchBurstProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    gsap.fromTo(
      el,
      {
        opacity: 0,
        x: -20,
        skewX: 20,
        filter: "hue-rotate(90deg) blur(5px)",
      },
      {
        opacity: 1,
        x: 0,
        skewX: 0,
        filter: "hue-rotate(0deg) blur(0px)",
        duration: 0.5,
        ease: "power4.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, []);

  return (
    <div ref={wrapperRef} className={className}>
      {children}
    </div>
  );
}
