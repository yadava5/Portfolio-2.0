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
clamp 3.55→10.6rem); the glyphs arrive THROUGH the optical-size axis
(opsz 18→144, wght 660→600 overshoot — a real interpolation the font
performs, not a keyframe); metric hairlines draw beneath — **positioned by
the browser's own resolution of 1cap / 1ex / the baseline marker, and
labelled with the read-back px** — then retire to the site's 4–6% contour
whisper while a mono readout keeps the facts at rest ("fraunces · opsz 144
· wght 600 · soft 50 — measured this render: line 842px · cap 117px ·
x 79px"). Kern pairs (per-glyph spans defeat them) are restored by
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
as the machine sees it. Every glyph opens as its own coarse ink raster; a
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
