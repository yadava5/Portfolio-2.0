"use client";

import { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface FloatingEntryProps {
  children: ReactNode;
  className?: string;
}

export function FloatingEntry({ children, className = "" }: FloatingEntryProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    gsap.fromTo(
      el,
      {
        opacity: 0,
        y: 100,
        rotationZ: -5,
      },
      {
        opacity: 1,
        y: 0,
        rotationZ: 0,
        duration: 1.5,
        ease: "power2.out",
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
