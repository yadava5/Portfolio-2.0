"use client";

import { personalInfo, education, awards } from "@/lib/data/personal";
import { Award, MapPin } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface AboutProps {
  themeId?: string;
}

export function About({ themeId = "dark-luxe" }: AboutProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const deansListCount = awards.filter(
    (a) => a.name === "Dean&apos;s List"
  ).length;

  const itemClass = prefersReducedMotion ? "" : "hover:translate-y-[-8px]";

  return (
    <section
      id="about"
      className="bg-background relative min-h-screen px-4 py-24 md:px-8 md:py-32"
      data-theme={themeId}
      style={{
        backgroundColor:
          themeId === "paper-ink"
            ? "#f5f1de"
            : themeId === "editorial"
              ? "#fefefe"
              : undefined,
        contain: "layout style paint",
        contentVisibility: "auto",
        containIntrinsicSize: "100vh",
      }}
    >
      <div className="mx-auto max-w-3xl">
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
            className={`text-foreground mb-4 text-center text-5xl font-light md:text-6xl ${
              themeId === "paper-ink" || themeId === "editorial"
                ? "text-black"
                : ""
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            About
          </h2>
        </div>

        {/* Bio paragraphs */}
        <div className="mb-12">
          {personalInfo.bio.map((paragraph, idx) => (
            <p
              key={idx}
              className={`text-foreground-muted mb-6 text-lg leading-relaxed last:mb-0 ${
                themeId === "paper-ink" ? "text-gray-700" : ""
              } ${themeId === "editorial" ? "text-gray-600" : ""}`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              {paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <span
                      key={i}
                      className="text-accent-primary font-semibold"
                      style={
                        themeId === "editorial"
                          ? { color: "var(--accent-primary)", fontWeight: 600 }
                          : themeId === "paper-ink"
                            ? { color: "#c00000", fontWeight: 600 }
                            : {}
                      }
                    >
                      {part.slice(2, -2)}
                    </span>
                  );
                }
                return part;
              })}
            </p>
          ))}
        </div>

        {/* Education Credentials Card */}
        {education.length > 0 && (
          <div
            className={`mb-12 rounded-sm border p-8 transition-all duration-300 ${itemClass}`}
            style={{
              borderColor: "var(--accent-secondary)",
              backgroundColor:
                themeId === "paper-ink"
                  ? "white"
                  : themeId === "editorial"
                    ? "#ffffff"
                    : "var(--card-bg)",
              opacity: 0.5,
            }}
          >
            <h3
              className="text-accent-primary mb-4 text-2xl font-light tracking-wide uppercase"
              style={{
                fontFamily: "var(--font-display)",
                fontVariant: "small-caps",
              }}
            >
              Education
            </h3>
            {education.map((edu, idx) => (
              <div key={idx} className="mb-6 last:mb-0">
                <p className="text-foreground mb-2 text-lg">
                  {edu.degree} in {edu.field}
                </p>
                <p className="text-accent-secondary mb-4 flex items-center gap-2 text-base">
                  <MapPin size={16} />
                  {edu.school}
                </p>
                <p className="text-foreground-muted text-sm">
                  {edu.startDate.split("-")[0]} — {edu.endDate.split("-")[0]}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-3">
          <div
            className={`border-b pb-6 text-center transition-all duration-300 ${itemClass}`}
          >
            <div
              className="mb-2 text-4xl font-light md:text-5xl"
              style={{ color: "var(--accent-primary)" }}
            >
              {deansListCount}
            </div>
            <p className="text-foreground-muted text-sm tracking-widest uppercase">
              Dean&apos;s List
            </p>
          </div>

          <div
            className={`border-b pb-6 text-center transition-all duration-300 ${itemClass}`}
          >
            <div
              className="mb-2 text-4xl font-light md:text-5xl"
              style={{ color: "var(--accent-primary)" }}
            >
              3
            </div>
            <p className="text-foreground-muted text-sm tracking-widest uppercase">
              Years Experience
            </p>
          </div>

          <div
            className={`border-b pb-6 text-center transition-all duration-300 ${itemClass}`}
          >
            <div
              className="mb-2 text-4xl font-light md:text-5xl"
              style={{ color: "var(--accent-primary)" }}
            >
              8+
            </div>
            <p className="text-foreground-muted text-sm tracking-widest uppercase">
              Key Projects
            </p>
          </div>
        </div>

        {/* Awards */}
        {awards.length > 0 && (
          <div
            className="pt-8"
            style={{ borderTop: "1px solid var(--accent-secondary)" }}
          >
            <h3
              className="text-accent-primary mb-6 flex items-center gap-3 text-2xl font-light tracking-wide uppercase"
              style={{
                fontFamily: "var(--font-display)",
                fontVariant: "small-caps",
              }}
            >
              <Award size={24} className="text-accent-primary" />
              Awards & Honors
            </h3>
            <div className="space-y-4">
              {awards.map((award, idx) => (
                <div
                  key={idx}
                  className="border-accent-secondary/10 flex items-start gap-4 border-b pb-4 transition-all duration-300 last:border-b-0 hover:translate-x-1"
                >
                  <div
                    className="mt-2 h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: "var(--accent-primary)" }}
                  />
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{award.name}</p>
                    <p className="text-foreground-muted text-sm">
                      {award.issuer} • {award.date.split("-")[0]}
                    </p>
                    <p className="text-foreground-muted mt-1 text-sm">
                      {award.description}
                    </p>
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
