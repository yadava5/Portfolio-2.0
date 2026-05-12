"use client";

import { useTheme } from "@/hooks/useTheme";
import { testimonials } from "@/lib/data/testimonials";
import { TextReveal } from "@/components/effects/TextReveal";
import { GlassCard } from "@/components/effects/GlassCard";
import { NebulaCard } from "@/components/effects/NebulaCard";
import { WarpTransition } from "@/components/effects/WarpTransition";
import { GlitchBurst } from "@/components/effects/GlitchBurst";
import { NeonBorder } from "@/components/effects/NeonBorder";
import { FloatingEntry } from "@/components/effects/FloatingEntry";

export function Testimonials() {
  const { theme } = useTheme();

  if (theme === "liquid-glass") {
    return (
      <section
        id="testimonials"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 md:px-8"
      >
        <TextReveal className="mb-16 text-center">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-medium tracking-widest text-white/80 uppercase backdrop-blur-md">
            What People Say
          </span>
        </TextReveal>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {testimonials.map((testimonial, idx) => (
            <TextReveal
              key={testimonial.id}
              className={`delay-[${(idx % 2) * 100}ms]`}
            >
              <GlassCard className="flex h-full flex-col p-8">
                <div className="mb-6 text-4xl text-indigo-400 opacity-50">
                  &quot;
                </div>
                <p className="mb-8 flex-grow text-lg leading-relaxed font-light text-white/80 italic">
                  {testimonial.quote}
                </p>
                <div className="mt-auto flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg font-semibold text-white/60">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-indigo-300">
                      {testimonial.title}
                    </p>
                    <p className="text-xs text-white/40">
                      {testimonial.company}
                    </p>
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
      <section
        id="testimonials"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 md:px-8"
      >
        <div className="mb-16 text-center">
          <h2
            className="mb-4 text-3xl font-light tracking-[0.3em] text-white uppercase md:text-5xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Transmissions
          </h2>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-pink-400 to-transparent" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <WarpTransition key={testimonial.id}>
              <NebulaCard className="flex h-full flex-col p-8">
                <div className="mb-6 font-serif text-4xl text-pink-400 opacity-40">
                  &quot;
                </div>
                <p className="mb-8 flex-grow text-lg leading-relaxed font-light text-indigo-100/80 italic">
                  {testimonial.quote}
                </p>
                <div className="mt-auto flex items-center gap-4 border-t border-white/5 pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-pink-500/30 bg-pink-900/20 font-serif text-lg text-pink-200">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium tracking-wide text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-pink-300/80">
                      {testimonial.title}
                    </p>
                    <p className="mt-1 text-xs tracking-widest text-indigo-200/40 uppercase">
                      {testimonial.company}
                    </p>
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
      <section
        id="testimonials"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 font-mono text-[#00ff41] md:px-12"
      >
        <div className="mb-12">
          <p className="mb-4 text-sm opacity-70 md:text-base">
            <span className="text-[#ffb000]">root@portfolio</span>:
            <span className="text-blue-400">~</span>$ cat reviews.log
          </p>
          <h2 className="mb-8 inline-block border-b border-[#00ff41]/30 pb-4 text-3xl font-bold uppercase md:text-5xl">
            # USER_FEEDBACK
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex flex-col border border-dashed border-[#00ff41]/40 bg-black/40 p-6 transition-all hover:border-solid"
            >
              <div className="mb-4 text-2xl text-[#ffb000] opacity-80">
                &gt;&gt;
              </div>
              <p className="mb-8 flex-grow text-base leading-relaxed text-[#00ff41]/90">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="mt-auto flex items-center gap-4 border-t border-[#00ff41]/20 pt-4">
                <div className="flex h-10 w-10 items-center justify-center border border-[#00ff41]/30 bg-[#00ff41]/10 font-bold text-[#00ff41]">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-[#ffb000]">{testimonial.title}</p>
                  <p className="mt-1 text-xs text-[#00ff41]/50 uppercase">
                    @{testimonial.company}
                  </p>
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
      <section
        id="testimonials"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 font-sans md:px-8"
      >
        <GlitchBurst className="mb-16 text-center">
          <h2
            className="text-4xl font-bold tracking-widest text-[#ff00ff] uppercase md:text-6xl"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 15px #ff00ff",
            }}
          >
            HIGH_SCORES
          </h2>
        </GlitchBurst>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <GlitchBurst key={testimonial.id}>
              <NeonBorder
                color="yellow"
                className="flex h-full flex-col bg-black/60 p-8"
              >
                <div
                  className="mb-6 text-5xl font-bold text-[#00ffff] opacity-80"
                  style={{
                    fontFamily: "var(--font-display)",
                    textShadow: "0 0 10px #00ffff",
                  }}
                >
                  &quot;
                </div>
                <p className="mb-8 flex-grow text-lg leading-relaxed font-medium text-white/90 italic">
                  {testimonial.quote}
                </p>
                <div className="mt-auto flex items-center gap-4 border-t-2 border-[#ff00ff]/50 pt-6">
                  <div className="flex h-12 w-12 items-center justify-center border-2 border-[#ff00ff] bg-[#ff00ff]/20 text-xl font-bold text-[#ff00ff] uppercase shadow-[0_0_10px_#ff00ff]">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold tracking-wide text-white uppercase">
                      {testimonial.name}
                    </h4>
                    <p
                      className="text-sm font-bold text-[#ffff00]"
                      style={{ textShadow: "0 0 5px #ffff00" }}
                    >
                      {testimonial.title}
                    </p>
                    <p
                      className="mt-1 text-xs font-bold text-[#00ffff] uppercase"
                      style={{ textShadow: "0 0 5px #00ffff" }}
                    >
                      {testimonial.company}
                    </p>
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
      <section
        id="testimonials"
        className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-32 font-serif md:px-8"
      >
        <FloatingEntry className="mb-16 text-center">
          <h2 className="text-4xl font-medium tracking-wide text-[#e0f4ff] drop-shadow-[0_0_15px_rgba(0,255,255,0.4)] md:text-6xl">
            Echoes
          </h2>
          <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent opacity-50" />
        </FloatingEntry>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <FloatingEntry key={testimonial.id}>
              <div className="flex h-full flex-col rounded-3xl border border-[#00ffff]/10 bg-[#001433]/70 p-8 shadow-[0_0_30px_rgba(0,255,255,0.05)] backdrop-blur-xl transition-all duration-700 hover:border-[#00ffff]/30 hover:shadow-[0_0_40px_rgba(0,255,255,0.15)]">
                <div className="mb-6 font-serif text-5xl text-[#00ffff] opacity-30 drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                  &quot;
                </div>
                <p className="mb-8 flex-grow font-sans text-lg leading-relaxed font-light text-[#e0f4ff]/80 italic">
                  {testimonial.quote}
                </p>
                <div className="mt-auto flex items-center gap-4 border-t border-[#00ffff]/10 pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#00ffff]/30 bg-[#00ffff]/10 font-serif text-xl text-[#e0f4ff] shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium tracking-wide text-[#e0f4ff]">
                      {testimonial.name}
                    </h4>
                    <p className="font-sans text-sm font-light text-[#ff00ff] opacity-90">
                      {testimonial.title}
                    </p>
                    <p className="mt-1 font-sans text-xs font-light tracking-widest text-[#00ffff]/60 uppercase">
                      {testimonial.company}
                    </p>
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
    <section className="flex min-h-screen items-center justify-center">
      <h2 className="text-4xl">Testimonials - {theme}</h2>
    </section>
  );
}
