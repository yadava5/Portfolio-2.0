# Portfolio-2.0 migration — Phases 3–6, re-planned at the Phase 2 checkpoint

> Supersedes the Phase 3–6 sections of `docs/PORTFOLIO-MIGRATION-PLAN.md`, which
> were written before any of this had been executed and are wrong in nine places
> that change what gets built. Phases 0–2 of that plan shipped; this document is
> what replaces the rest of it. Where the two disagree, this one is measured.

---

## 0. Where this picks up

**The repo ships one portfolio at one URL: `src/run/index.html`.** A hand-authored
4,400-line HTML working paper — one workday as a railway run, 13
`<section data-beat>` stations, a canvas rail, cargo riding each corridor under a
waybill. `scripts/run/build-home.mjs` copies it over `out/index.html` after
`next build`. Everything else is an abandoned Next App Router app that this
migration retires.

Deployed at `https://yadava5.github.io/Portfolio-2.0/` (GitHub Pages, static
export). **Pages cannot redirect, so every URL is load-bearing.**

### Branch state — a stack, not siblings

```
refactor/stations-truth   ← HEAD, contains all of Phases 0–2
  234fd62  fix(baseline): the pinned commit named a tree that does not produce the pinned page
  db6b01c  refactor(stations): one file describes the shipped page, and a gate holds it to it   ← Phase 2
  0428850  feat(run): every corridor carries its own station's freight, and every stop has a name ← Phase 1
  23c5874  ci(portfolio): assemble the gates into one validator                                 ← Phase 0
main / origin/main        4ec9421 — four commits behind, nothing pushed
```

Work in progress that predates Phase 0 is preserved on `wip/cargo-manifest-snapshot`
(`cd2d079`); it fixed the React rail, which this migration deletes.

### What shipped in 0–2

- **`npm run verify:portfolio`** — 19 gates in one fixed order, first failure
  stops, nothing piped. Includes a golden hash of `out/index.html` pinned to the
  **deploy** configuration (`NODE_ENV=production
  NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0`), and `assertRunShipped`, which asserts
  the served file IS the run — 13 `data-beat`, 0 `data-chapter`, the four head
  elements, and eight runtime-fetched closure files at size floors.
- **The run's content pass** — cargo fixed at beats 2/6/8, five previously
  id-less stations named, the glyph contract (`↗` leaves the site, `⟶` goes
  deeper) implemented as a rule over all 10 same-origin links and guarded, and a
  fourth ¶10 receipt for `visual-assist`.
- **`src/lib/data/stations.ts`** — the run's single truth for all 13 stops, with
  `check-stations.mjs` asserting every string in it appears verbatim in
  `src/run/index.html`. `RUN_ANCHOR` is deleted; `check-anchors` went 6 → 11.

### Owner rulings — settled, do not re-litigate

| Ruling | |
|---|---|
| The 13-station run **is** the whole portfolio | The archive is rebuilt in its language; the Next app retires entirely |
| Git | Branch per phase, commit locally when green. **No push, no PR** without being asked |
| `visual-assist` | Built and linked from the run. **No 14th station** |
| HELD apparatus | Retire the probe, keep the render |
| URLs | `/projects/<id>/` and `/evidence/` are preserved. They are the world's inbound coupling |
| Owner's own summary | *"the 13 station portfolio, no old files that are not linked to that, and we can build the case files and benchmark again, as we already have the data"* |

### Standing constraints (from `~/CLAUDE.md`)

- Shell aliases shadow POSIX tools (`diff`→difftastic, `ls`→eza, `cat`→bat,
  `du`→dust). **Use absolute paths in every verification command**, and note that
  on macOS `ls`/`cat`/`rm`/`cp`/`date`/`mkdir` live in `/bin`, not `/usr/bin`.
- `rm -rf` is blocked by a deny list and by `~/.claude/hooks/block-destructive.sh`.
  Use `/bin/rm -r`. That hook **substring-matches raw command text**, so put
  dangerous-looking literals in a file and have git read them (`git commit -F`).
- **Never pipe a gate into `tail`** — the pipe eats the exit code. This hid a red
  Prettier gate here for twelve CI runs.
- Never add a `Co-Authored-By: Claude` trailer. Never `--no-verify`.
- Verify redundancy against **every** live location before deleting.

### Execution protocol

- One branch per phase, off the previous phase's branch (they stack).
- `npm run verify:portfolio` after every phase. **Do not patch forward past a red
  validator.** If the fix is not obvious in one attempt, abandon the branch.
- Re-baseline the golden hash **only** after reading the `out/index.html` diff by
  hand, and never to make a red check green. After committing, correct the
  baseline's `commit` field to the new sha — `--rebaseline` writes pre-commit
  `HEAD`, which is the parent, and `verify:portfolio` now asserts that pairing.
- **Prove every new gate fires**, in a temp copy of the tree, never in the `out/`
  being served. A gate that has never failed is a hypothesis.
- **Scan every authored file for control bytes before staging.** This has now
  happened twice — a NUL and a 0x1F, both in comparison keys, both of which
  worked and passed every test. Only `git add` notices, by calling an `.mjs` file
  binary. Use `JSON.stringify([a, b])` for composite keys.

---

## 1. Corrections to the original plan, measured

The first eight were found before Phase 0 and are recorded in
`docs/PORTFOLIO-MIGRATION-PLAN.md`'s header. These are the ones that change
Phases 3–6.

**C9 — station ids are not the archive's project ids.** The plan says to name the
run's fragments after the case files so the run→archive map costs nothing.
Measured, it saves nothing: the archive is keyed `jobtracker` /
`taskflow-calendar` / `fast-mnist-nn` for stations headed "Applied", "Cadence",
"Glyph", and beat 03 has shipped `#work` for `jobtracker` since round 1. The map
survives at one entry either way. Phase 1 used the run's own names; `stations.ts`
carries `dossier` as a field. **The crosswalk is data, not a rename table.**

**C10 — the archive builds 7 case files, and only 5 stations file one.**

| Case file | Reached from |
|---|---|
| `master-inventory` | ¶03 the yard |
| `jobtracker` | ¶04 Applied |
| `taskflow-calendar` | ¶05 Cadence |
| `fast-mnist-nn` | ¶06 Glyph |
| `automl` | ¶09 Agentic AutoML |
| `policybot` | **¶10's receipts only — no station** |
| `visual-assist` | **¶10's receipts only — no station** (added in Phase 1) |

And two stations file nothing, for different reasons: `jetpack-compress` has no
dossier in the archive at all (it hands its member to the committed benchmark
ledger), and LifeQuest's absence is the argument — *"no case file — a prototype
has nothing to argue yet."*

This breaks the plan's arrival-slip design, which assumed every case file is
reached from a station's waybill. **Two of seven are not.** See §2.2.

**C11 — the run links 10 internal URLs, not 8**, and between them they reach
**all 7** case files plus the site root. Four carry a `#v-<id>-<n>` fragment. So
the crosswalk gate has complete coverage available to it.

**C12 — `check-stations.mjs` already implements half of Phase 3's crosswalk
gate.** It asserts station → dossier: the dossier is a case file the archive
builds, and the station actually links it. The missing half is dossier → station,
which is what `⟵ rejoin the line at ¶ NN` needs, plus the artifact-level half
(the target file and fragment exist in `out/`).

**C13 — pruning the toolchain breaks the shipped run. Proven by execution.**
`tsconfig.run.json` compiles `nameplateMachines.ts` → `personal.ts` →
`utils.ts`, and `utils.ts` imports `clsx` and `tailwind-merge` at module level.
Running that project with those two packages removed:

```
src/lib/utils.ts(8,39): error TS2307: Cannot find module 'clsx' …
src/lib/utils.ts(9,25): error TS2307: Cannot find module 'tailwind-merge' …
tsc exit=2
```

`build-nameplate.mjs` runs that project to build a piece of the **home page**. So
Phase 4's "prune `next`, `react`, tailwind" instruction, executed literally,
breaks the shipped artifact. The root cause is one exported constant: the
surviving data layer reaches Tailwind packages through `basePath`.

**Fix, and it belongs in Phase 3 before anything is pruned:** extract `basePath`
and `withBasePath` into `src/lib/basePath.ts` with **zero imports**; have
`utils.ts` re-export them for the React tree's remaining life. This also removes
the plan's separate worry that compiling `seo.ts` for the head emitter drags
`clsx` into its graph — same root cause, one fix.

**C14 — the run already ships two dead JavaScript files.** `build-nameplate.mjs`
emits five files into `out/run/`, but the run's only dynamic import is
`./run/components/story/nameplateMachines.js`, whose graph is `geometry.js` →
`constants.js`. `out/run/lib/utils.js` and `out/run/lib/data/personal.js` are
never loaded — and `utils.js` ships containing `import { clsx } from "clsx"`, a
bare specifier no browser can resolve. Harmless only because nothing executes it.
The C13 extraction shrinks this; Phase 4 should delete what remains.

**C15 — a missing 404 still passes the SEO gate.**
`check-static-export-seo.mjs:151` does `if (!fs.existsSync(notFoundPath)) continue;`
for all three 404 outputs. Phase 3 rebuilds `404.html` outside Next, so this is
the phase where that `continue` becomes mandatory — otherwise the rebuild can
silently ship no 404 at all.

**C16 — `public/proof/` exists with two ledgers** (`master-inventory-ledger.json`,
`policybot-validation-ledger.json`, ~1 KB each). The vendoring precedent Phase 5
relies on is real, but **no benchmark JSON is committed yet** — Phase 5 adds
them. `public/` holds 37 files in total (`resume.pdf`, `og/`, `images/`,
`proof/`, both favicons), and **Next is what copies all of them into `out/`.**

**C17 — a production deploy is gated on three checks, and `verify:portfolio` is
not one of them.** `deploy.yml` runs on push to `main`, builds, then runs
`test:seo` and `test:proof`, and uploads. It does **not** `needs: ci-success`,
so **a red CI does not block a deploy**. The only gate that asserts
`out/index.html` IS the run never runs before shipping. That is the migration's
first invariant, unprotected at the one moment it matters. Fixing this is cheap
and belongs in Phase 3, before the archive rebuild starts changing what ships.

**C18 — the "e2e tests the other home page" claim is stale, and two comments
still assert it.** All eleven `test:e2e:*` scripts now run
`… next build --webpack && node scripts/run/build-home.mjs && playwright test …`
— they *do* exercise the run. What differs is the configuration: they build with
`NEXT_PUBLIC_BASE_PATH=` (empty), so `out/index.html` afterwards is not the
deploy artifact. `verify-portfolio.mjs`'s header states this correctly; these two
do not, and both should be corrected rather than left to mislead a triage:

- `.github/workflows/ci.yml:354-356` — "the browser suite builds the OTHER home
  page (bare `next build`, no build-home.mjs)". False.
- `scripts/qa/check-anchors.mjs:18-23` — "`test:e2e:browser-smoke` runs bare
  `next build` … so it tests StoryShell". False.

**C19 — `check-probe-routes.mjs` crashes the moment `src/app/` is deleted.** It
guards `outDir` with `existsSync` but not `appDir`, so `readdirSync(appDir)`
throws ENOENT uncaught → non-zero exit → `browser-quality` red → `ci-success`
red. It also passes *vacuously* (exit 0) when `src/app` exists with no probe
routes. Both failure modes are live; Phase 4 deletes the file with the apparatus.

**C20 — 24 of 30 Playwright specs run in no workflow at all.** CI executes six:
`atlas`, `run-home` (via `browser-smoke`, five browser projects), `reduced-motion`,
`performance-budget`, `held-apparatus`, `static-seo`. `deep-qa.spec.ts` (787
lines, 33 tests) and `run-chrome.spec.ts` are referenced by *nothing* — no npm
script, no workflow. There are also **eight root-level `tests/*.mjs`** (1,118
lines) that loop over the retired multi-theme list and are equally unreferenced.
The plan's Phase 4 triage list is therefore both incomplete and misleading about
cost: most of these are not "going red at cutover", they are already inert.

**C21 — the head emitter is not a Phase 3 item, it is the FIRST item, because
today `npm run build` cannot survive without Next.** `build-home.mjs:167-233`
reads **Next's rendered `out/index.html`** and lifts `<title>`, description,
canonical, every `og:*`, every `twitter:*` and the JSON-LD block out of it, then
**hard-fails** if any are missing. Delete `src/app/` and the build dies before
writing a byte.

Worse, the file's own header comment says:

> *"The head is rewritten from `src/lib/seo.ts` so the run keeps the title,
> description, canonical, JSON-LD and OG card the rest of the site already
> earns"*

**That is false.** The code never opens `seo.ts`. It scrapes Next's HTML. A
reader planning this migration from the comment would conclude the head was
already independent of Next; it is the single thing most tightly coupled to it.
Correct the comment in the same change that makes it true.

**C22 — the abandoned React home page already ships to production, and so does a
build cache.** `build-home.mjs` overwrites `out/index.html` but touches nothing
else Next emitted:

| Shipped file | Bytes | What it is |
|---|---|---|
| `out/index.txt` | 75,906 | the React home's RSC payload |
| `out/__next._full.txt` | 75,906 | same, again |
| `out/__next.__PAGE__.txt` | 60,355 | RSC |
| `out/__next._index.txt` | 11,413 | RSC |
| `out/__next._head.txt` | 3,062 | RSC |
| `out/__next._tree.txt` | 698 | RSC |
| `out/tsconfig.run.tsbuildinfo` | 36,384 | tsc incremental cache, from `tsconfig.run.json`'s `outDir` |

≈263 KB of files no reader can reach, beside a 257 KB page — **the owner's stated
concern, already true today**: *"no old files that are not linked to that."*
Deleting Next removes the first six for free; the `.tsbuildinfo` needs
`tsconfig.run.json` to stop writing its cache into the shipped directory, and
`out/run/lib/{utils,data/personal}.js` (C14) are two more.

**C23 — `out/favicon.ico` comes from `src/app/favicon.ico` (25,931 B), not from
`public/favicon.ico` (569 B).** Next's metadata-file convention wins. Deleting
`src/app/` silently swaps the shipped favicon for a different, much smaller file.
Decide which one is correct and move it deliberately — this is exactly the class
of silent loss the phase's salvage step exists to catch.

**C24 — three more things break on deletion that the plan does not name.**
`eslint.config.mjs` is built entirely from `eslint-config-next`, so `npm run lint`
— a `verify:portfolio` step and a CI job — dies unless the config is rewritten.
`check-contrast.mjs` (589 lines) hand-mirrors the palette from
`src/app/globals.css` and scans `src/**/*.{ts,tsx}`. And
`scripts/design/waypoints-oklch.mjs` *reads* `globals.css` to generate
`components/world/waypoints.generated.ts` — a generator writing into a directory
being deleted.

**C25 — dead weight worth removing while the tree is open.** `lighthouse`
(devDependency) has zero references anywhere outside `package.json`.
`src/lib/data/skills.ts` (260 lines) and `src/lib/data/index.ts` (the barrel)
have zero importers. Eight root-level `tests/*.mjs` (1,118 lines) are referenced
by nothing. And `scripts/qa/check-nameplate.mjs` and
`scripts/resume/render-resume.mjs` import the bare `playwright` package, which is
**not declared in `package.json`** — it resolves only as a transitive of
`@playwright/test`. Declare it or switch both to `@playwright/test`.

**C26 — the run links `/evidence/` zero times.** Measured: the string does not
appear in `src/run/index.html` outside one code comment. Today `/evidence/` is
reachable from the Next header (`/#work`, `/#path`, `/#gate` — actually not even
there) and from the seven case-file footers. **Delete the Next chrome and the
evidence index is reachable only from a case file** — a page the run reaches, so
it is not orphaned, but it is two clicks deep from a portfolio whose entire
thesis is that every claim carries a receipt. Rule on it in Phase 3, not by
accident in Phase 4.

**C27 — exactly one receipt anchor is linked only from the page being deleted.**
Computed as a set difference rather than counted by eye, because the first count
of this was wrong:

| Source | Distinct `#v-` targets |
|---|---|
| `src/run/index.html` (ships) | 4 — `#v-fast-mnist-nn-2`, `#v-jobtracker-4`, `#v-policybot-1`, `#v-visual-assist-1` |
| `proofManifest.ts` → `/evidence/` (ships) | 10 |
| `StoryShell.tsx` (deleted) | 6 |

Union of the two surviving sources covers five of StoryShell's six. **Only
`#v-master-inventory-5` loses its only path.** The anchor itself survives on the
case file; what dies is the way in. One link to restore, not three.

Note what this table also shows: `/evidence/` is the real crosswalk into the
receipts — ten targets against the run's four — which makes C26 sharper, not
softer.

**C28 — the bar ratios in fig. 06 and fig. 07 are unguarded, and I proved it.**
The four bench bars are sized by hard-coded literals inside the module script:

```js
$("bScalar").style.transform = `scaleX(${(t * (1 / 3.5)).toFixed(3)})`;   // :3307
$("jScalar").style.transform = `scaleX(${(t * (66 / 422)).toFixed(3)})`;  // :3319
```

`check-figures.mjs:28` strips `<script>…</script>` before matching, so these are
invisible to it. Injected `1 / 3.5 → 1 / 1.8` and `66 / 422 → 66 / 900` in a temp
copy — a claim inflated by ~1.9× and ~2.1×:

```
control exit=0
injected: Glyph bars 3.5x -> 1.8x, jetpack bars 422 -> 900 mb/s
check-figures exit=0
check-beat-tables exit=0
```

**Both gates stayed green.** The bars are the most persuasive object on two
stations and nothing checks them. This has already happened once in production —
the bars read the quick 1-fork 455 while the prose read the rigorous 422.

**C29 — the benchmark artifacts Phase 5 plans to draw from are not in this
repository.** `benchmarks/jmh-results-rigorous.json`, the `.xcresult`, the
surefire XML, `mnist_eval.json` and the dot-kernel runs exist only as
**provenance strings** in `check-figures.mjs`. They live in the project repos
(`yadava5/jetpack-compress`, `yadava5/glyph`). `public/proof/` holds two
**hand-authored sanitized ledgers**, neither covering a station with bench bars.
So Phase 5's "vendor the artifact" is a real fetch-and-commit step across repos,
not a copy. The nearest local record is a prose transcription in
`docs/design-lab/STATION-FACT-LEDGER.md:184-201`, which is marked SUPERSEDED and
whose own header warns two of its numbers are stale.

**C30 — there is no `fig. 01`.** The run carries ten numbered figures, `fig. 02`
… `fig. 11`, and the rule is `fig. NN = data-beat + 1`. Beat 0 (`#start`) holds
the nameplate and the Machado epigraph, neither a `<figure>`. The slot is
structurally empty, not lost.

---

## 2. Phase 3 — Build the new archive. Delete nothing.

Branch `feat/archive-rebuild`. **Fable designs the pages; the main thread
verifies.** Fable must not run CI, Playwright, or any browser suite.

### 3.0 — Close the deploy hole. First, because it is cheap and everything after it ships.

C17: `deploy.yml` gates production on `build`, `test:seo`, `test:proof`, does not
`needs: ci-success`, and triggers independently on push to `main`. Add
`verify:portfolio` to the deploy path or make `deploy` depend on CI.

**This runs before anything else in the phase** — 3.3 moves the golden hash and
3.6 edits run content, and both of those ship. Closing the hole afterwards
protects nothing that happened in between. It is a workflow edit with no
dependency on any other step here; it could equally be a small commit on the
current branch.

Also make `check-static-export-seo.mjs:151` mandatory: a missing 404 currently
`continue`s silently (C15), and this phase rebuilds `404.html` outside Next.

### 3.1 — Extract `basePath`

Create `src/lib/basePath.ts` holding `basePath` and `withBasePath` with **zero
imports**. Re-export both from `utils.ts` so the React tree keeps working
unchanged for its remaining life. Verify by running `tsc -p tsconfig.run.json`
with `clsx` and `tailwind-merge` removed from resolution — it currently exits 2
(C13) and must exit 0 afterwards.

The hard dependency is **4.3 → 3.1**, not 3.3 → 3.1: `clsx` stays installed until
the prune, so the head emitter would compile today either way. It is done here
because it is cheap, zero-risk, and the thing that makes the prune possible at
all without breaking the shipped nameplate.

### 3.2 — Decide what `npm run build` becomes. The plan is not executable without this.

`npm run build` is `next build && node scripts/run/build-home.mjs`. **`next build`
is what creates `out/` and what copies all 37 files under `public/`** —
`resume.pdf`, `og/`, `proof/`, `images/`, both favicons — and
`build-home.mjs:93` fails outright with *"no out/ — run the Next build first"*.
Retire Next without replacing this and nothing creates the output directory and
not one public asset ships.

The original plan named this as machinery item 1 and said *"decide what `npm run
build` becomes."* It was recorded as a fact in C16 and then never assigned. It is
assigned here:

**The Phase 3.4 staging generator is the orchestrator's final form.** Build it so
that its steps are, in order: create the output directory · copy `public/` ·
emit the case files, `/evidence/`, `404.html`, `sitemap.xml`, `robots.txt` ·
then call `build-home.mjs`. In Phase 3 it writes to staging and `next build`
still runs. At **4.1** the same script becomes `npm run build` with the `next
build` prefix removed, and `build-home.mjs`'s `out/` precondition is satisfied by
the generator rather than by Next.

Two consequences to carry: `build-home.mjs:93`'s error message stops being true
and must be rewritten with it, and every `test:e2e:*` npm script begins with
`next build --webpack` (C18) — **all eleven prefixes are rewritten at 4.1**, or
the three specs Phase 4 keeps go red for a reason unrelated to the specs.

### 3.3 — The head emitter. This is the load-bearing item.

`build-home.mjs` currently scrapes the head out of **Next's rendered
`out/index.html`** and hard-fails without it (C21). Until that is replaced,
`src/app/` cannot be deleted at all.

- Compile `src/lib/seo.ts` through the `tsconfig.run.json` route and **import**
  it. Precedent: `build-nameplate.mjs` already compiles that way and rewrites
  emitted `@/` specifiers to relative paths. Follow it exactly.
- Replace `build-home.mjs`'s scrape block with a call into `siteGraph()` and the
  `siteMetadata` fields.
- **Byte-diff the emitted head against Next's rendered head while Next still
  exists as the reference.** This is the only phase in which that comparison is
  possible, and it is the whole reason the head emitter flips into `out/` now
  rather than at cutover.
- Fields the diff must account for, because a route-file-only reading misses
  them: `author`, `keywords`, `robots`, and both `icon` links come from the root
  layout, not the page. `og:locale` is set in `layout.tsx` but **not emitted** —
  decide whether the replacement emits it or preserves the omission.
- **Correct `build-home.mjs`'s header comment in the same change.** It currently
  claims the head is rewritten from `seo.ts`, which is false today and is how a
  reader would mis-plan this entire migration.

**The emitter must honour both configurations.** The e2e scripts build with an
empty `NEXT_PUBLIC_BASE_PATH` (C18) while the deploy sets `/Portfolio-2.0`.
Canonical and OG URLs must derive from the environment exactly as Next's did, or
the e2e artifact silently diverges from the deploy artifact — the same class of
defect the golden hash was pinned to the deploy env to prevent.

The golden hash **will** move here. Read the `out/index.html` diff by hand, then
`--rebaseline`, then correct the baseline's `commit` field after committing.

### 3.4 — The archive generator, to staging

A static generator producing `/projects/<id>/` × 7 and `/evidence/` into a
**staging directory**, not `out/`. Nothing flips until Phase 4.

**Contract it must reproduce.** The current renderer is 850 lines of
`CaseStudyPage.tsx` plus twelve components. The structural inventory, in DOM
order, is: dossier thread + citation ink overlays · kicker row
(`¶ case file N of 7 · title — filed YYYY-MM · last verified YYYY-MM`, **unpadded
digits and the word `of`**, deliberately) · status line · file-memory margin note
· `h1` + summary · meta ledger `dl` (role · with · timeframe · stack · repo pin ·
live demo · system card) · private stamp / evidence disclosure · `#problem` ·
`#project-visual` (fig. 1) · `#architecture` (fig. 2) · optional registry fig. 3
(automl only) · `#decisions` · `#validation` (glance strip → method slip →
receipts table → outcomes table → provenance → "what i'm NOT claiming") ·
optional `#ledger` (master-inventory, policybot) · `#corrections` · `#artifacts`
· footer (folio rule, `back to the work ⟵`, `the evidence index ⟶`, next-file
teaser).

`/evidence/` is 14 entries, each with visibility glyph, label, claim, and a `dl`
of `status / source / date / verification / argued in / boundary`.

**Preserve exactly:**
- **`#v-<id>-<n>` anchors — 53 of them.** Format `v-<projectId>-<n>`, `n`
  **1-based and continuous across `receipts` then `outcomes`**, id unpadded while
  the visible text is zero-padded. Per file: jobtracker 11, taskflow-calendar 12,
  automl 8, master-inventory 6, policybot 6, visual-assist 5, fast-mnist-nn 5.
- **`paperMemory` localStorage keys**, unrenamed: `paper-memory:v1:approved`,
  `paper-memory:v1:visited`, `paper-memory:v1:audits`, plus the same-document
  `paper-memory:change` event that every reader depends on for live updates.
  Also `localStorage["motion-off"]` and the `sessionStorage["study-tier-cap"]`
  pair read by the first-paint script.
- The sitemap's 9 URLs and `robots.txt`'s `Disallow: /world-preview/` — **or**
  delete the disallow in the same change that deletes the route, never later.
- **The skip link.** The root layout's `#main-content` skip link is every archive
  page's keyboard entry. The run famously has none; the rebuilt pages must not
  inherit that absence by omission.
- **`paperMemory`'s reader, not just its keys.** 3.4 preserves the three
  localStorage keys and the change event; 4.2 deletes `src/lib/paperMemory.ts`,
  which is the only thing that reads them. **Someone has to write the vanilla
  replacement** — visited marks, the audit walk, the approval date — or
  preserving the keys preserves nothing. Assign it here.
- **The OG rasters.** `assets:check-og` runs in CI and has a sha drift gate; it
  goes red the moment a summary, title or `fileNo` moves. Re-render in this
  phase, or record why the cards are unaffected.

**Fonts:** the four faces currently ship **twice** — hashed under
`_next/static/media/` for the archive, and plainly named under `/fonts/` for the
run. Collapse to `src/run/fonts/`, which is already the relative-path copy the
run `@font-face`s.

**Fix the OG cards' retired kicker while you are here.**
`render-og-cards.mjs:281` emits `¶ case file 05 / 07` — padded digits with a
slash. `CaseStudyPage.tsx:57-74` records that this exact form was *removed* from
the page because it was indistinguishable from the home story's chapter counter,
and the page now prints `case file 5 of 7`. The social card still ships the
abandoned form, so the first thing a reader sees on a shared link contradicts the
page it opens. `assets:check-og` has a sha drift gate, so changing the string
requires a re-render — that is the gate working, not an obstacle.

### 3.5 — The crosswalk gate. It does not exist; build it here.

Measured: `grep -rl '#v-' scripts/qa/` returns **nothing**. No gate asserts a
single receipt anchor. `check-links.mjs` matches only
`github.com/*/*/(tree|blob|commit)/*` and skips every same-origin link.

Build `scripts/qa/check-crosswalk.mjs` asserting:

1. Every internal `href` in `src/run/index.html` resolves to a file in the
   archive root — 10 links today, reaching all 7 case files and the site root.
2. Every `#fragment` on those links exists as an `id` in the target HTML — 4
   today, including `#v-visual-assist-1`.
3. Every `receipt.href` in `proofManifest.ts` resolves the same way — 11 links.
4. **The reverse direction**, which `check-stations.mjs` does not cover: every
   case file's "rejoin the line" link resolves to a station id in the run, and
   its arrival slip quotes the station's string verbatim.
5. A floor on the counts, so a broken parse fails loudly rather than passing on
   an empty set — the lesson from `check-links`'s glyph floor.

**It takes the archive root as an argument, and this is not optional.**
Assertions 4 and 5 are red until the 4.1 flip, because `out/` still holds the
Next-rendered case files, whose footer is `back to the work ⟵` → `/#work` with
zero rejoin links. Wire the gate against **staging** in Phase 3 and repoint it at
`out/` in 4.1. Wiring it at `out/` now would put `verify:portfolio` in a state
that cannot go green until a later phase — which is the one thing the execution
protocol forbids.

### 3.6 — Three design decisions the sketch did not know it had

**The arrival slip: pick one string and guard it.** The spec *"string-identical
to the waybill that sent the reader, sourced from `stations.ts`"* names two
different strings and matches neither. Measured, ¶04 has three candidates:

| Where | String |
|---|---|
| the run's handoff (`:1541`) | `↳ the sorted mail lands in` |
| `stations.ts` `consignment` | `sorted mail → manifest` |
| the plan's own sample slip | `consignment: the sorted mail` |

The `consignment` field is the right source — it is already in data and already
guarded verbatim by `check-stations.mjs`. Say so explicitly, and have crosswalk
assertion 4 assert it on the case-file side too. Otherwise the slip becomes the
one seam string with no drift guard, which is the risk the whole `stations.ts`
exercise was built to remove.

**`policybot` and `visual-assist` get a slip, with a different verb.** They have
no station, so nothing consigns them — but ¶10's receipts *are* waybills (cargo
plus destination), and the review is a real stop with a kicker and a clock.
Omitting the slip on 2 of 7 files reads as a template bug rather than an
argument; LifeQuest's absence works only because the run says it out loud, and a
silent gap has no prose to carry it. So:

> `↳ filed at the review — ¶ 10 · 22:23 · receipt: 19/20 cited-source sweep,
> self-reported`

with the return `⟵ rejoin the line at ¶ 10 · the review — 22:23` → `/#review`,
which crosswalk assertion 4 then covers for free.

**Write down the rule that makes the slip honest.** It cannot know how *this*
reader arrived — fragments are not sent in referrers, and `jobtracker` and
`fast-mnist-nn` are reachable from both their station and ¶10. The slip records
the **standing route**, not the click. State it, so nobody later "fixes" it with
referrer JavaScript. And it must not contain a run number: the record room quotes
the route, not one day's serial.

**The evidence index's way in belongs in ¶10's intro line, not the litany
(C26).** The litany's fourth line is followed by an authored comment
(`:1760-1767`) stating that *"honest"* is the paragraph's close and **nothing
goes after it** — a settled decision from Phase 1, not an accident. But the
intro at `:1750` already says *"each line ends at the ledger row that proves
it"*; linking **ledger** there to `/evidence/` is the seam the sentence already
describes. The ¶12 gate manifest is a viable second home. A fifth litany line is
not. This is a run content change and moves the hash — do it here.

### 3.7 — The palette, settled by measurement

The original plan said *"one clay — run `#a03f20` vs dossier `#b04a28`. Pick one
and re-measure WCAG **and** APCA on every surface it touches."* Measured
(WCAG 2.x and APCA-W3 0.1.9):

| Pair | WCAG | APCA Lc |
|---|---|---|
| run `#a03f20` on run paper `#fbf3e7` | 5.91:1 | 74.9 |
| run `#a03f20` on archive canvas `#faf6ef` | 6.04:1 | 76.4 |
| archive `#b04a28` on run paper | 4.95:1 | 69.9 |
| archive `#b04a28` on archive canvas | 5.06:1 | 71.3 |

Both pass everywhere, but the run's clay wins by ~1:1 WCAG and ~5 Lc on every
surface, it is the shipped product's colour, and its night companion `#f4b090` is
already measured in the run's own tokens.

**Ruling, sharpened: the archive adopts the run's palette wholesale — not just
the clay.** The papers differ too (`#fbf3e7` vs `#faf6ef`), and a two-cream
mismatch whispers "different site" at every seam crossing. One paper, one clay,
one ink set. The re-measure obligation then applies to the archive's **own**
surfaces — table rows, the meta-ledger `dl`, stamp fills — which is where it
belongs. The `#b04a28`-derived family (`clay-night`, `ember`, `invite`) dies with
the React tree; if the rebuilt pages keep the APPROVED stamp, re-measure its
ember on the run's paper before shipping.

### 3.8 — The dark seam

The run is dark at ¶08–09; the archive is flat cream. **The archive stays lit** —
the record room is lit, and the original plan's reasoning against a day arc on
the archive stands (readers arrive at arbitrary `#v-` depths, so a scroll-keyed
arc would assign a time of day to a jump target). Three-part handling:

1. **Say it in the conceit.** "Pulling a file turns on the archive lamp" should
   become visible prose or chrome on files reached from night stations — whose
   slips already carry night clocks (¶ 09 · 22:05, ¶ 10 · 22:23). The lamp is
   *why* the paper is bright at ten at night.
2. **Soften the cut** with MPA View Transitions
   (`@view-transition { navigation: auto }`) — zero-JS, progressive,
   `prefers-reduced-motion`-gated, never load-bearing. ~200ms is enough to stop
   the flashbang from `#2c2622` to cream.
3. **The return direction is the sharper risk, and it is new.** Rejoin links now
   target `/#automl` and `/#review` directly, so hash arrivals into dark stations
   go from zero to routine. If the run's ink field computes from scroll events
   rather than from position-at-load, a night station flashes dawn on arrival.
   Phase 6 checks this explicitly.

---

## 3. Phase 4 — Cut over, then retire the Next app

Branch `refactor/retire-next`. **Only now does anything get deleted.**

### 4.1 — Flip, in one PR

**Name `npm run build`'s new value here.** The 3.2 generator loses its `next
build` prefix and becomes the orchestrator: it creates `out/`, copies `public/`,
emits the archive, then calls `build-home.mjs`. Rewrite `build-home.mjs:93`'s
precondition message in the same change — *"run the Next build first"* stops
being true.

**Rewrite all eleven `test:e2e:*` script prefixes** from `next build --webpack &&
node scripts/run/build-home.mjs` to the new orchestrator. The three specs Phase 4
keeps (`run-home`, `reduced-motion`, `performance-budget`) go red otherwise, for
a reason that has nothing to do with the specs.

**Repoint the crosswalk gate from staging to `out/`** — assertions 4 and 5 become
satisfiable at exactly this moment (see 3.5).

**There is no link repointing** — the URLs are preserved by design. The gate that
must be green is the new crosswalk gate, not `test:links`/`test:anchors`:
measured, neither inspects a single run→dossier link.

### 4.2 — Delete, in dependency order

**Must survive** (~2,600 lines): `src/run/**`; `nameplateMachines.ts`;
`thread/geometry.ts` + `constants.ts`; `lib/data/{personal,stations,projects,
projectCaseStudies,proofManifest,testimonials}.ts`; the new `lib/basePath.ts`;
`lib/seo.ts`.

**Delete:** `src/app/*` (13 files, 1,521 TSX + 3,647 CSS); `src/components/`
`story` minus `nameplateMachines.ts` (13 files, 5,502 lines), `scenes` (9,
3,500), `paper` (12, 2,164), `case-study` (5, 2,050), `layout` (6, 1,399),
`world` (4, 1,278), `run` (4, 1,044 — the sixth failed React port of the run's
engine), `thread` minus the two survivors (3, 1,086); `src/hooks/` (4, 256);
`src/lib/paperMemory.ts`; `src/lib/data/{index,skills,experience}.ts` — all
zero-importer. **Roughly 17,000 lines of components against ~2,600 that stay.**

**Also delete, and the plan does not name these:** the eight root-level
`tests/*.mjs` (1,118 lines, referenced by nothing), `deep-qa.spec.ts`,
`run-chrome.spec.ts`, `scripts/generate-og-image.py`, `scripts/fix-tailwind.pl`,
and the `lighthouse` devDependency.

### 4.3 — Prune the toolchain (safe only after 3.0)

Remove `next`, `react`, `react-dom`, `@radix-ui/react-dialog`, `gsap`,
`lucide-react`, `@tailwindcss/postcss`, `tailwindcss`, `@types/react`,
`@types/react-dom`, `@types/gsap`, `postcss.config.mjs`, `next.config.ts`,
`next-env.d.ts`. **Keep** `typescript` (the run build needs it), `sharp` (five
scripts), `culori` (three), `@playwright/test`, `prettier`.

**`clsx` and `tailwind-merge` come out only after 3.0 lands** — proven to break
`tsc -p tsconfig.run.json` otherwise (C13).

**Declare `playwright` or switch to `@playwright/test`**: `check-nameplate.mjs`
and `render-resume.mjs` import the bare package, which is undeclared and resolves
only transitively (C25).

**`eslint.config.mjs` must be rewritten** — it is built entirely from
`eslint-config-next`, and `npm run lint` is both a `verify:portfolio` step and a
CI job (C24).

**`tsconfig.json` must be rewritten too.** Its `include` is `**/*.ts, **/*.tsx,
**/*.mts`, and `npm run typecheck` is a `verify:portfolio` step and a CI job. It
will point at a tree that no longer exists. Note it does **not** currently cover
`scripts/**/*.mjs` — `.mjs` is absent from the include list — so the gate scripts
have never been typechecked. Decide whether the rewrite changes that.

Also move `tsconfig.run.json`'s incremental cache out of `outDir`: it currently
drops a 36 KB `tsconfig.run.tsbuildinfo` into the shipped `out/` (C22).

### 4.4 — Gate triage, with the measured buckets

| Gate | Ruling |
|---|---|
| `check-beat-tables`, `check-cargo-fixture`, `check-stations`, `check-nameplate` + negative | **Keep unchanged.** Pure-run gates |
| `check-figures` | Keep — but its `data:` side reads `projects.ts`/`projectCaseStudies.ts`, which survive |
| `check-anchors` | **Rewrite.** Its five `LINK_SOURCES` are React files it `read()`s unconditionally; it will throw. It is *deliberately* non-fallback, so it fails loudly — acceptable, but rewrite the source list to the archive's own generator |
| `check-links` | Keep; extend the glyph contract to the rebuilt archive pages |
| `check-contrast` | **Retire.** 589 lines mirroring a palette from `globals.css` and scanning `src/**/*.tsx`, which will not exist. `verify-portfolio` already prints "REACT ONLY" beside it |
| `check-probe-routes` | **Delete with the apparatus.** It crashes ENOENT once `src/app/` goes (C19) and passes vacuously otherwise |
| `check-static-export-seo`, `check-proof-manifest` | Keep — they gate the deploy |

**Spec triage — the measured picture, which is not the plan's.** CI runs six
specs: `atlas`, `run-home`, `reduced-motion`, `performance-budget`,
`held-apparatus`, `static-seo`. **24 of 30 run in no workflow at all.** So most
of the plan's "goes red at cutover" list is already inert and the cost of
deleting it is zero.

- **Keep, already run against the run:** `run-home`, `reduced-motion`,
  `performance-budget`.
- **Rewrite:** `atlas` (drives the case files being rebuilt — it is in CI, so it
  goes red at cutover), `static-seo`, `dossier` (the only spec asserting `#v-`
  anchors, and CI never runs it — fold its assertions into the crosswalk gate
  instead).
- **Delete with the app:** `held-apparatus`, `frame-governor`, `text-garnish`,
  `red-thread`, `text-motion`, `scroll-engine`, `pipeline-run`, `paper-memory`,
  `day-arc`, `comprehensive-qa`, `interactions`, `deep-qa`, `run-chrome`,
  `critique-screenshots`, `portfolio-fixtures.ts`, and the artifact generators
  (`themes`, `visual-audit`, `visual-regression`, `record-walkthroughs`,
  `full-audit`, `debug-audit`, `portfolio-quality-score`) unless a named reason
  keeps each.
- **Fix the two stale comments (C18)** in `ci.yml` and `check-anchors.mjs` that
  claim the e2e suite tests StoryShell.
- `playwright.config.ts:99-104`'s `PLAYWRIGHT_USE_NEXT_DEV` escape hatch dies
  with Next; remove it.

### 4.5 — Salvage, before the delete lands

Walk the old and new side by side once and write down what the archive gained
that the rebuild lacks. Three items are already known:

1. **The favicon changes size** (C23) — 25,931 B from `src/app/` → 569 B from
   `public/`. Choose deliberately and move the file.
2. **One receipt anchor loses its only path** (C27) — `#v-master-inventory-5`.
   Restore a link to it, or record that it is deliberately unreached.
3. **`waypoints-oklch.mjs` writes into a deleted directory** (C24) — repoint or
   retire it; do not leave a generator producing a file nobody reads.

Then delete the RSC payloads and the build cache from the shipped output (C22):
`out/index.txt`, five `__next.*.txt`, `out/tsconfig.run.tsbuildinfo` (move
`tsconfig.run.json`'s cache out of `out/`), and `out/run/lib/**` once 3.0 has
made `personal.ts` stop dragging `utils.ts` in (C14).

---

## 4. Phase 5 — Figures and benchmark artifacts, in one pass

Branch `feat/figures-and-benchmarks`. Merged deliberately: fig. 06's bars are
both a design problem and an artifact problem, and two phases touching one figure
means the second overwrites the first's reviewed design.

### 5.1 — Vendor two artifacts. Not five.

`public/proof/` holds two hand-authored ledgers and no machine output (C29).
**Vendor exactly the two the bars actually draw from**: the jetpack JMH JSON at
the sha ¶07 already pins, and Glyph's dot-kernel run at its own pin. Name the sha
in the filename — `public/proof/jetpack-jmh-2caacd0.json`. A number drawn from a
file nobody can open is testimony, not a record.

**Do not fetch all five locations C29 lists.** An `.xcresult` is a bundle
directory that can run to tens of megabytes, and "never commit large binaries" is
a standing constraint with a secret-scanning pre-commit hook behind it.
`visual-assist` stays on the sanitized-ledger precedent `public/proof/` already
establishes. The surefire XML and `mnist_eval.json` are bound by
`check-figures.mjs` today and have no bar to guard.

Do **not** transcribe from `docs/design-lab/STATION-FACT-LEDGER.md` — it is
marked SUPERSEDED and its own header warns two of its numbers are stale.

### 5.2 — Bind the bars. This is the highest-value gate in the phase.

C28 proved the four bar ratios are invisible to every gate. Extend
`check-figures.mjs` (or add `check-benchmarks.mjs`) to read the **script block**
it currently strips, parse the ratio literals, and assert them against the
committed JSON. Prove it fires by re-running the injection that is already
recorded above.

Bind the two `3.5×` occurrences the current gate misses as well: the fig. 06 bar
label and the ¶10 litany receipt. Only the prov prose is bound today.

### 5.3 — Redraw, with intervals

Ten numbered figures, `fig. 02` … `fig. 11` (C30). Reported problems: fig. 03 and
04 congested with colliding labels; fig. 05's chip covers Wednesday as well as
Tuesday (a placement bug, not taste); fig. 07 deserves better; fig. 08
unpolished; fig. 09 text overlapping the fields; fig. 10 unresolved.

**Fix the grammar before touching any single figure.**

- The congestion reports are mostly a **scale** problem: labels authored at
  desktop viewBox scale collapse when the plate renders at 320px. Compute the
  minimum rendered label size (viewBox units × min-plate-px ÷ viewBox width), set
  a floor around 9–10 rendered px, and move anything below it into the figcaption
  or a numbered key.
- The run already owns the right mechanism — the tight/wide edition rebuild at
  `:3289-3293` (`buildPath`, `buildNet`, `buildClimb` under per-figure minimum
  widths). **Fix congestion by shipping a narrow edition, not by squeezing one
  drawing across 320–2560.**
- More than about seven labels means a numbered-key legend, which suits the paper
  conceit anyway.
- Fig. 05's chip is a placement bug: anchor it to the column's computed x.
- **Keep the full-sentence `aria-label`s.** They are a contract, and a redraw
  that loses the narrative in `:1512` or `:1659` is a regression no gate sees.
- Order the work: grammar → figs. 06 and 07 (coupled to 5.1's data) → the
  congested ones.

**Error intervals are mandatory where the artifact has them.** JMH reports score
± 99.9% CI and a bare `6.4×` bar overclaims precision. Where there is no
variance, draw only what was measured and say so. **Never invent whiskers.**
Caption pins provenance: `drawn from public/proof/jetpack-jmh-2caacd0.json ·
3 forks · error bars are JMH's own CI`.

### 5.4 — fig. 06's three questions, three different answers

- **The classifier is genuinely live.** Real WebAssembly, no server, and Phase 0
  added a browser assertion that it instantiates.
- **The 3.5× bars are not live and never claimed to be** — the block is labelled
  *"the same math, twice — dot-256 kernel, committed bench"*. Honest, but the
  reader believed they were watching a measurement.

  **The bars lie through motion grammar, not through labels.** `scrubBench`
  (`:3305-3309`) fills them under the reader's scroll, directly beneath a
  genuinely live classifier, on the same plate. A gauge that fills as you watch
  is an instrument; a record does not move. Four concrete changes:

  1. **Remove the scroll-scrub fill** from both bench pairs (`scrubBench`,
     `scrubJetBench`). Draw the bars settled at final width. Any surviving motion
     is the page's generic `data-fx` prose entrance, reduced-motion-gated — never
     a gauge fill.
  2. **Re-clothe the bench as a filing.** The run already owns the grammar: the
     `.schoolrec` slip at `:1516-1525`. Give the bench its own bordered slip with
     a filed-record header carrying date and sha — `dot-256 kernel · bench
     committed @ <sha>` — which becomes a live link to `public/proof/…` once 5.1
     vendors the JSON. A record cites its file; an instrument shows a needle.
  3. **Add the counterpart honesty line.** The live half says *"read locally · no
     server"* (`:1624`); ¶07 already has the pattern at `:1655`. The bench slip
     carries: *"measured then, committed — not run in this tab."*
  4. **Give Glyph the `.bfoot` spread note it lacks** — jetpack has one at
     `:1664`.

- **"Confidently wrong on mouse-drawn input" is diagnosed. Do not build an
  instrument to re-confirm it.** `extractPixels` (`:3787-3799`) fills a 280×280
  canvas, re-traces strokes at `lineWidth 22`, does **one** `drawImage` downscale
  to 28×28, and reads the red channel. There is **no centre-of-mass centring, no
  bounding-box crop, no 20×20-into-28×28 padding, no deskew** — none of the
  preprocessing MNIST's own test set received. That was read from the source, not
  theorised, and capturing the 784-value tensor to compare statistics would
  confirm what the code already proves without changing the decision.

  **Decide instead.** Either one disclosure line beside the pad, in the page's
  own voice — the cheap, honest option, and the 97.01% claim sits three lines
  above the pad so it is also the necessary one — or implement centre-of-mass
  centring plus 20×20 padding, roughly thirty lines of canvas maths. The
  instrument-compare-report pipeline is cut.

---

## 5. Phase 6 — Acceptance, as a reader

The validator proves nothing broke. It does not prove the thing was worth doing.

1. **The seam, both directions, from every station with a handoff** — the arrival
   slip quotes the waybill that sent you; the return puts you back at *your*
   station, not ¶04. Today `back to the work ⟵` sends every file to `/#work`
   (¶04, 08:47), so a reader leaving Glyph at 15:23 is returned to the wrong hour.
2. **The dark stations** — leaving from ¶08/¶09 must not read as a different site.
3. **Hash arrival lands with the ink already seated.** The per-station rejoin
   links multiply hash arrivals sevenfold, two of them into night stations
   (`/#automl`, `/#review`). Load each rejoin target directly, cold, and confirm
   the ink field is correct in the first painted frame — not corrected after the
   first scroll event. This was not load-bearing when every return went to
   `/#work`; it is now.
4. **320px and 390px**, both. The 404's index row was measured overflowing at
   every width below 430 before `wrap-anywhere` fixed it; the archive rebuild
   inherits that grammar.
5. **Reduced motion and print.**
6. **The classifier loads on the deployed artifact**, not locally — the Phase 0
   closure hole, confirmed in production.
7. **Update `docs/PROJECT-LEDGER.md`.** A migration this size that leaves the
   ledger stale guarantees the next person re-derives all of it.

---

## 6. Deferred, and explicitly not part of this migration

**Appendix A — the live run counter.** Owner deferred it. It is the only work
that adds standing infrastructure and nothing else depends on it. `run 042` is a
hard-coded string. Do not start it until Phase 6 is done.

**`docs/design-lab/timing-audit/`** — 28 files, ≈2.0 MB of committed scroll
telemetry JSON/CSV. Not part of any gate. Worth a ruling eventually; not now.

