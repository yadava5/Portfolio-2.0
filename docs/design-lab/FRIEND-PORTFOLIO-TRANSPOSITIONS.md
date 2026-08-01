# Friend portfolio — inspiration transpositions (shreechaturvedi.com)

Toured 2026-07-18 in the user's real Chrome (hover + rAF entrance animations
captured live). Purpose: harvest the admirable, transferable ideas from a
friend's portfolio and re-express them innovatively in OUR working-paper
grammar (ink/paper/stamps/thread/receipts, day-arc, Fraunces/Newsreader/
Fragment Mono on cream). Never copy — transpose, the way "AutoML decimal
phase numbers → report clause numerals" was transformed, not transplanted.
Grammar reference: `docs/design-lab/DECISION.md` + `docs/design-lab/DOSSIER-SPEC.md`.

Tone note: this is a friend's site and a genuinely excellent one. Everything
below is written as admiration + "how would OUR world say this," never critique.

Scope of tour: home (hero entrance reloaded + timed, every hover, full scroll to
footer), /work index, two case studies deep (auto-ml, fast-mnist-nn) + all 9
projects read on the index, /blog, /resume, the ⌘K command palette. Mobile
reflow could not be genuinely captured (window resize did not reflow the
screenshot canvas), so no mobile claims are made here — our own DOSSIER already
carries the 390px thread-gutter fix.

Striking coincidence worth stating plainly: the friend is Miami University, same
grad window, and ships a **near-identical project set** — auto-ml, fast-mnist-nn,
taskflow-calendar, etc. So these aren't abstract references: his case studies are
a direct, side-by-side answer to "how do I present *these exact projects*
honestly." Notably his fast-mnist page scopes the SIMD claim precisely
("~3.5× DOT-PRODUCT SPEEDUP · 256×256 · blocked GEMM tiling") — the very
precision our own DOSSIER flagged we still owe on the same project.

---

## (a) Inventory — the design language & every distinctive element

**System, one line:** a dark (near-black) editorial-technical portfolio; one
neo-grotesque display face + a humanist body sans + a mono (Fragment-Mono-like)
for all apparatus; **two-tone-per-context accents** keyed to a category
taxonomy (green/amber/blue/violet); GSAP + Lenis motion; the whole site reads as
*engineering documentation that happens to be beautiful* — every claim carries a
number and a source.

Distinctive elements observed:

- **Name entrance** — "Shree" loads solid white, then **rasterizes into a
  halftone dot-matrix** (letterforms made of dots ≈ pixels/MNIST samples) and
  holds there; "Chaturvedi" is a static **stroke-only outline** beneath it.
  Filled-vs-outline is the signature.
- **Generative flow-field** — a blue particle/vector field swirls into the top
  right over ~3–4s (neural-flow / gradient-descent atmosphere).
- **Live inference hero** — a rotating 3D neural net + an MNIST "7" panel; a
  "run a sample" button actually runs it and prints a mono readout **"READ 7
  100%"**. The thesis ("the AI that runs on them") is *demonstrated*, not stated.
- **Corner registration crop-marks** (`+` at page corners) + a **measurement-
  ruler tick line** above the CTA — print-production apparatus.
- **Shared sliding nav underline** — one indicator glides between nav items on
  hover; the ⌘K search pill gets a blue border on hover.
- **Category taxonomy** — every project/post carries a glyph+color pillar mark:
  **▲ green [AI]**, **■ amber [DATA]**, **◆ blue [SYS]**, **● violet [MATH]**,
  plus a "· DEMO" sub-tag when a live demo exists. Numbers pick up the pillar hue.
- **Home "Cool projects." list** — alternating L/R zigzag; each entry = pillar
  tag → huge lowercase title → prose → **mono stat-badges with domain glyphs &
  colored numbers** ("12 MCP tools", "246 test files", "634 frontend tests
  passing") → bracketed **"[ OPEN CASE STUDY → ]"** that inherits the pillar hue
  on hover → a **bespoke 3D isometric render** (domain-shaped: pipeline nodes,
  keyboard, voxel net, AST tree) with a **tech-stack icon tray** that assembles
  on scroll.
- **Embedded home sections** — Resume timeline (monogram + role + mono
  date-range rows, hairline rules) and Blog ("My thoughts", numbered 01/02 post
  cards cross-linked to their source project) — both **fade+deblur in on scroll**.
- **"[ SECTION ] … § descriptor" headers** — every section label is a bracketed
  mono tag on the left with a witty right-aligned **§ descriptor** ("§ an open
  log", "§ notebook · open log"). The § section-sign recurs as apparatus.
- **Contact** — "graduated may 2026 · looking for" kicker → "The next hard
  problem." → deck *"…where correctness gets checked instead of claimed"* → a
  parallax b/w portrait panel (light, a deliberate contrast beat).
- **Footer colophon** — "BUILT WITH" tech list (Next.js 15 · React 19 ·
  TypeScript · Tailwind v4 · GSAP · Lenis + "source on GitHub") | "REACH"
  contact column | © line, closing on a **giant outline "SHREE" wordmark being
  pen-traced** by a highlight (a line drawing itself).
- **/work index** — kicker "/ WORK · INDEX · **9** projects across 4 pillars",
  headline "**Nine systems, strongest first.**", deck **"Each case study names
  what it cost to build."**, then a **pillar-legend row** (each pillar: glyphs,
  name, project count, folio number). Lazy-renders one project at a time.
- **Case-study grammar** (auto-ml + fast-mnist deep):
  - Kicker dateline: `▲ [ AI ] · AUTO-ML · SHA 1168651 · MEASURED-IN-REPO`
    (pinned commit + an evidence-hygiene badge).
  - Display headline with **colored/outline accent words** ("whole", "guard",
    outline "CPU", blue "fast").
  - **Dictionary-entry sidebar** — `[ AUTO-ML ], NOUN — 1. an agent that drives
    the whole ML lifecycle. 2. and never runs its own code in-process.` + tag
    chips (AGENT/MCP/SANDBOX).
  - **Mono spec-sheet** (dot-leader): PILLAR / LANG / LICENSE / SIZE / BASELINE /
    HARNESS, label-left value-right.
  - **Evidence stat band** — big mono numbers ("~137k LOC", "~2,208 tests") with
    caption *"every figure counted from the source tree at the pinned commit."*
  - **Numbered narrative sections** (01, 02…) with running dateline headers (or a
    cleaner `01 —— PROBLEM / 02 —— APPROACH` tab), prose with **inline mono
    code-chips** (`run_cell`, `posix_memalign`) + colored keyword emphasis, each
    section closing on a **"§ SCOPE" metric strip** framed by hairline rules with
    exact **file:line** refs (`PIPELINE.TS:394-441`).
  - **Animated two-color architecture diagram** — draws itself on scroll: **solid
    green = success path, amber-dashed = the bounded auto-repair loop**; caption
    cites source files/lines + a legend for its own colors.
  - **KEPT-badged decision cards** ("Two decisions I kept, two boundaries I did
    not cross").
  - **Receipt cards** with decomposed provenance ("~2,208 test cases — 1,229
    backend + 908 frontend + 71 landing") + a **mono security-flags table**
    (`--read-only` → "immutable root filesystem…").
  - **THE UNEARNED NUMBER** — a callout that *proactively retracts* an unproven
    résumé claim: *"There is no committed '7x faster' benchmark… The system is
    real and the engineering is auditable. The headline speed number is not yet
    earned."*
  - **Evidence gallery** — numbered screenshot plates with mono captions
    ("ENGLISH TO SQL, VALIDATED READ-ONLY 03"); **i/ii/iii Roman-numeral
    explanation cards each footnoted with a source line** (`src/Matrix.cpp:34`).
  - **Close** — action buttons ("VIEW THE REPOSITORY ↗" / "ARCHITECTURE WIKI ↗" /
    "← ALL WORK") + provenance colophon ("pinned at sha 1168651 on main · GPL-3.0
    · all figures & receipts counted from the repository at that SHA").
- **Consistent "where I lose" honesty** across projects (my-stl "flat_map runs
  0.378× of std::map"; entropy "loses on point selects by 2.0–2.6×").
- **/blog** — "Build notes", deck framing posts as **"evergreen by design… the
  parts of a project that stay true after the commit"**; spec-card (NOTES 05 /
  PILLARS / MATH katex, server-rendered / SOURCE my public repos); numbered,
  dated, pillar-tagged post rows cross-linked to their project + topic-chips.
- **/resume** — big name + "[ COPY LINK ] [ DOWNLOAD PDF ↓ ]"; numbered sections
  (01 Education / 02 Experience); monogram + role + mono date-range rows; **every
  metric amber-highlighted** ("547K+", "60%", "$22M", "84%").
- **⌘K command palette** — Linear/Raycast-style modal; **verb-prefixed rows**
  ("GO Work → /work", "RUN Copy email address → …", "RUN Open GitHub → …") with
  mono right-aligned targets; matches pages/actions only (a wayfinding
  accelerator, not full-text search).

---

## (b) The good parts — ranked, with WHY

1. **The "unearned number" honesty apparatus** (measured-in-repo · counted-at-
   sha · the 7×-benchmark retraction). WHY: it turns integrity into a *design
   feature*. Proactively naming what the repo does **not** yet prove converts the
   site's biggest liability (unverifiable claims) into its most convincing
   artifact. This is precisely our own thesis (self-honesty lines, "still in
   review") — the friend proves it *scales into a coherent system*.
2. **Per-section "§ SCOPE" strips with file:line provenance.** WHY: every claim
   is auditable *inline*, and the strips give the long-form a rhythmic spine.
   Documentation cadence, not portfolio fluff.
3. **The live "run a sample" hero.** WHY: it *demonstrates* the thesis instead of
   asserting it. One click, one honest readout — the single interaction a visitor
   remembers, and it earns trust no adjective can.
4. **A name entrance built from the material of the craft.** WHY: the identity
   and the concept fuse — the name is literally made of the thing he builds
   (sample dots / a net's pixels). Memorable *because* it's meaningful.
5. **The pillar taxonomy + "9 systems, strongest first" index.** WHY: a project
   list becomes a legible *system* with a spine — glyph + count + folio + a deck
   ("names what it cost to build") that sets the reading contract up front.
6. **Mono stat-badges / receipts on every card.** WHY: quantified evidence at a
   glance, everywhere; the eye never has to trust a vibe.
7. **Dictionary-entry + spec-sheet apparatus.** WHY: an editorial voice that
   *reads as documentation* reinforces the rigor claim at the level of form.
8. **Colophon ("BUILT WITH") + "§ open-log" section descriptors.** WHY: print-
   shop honesty — telling you how it was made is itself a credibility move, and
   the witty § tags give apparatus a personality.
9. **Consistent "where I lose" framing.** WHY: disclosed tradeoffs (0.378×,
   loses point-selects) read as *more* credible than uniform wins.
10. **Registration crop-marks + ruler tick-bar.** WHY: production marks quietly
    sell the "this is a document/artifact" frame before a word is read.

---

## (c) Transpositions — into the working-paper grammar

The bar: transformed, never transplanted. His material is **screen/neon/3D/data-
dots**; ours is **ink/paper/letterpress/stamps/thread**. Same rigor, different
substance.

- **[1] "Unearned number" → a reserved-clay `HELD` stamp on unproven claims.**
  His retraction is a *section*; ours becomes a **stamp**. Because clay is
  reserved for decisions/gates, an honestly-withheld claim IS a gate: over the
  "7× faster" figure, thud a distressed dashed-orange **`HELD — CLAIM NOT YET
  PROVEN`** stamp, with a Newsreader footnote resolving *what the repo does prove*
  ("auditable: LOC, tests, migrations, sandbox flags — pending: a committed run
  ledger"). The one place clay ever touches a *claim* is where we're withholding
  proof. This is the sharpest possible expression of our one-clay discipline and
  it directly executes DOSSIER's "published 'held' gates = a trust rise."

- **[2] "§ SCOPE" strips → the thread's chapter-baseline scope line.** Adopt the
  §-strip almost wholesale, just re-inked: each chapter/case section closes with
  a Fragment-Mono dot-leader strip the hand-drawn **thread crosses** on its way
  down the margin — `§ scope · backend 54k · frontend 83k · 246 *.test.ts ·
  src/preprocessingRuntime.ts:91–161`. His color-coded file refs become **thread
  citation endpoints** (DOSSIER's "rows branch a pen-stroke to the fig they
  cite"). The § sign is native print apparatus; this is the lowest-friction,
  highest-texture borrow on the page.

- **[3] Live "run a sample" → a one-click "run the audit" that inks the
  receipts.** Transpose the *energy* (interactive proof), not the mechanic. On a
  case file's validation table, a **"run the audit ▸"** control walks the
  receipts column top-to-bottom, ticking each row's checkmark **PINE** one at a
  time (claim → probe → result), and terminates by thudding the clay **`APPROVED`**
  stamp on the appendix. His net reads a digit; ours *checks its own evidence*.
  This is exactly DOSSIER's "stampable registry row — reader inks approved on 041,
  world-mechanic = product thesis," finally given the friend's spark of
  *interactivity*.

- **[4] Halftone name → a masthead that "inks in" from engraving stipple.** His
  letters are made of **screen halftone dots (pixels/samples)**; ours should be
  made of the material of *print*. On load under the dawn light, the Fraunces
  masthead **develops from fine ink STIPPLE → solid** — letterpress dot-gain /
  banknote-engraving shading absorbing into the cream, not a digital screen. The
  surname stays a **pen OUTLINE the terminating thread completes** (mirrors his
  outline "Chaturvedi" *and* our footer pen-trace). The day-arc "develops" the
  ink the way light develops a print. Transposition rule made explicit: *his name
  is rendered in the substance of his craft (net samples); ours in the substance
  of ours (ink on paper).*

- **[5] Color taxonomy → inked pillar marks differentiated by FORM, not hue.**
  One-ink+one-clay forbids 4 accent colors, so re-key the taxonomy to **fountain-
  pen glyph + fill-texture**: systems = solid-ink triangle, math = stippled
  circle, data = hatched square, AI = outline diamond. The /work legend ("9
  across 4 pillars, strongest first") becomes our **evidence index masthead**:
  *"the file index · nine case files · four folios · filed strongest-first."*
  Counts and folio numerals in mono; the "cost to build" deck kept verbatim in
  spirit ("each file names what it cost").

- **[6] Stat-badges → inked receipts strips.** Each home work-row carries a 3-up
  Fragment-Mono receipts strip, but emphasis comes from a **thin red-thread
  underscore / tally-mark under the numeral**, not color — `12 · mcp tools ·
  246 · test files`. Domain glyph = a tiny inked mark, not an emoji icon.

- **[7] Dictionary-entry → a printed glossary block.** Open each case file with a
  **technical-dictionary definition** set in Newsreader italic + mono:
  *"auto·ml, n. — 1. an agent that drives the whole ML lifecycle. 2. and never
  runs its own code in-process."* Pure editorial apparatus, dead-on our voice.

- **[8] Spec-sheet + Roman-numeral source cards → margin clauses with citation
  thread.** His `PILLAR/LANG/LICENSE/SIZE` dot-leader = our **META-AS-LEDGER**
  table (DOSSIER §3), kept. His `i/ii/iii … src/Matrix.cpp:34` cards = our
  **numbered decision/detail clauses** ("d1 —") whose file:line footnote is drawn
  as a **thread stroke branching to the figure it cites**.

- **[9] Two-color architecture diagram → the one continuous ink line becomes the
  gated loop.** His green-success / amber-dashed diagram is *already our plan*
  (DECISION: "the line becomes each chapter's hand-drawn diagram; passed nodes
  tick PINE; clay for gates"). Confirm the transposition: **ink = the path,
  PINE ticks = validated nodes, clay = the approval gate, a hand-wobbled
  amber-dashed ink return-stroke = the auto-repair loop.** His diagram validates
  that topology should *shape* each figure (DOSSIER: automl gated-loop vs
  jobtracker linear) — do not photocopy one diagram across files.

- **[10] Colophon + crop-marks + ruler → literal printer's marks.** Adopt the
  two-column footer as a real **printer's colophon**: "set in Fraunces /
  Newsreader / Fragment Mono · two inks, one clay · composed by hand" | "reach".
  Faint **ink crop-marks** at page corners (paper trimmed from a press sheet) and
  a **ruled tick-scale** under the hero that doubles as the **day-arc scrubber**.
  "[ SECTION ] … § descriptor" headers → adopt directly, ink-skinned.

- **[bonus] ⌘K palette → a card-catalog lookup.** A command palette styled as a
  library **index card** ("go to file · run action", typewriter caret). Nice-to-
  have; low priority.

---

## (d) Gentle notes — where our world simply solves it differently

Framed as difference, not criticism — his choices are right *for his world*.

- **Dark, neon-accented, WebGL-3D atmosphere.** Beautiful and dusk-native — but
  our DECISION.md *deliberately* chose the day-arc + recruiter-light readability
  over exactly that (candidate B's dark "= the portfolio crowd"). Our counter-
  move is discipline: two inks + one clay on warm paper. We don't chase the glow;
  we chase the *document*.
- **Four category colors.** Gorgeous signal, incompatible with one-ink. Our world
  differentiates by inked **form/texture**, so the restraint reads as a system,
  not a limitation.
- **Per-project bespoke 3D isometric renders + GSAP/WebGL.** Stunning, but heavy
  (a real perf/animation budget). Our equivalent — the hand-inked `fig.` diagram
  — is lighter, more on-voice, and prints. We take the *idea* (domain-shaped
  figures), not the literal 3D.
- **"Cool projects." heading.** A touch casual against an otherwise rigorous
  voice; our filing-apparatus voice would title it *"selected evidence" / "the
  case files."* (Difference in register, not quality.)
- **No true "next case file →" continuity** (he closes on "ALL WORK"). Our
  DOSSIER §8 already improves here: the thread exits toward *"next file:
  jobtracker →"*, so the reader is handed down the filing cabinet, not back to
  the top.
- **Live one-shot demo.** His "run a sample" fires once; our stamp/audit
  interaction should stay **reversible and un-gimmicky** — a receipt you can
  re-check, not a party trick.

---

## (e) Verdict — what's actually worth building

Three, in leverage order. (S/M/L = rough build effort.)

1. **`HELD` stamp for unproven claims — the "unearned number," transposed.**
   **Effort: S (~0.5–1 day).** Reserved-clay dashed stamp + a Newsreader "what's
   proven vs pending" footnote, applied first to the flagship's speed claim.
   Highest leverage because it IS our thesis and DOSSIER already predicts
   published "held" gates raise trust — the friend just proved it composes into a
   system. Do this first.

2. **"Run the audit" receipts interaction + "§ scope" provenance strips.**
   **Effort: M (~2–3 days).** Merge his §-strip provenance (file:line, thread-
   crossed) with his live-demo *energy*: a one-click walk that ticks each
   validation row PINE and thuds `APPROVED`. This is DOSSIER's stampable-registry
   elevation ("the move nobody else has") finally made interactive — the single
   most differentiating thing on the friend's site, re-authored in our grammar.

3. **Masthead that "inks in" from engraving stipple under the dawn light.**
   **Effort: M–L (~2–4 days, canvas/SVG stipple + scroll/day-arc coupling).** The
   signature entrance, transposed from screen-halftone to letterpress dot-gain,
   with the surname completed by the pen-thread. Highest craft payoff, highest
   risk — schedule it *after* 1 and 2 land, and time-box the stipple render.

Cheap bonus if a spare hour appears: adopt the **dictionary-entry opener**,
**"[ section ] … § descriptor"** headers, and **ink crop-marks + ruler-as-day-
arc-scrubber** — pure apparatus, entirely on-grammar, near-zero risk.
