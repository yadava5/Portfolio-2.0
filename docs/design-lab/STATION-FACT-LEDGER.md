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
| 09 | AutoML | team size | 2-person | 1 named teammate | **3-person** | — | **3-person** (résumé) |
| 09 | AutoML | commit count | **2,173 commits** | — | — | GitHub: 4; local clone: 9 | **removed** — did not terminate at its own link |

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
- **06 · Glyph** — 97.01%, 9,701/10,000, 4 instruction sets, 2-person team.
  Matches résumé exactly.
- **08 · LifeQuest** — Social Innovation Weekend Mar 2025, 7-person team,
  React + NestJS. Exact.

### Open, not fixed here

- **Beat 10 names three projects that appear nowhere in the résumé** —
  "jobtracker", "policybot", "fast-mnist". Applied is *formerly* JobTracker,
  so that one is a rename; the other two are real repos but are not part of
  the six the run presents. The beat needs re-cutting against the current
  six, which is task #23 rather than a fact correction.
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
