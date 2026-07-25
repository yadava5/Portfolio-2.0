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
**not-a-defect**. `w1`/`w2`/`w3` cite the earlier status docs; `w4` is
this wave. Rows marked **†** carry a correction to the ledger's own
claim, detailed after the table.

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
| F15 † | static world paints boxes the motion world doesn't | not-a-defect@w3 · **legibility fixed@w4** | w3 root-caused the rectangles as the print tier's authored figure outline, not a containment artifact. w4 found that outline was invisible anyway (F80) and raised it to a measured ≥3:1 |
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
| **F37** | **the fast-mnist scene is uninterpretable** | **OPEN — unclaimed at campaign close** | The one fault of 82 that closes without a disposition. See "The one that got away" |
| F38 | jetpack chip breaks a sha onto its own line | fixed@w2 | |
| F39 | ragged row affordances | fixed@w2 | |
| F40 | three identical case-file/source/demo triplets | fixed@w2 | |
| F41 | every link ends in ⟶ | fixed@w2 · extended@w3 | |
| **F42** † | **the em dash has eaten the punctuation** | **wontfix@w4** | The ledger's own proposed rule — one per paragraph — is **already met by 123 of 133 paragraphs (92%)**. See "The three declines" |
| **F43** | **vocabulary overload ("gate" ×15 on home)** | fixed (/evidence)@w3 · **wontfix (home)@w4** | The 15 instances carry three distinct senses, and both the technical ones and the metaphor are load-bearing. See "The three declines" |
| F44 | `⟶✓` and `✓passed` set without a space | fixed@w2 + w3 | |
| F45 | ~200px hole in the hero | fixed@w1 | |
| F46 | the `n.b.` dashed box is an orphan style | fixed@w2 | |
| F47 | duplicate social links 400px apart | fixed@w2 | |
| F48 | unguarded `getFullYear()` | fixed@w2 | |
| F49 | prerender ships `—:—`, no usable `<h1>` | fixed@w3 | |
| F50 | sitemap `lastmod` is a stale constant | fixed@w3 | |
| F51 | `404.html` carries the homepage title | fixed@w3 | |
| F52 | hardcoded seasons + a decaying self-description | fixed (description)@w3 · **wontfix (season)** | `"summer 2026"` at `StoryShell.tsx` and `Header.tsx` is one dateline in two places; w3's reasoning stands — deriving one and not the other makes them disagree in October, and deriving both is a home-dateline decision no wave was given |
| **F53** † | **the GPA claim breaks the site's own rule** | **not-a-defect — owner-overruled** | w2 removed it; it is back, by an owner directive dated 2026-07-24 recorded in `StoryShell.tsx:909-919` ("GPA once, semesters named"; the stated boundary is the transcript, offered on request). The ledger's objection was reviewed and overruled by the standing biographical ruling. Recorded here because WAVE2-STATUS still reads "fixed" |
| F54 | the evidence ledger has a blank row | fixed@w3 | |
| F55 | three "external artifacts" link back into the site | fixed@w3 | |
| F56 | the registry has no data column | fixed@w2 | |
| F57 | the local-only legend prints on 7 pages for 2 rows | fixed@w3 | |
| F58 | two real recommendations render nowhere | fixed@w3 | |
| F59 † | half of `projects.ts` is never rendered | fixed (the live half)@w3 · **design-call (the rest)** | w3 corrected the ledger (three "zero call sites" helpers are imported by the fixtures) and neutralised the `97.01%` the ledger stamps HELD. Which dead FIELDS to keep is a data-model decision that belongs with whoever decides whether `lifequest` ships |
| F60 | the comment layer out-writes the content layer | fixed@w3 · **extended@w4** | w3 cut `HeldStamp`'s essay and the "three editorial rows"; w4's F82 sweep corrected six more headers |
| F61 | the header paints a cream bar over a dusk page | fixed@w1 | |
| F62 | the ¶05 → ¶06 seam is a 690px void | fixed@w1 | |
| **F63** † | **Red Thread jumps 97px sideways at 1280** | **fixed@w4** | Both halves, and the ledger's number is wrong by an order of magnitude. See "The engine, fault by fault" |
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
| **Fixed** — the fault as stated is closed | **67** | F01–F14, F16, F17, F19–F23, F25–F31, F33–F36, F38–F41, F44–F51, F54–F58, F60–F69, F73–F79, F82 |
| **Fixed in part**, remainder a recorded decision | **7** | F24, F43, F52, F59, F70, F80, F81 |
| **Not-a-defect** — the claim did not survive checking | **4** | F15, F53, F71, F72 |
| **Design-call / wontfix**, with reasons | **3** | F18, F32, F42 |
| **Open** | **1** | F37 |

Of the 67, this wave was the primary closer for **seven** (F16, F63,
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
