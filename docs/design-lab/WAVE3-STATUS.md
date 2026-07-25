# WAVE3-STATUS — the subpage, print and SEO sweep

**Appended to `CRITIC-LEDGER.md`, after `WAVE2-STATUS.md`.** Branch
`redesign/daylight-study` @ `6a25884` (origin/main after PR #8) → this worktree.
Wave 1 shipped the home P0s, Wave 2 the home P1/P2s. Wave 3 takes every
remaining fault whose surface is **not** the home page, plus the shared-infra
items Wave 2 deferred because they were not home-scoped.

**Method:** each fix probed against the live static export
(`NEXT_PUBLIC_BASE_PATH= npm run build` → `out/` served on :3200) with
Playwright. Two harnesses, both reusable:

- `docs/design-lab/shoot-w3print.mjs` — the print edition. Scrolls the whole
  document (a reader prints *after* reading), switches to `emulateMedia:
  print`, then measures every visible text node's computed colour against the
  paper it will actually land on (white), counts fixed-position boxes that
  would repeat on every sheet, counts reveal targets still under 0.9 opacity,
  and checks the five strings F04 recorded as printing blank. Writes a
  `printBackground: false` PDF per route — the Cmd+P default, which is the
  condition F04 was measured under.
- `docs/design-lab/shoot-w3sub.mjs` — the subpage surfaces: the gate's new
  references block, /evidence's source qualifiers and crosswalk spacing, and a
  per-case-file legend audit.

**Verification at close:** build clean · `eslint` clean · `tsc --noEmit` clean ·
contrast gate passed · proof-manifest gate passed · asset-budget gate passed ·
`test:seo` passed · Playwright — chromium-desktop 119 (atlas, dossier,
nav-and-images, paper-memory) + 26 passed / 1 skipped (a11y-audit, interactions,
comprehensive-qa, reduced-motion) + 7 (frame-governor, probe build),
chromium-mobile 48 (atlas), firefox-desktop 5 (scroll-engine), static-seo 24
across all three projects.

---

## Disposition — every ledger fault

`w1`/`w2` = closed in an earlier wave (see WAVE2-STATUS). `w3` = this wave.

| # | Fault (short) | Status | Note |
|---|---|---|---|
| F01 | contact lands on a page with no contact info | fixed (w1) | |
| F02 | page never says who this is until 93% scroll | fixed (w1) | |
| F03 | ¶04 pin holds 978px and develops nothing | fixed (w1) | |
| **F04** | **printing loses chapters 06 and 07** | **fixed (w3)** | See "The paper edition" below. 3 blank pages of 10 → 0; low-contrast-on-white text nodes 0 across 6 routes; fixed boxes repeating per sheet 0 |
| F05 | header nav writes no history | fixed (w1) | |
| F06 | half the thesis at 25% opacity at rest | fixed (w1) | |
| F07 | dead paper before ¶05 | fixed (w1) | |
| F08 | mobile gate opens with 440px of nothing | fixed (w2) | |
| F09 | `/#values` lands on the wrong chapter | **engine pass** | Landing contract + F69's offset constant; a dedicated pass owns it |
| F10 | "skip to the work ↓" does not go to the work | fixed (w2) | |
| F11 | hero's three case files are not the ones argued | fixed (w2) | |
| F12 | one project, three names | fixed (w2) | |
| F13 | rail is seven tab stops with invisible labels | fixed (w2) | |
| F14 | motion off, the rail claims you've read everything | fixed (w2) | |
| F15 | static world paints boxes the motion world doesn't | **root-caused, not a bug (w3)** | The rectangles are `html[data-tier="print"] [data-chapter] figure:has(> figcaption) { outline… }` — the print tier's *deliberate* monograph dressing (governor §F1c), not a containment artifact. It is a live design question (it also boxed this wave's testimonial until that block stopped being a `<figure>`), but it is an authored rule, and reverting it is a design call for the home pass — not a defect fix |
| F16 | mobile hero is seven 13px links in a 320px stack | partial (w2) → **home pass** | Remaining half is a mobile-layout redesign of the hero — StoryShell ch01, out of this wave's remit |
| F17 | fig 6.1 bottom-aligned into a void | fixed (w2) | |
| F18 | chapter pacing 4:1 out of balance | **structural** | Adds chapters to a seven-chapter contract |
| F19 | closing page 44% empty to the right | fixed (w2) | |
| F20 | approval stamp reads as a file-drop target | fixed (w2) | |
| F21 | interactive gate approves a row with no data | fixed (w2) | |
| F22 | reference #3 cites a retired project | fixed (w2) | |
| **F23** | **no structured data anywhere** | **fixed (w3)** | Person + WebSite from the root layout (every route); TechArticle + a typed project node per case file; CollectionPage on /evidence. `src/lib/seo.ts`, composed from the data layer |
| F24 | `/world-preview/` ships to production | **partial (w3)** | `robots.txt` now disallows it (it was `Allow: /` and nothing else). The route stays exported on purpose: `day-arc.spec.ts` and `shoot-arc.mjs` both drive it against the real static build |
| **F25** | **four case studies use an SVG as og:image** | **fixed (w3)** | Nine rendered raster cards, `npm run assets:render-og`. See "Spec edits" |
| **F26** | **/evidence shares as the homepage** | **fixed (w3)** | Its own openGraph + twitter block and its own card; `og:url` now `/evidence/` |
| **F27** | **404's recovery button leaves the site** | **fixed (w3)** | `withBasePath("/")` in `error.tsx` |
| F28 | two clocks contradicting each other | fixed (w1) | |
| F29 | the gate clock's real defects | fixed (w1) | |
| F30 | "arrival" ×3 and "06:12" ×2 in the top 170px | fixed (w2) | |
| F31 | "cincinnati, ohio" printed twice | fixed (w1) | |
| F32 | type scale bloat | partial (w2) | Remaining one-offs are a five-token collapse — a design decision |
| F33 | 10px/11px mono | fixed (w2) | |
| F34 | a fourth typeface leaks in | fixed (w2) | |
| F35 | hierarchy inversion | fixed (w2) | |
| F36 | fig 5.1's 120-char caption | fixed (w2) | |
| F37 | the fast-mnist scene is uninterpretable | **scenes pass** | `src/components/scenes/*` is owned by a sibling this round |
| F38 | jetpack chip breaks a sha onto its own line | fixed (w2) | |
| F39 | ragged row affordances | fixed (w2) | |
| F40 | three identical case-file/source/demo triplets | fixed (w2) | |
| F41 | every link ends in ⟶ | fixed (w2), **extended (w3)** | The one surface still breaking the contract was /evidence: a `public/…` source printed `↗` ("leaves the site") for a URL on this origin. Same-origin sources now print `⟶`. Measured: same-origin `↗` links on /evidence 3 → 0 |
| F42 | the em dash has eaten the site's punctuation | **wontfix here** | 87 in home's visible text, 50 on a case file, 16 on /evidence. Rationing to one per paragraph is a full copy rewrite across every kicker, caption and receipt, several asserted verbatim by specs. Content decision, unchanged from Wave 2's reading |
| F43 | vocabulary overload | **fixed (/evidence half, w3)** | "receipt" on /evidence 23 → 11. The `receipt:` term said the same word the value said two words later; the relation the reader needs is *where the claim is argued*, so the term is now `argued in:`. Receipt numbers stay — they are the anchors. Home's `gate` ×15 is unchanged: still a copy decision |
| F44 | `⟶✓` and `✓passed` set without a space | fixed (home half w2), **fixed (/evidence half, w3)** | A thin space (U+2009) parts the crosswalk arrow from the reading-history ✓ |
| F45 | ~200px hole in the hero | fixed (w1) | |
| F46 | the `n.b.` dashed box is an orphan style | fixed (w2) | |
| F47 | duplicate social links | fixed (w2) | |
| F48 | unguarded `getFullYear()` | fixed (w2) | |
| **F49** | **prerender ships `—:—` and no usable `<h1>`** | **fixed (w3)** | Closes by its own fix line (F02 + F23 + F29): `—:—` count in `out/index.html` is 0 (w1), the standfirst prints "Ayush Yadav — software engineer · Cincinnati, Ohio" (w1), and the JSON-LD Person node now answers the name query directly (w3). The `<h1>`'s *wording* is a hero decision, left to the home pass |
| **F50** | **sitemap lastmod is a stale constant** | **fixed (w3)** | Each case file reports its own `verified` — the same field its kicker prints, so the two can never disagree; the index pages report the newest |
| **F51** | **404.html carries the homepage title and is indexable** | **fixed (w3)** | `title: "Not found \| Ayush Yadav"`, `robots: { index: false }`. Asserted in `check-static-export-seo.mjs` |
| F52 | hardcoded seasons and a decaying self-description | **partial (w3)** | The self-description half is fixed (see "Spec edits"). The season half — `"summer 2026"` at `StoryShell.tsx:461` and `Header.tsx:220` — is deliberately **not** half-done: deriving one and not the other makes them disagree in October, which is worse than the fault. Both are the home dateline; they move together, in the home pass |
| F53 | the GPA claim | fixed (w2) | |
| **F54** | **the evidence ledger has a blank row** | **fixed (w3)** | e-11 cut. Ledger 12 → 11 entries; rows with no date 2 → 0; rows with no receipt 2 → 1 (jetpack, which has no case file and says so) |
| **F55** | **three "external artifacts" link back into this site** | **fixed (w3)** | New `sourceKind` on the manifest: `self-hosted` ×3, `self-authored` ×2, printed verbatim beside the source |
| F56 | the registry has no data column | fixed (w2) | Shared component; both surfaces |
| **F57** | **`[local — verified on request]` prints on 7 pages for 2 rows** | **fixed (w3)** | Legend renders only where its badge does. Measured across all seven case files: pages printing the legend without the badge 5 → 0 |
| **F58** | **two real recommendations render nowhere** | **fixed (w3)** | The manager recommendation now closes the gate chapter. See "The reference" below |
| F59 | half of `projects.ts` is written and never rendered | **partial (w3) + ledger correction** | See "Ledger corrections" |
| F60 | the comment layer out-writes the content layer | **partial (w3)** | `HeldStamp.tsx`'s 27-line essay (and its promise of a Phase 3 that never shipped) moved to a five-line summary pointing at the docs that own the rationale; `StoryShell.tsx`'s "three editorial rows" corrected to four. `scenes/manifest.ts` (54%) belongs to the scenes pass; `OnFileManifest.tsx` and `AuditRun.tsx` are documented behaviour, not rationale, and were left |
| F61 | header paints cream over a dusk page | fixed (w1) | |
| F62 | the ¶05 → ¶06 seam is a 690px void | fixed (w1) | |
| F63 | Red Thread jumps 97px at 1280px | **engine pass** | |
| F64 | the flagship type token is dead | fixed (w2) | |
| F65 | the label token's 12px floor | fixed (w2) | |
| F66 | scene text at ~6–8px on a phone | partial (w2) + **ESCALATE-FABLE** | Unchanged; the phone half needs a redraw, see WAVE2-STATUS |
| F67 | the signature act at ~6.3px on a phone | fixed (w2) | |
| F68 | `scrollEasing`/`SCROLL_DURATION` are dead | **engine pass** | |
| F69 | four contradictory beliefs about header height | **engine pass** | |
| F70 | every reduced-motion rule written twice | **engine pass** | |
| F71 | thread + overlay do not exist without JS | **engine pass** | |
| F72 | a governor downshift leaves fig 4.0 lying | **engine pass** | |
| F73 | a GC pause can strand the tab in print tier | **engine pass** | |
| **F74** | **a test harness ships in the production bundle** | **fixed (w3)** | `NEXT_PUBLIC_TEST_PROBES`, threaded through `package.json`, `playwright.config.ts` and `next.config.ts`. Verified both directions — see "Spec edits" |
| F75 | motion readers see a lighter headline at rest | fixed (w2) | |
| F76 | chapter content flashes on slow font loads | fixed (w2) | |
| F77 | the ¶04 pin ends with ~19vh of frozen screen | **engine pass** | Pin geometry |
| F78 | a fourth mantra would play first | fixed (w2) | |
| F79 | `.thread-dip` computed for everyone | **engine pass** | |
| F80 | three "authored editions" that are one | **engine pass** | |
| F81 | five suppressions of one lint rule | **engine pass** | |
| F82 | load-bearing comments that are false | **engine pass** | |

---

## The paper edition (F04)

Until this wave `globals.css` carried **zero `@media print` rules** in 2,000
lines. The block is now the last thing in the file, in nine parts, and the
cheapest of them does the most work:

**Rebind the tokens, not the rules.** `--color-ink-dusk` becomes the day ink and
the three lightened night clays (`night`, `ember`, `invite` — 2.6:1, 2.2:1 and
2.4:1 on white) collapse onto the day clay, which is 5.5:1 there. Because
Tailwind's theme colours compile to those same variables, one `:root` block
inside the media query fixes every `color`, `fill`, `stroke` and `color-mix()`
in the file at once, utilities included. `--color-ink-secondary` (7.2:1 on
white) and `--color-clay` are left alone: the document's two-ink hierarchy
survives the trip to paper intact.

The rest: the day-arc/dusk/grain/dossier backgrounds come off; the light field,
the chapter rail, both threads and the pipeline overlay are `display: none`
(fixed boxes repeat on **every** sheet); the masthead goes `position: static` so
it prints once, at the top of page 1, instead of striking through body text on
page 8; every reveal target is forced to `opacity: 1` and `transform: none`
(a print can be taken mid-entrance, and A7 says the resting state is the
finished state); the GSAP pin-spacer unwinds; rows, figures and headlines get
`break-inside: avoid`; and external links print their address once, because on
paper the href is unreachable and "every claim terminates at an artifact
somewhere else" is the entire argument.

Two defects were found by the probe rather than reasoned about:

1. **Reverse-out chips printed white-on-white** — the masthead's `resume`
   button and the 404's return CTA are knockout text on an ink *background*,
   and backgrounds do not print at Cmd+P defaults. Measured 1.00:1, on the two
   affordances a screener actually reaches for. They now carry
   `data-print-invert` and trade back to ink-on-paper in the hairline frame
   they already had.
2. **The litany sheared mid-glyph** — "Make it honest." broke across a page
   boundary with its receipt line on the next sheet. Fixed with
   `break-inside: avoid` on `[data-tm-mantra]`/`[data-tm-receipt]`.

Measured, `printBackground: false`, six routes (home motion world, home static
world, /evidence, two case files, 404):

| Metric | Before | After |
|---|---|---|
| Visible text nodes below 4.5:1 **on white** | 1 (home) → but see note | 0 on all six routes |
| Fixed-position boxes (repeat on every sheet) | header + rail | 0 |
| Reveal targets still faded at print time | — | 0 |
| Of F04's five blanked strings, missing | 5 (chapters 06/07 blank) | 0 |
| Home pages (motion world) | 10, three of them blank | 8, none blank |
| Home pages (static world) | — | 14, none blank |

The static world prints longer because its chapters carry their waypoint
paint as real block backgrounds rather than a fixed field, so the page
boxes are taller. Longer is not the fault; blank was.

*Note on the "1": the first probe run was already past F04's original
condition (the dusk chapters were legible) because the token rebinding had
landed; the single remaining failure was the knockout `resume` chip, item 1
above. The PDFs for both runs are in `shots-w3sub/`.*

---

## The reference (F58)

`src/lib/data/testimonials.ts` held a ~180-word recommendation from the
author's actual manager, with a LinkedIn URL, and had **zero importers**. On a
site whose thesis is that every claim should terminate at an artifact outside
itself, the only third-party artifact in the repository was the one thing it
did not show.

**Placement: the gate chapter, under the endnotes.** The closing page already
carries a heading that says *references* — and the endnotes above it are
references to evidence, so a reference to a *person* belongs in the same
apparatus, one register warmer. It is the last thing a reader passes before
deciding whether to write. (/evidence was the alternative and is the wrong
room: that page is a ledger of claims the site makes, and a recommendation is
not one of them.)

**Four honesty conditions, all visible on the page:**

1. The passage is a **contiguous verbatim excerpt** — five unbroken sentences.
   `testimonials.ts` now carries a module-scope gate that throws during
   `next build` if any `excerpt` is not a substring of its `quote`, so "no
   paraphrasing" is enforced by the build rather than promised in a comment.
2. It is **disclosed** as an excerpt, with where the full text lives.
3. The person is **named, with his own title**, unedited.
4. The link goes **to him**, not to a screenshot of him.

**The excerpt names no employer.** The home page already says "Miami
University" (¶02) and the one-mention-per-surface rule holds; the
recommendation's first and seventh sentences both name it. The five sentences
chosen are the assessment a stranger can act on *and* the longest contiguous
run that does not reintroduce the noun. Measured: `Miami` inside the gate
chapter = 0.

**The teammate recommendation is deliberately excluded**, with the reason
written into the data file beside it. It is real and nothing about it is
doubted — but it is a capstone teammate writing about his capstone teammate,
the one reference shape a hiring reader discounts on sight because the
incentives are symmetric and both parties know it. Printed beside a manager's
specific account of delivered work it would not add a second reference; it
would put a question mark over the first. This wave has just cut a ledger row
for padding (F54); doing the opposite two chapters later would be an argument
against itself.

---

## Spec edits, and why they were justified

**F25 — the cards are typographic, and the old raster was deleted.**
The ledger's fix line offers "render PNG derivatives … or fall back to
`og-image.png`". Both options were wrong. `public/og-image.png` was the
*retired dark-neon edition* — wrong palette, wrong typeface, wrong site — and
it printed three tallies (`1M+ rows`, `738 tests`, `50+ docs`) that appear in
no ledger and contradict the numbers the site does source (1,145 tests, 72
tests, 19/20). Falling back to it would have made every unsourced card the
site's default share image. It and `og-image.svg` are deleted.

`scripts/asset-truth/render-og-cards.mjs` renders nine cards instead: the
site's own paper, the double rule, the page's kicker, its title, and its own
deck — every string read out of the data layer, no number on any card, no
imagery at all. The data is parsed out of the TS source rather than imported,
following `check-proof-manifest.mjs`'s existing house pattern (the data modules
import `@/lib/utils`, which no bare node process resolves). The render host has
none of the three webfonts installed, so the cards set in the host's best serif
and mono — a deliberate, stated tradeoff: a typographic card in Georgia is a
better artifact than a screenshot or an invented illustration.

`check-static-export-seo.mjs` now enforces three new rules — no SVG social
image, the referenced card must exist in the export, and every route's `og:url`
must be its own — plus the F23 and F51 assertions. `check-asset-budgets.mjs`
budgets every card at 150KB (largest is 36KB): past that it has stopped being
type and started being an image.

**F52 — the decaying phrase came off rather than acquiring a review date.**
The ledger asks to "set a review date on 'recent'". A review date only *moves*
the decay and depends on a human reading it. The description now describes what
the site **is** — seven case files, each claim terminating at an artifact, and
an index that lists them — which has no shelf life. The season half is
untouched and stays whole; see the disposition note.

**F54 — the cut also came out of the QA gate.** `check-proof-manifest.mjs`
listed `paid-internships-sources` in its `requiredIds`, so deleting the entry
alone would have failed the gate. The id is removed with a comment saying it is
deliberately not required, so nobody restores it as a "fix".

**F55 — a data-model field, not a relabelling.** The ledger says "mark them
`[self-authored]` or move them to the repo". Marking them in JSX would have put
the distinction in the view, where the next surface to render the manifest
would lose it. `sourceKind` is on the entry, so any surface that renders a
source can render its standing — and the two levels are kept distinct, because
they are: a checked-in ledger *is* an artifact (it is merely hosted here),
while a README status line is documentation *of* a result.

**F74 — the ledger's own fix does not work, and the obvious flag was not
enough either.** The suggested `NODE_ENV !== "production"` would delete the
probe from the only build that tests it: the e2e scripts run a real
`next build`, so `NODE_ENV` is `"production"` in the very build
`frame-governor.spec.ts` exercises, and the spec would go green by never
running its assertions. The gate is `NEXT_PUBLIC_TEST_PROBES` instead, set by
`test:e2e:probes` and by nothing else.

That alone still shipped the harness: **an unset `NEXT_PUBLIC_*` variable is
not substituted at all** — the reference survives into the bundle, evaluates
false at runtime, and the whole remote control ships as unreachable-but-present
code. Verified by grep after the first attempt. Declaring the key in
`next.config.ts`'s `env` makes the value always a string literal, so an unset
flag compiles to `"" === "1"` and the minifier deletes the block.

Verified both directions:

| Build | `__frameGovernor` in `out/_next/static/chunks/` | frame-governor.spec |
|---|---|---|
| `npm run build` (deploy) | **absent** | guard throws with a build instruction |
| `npm run test:e2e:probes` | present | 7 passed |

`playwright.config.ts` throws before starting the server if a probe spec is
requested without the flag, so the failure mode is an instruction rather than a
null dereference.

**F24 — robots, not route exclusion.** The ledger offers "exclude the route
from the export, or move it behind a build flag". Both break real work:
`day-arc.spec.ts` and `docs/design-lab/shoot-arc.mjs` drive `/world-preview/`
against the *real static build*, and a bench you cannot screenshot is a bench
you stop trusting. The page already carried `noindex`; what it lacked was a
`robots.txt` that mentioned it. Now it has one. Full exclusion remains
available if the bench ever stops earning its keep.

**F43 — the term changed, the numbers did not.** The `receipt:` label was
renamed `argued in:`, not the receipt *labels* — those carry the anchor numbers
(`receipt 04` → `#v-jobtracker-4`) and renaming them would break the crosswalk
the page exists to provide.

---

## Ledger corrections

Three places where the ledger's own claims did not survive checking.

**F59 — three of the "zero call sites" functions have call sites.**
`getFeaturedProjects()`, `getPublicProjects()` and `getProjectsByCategory()`
are all imported by `tests/playwright/portfolio-fixtures.ts`, which derives
spec expectations from them — so `portfolioVisible: false` *does* filter
something: the fixtures. Deleting them would have deleted a test contract.
`getCurrentExperience()` was the real finding and is gone: no entry in
`experience.ts` has ever carried `"Present"` (the one role ended 2026-05), so
it could only ever return `undefined`, and it had no callers to notice.
`getRandomTestimonial()` went with it — which reference a reader sees has to be
a defensible editorial decision, and in a static export a coin flip means the
build's dice, frozen, forever.

The `97.01%` figure the ledger flags is the other half. It sits in three fields
with no consumers (`fullDescription`, `highlights`, `metrics`) while the site's
ledger stamps `~97%` **HELD**. A dead field is a loaded gun: the day someone
renders it, the page ships a precise figure the ledger two clicks away refuses
to make. All three now say what the ledger says. The fields themselves are
*not* deleted: `proofIds` and `metrics` are read by
`check-proof-manifest.mjs`'s cross-check, so "delete the dead fields" would
disarm the gate that keeps every visible metric tied to a proof id. Which of
the remaining fields to keep is a data-model decision, and it belongs with the
person who will decide whether `lifequest` ever ships.

**F15 is not a containment artifact.** The hairline rectangles the ledger
compares between `motionoff-automl.png` and `desk-motion-11-y4250.png` come
from an *authored* rule — `html[data-tier="print"] [data-chapter]
figure:has(> figcaption) { outline: 1px solid …; outline-offset: 14px }`, the
print tier's monograph dressing (governor §F1c). The static world genuinely is
"the same drawing minus movement" plus one deliberate flourish. Whether that
flourish earns its place is a real design question — it boxed this wave's
testimonial block hard enough to strike through the disclosure line beneath it,
which is how it was found — but it is a design call, not a defect.

**The one-Miami-per-surface rule is already broken on home, independently of
F58.** The home page names Miami twice: ¶02's bio ("a recent computer-science
graduate from Miami University") and ¶03's experience row ("miami university ·
oxford, ohio"). This wave's addition contributes zero. Flagged for the home
pass — the F58 block was written to the rule and holds to it.

---

## Evidence

- `docs/design-lab/shoot-w3print.mjs` — the print harness (per-route PDF +
  computed-colour probe)
- `docs/design-lab/shoot-w3sub.mjs` — the subpage harness
- `docs/design-lab/shots-w3sub/` — 6 print PDFs, 4 screen captures,
  `print-after.json` and `probe-after.json`

Measured deltas:

| Metric | Before | After |
|---|---|---|
| `@media print` rules in `globals.css` | 0 | 1 block, 9 parts |
| Print: text nodes below 4.5:1 on white (6 routes) | — | 0 |
| Print: fixed boxes repeating per sheet | 2 | 0 |
| JSON-LD blocks in `out/index.html` | 0 | 1 (Person + WebSite) |
| Routes with a raster social card | 1 (wrong edition) | 9 |
| Routes whose `og:url` is their own | 8 of 9 | 9 of 9 |
| `og:image` values that are SVG | 4 | 0 |
| Sitemap `lastmod` values that are one stale constant | 9 | 0 |
| `404.html` indexable | yes | no |
| /evidence entries | 12 | 11 |
| /evidence rows with no date | 2 | 0 |
| /evidence: "receipt" in visible text | 23 | 11 |
| /evidence: same-origin links printing `↗` | 3 | 0 |
| /evidence: sources qualified as self-hosted/self-authored | 0 | 3 / 2 |
| Case files printing the local-only legend without the badge | 5 of 7 | 0 of 7 |
| Third-party recommendations rendered anywhere | 0 | 1 |
| `__frameGovernor` in the deploy bundle | present | absent |
