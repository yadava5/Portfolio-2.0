/**
 * Compile the nameplate's machines for the run.
 *
 * The run is a hand-authored HTML file and cannot import TypeScript, but it
 * needs the SAME five letter-machines the React nameplate uses — the
 * dividers on the A, the road on the s, the dial and the runner on the two
 * a's, the bird that lands as the v.
 *
 * COMPILED, NOT COPIED, and that distinction is the whole reason this file
 * exists. `src/components/story/nameplateMachines.ts` stays the single
 * source; the run gets a generated artifact. A second hand-maintained copy
 * of 1,500 lines is precisely how two nameplates drift apart, which is the
 * failure six rounds of porting the scroll engine already demonstrated at
 * length.
 *
 * The compile-and-relink itself moved to `compile-ts-graph.mjs` when
 * `build-home.mjs` needed the identical thing for `src/lib/seo.ts`. Its second
 * half is the non-obvious part — tsc emits `@/…` specifiers verbatim and no
 * loader can resolve them — and two hand-maintained copies of a specifier
 * rewrite is the same mistake as two hand-maintained copies of a nameplate.
 *
 *   node scripts/run/build-nameplate.mjs [--out <root>]   default: out
 *
 * `--out` names the SITE root, not the module directory: the run loads these
 * by the relative path `./run/components/…`, so they always sit at `<root>/run`
 * and that relationship is not a caller's to choose. The flag exists because
 * `scripts/archive/build-archive.mjs` assembles the whole site in a scratch
 * directory and swaps it into place at the end, so that a build which fails
 * halfway leaves the directory a reader is served untouched.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { compileAndRelink } from "./compile-ts-graph.mjs";

const root = process.cwd();
const argv = process.argv.slice(2);
const outArg = argv.includes("--out") ? argv[argv.indexOf("--out") + 1] : null;
const SITE_ROOT = resolve(root, outArg ?? "out");
const OUT = join(SITE_ROOT, "run");

function fail(msg) {
  console.error(`build-nameplate failed: ${msg}`);
  process.exit(1);
}

let rewritten = 0;
try {
  ({ rewritten } = compileAndRelink({
    root,
    project: "tsconfig.run.json",
    outDir: OUT,
  }));
} catch (e) {
  fail(e.message);
}

const entry = resolve(OUT, "components/story/nameplateMachines.js");
if (!existsSync(entry)) fail("no nameplateMachines.js after compile");
const bytes = readFileSync(entry).length;

/* MACHINES WITHHELD, CHECKED HERE BECAUSE IT CANNOT BE CHECKED AT RUNTIME.
   `nameplateMachines.ts` promised that renaming the author in the data layer
   would yield the plate without the machines — five letterforms are authored
   to pixel scans of exactly ten characters in exactly one face, so a rename
   folds a bird into somebody else's v. It imported `personalInfo` to make
   that comparison and never made it (C46).

   The obvious fix is one line in that file and it is measurably wrong: TS was
   ELIDING the unused import, so nothing loaded `personal.js`. Use the value
   and the import is retained; `personal.ts` imports `withBasePath` and
   `basePath.ts` reads `process.env`, so the browser throws
   `ReferenceError: process is not defined`, the dynamic import of the whole
   module fails, and the nameplate stops performing with four check-nameplate
   invariants red. Measured, reverted, and recorded here so it is not tried
   twice. Node has `process`, and this is Node.

   Read as text rather than imported, the same way check-stations reads its
   own data file: this job compiles the type graph, and importing the data
   layer to validate the thing being compiled inverts that order. */
const nameIn = (file, re, what) => {
  const src = readFileSync(resolve(root, file), "utf8");
  const m = src.match(re);
  if (!m)
    fail(`could not read ${what} from ${file} — the guard cannot run blind`);
  return m[1];
};
const machineName = nameIn(
  "src/components/story/nameplateMachines.ts",
  /export const MACHINE_NAME = "([^"]*)"/,
  "MACHINE_NAME"
);
const authorName = nameIn(
  "src/lib/data/personal.ts",
  /export const personalInfo = \{[\s\S]*?\bname: "([^"]*)"/,
  "personalInfo.name"
);
if (machineName !== authorName) {
  fail(
    `the machines are authored to ${JSON.stringify(machineName)} but the data ` +
      `layer now says ${JSON.stringify(authorName)}.\n` +
      `  Five machines cite pixel scans of the first string; they would draw ` +
      `the right shapes onto the wrong letters.\n` +
      `  Re-author the machines to the new name, or withhold them deliberately ` +
      `— do not just update MACHINE_NAME.`
  );
}

console.log(
  `  · nameplate machines compiled — ${(bytes / 1024).toFixed(1)} KB, ${rewritten} files re-specified, 0 unresolved`
);
