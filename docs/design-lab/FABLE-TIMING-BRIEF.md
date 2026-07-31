# Fable brief — the long run, round 5: fix the timing, then answer the inert boxes

**Artifact:** `docs/design-lab/candidates/story-the-long-run.html`
(161,992 bytes raw / 48,880 gzip, **zero dependencies** — that leanness is part of
what is working; treat it as a budget, not a coincidence.)

**Measurement of record:** `docs/design-lab/timing-audit/` — a complete census, not
a sample. 79 `data-fx` declarations in source, 79 live in the DOM, 0 missed.
Two viewports, 422/427 threshold crossings each, bisected to ±0.25 px.

**This is two jobs with different natures. Do them in order, and do not merge them.**

---

## Part 0 — read this first, or you will "fix" the wrong thing

### The units in the engine are not what earlier briefs said

`x`/`y` in a `data-fx` clause are **percentages of viewport**, not px. `x -9` at
1440 wide is **−129.6 px**. Only `drift` is raw px.

### "Settled" cannot be defined on transform

`+ (0.5 - p) * drift` runs across every element's whole progress range, so nothing
is ever static in transform. Every threshold in the audit is defined on **rendered
opacity**, which the engine quantises to 1/50:

```js
op = round(ein * (1 - eout) * 50) / 50    // settled ≥ 0.98, gone < 0.02
p  = (scrollY + vh - elTop) / (vh + elH)  // invert: scrollY(p) = elTop + p·(vh+elH) - vh
```

Omitted clauses default to `in [.06,.32]`, `out [.76,.98]`, `drift 10`.

### Rank on px, never on seconds

The audit's seconds are a projection through a chosen reading profile
(750 px/s + 1.6 s pause per beat). A beat pause landing inside one element's dwell
window inflates its seconds arbitrarily — a 382 px dwell reads as 2.11 s while a
283 px dwell reads as 0.38 s. **The px figures are measured. The seconds are not.**

### The prototype's engine does not exist in `src/`

`grep -rl "data-fx" src/` returns **zero files**. Production uses GSAP +
ScrollTrigger + `TextMotion`. So the Tier A bug below is a prototype-only defect —
you are fixing the candidate the owner reacted to, not the live site. Say
explicitly in your write-up which findings *do* generalise to the production
choreography, because that is the part that eventually ships.

---

## Part 1 — MUST FIX (broken windows, each verifiable by re-running the census)

### The single root cause: `cacheGeometry()` lines 1345–1357

Five of six Tier A items and the entire beat-7 blank window trace to one block:

```js
const Y2 = yDark - 40, Y1 = Y2 - vh * 0.3;
for (const f of fx) {
  if (f.el.dataset.fxSync === "dusk") {
    f.spec.out[0] = (Y1 + vh - f.top) / (vh + f.h);
    f.spec.out[1] = (Y2 + vh - f.top) / (vh + f.h);
  }
}
```

Six elements get their **exit** rewritten into a shared page-space curtain
(y 8134.2 → 8404.2 at 1440×900) while their **entrances stay per-element p-space
and staggered**. Because the rewrite subtracts `f.top`, elements deeper in the beat
get a *smaller* `out[0]` — **the curtain arrives earlier the later the element is
meant to appear.** Measured, desktop:

| element | entrance → scrollY | exit → scrollY | peak op | verdict |
|---|---|---|---|---|
| `p.kicker` "¶ 08 · the honest hour" | 7711–7922 | 8134–8404 | 1.00 | dwell 262 px |
| `figure.plate.bare` (fig-08 ladder) | 7785–8173 | 8134–8404 | 0.98 | **dwell 27 px = 0.04 s** |
| `h2.prose-h` "LifeQuest. …" | 7772–8024 | 8134–8404 | 1.00 | dwell 165 px |
| `p.mutedln` "Job-seeking turned…" | 7920–**8192** | **8134**–8404 | **0.94** | exit opens 57 px early |
| `div.quests` (the two mission cards) | 8126–**8417** | **8134**–8404 | **0.24** | exit opens 283 px early |
| `p.handoff` "↳ source ↗ · live prototype ↗" | 8364–8613 | **8134**–8404 | **0.00** | **never visible, any scroll position** |

**A1 · `p.handoff` in beat 7 is invisible on the entire page (desktop).** Its
rewritten exit (p −0.100 → 0.182) lies *entirely before* its entrance
(p 0.14 → 0.40), so `eout` is already 1 when `ein` starts and `op = ein·(1−eout)`
is 0 throughout. **The LifeQuest source and live-prototype links never render.**
Still: `stills/b7-05-handoff-would-have-arrived-y8612.png`.

**A2 · `div.quests` peaks at 0.24** — the beat's only real content is a ghost.
Mobile fails differently: `quests` survives, `figure.plate.bare` collapses to 0.04.

**A3 · `figure.plate.bare` settled for 27 px** — 95 % of its on-screen life is spent
animating.

**A4 · Beat 7 is blank for its last 540 px** (op 0 from y 8404 to the beat's end).
Desktop's only dead-air window ≥300 px is exactly this hole; it is not independent.

#### The constraint that makes this surgical rather than a rewrite

**The curtain is not a bug. Do not delete it.** The code comment above it records
why it exists: *"the census caught op-1.0 ledger text on the sub-AA day stops at
768–2560"* — these elements must be gone **before** the field darkens, or they fail
contrast. It is an accessibility deadline expressed as a shared exit.

So the defect is not "the exit is shared." It is that **the entrances do not
respect a deadline the exits obey.** The fix belongs on the entrance side (or on
both, as one synchronised group), and whatever you do must keep every dusk element
at op < 0.02 before the first darkening frame at `Y2 = yDark − 40`. Re-run
`test:contrast` reasoning against the day stops; do not trade a visibility bug for
a contrast bug.

### A5 · The story's closing line never appears — **a different remedy class**

`p.mono` — *"the run token you have been following halts here. it will wait as long
as it takes."* — needs scroll to **y 12,241.8**. The document's `maxY` is
**12,006**. The page runs out **236 px too early**; the line tops out at **op 0.04**
and sits at viewport-y 674 permanently. Desktop only; mobile's taller document
reaches 1.00.

This is the **highest narrative severity in the report** — the run's last sentence,
the one that closes the whole metaphor, is unreadable — and it is a document-height
/ anchor problem, **not a timing problem**. Fix it as its own change so it can be
attributed on its own.

### A6 · A comment that contradicts the code

Line 1312: `/* fx elements: arrive → settle-with-drift → depart. Nothing parks. */`
**Nine desktop elements never fall below op 0.02.** Eight are beat 10 with an
explicit `out 2 2.5` (intentional, and correct — the gate should park). One parks
without declaring it. Fix the comment to state the parking contract, and either
declare or fix the ninth. This project gates on comment-contradicts-code; it is
cheap and it is exactly the class we catch.

### The static world must stay true

`body.settled` (the error fallback) forces every opacity to 1 — that is the
prototype's A7 static end-state, and it must remain equal to the animation's final
frame. Any fix that makes the static world differ from the settled animation is a
regression even if every timing number improves.

---

## Part 2 — AUTHOR THIS (choreography — a target, not a rule)

### The headline the owner felt

**On desktop, 10 of 11 beats are never fully assembled at any scroll position.**
Counting only elements actually in the viewport, asking how many are simultaneously
at op ≥ 0.98:

| | beats ever coherent | total coherent scroll |
|---|---|---|
| desk | **1 of 11** (beat 9, 96 px) | 96 px of 12,006 = **0.8 %** |
| mob | 3 of 11 | 384 px of 15,667 = **2.5 %** |

**The median element spends 49 % of its on-screen life mid-animation. Not one
desktop element is ever settled for a full second at reading pace** (dwell max
679 px, median 428 px, 14 of 64 under 0.5 s).

That is the measurement behind *"the timing lacks."* **The reader is never shown a
finished picture.**

### The mechanism

Entrances are staggered `in .05` → `in .21` across a station; the exit is pinned at
the inherited default `out .76 .98` regardless of depth. **The stagger moves, the
exit does not.** So `(first element begins exiting) − (last element finishes
entering)` is negative at 8 of 11 desktop beats and 9 of 11 mobile:

| beat | last IN completes | first OUT begins | overlap |
|---|---|---|---|
| b1 who | y 1374 `p.nb` | y 1103 `p.kicker` | **−271** |
| b2 the yard | y 2678 `div.schoolrec` | y 2225 `p.kicker` | **−453** (mob **−1345**) |
| b3 Applied | y 3861 `p.handoff` | y 3677 `p.kicker` | **−184** |
| b4 Cadence | y 5008 `p.handoff` | y 4833 `p.kicker` | **−175** |
| b5 Glyph | y 6232 `p.handoff` | y 6095 `p.kicker` | **−137** |
| b6 jetpack | y 7574 `p.handoff` | y 7272 `p.kicker` | **−302** |
| b7 LifeQuest | y 8934 `p.mono` | y 8161 `figure.plate.bare` | **−773** |
| b8 AutoML | y 9966 `p.handoff` | y 9560 `p.kicker` | **−406** |

Beat 3 in full — at y 3860, the instant the handoff line reaches op 0.96, the
headline "Applied." is already down to **op 0.28**:

```
enter 3015→3192 | exit 3677→3846 | dwell 484px  p.kicker   "¶ 04 · first station"
enter 3076→3276 | exit 3744→3921 | dwell 468px  h2         "Applied."
enter 3078→3416 | exit 4027→4286 | dwell 611px  figure.plate
enter 3181→3392 | exit 3826→4005 | dwell 434px  p.bright
enter 3283→3500 | exit 3893→4069 | dwell 393px  p.mutedln
enter 3416→3671 | exit 4077→4278 | dwell 406px  p.prov.mono
enter 3629→3861 | exit 4180→4356 | dwell 319px  p.handoff  ← last in, shortest dwell
```

### The cruellest consequence, and the one to fix first

**The last line of every station — the one carrying the case-file, source and
live-build links — has the shortest settled life in the file.** 283 px / 0.38 s at
beats 6 and 8; 319 px at 3, 4 and 5. The links that prove the work are the ones the
reader has least time to see.

### Targets, not prescriptions

The report is explicit that this tier is **a choreography decision, not a bug**, and
the naive fix — stagger the exits to match the entrances — lengthens every dwell and
may kill the overlapping flow the owner liked. So:

1. Every station reaches **full coherence for ≥ 1 s** at the audit's reading pace.
2. Each station's **last line (the links) gets dwell ≥ its own headline's**.
3. Get there however reads best. Pull entrances earlier, tighten the stagger,
   hold exits, re-cut the beat — your call.

### Also measured, lower tier

- **Arrives late (20 desk / 21 mob)** — entrance completes after the reading line
  (`y + 0.62·vh`) has passed the element's centre. Worst: `p.mono` "dusk. the light
  is the record…" **+258 px**; `div.schoolrec` +105; `p.handoff` ×2 +96.
- **Arrives off-frame (Tier E1)** — **every station plate finishes its entrance
  while still partly below the fold.** The arrival is spent where nobody can see it:
  `figure.plate.bare` b7 **131 px** below, b6 121, b5 94, b8 76, b2/b3 33, b4 6.
  10 instances on mobile. This one is cheap and high-yield.
- **Collisions are a baseline, not events.** With the median element 49 % mid-flight,
  3–4 simultaneous transitions is normal. Only 4 desktop windows hit ≥6, worst
  **7 at y 7808–7904** (the b6→b7 handover). Fixing the 49 % baseline dissolves this
  category; chasing the spikes does not.

### One thing measured as a defect that you should probably leave alone

**Tier E2: four of beat 0's six elements never animate — they are at op 1.00 at
load** (their entrance windows resolve to negative scrollY: the kicker, the `h1`
"Ayush Yadav", the deck, the run line).

I am flagging this as **a judgment call, not a task.** A hero that fades in costs
LCP and reads as a loading screen, and this page's opening frame arguably *should*
be complete on arrival. If you leave it, say so and say why. If you change it, the
burden is showing it does not regress LCP. Either answer is acceptable; silence is
not.

---

## Part 3 — THE OPEN QUESTION (the owner's words, verbatim, twice)

> "Some of the things can be more advanced and do a better job like the individual
> boxes, which are just there on the screen. They can be a floating 3d tile or
> something or maybe more innovative things. **So open to that.**"

And, when I read that too literally:

> "**A three d tile work is not guaranteed, I want the fable opinion, an option, and
> asking for more options, what better can be done in the same front thing. So three
> tile is not a fixed thing, it's just one of my example. Let Fable explore the
> options, what more things can be done.**"

**So: the 3D tile is one candidate on your list, not the answer. He is asking for
your opinion and a set of options. Give him both, and a recommendation you are
willing to defend.**

### The measured inventory of inert surfaces

A surface counts as inert only if **all** of: no `data-fx` of its own; transform and
opacity never change across a full 24 px sweep; no DOM mutation of itself or its
contents (a MutationObserver over the whole document, which catches all twelve
`scrub*()` functions); no CSS transition or animation; not a canvas; and **no
measured response to a real pointer hover** (a real `mouse.move`, diffing computed
styles including `::before`/`::after`). Colour is excluded — the day→night arc
recolours everything and is not per-element choreography.

**Desk: 117 candidates → 45 inert. Mobile: 110 → 45.** For contrast, **19 of 111
surfaces do answer the pointer** (the manifest rows, the three Cadence chips, both
`.btn`s, the gate ladder rows, the two `.qnote` tooltips) — the page already has a
vocabulary for this; these are not on the list.

**Do not treat all 45 as a work queue.** They cluster into five parents, and the
sizes are wildly uneven:

| beat | parent (`data-fx` owner) | inert children | what they are |
|---|---|---|---|
| **b4** | `figure.plate` | **30** | `div#cadWeek` (335×165), its `div.hd` day header, and **28 `i` calendar cells** (48×33) |
| b2 | `div.schoolrec` | 5 | 5 `div.srow` — degree, coursework, certificates '26, feb 2025 finalist, mar 2025 social innovation weekend |
| b1 | `figure.plate` | 4 | header "engineer of record · filed 06:58" + 3 `li` rows (base / builds / degree) |
| b9 | `div.litany` | 3 | "Make it learn." · "Make it fast." · "Make it honest." (480×88 each) |
| b9 | `figure.plate` | 2 | the gate header, and "two of my own gates refused to sign automatically" |
| — | `div#grain` | 1 | full-viewport fixed overlay — **the only surface with no choreography at all**, in any category |

**Start with b4.** Twenty-eight of the forty-five inert children are the cells of a
**scheduling product's week grid, sitting completely dead.** A calendar that does not
fill in is the single loudest missed opportunity in the file, and the content itself
suggests its own motion. Whatever else you propose, propose something here.

`div.litany` at b9 is the second: three declarative lines — *Make it learn. Make it
fast. Make it honest.* — arriving as one rigid block. They are written as three
beats and rendered as one.

Full per-element evidence: `inventory-desk.json` / `inventory-mob.json`.

### What "options" has to mean here

A memo alone does not satisfy the owner's standing bar (*"unless you have something
good to show it to me next time"*). So:

- Written options with your **own recommendation and the reason for it** — including
  which candidates you rejected and why, because that is the part that reads as
  judgment.
- **At least one candidate actually prototyped** and openable in a browser.
- Everything inside the voice: warm paper, ink and light. No glow, no glass, no
  aurora, no neon, no particles. `NO-LIST §F`'s ink-field carve-out is narrow and
  conditional — read it before you assume anything is permitted.
- Zero new dependencies unless you can show the bytes buy something nothing already
  loaded can do. The prototype's 48.8 KB gzip with no deps is a feature; home JS at
  721 KB raw / 232 gz is already the live perf regression on the real site.

---

## Verification — this is the part that makes the work provable

The audit shipped **re-runnable probes with fixed constants**. That converts your
result from "it feels better" into a diff, so use them:

```
docs/design-lab/timing-audit/census.mjs        per-element threshold census
docs/design-lab/timing-audit/analyze.mjs       flags, collisions, dead air, beat frame
docs/design-lab/timing-audit/inventory.mjs     inert-surface inventory
docs/design-lab/timing-audit/static-boxes.mjs  the sweep behind it
docs/design-lab/timing-audit/video.mjs         reading-pace walkthrough capture
```

**Required before/after, same constants, reported as a table:**

| axis | desk now | must become |
|---|---|---|
| Tier A never-visible / never-completes | 5 | **0** |
| b7 `p.handoff` peak op | 0.00 | **≥ 0.98** |
| b7 `div.quests` peak op | 0.24 | **≥ 0.98** |
| closing line `p.mono` peak op | 0.04 | **1.00** |
| beats ever fully coherent | 1 of 11 | as high as the choreography honestly allows |
| median share of life mid-animation | 49 % | materially lower |
| station last-line dwell (b6, b8) | 283 px | **≥ its headline's dwell** |
| plates finishing entrance below the fold | 6 | **0** |

**Sequence it: fix the curtain → re-run the census → confirm Tier A goes 5 → 0 →
only then touch choreography.** If you re-time everything at once, sixty census axes
move and nobody can attribute the fix — including you.

**Add a third viewport.** The audit measured 1440×900 and 390×844 only, and states
that **821–1249 px is unmeasured** — that band crosses the `stacked` threshold and
swaps plate editions and thread anchors, so beat 7 may fail differently again there.
Run the census at ~1024×768 before and after, or the claim that the curtain fix holds
is only true at two widths.

**Guards the audit run passed, which yours must too:** `body.classList.contains
("settled")` **false** (the fallback forces every opacity to 1 and would invalidate
every reading), `prefers-reduced-motion` false, 0 page errors, 0 failed requests.

### Known limits of the existing evidence — do not re-derive these

- The two `.webm` walkthroughs **play but do not seek** (Playwright's webm carries no
  cues). This machine's ffmpeg is broken at binary load
  (`Library not loaded: libx265.215.dylib`) and `avconvert` cannot read webm, so no
  remux is possible here. **Use `stills/` for frame-exact inspection** — nine stills
  captured at the exact defect scroll positions, named with them.
- The mobile pass is a 390×844 viewport with `hasTouch`, driven by programmatic
  scroll. It does not capture iOS momentum scrolling. **All mobile px figures stand;
  all mobile seconds figures do not.**

---

## Standing law you are still inside

`docs/design-lab/FABLE-VISUAL-BRIEF.md` (the design law), `docs/NO-LIST.md`
(including the new **§F** amendments), `docs/BUILD-RUBRIC.md` (A1–A9 — note **A7**,
the static end-state must equal the animation's final frame, and **A8/D2**, exactly
one pin, already spent).

`BUILD-RUBRIC §6`: step score = **min**(rubric, recruiter, visitor). A step that
delights visitors but frustrates recruiters does not ship.
