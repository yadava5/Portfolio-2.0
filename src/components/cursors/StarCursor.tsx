"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function StarCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    document.body.style.cursor = "none";

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });

    const trailXTo = trailRef.current.map((el, i) =>
      gsap.quickTo(el, "x", { duration: 0.2 + i * 0.1, ease: "power3" })
    );
    const trailYTo = trailRef.current.map((el, i) =>
      gsap.quickTo(el, "y", { duration: 0.2 + i * 0.1, ease: "power3" })
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
        className="fixed top-0 left-0 z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
      />
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) trailRef.current[i] = el;
          }}
          className="fixed top-0 left-0 z-[9998] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: `${12 - i * 2}px`,
            height: `${12 - i * 2}px`,
            backgroundColor: `rgba(100, 200, 255, ${0.5 - i * 0.1})`,
            boxShadow: `0 0 ${10 - i * 2}px rgba(100, 200, 255, ${0.5 - i * 0.1})`,
          }}
        />
      ))}
    </>
  );
}
