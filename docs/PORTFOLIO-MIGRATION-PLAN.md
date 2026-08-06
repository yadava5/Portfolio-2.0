<!--
  ══════════════════════════════════════════════════════════════════════════
  ITS PHASE 3–6 SECTIONS ARE SUPERSEDED. Read
  docs/PORTFOLIO-MIGRATION-PLAN-3-6.md instead: it was written at the Phase 2
  checkpoint from what execution actually found, corrects this document in
  thirty measured places, and is annotated with Phase 3's outcome.

  Phases 0–2 below shipped and are accurate. Everything from Phase 3 onward in
  this file is the version written before any of it had been run.
  ══════════════════════════════════════════════════════════════════════════

  VERSION-CONTROLLED COPY of the migration plan, so it travels with the checkout.
  Verbatim below this header. Written from a cleared context; read it completely
  before acting on it.

  EIGHT CORRECTIONS, measured against the working tree at 4ec9421 before Phase 0
  began. Where this header and the plan below disagree, THIS HEADER IS THE
  MEASUREMENT and the plan below is the prose that was written from memory.

  1. ¶03's clock is 07:52, not 07:30. src/run/index.html:1481, confirmed
     independently by CLOCKS[2] = 472 at :3308.
  2. The glyph contract covers NINE links, not eight. All 8 dossier links use ↗,
     and so does a 9th at :1890 (`the working paper ↗` → the site root). ⟵ appears
     zero times in the file. The ↳ is never on the anchor — it prefixes the handoff
     paragraph in a <span class="dep">, and two of the seven ↳ spans (:1641
     jetpack→GitHub, :1687 LifeQuest→no file) are not dossier links at all. This is
     why the plan says implement the RULE, not the count.
  3. FIVE sections lack ids, not four: beats 0, 4, 5, 6, 7 (:1405, :1536, :1574,
     :1624, :1667). The plan names only 4–7.
  4. check-links.mjs never reads out/ in CI. Its usingBuild branch needs out/ to
     exist, but test:links sits in the proof-manifest job, which has no build step.
     So CI only ever scans 4 hard-coded source files. The comment at ci.yml:315
     claiming it "runs in the job that has already built out/" is false.
  5. Invariant 1 has no gate. Nothing asserts out/index.html IS the run.
     check-static-export-seo reads it only for head tags — which build-home.mjs
     lifts out of Next's own output, so it passes identically whether the run or
     StoryShell shipped. Closed by verify:portfolio's assert-run-shipped.
  6. check-probe-routes.mjs:61-66 exits 0 when no page.probe.tsx exists, so
     retiring the HELD probe silently retires its guard too.
  7. chapters.ts has FOURTEEN importers, not the six listed. The eight unlisted:
     StoryShell.tsx:55, ChapterRail.tsx:38, RunManifest.tsx:36, apparatus.tsx:16,
     ThreadRail.tsx:57, ThreadSegment.tsx:47, railTravellers.ts:43,
     atlas.spec.ts:2. Phase 2 therefore does NOT delete chapters.ts — see the
     execution plan. The run is insulated: nameplateMachines.ts:84-85 imports only
     thread/geometry and lib/data/personal, so nothing on tsconfig.run.json's
     compile path touches chapters.ts.
  8. id="top" is live at <main id="top"> (:1402), so the masthead's #top at :1382
     is not a dead fragment.

  Owner rulings taken after this plan was written:
    · visual-assist  — build it AND link it (a fourth ¶10 receipt); no 14th station.
    · HELD apparatus — retire the probe, keep the render.
    · checkpoints    — stop after Phase 0, stop again after Phase 2.
-->

# Portfolio 2.0 — one portfolio: the 13-station run, and an archive rebuilt in its language

**Read this file completely before doing anything.** It is written to be executed
from a cleared context by agents who were not present for the decisions. Where it
says *verified*, the fact was measured against the working tree — trust it, but
re-measure anything you are about to depend on.

- **Repo:** `/Users/ayush/Documents/Projects/Portfolio-2.0` · branch `main`
- **Live:** https://yadava5.github.io/Portfolio-2.0/ (GitHub Pages, static export)
- **Baseline commit when this plan was written:** `4ec9421`
- **The working tree is NOT clean** — there is uncommitted work-in-progress on the
  React shell. Phase 0.1 lists the exact files and reverts it. Do not mistake it
  for someone else's in-flight change.
- **First action, before Phase 0:** copy this file to
  `docs/PORTFOLIO-MIGRATION-PLAN.md` in the repo so it is version-controlled and
  travels with the checkout. The owner asked for this; it could not be done from
  plan mode.

This plan was reviewed adversarially twice. Both reviews are reflected in the text
— including one that reversed the reviewer's own earlier architecture ruling. Do
not re-litigate the settled decisions listed under Context; do challenge anything
you can disprove by measurement.

---

## Context

The repo ships **two portfolios**.

- **The one that ships** is `src/run/index.html` — a standalone, zero-dependency
  HTML working paper. One workday as a railway run: 13 `<section data-beat>`
  stations, `¶ 01 · the start — 06:12` to `¶ 13 · the next morning — 06:12`, a
  canvas rail crossing the page, cargo riding each corridor under a waybill.
  `scripts/run/build-home.mjs` copies it over `out/index.html` after the Next
  build. Its header records why: six React ports each measured green and each was
  a near-miss, so the prototype itself became the product file.
- **Everything else** is the Next App Router app: the abandoned seventh port at
  `src/app/page.tsx` → `StoryShell.tsx`, plus `/projects/<id>`, `/evidence`,
  `/world-preview`. Both answer to `/` — a hard load serves the run, while the
  masthead wordmark is a `next/link` that same-document-swaps in the 7-chapter
  React home at the same URL (verified on the live site: `sameDocument: true`, DOM
  returns 7 `[data-chapter]` and `canvas.run-rail`).

**Owner's ruling:** keep the 13-station run as the whole portfolio. Rebuild the
archive — case files, evidence, benchmarks — from the **data layer** in the run's
own language, then retire the Next app entirely.

Three measurements make that feasible, and one constrains it:

1. **The run couples to the Next app in only 8 links** — five `↳` handoffs
   (`:1494, :1526, :1548, :1589, :1715`) and three ¶10 receipt links (`:1742,
   :1744, :1746`). Verified: they resolve to **six distinct dossiers**
   (`master-inventory, jobtracker, taskflow-calendar, fast-mnist-nn, automl,
   policybot`) and to **`/evidence` zero times**.
   **But `out/projects/` holds seven** — `visual-assist` exists and the run never
   links it — and `check-static-export-seo.mjs` **fails below 7 project routes**.
   Build only what the run links and the gate goes red. **Rule on `visual-assist`
   explicitly**: rebuild it, or drop it *and* lower that threshold deliberately.
2. **The honesty gate survives a rebuild.** `build-home.mjs:117` fails on *"the run
   out-claims **the data layer**"* — it reads `src/lib/data/*`, not the rendered
   dossiers. Keep the data layer and the gate keeps working.
3. **The head tags have a clean rebuild path.** `tsconfig.run.json` already
   compiles TypeScript (`nameplateMachines.ts`, `geometry.ts`) to plain ESM for
   the run. `src/lib/seo.ts` can go the same route and be *imported* by a
   head-emitter — no regex, fails loudly.
4. **The constraint:** the head for `/` comes from the **root layout**
   (`src/app/layout.tsx:91, :101, :103, :158`), not from `page.tsx` — and
   `src/run/index.html` carries **zero** canonical / og / twitter / JSON-LD of its
   own. Retire the Next app without replacing that and
   `check-static-export-seo.mjs` fails in `deploy.yml:45` — **production deploy
   fails.**

**What a rebuild costs, stated honestly:** the dossier's seven documented rounds of
measured layout decisions (tap targets probed at 390px, the orphaned-folio sweep,
the `#v-<id>-<n>` anchor grammar). That is *design* work, not claims — the claims
live in the data layer. It is re-earnable, and the owner has chosen to earn it in
the right idiom rather than inherit it in the wrong one.

**The inversion that makes this safe: build before you delete.** Those 8 links are
live. The new archive ships and the links repoint *before* the old tree goes.

---

## Non-negotiable invariants

A phase that breaks one is reverted, not patched forward.

1. **`out/index.html` is the 13-station run** — 13 `data-beat`, 0 `data-chapter`.
2. **The rail paints and the cargo rides** — ink solid-behind / dashed-ahead at the
   token; every corridor carries cargo; scrolling up un-draws.
3. **No claim outruns its receipt.** `build-home.mjs`'s data-layer gate stays armed.
4. **`out/` keeps its head** — canonical, og:*, twitter:*, JSON-LD, title.
5. **The run's whole dependency closure ships** — not just the HTML. See Phase 0.
6. **No dead links at any point**, including mid-migration.
7. **Reduced-motion and print worlds still render the settled page.**

---

## The validator

`npm run verify:portfolio`, added in Phase 0:

| Check | Command |
|---|---|
| Types / lint / format | `npm run typecheck` · `npm run lint` · `npm run format:check` |
| Build + home swap | `npm run build` |
| Beat tables | `npm run test:beat-tables` |
| Figures ⇄ data layer | `npm run test:figures` |
| Anchors · Links | `npm run test:anchors` · `npm run test:links` |
| SEO export · Proof | `npm run test:seo` · `npm run test:proof` |
| Nameplate | `npm run test:nameplate` · `npm run test:nameplate:negative` |
| OG rasters | `npm run assets:check-og` |
| Contrast | `npm run test:contrast` — **scope warning below** |
| Browser smoke | `npm run test:e2e:browser-smoke` |

**Never pipe a gate into `tail`** — the pipe eats the exit code; that hid a red
Prettier gate here for twelve CI runs.

> **`test:contrast` does not gate the run.** Verified: it hand-mirrors the palette
> from `src/app/globals.css`, imports stops from `scripts/design/dusk-choreo.mjs`,
> and its `className` scan walks `src/**/*.{ts,tsx}` only. `src/run/index.html` is
> HTML with inline CSS and is **never read**. Re-point it at the run or label it
> explicitly React-only. Do not count it as coverage of the live site until then.

### The golden hash, and the hole it does not cover

Hash `out/index.html` at baseline; any phase not *intended* to change the run must
reproduce it. The build is deterministic — verified: no `new Date()`, `Date.now()`,
`toISOString`, `randomUUID` or `Math.random` in `build-home.mjs` or
`build-nameplate.mjs`, and `out/index.html` carries no chunk hashes. **Confirm in
Phase 0 by building twice and comparing before trusting it.**

**Pin the recipe:** hash immediately after a fresh `npm run build`, **before** any
`test:e2e:*` script runs. Every `test:e2e:*` builds with `NEXT_PUBLIC_BASE_PATH=`
(empty) and **re-runs `build-home.mjs`, overwriting `out/index.html` mid-chain**.
Order every `out/`-reading check before the e2e entries, or rebuild after.

**The regression class the hash cannot see — fix it in Phase 0.** Delete
`src/run/wasm/` and: `build-home.mjs:184` copies it *conditionally, silently*, the
golden hash reproduces byte-for-byte, **zero test files mention wasm or
`fast_mnist`**, every gate passes green — and fig 06's live classifier 404s in
production. Identical exposure for `out/fonts/*`, OG rasters, `resume.pdf`.
The hash certifies one file; the run's closure is much larger.

**Re-baselining:** the run is edited deliberately in Phases 1, 3, 4 and 5. After
each, the diff is read and *then* the hash re-recorded, as a reviewed step.
**Never re-baseline to make a red check go green.**

**Rollback rule:** one branch, one PR per phase. If the validator fails and the fix
is not obvious in one attempt, abandon the branch. Invariants outrank the phase.

---

## Phase 0 — Baseline, closure, cleanup

1. **Revert the work-in-progress.** Uncommitted changes fix the cargo table of the
   page this plan retires: `src/components/run/railTravellers.ts`, `RunRail.tsx`,
   `src/components/story/chapters.ts`, `ChapterRail.tsx`, `.github/workflows/ci.yml`,
   **`package.json`** (it adds a `test:cargo-manifest` script), and untracked
   `scripts/qa/check-cargo-manifest.mjs`. Revert all of it.
   **Keep exactly one hunk:** the `scripts/qa/check-beat-tables.mjs` regex fix — it
   guards the shipped run and was reporting a phantom bare corridor (the old
   pattern required `beat: N, n: N, label:` on one line; beat 5's entry wraps).
2. **Close the closure hole.** Make `build-home.mjs` **fail**, not warn and not
   silently skip, when `src/run/wasm` or `src/run/fonts` is missing. Add a check
   asserting `out/wasm/model.weights.bin` exists and is non-trivial in size, and
   have the browser smoke instantiate the classifier once.
   **Same class, same phase:** `build-home.mjs:154-158` merely *warns* when it
   finds no canonical/og/JSON-LD to carry over. Harden it to a failure. (Phase 3's
   head emitter replaces that block outright, but this must not stay soft in the
   interim.)
3. Build twice; confirm identical hashes; record the baseline.
4. Add `verify:portfolio` to `package.json` **and wire it into `ci.yml`**.
   (`deploy.yml:39-48` currently gates only `build`, `test:seo`, `test:proof`.)
5. **Record the run's cargo behaviour as a fixture** — hook `fillText` on the run's
   canvas, scroll in steps, map each painted label's document-y to a corridor.
   The run's painter is `drawTokenAndTravellers`; confirm it calls `fillText`
   before relying on the hook, else scroll-and-screenshot.
6. Reference screenshots of every figure at 1440px and 390px — Phase 5 needs a
   "before".

---

## Phase 1 — The run's own content

One phase for every edit to `src/run/index.html` that needs no new infrastructure.

**a. Cargo.** Rule the table now follows: every corridor carries either the count
its own station names, or two distinct named things — **no duplicates for
spacing**. A waybill states only what its own station already prints (D6); quote
the source in a comment above each entry. The original bug was a table authored
from adjacent knowledge instead of from the page.

- **¶03 · the yard (beat 2)** — two identical crates. Drop to one; add a second
  distinct item grounded in `tableau + workday silos ⟶ one master inventory —
  10,453 rows × 35 fields` and `↳ only the inventory is checked in`.
- **¶09 · agentic automl (beat 8)** — the only project station handing on nothing
  of its own; it ships `run 042's report → the review`. Add the halted run as the
  leading item, grounded in `↳ the halted run lands in the case file` and `the run
  halts at the seventh gate — deploy never lights itself`; keep the report second
  at an `off:` offset.
- **¶07 · jetpack-compress (beat 6)** — carries `n: 2` under a waybill reading
  `one valid gzip member`. The station names two carryable products (the member;
  `↳ the member lands in the benchmark ledger @ 2caacd0`). *Agent decides:* drop to
  one, or two distinct items.

**b. Station ids.** Beats 4–7 have none (`:1536, :1574, :1624, :1667`) — Cadence,
Glyph, jetpack, LifeQuest. Add stable ids. **Choose them to match the project ids
the archive already uses** (`jetpack-compress`, not `compress`) so the names are
chosen once, here. Required by Phase 2 and by per-station returns.
*Note `check-anchors` cannot bless this — ids are supply and that gate checks
demand. The real verification is Phase 2's guard.*

**c. The glyph contract.** Site law (`evidence/page.tsx`, F41): `↗` leaves the
site, `⟶` goes deeper into this argument. The run breaks it on its own case files.
**Do not fix "the six" — there are eight** (five handoffs, three ¶10 receipts).
**Implement the rule, not the count:** any `href` into
`yadava5.github.io/Portfolio-2.0/*` takes `⟶`; external `source ↗` / `live build ↗`
stay. **Add a one-regex guard so it stays true.**

**Validator:** full suite + the Phase 0 cargo fixture, updated deliberately — the
diff is expected and must be reviewed, never auto-accepted. Re-baseline the hash.

---

## Phase 2 — One source of station truth

Create `src/lib/data/stations.ts`: for each of the 13 beats — beat index, id,
kicker string, time, consignment phrase, **and a `hasDossier` flag** (LifeQuest has
no case file, `:1687`; the seam work must skip it deliberately, not by accident).

- **Fold `chapters.ts`'s consumers onto it and delete it** — `not-found.tsx:30`,
  `useActiveChapter.ts:23`, `DayMark.tsx:31`, `RunClock.tsx:35`, plus
  `check-anchors.mjs:68`'s resolution and the `RUN_ANCHOR` rename map at `:50`.
  Keeping a 7-chapter truth file beside a 13-station one is two sources of station
  truth with a rename map between them — a second unguarded head on the drift risk.
- **Guard it.** A check in the spirit of `check-figures.mjs` asserting every
  `stations.ts` string appears verbatim in `src/run/index.html`. **Without this
  guard, Phase 3's arrival slips must not ship.**
- **Teach `check-anchors.mjs` to resolve `stations.ts`.** It currently matches only
  literal `"/#x"` strings (`:57`); links composed as `/#${station.id}` match
  nothing. It already resolves a data file this way for `CHAPTERS` at `:68-87` —
  follow that. Otherwise the defect class named in that file's own header walks
  back in through the front door.
- **Wire the new guard into CI.**

> **Admit the churn:** of `chapters.ts`'s consumers, `DayMark`, `RunClock` and
> `useActiveChapter` are deleted two phases later with the rest of the Next app.
> Only `check-anchors` and the *rebuilt* 404 survive as real consumers. Folding
> them is still right — one truth file, and Phase 3 depends on it — but do the
> minimum on the doomed three. Note that rewiring `not-found.tsx` from 7 chapters
> onto 13 stations visibly changes a shipped page inside an "infrastructure"
> phase; review it as a content change, not a refactor.

---

## Phase 3 — Build the new archive (nothing is deleted in this phase)

The case files and evidence, rebuilt from `src/lib/data/*` in the run's language.
**Fable designs; the main thread verifies.**

### The metaphor — the case file is the consignee's record

Every handoff is a waybill: cargo plus destination. The reader who clicks is not
leaving the line; they are following the consignment to where it lands and
inspecting it there. Rejected, with reasons worth keeping: *deeper zoom into the
same day* misstates provenance (a file says `filed 2026-02`; the run is one day);
*a siding* implies the train diverts, but the day completes whether or not a file
is opened.

Concretely:

1. **The rail terminates, it does not continue.** A short stub entering the top
   edge, ending at a drawn buffer stop, with the file's binding thread hanging from
   it. Drawn SVG in the paper's hand — **not an engine port**.
2. **The arrival slip** — one mono line above the kicker, string-identical to the
   waybill that sent the reader, sourced from `stations.ts`:
   `↳ received off the morning run — ¶ 04 · first station — 08:47 · consignment:
   the sorted mail`.
   **It must not contain a run number.** If the counter in Appendix A ever ships,
   a baked `run 042` in every slip goes stale the moment the live number moves.
   The record room quotes the *route*, not one day's serial.
3. **The return journey, per station** — `⟵ rejoin the line at ¶ 06 · third
   station — 15:23`. Today `back to the work ⟵` sends *every* file to `/#work`
   (¶04, 08:47), so a reader leaving Glyph at 15:23 is returned to the wrong hour.
4. **No app chrome.** The run's paper masthead — name plus station line — replaces
   avatar, `the work / experience / contact / github` nav, `motion: on` and the
   dark resume pill. Resume becomes a quiet mono link.
5. **No day arc on the archive.** Readers arrive at arbitrary depths via `#v-`
   anchors, so a scroll-keyed arc would assign a time of day to a jump target.
   Instead: pulling a file turns on the archive lamp. If the seam from the dark
   stations (¶08–09) still reads hard, MPA View Transitions
   (`@view-transition { navigation: auto }`) is a zero-JS progressive cross-fade,
   gated by `prefers-reduced-motion`, never load-bearing.
6. **One clay.** Run `#a03f20` vs dossier `#b04a28`. Pick one and **re-measure
   WCAG *and* APCA on every surface it touches.** Never ship a colour claim you
   did not measure.

### URL scheme — decide this before writing a line

**The archive keeps its current URLs: `/projects/<id>/` and `/evidence/`.** These
are the *world's* inbound coupling — search index, already-shared OG cards,
READMEs — and GitHub Pages cannot redirect. Changing them 404s every external link
silently, which no gate here can see. Because the URLs are preserved, **there is no
"repointing" to do in Phase 4**; the run's 8 links keep working unchanged.

### The machinery that must be rebuilt with it

Retiring Next takes all of this. Enumerated from the tree, not from memory — the
first item is the one everything else hangs off:

1. **The build orchestrator itself.** `npm run build` is `next build && node
   scripts/run/build-home.mjs`, and `build-home.mjs:46` *requires* `out/` to
   already exist. **Next is also what copies `public/` → `out/`** — `resume.pdf`,
   `og/`, `proof/`, `images/`, both favicons. Retire Next and nothing creates
   `out/` and not one public asset ships. **Decide what `npm run build` becomes.**
2. **Head emitter** — canonical, og:*, twitter:*, title, and JSON-LD **per page
   type**: `siteGraph()`, `caseStudyGraph()`, `evidenceGraph()` in `src/lib/seo.ts`
   (the gate enforces Person nodes and CollectionPage per route, not just on `/`).
   Compile `seo.ts` via the `tsconfig.run.json` route and **import** it — do not
   regex it. Precedent: `build-nameplate.mjs` already compiles that way **and
   rewrites emitted `@/` specifiers to relative paths**; follow it exactly. Note
   `seo.ts` imports `@/lib/utils`, which drags `clsx` + `tailwind-merge` into the
   emitted graph — fine for a build-time node script, or extract `basePath`.
3. **`404.html`** (`src/app/not-found.tsx`) — GitHub Pages serves it for every bad
   URL, and its wayfinding index is a natural `stations.ts` consumer.
   **Its loss is invisible to the gate:** `check-static-export-seo.mjs:151` does
   `if (!fs.existsSync(notFoundPath)) continue;` — a missing 404 passes silently.
   **Make that block mandatory** as part of this phase.
4. **`sitemap.xml` and `robots.txt`** — currently `src/app/sitemap.ts` / `robots.ts`.
5. **OG rasters** — `assets:render-og`; `assets:check-og` already runs in CI
   (`ci.yml:281`) and will go red until re-rendered. That is the gate working.
6. **Fonts.** `next/font` dies with the layout. `src/run/fonts/` already carries all
   four faces (Fraunces var, Newsreader roman + italic, Fragment Mono) — the
   archive pages `@font-face` the run's fonts.
7. **The skip link and a11y chrome.** The layout's `#main-content` skip link is
   every archive page's keyboard entry. The run famously has none; the rebuilt
   pages need their own.
8. **`#v-<id>-<n>` receipt anchors** — preserve the grammar exactly; the run links
   into it. **It has zero automated coverage today** — see the crosswalk gate below.
9. **`paperMemory.ts`** — visited-file marks and audit state. **Do not rename its
   localStorage keys** or every reader's marks silently reset.
10. **The HELD apparatus** — the dashed-clay stamp, `src/app/probe/held/`,
    `held-apparatus.spec.ts`, `check-probe-routes.mjs` and the `test:e2e:probes:ci`
    step (`ci.yml:385`) all exist only through the Next probe route. Rule on it:
    rebuild the apparatus, or retire it and its CI step together.

### The crosswalk gate — build it here, it does not exist

**Measured: nothing checks the seam today.** `check-links.mjs:79` inspects *only*
`github.com/**/blob|tree|commit` URLs and skips everything else, including the
run's own `yadava5.github.io` links. `check-anchors.mjs` checks `/#x` links *into*
the home page from five hard-coded React sources — not links *from* the run into
dossiers. And `grep -rl '#v-' scripts/qa/` returns **nothing**.

Build a gate asserting: every internal `href` in `src/run/index.html` resolves to a
file that exists in `out/`, and every `#fragment` on those links exists as an `id`
in the target HTML. This is the only automated verification the seam will ever
have, and it implements risk 4 (canonical-origin pinning) for free. **Wire it into
CI.**

### What flips into `out/` in this phase, and what stays staged

Deploys are atomic, so there is no *within-deploy* incoherence — but the Phase 3
merge deploys. Therefore: **only the head emitter flips in this phase**, replacing
`build-home.mjs`'s scrape block (`:121-158`), byte-diffed against Next's rendered
head while Next still exists as the reference. That is also why Phase 3 is in the
re-baseline set. **Everything else builds to a staging directory** and is validated
by running `check-static-export-seo.mjs` and the new crosswalk gate against
staging. The cutover is Phase 4, in one PR.

---

## Phase 4 — Repoint, verify the seam, then retire the Next app

Only now does anything get deleted.

1. **Swap the staged emitters into the build, in one PR.** There is **no link
   repointing** — the URLs are preserved by design (see Phase 3), so the run's 8
   links keep working untouched. The gate that must be green here is the **new
   crosswalk gate**, not `test:links`/`test:anchors`: measured, neither of those
   inspects a single run→dossier link, so they would certify a seam they never
   looked at.
2. **Walk the seam in a browser, both directions, from every station with a
   handoff** — including from the dark stations.
3. **Retire the Next app.** `src/app/*` (except what the new build needs),
   `src/components/story|run|thread|world`, `case-study`, `paper`, `scenes`,
   `/world-preview` (owner ruled it goes; update the standing ruling comment in
   `robots.ts:11-19`, retire `day-arc.spec.ts` and `docs/design-lab/shoot-arc.mjs`
   with it, and record in the ledger that the day-arc bench was deliberately given
   up). **Also goes zero-importer and is not obvious:** all of
   `src/components/layout/` (Header, Footer, DayMark, RunClock, SmoothScroll,
   MotionToggle) and the rest of `src/hooks/`. Pre-existing orphans too:
   `thread/ThreadRail.tsx`, `hooks/index.ts`, `hooks/useGSAPCleanup.ts`.
   **And prune the toolchain** — `next`, `react`, tailwind, the postcss/eslint
   configs, `tsconfig` includes. Leaving them keeps `typecheck` and `lint` gating a
   ghost tree, which is this repo's signature failure wearing a new coat.
   **`check-anchors.mjs` will hard-crash** post-deletion (ENOENT on its five
   `LINK_SOURCES`) — loud, so acceptable, but rewrite its source list here.
4. **Salvage check before deleting** — walk the old and new pages side by side once
   and write down anything the archive gained that the rebuild lacks. The day-arc
   colour pipeline (`scripts/design/waypoints-oklch.mjs` →
   `components/world/waypoints.generated.ts`) needs an explicit decision: verified
   the run does **not** consume it (no reference in `tsconfig.run.json` or
   `build-home.mjs`; zero `oklch(` in the run). Re-point it or retire it — do not
   leave a generator writing to a deleted file.
5. **Test triage — the criterion, since "triage" is not an instruction:** *rewrite
   against the run if the spec guards an invariant; delete otherwise. Nothing stays
   red in `test:e2e:full`.*
   - Assert React markup, already failing, only in `test:e2e:full`: `red-thread`,
     `text-motion`, `paper-memory`, `pipeline-run`, `scroll-engine`, `day-arc`'s
     home-boundary block (`:253-294`).
   - `goto("/")` with no React selector, already broken against the shipped
     artifact (the run has no skip link and no Next header/footer): `a11y-audit`,
     `interactions`, `nav-and-images`, `comprehensive-qa`, `deep-qa`, `dossier`,
     `critique-screenshots`, `debug-audit`, `full-audit`.
   - Unaffected and in CI, keep: `run-home`, `reduced-motion`,
     `performance-budget`.
   - **Rewrite, not keep — corrected on measurement:** `atlas.spec.ts` drives
     `/projects/automl/`, `/projects/fast-mnist-nn/#artifacts`,
     `/projects/visual-assist/` and asserts React dossier markup — those are the
     pages being rebuilt, so it goes red at cutover. `held-apparatus.spec.ts`
     exists only through the Next probe route and **dies with the app**, along
     with its `ci.yml:385` step.
   - **Nine specs in no bucket — rule on each:** `themes`, `visual-audit`,
     `visual-regression`, `record-walkthroughs`, `portfolio-quality-score`,
     `static-seo`, `run-chrome`, and the two React-probe suites `frame-governor`
     and `text-garnish` (these two die with the app). Do not let Phase 4.6 inherit
     them unexamined.
6. **Audit every surviving gate for which artifact it actually reads**, and write
   the answer beside it. A green suite that inspects a deleted page is worse than
   no suite, because it is believed.

---

## Phase 5 — Figures and benchmark artifacts, in one pass

Merged deliberately: fig 06's bars are both a design problem and a benchmark
artifact problem, and two phases touching one figure means the second overwrites
the first's reviewed design.

| Figure | Reported |
|---|---|
| fig 03 | congested, labels colliding — the flow is liked |
| fig 04 | same |
| fig 05 | the chip covers Wednesday as well as Tuesday — a placement bug, not taste |
| fig 06 | three separate questions, below |
| fig 07 | deserves better |
| fig 08 | unpolished next to its neighbours |
| fig 09 | text overlapping the fields |
| fig 10 | is this the best available |

**fig 06 — three questions, three different answers:**

- **The classifier is genuinely live.** `src/run/index.html:3555` imports
  `./wasm/fast_mnist.js`, instantiates it, fetches `wasm/model.weights.bin`. Real
  WebAssembly, no server.
- **The 3.5× bars are not live and never claimed to be** — labelled `the same
  math, twice — dot-256 kernel, committed bench:` (`:1614`). Honest, but the reader
  believed they were watching a measurement. That is a **design** failure. Fix the
  reading, not the number.
- **"Shows 100% but wrong" is a real defect, settled by measurement.** A
  784→100→10 MLP at 97.01% on MNIST will be confidently wrong on mouse-drawn input
  whose preprocessing differs from MNIST's (centre-of-mass centring, 20×20 box
  inside 28×28, stroke width). Method: capture the actual 28×28 tensor the page
  feeds the network, compare its statistics against an MNIST sample, report the
  gap. **Instrument it; do not theorise.**

**Benchmark artifacts — draw the figure when the numbers are the finding;
photograph only when the pixels are the finding.** A screenshot of a JMH dump is
unreadable at column width, unstyled against the ink conceit, inaccessible, and
evidentially weaker — a picture of numbers is testimony; numbers with a pin are a
record. The old screenshots are bad precisely because they stood in for numbers.

1. **Vendor the artifact** — precedent exists (`public/proof/*.json` are checked in
   and downloadable). Add `public/proof/jetpack-jmh-2caacd0.json` (already pinned
   by ¶07's waybill) and Glyph's dot-kernel run.
2. **Draw from it** in the `fig. N` grammar, `viewBox` SVG, full-sentence
   aria-label. **Error intervals are mandatory where the artifact has them** — JMH
   reports score ± 99.9% CI and a bare `6.4×` bar overclaims precision. Where there
   is no variance, draw only what was measured and say so. **Never invent whiskers.**
3. **Caption pins provenance:** `drawn from benchmarks/jmh-result.json @ 2caacd0 ·
   n forks · error bars are JMH's own CI`.
4. **Guard it** — extend `check-figures.mjs` (or add `check-benchmarks.mjs`) to
   parse the committed JSON and assert the drawn numbers match, **and wire it into
   CI**. Otherwise the figure is hand-authored prose wearing a lab coat.
5. Surviving product-UI screenshots get re-taken deliberately — current build, one
   viewport, dated — never as evidence for a number.

---

## Phase 6 — Acceptance, as a reader

The validator proves nothing broke. It does not prove the thing was worth doing.

1. **The seam, both directions, from every station with a handoff.** The arrival
   slip quotes the waybill that sent you; the return puts you back at *your*
   station, not ¶04.
2. **Dark stations** — leaving from ¶08/¶09 must not read as a different site.
3. **320px and 390px** — layout claims verified at the narrowest width.
4. **Reduced motion and print** — both worlds still render the settled page.
5. **The classifier actually loads in production** — the Phase 0 closure hole,
   confirmed on the deployed artifact, not locally.
6. **Update `docs/PROJECT-LEDGER.md`** — the repo's canonical compact record. A
   migration this size that leaves the ledger stale guarantees the next person
   re-derives all of it.

---

## Appendix A — the run counter (DEFERRED, detachable, do not start until Phase 6 is done)

Owner deferred this. It is the only work that adds standing infrastructure, and
nothing else depends on it. **It is not part of the migration.**

**What exists today:** `run 042` is a hard-coded string (`:17`), as is `run 043 ·
not yet begun` (`:1892`). **Approval is not persisted at all** — zero
`localStorage`/`sessionStorage` in the run; it lives in `window.__world.approved`,
so a reload un-approves it and one person can approve endlessly. The number also
appears in **five DOM sites** (`:1383, :1388, :1841, :1853, :1892`) **and three
canvas-painted cargo labels** (`:2424, :2481, :2486`) — any live-number design must
decide about the canvas, or the page contradicts itself and the Phase 0 cargo
fixture breaks.

**Why the naive version was rejected:** the site is a static export on GitHub
Pages, so a global counter needs a new endpoint. Under pin-at-load, two concurrent
readers both sign 042 — a duplicate *and* a gap, on a paper whose conceit is that
run numbers are records. When the endpoint is blocked, "graceful degradation" mints
a false record (told you signed 042; the ledger is at 90). And an unauthenticated
POST is curl-inflatable, making the run number **the only figure on the page with
no receipt** — the exact defect class `build-home.mjs`'s own gate exists to kill.

**The recommended shape if it ships:** a **deploy-pinned edition** — the number
lives in the repo, bumped by commit, optionally derived from a committed approvals
ledger in `public/proof/` that a reader can open (which *is* this site's provenance
grammar). The reader's own signature persists locally via `paperMemory` semantics,
which makes ¶13's "not yet begun" true for that reader with zero infrastructure,
zero abuse surface and no reflow risk. If a live global number ships anyway it must
be (a) server-assigned at POST, (b) shown as provisional before signing, (c) backed
by an inspectable ledger rather than a bare integer, (d) refreshed into the baked
fallback at every deploy. Note `paperMemory.ts:120` stores a date only and is
documented against *run 041* — a value-shape extension and a legacy-signer decision
are both required.

---

## Risks a person notices months later

1. **String drift at the seam** — a station kicker is renamed in the run and the
   archive quotes a station that no longer exists. `stations.ts` + its guard is the
   defence; without it, do not ship arrival slips.
2. **Hash-arrival ink flash** — returning to `/#automl` must land with night ink
   already seated. If the field computes from scroll *events*, a hash arrival may
   flash dawn over a night station. Test it explicitly.
3. **`paperMemory` localStorage keys** — renaming them silently resets every
   reader's marks.
4. **Absolute URLs in the run** — it hard-codes
   `https://yadava5.github.io/Portfolio-2.0/…`. Fine on Pages; the day a custom
   domain arrives, eight links rot silently. Tie them to `seo.ts`'s canonical
   origin in `check-links`.
5. **OG rasters go stale** after the rebuild — `assets:check-og` (`ci.yml:281`)
   will catch it; re-run `assets:render-og`.
6. **Vendored benchmark JSON vs upstream** — the sha in the filename and caption is
   the defence.
7. **Gates that stay green while covering nothing.** This repo's signature failure,
   and this migration multiplies the opportunity: `test:contrast` never reads the
   run; every `test:e2e:*` rebuilds with an empty basePath nobody deploys; the
   golden hash covers one file out of a large closure. Deleting the React tree
   shrinks what these gates touch **without turning any of them red**.

---

## How agents are used

- **`frontend` (Fable 5)** — design, judgement, visual work. **Must not** run CI,
  Playwright, benchmarks or any test suite; it names what should run and reports.
  Contrast is computed, never estimated.
- **Main thread** runs every suite, build and browser verification, and reports
  results back for redesign. Recorded in memory as `fable-designs-main-verifies`.
- **`Explore`** for read-only fan-out surveys. Batch independent launches into one
  message.
- **Measure before diagnosing; reproduce by execution.** A bug not made to fire is
  a hypothesis.
- **A better route than a step here is allowed** — provided the invariants hold and
  the deviation is stated plainly rather than done quietly.
