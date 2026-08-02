# CRITIC LEDGER — a hostile review of Portfolio-2.0

**Reviewed:** 2026-07-24 · branch `redesign/daylight-study` @ `3d45701`
**Method:** `NEXT_PUBLIC_BASE_PATH= npm run build` → static export served at `:4321` → Playwright
walks at **1440×900** and **390×844**, motion **on** and **reduced**, plus deep-link,
nav, back/forward, print, focus-order and interaction probes.
**Evidence:** `docs/design-lab/shots-critic/` (109 captures + `probe.json`, `interact.json`,
`verify.json`, two print PDFs).
**Scripts:** `docs/design-lab/shoot-critic.mjs`, `probe-critic.mjs`, `probe-interact.mjs`,
`probe-verify.mjs`, `pdfprobe-critic.mjs`.

**Nothing was fixed. This is a fault ledger.**

Measured baseline: home page **10,560px @ 1440** (11.7 viewports), **12,636px @ 390**
(15.0 viewports); **9,582px** with motion off. 19 distinct *rendered* font sizes
(~32 *declared* in source). **82 faults** below — 6 P0, 40 P1, 36 P2.

---

## Verdict up front

This is a beautifully made object with a **navigation and identity failure at its
centre**. The craft is real — the type, the ink, the thread, the figures are better
than 95% of new-grad portfolios. But the site withholds the two things a recruiter
came for: **who this is** (deferred to 93% scroll) and **how to contact him**
(literally invisible when reached by the site's own "contact" link). Every fault
below is downstream of one rule the paper broke: *the apparatus outranked the reader.*

---

## P0 — CRUSHING (a hiring manager bounces, or the site lies to them)

### F01 · Clicking "contact" lands on a page with no contact information
**Where:** `/` → header nav `contact` → `#gate` (`src/components/layout/Header.tsx:66-71`, `StoryShell.tsx:1370-1420`)
**Evidence:** `shots-critic/verify-nav-contact.png`, `verify.json → navContact`
**Measured:** after clicking `contact` and waiting **3.0s** at 1440×900 (scrollY 8915):
`mailto` link **opacity 0**, `resume` **opacity 0**, `github`/`linkedin` **opacity 0**,
`Email me — I read everything.` **opacity 0** (`y=772`, on screen). The bottom 430px of
the viewport is empty brown paper. One 120px wheel nudge → opacity 1.
The reveal (`data-tm="block"`) is keyed to a scroll trigger that a programmatic
`lenis.scrollTo` never satisfies, so the destination renders as a dead end.
**Fix:** never gate contact affordances on scroll — force `opacity:1` on everything inside
`#gate` below the name, or call `ScrollTrigger.refresh()` + `.progress(1)` on arrival.

### F02 · The page never says who this is or what he wants — until 93% scroll
**Where:** `#arrival` (`StoryShell.tsx:413-472`), role line at `StoryShell.tsx:1361`
**Evidence:** `desk-motion-00-y0.png`, `mob-motion-00-y0.png`, `desk-motion-23-y8887.png`
**Measured:** the document's **only `<h1>` is "Scroll. It's all real."** — no name, no role,
no discipline. "Ayush Yadav" first appears as 13px mono chrome in the header, and as a
heading only at **document y≈9,750 of 10,560 (92.3%)**, as an `<h2>`. The role statement
— *"open to new-grad software, data, and ml engineering roles"* — is **13px lowercase mono,
the smallest type class on the page**, and it **widows the word "roles" onto its own line**.
A recruiter who reads the first frame learns: a name in the chrome, a dare, and seven links.
**Fix (recommended):** name belongs at **both** ends. Put a one-line masthead standfirst
directly under the hero — `Ayush Yadav — software, data & ML engineering · Cincinnati, OH`
in ~19px serif — and keep the giant Fraunces name at the gate as the *reprise*. Do not
move the dare; subordinate it. The masthead of a working paper carries the author's name;
this one doesn't.

### F03 · The ¶04 pin holds ~978px of scroll and develops nothing
**Where:** `#automl` (`StoryShell.tsx:798-934`, `src/components/paper/PipelineRun.tsx`)
**Evidence:** `desk-motion-09-y3478.png` vs `desk-motion-11-y4250.png` (772px apart),
`verify-reduced-automl.png`, `verify.json → reducedAutoml`
**Measured:** motion page height **10,560px**, motion-off **9,582px** → the pin costs
**978px (1.09 viewports)** of the reader's scroll. Across that hold the **left column is
pixel-identical** (thesis headline, one 3-line paragraph, one stat strip, one link — 6
text nodes, `probe.json → pinPayoff`). The entire payoff is: 6 phase labels stepping from
`rgb(92,86,74)` to `rgb(38,35,28)` and one 8px dot travelling ~250px. Fig 4.1 (the registry)
never changes. The ¶04 kicker scrolls off screen, so the held viewport has no chapter
heading at all. **And the reduced-motion build shows the identical end state instantly**
(all six lit, `7.0 deploy` unlit) — proving the animation carries *zero information the
static frame doesn't already have.*
**Fix:** make the hold *say something*, honestly, without inventing numbers. During the
scrub, swap the left column's body copy per phase (7 short lines already exist in
`projectCaseStudies.ts` automl entries — "what the agent decides at 3.0 preprocess", etc.),
and let fig 4.1 **develop**: rows 038→041 write themselves into the registry one per phase,
so the ledger the visitor is asked to approve is *built* in front of them. If that content
can't be sourced honestly, **delete the pin** — 978px of scroll for six colour steps is a
tax, not a payoff.

### F04 · Printing the portfolio loses chapters 06 and 07 completely
**Where:** whole site — `src/app/globals.css` has **zero `@media print` rules** in 2,000 lines
**Evidence:** `shots-critic/verify-print-nobg.pdf` (pages 8–10), `verify-print-bg.pdf`
**Measured:** Cmd+P defaults (backgrounds **off**). Chapters 06/07 text is cream
`rgb(246,239,226)` on a background that doesn't print → **"Make it learn / fast / honest",
fig 6.1, the pledge, "Ayush Yadav", availability, the email address, the resume link, and
the entire references list print as blank white pages.** Page 9 of 10 contains only the
stamp's dashed outline. Additionally the **fixed header and chapter rail print on every
one of the 10 pages**, and on page 8 the header collides with body text
("ayush yadav" struck through "lunch with sam and priya").
**Fix:** add a print stylesheet: force day ink everywhere, `position: static` the header,
`display:none` the rail/thread/light-field, `opacity:1 !important` on all `[data-tm]`,
`break-inside: avoid` on rows.

### F05 · The header nav writes no history — Back leaves the site
**Where:** `Header.tsx:112-134` (`handleNavClick` calls `e.preventDefault()` and never pushes state)
**Evidence:** `interact.json → navTrail`
**Measured:** after clicking `the work` → `experience` → `contact`, the URL is still
`http://localhost:4321/` in all three cases. `history.back()` → **`about:blank`** (out of
the site). `history.forward()` restored scrollY **7025**, not the 8915 it left.
Consequence: **no section of this site is linkable by a reader**, and the browser Back
button — the most-used control on the web — ejects them.
**Fix:** `history.replaceState(null,"",target)` after the Lenis scroll settles (or
`pushState` per nav click), and keep `#hash` in the URL so sections are shareable.

### F06 · Half of the thesis sentence sits at 25% opacity at rest
**Where:** `#who` manifesto (`StoryShell.tsx:579-583`, `TextMotion` `data-tm-words`)
**Evidence:** `desk-motion-02-y773.png`, `interact.json → restInvisible.who`
**Measured:** with `#who` scrolled to the top of the viewport and **2.6s of settle**, the
words `before` (0.27), `I` (0.25), `called` (0.25), `it` (0.25), `done.` (0.25) are still
at quarter opacity. Contrast at 0.25 alpha on `#FAF6EF` ≈ **1.4:1** — a WCAG 1.4.3
failure on *text as displayed*. The sentence a reader stops on reads
*"And how each piece was checked before ▓▓▓▓▓."*
**Fix:** floor the scrub at 0.6 opacity, or make the scrub range end at `center center`
so the line is always complete by the time the chapter is centred.

---

## P1 — SERIOUS (visible damage to credibility or usability)

### F07 · Dead paper before "¶05 the work"
**Where:** end of `#automl` → start of `#work`
**Evidence:** `desk-motion-12-y4637.png`, `desk-motion-13-y5023.png`, `probe.json → deadSpace`
**Measured:** the automatic gap census finds **one gap of 1,016px (y 4072→5088)** in the
unpinned layout — the pin spacer. In the scrolled experience it resolves to **~310px of
empty page** between `read the case file ⟶` (y≈4991) and `Applied` (y≈5413), broken only
by a folio rule and a **hairline `border-t` that lands 90px above the first row title with
nothing attached to it** — an orphan rule.
**Fix:** collapse `#automl`'s `pb-[12vh]` + `mt-[10vh]` + `#work`'s `pt-[7vh]` into one
~10vh seam, and hang the first work row's rule on the row rather than floating it.

### F08 · Mobile gate opens with 440px of nothing
**Where:** `#gate` @ 390×844
**Evidence:** `shots-critic/mob-gate.png`
**Measured:** from the `06 / 07` folio rule (y=195) to the `¶ 07 / 07` kicker (y=637) —
**442px, 52% of the viewport, empty brown**. Below the name, the 400px-tall stamp pushes
`availability` to the fold edge and the email address off screen entirely.
**Fix:** cut `py-[14vh]` to `py-[6vh]` below `lg`, and move the mobile stamp *after* the
contact cluster.

### F09 · Deep link `/#values` lands on the wrong chapter
**Where:** `HashRealign.tsx` / `LenisAnchor` landing
**Evidence:** `probe.json → deepLinks`, `deeplink-values.png`, `verify.json → deepValues`
**Measured:** at **2.2s** after load, `/#values` sat at scrollY 7076 with the target
**1,170px below the viewport top** — the screenshot shows **¶05 / Cadence**, not ¶06.
At 3.5s it corrects to 8021. Every other anchor lands at exactly `top=192`; `#values`
lands at `225` and `#footnote-1` at `96`. A shared link is wrong for over two seconds
and then lurches.
**Fix:** do the hash landing *after* `ScrollTrigger.refresh()` resolves the pin spacer, in
one jump, with one offset constant for all anchors.

### F10 · "skip to the work ↓" does not go to the work
**Where:** `StoryShell.tsx:507-512` (`href="#automl"`) vs `:520` (`href="#work"`)
**Evidence:** `desk-motion-00-y0.png`, `interact.json → mobileHeroBlock`
**Measured:** two links whose labels both contain **"the work"** sit **32px apart** on
mobile (y=619 and y=651) and go to **different chapters** (¶04 automl vs ¶05 the work).
The header nav's "the work" is a third, going to ¶05.
**Fix:** rename to `skip to the capstone ↓`, or point it at `#work`.

### F11 · The hero's three "case files" are not the four the page argues
**Where:** `StoryShell.tsx:489-502` vs `WORK_ROWS` `:172-221`
**Measured:** hero promotes `jobtracker · fast-mnist · visual-assist`. ¶05 shows
`Applied · Glyph · jetpack-compress · Cadence`. **`visual-assist` is marked
`portfolioVisible: false`** and described in-repo as "retired from recruiter-facing lists"
(`projects.ts:210-213`) — yet it holds one of the three prime slots in the first frame
*and* reference #3 in the closing endnotes (`StoryShell.tsx:302`).
**Fix:** the hero trio must be the same three the page argues, in the same order.

### F12 · One project, three names
**Where:** hero / ¶05 / route slugs / `<title>`
**Measured:** `jobtracker` (slug + hero) = **"Applied"** (¶05 + h1); `fast-mnist` (hero) /
`fast-mnist-nn` (slug + endnote) = **"Glyph"** (h1); `taskflow-calendar` (slug) =
**"Cadence"** (¶05 + h1). A reader clicking "the case file" from the **Applied** row lands
on `/projects/jobtracker/` titled *"Applied Case Study"*.
**Fix:** pick one public name per project and use it in every surface; keep the slug as a
silent implementation detail.

### F13 · The chapter rail is seven tab stops with invisible labels
**Where:** `ChapterRail.tsx`, rendered `xl+`
**Evidence:** `probe.json → focusTrail`, `interact.json → restInvisible.*`
**Measured:** all six inactive chapter names are **opacity 0** in every chapter probed —
only the two-digit number paints. The links are **33×18px**, focusable, and their
accessible names concatenate without a separator: **`"01arrival"`, `"03the path"`,
`"05the work"`**. A keyboard user crosses **seven unlabelled 33px targets** between the
header and the first line of content.
**Fix:** show all seven names at low opacity (they're the wayfinding), and put a
separator/`aria-label` on each link (`"Chapter 03 — the path"`).

### F14 · With motion off, the rail claims you've read everything
**Where:** `motion: off` at `#automl`
**Evidence:** `shots-critic/motionoff-automl.png`
**Measured:** the rail shows `01✓ 02✓ 03✓ 04✓(active) 05✓ 06✓ 07✓` while the reader is in
chapter 4. The "visited" mark is a lie in the static world.
**Fix:** derive the ✓ from max-scroll-reached, not from trigger existence.

### F15 · The pin's containment paints boxes that don't exist in the motion world
**Where:** `#automl` figures under `data-motion-off`
**Evidence:** compare `motionoff-automl.png` (hairline rectangles around fig 4.0 and
fig 4.1) with `desk-motion-11-y4250.png` (no rectangles).
**Fix:** the static world must be the same drawing, minus movement — remove the wrapper's
visible edge.

### F16 · The mobile hero is seven 13px links in a 320px stack
**Where:** `#arrival` @ 390
**Evidence:** `mob-motion-00-y0.png`, `interact.json → mobileHeroBlock`, `tapTargets`
**Measured:** `jobtracker` and `fast-mnist` at **y=554 (h=13)**, `visual-assist` at
**y=570** — 16px apart. `the work` / `the evidence` at y=651, `the resume` at y=666.
Sitewide, **43 interactive elements are under 30px tall or 24px wide**; the footnote `¹`
is **8×15px** and the return `↩` is **8×15px**. iOS minimum is 44×44.
**Fix:** below `sm`, collapse the hero to **two** affordances (the capstone, the resume)
at 44px row height, and move the case-file index into ¶05 where it belongs.

### F17 · Fig 6.1 is bottom-aligned into a 600×700px void
**Where:** `#values` (`StoryShell.tsx:1204` `lg:items-end`)
**Evidence:** `desk-motion-21-y8114.png`
**Measured:** the gates ledger starts at y≈733 in a 1250px frame; the entire upper-right
quadrant (x 1230→1770, y 90→700) is empty. The chapter reads as left-hugging with a
figure dropped in the corner — the exact composition problem the code comment claims to
have fixed.
**Fix:** top-align the ledger with the first mantra, or give it the full right column.

### F18 · Chapter pacing is 4:1 out of balance
**Measured** (`probe.json → deadSpace.sections`, 1440×900):
`01 arrival 900px · 02 who 850 · 03 path 1594 · 04 automl 1874 · 05 work 3027 ·
06 values 765 · 07 gate 1384`.
The **manifesto chapter (06) is the shortest thing on the page (0.85 viewport)** while
the work index runs 3.4 viewports with no internal wayfinding. The "day arc" spends 29%
of its length on one chapter and 7% on the one that carries the values.
**Fix:** split ¶05 into two beats with their own kickers, and let ¶06 breathe.

### F19 · The closing page is 44% empty to the right
**Where:** `StoryShell.tsx:1433` (`max-w-[44rem]` inside a 1240px column)
**Evidence:** `desk-motion-25-y9660.png`
**Measured:** the references block ends at x≈950 of 1770 — **~700px of dead right margin**
under the most important content on the page.
**Fix:** two columns of endnotes, or pull the contact cluster alongside them.

### F20 · The approval stamp reads as an empty file-drop target
**Where:** `ApprovedStamp.tsx` / `#gate`
**Evidence:** `desk-motion-23-y8887.png`, `mob-gate.png`, `stamp-before.png`
**Measured:** a **297×206px dashed orange rectangle**, ~90% empty, containing 13px and
11px rotated mono (`run no. 041` / `press here to sign`) in clay on dark brown. The
dashed border is the universal signifier of *drop a file here / content missing*. The
Red Thread's dotted tail terminates in a 6px circle **on top of the dashed border**.
The clay accent appears exactly twice on the whole site.
**Fix:** solid or double rule instead of dashes, tighter box around the text, and land
the thread *inside* the plate, not on its edge.

### F21 · The interactive gate approves a row with no data
**Where:** `RegistryRows.tsx:70-87`, fig 4.1 (`StoryShell.tsx:115-120`)
**Measured:** the visitor is invited to exercise the site's thesis — the human go/no-go —
on run 041, a row showing `041 · xgboost · awaiting approval` with **no metric column at
all** ("metrics withheld"). Its accessible name is **`"awaiting approvalapproved"`**
(no separator). The approval then persists in localStorage forever with no reset.
**Fix:** either show *something* to judge (a withheld-but-shaped placeholder, a
qualitative note), or stop calling it a judgement.

### F22 · Reference #3 cites a project the repo calls retired
**Where:** `StoryShell.tsx:300-303` → `/projects/visual-assist/#v-visual-assist-1`
**Measured:** resolves (no 404), but `projects.ts:213` sets `portfolioVisible: false`.
Four of the six closing references (`visual-assist`, `policybot`, `master-inventory`,
`automl`) point at projects the data layer marks retired and/or private.
**Fix:** the front page's evidence ledger should cite the work the front page argues.

### F23 · No structured data anywhere
**Where:** `src/app/layout.tsx`, `src/lib/seo.ts`
**Measured:** `grep -c 'application/ld+json' out/index.html` → **0**. No `Person`,
no `sameAs` to the GitHub/LinkedIn URLs that already exist in `personal.ts:92-108`.
For a name-query portfolio this is the single largest SEO omission.
**Fix:** emit a `Person` + `WebSite` JSON-LD block from the root layout.

### F24 · `/world-preview/` — a dev bench — ships to production
**Measured:** `HTTP 200`, 6,465px tall, **no `<h1>`**, title *"world preview — day-arc bench"*.
`robots.txt` is `Allow: /`. It is `noindex`ed but publicly reachable and linkable.
**Fix:** exclude the route from the export, or move it behind a build flag.

### F25 · Four case studies have an SVG as their social preview image
**Where:** `src/app/projects/[id]/page.tsx:36,51-52`
**Measured:** jobtracker, visual-assist, master-inventory, policybot all set
`og:image` to `*-architecture.svg`, declared as `1200×630`. **Every major platform
rejects `image/svg+xml` for OG.** The flagship first row shares as a bare link.
**Fix:** render PNG derivatives (the repo already has `scripts/asset-truth/`), or fall
back to `og-image.png`.

### F26 · `/evidence` — the funnel's destination — shares as the homepage
**Where:** `src/app/evidence/page.tsx:22-29` (no `openGraph` block)
**Measured:** `out/evidence/index.html` carries `og:title` = the homepage title,
`og:description` = the homepage description, and **`og:url` = the homepage**.
**Fix:** give it its own OG block.

### F27 · The error page's recovery button leaves the site
**Where:** `src/app/error.tsx:59` — `window.location.href = "/"`
**Measured:** deployed under `basePath: /Portfolio-2.0`, so "Return Home" sends the
reader to `https://yadava5.github.io/` — GitHub's user root, not the portfolio.
**Fix:** `withBasePath("/")` or `router.push("/")`.

---

## P2 — REAL (a careful reader notices; polish debt)

### F28 · Two clocks, one fictional, contradicting each other on one screen
**Measured:** the header running head shows `22:41`, the ¶07 kicker shows `22:41`, and
three lines below, `cincinnati, ohio — 8:40 pm local` shows the reader's real time.
At the top of the page the header says `06:12` and the kicker says `06:12`.
A reader has no way to know which clock is the fiction.
**Fix:** mark the fictional clock as a dateline (`06:12 — the record`), or drop it from
the header and leave it to the ¶ kickers.

### F29 · The gate clock **does** tick — the owner's report is wrong; the real fault is elsewhere
**Where:** `src/components/story/LocalTime.tsx:36`
**Evidence:** `verify.json → clock` (Playwright fake clock)
**Measured:** `9:20 am → 9:22 am (+2m) → 9:32 am (+12m) → 10:32 am (+72m)`. It ticks on a
**30s** interval, so it can be up to 30 seconds stale, and the **prerendered HTML ships
the placeholder `—:—`** (`verify/prerender.hasEmDashClock: true`) — that is what a crawler,
a no-JS reader, and the first paint see.
**Verdict:** *do not kill it, and do not "make it tick" — it already does.* Fix the two
real defects: server-render a plausible time instead of `—:—`, and tighten the interval
to 15s so the minute rollover is never visibly late. Then earn it: put the clock next to
something that uses it (*"8:40 pm local — I read email in the evening"*), otherwise it is
a widget with no argument.

### F30 · "arrival" three times and "06:12" twice in the top 170px
**Evidence:** `desk-motion-00-y0.png`
**Measured:** header running head (`06:12 · arrival`), ¶ kicker
(`¶ 01 / 07 · arrival — … · 06:12`), and the chapter rail (`01 arrival`).
**Fix:** the running head and the kicker say the same sentence — delete one.

### F31 · "cincinnati, ohio" printed twice with different tails
`¶01` dateline: `cincinnati, ohio — summer 2026`. `¶07`: `cincinnati, ohio — 8:40 pm local`.
**Fix:** the location belongs in the masthead standfirst (see F02), once.

### F32 · Type scale bloat — 19 distinct rendered sizes
**Evidence:** `probe.json → typeCensus`
**Measured, at 1440:** `10, 10, 11, 11, 12, 12.5, 13, 13, 13, 15, 16, 18.14, 19, 24, 24,
24, 28.8, 34.56, 38.4, 40, 64, 64, 64, 115.2, 129.6, 129.6` px.
Five distinct sizes live in the 10–13px band alone, and the tokens file only defines
three (`--text-hero`, `--text-chapter`, `--text-body`, `--text-label`). One-offs:
**15px** (the dictionary sense, n=1), **18.14px** (the hero superscript, n=1),
**12.5px** (`globals.css:1822`, scene figure text, n=35), **10px** (`globals.css:1838`,
scene axis labels, n=22).
**Fix:** collapse to five tokens. Nothing below 12px.

### F33 · 10px and 11px mono in a paid-for design system
**Measured:** `10px / +0.4px tracking` (scene tick labels, 20 nodes), `10px / +3px`
(stamp `run no. 041 ·`), `11px / +0.88px lowercase` (the hero's `case files:` line and
the `in a hurry` line — **the two lines a screener is most likely to use**), `11px / +1.5px`
(`press here to sign`).
**Fix:** floor mono at 12px; the hero's quick-path lines deserve 13px.

### F34 · A fourth typeface leaks in
**Measured:** `16px ui-sans-serif` renders the skip link (`typeCensus`), on a page whose
colophon reads *"set in fraunces, newsreader & fragment mono"*.
**Fix:** set the skip link in Fragment Mono.

### F35 · Hierarchy inversion in every bright/muted pair
**Evidence:** `desk-motion-02-y773.png`, `desk-motion-09-y3478.png`
**Measured:** ¶02 bright = **one** 64px Fraunces line; muted = **two** 64px Newsreader
italic lines with swashes. ¶04 bright = two 64px lines; muted = **three** italic lines.
The "muted" line is physically larger, longer, and more decorated than the line it is
subordinate to.
**Fix:** step the muted line down one size (≈0.8×), or shorten the muted copy.

### F36 · Fig 5.1's caption runs ~120 characters in 13px mono
**Evidence:** `desk-motion-16-y6182.png`
**Measured:** *"3.5x — openmp+simd dot kernel vs -O3 baseline (dot 256), committed
benchmarks · avx-512 · avx2 · neon · wasm-simd128"* sets to ~1,400px — roughly 2× the
comfortable mono measure.
**Fix:** cap figure captions at `max-w-[68ch]`.

### F37 · The fast-mnist scene is uninterpretable
**Evidence:** `desk-motion-16-y6182.png`
**Measured:** a dot-matrix `7`, a partial second glyph, and an unlabelled 0–9 checkbox
column with `7` ticked, floating right of the speed chart. The caption
(*"and the forward pass, drawn"*) never explains what the reader is looking at.
**Fix:** label the column (`argmax`) and the glyph (`input · 28×28`), or cut it.

### F38 · The jetpack metric chip breaks a commit sha onto its own line
**Evidence:** `desk-motion-16-y6182.png`
**Measured:** right-aligned as `72 tests, 0 failures — jdk 25 @` / `af2c4b1`. Every other
chip is one line. `line-clamp-2` (`StoryShell.tsx:1056`) will silently **truncate** any
chip that grows.
**Fix:** `whitespace-nowrap` the sha, drop the clamp, cap the column instead.

### F39 · Row affordances are ragged across the four work rows
**Measured:** rows 1/2/4 render `metric · the case file ⟶ · source · demo ↗ · last verified
2026-07` (5 lines). Row 3 (jetpack-compress) renders `metric · the live demo ↗ · source`
(3 lines) — **no case file, no last-verified**. The ledger's right rag is uneven and the
one row without a case file is the one that leaves the site.
**Fix:** give jetpack a case file, or give every row the same three-line grammar.

### F40 · Three identical `the case file ⟶ / source / demo ↗` triplets
**Measured:** `interact.json → tapTargets` — the same three-link cluster repeats verbatim
three times inside 3,027px, with `source` and `demo ↗` **52×15px, 8px apart** on mobile.
**Fix:** one primary act per row; fold source/demo into the case file page.

### F41 · Every link ends in `⟶`
**Measured:** **15 `⟶` glyphs on the home page**, 29 in source. The arrow marks the
case file, the endnotes, the evidence index, the receipts, the audit, and the footer's
next-file link — six different destinations, one glyph. It has stopped carrying
information and become texture.
**Fix:** reserve `⟶` for "deeper into this argument" and `↗` for "leaves the site".

### F42 · The em dash has eaten the site's punctuation
**Measured:** **84 em dashes in the visible text of `out/index.html`**; 900 in source;
`StoryShell.tsx` alone has 148. It stands in for the colon, the comma, the parenthesis
and the period. Every kicker, every caption, every receipt, every metric uses it.
**Fix:** ration it — one per paragraph. Colons and parentheses exist.

### F43 · "receipt" 23 times on a 12-entry page
**Where:** `/evidence`
**Measured:** visible-text counts in `out/evidence/index.html`: `receipt` **23**,
`source` 18, `file` 16. On the home page: `gate` 8 + `gates` 1 + `gated` 6 = **15**,
where "gate" simultaneously means a nav anchor, the contact section, a stamp, a
classifier threshold, a pipeline phase, and a metaphor.
**Fix:** the vocabulary needs four more nouns.

### F44 · `⟶✓` and `✓passed` are set without a space
**Evidence:** `route_evidence_top.png`, `desk-motion-21-y8114.png`
**Measured:** `/evidence` receipts render `receipt 02 ⟶✓` (glyphs touching);
fig 6.1 renders `✓passed` (`gap-x-1` = 4px, visually zero against the check's bounding box).
**Fix:** `gap-x-2`, and a hair space before the `✓` on /evidence.

### F45 · The hero has a ~200px hole in the middle of it
**Evidence:** `desk-motion-00-y0.png`
**Measured:** `It's all real.` baseline ends at y≈700 (of 1250 rendered); the directive
block starts at y≈915. The `my-auto py-10` centring leaves the masthead floating with
nothing under it but a dashed thread.
**Fix:** this is exactly where the F02 standfirst goes.

### F46 · The `n.b.` dashed box is an orphan style
**Evidence:** `desk-motion-02-y773.png`
**Measured:** the only dashed container in the day world (the stamp is the only other
dashed thing on the site, and it's clay, in the dusk). It sits 130px below the dictionary
block it's supposed to be grouped with.
**Fix:** hairline rule + indent, in the apparatus grammar the rest of the page uses.

### F47 · Duplicate social links 400px apart
**Measured:** `github · linkedin · email` in the gate contact cluster, then
`github · linkedin · email` again in the footer. Both are in the same dusk field, ~400px
apart, in the same 13px mono.
**Fix:** the footer keeps the colophon; the gate keeps the links.

### F48 · `© {new Date().getFullYear()}` in a static export, unguarded
**Where:** `src/components/layout/Footer.tsx:16`
**Measured:** rendered client-side without `suppressHydrationWarning`. The prerendered
HTML carries the **build** year; on 1 Jan the client renders a different year and React
logs a hydration mismatch.
**Fix:** `suppressHydrationWarning`, or bake the year at build time.

### F49 · The prerendered HTML ships `—:—` and no `<h1>` text a crawler can use
**Measured:** `verify/prerender` — `hasEmDashClock: true`; the only `<h1>` is
`Scroll. It's all real.`; `jsonLd: 0`; 143KB of HTML.
**Fix:** see F02 + F23 + F29.

### F50 · Sitemap `lastmod` is a hardcoded constant, seven weeks stale
**Where:** `src/app/sitemap.ts:7` — `new Date("2026-06-07")` on **all 9 URLs**, on a site
whose case files claim `verified: 2026-07`.
**Fix:** derive from the case-study `verified` fields.

### F51 · `404.html` carries the homepage title and is indexable
**Measured:** `out/404.html` `<title>` = *"Ayush Yadav | Software, Data, and ML
Engineering"*, inheriting `robots: {index:true}` from the root layout — while
`/world-preview/` (a debug bench) correctly carries `noindex`. The 404 is treated less
carefully than the dev page.
**Fix:** `export const metadata = { title: "Not found", robots: { index: false } }`.

### F52 · Hardcoded seasons and a decaying self-description
**Measured:** `"summer 2026"` hardcoded twice (`StoryShell.tsx:384`, `Header.tsx:217`) —
true for eight more weeks. `"a recent computer-science graduate"` in the meta description
and the ¶02 bio; graduation was **2026-05**, today is **2026-07-24**. Nothing in the build
will ever flag either.
**Fix:** derive the season, and set a review date on "recent".

### F53 · The GPA claim breaks the site's own stated rule
**Where:** `StoryShell.tsx:754` — `3.65 GPA in major coursework (transcript on request)`
**Measured:** hardcoded in JSX; **not** in `proofManifest.ts`, not in `personal.ts`.
`/evidence` states: *"If a claim is not in this ledger or a case file, the site does not
make it."* It makes it. Note also the self-selected denominator ("in major coursework").
Separately, ¶03 prints *"dean's list, spring & fall 2025"* while `personal.ts:134-156`
records **three** awards including Fall 2023.
**Fix:** put it in the ledger or take it off the page.

### F54 · The evidence ledger has a blank row
**Where:** `proofManifest.ts:234-245` → `/evidence` entry **e-11**
**Measured:** `date: null` → renders *"date: not recorded"*; no `receipt` field → renders
*"no case file — the repository is the record"*. The claim is a **bibliography count from
a freshman writing course** for a project the repo hides from recruiters
(`projects.ts:497`). On a 12-row ledger, two rows have no date and two have no receipt.
**Fix:** cut e-11. A padded ledger is worse than a short one.

### F55 · Three "external artifacts" link back into this site
**Where:** `proofManifest.ts:112, 204, 222` → `public/images/...`, `public/proof/*.json`
**Measured:** the manifest's own rule (`:4-6`) says `source` must be *outside this site's
rendering*; `sourceLink()` rewrites `public/` to same-origin, so the `↗` "leaves the site"
glyph resolves to the portfolio. Two more sources are the author's own README.
**Fix:** mark them `[self-authored]` or move them to the repo.

### F56 · The registry the reader is asked to approve has no data column
**Where:** fig 4.1 on `/` and fig 3 on `/projects/automl/`
**Measured:** four rows, three columns (`run · model · status`) — **no accuracy, no F1,
no runtime, no dataset**, on a machine-learning platform. Both surfaces say *"see the
case file"*; the case file says the same thing back.
**Fix:** show a shaped-but-withheld metric column (`f1 ▓▓▓▓ — withheld`) so the reader
can see *what* is being withheld.

### F57 · `[local — verified on request]` legend prints on 7 pages for 2 rows
**Where:** `CaseStudyPage.tsx:441-445` (unconditional)
**Measured:** `local-only` visibility is used **twice** in 2,088 lines of case-study data.
Five of seven case studies print an explanation for a badge that never appears on them.
`/evidence` renders `[public]×9`, `[private-safe]×3`, `[local]×0` — and defines the label
anyway.
**Fix:** render the legend only when the page contains the badge.

### F58 · Two real, named, verifiable recommendations render nowhere
**Where:** `src/lib/data/testimonials.ts` (81 lines) — **zero importers**, zero occurrences
in `out/`. Same for `src/lib/data/skills.ts` (260 lines).
**Measured:** the file contains a ~180-word recommendation from his actual manager with a
LinkedIn URL, and one from his capstone teammate. On a site whose entire thesis is
*"every claim terminates at an artifact outside this site"*, **the only third-party,
externally verifiable evidence he has is the one thing he doesn't show.**
**Fix:** this is the highest-value content change available. Put the manager quote in ¶03.

### F59 · Roughly half of `projects.ts` is written and never rendered
**Measured:** `highlights`, `metrics`, `fullDescription`, `shortDescription`, `category`,
`proofIds`, `status`, `featured`, `startDate`, `endDate` have **zero** non-comment
consumers. `getFeaturedProjects()`, `getPublicProjects()`, `getProjectsByCategory()` have
**zero** call sites — so `portfolioVisible: false` filters nothing. `lifequest` is 37
lines of data with 0 rendered pixels. `getCurrentExperience()` (`experience.ts:139`) can
only ever return `undefined`.
**Fix:** delete the dead fields, or render the metrics — but note `97.01%` appears in
three dead fields while the ledger stamps it **HELD**; rendering them ships a
contradiction.

### F60 · The comment layer out-writes the content layer
**Measured:** comment density — `scenes/manifest.ts` **54%**, `OnFileManifest.tsx` **36%**,
`AuditRun.tsx` **26%**. `HeldStamp.tsx` is 75 lines including a 27-line prose essay on
clay ink and a "≤2 stamps/page skeuomorph budget". `StoryShell.tsx:945` still says
*"three editorial rows"* where there are four; `HeldStamp.tsx:13-17` still promises a
Phase 3 that never shipped.
**Fix:** the design rationale belongs in `docs/`, not in 148 em-dashes of JSDoc.

---

## P1 (continued) — faults found in the engine, verified against the running build

### F61 · The header paints cream over a dusk page — a hard cream bar across the top
**Where:** `globals.css:363-365` (`.site-header-scrolled` steps on `data-arc-chrome`,
`DUSK_CHROME_POS = 0.7775`) vs the field's own dusk ramp
**Evidence:** `shots-critic/desk-motion-20-y7728.png` — **severity P1, looks broken**
**Measured:** at scrollY 7728 the entire page field is tan (`≈#C9AE8F`) while the fixed
header is still `#FAF6EF` cream, with a hard horizontal edge at y=78. The masthead is
deliberately staggered one choreography stop behind the world; at 1440×900 that stagger is
wide enough to read as an unstyled bar, not a beat. It slides back the other way on
scroll-up.
**Fix:** narrow the chrome lag to ≤0.05 of the dusk range, or cross-fade the header's
background from the same `--arc-l` the field uses.

### F62 · The ¶05 → ¶06 seam is a 690px void — bigger than the one the owner flagged
**Evidence:** `desk-motion-20-y7728.png`
**Measured:** the `05 / 07` folio rule sits at y≈556 (of 1250 rendered); the
`¶ 06 / 07` kicker at y≈818; nothing else paints to the bottom of the frame.
**~690px — 0.77 of a viewport — of empty tan paper**, at the moment the day is supposed
to be turning. The reader's reward for finishing the work index is three-quarters of a
blank screen.
**Fix:** `#work pb-[12vh] + mt-[10vh]` and `#values pt-[7vh]` stack to 29vh of pure
padding; halve it and let the dusk flip land on content.

### F63 · The Red Thread jumps 97px sideways at exactly 1280px
**Where:** `src/components/thread/constants.ts:76-81`
**Evidence:** `shots-critic/thread-1279.png`, `thread-1280.png`, `probe-css-claims` output
**Measured:** chapter-03 spine path starts at **x = 534.0** at `vw=1279` and **x = 630.8**
at `vw=1280` — a **96.8px lateral snap on one pixel of window width**, with a
`ResizeObserver` rebuild firing on every frame of the drag. (The agent's larger
"teleports across the screen" claim did **not** reproduce; 97px did.)
**Fix:** interpolate `spineX` across a 1200–1360 band instead of switching on `>= 1280`.

### F64 · The design system's flagship type token is dead, and three hand-rolled clamps disagree with it
**Where:** `globals.css:49-52` (`--text-hero`, zero consumers) vs `StoryShell.tsx:415`
(`clamp(3.375rem,9vw,9rem)`) vs `StoryShell.tsx:1339` (`clamp(3rem,8vw,8.5rem)`)
**Measured:** three "hero" sizes, three vw slopes (8 / 8.5 / 9), three caps (120/136/144px);
both shipping elements also re-declare `tracking-[-0.015em]` while the token says `-0.02em`.
`--text-chapter` has the same problem: `evidence/page.tsx:78` and
`CaseStudyPage.tsx:208` each hand-roll a near-duplicate.
A stylesheet whose header reads *"Source of truth … do not eyeball-adjust"* has an
eyeballed headline scale.
**Fix:** use the tokens, or delete them.

### F65 · The label token documents a 12px floor and breaks it five times
**Where:** `globals.css:59` — `--text-label: 0.8125rem; /* 13px — mono labels 12–14px */`
**Measured:** `text-[0.6875rem]` (11px) at `StoryShell.tsx:489, 504, 518, 1129` and
`.registry-mark` (`globals.css:1363`) — including the design system's own component.
**Fix:** honour the stated floor.

### F66 · Scene text renders at ~6–8px on a phone
**Where:** `globals.css:1822` (`.scene-fig text: 12.5px`), `:1838` (`.sc-small: 10px`)
**Measured:** every scene SVG is `viewBox="0 0 512 …"` at `w-full max-w-[512px]`. On a
390px phone the plate is ~310px → **scale 0.605** → `.scene-fig text` renders **≈7.6px**
and `.sc-small` **≈6.1px**, with `.sc-quiet` multiplying by a further `opacity: 0.72`.
The figures are the argument on mobile; their labels are unreadable.
**Fix:** scale figure type with a `vw`-aware `font-size`, or set a `min` in px.

### F67 · The site's signature act renders at ~6.3px on a phone — through a displacement filter
**Where:** `ApprovedStamp.tsx:141-143` (`w-[min(190px,52vw)]` on `viewBox="0 0 300 190"`),
`:170` (`feDisplacementMap scale="1.3"`), `:215`, `:274`
**Measured:** mobile scale **0.633** →
`press here to sign` **6.96px**, `run no. 041` **8.2px**, and the visitor's own approval
date **6.3px** — then passed through a 1.3-unit displacement, i.e. **~13% distortion of a
10-unit glyph**. Desktop is 9.3px. See also `HeldStamp.tsx:63` (`fontSize="9"` → 7.6px) and
`CaseStudyPage.tsx:132` (`fontSize="10"` → 8.4px).
**Fix:** raise the stamp's mobile width, or authoring sizes, so nothing lands under 11px.

### F68 · `scrollEasing` and `SCROLL_DURATION` are dead — the "1.2s expo-out" is a native smooth scroll
**Where:** `SmoothScroll.tsx:51-52, 91-98, 326-343`
**Measured:** `ScrollController.scrollTo` declares `opts?: {offset, duration, easing}` and
**never destructures `opts`** — the body hardcodes `behavior: "smooth"`. Both call sites
(`LenisAnchor.tsx:40-44`, `Header.tsx:119-123`) pass all three and all three are dropped.
The type signature is a lie, and `suppressSampling(SCROLL_DURATION*1000 + 600)`
(`:341`) blinds the frame governor for 1.8s using a duration that no longer describes
anything.
**Fix:** delete the dead options, or implement them.

### F69 · Four contradictory beliefs about the header's height
**Measured:** `scroll-padding-top: 6rem` (96px, `globals.css:1959`);
`section[id] { scroll-margin-top: 6rem }` (96px, `:1971`);
`[id^="fig-"]`/`li[id^="v-"] { scroll-margin-top: 7rem }` (**112px**, `:1563, :1954`);
`SCROLL_OFFSET = -96` (`SmoothScroll.tsx:55`);
`PIN_TOP_MIN = 72 /* header ~56px */` (`PipelineRun.tsx:92`);
and a `bottom > 120` hit test (`SmoothScroll.tsx:235`).
Measured header height at 1440: **56px**. A figure anchor reached by clicking lands
**16px off** from the same anchor reached by a hash. This is the root cause of F09.
**Fix:** one exported constant, imported by CSS via a custom property.

### F70 · Every reduced-motion rule is written twice, verbatim
**Where:** `globals.css:740-766` vs `767-788`; `1031-1049` vs `1054-1070`;
`1570-1583` vs `1584-1595`; `1695-1707` vs `1708-1718`
**Measured:** the `prefers-reduced-motion: reduce` block and the `[data-motion-off]` block
are duplicate copies. Roughly **14 hand-written copies** of the same gate across the file.
The next edit will land in one copy.
**Fix:** `:where(html[data-motion-off], ...)` once, or a `@custom-media` alias.

### F71 · The Red Thread and the pipeline overlay do not exist without JS — contradicting their own docs
**Where:** `ThreadSegment.tsx:31-33, 205, 328`; `PipelineRun.tsx:26-31, 354-358`
**Measured:** both components render an **empty / zero-sized `<svg>`** until a measurement
effect + `ResizeObserver` populates `geometry`. `ThreadSegment` header claims the static
world *"holds with zero engine (and zero JS-timing) dependence"*; `PipelineRun` claims
static worlds *"render the finished FRAME."* Neither is true. ~54 lines of static-world CSS
(`globals.css:735-788`, `1695-1718`) target selectors with nothing to match.
**Fix:** SSR a default geometry, or stop asserting the opposite in the file header.

### F72 · A governor downshift mid-scrub leaves fig 4.0 asserting something false
**Where:** `PipelineRun.tsx:266` (raw `classList.toggle("is-halted")` outside the
`gsap.context`) vs `:273, :336` (`gsap.set` inside it, reverted by `ctx.revert()`)
**Measured:** on downshift the bead **snaps back to phase 1** while
`html[data-motion-off] .pipeline-edge { stroke-dashoffset: 0 !important }`
(`globals.css:1708`) draws the rail all the way to the gate and `:1715` paints the bead
clay. Result: a fully-drawn pipeline with the "halted" marker parked at `1.0 ingest`.
**Fix:** move the halted class inside the context, or clear it in the revert path.

### F73 · A single GC pause can strand the whole tab in the print tier, permanently
**Where:** `governor.ts:147-154, 201, 384`
**Measured:** `setTier(cap ?? (everDownshifted ? "print" : "core"))`, where
`everDownshifted` is module state that is never reset and `persistCap("print")` writes a
sessionStorage floor. Four slow frames during one scroll demote **every page in the tab**
to the static edition for the rest of the session, with no indication and no way back.
**Fix:** decay the cap, or expire it after N seconds of smooth frames.

### F74 · A test harness ships in the production bundle
**Where:** `governor.ts:406-450` — `window.__frameGovernor` with `injectFrame()`,
`injectLongTask()`, `pause()`, installed unconditionally on every load.
**Measured:** any script can force the page to the `print` tier with four
`injectFrame(200)` calls.
**Fix:** gate on `process.env.NODE_ENV !== "production"`.

### F75 · Motion readers see a *lighter* headline than static readers, at rest
**Where:** `TextMotion.tsx:401-407` vs `globals.css:901-914`
**Measured:** static → `var(--tm-wght, 420)` always. Motion → `360 + 60·sin(π·p)`, so 360
at the viewport edges and 420 only at dead centre. The end state is **not** the static
state — the A7 principle the codebase restates twenty times.
Worse, `TextMotion.tsx:48` claims *"No layout property is ever animated"* while writing
`wght` into `font-variation-settings` every frame — **`wght` changes glyph advance widths
in Fraunces.** There is no quantization guard, and `apparatus.tsx:187` puts `data-breathe`
on most headlines, so several run simultaneously.
**Fix:** quantize to 3 steps, or drop the breathing.

### F76 · Chapter content flashes visible → hidden → re-entering on slow font loads
**Where:** `TextMotion.tsx:305, 327-330`
**Measured:** all `gsap.from()` calls sit inside `document.fonts.ready.then(...)`, and the
`data-motion-ready` CSS pre-hide (`globals.css:794-801`) covers **only the hero**. Between
first paint and fonts-ready, chapter reveal targets render at natural opacity; the effect
then snaps them to `opacity: 0, y: 16`.
**Fix:** extend the CSS pre-hide to `[data-tm]`.

### F77 · The ¶04 pin ends with ~19vh of frozen screen
**Where:** `PipelineRun.tsx:69, 81` — `PIN_VH = 1.05`, `TRAVEL_END = 0.82`
**Measured:** the token travels 82% of the pinned range; the remaining **18% ≈ 19vh ≈ 170px
of scroll moves nothing at all.** The comment calls it "the pipeline waiting"; on a
trackpad it reads as a hang. This is the tail of F03 and the reason the pin *feels* worse
than its numbers.
**Fix:** end the pin where the travel ends.

### F78 · A fourth mantra would play first
**Where:** `TextMotion.tsx:103, 365` — `LITANY_DELAYS = [0.12, 0.32, 0.62]`,
`LITANY_DELAYS[index] ?? 0`
**Measured:** a 4th `VALUES_LINES` entry gets delay `0` and therefore plays **ahead** of
the three deliberately-slowed lines, silently inverting the chapter's signature
choreography. The closing litany also takes **~1.6s** to finish, the slowest beat on
the page.
**Fix:** derive the delay (`0.12 + 0.2·index`) instead of indexing a magic array.

### F79 · `.thread-dip` is computed for everyone and painted for almost nobody
**Where:** `globals.css:676-684, 754-756, 777-779`; `geometry.ts:688-692`;
`ThreadSegment.tsx:345-347`
**Measured:** `display: none` by default, `inline` only under reduced motion.
`dipRun()` + `catmullRomPath()` run on every chapter-05 re-measure to produce a path the
majority world never shows, and it ships in the DOM regardless.
**Fix:** compute it behind the same gate that displays it.

### F80 · Three "authored editions" that are one edition
**Where:** `governor.ts:48-49` (`full` / `core` / `print`), `globals.css:1087-1096`
**Measured:** `[data-tier-garnish]` has **zero consumers** (the comment says so outright),
so `full` and `core` render identically. The `print` tier's *only* dressing is a
`currentColor 22%` outline on captioned figures — in chapters 06/07 that composites to
**1.87:1**, i.e. invisible. Also dead: `--text-hero`, `--font-sans`, `--color-pass`,
`--color-fail`, `--color-surface-2`, `.no-scrollbar`.
**Fix:** delete two of the three tiers until there is a reason for them.

### F81 · Five suppressions of one lint rule, all in the motion plumbing
**Where:** `SmoothScroll.tsx:196, 376`; `usePrefersReducedMotion.ts:63`;
`useActiveChapter.ts:51`; `FileMemory.tsx:47` — all
`react-hooks/set-state-in-effect`.
**Measured:** five suppressions of the same rule is not five exceptions; it is an
architecture fighting the framework.
**Fix:** move the preference reads to `useSyncExternalStore`.

### F82 · Load-bearing comments that are measurably false
A reviewer who trusts this file's own documentation will ship the bug. Verified false:
`LightField.tsx:5-13` ("four layers" — renders three); `ThreadSegment.tsx:31-33`
("zero JS dependence" — F71); `PipelineRun.tsx:26-31` ("finished frame" — F71);
`TextMotion.tsx:48` ("no layout property" — F75); `constants.ts:45` ("rail ends by ~113px"
— measures ~140px, so `RAIL_CLEARANCE = 136` puts the thread through the active label at
1280–1340px); `apparatus.tsx:88-90` ("hairlines run at 70% ink" — they compose to 49%);
`StoryShell.tsx:945` ("three editorial rows" — four); `ApprovedStamp.tsx:14` ("~600ms" —
750ms); `HeldStamp.tsx:13-17` (promises a Phase 3 that never shipped).
**Fix:** delete the assertions or add tests that hold them.

**Credit where due:** zero `TODO`/`FIXME`/`HACK`/`@ts-ignore` and no commented-out code
anywhere in `src/`. The discipline is real. It is aimed at the wrong target.

---

## The five changes that would actually move the needle

1. **F01** — unhide the contact cluster. One line of CSS. Nothing else on this list
   matters if "contact" leads to a page with no contact.
2. **F02** — a one-line standfirst under the hero: name, discipline, city.
   The dare survives; the reader stops guessing.
3. **F05** — push the hash on nav click. Back button, shareable sections, both free.
4. **F03** — give the ¶04 hold something to develop, or delete the pin. 978px is a
   promise; six colour steps is not payment.
5. **F58** — render the manager's recommendation. It is the only evidence on this site
   that the site did not write about itself.

---

## Where the owner's own report needs correcting

| Owner's claim | Verdict | Evidence |
|---|---|---|
| No identity at the top | **Confirmed, worse than stated** — the *role* is 13px mono at 93% scroll | F02 |
| ¶04 pin has nothing for the phases | **Confirmed and quantified** — 978px held, left column pixel-identical, reduced-motion shows the same end state instantly | F03 |
| Blank space before ¶05 | **Confirmed** — 1,016px gap in the unpinned layout, ~310px in the scrolled experience, plus an orphan hairline | F07 |
| The "8:25 local" clock never ticks | **Not confirmed — it ticks.** Fake-clock probe: 9:20 → 9:22 → 9:32 → 10:32 am. The real faults are the 30s interval, the `—:—` prerender, and the fictional 22:41 clock sitting three lines above it | F28, F29 |


---

# WAVE2-STATUS — the home-page P1/P2 sweep

**Appended to `CRITIC-LEDGER.md`.** Branch `redesign/daylight-study` @ `f8d7370`
(origin/main after PR #7) → this worktree. Wave 1 shipped the P0s
(F01/F02/F03/F05/F06 + F61/F62/F07 + the clock). Wave 2 takes every remaining
fault whose surface is the HOME page.

**Method:** each fix probed against the live static export
(`NEXT_PUBLIC_BASE_PATH= npm run build` → `out/` served on :3251) with
Playwright. Before/after captures and probe JSON in `docs/design-lab/shots-wave2/`
(`shoot-wave2.mjs`, plus per-fault probes for scene text, stamp geometry, the
registry columns, the rail, composition, stranded content and widows).

**Verification at close:** build clean · `eslint` clean · `tsc --noEmit` clean ·
contrast gate passed · Playwright — chromium-desktop 118 (atlas, text-motion,
red-thread, pipeline-run, reduced-motion, performance-budget, scroll-engine,
paper-memory, nav-and-images, a11y-audit), chromium-mobile 48 (atlas),
firefox-desktop 5 (scroll-engine).

---

## Coverage

| # | Fault (short) | Status | Note |
|---|---|---|---|
| F08 | Mobile gate opens with 440px of nothing | **fixed** | `py-[6vh] lg:py-[14vh]`; stamp moved below the contact cluster. Top padding 118px → 51px; the CTA moves from y=880 (below an 844 fold) to y=534 |
| F10 | "skip to the work ↓" does not go to the work | **fixed** | The duplicate affordance is deleted; the capstone line and the `in a hurry` line already carry both paths |
| F11 | Hero's three case files are not the ones argued | **fixed** | `Applied · Glyph · Cadence`, in ¶05 order; all nine hero hrefs verified alive |
| F12 | One project, three names (home surface) | **re-opened 2026-08-02, then fixed** | The note below said "slugs survive only in hrefs". They did not. The provenance audit found retired names in rendered TEXT on `/evidence` (`jobtracker case file · receipt 02/04/05`, and "the public fast-mnist-nn repository" in verification prose) and on two case files, where the built pages printed `taskflow-calendar @ 69a59e7` **18 times** and `fast-mnist-nn @ c6e5c0b` three — while each file's own corrections register told the reader those labels had already been changed. Fixed on the home surface as recorded; **the fix was never carried to `/evidence` or the receipt labels**, and marking it closed is what stopped anyone looking. Both case files now carry an erratum. Still open: `public/images/projects/fast-mnist-nn.svg` draws "Fast MNIST NN" at 48px inside the image, where no grep of `src/` can reach it |
| F13 | Rail is seven tab stops with invisible labels | **fixed** | All seven names rest visible (5.62:1 at the link's existing 0.7). The a11y half was already closed — `aria-label="chapter NN — name"` |
| F14 | Motion off, the rail claims you've read everything | **fixed** | Static world earns marks via a monotone IntersectionObserver; both worlds now read identically at every scroll position |
| F17 | Fig 6.1 bottom-aligned into a 600×700 void | **fixed** | `lg:items-end` → `lg:items-start`; both ¶06 figures start at top=150 |
| F19 | Closing page 44% empty to the right | **fixed** | `max-w-[44rem]` dropped, endnotes set two columns at lg across the full 1032px |
| F20 | Approval stamp reads as a file-drop target | **fixed** | Dashed frame → the paper's double rule, reusing the inked layer's existing `INNER_FRAME_D`. `FRAME_D` byte-for-byte untouched (thread contract) |
| F21 | Interactive gate approves a row with no data | **fixed** | Metric column added (see F56). The accessible-name half was already closed by the button's `aria-label` |
| F22 | Reference #3 cites a project the repo calls retired | **fixed** | visual-assist endnote replaced by the two ¶05 rows the endnotes were missing (Cadence, jetpack) |
| F30 | "arrival" ×3 and "06:12" ×2 in the top 170px | **fixed** | Running head drops the dateline, keeps the day glyph; sr-only sentence retains full state |
| F31 | "cincinnati, ohio" printed twice | **fixed (Wave 1)** | The ¶01 dateline's city moved to the standfirst. Two mentions remain ~9,000px apart — masthead and colophon — which is the intended single-per-register reading |
| F33 | 10px and 11px mono in a paid-for design system | **fixed** | Hero quick-path lines and the `last verified` chip inherit the 13px label token; 11px HTML nodes 16 → 4, and the 4 are SVG (see F67) |
| F34 | A fourth typeface leaks in | **fixed** | Skip link set in Fragment Mono at the label token |
| F35 | Hierarchy inversion in every bright/muted pair | **fixed** | Muted line takes `calc(var(--text-chapter)*0.82)`; 64px → 52.48px in ¶02/¶03/¶04 |
| F36 | Fig 5.1's caption runs ~120 characters | **fixed** | `max-w-[68ch]` on the scene figcaption |
| F38 | Jetpack chip breaks a commit sha onto its own line | **fixed** | Non-breaking space binds `@ af2c4b1`; `line-clamp-2` (a silent truncation) removed |
| F39 | Row affordances ragged across the four rows | **fixed** | `last verified` on every row, the fourth sourced from the `jetpack-tests` manifest entry. Rag 5/5/3/5 → 3/3/4/3 |
| F40 | Three identical case-file/source/demo triplets | **fixed** | Secondary line survives only where no case file exists to fold it into |
| F41 | Every link ends in ⟶ | **fixed** | ⟶ = deeper into the argument, ↗ = leaves the site. Two separator misuses removed; the external endnote marked ↗. 15 → 13 |
| F44 | `✓passed` set without a space | **fixed (home half)** | fig 6.1 `gap-x-1` → `gap-x-2`. The `/evidence` half is Wave 3 |
| F45 | The hero has a ~200px hole in the middle | **fixed (Wave 1)** | The F02 standfirst lands exactly there; verified in `after-desk-hero.png` |
| F46 | The `n.b.` dashed box is an orphan style | **fixed** | Hairline rule + indent in the house apparatus grammar; reseated under the dictionary entry it annotates |
| F47 | Duplicate social links 400px apart | **fixed** | Gate keeps the links, footer keeps the colophon |
| F48 | `© new Date().getFullYear()` unguarded | **fixed** | Baked at module scope — a colophon date is the year the edition was set |
| F53 | The GPA claim breaks the site's own stated rule | **fixed** | Claim removed (it cannot enter the manifest — a transcript on request is not a public artifact). Dean's List count now derived from `getDeansListCount()`, so "spring & fall 2025" can no longer contradict the three awards on record |
| F56 | The registry has no data column | **fixed** | Drawn, labelled and redacted (`▓▓`), with the caption carrying the case file's own two reasons. Deliberately **not** the ledger's suggested `f1 ▓▓▓▓` — see "Spec edits" below |
| F64 | The flagship type token is dead | **fixed** | `--text-hero` live + `--text-hero-reprise`; both headline elements consume them; zero rendered-pixel change |
| F65 | The label token's 12px floor broken five times | **fixed** | Four StoryShell overrides deleted (they overrode an inherited `.label-mono`); `.registry-mark` 11px → 12px |
| F67 | The signature act renders at ~6.3px on a phone | **fixed** | Both stamp seats render the plate 1:1; smallest line 9.3px → 11px at every width ≥390 (10.33px at 320) |
| F75 | Motion readers see a lighter headline at rest | **fixed** | Breath floor 360 → 396, span 60 → 24, quantized to 4 buckets with a skip guard (`wght` moves glyph advance widths) |
| F76 | Chapter content flashes on slow font loads | **fixed** | Pre-hide extended to `[data-tm*]` behind its own `data-tm-prehide` gate — see "Spec edits" |
| F78 | A fourth mantra would play first | **fixed** | `litanyDelay(i)` derived; reproduces 0.12/0.32/0.62 exactly for the three that ship |
| F02 note | Small-type widows (the availability line) | **fixed** | `text-wrap: pretty` on `.label-mono`; "roles" no longer sits alone |
| — | Jetpack scene caption clipped by its viewBox | **fixed (bonus)** | Pre-existing at every width; found by the F66 probe. Right-anchored on the rail's terminus |
| F32 | Type scale bloat — 19 distinct rendered sizes | **partial** | Painted set improved: the sans leak, four 11px overrides, the 12.5px figure voice and the 10px tick voice are gone. Remaining one-offs are the 15px dictionary gloss (n=1), the 18.14px hero superscript (n=1), and the SVG band under F66. A true five-token collapse is a design decision, not a mechanical edit |
| F42 | The em dash has eaten the site's punctuation | **partial / wave-3** | 81 → 82 in visible text (the two new honest endnote claims each carry one). Rationing to "one per paragraph" is a full copy rewrite across every kicker, caption and receipt, and several are asserted verbatim by specs. Content decision — flagged for Wave 3 |
| F43 | Vocabulary overload ("gate" ×15 on home) | **wontfix here** | The home half needs four more nouns — a copy decision, not a fix. `gate` still measures 15. Wave 3 |
| F66 | Scene text renders at ~6–8px on a phone | **PARTIAL + ESCALATE-FABLE** | Desktop voice raised to the label band (12.5→13, 10→11, collision-verified). The phone half cannot be fixed mechanically — see below |
| F09 | Deep link `/#values` lands on the wrong chapter | **not attempted** | Wave 1 rewrote the landing contract (`arrival.ts`, `HashRealign`, `LenisAnchor`, `Header`) and `scroll-engine` covers it. Re-probing and re-deriving F69's offset constant on top of that work needs a dedicated pass |
| F16 | Mobile hero is seven 13px links in a 320px stack | **partial** | One link removed (F10) and the type raised to 13px (F33). The "collapse to two affordances at 44px row height" half is a mobile-layout redesign — Wave 3 with F58 |
| F18 | Chapter pacing is 4:1 out of balance | **not attempted** | "Split ¶05 into two beats with their own kickers" adds chapters to a seven-chapter contract wired through `chapters.ts`, the rail, the day-arc waypoints and the thread. Structural |
| F63 | Red Thread jumps 97px sideways at 1280px | **not attempted** | Thread geometry; interacts with F82's `RAIL_CLEARANCE` finding, which the F13 label change makes newly relevant |
| F68/F69/F70/F71/F72/F73/F79/F80/F81/F82 | Engine + code-truth faults | **not attempted** | Engine plumbing and comment-truth debt, no direct home-page reader surface |
| F74 | Test harness ships in the production bundle | **skipped, with reason** | The fix (`NODE_ENV !== "production"`) would disable `window.__frameGovernor` in the very build `frame-governor.spec.ts` exercises — the e2e scripts run `next build`. Doing it right needs a `NEXT_PUBLIC_TEST_PROBES` flag threaded through `package.json` and `playwright.config.ts` — shared build infra, outside this wave's home-page remit |
| F58 | Two real recommendations render nowhere | **wave-3 (by instruction)** | Part A is not home-scoped without building a testimonials section, which this wave was told not to do |
| F04, F23–F27, F49–F52, F54, F55, F57, F59, F60 | print CSS · SEO/OG · /evidence · /projects/* · 404 · dead data | **out of scope** | Wave 3 |

---

## Spec edits, and why they were justified

**F56 — the redaction is `▓▓`, not the ledger's `f1 ▓▓▓▓`.**
The ledger asks for "a shaped-but-withheld metric column (`f1 ▓▓▓▓ — withheld`)".
Naming `f1` would have been an invented number. The automl case file states, in
its own words, that *"a demo-data run ledger with a complete metric trail has
not shipped yet"* — so there may be no per-run f1 to withhold. A shaped `f1`
would assert one exists and is merely hidden. The column now says only what is
true: a metric column exists, and its contents are not published; the figcaption
carries both of the case file's reasons (private repository **and** the metric
trail not shipped). Constraints law: honest frames, no invented numbers.

**F76 — the pre-hide needed its own attribute, not `data-motion-ready`.**
The ledger's fix line is "extend the CSS pre-hide to `[data-tm]`". Implemented
literally, it breaks the page: `gsap.from()` captures an element's *current
computed style* as its END state, so every tween built while the pre-hide still
matched animates 0 → 0. Probed with the literal fix in place: **43 elements
stranded permanently invisible.** The shipped fix keeps the pre-hide but gates it
on `data-tm-prehide`, which TextMotion removes one statement before it builds any
tween. Verified: engine and reduced-motion worlds now report an identical set of
7 low-opacity nodes, all of them legitimate `opacity-70` design mutes.

**F14 — the static rail is monotone; the engine rail still retreats.**
The engine scrubs a timeline and can honestly un-tick a chapter on scroll-back.
A static reader has no timeline: a chapter passed is passed. Two specs that
asserted the old always-lit behaviour were rewritten, because they encoded the
fault the ledger names.

**F47 — one atlas assertion inverted.** The identity test *required* the footer to
repeat LinkedIn. It now requires the opposite, with the gate's assertions intact.

**F53 — the GPA came off rather than into the ledger.** `proofManifest.ts:4-6`
requires a source that resolves outside this site's rendering; "transcript on
request" is not one. The ledger offered both options and only one was available.

---

## ESCALATE-FABLE

### F66 (phone half) — the scene figures need a redraw, not a size
Every scene plate is `w-full max-w-[VBW]` over a `0 0 VBW …` viewBox, so its
scale is exactly `min(1, column ÷ VBW)` and SVG text shrinks with the viewBox
transform. At 390 the story column measures 330px → scale 0.645. Desktop is now
13px, so the phone renders 8.38px.

Compensating the authored size upward was **built, measured and reverted**. To
land 12px rendered at 390 the authored size must be ~20 units, and at that size:
four labels in the Applied plate overflow the 512-unit viewBox, the Glyph
benchmark caption overflows, and the Cadence plate collides in 13 places. The
measured ceiling before the Applied plate starts clipping is ~13.4 authored units
— which buys 8.6px at 390, against 8.38px today. The coordinates are hand-placed
for the old sizes and no uniform enlargement respects them.

Two real options, both design decisions:
1. **Redraw the plates for the phone** — fewer, shorter labels at a mobile
   viewBox, per scene.
2. **Hold the plates at 1:1 inside a horizontally scrollable figure** below
   572px. Cheap and mechanical, but it changes the mobile reading model and
   interacts with the Lenis touch loop and the row boxes the Red Thread
   measures — worth a deliberate call, not a drive-by.

The probe that decides it is written and reusable: it reports every scene text
node's rendered size, viewBox overflow and pairwise collision at any viewport.

---

## Evidence

- `docs/design-lab/shoot-wave2.mjs` — the wave harness (`before` / `after` tags)
- `docs/design-lab/shots-wave2/` — 26 captures per tag (desktop walk, mobile
  walk, static world) + `probe-{before,after}.json`

Measured deltas, home page, 1440×900 unless noted:

| Metric | Before | After |
|---|---|---|
| Distinct rendered (size × family) pairs | 20 | 18 |
| 11px Fragment Mono nodes (HTML) | 16 | 4 (all SVG stamp text) |
| Sub-12px painted HTML text | yes | none |
| Scene viewBox overflows (all plates, 8 widths) | 1 | 0 |
| Stamp's smallest line @390 | 6.6px | 11px |
| Stamp's smallest line @1440 | 9.3px | 11px |
| `⟶` in visible text | 15 | 13 |
| "arrival" in visible text | 4 | 3 |
| Stranded (invisible) `[data-tm*]` after a full pass | n/a | 0 |
| Gate: contact CTA offset @390×844 | y=880 (below fold) | y=534 |
| ¶06 figure tops | 150 / 733 | 150 / 150 |
| Rail marks at top, motion off | `✓✓✓✓✓✓✓` | `·······` |
