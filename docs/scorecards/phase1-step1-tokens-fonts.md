# Scorecard — Phase 1 · Step 1 — Design tokens + fonts

## Iteration 1 — AUTO-FAIL
- NO-LIST violation found on newly-visible surfaces: blurred accent orbs
  (`blur-3xl rounded-full`, §A "floating blurred orbs") in `not-found.tsx` +
  `error.tsx`, and `drop-shadow-lg` on the 404 numeral (§A "no glow").
  Pre-existing markup; the rubric does not grandfather. → fixed.

## Iteration 2 — SHIP (95/100)

Gates: typecheck ✅ lint ✅ format ✅ build ✅ core e2e (67 passed) ✅
contrast 24/24 ✅ font budget 179/220 KB ✅

| Criterion | Score | Notes |
|---|---|---|
| Plan fidelity | 24/25 | Part 3.4 hexes exact (verified by script mirror); 7 waypoints; Part 3.5 scale as `--text-*` tokens; Fraunces axis utilities (`fraunces-hero/display/wonk`); `label-mono` lowercase voice. −1: scale tokens defined but unexercised until chapters exist (by design) |
| NO-LIST | 15/15 | Iter-1 violations fixed; new code clean. (Dark Atlas header clash is slated old-design surface, replaced in the shell step) |
| Craft | 17/20 | 404 frame reads designed: Fraunces clay numeral, warm canvas, flat surfaces. −3: header clash + prose still sans on 404 (story voice lands in Phase 2) |
| A11y | 15/15 | All 24 contrast pairs computationally verified incl. every waypoint + button pairings. Measured note: dusk ink = 10.06:1 (plan claimed 12.8) — still comfortably AA |
| Perf | 15/15 | Font payload 805→363 KB total, 179 KB preloaded (≤220 budget) via Newsreader static-400 + mono-roman-only; Fraunces keeps opsz/SOFT/WONK; framer-motion dead dep removed |
| Verification | 9/10 | New permanent gate `npm run test:contrast`; e2e green. −1: no Playwright token assertion (script is the right form for tokens; visual specs land with the shell) |

**Total: 95/100 → SHIP**

Deferred (tracked):
- Header/Footer restyle → Step 4 (chapter shell)
- Newsreader prose voice application → Phase 2 chapters
- A4 mid-interpolation arc sampler → Step 3 extends `check-contrast.mjs` (`sampleArc()`)
