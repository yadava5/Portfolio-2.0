/**
 * H · the desktop non-regression rule, as an exit code.
 *
 * `docs/clarity/harness/` measures the run at five widths and writes two
 * scorecards: `emptiness.json` (near-empty screens, split into CORRIDOR — the
 * rail between stations, which is the design — and STARVED — inside a
 * station's own content box and thin on words, which is not) and
 * `metrics.json` (the full row, of which `blank` is the count of frames with
 * zero visible words).
 *
 * Those two numbers are the ones the clarity plan commits to not making
 * worse on the desktop rail. They are also the two the harness README warns
 * are read wrongly in isolation: near-empty and prose-free RISE when copy is
 * cut and station heights stay, so a copy cut and a height change have to be
 * judged together. That warning is why this asserts only the desktop seats
 * and only these two fields, rather than freezing the whole scorecard — the
 * rest are directional and belong to the owner's side-by-side read.
 *
 * The baseline is the pre-redesign live site at b6ea15df (HEAD 035ab9b):
 * starved 3/4/4 and blank 1/1/1 at 1512/1440/1280.
 *
 *   node scripts/qa/check-harness-baseline.mjs <run dir>
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const RUN = resolve(process.cwd(), process.argv[2] ?? "");
const BASE = resolve(process.cwd(), "docs/clarity/harness/baseline");
const WIDTHS = ["w1512", "w1440", "w1280"];

const read = (dir, name) => {
  const p = join(dir, name);
  if (!existsSync(p)) {
    console.error(
      `check-harness-baseline FAILED — ${p} is missing. The sweep did not produce a scorecard, ` +
        "which is a broken run, not a clean one."
    );
    process.exit(1);
  }
  return JSON.parse(readFileSync(p, "utf8"));
};

const baseEmpty = read(BASE, "emptiness.json");
const baseMetrics = read(BASE, "metrics.json");
const runEmpty = read(RUN, "emptiness.json");
const runMetrics = read(RUN, "metrics.json");

const fails = [];
const rows = [];

for (const w of WIDTHS) {
  /* Every width must be PRESENT. A sweep that skipped 1280 would otherwise
     be indistinguishable from a 1280 that held. */
  for (const [label, obj] of [
    ["emptiness", runEmpty],
    ["metrics", runMetrics],
  ]) {
    if (!obj[w]) {
      fails.push(`${w} is missing from the run's ${label}.json — it was never swept`);
    }
  }
  if (!runEmpty[w] || !runMetrics[w]) continue;

  const starved = runEmpty[w].starved;
  const starvedBase = baseEmpty[w].starved;
  const blank = runMetrics[w].blank;
  const blankBase = baseMetrics[w].blank;

  rows.push(
    `  ${w}  starved ${starved} (baseline ${starvedBase})   blank ${blank} (baseline ${blankBase})`
  );
  if (starved > starvedBase) {
    fails.push(
      `${w}: ${starved} starved screens, baseline ${starvedBase} — ` +
        `${(runEmpty[w].starvedAt ?? []).join(" ")}`
    );
  }
  if (blank > blankBase) {
    fails.push(`${w}: ${blank} blank screens, baseline ${blankBase}`);
  }
}

console.log(`check-harness-baseline: ${RUN}`);
for (const r of rows) console.log(r);

if (fails.length) {
  console.error(
    `\ncheck-harness-baseline FAILED — ${fails.length} desktop regression(s):\n`
  );
  for (const f of fails) console.error(`  ✗ ${f}`);
  console.error(
    "\n  STARVED means a near-empty screen inside a station's own content box —\n" +
      "  the reader is in the middle of something and there is nothing there. It\n" +
      "  rises when copy is cut without trimming the seat it sat in, so read this\n" +
      "  beside the height change that caused it rather than restoring the words."
  );
  process.exit(1);
}

console.log(
  `\ncheck-harness-baseline: the desktop rail holds at ${WIDTHS.join(", ")} — ` +
    "starved and blank both at or under baseline."
);
