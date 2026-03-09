# Themes Implementation Tracker

> This file is updated after every change. Check here before starting any work.
> Last updated: **2026-03-08**

---

## Current Branch: `feat/themes`

## Overall Progress

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 — Branch & Setup | ✅ Done | Branch created, deps installed, plan + tracker files created |
| Phase 1 — Theme Infrastructure | ✅ Done | CSS theme tokens, `next-themes` provider, and floating theme switcher shipped |
| Phase 2 — Color Migration | 🔲 Not Started | ~310 refs across 9 files |
| Phase 3 — Scroll Story Manager | 🔲 Not Started | Scroll progress context for storytelling |
| Phase 4 — 3D Theme Backgrounds | 🔲 Not Started | 6 scenes with scroll-driven storytelling |
| Phase 5 — Theme-Aware Elements | 🔲 Not Started | Interactive polish per theme |
| Phase 6 — Polish & Performance | 🔲 Not Started | Lazy loading, mobile fallbacks, a11y |

---

## Phase 0 — Branch & Setup

| Task | Status | Date |
|------|--------|------|
| Create `feat/themes` branch from `main` | ✅ | 2026-03-07 |
| Install `next-themes` ^0.4.6 | ✅ | 2026-03-07 |
| Install `three` ^0.183.2 | ✅ | 2026-03-07 |
| Install `@react-three/fiber` ^9.5.0 | ✅ | 2026-03-07 |
| Install `@react-three/drei` ^10.7.7 | ✅ | 2026-03-07 |
| Install `@react-three/postprocessing` ^3.0.4 | ✅ | 2026-03-07 |
| Install `@types/three` ^0.183.1 (dev) | ✅ | 2026-03-07 |
| Create `THEMES_PLAN.md` | ✅ | 2026-03-07 |
| Create `THEMES_TRACKER.md` | ✅ | 2026-03-07 |
| Initial commit on `feat/themes` | ✅ | 2026-03-07 |

---

## Phase 1 — Theme Infrastructure

| Task | Status | Date | Notes |
|------|--------|------|-------|
| Add expanded CSS variable tokens to `globals.css` | ✅ | 2026-03-08 | Added surface, card, gradient, glow, and status tokens |
| Map new vars to Tailwind tokens in `@theme inline {}` | ✅ | 2026-03-08 | Added color + gradient token mappings |
| Define `[data-theme="nebula"]` block (current defaults) | ✅ | 2026-03-08 | Mirrors the current default palette |
| Define `[data-theme="space"]` block | ✅ | 2026-03-08 | | 
| Define `[data-theme="lunar"]` block | ✅ | 2026-03-08 | |
| Define `[data-theme="cyberpunk"]` block | ✅ | 2026-03-08 | |
| Define `[data-theme="ocean"]` block | ✅ | 2026-03-08 | |
| Define `[data-theme="retrowave"]` block | ✅ | 2026-03-08 | |
| Rewrite `ThemeProvider.tsx` with `next-themes` | ✅ | 2026-03-08 | `attribute="data-theme"`, `defaultTheme="nebula"`, `storageKey="portfolio-theme"` |
| Create `ThemeSwitcher.tsx` | ✅ | 2026-03-08 | Floating palette button with 6 theme options |
| Wire `ThemeSwitcher` into `layout.tsx` | ✅ | 2026-03-08 | |
| Verify: themes switch, CSS vars update | ✅ | 2026-03-08 | Theme switcher writes `data-theme` via `next-themes`; all palette vars now resolve per theme block |
| Verify: `npm run build` passes | ✅ | 2026-03-08 | Build passed after Phase 1 implementation |

---

## Phase 2 — Color Migration

| File | ~Refs | Status | Date | Notes |
|------|-------|--------|------|-------|
| `About.tsx` | ~80 | 🔲 | | Highest count — `text-white/*`, `bg-violet-*`, SVG hex |
| `Projects.tsx` | ~55 | 🔲 | | `CATEGORY_COLORS` map needs migration |
| `Experience.tsx` | ~45 | 🔲 | | |
| `Contact.tsx` | ~42 | 🔲 | | |
| `Skills.tsx` | ~35 | 🔲 | | `LEVEL_CONFIG` gradients need migration |
| `Testimonials.tsx` | ~32 | 🔲 | | |
| `HoloCard.tsx` | ~11 | 🔲 | | Conic-gradient hex codes |
| `Hero.tsx` | ~8 | 🔲 | | Nearly ready already |
| `ScrambleText.tsx` | ~1 | 🔲 | | |
| `TiltCard.tsx` | ~1 | 🔲 | | |

**DO NOT TOUCH:** `projects.ts` brand colors (~40 hex codes)

---

## Phase 3 — Scroll Story Manager

| Task | Status | Date | Notes |
|------|--------|------|-------|
| Create `ScrollStoryManager.tsx` | 🔲 | | Context provider tracking scroll position |
| Create `useStoryProgress()` hook | 🔲 | | Returns `{ progress, activeSection, sectionProgress }` |
| Integrate with Lenis scroll events | 🔲 | | |
| Wrap main content in `<ScrollStoryProvider>` | 🔲 | | |
| Verify: progress values correct per section | 🔲 | | |

---

## Phase 4 — 3D Theme Backgrounds

| Component | Status | Date | Story Verified | Notes |
|-----------|--------|------|----------------|-------|
| `ThemeBackground.tsx` (scene switcher) | 🔲 | | N/A | Lazy loads scenes by active theme |
| `NebulaScene.tsx` | 🔲 | | 🔲 | "Birth of a Star" — wraps existing ParticlesBg + scroll narrative |
| `SpaceScene.tsx` | 🔲 | | 🔲 | "Voyage Through the Cosmos" — Stars, meteors, asteroids |
| `LunarScene.tsx` | 🔲 | | 🔲 | "The Apollo Mission" — Moon, astronaut, Earthrise |
| `CyberpunkScene.tsx` | 🔲 | | 🔲 | "Entering the Grid" — Neon grid, rain, data streams |
| `OceanScene.tsx` | 🔲 | | 🔲 | "Descent into the Abyss" — Caustics, bio-glow, jellyfish |
| `RetrowaveScene.tsx` | 🔲 | | 🔲 | "Driving Into the Sunset" — Grid road, chrome sun, palms |

### 3D Element Components

| Element | Status | Used In |
|---------|--------|---------|
| `Asteroid.tsx` | 🔲 | Space |
| `Meteor.tsx` | 🔲 | Space |
| `Moon.tsx` | 🔲 | Lunar |
| `Astronaut.tsx` | 🔲 | Lunar |
| `NeonGrid.tsx` | 🔲 | Cyberpunk, Retrowave |
| `BioParticles.tsx` | 🔲 | Ocean |
| `Jellyfish.tsx` | 🔲 | Ocean |
| `ChromeSun.tsx` | 🔲 | Retrowave |

---

## Phase 5 — Theme-Aware Interactive Elements

| Task | Status | Date | Notes |
|------|--------|------|-------|
| Verify cards/panels adapt via CSS vars | 🔲 | | Auto after Phase 2 |
| Section heading gradients adapt | 🔲 | | |
| Button hovers/glows adapt | 🔲 | | |
| Cyberpunk: glitch micro-interaction | 🔲 | | Optional |
| Ocean: ripple micro-interaction | 🔲 | | Optional |
| Retrowave: scanline overlay on cards | 🔲 | | Optional |

---

## Phase 6 — Polish & Performance

| Task | Status | Date | Notes |
|------|--------|------|-------|
| Lazy loading per scene (React.lazy) | 🔲 | | Only active scene loaded |
| Mobile perf: reduce 3D on low-end | 🔲 | | `hardwareConcurrency` check |
| `prefers-reduced-motion` fallback | 🔲 | | Static gradient bg per theme |
| Theme transition animation (~500ms) | 🔲 | | Cross-fade |
| SSR: dynamic import `ssr: false` | 🔲 | | Three.js components |
| `npm run build` passes | 🔲 | | |
| Lighthouse audit (all themes) | 🔲 | | Target <10pt drop |
| Desktop layout regression check | 🔲 | | Nebula must match current exactly |
| Mobile layout regression check | 🔲 | | Projects order, etc. |

---

## Known Issues / Blockers

| Issue | Status | Notes |
|-------|--------|-------|
| About section particle hydration mismatch in local/dev preview | ✅ Resolved 2026-03-08 | Stabilized inline style serialization in `About.tsx` to avoid SSR/client mismatch |
| Cursor halo / About ambient glow lagged and felt detached from the pointer | ✅ Resolved 2026-03-08 | Replaced full-section glow repaint in `About.tsx` and tightened `CustomCursor` follow timings |

---

## Change Log

| Date | Changes | Files Modified |
|------|---------|---------------|
| 2026-03-07 | Phase 0: Created `feat/themes` branch, installed 6 deps, created plan & tracker docs | `package.json`, `package-lock.json`, `THEMES_PLAN.md`, `THEMES_TRACKER.md` |
| 2026-03-08 | Phase 1 complete: added multi-theme CSS tokens and theme blocks, switched to `next-themes`, created floating `ThemeSwitcher`, verified production build | `src/app/globals.css`, `src/app/layout.tsx`, `src/components/layout/ThemeProvider.tsx`, `src/components/layout/ThemeSwitcher.tsx`, `src/lib/themes.ts`, `THEMES_TRACKER.md` |
| 2026-03-08 | Fixed About section hydration mismatch by normalizing floating particle inline style values and animation properties | `src/components/sections/About.tsx`, `THEMES_TRACKER.md` |
| 2026-03-08 | Fixed laggy cursor halo behavior by switching About to a GSAP-positioned ambient glow element and making `CustomCursor` follow more responsively | `src/components/sections/About.tsx`, `src/components/layout/CustomCursor.tsx`, `THEMES_TRACKER.md` |
