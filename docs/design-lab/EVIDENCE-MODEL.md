# Evidence-presentation model (staff-engineer critique, 2026-07-18 — score 64/100)

> **Status after the 2026-08-02 provenance audit.** Four of the six killer
> findings below are closed; one is closed differently than proposed; one is
> **still open and is now measured**.
>
> | # | finding | status |
> |---|---|---|
> | 1 | proofManifest is dead code | **closed** — `/evidence` renders all 12 entries |
> | 2 | self-referential evidence | **closed**, and now enforced: `sourceKind: "self-hosted"` prints verbatim wherever a source resolves back to this origin |
> | 3 | flagship promise→payoff broken | **closed differently** — rather than invent a metric, ¶09 states *"no accuracy figure is quoted here because none is claimed"*. A declared absence satisfies the rule the finding was defending |
> | 4 | footnote self-falsifies | **closed** |
> | 5 | no eval protocol | **closed** — and as of this audit the protocols are *executed*, not just documented: the 0.9791 gate was re-run, and Glyph's eval regenerates byte-identically |
> | 6 | ledgers are pictures of numbers | **closed** — HTML tables from checked-in JSON |
>
> **STILL OPEN — "one CI run per number".** The model's own line reads *"Public
> repos: file-level links pinned to commit + one CI run per number."* Measured
> on 2026-08-02: the entire data layer contains **one** CI-run link across 54
> case-file claims. That is the widest remaining gap between this model and the
> site, and it is not evenly distributed — of eight upstream repos, only
> **Applied** and **Cadence** have CI that asserts anything. jetpack had none at
> all until this audit added it; PolicyBot still has none; LifeQuest's is
> vacuously green (`vitest --passWithNoTests` over zero test files);
> VisualAssist's runs no tests.
>
> So the honest reading is that this line was never a documentation problem. It
> was blocked upstream, and closing it means fixing CI in the projects — which
> is where the audit started rather than finished.
>
> **One amendment the audit adds.** The model says every number must terminate
> outside the site. Two registers genuinely cannot: the biographical one
> (transcript, awards) and the institutional one (the ¶03 ITSM figures, read off
> Miami's own systems). The rule now names both instead of leaving them as
> unstated exceptions — a rule with silent carve-outs is weaker than a narrower
> rule drawn honestly.

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
