# Coverage — measured, 2026-08-03

Tier 2 of the "Earning the numbers" plan. The portfolio could say how many tests
each project has; it could not say whether those tests reach the code. A count
and a coverage figure answer different questions, and only one of them is
evidence that a suite would catch a bug.

Every figure below was produced by running the suite, and the command is recorded
beside it.

---

## The headline numbers, and why the headline is the wrong number

| project | tests | line | branch | instrument |
|---|---:|---:|---:|---|
| **Applied** (backend) | 305 | **54%** | — | `pytest --cov=jobtracker` |
| **Cadence** (backend) | 544 | **67.1%** | 75.7% | `vitest --coverage` (v8) |
| Cadence (frontend) | 635 | 18.0% | 67.1% | `vitest --coverage` (v8) |
| **jetpack** | 72 | **68.1%** | 55.9% | JaCoCo 0.8.13 |
| **AutoML** | 1,550 | **67.4%** | — | measured during the provenance audit |
| Glyph | 72 | not measured | — | see below |

Three of these blend a well-tested core with untested peripheral code, and the
blend is the least informative way to state them.

### Applied — 54% overall, 61% excluding one-off scripts

```
pytest tests --cov=jobtracker --cov-report=term-missing
```

| package | line | statements |
|---|---:|---:|
| `jobtracker/` (root) | 89% | 350 |
| **`jobtracker/cloud`** | **82%** | 1,137 |
| `jobtracker/auth` | 81% | 77 |
| `jobtracker/database` | 77% | 359 |
| `jobtracker/credentials` | 68% | 287 |
| `jobtracker/tracking` | 66% | 608 |
| `jobtracker/classifier` | 56% | 820 |
| `jobtracker/api` | 45% | 1,195 |
| `jobtracker/email_clients` | 40% | 770 |
| `jobtracker/services` | 37% | 367 |
| `jobtracker/scripts` | 35% | 2,163 |

`jobtracker/cloud` is the code that is actually deployed to Vercel, and it is the
best-covered package at 82%. `auth` and `database` — the two that carry the
isolation guarantees — are at 81% and 77%. That ordering is the useful fact here:
the coverage is concentrated where a failure would matter, not spread evenly to
flatter an average.

What drags the blend down is `jobtracker/scripts` at 35% over 2,163 statements —
one-off importers, dataset ingestion and mock-data generators, several at 0%.
Excluding it gives **61%**.

### jetpack — 68.1% overall, 98.9% on the kernels

```
mvn verify -DskipITs   →   target/site/jacoco/jacoco.xml
```

| package | line |
|---|---:|
| **`com/ayush/jetpack/vector`** | **98.9%** |
| `com/ayush/jetpack/core` | 87.3% |
| `com/ayush/jetpack/io` | 84.2% |
| `com/ayush/jetpack/cli` | 0.0% |

The SIMD vector package is the reason the project exists and it is at 98.9%. The
0% is an argument-parsing CLI wrapper. "68% covered" and "the hot path is at 99%
and the CLI shim is untested" describe the same measurement and imply very
different amounts of work.

### Cadence — the frontend figure is not a defect

18.0% lines against **67.1% branches** is the signature of a codebase whose logic
is unit-tested thoroughly while the components around it are exercised somewhere
else — here, the Playwright end-to-end suite, which a v8 coverage pass over a
vitest run cannot observe.

No line-coverage gate was added for that surface. A gate there would push effort
toward shallow component tests that raise the number and find nothing, which is
the standard way coverage targets make a codebase worse.

### Glyph — not measured, and why

C++ coverage needs a dedicated instrumented build (`-fprofile-instr-generate
-fcoverage-mapping`) and an `llvm-cov` pass, which is a separate build
configuration from the three the benchmark harness already manages. It is
tractable and it is not done. Recording that plainly rather than leaving a blank
row that reads as an oversight.

---

## What is now enforced, and what is deliberately not

**jetpack gates at 55%**, below the measured 68.1%. Pinning a gate *at* the
current number turns every honest refactor red, and a gate that cries wolf gets
deleted rather than fixed. What the floor guards is a **collapse** — coverage
tooling detaching and silently reporting near-zero — not a two-point drift. The
step also fails outright if JaCoCo recorded no lines at all, which is the precise
failure mode the argLine trap below produces.

Negative-tested by raising the floor to 95%: fails, exit 1.

**No gate on the others yet.** AutoML's documented 97% was measured at 67.4%
during the provenance audit, so a floor there needs the claim reconciled first,
not a number frozen on top of a disagreement.

### The argLine trap, recorded because it fails silently

JaCoCo attaches its agent by setting a property surefire reads as `argLine`.
jetpack's surefire `argLine` was already carrying
`--add-modules=jdk.incubator.vector`, and the common fix —
`<argLine>${argLine} ${incubator.vector.arg}</argLine>` — breaks every build that
does *not* run `jacoco:prepare-agent`, because `${argLine}` is then unset and the
literal string reaches the JVM.

The working shape: JaCoCo writes to its own property, declared empty in
`<properties>`, and surefire concatenates it with `@{...}` **late** replacement.
With `${...}` the expansion happens at POM load, before JaCoCo has run, and the
agent never attaches — producing a 0% report that reads like a testing failure
rather than a configuration one.

Both paths were executed rather than reasoned about:

```
mvn test                  agent inactive, property empty   → passes
mvn verify -DskipITs      agent attaches, jacoco.xml written → passes
```

---

## Commands, for re-running

```sh
# Applied
cd jobtracker/backend && pytest tests --cov=jobtracker --cov-report=term-missing

# Cadence
cd taskflow-calendar-main && npm run test:backend:coverage
                             npx vitest run --config vitest.config.ts --coverage

# jetpack
cd jetpack-compress && JAVA_HOME=/opt/homebrew/opt/openjdk@25 mvn verify -DskipITs
```

`@vitest/coverage-v8` was missing from Cadence entirely — `test:backend:coverage`
had been in `package.json` for some time and failed on invocation with
`MISSING DEPENDENCY`. A script that cannot run is worse than no script, because
its presence implies the number exists.
