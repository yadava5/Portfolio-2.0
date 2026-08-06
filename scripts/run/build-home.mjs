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
 * The head is computed from `src/lib/seo.ts` so the run keeps the title,
 * description, canonical, JSON-LD and OG card the rest of the site
 * already earns — the one thing a hand-authored HTML file would silently
 * lose.
 *
 * THAT LAST SENTENCE WAS FALSE UNTIL 2026-08-06, and it is worth saying so
 * rather than quietly correcting it. This script never opened `seo.ts`; it
 * read Next's OWN rendered `out/index.html` and lifted the tags out with
 * regexes, then hard-failed if any were missing. A reader planning the
 * retirement of the Next app from this comment would have concluded the head
 * was already independent of it. It was the single thing most tightly coupled
 * to it: delete `src/app/` and this script died before writing a byte.
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
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { compileAndRelink } from "./compile-ts-graph.mjs";

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

/* ── Head: computed from the data layer, not lifted out of Next ────────
   `src/run/index.html` carries ZERO canonical, og:, twitter: or JSON-LD of its
   own: measured, the entire <head> holds two <meta> tags (charset, viewport)
   and no <link> element at all, and its <title> still says "story candidate"
   because it was authored as one. Every part of a real head is added here, on
   a portfolio whose entire search surface is a name query.

   Until now they were REGEXED OUT OF NEXT'S OWN RENDER of out/index.html,
   which made `next build` a hard dependency of the home page's head and made
   this the file that blocked deleting src/app/. They are constructed from
   src/lib/seo.ts now, which is where the rest of the site's metadata has
   always come from.

   THE REFERENCE IS KEPT WHILE THERE STILL IS ONE. src/app/ is deleted in the
   next phase and Next's render goes with it, so this is the only phase in
   which "does the emitter produce what Next produced" is answerable at all.
   It is answered on every build below rather than by a diff someone reads
   once — and the golden hash of out/index.html must not move, which is the
   proof that it worked. */
const HEAD_BUILD = resolve(root, ".build/head");
try {
  compileAndRelink({ root, project: "tsconfig.head.json", outDir: ".build/head" });
} catch (e) {
  fail(`head: ${e.message}`);
}
/* Node decides ESM vs CommonJS from the nearest package.json and this repo's
   carries no "type", so the import below would throw on the first `export`.
   build-nameplate needs no equivalent: a browser decides from the
   <script type="module"> that loads it. */
writeFileSync(join(HEAD_BUILD, "package.json"), '{ "type": "module" }\n');

const seo = await import(pathToFileURL(join(HEAD_BUILD, "lib/seo.js")).href);
const { siteMetadata } = await import(
  pathToFileURL(join(HEAD_BUILD, "lib/data/personal.js")).href
);

/* React's own escaping, which is what produced the bytes this has to
   reproduce. `’` and `—` are not in the set and stay literal; the site
   description carries both. */
const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

const ogImage = seo.absoluteSiteUrl(siteMetadata.ogImage);
/* Tag ORDER is Next's serialization order, not the order layout.tsx declares
   the fields in — og:locale sits between site_name and image, og:type comes
   last. The assertion below compares strings, so the order is part of the
   contract until Next is gone. */
const emitted = {
  title: `<title>${esc(siteMetadata.title)}</title>`,
  description: `<meta name="description" content="${esc(siteMetadata.description)}"/>`,
  canonical: `<link rel="canonical" href="${esc(`${siteMetadata.url}/`)}"/>`,
  "og:*": [
    `<meta property="og:title" content="${esc(siteMetadata.title)}"/>`,
    `<meta property="og:description" content="${esc(siteMetadata.description)}"/>`,
    /* No trailing slash here while the canonical above has one. That asymmetry
       is layout.tsx's — `alternates.canonical` is `${url}/` and
       `openGraph.url` is `url` — and it is what ships today, so it is
       preserved rather than tidied. Tidying it would move the golden hash for
       a reason unrelated to this change. */
    `<meta property="og:url" content="${esc(siteMetadata.url)}"/>`,
    `<meta property="og:site_name" content="${esc(siteMetadata.title)}"/>`,
    `<meta property="og:locale" content="en_US"/>`,
    `<meta property="og:image" content="${esc(ogImage)}"/>`,
    `<meta property="og:image:width" content="1200"/>`,
    `<meta property="og:image:height" content="630"/>`,
    `<meta property="og:type" content="website"/>`,
  ].join("\n    "),
  "twitter:*": [
    `<meta name="twitter:card" content="summary_large_image"/>`,
    `<meta name="twitter:title" content="${esc(siteMetadata.title)}"/>`,
    `<meta name="twitter:description" content="${esc(siteMetadata.description)}"/>`,
    `<meta name="twitter:image" content="${esc(ogImage)}"/>`,
  ].join("\n    "),
  "JSON-LD": `<script type="application/ld+json">${seo.jsonLdHtml(seo.siteGraph())}</script>`,
};

/* An empty data-layer field would emit a well-formed but empty tag, which is
   the shape of loss that passes every downstream check. */
for (const [name, tag] of Object.entries(emitted)) {
  if (/content=""|href=""|<title><\/title>|>\s*<\/script>/.test(tag)) {
    fail(`the head's ${name} came out empty — check src/lib/data/personal.ts`);
  }
}

/* ── Next's render, as the reference, for exactly one more phase ───────
   WHAT IS BEING READ IS ONLY NEXT'S ON THE FIRST RUN AFTER `next build`. This
   script overwrites out/index.html with its own output, head included, so a
   SECOND run in the same out/ compares the emitter against itself and passes
   trivially. `npm run build` is `next build && build-home`, so the build path
   always gets the real comparison; a bare `npm run build:home` does not. Worth
   knowing before trusting a green from one. */
const NEXT_REFERENCE = resolve(root, "src/app/page.tsx");
if (existsSync(NEXT_REFERENCE)) {
  const nextHome = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (!nextHome) {
    fail("src/app/page.tsx exists but out/index.html does not — the reference head cannot be checked");
  }
  const takeTag = (re) => (nextHome.match(re) || [])[0] ?? "";
  const takeAll = (re) => [...nextHome.matchAll(re)].map((m) => m[0]).join("\n    ");
  const scraped = {
    title: takeTag(/<title>[\s\S]*?<\/title>/),
    description: takeTag(/<meta name="description"[^>]*>/),
    canonical: takeTag(/<link rel="canonical"[^>]*>/),
    "og:*": takeAll(/<meta property="og:[^>]*>/g),
    "twitter:*": takeAll(/<meta name="twitter:[^>]*>/g),
    "JSON-LD": takeTag(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/),
  };
  const drifted = Object.keys(emitted).filter((k) => emitted[k] !== scraped[k]);
  if (drifted.length) {
    for (const k of drifted) {
      console.error(`  ! ${k} — emitted and rendered disagree`);
      console.error(`    next:    ${scraped[k] || "(absent)"}`);
      console.error(`    emitted: ${emitted[k]}`);
    }
    fail("the head computed from seo.ts is not the head Next rendered");
  }
  console.log("  · head: computed from seo.ts, byte-identical to Next's render");
} else {
  /* Announced, not silent. A gate that quietly stops checking is the exact
     failure this repository has already shipped — see the 404 that `continue`d
     past its own absence in check-static-export-seo.mjs. When src/app/ goes,
     this branch and the block above it go with it, in that same change. */
  console.log("  · head: computed from seo.ts — Next's reference render is gone");
}

{
  const had = (html.match(/<title>[\s\S]*?<\/title>/) || [])[0];
  html = html.replace(/<title>[\s\S]*?<\/title>/, emitted.title);
  console.log(
    `  · title ${had?.replace(/<\/?title>/g, "")} → ${emitted.title.replace(/<\/?title>/g, "")}`
  );
}
if (!/<meta name="description"/.test(html)) {
  html = html.replace("</head>", `    ${emitted.description}\n  </head>`);
}
const inject = [
  emitted.canonical,
  emitted["og:*"],
  emitted["twitter:*"],
  emitted["JSON-LD"],
].join("\n    ");
html = html.replace("</head>", `    ${inject}\n  </head>`);
console.log("  · head: canonical + og + twitter + JSON-LD written");

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
