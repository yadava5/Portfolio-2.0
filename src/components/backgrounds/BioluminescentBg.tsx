"use client";

import { useEffect, useRef } from "react";

export function BioluminescentBg() {
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

    // Generate particles
    const particles = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedY: Math.random() * 0.5 + 0.1,
      speedX: (Math.random() - 0.5) * 0.5,
      hue: Math.random() > 0.5 ? 180 : 280, // Cyan or Purple
      opacity: Math.random() * 0.5 + 0.1,
      phase: Math.random() * Math.PI * 2,
    }));

    // Generate bubbles
    const bubbles = Array.from({ length: 30 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 8 + 2,
      speed: Math.random() * 1 + 0.5,
      wobble: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      time += 0.02;
      
      // Deep ocean gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "#000511"); // Abyss
      bgGradient.addColorStop(0.5, "#001a33"); // Twilight
      bgGradient.addColorStop(1, "#002244"); // Reef
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw caustic light patterns
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const causticGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      causticGradient.addColorStop(0, `rgba(0, 255, 255, ${0.05 + Math.sin(time) * 0.02})`);
      causticGradient.addColorStop(1, "transparent");
      ctx.fillStyle = causticGradient;
      
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 100) {
          const y = Math.sin(x * 0.01 + time * (i + 1)) * 50 + (i * canvas.height / 3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.fill();
      }
      ctx.restore();

      // Draw particles
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += Math.sin(time + p.phase) * 0.5 + p.speedX;
        
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }

        const currentOpacity = p.opacity * (0.5 + Math.sin(time * 2 + p.phase) * 0.5);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${currentOpacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsl(${p.hue}, 100%, 70%)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw bubbles
      bubbles.forEach((b) => {
        b.y -= b.speed;
        b.x += Math.sin(time * 2 + b.wobble) * 1;
        
        if (b.y < -20) {
          b.y = canvas.height + 20;
          b.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Bubble highlight
        ctx.beginPath();
        ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
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
