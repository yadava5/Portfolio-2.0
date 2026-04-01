"use client";

import { skillCategories } from "@/lib/data/skills";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface SkillsProps {
  themeId?: string;
}

export function Skills({ themeId = "dark-luxe" }: SkillsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case "expert":
        return "w-full";
      case "advanced":
        return "w-5/6";
      case "intermediate":
        return "w-3/4";
      case "learning":
        return "w-1/2";
      default:
        return "w-1/2";
    }
  };

  const getProficiencyLabel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const hoverClass = prefersReducedMotion
    ? ""
    : "hover:translate-x-2 hover:scale-[1.02]";

  return (
    <section
      id="skills"
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
      <div className="mx-auto max-w-5xl">
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
            Skills & Expertise
          </h2>
        </div>

        {/* Skills by category */}
        <div className="space-y-16">
          {skillCategories.map((category) => (
            <div key={category.id}>
              {/* Category header */}
              <div className="mb-8">
                <h3
                  className="text-accent-primary mb-2 text-2xl font-light tracking-wide uppercase"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontVariant: "small-caps",
                  }}
                >
                  {category.name}
                </h3>
                <div
                  className="h-px w-16"
                  style={{
                    background:
                      "linear-gradient(to right, var(--accent-primary), transparent)",
                  }}
                />
                <p className="text-foreground-muted mt-3 text-sm">
                  {category.description}
                </p>
              </div>

              {/* Skills grid */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {category.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className={`flex flex-col gap-3 transition-all duration-300 ${hoverClass}`}
                  >
                    {/* Skill name and level */}
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-medium">
                        {skill.name}
                      </span>
                      <span className="text-accent-secondary text-xs tracking-widest uppercase">
                        {getProficiencyLabel(skill.level)}
                      </span>
                    </div>

                    {/* Proficiency bar */}
                    <div className="bg-accent-secondary/20 relative h-px">
                      <div
                        className={`h-full ${getProficiencyColor(skill.level)}`}
                        style={{
                          background:
                            "linear-gradient(to right, var(--accent-primary), var(--accent-tertiary), var(--accent-secondary))",
                          animation: prefersReducedMotion
                            ? "none"
                            : `fillWidth 0.5s ease-out forwards`,
                        }}
                      />
                    </div>

                    {/* Additional info */}
                    <div className="text-foreground-muted flex items-center gap-2 text-xs">
                      {skill.yearsOfExperience && (
                        <span>{skill.yearsOfExperience} years</span>
                      )}
                      {skill.yearsOfExperience && skill.endorsements && (
                        <span>•</span>
                      )}
                      {skill.endorsements && (
                        <span>{skill.endorsements} endorsements</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary stats */}
        <div
          className="mt-16 grid grid-cols-1 gap-8 pt-12 text-center md:grid-cols-3"
          style={{ borderTop: "1px solid var(--accent-secondary)" }}
        >
          <div className={`transition-all duration-300 ${hoverClass}`}>
            <div className="text-accent-primary mb-2 text-4xl font-light">
              {skillCategories.reduce((sum, cat) => sum + cat.skills.length, 0)}
            </div>
            <p className="text-foreground-muted text-sm tracking-widest uppercase">
              Total Skills
            </p>
          </div>

          <div className={`transition-all duration-300 ${hoverClass}`}>
            <div className="text-accent-primary mb-2 text-4xl font-light">
              {skillCategories.length}
            </div>
            <p className="text-foreground-muted text-sm tracking-widest uppercase">
              Categories
            </p>
          </div>

          <div className={`transition-all duration-300 ${hoverClass}`}>
            <div className="text-accent-primary mb-2 text-4xl font-light">
              {
                skillCategories
                  .flatMap((cat) => cat.skills)
                  .filter((s) => s.level === "expert" || s.level === "advanced")
                  .length
              }
            </div>
            <p className="text-foreground-muted text-sm tracking-widest uppercase">
              Expert Level
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fillWidth {
          from {
            width: 0;
          }
        }
      `}</style>
    </section>
  );
}
