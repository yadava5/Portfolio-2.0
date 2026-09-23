# Proto v2 — changes only

Files: `proto/index.html` (A + phone) · `proto/rail-b1.html` (A+B1) ·
`rail-b2.html` (A+B2) · `rail-b3.html` (A+B3) · `rail-b.html` (all three).
Shots `shots/v2-*`, all taken after `html[data-np-ready]`, so the name is settled.
No tracked file touched. Supersedes `proposal.md` where they disagree.

## Harness score, proto v2 A (my run, the harness's own scripts)

Final column is **v2 with copy v2 applied**.

| metric | 1512 base → v1 → **v2** | 1440 base → v1 → **v2** | 1280 base → v1 → **v2** |
|---|---|---|---|
| screens | 15.91 → 15.93 → **15.93** | 15.97 → 16.00 → **16.00** | 16.12 → 16.10 → **16.10** |
| manifest overlap steps | 8 → 0 → **0** | 9 → 0 → **0** | 13 → 0 → **0** |
| thread crossed line-steps | 285 → 254 → **256** | 272 → 242 → **244** | 263 → 237 → **244** |
| near-empty ≤60 | 6 → 6 → **7 ✗** | 5 → 5 → **4 ✓** | 4 → 6 → **4 =** |
| prose-free ≤25 | 10 → — → **2** | 11 → — → **1** | 9 → — → **2** |
| blank | 1 → 1 → **1 =** | 1 → 1 → **1 =** | 1 → 1 → **1 =** |
| **sub-12px HTML pairs** | 166 → 11 → **0** | 170 → 19 → **0** | 164 → 15 → **0** |
| line breaks (`wraps.mjs`) 1440 / 390 | — | 8 → 0 → **0** | 10 → 0 → **0** (at 390) |
| mono % | 75.6 → 21.9 → **21.0** | 75.5 → 21.9 → **21.0** | 75.3 → 22.0 → **21.1** |

**The copy moved the metric that structure could not.** 1280's near-empty went
6 → **4**, equal to baseline, and 1440 went 5 → **4**, better than baseline. 1512 went
6 → **7**. Only 61 of 94 changed strings and none of the cut lists are in yet
(visible words 3,022 → 2,995 of a planned 2,072), so all three numbers will move again.

## (c) The effective-px floor — 0 at all three widths

The gate card, `#cadWeek` and `.verdictline` ride containers the fx engine settles at
**~0.985**, so a nominal 12px rendered 11.82–11.94. `--fs-micro` moves 12 → **12.8px**,
clearing 12 effective at that scale; the hooks v1 never reached are added (`.padbar
.st`, `.signs .shead span`, `.signs .srow .sname/.swhen`, `#chWho/#chWhen/#chMeet`,
`.gbench.gtail span`), and the last two inline `style="font-size:.7rem"` declarations —
which out-ranked every sheet — are stripped.

## (a) The 1280 near-empty regression — diagnosed, then fixed by the copy

**Cause:** two screens only, `#path` y1600 = **55 words** and `#glyph` y4800 = **60**,
against a `≤60` threshold. A fixed-height station plus a larger face pushes a line or
two out of one viewport. Nothing else at 1280 moved.

Two attempts, reported rather than hidden. A tighter-leading pass was **backwards and I
proved it** — with fixed heights a shorter block leaves *more* void, and 1440 y6750 fell
69 → 40 words; reverting put 1440/1512 back to equal. Closing intra-station gaps then
moved those screens by **zero words**, so I removed it rather than ship a no-op.

**The copy closed it.** 1280 is now **4 = baseline**, 1440 **4, better than baseline**,
1512 6 → 7 — and B3 takes 1512 to **3**. See below.

## (b) The B variants — four files, and B2 does not do what I claimed

`rail-b1` / `rail-b2` / `rail-b3` / `rail-b`, each generated from the same A.

**I was wrong about B2.** I reported "blank 1 → 0" from my own counter; the harness says
1 → 1 at 1512/1440 and 1 → 2 at 1280. Clamping the `duskin` seat **moves** the empty
screen; it does not remove it, because what is empty is the dusk corridor itself.

And the frames are the rail: `v2-b3-w1512-y9000.jpg` is one line of prose, the thread,
the bead and the waybill "automl's halted run → manifest" on the night field.
`v2-b1-w1512-y9000.jpg` shows the dip working — the line fades as it enters LifeQuest's
paragraph and returns below it. **A word count cannot decide these**, which is why each
is now its own file.

**B1 and B3 scored on their own files, with the copy in** (v1 reported one number for
all three together, which was wrong):

| | 1512 | 1440 | 1280 |
|---|---|---|---|
| crossed line-steps — base / A / **B1** | 285 / 256 / **171** | 272 / 244 / **165** | 263 / 244 / — |
| thread crosses any text — base / A / **B1** | 29 / 30 / **22** | 30 / 30 / **22** | — |
| near-empty — base / A / **B3** | 6 / **7** / **3** | 5 / 4 / — | 4 / 4 / **5** |
| screens — base / A / **B3** | 15.91 / 15.93 / **14.93** | — | 16.12 / 16.10 / **16.61** |

**B1 is free and large** — it takes crossed line-steps well below baseline with no
geometry change. **B3 is the answer to the 1512 regression**: it takes near-empty from
7 to **3**, better than the baseline 6, on the 14" MacBook's own width — and costs one
screen at 1280 (4 → 5) and 0.5 screens of length there. That trade is the owner's call,
and it is now measured on both sides. "Byte-identical geometry" for B1 is **by
construction** (no `stx`, anchor, wobble or corridor is touched); an `anchors`/`samples`
diff is still unrun.

## yoda's P1s

| # | done |
|---|---|
| 1 | **B0 folded into A.** `#manifest` is `visibility:hidden` until `.open`, `.compact` is inert, no corridor choreography remains. The mast-strip revival is owner question 2 only. |
| 2 | **Ledger rows rebuilt** as `codename · plain noun · headline number`, subline unconditional, whole row a link. Words are the copy agent's own authored rows, not my placeholders. Panel 344px so no row wraps to three lines. |
| 3 | **Identity line** directly under the name at `clamp(1.24rem, 2.05vw, 1.72rem)` — largest type on screen 1 after the nameplate, above the 18px epigraph, and *outside* `.np-plate`, which the source forbids sharing. Replay moved below it; in the first cut it collided with the plate rule. |
| 4 | All shots wait for `html[data-np-ready]`. |
| 5 | **Mono on bold inverted.** `<b>` defaults to the text face; `.mv` is the opt-in, on **21** genuine machine values. "b.s. computer science", "finalist, mucat design innovation", "lifequest", "57.8m-row" are serif. Newsreader has no bold and faux is off, so the emphasis is ink, not weight. |
| 6 | **Phone school record stacks** label above value, and `.engrows` with it. |
| 7 | **`email ·`**, per the adopted decision. |

Also correcting v1 against yoda's résumé ruling: ¶13 **keeps** "the working paper ⟶"
with the résumé inserted before it, and the phone masthead keeps `clock · station` —
the **control** sheds its word instead (`stops 0 / 6` 96px, `0 / 6` 60px).

## Copy v2 — applied, with a named gap

Applied by `design/apply-copy.py` over the appendix's `**Changed:**` tables, verified by
presence of the *after* string: **61 of 94 applied, 0 still appliable, 33 unmatched.**
The 33 are cells the doc writes flat but the run splits across inline markup; they are
listed with before/after in **`design/copy-unapplied.md`** as a worklist for `minion`.
The Cut and New lists are also unapplied — that is where most of the −1,003 words live.
Applied by hand: the ledger rows and foot, and the three kickers (¶07–¶09) the parser
could not reach, which otherwise read "fourth station ·". **All 13 kickers now agree.**

**The identity line is Option B**, the coordinator's placeholder — not A. No step applied
A: it lives in a New list and the parser only reads Changed tables. A vs B is the copy
doc's owner question 1, and ruling 3 ("hints, no stated target") turns on it.

**Two ordering bugs, both caught by diffing against `out/`.** My `.uv`/`.mv` atoms split
the strings copy replaces, so a first pass matched 49 of 94; the pipeline is now unwrap →
apply copy → re-derive atoms (21 `.mv`, 10 `.uv`) → **0 line breaks at 1440 and 390**.
Worse, one table cell was a bare `—`, so the applier rewrote **every em dash in the
file** — including all 17 `measured:` comments, which would have turned `check-palette`
red on its grammar rule, plus `.qm`'s held mark and `#conf`/`#fwd`'s placeholders.
Repaired by reverting only lines that become byte-identical to `out/`, which preserves
every deliberate copy edit: **489 lines per file, leaving the script diff as my own
patches plus nine intended label rewrites.** No `.mv`/`.uv` string appears in
`stations.ts`; `jetpack-`/`compress` stays a CSS fix for that reason.

## Gates the copy turns red (so main does not read them as my regression)

`check-stations` and `run-home.spec:73-74` (kickers rewritten) · **`check-figures`**
(`201 → 220 regex rules` is a bound literal, as are several `.prov` lines) ·
**`check-bench-artifacts`** (`305 → 3,747 passed`) · golden hash, always. Copy-v2 §6
owns the full ledger. Mine on top: `run-home.spec:326-336` must be edited for §9, and
`HOME_WIDTHS` should gain 320/1280/1512.

## Still open

1. **B1, B2, B3 — each alone, from the shots.** B1 is free; B3 is the 1512 fix and the
   1280 cost; B2's blank screen and B3's corridor are the rail, not a defect.
2. **Identity line: Option A or B.** Proto carries B.
3. The masthead gained a control; yoda's ruling says "masthead unchanged". Surfaced.
4. ⟶ or ↗ on the résumé: brief says ⟶, yoda says ↗, `check-links` skips relative hrefs
   so neither is enforced. Proto uses ⟶.
5. "pdf · one page" is false until Résumé 2.0 replaces `public/resume.pdf`.

**Unmeasured in v2:** 390 and 320 have not been re-swept since the 12.8px floor, the
stacked school record and the copy went in — the 320 figure in v1 (31.28 → 31.75) is
stale, not carried forward. B2's flip-visibility check is unrun, and only matters if B2
is chosen. B1's `anchors`/`samples` diff is unrun; its geometry claim is by construction.
