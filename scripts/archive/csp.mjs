/**
 * The Content-Security-Policy every page ships with, as a <meta> tag.
 *
 * WHY A META TAG. GitHub Pages sends no header a site can choose, so the policy
 * rides in the document. Two directives cannot ride there and are left out
 * rather than written to be ignored: `frame-ancestors` and `report-uri`, which
 * browsers drop from a meta policy with a console warning.
 *
 * WHAT IT ALLOWS. Scripts run only from this origin, or as the exact inline
 * blocks the build wrote: each block is allowed by the sha256 of its finished
 * bytes, computed here after every other step has had its say, so an inline
 * script the build did not write does not run. `'wasm-unsafe-eval'` is on the
 * run alone, because the Glyph station compiles fast_mnist.wasm and no other
 * page compiles anything. Styles keep 'unsafe-inline': the run carries style
 * attributes by the dozen, the engine writes more as it draws, and the reading
 * gates add theirs through addStyleTag. Nothing on the site loads from another origin,
 * so 'self' is the whole allow-list; `img-src` adds data: for the inline SVG
 * grounds in the run and in archive.css.
 *
 * THE ORDER IS LOAD-BEARING. A meta policy governs only what the parser meets
 * after it, so the tag goes straight after <meta charset>, ahead of the run's
 * first inline script. check-csp.mjs fails a page where any script precedes it.
 */
import { createHash } from "node:crypto";

const CHARSET = '<meta charset="utf-8">';

/* The script types a browser executes. Anything else, application/ld+json
   included, is a data block: it never runs, so it needs no hash and gets none. */
const EXECUTABLE = new Set(["", "text/javascript", "application/javascript", "module"]);

/** The sha256 source expression of every inline script a browser would run. */
export function inlineScriptHashes(html) {
  const hashes = [];
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\ssrc\s*=/i.test(attrs)) continue;
    const type = (attrs.match(/\stype\s*=\s*"([^"]*)"/i)?.[1] ?? "").trim().toLowerCase();
    if (!EXECUTABLE.has(type)) continue;
    hashes.push(`'sha256-${createHash("sha256").update(body, "utf8").digest("base64")}'`);
  }
  return hashes;
}

/** The policy for one page, from that page's own bytes. */
export function policy(html, { wasm = false } = {}) {
  const scripts = ["'self'", ...(wasm ? ["'wasm-unsafe-eval'"] : []), ...inlineScriptHashes(html)];
  return [
    "default-src 'self'",
    `script-src ${scripts.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
}

/** The page with its policy seated directly after <meta charset>. */
export function withCsp(html, options) {
  const at = html.indexOf(CHARSET);
  if (at === -1) throw new Error(`no ${CHARSET} to seat the policy after`);
  const end = at + CHARSET.length;
  /* The whitespace that follows the charset tag, so the new line is indented
     the way that page's head already is: flush on the run, four spaces in the
     archive's shell. */
  const gap = html.slice(end).match(/^\s*/)[0];
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy(html, options)}">`;
  return `${html.slice(0, end)}${gap}${meta}${html.slice(end)}`;
}
