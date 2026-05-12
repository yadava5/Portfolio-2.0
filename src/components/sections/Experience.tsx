"use client";

import { useTheme } from "@/hooks/useTheme";
import { experiences } from "@/lib/data/experience";
import { TextReveal } from "@/components/effects/TextReveal";
import { GlassCard } from "@/components/effects/GlassCard";
import { NebulaCard } from "@/components/effects/NebulaCard";
import { WarpTransition } from "@/components/effects/WarpTransition";
import { GlitchBurst } from "@/components/effects/GlitchBurst";
import { NeonBorder } from "@/components/effects/NeonBorder";
import { FloatingEntry } from "@/components/effects/FloatingEntry";
import { HorizontalScrollWrapper } from "@/components/effects/HorizontalScrollWrapper";
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

export function Experience() {
  const { theme } = useTheme();

  if (theme === "liquid-glass") {
    return (
      <section id="experience" className="relative z-10 w-full overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 pt-32 md:px-8">
          <TextReveal className="mb-16 text-center">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-medium tracking-widest text-white/80 uppercase backdrop-blur-md">
              Experience
            </span>
          </TextReveal>
        </div>

        <HorizontalScrollWrapper className="w-full">
          {experiences.map((exp, idx) => (
            <div key={exp.id} className="w-[85vw] flex-shrink-0 md:w-[600px]">
              <TextReveal className={`delay-[${idx * 100}ms] h-full`}>
                <GlassCard className="flex h-full flex-col p-8 md:p-10">
                  <div className="mb-6">
                    <p className="mb-2 text-sm font-medium tracking-widest text-white/50 uppercase">
                      {exp.startDate} - {exp.endDate}
                    </p>
                    <h3 className="mb-1 text-2xl font-semibold text-white">
                      {exp.company}
                    </h3>
                    <p className="text-lg font-light text-indigo-300">
                      {exp.title}
                    </p>
                  </div>
                  <div className="flex-grow">
                    <p className="mb-6 leading-relaxed text-white/70">
                      {exp.description.join(" ")}
                    </p>
                    <ul className="space-y-3">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start text-white/80">
                          <span className="mt-1 mr-3 text-indigo-400">✦</span>
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
      <section
        id="experience"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 md:px-8"
      >
        <div className="mb-16 text-center">
          <h2
            className="mb-4 text-3xl font-light tracking-[0.3em] text-white uppercase md:text-5xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Trajectory
          </h2>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-teal-400 to-transparent" />
        </div>

        <div className="space-y-32">
          {experiences.map((exp, idx) => (
            <ParallaxDepthWrapper key={exp.id} depth={1 + (idx % 3) * 0.5}>
              <WarpTransition>
                <NebulaCard className="flex flex-col gap-8 md:flex-row">
                  <div className="w-full flex-shrink-0 md:w-1/3">
                    <p className="mb-2 text-xs font-bold tracking-[0.2em] text-teal-400 uppercase">
                      {exp.startDate} - {exp.endDate}
                    </p>
                    <h3
                      className="mb-1 text-2xl font-semibold text-white"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {exp.company}
                    </h3>
                    <p className="text-lg font-light text-indigo-300">
                      {exp.title}
                    </p>
                  </div>
                  <div className="w-full md:w-2/3">
                    <p className="mb-6 leading-relaxed text-indigo-100/70">
                      {exp.description.join(" ")}
                    </p>
                    <ul className="space-y-3">
                      {exp.achievements.map((achievement, i) => (
                        <li
                          key={i}
                          className="flex items-start text-indigo-100/80"
                        >
                          <span className="mt-1 mr-3 text-teal-400">✦</span>
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
      <section
        id="experience"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 font-mono text-[#00ff41] md:px-12"
      >
        <TerminalRevealWrapper
          stepCount={experiences.length}
          className="space-y-12"
        >
          <div className="mb-12">
            <p className="mb-4 text-sm opacity-70 md:text-base">
              <span className="text-[#ffb000]">root@portfolio</span>:
              <span className="text-blue-400">~</span>$ ./show_experience.sh
            </p>
            <h2 className="mb-8 inline-block border-b border-[#00ff41]/30 pb-4 text-3xl font-bold uppercase md:text-5xl">
              # EXPERIENCE_LOG
            </h2>
          </div>

          <div className="space-y-12">
            {experiences.map((exp, idx) => (
              <TerminalStepItem key={exp.id} step={idx}>
                <div className="border border-dashed border-[#00ff41]/50 p-6 transition-all duration-300 hover:border-solid hover:bg-[#00ff41]/5 md:p-8">
                  <div className="flex flex-col gap-8 md:flex-row">
                    <div className="w-full flex-shrink-0 md:w-1/3">
                      <p className="mb-2 text-sm font-bold text-[#ffb000] uppercase">
                        [{exp.startDate} - {exp.endDate}]
                      </p>
                      <h3 className="mb-1 text-xl font-bold text-white uppercase">
                        {exp.company}
                      </h3>
                      <p className="text-base text-[#00ff41] opacity-80">
                        &gt; {exp.title}
                      </p>
                    </div>
                    <div className="w-full md:w-2/3">
                      <p className="mb-6 text-sm leading-relaxed text-white/70">
                        {`/* ${exp.description.join(" ")} */`}
                      </p>
                      <ul className="space-y-3 text-sm">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="flex items-start">
                            <span className="mt-1 mr-3 text-[#ffb000]">
                              -&gt;
                            </span>
                            <span className="leading-relaxed opacity-90">
                              {achievement}
                            </span>
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
              <h2
                className="text-4xl font-bold tracking-widest text-[#ff00ff] uppercase md:text-6xl"
                style={{
                  fontFamily: "var(--font-display)",
                  textShadow: "0 0 15px #ff00ff",
                }}
              >
                LEVEL_UP
              </h2>
              <p className="mt-8 animate-pulse text-[#00ffff]">
                SCROLL TO CONTINUE
              </p>
            </GlitchBurst>
          </SnapSection>

          {experiences.map((exp, idx) => (
            <SnapSection
              key={exp.id}
              className="mx-auto max-w-5xl px-4 md:px-8"
            >
              <GlitchBurst className="w-full">
                <NeonBorder
                  color={idx % 2 === 0 ? "cyan" : "yellow"}
                  className="flex w-full flex-col gap-8 p-8 md:flex-row md:p-10"
                >
                  <div className="w-full flex-shrink-0 md:w-1/3">
                    <p
                      className="mb-2 text-sm font-bold tracking-widest text-[#ffff00] uppercase"
                      style={{ textShadow: "0 0 5px #ffff00" }}
                    >
                      {`${exp.startDate} / ${exp.endDate}`}
                    </p>
                    <h3
                      className="mb-1 text-2xl font-bold text-white uppercase"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {exp.company}
                    </h3>
                    <p
                      className="text-lg font-semibold text-[#00ffff]"
                      style={{ textShadow: "0 0 5px #00ffff" }}
                    >
                      {exp.title}
                    </p>
                  </div>
                  <div className="w-full md:w-2/3">
                    <p className="mb-6 leading-relaxed font-medium text-white/90">
                      {exp.description.join(" ")}
                    </p>
                    <ul className="space-y-3">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start text-white/80">
                          <span className="mt-1 mr-3 text-xl leading-none text-[#ff00ff]">
                            ►
                          </span>
                          <span className="leading-relaxed font-medium">
                            {achievement}
                          </span>
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
      <section
        id="experience"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 font-serif md:px-8"
      >
        <FluidDistortionWrapper>
          <FloatingEntry className="mb-16 text-center">
            <h2 className="text-4xl font-medium tracking-wide text-[#e0f4ff] drop-shadow-[0_0_15px_rgba(0,255,255,0.4)] md:text-6xl">
              Depths
            </h2>
            <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent opacity-50" />
          </FloatingEntry>

          <div className="space-y-12">
            {experiences.map((exp) => (
              <FloatingEntry key={exp.id}>
                <div className="flex flex-col gap-8 rounded-3xl border border-[#00ffff]/10 bg-[#001433]/70 p-8 shadow-[0_0_30px_rgba(0,255,255,0.05)] backdrop-blur-xl transition-all duration-700 hover:border-[#00ffff]/30 hover:shadow-[0_0_40px_rgba(0,255,255,0.15)] md:flex-row md:p-10">
                  <div className="w-full flex-shrink-0 md:w-1/3">
                    <p className="mb-2 font-sans text-sm tracking-widest text-[#00ffff] uppercase opacity-80">
                      {exp.startDate} — {exp.endDate}
                    </p>
                    <h3 className="mb-1 text-2xl font-medium tracking-wide text-[#e0f4ff]">
                      {exp.company}
                    </h3>
                    <p className="font-sans text-lg font-light text-[#ff00ff] opacity-90">
                      {exp.title}
                    </p>
                  </div>
                  <div className="w-full md:w-2/3">
                    <p className="mb-6 font-sans leading-relaxed font-light text-[#e0f4ff]/70">
                      {exp.description.join(" ")}
                    </p>
                    <ul className="space-y-3">
                      {exp.achievements.map((achievement, i) => (
                        <li
                          key={i}
                          className="flex items-start font-sans font-light text-[#e0f4ff]/80"
                        >
                          <span className="mt-1 mr-3 text-[#00ffff] opacity-70">
                            ∿
                          </span>
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
    <section className="flex min-h-screen items-center justify-center">
      <h2 className="text-4xl">Experience - {theme}</h2>
    </section>
  );
}
