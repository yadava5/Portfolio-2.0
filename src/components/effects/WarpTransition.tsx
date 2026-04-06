"use client";

import { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface WarpTransitionProps {
  children: ReactNode;
  className?: string;
}

export function WarpTransition({ children, className = "" }: WarpTransitionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    gsap.fromTo(
      el,
      {
        opacity: 0,
        scale: 0.8,
        filter: "blur(20px)",
      },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
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
