# PROJECT LEDGER — the Daylight Study rebuild, complete record

> The canonical compact history. Memory points here; every detail lives in
> docs/scorecards/, docs/design-lab/, and the git log of `redesign/daylight-study`.

## What was built (Phases 0–2 + the dossier arc), all on PR #5

| Arc | Ships | Score path |
|---|---|---|
| Phase 0 — clean slate | 7 commits: effects/theme machinery deleted, next/font, honest metrics, demotions, WebP ≤300KB | gates green |
| Phase 1 — the world | tokens+fonts (95) · scroll engine (98) · light-field+day-arc (97) · 7-chapter shell (4 critique iterations, 74→craft-complete) | dual-lens loop born |
| Phase 2 — thread & motion | red thread w/ ink physics (visitor 85 "SOTD-shortlist… That's authored") · §3.8 text choreography + rail audit-trail | 99/88/99 gates |
| Dossier arc — the evidence | case files as archive-cream dossiers · /evidence crosswalk · receipts tables w/ method slips + repro commands · SIMD-attribution honesty fix | journey 68/64/54 → **86/86/72** |

**Standing verdicts:** "Tell the hiring manager the docs are trustworthy — every
receipt resolved, every artifact matched its claimed number" (staff-eng lens) ·
"Best evidence hygiene I've seen from a new grad" (recruiter) · "The seam is
gone — the same author's filing cabinet" (visitor).

## The system that got us here (keep using it)
Build → gates (typecheck/lint/prettier/contrast/proof/build/12-spec ×3 browsers)
→ fresh-eyes critics (recruiter + visitor + evidence) → ranked fixes → iterate
→ ship. Rules: docs/NO-LIST.md absolute · no invented numbers ever · honesty
failures are P0 · docs/BUILD-RUBRIC.md carries amendments A1–A8.

## Architecture facts (do not relearn)
Single Lenis+ScrollTrigger rAF loop (A1, `useLenis`) · day-arc = oklch channel
scrub + PROVEN dusk step (no continuous path holds AA) · thread = 7 per-chapter
px-space SVG segments (content-visibility rejected w/ measured evidence) ·
A7 reduced-motion: engines never mount; static worlds are designed · Playwright
serves `out/` — ALWAYS rebuild before direct runs · Browser pane can't run rAF.

## Current deficits (the road to 95+)
From the final critique lists, unbuilt: /evidence was upgraded but visitor
never re-saw it (72 stands) · flagship externally unverifiable (content-debt) ·
homepage length vs 90-second screens (skip-link mitigated) · mobile dossiers ~68.

## Banked elevations (the wondrous list — buildable now)
1. **Press-to-sign gate** (4× critic-confirmed): visitor presses the awaiting
   stamp — ink thunk, "approved — run no. 041 · {visitor local date}", mailto
   reveals. The thesis as interaction.
2. **Stampable registry row** (fig 4.1's 041 row approvable inline — same run).
3. **Thread-as-citation**: receipts rows branch a visible pen-stroke to the
   fig they cite — "the move nobody else has."
4. **The paper remembers**: localStorage visited-marks (rail ✓, work-row ✓,
   one-time "you opened this file · date" stamps — static on revisit).
5. **Dateline clocks** (¶ kickers carry 06:12→22:41; the scroll = one workday).
6. **Visitor-local-time arc** ("clever → inevitable": arrive at 11pm, the paper
   opens at night) — spike carefully vs SSG/hydration + day-arc contract.
7. **Sun glyph** on the rail (○→◐→●) doubling as progress.
8. Cross-document View Transitions home↔case (Chrome/Safari enhancement).

## User content-debt (blocks nothing above)
Flagship demo-run ledger · MNIST eval artifact · sweep rubric + miss analysis ·
per-label metrics · outcome numbers · updated resume · final deployments.

## Refinement Era log (2026-07-18 →)
- **W1 SHIPPED (`455ac0d`)**: the four wondrous interactions — press-to-sign
  gate (run 041, visitor's local date, persisted, keyboard-complete),
  stampable registry row (synced across home + case file), thread-as-citation
  pen strokes on receipts, the-paper-remembers visited marks + opened notes.
  paperMemory.ts store; 27 new tests; gates 146/132/146 ×3, 0 failed.
- **PERF AUDIT (docs/design-lab/PERF-AUDIT.md)**: TBT 0–40ms, CLS 0.00,
  a11y 96–100, BP/SEO 100 everywhere; entire gap = LCP. Two majors: hero
  entrance costs ~2s of LCP (proven 104ms vs 1,940ms); DayArc writes vars on
  <html> → whole-doc recalc (2,911 vs 61, 86% of scroll cost). Plus portrait
  52KB→26px slot, case-hero WebPs, 43KB legacy transpile, a11y micro-list
  (incl. "I buildmachine learning" accname bug).
- **W3-core IN FLIGHT**: executing all six audit fixes with before→after
  numbers required (visible in tree: webp derivatives + avatar thumb +
  browserslist + imageWidth/Height already landing).
- **Queued**: W2 heavy-wordings prose pass + dateline clocks → W3-extras
  (view transitions, sun glyph, visitor-local-time spike) → W4 triple
  re-critique (bar: 90/90/85).
- **NEW INPUT**: tour of shreechaturvedi.com (friend's portfolio) for
  inspiration transposition — findings land in
  docs/design-lab/FRIEND-PORTFOLIO-TRANSPOSITIONS.md.
- **Era build COMPLETE**: W2 shipped `d83b9eb` (heavy wordings, clocks, HELD
  stamp, dictionary, § heads) · run-the-audit shipped `b93be6a` · stipple
  masthead shipped (CSS halftone mask, 0.0000% settle diff, LCP intact).
  W3-extras (view transitions, sun glyph, local-time arc) deferred pending
  W4 verdicts. → W4: triple fresh-eyes critique, bar 90/90/85.
- **W4 JUDGED (docs/scorecards/era-w4-triple-judgment.md)**: recruiter **91**
  ("advance" at ~80s) · evidence **91** (recomputed 3.504x from raw CSV; all
  walk arithmetic matched independent recounts) · visitor **79** (bar 85 —
  "two flagship micro-interactions read at 40% of intended volume"). Two bars
  cleared; visitor holds the era open. All three converged on the e-07
  held/earned contradiction (P0 honesty). → **W5**: round A honesty+machinery
  (e-07 split, "refused" legend, capture-tick semantics, walk-payoff
  transform, citation re-origin, work-row hierarchy, 90s path) · round B
  entrance+margins+manifest (headline ink-settle under LCP/CLS gates, t-slip
  margin seating, "on file:" closing manifest) · then fresh visitor re-judge
  (bar 85) + evidence spot-recount. Rejected: kicker-clock numeral flicker
  (scramble = banned). User calls surfaced: automl hero demotion, PR #5
  deploy (production /evidence/ 404s until merge).
- **W5 ROUND A SHIPPED (`134d098` + docs `14398a6`)**: the honesty trio +
  machinery. e-07 split (earned 3.5x kernel keeps its ✓; ~97% accuracy is
  now its own explicitly-HELD /evidence entry wearing the case-file stamp,
  receipt → the HELD row; proof gate enforces it stays held until a
  committed eval artifact earns it). Capture-vs-artifact tick semantics:
  explicit `capture` flag → held|described|capture|artifact, hollow ring vs
  solid tick vs dash, settled line composed from the data — automl now reads
  the blunt-honest "audit walked · 0 of 8 terminate in pinned artifacts · 6
  in page captures · 2 described only" (arithmetic asserted per-row vs DOM on
  7 files ×3). "refused — the gate stopped the run" ends the held/earned word
  collision. Walk marks in clay at legible weight; "run the audit" transforms
  in place into the settled ledger line (zero shift via SSR ghost); citation
  stroke re-origins at the fig-link underline; work-row hierarchy; 90-second
  screener path; chapter-rail labels. Gates: 436 ×3 + fast gates green.
- **W5 ROUND B SHIPPED (`c1dc818`)**: hero headline ink-settle beat (paint-
  only: color + ≤1px same-color drying feather; hero-rise still owns
  opacity/transform/blur — settled diff 0.0000% maxΔ0, perf gate 3/3, LCP
  war intact) reseating the byline stipple to read strictly second; decision
  t-slips seated as true right-margin sidenotes at lg+ (mid-file dead band
  gone); the **on-file manifest** — the visitor's own persisted trail
  ("on file: N case files opened · {id} audit walked · run 041 approved,
  {date}") rendered from paperMemory only, allowlisted, empty-store-silent,
  SSR-neutral, live on the subscribe channel. 4 new manifest honesty tests;
  full suite 475 ×3, 0 failed. → **W5 re-judge**: fresh visitor (bar 85) +
  evidence spot-recount of the changed arithmetic.
- **W5 RE-JUDGE (docs/scorecards/era-w5-rejudge.md)**: evidence **97**
  (project high — recomputed every changed number to the digit: automl truly
  0-of-8 pinned, 3.5x=3.5043x from raw CSV, macro-F1 0.97913, manifest
  garbage-seeded and counts only reals; no regression, no unearned numbers) ·
  visitor **83** (bar 85 — "the closest it has come"; all three prior
  complaints fixed + manifest elevation delivered; a crescendo layer remains).
  Recruiter stands 91 (rounds A/B only strengthened what it praised). Era
  bar: recruiter + evidence cleared with margin; visitor sole holdout, +2 to
  go. → **W6 crescendo** (Opus builder, in flight): stamp = physical +
  chromatic peak (impact press, wet-ink-that-dries, ONE reserved saturated
  clay contrast-gated on waypoint-07); interaction discoverability (one-time
  on-enter stamp beat, honest "walk the N claims →" audit hint); bounded
  stretch (hero-thread signature under the 0.0000%/LCP guarantees, /evidence
  held-tick disambiguation, empty-band tightening). NO-LIST restated: no glow,
  no typewriter reveal, no particles; reduced-motion/off = settled, no anim.
- **W6 SHIPPED (`e2edb9f`)**: the approval stamp becomes the crescendo.
  stamp-press rebuilt from a gentle slide into a physical strike
  (anticipation → +2.5px/0.983 impact on ease-in → one rebound → settle,
  750ms, transform on .stamp-plate only — CLS 0.00, thread landmark
  unmoved). New token `--color-clay-ember #f57a3e` reserved SOLELY for the
  inked APPROVED (defined once, consumed once; oklch chroma 0.168 — the
  loudest colour on the site; 5.50:1 on waypoint-07, pair added to the
  contrast gate); the ink over-shoots to full wet then dries to the
  persisted 0.92 (saturation within the distress vocab, no glow). One-time
  on-enter attention beat on the awaiting stamp (IntersectionObserver,
  JS-gated on reduced-motion AND motion-off, one fire, never on the dried
  stamp); label "awaiting your signature" → imperative "press here to sign";
  audit resting hint "run the audit →" → honest "walk the {N} claims →"
  (N = real row count). Evidence-97 residual folded: held-entry visited ✓
  gets a "not a verification" title. Item 4 (hero-thread signature) SKIPPED
  to protect the 0.0000% settled-hero diff + LCP; item 6 (case-page empty
  bands) deferred (locked judges happy; brief bars inventing content). Gates:
  487 ×3 · 0 failed · perf 3/3 · ember 5.50:1 · 4 new crescendo tests.
  → **W6 visitor re-judge** (bar 85, in flight): does the crescendo close
  the +2? Recruiter 91 + evidence 97 stand (untouched surfaces).
