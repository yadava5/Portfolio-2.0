# FRONTEND COMPLETION MAP — placement, proof narration, nothing left to figure out

> The Phase-3 unlock document (user-mandated 2026-07-18). Synthesized from the
> triple journey critique (recruiter 68 · evidence 64 · visitor 54), the
> dossier research round, EVIDENCE-MODEL.md, and DOSSIER-SPEC.md. When the
> work below ships, every placement and narration question is answered.

## 1. The site is THREE surfaces, one paper

| Surface | Role | Stock |
|---|---|---|
| **The paper** (`/`) | The story: 7 chapters, day-arc, thread, gate. Claims appear ONLY as stat chips + footnote registry, each deep-linking to a validation ROW ANCHOR on a case file (`/projects/x/#v-x-3`) — never same-page | Living day-arc |
| **The case files** (`/projects/[id]`) | The evidence: working-paper DOSSIERS per DOSSIER-SPEC (8 points) + EVIDENCE-MODEL (receipts). Where written proof lives | Flat archive cream, no day-arc, grain PERCEPTIBLE, ink + clay only |
| **The evidence index** (`/evidence`) | proofManifest.ts rendered verbatim as the master ledger — every claim, source, verification, visibility, boundary. The site-wide receipt | Archive cream |

External terminals: repo file@commit permalinks (mono text `repo @ a1b2c3d · path:L12`, NEVER image badges), CI run links, live demos, HF Spaces, downloadable JSON/CSV ledgers.

## 2. How written proof is narrated (the docs-showcase model)

Per case file, in order:
1. **Kicker**: `case file 02 / 07 · agentic automl — filed 2026-02 · last verified 2026-07` + one gwern-style status word (`status: shipped | in review`). Two dates = the credibility token.
2. **Meta ledger** (mono dot-leaders, no pills): role (real titles — "capstone lead, sole engineer") · timeframe · stack · `repo @ sha` · **`live demo ↗`** (renders liveUrl — currently a found bug: data exists, never rendered).
3. **Problem → constraints → architecture (fig. 2, inked) → decisions as ADR clauses** (`d1 — accepted · revisited 2026-01`, tradeoff as auto-numbered footnote).
4. **Eval protocol** — the 5-line mono "method slip" beside each headline number: sample provenance + class mix · tuning/eval separation · judge + pass criterion · date · **reproduce command**. (Pre-answers: JobTracker's 96-sample question, PolicyBot's who-graded question.)
5. **VALIDATION = the receipts table (centerpiece)**: claim | method (1 line) | artifact (file@SHA / CI run / ledger anchor) | date | `[visibility]` bracketed mono. Per-row permalink anchors. First-person voice — the "Portfolio source data records…" auditor voice dies. Epoch-style provenance line beneath: `runs marked ⌂ executed by me on demo data · ci rows link the public run`.
6. **Plates** (Tufte 3 widths: margin / column / full): every screenshot a tipped-in figure, caption ALWAYS terminating off-page (`source: repo @ sha · ci #118 ↗`) or relabeled description. Rotation on at most the hero plate; ≤2 stamps/page from a closed set.
7. **Failure modes / limits + "What I'm NOT claiming"** — the boundary rows, formalized.
8. **Corrections block** (MLPerf-style erratum slip, permanent): `erratum · 2026-03 — retracted "AVX-512" claim; measured path was AVX2.` Numbers are amended in public, never deleted.
9. **Folio footer**: `case file 2 of 7 — back to the work ⟵ (/#work, fixes dead anchor) · next file: jobtracker ⟶` (next-file teaser = its own kicker line; inked ✓ if visited). Thread exits toward the next document.

Ledgers: HTML tables generated from checked-in JSON (+ raw download); SVG demoted to thumbnail. Artifact-viewer dialog gains a provenance strip (date/source/boundary).

## 3. Placement decisions now FINAL (nothing left to figure out)

- Live demos: meta-ledger row on case files + quiet `demo ↗` on #work rows. Flagship (private) gets the demo-data run ledger instead — one complete run, dataset→phases→best model→metric→approval timestamp, tagged `demo dataset`.
- proofManifest: rendered at `/evidence` + as per-artifact captions/badges. The schema already fits — shipping it is the fix.
- Resume: header chip (kept) + gate contact cluster. Docs for projects = the case files themselves; no separate "docs" page.
- Footnote registry (home): every footnote terminates OFF-page at a case-file row anchor (fixes footnote-4 self-falsification); "benchmarked in ci" links a real run or the words change.
- Visit memory ("the paper remembers"): Califa localStorage `data-visited` — one-time `you opened this file · jul 18` mono stamp (static on revisit, gwern subtraction), ink ✓ on home rail + work rows. First-person, never surveillance-voiced.
- Case-route header: reads the surface beneath (archive-cream variant; fixes illegibility).
- Mobile thread: true reserved gutter ≤480px (fixes ch-03–05 text collision).
- Viewport sag: chapter min-heights tightened so apparatus always enters the frame.
- Skeuomorph budget (research warning): every apparatus item carries information (number/date/status) — litmus: if it survives lorem ipsum, cut it.

## 4. What remains user-blocked (Phase 3/4 content, unchanged)
Flagship outcome numbers · quantified experience bullets · demo recordings · updated resume · final deployments. Everything else above is buildable NOW.

## 5. Build order (front-end mode, current)
1. Dossier rebuild of CaseStudyPage + /evidence page + receipts/plates/protocol components (+ header variant, dead-anchor fix, voice rewrite, liveUrl rendering).
2. Homepage fixes: mobile thread gutter, viewport sag, footnote re-targeting.
3. "The paper remembers" (visited marks + opened stamps).
4. Full triple-critic re-judgment → iterate → ship. THEN Phase 3 unlocks.
