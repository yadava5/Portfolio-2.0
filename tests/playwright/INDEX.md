# Portfolio Playwright Index

The Playwright directory now tracks source specs and documentation only. Generated reports, screenshots, videos, traces, and audit JSON belong under ignored `output/playwright/`.

## Primary Commands

| Command                      | Purpose                                   |
| ---------------------------- | ----------------------------------------- |
| `npm run test:e2e`           | CI/default assertion gate                 |
| `npm run test:e2e:full`      | Complete browser suite across all specs   |
| `npm run test:e2e:artifacts` | Opt-in screenshot/report/video generation |
| `npm run test:e2e:videos`    | Responsive walkthrough video recordings   |
| `npm run test:e2e:score`     | 10-point portfolio visual quality gate    |
| `npm run test:e2e:ui`        | Interactive Playwright UI                 |
| `npm run test:visual`        | Snapshot update workflow                  |

## Assertion Specs

- `atlas.spec.ts` - Technical Operations Atlas source-truth, recruiter CTAs, private case-study availability, and generated-copy guardrails.
- `a11y-audit.spec.ts` - axe accessibility checks.
- `interactions.spec.ts` - key UI interactions and recruiter-facing navigation.
- `nav-and-images.spec.ts` - anchor sections, image assets, project records.
- `comprehensive-qa.spec.ts` - broader content, link, asset, and mobile sanity checks.
- `text-motion.spec.ts` - plan-3.8 text choreography: hero entrance, line-mask reveals, manifesto scrub, rail audit-trail, reduced-motion/mobile guarantees.
- `dossier.spec.ts` - case-file dossier contracts: receipts-table row anchors, live-demo rows, /evidence master ledger, /#work folio return, archive header legibility, and the 390px thread-gutter probe.
- `deep-qa.spec.ts` - slower scroll, screenshot, animation, semantic, performance, and edge-case checks.

## Artifact Specs

- `themes.spec.ts`
- `full-audit.spec.ts`
- `visual-audit.spec.ts`
- `visual-regression.spec.ts`
- `critique-screenshots.spec.ts`
- `record-walkthroughs.spec.ts`
- `debug-audit.spec.ts`
- `portfolio-quality-score.spec.ts`

These are useful manual QA tools, but they should not be the default CI signal. They write via `artifactPath()` to:

```text
output/playwright/
```

## Current Contract

- The only public theme is `technical-operations-atlas`.
- The previous theme switcher is intentionally absent from the rendered product.
- Legacy theme helper loops still derive from `themeIds`, so they render only Atlas until those specs are simplified.
- Tests derive asset URLs from Playwright `baseURL` or current page URL instead of hardcoding `127.0.0.1:3000`.
- Project visuals must be labeled as representative visuals unless they are real captured screenshots.

## Before Committing

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:e2e
```

Then confirm `git status --short` shows only intentional source, docs, and approved asset changes.
