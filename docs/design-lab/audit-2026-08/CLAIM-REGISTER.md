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
- **Glyph's `apps/eval_model.cpp` has no `add_executable`** — the generator of
  the headline accuracy cannot be built through the project's own build system.
  An upstream one-line fix; the number itself is perfect.
- **LifeQuest's CI is vacuously green** — `vitest --passWithNoTests` with zero
  test files.
- **PolicyBot's corpus is not in the repo**, so the sweeps cannot be reproduced.
  The ledger stands as a dated record; reproduction does not.
- **Of eight upstream repos, only two have CI that asserts anything** — Applied's
  (two `--min-macro-f1 0.95` gates plus a guard that fails if the RLS suite
  reports a skip) and Cadence's. jetpack and PolicyBot have no `.github/` at all.

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
