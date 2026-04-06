"use client";

import { useTheme } from "@/hooks/useTheme";
import { skillCategories } from "@/lib/data/skills";
import { TextReveal } from "@/components/effects/TextReveal";
import { GlassCard } from "@/components/effects/GlassCard";
import { NebulaCard } from "@/components/effects/NebulaCard";
import { WarpTransition } from "@/components/effects/WarpTransition";
import { TypewriterText } from "@/components/effects/TypewriterText";
import { GlitchBurst } from "@/components/effects/GlitchBurst";
import { NeonBorder } from "@/components/effects/NeonBorder";
import { FloatingEntry } from "@/components/effects/FloatingEntry";

export function Skills() {
  const { theme } = useTheme();

  if (theme === "liquid-glass") {
    return (
      <section id="skills" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-5xl mx-auto">
        <TextReveal className="mb-16 text-center">
          <span className="inline-block px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium tracking-widest uppercase text-white/80">
            Skills & Expertise
          </span>
        </TextReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillCategories.map((category, idx) => (
            <TextReveal key={category.id} className={`delay-[${(idx % 2) * 100}ms]`}>
              <GlassCard className="p-8 h-full">
                <h3 className="text-2xl font-semibold text-white mb-8 flex items-center gap-3">
                  <span className="text-indigo-400">✦</span> {category.name}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {category.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/20 hover:border-white/30 transition-all duration-300 cursor-default"
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
      <section id="skills" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl text-white font-light tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Arsenal
          </h2>
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillCategories.map((category, idx) => (
            <WarpTransition key={category.id}>
              <NebulaCard className="p-8 h-full">
                <h3 className="text-2xl font-semibold text-white mb-8 flex items-center gap-3" style={{ fontFamily: "var(--font-serif)" }}>
                  <span className="text-blue-400 text-sm">✧</span> {category.name}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {category.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="px-4 py-2 bg-blue-900/10 border border-blue-500/20 text-blue-100/80 hover:bg-blue-800/30 hover:border-blue-400/50 transition-all duration-300 cursor-default text-sm tracking-wider"
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
      <section id="skills" className="relative min-h-screen py-32 px-4 md:px-12 z-10 max-w-5xl mx-auto font-mono text-[#00ff41]">
        <div className="mb-12">
          <p className="text-sm md:text-base mb-4 opacity-70">
            <span className="text-[#ffb000]">root@portfolio</span>:<span className="text-blue-400">~</span>$ ./list_modules.sh
          </p>
          <h2 className="text-3xl md:text-5xl font-bold uppercase mb-8 border-b border-[#00ff41]/30 pb-4 inline-block">
            # LOADED_MODULES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillCategories.map((category) => (
            <div key={category.id} className="border border-[#00ff41]/30 p-6 bg-black/50 hover:bg-[#00ff41]/5 transition-colors">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 uppercase">
                <span className="text-[#ffb000]">&gt;</span> {category.name}
              </h3>
              <div className="flex flex-wrap gap-3">
                {category.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="px-3 py-1 border border-[#00ff41]/50 text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-colors cursor-default text-sm"
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
      <section id="skills" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-5xl mx-auto font-sans">
        <GlitchBurst className="mb-16 text-center">
          <h2 className="text-4xl md:text-6xl text-[#00ffff] font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", textShadow: "0 0 15px #00ffff" }}>
            LOADOUT
          </h2>
        </GlitchBurst>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillCategories.map((category, idx) => (
            <GlitchBurst key={category.id}>
              <NeonBorder color={idx % 2 === 0 ? "cyan" : "magenta"} className="p-8 h-full bg-black/60">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 uppercase" style={{ fontFamily: "var(--font-display)" }}>
                  <span className="text-[#ffff00]" style={{ textShadow: "0 0 10px #ffff00" }}>⚡</span> {category.name}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {category.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="px-4 py-2 bg-black border-2 border-[#ff00ff] text-white font-bold uppercase hover:bg-[#ff00ff] hover:text-black transition-colors cursor-default shadow-[0_0_10px_#ff00ff,inset_0_0_5px_#ff00ff]"
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
      <section id="skills" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-5xl mx-auto font-serif">
        <FloatingEntry className="mb-16 text-center">
          <h2 className="text-4xl md:text-6xl text-[#e0f4ff] font-medium tracking-wide drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">
            Capabilities
          </h2>
          <div className="h-px w-16 mx-auto mt-6 bg-gradient-to-r from-transparent via-[#00ffff] to-transparent opacity-50" />
        </FloatingEntry>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillCategories.map((category, idx) => (
            <FloatingEntry key={category.id}>
              <div className="p-8 h-full rounded-3xl bg-[#001433]/70 backdrop-blur-xl border border-[#00ffff]/10 shadow-[0_0_30px_rgba(0,255,255,0.05)] hover:shadow-[0_0_40px_rgba(0,255,255,0.15)] hover:border-[#00ffff]/30 transition-all duration-700">
                <h3 className="text-2xl font-medium text-[#e0f4ff] mb-8 flex items-center gap-3 tracking-wide">
                  <span className="text-[#00ffff] opacity-70">∿</span> {category.name}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {category.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="px-4 py-2 rounded-full bg-[#00ffff]/5 border border-[#00ffff]/20 text-[#e0f4ff]/80 font-sans font-light tracking-wide hover:bg-[#00ffff]/20 hover:border-[#00ffff]/50 hover:text-[#e0f4ff] transition-all duration-500 cursor-default hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]"
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
    <section className="min-h-screen flex items-center justify-center">
      <h2 className="text-4xl">Skills - {theme}</h2>
    </section>
  );
}
