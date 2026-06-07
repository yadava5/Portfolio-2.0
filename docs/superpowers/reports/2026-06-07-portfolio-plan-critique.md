# Portfolio Polish Plan Critique - 2026-06-07

## Plan Critique Score

Original plan score before amendments: `74/100`.

The plan was directionally strong but not yet execution-safe enough for a high-confidence recruiter-readiness pass. It covered the right themes: public deployment, proof manifest, CI/SEO/a11y/performance, Atlas-only cleanup, and visual polish. The weaknesses were mainly sequencing, command correctness, and guard strength.

## Main Criticisms

1. Public deployment availability was the largest score gap, but the original plan placed public publish verification last. A recruiter-facing portfolio cannot score high while the public URL returns `404`.
2. Some shell snippets were brittle in zsh. `status=$(...)` conflicts with zsh's read-only `status`, and unquoted `src/app/projects/[id]/page.tsx` can be interpreted as a glob.
3. Static SEO checks had an internal trailing-slash mismatch with `next.config.ts`, which uses `trailingSlash: true`.
4. `tests/playwright/static-seo.spec.ts` was listed in the file map but not specified.
5. The proof manifest verifier was too shallow. It could pass when visible projects had no `proofIds`.
6. CI coverage was still Chromium-heavy and did not include a real Web Vitals-style gate.
7. Legacy cleanup needed a wider reference scan across docs/scripts/root tests, not just `src` and `tests/playwright`.
8. The Atlas visual refactor and visual redesign needed to be split into separate commits with before/after screenshot criteria.

## Amendments Applied

- Added `Task 0: Public Availability Recovery Gate` before local refactors.
- Replaced zsh-unsafe `status` variables with `http_status`.
- Quoted the App Router path `'src/app/projects/[id]/page.tsx'`.
- Made sitemap URLs trailing-slash consistent.
- Added a concrete `tests/playwright/static-seo.spec.ts` browser metadata smoke test.
- Strengthened the proof verifier to require:
  - every visible project with metrics has non-empty `proofIds`,
  - every referenced proof ID exists,
  - local proof sources exist,
  - external proof sources are valid URLs,
  - private-safe entries include real privacy boundaries.
- Added missing proof coverage for JobTracker and Paid Internships, or an execution choice to hide projects that are not proof-ready.
- Added `firefox-desktop` smoke coverage alongside current Chromium desktop/mobile projects.
- Added LCP and CLS assertions to the performance plan.
- Raised manual contrast threshold to `4.5`.
- Added a stale-claims/docs scan.
- Split Atlas section extraction and visual polish into separate commits.
- Added explicit screenshot review criteria for desktop rhythm, mobile first scan, and contact close.

## Revised Readiness

After amendments, the plan is execution-ready enough to start with Task 0. It should be treated as roughly `86/100` as a plan: strong enough to execute, with the remaining uncertainty centered on GitHub Pages settings and whether external repository permissions allow the publish path to be recovered without manual settings changes.

## Execution Priority

Start with Task 0. If public GitHub Pages cannot be enabled or verified, record the exact permission/settings blocker before spending time on visual polish. Once public availability is recovered, run Task 1 to make SEO/deploy correctness regressions hard to reintroduce.
