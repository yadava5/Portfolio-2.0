/**
 * Fix round 3 — carry the Nitpicking Viewer's BEFORE frames into this
 * round's evidence folder, so before/after sit side by side under one
 * name. Read-only on the source bundle.
 *
 * Usage: node docs/design-lab/copy-before-shots.mjs [srcDir]
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SRC =
  process.argv[2] ??
  "/Users/ayush/Documents/Projects/Portfolio-2.0/docs/design-lab/shots-nitpick";
const DST = "docs/design-lab/shots-fix3-nitpick";
mkdirSync(DST, { recursive: true });

/** [source name, destination name] — the frames each finding is judged on */
const PAIRS = [
  ...[640, 700, 768, 820, 900, 1000, 1100, 1240, 1440].map((w) => [
    `header-at-${w}.png`,
    `before-header-${w}.png`,
  ]),
  ["zoom-hero-apostrophe.png", "before-hero-apostrophe.png"],
  ["zoom-strapline-apostrophe.png", "before-strapline-apostrophe.png"],
  ["zoom-automl-redaction.png", "before-redaction.png"],
  ["zoom-tmarker-cadence.png", "before-tmarker-cadence.png"],
  ["w2560-00-hero.png", "before-rail-2560.png"],
  ["w1440-25-y7531.png", "before-fig53-cadence.png"],
  ["deeplink-receipt.png", "before-target.png"],
  ["print-home.pdf", "before-print-home.pdf"],
  ["print-case.pdf", "before-print-case.pdf"],
  ["print-evidence.pdf", "before-print-evidence.pdf"],
  ["header-notes.json", "before-header-notes.json"],
  ["count-notes.json", "before-count-notes.json"],
  ["text-notes.json", "before-text-notes.json"],
  ["zoom-notes.json", "before-zoom-notes.json"],
  ["modes-notes.json", "before-modes-notes.json"],
  ["nav-notes.json", "before-nav-notes.json"],
];

let copied = 0;
const missing = [];
for (const [from, to] of PAIRS) {
  const src = join(SRC, from);
  if (!existsSync(src)) {
    missing.push(from);
    continue;
  }
  copyFileSync(src, join(DST, to));
  copied += 1;
}

console.log(`copied ${copied} before-frames into ${DST}`);
if (missing.length) console.log(`missing from source: ${missing.join(", ")}`);
console.log(`${DST} now holds ${readdirSync(DST).length} files`);
