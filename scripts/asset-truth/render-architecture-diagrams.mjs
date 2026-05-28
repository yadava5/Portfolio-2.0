import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "public", "images", "projects");

const diagrams = [
  {
    file: "jobtracker-architecture.svg",
    title: "JobTracker Local Classification",
    subtitle:
      "Gmail + iCloud mail -> local classifier -> SQLite pipeline -> SwiftUI dashboard",
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
