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
  {
    source:
      "/Users/ayush/Documents/Projects/ai-augmented-auto-ml-toolchain/docs/screenshots/experiments.png",
    target: path.join(outputDir, "automl.png"),
  },
];

await mkdir(outputDir, { recursive: true });

for (const asset of assets) {
  await sharp(asset.source)
    .resize(1376, 768, { fit: "cover", position: "top" })
    .png({ compressionLevel: 9 })
    .toFile(asset.target);
  console.log(`promoted ${asset.target}`);
}
