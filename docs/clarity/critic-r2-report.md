# Cold-visitor audit — portfolio prototype at http://127.0.0.1:4311/

Playwright headless only (chromium, `@playwright/test/index.mjs` from the project's
`node_modules`). No Chrome extension was used. Scrolling was step-by-step with
`window.scrollTo({top:y, behavior:'instant'})` and a 700 ms settle per step; screenshots
are viewport-only, never full-page. Scripts: `run.mjs` (persona scroll passes),
`acts.mjs` (interaction pass), `dawn.mjs` (post-approval section), `probe.mjs`
(orientation). Raw per-step text and link geometry in `priya.json`, `marcus.json`,
`linda.json`. 119 screenshots in this directory.

Server answered: HTTP 200, 373,882 bytes. Zero console errors and zero page errors in
all three passes.

## Instrument notes

Two instrument bugs were found and fixed before any persona conclusion was drawn.
The first read of the hero reported the name as loose letters (`'a' 'y' 'u' 'h' 'Y'
'd' 'a' 'A' 's'`); that was the reader sorting by `y` only and deduping on `text|y`.
Keying on `text|x|y` and sorting by row-band then `x` shows the truth: the name is an
animation that assembles over about three seconds. Second, step positions are not
precomputable — `scrollHeight` is re-read at every step, and it changes (14,167 px for
Linda, 14,655 px for Priya, 15,396 px for Marcus, and 18,342 px after the approval
button is pressed).

### Measured page facts

| | Priya 390×844 | Marcus 1512×982 | Linda 1440×900 |
|---|---|---|---|
| load (`load` event) | 101 ms | 67 ms | 104 ms |
| document height | 14,655 px | 15,396 px | 14,167 px |
| scroll steps to bottom | 29 | 31 | 31 |
| distinct visible text blocks | 349 | 329 | 335 |
| text under 14px, by character | 33% | 34% | 35% |
| text in Fragment Mono, by character | 28% | 31% | 32% |
| blocks whose *peak* opacity stays < 0.5 | 1 (0%) | 8 (2%) | 14 (4%) |

Counted by block rather than character, 49–54% of blocks are under 14px and 49–51% are
in Fragment Mono — but single tokens (Glyph's digits `0`–`9`, `vt-0`…`vt-3`, stray
middots) count as blocks, so the character share above is the honest number. Smallest
sizes in use: 89 blocks at 11px on mobile, 62 at 12px on desktop.

A first pass reported 8–16% of text below 0.5 opacity. That was wrong: the reader kept
each block's *first* sighting, which on this page is mid fade-in. Scored at peak
opacity instead, almost nothing rests faint. The claim is withdrawn.

Relative proof assets all resolve: `proof/glyph-dot256-openmp-native-001e9b4.json`
(200, `application/json`, 42,767 bytes), `proof/jetpack-jmh-rigorous-2caacd0.json`
(200, `application/json`, 11,936 bytes), `resume.pdf` (200, `application/pdf`, 63,509
bytes). One outbound link was checked: `the evidence index ⟶` →
`https://ayush-yadav.com/evidence/` returns 200 with
`<title>The Evidence Index | Ayush Yadav</title>` and `<h1>The evidence index</h1>` —
it goes where it says it goes.
`resume.pdf` resolves: HTTP 200, `content-type: application/pdf`, 63,509 bytes.
Fonts in use: Fraunces (display), Newsreader (prose), Fragment Mono, Times.

### Timing assumptions for the simulated clock

Tool time (700 ms settle) is not reading time. Priya is clocked at 3.4 s per scroll
step (each step is 0.6 of a phone screen, so ~5.7 s per full screen skimmed) after a
3 s hero, which puts her at step 8 when her 30 s runs out; Marcus at about 5 s per scroll step
(half a screen each — he stops to read the numbers) plus ~15 s in the stops menu, which
puts him at the foot of the page at about 2:45; Linda reads everything and presses the
buttons. Every quiz
answer below cites a screenshot from that persona's own run, inside that budget.

---

## Three structural defects, found before the personas

**1. The end of the page has no contact information.** The last screen reached by
scrolling (`marcus-30-y14414.png`) contains the manifest box, a station list, a button
reading `approve run 042`, and `© 2026 ayush yadav · cincinnati, oh`. No email, no
GitHub, no LinkedIn, no résumé. The full contact card — `aesh.03.23@gmail.com`,
`github ↗`, `linkedin ↗`, `résumé · pdf · one page ⟶`, `the working paper ⟶`, under
the line "Thank you for reading. If this is the kind of work your team needs, write to
me." — sits in a thirteenth section that is in the DOM all along (the second `mailto` is at
document y 16007 while `scrollHeight` is 15396) but is **unreachable by scrolling**
until `approve run 042` is pressed (`linda-dawn-04-y15602.png`). Pressing it grows the
document from 15,396 px to 18,342 px, and only then can you scroll to it. A visitor who reads the whole page and does not press an unlabelled
ceremonial button reaches the end of a portfolio and is given nothing to act on.

**2. The one contact block that is always reachable has 14–15 px tap targets on a
phone.** Of 41 tappable elements Priya encountered, 29 are under the 44 px minimum
height. `aesh.03.23@gmail.com` is 166×15 px. `pdf · one page ⟶` is 116×15 px.
`github ↗` is 58×14 px. `linkedin ↗` is 68×14 px. Project links (`the live app ↗`,
`source ↗`, `system card ↗`) are all 14 px tall.

**3. No role string in the page body.** Grepping all three passes for
`engineer|developer` returns only "feature engineering" and a pipeline-stage label
`4.0 engineer`. The tab `<title>` is `Ayush Yadav | Software, Data, and ML Engineering`
— desktop visitors see that in the browser tab (headless shots do not capture browser
chrome), but it appears nowhere on the page. The only *job title* rendered on the page
is a past one: `ITSM Data Integration Intern, Miami University, Jun 2025 to May 2026`
(`priya-02-y1033.png`, `marcus-04-y1964.png`). Inside Priya's 30 seconds, the single
job title she sees is "Intern".

*A fourth candidate defect was investigated and withdrawn.* The mobile figure in
`priya-04-y2045.png` appears to have labels clipped by the card and a stray `file ⟶`
fragment above it. Re-shot with the card settled mid-viewport (`priya-clip-y2150.png`),
nothing overflows: a bounds check on every leaf node inside the figure returns zero
violations at y=1900, 2150 and 2300. The `file ⟶` was the sticky header covering the
first line of a two-line link, and "the main line" was mid-reveal. The figure is not
broken — it is simply more than a full phone screen of monospace with no sentence on
it, which is a comprehension problem, not a layout bug.

---

# Persona 1 — Priya, in-house HR coordinator, iPhone 390×844, 30 s (90 s if hooked)

She is on stop 47 of 200 applications. Nice site. Very quiet. It took a
moment before the name was even a name.

### Quiz

| Question | Answer | Where / when |
|---|---|---|
| What does this person do? | **Partly.** "I build software end to end, from the interface down to the data and models under it." and later "builds — web apps · apis · data pipelines · ml". The only job title on screen inside her window is a past one, "ITSM Data Integration Intern". I'd have to write "full-stack, I think?" on the sheet. | `priya-00-y0.png` ~3 s; `priya-01-y527.png` ~6 s; `priya-02-y1033.png` ~10 s |
| Degree and when? | **Found.** "b.s. computer science · miami university, may 2026" | `priya-01-y527.png` ~6 s |
| One project in plain words? | **Found.** "Applied — A job application tracker that reads your Gmail" | `priya-05-y2551.png` ~20 s |
| Proof the work is real and good? | **Found.** "1 wrong out of 96 labelled emails (0.990 macro-f1)" with `the live app ↗`, `source ↗`, `system card ↗` | `priya-06-y3057.png` ~23 s |
| How would you email them? | **Found.** `aesh.03.23@gmail.com` — but the link is a 166×15 px target, well under the 44 px she can reliably hit on a phone | `priya-02-y1033.png` ~10 s |
| Where is the résumé? | **Found.** "résumé — pdf · one page ⟶" on the same card | `priya-02-y1033.png` ~10 s |
| Would you move them forward? | **Yes, but into the "check with the hiring manager" pile, not the shortlist.** Degree, email, résumé and one real project all inside 30 seconds is better than most. But I cannot tell whether he is a frontend person, a data person or an ML person, and that is the only thing my req actually asks me. | — |

### Verbatim phrases that confused her

- `↓ twelve stops, dawn to dark` next to a button reading `0 / 6` — twelve or six? (`priya-00-y0.png`)
- `0 / 6` alone in the top-right corner — on the phone the word "stops" is not rendered, so it is two numbers and a slash with no label (`priya-hero-1500ms.png`)
- The header clock that keeps changing as she scrolls: `06:12 · the start`, then `08:27 · the yard`, then `12:22 · cadence`. She read it as a page timer and wondered whether she was running out of something.
- `the yard` as the title of a job (`priya-04-y2045.png`)
- `held for review / nothing reached 0.85, so it keeps the rules' own guess` (`priya-07-y3563.png`)
- `gated setfit`, `e5 similarity`, `macro-f1`

### Where she would bail

At about 17 s, on `priya-04-y2045.png` — a full phone screen that is a single
monospaced technical diagram with clipped labels and no sentence on it. If she survives
that on the strength of the record card, the second bail is at about 27 s on
`priya-07-y3563.png`, which is 17 blocks of 11 px monospace and no prose at all.
She never reaches the references or the contact card.

### Three changes that would most help her

1. Put a plain job title beside the name, in the hero and in the sticky header. The
   tab title already says "Software, Data, and ML Engineering" — put that on the page. And paint the name instantly: the
   three-second assembly (`priya-hero-300ms.png` → `priya-hero-3000ms.png`) spends a
   tenth of her budget with his name unreadable.
2. Make every tap target 44 px tall. The email link is currently 15 px.
3. Label the `0 / 6` control, and give the phone a persistent one-tap contact
   affordance so contact does not depend on being at one particular scroll depth.

---

# Persona 2 — Marcus, agency tech recruiter, desktop 1512×982, 2–3 minutes

### Quiz

| Question | Answer | Where / when |
|---|---|---|
| What does this person do? | **Partly.** The browser tab reads "Ayush Yadav \| Software, Data, and ML Engineering" — that is the only role phrase in the whole experience, and it is not on the page. On the page: "builds — web apps · apis · data pipelines · ml" and "languages — typescript · python · java · c++ · sql", which is enough for me to place him. The only job title on the page is "ITSM Data Integration Intern". | tab title; `marcus-act-recordcard.png` ~0:40; `marcus-04-y1964.png` ~1:00 |
| Degree and when? | **Found, twice.** "I finished a B.S. in Computer Science at Miami University in May 2026, after a year as its ITSM data integration intern." and the row "degree — b.s. computer science · miami university, may 2026" | `marcus-act-recordcard.png` ~0:40 |
| One project in plain words? | **Found, six of them in one panel.** The `stops` menu lists "applied / gmail job tracker / 1 wrong in 96", "cadence / plain-english calendar / 1,186 tests pass", "glyph / digit reader in c++ / 3.5× faster kernel", "jetpack-compress / parallel java gzip / 6.4× faster", "lifequest / job-hunt prototype / 3 of 5 built", "agentic automl / capstone ml agent / 2,523 tests pass" | `marcus-act-stopsmenu.png` ~0:15 |
| Proof the work is real and good? | **Found, and this is the best thing on the site.** jetpack-compress: "422 vs 66 mb/s on 1 gib", "3-fork jmh · 99.9% ci", `the benchmark ledger @ 2caacd0 ↗`, `the raw run record (json) ⟶`, and the volunteered "honestly not faster than the jdk intrinsic". Then a gates figure showing one of his own checks *declining* his work. | `marcus-16-y7856.png` ~1:50; `marcus-24-y11784.png` ~2:15 |
| How would you email them? | **Found** — `aesh.03.23@gmail.com`, one screen from the top. Not at the bottom, where I looked first. | `marcus-act-recordcard.png` ~0:40 |
| Where is the résumé? | **Found** — "résumé · pdf · one page ⟶" on the same card. Resolves: 200, `application/pdf`, 62 KB. Not in the stops menu, which is where I went looking for it. | `marcus-act-recordcard.png` ~0:40 |
| Would you move them forward? | **Yes.** The evidence discipline is the differentiator — committed benchmark shas, raw JSON run records, and a line that says "no accuracy figure is quoted: no committed evaluation earns one". I have not seen a new grad do that. I would submit him and write the title myself. | — |

### Verbatim phrases that confused him

- `↓ twelve stops, dawn to dark` against the header's `stops 0 / 6` (`marcus-00-y0.png`)
- `¶ 04 · project 1 of 6` — the pilcrow reads as a text-editor artifact
- `the yard` as a section title for a university internship (`marcus-05-y2455.png`)
- `which desk takes which verdict is drawn, not measured` (`marcus-08-y3928.png`)
- `committed, not run in this tab` — honest, but it made him briefly doubt the number before he understood it (`marcus-16-y7856.png`)
- `packed into one serverless function to stay under vercel's 12-function limit` — reads as a hosting workaround, not an achievement (`marcus-11-y5401.png`)
- `approve run 042` with `scrolling could not press this button · pressing it only turns the page to morning` — a button that explicitly tells him it does nothing, so he did not press it (`marcus-30-y14414.png`)
- `042 is the day's serial, not a visit counter` — an answer to a question he never asked

### Where he would bail

He does not bail; he finishes. The failure is at the finish line. At about 2:50 he is
on `marcus-30-y14414.png`, which is the last thing the page gives him: a station list,
a copyright line, and no way to contact anybody. He has to scroll back up roughly
13,000 px to the record card, or close the tab. Most recruiters close the tab.

### Three changes that would most help him

1. Put the contact block at the real end of the page. Keep the approval ceremony if it
   matters, but do not make it the gate on email, GitHub, LinkedIn and the résumé.
2. Add `résumé` and `email` rows to the stops menu — it is the one piece of navigation
   on the site and it currently leads only to projects.
3. Reconcile "twelve stops" with "stops 0 / 6", and move the tab title's role phrase
   onto the page, next to the name.

---

# Persona 3 — Linda, 55, non-technical, English as a second language, desktop 1440×900, unlimited time

### Quiz

| Question | Answer | Where / when |
|---|---|---|
| What does this person do? | **Almost not found.** The page body never says it. She read "I build software end to end, from the interface down to the data and models under it." three times; "end to end" and "models under it" did not resolve. The one phrase that would have answered her — "Software, Data, and ML Engineering" — is in the browser tab, not on the page. | tab title; `linda-hero-3000ms.png` |
| Degree and when? | **Found.** "I finished a B.S. in Computer Science at Miami University in May 2026" — a full sentence, which is why she got it. | `linda-02-y900.png` ~2 min |
| One project in plain words? | **Found, and she liked these.** "A calendar you can type to in plain English" and "A handwritten digit reader, running in this tab". These are the clearest sentences on the site. | `linda-10-y4500.png`, `linda-13-y5850.png` |
| Proof the work is real and good? | **Partly.** She cannot judge "0.990 macro-f1" or "6.4× faster". What she could judge, and did: "From the start, he operated above intern level… He understood intent, not just requirements." — Randall Vollen, named, with a job title, on LinkedIn. That is the only evidence she can weigh. | `linda-27-y12150.png` (¶ 11 · the references) |
| How would you email them? | **Found** on the record card early on, and again — larger, and with an actual invitation, "If this is the kind of work your team needs, write to me" — after she pressed `approve run 042`, which she pressed because it was a button and she had time. | `linda-02-y900.png` ~2 min; `linda-dawn-04-y15602.png` |
| Where is the résumé? | **Found**, same two places: "résumé — pdf · one page ⟶". | `linda-02-y900.png` ~2 min; `linda-dawn-04-y15602.png` |
| Would you move them forward? | **Not her call, but:** "Two people put their names to this. He wrote down what did not work as well as what did. I would tell my nephew to talk to him." She could not tell anyone *what job to interview him for*. | — |

### Verbatim phrases that confused her

- `I build software end to end, from the interface down to the data and models under it.`
- `first light. nothing has been decided yet.`
- `the yard`
- `a refused gate is the system working.` (`linda-24-y10800.png`)
- `no accuracy figure is quoted: no committed evaluation earns one.`
- `"Plan to throw one away; you will, anyhow."` — an English idiom inside a quotation inside a section about a prototype
- `3.5× faster kernel`, `6.4× faster`, `macro-f1`, `1,186 passed · 0 skipped`
- `run 043 · not yet begun` (`linda-dawn-04-y15602.png`) — she thought something had failed to load
- `scrolling could not press this button · pressing it only turns the page to morning`

### Where she would bail

She does not bail — she has unlimited time and an emotional reason to keep going. But
she stops *understanding* at the internship figure (`linda-05-y2250.png`) (three monospaced boxes reading
`tableau + workday`, `hash-dedup · rest api`, `legacy laravel`, `teamdynamix · gitlab`)
and from there she is looking at shapes.

### Three changes that would most help her

1. One plain sentence at the very top, under the name: "I am a software engineer. I
   build websites, apps, and the systems behind them." The page currently has no
   sentence a non-technical reader can repeat.
2. Give every figure a one-line plain-English caption saying what it *means*, the way
   the project subtitles already do. "A calendar you can type to in plain English"
   proves the site can write this way; the figures never do.
3. Stop using monospace for prose. About a third of all visible characters — and half
   of all text blocks — are set in Fragment Mono, including captions and labels that
   are ordinary English sentences. Reserve it for actual machine values and set the
   rest in the text face.

---

# Scores

| Category | Priya (mobile, 30–90 s) | Marcus (desktop, 2–3 min) | Linda (desktop, unlimited) |
|---|---|---|---|
| First impression | 62 | 80 | 72 |
| Clarity of role | 58 | 68 | 48 |
| Readability | 48 | 62 | 38 |
| Evidence of skill | 78 | 90 | 55 |
| Navigation / contact | 52 | 55 | 50 |
| Credibility | 76 | 90 | 80 |
| **Overall** | **61** | **77** | **57** |

### Why — Priya
- **First impression 62.** Loads in 101 ms and looks expensive and deliberate. The tagline
  and the Machado quote are legible at 300 ms, so the page is not blank. But the one
  thing she opened it to confirm — the name — spends about three seconds assembling out
  of scattered letters (`priya-hero-300ms.png`, `priya-hero-1500ms.png`), and the first
  screen carries no job title.
- **Clarity of role 58.** One sentence and a "builds" row. No title. She cannot map him
  to a requisition, which is the only decision she is being asked to make.
- **Readability 48.** A third of all visible characters are under 14 px and 28% are
  monospace; 89 separate blocks render at 11 px. The internship figure
  (`priya-04-y2045.png`) is more than a full phone screen of monospace with no sentence
  on it. Body prose, where it appears, is well set at 15–17 px Newsreader.
- **Evidence of skill 78.** Strong and early: named stack, a hard number and three live
  links on the first project she reaches, at 23 s.
- **Navigation / contact 52.** Credit for surfacing the email at 10 s — that is genuinely
  fast. Marked down hard for a 15 px tap target on that email, 29 of 41 targets under
  44 px, and an unlabelled `0 / 6` as the only navigation control.
- **Credibility 76.** Real university, real dates, real numbers, nothing that smells
  inflated. She has no reason to doubt any of it.

### Why — Marcus
- **First impression 80.** 67 ms to load, visibly high-craft, obviously not a template.
- **Clarity of role 68.** The record card and the stops menu together let him place the
  candidate in about 40 seconds, and the tab title supplies "Software, Data, and ML
  Engineering". Marked down because that phrase is only in the tab — the page itself
  offers no title he can paste into a submission, and the one job title it does render
  is an internship.
- **Readability 62.** Desktop is far kinder than mobile and the prose columns are well
  set. But 31% of characters are monospace and 34% are under 14 px, and the figures are
  dense enough that he skims rather than reads them.
- **Evidence of skill 90.** The strongest thing here by a distance: committed benchmark
  shas, raw JMH JSON, CI floors, an explicit statement of what is staged rather than
  measured, and a gates figure in which one of his own checks *declined* his own work.
  The proof artifacts are not decorative: both raw run records return 200 as JSON
  (42,767 and 11,936 bytes), and `the evidence index ⟶` lands on a real page titled
  "The Evidence Index".
- **Navigation / contact 55.** Email one screen from the top is good. The end of the
  page having nothing is bad, and it is bad exactly where a recruiter finishes.
  `resume.pdf` resolves correctly (200, `application/pdf`, 62 KB), but it is not in the
  menu.
- **Credibility 90.** Two named references with job titles, quoted with ellipses marked;
  a prototype labelled as unfinished on purpose; a refusal to quote an accuracy figure
  that has no committed evaluation behind it.

### Why — Linda
- **First impression 72.** Calm, beautiful, clearly made with care. The Machado quote is
  translated, which she appreciated.
- **Clarity of role 48.** The page body never says what job he does in words she can
  repeat. "End to end", "the interface down to the data and models under it", and "the
  yard" are all opaque to her. The tab title would have told her, which is why this is
  48 and not lower — but a role belongs on the page, not in the chrome.
- **Readability 38.** Dense idiomatic English and heavy lowercase monospace — about a
  third of all characters on the page are set in Fragment Mono, including captions and
  labels that are ordinary English. The project subtitles are excellent; almost nothing
  else is written for her.
- **Evidence of skill 55.** The numbers are meaningless to her. The two named
  recommendations are not, and they carry the whole score.
- **Navigation / contact 50.** She found the email — partly on the record card, partly
  by pressing a button whose own label says it does nothing. The site should not need
  luck.
- **Credibility 80.** Named people, named university, dated internship, and visible
  honesty about what did not get finished. This is what she is actually able to judge,
  and it reads well.

---

# Overall verdict

This is a genuinely unusual portfolio, and its unusual quality is real: nearly every
claim on it is bolted to an artifact — a commit sha, a raw JSON run record, a CI floor,
a test count, or a named human being. The "How I work" section, which shows one of the
author's own gates *refusing* his own work, is the single most persuasive thing on the
page, and no template portfolio has anything like it. Marcus, the reader it was built
for, comes away convinced.

It fails at the two joints where a portfolio has to be boring. First, the page body
never states the job. The one role phrase in the whole experience — "Software, Data,
and ML Engineering" — lives in the browser tab; across 15,000 pixels of page, every
reader has to infer it from a sentence, a stack list, or six projects, and the only job
title actually rendered is a past internship. Priya cannot match him to a req and Linda
cannot name what he does. Second, it hides the contact card behind a ceremony. The last screen of the page — the one every reader who finishes
is looking at — offers a copyright line and a button whose own caption says pressing it
only turns the page to morning. The email, GitHub, LinkedIn and résumé links that the
ending deserves sit in a thirteenth section that no amount of scrolling will reach
until that button is pressed.

The fix is small next to the work already done: the tab title's role phrase moved onto
the page beside the name, a contact block at the actual end, 44 px tap targets, and
monospace demoted from a third of the page's characters to the machine values it
belongs to. The craft is not the problem. The two boring things
are.
