"use client";

import Image from "next/image";
import { getFeaturedProjects, getPublicProjects } from "@/lib/data/projects";
import { ExternalLink, Github } from "lucide-react";
import { getThemeConfig } from "@/config/themes";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface ProjectsProps {
  themeId?: string;
}

export function Projects({ themeId = "dark-luxe" }: ProjectsProps) {
  const featured = getFeaturedProjects();
  const nonFeatured = getPublicProjects().filter((p) => !p.featured);
  const prefersReducedMotion = usePrefersReducedMotion();
  const config = getThemeConfig(themeId);

  const hoverClass = prefersReducedMotion ? "" : "hover:translate-y-[-16px] hover:scale-[1.03]";
  const smallHoverClass = prefersReducedMotion ? "" : "hover:translate-y-[-12px] hover:scale-[1.03]";

  return (
    <section
      id="projects"
      className="relative py-24 md:py-32 px-4 md:px-8 bg-background"
      data-theme={themeId}
      style={{
        backgroundColor:
          themeId === "paper-ink"
            ? "#f5f1de"
            : themeId === "editorial"
            ? "#fefefe"
            : undefined,
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-center">
          <div
            className="h-px w-12 mb-6"
            style={{
              background:
                themeId === "dark-luxe" || themeId === "noir-cinema"
                  ? "linear-gradient(to right, transparent, var(--accent-primary), transparent)"
                  : themeId === "neon-cyber"
                  ? "linear-gradient(to right, transparent, var(--neon-green), transparent)"
                  : "solid black",
            }}
          />
          <h2
            className={`text-5xl md:text-6xl font-light text-foreground text-center ${
              themeId === "paper-ink" || themeId === "editorial" ? "text-black" : ""
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            Featured Work
          </h2>
        </div>

        {/* Featured Projects */}
        {featured.length > 0 && (
          <div className="space-y-12 mb-16">
            {featured.map((project) => (
              <div
                key={project.id}
                className={`group relative border overflow-hidden rounded-sm transition-all duration-300 ${hoverClass}`}
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--accent-primary)",
                }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div
                    className="absolute inset-0 opacity-10 blur-lg"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, var(--accent-primary), transparent)",
                    }}
                  />
                </div>

                <div className="relative p-8 md:p-10 flex flex-col md:flex-row gap-8">
                  {/* Project info */}
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-accent-primary text-xs uppercase tracking-widest mb-3">
                      Featured Project
                    </p>
                    <h3
                      className="text-3xl md:text-4xl font-light text-foreground mb-4"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {project.title}
                    </h3>
                    <p className="text-foreground-muted md:text-foreground-muted text-lg leading-relaxed mb-6">
                      {project.shortDescription}
                    </p>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech.name}
                          className="text-xs px-3 py-1 border rounded-sm text-accent-tertiary"
                          style={{ borderColor: "var(--accent-primary)" }}
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>

                    {/* Metrics */}
                    {project.metrics && project.metrics.length > 0 && (
                      <div className="flex flex-wrap gap-3 mb-6 pb-6" style={{ borderBottom: "1px solid var(--accent-primary)" }}>
                        {project.metrics.map((metric, idx) => (
                          <div key={idx} className="flex flex-col">
                            <span className="text-xs text-accent-secondary uppercase tracking-widest">
                              {metric.label}
                            </span>
                            <span className="text-sm text-foreground font-medium">
                              {metric.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex gap-4 flex-wrap">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 border text-accent-secondary hover:bg-accent-secondary hover:text-background transition-all duration-300 text-xs uppercase tracking-widest"
                          style={{ borderColor: "var(--accent-secondary)" }}
                        >
                          <Github size={16} />
                          Code
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 border border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-background transition-all duration-300 text-xs uppercase tracking-widest"
                        >
                          <ExternalLink size={16} />
                          View
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Project image */}
                  <div
                    className="flex-1 relative h-64 md:h-auto min-h-80 rounded-sm overflow-hidden flex items-center justify-center group"
                    style={{
                      backgroundColor: "var(--accent-primary)",
                      border: "1px solid var(--accent-primary)",
                    }}
                  >
                    {project.image ? (
                      <>
                        <Image
                          src={project.image}
                          alt={`Screenshot of ${project.title}`}
                          fill
                          quality={85}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54eleVzU//Z"
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-300" style={{ background: "linear-gradient(to top, var(--background), transparent)" }} />
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="text-accent-primary/30 text-sm uppercase tracking-widest">
                          {project.category}
                        </div>
                        <div className="text-foreground-muted/50 text-xs mt-2">
                          {project.startDate} → {project.endDate}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Other Projects Grid */}
        {nonFeatured.length > 0 && (
          <div className="space-y-6">
            <h3
              className="text-2xl font-light text-accent-primary uppercase tracking-wide"
              style={{
                fontFamily: "var(--font-display)",
                fontVariant: "small-caps",
              }}
            >
              Other Projects
            </h3>

            <div className={`grid gap-6 ${
              config.layout.projectsGrid === "grid-3"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : config.layout.projectsGrid === "terminal"
                ? "grid-cols-1"
                : config.layout.projectsGrid === "centered"
                ? "grid-cols-1 max-w-2xl mx-auto"
                : config.layout.projectsGrid === "horizontal"
                ? "grid-cols-1 md:grid-flow-col md:auto-cols-[minmax(300px,1fr)] md:overflow-x-auto md:gap-4"
                : "grid-cols-1 md:grid-cols-2"
            }`}>
              {nonFeatured.map((project) => (
                <div
                  key={project.id}
                  className={`group relative border p-6 rounded-sm transition-all duration-300 ${smallHoverClass}`}
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--accent-secondary)",
                    }}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-sm">
                    <div
                      className="absolute inset-0 opacity-5 blur-lg"
                      style={{
                        background:
                          "linear-gradient(to right, transparent, var(--accent-secondary), transparent)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-accent-secondary text-xs uppercase tracking-widest">
                        {project.category}
                      </p>
                      {project.status === "recent" && (
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: "var(--accent-primary)",
                            color: "var(--accent-primary)",
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: "var(--accent-primary)" }}
                          />
                          Recently Updated
                        </span>
                      )}
                    </div>
                    <h4
                      className="text-xl font-light text-foreground mb-3"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {project.title}
                    </h4>
                    <p className="text-foreground-muted text-sm leading-relaxed mb-4">
                      {project.shortDescription}
                    </p>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech.name}
                          className="text-xs px-2 py-1 border rounded-sm text-accent-tertiary"
                          style={{ borderColor: "var(--accent-secondary)" }}
                        >
                          {tech.name}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="text-xs px-2 py-1 text-foreground-muted">
                          +{project.techStack.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Links */}
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-secondary hover:text-accent-primary transition-colors"
                        >
                          <Github size={18} />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-primary hover:text-accent-tertiary transition-colors"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
