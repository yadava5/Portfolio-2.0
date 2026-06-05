# AutoML Proof Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Agentic AutoML case study show stronger recruiter-facing proof by adding a focused private-safe presenter artifact and locking the evidence with browser tests.

**Architecture:** Keep the real product screenshot as the primary project image because it is readable and already private-safe. Add a focused public asset derived from the local presenter PDF that proves the platform stack and validation posture, then wire the case study and Playwright fixture to require it. Validate through static checks, focused Playwright, and browser screenshots of `/projects/automl/`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Sharp, Poppler `pdftoppm`, Playwright.

---

## Commit Strategy

- Commit 1: this plan only.
- Commit 2: generated AutoML presenter proof asset and evidence note.
- Commit 3: project case-study data and Playwright regression test updates.
- Commit 4: validation-only fixes if browser checks find layout or copy regressions.

## File Map

- Create `public/images/projects/agentic-automl-stack-proof.png`: private-safe proof image from `/Users/ayush/Downloads/agentic-automl-presenter.pdf` slide 8.
- Create `docs/superpowers/evidence/2026-06-04-automl-proof-hardening.md`: commands, source files, chosen asset, and validation results.
- Modify `src/lib/data/projectCaseStudies.ts`: allow `presentation` artifacts, tighten AutoML validation evidence, and add the new stack proof artifact.
- Modify `tests/playwright/portfolio-fixtures.ts`: add the expected presenter proof label.
- Modify `tests/playwright/atlas.spec.ts`: require the AutoML stack artifact and evidence text on `/projects/automl/`.

---

### Task 1: Promote Focused Presenter Proof

**Files:**
- Create: `public/images/projects/agentic-automl-stack-proof.png`
- Create: `docs/superpowers/evidence/2026-06-04-automl-proof-hardening.md`

- [ ] **Step 1: Render the source presenter slide**

Run from `/Users/ayush/Documents/Projects/Portfolio-2.0`:

```bash
mkdir -p output/playwright/automl-proof-hardening/pdf-pages
pdftoppm -png -r 144 -f 8 -l 8 /Users/ayush/Downloads/agentic-automl-presenter.pdf output/playwright/automl-proof-hardening/pdf-pages/presenter
```

Expected: `output/playwright/automl-proof-hardening/pdf-pages/presenter-08.png` exists and shows the stack and validation metrics slide.

- [ ] **Step 2: Create the public stack proof asset**

Run from `/Users/ayush/Documents/Projects/Portfolio-2.0`:

```bash
node <<'NODE'
const sharp = require("sharp");
const input = "output/playwright/automl-proof-hardening/pdf-pages/presenter-08.png";
const output = "public/images/projects/agentic-automl-stack-proof.png";

sharp(input)
  .resize(1376, 768, { fit: "cover", position: "center" })
  .png({ compressionLevel: 9 })
  .toFile(output)
  .then(() => console.log(output))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
NODE
```

Expected: `public/images/projects/agentic-automl-stack-proof.png` is readable at 1376x768 and shows stack, validation, and auditability proof without exposing private repository state.

- [ ] **Step 3: Write the evidence note**

Create `docs/superpowers/evidence/2026-06-04-automl-proof-hardening.md` with:

```markdown
# AutoML Proof Hardening Evidence

## Source Artifacts

- Product screenshot: `public/images/projects/automl.png`
- Poster proof: `/Users/ayush/Downloads/poster.pdf`
- Presenter proof: `/Users/ayush/Downloads/agentic-automl-presenter.pdf`

## Asset Decision

- Kept `public/images/projects/automl.png` as the primary image because it is a readable private-safe product screenshot.
- Added `public/images/projects/agentic-automl-stack-proof.png` from presenter slide 8 because it proves the stack and validation posture: React 19, Node/Express, Postgres, LangGraph, MCP, Docker, Jupyter, all-green tests, coverage, logs, packages, and migrations.
- Kept `public/images/projects/agentic-automl-poster-proof.png` as secondary poster proof because the full poster is credible but too dense for primary card display.

## Commands

```bash
pdftoppm -png -r 144 -f 8 -l 8 /Users/ayush/Downloads/agentic-automl-presenter.pdf output/playwright/automl-proof-hardening/pdf-pages/presenter
node <<'NODE'
const sharp = require("sharp");
const input = "output/playwright/automl-proof-hardening/pdf-pages/presenter-08.png";
const output = "public/images/projects/agentic-automl-stack-proof.png";

sharp(input)
  .resize(1376, 768, { fit: "cover", position: "center" })
  .png({ compressionLevel: 9 })
  .toFile(output)
  .then(() => console.log(output))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
NODE
```
```

- [ ] **Step 4: Commit the generated asset and evidence note**

Run:

```bash
git add public/images/projects/agentic-automl-stack-proof.png docs/superpowers/evidence/2026-06-04-automl-proof-hardening.md
git commit -m "docs: add automl presenter proof asset"
```

---

### Task 2: Wire AutoML Proof Data And Tests

**Files:**
- Modify: `src/lib/data/projectCaseStudies.ts`
- Modify: `tests/playwright/portfolio-fixtures.ts`
- Modify: `tests/playwright/atlas.spec.ts`

- [ ] **Step 1: Extend artifact type support**

In `src/lib/data/projectCaseStudies.ts`, add `"presentation"` to `CaseStudyArtifact["type"]`.

- [ ] **Step 2: Tighten AutoML validation evidence**

In the AutoML validation row labeled `Evaluation`, set the evidence to:

```ts
"Presenter slide 8 records the stack and validation posture: all-green tests, coverage, logs, packages, and migrations.",
```

- [ ] **Step 3: Add the presenter proof artifact**

In the AutoML `artifacts` array, insert after the real screenshot:

```ts
{
  type: "presentation",
  label: "Presenter stack proof",
  href: withBasePath("/images/projects/agentic-automl-stack-proof.png"),
},
```

- [ ] **Step 4: Update the Playwright proof fixture**

In `tests/playwright/portfolio-fixtures.ts`, add:

```ts
automlPresenterProof: "Presenter stack proof",
automlPresenterEvidence:
  "Presenter slide 8 records the stack and validation posture",
```

inside `EXPECTED_PROOF_ARTIFACTS`.

- [ ] **Step 5: Require the new proof in the AutoML case-study test**

In `tests/playwright/atlas.spec.ts`, inside the AutoML section of `AutoML and Fast MNIST case studies expose artifact-backed proof`, add:

```ts
await expect(
  page.getByText(EXPECTED_PROOF_ARTIFACTS.automlPresenterProof)
).toBeVisible();
await expect(
  page.getByText(EXPECTED_PROOF_ARTIFACTS.automlPresenterEvidence)
).toBeVisible();
```

- [ ] **Step 6: Run the focused regression test**

Run:

```bash
npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts
```

Expected: all tests in `atlas.spec.ts` pass.

- [ ] **Step 7: Commit data and test wiring**

Run:

```bash
git add src/lib/data/projectCaseStudies.ts tests/playwright/portfolio-fixtures.ts tests/playwright/atlas.spec.ts
git commit -m "test: lock automl stack proof"
```

---

### Task 3: Browser Validate AutoML Proof Surface

**Files:**
- Inspect output: `output/playwright/automl-proof-hardening/`
- Modify only if needed: `src/components/case-study/CaseStudyPage.tsx`, `src/lib/data/projectCaseStudies.ts`, or `tests/playwright/*`

- [ ] **Step 1: Run static gates**

Run:

```bash
npm run typecheck
npm run lint
npm run format:check
```

Expected: all pass.

- [ ] **Step 2: Run focused browser checks**

Run:

```bash
npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts tests/playwright/nav-and-images.spec.ts
npm run test:e2e:score -- --project=chromium-desktop
```

Expected: focused tests pass and score remains 10.

- [ ] **Step 3: Capture AutoML case-study screenshots**

Start the portfolio dev server:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Use the Playwright CLI:

```bash
cd output/playwright/automl-proof-hardening
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
"$PWCLI" open http://127.0.0.1:3000/projects/automl/ --headed --session automl-proof
"$PWCLI" screenshot --session automl-proof --filename automl-case-study-top.png
"$PWCLI" eval "() => window.scrollTo({ top: document.querySelector('#validation').offsetTop - 80, behavior: 'auto' })" --session automl-proof
"$PWCLI" screenshot --session automl-proof --filename automl-validation.png
"$PWCLI" eval "() => document.querySelector('#artifacts').scrollIntoView({ block: 'start' })" --session automl-proof
"$PWCLI" screenshot --session automl-proof --filename automl-artifact-links.png
```

Expected: screenshots show the primary AutoML product image, private-proof disclosure, validation evidence, and artifact links without overlap or misleading copy.

- [ ] **Step 4: Update the evidence note with validation results**

Append the commands and pass/fail results to `docs/superpowers/evidence/2026-06-04-automl-proof-hardening.md`.

- [ ] **Step 5: Commit validation evidence**

Run:

```bash
git add docs/superpowers/evidence/2026-06-04-automl-proof-hardening.md
git commit -m "docs: record automl proof validation"
```
