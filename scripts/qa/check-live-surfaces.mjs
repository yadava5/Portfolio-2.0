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
   gate, while deleting the lot cannot quietly pass it. */
const FLOOR = 12;
if (urls.size < FLOOR) {
  console.error(
    `check-live-surfaces: found only ${urls.size} live/system-card URLs in ${SOURCE}, expected at least ${FLOOR}.\n` +
      "Either the data moved or the reader broke. Both are failures."
  );
  process.exit(1);
}

async function probe(url) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "portfolio-live-surface-check" },
    });
    const body = await res.arrayBuffer();
    return {
      url,
      ok: res.status === 200,
      status: res.status,
      bytes: body.byteLength,
      etag: res.headers.get("etag") ?? "-",
      ms: Date.now() - started,
    };
  } catch (err) {
    return {
      url,
      ok: false,
      status: `ERR ${err.name}`,
      bytes: 0,
      etag: "-",
      ms: Date.now() - started,
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
    `${r.ok ? "  ok " : "DEAD "}${String(r.status).padEnd(6)} ${String(r.bytes).padStart(7)}B  ${String(r.ms).padStart(5)}ms  ${r.etag.slice(0, 18).padEnd(20)} ${r.url}`
  );
}

const dead = results.filter((r) => !r.ok);
if (dead.length) {
  console.error(
    `\ncheck-live-surfaces: ${dead.length} of ${results.length} surfaces did not answer 200.\n` +
      "The run cites these from ¶07 and ¶08. A dead one is a citation to nothing."
  );
  process.exit(1);
}

console.log(
  `\ncheck-live-surfaces: ${results.length} live + system-card URLs all answered 200.`
);
