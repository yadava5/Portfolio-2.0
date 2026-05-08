# Technical Operations Atlas Concept Approval Gate

## Status

Concepts are generated, and the implementation path is approved as **layout reference only, repo-truth content only**. The generated concept text is not approved as source content because the images contain invented or outdated facts. See [content-truth-pass.md](content-truth-pass.md).

| Concept | Required output | Status | Approval |
| --- | --- | --- | --- |
| Home desktop | Technical Operations Atlas desktop homepage | Implemented from source truth using [technical-operations-atlas-home-desktop.png](concepts/technical-operations-atlas-home-desktop.png) as layout reference | Approved as layout reference only |
| Home mobile | Technical Operations Atlas mobile homepage | Implemented from source truth using [technical-operations-atlas-home-mobile.png](concepts/technical-operations-atlas-home-mobile.png) as layout reference | Approved as layout reference only |
| JobTracker case study | Native Intelligence case-study page concept | Implemented as static route from repo-truth case-study data | Approved after content rewrite |
| Fast MNIST case study | Evidence Ledger/performance case-study page concept | Implemented as static route with only verified high-level metrics | Approved after exact metric rewrite |
| Project evidence module | Card/detail module with architecture diagram, metrics, screenshot, code links | Implemented as Atlas selected-work and case-study evidence components | Approved after content rewrite |
| Contact/resume/footer | Recruiter-focused contact and footer concept | Implemented as recruiter contact/resume section from `personalInfo`, `socialLinks`, and resume truth | Approved after content rewrite |

## Locked Direction

Use one public identity: **Technical Operations Atlas**.

The site should feel like an operational, evidence-heavy computer science portfolio:

- graphite, zinc, white, warm amber, signal green, and small route-blue accents
- no purple/cyan/pink holographic gradient language
- no dominant glassmorphism
- no bento dashboard recreation
- no centered giant-name hero
- no devicon badge grid as primary proof
- no large public theme switcher in the primary header
- project treatments can use Evidence Ledger, Native Intelligence, and Field Systems locally

## Required First-Viewport Proof

The first viewport must show these without scrolling:

- role target
- current role
- availability
- strongest proof metric
- Resume link
- GitHub link
- LinkedIn link
- Contact link

## Concept Prompt

Use this exact prompt block for the visual concept pass:

```text
Create a computer science personal portfolio concept for Ayush Yadav using one flagship identity called Technical Operations Atlas. This is a code-native Next.js portfolio, not a static poster and not a dashboard template. The design must help a recruiter or engineer understand what Ayush built, why it mattered, and how it was validated.

Use real proof from the portfolio content: Miami University ITSM Data Integration Student Associate, Python/SQL pipelines, 1M+ rows, Tableau, Snowflake, API integrations, JobTracker, AutoML Platform, Visual Assist, Taskflow Calendar, Fast MNIST Neural Network, 738 tests, 97%+ MNIST accuracy, 5x SIMD speedup, 500+ emails/month, Core ML, Vision, LiDAR, privacy-first local processing.

Visual language: graphite, zinc, white, warm amber, signal green, and small route-blue accents. Use architecture diagrams, project screenshots, test/benchmark evidence, code-native metric tables, and concise case-study summaries. Do not use purple/cyan/pink holographic gradients, generic glassmorphism, bento dashboard cards, dark-luxe gold, burgundy editorial, noir red, neon cyberpunk, centered giant-name hero, devicon badge grids, or hero eyebrow pills.

Required sections: Hero, Selected Work, Experience, Technical Depth, Project Index, Testimonials, Contact. Hero must include role target, current role, availability, 3 proof metrics, Resume, GitHub, LinkedIn, and Contact. Concepts must be readable, practical for HTML/CSS, and responsive.
```

## Required Concept Set

1. Home desktop concept for `technical-operations-atlas`.
2. Home mobile concept for `technical-operations-atlas`.
3. Project case-study page concept using JobTracker.
4. Project case-study page concept using Fast MNIST.
5. Project evidence card/detail concept showing architecture diagram, metrics, screenshots, and code links.
6. Contact/resume/footer concept with no generic theme-showcase framing.

## Approval Rule

The implementation approval path is now: concepts are layout references only; source content must come from repo data, resume extraction, or a separately audited project repo.

## Concept QA

Generated image archive source:

```text
/Users/ayush/.codex/generated_images/019e054f-ebe5-7451-a062-ebc9bdcd010a
```

Reference-only alternate:

- [home-mobile-first-pass-reference-only.png](concepts/home-mobile-first-pass-reference-only.png)

Current assessment:

- The home desktop direction is the strongest base: recruiter proof is visible immediately, the operational atlas metaphor is clear, and the palette avoids the rejected purple/cyan/pink gradient language.
- The mobile home concept is usable for hierarchy and rhythm, but project card content must be replaced with repo-truth project summaries before implementation.
- The Fast MNIST concept is the cleanest case-study template and should drive the evidence-ledger page structure.
- The JobTracker concept has the right case-study density, but it currently invents product facts and native macOS framing that must be reconciled with the actual project.
- The project evidence module is useful as an interaction model, but fabricated metrics such as offer success rate must be removed or replaced with verified portfolio data.
- The contact/resume/footer concept has a strong recruiter-facing layout, but personal/contact facts and resume preview content must be checked against `public/resume.pdf` before use.
- The content-truth pass found that no generated concept is safe to implement literally. Home desktop, home mobile, Fast MNIST, and contact/footer can guide structure; all copy, metrics, dates, URLs, stacks, screenshots, and resume snippets must be replaced from source truth.

## Next Step

Continue with validation and polish from the shipped Atlas implementation:

- `technical-operations-atlas` is now the default theme.
- The old five themes remain accessible behind the secondary floating switcher.
- New static case-study routes exist for JobTracker, AutoML Platform, Visual Assist, Taskflow Calendar, and Fast MNIST.
- Atlas-specific Playwright coverage blocks known generated-image hallucinations.

The browser-validation blocker is repaired in [baseline.md](baseline.md). The current Playwright suite now targets `technical-operations-atlas` plus the five legacy visual modes. Remaining non-failing QA warning: Next dev logs a future `allowedDevOrigins` warning when tests use `127.0.0.1`.
