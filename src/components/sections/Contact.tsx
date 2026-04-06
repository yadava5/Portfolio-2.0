"use client";

import { useTheme } from "@/hooks/useTheme";
import { personalInfo, socialLinks } from "@/lib/data/personal";
import { TextReveal } from "@/components/effects/TextReveal";
import { GlassCard } from "@/components/effects/GlassCard";
import { NebulaCard } from "@/components/effects/NebulaCard";
import { WarpTransition } from "@/components/effects/WarpTransition";
import { TypewriterText } from "@/components/effects/TypewriterText";
import { GlitchBurst } from "@/components/effects/GlitchBurst";
import { NeonBorder } from "@/components/effects/NeonBorder";
import { FloatingEntry } from "@/components/effects/FloatingEntry";
import { Mail, MapPin, ExternalLink } from "lucide-react";

export function Contact() {
  const { theme } = useTheme();

  if (theme === "liquid-glass") {
    return (
      <section id="contact" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
        <TextReveal className="mb-12">
          <span className="inline-block px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium tracking-widest uppercase text-white/80">
            Get In Touch
          </span>
        </TextReveal>

        <TextReveal className="mb-16 max-w-2xl">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tighter">
            Let&apos;s build something <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">extraordinary</span>.
          </h2>
          <p className="text-xl text-white/60 font-light leading-relaxed">
            I&apos;m currently open for new opportunities. Whether you have a question or just want to say hi, I&apos;ll try my best to get back to you!
          </p>
        </TextReveal>

        <TextReveal className="w-full">
          <GlassCard className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3 text-white/80">
                <Mail className="text-indigo-400" size={24} />
                <a href={`mailto:${personalInfo.email}`} className="text-xl hover:text-white transition-colors">
                  {personalInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <MapPin className="text-pink-400" size={20} />
                <span>{personalInfo.location}</span>
              </div>
            </div>

            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-110"
                  aria-label={link.name}
                >
                  <ExternalLink size={20} />
                </a>
              ))}
            </div>
          </GlassCard>
        </TextReveal>
      </section>
    );
  }

  if (theme === "cosmic-voyage") {
    return (
      <section id="contact" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-5xl text-white font-light tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Establish Link
          </h2>
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
        </div>

        <WarpTransition className="mb-16 max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-wide" style={{ fontFamily: "var(--font-serif)" }}>
            Ready to explore <span className="text-orange-400 italic">new frontiers?</span>
          </h2>
          <p className="text-xl text-indigo-100/60 font-light leading-relaxed">
            My comms channels are open. Whether you have a mission in mind or just want to exchange coordinates, I&apos;ll respond as soon as the signal reaches me.
          </p>
        </WarpTransition>

        <WarpTransition className="w-full">
          <NebulaCard className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border-orange-500/20 hover:border-orange-400/40">
            <div className="flex flex-col items-center md:items-start gap-6">
              <div className="flex items-center gap-4 text-indigo-100/80">
                <div className="p-3 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
                  <Mail size={20} />
                </div>
                <a href={`mailto:${personalInfo.email}`} className="text-lg tracking-wider hover:text-white transition-colors">
                  {personalInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-4 text-indigo-100/60">
                <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <MapPin size={20} />
                </div>
                <span className="tracking-wider">{personalInfo.location}</span>
              </div>
            </div>

            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 rounded-full bg-black/50 border border-indigo-500/30 flex items-center justify-center text-indigo-200 hover:bg-indigo-900/40 hover:text-white hover:border-indigo-400 transition-all duration-300 hover:scale-110 shadow-[0_0_15px_rgba(100,0,255,0.2)]"
                  aria-label={link.name}
                >
                  <ExternalLink size={20} />
                </a>
              ))}
            </div>
          </NebulaCard>
        </WarpTransition>
      </section>
    );
  }

  if (theme === "retro-terminal") {
    return (
      <section id="contact" className="relative min-h-screen py-32 px-4 md:px-12 z-10 max-w-4xl mx-auto flex flex-col font-mono text-[#00ff41]">
        <div className="mb-12">
          <p className="text-sm md:text-base mb-4 opacity-70">
            <span className="text-[#ffb000]">root@portfolio</span>:<span className="text-blue-400">~</span>$ ./connect.sh
          </p>
          <h2 className="text-3xl md:text-5xl font-bold uppercase mb-8 border-b border-[#00ff41]/30 pb-4 inline-block">
            # INITIATE_CONNECTION
          </h2>
        </div>

        <div className="mb-16 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 uppercase">
            <span className="text-[#ffb000]">PING</span> ME FOR COLLABORATION
          </h2>
          <p className="text-lg text-[#00ff41]/80 leading-relaxed">
            SYSTEM STATUS: LISTENING ON ALL PORTS.
            <br />
            Awaiting new packets. Drop a message and I&apos;ll ACK as soon as possible.
          </p>
        </div>

        <div className="w-full border border-[#00ff41]/50 p-8 md:p-12 bg-black/60 flex flex-col md:flex-row items-center justify-between gap-8 hover:bg-[#00ff41]/5 transition-colors">
          <div className="flex flex-col items-center md:items-start gap-6 w-full md:w-auto">
            <div className="flex items-center gap-4 text-[#00ff41]">
              <span className="text-[#ffb000] font-bold">MAILTO:</span>
              <a href={`mailto:${personalInfo.email}`} className="text-lg hover:bg-[#00ff41] hover:text-black px-2 py-1 transition-colors uppercase">
                {personalInfo.email}
              </a>
            </div>
            <div className="flex items-center gap-4 text-[#00ff41]/70">
              <span className="text-blue-400 font-bold">LOC:</span>
              <span className="uppercase">{personalInfo.location}</span>
            </div>
          </div>

          <div className="flex gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 border border-[#00ff41]/50 flex items-center justify-center text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-all duration-300"
                aria-label={link.name}
              >
                <ExternalLink size={20} />
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (theme === "synthwave-sunset") {
    return (
      <section id="contact" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-4xl mx-auto flex flex-col items-center justify-center text-center font-sans">
        <GlitchBurst className="mb-16">
          <h2 className="text-4xl md:text-6xl text-[#ffff00] font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", textShadow: "0 0 15px #ffff00" }}>
            INSERT_COIN
          </h2>
        </GlitchBurst>

        <GlitchBurst className="mb-16 max-w-2xl">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 uppercase tracking-tighter" style={{ fontFamily: "var(--font-display)" }}>
            READY FOR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ffff] to-[#ff00ff]" style={{ filter: "drop-shadow(0 0 10px rgba(255,0,255,0.8))" }}>PLAYER_TWO?</span>
          </h2>
          <p className="text-xl text-white/90 font-medium leading-relaxed bg-black/40 p-4 rounded-lg border border-[#00ffff]/30 backdrop-blur-sm" style={{ boxShadow: "0 0 20px rgba(0,255,255,0.2)" }}>
            The arcade is open. Drop a token in the slot and let&apos;s start a new game together.
          </p>
        </GlitchBurst>

        <GlitchBurst className="w-full">
          <NeonBorder color="cyan" className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 bg-black/60">
            <div className="flex flex-col items-center md:items-start gap-6">
              <div className="flex items-center gap-4 text-white font-bold">
                <div className="p-3 bg-[#ff00ff]/20 border-2 border-[#ff00ff] text-[#ff00ff] shadow-[0_0_10px_#ff00ff]">
                  <Mail size={24} />
                </div>
                <a href={`mailto:${personalInfo.email}`} className="text-xl uppercase tracking-wider hover:text-[#00ffff] transition-colors" style={{ textShadow: "0 0 5px rgba(255,255,255,0.5)" }}>
                  {personalInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-4 text-white/80 font-bold">
                <div className="p-3 bg-[#ffff00]/20 border-2 border-[#ffff00] text-[#ffff00] shadow-[0_0_10px_#ffff00]">
                  <MapPin size={20} />
                </div>
                <span className="uppercase tracking-wider">{personalInfo.location}</span>
              </div>
            </div>

            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 bg-black border-2 border-[#00ffff] flex items-center justify-center text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-all duration-300 hover:scale-110 shadow-[0_0_15px_#00ffff,inset_0_0_10px_#00ffff]"
                  aria-label={link.name}
                >
                  <ExternalLink size={24} />
                </a>
              ))}
            </div>
          </NeonBorder>
        </GlitchBurst>
      </section>
    );
  }

  if (theme === "bioluminescent-deep") {
    return (
      <section id="contact" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-4xl mx-auto flex flex-col items-center justify-center text-center font-serif">
        <FloatingEntry className="mb-16 text-center">
          <h2 className="text-4xl md:text-6xl text-[#e0f4ff] font-medium tracking-wide drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">
            Sonar
          </h2>
          <div className="h-px w-16 mx-auto mt-6 bg-gradient-to-r from-transparent via-[#00ffff] to-transparent opacity-50" />
        </FloatingEntry>

        <FloatingEntry className="mb-16 max-w-2xl">
          <h2 className="text-5xl md:text-7xl font-medium text-[#e0f4ff] mb-8 tracking-wide">
            Send a <span className="text-[#00ffff] italic drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">signal</span>.
          </h2>
          <p className="text-xl text-[#e0f4ff]/70 font-sans font-light leading-relaxed">
            My sonar is always on. Whether you have a project in mind or just want to connect, I&apos;ll catch your wave.
          </p>
        </FloatingEntry>

        <FloatingEntry className="w-full">
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 rounded-3xl bg-[#001433]/70 backdrop-blur-xl border border-[#00ffff]/20 shadow-[0_0_40px_rgba(0,255,255,0.1),inset_0_0_20px_rgba(0,255,255,0.05)] hover:shadow-[0_0_50px_rgba(0,255,255,0.2)] transition-all duration-700">
            <div className="flex flex-col items-center md:items-start gap-6 font-sans font-light tracking-wide">
              <div className="flex items-center gap-4 text-[#e0f4ff]/90">
                <div className="p-3 rounded-full bg-[#00ffff]/10 border border-[#00ffff]/30 text-[#00ffff] shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                  <Mail size={24} />
                </div>
                <a href={`mailto:${personalInfo.email}`} className="text-xl hover:text-[#00ffff] hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] transition-all duration-300">
                  {personalInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-4 text-[#e0f4ff]/70">
                <div className="p-3 rounded-full bg-[#ff00ff]/10 border border-[#ff00ff]/30 text-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.2)]">
                  <MapPin size={20} />
                </div>
                <span className="uppercase tracking-widest text-sm">{personalInfo.location}</span>
              </div>
            </div>

            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 rounded-full bg-[#00ffff]/5 border border-[#00ffff]/30 flex items-center justify-center text-[#00ffff] hover:bg-[#00ffff]/20 hover:text-[#e0f4ff] transition-all duration-500 hover:scale-110 shadow-[0_0_20px_rgba(0,255,255,0.1),inset_0_0_10px_rgba(0,255,255,0.1)] hover:shadow-[0_0_30px_rgba(0,255,255,0.3),inset_0_0_15px_rgba(0,255,255,0.2)]"
                  aria-label={link.name}
                >
                  <ExternalLink size={24} />
                </a>
              ))}
            </div>
          </div>
        </FloatingEntry>
      </section>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center">
      <h2 className="text-4xl">Contact - {theme}</h2>
    </section>
  );
}
