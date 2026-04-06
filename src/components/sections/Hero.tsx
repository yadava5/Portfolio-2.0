"use client";

import { useTheme } from "@/hooks/useTheme";
import { personalInfo } from "@/lib/data/personal";
import { TextReveal } from "@/components/effects/TextReveal";
import { TypewriterText } from "@/components/effects/TypewriterText";
import { GlitchBurst } from "@/components/effects/GlitchBurst";
import { FloatingEntry } from "@/components/effects/FloatingEntry";
import { motion } from "framer-motion";

export function Hero() {
  const { theme } = useTheme();

  if (theme === "liquid-glass") {
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 z-10">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
          <motion.svg
            width="600"
            height="600"
            viewBox="0 0 600 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute"
          >
            <motion.path
              d="M300 50C438.071 50 550 161.929 550 300C550 438.071 438.071 550 300 550C161.929 550 50 438.071 50 300C50 161.929 161.929 50 300 50Z"
              stroke="url(#paint0_linear)"
              strokeWidth="2"
              initial={{ pathLength: 0, rotate: 0 }}
              animate={{ pathLength: 1, rotate: 360 }}
              transition={{ 
                pathLength: { duration: 3, ease: "easeInOut" },
                rotate: { duration: 20, repeat: Infinity, ease: "linear" }
              }}
            />
            <defs>
              <linearGradient id="paint0_linear" x1="50" y1="50" x2="550" y2="550" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" />
                <stop offset="0.5" stopColor="#c084fc" />
                <stop offset="1" stopColor="#f472b6" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>

        <TextReveal className="mb-6">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            {personalInfo.name}
          </h1>
        </TextReveal>
        <TextReveal className="mb-8 delay-100">
          <p className="text-xl md:text-2xl text-white/80 font-light tracking-wide">
            {personalInfo.title}
          </p>
        </TextReveal>
        <TextReveal className="delay-200">
          <p className="max-w-2xl text-white/60 text-lg leading-relaxed">
            {personalInfo.tagline}
          </p>
        </TextReveal>
      </section>
    );
  }

  if (theme === "cosmic-voyage") {
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 z-10">
        <TextReveal className="mb-6">
          <h1 className="text-6xl md:text-8xl font-bold tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]" style={{ fontFamily: "var(--font-serif)" }}>
            {personalInfo.name.split("").map((char, i) => (
              <span key={i} className="inline-block hover:scale-110 hover:text-indigo-300 transition-transform duration-300 cursor-default">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>
        </TextReveal>
        <TextReveal className="mb-8 delay-100">
          <p className="text-xl md:text-2xl text-indigo-200 font-light tracking-[0.2em] uppercase">
            {personalInfo.title}
          </p>
        </TextReveal>
        <TextReveal className="delay-200">
          <p className="max-w-2xl text-white/70 text-lg leading-relaxed">
            {personalInfo.tagline}
          </p>
        </TextReveal>
      </section>
    );
  }

  if (theme === "retro-terminal") {
    return (
      <section className="relative min-h-screen flex flex-col items-start justify-center px-4 md:px-12 z-10 font-mono text-[#00ff41]">
        <div className="mb-8">
          <p className="text-sm md:text-base mb-2 opacity-70">
            <span className="text-[#ffb000]">root@portfolio</span>:<span className="text-blue-400">~</span>$ ./init_profile.sh
          </p>
          <div className="text-2xl md:text-5xl font-bold tracking-tight mb-6">
            <TypewriterText text={`> HELLO, I'M ${personalInfo.name.toUpperCase()}`} delay={500} />
          </div>
        </div>
        
        <div className="mb-8">
          <p className="text-sm md:text-base mb-2 opacity-70">
            <span className="text-[#ffb000]">root@portfolio</span>:<span className="text-blue-400">~</span>$ cat title.txt
          </p>
          <div className="text-xl md:text-2xl text-[#ffb000] mb-4">
            <TypewriterText text={personalInfo.title.toUpperCase()} delay={1500} />
          </div>
        </div>

        <div>
          <p className="text-sm md:text-base mb-2 opacity-70">
            <span className="text-[#ffb000]">root@portfolio</span>:<span className="text-blue-400">~</span>$ cat status.log
          </p>
          <div className="max-w-2xl text-base md:text-lg leading-relaxed opacity-90">
            <TypewriterText text={personalInfo.tagline} delay={2500} />
          </div>
        </div>
      </section>
    );
  }

  if (theme === "synthwave-sunset") {
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 z-10 font-sans">
        <GlitchBurst className="mb-6">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#00ffff] via-[#ff00ff] to-[#ffff00]" style={{ fontFamily: "var(--font-display)", filter: "drop-shadow(0 0 10px rgba(255,0,255,0.8))" }}>
            {personalInfo.name}
          </h1>
        </GlitchBurst>
        <GlitchBurst className="mb-8 delay-100">
          <p className="text-xl md:text-3xl text-[#00ffff] font-bold tracking-widest uppercase" style={{ textShadow: "0 0 10px #00ffff" }}>
            {personalInfo.title}
          </p>
        </GlitchBurst>
        <GlitchBurst className="delay-200">
          <p className="max-w-2xl text-white/90 text-lg leading-relaxed font-medium bg-black/40 p-4 rounded-lg border border-[#ff00ff]/30 backdrop-blur-sm" style={{ boxShadow: "0 0 20px rgba(255,0,255,0.2)" }}>
            {personalInfo.tagline}
          </p>
        </GlitchBurst>
      </section>
    );
  }

  if (theme === "bioluminescent-deep") {
    return (
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 z-10 font-serif">
        <FloatingEntry className="mb-6">
          <h1 className="text-6xl md:text-8xl font-medium tracking-wide text-[#e0f4ff] drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">
            {personalInfo.name}
          </h1>
        </FloatingEntry>
        <FloatingEntry className="mb-8 delay-100">
          <p className="text-xl md:text-2xl text-[#00ffff] font-light tracking-widest uppercase opacity-80" style={{ textShadow: "0 0 10px rgba(0,255,255,0.8)" }}>
            {personalInfo.title}
          </p>
        </FloatingEntry>
        <FloatingEntry className="delay-200">
          <p className="max-w-2xl text-[#e0f4ff]/70 text-lg leading-relaxed font-sans font-light">
            {personalInfo.tagline}
          </p>
        </FloatingEntry>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl">Hero - {theme}</h1>
    </section>
  );
}
