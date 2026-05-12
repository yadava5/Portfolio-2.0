"use client";

import { useTheme } from "@/hooks/useTheme";
import { skillCategories } from "@/lib/data/skills";
import { TextReveal } from "@/components/effects/TextReveal";
import { GlassCard } from "@/components/effects/GlassCard";
import { NebulaCard } from "@/components/effects/NebulaCard";
import { WarpTransition } from "@/components/effects/WarpTransition";
import { GlitchBurst } from "@/components/effects/GlitchBurst";
import { NeonBorder } from "@/components/effects/NeonBorder";
import { FloatingEntry } from "@/components/effects/FloatingEntry";

export function Skills() {
  const { theme } = useTheme();

  if (theme === "liquid-glass") {
    return (
      <section
        id="skills"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 md:px-8"
      >
        <TextReveal className="mb-16 text-center">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-medium tracking-widest text-white/80 uppercase backdrop-blur-md">
            Skills & Expertise
          </span>
        </TextReveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {skillCategories.map((category, idx) => (
            <TextReveal
              key={category.id}
              className={`delay-[${(idx % 2) * 100}ms]`}
            >
              <GlassCard className="h-full p-8">
                <h3 className="mb-8 flex items-center gap-3 text-2xl font-semibold text-white">
                  <span className="text-indigo-400">✦</span> {category.name}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {category.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="cursor-default rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white/80 transition-all duration-300 hover:border-white/30 hover:bg-white/20"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </TextReveal>
          ))}
        </div>
      </section>
    );
  }

  if (theme === "cosmic-voyage") {
    return (
      <section
        id="skills"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 md:px-8"
      >
        <div className="mb-16 text-center">
          <h2
            className="mb-4 text-3xl font-light tracking-[0.3em] text-white uppercase md:text-5xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Arsenal
          </h2>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {skillCategories.map((category) => (
            <WarpTransition key={category.id}>
              <NebulaCard className="h-full p-8">
                <h3
                  className="mb-8 flex items-center gap-3 text-2xl font-semibold text-white"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  <span className="text-sm text-blue-400">✧</span>{" "}
                  {category.name}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {category.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="cursor-default border border-blue-500/20 bg-blue-900/10 px-4 py-2 text-sm tracking-wider text-blue-100/80 transition-all duration-300 hover:border-blue-400/50 hover:bg-blue-800/30"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </NebulaCard>
            </WarpTransition>
          ))}
        </div>
      </section>
    );
  }

  if (theme === "retro-terminal") {
    return (
      <section
        id="skills"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 font-mono text-[#00ff41] md:px-12"
      >
        <div className="mb-12">
          <p className="mb-4 text-sm opacity-70 md:text-base">
            <span className="text-[#ffb000]">root@portfolio</span>:
            <span className="text-blue-400">~</span>$ ./list_modules.sh
          </p>
          <h2 className="mb-8 inline-block border-b border-[#00ff41]/30 pb-4 text-3xl font-bold uppercase md:text-5xl">
            # LOADED_MODULES
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {skillCategories.map((category) => (
            <div
              key={category.id}
              className="border border-[#00ff41]/30 bg-black/50 p-6 transition-colors hover:bg-[#00ff41]/5"
            >
              <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-white uppercase">
                <span className="text-[#ffb000]">&gt;</span> {category.name}
              </h3>
              <div className="flex flex-wrap gap-3">
                {category.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="cursor-default border border-[#00ff41]/50 px-3 py-1 text-sm text-[#00ff41] transition-colors hover:bg-[#00ff41] hover:text-black"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (theme === "synthwave-sunset") {
    return (
      <section
        id="skills"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 font-sans md:px-8"
      >
        <GlitchBurst className="mb-16 text-center">
          <h2
            className="text-4xl font-bold tracking-widest text-[#00ffff] uppercase md:text-6xl"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 15px #00ffff",
            }}
          >
            LOADOUT
          </h2>
        </GlitchBurst>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {skillCategories.map((category, idx) => (
            <GlitchBurst key={category.id}>
              <NeonBorder
                color={idx % 2 === 0 ? "cyan" : "magenta"}
                className="h-full bg-black/60 p-8"
              >
                <h3
                  className="mb-8 flex items-center gap-3 text-2xl font-bold text-white uppercase"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <span
                    className="text-[#ffff00]"
                    style={{ textShadow: "0 0 10px #ffff00" }}
                  >
                    ⚡
                  </span>{" "}
                  {category.name}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {category.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="cursor-default border-2 border-[#ff00ff] bg-black px-4 py-2 font-bold text-white uppercase shadow-[0_0_10px_#ff00ff,inset_0_0_5px_#ff00ff] transition-colors hover:bg-[#ff00ff] hover:text-black"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </NeonBorder>
            </GlitchBurst>
          ))}
        </div>
      </section>
    );
  }

  if (theme === "bioluminescent-deep") {
    return (
      <section
        id="skills"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 font-serif md:px-8"
      >
        <FloatingEntry className="mb-16 text-center">
          <h2 className="text-4xl font-medium tracking-wide text-[#e0f4ff] drop-shadow-[0_0_15px_rgba(0,255,255,0.4)] md:text-6xl">
            Capabilities
          </h2>
          <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-[#00ffff] to-transparent opacity-50" />
        </FloatingEntry>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {skillCategories.map((category) => (
            <FloatingEntry key={category.id}>
              <div className="h-full rounded-3xl border border-[#00ffff]/10 bg-[#001433]/70 p-8 shadow-[0_0_30px_rgba(0,255,255,0.05)] backdrop-blur-xl transition-all duration-700 hover:border-[#00ffff]/30 hover:shadow-[0_0_40px_rgba(0,255,255,0.15)]">
                <h3 className="mb-8 flex items-center gap-3 text-2xl font-medium tracking-wide text-[#e0f4ff]">
                  <span className="text-[#00ffff] opacity-70">∿</span>{" "}
                  {category.name}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {category.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="cursor-default rounded-full border border-[#00ffff]/20 bg-[#00ffff]/5 px-4 py-2 font-sans font-light tracking-wide text-[#e0f4ff]/80 transition-all duration-500 hover:border-[#00ffff]/50 hover:bg-[#00ffff]/20 hover:text-[#e0f4ff] hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            </FloatingEntry>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-screen items-center justify-center">
      <h2 className="text-4xl">Skills - {theme}</h2>
    </section>
  );
}
