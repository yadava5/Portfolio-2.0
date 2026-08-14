import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "public", "images", "projects");

const assets = [
  {
    source: path.join(
      root,
      "output",
      "playwright",
      "asset-truth-audit",
      "paid-internships-data.png"
    ),
    target: path.join(outputDir, "advocacy.png"),
  },
  /* The mnist entry was removed on 2026-08-14, and like the taskflow one
     below it is a PROMOTION rather than a retirement. `mnist.png` was
     `output/playwright/asset-truth-audit/fast-mnist-workbench.png`, a local
     Playwright capture of the ClassifierWorkbench — a component deleted when
     glyph's landing page was rebuilt, under a masthead reading "FAST MNIST",
     a name retired in the 2026 rename. It is now a capture of the deployed
     page at getglyph.vercel.app, taken after a real classification.

     It has to come out of this list rather than be re-pointed, for the same
     reason taskflow did: the source is a browser screenshot of a deployed
     site, not a Playwright artifact in this repository. Left as a comment
     because this is the only record of where the previous plate came from —
     re-running `assets:promote-proof` with the old entry in place would
     silently overwrite the production plate with the retired-brand
     workbench. */
  /* The taskflow entry was removed on 2026-08-07, and unlike the automl one
     below it is a PROMOTION, not a retirement: `taskflow.png` was
     `output/playwright/asset-truth-audit/taskflow-after-mock-login.png`, a
     local capture of the repository's mock-login flow, and it is now a real
     production interior — usecadenceapp.vercel.app signed in as the shared
     demo account, whose seeded week was made current the same day.

     It has to come out of this list rather than be re-pointed, because the
     source no longer exists in this repository: the capture is a browser
     screenshot of a deployed site, not a Playwright artifact. Left as a
     comment for the same reason as automl's — this is the only record of
     where the previous plate came from. Re-running `assets:promote-proof`
     with the old entry in place would silently overwrite the production
     plate with the mock-login one. */
  /* The automl entry was removed on 2026-08-07 with the plate it fed:
     `experiments.png` from the AutoML repo became `automl.png` became
     `automl.webp`, and the case file no longer hangs it — the deployed
     product says "Coming soon", so a product screenshot there argues
     something the work has not yet earned. Left as a comment rather than
     deleted because this is the only record of where that capture came
     from, and its source path points outside this repository. */
];

await mkdir(outputDir, { recursive: true });

for (const asset of assets) {
  await sharp(asset.source)
    .resize(1376, 768, { fit: "cover", position: "top" })
    .png({ compressionLevel: 9 })
    .toFile(asset.target);
  console.log(`promoted ${asset.target}`);
}
