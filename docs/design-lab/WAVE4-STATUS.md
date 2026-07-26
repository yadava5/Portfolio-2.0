# WAVE4-STATUS — the engine pass, and the campaign's closing ledger

**Appended to `CRITIC-LEDGER.md`, after `WAVE2-STATUS.md` and
`WAVE3-STATUS.md`.** Branch `redesign/daylight-study` @ `452255a`
(origin/main after PR #9) → this worktree.

Wave 1 shipped the home P0s, Wave 2 the home P1/P2s, Wave 3 the
subpages, print and SEO. Wave 4 takes the ENGINE — the scroll
controller, the landing contract, the frame governor, the Red Thread's
geometry, the static-world gates — plus the four home remainders the
earlier waves routed onward, and it closes the campaign: **every fault
F01–F82 has a terminal status in the table below.**

**Method:** every fault re-probed against the live static export
(`NEXT_PUBLIC_BASE_PATH= npm run build` → `out/` on :3200) BEFORE it was
touched, because Waves 1–3 moved the ground under most of these rows.
Three of the ledger's engine faults did not survive that re-probe, and
three more were partly wrong; they are corrected below with
measurements rather than quietly re-filed.

Eight probes, all reusable, all in `docs/design-lab/`:

| Probe | What it decides |
|---|---|
| `probe-w4eng.mjs` | header height, deep-link landings over 5s, the spine across 1280, the pin's tail, the no-JS DOM, the dip, the tiers |
| `probe-w4land.mjs` | F69 — the landing offset on every path a reader can take (native, engine, focus) |
| `probe-w4rail.mjs` | F63/F82 — the chapter rail's real right edge |
| `probe-w4halt.mjs` | F72 — the halt marker across three re-measure paths |
| `probe-w4gov.mjs` | F72/F73 — a real governor downshift, driven through the frame probe |
| `probe-w4tier.mjs` | F80 — the print edition's outline contrast, per chapter |
| `probe-w4gates.mjs` | F70 — every gated property in all four worlds, before vs after |
| `probe-w4claims.mjs` | F82 — the load-bearing comments, measured |
| `probe-w4copy.mjs` | F16/F18/F32/F42/F43 — pacing, type census, vocabulary, mobile hit boxes |

**Verification at close:** build clean · `tsc --noEmit` clean · `eslint`
clean · `prettier --check` clean on every file touched · contrast gate
passed · proof-manifest gate passed · asset-budget gate passed ·
Playwright **chromium-desktop 179 passed / 2 skipped** (atlas,
a11y-audit, interactions, nav-and-images, comprehensive-qa, text-motion,
dossier, paper-memory, day-arc, red-thread, reduced-motion,
scroll-engine, pipeline-run), **chromium-mobile 48 passed** (atlas),
**firefox-desktop 5 passed** (scroll-engine), **probes build 23 passed /
1 skipped** (frame-governor, all three projects). `__frameGovernor`
occurrences in the deploy bundle: **0**.

---

## Disposition — every ledger fault, F01–F82

Terminal statuses: **fixed@wN** · **wontfix** · **design-call** ·
**not-a-defect** · **partial**. `w1`/`w2`/`w3` cite the earlier status
docs; `w4` is this wave; **`@cert`** is the certification-response round
below. Rows marked **†** carry a correction to the ledger's own claim,
detailed after the table. Rows marked **‡** were re-labelled by the
CERTIFICATION-RESPONSE round at the end of this document — five rows
where this table claimed more than the export could support.

| # | Fault (short) | Terminal status | Note |
|---|---|---|---|
| F01 | contact lands on a page with no contact | fixed@w1 | |
| F02 | no identity until 93% scroll | fixed@w1 | |
| F03 | ¶04 pin holds 978px, develops nothing | fixed@w1 | |
| F04 | printing loses chapters 06/07 | fixed@w3 | 3 blank pages of 10 → 0 |
| F05 | nav writes no history | fixed@w1 | |
| F06 | half the thesis at 25% opacity | fixed@w1 | |
| F07 | dead paper before ¶05 | fixed@w1 | |
| F08 | mobile gate opens with 440px of nothing | fixed@w2 | |
| **F09** | **`/#values` lands on the wrong chapter** | **fixed@w1 · verified@w4** | Wave 1's `arrival.ts` rewrite closed it. Re-probed at 800/1600/2400/3600/5000ms: all seven anchors sit at `top = 96` from the FIRST sample and never move. The 2.2s wrong-chapter frame and the lurch to 8021 are both gone |
| F10 | "skip to the work ↓" misses the work | fixed@w2 | |
| F11 | hero's three case files are not the argued three | fixed@w2 | |
| F12 | one project, three names | fixed@w2 | |
| F13 | rail is seven tab stops with invisible labels | fixed@w2 | |
| F14 | motion off, the rail claims you've read everything | fixed@w2 | |
| F15 †‡ | static world paints boxes the motion world doesn't | not-a-defect@w3 · **design-call@cert** | w3 root-caused the rectangles as the print tier's authored figure outline, not a containment artifact. w4 found that outline was invisible anyway (F80) and raised it to a measured ≥3:1 — which makes the reported difference **larger**, not smaller (1.86:1 → 3.38:1). It is a design call, not a non-defect. See "CERT-RESPONSE" |
| **F16** | **mobile hero is seven 13px links in a 320px stack** | **fixed@w4** | Below `sm` the case-file index and the three-link `in a hurry` run give way to one 44px resume row. Visible hero affordances at 390: **9 → 2**, both 44px (330×44, 110×44). Sitewide elements under 30px tall or 24px wide: **34 → 28** |
| F17 | fig 6.1 bottom-aligned into a void | fixed@w2 | |
| **F18** † | **chapter pacing 4:1 out of balance** | **design-call — declined@w4** | Re-measured: **3.95:1**, ¶05 at 30.5% of the page and ¶06 at 7.8% — essentially unmoved. See "The three declines" |
| F19 | closing page 44% empty to the right | fixed@w2 | |
| F20 | approval stamp reads as a file-drop target | fixed@w2 | |
| F21 | the gate approves a row with no data | fixed@w2 | |
| F22 | reference #3 cites a retired project | fixed@w2 | |
| F23 | no structured data anywhere | fixed@w3 | |
| F24 | `/world-preview/` ships to production | fixed@w3 (robots) · **wontfix (route)** | The bench is driven against the real static build by `day-arc.spec.ts` and `shoot-arc.mjs`; excluding it would delete a test contract. `robots.txt` disallows it and the page is `noindex` |
| F25 | four case studies use an SVG as og:image | fixed@w3 | |
| F26 | /evidence shares as the homepage | fixed@w3 | |
| F27 | the error page's recovery button leaves the site | fixed@w3 | |
| F28 | two clocks contradicting each other | fixed@w1 | |
| F29 | the gate clock's real defects | fixed@w1 | |
| F30 | "arrival" ×3 and "06:12" ×2 in the top 170px | fixed@w2 | |
| F31 | "cincinnati, ohio" printed twice | fixed@w1 | |
| **F32** † | **type scale bloat — 19 distinct rendered sizes** | **design-call — declined@w4** | Re-censused: **16** distinct (size × family) pairs, of which **3 are `sr-only`** and never painted — so **15 painted**, against the ledger's 19–20. Five are one-offs. See "The three declines" |
| F33 | 10px and 11px mono | fixed@w2 | |
| F34 | a fourth typeface leaks in | fixed@w2 · verified@w4 | The only `ui-sans-serif` nodes left are three `sr-only` spans. Nothing painted uses it |
| F35 | hierarchy inversion in every bright/muted pair | fixed@w2 | |
| F36 | fig 5.1's 120-character caption | fixed@w2 | |
| **F37** | **the fast-mnist scene is uninterpretable** | **fixed@f37-pass** | Closed 2026-07-25, after this table first printed: the forward pass names its stages (input · hidden · readout) and answers in clay; the F66 11px floor holds and the plates' 9 census collisions go to 0. See "The one that got away" |
| F38 | jetpack chip breaks a sha onto its own line | fixed@w2 | |
| F39 | ragged row affordances | fixed@w2 | |
| F40 | three identical case-file/source/demo triplets | fixed@w2 | |
| F41 | every link ends in ⟶ | fixed@w2 · extended@w3 | |
| **F42** †‡ | **the em dash has eaten the punctuation** | **wontfix@w4 · composition corrected@cert** | The ledger's own proposed rule — one per paragraph — is **already met by 124 of 134 paragraphs (93%)**. What the w4 row never said is what the other ten ARE: **9 apparatus (mono), 1 prose**. See "The three declines" and "CERT-RESPONSE" |
| **F43** | **vocabulary overload ("gate" ×15 on home)** | fixed (/evidence)@w3 · **wontfix (home)@w4** | The 15 instances carry three distinct senses, and both the technical ones and the metaphor are load-bearing. See "The three declines" |
| F44 | `⟶✓` and `✓passed` set without a space | fixed@w2 + w3 | |
| F45 | ~200px hole in the hero | fixed@w1 | |
| F46 | the `n.b.` dashed box is an orphan style | fixed@w2 | |
| F47 | duplicate social links 400px apart | fixed@w2 | |
| F48 | unguarded `getFullYear()` | fixed@w2 | |
| F49 | prerender ships `—:—`, no usable `<h1>` | fixed@w3 | |
| F50 ‡ | sitemap `lastmod` is a stale constant | fixed@w3 · **partial@cert** | The stale half is closed; the *constant* half is not. All nine `<lastmod>` values still print one date (`2026-07-01T00:00:00.000Z`), because all seven case files carry a hand-typed `verified: "2026-07"`. Nothing derives it from a commit, a file mtime or a run. See "CERT-RESPONSE" |
| F51 | `404.html` carries the homepage title | fixed@w3 | |
| F52 | hardcoded seasons + a decaying self-description | fixed (description)@w3 · **wontfix (season)** | `"summer 2026"` at `StoryShell.tsx` and `Header.tsx` is one dateline in two places; w3's reasoning stands — deriving one and not the other makes them disagree in October, and deriving both is a home-dateline decision no wave was given |
| **F53** † | **the GPA claim breaks the site's own rule** | **not-a-defect — owner-overruled** | w2 removed it; it is back, by an owner directive dated 2026-07-24 recorded in `StoryShell.tsx:909-919` ("GPA once, semesters named"; the stated boundary is the transcript, offered on request). The ledger's objection was reviewed and overruled by the standing biographical ruling. Recorded here because WAVE2-STATUS still reads "fixed" |
| F54 | the evidence ledger has a blank row | fixed@w3 | |
| F55 | three "external artifacts" link back into the site | fixed@w3 | |
| F56 | the registry has no data column | fixed@w2 | |
| F57 | the local-only legend prints on 7 pages for 2 rows | fixed@w3 | |
| F58 | two real recommendations render nowhere | fixed@w3 | |
| F59 † | half of `projects.ts` is never rendered | fixed (the live half)@w3 · **design-call (the rest)** | w3 corrected the ledger (three "zero call sites" helpers are imported by the fixtures) and neutralised the `97.01%` the ledger stamps HELD. Which dead FIELDS to keep is a data-model decision that belongs with whoever decides whether `lifequest` ships |
| F60 ‡ | the comment layer out-writes the content layer | fixed@w3 · extended@w4 · **partial@cert** | w3 cut `HeldStamp`'s essay and the "three editorial rows"; w4's F82 sweep corrected six more headers — both real, neither the fault. Measured across `src/**/*.{ts,tsx,css}`: **6,710 comment lines to 13,908 code lines (0.48:1)**, and comments still out-write code in **21 of 71 files**. See "CERT-RESPONSE" |
| F61 | the header paints a cream bar over a dusk page | fixed@w1 | |
| F62 | the ¶05 → ¶06 seam is a 690px void | fixed@w1 | |
| **F63** †‡ | **Red Thread jumps 97px sideways at 1280** | fixed@w4 (clearance) · **design-call@cert** | The rail-clearance half is fixed and holds (136 → 152). The *sideways jump* is not: swept 1024→1440 and bisected, the spine relocates at exactly **1279 → 1280, x 1253 → 152 — 1101px**, because `xl` brings the chapter rail in and the thread crosses the page to sit beside it. Designed reflow, not drift — but "fixed@w4" claimed a jump was gone that is still there, an order of magnitude larger than the ledger's 97. See "CERT-RESPONSE" |
| F64 | the flagship type token is dead | fixed@w2 | |
| F65 | the label token's 12px floor | fixed@w2 | |
| F66 | scene text at ~6–8px on a phone | fixed (sibling, 2026-07-25) | Per-scene authored narrow editions; min rendered text 11.0px at 390, zero desktop leak — **as reported in the shared checkout's WAVE2-STATUS row**, which was not yet committed when this wave closed. Not re-verified here (scene ownership) |
| F67 | the signature act at ~6.3px on a phone | fixed@w2 | |
| **F68** | **`scrollEasing`/`SCROLL_DURATION` are dead** | **fixed@w4** | |
| **F69** | **four contradictory beliefs about header height** | **fixed@w4** | Three different landings for one 68px masthead — 192 / 208 / 96 — now **96 / 96 / 96** |
| **F70** | **every reduced-motion rule written twice** | **partially fixed@w4 + design-call** | Six of thirteen gates collapsed to one rule each; the rest keep their pair deliberately |
| **F71** † | **thread + overlay do not exist without JS** | **not-a-defect@w4 · docs fixed@w4** | The behaviour is acceptable and the CSS is not dead; the CLAIMS were false and are corrected |
| **F72** † | **a downshift leaves fig 4.0 asserting something false** | **not-a-defect@w4** | Driven for real: it does not reproduce. The unsound guard behind it was removed anyway |
| **F73** | **a GC pause can strand the tab in print tier** | **fixed@w4** | Reproduced exactly, then fixed with an expiring verdict |
| F74 | a test harness ships in the production bundle | fixed@w3 · verified@w4 | `__frameGovernor` occurrences in `out/_next/static/chunks/`: **0** |
| F75 | motion readers see a lighter headline at rest | fixed@w2 | |
| F76 | chapter content flashes on slow font loads | fixed@w2 | |
| **F77** | **the ¶04 pin ends with ~19vh of frozen screen** | **fixed@w1 · verified@w4** | Walked the pinned range in 40px steps: the token travels y≈3160→3920 of an ≈855px pin, leaving a **~103px** tail (0.11vh), not 170px — and the halt now brings its own note up with it |
| F78 | a fourth mantra would play first | fixed@w2 | |
| **F79** | **`.thread-dip` computed for everyone, painted for nobody** | **fixed@w4** | Motion world dip nodes **1 → 0**; both static worlds unchanged at 1/1 |
| **F80** † | **three "authored editions" that are one edition** | **partially fixed@w4 + ledger correction** | `full` has a consumer the ledger missed; the dead garnish rail and two genuinely dead tokens are deleted; the print edition's one flourish is now visible |
| **F81** † | **five suppressions of one lint rule** | **fixed@w4 (2) · not-a-defect (3)** | Two were the mirror pattern and are now `useSyncExternalStore`; three are not that pattern |
| **F82** | **load-bearing comments that are measurably false** | **fixed@w4** | All nine audited, plus the one the wave brief added |

**Totals — 82 faults, each counted once by its dominant disposition:**

| Disposition | Count | Faults |
|---|---|---|
| **Fixed** — the fault as stated is closed | **68** | F01–F14, F16, F17, F19–F23, F25–F31, F33–F41, F44–F51, F54–F58, F60–F69, F73–F79, F82 |
| **Fixed in part**, remainder a recorded decision | **7** | F24, F43, F52, F59, F70, F80, F81 |
| **Not-a-defect** — the claim did not survive checking | **4** | F15, F53, F71, F72 |
| **Design-call / wontfix**, with reasons | **3** | F18, F32, F42 |
| **Open** | **0** | — (F37 closed post-campaign; see its row) |

Of the 68, this wave was the primary closer for **seven** (F16, F63,
F68, F69, F73, F79, F82) and verified two more that Wave 1 had already
closed but nobody had re-measured (F09, F77). It also carried the fixed
half of four of the seven split rows (F70, F80, F81, and F15's
legibility).

---

## The engine, fault by fault

### F69 — three landings for one masthead

Four constants each claimed to be the fixed header's height. Measured,
the masthead is **68px** (64 at 390) — not the 56 the ledger assumed and
not the 72 `PipelineRun` assumed. Worse, the numbers did not merely
disagree; two of them **added**. A scroll-into-view operation applies the
container's `scroll-padding-top` AND the target's own
`scroll-margin-top`, so with JS disabled:

| Path to an anchor | Before | After |
|---|---|---|
| native fragment jump → a chapter | 192px | 96px |
| native fragment jump → a cited figure | 208px | 96px |
| the engine's landing contract | 96px | 96px |

The fix is one authored number. `scroll-padding-top` on `html` is now the
only place it is written; the three `scroll-margin-top` rules are deleted
(they were doubling, not restating); `arrival.ts` READS the declaration
back through `anchorLanding()`; and the two remaining hand-written
beliefs — `PIN_TOP_MIN = 72` and a `bottom > 120` hit test — derive from
the same call. A landing offset can now only be changed in one place.

### F68 — a signature that described a library the engine had removed

`ScrollController.scrollTo` advertised `{offset, duration, easing}` and
never destructured `opts`; both call sites passed all three. The
suppression window that blinded the frame governor was
`SCROLL_DURATION * 1000 + 600`, where `SCROLL_DURATION = 1.2` was the
Lenis-era "1.2s expo-out". The options are gone, and the window is
`FLIGHT_SUPPRESS_MS = 1800` — the same number, documented for what it is:
an upper bound on a duration the *browser* chooses, since
`behavior: "smooth"` exposes no timing to script.

### F73 — a bad thirty seconds branded the tab

Reproduced exactly as written, through the real scorer
(`probe-w4gov.mjs`, probes build):

| Step | Tier | Cap |
|---|---|---|
| scrolled past the human gate | core | — |
| four injected 200ms frames | **print** | `print` |
| navigate to /evidence | **print** | `print` |
| navigate home, 120 frames of smooth scrolling | **print**, `watching: false` | `print` |

Unrecoverable, because the print floor also stops the watcher — there is
nothing left measuring that could earn anything back. The cap now carries
an **expiry instant** (`study-tier-cap-until`) and `readCap()` clears the
keys once it passes. An instant rather than a duration on purpose: the
`layout.tsx` head script must honour the same expiry before first paint,
and comparing an instant lets it do that with `Date.now()` alone, so
`CAP_TTL_MS` lives in exactly one file. A cap stored with no expiry is
honoured forever — that is a ceiling somebody set deliberately, and it is
what `frame-governor.spec.ts`'s existing ceiling test seeds.

### F63 — the ledger measured the wrong line, and the real number is 1,100px

The ledger reports "a 96.8px lateral snap", from chapter 03's path start
at vw 1279 vs 1280 (534.0 → 630.8). Re-measured, **those are chapter 01's
gesture start**. Chapter 03's *spine* goes **1253 → 152**: the thread
changes SIDES. The original report the ledger dismissed —
"teleports across the screen" — was the accurate one.

The switch stays. 1280 is Tailwind's `xl`, exactly where the fixed
chapter rail appears and the wrap gains its `xl:pl-36` binding margin;
below it there is neither, and the only text-free lane is the right
gutter. The ledger's fix line — interpolate across 1200–1360 — cannot be
taken: interpolating from the right gutter to the left binding margin
runs the thread through the body column for the whole band.

What was genuinely broken, and is fixed:

- **The clearance was a guess, and wrong.** `RAIL_CLEARANCE = 136`
  carried the comment "the rail ends by ~113px". Measured, the widest
  `.rail-label` ends at **x = 142** at every xl width, and it was already
  stale before Wave 2's F13 fix made all seven chapter NAMES rest
  visible. A 136px seat with ±8px of wobble ran the thread through the
  label column between 1280 and ~1344. `RAIL_EDGE = 142` is now measured,
  the seat derives from it, and `bindingLane()` shrinks the wobble to
  whatever the lane allows. Spine at 1280/1300/1360: **136/136/148 →
  152/152/152**.
- **The rebuild thrashed.** `ThreadSegment`'s `ResizeObserver` ran the
  whole generator synchronously inside its own callback, once per
  notification, times seven segments. It is coalesced to one rAF.

### F79 — computed for everyone, painted for nobody

`.thread-dip` is `display: none` by default and `inline` only in the
static worlds, yet chapter 05 built it on every re-measure and shipped
the path in the DOM. `wantsDip` puts the computation behind the same gate
as the paint. Verified in four worlds:

| World | Dip nodes in DOM | Painted |
|---|---|---|
| motion | 1 → **0** | 0 |
| quiet toggle | 1 | 1 |
| reduced motion | 1 | 1 |
| motion → quiet, mid-session | 0 → **1** | 1 |

The last row is why `lenis` joined the measure effect's dependencies: the
world is now an input to the geometry.

### F70 — the union cannot be one rule; the intersection can

The static world is the UNION of a media query and an attribute
selector, and CSS cannot express that union in one rule — which is the
whole reason ~14 gates were written out twice, often 130 lines apart. The
INTERSECTION is one rule, and it was already this file's own idiom in two
places:

```css
@media (prefers-reduced-motion: no-preference) {
  html:not([data-motion-off]) … { … }
}
```

So **wherever motion is something the engine world ADDS**, the
declaration moves into that single gate and its absence IS the static
state — which is A7's own principle. Six gates collapsed:
`.daymark-fill`, `.link-draw`, `.link-draw-quiet`, `.rail-mark`,
`.rail-label`, and the `[data-pipeline-note]` / `[data-registry-row]`
pair.

**Seven gates keep their pair, deliberately.** Where the static world
REPLACES a value — the header and footer paper, the chapter waypoint
paint, the thread's drawn state, the pipeline's resting frame —
inverting would require the motion branch to explicitly UN-SET every
static property. That trades a visible duplication for an invisible
omission, and an omission is the worse failure mode.

`probe-w4gates.mjs` compares ten gated properties across all four worlds.
It caught the one regression the refactor introduced: `.link-draw`'s
transitionDuration went 0s → 0.15s in every static world, because the
masthead's nav items carry Tailwind's `transition-colors` beside the
class and the old blanket `transition: none` had been suppressing that
too. Colour now rides the same 250ms as the draw — the house has one
hover move, and that element was running two.

### F81 — two of the five were the pattern; three are not

| Suppression | Verdict |
|---|---|
| `usePrefersReducedMotion` | **the mirror pattern** — now `useSyncExternalStore`. Also one render earlier: the first client render used to report "motion on" always |
| `SmoothScroll` quiet toggle | **the mirror pattern** — now `useSyncExternalStore` over a module store, with a `storage` listener so a second tab follows |
| `SmoothScroll` `setLenis` | not that pattern: the controller does not EXIST until the effect builds it |
| `FileMemory` | not that pattern: `recordFileVisit` **writes**, and returns the receipt. A write must not sit in render or a snapshot getter |
| `useActiveChapter` | not that pattern: a DOM **census**, takeable only once the tree exists |

Suppressions in `src/`: **5 → 3**, and the three carry their specific
reason instead of a shared shrug.

### F72 and F71 — two engine faults that were documentation faults

**F72 does not reproduce.** The ledger predicts the bead snapping back to
`1.0 ingest` under a fully-drawn rail after a governor downshift. Driven
for real: at the gate the token sits at ty 182, `is-halted` set, edge
dashoffset 0 — and after four injected 200ms frames take the tier to
print and stamp `data-motion-off`, it is *still* at ty 182 with the mark
lit. Three re-measure paths were probed too (taller viewport, wider
viewport, a crossing of `WIDE_QUERY`); `staleHaltMark: false` every time.
The guard it named was nonetheless unsound — halted-ness lived in a ref
AND a class, and the cleanup reset only the ref — so the class is now the
single source. That is hardening, and the code says so rather than
claiming a repair.

**F71 is a false claim about acceptable behaviour.** `ThreadSegment`'s
header promised the static world "holds with zero engine (and zero
JS-timing) dependence"; `PipelineRun`'s promised the "finished FRAME".
Probed with `javaScriptEnabled: false`: seven `.thread-segment` elements
with **zero `d` attributes**, and a **0×0 pipeline overlay with zero
children**. Every path in both is generated from measured boxes, so a
scripting-disabled reader gets no thread and no run token at all.

That is survivable — both are `aria-hidden` decoration over server-
rendered content that carries the whole argument — but it is not what the
headers said. The ledger's further claim that ~54 lines of static-world
CSS "target selectors with nothing to match" is **wrong**: those rules
are live for the reader A7 is actually about, the reduced-motion reader,
who has JS. Both headers now separate what is true (no rAF, no
ScrollTrigger, no ordering dependence) from what was not.

### F80 — the `full` tier has a consumer the ledger missed

The ledger reads Full and Core as one edition because `[data-tier-garnish]`
has zero consumers. The rail is dead and is deleted — but `DayArc.tsx:235`
branches on `getTier() === "full"` to fine-scrub the dusk choreography
between stops instead of stepping across them. Full is a measurably
smoother nightfall on a device that earned it. "Delete two of the three
tiers" would have deleted a shipped behaviour and, in Print's case, the
static world every A7 path depends on.

Of the six "also dead" items the ledger lists, three hold:

| Token | Verdict |
|---|---|
| `--text-hero` | live since w2 (F64) |
| `--font-sans` | kept — deleting it hands the base font fallback to Tailwind's own default rather than removing anything |
| `--color-pass` | **dead — deleted** |
| `--color-fail` | live: `--status-warning` → `error.tsx` |
| `--color-surface-2` | live: `--surface-3` and the dossier stock |
| `.no-scrollbar` | **dead — deleted** (IE/Edge-legacy properties on a Chrome 128 browserslist) |

And the print edition's one flourish was invisible, which is the same
complaint in a different register. The figure outline at `currentColor
22%` composited to **1.86:1** on chapter 06's nightfall ground — the
ledger measured 1.87 — and under 3:1 on the day papers. At 55% it clears
the WCAG non-text bar on every paper a captioned figure actually sits on,
which is the day-arc waypoint beneath it, not the canvas token:

| Chapter | Paper | Ratio |
|---|---|---|
| 04 | `rgb(245, 237, 220)` | 3.47:1 |
| 05 | `rgb(242, 228, 201)` — golden hour, the binding constraint | 3.38:1 |
| 06 | `rgb(67, 55, 47)` — nightfall | 4.25:1 |

*A measurement note, because it nearly shipped a wrong number:*
`color-mix()` resolves to `color(srgb r g b / a)` with **fractional**
components while plain colours come back 0–255. The probe's first pass
scraped both with one regex, silently divided the mixed stroke by 255,
and reported 1.46:1. With the conversion added, its reading of the OLD
value reproduces the ledger's 1.87 exactly.

### F82 — the nine, audited

| Claim | Verdict | Now |
|---|---|---|
| `SmoothScroll` header describes Lenis (`autoRaf: false`, `lenis.raf(…)`) | **false — nothing since native scroll** | Describes native scroll + ScrollTrigger, and names `useLenis`/`LenisAnchor`/`data-lenis-connected` as surviving NAMES so a reader who greps them is not misled |
| `LightField.tsx` "four layers" | **false — renders three** | Three elements carrying four authored layers; says the rake is folded into the base, and why |
| `ThreadSegment.tsx` "zero JS dependence" | **false** | See F71 |
| `PipelineRun.tsx` "the finished FRAME" | **false** | See F71 |
| `TextMotion.tsx` "No layout property is ever animated" | **false — `wght` moves glyph advances** | States that it reflows its own line, which is why F75 bounded and quantized it. The range was ALSO stale (360→420 ±60 vs the shipped 396→420) |
| `constants.ts` "rail ends by ~113px" | **false — measures 142** | See F63 |
| `apparatus.tsx` "hairlines run at 70% ink" | **half false** | The composed alpha is 0.70 in the day register but **0.49** past the dusk flip (two multiplied opacities), exactly as the ledger found. The 3:1 claim it served is TRUE and now measured: 3.32/3.36/3.31/3.23/3.79/3.72/4.26, worst 3.23:1 — so the comment changed, not the opacity |
| `StoryShell.tsx` "three editorial rows" | fixed@w3 — verified four | |
| `ApprovedStamp.tsx` "~600ms" | **false — 750ms** | Cites `stamp-press` (750ms) and `stamp-ink-in` (720ms) and points at globals.css, where the numbers live |
| `HeldStamp.tsx` Phase 3 promise | fixed@w3 | |

---

## The three declines, with their evidence

### F18 — the pacing is real, and splitting ¶05 is not the answer

Re-measured at 1440×900 on a 9,870px page:

| Chapter | px | viewports | share |
|---|---|---|---|
| 01 arrival | 900 | 1.00 | 9.1% |
| 02 who | 764 | 0.85 | 7.7% |
| 03 the path | 1563 | 1.74 | 15.8% |
| 04 automl | 922 | 1.02 | 9.3% |
| **05 the work** | **3014** | **3.35** | **30.5%** |
| **06 how i work** | **765** | **0.85** | **7.8%** |
| 07 the gate | 1778 | 1.98 | 18.0% |

Ratio **3.95:1** — the ledger's 4:1, essentially unmoved by three waves.

The ledger's fix is "split ¶05 into two beats with their own kickers".
That makes the paper eight chapters, and *seven* is not a layout choice
here — it is the contract every apparatus is built on: `CHAPTERS` in
`chapters.ts`, the folio rules that print `NN / 07`, the rail's seven
stops, seven generated day-arc waypoints, seven thread segments, and
seven kicker clocks that must strictly advance from 06:12 to 22:41.
Adding a chapter means authoring an eighth waypoint colour and an eighth
time of day, which is a design decision about what the day looks like,
not a refactor.

It is also not obvious the allocation is wrong. ¶05 is the work index —
the thing a recruiter came for — and 30% of the scroll is where they
should be spending it. What the ledger names underneath the ratio ("no
internal wayfinding" across 3.35 viewports) is the half worth acting on,
and it can be answered inside the seven-chapter contract. Declined here,
recorded as the strongest remaining item for a home pass.

### F32 — the five-token collapse cannot be done without moving type

The brief for this wave is explicit: execute it only if it can be done
without visual regression. It cannot — a type-scale collapse changes
rendered sizes by definition, and the current census is much closer to
the target than the ledger's 19:

**16** distinct (size × family) pairs, of which **three are `sr-only`**
and never painted → **15 painted**. Five are one-offs, and they are the
hero reprise (115.2px, n=1), one 34.56px Fraunces, the 18.14px hero
superscript (n=1), a 17px pair, and the 15px dictionary gloss (n=1). The
body of the page is already three voices carrying almost everything:
13px Fragment Mono ×309, 19px Newsreader ×19, 24px ×17.

Forcing the five one-offs onto tokens would move the hero's superscript
and the dictionary gloss for no reader benefit and against Wave 1's and
Wave 2's composition work. Declined, with the census as the record.

### F42 and F43 — the counts are right and the diagnosis is not

**F42.** 86 em dashes in the home page's visible text. But the ledger's
own proposed rule is "ration it — one per paragraph", and measured
against that rule the page **already passes**: of 133 paragraphs, list
items and figcaptions, **123 carry at most one**. The ten exceptions are
not prose:

- seven are **figure captions**, where the dash separates *structural
  fields* — `fig. 5.1 — the race — equal time, measured distance`, then a
  data line. That is a caption grammar and it is applied consistently.
- two are **endnote rows** with the same shape.
- one is a **¶ kicker**, generated by the apparatus from a fixed grammar.

Rationing further means rewriting `scenes/manifest.ts` (owned by the
scenes pass this round) and the kicker apparatus, changing strings the
proof-manifest gate and several specs assert, to move a number that is
already inside the rule the ledger proposed. The churn plainly outweighs
the benefit; declined, and said so.

**F43, home half.** The 15 `gate`/`gates`/`gated` instances carry three
distinct senses, and each is load-bearing:

| Sense | Instances | Why it stays |
|---|---|---|
| the human go/no-go | 7 | the site's thesis and its closing chapter's name |
| a classifier threshold (`96-sample gate`, `classifier gate`) | 3 | claim strings tied to proof-manifest entries |
| a model routing step (`gated setfit`, `gated lifecycle`) | 4 | the projects' own accurate terminology |

Renaming the technical uses makes the site less accurate; renaming the
metaphor costs it its spine. The collision is not sloppy writing — the
paper is arguing that a classifier gate and a human gate are the same
shape. If an owner still wants four more nouns, the only safe surface is
the threshold sense on the three non-claim mentions, and that is an
editorial call with a proof-manifest risk attached. Declined, with the
census.

---

## The one that got away

**F37 — the fast-mnist scene is uninterpretable.** Wave 3 routed it to a
scenes pass because `src/components/scenes/*` is owned by a sibling this
round; that pass has not landed (`GlyphScene.tsx` in the shared checkout
still has no `argmax` label). This wave did not take it, deliberately:
the orchestrator cherry-picks these commits, and editing a file another
agent is actively rewriting is how a linear history stops being one.

The remaining work is small and the ledger states it exactly: label the
unlabelled 0–9 checkbox column (`argmax`) and the dot-matrix glyph
(`input · 28×28`), or cut the second glyph. It is the only fault of 82
this campaign closes without a disposition, and it is recorded as open
rather than quietly re-filed.

### Brought back — fixed@f37-pass (2026-07-25)

The scenes pass landed, one day after the table above first printed.
The forward-pass panel now names its own stages: three quiet 13px
labels head the drawn columns — `input` over the stippled 7, `hidden`
over the cell columns the ledger read as "a partial second glyph",
`readout` over the 0–9 slots — and the readout concludes in clay: the
winning digit `7` takes the clay voice and an `answer · 7` line closes
the column. The two-second read is the case study's own sentence ("you
draw a digit and watch the network read it"). Mechanism only: the 7 is
the drawn glyph, no number joins the figure, and the ~97% stays HELD.
The ledger's `argmax` was declined as jargon and its `28×28` as a
number no settled data carries; the honest labels are the three words
above. The caption follows — "and the forward pass, drawn" → "the
forward pass — a drawn 7, answered" (`manifest.ts`; restates the
figure, adds nothing). Labels are static text, so every world — engine,
quiet, reduced-motion, print — carries the same reading in its settled
frame.

The redraw also cleared the two census artifacts the plates already
carried (`shoot-f37.mjs`, the F66 harness + a label-inventory reading;
row + case seats, 390 + 1440):

| Reading (glyph plates) | Before | After |
|---|---|---|
| forward-pass labels | none | input · hidden · readout · answer · 7 |
| min rendered text at 390 | 11.0px row / 11.07px plate | unchanged — the F66 floor holds |
| text collisions (0.5-unit em-box bar) | 9 — adjacent slot digits, 12.2 pitch under 13-unit boxes | 0 — pitch 13.5, the redraw WAVE2's ESCALATE note priced |
| viewBox overflows at 1440 | 1 — the wide race caption's em-box descent past y 190 | 0 — viewBox depth 190 → 192, no ink moved |

Verified: build, `tsc --noEmit`, `eslint`, `prettier --check` clean;
contrast, proof-manifest and asset-budget gates passed; Playwright
**chromium-desktop 97 passed / 1 skipped** (atlas, red-thread,
text-motion, paper-memory, reduced-motion, performance-budget) and
**chromium-mobile 57 passed / 2 skipped** (atlas, text-motion), all
against the live static export on :3300. Evidence:
`docs/design-lab/shots-f37/` — both seats × 390/1440, before/after,
plus the probe JSONs behind every number above.

**With this row the ledger closes 82 of 82.**

---

## Spec edits, and why they were justified

**`frame-governor.spec.ts` — one case added, none changed.**
"an EXPIRED print cap floors nothing" seeds `study-tier-cap=print` with a
`study-tier-cap-until` one second in the past and asserts the load is
Core, has no `data-motion-off`, connects the engine, and that the stale
keys are cleared. F73's fix spans two files that must agree — the
`layout.tsx` head script before first paint, and `readCap()` — and a test
covering one would let them drift. **Verified it fails against the
pre-fix code**, at `data-tier` = "print" vs the expected "core". The
existing ceiling test is untouched: it seeds a cap with NO expiry, which
is the documented "set deliberately" form.

**`red-thread.spec.ts` — one assertion strengthened.**
The dip-under-motion test used `toBeHidden()`, which passes whether the
node is hidden or absent — so it could not distinguish F79's fault from
its fix. It now asserts `toHaveCount(0)`. Its comment also claimed
"segment 05 generates its dip whenever the folio rule measures", which is
no longer true; leaving it would have authored the next F82.

**No spec was rewritten to accommodate a change.** The two edits above
are an addition and a tightening.

---

## Evidence

- `docs/design-lab/shoot-w4eng.mjs` — the wave's shot harness
- `docs/design-lab/probe-w4{eng,land,rail,halt,gov,tier,gates,claims,copy}.mjs`
- `docs/design-lab/shots-w4eng/` — spine captures either side of xl,
  landing captures for `/#gate`, `/#values` and `/projects/automl/#fig-4`,
  both static worlds, the print tier in both registers, the mobile hero,
  the no-JS home, and the JSON behind every number above

Measured deltas, home page, 1440×900 unless noted:

| Metric | Before | After |
|---|---|---|
| Landing offset — native jump to a chapter | 192px | 96px |
| Landing offset — native jump to a cited figure | 208px | 96px |
| Landing offset — the engine's contract | 96px | 96px |
| Deep-link `/#values` target top at 800ms | (w1: corrected) | 96px, stable to 5s |
| Constants claiming to be the masthead's height | 5 | 1 |
| Chapter-03 spine x at 1280 / 1300 / 1360 | 136 / 136 / 148 | 152 / 152 / 152 |
| Rail clearance vs the rail's measured edge (142) | 136 (inside it) | 152 |
| `.thread-dip` nodes in the motion world | 1 | 0 |
| Print-tier figure outline, worst register | 1.86:1 | 3.38:1 |
| `[data-tier-garnish]` consumers | 0 | rule deleted |
| Duplicated static-world gate pairs | 13 | 7 |
| `react-hooks/set-state-in-effect` suppressions | 5 | 3 |
| Session print cap | permanent | expires (5 min), keys cleared |
| Visible hero affordances at 390 | 9, all < 44px | 2, both 44px |
| Sitewide targets under 30px tall or 24px wide | 34 | 28 |
| Painted distinct (size × family) pairs | 16 incl. 3 sr-only | 15 painted |
| `__frameGovernor` in the deploy bundle | 0 (w3) | 0 |
| Verified-false load-bearing comments | 9 + 1 | 0 |

---

# CERTIFICATION-RESPONSE — the round after the ledger closed

**Branch `redesign/daylight-study` @ `8dd4c14`** (origin/main after PR
#11) → this worktree. An independent certifier re-audited the shipped
export and filed eight **D** findings (defects it could reproduce) and
six **N** findings (things it could name but the ledger had no row for).
This section answers all fourteen, and it is deliberately the section
that says where the table above overstated.

**Method:** every finding re-probed against the live static export
(`NEXT_PUBLIC_BASE_PATH= next build --webpack` → `out/` on :3200)
BEFORE and AFTER the change, with one new reusable harness:

| Probe | What it decides |
|---|---|
| `docs/design-lab/probe-certresp.mjs` | the sitewide tap-target census at 390 + 1440; the motion toggle's measured box in BOTH seats at 13 widths; the masthead's document width, header height and wordmark box 320→1440; the Red Thread's spine x swept 1024→1440 and bisected to the pixel; the em-dash census by paragraph register; and the rewritten surfaces, shot |

Evidence: `docs/design-lab/shots-certresp/` — `certresp-before.json`,
`certresp-after.json`, and the before/after captures behind every number
below.

---

## The fourteen findings, and where each one landed

| # | Finding (short) | Terminal status | What actually changed |
|---|---|---|---|
| **N1** | og cards print `…/portfolio-2.0` — lowercase, 404s on GitHub Pages | **fixed@cert** | The folio is DERIVED from `siteMetadata.url` (never typed), all 9 cards re-rendered, and the SEO gate — which runs in CI and on deploy — fails on the lowercase spelling. Proved by planting it |
| **N2** | `ApprovedStamp.tsx` still calls the stamp's frame "dashed" | **fixed@cert** | Three F82-class corrections: the file header, the attention-beat comment, and the matching `globals.css` note. F20 replaced that dash two waves ago |
| **N3** | the dashed "private-safe proof" note box survives on the case files | **fixed@cert** | F46's exact replacement applied: hairline top rule + the label token. Measured after: `border-top: 1px solid`, `0px` on the other three sides, 13px type. Dashed ink is now reserved sitewide for an unsigned STAMP (`PrivateStamp`, `HeldStamp`) and nothing else. **Correction to the finding:** it was on the **4** case files that carry an `evidenceDisclosure`, not all 7 |
| **N4** | the quiet motion toggle measures 0×0 at 390 | **fixed@cert** | One control, two seats — masthead `sm`+, colophon below `sm`, exactly complementary. Measured at 13 widths: a visible motion control at every one (320–480: **87×44** in the colophon; 640–1440: 87×18 in the masthead). The masthead could not take it: 27–33px of slack between its clusters at 320–414 against 52px needed, the same budget `DayMark.tsx` recorded when it declined to enter below 480 |
| **N5** | "B.S. Computer Science" printed twice, adjacently | **fixed@cert** | The heading keeps the degree; the prose under it starts at the date. Every fact survives in the owner-confirmed wording. `atlas.spec.ts`'s identity contract now asserts **both** registers, so neither half can go missing quietly |
| **N6** | two `<meta name="robots">` on all three 404 outputs | **fixed@cert** | `robots: null` clears the root layout's inherited `index, follow` and leaves Next's own `noindex` standing alone. One directive on `404.html`, `404/index.html`, `_not-found/index.html`. The SEO gate now fails on a second one |
| **D1** | /evidence states a rule the biographical line breaks | **fixed@cert** | Owner directive stands: the ¶03 line is untouched. The ledger's own sentence now carries the exemption and its boundary in one clause. `getDeansListCount()` — zero call sites since the owner settled that copy — removed with its re-export. The Fall-2023 question is left where it was recorded |
| **D2–D5, D8** | the WAVE4 status table claims more than the export supports | **relabelled@cert** | Five rows re-labelled with measurements, above and below: **F50** fixed→partial, **F63** fixed→design-call, **F60** fixed→partial, **F15** not-a-defect→design-call, **F42** composition corrected |
| **D6** | the endnotes and the home index feature retired case files | **fixed@cert** | Ruling followed: the files stay reachable. The endnote list is unchanged and correct — both entries cite claims ¶03 and ¶06 actually print, which is F22's own test. The heading over the home index changed from "also on file —" (showcase grammar) to **"cited above, argued in full —"**, and `portfolioVisible`'s reach is now written down where the flag is declared |
| **D7** | sub-44 mobile targets where navigation lives | **fixed@cert** | Every masthead affordance at 390 is now a ≥44px box, with the row's layout unchanged to the pixel. The hero's ¹/↩ pair is padding-based too. Numbers below |

---

## D7 — the targets, measured

Home, 390×844, every `a/button/input/select/summary/[role=button]` with
a painted box (`probe-certresp.mjs`, census section):

| Target | Before | After |
|---|---|---|
| header — portrait plate | 28 × 28 | **44 × 44** |
| header — wordmark | 96 × 18 | **96 × 48** |
| header — "the work" | 69 × 15 | **69 × 45** |
| header — contact | 32 × 32 | **44 × 44** |
| header — resume | 74 × 32 | **74 × 44** |
| sitewide, under 44 in either axis | 42 of 46 | **37 of 47** |
| sitewide, under 30px tall or 24px wide | 27 | **22** |
| the same census at 1440 — under 30/24 | 50 of 61 | **43 of 61** |

None of it is visible. Each target is grown by padding and handed the
growth straight back as an equal negative margin, so the border box a
finger and a census both measure is 44 while the margin box that lays
the row out is exactly what it was. The masthead sweep proves it —
identical at all 13 widths, before and after:

| Width | 320 | 340 | 360 | 375 | 390 | 414 | 430 | 480 | 640 | 768 | 1024 | 1280 | 1440 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| header height, before | 64 | 64 | 64 | 80 | 64 | 64 | 68 | 68 | 68 | 80 | 68 | 68 | 68 |
| header height, after | 64 | 64 | 64 | 80 | 64 | 64 | 68 | 68 | 68 | 80 | 68 | 68 | 68 |
| document width, before | 323 | 341 | 360 | 375 | 390 | 414 | 430 | 480 | 640 | 768 | 1024 | 1280 | 1440 |
| document width, after | 323 | 341 | 360 | 375 | 390 | 414 | 430 | 480 | 640 | 768 | 1024 | 1280 | 1440 |

The wordmark never clips at any width, before or after
(`scrollWidth ≤ clientWidth`), so the 320–390 rules the header's own
comments set are intact.

**Found while re-verifying, not caused by it:** the document is 3px
wider than the viewport at 320 and 1px at 340 — identical before and
after. The overhang is the gate stamp's rotated bounding box
(`w-[min(300px,88vw)]` at `-4°`, right edge 323): the box overhangs, the
ink does not. Recorded here rather than folded into a target fix it has
nothing to do with.

Two hit areas kept the old `.tap-target` name and changed technique. It
was a centred invisible `::after` pad — a real 24×24 landing area that
no measurement can see, because a pseudo-element is not part of the
anchor's box. Every census, including the certifier's, read the hero's
¹ as 8×15. It is padding now (**28 × 45**, advance unchanged), so the
box a finger lands on and the box a tool reports are the same box.

---

## The five status-table relabels (D2–D5, D8)

**F50 — sitemap `lastmod`.** w3 replaced one seven-week-stale constant
with a per-case-file `verified` field, and the fault's real harm (a
sitemap contradicting the pages it indexes) is gone. But `verified` is
itself a hand-typed constant, all seven case files carry the same
`"2026-07"`, and the export therefore still prints ONE `<lastmod>` on
all nine URLs: `2026-07-01T00:00:00.000Z`. Nothing derives it from a
commit, an mtime or a run. **fixed@w3 → partial.**

**F63 — the Red Thread at 1280.** Swept 1024→1440 in 16px steps and
bisected: the spine's start x tracks the viewport 1:1 up to 1279
(`x = winW − 26`, so 1253 at 1279), then at 1280 it is **152**. That is
a **1101px** lateral relocation at a one-pixel boundary — the thread
crossing from the right margin to the left because `xl` brings the
chapter rail in beside it (the certifier's own `spine-1279.png` /
`spine-1280.png` show it plainly). It is designed reflow at a
breakpoint, not drift, and it is not something to "fix" without
redesigning the xl layout — but **fixed@w4** was the wrong word for a
jump that is still there and is eleven times the ledger's 97px. The
clearance half w4 actually fixed (136 → 152, from inside the rail's
measured edge to clear of it) stands and is unaffected. **fixed@w4 →
design-call**, clearance fix noted.

**F60 — the comment layer.** w3 cut `HeldStamp`'s essay; w4's F82 sweep
corrected six headers. Both happened; neither addressed the fault as
stated. Measured across the 71 files of `src/**/*.{ts,tsx,css}`:
**6,710 comment lines against 13,908 code lines (0.48:1)**, and comments
still outnumber code in **21 of 71 files** — up to 3.2:1
(`useGSAPCleanup.ts`, `usePrefersReducedMotion.ts`), and 1.09:1 even in
one of the largest (`TextMotion.tsx`, 301/276). This round ADDED to that
layer rather than cutting it, deliberately: every change here is a
decision a future reader has to be able to re-derive, and an
undocumented negative margin is how the next F82 gets written. Whether
the ratio is a fault or the house style is an owner call, and the honest
label until someone makes it is **partial**, not fixed.
**fixed@w3 · extended@w4 → partial.**

**F15 — boxes the motion world doesn't paint.** w3 root-caused the
rectangles correctly (the print tier's authored figure outline, not a
containment artifact) and w4 raised them from 1.86:1 to 3.38:1 for
legibility. Both true — and together they mean the static world now
paints those boxes **louder** than when the fault was filed. The
observation was never wrong; the disposition was. The outline is a
deliberate print-edition mark the motion world does not need, which is a
design call to defend, not a non-defect to dismiss.
**not-a-defect@w3 → design-call**, with the delta stated.

**F42 — the em dash.** The w4 census is reproduced exactly
(`p, li, figcaption`, innerText): **10 of 134 paragraphs** carry more
than one em dash — 124 of 134 already meet the ledger's proposed rule.
What the row never said is what those ten are: **9 are apparatus** (the
mono register — chapter kickers, endnote lines, metric chips, where the
dash is the field separator the whole voice is built on) **and 1 is
prose** — the ¶03 education line, which is owner-confirmed copy. So the
"epidemic" is one serif sentence and nine label lines doing a label
line's job. The decline stands; the reason it stands is now on the
record instead of a bare percentage. **wontfix@w4, composition
corrected.**

---

## What this round did not touch, and why

- **The ¶03 GPA line.** The owner's directive is explicit and outranks
  ledger logic: the line stays as it is. D1 was answered at the other
  end — the ledger's rule sentence — because that is where the
  contradiction lived once the copy was settled.
- **The Fall-2023 award.** Still an open owner question, still recorded
  in the code comment beside the copy it would change. A third semester
  was not added and the two on the page were not touched.
- **`PrivateStamp` / `HeldStamp`.** Both stay dashed. N3 unified the
  NOTE grammar, not the stamp grammar: on this site a dashed frame means
  an unsigned or unearned stamp, and that is now the only thing dashed
  ink says.
- **The endnote list.** Unchanged. Both entries the finding named cite
  claims the page prints in its own prose, which is exactly the test F22
  set. Renaming the index heading was the honest edit; deleting receipts
  for claims the page makes would have been the dishonest one.

---

## Verification at close

Build clean · `tsc --noEmit` clean · `eslint . --ext .ts,.tsx` clean ·
`prettier --check` clean on every `src/**` file touched (the pre-existing
`scripts/**` and `tests/**` warnings are outside the repo's
`format:check` glob and were already there at `8dd4c14`).

Gates: contrast **passed** · proof-manifest **passed** · asset-budget
**passed** · static-export SEO **passed** (against a
`NEXT_PUBLIC_BASE_PATH=/Portfolio-2.0` production build) · og-card check
**passed**, 9 cards, all folioed `yadava5.github.io/Portfolio-2.0`.

Both new gate rules were verified to FAIL before they were verified to
pass — a gate that has never failed is a comment:

| Planted fault | Gate output |
|---|---|
| `folio: "yadava5.github.io/portfolio-2.0"` | `og card renderer prints "yadava5.github.io/portfolio-2.0" — the site is yadava5.github.io/Portfolio-2.0 (paths are case-sensitive)`, plus `og card folio … is not derived from siteMetadata.url` |
| a second robots directive on the 404s | `404.html carries 2 robots directives (noindex \| index, follow) — one authority`, on all three outputs |

Playwright, all against the live static export on **:3200**:
**chromium-desktop 179 passed / 2 skipped** (atlas, a11y-audit,
interactions, nav-and-images, comprehensive-qa, text-motion, dossier,
paper-memory, day-arc, red-thread, reduced-motion, scroll-engine,
pipeline-run) · **chromium-mobile 48 passed** (atlas) ·
**firefox-desktop 5 passed** (scroll-engine).

## Spec edits, and why they were justified

**`portfolio-fixtures.ts` + `atlas.spec.ts` — one assertion split in
two, none removed.** `EXPECTED_GRADUATE_IDENTITY.education` was the
single string `"B.S. Computer Science, May 2026"`, which is precisely
the duplication N5 removed: it could only pass while the prose repeated
the heading. It is now the degree (`education`) plus the record under it
(`educationRecord`), and `atlas.spec.ts` asserts BOTH — a strictly
larger contract than before, covering the education line's opening as
well as the degree.

That split also caught a real defect in the edit that caused it: with
`{graduation}` promoted to the first child of its paragraph, the JSX
transform dropped the leading space off the text node after it and the
export shipped `May 2026— dean's list`. The spacing is an explicit
expression now, and catching that is why the assertion was worth
keeping strict.

---

# CONTENT-HONESTY — task #34 (the Applied re-pin) + LifeQuest's placement

*2026-07-26. Two content debts, both of the same shape: the page said
something that used to be true.*

## Task #34 — the Applied dossier, re-verified and re-pinned

The case file pinned every receipt at `3225eb4` and described the era
when the native macOS app WAS the product and "the web beta is a
scaffold". Applied now ships as a hosted Next.js app at
getapplied.vercel.app. The scaffold caveat dies here — not because it was
wrong when written, but because it is false now.

**New pin: `36a2f54`** — the public head of `integration/web-migration`,
the branch that carries the web app, read back with
`gh api repos/yadava5/applied/branches` on 2026-07-26. The repository was
also renamed **`yadava5/jobtracker` → `yadava5/applied`**; GitHub still
redirects the old paths, so nothing previously published is broken, but
the pins now name the current repo rather than leaning on a redirect. The
case-file route stays `/projects/jobtracker/` — it is public and linked.

**Every receipt's fate.**

| # | Receipt | Fate |
|---|---|---|
| 01 | Gmail OAuth2 + iCloud IMAP as first-class sources (`docs/ARCHITECTURE.md`) | **rewritten** — that doc is the desktop story. The row is now the least-privilege `gmail.readonly` grant, cited to `cloud/gmail_oauth.py` + `tests/test_gmail_oauth_cloud.py` |
| 02 | 3-layer classifier, SetFit gated (`docs/ML_STRATEGY.md`) | **kept, re-pinned** — path resolves 200 at the new sha; claim unchanged |
| 03 | "Classification runs on-device; content is not sent to hosted inference" | **rewritten — it had become false.** Hosted classification runs on Vercel. Replaced by the stronger, still-true privacy fact: the cloud fetch is `format="metadata"`, headers + snippet, **no bodies** (`cloud/gmail_client.py`) |
| 04 | 182 backend tests | **kept, re-run** — suite re-run at `36a2f54` on 2026-07-26: **271 passed, 10 skipped**. The 10 skips are `test_rls_postgres.py` (needs a live Postgres) and are named in the row, not folded into the total. Anchor `#v-jobtracker-4` deliberately preserved |
| 05 | macro-F1 0.9791, 96 samples | **kept, re-pinned** — `baseline_hybrid_v3.json` is byte-identical at the new sha (re-read: same 96 samples, same 0.9791, same 2 mismatches). The protocol slip's 65 · 17 · 8 · 6 mix was re-counted from `classifier_eval_v3.jsonl` and matches exactly. Anchor `#v-jobtracker-5` preserved |
| 05a | the backend-ci run link | **kept, relabelled.** `gh api .../runs/24665061332/jobs` confirms both gate steps ran and succeeded. It is an OLDER commit than the pin, so the label now prints its date (`backend-ci run, 2026-04-20 ↗`) instead of letting the link imply it ran at `36a2f54` |
| 06 | macOS Debug target built locally | **kept, widened** — still `local-only` with no artifact, but the row now also states the desktop app is still in the repo and links `apps/macos` |
| 07 | "web beta passes gates but remains a scaffold" | **rewritten — this is the row the caveat died in.** Now: the dashboard reads the summary and application endpoints server-side and draws a pipeline board, stage funnel, and review queue |
| 08 | — | **new.** DB-enforced RLS: non-BYPASSRLS role, per-transaction `request.jwt.claims` set `is_local`, `user_credentials` FORCE'd |
| 09 | — | **new, and the point of the round.** The hosted classifier runs the rules layer ALONE |
| out-1 | "pipeline instead of a spreadsheet" | **kept, extended** — now terminates in the live app |
| out-2 | "the classifier runs fully in-browser via quantized ONNX" | **rewritten.** True — but of the Hugging Face Space, not of getapplied. The row says which deployment it is talking about |

**No receipt was dropped, and no pin was left dead.** Every path was
fetched at `36a2f54` before it was written; the rule was that a receipt
whose artifact had vanished would keep the OLD sha (a pin to history is
honest, a 404 is not). None had to — every kept path survived.

### The finding the brief did not have

The brief described Applied as "real Gmail connect → fetch → **3-layer
classify** → dashboard". The code says otherwise, and the code wins.
`classifier/hybrid.py` short-circuits after layer 1 whenever
`settings.deployment == "cloud"` — returning even when the rules were
*unsure* — because torch + sentence-transformers + setfit do not fit the
serverless slot. All three layers are real; they run on the desktop app
and in the HF Space's int8 ONNX build. They do not run at
getapplied.vercel.app.

So the round did not simply retire a stale caveat, it installed a true
one. That correction propagated to four places: receipt 09, a boundary
row, the `jobtracker-local-classifier` manifest entry, and
`projects.ts`'s own description strings (which asserted the 3-layer
dashboard in prose no page currently renders — latent, but it is the
string the next writer would have copied).

### Why the README stopped being cited

`README.md`, `docs/WEB_ARCHITECTURE.md`, and `apps/web/README.md` all
still describe `apps/web` as an unwired scaffold with a placeholder
dashboard. They are real files at the pin and they stay linked — but the
artifact label **"Source-truth README" is gone**, because a page may not
call a stale doc source-truth. It reads "README — the desktop-era record"
with a provenance strip saying it lags. A boundary row states outright
that these docs are not cited as evidence and why. Every receipt for the
web app terminates in source.

## LifeQuest — the omission was the dishonest state

LifeQuest is `featured: true` in `projects.ts`, live at
getlifequest.vercel.app — and it surfaced **nowhere** on the home paper.
No row, no mention, no case file. A chapter headed "selected work" that
silently omits a live project is making a quiet claim about the set being
complete.

The smallest honest fix is an index entry, not a scene and not a case
file. ¶05's closing block now carries a second line under "cited above,
argued in full —":

> **also live, without a case file —**
> **lifequest ↗** — a social-good concept for job-seekers; a playable prototype

Four deliberate choices in one line:

- **Its own heading, not the existing list.** Those two entries are
  receipts for claims ¶03 and ¶06 print in their own prose (F22). This is
  not a receipt for anything; it is a project that exists, listed as what
  it is.
- **External link.** There is no `/projects/lifequest/` route —
  `generateStaticParams` builds case files only — so an internal link
  would have shipped a 404. The running prototype is the honest terminal
  for a project whose whole claim is that it runs.
- **The gloss is `projects.ts`'s own `shortDescription`** (head clause +
  closing sentence). No claim is made here the data layer does not make.
- **"concept" and "prototype" both survive.** The line cannot be read as
  a shipped product, which is what the data says it is not.

## Spec edits, and why each was justified

| Edit | Justification |
|---|---|
| `EXPECTED_HOME_PROJECT_TITLES` += `"LifeQuest"` | The set this list asserts was silently short one live project. Adding it is what makes the omission impossible to reintroduce quietly — the assertion is now strictly larger |
| `jobtrackerReadme`: `"Source-truth README"` → `"README — the desktop-era record"` | The old string asserted the page calls a stale doc source-truth. Same key, same visible-artifact assertion, honest label |
| `jobtrackerWebBeta`: `"Web beta scaffold"` → `"Web app source"` | `apps/web` IS the shipped product. Key deliberately kept so the crosswalk to the superseded claim stays legible in the diff |
| `jobtrackerBackendCoverage`: 182 → `"271 tests passed, 10 skipped, …"` | The number moved with the tree. The skips are inside the asserted string, so a future edit cannot quietly drop them |
| `jobtrackerPrivacyBoundary` reworded | The boundary row was rewritten when the receipts moved from docs to source. Same promise, named against what is now actually linked |
| **+2 new keys** — `jobtrackerRulesOnlyBoundary`, `jobtrackerStaleDocsBoundary`, both asserted in `atlas.spec.ts` | The file now claims a shipped web app. The two limits that keep that claim honest are asserted, not merely written: delete either boundary row and the suite fails. **Net: assertions added, none removed** |
| `StoryShell` ¶06 litany `"182 backend tests"` → `"271"` | It deep-links `#v-jobtracker-4`, the row whose number changed. The two move together or the litany quotes a dead number |
| `StoryShell` ¶05 Applied muted line | Read "…and the classifier runs in your browser." All three layers DO run in a browser — in the HF Space. Under "Applied reads it" the sentence reads as a claim about getapplied, where the verdict is rules-only. Now: "inbox in, a pipeline of real applications out" — true end to end, needs no asterisk |

## Verification at close

`tsc --noEmit` clean · `eslint . --ext .ts,.tsx` clean ·
`prettier --check "src/**"` clean · production build clean (8 static
routes, `NEXT_PUBLIC_BASE_PATH=`).

Gates: **proof-manifest passed** · **contrast passed**.

Playwright against the static export on **:3200** —
**chromium-desktop 127 passed** (atlas, dossier, nav-and-images,
paper-memory, comprehensive-qa) · **chromium-mobile 48 passed** (atlas).

**Links.** Every external `href` the built export ships on `/` and
`/projects/jobtracker/` was fetched live: **31 of 33 return 200.** The
two exceptions are the pre-existing LinkedIn profile links, which return
LinkedIn's `999` anti-bot status to a non-browser agent and `301` to a
browser one. Neither was touched this round. Every one of the 21 pinned
`yadava5/applied@36a2f54` paths resolves.

Evidence in `docs/design-lab/shots-dossier/` (`shoot-dossier-repin.mjs`):
the kicker with the new status line and pin ledger, the rewritten
summary, fig. 2's RLS gate, the receipts table, all four boundary rows,
the three-entry corrections register, the relabelled provenance strips,
and ¶05's closing index at 1440 and 390.
