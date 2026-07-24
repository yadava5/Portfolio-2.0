# Evidence-presentation model (staff-engineer critique, 2026-07-18 — score 64/100)

## The killer findings
1. **proofManifest.ts is DEAD CODE** — the claim/source/verification/visibility
   schema is imported nowhere, rendered never. Highest-leverage fix on the
   site: render it (per-artifact captions + badges AND a site-wide /evidence
   index page).
2. **Self-referential evidence** — "Portfolio source data records X" cells
   cite the portfolio itself (automl ×3, fast-mnist ×3, +2 more). RULE: no
   evidence cell may cite the portfolio; every number terminates outside
   (repo file@commit, CI run URL, dated ledger) or is relabeled description.
3. **Flagship promise→payoff broken**: ch-04 "metrics withheld — see the case
   file" but the case file has zero metrics. Fix: one complete demo-data run
   ledger (dataset → phases → best model → metric → human-approval timestamp)
   or drop the pointer.
4. **Footnote 4 self-falsifies** the "every claim links to its evidence"
   promise (links to the same page); "benchmarked in ci" links no CI run.
5. **No eval protocol** for 0.9791/96-sample or 19/20 — need 5-line protocol
   blocks (sample provenance, class distribution, tuning/eval separation,
   pass criterion + judge, date + reproduce command).
6. **Ledgers are pictures of numbers** — undated SVGs; re-render as HTML
   tables from checked-in JSON (+ downloadable), SVG demoted to thumbnail;
   artifact-viewer dialog gains a provenance strip (date/source/boundary).

## The model (adopt into FRONTEND-COMPLETION-MAP)
- Homepage: claims = stat chips + footnote registry ONLY, each deep-linking
  to a validation ROW ANCHOR on a case page (never same-page).
- Case-page spine keeps problem/constraints/architecture/decisions + ADDS
  **Eval protocol** and **Failure modes / limits** sections.
- Validation = receipts TABLE: claim | method (1 line) | artifact
  (file@SHA / CI run / ledger anchor) | date | visibility badge.
- Public repos: file-level links pinned to commit + one CI run per number.
- Private work: dated HTML ledger + sanitized downloadable JSON +
  "verifiable on request in interview" line; disclosures in-frame.
- /evidence page: proofManifest rendered verbatim as master index.
- Formalize boundaries as per-project "What I'm NOT claiming" row (the
  retraction/scaffold/no-production lines are the site's best content).

## Docs must pre-answer (per reviewer)
1. JobTracker: 96-sample provenance/class-mix/tuning-vs-eval separation.
2. AutoML: one complete run end-to-end with the metric ARRIVING somewhere.
3. PolicyBot: who authored/graded the sweep, pass criteria, what failed in
   17/25 (self-graded is fine IF disclosed).

Full report in shots-journey session output; 26 screenshots at
docs/design-lab/shots-journey/e-*.png. Recruiter + visitor journey critiques
pending at time of writing.
