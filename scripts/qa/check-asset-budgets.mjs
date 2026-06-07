import fs from "node:fs";

const budgets = [
  ["public/images/profile/ayush-yadav-professional-portrait.png", 2_000_000],
  ["public/images/projects/agentic-automl-poster-proof.png", 1_700_000],
  ["public/images/projects/advocacy.png", 1_100_000],
  ["public/og-image.png", 350_000],
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
