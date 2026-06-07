# Portfolio Polish Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise Portfolio-2.0 from a strong local Atlas portfolio to a public recruiter-ready site with verified deployment, stronger proof traceability, better CI/SEO/accessibility/performance gates, cleaner Atlas-only code, and sharper visual polish.

**Architecture:** Treat the current Technical Operations Atlas experience as the only public product. First make public availability and source-truth verification hard to regress, then clean legacy theme code, then polish the Atlas visual system. Keep all recruiter claims backed by typed data, explicit proof artifacts, and automated checks.

**Tech Stack:** Next.js static export, TypeScript, React, Playwright, axe-core, Lighthouse, GitHub Actions, Node.js QA scripts, static public assets.

---

## File Structure

- Modify `.github/workflows/ci.yml`: add CI jobs for resume parsing, static SEO, and Playwright smoke/full gates.
- Modify `.github/workflows/deploy.yml`: keep Pages deploy on `main`, and add post-build static proof checks before upload.
- Modify `package.json`: add scripts for `test:seo`, `test:a11y:reduced-motion`, `test:performance`, and `assets:budget`.
- Create `scripts/qa/check-static-export-seo.mjs`: verify production-base-path static export metadata, sitemap, robots, canonical URLs, OG/Twitter image URLs, and route coverage.
- Create `scripts/qa/check-asset-budgets.mjs`: fail if selected public assets exceed approved byte budgets.
- Create `scripts/qa/check-proof-manifest.mjs`: verify every public metric has a source/proof boundary.
- Create `src/lib/data/proofManifest.ts`: source-truth manifest for recruiter-visible metrics.
- Modify `src/lib/data/projects.ts`: align AutoML live/proof boundary and connect project metrics to proof manifest IDs.
- Modify `src/lib/data/projectCaseStudies.ts`: point artifacts to safer proof assets and proof manifest IDs where relevant.
- Modify or replace `public/images/projects/agentic-automl-poster-proof.png`: remove implicit live-demo URL or explicitly document it as audited demo data.
- Modify `src/components/themes/ThemeOrchestrator.tsx`: collapse to Atlas-only.
- Modify `src/config/themes.ts`: reduce public theme type/config to Atlas-only or move legacy configs to an archived validation file.
- Delete or archive `src/components/layout/ThemeSwitcher.tsx`, legacy backgrounds, legacy cursors, and legacy section components after tests no longer import them.
- Split `src/components/atlas/TechnicalOperationsAtlas.tsx` into section components under `src/components/atlas/sections/`.
- Modify `src/components/layout/SmoothScroll.tsx`: fix recursive RAF cleanup and add reduced-motion test coverage.
- Modify `tests/playwright/INDEX.md`: update the current Atlas-only test contract.
- Modify `tests/playwright/portfolio-fixtures.ts`: remove dead theme-switcher helper or move it behind a legacy-only helper that is not part of the default contract.
- Create `tests/playwright/static-seo.spec.ts`: browser-level route/metadata smoke tests.
- Create `tests/playwright/reduced-motion.spec.ts`: reduced-motion, keyboard traversal, and no-scroll-animation checks.
- Create `tests/playwright/performance-budget.spec.ts`: Web Vitals or Lighthouse-budget wrapper if command-line Lighthouse proves stable.

---

### Task 0: Public Availability Recovery Gate

**Why first:** The scorecard's largest recruiter-facing gap is that the public GitHub Pages site currently returns `404`. Do not spend days polishing local source before proving the public delivery path can serve the current portfolio.

**Files:**
- Modify only if needed: `.github/workflows/deploy.yml`
- No source changes expected if GitHub Pages settings are the only blocker

- [ ] **Step 1: Confirm current public and repository state**

Run:

```bash
git status --short
git rev-list --left-right --count origin/main...HEAD
gh repo view yadava5/Portfolio-2.0 --json defaultBranchRef,url,isPrivate
gh api repos/yadava5/Portfolio-2.0/pages
```

Expected:

- current branch status is understood before changing files,
- ahead/behind count is recorded,
- repository owner/default branch are confirmed,
- Pages API either returns active Pages settings or confirms Pages is disabled/missing.

- [ ] **Step 2: Verify public routes before source changes**

Run:

```bash
for url in \
  https://yadava5.github.io/Portfolio-2.0/ \
  https://yadava5.github.io/Portfolio-2.0/resume.pdf \
  https://yadava5.github.io/Portfolio-2.0/sitemap.xml
do
  http_status=$(curl -L -o /dev/null -s -w "%{http_code}" "$url")
  printf "%s %s\n" "$http_status" "$url"
done
```

Expected before fixing: public routes may return `404`. Keep the result in the task notes so the improvement is measurable.

- [ ] **Step 3: Recover the publish path**

Use the normal GitHub flow for this repository:

1. If Pages is disabled, enable GitHub Pages for the deploy workflow or GitHub Actions source.
2. If Pages is enabled but no deploy ran from `main`, merge the current portfolio branch to `main` through the chosen PR/merge path.
3. If the deploy workflow is broken, inspect the latest deploy logs before editing `.github/workflows/deploy.yml`.

Do not bypass branch protection. If enabling Pages requires a repository settings change that cannot be done by CLI in the current auth context, stop this task at the exact blocker and record the missing permission.

- [ ] **Step 4: Wait for Pages deploy**

Run:

```bash
gh run list --repo yadava5/Portfolio-2.0 --workflow "Deploy to GitHub Pages" --limit 5
```

Expected: the latest relevant deploy run on `main` completes successfully.

- [ ] **Step 5: Verify public routes after recovery**

Run:

```bash
for url in \
  https://yadava5.github.io/Portfolio-2.0/ \
  https://yadava5.github.io/Portfolio-2.0/resume.pdf \
  https://yadava5.github.io/Portfolio-2.0/sitemap.xml \
  https://yadava5.github.io/Portfolio-2.0/projects/automl/ \
  https://yadava5.github.io/Portfolio-2.0/projects/fast-mnist-nn/ \
  https://yadava5.github.io/Portfolio-2.0/projects/jobtracker/ \
  https://yadava5.github.io/Portfolio-2.0/projects/master-inventory/ \
  https://yadava5.github.io/Portfolio-2.0/projects/policybot/ \
  https://yadava5.github.io/Portfolio-2.0/projects/taskflow-calendar/ \
  https://yadava5.github.io/Portfolio-2.0/projects/visual-assist/
do
  http_status=$(curl -L -o /dev/null -s -w "%{http_code}" "$url")
  printf "%s %s\n" "$http_status" "$url"
  test "$http_status" = "200"
done
```

Expected: every route prints `200`.

- [ ] **Step 6: Capture public screenshots**

Run:

```bash
mkdir -p output/playwright
npx playwright screenshot https://yadava5.github.io/Portfolio-2.0/ output/playwright/public-home.png
npx playwright screenshot https://yadava5.github.io/Portfolio-2.0/projects/automl/ output/playwright/public-automl.png
```

Expected: screenshots show the Atlas homepage and AutoML case study, not GitHub Pages 404.

- [ ] **Step 7: Commit only if workflow source changed**

If no source files changed, do not create a commit. If deployment workflow fixes were needed:

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: restore github pages deployment"
```

---

### Task 1: Public Deployment And Static SEO Gate

**Files:**
- Create: `scripts/qa/check-static-export-seo.mjs`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/deploy.yml`
- Delete: `public/sitemap.xml`
- Delete: `public/robots.txt`
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Test: `tests/playwright/static-seo.spec.ts`

- [ ] **Step 1: Add a failing static-export SEO check**

Create `scripts/qa/check-static-export-seo.mjs` with this behavior:

```js
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const siteUrl = "https://yadava5.github.io/Portfolio-2.0";
const projectDir = path.join(outDir, "projects");
const projectRoutes = fs.existsSync(projectDir)
  ? fs
      .readdirSync(projectDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => `/projects/${entry.name}/`)
      .sort()
  : [];
const requiredRoutes = ["/", "/resume.pdf", ...projectRoutes];

function fail(message) {
  console.error(`Static SEO check failed: ${message}`);
  process.exitCode = 1;
}

function htmlForRoute(route) {
  if (route === "/") return path.join(outDir, "index.html");
  return path.join(outDir, route.replace(/^\\//, ""), "index.html");
}

for (const route of requiredRoutes) {
  const file =
    route === "/resume.pdf" ? path.join(outDir, "resume.pdf") : htmlForRoute(route);
  if (!fs.existsSync(file)) fail(`missing exported route ${route}`);
}

if (projectRoutes.length < 7) {
  fail(`expected at least 7 exported project routes, found ${projectRoutes.length}`);
}

const sitemapPath = path.join(outDir, "sitemap.xml");
if (!fs.existsSync(sitemapPath)) fail("missing out/sitemap.xml");
const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, "utf8") : "";
for (const route of requiredRoutes.filter((route) => route !== "/resume.pdf")) {
  const expected = `${siteUrl}${route}`;
  if (!sitemap.includes(`<loc>${expected}</loc>`)) {
    fail(`sitemap missing ${expected}`);
  }
}

const robotsPath = path.join(outDir, "robots.txt");
if (!fs.existsSync(robotsPath)) fail("missing out/robots.txt");
const robots = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, "utf8") : "";
if (!robots.includes(`${siteUrl}/sitemap.xml`)) {
  fail("robots.txt does not point at production sitemap");
}

const htmlFiles = requiredRoutes
  .filter((route) => route !== "/resume.pdf")
  .map((route) => [route, fs.readFileSync(htmlForRoute(route), "utf8")]);

for (const [route, html] of htmlFiles) {
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical !== `${siteUrl}${route}`) {
    fail(`bad canonical for ${route}: ${canonical ?? "missing"}`);
  }

  const imageUrls = [
    ...html.matchAll(/<meta (?:property|name)="(?:og:image|twitter:image)" content="([^"]+)"/g),
  ].map((match) => match[1]);

  for (const imageUrl of imageUrls) {
    if (!imageUrl.startsWith(`${siteUrl}/`)) {
      fail(`metadata image missing production base path for ${route}: ${imageUrl}`);
    }
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Static SEO check passed.");
```

- [ ] **Step 2: Add package script**

Modify `package.json`:

```json
{
  "scripts": {
    "test:seo": "node scripts/qa/check-static-export-seo.mjs"
  }
}
```

Keep existing scripts unchanged.

- [ ] **Step 3: Run the failing check against current export**

Run:

```bash
npm run test:seo
```

Expected before fixes: fail on missing project sitemap entries or metadata image URLs.

- [ ] **Step 4: Fix sitemap/robots production coverage**

Delete `public/sitemap.xml` and `public/robots.txt`, then create metadata routes:

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { caseStudyIds } from "@/lib/data/projectCaseStudies";
import { siteMetadata } from "@/lib/data/personal";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-06-07");
  return [
    {
      url: `${siteMetadata.url}/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...caseStudyIds.map((id) => ({
      url: `${siteMetadata.url}/projects/${id}/`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
```

```ts
// src/app/robots.ts
import type { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/data/personal";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteMetadata.url}/sitemap.xml`,
  };
}
```

The required output must include the homepage plus all seven case-study URLs. The static SEO check in Step 1 is the guard that proves Next emitted the files correctly.

- [ ] **Step 5: Fix production metadata image URLs**

Create a utility:

```ts
// src/lib/seo.ts
import { siteMetadata } from "@/lib/data/personal";

export function absoluteSiteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const normalized = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return new URL(normalized, `${siteMetadata.url}/`).toString();
}
```

Use it in `src/app/layout.tsx` and `src/app/projects/[id]/page.tsx` for OG/Twitter images.

- [ ] **Step 6: Rebuild and verify production-base-path export**

Run:

```bash
rm -rf out .next
NODE_ENV=production NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0 npm run build
npm run test:seo
```

Expected: build passes and `Static SEO check passed.`

- [ ] **Step 7: Add browser-level static metadata smoke**

Create `tests/playwright/static-seo.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

const siteUrl = "https://yadava5.github.io/Portfolio-2.0";
const routes = [
  "/",
  "/projects/automl/",
  "/projects/fast-mnist-nn/",
  "/projects/jobtracker/",
  "/projects/master-inventory/",
  "/projects/policybot/",
  "/projects/taskflow-calendar/",
  "/projects/visual-assist/",
];

test.describe("static metadata", () => {
  for (const route of routes) {
    test(`${route} has production canonical and social image metadata`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();

      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(canonical).toBe(`${siteUrl}${route}`);

      for (const selector of [
        'meta[property="og:image"]',
        'meta[name="twitter:image"]',
      ]) {
        const content = await page.locator(selector).getAttribute("content");
        expect(content).toContain(`${siteUrl}/`);
      }
    });
  }
});
```

Run it only after a production-base-path build:

```bash
NODE_ENV=production NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0 npm run build
NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0 playwright test tests/playwright/static-seo.spec.ts
```

Expected: every exported route has a production canonical URL and social image metadata with `/Portfolio-2.0`.

- [ ] **Step 8: Add CI enforcement**

In `.github/workflows/ci.yml`, add jobs after build dependencies:

```yaml
  resume-check:
    name: Resume parser check
    runs-on: ubuntu-latest
    needs: [format, eslint, typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
      - run: npm ci
      - run: npm run resume:check

  static-seo:
    name: Static SEO export
    runs-on: ubuntu-latest
    needs: [format, eslint, typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
      - run: npm ci
      - run: NODE_ENV=production NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0 npm run build
      - run: npm run test:seo
      - run: NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0 npx playwright install --with-deps chromium
      - run: NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0 npx playwright test tests/playwright/static-seo.spec.ts
```

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json scripts/qa/check-static-export-seo.mjs src/app/sitemap.ts src/app/robots.ts src/lib/seo.ts src/app/layout.tsx 'src/app/projects/[id]/page.tsx' tests/playwright/static-seo.spec.ts .github/workflows/ci.yml .github/workflows/deploy.yml
git commit -m "test: add static export seo gate"
```

---

### Task 2: Proof Manifest And AutoML Boundary

**Files:**
- Create: `src/lib/data/proofManifest.ts`
- Create: `scripts/qa/check-proof-manifest.mjs`
- Modify: `src/lib/data/projects.ts`
- Modify: `src/lib/data/projectCaseStudies.ts`
- Modify or replace: `public/images/projects/agentic-automl-poster-proof.png`
- Modify: `package.json`
- Test: `tests/playwright/atlas.spec.ts`

- [ ] **Step 1: Add proof manifest data**

Create `src/lib/data/proofManifest.ts`:

```ts
export type ProofVisibility = "public" | "private-safe" | "local-only";

export interface ProofManifestEntry {
  id: string;
  label: string;
  claim: string;
  source: string;
  verification: string;
  visibility: ProofVisibility;
  privacyBoundary: string;
}

export const proofManifest: ProofManifestEntry[] = [
  {
    id: "jobtracker-local-classifier",
    label: "3-layer local job-email classifier",
    claim: "JobTracker uses a local 3-layer classifier path for job-search email classification.",
    source: "https://github.com/yadava5/jobtracker",
    verification: "Public repository architecture, README, and local app audit.",
    visibility: "public",
    privacyBoundary: "No private email content shown.",
  },
  {
    id: "automl-ledger-events",
    label: "18,403 AutoML ledger events",
    claim: "AutoML poster proof records 18,403 ledger events from demo/source-truth data.",
    source: "public/images/projects/agentic-automl-poster-proof.png",
    verification: "Manual poster extraction and local AutoML artifact audit.",
    visibility: "private-safe",
    privacyBoundary: "Uses demo data and excludes private repository source.",
  },
  {
    id: "fast-mnist-dot-kernel",
    label: "3.5x dot-kernel speedup",
    claim: "Fast MNIST committed benchmark evidence records a 3.5x dot-kernel speedup.",
    source: "public/images/projects/fast-mnist-nn.svg",
    verification: "Committed benchmark evidence in public fast-mnist-nn repository.",
    visibility: "public",
    privacyBoundary: "No private data.",
  },
  {
    id: "taskflow-tests",
    label: "738 automated tests",
    claim: "Taskflow portfolio copy uses 738 automated tests as the public validation metric.",
    source: "https://github.com/yadava5/taskflow-calendar",
    verification: "Public source repository test count and portfolio screenshot audit.",
    visibility: "public",
    privacyBoundary: "No private data.",
  },
  {
    id: "visual-assist-tests",
    label: "71 iOS tests",
    claim: "Visual Assist has 71 audited XCTest functions for models and utilities.",
    source: "https://github.com/yadava5/VisualAssist/tree/main/VisualAssistTests",
    verification: "Public test tree and portfolio evidence audit.",
    visibility: "public",
    privacyBoundary: "No live camera/location data shown.",
  },
  {
    id: "master-inventory-rows",
    label: "10,453 deduped rows",
    claim: "Master Inventory private-safe proof uses 10,453 deduped local output rows.",
    source: "public/images/projects/master-inventory-proof.svg",
    verification: "Private-safe local row-count ledger.",
    visibility: "private-safe",
    privacyBoundary: "Raw institutional exports, report names, owner names, and rows excluded.",
  },
  {
    id: "policybot-validation",
    label: "19/20 structured sweep",
    claim: "PolicyBot private-safe proof records 19/20 structured validation sweep.",
    source: "public/images/projects/policybot-validation-proof.svg",
    verification: "Private-safe validation ledger.",
    visibility: "private-safe",
    privacyBoundary: "Raw policy text and Slack messages excluded.",
  },
  {
    id: "paid-internships-sources",
    label: "6 academic sources",
    claim: "Paid Internships Advocacy cites six academic or institutional sources.",
    source: "https://github.com/yadava5/paid-internships-advocacy",
    verification: "Public repository/source-page audit.",
    visibility: "public",
    privacyBoundary: "No private data.",
  },
];
```

- [ ] **Step 2: Add proof-manifest verifier**

Create `scripts/qa/check-proof-manifest.mjs`:

```js
import fs from "node:fs";
import path from "node:path";

const manifestSource = fs.readFileSync("src/lib/data/proofManifest.ts", "utf8");
const projectsSource = fs.readFileSync("src/lib/data/projects.ts", "utf8");
const requiredIds = [
  "jobtracker-local-classifier",
  "automl-ledger-events",
  "fast-mnist-dot-kernel",
  "taskflow-tests",
  "visual-assist-tests",
  "master-inventory-rows",
  "policybot-validation",
  "paid-internships-sources",
];
const manifestIds = new Set(
  Array.from(manifestSource.matchAll(/id:\s*"([^"]+)"/g), (match) => match[1])
);

for (const id of requiredIds) {
  if (!manifestIds.has(id)) {
    console.error(`Missing proof manifest id: ${id}`);
    process.exitCode = 1;
  }
}

const manifestEntries = manifestSource.match(/\n  \{[\s\S]*?\n  \}/g) ?? [];
for (const entry of manifestEntries) {
  const id = entry.match(/id:\s*"([^"]+)"/)?.[1] ?? "unknown";
  for (const field of ["claim", "source", "verification", "privacyBoundary"]) {
    if (!entry.match(new RegExp(`${field}:\\s*"[^"]+"`))) {
      console.error(`Proof manifest entry ${id} missing ${field}`);
      process.exitCode = 1;
    }
  }

  const source = entry.match(/source:\s*"([^"]+)"/)?.[1];
  if (source?.startsWith("http")) {
    try {
      new URL(source);
    } catch {
      console.error(`Proof manifest entry ${id} has invalid source URL: ${source}`);
      process.exitCode = 1;
    }
  } else if (source && !fs.existsSync(path.join(process.cwd(), source))) {
    console.error(`Proof manifest entry ${id} points to missing local source: ${source}`);
    process.exitCode = 1;
  }

  if (
    entry.includes('visibility: "private-safe"') &&
    !entry.match(/privacyBoundary:\s*"[^"]{16,}"/)
  ) {
    console.error(`Private-safe proof manifest entry ${id} needs a real boundary`);
    process.exitCode = 1;
  }
}

const projectBlocks = projectsSource.match(/\n  \{[\s\S]*?\n  \},/g) ?? [];
for (const block of projectBlocks) {
  const id = block.match(/id:\s*"([^"]+)"/)?.[1] ?? "unknown-project";
  const title = block.match(/title:\s*"([^"]+)"/)?.[1] ?? id;
  const visible = !block.match(/portfolioVisible:\s*false/);
  const hasMetrics = block.includes("metrics:");
  if (!visible || !hasMetrics) continue;

  const proofIdsBlock = block.match(/proofIds:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
  const proofIds = Array.from(
    proofIdsBlock.matchAll(/"([^"]+)"/g),
    (match) => match[1]
  );

  if (proofIds.length === 0) {
    console.error(`${title} has visible metrics but no proofIds`);
    process.exitCode = 1;
  }

  for (const proofId of proofIds) {
    if (!manifestIds.has(proofId)) {
      console.error(`${title} references missing proof id: ${proofId}`);
      process.exitCode = 1;
    }
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Proof manifest check passed.");
```

- [ ] **Step 3: Add package script**

Modify `package.json`:

```json
{
  "scripts": {
    "test:proof": "node scripts/qa/check-proof-manifest.mjs"
  }
}
```

- [ ] **Step 4: Remove or explicitly audit the AutoML implicit live URL**

Inspect `public/images/projects/agentic-automl-poster-proof.png`.

Choose one path:

1. Replace the poster proof crop with a sanitized crop that omits `agentic-automl.vercel.app`.
2. Add `liveUrl` to AutoML only after auditing the live demo and writing a demo-data boundary in `projects.ts` and `projectCaseStudies.ts`.

Preferred for recruiter safety: replace the poster crop and keep `liveUrl: null`.

- [ ] **Step 5: Add UI proof-manifest references**

Add `proofIds?: string[]` to the `Project` interface in `src/lib/data/projects.ts`, then attach IDs:

```ts
proofIds: ["automl-ledger-events"],
```

Use equivalent IDs for JobTracker, Fast MNIST, Taskflow, Visual Assist, Master Inventory, PolicyBot, and Paid Internships. If a project is not ready for proof-backed recruiter display, set `portfolioVisible: false` instead of leaving visible metrics without proof.

- [ ] **Step 6: Add Playwright proof-manifest assertions**

In `tests/playwright/atlas.spec.ts`, add a test:

```ts
test("featured project metrics have proof manifest coverage", async () => {
  const { projects } = await import("../../src/lib/data/projects");
  const { proofManifest } = await import("../../src/lib/data/proofManifest");
  const proofIds = new Set(proofManifest.map((entry) => entry.id));

  for (const project of projects.filter(
    (item) => item.portfolioVisible !== false && (item.metrics?.length ?? 0) > 0
  )) {
    expect(
      project.proofIds?.length ?? 0,
      `${project.title} has visible metrics but no proof ids`
    ).toBeGreaterThan(0);

    for (const id of project.proofIds ?? []) {
      expect(proofIds.has(id), `${project.title} proof id ${id}`).toBe(true);
    }
  }
});
```

- [ ] **Step 7: Verify**

Run:

```bash
npm run test:proof
npm run typecheck
npm run test:e2e -- --grep "proof"
```

Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/lib/data/proofManifest.ts scripts/qa/check-proof-manifest.mjs src/lib/data/projects.ts src/lib/data/projectCaseStudies.ts public/images/projects/agentic-automl-poster-proof.png package.json package-lock.json tests/playwright/atlas.spec.ts
git commit -m "feat: add recruiter proof manifest"
```

---

### Task 3: CI, Accessibility, Reduced Motion, And Performance Budgets

**Files:**
- Create: `scripts/qa/check-asset-budgets.mjs`
- Create: `tests/playwright/reduced-motion.spec.ts`
- Create: `tests/playwright/performance-budget.spec.ts`
- Modify: `tests/playwright/a11y-audit.spec.ts`
- Modify: `playwright.config.ts`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add asset budget script**

Create `scripts/qa/check-asset-budgets.mjs`:

```js
import fs from "node:fs";

const budgets = [
  ["public/images/profile/ayush-yadav-professional-portrait.png", 1_200_000],
  ["public/images/projects/agentic-automl-poster-proof.png", 1_000_000],
  ["public/og-image.png", 300_000],
  ["public/resume.pdf", 250_000],
];

for (const [file, maxBytes] of budgets) {
  const size = fs.statSync(file).size;
  if (size > maxBytes) {
    console.error(`${file} is ${size} bytes, budget is ${maxBytes}`);
    process.exitCode = 1;
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Asset budget check passed.");
```

- [ ] **Step 2: Add reduced-motion test**

Create `tests/playwright/reduced-motion.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("Reduced motion and keyboard access", () => {
  test.use({ reducedMotion: "reduce" });

  test("page remains usable with reduced motion", async ({ page }) => {
    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });

    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("link", { name: "Resume" }).first()).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
  });

  test("anchor navigation works without relying on animation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Case Studies" }).click();
    await expect(page.locator("#projects")).toBeInViewport();
  });
});
```

- [ ] **Step 3: Add performance budget test**

Create `tests/playwright/performance-budget.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("homepage transfer and image budget stays controlled", async ({ page }) => {
  const responses: { url: string; encodedBodySize: number }[] = [];

  page.on("response", async (response) => {
    const timing = await response.request().sizes().catch(() => null);
    if (timing) {
      responses.push({
        url: response.url(),
        encodedBodySize: timing.responseBodySize,
      });
    }
  });

  await page.goto("/");
  await page.locator("#hero").waitFor({ state: "attached" });
  await page.waitForLoadState("networkidle");

  const totalBytes = responses.reduce((sum, item) => sum + item.encodedBodySize, 0);
  expect(totalBytes).toBeLessThan(4_000_000);

  const oversizedImages = responses.filter(
    (item) =>
      /\\.(png|jpe?g|webp|svg)(\\?|$)/.test(item.url) &&
      item.encodedBodySize > 1_200_000
  );
  expect(oversizedImages).toEqual([]);

  const vitals = await page.evaluate(() => {
    const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
    const layoutShiftEntries = performance.getEntriesByType("layout-shift") as PerformanceEntry[];
    const cls = layoutShiftEntries.reduce((sum, entry) => {
      const candidate = entry as PerformanceEntry & {
        value?: number;
        hadRecentInput?: boolean;
      };
      return candidate.hadRecentInput ? sum : sum + (candidate.value ?? 0);
    }, 0);

    return {
      lcp: lcpEntries.at(-1)?.startTime ?? 0,
      cls,
    };
  });

  expect(vitals.lcp).toBeLessThan(2500);
  expect(vitals.cls).toBeLessThan(0.1);
});
```

- [ ] **Step 4: Restore contrast coverage strategy**

Modify `tests/playwright/a11y-audit.spec.ts` so contrast is not silently ignored. If axe still false-positives Tailwind CSS variables, add a separate manual contrast test for Atlas tokens and keep the axe disable comment narrow.

Required addition:

```ts
test("technical-operations-atlas color tokens meet contrast budget", async ({
  page,
}) => {
  await page.goto("/");
  const ratios = await page.evaluate(() => {
    function luminance(rgb: number[]) {
      const channel = rgb.map((value) => {
        const normalized = value / 255;
        return normalized <= 0.03928
          ? normalized / 12.92
          : Math.pow((normalized + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * channel[0] + 0.7152 * channel[1] + 0.0722 * channel[2];
    }
    function parse(color: string) {
      return color.match(/\\d+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
    }
    function contrast(fg: string, bg: string) {
      const l1 = luminance(parse(fg));
      const l2 = luminance(parse(bg));
      const bright = Math.max(l1, l2);
      const dark = Math.min(l1, l2);
      return (bright + 0.05) / (dark + 0.05);
    }
    return Array.from(document.querySelectorAll("p, a, h1, h2, h3, span"))
      .filter((node) => {
        const element = node as HTMLElement;
        const text = element.innerText?.trim();
        return text && element.offsetParent !== null;
      })
      .slice(0, 80)
      .map((node) => {
        const style = getComputedStyle(node as HTMLElement);
        const parentStyle = getComputedStyle((node as HTMLElement).parentElement ?? document.body);
        return contrast(style.color, parentStyle.backgroundColor || "rgb(9, 11, 13)");
      });
  });

  expect(Math.min(...ratios)).toBeGreaterThanOrEqual(4.5);
});
```

- [ ] **Step 5: Add package scripts**

Modify `package.json`:

```json
{
  "scripts": {
    "assets:budget": "node scripts/qa/check-asset-budgets.mjs",
    "test:e2e:reduced-motion": "NEXT_PUBLIC_BASE_PATH= next build --webpack && NEXT_PUBLIC_BASE_PATH= playwright test tests/playwright/reduced-motion.spec.ts",
    "test:e2e:performance": "NEXT_PUBLIC_BASE_PATH= next build --webpack && NEXT_PUBLIC_BASE_PATH= playwright test tests/playwright/performance-budget.spec.ts",
    "test:e2e:browser-smoke": "NEXT_PUBLIC_BASE_PATH= next build --webpack && NEXT_PUBLIC_BASE_PATH= playwright test tests/playwright/atlas.spec.ts --project=chromium-desktop --project=chromium-mobile --project=firefox-desktop"
  }
}
```

Also add `firefox-desktop` to `playwright.config.ts`:

```ts
{
  name: "firefox-desktop",
  use: {
    ...devices["Desktop Firefox"],
    viewport: { width: 1440, height: 900 },
  },
},
```

- [ ] **Step 6: Add CI jobs**

Add to `.github/workflows/ci.yml`:

```yaml
  browser-smoke:
    name: Playwright browser smoke
    runs-on: ubuntu-latest
    needs: [format, eslint, typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
      - run: npm ci
      - run: npx playwright install --with-deps chromium firefox
      - run: npm run test:e2e:browser-smoke
      - run: npm run test:e2e:reduced-motion
      - run: npm run assets:budget
```

If Firefox proves unstable in GitHub Actions because of system dependencies, document the exact failure and substitute WebKit only after a green local run. Do not silently drop non-Chromium smoke coverage.

- [ ] **Step 7: Verify**

Run:

```bash
npm run assets:budget
npm run test:e2e:browser-smoke
npm run test:e2e:reduced-motion
npm run test:e2e:performance
npm run test:e2e:full
```

Expected: the first asset-budget run may fail until images are compressed. After compression, all commands pass.

- [ ] **Step 8: Commit**

```bash
git add scripts/qa/check-asset-budgets.mjs tests/playwright/reduced-motion.spec.ts tests/playwright/performance-budget.spec.ts tests/playwright/a11y-audit.spec.ts playwright.config.ts package.json package-lock.json .github/workflows/ci.yml
git commit -m "test: harden accessibility and performance gates"
```

---

### Task 4: Atlas-Only Code Cleanup

**Files:**
- Modify: `src/components/themes/ThemeOrchestrator.tsx`
- Modify: `src/config/themes.ts`
- Delete or archive: `src/components/layout/ThemeSwitcher.tsx`
- Delete or archive: `src/components/backgrounds/*`
- Delete or archive: `src/components/cursors/*`
- Delete or archive: `src/components/sections/*`
- Modify: `tests/playwright/portfolio-fixtures.ts`
- Modify: `tests/playwright/INDEX.md`
- Modify: `tests/playwright/deep-qa.spec.ts`
- Modify: `.gitignore`
- Modify: `src/components/layout/SmoothScroll.tsx`

- [ ] **Step 1: Remove unused import warning**

In `tests/playwright/deep-qa.spec.ts`, remove `isMobileViewport` from the import list.

Run:

```bash
npm run lint
```

Expected: no errors and no warnings.

- [ ] **Step 2: Collapse `ThemeOrchestrator`**

Replace `src/components/themes/ThemeOrchestrator.tsx` with:

```tsx
import { TechnicalOperationsAtlas } from "@/components/atlas/TechnicalOperationsAtlas";

export function ThemeOrchestrator() {
  return <TechnicalOperationsAtlas />;
}
```

- [ ] **Step 3: Reduce theme config**

Replace `src/config/themes.ts` with:

```ts
export type ThemeId = "technical-operations-atlas";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  label: string;
  description: string;
}

export const defaultThemeId: ThemeId = "technical-operations-atlas";

export const themeConfigs: Record<ThemeId, ThemeConfig> = {
  "technical-operations-atlas": {
    id: "technical-operations-atlas",
    name: "technical-operations-atlas",
    label: "Technical Operations Atlas",
    description: "Evidence-first CS portfolio with recruiter-ready proof",
  },
};

export const themeIds: ThemeId[] = [defaultThemeId];

export function getThemeConfig(themeId: string): ThemeConfig {
  return themeConfigs[themeId as ThemeId] ?? themeConfigs[defaultThemeId];
}
```

- [ ] **Step 4: Remove dead public theme switcher and legacy visual modes**

Delete files only after `rg` confirms they are no longer imported by `src` or `tests`:

```bash
rg -n "ThemeSwitcher|LiquidGlassBg|CosmicVoyageBg|RetroTerminalBg|SynthwaveSunsetBg|BioluminescentBg|GlassCursor|StarCursor|BlockCursor|NeonCursor|OrbCursor|from \"@/components/sections" src tests docs scripts README.md package.json .github
git rm --dry-run src/components/layout/ThemeSwitcher.tsx
git rm --dry-run src/components/backgrounds/BioluminescentBg.tsx src/components/backgrounds/CosmicVoyageBg.tsx src/components/backgrounds/LiquidGlassBg.tsx src/components/backgrounds/RetroTerminalBg.tsx src/components/backgrounds/SynthwaveSunsetBg.tsx
git rm --dry-run src/components/cursors/BlockCursor.tsx src/components/cursors/GlassCursor.tsx src/components/cursors/NeonCursor.tsx src/components/cursors/OrbCursor.tsx src/components/cursors/StarCursor.tsx
git rm --dry-run src/components/sections/About.tsx src/components/sections/Contact.tsx src/components/sections/Experience.tsx src/components/sections/Hero.tsx src/components/sections/Projects.tsx src/components/sections/Skills.tsx src/components/sections/Testimonials.tsx
```

Then remove:

```bash
git rm src/components/layout/ThemeSwitcher.tsx
git rm src/components/backgrounds/BioluminescentBg.tsx src/components/backgrounds/CosmicVoyageBg.tsx src/components/backgrounds/LiquidGlassBg.tsx src/components/backgrounds/RetroTerminalBg.tsx src/components/backgrounds/SynthwaveSunsetBg.tsx
git rm src/components/cursors/BlockCursor.tsx src/components/cursors/GlassCursor.tsx src/components/cursors/NeonCursor.tsx src/components/cursors/OrbCursor.tsx src/components/cursors/StarCursor.tsx
git rm src/components/sections/About.tsx src/components/sections/Contact.tsx src/components/sections/Experience.tsx src/components/sections/Hero.tsx src/components/sections/Projects.tsx src/components/sections/Skills.tsx src/components/sections/Testimonials.tsx
```

Keep this deletion in a separate commit from proof, SEO, or visual changes.

- [ ] **Step 5: Update stale Playwright docs and helpers**

In `tests/playwright/INDEX.md`, replace the Current Contract section with:

```md
## Current Contract

- The only public theme is `technical-operations-atlas`.
- No public desktop or mobile theme switcher is rendered.
- Tests derive asset URLs from Playwright `baseURL` or current page URL instead of hardcoding `127.0.0.1:3000`.
- Project visuals must be labeled as real screenshots, architecture diagrams, or representative visuals.
```

Remove `switchThemeViaUiAndWait` from `tests/playwright/portfolio-fixtures.ts` if no tests use it after the cleanup.

- [ ] **Step 6: Add stale-claims and legacy-contract scan**

Run:

```bash
rg -n "Liquid Glass|Cosmic Voyage|Retro Terminal|Synthwave|Bioluminescent|theme switcher|generated metric|representative screenshot|placeholder|TBD|TODO" src tests docs scripts README.md public
```

Expected: only intentional historical plan/report references remain under `docs/superpowers/`. Runtime source, public copy, and tests should not claim legacy theme contracts or unbacked generated metrics.

- [ ] **Step 7: Fix SmoothScroll RAF cleanup**

Modify `src/components/layout/SmoothScroll.tsx`:

```tsx
let rafId = 0;

function raf(time: number) {
  lenis.raf(time);
  ScrollTrigger.update();
  rafId = requestAnimationFrame(raf);
}

rafId = requestAnimationFrame(raf);
```

Cleanup remains:

```tsx
cancelAnimationFrame(rafId);
window.removeEventListener("resize", handleResize);
lenis.destroy();
lenisRef.current = null;
```

- [ ] **Step 8: Ignore all generated output**

Modify `.gitignore` so it ignores all generated output:

```gitignore
/output/
```

Keep any approved evidence docs under `docs/superpowers/evidence/`, not `output/`.

- [ ] **Step 9: Verify**

Run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:e2e:full
```

Expected: all pass with no lint warnings.

- [ ] **Step 10: Commit**

```bash
git add src/components/themes/ThemeOrchestrator.tsx src/config/themes.ts tests/playwright/INDEX.md tests/playwright/portfolio-fixtures.ts tests/playwright/deep-qa.spec.ts src/components/layout/SmoothScroll.tsx .gitignore
git add -u src/components/layout src/components/backgrounds src/components/cursors src/components/sections
git commit -m "refactor: collapse portfolio to Atlas theme"
```

---

### Task 5: Split Atlas Page And Improve Visual Rhythm

**Files:**
- Create: `src/components/atlas/sections/AtlasHero.tsx`
- Create: `src/components/atlas/sections/AtlasProfile.tsx`
- Create: `src/components/atlas/sections/AtlasProjects.tsx`
- Create: `src/components/atlas/sections/AtlasExperience.tsx`
- Create: `src/components/atlas/sections/AtlasSkills.tsx`
- Create: `src/components/atlas/sections/AtlasTestimonials.tsx`
- Create: `src/components/atlas/sections/AtlasContact.tsx`
- Modify: `src/components/atlas/TechnicalOperationsAtlas.tsx`
- Modify: `src/components/atlas/AtlasEvidence.tsx`
- Test: `tests/playwright/portfolio-quality-score.spec.ts`
- Test: `tests/playwright/critique-screenshots.spec.ts`

- [ ] **Step 1: Split the page without visual changes**

Move each section block from `TechnicalOperationsAtlas.tsx` into a named component under `src/components/atlas/sections/`.

The final `TechnicalOperationsAtlas.tsx` should read like:

```tsx
import { AtlasHero } from "@/components/atlas/sections/AtlasHero";
import { AtlasProfile } from "@/components/atlas/sections/AtlasProfile";
import { AtlasProjects } from "@/components/atlas/sections/AtlasProjects";
import { AtlasExperience } from "@/components/atlas/sections/AtlasExperience";
import { AtlasSkills } from "@/components/atlas/sections/AtlasSkills";
import { AtlasTestimonials } from "@/components/atlas/sections/AtlasTestimonials";
import { AtlasContact } from "@/components/atlas/sections/AtlasContact";

export function TechnicalOperationsAtlas() {
  return (
    <div className="min-h-screen bg-[#090b0d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.14),transparent_32rem),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.10),transparent_26rem),linear-gradient(180deg,rgba(9,11,13,0.2),#090b0d_80%)]" />
      <div className="relative z-10">
        <AtlasHero />
        <AtlasProfile />
        <AtlasProjects />
        <AtlasExperience />
        <AtlasSkills />
        <AtlasTestimonials />
        <AtlasContact />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify and commit the mechanical split**

Run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:e2e:score
```

Expected: no visual-quality score regression and no lint/format/type failures.

Commit only the component extraction:

```bash
git add src/components/atlas/TechnicalOperationsAtlas.tsx src/components/atlas/sections
git commit -m "refactor: split Atlas sections"
```

- [ ] **Step 3: Add a signature hero operations panel**

In `AtlasHero.tsx`, replace the right-side six-card-only pipeline with a compact panel containing:

- current proof packet status,
- a six-step pipeline,
- three status rows: `Source truth`, `Private-safe`, `Recruiter-ready`,
- one mini log strip with public/private proof counts.

Use existing data only. Do not invent new metrics.

- [ ] **Step 4: Reduce repeated card rhythm**

Change at least two sections from bordered cards to table/ledger layouts:

- Skills: turn skill categories into four compact ledger rows.
- Project Index: turn public/private project list into a dense table-like grid with status tags.

- [ ] **Step 5: Improve mobile first scan**

In `AtlasHero.tsx`, show only two proof metrics before the mobile fold:

```tsx
const primaryMobileMetrics = proofMetrics.slice(0, 2);
const secondaryMetrics = proofMetrics.slice(2);
```

Render secondary metrics below the first hero paragraph or after the pipeline on mobile.

In `AtlasProjects.tsx`, add a mobile link after the first four cards:

```tsx
<a
  href="#project-index"
  className="mt-5 inline-flex rounded border border-sky-400/40 px-4 py-2 text-sm font-semibold text-sky-300 hover:border-sky-300 hover:text-sky-200 md:hidden"
>
  View all evidence records
</a>
```

Add `id="project-index"` to the project index section.

- [ ] **Step 6: Sharpen contact close**

Change the contact section title to a proof-packet close:

```tsx
Open to new-grad software engineering roles where data, ML, and reliability matter.
```

Add a compact row:

```tsx
<dl>
  <div><dt>Status</dt><dd>Available for new-grad roles</dd></div>
  <div><dt>Proof packet</dt><dd>Resume, GitHub, LinkedIn, case studies</dd></div>
  <div><dt>Best fit</dt><dd>Software, data, ML systems, full-stack</dd></div>
</dl>
```

- [ ] **Step 7: Verify visual output**

Run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:e2e:score
npm run test:e2e:artifacts
```

Expected:

- Quality score remains 10 with no deductions.
- Fresh screenshots exist under `output/playwright/critique-screenshots/`.
- Desktop screenshot has less repeated card rhythm in the hero, skills, and project index areas.
- Mobile screenshot shows no more than two proof metrics before the first paragraph and has a clear "View all evidence records" path.
- Contact screenshot closes with role availability, proof packet, and best-fit signals above the fold on desktop.

- [ ] **Step 8: Commit the visual polish**

```bash
git add src/components/atlas/TechnicalOperationsAtlas.tsx src/components/atlas/AtlasEvidence.tsx src/components/atlas/sections tests/playwright/portfolio-quality-score.spec.ts tests/playwright/critique-screenshots.spec.ts
git commit -m "style: polish Atlas recruiter scan"
```

---

### Task 6: Final Public Regression Verification

**Files:**
- Modify only if needed: `.github/workflows/deploy.yml`
- No source changes expected if prior tasks are complete

- [ ] **Step 1: Merge the completed polish branch to main through the chosen GitHub flow**

Use the repository's normal PR/merge route. Do not bypass review if branch protection exists.

- [ ] **Step 2: Wait for GitHub Pages deploy**

Run:

```bash
gh run list --repo yadava5/Portfolio-2.0 --workflow "Deploy to GitHub Pages" --limit 5
```

Expected: latest run on `main` completes successfully.

- [ ] **Step 3: Verify public routes**

Run:

```bash
for url in \
  https://yadava5.github.io/Portfolio-2.0/ \
  https://yadava5.github.io/Portfolio-2.0/resume.pdf \
  https://yadava5.github.io/Portfolio-2.0/sitemap.xml \
  https://yadava5.github.io/Portfolio-2.0/projects/automl/ \
  https://yadava5.github.io/Portfolio-2.0/projects/fast-mnist-nn/ \
  https://yadava5.github.io/Portfolio-2.0/projects/jobtracker/ \
  https://yadava5.github.io/Portfolio-2.0/projects/master-inventory/ \
  https://yadava5.github.io/Portfolio-2.0/projects/policybot/ \
  https://yadava5.github.io/Portfolio-2.0/projects/taskflow-calendar/ \
  https://yadava5.github.io/Portfolio-2.0/projects/visual-assist/
do
  http_status=$(curl -L -o /dev/null -s -w "%{http_code}" "$url")
  printf "%s %s\n" "$http_status" "$url"
  test "$http_status" = "200"
done
```

Expected: every route prints `200`.

- [ ] **Step 4: Browser smoke public site**

Run:

```bash
mkdir -p output/playwright
npx playwright screenshot https://yadava5.github.io/Portfolio-2.0/ output/playwright/public-home.png
npx playwright screenshot https://yadava5.github.io/Portfolio-2.0/projects/automl/ output/playwright/public-automl.png
```

Expected: screenshots show the Atlas homepage and AutoML case study, not GitHub Pages 404.

- [ ] **Step 5: Commit only if workflow fixes were needed**

If no source files changed, do not create a commit. If deploy workflow changes were needed:

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: verify github pages deployment"
```

---

## Final Verification Matrix

Run before calling this improvement pass complete:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run resume:check
NODE_ENV=production NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0 npm run build
npm run test:seo
npm run test:proof
npm run assets:budget
npm run test:e2e:browser-smoke
npm run test:e2e:reduced-motion
npm run test:e2e:performance
npm run test:e2e:full
npm run test:e2e:score
npm run test:e2e:artifacts
```

Expected:

- no lint warnings,
- resume remains one page,
- static SEO check passes under `/Portfolio-2.0`,
- proof manifest check passes,
- asset budgets pass,
- full Playwright remains green,
- public GitHub Pages routes return `200` after merge/deploy.

## Self-Review

Spec coverage:

- Public deployment gap is covered first by Task 0, then guarded again by Tasks 1 and 6.
- Asset truth and proof inspectability are covered by Task 2.
- QA, accessibility, performance, and CI gaps are covered by Task 3.
- Maintainability and legacy theme cleanup are covered by Task 4.
- Visual polish and recruiter scan improvements are covered by Task 5.

Placeholder scan:

- No TBD/TODO/fill-later items remain.
- Each task includes exact files, commands, expected outcomes, and commit boundaries.

Risk:

- Task 4 can remove a lot of files. Run `rg` before each delete and keep the deletion commit separate.
- Task 5 should not invent new proof metrics. Use only existing project data and proof manifest entries.
- Task 0 and Task 6 depend on GitHub Pages repository settings. If Pages is disabled, fix settings before judging source changes.
