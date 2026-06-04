# Technical Operations Atlas Single-Theme Refinement Design

## Status

This spec supersedes the May 8 Atlas design direction that kept five legacy visual modes behind a public switcher. The new direction is one public portfolio identity: **Technical Operations Atlas**. Legacy theme code may stay in the repository temporarily, but the public app should no longer present theme switching or alternate visual identities.

## Goal

Make the portfolio feel like a focused new-grad computer science hiring dossier, not a theme showcase. The first visit should quickly answer:

- who Ayush is now,
- what roles he is targeting,
- which projects are strongest,
- what proof exists,
- what is private-safe versus publicly inspectable,
- how a recruiter or engineer can contact him.

## Source-Truth Inputs

- Current repo state on `yadava5/project-sanity-refresh`.
- Basic Memory critique notes from June 4, 2026.
- GitHub refresh findings that identify `fast-mnist-nn` as the strongest recent public proof asset.
- AutoML proof artifacts:
  - `/Users/ayush/Downloads/poster.pdf`
  - `/Users/ayush/Downloads/agentic-automl-presenter.pdf`
- Portrait options from:
  - `/Users/ayush/Library/Mobile Documents/com~apple~CloudDocs/Media/Photos/LinkedIn/ChatGPT Image Dec 20, 2025 at 05_39_56 PM.png`
  - `/Users/ayush/Library/Mobile Documents/com~apple~CloudDocs/Media/Photos/LinkedIn/ChatGPT Image Dec 20, 2025 at 05_42_18 PM.png`

## Public Theme Policy

The public portfolio should expose only `technical-operations-atlas`.

Implementation should:

- remove `ThemeSwitcher` from the rendered layout,
- reduce public `themeIds` to the Atlas identity,
- keep `defaultThemeId` as `technical-operations-atlas`,
- keep legacy visual-mode files in place for now if deleting them would create unnecessary risk,
- update Playwright expectations so theme-switching is no longer treated as a user-facing feature,
- keep the old theme code cleanup as a later repository maintenance phase.

This avoids a risky broad deletion while still making the product direction clear.

## Identity And Copy

Ayush has graduated from college. Public copy must stop saying "Senior CS student" or "Expected May 2026."

Use this direction unless a newer transcript or resume overrides it:

- headline role: "New-grad software engineer focused on data, ML systems, and full-stack reliability"
- education line: "B.S. Computer Science, Miami University, May 2026"
- availability: "Open to new-grad software, data, and ML engineering roles"

The site can still mention the Miami ITSM student-associate role as experience, but the top-level identity should not frame Ayush as a current student.

## Portrait Policy

Use the real, AI-enhanced professional portrait as a trust signal. The white-background version is preferred because it fits the Atlas system-dossier visual language better than the warmer beige-wall version.

Placement:

- restrained About/Profile identity panel,
- optional resume-preview/contact panel,
- not a full hero background,
- not a decorative card-heavy hero treatment.

Alt text should be direct and truthful: "Ayush Yadav professional portrait." The site does not need a visible AI-enhancement disclaimer because the image is a real portrait and is not being used to document project output.

## Project Hierarchy

Promote the strongest proof first:

1. Agentic AutoML Platform: strongest private capstone/product proof, now backed by poster and presenter artifacts.
2. Fast MNIST Neural Network: strongest recent public GitHub proof, with benchmark/release/WASM evidence.
3. Visual Assist: strongest native/accessibility proof.
4. JobTracker: useful local ML/native macOS proof, but keep claims conservative until screenshots/demos are stronger.
5. Dynamic Calendar Application: full-stack/test-volume proof, but avoid over-promoting visual maturity because public README has stale GIF placeholders.
6. Master Inventory and PolicyBot: private/work-related proof records, positioned as confidential operational systems rather than public demos.

LifeQuest and Job Automator should remain out of recruiter-facing display.

## AutoML Artifact Treatment

The AutoML poster is useful enough to replace weaker representative imagery in the AutoML proof flow. It includes product UI, architecture, ledger metrics, result metrics, milestone proof, and team-context evidence.

Use it carefully:

- create a portfolio-safe poster-derived image or crop for the AutoML case study,
- do not publish advisor/team photos or names without explicit approval,
- do not publish the full presenter deck publicly,
- avoid copying broad result claims into homepage copy unless they are framed as poster artifact claims,
- use presenter slide 3 to make Ayush's individual contribution concrete:
  - Monaco/Jupyter runtime with live WebSocket sync,
  - Docker sandbox with read-only rootfs, non-root user, CPU and memory limits,
  - eval runner and Optuna study streaming UI.

If the full poster PDF is exposed, it should be labeled as an Expo poster artifact and reviewed once before publish.

## Atlas Visual Direction

The critique score was about 79/100. The design is strong but needs recruiter-facing refinement.

Fix these visual issues:

- reduce mobile hero height and density,
- reduce repeated bordered-card rhythm,
- create stronger contrast between hero, proof, projects, and contact bands,
- keep the palette operational and serious without defaulting to generic purple gradients,
- use restrained amber, zinc, off-white, muted sky, and green status tones,
- avoid oversized marketing hero composition,
- avoid decorative orbs or one-note gradient backgrounds,
- make contact copy more direct and less thematic.

The design should feel like a technical operations profile: precise, source-backed, navigable, and calm.

## Content Modules

### Hero

The hero should contain:

- Ayush's name and new-grad role target,
- concise role sentence,
- Resume, GitHub, LinkedIn, Contact CTAs,
- 3-4 proof metrics that can be defended from current source truth,
- no visible theme-switching affordance.

Avoid overloading the first viewport with every project.

### About / Profile

The About section should become a recruiter profile snapshot:

- portrait,
- graduated education status,
- current/most recent role,
- location/contact,
- concise technical positioning,
- transcript-ready area that can be updated after transcript attachment.

### Selected Work

The selected-work area should become a ranked proof path. Each primary record should show:

- title,
- project type,
- public/private state,
- strongest proof artifact,
- one concise outcome,
- one "inspect" action.

AutoML and Fast MNIST should become the first two project records.

### Case Studies

Case-study pages should use artifact-backed proof:

- AutoML should include poster-derived proof and individual-contribution bullets.
- Fast MNIST should include GitHub/release/benchmark/WASM proof links if available.
- Visual Assist should keep architecture/accessibility proof.
- Private work should clearly state the boundary between public description and private evidence.

### Contact

Contact copy should be plain:

"Open to new-grad software, data, and ML engineering roles."

It should expose email, resume, GitHub, and LinkedIn without requiring the visitor to interpret theme language.

## Testing Requirements

Use both test-file validation and real browser inspection.

Required local commands:

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts tests/playwright/interactions.spec.ts tests/playwright/nav-and-images.spec.ts`
- `npm run test:e2e:score -- --project=chromium-desktop`

Required Playwright CLI checks:

- verify `npx` is available,
- open the local app through the Playwright CLI wrapper,
- snapshot the page,
- scroll through hero, about, selected work, case study, and contact,
- capture screenshots under `output/playwright/`,
- confirm no theme switcher is visible,
- confirm the hero/about copy no longer says "Senior CS student" or "Expected May 2026."

## Non-Goals

- Do not redesign the portfolio into a marketing landing page.
- Do not publish the transcript until the transcript file is attached and inspected.
- Do not delete all legacy theme files in the first implementation pass.
- Do not invent new project metrics.
- Do not use generated project images as proof when real screenshots, diagrams, poster crops, or repository-backed artifacts are available.

## Approval Assumptions

Ayush already chose Technical Operations Atlas as the only theme and chose approach C: remove public theme switching now, keep old theme code temporarily, and delete unused legacy code later. The white-background portrait is selected unless Ayush asks for the beige-wall version.
