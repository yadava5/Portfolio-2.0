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

  const hoverClass = prefersReducedMotion
    ? ""
    : "hover:translate-y-[-16px] hover:scale-[1.03]";
  const smallHoverClass = prefersReducedMotion
    ? ""
    : "hover:translate-y-[-12px] hover:scale-[1.03]";

  return (
    <section
      id="projects"
      className="bg-background relative px-4 py-24 md:px-8 md:py-32"
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
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 flex flex-col items-center">
          <div
            className="mb-6 h-px w-12"
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
            className={`text-foreground text-center text-5xl font-light md:text-6xl ${
              themeId === "paper-ink" || themeId === "editorial"
                ? "text-black"
                : ""
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            Featured Work
          </h2>
        </div>

        {/* Featured Projects */}
        {featured.length > 0 && (
          <div className="mb-16 space-y-12">
            {featured.map((project) => (
              <div
                key={project.id}
                className={`group relative overflow-hidden rounded-sm border transition-all duration-300 ${hoverClass}`}
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--accent-primary)",
                }}
              >
                {/* Glow effect on hover */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div
                    className="absolute inset-0 opacity-10 blur-lg"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, var(--accent-primary), transparent)",
                    }}
                  />
                </div>

                <div className="relative flex flex-col gap-8 p-8 md:flex-row md:p-10">
                  {/* Project info */}
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-accent-primary mb-3 text-xs tracking-widest uppercase">
                      Featured Project
                    </p>
                    <h3
                      className="text-foreground mb-4 text-3xl font-light md:text-4xl"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {project.title}
                    </h3>
                    <p className="text-foreground-muted md:text-foreground-muted mb-6 text-lg leading-relaxed">
                      {project.shortDescription}
                    </p>

                    {/* Tech stack */}
                    <div className="mb-6 flex flex-wrap gap-2">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech.name}
                          className="text-accent-tertiary rounded-sm border px-3 py-1 text-xs"
                          style={{ borderColor: "var(--accent-primary)" }}
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>

                    {/* Metrics */}
                    {project.metrics && project.metrics.length > 0 && (
                      <div
                        className="mb-6 flex flex-wrap gap-3 pb-6"
                        style={{
                          borderBottom: "1px solid var(--accent-primary)",
                        }}
                      >
                        {project.metrics.map((metric, idx) => (
                          <div key={idx} className="flex flex-col">
                            <span className="text-accent-secondary text-xs tracking-widest uppercase">
                              {metric.label}
                            </span>
                            <span className="text-foreground text-sm font-medium">
                              {metric.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex flex-wrap gap-4">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-secondary hover:bg-accent-secondary hover:text-background flex items-center gap-2 border px-4 py-2 text-xs tracking-widest uppercase transition-all duration-300"
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
                          className="border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-background flex items-center gap-2 border px-4 py-2 text-xs tracking-widest uppercase transition-all duration-300"
                        >
                          <ExternalLink size={16} />
                          View
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Project image */}
                  <div
                    className="group relative flex h-64 min-h-80 flex-1 items-center justify-center overflow-hidden rounded-sm md:h-auto"
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
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div
                          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-50"
                          style={{
                            background:
                              "linear-gradient(to top, var(--background), transparent)",
                          }}
                        />
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="text-accent-primary/30 text-sm tracking-widest uppercase">
                          {project.category}
                        </div>
                        <div className="text-foreground-muted/50 mt-2 text-xs">
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
              className="text-accent-primary text-2xl font-light tracking-wide uppercase"
              style={{
                fontFamily: "var(--font-display)",
                fontVariant: "small-caps",
              }}
            >
              Other Projects
            </h3>

            <div
              className={`grid gap-6 ${
                config.layout.projectsGrid === "grid-3"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : config.layout.projectsGrid === "terminal"
                    ? "grid-cols-1"
                    : config.layout.projectsGrid === "centered"
                      ? "mx-auto max-w-2xl grid-cols-1"
                      : config.layout.projectsGrid === "horizontal"
                        ? "grid-cols-1 md:auto-cols-[minmax(300px,1fr)] md:grid-flow-col md:gap-4 md:overflow-x-auto"
                        : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {nonFeatured.map((project) => (
                <div
                  key={project.id}
                  className={`group relative rounded-sm border p-6 transition-all duration-300 ${smallHoverClass}`}
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--accent-secondary)",
                  }}
                >
                  {/* Glow effect */}
                  <div className="pointer-events-none absolute inset-0 rounded-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div
                      className="absolute inset-0 opacity-5 blur-lg"
                      style={{
                        background:
                          "linear-gradient(to right, transparent, var(--accent-secondary), transparent)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <div className="mb-2 flex items-center gap-2">
                      <p className="text-accent-secondary text-xs tracking-widest uppercase">
                        {project.category}
                      </p>
                      {project.status === "recent" && (
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: "var(--accent-primary)",
                            color: "var(--accent-primary)",
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 animate-pulse rounded-full"
                            style={{ backgroundColor: "var(--accent-primary)" }}
                          />
                          Recently Updated
                        </span>
                      )}
                    </div>
                    <h4
                      className="text-foreground mb-3 text-xl font-light"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {project.title}
                    </h4>
                    <p className="text-foreground-muted mb-4 text-sm leading-relaxed">
                      {project.shortDescription}
                    </p>

                    {/* Tech stack */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech.name}
                          className="text-accent-tertiary rounded-sm border px-2 py-1 text-xs"
                          style={{ borderColor: "var(--accent-secondary)" }}
                        >
                          {tech.name}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="text-foreground-muted px-2 py-1 text-xs">
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
                          aria-label={`View ${project.title} source code on GitHub`}
                        >
                          <Github size={18} aria-hidden="true" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-primary hover:text-accent-tertiary transition-colors"
                          aria-label={`View ${project.title} live demo`}
                        >
                          <ExternalLink size={18} aria-hidden="true" />
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
