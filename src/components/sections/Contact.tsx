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
      <section
        id="contact"
        className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-32 text-center md:px-8"
      >
        <TextReveal className="mb-12">
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-medium tracking-widest text-white/80 uppercase backdrop-blur-md">
            Get In Touch
          </span>
        </TextReveal>

        <TextReveal className="mb-16 max-w-2xl">
          <h2 className="mb-8 text-5xl font-bold tracking-tighter text-white md:text-7xl">
            Let&apos;s build something{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              extraordinary
            </span>
            .
          </h2>
          <p className="text-xl leading-relaxed font-light text-white/60">
            I&apos;m currently open for new opportunities. Whether you have a
            question or just want to say hi, I&apos;ll try my best to get back
            to you!
          </p>
        </TextReveal>

        <TextReveal className="w-full">
          <GlassCard className="flex flex-col items-center justify-between gap-8 p-8 md:flex-row md:p-12">
            <div className="flex flex-col items-center gap-4 md:items-start">
              <div className="flex items-center gap-3 text-white/80">
                <Mail className="text-indigo-400" size={24} />
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="text-xl transition-colors hover:text-white"
                >
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
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:text-white"
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
      <section
        id="contact"
        className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-32 text-center md:px-8"
      >
        <div className="mb-12 text-center">
          <h2
            className="mb-4 text-3xl font-light tracking-[0.3em] text-white uppercase md:text-5xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Establish Link
          </h2>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
        </div>

        <WarpTransition className="mb-16 max-w-2xl">
          <h2
            className="mb-8 text-4xl font-bold tracking-wide text-white md:text-6xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Ready to explore{" "}
            <span className="text-orange-400 italic">new frontiers?</span>
          </h2>
          <p className="text-xl leading-relaxed font-light text-indigo-100/60">
            My comms channels are open. Whether you have a mission in mind or
            just want to exchange coordinates, I&apos;ll respond as soon as the
            signal reaches me.
          </p>
        </WarpTransition>

        <WarpTransition className="w-full">
          <NebulaCard className="flex flex-col items-center justify-between gap-8 border-orange-500/20 p-8 hover:border-orange-400/40 md:flex-row md:p-12">
            <div className="flex flex-col items-center gap-6 md:items-start">
              <div className="flex items-center gap-4 text-indigo-100/80">
                <div className="rounded-full border border-orange-500/20 bg-orange-500/10 p-3 text-orange-400">
                  <Mail size={20} />
                </div>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="text-lg tracking-wider transition-colors hover:text-white"
                >
                  {personalInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-4 text-indigo-100/60">
                <div className="rounded-full border border-blue-500/20 bg-blue-500/10 p-3 text-blue-400">
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
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-indigo-500/30 bg-black/50 text-indigo-200 shadow-[0_0_15px_rgba(100,0,255,0.2)] transition-all duration-300 hover:scale-110 hover:border-indigo-400 hover:bg-indigo-900/40 hover:text-white"
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
      <section
        id="contact"
        className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-32 font-mono text-[#00ff41] md:px-12"
      >
        <div className="mb-12">
          <p className="mb-4 text-sm opacity-70 md:text-base">
            <span className="text-[#ffb000]">root@portfolio</span>:
            <span className="text-blue-400">~</span>$ ./connect.sh
          </p>
          <h2 className="mb-8 inline-block border-b border-[#00ff41]/30 pb-4 text-3xl font-bold uppercase md:text-5xl">
            # INITIATE_CONNECTION
          </h2>
        </div>

        <div className="mb-16 max-w-2xl">
          <h2 className="mb-8 text-4xl font-bold text-white uppercase md:text-5xl">
            <span className="text-[#ffb000]">PING</span> ME FOR COLLABORATION
          </h2>
          <p className="text-lg leading-relaxed text-[#00ff41]/80">
            SYSTEM STATUS: LISTENING ON ALL PORTS.
            <br />
            Awaiting new packets. Drop a message and I&apos;ll ACK as soon as
            possible.
          </p>
        </div>

        <div className="flex w-full flex-col items-center justify-between gap-8 border border-[#00ff41]/50 bg-black/60 p-8 transition-colors hover:bg-[#00ff41]/5 md:flex-row md:p-12">
          <div className="flex w-full flex-col items-center gap-6 md:w-auto md:items-start">
            <div className="flex items-center gap-4 text-[#00ff41]">
              <span className="font-bold text-[#ffb000]">MAILTO:</span>
              <a
                href={`mailto:${personalInfo.email}`}
                className="px-2 py-1 text-lg uppercase transition-colors hover:bg-[#00ff41] hover:text-black"
              >
                {personalInfo.email}
              </a>
            </div>
            <div className="flex items-center gap-4 text-[#00ff41]/70">
              <span className="font-bold text-blue-400">LOC:</span>
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
                className="flex h-14 w-14 items-center justify-center border border-[#00ff41]/50 text-[#00ff41] transition-all duration-300 hover:bg-[#00ff41] hover:text-black"
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
      <section
        id="contact"
        className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-32 text-center font-sans md:px-8"
      >
        <GlitchBurst className="mb-16">
          <h2
            className="text-4xl font-bold tracking-widest text-[#ffff00] uppercase md:text-6xl"
            style={{
              fontFamily: "var(--font-display)",
              textShadow: "0 0 15px #ffff00",
            }}
          >
            INSERT_COIN
          </h2>
        </GlitchBurst>

        <GlitchBurst className="mb-16 max-w-2xl">
          <h2
            className="mb-8 text-5xl font-bold tracking-tighter text-white uppercase md:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            READY FOR{" "}
            <span
              className="bg-gradient-to-r from-[#00ffff] to-[#ff00ff] bg-clip-text text-transparent"
              style={{ filter: "drop-shadow(0 0 10px rgba(255,0,255,0.8))" }}
            >
              PLAYER_TWO?
            </span>
          </h2>
          <p
            className="rounded-lg border border-[#00ffff]/30 bg-black/40 p-4 text-xl leading-relaxed font-medium text-white/90 backdrop-blur-sm"
            style={{ boxShadow: "0 0 20px rgba(0,255,255,0.2)" }}
          >
            The arcade is open. Drop a token in the slot and let&apos;s start a
            new game together.
          </p>
        </GlitchBurst>

        <GlitchBurst className="w-full">
          <NeonBorder
            color="cyan"
            className="flex flex-col items-center justify-between gap-8 bg-black/60 p-8 md:flex-row md:p-12"
          >
            <div className="flex flex-col items-center gap-6 md:items-start">
              <div className="flex items-center gap-4 font-bold text-white">
                <div className="border-2 border-[#ff00ff] bg-[#ff00ff]/20 p-3 text-[#ff00ff] shadow-[0_0_10px_#ff00ff]">
                  <Mail size={24} />
                </div>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="text-xl tracking-wider uppercase transition-colors hover:text-[#00ffff]"
                  style={{ textShadow: "0 0 5px rgba(255,255,255,0.5)" }}
                >
                  {personalInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-4 font-bold text-white/80">
                <div className="border-2 border-[#ffff00] bg-[#ffff00]/20 p-3 text-[#ffff00] shadow-[0_0_10px_#ffff00]">
                  <MapPin size={20} />
                </div>
                <span className="tracking-wider uppercase">
                  {personalInfo.location}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-16 w-16 items-center justify-center border-2 border-[#00ffff] bg-black text-[#00ffff] shadow-[0_0_15px_#00ffff,inset_0_0_10px_#00ffff] transition-all duration-300 hover:scale-110 hover:bg-[#00ffff] hover:text-black"
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
      <section
        id="contact"
        className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-32 text-center font-serif md:px-8"
      >
        <FloatingEntry className="mb-16 text-center">
          <h2 className="text-4xl font-medium tracking-wide text-[#e0f4ff] drop-shadow-[0_0_15px_rgba(0,255,255,0.4)] md:text-6xl">
            Sonar
          </h2>
          <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-[#00ffff] to-transparent opacity-50" />
        </FloatingEntry>

        <FloatingEntry className="mb-16 max-w-2xl">
          <h2 className="mb-8 text-5xl font-medium tracking-wide text-[#e0f4ff] md:text-7xl">
            Send a{" "}
            <span className="text-[#00ffff] italic drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
              signal
            </span>
            .
          </h2>
          <p className="font-sans text-xl leading-relaxed font-light text-[#e0f4ff]/70">
            My sonar is always on. Whether you have a project in mind or just
            want to connect, I&apos;ll catch your wave.
          </p>
        </FloatingEntry>

        <FloatingEntry className="w-full">
          <div className="flex flex-col items-center justify-between gap-8 rounded-3xl border border-[#00ffff]/20 bg-[#001433]/70 p-8 shadow-[0_0_40px_rgba(0,255,255,0.1),inset_0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-xl transition-all duration-700 hover:shadow-[0_0_50px_rgba(0,255,255,0.2)] md:flex-row md:p-12">
            <div className="flex flex-col items-center gap-6 font-sans font-light tracking-wide md:items-start">
              <div className="flex items-center gap-4 text-[#e0f4ff]/90">
                <div className="rounded-full border border-[#00ffff]/30 bg-[#00ffff]/10 p-3 text-[#00ffff] shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                  <Mail size={24} />
                </div>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="text-xl transition-all duration-300 hover:text-[#00ffff] hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                >
                  {personalInfo.email}
                </a>
              </div>
              <div className="flex items-center gap-4 text-[#e0f4ff]/70">
                <div className="rounded-full border border-[#ff00ff]/30 bg-[#ff00ff]/10 p-3 text-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.2)]">
                  <MapPin size={20} />
                </div>
                <span className="text-sm tracking-widest uppercase">
                  {personalInfo.location}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-[#00ffff]/30 bg-[#00ffff]/5 text-[#00ffff] shadow-[0_0_20px_rgba(0,255,255,0.1),inset_0_0_10px_rgba(0,255,255,0.1)] transition-all duration-500 hover:scale-110 hover:bg-[#00ffff]/20 hover:text-[#e0f4ff] hover:shadow-[0_0_30px_rgba(0,255,255,0.3),inset_0_0_15px_rgba(0,255,255,0.2)]"
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
    <section className="flex min-h-screen items-center justify-center">
      <h2 className="text-4xl">Contact - {theme}</h2>
    </section>
  );
}
