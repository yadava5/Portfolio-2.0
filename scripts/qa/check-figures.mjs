/**
 * Cross-check the run's headline figures against the production data layer.
 *
 * The run is hand-authored HTML and the data layer is TypeScript, so every
 * number the site states lives in TWO places with nothing binding them. That
 * is not hypothetical drift: on 2026-07-31 a single audit found the two
 * disagreeing on jetpack's throughput (6.5x vs 6.4x), its Adler-32 multiplier
 * (2.8x vs 2.9x in the résumé), Applied's CI floor (named vs deliberately
 * vague), and AutoML's team size — and every correction had to be applied
 * twice by hand.
 *
 * This asserts the pairs that matter still agree. It is deliberately a small
 * allow-list of headline figures rather than a general extractor: a general
 * one would either miss the interesting cases or drown in false positives,
 * and a guard nobody trusts gets deleted.
 *
 * Each entry names WHERE the truth came from, because the lesson of that
 * audit was that prose about evidence goes stale while the evidence does not.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (p) => readFileSync(resolve(root, p), "utf8");

/* The run's prose only — scripts and styles carry unrelated numbers. */
const runProse = read("src/run/index.html")
  .replace(/<script[\s\S]*?<\/script>/g, "")
  .replace(/<style[\s\S]*?<\/style>/g, "")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<[^>]*>/g, " ")
  .replace(/&#8202;|&nbsp;/g, " ")
  .replace(/\s+/g, " ");

const projects = read("src/lib/data/projects.ts");
const cases = read("src/lib/data/projectCaseStudies.ts");
const dataLayer = projects + cases;

/**
 * @type {{figure: string, run: RegExp, data: RegExp, source: string}[]}
 */
const FIGURES = [
  {
    figure: "jetpack · parallel speed-up",
    run: /6\.4× single-threaded java\.util\.zip/,
    data: /6\.4× vs single-threaded java\.util\.zip/,
    source: "benchmarks/jmh-results-rigorous.json — 422.0 / 66.2 = 6.378",
  },
  {
    figure: "jetpack · parallel throughput",
    run: /422 vs 66 mb\/s/i,
    data: /422 vs 66 MB\/s/,
    source: "benchmarks/jmh-results-rigorous.json, 3 forks",
  },
  {
    figure: "jetpack · Adler-32 vs scalar",
    run: /adler-32 vectorised 2\.8× scalar/i,
    data: /2\.8× vs scalar/,
    source: "benchmarks/jmh-results-rigorous.json — 4256.6 / 1518.2 = 2.804",
  },
  {
    figure: "jetpack · Adler-32 absolute",
    run: /4\.26 gb\/s/i,
    data: /4\.26 GB\/s/,
    source: "benchmarks/jmh-results-rigorous.json — 4256.6 MB/s",
  },
  {
    figure: "Applied · CI macro-F1 floor",
    run: /below 0\.95 macro-f1/i,
    data: /0\.95/,
    source: "jobtracker .github/workflows/backend-ci.yml — --min-macro-f1 0.95",
  },
  {
    figure: "Applied · backend suite",
    run: /271 passed · 10 skipped/,
    data: /271 tests passed, 10 skipped/,
    source: "case file, re-run at the pin 36a2f54 on 2026-07-26",
  },
  {
    figure: "Glyph · MNIST accuracy",
    run: /97\.01%/,
    data: /97\.01/,
    source: "committed eval at GLYPH_EVAL_SHA",
  },
];

/* Claims the run must NOT make bare, because their source qualifies them. */
const QUALIFIED = [
  {
    figure: "policybot cited-source sweep",
    bare: /19\/20 cited-source sweep(?!,? self-reported)/i,
    why: "the case file calls 19/20 and 17/25 disclosed self-reports — the grader and per-case pass criteria are not published",
  },
];

const fails = [];
const notes = [];

for (const f of FIGURES) {
  const inRun = f.run.test(runProse);
  const inData = f.data.test(dataLayer);
  if (inRun && inData) {
    notes.push(`  · ${f.figure} — agrees  (${f.source})`);
  } else {
    fails.push(
      `  ✗ ${f.figure}\n      run: ${inRun ? "states it" : "MISSING"}` +
        `   data layer: ${inData ? "states it" : "MISSING"}\n      truth: ${f.source}`
    );
  }
}

/* Windowed check: an attribution may precede or follow its figure. */
for (const { figure, needle, within, why } of [
  {
    figure: "Applied macro-F1 0.9791",
    needle: "0.9791",
    within: /rules/i,
    why: "0.9791 is the RULES stage — Applied's hybrid_profile 'deterministic' disables SetFit and the full cascade scores 0.958, so a bare figure credits the ML stack with the regex layer's score",
  },
]) {
  let i = -1;
  let bare = 0;
  while ((i = runProse.indexOf(needle, i + 1)) > -1) {
    if (!within.test(runProse.slice(Math.max(0, i - 150), i + 160))) bare++;
  }
  if (bare) fails.push(`  ✗ ${figure} stated bare ${bare}×\n      ${why}`);
  else notes.push(`  · ${figure} — attributed everywhere it appears`);
}

for (const q of QUALIFIED) {
  if (q.bare.test(runProse)) {
    fails.push(`  ✗ ${q.figure} stated without its qualifier\n      ${q.why}`);
  } else {
    notes.push(`  · ${q.figure} — carries its qualifier`);
  }
}

/* ── QUOTED PEOPLE ────────────────────────────────────────────────────
   A named person's words must appear on the page exactly as they wrote
   them. The station says the testimonials are "unedited except where an
   ellipsis marks a cut", and I shipped a version that had quietly
   anglicised Randall Vollen's "analyze" and "prioritization" — the page
   claiming unedited while being edited. Nothing else on this site can be
   wrong in a way that matters more: a number can be re-measured, a
   misquotation of a real person cannot be undone.

   Checked as fragments rather than whole quotes because the station
   legitimately elides with an ellipsis; every run of >=6 words the page
   presents inside quotation marks must occur verbatim in the source. */
const testimonials = read("src/lib/data/testimonials.ts");
/* Scope to the co-signers' blockquotes rather than "any quoted run of
   text". A greedy quote regex over the whole page ran from the epigraph's
   closing quote to the next one and swallowed unrelated copy — precision
   here comes from knowing WHERE testimony lives, not from a cleverer regex. */
const runHtml = read("src/run/index.html");
const testimony = [...runHtml.matchAll(
  /<figure class="cosign"[^>]*>\s*<blockquote>([\s\S]*?)<\/blockquote>/g
)].map((m) =>
  m[1]
    .replace(/&ldquo;|&rdquo;/g, "")
    .replace(/&rsquo;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;|&#8202;/g, " ")
    .replace(/<[^>]*>/g, "")
);
const norm = (x) => x.replace(/[^\w\s'-]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
const hay = norm(read("src/lib/data/testimonials.ts"));
let drifted = 0;
for (const q of testimony) {
  for (const frag of q.split(/\s*…\s*/)) {
    const n = norm(frag);
    if (n.split(" ").length < 6) continue;
    if (!hay.includes(n)) {
      fails.push(`  ✗ testimony not verbatim in testimonials.ts\n      "${frag.trim().slice(0, 80)}…"`);
      drifted++;
    }
  }
}
if (!testimony.length) fails.push("  ✗ no co-signer testimony found to verify");
else if (!drifted)
  notes.push(`  · ${testimony.length} co-signer quotes match testimonials.ts word for word`);

for (const n of notes) console.log(n);
if (fails.length) {
  console.error(`\ncheck-figures FAILED — the run and the data layer disagree:`);
  for (const f of fails) console.error(f);
  process.exit(1);
}
console.log(`\ncheck-figures: ${notes.length} figures bound to the data layer`);
