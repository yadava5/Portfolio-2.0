/**
 * @fileoverview About section with immersive interactive design
 *
 * Features:
 * - Mouse-tracking ambient glow that follows the cursor
 * - 3D perspective tilt cards on hover
 * - Animated gradient-border cards with glow effect
 * - Floating background particles
 * - Animated stat counters with SVG rings
 * - Interactive coursework with expand/collapse
 * - Dean's List integrated into education card
 */

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  GraduationCap,
  MapPin,
  Calendar,
  BookOpen,
  ChevronDown,
  Database,
  Code2,
  Brain,
  Award,
} from "lucide-react";

import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { personalInfo, education, awards } from "@/lib/data/personal";
import { formatDate } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ──────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────── */

/** 3D perspective tilt card — tilts towards mouse on hover */
function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateXToRef = useRef<((value: number) => gsap.core.Tween) | null>(
    null
  );
  const rotateYToRef = useRef<((value: number) => gsap.core.Tween) | null>(
    null
  );
  const scaleToRef = useRef<((value: number) => gsap.core.Tween) | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.set(card, {
      transformPerspective: 900,
      transformStyle: "preserve-3d",
      rotationX: 0,
      rotationY: 0,
      scale: 1,
    });

    rotateXToRef.current = gsap.quickTo(card, "rotationX", {
      duration: 0.18,
      ease: "power3.out",
    });
    rotateYToRef.current = gsap.quickTo(card, "rotationY", {
      duration: 0.18,
      ease: "power3.out",
    });
    scaleToRef.current = gsap.quickTo(card, "scale", {
      duration: 0.2,
      ease: "power2.out",
    });

    return () => {
      rotateXToRef.current = null;
      rotateYToRef.current = null;
      scaleToRef.current = null;
      gsap.killTweensOf(card);
    };
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      const rotateXTo = rotateXToRef.current;
      const rotateYTo = rotateYToRef.current;
      const scaleTo = scaleToRef.current;
      if (!card || !rotateXTo || !rotateYTo || !scaleTo) return;

      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      rotateXTo(py * -12);
      rotateYTo(px * 12);
      scaleTo(1.015);
    },
    []
  );

  const handlePointerLeave = useCallback(() => {
    const card = cardRef.current;
    const rotateXTo = rotateXToRef.current;
    const rotateYTo = rotateYToRef.current;
    const scaleTo = scaleToRef.current;
    if (!card || !rotateXTo || !rotateYTo || !scaleTo) return;

    rotateXTo(0);
    rotateYTo(0);
    scaleTo(1);
  }, []);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

/** Card with animated gradient border glow */
function GradientBorderCard({
  children,
  className = "",
  borderClassName = "from-violet-500/40 via-fuchsia-500/40 to-cyan-500/40",
}: {
  children: ReactNode;
  className?: string;
  borderClassName?: string;
}) {
  return (
    <div className={`group relative ${className}`}>
      <div
        className={`absolute -inset-px rounded-2xl bg-linear-to-r ${borderClassName} opacity-50 blur-[1px] transition-opacity duration-500 group-hover:opacity-100`}
      />
      <div className="relative rounded-2xl border border-white/6 bg-[#0a0a1f]/80 backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
}

/** Deterministic pseudo-random from seed */
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/** Floating ambient particles (deterministic for purity) */
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  size: seededRandom(i * 7 + 1) * 3 + 1,
  x: seededRandom(i * 7 + 2) * 100,
  y: seededRandom(i * 7 + 3) * 100,
  dur: seededRandom(i * 7 + 4) * 20 + 15,
  del: seededRandom(i * 7 + 5) * 10,
  op: seededRandom(i * 7 + 6) * 0.3 + 0.05,
}));

/** Match SSR/client style serialization to avoid hydration mismatches. */
function formatStyleNumber(value: number): string {
  return value.toFixed(6).replace(/\.?0+$/, "");
}

function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-violet-400"
          style={{
            width: `${formatStyleNumber(p.size)}px`,
            height: `${formatStyleNumber(p.size)}px`,
            left: `${formatStyleNumber(p.x)}%`,
            top: `${formatStyleNumber(p.y)}%`,
            opacity: formatStyleNumber(p.op),
            animationName: "aboutFloat",
            animationDuration: `${formatStyleNumber(p.dur)}s`,
            animationTimingFunction: "ease-in-out",
            animationDelay: `${formatStyleNumber(p.del)}s`,
            animationIterationCount: "infinite",
            animationDirection: "alternate",
          }}
        />
      ))}
    </div>
  );
}

/** Animated horizontal bar stat with GSAP counter */
function StatBar({
  value,
  maxValue,
  label,
  gradientFrom,
  gradientTo,
}: {
  value: number;
  maxValue: number;
  label: string;
  gradientFrom: string;
  gradientTo: string;
}) {
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);
  const fill = Math.min(value / maxValue, 1);

  useEffect(() => {
    if (!countRef.current || !barRef.current || triggered.current) return;
    const el = countRef.current;
    const bar = barRef.current;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { textContent: 0 },
        {
          textContent: value,
          duration: 2,
          ease: "power2.out",
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
            onEnter: () => {
              triggered.current = true;
            },
          },
        }
      );
      gsap.fromTo(
        bar,
        { width: "0%" },
        {
          width: `${fill * 100}%`,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: bar,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });
    return () => ctx.revert();
  }, [value, fill]);

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-end justify-between">
        <span className="text-xs font-medium tracking-wide text-white/50">
          {label}
        </span>
        <span className="flex items-baseline gap-0.5">
          <span ref={countRef} className="text-3xl font-bold text-white">
            0
          </span>
          {value >= 5 && (
            <span className="text-sm font-semibold text-white/50">+</span>
          )}
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/6">
        <div
          ref={barRef}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: "0%",
            background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`,
            boxShadow: `0 0 12px ${gradientFrom}60, 0 0 4px ${gradientFrom}40`,
          }}
        />
        {/* Gridline ticks */}
        {[...Array(maxValue)].map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-px bg-white/6"
            style={{ left: `${((i + 1) / maxValue) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Animated SVG pulse waveform — decorative data visualization */
function PulseWave() {
  return (
    <div className="relative h-24 w-full overflow-hidden rounded-lg">
      {/* Faint grid backdrop */}
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        {[...Array(6)].map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={`${(i + 1) * (100 / 7)}%`}
            x2="100%"
            y2={`${(i + 1) * (100 / 7)}%`}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1"
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <line
            key={`v${i}`}
            x1={`${(i + 1) * (100 / 9)}%`}
            y1="0"
            x2={`${(i + 1) * (100 / 9)}%`}
            y2="100%"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Animated wave lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="wave-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
            <stop offset="20%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#c084fc" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wave-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0" />
            <stop offset="20%" stopColor="#f472b6" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#fb7185" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wave-fill-1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Fill area under primary wave */}
        <path
          d="M0,70 C30,55 60,30 100,40 C140,50 160,65 200,45 C240,25 270,35 300,50 C330,65 360,40 400,55 L400,100 L0,100 Z"
          fill="url(#wave-fill-1)"
        >
          <animate
            attributeName="d"
            dur="6s"
            repeatCount="indefinite"
            values="
              M0,70 C30,55 60,30 100,40 C140,50 160,65 200,45 C240,25 270,35 300,50 C330,65 360,40 400,55 L400,100 L0,100 Z;
              M0,60 C30,45 60,50 100,35 C140,20 160,55 200,50 C240,45 270,25 300,40 C330,55 360,35 400,45 L400,100 L0,100 Z;
              M0,70 C30,55 60,30 100,40 C140,50 160,65 200,45 C240,25 270,35 300,50 C330,65 360,40 400,55 L400,100 L0,100 Z
            "
          />
        </path>

        {/* Primary wave line */}
        <path
          d="M0,70 C30,55 60,30 100,40 C140,50 160,65 200,45 C240,25 270,35 300,50 C330,65 360,40 400,55"
          stroke="url(#wave-grad-1)"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <animate
            attributeName="d"
            dur="6s"
            repeatCount="indefinite"
            values="
              M0,70 C30,55 60,30 100,40 C140,50 160,65 200,45 C240,25 270,35 300,50 C330,65 360,40 400,55;
              M0,60 C30,45 60,50 100,35 C140,20 160,55 200,50 C240,45 270,25 300,40 C330,55 360,35 400,45;
              M0,70 C30,55 60,30 100,40 C140,50 160,65 200,45 C240,25 270,35 300,50 C330,65 360,40 400,55
            "
          />
        </path>

        {/* Secondary (pink) wave line */}
        <path
          d="M0,55 C40,70 80,50 120,60 C160,70 200,40 240,55 C280,70 320,50 360,60 C380,65 400,55 400,55"
          stroke="url(#wave-grad-2)"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <animate
            attributeName="d"
            dur="8s"
            repeatCount="indefinite"
            values="
              M0,55 C40,70 80,50 120,60 C160,70 200,40 240,55 C280,70 320,50 360,60 C380,65 400,55;
              M0,65 C40,50 80,60 120,45 C160,55 200,70 240,60 C280,45 320,65 360,50 C380,55 400,60;
              M0,55 C40,70 80,50 120,60 C160,70 200,40 240,55 C280,70 320,50 360,60 C380,65 400,55
            "
          />
        </path>

        {/* Accent dots on wave intersections */}
        <circle r="3" fill="#8b5cf6" opacity="0.7">
          <animate
            attributeName="cx"
            dur="6s"
            repeatCount="indefinite"
            values="200;200;200"
          />
          <animate
            attributeName="cy"
            dur="6s"
            repeatCount="indefinite"
            values="45;50;45"
          />
        </circle>
        <circle r="2" fill="#f472b6" opacity="0.5">
          <animate
            attributeName="cx"
            dur="8s"
            repeatCount="indefinite"
            values="120;120;120"
          />
          <animate
            attributeName="cy"
            dur="8s"
            repeatCount="indefinite"
            values="60;45;60"
          />
        </circle>
      </svg>

      {/* Glow at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-linear-to-t from-violet-500/4 to-transparent" />
    </div>
  );
}

/** Coursework grid with expandable descriptions */
function CourseworkGrid({
  coursework,
  expandedCourse,
  setExpandedCourse,
}: {
  coursework: string[];
  expandedCourse: number | null;
  setExpandedCourse: (idx: number | null) => void;
}) {
  const groups: {
    label: string;
    borderColor: string;
    badgeBg: string;
    badgeText: string;
    courses: { code: string; name: string; desc: string; idx: number }[];
  }[] = [
    {
      label: "Computer Science",
      borderColor: "border-violet-500/20",
      badgeBg: "bg-violet-500/15",
      badgeText: "text-violet-300",
      courses: [],
    },
    {
      label: "Mathematics",
      borderColor: "border-cyan-500/20",
      badgeBg: "bg-cyan-500/15",
      badgeText: "text-cyan-300",
      courses: [],
    },
    {
      label: "Statistics",
      borderColor: "border-amber-500/20",
      badgeBg: "bg-amber-500/15",
      badgeText: "text-amber-300",
      courses: [],
    },
  ];

  coursework.forEach((c, i) => {
    const [code, ...rest] = c.split(" \u2013 ");
    const fullDesc = rest.join(" \u2013 ");
    const colonIdx = fullDesc.indexOf(":");
    const name = colonIdx > -1 ? fullDesc.slice(0, colonIdx) : fullDesc;
    const desc = colonIdx > -1 ? fullDesc.slice(colonIdx + 2) : "";
    const prefix = code.split(" ")[0];
    const groupIdx = prefix === "CSE" ? 0 : prefix === "MTH" ? 1 : 2;
    groups[groupIdx].courses.push({ code, name, desc, idx: i });
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {groups.map((group) => (
        <div
          key={group.label}
          className={`rounded-xl border ${group.borderColor} bg-white/1.5 p-3 transition-colors duration-300 hover:bg-white/3`}
        >
          <span
            className={`mb-2.5 inline-block rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${group.badgeBg} ${group.badgeText}`}
          >
            {group.label}
          </span>
          <div className="space-y-0.5">
            {group.courses.map((course) => (
              <button
                key={course.idx}
                onClick={() =>
                  setExpandedCourse(
                    expandedCourse === course.idx ? null : course.idx
                  )
                }
                className="group/course w-full text-left"
              >
                <div className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-white/4">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 font-mono text-[11px] font-semibold text-white/65">
                      {course.code}
                    </span>
                    <span className="truncate text-xs text-white/45">
                      {course.name}
                    </span>
                  </div>
                  {course.desc && (
                    <ChevronDown
                      className={`h-3 w-3 shrink-0 text-white/25 transition-transform duration-200 ${expandedCourse === course.idx ? "rotate-180" : ""}`}
                    />
                  )}
                </div>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${expandedCourse === course.idx && course.desc ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-2 pt-0.5 pb-1 text-[11px] leading-relaxed text-white/35">
                      {course.desc}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────── */

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);

  // Mouse-tracking ambient glow
  useEffect(() => {
    const section = sectionRef.current;
    const glow = glowRef.current;
    if (!section || !glow) return;

    const xTo = gsap.quickTo(glow, "x", {
      duration: 0.18,
      ease: "power3.out",
    });
    const yTo = gsap.quickTo(glow, "y", {
      duration: 0.18,
      ease: "power3.out",
    });

    const showGlow = () => {
      gsap.to(glow, {
        opacity: 1,
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const hideGlow = () => {
      gsap.to(glow, {
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handleMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      xTo(x);
      yTo(y);
    };

    section.addEventListener("mouseenter", showGlow);
    section.addEventListener("mousemove", handleMove);
    section.addEventListener("mouseleave", hideGlow);

    return () => {
      section.removeEventListener("mouseenter", showGlow);
      section.removeEventListener("mousemove", handleMove);
      section.removeEventListener("mouseleave", hideGlow);
    };
  }, []);

  const currentEducation = education[0];

  // Gather Dean's List semesters into one compact line
  const deansListDates = awards
    .filter((a) => a.name === "Dean's List")
    .map((a) => formatDate(a.date))
    .join(", ");

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen overflow-hidden py-24 md:py-32"
    >
      {/* Mouse-following ambient glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute top-0 left-0 z-0 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.16) 0%, rgba(6,182,212,0.08) 35%, transparent 70%)",
        }}
      />

      {/* Floating particles */}
      <FloatingParticles />

      <div className="relative z-10 container mx-auto max-w-6xl px-4">
        {/* Section header */}
        <ScrollReveal variant="slide-up" className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            About{" "}
            <span className="bg-linear-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Me
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            {personalInfo.tagline}
          </p>
        </ScrollReveal>

        {/* Grid layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Bio card — 2 cols */}
          <ScrollReveal
            variant="slide-up"
            delay={0.1}
            className="lg:col-span-2"
          >
            <TiltCard>
              <GradientBorderCard>
                <div className="relative p-6 md:p-8">
                  <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-violet-600/[0.07] blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-fuchsia-600/[0.07] blur-3xl" />

                  <div className="relative">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 ring-1 ring-violet-500/20">
                        <MapPin className="h-5 w-5 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {personalInfo.name}
                        </h3>
                        <p className="text-sm text-white/50">
                          {personalInfo.location}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {personalInfo.bio.map((paragraph, index) => (
                        <p
                          key={index}
                          className="text-[15px] leading-relaxed text-white/55"
                        >
                          {paragraph.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                            i % 2 === 1 ? (
                              <span
                                key={i}
                                className="font-semibold text-white/90"
                              >
                                {part}
                              </span>
                            ) : (
                              <span key={i}>{part}</span>
                            )
                          )}
                        </p>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {[
                        {
                          icon: Database,
                          label: "Data Engineering",
                          color:
                            "text-cyan-400 bg-cyan-500/10 border-cyan-500/25 hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]",
                        },
                        {
                          icon: Brain,
                          label: "Machine Learning",
                          color:
                            "text-violet-400 bg-violet-500/10 border-violet-500/25 hover:bg-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
                        },
                        {
                          icon: Code2,
                          label: "Full-Stack Dev",
                          color:
                            "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/25 hover:bg-fuchsia-500/20 hover:shadow-[0_0_20px_rgba(217,70,239,0.15)]",
                        },
                      ].map((focus) => (
                        <span
                          key={focus.label}
                          className={`inline-flex cursor-default items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${focus.color}`}
                        >
                          <focus.icon className="h-3.5 w-3.5" />
                          {focus.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GradientBorderCard>
            </TiltCard>
          </ScrollReveal>

          {/* Stats card — 1 col */}
          <ScrollReveal variant="slide-left" delay={0.2}>
            <TiltCard className="h-full">
              <GradientBorderCard
                className="h-full"
                borderClassName="from-cyan-500/30 via-violet-500/30 to-pink-500/30"
              >
                <div className="flex h-full flex-col justify-between p-6 py-8">
                  <div className="space-y-8">
                    <StatBar
                      value={9}
                      maxValue={10}
                      label="Projects Built"
                      gradientFrom="#8b5cf6"
                      gradientTo="#c084fc"
                    />
                    <StatBar
                      value={5}
                      maxValue={8}
                      label="Years Learning"
                      gradientFrom="#f472b6"
                      gradientTo="#fb7185"
                    />
                  </div>

                  {/* Decorative wave graphic */}
                  <div className="mt-6">
                    <PulseWave />
                  </div>
                </div>
              </GradientBorderCard>
            </TiltCard>
          </ScrollReveal>

          {/* Education card — full width */}
          <ScrollReveal
            variant="slide-up"
            delay={0.3}
            className="lg:col-span-3"
          >
            <TiltCard>
              <GradientBorderCard borderClassName="from-fuchsia-500/40 via-violet-500/40 to-cyan-500/40">
                <div className="p-6 md:p-8">
                  <div className="mb-1 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/20 ring-1 ring-fuchsia-500/20">
                        <GraduationCap className="h-5 w-5 text-fuchsia-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {currentEducation?.school}
                        </h3>
                        <p className="text-sm text-violet-400">
                          {currentEducation?.degree} in{" "}
                          {currentEducation?.field}
                        </p>
                      </div>
                    </div>

                    {currentEducation && (
                      <div className="flex flex-col items-start gap-1 sm:items-end">
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {formatDate(currentEducation.startDate)} &mdash;{" "}
                            {formatDate(currentEducation.endDate)}
                          </span>
                        </div>
                        {deansListDates && (
                          <div className="flex items-center gap-1.5 text-xs text-amber-400/80">
                            <Award className="h-3 w-3" />
                            <span>Dean&apos;s List ({deansListDates})</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {currentEducation && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-white/35 uppercase">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Key Coursework</span>
                      </div>
                      <CourseworkGrid
                        coursework={currentEducation.coursework}
                        expandedCourse={expandedCourse}
                        setExpandedCourse={setExpandedCourse}
                      />
                    </div>
                  )}
                </div>
              </GradientBorderCard>
            </TiltCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
