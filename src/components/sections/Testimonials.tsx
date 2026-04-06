"use client";

import { useTheme } from "@/hooks/useTheme";
import { testimonials } from "@/lib/data/testimonials";
import { TextReveal } from "@/components/effects/TextReveal";
import { GlassCard } from "@/components/effects/GlassCard";
import { NebulaCard } from "@/components/effects/NebulaCard";
import { WarpTransition } from "@/components/effects/WarpTransition";
import { TypewriterText } from "@/components/effects/TypewriterText";
import { GlitchBurst } from "@/components/effects/GlitchBurst";
import { NeonBorder } from "@/components/effects/NeonBorder";
import { FloatingEntry } from "@/components/effects/FloatingEntry";

export function Testimonials() {
  const { theme } = useTheme();

  if (theme === "liquid-glass") {
    return (
      <section id="testimonials" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-5xl mx-auto">
        <TextReveal className="mb-16 text-center">
          <span className="inline-block px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium tracking-widest uppercase text-white/80">
            What People Say
          </span>
        </TextReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, idx) => (
            <TextReveal key={testimonial.id} className={`delay-[${(idx % 2) * 100}ms]`}>
              <GlassCard className="p-8 h-full flex flex-col">
                <div className="text-indigo-400 mb-6 text-4xl opacity-50">&quot;</div>
                <p className="text-lg text-white/80 leading-relaxed mb-8 flex-grow font-light italic">
                  {testimonial.quote}
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 font-semibold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-indigo-300">{testimonial.title}</p>
                    <p className="text-xs text-white/40">{testimonial.company}</p>
                  </div>
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
      <section id="testimonials" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl text-white font-light tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Transmissions
          </h2>
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, idx) => (
            <WarpTransition key={testimonial.id}>
              <NebulaCard className="p-8 h-full flex flex-col">
                <div className="text-pink-400 mb-6 text-4xl opacity-40 font-serif">&quot;</div>
                <p className="text-lg text-indigo-100/80 leading-relaxed mb-8 flex-grow font-light italic">
                  {testimonial.quote}
                </p>
                <div className="flex items-center gap-4 mt-auto border-t border-white/5 pt-6">
                  <div className="w-12 h-12 rounded-full bg-pink-900/20 border border-pink-500/30 flex items-center justify-center text-pink-200 font-serif text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-medium tracking-wide">{testimonial.name}</h4>
                    <p className="text-sm text-pink-300/80">{testimonial.title}</p>
                    <p className="text-xs text-indigo-200/40 uppercase tracking-widest mt-1">{testimonial.company}</p>
                  </div>
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
      <section id="testimonials" className="relative min-h-screen py-32 px-4 md:px-12 z-10 max-w-5xl mx-auto font-mono text-[#00ff41]">
        <div className="mb-12">
          <p className="text-sm md:text-base mb-4 opacity-70">
            <span className="text-[#ffb000]">root@portfolio</span>:<span className="text-blue-400">~</span>$ cat reviews.log
          </p>
          <h2 className="text-3xl md:text-5xl font-bold uppercase mb-8 border-b border-[#00ff41]/30 pb-4 inline-block">
            # USER_FEEDBACK
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="border border-dashed border-[#00ff41]/40 p-6 bg-black/40 flex flex-col hover:border-solid transition-all">
              <div className="text-[#ffb000] mb-4 text-2xl opacity-80">&gt;&gt;</div>
              <p className="text-base text-[#00ff41]/90 leading-relaxed mb-8 flex-grow">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="flex items-center gap-4 mt-auto border-t border-[#00ff41]/20 pt-4">
                <div className="w-10 h-10 bg-[#00ff41]/10 border border-[#00ff41]/30 flex items-center justify-center text-[#00ff41] font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-bold uppercase">{testimonial.name}</h4>
                  <p className="text-xs text-[#ffb000]">{testimonial.title}</p>
                  <p className="text-xs text-[#00ff41]/50 uppercase mt-1">@{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (theme === "synthwave-sunset") {
    return (
      <section id="testimonials" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-5xl mx-auto font-sans">
        <GlitchBurst className="mb-16 text-center">
          <h2 className="text-4xl md:text-6xl text-[#ff00ff] font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", textShadow: "0 0 15px #ff00ff" }}>
            HIGH_SCORES
          </h2>
        </GlitchBurst>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, idx) => (
            <GlitchBurst key={testimonial.id}>
              <NeonBorder color="yellow" className="p-8 h-full flex flex-col bg-black/60">
                <div className="text-[#00ffff] mb-6 text-5xl font-bold opacity-80" style={{ fontFamily: "var(--font-display)", textShadow: "0 0 10px #00ffff" }}>&quot;</div>
                <p className="text-lg text-white/90 font-medium leading-relaxed mb-8 flex-grow italic">
                  {testimonial.quote}
                </p>
                <div className="flex items-center gap-4 mt-auto border-t-2 border-[#ff00ff]/50 pt-6">
                  <div className="w-12 h-12 bg-[#ff00ff]/20 border-2 border-[#ff00ff] flex items-center justify-center text-[#ff00ff] font-bold text-xl uppercase shadow-[0_0_10px_#ff00ff]">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-bold uppercase tracking-wide">{testimonial.name}</h4>
                    <p className="text-sm font-bold text-[#ffff00]" style={{ textShadow: "0 0 5px #ffff00" }}>{testimonial.title}</p>
                    <p className="text-xs text-[#00ffff] font-bold uppercase mt-1" style={{ textShadow: "0 0 5px #00ffff" }}>{testimonial.company}</p>
                  </div>
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
      <section id="testimonials" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-5xl mx-auto font-serif">
        <FloatingEntry className="mb-16 text-center">
          <h2 className="text-4xl md:text-6xl text-[#e0f4ff] font-medium tracking-wide drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">
            Echoes
          </h2>
          <div className="h-px w-16 mx-auto mt-6 bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent opacity-50" />
        </FloatingEntry>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, idx) => (
            <FloatingEntry key={testimonial.id}>
              <div className="p-8 h-full flex flex-col rounded-3xl bg-[#001433]/70 backdrop-blur-xl border border-[#00ffff]/10 shadow-[0_0_30px_rgba(0,255,255,0.05)] hover:shadow-[0_0_40px_rgba(0,255,255,0.15)] hover:border-[#00ffff]/30 transition-all duration-700">
                <div className="text-[#00ffff] mb-6 text-5xl font-serif opacity-30 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">&quot;</div>
                <p className="text-lg text-[#e0f4ff]/80 font-sans font-light leading-relaxed mb-8 flex-grow italic">
                  {testimonial.quote}
                </p>
                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-[#00ffff]/10">
                  <div className="w-12 h-12 rounded-full bg-[#00ffff]/10 border border-[#00ffff]/30 flex items-center justify-center text-[#e0f4ff] font-serif text-xl shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-[#e0f4ff] font-medium tracking-wide">{testimonial.name}</h4>
                    <p className="text-sm font-sans font-light text-[#ff00ff] opacity-90">{testimonial.title}</p>
                    <p className="text-xs font-sans font-light text-[#00ffff]/60 uppercase tracking-widest mt-1">{testimonial.company}</p>
                  </div>
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
      <h2 className="text-4xl">Testimonials - {theme}</h2>
    </section>
  );
}
