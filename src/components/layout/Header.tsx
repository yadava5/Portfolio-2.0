/**
 * @fileoverview Floating navigation header with glassmorphism effect
 *
 * Features:
 * - Transparent → frosted glass on scroll (via IntersectionObserver)
 * - Smooth anchor-link navigation to page sections
 * - Mobile hamburger menu with slide-in drawer
 * - Hides on scroll-down, reveals on scroll-up
 * - Holographic accent underline on active section
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────
   Navigation items
   ────────────────────────────────────────────── */

/** Single navigation link definition */
interface NavItem {
  /** Display label */
  label: string;
  /** Anchor href (e.g. "#projects") */
  href: string;
}

/** Ordered list of section links shown in the header */
const NAV_ITEMS: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

/* ──────────────────────────────────────────────
   Scroll-direction hook (show/hide header)
   ────────────────────────────────────────────── */

/** Minimum scroll delta (px) before toggling visibility */
const SCROLL_THRESHOLD = 10;

/**
 * Tracks scroll direction to auto-hide/show the header
 *
 * @returns `true` when the header should be visible
 */
function useScrollDirection(): boolean {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const currentY = window.scrollY;
      const diff = currentY - lastY.current;

      if (Math.abs(diff) < SCROLL_THRESHOLD) return;

      /* scrolling up → show, scrolling down → hide, at top → always show */
      setVisible(diff < 0 || currentY < 80);
      lastY.current = currentY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return visible;
}

/* ──────────────────────────────────────────────
   "Scrolled past hero" detection
   ────────────────────────────────────────────── */

/**
 * Returns `true` once the user has scrolled beyond the hero viewport
 *
 * Used to transition the header from fully transparent to frosted glass.
 */
function useHasScrolled(): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function check() {
      setScrolled(window.scrollY > 50);
    }
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  return scrolled;
}

/* ──────────────────────────────────────────────
   Mobile menu toggle icon
   ────────────────────────────────────────────── */

/**
 * Animated hamburger ↔ X icon for the mobile menu
 *
 * @param props.open - Whether the mobile menu is open
 */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <div className="relative h-5 w-6">
      <span
        className={cn(
          "bg-foreground absolute left-0 block h-0.5 w-full rounded-full transition-all duration-300",
          open ? "top-2.5 rotate-45" : "top-0.5"
        )}
      />
      <span
        className={cn(
          "bg-foreground absolute top-2.5 left-0 block h-0.5 w-full rounded-full transition-opacity duration-300",
          open ? "opacity-0" : "opacity-100"
        )}
      />
      <span
        className={cn(
          "bg-foreground absolute left-0 block h-0.5 w-full rounded-full transition-all duration-300",
          open ? "top-2.5 -rotate-45" : "top-4.5"
        )}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────
   Header component
   ────────────────────────────────────────────── */

/**
 * Floating navigation header
 *
 * Renders a fixed-position nav bar that transitions from transparent to
 * frosted glass on scroll, hides/shows based on scroll direction, and
 * includes a mobile drawer for smaller viewports.
 *
 * @returns The rendered header element
 */
export default function Header() {
  const visible = useScrollDirection();
  const scrolled = useHasScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  /** Close mobile menu on resize to desktop */
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setMobileOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /** Focus trap for mobile menu */
  useEffect(() => {
    if (!mobileOpen || !menuRef.current) return;

    // Focus first nav link when menu opens
    const navLinks = menuRef.current.querySelectorAll("a");
    if (navLinks.length > 0) {
      navLinks[0].focus();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
      }

      if (e.key === "Tab") {
        const navLinks = menuRef.current?.querySelectorAll("a");
        if (!navLinks || navLinks.length === 0) return;

        const firstLink = navLinks[0];
        const lastLink = navLinks[navLinks.length - 1];
        const activeElement = document.activeElement;

        if (e.shiftKey) {
          // Shift+Tab from first link → loop to last
          if (activeElement === firstLink) {
            e.preventDefault();
            (lastLink as HTMLAnchorElement).focus();
          }
        } else {
          // Tab from last link → loop to first
          if (activeElement === lastLink) {
            e.preventDefault();
            firstLink.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  /** Scroll to a section and close mobile menu */
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      setMobileOpen(false);

      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    },
    []
  );

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 transition-all duration-500",
        visible ? "translate-y-0" : "-translate-y-full",
        scrolled
          ? "border-b border-(--glass-border) bg-(--glass-background) shadow-lg shadow-black/50 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <nav
        className="mx-auto flex max-w-(--container-max) items-center justify-between px-6 py-4"
        aria-label="Primary navigation"
      >
        {/* ── Logo / Name ── */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="group text-foreground relative text-lg font-bold tracking-tight"
        >
          <span className="relative z-10">AY</span>
          <span
            className="absolute -inset-x-2 -inset-y-1 z-0 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: "var(--holo-gradient)", filter: "blur(8px)" }}
            aria-hidden="true"
          />
        </a>

        {/* ── Desktop links ── */}
        <ul className="hidden items-center gap-1 md:flex" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={cn(
                  "text-foreground-muted relative rounded-lg px-3 py-2 text-sm font-medium",
                  "transition-colors duration-(--transition-fast)",
                  "hover:text-foreground",
                  "focus-visible:outline-accent-primary focus-visible:outline-2 focus-visible:outline-offset-2"
                )}
              >
                {item.label}
                {/* Holographic underline on hover */}
                <span
                  className="absolute bottom-0.5 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full transition-all duration-300 group-hover:w-4/5"
                  style={{ background: "var(--holo-gradient)" }}
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>

        {/* ── Right side actions ── */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <button
            ref={hamburgerRef}
            onClick={() => setMobileOpen((prev) => !prev)}
            className={cn(
              "text-foreground-muted rounded-lg p-2 transition-colors duration-(--transition-fast) md:hidden",
              "hover:text-foreground hover:bg-(--glass-background)",
              "focus-visible:outline-accent-primary focus-visible:outline-2 focus-visible:outline-offset-2"
            )}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      <div
        className={cn(
          "overflow-hidden border-t border-(--glass-border) bg-(--glass-background) backdrop-blur-xl transition-all duration-500 md:hidden",
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
        aria-hidden={!mobileOpen}
      >
        <ul ref={menuRef} className="flex flex-col gap-1 px-6 py-4" role="list">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                tabIndex={mobileOpen ? 0 : -1}
                className={cn(
                  "text-foreground-muted block rounded-lg px-3 py-2.5 text-sm font-medium",
                  "transition-colors duration-(--transition-fast)",
                  "hover:text-foreground hover:bg-(--glass-background)"
                )}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
