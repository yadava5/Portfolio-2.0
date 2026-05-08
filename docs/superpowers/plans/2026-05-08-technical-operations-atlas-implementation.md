# Technical Operations Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Technical Operations Atlas as the default repo-truth portfolio identity with recruiter CTAs, selected-work proof, static case-study routes, and validation coverage.

**Architecture:** Add `technical-operations-atlas` as the default theme, route it to focused Atlas components, and keep the current five themes behind the existing floating switcher. Use typed data files as the only source of public content. Add static-export-compatible case-study routes for the five flagship projects.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, Tailwind CSS 4, lucide-react, next/image, next/link, next-themes, Playwright.

---

## Execution Status

Implemented on 2026-05-08.

- Added `technical-operations-atlas` as the default theme.
- Added Atlas homepage components and source-truth evidence helpers.
- Added structured case-study data for JobTracker, AutoML Platform, Visual Assist, Taskflow Calendar, and Fast MNIST.
- Added static case-study routes with `generateStaticParams()`.
- Updated the header to prioritize Resume, GitHub, LinkedIn, and Contact.
- Added Atlas Playwright coverage for default identity, first-viewport proof, case-study routes, and generated-content hallucination blocks.

Validation:

- `node_modules/.bin/tsc --noEmit`: passed.
- `node_modules/.bin/eslint . --ext .ts,.tsx`: 0 errors, 21 existing warnings.
- `tests/playwright/atlas.spec.ts --project=chromium-desktop --workers=1`: 7 passed after final header polish.
- `tests/playwright/themes.spec.ts --project=chromium-desktop --workers=1`: 13 passed after final header polish.
- `next build`: passed after rerunning outside the sandbox restriction that blocks Turbopack helper processes.
- Live browser smoke: default theme `technical-operations-atlas`, 4 resume links, GitHub/LinkedIn links present, JobTracker route includes Problem/Architecture/Decisions/Validation/Artifacts, and no known generated fake strings.

## File Structure

- Modify: `src/config/themes.ts` - add `technical-operations-atlas` and make it default.
- Modify: `src/components/themes/ThemeOrchestrator.tsx` - route Atlas to a new focused experience.
- Modify: `src/components/layout/Header.tsx` - add recruiter-first CTA links while preserving section navigation.
- Modify: `src/components/layout/ThemeSwitcher.tsx` - keep switcher secondary and include Atlas in options.
- Create: `src/lib/data/projectCaseStudies.ts` - structured, source-truth case-study proof.
- Create: `src/components/atlas/TechnicalOperationsAtlas.tsx` - default Atlas homepage experience.
- Create: `src/components/atlas/AtlasEvidence.tsx` - reusable metric, pipeline, and evidence-card helpers.
- Create: `src/components/case-study/CaseStudyPage.tsx` - shared case-study renderer.
- Create: `src/components/case-study/SystemDiagram.tsx` - code-native architecture diagram.
- Create: `src/components/case-study/EvidenceTable.tsx` - validation/outcome evidence table.
- Create: `src/app/projects/[id]/page.tsx` - static case-study route.
- Create: `tests/playwright/atlas.spec.ts` - Atlas-specific portfolio usefulness tests.
- Modify: `tests/playwright/portfolio-fixtures.ts` - keep expected theme/data fixtures in sync.
- Modify: `docs/design/unique-themes/README.md` - mark implementation path approved after code lands.

## Task 1: Add Atlas Theme Routing

**Files:**
- Modify: `src/config/themes.ts`
- Modify: `src/components/themes/ThemeOrchestrator.tsx`

- [ ] **Step 1: Add the theme id**

Add `technical-operations-atlas` to `ThemeId`, add a `technicalOperationsAtlas` config with label `Technical Operations Atlas`, insert it first in `themeConfigs`, and set `defaultThemeId` to `technical-operations-atlas`.

- [ ] **Step 2: Route Atlas to a dedicated experience**

Import `TechnicalOperationsAtlas` in `ThemeOrchestrator`. If `theme === "technical-operations-atlas"`, render `<TechnicalOperationsAtlas />` and skip legacy animated backgrounds/cursors.

- [ ] **Step 3: Verify**

Run: `node_modules/.bin/tsc --noEmit`

Expected: typecheck passes or reports only issues in the new edits to fix before continuing.

## Task 2: Add Source-Truth Case Study Data

**Files:**
- Create: `src/lib/data/projectCaseStudies.ts`

- [ ] **Step 1: Define types**

Define `CaseStudyNode`, `CaseStudyEdge`, `CaseStudyArtifact`, and `ProjectCaseStudy` with explicit fields for problem, role, architecture, decisions, validation, outcomes, and artifacts.

- [ ] **Step 2: Add five flagship records**

Add case studies for `jobtracker`, `automl`, `visual-assist`, `taskflow-calendar`, and `fast-mnist-nn`. Use only facts already present in `projects.ts`, `experience.ts`, `personal.ts`, and the extracted resume truth in `content-truth-pass.md`.

- [ ] **Step 3: Add helpers**

Export `projectCaseStudies`, `caseStudyIds`, `getCaseStudyById`, and `getCaseStudyProject`.

- [ ] **Step 4: Verify**

Run: `node_modules/.bin/tsc --noEmit`

Expected: no type errors from the new data module.

## Task 3: Build Atlas Homepage Components

**Files:**
- Create: `src/components/atlas/AtlasEvidence.tsx`
- Create: `src/components/atlas/TechnicalOperationsAtlas.tsx`

- [ ] **Step 1: Add reusable evidence helpers**

Create metric cards, action links, pipeline steps, project cards, and section heading helpers. Keep them presentation-only and pass data through props.

- [ ] **Step 2: Add homepage sections**

Create `TechnicalOperationsAtlas` with sections `hero`, `about`, `experience`, `projects`, `skills`, `testimonials`, and `contact`.

- [ ] **Step 3: Use source truth**

Use `personalInfo`, `socialLinks`, `experiences`, `skillCategories`, `testimonials`, `getPublicProjects`, and `projectCaseStudies`. Do not hard-code fake metrics or generated-image copy.

- [ ] **Step 4: Verify**

Run: `node_modules/.bin/tsc --noEmit`

Expected: the Atlas homepage compiles.

## Task 4: Add Static Case-Study Routes

**Files:**
- Create: `src/components/case-study/SystemDiagram.tsx`
- Create: `src/components/case-study/EvidenceTable.tsx`
- Create: `src/components/case-study/CaseStudyPage.tsx`
- Create: `src/app/projects/[id]/page.tsx`

- [ ] **Step 1: Add diagram renderer**

Render architecture nodes and edges as accessible HTML/CSS. Do not use canvas.

- [ ] **Step 2: Add evidence table**

Render validation and outcomes with labels and evidence text.

- [ ] **Step 3: Add case-study page renderer**

Render Problem, Role, Architecture, Decisions, Validation, Outcomes, and Artifacts. Use the related `Project` record for title, stack, dates, image, and links.

- [ ] **Step 4: Add static route**

Create `generateStaticParams()` from `caseStudyIds`, `generateMetadata()`, and the default route component. Use `notFound()` for missing ids.

- [ ] **Step 5: Verify**

Run: `node_modules/.bin/tsc --noEmit`

Expected: static route types compile.

## Task 5: Make Public Chrome Recruiter-First

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/ThemeSwitcher.tsx`

- [ ] **Step 1: Add header CTAs**

Add visible Resume, GitHub, LinkedIn, and Contact actions from `personalInfo` and `socialLinks`. Keep section navigation available on desktop.

- [ ] **Step 2: Keep theme switcher secondary**

Keep the floating theme switcher accessible for tests and exploration. Adjust text to make Atlas the default identity, not one equal novelty theme.

- [ ] **Step 3: Verify**

Run: `node_modules/.bin/tsc --noEmit`

Expected: no header/switcher type errors.

## Task 6: Add Atlas Validation Tests

**Files:**
- Create: `tests/playwright/atlas.spec.ts`
- Modify: `tests/playwright/portfolio-fixtures.ts`

- [ ] **Step 1: Add default Atlas tests**

Assert default `html[data-theme="technical-operations-atlas"]`, first-viewport CTAs, source-truth name/email, allowed metrics, and required sections.

- [ ] **Step 2: Add case-study route tests**

Visit each flagship `/projects/{id}/` route and assert Problem, Role, Architecture, Decisions, Validation, Outcomes, and Artifacts sections.

- [ ] **Step 3: Add fake-content regression check**

Assert public UI does not contain known generated-image fake strings: `CUNY Brooklyn`, `Offer Success Rate`, `technical-operations-atlas/jobtracker`, `hello@ayushyadav.dev`, `Kafka`, `ClickHouse`, and `1200+ installs`.

- [ ] **Step 4: Verify**

Run: `node_modules/.bin/playwright test tests/playwright/atlas.spec.ts --project=chromium-desktop --workers=1`

Expected: all Atlas tests pass.

## Task 7: Final Validation

**Files:**
- Modify: `docs/design/unique-themes/README.md`

- [ ] **Step 1: Update gate status**

Mark implementation path as approved from repo truth and record the source files created.

- [ ] **Step 2: Run static checks**

Run:

```text
node_modules/.bin/tsc --noEmit
node_modules/.bin/eslint . --ext .ts,.tsx
```

Expected: TypeScript passes. ESLint has 0 errors; existing warnings may remain.

- [ ] **Step 3: Run browser tests**

Run:

```text
node_modules/.bin/playwright test tests/playwright/atlas.spec.ts --project=chromium-desktop --workers=1
node_modules/.bin/playwright test tests/playwright/themes.spec.ts --project=chromium-desktop --workers=1
```

Expected: targeted Atlas and theme rendering tests pass.

- [ ] **Step 4: Browser smoke**

Start dev server with the pinned Node command from `docs/design/unique-themes/baseline.md`, open `http://127.0.0.1:3000`, and verify no build overlay, default Atlas hero, visible resume link, and case-study navigation.
