# Station fact ledger — the run vs production vs the résumé

Every factual claim on the eleven stations, checked against two authorities:
the production data layer (`src/lib/data/*`) and the **2026-07-31 résumé**
(`~/Documents/Resume (July 2026)/Final Resume (latest)`, sha1 `61f1ff4d`).

Where they disagreed, the tie was broken **against the project's own primary
artifact** — committed JMH JSON, CI workflow YAML, the GitHub API — never
against a README. That rule was added mid-audit and it changed two verdicts.

> **The README trap.** I first resolved the jetpack numbers from the repo's
> README and was about to "correct" the site to match it. The owner stopped
> that: *"don't always rely on readme's from the project, they can be old,
> just fact check the data by some other method!"* Computing the ratios
> straight from `benchmarks/jmh-results*.json` showed the README at the
> **pinned** commit was the stale document, and that the site had been
> quoting **two different benchmark runs at once**. A README is prose about
> evidence; the JSON is the evidence.

---

## Verdicts

| # | station | claim | run (before) | production | résumé | primary artifact | verdict |
|---|---|---|---|---|---|---|---|
| 07 | jetpack | parallel speed-up | 6.5× | ~6.5× | 6.5× | **6.378×** (3-fork JMH) | **6.4×** — all three quoted the 1-fork quick run |
| 07 | jetpack | parallel throughput | 455 vs 66 MB/s | — | 455 vs 66 | **422.0 vs 66.2** | **422 vs 66** |
| 07 | jetpack | error basis | "99% ci bound" | "±50% quick" | "99% CI, JMH" | 3 forks, 99.9% CI | **3-fork JMH, 99.9% CI** |
| 07 | jetpack | Adler-32 vs scalar | 2.8× | ~2.8× | **2.9×** | **2.804×** | **2.8×** — résumé quotes the quick run |
| 07 | jetpack | Adler-32 absolute | — | — | **4.38 GB/s** | **4.257 GB/s** | **4.26 GB/s** |
| 07 | jetpack | evidence link | `@ af2c4b1` | `af2c4b1` | — | pin predates `benchmarks/` | **re-pinned `2caacd0`** |
| 04 | Applied | CI floor | "the configured floor" | "no threshold" | **"blocks below 0.95"** | `--min-macro-f1 0.95` ×2 | **résumé right; the guard was wrong** |
| 04 | Applied | 0.9791 attribution | "(hybrid v3)" | "deterministic hybrid v3" | "the **rules stage**" | `hybrid_profile: deterministic` **disables SetFit** | **rules stage** — cascade scores 0.958 |
| 09 | AutoML | team size | 2-person | 1 named teammate | 3-person | landing page: 2 developers | **2-person** — owner's call, résumé overruled |
| 06 | Glyph | SIMD speed-up | "simd kernel 3.5×" | "openmp+simd … not SIMD alone" | — | SIMD alone **1.016×**; openmp **3.504×** | **openmp+simd** — the run had the retracted version back |
| 06 | Glyph | instruction sets | 4 | four | 4 | dispatch is AVX512→AVX2→NEON→**SCALAR** | **3 hand-written**; wasm is `-msimd128` |
| 05 | Cadence | test suite | 1,145 (634+511) | 1,145 @ pin `69a59e7` | — | **1,168 passed, 11 skipped** at HEAD | **re-run recorded**; pinned rows kept |
| 09 | AutoML | commit count | **2,173 commits** | — | — | GitHub 4 / clone 9 — **wrong repo**; real history is Miami's GitLab | **restored, attributed** — see below |

### Verified against running code, not documents

These were checked by executing or importing the project itself, which is the
standard the owner set: *"check them with the real application data, and don't
rely on the readme."*

| claim | method | result |
|---|---|---|
| Applied · **201 regex rules** | imported `jobtracker.classifier.rules` in the project venv and summed `PATTERNS` | **106 strong + 26 weak + 69 negative = 201** ✓ exact, plus 14 ATS domains |
| Applied · 0.9791 / 8 classes / 96 samples / 2 wrong | read `mlruns/…/hybrid_eval.json` and recomputed macro-F1 from the confusion matrix | **0.9791** ✓ exact — but see the attribution row |
| Glyph · 97.01% · 9,701/10,000 · macro-F1 0.9698 | read `benchmarks/mnist_eval.json` | **97.01 / 9701 / 0.969822** ✓ exact |
| Glyph · 45.9 KB wasm | `ls` on the three built `fast_mnist.wasm` files | **45.9 KB** ✓ all three |
| Glyph · 3.5× | recomputed from three committed Google Benchmark JSONs | 3.504× ✓ **but belongs to OpenMP** |
| Cadence · 1,145 tests | **ran both vitest suites** | **1,168 passed, 11 skipped** — tree grew since the pin |
| jetpack · all figures | recomputed ratios from both `jmh-results*.json` | two runs were being mixed |

### Stations that reconciled clean

- **02 · who** — Cincinnati OH, Miami University, B.S. CS May 2026. Exact.
- **03 · the yard** — every ITSM figure matches the résumé verbatim: 1.6M+ OAS
  logs, 5 yrs, 1,153 users, 66 dashboards, 57.8M-row table; 10,453 rows ×
  35 fields; 0% → 97% across 61 projects, 37-month dashboard. Major GPA 3.65
  and all three Dean's List terms match.
- **05 · Cadence** — 36 routes / 12-function cap, 4-stage parse, 7 tables,
  6 services all match. The run says RLS is **"staged off"**; the résumé's
  "Built multi-tenant isolation … with PostgreSQL row-level security" reads
  as active. Production is explicit that the cutover has not happened, so the
  run's wording stands and is the more careful one.
- **06 · Glyph** — 97.01%, 9,701/10,000 and macro-F1 0.9698 all verified
  against `benchmarks/mnist_eval.json`; 45.9 KB wasm verified against the
  built files. **Two claims did NOT survive** — see the Glyph rows below.
- **08 · LifeQuest** — Social Innovation Weekend Mar 2025, 7-person team,
  React + NestJS. Exact.

### Beat 10 — two dropped qualifiers, now restored

The three project names on the review station ("jobtracker", "policybot",
"fast-mnist") turned out to be legitimate: they are repo names the production
case files use, and Applied is *formerly* JobTracker. But auditing the numbers
against those case files found both of them quoted more bluntly than their
source quotes them:

| claim | run said | case file says | fixed to |
|---|---|---|---|
| backend suite | "271 backend tests" | "271 passed **and 10 skipped**" — the skips are "named in the row rather than folded into the total" | "271 passed · 10 skipped" |
| cited-source sweep | "19/20 cited-source sweep" | "treat 19/20 and 17/25 as **disclosed self-reports**" — grader and pass criteria unpublished | "19/20 cited-source sweep, **self-reported**" |

Neither would trip a gate. The numbers match their sources exactly; it was
the qualifier that had gone missing, which is the failure mode a numeric
check cannot see.

### The AutoML commit count — a correction to this ledger

I removed "2,173 commits" on the grounds that it did not terminate at its own
link: `github.com/yadava5/ai-augmented-auto-ml-toolchain` reports 4 commits and
the local clone carries 9. **That was the wrong repository.** The owner:
*"verify by my friend deployed landing page, as the real repo is in gitlab, and
I know the real numbers!"*

The product's own landing page names the origin —
`gitlab.csi.miamioh.edu/2026-senior-design-projects/…` — a private university
GitLab. The GitHub repo is a **published snapshot** with squashed history,
which is exactly why the counts disagree. The figure is real; what it was
missing was its provenance.

Restored as "2,173 commits **on the senior-design gitlab**", and the GitHub
link relabelled from "the repo, public" to "the published snapshot" — calling
a squashed mirror "the repo" is what made a true number look unsupported.

**Method note.** The landing page carries no commit count (its only hard
number is "200 configurations"), so it corroborates the *origin*, not the
figure. The GitLab is behind university auth and cannot be opened by a reader,
so this claim rests on the owner's own knowledge and now says where it comes
from rather than implying a public artifact backs it.

**Resolved — 2-person.** The landing page says *"Built by Shree Chaturvedi and
Ayush Yadav"*; the 2026-07-31 résumé says 3-person. The owner settled it
directly: *"just make it 2 people don't get the resume data on that!"* The run
says 2-person team, my seat backend, which now agrees with the deployed
artifact. This is the one place in this ledger where the résumé is **not** the
authority, by his instruction.

### Open, not fixed here
- **The résumé quotes the quick 1-fork benchmark run** for jetpack (2.9×,
  4.38 GB/s, 455 MB/s, 6.5×). Those numbers are real measurements, just from
  the less rigorous configuration; `benchmarks/README.md` in that repo states
  plainly **"The rigorous run is the one to quote."** Worth a résumé edit —
  the honest spread across both runs is 6.38×–6.89×.

---

## The two runs, computed from the artifacts

Both are real; they differ in fork count, and JMH fork count is what captures
run-to-run JIT variance.

| benchmark | quick (1 fork, 3w/4m) | **rigorous (3 forks, 3w/5m)** |
|---|---:|---:|
| `Adler32.scalar` | 1500.5 MB/s | 1518.2 MB/s |
| `Adler32.vector` | 4378.4 MB/s | **4256.6 MB/s** |
| `Adler32.jdkIntrinsic` | 13808.7 MB/s | **14056.5 MB/s** |
| `Compression.singleThreadedJdk` | 66.0 MB/s | **66.2 MB/s** |
| `Compression.parallelVirtualThreads` | 454.9 MB/s | **422.0 MB/s** |
| → vector / scalar | 2.918× | **2.804×** |
| → parallel / single | 6.892× | **6.378×** |

The site now quotes **one run throughout** — the rigorous one. Previously it
took 2.8× from the rigorous run and 6.5× from the quick run, which is
cherry-picking even though both numbers were individually true.
