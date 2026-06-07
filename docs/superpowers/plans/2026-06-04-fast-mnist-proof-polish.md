# Fast MNIST Proof Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the portfolio's Fast MNIST proof by verifying the real project demo and benchmark evidence, then updating the portfolio only with claims and visuals that are currently supportable.

**Architecture:** Treat `/Users/ayush/Documents/Projects/fast-mnist-nn` as read-only evidence because it currently contains unrelated uncommitted work. Capture proof artifacts into the portfolio repo under ignored `output/playwright/`, promote only stable public assets into `public/images/projects/`, and keep benchmark copy tied to committed Fast MNIST benchmark data.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, Playwright CLI/test runner, Vite Fast MNIST demo, GitHub-backed portfolio source data.

---

## Commit Strategy

- Commit 1: this plan only.
- Commit 2: evidence notes and promoted Fast MNIST proof asset only.
- Commit 3: portfolio data/test copy that references the proof asset.
- Commit 4: validation-only updates if tests reveal stale expectations.

---

### Task 1: Capture Fast MNIST Runtime Evidence

**Files:**
- Inspect only: `/Users/ayush/Documents/Projects/fast-mnist-nn`
- Create output only: `output/playwright/fast-mnist-proof-polish/`

- [x] **Step 1: Confirm the source repo state**

Run:

```bash
git -C /Users/ayush/Documents/Projects/fast-mnist-nn status --short --branch
git -C /Users/ayush/Documents/Projects/fast-mnist-nn log --oneline -5
```

Expected: record the current branch/head and note that uncommitted web changes exist; do not edit or revert them.

- [x] **Step 2: Verify Fast MNIST benchmark source truth**

Run:

```bash
sed -n '1,80p' /Users/ayush/Documents/Projects/fast-mnist-nn/docs/benchmarks/bench_summary.csv
sed -n '1,120p' /Users/ayush/Documents/Projects/fast-mnist-nn/BENCHMARKS.md
```

Expected: committed benchmark evidence supports `3.50x` for dot 256 and shows classify throughput where OpenMP/native does not improve the classifier path.

- [x] **Step 3: Run Fast MNIST web checks**

Run from `/Users/ayush/Documents/Projects/fast-mnist-nn/web`:

```bash
npm run build
npm run test:e2e -- --project=desktop
```

Expected: if either command fails, use superpowers:systematic-debugging to identify whether the failure is from the current dirty Fast MNIST worktree or from a reproducible demo issue. Do not change Fast MNIST from this portfolio branch.

- [x] **Step 4: Capture fresh browser evidence**

Create an artifact directory:

```bash
mkdir -p /Users/ayush/Documents/Projects/Portfolio-2.0/output/playwright/fast-mnist-proof-polish
```

Start the Fast MNIST demo if the Playwright web server is not already running:

```bash
cd /Users/ayush/Documents/Projects/fast-mnist-nn/web
npm run dev -- --host 127.0.0.1 --port 5173
```

Use Playwright CLI from `output/playwright/fast-mnist-proof-polish/` to capture:

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
"$PWCLI" open http://127.0.0.1:5173/index.html --headed --session fastmnist
"$PWCLI" snapshot --session fastmnist
"$PWCLI" screenshot --session fastmnist --output fast-mnist-hero.png
```

Then navigate or scroll to the classifier and performance sections and capture:

- `fast-mnist-classifier.png`
- `fast-mnist-performance.png`

Expected: screenshots are real current Fast MNIST UI, readable at portfolio card/detail sizes, and do not suggest native server availability unless the runtime state actually shows it.

---

### Task 2: Promote A Better Fast MNIST Portfolio Asset

**Files:**
- Replace: `public/images/projects/mnist.png`
- Create: `docs/superpowers/evidence/2026-06-04-fast-mnist-proof-polish.md`

- [x] **Step 1: Choose the strongest current screenshot**

Use the classifier screenshot when it clearly shows prediction/activation proof. Use the performance screenshot when it better supports the benchmark story. Do not use hero-only art as the primary portfolio proof.

- [x] **Step 2: Resize the chosen screenshot deterministically**

Run from the portfolio repo:

```bash
node - <<'NODE'
const sharp = require("sharp");
const input = "output/playwright/fast-mnist-proof-polish/fast-mnist-classifier.png";
const output = "public/images/projects/mnist.png";
sharp(input)
  .resize(1376, 768, { fit: "cover", position: "top" })
  .png({ compressionLevel: 9 })
  .toFile(output)
  .then(() => console.log(output))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
NODE
```

If `fast-mnist-performance.png` is the chosen source, replace the `input` path in the command with that file.

- [x] **Step 3: Write the evidence note**

Create `docs/superpowers/evidence/2026-06-04-fast-mnist-proof-polish.md` with:

```markdown
# Fast MNIST Proof Polish Evidence

- Source repo: `/Users/ayush/Documents/Projects/fast-mnist-nn`
- Source branch/head: record from Task 1.
- Source worktree state: record dirty files without changing them.
- Commands run: `npm run build`, `npm run test:e2e -- --project=desktop`, Playwright CLI captures.
- Benchmark truth: `docs/benchmarks/bench_summary.csv` supports `3.50x` dot 256 speedup; classifier throughput does not support a broad faster-inference claim.
- Promoted portfolio asset: `public/images/projects/mnist.png`
- Disclosure requirement: portfolio copy must say the screenshot is a real local web demo and benchmark claims come from committed benchmark data.
```

- [x] **Step 4: Commit asset evidence**

Run:

```bash
git add public/images/projects/mnist.png docs/superpowers/evidence/2026-06-04-fast-mnist-proof-polish.md
git commit -m "docs: capture fast mnist proof evidence"
```

---

### Task 3: Align Portfolio Copy And Tests

**Files:**
- Modify: `src/lib/data/projects.ts`
- Modify: `src/lib/data/projectCaseStudies.ts`
- Modify: `tests/playwright/portfolio-fixtures.ts`
- Modify: `tests/playwright/atlas.spec.ts`

- [x] **Step 1: Keep supported Fast MNIST claims only**

Verify these strings remain in `src/lib/data/projects.ts`:

```ts
{ label: "Accuracy", value: "97%+ on MNIST" },
{ label: "Kernel Speedup", value: "3.5x dot-kernel speedup" },
```

Verify unsupported strings are absent:

```text
5x faster inference
AVX-512 inference
```

- [x] **Step 2: Tighten Fast MNIST disclosure copy if needed**

If Task 1 proves the demo currently runs in fallback mode, keep:

```ts
imageDisclosure:
  "Real local web workbench screenshot; native inference server was offline during capture, so benchmark claims are sourced from committed benchmark data.",
```

If Task 1 proves a native server is running, change the disclosure to:

```ts
imageDisclosure:
  "Real local web workbench screenshot backed by the Fast MNIST runtime; benchmark claims are sourced from committed benchmark data.",
```

- [x] **Step 3: Add a focused Fast MNIST proof regression test**

In `tests/playwright/atlas.spec.ts`, extend the existing artifact-backed proof test or add a Fast MNIST-specific assertion that `/projects/fast-mnist-nn/` contains:

```text
Local React workbench screenshot
v1.0.0 release
Benchmark evidence
3.50x dot-kernel speedup
```

- [x] **Step 4: Commit data/test updates**

Run:

```bash
git add src/lib/data/projects.ts src/lib/data/projectCaseStudies.ts tests/playwright/portfolio-fixtures.ts tests/playwright/atlas.spec.ts
git commit -m "test: lock fast mnist proof claims"
```

Skip this commit if Task 3 produces no source or test changes.

---

### Task 4: Portfolio Browser Validation

**Files:**
- Inspect output: `output/playwright/fast-mnist-proof-polish/`
- Modify only if needed: `tests/playwright/*` or Fast MNIST portfolio data files

- [x] **Step 1: Run static gates**

Run:

```bash
npm run typecheck
npm run lint
npm run format:check
```

Expected: all pass.

- [x] **Step 2: Run focused Playwright**

Run:

```bash
npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts tests/playwright/nav-and-images.spec.ts
npm run test:e2e:score -- --project=chromium-desktop
```

Expected: focused tests pass; score remains 10 or any deduction is investigated before continuing.

- [x] **Step 3: Inspect the portfolio route with Playwright CLI**

Start the portfolio dev server:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Capture the Fast MNIST card and case-study page:

```bash
cd output/playwright/fast-mnist-proof-polish
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
"$PWCLI" open http://127.0.0.1:3000 --headed --session pfmnist
"$PWCLI" screenshot --session pfmnist --output portfolio-home-fast-mnist.png
"$PWCLI" open http://127.0.0.1:3000/projects/fast-mnist-nn/ --session pfmnist
"$PWCLI" screenshot --session pfmnist --output portfolio-fast-mnist-case-study.png
```

Expected: Fast MNIST image is readable, disclosure is visible on card/detail surfaces, and no stale unsupported speed claim appears.

- [x] **Step 4: Stop servers and commit validation-only fixes**

Stop any dev servers on ports 3000 and 5173. If validation required only test or copy corrections, commit them separately:

```bash
git add tests/playwright src/lib/data
git commit -m "test: validate fast mnist portfolio proof"
```

Skip this commit if no files changed.

---

## Final Verification Checklist

- [x] Fast MNIST source repo was inspected without modifying or reverting its dirty worktree.
- [x] Fast MNIST web demo build/test result is recorded.
- [x] Fresh screenshots exist under `output/playwright/fast-mnist-proof-polish/`.
- [x] `public/images/projects/mnist.png` is a current, real Fast MNIST proof image if the new capture is better than the existing asset.
- [x] Portfolio copy does not claim unsupported broad faster inference.
- [x] Fast MNIST case study exposes screenshot, release, and benchmark proof.
- [x] Portfolio typecheck, lint, format, focused Playwright, and score gates pass.
- [x] Work is split into multiple focused commits.

## Execution Notes

- Fast MNIST source build passed.
- Fast MNIST desktop Playwright currently has one source-repo failure: the hero media element is `150px` tall while the test expects `>160px`. This portfolio branch did not edit the dirty Fast MNIST repo.
- Portfolio evidence uses the classifier screenshot because it proves the real workbench, sample prediction, confidence bars, and honest runtime boundary.
- Portfolio validation passed with `npm run typecheck`, `npm run lint`, `npm run format:check`, focused desktop Playwright, and the Atlas score gate.
