# Claim register — the 2026-08-02 provenance audit

Supersedes `docs/design-lab/STATION-FACT-LEDGER.md` (2026-07-31) as the living
reconciliation. That file stays as history; it describes **eleven** stations,
and the run has had thirteen since `¶11` was inserted after it was written.

**The governing rule, the owner's:** *"The codebase is the truth. That is what
the work is."* So: **measure at HEAD, then pin the number to the commit it was
measured at.** A count and its commit are one fact and move together. Raw
measurements and commands are in `runs/RUN-LOG.md`.

---

## What was measured, and what it said

Every row was produced by running the project or reading its committed machine
output. Not one was settled by a README.

| claim | site said | measured | verdict |
|---|---|---|---|
| Applied · regex rules | 201 | 106 strong + 26 weak + 69 negative = **201** | ✓ exact |
| Applied · classifier gate | 0.9791 · 96 · 8 classes · 2 wrong | **0.9791 · 96 · 8 · 2**, gate PASS | ✓ exact |
| Applied · rules-vs-cascade | "the rules stage, not the cascade" | deterministic hybrid returns the **identical** numbers | ✓ proven by running it |
| Applied · CI floor | blocks below 0.95 | gate ran with `--min-macro-f1 0.95` | ✓ |
| Applied · backend suite | 271 passed · 10 skipped | **278 passed · 10 skipped** | **moved** |
| Cadence · suite | `/evidence` 1,145 · run 1,168 | **1,168 (635 fe + 533 be), 11 skipped** | **`/evidence` was stale; the run was right** |
| Glyph · MNIST | 97.01% · 9,701/10,000 · F1 0.9698 | **byte-identical regeneration** of the committed report | ✓ reproduces |
| Glyph · kernel | 3.5× | **3.520×** (committed 3.504×) | ✓ |
| Glyph · "simd alone 1.02×" | — | the `native` binary is **byte-identical to baseline** on arm64 | **mislabelled** |
| Glyph · instruction sets | case file said **four** | source guards exactly `__AVX512F__`, `__AVX2__`, `__ARM_NEON` | **three** |
| Glyph · wasm bytes | 45.9 KB + 310.6 KB | **46,960 B + 318,064 B** | ✓ exact |
| jetpack · suite | 72 tests, 0 failures, JDK 25 | **72 / 0 / 0 / 0 on JDK 25.0.3** | ✓ now a run, not a README |
| jetpack · benchmarks | 6.4× · 422 vs 66 · 2.8× · 4.26 GB/s | committed rigorous run, **exact**; re-run today gives 7.10× | ✓ **published figure is the conservative one** |
| VisualAssist · tests | 71 | **71** across 8 files | ✓ (the commit message's "68" is the stale document) |
| PolicyBot · sweeps | 19/20 · 17/25 · 4 declined | matches upstream `summary.md`; 17+4+4 = 25 | ✓ |
| AutoML · MCP tools | 12 | **exactly 12** `server.registerTool` calls, one server | ✓ |
| AutoML · suites | — (site claims none) | 1,412 backend + 985 frontend | new information |
| LifeQuest · React + NestJS | claimed | `@nestjs/{common,core,config,platform-fastify}` present | ✓ |

**Two numbers moved: Applied 271 → 278, and Cadence's `/evidence` row 1,145 →
1,168.** Both were the tree growing, not a retraction. Everything else that
could be run reproduced.

The Cadence figure was reached twice by different methods — a live run of both
vitest configs, and an independent static count of `it(`/`test(` call sites
calibrated to reproduce **1,145 exactly** at the old pin `69a59e7`. Two
instruments, one answer.

---

## The defects that were not numbers

Ranked by what a reader loses.

**1 · The corrections register recorded repairs that never shipped.** Two of
them. `projectCaseStudies.ts` told readers receipts 01–03 had been relabelled
`cadence` and that every Glyph label had been converted to `glyph` — and the
built pages rendered the retired names **18** and **3** times respectively. On a
site whose argument is that this register can be trusted, that outranks every
figure. Both are now true, and both carry a dated erratum saying they were not.

**2 · Five dead navigation anchors on nine indexable routes.** The header nav
and the 404's index pointed at `#who #path #automl #work #values`; the shipped
home page had **none** of them, and there is no hash shim, so every one landed
silently at the top of the document. Only `#gate` resolved. The run now carries
`who`, `path`, `work` and `automl` as real section ids, and `values` was
re-pointed at the run's existing `review`. Nothing caught this because a dead
anchor throws no error.

**3 · The colophon described a page that no longer exists.** *"two inks. one
line. seven chapters"* shipped in the root layout — `/evidence` and all seven
case files, eleven indexable pages — about a home page with thirteen stations.

**4 · "Four instruction sets" was the highest-reach wrong string on the site.**
It fed the meta description, `og:description`, `twitter:description`, two
JSON-LD nodes and the visible deck on the Glyph route.

**5 · Two architecture diagrams drew data paths that do not exist.**
- Applied's drew Postgres straight into Next.js. The web app never opens a
  database connection; every read goes through FastAPI holding the caller's
  JWT. A `FastAPI` node was missing entirely — and it is where the JWT is
  verified, so its absence understated the design, not just the diagram.
- Visual Assist's drew `LiDAR ⟶ Local Vision`. LiDAR feeds one mode; object
  detection is fed RGB frames by `CameraService`. A `Camera` node was added so
  the correction adds a fact rather than only removing one.
- Visual Assist's summary claimed voice **commands**. `VoiceCommandService.swift`
  is compiled into the target and has **zero consumers**.

---

## The finding the audit's own test run produced

Correcting the numbers turned the browser smoke red, which is what a suite is
for. Chasing it produced something bigger than the two fixtures that needed
updating:

```
build              next build && node scripts/run/build-home.mjs
browser-smoke      next build --webpack && playwright test tests/playwright/atlas.spec.ts …
```

**The browser gate runs bare `next build`.** `build-home.mjs` is what overwrites
`out/index.html` with the run, and the smoke script never calls it — so for the
whole of that suite, `/` is **StoryShell**, the page no visitor has seen since
the run shipped. 245 tests across five browsers, in CI, against a home page that
does not exist in production.

That is PR #42's premise, confirmed by a different mechanism than the one it
names: it is not only that the specs assert the old information architecture,
it is that the **build command in the npm script produces the old page**. Fixing
the specs without fixing the script would leave the gate green and blind.

It also explains a defect the audit had already found by hand: the five dead
anchors. `#values` exists on StoryShell and never existed on the run, so the
suite asserting `#values` is attached passes forever while the shipped page's
own navigation is broken. A gate pointed at the wrong artifact does not just
miss defects — it certifies them.

Two smaller things the same run exposed:

- `PROHIBITED_GENERATED_CONTENT` is checked with `.toContain()`, and it forbids
  the fabricated `"68 tests"`. Cadence's real measured **`1,168 tests`** contains
  that substring, so telling the truth failed the hallucination guard. Entries
  beginning with a digit are now matched with a `(?<![\d,])` boundary; phrases
  keep the plain test.
- `chapters.ts` cannot be renamed to match the run. `values ⟶ review` broke
  StoryShell's own `#values`, which that suite asserts. The 404 maps the one
  divergent name instead — the two home pages disagree on anchor vocabulary,
  not merely on content, and only one of them ships.

## The adversarial pass, and the defect it found in this audit

Phase 7 sent a fresh reviewer at the corrected site with no audit context and one
instruction: falsify the claims. It found one **P0, and it was mine.**

**Two pinned links 404'd.** Re-pinning Applied's 278 and Cadence's 1,168 to the
commits they were measured at put `0f2b63f` and `932625e` into the manifest —
and both are **unpushed local commits**. The numbers were right; the trees do not
exist publicly, so nobody could reproduce either. `git branch -r --contains`
returns empty for both.

It also falsified a blanket line in the manifest's own header: *"Every `source`
below was fetched at this sha and returned 200."*

**Fixed by re-measuring at the public head, not by re-pointing the link.** That
distinction is the whole rule — a number and its commit are one fact, so moving
the link without moving the measurement would have made it a guess.

- **Applied → `03fc5c4`.** `git diff origin/…..HEAD -- backend/` is **empty**, so
  the tree measured *is* the public tree. **278 stands.**
- **Cadence → `8eee84e`.** Here the tree genuinely differs, so the suite was
  re-run in a scratch worktree at the public head: **635 + 524 = 1,159**, 11
  skipped. The nine-test gap *is* `932625e` — the commit fixing nine endpoints
  that never authenticated. Those tests arrive the moment it is pushed.

So the site now says **1,159**, and it will say 1,168 again when that commit
lands. All **60** GitHub links in the built output resolve.

**The rule this exposed, now written down:** a count and its commit are one fact
— *and the commit has to be one a reader can open.* The second half was implied
and unstated, which is exactly how it got broken.

**New gate: `check-links.mjs`.** No offline check could have caught this —
`check-proof-manifest` already asserts the label and the link name the same
commit, and they did; both named a commit that was not there. Only a request
finds it. It runs over the built pages when they exist and falls back to the
data layer otherwise, matches `href` attributes only, and is negative-tested
against the real `932625e` 404.

That narrowness is deliberate and was itself a finding: the reviewer's first
sweep used a loose regex that swallowed adjacent link text and reported **42
dead links out of 103**, against a true **2 of 61** — a 21× overcount. The
instrument has to be narrower than the temptation.

### What the adversarial pass could not break

Recorded because it is the more useful half. Independently recomputed, by
execution or from the committed artifact: 278/10 · 1,159 · 72 tests on JDK
25.0.3 · 71 iOS test functions · 12 MCP tools · 201 rules (106+26+69, with
`ATS_DOMAINS` = 14 kept separate and not folded in) · 97.01% / 9,701 / 299 /
macro-F1 0.9698 with the confusion diagonal summing to 9,701 · every jetpack JMH
ratio including the disclosed 6.38–6.89× span · wasm 45.9 KB and weights
310.6 KB under the 1024 convention · the Cadence CI erratum, confirmed against
the actual GitHub job log · the 8th IDOR commit and its 32→36 handler count ·
AutoML's sandbox flags, all four wired · all 11 `/evidence`→receipt crosslinks
landing on the correctly-numbered row · and `src/run/index.html` being the
shipped body, differing from `out/index.html` only in `<title>` and injected SEO
head.

It also **disagreed with one of my framings**, correctly: I asked it to treat
hedged disclosures as suspicious. It found the hedges load-bearing rather than
evasive — each names a specific weakness and the condition that would lift it —
and recommended leaving them alone. It also filed one P0 against AutoML's phase
list, checked its own ground truth, found the README's seven `###` sections
matched exactly, and **withdrew the finding**.

## Still open — brought to the owner, not silently changed

- **`public/resume.pdf` quotes jetpack's *quick* benchmark** (6.5× · 455 vs 66 ·
  2.9× · 4.38 GB/s) while every other surface quotes the rigorous one, and it is
  internally inconsistent: **455 / 66 = 6.89**, not the 6.5 on the same line. It
  also states `2.9× scalar` — a string `scripts/run/build-home.mjs` **fails the
  build over** if it appears in the run, because it drops the caveat that the
  JDK intrinsic is faster. The résumé is sent to humans, so it is flagged rather
  than regenerated.
- **The résumé also says "4 instruction sets"** (now three everywhere else),
  **"Built … row-level security"** where the site says *staged off*, **Cadence
  2024–2026** against `filed: 2023-09`, and **"Intern"** where `experience.ts`
  says *Student Associate*.
- **VisualAssist's suite still cannot be executed here** and so has never been
  executed anywhere — its CI runs no tests, and this machine lacks the iOS
  runtime the project resolves to. The 71 is verified statically instead (see
  below); a real `xcodebuild test` step needs one local run by someone with the
  right SDK before it can be added honestly.
- **Nine upstream commits are unpushed.** Until they are, the fixes below are
  true only on this machine — and Cadence's suite count stays 1,159 rather than
  1,168, because the nine tests that make the difference live in one of them.

---

## The upstream fixes — where the audit stopped describing and started repairing

Every project's own documentation was audited against its code. **The same shape
appeared in all eight repos**: one number maintained by hand in four or five
places with no generator, corrected in one of them, left wrong in the rest.
Applied's cascade attribution had been fixed once by `0f2b63f` and was still
wrong in four more surfaces. jetpack's rigorous-vs-quick label was right in
`facts.ts:102` and wrong in four other places including its own README. That is
the finding underneath the findings, and it is why the widened `check-figures` is
the most durable thing this audit produced.

**Glyph** — the eval generator now has a build target (`fast_mnist_eval`), so the
97.01% can be regenerated by anyone rather than hand-compiled. Its README claimed
**four** instruction sets (three exist), **41 Catch2 tests** (34, and no HTTP API
tests), and a **live in-browser scalar-vs-SIMD benchmark that does not exist** —
`wasmClassifier.ts` returns `baseline_time_ms: 0` and says so in its own comment.
`BENCHMARKS.md` explained a delta by "runtime dispatch"; selection is `#if` at
compile time, and on arm64 the two binaries compared are byte-identical.

**jetpack** — first CI the repo has ever had, summing surefire into the exact
sentence the README quotes. Its benchmark caveat was **inverted**: the table is
the rigorous 3-fork run and the warning above it apologised for a quick run's
error bars, then advised re-running what had already been run.

**Applied** — a **red PR gate** fixed (`landing.spec.ts` asserted 182 against a
tile rendering 288), plus 182 in five more places and the cascade attribution in
four. The booklet's *honesty note* was the sharpest: it hedged that the README
"states 182" and the tree is "~186", citing `README.md:7`. The README states no
count, never said 182, and line 7 is the tagline — a disclaimer stale in every
clause, including the pointer meant to let a reader check it.

**AutoML** — the booklet listed **20 MCP tools and 17 were never registered**.
And the largest single overclaim in the audit: the video telemetry asserted **97%
coverage** with **no coverage artifact anywhere in the repo**. Measured for the
first time (`vitest run --coverage`, v8, backend): statements 66.5%, branches
53.25%, functions 65.57%, **lines 67.4%**. Also 1,550 tests → **2,397**, and 21
migrations → **24**. `LOC typed` and `packages` remain unverified and are now
flagged as such rather than blessed by proximity.

**PolicyBot** — three rows of the validation history disagreed with the
transcripts they describe. Re-derived with the repo's *own* classifier:
v3 9 → **12**, v4 5 → **11**, v5 11 → **19**. **The two figures this portfolio
cites — 19/20 and 17/25 — were already right**, which is what I checked first.
The `v2` row now reads `—`, because that run predates the `validation_failed`
field and no verdict is recoverable from it by any method. And the boundary
nobody had stated: `llm.py` returns `True` when it cannot locate a cited
document, and the corpus is deliberately uncommitted — so on a bare clone the
quote verifier **fails open** and passes everything.

**Cadence** — 89 test files → **92**, and the README now states the test count
it never carried.

**VisualAssist** — a check named *"Build & Test"* that ran no tests, and a
**hardcoded** shields.io badge rendering "Build Passing" unconditionally, wired
to the real workflow. The 71 was verified against XCTest's own collection rule:
8 XCTestCase subclasses, 71 collectible methods, and **zero** argument-taking,
private or static variants — the cases XCTest skips. Because every disqualifying
case is empty, the static and collected counts cannot differ. A whole-tree grep
returns 73 and is wrong by exactly two private helpers in the app target.

**LifeQuest** — `architecture.md` listed tRPC, Jest, Supertest, Pactum and React
Testing Library, none installed. It is titled *"Architecture Plan"*, so the fix
is a banner naming which rows are intent, not a rewrite — plus a note on the
`## Tests` section saying the command exits 0 over an empty suite.

---

## What now stops the drift

- `check-figures.mjs` widened from **7 bound figures to 18**, each naming the
  command or artifact it came from.
- `check-proof-manifest.mjs` gained a **label-vs-link commit check**. It was
  written against a real defect — `/evidence` rendered "README.md @ 2caacd0"
  over a link to `/blob/af2c4b1/` — and it was negative-tested: reintroducing
  the mismatch makes it fail with `sourceLabel says 2caacd0, source URL says
  af2c4b1`.
- The Cadence test count was **removed from `architecture.summary`**. A headline
  number inside a structural description is in the one place no gate looks and
  no reader re-checks; it is the reason that figure went stale for two days
  after the receipt beside it had been corrected.
