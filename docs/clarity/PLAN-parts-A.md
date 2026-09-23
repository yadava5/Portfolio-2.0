# Parts that don't depend on the design (drafted while picasso runs)

## Phase 1 · The numbers (claims reconciliation) — ships first, alone

Rule for this phase (owner 2026-09-22): the site matches **Résumé 2.0** wherever the résumé speaks. Where the résumé is silent, the site's claim must be true on its own. Numbers the résumé doesn't carry go to their current values in the repos.

| # | claim | today | becomes | source / definition site | surfaces that move together |
|---|---|---|---|---|---|
| 1.1 | Applied rule count | 201 regex rules | **220** | `rules.py PATTERNS` @ `0285675` (129+31+60; 48 vetoes excluded) | index `:1808`, fig. 04 aria `:1815`, desk label `:3320`; `check-figures` rule-count run regex **and** its `cases` regex rebound from the 2026-08-02 history note to the live receipt |
| 1.2 | Applied accuracy | macro-f1 0.9791 · 2 misclassified | home, manifest and gate card: **"1 wrong out of 96 (0.990 macro-f1), the rules stage"**. The receipt keeps the artifact's printed 0.9896 and says it rounds to 0.990 | `baseline_rules_v3.json` @ `0285675`; re-run exit 0; CI 34429395505 | index `:1663 :1809 :2233`, comment `:78`; `proofManifest.ts:217-234`; receipt 05 + protocol `:726-729` re-pinned **in place** with a **new** `APPLIED_EVAL_SHA`; `check-figures` needle `0.9791` → `0.990` (or it goes vacuous) |
| 1.3 | Applied backend suite | 305 passed · 0 skipped @71b74f8 | **3,747 passed · 0 skipped · 13 expected failures** @0285675 | CI run 34429395505 | index `:2093`; receipt 04 in place, `APPLIED_SUITE_SHA` → `0285675`; `proofManifest.ts:236-257`; `check-figures:113-134` |
| 1.4 | Applied coverage | 53% | **69%** (9,786 stmts, 3,054 missed) | same run | `proofManifest.ts:468-480` |
| 1.5 | ONNX build | "int8 onnx via transformers.js — 90 mb ⟶ 23 mb" (present tense) | the résumé's wording: **"built in-browser inference: an int8 onnx export, 90 to 23 mb, served by transformers.js"** | owner ruling (match résumé); `readme_facts.py:2481-2507` | index `:1810`; `projects.ts:281,306,316` (+ comment `:242-247`); case file outcome 02, notClaiming, arch summary, node detail — all in past tense |
| 1.6 | /evidence "runs on the desktop app and in the browser Space" | false (desktop app deleted 2026-08-12, Space private 2026-08-15) | removed; the past-tense build line instead | V9, V10 | `proofManifest.ts:202` |
| 1.7 | ¶04 "on a device you control" | false for the Gmail product | "files what it's sure of and asks you about the borderline ones" (résumé: "human review of low-confidence cases") | V6, V7 | index ¶04 mutedln |
| 1.8 | fig. 04 "held … for a person to settle" | partly wrong | "…only flagged. A person reviews it if its confidence is 0.70 or more; below that the hosted pipeline sets it aside" | V5, V6 | aria `:1815`, DRAWING_TOKENS appliedFig, hold label `:3420/:3474` → "held for review", archive `case-figures.mjs:63-110` |
| 1.9 | Cadence routes | 37 | **36** | cadence `6d09ee4` `api/index.ts` ROUTES | index `:1832`; **new** `check-figures` entry so it can't drift a third time |
| 1.10 | internship compliance | "legacy laravel reporter ⟶ etl ⟶ … compliance 0% ⟶ 97%" (the arrows read as causation) | the résumé's wording: "…code compliance across 61 projects: 0% in 2023, 97% now" | ledger | index `:1779`; fig. 03 aria keeps the pinned "97 percent" tokens |
| 1.11 | AutoML gating | "a human gate at every step / every phase / gated ×7 / 7 phases, every one gated" | the résumé's wording: "behind human-review gates"; prose names the gated phases the code proves (feature engineering and training) | ledger 2026-09-11 | index `:1668 :2045 :2046 :2238`, comment `:82`, fig. 09 labels `:4508 :4579`; `projectCaseStudies.ts:1219` qualified. **The fig. 09 drawing still has seven booms** (see open question) |
| 1.12 | AutoML sandbox | "network-isolated by default" | dropped, matching the résumé (true of the code default, false of the beta deploy) | V (R21) | index `:2048` |
| 1.13 | Glyph SIMD | "4 hand-written simd paths" | the résumé's passive "hand-written simd kernels for 4 instruction sets … on an existing 2-layer c++ mlp" | Résumé 2.0 | index `:1875`; `check-figures` Glyph · simd run regex |
| 1.14 | case file "verified: 2026-08" | — | "2026-09" | — | `projectCaseStudies.ts:524` |
| 1.15 | **withdrawn weights still served** | outcome 02 links `ml/browser/site` @`36a2f54`; `model.onnx` 22.8 MB answers 200; weights partly fitted on a real mailbox | artifact → `ml/browser/export_onnx.py` @`0285675`; the note at `:980` stays untouched; a new dated erratum says why the link moved | V11 | `projectCaseStudies.ts:916-923` |
| 1.17 | fig. 04 hold note | "nothing reached 0.85, so it keeps the rules' own guess" (imprecise: a SetFit verdict at 0.72 settles without reaching 0.85; claims-audit H14) | "nothing cleared its desk, so it keeps the rules' own guess" | claims-audit H14 | JS literals `:3423`, `:3476-3477` |
| 1.18 | coverage sub-figures | the /evidence coverage row carries 53%-era per-package figures | **every V13 sub-figure moves with the 69%**: cloud 93.0, auth 89.6, database 80.8, classifier 78.0, credentials 67.4, email_clients 42.7, scripts 40.0, tracking 28.9 | CI 34429395505 | `proofManifest.ts:468-480` (the companion-field failure mode) |
| 1.16 | errata | — | one dated entry per moved claim (eleven, listed in copy-v1 §4), appended, none deleted | owner rule | the corrections arrays of jobtracker, taskflow-calendar, automl, master-inventory |

**Out of this repo (listed, needs the owner's go):**
- Applied System Card: 219 rules, 3,163/3,153/10 tests, 25 RLS, "refusing to merge", "on-device", "held-out".
- Applied README:162 "fails any merge".
- Scrubbing the weights from Applied's git history.

**Verification:**
- `npm run build`, then grep `out/**` for the old strings: `201 regex`, `0.9791`, `305 passed`, `37 routes`, `53%`, `on a device you control`, `desktop app and`, `via transformers.js`, `every step`, `gated ×7`.
- A hit may remain only inside a dated history note or erratum.
- `verify:portfolio` must be green; labrat runs the full suite.
- The golden re-record goes in its own commit.
- **Negative tests:** the `check-figures` needles must go red on the *old* HTML in a temp copy, never on `out/`.

## Phase 2 · Résumé and contact (yoda's decision, as adopted)

| # | change | detail | gate |
|---|---|---|---|
| 2.1 | `public/resume.pdf` := Résumé 2.0 PDF | 61,814 B, 1 page, sha `ac9d05…`; the owner's file is copied byte for byte and never regenerated | `closureFloorsBytes` ≥50,000 ✓ |
| 2.2 | ¶02 record card | new rows after `degree`: `email · aesh.03.23@gmail.com` (mailto) and `résumé · pdf · one page ⟶` (same tab, no `download`, no date) | **⟶, not ↗**, since the link is same-origin (`check-links` glyph contract; yoda's note said ↗, which would go red) |
| 2.3 | archive colophon (`partials.mjs colophon()`) | "the working paper ⟶ · résumé (pdf) ⟶" | `check-crosswalk` may trip on a second anchor in the colophon `<p>`; run it |
| 2.4 | ¶13 dawnrow | add `résumé (pdf) ⟶` between linkedin and "the working paper ⟶" (label kept per yoda). Its target is owner question 15; recommended: `/evidence/` | glyph contract |
| 2.9 | ¶12 colophon | a small `email · résumé (pdf) ⟶ · github ↗ · linkedin ↗` row in the footer, so a reader who scrolls to the end finds contact without pressing approve (cold critic round 2) | glyph contract; G5 extends to it |
| 2.5 | gate note | "scrolling could not press this button · pressing it only turns the page to morning." | — |
| 2.6 | ¶13 before approval | `inert` + `aria-hidden="true"`, removed on approval | **new test, red on today's build first:** a Tab walk finds 0 focus stops at effective opacity 0 (today: 4) |
| 2.7 | reduced motion | the approve handler's RM branch (`:5373`) sets `body.atmorning` and reveals ¶13 at once. Today `wake()` returns early and ¶13 never appears | **new** `reduced-motion.spec` case, red on today's build first |
| 2.8 | ¶12 gate stays last before approval | `run-home.spec.ts:326-336` (`#nextmorning` height 0) **keeps passing**; the email is now reachable in ¶02, so the gate no longer hides contact | unchanged |

Sequencing: Phase 1 ships first, and the résumé links go in the commit after (yoda).

## Phase 7 · Interaction fixes (JS, measured defects)

| # | defect (inventory §) | fix | proof (red today, green after) |
|---|---|---|---|
| 7.1 | §10 the pad reads a small off-centre "1" as "7 · 99.8%" | MNIST preprocessing in `extractPixels()`: crop to the ink bounding box, scale the long side to 20 px, paste into 28×28 so the centre of mass sits at the centre | new test: the stroke (62,38)→(62,110) must read `1`; today it reads `7`. The 97.01% claim is offline, so nothing moves |
| 7.2 | §8 `#mtoggle` | clickable on desktop; `aria-expanded` mirrors what's actually shown (the pill vs the ledger, driven from the same place `.compact` is set); Escape and outside-tap close; target ≥24 px (44 on the phone); the control doesn't jump when opened | new test: a real mouse click toggles it on desktop; Escape closes it; aria equals the visual state across a sweep |
| 7.3 | §7 hover-only reveals | figs 04/07: focusable marks, focus shows the same reveal, and a tap toggles it; or, on touch, the reveal info moves into the caption. fig. 05's caption says "tap or hover" | new test: keyboard focus on a desk sets `.tracing` |
| 7.4 | §12.2 the replay button stays `hidden` | `replay.hidden = false` in the `finally` block | assert `el.hidden === false` after ready |
| 7.5 | §12.1 `#clear` clipped at 320 | the padbar wraps or shrinks; `HOME_WIDTHS` gains 320; add a per-element rect check | new overflow check, red today |
| 7.6 | §6 values break from units | U+200A → U+202F (narrow no-break space) at the 7 number/unit joins; a `nowrap` span around each value+unit | `check-stations` decodes `&#8202;`; verify no station string carries one |
| 7.7 | §4 the nameplate shows "·yu·h Y·d··" for 1.8 s | the design phase decides; the `check-nameplate` gates and their negative twin must stay green | — |

## Phase 8 · New gates (each shown red on today's build, in a temp copy)

| gate | asserts | where |
|---|---|---|
| G1 · no dashes | no U+2014, U+2013 or spaced hyphen in the **visible text** of every `out/**/*.html`, with verbatim quotations allowlisted by selector (`blockquote`, `.endquote`) | `scripts/qa/check-dashes.mjs`, in verify-portfolio |
| G2 · reading floor | no HTML text a person reads under 12 px at 390 and 1440 (computed DOM px); SVG labels keep `check-figures`' own floor | playwright |
| G3 · mono is for machine values | `font-family` mono only on an allowlist of machine-value hooks (from the design phase's table) | playwright, computed style |
| G4 · manifest never covers text | overlap = 0 at 1512/1440/1280/390/320 | playwright sweep |
| G5 · contact is reachable | a visible mailto and `/resume.pdf` link in ¶02 without approving; 0 invisible focus stops; RM approve reveals ¶13 | run-home + reduced-motion specs |
| G6 · the pad normalises | 7.1's off-centre trial | run-home |
| G7 · 320 | `HOME_WIDTHS` gains 320, plus per-element rects | run-home |
| H · desktop non-regression | the harness scorecard at 1512/1440/1280: every number equal or better than `harness/baseline` | release checklist (a local script, not CI; too slow) |
