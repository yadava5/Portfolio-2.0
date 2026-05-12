# Recruiter Conversion Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Technical Operations Atlas read as a recruiter-ready CS portfolio with above-the-fold identity, credible proof, safer claims, and stronger case-study evidence.

**Architecture:** Keep the existing Atlas shell and data-driven project system. Add failing Playwright gates first, then tighten hero layout, demote non-recruiter theme controls, sanitize project copy, and expand private/work-related evidence into first-class case studies.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Playwright.

---

## File Structure

- Modify `tests/playwright/atlas.spec.ts`: add recruiter-facing viewport, mobile overlap, claim-safety, and private case-study coverage tests.
- Modify `tests/playwright/portfolio-fixtures.ts`: add recruiter CTA labels, hero metric expectations, and prohibited claim strings.
- Modify `src/components/atlas/TechnicalOperationsAtlas.tsx`: compact the hero, surface Ayush's name and target role earlier, make CTAs mobile-first, and swap hero metrics toward operational evidence.
- Modify `src/components/atlas/AtlasEvidence.tsx`: make metric cards denser on mobile so proof fits in the first viewport.
- Modify `src/components/layout/Header.tsx`: rename the primary project nav label to a clearer recruiter path.
- Modify `src/components/layout/ThemeSwitcher.tsx`: hide the theme picker on mobile and label it as secondary on desktop.
- Modify `src/lib/data/projects.ts`: replace unsupported or risky marketing claims with evidence-backed wording.
- Modify `src/lib/data/projectCaseStudies.ts`: add case studies for `master-inventory` and `policybot` and improve evidence wording where needed.

## Task 1: Recruiter-Facing Playwright Gates

**Files:**

- Modify: `tests/playwright/atlas.spec.ts`
- Modify: `tests/playwright/portfolio-fixtures.ts`

- [ ] **Step 1: Add failing fixture expectations**

Add exported constants:

```ts
export const RECRUITER_HERO_LINKS = ["Resume", "GitHub", "LinkedIn", "Contact"];

export const RECRUITER_HERO_METRICS = [
  "1M+",
  "738",
  "500+ emails/month",
  "50+ docs",
];

export const REQUIRED_PRIVATE_CASE_STUDIES = ["master-inventory", "policybot"];
```

Extend `PROHIBITED_GENERATED_CONTENT` with:

```ts
"10x faster",
"50+ jobs/day",
"500+ views in launch month",
"Production full-stack calendar",
"production ML pipelines",
```

- [ ] **Step 2: Add viewport helper and tests**

Add a helper in `tests/playwright/atlas.spec.ts`:

```ts
async function expectInFirstViewport(page: Page, locator: Locator) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
}
```

Add tests for desktop and mobile:

```ts
test("desktop first viewport exposes recruiter identity, links, and proof", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.locator("#hero").waitFor({ state: "attached" });

  await expectInFirstViewport(
    page,
    page.locator("#hero").getByText(EXPECTED_CONTENT.name)
  );
  await expectInFirstViewport(
    page,
    page.locator("#hero").getByText("Software / Data / ML Engineering")
  );

  for (const label of RECRUITER_HERO_LINKS) {
    await expectInFirstViewport(
      page,
      page.locator("#hero").getByRole("link", { name: new RegExp(label) })
    );
  }

  for (const metric of RECRUITER_HERO_METRICS) {
    await expectInFirstViewport(
      page,
      page.locator("#hero").getByText(metric).first()
    );
  }
});

test("mobile first viewport keeps recruiter CTAs visible and theme controls out of the way", async ({
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

  await expect(page.getByRole("button", { name: "Select theme" })).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});
```

Add private case-study route test:

```ts
for (const id of REQUIRED_PRIVATE_CASE_STUDIES) {
  test(`private proof case study ${id} is available`, async ({ page }) => {
    await page.goto(`/projects/${id}/`);
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByText("Private proof").or(page.getByText("work-related"))
    ).toBeVisible();
  });
}
```

- [ ] **Step 3: Run the targeted test and verify it fails**

Run:

```bash
npx playwright test tests/playwright/atlas.spec.ts --project=chromium
```

Expected: failure before implementation because mobile CTAs/theme control/private case-study routes are not yet fixed.

## Task 2: Hero and Recruiter Path

**Files:**

- Modify: `src/components/atlas/TechnicalOperationsAtlas.tsx`
- Modify: `src/components/atlas/AtlasEvidence.tsx`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/ThemeSwitcher.tsx`

- [ ] **Step 1: Compact and clarify the hero**

Change the hero copy to include Ayush's name directly:

```tsx
<h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
  Ayush Yadav builds reliable data, ML, and software systems.
</h1>
```

Move the CTA block directly after the short value paragraph and use a two-column mobile grid:

```tsx
<div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
```

Set the hero section to avoid a forced mobile full-screen lock:

```tsx
className =
  "mx-auto grid w-full max-w-7xl gap-6 px-5 pt-24 pb-12 md:min-h-screen md:grid-cols-[0.9fr_1.1fr] md:px-8 lg:px-10";
```

- [ ] **Step 2: Use operational proof metrics in the hero**

Update `proofMetrics` to:

```ts
["1M+", "738", "500+ emails/month", "50+ docs"];
```

Keep Fast MNIST `97%+` and `5x` in its project card/case study rather than the hero proof strip.

- [ ] **Step 3: Make metric cards fit mobile**

Change `MetricCard` classes so details hide on mobile:

```tsx
<div className="rounded border border-zinc-800 bg-zinc-950/70 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.28)] sm:p-4">
...
<span className="font-mono text-2xl font-semibold text-emerald-400 sm:text-3xl">
...
<p className="mt-1 hidden text-xs leading-5 text-zinc-500 sm:block">{detail}</p>
```

- [ ] **Step 4: Demote theme switching on mobile**

Change the wrapper in `ThemeSwitcher`:

```tsx
<div className="fixed right-6 bottom-6 z-[100] hidden md:block">
```

Change the menu heading from `Visual Modes` to `Secondary Visual Modes`.

- [ ] **Step 5: Rename the project nav path**

Change header nav from `Work` to `Case Studies`.

## Task 3: Safer Project Copy and Stronger Private Proof

**Files:**

- Modify: `src/lib/data/projects.ts`
- Modify: `src/lib/data/projectCaseStudies.ts`

- [ ] **Step 1: Replace risky project claims**

Use these safer copy changes:

- JobTracker short description: "Native macOS app processing 500+ emails/month with on-device ML to replace my manual job-search tracking workflow."
- AutoML short description: "LLM-orchestrated platform for turning raw datasets and domain documents into auditable ML workflow decisions."
- AutoML full description: "Building an automated data scientist platform that turns datasets and domain documents into structured, reproducible ML workflows. Features LLM-assisted orchestration using RAG + MCP for auditable pipeline decisions."
- Visual Assist short description: "Privacy-first iOS accessibility app using LiDAR, Vision, Core ML, haptics, and voice guidance."
- Taskflow short description: "Full-stack calendar app with 738 automated tests, NLP-powered natural language scheduling, and conflict detection."
- Paid Internships short description: "Research-backed advocacy site with 3D scroll effects, peer-reviewed sources, and interactive data visualizations."
- Job Automator short description: "Playwright automation project exploring job matching, cover-letter drafting, and application tracking workflows."
- Job Automator metric: "Workflow automation prototype"

- [ ] **Step 2: Add Master Inventory Pipeline case study**

Add a `ProjectCaseStudy` object for `master-inventory` with treatment `field-systems`, role `Data integration engineer`, private/work-related framing, architecture nodes for Workday exports, Tableau metadata, Python/pandas transform, SQL/unified IDs, Tableau Prep/dashboard output, and validation artifacts.

- [ ] **Step 3: Add PolicyBot case study**

Add a `ProjectCaseStudy` object for `policybot` with treatment `evidence-ledger`, role `RAG systems engineer`, private/work-related framing, architecture nodes for policy documents, file search, quote validation, Slack Socket Mode, and cited response delivery.

- [ ] **Step 4: Improve circular evidence language**

Where validation rows currently say "Project data lists...", change wording to "Portfolio source data records..." or "Private/work summary records..." and include limitation context when proof cannot be public.

## Task 4: Verification

**Files:**

- Test: `tests/playwright/atlas.spec.ts`
- Test: `package.json` scripts

- [ ] **Step 1: Run targeted Playwright**

Run:

```bash
npx playwright test tests/playwright/atlas.spec.ts --project=chromium
```

Expected: all Atlas recruiter tests pass.

- [ ] **Step 2: Run typecheck and format check**

Run:

```bash
npm run typecheck
npm run format:check
```

Expected: both pass. If format fails, run `npm run format` and rerun `npm run format:check`.

- [ ] **Step 3: Render validation**

Start dev server:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3102
```

Use Playwright or Browser plugin to capture desktop and mobile first viewport screenshots and verify:

- Desktop shows Ayush's name, target role, CTAs, and proof metrics above the fold.
- Mobile shows Resume, GitHub, LinkedIn, Contact above the fold.
- Theme switcher is hidden on mobile.
- No framework overlay or relevant console errors.

## Self-Review

- Spec coverage: The plan covers first-viewport recruiter proof, safer claims, theme switcher demotion, private proof case studies, and tests.
- Placeholder scan: No `TBD`, `TODO`, or unspecified "write tests" placeholders remain.
- Type consistency: New constants live in `portfolio-fixtures.ts`; Atlas tests import them; new case studies use existing `ProjectCaseStudy` types.
