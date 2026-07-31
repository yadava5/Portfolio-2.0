/**
 * Probe routes must not ship.
 *
 * A `page.probe.tsx` anywhere under `src/app` is a route only when
 * NEXT_PUBLIC_TEST_PROBES=1 puts `probe.tsx` in `pageExtensions`
 * (next.config.ts). That gate is a build-time one — the file is simply
 * not a page — which is stronger than a runtime branch, because
 * `output: "export"` emits every route in the tree whether or not its
 * component renders anything.
 *
 * This asserts the outcome from `out/` rather than trusting the config,
 * for the same reason CRITIC-LEDGER F74 had to: the previous test-probe
 * gate was believed to work and was measurably still in the shipped
 * chunks. A config is an intention; the build output is the artifact.
 *
 * Run against a NORMAL build. Under the probe flag the route is
 * supposed to exist, so this check is skipped there — and it says so
 * out loud instead of silently passing, because a check that quietly
 * no-ops in the configuration you actually ship is not a check.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "out");
const appDir = path.join(root, "src", "app");

let failed = false;
function fail(message) {
  console.error(`Probe-route check failed: ${message}`);
  failed = true;
}

if (process.env.NEXT_PUBLIC_TEST_PROBES === "1") {
  console.log(
    "Probe-route check SKIPPED: NEXT_PUBLIC_TEST_PROBES=1, so probe routes are expected in out/."
  );
  process.exit(0);
}

if (!fs.existsSync(outDir)) {
  fail(`no build output at ${outDir} — run the build first`);
  process.exit(1);
}

/* Which probe pages exist in source. If none do, this check has nothing
   to defend and should say so rather than passing vacuously — a green
   tick for an empty set is how a guard rots unnoticed. */
function probeSources(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...probeSources(full));
    else if (entry.name === "page.probe.tsx")
      found.push(path.relative(root, full));
  }
  return found;
}

const sources = probeSources(appDir);
if (sources.length === 0) {
  console.log(
    "Probe-route check: no page.probe.tsx in src/app — nothing to defend."
  );
  process.exit(0);
}

/* Every emitted HTML route in the build. */
function routes(dir, prefix = "") {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "_next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory())
      found.push(...routes(full, `${prefix}/${entry.name}`));
    else if (entry.name === "index.html") found.push(`${prefix}/`);
  }
  return found;
}

const emitted = routes(outDir);
const leaked = emitted.filter((route) => route.includes("/probe/"));

for (const route of leaked) {
  fail(`probe route ${route} was exported into out/ — it must not ship`);
}

/* The probe's own text must not appear anywhere in the shipped HTML,
   even outside a route of its own: a fixture string reaching a sitemap,
   a search index or a prefetch manifest is the same leak by another
   door.

   THE NEEDLE MUST BE A PROBE-ONLY SENTINEL. The first version of this
   check used the real release condition, "held until a committed eval
   run earns it", and failed on the very first run against four files
   under out/projects/fast-mnist-nn/ — because that exact sentence is
   quoted inside Glyph's erratum and its manifest note. The route gate
   had held perfectly; the needle was matching real prose. A leak check
   whose needle can occur in production content reports the site's own
   words as a leak, which is worse than not checking at all. */
const NEEDLE = "probe fixture sentinel — held until a probe earns it";
function htmlFiles(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...htmlFiles(full));
    else if (entry.name.endsWith(".html") || entry.name.endsWith(".txt"))
      found.push(full);
  }
  return found;
}

for (const file of htmlFiles(outDir)) {
  if (fs.readFileSync(file, "utf8").includes(NEEDLE)) {
    fail(
      `probe fixture text leaked into ${path.relative(root, file)} — the route gate did not hold`
    );
  }
}

if (failed) process.exit(1);

console.log(
  `Probe-route check passed: ${sources.length} probe page(s) in source, 0 exported into out/ (${emitted.length} routes emitted).`
);
