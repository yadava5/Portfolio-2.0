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
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { compileAndRelink } from "./compile-ts-graph.mjs";

const root = process.cwd();
const OUT = resolve(root, "out/run");

function fail(msg) {
  console.error(`build-nameplate failed: ${msg}`);
  process.exit(1);
}

let rewritten = 0;
try {
  ({ rewritten } = compileAndRelink({
    root,
    project: "tsconfig.run.json",
    outDir: "out/run",
  }));
} catch (e) {
  fail(e.message);
}

const entry = resolve(OUT, "components/story/nameplateMachines.js");
if (!existsSync(entry)) fail("no nameplateMachines.js after compile");
const bytes = readFileSync(entry).length;

console.log(
  `  · nameplate machines compiled — ${(bytes / 1024).toFixed(1)} KB, ${rewritten} files re-specified, 0 unresolved`
);
