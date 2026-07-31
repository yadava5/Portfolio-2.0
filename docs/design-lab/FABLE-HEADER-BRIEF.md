# Fable brief — round 8: the name is ten machines, and only some of them run

> **This brief REPLACES round 7's. Round 7 was rejected. Read §0 first — the
> reason it was rejected is an instruction I got wrong, and repeating it will
> produce the same rejected result.**

---

## §0 · What round 7 got wrong, and whose fault it was

Three candidates were built — a handwriting nib, a variable-axis compositor, a
WASM digit reader. The owner's verdict:

> "**not like these** … they are **too basic and generic**!"

**The cause was in my brief, not in the execution.** Round 7's brief said, in
bold:

> *"**Do not translate this literally.** … So 'a bird coming in' is **an example
> of a thing that arrives and crosses**, not a request for fauna."*

That was wrong. I over-corrected from an earlier incident where a storytelling
metaphor about forests was built as an actual forest, and I applied that lesson
where it did not belong. The owner has now said the opposite in plain words:

> "a settings dial revolving, **a** is a bit running, one character can be a
> **bird flying and coming in the right place** to the name — **these are a
> real suggestions and can be used**, and figure out the rest by yourself!!!"

**So: the bird is a bird. Build the bird.** The dial is a dial. These are
literal and they are approved. What is *not* approved is stopping at the three
he named — "figure out the rest by yourself" is the actual assignment.

The other half of why round 7 read as generic: **all three treated the name as
one object with one effect applied to all of it.** A nib writes every letter. An
axis animates every glyph. A read head crosses every letter. Ten characters,
one idea, applied ten times. That is the definition of a transition effect, and
he has now named that distinction himself.

---

## §1 · The actual specification

> "if have 10 characters in the name, i want **4-6 characters having different
> kind of animations** and **not like efects of transition itself** — the
> transition will be the layer, and the animation itself will be like a
> settings dail revolving, a is bit running, one character can be a bird flying
> and coming in the right place to the name"

**Ayush Yadav** is exactly ten characters: `A y u s h · Y a d a v`.

Three rules, all binding:

1. **Only 4–6 of the 10 animate.** Not all ten. The still letters are not
   leftovers — they are what makes the moving ones legible. A name where
   everything moves is noise; a name where five things move is a scene.
2. **Every animated character gets a DIFFERENT kind of animation.** Not the
   same motion staggered. Not one idea at five intensities. Five *different
   mechanisms*.
3. **Two layers, and they are independent.** The **transition** is the arrival
   choreography — how the nameplate gets on stage. The **animation** is what a
   given character *is* and *does* once it is there. Round 7 collapsed them
   into one; keep them apart.

---

## §2 · The idea that makes this not-generic

**The glyph must BE the mechanism, not contain one.**

A bird flying in and perching *next to* a letter is decoration — and this site's
design law (D6) forbids decoration that states nothing. A bird that flies in and
**lands as the letter**, because a distant bird's silhouette and a lowercase
`v` are the same two strokes, is the site's own grammar: every visual IS the
idea it represents.

That is the test for every mechanism you design. Ask: *if I removed the letter,
would the mechanism still make sense?* If yes, it is decoration sitting near a
letter. **The answer should be no — the mechanism should be unreadable without
the letterform, and the letterform should be complete when the mechanism
rests.**

The three he named already pass that test, which is why they are good
suggestions:

- **the bird → `v`.** A `v` is a bird. It flies in from off-canvas, banks, and
  settles into the exact position and weight of the final letter of "Yadav".
  When it lands it is simply a `v` and always was.
- **the dial → `a`.** The bowl of an `a` is a circle on a stem. A dial revolves,
  passes detents, and clicks to rest — and at rest the dial's face and the
  bowl's counter are the same shape. He said "**a** is a bit running", and there
  are two `a`s in the name, so one can revolve and one can run.
- **something runs.** An `s` is a path with no endpoints in the same place — a
  thing can traverse it. A `u` is a vessel. A `y`'s descender is a plumb line
  that swings and settles.

**Seeds, not a spec.** He said figure out the rest yourself, so the remaining
picks and their mechanisms are yours to author and defend. Some starting
observations about this specific name, offered because they are geometric facts
rather than opinions:

| glyph | what its geometry already is |
|---|---|
| `A` | a truss, a pair of dividers, an apex hinge, a ladder with one rung |
| `y` | a plumb bob / pendulum on a descender; a tuning fork inverted |
| `u` | a vessel, a magnet, a bowl that can hold or spill |
| `s` | a continuous path, an oscilloscope trace, a switchback road |
| `h` | a figure standing; an arch; a lever with a fulcrum |
| `Y` | a slingshot, an antenna, a bird from the front, a river fork |
| `a` | a dial, a gauge, a wheel with a stem |
| `d` | a flagpole with a bowl; a clock hand at its pivot |
| `a` | the second one — a different machine from the first `a` |
| `v` | a bird; a funnel; a needle's tip; a check mark |

Pick **4–6**. Leave the rest completely still. Defend the picks — why those, why
those mechanisms, and why the still ones are still.

---

## §3 · "Not effects of transition itself"

He is drawing a real distinction and it should shape the code, not just the
prose:

- **Transition layer** — arrival. Fades, slides, staggers, masks. Generic by
  nature, and that is fine; this is the layer round 7 spent its whole budget on.
- **Mechanism layer** — what the character *is*. A dial revolves because it is a
  dial. A bird flies because it is a bird. This layer has **no** relationship to
  opacity ramps or entrance easing.

The mechanisms should be able to run **without** the transition, and the
transition should work with the mechanisms removed. If a mechanism only reads
during the arrival, it is a transition effect wearing a costume.

**A consequence worth thinking hard about:** if a dial can revolve, when does it
revolve? On arrival only? On hover? On the day arc? Continuously — which this
site forbids (no idle rAF, §F3)? The honest and probably best answer is that
these are **mechanisms at rest that perform on arrival and answer on
interaction**, but that is your call to make and argue.

---

## §4 · Restraint is the craft here

The failure mode is now **cluttered**, not timid. Round 7 was timid; do not
solve that by animating everything. Ten letters each doing a trick is a
children's book. Five letters doing five different real things, on a page of
still type, is a machine shop — and the site is a working paper.

Two disciplines from the site's own law that apply directly:

- **Clay is reserved for decisions and gates.** A mechanism should not spend
  clay to be noticed. Ink and paper and light are the palette.
- **The ≤2 stamps-per-page budget** exists because this project already learned
  that apparatus multiplies. The same instinct applies to mechanisms.

---

## §5 · Hard constraints (unchanged from round 7)

- **Prototype in `docs/design-lab/candidates/` first.** Do NOT touch `src/`
  until a direction is picked. The header is production code above the fold.
- **A7** — the static / reduced-motion / print form must equal the animation's
  final frame, **to the pixel**. A name that only exists after an animation is a
  broken name. Round 7 hit 0px on A and B and ~0.01% on C; 0px is the bar.
- **LCP.** Round 7 measured this and the spread was decisive: **B 320/340/43ms
  vs A 2224/1309/1250 and C 2520/1766/1765**. SVG-heavy nameplates cannot be
  the LCP element. Whatever you build, measure it — `docs/design-lab/probe-header7.mjs`
  already does exactly this and is committed.
- **No second rAF loop** (§F3). Ride `gsap.ticker`.
- **Zero new dependencies.**
- **Both WebKit seats.** Variable-font animation, SVG text metrics and
  `offset-path` all differ there.
- **`mulberry32`** (`src/components/thread/geometry.ts:158`) for anything
  generative — never `Math.random`, because SSR.
- Voice: warm paper, ink, light. No glow, glass, aurora, neon, particles.

## §6 · What you owe

1. **One built candidate minimum, ideally two**, openable, with 4–6 distinct
   per-glyph mechanisms actually running.
2. **A written defence of the picks** — which characters, which mechanisms, why
   those, and specifically **why each mechanism could not be swapped onto a
   different letter**. If it could be, it is not derived from the letterform and
   it will read as generic again.
3. **The transition layer designed separately** and described as such.
4. **Measured**: LCP, idle rAF, static-equals-final-frame pixel diff, both
   Safari seats. The probe exists; extend it rather than rewriting it.

## §7 · Standing law

`docs/design-lab/FABLE-VISUAL-BRIEF.md` (THE DESIGN LAW, §D / D1–D8) ·
`docs/NO-LIST.md` (§A–§F) · `docs/BUILD-RUBRIC.md` (A1–A9; **A7**, and **A9**
guards added scroll length).

`BUILD-RUBRIC §6`: step score = **min**(rubric, recruiter, visitor). The
recruiter lens asks "does this read credible-professional, **not
art-project**?" — and a bird landing as a letter is precisely where that
tension lives. Resolving it is part of the work, not a reason to avoid it.

**The round-7 candidates are on disk** (`header-a-hand.html`,
`header-b-compositor.html`, `header-c-reader.html`) and their probe report is
at `docs/design-lab/shots-header7/report.json`. Read them to know what has
already been tried and rejected — and reuse anything worth keeping. A's
letterform-skeleton machinery and C's raster pipeline are both real work; the
verdict was on the concept, not the craft.
