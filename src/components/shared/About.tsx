"use client";

import { personalInfo, education, awards } from "@/lib/data/personal";
import { Award } from "lucide-react";
interface AboutProps {
  themeId?: string;
}

export function About({ themeId = "dark-luxe" }: AboutProps) {
  const deansListCount = awards.filter((a) => a.name === "Dean's List").length;

  // DARK LUXE: Centered luxury card with gold border
  if (themeId === "dark-luxe") {
    return (
      <section
        id="about"
        className="bg-background relative min-h-screen px-4 py-24 md:px-8 md:py-32"
        data-theme={themeId}
        style={{
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
                  "linear-gradient(to right, transparent, var(--accent-primary), transparent)",
              }}
            />
            <h2
              className="text-foreground text-center text-5xl font-light md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              About
            </h2>
          </div>

          {/* Luxury card */}
          <div
            className="mb-12 rounded-sm border-2 p-12"
            style={{
              borderColor: "var(--accent-primary)",
              backgroundColor: "var(--card-bg)",
              boxShadow:
                "inset 0 0 20px rgba(232, 197, 71, 0.05), 0 0 30px rgba(232, 197, 71, 0.1)",
            }}
          >
            {/* Bio paragraphs */}
            <div className="mb-12">
              {personalInfo.bio.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-foreground-muted mb-6 text-lg leading-relaxed last:mb-0"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return (
                        <span
                          key={i}
                          style={{
                            color: "var(--accent-primary)",
                            fontWeight: 600,
                          }}
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

            {/* Education */}
            {education.length > 0 && (
              <div className="mb-12">
                <h3
                  className="text-accent-primary mb-6 text-xl font-light tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Education
                </h3>
                {education.map((edu, idx) => (
                  <div key={idx}>
                    <p className="text-foreground text-lg font-light">
                      {edu.degree} in {edu.field}
                    </p>
                    <p className="text-accent-secondary mb-2 text-base">
                      {edu.school}
                    </p>
                    <p className="text-foreground-muted text-sm">
                      {edu.startDate.split("-")[0]} —{" "}
                      {edu.endDate.split("-")[0]}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Stats grid in card */}
            <div
              className="grid grid-cols-3 gap-6 border-t pt-8"
              style={{ borderColor: "var(--accent-secondary)" }}
            >
              <div className="text-center">
                <div
                  className="mb-2 text-4xl font-light"
                  style={{ color: "var(--accent-primary)" }}
                >
                  {deansListCount}
                </div>
                <p className="text-foreground-muted text-xs tracking-widest uppercase">
                  Dean&apos;s List
                </p>
              </div>

              <div className="text-center">
                <div
                  className="mb-2 text-4xl font-light"
                  style={{ color: "var(--accent-primary)" }}
                >
                  3
                </div>
                <p className="text-foreground-muted text-xs tracking-widest uppercase">
                  Yrs Exp
                </p>
              </div>

              <div className="text-center">
                <div
                  className="mb-2 text-4xl font-light"
                  style={{ color: "var(--accent-primary)" }}
                >
                  8+
                </div>
                <p className="text-foreground-muted text-xs tracking-widest uppercase">
                  Projects
                </p>
              </div>
            </div>
          </div>

          {/* Awards */}
          {awards.length > 0 && (
            <div>
              <h3
                className="text-accent-primary mb-8 flex items-center gap-3 text-2xl font-light tracking-wide uppercase"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <Award size={24} />
                Awards & Honors
              </h3>
              <div className="space-y-4">
                {awards.map((award, idx) => (
                  <div
                    key={idx}
                    className="border-b pb-4 transition-all duration-300 last:border-b-0"
                    style={{ borderColor: "var(--accent-secondary)" }}
                  >
                    <p className="text-foreground font-medium">{award.name}</p>
                    <p className="text-foreground-muted text-sm">
                      {award.issuer} • {award.date.split("-")[0]}
                    </p>
                    <p className="text-foreground-muted mt-1 text-sm">
                      {award.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // PAPER & INK: Front page "Editor's Note" style
  if (themeId === "paper-ink") {
    return (
      <section
        id="about"
        className="relative min-h-screen px-4 py-24 md:px-8 md:py-32"
        data-theme={themeId}
        style={{ backgroundColor: "#f5f1de" }}
      >
        <div className="mx-auto max-w-6xl">
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
              ABOUT
            </h2>
            <div
              className="mt-4 h-1 w-32"
              style={{ backgroundColor: "#c00000" }}
            />
          </div>

          {/* Two-column layout */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Main bio column (left, 2 cols) */}
            <div className="space-y-6 md:col-span-2">
              {/* Editor's note label */}
              <p
                className="text-xs font-bold tracking-widest text-gray-600 uppercase"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Editor&apos;s Note
              </p>

              {/* Bio in newspaper columns */}
              <div className="grid gap-6 md:grid-cols-2">
                {personalInfo.bio.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className="text-justify text-base leading-relaxed text-gray-800"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return (
                          <span
                            key={i}
                            className="font-bold"
                            style={{ color: "#c00000" }}
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

              {/* Education section */}
              {education.length > 0 && (
                <div className="mt-8 border-t-4 border-black pt-8">
                  <h3
                    className="mb-4 text-2xl font-black text-black"
                    style={{
                      fontFamily: "var(--font-display)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Education
                  </h3>
                  {education.map((edu, idx) => (
                    <div key={idx}>
                      <p className="text-lg font-bold text-black">
                        {edu.degree} in {edu.field}
                      </p>
                      <p className="text-base font-semibold text-gray-700">
                        {edu.school}
                      </p>
                      <p className="text-sm text-gray-600">
                        {edu.startDate.split("-")[0]} —{" "}
                        {edu.endDate.split("-")[0]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar (right, 1 col) */}
            <div className="border-l-4 border-black pl-6 md:col-span-1">
              {/* By the Numbers */}
              <div>
                <p
                  className="mb-4 text-xs font-bold tracking-widest text-gray-600 uppercase"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  By the Numbers
                </p>

                <div className="space-y-6 border-b-2 border-black pb-6">
                  <div>
                    <p
                      className="text-4xl font-black text-black"
                      style={{ lineHeight: 1 }}
                    >
                      {deansListCount}
                    </p>
                    <p className="mt-2 text-xs font-bold tracking-widest text-gray-600 uppercase">
                      Dean&apos;s List
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-4xl font-black text-black"
                      style={{ lineHeight: 1 }}
                    >
                      3
                    </p>
                    <p className="mt-2 text-xs font-bold tracking-widest text-gray-600 uppercase">
                      Yrs Exp
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-4xl font-black text-black"
                      style={{ lineHeight: 1 }}
                    >
                      8+
                    </p>
                    <p className="mt-2 text-xs font-bold tracking-widest text-gray-600 uppercase">
                      Projects
                    </p>
                  </div>
                </div>

                {/* Awards */}
                {awards.length > 0 && (
                  <div className="mt-6">
                    <p
                      className="mb-4 text-xs font-bold tracking-widest text-gray-600 uppercase"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Honors
                    </p>
                    <div className="space-y-3">
                      {awards.slice(0, 3).map((award, idx) => (
                        <div
                          key={idx}
                          className="border-b border-gray-400 pb-3 last:border-b-0"
                        >
                          <p className="text-xs font-bold text-black">
                            {award.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {award.date.split("-")[0]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // EDITORIAL: Strict 2-column with drop cap
  if (themeId === "editorial") {
    return (
      <section
        id="about"
        className="relative min-h-screen px-4 py-24 md:px-8 md:py-32"
        data-theme={themeId}
        style={{ backgroundColor: "#fefefe" }}
      >
        <div className="mx-auto max-w-6xl">
          {/* Section header */}
          <div className="mb-16 border-l-8 border-black pl-8">
            <h2
              className="text-6xl font-light text-black md:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              About
            </h2>
          </div>

          {/* Two-column layout */}
          <div className="grid gap-12 md:grid-cols-2">
            {/* Left column - bio with drop cap */}
            <div className="border-r-2 border-black pr-8">
              {personalInfo.bio.map((paragraph, idx) => {
                const firstChar = paragraph[0];
                const restText = paragraph.slice(1);

                return (
                  <p
                    key={idx}
                    className="mb-6 text-lg leading-relaxed text-gray-700 last:mb-0"
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                    }}
                  >
                    {idx === 0 ? (
                      <>
                        <span
                          style={{
                            fontSize: "4rem",
                            fontWeight: 700,
                            lineHeight: "1",
                            float: "left",
                            marginRight: "0.5rem",
                            marginBottom: "0.2rem",
                            color: "#111111",
                          }}
                        >
                          {firstChar}
                        </span>
                        <span>
                          {restText.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                            if (part.startsWith("**") && part.endsWith("**")) {
                              return (
                                <span
                                  key={i}
                                  style={{
                                    color: "#d95555",
                                    fontWeight: 600,
                                  }}
                                >
                                  {part.slice(2, -2)}
                                </span>
                              );
                            }
                            return part;
                          })}
                        </span>
                      </>
                    ) : (
                      paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                          return (
                            <span
                              key={i}
                              style={{
                                color: "#d95555",
                                fontWeight: 600,
                              }}
                            >
                              {part.slice(2, -2)}
                            </span>
                          );
                        }
                        return part;
                      })
                    )}
                  </p>
                );
              })}

              {/* Education in left column */}
              {education.length > 0 && (
                <div className="mt-12 border-t-2 border-black pt-8">
                  <h3
                    className="mb-6 text-3xl font-bold text-black"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Education
                  </h3>
                  {education.map((edu, idx) => (
                    <div key={idx}>
                      <p className="text-lg font-semibold text-black">
                        {edu.degree}
                      </p>
                      <p className="text-base text-gray-700">{edu.field}</p>
                      <p className="text-sm text-gray-600">
                        {edu.school} • {edu.startDate.split("-")[0]} —{" "}
                        {edu.endDate.split("-")[0]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right column - stats and awards in geometric grid */}
            <div className="border-l-8 border-red-600 pl-8">
              {/* Stats grid */}
              <div className="mb-12 grid grid-cols-2 gap-8">
                <div>
                  <p
                    className="text-5xl font-black text-black"
                    style={{ lineHeight: 1 }}
                  >
                    {deansListCount}
                  </p>
                  <p className="mt-3 text-xs font-bold tracking-widest text-gray-600 uppercase">
                    Dean&apos;s List
                  </p>
                </div>

                <div>
                  <p
                    className="text-5xl font-black text-black"
                    style={{ lineHeight: 1 }}
                  >
                    3
                  </p>
                  <p className="mt-3 text-xs font-bold tracking-widest text-gray-600 uppercase">
                    Years Exp
                  </p>
                </div>

                <div className="col-span-2">
                  <p
                    className="text-5xl font-black text-black"
                    style={{ lineHeight: 1 }}
                  >
                    8+
                  </p>
                  <p className="mt-3 text-xs font-bold tracking-widest text-gray-600 uppercase">
                    Key Projects
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div
                className="my-8 h-px w-full"
                style={{ backgroundColor: "#d95555" }}
              />

              {/* Awards */}
              {awards.length > 0 && (
                <div>
                  <h3
                    className="mb-6 text-lg font-bold text-black uppercase"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Awards
                  </h3>
                  <div className="space-y-4">
                    {awards.map((award, idx) => (
                      <div
                        key={idx}
                        className="border-b border-gray-300 pb-4 last:border-b-0"
                      >
                        <p className="text-sm font-semibold text-black">
                          {award.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {award.issuer} • {award.date.split("-")[0]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // NOIR CINEMA: Film synopsis style
  if (themeId === "noir-cinema") {
    return (
      <section
        id="about"
        className="bg-background relative min-h-screen px-4 py-24 md:px-8 md:py-32"
        data-theme={themeId}
      >
        <div className="mx-auto max-w-3xl">
          {/* Section header */}
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
              ABOUT
            </h2>
          </div>

          {/* Movie synopsis style */}
          <div className="space-y-8 text-center">
            {/* Tagline */}
            <p
              className="text-foreground text-lg italic md:text-xl"
              style={{
                fontFamily: "var(--font-body)",
                letterSpacing: "0.05em",
              }}
            >
              {personalInfo.tagline}
            </p>

            {/* Bio as movie description */}
            <div
              className="space-y-4 border-t border-b py-8"
              style={{ borderColor: "var(--accent-secondary)" }}
            >
              {personalInfo.bio.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-foreground-muted text-base leading-relaxed"
                >
                  {paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return (
                        <span
                          key={i}
                          style={{
                            color: "var(--accent-primary)",
                            fontWeight: 600,
                          }}
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

            {/* Metadata block */}
            <div className="space-y-4 text-center">
              <div>
                <p
                  className="text-foreground text-xs font-bold tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Runtime
                </p>
                <p className="text-foreground-muted text-lg">
                  {education[0]?.startDate.split("-")[0]} —{" "}
                  {education[0]?.endDate.split("-")[0]}
                </p>
              </div>

              <div>
                <p
                  className="text-foreground text-xs font-bold tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Rating
                </p>
                <p
                  className="text-lg font-bold"
                  style={{ color: "var(--accent-primary)" }}
                >
                  {deansListCount}x Dean&apos;s List
                </p>
              </div>

              <div>
                <p
                  className="text-foreground text-xs font-bold tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Genre
                </p>
                <p className="text-foreground-muted text-lg">
                  {personalInfo.title}
                </p>
              </div>
            </div>

            {/* Education */}
            {education.length > 0 && (
              <div
                className="mt-12 border-t pt-8"
                style={{ borderColor: "var(--accent-secondary)" }}
              >
                <h3
                  className="text-foreground mb-4 text-xl font-bold tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Credits
                </h3>
                {education.map((edu, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-foreground font-semibold">
                      {edu.degree} in {edu.field}
                    </p>
                    <p className="text-foreground-muted">{edu.school}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Awards as "Featured In" */}
            {awards.length > 0 && (
              <div
                className="mt-12 border-t pt-8"
                style={{ borderColor: "var(--accent-secondary)" }}
              >
                <h3
                  className="text-foreground mb-4 text-lg font-bold tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Featured In
                </h3>
                <div className="space-y-2">
                  {awards.slice(0, 2).map((award, idx) => (
                    <p key={idx} className="text-foreground-muted text-sm">
                      {award.name} • {award.date.split("-")[0]}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // NEON CYBER: System info panel
  if (themeId === "neon-cyber") {
    return (
      <section
        id="about"
        className="bg-background relative min-h-screen px-4 py-24 md:px-8 md:py-32"
        data-theme={themeId}
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
              className="text-3xl font-black tracking-wider uppercase"
              style={{
                color: "var(--neon-green)",
                textShadow: "0 0 10px var(--neon-green)",
                fontFamily: "var(--font-display)",
              }}
            >
              &gt; system.about
            </h2>
          </div>

          {/* Main panel */}
          <div
            className="space-y-6 border p-6"
            style={{ borderColor: "var(--neon-green)", opacity: 0.8 }}
          >
            {/* Bio output */}
            <div
              style={{
                borderLeft: "3px solid var(--neon-green)",
                paddingLeft: "1rem",
              }}
            >
              <div style={{ color: "var(--neon-green)" }}>
                &gt; cat about.txt
              </div>
              <div
                style={{ color: "var(--foreground)" }}
                className="mt-3 space-y-2 text-sm"
              >
                {personalInfo.bio.map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                      if (part.startsWith("**") && part.endsWith("**")) {
                        return (
                          <span
                            key={i}
                            style={{
                              color: "var(--neon-green)",
                              fontWeight: "bold",
                            }}
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
            </div>

            {/* Divider */}
            <div
              style={{
                borderTop: "1px solid var(--neon-green)",
                opacity: 0.3,
              }}
            />

            {/* HUD stats */}
            <div
              style={{
                borderLeft: "3px solid var(--neon-green)",
                paddingLeft: "1rem",
              }}
            >
              <div style={{ color: "var(--neon-green)" }}>
                &gt; system.stats
              </div>

              <div className="mt-4 space-y-3 text-sm">
                {/* Dean's List stat */}
                <div>
                  <div
                    style={{
                      color: "var(--neon-green)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    deans_list_count: {deansListCount}
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: "rgba(0, 255, 136, 0.2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(deansListCount / 5) * 100}%`,
                        backgroundColor: "var(--neon-green)",
                      }}
                    />
                  </div>
                </div>

                {/* Years exp stat */}
                <div>
                  <div
                    style={{
                      color: "var(--neon-green)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    years_experience: 3
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: "rgba(0, 255, 136, 0.2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "60%",
                        backgroundColor: "var(--neon-green)",
                      }}
                    />
                  </div>
                </div>

                {/* Projects stat */}
                <div>
                  <div
                    style={{
                      color: "var(--neon-green)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    projects_completed: 8+
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: "rgba(0, 255, 136, 0.2)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "90%",
                        backgroundColor: "var(--neon-green)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                borderTop: "1px solid var(--neon-green)",
                opacity: 0.3,
              }}
            />

            {/* Education */}
            {education.length > 0 && (
              <div
                style={{
                  borderLeft: "3px solid var(--neon-green)",
                  paddingLeft: "1rem",
                }}
              >
                <div style={{ color: "var(--neon-green)" }}>
                  &gt; system.education
                </div>
                <div
                  style={{ color: "var(--foreground)" }}
                  className="mt-3 space-y-2 text-sm"
                >
                  {education.map((edu, idx) => (
                    <div key={idx}>
                      <p>degree: {edu.degree}</p>
                      <p>field: {edu.field}</p>
                      <p>school: {edu.school}</p>
                      <p>
                        period: {edu.startDate.split("-")[0]} -{" "}
                        {edu.endDate.split("-")[0]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div
              style={{
                borderTop: "1px solid var(--neon-green)",
                opacity: 0.3,
              }}
            />

            {/* Awards */}
            {awards.length > 0 && (
              <div
                style={{
                  borderLeft: "3px solid var(--neon-green)",
                  paddingLeft: "1rem",
                }}
              >
                <div style={{ color: "var(--neon-green)" }}>
                  &gt; system.awards
                </div>
                <div
                  style={{ color: "var(--foreground)" }}
                  className="mt-3 space-y-2 text-sm"
                >
                  {awards.map((award, idx) => (
                    <p key={idx}>
                      [{award.date.split("-")[0]}] {award.name} @ {award.issuer}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Terminal prompt */}
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
