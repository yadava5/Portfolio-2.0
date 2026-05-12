# Portfolio Playwright Index

The Playwright directory now tracks source specs and documentation only. Generated reports, screenshots, videos, traces, and audit JSON belong under ignored `output/playwright/`.

## Primary Commands

| Command                      | Purpose                                   |
| ---------------------------- | ----------------------------------------- |
| `npm run test:e2e`           | CI/default assertion gate                 |
| `npm run test:e2e:full`      | Complete browser suite across all specs   |
| `npm run test:e2e:artifacts` | Opt-in screenshot/report/video generation |
| `npm run test:e2e:ui`        | Interactive Playwright UI                 |
| `npm run test:visual`        | Snapshot update workflow                  |

## Assertion Specs

- `atlas.spec.ts` - Technical Operations Atlas source-truth, recruiter CTAs, private case-study availability, and generated-copy guardrails.
- `a11y-audit.spec.ts` - axe accessibility checks.
- `interactions.spec.ts` - theme switcher and key UI interactions.
- `nav-and-images.spec.ts` - anchor sections, image assets, project records.
- `comprehensive-qa.spec.ts` - broader content, link, asset, and mobile sanity checks.
- `deep-qa.spec.ts` - slower scroll, screenshot, animation, semantic, performance, and edge-case checks.

## Artifact Specs

- `themes.spec.ts`
- `full-audit.spec.ts`
- `visual-audit.spec.ts`
- `visual-regression.spec.ts`
- `critique-screenshots.spec.ts`
- `record-walkthroughs.spec.ts`
- `debug-audit.spec.ts`

These are useful manual QA tools, but they should not be the default CI signal. They write via `artifactPath()` to:

```text
output/playwright/
```

## Current Contract

- The default theme is `technical-operations-atlas`.
- The desktop theme switcher is visible and tested through UI interactions.
- The mobile theme switcher stays hidden; tests set theme state directly when they only need to render a theme.
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
