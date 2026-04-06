"use client";

import { useEffect, useRef } from "react";

export function CosmicVoyageBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener("resize", resize);
    resize();

    // Generate stars
    const stars = Array.from({ length: 200 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random(),
    }));

    const draw = () => {
      time += 0.01;
      
      // Deep space background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "#02000a");
      bgGradient.addColorStop(1, "#0a0a2a");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw aurora waves
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        
        for (let x = 0; x < canvas.width; x += 50) {
          const y = canvas.height * 0.4 + 
                    Math.sin(x * 0.005 + time + i) * 100 + 
                    Math.cos(x * 0.002 - time * 0.5) * 50;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        
        const auroraGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (i === 0) {
          auroraGradient.addColorStop(0, "rgba(0, 255, 150, 0.1)");
          auroraGradient.addColorStop(1, "transparent");
        } else if (i === 1) {
          auroraGradient.addColorStop(0, "rgba(100, 0, 255, 0.1)");
          auroraGradient.addColorStop(1, "transparent");
        } else {
          auroraGradient.addColorStop(0, "rgba(0, 150, 255, 0.1)");
          auroraGradient.addColorStop(1, "transparent");
        }
        
        ctx.fillStyle = auroraGradient;
        ctx.fill();
      }
      ctx.restore();

      // Draw stars
      stars.forEach((star) => {
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * (0.5 + Math.sin(time * 5 + star.x) * 0.5)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
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
      className="fixed inset-0 z-0 w-full h-full pointer-events-none"
    />
  );
}
