# W5 re-judge — after the honesty trio + the entrance/margins/manifest (2026-07-18)

Two fresh judges (Opus 4.8; Fable 5 rate-limited) against the standing build
`5b33038` (rounds A `134d098` + B `c1dc818`). Each rebuilt the export, served
`out/`, drove a headless Playwright harness (the embedded pane can't run rAF),
and judged cold. Shots in `docs/design-lab/shots-w5judge/` (uncommitted).

## Verdicts vs the era bar (90 / 90 / 85)

| Lens | Path | W5 | Bar | Verdict |
|---|---|---|---|---|
| Evidence | 64 → 86 → 91 | **97** | ≥90 | **cleared — project high.** Every changed number recomputed to the digit; garbage-seeded manifest counts only real ids; no regression, no unearned numbers |
| Visitor | 54 → 72 → 79 | **83** | ≥85 | **held open by 2.** "The closest it has come." All three prior complaints genuinely fixed + the manifest elevation delivered; a new crescendo layer is the remaining gap |
| Recruiter | 68 → 86 → 91 | *(not re-run)* | ≥90 | stands at 91 — rounds A/B only strengthened honesty/structure it praised |

**Era status: recruiter + evidence cleared with margin; visitor is the sole
holdout, 2 short. → W6 crescendo round (in flight).**

## Evidence 97 — what it verified (all exact)

- **automl capture ticks**: 8 rows = 0 pinned · 6 captures · 2 described →
  settled line "0 of 8 terminate in pinned artifacts · 6 in page captures ·
  2 described only" == DOM marks (6 ring, 2 dash, 0 tick). The blunt "0 of 8"
  is genuinely true — zero tick glyphs exist in the DOM.
- **e-07/e-08 split**: exactly one `data-held-entry` on /evidence (the ~97%,
  HeldStamp + "held — not yet earned"); 3.5x public/earned; receipts route
  right. BENCHMARKS.md @ c6e5c0b confirmed to carry 3.5x and NO accuracy
  figure; README.md carries the ~97%. Recomputed 3.5x from raw
  bench_summary.csv = **3.5043x** → 3.50x. macro-F1 re-averaged from the 8
  per-label scores = **0.97913** (exact). policybot 19/20, master 10,453 exact.
- **manifest**: adversarial seed (real + garbage ids + malformed dates) →
  counts only reals, drops garbage/malformed, empty store renders nothing,
  reads the approval date from storage (seeded mar 03 → rendered mar 03).
- All 14 external hrefs on changed pages 200 + commit-pinned.
- Two cosmetic residuals only: (1) the visited ✓ can sit beside a held
  entry's receipt (mitigated by the adjacent HeldStamp; W6 item 5 disambiguates);
  (2) "openmp+simd" copy vs "openmp+native" config label — disclosed in the
  2026-07 correction.

## Visitor 83 — the crescendo gap (the W6 mandate)

Fixes it confirmed FROM THE FRAMES: hero develops "like a photograph in a
tray" — headline inks first (op climbs to 0.87), byline stipple resolves
second (verified numerically + by eye); t-slips seated; manifest driven end
to end ("on file: 2 case files opened · automl audit walked · run 041
approved, jul 18, 2026"), renders nothing on a clean visit. Strongest moment:
"the red thread arriving at the approval stamp on ¶07, resolved by the
personalized receipt… concept, craft, and interaction converge in one place."

The remaining 2 points (its ranked list → W6):
1. **The climactic stamp-press under-delivers physically** — a ~600ms ink
   swap at ~4.5:1; "lands softer than the arc earns." Give it real weight
   (impact + settle), a wet-ink-that-dries beat.
2. **Discoverability weak** — "the best moments depend on acts a hurried
   juror won't perform; nothing pulls the hand in." One-time on-enter
   affordance on the stamp; a resting hint on the audit control.
3. **No visceral first-viewport hook** — hero wow is intellectual,
   time-released. Suggested: the thread draws itself from the byline as a
   signature. (W6 bounded stretch — only if the 0.0000% settled diff + LCP
   survive.)
4. **Near-monochrome caps the crescendo** — clay is the only chroma, used at
   low volume everywhere; reserve one warmer, more saturated clay solely for
   the approved state so APPROVED is the loudest color on the site.
5. **Residual empty lower-thirds** at 1440 read as unfinished (W6 bounded).

## W6 plan (in flight, Opus builder)

Mandate items 1–3: stamp = physical + chromatic peak (impact press; wet-ink
over-shoot that dries; ONE reserved saturated clay, contrast-gated on
waypoint-07); discoverability (one-time stamp beat + honest "walk the N
claims →" resting hint). Bounded: hero-thread signature (guarded by the
0.0000%/LCP guarantees), /evidence held-tick disambiguation (perceptual, no
count change), empty-band tightening. NO-LIST guardrails restated: no glow,
no typewriter letter/word reveal, no particles; reduced-motion + motion-off
get the settled state with no animation. Then a fresh visitor re-judge at 85.
