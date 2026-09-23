# Design proposal — ayush-yadav.com

Prototype: `proto/index.html` (bucket A + phone) · `proto/rail-b.html` (bucket B).
Both copied from `out/` at `b6ea15df…24b6b2`, verified equal to the live hash.
Shots `shots/a-*` and `shots/b-*` at 1512/1440/1280/390/320. Full per-hook table:
`appendix-hooks.md` (115 hooks, generated from `inventory/analysis.json`).
No tracked file touched.

## Premise corrections (measured first, because four of these change the design)

| claim | measured |
|---|---|
| "Newsreader (variable roman plus italic)" | **Not variable.** No `fvar` in either woff2. Two static 400 faces. No weight axis, no `opsz`. Every `font-weight>400` on `--body` today is faux bold. |
| "Fraunces … opsz/SOFT" | Correct: `opsz 9–144, wght 100–900, SOFT, WONK`. The only face with a weight axis. |
| `tabular-nums` | Newsreader ships `tnum`+`pnum`. **Fraunces ships neither** (`kern,liga,rvrn`), so `tabular-nums` is a no-op on display type. |
| "moving text off mono changes the arrows" | **False on his Mac.** `CSS.getPlatformFontsForNode`: ⟶ ↗ ↳ ⟲ render in **Apple Symbols in all three stacks**, identical advances (42.50 / 25.59 / 17.56 / 27.19 px @40px). |
| x-height parity | Fragment Mono .524 em · Newsreader .426 · Fraunces .482. **Mono px × 1.230 = Newsreader px.** Every size below is that arithmetic. |

---

## 1 · The type system

**Faces unchanged. Byte cost zero.** No new file, no new `@font-face`. Fraunces =
display; Newsreader = everything a person reads; Fragment Mono = machine values.
`font-synthesis:none`, because Newsreader has no bold to synthesise from.

**Scale** (root 16): `--fs-micro .75rem/12px` (machine values, the floor) ·
`--fs-small 13` · `--fs-label 14` · `--fs-note 15` · body 18 and the display clamps
unchanged.

### Per-hook reassignment (top 30 by words; all 115 in `appendix-hooks.md`)

| words | hook | today | → face | → px | role |
|---|---|---|---|---|---|
| 373 | `p.prov.mono` | mono 12.48 | **Newsreader**, tnum | 15 | It is a sentence with figures in it. `.prov b` stays mono 13. |
| 149 | `figure.plate>figcaption` | mono 11.52 | Newsreader | 14 | C |
| 96 | `p.mono` | mono 11.20 | Newsreader | 15 | P |
| 79 | `p.kicker` | mono 11.52 | **Newsreader italic** | 14 | N. Only the `<i>` clock is mono — see the note below. |
| 75+61 | `p.handoff>a`, `span.dep` | mono 11.52 | Newsreader | 14 | N |
| 74 | `figure.plate>i` | mono 11.52 | Newsreader italic | 14 | C |
| 71 | `div.srow>span` | mono 11.84 | Newsreader | 14 | P. `.srow b` stays mono 13. |
| 57 | `p.bfoot` | mono 11.20 | Newsreader | 14 | P |
| 199 | `.figsvg text`, `#appliedFig`, `#jetFig`, `#pathFig`, `#amlFig`, `#net` | mono 12.26–15.38 | **unchanged** | unchanged | Labels were fitted with `getComputedTextLength()` against Fragment Mono advances; `FLOOR_PX 10` is arithmetic over that face. Changing it re-opens every label budget. |
| 46 | `p.prov.mono>b` | mono 12.48 | mono | 13 | MV, + `.uv` |
| 44/42/21/12 | `span.gm`, `span.m`, `#mcount`, `span.idx` | mono | mono | 12 | MV |
| 43 | `span.qn` · 39 `div.shead>span` | mono | Newsreader | 14 | L |
| 41 | `p.rct>a` | mono 11.52 | Newsreader | 14 | N |
| 38 | ladder `li>span` · 30 `#mclock` · 22 `#mphase` | mono | mono, tnum | 12 | MV / L |
| 60 | `figure.borrowed` figcaption + `>i` | mono 10.88 | Newsreader / italic | 13 | P — seven epigraph attributions |
| 104 | `p.gleg`, `span.srole`, `span.rel`, `p.gclose`, `p.sclose`, `p.nb` | mono 11.03–12.16 | Newsreader | 14 | P |
| 19+19+18 | `span.hoverinv`, colophon `footer`, `figure.cosign>span` | mono 10.56–11.84 | Newsreader | 13–14 | P |
| 17 | `ul.engrows>b` | mono 11.84 | **Newsreader 15** | 15 | P — these are sentences. Only `a[href^=mailto]` stays mono 13. A first draft set the degree line in mono, which is the exact mistake this pass exists to end. |
| 10 | `p.foot` | mono 11.20 | Newsreader | 14 | P |
| 21 | 8 controls (`#clear` `#gzbtn` `#approve` `#mtoggle` `.np-replay` `#glyphStatus` `#conf` `#fwd`) | mono 9.5–12.5 | Newsreader 15 label / mono 12 readout | — | N, all gain a 44px target |
| tail | 69 hooks ≤10 words | mono | by role | ≥12 | see appendix |

Totals from the appendix: **1,721 mono words move to Newsreader**, 319 stay as SVG
labels, 261 stay as mono machine values, 21 are controls.

Two mechanical companions: `tabular-nums` on every ex-mono hook, and
**`word-spacing:.12em`** on them — ` · ` measures .618 em in Fragment Mono and .247 em
in Newsreader, and without compensation the ledger rhythm collapses. `word-spacing`
does it with **no markup**, which matters because `check-stations` matches raw HTML and
a `<span>` inside a bound string turns it red.

### Glyph coverage — cmap + `hmtx`, then confirmed on the real proto nodes

| mark | in the four faces | mono stack | serif stacks | verdict |
|---|---|---|---|---|
| ⟶ ↗ ↳ ⟲ | **absent from all four** | Apple Symbols | Apple Symbols, **same advance** | No change. No rule needed. |
| ¶ · × — – … ’ “ é | present in all four | declared face | declared face | Safe; `·` needs the `word-spacing` above. |
| **✓** | absent from all four | Menlo 24.09 | Lucida Grande 30.58 | **Diverges** → pinned. |
| **↓** | **Fragment Mono only** | Fragment Mono 24.73 | Apple Symbols 18.70 | **Diverges** → pinned. |

Only two marks diverge, and both sit where mono is correct anyway: ✓ is a gate verdict,
↓ is the ¶01 cue. Pinned by hook (`.gleg .gtick`, `.cue .a`, `.gbench .gmark`) and
**verified on the proto**: `.gleg .gtick → Menlo(1)`, `.cue .a → Fragment Mono(1)`.
**Zero bytes, zero new `@font-face`.** Nothing falls back that does not already.

Two corrections to an earlier draft of this table, both measured:
- **The `¶` sets in Newsreader, not mono.** It shares one text node with the kicker,
  and `check-stations` forbids a span there. Proto reads `.kicker → Newsreader(19) |
  Fragment Mono(5)` — the 5 are the `<i>` clock. Newsreader has ¶ (advance .603), so
  nothing falls back.
- **A sha inside link text keeps the link's face.** `.handoff a[href*="@"]` matched
  nothing (the sha is link *text*, not href), and mixing faces mid-anchor reads worse
  than a serif sha. Dropped deliberately.

---

## 2 · The phone (≤820) — "the rail is the margin"

On a phone the conceit is not a sweeping line, it is a **route diagram**: one vertical
line down the margin with a tick at every stop. That is what a station board looks like,
and it happens to kill the two worst phone defects at once.

| | today | proto |
|---|---|---|
| thread | `stx` swings 26–74% of one column; crosses prose twice per station | pinned to `RAIL_X_MOBILE = 26px` in a 38px lane, wobble 8→3, `.beat` gains `padding-left: pad-x + 38px`. **Crossings by construction: 0** — except the `#gateDock` terminus at ¶12, which is forced onto the dock square and still enters the column. |
| manifest | fixed pill, 18px target, covers text on 13/46 steps at 390 and 28/62 at 320; opens to 27.5%/36.7% with no Escape, no outside tap, and it moves when opened | retired from the float. Count in the masthead in a **44px** target; the ledger is a **bottom sheet** with a grab bar, Escape, scrim tap, `close ×`, focus returned to the opener, and rows that are **real links to stations**. Involuntary overlap **0**. |
| station height | `min-height:150vh`, content floated mid-box, 2.4–2.8 vp/station | `min-height:0; padding-block:7vh` — content plus one 14vh corridor. Measured mean **1.76 vp/station**; target **≤1.6 after the copy cut**. |
| heading | one line | **two-line pattern**: literal `h2` Fraunces clamp(1.85–2.35rem) + `.codename` Newsreader italic 14 clay. Shown on ¶03. |
| masthead | name + `run 042 · clock · phase` | name + `clock · station` + count. Per yoda #6 the phase stays and the **control** sheds its word instead (`stops 0 / 6` measured 96px, `0 / 6` 60px) — a first attempt dropped the phase and overflowed the 390 band by 67px. |
| screens | 23.22 | 22.87 → target **≤16 after the copy cut** |

**Be honest about the screen count.** The phone is content-bound, not layout-bound: my
layout returns 0.35 screens. The other seven come from the 30–40% copy cut and nothing
else. The phone win is that the 26/46 prose-free screens become readable prose, the line
stops crossing it, and the furniture stops landing on it.

---

## 3 · Desktop — bucket A

| § | selector · `src/run/index.html` | change |
|---|---|---|
| 1, 8 | `#manifest` :254-260, :274-277, :1226-1232, :1248-1250; `#mtoggle` :300 | Floating plate retired. `#mcount` moves into a real `#mtoggle` in `#mast`; `#manifest` becomes an anchored panel, gated on `.open` alone. `pointer-events:none` deleted. |
| 8b | handler :4766-4769 | Retired and replaced: one writer for `.open`, `aria-expanded`, `aria-hidden`, the scrim; Escape, outside tap, `close ×`, focus return; a row click closes it. |
| 1c | `#manifest` background | `--plate-solid` (.86) → `var(--ink-inverse)`. A ledger you asked for is a solid object. |
| 5 | ~30 hooks | the ≥12px floor. **47 → 3** sub-12px pairs at 1440. |
| 6 | `.prov` :358-359; the eight `&#8202;` sites | a `.uv{white-space:nowrap}` **atom**. Not on the row: a first draft put nowrap on `.schoolrec .srow b` and the record measured a 460px right edge in a 390px band. |
| 7 | `traceOn` :3340-3350, `.hoverinv` :468, fig.05 :1855 | `traceOn` now answers pointer, **tap, focus and Enter/Space**, with Escape and an outside tap to clear — a touch reveal previously had no way back, since `pointerleave` never fires from a finger. fig. 05's invitation finally wrapped; `.touchinv` twins give touch the right verb. |
| 9 | `.engrows` :1013-1016, `.dawnrow` | two rows in the ¶02 card — `write · aesh.03.23@gmail.com` and `résumé · pdf · one page ⟶`; ¶13 gains the résumé **between linkedin and the working paper**, per yoda. **The email is now on screen 2 with no button press.** |
| 12.1 | `.padbar` :527-529, `.padcard` :1223 | wrap + 44px targets + `min(320px,92vw)`. |
| 12.2 | :5826-5891 | one line: `replay.hidden = false` in the `finally` block. |
| 10 | — | JS. UI hint only: `#padhint` should say what normalisation does. |
| first screen | — | a plain noun phrase under the nameplate in Newsreader 15. **Copy's words, my slot.** |

**Why the manifest could not simply move.** Scanned against the measured line boxes in
`sweep-w*.json`, at the aside's own dimensions:

| candidate, 1440 | open | pill |
|---|---|---|
| bottom-right (today) | 16/31 steps cover text | 5/31 |
| top-right under the mast | 19/31 | 6/31 |
| bottom-left | 20/31 | 8/31 |

**No corner is free.** So the persistent part shrinks to the one band that already
carries a scrim, and the ledger becomes a disclosure. Caveat: `#mast::before` is
`display:none` under reduced motion, so the pass-behind scrim is absent there.

**§4 · the nameplate.** Two clocks that never agreed: CSS letters arrive at
`0.18 + 0.21i` s (last 2.28s) while machine letters wait for their dry at 2.64–3.06s, so
`·yu·h Y·d··` holds 1.83s. Change: (a) key the letter sweep to the **same trigger as
`perform()`** (an attribute set when it starts) rather than page load — otherwise the
two are timed from different origins and any figure is arithmetic across both;
(b) re-phase to `0.9s + i × 120ms`; (c) replace the `window load` gate with
`document.fonts.load()` for the h1's exact descriptor, **keeping the 5000ms stop**.
Do **not** cap the font wait — it is what protects the width-travel and `dTop<1.5`
assertions. **Targets** (not measurements): full name ≤3.2s, longest incomplete state
≤0.6s. Spec only; not in the proto.

---

## 4 · Desktop — bucket B (owner decisions)

| # | change | risk | non-regression metric |
|---|---|---|---|
| **B0** | **Retiring the corridor ledger.** The engine still writes `.compact` every frame; with the ledger on request it goes inert. The brief puts "when `.compact` applies" in bucket B, so this is listed here even though the *collision* fix is A. | Low functionally; it removes an authored beat ("the collection breathes"). | manifest overlap steps 8/9/13 → **0 involuntary** at 1512/1440/1280. **Ask main to confirm the harness scores a closed panel (`opacity:0; visibility:hidden`) as non-overlapping** — otherwise it counts the hidden rect and reports a false 0. Also: `#mtoggle` stays clickable under `#mast.gone` at ¶12; it needs the same `pointer-events` withdrawal. |
| **B1** | **The under-sheet dip.** The thread is erased to a ghost where it lies under a text column (`destination-out` at .84 over `.prose/.schoolrec/.gatecard/.litany/.signs/.engcard`), generalising the author's own `#thread{opacity:.55}` at ≤1249. | **Low. Zero geometry change** — `stx`, the three anchors, the wobble, every cargo corridor byte-identical. | **Measured:** max thread alpha inside a prose rect at 1440 y2250, **255 → 77**; outside, 255 both. `threadCrossedLines` uses an alpha>40 threshold, so **it will not go to zero and is the wrong metric here** — use max-alpha-inside-text. Prove the geometry by diffing the `anchors`/`samples` arrays between builds, not by an alpha-thresholded count. |
| **B2** | **The void.** `duskin` writes **520.179px** of margin at 1440 and caps it to zero only when `mobile`; the cap becomes a ±0.12 vh clamp everywhere. | Low. **Grepped `tests/` and `scripts/qa/`: nothing binds `duskin`.** | blank screens 1→0 at 1512/1440/1280. **And the metric that actually matters:** the seat exists so ¶08's closing line is on screen when the ink flips — assert the `duskin` element is in the viewport at the `data-night` flip scroll, base vs rail-b, at all three widths. |
| **B3** | **The corridor becomes a constant.** `.station{min-height:92vh; padding-block:23vh}` replaces the 118–158vh multiples; `.b8` keeps its seat. | Medium — the one the owner must look at. | **Measured:** screens 15.97 → **15.43** at 1440. Also: near-empty ≤60w; **mean \|dx/dy\| per corridor** (the serpentine steepens); **scroll px per `WAY` segment and max ΔE per 100px** at 1280/1440/1512, because the arc is beat-progress driven and shorter beats make dusk fall over fewer pixels. The corridor constant is the single dial if −0.54 screens is too little. |
| **B4** | *Offered, not recommended:* retune `stx` to the measured text-free bands — non-flip 45%, flip 53–54%, clear at 1440 **and** 1280. | It works and it **costs the sweep**: amplitude drops from ~39% of vw to ~9%. The rail becomes a narrow central zigzag. | Listed for completeness; B1 buys the result without the loss. |

### The coordinator's question: copy cut vs station heights

Measured at 1440, section height − content height:

| | who | path | work | cadence | start | glyph | jetpack | lifequest | automl | cosigners | gate |
|---|---|---|---|---|---|---|---|---|---|---|---|
| void px | **598** | **782** | **612** | **616** | 469 | 565 | 472 | 347 | 279 | 321 | 124 |
| content px | 464 | 641 | 540 | 536 | 593 | 767 | 680 | 1305 | 945 | 831 | 776 |

Four stations already carry more void than content, and the corridor a reader
*experiences* swings from 124px to 782px for no reason visible to them. Cut copy 35% and
`who` opens a 732px void. So:

1. **Absorb the cut in the type scale first (bucket A).** It is already ~40% absorbed:
   ex-mono prose grows 1.230× and gains leading. Measured, bucket A alone holds the
   document at 14,396px against a 14,377px baseline with *today's* copy.
2. **Then B3 for the remainder.** A constant corridor is also better rail design — the
   freight gets a uniform run between stops, which is what a working timetable is. The
   thread's 0.18/0.52/0.95 anchors are *fractions of the section box*, so they keep
   their proportions; the serpentine only steepens.
3. **Content-driven heights keep cargo in its corridors.** `check-cargo-fixture` samples
   at `FRACTIONS` of each corridor's **own** span and stores only `{label, corridor}`,
   so height is invisible to it unless a waybill's paint window (`prog 0.1–0.7`) crosses
   a beat boundary. Caveat: that gate **only runs at 1440×900** and cannot speak for
   1280 or 1512.

---

## 5 · Gate impact

| gate | impact |
|---|---|
| **golden hash** | re-record once, after the page change is committed. Ordering is load-bearing. |
| **check-figures** | **Safe by inspection.** It strips tags (`<[^>]*>` → " ") then collapses whitespace, so `.uv` spans inside bound literals survive — including `422 vs 66 mb/s`, which is wrapped. Face changes are invisible to it. `.figsvg text` / `#net text` font-size **untouched**, so `FLOOR_PX 10` is unaffected. |
| **check-stations** | **The sharp edge.** It matches `runText` with entities decoded and **tags intact**. No span inside any `name`/`kicker`/`clock`/`consignment`/`dossier`. Verified: none of the measured break sites is in `stations.ts`, and the last break (`jetpack-` / `compress`) is fixed in **CSS**, not markup, because that string *is* bound. |
| **check-palette** | One new claim, spelled in the repo grammar in the proto. My implementation reproduces the repo's own `#5c564a on #f2e4c9 — 5.79:1 / Lc 70.1` and `#26231c on #f2e4c9 — 12.48:1 / Lc 87.5` exactly. Ledger ground `--ink-inverse`: day **14.24 / 6.61 / 5.91** (Lc 96.0 / 78.7 / 74.9), night **13.71 / 10.27 / 8.55** (Lc −95.2 / −76.1 / −65.7). All clear 4.5:1 and \|Lc\| 60, and all six beat the same ink on the binding day field. |
| **check-nameplate** + negative twin | Timing is unbound, but re-phasing touches `np-css`. Keep the twin's three injection literals byte-identical. **Must run both.** |
| **check-beat-tables** | Its two regexes assume the exact two-arm `stx` ternary. The phone rail is therefore a **scalar `RAIL_X_MOBILE`, not a third arm** — a third array would make the "stacked" label silently read the mobile arm *and still pass*. |
| **check-links** | **Measured scope:** it `continue`s on any href not matching `^https?:`, so the six `#station` links, the relative `resume.pdf` and both `mailto:` are outside the contract entirely. No risk — and no enforcement either (see open question 3). |
| **check-crosswalk** | All six manifest hrefs target existing ids. Second anchor in the archive colophon may trip it, per yoda's own note. |
| **run-home.spec** | (a) **Goes red on §9 by design** — `:326-336` asserts `#nextmorning.offsetHeight === 0`. (b) `mailto` is asserted with `.first()` and a regex, so a second address is safe. (c) `HOME_WIDTHS` is `[390,768,1440]`; **add 320, 1280, 1512** — I introduced and then fixed a 67px overflow at 390 that 320 would also have caught. |
| **cargo fixture** | No re-record expected; B3 trips it only if a paint window crosses a beat boundary. |

---

## 6 · What I measured on the prototype

| | baseline | proto A | proto B |
|---|---|---|---|
| mono share of text nodes, 1440 / 390 | 73.9% / 73.6% | **21.3% / 20.3%** | same |
| sub-12px HTML selector/size pairs | 47 | **3** | 3 |
| flagged line breaks (`wraps.mjs`), 1440 / 390 | 8 / 10 | **0 / 0** | 0 / 0 |
| document screens, 1440 | 15.97 | 16.00 | **15.43** |
| document screens, 390 | 23.22 | 22.87 | 22.87 |
| doc horizontal overflow, 320 / 390 | 0 / 0 | **0 / 0** | 0 / 0 |
| `#clear` rect at 320 | clipped, right 326 of 320 | **`[198,52,250,44]`** — inside, and a 44px target | same |
| tap reveal at 390 (`hasTouch`) | fig 04 `tracing:false, hot:0`; fig 07 same | **fig 04 `tracing:true, hot:4`; fig 07 `tracing:true, hot:2`** — matches the desktop positive control exactly | same |
| max thread alpha inside a prose rect, 1440 y2250 | 255 | 255 | **77** |

Same counters on every row, and they are **mine**, not the harness's — main should
re-score with `harness/metrics.mjs`. The three remaining sub-12px runs are a decorative
`●`, one `p.mono` carrying an inline `style="font-size:.7rem"`, and ¶13's Eliot
figcaption, which sits outside `.borrowed`. All three are one-liners. Keyboard reveal is
wired (`focus`/`keydown`) but only the **click** path was measured.

**Ask main to run:** the harness at **1512/1440/1280/390/320 plus 1024 and 768** (the
type changes reach the stacked band), then `check-palette`, `check-figures`,
`check-stations`, `check-links`, `check-crosswalk`, `check-nameplate` + its negative
twin, `check-cargo-fixture`, and `run-home.spec` with 320/1280/1512 added.

## 7 · Open questions for the owner

1. **B0–B3: take all four, or B0/B1/B2 only?** B3 is the one that changes how the day
   feels underfoot. The other three are close to free.
2. **The mast now carries a control**, which is the only measured solution to §1 and §8 —
   but yoda's ruling says "masthead unchanged (one-link rule)" and rejected a masthead
   link. A button is not a link, and yoda was ruling on the résumé, not the manifest.
   **Surfacing rather than deciding.** yoda #6 (keep `clock · station` at 390) *is*
   honoured.
3. **⟶ or ↗ on the résumé?** The brief says ⟶ (same origin, goes deeper). yoda's ruling
   says ↗. Measured: `check-links` skips relative hrefs entirely, so neither is enforced
   and the site's own stated rule ("⟶ goes deeper into it") is the only tiebreak. The
   proto uses **⟶**.
4. **"pdf · one page" is false against the file that ships today** — `public/resume.pdf`
   is the Sep 11 copy and measures 2 pages. The row must ship in the same commit as the
   Résumé 2.0 PDF, which must also clear `closureFloorsBytes`' `resume.pdf ≥ 50,000`.
5. **The corridor auto-open ledger is retired.** The choreography could return as a
   mast-anchored strip that prints the newly-stamped row beside the count. Worth it?
6. **`run-home.spec:326-336` must be edited** for §9 to ship. I recommend replacing it
   with an assertion that the address is reachable *before* approval.
7. **Still owed and not in the proto** (§9's other half): `inert` on `.bdawn` until
   `body.approved`, which removes the four invisible tab stops; and the reduced-motion
   branch at :5373 never sets `atmorning`, so under RM the address is unreachable at any
   scroll. Both are yoda's item 5.
