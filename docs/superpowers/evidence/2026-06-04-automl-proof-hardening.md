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
