# ayush-yadav.com — defect inventory, text census, gate bindings

Measured 2026-09-22 against **https://ayush-yadav.com/** (live).
Premise checked: `curl https://ayush-yadav.com/ | shasum -a 256` =
`b6ea15df212e0c1578388d780c5c9b17c2c34c50cda1e79c909a05370a24b6b2` = `out/index.html`,
byte-identical, and equal to `portfolio-baseline.json → outIndexSha256`. Every
`src/run/index.html:NNN` citation below therefore describes what is served.
(`src/run/index.html` is 5906 lines; `out/index.html` is 5922 — line numbers are
**source** line numbers.)

## Instrument

Playwright 1.62 headless, imported from
`/Users/ayush/Documents/Projects/Portfolio-2.0/node_modules/@playwright/test/index.mjs`.
No Chrome extension was used. Scripts in this directory:

| script | what it produced |
|---|---|
| `sweep.mjs` | `sweep-w{1440,1280,1024,768,390,320}.json` — one fresh context per viewport, `scrollTo({behavior:'instant'})` in `vh/2` steps, 700 ms settle, then every text node in the viewport with Range rects, effective opacity (product up the ancestor chain, SVG included), an overflow-clip flag, a font bucket, effective px (computed size × ancestor scale for HTML; `fontSize × √(a²+b²)` of `getScreenCTM()` for SVG), plus `#manifest` geometry, `#mtoggle` state, `window.__world`, and `#thread`'s `getImageData` ink scanned in 4 px rows |
| `analyse.mjs` | `analysis.json` / `analysis.txt` — defects 1, 2, 3, 5 and all of Part 2 |
| `nameplate.mjs` / `np2.mjs` | `np-*.json` / `np2-*.json` — `addInitScript` rAF recorder from t=0 |
| `wraps.mjs` | `wraps-{1440,390}.json` — per-character Ranges grouped into rendered lines |
| `hovertoggle.mjs` | `hovertoggle.json` — defects 7 and 8, Chromium + WebKit |
| `mailgate.mjs`, `tabwalk.mjs` | `mailgate.json`, `tabwalk.json` — defect 9 |
| `padcrop.mjs` | `padcrop.json` — defects 10 and 11 |
| `archcensus.mjs`, `archdash.mjs` | `archcensus.json`, `archdash.json` — case file and `/evidence` census, whole-page and per-section |
| `verify2.mjs`, `verify3.mjs` | `verify2.json`, `verify3.json` — the second pass: reduced motion under real wheel events, the fig. 04/05/07 tap reveals instrumented on class/`fill` rather than `innerText`, the 390 readout after a proven classification, the `duskin` seat, the replay control's role-tree state, and a warm-cache nameplate reload |

`deviceScaleFactor: 1` everywhere, so the `#thread` backing store is 1:1 with CSS px.
390 and 320 use `isMobile: true, hasTouch: true`; **768, 1024, 1280 and 1440 do not**
(768 is a tablet width but is measured as a desktop pointer, which is what
`@media (hover:none)` keys off — stated because it changes defect 7's answer there).

Screenshots: `shots/w<width>/sNNN-y<scrollY>.jpg` (every second sweep step) and
`shots/d<defect>-*.png` / `shots/np-*.png` for the targeted probes.

**Measurement caveat that matters:** one instrument reading was wrong and is
discarded — `padcrop.mjs`'s `ink` centroid/bbox field is meaningless (it
composites the pad over an opaque black fill, so alpha is 255 everywhere and
every reading is `n:784, cx:13.5, cy:13.5`). The **classification outcomes** in
the same record are real and are what defect 10 rests on.

---

# PART 1 — defect inventory

## 1 · The fixed manifest aside overlaps body text — CONFIRMED, at every width

`#manifest` is `position:fixed; right:clamp(14px,2.4vw,34px); bottom:clamp(14px,3vh,30px); z-index:6`
— **src/run/index.html:254-260**. `main` is `z-index:2` (line 309), so the aside paints
over the prose. It has no `backdrop-filter` and an opaque-ish plate
(`--plate-solid: rgba(255,252,244,.86)`, line 252), so what is under it is hidden,
not merely crossed.

Overlap = the aside's rect intersecting a *line box* of a text node at effective
opacity ≥ 0.35, excluding `#mast`/`#manifest`'s own text.

| width | sweep steps | steps where the aside is visible | steps where it covers text |
|---|---|---|---|
| 1440×900 | 31 | 30 | **9** |
| 1280×800 | 32 | 30 | **13** |
| 1024×768 | 40 | 37 | **5** |
| 768×1024 | 34 | 32 | **8** |
| 390×844 | 46 | 43 | **13** |
| 320×640 | 62 | 58 | **28** |

Two geometries do the covering:

* the **open ledger** (262 × 301–523 px), which is the default state and the state
  in every corridor — `#manifest.compact` only folds it at `min-width:821px`
  while `beat>=1 && beat<=10 && bp>0.18 && bp<0.8` (line 4990);
* the **pill** (`compact`, 216 × 48 at 1440; 208 × 36 at ≤820 via line 1226).

Every text node covered, per width (scroll position = `window.scrollY`, ranges are
`sy … sy+vh`):

**1440×900** — aside at `[1144,572,262,301]` (open) or `[1190,825,216,48]` (pill)

| scrollY | state | covered |
|---|---|---|
| 900 | pill | `figcaption` "fig. 02 — the record card: what I build, and where to find me." |
| 1800 | open | `p.hourline` "early light — everything has a shape and nothing has a name."; `p.bright` "Five years of query logs. Zero structure."; `blockquote` "“The purpose of computing is insight, not numbers.”"; `figcaption>i` "Numerical Methods for Scientists and Engineers, 1962" |
| 5850 | pill | `.bval` "3.5×"; `p.bfoot` "measured then, committed — not run in this tab…"; `p.bfoot>a` "the raw run record (json) ⟶" |
| 6750 | open | `p.hourline` "the sun going down, and the work speeding up to beat it."; `h2` "jetpack-compress"; `h2>span` "." |
| 7200 | pill | `p.handoff>a` "the benchmark ledger @ 2caacd0 ↗" |
| 8100 | pill | `figcaption` "fig. 08 — the stair is the ledger…" + its `<i>` |
| 9450 | open | `p.kicker>i` "22:05"; `p.hourline` "lamplight. the machine works on…"; `h2` "Agentic AutoML" |
| 12150 | pill | `p.sclose` "three of the twelve stops carry a name that is not mine." |
| 13050 | open | `p.mono` "one day · twelve stops · six stations proof-cited · one signature missing"; `p.mono` "042 is the day's serial, not a visit counter…"; `span.gm` "1,186 passed · 0 skipped — 635 fe + 551 be" |

**1280×800** — 13 steps. Worst: y=8400 covers ¶09's whole heading block ("¶ 09 · sixth
station · the last —", "22:05", "lamplight…", "Agentic AutoML"); y=11600 covers five
lines of the gate ledger including `97.01% — 9,701/10,000 · macro-f1 0.9698`; y=6800
covers the jetpack handoff row ("the benchmark ledger @ 2caacd0 ↗", "system card ↗").

**1024×768** — 5 steps: y=0 covers three nameplate letters (`d`, `a`, `v`); y=2688
covers four `.schoolrec` rows; y=6144 covers the Glyph bench block ("on file @ 001e9b4 ⟶",
"1×", "3.5×", `.bfoot`, and fig. 06's caption tail); y=6528 covers
"scalar — 4.26 gb/s — bit-identical to java.util.zip.Adler32"; y=13824 covers
"Every pipeline I build ends with a human decision."

**768×1024** — 8 steps, always the 208×36 pill at `[546,974]`: y=5632 and y=7168 each
cover an entire link row ("live build ↗ · system card ↗"); y=9216 and y=7680 cover
"the raw run record (json) ⟶"; y=10752 and y=15360 cover figcaptions 08 and 11.

**390×844** — 13 steps, pill at `[168,794,208,36]`: y=2110 covers four `.prov` fragments
("legacy laravel reporter ⟶ etl ⟶", "37-month", "tableau dashboard — compliance",
"0% ⟶ 97%"); y=13926 covers "1.0 ingest"/"2.0 explore"; y=15614 covers the gate legend
"✓ a human signed for it · — the gate stopped the run…". Full list in
`analysis.txt`.

**320×640** — 28 of 62 steps. Pill at `[98,590,208,36]`, i.e. it sits **mid-screen-bottom**
in a 640 px viewport and is in the reading column. It covers, among others:
"twelve stops, dawn to dark" (the ¶01 cue), fig. 02/03/06/09's captions, the Glyph
verdict row ("locally", "· no server"), "the raw run record (json) ⟶", and three of
the gate ladder's rows.

**Open state covers more, and it is reachable by touch:** at 390, tapping the toggle
opens the aside to 300 × 301 px and it then covers the ¶01 epigraph outright —
"Caminante, no hay camino,", "se hace camino al andar.",
"Traveller, there is no road — the road is made by walking.", "Antonio Machado ·",
"Proverbios y cantares", "XXIX, Campos de Castilla, 1912", "twelve stops, dawn to dark".

Cause: **src/run/index.html:254-260** (the fixed box), **:274-277** (`.compact` only
above 820), **:1226-1231** (the ≤820 pill and its `.open` expansion),
**:4990-4991** (when `.compact` is applied). The only state that yields is
`.landed` / `[data-arrive]` / `.filed` (lines 261, 270, 880) — none of which fire in
a corridor.

Shots: `shots/w1440/s004-y1800.jpg`, `shots/w320/s000-y0.jpg`, `shots/d8-phone-open.png`.

## 2 · The red thread canvas is drawn through body text — CONFIRMED

`#thread` is `position:fixed; inset:0; z-index:1` (src/run/index.html:212), i.e. it
paints *behind* `main` (z-index 2) but through the same column. Measured by reading
the canvas with `getImageData` and intersecting alpha>40 pixels with the line boxes
of **serif prose only** (`--display` / `--body`; mono apparatus excluded).

| width | steps | steps where thread ink crosses a serif line box |
|---|---|---|
| 1440×900 | 31 | **27** |
| 1280×800 | 32 | **28** |
| 1024×768 | 40 | **16** |
| 768×1024 | 34 | **19** |
| 390×844 | 46 | **29** |
| 320×640 | 62 | **36** |

Representative crossings (1440): at y=433 the ink sits at x 669-685 inside the ¶01
epigraph translation "Traveller, there is no road — the road is made by walking."
(box `[319,262,424,20]`). At y=2250 the ink at x 997-1007 runs down the whole ¶03
column, through the `h2` "The path", "Five years of query logs. Zero structure.",
the Hamming quote and the `.prov` beneath. At y=9900 it runs at x 913-983 through
"lamplight. the machine works on…", the `h2` "Agentic AutoML", "It runs the whole
lifecycle — and refuses to finish alone." and the Lovelace quote. At 390 it crosses
the ¶06 prose column directly — see `shots/d11-390-glyph.png`, where the clay line
passes through "(the wasm in this tab predates the fourth: -msimd128, compiler-vectorised)".

**The code that decides x** is `buildThread()`, the `stx` table at
**src/run/index.html:2718-2723**:

```js
const stx = stacked
  ? [50, 26, 74, 26, 74, 26, 74, 26, 74, 26, 23, 20, 20]
  : [50, 30, 70, 31, 69, 33, 67, 33, 67, 30, 27, 24, 24];
```

x is `(stx[beat]/100) * vw`, anchored at `b.top + b.h*{0.18,0.52,0.95}` (lines
2726-2731), with a ±16 px (desktop) / ±8 px (stacked) hand wobble added in the
densify pass (`const amp = stacked ? 8 : 16`, line 2765). The terminus is forced
onto `#gateDock`'s square (lines 2757-2760).

On **desktop** the flip stations put the line at 67-74 % of the viewport, which is
inside the right-hand prose column of `.station.flip` (¶03, ¶05, ¶07, ¶09) — that is
where 1440/1280 take most of their hits. On **stacked** layouts (≤1249) the columns
collapse to one and `stx` swings between 26 % and 74 % of a single column, so the
line crosses the text body twice per station. The author's own comment at line 3225
acknowledges this ("on stacked seats the thread crosses the prose") and responds by
suppressing *canvas* text there, not the line. `#thread{opacity:.55}` at ≤1249
(line 1212) reduces it but does not move it.

## 3 · Near-empty screens — CONFIRMED, and one is literally empty

Method: per sweep step, count words in text runs at effective opacity ≥ 0.5, not
clipped, ≥7 px, excluding `#mast` and `#manifest`. Two separate thresholds, because
they say different things:

* **near-empty** = **≤60 total legible words** in one viewport;
* **prose-free** = **≤25 serif words** — the screen may be busy with figure
  labels and mono apparatus, but carries no sentence to read.

All rows below are computed from `analysis.json → density`, not read off by eye:

| width | steps | mean words / viewport | **near-empty** (≤60 words) | **prose-free** (≤25 serif) | fully blank (0 words) |
|---|---|---|---|---|---|
| 1440×900 | 31 | 161 | 5 | 11 | 1 — `y 9000…9900` |
| 1280×800 | 32 | 158 | 4 | 9 | 1 — `y 8000…8800` |
| 1024×768 | 40 | 126 | 4 | 21 | 2 — `y 8832…9600`, `y 9216…9984` |
| 768×1024 | 34 | 145 | 4 | 12 | 0 (min 20 words at `y 11264`) |
| 390×844 | 46 | 106 | 2 | 26 | 0 (min 10 words at `y 12238`) |
| 320×640 | 62 | **82** | **14** | 39 | 0 (min 20 words at `y 12480`) |

The exact near-empty scroll positions (`sy(words)`):

* **1440** — 433(52), 1800(53), 5400(58), **9000(0)**, 9450(37)
* **1280** — 382(52), **8000(0)**, 8400(37), 10800(55)
* **1024** — 384(48), 4992(48), **8832(0)**, **9216(0)**
* **768** — 512(42), 6656(41), 11264(20), 14848(55)
* **390** — 422(42), 12238(10)
* **320** — 1600(59), 5120(58), 5760(40), 6720(48), 7040(57), 8000(36), 8320(40),
  9920(41), 10880(47), 11840(41), **12480(20)**, 15680(55), 16640(55), 18240(35)

**320 is the width that suffers**: 14 of 62 screens — **roughly one in four and a
half** — carry ≤60 words, against a mean of 82 words per viewport, which is half
the 1440 figure. 39 of 62 carry no readable sentence at all. Full per-step
profiles (`sy:total/prose`) are in `analysis.txt`.

**The blank screen** (`shots/w1440/s020-y9000.jpg`): at 1440, `y 9000…9900` contains
the masthead, the manifest pill, and the thread. Nothing else. `window.__world.beat`
= 7 (`lifequest — dusk`). It is not a layout accident — it is the JS-derived seat at
**src/run/index.html:2627-2657**, the `data-fx-sync="duskin"` branch:

```js
let d = yFlip + vh * 0.52 - f.top;
…
if (mobile) d = 0;
if (Math.abs(d) > 2) f.el.style.marginTop = (m0 + d) + "px";
```

The source calls this "**AND THIS IS THE VOID**" and describes exactly the observed
symptom, then caps it to zero **only when `mobile`** — "the desktop expression is
unchanged and its census is asserted identical." So the fix that was applied to the
phone was deliberately withheld from 1440/1280/1024/768.

**Measured directly** (`verify2.json → duskin*`), reading the inline style the
engine writes onto `[data-fx-sync="duskin"]` (¶08's closing line, "dusk. the light
is the record: what shipped is lit, what didn't…"):

| width | `el.style.marginTop` | computed |
|---|---|---|
| **1440×900** | **`520.179px`** | 520.179 px |
| **390×844** | `1.6rem` (untouched — the `if (mobile) d = 0` branch) | 25.6 px |

520 px of margin on a 900 px viewport is the void, and it is written by the engine
at run time, not declared in CSS. It is the single largest contributor to the one
fully blank screen.

The rest of the near-empty screens come from the **declared station heights**, which
are 1.18-1.58 viewports each and centre their content:

| rule | src/run/index.html |
|---|---|
| `.b1{min-height:118vh; display:flex; align-items:center}` | 315 |
| `.station{min-height:128vh; …; padding-top:6vh; padding-bottom:6vh}` | 338 |
| `.b4{min-height:148vh}` | 339 |
| `.b7{min-height:136vh}` | 686 |
| `.b8{min-height:100vh; align-items:flex-start; padding-top:3vh}` | 730 |
| `.bwho{min-height:118vh}` | 996 |
| `.bpath{min-height:158vh}` | 1026 |
| `.bhow{min-height:126vh}` | 1067 |
| `@media (max-width:1249px){ .station{min-height:140vh} }` | 1201 |
| `@media (max-width:820px){ .station{min-height:150vh} }` | 1222 |
| `.bdawn{height:0}` / `body.approved .bdawn{min-height:300vh}` | 870-871 |

Measured section boxes at 1440 (vh 900): start 1062 (1.18 vh), who 1062, path 1422
(1.58), work 1152 (1.28), cadence 1152, glyph 1332 (1.48), jetpack 1152, lifequest
**1633 (1.81)**, automl 1224, review 1134, cosigners 1152, gate 900, nextmorning 0.
At 390 (vh 844) the same sections measure 1.18-**2.76** viewports (path 2330 px =
2.76 vh, automl 2290 = 2.71, glyph 2040 = 2.42) — a phone reader crosses three
screens per station, and 26 of 46 of them carry ≤25 prose words.

## 4 · The nameplate — CONFIRMED; the quoted string is real but not the worst one

Recorded with an `addInitScript` rAF loop in a cold context, composing the visible
string from each `.np-ch`'s effective opacity (>0.35 = legible). Two runs, one with
screenshots interleaved and one without: **identical to ±10 ms**, so the instrument
is not the cause.

| t (ms) | composed string | `html[data-np-ready]` | overlay SVG present |
|---|---|---|---|
| 47 | `···········` | false | false |
| 271 | `···········` | false | true |
| 729 | `·y·········` | false | true |
| 938 | `·yu········` | false | true |
| 1363 | `·yu·h······` | false | true |
| 1571 | `·yu·h ·····` | false | true |
| 1779 | `·yu·h Y····` | false | true |
| **2196** | **`·yu·h Y·d··`** | false | true |
| **4021** | **`Ayu·h Y·d··`** | false | true |
| 4113 | `Ayush Y·d··` | false | true |
| 4204 | `Ayush Yad··` | false | true |
| 4287 | `Ayush Yada·` | false | true |
| **4379** | **`Ayush Yadav`** | false | true |
| 4805 | `Ayush Yadav` | **true** | false (removed) |

* Time to a fully legible name: **4.38 s**, not ~2.5 s. **Not a cold-cache
  artifact** — a reload in the same warm context (`verify2.json → warmNameplate`)
  reaches `Ayush Yadav` at **4.16 s**, with the same intermediate sequence. The
  design intent is ~2.5-3.2 s — `src/components/story/nameplateMachines.ts:44`
  declares the dries at "A ~2.64s, s ~2.78s, dial ~2.92s, runner ~3.06s" — and the
  extra ~1.2-1.3 s is the mount gate at **src/run/index.html:5797-5823**:
  `window load` → `document.fonts.ready` (raced against a 5000 ms stop) → two rAFs,
  *then* `perform()`.
* **`Ayu·h` does render** — at 4021-4113 ms, for 92 ms. The brief's example is
  therefore confirmed, but the state that actually costs the reader is the one
  before it: **`·yu·h Y·d··`** ("yu h Y d"), held **1.83 s** from 2196 ms to
  4021 ms — longer than any other single state in the performance.
* Cause, and it is **two clocks that do not agree**:
  1. the six machine-free letters fade in on a CSS sweep —
     `animation-delay: calc(0.18s + var(--np-i, 0) * 210ms)` at
     **src/run/index.html:1285**, so letter *i* arrives at 0.18 + 0.21 *i* s —
     `y` (`--np-i:1`) at 0.39 s, `d` (`--np-i:8`) at 1.86 s, the last machine-free
     index at 2.28 s;
  2. the five machine-carrying letters (`np-m` at `--np-i` 0, 3, 7, 9, 10 = A, s, a,
     a, v) stay at `opacity:0` until their own machine stamps `[data-np-done]` —
     the "THE WITHHOLDING" block at **:1256-1300**, whose dries are the
     `nameplateMachines.ts` timings above.

  The two are never synchronised, so for most of two seconds the plate shows the
  name with five letters punched out of it. `h1` carries `aria-label="Ayush Yadav"`
  (line 1703) and the spans are `aria-hidden`, so screen readers are unaffected;
  only sighted readers see it.
* Reduced motion: the name is complete at **t=16 ms** (`Ayush Yadav`, all opacities
  1). `src/run/index.html:5758` — `if (plate && h1 && !RM)` — skips the whole
  performance. No defect there.

**The replay button** is `<button type="button" class="np-replay" data-np-replay hidden>watch it again ⟲</button>`
at **src/run/index.html:1713**, styled at **:1418-1438**. Measured live at t = 11 s
(`verify3.json → replayLate`): `data-np-ready` present, `display: inline-block`,
rect `[301, 588, 132, 15]`, 12.48 px Fragment Mono, `opacity: 0.62`, not disabled.
Clicking it does re-perform (`[data-nameplate] svg` is re-mounted, every
`data-np-done` cleared). It is visible **only** because
`html[data-np-ready] .np-replay{display:inline-block}` (line 1436) out-specifies
the UA's `[hidden]{display:none}` — **nothing in the JS ever removes the `hidden`
attribute** (lines 5826-5891 touch only `replay.disabled` and add a click listener),
so `el.hidden === true` on the live page forever. Chromium's role engine **does**
still expose it (`getByRole('button', {name:/watch it again/})` → 1, and it appears
in the page's five-button list), so the accessibility-tree consequence is not what
I first assumed — see §12.2 for the corrected claim. It is timing-fragile though:
the same query at ~4.5 s returned **0**, because `data-np-ready` is not set until
4.8 s.

Shots: `shots/np-day-{500,1000,1500,2000,2500,3000,4000}ms.png`.

## 5 · Text under 12 px

Deduplicated by selector + rendered px, visible runs only (effective opacity ≥ 0.5,
not clipped). **170 distinct selector/size pairs at 1440×900; 153 at 390×844.**
Full lists in `analysis.txt`. The distinct *sizes* and what wears them:

| rendered px | selector(s) | what the text is | role |
|---|---|---|---|
| **9.46 / 9.60** | `#slotWhen` (`#cadWeek .grid i#slotWhen`, src:498-500, `font-size:.6rem`) | `12:00` | machine value — the one thing fig. 05's whole figure resolves to |
| **10.24** | `.dawnrun` (src:972) | `RUN 043 · NOT YET BEGUN` | apparatus (¶13, post-approval only) |
| **10.56** | `.b8 footer` (src:992) | `© 2026 ayush yadav — cincinnati, oh`; `set by hand — fraunces, newsreader & fragment mono · zero dependencies` | **prose** (colophon) |
| **10.88** | `.borrowed figcaption` and its `>i` (src:1600) | `Antonio Machado ·`, `Proverbios y cantares`, `Richard W. Hamming ·`, `Numerical Methods for Scientists and Engineers, 1962`, `Donald E. Knuth ·`, `Frederick P. Brooks Jr. ·`, `Ada Lovelace ·`, `Richard P. Feynman ·`, `The Mythical Man-Month` | **attribution prose** — 7 of the 8 epigraph credits on the page |
| **10.88** | `#gatesFig .gbench.gtail>span` | `unsigned` | label |
| **11.03** | `#cadWeek .hd span`, `.tu` (src:482-484) | `mo we th`, `tu` | label |
| **11.03** | `.signs .srole` (src:1152), `.signs .sclose` (src:1154) | `applied AI & data principal, cbts — managed the ITSM work at station 03…`; `three of the twelve stops carry a name that is not mine.` | **prose** — both co-signers' job titles and the station's closing line |
| **11.09-11.20** | `.engcard header span`/`>i`, `.sigrole` (src:998, 1011) | `who built this`, `filed`, `06:58`, `answers for every claim on this page` | label + **prose** |
| **11.14-11.20** | `.padbar`, `#glyphStatus`, `#clear`, `.verdictline span`/`>b`, `#conf`, `#fwd` (src:527, 554) | `awake · local`, `clear`, `read`, `conf`, `forward`, `locally` | apparatus — **`#clear` is an interactive control** |
| **11.14-11.20** | `.bench .shead span`/`>a`, `.brow span`, `.bval`, `.bfoot`, `.bfoot>a` (src:577-590) | `the committed bench — dot-256 kernel`, `on file @ 001e9b4 ⟶`, `one thread, -O3`, `3.5×`, `66 mb/s`, `measured then, committed — not run in this tab. 3.536× at the median…`, `the raw run record (json) ⟶` | machine value + **provenance prose** + **two links** |
| **11.20** | `.mono` (src:184), `#gateNote`, `.gm`, `.gleg`, `.foot`, `.idx`, `#mcount`, `#mtoggle` | `one day · twelve stops · six stations proof-cited · one signature missing`, `scrolling could not press this button.`, `1,186 passed · 0 skipped — 635 fe + 551 be`, `run 042 — manifest`, `0 / 6` | prose + machine value + **the manifest's only control** |
| **11.52** | `.kicker` (src:311), `.plate figcaption` (src:364), `.dep`, `.nb`, `.hoverinv`, `#gzbtn`, `#chWho/#chWhen/#chMeet`, `.handoff` | `¶ 08 · fifth station · the honest hour —`, every `fig. NN —` caption, `↳ only the inventory is checked in…`, `— hover a desk to see what it settled`, `gzip a sample in this tab`, `tue · 12:00` | **navigation + all figure captions + one button** |
| **11.84** | `.schoolrec .srow span`/`.b`/`.sk`, `#mclock`, `#mphase`, `.rel`, `.state` | `· major gpa`, `cincinnati, oh`, `06:12`, `the start`, `· managed the ITSM work at station 03, as miami's director…` | machine value + label + **prose** |

Both full lists were printed (`analysis.txt`, "sub-12px selectors"). Two facts from
them worth stating rather than assuming:

* **Every sub-12 px run at both widths is mono.** Filtering `analysis.json` for
  `f !== 'mono'` among sub-12 px entries returns **0 rows at 1440 and 0 at 390**.
  No serif and no fallback face renders below 12 px anywhere on the page.
* **390 does not raise anything.** The set of rules is the same and the sizes are
  the same: `#slotWhen` 9.46/9.60, `.b8 footer` 10.56, `.borrowed figcaption` 10.88,
  `.signs .srole`/`.sclose` 11.03, `.padbar`/`.bench` family 11.14-11.20,
  `.kicker`/`.plate figcaption` 11.52, `.schoolrec` 11.84. 153 pairs at 390 vs 170
  at 1440 — the difference is fewer *distinct* SVG label selectors in the tight
  figure editions, not larger type. (Earlier draft said `.prov.mono` moves up at
  390 because of `body{font-size:1.03rem}` at src:1217 — **wrong**: `.prov.mono`
  measures 12.48 px at *both* widths, and every rule here is rem-based off `:root`,
  which the `body` declaration cannot change.)

**Load-bearing prose under 12 px** (i.e. not apparatus): the colophon (10.56),
all seven epigraph attributions (10.88), both co-signer roles and the co-signers'
closing line (11.03), "answers for every claim on this page" (11.09), the two
`.bfoot` provenance sentences (11.14), the gate's two `p.mono` sentences and
`#gateNote` (11.20), every `fig. NN —` caption and every `¶ NN ·` kicker (11.52),
and the `.schoolrec` education rows (11.84).

**There is no gate on this.** `grep -rn '11px\|>= 11\|MIN_PX\|fontSize' scripts/qa/*.mjs tests/playwright/*.ts`
returns nothing. The only floor in the repo is `FLOOR_PX = 10` in
`check-figures.mjs:540`, and it is arithmetic (`authored px × seat ÷ viewBox`)
over the six wide SVG editions only — it never reads a DOM font size. The
"≥11px floor" in `src/run/index.html:3238` is a **comment about canvas text**,
bound to nothing.

Shots (element clips): `shots/d5-slotwhen-1440.png`, `shots/d5-slotwhen-390.png`
(the 9.46 px "12:00" inside the week grid), `shots/d5-borrowed-figcaption-1440.png`,
`shots/d5-borrowed-figcaption-390.png` (the 10.88 px epigraph credit).

## 6 · Values breaking from their units — CONFIRMED

Per-character Ranges grouped by rendered `top`, then every line boundary inspected.
All instances are in **mono** runs; none in serif prose.

**At 1440×900:**

| break | selector | rendered px |
|---|---|---|
| `90 mb ⟶ 23` / `mb` | `#work .prose p.prov.mono > b` | 12.48 |
| `… 96-sample eval — 8` / `classes · 2 misclassified` | `#work .prose p.prov.mono` | 12.48 |
| `… — force, 22` / `policies · owner-scoped checks on…` | `#cadence .prose p.prov.mono` | 12.48 |
| `… owner-scoped checks on 6` / `services · idor suite in ci` | `#cadence .prose p.prov.mono` | 12.48 |
| `… — lidar visual-` / `assistance proposal ·` | `#path .schoolrec .srow span` | 11.84 |
| `… ⟶ e5 embeddings ⟶ fine-` / `tuned setfit` | `#work .prose p.prov.mono` | 12.48 |
| `… row-level security — a non-` / `bypassrls role` | `#work .prose p.prov.mono` | 12.48 |
| `langgraph + 44 tools · 12` / `over mcp · gated ×7` | `#manifest li span.m` | 11.20 |

**At 390×844:**

| break | selector | rendered px |
|---|---|---|
| `… — 5 yrs · 1,153` / `users · 66 dashboards ⟶` | `#path .prose p.prov.mono` | 12.48 |
| `… 96-sample eval — 8` / `classes · 2 misclassified` | `#work .prose p.prov.mono` | 12.48 |
| `… — force, 22` / `policies · owner-scoped checks on…` | `#cadence .prose p.prov.mono` | 12.48 |
| `… owner-scoped checks on 6` / `services · idor suite in ci` | `#cadence .prose p.prov.mono` | 12.48 |
| **`… scalar — 4.26` / `gb/s — bit-identical to …`** | `#jetpack-compress .prose p.prov.mono` | 12.48 |
| `java.util.zip · 1` / `thread` | `#jetpack-compress .bench.jet .brow span` | 11.20 |
| `… — lidar visual-` / `assistance proposal ·` | `#path .schoolrec .srow span` | 11.84 |
| `… ⟶ e5 embeddings ⟶ fine-` / `tuned setfit` | `#work .prose p.prov.mono` | 12.48 |
| `… row-level security — a non-` / `bypassrls role` | `#work .prose p.prov.mono` | 12.48 |
| `The Mythical Man-` / `Month` | `#lifequest .borrowed figcaption > i` | 10.88 |

Two `422 / vs 66 mb/s` rows from an earlier draft are dropped: "vs" is not a unit,
so that break is ordinary word wrapping, not a value parting from its unit.

Cause, three separate ones:

1. **`&#8202;` (U+200A hair space) is a breaking space.** Confirmed by grep — all
   eight uses in `src/run/index.html` are at lines 1653, 1810, 1872, 1932, 1933,
   1980, 1981, 1982, and every one but the masthead's `Ayush&#8202;·&#8202;Yadav`
   (1653) sits exactly where a number meets its unit. The brief's headline instance
   is **src/run/index.html:1810**:
   `int8 onnx via transformers.js — <b>90&#8202;mb ⟶ 23&#8202;mb</b>`
   — and that is the measured 1440 break. Others in the same class:
   `45.9&#8202;KB`, `310.6&#8202;KB` (1872), `66&#8202;mb/s` (1932, 1981),
   `4.26&#8202;gb/s`, `14.06&#8202;gb/s` (1933), `1&#8202;gib` (1980),
   `422&#8202;mb/s` (1982). U+200A carries no `white-space: nowrap`, so every one
   of them is a legal line-break opportunity.
2. **No `white-space` or `text-wrap` protection on `.prov`** — `.prose .prov`
   (src:358) sets only `margin-top`, `line-height` and `max-width:46ch`. Numbers and
   units are ordinary breaking-space-separated words everywhere else.
3. **Hyphens in compound identifiers break at the hyphen** by default:
   `visual-assistance`, `fine-tuned`, `non-bypassrls`, `Man-Month`. No
   `hyphens`/`overflow-wrap` declaration guards them.

Shots (element clips of `#work .prose p.prov.mono`, the node carrying
`90 mb ⟶ 23 mb`, `fine-tuned setfit` and `a non-bypassrls role`):
`shots/d6-prov-1440.png`, `shots/d6-prov-390.png`.

## 7 · Hover-only captions — CONFIRMED; fig. 05's invitation survives on touch

Measured at 390×844 with `isMobile + hasTouch`, in **both Chromium and WebKit**.
Both report `matchMedia('(hover: none)').matches === true` and
`(pointer: coarse) === true`.

| figure | invitation markup | `(hover:none)` computed display | visible on touch? |
|---|---|---|---|
| **fig. 04** | `<span class="hoverinv"> — hover a desk to see what it settled</span>` (src:1816) | `display: none` | **no** — correctly hidden |
| **fig. 05** | plain `<i>hover a chip to see its words.</i>` — **no `.hoverinv` wrapper** (src:1855) | n/a | **YES — it stays** |
| **fig. 07** | `<span class="hoverinv"> — hover a lane to see which blocks it wrote</span>` (src:1985) | `display: none` | **no** — correctly hidden |

The rule is `@media (hover:none){ .hoverinv{display:none} }` at
**src/run/index.html:468**, commented "no dead invitations on touch". fig. 05's
invitation was never given the class, so on every touch device the caption reads
"fig. 05 — the parse: the sentence resolves into the schedule as you scroll.
**hover a chip to see its words.**"

The tap measurements below complicate it: fig. 05's reveal is the one that **does**
fire on touch, so the caption is not a dead invitation — it is a live one wearing
the wrong verb. figs. 04 and 07 are correctly hidden, because their reveals really
do not work on touch.

**Do taps reach the revealed information?** Mostly no — one of three.

Two earlier instruments were wrong and are discarded: `document.body.innerText.length`
(these reveals change classes and SVG fills, not text), and the tapped label's own
computed `fill` (that is just sticky `:hover` styling on the thing you touched, not
the reveal). The reveal is `traceOn()` at **src/run/index.html:3340-3350**, used by
fig. 04 and by fig. 07 (`traceOn(s, jlabs, jet.blocks, "lane")` at :4097): a
`pointerenter` adds **`.tracing`** to the svg and **`.hot`** to the matching cargo.
fig. 05's is `$(id).addEventListener("mouseenter", …)` at **:3911**, which sets
**`#cadFig[data-hl]`**, lighting `.w-when` via :475-477.

**Positive control first — a real `page.hover()` at 1440×900** (`verify4.json`),
so a null result at 390 means something:

| figure | state | before hover | after hover |
|---|---|---|---|
| fig. 04 | `#appliedFig.tracing` / `.hot` count | false / 0 | **true / 4** ✓ |
| fig. 07 | `#jetFig.tracing` / `.hot` count | false / 0 | **true / 2** ✓ (and `.jlab` fill → `--ink`) |
| fig. 05 | `#cadFig[data-hl]` / `.w-when` background | null / `rgba(0,0,0,0)` | null / `rgba(0,0,0,0)` — **control inconclusive** |

**Then the same states after a tap at 390×844, `hasTouch`:**

| figure | before tap | after tap | reveal fires? |
|---|---|---|---|
| **fig. 04** | `tracing:false`, `hot:0` | `tracing:false`, `hot:0`, `.desklab` fill unchanged | **no** |
| **fig. 07** | `tracing:false`, `hot:0`, `.jlab` fill `rgb(92,86,74)` | `tracing:false`, `hot:0`, **`.jlab` fill `rgb(38,35,28)`** | **no** — the cargo is not traced; only the tapped label inks |
| **fig. 05** | `data-hl: null`, `.w-when` bg `rgba(0,0,0,0)` | **`data-hl: "when"`**, **`.w-when` bg `rgba(196,83,46,0.16)`** | **YES** |

So, corrected:

* **fig. 04 and fig. 07 hide their invitations and their reveals genuinely do not
  work on touch.** The rule at :468 is doing its job for both. (An earlier draft
  claimed fig. 07's reveal fired on tap; it does not — `.tracing` stays false and
  no block is traced. What a tap leaves behind is one inked label from sticky
  `:hover`, which is a cosmetic artifact carrying no information and with no way to
  clear it, since `pointerleave` never fires from a tap.)
* **fig. 05 keeps its invitation *and* its reveal works on touch.** It is therefore
  not a dead invitation — it is a **mislabelled live one**: the effect happens, but
  the caption tells the reader to "hover", a verb no touch reader has. It is the
  only one of the three whose text and behaviour agree in substance and disagree
  in wording.
* The desktop control for fig. 05 came back null at the scroll position used
  (`.chip` is `position:absolute` and is animated into its dock by the cadence
  scrub, so the hover may have landed after the mark moved). The **tap** result at
  390 is unambiguous and is what the finding rests on; the desktop path is
  **UNMEASURED**.

**Engine caveat:** the fig. 05 tap reveal fires through Chromium's synthetic
mouse-after-tap. Real iOS Safari and Android Chrome behave the same way for a first
tap on hover-wired elements, but this was **not** verified on a device and WebKit's
tap behaviour was not measured (only its media queries were).

**Does the keyboard reach any of it?** No, at any width.
`document.querySelectorAll('#appliedFig [tabindex], #jetFig [tabindex], .chip[tabindex], #appliedFig button, #jetFig button')`
returns **0**; `.chip` and `text.desklab` all report `tabindex === null`. The
states are `:hover` CSS plus `pointerenter`/`mouseenter` listeners with no
`:focus-visible` companion and no focusable host. **All three figures' revealed
information is unreachable by keyboard, and two of the three are unreachable by
touch as well — the information exists only for a mouse.**

Shots: `shots/d7-ctrl-1440-fig04-hover.png`, `shots/d7-ctrl-1440-fig07-hover.png`
(the positive controls), `shots/d7-390-fig04-tapped.png`,
`shots/d7-390-fig07-tapped.png`, `shots/d7-390-fig05-tapped.png`.

## 8 · `#mtoggle`, the manifest toggle — all three claims CONFIRMED

### (a) Desktop `pointer-events: none`

The rule is **src/run/index.html:1248-1250**:

```css
@media (min-width:821px){
  #mtoggle{pointer-events:none}
}
```

Measured at 1440×900: `getComputedStyle(#mtoggle).pointerEvents === "none"`.
`document.elementFromPoint()` at the button's own centre returns its parent
`span.n`, not the button. A real `page.mouse.click()` at that point is a **no-op** —
after it, `aria-expanded` is still `"false"` and `#manifest.classList` is still
empty. A `.click()` dispatched on the element (which is what Enter/Space on a
focused button does) **does** work: `aria-expanded` → `"true"`, `#manifest` gains
`.open`, and the box grows from the 216×48 pill to 262×301.

### (b) `aria-expanded` out of sync

`aria-expanded="false"` is authored on the button (src:1659) and is only ever
written by the click handler at **src/run/index.html:4766-4769**:

```js
$("mtoggle").addEventListener("click", () => {
  const open = $("manifest").classList.toggle("open");
  $("mtoggle").setAttribute("aria-expanded", String(open));
});
```

Three independent desyncs, all measured:

1. **The button is in the tab order on desktop.** `tabwalk.json`: the 44-stop Tab
   walk at 1440 hits `BUTTON#mtoggle` at effective opacity 1. `pointer-events:none`
   does not remove focusability. So the *only* way to toggle the aside on desktop
   is the keyboard, and the visual state the mouse reader sees is never the state
   `aria-expanded` reports for them.
2. **`.open` is not what controls the visual state above 820 px.** The visible
   fold/unfold is `.compact`, written every frame by the engine
   (src:4990-4991) from `beat` and `bp`. `aria-expanded` never tracks `.compact`.
   **Counted over the 31 sweep frames at 1440×900**: `compact` (the pill —
   collapsed) on **18** frames, no class (the full open ledger — expanded) on
   **12**, `landed` on **1** — and the set of `aria-expanded` values observed
   across all 31 is exactly `["false"]`. So the attribute is **right by accident on
   the 18 pill frames and wrong on the 12 where the ledger is fully open**: a
   screen-reader user is told "collapsed" while six manifest rows and a footer are
   on screen. At 390×844 over 46 frames the aside is the base pill on 43 and
   `landed` on 3, so `"false"` is correct there until the reader taps.
3. **`.landed` and `.filed`** (src:261, 880, applied at 4985-4988) set the aside to
   `opacity:0; pointer-events:none` at ¶12 and ¶13 — the instrument is withdrawn
   while `aria-expanded` still says `"false"`, i.e. "collapsed", not "gone".

### (c) On the phone: an 18 px target, 27.5 % coverage, hard to close

Measured at 390×844, `isMobile + hasTouch`:

| | measured |
|---|---|
| toggle rect, closed | `[181, 803, 135, 18]` — **18.0 px tall** (WCAG 2.5.8 minimum is 24×24; Apple/Material ask 44/48) |
| toggle font-size | 11.2 px |
| aside rect, closed | `[168, 794, 208, 36]` |
| aside rect, open | `[76, 529, 300, 301]` |
| **share of viewport when open** | **27.5 %** (300×301 of 390×844) |
| same, computed at 320×640 | `width:min(78vw,300px)` = 250 px → 250×301 = **36.7 %** |

The brief's "34 %" is between the two; at 390×844 the measured figure is 27.5 %.

Closing it:

* **Tapping outside does nothing** — after a tap at (30, 300), `#manifest` still has
  `.open` and `aria-expanded` is still `"true"`. Grep run:
  `grep -n 'Escape\|keydown' src/run/index.html` returns four lines — 32 (`acts`,
  the arrival-dismiss listener), 5443, 5452, 5463 — all of them `eatKeys`, the
  carry's scroll lock, and 5443 is the line that lets `Escape` **through**
  untouched. There is no `Escape` handler and no outside-click handler for the
  manifest anywhere in the file.
* **The toggle moves when it opens** — from `[181,803]` to `[92,542]`, i.e. 261 px up
  and 89 px left. A reader who taps where they just tapped hits the ledger, not the
  control.
* A second tap on the toggle *at its new position* does close it
  (`open:false, aria:"false"`).
* While open it covers 27.5 % of the screen including the ¶01 epigraph (listed in §1).

Rules: `#manifest{…; right:14px; bottom:14px}` and `#manifest.open{width:min(78vw,300px)}`
at **src/run/index.html:1226-1232**; `#mtoggle{background:none; border:none; font:inherit; padding:0}`
at **:300** (no padding, so the target is exactly the text's line box);
`#mtoggle{cursor:pointer}` at **:1232**.

Shots: `shots/d8-phone-closed.png`, `shots/d8-phone-open.png`, `shots/d8-desktop-after-domclick.png`.

## 9 · The contact block is gated behind "approve run 042" — CONFIRMED

Measured at 1440×900, unapproved, scrolled to `document.documentElement.scrollHeight`:

| | measured |
|---|---|
| `document.documentElement.scrollHeight` | **14377** |
| max scroll (`scrollHeight − innerHeight`) | 13477 — reached |
| `#mail` page-Y (`rect.top + scrollY`) | **14961** — **584 px below the document end** |
| `#mail` effective opacity | **0** |
| `#mail` own `getComputedStyle().opacity` | `"1"` (the 0 comes from the ancestor) |
| `#nextmorning.offsetHeight` | **0**; `getComputedStyle().height` = `"0px"` |
| `mailto:` links on the home page | **1**, and it is this one |

After clicking `#approve` and waiting out the carry: `scrollHeight` → **17077**,
`body.approved` and `body.atmorning` true, `#mail` effective opacity **1** at page-Y
16749.

**The gate is three rules, all in `src/run/index.html`:**

```css
.bdawn{height:0; min-height:0; padding:0; overflow:hidden}          /* :870 */
body.approved .bdawn{height:auto; min-height:300vh; overflow:visible} /* :871 */
.dawnwrap > *{opacity:0; transform:translateY(12px)}                /* :881 */
body.atmorning .dawnwrap > *{opacity:1; transform:none}             /* :883 */
```

`body.approved` is added by the `#approve` click handler at **:5363**;
`body.atmorning` by the engine at **:4999**, `beat >= RUN_BEATS && bp > 0.16`.
So the address requires *both* a press and then scrolling a further 0.16 of a 300 vh
section.

**Tab focus lands on the invisible contact links — CONFIRMED.** A 70-press Tab walk
at 1440 with a 260 ms settle per press (`tabwalk.mjs`) produced **44 stops, of which
exactly 4** are at effective opacity 0 **and** clipped by a zero-height ancestor:

| stop | href | effective opacity | clipped | in view |
|---|---|---|---|---|
| `aesh.03.23@gmail.com` | `mailto:aesh.03.23@gmail.com` | 0 | yes | no (vpY 891, scrollY already at max 13477) |
| `github ↗` | `https://github.com/yadava5` | 0 | yes | no |
| `linkedin ↗` | `https://www.linkedin.com/in/ayush-yadav-developer` | 0 | yes | no |
| `the working paper ⟶` | `https://ayush-yadav.com/` | 0 | yes | no |

The browser cannot scroll them into view (the page is already at maximum scroll and
they are 584 px past it), so a keyboard reader tabs off the end of the page into four
focus stops that render nothing.

**Reduced motion is worse: the gate never opens.** This was re-tested after a first
pass whose only "scroll" was a no-op, so the claim now rests on **real wheel
events**. In a `reducedMotion:'reduce'` context at 1440×900, after clicking
`#approve`:

| state | scrollY | maxScroll | docH | `#nextmorning.offsetHeight` | `__world.beat` / `beatP` | `body.approved` | `body.atmorning` | `#mail` eff. opacity |
|---|---|---|---|---|---|---|---|---|
| just after approving | 16177 | 16177 | 17077 | 2700 | 0 / 0 | true | **false** | **0** |
| after 6 × `mouse.wheel(0, −300)` | **14377** | 16177 | 17077 | 2700 | 0 / 0 | true | **false** | **0** |
| after 14 × `mouse.wheel(0, +400)` | 16177 | 16177 | 17077 | 2700 | 0 / 0 | true | **false** | **0** |
| after `End` | 16177 | 16177 | 17077 | 2700 | 0 / 0 | true | **false** | **0** |

The page genuinely scrolled (14377 ← 16177 ← 14377) and ¶13 genuinely exists
(2700 px tall). `body.atmorning` is never added, and `#mail` never becomes visible.

**The cause is not "bp never exceeds 0.16".** `window.__world.beat` and `beatP` are
frozen at **0** at every reading — the world object is never written at all after
load. The reason is one line: **`function wake(force) { if (RM) return; }` at
src/run/index.html:5038-5039.** In reduced motion the rAF loop never starts, so
`frame()` — the only writer of `body.atmorning` (**src:4999**) — never runs at all.
What runs instead is `settleAll()` (defined at **:5708**), called at boot from
**:5739** and again from the debounced **resize** handler at **:5076**; neither
path touches `atmorning`. The approve handler's own branch confirms the design:
`if (RM) drawThread(...); else wake(true);` (**:5373**). So no amount of scrolling
can reveal ¶13 under reduced motion — only a window resize would re-run anything,
and that does not set the class either.

Measured `.dawnwrap` child opacities in RM after approval: kicker 0, **hourline
0.9**, endquote 0, dawnsay 0, **dawnrow (the contact row) 0**, **dawnrun 0.55**.
The two non-zero values are **authored constants, not partial transitions** —
`.hourline{…; opacity:.9}` at **src:1620** and `.dawnrun{…; opacity:.55}` at
**src:973**, both later in source order than `.dawnwrap > *{opacity:0}` at **:881**
and at equal specificity (0,1,0), so they win outright. (An earlier draft called
them transition leakage; under RM the `@media (prefers-reduced-motion: no-preference)`
transition block at :884 does not apply at all, so there is nothing to leak.)

**In reduced motion there is no way to see the email address on the home page.**
The four links remain in the Tab order, at opacity 0 and clipped — the RM tab walk
found exactly the same four stops as the normal one.

Shots: `shots/d9-normal-bottom-unapproved.png`, `shots/d9-normal-bottom-approved.png`,
`shots/d9-rm-bottom-approved.png`.

## 10 · The Glyph pad does not centre the digit — CONFIRMED

**The preprocessing is `extractPixels()`, src/run/index.html:5245-5258:**

```js
function extractPixels() {
  const oc = off.getContext("2d");
  oc.fillStyle = "#000"; oc.fillRect(0, 0, PAD, PAD);
  oc.strokeStyle = oc.fillStyle = "#fff";
  oc.lineWidth = BRUSH; oc.lineCap = oc.lineJoin = "round";
  for (const st of strokes) tracePath(oc, st, 1);
  const sc = small.getContext("2d");
  sc.drawImage(off, 0, 0, GRID, GRID);
  const { data } = sc.getImageData(0, 0, GRID, GRID);
  …
}
```

`PAD = 280, BRUSH = 22, GRID = 28` (src:5217). The strokes are rasterised at their
**raw pad coordinates** into a 280×280 buffer and the whole buffer is scaled to
28×28. There is **no bounding-box crop, no centre-of-mass shift, no size
normalisation, and no 20×20-into-28×28 step** — i.e. none of the three things MNIST
itself specifies. `grep -n 'centroid\|center of mass\|bbox\|normalis'` over the file
finds nothing in this path.

**Measured at 1440×900**, pad at effective opacity 1, `#glyphStatus` = `awake · local`,
each trial drawn with `page.mouse` in pad coordinates and read from
`window.__demo.last`:

| trial | stroke (pad coords) | read | confidence |
|---|---|---|---|
| positive control — large centred `1` | (140,40) → (140,240) | **1** | 98.7 % |
| positive control — large centred `1` with flag | (110,70) → (140,40) → (140,240) | **1** | 69.9 % |
| **small `1`, top-left** | (62,38) → (62,110) | **7** | **99.8 %** |
| **the same small `1`, centred** | (140,105) → (140,177) | **1** | 98.2 % |
| **small `1`, bottom-right** | (218,170) → (218,242) | **2** | 86.4 % |

The third and fourth rows are the same 72-unit vertical stroke, differing only in
position. Moving it changes the answer from `1` @98.2 % to `7` @99.8 %. The network
is not wrong; the page feeds it an un-normalised image and prints the result as
"read '7' in this tab · 99.8%" on `#liveSampleM` (src:5283) — a confidently wrong
public claim, produced by a reader doing exactly what the hint asks
("draw a digit 0–9").

Shots: `shots/d10-control-centred-1.png`, `shots/d10-offcentre-small-1.png`,
`shots/d10-small-centred-1.png`, `shots/d10-offcentre-br-small-1.png`.

## 11 · Mobile crop of the Glyph readout — **REFUTED as stated**

Measured twice: idle, and again **after a real classification**, because the
readout (verdict digit, `conf` %, `fwd` µs, the lit bars and `#liveSampleM`) only
fills once the net has run. Both engines, 390×844, `hasTouch`:

**Idle** (`padcrop.json → m390`): `#net` `x 51.6, w 312.8, right 364.4`,
`viewBox="0 0 240 310"` (the tight edition); `#netwrap` identical,
`overflow: visible/visible`; parent `<figure>` `x 34.8, w 346.5, right 381.3`.
`softmax ×10` at `x 62 … 165.8`; the ten digit labels at `x 65.8 … 330`. All
`#net` labels render at **14.34 px**.

**After drawing a digit** (`verify3.json`) — classification proven to have run
(`window.__demo.last` populated, `#liveSample` un-hidden):

| | Chromium 390 | WebKit 390 |
|---|---|---|
| classification | `{prediction:1, confidence:0.841, ms:6.4}` | `{prediction:1, confidence:0.811, ms:7.0}` |
| `#verdict` / `#conf` / `#fwd` | `1` / `84.1%` / `6.4 ms` | `1` / `81.1%` / `7.0 ms` |
| `#liveSampleM` | `read "1" in this tab · 84.1% · 6.4 ms` | `read "1" in this tab · 81.1% · 7.0 ms` |
| `<figure>` right edge | 382.9 | 383.3 |
| `#netwrap` / `#net` / `.verdictline` right | 366.1 | 366.4 |
| `#liveSample` right | 351.4 | 351.4 |
| `.padcard` right | 358.3 | 358.5 |
| **text runs past the figure or the viewport** | **0** | **0** |
| **SVG `<text>` past the figure** | **0** | **0** |
| `scrollWidth − innerWidth` | **0** | **0** |

Nothing is clipped or cropped, filled or idle, in either engine, because
`chooseEditions()` swaps `#net` to the 240-unit tight edition at this width and
re-anchors the label from `x:356, text-anchor:end` (src:5131) to `x:8`
left-anchored (src:5157).

Whole-page horizontal overflow at every tested width: 0 runs past the viewport edge
at 1440, 1280, 1024, 768 and 390. **One at 320** — see §12.

What *is* wrong at this spot, and may be the thing that was reported: the
fixed manifest pill sits at `[168, 794, 208, 36]` and **lands on the figure**,
covering `hidden ×100` and the area above `softmax ×10`
(`shots/d11-390-netwrap.png`, `shots/d11-390-chromium-readout.png`). That is
defect 1, not a crop.

Shots: `shots/d11-390-glyph.png`, `shots/d11-390-netwrap.png`,
`shots/d11-390-chromium-classified.png`, `shots/d11-390-webkit-classified.png`.

## 12 · Other defects found

1. **`#clear` overflows the viewport at 320.** The only horizontal overflow measured
   anywhere: `#clear` ("clear", the pad's reset control) renders at
   `left 289 … right 326` in a 320 px viewport — 6 px of the target is off-screen.
   `document.scrollWidth` does not grow, so the page has no scrollbar and the button
   is simply clipped. `.padbar{display:flex; justify-content:space-between}` (src:552)
   inside `.padcard{width:min(300px,86vw)}` (src:1223).
2. **The replay button carries `hidden` forever.** `[data-np-replay]` is authored
   `hidden` (src:1713) and nothing removes it (src:5826-5891). It is visible only
   because `html[data-np-ready] .np-replay{display:inline-block}` (src:1436)
   out-specifies the UA `[hidden]` rule. **Corrected from an earlier draft:**
   Chromium *does* expose it to the accessibility tree —
   `getByRole('button', {name:/watch it again/})` returns 1 at t = 11 s and it is
   one of the page's five named buttons — because the role engine resolves computed
   display, not the attribute. The defect is narrower than "screen readers cannot
   see it": `el.hidden === true` permanently, so any tool, test or future style
   that consults the attribute rather than the cascade will be wrong about it, and
   the control disappears entirely if that one CSS rule is ever touched. A one-line
   `replay.hidden = false` in the `finally` block would make attribute and cascade
   agree.
3. **Reduced motion loses the contact block entirely** — see §9. This is the most
   severe single finding in this inventory: a reader with
   `prefers-reduced-motion: reduce` can press the gate and still never see an email
   address on the home page.
4. **No `Escape` and no outside-tap closes the phone manifest** — see §8(c).
5. **No `:focus-visible` counterpart to any of the three figure hovers** — see §7.
   fig. 04, fig. 05 and fig. 07 each hide information behind `:hover` /
   `pointerenter` / `mouseenter` with no keyboard path and no `tabindex` on any
   mark (measured: 0 focusable elements inside `#appliedFig` and `#jetFig`).
   And nothing un-does a touch reveal: `mouseleave` never fires from a tap, so
   `#cadFig[data-hl="when"]` and `vt-0`'s ink persist with no visible way back.
6. **`#slotWhen` renders at 9.46 px** — the smallest text on the page, and it is the
   single machine value fig. 05's whole parse animation resolves to ("12:00"). It is
   beneath even `check-figures.mjs`'s `FLOOR_PX = 10`, which does not look at it.
7. **The nameplate takes 4.38 s cold / 4.16 s warm**, ~1.2-1.3 s of which is the
   mount gate (`load` → `fonts.ready` → 2 rAF) rather than the performance the
   source budgets at 2.64-3.2 s.
8. **`#clear` is a control at 11.2 px with no padding** (`.padbar button` src:529,
   `#mtoggle` src:300 likewise). Combined with item 1 it is a sub-24 px target
   that is also partly off-screen at 320.

---

# PART 2 — text and typography census

Measured in the browser at **1440×900**, visible text only: a run counts if its
effective opacity reached ≥ 0.5 at some sweep step, it produced a non-empty Range
rect in the viewport, and it was not clipped by a zero-height `overflow:hidden`
ancestor. Deduplicated by (section, selector, text). 626 distinct visible runs.

Font buckets are taken from `getComputedStyle().fontFamily`:
`--display: "Fraunces"` (src:135), `--body: "Newsreader"` (src:136),
`--mono: "Fragment Mono"` (src:137).

## Per station

| station | serif display | serif body | mono | total | % mono | of which figcaption | runs |
|---|---|---|---|---|---|---|---|
| ¶01 `#start` | 37 | 0 | 28 | 65 | 43 % | 11 | 21 |
| ¶02 `#who` | 23 | 54 | 82 | 159 | 52 % | 14 | 25 |
| ¶03 `#path` | 30 | 20 | 303 | 353 | **86 %** | 28 | 71 |
| ¶04 `#work` | 22 | 17 | 187 | 226 | 83 % | 34 | 46 |
| ¶05 `#cadence` | 20 | 26 | 121 | 167 | 72 % | 21 | 41 |
| ¶06 `#glyph` | 43 | 36 | 213 | 292 | 73 % | 31 | 58 |
| ¶07 `#jetpack-compress` | 20 | 17 | 261 | 298 | **88 %** | 51 | 49 |
| ¶08 `#lifequest` | 26 | 49 | 185 | 260 | 71 % | 51 | 53 |
| ¶09 `#automl` | 46 | 34 | 293 | 373 | 79 % | 52 | 68 |
| ¶10 `#review` | 49 | 36 | 166 | 251 | 66 % | 47 | 36 |
| ¶11 `#cosigners` | 87 | 25 | 134 | 246 | 54 % | 57 | 26 |
| ¶12 `#gate` | 28 | 5 | 190 | 223 | **85 %** | 0 | 44 |
| ¶13 `#nextmorning` | — | — | — | **0** | — | — | 0 |

¶13 measures zero because `.bdawn{height:0}` until approval. Measured separately
**after** approving and waiting out the carry (`mailgate.json → dawnText`): 78 visible
words — kicker 8 (11.52 px mono), hourline 11 (15.12 px Fraunces), endquote 29
(18 px Newsreader), dawnsay 9 (17.92 px Newsreader), **dawnrow 9 (11.52 px mono)**,
dawnrun 6 (10.24 px mono). So ¶13 is **29 % mono**, and the whole-page totals below
exclude it.

Chrome, counted separately because it is fixed furniture, not station content:
`#mast` 59 words (56 mono, 95 %); `#manifest` 103 words (103 mono, **100 %**).

## Whole page

| | |
|---|---|
| total visible words, 13 stations (¶13 unapproved = 0) | **2913** |
| serif display (Fraunces) | 431 (14.8 %) |
| serif body (Newsreader) | 319 (11.0 %) |
| **mono (Fragment Mono)** | **2163 — 74.3 %** |
| other faces | 0 |
| + fixed chrome | 162 more words, 159 of them mono |
| distinct mono *selector paths* | **219** |
| distinct mono *CSS hooks* (nearest classed/id ancestor + tag) | **115** |
| `font-family:var(--mono)` declarations in `src/run/index.html` | **36** |

(An earlier draft said 71 hooks. That count keyed on the **last** path segment, so
bare tags — `span`, `text`, `i`, `a`, `b` — pooled unrelated runs from different
sections into one row: `.span` mixed `#path .schoolrec .srow span` with
`#cosigners figure.cosign span`, and `.i` mixed the plate-figcaption italics with
the epigraph titles. Re-bucketed on the nearest ancestor carrying a class or id,
the count is **115** and the role split below changes materially.)

Counted separately because they are not read as running text:

* **figcaptions — 19 elements, 403 words.** They *are* visible (all 19 render), so
  they are also inside the 2913 above; the "of which figcaption" column isolates
  them. 8 of the 19 are epigraph credits under `.borrowed figcaption` (10.88 px);
  11 are `fig. NN —` plate captions (11.52 px). Longest: fig. 07 at 50 words.
* **`aria-label` — 11 elements, 737 words, none of them visible.** Five are long
  figure descriptions: `#appliedFig` 153, `#jetFig` 156, `#questFig` 154,
  `#amlFig` 121, `#pathFig` 109. Plus `#net` 20, `#pad` 9, `#manifest` 2,
  `h1.nameplate` 2 ("Ayush Yadav"), and two bench labels. **737 words of prose exist
  only for screen readers — 25 % as much text again as the whole visible page.**
* **epigraphs / quotes — 10 blocks, 202 words** (¶13's counted twice by the
  selector union; 9 distinct blocks, 183 words): Machado 9, Hamming 8, Knuth 24,
  Brooks 8, Lovelace 22, Feynman 19, Vollen 44, Chaturvedi 20, Eliot 29.

## Every mono CSS hook, by visible word count

Bucketed on the **nearest ancestor carrying a class or id**, plus the bare tag
where the text sits on one. Every CSS line below was read, not inferred.
Role key: **MV** machine value · **L** label · **P** prose · **C** caption ·
**N** navigation/control.

| words | px | hook | CSS (src/run/index.html) | role | sample |
|---|---|---|---|---|---|
| 373 | 12.48 | `p.prov.mono` | `.mono` :184 + `.prose .prov` :358 | MV + **P** | "seven phases mirror the ml lifecycle · a human gate at every one" |
| 149 | 11.52 | `figure.plate>figcaption` | `.plate figcaption` :364 | **C** | "fig. 10 — three real gates set on the line, each stamped…" |
| 96 | 11.20 | `p.mono` | `.mono` :184 | **P** | "one day · twelve stops · six stations proof-cited · one signature missing" |
| 79 | 11.52 | `p.kicker` | `.kicker` :311 | **N** | "¶ 08 · fifth station · the honest hour —" |
| 75 | 11.52 | `p.handoff>a` | `.handoff` :1062 | **N** | "the benchmark ledger @ 2caacd0 ↗" |
| 74 | 11.52 | `figure.plate>i` | `.plate figcaption` :364 (the caption's italic clause) | **C** | "clay marks the trailer, the one part of the member that answers…" |
| 71 | 11.84 | `div.srow>span` | `.schoolrec` :1047-1050, `.schoolrec .srow` :1053 | MV + **P** | "· major gpa" |
| 61 | 11.52 | `span.dep` | `.handoff` :1062, `.handoff .dep` :1063 | **N** | "↳ only the inventory is checked in — the rest are read off…" |
| 57 | 11.20 | `p.bfoot` | `.bench .bfoot` :584 | **P** (provenance) | "measured then, committed — not run in this tab. 3.536× at the median…" |
| 54 | 12.26 | `text.` (unclassed `.figsvg` labels) | `.figsvg text` :375 (`font-size:12px`) | L | "the works" |
| 53 | 12.32 | `#appliedFig>text` | `.figsvg text` :375 | L | "the local cascade" |
| 49 | 12.32 | `#jetFig>text` | `.figsvg text` :375 | L | "the stream" |
| 46 | 12.48 | `p.prov.mono>b` | `.prose .prov b` :359 | MV | "1.6m+" |
| 44 | 11.52 | `span.gm` | `.gatecard .gl` :774, `.gl li .gm` :776-778 | MV | "rules macro-f1 0.9791 · 96-sample gate" |
| 43 | 12.32 | `#pathFig>text` | `.figsvg text` :375 | L | "the freight" |
| 43 | 12.16 | `span.qn` | `.quests .q` :648-650 | L | "mission card — playable" |
| 42 | 11.20 | `span.m` | `#manifest` :259, `#manifest li .m` :290 | MV | "rules macro-f1 0.9791 · 96-sample gate" |
| 41 | 11.52 | `p.rct>a` | `.litany .mline .rct` :1074 | **N** | "305 passed · 0 skipped — Applied's validation ledger ⟶" |
| 39 | 11.20 | `div.shead>span` | `.bench .shead` :576-577 · `.schoolrec .shead` :1049-1050 | L | "the school record — filed with the run" |
| 38 | 12.48 | `li.>span` (ladder rows) | `.ladder` :754 | MV | "06:12 · the start" |
| 33 | 10.88 | `figure.borrowed>i` | `.borrowed figcaption` :1600 | **P** (attribution) | "Numerical Methods for Scientists and Engineers, 1962" |
| 30 | 11.84 | `#mclock` | `#mast` :220 | MV | "06:12" |
| 27 | 10.88 | `figure.borrowed>figcaption` | `.borrowed figcaption` :1600 | **P** (attribution) | "Richard P. Feynman ·" |
| 26 | 11.20 | `p.gleg` | `.gates` :1076-1077, `.gates .gleg` :1158 | **P** | "✓ a human signed for it · — the gate stopped the run…" |
| 25 | 11.20 | `span.srole` | `.signs` :1145, `.signs .srow .srole` :1152 | **P** | "applied AI & data principal, cbts — managed the ITSM work at station 03" |
| 24 | 11.52 | `p.nb` | `.nb` :1022 | **P** | "every station on this line hands its output to a case file" |
| 23 | 11.52 | `figure.plate.bare>figcaption` | `.plate figcaption` :364 | **C** | "fig. 08 — the stair is the ledger, drawn in section…" |
| 22 | 11.84 | `#mphase` | `#mast` :220 | L | "the start" |
| 22 | 15.38 | `#questFig>text` | `.figsvg text` :375 (tight edition rescales) | L | "scale" |
| 21 | 11.20 | `#mcount` | `#manifest` :259 | MV | "0 / 6" |
| 21 | 11.84 | `span.rel` | `.cosign figcaption .rel` :1584 | **P** | "· managed the ITSM work at station 03, as miami's director…" |
| 20 | 12.16 | `p.gclose` | `.gates .gclose` :1159-1161 | **P** | "two of my own gates" |
| 19 | 11.52 | `span.hoverinv` | inherits `.plate figcaption` :364; hidden by :468 | **P** (invitation) | "— hover a desk to see what it settled" |
| 19 | 10.56 | `div.beat-inner>footer` | `.b8 footer` :991-992 | **P** (colophon) | "© 2026 ayush yadav — cincinnati, oh" |
| 18 | 11.52 | `figure.plate.bare>i` | `.plate figcaption` :364 | **C** | "the cut is where the record stops; the climb pauses…" |
| 18 | 11.84 | `figure.cosign>span` | `.cosign figcaption` :1570 | **P** | "· applied AI & data principal, cbts" |
| 17 | 11.84 | `ul.engrows>b` | `.engrows li` :1013, `.engrows li b` :1016 | MV | "cincinnati, oh" |
| 16 | 12.32 | `text.fsm` | `.figsvg text` :375 | L | "returns" |
| 12 | 12.32 | `text.tname` | `.figsvg text` :375, `#amlFig text.tname` :466 | MV | "list_project_files" |
| 12 | 12.32 | `text.phlbl` | `.figsvg text` :375 | L | "1.0 ingest" |
| 12 | 11.20 | `p.sclose` | `.signs .sclose` :1154 | **P** | "three of the twelve stops carry a name that is not mine." |
| 12 | 12.16 | `span.gname` | `.gates .grow .gname` :1084 | L | "cited-source sweep — PolicyBot" |
| 12 | 11.20 | `span.idx` | `#manifest li .idx` :288 | MV | "01" |
| 12 | 11.20 | `p.bfoot>a` | `.bench .bfoot` :584 | **N** | "the raw run record (json) ⟶" |
| 12 | 11.52 | `p.kicker>i` | `.kicker i` :312 | MV | "06:12" |
| 10 | 11.20 | `p.foot` | `#manifest .foot` :299 | **P** | "six projects · each ticks off as you reach it" |

The remaining **69 hooks carry 300 words between them**, ≤10 each, and are listed
in `analysis.json`. The notable ones for the defects above:
`button.np-replay` (4 words, 12.48 px, :1418), `#gzbtn` (6, 11.52),
`#gateNote` (6, 11.20, `.gatecard .note` :790), `span.bval` (6, 11.20, :595),
`div.verdictline>span` (6, 11.20, :554), `#mtoggle` (3, 11.20, :300),
`#approve` (3, 12.48, :784), `#glyphStatus` (3, 11.20, `.padbar` :527),
`#clear` (1, 11.20, `.padbar button` :529), `#conf`/`#fwd` (1 each, 11.20),
`div.gbench.gtail>span` (1, 10.88, "unsigned"), and
**`#slotWhen` (1 word, 9.46-9.60 px, :498-500)** — the smallest text on the page.

**Reading of that table**, over all 2322 mono words (2163 stations + 159 chrome).
Each hook is counted under exactly the role the table's own column gives it;
`p.prov.mono` is broken out separately because the table calls it MV + P and it is
genuinely both (its lines run "6.4× single-threaded java.util.zip — 422 vs 66 mb/s
(3-fork jmh · 99.9% ci)" — a figure and a sentence in one run):

| role | mono words | share of all mono |
|---|---|---|
| **machine value / label** | **832** | **35.8 %** |
| prose (`p.mono`, `p.bfoot`, `p.gleg`, `p.nb`, `p.sclose`, `p.gclose`, `p.foot`, `p.sigrole`, `span.srole`, `span.rel`, the two `figure.borrowed` attribution hooks, `figure.cosign` rows, `div.srow` education rows, the colophon, `span.hoverinv`, `p.cue.mono`, `#gateNote`) | 529 | 22.8 % |
| **`p.prov.mono` — mixed, figure *and* sentence** | 373 | 16.1 % |
| navigation / control (`p.kicker`, `p.handoff`/`span.dep`, the in-mono links, and the five mono `<button>`s) | 324 | 14.0 % |
| caption (`figure.plate` figcaptions and their italic clauses) | 264 | 11.4 % |

Machine values and labels are the largest role, at 35.8 % — and at 43.9 % if
`.prov.mono` is split evenly between its two jobs. Prose is 22.8 % (30.8 % with
half of `.prov`). So the face is doing the job it is for more than anything else,
**but between a quarter and a third of what it sets is running prose, plus another
11 % of figure captions and 14 % of navigation and controls** — over 1100 words,
at 10.6-12.5 px, of text that is nobody's machine value. Eight hooks are
interactive controls rendered in mono at 9.5-12.5 px.


## Dashes in visible text

Em `—` U+2014, en `–` U+2013, and a hyphen used as punctuation (` - `), counted over
visible runs. Identifiers are excluded by construction: a hyphen inside a word
(`jetpack-compress`, `macro-f1`, `-O3`, `ayush-yadav.com`, `fine-tuned`,
`row-level`, `non-bypassrls`) is never a spaced hyphen and is never matched.

| section | em | en | spaced hyphen | visible words | words per em dash |
|---|---|---|---|---|---|
| ¶01 `#start` | 2 | 0 | 0 | 65 | 33 |
| ¶02 `#who` | 4 | 0 | 0 | 159 | 40 |
| ¶03 `#path` | 13 | 1 | 0 | 353 | 27 |
| ¶04 `#work` | 9 | 0 | 0 | 226 | 25 |
| ¶05 `#cadence` | 7 | 0 | 0 | 167 | 24 |
| ¶06 `#glyph` | 11 | 1 | 0 | 292 | 27 |
| ¶07 `#jetpack-compress` | 10 | 1 | 0 | 298 | 30 |
| ¶08 `#lifequest` | **19** | 0 | 0 | 260 | **14** |
| ¶09 `#automl` | 12 | 0 | 0 | 373 | 31 |
| ¶10 `#review` | 12 | 0 | 0 | 251 | 21 |
| ¶11 `#cosigners` | 4 | 0 | 0 | 246 | 62 |
| ¶12 `#gate` | 10 | 0 | 0 | 223 | 22 |
| `#mast` | 2 | 0 | 0 | 59 | — |
| `#manifest` | 1 | 0 | 0 | 103 | — |
| **13 stations total** | **113** | **3** | **0** | **2913** | **25.8** |

Zero spaced hyphens anywhere — the page never uses `-` as punctuation, which is
correct. The en dash appears in exactly **three visible runs**, all of them real
ranges, printed here rather than inferred (an earlier draft cited "11–15px", which
is a CSS *comment*, not visible text):

1. `#path .prose p.prov.mono` — "itsm data integration intern — miami university · jun 2025 **–** may 2026"
2. `#padhint` — "draw a digit 0**–**9"
3. `#jetpack-compress .bench.jet p.bfoot` — "measured then, committed — not run in this tab. 6.4× is the 3-fork jmh result; across both committed runs the ratio spans 6.38**–**6.89× ·"

The em dash is the page's one and only break mark, at one every 26 words; ¶08 runs
it at one every 14.

**Comparison surfaces**, measured the same way at 1440×900
(`archcensus.mjs`, `archdash.mjs`):

| surface | visible words | mono | % mono | display | body | em | en | spaced hyphen | words per em |
|---|---|---|---|---|---|---|---|---|---|
| home `/` (13 stations) | 2913 | 2163 | **74.3 %** | 431 | 319 | 113 | 3 | 0 | 25.8 |
| `/projects/fast-mnist-nn/` | 2628 | 2274 | **86.5 %** | 4 | 350 | 61 | 0 | 0 | 43.1 |
| `/evidence/` | 3486 | 2948 | **84.6 %** | 61 | 477 | 72 | 2 | 0 | 48.4 |

**Per section, `/projects/fast-mnist-nn/`:**

| section | words | mono | em | en | spaced hyphen |
|---|---|---|---|---|---|
| `(root)` (skip-link, slip, folio strap) | 105 | 105 | 6 | 0 | 0 |
| `mast` | 12 | 9 | 0 | 0 | 0 |
| `filehead` | 49 | **0** | 0 | 0 | 0 |
| `problem` | 76 | 50 | 2 | 0 | 0 |
| `project-visual` | 99 | 99 | 4 | 0 | 0 |
| `architecture` | 106 | 75 | 3 | 0 | 0 |
| `decisions` | 73 | 47 | 5 | 0 | 0 |
| `validation` | 598 | 379 | 16 | 0 | 0 |
| **`corrections`** | **1393** | **1393 (100 %)** | 19 | 0 | 0 |
| `artifacts` | 56 | 56 | 2 | 0 | 0 |
| `folio` | 35 | 35 | 3 | 0 | 0 |
| `colophon` | 26 | 26 | 1 | 0 | 0 |

**Per section, `/evidence/`:**

| section | words | mono | em | en | spaced hyphen |
|---|---|---|---|---|---|
| `(root)` — the 14-entry `<dl>` that is the page | 3303 | 2893 | 66 | 2 | 0 |
| `mast` | 10 | 7 | 0 | 0 | 0 |
| `filehead` | 125 | **0** | 3 | 0 | 0 |
| `folio` | 22 | 22 | 2 | 0 | 0 |
| `colophon` | 26 | 26 | 1 | 0 | 0 |

The case file has **four** Fraunces words on the whole page, and its largest section
— `corrections`, 1393 words, **more than half the page** — is 100 % Fragment Mono.
`/evidence` is the same shape: `dd` carries 2576 mono words. On both pages the only
section that is entirely serif is `filehead`. Sub-12 px text on both is uniformly
11.52 px (`scripts/archive/assets/archive.css:189, 195, 203, 227, …`). Em-dash
density is lighter than the home page's on both (1 per 43 and 1 per 48 words).

---

# PART 3 — gate bindings

Read, not run. `--rebaseline` and `--record` write files and `npm run build`
overwrites `out/`, so neither was executed.

## What each gate binds

| gate | file | binds |
|---|---|---|
| **golden hash** | `verify-portfolio.mjs:265-344` | `sha256(out/index.html)` against `portfolio-baseline.json → outIndexSha256`, plus `sha256(src/run/index.html)` against `runSourceSha256`, plus `git ls-tree <commit> -- src/run/index.html` to prove the pinned commit produces the pinned source (`pinnedCommitAgrees`, :225-262). **Any byte** — a comment, a space — trips it. |
| **the run shipped** | `verify-portfolio.mjs:126-184` | `data-beat=` count **exactly 13**; `data-chapter=` count **exactly 0**; presence of `<link rel="canonical"`, `<meta property="og:`, `<meta name="twitter:`, `<script type="application/ld+json"`; absence of `<title>…story candidate`; eight closure files present and over `closureFloorsBytes`; `out/{sitemap.xml,robots.txt,404.html,evidence/index.html}` present. |
| **headline figures ⇄ data layer** | `check-figures.mjs` | ~24 **verbatim regexes over the run's prose**, each paired with a regex over `src/lib/data/*.ts`. Bound literals include `6.4× single-threaded java.util.zip`, `422 vs 66 mb/s`, `adler-32 vectorised 2.8× scalar`, `4.26 gb/s`, `below 0.95 macro-f1`, `305 passed · 0 skipped`, `97.01%`, `1,186 passed · 0 skipped`, `635 fe + 551 be`, `9,701/10,000`, `macro-f1 0.9698`, `parallel dot-256 kernel 3.5× vs -O3`, `parallelism carries all of it; the simd is in both builds`, `96-sample eval — 8 classes · 2 misclassified`, `201 regex rules`, `2,523 tests green on ci — 1,445 backend · 985 frontend · 93 landing`, `2,186 commits`, `4 hand-written simd paths in the dot kernels`, `virtual threads 422 mb/s`, `72 tests, 0 failures`, `71 passed · 0 skipped`. |
| **figure structure & the px floor** | `check-figures.mjs:470-600` | exactly **6** drawings matching `svg.figsvg` or `#net`; each has `role="img"` and an `aria-label` of **≥60 characters**; the ten captions `fig. 02 … fig. 11` exist and **`fig. 01` must not**; and the arithmetic floor `FLOOR_PX = 10` on `authored font-size × declared minimum seat ÷ viewBox width`, read from `.figsvg text{font-size:12px}` (src:375), `#net text{font-size:14.5px}` (src:534) and the `const seats = {…}` literal. **Wide editions only**; the tight editions are built at run time and are explicitly not covered. |
| **beat tables** | `check-beat-tables.mjs` | every beat-indexed engine table (`stx`, `CLOCKS`, `PHASE_NAMES`, `TRAV`, the ladder) must have exactly one entry per `data-beat` section, and the ladder's never-light rule must be derived rather than a literal index. |
| **stations ⇄ the run** | `check-stations.mjs` | every `name`, `kicker`, `clock`, `consignment` and `dossier` string in `src/lib/data/stations.ts` must appear **verbatim** in `src/run/index.html` (with HTML entities decoded, including `&#8202;`); `name` is bound to its **exact beat slot**; `CLOCKS` must be present and parse. A parse that yields a count ≠ the run's section count is a hard failure. |
| **cargo rides the right corridors** | `check-cargo-fixture.mjs` | hooks `fillText` on `#thread` at **1440×900** and records every waybill and the scroll it painted at, then (a) compares to `tests/fixtures/cargo-corridors.json` and (b) asserts corridor `c` carries `STATIONS[c+1].consignment` — the arrival binding. Desktop only by construction (`!stacked`). |
| **nameplate** | `check-nameplate.mjs` | over `out/` served on http: type width travel **< 2 px** across samples at 700/1400/2100/2900 ms; overlay `viewBox/element` scale **within 0.002 of 1**; overlay-to-type vertical offset **`Math.abs(dTop) < 1.5` px** (the "~1.5 ceiling"), asserted at each of those four times and again after a replay click; `window.__npRuns === 1` after 21 s of idle. |
| **nameplate (negative)** | `check-nameplate-negative.mjs` | re-introduces each of the four defects into a **temp copy** of `out/`, verifies the injection landed, and requires `check-nameplate` to go red. Its injection targets are literal CSS/markup: `@keyframes np-settype{0%{…font-variation-settings:"opsz" 144`, `<div class="np-plate" data-nameplate` + its `data-fx` attribute, `class="nameplate" data-np-machines`. |
| **palette ⇄ the light** | `check-palette.mjs` | the `:root` / `:root[data-night]` token blocks and the `WAY`, `DUSK` (12 stops), `DAWN_STOPS` (16) OKLCH arrays, run through **the page's own `oklchToRgb`**, extracted and executed. Asserts: `DAWN_STOPS[0..11]` **is** `DUSK` reversed; text tokens hold **WCAG 4.5:1 and APCA Lc 60** over every field colour; a graphics floor on figure strokes; night `--clay` at the flip stop `DUSK[7]` is **below** Lc 60, which is what binds the `:root[data-night] #mast .state i` override (src:237); a 2.0:1 regression floor on hairlines. **And the grammar rule:** every contrast number written in a comment in `src/run/index.html` or `archive.css` must be spelled `measured: #<fg> on #<bg> — <ratio>:1 / Lc <lc>` and is **recomputed**. |
| **crosswalk** | `check-crosswalk.mjs` | five directions between `out/` and the run: every internal `href` lands on a file; every `#fragment` exists as an id in the target; `proofManifest`'s hrefs likewise; the case file's rejoin link lands on a real station **and quotes that station's consignment verbatim**; every `/#…` link on every generated page resolves. |
| **pinned links** | `check-links.mjs` | HTTP-fetches every `href` matching pinned github tree/blob/commit URLs, and enforces the glyph contract — `↗` iff the link leaves the origin, `⟶` iff it stays. |
| **bench artifacts** | `check-bench-artifacts.mjs` | recomputes each bench figure from `public/proof/*.json` (`jetpack-jmh-rigorous-2caacd0.json`, `-quick-`, `glyph-dot256-{baseline,openmp-native}-001e9b4.json`) — e.g. `422.0 / 66.2 = 6.378 → 6.4×`, and the `6.38–6.89×` span claim in `.bfoot`. |
| **live surfaces** | `check-live-surfaces.mjs` | fetches all six `liveUrl` / `systemCardUrl` hosts; reports ETag + byte length. **Not** in `verify-portfolio`. |
| **browser smoke** | `tests/playwright/run-home.spec.ts` | `h1` matches `/Ayush\s*·?\s*Yadav/`; **13** kickers; `kickers[0] === "¶ 01 · the start — 06:12"`, `kickers[11] === "¶ 12 · the approval gate — 22:41"`, `kickers[12]` minutes `=== 372`; the clock sequence is strictly increasing; ≥6 case-file hrefs matching `/projects/[a-z0-9-]+/`; a `mailto:` anchor with the address; `#gate` count 1; `canvas#thread` and `#gateDock` exist; **no horizontal overflow** at several widths; `#glyphStatus` reads `awake · local`; four bench bars, each `scaleX` within 1e-3 of the recomputed ratio; at several widths the three cadence chips are visible, the week grid still has 7 columns and `#slotWhen` reads `12:00`; and **`#nextmorning.offsetHeight === 0`** until approval — the gate that makes defect 9 a *specified* behaviour. |

### The four bindings the brief names, mapped

| named binding | what actually exists |
|---|---|
| **dusk windows** | `check-palette.mjs:411-455`. Not a geometry measurement — it reads the run's **source** for three declarations: that beat 8 lerps `WAY[5] → WAY[6]`, that beats 9-11 hold `WAY[6]`, and that `<figure class="plate bare" … data-fx-sync="dusk"` is present (the regex at :443). If any of the three is missing the gate fails loudly, because the night contrast numbers below it would otherwise be measured over the wrong ground. It does **not** assert the `duskin` seat, the fx window numbers, or anything about ¶08's height. |
| **cargo paint bands** | **No such binding — `grep -n 'band\|ceil' scripts/qa/check-cargo-fixture.mjs tests/playwright/*.ts` returns nothing** (the only `band` hits in the repo are `check-figures.mjs:536, 572, 585, 593, 595` — the SVG label px band — and two prose uses in `check-palette.mjs:277, 296`). What `check-cargo-fixture.mjs` records is a **corridor index per waybill**, derived at :156-179 from the midpoint of each label's first and last sighting, sampled at `FRACTIONS = [0.12 … 0.68]` **of each corridor's own span** (:138-144) precisely so that pixel geometry is *not* bound. `tests/fixtures/cargo-corridors.json` stores `{label, corridor}` pairs and nothing else. The run's own paint window (`prog > 0.1 && prog < 0.7`, src:3238) is quoted in the gate's header as a constraint to be aware of, not asserted. |
| **the ~1.5 ceiling** | `check-nameplate.mjs:157` and `:194` — `Math.abs(s.dTop) < 1.5`, the overlay-to-type vertical offset in px, asserted at 700/1400/2100/2900 ms on the first run and at +700/+1500/+2300 ms after a replay click. That is the only `1.5` threshold in `scripts/qa/`. |
| **the thread dock** | Bound only by **existence**: `run-home.spec.ts:118` asserts `page.locator("#gateDock")` has count 1, alongside `canvas#thread` count 1. Nothing asserts where the thread terminates, that `gatePageY` lands on the square, or that the `APPROACH` taper reaches zero. `check-beat-tables.mjs` asserts the *length* of `stx`, not its values. |

**Not bound by anything:** any DOM font size (there is no ≥11 px floor in the
repo — see §5); `#manifest`'s position or overlap; `#thread`'s x geometry beyond the
`stx` table's *length*; the nameplate's total duration or its intermediate strings
(only width travel, overlay scale, `dTop` and the run count); `pointer-events` on
`#mtoggle`; `aria-expanded`; tab order; the pad's preprocessing; `hover:none`
coverage of the three invitations; the em-dash density; the mono/serif ratio;
`font-family` on anything.

**`run-home.spec.ts`'s overflow widths are `HOME_WIDTHS = [390, 768, 1440]`
(:31, used at :121).** 320 is **not** among them — which is exactly why the
`#clear` overflow in §12.1 ships. And note the gate asserts
`scrollWidth − clientWidth ≤ 0`, which the 320 case would pass anyway: `#clear`
is clipped rather than scrolled, so the document never widens. Catching it needs a
per-element rect check, which no gate performs.

## What `portfolio-baseline.json` pins

| field | value | what it does |
|---|---|---|
| `outIndexSha256` | `b6ea15df…24b6b2` | the golden hash of the shipped page |
| `outIndexBytes` | 358096 | informational |
| `runSourceSha256` | `c232e10c…be402` | names **which side moved** on a mismatch |
| `commit` | `96ead6202c341f7e77949b55440e56c484d3e424` | asserted to be a tree that produces `runSourceSha256` |
| `recordedAt` | `2026-08-15T23:50:29Z` | informational |
| `buildEnv` | `{NODE_ENV: production, NEXT_PUBLIC_BASE_PATH: ""}` | **derived from `DEPLOY_ENV` on every re-baseline**, after a version of it sat stale asserting `/Portfolio-2.0` |
| `closureFloorsBytes` | 8 paths + byte floors | the runtime-fetched closure the hash cannot see: `wasm/model.weights.bin` ≥300 000, `fast_mnist.js` ≥40 000, `fast_mnist.wasm` ≥40 000, the four `woff2` faces, `resume.pdf` ≥50 000 |

Verified live: the pinned `outIndexSha256` **is** what ayush-yadav.com serves today.

## How a re-record is done

* **Golden hash** — `node scripts/qa/verify-portfolio.mjs --rebaseline`
  (`verify-portfolio.mjs:265-322`). It rewrites `outIndexSha256`, `outIndexBytes`,
  `runSourceSha256`, `commit` (= `HEAD`), `recordedAt` and `buildEnv`, and prints
  the old value. **Ordering is load-bearing**: `--rebaseline` writes `HEAD`, which
  is the *parent* of the commit the baseline lands in unless the code change is
  committed first. Commit the page change, then re-baseline, then commit the
  baseline — then `commit` is right by construction and no hand edit is needed.
  The file's own `_why` says so, and the script prints the warning at :303-320.
* **Cargo fixture** — `npm run test:cargo-fixture:record`
  (`check-cargo-fixture.mjs --record`). The **arrival binding runs before the record
  branch on purpose**, so a re-record of freight that disagrees with `stations.ts`
  fails instead of being blessed.
* Nothing else in `scripts/qa/` records. `check-palette`, `check-figures`,
  `check-stations`, `check-beat-tables`, `check-links`, `check-crosswalk` and
  `check-bench-artifacts` all derive or assert; there is no golden file to refresh.

## Which kinds of change trip which gate

"Trips" = goes red and must be argued with. "Re-record" = a deliberate,
documented rewrite of a pinned artifact.

| change | golden hash | run-shipped | check-figures | check-stations | beat-tables | cargo fixture | nameplate | palette | crosswalk / links | browser smoke |
|---|---|---|---|---|---|---|---|---|---|---|
| **copy edit in serif prose** (a `.bright`, `.mutedln`, `h2` or quote) | **re-record** | — | — | — | — | — | — | — | — | — |
| **copy edit in a kicker** (`¶ NN · … — HH:MM`) | **re-record** | — | — | **TRIPS** (verbatim, slot-bound) | — | — | — | — | — | **TRIPS** (¶01, ¶12, ¶13 literals + the ordering assertion) |
| **copy edit in a figure label / figcaption** | **re-record** | **TRIPS** if a `fig. NN` caption is renamed away or a `fig. 01` appears | **TRIPS** if it touches a bound figure (caption is inside the asserted slice) or drops an `aria-label` below 60 chars | — | — | — | — | — | — | — |
| **copy edit in a `.prov` / `.bfoot` provenance line** | **re-record** | — | **TRIPS** — most bound literals live there | — | — | — | — | — | — | — |
| **changing a waybill string** | **re-record** | — | — | **TRIPS** (`consignment` is verbatim-bound) | — | **TRIPS** — both halves: the recording *and* the arrival binding | — | — | **TRIPS** (direction 4 quotes it) | — |
| **font-family change on captions** (e.g. `.plate figcaption` off `var(--mono)`) | **re-record** | — | — | — | — | — | — | — | — | — → **nothing trips.** No gate reads a DOM `font-family` except `check-figures`'s arithmetic on `.figsvg text`/`#net text` **font-size**. Changing the face on `.plate figcaption`, `.kicker`, `.mono`, `.prov` or `.borrowed figcaption` is invisible to every gate. |
| **font-size change on `.figsvg text` or `#net text`** | **re-record** | — | **TRIPS** if `font × seat ÷ viewBox` falls under 10 | — | — | — | — | — | — | — |
| **font-size change on any DOM text** (e.g. raising `#slotWhen` off 9.46 px) | **re-record** | — | — | — | — | — | — | — | — | **TRIPS only** if it causes horizontal overflow at a tested width, or changes `#slotWhen`'s **text** (`"12:00"` is asserted) |
| **removing a line of prose** | **re-record** | — | **TRIPS** if it carried a bound figure | **TRIPS** if it carried a station string | — | — | — | — | — | — |
| **removing a whole station** | **re-record** | **TRIPS** (13 `data-beat`) | **TRIPS** (6 drawings, fig. numbering) | **TRIPS** (count) | **TRIPS** (every table) | **TRIPS** (corridor count) | — | — | **TRIPS** | **TRIPS** (13 kickers) |
| **changing a number** | **re-record** | — | **TRIPS** (that's the gate's whole job) | — | — | — | — | — | — | **TRIPS** if it is a bench ratio |
| **changing a section height** (`min-height`, padding, the duskin seat) | **re-record** | — | — | — | — | **usually silent.** It samples at fractions of each corridor's *own* span (:138-144) and stores only `{label, corridor}`, so a taller station changes nothing. It trips only if the change pushes a waybill's paint window across a beat boundary — i.e. only if freight starts being read at a different station | — | — | — | **TRIPS** only if it introduces document-level horizontal overflow at 390, 768 or 1440 |
| **adding a colour, or a `measured:` comment** | **re-record** | — | — | — | — | — | — | **TRIPS** unless the comment spells the grammar and the number recomputes | — | — |
| **adding a same-origin link with `↗`** | **re-record** | — | — | — | — | — | — | — | **TRIPS** (glyph contract) | — |
| **touching `.np-plate` / `np-settype` / the machines** | **re-record** | — | — | — | — | — | **TRIPS** (scale, `dTop < 1.5`, width travel, one run) — and the negative gate proves it can | — | — | — |
| **un-gating ¶13 so the address is reachable before approval (fixing defect 9)** | **re-record** | — | — | — | — | — | — | — | — | **TRIPS** — `run-home.spec.ts:326-336` asserts `#nextmorning.offsetHeight === 0` before approval. This is the one place a gate actively **enforces** a defect: the fix cannot ship without editing the test that forbids it. |

**The shape of it:** every change to the page trips the golden hash and needs a
re-record, and for most copy edits that is the only gate they meet. Below the hash
the coverage is strongly asymmetric — **numbers, station strings, waybills, figure
structure, colour comments and the nameplate's geometry are tightly bound;
typography (face, DOM font-size), layout (fixed-overlay overlap, thread x, section
emptiness) and interaction (pointer-events, aria state, tab order, hover-only
information, the pad's preprocessing) are bound by nothing at all.**

Stated per defect, since a blanket count is wrong once the hash is in the picture.
"Beyond the hash" means: assume the change is intended and the baseline is
re-recorded, as it would be for any deliberate edit.

| Part 1 defect | which gate fires, beyond the hash |
|---|---|
| 1 · manifest overlaps body text | **none.** No gate reads `#manifest`'s rect or any overlap |
| 2 · thread drawn through prose | **none.** `check-beat-tables` asserts `stx`'s *length*; nothing reads its values or the painted x |
| 3 · near-empty / blank screens | **none** as measured. Section heights are free; the `duskin` seat is JS-written and unread. Only *deleting a station* trips anything (`run-shipped`, `check-stations`, `check-beat-tables`, `check-figures`, `run-home`), and that is a different change |
| 4 · nameplate 4.4 s and the wrong intermediate strings | **none.** `check-nameplate` binds width travel, overlay scale, `dTop < 1.5` and one-run-only — not duration and not what is legible when |
| 5 · sub-12 px prose | **none.** No DOM font size is read anywhere in the repo |
| 6 · values parting from units | **none.** Line breaking is not measured. (`check-figures` would fire only if a *bound literal* were edited, which a `nowrap` fix would not do) |
| 7 · hover-only reveals, no touch and no keyboard path | **none.** `a11y-audit.spec.ts` runs axe, which does not model hover-gated content or `pointerenter` reveals |
| 8 · `#mtoggle` unclickable / `aria-expanded` desynced / 18 px target | **none.** No gate reads `pointer-events`, `aria-expanded`, or target size |
| 9 · contact block gated, four invisible focus stops | **a gate enforces it.** `run-home.spec.ts:326-336` requires `#nextmorning.offsetHeight === 0` before approval, so the obvious fix goes red |
| 10 · pad does not centre the digit | **none.** `run-home.spec.ts:160-176` only asserts the wasm loads and `#glyphStatus` reads `awake · local`; nothing classifies anything |
| 11 · *refuted* — no crop at 390 | n/a. `run-home.spec.ts` does assert no document overflow at 390/768/1440, which is consistent with the refutation |
| 12.1 · `#clear` clipped at 320 | **none.** 320 is not in `HOME_WIDTHS`, and the element is clipped rather than scrolled, so even the overflow assertion would pass |
| 12.2 · `hidden` never cleared on the replay control | **none** |
| 12.3 · reduced motion never reveals ¶13 | **none.** `reduced-motion.spec.ts` was not read line-by-line here, but the browser-smoke gate that touches ¶13 asserts the *pre-approval* height only |

So: of the eleven Part 1 findings that stand, **thirteen of the fourteen rows above
have no gate at all**, and the one exception is a gate that would block the fix
rather than catch the defect.

---

## Marked UNMEASURED

* **Real-device touch behaviour for figs. 04/05/07.** The reveals in §7 were
  measured under Chromium's `hasTouch` emulation, which synthesises a mouse event
  after a tap. Real iOS Safari and Android Chrome are believed to do the same for
  a first tap on hover-styled elements, but that was **not** verified on a device,
  and WebKit's tap behaviour for these figures was not measured (only its media
  queries were).
* **fig. 05's desktop hover control.** `page.hover('#chWhen')` at 1440 left
  `#cadFig[data-hl]` null and `.w-when`'s background transparent, so the desktop
  path is unproven. `.chip` is `position:absolute` and is flown into its dock by
  the cadence scrub, so the pointer most likely landed after the mark moved. The
  **tap** result at 390 is unambiguous and is what §7 rests on.
* **`reduced-motion.spec.ts`** was not read line by line, so the Part 3 row for
  defect 12.3 says only what the browser-smoke gate asserts.
* **The thread's canvas waybill labels** — 11.5 px `'Fragment Mono'` drawn with
  `fillText` at src:3240-3246, `!stacked && t.j === 0` only. They are not DOM text
  and are absent from the Part 2 census by construction. Source-derived: at most 12
  strings, listed in `tests/fixtures/cargo-corridors.json`.
* **`padcrop.json → ink`** — instrument error (opaque black composite); discarded.
  The classification outcomes in the same file are sound.
* **WebKit at desktop widths** — WebKit was run only at 390 (media queries, and
  the Glyph readout in §11, where it agrees with Chromium). Every sweep, the
  nameplate timeline, the tab walks and the pad trials are Chromium.
* **`window.__npRuns`** — read as `undefined` on the live page at 12 s, so
  `check-nameplate`'s "performs exactly once" assertion was not independently
  reproduced here. It may be set later than 12 s or only under the served-`out/`
  harness; not chased.
* **The 320 manifest-open coverage (36.7 %)** is computed from the CSS
  (`width:min(78vw,300px)` → 250 px, × the measured 301 px open height), not
  measured — the 320 context was not driven interactively.
* **`padcrop.json → ink`** and the first `verify2` attempt at the 390 readout are
  both discarded: the first for the composite error already noted, the second
  because it reported `innerWidth 405` and never triggered a classification. §11
  rests on the `verify3.json` run, where the classification is proven to have run
  in both engines.
