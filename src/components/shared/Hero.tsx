"use client";

import { useRef, useEffect, useState } from "react";
import { personalInfo } from "@/lib/data/personal";
import { ChevronDown } from "lucide-react";
import { getThemeConfig } from "@/config/themes";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./shared.module.css";

interface HeroProps {
  themeId?: string;
}

export function Hero({ themeId = "dark-luxe" }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const config = getThemeConfig(themeId);
  const [scrollScale, setScrollScale] = useState(1);
  const [typewriterText, setTypewriterText] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showName, setShowName] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showContent, setShowContent] = useState(themeId !== "noir-cinema");

  const isNeonCyber = themeId === "neon-cyber";
  const isNoirCinema = themeId === "noir-cinema";
  const isPaperInk = themeId === "paper-ink";
  const isEditorial = themeId === "editorial";
  const isDarkLuxe = themeId === "dark-luxe";

  // Editorial scroll scaling
  useEffect(() => {
    if (!isEditorial || prefersReducedMotion) return;

    const handleScroll = () => {
      const scroll = window.scrollY;
      const scale = Math.max(0.8, 1 - scroll * 0.0003);
      setScrollScale(scale);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isEditorial, prefersReducedMotion]);

  // Noir Cinema countdown
  useEffect(() => {
    if (!isNoirCinema || prefersReducedMotion) {
      setShowContent(true);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 600);
      return () => clearTimeout(timer);
    } else if (!showContent) {
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    }
  }, [countdown, showContent, isNoirCinema, prefersReducedMotion]);

  // Neon Cyber typewriter effect
  useEffect(() => {
    if (!isNeonCyber || prefersReducedMotion) {
      setShowName(true);
      setCursorPosition(0);
      return;
    }

    const fullText = "> INITIALIZING...";
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTypewriterText(fullText.slice(0, index + 1));
        setCursorPosition(index + 1);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShowName(true);
          setCursorPosition(0);
        }, 300);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isNeonCyber, prefersReducedMotion]);

  // Deterministic particle positions to avoid SSR/client hydration mismatch
  const PARTICLE_POSITIONS = [
    { left: 5, dur: 7.2, delay: 0.3 },
    { left: 12, dur: 9.1, delay: 2.1 },
    { left: 20, dur: 11.5, delay: 4.2 },
    { left: 28, dur: 8.3, delay: 1.0 },
    { left: 35, dur: 13.0, delay: 3.5 },
    { left: 42, dur: 6.8, delay: 0.8 },
    { left: 50, dur: 10.2, delay: 2.7 },
    { left: 58, dur: 7.9, delay: 4.8 },
    { left: 65, dur: 12.1, delay: 1.5 },
    { left: 72, dur: 8.7, delay: 3.2 },
    { left: 78, dur: 11.0, delay: 0.5 },
    { left: 84, dur: 9.5, delay: 2.4 },
    { left: 90, dur: 7.4, delay: 4.0 },
    { left: 95, dur: 13.3, delay: 1.8 },
    { left: 99, dur: 8.1, delay: 3.9 },
  ];

  const renderParticles = () => {
    if (themeId !== "dark-luxe" || prefersReducedMotion) return null;

    return (
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {PARTICLE_POSITIONS.map((p, i) => (
          <div
            key={i}
            className={styles.goldParticle}
            style={{
              left: `${p.left}%`,
              bottom: `-10px`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
    );
  };

  // DARK LUXE: Centered, elegant serif, subtle animations
  const renderDarkLuxeHero = () => (
    <div className="flex flex-col items-center justify-center text-center w-full">
      {renderParticles()}
      <h1
        className="mb-4 text-6xl font-light tracking-tight md:text-8xl"
        style={{
          fontFamily: "var(--font-display)",
        }}
      >
        {personalInfo.name}
      </h1>
      <div className="via-accent-primary mb-8 h-px w-24 bg-gradient-to-r from-transparent to-transparent" />
      <h2
        className="text-foreground-muted mb-6 text-sm tracking-widest uppercase md:text-base"
        style={{
          fontVariant: "small-caps",
          letterSpacing: "0.2em",
        }}
      >
        {personalInfo.title}
      </h2>
      <div className="bg-accent-secondary mb-8 h-px w-16" />
    </div>
  );

  // PAPER-INK: Full-width newspaper masthead layout
  const renderPaperInkHero = () => (
    <>
      <div className="mb-8 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1
            className="mb-4 text-5xl leading-tight tracking-wider md:text-6xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
          >
            THE AYUSH
            <br />
            YADAV
            <br />
            PORTFOLIO
          </h1>
        </div>
        <div className="border-l border-black pl-4">
          <p className="mb-2 text-xs font-bold tracking-widest uppercase">
            Vol. 1 | Issue 1
          </p>
          <p className="mb-4 text-xs md:text-sm text-gray-600">
            Oxford, Ohio
            <br />
            March 30, 2026
          </p>
          <p className="text-xs font-bold">Est. 2026</p>
        </div>
      </div>
      <p className="max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
        {personalInfo.tagline}
      </p>
    </>
  );

  // EDITORIAL: Asymmetric 2-column with red accent line
  const renderEditorialHero = () => (
    <div className="grid grid-cols-1 gap-12 w-full md:grid-cols-2 items-start">
      <div className="pt-8">
        <h1
          className="font-display overflow-hidden leading-none font-bold tracking-tighter mb-8"
          style={{
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            color: "var(--foreground)",
            fontFamily: "var(--font-display)",
            transform: `scale(${scrollScale})`,
            transition: prefersReducedMotion ? "none" : "transform 0.1s ease-out",
            transformOrigin: "left top",
          }}
        >
          <span className={styles.dropCap}>
            {personalInfo.firstName.charAt(0)}
          </span>
          {personalInfo.firstName.slice(1)}
        </h1>
        <div
          className={`${styles.editorialRedLineAccent} w-20`}
          style={{
            animation: prefersReducedMotion ? "none" : undefined,
          }}
        />
      </div>
      <div className="flex flex-col justify-start gap-8">
        <div>
          <p
            className="font-display leading-none font-bold tracking-tight"
            style={{
              fontSize: "clamp(1.75rem, 6vw, 3.5rem)",
              color: "var(--accent-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            YADAV
          </p>
        </div>
        <div
          className={`${styles.pullQuote}`}
          style={{
            animation: prefersReducedMotion ? "none" : undefined,
          }}
        >
          {personalInfo.tagline}
        </div>
        <p className="text-sm leading-relaxed text-foreground-muted">
          {personalInfo.title}
        </p>
      </div>
    </div>
  );

  // NOIR-CINEMA: Cinematic letterbox with staggered character reveal
  const renderNoirCinemaHero = () => {
    if (!showContent) return null;
    return (
      <div className="flex flex-col items-center justify-center text-center w-full">
        <h1
          className="text-foreground mb-6 font-bold tracking-tighter"
          style={{
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
          }}
        >
          {personalInfo.firstName.split("").map((char, i) => (
            <span key={`first-${i}`} className="inline-block">
              {char}
            </span>
          ))}
          <br />
          <span className="text-accent-primary">
            {personalInfo.name.split(" ").slice(1).join(" ")}
          </span>
        </h1>
        <div className="mb-12 md:mb-16">
          <p
            className="text-accent-primary text-xs tracking-widest uppercase md:text-sm"
            style={{ letterSpacing: "0.3em" }}
          >
            A PORTFOLIO PRODUCTION
          </p>
        </div>
        <div className="via-accent-primary mb-8 h-px w-full bg-gradient-to-r from-transparent to-transparent md:mb-12" />
        <h2
          className="text-accent-primary mb-6 text-base tracking-widest uppercase md:text-xl"
          style={{
            fontFamily: "var(--font-body)",
            letterSpacing: "0.15em",
          }}
        >
          {personalInfo.title}
        </h2>
        <p
          className="text-foreground-muted mb-8 max-w-2xl text-sm leading-relaxed md:text-lg"
          style={{
            fontFamily: "var(--font-body)",
            letterSpacing: "0.05em",
          }}
        >
          {personalInfo.tagline}
        </p>
        <div className="mt-12 space-y-2 md:mt-16">
          <p
            className="text-accent-primary text-xs tracking-widest"
            style={{ letterSpacing: "0.2em" }}
          >
            DIRECTED BY FATE
          </p>
          <p
            className="text-accent-primary text-xs tracking-widest"
            style={{ letterSpacing: "0.2em" }}
          >
            STARRING YOU
          </p>
        </div>
      </div>
    );
  };

  // NEON-CYBER: Terminal aesthetic with HUD styling
  const renderNeonCyberHero = () => (
    <div className="w-full flex flex-col items-start justify-start">
      <div className={`${styles.hudBox} w-full max-w-2xl`}>
        {typewriterText && (
          <p
            className={`${styles.typewriter} mb-8 text-sm sm:text-base`}
            style={{ minHeight: "1.5em" }}
          >
            {typewriterText}
          </p>
        )}
        {showName && (
          <>
            <h1
              className="mb-6 leading-none font-bold tracking-tighter"
              style={{
                fontSize: "clamp(2rem, 6vw, 4rem)",
                fontFamily: "var(--font-display)",
                background:
                  "linear-gradient(90deg, #00ff88 0%, #00d4ff 50%, #ff006e 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 20px rgba(0, 255, 136, 0.8))",
              }}
            >
              {personalInfo.name.toUpperCase()}
            </h1>
            <p
              className="text-base tracking-wide sm:text-lg"
              style={{
                fontFamily:
                  "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
                color: "var(--neon-green)",
                textShadow: `
                  0 0 10px var(--neon-green),
                  0 0 20px var(--neon-green)
                `,
                letterSpacing: "0.15em",
              }}
            >
              [{personalInfo.title}]
            </p>
            <p
              className="mt-2 text-xs sm:text-sm"
              style={{
                fontFamily:
                  "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
                color: "var(--neon-cyan)",
                opacity: 0.8,
              }}
            >
              {personalInfo.tagline}
            </p>
          </>
        )}
      </div>
    </div>
  );

  return (
    <section
      id="hero"
      ref={containerRef}
      className={`bg-background relative flex h-screen w-full flex-col overflow-hidden ${
        isPaperInk ? "pt-32" : ""
      } ${isNeonCyber ? styles.cyberScanlines : ""} ${
        isEditorial
          ? "items-start justify-start px-4 md:px-8"
          : "items-center justify-center px-4 md:px-8"
      }`}
      data-theme={themeId}
      style={{
        backgroundColor:
          isPaperInk ? "#f5f1de" : isEditorial ? "#fefefe" : undefined,
        contain: "layout style paint",
        contentVisibility: "auto",
        containIntrinsicSize: "100vh",
      }}
    >
      {/* Noir Cinema countdown overlay */}
      {isNoirCinema && !showContent && !prefersReducedMotion && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black">
          <div
            className={styles.countdownNumber}
            style={{
              fontSize: "clamp(4rem, 15vw, 10rem)",
            }}
          >
            {countdown > 0 ? countdown : ""}
          </div>
        </div>
      )}

      {/* Noir Cinema letterbox bars */}
      {isNoirCinema && (
        <>
          <div className="fixed top-0 right-0 left-0 z-40 flex h-12 items-center justify-center bg-black md:h-20">
            <p className="text-xs tracking-widest text-gray-500">FADE IN</p>
          </div>
          <div className="fixed right-0 bottom-0 left-0 z-40 flex h-12 items-center justify-center bg-black md:h-20">
            <p className="text-xs tracking-widest text-gray-500">END SCENE</p>
          </div>
        </>
      )}

      {/* Paper Ink scanline effect */}
      {isPaperInk && (
        <div
          className="pointer-events-none absolute inset-0 opacity-3"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.02) 0px,
              rgba(0, 0, 0, 0.02) 1px,
              transparent 1px,
              transparent 2px
            )`,
          }}
        />
      )}

      {/* Main content wrapper */}
      <div
        className={`relative z-10 w-full max-w-4xl ${
          isEditorial
            ? "pt-20 md:pt-24"
            : "flex flex-col items-center justify-center"
        }`}
        style={{
          opacity: showContent ? 1 : 0,
          transition: prefersReducedMotion
            ? "none"
            : "opacity 0.5s ease-out 0.3s",
        }}
      >
        {isDarkLuxe && renderDarkLuxeHero()}
        {isPaperInk && renderPaperInkHero()}
        {isEditorial && renderEditorialHero()}
        {isNoirCinema && renderNoirCinemaHero()}
        {isNeonCyber && renderNeonCyberHero()}

        {/* CTA Buttons - theme-specific */}
        {(isDarkLuxe || isNoirCinema) && (
          <div className="mt-12 flex flex-col gap-6 sm:flex-row">
            <a
              href="#projects"
              className={`border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-background border px-8 py-3 text-sm tracking-widest uppercase transition-all duration-300 ${
                isNoirCinema ? "border-2" : ""
              }`}
            >
              {isNoirCinema ? "Continue Feature" : "View Work"}
            </a>
            <a
              href={personalInfo.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-accent-secondary hover:bg-accent-secondary hover:text-background border px-8 py-3 text-sm tracking-widest uppercase transition-all duration-300 ${
                isNoirCinema
                  ? "border-foreground text-foreground hover:bg-foreground border-2"
                  : "border-accent-secondary"
              }`}
            >
              {isNoirCinema ? "View Credits" : "Resume"}
            </a>
          </div>
        )}

        {isPaperInk && (
          <div className="mt-12 flex flex-col gap-4">
            <h3 className="text-sm font-bold tracking-widest uppercase">
              In This Edition
            </h3>
            <a
              href="#projects"
              className="w-fit border-2 border-black px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 hover:bg-black hover:text-[#f5f1de]"
            >
              Featured Work →
            </a>
            <a
              href={personalInfo.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit border-2 border-black px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 hover:bg-black hover:text-[#f5f1de]"
            >
              Full Resume →
            </a>
          </div>
        )}

        {isEditorial && (
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <a
              href="#projects"
              className="border-2 border-black px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 hover:bg-black hover:text-[#fefefe]"
            >
              Featured Work
            </a>
            <a
              href={personalInfo.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-black px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 hover:bg-black hover:text-[#fefefe]"
            >
              Full Resume
            </a>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-12 z-10 flex flex-col items-center gap-3"
        style={{
          opacity: showContent ? 1 : 0,
          transition: prefersReducedMotion
            ? "none"
            : "opacity 1s ease-out 1.2s",
        }}
      >
        <div
          style={{
            animation: prefersReducedMotion
              ? "none"
              : "bounce 2.5s ease-in-out infinite",
          }}
        >
          <ChevronDown
            size={24}
            className={
              isPaperInk || isEditorial ? "text-black" : "text-accent-primary"
            }
            style={
              isNeonCyber
                ? {
                    color: "var(--neon-cyan)",
                    filter: "drop-shadow(0 0 10px var(--neon-cyan))",
                  }
                : {}
            }
          />
        </div>
        <p
          className={`text-xs tracking-widest uppercase ${
            isPaperInk || isEditorial
              ? "text-black"
              : "text-foreground-muted"
          }`}
        >
          {isPaperInk ? "SCROLL" : "Scroll to explore"}
        </p>
      </div>
    </section>
  );
}
