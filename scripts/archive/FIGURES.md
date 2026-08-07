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
3. **Budget every label against its line before drawing it.** ~~Fragment
   Mono runs ~6.6 units/char at 11 units; `⟶` and `×` budget as two.~~
   Two labels in the first cut of the visual-assist plate clipped at
   the frame because this was estimated instead of counted. Anything
   that does not fit moves to the figcaption or a numbered key — it is
   never shrunk.
   > **AMENDED 2026-08-06 — THE CONSTANT WAS WRONG AND FOUR FIGURES WERE
   > DRAWN AGAINST IT.** Measured with `getComputedTextLength()` on real
   > nodes in both editions, not estimated: **8.012 units/char** in the
   > wide edition (12px + `letter-spacing:.05em`) and **7.125** tight
   > (11px + `.03em`). The old figures are the bare glyph advance with
   > letter-spacing omitted, so **every label budget on this site was
   > running ~10% short** — that is how `sqlite · 57.8m rows` was authored
   > to end 4 units inside its box and ended 4 units outside it.
   >
   > The per-glyph half was wrong in the other direction: `×`, `—`, `’`
   > and `·` are **one** advance each in this mono face, not two. Only
   > `⟶` is wide — **13.355 units wide / 12.018 tight, about 1.67**.
   >
   > **The method is now the rule: measure with `getComputedTextLength()`,
   > do not budget per character.** It was measured ONCE, BY HAND, during the
   > §4b redraw — `getBBox()` over every `<text>` in every drawing at twelve
   > widths, 1,526 boxes, zero overflows. **That was a one-off measurement and
   > is NOT a standing gate**: the tight editions are read by nothing, because
   > their viewBox is written at run time. Do not cite it as coverage. The
   > floor law above is unchanged and still stands.
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
  > **RESOLVED 2026-08-07 (§4b).** The labels got their room: four named
  > columns on one header rule that breaks for each name, feeders moved into
  > their band beside the product they become. No key, nothing shrunk. The
  > compliance meter now STANDS SETTLED at 97% — it used to fill from zero
  > under the scroll, which the bench ruling condemns.
- **fig. 04 (the sorting line)** — same congestion class: gate labels
  collide with mark paths mid-scrub because labels sit inside the
  travel corridor. Move gate labels above the frame line (the archive
  plate proves they read fine right-anchored on the rule itself), and
  keep the buckets' labels out of the landing rows.
  > **RESOLVED 2026-08-07 (§4b), and the congestion was the smaller half.**
  > The plate drew a pipeline; the machine is a CASCADE — `hybrid.py:248`
  > returns at 0.90 and never imports the rest. And `needs-review` was drawn as
  > a fourth bucket when it is a boolean on a result that still carries its
  > category. One belt, three desks, a held band.
- **fig. 05 (the parse)** — the chip covers wednesday because chips are
  absolutely positioned over the week grid at measured pixel offsets
  (`cacheCadence` + transforms). Rule 4 is the fix: give the tuesday
  cell the event as a child, and fly the CHIP to the cell's own box
  instead of to a coordinate. The archive's Cadence plate is the
  settled frame of exactly this layout and can be lifted as the target
  geometry.
  > **RESOLVED in Phase 5.** The event is a cell and the chips file into a
  > dock; measured at four widths in a real engine.
- **fig. 06 (glyph pad + net)** — instrument; stays an instrument. The
  one improvement worth making is the bench bars beneath it: they are
  scroll-scrubbed fills over committed numbers, which the bench ruling
  already condemns — draw them at full extent, ink the VALUE in on
  approach if motion is wanted.
  > **DONE in Phase 5 (§5.5/§5.2).** `scrubBench`/`scrubJetBench` are gone; the
  > ratios are fractions in the markup bound to four vendored JSON records, and
  > five browser engines measure the rendered widths. This bullet is history.
- **fig. 07 (jetpack split/stitch)** — "deserves better": the drawing
  under-tells the best part, that the stitched member is byte-valid.
  Give the seam the clay moment (it has it) plus a drawn member with
  the `1f 8b` magic lettered at the head — the RFC's own notation, so
  it is grammar, not a claim. The lanes read as plumbing; let blocks
  visibly NARROW through deflate in both editions (the wide one does;
  the tight one barely registers it).
  > **RESOLVED 2026-08-07 (§4b), and it went further than this asked.** The
  > member is drawn as one object — `1f 8b 08`, eight blocks abutting so each
  > join draws once, `crc32 · isize` — and the ONE clay moment is the trailer,
  > sealed by the last block to land. Blocks narrow on eight hand-authored
  > widths that no measured ratio may ever replace.
- **fig. 08 (the climb)** — unpolished mostly in the pencil half: the
  two unbuilt steps read as faint clutter rather than absence. Heavier
  dash (5 7 at 1.4) and the `held` tags seated on the risers, not
  floating; and the climber's ring should be the ONLY clay (the held
  tags currently compete — rule 5).
  > **SUPERSEDED 2026-08-07 (§4b).** A heavier dash makes absence louder, not
  > legible — absence is a relation, and there was nothing for it to relate to.
  > The stair is drawn in section: three built steps close into a hatched mass
  > on the ground, and the two unbuilt steps have NOTHING beneath them. The
  > `held` tags STAY clay: a disposition of record may repeat in clay, and the
  > ledger rows beside the plate are already clay.
- **fig. 09 (automl)** — text overlapping the fields: the registry
  column starts at x 398 while cell rows run to x 360 and the caveat
  line crosses at y 226 — three systems sharing one x-band. The archive
  plate solved this by going fully vertical (supervisor → notebook →
  registry → rail); the run's wide edition should adopt the same
  stacking for the registry (under the notebook, not beside it) or
  widen to a 620 viewBox. Note the archive also dropped "timing staged"
  because nothing is timed in a still — the run keeps it; the two
  wordings are both correct for their surface.
  > **AMENDED 2026-08-06 — see §4b.** The "widen to a 620 viewBox"
  > alternative is CLOSED at the current 515 seat: the edition
  > arithmetic built in Phase 5 measures it at 9.97px against this
  > brief's own ~10px floor. Stacking is the default; widening only
  > works if the seat minimum rises with the box.
  > **RESOLVED 2026-08-07 (§4b) — this was the vocabulary-setting plate.**
  > Stacked, paid for entirely in height (372 → 532; the gate reads WIDTH only).
  > The supervisor→tools→notebook loop is drawn, the docker sandbox is a frame
  > only the tools' stem crosses, and the bead stands SHORT of a boom still down
  > — the ring used to cover the shut gate it was about.
- **fig. 10 (the reviewer's marks)** — "unresolved" because it is a
  docket wearing a figure number: the marks draw, but the plate has no
  geometry of its own. Two honest options: demote it (it is apparatus,
  not a figure — let the caption number go to the litany's ledger), or
  give the marks their subject — three miniature gate squares on a
  short rail, each mark drawn AT its gate, so the plate shows gates
  being judged rather than three floating glyphs. The second keeps the
  page's figure count stable.
  > **AMENDED 2026-08-06 — see §4b. THE FIRST OPTION IS CLOSED.**
  > Demotion was rejected at the Phase 4 checkpoint (¶10 is a destination
  > two archive files rejoin into, not apparatus between stations) and the
  > owner's design ruling rejects it again. fig. 10 gets the drawing. §4b
  > carries the two constraints it has to satisfy: `check-figures` asserts
  > exactly six drawings and forbids `role="img"` on this plate, and
  > `check-palette` does not read `#gatesFig` selectors.
  > **Rule 5 also bites wrong here unless read with its amendment**: the
  > two refusal marks are ALREADY clay (`.grow.refused .gmark`), and
  > refused-twice is the recorded fact. See §4b's RULE 5, AMENDED.
  >
  > **RESOLVED 2026-08-07 (§4b) — the LAST of the six drawn. It is no longer unresolved and this entry's
  > diagnosis above is now history rather than a description.** The plate
  > has geometry: one line runs down the register, each gate stands ON it
  > as a small frame inside its own row, the row's mark is inked INSIDE
  > that frame, and below the third gate the line runs on dashed under a
  > label reading `unsigned`. At scrub 0 the three gates stand unstamped —
  > a resting state three floating glyphs could not have.
  >
  > Both §4b constraints held rather than being traded away: the drawing
  > wears its own class (`gbench`), never `figsvg`, so the six-drawing
  > assertion is untouched; it is `aria-hidden` on the marks' own
  > precedent, so no `role="img"` enters the block and the docket's words
  > stay the accessible content. The frames are `--hair-strong` STRUCTURE
  > and the marks carry the clay, which is §4b's own answer to "five clay
  > elements". **`check-palette` now scans `.gbench` alongside `.figsvg`,
  > so the night-contrast rule is a measurement here and not an
  > instruction** — narrowly, because scanning all of `#gatesFig` reds at
  > HEAD on the `--hair` row separators, which are a text plate's rules
  > and not graphical objects.
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

## The appendix, ruled 2026-08-07

The appendix exists for artifacts a reader can OPEN — captures and
documents that are evidence in themselves (the expo poster, the presenter
deck, the outbound repo index). It is not a third place to say what
fig. 1, fig. 2 and the ledger already say.

- The React era's seven appendix SVGs (four Tailwind-dark architecture
  diagrams, two dark ledger thumbnails, one stock placeholder) restated
  fig. 2 and the ledger table in a foreign hand — Inter-falling-to-Arial
  over slate/emerald/violet on this site's cream paper. **Retired, and
  deliberately NOT redrawn**: a native redraw would duplicate fig. 2
  in-house, which is the same defect in the site's own inks. The redraw
  set for this purge is empty, and that is the judgement, not an omission.
- A file with nothing a reader could open states the absence
  (`§ artifacts — none beyond the page` + `.noplates`) instead of padding
  the shelf. For the two institutional files that is a boundary kept, and
  the page says so.
- **Static vs animated, settled by the standing law**: a FIGURE may
  scrub, a RECORD may not — and everything in a case file is a record.
  The only motion the archive permits is the reader's own act (opening a
  viewer, pressing approve, walking the audit); nothing replays, fills,
  or scrubs. This holds for any future appendix content too.
- The raster product captures are the owner's to re-shoot or drop; the
  renderer handles every count from zero up, so no shelf state blocks his
  call. There are two left, and the sentence used to say three:
  `automl.webp` was retired on 2026-08-07 with its case-file plate, and
  `taskflow.png` stopped being a local mock-login capture the same day —
  it is now the production interior, signed in as the demo account. That
  leaves `mnist.webp`, whose boundary field still says the native
  inference server was offline during capture, and which is the one plate
  here that is still a local workbench shot.
