# Fable brief — round 9: D is chosen. Now make it good.

> **Round 8's candidate D is APPROVED as the direction.** This brief replaces
> the round-8 text. The concept is settled and is not up for revision — the
> five letter-machines, the picks, and the letterform-locked defence all stand.
> What follows is a refinement round, and then a production port.

---

## §0 · The verdict

> "i want to go with **D**, but the animations we have right now, **lacks a lot
> in refinement, timing, transition, quality of the figures** and further polish
> **to the smallest inch** in the elements — or you can say the **bird and
> similar objects** — and **too fast**! do a playwright of the D and see for
> yourself … once it's at least **7-8 times better**, add that in the **main
> page**, not this demo website."

He is right on every count. I ran the Playwright pass myself before writing
this, and the numbers below are measured, not impressions. **Do not treat "7–8×
better" as hyperbole to be managed** — treat it as the instruction that this is
a long, unglamorous polish round, and that shipping something 20% better is a
failed round.

---

## §1 · What I measured (re-runnable, and you should re-run it)

Timeline of every animation on D's document timeline, Chromium, 1440×620:

```
start   end    dur    what
   45    865    820   the still letters' entrance (transition layer)
  284    924    640   machine
  609   1289    680   machine
  825    955    130   ← 130ms
  908   1128    220   machine
  917   1867    950   machine
 1125   1965    840   machine
 1125   2085    960   machine
 1159   1339    180   ← 180ms
 1275   1395    120   ← 120ms
 1275   2355   1080   the bird's whole flight
 1867   2067    200   ← 200ms
 2150   2330    180   ← 180ms
 2600   2900    300   nameplate settle
```

**Finding 1 — five moves are ≤200ms.** 120, 130, 180, 180, 200. These are the
*clicks, the flare, the landing* — the moments that carry the meaning of each
machine — and they are the fastest things on the page. At 120–130ms a move is
roughly seven frames; the eye registers that something changed but never sees
it happen. **This is the whole of "too fast", located.** The detents, the
landing, the divider's seat onto its mark should be the moments you can *watch*.

**Finding 2 — the machines pile up.** Concurrency, sampled every 100ms:

```
 300ms  #        1
 700ms  ###      3
 900ms  #####    5
1200ms  ########        8
1300ms  #########       9   ← peak
1500ms  #####    5
1900ms  #####    5
2100ms  ##       2
2300ms  ###      3
```

**Peak nine moving parts at once**, and a plateau of five from 1400–2000ms.
Meanwhile the first 300ms is completely empty. Five machines that should read as
an *ensemble* — arriving, each getting its beat — instead collide in the middle
third. The word "ensemble" is in the candidate's own name; make it true.

**Finding 3 — the whole performance is 2.85s** (45ms → 2900ms) for five
machines plus a transition layer. That is ~0.5s of attention per machine even
if they were perfectly sequenced, and they are not.

**A finding I got wrong, corrected here so you don't chase it:** I first
suspected linear easing everywhere. **Wrong** — the census shows authored
per-keyframe curves throughout (`cubic-bezier(0.3,0.75,0.35,1)`,
`cubic-bezier(0.22,1,0.36,1)`, and others). Easing quality is not the defect.
Duration, sequencing and figure quality are.

Re-run any of this with `node docs/design-lab/probe-header7.mjs 8`, and the
timeline probes are in the session scratchpad pattern — rebuild them, they are
twenty lines of `document.getAnimations()`.

---

## §2 · The figures — and the bird is the headline

I captured the bird at 3× device scale through its flight. **It is not yet a
bird.** At mid-flight it is **two straight tapered bars with a dot between
them**. It reads as a moustache, or a pair of dashes, or a wide `∨` — not a
creature.

What is missing, specifically:

- **Curvature.** Real bird silhouettes read as alive because the wings *bend* —
  a shallow S through each wing, leading edge convex, trailing edge concave.
  Two straight bars cannot read as flight at any speed.
- **A body.** The centre is a dot, which reads as a hinge pin. A bird has a
  slight fusiform mass where the wings meet, and usually a hint of head
  forward of it.
- **Asymmetry through the cycle.** Both wings currently move as a mirrored
  pair. Real flapping is asymmetric in phase and amplitude, especially while
  banking, and that asymmetry is 80% of why an animated bird reads as alive
  rather than as a metronome.
- **Silhouette variation with attitude.** A bird banking presents a
  foreshortened wing. Right now the span is constant.

**And the landing is the weakest single moment on the page.** At t≈2320 the
landed form is two strokes of very unequal weight with **rounded terminals and
a vertex that does not close** — the two strokes approach the apex and stop
near each other. The real Fraunces `v` has a sharp closed vertex and a serif.
So the crossfade from bird-pose to letter is doing work it cannot hide.

**The whole promise of this machine is that the bird IS the letter.** If the
landed pose is a crude approximation that then dissolves into the real glyph,
the promise breaks at exactly the moment it should pay off. **The landed pose
must be the letterform** — same vertex, same terminals, same stroke weights,
same optical alignment — so that the crossfade has nothing left to do.

Apply the same scrutiny to every other machine. The dial currently reads as a
small gear or an asterisk more than a dial face; look at it at 3× and decide
whether its ticks, its indicator and its detent feel are carrying the idea.

---

## §3 · What "7–8× better" should mean concretely

Not a number to hit — a standard. Concretely, at minimum:

1. **Nothing meaningful under ~350ms.** The click, the flare, the landing, the
   seat: these are the payoffs. Give them time to be seen. Slow is not the same
   as sluggish — a detent can take 400ms and still feel crisp if it is shaped.
2. **Sequence the ensemble.** Peak concurrency should be low single digits, and
   each machine should have a moment where it is the only thing moving. Total
   length may grow — **that is allowed and probably necessary.** Judge the
   ceiling by whether the page still feels alive rather than slow, and say what
   you chose and why.
3. **Redraw the figures to the smallest inch.** Curvature, mass, terminals,
   joins, optical weight against Fraunces. The bird first, then every other
   machine at 3× zoom.
4. **The landed/settled pose of every machine must BE the letterform** — no
   crossfade papering over a mismatch.
5. **Motion quality inside each move**: anticipation before the big moves,
   follow-through and settle after, secondary motion where a real object would
   have it (the bird's wings continue a beat after the body stops).
6. Keep everything round 8 already got right — 0px static diff on all seats, 0
   idle rAF, the letterform-locked defence, five machines and five still.

---

## §4 · Then port it to production

Once it is genuinely there — **not before** — port it into the real site:

- `src/components/layout/Header.tsx` and `src/app/globals.css` are the targets.
  The nameplate replaces the 13px masthead name.
- **The design-lab replay row does not ship.** Nor does the debug overlay, nor
  the measured-values readout unless you can argue it earns its place on a real
  page.
- **A7**: the static, reduced-motion and print worlds must equal the final
  frame **to the pixel**, as they do in the prototype.
- **The frame governor** — full tier gets the machines; core and print get the
  finished nameplate with no machinery mounted.
- **No second rAF loop.** Ride `gsap.ticker`.
- **LCP**: the prototype measured D at 672 / 1246 / 60ms across the three
  seats. Re-measure on the real page — real font loading, real payload — and
  report it. If the nameplate becomes the LCP element and regresses the number,
  say so plainly rather than shipping it quietly.
- **Full gates before anything is called done**: `typecheck`, `lint`,
  `format:check`, `test:contrast`, `test:proof`, `assets:check-og`, `test:seo`,
  `test:probe-routes`, `resume:check`, and the full Playwright suite — which is
  currently **935 passed / 40 skipped / 0 failed** across five browsers
  including both Safari seats. That is the number to hold.
- Expect existing specs to fail when the masthead changes. **A spec that fails
  because the site got better is a spec to update, deliberately, with its
  reasoning recorded** — this project has twice had guards that were pinning
  stale prose in place, and the lesson is written into `dossier.spec.ts` and
  `check-resume.mjs`.

**Tier 2 is still only a proposal.** Do not build it this round.

---

## §5 · The rules that have not changed

- **Only the nameplate `Ayush Yadav` gets per-character machines.** Nothing else
  on the site, ever. He has stated this four times.
- Do not use the word **"glyph"** to mean "letter" — Glyph is his product.
  Say letter, character, or letterform.
- Zero new dependencies · `mulberry32` for anything generative, never
  `Math.random` · warm paper, ink, light — no glow, glass, aurora, neon,
  particles · clay stays reserved for decisions and gates.
- **Measure, don't assert.** Every claim terminates in a re-runnable command or
  an openable file. Disproving something in this brief with a measurement is a
  good outcome — report it loudly, as I have done above with the easing.

## §6 · Standing law

`docs/design-lab/FABLE-VISUAL-BRIEF.md` · `docs/NO-LIST.md` (§A–§F) ·
`docs/BUILD-RUBRIC.md` (A1–A9; **A7** especially).
