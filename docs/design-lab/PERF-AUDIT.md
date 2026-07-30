# Performance + Micro-Craft Audit — Static Export (Committed State)

- **Date:** 2026-07-18
- **Audited commit:** `3075681` ("docs: project ledger — canonical compact record of the rebuild"), built in a clean worktree (`git worktree add … HEAD`), `NEXT_PUBLIC_BASE_PATH= next build --webpack`, served from `out/` via `tests/playwright/static-server.mjs` on `:3002`.
- **Tools:** Lighthouse 13.0.3 (desktop preset + default mobile: Moto G Power emulation, 4× CPU, slow-4G simulation), Playwright + CDP tracing (4× CPU throttle), axe (via Lighthouse), manual keyboard/forced-colors probes.
- **Read-only audit** — no source files were touched; this document is the only write.

**Test-server caveats (affect two Lighthouse insights, not the scores):** the static server sends no `Content-Encoding` and no `Cache-Control`. GitHub Pages gzips (~no `br`) and sets `max-age=600`. So "document request latency — save 67 KiB (compression)" and "efficient cache lifetimes — 918–924 KiB" are artifacts of the harness; on GH Pages the former disappears and the latter is a platform ceiling (10-minute cache on content-hashed immutable assets — unfixable without changing hosts).

---

## ERRATUM — re-measured 2026-07-30. Both headline findings are FIXED and no longer reproduce.

> Amended, not rewritten (the errata discipline: correct in place, never delete). Everything
> below this block is the 2026-07-18 reading and is preserved verbatim as history. **Do not
> quote §1.2 or §3 as the live state of the site** — they describe a tree that no longer exists.

Re-measured on `redesign/daylight-study` @ `fb608e8`, same harness (`out/` via
`tests/playwright/static-server.mjs`, Chromium 1440×900, CDP CPU throttle, Playwright
`reducedMotion`), motion-world engagement verified (`data-motion-ready=true`, `hero-rise-blur`
+ `hero-ink-settle` running, `tier=core`) so the convergence below is real and not a static
fallback.

**§1.2 — the hero-entrance LCP cost is gone.** Quick win #1 is in source: `hero-rise` starts at
`opacity: 0.15` rather than 0 (globals.css:986, comment cites "PERF-AUDIT fix 1"), stagger
110→60 ms, duration 1.0→0.6 s (globals.css:1004–1009). Pixels exist at first paint.

| Condition | 2026-07-18 | 2026-07-30 |
|---|---|---|
| motion, 1× CPU | 1,940 ms | **76 ms** |
| motion, 4× CPU | 2,232 ms | **236 ms** |
| reduced-motion, 1× CPU | 104 ms | **76 ms** |
| reduced-motion, 4× CPU | 160 ms | **232 ms** |

Motion now converges with reduced-motion — a ~1.86 s / ~2.0 s reduction in the motion cases.
(The LCP element is still the hero `span.hero-enter`, but the hero copy itself has changed since
the audit, so the element *text* no longer matches §1.1.)

**§3 — the `<html>` per-frame custom-property write is gone.** Quick win #2 is in source:
`DayArc.tsx:129–131` writes `--arc-l/--arc-c/--arc-h` over `targets = [field, masthead]`
(`[data-light-field]` at :170, `.site-header` at :171; document root is a fallback only if the
field is absent). `<html>` now receives only the stepped *attributes*
(`data-arc-phase/-chrome/-gloaming`, :225/:231/:237), never the per-frame channels. The
86 %-style-recalc mechanism is scoped away, and the frame numbers corroborate it:

| Metric | `/` 07-18 | `/` 07-30 | jobtracker 07-18 | jobtracker 07-30 |
|---|---|---|---|---|
| avg frame | 12.4 ms | **9.1 ms** | 8.3 ms | 8.3 ms |
| p95 | 25.0 ms | **16.5 ms** | 9.2 ms | 9.2 ms |
| worst | 100.7 ms | **50.7 ms** | 9.4 ms | 9.4 ms |
| frames > 25 ms | 4.4 % | **0.8 %** | 0 % | 0 % |
| frames > 50 ms | 2 | **1** | 0 | 0 |

`npm run test:e2e:performance` passes 3/3 (chromium-desktop, chromium-mobile, firefox-desktop).

**What HAS regressed since the audit is byte weight — this is now the live deficit.**

| Asset | 2026-07-18 | 2026-07-30 |
|---|---|---|
| Home JS (excl. `noModule` polyfill) | 601 KB raw / 196 KB gz | **721 KB raw / 232 KB gz** |
| CSS on `/` | 73.4 KB raw / 13.8 KB gz (1 file) | **105.7 KB raw / 19.2 KB gz (2 files)** |
| Fonts preloaded on `/` | 178.9 KB | 178.6 KB (unchanged) |
| Total `out/` | — | 7.19 MB, 183 files |

Largest chunks: `794-…` 217.6 KB raw / 59.6 KB gz · react-dom 195.2/61.4 · framework 185.2/58.4
· main 134.3/38.6 · `app/projects/[id]/page-…` 76.6/24.2 · gsap core 50.4/19.3. §2's byte-diet
items (#4 WebP heroes, #5 browserslist, #10 font axes) are the levers that still apply; §5's
#1 and #2 are done.

---

## 1. Lighthouse scorecard (verbatim)

| Run | Perf | A11y | Best-Pr. | SEO | FCP | LCP | TBT | CLS | SI | TTI |
|---|---|---|---|---|---|---|---|---|---|---|
| `/` desktop | **76** | 96 | 100 | 100 | 0.4 s | **5.4 s** (0.06) | 0 ms | 0 | 1.1 s | 5.4 s |
| `/` mobile | **75** | 96 | 100 | 100 | 1.5 s | **8.2 s** (0.02) | 40 ms | 0 | 2.2 s | 8.2 s |
| `/projects/jobtracker/` desktop | **96** | 100 | 100 | 100 | 0.4 s | 1.4 s (0.84) | 0 ms | 0 | 0.4 s | 1.4 s |
| `/projects/jobtracker/` mobile | **76** | 100 | 100 | 100 | 1.5 s | **6.7 s** (0.07) | 10 ms | 0 | 1.5 s | 6.8 s |
| `/evidence/` desktop | **97** | 100 | 100 | 100 | 0.3 s | 1.2 s (0.89) | 0 ms | 0 | 0.4 s | 1.2 s |
| `/evidence/` mobile | **77** | 100 | 100 | 100 | 1.4 s | **6.4 s** (0.10) | 10 ms | 0 | 1.4 s | 6.4 s |

**TBT is 0–40 ms and CLS is 0.00 on every run** — main-thread and layout-stability discipline are excellent. Best-practices and SEO are perfect. The entire performance gap is **LCP**, plus one contrast and one label a11y finding.

### 1.1 LCP element identity + phases

| Route | LCP element | Observed phases |
|---|---|---|
| `/` (both) | `span.hero-enter` — the h1 line **"that shows its work."** | TTFB ~6 ms; **element render delay 2,003–2,027 ms (≈100%)** |
| `/projects/jobtracker/` desktop | `img.object-contain` — jobtracker architecture diagram (eager + preloaded — good) | load delay 56 ms, load 14 ms, render delay 195 ms |
| `/projects/jobtracker/` mobile | `aside.border-ink-secondary/60` — "private-safe proof" margin note (text) | render delay 126 ms; simulated 6.7 s is bandwidth (fonts + 613 KB JS on slow-4G) |
| `/evidence/` (both) | `header p.text-body` — ledger intro paragraph | render delay ~112–116 ms; mobile 6.4 s = same bandwidth story |

### 1.2 Controlled LCP experiment (Playwright, real Chromium, no simulation)

Same page, same server; only the motion world toggled:

| Condition | LCP | LCP element |
|---|---|---|
| motion, 1× CPU | **1,940 ms** | `span` "that shows its work." |
| motion, 4× CPU | **2,232 ms** | same |
| reduced-motion, 1× CPU | **104 ms** | same |
| reduced-motion, 4× CPU | **160 ms** | same |

**The hero entrance choreography costs ~1.8–2.1 s of LCP on every load.** `.hero-enter` (globals.css:506–535) starts at `opacity: 0` with `animation-delay: calc(var(--hero-i) * 110ms)` + 1.0 s duration; the LCP line is `--hero-i: 2` (StoryShell.tsx:358), so its pixels legally exist only ~1.2 s in, and Chrome records the candidate at ~1.9 s. Lighthouse then multiplies this through its throttling model → 5.4 s desktop / 8.2 s mobile. Everything else on the home page (FCP 0.4 s, SI 1.1 s, TBT 0) is healthy — this one animation is the whole home-page score.

Mobile case/evidence LCP (6.4–6.7 s) is a different mechanism: 613 KB of JS contending with 179 KB of fonts and 74 KB render-blocking CSS (452 ms) on a 1.6 Mbps simulated link. Byte-diet items (§2) are the lever there.

### 1.3 Remaining flagged audits

- `color-contrast` (home, → A11y 96): SplitText/scrub rest states below the fold — `h2.font-display > div` at **1.66:1** (`#c5c1ba` on `#faf6ef`) and manifesto word spans at **1.45:1** (`#d3cec6`), 11 nodes. These are the "not yet revealed" choreography states (muted lines, manifesto words at opacity 0.25) that axe measures at audit time. Real-user exposure is transient, but it is also exactly what a low-vision user sees mid-scroll.
- `label-content-name-mismatch` (jobtracker, 9 nodes): receipt permalinks `li#v-jobtracker-N > p > a.label-mono` show visible text "01"…"09" but carry `aria-label="Permalink to receipt N"` — the visible digits are not in the accessible name, which breaks voice-control users saying "click 01".
- `forced-reflow-insight` (home desktop): 3.7 ms attributed to the Next.js runtime (`274-….js`) + 16.5 ms unattributed — negligible, no app-code reflow loop.
- `render-blocking-insight`: the single 73.6 KB CSS file, 390–452 ms on mobile.
- `unused-javascript`: 188 KiB (home) / 263 KiB (case, evidence) — mostly halves of `react-dom` (77 KB), the Next runtime (73 KB), and the gsap/Lenis/ScrollTrigger chunk (38 KB).
- `legacy-javascript-insight`: 42.8 KiB of transpilation/polyfill overhead inside `274-….js` (`Array.prototype.at/flat/flatMap`, `Object.fromEntries`, …) — the build targets older browsers than the site needs.

---

## 2. Asset weight

### 2.1 Per-route transfer (Lighthouse network log, uncompressed test server)

| Route (mobile run) | Total | Script | Font | Fetch (router prefetch) | Doc | CSS | Image |
|---|---|---|---|---|---|---|---|
| `/` | 1,198 KB | 613 KB /15 | 179 KB /4 | 169 KB /21 | 100 KB | 74 KB | 52 KB |
| `/projects/jobtracker/` | 1,085 KB | 613 KB /15 | 179 KB /4 | 52 KB /5 | 99 KB | 74 KB | 58 KB |
| `/evidence/` | 1,092 KB | 615 KB /16 | 179 KB /4 | 98 KB /11 | 64 KB | 74 KB | 52 KB |

With GH Pages gzip, the true first-view wire cost of `/` ≈ **460 KB** (JS 196 gz + fonts 179 + portrait 52 + HTML 18 gz + CSS 14 gz), before the ~170 KB of idle-time RSC prefetches.

### 2.2 JS chunks (home loads all of these)

| Chunk | Raw | Gzip | Contents |
|---|---|---|---|
| `98e97b00-…` | 193.8 KB | 61.0 KB | react-dom |
| `274-…` | 184.2 KB | 50.0 KB | Next app-router client runtime (incl. 43 KB legacy transpile overhead) |
| `859-…` | 76.9 KB | 28.6 KB | gsap core deps + ScrollTrigger + Lenis |
| `d2047b56-…` | 50.2 KB | 19.3 KB | gsap core |
| `845-…` | 24.7 KB | 7.9 KB | shared app components |
| `app/page-…` | 21.5 KB | 8.3 KB | home story (StoryShell/TextMotion + SplitText) |
| `849-…` | 15.2 KB | 5.9 KB | lucide icons |
| `app/layout-…` + misc | ~35 KB | ~14 KB | layout, error, webpack, main-app |
| **Total (home)** | **601 KB** | **196 KB** | |
| `polyfills-…` | 110 KB | — | `nomodule` — modern browsers never fetch it ✓ |

CSS: one file, 73.4 KB raw / 13.8 KB gz (render-blocking, 390–452 ms mobile).

### 2.3 Fonts — 362.6 KB shipped, 178.9 KB fetched per view

Preloaded latin set (fetched on every route): **Fraunces variable `opsz,SOFT,WONK` 118.0 KB** + Newsreader 400 roman 23.8 KB + Newsreader 400 italic 22.0 KB + Fragment Mono 14.8 KB. The other 8 files (incl. a 103 KB Fraunces latin-ext) are unicode-range fallbacks that never loaded in any test — correct behavior. `display: swap` everywhere. The single biggest render-critical asset on the site is the 118 KB Fraunces; its SOFT/WONK axes are used at exactly two settings (0/50, 0/1) plus the wght-breathing range.

### 2.4 Images

- `images/profile/ayush-yadav-professional-portrait.webp` — **900×1350, 51.7 KB, eager + `priority`-preloaded on every route, displayed at ~26×39 px** in the header button (Header.tsx:147–153, and a second `priority` copy inside the dialog at :256–263). Lighthouse: 52.7 KB of 52.8 KB wasted. This preload also competes with fonts/CSS in the critical window on all three routes.
- `/projects/automl/`: `automl.png` **1376×768 PNG, 156.8 KB, eager + preloaded** as the case hero (a WebP of this poster-style graphic would be ~40–60 KB); `agentic-automl-poster-proof.webp` 134.4 KB and `agentic-automl-stack-proof.png` 106.6 KB are `loading="lazy"` ✓.
- `images/projects/advocacy.png` **940.3 KB** — referenced only by `/projects/fast-mnist-nn/` (with `mnist.png` 264.2 KB). Largest file in the export; needs resize/WebP.
- All `<img>` tags except the automl poster ship **without `width`/`height` attributes**. Measured CLS is 0.00 (CSS reserves space today), so this is a regression-hardening item, not a live bug.

### 2.5 Thread / SVG / inline cost

- Home HTML 100.1 KB raw (18.1 KB gz), of which 57.6 KB is Next flight data (25 inline scripts) — inherent to app-router static export.
- Inline SVG is cheap everywhere: 21 SVGs / 5.6 KB total on home, 2.7 KB on jobtracker. The Red Thread paths are runtime-generated and cost bytes only in JS; their runtime cost is measured in §3 (cheap).

---

## 3. Runtime traces (Playwright + CDP, 4× CPU throttle, wheel-scroll top→bottom over ~10 s)

| Metric | `/` (home) | `/projects/jobtracker/` |
|---|---|---|
| rAF frames captured | 1,481 | 1,667 |
| avg frame | 12.4 ms | 8.3 ms |
| p95 frame | 25.0 ms | 9.2 ms |
| worst frame | 100.7 ms | 9.4 ms |
| frames > 25 ms | 4.4% | **0%** |
| frames > 50 ms | 2 | 0 |
| long tasks > 50 ms | 4 | **0** |

**The case pages are flawless under 4× throttle.** Home is good-but-not-perfect, and the trace attribution is unambiguous:

Aggregate main-thread activity during the home scroll (4× CPU): FunctionCall 9,241 ms / FireAnimationFrame 8,951 ms, of which **UpdateLayoutTree (style recalc) 7,710 ms** — 86% of all rAF work — across **2,911 recalc events** (~4 per frame). Layout 484 ms (469 events), Paint 776 ms. Jobtracker for comparison: **10 ms** total recalc, 61 events.

Worst long-task stacks:
- 2 × 67 ms: `onNativeScroll` (Lenis, `859-….js`) → GSAP tick → **UpdateLayoutTree 51 ms** in a single frame — a style-recalc spike, not script.
- 2 × 65 ms: `MajorGC` inside a timer from `859-….js` — per-frame allocation pressure (proxy objects/`toFixed` strings in scrub callbacks).

**Attribution:** `DayArc.tsx` (`applyChannels`, lines 46–50) writes `--arc-l/--arc-c/--arc-h` **onto `<html>` every scrubbed frame**. Unregistered custom properties are inherited, so a root write invalidates computed style for the whole document tree each frame. The only consumers are the four layers inside the `LightField` fixed container (`LightField.tsx:38` + `.light-field-rake` opacity at globals.css:147). The day-arc scrub is the cost; the thread scrubs (`stroke-dashoffset` set directly on the path) and the rail are effectively free — the case-page trace proves the pattern. Secondary: the `--tm-wght` weight-breathing quickSetter is correctly element-scoped, but a `wght` change alters glyph advances → the ~469 small Layout events under scroll (0.26 ms each at 1×; acceptable, worth knowing).

Not found (clean bill): zero `will-change` anywhere (matches the NO-LIST claim), no non-passive scroll/touch/wheel listeners in app code (the four non-passive `addEventListener` sites are resize/keydown/mediaquery — passivity is irrelevant there; Lenis's own non-passive wheel is inherent to smooth scroll). One nit: `SmoothScroll.tsx:186` calls `ScrollTrigger.refresh()` on every resize event with no debounce — continuous window dragging thrashes full re-measures.

---

## 4. Micro-craft sweep (keyboard, semantics, forced colors)

### 4.1 Tab-order walk — `/` (48 stops, complete)

1 "Skip to main content" (appears on focus ✓) · 2 portrait button 36×36 · 3 "ayush yadav" · 4 "the work" · 5 "experience" · 6 "contact" · 7 "github" · 8 "motion: on" toggle · 9 Resume · 10–16 chapter rail 01–07 (all visible, 100×18) · 17 "Footnote 1" **10×19** · 18 flagship automl link · 19–21 case-file links · 22 "skip to the work ↓" · 23 footnote return "⟵" **8×15** · 24 PolicyBot receipt · 25 "read the case file" · 26–39 work-section cards (title/proof/case/source/demo per project) · 40–43 archive rows · 44–46 receipt links · 47 email · 48 resume.

**No traps, no zero-size or invisible stops, no missing focus styles** (global `:focus-visible { outline: 2px solid currentColor; outline-offset: 3px }`, globals.css:326 — currentColor correctly tracks the dusk ink flip). Order follows the visual narrative. Findings: the two footnote targets (10×19, 8×15) sit under the WCAG 2.5.8 24×24 minimum (inline-text exception arguably applies, but a padded hit-area costs nothing).

### 4.2 Tab-order walk — `/projects/jobtracker/` (~40 stops/cycle, complete)

1 skip link · 2 portrait · 3–9 header (same as home) · 10 repo permalink · 11 live demo · 12–27 alternating receipt links and "Permalink to receipt N" anchors (**17×15** each) · 28 HuggingFace space · 29 architecture-figure lightbox button 1032×427 · 30–34 evidence-index links · 35 "back to the work" · 36 "the evidence index" · 37 next-case link · 38–40 footer github/linkedin/email · wraps cleanly to the skip link. **No traps, all stops visible, focus-visible everywhere.** Findings: permalink targets 17×15 (below 24×24), and the visible "01"–"09" digits are absent from their `aria-label` (§1.3).

### 4.3 Landmarks + heading outline

- Home: `header > nav`, `main` (with `nav "Chapters"`, one `aside`, two stamp `role="img"`), `footer` — correct. Headings: single h1 → h2 chapters → h3 details, **no skipped levels**.
- Jobtracker: clean dossier outline (h1 → 6 h2 sections → h3s), scoped `header`/`footer`/`aside` inside `main` — correct scoping, not exposed as page landmarks.
- **h1 accessible-name flaw (home):** the line-broken hero spans concatenate to `"I buildmachine learningthat shows its work.1"` — no spaces at block boundaries and the footnote "1" is glued to the name. Chapter heads already solve this pattern via SplitText `aria: auto`; the hero h1 needs an `aria-label="I build machine learning that shows its work."` (and the footnote sup its own label).
- **Duplicate stamp:** two `role="img"` nodes with the identical label "Empty stamp outline — run no. 041 …", one rendered at **width 0** (responsive twin) yet not `aria-hidden` — zero-width elements stay in the accessibility tree, so AT users hear the stamp twice. Hide the unused variant.

### 4.4 Forced colors + contrast modes

- **`forced-colors: active` (Windows High Contrast): PASS.** Both pages remain fully legible — Canvas/CanvasText applied, links map to system LinkText, the resume button keeps a border, chapter rail and dossier structure survive, home thread strokes follow `currentColor` → system color. One nuance: the jobtracker margin-thread stroke keeps its literal madder red `rgb(176,74,40)` (SVG strokes aren't forced) — still legible on white, but a `@media (forced-colors: active) { stroke: CanvasText }` override would be more correct. No `forced-color-adjust` rules exist anywhere yet.
- **`prefers-contrast: more`: no adaptation exists.** Base ink is strong (12.1:1), but the deliberately muted voices — scrub rest states (1.45–1.66:1), muted labels — do not strengthen. A small `@media (prefers-contrast: more)` block (disable muted/dim states, raise `--color-ink-secondary`) would serve low-vision users and is the honest fix for the §1.3 contrast flags.

---

## 5. Ranked quick wins (impact × effort)

| # | Fix | Impact | Effort | Where / technique |
|---|---|---|---|---|
| 1 | **Shorten the hero entrance window.** Tighten stagger 110→60 ms, duration 1.0→0.6 s, and give the headline lines the earliest `--hero-i` slots; optionally start from `opacity: 0.15` + blur so pixels paint immediately. | LCP −1.2–1.5 s real on every load; home Perf 75/76 → ~90 | S | `src/app/globals.css:506–535` (`hero-rise`, delay calc), `src/components/story/StoryShell.tsx:76` (`heroDelay`) |
| 2 | **Scope the day-arc CSS-var writes.** Write `--arc-l/c/h` on the LightField container (or a dedicated wrapper) instead of `document.documentElement`, so per-frame invalidation covers ~5 elements, not the whole tree. Keep the `data-arc-phase` step on `<html>`. | Kills ~86% of scroll-time main-thread cost on home (7.7 s → sub-1 s per 10 s scroll at 4×); headroom for low-end devices | S | `src/components/world/DayArc.tsx:46–50` (`applyChannels` target), `src/components/world/LightField.tsx` (accept ref/id); `.light-field-rake` var read already lives inside the container |
| 3 | **Right-size the header portrait + drop its `priority`.** Serve a ~96 px avatar variant (≈3–4 KB) for the 26×39 button; remove `priority` from both header and dialog `Image`s (load the dialog copy on open). | −48 KB on every route + frees the critical-window preload slot for fonts | S | `src/components/layout/Header.tsx:147–153, 256–263`; asset via `scripts/asset-truth` pipeline |
| 4 | **Convert eager case heroes to WebP with dimensions.** `automl.png` 1376×768/156.8 KB → ~50 KB WebP (it is eager + preloaded); same pass for `advocacy.png` (940 KB!) and `mnist.png` (264 KB) on fast-mnist-nn. | −100–800 KB on affected case pages; mobile LCP on those routes | S–M | `public/images/projects/*` + the `<img>` call sites; add `width`/`height` while there |
| 5 | **Modernize the JS compile target.** Add a `browserslist` (e.g. last 2 Chrome/Safari/Firefox/Edge) so Next stops shipping 42.8 KB of `Array.at/flat/fromEntries`-era transpile in `274-….js`. | −43 KB raw / ~13 KB gz on every route; TTI/mobile LCP contention | S | `package.json` `browserslist` field; verify with `legacy-javascript` audit re-run |
| 6 | **Receipt permalink accessible names.** Include the visible digits: `aria-label="01 — permalink to receipt"` (pattern applies to all 9 per case file). | jobtracker A11y 100 stays honest for voice-control users (audit currently scores it 100 only because the axe rule is "moderate") | XS | `src/components/case-study/CaseStudyPage.tsx` receipts list (`li#v-*-N a.label-mono`) |
| 7 | **Hero h1 accessible name + duplicate stamp.** `aria-label` the h1 (spaces + no footnote glue); `aria-hidden` the zero-width stamp twin. | Screen-reader first impression of the whole site | XS | `src/components/story/StoryShell.tsx:344–408` (h1 spans, stamp render) |
| 8 | **`prefers-contrast: more` + scrub-state contrast.** Add a `@media (prefers-contrast: more)` block that disables muted/dim rest states and raises secondary ink; consider raising the manifesto's start opacity 0.25 → ~0.45 so mid-scroll states clear 3:1 large-text. | Home A11y 96 → 100 path; genuine low-vision benefit | S | `src/app/globals.css` (muted voices), `src/components/story/TextMotion.tsx` (manifesto from-opacity) |
| 9 | **Debounce `ScrollTrigger.refresh()` on resize** (~150 ms trailing), and pre-allocate/round in the arc `onUpdate` to quiet the 65 ms MajorGC pairs. | Removes the only 50 ms+ tasks left after #2 | XS | `src/components/layout/SmoothScroll.tsx:186`, `src/components/world/DayArc.tsx:139–146` |
| 10 | **Trim the render-critical font bytes** (design call). Fraunces latin with `opsz+SOFT+WONK` is 118 KB and gates every headline paint on mobile; SOFT/WONK are used at two discrete settings. Options: drop an axis, or accept and instead cut JS contention (#5) so fonts win the bandwidth race. | Mobile LCP on case/evidence routes (currently 6.4–6.7 s simulated) | M | `src/app/layout.tsx:33–38` (`Fraunces({ axes })`) |
| — | Also noted: footnote/permalink hit-areas < 24×24 (pad via `::after`); `@media (forced-colors: active)` stroke override for the dossier thread; GH Pages cannot serve long-cache/immutable headers or brotli — the 918 KiB cache insight is a hosting ceiling, worth remembering if the site ever moves. | | | |

### Sequencing note

Fixes #1 + #2 are independent of the builder agent's current src/ work in spirit, but **both touch files the builder may be editing** (`globals.css`, `StoryShell.tsx`, `DayArc.tsx`) — land them as a coordinated follow-up, re-run `npm run test:e2e:performance` and this audit's Lighthouse batch afterward. Expected end-state after #1–#5: home ~90+/75→85+ (desktop/mobile), case pages 96–97 desktop hold, mobile case pages ~85+, with A11y 100 across the board after #6–#8.

---

## Appendix — measurement provenance

- Lighthouse JSONs: 6 runs (3 routes × desktop/mobile presets), headless Chrome, `--max-wait-for-load=45000`.
- Traces: `devtools.timeline` category set, renderer main thread isolated via `thread_name` metadata; long task = top-level `RunTask` > 50 ms; frame gaps via in-page rAF deltas (first 3 warmup frames dropped); scroll = 100 wheel steps × ~95 ms through Lenis, +1.6 s settle.
- LCP experiment: `PerformanceObserver('largest-contentful-paint', buffered)` after 4.5 s idle; motion toggled via Playwright `reducedMotion` emulation (engine gate `useLenis()` → static world), CPU via CDP `Emulation.setCPUThrottlingRate`.
- Keyboard walks: real `Tab` keypresses, per-stop `document.activeElement` geometry/`:focus-visible`/computed-style capture.
- Forced colors: Playwright `forcedColors: 'active'` context + computed-style probes + full-page screenshots (visually verified).
