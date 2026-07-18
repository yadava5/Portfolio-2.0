/**
 * @fileoverview Header — working-paper chrome over the day-arc world.
 *
 * Transparent over the world with a hairline bottom rule; mono lowercase
 * wordmark; text nav (no boxed-chip rows — letterpress, not SaaS) routed
 * through the single Lenis loop (A1). One recruiter affordance: the
 * filled-ink resume chip. GitHub/LinkedIn live at the gate and in the
 * footer. Ink is composed from pre-verified vars that step at the dusk
 * flip via `html[data-arc-phase="dusk"]` (see .site-header in
 * globals.css). The scrolled state fades in opaque paper — never frost.
 * Carries the quiet in-page motion toggle (amendment A7); when the OS
 * itself forces reduced motion the control reports the effective state
 * as system-owned instead of pretending motion is on.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, Mail, X } from "lucide-react";
import { personalInfo, socialLinks } from "@/lib/data/personal";
import {
  useLenis,
  useMotionPreference,
  SCROLL_DURATION,
  SCROLL_OFFSET,
  scrollEasing,
} from "@/components/layout/SmoothScroll";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const NAV_ITEMS = [
  /* "the work" stays visible on phones: a screener must reach the
     flagship without seven chapters of scrolling. */
  { label: "the work", href: "/#work", target: "#work", className: "" },
  {
    label: "experience",
    href: "/#path",
    target: "#path",
    className: "hidden md:list-item",
  },
  {
    label: "contact",
    href: "/#gate",
    target: "#gate",
    className: "hidden md:list-item",
  },
];

/* GitHub surfaces early (desktop nav cluster) — screeners should not have
   to reach the gate chapter to find the code. */
const GITHUB_URL = socialLinks.find((link) => link.name === "GitHub")?.url;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [portraitOpen, setPortraitOpen] = useState(false);
  const lenis = useLenis();
  const { motionOff, toggleMotion } = useMotionPreference();
  const prefersReducedMotion = usePrefersReducedMotion();

  /* Scrolled state reads from the single scroll loop when the engine is
     mounted; falls back to a passive native listener in the static world. */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    if (lenis) {
      lenis.on("scroll", onScroll);
      return () => {
        lenis.off("scroll", onScroll);
      };
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lenis]);

  useEffect(() => {
    if (!portraitOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPortraitOpen(false);
      }
    };

    /* Pause the scroll engine while the modal locks the page */
    lenis?.stop();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      lenis?.start();
    };
  }, [portraitOpen, lenis]);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLElement>, targetId: string) => {
      const target = document.querySelector<HTMLElement>(targetId);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        /* Programmatic scrolls: 1.2s expo-out through the engine (plan 3.9) */
        lenis.scrollTo(target, {
          duration: SCROLL_DURATION,
          easing: scrollEasing,
          offset: SCROLL_OFFSET,
        });
      } else {
        /* Static world: instant jump, no animation */
        target.scrollIntoView({ behavior: "auto" });
      }
    },
    [lenis]
  );

  return (
    <>
      <header
        data-lenis-connected={lenis ? "true" : "false"}
        className={`site-header fixed top-0 right-0 left-0 z-50 border-b transition-[background-color,padding] duration-500 ${
          scrolled ? "site-header-scrolled py-2.5" : "py-4"
        }`}
      >
        {/* Below ~420px the wordmark wins every fight for space: the
            avatar chip shrinks (and drops under 375px), the resume chip
            slims to text (icon-only under 360px), and gaps tighten —
            "ayush yadav" NEVER ellipsizes, 320px up (fix round 4). */}
        <nav className="mx-auto flex max-w-[1240px] items-center justify-between gap-2 px-6 sm:gap-3 sm:px-12 xl:pr-16 xl:pl-36">
          <div className="flex items-center gap-2 min-[420px]:gap-3">
            <button
              type="button"
              onClick={() => setPortraitOpen(true)}
              className="relative hidden h-7 w-7 shrink-0 overflow-hidden rounded-full border border-(--header-ink-border) transition-colors hover:border-(--header-ink) min-[375px]:block min-[420px]:h-9 min-[420px]:w-9"
              aria-label="Open Ayush Yadav portrait"
              aria-haspopup="dialog"
              aria-expanded={portraitOpen}
            >
              <Image
                src={personalInfo.portrait.image}
                alt={personalInfo.portrait.alt}
                fill
                className="object-cover object-top"
                sizes="36px"
                priority
              />
            </button>
            <Link
              href="/"
              className="label-mono whitespace-nowrap text-(--header-ink)"
            >
              ayush yadav
            </Link>
          </div>

          <ul className="flex items-center gap-4 sm:gap-6 lg:gap-7">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className={item.className}>
                <Link
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.target)}
                  className="label-mono link-draw whitespace-nowrap text-(--header-ink-muted) transition-colors hover:text-(--header-ink)"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {GITHUB_URL ? (
              <li className="hidden md:list-item">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-mono link-draw text-(--header-ink-muted) transition-colors hover:text-(--header-ink)"
                >
                  github
                </a>
              </li>
            ) : null}
          </ul>

          <div className="flex items-center gap-2 sm:gap-3">
            {prefersReducedMotion ? (
              <span
                className="label-mono mr-1 hidden text-(--header-ink-muted) sm:inline-flex"
                title="Motion is disabled by your system preference"
              >
                motion: off — system
              </span>
            ) : (
              <button
                type="button"
                onClick={toggleMotion}
                aria-pressed={motionOff}
                className="label-mono mr-1 hidden text-(--header-ink-muted) transition-colors hover:text-(--header-ink) sm:inline-flex"
              >
                motion: {motionOff ? "off" : "on"}
              </button>
            )}
            {/* Mobile contact affordance: the text nav's "contact" item is
                md+ only, so phones get a quiet mail icon beside resume. */}
            <a
              href={`mailto:${personalInfo.email}`}
              aria-label="Contact"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xs border border-(--header-ink-border) text-(--header-ink) transition-colors hover:border-(--header-ink) min-[420px]:h-9 min-[420px]:w-9 md:hidden"
            >
              <Mail size={15} aria-hidden="true" />
            </a>
            {/* The FileText icon shows when there is room (≥420px) and
                stands in alone on the very smallest frames (<360px). */}
            <a
              href={personalInfo.resumeUrl}
              aria-label="Resume"
              className="label-mono inline-flex h-8 items-center gap-2 rounded-xs border border-(--header-ink) bg-(--header-ink) px-2.5 text-(--header-paper) min-[420px]:h-9 min-[420px]:px-3"
            >
              <FileText
                size={15}
                aria-hidden="true"
                className="hidden max-[359px]:block min-[420px]:block"
              />
              <span className="max-[359px]:hidden">resume</span>
            </a>
          </div>
        </nav>
      </header>

      {portraitOpen ? (
        <div
          className="bg-canvas/90 fixed inset-0 z-[120] flex items-center justify-center px-5 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="Ayush Yadav portrait"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPortraitOpen(false);
            }
          }}
        >
          <div className="border-ink/25 bg-canvas relative max-h-[calc(100vh-4rem)] w-full max-w-sm overflow-hidden rounded-xs border sm:max-w-md">
            <button
              type="button"
              onClick={() => setPortraitOpen(false)}
              className="border-ink/30 bg-canvas text-ink hover:border-ink absolute top-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
              aria-label="Close portrait"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <Image
              src={personalInfo.portrait.image}
              alt={personalInfo.portrait.alt}
              width={1024}
              height={1536}
              className="h-auto max-h-[calc(100vh-4rem)] w-full object-contain"
              sizes="(min-width: 640px) 448px, calc(100vw - 40px)"
              priority
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
