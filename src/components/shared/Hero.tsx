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
  const [showName, setShowName] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showContent, setShowContent] = useState(themeId !== "noir-cinema");

  const isCenter = config.layout.heroAlignment === "center";
  const isNeonCyber = themeId === "neon-cyber";
  const isNoirCinema = themeId === "noir-cinema";

  // Editorial scroll scaling
  useEffect(() => {
    if (themeId !== "editorial" || prefersReducedMotion) return;

    const handleScroll = () => {
      const scroll = window.scrollY;
      const scale = Math.max(0.8, 1 - scroll * 0.0003);
      setScrollScale(scale);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [themeId, prefersReducedMotion]);

  // Noir Cinema countdown
  useEffect(() => {
    if (!isNoirCinema || prefersReducedMotion) {
      setShowContent(true);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 600);
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
      return;
    }

    const fullText = "> INITIALIZING...";
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTypewriterText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowName(true), 300);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isNeonCyber, prefersReducedMotion]);

  const renderParticles = () => {
    if (themeId !== "dark-luxe" || prefersReducedMotion) return null;

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className={styles.goldParticle}
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-10px`,
              animationDuration: `${6 + Math.random() * 8}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    );
  };

  const renderHeroName = () => {
    if (isNoirCinema && !showContent) return null;

    if (isNeonCyber) {
      return (
        <>
          {typewriterText && (
            <p
              className={`${styles.typewriter} text-sm sm:text-base mb-8`}
              style={{ minHeight: "1.5em" }}
            >
              {typewriterText}
            </p>
          )}
          {showName && (
            <h1
              className="font-bold leading-none tracking-tighter mb-4 sm:mb-6"
              style={{
                fontSize: "clamp(2.5rem, 8vw, 5rem)",
                fontFamily: "var(--font-display)",
                background: "linear-gradient(90deg, #00ff88 0%, #00d4ff 50%, #ff006e 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 20px rgba(0, 255, 136, 0.8))",
              }}
            >
              {personalInfo.name.toUpperCase()}
            </h1>
          )}
        </>
      );
    }

    if (themeId === "editorial") {
      return (
        <div className="mb-6">
          <h1
            className="font-display font-bold leading-none tracking-tighter overflow-hidden"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 5rem)",
              color: "var(--foreground)",
              fontFamily: "var(--font-display)",
              transform: `scale(${scrollScale})`,
              transition: prefersReducedMotion ? "none" : "transform 0.1s ease-out",
              transformOrigin: "left top",
            }}
          >
            <span className={styles.dropCap}>{personalInfo.firstName.charAt(0)}</span>
            {personalInfo.firstName.slice(1)}
          </h1>
          <div
            className={`${styles.editorialRedLineAccent} max-w-xs`}
            style={{
              animation: prefersReducedMotion ? "none" : undefined,
            }}
          />
          <p
            className="font-display font-bold leading-none tracking-tight mt-4"
            style={{
              fontSize: "clamp(1.75rem, 6vw, 3.5rem)",
              color: "var(--accent-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            YADAV
          </p>
        </div>
      );
    }

    if (themeId === "paper-ink") {
      return (
        <h1
          className="text-5xl md:text-6xl tracking-wider leading-tight mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          THE AYUSH
          <br />
          YADAV
          <br />
          PORTFOLIO
        </h1>
      );
    }

    // Dark Luxe and Noir Cinema
    if (isNoirCinema) {
      return (
        <h1
          className="font-bold tracking-tighter mb-6 text-foreground"
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
      );
    }

    return (
      <h1
        className="text-6xl md:text-8xl font-light tracking-tight mb-4"
        style={{
          fontFamily: "var(--font-display)",
        }}
      >
        {personalInfo.name}
      </h1>
    );
  };

  return (
    <section
      ref={containerRef}
      className={`relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-background ${
        themeId === "paper-ink" ? "pt-32" : ""
      } ${isNeonCyber ? styles.cyberScanlines : ""}`}
      data-theme={themeId}
      style={{
        backgroundColor:
          themeId === "paper-ink"
            ? "#f5f1de"
            : themeId === "editorial"
            ? "#fefefe"
            : undefined,
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

      {/* Noir Cinema letterbox */}
      {isNoirCinema && (
        <>
          <div className="fixed top-0 left-0 right-0 h-12 md:h-20 bg-black z-40 flex items-center justify-center">
            <p className="text-xs text-gray-500 tracking-widest">FADE IN</p>
          </div>
          <div className="fixed bottom-0 left-0 right-0 h-12 md:h-20 bg-black z-40 flex items-center justify-center">
            <p className="text-xs text-gray-500 tracking-widest">END SCENE</p>
          </div>
        </>
      )}

      {/* Theme-specific background effects */}
      {renderParticles()}

      {themeId === "paper-ink" && (
        <div
          className="absolute inset-0 opacity-3 pointer-events-none"
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

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col ${
          isCenter ? "items-center justify-center text-center" : "items-start justify-center text-left"
        } px-4 md:px-8 max-w-4xl w-full`}
        style={{
          opacity: showContent ? 1 : 0,
          transition: prefersReducedMotion ? "none" : "opacity 0.5s ease-out 0.3s",
        }}
      >
        {themeId === "paper-ink" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
            <div className="md:col-span-2">
              {renderHeroName()}
            </div>
            <div className="border-l border-black pl-4">
              <p className="text-xs uppercase tracking-widest font-bold mb-2">Vol. 1 | Issue 1</p>
              <p className="text-xs md:text-sm mb-4">Oxford, Ohio<br />March 30, 2026</p>
              <p className="text-xs font-bold">Est. 2026</p>
            </div>
          </div>
        )}

        {themeId !== "paper-ink" && renderHeroName()}

        {/* Dividers and secondary content */}
        {themeId === "dark-luxe" && (
          <>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-accent-primary to-transparent mb-8" />
            <h2
              className="text-sm md:text-base tracking-widest uppercase mb-6 text-foreground-muted"
              style={{
                fontVariant: "small-caps",
                letterSpacing: "0.2em",
              }}
            >
              {personalInfo.title}
            </h2>
            <div className="h-px w-16 bg-accent-secondary mb-8" />
          </>
        )}

        {themeId === "editorial" && (
          <div
            className={`${styles.pullQuote} mb-8`}
            style={{
              animation: prefersReducedMotion ? "none" : undefined,
            }}
          >
            {personalInfo.tagline}
          </div>
        )}

        {themeId === "neon-cyber" && (
          <>
            <p
              className={`${styles.neonTextCyan} text-xs sm:text-sm tracking-widest mb-8`}
            >
              {/* SYSTEM.STATUS: ACTIVE */}
            </p>
            <div className="mb-12">
              <p
                className="text-base sm:text-lg tracking-wide"
                style={{
                  fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
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
                className="text-xs sm:text-sm mt-2"
                style={{
                  fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
                  color: "var(--neon-cyan)",
                  opacity: 0.8,
                }}
              >
                {personalInfo.tagline}
              </p>
            </div>
          </>
        )}

        {themeId === "noir-cinema" && (
          <>
            <div className="mb-12 md:mb-16">
              <p
                className="text-xs md:text-sm tracking-widest uppercase text-accent-primary"
                style={{ letterSpacing: "0.3em" }}
              >
                A PORTFOLIO PRODUCTION
              </p>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-accent-primary to-transparent mb-8 md:mb-12" />
            <h2
              className="text-base md:text-xl tracking-widest uppercase text-accent-primary mb-6"
              style={{
                fontFamily: "var(--font-body)",
                letterSpacing: "0.15em",
              }}
            >
              {personalInfo.title}
            </h2>
            <p
              className="text-sm md:text-lg text-foreground-muted max-w-2xl leading-relaxed mb-8"
              style={{
                fontFamily: "var(--font-body)",
                letterSpacing: "0.05em",
              }}
            >
              {personalInfo.tagline}
            </p>
            <div className="mt-12 md:mt-16 space-y-2">
              <p
                className="text-xs tracking-widest text-accent-primary"
                style={{ letterSpacing: "0.2em" }}
              >
                DIRECTED BY FATE
              </p>
              <p
                className="text-xs tracking-widest text-accent-primary"
                style={{ letterSpacing: "0.2em" }}
              >
                STARRING YOU
              </p>
            </div>
          </>
        )}

        {(themeId === "paper-ink" || themeId === "editorial") && (
          <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl">
            {personalInfo.tagline}
          </p>
        )}

        {/* CTA Buttons */}
        {(themeId === "dark-luxe" || themeId === "noir-cinema") && (
          <div className="flex flex-col sm:flex-row gap-6 mt-12">
            <a
              href="#projects"
              className={`px-8 py-3 border border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-background transition-all duration-300 text-sm tracking-widest uppercase ${
                themeId === "noir-cinema" ? "border-2" : ""
              }`}
            >
              {themeId === "noir-cinema" ? "Continue Feature" : "View Work"}
            </a>
            <a
              href={personalInfo.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-8 py-3 border text-accent-secondary hover:bg-accent-secondary hover:text-background transition-all duration-300 text-sm tracking-widest uppercase ${
                themeId === "noir-cinema"
                  ? "border-2 border-foreground text-foreground hover:bg-foreground"
                  : "border-accent-secondary"
              }`}
            >
              {themeId === "noir-cinema" ? "View Credits" : "Resume"}
            </a>
          </div>
        )}

        {themeId === "paper-ink" && (
          <div className="flex flex-col gap-4 mt-12">
            <h3 className="text-sm uppercase tracking-widest font-bold">In This Edition</h3>
            <a
              href="#projects"
              className="px-6 py-3 border-2 border-black hover:bg-black hover:text-[#f5f1de] transition-all duration-300 text-sm font-semibold tracking-wide w-fit"
            >
              Featured Work →
            </a>
            <a
              href={personalInfo.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border-2 border-black hover:bg-black hover:text-[#f5f1de] transition-all duration-300 text-sm font-semibold tracking-wide w-fit"
            >
              Full Resume →
            </a>
          </div>
        )}

        {themeId === "editorial" && (
          <div className="flex flex-col sm:flex-row gap-4 mt-12">
            <a
              href="#projects"
              className="px-6 py-3 border-2 border-black hover:bg-black hover:text-[#fefefe] transition-all duration-300 text-sm font-semibold tracking-wide"
            >
              Featured Work
            </a>
            <a
              href={personalInfo.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border-2 border-black hover:bg-black hover:text-[#fefefe] transition-all duration-300 text-sm font-semibold tracking-wide"
            >
              Full Resume
            </a>
          </div>
        )}

        {themeId === "neon-cyber" && (
          <p
            className="text-xs sm:text-sm mt-8"
            style={{
              fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
              color: "var(--neon-green)",
              opacity: 0.7,
            }}
          >
            {/* SCROLL TO CONTINUE INITIALIZATION */}
          </p>
        )}
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-12 z-10 flex flex-col items-center gap-3"
        style={{
          opacity: showContent ? 1 : 0,
          transition: prefersReducedMotion ? "none" : "opacity 1s ease-out 1.2s",
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
            className={themeId === "paper-ink" || themeId === "editorial" ? "text-black" : "text-accent-primary"}
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
            themeId === "paper-ink" || themeId === "editorial" ? "text-black" : "text-foreground-muted"
          }`}
        >
          {themeId === "paper-ink" ? "SCROLL" : "Scroll to explore"}
        </p>
      </div>
    </section>
  );
}
