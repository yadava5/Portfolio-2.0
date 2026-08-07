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
  {
    source: path.join(
      root,
      "output",
      "playwright",
      "asset-truth-audit",
      "fast-mnist-workbench.png"
    ),
    target: path.join(outputDir, "mnist.png"),
  },
  {
    source: path.join(
      root,
      "output",
      "playwright",
      "asset-truth-audit",
      "taskflow-after-mock-login.png"
    ),
    target: path.join(outputDir, "taskflow.png"),
  },
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
