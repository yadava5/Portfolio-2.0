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
// else in the head resolves, so it must stay a trivial fetch: measured at
// 509 / 2,032 / 3,187 bytes, budgeted with room for a re-cut of the mark
// but not for a resurrected 256px ICO frame (the retired one was 25,931
// bytes). The budgets have not moved: the mark stopped being a drawn glyph
// on 2026-10-07 and became a field, a stitched arc and a disc, drawn by
// `markSvg` in src/run/index.html — 509 bytes on disk against the pilcrow's
// 1,268 (388 of drawing and a line of provenance; 411 is the largest the
// function emits anywhere on the arc), while the rasters grew (1,540 → 2,032 and
// 2,194 → 3,187) because an arc of stitches on a full-bleed field gives
// PNG far more to encode than one clay glyph on flat paper. Both are still
// half their budget. `npm run assets:render-favicons` writes all three; the
// SVG is derived from the page, so the mark cannot be edited here.
budgets.push(["public/favicon.svg", 4_000]);
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
