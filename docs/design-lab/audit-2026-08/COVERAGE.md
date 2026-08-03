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
| **Glyph** | 34 cases / 455 assertions | **88.9%** | 82.0% | clang source-based + `llvm-cov` |

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

### Glyph — 88.9%, the highest of the five

```
tools/coverage.sh              # build instrumented, run ctest, report
tools/coverage.sh --floor 60   # and fail below a percentage
```

| file | regions | lines | branches |
|---|---:|---:|---:|
| `src/Matrix.cpp` | 89.8% | **92.4%** | 78.8% |
| `src/NeuralNet.cpp` | 89.8% | **91.9%** | 86.5% |
| `include/fast_mnist/NeuralNet.h` | 100% | 100% | — |
| `include/fast_mnist/Matrix.h` | 72.6% | 69.6% | 77.3% |
| **TOTAL** | **87.5%** | **88.9%** | **82.0%** |

34 Catch2 test cases carrying 455 assertions — which is the number worth
quoting for a property-based suite, since a single rapidcheck case runs many
generated inputs. *(An earlier draft of this file put "72" in Glyph's row. That
is jetpack's surefire count; the two were transposed.)*

Two things about how it is wired, both chosen so the number cannot quietly
become wrong:

- **A separate build directory from the benchmarks.** Instrumentation forces
  `-O0` and adds a counter update on every branch, so a coverage build's timings
  describe a binary nobody ships. Benchmarking one would publish nonsense; the
  configurations are kept apart so neither can become the other by accident.
- **`llvm-cov` is located through `xcrun`, not `PATH`.** On macOS a bare
  `llvm-cov` is usually absent, or a Homebrew build whose version disagrees with
  the compiler that wrote the profile — which fails with an unhelpful format
  error rather than an honest one.

The first run of the script reported *nothing* while the suite passed, because
it looked for test binaries matching `test_*` and the executable is
`fast_mnist_tests`. It now asks `ctest --show-only=json-v1` which binaries it
actually runs. Guessing a filename is precisely how a coverage report ends up
empty behind a green test run.

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

## The two repositories that had no real suite

Coverage is meaningless where there is nothing to measure. Both of these ran a
green check over an empty or near-empty suite, which is worse than no check —
it occupies the slot where evidence would go.

### PolicyBot — 3 tests → 24, and its first CI

The three that existed were all about Slack message formatting. The code that
decides **which policy text answers a question** — term expansion and stemming,
paragraph splitting, title derivation, and the snippet normalisation that grounds
an answer against its source — had none.

The new tests need neither the policy corpus nor an API key, which is the whole
reason that logic stayed untested: the functions that need the corpus are awkward,
and nobody had separated them from the ones that don't.

**Two of the new tests were wrong on first run**, and that is the useful part:
`_expand_terms("Password RESET")` returns more than two terms because both carry
synonyms, and `"access"` stems to `"acces"` because the `-s` rule fires on any
token over three characters. Neither is a bug — an extra term widens a match — so
the tests now assert the real behaviour with the over-stemming recorded in a
comment.

CI runs pytest on 3.10 **and** 3.12, because `pyproject` declares
`requires-python >=3.10` and a project that claims 3.10 while only ever running
on 3.12 breaks for the first person who believes the metadata. It asserts the
suite *ran* — floor of 20 against 24 collected, negative-tested at 99.

No CodeQL or Scorecard here, unlike the other seven: CodeQL on a private repo
needs Advanced Security and Scorecard cannot read what is not public. Either
would be a permanently red check, and those teach people to ignore red checks.

Lint went from 42 findings to zero — but the first fix was to pin the rule set.
Ruff was running on its **defaults**, which widen between releases, so the gate's
strictness was decided by whichever version CI happened to install.

### LifeQuest — `--passWithNoTests` over zero files → 16

16 tests against `packages/schemas`, the API/client contract. Chosen because
schemas break *silently*: a widened enum does not throw, it starts accepting data
the rest of the system assumed it would never see.

The one that matters pins an asymmetry nothing in the source states.
`audienceEnum` carries three values while signup accepts two — `SHARED` describes
a quest visible to everyone and was never a signup choice. The two enums sit fifty
lines apart with no comment between them, so anyone tidying up the apparent
duplication would let users register as `SHARED` with no type error.

**Verified by making exactly that mistake:**

```
audienceSelectionEnum = audienceEnum   →   2 failed | 14 passed
reverted                               →   16 passed
```

The two failures were the two tests written for it; nothing else moved.

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
