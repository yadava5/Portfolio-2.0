# Multi-Theme Portfolio — Implementation Plan

> **For any AI agent or developer starting work on this feature:**
> Before writing a single line of code, you MUST complete the Pre-Work Checklist below.

---

## Pre-Work Checklist (MANDATORY)

Before implementing any phase or feature:

1. **Read the codebase structure** — Run `find src/ -type f` and understand the component hierarchy.
2. **Read these critical files fully:**
   - `src/app/globals.css` — CSS variable system, animations, `@theme inline` block
   - `src/app/layout.tsx` — Provider wrappers, font loading, body structure
   - `src/app/page.tsx` — Section composition order
   - `src/components/layout/ThemeProvider.tsx` — Current (no-op) theme provider
   - `src/components/ui/ParticlesBg.tsx` — Existing particle background (canvas-based)
   - `src/components/sections/Hero.tsx` — Where background is rendered
   - `src/lib/data/projects.ts` — Tech brand colors (DO NOT theme these)
3. **Read `THEMES_TRACKER.md`** — Check what's already done, what's in progress.
4. **Read `package.json`** — Verify dependencies are installed.
5. **Run `npm run build`** — Confirm the project builds cleanly before making changes.
6. **Check git status** — Confirm you're on `feat/themes` branch. Never push to `main` directly.
7. **Understand the color audit:**
   - ~10 files are already theme-ready (use CSS variables)
   - ~9 files have ~310 hardcoded color references that need migration
   - Tech brand colors in `projects.ts` (~40 hex codes for Python blue, React cyan, etc.) stay hardcoded intentionally
8. **Review the storytelling scroll narrative** (Section 7 below) to understand how backgrounds must evolve per-section.

### Key Constraints
- **DO NOT break desktop layout** — Desktop is considered complete and good.
- **Dark mode only** — There is no light mode. All 6 themes are dark-based with different accent palettes.
- **Preserve mobile fixes** — Projects list before preview on mobile, etc.
- **Static export** — Site deploys to GitHub Pages via `next export`. No server-side features.
- **Performance** — Lazy-load 3D scenes. Respect `prefers-reduced-motion`. Degrade on mobile.

---

## 1. Architecture Overview

### Theme System
- `next-themes` manages theme state via `data-theme` attribute on `<html>`
- Each theme is a `[data-theme="name"]` CSS block overriding CSS custom properties
- Components use Tailwind tokens mapped to CSS vars (via `@theme inline {}`)
- 3D backgrounds are per-theme, code-split via `React.lazy`

### Component Hierarchy (Post-Implementation)
```
<html data-theme="nebula|space|lunar|cyberpunk|ocean|retrowave">
  <body>
    <ThemeProvider>              ← next-themes provider
      <SmoothScroll>             ← Lenis
        <ThemeBackground />      ← lazy-loaded 3D scene (fixed, z:-10)
        <CustomCursor />
        <Header />
        <main>
          <Hero />
          <About />
          <Experience />
          <Projects />
          <Skills />
          <Testimonials />
          <Contact />
        </main>
        <Footer />
        <ThemeSwitcher />        ← floating button (fixed, z:50)
      </SmoothScroll>
    </ThemeProvider>
  </body>
</html>
```

### Files Already Theme-Ready (zero changes needed)
These use CSS variables exclusively — they'll adapt automatically once themes are defined:
- `Header.tsx` — `text-foreground`, `bg-(--glass-background)`, etc.
- `Footer.tsx` — `text-foreground`, CSS var tokens throughout
- `GlassCard.tsx` — 100% CSS vars
- `CustomCursor.tsx` — `bg-foreground`, `var(--holo-gradient)`
- `SmoothScroll.tsx` — No colors (behavior only)
- `MagneticButton.tsx` (both copies) — No colors
- `ScrollReveal.tsx` — No colors
- `TypewriterText.tsx` — Uses `bg-current` (inherits)
- `ParticlesBg.tsx` — Dynamic HSL from `baseHue` prop

### Files Needing Color Migration (~310 hardcoded refs)
| File | ~Refs | Key Patterns |
|------|-------|-------------|
| `About.tsx` | ~80 | `text-white/*`, `bg-white/*`, `bg/text-violet-*`, hex in SVGs |
| `Projects.tsx` | ~55 | Same + `CATEGORY_COLORS` map, `bg-[#0a0a0f]` |
| `Experience.tsx` | ~45 | `text-white/*`, `text/bg-violet-*`, `text/bg-emerald-*` |
| `Contact.tsx` | ~42 | `text-white/*`, gradients, shadows |
| `Skills.tsx` | ~35 | `LEVEL_CONFIG` gradients, `text-white/*` |
| `Testimonials.tsx` | ~32 | `text-white/*`, gradients |
| `HoloCard.tsx` | ~11 | Conic-gradient hex codes |
| `Hero.tsx` | ~8 | Availability dot, hover states |
| `ScrambleText.tsx` + `TiltCard.tsx` | ~2 | One-liner each |

**DO NOT TOUCH:** Tech brand colors in `projects.ts` (~40 hex codes) — these are brand-accurate.

### New Files to Create
```
src/components/
  layout/
    ThemeSwitcher.tsx            ← floating palette button + theme picker
  themes/
    index.ts                     ← barrel export
    ThemeBackground.tsx          ← switches 3D scene by active theme
    ScrollStoryManager.tsx       ← scroll progress tracker for storytelling
    scenes/
      NebulaScene.tsx            ← wraps existing ParticlesBg
      SpaceScene.tsx             ← stars + meteors + asteroids
      LunarScene.tsx             ← moon + astronaut + dust
      CyberpunkScene.tsx         ← neon grid + rain + glitch
      OceanScene.tsx             ← deep sea + bioluminescence
      RetrowaveScene.tsx         ← grid floor + chrome sun
    elements/
      Asteroid.tsx               ← reusable 3D asteroid mesh
      Meteor.tsx                 ← shooting star with trail
      Moon.tsx                   ← textured moon sphere
      Astronaut.tsx              ← floating astronaut
      NeonGrid.tsx               ← perspective neon floor
      BioParticles.tsx           ← bioluminescent floating orbs
      ChromeSun.tsx              ← retrowave horizon sun
      Jellyfish.tsx              ← ocean floating jellyfish
```

---

## 2. Dependencies

| Package | Purpose | Version Installed |
|---------|---------|-------------------|
| `next-themes` | SSR-safe theme switching, localStorage persistence | ^0.4.6 |
| `three` | 3D rendering engine | ^0.183.2 |
| `@react-three/fiber` | React renderer for Three.js | ^9.5.0 |
| `@react-three/drei` | Stars, Float, Text3D, helpers | ^10.7.7 |
| `@react-three/postprocessing` | Bloom, glow effects | ^3.0.4 |
| `@types/three` | TypeScript types (dev) | ^0.183.1 |

---

## 3. Theme Palettes

### Nebula (Default — current look)
| Token | Value | Notes |
|-------|-------|-------|
| `--background` | `#030014` | Deep dark purple-black |
| `--background-secondary` | `#0a0a1a` | Slightly lighter |
| `--foreground` | `#f0f0f5` | Near-white |
| `--foreground-muted` | `#a0a0b0` | Muted text |
| `--accent-primary` | `#8b5cf6` | Violet |
| `--accent-secondary` | `#06b6d4` | Cyan |
| `--accent-tertiary` | `#f472b6` | Pink |
| `--accent-gradient` | violet → purple → fuchsia | |
| `--glow-color` | `rgba(139, 92, 246, 0.3)` | Violet glow |

### Space / Cosmos
| Token | Value | Notes |
|-------|-------|-------|
| `--background` | `#000008` | Near-black |
| `--background-secondary` | `#080818` | Midnight blue hint |
| `--foreground` | `#e8eaf0` | Cool white |
| `--foreground-muted` | `#8890a0` | Steel muted |
| `--accent-primary` | `#a8c8ff` | Ice blue-white |
| `--accent-secondary` | `#c0c0d0` | Silver |
| `--accent-tertiary` | `#4fc3f7` | Light blue |
| `--accent-gradient` | silver → ice-blue → white | |
| `--glow-color` | `rgba(168, 200, 255, 0.2)` | Starlight glow |

### Lunar / Apollo
| Token | Value | Notes |
|-------|-------|-------|
| `--background` | `#1a1008` | Warm dark brown |
| `--background-secondary` | `#241a0e` | Warm darker |
| `--foreground` | `#fff3e0` | Warm white |
| `--foreground-muted` | `#b0a090` | Warm muted |
| `--accent-primary` | `#ff9800` | Orange |
| `--accent-secondary` | `#fff3e0` | Warm white |
| `--accent-tertiary` | `#ffc107` | Gold |
| `--accent-gradient` | orange → gold → warm-white | |
| `--glow-color` | `rgba(255, 152, 0, 0.25)` | Moon glow |

### Cyberpunk / Neon
| Token | Value | Notes |
|-------|-------|-------|
| `--background` | `#0a000a` | Dark magenta-black |
| `--background-secondary` | `#12001a` | Deep magenta |
| `--foreground` | `#e0ffe0` | Greenish white |
| `--foreground-muted` | `#80a080` | Muted green |
| `--accent-primary` | `#00ff41` | Neon green |
| `--accent-secondary` | `#ff006e` | Hot pink |
| `--accent-tertiary` | `#00d4ff` | Electric blue |
| `--accent-gradient` | neon-green → electric-blue → hot-pink | |
| `--glow-color` | `rgba(0, 255, 65, 0.2)` | Neon glow |

### Ocean / Abyss
| Token | Value | Notes |
|-------|-------|-------|
| `--background` | `#001020` | Deep ocean dark |
| `--background-secondary` | `#001830` | Deep blue |
| `--foreground` | `#e0f4f4` | Pale aqua |
| `--foreground-muted` | `#7098a0` | Sea muted |
| `--accent-primary` | `#00bcd4` | Teal |
| `--accent-secondary` | `#7affcb` | Bioluminescent green |
| `--accent-tertiary` | `#ff6b6b` | Coral |
| `--accent-gradient` | teal → bioluminescent → coral | |
| `--glow-color` | `rgba(0, 188, 212, 0.2)` | Underwater glow |

### Retrowave / Synthwave
| Token | Value | Notes |
|-------|-------|-------|
| `--background` | `#1a0030` | Deep purple |
| `--background-secondary` | `#240040` | Rich purple |
| `--foreground` | `#ffe4f0` | Pink-tinted white |
| `--foreground-muted` | `#b080a0` | Mauve muted |
| `--accent-primary` | `#ff2d95` | Hot pink |
| `--accent-secondary` | `#b026ff` | Electric purple |
| `--accent-tertiary` | `#ffe14d` | Chrome yellow |
| `--accent-gradient` | hot-pink → purple → chrome-yellow | |
| `--glow-color` | `rgba(255, 45, 149, 0.25)` | Neon pink glow |

---

## 4. CSS Variable Expansion

New tokens to add (beyond what currently exists) so that hardcoded colors can be replaced:

```css
/* Surface colors (replacing bg-white/5, bg-white/8, bg-white/10, etc.) */
--surface-1: rgba(255, 255, 255, 0.03);  /* lightest surface */
--surface-2: rgba(255, 255, 255, 0.05);
--surface-3: rgba(255, 255, 255, 0.08);
--surface-4: rgba(255, 255, 255, 0.10);

/* Card backgrounds (replacing #0a0a1f, #0a0a0f, etc.) */
--card-bg: #0a0a1f;
--card-bg-solid: #0a0a0f;

/* Accent gradient stops */
--accent-gradient-from: var(--accent-primary);
--accent-gradient-via: /* theme-specific middle color */;
--accent-gradient-to: var(--accent-tertiary);

/* Glow / shadow */
--glow-color: /* theme-specific rgba */;
--glow-strong: /* more opaque version */;

/* Status colors (semantic — for availability dot, success states, etc.) */
--status-success: #22c55e;
--status-warning: #f59e0b;
--status-info: #3b82f6;

/* Holo gradient (per-theme holographic) */
--holo-gradient: /* theme-specific multi-stop gradient */;
```

---

## 5. Color Migration Rules

When replacing hardcoded colors, follow these mappings:

| Hardcoded Pattern | Replace With | Notes |
|-------------------|-------------|-------|
| `text-white` | `text-foreground` | |
| `text-white/90` | `text-foreground/90` | Keep opacity |
| `text-white/80` | `text-foreground/80` | |
| `text-white/70` | `text-foreground/70` | |
| `text-white/60` | `text-foreground-muted` | Close enough |
| `text-white/50` | `text-foreground-muted` | |
| `text-white/40` | `text-foreground-muted/70` | |
| `text-white/35` | `text-foreground-muted/60` | |
| `bg-white/3` | `bg-(--surface-1)` | |
| `bg-white/5` | `bg-(--surface-2)` | |
| `bg-white/6` | `bg-(--surface-2)` | |
| `bg-white/8` | `bg-(--surface-3)` | |
| `bg-white/10` | `bg-(--surface-4)` | |
| `border-white/5` | `border-(--surface-2)` | |
| `border-white/8` | `border-(--surface-3)` | |
| `border-white/10` | `border-(--surface-4)` | |
| `text-violet-300/400/500` | `text-accent-primary` | |
| `bg-violet-400/500` | `bg-accent-primary` | |
| `border-violet-500` | `border-accent-primary` | |
| `shadow-violet-500/30` | `shadow-(--glow-color)` | |
| `ring-violet-*` | `ring-accent-primary` | |
| `text-cyan-300/400` | `text-accent-secondary` | |
| `bg-cyan-500` | `bg-accent-secondary` | |
| `text-fuchsia-400` | `text-accent-tertiary` | |
| `bg-fuchsia-500` | `bg-accent-tertiary` | |
| `text-pink-400` | `text-accent-tertiary` | |
| `from-violet-400/500` | `from-accent-primary` | Gradient |
| `via-purple-400` | `via-(--accent-gradient-via)` | Gradient |
| `to-fuchsia-400/500` | `to-accent-tertiary` | Gradient |
| `from-cyan-500` | `from-accent-secondary` | Gradient |
| `bg-[#0a0a1f]` | `bg-(--card-bg)` | |
| `bg-[#0a0a0f]` | `bg-(--card-bg-solid)` | |
| `#8b5cf6` (inline) | `var(--accent-primary)` | In style attrs |
| `#06b6d4` (inline) | `var(--accent-secondary)` | In style attrs |
| `#f472b6` (inline) | `var(--accent-tertiary)` | In style attrs |
| `rgba(139,92,246,*)` | `var(--glow-color)` | In style attrs |
| `text-emerald-*` | `text-(--status-success)` | Semantic |
| `bg-emerald-*` | `bg-(--status-success)` | Semantic |
| `text-amber-*` | `text-(--status-warning)` | Semantic |
| `bg-green-400/500` | `bg-(--status-success)` | Availability dot |

---

## 6. Implementation Phases

### Phase 0 — Branch & Setup ✅
- Create `feat/themes` branch
- Install dependencies
- Create this plan file and tracker file

### Phase 1 — Theme Infrastructure
1. Expand CSS variable palette in `globals.css` with all new tokens from Section 4
2. Define 6 `[data-theme="..."]` blocks in `globals.css` with palettes from Section 3
3. Map new CSS vars to Tailwind tokens in `@theme inline {}`
4. Rewrite `ThemeProvider.tsx` to use `next-themes` with `attribute="data-theme"`, `defaultTheme="nebula"`, `storageKey="portfolio-theme"`
5. Create `ThemeSwitcher.tsx` — floating button (bottom-right), palette icon from lucide-react, dropdown with color-dot previews and theme names
6. Wire `<ThemeSwitcher />` into `layout.tsx`
7. Test: switching themes updates CSS variables across the page

### Phase 2 — Color Migration
Systematically replace ~310 hardcoded color references using the mapping in Section 5. Work file-by-file. After each file:
- Run `npm run build` to verify no breakage
- Visually confirm the Nebula (default) theme looks identical to before
- Switch themes to verify other palettes apply correctly

Order: About → Projects → Experience → Contact → Skills → Testimonials → HoloCard → Hero → ScrambleText → TiltCard

### Phase 3 — Scroll Story Manager
1. Create `ScrollStoryManager.tsx` — uses Lenis scroll events or `IntersectionObserver` to track which section is active and compute normalized scroll progress (0→1)
2. Create and expose a React context: `useStoryProgress()` returning `{ progress: number, activeSection: string, sectionProgress: number }`
3. Each 3D scene consumes this context to drive its narrative timeline
4. Wrap the main content with `<ScrollStoryProvider>`

### Phase 4 — 3D Theme Backgrounds
1. Create `ThemeBackground.tsx` — reads active theme from `next-themes`, lazy-loads correct scene via `React.lazy` + `Suspense`
2. Implement all 6 scenes following the storytelling narratives in Section 7
3. Each scene:
   - Accepts `storyProgress` from `useStoryProgress()`
   - Maps progress to its 7-chapter narrative
   - Animates elements in/out based on which chapter is active
   - Uses `useFrame` for per-frame updates tied to scroll progress
4. Replace `<ParticlesBg>` in Hero with `<ThemeBackground />`
5. Ensure each scene has the `"use client"` directive and is dynamically imported with `ssr: false`

### Phase 5 — Theme-Aware Interactive Elements
1. Verify cards/panels/buttons adapt automatically via CSS variable migration
2. Test section heading gradients across all themes
3. Optional per-theme micro-interactions:
   - Cyberpunk: glitch effect on section transitions
   - Ocean: ripple effect on button clicks
   - Retrowave: scanline overlay on cards

### Phase 6 — Polish & Performance
1. Lazy loading — only active theme's scene is loaded (code-split bundles)
2. Mobile performance — on `navigator.hardwareConcurrency <= 4`, reduce particle counts, disable postprocessing bloom, simplify geometries; optionally fall back to 2D canvas
3. `prefers-reduced-motion` — disable 3D scenes entirely, show static gradient background per theme
4. Theme transition animation — cross-fade backgrounds over ~500ms when switching
5. SSR — all Three.js components must use `"use client"` + dynamic import with `ssr: false`
6. Final validation: `npm run build` passes, static export works, GitHub Pages deploy succeeds

---

## 7. Storytelling Scroll Narratives

Each theme has a **story arc** that unfolds as the user scrolls through the 7 portfolio sections. Background elements, 3D objects, and ambient effects evolve section-by-section to create a cinematic journey. The `ScrollStoryManager` component tracks normalized scroll progress (0→1) across the page and feeds it to the active scene.

### Section-to-Chapter Mapping

| Section | Story Role | Scroll % |
|---------|-----------|----------|
| **Hero** | Chapter 1 — The Opening | 0–14% |
| **About** | Chapter 2 — Origin Story | 14–28% |
| **Experience** | Chapter 3 — The Journey | 28–43% |
| **Projects** | Chapter 4 — The Work | 43–57% |
| **Skills** | Chapter 5 — Arsenal / Powers | 57–71% |
| **Testimonials** | Chapter 6 — Allies / Voices | 71–86% |
| **Contact** | Chapter 7 — The Call / Destination | 86–100% |

---

### 🌌 Nebula — "Birth of a Star"

A journey through a stellar nursery, from cold dark space to the ignition of a new star.

| Section | Background State | Key Elements |
|---------|-----------------|-------------|
| **Hero** | Cold, dark void. Sparse dim particles barely visible. A faint distant glow hints at something forming. | Few particles, low opacity, dark. Subtle purple haze at edges. |
| **About** | Gas clouds begin to gather. Particles multiply and drift inward. Faint violet/pink wisps appear. | Particle count increases. Translucent nebula wisps fade in. Gentle swirling motion. |
| **Experience** | The nebula thickens. Ribbons of color (violet, cyan, pink) streak across the background. Particles orbit a central region. | Dense particle field. Colored gas ribbons animate. Slight gravitational pull toward center. |
| **Projects** | Energy builds. Brighter flashes pulse through the gas. Particles accelerate. The core begins to glow hot. | Particle brightness increases. Pulse flashes. Core glow intensifies. |
| **Skills** | Ignition. A bright core blazes to life. The surrounding gas illuminates with full color. Particles radiate outward. | Central star glow at peak. Particles explode outward. Full-spectrum nebula colors. |
| **Testimonials** | The new star shines steadily. Surrounding gas forms beautiful illuminated patterns. Calm, majestic. | Steady warm glow. Elegant gas patterns. Particles settle into gentle orbit. |
| **Contact** | Pull back to reveal the full nebula — the star nestled in a cosmic cloud. Peaceful, vast, complete. | Wide view. Full nebula visible. Star pulses gently. Particles drift slowly. |

---

### 🚀 Space — "Voyage Through the Cosmos"

An interstellar journey — launching from a quiet orbit, traversing asteroid fields, navigating meteor showers, reaching a distant galaxy.

| Section | Background State | Key Elements |
|---------|-----------------|-------------|
| **Hero** | Quiet orbit above Earth. Dense star field. Earth's blue glow visible at bottom edge. Stillness before the voyage. | Star field (drei `<Stars>`), faint blue atmospheric glow at bottom, 1–2 distant satellites. |
| **About** | Departure. Stars begin to streak as speed increases. Earth shrinks behind. A few distant objects appear. | Stars start slow parallax drift. Subtle speed lines. Earth glow fades. |
| **Experience** | Deep space transit. Stars dense and bright. First asteroids appear — small, distant, tumbling slowly. | 2–3 small asteroids enter from edges. Slow tumble. Star density peaks. |
| **Projects** | The asteroid field. Multiple asteroids at various depths, sizes, and rotations. Dodging through the field. | 5–7 asteroids, parallax depth layers. Some pass close (large), others far (small). Slight shake. |
| **Skills** | Meteor shower. Bright streaks cut across the star field. Asteroids thin out. Energy and motion peak. | Meteor streaks at random intervals (2–4 visible). Bright trails with bloom. Remaining asteroids drift away. |
| **Testimonials** | A distant galaxy comes into view — a spiral of light. Meteors fade. Quiet awe. | Spiral galaxy glow appears. Stars calm. Serene. |
| **Contact** | Arrival. The galaxy fills more of the view. Stars surround you. End of the voyage — an invitation to connect. | Galaxy prominent. Gentle shimmer. Star field steady. Warm distant glow. |

---

### 🌙 Lunar — "The Apollo Mission"

An Apollo-style moon mission — from launch to moonwalk to the iconic Earthrise.

| Section | Background State | Key Elements |
|---------|-----------------|-------------|
| **Hero** | Launch pad at night. Warm orange launch glow from below. Dust and heat particles rising. Stars above. | Bottom-up orange gradient (engine glow). Rising dust particles. Faint stars above. Rocket exhaust wisps. |
| **About** | Ascent through atmosphere. Orange glow transitions to the blackness of space. The moon appears small but bright. | Gradient shifts orange-at-bottom to black. Moon sphere appears small, top-right. Exhaust trail fading. |
| **Experience** | Coasting through space toward the moon. The moon grows larger. Earth visible behind — blue marble shrinking. | Moon sphere grows (scale tied to scroll). Earth (small blue dot) in opposite corner. Sparse dust. |
| **Projects** | Lunar orbit. The moon is large — surface craters visible. Orbiting around it. Warm directional light. | Moon fills significant portion. Surface detail (bump map). Orange light. Slow orbit rotation. |
| **Skills** | Descent & Landing. The lunar surface stretches below — dusty, grey-orange. Dust kicked up on scroll. | Moon surface plane. Dust particles kicked up. Bootprint hint. Flag element. |
| **Testimonials** | The moonwalk. Astronaut silhouette floating gently. Earthrise on the horizon. Golden light. | Astronaut silhouette with `<Float>`. Earth on horizon. Warm ambient gold light. |
| **Contact** | Earthrise. Earth rising over the lunar horizon. Iconic. Warm orange-gold. Message: reach out across the void. | Earth sphere above lunar horizon line. Full warm glow. Gentle dust. Calm, iconic. |

---

### ⚡ Cyberpunk — "Entering the Grid"

Approaching and entering a neon-drenched cyberpunk city, diving deeper until you reach the raw code beneath.

| Section | Background State | Key Elements |
|---------|-----------------|-------------|
| **Hero** | Outskirts. Dark horizon. Distant city glow (neon green/pink). Empty neon grid floor. Rain begins. | Perspective grid floor (wireframe), distant neon glow on horizon. First rain drops. Scanline overlay. |
| **About** | Approach. Grid scrolls toward you. Neon signs flicker in the distance. Rain intensifies. | Grid scrolls faster. 2–3 floating neon shapes. Rain density increases. |
| **Experience** | City entrance. Neon structures on both sides. Vertical light bars. Glitch effects. Data streams appear. | Neon bar structures left/right. Matrix-style data rain. Occasional glitch flicker. |
| **Projects** | Deep city. Maximum neon density. Holographic panels float. Circuit-board patterns. | Peak neon density. Floating holographic rectangles. Circuit-trace patterns. Bloom max. |
| **Skills** | The core. Mainframe reached. Concentric data rings rotate. Code fragments swirl. Raw energy. | Rotating data rings. Code-like particle text. Intense glow. Electric arcs. |
| **Testimonials** | Decryption. Calm returns. Clean data flows replace chaos. Neon settles into steady patterns. | Steady neon lines. Clean data streams. Glitch stops. Calm but electric. |
| **Contact** | The terminal. Single blinking cursor on dark screen. Neon grid fades to minimal. Jack in. | Minimal. Single blinking neon cursor. Faint grid lines. Rain light. Clean. |

---

### 🌊 Ocean — "Descent into the Abyss"

A deep-sea dive from sunlit surface waters to the bioluminescent abyss, discovering wonders at each depth.

| Section | Background State | Key Elements |
|---------|-----------------|-------------|
| **Hero** | Surface. Dappled sunlight through water. Caustic patterns. Light blue-green. Bubbles rising. | Caustic light patterns (animated). Light teal tint. Bubble particles. Gentle wave distortion. |
| **About** | Shallow dive. Light dims. Small fish silhouettes. Coral hints at edges. Deeper blue. | Color shifts deeper blue. Fish silhouettes. Coral forms at edges. Caustics dimmer. |
| **Experience** | Twilight zone. Significantly darker. First bioluminescent organisms — faint glowing dots. Jellyfish drifts by. | Dark blue-black. First bio-glow particles (cyan/green). One jellyfish floats slowly. Caustics gone. |
| **Projects** | The deep. Nearly black water. More bioluminescent creatures — pulsing, glowing. Schools of particles. | Near-black. Pulsing bio-particles. Jellyfish ×2–3. Distant lure light. Rich bioluminescence. |
| **Skills** | The abyss. Total darkness except for stunning bioluminescent displays. Hydrothermal vent glow below. | Maximum bioluminescence. Pulsing rhythms. Hydrothermal vent glow (orange from below). Peak wonder. |
| **Testimonials** | A calm grotto. Gentle bioluminescent walls. The deepest point — a place of reflection. | Gentle ambient glow. Bio-walls. Calm particle drift. Serene. |
| **Contact** | The treasure. A glowing formation at the ocean floor — warm light. An invitation from the depths. | Central warm glow. Bio-particles orbit gently. Floor visible. Mysterious but inviting. |

---

### 🌆 Retrowave — "Driving Into the Sunset"

An 80s synthwave road trip — driving toward an infinite sunset horizon, through neon landscapes.

| Section | Background State | Key Elements |
|---------|-----------------|-------------|
| **Hero** | The highway begins. Perspective grid road to the horizon. A massive chrome sun — hot pink to purple. Empty, vast. | Grid floor scrolling. Large chrome sun (horizontal scanlines). Mountain silhouettes at horizon. |
| **About** | Accelerating. Grid scrolls faster. Palm tree silhouettes at sides. Sun colors intensify. Light streaks. | Faster grid scroll. Palm silhouettes (parallax). Sun glow intensifies. Horizontal light streaks. |
| **Experience** | The strip. Neon signs alongside the road. Building silhouettes. Purple mountains in background. | Neon sign shapes at sides. Building outlines. Mountain silhouettes with purple glow. |
| **Projects** | Peak cruise. Maximum visual intensity. Sun huge, blazing. Chrome reflections. Light beams radiate. | Sun at max size. Radiating light beams. Chrome particle reflections. Peak saturation. |
| **Skills** | Power surge. Electric energy lines from the road. Grid pulses with color. Stars appear as night falls. | Grid pulses with color waves. Electric arcs. Stars emerge in upper sky. Energetic. |
| **Testimonials** | Twilight. Sun dips below horizon. Sky transitions to deep purple. Stars multiply. Neon signs brighter. | Sun half-below. Sky purple-to-black. Stars dense. Neon brighter (contrast). Nostalgic. |
| **Contact** | Night. Chrome sun gone but afterglow remains — thin pink line. Stars fill the sky. Road continues forever. | Thin horizon glow line. Full starfield. Grid continues. Calm. Continue the journey. |

---

## 8. Verification Checklist

- [ ] All 6 themes switch correctly via the floating button
- [ ] Every section's text, cards, buttons, gradients, glows match the active theme palette
- [ ] Desktop layout is pixel-identical to current for Nebula (default)
- [ ] Storytelling scroll narrative works — elements evolve per section
- [ ] Mobile: 3D scenes degrade gracefully; layout unbroken
- [ ] Theme persists across page refresh (localStorage)
- [ ] `prefers-reduced-motion` shows static fallback
- [ ] `npm run build` succeeds; static export works for GitHub Pages
- [ ] Lighthouse performance score drops no more than 10 points
- [ ] No regressions in: Projects mobile order, Testimonials display, Contact mailto, Resume download
