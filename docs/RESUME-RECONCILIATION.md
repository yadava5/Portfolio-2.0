# The résumé and the site, reconciled — 2026-07-30

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

Also fixed: three retired product names still reaching readers —
`"taskflow case file"` and `"fast-mnist case file"` in `/evidence` link text
(`proofManifest.ts:184,206`), and Glyph's `imageAlt` still reading
`"Real Fast MNIST React workbench screenshot"` (`projects.ts:370`), which is
what screen-reader users heard.

---

## 1 · Two things I want you to look at first

### 1a · Glyph's teammate is uncredited on the site

Your résumé says Glyph was a **2-person team** and that you hand-wrote the SIMD
kernels **"with a teammate"**. The site credits **no collaborator anywhere** for
Glyph — no team size, no second name. It reads as solo.

On a site whose entire thesis is that every claim terminates in an openable
artifact, under-crediting a person is the one kind of inaccuracy that costs
more than a wrong number. This is the top item on the list for that reason.

(AutoML is the mirror image and already handled correctly — the site says
"my slice below" and the résumé says "2-person team".)

### 1b · Cadence's RLS: the résumé claims what the site says is switched off

- **Résumé:** "**Enforced** multi-tenant isolation across 7 tables with
  PostgreSQL row-level security…"
- **Site:** RLS is "left … **deliberately switched off until a staged
  cutover**" — `projectCaseStudies.ts:1378`

The site is being careful and the résumé is not. Read side by side by anyone
who clicks through, the résumé over-claims. **Recommend changing the résumé**
to match the site's wording (owner-scoped checks in the service layer, proven
by the IDOR suite), not the other way round.

Note also the two 7s are different things: the résumé's "7 tables", the site's
"**7 IDOR-vulnerable endpoints**" found and fixed (`:1515`). Don't let them
read as the same fact.

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
