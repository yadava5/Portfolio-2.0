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
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
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
              className={`${styles.typewriter} mb-8 text-sm sm:text-base`}
              style={{ minHeight: "1.5em" }}
            >
              {typewriterText}
            </p>
          )}
          {showName && (
            <h1
              className="mb-4 leading-none font-bold tracking-tighter sm:mb-6"
              style={{
                fontSize: "clamp(2.5rem, 8vw, 5rem)",
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
          )}
        </>
      );
    }

    if (themeId === "editorial") {
      return (
        <div className="mb-6">
          <h1
            className="font-display overflow-hidden leading-none font-bold tracking-tighter"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 5rem)",
              color: "var(--foreground)",
              fontFamily: "var(--font-display)",
              transform: `scale(${scrollScale})`,
              transition: prefersReducedMotion
                ? "none"
                : "transform 0.1s ease-out",
              transformOrigin: "left top",
            }}
          >
            <span className={styles.dropCap}>
              {personalInfo.firstName.charAt(0)}
            </span>
            {personalInfo.firstName.slice(1)}
          </h1>
          <div
            className={`${styles.editorialRedLineAccent} max-w-xs`}
            style={{
              animation: prefersReducedMotion ? "none" : undefined,
            }}
          />
          <p
            className="font-display mt-4 leading-none font-bold tracking-tight"
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
          className="mb-4 text-5xl leading-tight tracking-wider md:text-6xl"
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
      );
    }

    return (
      <h1
        className="mb-4 text-6xl font-light tracking-tight md:text-8xl"
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
      className={`bg-background relative flex h-screen w-full flex-col items-center justify-center overflow-hidden ${
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
          <div className="fixed top-0 right-0 left-0 z-40 flex h-12 items-center justify-center bg-black md:h-20">
            <p className="text-xs tracking-widest text-gray-500">FADE IN</p>
          </div>
          <div className="fixed right-0 bottom-0 left-0 z-40 flex h-12 items-center justify-center bg-black md:h-20">
            <p className="text-xs tracking-widest text-gray-500">END SCENE</p>
          </div>
        </>
      )}

      {/* Theme-specific background effects */}
      {renderParticles()}

      {themeId === "paper-ink" && (
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

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col ${
          isCenter
            ? "items-center justify-center text-center"
            : "items-start justify-center text-left"
        } w-full max-w-4xl px-4 md:px-8`}
        style={{
          opacity: showContent ? 1 : 0,
          transition: prefersReducedMotion
            ? "none"
            : "opacity 0.5s ease-out 0.3s",
        }}
      >
        {themeId === "paper-ink" && (
          <div className="mb-8 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">{renderHeroName()}</div>
            <div className="border-l border-black pl-4">
              <p className="mb-2 text-xs font-bold tracking-widest uppercase">
                Vol. 1 | Issue 1
              </p>
              <p className="mb-4 text-xs md:text-sm">
                Oxford, Ohio
                <br />
                March 30, 2026
              </p>
              <p className="text-xs font-bold">Est. 2026</p>
            </div>
          </div>
        )}

        {themeId !== "paper-ink" && renderHeroName()}

        {/* Dividers and secondary content */}
        {themeId === "dark-luxe" && (
          <>
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
              className={`${styles.neonTextCyan} mb-8 text-xs tracking-widest sm:text-sm`}
            >
              {/* SYSTEM.STATUS: ACTIVE */}
            </p>
            <div className="mb-12">
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
            </div>
          </>
        )}

        {themeId === "noir-cinema" && (
          <>
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
          </>
        )}

        {(themeId === "paper-ink" || themeId === "editorial") && (
          <p className="max-w-2xl text-base leading-relaxed text-gray-700 md:text-lg">
            {personalInfo.tagline}
          </p>
        )}

        {/* CTA Buttons */}
        {(themeId === "dark-luxe" || themeId === "noir-cinema") && (
          <div className="mt-12 flex flex-col gap-6 sm:flex-row">
            <a
              href="#projects"
              className={`border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-background border px-8 py-3 text-sm tracking-widest uppercase transition-all duration-300 ${
                themeId === "noir-cinema" ? "border-2" : ""
              }`}
            >
              {themeId === "noir-cinema" ? "Continue Feature" : "View Work"}
            </a>
            <a
              href={personalInfo.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-accent-secondary hover:bg-accent-secondary hover:text-background border px-8 py-3 text-sm tracking-widest uppercase transition-all duration-300 ${
                themeId === "noir-cinema"
                  ? "border-foreground text-foreground hover:bg-foreground border-2"
                  : "border-accent-secondary"
              }`}
            >
              {themeId === "noir-cinema" ? "View Credits" : "Resume"}
            </a>
          </div>
        )}

        {themeId === "paper-ink" && (
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

        {themeId === "editorial" && (
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

        {themeId === "neon-cyber" && (
          <p
            className="mt-8 text-xs sm:text-sm"
            style={{
              fontFamily:
                "var(--font-jetbrains-mono, 'JetBrains Mono', monospace)",
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
              themeId === "paper-ink" || themeId === "editorial"
                ? "text-black"
                : "text-accent-primary"
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
            themeId === "paper-ink" || themeId === "editorial"
              ? "text-black"
              : "text-foreground-muted"
          }`}
        >
          {themeId === "paper-ink" ? "SCROLL" : "Scroll to explore"}
        </p>
      </div>
    </section>
  );
}
