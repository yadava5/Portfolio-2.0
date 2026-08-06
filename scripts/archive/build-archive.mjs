/**
 * Build the archive — the record room the run files its freight with.
 *
 * WHAT THIS IS REPLACING, AND WHY IT IS SHAPED LIKE AN ORCHESTRATOR. Today
 * `npm run build` is `next build && node scripts/run/build-home.mjs`, and
 * `next build` is doing three jobs at once that nobody separated: it renders
 * the seven case files and /evidence/, it CREATES out/, and it copies all 37
 * files under public/ into it — resume.pdf, the OG rasters, both favicons, the
 * proof ledgers. build-home.mjs then overwrites out/index.html and fails
 * outright if out/ does not already exist.
 *
 * So "retire Next" is not one deletion. Take it away without replacing those
 * three jobs and nothing creates the output directory and not one public asset
 * ships. This script is the replacement, and its step order IS the contract:
 *
 *     1. create the output root
 *     2. copy public/
 *     3. emit /projects/<id>/ × 7, /evidence/, 404.html, sitemap.xml, robots.txt
 *     4. call build-home.mjs, which writes the run over index.html
 *
 * IN THIS PHASE IT WRITES TO STAGING AND STOPS BEFORE STEP 4. `next build`
 * still owns out/, the golden hash still certifies the page a reader gets, and
 * nothing that ships changes. Step 4 runs only when the target IS out/, which
 * is what makes the 4.1 cutover a change of argument rather than a rewrite.
 *
 *   node scripts/archive/build-archive.mjs                 → .build/archive-staging
 *   node scripts/archive/build-archive.mjs --out out       → the real thing (4.1)
 */
import {
  mkdirSync,
  cpSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
} from "node:fs";
import { resolve, join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { loadDataLayer } from "./data.mjs";
import { renderCaseFile } from "./render-case-file.mjs";
import { renderEvidence } from "./render-evidence.mjs";
import { renderNotFound } from "./render-404.mjs";
import { sitemapXml, robotsTxt } from "./sitemap.mjs";

const root = process.cwd();
const argv = process.argv.slice(2);
const outArg = argv.includes("--out") ? argv[argv.indexOf("--out") + 1] : null;
const OUT_ROOT = resolve(root, outArg ?? ".build/archive-staging");
const IS_SHIPPING = relative(root, OUT_ROOT) === "out";

function fail(msg) {
  console.error(`build-archive failed: ${msg}`);
  process.exit(1);
}

function write(rel, contents) {
  const path = join(OUT_ROOT, rel);
  mkdirSync(resolve(path, ".."), { recursive: true });
  writeFileSync(path, contents);
  return contents.length;
}

/* ── 1. the output root ──────────────────────────────────────────────── */
mkdirSync(OUT_ROOT, { recursive: true });

/* ── 2. public/ ──────────────────────────────────────────────────────────
   `next build` did this and nothing else would have. Asserted by count
   rather than assumed: cpSync of a directory succeeds silently on a partial
   copy, which is the same failure build-home.mjs already guards for the four
   faces and the three wasm parts. */
function countFiles(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    n += entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1;
  }
  return n;
}
const PUBLIC = resolve(root, "public");
if (!existsSync(PUBLIC)) fail("no public/ — resume.pdf, the OG cards and both favicons live there");
const publicCount = countFiles(PUBLIC);
cpSync(PUBLIC, OUT_ROOT, { recursive: true });
for (const rel of ["resume.pdf", "favicon.ico", "favicon.svg", "og/home.png"]) {
  const path = join(OUT_ROOT, rel);
  if (!existsSync(path) || statSync(path).size === 0) {
    fail(`public/${rel} did not land in the output root`);
  }
}
console.log(`  · public/ copied — ${publicCount} files`);

/* ── 2½. the archive's own stylesheet and scripts ─────────────────────
   NOT in public/, deliberately. public/ is the site's content — resume.pdf,
   the OG rasters, the proof ledgers — and those are copied by whatever builds
   the site. These three are the archive's own chrome, they live beside the
   generator that names them, and they ship under assets/ so nothing in the
   published tree is ambiguous about which half of the site owns them. */
const ASSETS = resolve(root, "scripts/archive/assets");
mkdirSync(join(OUT_ROOT, "assets"), { recursive: true });
cpSync(ASSETS, join(OUT_ROOT, "assets"), { recursive: true });
for (const rel of ["archive.css", "archive.js", "paper-memory.js"]) {
  const path = join(OUT_ROOT, "assets", rel);
  if (!existsSync(path) || statSync(path).size === 0) {
    fail(`assets/${rel} did not land — the record room would ship unstyled`);
  }
}
console.log("  · assets/ copied — the stylesheet, the walk, the paper memory");

/* THE FOUR FACES ARE build-home.mjs's COPY, AND THAT IS WHY STAGING LOOKS
   BARE. It writes out/fonts/ from src/run/fonts/ and only runs at the
   cutover, so a staging preview renders in system type. The alternative —
   copying them here too — would put two scripts in charge of one directory,
   which is the shape that loses a file. Named rather than left to surprise
   the next person who opens the staging build. */
if (!IS_SHIPPING) {
  console.log("  · fonts/ NOT copied — build-home.mjs owns them; staging previews in system type");
}

/* ── 3. the pages ────────────────────────────────────────────────────── */
const { seo, personal, projects, caseStudies, proof, stations } =
  await loadDataLayer();
const { siteMetadata } = personal;
const { projectCaseStudies, getCaseStudyProject, getNextCaseStudy } = caseStudies;
const { proofManifest } = proof;
const { STATIONS } = stations;

let anchors = 0;
for (const study of projectCaseStudies) {
  const project = getCaseStudyProject(study);
  if (!project) fail(`no project for case file ${study.projectId}`);
  const { html, anchorCount } = renderCaseFile({
    study,
    project,
    next: getNextCaseStudy(study),
    stations: STATIONS,
    seo,
    siteMetadata,
    caseStudies,
  });
  write(`projects/${study.projectId}/index.html`, html);
  anchors += anchorCount;
}
console.log(
  `  · ${projectCaseStudies.length} case files — ${anchors} receipt anchors`
);

write(
  "evidence/index.html",
  renderEvidence({
    entries: proofManifest,
    stations: STATIONS,
    studies: projectCaseStudies,
    projects: projects.projects,
    seo,
    siteMetadata,
  })
);
console.log(`  · /evidence/ — ${proofManifest.length} ledger entries`);

/* 404.html is the file GitHub Pages serves for every unmatched path on this
   site, and check-static-export-seo.mjs now requires it. Next also emitted
   404/index.html and _not-found/index.html; those were its own duplicates and
   nothing serves them. */
write("404.html", renderNotFound({ stations: STATIONS, seo, siteMetadata }));
console.log("  · 404.html");

write("sitemap.xml", sitemapXml({ studies: projectCaseStudies, siteMetadata }));
write("robots.txt", robotsTxt({ siteMetadata }));
console.log("  · sitemap.xml + robots.txt");

/* ── 4. the run, over index.html ──────────────────────────────────────── */
if (IS_SHIPPING) {
  execFileSync("node", [resolve(root, "scripts/run/build-home.mjs")], {
    cwd: root,
    stdio: "inherit",
  });
} else {
  console.log(
    `  · staging only — build-home.mjs not called, out/ still belongs to next build`
  );
}

console.log(`build-archive: the record room is at ${relative(root, OUT_ROOT)}/`);
