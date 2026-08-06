/**
 * Build the site — the record room the run files its freight with, and the
 * run itself over the top of it.
 *
 * WHAT THIS REPLACED, AND WHY IT IS SHAPED LIKE AN ORCHESTRATOR. Until Phase 4
 * `npm run build` was `next build && node scripts/run/build-home.mjs`, and
 * `next build` was doing three jobs at once that nobody had separated: it
 * rendered the seven case files and /evidence/, it CREATED out/, and it copied
 * all 37 files under public/ into it — resume.pdf, the OG rasters, both
 * favicons, the proof ledgers. build-home.mjs then overwrote out/index.html
 * and failed outright if out/ did not already exist.
 *
 * So "retire Next" was never one deletion. Take it away without replacing
 * those three jobs and nothing creates the output directory and not one public
 * asset ships. This script is the replacement, and its step order IS the
 * contract:
 *
 *     0. load the data layer — before anything on disk is touched
 *     1. create the output root
 *     2. copy public/
 *     3. emit /projects/<id>/ × 7, /evidence/, 404.html, sitemap.xml, robots.txt
 *     4. call build-home.mjs, which writes the run over index.html
 *     5. swap the finished root into place, atomically
 *
 * THE BUILD IS ASSEMBLED IN A SCRATCH DIRECTORY AND MOVED IN AT THE END, and
 * that is not tidiness. `next build` wiped out/ on every run; this script has
 * to as well, or the flip leaves the retired app's RSC payloads, its
 * /world-preview/ route, its _next/ chunks and a 36 KB tsbuildinfo shipping
 * forever beside a page whose whole argument is that nothing unreachable rides
 * along. But a wipe-then-write build has a window — several seconds of
 * rendering — in which a failure leaves the directory a reader is being served
 * half-built. Assembling beside it and renaming closes that window to one
 * syscall, and the failure mode becomes "the previous build survives", which
 * is the correct one.
 *
 *   node scripts/archive/build-archive.mjs                    → out/
 *   node scripts/archive/build-archive.mjs --out <dir>        → a full second copy
 *
 * The second form emits the WHOLE site, run included, somewhere else. It is
 * what the gate proofs use: a doctored copy to make a check fail in, so that
 * no negative test is ever run against the directory being served.
 */
import {
  mkdirSync,
  cpSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
  rmSync,
  renameSync,
} from "node:fs";
import { resolve, join, relative, dirname, basename } from "node:path";
import { execFileSync } from "node:child_process";
import { loadDataLayer } from "./data.mjs";
import { renderCaseFile } from "./render-case-file.mjs";
import { renderEvidence } from "./render-evidence.mjs";
import { renderNotFound } from "./render-404.mjs";
import { sitemapXml, robotsTxt } from "./sitemap.mjs";

const root = process.cwd();
const argv = process.argv.slice(2);
const outArg = argv.includes("--out") ? argv[argv.indexOf("--out") + 1] : null;
const DEST = resolve(root, outArg ?? "out");
/* A SIBLING of the destination, never a fixed path under .build/: rename(2)
   cannot cross filesystems, and a caller is free to point --out anywhere. Two
   entries in the same directory are always on the same device. */
const BUILD_ROOT = join(dirname(DEST), `${basename(DEST)}.building`);

function fail(msg) {
  console.error(`build-archive failed: ${msg}`);
  process.exit(1);
}

function write(rel, contents) {
  const path = join(BUILD_ROOT, rel);
  mkdirSync(resolve(path, ".."), { recursive: true });
  writeFileSync(path, contents);
  return contents.length;
}

/* ── 0. the data layer, before anything on disk moves ─────────────────
   This compiles TypeScript and imports six modules, and it is the step most
   likely to fail on an ordinary day — a type error, a bad specifier, a broken
   import. Doing it first means those failures cost nothing: no directory has
   been created, no scratch tree written, and the previous build is untouched. */
const { seo, personal, projects, caseStudies, proof, stations } =
  await loadDataLayer();
const { siteMetadata } = personal;
const { projectCaseStudies, getCaseStudyProject, getNextCaseStudy } = caseStudies;
const { proofManifest } = proof;
const { STATIONS } = stations;

/* ── 1. the output root ──────────────────────────────────────────────── */
rmSync(BUILD_ROOT, { recursive: true, force: true });
mkdirSync(BUILD_ROOT, { recursive: true });

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
cpSync(PUBLIC, BUILD_ROOT, { recursive: true });
for (const rel of ["resume.pdf", "favicon.ico", "favicon.svg", "og/home.png"]) {
  const path = join(BUILD_ROOT, rel);
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
mkdirSync(join(BUILD_ROOT, "assets"), { recursive: true });
cpSync(ASSETS, join(BUILD_ROOT, "assets"), { recursive: true });
for (const rel of ["archive.css", "archive.js", "paper-memory.js"]) {
  const path = join(BUILD_ROOT, "assets", rel);
  if (!existsSync(path) || statSync(path).size === 0) {
    fail(`assets/${rel} did not land — the record room would ship unstyled`);
  }
}
console.log("  · assets/ copied — the stylesheet, the walk, the paper memory");

/* ── 3. the pages ────────────────────────────────────────────────────── */
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

/* ── 4. the run, over index.html ──────────────────────────────────────
   Last, and into the scratch root like everything else. It brings the four
   faces, the three wasm parts and the compiled nameplate machines with it. */
execFileSync(
  "node",
  [resolve(root, "scripts/run/build-home.mjs"), "--out", BUILD_ROOT],
  { cwd: root, stdio: "inherit" }
);

/* ── 5. the swap ─────────────────────────────────────────────────────
   Everything above succeeded or this line was never reached. The old root goes
   and the new one takes its name; a reader served out of this directory sees
   the previous build until the rename, and the finished one after it. */
if (!existsSync(join(BUILD_ROOT, "index.html"))) {
  fail("build-home.mjs returned 0 without writing index.html");
}
rmSync(DEST, { recursive: true, force: true });
renameSync(BUILD_ROOT, DEST);

console.log(`build-archive: the site is at ${relative(root, DEST) || "."}/`);
