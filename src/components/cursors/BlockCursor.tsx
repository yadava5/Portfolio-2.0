"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function BlockCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    document.body.style.cursor = "none";

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] h-5 w-3 animate-pulse bg-[#00ff41] mix-blend-screen"
      style={{
        boxShadow: "0 0 10px #00ff41",
      }}
    />
  );
}
