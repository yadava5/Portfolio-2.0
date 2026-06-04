# Fast MNIST Proof Polish Evidence

## Source Repository

- Source repo: `/Users/ayush/Documents/Projects/fast-mnist-nn`
- Source branch/head: `main` at `c6e5c0b chore(web): consolidate final dependency updates`
- Source worktree state: dirty before this pass; existing uncommitted web changes were inspected but not edited or reverted.
- Dirty source files observed:
  - `web/package-lock.json`
  - `web/package.json`
  - `web/playwright.config.ts`
  - `web/src/App.tsx`
  - `web/src/components/CommandPalette.tsx`
  - `web/src/components/NeuralNetHero.Scene.tsx`
  - `web/src/components/NeuralNetHero.tsx`
  - `web/src/index.css`
  - `web/tests/e2e/demo.spec.ts`
  - deleted legacy files under `web/src/App.css`, `web/src/assets/react.svg`, `web/src/components/HeroBackdrop.tsx`, `web/src/components/PipelineCard.tsx`, and `web/src/components/PipelineShowcase.tsx`
  - untracked `web/src/features/` and `web/src/styles/`

## Commands Run

From `/Users/ayush/Documents/Projects/fast-mnist-nn/web`:

```bash
npm run build
npm run test:e2e -- --project=desktop
```

Results:

- `npm run build`: passed.
- `npm run test:e2e -- --project=desktop`: `4 passed`, `1 skipped`, `1 failed`.
- Failing test: `@perf has no horizontal overflow, clipped visible controls, or blank hero media`.
- Failure detail: selected hero media height was `150px`; the test expects `>160px`.
- Failure artifact: `/Users/ayush/Documents/Projects/fast-mnist-nn/web/test-results/demo-Fast-MNIST-HPC-scroll-92b72-ontrols-or-blank-hero-media-desktop/test-failed-1.png`.

Interpretation: the current Fast MNIST demo renders and the classifier path works, but the source repo has a current desktop visual-regression/test-threshold issue in the hero media size. The portfolio should not imply the native backend was available during capture.

## Benchmark Truth

Committed benchmark files inspected:

- `/Users/ayush/Documents/Projects/fast-mnist-nn/docs/benchmarks/bench_summary.csv`
- `/Users/ayush/Documents/Projects/fast-mnist-nn/BENCHMARKS.md`

Supported claim:

- `dot 256` baseline `4,835,359.61779272 ns/op` versus openmp+native `1,379,834.734573612 ns/op`, which supports the existing `3.5x dot-kernel speedup` portfolio claim.

Unsupported claim:

- A broad faster-inference or AVX-512 inference claim is not supported by the committed classifier throughput rows. `benchClassify` is fastest in baseline mode at `81,627.57095026587 img/s`; openmp+native is lower at `69,993.91090725188 img/s`.

## Captured Artifacts

Ignored evidence folder:

- `output/playwright/fast-mnist-proof-polish/fast-mnist-classifier.png`
- `output/playwright/fast-mnist-proof-polish/fast-mnist-forward-pass.png`
- `output/playwright/fast-mnist-proof-polish/fast-mnist-hero-current.png`

Promoted portfolio asset:

- `public/images/projects/mnist.png`

The promoted asset uses the classifier screenshot because it shows the real workbench, a sample prediction, confidence bars, and the runtime boundary: native server offline, JS demo fallback, and benchmark claims separated from the demo runtime.

## Portfolio Disclosure Requirement

Keep the Fast MNIST project visual disclosure as:

```ts
imageDisclosure:
  "Real local web workbench screenshot; native inference server was offline during capture, so benchmark claims are sourced from committed benchmark data.",
```

Do not replace it with native-server wording until the C++ server is running during the capture and that state is visible in the screenshot.
