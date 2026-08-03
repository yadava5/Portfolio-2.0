# The résumé — what needs changing, and why

**You asked me not to touch `public/resume.pdf`, so I have not.** This is the
list, ordered by how much it costs you if a reader checks.

Everything below is the résumé disagreeing with the site, and in every case
**the site is now the correct one** — its figures were re-derived on 2026-08-02
by running the code, and are recorded in `CLAIM-REGISTER.md` with the commands.

---

## 1 · jetpack — you are quoting the wrong benchmark run, and it disagrees with itself

The repository commits **two** JMH runs. The résumé quotes the *quick* one
(1 fork); every other surface quotes the *rigorous* one (3 forks, 99.9% CI).

| résumé says | should say | measured |
|---|---|---|
| `6.5x the throughput of single-threaded java.util.zip` | **6.4×** | 422.0 / 66.2 = 6.378 |
| `455 vs 66 MB/s` | **422 vs 66 MB/s** | rigorous run |
| `conservative 99% CI bound` | **3-fork JMH, 99.9% CI** | the JSON records its own settings |
| `2.9x scalar (4.38 GB/s)` | **2.8× scalar (4.26 GB/s)** | 4256.6 / 1518.2 = 2.804 |

**It is also internally inconsistent as written:** `455 / 66 = 6.89`, not the
`6.5` on the same line. A reader who divides your own two numbers gets a third
number.

**The sharpest one.** `scripts/run/build-home.mjs` carries a forbid list that
**fails the build** if the string `2.9× scalar` appears in the home page, with
this reason recorded beside it:

> *"A rounded-up number is a small error; silently losing the sentence that
> calibrates it is the kind this site exists to prevent."*

The calibrating sentence is that the JDK's own intrinsic runs at **14.06 GB/s** —
faster than your hand-vectorised 4.26. The site says so out loud. The résumé
prints the 2.9× without it. Your own build refuses to ship what the PDF ships.

**Suggested line:**
> *…reaching 6.4× the throughput of single-threaded `java.util.zip` (422 vs
> 66 MB/s, 3-fork JMH, 99.9% CI). Hand-vectorised Adler-32 with the Vector API
> at 2.8× scalar (4.26 GB/s) — honestly slower than the JDK intrinsic at
> 14.06 GB/s.*

That last clause is the strongest sentence available to you here. Almost nobody
writes down the benchmark they lost.

---

## 2 · Glyph — "4 instruction sets" is three

The résumé says `Hand-wrote SIMD kernels across 4 instruction sets (AVX-512,
AVX2, NEON, wasm-simd128)`.

The source guards exactly three — `__AVX512F__`, `__AVX2__`, `__ARM_NEON` —
over a scalar fallback. There is **no `__wasm_simd128__` branch anywhere**; the
wasm target passes `-msimd128` and lets Emscripten auto-vectorise the scalar
path. That is a compiler flag, not a hand-written kernel.

I corrected this on the site today; it had leaked into the Glyph case file's
meta description, `og:`, `twitter:` and two JSON-LD nodes.

**Suggested:** *Hand-wrote SIMD kernels across 3 instruction sets (AVX-512,
AVX2, NEON) over a scalar fallback; the wasm build compiles `-msimd128`.*

---

## 3 · Glyph accuracy — you can strengthen this one

The résumé says `97.01%`, which is right. What it does not say is that the
number **reproduces**: I rebuilt the evaluator from source today and the
regenerated report was **byte-identical** to the committed one — 9,701 of
10,000, macro-F1 0.9698, same model sha256.

I also fixed the upstream repo so anyone can do that (`cmake --build build
--target fast_mnist_eval` — the target did not exist until today).

**Worth adding:** *…97.01% on the 10,000-image MNIST test set, from a committed
eval run that regenerates byte-for-byte.*

---

## 4 · Cadence — three separate corrections

**a) Test count.** Not on the résumé, but if you add one: it is **1,168**
(635 frontend + 533 backend, 11 skipped), measured 2026-08-02 at `932625e`. The
old 1,145 is from July at `69a59e7`.

**b) Dates.** The résumé heads it `2024 – 2026`. The site says `2023-09 to
2025-05` and the case file is `filed: 2023-09`. **Both ends disagree.** One of
the two is wrong and I cannot tell which from here — you know when you started.

**c) RLS — this is the one I would fix first.** Side by side:

> résumé — *"**Built** multi-tenant isolation across 7 tables with PostgreSQL
> row-level security…"*
>
> site — *"rls written for **7 tables, staged off** · owner-scoped checks on 6
> services · idor suite in ci"*

RLS is written and **not enabled**; what enforces isolation today is the
owner-scoped check in the handlers. "Built … with row-level security" reads as
*it is on*. An interviewer who opens the repo finds the migration inert.

**Suggested:** *Wrote row-level security for 7 tables (staged, not yet enabled)
and enforced owner-scoped access across 6 services, proven by an isolation and
IDOR suite in CI against ephemeral Postgres.*

That is still a strong line, and it survives the repo being read.

---

## 5 · Job title — RESOLVED, and the résumé is the one that is short

You confirmed it: **ITSM Data Integration Student Associate**, and it was an
internship. Both words are true and they are two different facts — the title,
and the employment type.

`experience.ts` already had both, correctly and separately:

```ts
title: "ITSM Data Integration Student Associate",
type:  "internship",
```

The **run** was flattening them to "intern", which threw away the official
title. Fixed on 2026-08-02 — it now reads *itsm data integration student
associate — miami university · internship · jun 2025 – may 2026*.

**The résumé keeps only the other half.** `ITSM Data Integration Intern` is not
wrong, but it is not the title an employment verification returns, and it is the
weaker of the two — "Student Associate" reads as a standing role, "Intern" reads
as a summer.

**Suggested:** *ITSM Data Integration Student Associate (Intern) · Miami
University · Jun 2025 – May 2026*

This is the only item on this page where the site was wrong rather than the
résumé, and the site is fixed.

---

## 6 · Smaller, and defensible either way

- **`0.979` vs `0.9791`** — a truncation, and the résumé correctly scopes it to
  *the rules stage*, which is the load-bearing qualifier. Fine as is.
- **`23 MB` vs `22.8 MB`** — the run rounds to 23 too. Fine.
- **In-browser inference** — the résumé says the int8 ONNX build is deployed in
  the browser. True of the desktop/in-browser build; the **hosted** app at
  `getapplied.vercel.app` runs the rules layer alone, because the model stack
  does not fit a serverless function. The site states that limit. Worth a
  half-clause so the two don't read differently.
- **"Five live, open source projects"** — internally consistent (the PROJECTS
  section lists exactly five). The site says "six projects" because it counts
  LifeQuest, and "case file N of 7" because jetpack has no case file. Nothing to
  fix; just know they count different things if anyone asks.
- **Coursework** — the résumé matches the run **verbatim**. But
  `personal.ts:122-131` carries a completely different list (`CSE 385`, `CSE
  432`, `CSE 443`, `CSE 484`, `MTH 252/222/231`, `STA 301/363`) with no "Data
  Structures & Algorithms" and no "Deep Learning". That file feeds nothing
  visible, so it is not a live defect — but one of the two lists is wrong.
- **Phone number** — `(513) 461-4375` appears nowhere in the site. Expected;
  noting it only so you know it is unchecked by anything.

---

## What I did not touch

The PDF itself, and `scripts/resume/render-resume.mjs` — which is retired
anyway (it hard-refuses without `RESUME_RENDER_OK=1`, and its own header says
its literals are stale). `resume:check` still passes, but note what it checks:
email, LinkedIn, GitHub and graduation cross-read from `personal.ts`, plus
structural invariants. Its docstring says so plainly — *"Nothing here asserts a
specific project, employer or number."* **Every item on this page is outside
that gate by design**, which is why it took a manual audit to find them.
