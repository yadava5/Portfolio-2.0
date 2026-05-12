# Playwright + Recruiter Quality Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portfolio validation suite truthful and maintainable, clean generated repo noise, and close the remaining recruiter-facing trust gaps found by the complete Playwright run and parallel audits.

**Architecture:** Keep the current Next.js portfolio and Technical Operations Atlas surface. Separate assertion tests from artifact-generation scripts, keep generated Playwright outputs outside git, and tighten portfolio evidence so private work reads as credible summaries rather than unverifiable screenshots.

**Tech Stack:** Next.js 16.1.6, React 19.2.3, TypeScript, Tailwind CSS 4, next-themes, GSAP, Playwright, axe-core/playwright, Prettier, ESLint.

---

## Current Audit Baseline

- Full command run: `npm run test:e2e`.
- Result: 574 total tests, 339 passed, 195 failed, 10 skipped, 30 did not run.
- Build step passed before Playwright started.
- Repo cleanup already performed for ignored outputs: removed generated `playwright-report/`, `test-results/`, `output/`, generated screenshot folders, and static `out/` build output. These are all reproducible.
- Current tracked/generated debt remains: 92 tracked `.png`/`.webm` files under `tests/playwright`, plus stale generated reports such as `tests/playwright/audit-report.json` and QA summary files.
- Current safe tracked cleanup change: `.gitignore` now ignores future Playwright reports and generated screenshots.

## Failure Diagnosis

1. Mobile theme switcher contract is wrong in legacy tests.
   - App behavior: `src/components/layout/ThemeSwitcher.tsx` hides the floating theme picker below `md`.
   - Test conflict: `tests/playwright/atlas.spec.ts` expects the mobile picker to stay out of the way, but many legacy specs still call `switchThemeAndWait()` and require the picker to be visible on mobile.
   - Source of repeated failures: `tests/playwright/portfolio-fixtures.ts` lines around `switchThemeAndWait()`.

2. Several test assertions are stale against the recruiter-pass content.
   - `comprehensive-qa.spec.ts` has a strict `May 2026` text locator that matches multiple elements.
   - `deep-qa.spec.ts` still expects Aramark and LifeQuest in positions that no longer match the Atlas-first portfolio.
   - `atlas.spec.ts` mobile metric check can hit hidden responsive copies of `1M+`.

3. Artifact-producing suites are part of the default CI command.
   - Specs such as `themes.spec.ts`, `full-audit.spec.ts`, `visual-audit.spec.ts`, `visual-regression.spec.ts`, `critique-screenshots.spec.ts`, and `record-walkthroughs.spec.ts` write screenshots, reports, or video outputs under tracked paths.
   - These are useful manual QA tools, but they should not mutate the repo during default validation.

4. URL handling is brittle.
   - Several specs still hardcode `http://127.0.0.1:3000`.
   - Tests should derive URLs from Playwright `baseURL` or the current page URL so they work under local static server, dev server, CI, and GitHub Pages base paths.

5. Recruiter-facing credibility gaps remain.
   - Private project visuals are presented like screenshots even when they are conceptual/generated proof images.
   - Site and resume truth are inconsistent for email, project names, and project dates.
   - Some private-work claims are sharper than the available public proof supports.
   - Private case studies exist but are not always linked from the Project Index.
   - Mobile header hides important recruiter links such as GitHub and LinkedIn behind desktop-only layout.
   - README and social preview metadata still describe the old theme direction.

## Implementation Tasks

### Phase 1 - Stabilize Test Theme Control

- [x] In `tests/playwright/portfolio-fixtures.ts`, add a direct theme setter that uses the real next-themes contract:

```ts
export async function applyThemeState(
  page: Page,
  theme: { name: string; label: string }
) {
  await page.evaluate((themeName) => {
    window.localStorage.setItem("portfolio-theme", themeName);
    document.documentElement.setAttribute("data-theme", themeName);
  }, theme.name);

  await expect(page.locator("html")).toHaveAttribute("data-theme", theme.name, {
    timeout: 10000,
  });
}
```

- [x] Keep `switchThemeAndWait()` as the desktop UI path only. If the viewport is mobile, have it call `applyThemeState()` instead of expecting the hidden button.
- [x] Add a separate helper named `switchThemeViaUiAndWait()` for specs that explicitly validate the visible theme picker.
- [x] Update all all-theme rendering/a11y/navigation specs to use the direct theme state helper when the purpose is "render this theme" rather than "test the picker UI".
- [x] Keep the Atlas mobile test that verifies the theme picker is hidden, because that matches the current product decision.
- [x] Update mobile picker interaction specs in `tests/playwright/interactions.spec.ts`, `tests/playwright/comprehensive-qa.spec.ts`, and `tests/playwright/deep-qa.spec.ts` to skip or assert hidden behavior on mobile.

Phase 1 verification completed on 2026-05-12:

```bash
npm run typecheck
npm run lint
npx playwright test tests/playwright/atlas.spec.ts tests/playwright/interactions.spec.ts --project=chromium-desktop --project=chromium-mobile
```

Result: typecheck passed; lint passed with 21 existing warnings; focused Playwright passed with 52 passed, 10 skipped, 0 failed.

Verification after Phase 1:

```bash
npm run typecheck
npm run lint
npx playwright test tests/playwright/atlas.spec.ts tests/playwright/interactions.spec.ts --project=chromium-desktop --project=chromium-mobile
```

### Phase 2 - Split Assertion Tests From Artifact Scripts

- [x] Add explicit scripts in `package.json`:

```json
"test:e2e": "NEXT_PUBLIC_BASE_PATH= next build --webpack && playwright test tests/playwright/atlas.spec.ts tests/playwright/a11y-audit.spec.ts tests/playwright/interactions.spec.ts tests/playwright/nav-and-images.spec.ts tests/playwright/comprehensive-qa.spec.ts",
"test:e2e:full": "NEXT_PUBLIC_BASE_PATH= next build --webpack && playwright test",
"test:e2e:artifacts": "playwright test tests/playwright/themes.spec.ts tests/playwright/full-audit.spec.ts tests/playwright/visual-audit.spec.ts tests/playwright/visual-regression.spec.ts tests/playwright/critique-screenshots.spec.ts tests/playwright/record-walkthroughs.spec.ts"
```

- [x] Move screenshot/report writes out of `tests/playwright/**` into `output/playwright/**`:
  - `tests/playwright/themes.spec.ts`
  - `tests/playwright/full-audit.spec.ts`
  - `tests/playwright/visual-audit.spec.ts`
  - `tests/playwright/visual-regression.spec.ts`
  - `tests/playwright/critique-screenshots.spec.ts`
  - `tests/playwright/record-walkthroughs.spec.ts`
  - `tests/playwright/debug-audit.spec.ts`
- [x] Ensure each artifact spec creates its output directory with Playwright/Node filesystem APIs before writing.
- [x] Ensure artifact suites are opt-in and documented as visual audit tools, not default CI checks.
- [x] Keep `.gitignore` entries for `/output/playwright/`, `/playwright-report/`, `/test-results/`, and generated screenshots.

Phase 2 verification completed on 2026-05-12:

```bash
npm run test:e2e
npm run test:e2e:artifacts -- --project=chromium-desktop
```

Result: default suite passed with 120 passed, 10 skipped; artifact suite passed with 64 passed; generated files stayed under ignored `output/playwright/`.

Verification after Phase 2:

```bash
git status --short
npm run test:e2e
git status --short
npm run test:e2e:artifacts -- --project=chromium-desktop
git status --short
```

Expected result: default `npm run test:e2e` leaves no generated tracked changes. Artifact command may create ignored files only.

### Phase 3 - Remove Stale Tracked Playwright Artifacts

- [x] Review the tracked generated files before deleting them:

```bash
git ls-files tests/playwright | rg '\\.(png|webm)$|audit-report\\.json$|QA-|SUMMARY|REPORT|screenshots/|videos/'
```

- [x] Remove generated artifacts from git history going forward:

```bash
git rm tests/playwright/audit-report.json
git rm tests/playwright/videos/*.webm
git rm tests/playwright/screenshots/**/*.png
git rm tests/playwright/critique-screenshots/**/*.png
```

- [x] Review stale QA markdown/txt files under `tests/playwright` and either update them into a current README or remove them if they are generated reports.
- [x] Keep source specs and any intentionally maintained Playwright docs.

Phase 3 verification completed on 2026-05-12:

```bash
git ls-files tests/playwright | rg '\\.(png|webm)$|audit-report\\.json$|QA-|SUMMARY|REPORT' || true
npm run test:e2e
```

Result: stale tracked artifact query returned no files; default suite passed with 120 passed, 10 skipped.

Verification after Phase 3:

```bash
git ls-files tests/playwright | rg '\\.(png|webm)$|audit-report\\.json$|QA-|SUMMARY|REPORT' || true
git status --short
```

### Phase 4 - Repair Stale Assertions

- [x] Replace hardcoded local URLs with a shared helper in `tests/playwright/portfolio-fixtures.ts`:

```ts
export function absoluteUrl(page: Page, path: string) {
  return new URL(path, page.url()).toString();
}
```

- [x] Update hardcoded URL users:
  - `tests/playwright/comprehensive-qa.spec.ts`
  - `tests/playwright/nav-and-images.spec.ts`
  - `tests/playwright/debug-audit.spec.ts`
  - `tests/playwright/deep-qa.spec.ts`
  - `tests/playwright/full-audit.spec.ts`
- [x] Fix `May 2026` strict locator by checking visible text within the education/about scope instead of a global strict text locator.
- [x] Update experience assertions to read from `src/lib/data/experience.ts` rather than hardcoding both Miami and Aramark.
- [x] Update project count/title assertions to read from `src/lib/data/projects.ts` and the actual selected-work contract.
- [x] Scope Atlas metric checks to visible metric components instead of hidden responsive duplicates.
- [x] Remove obsolete expected theme names and old project claims from Playwright docs.

Phase 4 verification completed on 2026-05-12:

```bash
npx playwright test tests/playwright/comprehensive-qa.spec.ts tests/playwright/deep-qa.spec.ts tests/playwright/nav-and-images.spec.ts --project=chromium-desktop --project=chromium-mobile
```

Result: Phase 4 subset passed with 370 passed, 0 failed.

Verification after Phase 4:

```bash
npx playwright test tests/playwright/comprehensive-qa.spec.ts tests/playwright/deep-qa.spec.ts tests/playwright/nav-and-images.spec.ts --project=chromium-desktop --project=chromium-mobile
```

### Phase 5 - Recruiter Evidence Quality Pass

- [x] Extract current resume text and reconcile it against site data:

```bash
pdftotext public/resume.pdf -
```

- [x] Reconcile these source-of-truth fields:
  - `src/lib/data/personal.ts`: email, resume URL, metadata title/description.
  - `src/lib/data/projects.ts`: project names, date ranges, proof language, private labels.
  - `src/lib/data/experience.ts`: claim wording around 1M+ operational rows/assets.
  - `src/lib/data/projectCaseStudies.ts`: private evidence labels and disclosure text.
- [x] Add a structured case-study field for evidence disclosure, for example:

```ts
evidenceDisclosure?: {
  label: string;
  detail: string;
};
```

- [x] Render that disclosure near the top of `src/components/case-study/CaseStudyPage.tsx`, before private project proof cards.
- [x] Rename generated/conceptual private visuals from "screenshot" to "concept diagram" or "architecture summary" unless the asset is a real captured screen.
- [x] Update case-study image alt text so private diagrams are not announced as screenshots.
- [x] In `src/components/atlas/TechnicalOperationsAtlas.tsx`, link private index cards to their case-study routes when a matching case study exists.
- [x] Tone down over-specific private-work claims where public evidence is not available:
  - Prefer "1M+ operational rows/assets" over "1M+ IT assets daily" unless that exact daily claim is supported.
  - Prefer "reduced manual reconciliation effort" over unsupported quantified claims.
- [x] Add a compact mobile header menu or recruiter link row that exposes GitHub, LinkedIn, Resume, and Contact without crowding the first viewport.
- [x] Update `README.md` so it describes the Atlas recruiter portfolio, Next.js 16, current scripts, artifact policy, and validation commands.
- [x] Update social preview metadata and image plan so the first shared impression matches the current Atlas surface.

Phase 5 verification completed on 2026-05-12:

```bash
python3 -c "from PyPDF2 import PdfReader; r=PdfReader('public/resume.pdf'); print('\n'.join(page.extract_text() or '' for page in r.pages))"
npm run typecheck
npm run lint
npm run format:check
NEXT_PUBLIC_BASE_PATH= npm run build -- --webpack
npx playwright test tests/playwright/atlas.spec.ts --project=chromium-desktop --project=chromium-mobile
```

Result: resume text extracted with PyPDF2 because `pdftotext` was unavailable; typecheck passed; lint passed with 21 existing warnings; format check passed; static build passed; Atlas Playwright passed with 26 passed, 0 failed.

Verification after Phase 5:

```bash
npm run typecheck
npm run lint
npm run format:check
npx playwright test tests/playwright/atlas.spec.ts --project=chromium-desktop --project=chromium-mobile
```

### Phase 6 - Complete Browser Validation Gate

- [x] Run the cleaned default suite:

```bash
npm run test:e2e
```

- [x] Run the complete suite after all test repairs:

```bash
npm run test:e2e:full
```

- [x] Run a Playwright CLI snapshot pass against the running app for manual inspection of scroll and transition behavior:

```bash
npm run dev
/Users/ayush/.codex/skills/playwright/scripts/playwright_cli.sh --help
```

- [x] Use the Playwright CLI or repo tests to capture:
  - Desktop first viewport.
  - Mobile first viewport.
  - Full-page scroll through Atlas.
  - Theme switcher open/close on desktop.
  - Resume, GitHub, LinkedIn, Contact links.
  - At least one private case-study route with disclosure visible above the first proof card.
- [x] Confirm `git status --short` contains only intentional source/doc changes after validation.

Phase 6 verification completed on 2026-05-12:

```bash
npm run test:e2e
npm run test:e2e:full
npm run dev -- --hostname 127.0.0.1 --port 3000
/Users/ayush/.codex/skills/playwright/scripts/playwright_cli.sh open http://127.0.0.1:3000 --headed
node -e "<manual Playwright browser validation for desktop, mobile, scroll, theme menu, links, and private case-study disclosure>"
```

Result: default Playwright passed with 120 passed and 10 skipped; full Playwright passed with 564 passed and 10 skipped; manual browser validation captured desktop/mobile/theme/case-study screenshots under ignored `output/playwright/manual-phase6/`. Playwright CLI successfully opened the local app and captured its initial snapshot, but the CLI daemon did not remain attachable for follow-up commands, so the same validation points were completed with a direct Playwright Chromium run. The manual pass confirmed no mobile horizontal overflow, visible Resume/GitHub/LinkedIn/Contact links on desktop and mobile, desktop theme switcher open/close, full-page scroll coverage through the Atlas sections, and private case-study disclosure before proof/artifact sections.

### Phase 7 - Follow-up Repo Cleanup Gate

- [x] Remove leftover lint warnings from unused imports and unused `idx` callback parameters in legacy section components and root helper scripts.
- [x] Update root `tests/*.mjs` Playwright helper scripts so they no longer write to historical `/sessions/.../test-screenshots` paths.
- [x] Update root helper scripts to use `PORTFOLIO_BASE_URL` with a local default, current theme IDs, and the `portfolio-theme` storage key.
- [x] Add narrow ignores for legacy generated reports/videos that should not be reintroduced under `tests/playwright`.
- [x] Replace stale comprehensive QA heuristics that warned on valid theme-specific project and skill-section copy.

Phase 7 verification completed on 2026-05-12:

```bash
npm run lint
npm run typecheck
npm run format:check
rg -n "/sessions|test-screenshots|localhost:34|localStorage\.setItem\(\"theme\"|dark-luxe|paper-ink|editorial|noir-cinema|neon-cyber" tests -g "*.mjs" || true
npx playwright test tests/playwright/atlas.spec.ts --project=chromium-desktop --project=chromium-mobile
npx playwright test tests/playwright/comprehensive-qa.spec.ts --project=chromium-desktop --project=chromium-mobile
npm run test:e2e
```

Result: lint passed with no warnings, typecheck passed, format check passed, stale helper-script path scan returned no matches, focused Atlas Playwright passed with 26 passed, comprehensive QA passed with 26 passed and 0 warning reports, and the final default Playwright gate passed with 120 passed and 10 skipped.

## Commit Plan

- [ ] Commit 1: Repo and Playwright artifact hygiene.
  - `.gitignore`
  - removal of tracked generated artifacts
  - package script split
  - Playwright output path changes
- [ ] Commit 2: Playwright contract repairs.
  - fixture helpers
  - mobile theme switcher assertions
  - stale content assertion fixes
  - base URL helper updates
- [ ] Commit 3: Recruiter evidence quality.
  - case-study disclosure model/rendering
  - claim wording
  - private visual labels
  - private index links
  - mobile recruiter navigation
- [ ] Commit 4: Documentation refresh.
  - README
  - Playwright docs/index updates
  - validation notes

## Self-Critique Before Implementation

- This plan intentionally fixes the validation contract before recruiter polish. Otherwise the test suite will keep producing false negatives and dirty artifacts after every visual pass.
- The biggest product risk is credibility, not visual novelty. The Atlas theme already has a distinctive portfolio direction; the next work should make proof language and case-study evidence more precise.
- The largest engineering risk is deleting tracked artifacts too aggressively. Use `git ls-files` review before `git rm`, and do not remove source specs.
- The portfolio should not add another broad visual theme now. It needs cleaner proof, better mobile recruiter navigation, and a test suite that validates the current product truth.
- Completion is not just "tests pass." Completion requires a clean worktree after Playwright, because generated test output has been a recurring source of repo noise.
