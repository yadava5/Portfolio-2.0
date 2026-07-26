/**
 * Fix round 3, S3 — one spelling of the flagship number, run once and
 * kept as evidence.
 *
 * The site printed the same committed benchmark five ways: `3.5×` in the
 * home deck, `3.5x` in the chip beneath it, `3.5x` on /evidence, `3.50x`
 * in the Glyph case file's receipt, and `3.5x` on the axis of the chart
 * that receipt sits beside. The upstream artifact settles both questions
 * at once — BENCHMARKS.md @ c6e5c0b writes it, in its own Analysis
 * section, as **3.5× faster**: the multiplication sign U+00D7, and one
 * decimal place. So `3.50x` was neither the benchmark's precision nor
 * the benchmark's glyph, and it is now `3.5×` everywhere.
 *
 * The same notation law applies to every other ratio the site prints —
 * the chart's own `1×` baseline tick (it must agree with the `3.5×` on
 * the same axis), jetpack's `~6.5×`, and its Adler-32 `~2.8×`. Nothing
 * about any measurement changed; `×` is not `x`, and the site now has
 * one glyph for "times".
 *
 * Walks STRING LITERALS only (comments and identifiers are skipped), so
 * `const x1x = mx(g, 1)` and friends are untouched by construction.
 *
 * Usage: node docs/design-lab/one-times-sign.mjs <file...> [--dry]
 */
import { readFileSync, writeFileSync } from "node:fs";

const dry = process.argv.includes("--dry");
const files = process.argv.slice(2).filter((arg) => arg !== "--dry");
if (files.length === 0) {
  console.error("usage: node docs/design-lab/one-times-sign.mjs <file...>");
  process.exit(1);
}

/**
 * Normalize the ratio notation inside one prose string.
 *
 * @param body - The string literal's contents
 * @returns The same string with `3.50x` → `3.5×` and `<n>x` → `<n>×`
 */
function timesSign(body) {
  /* The one over-precise spelling first, so it lands on 3.5× and not 3.50×. */
  let next = body.replace(/3\.50x\b/g, "3.5×");
  /* Every remaining ratio: 1x, 3.5x, ~6.5x, ~2.8x → 1×, 3.5×, ~6.5×, ~2.8× */
  next = next.replace(/(\d)x\b/g, "$1×");
  return next;
}

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const out = [];
  const changed = [];
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
    /* Template literals are passed through untouched: their `${…}` holes
       are IDENTIFIERS, and `${x1x}` is exactly the shape this sweep
       rewrites. No ratio the site prints lives in a backtick string. */
    if (ch === '"' || ch === "'") {
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
      const next = timesSign(body);
      if (next !== body) changed.push({ line, next });
      out.push(quote + next + quote);
      i = j + 1;
      continue;
    }
    out.push(ch);
    i += 1;
  }

  if (!dry) writeFileSync(file, out.join(""));
  console.log(`${file}: ${changed.length} strings${dry ? " (dry run)" : ""}`);
  for (const c of changed) console.log(`  ${c.line}: ${c.next.slice(0, 110)}`);
}
