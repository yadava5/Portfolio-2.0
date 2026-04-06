"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function NeonCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    document.body.style.cursor = "none";

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });

    const trailXTo = trailRef.current.map((el, i) =>
      gsap.quickTo(el, "x", { duration: 0.15 + i * 0.05, ease: "power3" })
    );
    const trailYTo = trailRef.current.map((el, i) =>
      gsap.quickTo(el, "y", { duration: 0.15 + i * 0.05, ease: "power3" })
    );

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      trailXTo.forEach((fn) => fn(e.clientX));
      trailYTo.forEach((fn) => fn(e.clientY));
    };

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-2 border-[#00ffff] rounded-full mix-blend-screen"
        style={{
          boxShadow: "0 0 10px #00ffff, inset 0 0 10px #00ffff",
        }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[#ff007f] rounded-full shadow-[0_0_5px_#ff007f]" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) trailRef.current[i] = el;
          }}
          className="fixed top-0 left-0 z-[9998] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-[#ff007f] rounded-full mix-blend-screen"
          style={{
            opacity: 0.5 - i * 0.15,
            boxShadow: "0 0 5px #ff007f",
          }}
        />
      ))}
    </>
  );
}
