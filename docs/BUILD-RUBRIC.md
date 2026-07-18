# BUILD RUBRIC — scoring, iteration protocol, and per-phase criteria

> Companion to `NEW-PORTFOLIO-MASTER-PLAN.md` (the WHAT) and `NO-LIST.md` (the NEVER).
> This file is the HOW: every build step is scored /100, fixed, and re-scored until
> it clears the bar. Includes the research-driven engineering amendments (July 2026).

## 1. The loop (sub-agent-driven development)

For every step within a phase:

1. **Build** — implement the step per plan + amendments.
2. **Gate** — run the mechanical gates (typecheck, lint, format, build, relevant
   Playwright suites). A red gate blocks scoring; fix first.
3. **Score** — an independent critic pass (sub-agent with fresh eyes where the step
   is visual: screenshots at 1440/768/390, day AND dusk state, motion AND
   reduced-motion) rates the step /100 against §2 + the phase criteria in §3.
4. **Fix** — take the critic's ranked deficiencies, fix the highest-impact ones.
5. **Iterate** — re-score. **Ship bar: ≥90/100 AND zero NO-LIST violations AND all
   gates green.** Only then commit (grouped-by-concern) and move to the next step.

Scores and fix-lists are recorded per step in `docs/scorecards/` (one md per step).

## 2. Scoring criteria (universal weights)

| # | Criterion | Weight | What it measures |
|---|---|---|---|
| 1 | Plan fidelity | 25 | Exact tokens (Part 3.4/3.5 hex, type scale, tracking/leading), chapter structure, animation timings/easings (3.8), scroll feel (3.9), copy voice (3.10) |
| 2 | NO-LIST compliance | 15 | `NO-LIST.md` §A–E. **Any single violation = automatic step fail regardless of total** |
| 3 | Craft / taste | 20 | "Calm, flowing, wonderful — beautiful, not flashy." Static frames look designed; motion carries meaning; restraint (2–3 hover moves sitewide; one idea per viewport) |
| 4 | Accessibility | 15 | WCAG AA at every waypoint AND mid-interpolation; keyboard nav + visible focus; aria on masked text; reduced-motion version is designed, not amputated |
| 5 | Performance | 15 | LCP <2.5s; CLS <0.1; single rAF; transform/opacity/clip-path only; font payload ≤220KB; no mobile blur; 60fps scroll on mid-range throttle |
| 6 | Verification | 10 | Gates green; new behavior has new specs (Playwright/axe) — not just surviving old ones |

## 3. Research amendments (adopted into the spec, July 2026)

These amend the master plan's engineering sections; visual/narrative spec unchanged.

- **A1 — Scroll loop wiring (Plan 3.9):** `new Lenis({ lerp: 0.08, smoothWheel: true, wheelMultiplier: 1, autoRaf: false })`; `lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.add(t => lenis.raf(t * 1000))`; `gsap.ticker.lagSmoothing(0)`. Cleanup: `ticker.remove` + `lenis.destroy()` + `gsap.context().revert()`. `ScrollTrigger.refresh()` after fonts load. Header anchors route through `lenis.scrollTo` (1.2s expo-out). ONE scroll consumer: Header/rail/day-arc all read from the single loop.
- **A2 — Native CSS scroll timelines:** decorative-only, behind `@supports (animation-timeline: scroll())` (Firefox still flagged mid-2026). All load-bearing scrub/pin/color stays GSAP.
- **A3 — Red Thread architecture (Plan 3.3):** NOT one page-spanning path. Seven per-chapter `<svg>` segments with aligned endpoints, each with its own ScrollTrigger; `content-visibility: auto` + `contain-intrinsic-size` on offscreen chapters; SVGO'd paths, few hundred points max, no filters/gradients on the stroke. (`stroke-dashoffset` repaints — segmentation contains it.) DrawSVG is free now if useful.
- **A4 — Day-arc interpolation (Plan 3.3/3.4):** never tween color strings (GSAP defaults to sRGB → muddy midpoints). Scrub numeric channel vars and compose `oklch(var(--arc-l) var(--arc-c) var(--arc-h))`, or `color-mix(in oklch, …)`. Ink at the dusk flip is a pre-verified STEP change, never scrubbed. **Build-time AA check samples ≥10 interpolation points per segment** (script + Playwright assertion), day and dusk.
- **A5 — Fonts (Plan 4.3):** `next/font/google` cannot range-restrict variable axes. Phase 1 measures the real woff2 payload; if Fraunces+Newsreader+Fragment Mono exceed **220KB total**, switch Fraunces to `next/font/local` with a fontTools-subset build (Latin; wght limited to the used band; opsz kept; SOFT/WONK kept only if the spec'd usage survives the byte check). `display: swap`, tuned fallbacks, hero cut preloaded.
- **A6 — Hosting (Plan 4.5, Phase 4):** custom domain at ROOT (kills basePath bug class); prefer Cloudflare Pages over the github.io subpath (headers/brotli/TTFB). Decision + DNS is the user's; build stays host-agnostic until Phase 4.
- **A7 — Reduced motion (Plan 3.9):** gate at entry — never mount Lenis/ScrollTrigger under `prefers-reduced-motion` (no init-then-disable); subscribe to media-query `change`; add a quiet in-page motion toggle; static version is a designed deliverable (thread fully drawn, waypoint colors via `[data-chapter]`, opacity-only ≤0.3s) verified in day AND dusk.
- **A8 — Pacing guards (Plan 3.6):** one-pin rule is hard (Ch 04 only); Ch 04's 300vh = 3–4 discrete beats at ~80–100vh; add a quiet "skip to the work" affordance near the hero scroll cue (mono, lowercase) for recruiters who won't scroll 1,500vh.

## 4. Per-phase criteria

### Phase 1 — The world (tokens · layers · engine · shell · reduced-motion)
Steps: (1) design tokens + fonts → (2) scroll engine consolidation → (3) light-field
+ grain + contour layers + day-arc → (4) 7-chapter shell + rail → (5) reduced-motion
architecture + new specs.

- [ ] All Part 3.4 tokens defined as CSS vars in `@theme` (canvas/surfaces/ink/secondary/clay text+graphic/pine/pass/fail + 7 waypoint colors) — exact hex
- [ ] Part 3.5 type scale implemented (hero clamp, chapter clamp, body 18–20px 55ch, mono 12–14px lowercase +0.05em); Fraunces axes wired (opsz; SOFT/WONK per A5 outcome)
- [ ] Previously-undefined tokens (`--accent-primary`, `--surface-2`, `--glow-color`…) resolved: defined or their consumers (error/not-found/skip-link) migrated
- [ ] Font payload measured and ≤220KB or A5 fallback executed
- [ ] ONE rAF loop (A1); ScrollProgress component deleted; Header scroll listener folded in; anchors via `lenis.scrollTo`; Lenis exposed via provider/context
- [ ] framer-motion dead dep removed; dead `useScrollAnimation` hook removed or rebuilt intentionally
- [ ] Layer 0 (radial sun + grain ≤5%) and Layer 1 (contour/graph 4–6%) fixed, `pointer-events-none`, no new perf-budget breach (4MB total, no image >2MB)
- [ ] `[data-chapter]` waypoint system drives oklch day-arc per A4; AA sampler script exists and passes
- [ ] 7 chapter sections with stable ids + left rail 01–07 (small caps, current chapter, click = smooth anchor; NO track/capsule/glow per NO-LIST §C)
- [ ] Reduced-motion per A7 with new Playwright assertions (no ScrollTrigger instances, thread-ready static states, axe green in day + dusk)
- [ ] Core-gate specs updated alongside the shell (atlas/nav/comprehensive/deep-qa section contracts; a11y-audit dark-RGB contrast test rebaselined to warm palette)

### Phase 2 — Thread & chapters (01–03, 06–07)
- [ ] Thread per A3 (7 segments, dashed future + solid past, nodes fill on pass)
- [ ] Ch 01 hero: de-blur+rise entrance (only blur on page, load-only, none on mobile); mono sub; scroll cue + "skip to the work" (A8)
- [ ] Ch 02 manifesto scrub (word opacity 0.25→1, the page's ONE scrubbed text)
- [ ] Ch 03 timeline: thread as spine, rows light at nodes, sibling dimming
- [ ] Dusk flip once at 05→06; ink step change (A4); Ch 07 gate ending w/ giant name, warm CTA, availability + local time
- [ ] Text animation spec 3.8 timings exact; ≤40–60 words/scene
- [ ] Hover vocabulary: pick 2–3 moves sitewide, consistently (3.7)

### Phase 3 — Flagship & demos
- [ ] Ch 04 the ONLY pin; arch clip-path reveal (used once); 3–4 beats ~80–100vh (A8); approval-gate interaction (recruiter clicks Approve)
- [ ] Ch 05 rows: drawer expansion (grid-template-rows), cursor-following preview (lerp 0.1, list only) — sticky stack only if scale ≥0.95, no rotation
- [ ] JobTracker demo on-device w/ honest latency readouts; labeled heuristic stub acceptable; NO fake demos
- [ ] Every demo prints real numbers; NDA-safe dummy-data labeled

### Phase 4 — Content & polish
- [ ] Copy deck 3.10 refined in place; voice: confident/warm/precise; zero "passionate"
- [ ] Case studies: Problem → Approach → Result → number; ADR-style decision notes
- [ ] Metrics as outcomes; macro-F1 0.9791 and 38ms REQUIRE new proofManifest entries before appearing anywhere
- [ ] JSON-LD (Person+WebSite; CreativeWork/Breadcrumb on case studies); domain per A6; one professional email everywhere
- [ ] Real screenshots/recordings as primary imagery (WebP/AVIF ≤300KB)

### Phase 5 — Verify (continuous)
- [ ] Playwright chapter suites replace atlas suites; axe per chapter × {day, dusk} × {motion, reduced}
- [ ] Perf spec: LCP <2.5s, CLS <0.1, scroll jank sampling; visual suites re-baselined
- [ ] Cross-device pass (incl. mid-range Android throttle) before launch

## 5. Scorecard template

```md
# Scorecard — Phase N · Step M — <name> — iteration K
Gates: typecheck ☐ lint ☐ build ☐ e2e ☐ axe ☐ perf ☐
| Criterion | /max | Notes |
| Plan fidelity | /25 | |
| NO-LIST | /15 | violations: none|LIST → AUTO-FAIL |
| Craft | /20 | |
| A11y | /15 | |
| Perf | /15 | |
| Verification | /10 | |
**Total: /100** → ship (≥90) | iterate
Fix list (ranked): 1. … 2. …
```

## 6. Dual-lens critique (added 2026-07-17, user-mandated)

Every visual step's critic pass now scores through TWO personas, both /100:
- **The recruiter (60s, skimming):** can they reach identity → strongest proof →
  contact fast? Is anything in the way (jank, mystery-meat nav, slow LCP)?
  Does the page read credible-professional, not art-project?
- **The casual visitor (curious, exploring):** is it inspiring to wander?
  Do the animations reward scrolling? Is there delight (apparatus wit, the
  line, the stamp) without confusion? Mobile as pleasant as desktop?

Step score = min(rubric §2 score, recruiter score, visitor score). A step that
delights visitors but frustrates recruiters (or vice versa) does not ship.
