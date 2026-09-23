# ayush-yadav.com · the clarity plan · v4, final (after 3 yoda rounds and 5 harness rounds)

Status: **plan only**. No site edits until the owner approves. Written 2026-09-22 against HEAD `035ab9b`; live = `out/index.html` = `b6ea15df…`.

Inputs (all in `scratchpad/plan/`):
- `inventory/inventory.md`: measured defects §1–§12, the text/mono census, gate bindings
- `claims-audit.md`: Applied at `0285675`, site ⇄ résumé
- `copy/copy-v1.md`: copy per station, plus a 57-row bound-string ledger
- `design/proposal.md`, plus `proto/index.html` (bucket A + phone) and `proto/rail-b.html` (bucket B), with shots in `design/shots/`
- `research.md`
- `yoda-resume-decision.md`
- the critic reports `../critic-a/report.md` and `../critic-b/report.md`
- `harness/` (the non-regression scorecard, with its baseline)

## 0 · The owner's rulings this plan must satisfy (verbatim spirit)

1. Applied numbers go to the repo's current HEAD.
2. Yoda placed the résumé; "we'll go with that". The canonical résumé is **Résumé 2.0** (one page).
3. SWE shows up as hints in several places, never as a target line.
4. The railway language stays. Fix the visual defects.
5. Mono is overused.
6. There is too much text, and too much vague text.
7. No AI-sounding language and no dashes of any kind.
8. Plan, critique, repeat.
9. **Word the site to match Résumé 2.0 "for now"**, including the ONNX line.
10. **The Mac desktop rail must never regress.** Improvements are welcome; worse is rejected.
11. **The phone is open for creative redesign.**
12. **The copy sells him.** Every project answers: what the problem was, what he did, and what came of it. All kinds of readers.

## 1 · The shape of the work

Nine phases, shipped in batches. Every batch:
- **The owner's go is shot-based**: before/after at 1512/1440/1280 and 390, from the real build, same protocol for every batch (not only bucket B). The type swap in P4 is the largest visual change on his Mac, so it gets his eyes before it ships.
- **Commit strategy:** a local sequence per batch: code commit, then `verify-portfolio --rebaseline`, then the baseline commit.
  - labrat runs the full `verify:portfolio` plus the Playwright suites on that exact sequence.
  - Only a fully green sequence is pushed, and code and baseline are pushed together. A red golden is never pushed; push = deploy (GitHub Pages).
- After every `--rebaseline`, grep the baseline JSON for stale companion fields (a past re-baseline rewrote four fields and left a fifth asserting the old build env).
- The non-regression harness runs at 1512/1440/1280 on every batch that moves pixels. It gets a positive control: an **open** panel over prose must score as overlap, so the closed-panel rule can't hide a real collision.
- Every gate a phase adds is shown red against today's build in a temp copy first, never in `out/`. A gate with nothing to catch today (G8) is proven on a synthetic injection.

| phase | what | touches the Mac rail? |
|---|---|---|
| P1 | numbers: claims reconciliation to Résumé 2.0 and repo HEAD | no (text) |
| P2 | résumé and contact | no |
| P3 | copy: story, cut, no dashes, SWE hints | text only; heights handled in P6 |
| P4 | type system: mono for machine values only, a 12px floor | no geometry (measured: doc 14,396 vs 14,377 px) |
| P5 | desktop bucket A: manifest (the auto-open ledger retired; formerly B0), units, hover/tap/keyboard, first screen | the manifest only |
| P6 | **desktop bucket B: owner's pick, from side-by-side shots** | **yes, and only what he picks** |
| P7 | the phone redesign | no (≤820 only) |
| P8 | JS/a11y fixes: pad, reduced motion, inert, replay | no |
| P9 | archive: case files, `/evidence`, 404 (dashes, mono, errata) | no |
| G | new gates, landing with the phase they guard | — |

Order and batches:

| batch | phases | notes |
|---|---|---|
| 0 | the durable home | the harness scripts, the baseline scorecards, the protos' approved shots, the copy ledger, and the acceptance personas and quiz move into the repo: `scripts/qa/harness/` and `docs/clarity/`. A "never regress" rule whose baseline lives in a session scratchpad is unenforceable next week. |
| 1 | P1 | |
| 2 | P2 + P8's a11y blockers | |
| 3 | P3 + P4 + P5, **plus the heights decision (A′ or B3) and B1**. If the owner rejects only the type scale, copy and manifest ship with today's faces and P4 is re-proposed alone. If he rejects only the heights, A′ ships | text, face, manifest and heights move together: one geometry re-measure and **one owner shot review of today vs A+copy vs B3+copy (± B1) at 1512/1440/1280**. He picks. |
| 4 | P7 | the phone |
| 5 | P9 | |

**The harness re-baselines on each owner-approved batch**, so a later batch is compared with what he approved, not with the site of 2026-09-22.

After batches 3 and 4: **acceptance by cold critics** (below).

---

## P1 · Numbers

→ The full table is in `PLAN-parts-A.md` §Phase 1 (rows 1.1–1.16). In short:

| # | row |
|---|---|
| 1.1 | 220 rules |
| 1.2 | "1 wrong out of 96 (0.990 macro-f1), the rules stage"; the receipt shows 0.9896 → 0.990 |
| 1.3 | 3,747 passed · 0 skipped · 13 expected failures @`0285675` |
| 1.4 | coverage 69% |
| 1.5 | ONNX in the résumé's past tense: "built in-browser inference: an int8 onnx export, 90 to 23 mb, served by transformers.js" |
| 1.6 | `/evidence` desktop/Space line removed |
| 1.7 | ¶04 "on a device you control" removed |
| 1.8 | fig. 04 "held for a person" corrected |
| 1.9 | Cadence 36 routes, plus a new `check-figures` entry |
| 1.10 | internship "0% in 2023, 97% now" (no causal arrows) |
| 1.11 | AutoML "behind human-review gates" |
| 1.12 | "network-isolated by default" dropped |
| 1.13 | Glyph passive SIMD wording |
| 1.14 | verified 2026-09 |
| 1.15 | **the case file stops linking the withdrawn weights** (a privacy issue, separate from wording) |
| 1.16 | errata appended, never deleted |
| 1.17 | fig. 04 hold note: "nothing cleared its desk" (audit H14) |
| 1.18 | the coverage row's per-package sub-figures move with the 69% |

Receipts 04 and 05 are re-pinned **in place** (anchor ids stay stable), with a new `APPLIED_EVAL_SHA`.

Verify:
- grep the **built** `out/**` for each old string: `201 regex`, `0.9791`, `305 passed`, `37 routes`, `53%`, `on a device you control`, `desktop app and`, `via transformers.js`, `every step`, `gated ×7`. Hits are allowed only in dated history notes and errata.
- Each `check-figures` needle must go red on the old HTML.

## P2 · Résumé and contact

→ Full table in `PLAN-parts-A.md` §Phase 2.

| # | change |
|---|---|
| 2.1 | `public/resume.pdf` := Résumé 2.0, byte for byte. **Measured: `npm run resume:check` passes on it** (it agrees with `personal.ts` on email, LinkedIn, GitHub and May 2026; 4.73% bottom whitespace); 61,814 B clears the 50,000 floor; one page |
| 2.2 | ¶02 record card adds `email · aesh.03.23@gmail.com` and `résumé · pdf · one page ⟶`. **⟶, not ↗**: the site's rule is ⟶ for same-origin; `check-links` skips relative hrefs, so nothing enforces it, and G8 adds that |
| 2.3 | archive colophon: `résumé (pdf) ⟶` |
| 2.4 | ¶13 dawnrow gains `résumé (pdf) ⟶` between linkedin and "the working paper ⟶" (yoda's decision keeps the label). The working paper's **target** is owner question 15, resolved before batch 2. **Recommended:** `/evidence/`; it *is* the working paper, and that ends the self-link finding |
| 2.5 | gate note |
| 2.6 | ¶13 `inert`/`aria-hidden` until approved |
| 2.7 | reduced-motion approve reveals ¶13 |

`run-home.spec:326-336` (¶13 height 0 before approval) **stays green**: contact moves to ¶02, the gate stays the last screen. Picasso's note that it "goes red by design" assumed un-gating ¶13, which yoda rejected.

**Premise correction:**
- Both picasso and critic B wrote that the résumé is "2 pages". Measured two ways: `public/resume.pdf` (61,647 B, the live file) and Résumé 2.0 are each **1 page**, by `mdls kMDItemNumberOfPages` and by `pypdf` page count.
- The stale `out/resume.pdf` (63,509 B, Aug 15) is a local build artifact; it is not served.

## P3 · Copy

Source: `copy/copy-v1.md`. What it does:
- Each project station runs **problem → what he did → proof**.
- A literal second line under each codename h2, e.g. "Applied / A job application tracker that reads your Gmail".
- Kickers "first station" become "project 1 of 6".
- Every number sits in a raw pair first: "1 wrong out of 96 labelled emails (0.990 macro-f1)".
- Generic epigraphs cut (Hamming, Knuth, Lovelace); the ones that argue their station stay (Machado, Brooks, Feynman, Eliot).
- ¶13 ends with one ask: "If this is the kind of work your team needs, write to me."
- Self-check: 0 em dashes, 0 en dashes, 0 spaced hyphens, 0 banned or tell words.

**Role line: an owner question, not decided here.**
- Ruling 3 says no stated target. Critics' loudest finding is that "software" appears nowhere. Research Q3 says there is no evidence base either way.
- Two first-screen drafts go to the owner:
  - **(A) the noun:** "Software engineer. I build products end to end, from the interface down to the data and models under it."
  - **(B) the verb phrase:** "I build software end to end, from the interface down to the data and models under it."

  With (B), the noun still arrives through hints: ¶02 `builds`/`languages`, the manifest, and the stack rows.
- The meta description follows his pick. (B) keeps "software, data, and ML engineering".
- Either way the line sits in **the largest non-name type on screen 1** (research rule 8), not at caption size.

**SWE hints** (10 places, no target line):
- the first-screen line (A or B above) and the meta/og description
- the ¶02 `languages` row (typescript · python · java · c++ · sql)
- stack rows under ¶04/¶05/¶06/¶09
- "A parallel gzip engine for Java"
- "six software projects" in the manifest
- optional JSON-LD `jobTitle`

Nothing says "seeking" or "open to". Under option (A), one noun names a role; under (B), none does.

### The text volume problem (the owner's "too much text")
**v1 cuts only 5% of words** (2,106 → 2,007 of the listed elements). It's a clarity rewrite: it adds 31–43 words per station explaining what each project *is*, and removes vague lines. That is not enough on its own. Plan v1 adds these cuts to reach **≥30% fewer visible words on home** (census baseline 2,913 visible words at 1440):

| lever | est. words |
|---|---|
| copy v1 as drafted | −99 |
| Option B: cut 9 of 13 hourlines (keep ¶01 dawn, ¶08 dusk, ¶12 dark, ¶13 dawn) | −72 |
| Option B: the gate card stops repeating the manifest rows | −35 |
| captions ≤20 words each (19 figcaptions, 403 words today) | ~−180 |
| provenance lines: **at most 3 per station on home**; the rest live on the case file already (¶03 today has 4 + a school record; ¶09 has 5) | ~−150 |
| ¶03 school record trimmed to degree, GPA, dean's list and the MUCAT line (coursework and certificates are on the résumé) | ~−40 |
| the gzip demo button and its note (critic B: "earns less than the space it takes"; it demonstrates the browser, not jetpack) | owner's call |

Yoda caught that these levers sum to about −576 words (−20%), short of the −31% target. So v2 of the copy **takes Option B by default** (the owner can opt out), caps provenance rows at **2** per station, and names every cut.
- Target, measured by the harness's `visibleWords` at 1440 on the rebuilt proto: **3,075 → ≤2,100 (−31%)**.
- No station over 111 words of prose; the first screen ≤40 words not counting the epigraph.
- A cut that removes a `check-figures`-bound literal from home moves that FIGURES entry to the case file, or retires it via RETIRED, so it doesn't just go red.
- **Copy v2 result** (`copy/copy-v2.md`, modelled on the baseline census runs, 0 unmatched edits):
  - **3,075 → ~2,072 visible words (−32.6%)**. To be re-measured on the built proto v2 by the harness.
  - First screen: 40 words (A) / 39 (B).
  - The most reading prose in any station: 73 (¶09).
  - Every caption ≤19 words; ≤2 provenance rows per station.
  - Cuts, largest first: provenance rows −226 net, captions −153, hourlines −110, three epigraphs −106, the ¶08 quest list −60, the school record −61, gate-card rows −57, SVG labels that repeat a caption −55, duplicates −38, handoff lead-ins −29, the duskin line −14, the gzip note −13.
- Two `check-figures` literals leave home ("4 hand-written simd paths", "2,186 commits"). Their entries go to `run: null` and stay bound on the case file. `635 fe + 551 be` is rebound to ¶05. The fig. 10 pattern becomes passed / declined / caught.
- Glyph's "on every core" became "with OpenMP on a 10-core laptop". The committed bench context reads `host_name: MacBookPro.lan, num_cpus: 10`.
- If the gzip button stays, its label must carry the scoping the cut note held: "gzip this page with your browser".
- The ¶10 dispositions to verify at the source before shipping: "passed" (Applied's classifier gate), "declined" (PolicyBot: 4 unsupported topics), "caught" (Glyph: a variance claim never measured, corrected at `001e9b4`).

**Round-3 copy deltas** (small, applied in batch 3):
- figs 04 and 07 captions say "tap or hover a desk…" and "tap or hover a lane…" (only fig. 05 had it). Check that TEXT_PLATES binds neither old string.
- **Compound hyphens follow his writing skill by default** ("3-layer" becomes "three layers"): "2-layer", "three-layer", "10-core", "job-hunt", "plain-english", "7-person", "3-fork" and the rest of copy-v2.1's Q-B table are rewritten with its drafted rewrites. Only the three gate-bound phrases ("single-threaded", "cited-source", "self-reported") and any rewrite that reads worse go to the owner. Identifiers (jetpack-compress, macro-f1, -O3, row-level) are never touched.
- ¶10's headline "a refused gate is the system working" sits above stamps that say passed / declined / caught. It becomes "a stopped gate is the system working" (the TEXT_PLATES fig. 10 claim moves with it).
- **The phone masthead chip** says "seen 0 / 6", not a bare "0 / 6" (critic A: "zero out of six what?"). It is a P7 item, measured at 390.

Glyph's "I made its core matrix kernel 3.5× faster with OpenMP" is within the résumé ceiling ("Accelerated … with … an OpenMP matmul"; claims ledger 2026-09-11 attests the OpenMP work). "On every core" must match the committed bench's thread count, or go.

Numbers glossed in plain words for non-technical readers, beside the number, never replacing it:
- "1,186 automated checks, all passing"
- 97.01% "on the standard handwriting test set, about what a network this size should score; the work is the speed"
- 3.5× "three and a half times faster"

### Bound strings that move with the copy
All are in copy-v1 §3/§3b:
- `stations.ts` kickers for beats 2–8, the beat 5 consignment, and the names of beats 7 and 11
- `run-home.spec.ts:73–74`
- `check-figures` run regexes (Applied eval/rules/suite, Glyph 9,701/simd, AutoML suite), a new Cadence entry, the needle `0.9791`→`0.990`, one DRAWING_TOKEN, the TEXT_PLATES fig. 02 string
- `check-bench-artifacts.mjs:514, :631`
- the cargo fixture re-record (the beat 5 waybill loses its dash)
- `personal.ts` description plus the OG re-render

## P4 · Type system (picasso, zero new bytes)

**Measured premise corrections:**
- Newsreader ships as **two static 400 faces** (no `fvar`, no weight axis, no opsz, despite "-var" in the filenames; confirmed with fontTools). Every bold today is faux.
- Fraunces has opsz/wght/SOFT/WONK but no `tnum`.
- ⟶ ↗ ↳ ⟲ come from Apple Symbols in every stack with identical advances, so no arrow changes on his Mac.

Rules:
- Fraunces = display. Newsreader = everything a person reads. Fragment Mono = machine values only (figures, hashes, paths, tool names, clocks).
- Size conversion: **mono px × 1.230 = Newsreader px**, by x-height (.524 vs .426).
- Scale: 12 (machine-value floor) / 13 / 14 / 15, body 18.
- `word-spacing:.12em` on ex-mono hooks so ` · ` rhythm survives; `tabular-nums` where figures sit in text; `font-synthesis:none`.
- **1,721 mono words move to Newsreader.** SVG figure labels stay mono: they were fitted with `getComputedTextLength()` against mono advances, and `FLOOR_PX` is arithmetic on that face.
- Two glyphs diverge by stack (✓, ↓) and are pinned by hook.

Harness round 1 (`harness/SCORES-r1.md`), measured on proto A with the copy unchanged:
- manifest overlap → 0 at every width
- mono 75% → 22%
- thread crossed line-steps down at every desktop width
- **but near-empty screens at 1280 went 4 → 6**, a threshold effect of the bigger type. That must be fixed in proto v2 before batch 3 can pass the owner's "equal or better" rule.
- Sub-12px must be measured as *effective* px (the gate card sits in a scaled container at ~11.0–11.9px).

Measured on the proto (picasso's own counters):

| | before | after |
|---|---|---|
| mono share of text | 73.9% | **21.3%** |
| sub-12px HTML pairs | 47 | **3** (each a one-liner to fix) |
| value/unit line breaks, 1440/390 | 8/10 | **0/0** |

**Arrows off the Mac:** ⟶ ↗ ↳ ⟲ exist in none of the four faces and fall back to the system font (Apple Symbols on his Mac). Recruiters often screen on Windows, so P4 measures the fallback advance on Windows (Segoe UI Symbol) with Playwright's Chromium on a Windows runner, or subsets these four glyphs from a self-hostable face (a few hundred bytes). The decision is recorded in P4.

**The owner sees this before it ships** (batch 3's shot review). **Fix before shipping (my read of the proto shots):** `.srow b` / `.prov b` keep mono for *every* bold. But "b.s. computer science", "finalist, mucat design innovation" and "lifequest" are not machine values; mono mid-sentence there looks like a font accident. The rule is **mono only when the bold is a figure or identifier**; names, titles and degrees go to Newsreader (faux bold is banned, so use Fraunces at text size for emphasis if needed).

## Measured now: the final protos (harness round 5, `harness/v5-table.txt`)

Copy v2.1 is applied to all five protos, with picasso's v3 layout (`design/proposal-v3.md`). A = no rail geometry change. B3 = the tuned asymmetric corridor (7vh lead, 25vh trail) plus the ¶08 seat. B1 = the thread ghosting under text. Gate H = starved ≤ baseline.

| 1512 / 1440 / 1280 | today | A (heights unchanged) | A + B1 | B3 | B3 + B1 |
|---|---|---|---|---|---|
| screens | 15.91 / 15.97 / 16.12 | 15.68 / 15.74 / 15.81 | same as A | **11.60 / 12.21 / 12.97** | same as B3 |
| **starved** (thin station) | 3 / 4 / 4 | **1 / 4 / 2** ✓ | 1 / 4 / 2 ✓ | **1 / 2 / 3** ✓ | 1 / 2 / 3 ✓ |
| corridor (rail, empty) | 3 / 1 / 0 | 9 / 6 / 6 | 9 / 6 / 6 | 1 / 1 / 1 | 1 / 1 / 1 |
| blank | 1 / 1 / 1 | 2 / 2 / 1 | 2 / 2 / 1 | **0 / 1 / 0** | 0 / 1 / 0 |
| thread crossed line-steps | 285 / 272 / 263 | 204 / 205 / 183 | **139 / 137 / 122** | 208 / 205 / 202 | **142 / 138 / 133** |
| manifest overlap | 8 / 9 / 13 | 0 | 0 | 0 | 0 |
| sub-12px (effective) | 166 / 170 / 164 | 0 | 0 | 0 | 0 |
| visible words | 3,080 / 3,075 / 3,046 | **2,040 / 2,044 / 2,054 (−34%)** | | 2,038 | |
| mono | 75% | 24% | | 24% | |

| phone | today | proto |
|---|---|---|
| 390: screens / starved / blank / thread crossed | 23.22 / 2 / 0 / 561 | **16.67 / 1 / 0 / 13** |
| 320: screens / starved / blank / thread crossed | 31.28 / 14 / 0 / 715 | **23.53 / 5 / 0 / 14** |

**Reading (corrected after yoda round 3):**
- **Blank screens are a hard gate too, not just starved ones.** A (heights unchanged) doubles fully blank screens at 1512 and 1440 (1 → 2). Round 3's ✗ must not vanish through a metric change.
- Both blanks sit inside ¶08 (LifeQuest, dusk): `review-shots/blank-A-1512-y9329.jpg` and `blank-A-1512-y9820.jpg`, next to today's single one in `blank-today-1512-y9820.jpg`. The cause is known:
  - the engine writes ¶08's dusk seat height inline, to centre its closing line
  - copy v2 cut that line, so the seat now holds nothing
- **Option A′ = A plus ¶08's seat trimmed to its content** (only the engine's dusk seat changes; `design/proto/rail-a2.html`). **Measured, not predicted** (`harness/v5a2/`):

| A′ | 1512 | 1440 | 1280 |
|---|---|---|---|
| starved | 1 ✓ (3) | 4 ✓ (4) | 4 ✓ (4) |
| blank | 1 ✓ (1) | **2 ✗** (1) | 1 ✓ (1) |
| screens | 15.40 | 15.46 | 15.53 |

- So **A′ still fails gate H at 1440 by one blank screen** (y9000, the head of ¶09's corridor). It would need one more per-station trim there, measured again before it could ship.
- **B3 passes H at every width** (starved 1/2/3, blank 0/1/0).
- The owner's choice is between B3 and a further-trimmed A′, from the shots:
  - **B3**: a 27% shorter run, almost no empty corridor
  - **A′**: the same run, more rail showing between shorter stations; one more trim owed at 1440
  - **A** keeps today's heights: the same rail, more corridor showing between shorter stations.
  - **B3** makes the run **27% shorter** at 1512, in rough proportion to the 35% copy cut, with almost no empty corridor.
  - **B1** is independent of both: it fades the line under text.
- Picasso checked that dusk is not rushed under B3: max ΔE per 100px of the day arc 23.58 before and after; total ΔE 96.9 both.
- It found that the engine writes the ¶08 seat's `min-height` **inline**, overriding any stylesheet. B3 changes it; that engine line is part of B3.
- Phone at 390 is 16.67 screens against a ≤16 target. The last 0.67 screens is content (six figures in a 390px column), not layout. Taking it would mean going under the 12px floor, so it stops here, and the plan says so.

## Measured earlier: what the copy cut does to the rail (harness round 3, `harness/v3-table.txt`)

Copy v2 is fully applied to every proto (121 scoped edits, all 5 files, 0 `measured:` comments touched).

| 1440 unless stated | baseline | A + copy (no rail change) | B3 + copy (constant corridor) |
|---|---|---|---|
| visible words | 3,075 | **2,012 (−35%)** ✓ | 2,012 |
| near-empty screens ≤60 words, 1512 / 1440 / 1280 | 6 / 5 / 4 | **10 / 10 / 9** ✗ | 4 / 4 / **7** ✗ at 1280 |
| blank screens, 1512 / 1440 / 1280 | 1 / 1 / 1 | 2 / 2 / 1 ✗ | **2** / 1 / 1 ✗ at 1512 |
| screens, 1512 / 1440 / 1280 | 15.91 / 15.97 / 16.12 | 15.68 / 15.74 / 15.81 | 13.44 / 14.05 / 14.84 |
| manifest overlap | 8 / 9 / 13 | 0 | 0 |
| sub-12px (effective) | 166 / 170 / 164 | 0 | 0 |
| mono | 75% | 25% | 26% |
| phone 390: screens / near-empty / blank / thread crossed line-steps | 23.22 / 2 / 0 / 561 | **17.97** / 2 / 0 / **12** | — |
| phone 320: screens / near-empty / blank | 31.28 / 14 / 0 | 24.92 / 16 ✗ / 1 ✗ | — |

**Round 4 split the "near-empty" metric**, because it couldn't tell the rail from a thin station (`harness/emptiness.mjs`). A near-empty screen is now:
- **STARVED** if ≥40% of its viewport lies inside a station's own content box: a thin station, which is bad
- **CORRIDOR** otherwise: the rail between stations, the owner's loved empty space

| starved screens | baseline | A+copy (no rail change) | B3+copy |
|---|---|---|---|
| 1512 | 3 | **1** ✓ | 2 ✓ |
| 1440 | 4 | **3** ✓ | 2 ✓ |
| 1280 | 4 | **3** ✓ | 5 ✗ |
| 390 | 2 | 2 = | — |
| 320 | 14 | 15 ✗ (phone tuning) | — |

So **every extra near-empty screen in A+copy is corridor**: more visible rail between stations, and fewer thin stations than today at every Mac width. That changes the round-3 reading below:
- the copy cut **can ship with no rail change**
- B3 is a taste option (a shorter page, less corridor), not a requirement
- B3 is actually worse at 1280 on starved screens

**Gate H:** starved ≤ baseline **and blank ≤ baseline** at 1512/1440/1280 (both hard). Corridor screens are reported, with screenshots of each in the review package, and decided by the owner, not gated.

Round 3's reading, kept for the record: the owner's two rulings pull against each other here, and it's measurable. Cutting a third of the text (ruling 6) inside today's station heights doubles the near-empty screens on his Mac. The copy cut therefore **cannot ship alone**: it needs the heights to follow (B3, a rail change, ruling 10).

The plan's answer (after round 4; round 5 above supersedes the B3 numbers, and B3 now passes H at all three widths):
1. The default is **A+copy with today's heights**. It passes gate H (starved ≤ baseline at all three Mac widths) and changes no rail geometry.
2. B3 is offered as a taste option, shown side by side. It ships only if the owner prefers it **and** it passes H at 1280 (today it doesn't: 5 vs 4).
   - Stop rule: if two tuning passes can't get 1280 to ≤4 starved, B3 is withdrawn.
   - B3 also needs its **beat-alignment probe**: dusk still flips at ¶08 and night holds ¶09–¶12, read from `window.__world` at each station's top, base vs B3, at all three widths.
3. If he dislikes the extra corridor in A+copy, the smaller alternative to B3 is **per-station** height trims on only the stations that lost the most words (¶03, ¶08, ¶09), not a blanket corridor.

B2 (capping the void) measured identical to A on every metric at every width, so it is **dropped** as inert. B1 (thread ghosting under text) is the biggest thread win, with no geometry change: crossed line-steps 285→136 at 1512.

## P5 · Desktop bucket A (no rail geometry)

| § | change |
|---|---|
| 1, 8 | **(B0 folded in: the corridor auto-open is retired; the ledger opens only on request.)** The floating manifest plate is retired. "stops 0 / 6" becomes a real button in the masthead (44px target); the ledger is an opaque dismissible panel (Escape, outside click, close ×, focus return). **Its rows are links to the stations and each carries its plain noun and headline number** (critic B #4: "move the completed manifest to the top"). Picasso scanned every corner: no fixed position is free of text, so a disclosure is the only fix that measured clean. |
| 5 | 12px floor (47 → 3) |
| 6 | `.uv{white-space:nowrap}` atoms at value+unit joins; U+200A → U+202F |
| 7 | `traceOn` answers tap, focus and Enter/Space, with Escape/outside-tap to clear. **Measured at 390 touch:** fig 04 `tracing:true, hot:4`, fig 07 `hot:2` (were `false, 0`); fig 05 caption "tap or hover" |
| 9 | the ¶02 contact rows (P2) |
| 12.1 | `#clear` fits at 320, with a 44px target |
| first screen | the role line (owner's A or B) under the nameplate, in **the largest non-name type on screen 1** |
| ¶10 | the "refused" stamps read as failure to a skimmer (critic A #7, B #9). "a refused gate is the system working" moves **above** the table in the serif, and each gate's stamp word becomes its own truthful disposition (copy v2 drafts each). PolicyBot and Visual Assist each get one noun line, since they are never introduced |

## P6 · Desktop bucket B (decided in batch 3's shot review; **owner decides from side-by-side shots at 1512**)

| # | change | proof it isn't worse | recommendation |
|---|---|---|---|
| B1 | **under-sheet dip**: the thread fades to a ghost where it passes under a text column; zero geometry change (`stx`, anchors, wobble, cargo byte-identical). **Beads, waybill icons and waybill labels must dip too**: shots show a waybill over "$2,500 prototyping grant", an icon over "Miami University, Jun" (`review-shots/B3B1-1512-02-path.jpg`), and a bead on the role line. The max-alpha-inside-prose probe includes all of them | max thread alpha inside prose 255 → 77; `anchors`/`samples` arrays diffed identical between builds | owner looks; it changes how the line reads over text |
| B2 | the ¶08 void: cap the `duskin` 520px margin | **dropped: measured inert** (identical to A on every metric at every width, rounds 1 and 3). The "blank" screen is the dusk corridor with the thread and bead, possibly a loved beat | drop |
| B3 | constant corridor, tuned (asymmetric: 7vh lead, 25vh trail) plus the ¶08 seat. **Acceptance adds: the screen-1 thread must not cross the role line.** Today the stroke sits between "Ayush" and "Yadav"; in B3 it drops into "…data and models" with the bead on the word (`review-shots/B3-1512-00-top.jpg`). Retune the first corridor's anchor, or the owner accepts it by name | **round 5: passes H at every width**: starved 1/2/3 vs 3/4/4, blank 0/1/0 vs 1/1/1, screens 11.60/12.21/12.97. Dusk isn't rushed (max ΔE/100px 23.58 before and after) | **recommended** with B1, once the screen-1 thread is fixed; the owner judges from shots |
| B4 | re-tune `stx` into the text-free bands | cuts the sweep from ~39% of vw to ~9% | **reject**; B1 gets the result without the loss |

The owner judges **each B-change alone** (per-variant shots `rail-b1/b2/b3` at 1512), not the bundle. A B-change ships only if every harness number at 1512/1440/1280 is equal or better **and** he says yes to its shots. Harness round 1 is in `harness/SCORES-r1.md`. The harness gets a closed-panel fix (a hidden panel must not count as overlap). Its thread metric uses max-alpha-inside-text for B1 (the step-count metric is saturated at 29/31).

## P7 · The phone (≤820): "the rail is the margin"

- The thread becomes a route diagram: one vertical line in a 38px margin lane (`RAIL_X_MOBILE = 26px`, a scalar, not a third `stx` arm; `check-beat-tables` assumes two arms), a tick per stop, wobble 3px. Crossings: **0 by construction**, except the ¶12 dock.
- Masthead: name, `clock · station`, and the count button. The ledger is a **bottom sheet**: grab bar, Escape, scrim, close, focus return, rows as links.
- Stations `min-height:0; padding-block:7vh`: content plus a 14vh corridor. Measured 1.76 → target ≤1.6 viewports per station after the cut.
- Two-line headings: Fraunces h2 plus a Newsreader italic codename line.
- Measured in round 5 with copy v2.1: screens at 390 are 23.22 → **16.67** (target ≤16; the last 0.67 is content, not layout); starved 2 → 1; blank 0. At 320: 31.28 → **23.53**, starved 14 → 5, blank 0.
- **Fix from the proto shots:** the school record at 390 uses a two-column label/value grid with a ~120px label column, which wraps values to 3–4 lines. On the phone it stacks (label above value).

## P8 · JS and a11y fixes

→ `PLAN-parts-A.md` §Phase 7:
- 7.1 MNIST preprocessing on the pad (bbox → 20px → centre of mass in 28×28). A small off-centre "1" reads "7 · 99.8%" today.
- 7.2 the manifest toggle (merged into P5)
- 7.3 hover reveals (P5)
- 7.4 the replay button's `hidden` attribute
- 7.5 320px
- 7.6 units (P4/P5)
- 7.7 the nameplate: the two clocks keyed to one trigger (the letter sweep starts when `perform()` starts, re-phased to `0.9s + i×120ms`); `fonts.load()` for the h1 descriptor replaces the `window load` wait, **keeping** the 5,000ms stop. Targets: the full name ≤3.2s, no incomplete state held >0.6s (today 4.38s, and "·yu·h Y·d··" holds 1.83s). `check-nameplate` and its negative twin must stay green.

Plus §9: `inert` on ¶13 and the reduced-motion reveal (P2).

## P9 · Archive (case files, /evidence, 404)

Measured:
- `/projects/fast-mnist-nn/` is **86.5% mono**, and its `corrections` section (1,393 words, over half the page) is **100% mono**.
- `/evidence` is 84.6% mono.
- Em dashes: 61 and 72 respectively.

Plan:
- Apply the same type rules to `archive.css` (corrections and `dd` prose → Newsreader; hashes, commands and figures stay mono).
- A dash pass over the **rendered prose** in `projectCaseStudies.ts` / `proofManifest.ts` / partials, excluding verbatim quotations, code, and **dated corrections/errata entries** (history is never edited; G1 allowlists it).
- The P1 errata land here.

Case files are the proof layer, not the pitch, so no copy cut beyond dashes and the P1 claims.

## G · New gates (each shown red on today's build in a temp copy first)

| gate | asserts | red today? |
|---|---|---|
| G1 dashes | no U+2014/U+2013/spaced hyphen in visible text of any `out/**/*.html`. Allowlisted by selector: quotations (`blockquote`, `.endquote`, epigraphs), code, and **dated history in the corrections and errata registers**, which the owner forbids editing. New errata must be dash-free | yes: 113 on home |
| G2 reading floor | no HTML text under 12px **effective** (computed size × ancestor transform scale) at 390/1440 (SVG keeps its own floor) | yes: 170 pairs |
| G3 mono allowlist | mono computed `font-family` only on machine-value hooks | yes |
| G4 manifest | never covers text involuntarily, at 1512/1440/1280/1024/768/390/320 | yes: 8/9/13/5/8/13/28 |
| G5 contact | visible mailto + `/resume.pdf` in ¶02 without approving; 0 focus stops at effective opacity 0; RM approve reveals ¶13 | yes: 4 invisible stops; RM never reveals |
| G6 pad | the off-centre stroke reads 1 | yes: reads 7 |
| G2b tight SVG floor | the tight (phone) SVG editions get the same ≥12px effective floor; today only the wide editions are covered by `FLOOR_PX` | no today (12.46px), so it's proven by injection |
| G9 tap targets | no interactive target under 24×24 at 390 (WCAG 2.5.8); primary actions (email, résumé, the stops button, approve, the pad's clear) ≥44px | yes: 29 of 41 phone targets are under 44px; the email is 166×15 (`critic-r2`) |
| G7 widths | `HOME_WIDTHS` += 320, 1280, 1512, plus per-element rects | yes: `#clear` at 320 |
| G8 arrow contract | `check-links` also checks relative hrefs (⟶ same-origin) | nothing to catch today, so it is proven on a temp copy with an injected `↗` on a relative href |
| H harness | starved ≤ baseline and blank ≤ baseline at 1512/1440/1280, with the open-panel positive control | a manual `workflow_dispatch` GitHub workflow **and** the per-batch release checklist, so a pixel change made outside these batches still meets it |

## Acceptance: the page is re-read by cold critics

Gates can't see whether the copy sells. The effort started from cold-critic scores, so it ends with them.

**When:** after batch 3 (copy, type, manifest and heights) and again after batch 4 (the phone). The early read on the prototype is below.

**How:**
- Fresh stig critics, not shown any earlier report, use **the same personas and the same quiz as the baseline round** (`../critic-a`, `../critic-b`): the HR screener on a phone with 30 s, the agency recruiter, the non-technical ESL relative, the hiring manager, the staff engineer, the ML engineer, and the design lead.
- Baseline scores: HR 12–32, recruiter 40–56, relative 20–40, hiring manager 62–72, staff engineer 84–90, ML 68–75, design 75–77.

**Pass:** the five quiz facts are the **hard** gate. Scores are directional: two critics per persona, median taken, because a single cold critic is noisy.
- no persona's median below its baseline, and
- the non-technical personas reach a floor **the owner sets** (suggested: ≥60)
- plus the quiz facts the baseline failed:
  - what he does
  - his degree and date
  - how to email him
  - where the résumé is
  - one project in plain words

  each answered within 30 s on a phone.

**Real device:**
- one pass on the owner's own iPhone after batch 4, for the touch reveals, the bottom sheet, and scroll feel on the rAF-heavy page (both UNMEASURED on real hardware)
- labrat takes a mobile performance number (LCP, long frames) before and after.

### Early read, before any work: cold critics on the prototype (`../critic-r2/report.md`)

The same three non-technical personas, cold, on proto A with the full copy and **role option B**, measured with Playwright.

| persona | baseline | prototype |
|---|---|---|
| Priya, HR on an iPhone, 30 s | 12–32 | **61** |
| Marcus, agency recruiter, 1512 | 40–56 | **77** |
| Linda, 55, non-technical, ESL | 20–40 | **57** |

- **Found:** all three found the degree, one project in plain words, the email and the résumé. Priya found all of it inside 30 s on the phone.
- **What they still missed**, now in the plan:
  1. **No role string in the page body.** The only job title Priya saw in 30 s was "Intern". Marcus found "Software, Data, and ML Engineering" only in the browser tab, and Linda couldn't say what job it is. Under option B this is structural, so it's evidence for **option A** (owner question 1).
  2. **The bottom of the page has no contact.** A reader who scrolls to the end finds a copyright line; the contact row lives in ¶13 behind approve. → new **P2 2.9**: the ¶12 colophon carries a small `email · résumé · github · linkedin` row. The gate stays the last screen; yoda's "¶13-only contact" was rejected, and this isn't that.
  3. **29 of 41 phone tap targets are under 44px**, e.g. the email link is 166×15. → **P7**: primary links and controls get ≥44px targets on the phone via padding, not type size. New **G9**: no interactive target under 24×24 (WCAG 2.5.8) at 390, and primary actions ≥44.

## Freshness

- The ¶10 evidence line carries "numbers checked September 2026".
- Re-run the claims audit before any application push, because ruling 1 ("current HEAD") decays the day Applied moves.

## Traceability: every finding → plan item

| finding (source) | → |
|---|---|
| email only after approve; reduced motion never reveals it; 4 invisible tab stops (inv §9, A0, B) | P2 2.2/2.6/2.7, G5 |
| résumé unlinked (A2, B) | P2 |
| "the working paper" links to itself (A0b, B) | P2 2.4 |
| manifest looks like navigation and isn't (A0c, A6, B5); covers text (inv §1); dead toggle, aria desync, 18px target (inv §8) | P5, B0, P7 sheet, G4 |
| no role / "software" / TS / Next.js on home (A3, B3) | P3 SWE hints |
| numbers need a plain gloss (A5, B8) | P3 gloss |
| codenames need a noun (B6) | P3 second lines, P5 ledger rows |
| completed manifest is buried at the end (B4) | P5 ledger rows with nouns and numbers, from the masthead |
| "refused" reads as failure; PolicyBot and Visual Assist unintroduced (A7, B9) | P5 ¶10 |
| evidence index surfaced late (B9) | **owner question** (a masthead link breaks yoda's one-link rule) |
| Glyph pad reads off-centre digits wrong (inv §10, B7) | P8 7.1, G6 |
| Glyph coursework origin not on home (B8) | P3 (copy v2.1): ¶06 opens "Glyph began as an existing 2-layer C++ network…" (the résumé's phrase) |
| red thread through prose (inv §2, A) | phone P7 (0 by construction); desktop B1 (owner) |
| near-empty / blank screens (inv §3, A8, B10) | B2, B3, P7 |
| nameplate 4.38s, "·yu·h Y·d··" (inv §4, A) | P8 7.7 |
| sub-12px text (inv §5, A9) | P4, G2 |
| values break from units (inv §6, B10) | P4/P5 `.uv`, U+202F |
| hover-only reveals, wrong verb on touch, no keyboard (inv §7, A10) | P5 §7 |
| `#clear` clipped at 320; replay `hidden` (inv §12) | P5, P8 7.4, G7 |
| mono 74% (census, owner) | P4, P9, G3 |
| dashes: 113 on home (census, owner) | P3, P9, G1 |
| too much text (owner, friend) | P3 volume table |
| stale Applied numbers; résumé ≠ site (audit) | P1 |
| the drawing pad sets `touch-action:none` over a 295×295px area, so a thumb scrolling past it on a phone gets caught (critic A, touch §5) | P7: the phone pad gets a clear frame and a "draw here" state; scrolling past its edges stays free. Verified on a real iPhone in the acceptance pass |
| the phone's first screen is 40% empty cream at 3 s (critic A) | P7 + P8 7.7: the nameplate settles faster and the role line fills the first screen (see `design/shots/v2-a-w390-y0.jpg`) |
| critic A's ten ranked changes, diffed against this table | 1 contact → P2 · 2 résumé → P2 · 3 job line → P3 role question · 4 pad early → won't fix (the ledger row links to it) · 5 glosses → P3 · 6 manifest as navigation → P5 · 7 refused gates → P5 ¶10 · 8 empty transitions → gate H (starved) · 9 type floor → P4 · 10 hover verbs and the working paper → P5 + owner question 15 |
| ¶03's result deleted by the cut (yoda r2) | copy v2.1 restores "code compliance across 61 projects: 0% in 2023, 97% now", in the same wording P1 1.10 sets, so no phase rewords what another deletes |
| the gate card's "six projects, each with its proof" vs ¶08's "a prototype has nothing to argue yet" (yoda r2) | copy v2.1 rewords it |
| stack rows promised under four stations, one delivered (yoda r2) | copy v2.1 adds ¶05/¶06/¶09 stack rows |
| the h2+ plain line's prominence is not pinned (yoda r2) | batch 3 shot-review checklist: the plain line is the prominent one, read at a glance, never caption size |
| withdrawn weights still linked (audit V11) | P1 1.15 |
| "Every claim carries a receipt" vs "not checked in" read as a contradiction (B) | P3: scoped to "Every **project** number here links to its proof, or says why it can't" (GPA, dean's list and MUCAT link nowhere) |
| "run 042 / 042 is the day's serial" unexplained (B) | P3: the gate card keeps the line; the masthead unchanged (owner loves the conceit) → won't fix beyond that |
| slug/name mismatches `/projects/jobtracker/` = Applied (B) | **won't fix**: the crosswalk ruling says never rename; case file headings already carry both names |
| move the Glyph pad into the first two screens (A4) | **won't fix**: station order is the day arc. Instead, the first screen's identity line and the ledger row say "a digit reader running in this tab" with a jump link |
| "Linda" afraid to press approve (A) | resolved by P2: nothing is behind the button any more |
| the other half of Glyph's benchmark (`glyph-dot256-baseline…json`) unlinked (B) | P5: the `.bfoot` links both arms |
| the gzip button earns little (B) | P3 volume: owner's call |
| "RUN 043 · NOT YET BEGUN" as the last words (B) | kept (the conceit's closing beat); owner may cut |

## Owner questions (bring these to him; don't decide). Most consequential first, each with a recommendation

1. **Role line.** (A) "Software engineer. I build products end to end…" or (B) "I build software end to end, from the interface down to the data and models under it."
   - The meta description follows your pick.
   - Rendered in `review-shots/roleA-1512.jpg` and `roleB-1512.jpg`.
   - *Recommend A*: it's one noun, the critics' loudest finding, and nothing says "seeking". *B* if even one role noun feels too narrow.
2. **Heights.** Pick from the shots at 1512:
   - **A′**: today's heights, plus ¶08's seat trimmed to its content. Measured: it still has one extra blank screen at 1440, so one more trim is owed
   - **B3**: a 27% shorter run

   B1 (the line fades under text) goes with either. *Recommend B3 + B1*: it has the fewest thin or blank screens and no stroke through prose, but only if the screen-1 thread is fixed.
3. **ONNX and RLS lines off home.** They move to the Applied case file under the 2-rows-per-station cap; you kept the ONNX line on purpose. *Recommend* keeping ONNX on home in place of the pipeline row (+12 words, within budget), and moving RLS to the case file.
4. **"the working paper ⟶" on ¶13.** The label stays; the target changes. *Recommend `/evidence/`.*
5. **The masthead gains the manifest button** (the only measured fix for the overlap and the dead toggle). A button, not a link. *Recommend yes.*
6. **Kickers read "project 1 of 6"** instead of "first station". *Recommend yes*, since the railway word stays in the masthead.
7. **Cut the Hamming, Knuth and Lovelace epigraphs** (−89 words). *Recommend yes*; Machado, Brooks, Feynman and Eliot stay.
8. **The Feynman quote keeps its own em dash**: it's his punctuation, verbatim. *Recommend keep.*
9. **The three gate-bound compound phrases**: "single-threaded", "cited-source", "self-reported". Every other compound follows your writing skill and gets rewritten.
10. **The AutoML end month** (dates only come from you).
11. **The gzip demo button**: keep, relabelled "gzip this page with your browser", or cut. *Recommend cut*; it demonstrates the browser, not jetpack.
12. **Fig. 09 draws a gate before all 7 phases**, but the code proves feature engineering and training (and preprocessing when configured). *Recommend redrawing* to the proven gates.
13. **An evidence-index link near the top** (critic B). *Recommend no*: ¶10 carries it, and the masthead stays clean.
14. **The acceptance floor for the cold critics**: *recommend* non-technical personas ≥60, and all five quiz facts found within 30 s on a phone.
15. **Outside this repo, your go.** Batch 1 makes home say 220 rules while Applied's System Card, one click away, still says 219. Sequencing its fix alongside batch 1 avoids a visible mismatch.
    - Applied's System Card and README:162 fixes
    - scrubbing the withdrawn weights from Applied's git history
    - `.gitattributes` fixes for GitHub's language bar on `glyph` and `jetpack-compress`
    - **Your résumé (yours to edit, only flagged):**
      - its summary attaches the withdrawn ONNX build to "Live, public projects" (audit C-10)
      - its skills list names Hugging Face Spaces while the Space is private (R31)
    - If Q3 puts the ONNX line back on home, a `check-figures` entry binds the 90 to 23 MB pair so it can't drift (audit C-12).
