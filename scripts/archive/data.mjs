/**
 * The data layer, compiled once and handed to the archive generator.
 *
 * Everything the record room prints — the seven case files, the fourteen
 * ledger entries, the site's metadata, the run's thirteen stops — already
 * exists as verified TypeScript. The generator is plain node, so the modules
 * are compiled and imported rather than re-read as text or restated.
 *
 * READ, DO NOT RESTATE. `build-home.mjs` reads `personal.ts` as source text to
 * check one email address, and that is fine for one string. A whole archive
 * transcribed out of the data layer by regex is how the run came to claim
 * "2.9× scalar" while `projects.ts` said ~2.8 with a caveat the prose had
 * dropped. The data layer wins here for the same reason it wins there.
 */
import { writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { compileAndRelink } from "../run/compile-ts-graph.mjs";

const root = process.cwd();
const BUILD = resolve(root, ".build/archive");

/**
 * Compile `tsconfig.archive.json` and import what it emitted.
 *
 * @returns the named exports of every module the archive draws from
 */
export async function loadDataLayer() {
  compileAndRelink({
    root,
    project: "tsconfig.archive.json",
    outDir: ".build/archive",
  });

  /* Node decides ESM vs CommonJS from the nearest package.json and this
     repo's carries no "type"; tsc emitted ES modules. Without this the first
     `export` throws. */
  writeFileSync(join(BUILD, "package.json"), '{ "type": "module" }\n');

  const load = (rel) => import(pathToFileURL(join(BUILD, rel)).href);

  const [seo, personal, projects, caseStudies, proof, stations] =
    await Promise.all([
      load("lib/seo.js"),
      load("lib/data/personal.js"),
      load("lib/data/projects.js"),
      load("lib/data/projectCaseStudies.js"),
      load("lib/data/proofManifest.js"),
      load("lib/data/stations.js"),
    ]);

  return { seo, personal, projects, caseStudies, proof, stations };
}
