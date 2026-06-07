# Portfolio 90 Plus Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Raise every portfolio critique lane above 90 and make the GitHub Pages portfolio safe to share publicly with recruiters.

**Architecture:** Treat Technical Operations Atlas as the only public portfolio. Add source-truth gates around deployability, SEO metadata, project proof coverage, CI, accessibility, performance, and repo hygiene before polishing the visual scan. Keep commits separated by concern: docs/plan, SEO/deploy, proof, QA, cleanup, visual polish, and final release.

**Tech Stack:** Next.js static export, TypeScript, React, Playwright CLI, Playwright test runner, axe-core, GitHub Actions, Node.js QA scripts, GitHub Pages.

---

## Target Scores

| Aspect | Current | Target |
| --- | ---: | ---: |
| Public deployment availability | 20 | 95+ |
| QA/accessibility/performance/SEO | 74 | 91+ |
| Maintainability/architecture | 72 | 91+ |
| Asset truth/project credibility | 76 | 92+ |
| Visual design/motion | 82 | 91+ |
| Recruiter narrative/conversion | 86 | 92+ |
| Public recruiter readiness | 69 | 91+ |

## File Structure

- Create `docs/superpowers/plans/2026-06-07-portfolio-90-plus-launch.md`: this execution plan.
- Create `scripts/qa/check-static-export-seo.mjs`: production static-export route, sitemap, robots, canonical, and social-image guard.
- Create `src/app/sitemap.ts`: generated sitemap covering homepage plus all case-study routes.
- Create `src/app/robots.ts`: generated robots file pointing at the production sitemap.
- Create `src/lib/seo.ts`: production absolute URL helper for canonical and social metadata.
- Modify `src/app/layout.tsx`: use production absolute social image URLs and homepage canonical.
- Modify `src/app/projects/[id]/page.tsx`: use trailing-slash canonical URLs and production absolute project image URLs.
- Delete `public/sitemap.xml` and `public/robots.txt`: remove stale static files that only list the homepage.
- Create `src/lib/data/proofManifest.ts`: typed proof registry for every public metric-bearing project.
- Modify `src/lib/data/projects.ts`: add `proofIds` and connect every visible project with metrics to proof entries.
- Modify `src/lib/data/projectCaseStudies.ts`: include proof IDs where case-study artifacts need explicit boundaries.
- Create `scripts/qa/check-proof-manifest.mjs`: fail when visible metrics lack proof, local proof files are missing, external proof URLs are invalid, or private-safe entries lack privacy boundaries.
- Create `scripts/qa/check-asset-budgets.mjs`: fail when public assets exceed approved launch budgets.
- Create `tests/playwright/static-seo.spec.ts`: browser metadata smoke test under production base path.
- Create `tests/playwright/reduced-motion.spec.ts`: reduced-motion and keyboard usability smoke test.
- Create `tests/playwright/performance-budget.spec.ts`: transfer-size, image-size, LCP, and CLS budget test.
- Modify `tests/playwright/a11y-audit.spec.ts`: restore color-contrast coverage with an Atlas token contrast guard.
- Modify `playwright.config.ts`: add `firefox-desktop` smoke project.
- Modify `package.json`: add SEO, proof, asset-budget, reduced-motion, performance, and browser-smoke scripts.
- Modify `.github/workflows/ci.yml`: enforce resume, SEO, proof, Playwright smoke, reduced-motion, and asset/performance checks in CI.
- Modify `.github/workflows/deploy.yml`: build with explicit production base path and run static SEO/proof checks before uploading Pages artifact.
- Modify `src/components/themes/ThemeOrchestrator.tsx`: collapse public rendering to Atlas only.
- Modify `src/config/themes.ts`: reduce runtime theme config to Atlas only.
- Delete unused legacy theme backgrounds, cursors, section components, and `ThemeSwitcher` after reference scans pass.
- Modify `tests/playwright/INDEX.md` and `tests/playwright/portfolio-fixtures.ts`: align test docs/helpers with Atlas-only public contract.
- Modify `tests/playwright/deep-qa.spec.ts`: remove unused `isMobileViewport` import.
- Modify `src/components/layout/SmoothScroll.tsx`: clean up the latest recursive RAF id.
- Modify `.gitignore`: ignore all generated `output/`.
- Modify `src/components/atlas/TechnicalOperationsAtlas.tsx`: polish recruiter scan, reduce repeated card rhythm, improve mobile first fold, and sharpen contact close.
- Create `docs/superpowers/reports/2026-06-07-launch-verification.md`: final launch evidence report with local and public verification results.

---

### Task 1: Baseline, Plan Commit, And Public Availability Probe

**Files:**
- Add: `docs/superpowers/plans/2026-06-07-portfolio-90-plus-launch.md`
- Add/modify: `docs/superpowers/reports/2026-06-07-portfolio-critique-scorecard.md`
- Add/modify: `docs/superpowers/reports/2026-06-07-portfolio-plan-critique.md`

- [ ] **Step 1: Verify branch and untracked state**

Run:

```bash
git status --short --branch
git rev-list --left-right --count origin/main...HEAD
```

Expected: branch is not `main`; current branch is ahead of `origin/main`; docs/report/output untracked files are visible and understood.

- [ ] **Step 2: Probe public Pages status**

Run:

```bash
gh repo view yadava5/Portfolio-2.0 --json defaultBranchRef,url,isPrivate
gh api repos/yadava5/Portfolio-2.0/pages || true
for url in \
  https://yadava5.github.io/Portfolio-2.0/ \
  https://yadava5.github.io/Portfolio-2.0/resume.pdf \
  https://yadava5.github.io/Portfolio-2.0/sitemap.xml
do
  http_status=$(curl -L -o /dev/null -s -w "%{http_code}" "$url")
  printf "%s %s\n" "$http_status" "$url"
done
```

Expected: current public availability is recorded before any fix. If Pages is disabled, keep implementing local launch gates, then recover Pages at final release.

- [ ] **Step 3: Commit critique and launch planning docs**

Run:

```bash
git add docs/superpowers/plans/2026-06-07-portfolio-90-plus-launch.md docs/superpowers/plans/2026-06-07-portfolio-polish-hardening.md docs/superpowers/reports/2026-06-07-portfolio-critique-scorecard.md docs/superpowers/reports/2026-06-07-portfolio-plan-critique.md
git commit -m "docs: add portfolio launch hardening plan"
```

Expected: planning docs are committed separately from implementation code.

---

### Task 2: Static Export SEO And Deploy Gates

**Files:**
- Create: `scripts/qa/check-static-export-seo.mjs`
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Create: `src/lib/seo.ts`
- Create: `tests/playwright/static-seo.spec.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/projects/[id]/page.tsx`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/deploy.yml`
- Delete: `public/sitemap.xml`
- Delete: `public/robots.txt`

- [ ] **Step 1: Create production absolute URL helper**

Create `src/lib/seo.ts`:

```ts
import { siteMetadata } from "@/lib/data/personal";

export function absoluteSiteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const normalized = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return new URL(normalized, `${siteMetadata.url}/`).toString();
}
```

- [ ] **Step 2: Replace stale static sitemap and robots**

Delete:

```bash
git rm public/sitemap.xml public/robots.txt
```

Create `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { caseStudyIds } from "@/lib/data/projectCaseStudies";
import { siteMetadata } from "@/lib/data/personal";

const lastModified = new Date("2026-06-07");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${siteMetadata.url}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...caseStudyIds.map((id) => ({
      url: `${siteMetadata.url}/projects/${id}/`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
```

Create `src/app/robots.ts`:

```ts
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

- [ ] **Step 3: Fix homepage and project metadata**

In `src/app/layout.tsx`, import `absoluteSiteUrl` and use it for icon/social image URLs. Add homepage canonical:

```ts
import { absoluteSiteUrl } from "@/lib/seo";
```

Required metadata changes:

```ts
icons: {
  icon: absoluteSiteUrl("/favicon.svg"),
  shortcut: absoluteSiteUrl("/favicon.ico"),
},
alternates: {
  canonical: `${siteMetadata.url}/`,
},
openGraph: {
  ...,
  images: [{ url: absoluteSiteUrl(siteMetadata.ogImage), width: 1200, height: 630 }],
},
twitter: {
  ...,
  images: [absoluteSiteUrl(siteMetadata.ogImage)],
},
```

In `src/app/projects/[id]/page.tsx`, import `absoluteSiteUrl` and use a trailing-slash project URL:

```ts
const projectUrl = `${siteMetadata.url}/projects/${project.id}/`;
const projectImage = absoluteSiteUrl(project.image || siteMetadata.ogImage);
```

Then set canonical, OpenGraph URL, OpenGraph image, and Twitter image from those constants.

- [ ] **Step 4: Add static export SEO script**

Create `scripts/qa/check-static-export-seo.mjs`:

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
  return path.join(outDir, route.replace(/^\//, ""), "index.html");
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

  if (imageUrls.length === 0) {
    fail(`missing social image metadata for ${route}`);
  }

  for (const imageUrl of imageUrls) {
    if (!imageUrl.startsWith(`${siteUrl}/`)) {
      fail(`metadata image missing production base path for ${route}: ${imageUrl}`);
    }
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Static SEO check passed.");
```

- [ ] **Step 5: Add browser metadata smoke**

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

- [ ] **Step 6: Add scripts and CI/deploy gates**

Add to `package.json` scripts:

```json
"test:seo": "node scripts/qa/check-static-export-seo.mjs",
"test:e2e:static-seo": "NODE_ENV=production NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0 next build --webpack && NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0 playwright test tests/playwright/static-seo.spec.ts"
```

In `.github/workflows/ci.yml`, add jobs for `resume-check` and `static-seo` after format/eslint/typecheck. In `.github/workflows/deploy.yml`, build with `NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0`, then run `npm run test:seo` before upload.

- [ ] **Step 7: Verify SEO gate**

Run:

```bash
rm -rf out .next
NODE_ENV=production NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0 npm run build
npm run test:seo
npm run test:e2e:static-seo
```

Expected: build passes, script prints `Static SEO check passed.`, Playwright static SEO spec passes.

- [ ] **Step 8: Commit SEO/deploy work**

Run:

```bash
git add package.json package-lock.json scripts/qa/check-static-export-seo.mjs src/app/sitemap.ts src/app/robots.ts src/lib/seo.ts src/app/layout.tsx 'src/app/projects/[id]/page.tsx' tests/playwright/static-seo.spec.ts .github/workflows/ci.yml .github/workflows/deploy.yml
git add -u public/sitemap.xml public/robots.txt
git commit -m "test: add production static export seo gates"
```

---

### Task 3: Proof Manifest And Project Detail Trust

**Files:**
- Create: `src/lib/data/proofManifest.ts`
- Create: `scripts/qa/check-proof-manifest.mjs`
- Modify: `src/lib/data/projects.ts`
- Modify: `src/lib/data/projectCaseStudies.ts`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add proof IDs to project data type**

In `src/lib/data/projects.ts`, add this field to `Project`:

```ts
/** Source-truth proof manifest IDs for visible project metrics */
proofIds?: string[];
```

Add proof IDs to every visible metric-bearing project:

```ts
proofIds: ["jobtracker-local-classifier"],
proofIds: ["automl-workflow-proof"],
proofIds: ["visual-assist-tests"],
proofIds: ["taskflow-tests"],
proofIds: ["fast-mnist-benchmark"],
proofIds: ["master-inventory-ledger"],
proofIds: ["policybot-validation"],
proofIds: ["paid-internships-sources"],
```

- [ ] **Step 2: Create proof manifest**

Create `src/lib/data/proofManifest.ts` with entries for all proof IDs:

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
    label: "3-layer local classifier",
    claim: "JobTracker uses a 3-layer rules, embeddings, and SetFit classifier path for local job-search email classification.",
    source: "https://github.com/yadava5/jobtracker",
    verification: "Public repository architecture and portfolio architecture diagram.",
    visibility: "public",
    privacyBoundary: "No private email content is shown.",
  },
  {
    id: "automl-workflow-proof",
    label: "7-phase AutoML lifecycle",
    claim: "Agentic AutoML presents a 7-phase ML workflow with LangGraph and MCP orchestration.",
    source: "public/images/projects/agentic-automl-poster-proof.png",
    verification: "Private-safe senior design poster and local AutoML repository audit.",
    visibility: "private-safe",
    privacyBoundary: "Uses demo/source-truth data and excludes private repository source.",
  },
  {
    id: "visual-assist-tests",
    label: "71 iOS tests",
    claim: "Visual Assist has audited XCTest model and utility coverage.",
    source: "https://github.com/yadava5/VisualAssist/tree/main/VisualAssistTests",
    verification: "Public test tree and architecture evidence audit.",
    visibility: "public",
    privacyBoundary: "No live camera, location, or user sensor data is shown.",
  },
  {
    id: "taskflow-tests",
    label: "738 automated tests",
    claim: "Taskflow portfolio copy uses 738 automated tests as the validation metric.",
    source: "https://github.com/yadava5/taskflow-calendar",
    verification: "Public repository and local screenshot audit.",
    visibility: "public",
    privacyBoundary: "No private data.",
  },
  {
    id: "fast-mnist-benchmark",
    label: "97%+ accuracy and 3.5x dot-kernel speedup",
    claim: "Fast MNIST benchmark proof supports the listed accuracy and kernel-speedup claims.",
    source: "public/images/projects/fast-mnist-nn.svg",
    verification: "Committed benchmark evidence in the public fast-mnist-nn repository.",
    visibility: "public",
    privacyBoundary: "No private data.",
  },
  {
    id: "master-inventory-ledger",
    label: "10,453 deduped rows",
    claim: "Master Inventory private-safe proof records the deduped inventory row count and schema boundary.",
    source: "public/images/projects/master-inventory-proof.svg",
    verification: "Private-safe local row-count ledger.",
    visibility: "private-safe",
    privacyBoundary: "Raw institutional exports, report names, owner names, and rows are excluded.",
  },
  {
    id: "policybot-validation",
    label: "19/20 structured sweep",
    claim: "PolicyBot private-safe proof records a structured validation sweep.",
    source: "public/images/projects/policybot-validation-proof.svg",
    verification: "Private-safe validation ledger.",
    visibility: "private-safe",
    privacyBoundary: "Raw policy text and Slack messages are excluded.",
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

- [ ] **Step 3: Add proof manifest verifier**

Create `scripts/qa/check-proof-manifest.mjs`:

```js
import fs from "node:fs";
import path from "node:path";

const manifestSource = fs.readFileSync("src/lib/data/proofManifest.ts", "utf8");
const projectsSource = fs.readFileSync("src/lib/data/projects.ts", "utf8");
const manifestIds = new Set(
  Array.from(manifestSource.matchAll(/id:\s*"([^"]+)"/g), (match) => match[1])
);
const requiredIds = [
  "jobtracker-local-classifier",
  "automl-workflow-proof",
  "visual-assist-tests",
  "taskflow-tests",
  "fast-mnist-benchmark",
  "master-inventory-ledger",
  "policybot-validation",
  "paid-internships-sources",
];

function fail(message) {
  console.error(`Proof manifest check failed: ${message}`);
  process.exitCode = 1;
}

for (const id of requiredIds) {
  if (!manifestIds.has(id)) fail(`missing proof id ${id}`);
}

const entries = manifestSource.match(/\n  \{[\s\S]*?\n  \}/g) ?? [];
for (const entry of entries) {
  const id = entry.match(/id:\s*"([^"]+)"/)?.[1] ?? "unknown";
  for (const field of ["claim", "source", "verification", "privacyBoundary"]) {
    if (!entry.match(new RegExp(`${field}:\\s*"[^"]+"`))) {
      fail(`${id} missing ${field}`);
    }
  }
  const source = entry.match(/source:\s*"([^"]+)"/)?.[1];
  if (source?.startsWith("http")) {
    try {
      new URL(source);
    } catch {
      fail(`${id} has invalid URL source ${source}`);
    }
  } else if (source && !fs.existsSync(path.join(process.cwd(), source))) {
    fail(`${id} points to missing local source ${source}`);
  }
  if (
    entry.includes('visibility: "private-safe"') &&
    !entry.match(/privacyBoundary:\s*"[^"]{16,}"/)
  ) {
    fail(`${id} private-safe entry needs a real privacy boundary`);
  }
}

const projectBlocks = projectsSource.match(/\n  \{[\s\S]*?\n  \},/g) ?? [];
for (const block of projectBlocks) {
  const title = block.match(/title:\s*"([^"]+)"/)?.[1] ?? "unknown project";
  const visible = !block.match(/portfolioVisible:\s*false/);
  const hasMetrics = block.includes("metrics:");
  if (!visible || !hasMetrics) continue;

  const proofIdsBlock = block.match(/proofIds:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
  const proofIds = Array.from(
    proofIdsBlock.matchAll(/"([^"]+)"/g),
    (match) => match[1]
  );

  if (proofIds.length === 0) fail(`${title} has visible metrics but no proofIds`);
  for (const proofId of proofIds) {
    if (!manifestIds.has(proofId)) fail(`${title} references missing proof id ${proofId}`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Proof manifest check passed.");
```

- [ ] **Step 4: Add script and CI**

Add to `package.json`:

```json
"test:proof": "node scripts/qa/check-proof-manifest.mjs"
```

Add `npm run test:proof` to CI and deploy before public artifact upload.

- [ ] **Step 5: Verify proof coverage**

Run:

```bash
npm run test:proof
npm run typecheck
```

Expected: proof script prints `Proof manifest check passed.` and TypeScript passes.

- [ ] **Step 6: Commit proof work**

Run:

```bash
git add src/lib/data/proofManifest.ts scripts/qa/check-proof-manifest.mjs src/lib/data/projects.ts src/lib/data/projectCaseStudies.ts package.json package-lock.json .github/workflows/ci.yml .github/workflows/deploy.yml
git commit -m "feat: add project proof manifest"
```

---

### Task 4: QA, Accessibility, Performance, And CI

**Files:**
- Create: `scripts/qa/check-asset-budgets.mjs`
- Create: `tests/playwright/reduced-motion.spec.ts`
- Create: `tests/playwright/performance-budget.spec.ts`
- Modify: `tests/playwright/a11y-audit.spec.ts`
- Modify: `tests/playwright/deep-qa.spec.ts`
- Modify: `playwright.config.ts`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add asset budget script**

Create `scripts/qa/check-asset-budgets.mjs`:

```js
import fs from "node:fs";

const budgets = [
  ["public/images/profile/ayush-yadav-professional-portrait.png", 2_000_000],
  ["public/images/projects/agentic-automl-poster-proof.png", 1_700_000],
  ["public/images/projects/advocacy.png", 1_100_000],
  ["public/og-image.png", 350_000],
  ["public/resume.pdf", 300_000],
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

- [ ] **Step 2: Add reduced-motion Playwright test**

Create `tests/playwright/reduced-motion.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test.describe("reduced motion and keyboard access", () => {
  test.use({ reducedMotion: "reduce" });

  test("page remains usable with reduced motion", async ({ page }) => {
    await page.goto("/");
    await page.locator("#hero").waitFor({ state: "attached" });
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("link", { name: /resume/i }).first()).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
  });

  test("anchor navigation does not depend on scroll animation", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /case studies/i }).click();
    await expect(page.locator("#projects")).toBeInViewport();
  });
});
```

- [ ] **Step 3: Add performance budget Playwright test**

Create `tests/playwright/performance-budget.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("homepage stays within launch performance budgets", async ({ page }) => {
  const responses: { url: string; encodedBodySize: number }[] = [];

  page.on("response", async (response) => {
    const sizes = await response.request().sizes().catch(() => null);
    if (sizes) {
      responses.push({
        url: response.url(),
        encodedBodySize: sizes.responseBodySize,
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
      /\.(png|jpe?g|webp|svg)(\?|$)/.test(item.url) &&
      item.encodedBodySize > 2_000_000
  );
  expect(oversizedImages).toEqual([]);

  const vitals = await page.evaluate(() => {
    const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
    const layoutShiftEntries = performance.getEntriesByType("layout-shift");
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

  expect(vitals.lcp).toBeLessThan(3_000);
  expect(vitals.cls).toBeLessThan(0.1);
});
```

- [ ] **Step 4: Add Firefox smoke project**

In `playwright.config.ts`, add:

```ts
{
  name: "firefox-desktop",
  use: {
    ...devices["Desktop Firefox"],
    viewport: { width: 1440, height: 900 },
  },
},
```

- [ ] **Step 5: Remove lint warning**

In `tests/playwright/deep-qa.spec.ts`, remove the unused `isMobileViewport` import.

- [ ] **Step 6: Add scripts and CI jobs**

Add to `package.json`:

```json
"assets:budget": "node scripts/qa/check-asset-budgets.mjs",
"test:e2e:reduced-motion": "NEXT_PUBLIC_BASE_PATH= next build --webpack && NEXT_PUBLIC_BASE_PATH= playwright test tests/playwright/reduced-motion.spec.ts",
"test:e2e:performance": "NEXT_PUBLIC_BASE_PATH= next build --webpack && NEXT_PUBLIC_BASE_PATH= playwright test tests/playwright/performance-budget.spec.ts",
"test:e2e:browser-smoke": "NEXT_PUBLIC_BASE_PATH= next build --webpack && NEXT_PUBLIC_BASE_PATH= playwright test tests/playwright/atlas.spec.ts --project=chromium-desktop --project=chromium-mobile --project=firefox-desktop"
```

Add CI steps to install Chromium and Firefox and run browser smoke, reduced-motion, proof, SEO, resume, and asset-budget checks.

- [ ] **Step 7: Verify QA gates**

Run:

```bash
npm run lint
npm run assets:budget
npm run test:e2e:browser-smoke
npm run test:e2e:reduced-motion
npm run test:e2e:performance
```

Expected: all pass with no lint warnings.

- [ ] **Step 8: Commit QA work**

Run:

```bash
git add scripts/qa/check-asset-budgets.mjs tests/playwright/reduced-motion.spec.ts tests/playwright/performance-budget.spec.ts tests/playwright/a11y-audit.spec.ts tests/playwright/deep-qa.spec.ts playwright.config.ts package.json package-lock.json .github/workflows/ci.yml
git commit -m "test: harden launch quality gates"
```

---

### Task 5: Atlas-Only Repo Cleanup

**Files:**
- Modify: `src/components/themes/ThemeOrchestrator.tsx`
- Modify: `src/config/themes.ts`
- Modify: `tests/playwright/INDEX.md`
- Modify: `tests/playwright/portfolio-fixtures.ts`
- Modify: `src/components/layout/SmoothScroll.tsx`
- Modify: `.gitignore`
- Delete: `src/components/layout/ThemeSwitcher.tsx`
- Delete: `src/components/backgrounds/*`
- Delete: `src/components/cursors/*`
- Delete: `src/components/sections/*`

- [ ] **Step 1: Collapse public theme orchestrator**

Replace `src/components/themes/ThemeOrchestrator.tsx` with:

```tsx
"use client";

import { TechnicalOperationsAtlas } from "@/components/atlas/TechnicalOperationsAtlas";

export function ThemeOrchestrator() {
  return <TechnicalOperationsAtlas />;
}
```

- [ ] **Step 2: Reduce theme config to Atlas**

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

- [ ] **Step 3: Remove legacy code only after wide scan**

Run:

```bash
rg -n "ThemeSwitcher|LiquidGlassBg|CosmicVoyageBg|RetroTerminalBg|SynthwaveSunsetBg|BioluminescentBg|GlassCursor|StarCursor|BlockCursor|NeonCursor|OrbCursor|from \"@/components/sections" src tests docs scripts README.md package.json .github
git rm --dry-run src/components/layout/ThemeSwitcher.tsx
git rm --dry-run src/components/backgrounds/BioluminescentBg.tsx src/components/backgrounds/CosmicVoyageBg.tsx src/components/backgrounds/LiquidGlassBg.tsx src/components/backgrounds/RetroTerminalBg.tsx src/components/backgrounds/SynthwaveSunsetBg.tsx
git rm --dry-run src/components/cursors/BlockCursor.tsx src/components/cursors/GlassCursor.tsx src/components/cursors/NeonCursor.tsx src/components/cursors/OrbCursor.tsx src/components/cursors/StarCursor.tsx
git rm --dry-run src/components/sections/About.tsx src/components/sections/Contact.tsx src/components/sections/Experience.tsx src/components/sections/Hero.tsx src/components/sections/Projects.tsx src/components/sections/Skills.tsx src/components/sections/Testimonials.tsx
```

If only historical docs or the files being deleted reference legacy modes, remove them:

```bash
git rm src/components/layout/ThemeSwitcher.tsx
git rm src/components/backgrounds/BioluminescentBg.tsx src/components/backgrounds/CosmicVoyageBg.tsx src/components/backgrounds/LiquidGlassBg.tsx src/components/backgrounds/RetroTerminalBg.tsx src/components/backgrounds/SynthwaveSunsetBg.tsx
git rm src/components/cursors/BlockCursor.tsx src/components/cursors/GlassCursor.tsx src/components/cursors/NeonCursor.tsx src/components/cursors/OrbCursor.tsx src/components/cursors/StarCursor.tsx
git rm src/components/sections/About.tsx src/components/sections/Contact.tsx src/components/sections/Experience.tsx src/components/sections/Hero.tsx src/components/sections/Projects.tsx src/components/sections/Skills.tsx src/components/sections/Testimonials.tsx
```

- [ ] **Step 4: Fix SmoothScroll RAF cleanup**

In `src/components/layout/SmoothScroll.tsx`, track the latest RAF id:

```tsx
let rafId = 0;

function raf(time: number) {
  lenis.raf(time);
  ScrollTrigger.update();
  rafId = requestAnimationFrame(raf);
}

rafId = requestAnimationFrame(raf);
```

Cleanup:

```tsx
cancelAnimationFrame(rafId);
window.removeEventListener("resize", handleResize);
lenis.destroy();
lenisRef.current = null;
```

- [ ] **Step 5: Update test docs/helpers and generated output ignore**

Update `tests/playwright/INDEX.md` to state:

```md
## Current Contract

- The only public theme is `technical-operations-atlas`.
- No public desktop or mobile theme switcher is rendered.
- Tests derive asset URLs from Playwright `baseURL` or the current page URL.
- Project visuals must be labeled as real screenshots, architecture diagrams, or representative visuals.
```

Remove unused theme-switch helper exports from `tests/playwright/portfolio-fixtures.ts`.

Add to `.gitignore`:

```gitignore
/output/
```

- [ ] **Step 6: Verify cleanup**

Run:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:e2e:full
```

Expected: all pass with no lint warnings.

- [ ] **Step 7: Commit cleanup**

Run:

```bash
git add src/components/themes/ThemeOrchestrator.tsx src/config/themes.ts tests/playwright/INDEX.md tests/playwright/portfolio-fixtures.ts src/components/layout/SmoothScroll.tsx .gitignore
git add -u src/components/layout src/components/backgrounds src/components/cursors src/components/sections
git commit -m "refactor: collapse portfolio to Atlas"
```

---

### Task 6: Recruiter-Facing Atlas Polish

**Files:**
- Modify: `src/components/atlas/TechnicalOperationsAtlas.tsx`
- Modify: `tests/playwright/portfolio-quality-score.spec.ts` only if the visual score contract needs stronger assertions
- Modify: `tests/playwright/critique-screenshots.spec.ts` only if screenshot coverage misses the changed sections

- [ ] **Step 1: Improve hero scan without inventing metrics**

In `src/components/atlas/TechnicalOperationsAtlas.tsx`, keep the Atlas identity but make the hero communicate:

- role target,
- proof packet readiness,
- project proof boundary,
- private-safe evidence.

The visible hero should emphasize recruiter value before insider metrics.

- [ ] **Step 2: Reduce repeated card rhythm**

Convert at least two repeated card clusters into denser ledger/table treatments:

- skills/toolkit,
- project index/evidence records.

Keep color palette within the current Atlas amber/sky/zinc system; do not add purple/purple-blue hero gradients.

- [ ] **Step 3: Improve mobile first scan**

On mobile, show only two proof metrics before the first hero paragraph. Move secondary metrics below the intro or after the operations panel. Add a mobile-visible jump link to the full project/evidence index.

- [ ] **Step 4: Sharpen contact close**

Use this close:

```tsx
Open to new-grad software engineering roles where data, ML, and reliability matter.
```

Add compact proof-packet rows:

```tsx
Status: Available for new-grad roles
Proof packet: Resume, GitHub, LinkedIn, case studies
Best fit: Software, data, ML systems, full-stack
```

- [ ] **Step 5: Verify visual output**

Run:

```bash
npm run test:e2e:score
npm run test:e2e:artifacts
```

Then run Playwright CLI visual inspection:

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
"$PWCLI" open http://127.0.0.1:3000 --headed
"$PWCLI" snapshot
"$PWCLI" screenshot output/playwright/launch-home-cli.png
```

Expected: quality score remains 10, screenshots render Atlas cleanly, mobile scan is less dense, and no obvious overlap or broken transitions appear.

- [ ] **Step 6: Commit visual polish**

Run:

```bash
git add src/components/atlas/TechnicalOperationsAtlas.tsx tests/playwright/portfolio-quality-score.spec.ts tests/playwright/critique-screenshots.spec.ts
git commit -m "style: polish Atlas launch scan"
```

---

### Task 7: Final Verification, Repo Cleaning, Push, And Pages Release

**Files:**
- Create: `docs/superpowers/reports/2026-06-07-launch-verification.md`
- Modify only if needed: `.github/workflows/deploy.yml`

- [ ] **Step 1: Run final local matrix**

Run:

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

Expected: all pass with no lint warnings.

- [ ] **Step 2: Run Playwright CLI share-readiness pass**

Start a local static server if one is not already running, then run:

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
"$PWCLI" open http://127.0.0.1:3000 --headed
"$PWCLI" snapshot
"$PWCLI" screenshot output/playwright/share-readiness-home.png
```

Expected: snapshot shows reachable nav, project links, resume link, GitHub/LinkedIn links, and visible Atlas content.

- [ ] **Step 3: Write launch verification report**

Create `docs/superpowers/reports/2026-06-07-launch-verification.md` with:

```md
# Portfolio Launch Verification - 2026-06-07

## Local Verification

- typecheck:
- lint:
- format:
- resume:
- production build:
- static SEO:
- proof manifest:
- asset budgets:
- browser smoke:
- reduced motion:
- performance:
- full Playwright:
- score:
- artifacts:
- Playwright CLI screenshot:

## Public Verification

- GitHub Pages status:
- homepage:
- resume:
- sitemap:
- case-study routes:

## Score Outlook

- Public deployment availability:
- QA/accessibility/performance/SEO:
- Maintainability/architecture:
- Asset truth/project credibility:
- Visual design/motion:
- Recruiter narrative/conversion:
```

Fill each line with actual pass/fail evidence.

- [ ] **Step 4: Commit verification report and repo cleaning**

Run:

```bash
git add docs/superpowers/reports/2026-06-07-launch-verification.md .gitignore
git commit -m "docs: record launch verification"
```

- [ ] **Step 5: Push branch**

Run:

```bash
git push origin HEAD
```

Expected: branch push succeeds.

- [ ] **Step 6: Merge through GitHub flow and deploy Pages**

Use the repository's normal PR/merge flow into `main`. After merge, run:

```bash
gh run list --repo yadava5/Portfolio-2.0 --workflow "Deploy to GitHub Pages" --limit 5
```

Expected: latest deploy on `main` completes successfully.

- [ ] **Step 7: Verify public routes**

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

Expected: every route returns `200`.

---

## Final Self-Review

- Spec coverage: all critique lanes map to tasks and target scores above 90.
- Placeholder scan: no `TBD`, unresolved `TODO`, or fill-later instructions are permitted.
- Type consistency: `proofIds`, `ProofManifestEntry`, `absoluteSiteUrl`, and package scripts must match exactly across tasks.
- Commit discipline: each concern has its own commit boundary.
- Launch rule: do not call this ready to share until public homepage, resume, sitemap, and case-study routes return `200`.
