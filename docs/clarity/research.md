# Portfolio copy rewrite: evidence base

Compiled 2026-09-22.

**Tags.** `VERIFIED` = I fetched the page or read the source text myself.
`SECONDHAND` = I have it only via a search snippet or a third-party summary.
`INFERRED` = my own reasoning from cited evidence; nobody claimed it.

---

## 0. Premise corrections, and what the shipped page actually says

### Five premises in the brief that are wrong

1. **`plainlanguage.gov/guidelines/*` no longer exists.** Every detail page
   301-redirects to `digital.gov/guides/plain-language`, a hub with no numeric
   guidance. The Plain Writing Act of 2010 framing survives; the rules pages do
   not. `VERIFIED` (two 301s observed). Substitutes used below: the ONS Service
   Manual and the GDS blog.
2. **`seamless`, `robust`, `leverage`, `elevate` are NOT on Wikipedia's
   words-to-watch list.** They appear only inside quoted bad examples. The guide
   is explicit at line 341 of its source: *"This section is to be taken as
   literally as possible: a word being overused by AI does not imply that its
   synonyms are also overused."* `VERIFIED` (raw wikitext). Treating those four
   as AI tells is folklore.
3. **`delve` and `tapestry` are stale.** The guide stratifies vocabulary by
   model era (lines 333 to 341): *delve* "was famously overused by ChatGPT in
   2023 and early 2024, but became less frequent later in 2024, then dropped off
   sharply in 2025." The mid-2025-onward (GPT-5) list is only *emphasizing,
   enhance, highlighting, showcasing*. `VERIFIED`.
4. **Em-dash overuse is being retired as a general tell, but not for Claude.**
   Line 676 carries a maintenance banner: *"If more recent examples of this AI
   sign can't be found, it should probably be moved to Historical indicators, as
   it seems to be less common in current LLM output. (September 2026)"* Line 680
   then says, verbatim: *"A July 2026 study found that of contemporary models
   only Claude used em dashes more than professional writers, and ChatGPT used
   them less."* Cited to The Economist, "How to spot AI writing", 30 July 2026.
   `VERIFIED` (raw wikitext). **This copy will be drafted with Claude, so the
   em-dash ban stays in force even as the tell is demoted for everyone else.**
5. **There is no eye-tracking or time-on-task study of candidate portfolio
   *websites*.** The recruiter-attention literature is résumé literature.
   Everything in Q1 is applied by analogy and is labelled as such.

### What the shipped page actually does (measured, not recalled)

Read out of `out/index.html`, the built artifact, per the house rule about
grepping the artifact rather than the source.

**First screen, complete visible text, in order:**
`VERIFIED`

```
¶ 01 · the start  06:12
first light. nothing has been decided yet.
A y u s h   Y a d a v
watch it again ⟲
Caminante, no hay camino, se hace camino al andar.
Traveller, there is no road, the road is made by walking.
Antonio Machado · Proverbios y cantares XXIX, Campos de Castilla, 1912
↓ twelve stops, dawn to dark
```

**No role line. No degree. No résumé link. No word indicating software
anywhere on the first screen.** The only role signal in the document is the
`<title>`: "Ayush Yadav | Software, Data, and ML Engineering", which a screener
sees in a browser tab and in search results, not on the page.

**The eleven `<h2>` headings, in order:** `VERIFIED`

```
Who · The path · Applied · Cadence · Glyph · jetpack-compress ·
LifeQuest · Agentic AutoML · How I work ·
Two people wrote this down in public ·
Every pipeline I build ends with a human decision.
```

Six of eleven are bare project codenames. A reader who scans only the headings,
which is the documented majority behaviour (Q2), learns six proper nouns and no
domain, no verb, and no technology.

The internal `kicker` strings in `src/lib/data/stations.ts` add a second layer
of the same problem: four stops are labelled only "first station", "second
station", "third station", "fourth station". `VERIFIED` (read the file).

---

## Q1. How screeners actually consume a portfolio

**Recruiters spend about 7.4 seconds on a first-pass résumé scan** (Ladders,
2018; up from 6 s in 2012). Successful résumés had "simple layouts, with clear
sections and heading titles"; recruiters "focus on job titles more than any
other element during the initial scan"; failures were "cluttered designs with
lengthy sentences, multiple columns, minimal white space, weak text flow lacking
headers, and keyword stuffing." `SECONDHAND`: the Ladders PDF returns HTTP 403;
I read HR Daily Advisor's write-up, and saw HR Dive's only as a search result.
The widely quoted N=30 is a search-snippet figure I could not confirm at source.

**Ten seconds is the real budget for a web page.** NN/g analysed more than 2
billion dwell times across 205,873 pages: "The first 10 seconds of the page
visit are critical"; 99% of pages show negative aging, meaning users are most
likely to leave immediately; the abandonment curve flattens only at about 30
seconds; "To gain several minutes of user attention, you must clearly
communicate your value proposition within 10 seconds." `VERIFIED`.

**Attention is front-loaded even on a long scroll.** NN/g eye-tracking: 57% of
page-viewing time above the fold, 74% within the first two screenfuls (about
2160 px), more than 42% of viewing time in the top 20% of the page, more than
65% in the top 40%. `VERIFIED`.

**Engineering-specific evidence: one survey, and it cuts against portfolio
sites.** profy.dev polled 60-plus hiring managers and recruiters in developer
hiring, published 6 August 2021, in the course of contacting "300+ recruiters
and React team leads". Two questions on a 0 to 5 scale. The overwhelming
majority *would* look at a personal website, but ratings for "would a developer
without one have lower chances" clustered at 0 to 2. Respondent quotes push
toward GitHub projects, READMEs and deployed applications instead; one team lead
notes bad design can make you "look incompetent even though everything works
fine." `VERIFIED` via the dev.to mirror (profy.dev itself no longer resolves,
ENOTFOUND). **Scope limits, stated plainly:** 2021, self-selected respondents,
framed around React front-end portfolios. It is the only engineering-specific
survey I found, not a strong one.

**What employers say they want from new grads.** NACE Job Outlook 2026:
teamwork, problem-solving and communication, with evidence rather than lists,
"It is not enough for candidates to list their skills: Employers want to see
examples"; 70% report using skills-based hiring, up from 65%. `SECONDHAND`: from
NACE's own summary pages via search. I did not fetch the full report.

**Numbers to refuse.** "93% of hiring managers would look at a portfolio", "73%
(Stack Overflow 2024) consider a portfolio more important than a resume", "71%
say portfolio quality influences hiring", "84% want working applications", "50%
higher chance". All circulate on SEO listicles. I fetched the 2024 Stack
Overflow Developer Survey: 65,437 respondents, all developers, sections
Developer Profile / Technology / AI / Work / Community / Professional Developers
/ Methodology. It does not sample hiring managers and contains no such question.
`VERIFIED` that the attribution is false; `INFERRED` that the other four are
equally unsourced.

**Device mix: unknown.** Every mobile statistic available describes *candidates
applying* (67% of applications on mobile, 53% of career-site traffic), not
screeners reviewing. Do not transfer those numbers. Gap.

> **Implication.** Budget ten seconds and two screenfuls. In that space a
> screener must be able to read: the name, "software engineer", the finished
> degree, and where the résumé is. Today, measured above, that space contains a
> 1912 Spanish poem and no role. The Ladders finding that job titles dominate the
> first fixation is the single most actionable external result here.

---

## Q2. How much text a home page should carry

**People scan; they do not read.** 79% of test users always scanned a new page;
16% read word by word. Rewriting the same content measured: concise text (half
the words) +58% usability; scannable layout +47%; objective, non-promotional
language +27%; all three combined +124%. "Promotional language imposes a
cognitive burden", because readers must filter the exaggeration out.
`VERIFIED` (Nielsen 1997, still NN/g's canonical writing evidence).

**The word-count arithmetic.** Users read roughly 20 to 28% of words on an
average visit. Each additional 100 words buys 4.4 seconds of attention, about
18% of that text at 250 wpm. **On pages of 111 words or fewer, users have time
to read about half.** The dataset's average page was 593 words. `VERIFIED`.

**Layer-cake scanning is the efficient pattern and it runs entirely on
headings.** Fixations land "mostly on the page's headings and subheadings, with
deliberate occasional fixations on the body text in between." It works only when
headings are visually distinct *and* "accurately summarize their associated
sections... leading with important words." `VERIFIED`.

**F-pattern is the failure mode.** When headings do not summarise, readers fall
into F, E or inverted-L scanning, which NN/g calls less effective because people
miss content inadvertently. Recommendations: the first two paragraphs carry the
most important information; start every heading, paragraph and bullet with
information-carrying words, because the first two words get the fixations.
`VERIFIED`.

**Progressive disclosure has a rule and a hard limit.** Disclose up front
everything users frequently need; make the progression visible; label it so it
sets clear expectations for what lies behind it; and **stop at two levels**,
because more than two "typically result in poor usability." `VERIFIED`.

> **Implication, and this is the structural core of the rewrite.** Layer-cake
> scanning means **the station headings *are* the page** for most screeners. The
> eleven measured headings above include six bare codenames and the internal
> labels include four that read "first station" through "fourth station". Those
> are headings that do not summarise their sections, which is exactly the
> condition NN/g identifies as collapsing layer-cake into F-pattern. Every stop
> needs a literal, front-loaded label; the codename and the railway metaphor can
> ride on a smaller second line, where they cost nothing.
>
> For volume: the 111-word threshold is the only number with a study behind it.
> `INFERRED` target: keep prose above the case-file links close to that, and
> certainly under 200 words, with everything else carried by headings and links.
> Home page as summary, case file as depth, is exactly two levels. Do not add a
> third.

---

## Q3. Signalling "software engineer" without narrowing

**This question has no primary evidence base.** Nothing measures identity
statements versus target-role statements on personal sites. Report it as not
converged. What exists:

- Job titles are the highest-fixation element in a first-pass scan (Ladders).
  `SECONDHAND`.
- Readers fixate the first two words of each line (NN/g F-pattern). `VERIFIED`.
- Observed pattern across the sites I fetched (Q8): the portfolios that classify
  fastest state a bare noun phrase, Brittany Chiang "Frontend Engineer", Lynn
  Fisher "Designer for the Web", Bruno Simon "Creative Developer (mostly for the
  web)", and widen only in the About paragraph. Paco Coursey and Linus Lee lead
  with a capability sentence instead of a title and are correspondingly harder to
  classify at a glance. `VERIFIED` (I fetched all five).

> **Implication.** `INFERRED`. Put one unambiguous noun phrase where the first
> fixation lands. The site's own `<title>` already carries a serviceable one,
> "Software, Data, and ML Engineering"; promoting that string, or a tightened
> version, onto the first screen costs almost nothing and reuses a decision
> already made. Carry breadth on the next line as domains actually worked in,
> phrased as nouns a keyword-scanning recruiter will hit, not as aspirations.
>
> Owner rulings that bind here, from MEMORY.md: state the B.S. as a **finished
> degree, Miami University, May 2026, never a current affiliation**; every title
> on the site matches the résumé verbatim; **dates come from the résumé or the
> portfolio, never inferred from git**.

---

## Q4. Presenting technical metrics to non-experts

**Plain language does not insult experts. Experts prefer it more.** Trudeau's
2011 survey, 376 responses, published in the *Scribes Journal of Legal Writing*
14 (2012): 80% preferred the plain-English version; 97% preferred "among other
things" to "inter alia"; and "the more educated the person, the more specialist
their knowledge, the greater their preference for plain English."
`SECONDHAND`: I read the GDS write-up and the SSRN abstract page, not the paper.

The ONS Service Manual states the rule and the reason together: "We should aim
for a reading age of nine years because research shows that even expert users
prefer plain language." It also directs writers to front-load headings so that
task-matching words come first. `VERIFIED`.

**Google's rule for a term you must keep.** Use jargon only if readers search
for it; otherwise write around it. On first use, "Describe the term in plain
language and refer to it in parentheses, or link to a trusted definition." The
guide's own example is a parenthetical gloss: *"the same state as a cold standby
(a backup or redundant system that's identical to a primary system)."* The tone
page additionally bans figurative language and any phrase claiming a task is
"simple" or "easy". `VERIFIED`.

**Raw pairs beat percentages.** This is the natural-frequencies result: people,
including professionals, understand event counts out of a fixed denominator
better than probabilities or percentages. Only about 25% of the general
population can correctly identify "1 in 1000" as equivalent to 0.1%.
`SECONDHAND`: I could not retrieve the BJGP full text or the Cochrane review
body; the finding reaches me through search summaries of the
Gigerenzer/Hoffrage line of work. The brief's instinct here is right, but the
citation is weaker than the others in this report.

**Numerals, not words.** NN/g: write numbers as digits even at the start of a
sentence or bullet, because "the shape of a group of digits is sufficiently
different from that of a group of letters to stand out to users' peripheral
vision before their foveal vision fixates on them." Exception for very large
magnitudes ("two trillion"). `SECONDHAND` (article summary; page not fetched).

> **Implication.** Three parts per figure, in this order, using this site's own
> real numbers rather than the illustrative shapes below:
> **(1) the raw pair, in numerals**, e.g. `N of M wrong`;
> **(2) the technical name in parentheses, once**, e.g. `(macro-F1 0.NN)`;
> **(3) one clause naming the baseline that was actually compared**, e.g.
> `3.5× vs -O3` written out as "3.5 times faster than <the thing measured
> against>".
> The parenthetical gloss is Google's documented pattern and costs experts
> nothing, because the number they want sits right there. Do **not** write a
> "why it matters" line for every metric: that is the "superficial analyses"
> tell in Q5, and it spends words against a 4.4 s per 100 words budget. Write it
> once, for the one figure that carries the project.
> **Placeholders above are illustrative shapes, not values. Every number must be
> lifted from the existing case files or the résumé.**

---

## Q5. AI-writing tells versus honest technical scoping

### Source

Wikipedia:Signs of AI writing, WikiProject AI Cleanup, updated through 2026. I
read the **raw wikitext**, so quotations below are verbatim rather than
paraphrase. `VERIFIED` throughout this subsection unless noted.

**Content tells.**
- *Undue emphasis on significance, legacy, broader trends*: "stands/serves as",
  "is a testament", "crucial/pivotal role", "reflects broader". The guide's own
  image for it: "It is like shouting louder and louder that a portrait shows a
  uniquely important person, while the portrait itself is fading."
- *Superficial analyses*: trailing present participles that add vague
  importance, "highlighting", "underscoring", "ensuring", "contributing to".
- *Promotional language*: "boasts a", "vibrant", "nestled", "groundbreaking",
  "diverse array".
- *Vague attributions*: "Industry reports", "Observers have cited", "Experts
  argue".
- *Avoidance of basic copulatives*: "is a X" replaced by "serves as / marks /
  functions as a X"; a measured drop of more than 10% in is/are usage.

**Vocabulary tells**, era-stratified (see premise 3). Full watch list:
*Additionally* (especially sentence-initial), *align with*, *boasts* (meaning
"has"), *bolstered*, *crucial*, *deep dive*, *delve*, *emphasizing*, *enduring*,
*enhance*, *fostering*, *garner*, *highlight*, *interplay*, *intricate*, *key*,
*landscape*, *meticulous*, *pivotal*, *showcase*, *tapestry*, *testament*,
*underscore*, *valuable*, *vibrant*.

**Negative parallelisms**, three sub-forms, all verbatim:
"Not only ... but ..." and "It is not just ..., it's ..."; "It's not ..., it's
..." and "no ..., no ..., just ..."; and the reversed "Y rather than X", noted
as "particularly common in Grok output". The guide's explanation of *why* these
read as machine-written is the load-bearing sentence for this rewrite: the
output "may seem as though it is clearing up a common misconception, or as
though the audience may be reaching an incomplete or incorrect conclusion about
that subject". That is, **it invents a wrong belief in order to correct it.**

**Rule of three:** "from 'adjective, adjective, adjective' to 'short phrase,
short phrase, and short phrase'. LLMs often use this structure to make
superficial analyses appear more comprehensive." Stronger as a tell "in contexts
where most people would not bother to include such stylistic flourishes."

**Formatting tells.** Title case overuse; excessive boldface; inline-header
vertical lists; "X and Y" headings ("Awards and recognition", "Challenges and
Legacy", "Future Outlook"); headings containing only sub-headings; emoji as
formatting; markdown leakage.

**Em dashes, with the caveats intact.** The claim is narrow: LLMs use them "more
often than nonprofessional human-written text of the same genre", in slots where
humans would use commas, parentheses or colons, "in a formulaic, pat way, often
mimicking 'punched up' sales-like writing", and usually **spaced**, against
typographic convention. "This sign is most useful when taken in combination with
other indicators, not by itself." Then the two 2026 updates quoted in premise 4:
the September 2026 demotion banner, and the Economist study finding **Claude
specifically still overuses them relative to professional writers**.

**Practitioner lists** add three patterns Wikipedia does not cover, because they
are prose-genre rather than encyclopedic: clustered **rhetorical questions**
("declarative statements wearing question marks"), the **"Whether you're X or Y,
there's something for everyone"** closer, and **tricolon obsession**. These are
blog assertions, not studies. `SECONDHAND`, via search snippets only; I did not
fetch tropes.fyi, cherryleaf or the Substack pieces. The **reveal colon** ("The
result:") comes from the brief, not from any source I found; treat it as the
owner's own observation, which is fine, but do not cite it to anyone.

### The separation rule

Wikipedia supplies both halves of this, and neither half is guesswork.

**Signs of *human* writing, section "Syntax"**, empirically more common in human
than AI text, verbatim:
- "Simple is/has phrases, such as *there is a*, *it has a*."
- Plain verbs rather than "complex, stiff or euphemistic synonyms": *wrote* over
  *authored*, *moved* over *relocated*, *used* over *utilized*, *tried* over
  *attempted*, *died* over *passed away*.
- "Superlative or definitive statements, such as *one of the best*, *is the
  only*, *was the first*."
- **"Hedging qualifiers and intensifiers, such as *very*, *perhaps*, *tends
  to*"**, citing Reinhart et al., PNAS 2025, *Do LLMs write like humans?*
- "Isolated wordy constructions such as *as a result of*, *in order to*."

**Section "Ineffective indicators"**, verbatim and directly on point:
- "**Combination of casual and formal registers, or language that sounds both
  'clinical' and 'emotional'** &mdash; This may indicate the casual writing of a
  person in a technical field, such as computer science."
- "**'Fancy', 'academic', or 'formal' prose** &mdash; While LLMs
  disproportionately favor certain words and phrases ... these are *specific
  words*. The correlation does not extend to all formal, academic, or
  'fancy'-sounding prose."
- "**Transition words (in isolation)** ... not a strong tell."
- "**Perfect grammar**" and "**'Bland' or 'robotic' prose**": both ineffective.

**The usable rule.** `INFERRED`, but built on those two verbatim sections.

> A contrast is **honest scoping** when the negated clause names a *specific,
> checkable thing a reader could otherwise have assumed*, and deleting it makes
> the claim **larger than the evidence**.
>
> A contrast is an **AI tell** when the negated clause names a strawman nobody
> asserted, swaps in an abstraction, and deleting it **loses nothing**.

Apply by deletion test:

| Sentence | Delete the negated clause | Verdict |
|---|---|---|
| "the rules stage, not the cascade" | Claim silently grows to the whole cascade. Reader misled. | **Scoping. Keep.** |
| "measured then, committed, not run in this tab" | Implies a live measurement. Reader misled. | **Scoping. Keep.** |
| "honestly not faster than the JDK intrinsic" | Deletes a concession that costs the author. Reader misled. | **Scoping. Keep.** |
| "not just a meme, it's a celebration" | Nothing lost; "celebration" is unfalsifiable. | **Tell. Cut.** |
| "not a mirror but a portal" | Nothing lost. | **Tell. Cut.** |

Three corroborating discriminators, all derivable from the guide:

1. **Concrete versus category.** Scoping negates a concrete noun: a stage, a
   baseline, a tab, an intrinsic. Tells negate a category or an abstraction.
2. **Costly versus flattering.** Scoping shrinks the claim and costs the author
   something. Tells inflate it.
3. **Checkable versus not.** Scoping survives "could a reader verify this?".
   Tells do not.

And the hedges that carry scoping, *roughly*, *tends to*, *honestly*, *not run
in this tab*, sit on Wikipedia's list of **human** syntax. Stripping them moves
the prose toward the machine register, not away from it. A copy editor who
deletes hedges to sound crisper will make the site read *more* generated, not
less. That is the trap to name explicitly in the brief to the copywriter.

> **Implication.** Ship the copywriter two lists: a **cut list** (vocabulary,
> negative parallelisms whose negated half is an abstraction, stacked tricolons,
> reveal colons, rhetorical questions, "whether you're"), and a **protect list**
> (every negation whose deletion would enlarge a claim, plus every true hedge).
> Enforce the protect list with the deletion test, not by eye.

---

## Q6. Résumé placement

**No survey evidence exists.** Report as not converged. What I have:

**NN/g on PDFs**, after 20 years of research: PDFs "should only be used for
documents users will actually print"; never force on-screen reading. Relevant
guidelines include deciding deliberately whether the file opens in a new tab,
the same window, or downloads; building HTML gateway pages that summarise the
content; removing outdated versions and updating every link; and the note that a
PDF icon on results pages "doesn't really help." `VERIFIED`.

NN/g's link-visualisation article covers colour, underline and hover only. It
does **not** address file-type labelling. Gap. `VERIFIED` (checked).

**Observed convention** across the sites I fetched: Brittany Chiang links "View
Full Résumé" to `/resume.pdf` at the foot of the Experience section, not in the
hero or the nav. None of Paco Coursey, Linus Lee, Lynn Fisher, Josh Comeau, Dan
Luu or Bruno Simon surfaces a résumé at all. `VERIFIED`. `INFERRED`: all six are
established names who are not being screened by an agency recruiter, so their
omission does not generalise to a graduating candidate.

> **Implication.** `INFERRED`, and worth Ayush's ruling rather than a
> copywriter's. The generalisable half of the convention is the **verb**: "View
> résumé", not "Download résumé". "View" implies a low-commitment glance;
> "download" implies file management; and NN/g's guidance is to make the
> open-versus-download behaviour a deliberate decision rather than a default.
> Against Chiang's placement: 74% of viewing time lands in the first two
> screenfuls, so a job-seeking new grad should put the link **there**, and again
> in the footer. A second instance costs two words.

---

## Q7. Monospace for running text

**The strongest evidence contradicts the folk claim.** The only eye-tracking
study I found comparing monospaced with proportional fonts (Jarosch,
Schlesewsky, Füssel & Kretzschmar, poster, 20th European Conference on Eye
Movements, Alicante, 2019; N=32, 112 single sentences) found **total reading
time unchanged** at both sentence and word level. What changed was mechanism:
monospacing increased fixation *count* while decreasing mean fixation
*duration*; saccade length grew in pixels but shrank in characters, so "saccade
planning does not wholly compensate the font expansion"; the word-frequency
effect was *larger* under monospacing and the predictability effect *reduced*.
`VERIFIED`.
Limits worth stating in any internal use: conference poster rather than a
journal paper, N=32, isolated sentences rather than continuous prose, one font
pair.

**"Monospace is slower" is typographic authority, not measurement.** Butterick
is the most quotable: *"In standard body text, there are no good reasons to use
monospaced fonts. So don't. Use proportional fonts."* His two legitimate uses
are **tabular figures** (columns of numbers that must align) and **software
code** ("compressed syntax like `(int i=1; i<111; i++)` which is more legible
when set in a monospaced font"). `VERIFIED`.

Butterick's own caveat is the useful one: most proportional fonts already ship
tabular figures, so column alignment is **not** a reason to reach for mono.
`font-variant-numeric: tabular-nums` in a text face aligns the measurement
lines. `INFERRED` from the above.

> **Implication.** Do **not** repeat "mono is slower" as fact; the one
> measurement says reading time is unchanged. The real argument is semantic and
> is already Ayush's standing rule: mono means "this is a machine value".
> A second argument is available but must be tagged `INFERRED`, because it
> extrapolates a single-sentence poster result to continuous prose: the larger
> word-*frequency* effect under monospacing predicts that monospaced running text
> penalises **uncommon words** specifically, which is the worst possible pairing
> for a literary site read by a non-technical screener. Font selection itself is
> `picasso`'s call under CLAUDE.md. This section is evidence only.

---

## Q8. Portfolios that land the role in about ten seconds

I fetched each. First screens as returned.

**Brittany Chiang, brittanychiang.com. The clearest role signal found.**
Name, then "Frontend Engineer", then "I build accessible, pixel-perfect
experiences for the web." Nav is three literal words: About, Experience,
Projects. Résumé at the foot of Experience. Role legible well inside ten
seconds. `VERIFIED`. `INFERRED` caveat: this layout is widely imitated, so it
buys clarity at some cost to distinctiveness, which is the opposite trade from
this site.

**Lynn Fisher, lynnandtonic.com. Distinctive and legible at once.** First
screen: "Lynn Fisher", "Designer for the Web", then About, Work, Thoughts,
Archive, RSS, Gifs, and a version marker "v. XIX" indicating a long-running
redesigned personal site. `VERIFIED`. She is a designer, not an engineer, so she
is a structural model only, not a role model.

**Bruno Simon, bruno-simon.com. The best match to this site's problem.** A fully
interactive 3D drivable world, about as far from a conventional portfolio as a
site gets, and it still opens with a plain role line: **"Creative Developer
(mostly for the web)"**, followed by "This is my portfolio. Please drive around
to learn more about me and discover the many secrets of this world." Links to
Three.js, his course, devlogs and the repo. `VERIFIED`. This is the existence
proof the rewrite needs: **maximum distinctiveness does not require dropping the
role line.**

**Paco Coursey, paco.me. Capability line instead of a title.** "Crafting
interfaces. Building polished software and web experiences." Then current role
(Linear), past (Vercel), then named shipped artifacts as links (⌘K, Writer, Next
Themes). `VERIFIED`. `INFERRED`: legible fast to an engineer, slower to an HR
screener, because no job title appears in the hero and company names carry the
signal instead.

**Counterexamples worth naming.** Josh Comeau (joshwcomeau.com) states no role
at all; identity emerges from "Articles and Tutorials" and "Interactive
Courses". Dan Luu (danluu.com) has no header, no byline and no tagline; the page
opens directly on a reverse-chronological post list. Linus Lee (thesephist.com)
leads with a research-mission sentence, not a title. All three work because the
reader already knows who they are. **None is a safe model for a new grad being
screened by someone who does not.** `VERIFIED`.

**Stale-listicle warning.** Cassie Evans (cassie.codes) is cited in most 2026
"best developer portfolio" roundups for an illustrated desk scene. It is now a
farewell page: no role line, two links (LinkedIn, GSAP Discord). Rauno Freiberg
(rauno.me) is widely listed as an engineer portfolio; his own first line says
"Estonian **interaction designer**". Henry Heffernan (henryheffernan.com)
returns a title and nothing else, because the site is a 3D canvas with no
extractable text, which is also a finding: such a site gives a text-scanning
screener, and a search engine, nothing at all. `VERIFIED`.

**Honest summary:** of these, only Brittany Chiang is a verified
*engineer* portfolio with a fast role signal, and it is not distinctive. Bruno
Simon is the verified proof that distinctiveness and a role line coexist, but he
labels himself a creative developer. I found **no** example that is
simultaneously a software engineer, visually unusual, and fast to classify.
That gap is itself worth reporting: the rewrite is not copying a known pattern,
it is combining two that have only been demonstrated separately.

> **Implication.** Argue from Bruno Simon. Keep the railway conceit entirely and
> put a name and one plain noun phrase in the first fixation zone above it.
> Distinctiveness does not have to be traded away. It has to be *preceded* by
> about four seconds of literal orientation.

---

# Rules to write by

Hand this page to the copywriter as-is.

### Budget
1. Ten seconds, two screenfuls. In that space: the name, "software engineer",
   the finished degree (B.S. CS, Miami University, May 2026), and the résumé
   link.
2. Keep prose above the case-file links near 111 words, the only word count with
   a study behind it, and under 200 in any case. Every extra 100 words buys 4.4
   seconds of attention and gets about 18% read.
3. Home page is the summary; the case file is the depth. Two levels, never
   three.

### Headings carry the page
4. Every stop gets a literal, front-loaded label that summarises its section.
   The codename and the railway metaphor go on a smaller second line. Scanners
   read headings and little else.
5. No heading may be only a codename ("Glyph", "Cadence", "Applied") or only an
   ordinal ("first station"). Both fail the scanner outright.
6. The first two words of every heading, paragraph and bullet carry the meaning.
7. No "X and Y" headings. No title case. No heading containing only
   sub-headings.

### Identity
8. One unambiguous noun phrase in the largest non-name type on the first screen.
   The existing `<title>` string is the obvious starting point.
9. Breadth goes on the next line, as domains actually worked in, phrased as
   nouns. Never as aspirations, never as a list of everything.
10. Job titles match the résumé verbatim.
11. The degree is stated as **finished**, never as a current affiliation. Dates
    come from the résumé or the portfolio, never inferred from git.

### Numbers
12. Raw pair in numerals first; technical name in parentheses second; the
    baseline actually compared against, third.
13. Digits, not words, even at the start of a line.
14. Gloss a term in parentheses on first use, once. Never define it twice.
15. One "why it matters" line per project, not per metric.
16. Every number is lifted from the case files or the résumé. None is invented
    to fit a sentence.

### Voice, cut list
17. Cut: *showcasing, highlighting, emphasizing, enhance, fostering, underscore,
    pivotal, crucial, testament, tapestry, delve, boasts, vibrant, meticulous,
    landscape, intricate, align with, deep dive*, and sentence-initial
    *Additionally*.
18. Cut every "not just X, but Y", "it's not X, it's Y", "Y rather than X" whose
    negated half is an abstraction.
19. Cut stacked tricolons: three adjectives or three parallel phrases used to
    make a thin point look thorough.
20. Cut reveal colons ("The result:"), rhetorical questions, and "whether you're
    X or Y".
21. No spaced em dashes. Use a comma, a parenthesis, or a full stop. This holds
    even though the general tell is being demoted, because the copy is drafted
    with Claude and Claude is the one current model measured as overusing them.
22. No promotional language. It measurably slows readers, who must filter it.
23. Say "is", "has", "wrote", "used", "built". Not "serves as", "functions as",
    "authored", "utilized", "leveraged".

### Voice, protect list
24. **Keep every negation that shrinks a claim.** Deletion test: remove the
    negated clause. If the sentence now claims more than was measured, it is
    scoping, so keep it. If nothing is lost, it is a tell, so cut it. Protected
    by name: "the rules stage, not the cascade"; "measured then, committed, not
    run in this tab"; "honestly not faster than the JDK intrinsic".
25. Keep hedges that are true: *roughly*, *tends to*, *at the time*, *on this
    machine*. They are a documented sign of human writing. Deleting them to
    sound crisper makes the page read more generated, not less.
26. Keep the mixed register. Clinical plus casual is a documented sign of a
    computer-science writer, and an explicitly *ineffective* AI indicator.

### Typography
27. Mono only for machine values: code, paths, flags, hashes, figures read out
    of source. Prose, labels and captions get a text face with `tabular-nums`.
    Do not justify this with "mono is slower"; the one measurement says reading
    time is unchanged.

---

## What I could NOT verify

- **The Ladders 2018 PDF itself.** HTTP 403. The N=30 sample and the heat-map
  detail are secondhand via HR Daily Advisor.
- **Any eye-tracking or time-on-task study of candidate portfolio websites.**
  None found. Q1 is résumé evidence applied by analogy.
- **Recruiter device mix.** All available mobile statistics describe candidates
  applying, not screeners reviewing.
- **The 93 / 73 / 71 / 84 / "50% higher" portfolio statistics.** No primary
  source. I confirmed the 73% attribution is false; the other four are unsourced
  by inference.
- **NACE Job Outlook 2026 full report.** Not fetched; figures come from NACE's
  own summary pages via search.
- **Trudeau 2012 full text.** Read the GDS summary and the SSRN abstract only.
- **Natural-frequency primaries** (BJGP 2012, Cochrane CD006776, the Annals
  systematic review). Navigation shells only; the findings are secondhand. This
  is the weakest citation supporting a recommendation in the report.
- **The practitioner AI-tell lists** (tropes.fyi, cherryleaf, the Substack
  pieces). Search snippets only; not fetched. The **reveal colon** appears in no
  source I found and comes from the brief itself.
- **GOV.UK content-design numerics** (reading age, sentence length). Four URL
  attempts failed or 404'd after a site restructure. ONS and the GDS blog are
  the substitutes. The "sentences under 20 to 25 words" figure circulating for
  GOV.UK is secondhand via council style guides.
- **plainlanguage.gov detail pages.** Gone; the Wayback Machine is blocked from
  this tool.
- **Q3 and Q6 have no evidence base at all.** Both marked not converged. Q6
  (résumé placement) is a product decision worth Ayush's ruling.
