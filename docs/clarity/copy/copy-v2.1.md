# Copy v2.1: deltas on v2 (yoda round 2)

**Status:** prepared, **not applied**. Picasso is editing the protos. The applier is `copy/apply_v21.py`: a dry run by default, `--write` to apply, and it refuses to write if any anchor fails to match in any of the five files.

**Dry run at 2026-09-22 23:58 (the protos' current mtime):** all 10 edits match exactly once in `index.html`, `rail-b1.html`, `rail-b2.html`, `rail-b3.html` and `rail-b.html`.

## Word estimate

Measured after v2 (`harness/v2copyA`): 2,012 at 1440 and 1,980 at 390. v2.1 adds **+32** in census tokens:

| edit | Δ |
|---|---|
| ¶03 row swap | −2 |
| ¶03 handoff "master" | +1 |
| ¶06 origin | +2 |
| ¶06 "score" | +1 |
| three stack rows | +9, +7, +9 |
| gate card | 0 |
| ¶10 freshness line | +5 |

**Estimate: 1440 ≈ 2,044 and 390 ≈ 2,012.** The budget is ≤2,100 (56 words of margin at 1440). ¶13 is uncounted before approval.

## The deltas

| # | where | v2 | v2.1 | why |
|---|---|---|---|---|
| 1 | ¶03 prov row 2 | tableau + workday ⟶ one master inventory, 10,453 rows × 35 fields | **code compliance across 61 projects: 0% in 2023, 97% now** | P0: the station's result was gone. The row is swapped, not added, so the cap of 2 holds, and fig. 03 already draws "10,453 × 35 fields". The wording is the résumé's; it reads as what the dashboard reports, and the ETL arrow chain that read as causation stays gone. Nothing is reworded and then deleted: the inventory row is dropped whole, and the compliance row is new in v2.1 (reconciles with plan P1 1.10). |
| 1b | ¶03 handoff | ↳ only the inventory is published; … | ↳ only the **master** inventory is published; … | the prose no longer introduces "the inventory", so the handoff names it |
| 2 | ¶06 problem line | Glyph began as a working C++ network doing all its math on one core. | **Glyph began as an existing 2-layer C++ network that did all its math on one core.** | origin disclosure (claims-audit C-5, R14): "existing" is the résumé's word, and it stops the line reading as his own earlier network |
| 3 | ¶05 stack, new | none | **react · typescript · postgresql · google calendar api** | `projects.ts` taskflow-calendar techStack (React 19, TypeScript, PostgreSQL, Supabase, Google Calendar API). Supabase is the Postgres host, so it is folded into postgresql. |
| 3 | ¶06 stack, new | none | **c++ · openmp · webassembly · react** | `projects.ts` fast-mnist-nn techStack (C++, OpenMP, React) and the case file (Emscripten to WebAssembly; the React workbench). The ISA names stay off: the simd row left home in v2. |
| 3 | ¶09 stack, new | none | **typescript · express · react · postgresql · docker** | `projects.ts` automl techStack (TypeScript, React 19, Express 5, PostgreSQL, Docker) and the case file ("Express 5 API", "PostgreSQL 16", "React 19 UI", "Docker runtime"). The backend is TypeScript: `backend/src/config.ts` @ 5e42233 (claims-audit R21). |
| 4 | ¶12 gate card | six projects, each with its proof · one signature missing | **five proofs and one honest prototype · one signature missing** | v2 contradicted ¶08's "a prototype has nothing to argue yet" |
| 5 | ¶06 reading line | …about what a network this size should; the work was the speed. | …about what a network this size should **score**; the work was the speed. | typo |
| 6 | ¶10 reading line | Every record is in one place: the evidence index ⟶ | Every record is in one place: the evidence index ⟶ **Numbers last checked September 2026.** | a freshness line. It says "last checked", not "current", so it stays true as it ages; bump the month at each claims re-audit |
| 10 | ¶13 dawnrow | back to the top ⟶ (v1/v2full) | **the working paper ⟶** | Yoda's résumé decision keeps it, with the résumé between linkedin and it. **This supersedes v1 §7 open question 5 and the v1 ¶13 row.** Whether it may point at itself on the home page is an owner question (below), not a copy change. |

The ¶02 stack stays where v2 put it (the record card's languages row), and so does ¶04's stack row.

## Owner questions added by v2.1

### Q-A · Rows that left home under the 2-row cap

Ruling 9 kept the ONNX line knowingly, so these need a decision, not a default. The exact strings follow.

| station | row, as it stood (live today) | v1's reworded form | if restored |
|---|---|---|---|
| ¶04 Applied | `ci blocks the build below 0.95 macro-f1 · int8 onnx via transformers.js — 90 mb ⟶ 23 mb` | `built in-browser inference: an int8 onnx export, 90 to 23 mb, served by transformers.js` (Résumé 2.0 wording, past tense) | +12 words; ¶04 would need a third row, or it replaces "220 regex rules ⟶ … · ci blocks the build below 0.95 macro-f1", in which case `below 0.95 macro-f1` (check-figures `Applied · CI macro-F1 floor`) must move with it |
| ¶04 Applied | `postgres row-level security — a non-bypassrls role` | `postgresql row-level security with a non-bypassrls role` | +7 words. This is the strongest security signal on the page for an engineer. Verified live (claims-audit V15: 9 tables, 35 policies, NOBYPASSRLS) |
| ¶05 Cadence | `rls enforced on 7 tables — force, 22 policies · owner-scoped checks on 6 services · idor suite in ci` | `row-level security on 7 tables, 22 policies · an access-control (idor) suite in ci` | +13 words; not re-audited in this pass |

Both ONNX and RLS stay on the jobtracker case file whatever the owner picks. The budget has room for about two of these at 1440 (margin 56).

### Q-B · Compound hyphens

His writing skill rewrites "3-layer" as "three layers". Every hyphenated word in the visible copy (census runs at 1440 and 390, the closed ledger, and v2.1's additions) falls into one of two groups. **Nothing is changed yet.**

**Names, identifiers and dates** (never in scope; listed so nobody "fixes" them):
- jetpack-compress
- adler-32
- macro-f1
- dot-256
- gpt-5.4
- gpl-3.0
- vt-0 … vt-3
- -O3
- 2026-08-02

**Compound words** (owner decides whether these count as dashes). Each has a rewrite ready. **(gate)** means a gate binds the phrase.

| word | where | rewrite if they count |
|---|---|---|
| three-layer | fig. 04 label "the three-layer cascade" | "the cascade, three layers" |
| 2-layer | ¶06 (v2.1) | "an existing C++ network with 2 layers" |
| plain-english | ledger row "plain-english calendar" | "calendar in plain english" |
| job-hunt | ledger row, ¶08 "the job-hunt grind" | "job hunting prototype" / "the grind of job hunting" |
| 3-fork | ¶07 "(3-fork jmh · 99.9% ci)" | "(jmh, 3 forks · 99.9% ci)" |
| 10-core | ¶06 "on a 10-core laptop" | "on a laptop with 10 cores" |
| 12-function | ¶05 "vercel's 12-function limit" | "vercel's limit of 12 functions" |
| 37-month | fig. 03 label "37-month dashboard" | "dashboard, 37 months" |
| 57.8m-row | ¶03 "one 57.8m-row usage table" | "one usage table of 57.8m rows" |
| 7-person | ¶08 "with a 7-person team" | "with a team of seven" |
| built-in | ¶07 "Java's built-in gzip" | "the gzip that ships with Java" |
| gzip-compatible | ¶07 | "compatible with gzip" |
| single-threaded **(gate)** | ¶07 "6.4× faster than single-threaded java.util.zip" | "…than java.util.zip on one thread". Needs the check-figures `jetpack · parallel speed-up` regex changed with it. |
| fine-tuned | ¶04 "fine-tuned setfit" | "setfit, fine tuned" |
| cited-source **(gate)** | ¶10 "19/20 cited-source sweep, self-reported" | "sweep of cited sources". Needs QUALIFIED `policybot cited-source sweep` changed with it. |
| self-reported **(gate)** | ¶10 same row | "reported by me". Same QUALIFIED edit. |
| locked-down | ¶09 "a locked-down docker sandbox" | "a docker sandbox, locked down" |
| non-root, read-only | fig. 09 label "docker sandbox · non-root · read-only fs" | "no root · fs read only" |
| field-usage | fig. 03 label "field-usage table" | "table of field usage" |
| hash-dedup | fig. 03 label "hash-dedup · rest api" | "deduped by hash · rest api" |
| sign-off | ¶09 line "with human sign-off" | "with a person signing off" |

### Q-C · ¶13 "the working paper ⟶" on the home page

It links to `https://ayush-yadav.com/`, the page it sits on. Yoda's decision and the canonical copy keep the label. The owner decides whether, on home only, it should point somewhere else (for example `/#start`) or stay as the run's one way back in. The archive pages' colophon link is unaffected.

## For picasso (a proposal, not a copy change)

**Phone masthead chip at 390.**
- Today `.mlabel` ("stops ") is hidden in the phone band (`#mtoggle .mlabel{display:none}`), so the chip reads a bare "0 / 6".
- Picasso's own note measured "stops 0 / 6" at 96px against 60px for "0 / 6". The word was dropped to buy back the phase word's room, and "stops" is also slightly wrong: the page has twelve stops, and the count is of projects.

**Proposal: "seen 0 / 6".** Four characters, so about 8px narrower than "stops". It says what the number counts (projects seen). Alternative: "work 0 / 6". Whether 36px or so fits in the 390 band beside clock and phase is picasso's measurement to make. If it doesn't fit, the bare count stays.

## Carried unchanged

Everything else in copy v2 stands, including its §6 bound-string ledger. v2.1 moves one more bound item: the ¶03 row swap removes no check-figures literal, because `10,453` is not bound on the run. Checked in `check-figures.mjs` FIGURES: no entry for 10,453 or 57.8m.
