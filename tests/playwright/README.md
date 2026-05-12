# Portfolio Playwright Suites

This directory contains source Playwright specs only. Generated reports, screenshots, and videos should be written to `output/playwright/`, which is ignored by git.

## Default Assertion Gate

```bash
npm run test:e2e
```

The default gate builds the static site and runs the assertion-focused portfolio checks:

- `atlas.spec.ts`
- `a11y-audit.spec.ts`
- `interactions.spec.ts`
- `nav-and-images.spec.ts`
- `comprehensive-qa.spec.ts`

This command is intended for CI and branch validation. It should leave no tracked generated files behind.

## Full Browser Gate

```bash
npm run test:e2e:full
```

Runs every Playwright spec, including slower deep QA and artifact-producing visual audits. Use this before larger merges or when checking scroll, transitions, and all theme surfaces.

## Opt-In Artifact Suites

```bash
npm run test:e2e:artifacts
```

Artifact suites are manual QA tools for screenshots, reports, videos, visual comparisons, and walkthrough captures. Their outputs belong under:

```text
output/playwright/
├── full-audit/
├── visual-audit/
├── visual-regression/
├── critique-screenshots/
├── walkthroughs/
├── debug-audit/
└── test-results/
```

Do not restore old generated files under `tests/playwright/screenshots/`, `tests/playwright/videos/`, or `tests/playwright/*.json` unless a specific artifact is being promoted as durable documentation.

## Debugging

```bash
npm run test:e2e:ui
npx playwright test tests/playwright/atlas.spec.ts --project=chromium-mobile --headed
npx playwright test tests/playwright/deep-qa.spec.ts --project=chromium-desktop --grep "Semantic HTML"
```

When changing the app, rebuild before validating against the static export:

```bash
NEXT_PUBLIC_BASE_PATH= npm run build -- --webpack
```

The portfolio is deployed under `/Portfolio-2.0`; tests should derive URLs from Playwright `baseURL` or the current page URL instead of hardcoding local ports.
