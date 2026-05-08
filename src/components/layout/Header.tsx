"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Github, Linkedin, Mail } from "lucide-react";
import { personalInfo, socialLinks } from "@/lib/data/personal";

const NAV_ITEMS = [
  { label: "Work", href: "/#projects", target: "#projects" },
  { label: "Experience", href: "/#experience", target: "#experience" },
  { label: "Technical Depth", href: "/#skills", target: "#skills" },
  { label: "Contact", href: "/#contact", target: "#contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const github = socialLinks.find((link) => link.name === "GitHub")?.url;
  const linkedIn = socialLinks.find((link) => link.name === "LinkedIn")?.url;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLElement>, targetId: string) => {
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-zinc-800 bg-zinc-950/88 py-3 backdrop-blur-md"
          : "border-b border-transparent bg-zinc-950/45 py-4 backdrop-blur-sm"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 md:px-8 lg:px-10">
        <Link
          href="/#hero"
          onClick={(e) => handleNavClick(e, "#hero")}
          className="group flex items-center gap-3"
          aria-label="Back to hero"
        >
          <span className="flex h-10 w-10 items-center justify-center border border-amber-400/40 bg-zinc-950 text-lg font-bold tracking-tight text-zinc-50">
            AY
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold text-zinc-50">
              Technical Operations Atlas
            </span>
            <span className="block text-xs text-zinc-500">by Ayush Yadav</span>
          </span>
        </Link>

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

        <div className="flex items-center gap-2">
          <a
            href={personalInfo.resumeUrl}
            className="inline-flex h-10 items-center gap-2 rounded border border-amber-400 bg-amber-400 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
          >
            <FileText size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Resume</span>
          </a>
          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-2 rounded border border-zinc-700 bg-zinc-950/80 px-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-400 md:inline-flex"
            >
              <Github size={16} aria-hidden="true" />
              GitHub
            </a>
          ) : null}
          {linkedIn ? (
            <a
              href={linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-2 rounded border border-zinc-700 bg-zinc-950/80 px-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-400 md:inline-flex"
            >
              <Linkedin size={16} aria-hidden="true" />
              LinkedIn
            </a>
          ) : null}
          <Link
            href="/#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className="inline-flex h-10 items-center gap-2 rounded border border-zinc-700 bg-zinc-950/80 px-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-400"
          >
            <Mail size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Contact</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
