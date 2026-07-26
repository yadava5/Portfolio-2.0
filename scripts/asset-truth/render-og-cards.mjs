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
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public", "og");
const manifestPath = path.join(outDir, "cards.manifest.json");
const CHECK_ONLY = process.argv.includes("--check");

const sha256 = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

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
function wrapLines(text, { fontSize, width, advance = 0.5 }) {
  const perLine = Math.max(8, Math.floor(width / (fontSize * advance)));
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > perLine && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Split prose into whole sentences. The terminator must be followed by
 * whitespace or the end of the string, so `35-field` and a version like
 * `2.0` are never mistaken for a sentence end.
 */
function sentences(text) {
  const parts = text.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g);
  return parts?.map((part) => part.trim()).filter(Boolean) ?? [text];
}

/**
 * The deck, fitted to three lines WITHOUT a mid-sentence cut.
 *
 * This used to be `wrap(..., maxLines: 3)`, which filled three lines from
 * the summary and replaced the tail with an ellipsis wherever it landed.
 * Four of the seven case decks landed mid-clause, and the two whose
 * summaries had been rewritten since their last render shipped sentences
 * that stop in the middle of a thought — "It shipped twice: first…" is a
 * worse card than one that simply says less.
 *
 * So the deck is now a whole-sentence PREFIX of the summary: as many
 * complete sentences as three lines hold, and never a fragment. Nothing
 * is rewritten, paraphrased, or invented for the card — every word on it
 * is a word the case file already prints. Where a single sentence is too
 * long for three lines at the deck's 27px, the type steps down (25, then
 * 23) rather than the sentence being cut; if even one sentence cannot be
 * set whole at the smallest step, the render FAILS instead of quietly
 * drawing a fragment, because a drawn asset can only be wrong quietly.
 */
const DECK_SIZES = [27, 25, 23];

function fitDeck(text, { width = 940, advance = 0.49, maxLines = 3 } = {}) {
  const parts = sentences(text);
  for (const fontSize of DECK_SIZES) {
    for (let count = parts.length; count >= 1; count--) {
      const candidate = parts.slice(0, count).join(" ");
      const lines = wrapLines(candidate, { fontSize, width, advance });
      if (lines.length <= maxLines) return { fontSize, lines };
    }
  }
  throw new Error(
    `OG deck cannot be set whole: the first sentence of "${text.slice(0, 60)}…" ` +
      `overruns ${maxLines} lines even at ${DECK_SIZES.at(-1)}px. ` +
      `Shorten the first sentence in the data layer.`
  );
}

/**
 * One card: the site's paper, its double rule, and four registers —
 * kicker, title, deck, colophon. No imagery, no numbers.
 */
function cardSvg({ kicker, title, deck, folio }) {
  const titleSize = title.length > 26 ? 62 : 80;
  const titleLines = wrapLines(title, {
    fontSize: titleSize,
    width: 1000,
    advance: 0.52,
  });
  if (titleLines.length > 2) {
    throw new Error(`OG title overruns two lines: "${title}"`);
  }
  const deck_ = fitDeck(deck);
  const deckLines = deck_.lines;
  const deckSize = deck_.fontSize;
  const deckStep = Math.round(deckSize * 1.481);
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
        `<text x="100" y="${deckTop + i * deckStep}" font-family="${SERIF}" font-size="${deckSize}" fill="${INK_SECONDARY}">${escapeXml(line)}</text>`
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
/* The deck drops the description's opening self-reference: the card
   already sets "Ayush Yadav" as its title in 80px display, so keeping
   the prefix would print the name twice, 90px apart (the F30 echo).

   BOTH apostrophes, and this is not defensive padding — fix round 4
   turned the source's `'` into a `’` and this line, written for the
   straight one, silently stopped matching. Nothing failed: the card
   rendered, the `--check` gate passed (it verifies a card EXISTS and is
   correctly folioed, not what it says), and the home card would have
   shipped with its title repeated in its own deck. A drawn asset can
   only be wrong quietly, so the match has to survive the typography. */
const siteDescription = siteMetadataBlock
  ?.match(/description:\s*\n?\s*"([^"]+)"/)?.[1]
  ?.replace(/^Ayush Yadav[’']s portfolio[:—-]\s*/, "");
if (!siteDescription)
  throw new Error("could not read siteMetadata.description");

/**
 * The colophon URL, DERIVED — never typed (certification round, N1).
 *
 * The three folio lines below used to be hand-written string literals,
 * and all three spelled the repository segment in lower case against a
 * repository named `Portfolio-2.0`. GitHub Pages serves case-sensitive
 * paths, so the one URL on this whole site that a reader cannot click —
 * it is DRAWN into a PNG, so it can only be retyped — was the one URL
 * that 404s. Every canonical, every `<loc>`, and every `og:url` carried
 * the correct spelling at the same time.
 *
 * It now comes off `siteMetadata.url`, the same constant those three
 * agree with, so the card's footer cannot disagree with the site's own
 * address again. scripts/qa/check-static-export-seo.mjs asserts the
 * casing independently, and fails on the lowercase variant.
 */
const siteUrl = siteMetadataBlock?.match(/url:\s*"([^"]+)"/)?.[1];
if (!siteUrl) throw new Error("could not read siteMetadata.url");
const FOLIO_ROOT = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

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
    folio: FOLIO_ROOT,
  },
  {
    file: "evidence.png",
    kicker: `¶ the evidence index — every claim on file`,
    title: "The evidence index",
    deck: "The master ledger behind every number on this site: the claim, the strongest artifact it terminates at, when it was recorded, and the case-file receipt that argues it in full.",
    folio: `${FOLIO_ROOT}/evidence`,
  },
  ...studies.map((study) => ({
    file: `case-${study.projectId}.png`,
    kicker: `¶ case file ${String(study.fileNo).padStart(2, "0")} / ${total}`,
    title: projectTitles.get(study.projectId) ?? study.projectId,
    deck: study.summary,
    folio: `${FOLIO_ROOT}/projects/${study.projectId}`,
  })),
];

/* ── The drift gate ───────────────────────────────────────────────────
   This gate used to check that a card EXISTED and was correctly folioed.
   Both of those can be true of a card drawn from data nobody has read in
   months, and that is exactly how two cards went stale in silence:
   `case-jobtracker.png` and `case-taskflow-calendar.png` were drawn from
   summaries that were later rewritten, so the bytes on disk argued a
   version of those case files the site no longer ships. Nothing failed,
   because nothing was comparing the card to its source.

   It now compares both halves, through a manifest written by the render:

     svg — sha256 of the card's SVG, recomputed from the data layer on
           every check. If a summary, a title, a fileNo or the site's
           description changes and the cards are not re-rendered, this
           hash moves and the gate fails. This is the DRIFT check.
     png — sha256 of the committed raster. If the file is replaced,
           truncated, or optimized by something other than this script,
           this hash moves and the gate fails.

   The SVG hash is compared rather than a fresh raster because
   rasterization is host-dependent (the card falls back through whatever
   serif the render host has). The content a card DRAWS is deterministic;
   the pixels it lands on are not. Comparing the drawn content on every
   host, and the committed bytes against the host that drew them, is the
   strongest honest pair. */

function cardHashes(card) {
  return { svg: sha256(cardSvg(card)) };
}

if (CHECK_ONLY) {
  let failed = false;
  const fail = (message) => {
    console.error(`OG card check failed: ${message}`);
    failed = true;
  };

  let manifest = null;
  if (!fs.existsSync(manifestPath)) {
    fail(
      "missing public/og/cards.manifest.json — run `npm run assets:render-og`"
    );
  } else {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch (error) {
      fail(`public/og/cards.manifest.json is not readable JSON (${error})`);
    }
  }

  for (const card of cards) {
    const target = path.join(outDir, card.file);
    if (!fs.existsSync(target)) {
      fail(`missing public/og/${card.file}`);
      continue;
    }
    /* N1: the drawn footer must be the site's own address, character for
       character. A lowercase repository segment resolves for nobody. */
    if (!card.folio.startsWith(FOLIO_ROOT)) {
      fail(`${card.file} folio "${card.folio}" is not under ${FOLIO_ROOT}`);
    }

    const recorded = manifest?.cards?.[card.file];
    if (!recorded) {
      if (manifest) fail(`${card.file} has no entry in cards.manifest.json`);
      continue;
    }
    const { svg } = cardHashes(card);
    if (recorded.svg !== svg) {
      fail(
        `${card.file} is STALE — the data layer has moved since it was drawn ` +
          `(card content ${recorded.svg.slice(0, 12)} → ${svg.slice(0, 12)}). ` +
          `Run \`npm run assets:render-og\` and commit the result.`
      );
    }
    const png = sha256(fs.readFileSync(target));
    if (recorded.png !== png) {
      fail(
        `${card.file} bytes do not match the manifest ` +
          `(${recorded.png.slice(0, 12)} → ${png.slice(0, 12)}) — ` +
          `the file was changed by something other than the renderer.`
      );
    }
  }

  const known = new Set(cards.map((card) => card.file));
  for (const file of Object.keys(manifest?.cards ?? {})) {
    if (!known.has(file)) {
      fail(`cards.manifest.json lists ${file}, which no route claims`);
    }
  }

  if (failed) process.exit(1);
  console.log(
    `OG card check passed — ${cards.length} cards on file, all folioed ` +
      `${FOLIO_ROOT}, all drawn from the current data layer.`
  );
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });
const manifestCards = {};
for (const card of cards) {
  const svg = cardSvg(card);
  const target = path.join(outDir, card.file);
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9, palette: true })
    .toFile(target);
  manifestCards[card.file] = {
    svg: sha256(svg),
    png: sha256(fs.readFileSync(target)),
  };
  console.log(
    `${path.relative(root, target)} — ${(fs.statSync(target).size / 1024).toFixed(1)}KB`
  );
}
/* No timestamp: a manifest that churns on every render is a manifest
   nobody reviews. Sorted keys so the diff is the drift and nothing else. */
fs.writeFileSync(
  manifestPath,
  `${JSON.stringify(
    {
      note: "Written by scripts/asset-truth/render-og-cards.mjs. `npm run assets:check-og` fails when a card's content hash no longer matches the data layer.",
      cards: Object.fromEntries(
        Object.keys(manifestCards)
          .sort()
          .map((file) => [file, manifestCards[file]])
      ),
    },
    null,
    2
  )}\n`
);
console.log(
  `Rendered ${cards.length} OG cards + public/og/cards.manifest.json.`
);
