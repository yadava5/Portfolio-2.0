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
         because a 405 is about the method, not the artifact. */
      let res = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (res.status === 405 || res.status === 403) {
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

console.log(
  `check-links: ${urls.length} pinned artifact links across ${pages.length} ${usingBuild ? "built pages" : "source files"}, all resolve`
);
