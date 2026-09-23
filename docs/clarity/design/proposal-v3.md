# Proto v3 — changes only

Files unchanged in name: `proto/index.html` (A + phone) · `rail-b1` · `rail-b2` ·
`rail-b3` · `rail-b`. Shots `shots/v3-*`. No repo edit, no copy edit.

## Harness, run here (`v4A`, `v4b3`)

| | base | v3A | **v3b3** | target |
|---|---|---|---|---|
| near-empty ≤60 — 1512 / 1440 / 1280 | 6 / 5 / 4 | 10 / 10 / 8 | **2 / 3 / 3** | ≤6 / ≤5 / ≤4 ✓ |
| blank — 1512 / 1440 / 1280 | 1 / 1 / 1 | 2 / 2 / 1 | **0 / 1 / 0** | ≤1 ✓ |
| crossed line-steps | 285 / 272 / 263 | 203 / 204 / 185 | **197 / 203 / 208** | ✓ |
| manifest overlap · sub-12px | 8/9/13 · 166/170/164 | 0 · 0 | **0 · 0** | ✓ |
| screens | 15.91 / 15.97 / 16.12 | 15.68/15.74/15.81 | **11.59 / 12.20 / 12.97** | — |
| **390** screens · near-empty · blank | 23.22 · 2 · 0 | **16.47 · 2 · 0** | — | ≤16 ✗(0.47) · ✓ · ✓ |
| **320** screens · near-empty · blank | 31.28 · 14 · 0 | **23.25 · 7 · 0** | — | ✓ · ✓ · ✓ |

## 1 · Why B3 was failing, and it was not the corridor

Every near-empty frame sat at **low beat-progress** (bp 0.03–0.31): the empty *head* of
a station, before its content arrives. `.station` centred content in a fixed box, and
v2's B3 split the corridor 23vh/23vh, putting half of it **above** the heading. So:

- **The corridor is now asymmetric** — `align-items:flex-start`, `padding-top:7vh`,
  `padding-bottom:25vh`. A reader *arrives* at a stop (heading near the top of the
  screen) and then *travels*. ¶08 keeps a longer approach, 36vh, because dusk falls
  across it.

## 2 · The engine was silently overriding B3

`#lifequest` measured **1432px tall for 562px of content** at 1440 — 807px of trailing
gap against 324px of declared padding. Cause: **`bDusk.el.style.minHeight` is written
inline by the engine**, so it out-ranks every stylesheet rule B3 writes. The seat's
stated job is "the closing sentence centred in the dark it names" — and **copy v2 cut
that sentence** (`[data-fx-sync="duskin"]` now resolves to `null`), so the tail bought
nothing but void.

Desktop tail `vh * 0.62 → 0.34`; phone `0.3 → 0.14`.

**The day-arc check you asked for.** `dusk7.span = darkSpan / bDusk.h`, so the darkening
is a *fraction* of a seat whose pixel span is fixed — shrinking the seat cannot rush it.
Measured at 1440 by sampling `--scrim-c` every 100px and converting to Lab:

| | max ΔE / 100px | total ΔE over the arc | darkening span |
|---|---|---|---|
| before (0.62) | **23.58** @ y6600 | 96.9 | 1500px |
| after (0.34) | **23.58** @ y6600 | 96.9 | 1400px |

Identical. (The 23.58 spike *is* the flip — the site's own law that the mid-luminance
band is never rendered.)

**And B2 is not inert.** It scored identical to A only because the old fixed heights
absorbed the seat. It is folded into B3/`rail-b`; `rail-b2` is left alone for comparison.

## 3 · Phone

`padding-block` 7vh → 3vh · `.b1` 74 → 58vh · `.beat-inner` gap 1rem · `.plate` .7rem ·
`.prov` 1.56 · and the tight figure editions **330 → 276px**. Those editions author 11px
in a 240 viewBox, so the seat sets rendered size: 330px gave **15.1px** — above the
11–15px band their own comment asks for — and 276px gives **12.65px authored, 12.46px
effective**, the last width that still clears the 12px floor. `check-figures`' `FLOOR_PX`
covers the **wide** editions only, so this is outside it.

**390 lands at 16.47, not 16.** The remaining height is content: 1,973 words plus six
figures in a 390px column. Closing the last 0.47 screens means fewer words or figures
below the 12px floor, and I will not take the floor back.

## 4 · Styling the copy doc asked for

- **`.codename` is now the deck**, not a small italic aside: Newsreader
  `clamp(1.22rem, 1.72vw, 1.46rem)`, ink, 34ch — the largest *sentence* at the stop.
  Scale descends **name (Fraunces) → what it is (deck) → why it matters (`.bright`,
  stepped down to 1.1–1.3rem, ink-2)**. It was the smallest, faintest line at the head,
  which is the exact inversion of what a non-technical reader needs.
- **`.codename + .codename`** sets one step down: ¶03 carries both the stop's name and
  the job title, and at deck size they read as two competing headlines
  (`v3-a-w1512-y2700.jpg` before the fix).
- **`.gwhy`** (¶10's gate reasons) sits in the row's metric column, Newsreader italic
  13px ink-2 — it is the sentence the row above only asserts.

## 5 · What the owner should look at

`v3-b3-w1512-y9000.jpg` vs `v3-a-w1512-y9000.jpg`. **B3 is now the only variant that
meets the non-regression rule at all three desktop widths** — but it takes the page from
15.91 to **11.59 screens** at 1512, a 27% shorter run. That is roughly proportional to
the 35% copy cut, and it is the biggest single change to how the day feels underfoot.
B1 remains free and is still the best on crossings.

## Open

1. **B3 + B2 together, or A?** A meets no near-empty target; B3 meets all.
2. **11.59 screens at 1512** — is the shorter day better, or should the corridor go back
   up (the constant is one number, `padding-bottom`)?
3. 390 at 16.47 screens, 0.47 over.
4. `check-figures` should be re-run: the tight-edition seat moved, and although its
   `FLOOR_PX` covers wide editions only, that is worth confirming rather than assuming.
