# Fable brief — round 12: rebuild the home page AS the prototype

> **Stop porting pieces into production. That approach has now failed three
> rounds running and the owner has said so in progressively plainer terms.**
> The prototype is the design. Production supplies the words. Build the home
> page to *be* the prototype.

---

## §0 · The owner, verbatim

> "there are **no effect on the page whatsoever**, aside from that name
> animation that plays just once! … just see how you made the prototype that
> has the **train or rail that flows from my name to the end** … look at that
> prototype carefully and playwright test it and see what all things it had! **I
> want the same thing as that, with just the written content of this live
> portfolio!** That prototype portfolio design, and everything, is what I like
> … **we'll build on top of that, but only when my portfolio looks like the
> prototype**."

He has now said this four times, each time more directly. Rounds 10 and 11
shipped real, measured improvements — horizontal motion 0 → 20, reversibility
6% → 100% — and **he still does not see the thing he asked for**, because the
thing he asked for is structural and we kept delivering increments.

**This round is a rebuild of the home page, not another port.**

---

## §1 · What the prototype actually is — measured, not described

I Playwright-inspected it as he asked. Its anatomy:

### The rail — `canvas.thread`

```
canvas.thread · position: FIXED · 1440×900 (full viewport) · z-index 1
```

**One fixed, full-viewport canvas** that draws the thread continuously against
scroll. It is not per-section geometry — it is a single surface redrawn as the
reader moves, so the line flows unbroken from the name to the gate.

**Production has ZERO canvases.** Its thread is seven per-chapter SVG segments
welded within ±2px. That weld is why it can never *flow* — it is drawn in
section-local coordinates and stops at every boundary. **This is the "train or
rail" he keeps naming, and it is the single largest structural difference.**

Four canvases total: `thread` (fixed, the rail), `wash` (the ink field), `pad`
and `inCanvas` (the digit surfaces in the Glyph beat).

### The persistent chrome — three fixed elements

| element | content |
|---|---|
| `header` | `Ayush · Yadav` + `run 042 · 06:36 · the start` — the wordmark, the **run id**, a **clock that advances with the day arc**, and the **station you are in** |
| `aside` | `run 042 — manifest 0 / 6` + stamped lines: `01 applied — macro-f1 0.9791 · 96-sample…` — a **ledger that fills as the token passes each station** |
| `div` + `canvas` | the light field and the rail |

Production's masthead carries navigation. It has no run state, no clock, no
manifest, and nothing accumulates.

### The structure — 11 beats

```
 0  ¶ 01 · the start — 06:12          Ayush Yadav
 1  ¶ 02 · who — 06:58                Who.
 2  ¶ 03 · the yard — 07:52           The path.
 3  ¶ 04 · first station — 08:47      Applied.
 4  ¶ 05 · second station — 12:06     Cadence.
 5  ¶ 06 · third station — 15:23      Glyph.
 6  ¶ 07 · fourth station — 19:36     jetpack-compress.
 7  ¶ 08 · the honest hour — 21:07    LifeQuest. A prototype, told honestly.
 8  ¶ 09 · last station — 22:05       Agentic AutoML.
 9  ¶ 10 · the review — 22:23         How I work.
10  ¶ 11 · the approval gate — 22:41  Every pipeline I build ends with a human…
```

**Eleven beats, one per project plus the framing.** Production collapses this
into **seven chapters** with the six projects crushed into a single "the work"
chapter. That is why production reads as a document and the prototype reads as
a journey: **each project is its own station on the line.**

79 `data-fx` declarations, 7 `data-fx-sync`.

---

## §2 · The job

**Rebuild `src/app/page.tsx` / `StoryShell` so the home page has the
prototype's architecture, with production's content.**

### Keep from production — exactly two things

1. **All text content.** Every claim, receipt, caption, case-file link, pinned
   number. It is verified and the honesty engine depends on it. **No prototype
   copy replaces live copy, ever.** Where the prototype shows a claim the live
   data layer states differently, **the live data layer wins.**
2. **The nameplate machinery.** Approved, finished. It becomes beat 0.

Everything else about production's home architecture yields.

### Build, in this order — each stage green and live before the next

**Stage A — the rail.** Replace the seven welded SVG segments with **one fixed
full-viewport canvas** drawing a continuous thread, scroll-coupled, from the
nameplate to the gate. This is the thing he keeps naming; it comes first.

Consequences to handle rather than discover:
- `red-thread.spec.ts:108-165` asserts the seam weld within dx ≤ 2, dy ≤ 14.
  **A continuous rail has no seams**, so that spec no longer describes the
  site. **Rewrite it to assert the new contract** — continuity, that the line
  reaches both ends, that it tracks scroll — with the reasoning recorded. Do
  not delete it and do not satisfy the old one.
- A fixed canvas must not eat pointer events, must not paint over content
  (z-index 1, behind text), and must be **absent in print and reduced-motion**,
  where the static world paints the settled page (A7).
- Redraw on scroll only. **Idle rAF must stay at its current floor
  (732–734 callbacks, 0 style writes) — verify it.**

**Stage B — the travelling token.** An object that rides the rail station to
station, arriving at each headline. The rail without the token is scenery.

**Stage C — the running head and the corner manifest.** Run id, the clock
driven by the existing day arc (06:12 → 22:41), the current station; and a
manifest that **stamps a line per station as the token passes**, resolving into
the gate ledger at the end.

**Stage D — eleven beats.** Split "the work" so **each project is its own
station**, matching the prototype's structure, filled from
`projects.ts` / `projectCaseStudies.ts` / `proofManifest.ts`. This grows the
document; **A9's scroll-length guard is explicitly waived for this stage** —
the owner has asked for the longer form four times and twice said the portfolio
should be bigger than its projects. Say what it grows to.

### Non-negotiable throughout

- **A7** — reduced-motion, motion-off and print each render a complete settled
  page. With a canvas rail this is the highest-risk property; test it first,
  not last.
- **A8/D2** — exactly one pin, on `PipelineRun`. A fixed canvas is not a pin.
- **Zero new dependencies.**
- **Keep round 11's 100% reversibility** and round 9's nameplate.
- Full suite **935 / 40 / 0** across five browsers, or an honest account of
  every spec you changed and why.

**Ship Stage A alone if that is all that fits.** The rail flowing from his name
to the end is the acceptance test for this entire round.

---

## §3 · Standing law

`docs/design-lab/FABLE-VISUAL-BRIEF.md` · `docs/NO-LIST.md` · `docs/BUILD-RUBRIC.md`.
Never use "glyph" to mean "letter". `mulberry32`, never `Math.random`. Warm
paper, ink, light. Clay reserved for decisions and gates.

**Measure, don't assert.** Two of my own probes have been wrong this session —
one sampled mismatched scroll positions, one waited 70ms for a 700ms scrub lag
and nearly reported a working fix as broken. Report contradictions loudly.
