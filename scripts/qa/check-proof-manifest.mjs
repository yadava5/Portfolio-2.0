import fs from "node:fs";
import path from "node:path";

const manifestSource = fs.readFileSync("src/lib/data/proofManifest.ts", "utf8");
const projectsSource = fs.readFileSync("src/lib/data/projects.ts", "utf8");
const manifestIds = new Set(
  Array.from(manifestSource.matchAll(/id:\s*"([^"]+)"/g), (match) => match[1])
);
const requiredIds = [
  "jobtracker-local-classifier",
  "automl-workflow-proof",
  "visual-assist-tests",
  "taskflow-tests",
  "fast-mnist-benchmark",
  // W5 e-07 split: the ~97% accuracy is its own explicitly-HELD entry —
  // it must never be silently dropped or re-merged into the kernel claim.
  "fast-mnist-accuracy",
  "master-inventory-ledger",
  "policybot-validation",
  // CRITIC-LEDGER F54: `paid-internships-sources` was cut. It was a
  // bibliography count from a freshman writing course, for a project
  // projects.ts hides from recruiters — the ledger's only row with
  // neither a date nor a receipt. It is deliberately NOT required here.
];

function fail(message) {
  console.error(`Proof manifest check failed: ${message}`);
  process.exitCode = 1;
}

for (const id of requiredIds) {
  if (!manifestIds.has(id)) fail(`missing proof id ${id}`);
}

const entries = manifestSource.match(/\n  \{[\s\S]*?\n  \}/g) ?? [];
for (const entry of entries) {
  const id = entry.match(/id:\s*"([^"]+)"/)?.[1] ?? "unknown";
  for (const field of ["claim", "source", "verification", "privacyBoundary"]) {
    if (!entry.match(new RegExp(`${field}:\\s*"[^"]+"`))) {
      fail(`${id} missing ${field}`);
    }
  }

  const source = entry.match(/source:\s*"([^"]+)"/)?.[1];
  if (source?.startsWith("http")) {
    try {
      new URL(source);
    } catch {
      fail(`${id} has invalid URL source ${source}`);
    }
  } else if (source && !fs.existsSync(path.join(process.cwd(), source))) {
    fail(`${id} points to missing local source ${source}`);
  }

  if (
    entry.includes('visibility: "private-safe"') &&
    !entry.match(/privacyBoundary:\s*"[^"]{16,}"/)
  ) {
    fail(`${id} private-safe entry needs a real privacy boundary`);
  }

  // W5: a HELD entry is a claim NOT yet earned. It must say so with a
  // real note (what lifts the stamp) and must crosswalk to the case-file
  // receipt row that argues the held state — never float unanchored.
  if (entry.includes("held:")) {
    if (!entry.match(/held:\s*\{\s*note:\s*"[^"]{16,}"/)) {
      fail(`${id} held entry needs a real note naming what lifts it`);
    }
    if (!entry.match(/receipt:\s*\{/)) {
      fail(`${id} held entry must crosswalk to its case-file receipt row`);
    }
  }
}

// The fast-mnist accuracy claim WAS held by record from W2 until
// 2026-07-27. The gate then read: "must stay HELD until a committed eval
// artifact earns it … if someone re-earns it, they must also update this
// gate — which is the point." That artifact was committed
// (glyph@97de736: benchmarks/mnist_eval.txt + apps/eval_model.cpp), so
// the claim is earned and the guard MOVES rather than disappears.
//
// What it now protects: an earned accuracy claim must keep terminating
// at that committed eval report. The failure this catches is the entry
// quietly sliding back to README prose — the exact state the hold
// existed to mark — while still presenting as earned. A number with a
// stamp removed and its artifact gone is worse than a held number.
const accuracyEntry = entries.find((entry) =>
  entry.includes('id: "fast-mnist-accuracy"')
);
if (accuracyEntry) {
  /* Read the FIELD, never the entry text. The first cut of this guard
     tested `accuracyEntry.includes("benchmarks/mnist_eval.txt")` and
     silently passed while the source had been swapped back to README.md
     — because the entry's own explanatory comment names the artifact,
     and the comment lives inside the object braces. A gate that matches
     prose is not a gate. Verified by swapping the source and watching
     this fail. */
  const source = accuracyEntry.match(/source:\s*"([^"]+)"/)?.[1] ?? "";
  const label = accuracyEntry.match(/label:\s*"([^"]+)"/)?.[1] ?? "";
  if (accuracyEntry.includes("held:")) {
    fail(
      "fast-mnist-accuracy is earned by glyph@97de736 — remove the held stamp or restore its README source"
    );
  }
  if (!source.endsWith("/benchmarks/mnist_eval.txt")) {
    fail(
      `fast-mnist-accuracy must terminate at the committed eval report, not README prose (source is ${source || "missing"})`
    );
  }
  if (label.startsWith("~")) {
    fail(
      `fast-mnist-accuracy has a measured artifact — state the measured value, not an approximation (label is "${label}")`
    );
  }
}

const projectBlocks = projectsSource.match(/\n  \{[\s\S]*?\n  \},/g) ?? [];
for (const block of projectBlocks) {
  const title = block.match(/title:\s*"([^"]+)"/)?.[1] ?? "unknown project";
  const visible = !block.match(/portfolioVisible:\s*false/);
  const hasMetrics = block.includes("metrics:");
  if (!visible || !hasMetrics) continue;

  const proofIdsBlock = block.match(/proofIds:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
  const proofIds = Array.from(
    proofIdsBlock.matchAll(/"([^"]+)"/g),
    (match) => match[1]
  );

  if (proofIds.length === 0)
    fail(`${title} has visible metrics but no proofIds`);
  for (const proofId of proofIds) {
    if (!manifestIds.has(proofId)) {
      fail(`${title} references missing proof id ${proofId}`);
    }
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("Proof manifest check passed.");
