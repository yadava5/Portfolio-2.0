# Phase 1 run log — the measurements this audit is built on

Every row records the command, the commit it ran at, and the raw result. A claim
whose row cannot name a command is not a verified claim.

**Machine** (throughput is a property of the box, per jetpack's own
`benchmarks/ENVIRONMENT.md`): Apple MacBook Pro `MacBookPro18,3`, M1 Pro, 10
cores (8P + 2E), 16 GiB, 128-bit NEON. Toolchain: JDK **25.0.3** (Homebrew,
`/opt/homebrew/opt/openjdk@25`) with Maven 3.9.16 on JDK 26.0.1 · Python 3.14.4
(and Applied's own `.venv311` on 3.11.14) · Node 24.9.0 · cmake 4.2.1 · Xcode
26.6.

> The committed JMH JSON records `jvm: /opt/homebrew/Cellar/openjdk@25/25.0.3/…`
> — the same JDK on the same model of machine that produced the published
> numbers. The comparison is therefore valid rather than merely indicative.

---

## jetpack-compress — `yadava5/jetpack-compress` @ `2caacd0` (pin **is** HEAD, tree clean)

**Suite.** `JAVA_HOME=/opt/homebrew/opt/openjdk@25 mvn -q -DskipTests=false test`
→ exit 0. Surefire XML summed across 5 classes:

```
tests=72  errors=0  skipped=0  failures=0
```

**Site says** "72 tests, 0 failures" · "compiles clean on JDK 25" — **both hold**,
and this is now a *run*, not a README status line. The `sourceKind:
"self-authored"` qualifier on the proof-manifest entry can come off.

**Benchmarks, recomputed from the committed JMH JSON** (`-rf json` output, which
carries its own fork/warmup/measurement counts):

| benchmark | quick (1 fork, 3×1 s / 4×1 s) | rigorous (3 forks, 3×2 s / 5×2 s) |
|---|---|---|
| `Compression.singleThreadedJdk` | 66.0 MB/s ±0.3 | 66.2 MB/s ±0.5 |
| `Compression.parallelVirtualThreads` | 454.9 MB/s ±22.2 | 422.0 MB/s ±21.1 |
| **parallel speed-up** | **6.892×** | **6.378×** |
| `Adler32.scalar` | 1500.5 MB/s ±165.6 | 1518.2 MB/s ±60.2 |
| `Adler32.vector` | 4378.4 MB/s ±556.9 | 4256.6 MB/s ±293.3 |
| **vector / scalar** | **2.918×** | **2.804×** |
| `Adler32.jdkIntrinsic` | 13.81 GB/s | 14.06 GB/s |

**Verdict.** The run's figures — 6.4× · 422 vs 66 MB/s · 2.8× · 4.26 GB/s ·
intrinsic 14.06 GB/s — are the **rigorous** run, and every one is exact. The
run's own footnote *"across both committed runs the ratio spans 6.38–6.89×"* is
also exact.

**`public/resume.pdf` quotes the QUICK run and is internally inconsistent**:
6.5× · 455 vs 66 MB/s · 2.9× · 4.38 GB/s. 455/66 = **6.89**, not the 6.5 the same
line states. This is the one surface still mixing two runs.

---

## Applied — `yadava5/applied`, local HEAD `0f2b63f` (pin `36a2f54` is 17 behind)

**Suite.** `pytest tests -q` in `.venv311` (Python 3.11.14) with
`JOBTRACKER_ENVIRONMENT=test`, `PYTHON_KEYRING_BACKEND=…null.Keyring`:

```
278 passed, 10 skipped in 39.90s
```

**Site says 271 passed · 10 skipped** — that was the count at the pin. The tree
grew by 7; the skips are unchanged (the Postgres RLS module, which needs a live
database URL).

**Rules gate.** `evaluate_classifier --mode rules --min-macro-f1 0.95
--tolerance 0.001` → **PASS**:

```
samples: 96 | accuracy: 0.9792 | macro_f1: 0.9791 | weighted_f1: 0.9791 | misclassified: 2
```

**Rule census**, by importing `jobtracker.classifier.rules` and summing the
`CategoryPatterns` dataclass fields across all 7 categories:

```
strong=106  weak=26  negative=69   TOTAL = 201
ATS_DOMAINS = 14
```

**Eval-set census**, read from `classifier_eval_v3.jsonl`: **96 samples, 8
classes, 12 each** (applied · pending_application · interview · rejection ·
offer · assessment · follow_up · other).

**Verdict.** `201 regex rules`, `macro-f1 0.9791`, `96-sample eval`, `8 classes`,
`2 misclassified`, and the `0.95` CI floor are all **exact**, and the attribution
to the *rules stage* is confirmed by the gate that produced the number. Only the
suite count moved: **271 → 278**.

---

## Cadence — `yadava5/cadence`, local HEAD `932625e` (pin `69a59e7` is 249 behind)

```
backend   vitest run --config vitest.backend.config.ts
          Test Files  23 passed | 1 skipped (24)
          Tests      533 passed | 11 skipped (544)

frontend  vitest run --config vitest.config.ts
          Test Files  58 passed (58)
          Tests      635 passed (635)
```

**635 + 533 = 1,168 passed, 11 skipped.**

**Verdict.** The **home page is right** — it already says `1,168 passed · 11
skipped — 635 fe + 533 be`. **`/evidence` is the stale surface**, still printing
`1,145 automated tests` and `634 frontend + 511 backend`. The one skipped file is
the Postgres RLS suite, which needs `RLS_TEST_PG_ADMIN_URL`.

---

## Agentic AutoML — local HEAD `45fc0030` (pin `e506c91` is 5 behind)

```
backend   127 test files, 1412 passed
frontend  122 test files,  985 passed
```

**2,397 tests total.** The site currently claims **no** test count for AutoML —
this is a true result the site does not use, not a discrepancy.

---

## Glyph — `yadava5/glyph`, local HEAD `3ec3a4a` (accuracy pin `97de736` is 1 behind; bench pin `c6e5c0b` is 3 behind)

**Suite.** `cmake -S . -B build-audit -DCMAKE_BUILD_TYPE=Release
-DFAST_MNIST_ENABLE_OPENMP=ON -DBUILD_TESTING=ON` then `ctest`:

```
100% tests passed, 0 tests failed out of 34
```

**MNIST evaluation — reproduced byte-for-byte.** `apps/eval_model.cpp` has **no
`add_executable` in any CMakeLists** (targets exist for cli, trainer,
export_weights, server, tests, benchmarks and wasm — not for this), so it was
hand-compiled:

```
g++ -std=c++20 -O3 -I include -I . apps/eval_model.cpp -o glyph_eval libfast_mnist.a
./glyph_eval model.weights data TestingSetList.txt <outdir>
```

```
Model  : model.weights (800678 bytes, sha256 dddc925062c6a918…)
Dataset: TestingSetList.txt -> 10000 images
Correct: 9701 / 10000
Accuracy: 97.0100%
Errors : 299
```

`diff` against the committed artifacts: **`mnist_eval.json` IDENTICAL,
`mnist_misclassified.csv` IDENTICAL** (300 lines = 299 misses + header).
macro P/R/F1 `0.970056 / 0.969845 / 0.969822`, 10 per-class rows.

**Verdict.** `97.01%` · `9,701/10,000` · `macro-f1 0.9698` · `784 ⟶ 100 ⟶ 10` are
all exact **and deterministically reproducible**. The proof manifest's
`sourceKind: "self-authored"` on this entry is now *too weak* — this is not
documentation of a result, it is a result that regenerates byte-for-byte from
committed code and committed weights. The remaining honest caveat is the missing
build target, not the number.

**Kernel benchmark — re-measured today, three configurations.** Built into the
scratchpad rather than run through `tools/run_benchmarks.py`, which writes into
the project repo. Google Benchmark, `--benchmark_min_time=1s
--benchmark_repetitions=3`, means reported (ns):

| case | baseline | native | omp+native | baseline / omp |
|---|---|---|---|---|
| `benchDot/32` | 6,412 | 6,430 | 6,538 | 0.981× |
| `benchDot/64` | 56,545 | 56,750 | 121,178 | 0.467× |
| `benchDot/128` | 615,417 | 613,643 | 398,727 | 1.543× |
| **`benchDot/256`** | **4,858,722** | **4,891,375** | **1,380,288** | **3.520×** |
| `benchTranspose/1024` | 826,622 | 891,614 | 226,979 | 3.642× |
| `benchLearn` | 22,285 | 22,382 | 22,465 | 0.992× |
| `benchClassify` | 14,238 | 14,277 | 14,245 | 0.999× |

**dot 256 = 3.520× today** against the committed **3.504×** — reproduced.

**But one label on this claim is wrong, and it is worth stating precisely.** The
repository's own three variants are `baseline`, **`native`** (`-march=native`)
and `openmp+native`. On this arm64 machine the `baseline` and `native` binaries
are **byte-identical** — same md5, `e67a79a42a21fc7da1738f5003ffbd63` — because
`-march=native` is an x86 flag that clang does not act on here. Only the OpenMP
build differs (`0c215d07…`).

So the site's *"simd alone is 1.02×"* is a comparison of a binary **with
itself**. My own measurement of it came out `0.993×`; the committed run says
`1.016×`. Both are run-to-run noise around 1.0, which is exactly what comparing
identical binaries should produce.

The site's **argument** is right and already honest — *"parallelism carries it"* —
and `3.5×` is real. What needs correcting is the attribution: that figure is
`openmp+native`, and the hand-written NEON path is present in **both** binaries,
so it is not an isolated measurement of SIMD at all.

**Portfolio-served WASM**, measured on the bytes this site actually ships:
`src/run/wasm/fast_mnist.wasm` = 46,960 B = **45.9 KB** ✓ ·
`model.weights.bin` = 318,064 B = **310.6 KB** ✓ · glue `fast_mnist.js` = 43,330 B.

---

## jetpack — the JMH re-run, and why the site should NOT adopt its numbers

Re-run today on a clean box, same JDK 25.0.3, same flags as the committed runs
(`mvn -Pbench package`, then `-f 1 -wi 3 -i 4 -w 1 -r 1` and
`-f 3 -wi 3 -i 5 -w 2 -r 2`), output written to the scratchpad, never into the
project repo.

| figure | committed rigorous | **re-run today, rigorous** | committed quick | re-run today, quick |
|---|---|---|---|---|
| `singleThreadedJdk` | 66.2 MB/s | **66.7** | 66.0 | 66.2 |
| `parallelVirtualThreads` | 422.0 MB/s | **473.8** | 454.9 | 450.2 |
| **parallel speed-up** | **6.378×** | **7.104×** | 6.892× | 6.798× |
| `Adler32.vector` | 4.257 GB/s | **4.432** | 4.378 | 4.423 |
| **vector / scalar** | **2.804×** | **2.855×** | 2.918× | 2.832× |
| `jdkIntrinsic` | 14.06 GB/s | **14.33** | 13.81 | 14.29 |

Today's rigorous run is **faster** than the committed one — 7.10× against 6.38×,
error bars that do not overlap (±10.6 vs ±21.1 on the parallel score). That is a
real difference in machine state, not noise; the committed rigorous run is the
lowest of the four measurements and today's is the highest.

**The site keeps its published figures, and that is the correct call.** Three
reasons:

1. The site's numbers — 6.4× · 422 vs 66 MB/s · 2.8× · 4.26 GB/s · intrinsic
   14.06 GB/s — are the **committed rigorous artifact, exactly**, and that
   artifact is what its link points a reader at. Quoting 7.10× would state a
   number whose artifact is not in the repository, which breaks the rule that
   every figure terminates outside this site.
2. `benchmarks/ENVIRONMENT.md` already says throughput is a property of the box.
   A re-run on a different day is a **different measurement**, not a correction.
3. The published figure is the **conservative** one. A fresh run makes the claim
   look better, not worse — which is the right direction for a number to be
   wrong in, and worth recording rather than acting on.

What the re-run does establish: the code still performs as claimed, and the
claim is not inflated.

**The résumé is the one surface that must change.** `public/resume.pdf` quotes
the **quick** run — 6.5× · 455 vs 66 MB/s · 2.9× · 4.38 GB/s — while every other
surface quotes the rigorous one, and its own numbers do not agree with each
other: **455 / 66 = 6.89**, not the 6.5 stated on the same line. It should be
brought onto the rigorous run, matching the site.

---

## PolicyBot — HEAD `c8231f0`, no pin on file

The shipped ledger (`public/proof/policybot-validation-ledger.json`) was read
against the upstream record (`reports/validation/summary.md`):

| ledger row | upstream says | |
|---|---|---|
| structured sweep 19/20 | *"the latest sweep passed 19/20 questions"* | ✓ |
| keyword sweep 17/25 | *"Validated (17/25)"* | ✓ |
| safe fallbacks 4 | *"Fallback (4/25)"* — topics outside the corpus | ✓ |

`17 validated + 4 rejected + 4 fallback = 25` — internally consistent. The
ledger discloses *"sweeps are self-graded"*, and the run's ¶10 prose carries the
matching *"self-reported"* qualifier, which `check-figures.mjs` already enforces.

**Suite, run 2026-08-02.** A venv built from `pyproject.toml` (`pip install -e
".[slack]"` plus pytest), then:

```
python -m pytest tests -q
3 passed in 0.47s
```

The shipped ledger's `"local tests": "3 passed"` row is therefore **exact**, and
is now a run rather than a record of one. Its note — *"Slack adapter/formatting,
no OpenAI or Slack calls"* — matches what the two test files do.

**The one thing that cannot be re-run:** the policy corpus was deliberately
removed from the repository (`policies/*` gitignored, only `.gitkeep` tracked),
and validation works by cross-checking quotes against that corpus. The ledger
stands as a dated record; **reproduction does not**. That belongs in the boundary
prose, not hidden.

Worth naming precisely, because it is subtler than "the data is missing":
`llm.py:178-180` short-circuits to `return True, []` when it cannot locate a
cited document locally. So with an empty `policies/`, the quote verifier does
not fail loudly — **it passes everything**. That is deliberate (institutional
policy text cannot be committed) and it is not a bug, but it means a clean
checkout runs the guardrail in a permissive mode, and the ledger's
"guardrail path" row reads as unconditional when it is conditional.

---

## VisualAssist — pin `22ebdaa` **is** HEAD, tree clean

`func test` census across the 8 files in `VisualAssistTests/`:

```
AccessibilityHelper 13 · CommonObjectLabel 11 · DepthProcessor 8 · DetectedObstacle 9
DetectionSummary 5 · ObjectCategory 9 · ObjectPosition 10 · RecognizedText 6   = 71
```

**The site's 71 is right.** The commit message that introduced the suite says
"68 tests" and is the stale document. Note the suite has **never run in CI** —
`ci.yml` has no `xcodebuild test` step, and three of its four jobs are
`continue-on-error: true`, so CI asserts only that the app compiles.

**This is the one suite the audit could not execute, and the reason is
recorded rather than glossed.** Two attempts:

```
xcodebuild test -project VisualAssist.xcodeproj -scheme VisualAssist \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro'      → failed
  -destination 'platform=iOS Simulator,id=B97ECD4D-…'           → failed

xcodebuild: error: Unable to find a destination matching the provided
destination specifier: { platform:iOS, id:dvtdevice-DVTiPhonePlaceholder-…,
name:Any iOS Device, error:iOS 26.5 is not installed. }
```

The project has no shared scheme, so `xcodebuild` autocreates one and resolves a
destination the machine does not have (installed: iOS 18.3 and 26.2). **So the
71 is a count of test functions in the tree, not a count of tests that passed.**
The two are usually the same number and are not the same claim, and the site
says "the public VisualAssistTests tree holds 71 test functions" — which is
exactly what was verified, and no more.

**So it was verified the other way instead — statically, against XCTest's own
collection rule.** XCTest collects an instance method whose name begins `test`,
takes no arguments, and is not `private`/`static`. Every one of those conditions
was checked separately rather than assumed:

```
XCTestCase subclasses                                    8
func test…()      — no arguments, instance, collectible  71
func test…(args)  — XCTest does NOT collect these         0
private/static/class func test…                           0
```

Per file: AccessibilityHelper 13 · CommonObjectLabel 11 · ObjectPosition 10 ·
DetectedObstacle 9 · ObjectCategory 9 · DepthProcessor 8 · RecognizedText 6 ·
DetectionSummary 5 — **= 71**.

The two decoys a naive grep picks up are `private func testSpeech()` and
`private func testHaptics()` in `VisualAssist/Views/SettingsView.swift`. They are
in the **app** target, not the test target, and they are `private` — twice
disqualified. A whole-tree `grep 'func test'` returns 73 and would be wrong by
exactly those two.

Because every disqualifying case is empty, the static count and the collected
count cannot differ: there is no method that XCTest would skip and no method it
would find that this census missed. **71 is the number `xcodebuild test` would
report**, short of a test failing to compile — which is the one thing this method
genuinely cannot rule out, and the reason the claim stays worded as a count of
functions rather than of passes.

Consequently **no `xcodebuild test` step was added to that repo's CI.** Adding a
step I have never seen pass would convert a repo with weak CI into one with red
CI, which is worse than where it started. It needs one local run by someone with
the right runtime installed, and then the step is two lines.

---

## LifeQuest — HEAD `514908c`, no pin on file

- `apps/api` `test` script is **`vitest --passWithNoTests`**, and `git ls-files
  apps/api` matches **zero** test files. **Run 2026-08-02 to prove it rather
  than infer it** — `npm run test:api` exits 0 with:

  ```
  No test files found, exiting with code 0
  include: **/*.{test,spec}.?(c|m)[jt]s?(x)
  ```

  The green CI badge cannot fail on test content. This is the one result in the
  audit where running the suite told me *less* than reading it would have, and
  it was still worth running: "the script would pass trivially" is a prediction,
  and "the script did pass trivially, here is its output" is a finding.
- **"React + NestJS" is accurate** — `@nestjs/common`, `@nestjs/core`,
  `@nestjs/config`, `@nestjs/platform-fastify` are real dependencies.
- "7-person team", "one weekend", "Social Innovation Weekend, March 2025" are
  event facts with no repository artifact. They need a disposition, not silence.
