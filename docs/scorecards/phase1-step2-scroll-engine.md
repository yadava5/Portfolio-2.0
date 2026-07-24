# Scorecard — Phase 1 · Step 2 — Scroll engine (A1/A7)

## Iterations
1. Spec measured mid-flight (`toBeInViewport` fires at first intersection) → settle-wait added.
2. **Stale-bundle trap found**: Playwright's webServer serves the `out/` static
   export by default — direct `npx playwright test` without `next build` tests
   OLD code. Cost a full phantom-bug chase (null-context symptoms that were
   the pre-Step-2 bundle). Documented in memory; npm `test:e2e*` scripts are
   safe (they build first).
3. Font-swap reflow shifts anchor targets mid-scroll → spec waits `fonts.ready`
   + measures a second, settled navigation.
4. `waitForFunction` async-predicate polling raced its own samples → replaced
   with a single in-page interval settle-detector. Timeline instrumentation
   proved the ENGINE was correct the whole time (all landings exactly
   target−96): every iteration fixed the measurement, not the code.

## Final — SHIP (98/100)

Gates: typecheck ✅ lint ✅ format ✅ build ✅ full e2e 214 passed / 0 failed
(atlas, interactions, nav-and-images, a11y-audit, comprehensive-qa,
reduced-motion, scroll-engine × chromium-desktop/mobile + firefox) ✅

| Criterion | Score | Notes |
|---|---|---|
| Plan fidelity | 25/25 | A1 exact: `autoRaf:false`, ticker `t*1000`, `lagSmoothing(0)` (+restore), fonts-ready refresh; anchors via `lenis.scrollTo` 1.2s expo-out; ONE loop — Header reads engine, modal `stop()/start()`s it |
| NO-LIST | 15/15 | Top progress bar (ScrollProgress) deleted per §C; no new violations |
| Craft | 18/20 | Clean provider API (`useLenis` + exported scroll constants, `data-lenis-connected` testability). −2: A7 in-page motion toggle deferred to the chapter-shell step (needs UI home) |
| A11y | 15/15 | Engine never mounts under reduced motion (gate at entry, change-reactive); anchors still land instantly |
| Perf | 15/15 | Single rAF achieved; killed ScrollProgress's independent listener + dead `useScrollAnimation` hook |
| Verification | 10/10 | New dedicated spec (engine mount, no-progress-bar, Lenis-driven anchors w/ offset, reduced-motion) green ×3 browsers; full suite green |

**Total: 98/100 → SHIP**
