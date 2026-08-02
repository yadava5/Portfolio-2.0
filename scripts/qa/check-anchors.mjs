/**
 * Every in-page link into the home page must land on something.
 *
 * WHY THIS EXISTS. On 2026-08-02 the provenance audit found FIVE dead
 * anchors shipping on nine indexable routes. The header's "the work" and
 * "experience" pointed at `/#work` and `/#path`; the 404's wayfinding
 * index pointed at those plus `/#who`, `/#automl` and `/#values`. The
 * shipped home page — which is `src/run/index.html`, copied over
 * `out/index.html` by scripts/run/build-home.mjs — contained none of
 * them. Only `/#gate` resolved.
 *
 * Nothing caught it, and the reason is the whole design of this file:
 *
 *   1. A HASH THAT MATCHES NOTHING IS SILENT. The browser scrolls to the
 *      top of the document and raises no error. There is no console
 *      warning, no 404, no failed request. A reader experiences it as
 *      "the link did nothing", which almost nobody reports.
 *   2. THE BROWSER SUITE BUILDS THE OTHER HOME PAGE. `test:e2e:browser-
 *      smoke` runs bare `next build`, without build-home.mjs — so it
 *      tests StoryShell, where `#values` DOES exist. The suite asserting
 *      that anchor passed happily while production was broken. A gate
 *      pointed at the wrong artifact does not merely miss defects; it
 *      certifies them.
 *
 * So this reads the RUN, which is what a visitor actually gets, and it
 * reads the link sources as text rather than trusting a render.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const read = (p) => readFileSync(resolve(root, p), "utf8");

/* The shipped home page. Not out/index.html — this gate must run without
   a build, so it reads the source the build copies verbatim. */
const run = read("src/run/index.html");
const ids = new Set(
  Array.from(run.matchAll(/\sid="([A-Za-z0-9_-]+)"/g), (m) => m[1])
);

/* Files that link INTO the home page. Each is a real render path: the
   header ships in the root layout on every Next route, the 404 on three
   artifacts, and the two page-level links close the loop back from a case
   file and from /evidence. */
const LINK_SOURCES = [
  "src/components/layout/Header.tsx",
  "src/app/not-found.tsx",
  "src/components/case-study/CaseStudyPage.tsx",
  "src/app/evidence/page.tsx",
  "src/components/layout/Footer.tsx",
];

const wanted = new Map(); // anchor -> [where it was written]

for (const file of LINK_SOURCES) {
  const src = read(file);
  for (const m of src.matchAll(/["'`]\/#([A-Za-z0-9_-]+)["'`]/g)) {
    if (!wanted.has(m[1])) wanted.set(m[1], []);
    wanted.get(m[1]).push(file);
  }
}

/* The 404 builds its hrefs from CHAPTERS, through a deliberate rename
   map — StoryShell calls one station `values` and the run calls it
   `review`, so the literal never appears in the source and a regex over
   the file alone would miss the whole index. Resolve it the way the page
   does. */
const chapters = read("src/components/story/chapters.ts");
const notFound = read("src/app/not-found.tsx");
const renames = Object.fromEntries(
  Array.from(
    (notFound.match(/const RUN_ANCHOR[^=]*=\s*\{([^}]*)\}/s)?.[1] ?? "").matchAll(
      /(\w+)\s*:\s*"([^"]+)"/g
    ),
    (m) => [m[1], m[2]]
  )
);
const skipped =
  notFound.match(/chapter\.anchor !== "([A-Za-z0-9_-]+)"/)?.[1] ?? null;

for (const m of chapters.matchAll(/anchor:\s*"([A-Za-z0-9_-]+)"/g)) {
  const raw = m[1];
  if (raw === skipped) continue; // the 404 deliberately omits this one
  const effective = renames[raw] ?? raw;
  if (!wanted.has(effective)) wanted.set(effective, []);
  wanted.get(effective).push(`src/app/not-found.tsx (via CHAPTERS "${raw}")`);
}

const dead = [];
for (const [anchor, where] of wanted) {
  if (!ids.has(anchor)) dead.push({ anchor, where: [...new Set(where)] });
}

if (dead.length) {
  console.error(
    "check-anchors FAILED — these links point at nothing on the shipped home page:\n"
  );
  for (const d of dead) {
    console.error(`  ✗ /#${d.anchor}`);
    for (const w of d.where) console.error(`      written in ${w}`);
  }
  console.error(
    `\n  the run declares: ${[...ids]
      .filter((i) => !/^(np-|b[A-Z])/.test(i))
      .sort()
      .join(" · ")}`
  );
  console.error(
    "\n  a hash that matches nothing scrolls to the top and raises no error,\n" +
      "  which is why this has to be asserted rather than noticed."
  );
  process.exit(1);
}

console.log(
  `check-anchors: ${wanted.size} home-page anchors, every one resolves in the run`
);
for (const [anchor, where] of wanted) {
  console.log(`  · /#${anchor} — ${[...new Set(where)].length} source(s)`);
}
