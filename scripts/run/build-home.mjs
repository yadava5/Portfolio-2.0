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
import {
  readFileSync,
  writeFileSync,
  existsSync,
  cpSync,
  mkdirSync,
  statSync,
} from "node:fs";
import { resolve, dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const SRC = resolve(root, "src/run/index.html");
const OUT = resolve(root, "out/index.html");
const WASM_SRC = resolve(root, "src/run/wasm");
const WASM_OUT = resolve(root, "out/wasm");

function fail(msg) {
  console.error(`build-home failed: ${msg}`);
  process.exit(1);
}

/* ── The run's closure, named so it can be asserted ───────────────────
   The run is a standalone HTML file that fetches four faces and three wasm
   parts BY RELATIVE PATH at runtime. Nothing in its own bytes names them in a
   way a hash can see, so every one of these can go missing while out/index.html
   is byte-identical and every gate is green. Enumerating them here is what
   turns "the directory existed" into "the files arrived".

   Floors, not equalities: re-subsetting a face or retraining the model must not
   fail the build, but a truncated or empty file must. Sizes measured 2026-08-06.
   The same floors are asserted against out/ by scripts/qa/verify-portfolio.mjs
   and recorded in scripts/qa/portfolio-baseline.json. */
const FACES = {
  "fraunces-latin-var.woff2": 100_000,
  "newsreader-latin-var.woff2": 20_000,
  "newsreader-italic-latin-var.woff2": 20_000,
  "fragment-mono-latin.woff2": 12_000,
};
const WASM_PARTS = {
  "fast_mnist.js": 40_000,
  "fast_mnist.wasm": 40_000,
  "model.weights.bin": 300_000,
};

/**
 * Assert every named file arrived in `dir` at or above its floor.
 *
 * cpSync of a directory that exists but is empty succeeds silently, and so does
 * a partial copy — which is the whole failure this guards.
 */
function landed(what, dir, manifest) {
  for (const [name, floor] of Object.entries(manifest)) {
    const path = join(dir, name);
    if (!existsSync(path)) fail(`${what}${name} did not land in out/`);
    const { size } = statSync(path);
    if (size < floor) {
      fail(`${what}${name} is ${size} B, below its ${floor} B floor — truncated or empty`);
    }
  }
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

/* ── The run may not out-claim the case files ───────────────────────
   The run is hand-authored prose and the data layer is the verified
   record, so where they disagree the DATA LAYER WINS. Two disagreements
   were caught the first time this ran, and the second is the instructive
   one:

     · the run said Adler-32 vectorised "2.9x scalar"; projects.ts says
       "~2.8x vs scalar" AND carries a caveat the run had dropped
       entirely — "honestly shown not to beat the JDK intrinsic". A
       rounded-up number is a small error; silently losing the sentence
       that calibrates it is the kind this site exists to prevent.
     · the run said "ci blocks any build under 0.95". The case file
       deliberately says only "the ci gate fails below the configured
       floor" — it does not state the threshold, because no committed
       artifact pins it. The run was MORE specific than the evidence.

   Both are corrected in src/run/index.html. This guard exists so neither
   can come back: any of these strings appearing in the run fails the
   build rather than shipping. It checks the rendered prose only — the
   engine's own numbers (easing constants, path maths) are not claims. */
const bodyProse = html
  .replace(/<script[\s\S]*?<\/script>/g, "")
  .replace(/<style[\s\S]*?<\/style>/g, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  /* Strip INLINE tags too. The first cut of this guard did not, and it
     could not see `vectorised <b>2.9×</b> scalar` — the claim was wrapped
     in <b>, so a search for the plain sentence matched nothing and the
     guard reported clean on a page that was out-claiming. The same wrap
     defeated my first attempt at the fix itself. A checker that reads
     markup as prose has to remove the markup. */
  .replace(/<[^>]*>/g, "");
const FORBIDDEN = [
  ["2.9× scalar", "projects.ts states ~2.8× — and adds the intrinsic caveat"],
  ["2.9x scalar", "projects.ts states ~2.8× — and adds the intrinsic caveat"],
  /* The "under 0.95" entries that used to sit here were WRONG, and they
     suppressed a true claim for weeks. Applied's .github/workflows/
     backend-ci.yml passes --min-macro-f1 0.95 at two steps: the floor is
     real, it is 0.95, and CI does block below it. Checked against the
     workflow rather than against the case file's prose, which is what the
     original entry had been derived from. */
];
const claimed = FORBIDDEN.filter(([needle]) => bodyProse.includes(needle));
if (claimed.length) {
  for (const [needle, why] of claimed) {
    console.error(`  ! the run claims "${needle}" — ${why}`);
  }
  fail("the run out-claims the data layer; fix src/run/index.html");
}
console.log("  · claims check: the run does not out-claim the case files");

/* ── Head: keep what the rest of the site earns ─────────────────────── */
const nextHome = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
const takeTag = (re) => (nextHome.match(re) || [])[0] ?? "";
const canonical = takeTag(/<link rel="canonical"[^>]*>/);
/* The run was authored as a candidate and says so in its <title>. The
   home page of a portfolio must carry the name a search result shows,
   which the rest of the site already computes in src/lib/seo.ts. */
const title = takeTag(/<title>[\s\S]*?<\/title>/);
const description = takeTag(/<meta name="description"[^>]*>/);
/* The run's OWN title says "story candidate" — it was authored as one. Shipping
   that is not a cosmetic miss on a portfolio whose entire search surface is a
   name query, so a missing title is a failure, not a silent pass-through. */
if (!title) fail("no <title> in Next's home output — the run would ship its own candidate title");
{
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

/* HARDENED — this used to console.warn and ship anyway.
   `src/run/index.html` carries ZERO canonical, og:, twitter: or JSON-LD of its
   own: measured, the entire <head> holds two <meta> tags (charset, viewport) and
   no <link> element at all. Every one of them is lifted from Next's render right
   here. So a warn-and-continue on this block is not a degraded head, it is NO
   head — and check-static-export-seo.mjs would then fail in deploy.yml:45, which
   means a production deploy fails on a page that was already built and shipped.
   Failing here costs one red build; warning here costs the deploy.

   Each is named separately because "the head is missing" and "twitter lost its
   card" want different first questions. */
const carried = {
  canonical,
  "og:*": ogTags,
  "twitter:*": twTags,
  "JSON-LD": jsonLd,
};
const lost = Object.entries(carried)
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (lost.length) {
  for (const k of lost) console.error(`  ! ${k} not found in Next's home output`);
  fail(
    `the run would ship without ${lost.join(", ")} — it carries none of its own`
  );
}
const inject = Object.values(carried).join("\n    ");
html = html.replace("</head>", `    ${inject}\n  </head>`);
console.log("  · head: canonical + og + twitter + JSON-LD carried over");

/* ── The nameplate machines, compiled from their single source ─────── */
execFileSync("node", [resolve(root, "scripts/run/build-nameplate.mjs")], {
  cwd: root,
  stdio: "inherit",
});

/* ── The run brings its own type ────────────────────────────────────
   The four faces are subset woff2 the run @font-face's by RELATIVE path
   ("fonts/fraunces-latin-var.woff2"). Next fingerprints its own copies
   into _next/static/media under hashed names the run cannot name, so the
   files ride along beside it. They are the same faces the rest of the
   site uses; the duplication is four files, and the alternative is
   teaching a hand-authored HTML file to read a build manifest. */
const FONTS_SRC = resolve(root, "src/run/fonts");
const FONTS_OUT = resolve(root, "out/fonts");
if (!existsSync(FONTS_SRC)) {
  fail("no src/run/fonts — the run @font-face's these by relative path and would ship in system type");
}
mkdirSync(FONTS_OUT, { recursive: true });
cpSync(FONTS_SRC, FONTS_OUT, { recursive: true });
landed("fonts/", FONTS_OUT, FACES);
console.log("  · fonts/ copied (the run names them by relative path)");

/* ── The WASM the Glyph station reads digits with ─────────────────────
   HARDENED — this used to be a bare `if (existsSync(...))` with no else, which
   is the sharpest regression class this build has. Delete src/run/wasm/ and:
   the copy is skipped SILENTLY, out/index.html reproduces its golden hash
   byte-for-byte (the run's own bytes never mention the files it fetches at
   runtime), zero test files mention wasm or fast_mnist, every gate passes
   green — and fig 06's classifier 404s in production. The hash certifies one
   file; the run's closure is much larger. Missing is now a build failure. */
if (!existsSync(WASM_SRC)) {
  fail("no src/run/wasm — the Glyph station fetches these at runtime and fig 06 would 404 in production");
}
mkdirSync(dirname(WASM_OUT), { recursive: true });
cpSync(WASM_SRC, WASM_OUT, { recursive: true });
landed("wasm/", WASM_OUT, WASM_PARTS);
console.log("  · wasm/ copied (the Glyph station's own network)");

writeFileSync(OUT, html);
console.log(
  `build-home: the run is the home page — ${(html.length / 1024).toFixed(1)} KB at out/index.html`
);
