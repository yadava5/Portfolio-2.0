# Notes for the résumé chat — 2026-08-03

Paste everything below the line. It is a set of findings, not instructions.

---

Some numbers behind my projects moved today, and a few that were already on
paper turned out to be wrong. I'm passing this along as findings rather than
edits — you know the résumé and how you want it argued, so treat all of this as
input to cross-check, not as a diff to apply. Where I say "verified", I mean
someone ran the thing; where I say "I'd check this", I mean I'm not confident.

## Numbers that changed today

**Cadence (taskflow-calendar) — row-level security is now enforced in
production.** It used to be written but staged off, and the honest phrasing was
"policies written, proven against Postgres, not live." That changed today. The
app now connects as a role that cannot bypass RLS (`cadence_app`,
`NOSUPERUSER NOBYPASSRLS`), seven tenant tables carry `ENABLE` + `FORCE`, and
there are 22 policies. Checked through the production connection, not by reading
the migration: a read scoped to one tenant returns exactly that tenant's rows,
an unscoped read returns zero, and a cross-tenant insert is refused.

**Cadence test count: 1,185 passing, 0 skipped** (635 frontend + 550 backend).
It was 1,159 with 11 skipped. The 11 were the Postgres RLS tests, which used to
wait on a database URL no workflow provided; they now start their own Postgres
container and run.

**Applied (jobtracker) backend suite: 305 passing, 0 skipped.** Previously 278
passing with 10 skipped. The +27 is 10 CORS tests, 7 benchmark-guard tests, and
the 10 RLS tests that used to be the skips.

**Applied line coverage: 53.2%, not 54%.** This one is worth knowing about
because of *why* it was wrong. Three different local runs gave 52.6%, 53.2% and
55.1%, and the spread was the Python version rather than the tests — Python 3.14
stops counting annotation-only class attributes, so the same code measures 8,018
statements there against 8,210 on 3.11. Only the 3.11 reading was right.

Two related figures should probably just go rather than be corrected: "61%
excluding one-off scripts" only reaches 61 by excluding code that CI runs as a
gate, and "2,163 statements of dataset importers" described a set that is
actually 662 statements.

**PolicyBot: 24 tests, not 3.** The 3 was true of a throwaway virtualenv that
could only reach one test file. Ran in the project's own environment: 24 pass.

**OpenSSF Scorecard: Glyph is 7.0, not 6.4.** The old number came from a URL
pointing at the repo's previous name (`fast-mnist-nn`), where Scorecard keeps a
separate record frozen in July. Seven repos now publish scores, not four —
Applied 4.5 and Cadence 4.5 joined. VisualAssist is 4.6.

**Glyph's parallel kernel: cite 3.536×, not 3.520×.** The 3.520× has no
committed benchmark JSON and two internal records disagree about how it was
taken. 3.536× is the median of 20 repetitions with the data committed.

**jetpack: 6.4× and "422 vs 66 MB/s" are the right pair.** There is also a
quick-run pair (455 MB/s, ~6.89×) floating around in older material. The 3-fork
rigorous run is the one to quote; mixing them is the trap.

## Numbers that held up

Applied's classifier macro-F1 **0.9791** across a 96-sample eval set, and the
**201** rules behind it (106 strong + 26 weak + 69 negative) — both confirmed
against committed artifacts. Glyph's MNIST **97.01%** and **9,701/10,000**.
jetpack's **72 tests** and **68.1%** coverage, with the SIMD package at 98.9%.
VisualAssist's **71 tests** — and these do actually execute; I had thought they
didn't. AutoML **67.4%** coverage and 12 MCP tools.

## Where to check any of it

Everything is on `main` in each repo and all CI is green as of tonight. The
portfolio's evidence page (`/evidence/`) lists each claim with a pinned commit
and a link to the artifact; every pinned SHA was confirmed to exist on the
remote, not just locally. If a number here and a number there disagree, the
portfolio is the one that was checked most recently — but it has been wrong
before, so the repo artifact wins over both.

Applied's coverage number now comes out of CI on every push rather than a
README, so that one has a public run log behind it.

## Two things I'd flag rather than assert

The **jetpack 6.4×** figure is a benchmark on one machine and the environment
file says so explicitly. It's honest, but it's the kind of number a skeptical
reader will ask about, and the answer "M1 Pro, 3 forks, documented" is better
than a bare multiplier.

**Applied's RLS** is genuinely database-enforced — the app connects as a
non-bypassing role and identity is bound per transaction. I described this wrong
earlier today in both directions before checking properly, so if the résumé says
anything specific about it, worth confirming against the repo rather than
against me.

Cross-check whatever you need before changing anything. If something here
contradicts what's already on the résumé, I'd rather you flag the conflict than
resolve it silently — a couple of these numbers have been wrong twice.
