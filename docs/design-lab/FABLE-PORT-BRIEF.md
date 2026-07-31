# Fable brief — round 11: make the world move WITH the reader, both ways

> **The nameplate is approved and finished.** "i like the name now though!" — do
> not touch `Nameplate.tsx` or its choreography this round.

---

## §0 · What the owner actually meant, and he was right

Round 10 shipped the missing *directions* — horizontal 0 → 20, depth 4 → 20 on
the live site. He confirmed that was not the point:

> "the animations and the page things are **not like this anymore**:
> `story-the-long-run.html`. I really liked this concept as **moving with the
> viewer and flowing back as well if we go back**! now the diagram animations
> are **just running once**, and **nothing is flowing backwards** — you just
> switched back to the old flowing state."

He is describing **scroll-coupling**, not direction. In the prototype, an
element's opacity and transform are a pure function of scroll position:

```js
p  = (scrollY + vh - elTop) / (vh + elH)
op = ein(p) * (1 - eout(p))
```

Scroll up and it runs backwards, exactly, because there is no state — only
position. Round 10 ported the *vocabulary* and kept production's **one-shot**
model, so the site plays each entrance once and freezes. That is the gap.

## §1 · Measured, both ways

A shared scroll ladder sampled top-down, then re-sampled bottom-up along the
**same** stops; an element is "scrubbed" if its value at a given scroll
position is the same in both directions, "one-shot" if it differs by more than
8 units:

| | moving elements | **scrubbed** | one-shot | reverses |
|---|---|---|---|---|
| **live production** | 48 | **3** | 45 | **6%** |
| the prototype | 50 | **14** | 36 | **28%** |

The prototype is **~4.7× more reversible.** (Neither is 100% — the prototype
has a settle path of its own — but the direction of the difference is the
complaint, and it is real.)

**And the source says it plainly**, which is the part that matters:

- `src/components/story/TextMotion.tsx:452` —
  `scrollTrigger: { trigger, start, once: true }`. **Every chapter entrance,
  including the wings / press / rise ported in round 10, is one-shot.**
- `src/components/scenes/useSceneRun.ts:11` — *"`once: true` means the timeline
  plays a single time and dies — ZERO rAF work after the scene settles."*

Only four things on the site are scrubbed today: the manifesto word scrub, the
red thread, the day arc, and `PipelineRun`.

**An instrument failure of mine, recorded so you don't trust the first number:**
my first hysteresis probe sampled the down-pass and up-pass at *different*
scroll positions, so nothing ever matched and it reported "0 moving elements"
on both pages. The corrected probe uses one shared ladder. If a measurement
returns a suspiciously clean null, suspect the instrument.

---

## §2 · The job

**Convert the entrance vocabulary from one-shot to scroll-coupled**, so the
world moves with the reader and runs backwards when they scroll up.

### The perf objection, and why it does not apply

`once: true` exists for a real reason and the docstring states it: *ZERO rAF
work after the scene settles*. NO-LIST §F3 forbids a second rAF loop, and this
project measured the cost of idle work.

**A scrubbed ScrollTrigger does not violate that.** It computes on scroll
events and is dormant when the page is still — the same contract the thread,
the day arc and `PipelineRun` already honour, and they are all scrubbed today.
The property to protect is *zero work while idle*, not *zero work while
scrolling*. Verify it rather than trusting me: measure idle rAF callbacks with
the page still, before and after.

### What to convert, in priority order

1. **The chapter entrance vocabulary** — the wings, press and rise from round
   10, plus the existing headline/deck/prose entrances. These are the ones a
   reader scrolls back through most.
2. **The scene figures** (`useSceneRun`) — this one is a genuine judgement
   call. Some figures *narrate* (the pipeline run, the race) and reversing them
   is correct; some *conclude*, and rewinding a conclusion may read as a
   glitch. Decide per scene, say which you reversed and why, and if any stay
   one-shot say what makes them different.
3. **Departures** — round 10's exit-by-departure is already scrubbed; confirm
   it, and make sure a reader scrolling up sees a station *return* rather than
   pop.

### What must not break

- **A7** — reduced-motion, motion-off and print must each render the complete
  final frame. A scrubbed world has no "final frame" until you scroll, so the
  static worlds must still paint the settled state directly. This is the single
  highest-risk part of the change.
- **A8/D2** — exactly one pin, on `PipelineRun`. Scrubbing is not pinning; do
  not add one.
- **The red thread's 2px seam contract** (`red-thread.spec.ts:108-165`) is the
  canary. A scrubbed transform on a positioned ancestor will break it.
- **A9** — scroll length is 10,919px. Scrubbing should not need more.
- **Do not reintroduce the round-5 defect.** Stations must still *assemble and
  hold* — the fix was that a reader sees a finished picture. Scroll-coupling
  must not turn every station back into a permanent smear. Coupling the
  entrance and exit is the ask; the settled middle stays settled.

---

## §3 · Gates

typecheck · lint 0 errors · format:check · test:contrast · test:proof ·
assets:check-og · test:seo · test:probe-routes · resume:check ·
performance-budget · full Playwright **935 / 40 / 0** across five browsers.

**Report the reversibility number** from the probe above, re-run on the live
build — that is the number that says this round worked. Also report **idle rAF
with the page still** (must stay 0) and LCP/CLS (currently 76ms 1× / 220ms 4×,
CLS 0.00001).

One known flake, already filed, not yours: `pipeline-run.spec.ts:191` on
webkit-mobile fails roughly one full-suite run in two under parallel load and
passes 3/3 in isolation. If you see it, re-run before assuming you caused it —
but if you can fix it while you are in that file, do.

Expect specs to fail. A spec that fails because the site got better is one to
update deliberately with reasoning recorded. This repo has now had four guards
pinning stale state; do not satisfy a stale assertion.

## §4 · Unchanged

The nameplate is done — do not touch it. Only the nameplate gets per-character
machines. Never use "glyph" to mean "letter". Zero new dependencies.
`mulberry32`, never `Math.random`. Warm paper, ink, light. Clay reserved for
decisions and gates.

**Measure, don't assert.** Every claim terminates in a re-runnable command or
an openable file. Disproving something here with a measurement is a good
outcome — report it loudly, as I did above with my own broken probe.

## §5 · Standing law

`docs/design-lab/FABLE-VISUAL-BRIEF.md` · `docs/NO-LIST.md` (§A–§F) ·
`docs/BUILD-RUBRIC.md` (A1–A9).
