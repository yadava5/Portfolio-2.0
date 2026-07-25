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
| F12 | One project, three names (home surface) | **fixed** | Hero prints the product names the ¶05 `<h3>`s and case-file `<h1>`s carry; slugs survive only in hrefs |
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
| F66 | Scene text renders at ~6–8px on a phone | **CLOSED 2026-07-25 — per-scene authored narrow editions (container-query plate swap); census proof in shots-f66/probe-after.json; min rendered text 11.0px at 390, zero desktop leak** | Desktop voice raised to the label band (12.5→13, 10→11, collision-verified). The phone half cannot be fixed mechanically — see below |
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
