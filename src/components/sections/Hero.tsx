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
      <section
        id="hero"
        className="relative z-10 flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center"
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
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
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              }}
            />
            <defs>
              <linearGradient
                id="paint0_linear"
                x1="50"
                y1="50"
                x2="550"
                y2="550"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#818cf8" />
                <stop offset="0.5" stopColor="#c084fc" />
                <stop offset="1" stopColor="#f472b6" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>

        <TextReveal className="mb-6">
          <h1 className="max-w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-5xl font-bold tracking-tighter break-words text-transparent sm:text-6xl md:text-8xl">
            {personalInfo.name}
          </h1>
        </TextReveal>
        <TextReveal className="mb-8 delay-100">
          <p className="text-xl font-light tracking-wide text-white/80 md:text-2xl">
            {personalInfo.title}
          </p>
        </TextReveal>
        <TextReveal className="delay-200">
          <p className="max-w-2xl text-lg leading-relaxed text-white/60">
            {personalInfo.tagline}
          </p>
        </TextReveal>
        <TextReveal className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-3 delay-300 md:grid-cols-4">
          {[
            ["1.9M+", "Tableau rows"],
            ["738", "Automated tests"],
            ["71", "iOS tests"],
            ["19/20", "Policy validation"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/15 bg-white/8 px-4 py-3 backdrop-blur-xl"
            >
              <div className="text-2xl font-semibold text-white">{value}</div>
              <div className="text-xs tracking-wide text-white/55 uppercase">
                {label}
              </div>
            </div>
          ))}
        </TextReveal>
      </section>
    );
  }

  if (theme === "cosmic-voyage") {
    return (
      <section
        id="hero"
        className="relative z-10 flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center"
      >
        <TextReveal className="mb-6">
          <h1
            className="max-w-full text-5xl font-bold tracking-wide break-words text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] sm:text-6xl md:text-8xl md:tracking-widest"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {personalInfo.name.split("").map((char, i) => (
              <span
                key={i}
                className="inline-block cursor-default transition-transform duration-300 hover:scale-110 hover:text-indigo-300"
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>
        </TextReveal>
        <TextReveal className="mb-8 delay-100">
          <p className="max-w-full text-xl font-light tracking-[0.12em] break-words text-indigo-200 uppercase md:text-2xl md:tracking-[0.2em]">
            {personalInfo.title}
          </p>
        </TextReveal>
        <TextReveal className="delay-200">
          <p className="max-w-2xl text-lg leading-relaxed text-white/70">
            {personalInfo.tagline}
          </p>
        </TextReveal>
      </section>
    );
  }

  if (theme === "retro-terminal") {
    return (
      <section
        id="hero"
        className="relative z-10 flex min-h-screen flex-col items-start justify-center overflow-hidden px-4 font-mono text-[#00ff41] md:px-12"
      >
        <div className="mb-8">
          <p className="mb-2 text-sm opacity-70 md:text-base">
            <span className="text-[#ffb000]">root@portfolio</span>:
            <span className="text-blue-400">~</span>$ ./init_profile.sh
          </p>
          <h1 className="mb-6 max-w-full text-2xl font-bold tracking-tight break-words md:text-5xl">
            <TypewriterText
              text={`> HELLO, I'M ${personalInfo.name.toUpperCase()}`}
              delay={500}
            />
          </h1>
        </div>

        <div className="mb-8">
          <p className="mb-2 text-sm opacity-70 md:text-base">
            <span className="text-[#ffb000]">root@portfolio</span>:
            <span className="text-blue-400">~</span>$ cat title.txt
          </p>
          <div className="mb-4 max-w-full text-xl break-words text-[#ffb000] md:text-2xl">
            <TypewriterText
              text={personalInfo.title.toUpperCase()}
              delay={1500}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm opacity-70 md:text-base">
            <span className="text-[#ffb000]">root@portfolio</span>:
            <span className="text-blue-400">~</span>$ cat status.log
          </p>
          <div className="max-w-2xl text-base leading-relaxed opacity-90 md:text-lg">
            <TypewriterText text={personalInfo.tagline} delay={2500} />
          </div>
        </div>
      </section>
    );
  }

  if (theme === "synthwave-sunset") {
    return (
      <section
        id="hero"
        className="relative z-10 flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center font-sans"
      >
        <GlitchBurst className="mb-6">
          <h1
            className="max-w-full bg-gradient-to-b from-[#00ffff] via-[#ff00ff] to-[#ffff00] bg-clip-text text-5xl font-bold tracking-tighter break-words text-transparent uppercase sm:text-6xl md:text-8xl"
            style={{
              fontFamily: "var(--font-display)",
              filter: "drop-shadow(0 0 10px rgba(255,0,255,0.8))",
            }}
          >
            {personalInfo.name}
          </h1>
        </GlitchBurst>
        <GlitchBurst className="mb-8 delay-100">
          <p
            className="max-w-full text-xl font-bold tracking-wide break-words text-[#00ffff] uppercase md:text-3xl md:tracking-widest"
            style={{ textShadow: "0 0 10px #00ffff" }}
          >
            {personalInfo.title}
          </p>
        </GlitchBurst>
        <GlitchBurst className="delay-200">
          <p
            className="max-w-2xl rounded-lg border border-[#ff00ff]/30 bg-black/40 p-4 text-lg leading-relaxed font-medium text-white/90 backdrop-blur-sm"
            style={{ boxShadow: "0 0 20px rgba(255,0,255,0.2)" }}
          >
            {personalInfo.tagline}
          </p>
        </GlitchBurst>
      </section>
    );
  }

  if (theme === "bioluminescent-deep") {
    return (
      <section
        id="hero"
        className="relative z-10 flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center font-serif"
      >
        <FloatingEntry className="mb-6">
          <h1 className="max-w-full text-5xl font-medium tracking-wide break-words text-[#e0f4ff] drop-shadow-[0_0_20px_rgba(0,255,255,0.5)] sm:text-6xl md:text-8xl">
            {personalInfo.name}
          </h1>
        </FloatingEntry>
        <FloatingEntry className="mb-8 delay-100">
          <p
            className="max-w-full text-xl font-light tracking-wide break-words text-[#00ffff] uppercase opacity-80 md:text-2xl md:tracking-widest"
            style={{ textShadow: "0 0 10px rgba(0,255,255,0.8)" }}
          >
            {personalInfo.title}
          </p>
        </FloatingEntry>
        <FloatingEntry className="delay-200">
          <p className="max-w-2xl font-sans text-lg leading-relaxed font-light text-[#e0f4ff]/70">
            {personalInfo.tagline}
          </p>
        </FloatingEntry>
      </section>
    );
  }

  return (
    <section
      id="hero"
      className="flex min-h-screen items-center justify-center"
    >
      <h1 className="text-4xl">Hero - {theme}</h1>
    </section>
  );
}
