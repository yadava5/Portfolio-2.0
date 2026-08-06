# The figures — what the archive settled, and what Phase 5 should do with the run's

Written 2026-08-06, with the archive's seven fig. 1 plates as the working
proof of the grammar it proposes. The owner's ask was judgement on "this
fig, and other fig as well" — the first half ships in
`scripts/archive/case-figures.mjs`; this file is the second half.

## The rules the archive plates were built under

These generalise. Each one either came from a settled ruling or from a
defect measured in the run's own figures.

1. **A record does not move.** The ruling on the bench bars — "a gauge
   that fills as you watch is an instrument" — decides the whole
   archive: fig. 1 is the run's figure at its settled frame, authored
   static. The run keeps its instruments; the room keeps the reading.
2. **The seat chooses the edition, by arithmetic.** rendered px =
   authored px × seat / viewBox, floor ~10–11px. The archive's fig. 1
   column (384–518px) sits in the band where the run's own rule serves
   the tight 240-unit plate, so the archive authors ONE edition and
   caps it at the run's 330px tight cap — 11.4–15.1px rendered at every
   viewport. This was checked before drawing, not after.
3. **Budget every label against its line before drawing it.** Fragment
   Mono runs ~6.6 units/char at 11 units; `⟶` and `×` budget as two.
   Two labels in the first cut of the visual-assist plate clipped at
   the frame because this was estimated instead of counted. Anything
   that does not fit moves to the figcaption or a numbered key — it is
   never shrunk.
4. **Anchor annotations to cells, not coordinates.** The Cadence plate
   seats its event chip IN the tuesday grid cell; nothing can cover
   wednesday. Absolute-positioned chips over a grid are how the run's
   fig. 05 bug happened.
5. **One clay moment per plate.** Clay marks the gate/halt/deferral and
   nothing else; pine marks what landed; everything else is ink and
   hair. Where every accent is loud, none is.
6. **The caption carries the claim; the drawing carries only geometry.**
   Numbers appear in a plate only when a committed artifact owns them
   (the Glyph plate's 97.01% and 3.5×, the inventory's three counts),
   and the disclosure line names the artifact.
7. **The aria-label is the figure, spoken.** Full sentences, present
   tense, stating what is drawn AND what is deliberately not (the blank
   input square, the unlit deploy). A redraw that keeps the paths and
   loses the narrative is a regression no gate sees.

## Phase 5 — the run's fig. 02–11, one judgement each

- **fig. 02 (the record card)** — sound. Leave it.
- **fig. 03 (the yard)** — congested in the wide edition: three feeder
  label pairs + three product boxes + the meter share one 330-unit
  height, and the stitch curves cross the label zone. Apply rule 3
  (recount every label), and give the merge more silence: drop the
  per-feeder sublabels to a numbered key under the figure (¹ 5 yrs ·
  1,153 users …). The tight edition is already the better drawing;
  let the wide one learn from it.
  > **AMENDED 2026-08-06 by the owner's design ruling — see §4b of
  > `docs/PORTFOLIO-MIGRATION-PLAN-3-6.md`, which outranks this file.**
  > The numbered key was written under a REPAIR framing. Under the design
  > mandate the default is to EARN THE LABELS THEIR ROOM — re-staged
  > feeders, a better narrow edition, more silence bought with
  > composition — and reach for a key only if the plate is genuinely
  > richer with one. Rule 3's floor law is unchanged and still stands:
  > anything that does not fit moves to the figcaption or a key, and it
  > is **never shrunk**.
- **fig. 04 (the sorting line)** — same congestion class: gate labels
  collide with mark paths mid-scrub because labels sit inside the
  travel corridor. Move gate labels above the frame line (the archive
  plate proves they read fine right-anchored on the rule itself), and
  keep the buckets' labels out of the landing rows.
- **fig. 05 (the parse)** — the chip covers wednesday because chips are
  absolutely positioned over the week grid at measured pixel offsets
  (`cacheCadence` + transforms). Rule 4 is the fix: give the tuesday
  cell the event as a child, and fly the CHIP to the cell's own box
  instead of to a coordinate. The archive's Cadence plate is the
  settled frame of exactly this layout and can be lifted as the target
  geometry.
- **fig. 06 (glyph pad + net)** — instrument; stays an instrument. The
  one improvement worth making is the bench bars beneath it: they are
  scroll-scrubbed fills over committed numbers, which the bench ruling
  already condemns — draw them at full extent, ink the VALUE in on
  approach if motion is wanted.
- **fig. 07 (jetpack split/stitch)** — "deserves better": the drawing
  under-tells the best part, that the stitched member is byte-valid.
  Give the seam the clay moment (it has it) plus a drawn member with
  the `1f 8b` magic lettered at the head — the RFC's own notation, so
  it is grammar, not a claim. The lanes read as plumbing; let blocks
  visibly NARROW through deflate in both editions (the wide one does;
  the tight one barely registers it).
- **fig. 08 (the climb)** — unpolished mostly in the pencil half: the
  two unbuilt steps read as faint clutter rather than absence. Heavier
  dash (5 7 at 1.4) and the `held` tags seated on the risers, not
  floating; and the climber's ring should be the ONLY clay (the held
  tags currently compete — rule 5).
- **fig. 09 (automl)** — text overlapping the fields: the registry
  column starts at x 398 while cell rows run to x 360 and the caveat
  line crosses at y 226 — three systems sharing one x-band. The archive
  plate solved this by going fully vertical (supervisor → notebook →
  registry → rail); the run's wide edition should adopt the same
  stacking for the registry (under the notebook, not beside it) or
  widen to a 620 viewBox. Note the archive also dropped "timing staged"
  because nothing is timed in a still — the run keeps it; the two
  wordings are both correct for their surface.
- **fig. 10 (the reviewer's marks)** — "unresolved" because it is a
  docket wearing a figure number: the marks draw, but the plate has no
  geometry of its own. Two honest options: demote it (it is apparatus,
  not a figure — let the caption number go to the litany's ledger), or
  give the marks their subject — three miniature gate squares on a
  short rail, each mark drawn AT its gate, so the plate shows gates
  being judged rather than three floating glyphs. The second keeps the
  page's figure count stable.
- **fig. 11 (the references)** — a citation card, correctly so. Leave
  it; its restraint is the design.

## What died with the React scenes, on purpose

The four "living scenes" (3,158 lines) each performed a one-shot drawn
run of the same subject their run-figure already animates. The archive
does not replay the run at card scale — that was the scenes' real job
description, and it is the instrument/record confusion again. Their
settled frames, their honest captions and their manifest disclosures
survive in the static plates; their motion belongs to the line, which
still has it.
