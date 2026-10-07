# The phone's morning — ¶13 on a portrait sheet (2026-10-07)

The owner, 2026-10-07: "in the phone view, in the last screen when it is
morning again! there are no trees or anything and it looks plain! also the
text is not aligned properly! … it has to be on par or better than laptop,
and using the same concept as the laptop's."

Measured before this round (headless Chromium, production build): at his own
seat, 420×800, the phone drew 64 paths — four stray sky lines, no range, no
sun, a 27px strip of ground with a 28px doe. Under 760px of height it drew
nothing at all. He is right.

## What the phone's morning is

The laptop's morning is one drawing the reader arrives in: the range with the
sun behind the principal across the top, the words standing on the plain in
the clear air in front of it, the meadow at the foot with the cast in it, a
tree framing each edge. The phone's morning is the SAME drawing seen from a
narrower standpoint, not a different kind of morning: a portrait sheet has no
flanks, so the three planes stack — sky, words, meadow — and the reader
stands a few steps closer, which is what a narrow field of view is. Same
hand, same cast, same light, same rulings (the words' air, the light's
clearing, the colour registry, grass-sized grass, rotation-only wind).

It is ONE SCREEN. The sticky panel is the viewport and the drawing is laid
out for it; the 35vh of run-out under it is the arrival landing, as before,
and nothing in the morning is driven by scroll position after the carry. A
two-moment morning (scene first, sign-off rising over the ground as the
reader scrolls) was considered and rejected: the clearing is derived from
where the words LAND, so words that move with the scroll would either tear
through the drawing or leave a hole in the scene before they arrive, and a
reader who does not scroll would never be shown the contact row. The
laptop's concept is the words in the drawing, not after it.

## The sheet, recomposed

Three bands, top to bottom, every one placed by measured room rather than by
a fixed fraction (a fixed fraction is what put 48px of range at 844 and
nothing at 800):

1. **The sky and the range.** From 10px under the masthead's scrim (the
   scrim is opaque to the mast's lower edge and fades out 2.4rem below it,
   measured 98.4; a peak under it is a peak cut off by the page's own
   chrome) down to the range's foot. The principal with its peak at 0.34 W,
   the east summit beyond it in hair-strong, the west summit filling the
   corner the sun rises out of — the same fixed path data as the laptop,
   seated by relief. The sun on the principal's west ridge, its crown
   clearing bare paper round it exactly as on the laptop, its disc scaled
   with the band (20px at the 70px floor, up to 30 at the tallest seats).
   Under the foot, the laptop's own far wood — copses of small crowns on
   the valley floor — so the range stands on land rather than floating on
   three haze dashes. Etched sky between the summits. Then 66px of air with
   three low hazes across it, which is distance and not a margin.
2. **The words.** Kicker, hourline, the quote and its attribution, the
   thank-you, the contact row, the signature: one column, CENTRED ON THE
   SCREEN. It was centred on the panel, which sits inside the rail's lane,
   so every line stood 19px right of the screen's own centre. The row is a
   composed thing now: the address on its own line (it is the one machine
   value in the row and keeps its mono), the four exits in one even row
   under it (two by two under 360px), every target the 44.7px the ≤820
   tap-target rule was measured for. The three big gaps (head → quote,
   quote → foot, row → signature) are the laptop's own `--dawn-gap`, 24px
   tightening to 9.6 when the sheet is short, instead of a fixed 2.4rem
   that was more generous than the laptop's maximum.
3. **The meadow.** From the horizon (34px under the signature: its 24px
   halo and the brow's ticks) to the sheet's bottom edge. The brow, drawn
   not ruled, across the full width; the pair IN the near meadow, in front
   of the horizon, at a size that reads — the doe up to 58px to her ears at
   the owner's seat against 28 before — the fawn facing her; the pool with
   the light on it under the sun's column; a gull pecking by the water; the
   young tree on the east edge, its foot near the bottom of the sheet and
   its crown rising into the corner beside the signature, ~100px tall at
   420×800; tufts in three sizes, none over a third of the doe; the bottom
   edge stippled corner to corner. With depth to spare: daisies that open
   over the first minute, a second gull walking, the hare under the tree,
   the boulder.

## Where the room goes, and how it degrades

Everything is one budget: `S = H − pTop − 66 − C − 34`, where pTop is the
band's top (scrim + 10), C the column's measured height, 66 the air a ridge
and a hatch owe the kicker, 34 the air the horizon owes the signature. S is
spent in this order, each rung taking what it needs before the next:

| rung | takes | what it buys |
|---|---|---|
| 1 | ground 26 | the strip: brow, tufts, the pair small on the horizon in the corner, a gull |
| 2 | relief 40 | the ridge and the SUN — the morning has its light |
| 3 | ground → 60 | the pair steps into the near meadow at full size, the pool, the tree |
| 4 | relief → 70 | the hatch on the rock |
| 5 | ground → 110 | depth: the fawn forward, daisies, the hare, a second gull, more grass |
| 6 | relief → 0.16 H | the range at its best |
| 7 | the rest | air between the foot and the kicker (the hazes stretch into it) |

If S cannot reach rung 4 at full gaps, the column's gaps tighten first
(the laptop's own order: the range gives up height, then the gaps, then
the hatch), and only then does the hatch go, then the ridge. The floor is
never nothing: under rung 1 the brow alone is drawn if 12px remain; the
"nothing drawn" branch survives only for a column that does not fit the
panel at all (320×568), which no gate seat and no current phone is.

Measured after the build (headless Chromium and WebKit, `isMobile`, the
production `out/`; the two engines agree at every seat to the pixel on the
column and to within two paths on the drawing):

| seat | panel / visible | before | after: stage | relief | ground | doe (px to ears) | paths | live groups |
|---|---|---|---|---|---|---|---|---|
| 420×786 (his iPhone Air) | 786 / 746 | relief −10, no sun, 27px strip, doe 28, 64 paths | gaps tight | 70, hatched | 62 | 45 | 166 | 8 |
| 402×754 (iPhone 17 Pro) | 754 / 714 | nothing drawn | ridge | 40 | 60 | 44 | 161 | 8 |
| 420×800 | 800 / 760 | relief 4, no sun, strip | gaps 0.75 | 70, hatched | 61 | 45 | 167 | 8 |
| 390×844 | 844 / 804 | relief 48, strip, doe 28, 111 paths | fits | 70, hatched | 61 | 45 | 168 | 8 |
| 393×760 | 760 / 720 | nothing drawn | ridge | 46 | 60 | 44 | 158 | 8 |
| 420×912 | 912 / 872 | relief 116, strip, doe 28, 114 paths | fits | 89, hatched | 110 | 57 | 209 | 8 |
| 430×932 | 932 / 892 | relief 189, strip, doe 28, 118 paths | fits | 109, hatched | 110 | 57 | 209 | 8 |
| 375×667 (SE) | 667 / 627 | nothing drawn | meadow, no range | 0 | 26 | 40, the pair on the horizon | 98 | 6 |
| 320×720 (the gate's floor) | 720 / 680 | nothing drawn | meadow, no range | 0 | 34 | 41, the doe alone | 91 | 5 |

The column: left 36 / right 36 at every width (it was 74 / 36). The
kicker's ink at 242 on the owner's seat (the scrim fades out at 98). The
row: the address on its own line, then `github ↗ · linkedin ↗` and `résumé
⟶ · the working paper ⟶` in two equal columns, every target 44–45px tall.

What the measurement corrected in the plan above: the four exits never fit
one line (341px of text in a 348px column at 420), so the row is a 2×2
table under the address, three lines that line up rather than two; and the
hatch floor costs the owner's seat its full gaps — at 786 the budget
reaches the hatch only at `--dawn-gap` 9.6, which is the laptop's own short
stage and the trade the laptop makes in the same order. The band is seated
by where the SUN lands (0.27 W) rather than by the principal's peak at
0.34 W: with the peak pinned, a taller band slid the disc to 0.13 W and the
frame's edge cut its crown.

`check-dawnscape` on this build: green at all 18 seats (the 16 and the two
phones added: 420×786 and 402×754), the sky sit included. Clearance at the
phone seats: 3.1px of margin on the hatch's 64 from the kicker; the crown's
clearing 57 of 56; eight groups on the wind sheet, nothing on the paper.

Two things the phone does not get, and why: the great tree (its crown
needs the sheet's flank, which a portrait sheet does not have — every
word-line is wider than the corner beside it, with the signature as the
one exception the young tree uses), and a far crossing with a cause (no
canopy to leave from under the words' air; the one "noticed" crossing in
the band stays).

The iPhone 14–16 class (390–393 wide) was not measured on a simulator;
assume a panel ~40px under the point height and ~80 under it at rest, i.e.
390×804 visible 764, which the 390×844 row above brackets from above and
393×760 from below — both draw the hatched or ridged range with the sun.

## What moves

The two-sheet architecture is untouched: `.ds-paper` painted once,
`.ds-wind` carries the motion, masks only on the runs a reserve meets. The
phone's census stays at the cap of eight continuous groups, spent as before
— the sun's two crown layers, the tree's sway, one tuft's gust, the gull's
peck, the doe's head and tail, the fawn's head — and everything added
beyond that is still (the hare and the second gull are drawn with their
heads at rest; the daisies open by transition, which is not census). No
third sheet, no mask that moves, no filter, no per-frame DOM write.

## What answers the reader

The notice controller already takes a tap (never a scroll passing over the
meadow). On the phone the creatures are in the near meadow now, where a
thumb can reach them without crossing the words' air: a tap by the doe
lifts her head (her ears are fills on the phone, so it is the head, not the
ears), the fawn follows a beat later; a tap by the gull turns its head, a
second tap inside four seconds would send it up — but a takeoff from a
phone's meadow climbs through the words, so on the phone the gull's answer
stays on the ground: the head, then the hop for a hand that stays. The
daisies open over the first minute for a reader who stays.

## The laptop

Untouched by construction: every change is inside the builder's `narrow`
branch, inside the phone-only media rules, or in new phone-only code paths;
the desktop's RNG stream, markup and `window.__world.scape` are compared
byte for byte before and after at 1440×900, 1512×982, 1280×800 and
1165×759 (hashes in the report).

## Gate premises that change

- The room ladder (`free` 90/40/20 → room 2/1/0/−1) is replaced by the
  budget above; `room` is still published (−1 nothing, 0 brow only, 1 the
  strip, 2 the meadow, 3 depth) and `band`/`ground` carry the detail.
- 320×720 no longer takes the "nothing drawn" branch: it draws the ridge
  and the strip. check-dawnscape and ending-sequence keep their `room < 0 →
  0 paths` arm (it is the honest floor for a column that cannot fit) and
  measure 320×720 like any other seat.
- The phone's sun radius scales with the band; `sunSeat` keeps its
  signature.
- The far wood under the band's foot is `.ds-vale` and takes the same mask
  as the range.

## Arrivals on the phone

The owner has two rulings that pull against each other: the 500px phone
budget (`PHONE_ARRIVE`, the Safari round) that fixed "no flow, everything
appears at once" on his iPhone, and parity with the laptop's feel. Measured
on the build that shipped the budget (a slow 6px/frame scroll, all 84
`data-fx` elements): a phone block was opaque only when its top reached
0.43 of the screen (the laptop: 0.71), and a reader who stopped anywhere
saw a half-faded block in the middle of the screen 65% of the time (the
laptop: 39%). The budget was right about the DISTANCE a fade needs at
flick speed and wrong about where it ends — 0.6 of the screen puts the
settle horizon above the line a person reads at.

Two changes, both inside the `phoned` branch so the dusk chain and the
opening frame are untouched and it stays a pure function of scrollY:

- the window is at most half the screen rather than 0.6 of it (393px on
  the owner's 786 panel, still two and a half times the laptop's typical
  156);
- the OPACITY takes a cubic ease-out on the phone (0.95 by 0.63 of the
  window) while the DRIFT keeps the symmetric ease over the whole window —
  the motion still flows for the whole distance, the block is readable
  with its top at ~0.69 of the screen.

| seat | fade span p10/p50/p90 (px of scroll) | settle horizon p10/p50/p90 | stop anywhere |
|---|---|---|---|
| 420×786 before | 96 / 378 / 384 | .34 / .43 / .71 | 64.3% (1.03 elements) |
| 420×786 after | 96 / 300 / 306 | .41 / .61 / .76 | 37.4% (0.40) |
| 402×754 before | 90 / 366 / 366 | .33 / .43 / .70 | 63.3% (0.98) |
| 402×754 after | 90 / 288 / 294 | .40 / .61 / .75 | 36.3% (0.38) |
| 390×844 before | 102 / 402 / 408 | .33 / .44 / .73 | 65.4% (1.04) |
| 390×844 after | 72 / 324 / 324 | .41 / .61 / .78 | 38.2% (0.41) |
| 1440×900 laptop (unchanged) | 78 / 156 / 300 | .40 / .71 / .87 | 39.4% (0.57) |

The "stop anywhere" share is now under the laptop's; the settle horizon
(measured at opacity .99, where the eye has stopped seeing a change long
before) is 0.61 against the laptop's 0.71, and at .95 it is 0.69. What is
NOT measured here is the owner's own thumb on his own phone, which is where
the 500px number came from: if 300px of visible fade reads as "at once"
again to him, the next lever is the curve's exponent, not the window — and
it is pre-armed behind `?arrive=q4` (a quartic ease-out, .95 by 0.53 of
the window; `ARRIVE_Q` beside `PHONE_ARRIVE`), not shipped:

| seat | default (cubic) | `?arrive=q4` |
|---|---|---|
| 420×786 | span 96 / 300 / 306 · horizon .41 / .61 / .76 · stop 37.4% (0.40) | span 96 / 264 / 264 · horizon .45 / .67 / .80 · stop 22.3% (0.22) |
| 402×754 | 90 / 288 / 294 · .40 / .61 / .75 · 36.3% (0.38) | 90 / 252 / 258 · .44 / .67 / .79 · 21.5% (0.22) |
| 390×844 | 72 / 324 / 324 · .41 / .61 / .78 · 38.2% (0.41) | 72 / 282 / 288 · .47 / .67 / .81 · 22.9% (0.23) |

## Round 2 (yoda's "ship after fixes", 2026-10-07)

1. **The exits on a spine.** Each exit was centred in its half, so
   "linkedin ↗" floated over the wider "the working paper ⟶" and the right
   column shared no edge. The two columns now bind to the axis: left pair
   `justify-self:end`, right pair `justify-self:start`, the gutter's centre
   on the column's centre. The gutter is what the widest exit leaves —
   `clamp(1.25rem, 100vw − 352px, 2.5rem)`: 40 at 420 and 402, 38 at 390,
   23 at 375 — because "the working paper ⟶" (140px) starts half a gutter
   east of the axis and must end inside the column. Under 360 the spine
   cannot be centred (the gutter would be negative) and the exits fall
   back to centred-in-half. Measured: spine 210.0 on an axis of 210.0 at
   420, 201/201 at 402, 194/195 at 390, 186.5/187.5 at 375 (the half-pixel
   is the instrument's rounding of link rects); every target 44–45px.
2. **The light is the last thing to go.** The lightless seats (375×667,
   320×720) drew doe, gull and tree and no warm ink under "first light
   again · 06:12". The pool is drawn on every seat that draws anything:
   edge-on on the strip (a 34×7 ellipse at 0.56 W with three gold dashes,
   past the pair), a lens from 40px of ground, a pool with reeds from 56px
   of width. `room` keeps its meaning; `ground.pool` carries
   `edge | lens | pool`. 375×667 and 320×720 read `edge`, the 60px seats
   `lens`, the 110px seats `pool`.
3. **The chevron in the sky** was the far "noticed" crossing on its old
   unlit fallback seat (0.06–0.12 W, 0.15–0.17 H, east at 4°), which on a
   sheet with no band flies straight across the kicker's line. A phone
   without a band spawns no crossing (`spawnFar`, narrow guard); the lit
   seats keep theirs, east of the rock and the light. Measured: no `.bird.
   far` at 320×720 or 375×667 in either engine; one at the lit seats.
4. **The arrivals lever** is armed, above.
5. **The orphaned "1942"** at 320: `text-wrap:balance` on the attribution
   inside the ≤720 block. No size, no tracking, no copy; a one-line caption
   stays one line (375 and up), and at 320 it breaks "T. S. Eliot · Little
   Gidding" / "V, Four Quartets, 1942" — Chromium's most even split, which
   leaves the "V," on the second line; still two lines of a length rather
   than a year alone. The alternatives were measured and declined: the
   natural width is 277px in a 248px box, tracking buys 12, a notch to
   12px buys 21, and it would take both.

Laptop identity after round 2: 13/13 seats hash-identical to the
pre-round build. `check-dawnscape`: green at all 18 seats on the drawing
checks; the 1456×949 sky sit's "first bird within 2s" is a wall-clock
measurement and flaked once while two other browsers shared the CPU
(4.0s on the page's clock); re-run alone it reads as before.
