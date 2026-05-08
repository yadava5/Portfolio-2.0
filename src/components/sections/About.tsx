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
import {
  TerminalRevealWrapper,
  TerminalStepItem,
} from "@/components/effects/TerminalRevealWrapper";
import {
  SnapScrollWrapper,
  SnapSection,
} from "@/components/effects/SnapScrollWrapper";
import { FluidDistortionWrapper } from "@/components/effects/FluidDistortionWrapper";
import { HorizontalScrollWrapper } from "@/components/effects/HorizontalScrollWrapper";

export function About() {
  const { theme } = useTheme();

  if (theme === "liquid-glass") {
    return (
      <section id="about" className="relative z-10 w-full overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 pt-32 md:px-8">
          <TextReveal className="mb-16 text-center">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-medium tracking-widest text-white/80 uppercase backdrop-blur-md">
              About Me
            </span>
          </TextReveal>
        </div>

        <HorizontalScrollWrapper className="w-full">
          <div className="mx-auto w-[90vw] flex-shrink-0 md:w-[800px]">
            <GlassCard className="p-8 md:p-12">
              <div className="space-y-6 text-lg leading-relaxed font-light text-white/80">
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
      <section
        id="about"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 md:px-8"
      >
        <ParallaxDepthWrapper depth={1.5}>
          <div className="mb-16 text-center">
            <h2
              className="mb-4 text-3xl font-light tracking-[0.3em] text-white uppercase md:text-5xl"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Origin
            </h2>
            <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-8 shadow-[0_0_40px_rgba(100,0,255,0.1)] backdrop-blur-md md:p-12">
            <div className="space-y-6 text-lg leading-relaxed font-light text-indigo-100/80">
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
      <section
        id="about"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 font-mono text-[#00ff41] md:px-12"
      >
        <TerminalRevealWrapper stepCount={1}>
          <div className="mb-12">
            <p className="mb-4 text-sm opacity-70 md:text-base">
              <span className="text-[#ffb000]">root@portfolio</span>:
              <span className="text-blue-400">~</span>$ cat about_me.md
            </p>
            <h2 className="mb-8 inline-block border-b border-[#00ff41]/30 pb-4 text-3xl font-bold uppercase md:text-5xl">
              # ABOUT_ME
            </h2>
          </div>

          <TerminalStepItem step={0}>
            <div className="border border-[#00ff41]/30 bg-black/50 p-6 shadow-[0_0_20px_rgba(0,255,65,0.1)] md:p-10">
              <div className="space-y-6 text-base leading-relaxed md:text-lg">
                {personalInfo.bio.map((paragraph, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="opacity-50 select-none">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
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
          <SnapSection className="mx-auto max-w-5xl flex-col px-4 md:px-8">
            <GlitchBurst className="mb-16 w-full text-center">
              <h2
                className="text-4xl font-bold tracking-widest text-[#00ffff] uppercase md:text-6xl"
                style={{
                  fontFamily: "var(--font-display)",
                  textShadow: "0 0 15px #00ffff",
                }}
              >
                PLAYER_ONE
              </h2>
            </GlitchBurst>

            <NeonBorder color="magenta" className="w-full p-8 md:p-12">
              <div className="space-y-6 text-lg leading-relaxed font-medium text-white/90">
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
      <section
        id="about"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 font-serif md:px-8"
      >
        <FluidDistortionWrapper>
          <FloatingEntry className="mb-16 text-center">
            <h2 className="text-4xl font-medium tracking-wide text-[#e0f4ff] drop-shadow-[0_0_15px_rgba(0,255,255,0.4)] md:text-6xl">
              Currents
            </h2>
            <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-[#00ffff] to-transparent opacity-50" />
          </FloatingEntry>

          <div className="rounded-3xl border border-[#00ffff]/20 bg-[#001433]/70 p-8 shadow-[0_0_30px_rgba(0,255,255,0.1),inset_0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-xl transition-shadow duration-700 hover:shadow-[0_0_40px_rgba(0,255,255,0.2)] md:p-12">
            <div className="space-y-6 font-sans text-lg leading-relaxed font-light text-[#e0f4ff]/80">
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
    <section className="flex min-h-screen items-center justify-center">
      <h2 className="text-4xl">About - {theme}</h2>
    </section>
  );
}
