import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const pdfPath = resolve(process.cwd(), "public/resume.pdf");
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

const info = run("pdfinfo", [pdfPath]);
assert(/\bPages:\s+1\b/.test(info), "resume.pdf must remain exactly one page");

const fonts = run("pdffonts", [pdfPath]);
assert(
  /Times|Liberation|Arial|Helvetica|Nimbus|DejaVu/i.test(fonts),
  "resume.pdf should expose embedded text fonts"
);

const layoutText = run("pdftotext", ["-layout", pdfPath, "-"]);
const rawText = run("pdftotext", ["-raw", pdfPath, "-"]);

writeFileSync(layoutTextPath, layoutText);
writeFileSync(rawTextPath, rawText);

const requiredPhrases = [
  "Ayush Yadav",
  "Computer Science graduate",
  "May 2026",
  "Technical Skills",
  "Projects",
  "Experience",
  "ITSM Data Integration Student Associate",
  "Jun 2025 - May 2026",
  "Agentic AutoML",
  "OpenAI Responses API",
  "LangGraph",
  "MCP",
  "Visual Assist",
  "Fast MNIST",
  "97%+",
];

const forbiddenPhrases = [
  "Expected May 2026",
  "Jun 2025 - Present",
  "Senior CS student",
  "AI expert",
  "AI-native",
  "Codex",
  "Claude",
  "ATS optimized",
  "AI optimized",
];

const gluedPatterns = [
  /GPA3\.46/,
  /anAutoML/,
  /VisualAssist/,
  /StudentAssociate/,
  /externalAPIs/,
  /JavaScript\/TypeScriptReact/,
];

for (const phrase of requiredPhrases) {
  assert(
    layoutText.includes(phrase),
    `Missing required resume phrase: ${phrase}`
  );
}

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
  rawText.includes("- "),
  "Raw resume extraction should include real text bullets"
);

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

assert(
  bottomWhitespacePercent <= 0.048,
  `Resume bottom whitespace is too large: ${bottomWhitespacePx}px (${(
    bottomWhitespacePercent * 100
  ).toFixed(2)}%)`
);

console.log(`Resume parser check passed: ${pdfPath}`);
console.log(`Layout text: ${layoutTextPath}`);
console.log(`Raw text: ${rawTextPath}`);
console.log(
  `Bottom whitespace: ${bottomWhitespacePx}px (${(
    bottomWhitespacePercent * 100
  ).toFixed(2)}%)`
);
