"use client";

import { useTheme } from "@/hooks/useTheme";
import { getFeaturedProjects, getPublicProjects } from "@/lib/data/projects";
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
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";

export function Projects() {
  const { theme } = useTheme();
  const featured = getFeaturedProjects();
  const nonFeatured = getPublicProjects().filter((p) => !p.featured);

  if (theme === "liquid-glass") {
    return (
      <section id="projects" className="relative z-10 w-full overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pt-32 md:px-8">
          <TextReveal className="mb-16 text-center">
            <span className="inline-block rounded-full border border-white/20 bg-white/10 px-6 py-2 text-sm font-medium tracking-widest text-white/80 uppercase backdrop-blur-md">
              Featured Work
            </span>
          </TextReveal>
        </div>

        <HorizontalScrollWrapper className="mb-32 w-full">
          {featured.map((project, idx) => (
            <div
              key={project.id}
              className="w-[90vw] flex-shrink-0 md:w-[800px] lg:w-[1000px]"
            >
              <TextReveal className={`delay-[${idx * 100}ms] h-full`}>
                <GlassCard className="group flex h-full flex-col overflow-hidden p-0 lg:flex-row">
                  <div className="flex w-full flex-col justify-center p-8 md:p-12 lg:w-1/2">
                    <p className="mb-4 text-sm font-medium tracking-widest text-indigo-400 uppercase">
                      {project.category}
                    </p>
                    <h3 className="mb-6 text-4xl font-bold text-white">
                      {project.title}
                    </h3>
                    <p className="mb-8 text-lg leading-relaxed text-white/70">
                      {project.shortDescription}
                    </p>
                    <div className="mb-10 flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech.name}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} source code`}
                          className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-medium text-white transition-colors hover:bg-white/20"
                        >
                          <Github size={18} /> Code
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} live demo`}
                          className="flex items-center gap-2 rounded-full bg-indigo-500/80 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-500"
                        >
                          <ExternalLink size={18} /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="relative min-h-[400px] w-full overflow-hidden bg-black/20 lg:min-h-full lg:w-1/2">
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover opacity-80 transition-opacity duration-500 group-hover:scale-105 group-hover:opacity-100"
                      />
                    )}
                  </div>
                </GlassCard>
              </TextReveal>
            </div>
          ))}
        </HorizontalScrollWrapper>

        <div className="mx-auto max-w-6xl px-4 pb-32 md:px-8">
          <TextReveal className="mb-16 text-center">
            <h3 className="text-3xl font-light text-white/90">
              Other Projects
            </h3>
          </TextReveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {nonFeatured.map((project, idx) => (
              <TextReveal
                key={project.id}
                className={`delay-[${(idx % 3) * 100}ms]`}
              >
                <GlassCard className="flex h-full flex-col p-8">
                  <div className="mb-6 flex items-start justify-between">
                    <p className="text-xs font-medium tracking-widest text-indigo-400 uppercase">
                      {project.category}
                    </p>
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} source code`}
                          className="text-white/50 transition-colors hover:text-white"
                        >
                          <Github size={20} />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} live demo`}
                          className="text-white/50 transition-colors hover:text-white"
                        >
                          <ExternalLink size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                  <h4 className="mb-4 text-2xl font-semibold text-white">
                    {project.title}
                  </h4>
                  <p className="mb-8 flex-grow leading-relaxed text-white/60">
                    {project.shortDescription}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span key={tech.name} className="text-xs text-white/40">
                        {tech.name}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="text-xs text-white/40">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>
                </GlassCard>
              </TextReveal>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (theme === "cosmic-voyage") {
    return (
      <section
        id="projects"
        className="relative z-10 mx-auto min-h-screen max-w-6xl px-4 py-32 md:px-8"
      >
        <div className="mb-24 text-center">
          <h2
            className="mb-4 text-3xl font-light tracking-[0.3em] text-white uppercase md:text-5xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Discoveries
          </h2>
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
        </div>

        <div className="mb-32 space-y-48">
          {featured.map((project, idx) => (
            <ParallaxDepthWrapper key={project.id} depth={1 + (idx % 2) * 0.5}>
              <WarpTransition>
                <NebulaCard className="group flex flex-col overflow-hidden p-0 lg:flex-row">
                  <div className="relative z-10 flex w-full flex-col justify-center bg-black/40 p-8 backdrop-blur-sm md:p-12 lg:w-1/2">
                    <p className="mb-4 text-xs font-bold tracking-[0.2em] text-purple-400 uppercase">
                      {project.category}
                    </p>
                    <h3
                      className="mb-6 text-4xl font-bold text-white"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {project.title}
                    </h3>
                    <p className="mb-8 text-lg leading-relaxed text-indigo-100/70">
                      {project.shortDescription}
                    </p>
                    <div className="mb-10 flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech.name}
                          className="rounded border border-purple-500/30 px-3 py-1 text-xs tracking-wider text-purple-200"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} source code`}
                          className="flex items-center gap-2 border border-white/20 px-6 py-3 text-sm tracking-widest text-white uppercase transition-colors hover:border-white/50"
                        >
                          <Github size={16} /> Source
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} live demo`}
                          className="flex items-center gap-2 bg-purple-600/80 px-6 py-3 text-sm tracking-widest text-white uppercase transition-colors hover:bg-purple-500"
                        >
                          <ExternalLink size={16} /> Launch
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="relative min-h-[400px] w-full overflow-hidden bg-black lg:min-h-full lg:w-1/2">
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover opacity-60 mix-blend-luminosity transition-all duration-700 group-hover:scale-105 group-hover:opacity-100 group-hover:mix-blend-normal"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent lg:bg-gradient-to-r" />
                  </div>
                </NebulaCard>
              </WarpTransition>
            </ParallaxDepthWrapper>
          ))}
        </div>

        <div className="mb-16 text-center">
          <h3
            className="text-2xl font-light tracking-[0.2em] text-indigo-200 uppercase"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Other Expeditions
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {nonFeatured.map((project) => (
            <WarpTransition key={project.id}>
              <NebulaCard className="flex h-full flex-col p-8">
                <div className="mb-6 flex items-start justify-between">
                  <p className="text-xs font-bold tracking-[0.2em] text-purple-400 uppercase">
                    {project.category}
                  </p>
                  <div className="flex gap-3">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${project.title} source code`}
                        className="text-indigo-300 transition-colors hover:text-white"
                      >
                        <Github size={18} />
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${project.title} live demo`}
                        className="text-indigo-300 transition-colors hover:text-white"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
                <h4
                  className="mb-4 text-2xl font-semibold text-white"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {project.title}
                </h4>
                <p className="mb-8 flex-grow text-sm leading-relaxed text-indigo-100/60">
                  {project.shortDescription}
                </p>
                <div className="mt-auto flex flex-wrap gap-2">
                  {project.techStack.slice(0, 3).map((tech) => (
                    <span
                      key={tech.name}
                      className="text-xs tracking-wider text-purple-300/50"
                    >
                      {tech.name}
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
        id="projects"
        className="relative z-10 mx-auto min-h-screen max-w-6xl px-4 py-32 font-mono text-[#00ff41] md:px-12"
      >
        <TerminalRevealWrapper
          stepCount={featured.length + 1}
          className="mb-32 space-y-16"
        >
          <div className="mb-12">
            <p className="mb-4 text-sm opacity-70 md:text-base">
              <span className="text-[#ffb000]">root@portfolio</span>:
              <span className="text-blue-400">~</span>$ ls -la ./projects
            </p>
            <h2 className="mb-8 inline-block border-b border-[#00ff41]/30 pb-4 text-3xl font-bold uppercase md:text-5xl">
              # PROJECT_DIRECTORY
            </h2>
          </div>

          <div className="mb-32 space-y-16">
            {featured.map((project, idx) => (
              <TerminalStepItem key={project.id} step={idx}>
                <div className="group border border-[#00ff41]/30 bg-black/60 p-6 transition-all duration-300 hover:bg-[#00ff41]/5 md:p-8">
                  <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="flex w-full flex-col justify-center lg:w-1/2">
                      <p className="mb-4 text-xs font-bold text-[#ffb000] uppercase">
                        drwxr-xr-x {project.category}
                      </p>
                      <h3 className="mb-6 text-3xl font-bold text-white uppercase">
                        {project.title}
                      </h3>
                      <p className="mb-8 text-base leading-relaxed text-[#00ff41]/80">
                        {project.shortDescription}
                      </p>
                      <div className="mb-10 flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech.name}
                            className="border border-[#00ff41]/50 px-2 py-1 text-xs text-[#00ff41]"
                          >
                            {tech.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-4 text-sm font-bold">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} source code`}
                            className="flex items-center gap-2 border border-[#00ff41] px-4 py-2 uppercase transition-colors hover:bg-[#00ff41] hover:text-black"
                          >
                            <Github size={16} /> [SRC]
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} live demo`}
                            className="flex items-center gap-2 border border-[#00ff41] bg-[#00ff41] px-4 py-2 text-black uppercase transition-colors hover:bg-transparent hover:text-[#00ff41]"
                          >
                            <ExternalLink size={16} /> [RUN]
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="relative flex min-h-[300px] w-full items-center justify-center overflow-hidden border border-[#00ff41]/30 bg-black lg:w-1/2">
                      <div className="pointer-events-none absolute inset-0 z-10 bg-[#00ff41]/10 mix-blend-overlay" />
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover opacity-50 grayscale transition-all duration-500 group-hover:opacity-80 group-hover:grayscale-0"
                        />
                      ) : (
                        <span className="text-2xl font-bold tracking-widest text-[#00ff41]/30 uppercase">
                          NO_IMAGE_DATA
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </TerminalStepItem>
            ))}
          </div>

          <TerminalStepItem step={featured.length}>
            <div className="mb-12">
              <p className="mb-4 text-sm opacity-70 md:text-base">
                <span className="text-[#ffb000]">root@portfolio</span>:
                <span className="text-blue-400">~</span>$ ls -la
                ./other_projects
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {nonFeatured.map((project) => (
                <div
                  key={project.id}
                  className="flex h-full flex-col border border-dashed border-[#00ff41]/40 p-6 transition-all hover:border-solid hover:bg-[#00ff41]/5"
                >
                  <div className="mb-6 flex items-start justify-between">
                    <p className="text-xs font-bold text-[#ffb000] uppercase">
                      {project.category}
                    </p>
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} source code`}
                          className="text-[#00ff41]/60 transition-colors hover:text-[#00ff41]"
                        >
                          <Github size={18} />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} live demo`}
                          className="text-[#00ff41]/60 transition-colors hover:text-[#00ff41]"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                  <h4 className="mb-4 text-xl font-bold text-white uppercase">
                    {project.title}
                  </h4>
                  <p className="mb-8 flex-grow text-sm leading-relaxed text-[#00ff41]/70">
                    {project.shortDescription}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span
                        key={tech.name}
                        className="text-xs text-[#00ff41]/50"
                      >
                        [{tech.name}]
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TerminalStepItem>
        </TerminalRevealWrapper>
      </section>
    );
  }

  if (theme === "synthwave-sunset") {
    return (
      <section id="projects" className="relative w-full font-sans">
        <SnapScrollWrapper>
          <SnapSection className="flex-col">
            <GlitchBurst className="text-center">
              <h2
                className="text-4xl font-bold tracking-widest text-[#ffff00] uppercase md:text-6xl"
                style={{
                  fontFamily: "var(--font-display)",
                  textShadow: "0 0 15px #ffff00",
                }}
              >
                ARCADE_CABINETS
              </h2>
              <p className="mt-8 animate-pulse text-[#00ffff]">
                SCROLL TO CONTINUE
              </p>
            </GlitchBurst>
          </SnapSection>

          {featured.map((project, idx) => (
            <SnapSection
              key={project.id}
              className="mx-auto max-w-6xl px-4 md:px-8"
            >
              <GlitchBurst className="w-full">
                <NeonBorder
                  color={idx % 2 === 0 ? "magenta" : "cyan"}
                  className="group flex w-full flex-col overflow-hidden p-0 lg:flex-row"
                >
                  <div className="relative z-10 flex w-full flex-col justify-center bg-black/60 p-8 md:p-12 lg:w-1/2">
                    <p
                      className="mb-4 text-sm font-bold tracking-widest text-[#00ffff] uppercase"
                      style={{ textShadow: "0 0 5px #00ffff" }}
                    >
                      {project.category}
                    </p>
                    <h3
                      className="mb-6 text-4xl font-bold text-white uppercase"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {project.title}
                    </h3>
                    <p className="mb-8 text-lg leading-relaxed font-medium text-white/90">
                      {project.shortDescription}
                    </p>
                    <div className="mb-10 flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech.name}
                          className="border border-[#ff00ff]/50 bg-[#ff00ff]/20 px-3 py-1 text-sm font-bold text-[#ff00ff] uppercase"
                          style={{ textShadow: "0 0 5px #ff00ff" }}
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 font-bold uppercase">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} source code`}
                          className="flex items-center gap-2 border-2 border-[#00ffff] px-6 py-3 text-[#00ffff] shadow-[0_0_10px_#00ffff,inset_0_0_10px_#00ffff] transition-colors hover:bg-[#00ffff] hover:text-black"
                        >
                          <Github size={18} /> INSERT_COIN
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} live demo`}
                          className="flex items-center gap-2 border-2 border-[#ff00ff] bg-[#ff00ff] px-6 py-3 text-white shadow-[0_0_15px_#ff00ff] transition-colors hover:bg-transparent hover:text-[#ff00ff]"
                        >
                          <ExternalLink size={18} /> START_GAME
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="relative min-h-[400px] w-full overflow-hidden border-l-2 border-[#ff00ff]/50 bg-black lg:min-h-full lg:w-1/2">
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover opacity-80 transition-opacity duration-500 group-hover:scale-105 group-hover:opacity-100"
                        style={{ filter: "contrast(1.2) saturate(1.5)" }}
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#ff00ff]/30 to-transparent mix-blend-overlay" />
                    {/* Scanline overlay */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-20"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)",
                      }}
                    />
                  </div>
                </NeonBorder>
              </GlitchBurst>
            </SnapSection>
          ))}

          <SnapSection className="mx-auto max-w-6xl flex-col px-4 md:px-8">
            <GlitchBurst className="mb-16 text-center">
              <h3
                className="text-3xl font-bold tracking-widest text-[#00ffff] uppercase"
                style={{
                  fontFamily: "var(--font-display)",
                  textShadow: "0 0 10px #00ffff",
                }}
              >
                MINI_GAMES
              </h3>
            </GlitchBurst>

            <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {nonFeatured.map((project) => (
                <GlitchBurst key={project.id}>
                  <NeonBorder
                    color="yellow"
                    className="flex h-full flex-col bg-black/60 p-8"
                  >
                    <div className="mb-6 flex items-start justify-between">
                      <p
                        className="text-xs font-bold tracking-widest text-[#ff00ff] uppercase"
                        style={{ textShadow: "0 0 5px #ff00ff" }}
                      >
                        {project.category}
                      </p>
                      <div className="flex gap-3">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} source code`}
                            className="text-[#00ffff] drop-shadow-[0_0_5px_#00ffff] transition-colors hover:text-white"
                          >
                            <Github size={20} />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${project.title} live demo`}
                            className="text-[#ff00ff] drop-shadow-[0_0_5px_#ff00ff] transition-colors hover:text-white"
                          >
                            <ExternalLink size={20} />
                          </a>
                        )}
                      </div>
                    </div>
                    <h4
                      className="mb-4 text-2xl font-bold text-white uppercase"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {project.title}
                    </h4>
                    <p className="mb-8 flex-grow leading-relaxed font-medium text-white/80">
                      {project.shortDescription}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech.name}
                          className="text-xs font-bold text-[#ffff00] uppercase"
                          style={{ textShadow: "0 0 5px #ffff00" }}
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </NeonBorder>
                </GlitchBurst>
              ))}
            </div>
          </SnapSection>
        </SnapScrollWrapper>
      </section>
    );
  }

  if (theme === "bioluminescent-deep") {
    return (
      <section
        id="projects"
        className="relative z-10 mx-auto min-h-screen max-w-6xl px-4 py-32 font-serif md:px-8"
      >
        <FluidDistortionWrapper>
          <FloatingEntry className="mb-16 text-center">
            <h2 className="text-4xl font-medium tracking-wide text-[#e0f4ff] drop-shadow-[0_0_15px_rgba(0,255,255,0.4)] md:text-6xl">
              Discoveries
            </h2>
            <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-[#00ffff] to-transparent opacity-50" />
          </FloatingEntry>

          <div className="mb-32 space-y-24">
            {featured.map((project) => (
              <FloatingEntry key={project.id}>
                <div className="group flex flex-col overflow-hidden rounded-3xl border border-[#00ffff]/10 bg-[#001433]/70 p-0 shadow-[0_0_30px_rgba(0,255,255,0.05)] backdrop-blur-xl transition-all duration-700 hover:border-[#00ffff]/30 hover:shadow-[0_0_50px_rgba(0,255,255,0.2)] lg:flex-row">
                  <div className="relative z-10 flex w-full flex-col justify-center p-8 md:p-12 lg:w-1/2">
                    <p className="mb-4 font-sans text-sm tracking-widest text-[#00ffff] uppercase opacity-80">
                      {project.category}
                    </p>
                    <h3 className="mb-6 text-4xl font-medium tracking-wide text-[#e0f4ff]">
                      {project.title}
                    </h3>
                    <p className="mb-8 font-sans text-lg leading-relaxed font-light text-[#e0f4ff]/70">
                      {project.shortDescription}
                    </p>
                    <div className="mb-10 flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech.name}
                          className="rounded-full border border-[#00ffff]/20 bg-[#00ffff]/10 px-3 py-1 font-sans text-sm font-light tracking-wide text-[#00ffff]"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 font-sans text-sm font-light tracking-widest uppercase">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} source code`}
                          className="flex items-center gap-2 rounded-full border border-[#00ffff]/30 px-6 py-3 text-[#00ffff] transition-all duration-500 hover:border-[#00ffff]/50 hover:bg-[#00ffff]/10"
                        >
                          <Github size={16} /> Source
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} live demo`}
                          className="flex items-center gap-2 rounded-full border border-[#00ffff]/50 bg-[#00ffff]/20 px-6 py-3 text-[#e0f4ff] transition-all duration-500 hover:bg-[#00ffff]/30 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                        >
                          <ExternalLink size={16} /> Explore
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="relative min-h-[400px] w-full overflow-hidden lg:min-h-full lg:w-1/2">
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover opacity-60 mix-blend-screen transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
                        style={{
                          filter: "sepia(0.5) hue-rotate(180deg) saturate(1.5)",
                        }}
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#000511] to-transparent lg:bg-gradient-to-r" />
                  </div>
                </div>
              </FloatingEntry>
            ))}
          </div>

          <FloatingEntry className="mb-16 text-center">
            <h3 className="text-3xl font-medium tracking-wide text-[#e0f4ff] drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
              Other Findings
            </h3>
            <div className="mx-auto mt-4 h-px w-12 bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent opacity-50" />
          </FloatingEntry>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {nonFeatured.map((project) => (
              <FloatingEntry key={project.id}>
                <div className="flex h-full flex-col rounded-3xl border border-[#00ffff]/10 bg-[#001433]/50 p-8 shadow-[0_0_20px_rgba(0,255,255,0.05)] backdrop-blur-lg transition-all duration-700 hover:border-[#00ffff]/30 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]">
                  <div className="mb-6 flex items-start justify-between">
                    <p className="font-sans text-xs tracking-widest text-[#00ffff] uppercase opacity-80">
                      {project.category}
                    </p>
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} source code`}
                          className="text-[#00ffff]/60 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)] transition-colors hover:text-[#00ffff]"
                        >
                          <Github size={20} />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${project.title} live demo`}
                          className="text-[#00ffff]/60 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)] transition-colors hover:text-[#00ffff]"
                        >
                          <ExternalLink size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                  <h4 className="mb-4 text-2xl font-medium tracking-wide text-[#e0f4ff]">
                    {project.title}
                  </h4>
                  <p className="mb-8 flex-grow font-sans leading-relaxed font-light text-[#e0f4ff]/60">
                    {project.shortDescription}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span
                        key={tech.name}
                        className="font-sans text-xs font-light tracking-wide text-[#00ffff]/70"
                      >
                        {tech.name}
                      </span>
                    ))}
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
      <h2 className="text-4xl">Projects - {theme}</h2>
    </section>
  );
}
