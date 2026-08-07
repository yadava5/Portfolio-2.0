/**
 * RETIRED 2026-08-07. All four of this generator's outputs were deleted, and
 * running it would put them back.
 *
 * `jobtracker-architecture.svg`, `visual-assist-architecture.svg`,
 * `pipeline-architecture.svg` and `policybot-architecture.svg` were the
 * case files' appendix plates. They were retired for saying the same thing
 * twice: each restated its case file's `fig. 2`, which
 * `render-case-file.mjs` draws natively from the data layer's
 * `architecture` field, one section up the same page. They also drew in
 * `font-family="Inter"` — a face this site never loads, so they fell back
 * to Arial — over Tailwind slate on a near-black ground, on a page whose
 * paper is `#fbf3e7`.
 *
 * The body below is kept rather than deleted because it is the only record
 * of what those diagrams asserted, and two of its comments carry real
 * rulings — notably the desktop-era disclosure at the Applied entry, which
 * was correct and is the reason that plate said "the desktop path" at all.
 *
 * IF YOU ARE HERE TO RE-RENDER THEM, DO NOT. The archive's rule, written in
 * `scripts/archive/FIGURES.md`, is that a case file argues in its own hand
 * and attaches only what it cannot draw. It can draw these.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

if (!process.argv.includes("--i-know-these-are-retired")) {
  console.error(
    "render-architecture-diagrams: RETIRED 2026-08-07 — refusing to run.\n" +
      "  Its four outputs were deleted deliberately: each restated its case file's\n" +
      "  fig. 2, which the archive draws natively, and all four drew in Inter over\n" +
      "  Tailwind slate on a cream page. Re-rendering them undoes a ruling.\n" +
      "  The reasoning is in scripts/archive/FIGURES.md and in the artifacts\n" +
      "  comments in src/lib/data/projectCaseStudies.ts."
  );
  process.exit(1);
}

const root = process.cwd();
const outputDir = path.join(root, "public", "images", "projects");

const diagrams = [
  {
    file: "jobtracker-architecture.svg",
    /* The DESKTOP path, and the title now says so. This diagram draws
       SQLite and SwiftUI, which is a real tree in the repo and not the
       hosted product — Applied ships Postgres behind FastAPI behind
       Next.js, which is what the case file's own architecture block
       draws beside it. The case-file plate already carried a boundary
       row saying this; `projects.ts` uses the same file as the project
       card with NO boundary text, so a reader met SQLite/SwiftUI with
       nothing telling them which era they were looking at. An image that
       travels between call sites has to carry its own disclosure.
       (2026-08-02 provenance audit.) */
    title: "JobTracker — the desktop path (2026-02 era)",
    subtitle:
      "Gmail + iCloud mail -> local classifier -> SQLite pipeline -> SwiftUI dashboard; the hosted app runs rules only, on Postgres",
    accent: "#10b981",
    nodes: [
      ["Gmail OAuth2", "iCloud IMAP", "Async sync"],
      ["Rules", "Embeddings", "SetFit"],
      ["SQLite", "Application events", "Audit state"],
      ["SwiftUI", "Pipeline board", "Local dashboard"],
    ],
  },
  {
    file: "visual-assist-architecture.svg",
    title: "Visual Assist On-Device Flow",
    subtitle:
      "LiDAR, ARKit, and Vision signals become speech, haptics, and VoiceOver-first guidance",
    accent: "#60a5fa",
    nodes: [
      ["LiDAR", "ARKit", "Depth signals"],
      ["Vision OCR", "Human rectangles", "Animal recognition"],
      ["Speech", "Haptics", "Voice commands"],
      ["SwiftUI", "VoiceOver", "Accessible modes"],
    ],
  },
  {
    file: "pipeline-architecture.svg",
    title: "Master Inventory Pipeline",
    subtitle:
      "Tableau metadata and Workday exports become deterministic inventory records and audit artifacts",
    accent: "#f59e0b",
    nodes: [
      ["Tableau REST", "Workday export", "Source snapshots"],
      ["Python", "pandas", "Normalization"],
      ["Deterministic IDs", "Master inventory", "Validation checks"],
      ["Tableau Prep", "Dashboards", "Run artifacts"],
    ],
  },
  {
    file: "policybot-architecture.svg",
    title: "PolicyBot Retrieval Flow",
    subtitle:
      "Policy documents are indexed, retrieved, quote-validated, and delivered through Slack",
    accent: "#a78bfa",
    nodes: [
      ["DOCX", "PDF", "Markdown"],
      ["OpenAI File Search", "Retrieval", "Candidate citations"],
      ["Local quote validation", "Fallback checks", "Grounding"],
      ["Slack Socket Mode", "Cited answer", "User workflow"],
    ],
  },
];

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderDiagram(diagram) {
  const columns = diagram.nodes
    .map((items, index) => {
      const x = 72 + index * 315;
      const chips = items
        .map((item, itemIndex) => {
          const y = 305 + itemIndex * 74;
          return `
            <rect x="${x + 24}" y="${y}" width="210" height="44" rx="10" fill="#111827" stroke="${diagram.accent}" stroke-opacity="0.42"/>
            <text x="${x + 129}" y="${y + 28}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="18" fill="#e5e7eb">${escapeXml(item)}</text>
          `;
        })
        .join("");

      const connector =
        index < diagram.nodes.length - 1
          ? `<path d="M ${x + 260} 406 C ${x + 300} 406, ${x + 302} 406, ${x + 315} 406" stroke="${diagram.accent}" stroke-width="4" stroke-linecap="round" fill="none"/>
             <path d="M ${x + 315} 406 l -14 -8 l 0 16 z" fill="${diagram.accent}"/>`
          : "";

      return `
        <g>
          <rect x="${x}" y="246" width="260" height="308" rx="18" fill="#030712" stroke="#334155"/>
          <text x="${x + 130}" y="282" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="16" fill="${diagram.accent}" font-weight="700">STEP ${index + 1}</text>
          ${chips}
          ${connector}
        </g>
      `;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1376" height="768" viewBox="0 0 1376 768" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(diagram.title)}</title>
  <desc id="desc">${escapeXml(diagram.subtitle)}</desc>
  <rect width="1376" height="768" fill="#020617"/>
  <rect x="32" y="32" width="1312" height="704" rx="28" fill="#07111f" stroke="#1f2937"/>
  <circle cx="1170" cy="134" r="132" fill="${diagram.accent}" opacity="0.12"/>
  <circle cx="196" cy="646" r="164" fill="${diagram.accent}" opacity="0.08"/>
  <text x="72" y="118" font-family="Inter, Arial, sans-serif" font-size="46" font-weight="800" fill="#f8fafc">${escapeXml(diagram.title)}</text>
  <text x="72" y="166" font-family="Inter, Arial, sans-serif" font-size="22" fill="#94a3b8">${escapeXml(diagram.subtitle)}</text>
  <line x1="72" y1="206" x2="1304" y2="206" stroke="#1f2937"/>
  ${columns}
  <text x="72" y="672" font-family="Inter, Arial, sans-serif" font-size="18" fill="#94a3b8">Portfolio proof asset: architecture diagram generated from audited repository evidence, not a product screenshot.</text>
</svg>`;
}

await mkdir(outputDir, { recursive: true });

for (const diagram of diagrams) {
  const target = path.join(outputDir, diagram.file);
  await writeFile(target, renderDiagram(diagram), "utf8");
  console.log(`rendered ${target}`);
}
