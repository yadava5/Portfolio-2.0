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
"ambient" feature, and because the site schedules **no idle app animation** —
verified by grep: no `infinite`, no `repeat: -1`, no `yoyo` anywhere in `src/`.

**Correction, measured 2026-07-30 — do not repeat the stronger claim.** An
earlier draft of this amendment (and the plan behind it) said the page sits at
"zero rAF when idle." **That is false and never was true on this build.** Three
seconds of stillness schedules **~732 rAF callbacks**, from two 120 Hz
library keep-alive loops identified by stack: GSAP's core ticker and
ScrollTrigger's own internal `requestAnimationFrame` loop. A same-rig baseline
build measured **734** — i.e. the app rides those frames with **zero work of its
own**, and that is the property actually worth protecting.

So the correct acceptance test for any new world layer is **not** "zero rAF
while idle" (unachievable without patching vendored GSAP) but: **the idle
callback count must not rise, and no app work may execute on an idle frame.**

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

### F6 · Retired (owner decision, 2026-10-16): no idle timer, the tab mark stands still

F6 once sanctioned one idle timer, the tab mark's seam sewn on the wall clock
(`markTick()`, 2026-10-07). The owner retired the live mark on 2026-10-16:
"remove all this live bullshit and everything and just have my name". The mark
is now his name, "Ayush" over "Yadav", outlined from Fraunces with the clay
rail between the words (`scripts/asset-truth/site-mark.mjs`), and nothing on
the page writes the icon's href after load. F3 is whole again: no idle rAF and
no idle timer. Still banned: any favicon motion at all, any `<link rel=icon>`
swap while the page is open, and a second drawing of the mark anywhere but
`site-mark.mjs`.

### F7 · The type answers the hand; the figures assemble in depth — narrows §A "3D-tilt cards" and §E "the only blur" (owner decision, 2026-10-08)

The owner asked for text that answers the pointer, in his words "really good
shadcn quality ... not just get bold ... swish effect or motion or blurry or a
bubbly effect, different effects when hovering over text", for his name to
answer "after the opening animation ... if someone swoosh or move the cursor
over the text", and for "the 3D assembly of the figures ... figures coming from
three dimensions". Three things the list as written forbids or leaves unsaid
are therefore permitted, each bounded:

1. **Pointer-driven type physics.** The settled nameplate's letters may move
   under the hand (a bead chain driven by the pointer's speed, the five
   letter-machines answering its crest), and headings, links and buttons may
   answer a hover or a press. Bounds: real type throughout (selectable,
   accessible, layout-neutral: the h1 box and every heading and link rect
   unchanged, measured); driven by a REAL pointer's speed or a press, never by
   where a cursor rests and never by content scrolling under a still one; no
   tilt toward the pointer, no glare, no magnetic pull, no custom cursor, no
   idle motion; one stepper on the engine's own loop and back at exactly zero
   once the hand has gone (F3 stands); nothing mounts under reduced motion.
2. **One more blur.** §E's "hero de-blur is the only blur on the page" is
   narrowed by exactly one: the link roll's mid-flight blur, under 1px, for
   300ms, on fine pointers only. Never on a phone, never on a resting glyph.
3. **(Replaced by F8 below, 2026-10-09.)** **Figures assembled in true 3D by the scroll**, inside a plate that never
   moves on its own: one camera, scroll-pure (the same y gives the same frame),
   rigid planes in true perspective whose depth closes as one scalar into the
   page, nothing travelling across the screen to its place, nothing descending,
   no shadows, and the authored drawing exactly in place once it is being read.
   Not a tilt card: nothing follows the pointer.

**Still banned, unchanged:** tilt cards, glare and holo, magnetic buttons,
particles and constellations, text scramble and typewriter effects, shimmer
sweeps, glow of any kind, gradient text, custom cursors, idle animation of page
content, blur on mobile, and any second rAF loop.

### F8 · The figures assemble with the scroll — replaces F7 item 3 (owner decision, 2026-10-09)

Shown round v5's figures, which played once when a reader stopped at them, the
owner chose them and set one condition: "make sure to make them work with
scrolling, not like single play, they should assemble with rail scroll!" A
round earlier he had rejected the scroll-pure camera of v4.2 because "if
someone scrolls fast, they'll miss it". F7's third item described that
camera; this replaces it.

**Permitted, and nothing wider:** four figures (figs. 04, 06, 07 and 08)
assemble with the scroll. The scroll position sets how far each has
assembled, as a function of scrollY alone, so scrolling back up takes it apart
again. One damped hand on the engine's own loop (the `asm` driver in
`src/run/index.html`) carries the drawing there: it follows a reading scroll
about a tenth of a second behind, and its speed is capped so that a figure's
whole motion takes at least 0.4 s (ASM_RATE), so a flick still shows the
figure assembling instead of skipping it. At rest the same y gives the same
drawing; a jump, an anchor, a figure off the screen and the first frame land
at once. fig. 08 stands where dusk falls, and its plate is on the dusk
contract, whose entrance waits for the plate to clear the fold: it is drawn
while that entrance fades it in, and is finished, and held, before the
curtain, so the contract's own clause (no text at full ink on the darkening
stops) is untouched. Each figure is drawn in parallel
projection (cabinet oblique, front faces at 1:1, text never scaled), is a
complete drawing at every point a reader can stop on, and is finished by the
time its centre reaches the end line, or a pause (amended below). It stays inside its own plate, and
the plate never moves for it. What moves is the figure's own subject: strokes
drawn in the order the process runs (figs. 07 and 08), units called out of
the field on leaders (fig. 06), and the morning post riding its own belt,
each piece filing back into its desk's case along the depth axis and rising
inside it to its pigeonhole, seen through the openings, and the one held for
review ringed in clay at the belt's end (fig. 04), where the post's travel
along the belt was already the figure's content.

**Amended 2026-10-14 (owner: "by the time we get and can see the fig, it is
already done with half the animation ... doesn't miss more than 20-30% of the
scroll animation until we can see the whole or main part of the fig").** The
window now opens where 80% of the drawing is on screen and closes where its
centre reaches 0.45 of the screen, so nothing a reader is meant to watch
begins below the fold (measured on v6: 0.56-0.61 of the motion was spent
before a figure was wholly visible). One grace, bounded: a reader who has
been still for 0.6 s with a figure at least 90% on screen and its centre at
or above 0.70 of the screen is shown the rest of it by the same hand at the
same speed limit, and that figure's window closes where they paused —
scrolling on holds it finished, scrolling back up takes it apart over the
shortened window, leaving the screen restores the window. The scroll alone
does at least 0.4 of the work at every natural park; one figure at a time;
never while scrolling (every scroll re-arms it), never a replay, never under
reduced motion. A stop at the fold with the figure barely in is not a park,
so nothing plays itself there. fig. 08 keeps the dusk contract's own window.

**Still banned, unchanged:** a camera that orbits, tilts or flies; parts that
fly in from off the plate, drop or fall into place; shadows; anything that
changes size for its own sake; a plate that tilts or follows the pointer;
scroll-snap, pinning or any scroll hijack; a second rAF loop; idle motion of
any kind (the grace is a completion, once, of what the reader was watching,
never idle motion); and motion under reduced motion, where every figure is
shown finished.
