"use client";

import { useEffect, useRef } from "react";

export function LiquidGlassBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const colors = [
      { r: 79, g: 70, b: 229 },  // Indigo
      { r: 124, g: 58, b: 237 }, // Violet
      { r: 13, g: 148, b: 136 }, // Teal
      { r: 225, g: 29, b: 72 },  // Rose
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      time += 0.005;
      
      // Clear with dark background
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw blobs
      colors.forEach((color, i) => {
        const x = canvas.width / 2 + Math.sin(time + i) * (canvas.width / 3);
        const y = canvas.height / 2 + Math.cos(time * 0.8 + i * 2) * (canvas.height / 3);
        const radius = Math.min(canvas.width, canvas.height) * 0.6;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 w-full h-full pointer-events-none opacity-80"
      style={{ filter: "blur(60px)" }}
    />
  );
}
