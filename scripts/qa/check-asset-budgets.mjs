import fs from "node:fs";
import path from "node:path";

// ≤300KB budget per image (WebP/AVIF), per the portfolio rebuild plan.
// The source PNGs (automl/mnist/advocacy .png) are intentionally
// omitted: they are the promote-proof pipeline's canonical captures and
// nothing on the site references them — only their assets:derive WebP
// derivatives ship (PERF-AUDIT fix 4). The header avatar carries its
// own tight budget (fix 3: it must stay a trivial fetch).
const budgets = [
  ["public/images/profile/ayush-yadav-professional-portrait.webp", 300_000],
  ["public/images/profile/ayush-yadav-avatar-96.webp", 5_000],
  ["public/images/projects/agentic-automl-poster-proof.webp", 300_000],
  ["public/images/projects/automl.webp", 300_000],
  ["public/images/projects/mnist.webp", 300_000],
  ["public/images/projects/advocacy.webp", 300_000],
  ["public/resume.pdf", 300_000],
];

// CRITIC-LEDGER F25: the social cards are rendered, not drawn
// (`npm run assets:render-og`). Each is a typographic 1200×630 paper
// card, so the budget is deliberately tight — a card that grows past
// 150KB has stopped being type and started being an image.
const ogDir = "public/og";
for (const file of fs.readdirSync(ogDir)) {
  if (!file.endsWith(".png")) continue;
  budgets.push([path.join(ogDir, file), 150_000]);
}
if (!fs.existsSync(path.join(ogDir, "home.png"))) {
  console.error("public/og/home.png is missing — run npm run assets:render-og");
  process.exitCode = 1;
}

for (const [file, maxBytes] of budgets) {
  const size = fs.statSync(file).size;
  if (size > maxBytes) {
    console.error(`${file} is ${size} bytes, budget is ${maxBytes}`);
    process.exitCode = 1;
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Asset budget check passed.");
