/**
 * Every pinned artifact link must actually resolve.
 *
 * WHY THIS EXISTS. On 2026-08-02 the provenance audit re-pinned two test
 * counts to the commits they were measured at — and both commits were
 * UNPUSHED local work. The numbers were correct; the trees did not exist
 * publicly. `/evidence` and two case files shipped links that 404'd, and
 * the shas were printed as display text besides, so a reader was told a
 * commit and sent to nothing.
 *
 * That is a failure no offline check can catch. `check-proof-manifest`
 * already asserts the LABEL and the LINK name the same commit — they did.
 * Both named a commit that was not there. The only instrument that finds
 * this is a request.
 *
 * It also falsified a blanket claim the manifest makes in its own header:
 * "Every `source` below was fetched at this sha and returned 200."
 *
 * Runs against the BUILT output, because that is what a reader clicks,
 * and it matches `href="…"` attributes only. A looser regex over the page
 * text swallows adjacent link labels and manufactures dead URLs — during
 * the audit that produced 42 false failures out of 103, against a true 2
 * out of 61. The instrument has to be narrower than the temptation.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";
const CONCURRENCY = 8;

/* ── THE GLYPH CONTRACT (F41) ─────────────────────────────────────────
 * `↗` means the link LEAVES this site. `⟶` means it goes deeper into it.
 * A reader learns that distinction from about the third link and then
 * trusts it, which is exactly why a wrong one costs more than no glyph
 * at all: it promises a new tab and delivers a scroll, or the reverse.
 *
 * Checked as a RULE over the link's origin, never as a fix-list. On
 * 2026-08-05 the run had nine same-origin links printing `↗`; a list
 * written by reading the station handoffs would have caught eight. The
 * ninth is `the working paper` in ¶13's dawn row, which sits among three
 * genuine exits (mail, github, linkedin) and reads as a fourth. /evidence
 * had the identical defect in wave 3 — a `public/…` source on this origin
 * printing `↗` — and it was fixed there by hand, with nothing left behind
 * to stop it coming back. This is that missing thing.
 *
 * Runs against the SOURCE, not `out/`: this gate lives in the CI job that
 * does not build, and the run is hand-authored, so the source IS the
 * artifact for it. The `proof-manifest` job's own comment used to claim the
 * opposite; both halves of that disagreement were corrected on 2026-08-07,
 * and this note no longer cites a line number, because the one it cited had
 * already drifted onto an unrelated line.
 *
 * Scope is the run alone. The Next app's pages are retired by this
 * migration's Phase 4; a guard over surfaces that are being deleted would
 * be work that has to be deleted with them.
 */
const SITE = "https://ayush-yadav.com";
const GLYPH_SOURCES = ["src/run/index.html"];
const glyphFails = [];
const glyphSeen = { internal: 0, external: 0 };

for (const file of GLYPH_SOURCES) {
  const raw = readFileSync(file, "utf8");
  /* Scripts and comments carry `<a href=` in strings and in prose about
     this very rule. Blank them rather than dropping them, so the byte
     offsets a line number is counted from stay true. */
  const src = raw.replace(/<script[\s\S]*?<\/script>|<!--[\s\S]*?-->/g, (m) =>
    m.replace(/[^\n]/g, " ")
  );
  for (const m of src.matchAll(
    /<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g
  )) {
    const [, href, inner] = m;
    /* `mailto:` and in-page fragments are neither leaving nor descending,
       and the file carries one of each (#top on the masthead wordmark). */
    if (!/^https?:/i.test(href)) continue;
    const text = inner
      .replace(/&#8599;/g, "↗")
      .replace(/&#10230;/g, "⟶")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const internal = href === SITE || href.startsWith(`${SITE}/`);
    glyphSeen[internal ? "internal" : "external"] += 1;
    const want = internal ? "⟶" : "↗";
    if (text.endsWith(want)) continue;
    glyphFails.push({
      file,
      line: src.slice(0, m.index).split("\n").length,
      href,
      text,
      want,
      why: internal
        ? "same origin — it stays on this site"
        : "leaves this site",
    });
  }
}

if (glyphFails.length) {
  console.error(
    `check-links FAILED — ${glyphFails.length === 1 ? "1 link breaks" : `${glyphFails.length} links break`} the glyph contract:\n`
  );
  for (const g of glyphFails) {
    console.error(`  ✗ ${g.file}:${g.line}  wants "${g.want}" — ${g.why}`);
    console.error(`        ${g.href}`);
    console.error(`        reads: ${g.text}`);
  }
  console.error(
    "\n  ↗ leaves the site · ⟶ goes deeper into it. Fix the glyph, not this gate:\n" +
      "  the rule is about the link's origin, so there is always a right answer."
  );
  process.exit(1);
}
/* A gate that parses nothing prints the same green line as a gate that
   parsed everything, and the run is hand-authored HTML — one malformed
   anchor upstream and this regex could quietly match none of them. The
   count is the difference between "holds" and "was never asked". */
/* 14 since Phase 5 — the two bench sheads each cite a vendored record, which
   is same-origin and therefore ⟶. Raised with them rather than left at 12,
   because a floor that stops tracking what it counts is a floor that has
   stopped meaning anything. */
if (glyphSeen.internal + glyphSeen.external < 14) {
  console.error(
    `check-links FAILED — the glyph contract matched only ${glyphSeen.internal + glyphSeen.external} anchors ` +
      `in ${GLYPH_SOURCES.join(", ")}, which is fewer than the run has ever carried.\n` +
      "  That is a broken parse, not a clean page. Check the <a> markup before trusting this."
  );
  process.exit(1);
}
console.log(
  `check-links: the glyph contract holds — ${glyphSeen.internal} deeper (⟶), ` +
    `${glyphSeen.external} leaving (↗), across ${GLYPH_SOURCES.join(", ")}`
);

/* Prefer the BUILT pages — that is what a reader clicks, and it catches a
   link composed at render time from parts that are each individually fine.
   But the gates job in CI does not build, and a check that only runs after
   a five-minute build is a check that runs rarely. So fall back to the data
   layer, where every pinned artifact URL is authored. */
const pages = [];
if (existsSync(OUT)) {
  (function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith(".html")) pages.push(p);
    }
  })(OUT);
}
const usingBuild = pages.length > 0;
if (!usingBuild) {
  pages.push(
    "src/lib/data/proofManifest.ts",
    "src/lib/data/projectCaseStudies.ts",
    "src/lib/data/projects.ts",
    "src/run/index.html"
  );
}

/** url -> the files that carry it */
const links = new Map();
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  /* In built HTML the URL is an href attribute. In the TS data layer it is
     a bare string literal or a template, so match both shapes. */
  const patterns = usingBuild
    ? [/href="(https?:\/\/[^"]+)"/g]
    : [
        /href="(https?:\/\/[^"]+)"/g,
        /["'`](https:\/\/github\.com\/[^"'`\s]+)["'`]/g,
      ];
  const found = patterns.flatMap((re) => [...html.matchAll(re)]);
  for (const m of found) {
    const url = m[1];
    /* Template literals interpolate a const; those cannot be resolved by
       reading, and check-proof-manifest already asserts label/link agree. */
    if (url.includes("${")) continue;
    /* Only the artifact terminals. Deploy hosts and social profiles are a
       different question with a different failure mode (LinkedIn answers
       999 to anything that is not a browser), and a gate that goes red on
       someone else's bot policy is a gate that gets switched off. */
    if (
      !/^https:\/\/github\.com\/[^/]+\/[^/]+\/(tree|blob|commit)\//.test(url)
    ) {
      continue;
    }
    if (!links.has(url)) links.set(url, new Set());
    links.get(url).add(page);
  }
}

const urls = [...links.keys()].sort();
if (urls.length === 0) {
  console.error(
    "check-links: no pinned artifact links found — the data layer should always carry some"
  );
  process.exit(1);
}

const dead = [];
let i = 0;
async function worker() {
  while (i < urls.length) {
    const url = urls[i++];
    let status = 0;
    try {
      /* HEAD first; GitHub answers it for blob/tree. Fall back to GET,
         because a 405 is about the method, not the artifact.

         AND A 5xx IS ALSO ABOUT THE METHOD. Measured 2026-08-14: HEAD on
         applied@36a2f54 backend/tests/test_gmail_oauth_cloud.py returned 504
         three times in a row while GET on the same URL returned 200, and the
         Contents API served the blob (48,544 bytes) without complaint. HEAD
         on the sibling README at the same sha was 200, so it is that one
         file's blob view timing out, not the repo, the sha or a rate limit.
         A reader issues GET, so GET is both the stricter probe and the
         truthful one — falling back on 5xx removes a red that no visitor
         would ever have experienced. It cannot mask a real 404: a missing
         artifact answers 404 to GET too. */
      let res = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (res.status === 405 || res.status === 403 || res.status >= 500) {
        res = await fetch(url, { method: "GET", redirect: "follow" });
      }
      status = res.status;
    } catch (err) {
      status = `network: ${err.message}`;
    }
    if (status !== 200) dead.push({ url, status, pages: [...links.get(url)] });
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

if (dead.length) {
  console.error(
    `check-links FAILED — ${dead.length} of ${urls.length} pinned artifact links do not resolve:\n`
  );
  for (const d of dead) {
    console.error(`  ✗ ${d.status}  ${d.url}`);
    for (const p of d.pages.slice(0, 3))
      console.error(`        linked from ${p}`);
  }
  console.error(
    "\n  A 404 on a pinned sha usually means the commit is real but UNPUSHED.\n" +
      "  Check `git status -sb` and `git branch -r --contains <sha>` in that repo.\n" +
      "  Pushing is the fix; re-pointing the link at a different commit is not,\n" +
      "  because the number beside it was measured on the tree that is missing."
  );
  process.exit(1);
}

/* ══════════════════════════════════════════════════════════════════════
   PASS 2 — the sha has to be ON the branch this site names, not merely
   resolvable.

   WHY THIS EXISTS. Pass 1 asks "does the link answer 200", and on
   2026-08-14 every AutoML link on this site answered 200 while pointing at
   commits that had come off `main` entirely. On 12 August that repository
   consolidated: `main` was replaced by its 2,186-commit GitLab lineage and
   the GitHub main these pins were read on was parked as
   `archive/github-main`. Neither commit moved — the branch did. This site
   went on saying "the pinned public commit" and "main's public head" for
   two commits that were on neither, for six days, with every gate green,
   because a git object does not stop existing when a ref stops pointing at
   it. `tools/index.ts` was byte-identical at all three candidate refs, so
   even opening the file proved nothing.

   The failing case is the entire point: the correction that created those
   pins had itself REJECTED a third sha for having "no common ancestor with
   main" — and after the consolidation that was the only one of the three
   that was on main. A one-off manual check is a snapshot of a branch
   pointer. This is the check that keeps.

   Semantics: `compare/{default_branch}...{sha}` answers `identical` when
   the sha IS the head, `behind` when it is an ancestor of the head — those
   two are "on the branch". `ahead` and `diverged` mean the commit sits on
   some other branch, and a 404 "No common ancestor" means it is not this
   project's history at all.

   SKIPS LOUDLY, NEVER SILENTLY, and only when the API cannot be reached —
   unauthenticated GitHub allows 60 requests an hour and this needs about
   ten, so it normally runs everywhere; in Actions GITHUB_TOKEN lifts that
   to 1,000. A skip prints the reason and the shas it did not check, so the
   log never reads like a pass.
   ══════════════════════════════════════════════════════════════════════ */
const PIN =
  /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:tree|blob|commit)\/([0-9a-f]{7,40})(?:\/|$)/;
const pins = new Map(); // "owner/repo@sha" -> { owner, repo, sha, urls: Set }
for (const url of urls) {
  const m = url.match(PIN);
  if (!m) continue; // tree/<branch-name> and the like — not a pinned commit
  const [, owner, repo, sha] = m;
  const key = `${owner}/${repo}@${sha}`;
  if (!pins.has(key)) pins.set(key, { owner, repo, sha, urls: new Set() });
  pins.get(key).urls.add(url);
}

const token =
  process.env.GITHUB_TOKEN ||
  process.env.GH_TOKEN ||
  process.env.PORTFOLIO_GH_TOKEN;
const apiHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "portfolio-check-links",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

const defaultBranches = new Map(); // "owner/repo" -> branch name
const offBranch = [];
const unchecked = [];

for (const pin of pins.values()) {
  const repoKey = `${pin.owner}/${pin.repo}`;
  try {
    if (!defaultBranches.has(repoKey)) {
      const r = await fetch(`https://api.github.com/repos/${repoKey}`, {
        headers: apiHeaders,
      });
      if (!r.ok) {
        unchecked.push({ pin, why: `GET /repos/${repoKey} → ${r.status}` });
        continue;
      }
      defaultBranches.set(repoKey, (await r.json()).default_branch);
    }
    const branch = defaultBranches.get(repoKey);
    const r = await fetch(
      `https://api.github.com/repos/${repoKey}/compare/${branch}...${pin.sha}`,
      { headers: apiHeaders }
    );
    if (r.status === 404) {
      /* GitHub says "No common ancestor between X and Y" here, which is the
         loudest possible version of the finding. Pass 1 already proved the
         sha resolves, so a 404 from compare is about ancestry, not existence. */
      const body = await r.json().catch(() => ({}));
      offBranch.push({
        pin,
        branch,
        status: "no common ancestor",
        note: body.message,
      });
      continue;
    }
    if (!r.ok) {
      unchecked.push({ pin, why: `compare → ${r.status}` });
      continue;
    }
    const { status } = await r.json();
    if (status !== "identical" && status !== "behind") {
      offBranch.push({ pin, branch, status });
    }
  } catch (err) {
    unchecked.push({ pin, why: `network: ${err.message}` });
  }
}

if (offBranch.length) {
  console.error(
    `\ncheck-links FAILED — ${offBranch.length} pinned commit(s) resolve but are NOT on the branch this site names:\n`
  );
  for (const d of offBranch) {
    console.error(
      `  ✗ ${d.pin.owner}/${d.pin.repo}@${d.pin.sha} — compare/${d.branch}...${d.pin.sha} says "${d.status}"` +
        (d.note ? `\n      ${d.note}` : "")
    );
    for (const u of [...d.pin.urls].slice(0, 3)) console.error(`      ${u}`);
  }
  console.error(
    "\n  The commit exists and every link to it answers 200 — that is what makes\n" +
      "  this silent. Either the branch was renamed, replaced or archived under the\n" +
      "  pin, or the pin named a commit from a fork or an unmerged branch. RE-TAKE\n" +
      "  the measurement on the branch and re-pin; do not repoint the link at a\n" +
      "  commit nobody read the number at."
  );
  process.exit(1);
}

if (unchecked.length) {
  console.warn(
    `  ! ancestry not checked for ${unchecked.length} of ${pins.size} pinned commit(s) — the API did not answer:`
  );
  for (const u of unchecked) {
    console.warn(`  !   ${u.pin.owner}/${u.pin.repo}@${u.pin.sha} — ${u.why}`);
  }
  console.warn(
    `  ! ${token ? "A token was present, so this is not a rate limit." : "No GITHUB_TOKEN in the environment; unauthenticated GitHub allows 60/hour."}`
  );
}
console.log(
  `check-links: ${pins.size - unchecked.length} of ${pins.size} pinned commits confirmed ON their repo's default branch`
);

console.log(
  `check-links: ${urls.length} pinned artifact links across ${pages.length} ${usingBuild ? "built pages" : "source files"}, all resolve`
);
