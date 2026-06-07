# Balanced Master Resume Refinement Design

## Status

Approved direction: keep the resume as a balanced master resume for new-grad software, data, full-stack, and ML-adjacent roles. Do not force the base resume hard toward one job family. Role-specific versions can be tailored later per application.

This spec covers the main public resume at `public/resume.pdf` and its generator at `scripts/resume/render-resume.mjs`.

## Goal

Refine Ayush's main resume so it is stronger for recruiters and ATS parsers while still fitting cleanly on one full page. The resume should read like a credible new-grad engineering resume, not like an AI-branded keyword sheet.

## Source-Truth Inputs

- Current resume generator: `scripts/resume/render-resume.mjs`
- Current generated PDF: `public/resume.pdf`
- Portfolio source data:
  - `src/lib/data/projects.ts`
  - `src/lib/data/projectCaseStudies.ts`
  - `src/lib/data/experience.ts`
  - `src/lib/data/skills.ts`
  - `src/lib/data/personal.ts`
- Existing proof docs under `docs/superpowers/evidence/`
- Current branch: `yadava5/fast-mnist-proof-polish`

## Resume Positioning

The master resume should position Ayush as:

> New-grad software engineer with strong proof across data pipelines, full-stack systems, applied ML workflows, and reliability-focused tooling.

The summary should stay broad enough to support:

- Software Engineer
- Data Engineer
- Full-Stack Engineer
- ML-adjacent Software Engineer
- Platform or automation-oriented new-grad roles

It should not sound like a narrowly specialized AI/ML resume, a pure data analyst resume, or a frontend-only resume.

## Language Policy

Use direct engineering language. Avoid gimmicky labels and vague AI branding.

Allowed when backed by projects:

- RAG
- OpenAI Responses API
- File Search
- LangGraph
- MCP
- Playwright evaluation
- Dockerized runs
- local classification
- SetFit
- sentence-transformers

Avoid on the master resume:

- "AI expert"
- "autonomous agent engineer"
- "AI-native developer"
- "Codex" or "Claude" as standalone skills
- hidden keyword stuffing
- visible "AI optimized" or "ATS optimized" labels
- claims that imply production deployment or active Slack usage where the portfolio only proves private-safe validation

If AI-adjacent tools appear, they should appear as concrete project technologies, not as a branding theme.

## Content Architecture

Keep a one-page structure with standard headings:

1. Header
2. Summary
3. Education
4. Technical Skills
5. Projects
6. Experience
7. Leadership and Activities

The order can stay the same because Ayush is a new graduate and the project portfolio is a major hiring signal. Experience should remain strong enough to show real-world data integration work.

## Technical Skills

Replace the current conservative skills section with parser-friendly grouped lines that reflect the portfolio without stuffing.

Recommended groups:

- Languages: Python, Java, C++, JavaScript, TypeScript, SQL
- Web and Systems: React, Next.js, Node.js, Express, NestJS, PostgreSQL, Prisma, Docker, SwiftUI, ARKit, Vision, OpenMP
- Data and ML: ETL, pandas, Tableau, Snowflake, RAG, OpenAI Responses API, File Search, LangGraph, MCP, SetFit, sentence-transformers
- Tooling and Quality: Git, GitHub Actions, Playwright, axe-core, CI/CD, Linux/Unix CLI, Xcode, VS Code

If space is tight, collapse these to three lines while preserving the strongest tokens: Python, TypeScript, SQL, React, PostgreSQL, Docker, Tableau, ETL, RAG, OpenAI, LangGraph, MCP, Playwright, SwiftUI, ARKit, OpenMP.

## Project Selection

Use stronger proof-backed projects from the portfolio and remove or demote weaker projects if space requires.

Primary project set:

1. Agentic AutoML Platform
   - Balanced signal: full-stack, data/ML workflow, orchestration, Docker, validation.
   - Use "contributed to" or "engineered" carefully if individual ownership is not fully shown.
   - Include React, Express/PostgreSQL, LangGraph, MCP, Docker, human approval gates, Playwright/eval-runner validation.

2. JobTracker or PolicyBot
   - Use one of these if the resume needs stronger modern AI systems proof.
   - JobTracker signal: local-first macOS app, Gmail/iCloud ingestion, rules/embeddings/SetFit classifier, local privacy model, macro-F1 evidence.
   - PolicyBot signal: Python RAG assistant, OpenAI Responses API/File Search, cited-source checks, local quote validation, Slack Socket Mode.
   - Choose the one that creates the best balance after fitting the page.

3. Visual Assist
   - Signal: iOS, accessibility, ARKit/LiDAR, Vision OCR, haptics, VoiceOver-first design.
   - Keep claims conservative and do not imply App Store release.

4. Fast MNIST Neural Network
   - Signal: C++, performance, ML fundamentals, SIMD/OpenMP, benchmarks.
   - Include 97%+ MNIST accuracy and 3.5x dot-kernel speedup only because the portfolio source backs those metrics.

5. Taskflow Calendar
   - Include only if space remains after stronger projects.
   - If included, emphasize full-stack testing and PostgreSQL/query work.

Dynamic Calendar and LifeQuest should not consume space if stronger proof-backed projects fit.

## Experience Refinement

The ITSM Data Integration internship should remain a major proof point and should now reflect that it ended in May 2026.

Strengthen bullets around:

- Python and SQL ETL workflows over 1M+ operational records
- Tableau/OAS/Workday reporting workflows
- private-safe Master Inventory proof: 10,453 deduplicated rows, 35-field schema, deterministic IDs
- API-integrated automation and Slack/OpenAI RAG support, phrased as private internal tooling without overclaiming production usage

Keep the Student Worker entry only if it fits. If the resume is too crowded after adding stronger engineering proof, reduce it to one concise service/operations bullet.

## ATS And Parser Requirements

The generated PDF must remain text-based and ATS-friendly:

- Use a single-column layout.
- Use standard headings.
- Use real text bullets, not CSS pseudo-element bullets.
- Avoid tables, text boxes, icons, and multi-column skill grids.
- Avoid hidden text or keyword stuffing.
- Avoid slash-heavy abbreviations when a parser-friendly comma list is clearer.
- Expand uncommon terms once where space allows, especially OpenAI Responses API, File Search, and human approval gates.
- Keep hyperlinks visible as plain text and, if practical, actual PDF link annotations.

Parser checks should confirm that raw extraction does not glue critical tokens such as `GPA3.47`, `anAutoML`, `VisualAssist`, `StudentAssociate`, or `externalAPIs`.

## Layout Requirements

The resume must fit one Letter page and use the page well.

Target visual outcome:

- one page only,
- no second-page overflow,
- no cramped typography,
- no large blank bottom area,
- readable body size around 10pt if possible,
- clean section rhythm,
- full-page density similar to the previous resume,
- Times New Roman or another ATS-safe serif/sans font,
- no decorative graphics.

The current resume is one page but underfills the bottom. The implementation should use the unused space for stronger proof-backed content and slightly more readable sizing rather than adding empty padding.

## Validation Plan

After implementation, verification should include:

- `npm run resume:build`
- `pdfinfo public/resume.pdf` and confirm `Pages: 1`
- `pdftotext -layout public/resume.pdf /tmp/portfolio-resume-layout.txt`
- `pdftotext -raw public/resume.pdf /tmp/portfolio-resume-raw.txt`
- grep checks for stale or glued text
- `pdffonts public/resume.pdf`
- render PDF to PNG with `pdftoppm`
- inspect the rendered page visually
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- targeted Playwright resume route check if the implementation changes site-facing resume access

The final handoff should include the rendered PNG path and a short note on page fit, parser extraction, and keyword/content changes.

## Out Of Scope

This pass does not create role-specific resume variants. It only improves the main master resume. Later application-specific resumes can safely bias toward software, data, full-stack, or ML systems based on the target job description.

This pass does not add a visible AI label, badge, or disclaimer to the resume. It also does not add unsupported claims about Codex, Claude, production RAG deployment, or private institutional usage that is not shown in the portfolio evidence.
