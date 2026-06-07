# AutoML Proof Hardening Evidence

## Source Artifacts

- Product screenshot: `public/images/projects/automl.png`
- Poster proof: `/Users/ayush/Downloads/poster.pdf`
- Presenter proof: `/Users/ayush/Downloads/agentic-automl-presenter.pdf`

## Asset Decision

- Kept `public/images/projects/automl.png` as the primary image because it is a readable private-safe product screenshot.
- Added `public/images/projects/agentic-automl-stack-proof.png` from presenter slide 8 because it proves the stack and validation posture: React 19, Node/Express, Postgres, LangGraph, MCP, Docker, Jupyter, all-green tests, coverage, logs, packages, and migrations.
- Kept `public/images/projects/agentic-automl-poster-proof.png` as secondary poster proof because the full poster is credible but too dense for primary card display.

## Commands

```bash
mkdir -p output/playwright/automl-proof-hardening/pdf-pages
pdftoppm -png -r 144 -f 8 -l 8 /Users/ayush/Downloads/agentic-automl-presenter.pdf output/playwright/automl-proof-hardening/pdf-pages/presenter
node <<'NODE'
const sharp = require("sharp");
const input = "output/playwright/automl-proof-hardening/pdf-pages/presenter-08.png";
const output = "public/images/projects/agentic-automl-stack-proof.png";

sharp(input)
  .resize(1376, 768, { fit: "cover", position: "center" })
  .png({ compressionLevel: 9 })
  .toFile(output)
  .then(() => console.log(output))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
NODE
```

## Validation

Static gates:

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run format:check`: passed.

Browser gates:

- `npm run test:e2e -- --project=chromium-desktop tests/playwright/atlas.spec.ts tests/playwright/nav-and-images.spec.ts`: `40 passed`, `6 skipped`.
- `npm run test:e2e:score -- --project=chromium-desktop`: `1 passed`; Technical Operations Atlas score `10` with no deductions.

Manual Playwright captures from `http://127.0.0.1:3000/projects/automl/`:

- `output/playwright/automl-proof-hardening/automl-case-study-top-eager.png`
- `output/playwright/automl-proof-hardening/automl-validation.png`
- `output/playwright/automl-proof-hardening/automl-artifact-links.png`

Browser inspection:

- Fresh Playwright session after the eager-load fix reported `0` console errors and `0` console warnings.
- The AutoML top capture shows the primary private-safe product screenshot in the first viewport.
- The validation capture shows the slide-8 evidence row.
- The artifact-link capture shows the new `PRESENTATION` artifact link labeled `Presenter stack proof`.

Performance follow-up:

- Initial manual browser capture raised a Next.js LCP warning for `/images/projects/automl.png`.
- `src/components/case-study/CaseStudyPage.tsx` now marks the case-study proof image with `loading="eager"`.
- A fresh Playwright session confirmed the LCP warning was cleared.

Artifact navigation follow-up:

- Manual capture showed the old `#artifacts` anchor landed on the project image block rather than the artifact-link section.
- `src/components/case-study/CaseStudyPage.tsx` now uses `#project-visual` for the image block and `#artifacts` for the actual artifact-link section.
- `tests/playwright/atlas.spec.ts` verifies `/projects/automl/#artifacts` brings the artifact section into the viewport.
