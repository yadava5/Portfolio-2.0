/**
 * Compile a TypeScript module graph to plain ES modules, and relink it.
 *
 * TWO CALLERS, ONE IMPLEMENTATION, and the duplication this replaces would
 * have been the dangerous kind. `build-nameplate.mjs` has compiled the run's
 * letter-machines this way since the run became the home page; `build-home.mjs`
 * now compiles `src/lib/seo.ts` the same way to emit the head. Both need the
 * identical, non-obvious second half — tsc emits `@/…` specifiers verbatim and
 * neither a browser nor Node can resolve them — and two hand-maintained copies
 * of a specifier rewrite is precisely how the two artifacts would come to
 * differ in a way no gate reads.
 *
 * A bundler would do this. The run's whole argument is that it weighs 166 KB
 * with no dependencies, and the graph is five files.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, relative, dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

/** Every emitted .js under `dir`, depth-first. */
export function emittedModules(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...emittedModules(p));
    else if (p.endsWith(".js")) out.push(p);
  }
  return out;
}

/**
 * Run `tsc -p <project>` and rewrite every module specifier in what it emits
 * so the result loads with no resolver but the file system's.
 *
 * Throws rather than exiting, with no prefix of its own — each caller has its
 * own `fail()` and its own name to put in front of the message.
 *
 * `outDir` is PASSED TO tsc, not merely believed. It used to be a parameter
 * this function only used to find the emitted files, on the understanding that
 * the named project's config said the same thing — a promise nothing checked,
 * and one that stopped being keepable when the run's modules had to be emitted
 * into a build root that is not yet `out/`. Overriding it on the command line
 * makes the argument the single truth for both halves.
 *
 * @param {object} opts
 * @param {string} opts.root      repository root
 * @param {string} opts.project   tsconfig path, relative to root
 * @param {string} opts.outDir    where tsc emits, relative to root or absolute
 * @returns {{ files: string[], rewritten: number }}
 */
export function compileAndRelink({ root, project, outDir }) {
  const out = resolve(root, outDir);

  try {
    execFileSync("npx", ["tsc", "-p", project, "--outDir", out], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    throw new Error(`tsc: ${e.stdout?.toString().slice(0, 400) ?? e.message}`);
  }
  if (!existsSync(out)) throw new Error(`tsc emitted nothing to ${outDir}`);

  let rewritten = 0;
  const files = emittedModules(out);
  for (const file of files) {
    let src = readFileSync(file, "utf8");
    const before = src;
    src = src.replace(/from\s+"@\/([^"]+)"/g, (_m, spec) => {
      /* `@/x/y` means `src/x/y`, which under the outDir is `<outDir>/x/y`. */
      let rel = relative(dirname(file), join(out, spec)).replace(/\\/g, "/");
      if (!rel.startsWith(".")) rel = `./${rel}`;
      return `from "${rel}.js"`;
    });
    /* tsc emits extensionless relative specifiers; neither browsers nor Node's
       ESM resolver will add the .js for you. */
    src = src.replace(/from\s+"(\.\.?\/[^"]+?)"/g, (m, spec) =>
      spec.endsWith(".js") ? m : `from "${spec}.js"`
    );
    if (src !== before) {
      writeFileSync(file, src);
      rewritten++;
    }
  }

  /* A specifier the loader cannot resolve fails SILENTLY in a browser — the
     module simply never loads and the page sits there looking finished, which
     is the class of failure that is easy to ship and hard to notice. So check
     rather than assume. */
  const leftovers = files.filter((f) => /from\s+"@\//.test(readFileSync(f, "utf8")));
  if (leftovers.length) {
    throw new Error(
      `unresolved @/ specifiers in: ${leftovers.map((f) => relative(root, f)).join(", ")}`
    );
  }

  return { files, rewritten };
}
