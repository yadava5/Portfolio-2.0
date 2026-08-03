# The résumé and the site, reconciled — 2026-07-30

> **SUPERSEDED 2026-08-02 for the project figures.** This pass reconciled the
> résumé against *what the site said*. The provenance audit reconciled the site
> against *what the code does*, by running it — so where the two disagree, the
> newer file wins: **`docs/design-lab/audit-2026-08/RESUME-CHANGES.md`**.
>
> Three of this document's verdicts are now out of date, and the reason is the
> same in each case: they compared two surfaces without asking whether either
> was right.
>
> - **jetpack.** This pass treated the résumé's `6.5× / 455 vs 66 MB/s / 2.9×`
>   as a rounding difference. It is not — it is the **quick** 1-fork benchmark
>   where every other surface quotes the **rigorous** 3-fork run, and 455/66 is
>   6.89, so the résumé's own two numbers do not agree with each other.
> - **Glyph's instruction sets.** Recorded here as a wording choice. The source
>   settles it: three hand-written guards, no wasm branch. The site said four in
>   six places including its meta description; that is fixed.
> - **The job title.** This pass had the site and résumé disagreeing without a
>   resolution. The owner confirmed it on 2026-08-02 — *ITSM Data Integration
>   Student Associate*, an internship — and the **site** was the wrong one: the
>   run flattened a two-field fact into the weaker word. Fixed.
>
> What this document still gets right and the newer one leans on: the method,
> and §0's finding that a served PDF can silently stop being the real one.

Source of truth for this pass: `~/Documents/Resume (July 2026)/Final Resume (latest)/Ayush Yadav Resume.pdf`,
sha1 `0d1ec51b…`, 1 page, LibreOffice, dated 2026-07-30.

Every site-side claim below cites `file:line`. Nothing in §2 or §3 has been
changed — those need your decision, not mine.

---

## 0 · What was already fixed (shipped in this branch)

**The served résumé was not your résumé.** `/resume.pdf` was serving a
document from **16 July** — sha1 `3b502109`, 133 KB, Chromium-rendered — that
disagreed with the site on the things that matter most:

| | the PDF being served | the site everywhere |
|---|---|---|
| email | **yadava5@miamioh.edu** | aesh.03.23@gmail.com |
| GPA line | "GPA: 3.47 Overall \| 3.65 CS Coursework" | 3.65 major only |
| projects | Agentic AutoML · **JobTracker (macOS)** · **Visual Assist** · **Fast MNIST** | Applied · Glyph · Cadence · jetpack · LifeQuest |

A recruiter who read the page and one who downloaded the résumé were being
given **different email addresses to reply to**.

The gate meant to catch that (`check-resume.mjs`, the green "📄 Resume Parser
Check" on PR #30) did not merely miss it — it **required** the stale file. Its
required list demanded `"3.47 overall GPA"`, `"Fast MNIST"`, `"Visual Assist"`;
its forbidden list contained `"Major GPA"`. Your real résumé says **"Major GPA
3.65"** and contains no "3.47", so the only document that could pass was the
wrong one.

Fixed: the real PDF is served; the checker now cross-checks email, LinkedIn,
GitHub and graduation **against `personal.ts`** so PDF-vs-site drift is
structurally impossible rather than merely noticed; `resume:build` refuses to
run so it can't overwrite the correction. Verified both ways — the checker
passes on the new PDF and **fails on the old one**, naming the email as the
reason.

Also fixed: three retired product names — `"taskflow case file"` and
`"fast-mnist case file"` in `/evidence` link text (`proofManifest.ts:184,206`,
both verified live as `cadence` and `glyph` after deploy), and Glyph's
`imageAlt`, which still read `"Real Fast MNIST React workbench screenshot"`
(`projects.ts:370`).

> **Erratum, same day, against my own commit message and PR.** I wrote that
> the Glyph `imageAlt` "was what screen-reader users heard". **It was not.**
> `imageAlt` is read by `ProjectScene.tsx:145,155,165`, which is the
> **fallback arm** — it renders only for a project with no drawn scene in
> `PROJECT_SCENE_MANIFEST`. Glyph has one, and that scene supplies its own
> alt. Measured after deploy: grepping `out/` for the string returns **0
> files**, as it does for Applied's and Cadence's, while Visual Assist's —
> which has no drawn scene — appears in **4**. The retired name was
> **dormant, not spoken**. The fix stands (a latent falsehood surfaces the
> moment a scene is removed) but the severity I stated was wrong, and I
> should have checked the build before stating it.

---

## 1 · Two things I want you to look at first

### 1a · Glyph's teammate was uncredited — **FIXED**

Your résumé says Glyph was a **2-person team** and that you hand-wrote the SIMD
kernels **"with a teammate"**. The site credited **no collaborator anywhere** —
no team size, no second name. It read as solo. On a site whose thesis is that
every claim terminates in an openable artifact, under-crediting a person is the
one inaccuracy that costs more than a wrong number.

**Now fixed, and on AutoML too.** **Shree Chaturvedi** is named on both, in a
new `collaborator` ledger row that sits above `timeframe` — a person is not a
footnote to a date — with his LinkedIn so the credit terminates somewhere
openable, and a `scope` so it says what he did rather than that he existed
("the SIMD kernels, written together" / "capstone teammate").

AutoML was **not** the mirror image I first called it. "My slice below"
discloses that a team existed without crediting anyone, which is a thinner
thing than it looks: a reader learns there was someone else and cannot learn
who. Both files now name him.

Two notes on how it was done:

- The credit is a **field**, not more prose in `role`, because the meta ledger
  lowercases that value twice (`.label-mono` sets `text-transform: lowercase`
  and the row calls `.toLowerCase()`). Appending the name would have published
  "shree chaturvedi". The row uses the same `normal-case` escape hatch the repo
  pin already uses for case-sensitive data.
- His email is public on the capstone's landing page and is **deliberately not
  republished here**. LinkedIn does what a credit link needs to do; putting
  someone else's address on a third site is a favour nobody asked for. Say the
  word if you want it added.

### 1b · Cadence's RLS — I had this backwards, and the correction is in your favour

**What I wrote here first:** that the résumé over-claims and the site is being
careful. That was **one word right and three statements wrong.**

An investigation against the actual repository and its CI logs found that
**the portfolio was the document making false statements** — and all three
were *under*-claims. The case file said the 11 isolation tests "do not run in
ordinary CI", that they "are not in CI", and that "the repo's own CI is red on
main right now."

Verified directly, not from prose. The workflow at `cadence @ 54c79e0` — the
commit the case file pins — provisions a `postgres:16` service and sets
`RLS_TEST_PG_ADMIN_URL`, so the skip guard never fires. Run `30133037462`
records:

```
✓ lib/__tests__/rls.postgres.test.ts (11 tests) 232ms      2026-07-24T23:11:13Z
```

and every main-branch run since **2026-07-23** is green, including the pin.
The suite is genuine database-level proof — it builds its own
`NOSUPERUSER NOBYPASSRLS` role, applies the real migration, and asserts a raw
unfiltered `SELECT` as one user returns only that user's rows.

**Likely origin, worth knowing because it will recur:** the identical caveat is
*true* of Applied, whose backend workflow really does provision no database. It
appears to have been copied to a repo whose CI had since gained one. **A caveat
goes stale exactly like a boast** — and nobody re-checks the sentences that
make them look worse.

**Fixed on the site.** All three retracted, with an erratum.

**What was actually wrong on the résumé: one word.** "**Enforced**" — the
migration is written, committed, `FORCE`d on 7 tables with 22 policies, and
CI-proven, but nothing applies it and production still connects as the owner
role. Suggested replacement, which loses almost nothing:

> "**Built** DB-enforced multi-tenant isolation for **7 tables** — 22 PostgreSQL
> row-level-security policies with `FORCE`, a non-`BYPASSRLS` app role, and
> per-request transaction-local GUC identity — plus owner-scoped checks on
> **6 services**; **proven by an 11-test isolation and IDOR suite running in CI
> against ephemeral Postgres**, with production cutover staged."

The strongest clause in your current résumé line — the CI one — is the part
that was already true and that the site was disowning.

**Making it actually true is small.** The code is done; what remains is
operational — apply `0001`, then `0003` with a real password, confirm the GUC
wiring is live (it is), apply `0002`, repoint `DATABASE_URL` at `cadence_app`.
The rollback role is already written and commented out. It's a demo deployment
with mock login, so there are no production users to break. Worth a separate
thread.

**One more thing found:** the two 7s were real and independent — 7 tenant
tables, and 7 IDOR endpoints found and fixed. But the endpoint count is now
**stale**: commit `75180a3` fixed an eighth of the same class, and its own
message says so. Absorbing that makes the number bigger *and* dissolves the
coincidence. That commit also contains the best line in the codebase, which
belongs on the site: *"a test can pin a vulnerability in place and report green
forever"* — the pre-existing test asserted the vulnerable query.

---

## 2 · Where the résumé and the site state different values

The site pins its numbers to committed artifacts, so in most of these **the
résumé is more likely the thing to change**. Your call on each.

| # | résumé | site (`file:line`) | note |
|---|---|---|---|
| 1 | Adler-32 **2.9×** scalar, **4.38 GB/s** | "~**2.8×** vs scalar" `projects.ts:439,465` | Which is the committed benchmark? The site also adds an honesty line the résumé omits — "does **not** beat the JDK intrinsic". |
| 2 | **455 vs 66 MB/s**, conservative **99% CI bound; JMH** | "~6.5× … **±50% on the quick benchmark**" `projects.ts:439,464` | The multiplier agrees. But the **résumé claims a stronger method than the site does.** If the 99% CI JMH run exists, the site is *under*-claiming and should be upgraded to cite it. |
| 3 | Cadence **2024–2026** | **2023-09 → 2025-05** `projects.ts:322-323`, printed in the case file's meta ledger `projectCaseStudies.ts:1359` | Both endpoints differ. One of these is wrong. |
| 4 | AutoML role **"Backend Developer"** | **"Capstone engineer — my slice below"** `projectCaseStudies.ts:790` | Also: site `endDate: "Present"` vs résumé 2026. |
| 5 | ITSM **"Intern"** | **"Student Associate"** `experience.ts:51`, `personal.ts:87` | Low stakes, but they're different job titles on the same job. |
| 6 | "**Five** live, open source projects" | "the **six** live showcase projects" `StoryShell.tsx:230` | Delta is exactly **LifeQuest** — you file it under Awards, the site counts it as a project. Also "open source" is imprecise: the site marks **AutoML private** (`projects.ts:209,237`), and that's one of your five. |

---

## 3 · Real, verifiable facts on your résumé that the site does not mention

You said the portfolio should be **bigger** than the projects — this is the
material for that. Every line here is something you've done that the site is
currently silent about.

**The entire third ITSM bullet is missing.** No Laravel, no TeamDynamix, no
GitLab, no End-of-Life API, no 37-month dashboard, and no **"code compliance
from 0% to 97% across 61 projects"** anywhere in the repo. The site's third
ITSM achievement is a Slack + OpenAI RAG chatbot instead (`experience.ts:79`).
A 0→97% compliance turnaround is one of the strongest numbers you have and it
isn't on the site at all.

**The ITSM pipeline is rounded down to nothing.** Résumé: 1.6M+ OAS query logs,
**5 years**, **1,153 users**, **66 dashboards**, a **57.8M-row** field usage
table, for an OAS→Tableau migration. Site: "1 million raw records" /
"1M+ operational records" (`experience.ts:60,77`). Five specific figures
collapsed into one rounded one.

**Awards and credentials — entirely absent:**
- **Certificates (2026)**: Azure AI Essentials · Snowflake Data Engineering ·
  Data Analysis & GitHub (Microsoft). Not one appears on the site.
- **Finalist, MUCAT Design Innovation (Feb 2025)** — LiDAR visual assistance
  proposal, **$2,500 prototyping grant**. No "MUCAT", no "$2,500" anywhere.
- **Social Innovation Weekend (Mar 2025)** — LifeQuest, **7-person team**. The
  site has LifeQuest as a project but records no award, no date and no team.

**Per-project specifics the site omits:**

| project | on the résumé, missing from the site |
|---|---|
| Applied | **201 regex rules** · model **90 → 23 MB** · **transformers.js** (appears nowhere in the repo) · the CI floor's actual value, **0.95** |
| jetpack | "bounded in-flight window" · 455/66 MB/s · 4.38 GB/s · **matches java.util.zip.Adler32 bit-for-bit** |
| Glyph | the **2-person team** (§1a) |
| AutoML | sandbox specifics — **non-root, read-only filesystem, capped CPU and memory**. The site says only "sandbox constraints" `projectCaseStudies.ts:984` |
| Cadence | **4-stage** NLP parser (only chrono + compromise named; hashtag and priority missing) · **36 routes in one serverless function to fit Vercel's 12-function cap** · **6 services** owner-scoped |
| Education | **Deep Learning** coursework listed on the résumé, absent from `personal.ts:122-132` |

**Skills the résumé lists that `skills.ts` does not:** PyTorch,
scikit-learn, XGBoost, LightGBM, SHAP, Optuna, transformers.js, pgvector,
DuckDB, Polars, FastAPI, Hugging Face Spaces.

**And the reverse** — `skills.ts` carries Swift/SwiftUI/ARKit/Core ML/Vision,
Prisma, Framer Motion, GSAP, Tauri, Kubernetes, which the résumé has dropped.

---

## 4 · One thing worth your eye

`projects.ts:199,235` and `manifest.ts:126` state AutoML's default model as
**"GPT-5.4"**. Not on the résumé, and an unusual version string — worth
confirming it's what the repo actually configures.

---

## 5 · Verified clean

Email (`aesh.03.23@gmail.com`), LinkedIn, GitHub, location, graduation
(May 2026), major GPA 3.65, Dean's List terms, Miami University / Oxford OH,
the ITSM date range, the 10,453-row × 35-field master inventory, Applied's
0.9791 macro-F1 across 8 labels and its int8 ONNX at 22.8 MB, jetpack's 6.5×
and 72 tests and FFM I/O, Glyph's 97.01% on 10,000 images and its four SIMD
instruction sets, AutoML's LangGraph + MCP + human-approval-gate architecture,
Cadence's Google Meet parsing and IDOR suite.

Two notes on things that look wrong and aren't:

- **Route slugs** (`jobtracker`, `taskflow-calendar`, `fast-mnist-nn`, …) are
  pinned identifiers, not stale names. Every receipt anchor is built from them
  and the repo pins reference them. They stay.
- **`projects.ts:352,380,385` still say Glyph is "~97% HELD".** Those fields
  have **zero render consumers** — grep across `src/components` and `src/app`
  returns nothing — so no reader sees them. Dead data, not a live falsehood.
