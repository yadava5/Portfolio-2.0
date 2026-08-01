# Portfolio-2.0 — Master Design Plan

Synthesized from 5 parallel research streams (top product sites · award-winning creative dev · AI/agentic brands · standout engineer portfolios · 2026 front-end technique). This supersedes the aesthetic parts of `PORTFOLIO-UPGRADE-PLAN.md`; the Phase-0 quick wins there still stand.

---

## The one insight everything hangs on

Five independent researchers converged on the same thing: **your unfair advantage is that you genuinely build agentic ML — so the design should *demonstrate the primitives* (traces, approval gates, on-device inference, evals), not decorate around them.** A designer can't fake a model running in the browser; an engineer rarely ships a site this considered. Do that, and you beat both crowds.

**Rule of the whole build:** 95% calm, 5% one loud moment — and the loud moment must *prove a skill*, not just sparkle. If everything sparkles, nothing does.

---

## Concept: "Human in the Loop"

The portfolio is framed as an **agent console you operate.** Your work is presented as an agent pipeline the visitor can step through; claims are *runnable*; the final contact CTA is the last approval gate ("Human approval required → book a call"). The visitor literally plays the human-in-the-loop role your systems are built around. The medium *is* the thesis.

**Positioning (one identity, not five):** *Engineer who builds agentic ML systems with humans in the loop.* AutoML = flagship · JobTracker / PolicyBot = corroboration · Fast MNIST / Visual Assist = depth. DataFest / LifeQuest / TaskFlow demoted to a quiet "more" list.

---

## Aesthetic direction

A deliberate move *away* from the AI-purple/gradient/glassmorphism clichés every researcher flagged. Two viable frames — we pick one:

**A — "Warm Machine" (editorial-technical, recommended).** Anthropic/Cursor lineage: warm paper canvas, editorial serif for prose, mono for labels/metrics/traces, ONE hot accent. Rare for an engineer portfolio → instant differentiation; reads adult and credible to an AI-lab hiring manager. Ships a true dark mode too.

**B — "Precision Console" (engineering-dark).** Linear/LangSmith lineage: near-black substrate, hairline surfaces (borders not shadows), mono headings, one *non-purple* electric accent, the trace-viewer as centerpiece. Most natural home for agentic/trace UI; risk = most-copied territory, so differentiate hard via the live set-pieces and a non-purple accent.

**Palette (shared tokens, both modes):**
- Base: paper `#FAF9F5` (light) / near-black `#0B0C0E` (dark); ink `#1A1A17` / paper text `#F5F5F0`
- Surfaces via a lightness ladder, separated by 0.5–1px hairlines — **no drop shadows**
- ONE accent (non-purple): warm signal amber `#F5B944` OR clay `#D97757` — used only on primary CTA, focus ring, active gate
- Semantic: eval-pass green `#6E9E5B` · eval-fail warm-red `#CF4D3C` · citation/link teal `#20808D`

**Type:** mono for headings/eyebrows/metrics/traces (Geist Mono / Berkeley Mono) · editorial serif or tight grotesk for prose (Newsreader / Source Serif 4, or Geist Sans) · aggressive negative tracking on display sizes, light display weights (300–400). Self-hosted via `next/font` (kills the current 8-font perf problem).

**Avoid list (all researcher-flagged):** indigo→purple AI gradients, glowing orbs, fake chat bubbles, aurora/nebula/particle-network hero, glassmorphism everywhere, bento-as-whole-page, skill-bar percentages, hidden custom cursors, Bruno-Simon car clones, matrix-rain hacker cosplay, sparkle ✨ motifs.

---

## Information architecture (single page, anchored, fast)

Modeled on Karpathy / Lee Robinson / Delba (substance + positioning + one tasteful flourish):

1. **Hero** — name + one-line identity + one-line value prop + availability line + primary CTA. Contains the signature interactive (below).
2. **Selected work** — 3–4 curated case studies. Each: Problem → Approach → **measurable result (a number)** → tech tags → GitHub + live demo/GIF. Real screenshots/recordings, not diagrams, as the primary imagery.
3. **Signature set-piece** — embedded in the AutoML case study (see below).
4. **Writing / notes** — 3–4 posts with opinionated titles + one-line subtitles. Strongest new-grad differentiator (proves you reason + communicate).
5. **About** — short, human, one "Now" line; the iOS-accessibility angle is a rare, memorable hook.
6. **Timeline** — condensed reverse-chron with logos, one impact line each.
7. **Contact** — click-to-copy email with "Copied" confirmation, one repeated CTA framed as the final approval gate.

---

## Signature interactions (curated — not all at once)

Ranked by impact-per-effort; each ties to a real project.

| Element | What it does | Ties to | Effort | Wow |
|---|---|---|---|---|
| **Rejection classifier hero** | Paste a job-rejection email → JobTracker's 3-layer model labels it **on-device** (`REJECTION · 99.2% · layer 2 · 38ms · never left your browser`) | JobTracker | M | 5 |
| **Agent trace + approval-gate replay** | Replayable LangSmith-style waterfall of the AutoML run; the UI *pauses* at a "Human approval required" gate you click to resume | AutoML | L | 5 |
| **SIMD drag race** | His C++ dot-kernel compiled to WASM (scalar vs SIMD), raced live with real GFLOPS | Fast MNIST | M | 5 |
| **⌘K command palette** | `run classifier`, `open automl`, `copy email`, `hire` — keyboard-first nav | cross-cutting | S | 4 |
| **Honest metric tickers** | Real numbers count up on scroll (F1, latency p50/p99, speedup, tests) | all | S | 3 |
| **Native scroll reveals + View Transitions** | Card morphs into case-study hero; content reveals on scroll (mostly free, CSS) | all | S–M | 3 |
| **One "compute" visual** | Embedding point-cloud OR dithered/ASCII "perception" accent — used exactly once | identity | M–L | 4 |

**Signature moment (the screenshot that travels):** the rejection classifier. Universal to every job-seeker (including recruiters), darkly funny, and the punchline is real technical depth + on-device privacy. Build this first.

---

## Build stack

Next.js 16 / React 19 / Tailwind 4 (already yours) · `next/font` self-hosted · Framer Motion (springs, reveals, `MotionConfig reducedMotion="user"`) · `cmdk` (palette) · `transformers.js` / `onnxruntime-web` (on-device inference) · react-three-fiber only for the single WebGL moment (lazy-loaded, static poster fallback) · GSAP ScrollTrigger optional for the trace scrub.

**Non-negotiables:** sub-2s load, WCAG AA contrast over every surface, full keyboard nav, and a clean static/reduced-motion fallback — which doubles as your accessibility proof-of-skill.

---

## Phased roadmap

- **Phase 0 — Quick wins** (from prior plan; still valid): delete dead effects, fix fonts + false docblock, drop endorsements, rewrite hero metrics, lift contrast, compress images.
- **Phase 1 — Foundation & identity:** lock the design system (tokens, fonts, dark/light), rebuild the hero + positioning, cut project sprawl, add scroll reveals + ⌘K.
- **Phase 2 — Content & proof:** rewrite 3–4 case studies (Problem→Approach→Result→number), real screenshots/GIFs, JSON-LD, custom domain, GitHub cleanup, 2–3 writing posts.
- **Phase 3 — Signature build:** rejection classifier hero (on-device), then agent-trace/approval-gate replay, then optionally SIMD race + one compute visual.
- **Phase 4 — Verify (continuous):** Playwright + axe + lighthouse + contrast + perf budgets after each phase; verification subagent on big changes.

---

## Success bar

Not "looks nice" — **"a hiring manager forwards the link."** That happens when the site proves, in 15 seconds and one shareable interaction, that this person builds real agentic ML and sweats the details most engineers skip.
