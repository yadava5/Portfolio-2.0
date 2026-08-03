# Security scan — eight repositories, 2026-08-02

Tier 3 of the "Earning the numbers" plan. Two instruments, run over every
repository the portfolio cites: `gitleaks 8.30.1` across full git history, and
dependency auditing against the **resolved** dependency set.

Findings are recorded here **after** triage, per the plan's rule: a committed
artifact naming a live weakness in a deployed app is a disclosure, not evidence.
Nothing below is live. Specifics that identify a person are deliberately not
written down here — this repository is public too.

---

## Secret scanning — full history

| repo | commits scanned | findings | real leaks |
|---|---|---|---|
| Applied (jobtracker) | 681 | 3 | **0** |
| Cadence (taskflow-calendar) | — | 0 | 0 |
| Glyph (fast-mnist-nn) | — | 0 | 0 |
| jetpack-compress | — | 0 | 0 |
| AutoML | 2,220 | 16 | **0** |
| PolicyBot | 7 | 0 | 0 |
| LifeQuest | 152 | 0 | 0 |
| VisualAssist | 12 | 0 | 0 |

**19 findings, 0 real leaks.** Both non-zero repos were triaged individually
rather than silenced.

### Applied — 3 findings, all test fixtures

A Fernet key and a JWT secret, both created inside `backend/tests/`, used there,
and discarded. Verified to appear in **zero** files outside the test tree. The
Fernet key trips the generic rule precisely *because* it is a valid Fernet key
format, which no pattern can distinguish from a live one.

Allowlisted **by value** in `.gitleaks.toml`, with the reason recorded. Not by
excluding `backend/tests/` — a real credential pasted into a test is still real —
and not by disabling the rule that found them. Negative-tested: a planted Stripe
key inside `backend/tests/` is still caught while the fixtures are passed.

### AutoML — 16 findings, 0 real leaks

- **3 × `curl-auth-header`** — the literal string `YOUR_API_KEY` in a UI code
  sample. Placeholder.
- **2 × `square-access-token`** — base64 PDF stream bytes inside an `.eml`
  attachment that happen to begin `EAAAA`. The surrounding bytes decode to
  `endstream`. Not a token.
- **11 × `jwt`** — 3 distinct signed session tokens, recorded in
  `.playwright-mcp/console-*.log` because the directory captures raw browser
  console output and the app logs its access token.

A separate exposure involving **third-party personal data** was found in the same
repository while triaging the above. It is not a secret-scanner finding — gitleaks
does not look for this — and it is materially more serious than anything in this
table. It involves people who are not the repository owner, it is unremediated at
the time of writing, and the remedy is the owner's to choose. **It has been
reported to the owner directly and the specifics are deliberately not recorded
here**, because this repository is public and writing down the location would
widen the exposure rather than close it. This paragraph exists so the gap in this
document is visible rather than silent; it will be filled in once remediated.

The JWTs are the only finding that needed real assessment, and it was done by
reading the tokens and the verifier rather than by assuming:

| property | measured |
|---|---|
| TTL | 15 minutes |
| expired | **126 days ago** |
| role | `user` on all three — no admin or service token |
| verifier | `authService.ts:91` uses `jwt.verify()`, which checks `exp` by default |

So none can be replayed and there is nothing to revoke. What remains is that the
claims are readable in a public repository's history; that is a privacy question,
not a credential one, and removing it means rewriting published history — an
owner decision, raised directly and not taken here.

**Fixed forward:** `.playwright-cli/` was gitignored and `.playwright-mcp/` was
not. That gap is the entire mechanism, and it is now closed
(`e936b89e`).

---

## Dependency auditing — and a correction to the method

The first pass used `osv-scanner` against the requirements files and reported
**319 vulnerabilities for Applied**. That number is wrong, and the way it is wrong
is worth recording.

`osv-scanner` resolves a `>=` constraint to its **floor** via deps.dev. Against a
file of security *floors* it therefore reports the worst case the constraint file
permits — not what any resolver would install, and not what is deployed:

| package | osv reported | actually installed |
|---|---|---|
| aiohttp | 3.9.5 (~40 advisories) | 3.13.3 |
| pyjwt | 2.9.0 (8 advisories) | 2.13.0 |
| h11 | 0.9.0 | 0.16.0 |
| protobuf | 4.25.9 | 6.33.5 |
| pygments | 2.9.0 | 2.19.2 |

Re-run with `pip-audit`, which performs a real resolution:

| surface | resolved packages | vulnerable |
|---|---|---|
| **Applied — Vercel deploy** (`requirements.txt`) | 108 | **0** |
| Applied — desktop backend (`backend/requirements.txt`) | 108 | **1** |
| Applied — dev (`backend/requirements-dev.txt`) | 128 | **1** |
| Applied — local ML venv (installed) | 229 | 20 |

The deployed API has **zero** known vulnerabilities. The 20 in the local venv are
mlflow, bentoml, wandb, gradio, pytest, pip and setuptools — an experimentation
environment, none of it shipped.

### The one real finding: `transformers` is capped below its own fix

`backend/requirements.txt` pins `transformers>=4.40,<5`. Three of the four
advisories against it are fixed in 5.0.0 / 5.3.0 / 5.5.0, which the cap forbids;
the fourth has no fixed release at all.

The cap's comment said "pinned for setfit compat", and upstream metadata appears
to contradict that — setfit 1.1.3 declares `transformers>=4.41.0` with **no**
upper bound, and sentence-transformers 5.2.2 allows `<6.0.0`. Metadata permitting
it is not evidence it works, so it was tested. It breaks:

```
ImportError: cannot import name 'default_logdir'
             from 'transformers.training_args'      setfit/training_args.py:13
```

**The cap is load-bearing and stays.** The four advisories are all remote code
execution through model loading from an untrusted repository; this app loads one
model, from a local path it wrote itself, never from a user-supplied repo id.
Unblocking needs a setfit release supporting transformers 5.

### JS dependency findings, by resolved lockfile

`package-lock.json` is a real resolution, so these counts stand as measured.

| repo | vulnerable packages |
|---|---|
| jetpack-compress | **0** |
| Cadence | 29 |
| Glyph (`web/` demo only) | 31 |
| AutoML | 151 across 6 lockfiles |
| LifeQuest | 165, incl. 33 in the Tauri `Cargo.lock` |

### Triaged by reachability — production vs build tooling

The counts above are the whole resolution, dev tooling included, and quoting them
would overstate the exposure by roughly a factor of three. `npm audit --omit=dev`
separates what reaches a browser from what runs on a build machine:

| surface | all | **production only** |
|---|---:|---:|
| Cadence (usecadenceapp) | 22 | **3** — all high |
| Glyph web demo (getglyph) | 7 | **0** ← was 3, now fixed |
| AutoML frontend | 14 | 5 |
| AutoML backend | 19 | 13 |
| AutoML landing | 35 | 20 |
| LifeQuest (getlifequest) | 10 | 9 |
| LifeQuest `legacy/` | 57 | 56, incl. 2 critical |

**Glyph is cleared.** axios (ReDoS), form-data (CRLF injection) and postcss
(arbitrary file read) all resolved inside the ranges `package.json` already
declared — lockfile-only, no major upgrade — and the build passes afterwards.
`npm audit --omit=dev` now reports 0.

**Cadence's 3 are real and were deliberately not forced.** `npm audit fix` is a
no-op on them, and the reason matters:

- `react-router` 7.18.1, vulnerable range 7.12.0–8.2.0 (RSC-mode CSRF bypass).
  The fix is ≥ 8.2.1, and `package.json` declares `react-router-dom: ^7.7.1`, so
  reaching it is a **major** upgrade.
- `undici` 5.28.4, arriving through `@vercel/blob@0.27.3` and `@vercel/node@5.9.3`
  — fixable only by upgrading those.

Forcing a React Router major on a deployed app, without being able to watch its
end-to-end suite pass first, trades a CSRF advisory for an outage. Raised with
the owner instead.

**LifeQuest's 9** are mostly the Fastify ecosystem (`fastify`, `find-my-way`,
`fast-uri`, `fast-json-stringify`) and 5 of them need semver-major moves too.
`legacy/` holds 56 including 2 critical; it is legacy by name and its deployment
status should be confirmed before anyone spends effort there.

---

## What this changed in the code

| repo | commit | change |
|---|---|---|
| Applied | `243fa12` | `.gitleaks.toml`, allowlisting two fixtures by value, negative-tested |
| Applied | `8d040b8` | classifier benchmark can no longer pass with its models off |
| AutoML | `e936b89e` | ignore `.playwright-mcp/` |

All on feature branches, none pushed. Until they are, none of it is live.

## Environment note, so the green results are readable

Applied's `305 passed` and the `answered by: setfit=20` cascade measurement were
both taken **after** the venv had drifted from the snapshot recorded before the
transformers 5 experiment. Three packages came in with transformers 5.14.1 and
did not come back out when it was reverted:

```
click        8.3.1  → 8.4.2      (which also fixes PYSEC-2026-2132)
hf-xet       1.2.0  → 1.5.2
safetensors  0.7.0  → 0.8.0
```

`transformers` itself is back at 4.57.6 and setfit imports. None of the three is
implicated in the results, and click moved in the safe direction — but the runs
were not made in the environment the snapshot describes, and saying "verified"
without saying that would overstate it.
