"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FileText, Github, Linkedin, Mail, X } from "lucide-react";
import { personalInfo, socialLinks } from "@/lib/data/personal";
import {
  useLenis,
  SCROLL_DURATION,
  SCROLL_OFFSET,
  scrollEasing,
} from "@/components/layout/SmoothScroll";

const NAV_ITEMS = [
  { label: "Case Studies", href: "/#projects", target: "#projects" },
  { label: "Experience", href: "/#experience", target: "#experience" },
  { label: "Technical Depth", href: "/#skills", target: "#skills" },
  { label: "Contact", href: "/#contact", target: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [portraitOpen, setPortraitOpen] = useState(false);
  const lenis = useLenis();
  const github = socialLinks.find((link) => link.name === "GitHub")?.url;
  const linkedIn = socialLinks.find((link) => link.name === "LinkedIn")?.url;

  /* Scrolled state reads from the single scroll loop when the engine is
     mounted; falls back to a passive native listener under reduced motion. */
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
        /* Reduced motion: instant jump, no animation */
        target.scrollIntoView({ behavior: "auto" });
      }
    },
    [lenis]
  );

  return (
    <>
      <header
        data-lenis-connected={lenis ? "true" : "false"}
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-zinc-800 bg-zinc-950/88 py-3 backdrop-blur-md"
            : "border-b border-transparent bg-zinc-950/45 py-4 backdrop-blur-sm"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 md:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => setPortraitOpen(true)}
            className="group relative h-11 w-11 overflow-hidden rounded-full border border-sky-400/50 bg-zinc-950 transition hover:border-cyan-300 focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:outline-none"
            aria-label="Open Ayush Yadav portrait"
            aria-haspopup="dialog"
            aria-expanded={portraitOpen}
          >
            <Image
              src={personalInfo.portrait.image}
              alt={personalInfo.portrait.alt}
              fill
              className="object-cover object-top transition duration-300 group-hover:scale-105"
              sizes="44px"
              priority
            />
          </button>

          <ul className="hidden items-center gap-6 lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.target)}
                  className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-50"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href={personalInfo.resumeUrl}
              aria-label="Resume"
              className="inline-flex h-10 w-10 items-center justify-center gap-2 rounded border border-sky-400 bg-sky-400 px-0 text-sm font-semibold text-zinc-950 transition hover:bg-sky-300 sm:w-auto sm:px-3"
            >
              <FileText size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Resume</span>
            </a>
            {github ? (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="inline-flex h-10 w-10 items-center justify-center gap-2 rounded border border-zinc-700 bg-zinc-950/80 px-0 text-sm font-semibold text-zinc-200 transition hover:border-zinc-400 md:w-auto md:px-3"
              >
                <Github size={16} aria-hidden="true" />
                <span className="hidden md:inline">GitHub</span>
              </a>
            ) : null}
            {linkedIn ? (
              <a
                href={linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center gap-2 rounded border border-zinc-700 bg-zinc-950/80 px-0 text-sm font-semibold text-zinc-200 transition hover:border-zinc-400 md:w-auto md:px-3"
              >
                <Linkedin size={16} aria-hidden="true" />
                <span className="hidden md:inline">LinkedIn</span>
              </a>
            ) : null}
            <Link
              href="/#contact"
              onClick={(e) => handleNavClick(e, "#contact")}
              aria-label="Contact"
              className="inline-flex h-10 w-10 items-center justify-center gap-2 rounded border border-zinc-700 bg-zinc-950/80 px-0 text-sm font-semibold text-zinc-200 transition hover:border-zinc-400 sm:w-auto sm:px-3"
            >
              <Mail size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Contact</span>
            </Link>
          </div>
        </nav>
      </header>

      {portraitOpen ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-zinc-950/88 px-5 py-8 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Ayush Yadav portrait"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setPortraitOpen(false);
            }
          }}
        >
          <div className="relative max-h-[calc(100vh-4rem)] w-full max-w-sm overflow-hidden rounded border border-sky-400/40 bg-zinc-950 shadow-[0_30px_120px_rgba(0,0,0,0.55)] sm:max-w-md">
            <button
              type="button"
              onClick={() => setPortraitOpen(false)}
              className="absolute top-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/85 text-zinc-200 transition hover:border-sky-300 hover:text-sky-100 focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:outline-none"
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
