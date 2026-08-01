# ANIMATION MAP — where signature motion goes, and what it animates

> A ranked, build-ready map of where BOLD, standout, signature animation should
> land across the Daylight-Study site (branch `redesign/daylight-study`, HEAD near
> `b8d3455` + uncommitted perf work), aimed squarely at CS / tech-industry viewers.
> This document does NOT build anything — it is the map the build follows.
>
> Evidence base: 30 real motion-settled screenshots in
> `docs/design-lab/shots-anim-map/` (desktop 1440 + mobile 390), captured against
> the fresh `out/` export (`shoot-anim-map.mjs`), plus a full read of StoryShell,
> the case-study components, `projectCaseStudies.ts`, DayArc/thread/stamp/AuditRun,
> and `globals.css`. Filenames are cited inline and indexed at the foot.

---

## 0. The rules this map obeys (read once)

**The site today** is a warm editorial-paper world: recruiter **91** / evidence
**97** / visitor **88**. Seven home chapters ride a scroll-driven dawn→dusk
day-arc; a hand-inked "red thread" draws down the binding margin; case files are
archive-cream dossiers; the finale is a press-to-sign clay stamp. There is **no
canvas and no WebGL anywhere today** — the only motion deps are `gsap` + `lenis`.
Any 3D is net-new weight and must earn it.

**The motion vocabulary a new animation MUST extend** (never betray):

| Move | Technique (already in the codebase) | Reuse for |
|---|---|---|
| Ink draw | thread `stroke-dashoffset` scrub — `.thread-past` + `.thread-swell`, per-segment, the NO-LIST's ONE sanctioned non-transform anim; no filters/gradients/will-change | edges of any diagram, benchmark axes |
| Ink settle | `hero-ink-settle` / `stipple-gain` — opacity + ≤1px same-colour feather, secondary→full ink | a node/label "activating" |
| The clay gate | `.thread-node-gate` = `--color-clay-graphic` square (ch04's recurring glyph) | every "human gate / approval edge" beat |
| The strike | `stamp-press` (transform-only translateY+scale on `.stamp-plate`) + `stamp-ink-in` (opacity, wet→dry to 0.92) | any "committed / signed / landed" punctuation |
| The walk | `AuditRun` — 350ms cadence, tick/ring/dash marks, **plain timers not rAF**, opacity-only, static-world instant | any "verify N things in sequence" |
| The day | DayArc oklch channel scrub written on the **LightField container, never `<html>`** | time-of-day / progress glyphs |

**The perf contract (non-negotiable — this is exactly what just caused scroll jank):**
- ONE scroll loop (Lenis + GSAP ScrollTrigger). **No second rAF.** A standalone
  rAF is only acceptable for a *bounded, in-view-gated, paused-off-screen* canvas.
- **Never** a full-viewport per-frame repaint or a `mix-blend` re-blend on scroll.
  DayArc's whole PERF-AUDIT lesson (86% of scroll cost) was a `<html>` var write
  forcing a whole-document recalc — do not reintroduce that shape.
- `transform` / `opacity` / `clip-path` only, plus the one sanctioned
  `stroke-dashoffset`. Contain paint (`contain: paint`), no blur on mobile.
- **Triple-gate every animation** behind `prefers-reduced-motion: no-preference`
  **and** `:not([data-motion-off])` **and** `[data-motion-ready]`, and make the
  static end-state === the animation's final frame (amendment A7). "motion: on"
  in the header toggles `data-motion-off`; the site already ships a fully static
  world that must stay complete.

**NO-LIST tripwires these ideas deliberately route around** (any hit = auto-fail):
no particle networks / constellations / floating dots; no skill bars or % ; no
animated count-up stat bars with glow; **no glow, ever**; no purple / gradient
text / neon; no typewriter or scramble reveals; no 3D-tilt / holographic / glass
cards; no magnetic anything; no custom cursor; no wheel-hijack or scroll-snap.
The reserved ember `--color-clay-ember #f57a3e` is **consumed once** (the inked
APPROVED) — no new animation may spend it.

---

## 1. Empty / underused space inventory

Regions are given inside the capture frame (home = 1440×900 top-aligned per
chapter; case files = 1440 full-page). "Dead band" = composition real estate that
currently holds nothing but paper grain.

### Home `/` — desktop 1440 (the flagged "residual empty lower-thirds" — CONFIRMED)

Every chapter is **top-weighted**: content fills the upper ~55–65%, then a wide
empty lower band runs to the folio rule. This is the site's single most repeated
piece of unused real estate.

| Chapter | Screenshot | Dead band (in-frame) | Note |
|---|---|---|---|
| 01 arrival | `home-1440-ch01-arrival.png` | right-lower quadrant ≈ x900–1440 × y560–880 (right of the directive stack + footnote) | masthead owns the top; the right of the byline/thread is open |
| 02 who | `home-1440-ch02-who.png` | full-width band y≈630–838 below the bio + `ap·prov·al` entry | the emptiest quiet chapter — ~40% of the frame is bare grain |
| 03 path | `home-1440-ch03-path.png` | left column air beside the field records; chapter is 1626px tall | thread does its loop flourish here |
| **04 automl** | `home-1440-ch04-automl.png` | **full-width band y≈700–880**: left ends ~y655 (stat strip), right ends ~y700 (fig 4.1 caption) | **THE flagged flagship dead band** — under the 7-phase list + registry |
| 05 work | `home-1440-ch05-work.png` | inter-row gaps + lower band y≈700–880 under the fast-mnist row | metric chips float in a rangy right column |
| 06 values | `home-1440-ch06-values.png` | entire lower half y≈600–880 (dusk) + right column below fig 6.1 | dark empty canvas — a dramatic stage going unused |
| 07 gate | `home-1440-ch07-gate.png` | lower third y≈720–880 below "Email me…"; references sit far below | thread already arcs to the stamp here |

### Home `/` — mobile 390

Single-column: the right-column figures (pipeline, registry, gates ledger) **stack
below** the deck, producing tall empty bands *before* them — e.g. ch04
`home-390-ch04-automl.png` shows y≈1200–1560 bare between the stat strip and the
(scrolled-below) phase list. Good news for full-width animated figures on mobile.

### Case files — desktop 1440 full-page

- **Meta-ledger right column** below the private-repository stamp / disclosure
  aside is airy (`case-1440-automl-full.png`, `…-jobtracker-full.png`).
- **Decisions → validation mid-band** (the brief's flagged "between the last
  automl decision and validation"): the ADR clauses seat their tradeoff t-slips as
  short right-margin sidenotes, leaving a whitespace shelf before `[ validation ]`.
  **CONFIRMED** on automl; worst on **fast-mnist** (`case-1440-fast-mnist-nn-full.png`)
  which has only **2 decisions**, so the band is largest there.
- **The architecture figure** (`case-1440-*-architecture.png`): a card grid + a
  **left-hugging text edge-list** ("flow —" / "the circuit —") with bare paper to
  its right. This is dead space *directly on the most animatable content.*
- Appendix plates render faint (light posters on cream at thumbnail scale) — a
  contrast note, not dead space; assets serve 200 OK.

### Evidence `/evidence/` — 1440

`evidence-1440-full.png`: 11 claim-rows. Each **left column carries vertical air**
under its short 2–3-line claim (the right metadata column is taller). No header
figure, and — unlike every case file — **no audit-walk interaction of its own.**
This is the master ledger the visitor "never re-saw" (72 held before W-era fixes).

---

## 2. Content that BEGS to be animated (the CS-magnet inventory)

Ranked by how hard a CS/tech viewer's eye is pulled toward it running:

1. **The AutoML 7-phase gated pipeline** — `1.0 ingest → … → 7.0 deploy`, with
   **"the human gate — go / no-go"** (clay square) between 6 and 7. Home ch04
   right column (`home-1440-ch04-automl.png`) + the case file's **gated-loop**
   architecture (`case-1440-automl-architecture.png`, the clay approval edge +
   "generated actions hold … until a human says go"). This is the site's THESIS,
   rendered as inert text. Nothing else on the site earns motion more.
2. **The fast-mnist neural-network forward pass** — "Draw a digit and **watch the
   network read it**." Today a static screenshot of a green `5`
   (`case-1440-fast-mnist-nn-full.png` fig 1; the live demo is off-site). A
   forward-pass / softmax visual is the single most iconic "AI" image a recruiter
   scrolls past.
3. **The 3.5× benchmark** — `openmp+simd dot kernel — 3.5× vs -O3 baseline (dot 256)`,
   backed by a **committed CSV** (`bench_summary.csv`, 3 configs × matrix sizes).
   Real, verifiable perf data — catnip — currently a mono sentence in the method
   slip + receipts + home ch05/ch06.
4. **The architecture diagrams (SystemDiagram)** — every case file: automl's gated
   **loop**, jobtracker's **linear** 3-layer classifier (rules → e5 embeddings →
   gated SetFit, the SetFit **gate** in clay), fast-mnist's fan-in (input + SIMD
   kernels + OpenMP → neural net → demo). All are card-grids + text edge-lists.
5. **The jobtracker classifier eval** — macro-F1 **0.9791** on a 96-sample gate,
   mix `65 core-positive · 17 edge-noise · 8 historical-miss · 6 core-negative`
   across 8 labels. (Per-label metrics are content-debt — animate the *sorting*,
   not a confusion matrix that would invent numbers.)
6. **The evidence/thread verification system** — the red thread as citation, the
   "run the audit" walk (tick/ring/dash), the 11-entry master ledger. Audit &
   reproducibility are exactly what the evidence/staff-eng lens already prizes.
7. **The day-arc itself** — the scroll IS one workday (kicker datelines
   `06:12 → 22:41`, dawn→dusk color). A signature system-moment that never gets a
   legible glyph.

---

## 3. THE RANKED MAP — top 8 signature opportunities

Each: **what it animates** · **where it lives** · **why a CS viewer stops** ·
**perf + coherence** · **ambition tier**.

### ① The pipeline RUNS — the animated gated SystemDiagram  ⭐ lead
**Tier: cinematic 2D / SVG.** The #1 win — highest CS pull, emptiest band, most
reusable, cheapest, most on-thesis.

- **Animates:** the AutoML 7-phase lifecycle and every case-file architecture as a
  *live run*. An ink "run token" travels the flow; as it passes each node the
  node's label ink-settles secondary→full (`hero-ink-settle` vocab); a thin ink
  edge draws ahead of it (`stroke-dashoffset`, the sanctioned move); at **the clay
  gate** (`--color-clay-graphic` square — automl's phase-7 human gate, jobtracker's
  SetFit gate, the automl approval edge) the token **HALTS and pulses once**, then
  waits. It literally performs "nothing runs until a human says go."
- **Lives:** (a) home ch04 right column — the 7-phase `<ul>` and fig 4.1 registry,
  filling the flagged y≈700–880 dead band (`home-1440-ch04-automl.png`); (b) every
  case file's `[ architecture ]` figure, replacing the left-hugging edge-list with
  an SVG edge layer over the existing `NodeCard` grid (`case-1440-*-architecture.png`)
  — automl's loop token returns to close the circuit; jobtracker's messages fall
  into SQLite; fast-mnist's three inputs fan into the net.
- **Why CS:** a pipeline/DAG *executing* and stopping at a gate is instantly legible
  to any ML/data engineer — and the halt is the portfolio's entire argument.
- **Perf + coherence:** SVG stroke draws + opacity settles + ONE transform pulse on
  the gate square — no viewport repaint. Scrub off the existing ScrollTrigger on
  home (token position = chapter progress) or fire once via IntersectionObserver
  on the case files (the `stamp-notice` pattern). Extends thread + clay-gate +
  ink-settle exactly. Static/reduced-motion world = the fully-drawn diagram (which
  is ~what renders today). **Route around** the "particle" ban: this is a labeled,
  structural graph — no free dots, every edge meaningful.

### ② "Watch it read a digit" — the fast-mnist forward pass  ⭐
**Tier: cinematic 2D / SVG (WebGL is its ceiling — see ⑤).**

- **Animates:** a self-contained forward pass. A 28×28 ink/clay MNIST glyph on the
  left; its active pixels send sparse ink strokes into 2 labeled hidden layers whose
  nodes **light in a left-to-right wave** (opacity), terminating in a row of 10
  output slots where the predicted class **ink-fills to full and takes one clay
  tick** — a softmax settling on the answer. Loops slowly, or plays once on scroll-in.
- **Lives:** the fast-mnist `#project-visual` fig-1 region (augment/replace the
  static workbench screenshot inline; keep the screenshot as an appendix plate) —
  `case-1440-fast-mnist-nn-full.png`. Optional echo in home ch05's fast-mnist row
  right-column air (`home-1440-ch05-work.png`).
- **Why CS:** a neural-net inference viz is THE "I build ML" signal; it shows the
  work the headline promises, on the one project that is pure math + memory + C++.
- **Perf + coherence:** **SVG/DOM, opacity+transform only**, one GSAP timeline —
  ~40–60 nodes, sparse meaningful edges, **no canvas repaint, no glow**. Gate the
  timeline to in-view; pause off-screen. Ink + a single clay accent for the winning
  class (never ember). **Hard NO-LIST watch:** must read as *architected layers*
  (labeled `input 28×28 · hidden · softmax`), never a constellation — few nodes,
  gridded, no drifting. If it starts to look like a particle field, it has failed.

### ③ The ledger verifies itself — a master audit-walk on /evidence  ⭐
**Tier: cinematic 2D (mostly reuse of proven-cheap `AuditRun`).**

- **Animates:** a "verify every claim →" control at the top of `/evidence/` that
  walks all 11 rows top-to-bottom, each earning its **tick / ring / dash** mark
  (the exact `AuditMark` glyphs: pinned-artifact tick, page-capture ring,
  described/held dash), then settling into a tally line
  ("11 claims · N pinned · N private-safe · 1 held"). Add a small header
  "evidence at a glance" ink figure of the same counts to fill the airy top.
- **Lives:** `/evidence/` (`evidence-1440-full.png`, `evidence-390-full.png`) — the
  header deck area + the left-column air under each short claim.
- **Why CS:** audit / reproducibility is precisely the senior-and-staff magnet the
  evidence lens already scored 97 on; it also finally gives the visitor a reason to
  re-see /evidence (the standing 72 gap).
- **Perf + coherence:** `AuditRun` is already timer-based, opacity-only, static-world
  instant — port it wholesale; near-zero new cost, zero new vocabulary. Announced
  once via `role="status"`, keyboard-native `<button>` — accessibility already
  solved in the source.

### ④ The bench plot DRAWS — the 3.5× speedup as an inked figure
**Tier: cinematic 2D / SVG.** *(Sharpest NO-LIST tension — handle with care.)*

- **Animates:** the committed benchmark as a real *measurement figure* — three
  configs (baseline `1.0×`, native `~1.0×`, openmp+native `3.5×`) as horizontal ink
  bars that **draw from the axis** on scroll-in, the openmp bar landing a **clay
  tick at 3.50× (dot 256)**; or a small-multiples ink line across matrix sizes
  (dot 64/128/256) from `bench_summary.csv`. Captioned + sourced like every plate.
- **Lives:** fast-mnist `[ validation ]` method-slip / receipts region and the
  decisions→validation mid-band (largest on fast-mnist — only 2 decisions,
  `case-1440-fast-mnist-nn-full.png`). Quiet echo on home ch06 "Make it fast."
- **Why CS:** "3.5× over -O3" is a concrete, verifiable perf brag; engineers read
  benchmark charts fluently.
- **Perf + coherence:** `transform: scaleX` bar draws or `stroke-dashoffset` axes —
  trivially cheap. **The tension:** NO-LIST bans "skill bars / %" and "animated
  count-up stat bars with glow." Stay legal by rendering an **editorial figure with
  real units, an axis, and provenance to the CSV — no glow, no %, no dashboard
  chrome, drawn in ink not filled clay.** Small-multiples reads more as "benchmark"
  and less as "skill bar," so prefer that. If it can't be made to read as a figure,
  drop it — do not ship anything bar-shaped that flirts with the ban.

### ⑤ The forward pass in TRUE 3D — the bounded WebGL stretch
**Tier: would need WebGL / 3D.** The single boldest signature — but only if it
earns its weight; this is ②'s ambition ceiling, not a second feature.

- **Animates:** ②'s network with real depth — layers as planes receding in z, the
  activation wave traveling through the stack, the input digit floating at front,
  the softmax resolving at the back plane. Depth = layer depth: the one place 3D
  adds *legibility*, not decoration.
- **Lives:** fast-mnist fig-1, same slot as ②.
- **Why CS:** a matte, ink-on-paper 3D neural net is a genuine "whoa" that no other
  new-grad portfolio ships — memorable, and still literally on-message.
- **Perf + coherence:** needs a new dep (three.js / OGL, ~real KB) — must be **lazy
  loaded, tiny canvas, DPR-capped, IntersectionObserver-gated, paused off-screen,
  its own rAF that never runs while the page scrolls past.** **Matte only: ink +
  clay, no bloom, no neon, no glass, no auto-orbit-tilt** (that way lies the
  holographic-card ban). Ship ② first; promote to ⑤ only if the 2D version proves
  the concept and the weight is justified. Reduced-motion → the static ② frame.

### ⑥ The sun waxes — a day-arc progress glyph on the chapter rail
**Tier: cinematic 2D / SVG.** Banked elevation, cheap, unmistakably signature.

- **Animates:** a sun glyph on the left chapter rail that fills `○ → ◐ → ●` as the
  scroll runs dawn→dusk, doubling as scroll progress; optionally the kicker
  datelines tick `06:12 → 22:41`. Makes the "scroll = one workday" system legible.
- **Lives:** the fixed `ChapterRail` (visible every chapter, e.g.
  `home-1440-ch01-arrival.png` left edge).
- **Why CS:** less CS-specific than ①–⑤, but a distinctive world-mechanic that
  differentiates hard from Daylight-clone paper sites (NO-LIST §D).
- **Perf + coherence:** `clip-path` / opacity on a small glyph off the existing
  DayArc progress — no new loop, no repaint. Reads straight off the day-arc the
  site is already named for. **Watch:** keep it a sun/ink mark, never a top progress
  *bar* (NO-LIST §C removed `ScrollProgress`).

### ⑦ The thread draws INTO the stamp on scroll-in — the finale elevation
**Tier: cinematic 2D / SVG.** Known-deferred (W7 item 2b), high emotional payoff.

- **Animates:** on entering ch07, the thread's last segment draws forward and
  **lands its nib into the awaiting stamp** as the "press here to sign" label warms
  (`--color-clay-invite`, already shipped) — the pen visibly arriving to sign.
- **Lives:** home ch07 (`home-1440-ch07-gate.png` — the thread already terminates at
  the stamp statically; this makes the arrival *move*).
- **Why CS:** the signature finale; ties the whole "thread of evidence → human
  approval" argument into one gesture.
- **Perf + coherence:** pure `stroke-dashoffset` on segment 07 — but it was skipped
  because it **contends with the locked ScrollTrigger scrub that `red-thread.spec.ts`
  pins.** Re-attempt only with a scoped trigger that doesn't re-aim the measured
  landmark; treat the finale as sacred (it's a recorded 88). Lower rank *because of
  the spec lock*, not the idea.

### ⑧ The inbox sorts itself — jobtracker classifier (themed instance of ①)
**Tier: cinematic 2D / SVG.** A bespoke skin of ① for the #4 home work-row project.

- **Animates:** on jobtracker's linear pipeline (`case-1440-jobtracker-architecture.png`),
  message glyphs stream from Gmail/iCloud into the **3-layer classifier** (rules →
  e5 → **gated SetFit** in clay) and drop into labeled buckets in SQLite — noise
  becoming a sorted pipeline; the sample-mix counts
  (`65 · 17 · 8 · 6`) can seed how many land where.
- **Lives:** jobtracker case file architecture figure; optional home ch05 jobtracker
  row.
- **Why CS:** on-device classification + a real eval gate is core applied-ML; the
  "your inbox already knows where you applied" line becomes visible.
- **Perf + coherence:** identical engine to ①; clay marks the SetFit gate. Animate
  the **sorting**, never invent per-label metrics (content-debt). Build ① first;
  ⑧ is its highest-value themed instance.

---

## 4. Build order (opinion)

1. **① the animated gated pipeline** — one engine, two hero placements (home ch04 +
   case architectures), fixes the flagged flagship dead band, carries the thesis.
2. **② the forward pass (2D)** — the marquee CS image, fills the fast-mnist static
   slot.
3. **③ the /evidence audit-walk** — near-free reuse, closes the un-re-seen ledger.
4. **④ the bench plot** *(only if it reads as a figure, not a stat bar)* and
   **⑥ the sun glyph** — cheap polish on real CS content + the world mechanic.
5. **⑤ the WebGL forward pass** and **⑦ thread-into-stamp** — stretch signatures,
   each gated on earning its cost / not risking a locked spec. **⑧** rides ①.

Everything above is `transform`/`opacity`/`clip-path`/sanctioned-`stroke-dashoffset`,
contained, triple-gated, with a complete static fallback — i.e. it makes the paper
*run* without betraying the warm editorial world or re-triggering scroll jank.

---

## 5. Screenshot index (`docs/design-lab/shots-anim-map/` — do NOT git-add)

Home 1440: `home-1440-00-hero-load.png`, `…-ch01-arrival` … `…-ch07-gate.png`
Home 390: `home-390-00-hero-load.png`, `…-ch01-arrival` … `…-ch07-gate.png`
Case 1440 full: `case-1440-{jobtracker,automl,fast-mnist-nn,visual-assist}-full.png`
Case 1440 architecture: `case-1440-{…}-architecture.png`
Case 390 full: `case-390-{jobtracker,fast-mnist-nn,automl}-full.png`
Evidence: `evidence-1440-full.png`, `evidence-1440-top.png`, `evidence-390-full.png`
Capture script: `docs/design-lab/shoot-anim-map.mjs` (serve `out/` on :3000 first).
