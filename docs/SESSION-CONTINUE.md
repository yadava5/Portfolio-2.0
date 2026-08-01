# CONTINUE PROMPT — Portfolio-2.0 ("Daylight Study")

*(Copy everything inside the fenced block below into a fresh Claude Code session opened in this repo.)*

```
You are continuing a long, high-craft build of my portfolio (a Next.js 16 static-export
site, "Daylight Study" warm-paper editorial world, live on GitHub Pages). Do NOT start
editing yet. First ORIENT, then ask me what to prioritize.

════════════════════════════════════════════════════════════════════════
0) READ THESE FIRST, IN THIS ORDER — then tell me you're oriented
════════════════════════════════════════════════════════════════════════
- Your project memory auto-loads (MEMORY.md index for this repo) — read the linked note
  `portfolio-redesign-daylight-study.md`. It is the fastest catch-up.
- docs/PROJECT-LEDGER.md ............. canonical compact record (what shipped, verdicts, facts)
- docs/design-lab/FABLE-VISUAL-BRIEF.md  THE DESIGN LAW (pattern library, tiers Full/Core/
  Print, the frame governor, and hard constraints A1/A4/A7/A8 + §D + §F). Obey it.
- docs/design-lab/PERF-AUDIT.md ...... the jank history — never reintroduce what it lists
- docs/design-lab/CRITIC-LEDGER.md + WAVE2/WAVE3/WAVE4-STATUS.md ... every fault's terminal
  disposition. All 82 closed; a fresh-eyes "nitpicking viewer" already passed the site
  73 → 88 → 94/100 ("THIS PASSES A NITPICKER"). Read the FIX3..FIX7 sections for what's
  most recently changed and what's deliberately left as design-calls.
- ~/Documents/Projects/PORTFOLIO_STATUS.md AND ~/Downloads/PORTFOLIO_HANDOFF_2026-07-26.md
  ... SOURCE OF TRUTH for my six live projects (canonical names, URLs, System-Card links,
  security stories). Never contradict these; if they conflict, the newer handoff wins.
- /Users/ayush/CLAUDE.md ............. my machine's hard rules (aliases shadow POSIX tools;
  use absolute paths; /bin vs /usr/bin; rm -rf is blocked — use the node fs.rmSync form).

════════════════════════════════════════════════════════════════════════
1) WHO / WHERE
════════════════════════════════════════════════════════════════════════
- Me: Ayush Yadav, new-grad software engineer, Cincinnati OH (Miami University '26, CS).
- Repo: /Users/ayush/Documents/Projects/Portfolio-2.0 — branch `redesign/daylight-study`
  (== origin/main; all work merges to main, which GitHub Pages deploys).
- Live: https://yadava5.github.io/Portfolio-2.0/
- Stack: Next.js 16 static export (output:"export"), React 19, Tailwind v4, GSAP 3.15 +
  ScrollTrigger on NATIVE scroll (Lenis was removed), next/font (Fraunces/Newsreader/
  Fragment Mono). Tests: Playwright across chromium-desktop, chromium-mobile, firefox.
- My six live projects: Applied, Cadence, Glyph, LifeQuest, jetpack-compress, Agentic
  AutoML (canonical URLs + /system-card links are in the two handoff docs above).

════════════════════════════════════════════════════════════════════════
2) MODEL ROUTING & SUB-AGENTS — STRICT. Save usage; spend it only on real building.
════════════════════════════════════════════════════════════════════════
- FRONT-END DESIGN / motion / 3D / creative visual work → the `frontend` agent on the
  **Fable 5** model at **max** effort. ONE Fable agent at a time, and ONLY when actually
  building/designing something visual. Never use Fable for research, reasoning, content,
  infra, or mechanical work.
- RESEARCH / REASONING / CONTENT / HONESTY / INFRA / ARCHITECTURE → **Opus 5** (or 4.8)
  at **high / xhigh** effort (`architect` for hard novel reasoning, `researcher` for
  read-only web/fact gathering, `worker` for well-specified mechanical execution).
- I (the orchestrator) run on Opus and stay the reviewer/merger. I do NOT do Fable's job.
- Default to the cheapest agent that fits; escalate only when the task genuinely needs it.
- Run independent agents in parallel EXCEPT the Fable rule (one Fable at a time).

════════════════════════════════════════════════════════════════════════
3) HOW WE BUILD — the loop, and the ship discipline (this is non-negotiable)
════════════════════════════════════════════════════════════════════════
Every substantive change goes: BUILD → GATE → SHIP → CRITIQUE → FIX → RE-AUDIT → repeat
until a fresh hostile critic can't land a real hit. Specifically:
- Sub-agents work in ISOLATED git worktrees, LINEAR history only (no merge commits — the
  orchestrator cherry-picks, and merge commits silently poison the cherry-pick). Per-file
  conventional commits. (This repo has used a `Co-Authored-By: Claude <model>` trailer;
  my global CLAUDE.md says commits are mine — ASK me which you want before your first commit.)
- The GATE before any merge, run and require green: `npm run typecheck`, `npm run lint`
  (0 errors), `npm run test:contrast`, `npm run test:proof`, `npm run assets:check-og`,
  `npm run test:seo` when relevant, and `PORT=<free> npm run test:e2e:full` (all three
  browsers). Then push the branch, open a PR, and WAIT for the PR's own CI run — matched
  BY COMMIT SHA, not by recency — to go green before merging. After merge, confirm the
  Pages deploy is green and curl the live URL to prove the change actually shipped.
- CI note: the CI workflow gates on Prettier + everything above; a red CI usually means a
  real failure — fix it, don't bypass. Never `--no-verify` (secret-scanning hook).
- MEASURE, don't assert. When you (or I) claim a breakpoint / contrast / overflow number,
  prove it with a probe and report the numbers. It's GOOD to disprove my instruction with
  a measurement — several rounds here were improved because an agent proved my prescribed
  value wrong. Comments must describe what the code actually does (truth-audit rule).
- THE AUDIT LOOP: when a chunk feels done, spawn a brutally harsh, fresh-eyes critic
  (a nitpicking VIEWER — an impatient design-literate stranger with zero goodwill) that
  walks the LIVE site + a local build at many widths (320→2560), motion + reduced-motion,
  print, keyboard-only, and ranks findings BLOCKER/SORE/NIT with screenshot evidence and
  a score/verdict. Feed its findings into fix rounds, ship, then RE-AUDIT. Loop until it
  explicitly passes. Keep a "delight list" of what's good so fixes never regress it.

════════════════════════════════════════════════════════════════════════
4) HARD NO-LIST (things we tried, decided against, or that break the design)
════════════════════════════════════════════════════════════════════════
- NO smooth-scroll library (Lenis etc.) — native scroll only. Cost 4 painful passes; final.
- NO old-fashioned static "card image" diagrams — living per-project SVG/scene figures replace them.
- NO second scroll-pin — amendment A8: the AutoML PipelineRun keeps the ONLY pin. A new pin
  needs a justified brief amendment.
- NO device-sniffing for quality — the frame governor MEASURES frame timing and tiers Full/
  Core/Print. Heavy garnish (shaders/3D) mounts ONLY at "Full" (promoted, capable desktop),
  with authored fallbacks; phones/weak machines never pay for it.
- NO server free-tiers for live demos (cold-start / key-exposure) — visitor-side WASM/WebGPU
  only; Applied's 22.8 MB model stays tap-to-run.
- NO invented numbers or unverifiable claims, EVER (see §5). Honesty failures are P0.
- NO horizontal overflow at any width 320→2560; ≥44px tap targets where nav/affordances live
  (a tiled 27px `.tap-target-tight` exists where 44 would overlap); ≥11px rendered text.

════════════════════════════════════════════════════════════════════════
5) THE HONESTY ENGINE (the soul of this site — protect it above all)
════════════════════════════════════════════════════════════════════════
Every claim/metric on the site terminates at an artifact a reader can open. No number goes
on the page unless it traces to PORTFOLIO_STATUS.md / the handoff / a pinned public commit
you actually verified. HELD markers, "— refused", a corrections/errata register (amend,
never delete), and per-claim receipts are load-bearing. When re-verifying a project, pin to
a current public commit and re-open every source link. If a fact can't be sourced, OMIT it.
`npm run test:proof` guards this — keep it green.

════════════════════════════════════════════════════════════════════════
6) WHAT TO EXPLORE NEXT — ASK ME TO CHOOSE (present concrete options, don't guess)
════════════════════════════════════════════════════════════════════════
The site currently passes the nitpicker at 94/100 and every tracked task is closed. I want
to keep pushing. Likely directions — ASK me which to prioritize, with 2–4 concrete options
each and your recommendation (use the AskUserQuestion tool):

  A) A "3D / scroll storytelling" elevation of the story flow: scrollytelling, scroll-driven
     animation (CSS scroll-timeline where supported / GSAP ScrollTrigger), tasteful parallax,
     and step-based reveals — BUT all of it must fit the existing law: native scroll, the ONE
     pin, the Full/Core/Print tier system (3D is Full-tier garnish with fallbacks), triple
     motion gate, GPU budget, and the ink-and-paper voice (no generic neon SaaS 3D).
  B) Deeper micro-interactions / motion polish (the letterpress "text answers the hand" layer
     already exists — extend it thoughtfully, Full-tier gated).
  C) Rebuild my résumé PDF from the current shipped truth (there's a resume:build pipeline).
  D) Another harsh critic pass to push the score past 94, or a mobile/perf-focused audit.
  E) New content/projects, or the cross-repo booklet-URL cleanup (outside this repo).

RESEARCH TO DO (use a `researcher`/Opus agent, read-only, before proposing anything visual):
  - Uiverse.io — open-source CSS/Tailwind UI component snippets (adapt to the ink voice; don't
    paste neon as-is).
  - Anime.js — lightweight JS animation library (evaluate vs the existing GSAP setup; only add
    if it earns its bytes and passes the perf budget).
  - shadcn/ui — Radix + Tailwind component system (we already use @radix-ui/react-dialog; shadcn
    fits the stack — evaluate for any new interactive UI).
  For EACH: cost (bundle KB, main-thread, GPU), fit with static export + native scroll + the
  tier system, reduced-motion/print fallback, and a recommendation. ASK me before adding ANY
  new dependency.

════════════════════════════════════════════════════════════════════════
7) YOUR FIRST ACTIONS THIS SESSION
════════════════════════════════════════════════════════════════════════
1. Read the docs in §0. Confirm you're on `redesign/daylight-study`, in sync with origin/main.
2. Prove a green baseline: `npm run typecheck && npm run lint` and a quick build
   (`NEXT_PUBLIC_BASE_PATH= npm run build`). If anything's red, tell me before touching code.
3. Summarize back to me, in 5–8 lines: current state, the model/agent rules, and the loop.
4. Then ASK me which direction from §6 to start on, with concrete options — do NOT pick for me.
```

---

## Where to open Claude Code (do this in your terminal — not in the prompt)

```bash
cd /Users/ayush/Documents/Projects/Portfolio-2.0
git checkout redesign/daylight-study && git pull
npm install
claude
```

Then paste the fenced prompt above as your first message.
