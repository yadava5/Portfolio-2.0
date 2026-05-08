# Technical Operations Atlas Design

Date: 2026-05-08

## Decision

Proceed with the faster content-safe path: use the generated Technical Operations Atlas images as layout references only, and implement from repo/resume truth. No generated image copy, dates, metrics, repository paths, emails, or benchmark details should be copied into source.

## Goal

Make Portfolio 2.0 feel like one serious computer-science hiring portfolio instead of a theme showcase. The first visit should answer: what Ayush builds, what proof exists, which projects matter most, and how to reach resume/GitHub/LinkedIn/contact.

## Architecture

Add `technical-operations-atlas` as the default theme while preserving the current five themes behind the existing theme switcher. `ThemeOrchestrator` will route the Atlas theme to a focused `TechnicalOperationsAtlas` experience; legacy themes keep using the existing section components. This avoids a destructive rewrite while making the public default identity coherent.

Atlas content comes from typed source data:

- `src/lib/data/personal.ts` for identity, availability, social links, and resume URL.
- `src/lib/data/projects.ts` for project titles, descriptions, stacks, public/private state, images, metrics, and source/demo links.
- `src/lib/data/experience.ts`, `skills.ts`, and `testimonials.ts` for proof sections.
- New `projectCaseStudies.ts` for structured case-study proof derived only from current repo/resume facts.

## User Experience

### Header

The header should prioritize recruiter actions: Resume, GitHub, LinkedIn, and Contact. Section navigation stays available, but the theme switcher remains secondary and floating. The public header must not look like a design-system demo.

### Homepage

The Atlas homepage is a dense but readable operational map:

- Hero shows role target, current role, availability, strongest proof metrics, and CTA actions.
- Operational pipeline shows the shape of the work: ingest, validate, transform, model, serve, monitor.
- Selected Work uses real project records and screenshots.
- Experience highlights Miami ITSM data integration work.
- Technical Depth replaces generic skill badges with CS proof categories.
- Project Index gives quick scan access to public and private projects without fabricating private links.
- Testimonials and Contact remain recruiter-friendly and source-truth based.

### Case Studies

Add static project detail routes for the five flagship projects:

- JobTracker
- AutoML Platform
- Visual Assist
- Taskflow Calendar
- Fast MNIST Neural Network

Each route should include Problem, Role, Architecture, Decisions, Validation, Outcomes, and Artifacts. Every metric must be traceable to current source data or resume text. Exact Fast MNIST benchmark numbers beyond `97%+` and `5x` are intentionally excluded until that repo is audited.

## Visual Language

Use graphite, zinc, white, warm amber, signal green, and restrained route-blue accents. Avoid purple/cyan/pink holographic gradients, dominant glassmorphism, bento dashboard recreation, large centered-name hero, devicon badge grids, and theatrical parallax.

Cards can be compact evidence panels. Diagrams should be code-native HTML/CSS, not generated art. Motion should be subtle and respect reduced motion.

## Data Rules

- First-viewport metrics may include `1M+`, `738`, `97%+`, `5x`, `500+ emails/month`, `68 unit tests`, and `50+ documents`.
- Do not display offer-success rates, app-store ratings, fake uptime, fake dashboard numbers, fake benchmark latencies, fake repo namespaces, or unverified dates.
- Public projects may link to GitHub/live URLs only when present in `projects.ts`.
- Private projects can be listed as private proof but must not expose fake repo/demo links.
- Contact must expose `personalInfo.email`, real social URLs, and `public/resume.pdf`.

## Testing

Validation should cover:

- TypeScript and ESLint.
- Atlas default theme renders without console/page errors.
- Resume/GitHub/LinkedIn/Contact are visible in the first viewport.
- Atlas has all expected section IDs.
- At least the five flagship project links/routes exist.
- Case-study pages include the required sections.
- Prohibited fake strings do not appear in public UI.
- Existing theme-switching coverage still works.

## Approval

Ayush approved continuing without additional review until the implementation is ready for final inspection. This spec is therefore the working approval artifact for implementation.
