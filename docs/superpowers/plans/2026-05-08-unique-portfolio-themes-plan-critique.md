# Unique Portfolio Themes Plan Critique and Revision Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the existing unique-theme plan so Portfolio 2.0 becomes a strong computer-science hiring portfolio, not just a visually novel theme system.

**Architecture:** Keep the existing implementation plan as the base, but revise its design strategy before execution. Shift from four equal whole-site themes to one flagship CS portfolio identity with contextual project/case-study modes, then add case-study pages, artifact inventory, recruiter scanning flow, performance budgets, and stricter visual acceptance criteria.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, next-themes, Playwright, axe-core, Lighthouse, static project data, code-native diagrams, and purpose-built SVG.

---

## Critique Verdict

The current plan is strong at avoiding the old portfolio's holographic bento/purple-glass direction, and `ops-control` is the best default idea. The weakness is that it still treats the portfolio as a multi-theme showcase. For a computer science portfolio, that is the wrong center of gravity.

The portfolio should answer these questions within the first 30 seconds:

- What kind of CS/software work does Ayush do?
- Can he ship real systems?
- Can he explain architecture, constraints, testing, and tradeoffs?
- Which three projects should I inspect first?
- Can I quickly reach resume, GitHub, LinkedIn, and email?

The current plan gets close, but it needs a stronger proof-first structure.

## What Is Good In The Current Plan

- `ops-control` is a strong default because it matches Ayush's real Miami IT/data pipeline work.
- The plan correctly rejects generic purple/cyan/pink gradients, glassmorphism, bento dashboards, and centered-name hero design.
- It correctly recognizes that themes must affect section rhythm, motion, background, and evidence treatment, not just colors.
- It includes concept approval before implementation, which is necessary for frontend-app-builder quality.
- It includes Playwright coverage for theme switching, scrolling, reduced motion, screenshots, and overflow.
- It uses the existing repo architecture instead of proposing a framework rewrite.

## What Is Lacking

### 1. Too Many Whole-Site Themes

Four full public themes will dilute the portfolio identity. Hiring/recruiting visitors should not feel like they are evaluating a design-system demo. They need one confident site that makes the work legible.

Better: make `ops-control` the public flagship identity. Use `evidence-ledger`, `native-intelligence`, and `field-systems` as contextual modes inside project cards, case-study pages, or visual sections.

### 2. No Case-Study Route Plan

The plan improves homepage cards but does not add dedicated project pages. A serious CS portfolio needs deep pages for at least:

- JobTracker
- AutoML Platform
- Visual Assist
- Taskflow Calendar
- Fast MNIST Neural Network

Each should show problem, role, architecture, constraints, tradeoffs, tests, metrics, screenshots, code links, and what changed after validation.

### 3. Not Enough Real Artifacts

The plan leans on generated concepts and canvas textures. A CS portfolio looks stronger when the visuals are proof artifacts:

- app screenshots
- architecture diagrams
- pipeline diagrams
- benchmark tables
- test evidence
- short demo clips
- code snippets
- before/after workflow examples

Generated theme images should guide layout, not replace real project evidence.

### 4. No Recruiter Scan Path

The first screen needs a direct scan path:

- role target
- availability
- current role
- 3 proof metrics
- resume button
- GitHub button
- LinkedIn button
- selected work anchor

The current hero language is better than a centered-name hero, but it still needs more conversion structure.

### 5. Missing CS-Specific Credibility

The plan says data/ML/native work, but it does not explicitly surface CS depth:

- algorithms and data structures
- database modeling
- ETL and data quality
- ML evaluation
- SIMD/OpenMP/HPC performance
- distributed/runtime concerns
- testing and CI
- accessibility engineering
- privacy/local-first architecture

These should be visible as proof categories, not just skill tags.

### 6. Performance Risk Is Underspecified

Adding four animated backgrounds, custom cursors, and client-heavy theme routing can easily make the portfolio feel overbuilt. The plan needs budgets:

- no custom cursor on mobile/coarse pointer
- no canvas if reduced motion is enabled
- cap canvas DPR
- no layout-shifting reveal wrappers
- homepage JS budget
- Lighthouse targets
- Playwright screenshot and console-error sweep

### 7. Theme Switcher May Distract

The public header should not foreground a theme switcher if the goal is hiring clarity. Theme controls can exist, but they should be secondary, such as a command/menu setting or a design-lab affordance near the footer.

### 8. Test Plan Does Not Validate Portfolio Usefulness

The current Playwright work validates rendering and scroll health. It should also validate:

- resume link exists
- external links have useful accessible names
- at least three flagship projects are visible above the long-scroll fold
- every case-study page has problem, architecture, tradeoffs, tests, and outcome sections
- no generic prohibited palette strings or old theme labels appear in public UI

## What Will Look Best For A CS Portfolio

The strongest direction is:

**Technical Operations Atlas**

This combines `ops-control` and `evidence-ledger` into one serious visual identity:

- first viewport: command-map hero with real proof metrics and direct CTA actions
- project area: evidence records with architecture thumbnails and impact metrics
- case-study pages: technical dossier layout with problem, system diagram, constraints, tests, and results
- visual style: graphite, white, zinc, warm amber, signal green, small route blue
- typography: clean sans for content, readable mono for metadata/logs only
- motion: small scan/progress/route transitions; no theatrical parallax
- assets: real screenshots, code-native diagrams, benchmark tables, and trace views

Use the other themes as **project-specific treatments**:

- `native-intelligence` for JobTracker and Visual Assist modules
- `field-systems` for Visual Assist and accessibility sections
- `evidence-ledger` for case-study pages and proof records

This will look more professional than four different full-site skins.

## Revision Plan

### Task 1: Revise The Direction Decision

**Files:**
- Modify: `docs/superpowers/plans/2026-05-08-unique-portfolio-themes.md`

- [ ] **Step 1: Replace the four-public-themes framing**

Replace the sentence:

```markdown
Ship four new public themes, with **Ops Control Room** as the default:
```

with:

```markdown
Ship one public flagship identity, **Technical Operations Atlas**, with contextual project treatments derived from Ops Control Room, Evidence Ledger, Native Intelligence, and Field Systems. The visitor should experience one coherent CS portfolio, while individual projects can use visual treatments that match their domain.
```

- [ ] **Step 2: Replace the direction table**

Replace the four-theme table with:

```markdown
| Treatment id | Public role | Core idea | Where it appears |
| --- | --- | --- | --- |
| `technical-operations-atlas` | Default site identity | Data operations command map plus technical evidence ledger | Home, navigation, hero, experience, skills, contact |
| `evidence-ledger` | Case-study treatment | Proof records, metrics, test counts, decisions, tradeoffs | Project cards and all project detail pages |
| `native-intelligence` | Native-project treatment | Local-first app lab, privacy marks, classifier traces, system services | JobTracker and native/mobile project modules |
| `field-systems` | Accessibility-project treatment | High-contrast instrument, LiDAR paths, route overlays, large readable controls | Visual Assist and accessibility proof modules |
```

- [ ] **Step 3: Update the theme-switcher guardrail**

Add this guardrail:

```markdown
- Do not put a large public theme switcher in the primary header. The public portfolio identity should be coherent on first visit. Any visual-mode control must be secondary and must not compete with Resume, GitHub, LinkedIn, or Contact.
```

### Task 2: Add Case-Study Data And Routes

**Files:**
- Modify: `docs/superpowers/plans/2026-05-08-unique-portfolio-themes.md`

- [ ] **Step 1: Add files to the file-structure section**

Add these planned files:

```markdown
- Create: `src/lib/data/projectCaseStudies.ts` - Structured proof data for flagship project detail pages.
- Create: `src/app/projects/[id]/page.tsx` - Static project case-study route.
- Create: `src/app/projects/[id]/metadata.ts` - Per-project SEO/Open Graph metadata helper if the route file becomes too large.
- Create: `src/components/case-study/CaseStudyPage.tsx` - Shared case-study page renderer.
- Create: `src/components/case-study/SystemDiagram.tsx` - Code-native architecture/pipeline diagrams for project proof.
- Create: `src/components/case-study/EvidenceTable.tsx` - Test, metric, and benchmark tables.
```

- [ ] **Step 2: Add the case-study interface**

Add this code block to the plan:

```ts
export interface ProjectCaseStudy {
  projectId: string;
  role: string;
  timeframe: string;
  problem: string;
  constraints: string[];
  architecture: {
    summary: string;
    nodes: Array<{ id: string; label: string; kind: "client" | "api" | "data" | "ml" | "system" }>;
    edges: Array<{ from: string; to: string; label: string }>;
  };
  decisions: Array<{ decision: string; reason: string; tradeoff: string }>;
  validation: Array<{ label: string; evidence: string }>;
  outcomes: Array<{ label: string; value: string; explanation: string }>;
  artifacts: Array<{ type: "screenshot" | "diagram" | "benchmark" | "repo" | "demo"; label: string; href: string }>;
}
```

- [ ] **Step 3: Require five flagship case studies**

Add this acceptance rule:

```markdown
The implementation is not complete until JobTracker, AutoML Platform, Visual Assist, Taskflow Calendar, and Fast MNIST each have a case-study route with Problem, Role, Architecture, Decisions, Validation, Outcomes, and Artifacts sections.
```

### Task 3: Replace Theme-Only Concepts With Portfolio Concepts

**Files:**
- Modify: `docs/superpowers/plans/2026-05-08-unique-portfolio-themes.md`

- [ ] **Step 1: Change the concept-generation list**

Replace "one fresh, readable concept image per theme" with this exact concept set:

```markdown
Generate these concept images before coding:

1. Home desktop concept for `technical-operations-atlas`.
2. Home mobile concept for `technical-operations-atlas`.
3. Project case-study page concept using JobTracker.
4. Project case-study page concept using Fast MNIST.
5. Project evidence card/detail concept showing architecture diagram, metrics, screenshots, and code links.
6. Contact/resume/footer concept with no generic theme-showcase framing.
```

- [ ] **Step 2: Add artifact-first prompt language**

Add this prompt block:

```text
The concepts must look like a computer science portfolio with real engineering proof, not a dashboard template. Use architecture diagrams, project screenshots, test/benchmark evidence, code-native metric tables, and concise case-study summaries. Visuals should help a recruiter or engineer understand what was built, why it mattered, and how it was validated. Do not make visual modes the main story.
```

### Task 4: Add Recruiter Scan Flow

**Files:**
- Modify: `docs/superpowers/plans/2026-05-08-unique-portfolio-themes.md`

- [ ] **Step 1: Add homepage order**

Add this required homepage order:

```markdown
1. Hero: role target, current role, availability, 3 proof metrics, Resume, GitHub, LinkedIn, Contact.
2. Selected Work: three flagship projects with outcome, architecture preview, and case-study link.
3. Experience: Miami IT first, with concrete operational outcomes.
4. Technical Depth: data engineering, ML, native/accessibility, systems/performance, full-stack.
5. Project Index: compact list of remaining projects.
6. Testimonials: manager/teammate validation.
7. Contact: email, LinkedIn, GitHub, resume, location/availability.
```

- [ ] **Step 2: Add first-viewport acceptance criteria**

Add this acceptance checklist:

```markdown
The first viewport passes only if a reviewer can identify Ayush's role target, strongest proof metric, current role, and primary contact action without scrolling.
```

### Task 5: Add Performance And Accessibility Budgets

**Files:**
- Modify: `docs/superpowers/plans/2026-05-08-unique-portfolio-themes.md`

- [ ] **Step 1: Add budgets**

Add this budget block:

```markdown
## Performance And Accessibility Budgets

- Lighthouse Performance: 90+ desktop, 80+ mobile.
- Lighthouse Accessibility: 95+ desktop and mobile.
- No horizontal overflow at 390px, 768px, 1440px.
- No console errors during theme/mode switching, scrolling, or case-study navigation.
- Custom cursor disabled on coarse pointers and reduced motion.
- Animated canvas paused or not mounted when reduced motion is enabled.
- No text smaller than 12px for essential content.
- All external links have accessible names and visible focus styles.
- Project cards and case-study links are keyboard reachable.
```

- [ ] **Step 2: Add Playwright assertions**

Add this test outline:

```ts
test("homepage supports recruiter scan path", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /resume/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /github/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /linkedin/i })).toBeVisible();
  await expect(page.getByText(/1M\\+ rows/i)).toBeVisible();
  await expect(page.getByText(/ITSM Data Integration/i)).toBeVisible();
});

test("flagship projects link to case studies", async ({ page }) => {
  await page.goto("/");
  for (const project of ["JobTracker", "AutoML Platform", "Visual Assist"]) {
    const card = page.locator("article").filter({ hasText: project }).first();
    await expect(card.getByRole("link", { name: /case study/i })).toBeVisible();
  }
});
```

### Task 6: Revise Final Validation

**Files:**
- Modify: `docs/superpowers/plans/2026-05-08-unique-portfolio-themes.md`

- [ ] **Step 1: Add portfolio usefulness review**

Add this final review gate:

```markdown
Before completion, write a portfolio-usefulness ledger with:

- First-screen scan result.
- Top three project proof records.
- Case-study route coverage.
- Resume/GitHub/LinkedIn/contact path check.
- Performance and accessibility scores.
- Mobile screenshot review.
- One paragraph explaining why this looks like a serious CS portfolio rather than a generic animated website.
```

### Task 7: Apply Final Pre-Implementation Audit Fixes

**Files:**
- Modify: `docs/superpowers/plans/2026-05-08-unique-portfolio-themes.md`

- [ ] **Step 1: Mark the original four-theme plan as superseded**

Add this note directly below the agentic-worker header:

```markdown
> **Final audit status:** Do not execute this original four-theme plan unchanged. First apply the revision and final-audit gates in `docs/superpowers/plans/2026-05-08-unique-portfolio-themes-plan-critique.md`; that addendum supersedes this plan's "four public themes" direction with one flagship **Technical Operations Atlas** identity plus contextual project/case-study treatments.
```

- [ ] **Step 2: Add static export requirements for project routes**

Because `next.config.ts` uses `output: "export"`, every planned `src/app/projects/[id]/page.tsx` route must define static params. Add this code block to the case-study route task:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projectCaseStudies } from "@/lib/data/projectCaseStudies";
import { projects } from "@/lib/data/projects";
import { CaseStudyPage } from "@/components/case-study/CaseStudyPage";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return projectCaseStudies.map((caseStudy) => ({ id: caseStudy.projectId }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((item) => item.id === id);

  if (!project) {
    return {
      title: "Project Not Found | Ayush Yadav",
    };
  }

  return {
    title: `${project.title} Case Study | Ayush Yadav`,
    description: project.shortDescription,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const caseStudy = projectCaseStudies.find((item) => item.projectId === id);
  const project = projects.find((item) => item.id === id);

  if (!caseStudy || !project) {
    notFound();
  }

  return <CaseStudyPage project={project} caseStudy={caseStudy} />;
}
```

- [ ] **Step 3: Correct Playwright project commands**

The repo's `playwright.config.ts` defines `chromium-desktop` and `chromium-mobile`. Use those exact project names in plan commands:

```bash
npm run test:e2e -- --project=chromium-desktop
npm run test:e2e -- --project=chromium-mobile
```

For faster targeted validation during implementation, use:

```bash
npm run test:e2e -- --project=chromium-desktop tests/playwright/theme-visual-audit.spec.ts
```

- [ ] **Step 4: Add an artifact inventory gate before concept generation**

Add this task before any Image Gen concept task:

```markdown
### Task 0: Artifact Inventory

**Files:**
- Create: `docs/design/unique-themes/artifact-inventory.md`
- Read: `public/images/projects/*`, `public/resume.pdf`, `src/lib/data/projects.ts`

- [ ] **Step 1: Inventory existing project assets**

Record which assets exist for each flagship project:

| Project | Required asset | Existing path | Status |
| --- | --- | --- | --- |
| JobTracker | screenshot or product visual | `public/images/projects/jobtracker.png` | present |
| AutoML Platform | screenshot or architecture visual | `public/images/projects/automl.png` | present |
| Visual Assist | screenshot or product visual | `public/images/projects/visual-assist.png` | present |
| Taskflow Calendar | screenshot or product visual | `public/images/projects/taskflow.png` | present |
| Fast MNIST | screenshot or benchmark visual | `public/images/projects/mnist.png` and `public/images/projects/fast-mnist-nn.svg` | present |

- [ ] **Step 2: Define missing artifact replacements**

If a real screenshot is too weak for a case study, replace it with a code-native architecture diagram or benchmark table. Do not use generated decorative art as the primary proof for a project.
```

- [ ] **Step 5: Add dirty-worktree handling**

Add this pre-implementation instruction:

```markdown
Before editing source files, run `git status --short`. If there are existing modified app files, read their diffs and work with them; do not revert user changes. Record the baseline dirty files in the implementation handoff before the first code edit.
```

- [ ] **Step 6: Add baseline validation**

Add this pre-implementation validation gate:

```bash
npm run typecheck
npm run lint
npm run test:e2e -- --project=chromium-desktop tests/playwright/themes.spec.ts
```

Expected: record the actual pass/fail state before code edits. If the stale theme tests fail before implementation, document the failures as baseline drift and do not count them as regressions from the new work.

## Final Recommendation

Do not execute the original plan unchanged. First revise it with the tasks above. The best-looking portfolio for Ayush is a single **Technical Operations Atlas** identity: operational, evidence-heavy, fast, accessible, and grounded in real project artifacts. The themes should become visual treatments for proof, not the product itself.

## Self-Review

### Spec Coverage

- Critique of the existing plan: covered in Critique Verdict and What Is Lacking.
- What would really look good for a CS portfolio: covered in Technical Operations Atlas recommendation.
- Use writing-plans: this addendum is saved under `docs/superpowers/plans/` with an implementation-plan header and task checklist.
- No implementation: this addendum changes documentation only.

### Red-Flag Scan

No missing-detail markers are used. Every revision task includes exact replacement text, code, or acceptance criteria.

### Type Consistency

The proposed `ProjectCaseStudy` type uses `projectId` to connect to existing `Project.id` values from `src/lib/data/projects.ts`. Proposed route paths match the Next.js App Router structure.
