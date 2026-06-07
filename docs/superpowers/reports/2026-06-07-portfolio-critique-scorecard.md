# Portfolio Critique Scorecard - 2026-06-07

## Executive Summary

Current local branch: `yadava5/fast-mnist-proof-polish`

The portfolio is strong locally but not recruiter-ready as a public artifact until the current branch is published. The local Technical Operations Atlas experience is coherent, evidence-led, and well-tested. The public GitHub Pages URL currently returns `404`, and the branch is 33 commits ahead of `origin/main`, so the strongest proof work is not inspectable by recruiters yet.

Overall scores:

| Scope | Score | Meaning |
| --- | ---: | --- |
| Local portfolio quality | 78/100 | The current branch is strong, proof-led, and usable, with polish/maintainability gaps. |
| Public recruiter readiness | 69/100 | Penalized heavily because the configured public URL and resume URL return `404`. |

## Critique Lanes

Parallel critique agents reviewed the current portfolio from five angles:

- Recruiter narrative and conversion: homepage signal, proof density, resume/CTA flow, role targeting.
- Visual design and motion: Technical Operations Atlas identity, section rhythm, mobile scan, transition quality.
- Asset truth and project credibility: proof artifacts, private-safe boundaries, project/source consistency.
- QA/accessibility/performance/SEO: Playwright, CI gates, metadata, contrast, reduced motion, budgets.
- Maintainability and architecture: Atlas-only code path, legacy theme residue, component size, stale docs/tests.

A separate critique agent then reviewed the implementation plan itself and scored it `74/100` before amendments. Its main criticism was that public deployment availability was the largest recruiter-facing blocker but was sequenced too late. The amended plan now adds a deployment-first Task 0 and strengthens SEO, proof, CI, cleanup, and visual-verification gates.

## Aspect Scores

| Aspect | Score | Main reason |
| --- | ---: | --- |
| Recruiter narrative and conversion | 86/100 | Strong proof-first positioning, fast CTAs, one-page resume, and credible CS new-grad story. |
| Visual design and motion | 82/100 | Coherent Atlas identity, but repeated dark bordered cards and modest motion reduce distinctiveness. |
| Asset truth and project credibility | 76/100 | Strong local proof model, but public inspectability and some source-repo wording remain weak. |
| QA, accessibility, performance, SEO | 74/100 | Strong local Playwright coverage, weak CI enforcement, SEO, contrast, reduced-motion, and performance budgets. |
| Maintainability and architecture | 72/100 | Atlas is public-only, but legacy themes, stale docs/tests, large components, and dead code remain. |
| Public deployment availability | 20/100 | `https://yadava5.github.io/Portfolio-2.0/`, `/resume.pdf`, and `/sitemap.xml` returned `404`. |

## Fresh Verification

Commands and results from this critique pass:

```bash
npm run typecheck
# passed

npm run lint
# passed with one warning:
# tests/playwright/deep-qa.spec.ts:15 unused isMobileViewport

npm run format:check
# passed

npm run test:e2e:full
# 184 passed, 14 skipped, 0 failed
```

External availability checks:

```bash
curl -I -L https://yadava5.github.io/Portfolio-2.0/
# HTTP/2 404

curl -I -L https://yadava5.github.io/Portfolio-2.0/resume.pdf
# HTTP/2 404

curl -I -L https://yadava5.github.io/Portfolio-2.0/sitemap.xml
# HTTP/2 404

gh api repos/yadava5/Portfolio-2.0/pages
# 404 Not Found

git rev-list --left-right --count origin/main...HEAD
# 0 33
```

Static/export observations:

- `public/sitemap.xml` lists only the homepage, while `out/projects/*/index.html` contains seven project pages.
- The latest local `out/` was produced with `NEXT_PUBLIC_BASE_PATH=` for local Playwright, so its OG image URLs are not equivalent to a production-base-path deploy build. The gap is still real: CI needs a production static-export SEO check.
- Large public assets include `public/images/profile/ayush-yadav-professional-portrait.png` at about 1.9 MB and `public/images/projects/agentic-automl-poster-proof.png` at about 1.5 MB.

## Strengths

### Recruiter Story

- The first viewport is recruiter-oriented: name, role target, May 2026 graduation context, recent role, availability, resume/GitHub/LinkedIn/contact CTAs, and proof metrics are visible in `src/components/atlas/TechnicalOperationsAtlas.tsx`.
- The site has a clear "software engineer with data/ML systems proof" direction instead of a generic student portfolio.
- The contact surface repeats email, resume, GitHub, LinkedIn, and a resume preview.
- `public/resume.pdf` is one page, text-extractable, and aligned with the current GPA/source-truth work.

### Proof and Asset Truth

- `src/lib/data/projects.ts` carries `githubUrl`, `liveUrl`, `imageKind`, `imageDisclosure`, `isPrivate`, metrics, and visibility state.
- `src/lib/data/projectCaseStudies.ts` gives each case study role, timeframe, architecture, decisions, validation, outcomes, artifacts, and private-safe disclosure when needed.
- Private proof boundaries are unusually good: the private audit documents that raw policy content, Slack messages, PAT values, owner names, report names, and CSV rows were not copied into the portfolio.
- Playwright fixtures forbid stale generated claims and require private-safe case-study availability.

### Rendered QA

- Full local Playwright is green: `184 passed`, `14 skipped`.
- The full-audit artifact reports `technical-operations-atlas: 0 issues found`.
- Desktop and mobile quality-score tests report `score: 10` with no deductions.
- Checks cover identity, CTAs, no public theme selector, resume availability, project links, social links, section IDs, image assets, case-study routes, console errors, focus indicators, headings, image alt text, and walkthrough artifacts.

## Gaps

### Critical Public Gap

The portfolio is not publicly inspectable at the configured URL right now. This is the biggest recruiter-facing issue. A local score near 80 does not matter if a recruiter opens the URL and gets a GitHub Pages 404.

Also, `deploy.yml` deploys only from `main`, while the current branch is 33 commits ahead of `origin/main`. The current proof assets and transcript-backed resume work are local/branch truth, not public truth.

### Visual and UX Gaps

- The Atlas theme is coherent but still often reads as repeated dark evidence cards rather than a richer operations atlas.
- Motion is usable but not distinctive. Smooth scroll, scroll progress, and hover image scale exist, but sections do not yet create a memorable operational narrative.
- Mobile is polished but dense. The mobile Projects screenshot is very long, and several later evidence records are hidden from the main selected-work card stack on mobile.
- The hero metrics are credible but insider-heavy: "18,403 AutoML ledger events" and "3.5x dot-kernel speedup" prove rigor but do not immediately translate into recruiter value.

### Project and Proof Gaps

- AutoML proof assets include a poster image that embeds many exact claims and a live URL, while the portfolio keeps `liveUrl: null` for AutoML. That is an implicit live-demo boundary mismatch.
- Public source repositories can say stronger or slightly different things than the portfolio. Taskflow uses "production-ready" wording in source while the portfolio uses softer "production-style" wording.
- Older planning docs still contain historical generated/stale metrics. The UI guards against them, but the public repository still exposes them to a determined reviewer.

### QA and Accessibility Gaps

- GitHub Actions does not run Playwright, `resume:check`, production static SEO checks, Lighthouse, Web Vitals, or performance budgets.
- `tests/playwright/a11y-audit.spec.ts` disables `color-contrast`.
- Playwright config is Chromium-only.
- Reduced-motion behavior is not directly tested.
- Performance checks are synthetic: page load under 5 seconds and rough layout-shift checks, but no LCP/CLS/INP/image-weight/bundle budgets.
- `tests/playwright/INDEX.md` still says the desktop theme switcher is visible, which contradicts current Atlas-only behavior.

### Maintainability Gaps

- `src/components/themes/ThemeOrchestrator.tsx` still imports legacy backgrounds, cursors, and sections.
- `src/config/themes.ts` still types/configures legacy themes even though `themeIds` exposes only Atlas.
- `src/components/layout/ThemeSwitcher.tsx` is dead product code but still exists.
- `src/components/atlas/TechnicalOperationsAtlas.tsx` is about 620 lines and should be split into section components.
- Legacy section components remain large: `src/components/sections/Projects.tsx` is nearly 900 lines.
- `src/components/layout/SmoothScroll.tsx` schedules recursive animation frames but only cancels the first frame id on cleanup.
- `.gitignore` ignores `/output/playwright/` but not all generated QA output under `/output/`.

## Highest-Impact Backlog

1. Publish the current branch or merge it to `main`, then verify the public homepage, resume, sitemap, and case-study routes return `200`.
2. Add CI gates for Playwright, resume parser/density, and production-base-path static SEO.
3. Add a proof manifest that maps every public metric to source artifact, command, repo URL, and privacy boundary.
4. Fix the AutoML proof/live URL boundary.
5. Collapse or quarantine legacy theme code and stale theme docs/tests.
6. Split `TechnicalOperationsAtlas.tsx` into section components.
7. Add accessibility/performance hardening: contrast, reduced-motion, Web Vitals/Lighthouse, image budgets, and at least smoke coverage beyond Chromium.
8. Polish Atlas visuals: richer hero operations panel, less repeated card rhythm, more purposeful scroll states, and a sharper contact close.

## Recommended Next Score Target

Target after the next improvement pass:

| Aspect | Current | Target |
| --- | ---: | ---: |
| Public deployment availability | 20 | 95 |
| QA/accessibility/performance/SEO | 74 | 86 |
| Maintainability | 72 | 84 |
| Asset truth/project credibility | 76 | 86 |
| Visual design/motion | 82 | 88 |
| Recruiter narrative/conversion | 86 | 91 |

Expected overall public recruiter readiness after those changes: 85 to 88.
