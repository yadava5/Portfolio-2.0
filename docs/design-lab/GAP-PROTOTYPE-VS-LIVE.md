# The prototype vs the live site — the complete gap, measured and looked at

Both surveyed at 1440×900, scrolled end to end, nine matched proportional
frames each. `story-the-long-run.html` vs `yadava5.github.io/Portfolio-2.0`.

## The structural numbers

| | live site | prototype |
|---|---|---|
| document height | 10,919px | **13,632px** |
| **words of content** | 1,606 | **2,092 (+30%)** |
| **narrative beats** | 7 chapters | **11 beats** |
| `<canvas>` | **0** | **4** |
| `<svg>` | 40 | 9 |
| links | 63 | 28 |
| hoverable elements | 172 | 31 |

Two of these cut the other way and are worth stating: the live site has **more
links, more hover affordances and four times the SVG**. It is not poorer
everywhere. What it lacks is specific.

## What the live site is missing — the five real gaps

### 1 · The travelling token — the thing that makes it a *run*

The prototype draws **one continuous red thread down the entire page**, and a
**token physically travels it** — a small envelope/mail mark that moves from
station to station, arriving at each headline and terminating in a dot at the
title. It is the spine of the whole conceit: you are watching a run move.

The live site has a thread, but it is **segmented per chapter, static, and
carries nothing**. Nothing travels. The dotted line at the left edge is
scenery, not a vehicle.

**This is the single biggest gap.** It is what "moving with the viewer" means
structurally — there is an object making the journey with you.

### 2 · The running head — live run state

Prototype, top right, always present and updating:

```
run 042 · 13:15 · cadence
```

The run id, the *clock* (which advances with the day arc, 06:12 → 22:41), and
the station you are currently in. The live site's masthead carries navigation
and a name. **No state, no clock, no sense of position in a run.**

### 3 · The corner manifest — a ledger that fills as you go

Prototype, bottom right:

```
run 042 — manifest  1 / 6
```

It **stamps a line per station as the token passes**, and at the end it lands
in the gate ledger. The reader accumulates a record of where they have been.
The live site has a chapter rail with checkmarks — closer to a nav than to a
record — and it does not fill, stamp, or resolve into anything.

### 4 · Four canvases doing continuous work

The prototype runs **4 `<canvas>` elements**; the live site runs **zero**. That
is the ink wash, the thread rendering and the figure surfaces — drawn
continuously against scroll rather than composed once as SVG. This is the
mechanism behind "the world moves with you," and it is entirely absent.

### 5 · 30% more content, across 11 beats instead of 7

The prototype is a longer, denser read: **2,092 words over 11 beats** against
**1,606 over 7 chapters**. The owner has said twice that the portfolio should
be *bigger* than its projects. The prototype is already the bigger version and
the live site is the abridgement.

## What the live site does BETTER, so nothing gets thrown away

- **Richer text machinery**, measured by channel: blur **50 vs 0**, masks
  **50 vs 0**, clip-path **50 vs 1**, letter-spacing **50 vs 0**, variable font
  axes **68 vs 0**, split word/line nodes **65 vs 14**.
- **More interactive**: 172 hoverable elements against 31.
- **Four times the SVG** — the scene figures are more elaborately drawn.

**So the live site has the better vocabulary and the prototype has the better
architecture.** That is the honest summary, and it explains the owner's
reaction precisely: production's superior machinery fires once and freezes, so
nobody sees it work, while the prototype's simpler vocabulary is bound to
scroll and therefore feels alive and advanced.

## The order to fix it in

1. **Scroll-coupling** (round 11, already in flight) — makes the existing
   machinery visible. Cheapest, largest perceived gain.
2. **The travelling token** — the thread becomes one continuous line with an
   object moving along it. This is the conceit the whole prototype is built on.
3. **The running head and the corner manifest** — run state and an accumulating
   record. Both are small, and together they are most of what makes the page
   feel like an instrument rather than a document.
4. **The content gap** — 11 beats, 2,092 words. Content work, not motion work,
   and it should be scoped separately.
