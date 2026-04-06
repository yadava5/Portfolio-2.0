"use client";

import { useTheme } from "@/hooks/useTheme";
import { getFeaturedProjects, getPublicProjects } from "@/lib/data/projects";
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
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";

export function Projects() {
  const { theme } = useTheme();
  const featured = getFeaturedProjects();
  const nonFeatured = getPublicProjects().filter((p) => !p.featured);

  if (theme === "liquid-glass") {
    return (
      <section id="projects" className="relative z-10 w-full overflow-hidden">
        <div className="pt-32 px-4 md:px-8 max-w-6xl mx-auto">
          <TextReveal className="mb-16 text-center">
            <span className="inline-block px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium tracking-widest uppercase text-white/80">
              Featured Work
            </span>
          </TextReveal>
        </div>

        <HorizontalScrollWrapper className="w-full mb-32">
          {featured.map((project, idx) => (
            <div key={project.id} className="w-[90vw] md:w-[800px] lg:w-[1000px] flex-shrink-0">
              <TextReveal className={`delay-[${idx * 100}ms] h-full`}>
                <GlassCard className="p-0 overflow-hidden flex flex-col lg:flex-row group h-full">
                  <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <p className="text-sm font-medium text-indigo-400 uppercase tracking-widest mb-4">
                      {project.category}
                    </p>
                    <h3 className="text-4xl font-bold text-white mb-6">
                      {project.title}
                    </h3>
                    <p className="text-lg text-white/70 leading-relaxed mb-8">
                      {project.shortDescription}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-10">
                      {project.techStack.map((tech) => (
                        <span key={tech.name} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-white/80">
                          {tech.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white font-medium">
                          <Github size={18} /> Code
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-500/80 hover:bg-indigo-500 transition-colors text-white font-medium">
                          <ExternalLink size={18} /> Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full bg-black/20 overflow-hidden">
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                </GlassCard>
              </TextReveal>
            </div>
          ))}
        </HorizontalScrollWrapper>

        <div className="max-w-6xl mx-auto px-4 md:px-8 pb-32">
          <TextReveal className="mb-16 text-center">
            <h3 className="text-3xl font-light text-white/90">Other Projects</h3>
          </TextReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nonFeatured.map((project, idx) => (
              <TextReveal key={project.id} className={`delay-[${(idx % 3) * 100}ms]`}>
                <GlassCard className="p-8 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-xs font-medium text-indigo-400 uppercase tracking-widest">
                      {project.category}
                    </p>
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                          <Github size={20} />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors">
                          <ExternalLink size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                  <h4 className="text-2xl font-semibold text-white mb-4">
                    {project.title}
                  </h4>
                  <p className="text-white/60 leading-relaxed mb-8 flex-grow">
                    {project.shortDescription}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span key={tech.name} className="text-xs text-white/40">
                        {tech.name}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="text-xs text-white/40">+{project.techStack.length - 3}</span>
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
      <section id="projects" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-6xl mx-auto">
        <div className="mb-24 text-center">
          <h2 className="text-3xl md:text-5xl text-white font-light tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "var(--font-serif)" }}>
            Discoveries
          </h2>
          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
        </div>

        <div className="space-y-48 mb-32">
          {featured.map((project, idx) => (
            <ParallaxDepthWrapper key={project.id} depth={1 + (idx % 2) * 0.5}>
              <WarpTransition>
                <NebulaCard className="p-0 overflow-hidden flex flex-col lg:flex-row group">
                  <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10 bg-black/40 backdrop-blur-sm">
                    <p className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em] mb-4">
                      {project.category}
                    </p>
                    <h3 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-serif)" }}>
                      {project.title}
                    </h3>
                    <p className="text-lg text-indigo-100/70 leading-relaxed mb-8">
                      {project.shortDescription}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-10">
                      {project.techStack.map((tech) => (
                        <span key={tech.name} className="px-3 py-1 rounded border border-purple-500/30 text-xs text-purple-200 tracking-wider">
                          {tech.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 border border-white/20 hover:border-white/50 transition-colors text-white text-sm tracking-widest uppercase">
                          <Github size={16} /> Source
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-purple-600/80 hover:bg-purple-500 transition-colors text-white text-sm tracking-widest uppercase">
                          <ExternalLink size={16} /> Launch
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full bg-black overflow-hidden">
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover opacity-60 mix-blend-luminosity group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-700 group-hover:scale-105"
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
          <h3 className="text-2xl text-indigo-200 font-light tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-serif)" }}>
            Other Expeditions
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {nonFeatured.map((project, idx) => (
            <WarpTransition key={project.id}>
              <NebulaCard className="p-8 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <p className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em]">
                    {project.category}
                  </p>
                  <div className="flex gap-3">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-white transition-colors">
                        <Github size={18} />
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:text-white transition-colors">
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
                <h4 className="text-2xl font-semibold text-white mb-4" style={{ fontFamily: "var(--font-serif)" }}>
                  {project.title}
                </h4>
                <p className="text-indigo-100/60 leading-relaxed mb-8 flex-grow text-sm">
                  {project.shortDescription}
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.techStack.slice(0, 3).map((tech) => (
                    <span key={tech.name} className="text-xs text-purple-300/50 tracking-wider">
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
      <section id="projects" className="relative min-h-screen py-32 px-4 md:px-12 z-10 max-w-6xl mx-auto font-mono text-[#00ff41]">
        <TerminalRevealWrapper stepCount={featured.length + 1} className="space-y-16 mb-32">
          <div className="mb-12">
            <p className="text-sm md:text-base mb-4 opacity-70">
              <span className="text-[#ffb000]">root@portfolio</span>:<span className="text-blue-400">~</span>$ ls -la ./projects
            </p>
            <h2 className="text-3xl md:text-5xl font-bold uppercase mb-8 border-b border-[#00ff41]/30 pb-4 inline-block">
              # PROJECT_DIRECTORY
            </h2>
          </div>

          <div className="space-y-16 mb-32">
            {featured.map((project, idx) => (
              <TerminalStepItem key={project.id} step={idx}>
                <div className="border border-[#00ff41]/30 p-6 md:p-8 bg-black/60 hover:bg-[#00ff41]/5 transition-all duration-300 group">
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-1/2 flex flex-col justify-center">
                      <p className="text-xs font-bold text-[#ffb000] uppercase mb-4">
                        drwxr-xr-x {project.category}
                      </p>
                      <h3 className="text-3xl font-bold text-white mb-6 uppercase">
                        {project.title}
                      </h3>
                      <p className="text-base text-[#00ff41]/80 leading-relaxed mb-8">
                        {project.shortDescription}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-10">
                        {project.techStack.map((tech) => (
                          <span key={tech.name} className="px-2 py-1 border border-[#00ff41]/50 text-xs text-[#00ff41]">
                            {tech.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-4 text-sm font-bold">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 border border-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-colors uppercase">
                            <Github size={16} /> [SRC]
                          </a>
                        )}
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#00ff41] text-black hover:bg-transparent hover:text-[#00ff41] border border-[#00ff41] transition-colors uppercase">
                            <ExternalLink size={16} /> [RUN]
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="w-full lg:w-1/2 relative min-h-[300px] border border-[#00ff41]/30 overflow-hidden bg-black flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#00ff41]/10 mix-blend-overlay z-10 pointer-events-none" />
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-500"
                        />
                      ) : (
                        <span className="text-[#00ff41]/30 text-2xl font-bold uppercase tracking-widest">NO_IMAGE_DATA</span>
                      )}
                    </div>
                  </div>
                </div>
              </TerminalStepItem>
            ))}
          </div>

          <TerminalStepItem step={featured.length}>
            <div className="mb-12">
              <p className="text-sm md:text-base mb-4 opacity-70">
                <span className="text-[#ffb000]">root@portfolio</span>:<span className="text-blue-400">~</span>$ ls -la ./other_projects
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nonFeatured.map((project) => (
                <div key={project.id} className="border border-dashed border-[#00ff41]/40 p-6 h-full flex flex-col hover:border-solid hover:bg-[#00ff41]/5 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-xs font-bold text-[#ffb000] uppercase">
                      {project.category}
                    </p>
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                          <Github size={18} />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-[#00ff41]/60 hover:text-[#00ff41] transition-colors">
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-4 uppercase">
                    {project.title}
                  </h4>
                  <p className="text-[#00ff41]/70 leading-relaxed mb-8 flex-grow text-sm">
                    {project.shortDescription}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span key={tech.name} className="text-xs text-[#00ff41]/50">
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
              <h2 className="text-4xl md:text-6xl text-[#ffff00] font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", textShadow: "0 0 15px #ffff00" }}>
                ARCADE_CABINETS
              </h2>
              <p className="mt-8 text-[#00ffff] animate-pulse">SCROLL TO CONTINUE</p>
            </GlitchBurst>
          </SnapSection>

          {featured.map((project, idx) => (
            <SnapSection key={project.id} className="px-4 md:px-8 max-w-6xl mx-auto">
              <GlitchBurst className="w-full">
                <NeonBorder color={idx % 2 === 0 ? "magenta" : "cyan"} className="p-0 overflow-hidden flex flex-col lg:flex-row group w-full">
                  <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10 bg-black/60">
                    <p className="text-sm font-bold text-[#00ffff] uppercase tracking-widest mb-4" style={{ textShadow: "0 0 5px #00ffff" }}>
                      {project.category}
                    </p>
                    <h3 className="text-4xl font-bold text-white mb-6 uppercase" style={{ fontFamily: "var(--font-display)" }}>
                      {project.title}
                    </h3>
                    <p className="text-lg text-white/90 leading-relaxed mb-8 font-medium">
                      {project.shortDescription}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-10">
                      {project.techStack.map((tech) => (
                        <span key={tech.name} className="px-3 py-1 bg-[#ff00ff]/20 border border-[#ff00ff]/50 text-sm font-bold text-[#ff00ff] uppercase" style={{ textShadow: "0 0 5px #ff00ff" }}>
                          {tech.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 font-bold uppercase">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 border-2 border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-black transition-colors shadow-[0_0_10px_#00ffff,inset_0_0_10px_#00ffff]">
                          <Github size={18} /> INSERT_COIN
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-[#ff00ff] text-white border-2 border-[#ff00ff] hover:bg-transparent hover:text-[#ff00ff] transition-colors shadow-[0_0_15px_#ff00ff]">
                          <ExternalLink size={18} /> START_GAME
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full bg-black overflow-hidden border-l-2 border-[#ff00ff]/50">
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
                        style={{ filter: "contrast(1.2) saturate(1.5)" }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#ff00ff]/30 to-transparent mix-blend-overlay pointer-events-none" />
                    {/* Scanline overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)" }} />
                  </div>
                </NeonBorder>
              </GlitchBurst>
            </SnapSection>
          ))}

          <SnapSection className="flex-col px-4 md:px-8 max-w-6xl mx-auto">
            <GlitchBurst className="mb-16 text-center">
              <h3 className="text-3xl text-[#00ffff] font-bold uppercase tracking-widest" style={{ fontFamily: "var(--font-display)", textShadow: "0 0 10px #00ffff" }}>
                MINI_GAMES
              </h3>
            </GlitchBurst>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {nonFeatured.map((project, idx) => (
                <GlitchBurst key={project.id}>
                  <NeonBorder color="yellow" className="p-8 h-full flex flex-col bg-black/60">
                    <div className="flex justify-between items-start mb-6">
                      <p className="text-xs font-bold text-[#ff00ff] uppercase tracking-widest" style={{ textShadow: "0 0 5px #ff00ff" }}>
                        {project.category}
                      </p>
                      <div className="flex gap-3">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[#00ffff] hover:text-white transition-colors drop-shadow-[0_0_5px_#00ffff]">
                            <Github size={20} />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-[#ff00ff] hover:text-white transition-colors drop-shadow-[0_0_5px_#ff00ff]">
                            <ExternalLink size={20} />
                          </a>
                        )}
                      </div>
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-4 uppercase" style={{ fontFamily: "var(--font-display)" }}>
                      {project.title}
                    </h4>
                    <p className="text-white/80 font-medium leading-relaxed mb-8 flex-grow">
                      {project.shortDescription}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span key={tech.name} className="text-xs font-bold text-[#ffff00] uppercase" style={{ textShadow: "0 0 5px #ffff00" }}>
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
      <section id="projects" className="relative min-h-screen py-32 px-4 md:px-8 z-10 max-w-6xl mx-auto font-serif">
        <FluidDistortionWrapper>
          <FloatingEntry className="mb-16 text-center">
            <h2 className="text-4xl md:text-6xl text-[#e0f4ff] font-medium tracking-wide drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">
              Discoveries
            </h2>
            <div className="h-px w-16 mx-auto mt-6 bg-gradient-to-r from-transparent via-[#00ffff] to-transparent opacity-50" />
          </FloatingEntry>

          <div className="space-y-24 mb-32">
            {featured.map((project, idx) => (
              <FloatingEntry key={project.id}>
                <div className="p-0 overflow-hidden flex flex-col lg:flex-row group rounded-3xl bg-[#001433]/70 backdrop-blur-xl border border-[#00ffff]/10 shadow-[0_0_30px_rgba(0,255,255,0.05)] hover:shadow-[0_0_50px_rgba(0,255,255,0.2)] hover:border-[#00ffff]/30 transition-all duration-700">
                  <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10">
                    <p className="text-sm font-sans text-[#00ffff] uppercase tracking-widest mb-4 opacity-80">
                      {project.category}
                    </p>
                    <h3 className="text-4xl font-medium text-[#e0f4ff] mb-6 tracking-wide">
                      {project.title}
                    </h3>
                    <p className="text-lg text-[#e0f4ff]/70 leading-relaxed mb-8 font-sans font-light">
                      {project.shortDescription}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-10">
                      {project.techStack.map((tech) => (
                        <span key={tech.name} className="px-3 py-1 rounded-full bg-[#00ffff]/10 border border-[#00ffff]/20 text-sm font-sans font-light text-[#00ffff] tracking-wide">
                          {tech.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4 font-sans font-light tracking-widest uppercase text-sm">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#00ffff]/30 text-[#00ffff] hover:bg-[#00ffff]/10 hover:border-[#00ffff]/50 transition-all duration-500">
                          <Github size={16} /> Source
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#00ffff]/20 text-[#e0f4ff] border border-[#00ffff]/50 hover:bg-[#00ffff]/30 hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all duration-500">
                          <ExternalLink size={16} /> Explore
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full overflow-hidden">
                    {project.image && (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover opacity-60 mix-blend-screen group-hover:opacity-90 transition-all duration-700 group-hover:scale-105"
                        style={{ filter: "sepia(0.5) hue-rotate(180deg) saturate(1.5)" }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000511] to-transparent lg:bg-gradient-to-r pointer-events-none" />
                  </div>
                </div>
              </FloatingEntry>
            ))}
          </div>

          <FloatingEntry className="mb-16 text-center">
            <h3 className="text-3xl text-[#e0f4ff] font-medium tracking-wide drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
              Other Findings
            </h3>
            <div className="h-px w-12 mx-auto mt-4 bg-gradient-to-r from-transparent via-[#ff00ff] to-transparent opacity-50" />
          </FloatingEntry>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nonFeatured.map((project, idx) => (
              <FloatingEntry key={project.id}>
                <div className="p-8 h-full flex flex-col rounded-3xl bg-[#001433]/50 backdrop-blur-lg border border-[#00ffff]/10 shadow-[0_0_20px_rgba(0,255,255,0.05)] hover:shadow-[0_0_30px_rgba(0,255,255,0.15)] hover:border-[#00ffff]/30 transition-all duration-700">
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-xs font-sans text-[#00ffff] uppercase tracking-widest opacity-80">
                      {project.category}
                    </p>
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[#00ffff]/60 hover:text-[#00ffff] transition-colors drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
                          <Github size={20} />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-[#00ffff]/60 hover:text-[#00ffff] transition-colors drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
                          <ExternalLink size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                  <h4 className="text-2xl font-medium text-[#e0f4ff] mb-4 tracking-wide">
                    {project.title}
                  </h4>
                  <p className="text-[#e0f4ff]/60 font-sans font-light leading-relaxed mb-8 flex-grow">
                    {project.shortDescription}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span key={tech.name} className="text-xs font-sans font-light text-[#00ffff]/70 tracking-wide">
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
    <section className="min-h-screen flex items-center justify-center">
      <h2 className="text-4xl">Projects - {theme}</h2>
    </section>
  );
}
