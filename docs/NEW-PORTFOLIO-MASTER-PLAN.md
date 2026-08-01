# NEW PORTFOLIO — MASTER PLAN (Handoff for Claude Code)

> **This document is the single source of truth for the rebuild.** It contains the audit of the current site, everything to remove, the banned list, and the complete new concept — narrative, palette, typography, backgrounds, interactions, copy, and build phases. All research, brainstorming, and decisions were completed before this file; Claude Code's job is execution.

---

# PART 1 — AUDIT: WHERE WE ARE

## 1.1 Current state (Portfolio-2.0, "Technical Operations Atlas")

Overall **74/100** across four independent audits: Visual 72 · Content 74 · Technical 80 · Recruiter 72.

Strengths to preserve (as content and discipline, not as design):
- Evidence-led case-study data layer (`projectCaseStudies.ts` — problem/constraints/architecture/decisions/validation/outcomes) is genuinely strong. Keep the *content*, reformat the presentation.
- Testing/CI/a11y rigor (~20 Playwright specs, axe, perf budgets). Keep and extend.
- Honest disclosure system (`imageKind`, `imageDisclosure`, `proofManifest`). Keep the honesty principle.

## 1.2 What is WRONG (verified in code)

1. **The design is generic and static.** Dark near-black + cyan accent + mono labels = every dev portfolio. Only two subtle CSS animations exist on the live surface. No storytelling, no flow, no memorable moment.
2. **The old-portfolio DNA repeated itself.** The previous portfolio (`Projects/Portfolio`) already used ParticlesBg, GlassCard, HoloCard, TiltCard, ScrambleText, TypewriterText, MagneticButton — and Portfolio-2.0 (plus our first showcase attempt) drifted back to that same vocabulary. Both are dead ends.
3. **Vanity metrics headline the page.** "18,403 AutoML ledger events", "738 tests", "71 iOS tests", "19/20" mean nothing to a recruiter. Zero user/business/time-saved impact anywhere.
4. **Positioning sprawls** across data + ML + full-stack + HPC + iOS with no single "hire me for X".
5. **Nothing is runnable or visible.** Diagrams instead of screenshots; no live demos; test counts instead of outcomes.
6. **~700 LOC of dead code**: 14 unused components in `src/components/effects/` (an abandoned purple "nebula" design).
7. **Fonts are a self-inflicted perf wound**: 8 Google font families via render-blocking CSS `@import`, no preconnect — while `layout.tsx:96` *falsely claims* fonts use `next/font/google`.
8. **Multi-MB unoptimized images** (2 MB portrait = LCP element; 1.7 MB poster).
9. **Low-contrast text** (`zinc-500/600` on `#080908`) likely fails WCAG AA; mobile hides the entire right-column proof visual (`hidden md:flex`).
10. **Weak entries dilute the ladder**: Paid Internships (freshman ENG109 site), Aramark experience entry, LinkedIn `endorsements: 2/3/1` counts in `skills.ts`.
11. **No JSON-LD structured data; `github.io/Portfolio-2.0` URL** reads student-project.

---

# PART 2 — REMOVE / CLEAN / KEEP

## 2.1 DELETE outright
- `src/components/effects/` — all 14 unused components (GlassCard, NebulaCard, GlitchBurst, WarpTransition, ParallaxDepthWrapper, FluidDistortionWrapper, NeonBorder, TerminalRevealWrapper, TypewriterText, TextReveal, SnapScrollWrapper, HorizontalScrollWrapper, FloatingEntry, MagneticButton) + any re-exports.
- All 8 Google-font `@import` lines in `globals.css` (replaced by `next/font` self-hosting; see Part 4).
- `endorsements` fields in `src/lib/data/skills.ts` (replace with project-provenance: "used in: AutoML, JobTracker").
- The "18,403 ledger events" hero metric and all raw test-count headline metrics.
- The false font docblock in `layout.tsx` (line ~96 and header comment).
- Legacy theme machinery no longer rendered (ThemeOrchestrator indirection, THEMES_* plans) — archive, don't ship.

## 2.2 DEMOTE / HIDE
- `paid-internships` project → `portfolioVisible: false`.
- Aramark → fold into a single "earlier roles" line, or cut.
- DataFest / LifeQuest / TaskFlow / job-automator → quiet "more experiments" index only.

## 2.3 KEEP (as raw material)
- All case-study content (rewrite per copy rules in Part 5).
- Proof manifest + disclosure system (honesty is a brand asset).
- Playwright/axe/CI infrastructure (extend to the new build).
- Real numbers: macro-F1 0.9791, 3.5× SIMD speedup, 1M+ records ETL, 19/20 cited-source sweep, 38ms on-device latency, 7-phase gated lifecycle.

## 2.4 THE BANNED LIST (never appears in the new build)
Particle networks / constellation lines / starfields · floating blurred orbs & blobs · glassmorphism panels · holographic/3D-tilt cards · magnetic buttons · text scramble & typewriter effects · terminal boot screens · Matrix rain / hacker cosplay · AI purple→indigo mesh gradients · gradient text headlines · near-black + neon cyan console look · dotted-grid + radial spotlight hero · full-page bento · skill bars/percentages · lagging custom-cursor blobs · full-page scroll-snap or wheel-hijacking · pure #FFF/#000 sterility.

---

# PART 3 — THE NEW CONCEPT

## 3.1 One sentence

**The portfolio is one continuous story — a pipeline run where the recruiter is the human-in-the-loop, and the ending is the approval gate: him.**

Thesis line for the whole site: *"A model is only as good as the human who approves it."*

## 3.2 Identity & positioning
- One identity: **ML engineer who builds agentic systems with a human hand on every gate.**
- AutoML capstone = flagship · JobTracker + PolicyBot = corroboration · Fast MNIST (C++/SIMD) + Visual Assist (LiDAR a11y) = depth.
- Feeling while scrolling: **calm, flowing, wonderful** — "this is beautiful", not "this is flashy".

## 3.3 The world (visual system)
A **warm-paper editorial world whose light changes like a day** as you scroll — maximum distance from both his old dark sites and every AI-purple template:

- **Layer 0 (fixed):** a soft light-field — radial "sun" gradient over the canvas color, plus fine grain (≤5% opacity). Background color + sun position interpolate through a dawn→dusk arc across the chapters (oklch interpolation, scroll-driven).
- **Layer 1 (fixed, 4–6% opacity):** faint graph-paper/contour texture; ink-on-paper by day, chalk-on-dusk at night.
- **Layer 2 (per chapter, in-flow):** self-drawing SVG schematics in his real motifs (pipeline routes, approval-gate diagrams, embedding contours, the C++ net as drafted wireframe, LiDAR topographic contours) + 2–3 flat-isometric SVG dioramas as signature set-pieces. Anchored parallax only (0.85–1.0×), never floaty.
- **The Red Thread (master motif):** ONE continuous SVG path draws itself down the entire page, connecting every chapter — a faint dashed "future" path visible ahead, solid ink filling behind as you scroll (two-path technique, `pathLength=1`, scroll-scrubbed `stroke-dashoffset`, scrub 0.5–1). The thread IS the pipeline; chapter nodes fill as it passes; it terminates at the final approval gate.

## 3.4 Palette — "Daylight Study" (exact tokens)

| Role | Hex | Contrast |
|---|---|---|
| Canvas (day) | `#FAF6EF` | — |
| Surface 1 / 2 | `#F3EDE1` / `#EAE2D2` | — |
| Ink (text) | `#26231C` | 13.9:1 ✓ |
| Secondary text | `#5C564A` | 6.2:1 ✓ |
| Primary accent — kiln clay | `#B04A28` (text) / `#C4532E` (graphic) | 5.1:1 ✓ |
| Support accent — pine | `#2F5D50` | 7.0:1 ✓ (links, approved gates, strokes) |
| Pass / Fail | `#2E6B4F` / `#A03B23` | 6.1 / 6.0 ✓ (+ icons) |

**Background day-arc waypoints (by chapter):** 01 dawn `#FBF3E7` → 02 morning `#FAF6EF` → 03 noon `#F6F3EA` → 04 warm afternoon `#F5EDDC` → 05 golden hour `#F2E4C9` → 06 **dusk flip** `#43372F` (ink flips to `#F6EFE2`, 12.8:1) → 07 nightfall `#2C2622` with clay lightened to `#E08A5F` (6.4:1 ✓). Verify AA at every waypoint AND mid-interpolation; snap nav ink between two pre-verified values at the dusk boundary.

**Anti-list:** no hue-cycling beyond a ≤60° corridor; no purple anywhere; no glass; no glow.

## 3.5 Typography — "Warm Editorial" (exact system)
- **Display:** Fraunces (variable; wght/opsz/SOFT/WONK). Hero at high opsz (144), SOFT 40–60, WONK 0; exactly one accent word per headline may take WONK 1 or italic.
- **Prose:** Newsreader (+ true italic as the warm annotation voice).
- **Labels:** Fragment Mono — lowercase only, small, +0.04–0.06em tracked, muted. Never all-caps shouting.
- All via `next/font`, self-hosted, variable.

| Level | Size | Weight | Tracking | Leading |
|---|---|---|---|---|
| Hero | `clamp(3.25rem, 8.5vw, 7.5rem)` | Light 340–380 | −0.02em | 1.02–1.08 |
| Chapter headline | `clamp(2rem, 5vw, 4rem)` | 400–450 | −0.015em | 1.1 |
| Muted pair-line | same size, muted color/italic (never smaller) | | | |
| Body | 18–20px, max 55ch | 400 | 0 | 1.6–1.7 |
| Mono labels | 12–14px | 400 | +0.05em | 1.4 |

## 3.6 Chapter structure (the storyboard — ~1,400–1,600vh total)

| # | Chapter | Message | Mechanic | ~vh |
|---|---|---|---|---|
| 01 | **Arrival** | Name + identity + scroll cue; red thread originates under his name | Calm hero; de-blur + line-rise entrance (the ONLY blur on the page). No pin. | 100 |
| 02 | **Who** | New grad; agentic systems + human oversight; what he cares about | Plain reading section, masked line-by-line rises; thread draws alongside. One scroll-scrubbed manifesto moment (word-by-word opacity 0.25→1). | 120 |
| 03 | **The Path** | Miami ITSM data work; education | Thread becomes the timeline spine; rows light as the line reaches each node; sibling rows dim on hover. | 150–200 |
| 04 | **AutoML** (flagship) | "The agent drafts the whole pipeline. / Nothing runs until a human says go." | **The ONLY pinned chapter**: sticky diorama + 3–4 scrolling text steps (Pudding pattern), ending in an interactive demo beat (scrub the pipeline stages; approval-gate interaction). Enter via clip-path arch reveal (used once). | 300 |
| 05 | **Projects II–IV** | JobTracker, Fast MNIST, Visual Assist | NOT pinned. Editorial list rows → drawer expansion with inline demo (short video scrub or micro-interactive); cursor-following image preview on hover. ~120vh each. | 250–350 |
| 06 | **How I work** | Values: evals, human-in-the-loop, craft | **Dusk flip** (the one inverted break). Short manifesto lines, one per ~60vh; thread crosses the boundary unbroken. | 150 |
| 07 | **The Approval Gate** (ending) | The thread arrives at a final gate node — the recruiter approves the run | Giant name as the thread's terminal flourish; warm CTA; availability + local time. Background completes its arc. | 150–200 |

**Pacing rules:** one pinned chapter only; alternate spectacle↔prose; normalize scroll budget (~80–100vh per pinned beat); one idea per viewport; persistent exit (contact always reachable). **Wayfinding:** left-edge chapter rail `01–07` (small caps + current chapter name), same progress source as the thread; click = smooth anchor scroll.

## 3.7 Interaction vocabulary (the ONLY hover/transition moves)
Hovers (pick consistently, 2–3 sitewide): underline draw (250ms ease-out) · sibling dimming (others → 0.35 opacity) · cursor-following image preview (project list only, lerp 0.1) · row drawer expansion (grid-template-rows 0fr→1fr) · clip-path image zoom (1.0→1.06, 600ms expo-out) · color-fill sweep on pills (pseudo-element transform) · text swap-up on links · thread-node glow with label · arrow nudge 4–6px.

Transitions: background color morph (everywhere, scrubbed) · exit-parallax hand-off (default seam; out 1.1×, in 0.9×) · clip-path arch reveal (once, into Ch 04) · dusk flip (once, Ch 05→06) · shared-element continuity (a project's output node feeds the thread into the next) · sticky card stack allowed for Ch 05 only if scale delta ≤0.95, no rotation.

## 3.8 Text animation spec
- Hero: de-blur (8px→0) + 14px rise per line, 1.0s expo.out, 110ms stagger — on load, once. Blur NOWHERE else; disable blur filters on mobile.
- Chapter bright line: line-mask rise 0.8s quart.out at 75% viewport, once. Muted line: fade + 10px rise, 200ms later, 0.7s cubic.out.
- Body: whole-block fade + 16px rise, 0.6s — never per-char on paragraphs.
- One scrubbed manifesto (Ch 02) word-by-word; ending litany line-masks with slowing stagger; final line gets the page's only WONK=1.
- Optional: Fraunces weight breathing (340→400, ±60 max) on section titles, scroll-linked.
- ≤40–60 words per scene; sentences <20 words.

## 3.9 Scroll feel
Lenis `lerp: 0.08`, `smoothWheel: true`, `wheelMultiplier: 1`, touch smoothing OFF; programmatic scrolls duration 1.2 expo-out. Single rAF loop (`lenis.on('scroll', ScrollTrigger.update)`). Scrub 0.5–1 everywhere. Animate only transform/opacity/clip-path. Never: wheel-delta override, page-wide snap, autoplay scroll. `prefers-reduced-motion`: kill Lenis + scrubs; thread renders fully drawn; chapters get static waypoint colors via `[data-chapter]`; opacity-only fades ≤0.3s.

## 3.10 Copy deck (starting point — refine in build)
- **Hero (pick 1):** "I build machine learning that shows its work." / "Machines learn fast. — I make sure they learn *right*." / "Models, trained *carefully*."
- Sub (mono): `ayush yadav — ml engineer, class of 2026`
- **Chapter pairs (bright/muted):**
  - About: "This is a story about learning machines. / And the person who doesn't fully trust them yet."
  - Experience: "Thousands of service tickets. Zero structure. / Miami is where I learned that data work starts with mess."
  - AutoML: "The agent drafts the whole pipeline. / Nothing runs until a human says go."
  - JobTracker: "Your inbox already knows where you applied. / JobTracker reads it — and nothing ever leaves your device."
  - Fast MNIST: "No frameworks. Just math, memory, and C++. / Then SIMD made it 3.5× faster."
  - Visual Assist: "LiDAR measures the room. / Visual Assist says it out loud, for the people who need to hear it."
  - Ending: "That's the work so far. / The interesting part is whatever comes next."
- **Ending options:** "The models keep learning. So do I." · litany: "Make it learn. / Make it fast. / Make it honest. / Make it." · gate copy: "Every pipeline I build ends with a human decision. This one ends with yours."
- **Scroll cues (mono, lowercase):** `scroll — the story starts here` · `keep going` · `( 02 / 07 )` · `end of scroll, not of story`
- **CTAs:** "Say hello" · "See it think" (AutoML) · "Try the demo" · "The one-page version" (resume) · footer: "Email me — I read everything."
- Voice: confident, warm, precise; zero corporate filler; no "passionate".

## 3.11 Demos woven into the story (proof, not decoration)
1. **Ch 04 AutoML:** scrubbing/pipeline-stage demo inside the pinned diorama + an approval-gate interaction (the recruiter clicks Approve to continue the run). NDA-safe: dummy-data replay, clearly labeled.
2. **Ch 05 JobTracker:** paste-a-rejection-email classifier, on-device (transformers.js/ONNX later; clearly-labeled heuristic stub acceptable at first ship). Latency + "never left your device" readouts.
3. **Ch 05 Fast MNIST (stretch):** scalar-vs-SIMD WASM benchmark race with real numbers.
Every demo prints honest, real numbers. If it can't run yet, show a real screen recording — never a fake.

---

# PART 4 — CONTENT & TECHNICAL REQUIREMENTS

1. **Metrics rewritten as outcomes** everywhere: lead with macro-F1 0.9791, 3.5× speedup, 1M+ records, 38ms on-device, 19/20 cited-source sweep, "7-phase gated lifecycle". Test counts demoted to case-study internals.
2. **Case studies:** Problem → Approach → Result → number; each with an ADR-style decision note ("chose X over Y because…"); real screenshots/recordings as primary imagery, drawn schematics as support.
3. **Fonts:** `next/font` self-hosted Fraunces + Newsreader + Fragment Mono only. Fix the layout.tsx docblock.
4. **Images:** WebP/AVIF, responsive sizes at build (sharp is already a dep); portrait & poster compressed; budget ≤300KB/image enforced by existing script.
5. **SEO:** JSON-LD (`Person` + `WebSite` in layout; `CreativeWork`/`BreadcrumbList` on case studies); custom domain (e.g. `ayushyadav.dev`) + one professional email everywhere.
6. **A11y:** WCAG AA at every color waypoint; full keyboard nav; visible focus; `aria-label` on masked/split text; reduced-motion = complete, beautiful static version; skip link preserved.
7. **Perf gates:** LCP < 2.5s, sub-2s load target; single rAF loop; SVG path budget per viewport; no blur filters on mobile.
8. **Verification:** extend existing Playwright suites (atlas → story chapters), axe per chapter (both day and dusk states), perf budget spec, reduced-motion spec. Never ship a failing gate.

---

# PART 5 — BUILD PHASES (for Claude Code)

**Phase 0 — Clean the slate (½ day).** Part 2.1 deletions + 2.2 demotions; `next/font` migration; image compression; contrast lift on anything retained; fix docblock. Site still ships in old design but honest, fast, clean.

**Phase 1 — The world (2–3 days).** Design tokens (Part 3.4/3.5); light-field layer 0 + grain + contour layer 1 with `data-chapter` waypoint system + oklch scroll interpolation; Lenis + ScrollTrigger single-loop setup; chapter shell (7 sections + rail); reduced-motion architecture from day one.

**Phase 2 — The thread & chapters (3–4 days).** Red-thread SVG (two-path dashed/solid, scroll-scrubbed, chapter nodes); Ch 01–03 + 06–07 (unpinned chapters, text animation spec, hover vocabulary); the dusk flip; the Approval-Gate ending with giant name + warm CTA.

**Phase 3 — The flagship & demos (3–5 days).** Ch 04 pinned AutoML chapter (sticky diorama + steps + arch reveal + gate interaction); Ch 05 project rows with drawers + cursor previews; JobTracker classifier demo; schematics/dioramas as SVG per chapter.

**Phase 4 — Content & polish (2 days).** Copy deck refined in place; case-study rewrites; screenshots/recordings; JSON-LD; domain; GitHub profile pass.

**Phase 5 — Verify (continuous).** Playwright + axe (day AND dusk) + perf + reduced-motion suites green; cross-device pass; then launch.

---

# APPENDIX — REFERENCE SITES (for taste calibration, not copying)

Structure/pacing: dennissnellenberg.com · robin-noguier.com · lusion.co · Igloo Inc (Awwwards SOTY 2024) · Apple AirPods scrub pages · The Pudding sticky essays · "How EU Laws Are Made" (line-guided process story — closest analogue to the red thread).
Color/mood: daylightcomputer.com (`#FAF5F2` warm paper) · press.stripe.com · rauno.me · godly.website portfolios feed · Japanese washi/sumi palettes.
Type: Fraunces (Google, variable, SOFT/WONK axes) · Newsreader · Fragment Mono · fallbacks: Instrument Serif/Sans, Sentient/General Sans (Fontshare).
Technique: CSS-Tricks scroll-drawing & Apple-scrub articles · Codrops SVG-on-scroll · dev.to dashed-SVG section connectors · Lenis docs (`lerp 0.08`) · NRK persistent-scene case study (Chrome blog) · Smashing reduced-motion guide.

**Endings note:** the Approval-Gate close is unique to Ayush's identity — nobody else can use it. That's the point.
