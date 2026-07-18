import fs from "node:fs";

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
  ["public/og-image.png", 300_000],
  ["public/resume.pdf", 300_000],
];

for (const [file, maxBytes] of budgets) {
  const size = fs.statSync(file).size;
  if (size > maxBytes) {
    console.error(`${file} is ${size} bytes, budget is ${maxBytes}`);
    process.exitCode = 1;
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Asset budget check passed.");
