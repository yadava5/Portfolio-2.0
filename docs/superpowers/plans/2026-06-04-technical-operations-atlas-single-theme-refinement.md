# Technical Operations Atlas Single-Theme Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Portfolio 2.0 from "Atlas plus legacy theme showcase" into one recruiter-facing Technical Operations Atlas identity with updated graduate copy, portrait trust signal, stronger proof ordering, and Playwright-verified browser quality.

**Architecture:** Keep the existing Atlas component/data architecture, but remove public access to alternate themes by hiding the switcher and limiting public theme IDs to Atlas. Update source-truth data first, then render it through the Atlas homepage and case-study pages. Keep legacy theme component files temporarily unreachable rather than deleting them in this pass.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, Tailwind CSS 4, next-themes, Playwright test runner, Playwright CLI wrapper.

---

## File Structure

- Modify: `src/config/themes.ts` - keep legacy config objects available, but expose only Atlas through `themeIds`.
- Modify: `src/app/layout.tsx` - remove public `ThemeSwitcher` import/render and update shell comments.
- Modify: `src/lib/data/personal.ts` - update graduate identity, availability, bio, SEO copy, and portrait source.
- Create: `public/images/profile/ayush-yadav-professional-portrait.png` - portfolio portrait copied from the selected iCloud photo.
- Create: `public/images/projects/agentic-automl-poster-proof.png` - poster-derived AutoML proof image rendered from the local poster PDF.
- Modify: `src/lib/data/projects.ts` - reorder and tighten project records around AutoML and Fast MNIST proof.
- Modify: `src/lib/data/projectCaseStudies.ts` - reorder case studies, add AutoML poster artifact, add AutoML individual-contribution evidence, and strengthen Fast MNIST artifact links.
- Modify: `src/components/atlas/TechnicalOperationsAtlas.tsx` - update hero/about/contact copy, add portrait panel, refine proof metrics, reduce density, and show ranked proof records.
- Modify: `tests/playwright/portfolio-fixtures.ts` - update expected metrics and stale-copy guardrails.
- Modify: `tests/playwright/atlas.spec.ts` - add single-theme, graduate-copy, portrait, project-order, and proof-artifact tests.
- Modify: `tests/playwright/interactions.spec.ts` - replace theme-switcher interaction expectations with Atlas-only interaction expectations.
- Output only: `output/playwright/atlas-single-theme-refinement/` - Playwright CLI screenshots/video artifacts.

---

### Task 1: Collapse The Public Theme Surface

**Files:**
- Modify: `tests/playwright/atlas.spec.ts`
- Modify: `tests/playwright/interactions.spec.ts`
- Modify: `src/config/themes.ts`
- Modify: `src/app/layout.tsx`

- [x] **Step 1: Add failing Atlas-only public surface assertions**

Add this test inside `test.describe("Technical Operations Atlas", () => { ... })` after the default identity test:

```ts
test("public surface exposes Atlas only", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.locator("#hero").waitFor({ state: "attached" });

  await expect(page.locator("html")).toHaveAttribute(
    "data-theme",
    DEFAULT_THEME
  );
  await expect(page.getByRole("button", { name: /select theme/i })).toHaveCount(
    0
  );
});
```

- [x] **Step 2: Replace theme-switcher interaction tests**

In `tests/playwright/interactions.spec.ts`, delete the entire `test.describe("Theme Switching via data-theme attribute", ...)` block and replace it with:

```ts
test.describe("Single Atlas Theme", () => {
  test.setTimeout(30000);

  test("no public theme selector is rendered", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute(
      "data-theme",
      "technical-operations-atlas"
    );
    await expect(page.getByRole("button", { name: /select theme/i })).toHaveCount(
      0
    );
  });
});
```

In the same file, delete the entire `test.describe("Theme Switcher Button", ...)` block at the bottom. No replacement is needed because the public requirement is now covered by the new single-theme test and `atlas.spec.ts`.

- [x] **Step 3: Run the failing tests**

Run:

```bash
npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts tests/playwright/interactions.spec.ts
```

Expected: FAIL. The failure should show that the desktop theme selector is still rendered.

- [x] **Step 4: Limit public theme IDs to Atlas**

In `src/config/themes.ts`, replace:

```ts
export const themeIds = Object.keys(themeConfigs) as ThemeId[];
```

with:

```ts
export const themeIds: ThemeId[] = ["technical-operations-atlas"];
```

Keep the existing `ThemeId` union and `themeConfigs` object unchanged in this pass so legacy files continue to typecheck while the public provider receives only Atlas.

- [x] **Step 5: Remove the public theme switcher from layout**

In `src/app/layout.tsx`, remove:

```ts
import ThemeSwitcher from "@/components/layout/ThemeSwitcher";
```

Remove this line from the rendered shell:

```tsx
<ThemeSwitcher />
```

Update the top file comment by replacing:

```ts
 *   8. ThemeSwitcher  — floating theme picker
```

with:

```ts
 *   8. Atlas-only public identity; legacy visual modes are not rendered
```

- [x] **Step 6: Verify Task 1**

Run:

```bash
npm run typecheck
npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts tests/playwright/interactions.spec.ts
```

Expected: TypeScript passes. The Playwright tests pass for the Atlas-only public surface.

- [x] **Step 7: Commit Task 1**

```bash
git add src/config/themes.ts src/app/layout.tsx tests/playwright/atlas.spec.ts tests/playwright/interactions.spec.ts
git commit -m "refactor: expose atlas as the only public theme"
```

---

### Task 2: Update Graduate Identity And Portrait

**Files:**
- Modify: `tests/playwright/atlas.spec.ts`
- Modify: `tests/playwright/portfolio-fixtures.ts`
- Modify: `src/lib/data/personal.ts`
- Modify: `src/components/atlas/TechnicalOperationsAtlas.tsx`
- Create: `public/images/profile/ayush-yadav-professional-portrait.png`

- [x] **Step 1: Add failing graduate identity and portrait assertions**

In `tests/playwright/portfolio-fixtures.ts`, add:

```ts
export const EXPECTED_GRADUATE_IDENTITY = {
  role: "New-grad software engineer",
  education: "B.S. Computer Science, Miami University, May 2026",
  availability: "Open to new-grad software, data, and ML engineering roles",
  portraitAlt: "Ayush Yadav professional portrait",
};
```

In `tests/playwright/atlas.spec.ts`, add this constant near `REQUIRED_SECTIONS`:

```ts
const STALE_IDENTITY_COPY = [
  "Senior CS student",
  "Senior Computer Science student",
  "Expected May 2026",
  "Open to internships",
];
```

In `tests/playwright/atlas.spec.ts`, add `EXPECTED_GRADUATE_IDENTITY` to the import list from `./portfolio-fixtures`.

Add this test after the single-theme public surface test:

```ts
test("shows graduate identity and professional portrait", async ({ page }) => {
  await page.goto("/");
  await page.locator("#hero").waitFor({ state: "attached" });

  await expect(page.locator("#hero")).toContainText(
    EXPECTED_GRADUATE_IDENTITY.role
  );
  await expect(page.locator("#about")).toContainText(
    EXPECTED_GRADUATE_IDENTITY.education
  );
  await expect(page.locator("body")).toContainText(
    EXPECTED_GRADUATE_IDENTITY.availability
  );
  await expect(
    page.getByRole("img", {
      name: EXPECTED_GRADUATE_IDENTITY.portraitAlt,
    })
  ).toBeVisible();

  const bodyText = await page.locator("body").innerText();
  for (const stale of STALE_IDENTITY_COPY) {
    expect(bodyText).not.toContain(stale);
  }
});
```

- [x] **Step 2: Run the failing identity test**

Run:

```bash
npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts
```

Expected: FAIL because the app still says senior student, expected graduation, and has no portrait image.

- [x] **Step 3: Copy the selected portrait asset**

Run:

```bash
mkdir -p public/images/profile
cp "/Users/ayush/Library/Mobile Documents/com~apple~CloudDocs/Media/Photos/LinkedIn/ChatGPT Image Dec 20, 2025 at 05_39_56 PM.png" public/images/profile/ayush-yadav-professional-portrait.png
file public/images/profile/ayush-yadav-professional-portrait.png
```

Expected: `PNG image data, 1024 x 1536, 8-bit/color RGB`.

- [x] **Step 4: Update personal source truth**

In `src/lib/data/personal.ts`, update the `personalInfo` object with these values:

```ts
  /** Professional title/tagline */
  title: "ITSM Data Integration Student Associate",
  /** Short tagline for hero section */
  tagline: "New-grad software engineer focused on data, ML systems, and full-stack reliability",
  /** Email address */
  email: "aesh_1055@icloud.com",
  /** Location */
  location: "Oxford, Ohio",
  /** Current availability */
  availability: "Open to new-grad software, data, and ML engineering roles",
  /** Professional portrait */
  portrait: {
    image: withBasePath("/images/profile/ayush-yadav-professional-portrait.png"),
    alt: "Ayush Yadav professional portrait",
  },

  /** Bio paragraphs for about section */
  bio: [
    "Computer Science graduate from Miami University focused on data pipelines, applied machine learning, and reliable software systems end-to-end.",
    "I work as an ITSM Data Integration Student Associate at Miami University, where I build Python and data pipelines for Tableau/OAS and operational reporting, translate messy records into trusted datasets, and ship dashboards and automations that teams actually use.",
    "I enjoy backend/full-stack engineering, data engineering, and ML-adjacent product work, especially where performance, reliability, and clear user impact matter.",
  ],
```

In the same file, update the education comment:

```ts
  /** End date (YYYY-MM) */
```

Update `siteMetadata.description` to:

```ts
  description:
    "Technical Operations Atlas for Ayush Yadav: new-grad software, data, and ML engineering proof with source-truth case studies, private-safe evidence, and current resume links.",
```

- [x] **Step 5: Update Atlas hero and about copy**

In `src/components/atlas/TechnicalOperationsAtlas.tsx`, replace the hero role text:

```tsx
<p className="mb-4 text-lg font-semibold text-zinc-100 md:text-2xl">
  New-grad software engineer focused on data, ML systems, and full-stack reliability
</p>
```

Replace the hero body paragraph with:

```tsx
<p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-400 md:text-lg md:leading-7">
  <span className="sm:hidden">
    Computer Science graduate building data pipelines, ML workflows,
    full-stack systems, and accessible native products.
  </span>
  <span className="hidden sm:inline">
    Computer Science graduate focused on data pipelines, applied ML,
    full-stack systems, performance work, and accessible native products.
    Current work turns operational records, Tableau metadata, and ML
    workflows into trusted datasets, dashboards, and validated product
    surfaces.
  </span>
</p>
```

Replace the About section heading title with:

```tsx
title="Computer Science graduate shipping data, ML, native, and full-stack systems."
```

Replace the education line:

```tsx
{education[0].school} - Expected {graduationDate}
```

with:

```tsx
{education[0].school} - Graduated {graduationDate}
```

- [x] **Step 6: Add the portrait to the About section**

In `src/components/atlas/TechnicalOperationsAtlas.tsx`, inside the `#about` section, replace:

```tsx
<div className="grid gap-5">
```

with:

```tsx
<div className="grid gap-5">
  <div className="grid gap-5 rounded border border-zinc-800 bg-zinc-950/70 p-5 sm:grid-cols-[140px_1fr] sm:items-center">
    <img
      src={personalInfo.portrait.image}
      alt={personalInfo.portrait.alt}
      className="aspect-[2/3] w-32 rounded border border-zinc-800 object-cover object-top sm:w-36"
    />
    <div>
      <p className="text-xs tracking-[0.2em] text-zinc-500 uppercase">
        Profile
      </p>
      <p className="mt-2 text-xl font-semibold text-zinc-50">
        {personalInfo.name}
      </p>
      <p className="mt-1 text-sm text-zinc-400">
        {personalInfo.availability}
      </p>
    </div>
  </div>
```

- [x] **Step 7: Verify Task 2**

Run:

```bash
npm run typecheck
npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts
```

Expected: TypeScript passes and Atlas tests pass for graduate identity, portrait, single-theme public surface, required sections, and generated-content guardrails.

- [x] **Step 8: Commit Task 2**

```bash
git add public/images/profile/ayush-yadav-professional-portrait.png src/lib/data/personal.ts src/components/atlas/TechnicalOperationsAtlas.tsx tests/playwright/portfolio-fixtures.ts tests/playwright/atlas.spec.ts
git commit -m "feat: update atlas graduate identity and portrait"
```

---

### Task 3: Promote Stronger Proof Assets

**Files:**
- Modify: `tests/playwright/atlas.spec.ts`
- Modify: `tests/playwright/portfolio-fixtures.ts`
- Modify: `src/lib/data/projects.ts`
- Modify: `src/lib/data/projectCaseStudies.ts`
- Create: `public/images/projects/agentic-automl-poster-proof.png`

- [x] **Step 1: Add failing project hierarchy and artifact assertions**

In `tests/playwright/portfolio-fixtures.ts`, add:

```ts
export const EXPECTED_SELECTED_WORK_ORDER = [
  "Agentic AutoML Platform",
  "Fast MNIST Neural Network",
  "Visual Assist",
  "JobTracker",
];

export const EXPECTED_PROOF_ARTIFACTS = {
  automlPoster: "Expo poster proof",
  automlContribution: "Monaco/Jupyter runtime",
  fastMnistRelease: "v1.0.0 release",
  fastMnistBenchmark: "Benchmark evidence",
};
```

Import both constants in `tests/playwright/atlas.spec.ts`.

Add this test after the portrait test:

```ts
test("selected work starts with the strongest proof path", async ({ page }) => {
  await page.goto("/");
  await page.locator("#projects").scrollIntoViewIfNeeded();

  const cards = page.locator("#projects article");
  for (const [index, title] of EXPECTED_SELECTED_WORK_ORDER.entries()) {
    await expect(cards.nth(index)).toContainText(title);
  }
});
```

Add this case-study proof test:

```ts
test("AutoML and Fast MNIST case studies expose artifact-backed proof", async ({
  page,
}) => {
  await page.goto("/projects/automl/");
  await expect(page.getByText(EXPECTED_PROOF_ARTIFACTS.automlPoster)).toBeVisible();
  await expect(
    page.getByText(EXPECTED_PROOF_ARTIFACTS.automlContribution)
  ).toBeVisible();

  await page.goto("/projects/fast-mnist-nn/");
  await expect(
    page.getByText(EXPECTED_PROOF_ARTIFACTS.fastMnistRelease)
  ).toBeVisible();
  await expect(
    page.getByText(EXPECTED_PROOF_ARTIFACTS.fastMnistBenchmark)
  ).toBeVisible();
});
```

- [x] **Step 2: Run the failing proof tests**

Run:

```bash
npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts
```

Expected: FAIL because AutoML is not first, Fast MNIST is not second, and the new proof artifacts are absent.

- [x] **Step 3: Render the AutoML poster proof image**

Run:

```bash
command -v pdftoppm
pdftoppm -png -singlefile -r 120 "/Users/ayush/Downloads/poster.pdf" public/images/projects/agentic-automl-poster-proof
file public/images/projects/agentic-automl-poster-proof.png
```

Expected: `PNG image data` for `public/images/projects/agentic-automl-poster-proof.png`.

- [x] **Step 4: Reorder the primary project data**

In `src/lib/data/projects.ts`, move the full `automl` object to the first position in `projects`, move the full `fast-mnist-nn` object to the second position, keep `visual-assist` third, and move `jobtracker` fourth.

Set Fast MNIST to featured:

```ts
    featured: true,
```

Keep `portfolioVisible` absent or `true`; do not re-add LifeQuest or Job Automator to recruiter-facing order.

- [x] **Step 5: Reorder case studies**

In `src/lib/data/projectCaseStudies.ts`, reorder `projectCaseStudies` so these objects appear first:

```ts
projectId: "automl"
projectId: "fast-mnist-nn"
projectId: "visual-assist"
projectId: "jobtracker"
```

Keep `taskflow-calendar`, `master-inventory`, and `policybot` after those four.

- [x] **Step 6: Add AutoML poster and contribution proof**

In the AutoML case study object in `src/lib/data/projectCaseStudies.ts`, add these validation entries:

```ts
      {
        label: "Individual contribution",
        evidence:
          "Presenter artifact identifies Ayush's work on the Monaco/Jupyter runtime with live WebSocket sync, Docker sandbox constraints, eval runner, and Optuna study streaming UI.",
      },
      {
        label: "Expo artifact",
        evidence:
          "Senior design poster records the platform architecture, LangGraph workflow states, run ledger, validation metrics, and product screenshot.",
      },
```

Add this artifact to the AutoML `artifacts` array:

```ts
      {
        type: "poster",
        label: "Expo poster proof",
        href: withBasePath("/images/projects/agentic-automl-poster-proof.png"),
      },
```

Extend the `CaseStudyArtifact["type"]` union near the top of the file:

```ts
    | "poster";
```

- [x] **Step 7: Add Fast MNIST release and benchmark artifacts**

In the Fast MNIST case study `artifacts` array, add:

```ts
      {
        type: "repo",
        label: "v1.0.0 release",
        href: "https://github.com/yadava5/fast-mnist-nn/releases/tag/v1.0.0",
      },
      {
        type: "benchmark",
        label: "Benchmark evidence",
        href: "https://github.com/yadava5/fast-mnist-nn",
      },
```

- [x] **Step 8: Verify Task 3**

Run:

```bash
npm run typecheck
npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts tests/playwright/nav-and-images.spec.ts
```

Expected: TypeScript passes. Atlas tests pass. Nav/image tests pass with the new poster asset returning `200`.

- [x] **Step 9: Commit Task 3**

```bash
git add public/images/projects/agentic-automl-poster-proof.png src/lib/data/projects.ts src/lib/data/projectCaseStudies.ts tests/playwright/portfolio-fixtures.ts tests/playwright/atlas.spec.ts
git commit -m "feat: promote atlas proof assets"
```

---

### Task 4: Refine Atlas Recruiter UI

**Files:**
- Modify: `tests/playwright/portfolio-fixtures.ts`
- Modify: `tests/playwright/atlas.spec.ts`
- Modify: `src/components/atlas/TechnicalOperationsAtlas.tsx`

- [x] **Step 1: Update proof metric expectations**

In `tests/playwright/portfolio-fixtures.ts`, replace `ATLAS_ALLOWED_METRICS` with:

```ts
export const ATLAS_ALLOWED_METRICS = [
  "18,403",
  "3.5x",
  "738",
  "71",
  "19/20",
];
```

Replace `RECRUITER_HERO_METRICS` with:

```ts
export const RECRUITER_HERO_METRICS = ["18,403", "3.5x", "738", "71"];
```

- [x] **Step 2: Add a density/scroll guard**

In `tests/playwright/atlas.spec.ts`, add:

```ts
test("mobile hero keeps CTAs visible without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#hero").waitFor({ state: "attached" });

  for (const label of RECRUITER_HERO_LINKS) {
    await expectInFirstViewport(
      page,
      page.locator("#hero").getByRole("link", { name: new RegExp(label) })
    );
  }

  const scrollCheck = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    heroHeight: document.querySelector("#hero")?.getBoundingClientRect().height,
    viewportHeight: window.innerHeight,
  }));

  expect(scrollCheck.overflow).toBe(false);
  expect(scrollCheck.heroHeight ?? 0).toBeLessThanOrEqual(
    scrollCheck.viewportHeight * 1.35
  );
});
```

- [x] **Step 3: Run the failing visual-density tests**

Run:

```bash
npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts
```

Expected: FAIL until proof metrics and mobile hero density are updated.

- [x] **Step 4: Update Atlas proof metrics**

In `src/components/atlas/TechnicalOperationsAtlas.tsx`, replace `proofMetrics` with:

```ts
const proofMetrics = [
  {
    icon: Workflow,
    value: "18,403",
    label: "AutoML ledger events",
    detail: "Expo poster proof from Agentic AutoML",
  },
  {
    icon: Cpu,
    value: "3.5x",
    label: "Dot-kernel speedup",
    detail: "Fast MNIST committed benchmark proof",
  },
  {
    icon: ShieldCheck,
    value: "738",
    label: "Automated tests",
    detail: "Dynamic Calendar frontend, backend, and integration proof",
  },
  {
    icon: Accessibility,
    value: "71",
    label: "iOS tests",
    detail: "Visual Assist model and utility coverage",
  },
];
```

- [x] **Step 5: Reduce hero density**

In `src/components/atlas/TechnicalOperationsAtlas.tsx`, change the hero section class from:

```tsx
className="mx-auto grid w-full max-w-7xl gap-6 px-5 pt-24 pb-12 md:min-h-screen md:grid-cols-[0.9fr_1.1fr] md:px-8 lg:px-10"
```

to:

```tsx
className="mx-auto grid w-full max-w-7xl gap-6 px-5 pt-24 pb-10 md:min-h-[88vh] md:grid-cols-[0.92fr_1.08fr] md:px-8 lg:px-10"
```

Change the hero metric grid from:

```tsx
<div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:gap-3">
```

to:

```tsx
<div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-4 sm:gap-3">
```

Change the right-side proof panel wrapper from:

```tsx
<div className="hidden flex-col justify-center gap-4 md:flex">
```

to:

```tsx
<div className="hidden flex-col justify-center gap-5 md:flex">
```

- [x] **Step 6: Strengthen section contrast**

In `src/components/atlas/TechnicalOperationsAtlas.tsx`, update these section class names:

About:

```tsx
className="border-y border-zinc-900 bg-zinc-950/65"
```

Experience:

```tsx
className="border-y border-zinc-900 bg-[#0d1115]"
```

Contact:

```tsx
className="border-t border-zinc-900 bg-[#080a0c]"
```

- [x] **Step 7: Make contact copy direct**

In the contact section, replace:

```tsx
Open a channel for software, data, or ML engineering work.
```

with:

```tsx
Open to new-grad software, data, and ML engineering roles.
```

- [x] **Step 8: Verify Task 4**

Run:

```bash
npm run typecheck
npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts
npm run test:e2e:score -- --project=chromium-desktop
```

Expected: TypeScript passes. Atlas tests pass. Quality score stays at or above the Atlas threshold in `tests/playwright/portfolio-quality-score.spec.ts`.

- [x] **Step 9: Commit Task 4**

```bash
git add src/components/atlas/TechnicalOperationsAtlas.tsx tests/playwright/portfolio-fixtures.ts tests/playwright/atlas.spec.ts
git commit -m "style: refine atlas recruiter proof flow"
```

---

### Task 5: Full Validation With Playwright CLI

**Files:**
- Output only: `output/playwright/atlas-single-theme-refinement/`
- Modify only if validation reveals a real issue: files from Tasks 1-4.

- [x] **Step 1: Run static validation**

Run:

```bash
npm run typecheck
npm run lint
npm run format:check
```

Expected: `typecheck` passes. `lint` passes with no errors; existing warnings may remain only if they predate this pass. `format:check` passes.

- [x] **Step 2: Run targeted Playwright test validation**

Run:

```bash
npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts tests/playwright/interactions.spec.ts tests/playwright/nav-and-images.spec.ts
npm run test:e2e:score -- --project=chromium-desktop
```

Expected: targeted e2e tests pass and score test passes.

- [x] **Step 3: Start local dev server for CLI inspection**

Run:

```bash
PATH=/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin npm run dev -- --hostname 127.0.0.1 --port 3000
```

Expected: Next dev server prints a local URL for `http://127.0.0.1:3000`. Keep this terminal session open while running the next Playwright CLI commands.

- [x] **Step 4: Prepare Playwright CLI artifact directory**

In a second terminal session, run:

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
command -v npx >/dev/null 2>&1
mkdir -p output/playwright/atlas-single-theme-refinement
cd output/playwright/atlas-single-theme-refinement
```

Expected: `command -v npx` exits `0`.

- [x] **Step 5: Capture desktop walkthrough video and screenshots**

Run from `output/playwright/atlas-single-theme-refinement`:

```bash
"$PWCLI" --session atlas-refinement open http://127.0.0.1:3000 --headed
"$PWCLI" --session atlas-refinement resize 1440 900
"$PWCLI" --session atlas-refinement video-start desktop-walkthrough.webm
"$PWCLI" --session atlas-refinement snapshot
"$PWCLI" --session atlas-refinement screenshot
"$PWCLI" --session atlas-refinement mousewheel 0 850
"$PWCLI" --session atlas-refinement snapshot
"$PWCLI" --session atlas-refinement screenshot
"$PWCLI" --session atlas-refinement mousewheel 0 1000
"$PWCLI" --session atlas-refinement snapshot
"$PWCLI" --session atlas-refinement screenshot
"$PWCLI" --session atlas-refinement video-stop
```

Expected: snapshots show hero, profile/about, selected work, and lower-page content. Screenshots and `desktop-walkthrough.webm` are written in `output/playwright/atlas-single-theme-refinement`.

- [x] **Step 6: Capture mobile walkthrough**

Run from `output/playwright/atlas-single-theme-refinement`:

```bash
"$PWCLI" --session atlas-refinement-mobile open http://127.0.0.1:3000 --headed
"$PWCLI" --session atlas-refinement-mobile resize 390 844
"$PWCLI" --session atlas-refinement-mobile video-start mobile-walkthrough.webm
"$PWCLI" --session atlas-refinement-mobile snapshot
"$PWCLI" --session atlas-refinement-mobile screenshot
"$PWCLI" --session atlas-refinement-mobile mousewheel 0 700
"$PWCLI" --session atlas-refinement-mobile snapshot
"$PWCLI" --session atlas-refinement-mobile screenshot
"$PWCLI" --session atlas-refinement-mobile mousewheel 0 900
"$PWCLI" --session atlas-refinement-mobile snapshot
"$PWCLI" --session atlas-refinement-mobile screenshot
"$PWCLI" --session atlas-refinement-mobile video-stop
```

Expected: mobile hero CTAs are visible early, no horizontal overflow appears, portrait/profile does not crowd text, and no theme selector is visible.

- [x] **Step 7: Inspect DOM truth through Playwright CLI**

Run:

```bash
"$PWCLI" --session atlas-refinement eval "({
  theme: document.documentElement.getAttribute('data-theme'),
  hasThemeSwitcher: Boolean(document.querySelector('[aria-label=\"Select theme\"]')),
  staleStudentCopy: document.body.innerText.includes('Senior CS student') || document.body.innerText.includes('Expected May 2026'),
  hasPortrait: Boolean(document.querySelector('img[alt=\"Ayush Yadav professional portrait\"]')),
  selectedWorkOrder: Array.from(document.querySelectorAll('#projects article')).slice(0, 4).map((card) => card.textContent?.match(/Agentic AutoML Platform|Fast MNIST Neural Network|Visual Assist|JobTracker/)?.[0] ?? 'unknown')
})"
```

Expected result:

```json
{
  "theme": "technical-operations-atlas",
  "hasThemeSwitcher": false,
  "staleStudentCopy": false,
  "hasPortrait": true,
  "selectedWorkOrder": [
    "Agentic AutoML Platform",
    "Fast MNIST Neural Network",
    "Visual Assist",
    "JobTracker"
  ]
}
```

- [x] **Step 8: Fix any validation failures**

If a Task 5 command fails, make the smallest source change that addresses the observed failure, then rerun the failed command and the preceding related command. For visual failures, capture a fresh screenshot after the fix in `output/playwright/atlas-single-theme-refinement/`.

- [x] **Step 9: Stop the dev server and close CLI sessions**

Run:

```bash
"$PWCLI" --session atlas-refinement close
"$PWCLI" --session atlas-refinement-mobile close
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

If the `lsof` output still shows a Node listener on port 3000, stop the dev server terminal with `Ctrl-C` and rerun:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

Expected: no listener remains on port 3000.

- [x] **Step 10: Commit validation updates**

Only commit source/test changes from validation fixes. Do not commit generated files under `output/playwright/` unless the repo already tracks that exact artifact pattern.

```bash
git status --short
git add src tests public
git commit -m "test: validate atlas single-theme refinement"
```

Skip this commit if Task 5 produces no source/test changes after Tasks 1-4.

---

## Final Verification Checklist

- [x] Public app renders only Technical Operations Atlas.
- [x] No visible `Select theme` control exists on desktop or mobile.
- [x] No homepage copy says "Senior CS student", "Senior Computer Science student", "Expected May 2026", or "Open to internships".
- [x] Portrait image renders with alt text `Ayush Yadav professional portrait`.
- [x] Selected work order starts AutoML, Fast MNIST, Visual Assist, JobTracker.
- [x] AutoML case study shows poster proof and individual contribution.
- [x] Fast MNIST case study shows release and benchmark proof.
- [x] `npm run typecheck`, `npm run lint`, `npm run format:check`, targeted Playwright tests, score test, and Playwright CLI walkthrough complete.
- [x] Port 3000 is closed before final handoff.
