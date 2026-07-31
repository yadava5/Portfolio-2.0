/**
 * The served résumé must be the real one, and must agree with the site.
 *
 * WHY THIS WAS REWRITTEN. Until 2026-07-30 this file asserted a list of
 * phrases hard-coded from one snapshot of one PDF — "3.47 overall GPA",
 * "Fast MNIST", "Visual Assist", "97%+" — and forbade "Major GPA". The
 * résumé moved on and the PDF did not, so the check went on certifying a
 * document from 16 July: a different email (yadava5@miamioh.edu, while
 * every rendered surface and the gate's own mailto say
 * aesh.03.23@gmail.com), a different GPA line, and a project set naming
 * JobTracker, Fast MNIST and Visual Assist while the site presents
 * Applied, Glyph, Cadence and jetpack. The gate did not merely miss this.
 * It REQUIRED it: the real résumé says "Major GPA 3.65", which was on the
 * forbidden list, and lacks three phrases that were required. The green
 * "📄 Resume Parser Check" on PR #30 was certifying the wrong file.
 *
 * A phrase list pinned to a snapshot cannot catch a snapshot going stale;
 * it is the mechanism that caused this. So the checks are now split by
 * where each fact actually lives:
 *
 *   1. CROSS-CHECKED against src/lib/data/personal.ts — email, LinkedIn,
 *      GitHub, graduation. These are the facts that diverged, and reading
 *      them from the data layer makes PDF-vs-site disagreement structurally
 *      impossible rather than merely noticed. If the site changes its
 *      email again, this fails until the PDF follows.
 *   2. STRUCTURAL invariants — one page, embedded fonts, extractable text,
 *      real bullets, no glued words, bounded bottom whitespace. True of any
 *      correct résumé, so they never need editing.
 *   3. The LLM-TELL forbid list, kept as it was. It guards a different
 *      failure mode (a résumé written to sound like a model wrote it) and
 *      it has not rotted.
 *
 * Nothing here asserts a specific project, employer or number. Those change
 * every time the owner edits the document, and a gate that must be edited
 * alongside the thing it guards is not guarding it.
 *
 * Verified BOTH WAYS, which is the only version of this that means
 * anything: it passes on the 2026-07-30 résumé and FAILS on the 16 July one
 * it replaced. Three guards in this repo have already passed for the wrong
 * reason, so "the new checker passes on the new file" is not evidence.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const pdfPath = resolve(process.cwd(), process.argv[2] ?? "public/resume.pdf");
const layoutTextPath = "/tmp/portfolio-resume-layout.txt";
const rawTextPath = "/tmp/portfolio-resume-raw.txt";
const densityImagePrefix = "/tmp/portfolio-resume-density";
const densityImagePath = `${densityImagePrefix}.png`;

function run(command, args) {
  return execFileSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/* ————— 1 · the facts the site also states ————— */

/* Read as source text rather than imported: this file is plain node, and
   personal.ts is TypeScript with `@/` path aliases. The strings are what
   matter, and a regex over the declaration is enough to bind them. */
const personal = readFileSync(
  resolve(process.cwd(), "src/lib/data/personal.ts"),
  "utf8"
);

function fromPersonal(pattern, label) {
  const m = personal.match(pattern);
  assert(
    m,
    `Could not read ${label} from personal.ts — has the shape changed?`
  );
  return m[1];
}

const siteEmail = fromPersonal(/\bemail:\s*"([^"]+)"/, "email");

/* LinkedIn and GitHub live in the socialLinks array as { name, url },
   so bind them by NAME rather than by position — the array's order is
   not a contract, and matching the first url would silently follow a
   reorder. */
function fromSocial(name) {
  return fromPersonal(
    new RegExp(`name:\\s*"${name}"[\\s\\S]{0,120}?url:\\s*"([^"]+)"`),
    `${name} URL`
  );
}
const siteLinkedIn = fromSocial("LinkedIn");
const siteGithub = fromSocial("GitHub");

/* ————— 2 · structure ————— */

const info = run("pdfinfo", [pdfPath]);
assert(/\bPages:\s+1\b/.test(info), "resume.pdf must remain exactly one page");

/* The old assertion matched a list of font NAMES (Times|Arial|…), which
   was only ever a proxy for "this is real text, not a scan" — and it
   rejected the real résumé, whose LibreOffice build embeds Carlito. Assert
   the property instead: pdffonts prints an `emb` column, and every face
   must be embedded or a parser on another machine renders the wrong
   glyphs. A name list re-pins to a new snapshot; this does not. */
const fonts = run("pdffonts", [pdfPath]);
const fontRows = fonts
  .split("\n")
  .slice(2)
  .map((line) => line.trim())
  .filter(Boolean);
assert(fontRows.length > 0, "resume.pdf exposes no fonts — is it a scan?");
for (const row of fontRows) {
  const cols = row.split(/\s+/);
  const emb = cols[cols.length - 4];
  assert(emb === "yes", `resume.pdf has a non-embedded font: ${cols[0]}`);
}

const layoutText = run("pdftotext", ["-layout", pdfPath, "-"]);
const rawText = run("pdftotext", ["-raw", pdfPath, "-"]);

writeFileSync(layoutTextPath, layoutText);
writeFileSync(rawTextPath, rawText);

assert(
  layoutText.trim().length > 1500,
  `resume.pdf yields only ${layoutText.trim().length} characters of text — a parser would read almost nothing`
);

/* ————— 3 · the résumé and the site must agree ————— */

const contactChecks = [
  [siteEmail, "email", "src/lib/data/personal.ts"],
  [
    siteLinkedIn.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
    "LinkedIn",
    "personal.ts",
  ],
  [
    siteGithub.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
    "GitHub",
    "personal.ts",
  ],
];

for (const [value, label, where] of contactChecks) {
  assert(
    layoutText.includes(value),
    `resume.pdf does not carry the ${label} the site publishes (${value}, from ${where}). ` +
      `A recruiter who downloads the résumé would get a different ${label} than the page shows.`
  );
}

/* Graduation: personal.ts states it as an ISO month; the résumé writes it
   in prose. Bind the two by rendering the ISO value the way a résumé
   would, so a change to either side is caught. */
const gradIso = fromPersonal(
  /school:\s*"Miami University"[\s\S]*?endDate:\s*"(\d{4}-\d{2})"/,
  "graduation date"
);
const [gradYear, gradMonth] = gradIso.split("-");
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const gradProse = `${MONTHS[Number(gradMonth) - 1]} ${gradYear}`;
assert(
  layoutText.includes(gradProse),
  `resume.pdf does not state the graduation the site states (${gradProse}, from personal.ts endDate ${gradIso})`
);

assert(layoutText.includes("Ayush Yadav"), "resume.pdf must carry the name");

/* ————— 4 · tells and extraction damage ————— */

const forbiddenPhrases = [
  "Expected May 2026",
  "Senior CS student",
  "AI expert",
  "AI-native",
  "Codex",
  "Claude",
  "ATS optimized",
  "AI optimized",
];

const gluedPatterns = [
  /anAutoML/,
  /VisualAssist/,
  /StudentAssociate/,
  /externalAPIs/,
  /JavaScript\/TypeScriptReact/,
  /GPA\d/,
];

for (const phrase of forbiddenPhrases) {
  assert(
    !layoutText.includes(phrase),
    `Forbidden resume phrase present: ${phrase}`
  );
}

for (const pattern of gluedPatterns) {
  assert(
    !pattern.test(rawText),
    `Raw resume extraction contains glued text: ${pattern}`
  );
}

assert(
  /[-•·]\s/.test(rawText),
  "Raw resume extraction should include real text bullets"
);

/* ————— 5 · the page is used ————— */

run("pdftoppm", [
  "-png",
  "-singlefile",
  "-r",
  "144",
  pdfPath,
  densityImagePrefix,
]);

const { default: sharp } = await import("sharp");
const { data, info: imageInfo } = await sharp(densityImagePath)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

let bottom = -1;
for (let y = 0; y < imageInfo.height; y++) {
  for (let x = 0; x < imageInfo.width; x++) {
    const i = (y * imageInfo.width + x) * imageInfo.channels;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (r < 245 || g < 245 || b < 245) {
      bottom = y;
    }
  }
}

const bottomWhitespacePx = imageInfo.height - 1 - bottom;
const bottomWhitespacePercent = bottomWhitespacePx / imageInfo.height;

/* Threshold unchanged, and measured rather than assumed before the swap:
   the 16 July PDF sat at 4.36% and the 2026-07-30 one sits at 3.98%, so
   the new document is TIGHTER than the one this gate was calibrated
   against. Loosening a threshold to admit a file you have just added is
   how a guard becomes decoration; there was no need. */
assert(
  bottomWhitespacePercent <= 0.048,
  `Resume bottom whitespace is too large: ${bottomWhitespacePx}px (${(
    bottomWhitespacePercent * 100
  ).toFixed(2)}%)`
);

console.log(`Resume parser check passed: ${pdfPath}`);
console.log(
  `Agrees with the site on: ${siteEmail} · ${siteLinkedIn} · ${siteGithub} · ${gradProse}`
);
console.log(`Layout text: ${layoutTextPath}`);
console.log(`Raw text: ${rawTextPath}`);
console.log(
  `Bottom whitespace: ${bottomWhitespacePx}px (${(
    bottomWhitespacePercent * 100
  ).toFixed(2)}%)`
);
