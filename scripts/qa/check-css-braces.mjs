/**
 * @fileoverview Every stylesheet the site ships closes exactly the blocks it
 * opens.
 *
 * WHY THIS EXISTS. A `}` that closes nothing is not an error to a browser. The
 * CSS parser reads it as the first token of the NEXT rule's selector, finds
 * that selector invalid, and drops the whole rule, silently. One stray brace
 * after the run's motion @media did exactly that to `.np-plate { position:
 * relative }` from #37 until 2026-10-28: the CSSOM held no .np-plate rule, the
 * nameplate's machines lost their containing block whenever the scroll-fx had
 * not given the plate a transform, and a reload parked at ¶02 drew them 358px
 * above the name. Nothing else could see it: the golden hash certified the
 * broken bytes, and every browser test loaded the page at the top, where the
 * transform hid it.
 *
 * READS THE BUILT SITE, so a page or stylesheet added later is covered without
 * being listed: every <style> block in every out/**\/*.html, and every
 * out/**\/*.css. Comments and quoted strings are skipped, so a brace inside
 * either cannot count.
 *
 *   node scripts/qa/check-css-braces.mjs out                  what ships
 *   node scripts/qa/check-css-braces.mjs .build/gate-probe    a doctored copy
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join, relative } from "node:path";

const root = process.cwd();
const SITE = resolve(root, process.argv[2] ?? "out");

if (!existsSync(join(SITE, "index.html"))) {
  console.error(`check-css-braces: no index.html under ${relative(root, SITE) || "."}/ — did the build run?`);
  process.exit(1);
}

function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path);
    return /\.(html|css)$/.test(entry.name) ? [path] : [];
  });
}

const failures = [];
let sheets = 0;
for (const path of files(SITE)) {
  const text = readFileSync(path, "utf8");
  const rel = relative(SITE, path);
  const blocks = path.endsWith(".css")
    ? [{ css: text, at: 0 }]
    : [...text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => ({
        css: m[1],
        at: m.index + m[0].indexOf(m[1]),
      }));
  for (const { css, at } of blocks) {
    sheets++;
    const lineOf = (i) => text.slice(0, at + i).split("\n").length;
    let depth = 0;
    for (let i = 0; i < css.length; i++) {
      const c = css[i];
      if (c === "/" && css[i + 1] === "*") {
        const end = css.indexOf("*/", i + 2);
        i = end < 0 ? css.length : end + 1;
        continue;
      }
      if (c === '"' || c === "'") {
        let j = i + 1;
        while (j < css.length && css[j] !== c) j += css[j] === "\\" ? 2 : 1;
        i = j;
        continue;
      }
      if (c === "{") depth++;
      else if (c === "}" && --depth < 0) {
        const next = css.slice(i + 1).replace(/\/\*[\s\S]*?\*\//g, "").trim().split("{")[0].trim();
        failures.push(`${rel}:${lineOf(i)} a "}" closes nothing, so the browser drops the rule after it: ${next.slice(0, 60) || "(end of sheet)"}`);
        depth = 0;
      }
    }
    if (depth > 0) failures.push(`${rel}:${lineOf(0)} a stylesheet ends with ${depth} block${depth === 1 ? "" : "s"} still open`);
  }
}

if (failures.length) {
  console.error(`check-css-braces FAILED — ${failures.length} problem${failures.length === 1 ? "" : "s"}:\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`check-css-braces: ${sheets} stylesheets close every block they open, against ${process.argv[2] ?? "out"}/`);
