# Fable brief — round 10: ship the storytelling, and make the name arrive as one

> **This is the round that fixes a delivery failure, and the failure is mine.**
> Rounds 4, 5 and 6 built the scroll storytelling. Every one of them committed
> **zero files to `src/`**. All of it is still sitting in
> `docs/design-lab/candidates/`. Only the header (round 9) was ever ported. The
> owner has been shown screenshots of prototypes for several rounds and
> reasonably assumed the work was landing on his site. It was not.

---

## §0 · The owner's verdict, and the measurement that proves him right

> "it's all **static**. There's no motion. There's no moment of things coming
> altogether … Aside from my name machinery, **everything else is static** …
> There's no kind of scroll telling. There's **no left, right, top, bottom**, or
> anything going on in the whole page. So see what you missed."

I scrolled the live site in Chromium and WebKit and censused what actually
transforms. **He is exactly right, and the shape of the defect is precise:**

| transform kind, elements that ever change it | **live site** | round-6 prototype |
|---|---|---|
| **horizontal — translateX** | **0** | 43 |
| vertical — translateY | 57 | 90 |
| **scale / depth** | **4** | 61 |
| rotate | **1** | 19 |
| translateZ | **0** | 8 |

**The live site moves on exactly one axis.** Fifty-seven elements slide up or
down and fade. Nothing enters from the left or the right, ever. Nothing recedes
into the paper or comes toward the reader. That is the entire complaint, and it
is not a matter of taste — it is a missing dimension.

**A hypothesis I had and disproved, recorded so you don't repeat it:** I first
measured raw motion density and found the live site *busier* than the prototype
(36.1 vs 9.7 elements moving per scroll step). That looked like it contradicted
him. It does not — round 5's whole achievement was *reducing* mid-flight motion
so stations assemble and hold. Density was the wrong instrument. Direction was
the right one.

---

## §1 · Job one — port the storytelling into production

The source of truth is `docs/design-lab/candidates/story-the-long-run-relief.html`
(round 6) and the round-5 work inside it. **This is a translation, not a copy:**
the prototype runs a bespoke `data-fx` engine; production runs GSAP +
ScrollTrigger + `TextMotion`. Your own round-5 report already named what
generalises, and it stands:

1. **Deadlines and entrances must share one clock.** Any shared exit (a
   contrast deadline, a pin release) must be derived from measured content
   geometry, not from beat fractions.
2. **Exit-by-departure** — prose leaving behind the mast scrim rather than
   fading in place is what makes a "finished picture" possible in a
   viewport-sized station.
3. **Tall elements' entrances must be fold-aware** — per-element ScrollTrigger
   start/end, not a shared stagger.
4. **The last line of a section deserves dwell ≥ its headline's** — the lines
   carrying case-file, source and live-build links currently have the shortest
   life on the page.
5. **The hero is complete at load.**

And the round-6 relief cut is the part that answers this brief most directly —
**the six directions**: rise, press, recede, lay, the wings (left/right), and
the drift ladder. That is where the missing 43 horizontal and 61 depth
transforms come from.

**Constraints on the port, all real:**

- **The production CUT is on the record and still binds.** Plate depth broke
  `atlas.spec.ts:762` with 6 failures because the raster is `absolute inset-0
  h-full w-full` — zero slack, so any translation escapes its box. Reasoning is
  in `globals.css`. Scale-based depth with `s < 1` cannot escape its box; that
  is why rise/recede are the shippable spine and why `lay` may need the slack
  the prototype has. Read it before designing the port.
- **A8/D2 — exactly one pin**, already spent on `PipelineRun`. Do not add one.
- **A9 guards scroll length.** The live document is 10,919px. Round 6's
  prototype is 13,632px. Growth needs a reason and a number.
- **The red thread's 2px seam contract** (`red-thread.spec.ts:108-165`, dx ≤ 2,
  dy ≤ 14) is the canary for any layout regression. Any transform or positioned
  ancestor between `<section>` and the viewport changes `getBoundingClientRect`
  and fails it.
- **No second rAF loop.** Ride `gsap.ticker`.
- **A7** — reduced-motion, motion-off and print must each render a complete
  authored world equal to the final frame.

**Ship it in stages if that is safer, and say which stage you shipped.** A
partial port that is green and live beats a complete one that is not. But
"horizontal motion exists on the live site" is the floor for calling this round
done.

---

## §2 · Job two — the nameplate arrives as ONE thing

> "my name thing, they are working by **timing**, but I want them to **come
> altogether at the same time**, like, things working — and see what more polish
> you can do with the naming thing."

**This reverses my round-9 instruction, and my instruction was the wrong call.**
I told you to sequence the ensemble so each machine had a solo moment. You did
exactly that — seat 1.95s, park 3.65s, click 5.0s, plant 5.85s, fold 6.8s — and
the result reads as five things taking turns rather than one thing being made.

He wants the opposite shape: **all five machines running at once, visibly
working, converging on the finished name together.**

**This is not "go back to round 8."** Round 8 was concurrent *and* 2.85s total
with five sub-200ms payoffs, and he rejected it as too fast. The target is
**concurrent AND unhurried** — five machines all turning, running, flying and
seating simultaneously, each still slow enough to watch, all arriving together.

Think of a machine shop where five operations run in parallel and the piece
comes together at the end — not a relay.

Specifics to hold:

- **Keep everything round 9 fixed.** Nothing meaningful under ~350ms. The
  figures — the bird's articulated wings and body, the dial's bezel and needle,
  the landed poses that ARE the letterform — all stay. Those were the right
  fixes and he did not complain about them.
- **Overlap the machines**, so the middle of the performance has all five
  visibly at work.
- **Land them together**, or near enough that the name resolving reads as one
  event rather than five. A small deliberate spread is fine if it makes the
  final letter feel like a keystone; five separate arrivals is not.
- **Total length is yours to choose.** 7.8s exists because the payoffs were
  serialised; concurrency should shorten it naturally. Do not let it get fast
  again — the moves keep their duration, they just stop queueing.
- **"See what more polish you can do"** is an open invitation. Take it.

---

## §3 · Then show the whole page

He wants to see it all together afterwards, so leave the site in a state worth
scrolling end to end.

## §4 · Gates — the bar is exact

`typecheck` · `lint` 0 errors · `format:check` · `test:contrast` · `test:proof`
· `assets:check-og` · `test:seo` · `test:probe-routes` · `resume:check` ·
`performance-budget` · full Playwright **935 passed / 40 skipped / 0 failed**
across five browsers including both Safari seats.

Re-measure **LCP and CLS on the real page** and report them plainly; current
production is **84ms at 1× / 216ms at 4× CPU, CLS 0.00001**. And re-run the
direction census above — **horizontal and depth transform counts on the live
build are the number that says this round worked.**

Expect specs to fail. A spec that fails because the site got better is one to
update deliberately with its reasoning recorded — this repo has now had three
guards pinning stale state in place (`check-resume.mjs`, `dossier.spec.ts`, a
masthead fixture). Do not satisfy a stale assertion; correct it and say why.

## §5 · Unchanged rules

Only the nameplate gets per-character machines · never use "glyph" to mean
"letter" (Glyph is his product) · zero new dependencies · `mulberry32`, never
`Math.random` · warm paper, ink, light — no glow, glass, aurora, neon,
particles · clay reserved for decisions and gates.

**Measure, don't assert.** Every claim terminates in a re-runnable command or an
openable file. Disproving something in this brief with a measurement is a good
outcome — report it loudly, as I did above with the density metric.

## §6 · Standing law

`docs/design-lab/FABLE-VISUAL-BRIEF.md` · `docs/NO-LIST.md` (§A–§F) ·
`docs/BUILD-RUBRIC.md` (A1–A9).
