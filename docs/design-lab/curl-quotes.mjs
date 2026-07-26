/**
 * Fix round 3, S2 — the smart-quote sweep, run once and kept as evidence.
 *
 * Walks a TypeScript data file, finds every STRING LITERAL (skipping line
 * and block comments entirely — source comments are not the page), and
 * curls the English elision/possessive apostrophes inside it: `'` U+0027
 * → `’` U+2019. Anything that is a code literal is protected by exact
 * substring, not by cleverness — the one such case in this repo is
 * `set_config('app.user_id'`, a SQL call quoted verbatim in a Cadence
 * receipt, where the apostrophes are Postgres syntax and not typography.
 *
 * Straight double quotes are NOT touched by this script: there are only
 * two on the site and they need opposite rulings (one is a quoted phrase,
 * one is the Gmail API's `format="metadata"` argument), so they were
 * decided by hand — see WAVE4-STATUS FIX3 / S2.
 *
 * Usage: node docs/design-lab/curl-quotes.mjs <file> [--dry]
 */
import { readFileSync, writeFileSync } from "node:fs";

const file = process.argv[2];
const dry = process.argv.includes("--dry");
if (!file) {
  console.error("usage: node docs/design-lab/curl-quotes.mjs <file> [--dry]");
  process.exit(1);
}

/** Code literals whose apostrophes are syntax, never typography. */
const CODE_LITERALS = ["set_config('app.user_id'"];

const changes = [];

/**
 * Curl the apostrophes in one prose string.
 *
 * @param body - The string literal's contents (delimiters excluded)
 * @param lineNo - 1-based line the literal opened on, for the report
 * @returns The same string with elision/possessive marks curled
 */
function curl(body, lineNo) {
  if (CODE_LITERALS.some((literal) => body.includes(literal))) return body;
  const before = body;
  /* In a single-quoted literal the same mark arrives escaped (`claim\'s`);
     the curly replacement needs no escape, so the backslash goes with it. */
  let next = body.replace(/([A-Za-z0-9.])\\'([A-Za-z])/g, "$1’$2");
  /* word'word — can't, Gmail's, 404'd, FORCE'd, BENCHMARKS.md's */
  next = next.replace(/([A-Za-z0-9.])'([A-Za-z])/g, "$1’$2");
  /* plural possessive at a word boundary — the repos' HEAD */
  next = next.replace(/([A-Za-z])'(\s)/g, "$1’$2");
  if (next !== before) changes.push({ lineNo, after: next });
  return next;
}

const src = readFileSync(file, "utf8");
const out = [];
let i = 0;
let line = 1;
let inLineComment = false;
let inBlockComment = false;

while (i < src.length) {
  const ch = src[i];
  if (ch === "\n") {
    line += 1;
    inLineComment = false;
    out.push(ch);
    i += 1;
    continue;
  }
  if (inLineComment || inBlockComment) {
    if (inBlockComment && ch === "*" && src[i + 1] === "/") {
      inBlockComment = false;
      out.push("*/");
      i += 2;
      continue;
    }
    out.push(ch);
    i += 1;
    continue;
  }
  if (ch === "/" && src[i + 1] === "/") {
    inLineComment = true;
    out.push("//");
    i += 2;
    continue;
  }
  if (ch === "/" && src[i + 1] === "*") {
    inBlockComment = true;
    out.push("/*");
    i += 2;
    continue;
  }
  if (ch === '"' || ch === "'" || ch === "`") {
    const quote = ch;
    let j = i + 1;
    let body = "";
    while (j < src.length) {
      if (src[j] === "\\") {
        body += src[j] + src[j + 1];
        j += 2;
        continue;
      }
      if (src[j] === quote || src[j] === "\n") break;
      body += src[j];
      j += 1;
    }
    if (src[j] !== quote) {
      out.push(ch);
      i += 1;
      continue;
    }
    out.push(quote + curl(body, line) + quote);
    i = j + 1;
    continue;
  }
  out.push(ch);
  i += 1;
}

if (!dry) writeFileSync(file, out.join(""));
console.log(`${file}: ${changes.length} strings touched${dry ? " (dry run)" : ""}`);
for (const change of changes) {
  console.log(`  ${change.lineNo}: ${change.after.slice(0, 120)}`);
}
