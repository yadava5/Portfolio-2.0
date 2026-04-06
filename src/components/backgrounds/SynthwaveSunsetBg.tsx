"use client";

import { useEffect, useRef } from "react";

export function SynthwaveSunsetBg() {
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

    const draw = () => {
      time += 0.05;
      
      // Sky gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
      skyGradient.addColorStop(0, "#1a0b2e"); // Dark purple
      skyGradient.addColorStop(0.5, "#8b1874"); // Hot pink
      skyGradient.addColorStop(1, "#f77f00"); // Orange
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

      // Draw Retro Sun
      const sunX = canvas.width / 2;
      const sunY = canvas.height / 2;
      const sunRadius = Math.min(canvas.width, canvas.height) * 0.25;

      ctx.save();
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, Math.PI, 0);
      
      const sunGradient = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY);
      sunGradient.addColorStop(0, "#ffd700"); // Yellow
      sunGradient.addColorStop(0.5, "#ff007f"); // Pink
      sunGradient.addColorStop(1, "#7f00ff"); // Purple
      
      ctx.fillStyle = sunGradient;
      ctx.fill();

      // Sun scanlines (cutouts)
      ctx.globalCompositeOperation = "destination-out";
      const numLines = 10;
      for (let i = 0; i < numLines; i++) {
        const lineY = sunY - (i * sunRadius / numLines);
        const thickness = 2 + (i * 1.5); // Lines get thicker towards bottom
        ctx.fillRect(sunX - sunRadius, lineY, sunRadius * 2, thickness);
      }
      ctx.restore();

      // Ground (Perspective Grid)
      ctx.fillStyle = "#0d0221"; // Very dark purple
      ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

      ctx.strokeStyle = "#ff007f"; // Neon pink
      ctx.lineWidth = 2;
      
      const horizonY = canvas.height / 2;
      const fov = 100;
      
      // Horizontal lines moving towards viewer
      for (let i = 0; i < 20; i++) {
        const z = ((i * 10 - time * 10) % 100 + 100) % 100;
        if (z < 1) continue;
        
        const y = horizonY + (fov / z) * 50;
        if (y > canvas.height) continue;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        
        // Fade lines near horizon
        ctx.globalAlpha = Math.min(1, (y - horizonY) / 100);
        ctx.stroke();
      }

      // Vertical lines meeting at vanishing point
      ctx.globalAlpha = 1;
      const numVertical = 30;
      for (let i = -numVertical; i <= numVertical; i++) {
        const startX = canvas.width / 2 + i * 100;
        const endX = canvas.width / 2 + i * 10; // Converge at horizon
        
        ctx.beginPath();
        ctx.moveTo(startX, canvas.height);
        ctx.lineTo(endX, horizonY);
        
        // Gradient for vertical lines
        const lineGrad = ctx.createLinearGradient(0, canvas.height, 0, horizonY);
        lineGrad.addColorStop(0, "#00ffff"); // Cyan at bottom
        lineGrad.addColorStop(1, "rgba(0, 255, 255, 0)"); // Fade at horizon
        
        ctx.strokeStyle = lineGrad;
        ctx.stroke();
      }

      // Horizon glow
      const horizonGlow = ctx.createLinearGradient(0, horizonY - 20, 0, horizonY + 20);
      horizonGlow.addColorStop(0, "rgba(255, 0, 127, 0)");
      horizonGlow.addColorStop(0.5, "rgba(255, 0, 127, 0.8)");
      horizonGlow.addColorStop(1, "rgba(255, 0, 127, 0)");
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, horizonY - 20, canvas.width, 40);

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
