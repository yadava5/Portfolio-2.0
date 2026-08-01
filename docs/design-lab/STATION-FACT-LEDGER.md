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
| 09 | AutoML | commit count | **2,173 commits** | — | — | GitHub 4 / clone 9 — **wrong repo**; real history is Miami's GitLab | **restored, attributed** — see below |

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

**Still contradictory — flagged, not silently resolved.** The landing page says
*"Built by Shree Chaturvedi and Ayush Yadav"* — two developers. The 2026-07-31
résumé says **3-person team**, and the run now follows the résumé. Both can be
true if the third member was not a developer, and "3-person" is the owner's own
current statement about his own team, so it stands. Worth him confirming.

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
