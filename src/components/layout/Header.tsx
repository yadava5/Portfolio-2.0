/**
 * @fileoverview Header — the working paper's RUNNING HEAD over the day-arc
 * world (brief B8).
 *
 * A printed monograph's masthead, not a SaaS navbar: mono lowercase
 * wordmark; the DayMark running head (a circle of the day filling with
 * ink, ○ → ◐ → ●, plus the chapter's fixed dateline clock and name); a
 * text nav whose ACTIVE item keeps its ink underline drawn — the chrome
 * always says where in the workday the reader stands. Section state
 * comes from useActiveChapter (IntersectionObserver at the viewport
 * center line — fires at crossings only, no scroll listeners, nothing
 * on the one scroll loop). Anchors route through the single scroll
 * controller (A1). One recruiter affordance: the filled-ink resume chip
 * (letterpress un-fill on hover). Ink is composed from pre-verified
 * vars that step at the dusk flip via `html[data-arc-phase="dusk"]`
 * (see .site-header in globals.css). The scrolled state fades in opaque
 * paper — never frost. The masthead's bottom rule draws itself once in
 * the hero's load window (`.site-header::after`, motion worlds only);
 * every static world paints the finished rule. Carries the quiet
 * in-page motion toggle (amendment A7); when the OS itself forces
 * reduced motion the control reports the effective state as
 * system-owned instead of pretending motion is on.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useActiveChapter } from "@/hooks/useActiveChapter";
import { DayMark } from "@/components/layout/DayMark";

const NAV_ITEMS = [
  /* "the work" stays visible on phones: a screener must reach the
     flagship without seven chapters of scrolling. `chapter` is the
     section-aware underline contract: while that chapter is under the
     viewport's center line, the item keeps its ink line drawn
     (aria-current + .link-draw[aria-current] in globals.css). */
  {
    label: "the work",
    href: "/#work",
    target: "#work",
    chapter: "05",
    className: "",
  },
  {
    label: "experience",
    href: "/#path",
    target: "#path",
    chapter: "03",
    className: "hidden md:list-item",
  },
  {
    label: "contact",
    href: "/#gate",
    target: "#gate",
    chapter: "07",
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
  const pathname = usePathname();
  /* Case files + /evidence sit on the flat archive stock (no day-arc):
     the header reads the surface beneath it (completion map §3). */
  const archiveSurface =
    pathname?.startsWith("/projects") || pathname?.startsWith("/evidence");
  /* The running head exists only where the day passes: the home story.
     SSR prerenders its truthful top-of-page state (dawn) so the masthead
     never pops in after hydration; archive routes get null — the mark
     hides rather than assert a time of day on flat stock. */
  const activeChapter = useActiveChapter(pathname === "/");

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
        data-surface={archiveSurface ? "archive" : undefined}
        className={`site-header fixed top-0 right-0 left-0 z-50 transition-[background-color,padding] duration-500 ${
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
              {/* The 96px avatar derivative, not the full portrait: the
                  button paints at 26–36px, and the old priority preload
                  burned a critical-window slot on every route for 52KB
                  of unused pixels (PERF-AUDIT fix 3). No priority — a
                  header thumb must never outrank fonts and CSS. */}
              <Image
                src={personalInfo.portrait.thumb}
                alt={personalInfo.portrait.alt}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            </button>
            <Link
              href="/"
              className="label-mono link-draw-quiet whitespace-nowrap text-(--header-ink)"
            >
              ayush yadav
            </Link>
            {/* The running head: where the reader stands in the workday.
                Chapter state changes only at section crossings — never
                per scrolled frame. */}
            {activeChapter ? <DayMark chapter={activeChapter} /> : null}
          </div>

          {/* gap-4 through the tablet band (the md row also carries the
              day glyph now — measured, not guessed); the airy gap-7
              returns at lg where the width exists. */}
          <ul className="flex items-center gap-4 lg:gap-7">
            {NAV_ITEMS.map((item) => {
              const isActive = activeChapter?.id === item.chapter;
              return (
                <li key={item.href} className={item.className}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.target)}
                    aria-current={isActive ? "true" : undefined}
                    className={`label-mono link-draw whitespace-nowrap transition-colors hover:text-(--header-ink) ${
                      isActive
                        ? "text-(--header-ink)"
                        : "text-(--header-ink-muted)"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
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
                className="label-mono hidden text-(--header-ink-muted) sm:inline-flex"
                title="Motion is disabled by your system preference"
              >
                motion: off — system
              </span>
            ) : (
              <button
                type="button"
                onClick={toggleMotion}
                aria-pressed={motionOff}
                className="label-mono hidden text-(--header-ink-muted) transition-colors hover:text-(--header-ink) sm:inline-flex"
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
            {/* Letterpress un-fill: the filled chip lifts to its outline
                on hover — ink and paper trade places, both states AA on
                both sides of the dusk flip (pre-verified header vars). */}
            <a
              href={personalInfo.resumeUrl}
              aria-label="Resume"
              className="label-mono inline-flex h-8 items-center gap-2 rounded-xs border border-(--header-ink) bg-(--header-ink) px-2.5 text-(--header-paper) transition-colors hover:bg-transparent hover:text-(--header-ink) min-[420px]:h-9 min-[420px]:px-3"
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
            {/* The dialog mounts only when opened, so the full portrait
                loads on demand — priority dropped (PERF-AUDIT fix 3);
                width/height corrected to the file's real 900×1350. */}
            <Image
              src={personalInfo.portrait.image}
              alt={personalInfo.portrait.alt}
              width={900}
              height={1350}
              className="h-auto max-h-[calc(100vh-4rem)] w-full object-contain"
              sizes="(min-width: 640px) 448px, calc(100vw - 40px)"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
