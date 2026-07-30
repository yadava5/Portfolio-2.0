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
