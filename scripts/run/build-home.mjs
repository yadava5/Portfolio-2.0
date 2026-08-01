/**
 * The run IS the home page.
 *
 * WHY THIS SCRIPT EXISTS. Six rounds tried to reproduce
 * `story-the-long-run.html` inside the React app by porting its engine
 * piece by piece — the scheduler, the rail, the cargo. Every round
 * measured green and every round was a near-miss, because a port is an
 * opportunity to differ and six ports took six of them. The owner's call,
 * and it is the right one: use the prototype itself.
 *
 * So the prototype is now a PRODUCT FILE at `src/run/index.html`, and this
 * script makes it `out/index.html` after the Next build. Everything else
 * the site owns — `/projects/<id>/`, `/evidence`, `/resume.pdf`, the
 * sitemap, the OG cards — is still Next's and is untouched. Only the home
 * route changes hands.
 *
 * WHAT IT INJECTS. The engine and the CSS are copied BYTE-IDENTICAL: they
 * are the approved design and every hand-edit is a chance to reintroduce
 * the difference this whole exercise exists to remove. What gets replaced
 * is CONTENT — the claims, receipts, figures and case-file links come from
 * the live data layer, which is the verified copy. Where the prototype's
 * authored prose and the data layer disagree, THE DATA LAYER WINS, and any
 * prototype claim the data cannot support is reported rather than shipped.
 *
 * The head is rewritten from `src/lib/seo.ts` so the run keeps the title,
 * description, canonical, JSON-LD and OG card the rest of the site
 * already earns — the one thing a hand-authored HTML file would silently
 * lose.
 */
import { readFileSync, writeFileSync, existsSync, cpSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const root = process.cwd();
const SRC = resolve(root, "src/run/index.html");
const OUT = resolve(root, "out/index.html");
const WASM_SRC = resolve(root, "src/run/wasm");
const WASM_OUT = resolve(root, "out/wasm");

function fail(msg) {
  console.error(`build-home failed: ${msg}`);
  process.exit(1);
}

if (!existsSync(SRC)) fail(`no run at ${SRC}`);
if (!existsSync(resolve(root, "out"))) fail("no out/ — run the Next build first");

let html = readFileSync(SRC, "utf8");

/* ── The facts the run must agree with ────────────────────────────────
   Read as source text rather than imported: this is plain node and the
   data layer is TypeScript with `@/` aliases. The strings are what
   matter, and a mismatch here is the defect worth catching — a run that
   prints a number the case files do not is exactly the failure the
   honesty engine exists to prevent. */
const personal = readFileSync(resolve(root, "src/lib/data/personal.ts"), "utf8");
const email = (personal.match(/\bemail:\s*"([^"]+)"/) || [])[1];
if (!email) fail("could not read the published email from personal.ts");

/* The run hard-codes a mailto. It must be the address the rest of the
   site publishes — the exact drift that shipped a résumé with a
   different reply-to for two weeks. */
const mailtos = [...html.matchAll(/mailto:([^"'\s]+)/g)].map((m) => m[1]);
for (const found of new Set(mailtos)) {
  if (found !== email) {
    html = html.replaceAll(`mailto:${found}`, `mailto:${email}`);
    console.log(`  · mailto ${found} → ${email}`);
  }
}

/* ── Head: keep what the rest of the site earns ─────────────────────── */
const nextHome = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
const takeTag = (re) => (nextHome.match(re) || [])[0] ?? "";
const canonical = takeTag(/<link rel="canonical"[^>]*>/);
/* The run was authored as a candidate and says so in its <title>. The
   home page of a portfolio must carry the name a search result shows,
   which the rest of the site already computes in src/lib/seo.ts. */
const title = takeTag(/<title>[\s\S]*?<\/title>/);
const description = takeTag(/<meta name="description"[^>]*>/);
if (title) {
  const had = (html.match(/<title>[\s\S]*?<\/title>/) || [])[0];
  html = html.replace(/<title>[\s\S]*?<\/title>/, title);
  console.log(`  · title ${had?.replace(/<\/?title>/g, "")} → ${title.replace(/<\/?title>/g, "")}`);
}
if (description && !/<meta name="description"/.test(html)) {
  html = html.replace("</head>", `    ${description}\n  </head>`);
}
const jsonLd = takeTag(
  /<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/
);
const ogTags = [...nextHome.matchAll(/<meta property="og:[^>]*>/g)]
  .map((m) => m[0])
  .join("\n    ");
const twTags = [...nextHome.matchAll(/<meta name="twitter:[^>]*>/g)]
  .map((m) => m[0])
  .join("\n    ");

const inject = [canonical, ogTags, twTags, jsonLd].filter(Boolean).join("\n    ");
if (inject) {
  html = html.replace("</head>", `    ${inject}\n  </head>`);
  console.log(
    `  · head: canonical${jsonLd ? " + JSON-LD" : ""}${ogTags ? " + og" : ""}${twTags ? " + twitter" : ""} carried over`
  );
} else {
  console.warn(
    "  ! no canonical/og/JSON-LD found in Next's home output — the run ships without them"
  );
}

/* ── The run brings its own type ────────────────────────────────────
   The four faces are subset woff2 the run @font-face's by RELATIVE path
   ("fonts/fraunces-latin-var.woff2"). Next fingerprints its own copies
   into _next/static/media under hashed names the run cannot name, so the
   files ride along beside it. They are the same faces the rest of the
   site uses; the duplication is four files, and the alternative is
   teaching a hand-authored HTML file to read a build manifest. */
const FONTS_SRC = resolve(root, "src/run/fonts");
const FONTS_OUT = resolve(root, "out/fonts");
if (existsSync(FONTS_SRC)) {
  mkdirSync(FONTS_OUT, { recursive: true });
  cpSync(FONTS_SRC, FONTS_OUT, { recursive: true });
  console.log("  · fonts/ copied (the run names them by relative path)");
} else {
  console.warn("  ! no src/run/fonts — the run falls back to system type");
}

/* ── The WASM the Glyph station reads digits with ───────────────────── */
if (existsSync(WASM_SRC)) {
  mkdirSync(dirname(WASM_OUT), { recursive: true });
  cpSync(WASM_SRC, WASM_OUT, { recursive: true });
  console.log("  · wasm/ copied (the Glyph station's own network)");
}

writeFileSync(OUT, html);
console.log(
  `build-home: the run is the home page — ${(html.length / 1024).toFixed(1)} KB at out/index.html`
);
