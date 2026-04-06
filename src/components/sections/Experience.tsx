"use client";

import { useTheme } from "@/hooks/useTheme";
import { experiences } from "@/lib/data/experience";
import { TextReveal } from "@/components/effects/TextReveal";
import { GlassCard } from "@/components/effects/GlassCard";
import { NebulaCard } from "@/components/effects/NebulaCard";
import { WarpTransition } from "@/components/effects/WarpTransition";
import { TypewriterText } from "@/components/effects/TypewriterText";
import { GlitchBurst } from "@/components/effects/GlitchBurst";
import { NeonBorder } from "@/components/effects/NeonBorder";
import { FloatingEntry } from "@/components/effects/FloatingEntry";
import { HorizontalScrollWrapper } from "@/components/effects/HorizontalScrollWrapper";
import { ParallaxDepthWrapper } from "@/components/effects/ParallaxDepthWrapper";
import { TerminalRevealWrapper, TerminalStepItem } from "@/components/effects/TerminalRevealWrapper";
import { SnapScrollWrapper, SnapSection } from "@/components/effects/SnapScrollWrapper";
import { FluidDistortionWrapper } from "@/components/effects/FluidDistortionWrapper";

export function Experience() {
  const { theme } = useTheme();

  if (theme === "liquid-glass") {
    return (
      <section id="experience" className="relative z-10 w-full overflow-hidden">
        <div className="pt-32 px-4 md:px-8 max-w-5xl mx-auto">
          <TextReveal className="mb-16 text-center">
            <span className="inline-block px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium tracking-widest uppercase text-white/80">
              Experience
            </span>
          </TextReveal>
        </div>

        <HorizontalScrollWrapper className="w-full">
          {experiences.map((exp, idx) => (
            <div key={exp.id} className="w-[85vw] md:w-[600px] flex-shrink-0">
              <TextReveal className={`delay-[${idx * 100}ms] h-full`}>
                <GlassCard className="p-8 md:p-10 flex flex-col h-full">
                  <div className="mb-6">
                    <p className="text-sm font-medium text-white/50 uppercase tracking-widest mb-2">
                      {exp.startDate} - {exp.endDate}
                    </p>
                    <h3 className="text-2xl font-semibold text-white mb-1">
                      {exp.company}
                    </h3>
                    <p className="text-lg text-indigo-300 font-light">
                      {exp.title}
                    </p>
                  </div>
                  <div className="flex-grow">
                    <p className="text-white/70 mb-6 leading-relaxed">
                      {exp.description.join(" ")}
                    </p>
                    <ul className="space-y-3">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start text-white/80">
                          <span className="mr-3 text-indigo-400 mt-1">✦</span>
                          <span className="leading-relaxed">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </GlassCard>
              </TextReveal>
            </div>
          ))}
        </HorizontalScrollWrapper>
      </section>
    );
  }

  if (theme === "cosmic-voyage") {
    return (
      <section id="experience" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl text-white font-light tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Trajectory
          </h2>
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-teal-400 to-transparent" />
        </div>

        <div className="space-y-32">
          {experiences.map((exp, idx) => (
            <ParallaxDepthWrapper key={exp.id} depth={1 + (idx % 3) * 0.5}>
              <WarpTransition>
                <NebulaCard className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3 flex-shrink-0">
                    <p className="text-xs font-bold text-teal-400 uppercase tracking-[0.2em] mb-2">
                      {exp.startDate} - {exp.endDate}
                    </p>
                    <h3 className="text-2xl font-semibold text-white mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                      {exp.company}
                    </h3>
                    <p className="text-lg text-indigo-300 font-light">
                      {exp.title}
                    </p>
                  </div>
                  <div className="w-full md:w-2/3">
                    <p className="text-indigo-100/70 mb-6 leading-relaxed">
                      {exp.description.join(" ")}
                    </p>
                    <ul className="space-y-3">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start text-indigo-100/80">
                          <span className="mr-3 text-teal-400 mt-1">✦</span>
                          <span className="leading-relaxed">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </NebulaCard>
              </WarpTransition>
            </ParallaxDepthWrapper>
          ))}
        </div>
      </section>
    );
  }

  if (theme === "retro-terminal") {
    return (
      <section id="experience" className="relative min-h-screen py-32 px-4 md:px-12 z-10 max-w-5xl mx-auto font-mono text-[#00ff41]">
        <TerminalRevealWrapper stepCount={experiences.length} className="space-y-12">
          <div className="mb-12">
            <p className="text-sm md:text-base mb-4 opacity-70">
              <span className="text-[#ffb000]">root@portfolio</span>:<span className="text-blue-400">~</span>$ ./show_experience.sh
            </p>
            <h2 className="text-3xl md:text-5xl font-bold uppercase mb-8 border-b border-[#00ff41]/30 pb-4 inline-block">
              # EXPERIENCE_LOG
            </h2>
          </div>

          <div className="space-y-12">
            {experiences.map((exp, idx) => (
              <TerminalStepItem key={exp.id} step={idx}>
                <div className="border border-dashed border-[#00ff41]/50 p-6 md:p-8 hover:bg-[#00ff41]/5 hover:border-solid transition-all duration-300">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 flex-shrink-0">
                      <p className="text-sm font-bold text-[#ffb000] uppercase mb-2">
                        [{exp.startDate} - {exp.endDate}]
                      </p>
                      <h3 className="text-xl font-bold text-white mb-1 uppercase">
                        {exp.company}
                      </h3>
                      <p className="text-base text-[#00ff41] opacity-80">
                        &gt; {exp.title}
                      </p>
                    </div>
                    <div className="w-full md:w-2/3">
                      <p className="text-white/70 mb-6 leading-relaxed text-sm">
                        {`/* ${exp.description.join(" ")} */`}
                      </p>
                      <ul className="space-y-3 text-sm">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mr-3 text-[#ffb000] mt-1">-&gt;</span>
                            <span className="leading-relaxed opacity-90">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TerminalStepItem>
            ))}
          </div>
        </TerminalRevealWrapper>
      </section>
    );
  }

  if (theme === "synthwave-sunset") {
    return (
      <section id="experience" className="relative z-10 w-full font-sans">
        <SnapScrollWrapper>
          <SnapSection className="flex-col">
            <GlitchBurst className="text-center">
              <h2 className="text-4xl md:text-6xl text-[#ff00ff] font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", textShadow: "0 0 15px #ff00ff" }}>
                LEVEL_UP
              </h2>
              <p className="mt-8 text-[#00ffff] animate-pulse">SCROLL TO CONTINUE</p>
            </GlitchBurst>
          </SnapSection>

          {experiences.map((exp, idx) => (
            <SnapSection key={exp.id} className="px-4 md:px-8 max-w-5xl mx-auto">
              <GlitchBurst className="w-full">
                <NeonBorder color={idx % 2 === 0 ? "cyan" : "yellow"} className="p-8 md:p-10 flex flex-col md:flex-row gap-8 w-full">
                  <div className="w-full md:w-1/3 flex-shrink-0">
                    <p className="text-sm font-bold text-[#ffff00] uppercase tracking-widest mb-2" style={{ textShadow: "0 0 5px #ffff00" }}>
                      {`${exp.startDate} / ${exp.endDate}`}
                    </p>
                    <h3 className="text-2xl font-bold text-white mb-1 uppercase" style={{ fontFamily: "var(--font-display)" }}>
                      {exp.company}
                    </h3>
                    <p className="text-lg text-[#00ffff] font-semibold" style={{ textShadow: "0 0 5px #00ffff" }}>
                      {exp.title}
                    </p>
                  </div>
                  <div className="w-full md:w-2/3">
                    <p className="text-white/90 mb-6 leading-relaxed font-medium">
                      {exp.description.join(" ")}
                    </p>
                    <ul className="space-y-3">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start text-white/80">
                          <span className="mr-3 text-[#ff00ff] mt-1 text-xl leading-none">►</span>
                          <span className="leading-relaxed font-medium">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </NeonBorder>
              </GlitchBurst>
            </SnapSection>
          ))}
        </SnapScrollWrapper>
      </section>
    );
  }

  if (theme === "bioluminescent-deep") {
    return (
      <section id="experience" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-5xl mx-auto font-serif">
        <FluidDistortionWrapper>
          <FloatingEntry className="mb-16 text-center">
            <h2 className="text-4xl md:text-6xl text-[#e0f4ff] font-medium tracking-wide drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">
              Depths
            </h2>
            <div className="h-px w-16 mx-auto mt-6 bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent opacity-50" />
          </FloatingEntry>

          <div className="space-y-12">
            {experiences.map((exp) => (
              <FloatingEntry key={exp.id}>
                <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 rounded-3xl bg-[#001433]/70 backdrop-blur-xl border border-[#00ffff]/10 shadow-[0_0_30px_rgba(0,255,255,0.05)] hover:shadow-[0_0_40px_rgba(0,255,255,0.15)] hover:border-[#00ffff]/30 transition-all duration-700">
                  <div className="w-full md:w-1/3 flex-shrink-0">
                    <p className="text-sm font-sans text-[#00ffff] uppercase tracking-widest mb-2 opacity-80">
                      {exp.startDate} — {exp.endDate}
                    </p>
                    <h3 className="text-2xl font-medium text-[#e0f4ff] mb-1 tracking-wide">
                      {exp.company}
                    </h3>
                    <p className="text-lg text-[#ff00ff] font-sans font-light opacity-90">
                      {exp.title}
                    </p>
                  </div>
                  <div className="w-full md:w-2/3">
                    <p className="text-[#e0f4ff]/70 mb-6 leading-relaxed font-sans font-light">
                      {exp.description.join(" ")}
                    </p>
                    <ul className="space-y-3">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start text-[#e0f4ff]/80 font-sans font-light">
                          <span className="mr-3 text-[#00ffff] mt-1 opacity-70">∿</span>
                          <span className="leading-relaxed">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FloatingEntry>
            ))}
          </div>
        </FluidDistortionWrapper>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center">
      <h2 className="text-4xl">Experience - {theme}</h2>
    </section>
  );
}
