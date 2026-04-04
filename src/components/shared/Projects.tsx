"use client";

import Image from "next/image";
import { getFeaturedProjects, getPublicProjects } from "@/lib/data/projects";
import { ExternalLink, Github } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface ProjectsProps {
  themeId?: string;
}

export function Projects({ themeId = "dark-luxe" }: ProjectsProps) {
  const featured = getFeaturedProjects();
  const nonFeatured = getPublicProjects().filter((p) => !p.featured);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Theme-specific section backgrounds
  const sectionBg =
    themeId === "paper-ink"
      ? "#f5f1de"
      : themeId === "editorial"
        ? "#fefefe"
        : undefined;

  // Render different layouts based on theme
  const renderThemeLayout = () => {
    switch (themeId) {
      case "dark-luxe":
        return renderDarkLuxe();
      case "paper-ink":
        return renderPaperInk();
      case "editorial":
        return renderEditorial();
      case "noir-cinema":
        return renderNoirCinema();
      case "neon-cyber":
        return renderNeonCyber();
      default:
        return renderDarkLuxe();
    }
  };

  // DARK LUXE: Elegant 2-column grid with hover glow effects
  const renderDarkLuxe = () => {
    const hoverClass = prefersReducedMotion
      ? ""
      : "hover:translate-y-[-16px] hover:scale-[1.03]";

    return (
      <div>
        {/* Featured projects */}
        {featured.length > 0 && (
          <div className="mb-16 space-y-12">
            {featured.map((project) => (
              <div
                key={project.id}
                className={`group relative overflow-hidden border transition-all duration-300 ${hoverClass}`}
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--accent-primary)",
                  borderWidth: "2px",
                }}
              >
                {/* Glow effect on hover */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div
                    className="absolute inset-0 opacity-10 blur-xl"
                    style={{
                      background:
                        "radial-gradient(circle, var(--accent-primary), transparent)",
                    }}
                  />
                </div>

                <div className="relative flex flex-col gap-8 p-8 md:flex-row md:p-12">
                  {/* Project info */}
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-accent-primary mb-4 text-xs tracking-widest uppercase">
                      Featured Project
                    </p>
                    <h3
                      className="text-foreground mb-4 text-4xl font-light md:text-5xl"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {project.title}
                    </h3>
                    <p className="text-foreground-muted mb-6 text-lg leading-relaxed">
                      {project.shortDescription}
                    </p>

                    {/* Tech stack */}
                    <div className="mb-6 flex flex-wrap gap-3">
                      {project.techStack.map((tech) => (
                        <span
                          key={tech.name}
                          className="text-accent-tertiary border px-3 py-2 text-xs font-light"
                          style={{
                            borderColor: "var(--accent-primary)",
                            borderWidth: "1px",
                          }}
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>

                    {/* Metrics */}
                    {project.metrics && project.metrics.length > 0 && (
                      <div
                        className="mb-6 flex flex-wrap gap-6 pb-6"
                        style={{
                          borderBottom: "2px solid var(--accent-primary)",
                        }}
                      >
                        {project.metrics.map((metric, idx) => (
                          <div key={idx} className="flex flex-col">
                            <span className="text-accent-secondary text-xs tracking-widest uppercase">
                              {metric.label}
                            </span>
                            <span className="text-foreground text-sm font-light">
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
                    className="group relative flex h-64 min-h-80 flex-1 items-center justify-center overflow-hidden md:h-auto"
                    style={{
                      backgroundColor: "var(--accent-primary)",
                      border: "2px solid var(--accent-primary)",
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

        {/* Other Projects Grid - 2 columns */}
        {nonFeatured.length > 0 && (
          <div className="space-y-6">
            <h3
              className="text-accent-primary text-2xl font-light tracking-wide uppercase"
              style={{
                fontFamily: "var(--font-display)",
              }}
            >
              Other Projects
            </h3>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {nonFeatured.map((project) => (
                <div
                  key={project.id}
                  className="group relative border p-6 transition-all duration-300 hover:translate-y-[-8px]"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--accent-primary)",
                    borderWidth: "1px",
                  }}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-75">
                    <div
                      className="absolute inset-0 opacity-5 blur-lg"
                      style={{
                        background:
                          "radial-gradient(circle, var(--accent-primary), transparent)",
                      }}
                    />
                  </div>

                  <div className="relative">
                    <div className="mb-3 flex items-center gap-2">
                      <p className="text-accent-secondary text-xs tracking-widest uppercase">
                        {project.category}
                      </p>
                      {project.status === "recent" && (
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-light"
                          style={{
                            color: "var(--accent-primary)",
                          }}
                        >
                          ● Recently Updated
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
                          className="text-accent-tertiary border px-2 py-1 text-xs font-light"
                          style={{ borderColor: "var(--accent-primary)" }}
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
    );
  };

  // PAPER & INK: Newspaper article layout
  const renderPaperInk = () => {
    return (
      <div>
        {/* Featured as newspaper stories */}
        {featured.length > 0 && (
          <div className="mb-16 space-y-12">
            {featured.map((project) => (
              <div key={project.id} className="border-b-4 border-current pb-8">
                <div className="columns-2 gap-8">
                  {/* Headline */}
                  <h3
                    className="text-foreground col-span-full mb-4 text-4xl leading-tight font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {project.title}
                  </h3>

                  {/* Byline and date */}
                  <p
                    className="text-foreground-muted col-span-full mb-6 text-sm italic"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {project.category} • {project.startDate}
                  </p>

                  {/* Body text in columns */}
                  <p
                    className="text-foreground-muted col-span-full text-sm leading-relaxed"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {project.shortDescription}
                  </p>

                  {/* Tech stack as tags */}
                  <div className="col-span-full mt-4 flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech.name}
                        className="text-foreground-muted text-xs font-bold uppercase"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        [{tech.name}]
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="col-span-full mt-4 flex gap-4">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-primary text-xs tracking-widest uppercase hover:underline"
                      >
                        GitHub
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-primary text-xs tracking-widest uppercase hover:underline"
                      >
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Other projects as condensed articles */}
        {nonFeatured.length > 0 && (
          <div className="space-y-8">
            <h3
              className="text-foreground text-2xl font-bold uppercase"
              style={{ fontFamily: "var(--font-display)" }}
            >
              More Projects
            </h3>

            <div className="columns-3 gap-8">
              {nonFeatured.map((project) => (
                <div
                  key={project.id}
                  className="mb-8 break-inside-avoid border-b border-current/30 pb-6"
                >
                  <h4
                    className="text-foreground mb-2 text-lg font-bold"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {project.title}
                  </h4>
                  <p
                    className="text-foreground-muted mb-3 text-xs leading-relaxed"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {project.shortDescription}
                  </p>
                  <div className="flex gap-2">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-primary text-xs hover:underline"
                      >
                        Code
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-primary text-xs hover:underline"
                      >
                        Live
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // EDITORIAL: Strict 3-column grid with NO gaps, thick borders, geometric precision
  const renderEditorial = () => {
    const allProjects = [...featured, ...nonFeatured];

    return (
      <div>
        <h3
          className="text-foreground mb-12 text-3xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          All Projects
        </h3>

        {/* Strict grid with NO gaps */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0",
            border: "4px solid #111111",
          }}
        >
          {allProjects.map((project, idx) => (
            <div
              key={project.id}
              className="hover:bg-accent-primary hover:text-background group relative flex flex-col items-center justify-center p-8 transition-all duration-200"
              style={{
                aspectRatio: "1 / 1",
                backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f4f4f4",
                borderRight: idx % 3 !== 2 ? "4px solid #111111" : "none",
                borderBottom:
                  idx < allProjects.length - 3 ? "4px solid #111111" : "none",
              }}
            >
              {/* Project number - large and bold */}
              <div className="text-accent-secondary mb-4 text-6xl font-black">
                {String(idx + 1).padStart(2, "0")}
              </div>

              {/* Project title */}
              <h4
                className="group-hover:text-background mb-4 text-center text-lg leading-tight font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {project.title}
              </h4>

              {/* Category */}
              <p className="text-foreground-muted group-hover:text-background/70 text-center text-xs tracking-widest uppercase">
                {project.category}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // NOIR CINEMA: Film strip / credits style, single-column centered
  const renderNoirCinema = () => {
    return (
      <div className="mx-auto max-w-2xl">
        {/* Featured as movie posters */}
        {featured.length > 0 && (
          <div className="mb-16 space-y-20">
            {featured.map((project) => (
              <div key={project.id} className="relative">
                {/* Art Deco divider */}
                <div className="mb-12 flex items-center justify-center gap-4">
                  <div
                    className="h-px flex-1"
                    style={{ backgroundColor: "var(--accent-primary)" }}
                  />
                  <div
                    className="text-accent-primary"
                    style={{
                      fontSize: "20px",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    ✦
                  </div>
                  <div
                    className="h-px flex-1"
                    style={{ backgroundColor: "var(--accent-primary)" }}
                  />
                </div>

                {/* Project as credit block */}
                <div className="text-center">
                  <p className="text-accent-secondary mb-3 text-xs tracking-widest uppercase">
                    [Featured Work]
                  </p>
                  <h3
                    className="text-foreground mb-6 text-4xl font-light tracking-wide"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {project.title}
                  </h3>
                  <p className="text-foreground-muted mx-auto mb-6 max-w-xl text-sm leading-relaxed">
                    {project.shortDescription}
                  </p>

                  {/* Tech as credits */}
                  <div className="mb-6 flex flex-wrap justify-center gap-3">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech.name}
                        className="text-foreground-muted text-xs"
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex justify-center gap-6">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-primary hover:text-accent-secondary text-xs tracking-widest uppercase transition-colors"
                      >
                        [Code]
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-primary hover:text-accent-secondary text-xs tracking-widest uppercase transition-colors"
                      >
                        [View]
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Other projects as credits roll */}
        {nonFeatured.length > 0 && (
          <div className="space-y-8">
            <div
              className="h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--accent-primary), transparent)",
              }}
            />
            <h3
              className="text-foreground text-center text-2xl font-light tracking-wide uppercase"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Also Featuring
            </h3>
            <div
              className="h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--accent-primary), transparent)",
              }}
            />

            <div className="space-y-12">
              {nonFeatured.map((project) => (
                <div key={project.id} className="text-center">
                  <h4
                    className="text-foreground mb-2 text-xl font-light"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {project.title}
                  </h4>
                  <p className="text-foreground-muted text-xs">
                    {project.category}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // NEON CYBER: Terminal output style
  const renderNeonCyber = () => {
    const allProjects = [...featured, ...nonFeatured];

    return (
      <div
        className="font-mono"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--accent-primary)",
        }}
      >
        {/* Terminal header */}
        <div
          className="mb-12 border p-4"
          style={{
            borderColor: "var(--accent-primary)",
            borderWidth: "2px",
            backgroundColor: "var(--card-bg)",
          }}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-accent-secondary">⬤</span>
            <span className="text-accent-tertiary">⬤</span>
            <span className="text-accent-primary">⬤</span>
          </div>
          <div className="text-sm">
            <span className="text-accent-primary">$ </span>
            <span className="text-foreground">ls -la projects/</span>
          </div>
        </div>

        {/* Projects as terminal output */}
        <div className="space-y-0">
          {allProjects.map((project, idx) => (
            <div
              key={project.id}
              className="hover:bg-accent-primary/10 border p-6 transition-all duration-200"
              style={{
                borderColor: "var(--accent-primary)",
                borderWidth: "1px",
                borderTopWidth: idx === 0 ? "2px" : "1px",
              }}
            >
              {/* Command prompt */}
              <div className="mb-4 text-sm">
                <span className="text-accent-primary">$ </span>
                <span className="text-foreground">cat {project.id}.info</span>
              </div>

              {/* Output */}
              <div className="ml-4 space-y-2 text-sm">
                <div>
                  <span className="text-accent-secondary">title: </span>
                  <span className="text-foreground">{project.title}</span>
                </div>
                <div>
                  <span className="text-accent-secondary">desc: </span>
                  <span className="text-foreground-muted">
                    {project.shortDescription}
                  </span>
                </div>
                <div>
                  <span className="text-accent-secondary">stack: </span>
                  <span className="text-accent-tertiary">
                    {project.techStack.map((t) => t.name).join(", ")}
                  </span>
                </div>
                <div className="flex gap-4 pt-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:text-accent-tertiary text-xs transition-colors"
                    >
                      [github]
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-primary hover:text-accent-tertiary text-xs transition-colors"
                    >
                      [live]
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Terminal footer */}
        <div
          className="mt-8 border p-4"
          style={{
            borderColor: "var(--accent-primary)",
            borderWidth: "2px",
            backgroundColor: "var(--card-bg)",
          }}
        >
          <div className="text-sm">
            <span className="text-accent-primary">$ </span>
            <span className="text-foreground">
              [{allProjects.length} projects loaded]
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="projects"
      className="bg-background relative px-4 py-24 md:px-8 md:py-32"
      data-theme={themeId}
      style={{ backgroundColor: sectionBg }}
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
                    ? "linear-gradient(to right, transparent, var(--accent-primary), transparent)"
                    : themeId === "paper-ink"
                      ? "solid black"
                      : themeId === "editorial"
                        ? "solid black"
                        : undefined,
            }}
          />
          <h2
            className={`text-foreground text-center text-5xl font-light md:text-6xl ${
              themeId === "paper-ink" || themeId === "editorial"
                ? "font-bold text-black"
                : ""
            }`}
            style={{
              fontFamily:
                themeId === "neon-cyber"
                  ? "var(--font-mono)"
                  : "var(--font-display)",
            }}
          >
            {themeId === "editorial" ? "Projects" : "Featured Work"}
          </h2>
        </div>

        {/* Render theme-specific layout */}
        {renderThemeLayout()}
      </div>
    </section>
  );
}
