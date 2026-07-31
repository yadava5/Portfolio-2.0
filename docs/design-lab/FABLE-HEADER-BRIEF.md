# Fable brief — round 7: the name comes alive

**The owner's ask, verbatim.** Quote it back to yourself before every decision:

> "What I wanna do with my header, like, especially where my name is or the
> specific fonts — I want them to **come alive**. If you have seen how Google
> is written when you open Google first time, the characters are **running,
> spinning**, and all kind of things. So I want my name to be appearing
> similar way, and it should be **functional** and do something more — like
> there's a **tool working**, or a **bird coming in**, or some kind of cool
> work going on, **math, trigonometric diagrams working in background** or
> something similar. So you can **experiment and mix and match** with cool
> things with the header. And any specific font or kind of things, and you can
> also look at the **coloring**. So **go deep into this thing.**"

---

## What he is actually describing, and the trap in it

He named a Google Doodle. A doodle is: **a wordmark that performs, once, on
arrival, and rewards you for having watched.** That is the shape to hit — not
the aesthetic. Google's doodles are playful because Google is playful; this
site is a working paper with an evidence ledger, and a bouncing rainbow
wordmark would read as a different person's portfolio.

**Do not translate this literally.** He has corrected a literal reading before,
sharply. Earlier in this project he said the storytelling should feel like
"birds flying left to right, the trees came, the bushes changed" — and when
that was taken at face value he said: *"I mean that as an example of what kind
of storytelling I want. Not exactly as forests. So what the hell? You just
start making a forest or something. Like, what you're doing? Think about it
again."*

So "a bird coming in" is **an example of a thing that arrives and crosses**,
not a request for fauna. "Trigonometric diagrams working in background" is
**an example of visible machinery that means something**. Your round-5 answer
to the 3D-tile question is the model: he named a tile, you argued the tile was
wrong, and you were right. Do that again here.

**But do not under-deliver either.** He said *go deep*, and he has said the
appearance is what he is least happy with. The failure mode on this one is
timidity, not excess. A tasteful 4px letter-spacing tween is not what he asked
for.

## The one hard constraint: "it should be **functional**"

This is the word that separates a good answer from a screensaver. Whatever the
name does, it should be **doing something real**, not miming. This site's whole
grammar is that every element IS the idea it represents — the design law's D6
forbids decoration that states nothing.

Candidate readings of "functional", for you to weigh:

- the wordmark is **drawn by a process the reader can see running** — a plotter,
  a solver, a rasteriser — and the process is one of his real ones
- the letterforms are **the output of something measurable**, so the animation
  is a computation and not a keyframe
- it **responds** to something true — the time of day (this site already has a
  06:12→22:41 arc), the visitor's own hardware, the scroll
- it **states a fact** while it performs, the way the site's figures do

At least one of these should be load-bearing in what you build.

## Material that already exists and is his

You are not short of real machinery to draw from. All of this is already in the
repo or already shipped:

- **A real C++/WASM neural network.** 45.9KB wasm + 42.3KB glue + 310.6KB
  weights, ~6ms forward pass, MIT © Ayush Yadav, vendored at
  `docs/design-lab/candidates/wasm/`. It classifies hand-drawn digits at 97.01%.
  A wordmark that is *read* by his own network is functional in the strongest
  sense of the word.
- **The day arc** — seven waypoints, 06:12 to 22:41, already scrubbing a real
  dawn→night colour world.
- **The red thread** — one continuous ink line down the whole run.
- **`mulberry32`** in `src/components/thread/geometry.ts:158` — the existing
  deterministic generative hand, therefore SSR-safe. Any generated stroke
  should reuse it rather than `Math.random`.
- **The SIMD race, the gzip stream, the approval gate, the parse** — four real
  processes with real visual logic, already drawn elsewhere on the site.
- **`TextGarnish`** — the existing micro-interaction vocabulary (rotateX ≤ 2.2°,
  press scale 0.9965, `gsap.quickTo` on the one ticker, full-tier only).

## Typography and colour — he explicitly opened both

> "And any specific font or kind of things, and you can also look at the
> coloring."

This is a real invitation and you should take it. Currently: **Fraunces** for
display (variable, with optical size and wonk axes), a mono, and a serif; ink
`#26231c`, clay for decisions and gates, warm paper.

Things worth actually evaluating rather than assuming:

- Fraunces' **`wonk` and `SOFT` axes** are already available and largely
  unspent — a variable axis animating is a font *doing* something, not a font
  being moved.
- Whether the name wants a **different face from the rest of the display
  type** — a wordmark is allowed to be its own thing.
- Whether the current ink/clay pair is enough, or whether the name earns one
  more reserved colour. **§F is narrow — read it before you decide.** Warm
  paper, ink, light. No glow, glass, aurora, neon, particles.
- Real variable-font axes, real optical sizing, real kerning — this site is
  typographically the strongest thing about the current design, so the header
  should be its best paragraph, not its loudest.

## Where this lives, and the honest constraint about it

The header is **shipped production code**, not a prototype:
`src/components/layout/Header.tsx` and `src/app/globals.css`. That means real
constraints apply:

- **The masthead sets his name at 13px today.** That is part of why the page
  feels flat, and it is fair game.
- **A7** — the static/reduced-motion/print world must equal the animation's
  final frame. A name that only exists after an animation is a broken name.
- **LCP.** The masthead is above the fold. Anything that delays or reflows the
  name is a regression; measure it, do not assume it.
- **No second rAF loop** (NO-LIST §E, re-affirmed as §F3). Ride `gsap.ticker`.
  The site's idle cost is currently ~732 callbacks from that one ticker and it
  must not gain a second source.
- **The frame governor** (`full | core | print`) — the rich version is
  full-tier; core and print get an honest static form.
- **Zero new dependencies** unless you can show the bytes buy something nothing
  already loaded can do. Home JS is 721KB raw / 232 gz and that is already the
  live perf regression.
- **Safari.** Both WebKit seats are in the matrix now and they are not
  cosmetic — variable-font animation and SVG text metrics differ there. Measure
  in webkit, not just chromium.

**Prototype first.** Build in `docs/design-lab/candidates/` where you are free,
prove it, and only then propose the production port. Do not touch `src/` until
the direction is picked.

## What you owe

1. **Options with your own recommendation**, including what you rejected and
   why. That reasoning is the part that reads as judgment, and it is what he
   asked for when he said "experiment and mix and match".
2. **At least two genuinely different directions built and openable** — not one
   idea at two intensities. He is choosing a direction here, and a single
   candidate is a decision made for him.
3. **A typography and colour proposal**, since he opened both by name. Show the
   axes actually moving, not described.
4. **Measured**: LCP unchanged or better, no second rAF loop, the static form
   equals the final frame, and it holds in both Safari seats. Use the existing
   probes in `docs/design-lab/timing-audit/` where they apply.

## Standing law

`docs/design-lab/FABLE-VISUAL-BRIEF.md` (THE DESIGN LAW, §D / D1–D8) ·
`docs/NO-LIST.md` (§A–§F; **§F** is the ink-field carve-out and it is narrow) ·
`docs/BUILD-RUBRIC.md` (A1–A9; note **A7**, **A8/D2** one pin already spent,
**A9** guards added scroll length).

`BUILD-RUBRIC §6`: step score = **min**(rubric, recruiter, visitor). The
recruiter lens asks "does this read credible-professional, **not
art-project**?" — which is the exact tension in this ask, and naming how you
resolved it is part of the deliverable.
