import fs from "node:fs";

// ≤300KB budget per image (WebP/AVIF), per the portfolio rebuild plan.
// advocacy.png is intentionally omitted: paid-internships is hidden
// (portfolioVisible: false) and its image is never fetched.
const budgets = [
  ["public/images/profile/ayush-yadav-professional-portrait.webp", 300_000],
  ["public/images/projects/agentic-automl-poster-proof.webp", 300_000],
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
