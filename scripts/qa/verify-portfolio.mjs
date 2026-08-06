/**
 * @fileoverview verify:portfolio — the one command that says whether the
 * portfolio still works.
 *
 * WHY THIS EXISTS. The gates in this repo are good individually and were never
 * assembled. `deploy.yml` gates a production deploy on three of them (`build`,
 * `test:seo`, `test:proof`); CI runs the rest scattered across five jobs in an
 * order nobody chose. Two consequences, both measured rather than supposed:
 *
 *   · NOTHING ASSERTED THAT out/index.html IS THE RUN. That is the whole
 *     portfolio and the first invariant of the migration. check-static-export-seo
 *     reads the file, but only for canonical / og / JSON-LD — and build-home.mjs
 *     LIFTS all three out of Next's own render, so the gate passes identically
 *     whether the 13-station run shipped or the abandoned 7-chapter React port
 *     did. The only thing that would have noticed was check-nameplate-negative,
 *     and only by accident: its injection targets happen to be CSS that is inline
 *     in the run and in a stylesheet in the React build. `assertRunShipped` below
 *     is the direct check that was missing.
 *
 *   · ORDER IS LOAD-BEARING AND WAS NOT SET. Every `test:e2e:*` script rebuilds
 *     with NEXT_PUBLIC_BASE_PATH= (empty) and re-runs build-home.mjs, OVERWRITING
 *     out/index.html mid-chain. Any out/-reading check that runs after one of them
 *     is inspecting an artifact nobody deploys. So every such check runs here
 *     BEFORE the browser step, and the browser step is always last.
 *
 * WHAT IT DOES NOT DO. It does not prove the thing was worth doing, and it does
 * not cover the whole site. Where a gate reads something other than what its name
 * suggests, that is printed beside it rather than left for the next reader to
 * discover — see `test:contrast`, which never opens the run at all.
 *
 *   node scripts/qa/verify-portfolio.mjs              full run
 *   node scripts/qa/verify-portfolio.mjs --no-e2e     skip the browser step
 *   node scripts/qa/verify-portfolio.mjs --rebaseline rewrite the golden hash
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const root = process.cwd();
const BASELINE = resolve(root, "scripts/qa/portfolio-baseline.json");
const OUT_INDEX = resolve(root, "out/index.html");

const argv = process.argv.slice(2);
const REBASELINE = argv.includes("--rebaseline");
const NO_E2E = argv.includes("--no-e2e");
/* Reads whatever is in out/ right now and runs only the two artifact checks.
   For reading a deliberate change to the run without paying for the whole
   suite — NOT a substitute for it, and it says so in the summary. It assumes
   out/ was built under the deploy env; if it was not, the hash will disagree
   for that reason alone. */
const ARTIFACT_ONLY = argv.includes("--artifact-only");

/* The deploy configuration, not the developer one. deploy.yml builds with
   exactly this, and a hash of any other build certifies an artifact that never
   reaches a reader. */
const DEPLOY_ENV = {
  ...process.env,
  NODE_ENV: "production",
  NEXT_PUBLIC_BASE_PATH: "/Portfolio-2.0",
};

const results = [];
let failed = null;

function say(msg) {
  console.log(msg);
}

/** Run an npm script with the exit code intact. Never through a pipe. */
function step(label, script, { env = process.env, reads } = {}) {
  if (failed || ARTIFACT_ONLY) return;
  say(`\n── ${label}${reads ? `  [reads ${reads}]` : ""}`);
  const r = spawnSync("npm", ["run", script], {
    cwd: root,
    env,
    stdio: "inherit",
  });
  const code = r.status ?? 1;
  results.push({ label, code });
  if (code !== 0) failed = { label, code };
}

/** Run an in-process assertion the same way, so the summary reads uniformly. */
function check(label, fn) {
  if (failed) return;
  say(`\n── ${label}`);
  try {
    fn();
    results.push({ label, code: 0 });
  } catch (err) {
    console.error(`  ✗ ${err.message}`);
    results.push({ label, code: 1 });
    failed = { label, code: 1 };
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

/* ══════════════════════════════════════════════════════════════════
   The check that was missing: out/index.html IS the run, and the run's
   whole closure shipped with it.

   The golden hash certifies ONE file. Delete src/run/wasm/ and the hash
   reproduces byte-for-byte while fig 06's classifier 404s in production,
   because the run fetches it at runtime by relative path and its own bytes
   never change. Identical exposure for the four faces and resume.pdf. That
   is why this asserts files, not just a digest.
   ══════════════════════════════════════════════════════════════════ */
function assertRunShipped() {
  assert(
    existsSync(OUT_INDEX),
    "out/index.html does not exist — did the build run?"
  );
  const html = readFileSync(OUT_INDEX, "utf8");

  const beats = (html.match(/data-beat=/g) || []).length;
  const chapters = (html.match(/data-chapter=/g) || []).length;
  assert(
    beats === 13,
    `out/index.html has ${beats} data-beat, expected 13 — this is not the run`
  );
  assert(
    chapters === 0,
    `out/index.html has ${chapters} data-chapter — the React port shipped`
  );
  say(`  · 13 data-beat, 0 data-chapter — the run is the home page`);

  /* The run carries NONE of these itself: its entire <head> is charset,
     viewport and a <title> that still says "story candidate". Every one is
     injected by build-home.mjs, and check-static-export-seo fails the deploy
     without them. */
  const head = {
    canonical: /<link rel="canonical"/,
    "og:": /<meta property="og:/,
    "twitter:": /<meta name="twitter:/,
    "JSON-LD": /<script type="application\/ld\+json"/,
  };
  for (const [name, re] of Object.entries(head)) {
    assert(re.test(html), `out/index.html carries no ${name}`);
  }
  assert(
    !/<title>[^<]*story candidate/.test(html),
    "out/index.html still carries the run's own candidate <title>"
  );
  say("  · head: canonical, og, twitter, JSON-LD, and a real title");

  const { closureFloorsBytes } = JSON.parse(readFileSync(BASELINE, "utf8"));
  for (const [rel, floor] of Object.entries(closureFloorsBytes)) {
    const path = resolve(root, rel);
    assert(
      existsSync(path),
      `${rel} did not ship — the run's closure is incomplete`
    );
    const { size } = statSync(path);
    assert(size >= floor, `${rel} is ${size} B, below its ${floor} B floor`);
  }
  say(
    `  · closure: ${Object.keys(closureFloorsBytes).length} runtime-fetched files present and non-trivial`
  );

  for (const rel of [
    "out/sitemap.xml",
    "out/robots.txt",
    "out/404.html",
    "out/evidence/index.html",
  ]) {
    assert(existsSync(resolve(root, rel)), `${rel} did not ship`);
  }
  say("  · sitemap, robots, 404 and /evidence present");
}

/* ══════════════════════════════════════════════════════════════════
   The golden hash.

   Re-baselining is deliberately awkward. The failure this guards against is
   not a wrong number, it is a RIGHT number recorded for the wrong reason —
   someone re-recording to turn a red check green, which converts the one
   artifact-level regression detector into a rubber stamp. So --rebaseline
   prints what changed and refuses to be silent about it.
   ══════════════════════════════════════════════════════════════════ */
/**
 * The pinned commit must be a tree that actually produces the pinned numbers.
 *
 * `commit` is documentation until something reads it, and documentation that
 * nothing reads goes stale in exactly the way this field did: `--rebaseline`
 * writes HEAD while the change is still uncommitted, so Phase 1's numbers were
 * recorded beside Phase 0's commit — a tree whose src/run/index.html hashes to
 * something else. Nothing went red, because nothing looked.
 *
 * Checked against `runSourceSha256` rather than the output hash, because the
 * output cannot be recovered from a commit without building it, and the source
 * can be read straight out of the object database.
 *
 * SKIPS RATHER THAN FAILS when the commit is not in the object database. CI
 * checks out at depth 1 and this file is meant to be true about history, not to
 * fail on a shallow clone. It says which happened either way — a check that
 * quietly does nothing is the thing this whole file exists to prevent.
 */
function pinnedCommitAgrees(baseline) {
  if (!baseline.commit || !baseline.runSourceSha256) return;
  const ls = spawnSync(
    "git",
    ["ls-tree", baseline.commit, "--", "src/run/index.html"],
    { cwd: root, encoding: "utf8" }
  );
  const blob = ls.stdout?.trim().split(/\s+/)[2];
  if (ls.status !== 0 || !blob) {
    say(
      `  · pinned commit ${baseline.commit.slice(0, 8)} is not in this clone — pairing not checked`
    );
    return;
  }
  const at = spawnSync("git", ["cat-file", "blob", blob], {
    cwd: root,
    encoding: "buffer",
  });
  const there = createHash("sha256").update(at.stdout).digest("hex");
  if (there !== baseline.runSourceSha256) {
    throw new Error(
      `the baseline pins commit ${baseline.commit.slice(0, 8)}, but that tree's\n` +
        `      src/run/index.html hashes to ${there.slice(0, 16)}…\n` +
        `      while the baseline records  ${baseline.runSourceSha256.slice(0, 16)}…\n\n` +
        `      The numbers and the sha have to move together, or the record names a\n` +
        `      tree that does not produce the page it claims to certify. --rebaseline\n` +
        `      writes HEAD, which is the PARENT of the commit the baseline lands in;\n` +
        `      correct the field to the new sha after committing.`
    );
  }
  say(
    `  · pinned commit ${baseline.commit.slice(0, 8)} does produce the pinned source`
  );
}

function goldenHash() {
  const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

  const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
  const actual = sha(OUT_INDEX);
  const runSource = sha(resolve(root, "src/run/index.html"));

  if (REBASELINE) {
    const commit = spawnSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    }).stdout.trim();
    console.warn(
      "  ! REBASELINING the golden hash. This is only correct if you have"
    );
    console.warn(
      "  ! read the out/index.html diff and the change was intended."
    );
    console.warn(`  !   was ${baseline.outIndexSha256}`);
    console.warn(`  !   now ${actual}`);
    baseline.outIndexSha256 = actual;
    baseline.outIndexBytes = statSync(OUT_INDEX).size;
    baseline.runSourceSha256 = runSource;
    baseline.commit = commit;
    baseline.recordedAt = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + "\n");
    /* `commit` is HEAD, which is the PARENT of the commit this baseline will
       land in — the change is still uncommitted while this runs. That was
       harmless for as long as the run source never moved, and it stopped being
       harmless the first time it did: Phase 1 pinned its own output hash beside
       Phase 0's commit, whose tree produces a different page entirely. The
       standing rule is that the number and the sha move together, so say so
       here and check it below on every ordinary run. */
    console.warn(
      `  ! commit recorded as ${commit.slice(0, 8)} — that is HEAD, the PARENT of`
    );
    console.warn(
      "  ! the commit this baseline lands in. Correct it to the new sha after"
    );
    console.warn(
      "  ! committing; the next run checks the pairing and will say so."
    );
    say(
      "  · baseline rewritten — commit it in the same change that moved the page"
    );
    return;
  }

  if (actual === baseline.outIndexSha256) {
    say(`  · out/index.html reproduces the baseline (${actual.slice(0, 12)}…)`);
    pinnedCommitAgrees(baseline);
    return;
  }

  /* Name WHICH side moved. "the hash changed" sends the next reader to the
     wrong question half the time. */
  const sourceMoved = runSource !== baseline.runSourceSha256;
  throw new Error(
    `out/index.html does not match the baseline.\n` +
      `      expected ${baseline.outIndexSha256}\n` +
      `      actual   ${actual}\n` +
      (sourceMoved
        ? `      src/run/index.html ALSO changed — if that edit was intended, review the\n` +
          `      diff and re-record with --rebaseline.`
        : `      src/run/index.html is UNCHANGED, so the BUILD moved, not the page.\n` +
          `      Do not re-baseline: find out what build-home.mjs did differently.`)
  );
}

/* ══════════════════════════════════════════════════════════════════
   The run
   ══════════════════════════════════════════════════════════════════ */

say("verify:portfolio — the 13-station run and everything that ships with it");

step("types", "typecheck");
step("lint", "lint");
step("format", "format:check");

step("build (deploy env)", "build", { env: DEPLOY_ENV });

check("the run shipped, with its closure", assertRunShipped);
check("golden hash", goldenHash);

step("static export SEO", "test:seo", { reads: "out/**" });
step("proof manifest", "test:proof", {
  reads: "src/lib/data/proofManifest.ts",
});
step("headline figures ⇄ data layer", "test:figures", {
  reads: "src/run/index.html + data layer",
});
step("beat tables", "test:beat-tables", { reads: "src/run/index.html" });
/* Before the anchors, deliberately. check-anchors resolves the 404's index
   THROUGH stations.ts, so if that file has drifted from the run this one names
   the drift and the anchors step would only report its symptom. */
step("stations ⇄ the run", "test:stations", {
  reads: "src/lib/data/stations.ts + src/run/index.html",
});
step("home-page anchors", "test:anchors", {
  reads: "src/run/index.html + React link sources",
});
step("pinned artifact links", "test:links", {
  reads: "out/** if built, else 4 source files",
});
/* THE SEAM, IN BOTH DIRECTIONS, and it now reads out/ — which is the whole
   flip. Through Phase 3 the generated archive lived in a staging directory and
   this gate was pointed there, because out/ still held the Next-rendered case
   files: their footers said `back to the work ⟵` → /#work and carried no
   rejoin link at all, so the crosswalk's fourth direction could not have gone
   green. `npm run build` emits the archive now, so the artifact this reads is
   the artifact a reader gets, and the two staging-only steps that stood here —
   `archive → staging` and `archive SEO (staging)` — are gone: the build above
   does the first and `static export SEO` already covers the second. */
step("run ⇄ archive crosswalk", "test:crosswalk", {
  reads: "out/ + src/run/index.html",
});
step("nameplate", "test:nameplate", { reads: "out/ served over http" });
step("nameplate (negative)", "test:nameplate:negative", {
  reads: "a temp copy of out/",
});
/* Behaviour, not source: hooks fillText and attributes each waybill to a
   corridor from the scroll position it was painted at. test:beat-tables reads
   the TRAV literal and would pass on a perfectly well-formed table indexed
   against the wrong stations — the defect that shipped on the other home page. */
step("cargo rides the right corridors", "test:cargo-fixture", {
  reads: "out/ in a real browser at 1440px",
});
step("og cards", "assets:check-og", { reads: "public/og + the data layer" });

/* Printed, not silently included. check-contrast.mjs hand-mirrors the palette
   from src/app/globals.css (:26-48) and scans src/**\/*.{ts,tsx} for className
   strings. src/run/index.html is HTML with inline CSS and is NEVER READ. This is
   not coverage of the live site and must not be counted as such. */
step("contrast choreography", "test:contrast", {
  reads: "REACT ONLY — never opens src/run/index.html",
});

if (NO_E2E || ARTIFACT_ONLY) {
  say(
    `\n── browser smoke  [SKIPPED via ${ARTIFACT_ONLY ? "--artifact-only" : "--no-e2e"}]`
  );
} else {
  /* LAST, always. This rebuilds with NEXT_PUBLIC_BASE_PATH= and re-runs
     build-home.mjs, so out/ afterwards is NOT the artifact hashed above. */
  step("browser smoke", "test:e2e:browser-smoke", {
    reads: "out/, rebuilt with an empty basePath",
  });
}

/* ══════════════════════════════════════════════════════════════════
   Summary
   ══════════════════════════════════════════════════════════════════ */
say("\n" + "═".repeat(70));
for (const { label, code } of results) {
  say(`  ${code === 0 ? "✓" : "✗"}  ${label}`);
}

if (failed) {
  say("═".repeat(70));
  console.error(`\nverify:portfolio FAILED at "${failed.label}".`);
  console.error(
    "Do not patch forward past a red validator. If the fix is not obvious in"
  );
  console.error(
    "one attempt, abandon the branch — the invariants outrank the phase."
  );
  process.exit(failed.code);
}

say("═".repeat(70));
if (ARTIFACT_ONLY) {
  say(
    "\nverify:portfolio PARTIAL — artifact checks only. Every gate was skipped."
  );
} else if (NO_E2E) {
  say(
    "\nverify:portfolio PARTIAL — the browser step did not run. Not a full pass."
  );
} else {
  say("\nverify:portfolio: green.");
}
if (!NO_E2E && !ARTIFACT_ONLY) {
  say(
    "\nNote: out/ now holds the empty-basePath e2e rebuild, not the deploy build\n" +
      "that was hashed. Anything inspecting out/ from here must rebuild first:\n" +
      "  NODE_ENV=production NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0 npm run build"
  );
}
