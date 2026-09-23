# Copy v2 · home page (ayush-yadav.com)

This answers yoda's round 1. It was drafted 2026-09-22 against HEAD `035ab9b`, and no tracked file was edited.

**Method.** v2 is written as operations on the census baseline, not as free text:
- The baseline is `baseline_runs.json`, rebuilt from `inventory/sweep-w1440.json` with the inventory's own rule: unique on section, selector and text; effective opacity ≥ 0.5; not clipped; words split on whitespace.
- It reproduces **3,075 words over 626 runs**, the harness figure, exactly.
- `v2ops.py` holds the operations and `gen2.py` applies them. The generator recounts, runs the dash and banned-word check, and fails on any operation that matches nothing (0 unmatched).
- Outputs: `v2_runs.json` (every visible run after v2), `v2_counts.json` and `v2_log.json`.

## 0 · Result

| | before | v2 |
|---|---|---|
| **visible words, census method, 1440** | **3,075** | **2,072 (−1,003, −32.6%)** |
| target | | ≤2,100 (≥31% cut) ✓, 28 words of margin |
| first screen, epigraph excluded | 22 (no role line) | **40** with role option A, 39 with option B ✓ |
| reading prose per station (heading, lines, body) | not measured | **≤73 everywhere** (¶09 is the most) ✓ |
| figure captions, invitation included | up to 50 | **≤19 everywhere** ✓ |
| prov rows per station | up to 5 | **≤2 everywhere** ✓ |

| station | before | v2 | Δ |
|---|---|---|---|
| masthead | 59 | 59 | 0 (clock and phase states; nothing to cut) |
| manifest / ledger | 103 | 83 | −20 |
| ¶01 start | 65 | 74 | +9 (the role line) |
| ¶02 who | 159 | 125 | −34 |
| ¶03 internship | 353 | 193 | −160 |
| ¶04 Applied | 226 | 184 | −42 |
| ¶05 Cadence | 167 | 138 | −29 |
| ¶06 Glyph | 292 | 189 | −103 |
| ¶07 jetpack-compress | 298 | 203 | −95 |
| ¶08 LifeQuest | 260 | 124 | −136 |
| ¶09 Agentic AutoML | 373 | 228 | −145 |
| ¶10 how I work | 251 | 187 | −64 |
| ¶11 references | 246 | 148 | −98 |
| ¶12 gate | 223 | 137 | −86 |
| **total** | **3,075** | **2,072** | **−1,003** |

**Measurement caveats, so the prototype number can be reconciled:**
- The census counts every *state* a run reaches: the manifest's `0 / 6 … 6 / 6`, the masthead clocks, and fig. 09's lit and dim phase labels. v2 keeps those, because the harness will see them too.
- The six new ledger rows (55 words) are counted **once**, as if visible. If picasso's ledger is closed by default, the sweep never sees them and the total falls to about 2,000.
- The ¶07 "gzip a sample in this tab" button (6 words) is counted as kept. It is owner question 6.
- ¶13 is 0 before approval in both versions, so its v1 copy (thank-you line, dawnrow with résumé ⟶) is unchanged and uncounted.

## 1 · The named cuts (the defaults yoda listed, all taken)

| cut | words |
|---|---|
| Option B: 9 hourlines out (¶02 to ¶07, ¶09 to ¶11; ¶01, ¶08, ¶12 and ¶13 keep the day) | −110 |
| Three epigraphs (Hamming, Knuth, Lovelace) plus the long credits on Machado, Brooks and Feynman | −106 |
| Prov rows capped at 2 per station; the dropped rows live on the case files | −406 gross, about −226 net of the rewritten rows |
| Captions to ≤20 words | −153 (283 → 130) |
| ¶03 school record down to degree/GPA/dean's list plus MUCAT (also removes the "co-built in a weekend" line that broke the "born at" lock) | −61 |
| Gate card stops repeating the manifest (six rows out; the hidden `#liveSample` row stays) | −57 |
| ¶08 quest list out (both census states; fig. 08's stair draws the same five steps and two holds) | −60 |
| ¶08 duskin line out (it is also the 520px blank-screen seat, inventory §3) | −14 |
| gzip demo note out (the button is the owner's call) | −13 |
| Handoff lead-ins ("↳ the sorted mail lands in" ×5) | −29 |
| Duplicates: the jetpack bench's second link to the same ledger; the ¶11 plate's "written on linkedin · in public · linkedin · 2026" (the prov line says it); the `.rel` spans the plate beside them repeats | about −38 |
| SVG labels a caption or handoff already says: the fig. 03 foot label and region headers; the fig. 04 provenance label; two fig. 07 foot lines. Their aria keeps every DRAWING_TOKEN | −55 |

## 2 · Role line and meta description (owner question 1)

| | option A: the noun | option B: the verb phrase |
|---|---|---|
| ¶01, first screen (for picasso: the largest non-name type on screen 1) | **Software engineer. I build products end to end, from the interface to the data and models under it.** (18) | **I build software end to end, from the interface down to the data and models under it.** (17) |
| meta / og / twitter description (`personal.ts:188`, then re-render the OG card) | Ayush Yadav, software engineer. Six projects in TypeScript, Python, Java and C++, each claim linked to the artifact that proves it, plus an evidence index that lists them all. | Ayush Yadav: software, data, and ML engineering. Six projects in TypeScript, Python, Java and C++, each claim linked to the artifact that proves it, plus an evidence index that lists them all. |

A names the role and B only implies it. B keeps the `<title>` string's breadth ("Software, Data, and ML Engineering"), which suits the owner's "hints, not too specific" ruling. A is what the research's 10-second screener needs. The count uses A.

## 3 · The copy, station by station (reading order)

Codes: `h2+` is the new second heading line, `prov` a provenance row, `stack` a label (not a prov row), `→` the handoff links.

**¶01** · kicker `¶ 01 · the start · 06:12` · hourline "first light. nothing has been decided yet." · *Ayush Yadav* · **role line (A or B)** · Machado, Spanish, then "Traveller, there is no road; the road is made by walking." · credit "Antonio Machado, 1912" · cue "↓ twelve stops, dawn to dark"

**¶02 Who.**
- "A record of what I've built, and how I checked it."
- "I finished a B.S. in Computer Science at Miami University in May 2026, after a year as its ITSM data integration intern. Three of the six projects below had teammates. **Every project number links to its proof, or says why it can't.**"
- Record card: who built this · *Ayush Yadav* · answers for every claim on this page
  - base · cincinnati, oh
  - builds · web apps · apis · data pipelines · ml
  - languages · typescript · python · java · c++ · sql
  - degree · b.s. computer science · miami university, may 2026
  - email · aesh.03.23@gmail.com
  - résumé · pdf · one page ⟶
  - handles · github ↗ · linkedin ↗
- Caption: "fig. 02 · the record card."

**¶03 The path.**
- h2+ "ITSM Data Integration Intern, Miami University, Jun 2025 to May 2026"
- "Miami was moving its dashboards to Tableau and needed to know which fields were still in use."
- "I built a Python pipeline that flags every dashboard field still in use."
- prov: "1.6m+ query logs, **five years of dashboard use** ⟶ one 57.8m-row usage table (sqlite)"
- prov: "tableau + workday ⟶ one master inventory, 10,453 rows × 35 fields"
- → "↳ only the inventory is published; the rest stays on miami's own systems · the inventory's case file ⟶"
- Caption: "fig. 03 · three messy sources in, three products out."
- School record:
  - degree · b.s. computer science · major gpa 3.65 · dean's list: fall 2023, spring 2025, fall 2025
  - feb 2025 · finalist, mucat design innovation · lidar visual assistance proposal · $2,500 prototyping grant

**¶04 Applied.** Kicker `¶ 04 · project 1 of 6 · 08:47`.
- h2+ "A job application tracker that reads your Gmail"
- "Your inbox already knows where you applied."
- "Applied sorts each message into one of 8 categories, files what it's sure of, and asks you about the borderline ones."
- prov: "**1 wrong out of 96 labelled emails** (0.990 macro-f1) · the rules stage, not the cascade"
- prov: "220 regex rules ⟶ e5 embeddings ⟶ fine-tuned setfit · ci blocks the build below 0.95 macro-f1"
- stack: "next.js · python · postgresql"
- → the live app ↗ · system card ↗ · source ↗ · the case file ⟶
- Caption: "fig. 04 · the sorting line; the eighth email waits for review." with the hover-only invitation "hover a desk for its verdicts."

**¶05 Cadence.** Kicker `¶ 05 · project 2 of 6 · 12:06`.
- h2+ "A calendar you can type to in plain English"
- "Adding a plan to a calendar usually means a form."
- "In Cadence you type the plan as you'd say it, and it becomes the event, attendees and Meet link included."
- prov: "1,186 passed · 0 skipped, **every automated test green** · 635 frontend + 551 backend"
- prov: "36 routes packed into one serverless function to stay under vercel's 12-function limit"
- → the case file ⟶ · source ↗ · live build ↗ · system card ↗
- Caption: "fig. 05 · a scripted parse, not a live call. tap or hover a chip to see its words."

**¶06 Glyph.** Kicker `¶ 06 · project 3 of 6 · 15:23`.
- h2+ "A handwritten digit reader, running in this tab"
- "Glyph began as a working C++ network doing all its math on one core."
- "I made its core matrix kernel **3.5× faster** with OpenMP on a 10-core laptop. It scores 97.01% on the standard handwriting test, **about what a network this size should; the work was the speed.** Try it below."
- prov: "9,701 of 10,000 mnist test digits right (macro-f1 0.9698)"
- prov: "parallel dot-256 kernel 3.5× vs -O3 · parallelism carries all of it; the simd is in both builds"
- Pad hint: "draw one digit, large and centred"
- Bench: "the committed bench · dot-256 kernel" · "one thread, -O3" / "openmp threads" · "committed, not run in this tab · the raw run record (json) ⟶"
- → the case file ⟶ · source ↗ · live build ↗ · system card ↗
- Caption: "fig. 06 · Glyph's C++ network, compiled to WebAssembly."

**¶07 jetpack-compress.** Kicker `¶ 07 · project 4 of 6 · 19:36`.
- h2+ "A parallel gzip engine for Java"
- "Java's built-in gzip compresses on one core, however many the machine has."
- "I built a gzip-compatible engine on JDK 25 that compresses blocks in parallel and stitches them into one valid file. DEFLATE's entropy coding stays with zlib, by design."
- prov: "422 vs 66 mb/s on 1 gib: **6.4× faster** than single-threaded java.util.zip (3-fork jmh · 99.9% ci)"
- prov: "72 tests, 0 failures · adler-32 vectorised 2.8× scalar (4.26 gb/s), and honestly not faster than the jdk intrinsic (14.06 gb/s)"
- Bench: "the committed bench · 1 gib, gzip" · "committed, not run in this tab · both committed runs span 6.38 to 6.89× · the raw run record (json) ⟶"
- → the benchmark ledger @ 2caacd0 ↗ · source ↗ · live build ↗ · system card ↗
- Caption: "fig. 07 · split, compress in parallel, stitch into one gzip file." with the hover-only invitation "hover a lane for its blocks."

**¶08 LifeQuest. A prototype, told honestly.** Kicker `¶ 08 · project 5 of 6 · 21:07`.
- "dusk. the hour that shows what didn't get finished."
- Brooks, credited "Frederick P. Brooks Jr., 1975"
- "LifeQuest turns the job-hunt grind into missions, on a real backend. It was born at Social Innovation Weekend in March 2025 with a 7-person team, in React and NestJS. Scaling it would need a partner."
- → "↳ no case file: a prototype has nothing to argue yet · source ↗ · live prototype ↗ · system card ↗"
- Caption: "fig. 08 · three steps built, two held on purpose." (SVG legend: "solid: built · pencil: not")

**¶09 Agentic AutoML.** Kicker `¶ 09 · project 6 of 6 · 22:05`.
- h2+ "A capstone platform where an AI agent trains models, with human sign-off"
- "An AI agent can run a notebook from raw data to a trained model. Unchecked, it can go wrong quietly."
- "Two of us built it. A LangGraph agent profiles the data, writes and runs the notebook cells, and waits for a person's approval before feature engineering and training. My seat was the backend, including the model scoring service."
- prov: "**2,523 automated tests, all passing**: 1,445 backend · 985 frontend · 93 landing"
- prov: "44 agent tools, 12 over mcp · the llm's python runs in a locked-down docker sandbox"
- "no accuracy figure is quoted: no committed evaluation earns one."
- → the case file ⟶ · the repo, gpl-3.0 ↗ · live build ↗
- Caption: "fig. 09 · the 12 mcp tools in source order, timing staged. the run halts before deploy."

**¶10 How I work.**
- "Every record is in one place: the evidence index ⟶" · Feynman, credited "Richard P. Feynman, 1974"
- Litany:
  - Make it learn · "3,747 passed · 0 skipped · 13 expected failures, Applied's backend suite ⟶"
  - Make it fast · "parallel dot kernel 3.5× over -O3, Glyph's committed benchmark ⟶"
  - Make it hold up · "71 passed · 0 skipped · **Visual Assist, an iOS accessibility app** ⟶"
  - Make it *honest* · "19/20 cited-source sweep, self-reported · **PolicyBot, a policy assistant that cites its sources** ⟶"
- Plate, top line (moved up): "a refused gate is the system working."

  | gate | word | why |
  |---|---|---|
  | classifier gate · Applied | **passed** | 1 wrong in 96, above the 0.95 floor |
  | cited-source sweep · PolicyBot | **declined** | 4 answers it couldn't cite |
  | benchmark suite · Glyph | **caught** | a variance claim nobody had measured |

- Legend: "a flat bar: the gate stopped the run · the line runs on dashed and unsigned, to a person" · "two of my own checks stopped my own work. the next stop is a person."
- Caption: "fig. 10 · three real gates and what each decided."

**¶11 Two people wrote this down in public.**
- "My manager at Miami and my teammate on Glyph and the capstone."
- Vollen, as a shorter verbatim excerpt: "From the start, he operated above intern level… He built data pipelines used to analyze Oracle Analytics Server usage… He understood intent, not just requirements."
- Chaturvedi, unchanged.
- Plate rows: "Randall Vollen · his manager, station 03" / "Shree Chaturvedi · teammate, stations 06 and 09" · "three of the twelve stops carry a name that is not mine."
- prov and link, unchanged.
- Caption: "fig. 11 · each reference sits beside the station that person worked on."

**¶12 Every pipeline I build ends with a human decision.**
- "This one ends with yours."
- Ladder rows unchanged except "22:41 · the human gate" and "deploy · yours"
- Card: "run 042 · the manifest, complete." · "six projects, each with its proof · one signature missing" · "042 is the day's serial, not a visit counter." · **approve run 042** · "scrolling could not press this button · pressing it only turns the page to morning."
- Footer: "© 2026 ayush yadav · cincinnati, oh" · "set by hand · zero dependencies"

**Ledger rows** (masthead button; each row links to its station; ≤8 words not counting separators):

| row | words |
|---|---|
| applied · gmail job tracker · 1 wrong in 96 | 8 |
| cadence · plain-english calendar · 1,186 tests pass | 6 |
| glyph · digit reader in c++ · 3.5× faster kernel | 8 |
| jetpack-compress · parallel java gzip · 6.4× faster | 6 |
| lifequest · job-hunt prototype · 3 of 5 built | 7 |
| agentic automl · capstone ml agent · 2,523 tests pass | 8 |

Foot: "six software projects". Toggle: "run 042 · manifest". Masthead phases: `lifequest · dusk`, `the gate · held`.

## 4 · Plain-language glosses (one per station, beside the number, never replacing it)

| station | headline number | gloss |
|---|---|---|
| ¶03 | 1.6m+ query logs | five years of dashboard use |
| ¶04 | 0.990 macro-f1 | the raw pair leads: 1 wrong out of 96 labelled emails |
| ¶05 | 1,186 passed · 0 skipped | every automated test green |
| ¶06 | 3.5× · 97.01% | "3.5× faster"; "about what a network this size should; the work was the speed" |
| ¶07 | 422 vs 66 mb/s | 6.4× faster |
| ¶09 | 2,523 tests | automated tests, all passing |
| ledger | one number per row | "1 wrong in 96", "tests pass", "faster" |

## 5 · Fact checks new in v2

- **"on every core" is dropped.** `public/proof/glyph-dot256-openmp-native-001e9b4.json` records `context.num_cpus: 10` on `MacBookPro.lan`, and `threads: 1` is Google Benchmark's harness thread. **The OpenMP thread count is not recorded anywhere in the file.**
  - v2 says "with OpenMP on a 10-core laptop", which is true of the recorded machine.
  - The bench bar label `openmp, all cores` becomes `openmp threads` for the same reason.
  - `run-home.spec.ts:232` and `check-bench-artifacts.mjs:471` carry that label only in *messages*, not assertions. Update both for consistency.
- **¶10 dispositions.**
  - PolicyBot's sweep *declined* 4 unsupported topics (`public/proof/policybot-validation-ledger.json` row "safe fallbacks: 4, unsupported topics declined instead of overclaiming").
  - Glyph's benchmark suite *caught* the "sub-percent variance" line that was never measured, and it was corrected at `001e9b4` (`projectCaseStudies.ts:459-464`).
  - Applied's classifier gate *passed* at 1 wrong in 96, above the 0.95 floor.
  - The `.refused` row classes and clay marks stay. Only the words change. **Please confirm "caught" against the Glyph corrections register before shipping.**
- **¶02 scope.** "Every project number links to its proof, or says why it can't." The GPA, dean's list and MUCAT figures now sit outside the promise.
- **¶05 routes.** 36, as yoda worded it.

## 6 · Bound-string ledger, v2

Everything in v1 §3 and §3b still holds unless a row below replaces it. Every row here was checked against the gate source.

### 6a · check-figures literals a v2 cut removes from home

These must move or retire, or they go red:

| FIGURES entry | v1 state | v2 | required gate edit |
|---|---|---|---|
| `Glyph · hand-written instruction sets`, run `/4 hand-written simd paths in the dot kernels/` | reworded | **cut from home** (the simd row goes to the case file) | set `run: null`, keep `cases: /Four hand-written instruction sets in the dot kernels/`, and add a comment saying it is stated on the case file only (the `run: null` form the file already documents) |
| `AutoML · commit count`, run `/2,186 commits/` | kept | **cut from home** | `run: null`, keep `cases: /2,186 commits reachable from the pinned commit 5e42233/` |
| `Cadence · suite split`, run `/635 fe \+ 551 be/` (the gate card row) | kept | the gate card row is cut; ¶05's prov row now says "635 frontend + 551 backend" | run regex becomes `/635 frontend \+ 551 backend/`; `cases` is unchanged and already that phrase |

No other bound literal leaves home. Checked one by one, all still present:
- `1,186 passed · 0 skipped`
- `97.01%` (¶06 reading line)
- `macro-f1 0.9698`
- `parallel dot-256 kernel 3.5× vs -O3`
- `parallelism carries all of it; the simd is in both builds`
- `422 vs 66 mb/s`
- `adler-32 vectorised 2.8× scalar`
- `4.26 gb/s`
- `virtual threads 422 mb/s` (bench row, unchanged)
- `72 tests, 0 failures` (¶07 prov row 2)
- `below 0.95 macro-f1`
- `71 passed · 0 skipped`
- `19/20 cited-source sweep, self-reported` (QUALIFIED)

### 6b · check-figures run regexes that change wording (the literal stays on home)

| entry | new run regex |
|---|---|
| `Applied · eval set` | `/1 wrong out of 96 labelled emails/` |
| `Applied · rule count` | `/220 regex rules/`, with the `cases` rebind per v1 |
| `Applied · backend suite` | `/3,747 passed · 0 skipped · 13 expected failures/` |
| `Glyph · MNIST correct count` (`9,701/10,000`) | `/9,701 of 10,000/` |
| `jetpack · parallel speed-up` (`6.4× single-threaded java.util.zip`) | `/6\.4× faster than single-threaded java\.util\.zip/`; the `projects` twin `/6\.4× vs single-threaded java\.util\.zip/` is unchanged |
| `AutoML · suite` | `/2,523 automated tests, all passing: 1,445 backend · 985 frontend · 93 landing/`; the `cases` twin is unchanged |
| **new** `Cadence · routes` | `/36 routes packed into one serverless function/`, source `cadence 6d09ee4 api/index.ts ROUTES :55-98` |
| windowed needle | `0.9791` becomes `0.990` within `/rules/`. It is satisfied on ¶04's prov row 1, and it is the only home occurrence now: the manifest and gate rows no longer print it |

### 6c · TEXT_PLATES

- **fig. 02:** the degree claim becomes `b.s. computer science · miami university, may 2026` (as v1). `answers for every claim on this page` and both `exposed` links are kept.
- **fig. 05:** `hover a chip to see its words` survives as a substring of "tap or hover a chip to see its words". `next Tuesday at noon` is kept.
- **fig. 10:**
  - claims `a refused gate is the system working`, `the gate stopped the run` and `the line runs on dashed and unsigned, to a person` are all kept. The first moves above the rows but stays **inside `<figure>`**, since `figureBlock()` slices from `<figure` to `</figure>`.
  - `exposed: [/>passed<\/span>/, />refused<\/span>/]` becomes **`[/>passed<\/span>/, />declined<\/span>/, />caught<\/span>/]`**.
  - The new `.gwhy` spans must not be `aria-hidden`.
- **fig. 11:** the claim is kept. Its `exposed` names are still in the plate rows.

### 6d · DRAWING_TOKENS

No change beyond v1: appliedFig swaps one token. The v2 SVG-label cuts touch only drawn `<text>`, never an `aria-label`:
- fig. 03 foot label and region headers
- fig. 04 provenance label
- fig. 07 two foot lines
- fig. 08 legend shortened

The `check-figures` px floor is font-size arithmetic, which cuts cannot trip.

### 6e · Other gates

- **check-bench-artifacts**
  - `:510` holds.
  - `:514` drops the em dash (as v1).
  - `:631` joiner becomes " to "; "both committed runs span 6.38 to 6.89×" stays in the jetpack `.bfoot`.
  - `:471` is a message string only: update it to "openmp threads".
- **run-home.spec.ts**
  - `:73`/`:74` kickers as v1.
  - `:232` is a message label only: update it.
  - The four-bar geometry test is untouched, because the bars stay.
  - `#slotWhen` "12:00" is untouched.
- **stations.ts kickers:** as v1, except beat 7 becomes `¶ 08 · project 5 of 6`. The "the honest hour" clause goes; the h2 already says "told honestly".
- **check-links:** the glyph-contract floor is ≥14 anchors. v2 removes one (the jetpack bench's duplicate `on file @ 2caacd0 ↗`) and adds `mailto` plus `résumé ⟶`. The pinned-URL fetch list shrinks by that one duplicate, whose href is still pinned by the handoff copy.
- **check-palette:**
  - `.gatecard .note` keeps its `color:var(--ink-2)` rule.
  - The dusk regex binds `<figure class="plate bare" … data-fx-sync="dusk">`, which stays.
  - Cutting the duskin **line** does not touch it. The duskin **seat JS** (`:2627-2657`) then has no element, so picasso removes that branch too.
- **Unbound, confirmed by grep over `tests/playwright` and `scripts/qa`:** the quest list, the duskin line, `#gzbtn`, the school record, and the gate card rows. Deleting them trips nothing but the golden hash.
- **QUOTED PEOPLE:** the shorter Vollen excerpt is three verbatim fragments joined by ellipses. Each fragment of 6 or more words is a contiguous substring of `testimonials.ts` after the gate's normalisation:
  - "From the start, he operated above intern level" (8)
  - "He built data pipelines used to analyze Oracle Analytics Server usage" (10)
  - "He understood intent, not just requirements" (6)

## 7 · Carried unchanged from v1

The following still stand exactly as v1 §4 wrote them:
- The data-layer contradictions:
  - `proofManifest.ts:202`
  - the ONNX tense in `projects.ts` and the jobtracker case file
  - the withdrawn-weights link, which stays a separate privacy item
  - the receipt 04/05 re-pin with `APPLIED_EVAL_SHA`
  - coverage 69%
  - the AutoML `endDate`
  - the stale System Card
- The eleven errata.
- The Glyph waybill ("a blank 28×28, waiting for your hand") and its fixture re-record.
- ¶13 (thank-you line, dawnrow with résumé ⟶, "back to the top ⟶").

v2 adds one erratum candidate: the Glyph bench label "openmp, all cores" became "openmp threads", because the record does not state the thread count.

## 8 · Open questions for the owner (v2)

1. **Role line and meta:** option A (noun) or B (verb phrase), §2. Also: JSON-LD `jobTitle` only if A.
2. **Kickers:** "project N of 6" or keep "first station…". v2 assumes project N of 6.
3. **Feynman's em dash:** kept verbatim as his punctuation. It is the only dash left on the visible page.
4. **Fig. 09 booms:**
   - The drawing still shows a gate before all seven phases.
   - The words no longer claim it ("seven phases · review gates").
   - Redraw after re-deriving per phase at `5e42233`.
5. **The quest list and duskin line cuts in ¶08.** They are the two cuts most tied to the dusk choreography, so picasso should confirm the dusk sequence still reads.
6. **The ¶07 "gzip a sample in this tab" button:** keep, or cut for −6. If it stays, its scoping must stay too: without the cut note, the button reads as jetpack's engine. Relabel it "gzip this page with your browser" (6 words, same count).
7. **"caught"** for the Glyph benchmark gate: confirm against the Glyph corrections register.
8. **AutoML end month.**

## 9 · Self-check (gen2.py, over all 2,072 words of visible runs after v2)

- **U+2014 em dash: 0 · U+2013 en dash: 0 · spaced hyphen: 0**, excluding verbatim quotations.
- The one dash inside a quotation is Feynman's (open question 3).
- **Banned and tell words: 0.** "high-performance computing" was a course title, and it left with the coursework row.
- Unmatched operations: 0.
- Protected scoping, all still on the page:
  - "the rules stage, not the cascade"
  - "not run in this tab"
  - "honestly not faster than the jdk intrinsic"
  - "a scripted parse, not a live call"
  - "which desk takes which verdict is drawn, not measured" (fig. 04 label)
  - "the lane assignment and the block sizes are drawn, not measured" (fig. 07 label)
  - "19/20 … self-reported"
  - "no accuracy figure is quoted: no committed evaluation earns one"
- "not jetpack's engine" went with the gzip note. Its job passes to the relabelled button (open question 6), or the button goes too.

---

## Appendix · every change, per station (generated from `v2_log.json`)

#### masthead: 59 → 59 words (+0)


**Changed:**

| before | after | note |
|---|---|---|
| lifequest — dusk | lifequest · dusk | EDIT dash out; PHASE_NAMES[7] + stations.ts name |
| the gate — held | the gate · held | EDIT dash out; PHASE_NAMES[11] + stations.ts name |

#### manifest / ledger: 103 → 83 words (-20)

**Cut** (−68):
- ~~applied~~ · old two-state rows (idle + filled), replaced by one link row each
- ~~applied~~
- ~~cadence~~
- ~~cadence~~
- ~~glyph~~
- ~~glyph~~
- ~~jetpack-compress~~
- ~~jetpack-compress~~
- ~~lifequest~~
- ~~lifequest~~
- ~~agentic automl~~
- ~~agentic automl~~
- ~~01~~
- ~~01~~
- ~~02~~
- ~~02~~
- ~~03~~
- ~~03~~
- ~~04~~
- ~~04~~
- ~~05~~
- ~~05~~
- ~~06~~
- ~~06~~
- ~~rules macro-f1 0.9791 · 96-sample gate~~ · old row value
- ~~sentence → committed plan · 1,186 tests~~
- ~~97.01% · 10,000-image test set~~
- ~~72 tests, 0 failures · jdk 25~~
- ~~prototype · held marks stay held~~
- ~~langgraph + 44 tools · 12 over mcp · gated ×7~~

**Changed:**

| before | after | note |
|---|---|---|
| — manifest | · manifest | EDIT dash out |
| six projects · each ticks off as you reach it | six software projects | EDIT SWE hint; the tick sentence goes (the count already shows it) |

**New:**
- applied · gmail job tracker · 1 wrong in 96 · NEW ledger row (link to its station); counted once, though closed-by-default would hide all six from the sweep
- cadence · plain-english calendar · 1,186 tests pass · NEW ledger row (link to its station); counted once, though closed-by-default would hide all six from the sweep
- glyph · digit reader in c++ · 3.5× faster kernel · NEW ledger row (link to its station); counted once, though closed-by-default would hide all six from the sweep
- jetpack-compress · parallel java gzip · 6.4× faster · NEW ledger row (link to its station); counted once, though closed-by-default would hide all six from the sweep
- lifequest · job-hunt prototype · 3 of 5 built · NEW ledger row (link to its station); counted once, though closed-by-default would hide all six from the sweep
- agentic automl · capstone ml agent · 2,523 tests pass · NEW ledger row (link to its station); counted once, though closed-by-default would hide all six from the sweep

#### ¶01 start: 65 → 74 words (+9)

**Cut** (−8):
- ~~Proverbios y cantares~~ · credit detail
- ~~XXIX, Campos de Castilla, 1912~~

**Changed:**

| before | after | note |
|---|---|---|
| ¶ 01 · the start — | ¶ 01 · the start · | EDIT kicker; run-home.spec.ts:73 |
| Traveller, there is no road — the road is made by walking. | Traveller, there is no road; the road is made by walking. | EDIT dash out (the site's own translation) |
| Antonio Machado · | Antonio Machado, | EDIT credit shortened |

**New:**
- Software engineer. I build products end to end, from the interface to the data and models under it. · NEW role line, OPTION A (owner question 1). Option B: 'I build software end to end, from the interface down to the data and models under it.' (17 words)

#### ¶02 who: 159 → 125 words (-34)

**Cut** (−50):
- ~~the sun clears the roofline, and the day has to be answered for.~~ · hourline (Option B)
- ~~And how each piece was checked before I called it done.~~ · merged into the line above
- ~~every station on this line hands its output to a case file, source, or live build — the links are in each station’s handoff.~~ · p.nb: each handoff shows its own links
- ~~filed~~ · engcard header detail
- ~~06:58~~

**Changed:**

| before | after | note |
|---|---|---|
| ¶ 02 · who — | ¶ 02 · who · | EDIT kicker |
| This is a record of what I’ve built. | A record of what I’ve built, and how I checked it. | EDIT |
| I’m a computer-science graduate from Miami University, based in Cincinnati, Ohio. I build the interface, the services behind it, the data they run on, and the machine learning when a problem needs it. Every claim on this line carries a receipt. | I finished a B.S. in Computer Science at Miami University in May 2026, after a year as its ITSM data integration intern. Three of the six projects below had teammates. Every project number links to its proof, or says why it can’t. | EDIT scoped per yoda: GPA, dean's list and MUCAT link nowhere |
| interfaces · services · data · ml | web apps · apis · data pipelines · ml | EDIT SWE hint |
| b.s. computer science — miami university, may 2026 | b.s. computer science · miami university, may 2026 | EDIT dash out; check-figures TEXT_PLATES fig.02 claim |
| fig. 02 — the record card: what I build, and where to find me. | fig. 02 · the record card. | EDIT caption ≤20 |

**New:**
- languages · NEW record-card row label
- typescript · python · java · c++ · sql · NEW SWE hint
- email · NEW (decided)
- aesh.03.23@gmail.com · NEW (decided)
- résumé · NEW (decided)
- pdf · one page ⟶ · NEW (decided); same origin so ⟶

#### ¶03 internship: 353 → 193 words (-160)

**Cut** (−187):
- ~~early light — everything has a shape and nothing has a name.~~ · hourline (Option B)
- ~~“The purpose of computing is insight, not numbers.”~~ · Hamming epigraph
- ~~Richard W. Hamming ·~~
- ~~Numerical Methods for Scientists and Engineers, 1962~~
- ~~itsm data integration intern — miami university · jun 2025 – may 2026~~ · old prov (4 rows → 2)
- ~~1.6m+~~
- ~~oas query logs — 5 yrs · 1,153 users · 66 dashboards ⟶ a~~
- ~~57.8m-row~~
- ~~field-usage table, sqlite~~
- ~~tableau + workday silos ⟶ one master inventory —~~
- ~~10,453 rows × 35 fields~~
- ~~· hash-dedup · ruff + pytest ci~~
- ~~legacy laravel reporter ⟶ etl ⟶~~
- ~~37-month~~
- ~~tableau dashboard — compliance~~
- ~~0% ⟶ 97%~~
- ~~across 61 projects~~
- ~~not checked in — read off miami’s own systems~~ · SVG foot label: the handoff line says the same (the aria keeps its DRAWING_TOKEN)
- ~~the freight~~ · fig. 03 region headers (picasso to confirm the drawing reads without them)
- ~~the works~~
- ~~the products~~
- ~~the merge is the thread you are following.~~ · caption clause
- ~~miami university · oxford, oh ·~~ · school record header detail (the h2 line and ¶02 say it)
- ~~may 2026~~
- ~~coursework~~ · school record to degree/GPA/dean's list + MUCAT (lifequest row also broke the 'born at' lock)
- ~~high-performance computing · data structures & algorithms · machine learning · deep learning · databases~~
- ~~certificates ’26~~
- ~~azure ai essentials · snowflake data engineering · data analysis & github (microsoft)~~
- ~~mar 2025~~
- ~~social innovation weekend —~~
- ~~lifequest~~
- ~~co-built in a weekend · react + nestjs · 7-person team · held at station 05 tonight~~

**Changed:**

| before | after | note |
|---|---|---|
| ¶ 03 · the yard — | ¶ 03 · the internship · | EDIT kicker; stations.ts beat 2 |
| Five years of query logs. Zero structure. | Miami was moving its dashboards to Tableau and needed to know which fields were still in use. | EDIT problem |
| The job before this run: teach the records shape. It’s where I learned that the work starts in the mess. | I built a Python pipeline that flags every dashboard field still in use. | EDIT action |
| ↳ only the inventory is checked in — the rest are read off miami’s own systems and cannot be published | ↳ only the inventory is published; the rest stays on miami’s own systems | EDIT dash out, shorter |
| fig. 03 — three sources in, one table out. | fig. 03 · three messy sources in, three products out. | EDIT caption |
| the school record — filed with the run | the school record | EDIT |
| · dean’s list — fall 2023 · spring 2025 · fall 2025 | · dean’s list: fall 2023, spring 2025, fall 2025 | EDIT dash out |
| — lidar visual-assistance proposal · | · lidar visual assistance proposal · | EDIT dash out |

**New:**
- ITSM Data Integration Intern, Miami University, Jun 2025 to May 2026 · NEW h2 second line (résumé title verbatim)
- 1.6m+ query logs, five years of dashboard use ⟶ one 57.8m-row usage table (sqlite) · EDIT prov row 1 + GLOSS on the headline number
- tableau + workday ⟶ one master inventory, 10,453 rows × 35 fields · EDIT prov row 2 (the checked-in artifact)

#### ¶04 Applied: 226 → 184 words (-42)

**Cut** (−93):
- ~~the morning post, and the first thing anyone does with it is sort.~~ · hourline (Option B)
- ~~201 regex rules~~ · old prov (4 rows → 2): the ONNX and RLS rows move to the case file only
- ~~⟶ e5 embeddings ⟶ fine-tuned setfit~~
- ~~macro-f1 0.9791~~
- ~~· 96-sample eval — 8 classes · 2 misclassified — the rules stage, not the cascade~~
- ~~ci blocks the build below 0.95 macro-f1 · int8 onnx via transformers.js —~~
- ~~90 mb ⟶ 23 mb~~
- ~~postgres row-level security — a non-bypassrls role~~
- ~~↳ the sorted mail lands in~~ · handoff lead-in
- ~~the three bars read off applied’s classifier/hybrid.py~~ · figure provenance label (it stays in the aria and case file)
- ~~a piece leaves at the first desk that clears it; the eighth clears nothing~~
- ~~.~~ · stray caption period run (folded into the line)

**Changed:**

| before | after | note |
|---|---|---|
| ¶ 04 · first station — | ¶ 04 · project 1 of 6 · | EDIT kicker; stations.ts beat 3 |
| Applied reads it — on a device you control, and defers to you when it isn’t sure. | Applied sorts each message into one of 8 categories, files what it’s sure of, and asks you about the borderline ones. | EDIT fixes the false 'on a device you control' |
| 201 regex rules | 220 regex rules | EDIT fig. 04 desk label |
| the local cascade | the three-layer cascade | EDIT |
| held for you | held for review | EDIT |
| nothing reached 0.85 — it keeps the rules’ own guess | nothing reached 0.85, so it keeps the rules’ own guess | EDIT dash out |
| fig. 04 — the sorting line, scrubbed by your scroll. | fig. 04 · the sorting line; the eighth email waits for review. | EDIT caption |
| — hover a desk to see what it settled | hover a desk for its verdicts. | EDIT |

**New:**
- A job application tracker that reads your Gmail · NEW h2 second line
- 1 wrong out of 96 labelled emails (0.990 macro-f1) · the rules stage, not the cascade · EDIT prov row 1; the raw pair IS the gloss
- 220 regex rules ⟶ e5 embeddings ⟶ fine-tuned setfit · ci blocks the build below 0.95 macro-f1 · EDIT prov row 2
- next.js · python · postgresql · NEW stack label (not a prov row)

#### ¶05 Cadence: 167 → 138 words (-29)

**Cut** (−75):
- ~~noon. nothing casts a shadow, so nothing hides in one.~~ · hourline (Option B)
- ~~1,186 passed · 0 skipped~~ · old prov (4 rows → 2): parser and RLS rows go; the parse's 'scripted, not live' scoping moves into the caption
- ~~— 635 frontend + 551 backend~~
- ~~4-stage parse — chrono · hashtag · priority · compromise (this sample is scripted, not a live call)~~
- ~~37 routes~~
- ~~in one serverless function — vercel’s 12-function cap~~
- ~~rls enforced on~~
- ~~7 tables~~
- ~~— force, 22 policies · owner-scoped checks on 6 services · idor suite in ci~~
- ~~↳ the committed plan lands in~~ · handoff lead-in

**Changed:**

| before | after | note |
|---|---|---|
| ¶ 05 · second station — | ¶ 05 · project 2 of 6 · | EDIT kicker |
| Plans, the way you’d say them out loud. | Adding a plan to a calendar usually means a form. | EDIT problem |
| Type a sentence; it becomes the event — attendees, Meet link and all. | In Cadence you type the plan as you’d say it, and it becomes the event, attendees and Meet link included. | EDIT action |
| fig. 05 — the parse: the sentence resolves into the schedule as you scroll. | fig. 05 · a scripted parse, not a live call. | EDIT caption carries the scoping |
| hover a chip to see its words. | tap or hover a chip to see its words. | EDIT verb fixed for touch |

**New:**
- A calendar you can type to in plain English · NEW h2 second line
- 1,186 passed · 0 skipped, every automated test green · 635 frontend + 551 backend · EDIT prov row 1 + GLOSS
- 36 routes packed into one serverless function to stay under vercel’s 12-function limit · EDIT prov row 2 (yoda wording; 37 → 36)

#### ¶06 Glyph: 292 → 189 words (-103)

**Cut** (−132):
- ~~mid-afternoon, when the light goes hard and shows the edges.~~ · hourline (Option B)
- ~~“We should forget about small efficiencies, say about 97% of the time… yet we should not pass up our opportunities in that critical 3%.”~~ · Knuth epigraph
- ~~Donald E. Knuth ·~~
- ~~Structured Programming with go to Statements, ACM Computing Surveys, 1974~~
- ~~97.01%~~ · old prov (3 rows → 2): the simd row goes to the case file
- ~~on the 10,000-image mnist test set — 9,701/10,000 · macro-f1 0.9698~~
- ~~parallel dot-256 kernel~~
- ~~3.5×~~
- ~~vs -O3 — parallelism carries all of it; the simd is in both builds · 784 ⟶ 100 ⟶ 10~~
- ~~4 hand-written simd paths in the dot kernels — avx-512 · avx2 · neon · wasm128 (the wasm in this tab predates the fourth: -msimd128, compiler-vectorised) · 2-person team~~
- ~~— the run needs a sample~~
- ~~↳ your sample’s reader lands in~~ · handoff lead-in
- ~~what you draw departs down the line.~~

**Changed:**

| before | after | note |
|---|---|---|
| ¶ 06 · third station — | ¶ 06 · project 3 of 6 · | EDIT kicker |
| No frameworks. Just math, memory, and C++. | Glyph began as a working C++ network doing all its math on one core. | EDIT problem; cuts a listed AI tell |
| The network below is awake in this tab — 45.9 KB of WebAssembly and 310.6 KB of weights, no server. The run needs a sample: yours. | I made its core matrix kernel 3.5× faster with OpenMP on a 10-core laptop. It scores 97.01% on the standard handwriting test, about what a network this size should; the work was the speed. Try it below. | EDIT action + GLOSS ('3.5× faster', the accuracy gloss). 'every core' dropped: the committed run records num_cpus 10, not the OpenMP thread count |
| — | · | EDIT idle placeholder, dash out |
| — | · | EDIT idle placeholder, dash out |
| draw a digit 0–9 | draw one digit, large and centred | EDIT honest guidance until the pad centres (inventory §10) |
| the committed bench — dot-256 kernel | the committed bench · dot-256 kernel | EDIT dash out |
| openmp, all cores | openmp threads | EDIT the record does not state the thread count |
| measured then, committed — not run in this tab. 3.536× at the median of 20 reps a side · cv 0.16% / 0.28% · one committed run, so no spread to quote · | committed, not run in this tab · | EDIT bench foot trimmed (3.536× median and cv stay on the case file) |
| fig. 06 — the classifier is the portfolio’s own C++. | fig. 06 · Glyph’s C++ network, compiled to WebAssembly. | EDIT caption (two-person codebase) |

**New:**
- A handwritten digit reader, running in this tab · NEW h2 second line
- 9,701 of 10,000 mnist test digits right (macro-f1 0.9698) · EDIT prov row 1
- parallel dot-256 kernel 3.5× vs -O3 · parallelism carries all of it; the simd is in both builds · EDIT prov row 2 (bound phrases kept)

#### ¶07 jetpack-compress: 298 → 203 words (-95)

**Cut** (−134):
- ~~the sun going down, and the work speeding up to beat it.~~ · hourline (Option B)
- ~~6.4×~~ · old prov (4 rows → 2)
- ~~single-threaded java.util.zip — 422 vs 66 mb/s (3-fork jmh · 99.9% ci)~~
- ~~adler-32 vectorised~~
- ~~2.8×~~
- ~~scalar — 4.26 gb/s — bit-identical to java.util.zip.Adler32, and honestly not faster than the jdk intrinsic (14.06 gb/s)~~
- ~~jdk~~
- ~~25~~
- ~~· one virtual thread per block, bounded in-flight window · memory-mapped i/o via ffm~~
- ~~72 tests, 0 failures~~
- ~~browser gzip on this page’s own html — an illustration, not jetpack’s engine~~ · gzip demo note (the button is owner question 6)
- ~~↳ the member lands in~~ · handoff lead-in
- ~~the trailer’s check covers the whole input, not any one block~~ · SVG foot line (the caption says it)
- ~~one gzip member — a header, the blocks in stream order, a trailer~~ · SVG foot line (the caption says it; the aria keeps `one gzip member`)
- ~~filed 2026-07-27 ·~~ · duplicate: the handoff links the same ledger @ 2caacd0
- ~~on file @ 2caacd0 ↗~~ · duplicate link (check-links pins stay satisfied by the handoff copy)
- ~~clay marks the trailer, the one part of the member that answers for the whole of it~~
- ~~.~~ · stray caption period run

**Changed:**

| before | after | note |
|---|---|---|
| ¶ 07 · fourth station — | ¶ 07 · project 4 of 6 · | EDIT kicker |
| One gzip stream, many virtual threads. | Java’s built-in gzip compresses on one core, however many the machine has. | EDIT problem |
| The stream splits, the threads compress in parallel, and the lanes stitch back into one valid member. | I built a gzip-compatible engine on JDK 25 that compresses blocks in parallel and stitches them into one valid file. DEFLATE’s entropy coding stays with zlib, by design. | EDIT action; the zlib clause is Résumé 2.0's |
| the committed bench — 1 gib, gzip | the committed bench · 1 gib, gzip | EDIT dash out |
| measured then, committed — not run in this tab. 6.4× is the 3-fork jmh result; across both committed runs the ratio spans 6.38–6.89× · | committed, not run in this tab · both committed runs span 6.38 to 6.89× · | EDIT bench foot; check-bench-artifacts:631 span joiner |
| fig. 07 — split ⟶ compress in parallel ⟶ stitch, into one valid gzip member; the lettered bytes are the format’s own notation. | fig. 07 · split, compress in parallel, stitch into one gzip file. | EDIT caption |
| — hover a lane to see which blocks it wrote | hover a lane for its blocks. | EDIT |

**New:**
- A parallel gzip engine for Java · NEW h2 second line
- 422 vs 66 mb/s on 1 gib: 6.4× faster than single-threaded java.util.zip (3-fork jmh · 99.9% ci) · EDIT prov row 1 + GLOSS '6.4× faster'
- 72 tests, 0 failures · adler-32 vectorised 2.8× scalar (4.26 gb/s), and honestly not faster than the jdk intrinsic (14.06 gb/s) · EDIT prov row 2 (protected hedge kept)

#### ¶08 LifeQuest: 260 → 124 words (-136)

**Cut** (−97):
- ~~01~~ · the five quest rows (both census states): fig. 08's stair draws the same five steps and the same two holds
- ~~01~~
- ~~02~~
- ~~02~~
- ~~03~~
- ~~03~~
- ~~04~~
- ~~04~~
- ~~05~~
- ~~—~~
- ~~—~~
- ~~—~~
- ~~✓~~
- ~~…~~
- ~~…~~
- ~~shipped~~
- ~~held~~
- ~~mission card — playable~~
- ~~mission card — playable~~
- ~~tier ladder — working~~
- ~~tier ladder — working~~
- ~~full-stack backend — real~~
- ~~full-stack backend — real~~
- ~~scale — needs a partner or funder~~
- ~~scale — needs a partner or funder~~
- ~~finished product — not claimed~~
- ~~the cut is where the record stops; the climb pauses the way the run halts — on purpose.~~
- ~~The Mythical Man-Month~~ · credit detail (also removes the Man-/Month wrap)
- ~~, 1975~~
- ~~dusk. the light is the record: what shipped is lit, what didn’t stays dashed.~~ · the duskin line; its 520px desktop seat is inventory §3's blank screen (picasso: the duskin seat JS must go with it)

**Changed:**

| before | after | note |
|---|---|---|
| ¶ 08 · fifth station · the honest hour — | ¶ 08 · project 5 of 6 · | EDIT kicker (the h2 already says 'told honestly') |
| dusk — the hour that shows you what did not get finished. | dusk. the hour that shows what didn’t get finished. | EDIT hourline kept (Option B keeps dusk) |
| Job-seeking turned into missions so momentum survives the grind — a playable mission card and a tier ladder on a real backend. Born at Social Innovation Weekend, March 2025 — a 7-person team, one weekend, React + NestJS. It would need a partner to scale, and it says so. | LifeQuest turns the job-hunt grind into missions, on a real backend. It was born at Social Innovation Weekend in March 2025 with a 7-person team, in React and NestJS. Scaling it would need a partner. | EDIT |
| fig. 08 — the stair is the ledger, drawn in section: three steps with a body under them, two with nothing at all. | fig. 08 · three steps built, two held on purpose. | EDIT caption |
| solid where it was built · pencil where it was not | solid: built · pencil: not | EDIT fig. 08 SVG label, the tight edition's wording |
| Frederick P. Brooks Jr. · | Frederick P. Brooks Jr., 1975 | EDIT credit |
| ↳ no case file — a prototype has nothing to argue yet | ↳ no case file: a prototype has nothing to argue yet | EDIT dash out |

#### ¶09 Agentic AutoML: 373 → 228 words (-145)

**Cut** (−169):
- ~~lamplight. the machine works on; somebody stays to watch it.~~ · hourline (Option B)
- ~~“The Analytical Engine has no pretensions whatever to originate anything. It can do whatever we know how to order it to perform.”~~ · Lovelace epigraph
- ~~Ada Lovelace ·~~
- ~~Note G, Sketch of the Analytical Engine, Scientific Memoirs, 1843~~
- ~~seven phases mirror the ml lifecycle · a human gate at every step~~ · old prov (5 rows → 2): the commits row goes (FIGURES `AutoML · commit count` run → null)
- ~~44 agent tools~~
- ~~— preprocessing · features · training among them; 12 registered over mcp, the notebook hands: read_cell · write_cell · run_cell …~~
- ~~the llm’s python runs in a locked-down docker sandbox — non-root · read-only fs · capped cpu + memory · network-isolated by default~~
- ~~2,523 tests~~
- ~~green on ci — 1,445 backend · 985 frontend · 93 landing · 0 failures~~
- ~~langgraph + mcp · default model gpt-5.4 ·~~
- ~~2,186 commits~~
- ~~— the gitlab history, public on github since the 12 aug consolidation · 2-person team — my seat: backend~~
- ~~↳ the halted run lands in~~ · handoff lead-in
- ~~the run halts at the seventh gate — deploy never lights itself.~~

**Changed:**

| before | after | note |
|---|---|---|
| ¶ 09 · sixth station · the last — | ¶ 09 · project 6 of 6 · | EDIT kicker |
| It runs the whole lifecycle — and refuses to finish alone. | An AI agent can run a notebook from raw data to a trained model. Unchecked, it can go wrong quietly. | EDIT problem; drops the deploy-gate over-claim |
| The senior-design capstone: a LangGraph agent that works a notebook the way a person would — profiles the data, writes the cells, runs them — and waits at a human gate before every phase. | Two of us built it. A LangGraph agent profiles the data, writes and runs the notebook cells, and waits for a person’s approval before feature engineering and training. My seat was the backend, including the model scoring service. | EDIT 'every phase' over-claim fixed (claims-audit C-6) |
| no accuracy figure is quoted here because none is claimed — the work is the architecture and the gates, and the code is open to read. | no accuracy figure is quoted: no committed evaluation earns one. | EDIT scoping kept, shorter |
| seven phases · a human gate before each | seven phases · review gates | EDIT SVG label (the booms are owner question 4) |
| fig. 09 — the twelve tools drawn are mcpServer.ts’s, the mcp-registered subset of the platform’s 44, in source order; their firing schedule here is staged, not logged. | fig. 09 · the 12 mcp tools in source order, timing staged. the run halts before deploy. | EDIT caption |

**New:**
- A capstone platform where an AI agent trains models, with human sign-off · NEW h2 second line
- 2,523 automated tests, all passing: 1,445 backend · 985 frontend · 93 landing · EDIT prov row 1 + GLOSS
- 44 agent tools, 12 over mcp · the llm’s python runs in a locked-down docker sandbox · EDIT prov row 2 ('network-isolated by default' dropped, R21)

#### ¶10 how I work: 251 → 187 words (-64)

**Cut** (−44):
- ~~the last of the light, spent checking what the day actually held.~~ · hourline (Option B)
- ~~three real gates ·~~ · (the caption says it)
- ~~Cargo Cult Science~~ · credit detail
- ~~, Caltech commencement address, 1974~~
- ~~dispositions honest~~
- ~~the reviewer’s marks~~ · (the caption names the plate)
- ~~refused~~ · (gclose <b>) — second 'refused' run
- ~~a refused gate is the system working.~~ · from caption (moved above the table; see the add above)
- ~~a refused gate is the system working.~~

**Changed:**

| before | after | note |
|---|---|---|
| ¶ 10 · the review — | ¶ 10 · the review · | EDIT kicker |
| The run is nearly in. Before the gate, the discipline that drove it — each line ends at the ledger row that proves it. Every row is on file in one place: | Every record is in one place: | EDIT |
| 305 passed · 0 skipped — Applied’s validation ledger ⟶ | 3,747 passed · 0 skipped · 13 expected failures, Applied’s backend suite ⟶ | EDIT number to 0285675 |
| parallel dot kernel — 3.5× over -O3, Glyph’s committed benchmarks ⟶ | parallel dot kernel 3.5× over -O3, Glyph’s committed benchmark ⟶ | EDIT; check-bench-artifacts:514 |
| 71 passed · 0 skipped — Visual Assist’s validation ledger ⟶ | 71 passed · 0 skipped · Visual Assist, an iOS accessibility app ⟶ | EDIT + NEW noun |
| 19/20 cited-source sweep, self-reported — PolicyBot’s validation ledger ⟶ | 19/20 cited-source sweep, self-reported · PolicyBot, a policy assistant that cites its sources ⟶ | EDIT + NEW noun; QUALIFIED kept |
| Richard P. Feynman · | Richard P. Feynman, 1974 | EDIT credit |
| classifier gate — Applied | classifier gate · Applied | EDIT |
| cited-source sweep — PolicyBot | cited-source sweep · PolicyBot | EDIT |
| refused | declined | EDIT truthful word: 4 unsupported topics declined (policybot-validation-ledger.json) |
| benchmark suite — Glyph | benchmark suite · Glyph | EDIT |
| ✓ a human signed for it · — the gate stopped the run · below them the line runs on dashed and unsigned, to a person | a flat bar: the gate stopped the run · the line runs on dashed and unsigned, to a person | EDIT legend (bound phrases kept) |
| two of my own gates | two of my own checks | EDIT |
| to sign automatically. which is why the next stop on this line is a person. | stopped my own work. the next stop is a person. | EDIT |
| fig. 10 — three real gates set on the line, each stamped in the same hand as the thread; below the third the line runs on dashed, unsigned. | fig. 10 · three real gates and what each decided. | EDIT caption |

**New:**
- a refused gate is the system working. · EDIT moved above the table (TEXT_PLATES fig.10 claim stays inside the figure block)
- 1 wrong in 96, above the 0.95 floor · NEW disposition reason (passed)
- 4 answers it couldn’t cite · NEW disposition reason
- caught · NEW disposition word
- a variance claim nobody had measured · NEW disposition reason (the 001e9b4 BENCHMARKS.md correction)

#### ¶11 references: 246 → 148 words (-98)

**Cut** (−45):
- ~~past ten, and these are the only words on this page I did not write.~~ · hourline (Option B)
- ~~· managed the ITSM work at station 03, as miami’s director of BI~~ · .rel (the plate beside it says it)
- ~~· the teammate on stations 06 and 09~~ · .rel
- ~~written on linkedin ·~~ · (the prov line says both were written on linkedin)
- ~~in public~~
- ~~linkedin · 2026~~

**Changed:**

| before | after | note |
|---|---|---|
| ¶ 11 · the references — | ¶ 11 · the references · | EDIT kicker |
| The gates on the last station were mine, and a machine can only refuse itself. These are the humans who worked the line beside me. | My manager at Miami and my teammate on Glyph and the capstone. | EDIT |
| “From the start, he operated above intern level… He built data pipelines used to analyze Oracle Analytics Server usage, giving the team visibility into report adoption, demand patterns, and technical load. That work informed platform decisions and prioritization… He understood intent, not just requirements.” | “From the start, he operated above intern level… He built data pipelines used to analyze Oracle Analytics Server usage… He understood intent, not just requirements.” | EDIT a shorter verbatim excerpt; every ≥6-word fragment stays verbatim (check-figures QUOTED PEOPLE) |
| applied AI & data principal, cbts — managed the ITSM work at station 03 | his manager, station 03 | EDIT |
| b.s. computer science — the teammate on stations 06 and 09 | teammate, stations 06 and 09 | EDIT |
| · b.s. computer science, minor in mathematics · miami university, 2026 | · b.s. computer science, miami university, 2026 | EDIT |
| fig. 11 — each reference sits beside the station that person actually worked on. | fig. 11 · each reference sits beside the station that person worked on. | EDIT |

#### ¶12 gate: 223 → 137 words (-86)

**Cut** (−70):
- ~~01~~ · gate card rows (they repeated the manifest; #liveSample row stays, hidden until a sample)
- ~~02~~
- ~~03~~
- ~~04~~
- ~~05~~
- ~~06~~
- ~~applied~~
- ~~cadence~~
- ~~glyph~~
- ~~jetpack-compress~~
- ~~lifequest~~
- ~~agentic automl~~
- ~~rules macro-f1 0.9791 · 96-sample gate~~
- ~~1,186 passed · 0 skipped — 635 fe + 551 be~~
- ~~97.01% — 9,701/10,000 · macro-f1 0.9698~~
- ~~72 tests, 0 failures · jdk 25~~
- ~~prototype — held marks stayed held~~
- ~~7 phases, every one gated · code public~~
- ~~the marker you have been following stops here. nothing moves until you decide.~~ · the h2 and 'This one ends with yours.' say it

**Changed:**

| before | after | note |
|---|---|---|
| ¶ 12 · the approval gate — | ¶ 12 · the approval gate · | EDIT kicker; run-home.spec.ts:74 |
| run 042 — the manifest, complete. | run 042 · the manifest, complete. | EDIT |
| one day · twelve stops · six stations proof-cited · one signature missing | six projects, each with its proof · one signature missing | EDIT |
| 042 is the day’s serial, not a visit counter — the number holds; only the light moves. | 042 is the day’s serial, not a visit counter. | EDIT |
| scrolling could not press this button. | scrolling could not press this button · pressing it only turns the page to morning. | EDIT (decided) |
| 22:41 · the human gate — go / no-go | 22:41 · the human gate | EDIT dash out, shorter |
| deploy — yours; no scroll reaches it | deploy · yours | EDIT dash out, shorter |
| © 2026 ayush yadav — cincinnati, oh | © 2026 ayush yadav · cincinnati, oh | EDIT |
| set by hand — fraunces, newsreader & fragment mono · zero dependencies | set by hand · zero dependencies | EDIT the font list goes |