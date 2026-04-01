"use client";

import { experiences, formatDateRange } from "@/lib/data/experience";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface ExperienceProps {
  themeId?: string;
}

export function Experience({ themeId = "dark-luxe" }: ExperienceProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const hoverClass = prefersReducedMotion ? "" : "hover:translate-y-[-5px]";

  return (
    <section
      id="experience"
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
      <div className="mx-auto max-w-4xl">
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
                className={`flex ${idx % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
              >
                {/* Content side */}
                <div className="w-1/2 px-8">
                  <div
                    className={`rounded-sm border p-6 transition-all duration-300 ${hoverClass}`}
                    style={
                      {
                        backgroundColor: "var(--card-bg)",
                        borderColor: "var(--accent-secondary)",
                      } as React.CSSProperties & { borderOpacity?: number }
                    }
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
