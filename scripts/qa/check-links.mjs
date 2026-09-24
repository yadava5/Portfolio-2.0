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

/* The built site. `--out <dir>` (or CHECK_LINKS_OUT) points the built-page
   passes at a COPY: a doctored one for a negative proof, or a second build
   made while the real one is being served. The default is unchanged.

   An explicit root that is not there is a HARD failure, never a fall-through
   to the source fallback below — that path skips the built-page rules
   entirely, and a proof that never ran is worse than a red one. */
const outArg = process.argv.indexOf("--out");
const OUT =
  outArg > -1
    ? process.argv[outArg + 1]
    : (process.env.CHECK_LINKS_OUT ?? "out");
const OUT_EXPLICIT = outArg > -1 || Boolean(process.env.CHECK_LINKS_OUT);
const CONCURRENCY = 8;

/* ── THE GLYPH CONTRACT (F41) ─────────────────────────────────────────
 * `↗` means the link goes OFF THIS ORIGIN. `⟶` means it stays on it and
 * goes deeper. A reader learns that distinction from about the third link
 * and then trusts it, which is exactly why a wrong one costs more than no
 * glyph at all: it names the wrong place, and the reader believes it.
 *
 * THE ARROW DOES NOT PROMISE A TAB, and this comment claimed it did until
 * 2026-09-23 — a wrong `↗`, it read, "promises a new tab and delivers a
 * scroll, or the reverse". That conflated two questions the site answers
 * separately. WHERE a link opens is G8's target rule below, and it is
 * decided by the back button rather than by the origin: everything that
 * leaves the RUN opens away, and so does every file, on this origin or any
 * other. So the archive's `résumé (pdf) ⟶` and the case files' own plates
 * are right twice over — same origin, so `⟶`; a file, so a new tab. A `⟶`
 * that opens in a new tab is the two rules working, not a broken promise.
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
/* ── G8 · AND THE RELATIVE ONES ───────────────────────────────────────
 * Until 2026-09-23 the loop below began `if (!/^https?:/i.test(href)) continue;`
 * and the comment beside it said mailto and in-page fragments are neither
 * leaving nor descending. True of those two, and it quietly took `/resume.pdf`,
 * `/evidence/` and `../projects/glyph/` with them — every relative href on the
 * site was unchecked. The rule the reader learns is about the DESTINATION, not
 * about how the author happened to spell it: a relative href can only resolve
 * on this origin, so it can only ever be `⟶`.
 *
 * Asymmetric on purpose. An absolute URL must CARRY its glyph (that half is
 * unchanged, and the run has printed one on all 14 since Phase 5). A relative
 * href is only judged when its text already ends in an arrow, because plenty
 * of relative links here are inline words inside a sentence and a rule that
 * demanded an arrow on those would be a copy edict, not a link contract.
 */
const SITE = "https://ayush-yadav.com";
const ARROWS = /[↗⟶⟵→]$/u;
const srcArg = process.argv.indexOf("--src");
const GLYPH_SOURCES =
  srcArg > -1 ? [process.argv[srcArg + 1]] : ["src/run/index.html"];
const glyphFails = [];
const glyphSeen = { internal: 0, external: 0, relative: 0 };

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
    /* `mailto:`, `tel:` and in-page fragments are neither leaving nor
       descending, and the file carries one of each (#top on the masthead
       wordmark). Everything else has an origin and therefore an answer. */
    if (/^(mailto:|tel:|#|javascript:|data:)/i.test(href)) continue;
    const text = inner
      .replace(/&#8599;/g, "↗")
      .replace(/&#10230;/g, "⟶")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const absolute = /^[a-z][a-z0-9+.-]*:|^\/\//i.test(href);
    const internal = href === SITE || href.startsWith(`${SITE}/`);
    const sameOrigin = internal || !absolute;

    if (!absolute) {
      glyphSeen.relative += 1;
      /* only judged when it already claims to be a link with a direction */
      if (!ARROWS.test(text)) continue;
      if (text.endsWith("⟶")) continue;
      glyphFails.push({
        file,
        line: src.slice(0, m.index).split("\n").length,
        href,
        text,
        want: "⟶",
        why: "a relative href resolves on this origin — it cannot leave the site",
      });
      continue;
    }

    glyphSeen[internal ? "internal" : "external"] += 1;
    const want = sameOrigin ? "⟶" : "↗";
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
    `${glyphSeen.external} leaving (↗), ${glyphSeen.relative} relative (⟶ when ` +
    `they carry an arrow), across ${GLYPH_SOURCES.join(", ")}`
);

/* Prefer the BUILT pages — that is what a reader clicks, and it catches a
   link composed at render time from parts that are each individually fine.
   But the gates job in CI does not build, and a check that only runs after
   a five-minute build is a check that runs rarely. So fall back to the data
   layer, where every pinned artifact URL is authored. */
const pages = [];
if (OUT_EXPLICIT && !existsSync(OUT)) {
  console.error(
    `check-links FAILED — a built root was named (${OUT}) and it is not there.\n` +
      "  Naming one and getting the source fallback would skip every built-page\n" +
      "  rule and still print green, which is the one outcome a proof cannot have."
  );
  process.exit(1);
}
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

/* ── G8 · AND WHERE THE LINK OPENS ────────────────────────────────────
 * The glyph names the place; `target` decides the tab. Until 2026-09-23 not
 * one link on the RUN carried a `target` — the archive's off-origin links
 * had carried one since it was generated — while THE GLYPH CONTRACT above
 * said, until this commit, that a wrong `↗` "promises a new tab and
 * delivers a scroll". So all 26 of the run's `↗` read as that broken
 * promise, and the gate that named the defect could not see it. The arrow
 * never owed a tab; that sentence is corrected where it lives, so this one
 * quotes a claim the file no longer makes.
 *
 * The owner's ruling widened it past the glyph: "opening systems card and
 * resume in the same tab makes it hard to go back". Nothing replaces the
 * page a reader is reading.
 *
 * AND A DOCUMENT THAT LEAVES INCLUDES A FILE. The first cut of this rule
 * asked only about origin, and it sent the archive's own `résumé (pdf) ⟶`
 * into the same tab, over the case file, with nothing but the browser's
 * back button to undo it — which is the complaint the ruling started from,
 * arriving by a second road. So the split is PAGES against FILES:
 *
 *   · a PAGE is an HTML route — `/`, `/projects/glyph/`, `/evidence/`,
 *     anything resolving to a directory or to `.html`. It stays.
 *   · a FILE is any other extension — `.pdf`, `.webp`, `.png`, `.json`.
 *     It opens away, on this origin or any other.
 *
 * THE RULE on the run page, `<out>/index.html`: anything matching
 * `https?:`, `/projects…`, `/evidence…` or `resume.pdf`, AND every
 * same-origin file, carries `target="_blank"` and a `rel` with `noopener`.
 * The run is the one page the whole site is a footnote to.
 *
 * THE RULE on the archive pages, everything else under `<out>/`: off-origin
 * links and files open away; a page of this site does not. The record room
 * is a place a reader walks around inside — case file ⟶ evidence ⟶ back to
 * the working paper — and a tab per step is how a reading turns into a
 * taskbar.
 *
 * BOTH, everywhere: `#` fragments and `mailto:` carry NEITHER. A fragment
 * that opens a second tab of the page you are already on is the defect in
 * reverse, and `mailto:` hands off to a mail client — a blank tab is what
 * is left behind when it does.
 *
 * EXEMPT: anything carrying `download`. It does not navigate, so there is
 * no page for a tab to replace. Today that is six: the run's two
 * `proof/*.json` receipts, /evidence's two self-hosted `.json` sources, and
 * the raw ledger on each of the two case files that ship one.
 *
 * THIS RULE AND THE GLYPH CONTRACT DISAGREE ON PURPOSE, about
 * `ayush-yadav.com/projects/glyph/` and about every local plate. The arrow
 * is about ORIGIN and says `⟶`; the target is about the BACK BUTTON and
 * opens away. Neither is wrong, and the arrow contract is unchanged.
 *
 * Runs against the BUILT output, because `target` is an attribute a browser
 * acts on and the archive pages have no source to read: they are rendered
 * by `scripts/archive/*`. With no build it SKIPS LOUDLY — the gates job in
 * CI does not build, and a rule that prints nothing there reads like a pass.
 */
const NO_TARGET_SCHEME = /^(mailto:|tel:|#|javascript:|data:)/i;
/* The three shapes a link that leaves the run can take, exactly as the
   ruling names them: an absolute URL, a document route on this site, and
   the one-pager. Files are the fourth, and they are asked by extension
   rather than by pattern — see isFile(). */
const LEAVES_THE_RUN = [/^https?:/i, /^\/?(projects|evidence)/, /resume\.pdf/];
const opensAway = (tag) => /\starget="_blank"/i.test(tag);
const guarded = (tag) => /\srel="[^"]*\bnoopener\b[^"]*"/i.test(tag);
const carriesTarget = (tag) => /\starget="/i.test(tag);
/* `download` is the one attribute that makes the question moot: the link
   never navigates, so no page is replaced and no tab is needed. */
const downloads = (tag) => /\sdownload(?=[\s=>/])/i.test(tag);

/**
 * Is this href a FILE rather than a page of the site?
 *
 * Asked of the PATH, never of the raw href: `https://github.com/yadava5`
 * ends in `.com/yadava5` and `https://getapplied.vercel.app` ends in
 * `.app`, and a naive "does it end in a dot-something" calls both of them
 * files. Resolving against the site first throws the host away, which is
 * the only reading of "ends in an extension" that survives a bare domain.
 */
function isFile(href) {
  let path;
  try {
    path = new URL(href, `${SITE}/`).pathname;
  } catch {
    return false; // unparseable: judged as a page, i.e. the stricter answer
  }
  const last = path.slice(path.lastIndexOf("/") + 1);
  const dot = last.lastIndexOf(".");
  if (dot <= 0) return false; // a directory, a bare route, or a dotfile
  return last.slice(dot + 1).toLowerCase() !== "html";
}

/** the OPEN tag of every `<a href=…>` on a page, with the line it sits on */
function openTags(file) {
  const raw = readFileSync(file, "utf8");
  /* Same blanking as the glyph pass, and for the same reason: the run
     carries `<a href=` inside inline scripts. Blank rather than drop, so
     the line numbers below stay true. */
  const html = raw.replace(/<script[\s\S]*?<\/script>|<!--[\s\S]*?-->/g, (m) =>
    m.replace(/[^\n]/g, " ")
  );
  return [...html.matchAll(/<a\s[^>]*href="([^"]*)"[^>]*>/g)].map((m) => ({
    href: m[1],
    tag: m[0],
    line: html.slice(0, m.index).split("\n").length,
  }));
}

const RUN_PAGE = join(OUT, "index.html");
const targetFails = [];
const targetSeen = {
  pages: 0,
  leaving: 0,
  inert: 0,
  away: 0,
  archiveInternal: 0,
  exempt: 0,
};

if (usingBuild) {
  for (const page of pages) {
    targetSeen.pages += 1;
    const isRun = page === RUN_PAGE;
    for (const { href, tag, line } of openTags(page)) {
      const inert = NO_TARGET_SCHEME.test(href);
      const absolute = /^[a-z][a-z0-9+.-]*:|^\/\//i.test(href);
      const offOrigin =
        absolute && !inert && !(href === SITE || href.startsWith(`${SITE}/`));
      const where = isRun ? "the run" : "the archive";

      if (!inert && downloads(tag)) {
        targetSeen.exempt += 1;
        continue;
      }

      /* The two clauses differ in one word. The run's set is "everything
         that leaves the run", which includes this site's own pages; the
         archive's is "everything that is not a page of this site". Files
         are in both. */
      const opensElsewhere =
        !inert &&
        (isFile(href) ||
          (isRun ? LEAVES_THE_RUN.some((re) => re.test(href)) : offOrigin));

      if (opensElsewhere) {
        targetSeen[isRun ? "leaving" : "away"] += 1;
        if (opensAway(tag) && guarded(tag)) continue;
        targetFails.push({
          page,
          line,
          href,
          where,
          want: 'target="_blank" rel="noopener"',
          why: isFile(href)
            ? "it is a file, not a page — it must not replace one"
            : isRun
              ? "it leaves the run — nothing may replace the page being read"
              : "it leaves this site",
        });
        continue;
      }
      if (inert) {
        targetSeen.inert += 1;
        if (!carriesTarget(tag) && !guarded(tag)) continue;
        targetFails.push({
          page,
          line,
          href,
          where,
          want: "no target and no rel",
          why: href.startsWith("#")
            ? "a fragment scrolls — a second tab of this page is not a place"
            : "a mail client is the destination; the tab it leaves is empty",
        });
        continue;
      }
      if (!isRun) {
        targetSeen.archiveInternal += 1;
        if (!carriesTarget(tag)) continue;
        targetFails.push({
          page,
          line,
          href,
          where,
          want: "no target",
          why: "it stays inside the record room — a tab per step is a taskbar",
        });
      }
    }
  }

  if (targetFails.length) {
    const run = targetFails.filter((f) => f.where === "the run");
    const archive = targetFails.filter((f) => f.where === "the archive");
    console.error(
      `check-links FAILED — ${targetFails.length} link(s) open in the wrong place ` +
        `(${run.length} on the run, ${archive.length} in the archive):\n`
    );
    /* Printed as two sections, counted separately. One list would let the
       run's number bury the archive's, and "the archive half is green" is a
       finding that has to survive the run half being red. */
    for (const [label, group] of [
      ["the run", run],
      ["the archive", archive],
    ]) {
      if (!group.length) {
        console.error(`  · ${label}: clean\n`);
        continue;
      }
      console.error(`  · ${label}: ${group.length}`);
      for (const f of group) {
        console.error(`  ✗ ${f.page}:${f.line}  wants ${f.want} — ${f.why}`);
        console.error(`        ${f.href}`);
      }
      console.error("");
    }
    console.error(
      "  A link that leaves opens a new tab; one that stays does not. The\n" +
        "  ruling is about the back button: opening the system card or the\n" +
        "  résumé over the run makes a reader fight their way back to it."
    );
    process.exit(1);
  }

  /* The floor the glyph contract taught: a gate that parsed nothing prints
     the same green line as a gate that parsed everything. */
  if (targetSeen.pages < 8 || targetSeen.leaving < 14 || targetSeen.away < 40) {
    console.error(
      `check-links FAILED — the new-tab rule judged only ${targetSeen.leaving} leaving links ` +
        `on the run and ${targetSeen.away} on the archive pages, across ${targetSeen.pages} built pages,\n` +
        "  which is fewer than this site has ever carried. That is a broken parse, not a clean build."
    );
    process.exit(1);
  }
  console.log(
    `check-links: the new-tab rule holds — ${targetSeen.leaving} links leave the run in a new tab, ` +
      `${targetSeen.away} leave the archive, ${targetSeen.archiveInternal} stay inside it, ` +
      `${targetSeen.inert} fragments and mailto links carry no target, ` +
      `${targetSeen.exempt} download and never navigate`
  );
} else {
  console.warn(
    `  ! check-links: the new-tab rule did NOT run — no ${OUT}/ to read.\n` +
      "  ! `target` is an attribute of the built page and the archive has no source;\n" +
      "  ! run this after a build, or point it at one with --out <dir>."
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
