"use client";

import { useTheme } from "@/hooks/useTheme";
import { personalInfo } from "@/lib/data/personal";
import { TextReveal } from "@/components/effects/TextReveal";
import { GlassCard } from "@/components/effects/GlassCard";
import { TypewriterText } from "@/components/effects/TypewriterText";
import { GlitchBurst } from "@/components/effects/GlitchBurst";
import { NeonBorder } from "@/components/effects/NeonBorder";
import { FloatingEntry } from "@/components/effects/FloatingEntry";
import { ParallaxDepthWrapper } from "@/components/effects/ParallaxDepthWrapper";
import { TerminalRevealWrapper, TerminalStepItem } from "@/components/effects/TerminalRevealWrapper";
import { SnapScrollWrapper, SnapSection } from "@/components/effects/SnapScrollWrapper";
import { FluidDistortionWrapper } from "@/components/effects/FluidDistortionWrapper";
import { HorizontalScrollWrapper } from "@/components/effects/HorizontalScrollWrapper";

export function About() {
  const { theme } = useTheme();

  if (theme === "liquid-glass") {
    return (
      <section id="about" className="relative z-10 w-full overflow-hidden">
        <div className="pt-32 px-4 md:px-8 max-w-5xl mx-auto">
          <TextReveal className="mb-16 text-center">
            <span className="inline-block px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium tracking-widest uppercase text-white/80">
              About Me
            </span>
          </TextReveal>
        </div>
        
        <HorizontalScrollWrapper className="w-full">
          <div className="w-[90vw] md:w-[800px] flex-shrink-0 mx-auto">
            <GlassCard className="p-8 md:p-12">
              <div className="space-y-6 text-lg text-white/80 leading-relaxed font-light">
                {personalInfo.bio.map((paragraph, idx) => (
                  <TextReveal key={idx} className={`delay-[${idx * 100}ms]`}>
                    <p>{paragraph}</p>
                  </TextReveal>
                ))}
              </div>
            </GlassCard>
          </div>
        </HorizontalScrollWrapper>
      </section>
    );
  }

  if (theme === "cosmic-voyage") {
    return (
      <section id="about" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-5xl mx-auto">
        <ParallaxDepthWrapper depth={1.5}>
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl text-white font-light tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "var(--font-serif)" }}>
              Origin
            </h2>
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
          </div>
          
          <div className="p-8 md:p-12 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md shadow-[0_0_40px_rgba(100,0,255,0.1)]">
            <div className="space-y-6 text-lg text-indigo-100/80 leading-relaxed font-light">
              {personalInfo.bio.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </ParallaxDepthWrapper>
      </section>
    );
  }

  if (theme === "retro-terminal") {
    return (
      <section id="about" className="relative min-h-screen py-32 px-4 md:px-12 z-10 max-w-5xl mx-auto font-mono text-[#00ff41]">
        <TerminalRevealWrapper stepCount={1}>
          <div className="mb-12">
            <p className="text-sm md:text-base mb-4 opacity-70">
              <span className="text-[#ffb000]">root@portfolio</span>:<span className="text-blue-400">~</span>$ cat about_me.md
            </p>
            <h2 className="text-3xl md:text-5xl font-bold uppercase mb-8 border-b border-[#00ff41]/30 pb-4 inline-block">
              # ABOUT_ME
            </h2>
          </div>
          
          <TerminalStepItem step={0}>
            <div className="p-6 md:p-10 border border-[#00ff41]/30 bg-black/50 shadow-[0_0_20px_rgba(0,255,65,0.1)]">
              <div className="space-y-6 text-base md:text-lg leading-relaxed">
                {personalInfo.bio.map((paragraph, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="opacity-50 select-none">{String(idx + 1).padStart(2, '0')}</span>
                    <p>{paragraph}</p>
                  </div>
                ))}
              </div>
            </div>
          </TerminalStepItem>
        </TerminalRevealWrapper>
      </section>
    );
  }

  if (theme === "synthwave-sunset") {
    return (
      <section id="about" className="relative z-10 w-full font-sans">
        <SnapScrollWrapper>
          <SnapSection className="flex-col px-4 md:px-8 max-w-5xl mx-auto">
            <GlitchBurst className="mb-16 text-center w-full">
              <h2 className="text-4xl md:text-6xl text-[#00ffff] font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", textShadow: "0 0 15px #00ffff" }}>
                PLAYER_ONE
              </h2>
            </GlitchBurst>
            
            <NeonBorder color="magenta" className="p-8 md:p-12 w-full">
              <div className="space-y-6 text-lg text-white/90 leading-relaxed font-medium">
                {personalInfo.bio.map((paragraph, idx) => (
                  <GlitchBurst key={idx}>
                    <p>{paragraph}</p>
                  </GlitchBurst>
                ))}
              </div>
            </NeonBorder>
          </SnapSection>
        </SnapScrollWrapper>
      </section>
    );
  }

  if (theme === "bioluminescent-deep") {
    return (
      <section id="about" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-5xl mx-auto font-serif">
        <FluidDistortionWrapper>
          <FloatingEntry className="mb-16 text-center">
            <h2 className="text-4xl md:text-6xl text-[#e0f4ff] font-medium tracking-wide drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">
              Currents
            </h2>
            <div className="h-px w-16 mx-auto mt-6 bg-gradient-to-r from-transparent via-[#00ffff] to-transparent opacity-50" />
          </FloatingEntry>
          
          <div className="p-8 md:p-12 rounded-3xl bg-[#001433]/70 backdrop-blur-xl border border-[#00ffff]/20 shadow-[0_0_30px_rgba(0,255,255,0.1),inset_0_0_20px_rgba(0,255,255,0.05)] hover:shadow-[0_0_40px_rgba(0,255,255,0.2)] transition-shadow duration-700">
            <div className="space-y-6 text-lg text-[#e0f4ff]/80 leading-relaxed font-sans font-light">
              {personalInfo.bio.map((paragraph, idx) => (
                <FloatingEntry key={idx}>
                  <p>{paragraph}</p>
                </FloatingEntry>
              ))}
            </div>
          </div>
        </FluidDistortionWrapper>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center">
      <h2 className="text-4xl">About - {theme}</h2>
    </section>
  );
}
