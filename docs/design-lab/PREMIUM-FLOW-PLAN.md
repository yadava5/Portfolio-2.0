# PREMIUM-FLOW-PLAN — making the paper *flow*, section by section

> The owner switched Lenis → **native scroll** (buttery, no jank) and now says the
> site "looks like a raw web page… not smooth animations or fluency" — it wants the
> "flows itself, section by section" quality of Linear, Cursor, Apple.
>
> This plan is a **critique + prioritized build map for the PREMIUM FLOW FEEL**: the
> section-level choreography, the pinned "moment," the scroll-linked motion and depth
> that read as authored rather than busy. It builds ON `ANIMATION-MAP.md` (which
> scouted *content* viz — the pipeline, the neural net) — this layer is the *flow*
> those figures live inside. It obeys `NO-LIST.md` absolutely and the native-scroll
> engineering contract (transform/opacity/clip-path only, contained paint, one loop,
> triple-gated, complete static fallback).
>
> Evidence base: (a) a fresh `out/` build served on :4178, driven headless at 1440,
> screenshots in `docs/design-lab/shots-premium/` (do **not** git-add); (b) a
> source-level motion inventory (StoryShell/TextMotion/DayArc/ThreadSegment/
> ApprovedStamp/ChapterRail/globals.css); (c) **live probes of five reference sites**
> (Linear, Cursor, Apple, Brittany Chiang, Cuberto) — their loaded animation stacks
> and reveal/pin/parallax markers, recorded in §5.

---

## 0. The diagnosis — what "raw web page" actually means here

First, correct the premise, because it changes the whole plan. **The site is NOT
motionless.** Source-verified, it already ships:

- **Two premium *continuity* systems most portfolios never attempt** — the hand-inked
  **red thread** (`stroke-dashoffset` scrub, per-chapter segments welded on a shared
  spine) drawing down the binding margin, and the **day-arc** (oklch-channel scrub on
  the light-field container, dawn→midday→a stepped dusk flip→night) so the scroll *is*
  one workday. These are genuinely sophisticated and on-brand. Keep them; they are the
  backbone the new layer hangs on.
- **A real text-reveal layer** — `TextMotion.tsx` wires `data-tm-*` ScrollTriggers:
  SplitText **line-mask rises** (~70px wipe from opacity 0 — measured on ch04),
  muted fade-rises, block fades, the ch07 name reveal, a **scrubbed manifesto** (ch02),
  a **litany cascade** (ch06), and font-weight breathing (ch03/04). Plus a CSS hero
  load sequence (de-blur, rise, ink-settle, halftone stipple-gain).
- **Interaction craft** — the press-to-sign stamp (windup→impact→rebound strike +
  wet-ink-dries), the case-file audit-walk, `link-draw` underlines, citation ink,
  visited marks. And a **section-aware chapter rail** (IntersectionObserver active
  chapter + audit-check marks).

> ⚠️ Methodology note for whoever reads this next: an instant-jump probe (scroll a
> chapter straight to the top, sample) will report "no enter animation" for ch01–06 —
> because jumping *past* a `once:true` `clamp(top 75%)` trigger renders its end-state
> without playing. The correct probe (fresh load, sample below-fold from-states; then
> slow-scroll the trigger) shows the reveals **are** real. Don't be fooled into
> "there are no reveals" — the problem is subtler and more interesting.

So why does it *feel* raw? Six concrete gaps — every one of them is a place the
reference sites do something this site doesn't:

1. **The motion is almost all TEXT; the CONTENT FIGURES are 100% static.** The
   7-phase pipeline, the experiment registry, the architecture NodeCards, the
   "gates kept" table, the metric chips, the (off-site) neural net — the exact
   things a CS viewer's eye locks onto *expecting them to run* — never move a pixel.
   Elegant text choreographs in, then the eye lands on a dead screenshot. That
   disconnect reads as *unfinished*, which reads as *raw*.
2. **Reveals are per-element, fire-and-forget one-shots — not composed *scenes*.**
   Each heading/paragraph/list-item triggers independently at its *own* `top 75%`.
   There is no section-level timeline, no stagger *across* a chapter's children as a
   directed group. Linear's sections arrive as one composed beat; here they arrive as
   scattered pops. (ch06's litany cascade is the lone exception — and, not by
   coincidence, it's the chapter that feels most "designed.")
3. **Nothing is scroll-*linked* in the reading column** (except ch02's manifesto).
   The "flows itself" sensation of Apple/Linear/Cursor is motion tied *continuously*
   to scroll position — you feel you're conducting it. Here the only continuous
   scroll-linked layers are *peripheral* (background color, a 1px thread, font
   weight). The content reveals are discrete events, so between them the scroll feels
   inert.
4. **No pinned "moment."** Nothing ever holds and performs. The single most premium
   pattern in 2024–2026 — Apple's pinned scene where scrolling scrubs a sequence in
   place — is absent. The plan *reserved* exactly one pinned chapter (ch04, the
   flagship) and it was never built (`StoryShell` comment: "not pinned until Phase 3").
   The thesis of the entire site is currently static text.
5. **Flat depth, hard section cuts.** Everything sits on one plane; chapters butt
   against each other with a folio rule and no bleed, overlap, or parallax hand-off.
   The thread is the *only* connective tissue crossing a section boundary.
6. **Reveal timing/magnitude is under-tuned for the reading path.** Many reveals are
   short (0.6–0.8s) small fades (10–16px) firing at 75% viewport — they often finish
   *before* the eye arrives, so they're perceived as "already there." The bigger
   line-mask wipes survive; the many small block-fades evaporate.

**Thesis of this plan:** the paper already has premium *stillness* and premium
*continuity*. What it lacks is premium *performance* — composed section scenes,
a scroll-linked reading column, at least one pinned cinematic moment, live content
figures, and a whisper of depth. Add those five and the "raw" feeling dissolves
without adding a single banned pattern.

---

## 1. The premium-flow pattern library

Each pattern → the reference that nails it (with the live-probed evidence) → why it
reads premium not busy → the verdict for this editorial-paper voice.

### A. Composed section reveal (staggered as one unit) — **Linear**
**Evidence:** linear.app runs **Framer Motion** (`motion`) on **native scroll** (no
Lenis, no GSAP) with **18 elements parked at `opacity:0`** awaiting scroll-in and 69
pre-transformed. Each feature section ("Make product operations self-driving," "Define
the product direction," …) reveals a heading + product visual **as a group** — a short
fade + small rise, children staggered by tens of ms off one trigger.
**Why premium:** the section reads as *one authored entrance*, not independent parts.
Restraint (short distance, fast settle) + unison (shared timeline) = confidence.
**Verdict — ADOPT, this is the #1 fix.** Our `TextMotion` engine already has all the
primitives; it just fires them per-element instead of per-scene. Convert to a single
per-chapter timeline with internal stagger. Pure transform/opacity — zero new deps,
and native scroll is *exactly* Linear's own setup.

### B. Pinned scroll scene (scrub a sequence in place) — **Apple**
**Evidence:** apple.com/iphone is a **~50,000px** page built from **`position:sticky`
scene wrappers** (26 sticky elements) that pin while an inner media element is
**scroll-scrubbed** (image-sequence / video), with text lines fading in over the
pinned media.
**Why premium:** scrolling becomes a *timeline scrubber* — one subject, held center
stage, resolving under the viewer's own hand. It's the difference between reading
*about* a thing and *operating* it.
**Verdict — ADOPT, exactly once (ch04).** `NO-LIST §C` allows precisely one pinned
chapter, and it's the flagship. On-brand translation: the pinned "sequence" is the
**AutoML pipeline running** — not a product render. See build item ②.

### C. Scroll-scrubbed content demo (the product demonstrates itself) — **Cursor**
**Evidence:** cursor.com uses `motion`, **16 sticky** blocks and **80 elements at
`opacity:0`** — its "Mission Control / agents turn ideas into code" sections are
sticky-pinned demos where scrolling drives the editor through states (trigger →
behavior → parallel runs).
**Why premium:** the strongest proof-of-competence a builder can give is the artifact
*working* as you scroll. Show, don't screenshot.
**Verdict — ADOPT for the figures (not the whole page).** Our equivalent: the
experiment registry stamping row-by-row, the architecture diagram running its gated
loop, the neural net reading a digit. This is where `ANIMATION-MAP` ①/②/⑧ plug in —
this plan is the *flow* they animate within.

### D. Section-aware nav / indicator — **Brittany Chiang** (+ our rail)
**Evidence:** brittanychiang.com pairs a sticky half-screen column with a nav whose
active item carries `aria-current` synced to the scrolled section (About → active).
**Why premium:** the viewer always knows where they are; the chrome *responds* to the
content, so the page feels alive and navigable rather than a static scroll.
**Verdict — ADAPT, we're half-way.** Our `ChapterRail` already computes the active
chapter via IntersectionObserver — but it's quiet and the **top nav has none**.
Elevate the rail's active state, add a day-arc **sun glyph** as progress (`ANIMATION-
MAP ⑥`), and give the top-nav "the work / experience / contact" a section-aware
underline. **Caution:** Chiang also ships a **mouse-follow radial spotlight** — that
is on our `NO-LIST` (banned "mouse-following radial ambient glow"). Take the
section-awareness, *not* the cursor glow.

### E. Subtle depth / parallax layering — **Apple / Cuberto**
**Evidence:** Apple's pinned scenes move foreground text and background media at
different rates; cuberto.com carries **106 transformed elements** for layered
parallax.
**Why premium:** a few px of differential motion makes a flat page feel dimensional
and physical without any 3D. The key is *subtle* — 4–12px, tied to scroll.
**Verdict — ADAPT, homeopathically.** Our world is paper, not glass — depth here means
the **grain/contour drifting a hair slower than the type**, a figure settling a beat
after its caption, the thread riding *above* the page. Never a parallax hero fade-out
(that's on the `NO-LIST`). ~1 depth accent per chapter, transform-only.
> **Cuberto is the cautionary reference:** it buys its flow with **Lenis smooth-scroll**
> — the library this site deliberately removed. Linear, Cursor, Apple and Chiang all
> achieve premium flow on **native scroll**. The lesson: the "smoothness" the owner
> wants is *not* a scroll library — it's choreographed, scroll-linked *content* motion.
> Do not reintroduce Lenis.

### F. Typographic motion (line-mask / clip reveals, weight) — **Linear / editorial**
**Evidence:** Linear's headings use controlled line-breaks and clip/opacity reveals;
premium editorial sites reveal display type as **masked lines wiping up**.
**Why premium:** for a *type-forward* site, the type *is* the hero — so animating its
arrival (clip-path wipe, ink-settle) is the most on-voice motion available.
**Verdict — ADOPT/EXTEND.** We already have line-mask rise + ink-settle + stipple +
weight-breathe. Under-used and under-tuned. Fold them into the composed section
timelines (A) and re-time them onto the reading path (fix gap #6).

### G. Refined micro-interactions & state transitions — **Linear (Rive) / Cursor**
**Evidence:** Linear additionally loads **Rive** for interactive vector states; every
hover/toggle has an eased transition.
**Why premium:** the *last 10%* — a control that answers with spring, a state that
tweens instead of snapping — is what separates "designed" from "assembled."
**Verdict — ADAPT with our own vocabulary (no Rive needed).** We have `link-draw`,
the stamp strike, registry marks. Extend to: the work-row metric chips settling on
hover, the case-file links, the rail marks. And **fix the regression**: the
native-scroll shim's `scrollTo` dropped the planned 1.2s expo-out eased anchor scroll
(`SmoothScroll.tsx` ignores the passed duration/easing) — a jarring browser-default
jump on nav clicks. Restore an eased programmatic scroll (rAF tween of `scrollTo`,
still native, no library).

### H. Cross-section continuity device — **unique to us (keep & exploit)**
No reference portfolio has anything as strong as the **red thread + day-arc**. This is
this site's *signature* premium mechanic. The plan's job is to make the new content
motion **read off the thread and the arc** — the pipeline run token *is* a bead on the
thread; the neural net lights in the day-arc's current ink; the gate fires in clay.
That coherence is what will keep 8 new animations from feeling like 8 gimmicks.

**Patterns explicitly declined** (NO-LIST tripwires): mouse-follow spotlight/cursor
(Chiang's glow), WebGL mesh/aurora hero (Linear's Three.js gradient — we're paper, not
a dark gradient), full-page scroll-snap/wheel-hijack, parallax hero fade-out, count-up
stat bars, any glow.

---

## 2. Section-by-section critique (raw → premium, with the shot that shows it)

Screenshots: `docs/design-lab/shots-premium/` (1440 desktop, motion-settled).

### Ch01 · arrival — `home-1440-ch01-arrival.png`, `home-1440-00-hero-load.png`
**Has:** the strongest moment on the site — CSS hero load (de-blur + rise + ink-settle
+ stipple), the thread kicking off its loop, the masthead.
**Raw where:** the hero choreography plays **once on load and is never rebuildable by
scroll** — scroll back to top and it's inert. The right-lower quadrant (x≈900–1440,
y≈560–880) is bare grain (`ANIMATION-MAP` dead-band). After the load beat, there is no
*reason to scroll* — no forward pull, no "the story continues below" motion.
**Premium lift:** keep the load beat, but add a quiet **scroll-cue** that lives on the
thread (the thread's first segment *draws downward* as you begin, pulling the eye into
ch02), and let the "flagship — seven gated phases" line **settle a beat after** the
headline (intra-scene stagger, pattern A). Small, but it converts a static hero into
an *entrance*.

### Ch02 · who — `home-1440-ch02-who.png`
**Has:** the site's one **scrubbed** headline (manifesto: words resolve 0.25→1 under
scroll) — genuinely premium, and the thread's hand-drawn loop flourish up top.
**Raw where:** below the fold is ~40% bare grain; the `ap·prov·al` dictionary block and
the bio just *fade in* independently. The scrubbed headline is great but **orphaned** —
nothing else in the chapter is scroll-linked, so the chapter's top feels alive and its
body feels static.
**Premium lift:** extend the scrub sensibility downward — stagger the bio → dictionary
→ n.b. slip as **one composed reveal** (A), and let the dictionary entry's IPA/senses
**line-wipe** in sequence (F). This is the "restraint chapter"; keep it quiet but make
its arrival *composed*.

### Ch03 · path — `home-1440-ch03-path.png`
**Has:** big deck, the thread's expressive loop, the field-record two-column layout,
weight-breathing headline.
**Raw where:** the experience content (the single most recruiter-relevant chapter) is a
static two-column text block. Left column air is dead. Nothing signals "this is a
*timeline*" — it's the one chapter that begs for **sequential, scroll-linked** arrival.
**Premium lift:** reveal the field records as a **staggered timeline** keyed to the
thread — as the thread draws past each record's anchor, that record's kicker→body
wipes in (B/D micro-scale). The thread already *loops* here; make the content **hang
off the thread's progress** so the loop *means* something.

### Ch04 · automl — `home-1440-ch04-automl.png` ⭐ THE FLAGSHIP GAP
**Has:** the thesis — "The agent drafts the whole pipeline. *Nothing runs until a human
says go.*" — the 7-phase list (`1.0 ingest → 7.0 deploy`) with **the clay gate square**
between 6 and 7, and the experiment registry (038–041, `041 awaiting approval`).
**Raw where:** **this is the single worst raw→premium gap on the site.** The site's
entire argument is rendered as **inert text and an inert table.** There is no run, no
gate firing, no motion whatsoever on the content that a CS viewer stares at hardest.
The flagged dead band (y≈700–880) sits empty beneath it. A visitor is *told* "nothing
runs until a human says go" while nothing, literally, runs.
**Premium lift:** the **pinned pipeline scene** (build item ②, the flagship). Pin the
figure; scrolling drives an ink **run token** down `1.0 → 6.0`, each phase's label
ink-settling as it passes, a thin edge drawing ahead of it; at **the human gate** the
token **halts and pulses in clay** and *waits*; only past the gate does `7.0 deploy`
resolve and the registry stamp `041 approved`. The thesis, performed.

### Ch05 · work — `home-1440-ch05-work.png`, `film-06-y4590.png`
**Has:** three clean project rows with metric chips; the thread's lovely curl threading
JobTracker → Fast MNIST → Visual Assist.
**Raw where:** the rows are a static list — all three are visible and identical in
"weight," so the eye doesn't know where to land; the metric chips (macro-f1 0.9791,
3.5×) — real, verifiable brags — just sit there. Inter-row gaps and the lower band are
airy.
**Premium lift:** stagger the rows in **on the thread's curl** (as the thread reaches
each row's node, the row title + chips settle — D), and give the **metric chips** a
one-time draw (the 3.5× and 0.9791 *arrive* as figures, ink underline drawing — F/G),
so the numbers register as claims, not decoration. Keep it a list; make it *deal cards
turning face-up in sequence*.

### Ch06 · values — `home-1440-ch06-values.png`
**Has:** the best-choreographed chapter — the "Make it learn / fast / honest" **litany
cascade** (slowing stagger) over the night background, with the "gates kept" table
(passed/refused, clay marks). Dusk has flipped; the stage is dramatic.
**Raw where:** the **entire lower half is empty night** — "a dramatic stage going
unused" (`ANIMATION-MAP`). The gates table is static. The cascade is great but the
chapter *stops performing* halfway down.
**Premium lift:** let the **gates table adjudicate itself** — as it enters, each row's
disposition resolves in sequence (✓ passed / — refused draws in), echoing the audit-
walk vocabulary; use the empty night lower band for a single quiet **day-arc moment**
(the sun glyph at dusk, or the thread pooling toward the gate). This is the emotional
turn before the finale; give it a held breath.

### Ch07 · gate — `home-1440-ch07-gate.png`, `film-09-y6885.png`
**Has:** the finale, and the **one chapter that already fully choreographs** — the name
reveals (opacity 0→1, rise 14px), the thread arcs into the awaiting **clay stamp**
("run no. 041 · press here to sign"), the references draw in. This is the reference
standard the rest of the site should meet.
**Raw where:** honestly, very little — this is the payoff and it lands. The only lift is
**connective**: the thread's *arrival into the stamp* is static on scroll-in
(`ANIMATION-MAP ⑦`, deferred because it contends with the locked thread scrub). If the
pinned-pipeline work re-architects the thread timing anyway, revisit drawing the last
segment's nib into the stamp as the "press here" label warms.
**Use as the bar:** every other chapter should feel as *composed on arrival* as ch07
does. It proves the vocabulary works — it's just only applied here.

### Case file · automl — `case-1440-automl-architecture.png`, `case-1440-automl-full.png`
**Has:** the gated-loop architecture — NodeCard grid (react/express/langgraph/docker/
postgres/**playwright-evals in clay**) + a text edge-list ("the circuit —", "generated
actions hold at the approval edge until a human says go"), the audit-walk control, the
static dossier thread.
**Raw where:** the architecture is a **card grid + a left-hugging text edge-list with
bare paper to its right** — "dead space directly on the most animatable content"
(`ANIMATION-MAP`). The gated loop is *described in prose*, not *drawn running*.
**Premium lift:** the same pipeline engine as ② (`ANIMATION-MAP ①`, one-shot on
scroll-in via IntersectionObserver, not pinned): an SVG edge layer over the existing
NodeCards, the run token traveling the loop, halting at the clay `playwright-evals`/
approval edge, then closing the circuit. One engine, two placements (home pinned +
case one-shot) — the highest-reuse build on the board.

---

## 3. The ranked build plan — top moments by impact-per-effort

Each moment: **section · what moves + how it's triggered on native scroll · why it
elevates the *story of who he is* · on-brand translation · perf guardrail.**
Ranked by impact-per-effort. The flagship to build first is flagged ⭐.

> **Headline recommendation on sequencing (read before the ranks):** the owner's
> complaint is *systemic* ("section by section… not fluent"), so **#1 (composed
> section choreography) is the true highest impact-per-effort** — it lifts all seven
> chapters, reuses the existing engine, and is the literal Linear pattern. But the
> **flagship *moment* to build first is #2, the pinned pipeline scene** — it's the
> signature "whoa," it's the thesis, and it's the one sanctioned pin. **Do #1 and #2
> as a pair**: the pinned scene sitting amid otherwise-composed sections is a
> centerpiece; sitting amid raw sections it's a lonely island. Recommended order:
> **#1 → ⭐#2 → #3 → then 4–8.**

### #1 — Composed section choreography (system upgrade) · ALL 7 chapters
- **Moves / trigger:** convert `TextMotion`'s per-element one-shots into **one
  per-chapter timeline** with internal **stagger** (children ~40–90ms apart), triggered
  once at the chapter's `top ~75%` on native-scroll ScrollTrigger. Order within a
  scene: kicker → headline line-wipe → deck → body blocks → figure/aside. Re-time so
  the beat lands *on the reading path* (start slightly earlier, let the settle finish
  ~as the eye arrives). Keep gestures small (Linear-restraint): ≤16px rise, clip/mask
  wipe, 0.5–0.8s.
- **Why it's *him*:** a working paper should *assemble* like an argument — premise, then
  support, in order — not blink into existence. Composed arrival = "this was authored."
- **On-brand:** extends existing ink-settle / line-mask / block-fade vocabulary; no new
  visual language, just orchestration. The thread stays the spine the stagger reads
  along.
- **Perf:** transform/opacity/clip-path only; one timeline per chapter, `once:true`,
  killed after play; no scrub added (cheap); complete static end-state already exists
  (A7). **Highest impact-per-effort — this is the "flows section by section" fix.**

### ⭐ #2 — The AutoML pipeline as a PINNED scroll scene (FLAGSHIP, build first) · ch04
- **Moves / trigger:** **pin the pipeline figure** (ScrollTrigger `pin`, native scroll)
  across a bounded scroll distance; scrub an ink **run token** down the 7-phase list;
  each phase label **ink-settles** secondary→full as the token passes; a thin ink edge
  **draws ahead** (`stroke-dashoffset`, the sanctioned move); at **the human gate**
  (clay square, phase 6→7) the token **halts + pulses once in clay** and holds; past
  the gate `7.0 deploy` resolves and registry row `041` **stamps `approved`**. Unpin;
  scrolling resumes.
- **Why it's *him*:** this is the entire thesis — *"nothing runs until a human says
  go"* — made literal. A pipeline executing and **stopping at a human gate** is
  instantly legible to any ML/data engineer, and the halt *is* the argument. No other
  moment says who he is more precisely.
- **On-brand:** the run token is a **bead traveling the thread**; the gate is the
  existing `--color-clay-graphic` square; the stamp reuses the finale's strike; ends by
  spending nothing new (the ember stays reserved for ch07's APPROVED).
- **Perf / the one real risk:** pin a **contained inner figure**, not the whole
  section, so paint stays scoped (`contain: paint`); prefer `pinType:"transform"` or a
  tightly-scoped fixed pin — **never** a translateZ-promoted full-viewport layer (that
  shimmered) and **never** a per-frame full-viewport blend (that janked). **Key
  engineering hazard:** ch04 pinning adds pinned scroll distance that will move the
  **thread's measured landmarks** — and `red-thread.spec.ts` locks that scrub. Mitigate
  by pinning an inner figure whose pin-spacer the thread geometry accounts for (or
  segment the thread across the pinned range). Validate the thread spec before/after.
  Full static fallback: the fully-drawn pipeline with the gate marked (≈ what renders
  today).

### #3 — Content figures come alive (the CS-magnet static→live) · ch04 registry, ch06 gates table, ch05 chips, case architectures
- **Moves / trigger:** one-shot on scroll-in (IntersectionObserver / `once:true`):
  registry rows **stamp in sequence** (038→041, the audit-walk cadence); the ch06
  **gates table adjudicates** (✓ passed / — refused resolve row-by-row); ch05 **metric
  chips** draw their underline + settle; case-file **architecture runs its gated loop**
  (shared engine with #2, one-shot not pinned).
- **Why it's *him*:** his whole pitch is *evidence that verifies itself* — so the
  evidence artifacts should *perform* the verification. Reviewers who prize
  reproducibility (the evidence lens scored 97) read these as rigor, not decoration.
- **On-brand:** reuses `AuditRun` timer cadence, clay gate marks, ink-settle,
  `link-draw`. Numbers *arrive as claims*.
- **Perf:** opacity/transform, timer-based (proven cheap), in-view-gated, static-world
  instant. Reuses `ANIMATION-MAP ①/③/⑧` — high reuse.

### #4 — "Watch it read a digit": the fast-mnist forward pass · ch05 echo + case fig-1
- **Moves / trigger:** a self-contained SVG/DOM forward pass — a 28×28 ink glyph, sparse
  strokes into 2 labeled hidden layers lighting L→R (opacity wave), the predicted class
  ink-filling + taking one clay tick. Plays once on scroll-in; pauses off-screen.
- **Why it's *him*:** the single most iconic "I build ML" image, on the project that is
  pure math + memory + C++. Shows the headline instead of asserting it.
- **On-brand:** ink + one clay accent, **labeled layers** (`input 28×28 · hidden ·
  softmax`) — never a drifting constellation (that's the particle ban). Few nodes,
  gridded, meaningful edges only.
- **Perf:** SVG opacity/transform, one timeline, in-view-gated, no canvas/glow.
  (`ANIMATION-MAP ②`; WebGL is its ceiling, not this build.)

### #5 — A whisper of depth + section hand-off · all chapters, transitions
- **Moves / trigger:** ~1 depth accent per chapter — the **grain/contour layer drifts
  4–12px slower** than the type on scroll (transform, scrubbed); a figure settles a beat
  after its caption; at section boundaries the outgoing folio and incoming kicker
  **cross-fade with a hair of overlap** instead of hard-cutting.
- **Why it's *him*:** turns a flat sheet into a physical desk — pages have a *back* and a
  *front*. Subtlety is the point; this is texture, not spectacle.
- **On-brand:** paper depth, not glass parallax. Never a hero fade-out (NO-LIST).
- **Perf:** transform-only on an already-composited grain layer; tiny magnitudes; skip
  on mobile. Guard against reintroducing the DayArc full-viewport-repaint mistake — the
  drift is a transform on a contained layer, never a per-frame background re-blend.

### #6 — Section-aware chrome: rail elevation + sun glyph + nav underline · global
- **Moves / trigger:** elevate the rail's **active chapter** (weight/ink transition, not
  just present); add the **day-arc sun glyph** `○→◐→●` as scroll progress on the rail
  (reads off DayArc, no new loop); give the **top nav** a section-aware active underline
  synced to the active chapter (IntersectionObserver already computes it).
- **Why it's *him*:** "the scroll is one workday" becomes *legible*; the reader always
  knows where they are in the argument. Distinguishes hard from Daylight-clone paper
  sites.
- **On-brand:** sun/ink mark on the existing rail — **never a top progress bar**
  (`ScrollProgress` was removed) and never the cyan/glow rail that was rejected.
- **Perf:** clip-path/opacity on a small glyph; state class toggles. Cheap.
  (`ANIMATION-MAP ⑥`.)

### #7 — The ledger verifies itself: /evidence audit-walk · /evidence
- **Moves / trigger:** a "verify every claim →" control walking all 11 rows top-to-
  bottom, each earning its tick/ring/dash, settling into a tally line; a small "evidence
  at a glance" header figure.
- **Why it's *him*:** finally gives the master ledger (the page the visitor "never
  re-saw," stuck at 72) a reason to be re-seen, and it's pure audit/reproducibility —
  the staff-eng magnet.
- **On-brand / perf:** port `AuditRun` wholesale — timer-based, opacity-only, static-
  world instant, `role="status"`, keyboard-native. Near-zero new cost.
  (`ANIMATION-MAP ③`.)

### #8 — Micro-interaction & state-transition pass (+ the eased-scroll regression) · global
- **Moves / trigger:** restore the **eased programmatic anchor scroll** (native rAF
  tween of `window.scrollTo`, ~1.2s expo-out — the shim currently drops the passed
  easing and hard-jumps); add eased state transitions to work-row hover, case-file
  links, rail marks; ensure every hover/focus answers with a tween, not a snap.
- **Why it's *him*:** the last-10% polish that separates "designed" from "assembled";
  the nav jump is a small but constant papercut against the "smooth" goal.
- **On-brand:** extends `link-draw` (the one sanctioned hover) and the stamp easing
  vocabulary. No magnetic pull, no cursor (NO-LIST).
- **Perf:** transforms/opacity + one rAF tween for the scroll (still native, no
  library). Trivial.

**Impact-per-effort ranking (condensed):**

| Rank | Moment | Impact | Effort | Note |
|---|---|---|---|---|
| **1** | Composed section choreography | ★★★★★ | ●●○○ | fixes the whole "raw" feel; reuses engine |
| **⭐2** | Pinned pipeline scene (ch04) | ★★★★★ | ●●●● | flagship "moment"; thesis; the one pin |
| 3 | Content figures come alive | ★★★★☆ | ●●○○ | high reuse; CS-magnet; evidence rigor |
| 4 | fast-mnist forward pass | ★★★★☆ | ●●●○ | marquee "I build ML" image |
| 5 | Depth + section hand-off | ★★★☆☆ | ●●○○ | dimensionality, cheap |
| 6 | Section-aware chrome + sun glyph | ★★★☆☆ | ●○○○ | orientation; world mechanic |
| 7 | /evidence audit-walk | ★★★☆☆ | ●○○○ | near-free; closes the ledger gap |
| 8 | Micro-interaction pass + scroll easing | ★★★☆☆ | ●○○○ | last-10% polish; fixes regression |

---

## 4. Engineering notes (native-scroll, honor every constraint)

- **One loop.** GSAP ScrollTrigger reads native window scroll (already true). No
  second rAF except a **bounded, in-view-gated, paused-off-screen** figure timeline
  (forward-pass) — never a page-scroll-time rAF. **Never reintroduce Lenis** (it's a
  vestigial unused dep — consider removing it while here).
- **Pinning (item #2) is the only structural risk.** ScrollTrigger pin on native scroll
  is supported; pin a **contained inner figure** with `contain: paint`, prefer
  `pinType:"transform"`, and **re-validate `red-thread.spec.ts` + `scroll-engine.spec.ts`**
  because pin-spacing shifts measured landmarks. Never pin a full-viewport layer.
- **Properties:** transform / opacity / clip-path only, plus the sanctioned
  `stroke-dashoffset`. No animating layout props; no blur on mobile; no `mix-blend` or
  full-viewport background re-blend on scroll (the exact DayArc jank that was fixed).
- **Triple-gate everything** behind `prefers-reduced-motion: no-preference` **and**
  `:not([data-motion-off])` **and** `[data-motion-ready]`; the static end-state must
  equal the animation's final frame (A7). The site already ships a complete static
  world — every new moment needs its designed static fallback (fully-drawn pipeline,
  settled gates table, resolved forward-pass frame).
- **Reuse before invent:** #1 reuses `TextMotion`; #2/#3/#4 reuse ink-settle + clay
  gate + `stroke-dashoffset` + `AuditRun` cadence; #6 reads off `DayArc`; #7 ports
  `AuditRun`; #8 extends `link-draw`. Net-new visual vocabulary should approach zero —
  that coherence is what keeps it premium-not-busy.
- **Verify motion in headless Chromium** (the embedded pane can't run rAF); rebuild
  `out/` before Playwright runs; screenshot to `docs/design-lab/shots-premium/` (never
  git-add).

---

## 5. Evidence appendix

### Reference-site live probes (recorded this session)
| Site | Stack (probed) | Premium markers | Scroll |
|---|---|---|---|
| **linear.app** | Next.js · **Framer Motion** · **Rive** · Three.js (hero gradient) | **18 els @opacity:0** awaiting reveal, 69 transformed; 5 sticky; feature-section reveals | **native** (no Lenis/GSAP) |
| **cursor.com** | `motion` · 1 video | **16 sticky** pinned demos, **80 els @opacity:0**; scroll-driven editor "Mission Control" | native |
| **apple.com/iphone** | `motion` · video | **~50,000px** page, **26 `position:sticky`** scene wrappers, scroll-scrubbed media | native, pinned scenes |
| **brittanychiang.com** | `motion` · IO reveals | **section-aware sticky nav** (`aria-current`); *cursor spotlight = our NO-LIST* | native |
| **cuberto.com** | **Lenis** · `motion` | 106 transformed, 54 @opacity:0, 7 sticky — heavy parallax | **Lenis (declined)** |

**Takeaway:** four of five premium references run on **native scroll**; the flow feel
comes from **choreographed, scroll-linked content motion + pinned scenes + composed
reveals**, not from a smooth-scroll library. This site is on the right engine.

### Current-site screenshots (`docs/design-lab/shots-premium/`, 1440, motion-settled)
`home-1440-00-hero-load.png` · `home-1440-ch01-arrival.png` … `ch07-gate.png` ·
`film-00…14-y*.png` (scroll filmstrip) · `case-1440-automl-top/full/architecture.png` ·
`evidence-1440-top.png`. Capture script: `docs/design-lab/shoot-premium.mjs`
(serve `out/` on :4178 first: `PORT=4178 node tests/playwright/static-server.mjs`).

### Reveal-reality probe (corrects the "no motion" misread)
Fresh-load below-fold from-states: every chapter has hidden children (reveals armed).
Slow-scroll ch04 entry: heading lines rise **~70px from opacity 0** (line-mask wipe) →
settle. The reveals exist; they're just per-element, timid, and text-only — which is
the actual problem this plan fixes.
