/**
 * Render the social preview cards — one honest paper card per route.
 *
 * CRITIC-LEDGER F25/F26: four case studies set `og:image` to an
 * `*-architecture.svg`, declared 1200×630. Every major platform rejects
 * `image/svg+xml` for Open Graph, so the flagship first row shared as a
 * bare link; `/evidence` — the funnel's destination — carried no
 * openGraph block at all and shared as the homepage. The one raster
 * that did exist (`public/og-image.png`) was the retired dark-neon
 * edition, and it printed three unsourced tallies.
 *
 * The replacement is deliberately typographic: the site's own paper
 * (canvas cream, ink, kiln clay, the double rule), the name, the role
 * line, and the page's own title and deck. NOTHING is invented — every
 * string is read out of the data layer below, and no card carries a
 * number, a chart, or a screenshot it cannot source.
 *
 * Data is read by parsing the TS source rather than importing it: the
 * same house pattern as scripts/qa/check-proof-manifest.mjs (the data
 * modules import `@/lib/utils`, which no bare node process resolves).
 * The literals it reads are plain string literals for exactly this
 * reason.
 *
 * Usage:
 *   node scripts/asset-truth/render-og-cards.mjs           # render
 *   node scripts/asset-truth/render-og-cards.mjs --check   # verify only
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public", "og");
const CHECK_ONLY = process.argv.includes("--check");

/* ── The paper (globals.css @theme — kept in sync by eye, asserted by
      scripts/qa/check-contrast.mjs for the rendered site itself) ── */
const CANVAS = "#faf6ef";
const INK = "#26231c";
const INK_SECONDARY = "#5c564a";
const CLAY = "#b04a28";

const W = 1200;
const H = 630;

/* Fraunces / Newsreader / Fragment Mono are fetched by next/font at
   build time and never installed on the render host, so the card falls
   back through the same generic families the CSS stacks name. The card
   is a typographic object either way — it just sets in the host's best
   serif rather than the site's. */
const SERIF = "Newsreader, Georgia, 'Times New Roman', serif";
const DISPLAY = "Fraunces, Georgia, 'Times New Roman', serif";
const MONO = "'Fragment Mono', 'Courier New', ui-monospace, monospace";

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Greedy line-breaker. SVG has no auto-wrap, so the measure is enforced
 * here with a per-family average advance (serif ≈ 0.50em, mono ≈
 * 0.60em) — deliberately conservative, so a long word overhangs the
 * estimate rather than the frame.
 */
function wrap(text, { fontSize, width, advance = 0.5, maxLines = 3 }) {
  const perLine = Math.max(8, Math.floor(width / (fontSize * advance)));
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > perLine && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = candidate;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && line && lines[maxLines - 1] !== line) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[.,;:]$/, "")}…`;
  }
  return lines;
}

/**
 * One card: the site's paper, its double rule, and four registers —
 * kicker, title, deck, colophon. No imagery, no numbers.
 */
function cardSvg({ kicker, title, deck, folio }) {
  const titleSize = title.length > 26 ? 62 : 80;
  const titleLines = wrap(title, {
    fontSize: titleSize,
    width: 1000,
    advance: 0.52,
    maxLines: 2,
  });
  const deckLines = wrap(deck, {
    fontSize: 27,
    width: 940,
    advance: 0.49,
    maxLines: 3,
  });
  const titleTop = 250 - (titleLines.length - 1) * (titleSize * 0.52);
  const deckTop = titleTop + (titleLines.length - 1) * titleSize * 1.05 + 78;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${CANVAS}"/>
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="${INK}" stroke-opacity="0.28"/>
  <rect x="49" y="49" width="${W - 98}" height="${H - 98}" fill="none" stroke="${INK}" stroke-opacity="0.13"/>
  <text x="100" y="140" font-family="${MONO}" font-size="21" letter-spacing="1.05" fill="${INK_SECONDARY}">${escapeXml(kicker)}</text>
  <line x1="100" y1="166" x2="${W - 100}" y2="166" stroke="${INK}" stroke-opacity="0.2"/>
  ${titleLines
    .map(
      (line, i) =>
        `<text x="100" y="${titleTop + i * titleSize * 1.05}" font-family="${DISPLAY}" font-size="${titleSize}" fill="${INK}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  ${deckLines
    .map(
      (line, i) =>
        `<text x="100" y="${deckTop + i * 40}" font-family="${SERIF}" font-size="27" fill="${INK_SECONDARY}">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  <line x1="100" y1="${H - 118}" x2="${W - 100}" y2="${H - 118}" stroke="${INK}" stroke-opacity="0.2"/>
  <text x="100" y="${H - 84}" font-family="${MONO}" font-size="20" letter-spacing="0.9" fill="${INK}">ayush yadav — software · data · ml engineering</text>
  <text x="100" y="${H - 56}" font-family="${MONO}" font-size="18" letter-spacing="0.6" fill="${CLAY}">${escapeXml(folio)}</text>
</svg>`;
}

/* ── The data layer, read from source ─────────────────────────────── */

const personalSource = read("src/lib/data/personal.ts");
const projectsSource = read("src/lib/data/projects.ts");
const studiesSource = read("src/lib/data/projectCaseStudies.ts");

/* Scoped to the siteMetadata block: `description:` also appears on every
   award entry above it, and an unscoped match put a Dean's List citation
   on the home card. */
const siteMetadataBlock = personalSource.match(
  /export const siteMetadata = \{[\s\S]*?\n\};/
)?.[0];
const siteDescription = siteMetadataBlock
  ?.match(/description:\s*\n?\s*"([^"]+)"/)?.[1]
  ?.replace(/^Ayush Yadav's portfolio[:—-]\s*/, "");
if (!siteDescription) throw new Error("could not read siteMetadata.description");

/** projects.ts → { id: title } */
const projectTitles = new Map(
  Array.from(
    projectsSource.matchAll(/\n    id:\s*"([^"]+)",\n    title:\s*"([^"]+)"/g),
    (m) => [m[1], m[2]]
  )
);

/** projectCaseStudies.ts → one record per case file */
const studyBlocks = studiesSource.split(/\n  \{\n    projectId:/).slice(1);
const studies = studyBlocks.map((block) => {
  const projectId = block.match(/^\s*"([^"]+)"/)?.[1];
  const fileNo = Number(block.match(/fileNo:\s*(\d+)/)?.[1]);
  const summary = block
    .match(/\n    summary:\s*\n?\s*"((?:[^"\\]|\\.)*)"/)?.[1]
    ?.replace(/\\"/g, '"');
  return { projectId, fileNo, summary };
});
for (const study of studies) {
  if (!study.projectId || !study.fileNo || !study.summary) {
    throw new Error(`could not read case study ${study.projectId ?? "?"}`);
  }
}
const total = String(studies.length).padStart(2, "0");

/* ── The card set ─────────────────────────────────────────────────── */

const cards = [
  {
    file: "home.png",
    kicker: "¶ the portfolio — a working paper",
    title: "Ayush Yadav",
    deck: siteDescription,
    folio: "yadava5.github.io/portfolio-2.0",
  },
  {
    file: "evidence.png",
    kicker: `¶ the evidence index — every claim on file`,
    title: "The evidence index",
    deck: "The master ledger behind every number on this site: the claim, the strongest artifact it terminates at, when it was recorded, and the case-file receipt that argues it in full.",
    folio: "yadava5.github.io/portfolio-2.0/evidence",
  },
  ...studies.map((study) => ({
    file: `case-${study.projectId}.png`,
    kicker: `¶ case file ${String(study.fileNo).padStart(2, "0")} / ${total}`,
    title: projectTitles.get(study.projectId) ?? study.projectId,
    deck: study.summary,
    folio: `yadava5.github.io/portfolio-2.0/projects/${study.projectId}`,
  })),
];

if (CHECK_ONLY) {
  let failed = false;
  for (const card of cards) {
    const target = path.join(outDir, card.file);
    if (!fs.existsSync(target)) {
      console.error(`OG card check failed: missing public/og/${card.file}`);
      failed = true;
    }
  }
  if (failed) process.exit(1);
  console.log(`OG card check passed — ${cards.length} cards on file.`);
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });
for (const card of cards) {
  const svg = cardSvg(card);
  const target = path.join(outDir, card.file);
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true })
    .toFile(target);
  console.log(
    `${path.relative(root, target)} — ${(fs.statSync(target).size / 1024).toFixed(1)}KB`
  );
}
console.log(`Rendered ${cards.length} OG cards.`);
