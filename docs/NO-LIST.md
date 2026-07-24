# THE NO-LIST — patterns that must never appear in the new build

> Consolidated from: master plan Part 2.4 (banned list) · file-evidenced audit of the
> old portfolio (`~/Documents/Projects/Portfolio`, incl. its abandoned 5-theme system) ·
> the rejected magnetic-flow/elevator/rail iterations of Portfolio-2.0.
> **Any violation = automatic rubric fail for the step, regardless of score.**

## A. Master plan Part 2.4 (verbatim, absolute)

- Particle networks / constellation lines / starfields
- Floating blurred orbs & blobs
- Glassmorphism panels
- Holographic / 3D-tilt cards
- Magnetic buttons
- Text scramble & typewriter effects
- Terminal boot screens · Matrix rain / hacker cosplay
- AI purple→indigo mesh gradients
- Gradient text headlines
- Near-black + neon cyan console look
- Dotted-grid + radial spotlight hero
- Full-page bento
- Skill bars / percentages
- Lagging custom-cursor blobs
- Full-page scroll-snap or wheel-hijacking
- Pure #FFF / #000 sterility
- No hue-cycling beyond a ≤60° corridor · no purple anywhere · no glass · no glow

## B. Old-portfolio DNA (file-evidenced; never repeat)

**Color / background**
- Near-black indigo backgrounds (`#030014`, `#0a0a1a`, `#0a0a1f`)
- Violet `#8b5cf6` + cyan `#06b6d4` + pink `#f472b6` accent triad
- Violet→fuchsia→cyan gradient text; any `bg-clip-text text-transparent` headline
- Holographic hsl(280/200/340) gradients; rotating conic rainbow borders
- Canvas particle network; floating seeded particle dots
- Blurred gradient orbs (blur 80–120px)
- Mouse-following radial ambient glow
- Faint 50px grid overlay as hero texture

**Components / effects**
- ScrambleText / decrypt reveals · TypewriterText with blinking cursor
- ScrollReveal-style fade/slide/scale/blur entrance *wrapper* vocabulary
- MagneticButton (any magnetic pull) · CustomCursor (dot + glow ring, blend-difference)
- HoloCard / TiltCard (3D mouse tilt + glare) · GlassCard (backdrop-blur glass)
- Gradient-border-glow cards · shimmer sweeps · colored glow drop-shadows on hover
- Scrub-parallax hero fade-out (opacity+y+scale on scroll away)
- Animated count-up stat bars with glow · fake SVG waveform decoration
- Auto-rotating testimonial carousel with dot pagination

**Layout / copy tells**
- Bento grid (2-col + 1-col + full-width) · "Holographic Bento Dashboard" framing
- Skill proficiency bars with % (95/80/60/35) · emoji stat cards (📚⚡🚀)
- "Available for work" pulsing green `animate-ping` badge
- Bouncing scroll-down mouse indicator
- Floating glass nav that frosts/hides on scroll
- "Built with Next.js, Tailwind CSS & GSAP" footer credit
- Geist Sans + Geist Mono pairing (the old identity's type voice)

**Abandoned old themes (also DNA — never resurrect)**
- dark-luxe black & gold (`#0a0a0a` + `#e8c547`/`#d4af37`, Playfair)
- noir-cinema (`#0a0a0a` + `#c0a060`, Bebas Neue)
- neon-cyber HUD (`#050510` + `#00ff88`/`#ff006e`/`#00d4ff`, Orbitron)
- editorial high-fashion (`#ff4444` red/black/white, Instrument Serif)
- Multi-theme switcher via `data-theme` / next-themes
- **paper-ink newspaper** (`#f5f1de` cream + `#c00000` red, Playfair/Source Serif) — see §D

## C. Rejected in Portfolio-2.0 iterations (user said no)

- Wheel event listeners / `preventDefault` on scroll — in any form
- CSS scroll-snap page lock zones · full-page lock/snap of any kind
- "Pinned section theater" (pinning as default section behavior — plan allows exactly ONE pinned chapter, Ch 04)
- Top progress bar as a motion element (`ScrollProgress` is to be REMOVED, replaced by the chapter rail)
- Section rail with visible track, active capsule, hover label boxes, or cyan/inner glow
- Elevator seams / section sweep pseudo-elements / section box-shadow theater
- Magnetic scroll settling ("magnetic flow") — superseded entirely
- Cyan/sky accent as identity (`sky-300/400`, `cyan-300` on dark) — the current Atlas look being replaced

## D. Daylight-Study differentiation constraints (proximity risks)

The new warm-paper world is close in *spirit* to two existing things. It must stay
distinct on every axis:

1. **vs. the old abandoned paper-ink theme:** never a pure/newspaper red accent
   (kiln clay `#B04A28`/`#C4532E` is rust/orange-red — keep it there); never
   Playfair/Source Serif as display; no newspaper column/rule framing; the canvas
   is a *living day-arc*, never a static cream sheet.
2. **vs. daylightcomputer.com (`#FAF5F2`) and its imitators:** differentiation is
   carried by (a) the scroll-driven dawn→dusk arc — the canvas never sits still on
   one hex, (b) visible real paper grain (≤5% opacity but *present*), (c) the
   kiln-clay + pine two-accent system, (d) the Red Thread + Approval-Gate structure.
   A static screenshot of any chapter must not pass for a Daylight clone: grain
   visible, an accent or thread element present, Fraunces voice unmistakable.

## E. Engineering bans (from research + plan 3.9)

- No `ScrollTrigger.normalizeScroll(true)` alongside Lenis (they fight)
- No second rAF loop (Lenis `autoRaf` must be false; GSAP ticker is THE loop)
- No animating layout properties (top/left/width/height/margin) — transform/opacity/clip-path only; the thread's `stroke-dashoffset` is the sole sanctioned exception, mitigated by per-chapter segmentation
- No blur filters on mobile; hero de-blur is the only blur on the page (load-only)
- No `animation-timeline` for load-bearing behavior (Firefox still flagged) — decorative-only behind `@supports`
- No autoplay scrolling, no scroll hijack, no touch smoothing
