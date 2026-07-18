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
