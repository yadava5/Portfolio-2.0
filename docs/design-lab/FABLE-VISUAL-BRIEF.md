# FABLE VISUAL BRIEF — living project visuals + whole-front-end premium pass

> **What this is.** A research→build brief for the design-specialist model (Fable 5)
> to execute a premium, storytelling-grade front-end for the Daylight-Study portfolio.
> The owner's direction: the project-card images (static screenshots + architecture
> SVGs) are "too old-fashioned" — replace them with cool, innovative, *living* visuals
> (3D, generative, living SVG) where **each visual IS the project's idea**; and take the
> whole front end from "raw web page" to Linear/Cursor/Apple/Awwwards feel — *in this
> site's ink-and-paper voice, never a clone.*
>
> **What this is NOT.** It is not a licence to betray the perf contract or the NO-LIST.
> The owner has already suffered scroll jank (removed Lenis → native scroll) and is
> extremely sensitive to GPU cost. Every recommendation here carries an honest cost
> table and a `PERF VERDICT` for *this* repo. When wow and jank conflict, jank loses.
>
> **Read these first (this brief builds on them, does not repeat them):**
> `docs/NO-LIST.md` (absolute bans), `docs/design-lab/PREMIUM-FLOW-PLAN.md` (composed
> section choreography + the pinned AutoML scene — already built), `docs/design-lab/
> ANIMATION-MAP.md` (content-figure map), `docs/design-lab/PERF-AUDIT.md` (the paint
> budget + the DayArc `<html>`-write jank lesson), `docs/design-lab/INSPIRATION.md`.
>
> **Ground truth already in the tree** (reuse before you invent):
> `PipelineRun.tsx` (the pinned scene engine — run token + `stroke-dashoffset` edge +
> ink-settle + clay gate + honest halt), `TextMotion.tsx` (SplitText line-mask/scrub/
> stagger), `AuditRun.tsx` (timer-based tick/ring/dash walk, opacity-only, static-world
> instant), `DayArc.tsx` (oklch channel scrub), `RegistryRows.tsx`, the Red Thread
> (`ThreadSegment.tsx` + `geometry.ts`). Palette + type tokens: `src/app/globals.css`
> (`@theme`), fonts in `src/app/layout.tsx` (Fraunces/Newsreader/Fragment Mono).
>
> **Data note.** `src/lib/data/*` is being rewritten in parallel (new project names:
> **Applied, Cadence, Glyph, LifeQuest, jetpack-compress, Agentic AutoML**). Do NOT read
> current metric strings as final. **Every number a visual displays must come from a
> `proofManifest` / `src/lib/data` proof-cited value — never invented.** The proof-cited
> figures this brief leans on: Applied's classifier **macro-F1 0.9791** on a 96-sample
> gate + the shipped **int8 ONNX 22.8 MB** in-browser model; Glyph's **3.5× vs -O3**
> (dot 256) from a committed `bench_summary.csv`; jetpack-compress on **JDK 25**
> (HEAD `af2c4b1`, verified public). If the data layer renames or re-values these, the
> visual follows the data, not this doc.

---

## The palette + voice every visual must stay inside (non-negotiable)

Pulled from `globals.css @theme` so builders cite variables, not hexes:

| Token | Value | Use in visuals |
|---|---|---|
| `--color-canvas` | `#faf6ef` | the paper (day). Never pure `#fff`. |
| `--color-ink` | `#26231c` (13.9:1) | primary ink — strokes, tokens, type |
| `--color-ink-secondary` | `#5c564a` (6.2:1) | "not yet activated" labels; ink-settle *from* state |
| `--color-clay-graphic` | `#c4532e` | THE gate/halt/approval accent for graphics |
| `--color-pine` | `#2f5d50` (7.0:1) | links, "passed" gates, secondary structural strokes |
| `--color-clay-ember` | `#f57a3e` | **RESERVED — the inked APPROVED stamp ONLY.** No new visual spends it. |
| `--color-clay-invite` | `#ec814d` | "awaiting" warmth (the press-here glow-free invite) |
| `--color-ink-dusk` / `--waypoint-06/07` | `#f6efe2` / `#43372f` / `#2c2622` | the dusk/night world — ink flips cream on the ledger browns |
| grain / contour | `feTurbulence` alpha ≤5% | the living paper texture (baked, not animated) |

Type: **Fraunces** (display, `opsz/SOFT/WONK` axes), **Newsreader** (prose, 400 roman+italic
only), **Fragment Mono** (lowercase tracked labels). Any text *inside* a visual uses these
three — never a new face, never gradient text, never a mono that isn't Fragment Mono.

**Two-accent law:** kiln clay + pine on warm paper. No purple, no cyan, no neon, no glow,
no glass, no mesh gradient (NO-LIST §A/B). A high-chroma accent is legal ONLY as clay/pine
on paper — never on near-black. This is the single fastest way a "cool 3D" idea turns into
a banned console/holographic look; hold the line.

---

# A. Pattern library — techniques, real references, honest cost, verdict

Cost columns are for **this** repo (Next 16 static export, GH Pages, React 19, GSAP 3.15
+ ScrollTrigger on **native scroll**, zero canvas/WebGL today). "Main-thread" = scroll-time
cost, the thing that janks. "GPU" = compositor/raster/shader cost. Verdict legend:
🟢 adopt freely · 🟡 adopt bounded, with the stated guardrail · 🔴 avoid / last resort.

### A1 · Composed "run" SVG figure — ink token + `stroke-dashoffset` edge + ink-settle
The site's own signature move (already shipped in `PipelineRun`). An ink bead travels a
labeled graph; a thin edge draws ahead (`stroke-dashoffset`, the one sanctioned non-transform
prop); nodes ink-settle secondary→full as it passes; a clay square marks the human gate where
it halts. **Ref:** MindMarket (SOTM Dec 2025, drawn-line-leads-narrative, Rive+GSAP);
our Red Thread does it award-grade already.

| KB | Main-thread | GPU | Reduced-motion |
|---|---|---|---|
| 0 new (GSAP already loaded) | very low (opacity + one dash prop per figure, in-view-gated) | negligible (contained SVG paint) | static: the fully-drawn graph, token resting at the gate |

**PERF VERDICT 🟢** — the house style. Highest reuse. This is the default engine for
Applied, jetpack-compress, Agentic AutoML, and the Glyph SIMD race. Build everything you can
as A1 before reaching for anything below it.

### A2 · SVG line-draw (`stroke-dashoffset` / pathLength=1) — the sanctioned draw
Edges, axes, underlines, contours drawing themselves. **Ref:** DrawSVG-class reveals across
Awwwards editorial sites; our thread scrub.

| KB | Main-thread | GPU | Reduced-motion |
|---|---|---|---|
| 0 | very low (per-segment; the thread proves it's near-free) | negligible | static: fully-drawn path |

**PERF VERDICT 🟢** — free, on-voice, the ink vocabulary. Use for every "arrives as a claim"
underline and every diagram edge.

### A3 · CSS scroll-driven animation (`scroll-timeline` / `view-timeline`)
Compositor-run reveals/parallax tied to scroll with **zero main-thread JS**. Chrome 115+,
Safari 18+; **Firefox behind a flag** (still, mid-2026). **Ref:** the 2026 pure-CSS
scroll-animation wave (Chrome DevRel, Bramus, Comeau).

| KB | Main-thread | GPU | Reduced-motion |
|---|---|---|---|
| 0 | **zero** (runs off main thread on the compositor) | low | trivial: wrap in `@media (prefers-reduced-motion: no-preference)` |

**PERF VERDICT 🟢 (decorative only).** NO-LIST §E forbids `animation-timeline` for
*load-bearing* behavior (Firefox gap) — so use it behind `@supports (animation-timeline: view())`
for **depth accents, grain drift, section-handoff cross-fades** where a Firefox no-op is
invisible. Never route a figure's *legibility* through it. This is the cheapest way to add the
"flows itself" continuity the owner wants without new JS.

### A4 · CSS 3D transforms — structural depth / isometric (no library)
`transform-style: preserve-3d` + `perspective` + `translateZ`/`rotateX` to give a card real
volume or lay a diagram out isometrically. **Ref:** Frontend Masters "deep card", Codrops CSS
voxel engine (2025), 30-seconds isometric-card.

| KB | Main-thread | GPU | Reduced-motion |
|---|---|---|---|
| 0 | low if scroll-linked transform; **spikes if driven by mousemove** | moderate (3D layers raster to their own compositor layers; watch mobile) | static: the flat/settled composition |

**PERF VERDICT 🟡** — allowed as **scroll-linked structural depth** (a diagram tilting into
isometric as it enters, layers separating by `translateZ`). **Hard tripwire:** the moment it
becomes *mouse-tilt with glare* it is the banned HoloCard/TiltCard (NO-LIST §A/B). No pointer
tilt, no glare, no perspective on mobile (skip to flat). Keep magnitudes small; depth is texture.

### A5 · Bespoke raw-WebGL shader — matte halftone / dither on paper
A tiny hand-written fragment shader (Stripe's `minigl` is ~10KB of code) applying an **ordered
dither / halftone** pass — which is *exactly* the ink-on-paper stipple the hero already fakes
with `stipple-gain`. **Ref:** Maxime Heckel's dithering/halftone shader series (2025–26),
Codrops "Efecto" ASCII/dither (Jan 2026), `paper-shaders`, Some-Shade half-tone web component.

| KB | Main-thread | GPU | Reduced-motion |
|---|---|---|---|
| ~5–12 KB (bespoke) or ~10–20 KB (`paper-shaders`) | low (draws on GPU; **must be in-view-gated + paused off-screen + its own rAF that never runs during page scroll**) | the point — but DPR-cap to ~1.5, small canvas | static: a pre-rendered halftone PNG poster frame |

**PERF VERDICT 🟡** — the one genuinely novel "wow" that is *on-voice* (halftone = ink, not
neon). Allowed ONLY for a **bounded hero substrate or one signature card**, lazy, gated, with a
static poster fallback, and a `WebGL→static` fallback chain (§E1). Matte only: ink + clay, **no
bloom, no color cycling, no mesh gradient** or it becomes the banned AI-gradient/glow look.

### A6 · OGL micro-WebGL — true 3D, bounded
When depth must be *real* (layers receding in z), OGL is the minimal path: **~29 KB minzipped
total (Core 8 / Math 6 / Extras 15), tree-shakeable well below that** — vs three.js's ~150 KB+
gzip. **Ref:** oframe/ogl; the "tiny WebGL planet" school of Awwwards dev sites (Messenger, Dev
Site of the Year 2025).

| KB | Main-thread | GPU | Reduced-motion |
|---|---|---|---|
| ~16–29 KB (tree-shaken) lazy | low if gated + paused off-screen | moderate; DPR-cap, tiny canvas | static: the 2D SVG version of the same figure |

**PERF VERDICT 🟡** — the sanctioned ceiling for a true-3D figure (the Glyph forward-pass in
depth, ANIMATION-MAP ⑤). Ship the 2D SVG version (A1) first; promote to OGL only if 2D proves
the concept and the weight earns it. Lazy-load below the fold, `rootMargin:'200px'`, one scene,
never above the fold, never during-scroll rAF.

### A7 · Three.js full scene
The Awwwards default (Bruno Simon's driving world, most FWA winners). **~150 KB+ gzip** before
your own scene code, plus loaders/physics.

| KB | Main-thread | GPU | Reduced-motion |
|---|---|---|---|
| 150 KB+ gzip (+scene) | high risk on a jank-sensitive site | high | static poster |

**PERF VERDICT 🔴 for this repo** — the perf/voice cost is wrong for a paper site whose owner
removed Lenis for jank. Only conceivable as a single lazy, below-fold, DPR-capped, paused scene
that is *demonstrably* smooth on a mid phone — and OGL (A6) reaches the same wow at 1/6 the
weight. Default answer: no.

### A8 · Canvas 2D bounded figure (in-view, paused off-screen, DPR-capped)
Hand-drawn particle/flow/benchmark motion the browser can't express in SVG cheaply. **Ref:**
standard creative-coding portfolio cards; the OffscreenCanvas+Worker pattern (web.dev) to get
it off the main thread.

| KB | Main-thread | GPU | Reduced-motion |
|---|---|---|---|
| 0–small | **moderate–high on main thread** unless moved to an OffscreenCanvas Worker (real lift) | raster cost scales with canvas px | static: last frame drawn to the canvas / a poster |

**PERF VERDICT 🟡→🔴** — allowed as a *bounded, in-view-gated, paused-off-screen* figure with
its own rAF that never runs during page scroll (the ANIMATION-MAP contract). But for anything
that reads as **floating dots it is auto-fail** (NO-LIST particle ban). Almost everything a
canvas would do here, SVG (A1/A2) does with less jank and more ink character — prefer SVG. Reach
for canvas only when the visual truly needs per-pixel motion, and budget the OffscreenCanvas
Worker if it's more than a few dozen elements.

### A9 · Variable-font kinetic axis (wght / opsz breathing)
Fraunces axes animated on scroll (already shipped, `--tm-wght`). **Ref:** the "one kinetic
variable axis" 2025 editorial move (INSPIRATION digest).

| KB | Main-thread | GPU | Reduced-motion |
|---|---|---|---|
| 0 | low, but **wght changes glyph advances → small Layout events** (PERF-AUDIT §3 measured ~469, 0.26ms each — acceptable, not free) | negligible | static: the settled weight |

**PERF VERDICT 🟢** — on-voice, keep. Don't multiply it across every heading (Layout cost is
per-element); one kinetic axis per chapter max.

### A10 · Client-side ML inference figure (ONNX Runtime Web / transformers.js, WASM/WebGPU)
The card doesn't *depict* the model — it **runs** it, on the visitor's own machine, zero server.
The owner already ships this: **`yadava5/jobtracker-classifier`** (in-browser int8 ONNX, 22.8 MB,
output-identical). **Ref:** transformers.js v3 + ONNX Runtime Web WebGPU EP; the "browser ML at
native speed" 2026 wave. Full economics in §E2.

| KB | Main-thread | GPU | Reduced-motion |
|---|---|---|---|
| runtime ~1–3 MB + model (int8 ONNX 22.8 MB for Applied; a Glyph MLP is tiny) — **all lazy, on demand, never in the critical path** | inference blocks main thread unless run in a Worker (do that) | WebGPU EP optional; **for tiny fast nets WASM often beats WebGPU** (upload/readback round-trip) | static: the pre-computed result frame (a real, sourced example) |

**PERF VERDICT 🟡 (huge story value).** This is the strongest "shows its work, not asserts it"
move on the board and it is **truly free + no cold-start** (§E2). Guardrails: load only on user
intent (a "run it" press) or on deep in-view, in a Worker, with the sourced static result as the
resting frame, and a size disclosure. Never auto-download 22 MB on scroll.

### A11 · Native browser-compute figure (CompressionStream, Web Crypto, etc.) — zero-dep, real
Some projects are *about* a browser-native primitive. `new CompressionStream('gzip')` is built
into every modern engine (Chrome 80+, Safari 16.4+, Firefox 113+) — jetpack-compress can gzip a
real sample **in the card** and show the **true** byte count/ratio, no library, no server, no
invented number.

| KB | Main-thread | GPU | Reduced-motion |
|---|---|---|---|
| 0 (native API) | low (streamed) | none | static: the real precomputed ratio on a sample |

**PERF VERDICT 🟢** — the honesty engine's dream: a real measurement, zero dependency. Use it to
make jetpack-compress's ratio *true* rather than depicted.

### A12 · Rive interactive vector / A13 · Lottie
Rive: GPU vector state machines, **~200 KB gzip WASM runtime**; Lottie: **~60 KB**, CPU SVG
renderer that janks with many active animations. **Ref:** Linear loads Rive; but SVG was 80.6%
of all animation exports in Aug 2025 precisely because the no-dep path wins for this scale.

**PERF VERDICT 🔴** — both are a second animation engine and new weight for effects GSAP+SVG
already cover in-voice. Rive's 200 KB is indefensible next to A1's 0 KB. Skip both.

### A14 · Image-sequence scrub (Apple-style pinned media)
Scroll scrubs a frame sequence in a pinned canvas. **Ref:** apple.com/iphone (26 sticky scenes).

**PERF VERDICT 🔴 here** — heavy image bytes + per-frame canvas draw, and it needs a pin (see
D2, one-pin rule). Our pinned "moment" is already spent on the AutoML pipeline, and it's *drawn*
(SVG), not a photo sequence. Don't.

**Library summary:** the green spine is **A1 + A2 + A3 + A9 + A11** — zero new KB, on-voice, and
they carry ~80% of the work. **A4/A5/A6/A10** are the sanctioned "innovative" stretch, each
bounded. **A7/A8(unbounded)/A12/A13/A14** are the traps.

---

# B. Per-surface prescriptions

Each surface: 1–2 concrete concepts · technique from §A · why it tells *that* story · the
**static/reduced-motion resting frame** (the honesty engine requires this to be a *truthful
resting picture*, never a frozen lie — the still must state what the motion states).

## The six project cards (the headline ask — replace the "old-fashioned" images)

> **Card-scale rule:** these live in the ch05 work rows and/or the case-file hero slot. They are
> **one-shot on scroll-in** (IntersectionObserver / `once:true`), **not pinned** (see D2). Each
> is a *figure that behaves*, sized to a card, with a labeled resting frame. Reuse A1 vocabulary
> so six cards read as one authored system, not six gimmicks.

### B1 · Applied — the inbox sorts itself (Gmail → 3-layer classify → dashboard)
**Concept — "the sorting line" (A1).** Message glyphs stream in from a Gmail/iCloud mark, down a
labeled 3-gate lane — **rules → e5 similarity → gated SetFit** (the SetFit gate is the clay
square) — and drop into labeled buckets (applied / interview / rejected / needs-review). Noise
becomes a sorted pipeline; the clay gate is where the model *defers to review*. The sample-mix
counts seed how many land where — but **only if those counts are proof-cited**, else animate the
sorting and label the buckets without inventing per-bucket numbers.
**Why it's the project:** the whole pitch is "your inbox already knows where you applied,
classified on a device you control." The gate *is* the privacy/honesty argument.
**Live upgrade (A10, optional, high-value):** a "classify a sample" press runs the **real
int8 ONNX classifier** (`yadava5/jobtracker-classifier`, already built) on 2–3 canned sample
emails, in a Worker, showing the actual predicted label + the **macro-F1 0.9791** provenance.
Recruiter-safe because it's client-side (no server to sleep). See §E2.
**Static frame:** the lane fully drawn, glyphs resting in their buckets, the SetFit gate marked
clay, the macro-F1 figure cited. Reads as "a 3-layer classifier that gates to human review."

### B2 · Cadence — plain English resolves into a plan (sentence → calendar chips + Meet)
**Concept — "the parse" (A1 + A2 + word-scrub from `TextMotion`).** A hand-typed English
sentence ("lunch with Sam next Tuesday at noon, add a Meet") sits in ink; on scroll-in its
spans **lift and resolve** into structured chips on a mini calendar grid — a *when* chip, a
*who* chip, a *duration* chip — and one **clay "Google Meet" link chip** snaps in last. The
sentence literally becomes the schedule.
**Why it's the project:** Cadence's idea is *natural language → committed calendar action*. Showing
the sentence dissolve into chips is the product's single sentence of value, performed.
**Static frame:** sentence on the left, resolved chips on the right, an arrow/thread between —
the before/after of one parse, at rest.
**Do NOT** do live LLM parsing from the static site (key-exposure, §E2/E3). Use 2–3 deterministic
scripted examples; the parse is choreography, not a live model call.

### B3 · Glyph — the marquee: SIMD lanes race, then the net reads a digit (C++ MLP)
**Concept A — "the race" (A1/A2).** Five horizontal ink lanes — **scalar vs 4 SIMD instruction
lanes** (label them from the repo: e.g. SSE / AVX2 / AVX-512 / NEON — whatever `bench_summary.csv`
actually names). Each tick, the scalar lane advances one cell; each SIMD lane packs *N* cells per
tick (the width of the vector), visibly outrunning scalar and **landing a clay tick at 3.5×**
(dot 256, the committed number). This is a *benchmark figure with real units and provenance*, not
a skill bar — render it as small-multiples/lanes with an axis, drawn in ink (ANIMATION-MAP ④'s
legality bar: no %, no glow, no dashboard chrome).
**Concept B — "watch it read a digit" (A1, ceiling A6/A10).** A 28×28 ink glyph feeds two labeled
hidden layers lighting L→R in an opacity wave into a 10-slot softmax row; the winning class
ink-fills + takes one clay tick (ANIMATION-MAP ②). **Live upgrade (A10):** the *actual* MLP runs
in-browser (tiny net → WASM, likely faster than WebGPU here, §E2) — "draw a digit, watch it read."
This is the best live-demo candidate on the site: tiny model, always-on, recruiter-safe.
**Why it's the project:** Glyph is pure math + memory + C++ + SIMD; the race shows the 3.5× brag
and the forward-pass shows "I build ML," on the one project that earns both.
**Static frame:** race lanes at their measured multipliers with the 3.5× clay tick and CSV
citation; forward-pass resting on a correctly-read digit. Both truthful stills.
**Second-pin temptation — resist:** the race is tempting to pin. Don't (D2). One-shot on scroll-in
holds it fine.

### B4 · LifeQuest — the honest prototype (gamified job-search missions)
**Concept — "the quest ledger" (A1 + `AuditRun` walk cadence).** A mission log where, on
scroll-in, a few missions resolve their state in sequence (tick / dash marks, the audit-walk
vocabulary) — but the framing is **explicitly "prototype."** Some quests resolve; some stay
**dashed/held** (the honesty engine's "not yet earned" mark, same as a held proof).
**Why it's the project:** LifeQuest's honest story is *a gamified prototype, not a shipped
product*. The visual must *carry that honesty* — a resting frame that shows unfinished quests is
the truth, and truth is the brand.
**Hard NO-LIST watch:** gamification pulls straight toward the bans — **no XP/skill bars, no
count-up with glow, no pulsing "available" badge, no emoji stat cards** (NO-LIST §A/B). Render
missions as an editorial ledger with ink ticks and clay held-marks, never progress bars.
**Static frame:** the mission ledger with its true mix of done/held marks and a visible
"prototype" label. The still tells the honest story on its own.

### B5 · jetpack-compress — the stream splits, threads work in parallel, output stitches (JDK 25)
**Concept — "split → parallel → stitch" (A1 + A11).** A ribbon of bytes flows in, **splits into
N horizontal lanes** (virtual-thread blocks), each lane compresses in parallel (the ribbon
visibly narrows per lane), then the lanes **re-stitch into one gzip member** with a member-header
mark; a clay tick marks the stitch seam. Concurrency made legible.
**Why it's the project:** jetpack-compress *is* JDK 25 virtual-thread parallel gzip — byte-stream
splitting into virtual-thread blocks stitched into one member. The split/stitch geometry is the
architecture, drawn running.
**Live upgrade (A11, on-voice + honest):** actually run `CompressionStream('gzip')` on a real
sample in the card and show the **true** compressed size/ratio — zero dependency, zero server, a
real number the honesty engine loves. (Native gzip ≠ the JDK impl, so label it "browser gzip on a
sample," not "this is jetpack's output" — honesty bar.)
**Static frame:** the split→parallel→stitch diagram at rest with the member seam marked and the
real sample ratio cited. JDK 25 + commit `af2c4b1` on the provenance line.

### B6 · Agentic AutoML — the card-level echo of the flagship
**Concept — "mini-run echo" (A1, reusing `PipelineRun` vocabulary at card scale).** A compact
version of the pinned scene: the run token travels a short 3–4-node lane and **halts at the clay
gate** — one-shot on scroll-in, not pinned (the pin is spent on the home ch04 scene). The card
whispers the thesis the flagship performs.
**Why it's the project:** AutoML already owns the site's pinned "moment"; the card just needs to
rhyme with it so the work section and the chapter agree.
**Static frame:** the mini-lane drawn to the gate, token resting clay at the halt — the same
honest "nothing runs until a human says go" resting picture as the flagship.

## Whole-page surfaces

### B7 · Hero (currently typographic — keep the voice, add a living substrate)
**Concept 1 — living paper (A3 + existing grain/contour).** Let the baked `feTurbulence` grain +
ink contour **drift a few px slower than the type** on scroll (A3 compositor scroll-timeline, or a
scrubbed transform on the contained LightField layer — never a re-blend on `<html>`, PERF-AUDIT
§3). The sheet breathes; the headline stays the hero.
**Concept 2 — the signature (A5, the one bounded WebGL wow).** A **matte halftone/dither** pass on
the portrait or a corner substrate — the ink-stipple the hero already fakes, made real and alive.
This is where "innovative visual" earns its keep *on-voice* (halftone = ink, not neon). Lazy, tiny
canvas, DPR-capped, paused off-screen, `WebGL→CSS-halftone→static-PNG` fallback chain (§E1).
**Green path if A5 is deemed too risky:** an SVG/CSS halftone (layered dot pattern + `mix` on a
*contained* element, no full-viewport blend) gets 80% of the look at 0 KB.
**Static frame:** the hero as it renders today (de-blurred, ink-settled, stipple-gained) — already
a complete, truthful still. The LCP fix from PERF-AUDIT #1 (shorten the entrance window) should
land alongside so the new substrate doesn't re-inflate LCP.

### B8 · Header / nav (owner says "too basic")
**Concept (A2 + `DayArc` read + `ChapterRail` state, all green).** Three cheap, on-voice lifts:
(1) a **section-aware active underline** on the top nav that draws (`link-draw`/A2) and tracks the
active chapter (the IntersectionObserver already computes it in `ChapterRail`); (2) a **day-arc sun
glyph** `○ → ◐ → ●` reading off `DayArc` progress (ANIMATION-MAP ⑥) so "scroll = one workday" is
legible in the chrome; (3) refined masthead micro-interactions (eased, not snapped). **NO-LIST
watch:** no floating glass nav that frosts/hides, no top *progress bar* (removed on purpose), no
mouse-follow anything.
**Static frame:** a normal, legible masthead + rail with the active item marked — no motion needed.

### B9 · The dusk transition (owner says "too sudden") — the choreographed scrub
**Problem:** `DayArc` currently does a **stepped flip** at `--waypoint-06` (ink snaps cream). The
owner wants a *choreographed* dusk.
**Prescription (A-none-new; timing + data work).** Replace the single step with a **multi-stop
oklch scrub across a bounded scroll range** (dawn→midday→golden→dusk→night), interpolating the
`--arc-l/c/h` channels continuously. **Two hard requirements:**
1. **WCAG AA at every intermediate stop.** The ink and every text layer must clear 4.5:1 (body) /
   3:1 (large) at *each* sampled stop, not just the endpoints. The repo already has `culori` (oklch)
   and a pre-verified waypoint system — sample the interpolated path at ~8–12 stops and assert
   contrast on each before shipping (this is a build-time check, not a runtime one). The ink flip
   from `--color-ink` to `--color-ink-dusk` must happen at the stop where the background crosses the
   contrast boundary, so text is *never* mid-flip illegible.
2. **Scope the var writes to the LightField container, NOT `<html>`.** This is the exact PERF-AUDIT
   §3 jank (86% of scroll cost was a `<html>` custom-prop write invalidating the whole tree). The
   choreographed dusk multiplies the write frequency — if it writes to `<html>` it will re-introduce
   the worst jank on the site. Non-negotiable: write to the fixed LightField wrapper.
**Static/reduced-motion frame:** each chapter still resolves to its correct time-of-day resting
color (the static world already ships day + dusk + night per chapter) — the scrub is the *tween
between* them, absent under reduced motion.

### B10 · Section hand-offs + depth (the "flows itself" continuity)
**Concept (A3/A4 small).** ~1 depth accent per chapter — the grain/contour drifts slower than type
(A3); a figure settles a beat after its caption; at chapter boundaries the outgoing folio and
incoming kicker **cross-fade with a hair of overlap** instead of hard-cutting. The Red Thread stays
the spine the eye reads the continuity along. **NO-LIST watch:** never a parallax hero fade-out;
paper depth, not glass; transform-only on already-composited layers; skip on mobile.
**Static frame:** flat, hard-cut sections — completely fine, just less silky.

### B11 · /evidence (the ledger that verifies itself)
**Concept (A1 via `AuditRun`, near-free).** A "verify every claim →" control walks all ledger rows
top-to-bottom, each earning its tick/ring/dash mark, settling into a tally line; a small "evidence
at a glance" header figure fills the airy top (ANIMATION-MAP ③). Port `AuditRun` wholesale —
timer-based, opacity-only, `role="status"`, keyboard-native, static-world instant.
**Why:** audit/reproducibility is the staff-eng magnet the evidence lens already scores highest on,
and it gives the master ledger a reason to be re-seen.
**Static frame:** the fully-adjudicated ledger with all marks resolved and the tally line — the
audit's end state, which is just the truthful ledger.

### B12 · Footer + micro-interactions (last-10% polish)
Footer: the thread pools toward a final mark at full night; quiet, no new mechanic. Micro-pass:
**restore the eased programmatic anchor scroll** (native rAF tween of `window.scrollTo`, ~1.2s
expo-out — the native-scroll shim currently hard-jumps, PREMIUM-FLOW #8); eased hover/focus tweens
on work rows, case links, rail marks (extend `link-draw`, the one sanctioned hover). No magnetic,
no cursor. All 🟢.

---

# C. Ranked build order (impact × risk) + parallelization

Ranked by **impact ÷ risk**. "Risk" folds perf hazard + spec-lock hazard + new-dep hazard.
Parallel-safe groups touch disjoint files so separate Fable builders won't collide. (The
composed-section choreography + pinned AutoML scene from PREMIUM-FLOW already exist — this order
is the *new* visual-card + whole-page layer on top of them.)

| # | Item | Surface | Technique | Impact | Risk | Build note |
|---|---|---|---|---|---|---|
| **1** | Applied sorting line | B1 | A1 | ★★★★★ | ●○○ | flagship card; pure reuse of pipeline vocab |
| **2** | Glyph SIMD race + forward pass (2D) | B3 | A1/A2 | ★★★★★ | ●●○ | marquee "I build ML"; 3.5× is real; watch stat-bar ban |
| **3** | jetpack-compress split/stitch + real gzip | B5 | A1+A11 | ★★★★☆ | ●○○ | novel concurrency viz; A11 gives a *true* number |
| **4** | Cadence parse | B2 | A1+A2 | ★★★★☆ | ●○○ | crisp product-value story; scripted, not live |
| **5** | Agentic AutoML card echo | B6 | A1 | ★★★☆☆ | ●○○ | cheap rhyme with the flagship |
| **6** | LifeQuest quest ledger | B4 | A1 | ★★★☆☆ | ●●○ | honesty-critical; easiest to trip the gamification bans |
| **7** | Dusk choreographed scrub | B9 | timing+data | ★★★★☆ | ●●● | high impact, **highest perf risk** — the `<html>`-write trap |
| **8** | Header/nav + sun glyph | B8 | A2+DayArc | ★★★☆☆ | ●○○ | orientation; near-free |
| **9** | /evidence audit-walk | B11 | A1 (`AuditRun`) | ★★★☆☆ | ●○○ | near-free port; closes the ledger gap |
| **10** | Section hand-off + depth | B10 | A3/A4 | ★★★☆☆ | ●●○ | the "flows itself" glue; Firefox-safe via `@supports` |
| **11** | Hero living substrate (green path) | B7-1 | A3 | ★★★☆☆ | ●●○ | grain drift; do LCP fix (PERF-AUDIT #1) in same pass |
| **12** | Micro-interaction + eased scroll | B12 | A2 | ★★☆☆☆ | ●○○ | fixes the nav hard-jump regression |
| **13** | Applied / Glyph LIVE inference | B1/B3 | A10 | ★★★★☆ | ●●○ | biggest "shows its work"; gate behind intent (§E2) |
| **14** | Hero halftone signature | B7-2 | A5 | ★★★★☆ | ●●● | the one bounded-WebGL wow; only if the fallback chain is real |
| **15** | Glyph forward-pass in true 3D | B3 | A6 (OGL) | ★★★☆☆ | ●●● | stretch ceiling; only after the 2D version proves out |

**Parallelization (disjoint files → safe to fan out):**
- **Group α (card figures, each its own component + its own work-row/case slot):** #1 Applied,
  #2 Glyph, #3 jetpack, #4 Cadence, #5 AutoML echo, #6 LifeQuest. Six builders can run in parallel —
  each new component is self-contained; the only shared touch is the work-row container in ch05, so
  one builder owns the row-wrapper contract and the rest fill slots.
- **Group β (world/chrome):** #7 dusk (`DayArc.tsx`/`LightField.tsx`), #8 header (`Header.tsx`/
  `ChapterRail.tsx`), #10 section hand-off (`globals.css`/StoryShell), #11 hero (`globals.css`/
  StoryShell). **β conflicts internally** — #7, #10, #11 all touch `globals.css`/DayArc/StoryShell;
  serialize within β or assign one owner. β is disjoint from α.
- **Group γ (leaf pages/polish):** #9 /evidence (`evidence/page.tsx`), #12 micro (`SmoothScroll.tsx`
  + hovers). Fully disjoint from α and β.
- **Group δ (live/stretch, gated on their 2D versions existing):** #13, #14, #15 — build last, each
  behind a feature check + fallback; do not let them block α/β/γ.
- **Item G — the Frame Governor + tier system (`§F`):** a world-layer module, **Wave 2 with Group β**
  (it edits `layout.tsx`'s inline stamp + `SmoothScroll.tsx`, and ships a tier CSS layer in
  `globals.css` — β territory). It is a **prerequisite for Group δ**: every stretch item (#13/#14/#15)
  gates its mount on the governor being green (§F3), so the governor must land before δ. It does NOT
  block α — the card figures are all Core-tier and ship tier-agnostic (they just read `data-tier`).

**Recommended wave plan:** Wave 1 = α (all six cards, all Core-tier) ∥ #8 ∥ #9 ∥ #12. Wave 2 =
**Item G (governor) first**, then #7 → #10 → #11 (serialized β; the dusk scrub #7 should consume the
governor so it can auto-coarsen on downshift). Wave 3 = δ (#13 → #14 → #15), each gated on the
governor (§F3) and only if its resting/2D frame already ships.

**Minimum-tier per Section-B item** (full spec + governor design in **§F**):

| Item | Min tier to see *anything* | Core (mid-range mobile 60fps) | Full-only garnish |
|---|---|---|---|
| B1 Applied sorting line | Core | ✅ full figure | live ONNX classify = opt-in (§F4) |
| B2 Cadence parse | Core | ✅ full figure | — |
| B3 Glyph race + fwd-pass (2D) | Core | ✅ **with node budget (≤~60 nodes)** | 3D fwd-pass (A6/OGL) |
| B4 LifeQuest ledger | Core | ✅ full figure | — |
| B5 jetpack split/stitch | Core | ✅ figure; real gzip on tap | — |
| B6 AutoML echo | Core | ✅ full figure | — |
| B7-1 hero grain drift | Core | ✅ (compositor A3) | — |
| B7-2 hero halftone | **Full** | CSS/SVG halftone fallback = Core | WebGL shader (A5) |
| B8 header + sun glyph | Core | ✅ | — |
| B9 dusk scrub | Core | ⚠️ **Core = coarsened scrub; Full = fine multi-stop** | fine scrub |
| B10 section depth | Core (cross-fade only) | ⚠️ **parallax/depth skipped on mobile** | scroll-linked depth (A4) |
| B11 /evidence audit-walk | Core | ✅ | — |
| B12 micro + eased scroll | Core | ✅ | — |
| Print floor (all of the above) | **Print** | resting stills → authored monograph (§F1c) | — |

---

# D. Hard constraints for builders (any violation = auto-fail)

> **AMENDED 2026-07-30 — read `docs/NO-LIST.md` §F before building world layers.**
> The owner reviewed three hero prototypes and chose a richer, darker, more
> atmospheric direction than this brief was written for. Two constraints below
> are narrowed and two are re-affirmed:
> - **D3's** "no full-viewport background re-blend on scroll" and **§E1's** 🔴 on
>   background WebGL are narrowed by **NO-LIST F1/F2**: a warm, grain-bearing,
>   arc-driven ink field that draws **only while the day-arc is changing** — and
>   idles at zero frames — is permitted, Full-tier, behind a WebGL2 → CSS → static
>   fallback chain. The 🔴 was on *persistent* backgrounds; this is not one.
> - **D2 (one pin) and D4's one-rAF rule are RE-AFFIRMED, unchanged.** The
>   owner's "a whole slide slides down, like Apple" is satisfied by the composed
>   per-chapter entrance §A of PREMIUM-FLOW-PLAN already adopted, plus B10's
>   boundary cross-fade, plus the world stepping in discrete beats behind content
>   that never moves. Not a second pin. Not scroll-snap.
> - **D5, D6 and D7 are untouched and bind the new work hardest**: the field needs
>   an authored resting frame, may state nothing it cannot prove, and must still
>   screenshot as this paper.

**D1 · Native scroll only.** GSAP ScrollTrigger reads native `window` scroll. **Never reintroduce
Lenis** (it's a vestigial unused dep — safe to remove while here). No wheel listeners, no
`preventDefault` on scroll, no scroll-snap, no wheel-hijack, no touch smoothing (NO-LIST §C/E).

**D2 · ONE pin, already spent.** Amendment **A8** permits exactly one pinned chapter, and the AutoML
pipeline (`PipelineRun`, ch04) uses it. **Every card figure in §B is one-shot on scroll-in
(IntersectionObserver / `once:true`), NOT pinned.** — *Is a second pin worth amending A8?* **No,
recommended.** The tempting candidate is Glyph's SIMD race/forward-pass, but (a) a second pin adds
pinned scroll distance that moves the Red Thread's measured landmarks and would fight
`red-thread.spec.ts` + `scroll-engine.spec.ts` (the exact hazard `PipelineRun` documents), (b) it
dilutes the flagship's singularity — the pin *is* the AutoML thesis; a second pin makes neither
special, and (c) one-shot scroll-in holds a card figure perfectly without pin-spacer risk. If a
future builder still wants it, that is a rule-change proposal requiring re-validation of both scroll
specs — flag it, don't just do it.

**D3 · Property whitelist.** `transform` / `opacity` / `clip-path` only, **plus** the one sanctioned
`stroke-dashoffset`. No animating layout props (top/left/width/height/margin). No `mix-blend` or
full-viewport background re-blend on scroll. No `will-change` littering (the site ships zero — keep
it). No blur on mobile (hero de-blur is the only blur, load-only).

**D4 · Quantized paint budget (PERF-AUDIT).** Contain paint (`contain: paint`) on every figure.
**Scope all CSS custom-property writes to the smallest container, never `<html>`** — the DayArc
`<html>`-write was 86% of scroll cost; the choreographed dusk (B9) must not repeat it. In-view-gate
and pause-off-screen every rAF; there is **one scroll loop** — no page-scroll-time second rAF (the
only allowed standalone rAF is a *bounded, in-view, paused-off-screen* figure/canvas). Debounce
`ScrollTrigger.refresh()` on resize. Re-run `npm run test:e2e:performance` + the PERF-AUDIT
Lighthouse batch after B7/B9/B10/B11.

**D5 · Triple-gate every motion.** Behind `prefers-reduced-motion: no-preference` **and**
`:not([data-motion-off])` (the header "motion: on" toggle) **and** `[data-motion-ready]`. The
**static end-state must equal the animation's final frame** (amendment A7). The site already ships a
complete static world — every new figure needs its designed static resting frame, and (D6) that
frame must be *true*.

**D6 · No invented metrics — the honesty engine.** Every number, label, or state a visual displays
must trace to a `proofManifest` / `src/lib/data` proof-cited value (macro-F1 0.9791, 3.5× dot-256
from `bench_summary.csv`, JDK 25 @ `af2c4b1`, ONNX 22.8 MB, sample-mix counts). **The reduced-motion
resting frame must be a truthful still, never a lie** — LifeQuest's still shows an unfinished
prototype; the AutoML still shows the *halt*, never a resolved deploy or a granted approval; a live
demo (A10/A11) that can't run shows its real precomputed result, not a fake success. If a number
isn't proof-cited, the visual shows the *behavior* (the sorting, the parse, the split) and omits the
number — it never fabricates one.

**D7 · Daylight-Study palette + type stay.** The tokens table at the top of this brief is the whole
world. No new face, no gradient text, no purple/cyan/neon, no glow, no glass, no mesh gradient. The
ember `--color-clay-ember` is spent once (the inked APPROVED) — no new visual touches it. A static
screenshot of any new visual must still read unmistakably as this paper (grain visible, an accent or
thread present, Fraunces voice) — NO-LIST §D.

**D8 · New-dependency gate.** Zero-new-dep (A1/A2/A3/A9/A11) is always preferred. Any new dep
(A5 shader lib, A6 OGL, A10 ORT Web) must be: lazy-loaded below the fold, in-view-gated,
paused-off-screen, DPR-capped, behind a fallback chain to a static frame, and *demonstrably* smooth
on a mid-tier phone (headless Chromium trace, not the embedded pane). three.js (A7), Rive/Lottie
(A12/A13), and image-sequence pins (A14) are declined for this repo.

---

# E. Free / very-cheap GPU + compute to raise production value

Honesty bar held: **no recommendation without a verified free-tier limit**, and **a dead demo is
worse than no demo** — anything that sleeps, cold-starts, rate-limits, or exposes a key at a random
recruiter click is flagged. Ordered by relevance to a **static-export, no-server** site on GH Pages.

## E1 · Visitor-side GPU (truly free, always available) — WebGL / WebGPU on the visitor's machine
The visitor's own GPU is the only *truly* free, *always-on*, *zero-cold-start*, *zero-rate-limit*,
*zero-key-exposure* compute a static site has. This is the safest place to spend "GPU budget."

- **WebGPU coverage (mid-2026): ~82% global.** Chrome/Edge 113+, Safari 26+ (macOS Tahoe/iOS 26),
  **Firefox still the holdout** (enabled on Windows via 141 / macOS ARM via 145, but off by default
  broadly). Spec hit Candidate Recommendation March 2026.
- **Mandatory fallback chain:** `WebGPU → WebGL2 → static poster/SVG`. Never assume WebGPU; detect
  `navigator.gpu`, fall to WebGL, then to the reduced-motion still. This is the same triple-gate
  discipline (D5) with an extra capability rung.
- **Safe tier for THIS site:** a **bounded, below-fold, in-view-gated, paused-off-screen, DPR-capped**
  shader/scene — i.e. A5 (halftone hero) or A6 (OGL forward-pass), never a page-scroll-time or
  above-the-fold GPU load. Fullscreen persistent WebGL backgrounds stay 🔴 (the jank the owner fled).
- **Does it change any §A verdict?** No upgrades to green — it *confirms* A5/A6 as 🟡 (bounded) and
  A7 as 🔴. WebGPU's 82% (Firefox gap) is exactly why every GPU path needs the WebGL/static fallback;
  it does not make a persistent 3D background safe.
- **Cost / limits / cold-start / privacy:** $0, no account, no rate limit, no cold-start, nothing
  leaves the device. The only "cost" is the visitor's battery/GPU — hence *bounded + paused*.
- **Upgrades:** B7 (hero halftone), B3-C (Glyph 3D forward pass). **Verdict 🟢 as the GPU home** —
  spend GPU on the visitor's machine, bounded, with a fallback, not on a server.

## E2 · Free hosted inference that could power LIVE, embedded demos
The prize: a card that **runs the real model**. But on a static export there's **no server to hide
an API key or absorb a cold start**, so the options split sharply.

**(a) Client-side inference — ONNX Runtime Web / transformers.js (the recruiter-safe winner).**
Runs on the visitor's own CPU/GPU, zero server. The owner **already ships** `yadava5/jobtracker-
classifier` (in-browser int8 ONNX, 22.8 MB, output-identical) and could host the Glyph MLP the same
way. If that Space is a **static (client-side) Space, it never sleeps** — it's just static hosting +
a model file; a recruiter clicking at 3am gets a live model. Cost $0, no rate limit, no key, private
(nothing leaves the browser). Caveats: the model download is real weight (22.8 MB for Applied —
**load on a "run it" press, not on scroll**, in a Worker; disclose the size); for a *tiny* net like
Glyph's MLP, **WASM usually beats WebGPU** (the WebGPU CPU↔GPU round-trip dominates a small fast
pass). **Verdict 🟢 — the only live-demo path with no cold-start/rate-limit/key risk.** Upgrades B1
(Applied classifies a sample), B3 (Glyph reads a drawn digit).

**(b) Hugging Face Spaces — server-backed (Gradio/Docker) — ⚠️ cold-start risk.** Free CPU Basic
Spaces **sleep after 48h inactivity** and restart on visit → a **cold start the recruiter waits
through** (a dead/slow demo). **ZeroGPU free** is ~**3.5–5 min of GPU/day** (2 min unauthenticated),
max **2 ZeroGPU Spaces** per free account — burns out fast and returns quota errors. The owner's
`yadava5/utilization-risk-demo` (if it's a Gradio/server Space) carries exactly this risk. **Verdict
🟡→🔴 for an embedded portfolio demo** — fine as an *outbound link* ("open the live Space") with an
honest "may take a moment to wake" note, never as an inline widget a recruiter expects to be instant.
Prefer (a) for anything embedded.

**(c) Cloudflare Workers AI — free, edge, no cold-start — the best *server* option.** **10,000
neurons/day** free (no card, no time limit), resets 00:00 UTC; ~8,300 image classifications or
~1,300 LLM responses/day; runs at the edge (no sleep, low latency). Hard-stops at 10k with an error
(4006), shared pool across models. **Key-exposure caveat:** calling it from a *static* page would
expose the token — you'd need a tiny free Cloudflare **Worker** to hold the key server-side (minor
infra, still $0). **Verdict 🟡 (good, with a Worker proxy + graceful fallback).** Best fit if a demo
truly needs a bigger model than the browser can run; must degrade to a static result at the daily
cap. Upgrades a heavier B1/B2 variant if ever wanted.

**(d) Groq / Google Gemini free APIs — generous limits, wrong shape for static.** Groq free:
~14,400 req/day (llama-3.1-8b), 30 RPM. Gemini free: ~1,500 req/day (Flash), 1M TPM (but **enabling
billing deletes the free tier**, and free prompts may train the model). **Blocking problem for THIS
site:** no server → **the API key ships in client JS = exposed/abusable.** **Verdict 🔴 for direct
static use**; only viable behind a Worker proxy (E2c infra), and even then Cadence/Applied are better
served by deterministic scripted parses (B2) or client-side ONNX (E2a) than a live LLM call. Don't
put a raw key in the bundle.

**Bottom line for live demos:** default to **E2a (client-side ONNX/WASM)** — it's the only one that
is free, always-on, un-rate-limited, key-safe, and private. Use **E2c (Workers AI via a Worker)**
only if a demo needs more than the browser can carry, always with a static fallback at the cap.
Treat **E2b/E2d** as outbound links, never embedded widgets.

## E3 · Other free production-value raisers
- **Native browser compute (A11) — $0, zero-dep, always-on.** `CompressionStream('gzip')`,
  `SubtleCrypto`, `Intl`, `OffscreenCanvas` — real computation with no server, no key, no limit. The
  honest, always-available way to make jetpack-compress's ratio *true* (B5). **Verdict 🟢.**
- **Free CDN for heavy assets (jsDelivr / unpkg / Cloudflare).** Serve the ONNX runtime/model (E2a),
  a shader lib, or OGL from a CDN so it's cached cross-site and off GH Pages' bandwidth. Free,
  reliable. Caveat: adds a third-party origin (a privacy/SPOF consideration) and the site's strict
  self-contained ethos may prefer self-hosting in the export — decide per asset. **Verdict 🟢
  (assets), with a self-host option.**
- **Vercel Hobby as a GH-Pages escape hatch — ⚠️ commercial-use ban.** 100 GB/mo bandwidth free, but
  Hobby **prohibits commercial use**, and Vercel defines that broadly (any deployment tied to anyone's
  financial gain — a portfolio that lands paid work arguably qualifies). If static-export constraints
  ever bind (needs SSR/edge functions), **Cloudflare Pages is the cleaner free escape hatch** (no
  commercial restriction, generous bandwidth, and pairs with E2c). **Verdict 🟡 — keep GH Pages;
  if you must leave, prefer Cloudflare Pages over Vercel Hobby for a portfolio.**
- **Free, zero-cost analytics.** **Cloudflare Web Analytics** — free, cookieless, GDPR-friendly, edge
  (tiny beacon, ~no perf cost), but **samples heavily (~10%)**, no custom events, 6-month retention.
  Vercel Web Analytics is cookieless too but only free/meaningful on Vercel hosting. For a GH-Pages
  portfolio, **Cloudflare Web Analytics** is the near-zero-perf, privacy-first pick; if richer events
  are ever needed, a self-hosted Plausible/Umami is the next rung (small cost). **Verdict 🟢
  (Cloudflare Web Analytics).**

**Section E honest summary:** the static-export + no-server shape means the reliable free compute is
**the visitor's own machine** (E1 GPU, E2a client-side ML, E3 native APIs) — always-on, key-safe,
private, no cold-start. Every *server* free tier (HF server Spaces, Workers AI, Groq, Gemini) carries
a cold-start, rate-limit, or key-exposure risk that violates "a dead demo is worse than no demo" for
an inline widget — so they belong behind an outbound link or a tiny Worker proxy with a static
fallback, never as the thing a recruiter's random click depends on.

---

# F. Adaptive quality tiers — every tier authored

> **The equity principle (load-bearing).** Spending "GPU budget" on the visitor's machine (§E1)
> must NEVER *categorize* visitors — an old laptop or a $150 phone gets a **different-but-equally-
> authored** portfolio, never a broken or second-class one. There is no "degraded" tier here; there
> are **three intentional editions of the same study.** The default everyone starts in (Core) is the
> real portfolio; Full merely adds garnish for machines that prove they can; Print is a designed
> monograph, not a failure state. A dead or janky experience is a worse portfolio than a still one —
> so when in doubt, the site serves *down*, and every "down" is a place we authored on purpose.

## F1 · The three editions

### (a) Full — the Core spine + stretch garnish
Core spine (below) **plus** the sanctioned stretch garnish (A5 hero halftone, A6 OGL 3D, A10 WebGPU
inference) mounted *additively* on top. Full is not a different build — it's Core with extra layers
that only appear once the machine has proven itself (§F3). Losing a machine's Full eligibility just
unmounts the garnish back to the intact Core figure; nothing structural moves.

### (b) Core — the SVG/GSAP spine (the real portfolio, the universal default)
Everything in the green library spine (A1/A2/A3/A9/A11): the six card figures, the composed section
choreography, the pinned AutoML scene, the audit-walks, the sun glyph, the eased scroll. **This is
the tier every visitor with motion enabled starts in, and it must hold a steady 60fps on a mid-range
2023-class phone** (~Moto G / A-series, 4× CPU throttle ≈ the PERF-AUDIT trace bar). Confirmed per
Section-B prescription:

- **Core-clean (ship as-is on mobile):** B1, B2, B4, B5, B6, B7-1, B8, B11, B12. All are
  opacity/transform/`stroke-dashoffset`, in-view-gated, one-shot — the case-page PERF-AUDIT trace
  (0% frames >25 ms) is the proof these are safe.
- **Core with a budget — B3 (Glyph):** the forward-pass opacity wave is fine **only if node count is
  bounded (≤~60 nodes, sparse meaningful edges)**. Above that, the many simultaneous opacity tweens
  can miss frame on a mid phone. Keep the net small; it also keeps it legible (not a particle field).
- **Core-reduced variants required (do NOT ship the desktop version to mobile):**
  - **B9 dusk scrub** — the fine multi-stop oklch scrub is a full-viewport contained repaint per
    frame; on mid-range mobile that is the single most likely Core frame-miss. **Core-mobile variant:**
    fewer stops + a lower update cadence (e.g. quantize the scrub to ~8–12 discrete eased steps rather
    than per-frame), still scoped to the LightField container (never `<html>`). The fine per-frame
    scrub is a **Full** upgrade. The governor (F2) must be wired to auto-coarsen B9 on any downshift.
  - **B10 section depth/parallax** — the differential-motion depth accent is **desktop/Full only**
    (the existing brief already says "skip on mobile"). Core-mobile keeps the cross-fade hand-off but
    drops the parallax. No mobile visitor loses information — depth is texture, not content.
- **B7-2 hero halftone** is **not** Core — its Core fallback is a CSS/SVG halftone (0 KB), and its
  hard floor is a static poster. The shader itself is Full-only.

> **Builder action:** for each card figure, verify the Core variant against a headless-Chromium 4×-CPU
> scroll trace (the PERF-AUDIT harness), not the embedded pane. Any prescription that can't hold 60fps
> at that bar must ship its Core-reduced variant *before* it ships at all — mobile is the gate, not an
> afterthought.

### (c) Print Edition — the static world reframed as a premium printed monograph
The hard floor (reduced-motion, motion-off, JS-dead, or a governor full-downshift) is the existing
complete static world (amendment A7). Today it reads as "the animation's final frame." **The ask: make
it read as an *authored printed monograph of the study* — deliberate editorial stillness, not a
fallback.** This is **small additive CSS on the resting DOM, never a rebuild** (the DOM is already the
final-frame DOM; we're dressing it as print). Per surface:

- **Every settled figure → a captioned plate.** A Fragment-Mono caption + folio/plate number under
  each resting card figure (`fig. 5.2 — the sorting line`), and its **proof provenance rendered as a
  printed source footnote** (`macro-F1 0.9791 · bench @ c6e5c0b`). The case files already own this
  plate/receipt vocabulary — extend it to the six card stills and the home figures.
- **Hairline print frames / rules.** A 1px ink hairline plate-frame (or a top+bottom folio rule)
  around each figure block, so a still figure reads as a *boxed illustration on a page* rather than a
  paused animation. Reuse the folio-rule token already used between chapters; do not invent chrome.
- **Print title-page treatment for the hero.** The ink-settled headline + masthead already resolve to
  a strong still; add a small "the study, in print" dateline/edition line (Fragment Mono) so the top
  of the page announces itself as a monograph, not a broken hero.
- **Dusk in print = correct static time-of-day per chapter.** Each chapter already resolves to its own
  resting tone; print keeps that (dawn→night as printed ink tones), so the "one workday" arc survives
  as a sequence of printed pages rather than a scrub.
- **/evidence in print = the fully-adjudicated audit table** with all marks resolved and the tally line
  — already the audit's end state; frame it as a printed ledger.

Cost: one additive CSS layer keyed on `[data-tier="print"]` (plus the reduced-motion/motion-off
selectors it aliases). No JS, no new DOM. **Honesty bar:** every caption/number in the print edition is
still proof-cited (D6) — the monograph states exactly what the motion states, at rest.

## F2 · The Frame Governor (world-layer module, ~1–2 KB, no deps)

A tiny runtime that measures **real** frame timing and moves the tier **down** when a device is
actually struggling — *measurement, not device-sniffing* (a sniff mislabels a throttled flagship and a
fast budget phone alike; timing is ground truth). Lives beside `SmoothScroll`/`DayArc` in the world
layer, mounts in Wave 2.

**What it measures (only while the page is actually being scrolled/interacted — never an idle rAF):**
- `PerformanceObserver({ type: 'longtask' })` — long tasks >50 ms (the >50 ms tasks the PERF-AUDIT
  home trace still had 4 of).
- rAF-delta sampling during active scroll — frame gaps, flagging >32 ms (dropped below 30fps) and
  >50 ms (severe), hooked to the existing scroll activity so it costs nothing when idle.

**Downshift logic (jank-score with built-in hysteresis — recommended):**
- Maintain a decaying `jankScore`. Each bad frame adds: `+1` (>32 ms), `+2` (>50 ms), `+4` (>100 ms);
  each longtask `+2`. The score **decays ~1/sec of smooth active scrolling.**
- **Downshift one rung when `jankScore ≥ 8` sustained** (i.e. the decay can't keep up — a single GC
  pause or scroll-start hitch adds 2–4 and decays away; only *sustained* jank crosses 8). This decay
  model *is* the hysteresis — no single blip downshifts.
- **Downshift is one-way, mid-session only. Never upshift mid-read.** Full → Core unmounts garnish;
  Core → Print disables motion and reveals the print edition (seamless because static === final frame,
  D5 → zero CLS on the swap). Print is the hard floor; the governor never goes below it.
- **The governor keeps watching for the whole session** (not just first scroll) so thermal throttling
  that kicks in after 30 s of a Full shader is caught and downshifted.

**Persistence + first-load tier:**
- Persist the **lowest tier reached this session** to `sessionStorage` (e.g. `study-tier-cap`). This is
  the *ceiling* for subsequent navigations this session — a device that fell to Core won't re-attempt
  Full garnish on the next page (no re-jank, no flicker). `sessionStorage` (not `localStorage`) is
  deliberate: conditions change between visits and devices get borrowed; a bad afternoon shouldn't
  brand the device forever.
- **First-load tier** is stamped **synchronously in the existing `layout.tsx` head script** (the same
  place `data-motion-ready` is set, before first paint, no FOUC): `print` if reduced-motion or
  motion-off; else `min(capabilityCeiling, sessionStorage cap)` — which is **Core** for everyone by
  default (Full garnish is never stamped at load; it only mounts later via §F3). So the universal
  first paint is Core (or Print), never a Full flash that then collapses.

**API surface builders consume (scenes stay ignorant of the mechanism — mirror `data-motion-off`):**
- **`data-tier="full|core|print"` on `<html>`** (alongside `data-motion-ready`/`data-motion-off`).
  CSS-only scenes react with selectors: `[data-tier="print"] [data-scene] { animation: none }`,
  `[data-tier="full"] [data-garnish] { display: … }`. This is how a card figure "downgrades" — it
  doesn't; its Core form is the default and CSS just withholds the Full garnish.
- **`useTier(): { tier, stableForMs, subscribe }`** — a React hook mirroring the existing
  `useLenis()` / `readStoredMotionOff()` pattern in `SmoothScroll.tsx`. A mounted garnish scene
  subscribes and **unmounts itself** when `tier` drops below its `minTier`. A scene declares its
  `minTier` and reads the current tier; it never touches PerformanceObserver, thresholds, or storage.
- **Composition with the triple motion gate (the gate always wins):** reduced-motion **or** motion-off
  force `data-tier="print"`, disable the governor, and no rAF runs — the hard floor. `data-motion-ready`
  is still required for any motion at all. The governor operates **only inside the motion world**, and
  only ever chooses between `full` and `core`, with `print` as the floor it can drop to but the gate
  can also force. Precedence: **motion gate → governor → scene `minTier`.** No scene may promote itself
  above what the governor grants.

## F3 · Stretch-tier gating (when Full garnish is allowed to mount)

A stretch item (§C #13/#14/#15) mounts its garnish **only when ALL hold** (checked at a deferred,
post-load idle moment — never blocking first paint):
1. **Capability probe passes** for that item: A5/A6 need a creatable **WebGL2** context; A10 WebGPU
   inference needs `navigator.gpu` (else it takes the WASM path, which is Core-eligible, not garnish).
2. **Governor green for N seconds** — `useTier().stableForMs ≥ 3000` of *accumulated smooth active
   scrolling* at Core (proof the spine is smooth on this machine before adding GPU/CPU load).
3. **`navigator.connection.saveData !== true`** (respect Data Saver) and, if exposed,
   `effectiveType` not `2g`/`slow-2g`.
4. **Viewport ≥ the garnish breakpoint** (recommend ≥1024 px) — shader/3D garnish is desktop-first;
   phones don't get it even when capable, to protect battery/thermal. (Tiny live-inference nets are
   the exception — see §F4.)
5. Optional soft hint: `deviceMemory ≥ 4`. Hint only, never a hard gate (spoofable/coarse).

**Fallback chain per stretch item (each rung is itself authored):**
- **B7-2 hero halftone (A5):** WebGL2 shader → **CSS/SVG halftone** (Core, 0 KB) → **static halftone
  PNG poster** (Print).
- **B3-C Glyph forward-pass (A6/OGL):** OGL 3D → **2D SVG forward-pass** (Core) → **settled correctly-
  read digit still** (Print).
- **B1/B3 live inference (A10):** WebGPU → **WASM** (Core, tap-to-run) → **precomputed sourced result**
  (Print). See §F4.
- **B9 dusk (not garnish, but tiered):** fine per-frame scrub (Full) → **coarsened stepped-eased scrub**
  (Core) → **static per-chapter time-of-day tones** (Print).
- **B10 depth (not garnish, but tiered):** scroll-linked parallax (Full/desktop) → **flat cross-fade**
  (Core) → **hard cut** (Print).

On any governor downshift, a mounted garnish unmounts to the next rung down with no layout shift
(the rungs share footprint by construction — D5).

## F4 · Live-inference equity (restated for builders)

The point of client-side inference (§E2a) is that it runs on *any* machine — so it must not become a
way to categorize:
- **Tiny nets → WASM, runs on any phone CPU.** Glyph's MLP is small; the **WASM path** (ONNX Runtime
  Web / transformers.js) executes on a low-end CPU in tens of ms and **beats WebGPU** for it (the
  CPU↔GPU round-trip dominates a small pass). **Glyph's tiny net may auto-run** on deep in-view (in a
  Worker), Core-tier — it's small enough not to categorize anyone. WebGPU is a Full *speed* garnish,
  never a gate to *whether* the demo runs.
- **Applied's 22.8 MB int8 ONNX → strictly tap-to-run, with a size label, never auto-download.** The
  button reads its real weight (`run the classifier · 22.8 MB`); on tap it downloads in a Worker with
  visible progress, then classifies. **Respect `navigator.connection.saveData`** — under Data Saver,
  don't auto-anything; keep it explicit and warn on cost. The resting frame is the **precomputed,
  sourced result** (macro-F1 0.9791) so the card is complete and honest for a visitor who never taps.
- **A dead or janky demo is worse than no demo.** The static result is the contract; the live run is a
  bonus the visitor opts into. Never let a live path be the only way a card states its claim, and never
  auto-pull megabytes on a metered or slow connection.

## F5 · Governor build checklist (for the Wave-2 builder)

- [ ] Extend `layout.tsx` head script to stamp initial `data-tier` (print | core) synchronously from
      reduced-motion/motion-off + `sessionStorage` cap — before first paint, no FOUC.
- [ ] Ship `governor.ts` (~1–2 KB, no deps): longtask observer + scroll-gated rAF sampler + decaying
      jankScore + one-way downshift + `sessionStorage` cap write.
- [ ] Ship `useTier()` mirroring `useLenis()`; export `data-tier` writes + a subscribe channel.
- [ ] Ship the `[data-tier="print"]` **authored-monograph CSS layer** (§F1c) in `globals.css`.
- [ ] Wire B9 (dusk) and B10 (depth) to auto-coarsen on downshift; wire δ garnish to §F3 gates.
- [ ] Verify: reduced-motion/motion-off force `print` and disable the governor (gate wins); downshift
      causes **zero CLS** (static === final frame); no idle rAF when not scrolling; Core holds 60fps at
      4× CPU in the headless harness on every Section-B figure.

---

## Appendix — research sources (US web, July 2026)

Techniques: Awwwards Annual 2025 (Lando Norris SOTY / Messenger Dev-Site-of-Year), Bruno Simon 2025
(three.js+Cannon.js); Cassie Evans / Astro SVG portfolio; OGL (oframe) ~29 KB minzipped; Stripe
`minigl` ~10 KB mesh-gradient writeups; Maxime Heckel dithering/halftone shader series + Codrops
"Efecto" (Jan 2026) + `paper-shaders`; MDN/Chrome DevRel/Josh Comeau on `scroll-timeline`/`view-
timeline` (Chrome 115+, Safari 18+, Firefox flagged); Codrops/zigpoll/GSAP-forum on `feTurbulence`/
`feDisplacementMap` CPU cost; Frontend Masters "deep card" + Codrops CSS voxel + 30-seconds
isometric-card; web.dev OffscreenCanvas/Worker; Rive-vs-Lottie-vs-SVG bundle/perf (2026).
Free compute: caniuse/web.dev/byteiota WebGPU ~82% coverage 2026; HF Spaces GPU + ZeroGPU docs
(48h sleep, ~3.5–5 min/day, 2-Space cap); Cloudflare Workers AI free 10k neurons/day; transformers.js
v3 + ONNX Runtime Web WebGPU EP; Groq (14.4k req/day) + Gemini (1.5k req/day) free-tier writeups;
Vercel Hobby 100 GB + commercial-use ban; Cloudflare vs Vercel Web Analytics (cookieless, sampled).
Repo ground truth: `globals.css @theme`, `layout.tsx`, `PipelineRun.tsx`, `TextMotion.tsx`,
`AuditRun.tsx`, `DayArc.tsx`, `proofManifest.ts`, `projects.ts`, plus the four design-lab docs named
in the header.
