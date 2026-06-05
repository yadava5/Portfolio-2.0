# Ayush Yadav - Technical Operations Atlas

Recruiter-facing portfolio for software, data, and ML engineering work. The primary surface is the Technical Operations Atlas: a compact proof ledger that connects resume claims to source-truth data, public repositories, private-safe case studies, and browser-verified UI behavior.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?style=flat-square&logo=tailwindcss)
![Playwright](https://img.shields.io/badge/Playwright-validated-2edb73?style=flat-square&logo=playwright)

## What This Portfolio Optimizes For

- **Recruiter scan speed** - first viewport exposes role target, resume, GitHub, LinkedIn, contact, and proof metrics.
- **Evidence quality** - public work links to source where available; private work uses explicit private-safe disclosures instead of pretending generated visuals are screenshots.
- **Case-study depth** - project routes describe problem, constraints, architecture, decisions, validation, outcomes, and artifacts.
- **Mobile access** - the header and hero both expose Resume, GitHub, LinkedIn, and Contact on small screens.
- **Validation discipline** - default Playwright checks are assertion-only; screenshot/video artifact suites are opt-in and write to ignored output paths.

## Tech Stack

| Category          | Technologies                    |
| ----------------- | ------------------------------- |
| Framework         | Next.js 16 App Router           |
| UI                | React 19, TypeScript            |
| Styling           | Tailwind CSS 4                  |
| Motion            | GSAP, Framer Motion, Lenis      |
| Testing           | Playwright, axe-core/playwright |
| Deployment target | GitHub Pages static export      |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validation

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:e2e
```

`npm run test:e2e` builds the static site and runs the cleaned assertion suite. It should not leave tracked generated files behind.

Additional browser tools:

```bash
npm run test:e2e:full
npm run test:e2e:artifacts
npm run test:e2e:ui
npm run test:visual
```

Artifact-producing suites write reports, screenshots, and videos under `output/playwright/`, which is ignored by git.

## Project Structure

```text
src/
├── app/                         # Next.js routes and metadata
├── components/
│   ├── atlas/                   # Technical Operations Atlas surface
│   ├── case-study/              # Evidence-led case-study pages
│   ├── layout/                  # Header, footer, providers
│   └── sections/                # Legacy theme sections
├── config/                      # Theme registry
└── lib/
    ├── data/                    # Resume, project, experience, skill data
    └── utils.ts                 # Base-path helpers

tests/playwright/                # Assertion and visual-audit suites
output/playwright/               # Generated local artifacts, ignored
docs/superpowers/plans/          # Execution plans and validation notes
```

## Artifact Policy

Source specs live in `tests/playwright/`. Generated Playwright reports, screenshots, videos, and ad hoc visual-audit output belong in `output/playwright/` and should not be committed unless they are intentionally promoted as durable documentation.

## Contact

**Ayush Yadav**  
Computer Science, Miami University - May 2026

- [GitHub](https://github.com/yadava5)
- [LinkedIn](https://www.linkedin.com/in/ayush-yadav-developer/)
- [Email](mailto:yadava5@miamioh.edu)

## License

MIT © 2026 Ayush Yadav
