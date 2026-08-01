# Portfolio-2.0 — Upgrade Plan

**Direction:** Hybrid — port the AutoML capstone's design system, tighten positioning to *agentic ML*, and add one signature runnable demo (the rejection-email classifier hero).

**North-star positioning:** *Engineer who builds agentic ML systems with humans in the loop.*
AutoML = flagship proof · JobTracker / PolicyBot = corroboration · Fast MNIST / Visual Assist = depth signals. Everything else demoted.

**Current score:** ~74/100 (Visual 72 · Content 74 · Technical 80 · Recruiter 72).
**Core problem:** the evidence exists but never *runs*. Proof must be clickable, visible, and measurable — not diagrammed.

---

## Phase 0 — Quick wins — *low risk, instant gains* (≈half a day)

Ship these first; none touch layout structure.

1. **Delete dead code.** ~14 unused components in `src/components/effects/` (GlassCard, NebulaCard, GlitchBurst, WarpTransition, ParallaxDepthWrapper, …) — zero imports, ~700 LOC, clashing purple aesthetic. Remove + any re-exports.
2. **Fix the font problem.** `globals.css` loads 8 Google font families via render-blocking `@import`. Cut to 2 (Inter + Geist Mono, matching the capstone) and self-host via `next/font` — or at minimum add `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`.
3. **Fix the lying docblock.** `layout.tsx:96` claims fonts use `next/font/google` — false. Make it true or correct it (would fail a code review as-is).
4. **Remove endorsement counts.** `skills.ts` surfaces `endorsements: 2/3/1` — signals a thin network. Replace with project-provenance tags ("used in: AutoML, JobTracker").
5. **Rewrite the 4 hero metrics as outcomes.** `TechnicalOperationsAtlas.tsx → proofMetrics`. "18,403 AutoML ledger events" means nothing to a recruiter → use instantly-legible outcomes (e.g. "7-phase agentic ML pipeline", "3.5× faster via C++ SIMD").
6. **Lift text contrast.** Bump `text-zinc-500/600` on near-black up 1–2 shades to clear WCAG AA and speed the 5-second scan.
7. **Compress oversized images.** 2 MB portrait (the LCP element) + 1.7 MB poster → WebP/AVIF via the existing `sharp` dep.

**Outcome:** faster, cleaner, more credible — no visual risk. Expected: Technical → mid-80s, Content credibility up.

---

## Phase 1 — Positioning + design system (1–2 days)

8. **Tighten positioning.** Replace the "data + ML + full-stack + HPC + iOS" sprawl with one headline. Candidate: *"Don't read my portfolio. Run it."* / subhead: *"I build agentic ML systems — pipelines where AI does the work and humans hold the gates."*
9. **Port the capstone design tokens.** Adopt `landing/src/styles/theme.css` (Linear-style surfaces `#0A0A0B`→`#1A1B1D`, motion easing curves, semantic tokens). Unifies the two projects and raises visual ceiling.
10. **Add a light/dark toggle.** Reuse the capstone's `ThemeToggleIsland` pattern + FOUC-avoiding bootstrap. The forced ultra-dark theme is polarizing.
11. **Cut project sprawl.** Set `portfolioVisible: false` on Paid Internships (freshman ENG109 site) and fold Aramark into a one-line "earlier roles." Let 5 technical projects carry the story.
12. **Tasteful motion.** One scroll-reveal (fade+rise) on section headings + project cards, honoring `usePrefersReducedMotion`. Biggest perceived-polish jump for least code.

**Outcome:** Visual → low-80s, Recruiter role-clarity up.

---

## Phase 2 — Content depth + proof (2–3 days)

13. **Rewrite every project** as Problem → Approach → Result → **number**, framed as impact not effort. Kill vanity test counts as headlines ("738 tests" → coverage % or a usage metric). Add ≥1 business/usage number per project.
14. **Real screenshots + short demo GIFs** as the hero imagery for the top 5 projects (browser/device frames); keep architecture diagrams as supporting depth with a decision narrative (ADR-style "chose X over Y because…").
15. **NDA-safe capstone demo.** Public dummy-data sandbox (Hugging Face Space / Vercel) of the AutoML flow — the single highest-leverage move per research. Link it hero-level.
16. **Add JSON-LD** (`Person` + `WebSite` in `layout.tsx`, `CreativeWork`/`BreadcrumbList` on case-study routes). Zero structured data today.
17. **Custom domain** (e.g. `ayushyadav.dev`) + one clean professional email. `github.io/Portfolio-2.0` reads as a student project.
18. **GitHub profile pass** (adjacent, high ROI): profile README, pin 5 best repos, lead each README with Problem→Result. 87% of recruiters check GitHub first.

**Outcome:** Content → mid-80s, Recruiter conversion up.

---

## Phase 3 — Signature runnable demo + ⌘K (3–5 days, the "wow")

19. **The Rejection Classifier hero** — *"Paste your rejection email. I'll take it from here."* JobTracker's pipeline runs **on-device** (transformers.js embeddings + ONNX SetFit head) and returns `REJECTION · 99.2% · caught by layer 2 · 38ms · never left your browser`. This is the shareable screenshot.
20. **The Eval Bar** — persistent `claims verified: n/13` ticker that fills as visitors run demos. Casts the visitor as the human-in-the-loop — the site *instantiates* your identity.
21. **⌘K command palette** (cmdk) — `run classifier`, `open resume`, `ask`, `hire`. Signals product sensibility, cheap to add.
22. *(Stretch)* SIMD drag race (C++→WASM scalar vs SIMD128, live GFLOPS) and/or draw-a-digit through the from-scratch C++ net.

**Outcome:** a memorable, self-verifying portfolio; Visual + Recruiter into the 90s.

---

## Phase 4 — Verify (ongoing per phase)

23. Run `test:e2e`, `test:e2e:performance`, a11y (axe), lighthouse, contrast + asset-budget checks after each phase. Use a verification subagent for the big changes. Never merge on a failing gate (per CLAUDE.md).

---

## Sequencing at a glance

| Phase | Effort | Risk | Interview impact |
|---|---|---|---|
| 0 Quick wins | ½ day | Very low | Medium |
| 1 Positioning + design | 1–2 d | Low | High |
| 2 Content + proof | 2–3 d | Low | **Highest** |
| 3 Signature demo | 3–5 d | Medium | High (wow) |
| 4 Verify | continuous | — | Protects all |

**Recommended start:** Phase 0 now (safe, instant), then Phase 2's live-demo + metric rewrites in parallel with Phase 1 design — because research is unanimous that *clickable + measurable proof* moves interviews more than motion.
