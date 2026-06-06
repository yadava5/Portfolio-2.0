# Balanced Master Resume Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the public master resume into a balanced, ATS-friendly, full-page one-page PDF backed by the strongest portfolio evidence.

**Architecture:** Keep `scripts/resume/render-resume.mjs` as the single resume source and add a small parser regression script so resume quality is checked mechanically after every regeneration. Use real text bullets and single-column HTML so `public/resume.pdf` remains readable to recruiters and parseable by ATS tools.

**Tech Stack:** Node.js ESM, Playwright Chromium PDF rendering, Poppler CLI tools (`pdfinfo`, `pdftotext`, `pdffonts`, `pdftoppm`), existing Next.js portfolio scripts.

---

### Task 1: Add Resume Parser Regression Check

**Files:**
- Create: `scripts/resume/check-resume.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create the parser check script**

Create `scripts/resume/check-resume.mjs` with this structure:

```js
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const pdfPath = resolve(process.cwd(), "public/resume.pdf");
const layoutTextPath = "/tmp/portfolio-resume-layout.txt";
const rawTextPath = "/tmp/portfolio-resume-raw.txt";

function run(command, args) {
  return execFileSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const info = run("pdfinfo", [pdfPath]);
assert(/\bPages:\s+1\b/.test(info), "resume.pdf must remain exactly one page");

const fonts = run("pdffonts", [pdfPath]);
assert(/Times|Liberation|Arial|Helvetica|Nimbus|DejaVu/i.test(fonts), "resume.pdf should expose embedded text fonts");

const layoutText = run("pdftotext", ["-layout", pdfPath, "-"]);
const rawText = run("pdftotext", ["-raw", pdfPath, "-"]);

writeFileSync(layoutTextPath, layoutText);
writeFileSync(rawTextPath, rawText);

const requiredPhrases = [
  "Ayush Yadav",
  "Computer Science graduate",
  "May 2026",
  "Technical Skills",
  "Projects",
  "Experience",
  "ITSM Data Integration Student Associate",
  "Jun 2025 - May 2026",
  "Agentic AutoML",
  "OpenAI Responses API",
  "LangGraph",
  "MCP",
  "Visual Assist",
  "Fast MNIST",
  "97%+",
];

const forbiddenPhrases = [
  "Expected May 2026",
  "Jun 2025 - Present",
  "Senior CS student",
  "AI expert",
  "AI-native",
  "Codex",
  "Claude",
  "ATS optimized",
  "AI optimized",
];

const gluedPatterns = [
  /GPA3\.46/,
  /anAutoML/,
  /VisualAssist/,
  /StudentAssociate/,
  /externalAPIs/,
  /JavaScript\/TypeScriptReact/,
];

for (const phrase of requiredPhrases) {
  assert(layoutText.includes(phrase), `Missing required resume phrase: ${phrase}`);
}

for (const phrase of forbiddenPhrases) {
  assert(!layoutText.includes(phrase), `Forbidden resume phrase present: ${phrase}`);
}

for (const pattern of gluedPatterns) {
  assert(!pattern.test(rawText), `Raw resume extraction contains glued text: ${pattern}`);
}

assert(rawText.includes("- "), "Raw resume extraction should include real text bullets");

console.log(`Resume parser check passed: ${pdfPath}`);
console.log(`Layout text: ${layoutTextPath}`);
console.log(`Raw text: ${rawTextPath}`);
```

- [ ] **Step 2: Add the npm script**

Add `resume:check` after `resume:build` in `package.json`:

```json
"resume:build": "node scripts/resume/render-resume.mjs",
"resume:check": "node scripts/resume/check-resume.mjs",
```

- [ ] **Step 3: Run the check against the current PDF and verify it fails**

Run:

```bash
npm run resume:check
```

Expected: FAIL before the resume rewrite because the current PDF lacks the new required phrases and raw extraction still has glued-token risks.

- [ ] **Step 4: Commit the failing parser check**

Run:

```bash
git add package.json scripts/resume/check-resume.mjs
git commit -m "test: add resume parser checks"
```

Expected: A focused test commit before changing resume content.

### Task 2: Refine Resume Content And ATS HTML

**Files:**
- Modify: `scripts/resume/render-resume.mjs`

- [ ] **Step 1: Replace conservative content with balanced proof-backed content**

Use these content choices:

```js
const sections = [
  {
    title: "Summary",
    body: [
      "Computer Science graduate from Miami University (B.S., May 2026; 3.47 overall GPA, 3.65 CS coursework GPA) with experience building Python and SQL data pipelines, full-stack products, applied ML workflows, and reliability-focused tooling. Recent ITSM internship work covered 1M+ operational records, Tableau/OAS reporting, Workday data integration, and API-driven automation. Seeking new-grad software engineering, data engineering, full-stack, or ML-adjacent software roles.",
    ],
  },
  {
    title: "Technical Skills",
    items: [
      "<strong>Languages:</strong> Python, Java, C++, JavaScript, TypeScript, SQL",
      "<strong>Web and Systems:</strong> React, Next.js, Node.js, Express, NestJS, PostgreSQL, Prisma, Docker, SwiftUI, ARKit, Vision, OpenMP",
      "<strong>Data and ML:</strong> ETL, pandas, Tableau, Snowflake, RAG, OpenAI Responses API, File Search, LangGraph, MCP, SetFit, sentence-transformers",
      "<strong>Tooling and Quality:</strong> Git, GitHub Actions, Playwright, axe-core, CI/CD, Linux/Unix CLI, Xcode, VS Code",
    ],
  },
];
```

Keep the existing education records and leadership section, but make project and experience bullets stronger.

- [ ] **Step 2: Replace the project list**

Use this project set:

```js
{
  title: "Projects",
  groups: [
    {
      heading: "Agentic AutoML Platform - Senior Capstone (May 2026)",
      items: [
        "Engineered React and Express/PostgreSQL workflow surfaces for dataset upload, EDA, preprocessing, training, experiment tracking, and deployment phases.",
        "Used LangGraph and MCP orchestration with human approval gates, Dockerized execution, and Playwright/eval-runner validation.",
      ],
    },
    {
      heading: "JobTracker - Local-First macOS Job Search Tracker (2026)",
      items: [
        "Built Gmail OAuth2/iCloud IMAP ingestion, SQLite workflow state, and SwiftUI dashboard architecture for private local tracking.",
        "Designed rules, embeddings, and SetFit classifier gates; validation records 182 backend tests and 0.9791 macro-F1 on 96 samples.",
      ],
    },
    {
      heading: "Visual Assist - iOS LiDAR Accessibility App (2025-2026)",
      items: [
        "Built SwiftUI/ARKit LiDAR obstacle detection, Vision OCR, speech guidance, haptics, and VoiceOver-first flows for on-device use.",
        "Covered model and utility logic with 71 audited XCTest functions while keeping camera and location context local.",
      ],
    },
    {
      heading: "Fast MNIST Neural Network - C++ HPC Project (2025-2026)",
      items: [
        "Collaborated on C++17 MNIST train/eval CLI with SIMD/OpenMP kernels, cached dataset loading, and benchmark instrumentation.",
        "Recorded 97%+ MNIST accuracy and 3.5x dot-kernel speedup in committed benchmark evidence.",
      ],
    },
  ],
}
```

- [ ] **Step 3: Strengthen the ITSM experience bullets**

Use these bullets:

```js
items: [
  "Built Python and SQL ETL workflows for 1M+ OAS/Tableau/Workday records; normalized operational data for KPI reporting.",
  "Consolidated Tableau metadata and Workday exports into a 10,453-row deduplicated inventory with deterministic IDs and a 35-field schema.",
  "Delivered Tableau dashboards and private internal automation, including API-integrated Slack/OpenAI RAG support with cited-source checks.",
],
```

Keep the Aramark entry to one concise operations bullet if the page still fits.

- [ ] **Step 4: Replace pseudo bullets with real text bullets**

Change list rendering from `<ul><li>` plus `li::before` to explicit paragraph bullets:

```js
function renderList(items = []) {
  if (items.length === 0) return "";

  return `<div class="bullets">${items
    .map((item) => `<p class="bullet">- ${item}</p>`)
    .join("")}</div>`;
}
```

Remove CSS that relies on `ul`, `li`, and `li::before`. Add:

```css
.bullets {
  margin: 0 0 0 16px;
}

.bullet {
  margin: 0;
  padding-left: 0;
}
```

- [ ] **Step 5: Tune layout for full-page density**

Start with these CSS values:

```css
@page {
  size: Letter;
  margin: 0.32in 0.46in 0.32in 0.46in;
}

body {
  margin: 0;
  color: #111;
  font-family: "Times New Roman", Times, serif;
  font-size: 9.7pt;
  line-height: 1.13;
}

header {
  text-align: center;
  margin-bottom: 7px;
}

h1 {
  margin: 0 0 2px;
  font-size: 16.2pt;
  line-height: 1;
}

.contact {
  font-size: 9.55pt;
  font-weight: 700;
}

section {
  margin-top: 4.4px;
}

h2 {
  margin: 0 0 1px;
  color: #2f5f99;
  font-size: 13.2pt;
  line-height: 1;
}

.group {
  margin-top: 1.8px;
}
```

Adjust only after rendering if the page is too sparse or overflows. The target is one page with no major blank bottom gap.

- [ ] **Step 6: Run the resume build and parser check**

Run:

```bash
npm run resume:build
npm run resume:check
```

Expected: both pass after the content and bullet-rendering update.

- [ ] **Step 7: Commit the generator and parser script changes**

Run:

```bash
git add package.json scripts/resume/render-resume.mjs scripts/resume/check-resume.mjs
git commit -m "feat: refine balanced master resume"
```

Expected: A focused code/content commit. Do not include `public/resume.pdf` in this commit.

### Task 3: Regenerate And Visually Verify The PDF

**Files:**
- Modify: `public/resume.pdf`
- Output only: `output/resume-audit/refined-resume.png`

- [ ] **Step 1: Regenerate the PDF**

Run:

```bash
npm run resume:build
npm run resume:check
```

Expected: `public/resume.pdf` is regenerated and parser checks pass.

- [ ] **Step 2: Render the PDF for visual review**

Run:

```bash
mkdir -p output/resume-audit
pdftoppm -png -singlefile -r 144 public/resume.pdf output/resume-audit/refined-resume
file output/resume-audit/refined-resume.png
```

Expected: `output/resume-audit/refined-resume.png` exists as a one-page PNG image.

- [ ] **Step 3: Inspect the rendered PNG**

Use the image viewer on:

```text
/Users/ayush/Documents/Projects/Portfolio-2.0/output/resume-audit/refined-resume.png
```

Expected: the resume remains readable, one page, no clipped text, no awkward overflow, and page density fills the sheet better than the previous sparse version.

- [ ] **Step 4: Run format and repository checks**

Run:

```bash
npx prettier --check package.json scripts/resume/render-resume.mjs scripts/resume/check-resume.mjs
npm run typecheck
npm run lint
npm run format:check
```

Expected: all pass.

- [ ] **Step 5: Commit the regenerated PDF**

Run:

```bash
git add public/resume.pdf
git commit -m "chore: regenerate balanced master resume"
```

Expected: The PDF regeneration lands separately from the code/content change.

### Task 4: Browser Resume Sanity Check And Final Evidence

**Files:**
- No source files expected.
- Output only: optional Playwright or curl evidence.

- [ ] **Step 1: Start the local server**

Run:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3017
```

Expected: the server prints a local URL for `http://127.0.0.1:3017`.

- [ ] **Step 2: Check the served resume route**

Run in another shell:

```bash
curl -fsSI http://127.0.0.1:3017/resume.pdf
```

Expected: HTTP 200 and `content-type: application/pdf`.

- [ ] **Step 3: Stop the local server**

Stop the running dev-server session.

Expected: port `3017` closes.

- [ ] **Step 4: Final git state**

Run:

```bash
git status --short --branch
git log --oneline -5
```

Expected: branch is ahead by the focused resume commits, with no unintended working-tree changes except ignored `output/` evidence.
