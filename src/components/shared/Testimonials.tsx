"use client";

import { testimonials } from "@/lib/data/testimonials";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface TestimonialsProps {
  themeId?: string;
}

export function Testimonials({ themeId = "dark-luxe" }: TestimonialsProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const hoverClass = prefersReducedMotion ? "" : "hover:translate-y-[-8px]";

  return (
    <section
      id="testimonials"
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
      <div className="max-w-5xl mx-auto">
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
            Testimonials
          </h2>
          <p className={`text-foreground-muted text-lg mt-4 max-w-2xl text-center ${
            themeId === "paper-ink" || themeId === "editorial" ? "text-gray-600" : ""
          }`}>
            Kind words from colleagues, managers, and collaborators
          </p>
        </div>

        {/* Testimonials Grid */}
        {testimonials.length > 0 && (
          <div className="space-y-12">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className={`relative border p-10 md:p-12 rounded-sm transition-all duration-300 ${hoverClass}`}
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--accent-secondary)",
                }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-sm">
                  <div
                    className="absolute inset-0 opacity-5 blur-lg"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, var(--accent-secondary), transparent)",
                    }}
                  />
                </div>

                <div className="relative">
                  {/* Large quotation mark */}
                  <div
                    className="absolute -top-6 -left-2 text-6xl"
                    style={{ color: "var(--accent-primary)", opacity: 0.3 }}
                  >
                    &quot;
                  </div>

                  {/* Quote text */}
                  <p
                    className="text-lg md:text-xl text-foreground leading-relaxed mb-8 italic font-light"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {testimonial.quote}
                  </p>

                  {/* Separator */}
                  <div
                    className="h-px w-8 mb-6"
                    style={{
                      background:
                        "linear-gradient(to right, var(--accent-primary), transparent)",
                    }}
                  />

                  {/* Attribution */}
                  <div className="flex items-start gap-4">
                    {/* Avatar placeholder */}
                    <div className="flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center border"
                        style={{
                          backgroundColor: "var(--accent-primary)",
                          borderColor: "var(--accent-primary)",
                        }}
                      >
                        <span
                          className="text-accent-primary text-sm font-light"
                          style={{ color: "var(--accent-primary)" }}
                        >
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    </div>

                    {/* Name and info */}
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{testimonial.name}</p>
                      <p className="text-foreground-muted text-sm">{testimonial.title}</p>
                      <p className="text-accent-secondary text-xs uppercase tracking-widest mt-1">
                        {testimonial.company}
                      </p>
                      {testimonial.linkedInUrl && (
                        <a
                          href={testimonial.linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-primary text-xs uppercase tracking-widest mt-2 inline-block hover:underline"
                        >
                          View Profile
                        </a>
                      )}
                    </div>

                    {/* Relationship badge */}
                    <div className="flex-shrink-0">
                      <span
                        className="text-xs px-3 py-1 border rounded-sm capitalize"
                        style={{
                          borderColor: "var(--accent-primary)",
                          color: "var(--accent-tertiary)",
                        }}
                      >
                        {testimonial.relationship}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {testimonials.length === 0 && (
          <div className="text-center py-16">
            <p className="text-foreground-muted">No testimonials yet</p>
          </div>
        )}
      </div>
    </section>
  );
}
