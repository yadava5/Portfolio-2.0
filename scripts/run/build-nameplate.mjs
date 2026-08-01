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
 * The one thing tsc leaves undone is module specifiers: it emits the `@/…`
 * aliases verbatim, and a browser cannot resolve them. They are rewritten
 * to relative paths here rather than by adding a bundler — the graph is
 * five files and a bundler is a dependency this page does not otherwise
 * need. The run's whole argument is that it weighs 166KB with none.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, relative, dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const OUT = resolve(root, "out/run");

function fail(msg) {
  console.error(`build-nameplate failed: ${msg}`);
  process.exit(1);
}

/* ── Compile ────────────────────────────────────────────────────────── */
try {
  execFileSync("npx", ["tsc", "-p", "tsconfig.run.json"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (e) {
  fail(`tsc: ${e.stdout?.toString().slice(0, 400) ?? e.message}`);
}
if (!existsSync(OUT)) fail("tsc emitted nothing to out/run");

/* ── Rewrite `@/…` to relative, so a browser can resolve it ─────────── */
function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".js")) out.push(p);
  }
  return out;
}

let rewritten = 0;
for (const file of walk(OUT)) {
  let src = readFileSync(file, "utf8");
  const before = src;
  src = src.replace(/from\s+"@\/([^"]+)"/g, (_m, spec) => {
    /* `@/x/y` means `src/x/y`, which under out/run is `out/run/x/y`. */
    let rel = relative(dirname(file), join(OUT, spec)).replace(/\\/g, "/");
    if (!rel.startsWith(".")) rel = `./${rel}`;
    return `from "${rel}.js"`;
  });
  /* tsc emits extensionless relative specifiers; browsers need the .js */
  src = src.replace(/from\s+"(\.\.?\/[^"]+?)"/g, (m, spec) =>
    spec.endsWith(".js") ? m : `from "${spec}.js"`
  );
  if (src !== before) {
    writeFileSync(file, src);
    rewritten++;
  }
}

const entry = resolve(OUT, "components/story/nameplateMachines.js");
if (!existsSync(entry)) fail("no nameplateMachines.js after compile");
const bytes = readFileSync(entry).length;

/* A specifier the browser cannot resolve fails silently at runtime — the
   module simply never loads and the name sits there unanimated, which is
   exactly the class of failure that is easy to ship and hard to notice.
   So check rather than assume. */
const leftovers = walk(OUT).filter((f) =>
  /from\s+"@\//.test(readFileSync(f, "utf8"))
);
if (leftovers.length) {
  fail(`unresolved @/ specifiers in: ${leftovers.map((f) => relative(root, f)).join(", ")}`);
}

console.log(
  `  · nameplate machines compiled — ${(bytes / 1024).toFixed(1)} KB, ${rewritten} files re-specified, 0 unresolved`
);
