# The case file as working-paper dossier (visitor journey critique, 2026-07-18)

Journey score 54/100: home ~85 · case pages ~55 · THE TRANSITION ~20.
"Two unrelated design systems joined by a shared header… the case page's own
eyebrow says EVIDENCE LEDGER — the concept is already the home's language,
wearing another site's clothes." Rebuild = the missing half of the concept.

## The 8-point dossier spec (adopt)
1. STOCK: same paper one stop older — flat "archive" cream (NO day-arc; a
   document has fixed daylight), contour texture retained; ink + stamp-orange
   as the only accent.
2. OPENING: ¶ kicker "case file 02 / 07 · agentic automl — filed 2026-02",
   Fraunces title, Newsreader deck; thread enters top edge, underlines title,
   runs the left margin throughout.
3. META AS LEDGER: role/timeframe/stack/repo as mono dot-leader table
   (hairline rules, no pills/cards).
4. EVIDENCE AS PLATES: screenshots = tipped-in figures (thin ink frame, paper
   mat, mono caption "fig. 1 — …, run no. 041", source line → repo/commit);
   architecture = inked fig. 2 (ink arrows, not green).
5. VALIDATION AS APPENDIX TABLE (the centerpiece): claim | probe | result |
   date, mono + hairline rules, inked ✓ per verified row — merge with the
   EVIDENCE-MODEL receipts columns (artifact file@SHA + visibility badge).
6. DECISIONS AS NUMBERED CLAUSES: "d1 — …", serif rationale, tradeoff as
   indented mono footnote. No cards.
7. STAMPS FOR STATUS: private-proof disclaimer = dashed orange stamp
   ("private repository — evidence verified"); outcomes bear small approved
   marks echoing the gate.
8. CLOSE WITH CONTINUITY: folio footer "case file 2 of 7 — return to the
   paper ⟵ / next file: jobtracker ⟶"; thread exits toward the next document.

## Elevations (both adopted into backlog)
- TIPPED-IN PLATES: every screenshot a photographic plate (mat, ±0.4°
  rotation, thread stitching a corner, caption + commit hash) — dark
  screenshots become photographs OF a dark screen on light paper.
- THE PAPER REMEMBERS: one-time "opened · jul 18, 10:04 am local" stamp per
  case file; home rail + work rows ink a ✓ for visited files — the reader's
  journey becomes the audit trail.

## Homepage fixes found en route (fold into build round)
- MOBILE THREAD COLLIDES WITH TEXT at 390 (ch 03–05: line sits on
  letterforms) — reserve a true 20–24px gutter ≤480px or run at screen edge.
- Illegible header at case-page landing (dark ink over #090b0d at scroll-0)
  — header must read the surface beneath; interim: force dark variant on
  case routes.
- Case-page color anarchy (5 accents) → ink + stamp-orange only.
- Viewport sag: two dead-frame moments (hero byline→flagship gap; mid-chapter
  blank halves) — tighten min-heights so apparatus always enters the frame.

## Recruiter journey addendum (68/100 — unique finds)
- FLAGSHIP HAS ZERO EVIDENCE LINKS (links-automl.json: empty) — no artifacts
  section renders on /projects/automl/ at all. The thesis dies on the flagship.
- LIVE DEMOS UNFINDABLE: liveUrl data (jobtracker/fast-mnist/taskflow vercel)
  is NEVER RENDERED on case pages or home rows — add "live demo ↗" to the
  role/stack card + demo affordance on #work rows; fast-mnist screenshot
  even advertises an interactive workbench it never links.
- "Back to projects" → /#projects is a DEAD ANCHOR (real id: #work) — the
  return leg dumps screeners at the hero. Fix + relabel "back to the work".
- VOICE: rewrite validation rows first-person and concrete (kill "Portfolio
  source data records…", "Presenter artifact identifies Ayush's work…");
  replace invented "Senior capstone engineer" with "Capstone lead — sole
  engineer".
- KEEP-LIST (survives redesign): role/timeframe/stack extraction card;
  private-proof callouts; validation/outcomes as labeled rows; the
  self-honesty lines (AVX-512 retraction etc. — "extend, never sand off");
  typed artifact links; decisions-with-tradeoffs; ~3.5-viewport page length;
  real product screenshots.
- Scores: recruiter 68 · evidence 64 · visitor 54 (transition ~20). The
  case-file rebuild is the single highest-leverage front-end work remaining.

## REJUDGE ROUND (dossier build) — visitor 72 (was 54, +18)
"The seam is gone — the same author's filing cabinet." Dossiers ~74, /evidence
~58 (least designed object — no thread, raw URLs as text, no entry numbers).
Top fixes: (1) receipts-table hierarchy (real column heads, serif claim line,
key-labels on mobile stack); (2) BUG: jobtracker fig.2 caption says "clay
marks the gates" but isGateNode matches nothing — flag the classifier gate in
data or conditional caption; (3) architecture photocopy — topology should
shape each figure (jobtracker linear, automl gated loop); (4) /evidence
redesign (named artifacts + ↗, e-01… numbering, thread down margin);
(5) plate/dead-zone composition + mobile repro-command break hints.
Elevations: stampable registry row (reader inks approved on 041 — world
mechanic = product thesis); THREAD AS CITATION SYSTEM (rows branch a visible
pen-stroke to the fig they cite — "the move nobody else has").
Method slip = "most convincing artifact on the site."

## REJUDGE — recruiter 86 (was 68, +18)
"Trust survives the whole loop." All external links curl-verified 200 +
commits pinned; return legs click-verified; "best evidence hygiene I've seen
from a new grad"; published "held" gates = sharp trust rise. Deductions:
flagship externally unverifiable (−7, content-debt: demo-run ledger / 90s
gate capture / sanitized skeleton), /evidence source fields cite LOCAL IMAGES
where public repos exist (−3, fix: strongest-external-artifact rule + pin
VisualAssist + deep-link e-rows to #v- anchors), work index at 55% scroll
(−2, fix: hero surfacing of case links or promoted skip button), poster
thumbnails illegible at climax (−2, fix: crop 2–3 readable panels, full
poster secondary), status-wording tension ("in progress — core shipped, run
ledger pending" + echo last-verified on home cards).

## REJUDGE — evidence 86 (was 64, +22). FULL ROUND: 86/86/72 (from 68/64/54)
"Tell the hiring manager the docs are trustworthy: every receipt resolved,
every artifact matched its claimed number." All 6 prior gaps verified closed
(2 with residue). THE find: SIMD attribution contradicted by its own receipt
(BENCHMARKS.md: 3.5× is the PARALLEL version; "-march=native alone barely
moves the needle") — P0 reword everywhere: "openmp+simd dot kernel, 3.5× vs
-O3 baseline". Also: /evidence = "manifest, not yet ledger" (needs dates,
receipt→#v- crosswalk links, strongest-external-artifact sources, 0.9791 +
182-tests entries); master-inventory still SVG-picture; footnote stragglers
(71 xctest, dean's list); ~97% terminates in README prose (content-debt).
Content-debt ticket adds: flagship demo-run ledger, MNIST eval artifact,
sweep rubric + miss analysis, per-label metrics on rare classes.
