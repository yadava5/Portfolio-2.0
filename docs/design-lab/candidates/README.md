# Header candidates — round 8: the name is ten machines, and only some of them run

Round 7 was rejected as "too basic and generic" — ten characters, one idea,
applied ten times, with the owner's literal suggestions (a dial revolving, an
a running, a bird coming in to the right place) abstracted away when they were
in fact approved. Round 8 builds them, literally, and keeps the owner's own
distinction: **the transition is a layer; the machines are what specific
characters ARE.** Tier law (owner-assigned): the nameplate is the ONLY element
on the site that ever gets per-letter machines. Everything else — chapter
headlines, case-file titles, kickers, the hero claim — is tier 2: one gesture
per heading, never per-letter (proposals sketched at the end of this section).

Both pages share round 7 B's re-cut first frame (nameplate scale, kerning
restored by measurement, running-head handoff, `?static=1`, live motion
toggle) and its rule: **base DOM state IS the final frame** — machines are
overlays the motion world builds and removes; the static world never mounts
them (A7 by construction, verified 0 px below). Machine geometry is not
guessed: every anchor was **fit from pixel scans of this font's own ink**
(stroke-centerline runs at sampled row heights — the scan method and the
resulting fractions are commented per machine in the source). `?debug=1`
overlays every machine's resting pose in pine over the letters for alignment
review. Deterministic variation: `mulberry32` (geometry.ts:158), never
`Math.random`. Zero dependencies, zero rAF loops — CSS animations + WAAPI.

## `header-d-ensemble.html` — "The ensemble." (five machines)

**The argument.** Ten characters; five are machines; five hold still so the
five can be read. Each machine is derived from its own letterform, and each
would be meaningless on any other letter:

- **A — the dividers.** Two straight strokes hinged at one apex — the only
  letterform in the name that IS that (verified against the scans: the right
  stroke extrapolates through the apex at .508 to its foot at .864; no other
  letter has two straight strokes meeting at a single vertex). They stand
  closed on the baseline, swing open past the mark and onto it the way a hand
  opens dividers, and the crossbar ties the setting — the drawing instrument
  arrives first and sets the measure of the line. Removed the letter, an
  opening hinge states nothing: the stance it opens TO is the letterform.
- **s — the road.** The one letter that is a single continuous open path with
  no junctions and no retraced stroke — the only road a runner can take end
  to end without lifting. An ink bead runs it, the stroke draws behind it
  (the site's own token-and-edge grammar, A1), and the bead parks exactly
  where the letter's bottom terminal already sits. On any other letter the
  bead would have to lift, fork, or double back — the mechanism exists only
  because the s's topology does.
- **a (Yadav's first) — the dial.** A bowl on a stem is a dial; his own
  suggestion, built literally. It revolves through seven detents, decaying,
  hesitates on the last stops, overshoots the final catch and clicks home —
  and the click point is where the bowl meets its own stem (notch rest −12°,
  the measured junction). The rest of the letter then inks on FROM the click
  point, both directions at once: set the dial, the letter engages. The d has
  a bowl too — but no indicator: only the double-storey a wears its shoulder
  as a pointer springing off the click point, which is what makes it a dial
  and not a circle.
- **a (Yadav's second) — the runner.** "a is a bit running" — his words,
  honoured on the letter that can: the double-storey a is the one letterform
  that carries its weight forward over a foot (the bowl overhangs the
  baseline ahead of the stem). It arrives late, at a run from beyond the
  right edge — lean and gait decaying, run-up measured and printed — and
  *decelerating into its own lean* is how it becomes the letter. A gait with
  no letterform under it states nothing.
- **v — the bird.** His example, built as stated: a distant bird's silhouette
  and a lowercase v are the same two strokes. The wings are DRAWN as the
  letter's own stems hinged at the apex — identity pose IS the letter — so
  flight is a rotation away from being a v and landing is the return. It
  flies in over the still letters (flap, flap, glide), flares the way real
  birds land, folds to the measured stem angles, and the strokes take the
  letter's own weights as the ink dries: heavy left (.125 em), hairline
  right (.033 em) — the calligraphic v. The name's last letter arrives last;
  the landing is the sentence's period.

**The two layers, kept apart.** The transition (arrival choreography) is
round 7 B's opsz axis entrance for the five still letters + the rising
reading matter + one letterpress press when the bird has landed — generic on
purpose, and it would run with every machine deleted. The machines never
touch opacity ramps of the plate or entrance easing; they can run with no
transition at all, and the design-lab replay row proves it on the settled
page. Phrasing is left→right, never more than two or three machines moving
at once; the five still letters (y, u, h, Y, d) are what keep the five
machines legible.

**Interaction answers (mechanisms at rest answer the hand):** the dial turns
one detent under the pointer and returns; the bird ruffles; the runner takes
one hop; everything else answers through the shared fvs hover garnish.
**Gives up:** the busiest first frame of the two — five withheld letters mean
the name assembles over ~2.6 s, and WebKit's honest LCP is the A's own
crossfade (1.23 s, inside budget, but 4× candidate E's).

## `header-e-pour.html` — "The pour." (three machines, four letters)

**The argument.** The quieter reading of the same law, and the proof the two
layers are independent: the SAME machine grammar under a deliberately plainer
transition (a bare rise — no axis play). Three machines, because two letters
share one:

- **u·s — the pour, ONE machine across two adjacent letterforms.** The u is
  a vessel — the seed table's "a bowl that can hold or spill" — and it
  spills: it tips 11.5° about its own tail foot (anticipation, then over),
  the ink surface counter-rotating to stay level the way liquid does, and
  its last drop leaves the right lip. The drop falls exactly onto the s's
  top terminal (fall measured and printed), runs the road while the stroke
  draws behind it, parks as the bottom terminal; the vessel rights itself,
  spent, and dries into the letter. The ink that set the name came out of
  the name. Neither half makes sense alone — the vessel needs a road to
  feed, the road needs a source — and both are complete letterforms at rest.
- **a — the dial** (as in D). **v — the bird** (as in D).

**Gives up:** the literal "a is a bit running" — E's running thing is the
drop, not an a. If the owner wants the runner, D is the candidate.

## Tier 2 — proposals only (not built this round, by instruction)

Tier 1 is the nameplate, and nothing else, ever. Tier 2 = one gesture per
heading, never per-letter, subordinate by construction: **one moving part
(vs five), ≤ 600 ms (vs 2.6 s), in-view once, no overlays, no withheld
text** — a tier-2 heading is always readable before, during and after its
gesture. Named sketches against real headings:

- **The hero claim ("Scroll. It's all real.¹")** — the footnote marker ¹ is
  the gesture: it drops in last, a beat after the sentence settles, like a
  citation being pinned. One element, 300 ms, states the page's thesis
  (every claim carries evidence).
- **Chapter kickers (`¶ 02 / 07 · who …`)** — the pilcrow inks
  secondary→full as the chapter's thread segment passes it: the heading is
  stamped by the same line the reader is following. Opacity only.
- **Case-file titles (Applied, Glyph, Cadence…)** — the title's underline
  draws once, left to right (`link-draw`/A2, already the house hover), and
  where it ends the folio number settles in. One dash-draw, 400 ms.
- **/evidence ledger head** — the tally line's rule draws to its measured
  width when the audit-walk finishes — the gesture is the audit's receipt,
  reusing `AuditRun`'s cadence, nothing new.

## Verification (probe-header7.mjs 8 — re-runnable)

`node docs/design-lab/probe-header7.mjs 8` runs the round-7 rig unchanged
over d/e (same seats, same measures; shots in `../shots-header8/`). Last
run, all six seats: **A7 pixel diff 0 px** (settled motion frame vs
`?static=1`, both engines, desk + mobile), **0 rAF in 3 s idle**, **0
errors**, no horizontal scroll during any flight (checked during the bird's
off-canvas approach). LCP, buffered entries: **D 708 / 1231 / 46 ms · E
936 / 302 / 46 ms** (chromium-desk / webkit-desk / webkit-mobile). The two
slower desk numbers are the honest paint of the largest letter where that
letter is machine-withheld (D: the A's crossfade); a measured Chromium
artifact was fixed en route — clearing a finished fill-both animation makes
Chromium re-record that element's LCP at clearing time (measured: an A
visibly painted at 0.9 s re-recorded at 3.0 s), so both pages now clear each
still letter's animation at its own `animationend`, which also removes the
AA-drift risk round 7 measured. Contrast, computed not eyeballed (WCAG /
APCA on w1 `#FBF3E7`): ink 14.24:1 / Lc 96 · ink-2 6.61:1 / Lc 78.7 ·
machine strokes (wet ink `#4A382A`) 10.09:1 / Lc 89 · detent ticks @ .35 →
Lc 34 (transient scaffolding) · settled baseline rule @ .09 → Lc 8.6 — a
deliberate sub-Lc-15 contour whisper per the house 4–6% grammar, carrying
nothing.

## The memo — recommendation: **D (the ensemble)**

D is the direct answer to the brief: all three of the owner's named
suggestions built literally (dial, running a, bird), plus two authored from
the letterforms' own geometry (dividers, road), five distinct mechanisms on
five characters with five held still — count and variety are the anti-generic
argument, and every mechanism is letterform-locked (the defence above states,
per machine, why it could not be swapped onto a different letter). E is the
restraint edition — same law, three machines, one of them a two-letter
coupling that D has no equivalent of — and doubles as the working proof that
transition and mechanism are separate layers, since it runs D's grammar under
a different transition. If D reads as one machine too many in review, the
pour replaces the road+runner pair without losing the owner's dial or bird.
Production notes for the winner: mount the overlay engine behind the triple
motion gate, ride `gsap.ticker` for any future scrub coupling (§F3 — the
prototypes schedule zero loops of their own), and keep the replay row
design-lab-only.

---

# Header candidates — round 7: the name comes alive

Three competing masthead directions, built as standalone first-viewport
studies. The owner's ask: the name should **come alive** the way a Google
doodle does — performing once, on arrival — and it must be **functional**,
never a screensaver. All three share the same re-cut of the first frame:
the name finally leaves 13px chrome and takes the nameplate slot at
masthead scale; the claim ("Scroll. It's all real.¹") keeps its words at
deck scale; the fixed running head withholds the wordmark while the
nameplate is on stage and receives it on scroll-out (a monograph's running
head starts after the title page). Every page: `?static=1` forces the
static world; the masthead "motion" toggle is live; base DOM state IS the
final frame, so the static world equals the settled frame by construction
(A7), verified by pixel diff below.

## `header-a-hand.html` — "The hand."

**The argument.** The site's grammar is one continuous line of ink; the
header performs where that line comes from. A visible nib writes the name
in ONE monoline stroke — wet ink (`#4A382A`, 10.09:1 / Lc 89) drying to
ink behind the pen — and the stroke that finishes the final v does not
stop: it pools where the pen lifts and runs on as the dashed FUTURE
thread (solid past / dashed future, the thread's own vocabulary).
Letterforms are authored cubic skeletons assembled with deterministic
hand-shake (`mulberry32`, copied from `src/components/thread/geometry.ts:158`);
cadence comes from **measured arc lengths** (time ∝ length^0.92, a breath
at the word gap) injected as keyframes; `stroke-dashoffset` is the
sanctioned draw and the nib rides `offset-path` inside the SVG. Zero
dependencies, zero rAF. **Gives up:** the typographic identity — the name
becomes lettering, not Fraunces; cursive reads slower at 390px; the SVG
cannot be the LCP element (the text below carries it — measured 1.25–2.2 s).

## `header-b-compositor.html` — "The compositor."

**The argument.** The name is SET, and the machinery of setting it shows.
Fraunces finally spent at nameplate scale (600 · opsz 144 · SOFT 50,
clamp 3.55→10.6rem); the letters arrive THROUGH the optical-size axis
(opsz 18→144, wght 660→600 overshoot — a real interpolation the font
performs, not a keyframe); metric hairlines draw beneath — **positioned by
the browser's own resolution of 1cap / 1ex / the baseline marker, and
labelled with the read-back px** — then retire to the site's 4–6% contour
whisper while a mono readout keeps the facts at rest ("fraunces · opsz 144
· wght 600 · soft 50 — measured this render: line 842px · cap 117px ·
x 79px"). Kern pairs (per-letter spans defeat them) are restored by
measurement: pair-width minus summed singles, applied in em. One
letterpress press (scale 0.9965) ends the show. Hover: SOFT 82 / wght 628
with neighbour falloff — the same axes, under the reader's hand. A
design-lab scrubber below the fold proves the nameplate answers the
day-arc (wght eases down toward golden hour; at the dusk flip the ink goes
cream and drops to wght 576 — cream on the ledger browns runs optically
heavier). **Gives up:** the least literal reading of "doodle" — no figure
crosses the stage; the performance is typography's own.

## `header-c-reader.html` — "The reader."

**The argument.** The strongest reading of "functional": the name arrives
as the machine sees it. Every letter opens as its own coarse ink raster; a
read head crosses left→right and each letter resolves to print as it
passes. Below, a specimen strip shows the literal 784-float input each
letter becomes (28×28, the same downsample pipeline as the digit demo) and
the author's **real C++→WASM network** (784→100→10, 97.01% on MNIST,
vendored in `wasm/`) prints its honest best guess per letter — digits,
wrongly, as it must: "read in 68 ms, locally — 0 for 10, as it should be.
the name stands." Every number is computed in the tab; engines rasterise
canvases differently, so WebKit's confidences differ from Chromium's —
each browser's strip is a true read of what that browser drew. **Gives
up:** 398.8 KB of network on the wire for a masthead joke told once; the
strip is permanent apparatus, so the first frame leads with wit — the
recruiter-lens risk of the three.

## Verification (probe-header7.mjs — re-runnable)

`node docs/design-lab/probe-header7.mjs` serves this folder, and for each
candidate × {chromium-desk, webkit-desk, webkit-mobile} measures LCP
(buffered entries), a 3 s rAF census AFTER settle, console/page errors,
and the A7 pixel diff (settled motion frame vs `?static=1` frame). Last
run, all nine seats: **0 rAF in 3 s idle, 0 errors**. A7 diff: **A and B
identical to the pixel on every seat (0 px)**; C ≤ 0.014 % (residual
canvas AA in the strip cells). LCP: **B 41–348 ms**; A 1.25–1.30 s
(WebKit; the signature SVG is not an LCP candidate, the sigline text is);
C 1.75–1.79 s (WebKit; the stripnote). The Chromium 2.2–2.6 s readings on
A/C are attribution artifacts of the settle-hygiene repaint of an
already-visible block — WebKit's timings are the honest paint times.
Contrast, computed not eyeballed: ink on dawn 14.24:1 / Lc 96 · ink-2
6.61:1 / Lc 78.7 · wet ink 10.09:1 / Lc 89 · perform labels 5.45:1 /
Lc 73.4 · dusk cream −90.1 / −94.5 Lc. Shots in `../shots-header7/`.

## The memo — recommendation: **B (the compositor) as the masthead**

B is the one that survives all three lenses. It answers "the name comes
alive" with the name itself performing through real machinery — the
variable font IS the tool working, the metrics ARE the math in the
background, and every printed value is measured in the render. It costs
zero bytes, lands LCP an order of magnitude ahead of the other two, holds
the typographic identity that is this site's strongest suit, and its
static form is the finished nameplate. **A** is the best pure doodle but
trades type for lettering at the exact spot the identity lives — its
mechanism (nib, wet ink, one line) belongs at the **¶07 gate**, where the
author should sign the paper the thread just finished. **C** is the
deepest "functional" and the site's honesty-wit at full strength, but it
spends 398.8 KB and leads the first frame with a deliberate misread; its
mechanism is load-bearing at the **Glyph case file** ("watch it read a
digit" — ANIMATION-MAP ②), where the network reading things is the
subject, not the garnish. Typography proposal (shown moving in B): the
nameplate takes Fraunces 600/opsz 144/SOFT 50; entrance travels the opsz
axis; hover spends SOFT; the day-arc drives wght/SOFT and the dusk cream
flip; **WONK stays reserved** for the ending litany per Part 3.5.
Colour proposal, measured: **no new resting ink** — a darker display cut
(#1A1712) buys +2 Lc over `--color-ink` (96→98), not worth a token; the
one colour the name earns is **transient wet ink `#4A382A`** (10.09:1)
drying to ink during any written/drawn performance, gone in every resting
frame. Clay, pine and ember stay untouched — the name performs inside the
two-accent silence.

---

# Hero candidates — round 2: the live-network heroes

Three competing hero directions, built as standalone clickable prototypes.
All three wire the same real centrepiece: the MNIST classifier Ayush wrote in
C++ with hand-written SIMD, compiled to WebAssembly (`wasm/`, copied from
`fast-mnist-nn/web/dist/wasm`, MIT © Ayush Yadav, 784→100→10). The visitor
draws a digit and the network reads it in-tab — no server, nothing faked.
Fonts are the site's own built subsets (`fonts/`, pulled from
`out/_next/static/media`): Fraunces var 118 KB, Newsreader var 22+23.8 KB
(roman+italic), Fragment Mono 14.8 KB. **Serve this folder over http** —
`file://` blocks module/wasm loading; every page degrades to a visible
"serve over http to run" state instead of faking a readout.

Shared demo weight: `fast_mnist.wasm` 45.9 KB + glue js 42.3 KB + weights
310.6 KB ≈ **398.8 KB** — the price of one hero image, loaded eagerly.
All figures below are bytes on the wire from the probe server
(uncompressed; GitHub Pages' gzip would shrink the html/js further).
No page uses any runtime dependency — no three.js, no GSAP, nothing.

## `hero-a-paper-amplified.html` — "The paper, amplified."

**The argument.** The warm-paper editorial identity is the brand across six
product booklets — keep it, stop being timid with it. The name becomes the
masthead at ~8rem of Fraunces, the deck states the claim in one breath, and
the first viewport's right half is a specimen plate ("Fig. 01") where his
network reads your handwriting, with softmax bars, the 28×28 the net actually
sees, and a rubber stamp that inks "read locally · no server" on first
inference. Clay is used with conviction: the slug rule, the bars, the stamp,
the shipped-products ticker. Restraint plus one astonishing interaction beats
decoration. **Cost:** 603.8 KB total transferred (page 26.5 KB); zero
dependencies; deploys as static export unchanged. **Gives up:** the
five-second "wow" of a dark, cinematic landing — its spectacle is quiet and
only fires once you touch it.

## `hero-b-two-worlds.html` — "Two worlds."

**The argument.** The landing's job (win five seconds) is not the dossier's
job (convince an engineer who reads), so give each its own world and own the
seam. World 01 is night — the site's own dusk tokens (#2C2622, ink-dusk,
ember) under a raw-WebGL fbm ember shader (~90 lines, zero deps) that pulses
when a classification lands; the pad is a glass plate centre-stage and a
ghost of the predicted digit blooms behind it. World 02 is the existing
paper: a manila-tabbed dossier that slides over the stage like a folder laid
on a desk, ember ribbon crossing the seam, ledger of the six products with
receipts. The cue line says it outright: "the spectacle ends — the evidence
begins." **Cost:** 604.2 KB total (page 26.8 KB); zero dependencies; static
export unchanged. **Gives up:** one coherent register — the seam is a bet,
and both worlds must be maintained; the hero copy leads with the demo, not
the name (the name anchors top-left and the sub-line).

## `hero-c-full-modern.html` — "Full modern."

**The argument.** Abandon the paper entirely: blue-black studio register,
Fragment Mono as structure, volt (#C8F751) as the only voice of colour, and
the honest spectacle as a full-viewport 3D scene — his actual 784→100→10
topology rendered as a constellation in hand-rolled WebGL (points, additive
lines, projected digit labels). Drawing lights the real input pixels, real
hidden activations and the real softmax through the web; a pulse walks the
layers when the classification lands; the camera drifts, parallaxes with the
pointer and pulls back as you scroll into the work list. Maximum
first-five-seconds impact, engineered rather than faked. **Cost:** 587.2 KB
total (page 31.8 KB — the 3D engine is ~7 KB of it; a three.js route would
have added ~170 KB gzipped, refused); zero dependencies; static export
unchanged; falls back to a static dot field without WebGL. **Gives up:** the
paper identity and the booklet coherence — the six dossiers would need a
matching dark treatment or an owned B-style seam, and that cost is real.

## Verification

`../shoot-hero-candidates.mjs` serves this folder, walks every page at
1440×900 and 390×844 (SwiftShader WebGL), scripts a "3" and a "0" onto each
pad with mouse events, and records `window.__demo.last`. Last run: all six
page/viewport pairs live; drawn 3 → predicted **3** (conf ≈ 99.7%), drawn
0 → predicted **0** (conf ≈ 96%), forward pass ≈ 6 ms under SwiftShader-era
headless (native is faster). Shots in `../shots-hero-round/`. Contrast was
computed, not eyeballed: body/secondary text in every world clears APCA
Lc 60+ (A: ink 97.5 / ink-2 80.1 / clay-as-text 71.3; B: ink-dusk −94.5 /
muted −71.9, ember reserved for display; C: text −98.2 / secondary −63.9 /
volt −91.8).
