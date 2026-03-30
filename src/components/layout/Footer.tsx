/**
 * @fileoverview Site footer with social links and holographic divider
 *
 * Features:
 * - Holographic gradient divider line at the top
 * - Social icon links (GitHub, LinkedIn, Email)
 * - Quick nav links mirroring the header
 * - Copyright notice with dynamic year
 * - Glassmorphism background consistent with the design system
 */

import { personalInfo, socialLinks } from "@/lib/data/personal";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────
   Social icon SVG paths
   ────────────────────────────────────────────── */

/** Map of platform names to SVG path data (24 × 24 viewBox) */
const ICON_PATHS: Record<string, string> = {
  Github:
    "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z",
  Linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  Mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 2-8 5-8-5v2l8 5 8-5V6z",
};

/** Section quick links (mirrors header nav) */
const QUICK_LINKS = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

/* ──────────────────────────────────────────────
   Footer component
   ────────────────────────────────────────────── */

/**
 * Site footer with social links, quick navigation, and copyright
 *
 * Server component — no client-side JS needed.
 *
 * @returns The rendered footer element
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-24">
      {/* Enhanced holographic divider with glow */}
      <div
        className="mx-auto mb-2 h-[2px] w-3/4 max-w-(--container-max) rounded-full shadow-lg"
        style={{
          background: "var(--holo-gradient)",
          boxShadow: "0 0 30px var(--glow-color, rgba(232, 197, 71, 0.3))",
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-(--container-max) px-6 py-12">
        {/* ── Call-to-action banner ── */}
        <div className="mb-10 rounded-lg border border-(--glass-border) bg-(--surface-2) p-6">
          <p className="text-foreground-muted text-center text-sm">
            Let's build something meaningful together.{" "}
            <a
              href="#contact"
              className={cn(
                "text-accent-primary font-semibold transition-colors duration-(--transition-fast)",
                "hover:text-accent-tertiary"
              )}
            >
              Get in touch
            </a>
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {/* ── Column 1: Branding ── */}
          <div className="space-y-3">
            <p className="text-foreground text-lg font-bold tracking-tight">
              {personalInfo.name}
            </p>
            <p className="text-foreground-muted max-w-xs text-sm leading-relaxed">
              {personalInfo.bio[0].replace(/\*\*/g, "")}
            </p>
          </div>

          {/* ── Column 2: Quick links ── */}
          <div className="space-y-3">
            <p className="text-foreground-muted text-sm font-semibold tracking-widest uppercase">
              Navigate
            </p>
            <ul className="space-y-2" role="list">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={cn(
                      "text-foreground-muted text-sm transition-colors duration-(--transition-fast)",
                      "hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Social links ── */}
          <div className="space-y-3">
            <p className="text-foreground-muted text-sm font-semibold tracking-widest uppercase">
              Connect
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target={social.name !== "Email" ? "_blank" : undefined}
                  rel={
                    social.name !== "Email" ? "noopener noreferrer" : undefined
                  }
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    "border border-(--glass-border) bg-(--glass-background)",
                    "text-foreground-muted transition-all duration-(--transition-base)",
                    "hover:border-accent-primary hover:text-accent-primary hover:shadow-accent-primary/20 hover:shadow-lg"
                  )}
                  aria-label={`Visit ${social.name}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d={ICON_PATHS[social.icon] ?? ""} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-(--glass-border) pt-6 sm:flex-row">
          <p className="text-foreground-muted text-xs">
            &copy; {currentYear} {personalInfo.name}. All rights reserved.
          </p>
          <p className="text-foreground-muted text-xs">
            Built with Next.js, Tailwind CSS &amp; GSAP
          </p>
        </div>
      </div>
    </footer>
  );
}
