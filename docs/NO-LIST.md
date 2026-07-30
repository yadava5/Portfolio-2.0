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

## F. Amendments — the living world (owner decision, 2026-07-30)

> Sections A–E above are **unchanged**. This section narrows three of their bans
> and re-affirms two, on the record, because the owner reviewed three hero
> prototypes and chose a direction that the list as written forbids. Amending in
> the open beats breaking quietly: NO-LIST is enforced as "any violation =
> automatic rubric fail", so an unamended build of this direction fails by
> construction rather than on merit.
>
> **Note on §A's status.** §A is a verbatim lift of MASTER-PLAN 2.4 and records
> no per-item rationale. F1 below therefore states what the ban plainly *targets*
> from the surrounding evidence (§B's old-portfolio DNA, §D's differentiation
> clause) and does not invent a reason §A never gave.

### F1 · The ink field — narrows §A "floating blurred orbs & blobs", "no glow"

What §A's neighbours make plain is the target: §B's evidenced DNA is
`#030014`/`#0a0a1a` **near-black indigo** with violet/cyan/pink, "blurred
gradient orbs (blur 80–120px)", "holographic hsl(280/200/340) gradients" and a
"mouse-following radial ambient glow". `PREMIUM-FLOW-PLAN.md` declines the
Linear-style "WebGL mesh/aurora hero" with the reason "**we're paper, not a dark
gradient**". The banned thing is a **cool, smooth, glowing gradient on
near-black**.

**Permitted:** a warm, arc-driven **ink field** — a low-frequency wash rendered
in the day-arc's *current* oklch colour, inside the existing `[data-light-field]`
container, **beneath** the contour and grain layers.

Binding conditions, all five:
1. It carries the existing grain and contour **on top of it** (§D's "visible real
   paper grain (≤5% opacity but *present*)" is unaffected).
2. It stays inside the warm corridor — it reads as ink diffusing in damp paper,
   never as light emitting from behind glass. No bloom, no additive blend.
3. It is **not a smooth gradient**: fbm/turbulence with visible tooth, matching
   the grain's own character.
4. Clay and pine stay legible on it — every waypoint and ≥10 mid-interpolation
   samples per segment re-asserted by `npm run test:contrast` (amendment A4).
5. It passes D7's screenshot test: a still frame must still read unmistakably as
   this paper.

**Still banned, unchanged:** glow as a *lighting effect* (bloom, glow
drop-shadows, halos), glass/backdrop-blur, mesh gradients, gradient text, any
cool or purple hue, and pointer-following ambience of any kind.

### F2 · Bounded WebGL — narrows FABLE §E1's 🔴 on background 3D

§E1 reads "Fullscreen persistent WebGL backgrounds stay 🔴 (the jank the owner
fled)". The load-bearing word is **persistent**.

**Permitted:** a WebGL field that **draws only while the day-arc is changing** —
i.e. only while the reader is scrolling — and idles at zero frames otherwise.
That is the contract `DayArc` already honours; this only draws it richer.

Conditions: Full tier only (Core keeps the CSS field, which is already good);
fallback chain WebGL2 → CSS field → static; DPR-capped ≤1.5; rendered at reduced
resolution; `contain` inside the existing light-field container; and a trace
proving **zero rAF frames while the page is idle**.

### F3 · The one rAF loop — RE-AFFIRMED, unchanged

§E's "No second rAF loop" stands. The ink field rides `gsap.ticker` like
everything else; the governor and `TextGarnish` already do. This is restated
rather than relaxed because it is the rule most likely to be eroded by an
"ambient" feature, and because the site's **zero-idle-animation** property —
verified by grep: no `infinite`, no `repeat: -1`, no `yoyo` anywhere in
`src/` — is a genuine asset worth keeping.

### F4 · One pin — RE-AFFIRMED, unchanged

Amendment A8 / brief D2 stand: **exactly one pinned chapter**, spent on
`PipelineRun` (ch04). The owner's request for Apple-style transitions where "a
whole slide slides down" is **not** licence for a second pin, and not licence for
scroll-snap (banned in §A, §C and D1 — §C's warrant is "user said no", his own
rejection of the elevator iteration).

The sanctioned reading is the third one: **the section arrives as one authored
group**, which `PREMIUM-FLOW-PLAN.md` §A already adopted ("Verdict — ADOPT, this
is the #1 fix"), plus the B10 boundary cross-fade, plus the world stepping in
discrete beats *behind* content that never moves. Content staying in normal flow
is what keeps the Red Thread's measured seams inside their ±2px contract.

### F5 · Dark is the arc's night, never a default

§D names "the scroll-driven dawn→dusk arc — **the canvas never sits still on one
hex**" as one of only four things separating this site from a daylightcomputer
clone. A darker, richer world is permitted **as the arc's night end** — which is
already law at `--waypoint-06 #43372f` and `--waypoint-07 #2c2622`, ink flipping
cream at 12.8:1. A static dark default is not permitted: it would delete the
differentiator and trade a live canvas for a dead one.
