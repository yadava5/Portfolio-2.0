"use client";

import { experiences, formatDateRange } from "@/lib/data/experience";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface ExperienceProps {
  themeId?: string;
}

export function Experience({ themeId = "dark-luxe" }: ExperienceProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const hoverClass = prefersReducedMotion ? "" : "hover:translate-y-[-5px]";

  // Base section styles
  const sectionStyle: React.CSSProperties = {
    backgroundColor:
      themeId === "paper-ink"
        ? "#f5f1de"
        : themeId === "editorial"
          ? "#fefefe"
          : undefined,
  };

  // DARK LUXE: Elegant timeline with gold accent dots and connecting lines
  if (themeId === "dark-luxe") {
    return (
      <section
        id="experience"
        className="bg-background relative px-4 py-24 md:px-8 md:py-32"
        data-theme={themeId}
        style={sectionStyle}
      >
        <div className="mx-auto max-w-4xl">
          {/* Section header */}
          <div className="mb-16 flex flex-col items-center">
            <div
              className="mb-6 h-px w-12"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--accent-primary), transparent)",
              }}
            />
            <h2
              className="text-foreground text-center text-5xl font-light md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Experience
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-1/2 h-full w-px -translate-x-1/2 transform"
              style={{
                background:
                  "linear-gradient(to bottom, var(--accent-primary), var(--accent-primary), transparent)",
              }}
            />

            {/* Experience entries */}
            <div className="space-y-12">
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id}
                  className={`flex ${
                    idx % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {/* Content side */}
                  <div className="w-1/2 px-8">
                    <div
                      className={`rounded-sm border p-6 transition-all duration-300 ${hoverClass}`}
                      style={{
                        backgroundColor: "var(--card-bg)",
                        borderColor: "var(--accent-secondary)",
                      }}
                    >
                      {/* Gold dot on timeline */}
                      <div
                        className="absolute top-8 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-full border-2"
                        style={{
                          backgroundColor: "var(--accent-primary)",
                          borderColor: "var(--background)",
                        }}
                      />

                      {/* Title and Company */}
                      <p className="text-accent-primary mb-2 text-sm tracking-widest uppercase">
                        {exp.company}
                      </p>
                      <h3
                        className="text-foreground mb-2 text-2xl font-light"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {exp.title}
                      </h3>

                      {/* Date range */}
                      <p className="text-foreground-muted mb-4 text-sm">
                        {formatDateRange(exp.startDate, exp.endDate)}
                      </p>

                      {/* Description */}
                      <div className="mb-4 space-y-2">
                        {exp.description.map((desc, i) => (
                          <p
                            key={i}
                            className="text-foreground-muted text-sm leading-relaxed"
                          >
                            • {desc}
                          </p>
                        ))}
                      </div>

                      {/* Skills pills */}
                      <div className="flex flex-wrap gap-2">
                        {exp.skills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="text-accent-tertiary rounded-sm border px-2 py-1 text-xs"
                            style={{ borderColor: "var(--accent-primary)" }}
                          >
                            {skill}
                          </span>
                        ))}
                        {exp.skills.length > 5 && (
                          <span className="text-foreground-muted px-2 py-1 text-xs">
                            +{exp.skills.length - 5} more
                          </span>
                        )}
                      </div>

                      {/* Achievements */}
                      {exp.achievements.length > 0 && (
                        <div
                          className="mt-4 pt-4"
                          style={{
                            borderTop: "1px solid var(--accent-secondary)",
                          }}
                        >
                          <p className="text-accent-secondary mb-2 text-xs tracking-widest uppercase">
                            Key Achievements
                          </p>
                          <ul className="space-y-1">
                            {exp.achievements
                              .slice(0, 2)
                              .map((achievement, i) => (
                                <li
                                  key={i}
                                  className="text-foreground-muted flex items-start gap-2 text-xs"
                                >
                                  <span className="text-accent-primary mt-1">
                                    ✦
                                  </span>
                                  <span>{achievement}</span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Empty side for alternating layout */}
                  <div className="w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // PAPER & INK: Newspaper column layout
  if (themeId === "paper-ink") {
    return (
      <section
        id="experience"
        className="relative px-4 py-24 md:px-8 md:py-32"
        data-theme={themeId}
        style={sectionStyle}
      >
        <div className="mx-auto max-w-5xl">
          {/* Section header */}
          <div className="mb-16">
            <div
              className="mb-4 h-1 w-20"
              style={{ backgroundColor: "#c00000" }}
            />
            <h2
              className="text-5xl font-black text-black md:text-6xl"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              EXPERIENCE
            </h2>
            <div
              className="mt-4 h-1 w-32"
              style={{ backgroundColor: "#c00000" }}
            />
          </div>

          {/* Newspaper columns */}
          <div className="space-y-12">
            {experiences.map((exp) => (
              <article key={exp.id} className="border-b-4 border-black pb-8">
                {/* Job title as headline */}
                <h3
                  className="text-4xl font-black text-black md:text-5xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {exp.title}
                </h3>

                {/* Company and dates */}
                <p
                  className="mt-3 text-lg font-bold text-black"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {exp.company} • {formatDateRange(exp.startDate, exp.endDate)}
                </p>

                {/* Two-column layout for description */}
                <div className="mt-6 grid gap-8 md:grid-cols-2">
                  {/* Left column */}
                  <div>
                    {exp.description.slice(0, 2).map((desc, i) => (
                      <p
                        key={i}
                        className="mb-4 text-justify text-base leading-relaxed text-gray-800"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {desc}
                      </p>
                    ))}
                  </div>

                  {/* Right column */}
                  <div>
                    {exp.description.slice(2).map((desc, i) => (
                      <p
                        key={i}
                        className="mb-4 text-justify text-base leading-relaxed text-gray-800"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {desc}
                      </p>
                    ))}

                    {/* Skills as footer */}
                    <div
                      className="mt-4 pt-4"
                      style={{ borderTop: "2px solid #c00000" }}
                    >
                      <p className="mb-2 text-xs font-bold tracking-widest text-black uppercase">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {exp.skills.slice(0, 8).map((skill) => (
                          <span
                            key={skill}
                            className="text-xs font-semibold text-gray-700"
                          >
                            {skill}
                            {exp.skills.indexOf(skill) <
                              exp.skills.slice(0, 8).length - 1 && " •"}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements as sidebar */}
                {exp.achievements.length > 0 && (
                  <div className="mt-6 border-l-4 border-black py-4 pl-6">
                    <p className="mb-3 text-sm font-bold tracking-widest text-black uppercase">
                      Key Achievements
                    </p>
                    <ul className="space-y-2">
                      {exp.achievements.slice(0, 3).map((achievement, i) => (
                        <li key={i} className="text-sm text-gray-700">
                          — {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // EDITORIAL (Swiss Brutalism): Clean grid with thick left border
  if (themeId === "editorial") {
    return (
      <section
        id="experience"
        className="relative px-4 py-24 md:px-8 md:py-32"
        data-theme={themeId}
        style={sectionStyle}
      >
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <div className="mb-16 border-l-8 border-black pl-8">
            <h2
              className="text-6xl font-light text-black md:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Experience
            </h2>
          </div>

          {/* Experience entries in grid */}
          <div className="space-y-12">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="grid gap-8 border-l-8 border-black pl-8 md:grid-cols-4"
              >
                {/* Date (oversized, bold on left) */}
                <div className="md:col-span-1">
                  <div
                    className="text-5xl font-black text-black md:text-6xl"
                    style={{ lineHeight: 1 }}
                  >
                    {formatDateRange(exp.startDate, exp.endDate)
                      .split(" - ")[0]
                      .split(" ")
                      .map((part) => part.slice(0, 3))
                      .join(" ")}
                  </div>
                  <p className="mt-2 text-xs font-bold tracking-widest text-gray-600 uppercase">
                    {exp.type}
                  </p>
                </div>

                {/* Content on right */}
                <div className="md:col-span-3">
                  {/* Title and company */}
                  <h3
                    className="text-3xl font-bold text-black"
                    style={{
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {exp.title}
                  </h3>
                  <p className="mt-1 text-lg font-semibold text-gray-700">
                    {exp.company}
                  </p>

                  {/* Divider */}
                  <div
                    className="my-4 h-px w-12"
                    style={{ backgroundColor: "#d95555" }}
                  />

                  {/* Description */}
                  <div className="space-y-3">
                    {exp.description.map((desc, i) => (
                      <p
                        key={i}
                        className="text-base leading-relaxed text-gray-700"
                      >
                        {desc}
                      </p>
                    ))}
                  </div>

                  {/* Skills grid */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {exp.skills.slice(0, 6).map((skill) => (
                      <span
                        key={skill}
                        className="border border-black px-3 py-1 text-xs font-semibold text-black"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Achievements highlight (red accent on current role) */}
                  {exp.endDate === "Present" && exp.achievements.length > 0 && (
                    <div
                      className="mt-6 border-l-4 py-4 pl-4"
                      style={{ borderColor: "#d95555" }}
                    >
                      <p className="mb-2 text-xs font-bold tracking-widest text-gray-700 uppercase">
                        Currently
                      </p>
                      <p className="text-sm font-semibold text-black">
                        {exp.achievements[0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // NOIR CINEMA: Screenplay format
  if (themeId === "noir-cinema") {
    return (
      <section
        id="experience"
        className="bg-background relative px-4 py-24 md:px-8 md:py-32"
        data-theme={themeId}
        style={sectionStyle}
      >
        <div className="mx-auto max-w-3xl">
          {/* Section header - cinema style */}
          <div className="mb-16 flex flex-col items-center">
            <div
              className="mb-6 h-px w-24"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--accent-primary), transparent)",
              }}
            />
            <h2
              className="text-foreground text-center text-5xl font-light tracking-widest md:text-6xl"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "0.1em",
              }}
            >
              EXPERIENCE
            </h2>
          </div>

          {/* Screenplay format entries */}
          <div className="space-y-16">
            {experiences.map((exp) => (
              <div key={exp.id} className="space-y-4 font-mono text-sm">
                {/* Centered role title in ALL CAPS */}
                <div className="text-center">
                  <p
                    className="text-foreground text-lg font-bold tracking-wider"
                    style={{
                      fontFamily: "var(--font-display)",
                      letterSpacing: "0.15em",
                    }}
                  >
                    {exp.title.toUpperCase()}
                  </p>
                </div>

                {/* Company as SCENE: */}
                <p className="text-foreground text-center text-sm font-bold tracking-wider">
                  SCENE: {exp.company}
                </p>

                {/* Date range and location */}
                <p className="text-foreground-muted text-center text-xs tracking-widest uppercase">
                  {formatDateRange(exp.startDate, exp.endDate)} • {exp.location}
                </p>

                {/* Descriptions as stage directions (italic) */}
                <div className="space-y-3 italic">
                  {exp.description.map((desc, i) => (
                    <p
                      key={i}
                      className="text-foreground-muted text-center text-sm leading-relaxed"
                    >
                      ({desc})
                    </p>
                  ))}
                </div>

                {/* Skills as technical specs */}
                <div className="text-center">
                  <p className="text-foreground-muted text-xs tracking-widest uppercase">
                    Technical Palette: {exp.skills.slice(0, 5).join(" • ")}
                  </p>
                </div>

                {/* Achievements as credits */}
                {exp.achievements.length > 0 && (
                  <div className="text-center">
                    <p className="text-foreground mb-2 text-xs font-bold tracking-widest uppercase">
                      Key Frames
                    </p>
                    <div className="space-y-1">
                      {exp.achievements.slice(0, 2).map((achievement, i) => (
                        <p
                          key={i}
                          className="text-foreground-muted text-xs italic"
                        >
                          ▪ {achievement}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="flex justify-center">
                  <div
                    className="h-px w-8"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, var(--accent-primary), transparent)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // NEON CYBER: Terminal log output
  if (themeId === "neon-cyber") {
    return (
      <section
        id="experience"
        className="bg-background relative px-4 py-24 md:px-8 md:py-32"
        data-theme={themeId}
        style={sectionStyle}
      >
        <div className="mx-auto max-w-4xl font-mono">
          {/* Section header */}
          <div className="border-opacity-30 mb-16 border-t border-b py-4">
            <div
              className="mb-4 h-px w-12"
              style={{
                background:
                  "linear-gradient(to right, transparent, var(--neon-green), transparent)",
              }}
            />
            <h2
              className="text-4xl font-black tracking-wider uppercase"
              style={{
                color: "var(--neon-green)",
                textShadow: "0 0 10px var(--neon-green)",
                fontFamily: "var(--font-display)",
              }}
            >
              &gt; system.experience
            </h2>
          </div>

          {/* Terminal log entries */}
          <div
            className="border-opacity-30 space-y-8 border p-6"
            style={{ borderColor: "var(--neon-green)" }}
          >
            {experiences.map((exp, idx) => (
              <div
                key={exp.id}
                className="space-y-2"
                style={{
                  borderLeft: "3px solid var(--neon-green)",
                  paddingLeft: "1rem",
                  opacity: idx === 0 ? 1 : 0.85,
                }}
              >
                {/* Entry marker and date */}
                <div className="text-sm" style={{ color: "var(--neon-green)" }}>
                  {`[${formatDateRange(exp.startDate, exp.endDate).split(" - ")[0].toUpperCase()}]`}
                </div>

                {/* Command prompt */}
                <div className="text-sm">
                  <span style={{ color: "var(--neon-green)" }}>&gt;</span>
                  <span
                    style={{ color: "var(--neon-green)" }}
                    className="ml-2 font-bold"
                  >
                    {exp.title.toUpperCase()}
                  </span>
                  <span
                    style={{ color: "var(--foreground-muted)" }}
                    className="ml-2"
                  >
                    @ {exp.company}
                  </span>
                </div>

                {/* Output lines */}
                {exp.description.slice(0, 2).map((desc, i) => (
                  <div key={i} className="text-xs leading-relaxed">
                    <span style={{ color: "var(--neon-green)" }}>&gt;</span>
                    <span
                      style={{ color: "var(--foreground)" }}
                      className="ml-2"
                    >
                      {desc.substring(0, 80)}
                      {desc.length > 80 ? "..." : ""}
                    </span>
                  </div>
                ))}

                {/* Skills display */}
                <div className="mt-2 text-xs">
                  <span style={{ color: "var(--foreground-muted)" }}>
                    [LOADED] {exp.skills.slice(0, 4).join(" | ")}
                  </span>
                </div>

                {/* Status bar */}
                <div
                  className="text-xs"
                  style={{
                    borderBottom: "1px solid var(--neon-green)",
                    paddingBottom: "0.5rem",
                    opacity: 0.5,
                  }}
                >
                  {exp.endDate === "Present" ? (
                    <span style={{ color: "var(--neon-green)" }}>✓ ACTIVE</span>
                  ) : (
                    <span style={{ color: "var(--foreground-muted)" }}>
                      ✓ COMPLETED
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Terminal prompt at end */}
            <div className="text-sm" style={{ color: "var(--neon-green)" }}>
              &gt; _
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Fallback
  return null;
}
