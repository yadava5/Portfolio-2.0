# Asset Truth Proof Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace misleading portfolio project visuals and unsupported claims with real browser screenshots, private-safe proof artifacts, or concrete architecture diagrams.

**Architecture:** Public browser projects get real screenshots promoted from Playwright captures. Private or native projects get either sanitized existing screenshots or generated architecture diagrams backed by repository evidence. Tests become image-kind-aware so the portfolio can mix real screenshots, representative visuals, and diagrams without weakening disclosure quality.

**Tech Stack:** Next.js 16, React 19, TypeScript, Playwright, Sharp, static public assets, existing portfolio data modules.

---

## Required Execution Skills

- `superpowers:executing-plans`: execute this plan in order, task-by-task, because the asset metadata and proof-copy edits touch overlapping source files.
- `superpowers:systematic-debugging`: use immediately if any test, build, screenshot, or browser validation fails.
- `superpowers:verification-before-completion`: use before claiming the branch is ready or before pushing.
- `superpowers:finishing-a-development-branch`: use after all implementation tasks and validation gates pass.
- `playwright`: use for proof screenshot checks, image route validation, disclosure validation, and full browser QA.
- `build-web-apps:frontend-testing-debugging`: use for any rendered UI, responsive layout, disclosure, image, or browser regression found during validation.

## Audit Summary

Browser evidence now exists under ignored artifact storage:

- `output/playwright/asset-truth-audit/paid-internships-data.png`
- `output/playwright/asset-truth-audit/fast-mnist-workbench.png`
- `output/playwright/asset-truth-audit/taskflow-after-mock-login.png`
- `output/playwright/asset-truth-audit/automl-frontend.png`

Immediate asset promotions:

- Paid Internships: promote real `data.html` screenshot. This is public, clean, and stronger than the generated advocacy visual.
- Fast MNIST: promote real web workbench screenshot, but only after correcting the unsupported `5x` AVX-512 inference wording.
- Taskflow: promote real dev/mock-login screenshot only with an honest disclosure that it is local demo data.
- Agentic AutoML: promote existing private-safe screenshot from `/Users/ayush/Documents/Projects/ai-augmented-auto-ml-toolchain/docs/screenshots/experiments.png` instead of the generated visual.

Claims that must be corrected before or with asset promotion:

- Fast MNIST: replace `5x faster inference with AVX-512` with benchmark wording supported by committed data, such as `3.5x dot-kernel speedup`.
- Visual Assist: replace `68 unit tests` with `71 unit tests`; remove broad Core ML object-detection claims until a model artifact is present.
- JobTracker: remove the unsupported public `500+ emails/month` and stale `macOS 15+ Liquid Glass UI with SF Symbols 7` wording.
- Master Inventory: stop tying `1M+ rows` and SQL to the Master Inventory repo; its local outputs show about `16.7k` consolidated inventory records, while the high-volume OAS proof belongs to a separate data workflow.
- PolicyBot: replace `50+ institutional documents` with validation-backed wording, such as `19/20 structured validation sweep`, unless a private-safe corpus manifest is added.
- Paid Internships: replace `peer-reviewed sources` with `research-backed sources`.
- Taskflow: align `projects.ts` dates with the existing case-study date range.

## File Map

- Modify `src/lib/data/projects.ts`: claim corrections, image paths, `imageKind`, alt text, and disclosures.
- Modify `src/lib/data/projectCaseStudies.ts`: validation evidence, artifacts, timelines, and private-safe wording.
- Modify `src/components/atlas/TechnicalOperationsAtlas.tsx`: hero proof metrics and summary copy that currently repeat stale numbers.
- Modify `src/lib/data/personal.ts`: high-level bio sentence if it repeats unsupported `Python/SQL pipelines processing 1M+ rows`.
- Modify `src/lib/data/experience.ts`: keep `1M+` only if it is framed as the broader OAS/Tableau data workflow, not Master Inventory alone.
- Modify `tests/playwright/portfolio-fixtures.ts`: expose image-kind fixtures and update allowed/prohibited content.
- Modify `tests/playwright/nav-and-images.spec.ts`: make disclosure expectations image-kind-aware.
- Create `scripts/asset-truth/render-architecture-diagrams.mjs`: deterministic SVG generation for private/native project diagrams.
- Create `scripts/asset-truth/promote-proof-assets.mjs`: deterministic screenshot resize/crop into `public/images/projects/`.
- Create generated assets:
  - `public/images/projects/jobtracker-architecture.svg`
  - `public/images/projects/visual-assist-architecture.svg`
  - `public/images/projects/pipeline-architecture.svg`
  - `public/images/projects/policybot-architecture.svg`
- Replace existing PNG assets:
  - `public/images/projects/advocacy.png`
  - `public/images/projects/mnist.png`
  - `public/images/projects/taskflow.png`
  - `public/images/projects/automl.png`

---

### Task 1: Add Image-Kind-Aware Disclosure Tests

**Files:**
- Modify: `tests/playwright/portfolio-fixtures.ts`
- Modify: `tests/playwright/nav-and-images.spec.ts`

- [ ] **Step 1: Export public project visual fixture data**

Replace:

```ts
export const PUBLIC_PROJECT_IMAGES = PUBLIC_PROJECTS.map(
  (project) => project.image
);
```

With:

```ts
export const PUBLIC_PROJECT_IMAGES = PUBLIC_PROJECTS.map(
  (project) => project.image
);

export const PUBLIC_PROJECT_VISUALS = PUBLIC_PROJECTS.map((project) => ({
  title: project.title,
  image: project.image,
  imageKind: project.imageKind,
  disclosureLabel:
    project.imageKind === "real-screenshot"
      ? "Project visual:"
      : "Representative visual:",
  disclosure: project.imageDisclosure,
}));

export const FEATURED_PROJECT_VISUALS = FEATURED_PROJECTS.map((project) => ({
  title: project.title,
  image: project.image,
  imageKind: project.imageKind,
  disclosureLabel:
    project.imageKind === "real-screenshot"
      ? "Project visual:"
      : "Representative visual:",
  disclosure: project.imageDisclosure,
}));
```

- [ ] **Step 2: Run the focused test before changing expectations**

Run:

```bash
NEXT_PUBLIC_BASE_PATH= /opt/homebrew/bin/npm exec playwright test tests/playwright/nav-and-images.spec.ts --project=chromium-desktop
```

Expected: PASS on the current representative-only state.

- [ ] **Step 3: Import the featured visual fixture in disclosure tests**

In `tests/playwright/nav-and-images.spec.ts`, add `FEATURED_PROJECT_VISUALS` to the import list:

```ts
  FEATURED_PROJECT_VISUALS,
  PUBLIC_PROJECT_IMAGES,
  PUBLIC_PROJECT_TITLES,
  THEMES,
```

- [ ] **Step 4: Replace the broad representative-only assertion**

Replace:

```ts
      await expect(
        page.getByText(/Representative visual:/).first()
      ).toBeVisible();
```

With:

```ts
      for (const project of FEATURED_PROJECT_VISUALS) {
        const disclosure = page
          .locator("p")
          .filter({ hasText: project.disclosureLabel })
          .filter({ hasText: project.disclosure })
          .first();

        await expect(
          disclosure,
          `${project.title} should disclose ${project.imageKind}`
        ).toBeVisible();
      }
```

- [ ] **Step 5: Verify the new test still passes before asset changes**

Run:

```bash
NEXT_PUBLIC_BASE_PATH= /opt/homebrew/bin/npm exec playwright test tests/playwright/nav-and-images.spec.ts --project=chromium-desktop
```

Expected: PASS. This confirms the test reads current project data instead of hard-coding one disclosure type.

- [ ] **Step 6: Commit the test fixture change**

```bash
git add tests/playwright/portfolio-fixtures.ts tests/playwright/nav-and-images.spec.ts
git commit -m "test: support mixed project visual disclosures"
```

---

### Task 2: Correct Unsupported Project Claims

**Files:**
- Modify: `src/lib/data/projects.ts`
- Modify: `src/lib/data/projectCaseStudies.ts`
- Modify: `src/components/atlas/TechnicalOperationsAtlas.tsx`
- Modify: `src/lib/data/personal.ts`
- Modify: `src/lib/data/experience.ts`
- Modify: `tests/playwright/portfolio-fixtures.ts`

- [ ] **Step 1: Update Fast MNIST project data**

In `src/lib/data/projects.ts`, change the Fast MNIST fields to:

```ts
    shortDescription:
      "C++ neural network for MNIST: 97%+ accuracy, benchmarked SIMD/OpenMP kernels, and an interactive React workbench.",
```

```ts
    imageAlt: "Real Fast MNIST React workbench screenshot",
```

```ts
    imageDisclosure:
      "Real local web workbench screenshot; native inference server was offline during capture, so benchmark claims are sourced from committed benchmark data.",
```

```ts
    metrics: [
      { label: "Accuracy", value: "97%+ on MNIST" },
      { label: "Kernel Speedup", value: "3.5x dot-kernel speedup" },
    ],
```

- [ ] **Step 2: Update Visual Assist project data**

In `src/lib/data/projects.ts`, change Visual Assist to remove broad Core ML claims and align test count:

```ts
    shortDescription:
      "Privacy-first iOS accessibility app using LiDAR, Vision, haptics, and voice guidance.",
    fullDescription:
      "A native iOS accessibility app designed to help visually impaired users navigate their environment safely. Built with ARKit, Vision, haptics, speech, and VoiceOver-first SwiftUI flows for local processing.",
```

Replace the `Core ML` tech tag with:

```ts
      { name: "Core Haptics", color: "#34c759" },
```

Replace the highlights with:

```ts
    highlights: [
      "LiDAR obstacle detection with haptic feedback",
      "Vision OCR with speech synthesis for text reading",
      "On-device Vision workflows for privacy-first processing",
      "VoiceOver-first accessibility with voice commands",
      "71 unit tests for models and utilities",
    ],
```

Set dates to match the case study:

```ts
    startDate: "2025-03",
    endDate: "Present",
```

- [ ] **Step 3: Update JobTracker project data**

In `src/lib/data/projects.ts`, replace the unsupported volume and stale macOS wording:

```ts
    shortDescription:
      "Native macOS app for local job-search email classification with on-device ML and a trackable application pipeline.",
```

```ts
    highlights: [
      "Privacy-first: all ML processing happens locally on-device",
      "3-layer hybrid classifier (rules -> embeddings -> SetFit)",
      "Gmail OAuth2 and iCloud IMAP async integration",
      "Native macOS SwiftUI dashboard",
      "Background sync via SMAppService and launchd",
    ],
```

- [ ] **Step 4: Update Taskflow project dates and disclosure**

In `src/lib/data/projects.ts`, set the project dates to match the existing case study:

```ts
    startDate: "2023-09",
    endDate: "2025-05",
```

When Taskflow receives the screenshot in Task 5, use:

```ts
    imageAlt: "Real Taskflow local demo calendar screenshot",
    imageDisclosure:
      "Real local frontend screenshot captured with the repository mock-login flow and demo user state.",
```

- [ ] **Step 5: Update Master Inventory project data**

In `src/lib/data/projects.ts`, remove SQL and stop tying `1M+` directly to Master Inventory:

```ts
    shortDescription:
      "Python/pandas pipeline consolidating Tableau Cloud metadata and Workday exports into a private-safe master inventory.",
```

```ts
    techStack: [
      { name: "Python", color: "#3776ab" },
      { name: "pandas", color: "#150458" },
      { name: "Tableau", color: "#e97627" },
    ],
```

```ts
    highlights: [
      "Consolidates Tableau and Workday inventory records",
      "Unified schema with deterministic inventory IDs",
      "Tableau REST API integration",
      "Timestamped run artifacts for auditing",
    ],
```

```ts
    metrics: [
      { label: "Inventory", value: "16.7k consolidated records" },
      { label: "Impact", value: "Reduced manual reconciliation effort" },
    ],
```

- [ ] **Step 6: Update PolicyBot project data**

In `src/lib/data/projects.ts`, replace document-count claims with validation-backed wording:

```ts
    shortDescription:
      "RAG-powered policy chatbot on Slack that answers supported queries with cited sources and quote validation.",
```

```ts
    metrics: [
      { label: "Validation", value: "19/20 structured sweep" },
      { label: "Tech", value: "OpenAI RAG + Slack integration" },
    ],
```

- [ ] **Step 7: Update Paid Internships wording**

In `src/lib/data/projects.ts`, replace:

```ts
"Research-backed advocacy site with 3D scroll effects, peer-reviewed sources, and interactive data visualizations."
```

With:

```ts
"Research-backed advocacy site with 3D scroll effects, cited sources, and interactive data visualizations."
```

- [ ] **Step 8: Update Atlas proof metrics**

In `src/components/atlas/TechnicalOperationsAtlas.tsx`, replace `proofMetrics` with:

```ts
const proofMetrics = [
  {
    icon: Database,
    value: "1.9M+",
    label: "Tableau summary rows",
    detail: "Private OAS/Tableau data workflow proof, separate from Master Inventory",
  },
  {
    icon: Workflow,
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
  {
    icon: FileText,
    value: "19/20",
    label: "Policy validation",
    detail: "PolicyBot structured validation sweep",
  },
];
```

Replace:

```tsx
Current work processes 1M+ operational rows into trusted datasets and dashboards.
```

With:

```tsx
Current work turns operational records, Tableau metadata, and ML workflows into trusted datasets, dashboards, and validated product surfaces.
```

Replace the right-column cards for JobTracker, Visual Assist, and PolicyBot with cards that avoid unsupported counts:

```tsx
<div className="rounded border border-zinc-800 bg-zinc-950/80 p-4">
  <p className="font-mono text-xs tracking-[0.22em] text-zinc-500 uppercase">
    JobTracker
  </p>
  <p className="mt-3 text-2xl font-semibold text-emerald-400">
    Local ML
  </p>
  <p className="mt-2 text-xs leading-5 text-zinc-500">
    Three-layer classifier for private job-search email signals.
  </p>
</div>
<div className="rounded border border-zinc-800 bg-zinc-950/80 p-4">
  <p className="font-mono text-xs tracking-[0.22em] text-zinc-500 uppercase">
    Visual Assist
  </p>
  <p className="mt-3 text-2xl font-semibold text-emerald-400">
    71 tests
  </p>
  <p className="mt-2 text-xs leading-5 text-zinc-500">
    Unit coverage for iOS accessibility models and utilities.
  </p>
</div>
<div className="rounded border border-zinc-800 bg-zinc-950/80 p-4">
  <p className="font-mono text-xs tracking-[0.22em] text-zinc-500 uppercase">
    PolicyBot
  </p>
  <p className="mt-3 text-2xl font-semibold text-emerald-400">
    19/20
  </p>
  <p className="mt-2 text-xs leading-5 text-zinc-500">
    Structured validation sweep with cited-source checks.
  </p>
</div>
```

- [ ] **Step 9: Update case-study evidence**

In `src/lib/data/projectCaseStudies.ts`, make these exact evidence edits:

```ts
// JobTracker validation
{
  label: "Classifier design",
  evidence:
    "Public repository architecture uses rules, embeddings, and SetFit as the classifier layers.",
},
{
  label: "Privacy model",
  evidence:
    "The app keeps job-search email classification local instead of sending message content to hosted inference.",
},
```

```ts
// Visual Assist validation
{
  label: "Unit coverage",
  evidence:
    "Local repository audit found 71 VisualAssistTests test functions.",
},
{
  label: "Computer vision",
  evidence:
    "Current code uses ARKit, Vision OCR, human rectangles, and animal recognition paths; no custom Core ML model file was present in the audited repo.",
},
```

```ts
// Master Inventory validation
{
  label: "Inventory outputs",
  evidence:
    "Local processed output audit found 16,685 consolidated master inventory rows, with larger OAS/Tableau row-volume proof tracked separately.",
},
```

```ts
// PolicyBot validation
{
  label: "Validation sweep",
  evidence:
    "Local validation summary reports a 19/20 latest structured sweep, a 17/25 keyword sweep, and fallback behavior for unsupported answers.",
},
```

```ts
// Fast MNIST validation
{
  label: "Speedup",
  evidence:
    "Committed benchmark data supports a 3.50x dot-kernel speedup; classify-throughput rows do not support the previous 5x AVX-512 inference claim.",
},
```

- [ ] **Step 10: Update prohibited and allowed test content**

In `tests/playwright/portfolio-fixtures.ts`, replace stale allowed metrics:

```ts
export const ATLAS_ALLOWED_METRICS = [
  "1.9M+",
  "738",
  "3.5x",
  "71 tests",
  "19/20",
];

export const RECRUITER_HERO_METRICS = ["1.9M+", "738", "71", "19/20"];
```

Add unsupported old strings to `PROHIBITED_GENERATED_CONTENT`:

```ts
  "5x faster inference",
  "5x with AVX-512 SIMD",
  "68 unit tests",
  "68 tests",
  "50+ institutional documents",
  "50+ docs",
  "processing 500+ emails/month",
  "500+ emails/month",
  "macOS 15+ Liquid Glass UI",
  "Python/SQL pipeline processing 1M+",
  "Processes 1M+ rows of operational data",
```

- [ ] **Step 11: Run tests and confirm stale copy is gone**

Run:

```bash
/opt/homebrew/bin/npm run typecheck
/opt/homebrew/bin/npm run lint
NEXT_PUBLIC_BASE_PATH= /opt/homebrew/bin/npm exec playwright test tests/playwright/atlas.spec.ts tests/playwright/nav-and-images.spec.ts --project=chromium-desktop
```

Expected: all commands pass. If `atlas.spec.ts` fails on a remaining exact stale string, remove the stale public copy or add a private-safe proof note before retrying.

- [ ] **Step 12: Commit claim corrections**

```bash
git add src/lib/data/projects.ts src/lib/data/projectCaseStudies.ts src/components/atlas/TechnicalOperationsAtlas.tsx src/lib/data/personal.ts src/lib/data/experience.ts tests/playwright/portfolio-fixtures.ts
git commit -m "fix: align portfolio claims with proof"
```

---

### Task 3: Add Deterministic Asset Promotion Script

**Files:**
- Create: `scripts/asset-truth/promote-proof-assets.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create the asset promotion script**

Create `scripts/asset-truth/promote-proof-assets.mjs` with:

```js
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "public", "images", "projects");

const assets = [
  {
    source: path.join(
      root,
      "output",
      "playwright",
      "asset-truth-audit",
      "paid-internships-data.png"
    ),
    target: path.join(outputDir, "advocacy.png"),
  },
  {
    source: path.join(
      root,
      "output",
      "playwright",
      "asset-truth-audit",
      "fast-mnist-workbench.png"
    ),
    target: path.join(outputDir, "mnist.png"),
  },
  {
    source: path.join(
      root,
      "output",
      "playwright",
      "asset-truth-audit",
      "taskflow-after-mock-login.png"
    ),
    target: path.join(outputDir, "taskflow.png"),
  },
  {
    source:
      "/Users/ayush/Documents/Projects/ai-augmented-auto-ml-toolchain/docs/screenshots/experiments.png",
    target: path.join(outputDir, "automl.png"),
  },
];

await mkdir(outputDir, { recursive: true });

for (const asset of assets) {
  await sharp(asset.source)
    .resize(1376, 768, { fit: "cover", position: "top" })
    .png({ compressionLevel: 9 })
    .toFile(asset.target);
  console.log(`promoted ${asset.target}`);
}
```

- [ ] **Step 2: Add package script**

In `package.json`, add:

```json
"assets:promote-proof": "node scripts/asset-truth/promote-proof-assets.mjs"
```

Place it after `"test:visual"` and keep JSON commas valid:

```json
"test:visual": "playwright test --update-snapshots",
"assets:promote-proof": "node scripts/asset-truth/promote-proof-assets.mjs"
```

- [ ] **Step 3: Run the script**

Run:

```bash
/opt/homebrew/bin/npm run assets:promote-proof
```

Expected output includes four `promoted ...` lines and the four target PNG files remain `1376 x 768`.

- [ ] **Step 4: Verify promoted dimensions**

Run:

```bash
file public/images/projects/advocacy.png public/images/projects/mnist.png public/images/projects/taskflow.png public/images/projects/automl.png
```

Expected: each file reports `PNG image data, 1376 x 768`.

- [ ] **Step 5: Commit the promotion script and PNG replacements**

```bash
git add package.json scripts/asset-truth/promote-proof-assets.mjs public/images/projects/advocacy.png public/images/projects/mnist.png public/images/projects/taskflow.png public/images/projects/automl.png
git commit -m "feat: promote real project screenshots"
```

---

### Task 4: Mark Promoted Screenshots as Real Project Visuals

**Files:**
- Modify: `src/lib/data/projects.ts`
- Modify: `src/lib/data/projectCaseStudies.ts`

- [ ] **Step 1: Mark Paid Internships as a real screenshot**

In `src/lib/data/projects.ts`, update the Paid Internships visual fields:

```ts
    imageKind: "real-screenshot",
    imageAlt:
      "Real Paid Internships Advocacy data visualization page screenshot",
    imageDisclosure:
      "Real screenshot from the public advocacy site data page with cited research charts.",
```

In `src/lib/data/projectCaseStudies.ts`, change the matching artifact to:

```ts
{
  type: "real-screenshot",
  label: "Public data page screenshot",
  href: withBasePath("/images/projects/advocacy.png"),
},
```

- [ ] **Step 2: Mark Fast MNIST as a real screenshot**

In `src/lib/data/projects.ts`, update Fast MNIST visual fields:

```ts
    imageKind: "real-screenshot",
    imageAlt: "Real Fast MNIST React workbench screenshot",
    imageDisclosure:
      "Real local web workbench screenshot; native inference server was offline during capture, so benchmark claims are sourced from committed benchmark data.",
```

In `src/lib/data/projectCaseStudies.ts`, change the matching artifact to:

```ts
{
  type: "real-screenshot",
  label: "Local React workbench screenshot",
  href: withBasePath("/images/projects/mnist.png"),
},
```

- [ ] **Step 3: Mark Taskflow as a real screenshot**

In `src/lib/data/projects.ts`, update Taskflow visual fields:

```ts
    imageKind: "real-screenshot",
    imageAlt: "Real Taskflow local demo calendar screenshot",
    imageDisclosure:
      "Real local frontend screenshot captured with the repository mock-login flow and demo user state.",
```

In `src/lib/data/projectCaseStudies.ts`, change the matching artifact to:

```ts
{
  type: "real-screenshot",
  label: "Local mock-login calendar screenshot",
  href: withBasePath("/images/projects/taskflow.png"),
},
```

- [ ] **Step 4: Mark AutoML as a private-safe real screenshot**

In `src/lib/data/projects.ts`, update AutoML visual fields:

```ts
    imageKind: "real-screenshot",
    imageAlt:
      "Private-safe Agentic AutoML experiment registry screenshot with demo data",
    imageDisclosure:
      "Private-safe screenshot from the local AutoML repository demo data; source repository remains private.",
```

In `src/lib/data/projectCaseStudies.ts`, change the matching artifact to:

```ts
{
  type: "real-screenshot",
  label: "Private-safe experiment registry screenshot",
  href: withBasePath("/images/projects/automl.png"),
},
```

- [ ] **Step 5: Run image and disclosure tests**

Run:

```bash
NEXT_PUBLIC_BASE_PATH= /opt/homebrew/bin/npm exec playwright test tests/playwright/nav-and-images.spec.ts --project=chromium-desktop
```

Expected: image files return 200 and each disclosure matches its image kind.

- [ ] **Step 6: Commit metadata changes**

```bash
git add src/lib/data/projects.ts src/lib/data/projectCaseStudies.ts
git commit -m "feat: label promoted proof screenshots"
```

---

### Task 5: Generate Architecture Diagrams for Native and Private Projects

**Files:**
- Create: `scripts/asset-truth/render-architecture-diagrams.mjs`
- Create: `public/images/projects/jobtracker-architecture.svg`
- Create: `public/images/projects/visual-assist-architecture.svg`
- Create: `public/images/projects/pipeline-architecture.svg`
- Create: `public/images/projects/policybot-architecture.svg`
- Modify: `package.json`
- Modify: `src/lib/data/projects.ts`
- Modify: `src/lib/data/projectCaseStudies.ts`

- [ ] **Step 1: Create the diagram renderer**

Create `scripts/asset-truth/render-architecture-diagrams.mjs` with:

```js
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "public", "images", "projects");

const diagrams = [
  {
    file: "jobtracker-architecture.svg",
    title: "JobTracker Local Classification",
    subtitle: "Gmail + iCloud mail -> local classifier -> SQLite pipeline -> SwiftUI dashboard",
    accent: "#10b981",
    nodes: [
      ["Gmail OAuth2", "iCloud IMAP", "Async sync"],
      ["Rules", "Embeddings", "SetFit"],
      ["SQLite", "Application events", "Audit state"],
      ["SwiftUI", "Pipeline board", "Local dashboard"],
    ],
  },
  {
    file: "visual-assist-architecture.svg",
    title: "Visual Assist On-Device Flow",
    subtitle: "LiDAR, ARKit, and Vision signals become speech, haptics, and VoiceOver-first guidance",
    accent: "#60a5fa",
    nodes: [
      ["LiDAR", "ARKit", "Depth signals"],
      ["Vision OCR", "Human rectangles", "Animal recognition"],
      ["Speech", "Haptics", "Voice commands"],
      ["SwiftUI", "VoiceOver", "Accessible modes"],
    ],
  },
  {
    file: "pipeline-architecture.svg",
    title: "Master Inventory Pipeline",
    subtitle: "Tableau metadata and Workday exports become deterministic inventory records and audit artifacts",
    accent: "#f59e0b",
    nodes: [
      ["Tableau REST", "Workday export", "Source snapshots"],
      ["Python", "pandas", "Normalization"],
      ["Deterministic IDs", "Master inventory", "Validation checks"],
      ["Tableau Prep", "Dashboards", "Run artifacts"],
    ],
  },
  {
    file: "policybot-architecture.svg",
    title: "PolicyBot Retrieval Flow",
    subtitle: "Policy documents are indexed, retrieved, quote-validated, and delivered through Slack",
    accent: "#a78bfa",
    nodes: [
      ["DOCX", "PDF", "Markdown"],
      ["OpenAI File Search", "Retrieval", "Candidate citations"],
      ["Local quote validation", "Fallback checks", "Grounding"],
      ["Slack Socket Mode", "Cited answer", "User workflow"],
    ],
  },
];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderDiagram(diagram) {
  const columns = diagram.nodes
    .map((items, index) => {
      const x = 72 + index * 315;
      const chips = items
        .map((item, itemIndex) => {
          const y = 305 + itemIndex * 74;
          return `
            <rect x="${x + 24}" y="${y}" width="210" height="44" rx="10" fill="#111827" stroke="${diagram.accent}" stroke-opacity="0.42"/>
            <text x="${x + 129}" y="${y + 28}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="18" fill="#e5e7eb">${escapeXml(item)}</text>
          `;
        })
        .join("");

      const connector =
        index < diagram.nodes.length - 1
          ? `<path d="M ${x + 260} 406 C ${x + 300} 406, ${x + 302} 406, ${x + 315} 406" stroke="${diagram.accent}" stroke-width="4" stroke-linecap="round" fill="none"/>
             <path d="M ${x + 315} 406 l -14 -8 l 0 16 z" fill="${diagram.accent}"/>`
          : "";

      return `
        <g>
          <rect x="${x}" y="246" width="260" height="308" rx="18" fill="#030712" stroke="#334155"/>
          <text x="${x + 130}" y="282" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="16" fill="${diagram.accent}" font-weight="700">STEP ${index + 1}</text>
          ${chips}
          ${connector}
        </g>
      `;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1376" height="768" viewBox="0 0 1376 768" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(diagram.title)}</title>
  <desc id="desc">${escapeXml(diagram.subtitle)}</desc>
  <rect width="1376" height="768" fill="#020617"/>
  <rect x="32" y="32" width="1312" height="704" rx="28" fill="#07111f" stroke="#1f2937"/>
  <circle cx="1170" cy="134" r="132" fill="${diagram.accent}" opacity="0.12"/>
  <circle cx="196" cy="646" r="164" fill="${diagram.accent}" opacity="0.08"/>
  <text x="72" y="118" font-family="Inter, Arial, sans-serif" font-size="46" font-weight="800" fill="#f8fafc">${escapeXml(diagram.title)}</text>
  <text x="72" y="166" font-family="Inter, Arial, sans-serif" font-size="22" fill="#94a3b8">${escapeXml(diagram.subtitle)}</text>
  <line x1="72" y1="206" x2="1304" y2="206" stroke="#1f2937"/>
  ${columns}
  <text x="72" y="672" font-family="Inter, Arial, sans-serif" font-size="18" fill="#94a3b8">Portfolio proof asset: architecture diagram generated from audited repository evidence, not a product screenshot.</text>
</svg>`;
}

await mkdir(outputDir, { recursive: true });

for (const diagram of diagrams) {
  const target = path.join(outputDir, diagram.file);
  await writeFile(target, renderDiagram(diagram), "utf8");
  console.log(`rendered ${target}`);
}
```

- [ ] **Step 2: Add package script**

In `package.json`, add:

```json
"assets:render-diagrams": "node scripts/asset-truth/render-architecture-diagrams.mjs"
```

Place it after the proof promotion script:

```json
"assets:promote-proof": "node scripts/asset-truth/promote-proof-assets.mjs",
"assets:render-diagrams": "node scripts/asset-truth/render-architecture-diagrams.mjs"
```

- [ ] **Step 3: Render diagrams**

Run:

```bash
/opt/homebrew/bin/npm run assets:render-diagrams
```

Expected output includes four `rendered ...` lines.

- [ ] **Step 4: Verify diagram files are valid SVG files**

Run:

```bash
file public/images/projects/jobtracker-architecture.svg public/images/projects/visual-assist-architecture.svg public/images/projects/pipeline-architecture.svg public/images/projects/policybot-architecture.svg
```

Expected: each file reports `SVG Scalable Vector Graphics image`.

- [ ] **Step 5: Point private/native projects at diagrams**

In `src/lib/data/projects.ts`, use these visual fields:

```ts
// JobTracker
image: withBasePath("/images/projects/jobtracker-architecture.svg"),
imageKind: "diagram",
imageAlt: "JobTracker local email classification architecture diagram",
imageDisclosure:
  "Architecture diagram generated from public repository structure; private email content is not shown.",
```

```ts
// Visual Assist
image: withBasePath("/images/projects/visual-assist-architecture.svg"),
imageKind: "diagram",
imageAlt: "Visual Assist on-device accessibility architecture diagram",
imageDisclosure:
  "Architecture diagram generated from public repository structure; live camera and location context are not shown.",
```

```ts
// Master Inventory
image: withBasePath("/images/projects/pipeline-architecture.svg"),
imageKind: "diagram",
imageAlt: "Master Inventory Tableau and Workday pipeline architecture diagram",
imageDisclosure:
  "Private-safe architecture diagram; institutional records, raw exports, and internal UI are not shown.",
```

```ts
// PolicyBot
image: withBasePath("/images/projects/policybot-architecture.svg"),
imageKind: "diagram",
imageAlt: "PolicyBot retrieval and quote-validation architecture diagram",
imageDisclosure:
  "Private-safe architecture diagram; real institutional policy text and Slack messages are not shown.",
```

- [ ] **Step 6: Update case-study artifacts for diagram-backed projects**

In `src/lib/data/projectCaseStudies.ts`, point artifacts to the same SVG paths and set `type: "diagram"` with labels:

```ts
{
  type: "diagram",
  label: "Local classification architecture",
  href: withBasePath("/images/projects/jobtracker-architecture.svg"),
},
```

```ts
{
  type: "diagram",
  label: "On-device accessibility architecture",
  href: withBasePath("/images/projects/visual-assist-architecture.svg"),
},
```

```ts
{
  type: "diagram",
  label: "Private-safe pipeline architecture",
  href: withBasePath("/images/projects/pipeline-architecture.svg"),
},
```

```ts
{
  type: "diagram",
  label: "Retrieval and validation architecture",
  href: withBasePath("/images/projects/policybot-architecture.svg"),
},
```

- [ ] **Step 7: Validate SVG rendering through Next image routes**

Run:

```bash
NEXT_PUBLIC_BASE_PATH= /opt/homebrew/bin/npm exec playwright test tests/playwright/nav-and-images.spec.ts --project=chromium-desktop
```

Expected: all project image URLs return 200, and diagram disclosures remain visible.

- [ ] **Step 8: Commit diagrams and metadata**

```bash
git add package.json scripts/asset-truth/render-architecture-diagrams.mjs public/images/projects/jobtracker-architecture.svg public/images/projects/visual-assist-architecture.svg public/images/projects/pipeline-architecture.svg public/images/projects/policybot-architecture.svg src/lib/data/projects.ts src/lib/data/projectCaseStudies.ts
git commit -m "feat: add private-safe project architecture diagrams"
```

---

### Task 6: Browser-Verify the Recruiter Surface

**Files:**
- Test: `tests/playwright/atlas.spec.ts`
- Test: `tests/playwright/nav-and-images.spec.ts`
- Test: `tests/playwright/comprehensive-qa.spec.ts`
- Generated artifacts: `output/playwright/`

- [ ] **Step 1: Run static gates**

```bash
/opt/homebrew/bin/npm run typecheck
/opt/homebrew/bin/npm run lint
/opt/homebrew/bin/npm run format:check
```

Expected: all pass with no warnings requiring edits.

- [ ] **Step 2: Build the portfolio**

```bash
NEXT_PUBLIC_BASE_PATH= node node_modules/next/dist/bin/next build --webpack
```

Expected: production build completes successfully.

- [ ] **Step 3: Run focused Playwright checks**

```bash
NEXT_PUBLIC_BASE_PATH= /opt/homebrew/bin/npm exec playwright test tests/playwright/atlas.spec.ts tests/playwright/nav-and-images.spec.ts --project=chromium-desktop
```

Expected: proof metrics, prohibited stale copy, image routes, and visual disclosure tests pass.

- [ ] **Step 4: Run full recruiter quality Playwright suite**

```bash
/opt/homebrew/bin/npm run test:e2e
```

Expected: all configured Playwright projects pass.

- [ ] **Step 5: Generate visual audit artifacts**

```bash
/opt/homebrew/bin/npm run test:e2e:artifacts
```

Expected: screenshots and walkthrough artifacts are written under `output/playwright/`; no source files under `tests/playwright/screenshots/` are modified.

- [ ] **Step 6: Inspect screenshots manually**

Open these generated screenshots or equivalent current artifact names:

```bash
open output/playwright
```

Check:

- Paid Internships image is obviously a real chart page, not a generated illustration.
- Fast MNIST image is readable and its disclosure explains the offline native server state.
- Taskflow image shows the mock/demo state without suggesting production user data.
- AutoML image shows demo/product state without exposing private source or secrets.
- Architecture diagrams are readable at desktop card size and mobile card size.

- [ ] **Step 7: Commit validation-only test updates if any were needed**

If browser verification required a test-only adjustment, commit that adjustment separately:

```bash
git add tests/playwright/portfolio-fixtures.ts tests/playwright/nav-and-images.spec.ts
git commit -m "test: cover proof asset disclosure regressions"
```

If no test-only adjustment was needed, skip this commit.

---

### Task 7: Final Integration and Handoff

**Files:**
- Inspect: git diff and screenshots
- Optional: PR description or branch notes

- [ ] **Step 1: Review the final diff**

Run:

```bash
git diff --stat HEAD~4..HEAD
git diff HEAD~4..HEAD -- src/lib/data/projects.ts src/lib/data/projectCaseStudies.ts src/components/atlas/TechnicalOperationsAtlas.tsx tests/playwright/portfolio-fixtures.ts tests/playwright/nav-and-images.spec.ts
```

Expected: commits are separated into tests, claim corrections, real screenshots, and diagrams.

- [ ] **Step 2: Confirm no ignored audit artifacts are staged**

Run:

```bash
git status --short
```

Expected: only intentional source files and promoted public assets are staged or committed; `output/playwright/asset-truth-audit/` remains ignored.

- [ ] **Step 3: Push the branch**

Run:

```bash
git push origin yadava5/project-sanity-refresh
```

Expected: push succeeds.

- [ ] **Step 4: Update the pull request summary**

Use this summary:

```markdown
## Asset truth pass

- Replaced generated/representative visuals with real screenshots where the source projects can be safely shown.
- Added concrete architecture diagrams for native/private projects where screenshots would expose private data.
- Corrected unsupported public claims around Fast MNIST speedups, Visual Assist tests/Core ML wording, JobTracker volume/macOS wording, Master Inventory row/SQL attribution, PolicyBot document counts, and Paid Internships source wording.
- Made browser disclosure tests image-kind-aware so real screenshots and diagrams stay honestly labeled.

## Validation

- /opt/homebrew/bin/npm run typecheck
- /opt/homebrew/bin/npm run lint
- /opt/homebrew/bin/npm run format:check
- NEXT_PUBLIC_BASE_PATH= node node_modules/next/dist/bin/next build --webpack
- NEXT_PUBLIC_BASE_PATH= /opt/homebrew/bin/npm exec playwright test tests/playwright/atlas.spec.ts tests/playwright/nav-and-images.spec.ts --project=chromium-desktop
- /opt/homebrew/bin/npm run test:e2e
- /opt/homebrew/bin/npm run test:e2e:artifacts
```

- [ ] **Step 5: Preserve the final evidence note**

Write a Basic Memory note under `portfolio-2.0/handoff/` with:

```markdown
# Asset Truth Proof Assets Handoff

- Branch: `yadava5/project-sanity-refresh`
- Proof assets promoted: Paid Internships, Fast MNIST, Taskflow, Agentic AutoML
- Diagram assets generated: JobTracker, Visual Assist, Master Inventory, PolicyBot
- Main claim corrections: Fast MNIST speedup, Visual Assist test/Core ML wording, JobTracker volume/macOS wording, Master Inventory row/SQL attribution, PolicyBot source-count wording, Paid Internships source wording
- Validation commands: typecheck, lint, format:check, Next build, focused Playwright, full Playwright, artifact Playwright
```

Expected: the next session can resume from the note without rerunning the full source-project audit.

---

## Residual Risks

- JobTracker native screenshots were not promoted because Xcode validation is blocked locally and email data must be sanitized.
- Visual Assist real simulator screenshots were not promoted because local Xcode failed before simulator validation; the diagram is safer until the toolchain works.
- AutoML full workflow screenshots require Docker/runtime startup; the existing `docs/screenshots/experiments.png` is the safest current private-proof asset.
- Taskflow screenshot uses mock login and frontend-only state; the disclosure must keep that clear.
- Fast MNIST screenshot shows a web workbench capture while the native inference server is offline; the disclosure must keep benchmark proof separate from the screenshot.

## Self-Review

- Spec coverage: every audited project has either a promoted real screenshot path, a private-safe diagram path, or an explicit reason a screenshot is not used.
- Placeholder scan: no incomplete sections remain.
- Type consistency: `imageKind` values use the existing `"real-screenshot" | "representative-visual" | "diagram"` union.
- Test coverage: focused Playwright coverage checks image existence, disclosure wording, and stale content regression; full suite remains the final release gate.
