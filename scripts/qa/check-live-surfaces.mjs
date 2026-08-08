/**
 * Fetch every live app and every System Card the portfolio points a reader at.
 *
 * WHY THIS EXISTS, and it is not hypothetical. Before 2026-08-07 nothing in
 * this repository ever made a request to `liveUrl` or `systemCardUrl`.
 * `check-links` filters to github.com owner/repo tree, blob and commit URLs
 * only, and skips anything interpolated, so all six deploy hosts fell outside
 * it. `atlas.spec.ts` only asserts the STRING SHAPE — that `systemCardUrl` equals
 * `liveUrl + "/system-card"`. A string can be perfectly shaped and serve a
 * 404, or serve a build from three weeks ago.
 *
 * On 2026-08-07 three of the six were doing exactly that. `getglyph.vercel.app`,
 * `usecadenceapp.vercel.app` and `getlifequest.vercel.app` were MANUAL ALIASES
 * rather than project domains: `vercel alias set` pins a hostname to one
 * deployment and never moves it again, so every subsequent production deploy
 * silently orphaned them. getglyph was serving glue two builds old — the
 * broken-CSP build, in fact — while the project's own domain served the fix.
 * Every one of them answered 200 the whole time. A reachability check alone
 * would have seen nothing wrong, which is why this gate reports the ETag and
 * byte length it saw: those are what change when a host goes stale, and a
 * human reading CI output can compare them across runs.
 *
 * Scope and failure policy. These are the OWNER'S OWN deploys, which is what
 * makes them fair to block on — the standing rule against gates that go red on
 * someone else's bot policy (see check-links' note on LinkedIn answering 999)
 * is about third parties, not about your own hosts. A non-200 here means a
 * reader following a citation from the run lands on nothing.
 *
 * It deliberately does NOT run inside `verify-portfolio.mjs`. That validator is
 * what `deploy.yml` executes, and wiring six third-party hosts into the deploy
 * path means a transient Vercel blip stops the portfolio from shipping. This
 * runs in ci.yml's `proof-manifest` job instead, next to `test:links`, which is
 * the job that already owns network truth.
 */
import { readFile } from "node:fs/promises";

const SOURCE = "src/lib/data/projects.ts";
const CONCURRENCY = 6;
const TIMEOUT_MS = 25_000;

const src = await readFile(SOURCE, "utf8");

/* Both fields are plain string literals in this file — no interpolation, which
   is the property that lets a regex be honest here. If that ever changes, this
   gate must be rewritten rather than taught to skip, because a skipped URL is
   exactly the hole it was built to close. */
const interpolated = src.match(/(?:liveUrl|systemCardUrl):\s*`/g);
if (interpolated) {
  console.error(
    `check-live-surfaces: ${interpolated.length} liveUrl/systemCardUrl value(s) are template literals.\n` +
      "This gate reads string literals; resolve them or extend the reader. Refusing to skip."
  );
  process.exit(1);
}

const urls = new Set();
for (const m of src.matchAll(
  /(?:liveUrl|systemCardUrl):\s*"(https?:\/\/[^"]+)"/g
)) {
  urls.add(m[1]);
}

/* A floor, not a count: the six System Cards plus their six hosts. Written as
   a floor with a reason so that adding a seventh project does not red this
   gate, while deleting the lot cannot quietly pass it.

   2026-08-07: the floor was 12 and the real count is 13 — seven non-null
   `liveUrl` and six `systemCardUrl` — so exactly one URL could vanish
   without reding this. The thirteenth is
   https://yadava5.github.io/paid-internships-advocacy (projects.ts:600), a
   GitHub Pages site rather than a Vercel deploy, which is why counting
   "six projects x 2" missed it; the scope note above says the owner's own
   deploys, not Vercel's.

   It is hand-set rather than derived. Deriving it from the parsed URL count
   would give `urls.size < urls.size`, a comparison that can never be true —
   a gate that cannot fire, which is worse than the slack it replaced. */
const FLOOR = 13;
if (urls.size < FLOOR) {
  console.error(
    `check-live-surfaces: found only ${urls.size} live/system-card URLs in ${SOURCE}, expected at least ${FLOOR}.\n` +
      "Either the data moved or the reader broke. Both are failures."
  );
  process.exit(1);
}

/* ── WHY A 200 IS NOT EVIDENCE, AND WHAT IS ────────────────────────────
   Measured 2026-08-07 with a random nonexistent path per host:

     getglyph            200  (1,640 B)   catch-all
     usecadenceapp       200    (695 B)   catch-all
     getlifequest        200    (740 B)   catch-all
     jetpack-compress    200  (1,138 B)   catch-all
     getapplied          404  (8,398 B)   honest
     agentic-automl      404     (79 B)   honest

   Four of six rewrite every unmatched path to the SPA shell, so on those
   hosts `res.status === 200` is satisfied by a deleted route, a typo, or an
   empty deploy. The gate born from the stale-alias incident could not catch
   the regression class it exists for.

   The discriminator is the <title>, and it is the cheapest one available:
   the card shells are 434-559 bytes of empty <div id="root">, so the BODY
   proves nothing without a browser — but the title is server-rendered and
   host-specific, and a catch-all echo returns the ROOT shell carrying the
   APP's title, not the card's. One string match therefore catches echoes,
   deleted routes and wrong-project responses at once, with no browser.

   Editions are matched as a PATTERN, not frozen as a literal. AutoML serves
   "Agentic AutoML — Expo Booklet · Miami CSE 449" where its five siblings
   serve "Vol. 01"; that difference is deliberate and is the proof the repo
   was left alone. Pinning that exact string would turn rebuilding automl's
   card — a thing the owner may well want to do — into a red gate, so both
   editions are accepted and only the PROJECT NAME is mandatory. What must
   never pass is a card whose title belongs to a different project, or to
   the app rather than the card. */
const CARD_TITLE = {
  "https://getglyph.vercel.app/system-card": "Glyph",
  "https://usecadenceapp.vercel.app/system-card": "Cadence",
  "https://getapplied.vercel.app/system-card": "Applied",
  "https://getlifequest.vercel.app/system-card": "LifeQuest",
  "https://jetpack-compress.vercel.app/system-card": "jetpack-compress",
  "https://agentic-automl-platform.vercel.app/system-card": "Agentic AutoML",
};
/* Either booklet edition, but it must BE a booklet — the app shells a
   catch-all would echo carry neither phrase. */
const EDITION = /System Card · Vol\. \d+|Expo Booklet/;

/* Every card URL in the data layer must be declared above. A card that
   appears in projects.ts and not here would otherwise be title-checked by
   nobody while still counting toward the floor — an assertion that reads
   like coverage and is not. */
const declaredCards = new Set(Object.keys(CARD_TITLE));
const foundCards = [...urls].filter((u) => u.endsWith("/system-card"));
const undeclared = foundCards.filter((u) => !declaredCards.has(u));
const phantom = [...declaredCards].filter((u) => !urls.has(u));
if (undeclared.length || phantom.length) {
  console.error(
    "check-live-surfaces: the card title table and the data layer disagree.\n" +
      (undeclared.length
        ? `  in ${SOURCE} but undeclared here: ${undeclared.join(", ")}\n`
        : "") +
      (phantom.length
        ? `  declared here but absent from ${SOURCE}: ${phantom.join(", ")}\n`
        : "") +
      "  Declaring a card is how it gets checked. Add it or remove it, do not skip."
  );
  process.exit(1);
}

const titleOf = (html) =>
  html
    .match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    .replace(/\s+/g, " ")
    .trim() ?? "";

async function probe(url) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "portfolio-live-surface-check" },
    });
    const body = await res.arrayBuffer();
    const expectName = CARD_TITLE[url];
    let title = "";
    let titleNote = "";
    let titleOk = true;
    if (expectName !== undefined) {
      title = titleOf(new TextDecoder().decode(body));
      if (!title) {
        titleOk = false;
        titleNote = "no <title> at all";
      } else if (!title.includes(expectName)) {
        titleOk = false;
        titleNote = `title does not name ${expectName} — got "${title}"`;
      } else if (!EDITION.test(title)) {
        titleOk = false;
        titleNote = `title names ${expectName} but is not a booklet edition — got "${title}"`;
      }
    }
    return {
      url,
      ok: res.status === 200 && titleOk,
      status: res.status,
      bytes: body.byteLength,
      etag: res.headers.get("etag") ?? "-",
      ms: Date.now() - started,
      title,
      titleNote,
    };
  } catch (err) {
    return {
      url,
      ok: false,
      status: `ERR ${err.name}`,
      bytes: 0,
      etag: "-",
      ms: Date.now() - started,
      title: "",
      titleNote: "",
    };
  }
}

const queue = [...urls].sort();
const results = [];
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) results.push(await probe(queue.shift()));
  })
);
results.sort((a, b) => a.url.localeCompare(b.url));

for (const r of results) {
  console.log(
    `${r.ok ? "  ok " : "DEAD "}${String(r.status).padEnd(6)} ${String(r.bytes).padStart(7)}B  ${String(r.ms).padStart(5)}ms  ${r.etag.slice(0, 18).padEnd(20)} ${r.url}` +
      (r.title ? `\n        title: ${r.title}` : "") +
      (r.titleNote ? `\n        ✗ ${r.titleNote}` : "")
  );
}

const dead = results.filter((r) => !r.ok);
if (dead.length) {
  const notServing = dead.filter((r) => r.status !== 200);
  const wrongTitle = dead.filter((r) => r.status === 200 && r.titleNote);
  console.error(
    `\ncheck-live-surfaces: ${dead.length} of ${results.length} surfaces failed.\n` +
      (notServing.length
        ? `  ${notServing.length} did not answer 200. The run cites these from ¶07 and ¶08; a dead one is a citation to nothing.\n`
        : "") +
      (wrongTitle.length
        ? `  ${wrongTitle.length} answered 200 with the wrong title — which is what a catch-all echo, a deleted route\n` +
          `  or a wrong-project deploy looks like on the four hosts that rewrite everything to the shell.\n`
        : "")
  );
  process.exit(1);
}

const checkedTitles = results.filter((r) => r.title).length;
console.log(
  `\ncheck-live-surfaces: ${results.length} live + system-card URLs all answered 200, ` +
    `and ${checkedTitles} card titles name their own project and a booklet edition.`
);
