"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function OrbCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    document.body.style.cursor = "none";

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3" });

    const trailXTo = trailRef.current.map((el, i) =>
      gsap.quickTo(el, "x", { duration: 0.3 + i * 0.1, ease: "power3" })
    );
    const trailYTo = trailRef.current.map((el, i) =>
      gsap.quickTo(el, "y", { duration: 0.3 + i * 0.1, ease: "power3" })
    );

    const onMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      trailXTo.forEach((fn) => fn(e.clientX));
      trailYTo.forEach((fn) => fn(e.clientY));
    };

    const onClick = (e: MouseEvent) => {
      const ripple = document.createElement("div");
      ripple.className = "fixed pointer-events-none rounded-full border-2 border-[#00ffff] transform -translate-x-1/2 -translate-y-1/2 z-[9997]";
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      ripple.style.width = "10px";
      ripple.style.height = "10px";
      ripple.style.opacity = "1";
      document.body.appendChild(ripple);

      gsap.to(ripple, {
        width: 100,
        height: 100,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        onComplete: () => ripple.remove(),
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      document.body.style.cursor = "auto";
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full mix-blend-screen"
        style={{
          background: "radial-gradient(circle, rgba(0,255,255,0.8) 0%, rgba(0,255,255,0) 70%)",
          boxShadow: "0 0 20px rgba(0,255,255,0.5)",
        }}
      />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) trailRef.current[i] = el;
          }}
          className="fixed top-0 left-0 z-[9998] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
          style={{
            width: `${20 - i * 4}px`,
            height: `${20 - i * 4}px`,
            background: `radial-gradient(circle, rgba(0,255,255,${0.4 - i * 0.1}) 0%, rgba(0,255,255,0) 70%)`,
          }}
        />
      ))}
    </>
  );
}
