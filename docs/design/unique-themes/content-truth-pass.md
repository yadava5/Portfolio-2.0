# Technical Operations Atlas Content Truth Pass

Date: 2026-05-08

## Gate Decision

Do not implement the generated concepts as literal UI content.

The concept set is useful as a visual reference for layout, density, section hierarchy, and palette. It is not approved as source content because the images contain invented or outdated facts. Implementation remains blocked until Ayush approves either corrected concepts or this content contract as the source of truth for code.

## Verified Source Truth

Use these repo and resume facts when revising concepts or implementing the Atlas UI.

| Area | Verified truth |
| --- | --- |
| Name | Ayush Yadav |
| Site title | Ayush Yadav \| Software Engineer |
| Current role | ITSM Data Integration Student Associate, Miami University |
| Location | Oxford, Ohio |
| Availability | Open to internships and new-grad roles |
| Education | B.S. Computer Science, Miami University, expected May 2026 |
| Portfolio email | `aesh_1055@icloud.com` |
| Resume email | `yadava5@miamioh.edu` |
| Phone in resume | `(513) 461-4375` |
| GitHub | `https://github.com/yadava5` |
| LinkedIn | `https://www.linkedin.com/in/ayush-yadav-developer/` |
| Resume | `public/resume.pdf`, one page |

## Proof Metrics Allowed In First Viewport

| Metric | Use | Source |
| --- | --- | --- |
| `1M+` | Rows processed across Python/SQL pipelines | `src/lib/data/personal.ts`, `src/lib/data/experience.ts`, resume |
| `738` | Automated tests for Taskflow Calendar | `src/lib/data/projects.ts` |
| `97%+` | Fast MNIST model accuracy | `src/lib/data/projects.ts`, resume supports MNIST project |
| `5x` | Fast MNIST SIMD speedup | `src/lib/data/projects.ts`, resume supports SIMD/OpenMP optimization |
| `500+ emails/month` | JobTracker processing volume | `src/lib/data/projects.ts` |
| `68 unit tests` | Visual Assist unit tests | `src/lib/data/projects.ts` |
| `50+ institutional documents` | PolicyBot knowledge base | `src/lib/data/projects.ts` |

Avoid generated metrics that are not in repo/resume, including offer-success rate, 80+ users, 1200+ installs, app-store ratings, 40% MTTR, 65% faster insights, uptime percentages, exact benchmark latencies, throughput values, fake dashboard counts, or fake data-review percentages.

## Project Content Corrections

| Project | Correct framing | Remove or replace |
| --- | --- | --- |
| JobTracker | Native macOS app with Python/FastAPI/SwiftUI/SQLite/SetFit; Gmail OAuth2 and iCloud IMAP; privacy-first local ML; 3-layer classifier; real-time sync through SMAppService + launchd; 500+ emails/month. | Next.js/tRPC/Prisma/Postgres, SendGrid, offer-success rates, 80+ users, 120+ applications, shipped/founder labels, fake classifier F1/precision/recall values, `technical-operations-atlas/jobtracker` repo path. |
| AutoML Platform | LLM-orchestrated automated data scientist platform using TypeScript, React, Node.js, PostgreSQL, Docker, RAG + MCP, HPO/multi-model search, and Playwright evaluation. | Fake churn dashboards, MLflow/Ray/Optuna claims unless added to source data, fake production accuracy, private/public contradictions. |
| Visual Assist | iOS accessibility app using Swift, SwiftUI, ARKit, Core ML, Vision, LiDAR, VoiceOver, haptics, voice commands, and on-device privacy. | Generic analytics assistant framing, LangChain/OpenAI/DuckDB/Streamlit stacks, app-store installs/ratings unless verified. |
| Taskflow Calendar | Full-stack calendar/task app with React 19, TypeScript, PostgreSQL, Vercel, Tailwind CSS, NLP scheduling, conflict detection, and 738 automated tests. | Treating it as a small decorative card only; this is a flagship proof point for testing and full-stack delivery. |
| Fast MNIST Neural Network | C++/SIMD/OpenMP neural network with React/TypeScript frontend; 97%+ MNIST accuracy; 5x AVX-512 SIMD speedup; comprehensive benchmark suite. | Exact P50/P95 latency, throughput, CPU model, date ranges, repo namespace, and 97.27% precision unless verified in the project repo. |
| Master Inventory Pipeline | Private/work project; Python/pandas/SQL/Tableau; 1M+ rows daily; hours-to-minutes reconciliation. | Public repo/demo links, client-specific invented architecture, or exposing proprietary details beyond current portfolio copy. |
| PolicyBot | Private/work RAG policy chatbot with OpenAI File Search, Slack Socket Mode, quote verification, and 50+ institutional documents. | Public repository links or unsupported Slack usage metrics. |

## Concept-by-Concept Audit

| Concept | Visual status | Content status | Recommendation |
| --- | --- | --- | --- |
| `technical-operations-atlas-home-desktop.png` | Strongest homepage layout reference: first-viewport proof, CTA placement, operational pipeline diagram, and selected-work density are useful. | Not content-safe. It says CUNY Brooklyn, includes fake selected-work metrics, fake screenshots, and unsupported architecture details. | Use as homepage layout reference only after replacing all content with repo truth. |
| `technical-operations-atlas-home-mobile.png` | Strong mobile hierarchy and CTA stack. Resume/GitHub/LinkedIn/Contact rhythm is useful. | Not content-safe. Selected-work cards invent distributed-system, Kafka, ClickHouse, AWS, Streamlit, and percentage claims. | Use mobile rhythm only; rewrite project cards from `src/lib/data/projects.ts`. |
| `jobtracker-case-study-needs-content-correction.png` | Good case-study density: problem, UI proof, architecture, decisions, validation, outcomes, artifacts. | Not content-safe. It invents dates, status, repo URL, F1/precision/recall, resource impact, artifact links, and some implementation specifics. | Keep the dossier structure; replace with the JobTracker source-truth contract above. |
| `fast-mnist-case-study.png` | Best evidence-ledger page structure, especially architecture diagram, benchmark table, methodology, outcomes, and sidebar proof. | Partially unsafe. High-level 97%+ and 5x are supported, but exact benchmark numbers, environment, role/date, repo URL, and artifacts are not verified in this repo. | Use as the case-study template; downgrade exact metrics to verified values unless the Fast MNIST repo is audited separately. |
| `project-evidence-module-needs-content-correction.png` | Useful selected-work/detail interaction model and tabbed proof layout. | Not content-safe. JobTracker, AutoML, and Visual Assist cards use wrong categories, stacks, metrics, and screenshots. | Use interaction pattern only; generate module data from the real public/private project records. |
| `contact-resume-footer-needs-content-correction.png` | Strong recruiter contact/footer layout with resume preview and accessibility/reduced-motion footer notes. | Not content-safe. Email, GitHub, LinkedIn, availability, experience bullets, proof metrics, project links, and last-updated content conflict with repo/resume. | Keep layout idea; rewrite from `personalInfo`, `socialLinks`, `experience`, and extracted resume text. |

## Implementation Content Contract

If Ayush approves implementation from these references, use this contract:

- Public header prioritizes Resume, GitHub, LinkedIn, and Contact over any theme/mode switcher.
- Hero must use `personalInfo.title`, `personalInfo.availability`, `personalInfo.resumeUrl`, and `socialLinks`.
- First-viewport metrics must come from the allowed metric list above.
- Selected Work must use `getPublicProjects()` and never fabricate unavailable live demos or private repo links.
- Project cards must show private/public state accurately.
- Case-study content must be structured from new source data, but every metric must be traceable to current project data, resume text, or a separately audited project repo.
- Contact/resume footer must make `public/resume.pdf` visible and use the real social URLs.
- Any exact benchmark, test count, usage count, GPA, award, phone number, or employer detail must be copied from source data or resume extraction, not from generated concept images.

## Remaining Approval Choice

Before source implementation, choose one:

1. Generate corrected concept images using this truth contract, then ask for approval again.
2. Approve the visual direction as layout reference only and implement directly from repo truth.

Option 2 is faster and safer if the goal is a working portfolio soon; Option 1 gives better visual sign-off but adds another concept round.
