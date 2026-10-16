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
  /* `automl.webp` left this list on 2026-08-07 when its plate was retired.
     A budget on a file that no longer exists fails the gate for the wrong
     reason; the poster proof above is a different asset and stays. */
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

// The site mark. An icon is requested on every page view, before anything
// else in the head resolves, so it must stay a trivial fetch, and no budget
// here has room for a resurrected 256px ICO frame (the retired one was 25,931
// bytes). On 2026-10-16 the mark became the owner's name, "Ayush" over
// "Yadav", outlined from Fraunces with the clay rail between the words
// (scripts/asset-truth/site-mark.mjs). Ten outlined letters cost what a disc
// did not: measured 4,275 / 3,118 / 5,290 bytes, against the disc's 545 /
// 2,001 / 3,250. The SVG budget moves from 4,000 to 5,000 for that, and the
// cut was already made as small as it can be without losing shape: integers
// in a 640 box with relative commands and repeated command letters elided,
// which is a quarter of a pixel at 16 px. The ICO and the touch icon stay
// inside their old budgets, the touch icon at 88% of it: letters cost PNG
// more than a solid shape does, and the larger the tile, the more.
// `npm run assets:render-favicons` writes all three.
budgets.push(["public/favicon.svg", 5_000]);
budgets.push(["public/favicon.ico", 4_000]);
budgets.push(["public/apple-touch-icon.png", 6_000]);

for (const [file, maxBytes] of budgets) {
  const size = fs.statSync(file).size;
  if (size > maxBytes) {
    console.error(`${file} is ${size} bytes, budget is ${maxBytes}`);
    process.exitCode = 1;
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Asset budget check passed.");
